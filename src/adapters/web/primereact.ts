import { type Page, expect } from '@playwright/test';
import { timeouts } from '../../support/config/timeouts';

/**
 * PrimeReact etkileşim yardımcıları (web kanalı — DRY).
 *
 * taskType/priority/assignedTo/status hepsi AYNI p-dropdown desenidir → tek helper.
 * Aynı şekilde p-calendar (tarih) ve p-toast (bildirim) ortak. Tool-bağlı kod yalnızca
 * adapters/web altında; POM'lar bunları çağırır (raw locator tekrarı yok).
 */

/** Türkçe-duyarlı sadeleştirme — Gherkin ASCII metni ("Islemde") UI Türkçe'siyle ("İşlemde") eşleşsin. */
function trFold(value: string): string {
  return value
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/** `#id` p-dropdown'unu açar, panelde etiketi (TR-fold içerir) eşleşen seçeneği tıklar. */
export async function selectDropdownOption(
  page: Page,
  containerId: string,
  label: string,
): Promise<void> {
  await page.locator(`#${containerId}`).click();
  const panel = page.locator('.p-dropdown-panel').last();
  await expect(panel).toBeVisible({ timeout: timeouts.expect });

  const items = panel.locator('li.p-dropdown-item');
  const target = trFold(label);
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const text = (await items.nth(i).innerText()).trim();
    if (trFold(text).includes(target)) {
      await items.nth(i).click();
      return;
    }
  }
  throw new Error(`[primereact] '#${containerId}' dropdown'unda '${label}' seçeneği yok.`);
}

/** `#id` p-calendar'ını açar ve BUGÜN'ü seçer. */
export async function pickToday(page: Page, calendarId: string): Promise<void> {
  await page.locator(`#${calendarId} button.p-datepicker-trigger`).click();
  const today = page.locator('.p-datepicker-today').last();
  await expect(today).toBeVisible({ timeout: timeouts.expect });
  await today.click();
}

/** Başarı toast'unun göründüğünü doğrular. */
export async function expectSuccessToast(page: Page): Promise<void> {
  await expect(page.locator('.p-toast-message-success').last()).toBeVisible({
    timeout: timeouts.expect,
  });
}
