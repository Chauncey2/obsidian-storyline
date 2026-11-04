export const sceneValues: Record<'statusLabel' | 'timelineMode', Record<string, string>> = {
    statusLabel: {
        Idea: '构思', Outlined: '已列大纲', Draft: '草稿', Written: '已成稿', Revised: '已修订', Final: '定稿',
    },
    timelineMode: {
        Linear: '线性', Flashback: '闪回', 'Flash-forward': '闪前', 'Parallel timeline': '平行时间线',
        'Frame narrative': '框架叙事', Simultaneous: '同时发生', 'Time skip': '时间跳跃',
        'Dream / Vision': '梦境 / 幻象', 'Mythic / Legend': '神话 / 传说', Circular: '循环',
    },
};
