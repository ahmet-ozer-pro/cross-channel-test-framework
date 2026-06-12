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

/**
 * Rol bazlı test kullanıcısı (ADR-0001 — çok-kullanıcı/yetki best practice).
 * Kimlik ROLE'e bağlanır, pozisyona (test1/test2) değil → senaryo "creator atar,
 * reviewer doğrular" der; hangi gerçek kullanıcı olduğu env'de kalır. Yeni kullanıcı =
 * yeni rol + USER_<ROLE>_* (.env) + USER_ENV satırı; kod/senaryo değişmez.
 */
export type UserRole = 'creator' | 'reviewer';

export interface TestUser {
  readonly username: string;
  readonly password: string;
}

// Rol → .env anahtar eşlemesi. Senaryo ROLE konuşur; gerçek kullanıcı burada bağlanır.
// Yeni rol = yeni satır + .env'de ilgili USER/PASS. (Anahtar adı pozisyonel kalsa da
// senaryo/koddaki soyutlama ROLE'dür — pozisyon değil.)
const USER_ENV: Record<UserRole, { user: string; pass: string }> = {
  creator: { user: 'TEST1_USER', pass: 'TEST1_PASS' },
  reviewer: { user: 'TEST2_USER', pass: 'TEST2_PASS' },
};

/**
 * Rolün kimliğini env'den LAZY okur (yalnızca kullanılan rol .env'de zorunlu).
 * Modül yüklenirken patlamaz → web-only / kısmi koşular kırılmaz; eksikse o rol
 * KULLANILDIĞINDA fail-fast.
 */
export function userFor(role: UserRole): TestUser {
  const keys = USER_ENV[role];
  return { username: required(keys.user), password: required(keys.pass) };
}

/**
 * Kullanıcı ADINDAN kimliği bulur (senaryo "log in as projem.test1" derken). .env'de hangi
 * rol bu kullanıcı adını taşıyorsa onun parolasını döndürür; eşleşme yoksa fail-fast.
 */
export function userByUsername(username: string): TestUser {
  for (const role of Object.keys(USER_ENV) as UserRole[]) {
    if (process.env[USER_ENV[role].user] === username) {
      return { username, password: required(USER_ENV[role].pass) };
    }
  }
  throw new Error(`[env] '${username}' kullanıcısı .env'de tanımlı değil (TEST*_USER eşleşmiyor).`);
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
  AUTH_CLIENT_ID: optional('AUTH_CLIENT_ID', ''),

  /** --- DB (stub fazda boş geçilebilir) --- */
  DB_SQL_URL: optional('DB_SQL_URL', ''),
  DB_NOSQL_URL: optional('DB_NOSQL_URL', ''),

  /** --- Mobile / Appium (Faz 4 — stub fazda boş geçilebilir) --- */
  APPIUM_URL: optional('APPIUM_URL', ''),
} as const;
