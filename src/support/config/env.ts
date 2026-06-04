import 'dotenv/config';

/**
 * Environment Config
 * ------------------
 * Tüm ortam-bağımlı değerler ve secrets buradan okunur.
 *
 * Kurallar:
 *  - Credential'lar ASLA kodda hardcoded olmaz; sadece env'den gelir.
 *  - Eksik zorunlu değişken varsa başlangıçta FIRLATIR (fail-fast).
 *    Testin yarısında "undefined token" hatası almaktan iyidir.
 *  - Ortam ayrımı (dev/test/staging) kod değişikliğiyle değil, env ile yapılır.
 *
 * Yerel geliştirme: .env dosyası (.gitignore'da). CI: Jenkins credentials store.
 */

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(
      `[env] Zorunlu ortam değişkeni eksik: ${name}. ` +
        `.env dosyanı (yerelde) veya CI credential'larını kontrol et.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  /** Test edilen ortamın kök URL'i (dev/test/staging'e göre değişir). */
  BASE_URL: required('BASE_URL'),

  /** Headless çalıştırma. Yerel debug için HEADLESS=false ile aç. */
  HEADLESS: optional('HEADLESS', 'true') !== 'false',

  /** --- Credentials (asla hardcoded değil) --- */
  ADMIN_USER: required('ADMIN_USER'),
  ADMIN_PASS: required('ADMIN_PASS'),

  /** --- Keycloak / API --- */
  AUTH_URL: optional('AUTH_URL', ''),

  /** --- DB (stub fazda boş geçilebilir) --- */
  DB_SQL_URL: optional('DB_SQL_URL', ''),
  DB_NOSQL_URL: optional('DB_NOSQL_URL', ''),
} as const;
