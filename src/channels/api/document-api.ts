import type { APIRequestContext } from '@playwright/test';

/**
 * DocumentApi — evrak oluşturma / silme.
 *
 * ŞEMA VARSAYIMLARI — Türksat test ortamına göre DOĞRULA/DÜZELT.
 * Gerçek endpoint'i bağlarken SADECE aşağıdaki sabitleri değiştirmen yeterli;
 * step'ler ve cleanup mantığı aynı kalır.
 */
const ENDPOINT = '/api/v1/documents';        // evrak oluşturma yolu
const REQ_TITLE_FIELD = 'subject';           // request gövdesi: başlık alanı
const RESP_ID_FIELD = 'id';                  // response: kimlik alanı
const RESP_NUMBER_FIELD = 'documentNumber';  // response: evrak numarası
//                                              DİKKAT: evrakNo mu evrakSayi mı?
//                                              belgenet'teki karışıklık burada çözülür.

export interface CreatedDocument {
  id: string;
  documentNumber: string;
}

export class DocumentApi {
  constructor(private readonly api: APIRequestContext) {}

  async createIncomingDocument(title: string): Promise<CreatedDocument> {
    const res = await this.api.post(ENDPOINT, {
      data: { [REQ_TITLE_FIELD]: title, type: 'INCOMING' },
    });
    if (!res.ok()) {
      throw new Error(
        `[DocumentApi] evrak oluşturulamadı: ${res.status()} ${await res.text()}`,
      );
    }
    const body = await res.json();
    return {
      id: String(body[RESP_ID_FIELD]),
      documentNumber: String(body[RESP_NUMBER_FIELD]),
    };
  }

  async deleteDocument(id: string): Promise<void> {
    const res = await this.api.delete(`${ENDPOINT}/${id}`);
    // 404 = zaten silinmiş; teardown'da hata sayma.
    if (!res.ok() && res.status() !== 404) {
      throw new Error(`[DocumentApi] evrak silinemedi: ${res.status()}`);
    }
  }
}
