import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { pollUntil, WaitTimeoutError } from '../../src/support/wait';

/**
 * pollUntil davranış testleri (env/Playwright import ETMEZ — saf mantık).
 * Sahte saat + sahte sleep ile DETERMİNİSTİK: gerçek zaman beklemeden timeout/convergence
 * mantığını kilitler. Hard-wait yasağının yardımcı tarafının regresyonunu önler.
 */
describe('pollUntil — cross-channel convergence', () => {
  test('probe ilk denemede değer dönerse onu döndürür (tek deneme)', async () => {
    let calls = 0;
    const value = await pollUntil(
      async () => {
        calls += 1;
        return 'hazır';
      },
      { describe: 'anında hazır', now: () => 0, sleep: async () => {} },
    );
    assert.equal(value, 'hazır');
    assert.equal(calls, 1);
  });

  test('probe sonradan değer dönerse onu yakalar (birkaç deneme sonra)', async () => {
    let clock = 0;
    let calls = 0;
    const value = await pollUntil(
      async () => {
        calls += 1;
        return calls >= 3 ? 42 : undefined;
      },
      {
        describe: 'eventual consistency',
        timeoutMs: 1000,
        intervalMs: 100,
        now: () => clock,
        sleep: async (ms) => {
          clock += ms;
        },
      },
    );
    assert.equal(value, 42);
    assert.equal(calls, 3);
  });

  test('deadline aşılırsa WaitTimeoutError (reason=timeout) FIRLATIR', async () => {
    let clock = 0;
    await assert.rejects(
      () =>
        pollUntil(async () => undefined, {
          describe: 'asla hazır olmaz',
          timeoutMs: 300,
          intervalMs: 100,
          now: () => clock,
          sleep: async (ms) => {
            clock += ms;
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof WaitTimeoutError);
        assert.equal(err.reason, 'timeout');
        return true;
      },
    );
  });

  test('null da "henüz değil" sayılır (undefined ile aynı)', async () => {
    let clock = 0;
    await assert.rejects(
      () =>
        pollUntil(async () => null, {
          describe: 'hep null',
          timeoutMs: 0,
          now: () => clock++,
          sleep: async () => {},
        }),
      WaitTimeoutError,
    );
  });
});
