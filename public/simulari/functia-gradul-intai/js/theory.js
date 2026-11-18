/* Tab Teorie: starea m, n și graficul interactiv. */
(function () {
  'use strict';
  const P = window.Praxis;
  if (!P) return;
  const $ = P.$;

  const DEFAULT = { m: 2, n: 1 };
  const state = { m: DEFAULT.m, n: DEFAULT.n };
  let graph = null;

  const el = {};

  function alphaDegrees(m) {
    if (Math.abs(m) < 1e-9) return 0;
    let deg = (Math.atan(m) * 180) / Math.PI;
    if (deg < 0) deg += 180;
    return deg;
  }

  function hintText() {
    if (Math.abs(state.m) < 1e-9) {
      return 'Panta este 0, deci dreapta este orizontală. Funcția f(x) = ' + P.fmt(state.n) + ' este constantă, nu de gradul întâi.';
    }
    if (state.m > 0) {
      return 'Panta pozitivă: dreapta urcă de la stânga la dreapta cu ' + P.fmt(state.m) + ' unități la fiecare pas de 1. Unghiul α ≈ ' + P.fmt(alphaDegrees(state.m), 1) + '°.';
    }
    return 'Panta negativă: dreapta coboară cu ' + P.fmt(Math.abs(state.m)) + ' unități la fiecare pas de 1. Unghiul α ≈ ' + P.fmt(alphaDegrees(state.m), 1) + '°.';
  }

  function updatePresetChips() {
    P.$$('.chip[data-preset]').forEach((chip) => {
      const parts = chip.dataset.preset.split(',').map(Number);
      const active = Math.abs(parts[0] - state.m) < 1e-6 && Math.abs(parts[1] - state.n) < 1e-6;
      chip.classList.toggle('is-active', active);
    });
  }

  function render() {
    const m = state.m;
    const n = state.n;
    const mZero = Math.abs(m) < 1e-9;
    const zero = mZero ? null : -n / m;

    el.slope.value = String(m);
    el.intercept.value = String(n);
    el.slopeValue.textContent = P.fmt(m);
    el.interceptValue.textContent = P.fmt(n);
    PraxisMath.set(el.eq,P.equationLine(m,n));
    el.noteZero.textContent = mZero ? (Math.abs(n)<1e-9?'Orice x real este zero':'x₀ nu există') : 'x₀ = ' + P.fmtSigned(zero);
    el.noteIntercept.textContent = 'n = ' + P.fmt(n);
    el.tileM.textContent = P.fmt(m);
    el.tileN.textContent = P.fmt(n);
    el.tileZero.textContent = mZero ? (Math.abs(n)<1e-9?'ℝ':'—') : P.fmtSigned(zero);
    el.tileF0.textContent = P.fmt(n);
    el.hint.textContent = hintText();
    el.constantNote.hidden = !mZero;
    el.rangeSlope.setAttribute('aria-valuetext', 'Panta m = ' + P.fmt(m));
    el.rangeIntercept.setAttribute('aria-valuetext', 'Ordonata n = ' + P.fmt(n));
    el.canvas.setAttribute('aria-label', 'Graficul dreptei ' + P.equationLine(m, n) + ', cu panta ' + P.fmt(m) + ' și ordonata ' + P.fmt(n));

    P.syncRange(el.slope);
    P.syncRange(el.intercept);
    updatePresetChips();

    if (graph) {
      graph.setState({
        m,
        n,
        showPoint: false,
        point: null
      });
    }
    document.dispatchEvent(new CustomEvent('praxis:theory', { detail: { m, n } }));
  }

  function setState(m, n, playSound) {
    state.m = P.clamp(P.roundTo(m, 0.1), -3, 3);
    state.n = P.clamp(P.roundTo(n, 0.1), -4, 4);
    render();
    if (playSound) P.sound.play('tick');
  }

  function init() {
    el.canvas = $('#theoryGraph');
    el.slope = $('#slopeRange');
    el.intercept = $('#interceptRange');
    el.slopeValue = $('#slopeValue');
    el.interceptValue = $('#interceptValue');
    el.eq = $('#eqTheory');
    el.noteZero = $('#noteZero');
    el.noteIntercept = $('#noteIntercept');
    el.tileM = $('#tileM');
    el.tileN = $('#tileN');
    el.tileZero = $('#tileZero');
    el.tileF0 = $('#tileF0');
    el.hint = $('#theoryHint');
    el.constantNote = $('#constantNote');
    el.rangeSlope = el.slope;
    el.rangeIntercept = el.intercept;
    if (!el.canvas) return;

    graph = P.createLineGraph(el.canvas);

    el.slope.addEventListener('input', () => {
      state.m = Number(el.slope.value);
      render();
    });
    el.intercept.addEventListener('input', () => {
      state.n = Number(el.intercept.value);
      render();
    });

    P.$$('.step-btn[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = btn.dataset.step === 'm' ? Number(btn.dataset.dir) * 0.1 : Number(btn.dataset.dir) * 0.5;
        if (btn.dataset.step === 'm') setState(state.m + step, state.n, true);
        else setState(state.m, state.n + step, true);
      });
    });

    P.$$('.chip[data-preset]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const parts = chip.dataset.preset.split(',').map(Number);
        setState(parts[0], parts[1], false);
        P.sound.play('tap');
        P.toast(P.equationLine(parts[0], parts[1]));
      });
    });

    $('#btnResetTheory').addEventListener('click', () => {
      setState(DEFAULT.m, DEFAULT.n, false);
      P.sound.play('tap');
      P.toast('Valorile au revenit la y = 2x + 1.');
    });

    document.addEventListener('praxis:prefs', () => { if (graph) graph.redraw(); });
    document.addEventListener('praxis:theme', () => { if (graph) graph.redraw(); });

    render();
  }

  P.Theory = {
    init,
    render,
    getState: () => ({ m: state.m, n: state.n })
  };
})();
