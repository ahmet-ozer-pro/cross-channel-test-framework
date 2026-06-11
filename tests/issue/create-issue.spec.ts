import { test, expect } from '../../src/core/fixtures/test-fixtures';
import { createIssue } from '../../src/tasks/issue-tasks';
import { IssueBoardPage } from '../../src/adapters/web/issue-board.page';

/**
 * REFERANS DESEN (ADR-0001) — yeni her senaryo bunu çoğaltır.
 *
 * - Cross-channel orkestrasyonu test seviyesinde: API üretir (port), Web doğrular (POM).
 * - Test SOMUT adapter'a değil PORT'a (issuePort) + task'a bağlı — tool-bağımsız.
 * - Üretim + cleanup kaydı `createIssue` task'ında (fixture teardown'da koşar).
 * - @e2e: gerçek backend ister; CI bunu RUN etmez, sadece keşfeder (--list).
 */
test('@e2e API ile oluşturulan issue board\'da görünür', async ({ issuePort, store, cleanup, page }) => {
  const issue = await createIssue({ issuePort, store, cleanup });

  const board = new IssueBoardPage(page);
  await board.open();

  const card = await board.cardByKey(issue.key);
  await expect(card).toBeVisible();
});
