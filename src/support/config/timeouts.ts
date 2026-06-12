/**
 * Merkezi bekleme süreleri (wait strategy — ADR-0001).
 *
 * KURAL: Sihirli ms sayısı YASAK. Her bekleme süresi buradan beslenir; CI/ortam
 * env ile override eder. Bunlar HARD-WAIT (sleep/waitForTimeout) DEĞİL — auto-wait ve
 * poll için ÜST SINIR'dır. Hard-wait projede hiçbir yerde kullanılmaz.
 */
const num = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const timeouts = {
  /** Web-first assertion (expect(locator).toBeVisible) üst sınırı. */
  expect: num(process.env.TIMEOUT_EXPECT_MS, 10_000),
  /** Sayfa navigasyonu. */
  navigation: num(process.env.TIMEOUT_NAV_MS, 30_000),
  /** Cross-channel convergence (pollUntil) toplam süresi. */
  apiPoll: num(process.env.TIMEOUT_API_POLL_MS, 15_000),
  /** pollUntil iki deneme arası bekleme. */
  pollInterval: num(process.env.TIMEOUT_POLL_INTERVAL_MS, 500),
} as const;
