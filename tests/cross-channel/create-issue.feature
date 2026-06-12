Feature: Issue oluşturma
  # REFERANS CROSS-CHANNEL SENARYOSU (ADR-0002) — iş-okunur Gherkin, Playwright Test
  # üzerinde playwright-bdd ile derlenir. Step'ler somut adapter'a değil PORT'a + task'a
  # bağlanır; kanallar arası state tipli store ile taşınır (When yazar, Then okur).
  #
  # KLASÖR: çok kanala dokunduğu için tests/cross-channel/ (ADR-0002). Tek-kanal senaryolar
  # tests/<kanal>/ altına gider.
  # TAG taksonomisi: @cross-channel (klasörle aynı), @e2e (tür), @issue (domain — keşif için),
  # @api @web (dokunulan kanallar). `--grep @web` web'e dokunan HER ŞEYİ; `--grep @issue`
  # tüm issue testlerini (klasör fark etmez) seçer.
  @cross-channel @e2e @issue @api @web
  Scenario: API ile oluşturulan issue board'da görünür
    Given API erişimi olan bir kullanıcı
    When API ile yeni bir issue oluşturulur
    Then issue board'da o issue görünür
