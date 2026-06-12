import { type Page, expect } from '@playwright/test';
import { resolve } from '../../support/resilient-locator';
import { timeouts } from '../../support/config/timeouts';
import type { IssueBoardPort } from '../../core/ports/issue-board-port';

/**
 * IssueBoardPage (Page Object) — IssueBoardPort'un web/Playwright implementasyonu (ADR-0001).
 *
 * TOOL-BAĞLI kod yalnızca burada. Step/task port'a bağlanır; bu sınıfı new'lemez (fixture
 * enjekte eder). Locator stratejisi: önce stabil testId, kırılırsa role/metin fallback —
 * dirençli arama resilient-locator üzerinden (strict-mode için .first() orada). Bekleme
 * süreleri merkezi timeouts'tan; sihirli ms yok, hard-wait yok (auto-wait).
 */
export class IssueBoardPage implements IssueBoardPort {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/board', { timeout: timeouts.navigation });
  }

  async expectCardVisible(issueKey: string): Promise<void> {
    const card = await resolve(this.page, [
      {
        describe: `testId=issue-board içinde "${issueKey}"`,
        locate: (p) => p.getByTestId('issue-board').getByText(issueKey),
      },
      {
        describe: `role=article, name="${issueKey}"`,
        locate: (p) => p.getByRole('article', { name: issueKey }),
      },
      {
        describe: `metin="${issueKey}"`,
        locate: (p) => p.getByText(issueKey),
      },
    ]);
    // Web-first assertion: auto-wait timeouts.expect'e kadar; Locator dışarı sızmaz.
    await expect(card).toBeVisible({ timeout: timeouts.expect });
  }
}
