/**
 * dependency-cruiser — JS/TS dünyasının ArchUnit'i.
 * ArchUnit'le yapılan boundary enforcement'ın TypeScript karşılığı.
 *
 * Burada kanal izolasyonunu YAPISAL olarak zorluyoruz: bir kanalın step'i
 * başka kanalın page/screen/client objesini import EDEMEZ. Kanallar yalnızca
 * support/store üzerinden konuşur. Kural ihlali CI'da build'i kırar.
 *
 * Çalıştırma: npx depcruise src --config .dependency-cruiser.js
 */
module.exports = {
  forbidden: [
    {
      name: 'api-steps-no-cross-channel',
      comment: 'API step\'leri web/mobile/db kanal objelerini import edemez.',
      severity: 'error',
      from: { path: '^src/steps/api' },
      to: { path: '^src/channels/(web|mobile|db)' },
    },
    {
      name: 'web-steps-no-cross-channel',
      comment: 'Web step\'leri api/mobile/db kanal objelerini import edemez.',
      severity: 'error',
      from: { path: '^src/steps/web' },
      to: { path: '^src/channels/(api|mobile|db)' },
    },
    {
      name: 'mobile-steps-no-cross-channel',
      comment: 'Mobile step\'leri api/web/db kanal objelerini import edemez.',
      severity: 'error',
      from: { path: '^src/steps/mobile' },
      to: { path: '^src/channels/(api|web|db)' },
    },
    {
      name: 'channels-no-step-imports',
      comment: 'Kanal objeleri step\'leri import edemez (tek yönlü bağımlılık).',
      severity: 'error',
      from: { path: '^src/channels' },
      to: { path: '^src/steps' },
    },
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
