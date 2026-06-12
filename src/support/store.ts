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
 *  - Raw Map<string, any> KULLANILMAZ — bu, tipsiz string-key monolitine
 *    (eski TestContextKeys benzeri) geri dönüş olur.
 *
 * İKİ NAMESPACE:
 *  - Tek değer: set/get/has  (data)        — ikinci set öncekini EZER (kasıtlı).
 *  - Koleksiyon: push/getAll/last (collections) — aynı key altında BİRDEN ÇOK
 *    entity biriktirir; chaining (parent→child) ve N-kayıt doğrulama içindir.
 *  İkisi ayrı Map'tir; biri diğerini etkilemez. clear() ikisini de sıfırlar.
 */
/** dump() çıktısı — hata anında okunur anlık görüntü (sensitive maskeli). */
export interface StoreDump {
  data: Record<string, unknown>;
  collections: Record<string, { owner?: string; count: number; lastValue: unknown }>;
}

const MASK = '***MASKED***';

/** Loud-fail mesajlarının ortak kuyruğu (DRY — tek kaynak). */
const OWNER_HINT = '(Yazma sahibi kanalı store-keys.ts içinde kontrol et.)';

export class TypedStore {
  private readonly data = new Map<string, unknown>();
  private readonly collections = new Map<string, unknown[]>();
  // Audit/maskeleme metadata'sı: yazma anında anahtardan toplanır (key ownership + sensitive).
  private readonly owners = new Map<string, string>();
  private readonly sensitiveIds = new Set<string>();

  private trackMeta<T>(key: StoreKey<T>): void {
    if (key.owner) this.owners.set(key.id, key.owner);
    if (key.sensitive) this.sensitiveIds.add(key.id);
  }

  /** Tutarlı loud-fail (DRY): prefix + detay + ortak sahip-ipucu kuyruğu. */
  private fail(detail: string): never {
    throw new Error(`[TypedStore] ${detail} ${OWNER_HINT}`);
  }

  set<T>(key: StoreKey<T>, value: T): void {
    this.trackMeta(key);
    this.data.set(key.id, value);
  }

  get<T>(key: StoreKey<T>): T {
    if (!this.data.has(key.id)) {
      this.fail(`'${key.id}' anahtarı bulunamadı. Bu değeri yazan step bu senaryoda çalıştı mı?`);
    }
    return this.data.get(key.id) as T;
  }

  has<T>(key: StoreKey<T>): boolean {
    return this.data.has(key.id);
  }

  /**
   * Koleksiyonu AÇIKÇA boş olarak başlatır (bilinçli-boş durum için).
   * "Sıfır kayıt bekliyorum" gibi senaryolarda, üretici step'in çalıştığını ama
   * 0 entity ürettiğini işaretler — getAll()'un loud-fail'inden ayrışır.
   */
  initCollection<T>(key: StoreKey<T>): void {
    this.trackMeta(key);
    if (!this.collections.has(key.id)) {
      this.collections.set(key.id, []);
    }
  }

  /** Koleksiyona bir entity ekler (öncekileri EZMEZ; chaining/N-kayıt için). */
  push<T>(key: StoreKey<T>, value: T): void {
    this.trackMeta(key);
    const list = this.collections.get(key.id);
    if (list) {
      list.push(value);
    } else {
      this.collections.set(key.id, [value]);
    }
  }

  /**
   * Koleksiyondaki tüm entity'leri döndürür.
   * LOUD-FAIL (get() ile tutarlı): key hiç init edilmediyse (ne push ne
   * initCollection) FIRLATIR. Aksi halde boş [] dönerdi ve "üretilen tüm X listede
   * görünür" assertion'ı üretici step hiç çalışmadığında boş küme üzerinde trivial
   * GEÇERDİ (vacuous pass). Bilinçli boş koleksiyon istiyorsan önce initCollection().
   */
  getAll<T>(key: StoreKey<T>): T[] {
    if (!this.collections.has(key.id)) {
      this.fail(
        `'${key.id}' koleksiyonu init edilmedi. Bu key'e push ` +
          `(ya da bilinçli boş için initCollection) yapan step bu senaryoda çalıştı mı?`,
      );
    }
    return this.collections.get(key.id) as T[];
  }

  /** Koleksiyona en son push'lanan entity. Init edilmediyse/boşsa FIRLATIR (get ile tutarlı). */
  last<T>(key: StoreKey<T>): T {
    const list = this.collections.get(key.id);
    if (!list) {
      this.fail(
        `'${key.id}' koleksiyonu init edilmedi. Bu key'e push yapan step bu senaryoda çalıştı mı?`,
      );
    }
    if (list.length === 0) {
      throw new Error(
        `[TypedStore] '${key.id}' koleksiyonu boş — init edildi ama hiç entity push edilmedi.`,
      );
    }
    return list.at(-1) as T;
  }

  /**
   * Hata anında okunur anlık görüntü (#5). Sensitive değerler MASKELENİR; koleksiyonlar
   * için sahip + adet + son değer verilir (tüm listeyi şişirmeden debug ipucu). Test
   * fixture'ı bunu yalnızca senaryo BAŞARISIZSA teşhise ekler.
   */
  dump(): StoreDump {
    const mask = (id: string, value: unknown) => (this.sensitiveIds.has(id) ? MASK : value);
    const data: Record<string, unknown> = {};
    for (const [id, value] of this.data) data[id] = mask(id, value);

    const collections: StoreDump['collections'] = {};
    for (const [id, list] of this.collections) {
      collections[id] = {
        owner: this.owners.get(id),
        count: list.length,
        lastValue: list.length > 0 ? mask(id, list.at(-1)) : undefined,
      };
    }
    return { data, collections };
  }

  clear(): void {
    this.data.clear();
    this.collections.clear();
    this.owners.clear();
    this.sensitiveIds.clear();
  }
}
