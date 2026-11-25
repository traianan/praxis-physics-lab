/* ============================================================
   Lucrul mecanic. Puterea — interactions
   Praxis Science Lab · standalone, no dependencies
   ============================================================ */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const lesson = $('#lesson');
  if (!lesson) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- number formatting (Romanian comma) ---------- */
  const f = (n, d = 1) => {
    if (!Number.isFinite(n)) n = 0;
    if (Math.abs(n) < Math.pow(10, -d) / 2) n = 0;
    return n.toFixed(d).replace('.', ',');
  };
  const pretty = (n, d = 1) => {
    const s = f(n, d);
    return s.endsWith(',' + '0'.repeat(d)) ? s.slice(0, -(d + 1)) : s;
  };
  const minus = s => String(s).replace(/^-/, '−');

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#lmToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2100);
  }

  /* ============================================================
     SOUND — synthesized with Web Audio, no external files
     ============================================================ */
  let audioCtx = null;
  let soundOn = localStorage.getItem('lmSound') !== 'off';

  function ac() {
    if (!soundOn) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function tone(freq, dur = 0.08, type = 'sine', gain = 0.035, slide = null, delay = 0) {
    const ctx = ac();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  const sfx = {
    nav() { tone(520, 0.055, 'triangle', 0.022, 610); },
    tick() { tone(880, 0.03, 'sine', 0.012); },
    step() { tone(620, 0.07, 'sine', 0.026, 720); },
    good() {
      tone(659.25, 0.1, 'sine', 0.032);
      tone(880, 0.1, 'sine', 0.028, null, 0.09);
      tone(1174.7, 0.16, 'sine', 0.024, null, 0.18);
    },
    bad() {
      tone(300, 0.16, 'sawtooth', 0.018, 180);
      tone(220, 0.2, 'sine', 0.022, 160, 0.05);
    },
    whoosh() { tone(420, 0.32, 'triangle', 0.016, 110); },
    thud() { tone(150, 0.2, 'sine', 0.05, 70); },
    ratchet() {
      tone(1100, 0.025, 'square', 0.008);
      tone(980, 0.025, 'square', 0.007, null, 0.055);
      tone(860, 0.025, 'square', 0.006, null, 0.11);
    },
    finish() {
      tone(523.25, 0.14, 'triangle', 0.03);
      tone(659.25, 0.14, 'triangle', 0.028, null, 0.1);
      tone(783.99, 0.24, 'triangle', 0.026, null, 0.2);
    }
  };

  function setSound(on) {
    soundOn = on;
    localStorage.setItem('lmSound', on ? 'on' : 'off');
    const btn = $('#soundBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      const lbl = $('#soundLbl');
      if (lbl) lbl.textContent = on ? 'Sunet activ' : 'Sunet oprit';
    }
    if (on) sfx.nav();
  }

  /* ============================================================
     RANGE FILL
     ============================================================ */
  function fillRange(input) {
    if (!input) return;
    const min = parseFloat(input.min || '0');
    const max = parseFloat(input.max || '100');
    const p = max === min ? 0 : ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--p', p.toFixed(2) + '%');
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  const panelName = name => 'panel-' + name;

  function scrollToDeck() {
    const tabs = $('#mainTabs');
    if (!tabs) return;
    const offset = lesson.classList.contains('board') ? 14 : 68;
    const y = tabs.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function selectSub(name, sub) {
    const panel = $('#' + panelName(name));
    if (!panel || !sub) return;
    const btns = $$('.lm-subbar button[data-sub]', panel);
    const target = btns.find(b => b.dataset.sub === sub);
    if (!target) return;
    btns.forEach(b => b.setAttribute('aria-selected', b === target ? 'true' : 'false'));
    $$('.lm-sub[data-subp]', panel).forEach(p => p.classList.toggle('is-on', p.dataset.subp === sub));
  }

  function selectCase(n) {
    const id = String(n);
    $$('.lm-caserail', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.case === id));
    $$('.lm-casepanel', lesson).forEach(p => p.classList.toggle('is-on', p.dataset.casePanel === id));
  }

  function activateTab(name, opts = {}) {
    const tab = $('.lm-tab[data-tab="' + name + '"]', lesson);
    if (!tab) return;
    $$('.lm-tab', lesson).forEach(b => b.setAttribute('aria-selected', b === tab ? 'true' : 'false'));
    $$('.lm-panel', lesson).forEach(p => p.classList.toggle('is-on', p.id === panelName(name)));
    if (opts.sub) selectSub(name, opts.sub);
    if (opts.case) selectCase(opts.case);
    if (opts.prob && typeof window.__lmSelectProblem === 'function') window.__lmSelectProblem(opts.prob);
    if (opts.scroll !== false) scrollToDeck();
  }

  function goto(name, opts = {}) {
    closeGuide();
    activateTab(name, opts);
    if (!opts.sub) {
      const panel = $('#' + panelName(name));
      const first = panel && $('.lm-subbar button[data-sub]', panel);
      if (first && panel.querySelector('.lm-sub.is-on') === null) selectSub(name, first.dataset.sub);
    }
  }

  function closeGuide() {
    const m = $('#guideModal');
    if (!m) return;
    m.classList.remove('is-on');
    m.setAttribute('aria-hidden', 'true');
  }

  function openGuide() {
    const m = $('#guideModal');
    if (!m) return;
    m.classList.add('is-on');
    m.setAttribute('aria-hidden', 'false');
    const btn = $('.lm-modal-close', m);
    if (btn) setTimeout(() => btn.focus(), 60);
  }

  function initNav() {
    $$('.lm-tab', lesson).forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.nav();
        activateTab(btn.dataset.tab);
      });
    });

    $$('.lm-subbar', lesson).forEach(bar => {
      bar.addEventListener('click', e => {
        const b = e.target.closest('button[data-sub]');
        if (!b) return;
        const panel = b.closest('.lm-panel');
        if (!panel) return;
        sfx.tick();
        selectSub(panel.id.replace('panel-', ''), b.dataset.sub);
      });
    });

    $$('.lm-caserail', lesson).forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.nav();
        selectCase(btn.dataset.case);
      });
    });

    document.addEventListener('click', e => {
      const link = e.target.closest('[data-goto]');
      if (!link) return;
      e.preventDefault();
      const opts = {};
      if (link.dataset.gotoSub) opts.sub = link.dataset.gotoSub;
      if (link.dataset.gotoCase) opts.case = link.dataset.gotoCase;
      if (link.dataset.gotoProb) opts.prob = link.dataset.gotoProb;
      goto(link.dataset.goto, opts);
    });

    const brand = $('.lm-brand', lesson);
    if (brand) brand.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    const guideBtn = $('#guideBtn');
    if (guideBtn) guideBtn.addEventListener('click', () => { sfx.nav(); openGuide(); });
    const guideModal = $('#guideModal');
    if (guideModal) {
      guideModal.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) closeGuide();
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeGuide();
    });

    const soundBtn = $('#soundBtn');
    if (soundBtn) soundBtn.addEventListener('click', () => setSound(!soundOn));

    const boardBtn = $('#boardBtn');
    if (boardBtn) {
      const saved = localStorage.getItem('lmBoard') === 'on';
      lesson.classList.toggle('board', saved);
      boardBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      boardBtn.addEventListener('click', () => {
        const on = !lesson.classList.contains('board');
        lesson.classList.toggle('board', on);
        boardBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        localStorage.setItem('lmBoard', on ? 'on' : 'off');
        sfx.tick();
        if (on) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    /* text size */
    const scales = [0.9, 0.95, 1, 1.05, 1.1];
    let zoomIdx = parseInt(localStorage.getItem('lmZoom') || '2', 10);
    if (!Number.isFinite(zoomIdx)) zoomIdx = 2;
    zoomIdx = clamp(zoomIdx, 0, scales.length - 1);
    const applyZoom = () => {
      lesson.style.zoom = scales[zoomIdx];
      localStorage.setItem('lmZoom', String(zoomIdx));
    };
    applyZoom();
    const up = $('#fsUp');
    const down = $('#fsDown');
    if (up) up.addEventListener('click', () => {
      if (zoomIdx < scales.length - 1) { zoomIdx++; applyZoom(); sfx.tick(); }
      else toast('Mărimea maximă a textului.');
    });
    if (down) down.addEventListener('click', () => {
      if (zoomIdx > 0) { zoomIdx--; applyZoom(); sfx.tick(); }
      else toast('Mărimea minimă a textului.');
    });
  }

  /* ============================================================
     T1 — bench: F, d, alpha
     ============================================================ */
  function initT1() {
    const F = $('#t1F'), d = $('#t1d'), a = $('#t1a');
    if (!F || !d || !a) return;
    const outF = $('#t1Fv'), outD = $('#t1dv'), outA = $('#t1av');
    const L = $('#t1L'), sign = $('#t1Sign'), sub = $('#t1Sub');
    const force = $('#t1Force'), proj = $('#t1Proj'), drop = $('#t1Drop'), arc = $('#t1Arc');
    const alpha = $('#t1Alpha'), projLbl = $('#t1ProjLbl'), dArrow = $('#t1DArrow'), dLbl = $('#t1DLabel');
    const ghost = $('#t1Ghost'), fLabel = $('#t1FLabel text');

    function update() {
      const Fv = parseFloat(F.value), dv = parseFloat(d.value), av = parseFloat(a.value);
      const rad = av * Math.PI / 180;
      const cos = Math.abs(Math.cos(rad)) < 1e-10 ? 0 : Math.cos(rad);
      const sin = Math.sin(rad);
      const work = Fv * dv * cos;

      outF.textContent = Fv + ' N';
      outD.textContent = f(dv) + ' m';
      outA.textContent = av + '°';
      L.innerHTML = f(work) + ' <small>J</small>';
      L.classList.toggle('neg', work < -0.05);
      L.classList.toggle('zero', Math.abs(work) < 0.05);

      let label = 'motor', cls = 'lm-badge';
      if (Math.abs(work) < 0.05) { label = 'nul'; cls = 'lm-badge zero'; }
      else if (work < 0) { label = 'rezistent'; cls = 'lm-badge neg'; }
      sign.className = cls;
      sign.textContent = label;
      sub.textContent = 'L = ' + Fv + ' · ' + f(dv) + ' · cos ' + av + '°';

      const bx = 248, by = 160;
      const len = 56 + Fv * 0.58;
      const tipX = bx + len * cos, tipY = by - len * sin;
      force.setAttribute('x2', tipX.toFixed(2));
      force.setAttribute('y2', tipY.toFixed(2));
      force.style.opacity = Fv === 0 ? 0.25 : 1;

      proj.setAttribute('x2', tipX.toFixed(2));
      proj.setAttribute('y2', by.toFixed(2));
      proj.style.opacity = Math.abs(cos) < 0.12 ? 0 : 0.85;

      drop.setAttribute('x1', tipX.toFixed(2));
      drop.setAttribute('y1', tipY.toFixed(2));
      drop.setAttribute('x2', tipX.toFixed(2));
      drop.setAttribute('y2', by.toFixed(2));
      drop.style.opacity = Math.abs(sin) < 0.12 ? 0 : 0.8;

      const pmx = bx + (tipX - bx) * 0.55;
      projLbl.setAttribute('x', pmx.toFixed(2));
      projLbl.setAttribute('y', (by - 8).toFixed(2));
      projLbl.style.opacity = Math.abs(cos) < 0.12 ? 0 : 1;

      const r = 40;
      if (av > 0.5 && av < 179.5) {
        arc.setAttribute('d', 'M' + (bx + r) + ' ' + by + ' A' + r + ' ' + r + ' 0 0 0 ' +
          (bx + r * cos).toFixed(2) + ' ' + (by - r * sin).toFixed(2));
        arc.style.opacity = 1;
      } else {
        arc.style.opacity = 0;
      }
      const mid = rad / 2;
      alpha.setAttribute('x', (bx + (r + 18) * Math.cos(mid)).toFixed(2));
      alpha.setAttribute('y', (by - (r + 18) * Math.sin(mid) + 3).toFixed(2));
      alpha.setAttribute('text-anchor', 'middle');
      alpha.textContent = 'α = ' + av + '°';

      const off = cos < 0 ? -9 : 9;
      fLabel.setAttribute('x', (tipX + off).toFixed(2));
      fLabel.setAttribute('y', (tipY - 5).toFixed(2));
      fLabel.setAttribute('text-anchor', cos < 0 ? 'end' : 'start');
      $('#t1FLabel').style.opacity = Fv === 0 ? 0.3 : 1;

      const dPx = dv * 18;
      dArrow.setAttribute('x2', (218 + dPx).toFixed(2));
      dArrow.style.opacity = dv === 0 ? 0.2 : 1;
      dLbl.setAttribute('x', (218 + dPx / 2).toFixed(2));
      dLbl.textContent = dv === 0 ? 'd = 0' : 'd';

      ghost.setAttribute('transform', 'translate(' + (-dPx).toFixed(2) + ' 0)');
      ghost.style.opacity = dv === 0 ? 0 : 0.16;

      fillRange(F); fillRange(d); fillRange(a);
    }

    [F, d, a].forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', () => sfx.tick());
    });
    update();
  }

  /* ============================================================
     T2 — protractor
     ============================================================ */
  function initT2() {
    const slider = $('#t2a');
    if (!slider) return;
    const cx = 270, cy = 232, R = 150;
    const needle = $('#t2Needle'), wedge = $('#t2Wedge'), arc = $('#t2Arc'), alpha = $('#t2Alpha');
    const flbl = $('#t2FLbl'), out = $('#t2av'), L = $('#t2L'), sign = $('#t2Sign'), cosOut = $('#t2Cos');
    const fill = $('#t2BarFill'), mark = $('#t2BarMark'), ticks = $('#t2Ticks');

    function buildTicks() {
      let s = '';
      for (let deg = 0; deg <= 180; deg += 10) {
        const rad = deg * Math.PI / 180;
        const major = deg % 30 === 0;
        const r1 = 148, r2 = major ? 132 : 140;
        s += '<line x1="' + (cx + r1 * Math.cos(rad)).toFixed(1) + '" y1="' + (cy - r1 * Math.sin(rad)).toFixed(1) +
          '" x2="' + (cx + r2 * Math.cos(rad)).toFixed(1) + '" y2="' + (cy - r2 * Math.sin(rad)).toFixed(1) +
          '" stroke="' + (major ? '#A8BBAE' : '#C4D1C5') + '" stroke-width="' + (major ? 1 : 0.7) + '"/>';
        if (major) {
          s += '<text x="' + (cx + 116 * Math.cos(rad)).toFixed(1) + '" y="' + (cy - 116 * Math.sin(rad) + 3).toFixed(1) +
            '" class="s-lbl" text-anchor="middle" style="font-size:6.8px;fill:#8CA093">' + deg + '°</text>';
        }
      }
      ticks.innerHTML = s;
    }

    function update() {
      const deg = parseFloat(slider.value);
      const rad = deg * Math.PI / 180;
      const cos = Math.abs(Math.cos(rad)) < 1e-10 ? 0 : Math.cos(rad);
      const sin = Math.sin(rad);
      const work = 50 * 4 * cos;

      out.textContent = deg + '°';
      needle.style.transform = 'rotate(' + (-deg) + 'deg)';

      if (deg > 0.5) {
        wedge.setAttribute('d', 'M' + cx + ' ' + cy + ' L' + (cx + R) + ' ' + cy +
          ' A' + R + ' ' + R + ' 0 0 0 ' + (cx + R * cos).toFixed(2) + ' ' + (cy - R * sin).toFixed(2) + ' Z');
        wedge.style.display = '';
      } else {
        wedge.style.display = 'none';
      }

      const r2 = 52;
      if (deg > 0.5 && deg < 179.5) {
        arc.setAttribute('d', 'M' + (cx + r2) + ' ' + cy + ' A' + r2 + ' ' + r2 + ' 0 0 0 ' +
          (cx + r2 * cos).toFixed(2) + ' ' + (cy - r2 * sin).toFixed(2));
        arc.style.opacity = 1;
      } else {
        arc.style.opacity = 0;
      }
      const mid = rad / 2;
      alpha.setAttribute('x', (cx + 70 * Math.cos(mid)).toFixed(2));
      alpha.setAttribute('y', (cy - 70 * Math.sin(mid) + 4).toFixed(2));
      alpha.setAttribute('text-anchor', 'middle');
      alpha.textContent = deg + '°';

      flbl.setAttribute('x', (cx + 158 * cos).toFixed(2));
      flbl.setAttribute('y', (cy - 158 * sin + 3).toFixed(2));

      L.innerHTML = f(work) + ' <small>J</small>';
      L.classList.toggle('neg', work < -0.05);
      L.classList.toggle('zero', Math.abs(work) < 0.05);

      let label = 'motor', cls = 'lm-badge';
      if (Math.abs(work) < 0.05) { label = 'nul'; cls = 'lm-badge zero'; }
      else if (work < 0) { label = 'rezistent'; cls = 'lm-badge neg'; }
      sign.className = cls;
      sign.textContent = label;

      cosOut.textContent = 'cos ' + deg + '° = ' + (cos < 0 ? '−' : '+') + f(Math.abs(cos), 2);

      const pct = clamp(cos, -1, 1) * 50;
      fill.style.left = (Math.min(50, 50 + pct)) + '%';
      fill.style.width = Math.abs(pct) + '%';
      mark.style.left = (50 + pct) + '%';

      fillRange(slider);
      $$('.lm-preset[data-set-a]', $('#panel-teorie')).forEach(b =>
        b.classList.toggle('is-on', parseFloat(b.dataset.setA) === deg));
    }

    buildTicks();
    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    $$('[data-set-a]', lesson).forEach(b => b.addEventListener('click', () => {
      slider.value = b.dataset.setA;
      sfx.tick();
      update();
    }));
    update();
  }
