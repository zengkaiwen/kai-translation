import { Position } from '@/common/constants';
import { GlobalEvent } from '@/common/event';
// import { rConsoleLog } from '@/utils';
import { type } from '@tauri-apps/api/os';
import { TauriEvent, listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { useMount } from 'ahooks';
import * as React from 'react';
import { useAtomValue } from 'jotai';
import { windowFixed } from '@/store/setting';

// 判断用户是否点击到窗口外面，以实现翻译窗口的自动关闭
function useWindowVisible(onHide?: () => void) {
  const atomWindowFixed = useAtomValue(windowFixed);
  const fixedRef = React.useRef<boolean>(atomWindowFixed);
  React.useEffect(() => {
    fixedRef.current = atomWindowFixed;
  }, [atomWindowFixed]);

  const handleWindowHide = React.useCallback(
    async (pos: Position) => {
      if (fixedRef.current) return;
      const _isVisible = await appWindow.isVisible();
      if (!_isVisible) return;
      const winPos = await appWindow.outerPosition();
      const winSize = await appWindow.outerSize();
      // rConsoleLog(`winPos ${JSON.stringify(winPos)}`);
      // rConsoleLog(`winSize ${JSON.stringify(winSize)}`);
      const isOuter =
        pos.x < winPos.x || pos.y < winPos.y || pos.x > winPos.x + winSize.width || pos.y > winPos.y + winSize.height;
      if (isOuter) {
        appWindow.hide();
        onHide?.();
      }
    },
    [onHide],
  );

  const hanleMacOsWindowHide = React.useCallback(async () => {
    if (fixedRef.current) return;
    const _isVisible = await appWindow.isVisible();
    if (!_isVisible) return;
    appWindow.hide();
    onHide?.();
  }, [onHide]);

  useMount(async () => {
    const osType = await type();
    // windows 下监听窗口失去焦点
    osType === 'Windows_NT' &&
      listen(GlobalEvent.MOUSE_PRESS_POSITION, (e) => {
        // rConsoleLog(`【Win】鼠标按下位置，${JSON.stringify(e.payload)}`);
        const pos: Position = e.payload as Position;
        handleWindowHide(pos);
      });

    // macos 下监听窗口失去焦点
    osType === 'Darwin' &&
      listen(TauriEvent.WINDOW_BLUR, () => {
        // rConsoleLog('窗口失去焦点');
        hanleMacOsWindowHide();
      });
  });
}

export default useWindowVisible;
