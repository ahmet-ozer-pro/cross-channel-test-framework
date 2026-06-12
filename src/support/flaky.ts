/**
 * Flaky taksonomisi (ADR-0001 — #6).
 *
 * Büyük suite'te asıl problem test yazmak değil, GÜVENİLİRLİĞİ korumaktır. Bir
 * bekleme/test hatasını KÖKEN'ine göre sınıflamak triage'ı hızlandırır ve "gerçek bug mı,
 * kararsızlık mı?" kararını (dolayısıyla @quarantine'i) besler.
 *
 * @quarantine: kronik kararsız test bu tag ile işaretlenir; varsayılan koşudan
 * grepInvert ile DIŞLANIR (yeşili kirletmez), ayrı koşulur (`npm run test:quarantine`).
 */
export type FlakeReason =
  | 'timeout' // bekleme doldu (yavaş sistem / eventual consistency)
  | 'locator' // element yok / strict-mode (UI mı değişti?)
  | 'data' // beklenen veri yok (üretici step koşmadı / cleanup sızıntısı)
  | 'network' // request başarısız / 5xx
  | 'unknown';

/** Bir hatayı mesajından kaba taksonomiye eşler (triage ipucu; kesin tanı değil). */
export function classifyError(err: unknown): FlakeReason {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (msg.includes('timeout') || msg.includes('exceeded')) return 'timeout';
  if (msg.includes('strict mode') || msg.includes('locator') || msg.includes('no element')) {
    return 'locator';
  }
  if (msg.includes('koleksiyon') || msg.includes('store') || msg.includes('bulunamadı')) {
    return 'data';
  }
  if (msg.includes('econn') || msg.includes('socket') || /\b5\d\d\b/.test(msg)) return 'network';
  return 'unknown';
}
