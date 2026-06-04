import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestWorld } from '../../support/world';
import { Keys } from '../../support/store-keys';
import { DocumentListPage } from '../../channels/web/document-list.page';

/**
 * Web kanalı step'leri.
 * KURAL: Bu dosya yalnızca this.page kullanır; this.api'ye iş mantığı için dokunmaz.
 * API kanalının store'a yazdığı veriyi tipli anahtarla OKUR.
 */

When('web kanalında evrak listesi açılır', async function (this: TestWorld) {
  const page = new DocumentListPage(this.page);
  await page.open();
});

Then('API\'de oluşturulan evrak web listesinde görünür', async function (this: TestWorld) {
  // API step'inin yazdığı değeri okuyoruz — tip garantili.
  const documentNumber = this.store.get(Keys.DOCUMENT_NUMBER);

  const page = new DocumentListPage(this.page);
  await expect(page.rowByDocumentNumber(documentNumber)).toBeVisible();
});

