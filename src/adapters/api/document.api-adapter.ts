import type { APIRequestContext } from '@playwright/test';
import type { CreatedDocument, DocumentPort } from '../../core/ports/document-port';
import { DocumentApi } from '../../channels/api/document-api';

/**
 * DocumentApiAdapter — DocumentPort'un Playwright/HTTP implementasyonu (ADR-0001).
 *
 * TOOL-BAĞLI kod yalnızca burada (adapters/) yaşar. Test/task bunu bilmez; port'a bağlanır.
 *
 * GEÇİŞ NOTU: HTTP mantığı şimdilik channels/api/document-api.ts'te (cucumber yolu da
 * onu kullanıyor); burada KOMPOZİSYONLA yeniden kullanıyoruz (DRY — mantık tek yerde).
 * cucumber yolu emekliye ayrılınca HTTP mantığı bu adapter'a taşınır, channels/ silinir.
 */
export class DocumentApiAdapter implements DocumentPort {
  private readonly api: DocumentApi;

  constructor(request: APIRequestContext) {
    this.api = new DocumentApi(request);
  }

  createIncoming(title: string): Promise<CreatedDocument> {
    return this.api.createIncomingDocument(title);
  }

  delete(id: string): Promise<void> {
    return this.api.deleteDocument(id);
  }
}
