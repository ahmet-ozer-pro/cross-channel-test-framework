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

Mevcut çekirdek (TestWorld + tipli store + kanal izolasyonu + cleanup +
dependency-cruiser + CI) doğru ama iki eksik var: (1) ölçek-execution makinesi
(sharding/trace/retry), (2) tool-bağımsızlık (somut Playwright/client'lara bağlılık).

## Karar

**Fixture-tabanlı dependency injection + Ports-and-Adapters + Page/Screen Object
+ task kompozisyonu + data factory, domain'e göre organize.** Screenplay DEĞİL.

Pivot: **runner = Playwright Test.** Gherkin korunur ve `playwright-bdd` ile
Playwright Test üzerinde derlenir (iş-okunur senaryo + modern fixture/sharding/trace
bir arada). İleride saf `*.spec.ts` testler aynı runner'da yan yana yaşayabilir —
yani Gherkin'i bırakma kararı GERİ-DÖNÜŞLÜ kalır, bugün verilmek zorunda değildir.

### Neden bu, neden Screenplay değil
- Fixtures, TS/JS dünyasının güncel DI mekanizması; Screenplay'in kompozisyon
  faydasını **daha az soyutlama ve daha düz öğrenme eğrisiyle** verir ("kolay" şartı).
- Asıl darboğaz runner; Playwright Test native sharding/trace/retry/projects sağlar
  (10k şartı). `cucumber-js` bunları bolt-on yapar.
- En düşük pişmanlık: `playwright-bdd` Gherkin'i standart Playwright testlerine
  derler — paket yarın ölse bile elinde stabil Playwright Test çekirdeği kalır.

## Bağlayıcı kurallar (atlanamaz / bozulamaz)

1. **Runner:** Yeni testler **Playwright Test** üzerinde koşar (saf `*.spec.ts` ya da
   `playwright-bdd` ile `*.feature`). `cucumber-js`'e YENİ bağımlılık/senaryo eklenmez;
   mevcut cucumber senaryoları geçiş köprüsünde yaşar, çoğaltılmaz.
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
6. **Organizasyon:** Testler **DOMAIN**'e göre (`tests/<domain>/` veya
   `features/<domain>/`), kanala göre DEĞİL. Disiplinli tag taksonomisi
   (`@smoke @e2e @contract @<domain> @quarantine`).
7. **Test verisi:** factory/builder + benzersiz üretim (randomUUID/worker-id) +
   üretimle AYNI yerde cleanup kaydı. Veri birikmez, paralelde çakışmaz.
8. **Ölçek:** Paralellik + CI sharding (`--shard=i/N`); flake için retry + `@quarantine`
   politikası; locator dirençli (çoklu strateji). 10k yalnızca dağıtık koşar.
9. **Bağımlılık disiplini:** Az ve standart bağımlılık; tool-modernliği Playwright
   ekosistemi etrafında. Secrets yalnızca `env`'den, fail-fast.
10. **Test dağılımı (en kritik):** 10k senaryonun hepsi yavaş cross-channel e2e OLAMAZ.
    Test trophy: çok sayıda hızlı contract/API/component + az sayıda kritik e2e.
    Mimari her seviyeyi ucuza yazılabilir kılmalı.

> Not (runner-özel kural): `cucumber-js` step tanımlarındaki "arrow function yasak"
> kuralı yalnızca kalan cucumber glue için geçerlidir. Playwright Test fixtures /
> `*.spec.ts` altında arrow function + fixture enjeksiyonu NORMALDİR.

## Hedef proje yapısı

```
src/
  core/
    fixtures/      # Playwright fixtures = DI (page, apiClient, db, mobile, contract, store)
    ports/         # ARAYÜZLER (tool-bağımsız): IssuePort, AuthPort, ...
    context/       # tipli cross-channel state (chaining) — bugünkü store evrilir
  adapters/        # port implementasyonları (TOOL-BAĞLI, tek değişim noktası)
    web/ api/ db/ mobile/ contract/
  tasks/           # kompoze edilebilir iş görevleri (chaining)
  factories/       # test verisi builder'ları
tests/  (veya features/)
  <domain>/        # issue/ proje/ board/ ...  → DOMAIN bazlı
playwright.config.ts   # projects (kanal/ortam), sharding, retry, trace, reporter
```

Bugünden **kalan** (taşınır): tipli store fikri, cleanup disiplini, resilient-locator,
dependency-cruiser, CI gate'leri, isimlendirme, env fail-fast.
**Evrilen:** runner (cucumber-js → Playwright Test), kanal → port+adapter,
hooks/world → fixtures, manuel chaining → tasks, kanal-klasör → domain-klasör,
+contract, +sharding, +flake politikası.

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
