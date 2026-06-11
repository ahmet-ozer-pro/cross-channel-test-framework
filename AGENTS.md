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

1. **Runner = Playwright Test.** Yeni testler `*.spec.ts` ya da `playwright-bdd` ile
   `*.feature`. `cucumber-js`'e yeni bağımlılık/senaryo EKLEME.
2. **Ports & Adapters.** Test/step somut client'a değil **port arayüzüne** bağlanır;
   adapter **fixture** ile enjekte edilir. Tool-bağlı kod (Playwright/Appium/pg/Pact)
   YALNIZCA `src/adapters/**` altında.
3. **Screenplay YASAK.** Chaining = `src/tasks/**` altındaki kompoze edilebilir görevler.
4. **Kanal izolasyonu.** Kanallar yalnızca tipli context/store üzerinden konuşur;
   bir kanal başka kanalın adapter'ını import etmez (dependency-cruiser zorlar).
5. **Organizasyon DOMAIN bazlı** (`tests/<domain>/`), kanal bazlı değil.
6. **Test verisi:** factory + benzersiz üretim + üretimle aynı yerde cleanup.
7. **Ölçek:** paralellik + CI sharding + retry/`@quarantine` + dirençli locator.
8. **Test dağılımı:** 10k'nın hepsi yavaş e2e OLAMAZ — çok contract/API, az e2e.

## Doğrulama (bir değişikliği "bitti" demeden önce)

`npm run typecheck && npm run arch:check && npm run test:dry && npm run test:unit`
dördü de temiz geçmeli.

## Migrasyon notu

Bu repo cucumber-js'ten Playwright Test'e **evrimsel** geçiyor. Mevcut cucumber
senaryoları geçiş köprüsünde yaşar; YENİ kod ADR-0001 yönünde yazılır. Çakışmada
ADR-0001 önceliklidir.
