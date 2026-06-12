import type { TestUser } from '../../support/config/env';

/**
 * Görev (task) web kanalı port'ları (ADR-0001 kural 2) — TOOL-BAĞIMSIZ sözleşmeler.
 * Step/task somut POM'u (Playwright'ı) bilmez; bu arayüzlere bağlanır, adapter fixture ile
 * enjekte edilir. Sayfa başına ince port; Locator/Page SIZDIRMAZ (ports-are-pure korunur).
 */
export interface LoginPort {
  /** Siteyi aç (Keycloak login'e düşer). */
  goto(): Promise<void>;
  /** Login formunun göründüğünü doğrula. */
  expectLoginPage(): Promise<void>;
  /** Verilen kullanıcı ile giriş yap. */
  login(user: TestUser): Promise<void>;
}

export interface AppShellPort {
  /** Ana sayfanın (uygulama kabuğu) yüklendiğini doğrula. */
  expectHome(): Promise<void>;
  /** Sistemden çıkış yap. */
  logout(): Promise<void>;
  /** Başarı toast'unun göründüğünü doğrula (oluşturma/güncelleme sonrası). */
  expectSuccessToast(): Promise<void>;
}

export interface GorevFormPort {
  /** "Ekle" ile yeni görev formunu aç. */
  openCreate(): Promise<void>;
  fillSubject(subject: string): Promise<void>;
  selectType(label: string): Promise<void>;
  selectPriority(label: string): Promise<void>;
  /** İstenen teslim tarihini "bugün" seç. */
  pickDueDateToday(): Promise<void>;
  /** Atanan kullanıcıyı (görünen ada göre) seç. */
  assignTo(name: string): Promise<void>;
  /** Kaydet. */
  submit(): Promise<void>;
}

export interface GorevListPort {
  /** Görev listesinde ara (No/Konu). */
  search(text: string): Promise<void>;
  /** Konusu verilen görevin listede göründüğünü doğrula. */
  expectListed(text: string): Promise<void>;
  /** Konusu verilen görevi aç (detay/güncelle dialog'u). */
  open(text: string): Promise<void>;
}

export interface GorevUpdatePort {
  /** Güncelle dialog'unda durumu seç. */
  setStatus(label: string): Promise<void>;
  /** Değişikliği kaydet. */
  submit(): Promise<void>;
}
