import { StoreKey } from './store-keys';

/**
 * TypedStore
 * ----------
 * Senaryo boyunca kanallar arası taşınan state'in tek kaynağı.
 *
 * Tasarım kararları:
 *  - get() anahtar yoksa FIRLATIR (sessizce undefined dönmez). Eksik veri
 *    cross-channel akışta en sık hata kaynağı; loud fail debug'ı kısaltır.
 *  - Değerler StoreKey<T> üzerinden tipli okunur/yazılır; yanlış tip compile etmez.
 *  - Raw Map<string, any> KULLANILMAZ — bu, belgenet'teki TestContextKeys
 *    monolitine geri dönüş olur.
 */
export class TypedStore {
  private readonly data = new Map<string, unknown>();

  set<T>(key: StoreKey<T>, value: T): void {
    this.data.set(key.id, value);
  }

  get<T>(key: StoreKey<T>): T {
    if (!this.data.has(key.id)) {
      throw new Error(
        `[TypedStore] '${key.id}' anahtarı bulunamadı. ` +
          `Bu değeri yazan step bu senaryoda çalıştı mı? ` +
          `(Yazma sahibi kanalı store-keys.ts içinde kontrol et.)`,
      );
    }
    return this.data.get(key.id) as T;
  }

  has<T>(key: StoreKey<T>): boolean {
    return this.data.has(key.id);
  }

  clear(): void {
    this.data.clear();
  }
}
