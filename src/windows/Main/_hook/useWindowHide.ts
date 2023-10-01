import { Position } from '@/common/constants';
import { GlobalEvent } from '@/common/event';
import { rConsoleLog } from '@/utils';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { useMount } from 'ahooks';
import * as React from 'react';

// 判断用户是否点击到窗口外面，以实现翻译窗口的自动关闭
function useWindowVisible(): boolean {
  const [isVisible, setIsVisible] = React.useState<boolean >(false);

  const handleWindowHide = React.useCallback(async (pos: Position) => {
    const _isVisible = await appWindow.isVisible();
    setIsVisible(_isVisible);
    if (!_isVisible) return;
    const winPos = await appWindow.outerPosition();
    const winSize = await appWindow.outerSize();
    const isOuter = (
      pos.x < winPos.x ||
      pos.y < winPos.y ||
      pos.x > winPos.x + winSize.width ||
      pos.y > winPos.y + winSize.height
    );
    if (isOuter) {
      appWindow.hide();
    }
  }, []);

  useMount(() => {
    listen(GlobalEvent.MOUSE_PRESS_POSITION, (e) => {
      rConsoleLog(`鼠标按下位置，${JSON.stringify(e.payload)}`);
      const pos: Position = e.payload as Position;
      handleWindowHide(pos);
    });
  });

  return isVisible;
}

export default useWindowVisible;
