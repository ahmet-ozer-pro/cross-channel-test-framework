import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from '../../src/support/resilient-locator';

/**
 * resolve() davranış testleri — GERÇEK browser/Playwright GEREKTİRMEZ.
 * resilient-locator yalnızca `import type` ile Playwright'a bağlı (runtime'da erase
 * olur), bu yüzden minimal bir Locator/Page stub'ı ile saf mantığı test edebiliyoruz.
 *
 * Doğrulanan davranış (bu turda değişen): stratejiler tek bir Locator'a .or() ile
 * zincirlenir ve sonuç .first() ile tek element'e indirilir (strict-mode koruması).
 */

/** Minimal Locator stub'ı: .or() zincirini biriktirir, .first()'ü işaretler. */
class FakeLocator {
  firstCalled = false;
  constructor(
    public readonly id: string,
    public readonly orChain: FakeLocator[] = [],
  ) {}

  or(other: FakeLocator): FakeLocator {
    return new FakeLocator(this.id, [...this.orChain, other]);
  }

  first(): this {
    this.firstCalled = true;
    return this;
  }
}

function strategy(id: string) {
  return { describe: id, locate: () => new FakeLocator(id) as unknown };
}

const fakePage = {} as never;

describe('resolve()', () => {
  test("çok strateji: hepsini .or() ile zincirler, sonucu .first()'ler", async () => {
    const result = (await resolve(fakePage, [
      strategy('s1'),
      strategy('s2'),
      strategy('s3'),
    ] as never)) as unknown as FakeLocator;

    // base = ilk strateji
    assert.equal(result.id, 's1');
    // kalan stratejiler sırayla OR'landı
    assert.deepEqual(
      result.orChain.map((l) => l.id),
      ['s2', 's3'],
    );
    // strict-mode koruması: sonuç .first()'lendi
    assert.equal(result.firstCalled, true);
  });

  test("tek strateji: OR zinciri boş ama yine .first()'lenir", async () => {
    const result = (await resolve(fakePage, [strategy('only')] as never)) as unknown as FakeLocator;

    assert.equal(result.id, 'only');
    assert.deepEqual(result.orChain, []);
    assert.equal(result.firstCalled, true);
  });

  test('boş strateji listesi: açıklayıcı hata fırlatır', async () => {
    await assert.rejects(() => resolve(fakePage, [] as never), /strateji listesi boş/);
  });
});
