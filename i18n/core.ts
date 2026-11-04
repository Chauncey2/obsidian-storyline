export type InterfaceLanguage = 'auto' | 'en' | 'zh-CN';
export type ResolvedLocale = 'en' | 'zh-CN';

export const INTERFACE_LANGUAGES: readonly InterfaceLanguage[] = ['auto', 'en', 'zh-CN'];

export type Message = string | ((params: unknown) => string);
export type MessageTable = Record<string, Message>;

export function normalizeInterfaceLanguage(value: unknown): InterfaceLanguage {
    return INTERFACE_LANGUAGES.includes(value as InterfaceLanguage) ? (value as InterfaceLanguage) : 'auto';
}

/** Obsidian reports Simplified Chinese as `zh` and Traditional Chinese as `zh-TW`. */
export function toResolvedLocale(tag: string | null | undefined): ResolvedLocale {
    return typeof tag === 'string' && tag.trim().toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function resolveInterfaceLocale(
    setting: unknown,
    obsidianLanguage: string | null | undefined,
): ResolvedLocale {
    const language = normalizeInterfaceLanguage(setting);
    return language === 'auto' ? toResolvedLocale(obsidianLanguage) : language;
}

export function lookupMessage(
    primary: Partial<MessageTable>,
    fallback: MessageTable,
    key: string,
    params?: unknown,
): string {
    const message = primary[key] ?? fallback[key];
    if (message === undefined) return key;
    return typeof message === 'function' ? message(params) : message;
}

const caseInsensitiveIndex = new WeakMap<object, Map<string, string>>();

export function lookupValue(table: Readonly<Record<string, string>>, value: string): string {
    if (Object.prototype.hasOwnProperty.call(table, value)) return table[value];
    let index = caseInsensitiveIndex.get(table);
    if (!index) {
        index = new Map(Object.entries(table).map(([english, translated]) => [english.toLowerCase(), translated]));
        caseInsensitiveIndex.set(table, index);
    }
    return index.get(value.toLowerCase()) ?? value;
}
