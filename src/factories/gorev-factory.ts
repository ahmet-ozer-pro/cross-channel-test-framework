import { uniqueName } from '../support/test-run';

/**
 * Görev test verisi factory'si (ADR-0001). Benzersiz Konu → paralelde çakışmaz, üretilen
 * görev koşuma (testRunId) izlenir. Konu stage-1'de üretilir, stage-2'de arama ile doğrulanır.
 */
export function newGorevKonu(): string {
  return uniqueName('Gorev');
}
