import { randomUUID } from 'node:crypto';

/**
 * Test çalıştırması kimliği + worker-güvenli benzersiz isimlendirme (#4 — ADR-0001).
 *
 * testRunId: TÜM koşum için SABİT. CI'da `TEST_RUN_ID` env ile dışarıdan verilebilir →
 * üretilen veri/loglar tek koşuma izlenir; ileride ORPHAN veri ("hangi koşumdan kaldı?")
 * bu id ile tespit edilir.
 * uniqueName: testRunId + worker index + uuid → paralel worker'lar çakışmaz, üretilen ad
 * koşuma geri izlenir.
 */
export const testRunId: string =
  process.env.TEST_RUN_ID && process.env.TEST_RUN_ID.trim().length > 0
    ? process.env.TEST_RUN_ID.trim()
    : `run-${randomUUID().slice(0, 8)}`;

/** Playwright worker index'i (paralel koşu); yoksa '0'. */
function workerIndex(): string {
  return process.env.TEST_PARALLEL_INDEX ?? process.env.TEST_WORKER_INDEX ?? '0';
}

/** Worker-güvenli, koşuma izlenebilir benzersiz ad (paralelde çakışmaz). */
export function uniqueName(prefix: string): string {
  return `${prefix}-${testRunId}-w${workerIndex()}-${randomUUID().slice(0, 8)}`;
}
