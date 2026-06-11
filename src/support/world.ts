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
  // mobile / db: seam HAZIR, tip placeholder (unknown). Gerçek tip Faz 2/4'te
  // (Appium Browser / pg|mssql|mongo client) bağlanınca daraltılır.
  private _mobile?: unknown;
  private _db?: unknown;

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
  /**
   * Throw etmeyen erişimci — teardown'da kullanılır. `get api()` set edilmemişse
   * fırlatır; After hook'u ise API açılmamış (web-only) senaryoda da çalışır,
   * bu yüzden dispose için sessiz undefined döndüren bu yol gerekir.
   */
  get apiContext(): APIRequestContext | undefined {
    return this._api;
  }

  // --- Mobile kanalı (Faz 4 — Appium) ---
  get mobile(): unknown {
    if (!this._mobile) {
      throw new Error(
        '[World] Mobile kanalı initialize edilmedi. Senaryoya @mobile tag ekle (Faz 4).',
      );
    }
    return this._mobile;
  }
  setMobile(driver: unknown): void {
    this._mobile = driver;
  }

  // --- DB kanalı (Faz 2 — SQL/NoSQL) ---
  // TODO(Faz 2): unknown → DbClient daralt. Şu an db-client.ts'teki DbClient ile
  // bu seam koordinesiz; Faz 2'de tip DbClient olmalı ve hooks.ts @db hook'u onu set etmeli.
  get db(): unknown {
    if (!this._db) {
      throw new Error(
        '[World] DB kanalı initialize edilmedi. Senaryoya @db tag ekle (Faz 2).',
      );
    }
    return this._db;
  }
  setDb(client: unknown): void {
    this._db = client;
  }
}

setWorldConstructor(TestWorld);
