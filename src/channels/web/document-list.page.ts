import type { Page, Locator } from '@playwright/test';

/**
 * DocumentListPage (STUB - Page Object Model)
 * -------------------------------------------
 * Web kanalı evrak listesi sayfası.
 *
 * Locator stratejisi (self-healing temelini atan kural):
 *  - Önce getByRole / getByLabel / getByTestId (semantic, stabil).
 *  - CSS/XPath son çare. Kırılgan selector self-healing ile yamanmaz, kökten yazılır.
 */
export class DocumentListPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/documents');
  }

  /** Evrak numarasına göre liste satırını döner (stabil testId tabanlı). */
  rowByDocumentNumber(documentNumber: string): Locator {
    return this.page.getByTestId('document-list').getByText(documentNumber);
  }
}
