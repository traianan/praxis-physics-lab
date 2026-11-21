/* ============================================================
   core.js — utilitare, sunete (WebAudio), navigare
   ============================================================ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (v, d = 2) => {
  if (!isFinite(v)) return '—';
  const r = Math.abs(v) < 1e-9 ? 0 : v;
  return r.toFixed(d).replace(/\.?0+$/, (m) => (m.includes('.') ? '' : m));
};
const SIGNED = (v, d = 2) => (v > 1e-9 ? '+' : v < -1e-9 ? '−' : '') + Math.abs(v).toFixed(d);

/* ------------- namespace global pentru module ------------- */
const App = {
  views: {},
  state: {},
  soundOn: true,
};

/* ============================================================
   AUDIO ENGINE — totul sintetizat, fără fișiere externe
   ============================================================ */
const Sound = (() => {
  let ctx = null, master = null, enabled = true;

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { enabled = false; return null; }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function tone({ f = 440, t = 0, dur = 0.16, type = 'sine', gain = 0.18, slide = null, filter = null }) {
    if (!enabled) return;
    if (!init()) return;
    resume();
    const now = ctx.currentTime + t;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, now);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    let node = o;
    if (filter) {
      const bq = ctx.createBiquadFilter();
      bq.type = filter.type || 'lowpass';
      bq.frequency.value = filter.f || 1200;
      node.connect(bq); node = bq;
    }
    node.connect(g); g.connect(master);
    o.start(now); o.stop(now + dur + 0.04);
  }

  function noise({ dur = 0.12, gain = 0.1, hp = 800, t = 0 }) {
    if (!enabled) return;
    if (!init()) return;
    resume();
    const now = ctx.currentTime + t;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bq = ctx.createBiquadFilter(); bq.type = 'highpass'; bq.frequency.value = hp;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(bq); bq.connect(g); g.connect(master);
    src.start(now);
  }

  return {
    setEnabled(v) { enabled = v; if (v) { init(); resume(); } },
    isEnabled: () => enabled,
    /* întrerupător închis: „clack” + hum care pornește */
    switchOn() {
      noise({ dur: 0.05, gain: 0.16, hp: 1600 });
      tone({ f: 880, dur: 0.07, type: 'square', gain: 0.06 });
      tone({ f: 1320, t: 0.05, dur: 0.09, type: 'sine', gain: 0.05 });
      tone({ f: 60, t: 0.06, dur: 0.5, type: 'sine', gain: 0.035 }); // 50 Hz hum
    },
    /* întrerupător deschis: clack + hum care scade */
    switchOff() {
      noise({ dur: 0.06, gain: 0.14, hp: 1200 });
      tone({ f: 660, dur: 0.1, type: 'square', gain: 0.05, slide: 300 });
      tone({ f: 70, dur: 0.4, type: 'sine', gain: 0.03, slide: 40 });
    },
    click() { tone({ f: 1040, dur: 0.045, type: 'triangle', gain: 0.055 }); },
    tick() { tone({ f: 1800, dur: 0.022, type: 'square', gain: 0.028 }); },
    ok() { tone({ f: 660, dur: 0.11, type: 'sine', gain: 0.1 }); tone({ f: 990, t: 0.09, dur: 0.16, type: 'sine', gain: 0.085 }); },
    err() { tone({ f: 220, dur: 0.18, type: 'sawtooth', gain: 0.08, filter: { type: 'lowpass', f: 900 } }); },
    drop() {
      noise({ dur: 0.05, gain: 0.09, hp: 500 });
      tone({ f: 420, dur: 0.1, type: 'sine', gain: 0.09, slide: 250 });
    },
    connect() { tone({ f: 520, dur: 0.1, type: 'triangle', gain: 0.07, slide: 780 }); },
    del() { tone({ f: 320, dur: 0.12, type: 'square', gain: 0.05, slide: 140 }); },
    slide() { tone({ f: 1200, dur: 0.014, type: 'sine', gain: 0.014 }); },
    /* alarmă de scurtcircuit */
    alarm() {
      for (let i = 0; i < 3; i++) {
        tone({ f: 740, t: i * 0.17, dur: 0.1, type: 'square', gain: 0.06 });
        tone({ f: 560, t: i * 0.17 + 0.085, dur: 0.1, type: 'square', gain: 0.06 });
      }
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) =>
        tone({ f, t: i * 0.085, dur: 0.22, type: 'sine', gain: 0.085 }));
    },
  };
})();

/* ============================================================
   NAVIGARE
   ============================================================ */
const Router = (() => {
  const titles = {
    'k-theory': 'Partea I · Legile lui Kirchhoff',
    'k-anim': 'Partea I · Animație: legea I',
    'k-lab': 'Partea I · Laborator: ochiuri de rețea',
    'g-theory': 'Partea II · Gruparea rezistoarelor și generatoarelor',
    'g-lab': 'Partea II · Laborator: tablou de circuite',
    'g-gen': 'Partea II · Generatoare: serie și paralel',
    'g-sunt': 'Partea II · Șunt și rezistență adițională',
    'problems': 'Exersare · Probleme rezolvate',
    'quiz': 'Exersare · Test rapid',
  };
  let current = 'k-theory';
  const hooks = {};

  function go(id) {
    if (!App.views[id]) return;
    $$('.view').forEach(v => v.classList.remove('active'));
    App.views[id].classList.add('active');
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    $('#crumbs').innerHTML = (titles[id] || '').replace(/·/g, '<b>·</b>');
    current = id;
    // starea globală (LED-ul din bara de sus) se resetează la fiecare schimbare de secțiune;
    // secțiunile cu circuit o reactualizează din propriul hook
    const led = $('#ledGlobal'), pill = $('#pillText');
    if (led) led.className = 'led';
    if (pill) pill.textContent = 'fără circuit activ';
    $('#scroll').scrollTop = 0;
    if (hooks[id]) hooks[id]();
    if (window.innerWidth <= 840) { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('on'); }
  }
  return {
    go,
    on(id, fn) { hooks[id] = fn; },
    init() {
      $$('.view').forEach(v => App.views[v.id.replace(/^view-/, '')] = v);
      $$('.nav-item').forEach(b => b.addEventListener('click', () => { Sound.click(); go(b.dataset.view); }));
      $$('[data-goto]').forEach(b => b.addEventListener('click', () => { Sound.click(); go(b.dataset.goto); }));
    },
    get current() { return current; },
  };
})();

/* ============================================================
   SVG helpers
   ============================================================ */
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    if (k === 'text') e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}
const SVG_DEFS = `
<defs>
  <filter id="glowC" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="2.6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glowG" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="3.4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="lampG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff8d6"/><stop offset="1" stop-color="#fbbf24"/>
  </linearGradient>
  <marker id="arrC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#7dd3fc"/>
  </marker>
  <marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#fda4af"/>
  </marker>
  <marker id="arrLoop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#a5b4fc"/>
  </marker>
</defs>`;

/* simboluri reutilizabile pentru piese de circuit */
function resSymbol(g, x, y, w = 46, h = 18) {
  svgEl('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 3, class: 'res-box' }, g);
}
function battSymbol(g, x, y, vert = false, flipped = false) {
  // borna lungă (+) și borna scurtă (−)
  const t = 4.5, gap = 7;
  const longAt = flipped ? -1 : 1; // + pe dreapta/sus
  if (!vert) {
    svgEl('line', { x1: x - gap, y1: y - 11, x2: x - gap, y2: y + 11, class: 'batt-thin' }, g);
    svgEl('line', { x1: x + gap, y1: y - 17, x2: x + gap, y2: y + 17, class: 'batt-plate' }, g);
    if (longAt < 0) {} // păstrăm forma standard; eticheta +/− vine separat
  } else {
    svgEl('line', { x1: x - 11, y1: y + gap, x2: x + 11, y2: y + gap, class: 'batt-thin' }, g);
    svgEl('line', { x1: x - 17, y1: y - gap, x2: x + 17, y2: y - gap, class: 'batt-plate' }, g);
  }
}
function lampSymbol(g, x, y, r = 13, on = false, id = '') {
  const c = svgEl('circle', {
    cx: x, cy: y, r, fill: on ? 'url(#lampG)' : 'rgba(148,163,184,.14)',
    stroke: on ? '#fde68a' : '#93a8c9', 'stroke-width': 2,
  }, g);
  if (on) c.setAttribute('filter', 'url(#glowG)');
  svgEl('path', {
    d: `M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}`,
    stroke: on ? '#a16207' : '#93a8c9', 'stroke-width': 1.6, fill: 'none',
  }, g);
  return c;
}
function meterSymbol(g, x, y, r, letter, color = '#22d3ee') {
  svgEl('circle', { cx: x, cy: y, r, fill: '#0e1830', stroke: color, 'stroke-width': 2 }, g);
  const t = svgEl('text', {
    x, y: y + 1, fill: color, 'font-family': 'var(--mono)', 'font-size': r * 1.05,
    'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-weight': 700, text: letter,
  }, g);
  return t;
}
