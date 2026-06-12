import { type Page, expect } from '@playwright/test';
import { timeouts } from '../../support/config/timeouts';
import type { LoginPort } from '../../core/ports/gorev-web-ports';
import type { TestUser } from '../../support/config/env';

/**
 * LoginPage — Keycloak giriş formu (LoginPort'un web implementasyonu, ADR-0001).
 * Stabil id'ler: #username / #password / #kc-login.
 */
export class LoginPage implements LoginPort {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/', { timeout: timeouts.navigation });
  }

  async expectLoginPage(): Promise<void> {
    await expect(this.page.locator('#username')).toBeVisible({ timeout: timeouts.navigation });
  }

  async login(user: TestUser): Promise<void> {
    await this.page.locator('#username').fill(user.username);
    await this.page.locator('#password').fill(user.password);
    await this.page.locator('#kc-login').click();
  }
}
