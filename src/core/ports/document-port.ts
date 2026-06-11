/**
 * DocumentPort — evrak kanalının TOOL-BAĞIMSIZ sözleşmesi (ADR-0001).
 *
 * Buraya Playwright/HTTP/Appium hiçbir detayı SIZMAZ. Testler ve task'lar bu
 * arayüze bağlanır; somut implementasyon (adapter) fixture ile enjekte edilir.
 * Böylece tool değişse (Playwright→başka, REST→GraphQL) senaryolar değişmez.
 *
 * Interface Segregation: bu port YALNIZCA evrak yaşam döngüsüdür. "Her şeyi yapan"
 * bir ApiPort god-interface'i OLUŞTURMA — her yetenek kendi dar port'udur.
 */
export interface CreatedDocument {
  id: string;
  documentNumber: string;
}

export interface DocumentPort {
  /** Yeni gelen evrak üretir. */
  createIncoming(title: string): Promise<CreatedDocument>;
  /** Üretilen evrakı siler (cleanup için). */
  delete(id: string): Promise<void>;
}
