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

/**
 * CONTRACT doğrulaması (#1): response BEKLENEN shape'e uyuyor mu? Gerçek backend bağlanınca
 * şema kayarsa (alan adı/tip değişir) test "undefined görünür" diye geç ve sessiz patlamak
 * yerine BURADA, kaynağında, AÇIK bir contract hatasıyla patlar. Dependency-free shape check.
 */
function assertIssueShape(body: unknown): asserts body is Record<string, unknown> {
  if (typeof body !== 'object' || body === null) {
    throw new TypeError('[IssueApiAdapter][contract] issue response bir JSON nesnesi değil');
  }
  for (const field of [RESP_ID_FIELD, RESP_KEY_FIELD] as const) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError(
        `[IssueApiAdapter][contract] beklenen alan '${field}' eksik ya da yanlış tip ` +
          `(string/number bekleniyor, gelen: ${JSON.stringify(value)}). API şeması mı değişti?`,
      );
    }
  }
}

export class IssueApiAdapter implements IssuePort {
  constructor(private readonly request: APIRequestContext) {}

  async create(summary: string): Promise<Issue> {
    const res = await this.request.post(ENDPOINT, {
      data: { fields: { [REQ_SUMMARY_FIELD]: summary } },
    });
    if (!res.ok()) {
      throw new Error(`[IssueApiAdapter] issue oluşturulamadı: ${res.status()} ${await res.text()}`);
    }
    const body: unknown = await res.json();
    assertIssueShape(body);
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
