import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifyError } from '../../src/support/flaky';

/**
 * Flaky taksonomisi testleri. classifyError bir hatayı kökenine eşler (triage ipucu);
 * @quarantine kararını besleyen sınıflandırmanın regresyonunu kilitler.
 */
describe('classifyError — flaky reason taksonomisi', () => {
  test('timeout mesajı → timeout', () => {
    assert.equal(classifyError(new Error('Timeout 5000ms exceeded')), 'timeout');
  });

  test('strict-mode/locator mesajı → locator', () => {
    assert.equal(classifyError(new Error('strict mode violation: 2 elements')), 'locator');
  });

  test('store/koleksiyon mesajı → data', () => {
    assert.equal(classifyError(new Error("'CREATED_ISSUES' koleksiyonu init edilmedi")), 'data');
  });

  test('5xx/bağlantı mesajı → network', () => {
    assert.equal(classifyError(new Error('request failed with 503')), 'network');
  });

  test('tanınmayan mesaj → unknown', () => {
    assert.equal(classifyError(new Error('beklenmedik bir şey')), 'unknown');
  });

  test('Error olmayan değer de güvenli sınıflanır', () => {
    assert.equal(classifyError('econnreset'), 'network');
  });
});
