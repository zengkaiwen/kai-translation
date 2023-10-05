import { Position } from '@/common/constants';
import { Monitor, availableMonitors } from '@tauri-apps/api/window';
// import { rConsoleLog } from '.';

export interface MonitorInfo {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  scaleFactor: number;
}

let monitors: Monitor[] = [];

/** 初始化显示器 */
export async function initMonitors() {
  if (monitors.length > 0) return;
  monitors = await availableMonitors();
  // console.log('显示器', monitors);
  // rConsoleLog(`显示器列表, ${JSON.stringify(monitors)}`);
}

/** 获取当前坐标所在的显示器缩放值 */
export function getCursorMonitorScaleFactor(pos: Position): number {
  const currentMonitor = monitors.find((item) => isInMonitor(pos, item));
  return currentMonitor?.scaleFactor || 1;
}

function isInMonitor(pos: Position, monitor: Monitor): boolean {
  return (
    pos.x >= monitor.position.x &&
    pos.x <= monitor.position.x + monitor.size.width &&
    pos.y >= monitor.position.y &&
    pos.y <= monitor.position.y + monitor.size.height
  );
}
