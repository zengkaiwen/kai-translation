import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/shell';
import { TLanguage } from '@/common/constants';

export function rConsoleLog(text: string) {
  invoke('console_log', { text });
}

export function rTranslate(source: TLanguage, target: TLanguage, text: string) {
  return invoke('alibaba_transform', {
    source,
    target,
    text,
  }) as Promise<string>;
}

export function rGetMousePosition() {
  return invoke('get_mouse_position') as Promise<[number, number]>;
}

export const uuidv4 = () => {
  const UINT36 = '10000000-1000-4000-8000-100000000000';
  // eslint-disable-next-line no-bitwise
  const random = (x: string) => ((Number(x) ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> (Number(x) / 4);
  return UINT36.replace(/[018]/g, (x) => random(x)!.toString(16));
};

export const openUrlByDefaultBrowser = (url: string) => {
  return open(url);
};
