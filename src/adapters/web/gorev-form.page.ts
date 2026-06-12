import { type Page } from '@playwright/test';
import { selectDropdownOption, pickToday } from './primereact';
import type { GorevFormPort } from '../../core/ports/gorev-web-ports';

/**
 * GorevFormPage — yeni görev formu (GorevFormPort). Stabil id'ler: #title, #taskType,
 * #priority, #dueDate, #assignedTo, #save-new-task-btn. Dropdown/tarih ortak helper'dan (DRY).
 * DOĞRULA: "Ekle" butonu liste sayfasında tek olmalı; değilse scope daraltılır.
 */
export class GorevFormPage implements GorevFormPort {
  constructor(private readonly page: Page) {}

  async openCreate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Ekle' }).first().click();
  }

  async fillSubject(subject: string): Promise<void> {
    await this.page.locator('#title').fill(subject);
  }

  async selectType(label: string): Promise<void> {
    await selectDropdownOption(this.page, 'taskType', label);
  }

  async selectPriority(label: string): Promise<void> {
    await selectDropdownOption(this.page, 'priority', label);
  }

  async pickDueDateToday(): Promise<void> {
    await pickToday(this.page, 'dueDate');
  }

  async assignTo(name: string): Promise<void> {
    await selectDropdownOption(this.page, 'assignedTo', name);
  }

  async submit(): Promise<void> {
    await this.page.locator('#save-new-task-btn').click();
  }
}
