import { register } from '@tauri-apps/api/globalShortcut';
import { Command } from '@tauri-apps/api/shell';
import { useMount } from 'ahooks';
import React from 'react';
import { rConsoleLog } from '../utils';
import { appWindow } from '@tauri-apps/api/window';
import { readText } from '@tauri-apps/api/clipboard';

function useAutoCopyHook() {
  const [copyText, setCopyText] = React.useState<string>('');

  useMount(() => {
    const command = Command.sidecar('binaries/autocopy');

    register('Alt+Shift+A', async (shortcut) => {
      rConsoleLog(`按下快捷键：${shortcut}`);
      // rActiveText();
      await command.execute();
      const isVisible = await appWindow.isVisible();
      if (!isVisible) {
        appWindow.show();
      }
      const res = await readText();
      if (res) {
        setCopyText(res);
      }
      rConsoleLog('执行完毕');
    });
  });

  return copyText;
}

export default useAutoCopyHook;
