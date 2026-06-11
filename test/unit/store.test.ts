import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TypedStore } from '../../src/support/store';
import { defineKey, defineCollectionKey } from '../../src/support/store-keys';

/**
 * TypedStore davranış testleri (env import ETMEZ — saf mantık).
 * Bu turda eklenen koleksiyon API'sinin ve loud-fail kararlarının regresyonunu kilitler.
 */
describe('TypedStore — tek değer (set/get/has)', () => {
  test('get: anahtar yokken FIRLATIR (sessiz undefined değil)', () => {
    const store = new TypedStore();
    const key = defineKey<string>('YOK');
    assert.throws(() => store.get(key), /bulunamadı/);
  });

  test('set/get: yazılan değeri tip-doğru döndürür', () => {
    const store = new TypedStore();
    const key = defineKey<string>('DOC_ID');
    store.set(key, 'abc-123');
    assert.equal(store.get(key), 'abc-123');
  });

  test('set: ikinci yazma öncekini EZER (kasıtlı tek-değer semantiği)', () => {
    const store = new TypedStore();
    const key = defineKey<number>('N');
    store.set(key, 1);
    store.set(key, 2);
    assert.equal(store.get(key), 2);
  });

  test('has: varlık durumunu doğru bildirir', () => {
    const store = new TypedStore();
    const key = defineKey<string>('K');
    assert.equal(store.has(key), false);
    store.set(key, 'v');
    assert.equal(store.has(key), true);
  });
});

describe('TypedStore — koleksiyon (push/getAll/last/initCollection)', () => {
  test('push → getAll: ekleme sırasını korur', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<string>('DOCS');
    store.push(key, 'a');
    store.push(key, 'b');
    store.push(key, 'c');
    assert.deepEqual(store.getAll(key), ['a', 'b', 'c']);
  });

  test('getAll: hiç init edilmemiş key FIRLATIR (vacuous-pass koruması)', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<string>('HIC_YAZILMADI');
    assert.throws(() => store.getAll(key), /init edilmedi/);
  });

  test('initCollection: bilinçli boş koleksiyonda getAll [] döner (fırlatmaz)', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<string>('BOS_AMA_INIT');
    store.initCollection(key);
    assert.deepEqual(store.getAll(key), []);
  });

  test('last: en son push edileni döndürür', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<number>('NUMS');
    store.push(key, 10);
    store.push(key, 20);
    assert.equal(store.last(key), 20);
  });

  test('last: init edilmemiş koleksiyonda FIRLATIR', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<number>('YOK2');
    assert.throws(() => store.last(key), /init edilmedi/);
  });

  test('last: init edilmiş ama boş koleksiyonda FIRLATIR', () => {
    const store = new TypedStore();
    const key = defineCollectionKey<number>('BOS_INIT');
    store.initCollection(key);
    assert.throws(() => store.last(key), /boş/);
  });
});

describe('TypedStore — clear', () => {
  test('clear: hem tek-değer hem koleksiyon namespace\'ini sıfırlar', () => {
    const store = new TypedStore();
    const single = defineKey<string>('S');
    const coll = defineCollectionKey<string>('C');
    store.set(single, 'x');
    store.push(coll, 'y');

    store.clear();

    assert.equal(store.has(single), false);
    // koleksiyon da sıfırlandı: getAll artık "init edilmedi" fırlatmalı
    assert.throws(() => store.getAll(coll), /init edilmedi/);
  });
});
