import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', '.git', '.test-build', 'i18n', 'tests', 'scripts']);
const zhPatterns = JSON.parse(readFileSync('/tmp/zh-tpl.json', 'utf8'));

function files(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            if (!SKIP.has(name)) out.push(...files(full));
        } else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) out.push(relative(ROOT, full));
    }
    return out;
}

function patternOf(node) {
    return node.head.text + node.templateSpans.map(span => '{p}' + span.literal.text).join('');
}

function isPlural(expr) {
    const compact = expr.replace(/\s+/g, '');
    return /!==1\?(['"])s\1:(['"])\2/.test(compact)
        || />1\?(['"])s\1:(['"])\2/.test(compact)
        || />1\?(['"])ies\1:(['"])y\2/.test(compact)
        || /===1\?(['"])\1:(['"])s\2/.test(compact)
        || /===1\?(['"])y\1:(['"])ies\2/.test(compact)
        || /===1\?(['"])\1:(['"])es\2/.test(compact);
}

function keyFor(pattern) {
    return 'tpl.' + createHash('sha1').update(pattern).digest('hex').slice(0, 10);
}

function compile(pattern, indexes) {
    const parts = pattern.split('{p}');
    const params = [...new Set(indexes)].map(i => `p${i}: string | number`).join('; ');
    const expr = parts.map((part, index) => {
        const bit = JSON.stringify(part);
        if (index >= parts.length - 1) return bit;
        return `${bit} + p.p${indexes[index]}`;
    }).join(' + ');
    return `(p: { ${params} }) => ${expr}`;
}

const packs = new Map();
let replaced = 0;
const problems = [];

for (const file of files(ROOT)) {
    const text = readFileSync(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const hits = [];
    const visit = (node) => {
        if (ts.isCallExpression(node)
            && ts.isIdentifier(node.expression)
            && node.expression.text === 'legacyUi'
            && node.arguments.length >= 2
            && ts.isTemplateExpression(node.arguments[0])
            && ts.isTemplateExpression(node.arguments[1])
            && patternOf(node.arguments[0]) === patternOf(node.arguments[1])) {
            const pattern = patternOf(node.arguments[0]);
            const holes = node.arguments[0].templateSpans.map(span => span.expression.getText(source));
            const plural = holes.map(isPlural);
            const valueIndexes = holes.map((_, index) => index).filter(index => !plural[index]);
            const zh = zhPatterns[pattern];
            const zhCount = zh ? zh.split('{p}').length - 1 : -1;
            if (!zh || zhCount !== valueIndexes.length) {
                problems.push({ file, pattern, holes, zh, zhCount, valueCount: valueIndexes.length });
            } else {
                const key = keyFor(pattern);
                const allIndexes = holes.map((_, index) => index);
                packs.set(pattern, { key, allIndexes, valueIndexes, zh });
                const args = allIndexes.map(index => `p${index}: ${holes[index]}`).join(', ');
                hits.push({ start: node.getStart(source), end: node.getEnd(), text: `tr(${JSON.stringify(key)}, { ${args} })` });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    if (hits.length === 0) continue;
    hits.sort((a, b) => b.start - a.start);
    let next = text;
    for (const hit of hits) next = next.slice(0, hit.start) + hit.text + next.slice(hit.end);
    if (!/\btr\b/.test(text.match(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*i18n['"]/)?.[0] ?? '')) {
        next = next.replace(/import\s*\{([^}]*)\}\s*from\s*(['"][^'"]*i18n['"])/, (all, names, from) => {
            if (/\btr\b/.test(names)) return all;
            return `import { tr,${names}} from ${from}`;
        });
    }
    writeFileSync(file, next);
    replaced += hits.length;
}

const enEntries = [];
const zhEntries = [];
for (const [pattern, info] of packs) {
    enEntries.push(`    ${JSON.stringify(info.key)}: ${compile(pattern, info.allIndexes)},`);
    zhEntries.push(`    ${JSON.stringify(info.key)}: ${compile(info.zh, info.valueIndexes)},`);
}
const packPath = 'i18n/templatePack.ts';
const current = readFileSync(packPath, 'utf8');
const enInsert = enEntries.join('\n');
const zhInsert = zhEntries.join('\n');
const next = current
    .replace('export const zhTemplates: MessageTable = {', `export const zhTemplates: MessageTable = {\n${zhInsert}`)
    .replace('export const enTemplates: MessageTable = {', `export const enTemplates: MessageTable = {\n${enInsert}`);
writeFileSync(packPath, next);

console.log(JSON.stringify({ replaced, patterns: packs.size, problems: problems.length }, null, 2));
for (const problem of problems.slice(0, 15)) {
    console.log('PROBLEM', problem.file, 'zh', problem.zhCount, 'values', problem.valueCount, JSON.stringify(problem.pattern));
    console.log('  holes', problem.holes.map(h => h.slice(0, 80)));
}
