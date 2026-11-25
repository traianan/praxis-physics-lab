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
          const labelRadius = deg === 0 || deg === 180 ? 128 : 116;
          s += '<text x="' + (cx + labelRadius * Math.cos(rad)).toFixed(1) + '" y="' + (cy - labelRadius * Math.sin(rad) + 3).toFixed(1) +
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
      const atZero = deg < 0.5, atStraightAngle = deg > 179.5;
      alpha.setAttribute('x', (atZero ? cx + 58 : atStraightAngle ? cx - 58 : cx + 70 * Math.cos(mid)).toFixed(2));
      alpha.setAttribute('y', (atZero || atStraightAngle ? cy - 16 : cy - 70 * Math.sin(mid) + 4).toFixed(2));
      alpha.setAttribute('text-anchor', atZero ? 'start' : atStraightAngle ? 'end' : 'middle');
      alpha.textContent = 'α = ' + deg + '°';

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


  /* ============================================================
     T3 — gravity: three routes, same displacement
     ============================================================ */
  function initT3() {
    const m = $('#t3m'), h = $('#t3h');
    if (!m || !h) return;
    const outM = $('#t3mv'), outH = $('#t3hv'), L = $('#t3L'), formula = $('#t3F');
    const ball = $('#t3Ball'), halo = $('#t3BallHalo');
    const paths = {
      fall: $('#t3PathFall'),
      slide: $('#t3PathSlide'),
      stairs: $('#t3PathStairs')
    };
    let route = 'slide';
    let anim = null;

    function paintRoutes() {
      Object.entries(paths).forEach(([k, p]) => {
        if (!p) return;
        const on = k === route;
        p.setAttribute('stroke', on ? '#2C7F6C' : '#C9D5C9');
        p.setAttribute('stroke-width', on ? 1.9 : 1.4);
        p.setAttribute('stroke-dasharray', on ? '6 4' : '4 5');
        p.style.opacity = on ? 1 : 0.85;
      });
    }

    function placeAt(len) {
      const p = paths[route];
      if (!p || !ball) return;
      const pt = p.getPointAtLength(clamp(len, 0, p.getTotalLength()));
      ball.setAttribute('cx', pt.x);
      ball.setAttribute('cy', pt.y);
      if (halo) {
        halo.setAttribute('cx', pt.x);
        halo.setAttribute('cy', pt.y);
      }
    }

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function update() {
      const mv = parseFloat(m.value), hv = parseFloat(h.value);
      const work = mv * 10 * hv;
      outM.textContent = pretty(mv) + ' kg';
      outH.textContent = f(hv) + ' m';
      L.innerHTML = pretty(work) + ' <small>J</small>';
      formula.textContent = 'L = ' + pretty(mv) + ' · 10 · ' + f(hv);
      fillRange(m); fillRange(h);
    }

    function setRoute(r, quiet) {
      if (!paths[r]) return;
      route = r;
      stop();
      paintRoutes();
      $$('[data-route]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.route === r));
      placeAt(0);
      if (!quiet) sfx.tick();
    }

    function run() {
      stop();
      const p = paths[route];
      if (!p) return;
      const total = p.getTotalLength();
      if (reduceMotion) {
        placeAt(total);
        sfx.thud();
        return;
      }
      const t0 = performance.now();
      const dur = 1450;
      sfx.whoosh();
      const tick = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        placeAt(total * e);
        if (t < 1) anim = requestAnimationFrame(tick);
        else { anim = null; sfx.thud(); }
      };
      anim = requestAnimationFrame(tick);
    }

    [m, h].forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', () => sfx.tick());
    });
    $$('[data-route]', lesson).forEach(b => b.addEventListener('click', () => setRoute(b.dataset.route)));
    const runBtn = $('#t3Run');
    if (runBtn) runBtn.addEventListener('click', run);

    paintRoutes();
    placeAt(0);
    update();
  }

  /* ============================================================
     T4 — crane race
     ============================================================ */
  function initT4() {
    const slider = $('#t4t');
    if (!slider) return;
    const tBOut = $('#t4tv'), tB2 = $('#t4tB2'), pA = $('#t4PA'), pB = $('#t4PB');
    const crateA = $('#t4CrateA'), crateB = $('#t4CrateB');
    const cableA = $('#t4CableA'), cableB = $('#t4CableB');
    const timeA = $('#t4TimeA'), timeB = $('#t4TimeB'), status = $('#t4Status');
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function reset() {
      stop();
      if (crateA) crateA.setAttribute('transform', 'translate(0 0)');
      if (crateB) crateB.setAttribute('transform', 'translate(0 0)');
      if (cableA) cableA.setAttribute('y2', '202');
      if (cableB) cableB.setAttribute('y2', '202');
      if (timeA) timeA.textContent = '0,0 s';
      if (timeB) timeB.textContent = '0,0 s';
      if (status) status.textContent = 'gata de start';
    }

    function update() {
      const tb = parseFloat(slider.value);
      tBOut.textContent = tb + ' s';
      tB2.textContent = tb;
      pA.innerHTML = f(200 / 40) + ' <small>kW</small>';
      pB.innerHTML = f(200 / tb) + ' <small>kW</small>';
      fillRange(slider);
      reset();
    }

    function start() {
      reset();
      const tb = parseFloat(slider.value);
      const durA = reduceMotion ? 0.01 : 3.3;
      const durB = reduceMotion ? 0.01 : Math.max(0.55, 3.3 * tb / 40);
      const t0 = performance.now();
      if (status) status.textContent = 'A și B ridică…';
      sfx.ratchet();

      const step = now => {
        const t = (now - t0) / 1000;
        const eA = clamp(t / durA, 0, 1);
        const eB = clamp(t / durB, 0, 1);
        const ea = eA < 0.5 ? 2 * eA * eA : 1 - Math.pow(-2 * eA + 2, 2) / 2;
        const eb = eB < 0.5 ? 2 * eB * eB : 1 - Math.pow(-2 * eB + 2, 2) / 2;

        if (crateA) crateA.setAttribute('transform', 'translate(0 ' + (-132 * ea).toFixed(2) + ')');
        if (crateB) crateB.setAttribute('transform', 'translate(0 ' + (-132 * eb).toFixed(2) + ')');
        if (cableA) cableA.setAttribute('y2', (202 - 132 * ea).toFixed(2));
        if (cableB) cableB.setAttribute('y2', (202 - 132 * eb).toFixed(2));
        if (timeA) timeA.textContent = f(ea * 40) + ' s';
        if (timeB) timeB.textContent = f(eb * tb) + ' s';

        if (eA < 1 || eB < 1) {
          anim = requestAnimationFrame(step);
        } else {
          anim = null;
          if (Math.abs(tb - 40) < 0.01) {
            if (status) status.textContent = 'au terminat simultan';
          } else {
            if (status) status.textContent = 'B a terminat primul · ' + f(40 - tb) + ' s diferență';
          }
          sfx.finish();
        }
      };
      anim = requestAnimationFrame(step);
    }

    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    const btn = $('#t4Start');
    if (btn) btn.addEventListener('click', start);
    update();
  }

  /* ============================================================
     T5 — efficiency on an inclined plane
     ============================================================ */
  function initT5() {
    const aIn = $('#t5a'), muIn = $('#t5mu');
    if (!aIn || !muIn) return;
    const aOut = $('#t5av'), muOut = $('#t5muv');
    const etaOut = $('#t5Eta'), Lu = $('#t5Lu'), Lc = $('#t5Lc'), lost = $('#t5Lost');
    const barU = $('#t5BarU'), barL = $('#t5BarL'), formula = $('#t5Fml');
    const tri = $('#t5Tri'), hyp = $('#t5Hyp'), hLine = $('#t5H'), hLbl = $('#t5Hlbl');
    const dLbl = $('#t5Dlbl'), arc = $('#t5Arc'), albl = $('#t5Albl'), block = $('#t5Block');
    const force = $('#t5Force'), flbl = $('#t5Flbl');
    const weight = $('#t5Weight'), weightLbl = $('#t5WeightLbl');
    const gParallel = $('#t5GParallel'), gParallelLbl = $('#t5GParallelLbl');
    const gNormal = $('#t5GNormal'), gNormalLbl = $('#t5GNormalLbl');
    const friction = $('#t5Friction'), frictionLbl = $('#t5FrictionLbl');
    const fbdPlane = $('#t5FbdPlane'), fbdBlock = $('#t5FbdBlock');

    function update() {
      const deg = parseFloat(aIn.value), mu = parseFloat(muIn.value);
      const rad = deg * Math.PI / 180;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      const G = 100, d = 5;
      const hv = d * sin;
      const LuV = G * hv;
      const Fv = G * (sin + mu * cos);
      const LcV = Fv * d;
      const eta = LcV > 0 ? LuV / LcV : 1;

      aOut.textContent = deg + '°';
      muOut.textContent = f(mu, 2);
      etaOut.innerHTML = f(eta * 100) + '<small>%</small>';
      Lu.innerHTML = pretty(LuV) + ' <small>J</small>';
      Lc.innerHTML = pretty(LcV) + ' <small>J</small>';
      lost.innerHTML = pretty(Math.max(0, LcV - LuV)) + ' <small>J</small>';
      barU.style.width = (eta * 100).toFixed(1) + '%';
      barL.style.width = ((1 - eta) * 100).toFixed(1) + '%';
      formula.textContent = 'η = 1 / (1 + ' + f(mu * cos / sin, 2) + ')';

      const x0 = 70, y0 = 235, len = 230;
      const x2 = x0 + len * cos, yTop = y0 - len * sin;
      tri.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2) + ' Z');
      hyp.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2));
      hLine.setAttribute('x1', x2.toFixed(2));
      hLine.setAttribute('y1', y0);
      hLine.setAttribute('x2', x2.toFixed(2));
      hLine.setAttribute('y2', yTop.toFixed(2));
      hLbl.setAttribute('x', (x2 + 7).toFixed(2));
      hLbl.setAttribute('y', ((y0 + yTop) / 2 + 3).toFixed(2));

      const dmx = x0 + len * 0.45 * cos - 9 * sin;
      const dmy = y0 - len * 0.45 * sin - 9 * cos + 4;
      dLbl.setAttribute('x', dmx.toFixed(2));
      dLbl.setAttribute('y', dmy.toFixed(2));
      dLbl.setAttribute('transform', 'rotate(' + (-deg) + ' ' + dmx.toFixed(2) + ' ' + dmy.toFixed(2) + ')');
      dLbl.textContent = 'd = 5 m';

      const ar = 42;
      arc.setAttribute('d', 'M' + (x0 + ar) + ' ' + y0 + ' A' + ar + ' ' + ar + ' 0 0 0 ' +
        (x0 + ar * cos).toFixed(2) + ' ' + (y0 - ar * sin).toFixed(2));
      albl.setAttribute('x', (x0 + (ar + 16) * Math.cos(rad / 2)).toFixed(2));
      albl.setAttribute('y', (y0 - (ar + 16) * Math.sin(rad / 2) + 3).toFixed(2));
      albl.textContent = deg + '°';

      const t = 0.62;
      const bx = x0 + len * t * cos - 14 * sin;
      const by = y0 - len * t * sin - 14 * cos;
      block.setAttribute('transform', 'translate(' + bx.toFixed(2) + ' ' + by.toFixed(2) + ') rotate(' + (-deg) + ')');

      const componentScale = 56;
      const fbdX = 440, fbdY = 133;
      const vector = (line, x1, y1, x2, y2) => {
        line.setAttribute('x1', x1.toFixed(2)); line.setAttribute('y1', y1.toFixed(2));
        line.setAttribute('x2', x2.toFixed(2)); line.setAttribute('y2', y2.toFixed(2));
      };
      vector(fbdPlane, fbdX - 48 * cos, fbdY + 48 * sin, fbdX + 48 * cos, fbdY - 48 * sin);
      fbdBlock.setAttribute('transform', 'translate(' + fbdX + ' ' + fbdY + ') rotate(' + (-deg) + ')');
      vector(weight, fbdX, fbdY, fbdX, fbdY + componentScale);
      weightLbl.setAttribute('x', (fbdX + 5).toFixed(2)); weightLbl.setAttribute('y', (fbdY + componentScale + 12).toFixed(2));

      const parallelX = -cos, parallelY = sin;
      const normalX = sin, normalY = cos;
      const parallelLen = componentScale * sin, normalLen = componentScale * cos;
      vector(gParallel, fbdX, fbdY, fbdX + parallelLen * parallelX, fbdY + parallelLen * parallelY);
      gParallelLbl.setAttribute('x', (fbdX + parallelLen * parallelX - 12).toFixed(2));
      gParallelLbl.setAttribute('y', (fbdY + parallelLen * parallelY + 16).toFixed(2));
      vector(gNormal, fbdX, fbdY, fbdX + normalLen * normalX, fbdY + normalLen * normalY);
      gNormalLbl.setAttribute('x', (fbdX + normalLen * normalX + 5).toFixed(2));
      gNormalLbl.setAttribute('y', (fbdY + normalLen * normalY + 16).toFixed(2));

      const contactX = bx + 12 * sin, contactY = by + 12 * cos;
      const frictionLen = mu > 0 ? 30 + 12 * mu : 0;
      vector(friction, contactX, contactY, contactX + frictionLen * parallelX, contactY + frictionLen * parallelY);
      friction.style.opacity = frictionLbl.style.opacity = mu > 0 ? 1 : 0;
      frictionLbl.setAttribute('x', (contactX + frictionLen * 0.55 * parallelX + 7 * sin).toFixed(2));
      frictionLbl.setAttribute('y', (contactY + frictionLen * 0.55 * parallelY + 7 * cos + 4).toFixed(2));

      const sx = bx + 22 * cos - 13 * sin;
      const sy = by - 22 * sin - 13 * cos;
      const flen = 40 + Fv * 0.5;
      const fx = sx + flen * cos, fy = sy - flen * sin;
      force.setAttribute('x1', sx.toFixed(2));
      force.setAttribute('y1', sy.toFixed(2));
      force.setAttribute('x2', fx.toFixed(2));
      force.setAttribute('y2', fy.toFixed(2));
      flbl.setAttribute('x', (sx + flen * 0.6 * cos - 12 * sin).toFixed(2));
      flbl.setAttribute('y', (sy - flen * 0.6 * sin - 12 * cos - 4).toFixed(2));

      fillRange(aIn); fillRange(muIn);
    }

    [aIn, muIn].forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', () => sfx.tick());
    });
    update();
  }

  /* ============================================================
     LAB 1 — efficiency of the inclined plane
     ============================================================ */
  function initLab1() {
    const aIn = $('#l1a'), mIn = $('#l1m'), muIn = $('#l1mu');
    if (!aIn || !mIn || !muIn) return;
    const aOut = $('#l1av'), mOut = $('#l1mv'), muOut = $('#l1muv');
    const Gout = $('#l1G'), Fout = $('#l1F'), hOut = $('#l1h'), LuOut = $('#l1Lu'), LcOut = $('#l1Lc'), etaOut = $('#l1Eta');
    const tri = $('#l1Tri'), hyp = $('#l1Hyp'), hLine = $('#l1H'), arc = $('#l1Arc'), albl = $('#l1Albl');
    const hLbl = $('#l1Hlbl'), dLbl = $('#l1Dlbl'), block = $('#l1BlockG'), force = $('#l1Force'), flbl = $('#l1Flbl');
    const dyn = $('#l1Dyn'), ftxt = $('#l1Ftxt');
    const tbody = $('#l1Tbody');
    const addBtn = $('#l1Add'), clearBtn = $('#l1Clear');
    const meanOut = $('#l1Mean'), errOut = $('#l1Err');
    const D = 1.2;
    let rows = [];
    let current = null;

    function compute() {
      const deg = parseFloat(aIn.value), grams = parseFloat(mIn.value), mu = parseFloat(muIn.value);
      const rad = deg * Math.PI / 180;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      const G = grams / 1000 * 10;
      const h = D * sin;
      const Fv = G * (sin + mu * cos);
      const LuV = G * h;
      const LcV = Fv * D;
      return { deg, grams, mu, G, h, Fv, LuV, LcV, eta: LcV > 0 ? LuV / LcV : 0 };
    }

    function draw() {
      const q = compute();
      current = q;
      aOut.textContent = q.deg + '°';
      mOut.textContent = q.grams + ' g';
      muOut.textContent = f(q.mu, 2);
      Gout.innerHTML = f(q.G, 2) + ' <small>N</small>';
      Fout.innerHTML = f(q.Fv, 2) + ' <small>N</small>';
      hOut.innerHTML = f(q.h, 2) + ' <small>m</small>';
      LuOut.innerHTML = f(q.LuV, 2) + ' <small>J</small>';
      LcOut.innerHTML = f(q.LcV, 2) + ' <small>J</small>';
      etaOut.innerHTML = f(q.eta * 100) + '<small>%</small>';

      const x0 = 80, y0 = 300, len = 380;
      const rad = q.deg * Math.PI / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      const x2 = x0 + len * cos, yTop = y0 - len * sin;
      tri.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2) + ' Z');
      hyp.setAttribute('d', 'M' + x0 + ' ' + y0 + ' L' + x2.toFixed(2) + ' ' + yTop.toFixed(2));
      hLine.setAttribute('x1', x2.toFixed(2));
      hLine.setAttribute('y1', y0);
      hLine.setAttribute('x2', x2.toFixed(2));
      hLine.setAttribute('y2', yTop.toFixed(2));
      hLbl.setAttribute('x', (x2 + 8).toFixed(2));
      hLbl.setAttribute('y', ((y0 + yTop) / 2 + 3).toFixed(2));

      const dmx = x0 + len * 0.43 * Math.cos(rad) - 11 * Math.sin(rad);
      const dmy = y0 - len * 0.43 * Math.sin(rad) - 11 * Math.cos(rad) + 4;
      dLbl.setAttribute('x', dmx.toFixed(2));
      dLbl.setAttribute('y', dmy.toFixed(2));
      dLbl.setAttribute('transform', 'rotate(' + (-q.deg) + ' ' + dmx.toFixed(2) + ' ' + dmy.toFixed(2) + ')');

      const ar = 55;
      arc.setAttribute('d', 'M' + (x0 + ar) + ' ' + y0 + ' A' + ar + ' ' + ar + ' 0 0 0 ' +
        (x0 + ar * Math.cos(rad)).toFixed(2) + ' ' + (y0 - ar * Math.sin(rad)).toFixed(2));
      albl.setAttribute('x', (x0 + (ar + 16) * Math.cos(rad / 2)).toFixed(2));
      albl.setAttribute('y', (y0 - (ar + 16) * Math.sin(rad / 2) + 3).toFixed(2));
      albl.textContent = q.deg + '°';

      const t = 0.58;
      const bx = x0 + len * t * Math.cos(rad) - 15 * Math.sin(rad);
      const by = y0 - len * t * Math.sin(rad) - 15 * Math.cos(rad);
      block.setAttribute('transform', 'translate(' + bx.toFixed(2) + ' ' + by.toFixed(2) + ') rotate(' + (-q.deg) + ')');

      const sx = bx + 26 * Math.cos(rad) - 14 * Math.sin(rad);
      const sy = by - 26 * Math.sin(rad) - 14 * Math.cos(rad);
      const flen = 56 + q.Fv * 15;
      const fx = sx + flen * Math.cos(rad), fy = sy - flen * Math.sin(rad);
      force.setAttribute('x1', sx.toFixed(2));
      force.setAttribute('y1', sy.toFixed(2));
      force.setAttribute('x2', fx.toFixed(2));
      force.setAttribute('y2', fy.toFixed(2));
      flbl.setAttribute('x', (sx + flen * 0.55 * Math.cos(rad) - 11 * Math.sin(rad)).toFixed(2));
      flbl.setAttribute('y', (sy - flen * 0.55 * Math.sin(rad) - 11 * Math.cos(rad) - 4).toFixed(2));

      const dx = fx + 34 * Math.cos(rad);
      const dy = fy - 34 * Math.sin(rad);
      dyn.setAttribute('transform', 'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') rotate(' + (-q.deg) + ')');
      ftxt.textContent = f(q.Fv, 1) + ' N';

      fillRange(aIn); fillRange(mIn); fillRange(muIn);
    }

    function renderRows() {
      if (!tbody) return;
      if (!rows.length) {
        tbody.innerHTML = '<tr class="empty"><td colspan="5">Înregistrează prima măsurare.</td></tr>';
        if (meanOut) meanOut.textContent = '—';
        if (errOut) errOut.textContent = '—';
        return;
      }
      tbody.innerHTML = rows.map(r =>
        '<tr><td>' + r.deg + '°</td><td>' + f(r.G, 2) + '</td><td>' + f(r.Fv, 2) +
        '</td><td>' + f(r.h, 2) + '</td><td>' + f(r.eta * 100) + '%</td></tr>'
      ).join('');
      const etas = rows.map(r => r.eta * 100);
      const mean = etas.reduce((s, v) => s + v, 0) / etas.length;
      const dev = etas.reduce((s, v) => s + Math.abs(v - mean), 0) / etas.length;
      if (meanOut) meanOut.textContent = f(mean) + '%';
      if (errOut) errOut.textContent = '±' + f(dev) + '%';
    }

    [aIn, mIn, muIn].forEach(el => {
      el.addEventListener('input', draw);
      el.addEventListener('change', () => sfx.tick());
    });

    if (addBtn) addBtn.addEventListener('click', () => {
      if (!current) return;
      if (rows.length >= 3) {
        rows.shift();
        toast('Tabel plin: prima măsurare a fost înlocuită.');
      }
      rows.push({ ...current });
      renderRows();
      sfx.step();
      toast('Măsurare înregistrată · η = ' + f(current.eta * 100) + '%');
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
      rows = [];
      renderRows();
      sfx.tick();
      toast('Tabel golit.');
    });

    renderRows();
    draw();
  }


  /* ============================================================
     LAB 2 — sliding friction
     ============================================================ */
  function initLab2() {
    const mIn = $('#l2m'), dIn = $('#l2d');
    if (!mIn || !dIn) return;
    const mOut = $('#l2mv'), dOut = $('#l2dv');
    if (!mOut || !dOut) return;
    const LOut = $('#l2L'), Fml = $('#l2Fml');
    const NOut = $('#l2N'), FfOut = $('#l2Ff'), QOut = $('#l2Q'), x2Out = $('#l2x2');
    const mini = $('#l2Mini');
    const block = $('#l2BlockG'), glow = $('#l2Glow'), string = $('#l2String'), weight = $('#l2WeightG');
    const pullBtn = $('#l2Pull'), resetBtn = $('#l2Reset');
    let mu = 0.35;
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function compute() {
      const grams = parseFloat(mIn.value), d = parseFloat(dIn.value);
      const N = grams / 1000 * 10;
      const Ff = mu * N;
      return { grams, d, N, Ff, L: -Ff * d, Q: Ff * d };
    }

    function place(move) {
      if (block) block.style.transform = 'translate(' + move + 'px, 0)';
      if (glow) glow.setAttribute('cx', (190 + move).toFixed(1));
      if (glow) glow.style.opacity = move > 0 ? 0.35 : 0;
      if (string) string.setAttribute('x1', (230 + move).toFixed(1));
      if (weight) weight.style.transform = 'translate(0, ' + (move * 0.38).toFixed(1) + 'px)';
    }

    function draw() {
      const q = compute();
      mOut.textContent = q.grams + ' g';
      dOut.textContent = f(q.d) + ' m';
      LOut.innerHTML = minus(f(q.L)) + ' <small>J</small>';
      Fml.textContent = 'L = −' + f(mu, 2) + ' · ' + f(q.N) + ' N · ' + f(q.d) + ' m';
      NOut.innerHTML = f(q.N) + ' <small>N</small>';
      FfOut.innerHTML = f(q.Ff) + ' <small>N</small>';
      QOut.innerHTML = f(q.Q) + ' <small>J</small>';
      x2Out.innerHTML = minus(f(q.L * 2)) + ' <small>J</small>';

      if (mini) {
        mini.innerHTML = [q.d, q.d * 2, q.d * 3].map(dd =>
          '<tr><td>' + f(dd) + ' m</td><td>' + f(q.Ff * dd) + ' J</td><td>' + f(q.Ff * dd) + ' J</td></tr>'
        ).join('');
      }

      fillRange(mIn); fillRange(dIn);
    }

    function run() {
      stop();
      place(0);
      if (reduceMotion) { place(72); sfx.thud(); return; }
      const t0 = performance.now(), dur = 1250;
      sfx.whoosh();
      const step = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        place(72 * e);
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; sfx.thud(); }
      };
      anim = requestAnimationFrame(step);
    }

    [mIn, dIn].forEach(el => {
      el.addEventListener('input', draw);
      el.addEventListener('change', () => sfx.tick());
    });

    $$('[data-mu]', $('#panel-laborator')).forEach(b => b.addEventListener('click', () => {
      mu = parseFloat(b.dataset.mu);
      $$('[data-mu]', $('#panel-laborator')).forEach(x => x.classList.toggle('is-on', x === b));
      stop();
      place(0);
      draw();
      sfx.tick();
    }));

    if (pullBtn) pullBtn.addEventListener('click', run);
    if (resetBtn) resetBtn.addEventListener('click', () => {
      stop();
      place(0);
      sfx.tick();
    });

    draw();
  }

  /* ============================================================
     CASE 2 — pushing without motion
     ============================================================ */
  function initCase2() {
    const slider = $('#c2F');
    if (!slider) return;
    const out = $('#c2Fv'), L = $('#c2L'), badge = $('#c2Badge'), formula = $('#c2Fml');
    const car = $('#c2Car'), dArrow = $('#c2D'), dLbl = $('#c2Dlbl'), stat = $('#c2Static');
    const status = $('#c2Status');
    const THRESHOLD = 400;

    function update() {
      const Fv = parseFloat(slider.value);
      out.textContent = Fv + ' N';
      const moving = Fv >= THRESHOLD;
      if (moving) {
        const dist = 5;
        L.innerHTML = pretty(Fv * dist) + ' <small>J</small>';
        L.className = 'ro-v';
        badge.className = 'lm-badge';
        badge.textContent = 'se mișcă';
        formula.textContent = 'L = ' + Fv + ' · 5 = ' + pretty(Fv * 5) + ' J';
        if (status) status.textContent = 'se mișcă';
        dArrow.style.opacity = 1;
        dLbl.style.opacity = 1;
        stat.style.opacity = 0.15;
        if (car) car.style.transform = 'translate(' + ((Fv - THRESHOLD) / 300 * 44 + 8).toFixed(1) + 'px, 0)';
        if (car) car.style.transition = 'transform .45s cubic-bezier(.2,.7,.3,1)';
      } else {
        L.innerHTML = '0 <small>J</small>';
        L.className = 'ro-v zero';
        badge.className = 'lm-badge zero';
        badge.textContent = 'nu se mișcă';
        formula.textContent = 'prag ≈ ' + THRESHOLD + ' N · d = 0';
        if (status) status.textContent = 'nu se mișcă';
        dArrow.style.opacity = 0.22;
        dLbl.style.opacity = 0.32;
        stat.style.opacity = 0.8;
        if (car) car.style.transform = 'translate(0, 0)';
      }
      fillRange(slider);
    }

    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    update();
  }

  /* ============================================================
     CASE 3 — closed path, weight
     ============================================================ */
  function initCase3() {
    const ball = $('#c3Ball');
    if (!ball) return;
    const halo = $('#c3Halo'), up = $('#c3Up'), down = $('#c3Down'), tot = $('#c3Tot');
    const base = { x: 110, y: 250 }, top = { x: 400, y: 80 };
    let mode = 'both';
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function setPoint(u) {
      const x = base.x + (top.x - base.x) * u;
      const y = base.y + (top.y - base.y) * u;
      ball.setAttribute('cx', x.toFixed(2));
      ball.setAttribute('cy', y.toFixed(2));
      if (halo) {
        halo.setAttribute('cx', x.toFixed(2));
        halo.setAttribute('cy', y.toFixed(2));
      }
    }

    function stats() {
      const W = 30;
      if (mode === 'up') {
        up.innerHTML = minus(f(-W)) + ' <small>J</small>';
        down.textContent = '—';
        tot.innerHTML = minus(f(-W)) + ' <small>J</small>';
      } else if (mode === 'down') {
        up.textContent = '—';
        down.innerHTML = '+' + f(W) + ' <small>J</small>';
        tot.innerHTML = '+' + f(W) + ' <small>J</small>';
      } else {
        up.innerHTML = minus(f(-W)) + ' <small>J</small>';
        down.innerHTML = '+' + f(W) + ' <small>J</small>';
        tot.innerHTML = '0 <small>J</small>';
      }
    }

    function run() {
      stop();
      stats();
      const dur = mode === 'both' ? 2300 : 1150;
      if (reduceMotion) {
        setPoint(mode === 'down' ? 0 : 1);
        sfx.thud();
        return;
      }
      const t0 = performance.now();
      sfx.whoosh();
      const step = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        let u;
        if (mode === 'up') u = t;
        else if (mode === 'down') u = 1 - t;
        else u = t < 0.5 ? t * 2 : 2 - t * 2;
        const pos = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        setPoint(clamp(pos, 0, 1));
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; setPoint(mode === 'down' ? 0 : (mode === 'both' ? 0 : 1)); sfx.thud(); }
      };
      anim = requestAnimationFrame(step);
    }

    function select(m) {
      mode = m;
      $$('[data-c3]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.c3 === m));
      stop();
      if (m === 'down') setPoint(1); else setPoint(0);
      stats();
      sfx.tick();
      run();
    }

    $$('[data-c3]', lesson).forEach(b => b.addEventListener('click', () => select(b.dataset.c3)));
    const reset = $('#c3Reset');
    if (reset) reset.addEventListener('click', () => {
      mode = 'both';
      $$('[data-c3]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.c3 === 'both'));
      stop();
      setPoint(0);
      stats();
      sfx.tick();
    });

    stats();
    setPoint(0);
  }

  /* ============================================================
     CASE 4 — straight path vs zigzag, friction
     ============================================================ */
  function initCase4() {
    const marker = $('#c4Marker');
    if (!marker) return;
    const straight = $('#c4Straight'), zig = $('#c4Zig'), heat = $('#c4Heat');
    const L = $('#c4L'), dist = $('#c4D'), formula = $('#c4Fml');
    let mode = 'straight';
    let anim = null;

    function stop() {
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }

    function values() {
      const d = mode === 'straight' ? 4.0 : 5.7;
      const work = -3.0 * d;
      L.innerHTML = minus(f(work)) + ' <small>J</small>';
      dist.textContent = 'd = ' + f(d) + ' m';
      formula.textContent = 'L = −3,0 N · ' + f(d) + ' m';
    }

    function at(len) {
      const path = mode === 'straight' ? straight : zig;
      if (!path) return;
      const pt = path.getPointAtLength(clamp(len, 0, path.getTotalLength()));
      marker.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + ')');
    }

    function select(m, quiet) {
      mode = m;
      stop();
      $$('[data-c4]', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.c4 === m));
      heat.style.opacity = 0;
      at(0);
      values();
      if (!quiet) sfx.tick();
    }

    function run() {
      stop();
      const path = mode === 'straight' ? straight : zig;
      if (!path) return;
      heat.style.opacity = 0;
      at(0);
      if (reduceMotion) { at(path.getTotalLength()); heat.style.opacity = mode === 'zigzag' ? 1 : 0; sfx.thud(); return; }
      const total = path.getTotalLength();
      const t0 = performance.now(), dur = 1700;
      sfx.whoosh();
      const step = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        at(total * e);
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; if (mode === 'zigzag') heat.style.opacity = 1; sfx.thud(); }
      };
      anim = requestAnimationFrame(step);
    }

    $$('[data-c4]', lesson).forEach(b => b.addEventListener('click', () => select(b.dataset.c4)));
    const runBtn = $('#c4Run');
    if (runBtn) runBtn.addEventListener('click', run);

    select('straight', true);
  }

  /* ============================================================
     CASE 5 — spring, variable force
     ============================================================ */
  function initCase5() {
    const slider = $('#c5x');
    if (!slider) return;
    const out = $('#c5xv'), Le = $('#c5Le'), Lext = $('#c5Lext'), Fmax = $('#c5Fmax');
    const spring = $('#c5Spring'), block = $('#c5BlockG'), force = $('#c5Force'), flbl = $('#c5Flbl');
    const area = $('#c5Area'), line = $('#c5Line'), dot = $('#c5Dot');

    function springPath(x0, xEnd, y, n, amp) {
      const step = (xEnd - x0) / n;
      let d = 'M' + x0.toFixed(1) + ' ' + y;
      for (let i = 0; i < n; i++) {
        const x = x0 + step * (i + 0.5);
        const yy = y + (i % 2 ? -amp : amp);
        d += ' L' + x.toFixed(1) + ' ' + yy.toFixed(1);
      }
      d += ' L' + xEnd.toFixed(1) + ' ' + y;
      return d;
    }

    function update() {
      const x = parseFloat(slider.value);
      const xm = x / 100;
      const k = 200;
      const Fe = k * xm;
      const work = -0.5 * k * xm * xm;

      out.textContent = f(x) + ' cm';
      Le.innerHTML = minus(f(work, 2)) + ' <small>J</small>';
      Lext.innerHTML = '+' + f(-work, 2) + ' <small>J</small>';
      Fmax.innerHTML = f(Fe) + ' <small>N</small>';

      const xEnd = 272 - x * 10;
      spring.setAttribute('d', springPath(60, xEnd, 174, 16, 13));
      block.setAttribute('transform', 'translate(' + (-x * 10).toFixed(1) + ' 0)');

      const sx = 334 - x * 10;
      const flen = 12 + Fe * 4.6;
      force.setAttribute('x1', sx.toFixed(1));
      force.setAttribute('y1', 136);
      force.setAttribute('x2', (sx + flen).toFixed(1));
      force.setAttribute('y2', 136);
      flbl.setAttribute('x', (sx + flen / 2).toFixed(1));
      flbl.setAttribute('y', 127);
      force.style.opacity = Fe === 0 ? 0.25 : 1;
      flbl.style.opacity = Fe === 0 ? 0.3 : 1;

      const gx = 430 + x * 16;
      const gy = 258 - Fe * 7.5;
      if (x > 0) {
        area.setAttribute('d', 'M430 258 L' + gx.toFixed(1) + ' 258 L' + gx.toFixed(1) + ' ' + gy.toFixed(1) + ' Z');
        area.style.opacity = 1;
        line.setAttribute('x2', gx.toFixed(1));
        line.setAttribute('y2', gy.toFixed(1));
        line.style.opacity = 1;
        dot.setAttribute('cx', gx.toFixed(1));
        dot.setAttribute('cy', gy.toFixed(1));
        dot.style.opacity = 1;
      } else {
        area.style.opacity = 0;
        line.style.opacity = 0;
        dot.style.opacity = 0;
      }
      fillRange(slider);
    }

    slider.addEventListener('input', update);
    slider.addEventListener('change', () => sfx.tick());
    update();
  }

  /* ============================================================
     PROBLEMS — progressive step reveal
     ============================================================ */
  const probState = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 };
  let currentProb = 'p1';

  function problemPanel(id) {
    return $('[data-prob-panel="' + id + '"]', lesson);
  }

  function updateProblem() {
    const panel = problemPanel(currentProb);
    if (!panel) return;
    const steps = $$('.pstep', panel);
    const total = steps.length;
    const n = clamp(probState[currentProb] || 0, 0, total);
    steps.forEach((s, i) => s.classList.toggle('is-on', i < n));
    const answer = $('.panswer', panel);
    if (answer) answer.classList.toggle('is-on', n >= total);

    const counter = $('#pbCounter');
    const bar = $('#pbBar');
    const next = $('#pbNext');
    if (counter) counter.textContent = n + ' / ' + total + ' pași';
    if (bar) bar.style.width = (n / total * 100) + '%';
    if (next) {
      next.disabled = n >= total;
      next.innerHTML = n >= total ? 'Rezolvat' : 'Pasul următor <span aria-hidden="true">→</span>';
    }
  }

  function selectProblem(id) {
    if (!problemPanel(id)) return;
    currentProb = id;
    $$('.lm-pitem', lesson).forEach(b => b.classList.toggle('is-on', b.dataset.prob === id));
    $$('.lm-prob', lesson).forEach(p => p.classList.toggle('is-on', p.dataset.probPanel === id));
    updateProblem();
  }

  window.__lmSelectProblem = selectProblem;

  function initProblems() {
    const panel = $('.lm-solver');
    if (!panel) return;
    $$('.lm-pitem', lesson).forEach(b => b.addEventListener('click', () => {
      sfx.nav();
      selectProblem(b.dataset.prob);
    }));

    const next = $('#pbNext'), all = $('#pbAll'), reset = $('#pbReset');
    if (next) next.addEventListener('click', () => {
      const total = $$('.pstep', problemPanel(currentProb)).length;
      if ((probState[currentProb] || 0) < total) {
        probState[currentProb] = (probState[currentProb] || 0) + 1;
        updateProblem();
        if (probState[currentProb] >= total) sfx.good(); else sfx.step();
      }
    });
    if (all) all.addEventListener('click', () => {
      const total = $$('.pstep', problemPanel(currentProb)).length;
      probState[currentProb] = total;
      updateProblem();
      sfx.good();
    });
    if (reset) reset.addEventListener('click', () => {
      probState[currentProb] = 0;
      updateProblem();
      sfx.tick();
    });

    selectProblem('p1');
  }


  /* ============================================================
     EVALUARE — 8 questions with instant feedback
     ============================================================ */
  const QUESTIONS = [
    {
      q: 'O forță de <b>20 N</b> trage un corp pe <b>10 m</b>, sub un unghi de <b>60°</b> față de deplasare. Lucrul mecanic al forței este:',
      opts: ['200 J', '100 J', '173 J', '0 J'],
      correct: 1,
      explain: '<b>L = F · d · cos α = 20 · 10 · 0,5 = 100 J.</b> Doar componenta orizontală, F cos α = 10 N, contribuie la lucru; componenta perpendiculară are lucru nul.'
    },
    {
      q: 'Forța normală exercitată de sol asupra unui corp care alunecă pe o suprafață orizontală efectuează un lucru mecanic:',
      opts: ['pozitiv', 'negativ', 'nul', 'depinde de masă'],
      correct: 2,
      explain: '<b>Nul.</b> Normala este perpendiculară pe deplasare (α = 90°), iar cos 90° = 0. Ea susține corpul, dar nu îl deplasează pe direcția ei.'
    },
    {
      q: 'Un corp de <b>2 kg</b> cade liber pe o distanță de <b>3 m</b>. Lucrul mecanic al greutății este (g = 10 m/s²):',
      opts: ['−60 J', '+60 J', '0 J', '+6 J'],
      correct: 1,
      explain: '<b>L = m g h = 2 · 10 · 3 = +60 J.</b> La coborâre, greutatea are aceeași direcție și sens cu deplasarea, deci lucrul este pozitiv (motor).'
    },
    {
      q: 'Care dintre următoarele forțe este <b>conservativă</b>?',
      opts: ['frecarea la alunecare', 'greutatea', 'forța de tracțiune', 'rezistența aerului'],
      correct: 1,
      explain: '<b>Greutatea.</b> Lucrul ei depinde doar de diferența de nivel, nu de drum; pe un drum închis, L = 0. Frecarea și tracțiunea depind de drum.'
    },
    {
      q: 'Un resort cu <b>k = 100 N/m</b> este comprimat cu <b>10 cm</b>. Lucrul mecanic al forței elastice este:',
      opts: ['−0,5 J', '+0,5 J', '−5 J', '−1 J'],
      correct: 0,
      explain: '<b>L = −½ k x² = −½ · 100 · 0,1² = −0,5 J.</b> Forța elastică se opune comprimării; lucrul exterior necesar este +0,5 J.'
    },
    {
      q: 'Un motor efectuează un lucru mecanic de <b>600 J</b> în <b>20 s</b>. Puterea sa este:',
      opts: ['30 W', '120 W', '12 W', '1200 W'],
      correct: 0,
      explain: '<b>P = L / Δt = 600 / 20 = 30 W.</b> Wattul este joule pe secundă: 30 J în fiecare secundă.'
    },
    {
      q: 'La un plan înclinat, lucrul util este <b>200 J</b>, iar lucrul consumat este <b>250 J</b>. Randamentul este:',
      opts: ['50%', '80%', '125%', '20%'],
      correct: 1,
      explain: '<b>η = L<sub>u</sub> / L<sub>c</sub> = 200 / 250 = 0,80 = 80%.</b> Restul de 50 J s-a pierdut prin frecare, în principal ca și căldură.'
    },
    {
      q: 'Aceeași lucrare mecanică este efectuată în <b>4 s</b>, respectiv în <b>8 s</b>. Raportul puterilor <b>P₁ / P₂</b> este:',
      opts: ['1/2', '1', '2', '4'],
      correct: 2,
      explain: '<b>P₁ / P₂ = (L/4) / (L/8) = 8/4 = 2.</b> La același lucru, puterea este invers proporțională cu timpul: de două ori mai repede înseamnă putere dublă.'
    }
  ];

  const quizSkeleton = `
    <div class="lm-quiz-top">
      <span id="evCount">Întrebarea 1 din 8</span>
      <div class="lm-prog" style="width:150px"><i id="evBar" style="width:0%"></i></div>
      <span id="evScore">0 corecte</span>
    </div>
    <h3 id="evQ">Se încarcă întrebarea…</h3>
    <div class="lm-opts" id="evOpts"></div>
    <div class="lm-explain" id="evExp" aria-live="polite"></div>
    <div class="lm-quiz-foot">
      <span id="evHint">Alege varianta corectă.</span>
      <button id="evNext" class="lm-btn primary" disabled>Următoarea <span aria-hidden="true">→</span></button>
    </div>`;

  let quizIdx = 0;
  let quizAnswers = [];

  function quizEls() {
    return {
      card: $('#evCard'),
      count: $('#evCount'),
      bar: $('#evBar'),
      score: $('#evScore'),
      q: $('#evQ'),
      opts: $('#evOpts'),
      exp: $('#evExp'),
      hint: $('#evHint'),
      next: $('#evNext'),
      dots: $('#evDots'),
      big: $('#evScoreBig'),
      last: $('#evLast')
    };
  }

  function updateQuizMeta() {
    const e = quizEls();
    if (!e.card || !e.count) return;
    const answered = quizAnswers.filter(v => v === true || v === false).length;
    const score = quizAnswers.filter(v => v === true).length;
    e.count.textContent = 'Întrebarea ' + (quizIdx + 1) + ' din ' + QUESTIONS.length;
    e.score.textContent = score + ' corecte';
    if (e.big) e.big.textContent = score + ' / ' + QUESTIONS.length;
    if (e.bar) e.bar.style.width = (answered / QUESTIONS.length * 100) + '%';
    if (e.last) {
      const v = quizAnswers[quizIdx];
      e.last.textContent = v === true ? 'corect' : v === false ? 'greșit' : '—';
    }
    if (e.dots) {
      e.dots.innerHTML = QUESTIONS.map((_, i) => {
        let cls = 'lm-dot';
        if (quizAnswers[i] === true) cls += ' is-ok';
        else if (quizAnswers[i] === false) cls += ' is-bad';
        if (i === quizIdx) cls += ' is-now';
        return '<span class="' + cls + '">' + (i + 1) + '</span>';
      }).join('');
    }
  }

  function renderQuestion() {
    const e = quizEls();
    if (!e.card || !e.opts) return;
    const q = QUESTIONS[quizIdx];
    e.q.innerHTML = q.q;
    e.opts.innerHTML = q.opts.map((opt, i) =>
      '<button class="lm-opt" data-i="' + i + '"><span class="ol">' + 'ABCD'[i] + '</span><span>' + opt + '</span></button>'
    ).join('');
    e.opts.querySelectorAll('.lm-opt').forEach(b => {
      b.addEventListener('click', () => answerQuestion(parseInt(b.dataset.i, 10)));
    });
    e.exp.classList.remove('is-on');
    e.exp.innerHTML = '';
    e.hint.textContent = 'Alege varianta corectă.';
    e.next.disabled = true;
    e.next.innerHTML = quizIdx === QUESTIONS.length - 1
      ? 'Vezi rezultatul <span aria-hidden="true">→</span>'
      : 'Următoarea <span aria-hidden="true">→</span>';
    updateQuizMeta();
  }

  function answerQuestion(i) {
    const e = quizEls();
    if (!e.opts || quizAnswers[quizIdx] === true || quizAnswers[quizIdx] === false) return;
    const q = QUESTIONS[quizIdx];
    const ok = i === q.correct;
    quizAnswers[quizIdx] = ok;

    e.opts.querySelectorAll('.lm-opt').forEach((b, j) => {
      b.disabled = true;
      if (j === q.correct) b.classList.add('is-correct');
      if (j === i && !ok) b.classList.add('is-wrong');
    });
    e.exp.innerHTML = '<b>' + (ok ? 'Corect.' : 'Nu chiar.') + '</b> ' + q.explain;
    e.exp.classList.add('is-on');
    e.hint.textContent = ok ? 'Răspuns corect înregistrat.' : 'Citește explicația, apoi continuă.';
    e.next.disabled = false;
    e.next.innerHTML = quizIdx === QUESTIONS.length - 1
      ? 'Vezi rezultatul <span aria-hidden="true">→</span>'
      : 'Următoarea <span aria-hidden="true">→</span>';
    updateQuizMeta();
    if (ok) sfx.good(); else sfx.bad();
  }

  function showQuizResult() {
    const e = quizEls();
    if (!e.card) return;
    const score = quizAnswers.filter(v => v === true).length;
    const pct = Math.round(score / QUESTIONS.length * 100);
    const wrong = QUESTIONS.length - score;
    const C = 2 * Math.PI * 52;
    const dash = (pct / 100 * C).toFixed(1);
    let title, msg;
    if (score === 8) {
      title = 'Impecabil.';
      msg = 'Ai stăpânit relația, semnul lucrului, forțele conservative și randamentul. Poți trece mai departe cu încredere.';
    } else if (score >= 6) {
      title = 'Foarte bine.';
      msg = 'Baza este solidă. Recitește explicațiile de la întrebările greșite și închide ultimele goluri.';
    } else if (score >= 4) {
      title = 'Bine — dar mai exersează.';
      msg = 'Relațiile sunt aproape. Reia secțiunea „Semn și cazuri” și problemele cu forță variabilă, apoi reîncearcă.';
    } else {
      title = 'Mai exersează.';
      msg = 'Întoarce-te la definiție și la semnul lucrului mecanic. Simulările din teorie te ajută să vezi de ce apare fiecare semn.';
    }

    e.card.innerHTML = `
      <div class="lm-resultview">
        <div class="lm-ring">
          <svg viewBox="0 0 118 118" aria-hidden="true">
            <circle class="ring-c" cx="59" cy="59" r="52"></circle>
            <circle class="ring-v" cx="59" cy="59" r="52" stroke-dasharray="${dash} ${C.toFixed(1)}"></circle>
          </svg>
          <b>${pct}%</b>
        </div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <div class="lm-result-chips">
          <span>${score} corecte</span><span>${wrong} greșite</span><span>${QUESTIONS.length} întrebări</span>
        </div>
        <div class="lm-result-actions">
          <button class="lm-btn primary" data-act="restart">Reia evaluarea</button>
          <button class="lm-btn" data-act="theory">Revizuiește teoria</button>
          <button class="lm-btn ghost" data-act="problems">Probleme rezolvate</button>
        </div>
      </div>`;

    const restart = $('[data-act="restart"]', e.card);
    if (restart) restart.addEventListener('click', () => { sfx.nav(); initQuiz(); });
    const theory = $('[data-act="theory"]', e.card);
    if (theory) theory.addEventListener('click', () => goto('teorie', { sub: 'def' }));
    const problems = $('[data-act="problems"]', e.card);
    if (problems) problems.addEventListener('click', () => goto('probleme', { prob: 'p1' }));

    if (score >= 6) sfx.finish(); else sfx.bad();
  }

  function initQuiz() {
    const card = $('#evCard');
    if (!card) return;
    card.innerHTML = quizSkeleton;
    quizIdx = 0;
    quizAnswers = [];
    const e = quizEls();
    if (e.next) e.next.addEventListener('click', () => {
      if (quizIdx < QUESTIONS.length - 1) {
        quizIdx++;
        sfx.nav();
        renderQuestion();
      } else {
        showQuizResult();
      }
    });
    renderQuestion();
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function syncSoundUI() {
    const btn = $('#soundBtn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    const lbl = $('#soundLbl');
    if (lbl) lbl.textContent = soundOn ? 'Sunet activ' : 'Sunet oprit';
  }

  function boot() {
    initNav();
    initT1();
    initT2();
    initT3();
    initT4();
    initT5();
    initLab1();
    initLab2();
    initCase2();
    initCase3();
    initCase4();
    initCase5();
    initProblems();
    initQuiz();
    syncSoundUI();
    $$('input[type="range"]', lesson).forEach(fillRange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
