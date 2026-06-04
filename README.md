# Cross-Channel Test Automation Framework

API + Web + Mobile + DB + Contract kanallarını tek bir BDD framework'ünde
birleştiren cross-channel test otomasyon iskeleti.

Stack: **TypeScript · Cucumber JS · Playwright · (Appium / Pact / DB — sonraki fazlar)**

> Bu repo şu an **iskelet**. Kanal implementasyonları stub; mimari guardrail'lar
> ise baştan yerinde. Amaç: hızlı büyürken mimari olgunluğu kaybetmemek.

---

## Mimari Kurallar (bozulmaması gerekenler)

Bu beş kural framework'ün belkemiği. AI araçlarıyla (Claude Code) geliştirirken
bile bunları dayat — boilerplate hızlı üretilir, mimari kararları sen verirsin.

1. **Tek state kaynağı: `TestWorld`.**
   Tüm senaryo state'i World'de yaşar. Global değişken, modül-seviyesi state yok.

2. **Kanallar yalnızca `store` üzerinden konuşur.**
   API step'i veriyi `store`'a yazar; Web/Mobile step'i okur. Hiçbir step başka
   kanalın `page`/`driver`/`client` objesine dokunmaz. Bu kural
   `.dependency-cruiser.js` ile CI'da **yapısal olarak zorlanır** (ArchUnit gibi).

3. **Store anahtarları tipli.** `store-keys.ts` içinde `defineKey<T>` ile tanımlanır.
   Raw `Map<string, any>` yasak. Bu, `evrakNo`/`evrakSayi` karışıklığını compile
   zamanında imkansız kılar.

4. **Her senaryo kendi verisini üretir; ürettiğini temizler.**
   Üretimi yapan step, cleanup'ını aynı yerde `this.cleanup.register(...)` ile
   kaydeder. `After` hook'u LIFO sırayla hepsini çalıştırır. Test verisi birikmez.

5. **Secrets asla kodda değil.** Tüm credential'lar `env`'den okunur, başlangıçta
   doğrulanır (fail-fast). `.env` repoya girmez.

---

## Dizin Yapısı

```
src/
  support/
    world.ts            # TestWorld — tek state kaynağı, fail-loud getter'lar
    hooks.ts            # Tag bazlı kanal init + teardown
    store.ts            # TypedStore — tip güvenli, eksik anahtarda fırlatır
    store-keys.ts       # defineKey<T> — anahtar kataloğu + sahiplik
    cleanup-registry.ts # Teardown disiplini (LIFO)
    config/env.ts       # Secrets + ortam, fail-fast validation
  channels/             # Kanal objeleri (POM / API client / DB client)
    api/  web/  mobile/  db/
  steps/                # Kanal bazlı step'ler — birbirini import edemez
    api/  web/  mobile/  db/  common/
features/               # .feature dosyaları (Gherkin)
.dependency-cruiser.js  # Kanal izolasyonu enforcement (ArchUnit karşılığı)
```

---

## Kurulum & Çalıştırma

```bash
npm install
npx playwright install
cp .env.example .env      # gerçek değerleri gir

npm run typecheck         # tip kontrolü
npm run arch:check        # kanal izolasyonu ihlali var mı?
npm run test:dry          # undefined/ambiguous step kontrolü (browser açmadan)
npm test                  # tüm suite
npm run test:parallel     # paralel
```

> **Feature dosyaları:** Bu teslimde `.feature.txt` uzantılı. Çalıştırmadan önce
> `.feature` olarak yeniden adlandır (cucumber.js `.feature` bekler).

---

## Faz Sıralaması

| Faz | İçerik | Durum |
|-----|--------|-------|
| 1 | Web UI + API + World/hook iskeleti | İskelet hazır (stub) |
| 2 | DB doğrulama (SQL + NoSQL) | Stub |
| 3 | Cross-channel senaryolar | Örnek hazır |
| 4 | Mobile (Appium remote client) | Planlandı |
| 5 | Consumer contract (Pact) | Planlandı |

---

## CI Önerisi (sıra önemli)

```
typecheck  ->  arch:check  ->  test:dry  ->  test:smoke  ->  test (parallel/sharded)
```

`arch:check` ve `test:dry`'ı smoke'tan ÖNCE koy: mimari ihlali ve eksik step'i
browser açmadan, saniyeler içinde yakalarsın.
