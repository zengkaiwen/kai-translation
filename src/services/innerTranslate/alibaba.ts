import { ITranslateParams, TLanguage } from '@/common/constants';
import { ResponseType, Body } from '@tauri-apps/api/http';
import type { Client } from '@tauri-apps/api/http';
import { InnterTranslate } from './types';
import { rConsoleLog } from '@/utils';

interface CsrfToken {
  token: string;
  parameterName: string;
  headerName: string;
}

interface ITranslateData {
  code: string;
  data: {
    detectLanguage: TLanguage;
    translateText: string;
  };
  httpStatusCode: number;
  message: string;
  requestId: string;
  success: boolean;
}

export class AlibabaInnerTranslate extends InnterTranslate {
  public async translate(params: ITranslateParams): Promise<string> {
    rConsoleLog('alibaba tarnslate engine');
    await super.translate();
    const client = this._client as Client;
    try {
      /**
       * 获取 csrftoken
       */
      const res1 = await client.get<CsrfToken>('https://translate.alibaba.com/api/translate/csrftoken', {
        headers: {
          'User-Agent': this._userAgent,
        },
        responseType: ResponseType.JSON,
      });
      // console.log('csrfToken：', res1.data);
      const { token, parameterName, headerName } = res1.data;
      /**
       * 发起翻译请求
       */
      const form = new FormData();
      form.append('srcLang', params.source);
      form.append('tgtLang', params.target);
      form.append('domain', 'general');
      form.append('query', params.text);
      form.append(parameterName, token);
      const res = await client.post<ITranslateData>(
        'https://translate.alibaba.com/api/translate/text',
        Body.form(form),
        {
          headers: {
            'User-Agent': this._userAgent,
            [headerName]: token,
            'Content-Type': 'multipart/form-data',
          },
          responseType: ResponseType.JSON,
        },
      );
      // console.log('翻译后的内容：', res);
      if (res.data?.success) {
        return res.data.data.translateText;
      }
      return '';
    } catch (error) {
      console.error('Alibaba爬虫失败：', error);
      return '';
    }
  }
}
