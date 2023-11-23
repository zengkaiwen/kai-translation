import { exists, BaseDirectory, readTextFile, writeTextFile, createDir } from '@tauri-apps/api/fs';
import { cloneDeep, pick } from 'lodash';
import { TInnerTranslatePlan, TLanguage, TTheme } from '@/common/constants';

export interface Setting {
  underline: boolean;
  underlineShortcut: string;
  enterShortcut: string;
  windowFixed: boolean;
  mainLanguage: TLanguage;
  subLanguage: TLanguage;
  // v0.0.4
  theme: TTheme;
  innerSwitch: boolean;
  innerPLan: TInnerTranslatePlan;
}

const defaultSettings: Setting = {
  underline: true,
  underlineShortcut: 'Alt+Shift+A',
  enterShortcut: 'Alt+Shift+Z',
  windowFixed: false,
  mainLanguage: 'zh',
  subLanguage: 'en',
  theme: 'light',
  innerSwitch: true,
  innerPLan: 'speed',
};

/**
 * 读取 AppConfig 里面的设置文件数据
 * @returns 设置
 */
export async function readSettings(): Promise<Setting> {
  let settings: Setting = cloneDeep(defaultSettings);
  // 判断 $APPCONFIG/settings.json 文件是否存在
  const fileExists = await exists('config/settings.json', { dir: BaseDirectory.AppConfig });
  if (fileExists) {
    const settingsText = await readTextFile('config/settings.json', { dir: BaseDirectory.AppConfig });
    try {
      const settingsConfig = JSON.parse(settingsText);
      settings = { ...settings, ...settingsConfig };
      settings = pick(settings, Object.keys(defaultSettings)) as Setting;
    } catch (error) {
      console.error('settings.json 文件格式错误');
    }
  }
  return settings;
}

/**
 * 写入配置项到文件里面
 * @param settings 配置内容
 * @returns
 */
export async function writeSettings(settings: Setting): Promise<void> {
  try {
    // 判断 $APPCONFIG 路径是否存在
    const dirExists = await exists('config', { dir: BaseDirectory.AppConfig });
    if (!dirExists) {
      await createDir('config', { dir: BaseDirectory.AppData, recursive: true });
    }
    return await writeTextFile('config/settings.json', JSON.stringify(settings), { dir: BaseDirectory.AppConfig });
  } catch (error) {
    console.error(error);
  }
}
