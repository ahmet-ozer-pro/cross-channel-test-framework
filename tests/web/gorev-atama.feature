@login_feature
Feature: Gorev Yönetimi ve Atama Kontrolü

  # KANAL: web-only (login + form + liste) → tests/web/ (ADR-0002).
  # TAG: @web @gorev (domain) @e2e (gerçek backend ister; CI RUN etmez, sadece --list).
  # NOT: param tırnakları düz (") — Gherkin {string} ayrıştırması için.

  Background:
    Given go to website
    And I am on the login page

  @prof-14350 @e2e @web @gorev
  Scenario: Yeni Görev Ekleme ve Atanan Kullanıcı Kontrolü
    # 1. AŞAMA: projem.test1 ile görev oluşturma
    When I log in as "projem.test1"
    And Gorev Ekle Butonuna Tikla
    And Gorev Konu Alanini Random Doldur
    And Gorev Tipi Olarak "Rapor Talebi" Sec
    And Gorev Oncelik Olarak "Kritik" Sec
    And Gorev Istenen Teslim Tarihi Olarak Bugunu Sec
    And Atanan Kullanıcıyı Sec "projem.test2"
    And Gorev Kaydet Butonuna Tikla
    Then Gorev Basari Mesajini Gor
    And I log out from the system

    # 2. AŞAMA: projem.test2 ile kontrol etme ve durum güncelleme
    When I log in as "projem.test2"
    Then I should see the homepage
    And Gorev Listesinde Yeni Gorevi Kontrol Et
    And Gorev Durumunu "Islemde" Olarak Guncelle
    Then Gorev Basari Mesajini Gor
