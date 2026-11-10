/* ==========================================================================
   Shell-ul paginii: navigare activă, progres, meniu mobil, sunet, reveal.
   ========================================================================== */
(function (global) {
  'use strict';
  var RR = global.RR;
  if (!RR) return;

  var doc = document;

  /* ----------------------- navigare activă + progres ---------------------- */
  var navLinks = RR.qsa('.main-nav a, .nav-sheet a');
  var sections = RR.qsa('main section[id]');

  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  if (sections.length && 'IntersectionObserver' in global) {
    var current = null;
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          current = entry.target.id;
          setActive(current);
        }
      });
    }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
    sections.forEach(function (s) { sectionIO.observe(s); });
  }

  var progressBar = doc.getElementById('progressBar');
  var ticking = false;
  function paintProgress() {
    ticking = false;
    var h = doc.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || doc.body.scrollTop) / max : 0;
    if (progressBar) progressBar.style.width = Math.max(0, Math.min(1, pct)) * 100 + '%';
  }
  RR.on(global, 'scroll', function () {
    if (!ticking) { ticking = true; global.requestAnimationFrame(paintProgress); }
  }, { passive: true });
  paintProgress();

  /* ------------------------------ meniu mobil ----------------------------- */
  var menuBtn = doc.getElementById('menuBtn');
  var sheet = doc.getElementById('navSheet');
  function closeMenu() {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    sheet.classList.remove('is-open');
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Deschide meniul'); }
  }
  if (menuBtn && sheet) {
    RR.on(menuBtn, 'click', function () {
      var open = sheet.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
      if (open) RR.audio.tap();
    });
    RR.qsa('a', sheet).forEach(function (a) { RR.on(a, 'click', closeMenu); });
    RR.on(doc, 'keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    RR.on(doc, 'click', function (e) {
      if (!sheet.classList.contains('is-open')) return;
      if (sheet.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
      closeMenu();
    });
  }

  /* --------------------------------- sunet -------------------------------- */
  var soundBtn = doc.getElementById('soundBtn');
  function paintSound() {
    if (!soundBtn) return;
    var on = RR.audio.enabled;
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', on ? 'Sunetul este pornit. Apasă pentru a-l opri.' : 'Sunetul este oprit. Apasă pentru a-l porni.');
    soundBtn.title = on ? 'Sunet pornit' : 'Sunet oprit';
  }
  if (soundBtn) {
    RR.on(soundBtn, 'click', function () { RR.audio.toggle(); });
    paintSound();
    doc.addEventListener('rr:sound', paintSound);
  }

  /* ------------------- reveal la derulare (o singură dată) ---------------- */
  var revealItems = RR.qsa('.reveal');
  if ('IntersectionObserver' in global && !RR.prefersReducedMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------ ancore: închide meniul și scrie hash ---------------- */
  RR.qsa('a[href^="#"]').forEach(function (a) {
    RR.on(a, 'click', function () {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = doc.getElementById(id);
      if (!target) return;
      closeMenu();
      /* scroll-margin-top acoperă bara fixă; hash-ul se actualizează singur */
    });
  });

  /* ------------------------------ utilitare ------------------------------- */
  /* Marchează butoanele care declanșează sunet, ca să nu fie mut la hover. */
  RR.qsa('.btn--primary, .tool-btn').forEach(function (b) {
    RR.on(b, 'click', function () { RR.audio.tap(); });
  });

  /* Anunță că shell-ul e gata (pentru simulări/quiz dacă e nevoie). */
  doc.dispatchEvent(new CustomEvent('rr:shell-ready'));
})(window);
