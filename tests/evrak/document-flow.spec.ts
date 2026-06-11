import { randomUUID } from 'node:crypto';
import { test, expect } from '../../src/core/fixtures/test-fixtures';
import { DocumentListPage } from '../../src/channels/web/document-list.page';

/**
 * REFERANS DESEN (ADR-0001 / Faz A) — yeni her senaryo bunu çoğaltır.
 *
 * - Cross-channel orkestrasyonu test seviyesinde: API üretir (port), Web doğrular (POM).
 * - Test SOMUT client'a değil PORT'a (documentPort) bağlı — tool-bağımsız.
 * - Üretilen veri üretimle AYNI yerde cleanup'a kaydedilir (fixture teardown'da koşar).
 * - @e2e: gerçek backend ister; CI bunu RUN etmez, sadece keşfeder (--list).
 */
test('@e2e API ile üretilen evrak web listesinde görünür', async ({ documentPort, cleanup, page }) => {
  const doc = await documentPort.createIncoming(`Test Evrak ${randomUUID()}`);
  cleanup.register(() => documentPort.delete(doc.id));

  const documentList = new DocumentListPage(page);
  await documentList.open();

  const row = await documentList.rowByDocumentNumber(doc.documentNumber);
  await expect(row).toBeVisible();
});
