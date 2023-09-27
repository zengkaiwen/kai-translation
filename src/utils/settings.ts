import { exists, BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { cloneDeep, pick } from 'lodash';
import { TLanguage } from '@/common/constants';

export interface Setting {
  underline: boolean;
  underlineShortcut: string;
  windowFixed: boolean;
  mainLanguage: TLanguage;
  subLanguage: TLanguage;
}

const defaultSettings: Setting = {
  underline: true,
  underlineShortcut: 'Alt+Shift+A',
  windowFixed: false,
  mainLanguage: 'zh',
  subLanguage: 'en',
};

/**
 * 读取 AppConfig 里面的设置文件数据
 * @returns 设置
 */
export async function readSettings(): Promise<Setting> {
  let settings: Setting = cloneDeep(defaultSettings);
  // 判断 $APPCONFIG/settings.json 文件是否存在
  const fileExists = await exists('settings.json', { dir: BaseDirectory.AppConfig });
  if (fileExists) {
    const settingsText = await readTextFile('settings.json', { dir: BaseDirectory.AppConfig });
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
  return await writeTextFile('settings.json', JSON.stringify(settings), { dir: BaseDirectory.AppConfig });
}
