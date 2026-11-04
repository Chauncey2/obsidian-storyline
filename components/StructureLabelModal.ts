/* eslint-disable @typescript-eslint/no-misused-promises -- Async DOM handlers are intentional. */
import { App, Modal, Setting } from 'obsidian';
import { tr } from '../i18n';

export function openStructureLabelModal(
    app: App,
    type: 'Act' | 'Chapter',
    number: number,
    current: string,
    onSave: (label: string) => Promise<void>,
): void {
    const modal = new Modal(app);
    modal.titleEl.setText(tr('common.renameStructure', { type, number }));

    let value = current;
    new Setting(modal.contentEl)
        .setName(tr('common.label'))
        .setDesc(tr('common.structureLabelDesc', { type, number }))
        .addText(text => {
            text.setValue(current)
                .setPlaceholder(tr('common.beginningPlaceholder'))
                .onChange(next => { value = next; });
            window.setTimeout(() => text.inputEl.focus(), 50);
        });

    const buttons = modal.contentEl.createDiv('structure-close-row');
    buttons.createEl('button', { text: tr('common.saveButton'), cls: 'mod-cta' }).addEventListener('click', async () => {
        await onSave(value);
        modal.close();
    });
    buttons.createEl('button', { text: tr('common.cancel') }).addEventListener('click', () => modal.close());
    modal.open();
}

/* eslint-enable @typescript-eslint/no-misused-promises -- Restore promise-handler linting after the modal's intentional async DOM handler. */
