# ADR-0001 — Test Otomasyon Mimarisi

- **Durum:** Kabul edildi (Accepted)
- **Tarih:** 2026-06-11
- **Karar sahibi:** aozer
- **Bağlayıcılık:** Bu ADR BAĞLAYICIDIR. İnsan veya AI aracı (Claude Code, GitHub
  Copilot, Cursor, GPT-tabanlı agent'lar) fark etmeksizin bu repoda kod yazan
  herkes uymak zorundadır. Bu karardan **sapmak için yeni bir ADR (0002…) gerekir**;
  tek tek PR/commit içinde sessizce sapmak YASAKTIR.

---

## Bağlam

Hedef: kolay uygulanabilir · karmaşık & chaining senaryoları kaldırabilen ·
5 kanal (Web + Mobil + API + DB + Contract) koşabilen · **10.000+ senaryoya**
ölçeklenen · **7-10 yıl sürdürülebilir** bir test otomasyon mimarisi.

Mevcut çekirdek (tipli store + kanal izolasyonu + cleanup + dependency-cruiser + CI)
doğru ama iki eksik var: (1) ölçek-execution makinesi (sharding/trace/retry),
(2) tool-bağımsızlık (somut Playwright/client'lara bağlılık).

## Karar

**Fixture-tabanlı dependency injection + Ports-and-Adapters + Page/Screen Object
+ task kompozisyonu + data factory, domain'e göre organize.** Screenplay DEĞİL.

Pivot: **runner = Playwright Test (TEK runner).** Senaryolar iki biçimde yazılabilir ve
ikisi AYNI runner'da yan yana koşar: iş-okunur **Gherkin `.feature`** (playwright-bdd ile
derlenir) ve saf **`*.spec.ts`**. **BDD/Gherkin KORUNUR** — `playwright-bdd` Gherkin'i
Playwright Test'in üstünde derler; fixtures/sharding/trace/retry hepsi ortak.

Bu iki AYRI karardır, karıştırma: (a) **runner** cucumber-js → Playwright Test'e geçti;
(b) **Gherkin katmanı** korundu (playwright-bdd'ye taşındı). cucumber-js paketi (eski
runner) kaldırıldı; Gherkin sözdizimi kalmaya devam ediyor.

**REDDEDİLEN seçenek (kayıt):** "Gherkin'i tamamen at, yalnızca `.spec.ts`'e geç" değer-
lendirildi ve REDDEDİLDİ — geri dönüşü zor (tek-yönlü kapı), proje kimliği BDD, paydaş
okunabilirliği değerli. Gherkin'i kaldırmak için YENİ BİR ADR gerekir; sessiz sapma yasak.

### Neden bu, neden Screenplay değil
- Fixtures, TS/JS dünyasının güncel DI mekanizması; Screenplay'in kompozisyon
  faydasını **daha az soyutlama ve daha düz öğrenme eğrisiyle** verir ("kolay" şartı).
- Asıl darboğaz runner; Playwright Test native sharding/trace/retry/projects sağlar
  (10k şartı). `cucumber-js` bunları bolt-on yapar.
- En düşük pişmanlık: `playwright-bdd` Gherkin'i standart Playwright testlerine
  derler — paket yarın ölse bile elinde stabil Playwright Test çekirdeği kalır.

## Bağlayıcı kurallar (atlanamaz / bozulamaz)

1. **Runner:** TEK runner **Playwright Test**. Senaryolar Gherkin `.feature`
   (`tests/<domain>/`, playwright-bdd ile derlenir) VEYA saf `*.spec.ts` olabilir; ikisi
   aynı runner'da yan yana koşar. **BDD/Gherkin korunur (playwright-bdd).** Eski
   `cucumber-js` RUNNER'ı kaldırıldı — geri eklenmez; AYRI bir runner getirme. Gherkin'i
   tamamen kaldırmak ayrı bir karardır ve YENİ BİR ADR gerektirir.
2. **Ports & Adapters:** Test/step kodu somut kanal client'ına (`IssueApi`,
   `IssueBoardPage`…) DOĞRUDAN bağlanmaz. **Port arayüzüne** bağlanır; somut adapter
   **fixture ile enjekte** edilir. Tool-bağlı kod (Playwright/Appium/pg/Pact) YALNIZCA
   `src/adapters/**` altında bulunur.
3. **Screenplay YASAK.** Kompozisyon `src/tasks/**` altındaki düz fonksiyonlarla yapılır;
   actor/ability/question formalizmi kullanılmaz.
4. **Kanal izolasyonu:** Kanallar yalnızca tipli paylaşılan context/store üzerinden
   konuşur. Bir kanalın kodu başka kanalın adapter'ını import etmez (dependency-cruiser
   ile zorlanır).
5. **Chaining:** Karmaşık/zincirli akışlar `tasks/` altındaki kompoze edilebilir
   görevlerle kurulur (örn. `createIssue` → `assignIssue`); senaryo içinde ham
   adapter juggling ile değil. State tipli context + koleksiyon API ile taşınır.
6. **Organizasyon:** Testler **DOMAIN**'e göre (`tests/<domain>/`), kanala göre DEĞİL.
   Disiplinli tag taksonomisi (`@smoke @e2e @contract @<domain> @quarantine`).
7. **Test verisi:** factory/builder + benzersiz üretim (randomUUID/worker-id) +
   üretimle AYNI yerde cleanup kaydı. Veri birikmez, paralelde çakışmaz.
8. **Ölçek:** Paralellik + CI sharding (`--shard=i/N`); flake için retry + `@quarantine`
   politikası; locator dirençli (çoklu strateji). 10k yalnızca dağıtık koşar.
9. **Bağımlılık disiplini:** Az ve standart bağımlılık; tool-modernliği Playwright
   ekosistemi etrafında. Secrets yalnızca `env`'den, fail-fast.
10. **Test dağılımı (en kritik):** 10k senaryonun hepsi yavaş cross-channel e2e OLAMAZ.
    Test trophy: çok sayıda hızlı contract/API/component + az sayıda kritik e2e.
    Mimari her seviyeyi ucuza yazılabilir kılmalı.

## Hedef proje yapısı

```
src/
  core/
    fixtures/      # Playwright fixtures = DI (page, apiClient, db, mobile, contract, store)
    ports/         # ARAYÜZLER (tool-bağımsız): IssuePort, AuthPort, ...
  adapters/        # port implementasyonları (TOOL-BAĞLI, tek değişim noktası)
    web/ api/ db/ mobile/ contract/
  tasks/           # kompoze edilebilir iş görevleri (chaining)
  factories/       # test verisi builder'ları
  steps/           # Gherkin step-def'leri (createBdd(test) → fixtures'a bağlanır)
tests/
  <domain>/        # issue/ proje/ board/ ...  → DOMAIN bazlı (*.feature ve/veya *.spec.ts)
playwright.config.ts   # defineBddConfig (Gherkin→spec) + projects, sharding, retry, trace
.features-gen/         # playwright-bdd ÜRETİMİ (gitignore'lu, commit edilmez)
```

**Korunan:** tipli store, cleanup disiplini, resilient-locator, dependency-cruiser,
CI gate'leri, env fail-fast.
**Tamamlanan geçiş:** RUNNER cucumber-js → Playwright Test; Gherkin katmanı korundu
(playwright-bdd ile aynı runner'a taşındı), kanal client → port+adapter,
hooks/world → fixtures, auth → fixture. **`channels/` kaldırıldı** — tool-bağlı kodun
TEK evi `adapters/` (api/web/db/mobile). **Web de port arkasında** (`IssueBoardPort`).
**Sıradaki:** ikinci domain dilimi + tag taksonomisi; gerçek API'ye bağlama; DB/Mobile/Contract.

### Eklenen olgunluk katmanları (faz A+)

- **Wait strategy:** hard-wait yasak; auto-wait + `pollUntil` (convergence) + merkezi
  `timeouts` (sihirli sayı yok). Flaky taksonomisi (`flaky.ts`) + `@quarantine` (varsayılan
  koşudan grepInvert ile dışlanır).
- **Contract:** adapter response'u shape-doğrular (schema kayması kaynağında patlar).
- **Test verisi:** `testRunId` + worker-safe `uniqueName` (paralel çakışma yok, orphan izi).
- **Store:** `dump()` (hata anında teşhis) + sensitive maskeleme + key ownership metadata.

### Bilinçli ertelenenler (ATLANMADI — kararla beklemede, tetik: ilgili kanal/ölçek)

- **EvidencePort** (birleşik kanıt soyutlaması): Playwright trace/screenshot/video zaten
  built-in; ayrı port ancak DB/mobil kanıt eklenince (Faz C/D) anlamlı.
- **Tam Contract testing (Pact/OpenAPI):** Faz D; gerçek API şeması + tüketici/üretici lazım.
- **Flaky dashboard / unstable-test raporu:** suite 10k'ya yaklaşınca; şimdi taksonomi+quarantine yeter.
- **Cleanup retry / orphan detector / dry-run:** gerçek backend bağlanınca (şu an simüle edilecek state yok).
- **Store audit timeline / gelişmiş masking politikası:** Faz C/D, çok-kanal artınca.

## Sonuçlar

**Olumlu:** tool-bağımsızlık (10 yıl), native ölçek makinesi (10k), düz kompozisyonla
chaining, domain keşfedilebilirliği, Gherkin yatırımının korunması, geri-dönüşlü
Gherkin kararı.

**Olumsuz / risk:**
- `playwright-bdd` üçüncü-parti (tek-bakımcı riski). **Sınırlı:** Gherkin'i standart
  Playwright testlerine derler; ölürse Playwright Test çekirdeği kalır, feature'lar
  `.spec.ts`'e taşınabilir.
- Runner migrasyonu gerçek maliyet; **big-bang değil**, evrimsel (yeni testler yeni
  runner'da, eskiler köprüde).

## Enforcement (bu karar nasıl korunur)

- **AI araçları:** [CLAUDE.md](../../CLAUDE.md) ve [AGENTS.md](../../AGENTS.md) bu ADR'ye
  işaret eder; her oturumda yüklenir. Araç fark etmeksizin kurallar atlanamaz.
- **Yapısal:** dependency-cruiser kuralları mimari büyüdükçe genişletilir
  (step→port, adapters dışında tool importu yok). CI'da gate.
- **Değişiklik:** Bu kararı değiştirmek yeni bir ADR gerektirir; sessiz sapma reddedilir.

## Evrimsel yol
- **Faz A:** API kanalı için port + adapter + fixture; bir senaryoyu Playwright Test'te
  yeşil koş; dependency-cruiser "step→port" kuralı.
- **Faz B:** domain klasör + tag taksonomisi + ilk data factory + ilk task.
- **Faz C:** DB + Mobile adapter (seam'ler hazır).
- **Faz D:** Contract (Pact) + CI sharding + flake/quarantine.
