import * as React from 'react';
import { useMount } from 'ahooks';
import { Setting, readSettings, writeSettings } from '@/utils/settings';
import { useSetAtom } from 'jotai';
import {
  innerPlan,
  innerSwitch,
  mainLanguage,
  subLanguage,
  underlineOpened,
  underlineShortcut,
  enterShortcut,
  windowFixed,
} from '@/store/setting';
import { rConsoleLog } from '@/utils';
import { emit } from '@tauri-apps/api/event';
import { GlobalEvent } from '@/common/event';
import { cloneDeep } from 'lodash';
import { theme } from '@/store/global';

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
  const setEnterShortcut = useSetAtom(enterShortcut);
  const setMainLanguage = useSetAtom(mainLanguage);
  const setSubLanguage = useSetAtom(subLanguage);
  const setTheme = useSetAtom(theme);
  const setInnerSwitch = useSetAtom(innerSwitch);
  const setInnerPlan = useSetAtom(innerPlan);

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
      setEnterShortcut(settingsTemp.enterShortcut);
      setMainLanguage(settingsTemp.mainLanguage);
      setSubLanguage(settingsTemp.subLanguage);
      setTheme(settingsTemp.theme);
      setInnerSwitch(settingsTemp.innerSwitch);
      setInnerPlan(settingsTemp.innerPLan);
    },
    [
      setInnerPlan,
      setInnerSwitch,
      setMainLanguage,
      setSubLanguage,
      setTheme,
      setUnderlineOpened,
      setUnderlineShortcut,
      setEnterShortcut,
      setWindowsFixed,
    ],
  );

  const saveSettings = React.useCallback(async (_settings: Setting) => {
    rConsoleLog(`保存配置文件：${JSON.stringify(_settings)}`);
    await writeSettings(_settings);
    await emit(GlobalEvent.SETTINGS_UPDATED, cloneDeep(_settings));
    rConsoleLog('设置更新事件已发送');
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
