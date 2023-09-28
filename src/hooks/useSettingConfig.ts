import * as React from 'react';
import { useMount } from 'ahooks';
import { Setting, readSettings, writeSettings } from '@/utils/settings';
import { useSetAtom } from 'jotai';
import { mainLanguage, subLanguage, underlineOpened, underlineShortcut, windowFixed } from '@/store';
import { rConsoleLog } from '@/utils';
import { emit } from '@tauri-apps/api/event';
import { GlobalEvent } from '@/common/event';
import { cloneDeep } from 'lodash';

export interface SettingConfigResult {
  settings: Setting | undefined;
  loadSettings: (s?: Setting) => Promise<void>;
  saveSettings: (s: Setting) => Promise<void>;
}

function useSettingConfig(): SettingConfigResult {
  const [settings, setSettings] = React.useState<Setting>();
  const setWindowsFixed = useSetAtom(windowFixed);
  const setUnderlineOpened = useSetAtom(underlineOpened);
  const setUnderlineShortcut = useSetAtom(underlineShortcut);
  const setMainLanguage = useSetAtom(mainLanguage);
  const setSubLanguage = useSetAtom(subLanguage);

  const loadSettings = React.useCallback(
    async (_settings?: Setting) => {
      let settingsTemp = cloneDeep(_settings);
      if (!settingsTemp) {
        // 从配置文件里面读取设置的配置项，并写入 store 里面
        settingsTemp = await readSettings();
      }
      rConsoleLog(`加载配置文件：${JSON.stringify(settingsTemp)}`);
      setSettings(settingsTemp);
      setWindowsFixed(settingsTemp.windowFixed);
      setUnderlineOpened(settingsTemp.underline);
      setUnderlineShortcut(settingsTemp.underlineShortcut);
      setMainLanguage(settingsTemp.mainLanguage);
      setSubLanguage(settingsTemp.subLanguage);
    },
    [setMainLanguage, setSubLanguage, setUnderlineOpened, setUnderlineShortcut, setWindowsFixed],
  );

  const saveSettings = React.useCallback(async (_settings: Setting) => {
    rConsoleLog(`保存配置文件：${JSON.stringify(_settings)}`);
    await writeSettings(_settings);
    emit(GlobalEvent.UPDATE_SETTINGS_CONFIG, cloneDeep(_settings));
  }, []);

  useMount(() => {
    loadSettings();
  });

  return {
    settings,
    saveSettings,
    loadSettings,
  };
}

export default useSettingConfig;
