import * as React from 'react';
import { useMount, useUnmount } from 'ahooks';
import { Setting, readSettings } from '@/utils/settings';
import { useSetAtom } from 'jotai';
import { mainLanguage, subLanguage, underlineShortcut, windowFixed } from '@/store';
import { rConsoleLog } from '@/utils';
import { WebviewWindow } from '@tauri-apps/api/window';

export interface SettingProviderProps {
  settings: Setting | undefined;
  showSettingWindow: () => void;
  hideSettingWindow: () => void;
}

function useSetting(): SettingProviderProps {
  const [settings, setSettings] = React.useState<Setting>();
  const setWindowsFixed = useSetAtom(windowFixed);
  const setUnderlineShortcut = useSetAtom(underlineShortcut);
  const setMainLanguage = useSetAtom(mainLanguage);
  const setSubLanguage = useSetAtom(subLanguage);

  const settingWindowRef = React.useRef<WebviewWindow | null>(null);

  useMount(async () => {
    rConsoleLog('settings hook');
    // 从配置文件里面读取设置的配置项，并写入 store 里面
    const _settings = await readSettings();
    rConsoleLog(`配置文件：${JSON.stringify(_settings)}`);
    setSettings(_settings);
    setWindowsFixed(_settings.windowFixed);
    setUnderlineShortcut(_settings.underlineShortcut);
    setMainLanguage(_settings.mainLanguage);
    setSubLanguage(_settings.subLanguage);

    // 监听事件
  });

  useUnmount(() => {
    settingWindowRef.current?.close();
  });

  const showSettingWindow = React.useCallback(() => {
    if (settingWindowRef.current) {
      settingWindowRef.current.show();
      return;
    }
    const settingWindow = new WebviewWindow('setting', {
      url: '#/setting',
      decorations: false,
      fullscreen: false,
      resizable: false,
      title: '偏好设置',
      transparent: true,
      visible: true,
      focus: true,
      hiddenTitle: true,
      width: 480,
      height: 320,
      alwaysOnTop: true,
    });
    settingWindowRef.current = settingWindow;
  }, []);

  const hideSettingWindow = React.useCallback(() => {
    settingWindowRef.current?.hide();
  }, []);

  return { settings, showSettingWindow, hideSettingWindow };
}

export default useSetting;
