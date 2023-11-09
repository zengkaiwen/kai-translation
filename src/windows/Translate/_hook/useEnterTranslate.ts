import * as React from 'react';
import { enterShortcut } from '@/store/setting';
import { getOsType, rConsoleLog, rGetMousePosition } from '@/utils';
import { usePrevious, useUpdateEffect } from 'ahooks';
import { useAtomValue } from 'jotai';
import { isRegistered, register, unregister } from '@tauri-apps/api/globalShortcut';
import { LogicalPosition, PhysicalPosition, appWindow } from '@tauri-apps/api/window';
import { getCursorMonitorInfo } from '@/utils/monitor';
import { Translate_Window } from '@/common/constants';

function useEnterTranslate(onWindowShow: () => void) {
  const shortcut = useAtomValue(enterShortcut);
  const prevShortcut = usePrevious(shortcut);

  useUpdateEffect(() => {
    if (shortcut !== prevShortcut) {
      registerShortcut();
    }
  }, [shortcut]);

  const registerShortcut = React.useCallback(async () => {
    rConsoleLog(`注册输入快捷键 ${shortcut}`);
    if (prevShortcut) {
      const prevRegistered = await isRegistered(prevShortcut);
      prevRegistered && unregister(prevShortcut);
    }

    const curResigered = await isRegistered(shortcut);
    if (curResigered) return;

    if (!shortcut) return;

    // =====================
    // 输入翻译快捷键响应的方法
    // =====================
    register(shortcut, async (s) => {
      console.log(s);
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
      await appWindow.show();
      await appWindow.setFocus();
      onWindowShow?.();
    });
  }, [onWindowShow, prevShortcut, shortcut]);
}

export default useEnterTranslate;
