# ADR-0002 — Test Organizasyonu: Kanal Klasörü + Domain Tag

- **Durum:** Kabul edildi (Accepted)
- **Tarih:** 2026-06-12
- **Karar sahibi:** aozer
- **İlişki:** ADR-0001 **kural 6'yı DEĞİŞTİRİR** (domain-bazlı klasör → kanal-bazlı klasör).
  ADR-0001'in diğer tüm kuralları (runner, ports/adapters, BDD korunur, kanal izolasyonu,
  chaining, test verisi, ölçek, test dağılımı) AYNEN geçerlidir.
- **Bağlayıcılık:** Bu ADR BAĞLAYICIDIR. Değiştirmek yeni bir ADR (0003…) gerektirir.

---

## Bağlam

ADR-0001 testleri DOMAIN'e göre (`tests/<domain>/`) organize ediyordu. Pratikte iki
gerçek ihtiyaç doğdu:

1. Bazı senaryolar gerçekten **tek kanala** aittir (sadece web UI, sadece mobil, saf API
   contract, saf DB) — bunları kanal bazında görmek/koşmak isteniyor.
2. Birden çok kanala dokunan senaryoların **ayrı ve görünür** olması isteniyor.

## Karar

Testler **KANAL'a göre** organize edilir; çok-kanal senaryolar ayrı bir klasörde toplanır.
Domain ekseni **TAG** ile taşınır (klasör değil). Yani: kanal = klasör, domain = tag.

```
tests/
  web/            # yalnızca web (UI) senaryoları        → @web
  mobile/         # yalnızca mobil                        → @mobile
  api/            # yalnızca API (saf API/contract)       → @api
  db/             # yalnızca DB doğrulama                 → @db
  cross-channel/  # BİRDEN ÇOK kanala dokunan senaryolar  → @cross-channel
  framework/      # framework smoke (domain/kanal bağımsız *.spec.ts)
```

### Bağlayıcı kurallar

1. **Klasör = ait olduğu kanal.** Tek kanala dokunan senaryo o kanalın klasöründe. Birden
   çok kanala dokunan senaryo `cross-channel/` altında.
2. **Her senaryo bir DOMAIN tag'i taşır** (`@issue`, `@project`…) → "tüm issue testleri"
   `--grep @issue` ile klasörden bağımsız bulunur (domain keşfedilebilirliği tag'le korunur).
3. **Kanal tag'leri dokunulan TÜM kanalları işaretler** (`@api @web`). `cross-channel/`
   senaryosu ayrıca `@cross-channel` taşır. `--grep @web` = web'e dokunan HER ŞEY (cross
   dahil); klasör `tests/web/` = SADECE web-only.
4. **Tür/ops tag'leri:** `@smoke @e2e @contract` (tür) · `@quarantine` (kararsız).
5. Diğer her şey ADR-0001'den miras: tool-bağlı kod yalnızca `adapters/`, port+fixture DI,
   BDD `.feature` + `.spec.ts` yan yana, kanal izolasyonu, vb.

## Sonuçlar

**Olumlu:** kanal görünürlüğü (web/mobil/api/db ayrı), tek-kanal senaryolar net, cross-channel
senaryolar tek yerde toplanır; kanal bazında koşu klasörle de (`playwright test tests/web`)
tag'le de (`--grep @web`) mümkün.

**Olumsuz / KABUL EDİLEN tuzaklar (bilinçli karar — kayıt):**
- **Evrim → dosya taşıma:** web-only bir senaryo sonradan API/DB doğrulaması kazanırsa
  `cross-channel/`'a TAŞINMASI gerekir (git-blame/referans etkilenir). **Hafifletme:** asıl
  filtreleme tag'le yapılır; klasör taşınsa bile `@web`/`@issue` tag'leri sabit kalır.
- **Web-only klasörünün boşalma eğilimi:** UI e2e testleri genelde veriyi API ile kurar →
  çoğu `cross-channel/`'a düşer. Saf `tests/web/` görece az olur. **Kabul edildi:** saf web
  (API setup'sız, ör. statik render/validasyon) senaryoları orada anlamlıdır.
- **Domain dağılması:** bir domain'in testleri birden çok kanal klasörüne yayılır.
  **Hafifletme:** zorunlu `@<domain>` tag'i → `--grep @issue` hepsini toplar.

## Enforcement

- ADR-0001 kural 6 bu ADR'ye işaret eder. CLAUDE.md / AGENTS.md / Cursor / Copilot test
  organizasyonunu bu ADR'ye göre anlatır.
- Yeni senaryo eklerken: doğru kanal klasörü + zorunlu domain tag + kanal/tür tag'leri.
  `new-channel-feature` skill'i bu akışı izler.
