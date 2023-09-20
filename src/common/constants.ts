export type TLanguage = 'auto' | 'en' | 'zh' | 'de' | 'ja' | 'ko' | 'es' | 'pt' | 'th';

export interface TLanguageItem {
  key: TLanguage;
  name: React.ReactNode;
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
    key: 'es',
    name: '西班牙语',
  },
  {
    key: 'pt',
    name: '葡萄牙语',
  },
];
