import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettierConfig from 'eslint-config-prettier';

/**
 * ESLint flat config (ADR-0001 — kod kalitesi enforcement).
 *
 * KISS/DRY MAKİNE-ZORLAMASI: sonarjs ile bilişsel karmaşıklık, string/fonksiyon
 * duplikasyonu otomatik denetlenir → "KISS/DRY'ye uy" temenni değil, CI gate'i.
 * prettierConfig EN SONDA: format kurallarını kapatır (format = Prettier'in işi).
 */
export default tseslint.config(
  {
    ignores: [
      '.features-gen/**', // playwright-bdd üretimi (lint edilmez)
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'reports/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended, sonarjs.configs.recommended, prettierConfig],
    rules: {
      // KISS: bir fonksiyonun bilişsel karmaşıklığı sınırlı (büyürse böl).
      'sonarjs/cognitive-complexity': ['error', 15],
      // DRY: aynı string 4+ kez tekrar ederse sabite çıkar.
      'sonarjs/no-duplicate-string': ['error', { threshold: 4 }],
      // `_` önekli arg/var = bilinçli kullanılmayan (stub imzası vb.) — standart konvansiyon.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
