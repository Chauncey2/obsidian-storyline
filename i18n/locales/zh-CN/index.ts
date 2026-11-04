import type { en } from '../en';
import { common } from './common';
import { commands } from './commands';
import { settings } from './settings';
import { group } from './group';
import { components } from './components';

export const zhCN = {
    ...common,
    ...commands,
    ...settings,
    ...group,
    ...components,
} satisfies typeof en;
