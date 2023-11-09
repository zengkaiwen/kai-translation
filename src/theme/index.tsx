import * as React from 'react';
import { theme } from '@/store/global';
import { ThemeProvider as Provider } from 'styled-components';
import { darkTheme, lightTheme } from './color';
import { useAtomValue } from 'jotai';

const LOCALE_THEMES = { dark: darkTheme, light: lightTheme };

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localeTheme = useAtomValue(theme);

  return <Provider theme={LOCALE_THEMES[localeTheme]}>{children}</Provider>;
};

export default ThemeProvider;
