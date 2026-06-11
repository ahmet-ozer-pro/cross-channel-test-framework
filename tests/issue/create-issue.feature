Feature: Issue oluşturma
  # REFERANS BDD SENARYOSU (ADR-0001) — iş-okunur Gherkin, Playwright Test üzerinde
  # playwright-bdd ile derlenir. Step'ler somut adapter'a değil PORT'a + task'a bağlanır;
  # kanallar arası state tipli store ile taşınır (When yazar, Then okur).

  @e2e
  Scenario: API ile oluşturulan issue board'da görünür
    Given API erişimi olan bir kullanıcı
    When API ile yeni bir issue oluşturulur
    Then issue board'da o issue görünür
