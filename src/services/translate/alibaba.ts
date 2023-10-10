import { ITranslateParams, TLanguage } from '@/common/constants';
import { ResponseType, getClient, Body } from '@tauri-apps/api/http';
import type { Client } from '@tauri-apps/api/http';

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
    /**
     * 获取 csrftoken
     */
    const res1 = await client.get<CsrfToken>('https://translate.alibaba.com/api/translate/csrftoken', {
      headers: {
        'User-Agent': USER_AGENT,
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
    const res = await client.post<ITranslateData>('https://translate.alibaba.com/api/translate/text', Body.form(form), {
      headers: {
        'User-Agent': USER_AGENT,
        [headerName]: token,
        'Content-Type': 'multipart/form-data',
      },
      responseType: ResponseType.JSON,
    });
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
