# Kumsal — Doğum Günü Sitesi

Telefon, tablet ve bilgisayara uyumlu; şifreli giriş ekranı, canlı geri sayım, çok fotoğraflı galeri ve kişisel not bölümü olan statik web sitesi.

## Dosya yapısı

- `index.html` — sayfanın yapısı
- `css/style.css` — tasarım ve mobil düzen
- `js/config.js` — şifre, tarih, mesaj ve fotoğraf listesi
- `js/app.js` — sayaç, galeri, navigasyon ve animasyonlar
- `assets/` — fotoğraflar

## GitHub / Netlify

1. ZIP'i açıp içindeki dosyaları klasör yapısını bozmadan GitHub deposunun köküne yükle.
2. Netlify'da GitHub reposunu bağla.
3. Build command boş, publish directory `.` olsun.
4. Deploy et.

## Şifre ve mesaj

`js/config.js` dosyasını aç:
- Şifre: `password`
- Doğum tarihi: `birthday` (3 Aralık 2026, yerel saatle 00:00)
- Mektup: `letter`
- İmza: `signature`

Mektubu kendi konuşma şekline göre düzenlemen en iyisi; örnek metni olduğu gibi bırakmak zorunda değilsin.

## Çok sayıda fotoğraf ekleme

Fotoğrafları `assets` altında iki klasöre ayırmanı öneririm:

```text
assets/
├── thumbs/
│   ├── kumsal-01.webp
│   └── kumsal-02.webp
└── photos/
    ├── kumsal-01.webp
    └── kumsal-02.webp
```

`js/config.js` içindeki `photos` listesine her fotoğraf için bir satır ekle:

```js
{ src: "assets/thumbs/kumsal-01.webp", full: "assets/photos/kumsal-01.webp", caption: "Güzel bir gün" },
{ src: "assets/thumbs/kumsal-02.webp", full: "assets/photos/kumsal-02.webp", caption: "Birlikte" },
```

`src` galerideki küçük önizleme, `full` fotoğrafa dokununca açılacak büyük görseldir. Sadece bir dosyan varsa `full` alanını çıkarıp `src` içinde aynı dosyayı kullanabilirsin. `caption` isteğe bağlıdır.

### Telefonlarda hızlı açılması için

- Önizlemeleri WebP olarak yaklaşık 600–900 px uzun kenar ve mümkünse 80–180 KB civarında dışa aktar.
- Büyük açılacak sürümleri yaklaşık 1400–1800 px uzun kenar ve makul dosya boyutunda tut.
- Fotoğrafları mümkünse `thumbs` ve `photos` olarak ayrı dosyalar halinde sakla.
- Galeri telefonda ilk etapta 12, büyük ekranda 18 fotoğraf gösterir. “Daha fazla fotoğraf göster” ile sıradaki grup eklenir.
- Görseller tembel yükleme ve asenkron çözümleme kullanır; sayfanın en başında yüzlerce fotoğrafın hepsi indirilmez.

Galerideki dosya yolları herkese açık statik site dosyalarıdır. Fotoğraf seçicisiyle tarayıcı içinden siteye kalıcı yükleme yapılmaz; kalıcı fotoğrafları GitHub'daki `assets` klasörüne ekleyip `config.js` listesine yazmalısın.

## Güvenlik notu

Şifre yalnızca sürpriz giriş ekranıdır. Şifre JavaScript dosyasında yer aldığı için gerçek erişim kontrolü sağlamaz; kaynak kodunu inceleyen biri tarafından görülebilir. Hassas dosyaları korumak için kullanma.
