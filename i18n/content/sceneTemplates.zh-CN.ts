import type { SceneTemplate } from '../../models/Scene';

export const zhCNSceneTemplates: Record<string, Pick<SceneTemplate, 'name' | 'description' | 'bodyTemplate'>> = {
    Blank: { name: '空白', description: '空场景，不预填正文', bodyTemplate: '' },
    'Action Scene': { name: '动作场景', description: '目标 / 冲突 / 结果结构', bodyTemplate: '## 目标\n\n## 冲突\n\n## 行动\n\n## 结果\n' },
    'Dialogue Scene': { name: '对话场景', description: '带有情感利害的人物对话', bodyTemplate: '## 场景设定\n\n## 对话焦点\n\n## 情感利害\n\n## 收获\n' },
    Flashback: { name: '闪回', description: '向读者揭示过去的事件', bodyTemplate: '## 触发点\n\n## 回忆\n\n## 情感分量\n\n## 回到当下\n' },
    'Opening Chapter': { name: '开篇章节', description: '钩子、世界观与人物登场', bodyTemplate: '## 钩子\n\n## 世界与背景\n\n## 人物登场\n\n## 激励时刻\n' },
};
