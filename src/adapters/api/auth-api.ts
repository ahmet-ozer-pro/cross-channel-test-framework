import type { APIRequestContext } from '@playwright/test';
import { env } from '../../support/config/env';

/**
 * AuthApi — Keycloak'tan access token alır.
 *
 * ŞEMA VARSAYIMLARI — gerçek test ortamına göre DOĞRULA:
 *  - Password grant kullanılıyor (resource owner password credentials).
 *  - Token endpoint'in tam yolu env.AUTH_URL içinde.
 *  - client_id env.AUTH_CLIENT_ID içinde.
 * Farklıysa (örn. authorization code flow) bu sınıfı buna göre değiştir.
 */
export class AuthApi {
  constructor(private readonly api: APIRequestContext) {}

  async getToken(username: string, password: string): Promise<string> {
    const res = await this.api.post(env.AUTH_URL, {
      form: {
        grant_type: 'password',
        client_id: env.AUTH_CLIENT_ID,
        username,
        password,
      },
    });
    if (!res.ok()) {
      throw new Error(
        `[AuthApi] token alınamadı: ${res.status()} ${await res.text()}`,
      );
    }
    const body = await res.json();
    return body.access_token as string;
  }
}
