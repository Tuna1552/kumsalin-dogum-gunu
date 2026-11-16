(() => {
  "use strict";
  const CONFIG = window.KUMSAL_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const gate = $("#gate");
  const site = $("#site");
  const passwordForm = $("#password-form");
  const passwordInput = $("#password-input");
  const gateError = $("#gate-error");

  // Giriş kapısı — bu, sürpriz amaçlı istemci tarafı bir kilittir.
  $("#toggle-password").addEventListener("click", () => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    $("#toggle-password").setAttribute("aria-label", show ? "Şifreyi gizle" : "Şifreyi göster");
  });

  passwordForm.addEventListener("submit", event => {
    event.preventDefault();
    if (passwordInput.value === (CONFIG.password || "yeşiluzayli")) {
      gateError.textContent = "";
      const submit = $(".gate-submit");
      submit.querySelector("span:first-child").textContent = "Açılıyor...";
      submit.disabled = true;
      gate.classList.add("gate-exit");
      window.setTimeout(() => {
        gate.classList.add("is-hidden");
        site.classList.remove("is-hidden");
        requestAnimationFrame(() => site.classList.add("is-visible"));
        document.body.classList.add("site-open");
        initialiseSite();
      }, 500);
    } else {
      gateError.textContent = "Olmadı, şifreyi bir daha dene.";
      passwordForm.classList.remove("shake");
      void passwordForm.offsetWidth;
      passwordForm.classList.add("shake");
      passwordInput.select();
    }
  });

  function initialiseSite() {
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
    setupReveal();
    setupNavigation();
    setupProgressAndHeader();
    setupGallery();
    setupLetter();
    renderConfiguredPhotos();
  }

  // Canlı geri sayım: 3 Aralık 2026 saat 00.00.
  let celebrated = false;
  function updateCountdown() {
    const now = new Date();
    const target = CONFIG.birthday instanceof Date ? CONFIG.birthday : new Date(2026, 11, 3, 0, 0, 0);
    const difference = target.getTime() - now.getTime();
    const pad = (number, length = 2) => String(number).padStart(length, "0");
    if (difference <= 0) {
      $("#days").textContent = "000";
      $("#hours").textContent = "00";
      $("#minutes").textContent = "00";
      $("#seconds").textContent = "00";
      $("#countdown-message").textContent = "Bugün senin günün. İyi ki doğdun, Kumsal!";
      $("#countdown-progress-fill").style.width = "100%";
      if (!celebrated) { celebrated = true; launchConfetti(); }
      return;
    }
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);
    $("#days").textContent = pad(days, 3);
    $("#hours").textContent = pad(hours);
    $("#minutes").textContent = pad(minutes);
    $("#seconds").textContent = pad(seconds);

    const previousBirthday = new Date(target.getFullYear() - 1, target.getMonth(), target.getDate()).getTime();
    const cycleLength = Math.max(1, target.getTime() - previousBirthday);
    const elapsed = Math.max(0, Math.min(cycleLength, now.getTime() - previousBirthday));
    $("#countdown-progress-fill").style.width = `${(elapsed / cycleLength) * 100}%`;
  }

  function setupReveal() {
    const elements = $$(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach(element => element.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(element => observer.observe(element));
  }

  function setupNavigation() {
    const toggle = $("#menu-button");
    const mobile = $("#mobile-navigation");
    toggle.addEventListener("click", () => {
      const open = mobile.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    });
    $$("#mobile-navigation a").forEach(link => link.addEventListener("click", () => {
      mobile.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menüyü aç");
    }));

    const navigationLinks = $$(".navigation-link, .mobile-dock-link");
    const sections = ["home", "countdown", "memories", "letter"].map(id => document.getElementById(id));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navigationLinks.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      sections.forEach(section => observer.observe(section));
    }
  }

  function setupProgressAndHeader() {
    const progress = $("#reading-progress");
    const header = $("#site-header");
    let ticking = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = `${percent}%`;
      header.classList.toggle("is-compact", window.scrollY > 30);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // Galeri: önce az sayıda küçük görsel eklenir; kalanlar istenince gösterilir.
  let galleryItems = [];
  let lightboxIndex = 0;
  let visiblePhotoCount = 0;
  const desktopPhotoBatch = 18;
  const mobilePhotoBatch = 12;

  function photoBatchSize() {
    return window.matchMedia("(max-width: 700px)").matches ? mobilePhotoBatch : desktopPhotoBatch;
  }

  function setupGallery() {
    $("#show-more-photos").addEventListener("click", () => {
      appendNextPhotoBatch();
    });
    $("#lightbox-close").addEventListener("click", closeLightbox);
    $("#lightbox").addEventListener("click", event => { if (event.target.id === "lightbox") closeLightbox(); });
    $("#lightbox-prev").addEventListener("click", () => moveLightbox(-1));
    $("#lightbox-next").addEventListener("click", () => moveLightbox(1));
    document.addEventListener("keydown", event => {
      if (!$("#lightbox").classList.contains("is-open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    });
  }

  function renderConfiguredPhotos() {
    galleryItems = Array.isArray(CONFIG.photos) ? CONFIG.photos.filter(photo => photo && photo.src) : [];
    visiblePhotoCount = 0;
    renderGallery();
  }

  function renderGallery() {
    const grid = $("#photo-grid");
    const moreWrap = $("#gallery-more-wrap");
    $("#photo-count").textContent = String(galleryItems.length).padStart(2, "0");
    grid.innerHTML = "";
    grid.classList.toggle("has-photos", galleryItems.length > 0);
    if (!galleryItems.length) {
      grid.innerHTML = `
        <div class="photo-placeholder placeholder-large"><span class="placeholder-number">01</span><span class="placeholder-decoration">✳</span><strong>GÜZEL<br>GÜNLERDEN</strong><small>FOTOĞRAFLAR BURAYA GELECEK</small></div>
        <div class="photo-placeholder placeholder-portrait"><span class="placeholder-number">02</span><span class="placeholder-decoration">✦</span><strong>BERABER<br>ÇEKTİKLERİMİZ</strong><small>GÜZEL ANILAR</small></div>
        <div class="photo-placeholder placeholder-square"><span class="placeholder-number">03</span><span class="placeholder-decoration">✳</span><strong>UNUTMAYACAĞIMIZ<br>ANLAR</strong><small>FOTOĞRAFLARIMIZ</small></div>
        <div class="photo-placeholder placeholder-wide"><span class="placeholder-number">04</span><span class="placeholder-decoration">✴</span><strong>DAHA<br>ÇOK FOTOĞRAF VAR.</strong><small>HEPSİ BURADA OLACAK</small></div>`;
      moreWrap.hidden = true;
      return;
    }
    appendNextPhotoBatch();
  }

  function appendNextPhotoBatch() {
    const grid = $("#photo-grid");
    const start = visiblePhotoCount;
    const end = Math.min(galleryItems.length, start + photoBatchSize());
    const fragment = document.createDocumentFragment();

    for (let index = start; index < end; index++) {
      const photo = galleryItems[index];
      const caption = photo.caption || `Fotoğraf ${index + 1}`;
      const card = document.createElement("button");
      card.className = "photo-card";
      card.type = "button";
      card.dataset.photoIndex = String(index);
      card.setAttribute("aria-label", `${caption} fotoğrafını büyüt`);
      const img = document.createElement("img");
      img.src = photo.thumb || photo.src;
      if (photo.srcset) img.srcset = photo.srcset;
      img.sizes = "(max-width: 700px) 46vw, (max-width: 1100px) 30vw, 360px";
      img.alt = caption;
      img.loading = "lazy";
      img.decoding = "async";
      img.fetchPriority = "low";
      img.addEventListener("error", () => {
        card.classList.add("photo-load-error");
        img.removeAttribute("src");
        img.alt = "Bu fotoğraf şu anda yüklenemedi";
      }, { once: true });
      if (photo.position) img.style.objectPosition = photo.position;
      card.appendChild(img);
      if (photo.caption) {
        const captionEl = document.createElement("span");
        captionEl.className = "photo-caption";
        captionEl.textContent = photo.caption;
        card.appendChild(captionEl);
      }
      card.addEventListener("click", () => openLightbox(index));
      fragment.appendChild(card);
    }

    grid.appendChild(fragment);
    visiblePhotoCount = end;
    const moreWrap = $("#gallery-more-wrap");
    const remaining = galleryItems.length - visiblePhotoCount;
    moreWrap.hidden = remaining <= 0;
    $("#gallery-page-note").textContent = `${visiblePhotoCount} / ${galleryItems.length} fotoğraf gösteriliyor`;
    $("#show-more-photos").querySelector("span").textContent = `Daha fazla fotoğraf göster (${remaining} kaldı)`;
  }

  function openLightbox(index) {
    if (!galleryItems.length) return;
    lightboxIndex = index;
    updateLightbox();
    $("#lightbox").classList.add("is-open");
    $("#lightbox").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function updateLightbox() {
    const item = galleryItems[lightboxIndex];
    const image = $("#lightbox-image");
    image.src = item.full || item.src;
    image.alt = item.caption || "Anı fotoğrafı";
    image.decoding = "async";
    $("#lightbox-caption").textContent = item.caption || "";
    $("#lightbox-counter").textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
  }
  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + galleryItems.length) % galleryItems.length;
    updateLightbox();
  }
  function closeLightbox() {
    $("#lightbox").classList.remove("is-open");
    $("#lightbox").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Mektup: paragrafları harf harf yazar.
  function setupLetter() {
    $("#signature-display").textContent = CONFIG.signature || "T.";
    const button = $("#letter-open-button");
    const body = $("#letter-body");
    let opened = false;
    let runToken = 0;
    button.addEventListener("click", async () => {
      if (opened) {
        runToken++;
        opened = false;
        body.innerHTML = '<p class="paper-hint">Sana birkaç satır yazdım.<br>Okumak istersen burada.</p>';
        button.querySelector("span").textContent = "Notu oku";
        return;
      }
      opened = true;
      button.disabled = true;
      button.querySelector("span").textContent = "Açılıyor...";
      body.innerHTML = "";
      const token = ++runToken;
      const paragraphs = Array.isArray(CONFIG.letter) ? CONFIG.letter : [];
      for (const line of paragraphs) {
        if (token !== runToken) return;
        const paragraph = document.createElement("p");
        body.appendChild(paragraph);
        await typeText(paragraph, String(line), 13, token, () => runToken);
      }
      if (token !== runToken) return;
      button.disabled = false;
      button.querySelector("span").textContent = "Notu kapat";
    });
  }
  function typeText(element, text, interval, token, getToken) {
    return new Promise(resolve => {
      let index = 0;
      const timer = window.setInterval(() => {
        if (token !== getToken()) { clearInterval(timer); resolve(); return; }
        element.textContent += text.charAt(index++);
        if (index >= text.length) { clearInterval(timer); resolve(); }
      }, interval);
    });
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char]);
  }
  function escapeAttribute(value) { return escapeHTML(value).replace(/`/g, "&#096;"); }

  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function launchConfetti() {
    const canvas = $("#celebration-canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    const colors = ["#eaa08e", "#b9a7ca", "#f3efe8", "#d98270", "#d8c4cf"];
    const pieces = Array.from({ length: 155 }, () => ({
      x: Math.random() * width, y: -20 - Math.random() * height,
      size: 3 + Math.random() * 5, speed: 2 + Math.random() * 4,
      drift: -1.5 + Math.random() * 3, angle: Math.random() * Math.PI,
      spin: -.08 + Math.random() * .16, color: colors[Math.floor(Math.random() * colors.length)]
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      pieces.forEach(piece => {
        piece.y += piece.speed; piece.x += piece.drift; piece.angle += piece.spin;
        ctx.save(); ctx.translate(piece.x, piece.y); ctx.rotate(piece.angle);
        ctx.fillStyle = piece.color; ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.7); ctx.restore();
      });
      frame++;
      if (frame < 270) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    }
    draw();
  }
})();
