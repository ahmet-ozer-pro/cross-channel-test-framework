import type { Page, Locator } from '@playwright/test';
import { resolve } from '../../support/resilient-locator';

/**
 * IssueBoardPage (Page Object) — web kanalı issue board'u (ADR-0001 web adapter'ı).
 *
 * Locator stratejisi: önce stabil testId, kırılırsa role/metin fallback.
 * Dirençli arama resilient-locator üzerinden — strict-mode için .first() orada uygulanır.
 */
export class IssueBoardPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/board');
  }

  /** Issue anahtarına göre board kartını dirençli şekilde bulur. */
  async cardByKey(issueKey: string): Promise<Locator> {
    return resolve(this.page, [
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
  }
}
