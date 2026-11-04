 
import { ItemView, WorkspaceLeaf, MarkdownRenderer, Component, Notice, TFile } from 'obsidian';
import type SceneCardsPlugin from '../main';
import { HELP_VIEW_TYPE } from '../constants';
import HELP_MARKDOWN from '../HELP.md';
import HELP_MARKDOWN_ZH_CN from '../HELP.zh-CN.md';
import { getInterfaceLocale, tr } from '../i18n';
import { fragmentToAnchorKey, headingToAnchorKey, slugifyHeading } from '../utils/helpAnchors';

/**
 * HelpView — displays the HELP.md documentation in a dedicated
 * right-split pane with clickable TOC and scrollable content.
 */
export class HelpView extends ItemView {
    private plugin: SceneCardsPlugin;
    private renderComponent: Component;

    constructor(leaf: WorkspaceLeaf, plugin: SceneCardsPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.renderComponent = new Component();
    }

    getViewType(): string {
        return HELP_VIEW_TYPE;
    }

    getDisplayText(): string {
        return tr('common.help');
    }

    getIcon(): string {
        return 'help-circle';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        await this.mountInto(container);
    }

    async onClose(): Promise<void> {
        this.renderComponent.unload();
    }

    /**
     * Render the Help panel into an arbitrary host element.
     * Used both by `onOpen` (full-view mount) and by the Scene Inspector
     * sidebar's Help tab (embedded mount).
     */
    async mountInto(host: HTMLElement): Promise<void> {
        this.renderComponent.load();
        host.addClass('storyline-help-container');
        await this.renderHelp(host);
    }

    /**
     * Render the bundled HELP.md content as native Obsidian markdown
     * inside the pane. The markdown source is embedded into main.js at
     * build time (esbuild text loader), so no separate file needs to ship.
     */
    private async renderHelp(container: HTMLElement): Promise<void> {
        const markdown = getInterfaceLocale() === 'zh-CN' ? HELP_MARKDOWN_ZH_CN : HELP_MARKDOWN;

        if (!markdown) {
            container.createEl('p', {
                text: tr('common.helpUnavailable'),
                cls: 'storyline-help-error',
            });
            return;
        }

        const toolbar = container.createDiv('storyline-help-toolbar');
        const pdfStatus = toolbar.createSpan({
            cls: 'storyline-help-pdf-status',
            attr: { 'aria-live': 'polite' },
        });
        const pdfButton = toolbar.createEl('button', {
            text: tr('common.pdf'),
            cls: 'storyline-help-pdf-button',
            attr: { 'aria-label': tr('common.exportHelpPdf') },
        });
        // Wrapper for rendered content
        const content = container.createDiv('storyline-help-content markdown-rendered');

        // Use Obsidian's MarkdownRenderer to get native styling
        await MarkdownRenderer.render(
            this.app,
            markdown,
            content,
            '',
            this.renderComponent,
        );

        pdfButton.addEventListener('click', () => {
            void this.exportPdf(content, pdfButton, pdfStatus);
        });

        // Make internal anchor links scroll within the pane
        content.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (!href) return;
                const targetId = fragmentToAnchorKey(href);
                const target = Array.from(content.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'))
                    .find((heading) => headingToAnchorKey(heading.textContent ?? '') === targetId)
                    || content.querySelector(`#${CSS.escape(targetId)}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    private async exportPdf(content: HTMLElement, button: HTMLButtonElement, status: HTMLSpanElement): Promise<void> {
        button.disabled = true;
        status.setText(tr('common.preparingPdf'));
        new Notice(tr('common.preparingHelpPdf'));

        try {
            await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
            const version = this.plugin.manifest.version;
            const generatedAt = new Date().toLocaleString();
            status.setText(tr('common.preparingPrintLayout'));
            const printableContent = content.cloneNode(true) as HTMLElement;
            printableContent.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
                const element = heading as HTMLElement;
                const id = slugifyHeading(element.textContent || '');
                if (id) element.id = id;
            });
            const html = `<!DOCTYPE html>
<html lang="${getInterfaceLocale()}">
<head>
<meta charset="UTF-8">
<title>StoryLine Help - v${version}</title>
<style>
    @page { size: A4; margin: 18mm; }
    body { font-family: ${getInterfaceLocale() === 'zh-CN' ? '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", ' : ''}Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.5; color: #222; }
    h1 { font-size: 22pt; margin: 0 0 0.6em; border-bottom: 1px solid #888; padding-bottom: 0.25em; }
    h2 { font-size: 16pt; margin-top: 1.4em; page-break-after: avoid; }
    h3 { font-size: 13pt; margin-top: 1.1em; page-break-after: avoid; }
    h4, h5, h6 { page-break-after: avoid; }
    p, ul, ol, pre, table { page-break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th, td { border: 1px solid #aaa; padding: 4px 6px; text-align: left; }
    th { background: #eee; }
    code, pre { font-family: 'Courier New', monospace; font-size: 9pt; }
    pre { white-space: pre-wrap; }
    a { color: #222; text-decoration: none; }
</style>
</head>
<body>
<p><strong>StoryLine Help</strong><br>Version: ${version}<br>Generated: ${generatedAt}</p>
<hr>
${printableContent.innerHTML}
</body>
</html>`;

            status.setText(tr('common.generatingPdf'));
            const pdfBytes = await this.printHtmlToPdf(html, status);
            if (!pdfBytes) {
                status.setText(tr('common.desktopPdfUnavailable'));
                new Notice(tr('common.desktopPdfRequired'));
                return;
            }

            status.setText(tr('common.savingPdf'));
            const filename = `StoryLine Help (v${version}).pdf`;
            const pdfBuffer = this.toArrayBuffer(pdfBytes);
            const existing = this.app.vault.getAbstractFileByPath(filename);
            if (existing instanceof TFile) {
                await this.app.vault.modifyBinary(existing, pdfBuffer);
            } else {
                await this.app.vault.createBinary(filename, pdfBuffer);
            }
            status.setText(tr('common.pdfReady'));
            new Notice(tr('common.createdFile', { path: filename }));
        } catch (error) {
            console.error('StoryLine: failed to create Help PDF', error);
            status.setText(tr('common.pdfExportFailed'));
            new Notice(tr('common.couldNotCreatePdf'));
        } finally {
            button.disabled = false;
        }
    }

    private async printHtmlToPdf(html: string, status: HTMLSpanElement): Promise<Uint8Array | null> {
        if (typeof (window as unknown as Record<string, unknown>).require !== 'function') return null;

        return new Promise<Uint8Array | null>((resolve) => {
            try {
                const webview = document.createElementNS('http://www.w3.org/1999/xhtml', 'webview') as unknown as {
                    setCssStyles: (styles: Record<string, string>) => void;
                    setAttribute: (name: string, value: string) => void;
                    addEventListener: (event: string, callback: (...args: unknown[]) => void) => void;
                    remove: () => void;
                    printToPDF: (options: Record<string, unknown>) => Promise<Uint8Array>;
                };
                webview.setCssStyles({
                    position: 'fixed',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1px',
                    height: '1px',
                });
                webview.setAttribute('nodeintegration', 'false');
                webview.setAttribute('webpreferences', 'contextIsolation=true');
                webview.setAttribute('src', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));

                const cleanup = () => {
                    try { webview.remove(); } catch { /* noop */ }
                };
                const timer = window.setTimeout(() => {
                    cleanup();
                    resolve(null);
                }, 30_000);

                webview.addEventListener('dom-ready', () => {
                    void (async () => {
                        try {
                            status.setText(tr('common.renderingPdf'));
                            await new Promise<void>((resolveDelay) => window.setTimeout(resolveDelay, 500));
                            const pdfBuffer = await webview.printToPDF({
                                pageSize: 'A4',
                                printBackground: true,
                                preferCSSPageSize: true,
                                displayHeaderFooter: true,
                                headerTemplate: '<span></span>',
                                footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#888;"><span class="pageNumber"></span></div>',
                            });
                            window.clearTimeout(timer);
                            cleanup();
                            resolve(new Uint8Array(pdfBuffer));
                        } catch (error) {
                            console.error('StoryLine Help PDF: printToPDF failed', error);
                            window.clearTimeout(timer);
                            cleanup();
                            resolve(null);
                        }
                    })();
                });
                webview.addEventListener('did-fail-load', () => {
                    window.clearTimeout(timer);
                    cleanup();
                    resolve(null);
                });
                document.body.appendChild(webview as unknown as Node);
            } catch (error) {
                console.error('StoryLine Help PDF: webview unavailable', error);
                resolve(null);
            }
        });
    }

    private toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
        const buffer = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(buffer).set(bytes);
        return buffer;
    }

    /**
     * Convert a URL-fragment slug back to the heading text format
     * Obsidian uses for data-heading attributes.
     * e.g. "board-view" → "Board View"
     */
}
 
