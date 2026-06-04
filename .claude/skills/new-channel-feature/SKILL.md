---
name: new-channel-feature
description: Yeni bir cross-channel test senaryosu (API ile üretip web/mobil/db'de doğrulama) eklerken kullan. Feature yazma, tipli store key tanımlama, kanal bazlı step yazma (API yazar, diğerleri okur), cleanup kaydetme ve doğrulama adımlarını içerir. Kullanıcı "yeni senaryo ekle", "cross-channel test yaz", "API'de üretilen X web'de görünsün" dediğinde tetiklenir.
---

# Yeni Cross-Channel Senaryo Ekleme

1. **Feature yaz.** features/cross-channel/<isim>.feature, @cross-channel tag'i. Given (API üretir) → When (Web/Mobile) → Then (doğrula).
2. **Store key tanımla.** support/store-keys.ts içinde defineKey<T> ile. Tipini ver, yazan kanalı belirt.
3. **API step'ini yaz** (steps/api/). Client'ı çağır, store.set ile yaz, cleanup.register ile temizliği AYNI step'te kaydet. async function (this: TestWorld) kullan.
4. **Okuyan kanal step'lerini yaz** (steps/web/, mobile/, db/). store.get ile oku, ilgili page/screen/client objesini kullan.
5. **Doğrula.** typecheck → arch:check → test:dry → senaryoyu çalıştır.

## Kurallar
- Her senaryo kendi verisini üretir; veri benzersiz olsun (paralel güvenlik).
- Step metinleri okunabilir Türkçe.
