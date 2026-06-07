# Instagram Otomatik Paylaşım — Kurulum Rehberi

Bu rehber, **@yucelsinmedia** hesabını otomatik paylaşıma açmak için adım adımdır.
Sırayla yap; her adım ~5–10 dk. Takıldığın yerde bana sor.

> **Neden bu kadar adım?** Instagram, kişisel hesaplara dışarıdan otomatik paylaşıma izin
> vermez. Sadece **Creator/Business** hesaplara, **Meta uygulaması + token** ile, ve medyanın
> **internetten erişilebilir bir adreste** olması şartıyla izin verir. Aşağıdaki adımlar tam bunu kurar.

---

## ADIM 1 — Instagram hesabını profesyonele çevir (telefon)
1. Instagram → **Profil → ☰ → Ayarlar ve gizlilik**
2. **Hesap türü ve araçlar → Profesyonel hesaba geç**
3. **Creator** (içerik üreticisi) seç → bir kategori seç (örn. Dijital içerik üreticisi)
4. Tamamla.

## ADIM 2 — Bir Facebook Sayfası oluştur ve bağla
> Instagram Graph API, Instagram'ı bir **Facebook Sayfasına** bağlamanı ister.
1. facebook.com → **Sayfalar → Yeni Sayfa Oluştur** (isim: YücelsinMedia olabilir, ücretsiz)
2. Instagram uygulaması → **Ayarlar → Hesap merkezi** (veya Profili Düzenle → Sayfaya bağla)
3. Instagram hesabını bu Facebook Sayfasına **bağla**.

## ADIM 3 — Meta Developer hesabı + uygulama
1. **developers.facebook.com** → sağ üst **Get Started / Başla** (Facebook hesabınla giriş yap)
2. **My Apps → Create App**
3. Use case (kullanım amacı): **"Other" → Next → Business** tipini seç
4. Uygulama adı: `AliyucelsinHedef` → oluştur.

## ADIM 4 — Instagram ürününü ekle
1. Uygulama paneli → **Add Product / Ürün Ekle**
2. **Instagram → Set up** (Instagram Graph API)
3. Gerekirse **Facebook Login for Business** ürününü de ekle.

## ADIM 5 — Token + IG User ID al (Graph API Explorer)
1. **Tools → Graph API Explorer** (developers.facebook.com/tools/explorer)
2. Sağ üstte uygulamanı seç: `AliyucelsinHedef`
3. **Generate Access Token** → açılan pencerede şu izinleri (permissions) onayla:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
4. **IG User ID'yi bul:** Explorer'da şu isteği çalıştır:
   ```
   GET  me/accounts?fields=instagram_business_account,name
   ```
   Dönen sonuçta `instagram_business_account.id` → **bu senin IG User ID'in** (uzun bir sayı). Not et.
5. **Uzun ömürlü token al** (kısa token 1 saatte ölür). Explorer'daki token'ı kopyala, tarayıcıda şunu aç
   (APP_ID, APP_SECRET uygulama → Ayarlar → Temel'de; SHORT_TOKEN az önceki):
   ```
   https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN
   ```
   Dönen `access_token` → **uzun ömürlü token** (~60 gün, yenilenebilir). Not et.

> ⚠ **App Review:** Kendi hesabında test/geliştirme modunda çalışır. Uygulama "Live"a alınıp
> başkalarının hesabında kullanılacaksa Meta'dan `instagram_content_publish` için **App Review**
> gerekir. Sen kendi hesabını yöneteceğin için geliştirme modu yeterli (token'ı periyodik yenilersin).

## ADIM 6 — Backend'i internete aç (PUBLIC URL)
Instagram, paylaşılacak fotoğraf/videoyu **bir URL'den indirir** — bu yüzden backend internetten
erişilebilir olmalı. İki seçenek:

**A) Hızlı test — ngrok (ücretsiz):**
1. ngrok.com → indir, hesap aç, authtoken'ı ekle
2. Backend'i çalıştır: `node server.js` (port 8090)
3. Yeni terminal: `ngrok http 8090` → sana `https://xxxx.ngrok-free.app` verir → bu `publicBaseUrl`.

**B) Kalıcı — Render/Railway (ücretsiz katman):**
- `hedef-backend` klasörünü GitHub'a koy → Render'da "New Web Service" → repo seç → start: `node server.js`
- Render sana kalıcı bir `https://...onrender.com` adresi verir → `publicBaseUrl`.

## ADIM 7 — config.json'ı doldur
`config.example.json`'ı `config.json` olarak kopyala, şunları gir:
```json
{
  "port": 8090,
  "igUserId": "ADIM_5'TEKİ_IG_USER_ID",
  "accessToken": "ADIM_5'TEKİ_UZUN_OMURLU_TOKEN",
  "apiToken": "kendi-belirledigin-gizli-anahtar-123",
  "publicBaseUrl": "ADIM_6'DAKİ_HTTPS_ADRES",
  "allowOrigin": "*"
}
```
Sonra: `node server.js` → konsolda "✓ token + IG ID ayarlı" görmelisin.
Test: tarayıcıda `http://localhost:8090/api/health` → `"configured": true`.

## ADIM 8 — Uygulamaya bağla
1. ALİYÜCELSİN HEDEF uygulamasını aç → sol alt **⚙/Otomasyon** (ekleyince)
2. **Backend URL** = `publicBaseUrl` (veya yerelde `http://localhost:8090`)
3. **API Token** = config'teki `apiToken`
4. **Bağlantıyı test et** → hesabını gösterirse hazırsın.
5. Artık Yayın Kuyruğu'nda medya ekleyip "Otomatik paylaş (zamanla)" diyebilirsin —
   viral saatte backend kendi paylaşır.

---

### Sık sorunlar
- **"configured: false"** → config.json eksik/yanlış yerde (hedef-backend klasöründe olmalı).
- **Medya hatası** → `publicBaseUrl` yanlış ya da backend internetten erişilemiyor (ngrok kapalı).
- **Token süresi doldu** → ADIM 5.5'i tekrar yap (60 günde bir). İstersen otomatik yenileme ekleyebilirim.
- **Story paylaşımı** → API'de sınırlı; şimdilik Reels + foto + carousel tam destekli.
