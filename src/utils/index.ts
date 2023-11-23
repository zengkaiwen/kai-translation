import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/shell';
import { OsType, type } from '@tauri-apps/api/os';
import { Code2Language, TCode, TLanguage } from '@/common/constants';
import dayjs from 'dayjs';

/** rust调试输出 */
export function rConsoleLog(text: string) {
  invoke('console_log', { text, time: dayjs().format('HH:mm:ss.SSS') });
}

/** 调用阿里巴巴翻译源 */
export function rTranslate(source: TLanguage, target: TLanguage, text: string) {
  return invoke('alibaba_transform', {
    source,
    target,
    text,
  }) as Promise<string>;
}

export function rBrotilParse(data: string) {
  console.log('data: ', data);
  return invoke('brotli_parse', { data }) as Promise<string>;
}

/** 获取物理像素上的鼠标位置 */
export function rGetMousePosition() {
  return invoke('get_mouse_position') as Promise<[number, number]>;
}

/** 自动执行 ctrl+c 复制文案 */
export const rAutoCopy = async () => {
  return invoke('auto_copy');
};

/** 获取唯一 uuid */
export const uuidv4 = () => {
  const UINT36 = '10000000-1000-4000-8000-100000000000';
  // eslint-disable-next-line no-bitwise
  const random = (x: string) => ((Number(x) ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> (Number(x) / 4);
  return UINT36.replace(/[018]/g, (x) => random(x)!.toString(16));
};

/** 使用系统默认浏览器打开网页 */
export const openUrlByDefaultBrowser = (url: string) => {
  return open(url);
};

let osType: OsType;
/**
 * 获取系统类型
 */
export const getOsType = async (): Promise<OsType> => {
  if (osType) return osType;
  const _osType = await type();
  osType = _osType;
  return _osType;
};

/** 获取句子文本的语言类型，如果返回的 auto 表示识别失败 */
export const getTextLang = async (text: string): Promise<TLanguage> => {
  const res = (await invoke('get_text_lang', { text })) as TCode;
  console.log(`识别【${text}】为`, res);
  if (res && Code2Language[res]) {
    return Code2Language[res];
  }
  return 'auto';
};
