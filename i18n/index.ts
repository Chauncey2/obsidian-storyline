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
import { legacyZh } from './legacyZh';
import { enTemplates, zhTemplates } from './templatePack';

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

const UI_TABLES: Record<ResolvedLocale, MessageTable> = {
    en: { ...en, ...enTemplates },
    'zh-CN': { ...zhCN, ...zhTemplates },
};
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

/** Display a comma-separated list of stored English role names. */
export function displayRoles(value: string): string {
    if (!value || activeLocale !== 'zh-CN') return value;
    return value.split(',').map(part => trValue('characterRole', part.trim())).join('、');
}

/** Translates an exact English UI string. Parameterized sentences use tr() instead. */
export function legacyUi(key: string, fallback: string): string {
    if (activeLocale !== 'zh-CN') return fallback;
    return legacyZh[key] ?? fallback;
}

export function getContentLocale(storyLineLocale: string | null | undefined): ResolvedLocale {
    return toResolvedLocale(storyLineLocale);
}
