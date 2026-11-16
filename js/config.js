/*
  KUMSAL SİTESİ — KİŞİSELLEŞTİRME
  Şifreyi, mesajı ve fotoğraf listesini yalnızca bu dosyadan düzenleyebilirsin.
*/
window.KUMSAL_CONFIG = {
  password: "yeşiluzayli",
  // 3 Aralık 2026, gece yarısı (ziyaretçinin yerel saati)
  birthday: new Date(2026, 11, 3, 0, 0, 0),
  signature: "T.",
  // Mesajı kendi konuşma şekline göre değiştirebilirsin.
  letter: [
    "Kumsal, doğum günün kutlu olsun!",
    "Umarım bugün çok güzel geçer. Yeni yaşında istediğin şeylerin yolunda gittiği, bol bol güldüğün ve güzel anılar biriktirdiğin bir yıl olsun.",
    "İyi ki varsın. Nice senelere!"
  ],
  /*
    ÇOK FOTOĞRAFLI GALERİ:
    Küçük webp önizlemesini src alanına, büyük görseli full alanına yaz.
    Örnek:
    { src: "assets/thumbs/kumsal-01.webp", full: "assets/photos/kumsal-01.webp", caption: "Güzel bir gün" },

    Sadece tek görselin varsa full alanını yazmana gerek yok:
    { src: "assets/kumsal-01.webp", caption: "Güzel bir gün" }
  */
  photos: [
    // { src: "assets/thumbs/kumsal-01.webp", full: "assets/photos/kumsal-01.webp", caption: "Güzel bir gün" },
    // { src: "assets/thumbs/kumsal-02.webp", full: "assets/photos/kumsal-02.webp", caption: "Birlikte" },
  ]
};
