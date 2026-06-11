import type { APIRequestContext } from '@playwright/test';
import type { Issue, IssuePort } from '../../core/ports/issue-port';

/**
 * IssueApiAdapter — IssuePort'un Playwright/HTTP implementasyonu (ADR-0001).
 * TOOL-BAĞLI kod yalnızca burada (adapters/). Test/task bunu bilmez; port'a bağlanır.
 *
 * ŞEMA VARSAYIMLARI — gerçek API'ye göre DOĞRULA/DÜZELT. Endpoint'i bağlarken
 * SADECE aşağıdaki sabitleri değiştir; port, task, fixture ve spec aynı kalır.
 * (Gerçek Jira: payload `fields` altında project + issuetype de ister.)
 */
const ENDPOINT = '/rest/api/2/issue';   // issue oluşturma yolu
const REQ_SUMMARY_FIELD = 'summary';    // request: başlık alanı
const RESP_ID_FIELD = 'id';             // response: kimlik
const RESP_KEY_FIELD = 'key';           // response: görünür anahtar

export class IssueApiAdapter implements IssuePort {
  constructor(private readonly request: APIRequestContext) {}

  async create(summary: string): Promise<Issue> {
    const res = await this.request.post(ENDPOINT, {
      data: { fields: { [REQ_SUMMARY_FIELD]: summary } },
    });
    if (!res.ok()) {
      throw new Error(`[IssueApiAdapter] issue oluşturulamadı: ${res.status()} ${await res.text()}`);
    }
    const body = await res.json();
    return { id: String(body[RESP_ID_FIELD]), key: String(body[RESP_KEY_FIELD]) };
  }

  async delete(id: string): Promise<void> {
    const res = await this.request.delete(`${ENDPOINT}/${id}`);
    // 404 = zaten silinmiş; teardown'da hata sayma.
    if (!res.ok() && res.status() !== 404) {
      throw new Error(`[IssueApiAdapter] issue silinemedi: ${res.status()}`);
    }
  }
}
