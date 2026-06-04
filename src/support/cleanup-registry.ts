/**
 * CleanupRegistry
 * ---------------
 * Test verisi yönetiminin merkezi. Bir step API ile veri ÜRETTİĞİNDE,
 * hemen o veriyi geri alacak cleanup fonksiyonunu buraya kaydeder.
 * After hook'u senaryo sonunda hepsini LIFO sırayla çalıştırır.
 *
 * Neden kritik (özellikle kamu ortamı):
 *  - Test verisi temizlenmezse DB şişer ve testler birbirini etkiler.
 *  - Üretimi yapan step temizliği de kaydetmeli — sorumluluk tek yerde.
 *
 * Neden LIFO:
 *  - Bağımlı kaynaklar ters sırada silinmeli (önce child, sonra parent).
 *
 * Neden tek tek try/catch:
 *  - Bir cleanup patlarsa diğerleri yine de çalışmalı; sızıntı birikmemeli.
 */
type CleanupTask = () => Promise<void>;

export class CleanupRegistry {
  private tasks: CleanupTask[] = [];

  /** Üretilen bir kaynağın temizliğini kaydet. Üretimle aynı step'te çağır. */
  register(task: CleanupTask): void {
    this.tasks.push(task);
  }

  /** Tüm cleanup'ları LIFO sırayla çalıştırır. Hata olsa bile devam eder. */
  async runAll(): Promise<void> {
    const ordered = [...this.tasks].reverse();
    this.tasks = [];
    for (const task of ordered) {
      try {
        await task();
      } catch (error) {
        // Teardown hatası testi düşürmez ama görünür olmalı.
        console.error('[CleanupRegistry] cleanup task başarısız:', error);
      }
    }
  }
}
