export const Official_Web_Url = 'https://www.zeusfy.top/';

export const Translate_Window = {
  width: 420,
  minHeight: 264,
  maxHeight: 720,
};

export type TLanguage = 'auto' | 'en' | 'zh' | 'de' | 'ja' | 'ko' | 'es' | 'pt' | 'th' | 'ru';

export type TCode = 'eng' | 'cmn' | 'deu' | 'jpn' | 'kor' | 'spa' | 'por' | 'tha' | 'rus';

export type TTheme = 'light' | 'dark';

export type TInnerTranslatePlan = 'speed' | 'accuracy';

export interface TLanguageItem {
  key: TLanguage;
  name: React.ReactNode;
}

export interface ITranslateParams {
  source: TLanguage;
  target: TLanguage;
  text: string;
}

export const LanguageList: TLanguageItem[] = [
  {
    key: 'auto',
    name: '自动',
  },
  {
    key: 'en',
    name: '英语',
  },
  {
    key: 'zh',
    name: '中文',
  },
  {
    key: 'de',
    name: '德语',
  },
  {
    key: 'ja',
    name: '日语',
  },
  {
    key: 'ko',
    name: '韩语',
  },
  {
    key: 'th',
    name: '泰语',
  },
  {
    key: 'ru',
    name: '俄语',
  },
  {
    key: 'es',
    name: '西班牙语',
  },
  {
    key: 'pt',
    name: '葡萄牙语',
  },
];

export interface Position {
  x: number;
  y: number;
}

export const Code2Language: Record<TCode, TLanguage> = {
  cmn: 'zh',
  eng: 'en',
  deu: 'de',
  jpn: 'ja',
  kor: 'ko',
  tha: 'th',
  spa: 'es',
  por: 'pt',
  rus: 'ru',
};
