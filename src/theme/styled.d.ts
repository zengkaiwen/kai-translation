/* eslint-disable @typescript-eslint/no-empty-interface */
import type { TTheme } from '@/common/constants';
import {} from 'styled-components';

export interface ThemeType {
  // 当前主题
  themeName: TTheme;
  themePrimary: string;
  // 文字
  textPrimary: string;
  textSecond: string;
  textThird: string;
  textFour: string;
  // 边框|分割线
  linePrimary: string;
  lineSecond: string;
  // 底色
  bgPrimary: string;
  bgSecond: string;
  bgThird: string;
  bgFour: string;
  // 其他
  disabled: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
