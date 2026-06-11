import type { Page, Locator } from '@playwright/test';
import { resolve } from '../../support/resilient-locator';

/**
 * DocumentListPage (Page Object Model)
 * Web kanalı evrak listesi sayfası.
 *
 * Locator stratejisi: önce stabil testId, kırılırsa metin tabanlı fallback.
 * Dirençli arama resilient-locator üzerinden — self-healing temeli buradan gelir.
 */
export class DocumentListPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/documents');
  }

  /** Evrak numarasına göre liste satırını dirençli şekilde bulur. */
  async rowByDocumentNumber(documentNumber: string): Promise<Locator> {
    return resolve(this.page, [
      {
        describe: `testId=document-list içinde "${documentNumber}"`,
        locate: (p) => p.getByTestId('document-list').getByText(documentNumber),
      },
      {
        describe: `role=row, name="${documentNumber}"`,
        locate: (p) => p.getByRole('row', { name: documentNumber }),
      },
      {
        describe: `metin="${documentNumber}"`,
        locate: (p) => p.getByText(documentNumber),
      },
    ]);
  }
}
