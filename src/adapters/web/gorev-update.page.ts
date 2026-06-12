import { type Page, expect } from '@playwright/test';
import { timeouts } from '../../support/config/timeouts';
import { selectDropdownOption } from './primereact';
import type { GorevUpdatePort } from '../../core/ports/gorev-web-ports';

/**
 * GorevUpdatePage — "Görev Güncelle" dialog'u (GorevUpdatePort): durum (#status) seç + kaydet.
 * Dialog: #taskDialog. Durum dropdown'u ortak helper'dan (DRY), TR-fold ile "Islemde"→"İşlemde".
 * DOĞRULA: dialog kaydet/güncelle butonunun id'si verilmedi (HTML truncate) → role+isim ile dirençli.
 */
const DIALOG = '#taskDialog';

export class GorevUpdatePage implements GorevUpdatePort {
  constructor(private readonly page: Page) {}

  async setStatus(label: string): Promise<void> {
    await expect(this.page.locator(DIALOG)).toBeVisible({ timeout: timeouts.expect });
    await selectDropdownOption(this.page, 'status', label);
  }

  async submit(): Promise<void> {
    await this.page
      .locator(DIALOG)
      .getByRole('button', { name: /Kaydet|Güncelle/ })
      .first()
      .click();
  }
}
