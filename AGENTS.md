# AGENTS.md — AI/agent araçları için bağlayıcı talimatlar

Bu dosya, bu repoda çalışan TÜM AI kod araçları içindir (Claude Code, GitHub Copilot,
Cursor, Windsurf, GPT-tabanlı agent'lar vb.). Claude Code ayrıca [CLAUDE.md](CLAUDE.md)
okur; tüm araçlar bu dosyayı okumalıdır.

## EN ÖNEMLİ KURAL

**Mimari [docs/adr/0001-test-otomasyon-mimarisi.md](docs/adr/0001-test-otomasyon-mimarisi.md)
ile BAĞLANMIŞTIR. Uy. Bu karardan sapmak için YENİ BİR ADR (0002…) gerekir.
Tek bir görev/PR içinde sessizce sapma, "kısa yol", "şimdilik şöyle yapalım" YASAKTIR.**

Bir değişiklik bu kurallardan biriyle çelişiyorsa: DURUP kullanıcıya söyle, kararı
kendi başına bozma.

## Bağlayıcı özet (tam metin ADR-0001'de)

1. **Runner = Playwright Test (TEK runner).** Senaryolar Gherkin `.feature` (playwright-bdd
   ile derlenir) ve/veya saf `*.spec.ts` — ikisi aynı runner'da yan yana (`tests/<kanal>/`),
   step'ler `src/steps/`. **BDD/Gherkin KORUNUR.** Eski `cucumber-js` RUNNER'ı kaldırıldı —
   geri EKLEME; AYRI runner getirme. Gherkin'i kaldırmak YENİ BİR ADR gerektirir.
2. **Ports & Adapters.** Test/step somut client'a değil **port arayüzüne** bağlanır;
   adapter **fixture** ile enjekte edilir. Tool-bağlı kod (Playwright/Appium/pg/Pact)
   YALNIZCA `src/adapters/**` altında.
3. **Screenplay YASAK.** Chaining = `src/tasks/**` altındaki kompoze edilebilir görevler.
4. **Kanal izolasyonu.** Kanallar yalnızca tipli context/store üzerinden konuşur;
   bir kanal başka kanalın adapter'ını import etmez (dependency-cruiser zorlar).
5. **Organizasyon KANAL bazlı** (`tests/{web,mobile,api,db}/` + `cross-channel/`, ADR-0002);
   domain ekseni **zorunlu `@<domain>` tag**'iyle (`--grep @issue`).
6. **Test verisi:** factory + benzersiz üretim + üretimle aynı yerde cleanup.
7. **Ölçek:** paralellik + CI sharding + retry/`@quarantine` + dirençli locator.
8. **Test dağılımı:** 10k'nın hepsi yavaş e2e OLAMAZ — çok contract/API, az e2e.

## Doğrulama (bir değişikliği "bitti" demeden önce)

`npm run lint && npm run format:check && npm run typecheck && npm run arch:check &&
npm run test:unit && npm run test:list` altısı da temiz geçmeli (CI gate).

## Migrasyon notu

Bu repo, RUNNER'ı cucumber-js'ten Playwright Test'e taşıdı; **Gherkin katmanı korundu**
(playwright-bdd ile aynı runner'da). YENİ kod ADR-0001 yönünde yazılır; tek runner
Playwright Test, BDD `.feature` ve `.spec.ts` yan yana. Çakışmada ADR-0001 önceliklidir.
