import type { Page, Locator } from '@playwright/test';

/**
 * Dirençli locator — self-healing'in TEMELİ.
 *
 * Healenium Playwright'ı saramıyor (CDP vs WebDriver) ve PW entegrasyonu henüz
 * olgun değil. Ama self-healing'in asıl değeri zaten dirençli locator stratejisi:
 * bir öğeyi birden çok yoldan ararız (önce stabil testId, sonra role, sonra metin).
 * Biri kırılırsa diğeri tutar.
 *
 * HEALING SEAM: ileride bir AI/ML healing katmanı (Healenium PW entegrasyonu
 * olgunlaşınca ya da AI tabanlı alternatif) `resolve` içindeki "hiçbiri eşleşmedi"
 * noktasına takılır. Page Object'ler değişmez — sadece bu dosya değişir.
 */

export interface LocatorStrategy {
  /** Hata mesajında görünecek kısa açıklama. */
  describe: string;
  locate: (page: Page) => Locator;
}

/**
 * Stratejileri tek bir auto-wait'li Locator'a OR'lar.
 *
 * NEDEN .or() (count() DEĞİL): count() Playwright'ın auto-wait'ini çalıştırmaz,
 * anında döner — yavaş render olan satırda (PrimeFaces lazy DataTable) henüz DOM'da
 * olmayan öğeyi "yok" sayıp "hiçbir strateji eşleşmedi" diye yanlış patlardı.
 * .or() zinciri ise tek bir Locator döndürür; eylem anında (click/expect)
 * Playwright stratejilerden HERHANGİ biri görünene kadar auto-wait yapar.
 *
 * HEALING SEAM: stratejilerin hiçbiri auto-wait süresince eşleşmezse hata
 * Playwright'ın kendi timeout'undan (eylem anında) gelir. İleride bir healing
 * katmanı bu noktaya — son strateji de tutmadığında — eklenir; Page Object'ler
 * değişmez, sadece bu dosya değişir. describe alanları o katman ve teşhis için saklanır.
 *
 * STRICT-MODE: OR'lanmış locator birden çok element'e resolve olabilir — aynı evrak
 * no hem testId-scoped metinde HEM ham getByText'te tutarsa toBeVisible() strict-mode
 * ihlaliyle patlardı. Sonucu .first() ile tek element'e indiriyoruz. Bu indirgemeyi
 * TEK NOKTADA (burada) yapıyoruz; her çağıran Page Object otomatik korunur, kendi
 * tarafında .first() tekrarlamak zorunda kalmaz.
 */
export async function resolve(page: Page, strategies: LocatorStrategy[]): Promise<Locator> {
  if (strategies.length === 0) {
    throw new Error('[resilientLocator] strateji listesi boş — en az bir strateji ver.');
  }
  const [first, ...rest] = strategies.map((strategy) => strategy.locate(page));
  const combined = rest.reduce((acc, locator) => acc.or(locator), first);
  return combined.first();
}
