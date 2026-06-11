/**
 * IssuePort — issue/task kanalının TOOL-BAĞIMSIZ sözleşmesi (ADR-0001).
 *
 * Playwright/HTTP detayı SIZMAZ. Test ve task'lar bu arayüze bağlanır; somut
 * implementasyon (adapter) fixture ile enjekte edilir. Tool değişse senaryolar değişmez.
 *
 * Interface Segregation: yalnızca issue yaşam döngüsü. "Her şeyi yapan" god-interface YAPMA.
 */
export interface Issue {
  id: string;
  /** Görünür anahtar (Jira tarzı, örn. PROJ-123). */
  key: string;
}

export interface IssuePort {
  /** Yeni issue üretir, üretilen kaydı döner. */
  create(summary: string): Promise<Issue>;
  /** Üretilen issue'yu siler (cleanup için). */
  delete(id: string): Promise<void>;
}
