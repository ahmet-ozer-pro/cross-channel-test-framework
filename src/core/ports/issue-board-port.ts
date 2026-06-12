/**
 * IssueBoardPort — web kanalının TOOL-BAĞIMSIZ sözleşmesi (ADR-0001 kural 2).
 *
 * Step/task somut `IssueBoardPage`'i (ya da Playwright'ı) BİLMEZ; bu arayüze bağlanır,
 * somut adapter fixture ile enjekte edilir — tıpkı IssuePort gibi. Böylece web de API ile
 * AYNI enjeksiyon disiplinine girer.
 *
 * Arayüz Playwright tipi (Page/Locator) SIZDIRMAZ → ports-are-pure korunur. Auto-wait'li
 * assertion adapter İÇİNDE yapılır (domain-seviyesi `expectCardVisible`), Locator dışarı
 * çıkmaz; çağıran taraf raw locator juggling yapmaz.
 */
export interface IssueBoardPort {
  /** Board'u açar (navigasyon). */
  open(): Promise<void>;
  /** Verilen anahtarlı issue kartının görünür olduğunu auto-wait ile DOĞRULAR. */
  expectCardVisible(issueKey: string): Promise<void>;
}
