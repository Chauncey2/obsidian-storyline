 
import { Modal, App, Setting } from 'obsidian';
import { RenamePreview } from '../services/CascadeRenameService';
import { tr } from '../i18n';

/**
 * Modal that shows the user what a rename will affect and asks for confirmation.
 *
 * Displays a summary like:
 *   Rename "John" → "Jonathan"?
 *   This will update 12 scenes and 3 relationships.
 *
 * - "Update References" — cascades the rename across the project
 * - "Cancel" — reverts the name back to the original
 */
export class RenameConfirmModal extends Modal {
    private resolved = false;

    constructor(
        app: App,
        private entityType: 'character' | 'world' | 'location',
        private oldName: string,
        private newName: string,
        private preview: RenamePreview,
        private summaryText: string,
        private onConfirm: () => void | Promise<void>,
        private onCancel?: () => void,
    ) {
        super(app);
    }

    onOpen(): void {
        const { contentEl } = this;
        const label = this.entityType.charAt(0).toUpperCase() + this.entityType.slice(1);

        this.titleEl.setText(`${tr('common.rename')} ${label}`);

        // Description
        contentEl.createEl('p', {
            text: tr('common.renameQuestion', { oldName: this.oldName, newName: this.newName }),
        }).setCssStyles({ fontWeight: '600' });

        contentEl.createEl('p', {
            text: this.summaryText,
            cls: 'setting-item-description',
        });

        // Detail breakdown
        const details = contentEl.createDiv();
        details.setCssStyles({
            marginBottom: '12px',
            fontSize: '13px',
            color: 'var(--text-muted)',
        });

        if (this.preview.sceneCount > 0) {
            details.createDiv({ text: tr('common.renameScenes', { count: this.preview.sceneCount }) });
        }
        if (this.preview.relationCount > 0) {
            details.createDiv({ text: tr('common.renameRelationships', { count: this.preview.relationCount }) });
        }
        if (this.preview.locationCount > 0) {
            details.createDiv({ text: tr('common.renameChildLocations', { count: this.preview.locationCount }) });
        }
        if (this.preview.characterLocationCount > 0) {
            details.createDiv({ text: tr('common.renameCharacterLocations', { count: this.preview.characterLocationCount }) });
        }

        // Buttons
        new Setting(contentEl)
            .addButton(btn => {
                btn.setButtonText(tr('common.cancel'))
                    .onClick(() => {
                        this.resolved = true;
                        this.close();
                        this.onCancel?.();
                    });
            })
            .addButton(btn => {
                btn.setButtonText(tr('common.updateReferences'))
                    .setCta()
                    .onClick(async () => {
                        this.resolved = true;
                        this.close();
                        await this.onConfirm();
                    });
            });
    }

    onClose(): void {
        if (!this.resolved) {
            // User closed modal without choosing (Escape key) — revert name
            this.onCancel?.();
        }
        this.contentEl.empty();
    }
}
 
