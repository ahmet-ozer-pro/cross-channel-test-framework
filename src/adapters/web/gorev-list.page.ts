import { type Page, type Locator, expect } from '@playwright/test';
import { timeouts } from '../../support/config/timeouts';
import type { GorevListPort } from '../../core/ports/gorev-web-ports';

/**
 * GorevListPage — görev listesi (GorevListPort): arama (#search-btn) + AG-Grid satırı.
 * DOĞRULA: AG-Grid satırına tıklamak güncelle dialog'unu açıyorsa `open` yeterli; aksi halde
 * satır içi bir aksiyon (göz/kalem ikonu) gerekebilir — canlıda teyit.
 */
export class GorevListPage implements GorevListPort {
  constructor(private readonly page: Page) {}

  async search(text: string): Promise<void> {
    const box = this.page.locator('#search-btn');
    await box.fill(text);
    await box.press('Enter');
  }

  private row(text: string): Locator {
    return this.page.locator('.ag-row', { hasText: text });
  }

  async expectListed(text: string): Promise<void> {
    await expect(this.row(text).first()).toBeVisible({ timeout: timeouts.expect });
  }

  async open(text: string): Promise<void> {
    await this.row(text).first().click({ button: 'right' });
    await this.page.getByRole('menuitem', { name: 'Güncelle' }).click();
  }
}
