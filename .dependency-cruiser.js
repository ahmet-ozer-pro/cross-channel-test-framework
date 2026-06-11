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
      comment: 'Port (soyutlama) somut adapter/channel/fixture\'a bağlanamaz — tool-bağımsız kalır.',
      severity: 'error',
      from: { path: '^src/core/ports' },
      to: { path: '^src/(adapters|channels|core/fixtures)' },
    },
    {
      name: 'tasks-use-ports-not-adapters',
      comment: 'Task\'lar somut adapter\'a değil port\'a bağlanır (DI ile gelir).',
      severity: 'error',
      from: { path: '^src/tasks' },
      to: { path: '^src/(adapters|channels)' },
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
