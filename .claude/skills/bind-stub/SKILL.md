---
name: bind-stub
description: Bir kanal stub'ını (DocumentApi gibi client, ya da Page/Screen Object) gerçek implementasyona bağlarken kullan. Endpoint/locator şemasını alıp client metodunu yazma, response alanını doğru typed store key'e map'leme, cleanup'ı gerçek silme işlemine bağlama ve ilgili senaryoyu yeşile çevirme adımlarını içerir. Kullanıcı "şu endpoint'i bağla", "bu stub'ı implemente et", "Not implemented'ı gerçek koda çevir" dediğinde tetiklenir.
---

# Stub'ı Gerçek Implementasyona Bağlama

1. **Şemayı netleştir.** Endpoint: metot, yol, request/response alanları. Locator: canlı sayfadaki gerçek data-testid/role. Eksikse iste, tahmin etme.
2. **Sadece kanal objesini değiştir.** channels/api/*-api.ts veya channels/web/*.page.ts. Step dosyalarına dokunma.
3. **Response alanını doğru store key'e map'le.** evrakNo vs evrakSayi karışıklığına DİKKAT. Doğru Keys.* anahtarını kullan.
4. **Cleanup'ı gerçek silmeye bağla.** deleteDocument gerçek DELETE yapmalı.
5. **Doğrula.** typecheck → arch:check → senaryoyu çalıştır, yeşile çevir.

## Yapma
- Step içine ham Playwright çağrısı koyma.
- Bir kanalın step'inden başka kanalın objesini import etme.
