import { test, expect } from '../../src/core/fixtures/test-fixtures';

/**
 * Framework smoke (domain-BAĞIMSIZ) — fixture harness'ının yüklendiğini doğrular.
 * Gerçek backend/browser GEREKTİRMEZ. Domain spec'leri tests/<domain>/ altına gelir
 * (örn. tests/issue/create-issue.spec.ts). Bu test, runner gate'i anlamlı tutar.
 */
test('@smoke fixture harness yüklenir', async ({ store, cleanup }) => {
  expect(store).toBeTruthy();
  expect(cleanup).toBeTruthy();
});
