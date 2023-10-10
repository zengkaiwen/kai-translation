import { ITranslateParams, TLanguage } from '@/common/constants';
import { ResponseType, getClient, Body } from '@tauri-apps/api/http';
import type { Client } from '@tauri-apps/api/http';

interface ITranslateData {
  translation: string;
  detected_language: string;
  probability: number;
  base_resp: {
    status_code: number;
    status_message: string;
  };
}

let _client: Client;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';

async function initClient(): Promise<Client> {
  if (_client) return _client;
  _client = await getClient();
  return _client;
}

export async function translate(params: ITranslateParams): Promise<string> {
  try {
    const client = await initClient();
    const res = await client.post<ITranslateData>(
      'https://translate.volcengine.com/crx/translate/v1',
      Body.json({
        source_language: params.source,
        target_language: params.target,
        text: params.text,
      }),
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json',
        },
        responseType: ResponseType.JSON,
      },
    );
    console.log('火山翻译', res);
    if (res.data.base_resp.status_code === 0) {
      return res.data.translation;
    }
    return '';
  } catch (error) {
    console.error('火山翻译出错', error);
    return '';
  }
}
