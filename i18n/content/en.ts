export const enContent = {
    'structure.chapterSceneTitle': (p: { n: number; label: string }) => `Chapter ${p.n} — ${p.label}`,
    'scene.untitled': 'Untitled',
    'scene.untitledScene': 'Untitled Scene',
    'act.prologue': 'Prologue',
    'act.epilogue': 'Epilogue',
    'act.numbered': (p: { n: number }) => `Act ${p.n}`,
    'act.withLabel': (p: { act: string; label: string }) => `${p.act}: ${p.label}`,
    'chapter.numbered': (p: { n: string }) => `Chapter ${p.n}`,
    'chapter.withLabel': (p: { n: string; label: string }) => `Chapter ${p.n}: ${p.label}`,
};
