/**
 * Typed Store Keys
 * ----------------
 * Tipli context anahtarı (TypedKey<T>) pattern'ının TypeScript karşılığı.
 *
 * Amaç: Kanallar arası veri taşırken (API -> Web -> Mobile -> DB)
 * her anahtarın taşıdığı değerin tipi derleme zamanında garanti altına alınır.
 * Bu, issueId / projectKey gibi string-literal karışıklıklarını yapısal olarak
 * imkansız kılar — yanlış tipte okuma compile etmez.
 *
 * KURAL (sahiplik):
 *   Her anahtarın yanına HANGİ kanalın yazdığını yorum olarak belirt.
 *   Okuma serbest, yazma sahibi kanala aittir. Bu konvansiyon karışıklığı önler.
 */

import type { Issue } from '../core/ports/issue-port';

/** Anahtar metadata'sı: sahiplik (audit) + hassasiyet (dump maskeleme). */
export interface KeyOptions {
  /** Bu anahtara YAZAN kanal (audit/dump için; okuma serbest). */
  owner?: string;
  /** true ise dump/teşhis çıktısında değer MASKELENİR (token, parola vb.). */
  sensitive?: boolean;
}

export interface StoreKey<T> extends KeyOptions {
  readonly id: string;
  /** Phantom type marker — T'yi compile-time'da taşır, runtime'da asla set edilmez. */
  readonly __valueType?: T;
}

/** Tipli bir store anahtarı tanımlar (tek değer; set/get). */
export function defineKey<T>(id: string, opts: KeyOptions = {}): StoreKey<T> {
  return { id, ...opts };
}

/**
 * Tipli bir KOLEKSIYON anahtarı tanımlar (push/getAll/last).
 * Teknik olarak StoreKey<T> ile aynı; ayrı fonksiyon niyeti açıklar:
 * bu anahtar altında aynı tipte BİRDEN ÇOK entity biriktirilir (chaining,
 * N-kayıt üretip hepsini doğrulama). Flat set/get namespace'inden bağımsızdır.
 */
export function defineCollectionKey<T>(id: string, opts: KeyOptions = {}): StoreKey<T> {
  return { id, ...opts };
}

/**
 * Merkezi anahtar kataloğu.
 * Yeni anahtar eklerken: tipini ver, sahibini (yazan kanal) yorumla belirt.
 */
export const Keys = {
  // --- API kanalı yazar ---
  // sensitive: dump'ta maskelenir (token sızıntısı önlenir).
  USER_TOKEN: defineKey<string>('USER_TOKEN', { owner: 'api', sensitive: true }),

  // Üretilen issue'ları biriktirir (chaining/toplu doğrulama). API push'lar, Web getAll okur.
  CREATED_ISSUES: defineCollectionKey<Issue>('CREATED_ISSUES', { owner: 'api' }),

  // --- Web kanalı yazar ---
  // (örnek) WEB_SELECTED_ROW_INDEX: defineKey<number>('WEB_SELECTED_ROW_INDEX'),

  // --- Mobile kanalı yazar ---
  // (örnek) MOBILE_PUSH_TOKEN: defineKey<string>('MOBILE_PUSH_TOKEN'),
} as const;
