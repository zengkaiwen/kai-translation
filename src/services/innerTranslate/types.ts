import { ITranslateParams } from '@/common/constants';
import type { Client } from '@tauri-apps/api/http';
import { getClient } from '@tauri-apps/api/http';

export class InnterTranslate {
  protected _client: Client | null = null;
  protected _userAgent: string =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';

  private async _initClient(): Promise<Client> {
    if (this._client) {
      return this._client;
    }
    this._client = await getClient();
    return this._client;
  }

  public async translate(params?: ITranslateParams): Promise<string | void> {
    await this._initClient();
  }
}
