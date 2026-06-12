import { timeouts } from './config/timeouts';
import type { FlakeReason } from './flaky';

/**
 * Wait strategy çekirdeği (ADR-0001) — TOOL-BAĞIMSIZ.
 *
 * HARD-WAIT YASAK: `sleep`/`waitForTimeout`/sabit ms uyku yok (flake ve yavaşlığın bir
 * numaralı kaynağı). İki meşru bekleme türü:
 *   1) Auto-wait / web-first assert → Playwright'a bırakılır (POM/adapter içinde).
 *   2) Cross-channel CONVERGENCE → `pollUntil`: API üretti ama Web/DB henüz görmedi
 *      (eventual consistency); probe deadline'a kadar yoklanır.
 * "Bekleme" ≠ "retry": retry tüm testi yeniden koşar (playwright.config `retries`).
 *
 * Saat/sleep enjekte edilebilir → birim testte sahte saatle deterministik koşar.
 */
export class WaitTimeoutError extends Error {
  constructor(
    readonly reason: FlakeReason,
    message: string,
  ) {
    super(message);
    this.name = 'WaitTimeoutError';
  }
}

export interface PollOptions {
  /** Toplam üst sınır (varsayılan timeouts.apiPoll). */
  timeoutMs?: number;
  /** Denemeler arası bekleme (varsayılan timeouts.pollInterval). */
  intervalMs?: number;
  /** Hata mesajında görünecek niyet (örn. "issue API listesinde belirir"). */
  describe: string;
  /** Test-zamanı saat enjeksiyonu (deterministik birim test). */
  now?: () => number;
  /** Test-zamanı sleep enjeksiyonu. */
  sleep?: (ms: number) => Promise<void>;
}

/**
 * `probe` tanımlı/non-null bir değer dönene kadar yoklar; deadline'da AÇIK hata fırlatır.
 * En az BİR kez dener (timeout 0 olsa bile tek deneme garanti).
 */
export async function pollUntil<T>(
  probe: () => Promise<T | undefined | null>,
  opts: PollOptions,
): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? timeouts.apiPoll;
  const intervalMs = opts.intervalMs ?? timeouts.pollInterval;
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const deadline = now() + timeoutMs;

  for (;;) {
    const result = await probe();
    if (result !== undefined && result !== null) return result;
    if (now() >= deadline) {
      throw new WaitTimeoutError(
        'timeout',
        `[pollUntil] '${opts.describe}' ${timeoutMs}ms içinde gerçekleşmedi ` +
          `(eventual consistency / yavaş sistem?).`,
      );
    }
    await sleep(intervalMs);
  }
}
