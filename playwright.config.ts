import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright Test yapılandırması (ADR-0001 — runner = Playwright Test).
 *
 * Ölçek (10k) için: fullyParallel + CI'da retry + sharding'e hazır (CI'da --shard=i/N).
 * trace 'on-first-retry' → flake teşhisi. Gerçek e2e koşusu backend ister; CI'da
 * sadece keşif (--list) çalışır (bkz. .github/workflows). cucumber-js köprüde ayrı koşar.
 */
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'web', use: { ...devices['Desktop Chrome'] } },
  ],
});
