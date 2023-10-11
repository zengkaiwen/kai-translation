import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  themeName: 'light',
  themePrimary: '#6659ea',
  // 文字
  textPrimary: '#232320',
  textSecond: '#646d76',
  textThird: '#7d7d7d',
  textFour: '#9ca3af',
  // 背景色
  bgPrimary: '#ffffff',
  bgSecond: '#f9f9f9',
  bgThird: '#f2f2f2',
  bgFour: '#e5e5e5',
  // 边框
  linePrimary: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme: DefaultTheme = {
  themeName: 'dark',
  themePrimary: '#6659ea',
  // 文字
  textPrimary: '#ffffff',
  textSecond: '#dedede',
  textThird: '#9d9d9d',
  textFour: '#7c7c7c',
  // 背景色
  bgPrimary: '#161718',
  bgSecond: '#242424',
  bgThird: '#3a3a3a',
  bgFour: '#4e4e4e',
  // 边框
  linePrimary: 'rgba(255, 255, 255, 0.1)',
};
