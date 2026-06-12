import { type Page, expect } from '@playwright/test';
import { timeouts } from '../../support/config/timeouts';
import { expectSuccessToast } from './primereact';
import type { AppShellPort } from '../../core/ports/gorev-web-ports';

/**
 * AppShellPage — uygulama kabuğu (AppShellPort): ana sayfa, çıkış, global toast.
 * Çıkış akışı: top bar power-off ikonu → onay (#logout-confirm-btn).
 * DOĞRULA: power-off ikonu bir menü ardındaysa önce menü açılmalı (canlıda teyit).
 */
export class AppShellPage implements AppShellPort {
  constructor(private readonly page: Page) {}

  async expectHome(): Promise<void> {
    await expect(this.page.locator('.layout-topbar-logo')).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async logout(): Promise<void> {
    await this.page.locator('a:has(i.pi-power-off)').click();
    await this.page.locator('#logout-confirm-btn').click();
  }

  async expectSuccessToast(): Promise<void> {
    await expectSuccessToast(this.page);
  }
}
