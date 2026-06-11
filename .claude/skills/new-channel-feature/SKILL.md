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
4. **Spec yaz.** `tests/<domain>/<isim>.spec.ts`. Test somut adapter'a değil **port
   fixture'ına** bağlanır; web doğrulaması Page Object (POM) üzerinden; `expect` ile assert.
5. **Doğrula.** typecheck → arch:check → test:list → (backend varsa) `npm test`.

## Kurallar
- Her senaryo kendi verisini üretir; benzersiz olsun (randomUUID — paralel güvenlik).
- Test/task somut client'a değil port'a bağlanır. Ham Playwright page çağrısını spec'e sızdırma.
