import { register, isRegistered, unregister } from '@tauri-apps/api/globalShortcut';
import { Command } from '@tauri-apps/api/shell';
import { useMount, usePrevious, useUpdateEffect } from 'ahooks';
import React from 'react';
import { getOsType, rConsoleLog, rGetMousePosition } from '@/utils';
import { PhysicalPosition, appWindow } from '@tauri-apps/api/window';
import { readText } from '@tauri-apps/api/clipboard';
import { useAtomValue } from 'jotai';
import { underlineOpened, underlineShortcut } from '@/store';
import { getCursorMonitorScaleFactor } from '@/utils/monitor';

function useAutoCopyHook() {
  const shortcut = useAtomValue(underlineShortcut);
  const isUnderline = useAtomValue(underlineOpened);
  const prevShortcut = usePrevious(shortcut);
  const [copyText, setCopyText] = React.useState<string>('');
  const autocopyRef = React.useRef<Command | null>(null);

  useMount(() => {
    // 初始化，加载旁侧可执行程序
    const command = Command.sidecar('binaries/autocopy');
    autocopyRef.current = command;
  });

  useUpdateEffect(() => {
    if (isUnderline) {
      registerShortcut();
    } else {
      unregisterShortcut();
    }
  }, [shortcut, isUnderline]);

  const registerShortcut = React.useCallback(async () => {
    rConsoleLog(`注册快捷键${shortcut}`);
    if (prevShortcut) {
      const prevRegistered = await isRegistered(prevShortcut);
      prevRegistered && unregister(prevShortcut);
    }

    const curResigered = await isRegistered(shortcut);
    if (curResigered) return;

    if (!shortcut) return;

    register(shortcut, async (s) => {
      rConsoleLog(`按下快捷键：${s}`);
      await autocopyRef.current?.execute();
      const isVisible = await appWindow.isVisible();
      if (!isVisible) {
        const res = await rGetMousePosition();
        rConsoleLog(`鼠标位置xxx：${JSON.stringify(res)}`);
        const osType = await getOsType();
        if (osType === 'Darwin') {
          const factor = getCursorMonitorScaleFactor({
            x: res[0],
            y: res[1],
          });
          rConsoleLog(`factor ${factor}`);
          const logicalPosition = new PhysicalPosition(res[0] * factor, res[1] * factor).toLogical(factor);
          rConsoleLog(`logical ${JSON.stringify(logicalPosition)}`);
          await appWindow.setPosition(logicalPosition);
        } else {
          // TODO： Windows 的多窗口目前没有进行过测试，注意下，如果有问题看是否跟 Mac 的处理方式一致
          await appWindow.setPosition(new PhysicalPosition(res[0], res[1]));
        }
        await appWindow.show();
        await appWindow.setFocus();
      }
      const res = await readText();
      if (res) {
        setCopyText(res);
      }
      rConsoleLog('执行完毕');
    });
  }, [prevShortcut, shortcut]);

  const unregisterShortcut = React.useCallback(async () => {
    const curResigered = await isRegistered(shortcut);
    if (!curResigered) return;

    unregister(shortcut);
  }, [shortcut]);

  return copyText;
}

export default useAutoCopyHook;
