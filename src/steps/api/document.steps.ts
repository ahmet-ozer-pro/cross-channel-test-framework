import { Given } from '@cucumber/cucumber';
import { TestWorld } from '../../support/world';
import { Keys } from '../../support/store-keys';
import { DocumentApi } from '../../channels/api/document-api';

/**
 * API kanalı step'leri.
 * KURAL: Bu dosya yalnızca this.api kullanır; this.page'e ASLA dokunmaz.
 * Ürettiği veriyi store'a yazar ve cleanup'ını HEMEN kaydeder.
 */

Given('API üzerinden yeni bir gelen evrak oluşturulmuştur', async function (this: TestWorld) {
  const documentApi = new DocumentApi(this.api);
  const doc = await documentApi.createIncomingDocument(`Test Evrak ${Date.now()}`);

  // Web/Mobile kanalları buradan okuyacak — tipli anahtarlarla.
  this.store.set(Keys.DOCUMENT_ID, doc.id);
  this.store.set(Keys.DOCUMENT_NUMBER, doc.documentNumber);

  // Üretimle aynı yerde cleanup kaydı — teardown disiplini.
  this.cleanup.register(async () => {
    await documentApi.deleteDocument(doc.id);
  });
});
