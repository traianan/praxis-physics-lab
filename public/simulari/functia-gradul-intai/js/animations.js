/* Tab Animații: punct mobil, panta variabilă, ordonata variabilă. */
(function () {
  'use strict';
  const P = window.Praxis;
  if (!P) return;
  const $ = P.$;

  const RATE = { point: 0.085, slope: 0.075, intercept: 0.09 };
  const BASE = { m: 2, n: 1 };

  const state = {
    mode: 'point',
    playing: false,
    phase: 0,
    speed: 1,
    base: { m: BASE.m, n: BASE.n },
    m: BASE.m,
    n: BASE.n
  };
  let graph = null;
  let raf = 0;
  let lastTs = 0;

  const el = {};

  function pingPong(phase) {
    return Math.sin(phase * Math.PI * 2 - Math.PI / 2);
  }

  function currentValues() {
    const p = state.phase;
    let m = state.base.m;
    let n = state.base.n;
    let x = null;
    if (state.mode === 'point') {
      const room = Math.abs(m) > 1e-9 ? (4.1 - Math.abs(n)) / Math.abs(m) : 5.5;
      const amp = Math.min(5.5, Math.max(0.05, room * 0.82));
      x = amp * pingPong(p);
    } else if (state.mode === 'slope') {
      m = 2.5 * pingPong(p);
    } else {
      n = 3.4 * pingPong(p);
    }
    state.m = m;
    state.n = n;
    return { m, n, x, y: x === null ? null : m * x + n };
  }

  function modeCopy() {
    if (state.mode === 'slope') {
      return {
        label: 'Panta se schimbă: dreapta se rotește în jurul punctului (0; n).',
        hint: 'Urmărește triunghiul pantei: pentru fiecare pas de 1 pe orizontală, înălțimea se schimbă cu m. Semnul lui m decide dacă dreapta urcă sau coboară.',
        note: 'm se schimbă'
      };
    }
    if (state.mode === 'intercept') {
      return {
        label: 'Ordonata se schimbă: dreapta urcă și coboară paralel cu ea însăși.',
        hint: 'n este ordonata punctului în care dreapta taie axa Oy. Schimbarea lui n translatează dreapta, fără să modifice panta.',
        note: 'n se schimbă'
      };
    }
    return {
      label: 'Punctul P(x; f(x)) se deplasează pe dreaptă.',
      hint: 'Proiecțiile punctului pe axe arată coordonatele x și f(x). Punctul rămâne mereu pe dreapta y = mx + n.',
      note: 'x se schimbă'
    };
  }

  function alphaDegrees(m) {
    if (Math.abs(m) < 1e-9) return 0;
    let deg = (Math.atan(m) * 180) / Math.PI;
    if (deg < 0) deg += 180;
    return deg;
  }

  function render(forceText) {
    const v = currentValues();
    const m = v.m;
    const n = v.n;
    const point = state.mode === 'point' && v.x !== null ? { x: v.x, y: v.y } : null;

    graph.setState({ m, n, showPoint: !!point, point });

    const progress = Math.round(state.phase * 100);
    el.progress.textContent = progress + '%';
    el.progressBar.style.width = progress + '%';
    PraxisMath.set(el.equation,P.equationLine(m,n));

    el.tileM.textContent = P.fmt(m);
    el.tileN.textContent = P.fmt(n);

    if (state.mode === 'point' && v.x !== null) {
      el.tileX.textContent = P.fmt(v.x);
      el.tileY.textContent = P.fmt(v.y);
      el.label.textContent = 'Poziția punctului P:';
      el.value.textContent = '(' + P.fmt(v.x) + '; ' + P.fmt(v.y) + ')';
    } else if (state.mode === 'slope') {
      el.tileX.textContent = '—';
      el.tileY.textContent = 'α ≈ ' + P.fmt(alphaDegrees(m), 1) + '°';
      el.label.textContent = 'Unghiul pantei:';
      el.value.textContent = 'α ≈ ' + P.fmt(alphaDegrees(m), 1) + '°';
    } else {
      el.tileX.textContent = '—';
      el.tileY.textContent = P.fmt(n);
      el.label.textContent = 'Ordonata la origine:';
      el.value.textContent = 'n = ' + P.fmt(n);
    }
  }

  function loop(ts) {
    if (!state.playing) { raf = 0; return; }
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    const rate = RATE[state.mode] || 0.085;
    state.phase = (state.phase + dt * state.speed * rate) % 1;
    render(false);
    raf = requestAnimationFrame(loop);
  }

  function play() {
    if (state.playing) return;
    state.playing = true;
    lastTs = 0;
    el.btnPlay.textContent = '⏸ Pauză';
    el.btnPlay.setAttribute('aria-pressed', 'true');
    P.sound.play('start');
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function pause() {
    if (!state.playing) return;
    state.playing = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    el.btnPlay.textContent = '▶ Redă';
    el.btnPlay.setAttribute('aria-pressed', 'false');
    render(true);
  }

  function togglePlay() {
    if (state.playing) {
      pause();
      P.sound.play('stop');
    } else {
      play();
    }
  }

  function restart() {
    pause();
    state.phase = 0;
    if (state.mode === 'point') {
      state.m = state.base.m;
      state.n = state.base.n;
    }
    render(true);
    P.sound.play('tap');
    P.toast('Animația a revenit la început.');
  }

  function applyModeCopy() {
    const copy = modeCopy();
    el.label.textContent = copy.note;
    el.hint.textContent = copy.hint;
    el.value.textContent = '';
    P.$$('.chip[data-anim]').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.anim === state.mode);
    });
  }

  function setMode(mode) {
    if (!RATE[mode] || mode === state.mode) return;
    state.mode = mode;
    state.phase = 0;
    pause();
    applyModeCopy();
    render(true);
    P.sound.play('tap');
  }

  function syncBaseFromTheory() {
    if (!P.Theory) return;
    const theory = P.Theory.getState();
    state.base.m = theory.m;
    state.base.n = theory.n;
  }

  function init() {
    el.canvas = $('#animGraph');
    el.btnPlay = $('#btnPlay');
    el.btnRestart = $('#btnRestart');
    el.speed = $('#speedRange');
    el.speedValue = $('#speedValue');
    el.equation = $('#eqAnim');
    el.label = $('#animLabel');
    el.value = $('#animValue');
    el.hint = $('#animHint');
    el.progress = $('#animProgress');
    el.progressBar = $('#animProgressBar');
    el.tileX = $('#animTileX');
    el.tileY = $('#animTileY');
    el.tileM = $('#animTileM');
    el.tileN = $('#animTileN');
    if (!el.canvas) return;

    graph = P.createLineGraph(el.canvas);

    el.btnPlay.addEventListener('click', togglePlay);
    el.btnRestart.addEventListener('click', restart);
    el.speed.addEventListener('input', () => {
      state.speed = Number(el.speed.value) || 1;
      el.speedValue.textContent = P.fmt(state.speed) + '×';
      P.syncRange(el.speed);
    });
    P.$$('.step-btn[data-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = P.clamp(Number(el.speed.value) + Number(btn.dataset.speed), 0.25, 2);
        el.speed.value = String(next);
        el.speed.dispatchEvent(new Event('input', { bubbles: true }));
        P.sound.play('tick');
      });
    });
    P.$$('.chip[data-anim]').forEach((chip) => {
      chip.addEventListener('click', () => setMode(chip.dataset.anim));
    });

    document.addEventListener('praxis:tabchange', (event) => {
      if (event.detail.tab !== 'animatii') {
        pause();
      } else {
        syncBaseFromTheory();
        if (!state.playing) {
          state.m = state.base.m;
          state.n = state.base.n;
          render(true);
        }
      }
    });
    document.addEventListener('praxis:visibility', () => {
      if (document.hidden) pause();
    });
    document.addEventListener('praxis:prefs', () => { if (graph) graph.redraw(); });
    document.addEventListener('praxis:theme', () => { if (graph) graph.redraw(); });

    el.speedValue.textContent = P.fmt(state.speed) + '×';
    P.syncRange(el.speed);
    applyModeCopy();
    render(true);
  }

  window.addEventListener("praxis-language-change",()=>render(true));
  P.Animations = { init, pause };
})();
