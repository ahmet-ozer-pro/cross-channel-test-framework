/**
 * Typed Store Keys
 * ----------------
 * belgenet'teki TypedKey<T> pattern'ının TypeScript karşılığı.
 *
 * Amaç: Kanallar arası veri taşırken (API -> Web -> Mobile -> DB)
 * her anahtarın taşıdığı değerin tipi derleme zamanında garanti altına alınır.
 * Bu, evrakNo / evrakSayi gibi string-literal karışıklıklarını yapısal olarak
 * imkansız kılar — yanlış tipte okuma compile etmez.
 *
 * KURAL (sahiplik):
 *   Her anahtarın yanına HANGİ kanalın yazdığını yorum olarak belirt.
 *   Okuma serbest, yazma sahibi kanala aittir. Bu konvansiyon karışıklığı önler.
 */

export interface StoreKey<T> {
  readonly id: string;
  /** Phantom type marker — T'yi compile-time'da taşır, runtime'da asla set edilmez. */
  readonly __valueType?: T;
}

/** Tipli bir store anahtarı tanımlar. */
export function defineKey<T>(id: string): StoreKey<T> {
  return { id };
}

/**
 * Merkezi anahtar kataloğu.
 * Yeni anahtar eklerken: tipini ver, sahibini (yazan kanal) yorumla belirt.
 */
export const Keys = {
  // --- API kanalı yazar ---
  DOCUMENT_ID: defineKey<string>('DOCUMENT_ID'),
  DOCUMENT_NUMBER: defineKey<string>('DOCUMENT_NUMBER'),
  EVENT_ID: defineKey<string>('EVENT_ID'),
  USER_TOKEN: defineKey<string>('USER_TOKEN'),

  // --- Web kanalı yazar ---
  // (örnek) WEB_SELECTED_ROW_INDEX: defineKey<number>('WEB_SELECTED_ROW_INDEX'),

  // --- Mobile kanalı yazar ---
  // (örnek) MOBILE_PUSH_TOKEN: defineKey<string>('MOBILE_PUSH_TOKEN'),
} as const;
