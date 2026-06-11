# Cross-Channel Test Automation Framework

API + Web + Mobile + DB + Contract kanallarını tek bir BDD framework'ünde
birleştiren cross-channel test otomasyon projesi.

Stack: **TypeScript · Cucumber JS · Playwright · (Appium / Pact — sonraki fazlar)**
Raporlama: **Allure 2** · AI: **Claude Code + Playwright MCP**

## Mimari Karar (BAĞLAYICI)

Hedef mimari ve değişmez kurallar: **[docs/adr/0001-test-otomasyon-mimarisi.md](docs/adr/0001-test-otomasyon-mimarisi.md)**.
AI araçları için: [CLAUDE.md](CLAUDE.md) · [AGENTS.md](AGENTS.md). Bu karardan sapmak yeni bir ADR gerektirir.

## Mimari Kurallar (bozulmaması gerekenler)

1. **Tek state kaynağı: `TestWorld`.** Tüm senaryo state'i World'de.
2. **Kanallar yalnızca `store` üzerinden konuşur.** API yazar, Web/Mobile okur.
   Hiçbir step başka kanalın objesine dokunmaz. `arch:check` ile zorlanır.
3. **Store anahtarları tipli** (`defineKey<T>`). Raw `Map<string, any>` yasak.
4. **Her senaryo verisini API ile üretir; `cleanup.register` ile temizler.**
5. **Secrets `env`'den** (`.env`), asla kodda değil.
6. **Locator: dirençli strateji** (`resilient-locator`) — testId → role → metin.

## Dizin Yapısı

```
src/
  support/
    world.ts             # TestWorld — tek state kaynağı
    hooks.ts             # tag bazlı kanal init (+ Keycloak auth) + teardown
    store.ts             # TypedStore
    store-keys.ts        # defineKey<T> anahtar kataloğu
    cleanup-registry.ts  # teardown (LIFO)
    resilient-locator.ts # self-healing temeli (çoklu strateji + healing seam)
    config/env.ts        # secrets + ortam, fail-fast (dotenv)
  core/
    ports/     # tool-bağımsız arayüzler (örn. IssuePort) — ADR-0001
    fixtures/  # Playwright fixtures (DI)
  adapters/    # port implementasyonları (tool-bağlı): api/ web/ mobile/ db/ contract/
  tasks/       # kompoze edilebilir iş görevleri (chaining)
  factories/   # test verisi builder'ları
  channels/    # (geçiş) cucumber yolu — auth-api.ts vb.
  steps/   api/ web/ mobile/ db/ common/   # (geçiş) cucumber step'leri
tests/   <domain>/   # Playwright Test spec'leri (domain bazlı)
features/  cross-channel/*.feature
.claude/   CLAUDE.md kuralları + hooks + skills + agents (Claude Code)
.mcp.json  Playwright MCP (locator keşfi)
.vscode/   cucumber step navigasyonu
```

## Kurulum

```bash
npm install
npx playwright install
cp .env.example .env        # gerçek değerleri gir
# Allure CLI: brew install allure   (veya npm i -g allure-commandline)
```

> Feature dosyaları teslimde `.txt`; çalıştırmadan önce `.feature` yap.

## Komutlar

```bash
npm run typecheck            # tip
npm run arch:check           # kanal izolasyonu
npm run test:dry             # step eşleşmesi
npm test                     # tüm suite
npm run test:cross-channel   # @cross-channel
npm run test:parallel        # paralel
npm run allure:serve         # Allure rapor (hızlı önizleme)
npm run allure:generate && npm run allure:open
```

## API Şema Varsayımları (DOĞRULA)

Domain adapter'ları (`src/adapters/api/*-adapter.ts`) gerçek endpoint'e bağlanırken
yol/alan sabitleri test ortamına göre teyit edilmeli (örn. issue oluşturma yolu,
request/response alan adları). Auth için `auth-api.ts`: password grant +
`AUTH_URL`/`AUTH_CLIENT_ID`. `AUTH_URL` boşsa token akışı atlanır.

## Faz Durumu

- Domain: **task/issue yönetimi** (Jira benzeri). Önceki örnek domain kaldırıldı.
- Çekirdek mimari: ADR-0001 (ports/adapters + Playwright Test fixtures) — kuruldu.
- Faz B: ilk domain dikey dilimi (Issue: port+adapter+fixture+spec) — sıradaki.
- Faz 2/4/5: DB · Mobile (Appium) · Contract (Pact) — bekliyor.

## CI Sırası

```
typecheck -> arch:check -> test:dry -> test:smoke -> test (parallel) -> allure:generate
```
