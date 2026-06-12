import { testRunId, uniqueName } from '../support/test-run';

/**
 * Issue test verisi factory'si (ADR-0001).
 * Tek sorumluluk: issue girdisi üret. Benzersiz varsayılan (worker-safe uniqueName) →
 * paralelde çakışmaz, üretilen veri koşuma (testRunId) izlenir. Override ile özelleştir;
 * "her şeyi bilen" god-builder OLUŞTURMA.
 */
export interface IssueInput {
  summary: string;
  /**
   * Üretildiği koşum (sahiplik/orphan tespiti). Gerçek API'ye bağlanırken bir custom
   * alana (label/properties) map'lenebilir — şimdilik summary zaten testRunId taşır.
   */
  testRunId: string;
}

export function newIssueInput(overrides: Partial<IssueInput> = {}): IssueInput {
  return {
    summary: uniqueName('Test Issue'),
    testRunId,
    ...overrides,
  };
}
