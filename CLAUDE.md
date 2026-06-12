# Cross-Channel Test Framework

Cross-channel (API + Web + Mobile + DB + Contract) test otomasyonu.
Stack: TypeScript · **Playwright Test** · **playwright-bdd (Gherkin)** · (Appium / Pact — sonraki fazlar).

Bu repo iskelet aşamasında: domain implementasyonları henüz yok, mimari guardrail'lar yerinde.
Hedef: hızlı büyürken mimari olgunluğu korumak.

## Mimari Karar (BAĞLAYICI — ADR-0001)

> **Bu repoda kod yazan her AI aracı (Claude Code, Copilot, Cursor, GPT-tabanlı agent)
> ve insan, [docs/adr/0001-test-otomasyon-mimarisi.md](docs/adr/0001-test-otomasyon-mimarisi.md)'e
> UYMAK ZORUNDADIR. Bu karardan sapmak için YENİ BİR ADR gerekir; tek tek
> PR/commit içinde sessizce sapma YASAKTIR.**

Özet (tam metin ADR-0001'de):
- **Runner = Playwright Test (TEK runner).** Senaryolar Gherkin `.feature` (playwright-bdd
  ile derlenir) ve/veya saf `*.spec.ts` — ikisi aynı runner'da yan yana (`tests/<domain>/`).
  **BDD/Gherkin korunur.** Step'ler `src/steps/`.
- **Ports & Adapters:** Test/task somut client'a (`IssueApi`…) değil **port arayüzüne**
  bağlanır; adapter **fixture** ile enjekte edilir. Tool-bağlı kod yalnızca `src/adapters/**`.
- **Screenplay YASAK.** Chaining `src/tasks/**` altındaki kompoze edilebilir görevlerle.
- **Organizasyon DOMAIN bazlı** (`tests/<domain>/`), kanal bazlı değil.
- **Test dağılımı:** 10k'nın hepsi yavaş e2e olamaz — çok contract/API, az e2e (test trophy).

## Komutlar

- `npm run typecheck` — TypeScript tip kontrolü (env'e dokunmaz, her zaman çalışır)
- `npm run arch:check` — ports/adapters katmanlama enforcement (dependency-cruiser)
- `npm run test:unit` — framework self-test (store/cleanup/locator; env'siz)
- `npm run test:list` — `.feature`'ları derler (bddgen) + testleri listeler (browser/backend gerekmez)
- `npm test` — tüm suite (gerçek backend + browser ister; @quarantine hariç)
- `npm run test:quarantine` — yalnızca `@quarantine`'li (kararsız) testleri koşar

## Mimari Kurallar (BOZULAMAZ)

1. Kanallar yalnızca tipli `store` (fixture) üzerinden konuşur. Bir kanalın adapter'ı
   başka kanalın adapter'ını import ETMEZ. (Bu kural `arch:check` ile zorlanır.)
2. Store anahtarları `defineKey<T>` / `defineCollectionKey<T>` ile tipli (`store-keys.ts`).
   Raw `Map<string, any>` YASAK. Yeni anahtarın tipini ver, yazan kanalı yorumla belirt.
3. Test/task/step somut adapter'a değil **port arayüzüne** bağlanır; adapter **fixture** ile
   enjekte edilir. Tool-bağlı kod (Playwright/Appium/pg/Pact) YALNIZCA `src/adapters/**`.
   **Web de port arkasında** (`IssueBoardPort`); step/task POM'u `new`'lemez, fixture enjekte eder.
4. Test/step içine ham Playwright page çağrısı yazma; web etkileşimi **Page Object (POM)**
   üzerinden git (`expect` POM içinde serbest; Locator dışarı sızmaz).
5. Üretilen veriyi `cleanup.register(...)` ile ÜRETİMLE AYNI yerde kaydet (fixture
   teardown'da LIFO koşar). Karmaşık akışlar `src/tasks/**` görevleriyle kompoze edilir.
6. **Bekleme: hard-wait YASAK** (`waitForTimeout`/`sleep`/sabit ms yok). Auto-wait + web-first
   `expect`; cross-channel convergence için `support/wait.ts` `pollUntil`. Süreler
   `support/config/timeouts.ts`'ten (sihirli sayı yok). Kararsız test → `@quarantine`.

## İsimlendirme

- Web Page Object → `*.page.ts` (`adapters/web/`)
- Mobile Screen Object → `*.screen.ts` (`adapters/mobile/`)
- Port (arayüz) → `*-port.ts` (`core/ports/`) · Adapter → `*.api-adapter.ts` (`adapters/<kanal>/`)
- Task → `*-tasks.ts` (`tasks/`) · Factory → `*-factory.ts` (`factories/`)
- Spec → `*.spec.ts` (`tests/<domain>/`) · Gherkin → `*.feature` (`tests/<domain>/`)
- Step-def → `*.steps.ts` (`src/steps/`) — `createBdd(test)` ile fixtures'a bağlanır

## Kod Standardı

- Secrets asla kodda hardcoded değil — sadece `env`'den (`support/config/env.ts`).
- Locator stratejisi: `getByRole` / `getByLabel` / `getByTestId` önce. CSS/XPath son çare.
- Locator'ı tahmin etme — Playwright MCP varsa canlı sayfadan keşfet.
- Paralel koşuda veri çakışmasını önlemek için üretilen veriyi benzersiz yap (randomUUID).

## Faz Durumu

- Runner: TEK runner Playwright Test (ADR-0001). Eski cucumber-js RUNNER'ı kaldırıldı.
- BDD/Gherkin KORUNUR: `.feature` senaryoları `playwright-bdd` ile Playwright Test üstünde
  derlenir; `.feature` ve `.spec.ts` aynı runner'da yan yana koşar. Step'ler `src/steps/`.
- Çekirdek: ports/adapters + fixtures + dependency-cruiser + CI + playwright-bdd — kuruldu.
- Sıradaki: ikinci domain dilimi / tag taksonomisi; gerçek API'ye bağlama (bind-stub).
- Faz 2/4/5: DB · Mobile (Appium) · Contract (Pact) — bekliyor.

## Tamamlandı Demeden Önce

`typecheck` + `arch:check` + `test:unit` + `test:list` dördü de temiz geçmeli.
Bir stub'ı gerçek implementasyona bağlarken ilgili spec'i de yeşile çevir.

## Çalışma Tarzı

- Değişiklik yaparken etki analizi yap: bu değişiklik başka spec'i/task'ı bozuyor mu?
- Dosya düzenlemek için `sed` yerine `python3` inline script tercih et.
