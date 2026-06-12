import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CleanupRegistry } from '../../src/support/cleanup-registry';

/**
 * CleanupRegistry davranış testleri (env import ETMEZ).
 * LIFO sıra ve hata-izolasyonu teardown'ın güvenliği için kritik; burada kilitlenir.
 */
describe('CleanupRegistry', () => {
  test("runAll: task'ları LIFO (ters) sırayla çalıştırır", async () => {
    const registry = new CleanupRegistry();
    const order: number[] = [];
    registry.register(async () => {
      order.push(1);
    });
    registry.register(async () => {
      order.push(2);
    });
    registry.register(async () => {
      order.push(3);
    });

    await registry.runAll();

    // Önce child (son register), sonra parent → 3,2,1
    assert.deepEqual(order, [3, 2, 1]);
  });

  test('runAll: bir task fırlatsa bile diğerleri çalışır (hata izolasyonu)', async () => {
    const registry = new CleanupRegistry();
    const ran: string[] = [];
    registry.register(async () => {
      ran.push('first');
    });
    registry.register(async () => {
      throw new Error('patlayan cleanup');
    });
    registry.register(async () => {
      ran.push('third');
    });

    // runAll kendi içinde yutar (console.error) — dışarıya fırlatmamalı
    await registry.runAll();

    // Patlayan task'ın altındaki ve üstündeki task'lar yine çalıştı
    assert.deepEqual(ran, ['third', 'first']);
  });

  test('runAll: çalıştıktan sonra liste boşalır (ikinci çağrı no-op)', async () => {
    const registry = new CleanupRegistry();
    let count = 0;
    registry.register(async () => {
      count += 1;
    });

    await registry.runAll();
    await registry.runAll(); // tekrar — kayıtlı task kalmadı

    assert.equal(count, 1);
  });
});
