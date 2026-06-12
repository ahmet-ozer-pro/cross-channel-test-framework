/**
 * dependency-cruiser — JS/TS dünyasının ArchUnit'i.
 * ArchUnit'le yapılan boundary enforcement'ın TypeScript karşılığı (ADR-0001).
 *
 * Ports & Adapters katmanlamasını YAPISAL olarak zorlar: soyutlama (port) somuta
 * (adapter/channel) bağlanamaz, tool-bağlı kod adapter'da kalır, kanallar izole.
 * Kural ihlali CI'da build'i kırar.
 *
 * Çalıştırma: npx depcruise src --config .dependency-cruiser.js
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Döngüsel bağımlılık yasak.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },

    // --- ADR-0001: Ports & Adapters katmanlama (soyutlama somuta bağlanmaz) ---
    {
      name: 'ports-are-pure',
      comment: 'Port (soyutlama) somut adapter/fixture\'a bağlanamaz — tool-bağımsız kalır.',
      severity: 'error',
      from: { path: '^src/core/ports' },
      to: { path: '^src/(adapters|core/fixtures)' },
    },
    {
      name: 'ports-no-tool',
      comment: 'Port arayüzleri HİÇBİR tool/npm paketi import edemez (saf TS sözleşmesi).',
      severity: 'error',
      from: { path: '^src/core/ports' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-peer', 'npm-optional'] },
    },
    {
      name: 'tasks-use-ports-not-adapters',
      comment: 'Task\'lar somut adapter\'a değil port\'a bağlanır (DI ile gelir).',
      severity: 'error',
      from: { path: '^src/tasks' },
      to: { path: '^src/adapters' },
    },
    {
      name: 'steps-use-ports-not-adapters',
      comment: 'Gherkin step\'leri somut adapter/POM\'a değil port\'a (fixture) bağlanır.',
      severity: 'error',
      from: { path: '^src/steps' },
      to: { path: '^src/adapters' },
    },
    {
      name: 'support-no-adapters',
      comment: 'support/ altyapısı somut adapter\'a bağlanamaz (bağımlılık yönü: adapter→support).',
      severity: 'error',
      from: { path: '^src/support' },
      to: { path: '^src/adapters' },
    },
    {
      name: 'adapters-channel-isolation',
      comment: 'Bir kanalın adapter\'ı başka kanalın adapter\'ını import edemez.',
      severity: 'error',
      from: { path: '^src/adapters/([^/]+)/' },
      to: {
        path: '^src/adapters/([^/]+)/',
        pathNot: '^src/adapters/$1/',
      },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
  },
};
