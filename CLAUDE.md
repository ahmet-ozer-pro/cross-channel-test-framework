# Cross-Channel Test Framework

Cross-channel (API + Web + Mobile + DB + Contract) BDD test otomasyonu.
Stack: TypeScript · Cucumber JS · Playwright · (Appium / Pact — sonraki fazlar).

Bu repo iskelet aşamasında: kanal implementasyonları stub, mimari guardrail'lar yerinde.
Hedef: hızlı büyürken mimari olgunluğu korumak.

## Mimari Karar (BAĞLAYICI — ADR-0001)

> **Bu repoda kod yazan her AI aracı (Claude Code, Copilot, Cursor, GPT-tabanlı agent)
> ve insan, [docs/adr/0001-test-otomasyon-mimarisi.md](docs/adr/0001-test-otomasyon-mimarisi.md)'e
> UYMAK ZORUNDADIR. Bu karardan sapmak için YENİ BİR ADR gerekir; tek tek
> PR/commit içinde sessizce sapma YASAKTIR.**

Özet (tam metin ADR-0001'de):
- **Runner = Playwright Test.** Yeni testler burada koşar (`*.spec.ts` ya da
  `playwright-bdd` ile `*.feature`). `cucumber-js`'e yeni bağımlılık/senaryo EKLENMEZ.
- **Ports & Adapters:** Test/step somut client'a (`IssueApi`…) değil **port arayüzüne**
  bağlanır; adapter **fixture** ile enjekte edilir. Tool-bağlı kod yalnızca `src/adapters/**`.
- **Screenplay YASAK.** Chaining `src/tasks/**` altındaki kompoze edilebilir görevlerle.
- **Organizasyon DOMAIN bazlı** (`tests/<domain>/`), kanal bazlı değil.
- **Test dağılımı:** 10k'nın hepsi yavaş e2e olamaz — çok contract/API, az e2e (test trophy).
- Migrasyon **evrimsel**: yeni kod yeni mimaride, mevcut cucumber senaryoları köprüde yaşar.

## Komutlar

- `npm run typecheck` — TypeScript tip kontrolü (env'e dokunmaz, her zaman çalışır)
- `npm run arch:check` — kanal izolasyonu enforcement (dependency-cruiser)
- `npm run test:dry` — step eşleşmesi (browser açmadan; .env gerekir)
- `npm test` — tüm suite
- `npm run test:cross-channel` — sadece @cross-channel senaryolar
- `npm run test:parallel` — paralel koşu

## Mimari Kurallar (BOZULAMAZ)

1. Kanallar yalnızca `TestWorld` içindeki `store` üzerinden konuşur.
   API step'i `this.page`/mobile/db objesine ASLA dokunmaz. Veri akışı: API yazar,
   Web/Mobile okur. (Bu kural `arch:check` ile import seviyesinde zorlanır.)
2. Store anahtarları `defineKey<T>` ile tipli (`store-keys.ts`). Raw `Map<string, any>` YASAK.
   Yeni anahtar eklerken tipini ver ve yazan kanalı yorumla belirt.
3. Step tanımlarında arrow function KULLANMA. `async function (this: TestWorld) {...}`
   kullan — aksi halde `this`/World bağlanmaz, `this.store` patlar.
4. Step içine ham Playwright/Appium çağrısı yazma. Her zaman page/screen/client
   objesi üzerinden git (`IssueBoardPage`, `IssueApi` gibi).
5. Her senaryo verisini API ile üretir ve `this.cleanup.register(...)` ile temizliğini
   ÜRETİMLE AYNI step'te kaydeder. Test verisi birikmez.

> Kapsam notu: Yukarıdaki kurallar mevcut `cucumber-js` çekirdeği içindir ve geçerlidir.
> Kural 3 (arrow function yasağı) yalnızca cucumber step tanımlarına özeldir — hedef
> mimaride (Playwright Test fixtures / `*.spec.ts`) arrow function NORMALDİR. Kural 4'teki
> "page/screen/client objesi" hedef mimaride **port + adapter (fixture enjeksiyonu)** olarak
> evrilir. Yeni kod ADR-0001 yönünde yazılır; çakışmada ADR-0001 önceliklidir.

## İsimlendirme

- Web Page Object → `*.page.ts` (`channels/web/`)
- Mobile Screen Object → `*.screen.ts` (`channels/mobile/`)
- API client → `*-api.ts` (`channels/api/`)
- Cucumber step → `*.steps.ts` (`steps/<kanal>/`)

## Kod Standardı

- Secrets asla kodda hardcoded değil — sadece `env`'den (`support/config/env.ts`).
- Locator stratejisi: `getByRole` / `getByLabel` / `getByTestId` önce. CSS/XPath son çare.
- Locator'ı tahmin etme — Playwright MCP varsa canlı sayfadan keşfet.
- Paralel koşuda veri çakışmasını önlemek için üretilen veriyi benzersiz yap.

## Faz Durumu

- Faz 1: Web + API + World/hook iskeleti — AKTİF (stub'lar bağlanıyor)
- Faz 2: DB (SQL + NoSQL) — bekliyor
- Faz 3: Cross-channel senaryolar — örnek hazır
- Faz 4: Mobile (Appium) — bekliyor
- Faz 5: Contract (Pact) — bekliyor

## Tamamlandı Demeden Önce

`typecheck` + `arch:check` + `test:dry` üçü de temiz geçmeli. Bir stub'ı gerçek
implementasyona bağlarken ilgili senaryoyu da yeşile çevir.

## Çalışma Tarzı

- Değişiklik yaparken etki analizi yap: bu step/anahtar değişikliği başka senaryoyu
  bozuyor mu? (impact-analysis disiplini.)
- Dosya düzenlemek için `sed` yerine `python3` inline script tercih et.
- Feature dosyaları teslim/paylaşımda `.txt`; projede `.feature` olarak çalışır.
