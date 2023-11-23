import { TTheme } from '@/common/constants';
import { atom } from 'jotai';

/** 主题 */
export const theme = atom<TTheme>('light');
