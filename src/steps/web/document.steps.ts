import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestWorld } from '../../support/world';
import { Keys } from '../../support/store-keys';
import { DocumentListPage } from '../../channels/web/document-list.page';

/**
 * Web kanalı step'leri.
 * KURAL: yalnızca this.page kullanır; API kanalının store'a yazdığını OKUR.
 */

When('web kanalında evrak listesi açılır', async function (this: TestWorld) {
  const page = new DocumentListPage(this.page);
  await page.open();
});

Then('API\'de oluşturulan evrak web listesinde görünür', async function (this: TestWorld) {
  const documentNumber = this.store.get(Keys.DOCUMENT_NUMBER);
  const page = new DocumentListPage(this.page);
  const row = await page.rowByDocumentNumber(documentNumber);
  await expect(row).toBeVisible();
});
