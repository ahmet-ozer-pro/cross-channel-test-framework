import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import 'dotenv/config';

/**
 * Playwright Test yapılandırması (ADR-0001 — runner = Playwright Test).
 *
 * BDD/Gherkin KORUNUR: playwright-bdd `.feature` senaryolarını Playwright Test'in ÜSTÜNDE
 * derler (defineBddConfig). Böylece tek runner'da hem iş-okunur Gherkin hem de saf
 * `.spec.ts` YAN YANA koşar; fixtures/sharding/trace/retry hepsi ortak.
 *
 * Ölçek (10k) için: fullyParallel + CI'da retry + sharding'e hazır (CI'da --shard=i/N).
 * trace 'on-first-retry' → flake teşhisi. Gerçek e2e koşusu backend ister; CI'da
 * sadece keşif (--list) çalışır (bkz. .github/workflows).
 */
const bddTestDir = defineBddConfig({
  features: 'tests/**/*.feature',
  // Step tanımları + custom test instance'ı (fixtures) içerir; playwright-bdd hangi
  // extend'lenmiş test'i kullanacağını buradan keşfeder.
  steps: ['src/steps/**/*.ts', 'src/core/fixtures/test-fixtures.ts'],
  outputDir: '.features-gen',
});

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    // Gherkin senaryoları (playwright-bdd ile derlenen) — iş-okunur cross-channel akış.
    { name: 'web', testDir: bddTestDir, use: { ...devices['Desktop Chrome'] } },
    // Saf .spec.ts — framework self-test'leri; Gherkin'le AYNI runner'da yan yana.
    { name: 'framework', testDir: 'tests/framework', use: { ...devices['Desktop Chrome'] } },
  ],
});
