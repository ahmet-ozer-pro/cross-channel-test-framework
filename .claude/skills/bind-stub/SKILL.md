---
name: bind-stub
description: Bir kanal stub'ını (IssueApi gibi client/adapter, ya da Page/Screen Object) gerçek implementasyona bağlarken kullan. Endpoint/locator şemasını alıp adapter metodunu yazma, response alanını doğru typed store key'e map'leme, cleanup'ı gerçek silme işlemine bağlama ve ilgili senaryoyu yeşile çevirme adımlarını içerir. Kullanıcı "şu endpoint'i bağla", "bu stub'ı implemente et", "Not implemented'ı gerçek koda çevir" dediğinde tetiklenir.
---

# Stub'ı Gerçek Implementasyona Bağlama

1. **Şemayı netleştir.** Endpoint: metot, yol, request/response alanları. Locator: canlı sayfadaki gerçek data-testid/role. Eksikse iste, tahmin etme.
2. **Sadece adapter'ı değiştir.** adapters/<kanal>/*-adapter.ts (port'u gerçekler) — ya da geçişte channels/*. Test/step/port'a dokunma.
3. **Response alanını doğru store key'e map'le.** Alan adı karışıklığına DİKKAT (örn. issueKey vs issueId). Doğru Keys.* anahtarını kullan.
4. **Cleanup'ı gerçek silmeye bağla.** Silme metodu (örn. deleteIssue) gerçek DELETE yapmalı.
5. **Doğrula.** typecheck → arch:check → senaryoyu çalıştır, yeşile çevir.

## Yapma
- Step içine ham Playwright çağrısı koyma.
- Bir kanalın step'inden başka kanalın objesini import etme.
