/** Unicode-aware heading slug used by the bundled help renderer and PDF export. */
export function slugifyHeading(text: string): string {
    return text.trim().toLowerCase()
        .replace(/[^\p{L}\p{N}_\s-]/gu, '')
        .replace(/\s/g, '-');
}

export function headingToAnchorKey(text: string): string {
    return slugifyHeading(text).replace(/-+/g, '-');
}

export function fragmentToAnchorKey(href: string): string {
    let fragment = href.replace(/^#/, '');
    try { fragment = decodeURIComponent(fragment); } catch { /* retain malformed input */ }
    return headingToAnchorKey(fragment);
}
