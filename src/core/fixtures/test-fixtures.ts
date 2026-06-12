// base = playwright-bdd'nin test'i (Playwright Test'in süpersetı): hem .feature step'leri
// hem saf .spec.ts AYNI fixtures üzerinde koşsun diye (ADR-0001 — tek runner, BDD korunur).
import { test as base } from 'playwright-bdd';
import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { TypedStore } from '../../support/store';
import { CleanupRegistry } from '../../support/cleanup-registry';
import { classifyError } from '../../support/flaky';
import { AuthApi } from '../../adapters/api/auth-api';
import { IssueApiAdapter } from '../../adapters/api/issue.api-adapter';
import { IssueBoardPage } from '../../adapters/web/issue-board.page';
import { LoginPage } from '../../adapters/web/login.page';
import { AppShellPage } from '../../adapters/web/app-shell.page';
import { GorevFormPage } from '../../adapters/web/gorev-form.page';
import { GorevListPage } from '../../adapters/web/gorev-list.page';
import { GorevUpdatePage } from '../../adapters/web/gorev-update.page';
import type { IssuePort } from '../ports/issue-port';
import type { IssueBoardPort } from '../ports/issue-board-port';
import type {
  LoginPort,
  AppShellPort,
  GorevFormPort,
  GorevListPort,
  GorevUpdatePort,
} from '../ports/gorev-web-ports';
import { env } from '../../support/config/env';

/**
 * Test fixtures = dependency injection (ADR-0001) — TEK runner Playwright Test.
 *
 * GOD-OBJECT PANZEHİRİ: Tek bir mega-context'e her şeyi yığmak yerine her yetenek KENDİ
 * küçük, tek-sorumluluklu fixture'ı. Her fixture lazy (sadece kullanan test açar) ve
 * otomatik teardown'lı. Yeni kanal = yeni küçük fixture; mevcutları şişirmez.
 *
 * Kanal izolasyonu: kanallar arası state YALNIZCA `store` üzerinden taşınır.
 * Tool-bağlı kurulum (request context, auth vb.) burada; testler bunu görmez.
 */
type TestFixtures = {
  /** Kanallar arası tipli state (chaining). */
  store: TypedStore;
  /** Üretilen verinin temizliği — teardown'da otomatik (LIFO) koşar. */
  cleanup: CleanupRegistry;
  /** Düşük seviye API request context (auto-dispose). Domain adapter'ları bunu kullanır. */
  apiRequest: APIRequestContext;
  /** Issue API kanalı — port; somut adapter fixture ile enjekte edilir. */
  issuePort: IssuePort;
  /** Issue web kanalı — port; somut POM (IssueBoardPage) fixture ile enjekte edilir. */
  issueBoard: IssueBoardPort;
  /** Görev (task) web kanalı port'ları — somut POM'lar fixture ile enjekte edilir. */
  loginPage: LoginPort;
  appShell: AppShellPort;
  gorevForm: GorevFormPort;
  gorevList: GorevListPort;
  gorevUpdate: GorevUpdatePort;
};

export const test = base.extend<TestFixtures>({
  store: async ({}, use, testInfo) => {
    const store = new TypedStore();
    await use(store);
    // DUMP-ON-FAILURE (#5): test çöktüyse store'un okunur anlık görüntüsünü + hata
    // taksonomisini (#6) teşhise ekle. Sensitive maskelenir. Cross-channel debug'ı kısaltır.
    if (testInfo.status !== testInfo.expectedStatus) {
      const snapshot = {
        flakeReason: classifyError(testInfo.error), // timeout/locator/data/network/unknown
        store: store.dump(),
      };
      testInfo.attachments.push({
        name: 'store-dump',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(snapshot, null, 2), 'utf-8'),
      });
    }
  },

  cleanup: async ({}, use) => {
    const registry = new CleanupRegistry();
    await use(registry);
    // Üretilen tüm veriyi senaryo sonunda temizle (cleanup disiplini korunur).
    await registry.runAll();
  },

  apiRequest: async ({}, use) => {
    // AUTH_URL tanımlıysa önce token al, sonra authed context kur (eski hooks'tan taşındı).
    // Boşsa (auth gerektirmeyen API / yerel mock) düz context.
    const extraHTTPHeaders: Record<string, string> = {};
    if (env.AUTH_URL) {
      const authContext = await playwrightRequest.newContext({ baseURL: env.BASE_URL });
      const token = await new AuthApi(authContext).getToken(env.ADMIN_USER, env.ADMIN_PASS);
      await authContext.dispose();
      extraHTTPHeaders.Authorization = `Bearer ${token}`;
    }
    const context = await playwrightRequest.newContext({ baseURL: env.BASE_URL, extraHTTPHeaders });
    await use(context);
    await context.dispose();
  },

  issuePort: async ({ apiRequest }, use) => {
    await use(new IssueApiAdapter(apiRequest));
  },

  issueBoard: async ({ page }, use) => {
    // Web POM port arkasında enjekte edilir → step/task IssueBoardPage'i new'lemez (ADR kural 2).
    await use(new IssueBoardPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  appShell: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },
  gorevForm: async ({ page }, use) => {
    await use(new GorevFormPage(page));
  },
  gorevList: async ({ page }, use) => {
    await use(new GorevListPage(page));
  },
  gorevUpdate: async ({ page }, use) => {
    await use(new GorevUpdatePage(page));
  },
});

export { expect } from '@playwright/test';
