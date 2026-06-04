@cross-channel
Feature: Evrak cross-channel yaşam döngüsü

  API ile üretilen evrak, web ve mobil kanallarda devam ettirilebilmeli.

  Scenario: API'de oluşturulan evrak web listesinde görünür
    Given API üzerinden yeni bir gelen evrak oluşturulmuştur
    When web kanalında evrak listesi açılır
    Then API'de oluşturulan evrak web listesinde görünür
