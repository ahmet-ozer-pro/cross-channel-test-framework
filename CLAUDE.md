# Cross-Channel Test Framework

Cross-channel (API + Web + Mobile + DB + Contract) test otomasyonu.
Stack: TypeScript · **Playwright Test** · (Appium / Pact — sonraki fazlar).

Bu repo iskelet aşamasında: domain implementasyonları henüz yok, mimari guardrail'lar yerinde.
Hedef: hızlı büyürken mimari olgunluğu korumak.

## Mimari Karar (BAĞLAYICI — ADR-0001)

> **Bu repoda kod yazan her AI aracı (Claude Code, Copilot, Cursor, GPT-tabanlı agent)
> ve insan, [docs/adr/0001-test-otomasyon-mimarisi.md](docs/adr/0001-test-otomasyon-mimarisi.md)'e
> UYMAK ZORUNDADIR. Bu karardan sapmak için YENİ BİR ADR gerekir; tek tek
> PR/commit içinde sessizce sapma YASAKTIR.**

Özet (tam metin ADR-0001'de):
- **Runner = Playwright Test (TEK runner).** Testler `*.spec.ts` (`tests/<domain>/`).
- **Ports & Adapters:** Test/task somut client'a (`IssueApi`…) değil **port arayüzüne**
  bağlanır; adapter **fixture** ile enjekte edilir. Tool-bağlı kod yalnızca `src/adapters/**`.
- **Screenplay YASAK.** Chaining `src/tasks/**` altındaki kompoze edilebilir görevlerle.
- **Organizasyon DOMAIN bazlı** (`tests/<domain>/`), kanal bazlı değil.
- **Test dağılımı:** 10k'nın hepsi yavaş e2e olamaz — çok contract/API, az e2e (test trophy).

## Komutlar

- `npm run typecheck` — TypeScript tip kontrolü (env'e dokunmaz, her zaman çalışır)
- `npm run arch:check` — ports/adapters katmanlama enforcement (dependency-cruiser)
- `npm run test:unit` — framework self-test (store/cleanup/locator; env'siz)
- `npm run test:list` — Playwright testlerini derleyip listeler (browser/backend gerekmez)
- `npm test` — tüm Playwright suite (gerçek backend + browser ister)

## Mimari Kurallar (BOZULAMAZ)

1. Kanallar yalnızca tipli `store` (fixture) üzerinden konuşur. Bir kanalın adapter'ı
   başka kanalın adapter'ını import ETMEZ. (Bu kural `arch:check` ile zorlanır.)
2. Store anahtarları `defineKey<T>` / `defineCollectionKey<T>` ile tipli (`store-keys.ts`).
   Raw `Map<string, any>` YASAK. Yeni anahtarın tipini ver, yazan kanalı yorumla belirt.
3. Test/task somut adapter'a değil **port arayüzüne** bağlanır; adapter **fixture** ile
   enjekte edilir. Tool-bağlı kod (Playwright/Appium/pg/Pact) YALNIZCA `src/adapters/**`.
4. Test içine ham Playwright page çağrısı yazma; web etkileşimi **Page Object (POM)**
   üzerinden git (`expect` ile assertion serbesttir).
5. Üretilen veriyi `cleanup.register(...)` ile ÜRETİMLE AYNI yerde kaydet (fixture
   teardown'da LIFO koşar). Karmaşık akışlar `src/tasks/**` görevleriyle kompoze edilir.

## İsimlendirme

- Web Page Object → `*.page.ts` (`adapters/web/`)
- Mobile Screen Object → `*.screen.ts` (`adapters/mobile/`)
- Port (arayüz) → `*-port.ts` (`core/ports/`) · Adapter → `*.api-adapter.ts` (`adapters/<kanal>/`)
- Task → `*-tasks.ts` (`tasks/`) · Factory → `*-factory.ts` (`factories/`)
- Spec → `*.spec.ts` (`tests/<domain>/`)

## Kod Standardı

- Secrets asla kodda hardcoded değil — sadece `env`'den (`support/config/env.ts`).
- Locator stratejisi: `getByRole` / `getByLabel` / `getByTestId` önce. CSS/XPath son çare.
- Locator'ı tahmin etme — Playwright MCP varsa canlı sayfadan keşfet.
- Paralel koşuda veri çakışmasını önlemek için üretilen veriyi benzersiz yap (randomUUID).

## Faz Durumu

- Runner: cucumber-js EMEKLİ; tek runner Playwright Test (ADR-0001).
- Çekirdek: ports/adapters + fixtures + dependency-cruiser + CI — kuruldu.
- Sıradaki: ilk domain dikey dilimi (Issue: port+adapter+fixture+task+POM+spec).
- Faz 2/4/5: DB · Mobile (Appium) · Contract (Pact) — bekliyor.

## Tamamlandı Demeden Önce

`typecheck` + `arch:check` + `test:unit` + `test:list` dördü de temiz geçmeli.
Bir stub'ı gerçek implementasyona bağlarken ilgili spec'i de yeşile çevir.

## Çalışma Tarzı

- Değişiklik yaparken etki analizi yap: bu değişiklik başka spec'i/task'ı bozuyor mu?
- Dosya düzenlemek için `sed` yerine `python3` inline script tercih et.
