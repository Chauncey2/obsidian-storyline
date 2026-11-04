import type { enContent } from './en';

export const zhCNContent = {
    'structure.chapterSceneTitle': (p: { n: number; label: string }) => `第 ${p.n} 章 — ${p.label}`,
    'scene.untitled': '未命名',
    'scene.untitledScene': '未命名场景',
    'act.prologue': '序章',
    'act.epilogue': '尾声',
    'act.numbered': (p: { n: number }) => `第 ${p.n} 幕`,
    'act.withLabel': (p: { act: string; label: string }) => `${p.act}：${p.label}`,
    'chapter.numbered': (p: { n: string }) => `第 ${p.n} 章`,
    'chapter.withLabel': (p: { n: string; label: string }) => `第 ${p.n} 章：${p.label}`,
} satisfies typeof enContent;
