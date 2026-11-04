import { enContent } from './content/en';
import { zhCNContent } from './content/zh-CN';
import {
    lookupMessage,
    lookupValue,
    resolveInterfaceLocale,
    toResolvedLocale,
    type MessageTable,
    type ResolvedLocale,
} from './core';
import { en } from './locales/en';
import { zhCN } from './locales/zh-CN';
import { zhCNValues } from './values/zh-CN';

export { INTERFACE_LANGUAGES, normalizeInterfaceLanguage, toResolvedLocale } from './core';
export type { InterfaceLanguage, ResolvedLocale } from './core';

export type Messages = typeof en;
export type TranslationKey = keyof Messages;
export type PlainKey = {
    [K in TranslationKey]: Messages[K] extends string ? K : never;
}[TranslationKey];
export type ContentMessages = typeof enContent;
export type ContentKey = keyof ContentMessages;
export type ValueDomain = keyof typeof zhCNValues;
export { getBuiltinBeatSheets, getBuiltinSceneTemplates } from './content';

type ArgsOf<M> = M extends (params: infer P) => string ? [params: P] : [];

const UI_TABLES: Record<ResolvedLocale, Partial<MessageTable>> = { en, 'zh-CN': zhCN };
const CONTENT_TABLES: Record<ResolvedLocale, Partial<MessageTable>> = { en: enContent, 'zh-CN': zhCNContent };

let activeLocale: ResolvedLocale = 'en';

export function setInterfaceLocale(
    setting: unknown,
    obsidianLanguage: string | null | undefined,
): ResolvedLocale {
    activeLocale = resolveInterfaceLocale(setting, obsidianLanguage);
    return activeLocale;
}

export function getInterfaceLocale(): ResolvedLocale {
    return activeLocale;
}

export function tr(key: string, ...args: [unknown?]): string {
    return lookupMessage(UI_TABLES[activeLocale], en, key, args[0]);
}

export function trContent<K extends ContentKey>(
    locale: ResolvedLocale,
    key: K,
    ...args: ArgsOf<ContentMessages[K]>
): string {
    return lookupMessage(CONTENT_TABLES[locale], enContent, key, (args as unknown[])[0]);
}

export function trContentValue(locale: ResolvedLocale, domain: ValueDomain, value: string): string {
    return locale === 'en' || !value ? value : lookupValue(zhCNValues[domain], value);
}

export function trValue(domain: ValueDomain, value: string): string {
    return trContentValue(activeLocale, domain, value);
}

/** Compatibility wrapper for legacy UI text while individual screens are migrated. */
export function legacyUi(key: string, fallback: string): string {
    if (activeLocale === 'zh-CN') {
        const value = (zhCN as Record<string, unknown>)[`legacy.${key}`];
        if (typeof value === 'string') return value;
        const quick: Record<string, string> = {
            'Open': '打开', 'Cancel': '取消', 'Create new project': '新建项目', 'Manage series…': '管理系列…',
            'Browse for project…': '浏览项目…', 'No projects found': '未找到项目', 'Error loading projects': '加载项目失败',
            'Scanning…': '正在扫描…', 'No StoryLine projects found.': '未找到 StoryLine 项目。',
            'Select a project to load, or create a new one.': '选择要加载的项目，或创建新项目。',
            'Add book to this series': '将书籍添加到此系列', 'All scenes': '所有场景',
            'All characters, locations and Codex entries': '所有人物、地点和 Codex 条目',
            'All notes, research and archive items': '所有笔记、研究和归档项目',
            'Project settings and view data': '项目设置和视图数据', 'The book will also be removed from its series.': '书籍也将从系列中移除。',
            'No series found. Create a series from the new project modal or use the command palette.': '未找到系列。请从新建项目对话框或命令面板创建系列。',
        };
        if (quick[key]) return quick[key];
        const interpolated = Object.entries(quick).find(([english]) => key.startsWith(english));
        if (interpolated) return interpolated[1] + key.slice(interpolated[0].length);
    }
    return fallback;
}

export function getContentLocale(storyLineLocale: string | null | undefined): ResolvedLocale {
    return toResolvedLocale(storyLineLocale);
}
