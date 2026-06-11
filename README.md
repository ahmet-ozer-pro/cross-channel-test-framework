# Cross-Channel Test Automation Framework

API + Web + Mobile + DB + Contract kanallarını tek bir framework'te
birleştiren cross-channel test otomasyon projesi.

Stack: **TypeScript · Playwright Test · (Appium / Pact — sonraki fazlar)**
AI: **Claude Code + Playwright MCP**

## Mimari Karar (BAĞLAYICI)

Hedef mimari ve değişmez kurallar: **[docs/adr/0001-test-otomasyon-mimarisi.md](docs/adr/0001-test-otomasyon-mimarisi.md)**.
AI araçları için: [CLAUDE.md](CLAUDE.md) · [AGENTS.md](AGENTS.md). Bu karardan sapmak yeni bir ADR gerektirir.

## Mimari Kurallar (bozulmaması gerekenler)

1. **Tek runner: Playwright Test.** Testler `*.spec.ts` (`tests/<domain>/`); DI fixtures ile.
2. **Kanallar yalnızca tipli `store` (fixture) üzerinden konuşur.** Hiçbir adapter başka
   kanalın adapter'ına dokunmaz. `arch:check` ile zorlanır.
3. **Test/task somut adapter'a değil port'a bağlanır** (fixture enjeksiyonu); tool-bağlı
   kod yalnızca `src/adapters/**`.
4. **Store anahtarları tipli** (`defineKey<T>`). Raw `Map<string, any>` yasak.
5. **Üretilen veriyi `cleanup.register` ile üretimle aynı yerde kaydet** (LIFO teardown).
6. **Secrets `env`'den** (`.env`), asla kodda değil. Locator: `resilient-locator` (testId → role → metin).

## Dizin Yapısı

```
src/
  core/
    ports/     # tool-bağımsız arayüzler (örn. IssuePort) — ADR-0001
    fixtures/  # Playwright fixtures (DI: store, cleanup, apiRequest, port'lar)
  adapters/    # port implementasyonları (tool-bağlı): api/ web/ mobile/ db/ contract/
  tasks/       # kompoze edilebilir iş görevleri (chaining)
  factories/   # test verisi builder'ları
  channels/    # api/ (auth-api) · db/ (db-client stub)
  support/
    store.ts · store-keys.ts   # TypedStore + tipli anahtarlar
    cleanup-registry.ts        # teardown (LIFO)
    resilient-locator.ts       # çoklu strateji + healing seam
    config/env.ts              # secrets + ortam, fail-fast (dotenv)
tests/   <domain>/   # Playwright Test spec'leri (*.spec.ts, domain bazlı)
test/    unit/       # framework self-test (node:test)
.claude/   CLAUDE.md kuralları + skills + agents (Claude Code)
.mcp.json  Playwright MCP (locator keşfi)
```

## Kurulum

```bash
npm install
npx playwright install
cp .env.example .env        # gerçek değerleri gir
```

## Komutlar

```bash
npm run typecheck   # tip
npm run arch:check  # ports/adapters katmanlama
npm run test:unit   # framework self-test
npm run test:list   # Playwright testlerini derle + listele (backend/browser gerekmez)
npm test            # tüm Playwright suite (gerçek backend + browser)
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
typecheck -> arch:check -> test:unit -> test:list
```
(Gerçek e2e koşusu — `npm test` — backend + browser + secret ister; CI'da koşmaz.)
