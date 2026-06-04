import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page, APIRequestContext } from '@playwright/test';
import { TypedStore } from './store';
import { CleanupRegistry } from './cleanup-registry';

/**
 * TestWorld
 * ---------
 * Senaryonun tüm state'inin tek sahibi. Her senaryo için yeni bir örnek oluşur.
 *
 * Mimari guardrail'lar:
 *  - Kanal handle'ları (page, api, mobile, db) LAZY: ilgili tag'li hook
 *    tarafından initialize edilir. İstenmeyen kanal hiç açılmaz.
 *  - Getter'lar handle yoksa AÇIKLAYICI hata fırlatır. Bir step yanlış kanalın
 *    objesine dokunursa cryptic null yerine net mesaj alırsın.
 *  - store ve cleanup tüm kanallarca paylaşılır; kanallar arası iletişim
 *    SADECE store üzerinden olur (kanal izolasyonu).
 */
export class TestWorld extends World {
  readonly store = new TypedStore();
  readonly cleanup = new CleanupRegistry();

  // --- lazy channel handle'lar ---
  private _webContext?: BrowserContext;
  private _page?: Page;
  private _api?: APIRequestContext;
  // mobile / db handle'ları stub fazda eklenecek (any yerine ileride tipli)

  constructor(options: IWorldOptions) {
    super(options);
  }

  // --- Web kanalı ---
  get page(): Page {
    if (!this._page) {
      throw new Error(
        '[World] Web kanalı initialize edilmedi. Senaryoya @web (veya @cross-channel) tag ekle.',
      );
    }
    return this._page;
  }
  setWeb(context: BrowserContext, page: Page): void {
    this._webContext = context;
    this._page = page;
  }
  get webContext(): BrowserContext | undefined {
    return this._webContext;
  }

  // --- API kanalı ---
  get api(): APIRequestContext {
    if (!this._api) {
      throw new Error(
        '[World] API kanalı initialize edilmedi. Senaryoya @api (veya @cross-channel) tag ekle.',
      );
    }
    return this._api;
  }
  setApi(context: APIRequestContext): void {
    this._api = context;
  }
}

setWorldConstructor(TestWorld);
