import { register, isRegistered, unregister } from '@tauri-apps/api/globalShortcut';
import { usePrevious, useUpdateEffect } from 'ahooks';
import React from 'react';
import { getOsType, rAutoCopy, rConsoleLog, rGetMousePosition } from '@/utils';
import { LogicalPosition, PhysicalPosition, appWindow } from '@tauri-apps/api/window';
import { readText } from '@tauri-apps/api/clipboard';
import { useAtomValue } from 'jotai';
import { underlineOpened, underlineShortcut } from '@/store/setting';
import { getCursorMonitorInfo } from '@/utils/monitor';
import { Translate_Window } from '@/common/constants';

function useAutoCopyHook(onCopyText: (text: string) => void) {
  const shortcut = useAtomValue(underlineShortcut);
  const isUnderline = useAtomValue(underlineOpened);
  const prevShortcut = usePrevious(shortcut);

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
      await rAutoCopy();
      const isVisible = await appWindow.isVisible();
      /// 当弹窗未固定显示时，设定弹窗需要出现的位置
      if (!isVisible) {
        const res = await rGetMousePosition();
        // rConsoleLog(`鼠标位置xxx：${JSON.stringify(res)}`);
        const monitorInfo = await getCursorMonitorInfo({ x: res[0], y: res[1] });
        if (monitorInfo) {
          const { size, scaleFactor, position } = monitorInfo;
          const { width: monitorWidth, height: monitorHeight } = size;
          const { width: winWidth, maxHeight: winHeight } = Translate_Window;
          const physicalCenter = new PhysicalPosition(
            position.x + monitorWidth * 0.5,
            position.y + monitorHeight * 0.5,
          );
          const osType = await getOsType();
          if (osType === 'Darwin') {
            const logicalCenter = physicalCenter.toLogical(scaleFactor);
            await appWindow.setPosition(
              new LogicalPosition(logicalCenter.x - winWidth * 0.5, logicalCenter.y - winHeight * 0.5),
            );
          } else {
            await appWindow.setPosition(
              new PhysicalPosition(physicalCenter.x - winWidth * 0.5, physicalCenter.y - winHeight * 0.5),
            );
          }
        }
      }
      const res = await readText();
      /// 当文案存在且不与上一次文案一致时，出现翻译弹窗
      if (res) {
        onCopyText(res);
        await appWindow.show();
        await appWindow.setFocus();
      }
    });
  }, [onCopyText, prevShortcut, shortcut]);

  const unregisterShortcut = React.useCallback(async () => {
    const curResigered = await isRegistered(shortcut);
    if (!curResigered) return;

    unregister(shortcut);
  }, [shortcut]);
}

export default useAutoCopyHook;
