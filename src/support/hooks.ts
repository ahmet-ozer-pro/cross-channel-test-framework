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
import { AuthApi } from '../channels/api/auth-api';
import { Keys } from './store-keys';

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
  // AUTH_URL tanımlıysa önce Keycloak'tan token al, sonra authed context kur.
  // Boşsa (yerel mock / auth gerektirmeyen API) düz context ile devam et.
  if (env.AUTH_URL) {
    const authCtx = await request.newContext({ baseURL: env.BASE_URL });
    const token = await new AuthApi(authCtx).getToken(env.ADMIN_USER, env.ADMIN_PASS);
    await authCtx.dispose();

    this.setApi(
      await request.newContext({
        baseURL: env.BASE_URL,
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
    this.store.set(Keys.USER_TOKEN, token);
  } else {
    this.setApi(await request.newContext({ baseURL: env.BASE_URL }));
  }
});

Before({ tags: '@web or @cross-channel' }, async function (this: TestWorld) {
  const context = await browser.newContext();
  const page = await context.newPage();
  this.setWeb(context, page);
});

/**
 * Mobile kanalı init (Faz 4 — Appium). Seam GERÇEK ama BOŞ: env yoksa erken
 * return eder, böylece @mobile senaryolar Appium kurulmadan da dry-run'da çalışır.
 * Faz 4'te burada Appium remote() bağlanıp this.setMobile(driver) çağrılacak.
 */
Before({ tags: '@mobile' }, async function (this: TestWorld) {
  if (!env.APPIUM_URL) {
    return;
  }
  // Faz 4: const driver = await remote({ ... }); this.setMobile(driver);
});

/**
 * DB kanalı init (Faz 2 — SQL/NoSQL). Seam GERÇEK ama BOŞ: env yoksa erken return.
 * Faz 2'de burada pg/mssql/mongo client açılıp this.setDb(client) çağrılacak.
 */
Before({ tags: '@db' }, async function (this: TestWorld) {
  if (!env.DB_SQL_URL && !env.DB_NOSQL_URL) {
    return;
  }
  // TODO(Faz 2): channels/db/db-client.ts'teki DbClient ile BİRLEŞTİR.
  // Şu an iki koordinesiz iskelet var: DbClient (querySql stub) + World._db (unknown seam).
  // Faz 2: const client = new DbClient(...); await client.connect?.(); this.setDb(client);
});

/**
 * Teardown — HER senaryo için çalışır.
 * SIRA ÖNEMLİ (bozma): (1) üretilen test verisini temizle, (2) API context'i
 * dispose et, (3) web context'i kapat, (4) en son store'u sıfırla.
 * API dispose cleanup.runAll()'dan SONRA olmalı — cleanup adımları this.api'yi
 * (silme istekleri için) kullanır; store.clear()'dan ÖNCE olmalı.
 */
After(async function (this: TestWorld) {
  await this.cleanup.runAll();

  if (this.apiContext) {
    await this.apiContext.dispose();
  }

  if (this.webContext) {
    await this.webContext.close();
  }

  this.store.clear();
});
