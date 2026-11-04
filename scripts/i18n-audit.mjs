import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', '.test-build', 'i18n', 'tests', 'scripts']);
const allowed = new Set(JSON.parse(readFileSync(join(ROOT, 'scripts/i18n-audit-allow.json'), 'utf8')).map((entry) => `${entry.file}\n${entry.text}`));
const METHODS = new Set(['setName', 'setDesc', 'setPlaceholder', 'setButtonText', 'setTooltip', 'setTitle', 'setText', 'setHeading', 'appendText', 'addOption', 'addRibbonIcon']);

function files(dir) {
    const result = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) { if (!SKIP_DIRS.has(name)) result.push(...files(full)); }
        else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) result.push(relative(ROOT, full).replaceAll('\\', '/'));
    }
    return result;
}
function literals(node) {
    if (!node) return [];
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [{ node, text: node.text }];
    if (ts.isTemplateExpression(node)) return [{ node, text: node.head.text + node.templateSpans.map((span) => '${…}' + span.literal.text).join('') }];
    if (ts.isConditionalExpression(node)) return [...literals(node.whenTrue), ...literals(node.whenFalse)];
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return literals(node.expression);
    return [];
}
function audit(file) {
    const source = ts.createSourceFile(file, readFileSync(join(ROOT, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const found = [];
    const report = (nodes) => nodes.forEach(({ node, text }) => {
        if (/[A-Za-z]{2,}/.test(text) && !allowed.has(`${file}\n${text}`)) {
            const p = source.getLineAndCharacterOfPosition(node.getStart(source));
            found.push({ file, line: p.line + 1, column: p.character + 1, text });
        }
    });
    const visit = (node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
            const method = node.expression.name.text;
            if (METHODS.has(method)) report(literals(node.arguments[method === 'addOption' || method === 'addRibbonIcon' ? 1 : 0]));
            if (method === 'createEl' || method === 'createDiv' || method === 'createSpan') {
                const options = node.arguments[1] ?? node.arguments[0];
                if (options && ts.isObjectLiteralExpression(options)) for (const prop of options.properties) {
                    if (ts.isPropertyAssignment(prop) && ['text', 'title', 'placeholder'].includes(prop.name.getText(source))) report(literals(prop.initializer));
                }
            }
        }
        if (ts.isNewExpression(node) && node.expression.getText(source) === 'Notice') report(literals(node.arguments?.[0]));
        ts.forEachChild(node, visit);
    };
    visit(source);
    return found;
}
const requested = new Set(process.argv.slice(2).filter((arg) => !arg.startsWith('--')));
const candidates = files(ROOT).filter((file) => requested.size === 0 || requested.has(file));
const findings = candidates.flatMap(audit);
if (process.argv.includes('--summary')) {
    const counts = new Map();
    for (const item of findings) counts.set(item.file, (counts.get(item.file) ?? 0) + 1);
    for (const [file, count] of counts) console.log(`${String(count).padStart(5)}  ${file}`);
    console.log(`${String(findings.length).padStart(5)}  TOTAL`);
} else {
    for (const item of findings) console.log(`${item.file}:${item.line}:${item.column}  ${JSON.stringify(item.text)}`);
    console.log(`${findings.length} untranslated UI string(s)`);
    if (findings.length) process.exitCode = 1;
}
