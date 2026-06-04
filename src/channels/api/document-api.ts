import type { APIRequestContext } from '@playwright/test';

/**
 * DocumentApi (STUB)
 * ------------------
 * API kanalının evrak işlemleri. Step'ler doğrudan APIRequestContext kullanmaz;
 * bu client üzerinden konuşur (sorumluluk ayrımı, kolay mock).
 *
 * Stub fazda metodlar "Not implemented" fırlatır. Gerçek endpoint'ler bağlanınca
 * sadece bu dosya değişir; step'ler aynı kalır.
 */
export interface CreatedDocument {
  id: string;
  documentNumber: string;
}

export class DocumentApi {
  // Stub fazda okunmuyor; gerçek implementasyonda this.api ile çağrı yapılacak.
  constructor(private readonly api: APIRequestContext) {
    void this.api;
  }

  async createIncomingDocument(title: string): Promise<CreatedDocument> {
    // STUB — gerçek implementasyon:
    // const res = await this.api.post('/api/v1/documents', { data: { title, type: 'INCOMING' } });
    // const body = await res.json();
    // return { id: body.id, documentNumber: body.documentNumber };
    throw new Error(`Not implemented: DocumentApi.createIncomingDocument("${title}")`);
  }

  async deleteDocument(id: string): Promise<void> {
    // STUB — cleanup için kullanılacak
    // await this.api.delete(`/api/v1/documents/${id}`);
    throw new Error(`Not implemented: DocumentApi.deleteDocument("${id}")`);
  }
}
