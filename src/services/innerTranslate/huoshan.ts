import { ITranslateParams } from '@/common/constants';
import { ResponseType, Body } from '@tauri-apps/api/http';
import type { Client } from '@tauri-apps/api/http';
import { InnterTranslate } from './types';
import { rConsoleLog } from '@/utils';

interface ITranslateData {
  translation: string;
  detected_language: string;
  probability: number;
  base_resp: {
    status_code: number;
    status_message: string;
  };
}

export class HuoshanInnterTranslate extends InnterTranslate {
  public async translate(params: ITranslateParams): Promise<string> {
    rConsoleLog('huoshan tarnslate engine');
    await super.translate();
    const client = this._client as Client;
    try {
      const res = await client.post<ITranslateData>(
        'https://translate.volcengine.com/crx/translate/v1',
        Body.json({
          source_language: params.source,
          target_language: params.target,
          text: params.text,
        }),
        {
          headers: {
            'User-Agent': this._userAgent,
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
}
