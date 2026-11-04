import { getInterfaceLocale, tr } from '../i18n';
import { EPILOGUE_ACT, PROLOGUE_ACT, formatActLabel, formatChapterLabel } from './actChapter';

export function displayGroupKey(key: string): string {
    const locale = getInterfaceLocale();
    const act = /^Act\s+(\d+(?:\.\d+)?)$/.exec(key);
    if (act) return formatActLabel(act[1], locale);
    const chapter = /^Chapter\s+(.+)$/.exec(key);
    if (chapter) return formatChapterLabel(chapter[1], locale);
    switch (key) {
        case 'Prologue': return formatActLabel(PROLOGUE_ACT, locale);
        case 'Epilogue': return formatActLabel(EPILOGUE_ACT, locale);
        case 'No Act': return tr('group.noAct');
        case 'No Chapter': return tr('group.noChapter');
        case 'No Status': return tr('group.noStatus');
        case 'No POV': return tr('group.noPov');
        case 'Unassigned': return tr('group.unassigned');
        case '(empty)': return tr('group.empty');
        default: return key;
    }
}
