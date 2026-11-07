/* =========================================================
   Condensatorul — UI comun: navigație, sunet, animații, toast
   ========================================================= */
(function () {
  'use strict';

  /* ---------- toast ---------- */
  var host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('aria-live', 'polite');
  document.querySelector('.cond-course').appendChild(host);

  window.toast = function (msg, ms) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 320);
    }, ms || 2200);
  };

  /* ---------- navigație mobilă ---------- */
  var nav = document.querySelector('.nav');
  var navToggle = document.querySelector('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (window.CondSound) window.CondSound.tap();
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (e.target.closest('.nav') || e.target.closest('.nav-toggle')) return;
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- comutator sunet ---------- */
  var soundBtns = document.querySelectorAll('[data-sound-toggle]');
  function syncSoundBtns() {
    var on = window.CondSound ? window.CondSound.isEnabled() : true;
    soundBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('title', on ? 'Sunet activ — apasă pentru a dezactiva' : 'Sunet dezactivat — apasă pentru a activa');
      b.setAttribute('aria-label', on ? 'Sunet activ. Dezactivează sunetul' : 'Sunet dezactivat. Activează sunetul');
    });
  }
  soundBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (!window.CondSound) return;
      var on = window.CondSound.toggle();
      syncSoundBtns();
      if (on) {
        window.toast('🔊 Sunet activat');
      } else {
        window.toast('🔇 Sunet dezactivat');
      }
    });
  });
  syncSoundBtns();
  document.addEventListener('cond:soundchange', syncSoundBtns);

  /* primul gest al utilizatorului deblochează AudioContext */
  var unlocked = false;
  function unlock() {
    if (unlocked || !window.CondSound) return;
    unlocked = true;
    if (window.CondSound.isEnabled()) window.CondSound.click();
  }
  document.addEventListener('pointerdown', unlock, { once: true });

  /* ---------- sunet global pe butoane ---------- */
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('.btn, .icon-btn, .preset-btn, .segmented button, .quiz-opt, a.nav-link, .chip');
    if (!t || !window.CondSound) return;
    if (t.hasAttribute('data-sound-toggle')) return;
    if (t.classList.contains('quiz-opt')) return;
    window.CondSound.tap();
  }, { passive: true });

  /* hover subtil pe desktop */
  if (window.matchMedia('(hover:hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var hoverTimer = null;
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('.preset-btn, .path-card, .link-list a');
      if (!t || !window.CondSound) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () { window.CondSound.hover(); }, 90);
    }, { passive: true });
  }

  /* ---------- sliders: umplere culoare + sunet ---------- */
  function paintRange(el) {
    var min = parseFloat(el.min || 0);
    var max = parseFloat(el.max || 100);
    var val = parseFloat(el.value);
    var pct = max === min ? 0 : ((val - min) / (max - min)) * 100;
    el.style.setProperty('--pct', pct.toFixed(2) + '%');
  }
  window.paintRange = paintRange;

  document.querySelectorAll('input[type="range"]').forEach(function (el) {
    paintRange(el);
    el.addEventListener('pointerdown', function () {
      el.dataset.playing = '1';
    });
    el.addEventListener('pointerup', function () {
      delete el.dataset.playing;
    });
    el.addEventListener('input', function () {
      paintRange(el);
      if (!el.dataset.playing) return;
      var min = parseFloat(el.min || 0), max = parseFloat(el.max || 100);
      var r = (parseFloat(el.value) - min) / (max - min);
      if (window.CondSound && !el.hasAttribute('data-silent')) window.CondSound.slide(r);
    });
  });

  /* ---------- reveal la scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i, 6) * 55) + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- utilitare numerice expuse global ---------- */
  var PREFIX = [
    { e: 12, s: 'T' }, { e: 9, s: 'G' }, { e: 6, s: 'M' }, { e: 3, s: 'k' },
    { e: 0, s: '' }, { e: -3, s: 'm' }, { e: -6, s: 'µ' }, { e: -9, s: 'n' }, { e: -12, s: 'p' }
  ];

  window.siFormat = function (value, unit, digits) {
    if (!isFinite(value)) return '— ' + unit;
    if (value === 0) return '0 ' + unit;
    var abs = Math.abs(value);
    var pick = PREFIX[PREFIX.length - 1];
    for (var i = 0; i < PREFIX.length; i++) {
      var scale = Math.pow(10, PREFIX[i].e);
      if (abs >= scale) { pick = PREFIX[i]; break; }
    }
    if (abs >= 1e15) return value.toExponential(2).replace('.', ',') + ' ' + unit;
    var num = value / Math.pow(10, pick.e);
    var d = digits == null ? 2 : digits;
    var s = Math.abs(num) >= 100 ? num.toFixed(Math.max(0, d - 2))
      : Math.abs(num) >= 10 ? num.toFixed(Math.max(1, d - 1))
        : num.toFixed(d);
    /* convenția românească: virgulă ca separator zecimal */
    return (window.PraxisI18n?.language==='en'?s:s.replace('.', ',')) + ' ' + pick.s + unit;
  };

  window.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
