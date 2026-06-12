---
name: new-channel-feature
description: Yeni bir cross-channel test senaryosu (API ile üretip web/mobil/db'de doğrulama) eklerken kullan. Port/adapter/fixture/task tanımlama, tipli store key, Playwright Test spec yazma (port'a bağlı), cleanup kaydetme ve doğrulama adımlarını içerir. Kullanıcı "yeni senaryo ekle", "cross-channel test yaz", "API'de üretilen X web'de görünsün" dediğinde tetiklenir.
---

# Yeni Cross-Channel Senaryo Ekleme (ADR-0001 — Playwright Test)

1. **Port + adapter.** Yetenek için `src/core/ports/<x>-port.ts` (arayüz) + somut
   `src/adapters/<kanal>/<x>.api-adapter.ts`. Tool-bağlı kod yalnızca adapter'da.
2. **Fixture.** `src/core/fixtures/test-fixtures.ts`'e küçük bir fixture ekle (port'u
   adapter ile enjekte eder). Mega-fixture yapma.
3. **Factory + task.** `src/factories/<x>-factory.ts` (benzersiz veri) ve
   `src/tasks/<x>-tasks.ts` (üret + cleanup.register AYNI yerde + store'a yaz).
4. **Senaryoyu yaz — KANAL klasörü + DOMAIN tag (ADR-0002):**
   - **Klasör:** tek kanal → `tests/<kanal>/` (web/mobile/api/db); çok kanal →
     `tests/cross-channel/`.
   - **TAG (zorunlu):** `@<domain>` (örn. `@issue`) + dokunulan kanal tag'leri (`@api @web`)
     + tür (`@smoke`/`@e2e`/`@contract`); çok-kanal ise `@cross-channel`.
   - **BDD/Gherkin (tercih):** `tests/<kanal>/<isim>.feature` + `src/steps/<x>.steps.ts`.
     Step'ler `createBdd(test)` ile (fixtures'a bağlı); state tipli store ile (When push, Then oku).
   - **Saf spec:** `tests/<kanal>/<isim>.spec.ts`. Aynı runner'da yan yana koşar.
   Her iki biçimde de: test/step somut adapter'a değil **port fixture'ına** bağlanır;
   web doğrulaması Page Object (POM) üzerinden; `expect` POM içinde.
5. **Doğrula.** typecheck → arch:check → test:list (bddgen `.feature`'ı derler) →
   (backend varsa) `npm test`.

## Kurallar
- Her senaryo kendi verisini üretir; benzersiz olsun (randomUUID — paralel güvenlik).
- Test/step/task somut client'a değil port'a bağlanır. Ham Playwright page çağrısını
  step/spec'e sızdırma (POM kullan).
- Gherkin'i tamamen kaldırma; bu bağlayıcı karar, değişmesi yeni ADR ister.
