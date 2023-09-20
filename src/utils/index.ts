import { invoke } from '@tauri-apps/api/tauri';
import { TLanguage } from '../common/constants';

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
