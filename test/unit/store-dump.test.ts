import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TypedStore } from '../../src/support/store';
import { defineKey, defineCollectionKey } from '../../src/support/store-keys';

/**
 * TypedStore.dump() testleri (#5). Hata anı teşhis çıktısının regresyonunu kilitler:
 * sensitive maskeleme + koleksiyon sahip/adet/son-değer + tüm listeyi şişirmeme.
 */
describe('TypedStore.dump — teşhis anlık görüntüsü', () => {
  test("sensitive anahtar dump'ta MASKELENİR, normal değer görünür", () => {
    const store = new TypedStore();
    store.set(defineKey<string>('USER_TOKEN', { sensitive: true }), 'gizli-jwt');
    store.set(defineKey<string>('ENV', { owner: 'api' }), 'staging');

    const dump = store.dump();
    assert.equal(dump.data.USER_TOKEN, '***MASKED***');
    assert.equal(dump.data.ENV, 'staging');
  });

  test('koleksiyon: sahip + adet + son değer verir (liste şişmez)', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<{ id: string }>('CREATED', { owner: 'api' });
    store.push(key, { id: '1' });
    store.push(key, { id: '2' });

    const dump = store.dump();
    assert.deepEqual(dump.collections.CREATED, {
      owner: 'api',
      count: 2,
      lastValue: { id: '2' },
    });
  });

  test('sensitive koleksiyonun son değeri de maskelenir', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<string>('SECRETS', { sensitive: true });
    store.push(key, 'parola-1');

    const dump = store.dump();
    assert.equal(dump.collections.SECRETS.lastValue, '***MASKED***');
  });

  test('boş/yazılmamış store boş dump verir', () => {
    const dump = new TypedStore().dump();
    assert.deepEqual(dump, { data: {}, collections: {} });
  });
});
