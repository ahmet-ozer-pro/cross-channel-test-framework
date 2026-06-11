import { createBdd } from 'playwright-bdd';
import { test, expect } from '../core/fixtures/test-fixtures';
import { createIssue } from '../tasks/issue-tasks';
import { IssueBoardPage } from '../adapters/web/issue-board.page';
import { Keys } from '../support/store-keys';

/**
 * Issue step-definition'ları (ADR-0001) — Gherkin'i mimariye bağlayan ince katman.
 *
 * createBdd(test): step'lere BİZİM fixtures'ımızı (issuePort/store/cleanup/page) enjekte
 * eder → ayrı bir World/god-object YOK. Step kodu somut adapter'a değil PORT'a + task'a
 * bağlanır (tool-bağımsız). Senaryo state'i tipli store ile taşınır: When push'lar, Then
 * okur (kanallar arası tek meşru kanal).
 */
const { Given, When, Then } = createBdd(test);

Given('API erişimi olan bir kullanıcı', async () => {
  // apiRequest fixture auth/token akışını kendi içinde kurar; ek hazırlık gerekmez.
});

When('API ile yeni bir issue oluşturulur', async ({ issuePort, store, cleanup }) => {
  // Task: üret + cleanup kaydı + store'a biriktir (üretim disiplini tek çağrıda).
  await createIssue({ issuePort, store, cleanup });
});

Then('issue board\'da o issue görünür', async ({ page, store }) => {
  const issue = store.last(Keys.CREATED_ISSUES);
  const board = new IssueBoardPage(page);
  await board.open();

  const card = await board.cardByKey(issue.key);
  await expect(card).toBeVisible();
});
