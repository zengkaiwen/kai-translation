import type { ITranslateParams } from '@/common/constants';
import { InnterTranslate } from './types';
import { rBrotilParse, rConsoleLog } from '@/utils';
import { Body, Client, ResponseType } from '@tauri-apps/api/http';
import { Buffer } from 'buffer';

interface Lang {
  source_lang_user_selected: string;
  target_lang: string;
}

interface CommonJobParams {
  wasSpoken: boolean;
  transcribe_as: string;
}

interface Params {
  texts?: Text[];
  splitting: string;
  lang: Lang;
  timestamp?: number;
  commonJobParams: CommonJobParams;
}

interface Text {
  text: string;
  requestAlternatives: number;
}

interface PostData {
  jsonrpc: string;
  method: string;
  id?: number;
  params: Params;
}

interface ResData {
  jsonrpc: string;
  id: number;
  result: {
    texts: Array<{
      alternatives: [];
      text: string;
    }>;
    lang: string;
  };
}

const API_URL = 'https://www2.deepl.com/jsonrpc';

export class DeeplInnerTranslate extends InnterTranslate {
  public async translate(params: ITranslateParams): Promise<string> {
    rConsoleLog('huoshan tarnslate engine');
    await super.translate(params);
    const client = this._client as Client;
    try {
      let id = this._getRandomNumber();
      const sourceLang = params.source.toLocaleUpperCase();
      const targetLang = params.target.toLocaleUpperCase();
      id += 1;
      const postData = this._initData(sourceLang, targetLang);
      const text: Text = {
        text: params.text,
        requestAlternatives: 0,
      };
      postData.id = id;
      postData.params.texts = [text];
      postData.params.timestamp = this._getTimeStamp(this._getICount(params.text));
      let postStr = JSON.stringify(postData);
      if ((id + 5) % 29 === 0 || (id + 3) % 13 === 0) {
        postStr = postStr.replace('"method":"', '"method" : "');
      } else {
        postStr = postStr.replace('"method":"', '"method": "');
      }
      console.log(postStr);
      const postByte = Buffer.from(postStr, 'utf8');
      console.log(postByte);
      const reader = new TextDecoder().decode(postByte);
      console.log(reader);
      const res = await client.post(API_URL, Body.text(reader), {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          'x-app-os-name': 'iOS',
          'x-app-os-version': '16.3.0',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'x-app-device': 'iPhone13,2',
          'User-Agent': 'DeepL-iOS/2.9.1 iOS 16.3.0 (iPhone13,2)',
          'x-app-build': '510265',
          'x-app-version': '2.9.1',
          Connection: 'keep-alive',
        },
        responseType: ResponseType.Binary,
      });
      if (res.headers['content-encoding'] === 'br') {
        const str = await rBrotilParse((res.data as Array<number>).toString());
        const resData: ResData = JSON.parse(str);
        return resData.result.texts[0].text.normalize();
      }
      return '';
    } catch (error) {
      console.error('Deepl 翻译出错', error);
      return '';
    }
  }

  private _initData(sourceLang: string, targetLang: string): PostData {
    return {
      jsonrpc: '2.0',
      method: 'LMT_handle_texts',
      params: {
        splitting: 'newlines',
        lang: {
          source_lang_user_selected: sourceLang,
          target_lang: targetLang,
        },
        commonJobParams: {
          wasSpoken: false,
          transcribe_as: '',
        },
      },
    };
  }

  private _getICount(translateText: string): number {
    const matches = translateText.match(/i/g) || [];
    return matches.length;
  }

  private _getRandomNumber(): number {
    let num = Math.floor(Math.random() * 100000) + 8300000;
    return num * 1000;
  }

  private _getTimeStamp(iCount: number): number {
    let ts = Date.now();
    if (iCount === 0) {
      return ts;
    }
    iCount = iCount + 1;
    return ts - (ts % iCount) + iCount;
  }
}
