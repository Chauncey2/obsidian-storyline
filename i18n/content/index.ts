import { BUILTIN_BEAT_SHEETS, BUILTIN_SCENE_TEMPLATES, type BeatSheetTemplate, type SceneTemplate } from '../../models/Scene';
import type { ResolvedLocale } from '../core';
import { zhCNBeatSheets } from './beatSheets.zh-CN';
import { zhCNSceneTemplates } from './sceneTemplates.zh-CN';

export function getBuiltinSceneTemplates(locale: ResolvedLocale): SceneTemplate[] {
    if (locale === 'en') return BUILTIN_SCENE_TEMPLATES;
    return BUILTIN_SCENE_TEMPLATES.map((template) => {
        const text = zhCNSceneTemplates[template.name];
        return text ? { ...template, ...text } : template;
    });
}

export function getBuiltinBeatSheets(locale: ResolvedLocale): BeatSheetTemplate[] {
    if (locale === 'en') return BUILTIN_BEAT_SHEETS;
    return BUILTIN_BEAT_SHEETS.map((sheet) => {
        const text = zhCNBeatSheets[sheet.name];
        return text ? {
            ...sheet,
            displayName: text.displayName,
            summary: text.summary,
            actLabels: { ...sheet.actLabels, ...text.actLabels },
            chapterLabels: { ...sheet.chapterLabels, ...text.chapterLabels },
            beats: sheet.beats.map((beat, index) => ({ ...beat, ...text.beats[index] })),
        } : sheet;
    });
}
