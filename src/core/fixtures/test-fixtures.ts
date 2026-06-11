import { test as base, request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { TypedStore } from '../../support/store';
import { CleanupRegistry } from '../../support/cleanup-registry';
import { DocumentApiAdapter } from '../../adapters/api/document.api-adapter';
import type { DocumentPort } from '../ports/document-port';
import { env } from '../../support/config/env';

/**
 * Test fixtures = dependency injection (ADR-0001).
 *
 * GOD-OBJECT PANZEHİRİ: Tek bir TestWorld'e her şeyi yığmak yerine her yetenek KENDİ
 * küçük, tek-sorumluluklu fixture'ı. Her fixture lazy (sadece kullanan test açar) ve
 * otomatik teardown'lı. Yeni kanal = yeni küçük fixture; mevcutları şişirmez.
 *
 * Kanal izolasyonu: kanallar arası state YALNIZCA `store` üzerinden taşınır.
 * Tool-bağlı kurulum (request context vb.) burada; testler bunu görmez.
 */
type TestFixtures = {
  /** Kanallar arası tipli state (chaining). */
  store: TypedStore;
  /** Üretilen verinin temizliği — teardown'da otomatik (LIFO) koşar. */
  cleanup: CleanupRegistry;
  /** Düşük seviye API request context (auto-dispose). */
  apiRequest: APIRequestContext;
  /** Evrak kanalı — port; somut adapter buraya enjekte edilir. */
  documentPort: DocumentPort;
};

export const test = base.extend<TestFixtures>({
  store: async ({}, use) => {
    await use(new TypedStore());
  },

  cleanup: async ({}, use) => {
    const registry = new CleanupRegistry();
    await use(registry);
    // Üretilen tüm veriyi senaryo sonunda temizle (cleanup disiplini korunur).
    await registry.runAll();
  },

  apiRequest: async ({}, use) => {
    const context = await playwrightRequest.newContext({ baseURL: env.BASE_URL });
    await use(context);
    await context.dispose();
  },

  documentPort: async ({ apiRequest }, use) => {
    await use(new DocumentApiAdapter(apiRequest));
  },
});

export { expect } from '@playwright/test';
