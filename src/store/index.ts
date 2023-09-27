import { atom } from 'jotai';

/** 是否固定，固定之后的话，点击窗口其他位置，窗口不会隐藏 */
export const windowFixed = atom<boolean>(false);

/** 划词翻译的快捷键 */
export const underlineShortcut = atom<string>('');

/** 翻译类型的主语言 */
export const mainLanguage = atom<string>('');

/** 翻译类型的副语言 */
export const subLanguage = atom<string>('');
