import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, request, type Browser } from '@playwright/test';
import { TestWorld } from './world';
import { env } from './config/env';

setDefaultTimeout(60_000);

// Tüm suite için tek browser (her senaryo izole context alır).
let browser: Browser;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: env.HEADLESS });
});

AfterAll(async () => {
  await browser?.close();
});

/**
 * Tag bazlı kanal init.
 * @cross-channel tag'i hem API hem Web kanalını açar.
 * Sadece ihtiyaç duyulan kanal initialize edilir — gereksiz kaynak açılmaz.
 */

Before({ tags: '@api or @cross-channel' }, async function (this: TestWorld) {
  const api = await request.newContext({ baseURL: env.BASE_URL });
  this.setApi(api);
});

Before({ tags: '@web or @cross-channel' }, async function (this: TestWorld) {
  const context = await browser.newContext();
  const page = await context.newPage();
  this.setWeb(context, page);
});

// @mobile ve @db hook'ları stub fazda eklenecek:
// Before({ tags: '@mobile' }, async function (this: TestWorld) { ... Appium remote() ... });
// Before({ tags: '@db' },     async function (this: TestWorld) { ... pg/mssql/mongo ... });

/**
 * Teardown — HER senaryo için çalışır.
 * Sıra önemli: önce üretilen test verisini temizle, sonra context'leri kapat,
 * en son store'u sıfırla.
 */
After(async function (this: TestWorld) {
  await this.cleanup.runAll();

  if (this.webContext) {
    await this.webContext.close();
  }

  this.store.clear();
});
