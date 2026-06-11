import { randomUUID } from 'node:crypto';
import { Given } from '@cucumber/cucumber';
import { TestWorld } from '../../support/world';
import { Keys } from '../../support/store-keys';
import { DocumentApi } from '../../channels/api/document-api';

/** Benzersiz evrak başlığı — paralel worker'larda çakışmaz (randomUUID). */
function uniqueTitle(): string {
  return `Test Evrak ${randomUUID()}`;
}

/**
 * API kanalı step'leri.
 * KURAL: Bu dosya yalnızca this.api kullanır; this.page'e ASLA dokunmaz.
 * Ürettiği veriyi store'a yazar ve cleanup'ını HEMEN kaydeder.
 */

Given('API üzerinden yeni bir gelen evrak oluşturulmuştur', async function (this: TestWorld) {
  const documentApi = new DocumentApi(this.api);
  // UNIQUENESS KURALI (parallel güvenliği): randomUUID() worker'dan bağımsız benzersiz başlık.
  const doc = await documentApi.createIncomingDocument(uniqueTitle());

  // Web/Mobile kanalları buradan okuyacak — tipli anahtarlarla.
  this.store.set(Keys.DOCUMENT_ID, doc.id);
  this.store.set(Keys.DOCUMENT_NUMBER, doc.documentNumber);

  // Üretimle aynı yerde cleanup kaydı — teardown disiplini.
  this.cleanup.register(async () => {
    await documentApi.deleteDocument(doc.id);
  });
});

Given(
  'API üzerinden {int} yeni gelen evrak oluşturulmuştur',
  async function (this: TestWorld, count: number) {
    const documentApi = new DocumentApi(this.api);

    // N benzersiz evrak üret; her birini KOLEKSIYONA biriktir ve üretimle aynı
    // yerde cleanup kaydet. Web kanalı getAll(CREATED_DOCUMENTS) ile hepsini okuyacak.
    for (let i = 0; i < count; i++) {
      const doc = await documentApi.createIncomingDocument(uniqueTitle());
      this.store.push(Keys.CREATED_DOCUMENTS, doc);
      this.cleanup.register(async () => {
        await documentApi.deleteDocument(doc.id);
      });
    }
  },
);
