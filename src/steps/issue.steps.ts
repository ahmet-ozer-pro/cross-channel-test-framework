import { createBdd } from 'playwright-bdd';
import { test } from '../core/fixtures/test-fixtures';
import { createIssue } from '../tasks/issue-tasks';
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

Then('issue board\'da o issue görünür', async ({ issueBoard, store }) => {
  const issue = store.last(Keys.CREATED_ISSUES);
  // Web kanalı PORT üzerinden: somut POM ve raw locator/expect dışarı sızmaz (ADR kural 2/4).
  await issueBoard.open();
  await issueBoard.expectCardVisible(issue.key);
});
