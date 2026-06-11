import { randomUUID } from 'node:crypto';

/**
 * Issue test verisi factory'si (ADR-0001).
 * Tek sorumluluk: issue girdisi üret. Benzersiz varsayılan (randomUUID) → paralelde çakışmaz.
 * Override ile özelleştir; "her şeyi bilen" god-builder OLUŞTURMA.
 */
export interface IssueInput {
  summary: string;
}

export function newIssueInput(overrides: Partial<IssueInput> = {}): IssueInput {
  return {
    summary: `Test Issue ${randomUUID()}`,
    ...overrides,
  };
}
