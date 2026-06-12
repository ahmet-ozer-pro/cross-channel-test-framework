# GitHub Copilot talimatları

Bu repoda mimari **bağlayıcıdır**. Kod önermeden önce
[../docs/adr/0001-test-otomasyon-mimarisi.md](../docs/adr/0001-test-otomasyon-mimarisi.md)
ve [../AGENTS.md](../AGENTS.md) kurallarına uy.

Özet (tam metin ADR-0001'de) — bunlardan sapma YENİ BİR ADR gerektirir:
- Runner = **Playwright Test** (TEK runner). Senaryolar Gherkin `.feature` (playwright-bdd
  ile derlenir) ve/veya `*.spec.ts`; step'ler `src/steps/`. **BDD/Gherkin KORUNUR.** Eski
  `cucumber-js` RUNNER'ı kaldırıldı — geri ekleme; Gherkin'i kaldırmak yeni ADR ister.
- **Ports & Adapters:** test/step somut client'a değil **port**'a bağlanır, adapter
  **fixture** ile enjekte edilir; tool-bağlı kod yalnızca `src/adapters/**`.
- **Screenplay YASAK**; chaining `src/tasks/**` görevleriyle.
- Organizasyon **kanal bazlı** (`tests/{web,mobile,api,db}/` + `cross-channel/`, ADR-0002);
  domain = `@<domain>` tag. Kanal izolasyonu yalnızca tipli context üzerinden.
- 10k için: çok contract/API + az e2e (test trophy), paralel + sharding.
