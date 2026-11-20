'use strict';

/* ============================================================
   Conice - laborator interactiv
   Fără dependențe externe. Canvas 2D + Web Audio API.
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (v, n = 2) => Number(v).toLocaleString('ro-RO', { minimumFractionDigits: n, maximumFractionDigits: n });
const fmtShort = (v, n = 1) => Number(v).toLocaleString('ro-RO', { maximumFractionDigits: n });
const cssVar = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();

const CONICS = {
  circle: {
    name: 'Cerc',
    paramLabel: 'Raza r',
    paramNote: 'Distanța de la centru la orice punct al cercului.',
    min: 1, max: 4.2, step: 0.05, defaultParam: 2,
    eccMin: 0, eccMax: 0, defaultEcc: 0,
    equation: 'x² + y² = r²',
    hint: 'Planul perpendicular pe axă taie un cerc.',
    caption: 'Plan perpendicular pe axă · e = 0'
  },
  ellipse: {
    name: 'Elipsă',
    paramLabel: 'Semiaxa a',
    paramNote: 'Semiaxa mare. Semiaxa mică b depinde de excentricitate.',
    min: 1.4, max: 3.8, step: 0.05, defaultParam: 2.6,
    eccMin: 0.05, eccMax: 0.88, defaultEcc: 0.58,
    equation: 'x²/a² + y²/b² = 1',
    hint: 'Planul înclinat taie o singură pânză: elipsă.',
    caption: 'Plan înclinat · 0 < e < 1'
  },
  parabola: {
    name: 'Parabolă',
    paramLabel: 'Parametrul p',
    paramNote: 'Distanța focală este p/2; p controlează deschiderea parabolei.',
    min: 0.7, max: 3.6, step: 0.05, defaultParam: 1.5,
    eccMin: 1, eccMax: 1, defaultEcc: 1,
    equation: 'y² = 2px',
    hint: 'Planul paralel cu o generatoare produce o parabolă.',
    caption: 'Plan paralel cu o generatoare · e = 1'
  },
  hyperbola: {
    name: 'Hiperbolă',
    paramLabel: 'Semiaxa a',
    paramNote: 'Semiaxa transversală; ramurile se deschid spre stânga și dreapta.',
    min: 0.9, max: 2.8, step: 0.05, defaultParam: 1.5,
    eccMin: 1.08, eccMax: 2.4, defaultEcc: 1.55,
    equation: 'x²/a² − y²/b² = 1',
    hint: 'Planul taie ambele pânze ale conului: hiperbolă.',
    caption: 'Plan care taie ambele pânze · e > 1'
  }
};

const state = {
  conic: 'circle',
  param: CONICS.circle.defaultParam,
  ecc: 0,
  speed: 1,
  playing: true,
  t: 0,
  grid: true,
  labels: true,
  sound: true,
  auto: true
};

const focusState = {
  ecc: 0.7,
  t: 0,
  playing: true,
  speed: 1
};

let audioCtx = null;
let toastTimer = 0;

/* ---------- sunet ---------- */
function ensureAudio() {
  if (!state.sound) return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq = 520, duration = 0.055, type = 'sine', gainValue = 0.026, delay = 0) {
  if (!state.sound) return;
  const ac = ensureAudio();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function soundTick() { tone(540, 0.045, 'sine', 0.018); }
function soundSuccess() { tone(660, 0.09, 'sine', 0.03); tone(880, 0.12, 'sine', 0.022, 0.09); }
function soundError() { tone(220, 0.11, 'triangle', 0.025); }
function soundSwitch() { tone(420, 0.045, 'sine', 0.018); tone(620, 0.06, 'sine', 0.014, 0.045); }

function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function setSound(on, announce = true) {
  state.sound = !!on;
  const btn = $('#btnSound');
  const pref = $('#prefSound');
  if (btn) {
    btn.classList.toggle('on', state.sound);
    btn.classList.toggle('off', !state.sound);
    btn.setAttribute('aria-pressed', String(state.sound));
    const label = $('#soundLabel');
    if (label) label.textContent = state.sound ? 'Sunet activ' : 'Sunet oprit';
  }
  if (pref) pref.checked = state.sound;
  if (announce) toast(state.sound ? 'Sunetul este activ.' : 'Sunetul este oprit.');
  if (state.sound) soundSwitch();
}

/* ---------- canvas helpers ---------- */
function fitCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width || canvas.clientWidth || 320));
  const h = Math.max(1, Math.round(rect.height || canvas.clientHeight || 260));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelW = Math.round(w * dpr);
  const pixelH = Math.round(h * dpr);
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW;
    canvas.height = pixelH;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawArrow(ctx, x1, y1, x2, y2, color, width = 1.2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a = 7;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - a * Math.cos(angle - Math.PI / 6), y2 - a * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - a * Math.cos(angle + Math.PI / 6), y2 - a * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ============================================================
   GRAFICUL CARTEZIAN
   ============================================================ */

function drawGrid(ctx, X, Y, plot, colors) {
  const xmin = -6, xmax = 6, ymin = -5, ymax = 5;
  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.l, plot.t, plot.w, plot.h);
  ctx.clip();
  if (state.grid) {
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 0.7;
    for (let x = xmin; x <= xmax; x++) {
      ctx.beginPath();
      ctx.moveTo(X(x), plot.t);
      ctx.lineTo(X(x), plot.t + plot.h);
      ctx.stroke();
    }
    for (let y = ymin; y <= ymax; y++) {
      ctx.beginPath();
      ctx.moveTo(plot.l, Y(y));
      ctx.lineTo(plot.l + plot.w, Y(y));
      ctx.stroke();
    }
  }
  ctx.restore();

  // axe
  ctx.save();
  ctx.strokeStyle = colors.axis;
  ctx.fillStyle = colors.muted;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(plot.l, Y(0));
  ctx.lineTo(plot.l + plot.w, Y(0));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(X(0), plot.t);
  ctx.lineTo(X(0), plot.t + plot.h);
  ctx.stroke();
  drawArrow(ctx, X(0), Y(0), plot.l + plot.w - 3, Y(0), colors.axis, 1.15);
  drawArrow(ctx, X(0), Y(0), X(0), plot.t + 3, colors.axis, 1.15);
  ctx.font = '10px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let x = -6; x <= 6; x += 2) {
    if (x === 0) continue;
    ctx.fillText(String(x), X(x), Y(0) + 5);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let y = -4; y <= 4; y += 2) {
    if (y === 0) continue;
    ctx.fillText(String(y), X(0) - 6, Y(y));
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('x', plot.l + plot.w - 9, Y(0) - 5);
  ctx.fillText('y', X(0) + 7, plot.t + 10);
  ctx.restore();
}

function drawGraph() {
  const fitted = fitCanvas($('#graphCanvas'));
  if (!fitted) return;
  const { ctx, w, h } = fitted;
  const colors = {
    ink: cssVar('--ink') || '#16241d',
    muted: cssVar('--muted') || '#5f6d65',
    line: cssVar('--line') || '#e2e6df',
    green: cssVar('--green-2') || '#1c5b3f',
    amber: cssVar('--amber') || '#e39b34',
    rust: cssVar('--rust') || '#a94f36',
    tile: cssVar('--tile') || '#eef3ef'
  };
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, w, h);

  const pad = { l: 34, r: 16, t: 16, b: 27 };
  const plot = { l: pad.l, t: pad.t, w: Math.max(20, w - pad.l - pad.r), h: Math.max(20, h - pad.t - pad.b) };
  const xmin = -6, xmax = 6, ymin = -5, ymax = 5;
  const X = (x) => plot.l + (x - xmin) / (xmax - xmin) * plot.w;
  const Y = (y) => plot.t + plot.h - (y - ymin) / (ymax - ymin) * plot.h;

  drawGrid(ctx, X, Y, plot, colors);

  const p = state.param;
  const e = state.ecc;
  let a = p;
  let b = 0;
  let c = 0;

  if (state.conic === 'ellipse') {
    b = a * Math.sqrt(Math.max(0, 1 - e * e));
    c = a * e;
  } else if (state.conic === 'hyperbola') {
    b = a * Math.sqrt(Math.max(0, e * e - 1));
    c = a * e;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.l, plot.t, plot.w, plot.h);
  ctx.clip();
  ctx.strokeStyle = colors.green;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  if (state.conic === 'circle') {
    ctx.beginPath();
    ctx.arc(X(0), Y(0), (p / (xmax - xmin)) * plot.w, 0, Math.PI * 2);
    ctx.stroke();

    // centru
    ctx.fillStyle = colors.amber;
    ctx.beginPath();
    ctx.arc(X(0), Y(0), 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (state.conic === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(X(0), Y(0), (a / (xmax - xmin)) * plot.w, (b / (ymax - ymin)) * plot.h, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (state.labels) {
      ctx.fillStyle = colors.amber;
      [c, -c].forEach((fx) => {
        ctx.beginPath();
        ctx.arc(X(fx), Y(0), 3.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.rust;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('F₂', X(c), Y(0) + 7);
      ctx.fillText('F₁', X(-c), Y(0) + 7);
    }
  }

  if (state.conic === 'parabola') {
    ctx.beginPath();
    const yMax = Math.sqrt(Math.max(0, 2 * p * 5.7));
    for (let i = 0; i <= 180; i++) {
      const yy = -yMax + (2 * yMax * i) / 180;
      const xx = (yy * yy) / (2 * p);
      if (i === 0) ctx.moveTo(X(xx), Y(yy)); else ctx.lineTo(X(xx), Y(yy));
    }
    ctx.stroke();

    if (state.labels) {
      const fx = p / 2;
      ctx.strokeStyle = colors.rust;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(X(-fx), plot.t);
      ctx.lineTo(X(-fx), plot.t + plot.h);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.amber;
      ctx.beginPath();
      ctx.arc(X(fx), Y(0), 3.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.rust;
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('F', X(fx), Y(0) + 7);
    }
  }

  if (state.conic === 'hyperbola') {
    // asimptote
    if (state.grid) {
      ctx.save();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(X(-5.8), Y(sign * (-5.8) * (b / a)));
        ctx.lineTo(X(5.8), Y(sign * 5.8 * (b / a)));
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.beginPath();
    for (let i = 0; i <= 130; i++) {
      const u = -1.5 + (3 * i) / 130;
      const xx = a * Math.cosh(u);
      const yy = b * Math.sinh(u);
      if (i === 0) ctx.moveTo(X(xx), Y(yy)); else ctx.lineTo(X(xx), Y(yy));
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 130; i++) {
      const u = -1.5 + (3 * i) / 130;
      const xx = -a * Math.cosh(u);
      const yy = b * Math.sinh(u);
      if (i === 0) ctx.moveTo(X(xx), Y(yy)); else ctx.lineTo(X(xx), Y(yy));
    }
    ctx.stroke();

    if (state.labels) {
      ctx.fillStyle = colors.amber;
      [c, -c].forEach((fx) => {
        ctx.beginPath();
        ctx.arc(X(fx), Y(0), 3.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = colors.rust;
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('F₂', X(c), Y(0) + 7);
      ctx.fillText('F₁', X(-c), Y(0) + 7);
    }
  }
  ctx.restore();

  // punct mobil
  let moving = null;
  const theta = state.t * Math.PI * 2;
  if (state.conic === 'circle') {
    moving = { x: p * Math.cos(theta), y: p * Math.sin(theta) };
  } else if (state.conic === 'ellipse') {
    moving = { x: a * Math.cos(theta), y: b * Math.sin(theta) };
  } else if (state.conic === 'parabola') {
    const yy = -3.05 + 6.1 * state.t;
    moving = { x: (yy * yy) / (2 * p), y: yy };
  } else if (state.conic === 'hyperbola') {
    const u = -1.25 + 2.5 * state.t;
    moving = { x: a * Math.cosh(u), y: b * Math.sinh(u) };
  }
  if (moving && moving.x > xmin - 0.3 && moving.x < xmax + 0.3 && moving.y > ymin - 0.3 && moving.y < ymax + 0.3) {
    ctx.save();
    ctx.fillStyle = colors.amber;
    ctx.strokeStyle = cssVar('--card') || '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(X(moving.x), Y(moving.y), 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // legendă minimă pe grafic
  ctx.save();
  ctx.font = '10.5px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.muted;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(CONICS[state.conic].name, w - 12, 9);
  ctx.restore();
}

/* ============================================================
   PLAN + CON DUBLU
   ============================================================ */

function coneEllipse(ctx, cx, cy, rx, ry, start = 0, end = Math.PI * 2) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, start, end);
}

function drawCone() {
  const fitted = fitCanvas($('#coneCanvas'));
  if (!fitted) return;
  const { ctx, w, h } = fitted;
  const ink = cssVar('--ink') || '#16241d';
  const muted = cssVar('--muted') || '#5f6d65';
  const green = cssVar('--green-2') || '#1c5b3f';
  const amber = cssVar('--amber') || '#e39b34';
  const rust = cssVar('--rust') || '#a94f36';
  const card = cssVar('--card') || '#fff';

  const cx = w * 0.5;
  const apexY = h * 0.5;
  const topY = h * 0.075;
  const botY = h * 0.925;
  const rx = Math.min(w * 0.275, 108);
  const ry = Math.min(h * 0.06, 21);
  const t = state.t;
  const pulse = (Math.sin(t * Math.PI * 2) + 1) / 2;

  // fundal discret
  ctx.save();
  const bg = ctx.createRadialGradient(cx, h * 0.48, 4, cx, h * 0.48, Math.max(w, h) * 0.62);
  bg.addColorStop(0, 'rgba(255,255,255,0.30)');
  bg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // pânzele conului: generatoare
  ctx.save();
  ctx.lineWidth = 0.85;
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    ctx.strokeStyle = `rgba(28,91,63,${i % 2 ? 0.10 : 0.17})`;
    const xTop = cx + rx * Math.cos(ang);
    const yTop = topY + ry * Math.sin(ang);
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(xTop, yTop);
    ctx.stroke();
    const xBot = cx + rx * Math.cos(ang);
    const yBot = botY + ry * Math.sin(ang);
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(xBot, yBot);
    ctx.stroke();
  }
  ctx.restore();

  // contururile pânzelor
  ctx.save();
  ctx.strokeStyle = green;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - rx, topY);
  ctx.lineTo(cx, apexY);
  ctx.lineTo(cx + rx, topY);
  ctx.moveTo(cx - rx, botY);
  ctx.lineTo(cx, apexY);
  ctx.lineTo(cx + rx, botY);
  ctx.stroke();
  ctx.restore();

  // elipsele bazelor
  ctx.save();
  ctx.strokeStyle = 'rgba(28,91,63,.36)';
  ctx.lineWidth = 1.35;
  coneEllipse(ctx, cx, topY, rx, ry);
  ctx.stroke();
  coneEllipse(ctx, cx, botY, rx, ry);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(28,91,63,.85)';
  ctx.lineWidth = 1.8;
  coneEllipse(ctx, cx, topY, rx, ry, 0, Math.PI);
  ctx.stroke();
  coneEllipse(ctx, cx, botY, rx, ry, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // axa conului
  ctx.save();
  ctx.strokeStyle = 'rgba(95,109,101,.52)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(cx, topY + 12);
  ctx.lineTo(cx, botY - 12);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = muted;
  ctx.font = '10px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('axă', cx - 8, apexY - 20);
  ctx.restore();

  // vârful
  ctx.save();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(cx, apexY, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = muted;
  ctx.font = '10.5px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', cx + 7, apexY + 2);
  ctx.restore();

  // planul de tăiere + curba
  ctx.save();
  const planeColor = 'rgba(227,155,52,0.16)';
  const planeStroke = 'rgba(227,155,52,0.90)';
  ctx.fillStyle = planeColor;
  ctx.strokeStyle = planeStroke;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';

  // Cone: x² + y² = z². The cutting plane z = h + slope·y
  // gives the exact conic, and every plotted point remains on both surfaces.
  const slope = state.conic === 'circle' ? 0
    : state.conic === 'ellipse' ? state.ecc
      : state.conic === 'parabola' ? 1 : state.ecc;
  const project = (x, y, z) => ({
    x: cx + rx * x,
    y: apexY - (apexY - topY) * z + ry * y
  });
  const makePoint = (worldX, worldY, z) => ({ worldX, worldY, z, ...project(worldX, worldY, z) });
  const sample = (fn, count, closed = false) => Array.from(
    { length: closed ? count : count + 1 }, (_, index) => fn(index / count)
  );
  let h0 = 0, semiMajor = state.param / 8, semiMinor = semiMajor;
  let branches = [], closed = false;

  if (state.conic === 'circle' || state.conic === 'ellipse') {
    const e = slope;
    h0 = semiMajor * (1 - e * e);
    semiMinor = semiMajor * Math.sqrt(1 - e * e);
    const centerY = semiMajor * e;
    branches = [sample(u => {
      const angle = u * Math.PI * 2;
      const x = semiMinor * Math.cos(angle);
      const y = centerY + semiMajor * Math.sin(angle);
      return makePoint(x, y, h0 + e * y);
    }, 240, true)];
    closed = true;
  } else if (state.conic === 'parabola') {
    h0 = semiMajor;
    const xLimit = Math.sqrt(Math.max(0, 2 * h0 - h0 * h0));
    branches = [sample(u => {
      const x = xLimit * (2 * u - 1);
      const y = (x * x - h0 * h0) / (2 * h0);
      return makePoint(x, y, h0 + y);
    }, 200)];
  } else {
    const eccentricity = slope;
    const shapeA = Math.min(semiMajor, 0.82 / (eccentricity + 1));
    const b = shapeA * Math.sqrt(eccentricity * eccentricity - 1);
    h0 = shapeA * (eccentricity * eccentricity - 1);
    const centerY = -shapeA * eccentricity;
    const upperLimit = Math.acosh((1 / shapeA + 1) / eccentricity);
    const lowerLimit = Math.acosh((1 / shapeA - 1) / eccentricity);
    branches = [
      sample(u => {
        const v = (2 * u - 1) * upperLimit;
        const x = b * Math.sinh(v);
        const y = centerY + shapeA * Math.cosh(v);
        return makePoint(x, y, h0 + eccentricity * y);
      }, 180),
      sample(u => {
        const v = (2 * u - 1) * lowerLimit;
        const x = b * Math.sinh(v);
        const y = centerY - shapeA * Math.cosh(v);
        return makePoint(x, y, h0 + eccentricity * y);
      }, 180)
    ];
  }

  const allPoints = branches.flat();
  const bounds = allPoints.reduce((box, point) => ({
    minX: Math.min(box.minX, point.worldX), maxX: Math.max(box.maxX, point.worldX),
    minY: Math.min(box.minY, point.worldY), maxY: Math.max(box.maxY, point.worldY)
  }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  const marginX = Math.max(0.07, (bounds.maxX - bounds.minX) * 0.18);
  const marginY = Math.max(0.07, (bounds.maxY - bounds.minY) * 0.35);
  const planeCorners = [
    [bounds.minX - marginX, bounds.minY - marginY],
    [bounds.maxX + marginX, bounds.minY - marginY],
    [bounds.maxX + marginX, bounds.maxY + marginY],
    [bounds.minX - marginX, bounds.maxY + marginY]
  ].map(([x, y]) => project(x, y, h0 + slope * y));

  ctx.beginPath();
  planeCorners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  branches.forEach(points => {
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    if (closed) ctx.closePath();
    ctx.stroke();
  });
  ctx.restore();

  const cutPoints = branches.map(points => {
    const pointPosition = t * (closed ? points.length : points.length - 1);
    const pointIndex = Math.floor(pointPosition) % points.length;
    const pointNext = points[(pointIndex + 1) % points.length];
    const pointFraction = pointPosition - Math.floor(pointPosition);
    return {
      x: points[pointIndex].x + (pointNext.x - points[pointIndex].x) * pointFraction,
      y: points[pointIndex].y + (pointNext.y - points[pointIndex].y) * pointFraction
    };
  });
  const borderLabel = {
    x: clamp(planeCorners[0].x + 6, 8, w - 86),
    y: clamp(planeCorners[0].y - 18, 8, h - 18)
  };

  // eticheta planului
  ctx.fillStyle = rust;
  ctx.font = '10.5px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('plan secant', borderLabel.x, borderLabel.y);

  // punctele animate sunt preluate chiar din curbele de intersecție
  ctx.fillStyle = amber;
  ctx.shadowColor = 'rgba(227,155,52,.45)';
  ctx.shadowBlur = 8 + pulse * 4;
  cutPoints.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.restore();

  // etichete con
  ctx.save();
  ctx.font = '10.5px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = muted;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('con dublu', 12, h - 13);
  ctx.textAlign = 'right';
  ctx.fillText('intersecție', w - 12, h - 13);
  ctx.restore();
}

/* ============================================================
   ANIMAȚIA FOCAR - DIRECTOARE
   ============================================================ */

function drawFocus() {
  const fitted = fitCanvas($('#focusCanvas'));
  if (!fitted) return;
  const { ctx, w, h } = fitted;
  const colors = {
    ink: cssVar('--ink') || '#16241d',
    muted: cssVar('--muted') || '#5f6d65',
    line: cssVar('--line') || '#e2e6df',
    green: cssVar('--green-2') || '#1c5b3f',
    amber: cssVar('--amber') || '#e39b34',
    rust: cssVar('--rust') || '#a94f36',
    tile: cssVar('--tile') || '#eef3ef'
  };

  ctx.fillStyle = cssVar('--tile-2') || '#f4f6f2';
  ctx.fillRect(0, 0, w, h);

  // grilă punctată
  ctx.save();
  ctx.fillStyle = colors.line;
  for (let x = 22; x < w; x += 22) {
    for (let y = 20; y < h; y += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  const e = focusState.ecc;
  const scale = Math.min(w, h) / 7.2;
  const d = 2.4;
  const fx = w * 0.44;
  const fy = h * 0.5;
  const directrixX = fx + d * scale;

  // directoarea
  ctx.save();
  ctx.strokeStyle = colors.rust;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([7, 6]);
  ctx.beginPath();
  ctx.moveTo(directrixX, 18);
  ctx.lineTo(directrixX, h - 18);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = colors.rust;
  ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('d', directrixX + 8, 18);
  ctx.restore();

  // focarul
  ctx.save();
  ctx.fillStyle = colors.amber;
  ctx.shadowColor = 'rgba(227,155,52,.35)';
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.arc(fx, fy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = colors.rust;
  ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('F', fx, fy + 8);
  ctx.restore();

  let moving = null;

  if (e < 0.02) {
    // cercul: caz particular, excentricitatea este nulă
    const radius = Math.min(w, h) * 0.185;
    const centerX = fx - radius * 0.38;
    ctx.save();
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, fy, radius, 0, Math.PI * 2);
    ctx.stroke();
    const theta = focusState.t * Math.PI * 2;
    moving = { x: centerX + radius * Math.cos(theta), y: fy + radius * Math.sin(theta), theta, PD: Math.abs(directrixX - (centerX + radius * Math.cos(theta))) / scale, PF: radius / scale };
    // centru
    ctx.fillStyle = colors.amber;
    ctx.beginPath();
    ctx.arc(centerX, fy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // curba definită de |PF| = e * dist(P, d)
    const numerator = e * d;
    const pts = [];
    const SAMPLES = 900;
    for (let i = 0; i <= SAMPLES; i++) {
      const theta = (i / SAMPLES) * Math.PI * 2;
      const denom = 1 + e * Math.cos(theta);
      if (Math.abs(denom) < 0.035) continue;
      const r = numerator / denom;
      if (!isFinite(r) || Math.abs(r) > 8) continue;
      pts.push({
        x: fx + r * Math.cos(theta) * scale,
        y: fy - r * Math.sin(theta) * scale,
        theta,
        r,
        sign: Math.sign(denom)
      });
    }

    ctx.save();
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    for (const sign of [-1, 1]) {
      let drawing = false;
      for (const p of pts) {
        if (p.sign !== sign) { drawing = false; continue; }
        if (!drawing) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          drawing = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }
    ctx.restore();

    const branch = e > 1 ? pts.filter((p) => p.sign > 0) : pts;
    if (branch.length) {
      const index = Math.min(branch.length - 1, Math.floor(focusState.t * (branch.length - 1)));
      const pp = branch[index];
      moving = {
        x: pp.x,
        y: pp.y,
        theta: pp.theta,
        PF: Math.hypot(pp.x - fx, pp.y - fy) / scale,
        PD: Math.abs(directrixX - pp.x) / scale
      };
    }
  }

  if (moving) {
    // segmentele PF si PD
    ctx.save();
    ctx.strokeStyle = 'rgba(227,155,52,.95)';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(moving.x, moving.y);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(169,79,54,.82)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(moving.x, moving.y);
    ctx.lineTo(directrixX, moving.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // marcaj unghi drept
    const sx = Math.sign(directrixX - moving.x) || 1;
    ctx.strokeStyle = 'rgba(95,109,101,.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(moving.x + sx * 10, moving.y);
    ctx.lineTo(moving.x + sx * 10, moving.y + (moving.y < fy ? 10 : -10));
    ctx.stroke();

    // punctul mobil
    ctx.fillStyle = colors.green;
    ctx.strokeStyle = cssVar('--card') || '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moving.x, moving.y, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // etichete
    ctx.fillStyle = colors.ink;
    ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('P', moving.x + 8, moving.y - 5);
    ctx.fillStyle = colors.rust;
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillText('PD', (moving.x + directrixX) / 2, moving.y - 6);
    ctx.fillStyle = colors.amber;
    ctx.fillText('PF', (fx + moving.x) / 2, (fy + moving.y) / 2 - 6);
    ctx.restore();
  }

  // text informativ
  ctx.save();
  ctx.fillStyle = colors.muted;
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Focarul F și directoarea d definesc conica.', 16, h - 12);
  ctx.textAlign = 'right';
  ctx.fillText('PF / PD = e', w - 16, h - 12);
  ctx.restore();
}

/* ============================================================
   STARE INTERFAȚĂ
   ============================================================ */

function updateSliderFill(input) {
  if (!input) return;
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  const value = Number(input.value) || 0;
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, var(--green-2) 0%, var(--green-2) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`;
}

function updateUI() {
  const cfg = CONICS[state.conic];
  const paramRange = $('#paramRange');
  const eccRange = $('#eccRange');
  const eccButtons = $$('[data-step="ecc"]');

  if (paramRange) {
    paramRange.min = String(cfg.min);
    paramRange.max = String(cfg.max);
    paramRange.step = String(cfg.step);
    paramRange.value = String(state.param);
    updateSliderFill(paramRange);
  }
  if (eccRange) {
    eccRange.min = String(cfg.eccMin);
    eccRange.max = String(cfg.eccMax);
    eccRange.value = String(state.ecc);
    eccRange.disabled = state.conic === 'circle' || state.conic === 'parabola';
    updateSliderFill(eccRange);
  }
  eccButtons.forEach((b) => { b.disabled = state.conic === 'circle' || state.conic === 'parabola'; });

  $('#paramLabel').textContent = cfg.paramLabel;
  $('#paramNote').textContent = cfg.paramNote;
  $('#paramValue').textContent = fmt(state.param, 2);
  $('#eccLabel').textContent = state.conic === 'parabola' ? 'Excentricitate fixă' : 'Excentricitatea e';
  $('#eccValue').textContent = fmt(state.ecc, 2);
  $('#eccNote').textContent = state.conic === 'circle'
    ? 'Cercul are excentricitatea 0.'
    : state.conic === 'parabola'
      ? 'Parabola are întotdeauna e = 1.'
      : state.conic === 'ellipse'
        ? 'Cu cât e este mai mare, cu atât elipsa este mai alungită.'
        : 'Hiperbola are e > 1; creșterea lui e deschide ramurile.';
  $('#mainEquation').textContent = cfg.equation;
  $('#mainCaption').textContent = cfg.caption;
  $('#stageHint').textContent = cfg.hint;
  $('#graphTag').textContent = cfg.name + ' · grafic';
  $('#speedValue').textContent = fmt(state.speed, 1) + '×';
  updateSliderFill($('#speedRange'));

  $$('[data-conic]').forEach((btn) => {
    const on = btn.dataset.conic === state.conic;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-checked', String(on));
  });
  $$('[data-conic-card]').forEach((card) => {
    const on = card.dataset.conicCard === state.conic;
    card.classList.toggle('active', on);
    card.setAttribute('aria-pressed', String(on));
  });

  const tileEquation = $('#tileEquation');
  const tileEcc = $('#tileEcc');
  const tileFoci = $('#tileFoci');
  const tileKey = $('#tileKey');

  if (state.conic === 'circle') {
    tileEquation.textContent = `x² + y² = ${fmt(state.param * state.param, 2)}`;
    tileEcc.textContent = 'e = 0';
    tileFoci.textContent = 'F = O';
    tileKey.textContent = `raza r = ${fmt(state.param, 2)}`;
  } else if (state.conic === 'ellipse') {
    const a = state.param;
    const b = a * Math.sqrt(Math.max(0, 1 - state.ecc * state.ecc));
    const c = a * state.ecc;
    tileEquation.textContent = `x²/${fmt(a * a, 2)} + y²/${fmt(b * b, 2)} = 1`;
    tileEcc.textContent = `e = ${fmt(state.ecc, 2)}`;
    tileFoci.textContent = `F₁(−${fmt(c, 2)}; 0), F₂(${fmt(c, 2)}; 0)`;
    tileKey.textContent = `a = ${fmt(a, 2)} · b = ${fmt(b, 2)}`;
  } else if (state.conic === 'parabola') {
    const p = state.param;
    tileEquation.textContent = `y² = ${fmt(2 * p, 2)}x`;
    tileEcc.textContent = 'e = 1';
    tileFoci.textContent = `F(${fmt(p / 2, 2)}; 0)`;
    tileKey.textContent = `directoare x = −${fmt(p / 2, 2)}`;
  } else {
    const a = state.param;
    const b = a * Math.sqrt(Math.max(0, state.ecc * state.ecc - 1));
    const c = a * state.ecc;
    tileEquation.textContent = `x²/${fmt(a * a, 2)} − y²/${fmt(b * b, 2)} = 1`;
    tileEcc.textContent = `e = ${fmt(state.ecc, 2)}`;
    tileFoci.textContent = `F₁(−${fmt(c, 2)}; 0), F₂(${fmt(c, 2)}; 0)`;
    tileKey.textContent = `a = ${fmt(a, 2)} · b = ${fmt(b, 2)}`;
  }
  updateProgressUI();
}

function updateProgressUI() {
  const pct = Math.round(state.t * 100);
  const pv = $('#progressValue');
  const pf = $('#progressFill');
  const sp = $('#stageProgress');
  if (pv) pv.textContent = pct + '%';
  if (pf) pf.style.width = pct + '%';
  if (sp) sp.textContent = 'Poziție: ' + pct + '%';
}

function setPlaying(playing) {
  state.playing = !!playing;
  const btn = $('#btnPlay');
  if (btn) {
    btn.textContent = state.playing ? '❚❚ Pauză' : '▶ Redă';
    btn.setAttribute('aria-pressed', String(state.playing));
  }
}

function setFocusPlaying(playing) {
  focusState.playing = !!playing;
  const btn = $('#btnFocusPlay');
  if (btn) {
    btn.textContent = focusState.playing ? '❚❚ Pauză' : '▶ Redă';
    btn.setAttribute('aria-pressed', String(focusState.playing));
  }
}

function updateFocusUI() {
  const e = focusState.ecc;
  const slider = $('#focusEccRange');
  if (slider) { slider.value = String(e); updateSliderFill(slider); }
  $('#focusEccValue').textContent = fmt(e, 2);
  $('#focusLive').textContent = 'e = ' + fmt(e, 2);
  const polarFirst = $('#focusPolarFirst');
  const polarSecond = $('#focusPolarSecond');
  if (polarFirst && polarSecond) {
    if (e > 1) {
      polarFirst.textContent = 'r = e·d / (1 + e·cos θ), x < d';
      polarSecond.textContent = 'r = e·d / (e·cos θ − 1), x > d';
      polarSecond.hidden = false;
    } else {
      polarFirst.textContent = 'r = e·d / (1 + e·cos θ)';
      polarSecond.textContent = '';
      polarSecond.hidden = true;
    }
  }
  let type = 'Cerc';
  let definition = 'e = 0: cazul particular al cercului. Focarul coincide cu centrul.';
  if (e >= 0.02 && e < 0.985) {
    type = 'Elipsă';
    definition = '0 < e < 1: suma distanțelor la focare este constantă. Forma devine mai alungită pe măsură ce e crește.';
  } else if (e >= 0.985 && e <= 1.015) {
    type = 'Parabolă';
    definition = 'e = 1: distanța la focar este egală cu distanța la directoare. Curba are o singură ramură.';
  } else if (e > 1.015) {
    type = 'Hiperbolă';
    definition = 'e > 1: diferența distanțelor la focare este constantă. Curba are două ramuri.';
  }
  const tr = (text) => window.PraxisI18n?.tr?.(text) ?? text;
  $('#focusType').textContent = tr(type);
  $('#focusDefinition').textContent = tr(definition);
  const hint = type === 'Cerc'
    ? 'Cercul este cazul particular în care focarele coincid și e = 0.'
    : `${type}: punctul P păstrează raportul PF / PD = e față de focar și directoare.`;
  $('#focusHint').textContent = tr(hint);
}

/* ============================================================
   TEST GRILĂ
   ============================================================ */

const quizData = [
  {
    q: 'Ce conică obținem când planul de tăiere este perpendicular pe axa conului?',
    options: ['Cerc', 'Parabolă', 'Hiperbolă', 'Două drepte'],
    correct: 0,
    explain: 'Un plan perpendicular pe axă produce o secțiune circulară. Cercul este un caz particular de elipsă cu e = 0.'
  },
  {
    q: 'Care este excentricitatea unei parabole?',
    options: ['e = 0', '0 < e < 1', 'e = 1', 'e > 1'],
    correct: 2,
    explain: 'Pentru parabolă, distanța la focar este egală cu distanța la directoare, deci e = 1.'
  },
  {
    q: 'Ecuația x²/a² + y²/b² = 1, cu a > b > 0, reprezintă:',
    options: ['Un cerc', 'O elipsă', 'O parabolă', 'O hiperbolă'],
    correct: 1,
    explain: 'Ambii termeni pătrați au același semn pozitiv, iar numitorii diferă: este o elipsă cu semiaxa mare a.'
  },
  {
    q: 'Ce formă are intersecția dacă planul taie ambele pânze ale conului dublu?',
    options: ['Un cerc', 'O elipsă', 'O parabolă', 'O hiperbolă'],
    correct: 3,
    explain: 'Tăierea ambelor pânze produce două ramuri separate: hiperbola.'
  },
  {
    q: 'Un plan paralel cu o generatoare a conului produce:',
    options: ['Un cerc', 'O elipsă', 'O parabolă', 'Un punct'],
    correct: 2,
    explain: 'Când planul este paralel cu o generatoare, una dintre ramuri fuge la infinit și obținem o parabolă.'
  },
  {
    q: 'Care aplicație fizică este asociată cel mai direct cu o elipsă?',
    options: ['Traiectoria unui proiectil', 'Orbita unei planete', 'Oglinda parabolică', 'Mișcarea pe un cerc'],
    correct: 1,
    explain: 'Orbitele planetare în câmp gravitațional sunt elipse, cu Soarele într-un focar.'
  }
];

const quizState = { answered: new Map(), score: 0 };

function renderQuiz() {
  const container = $('#quizQuestions');
  if (!container) return;
  container.innerHTML = quizData.map((item, qi) => `
    <section class="question" data-question="${qi}">
      <h3><span class="num">${qi + 1}</span><span>${item.q}</span></h3>
      <div class="answers">
        ${item.options.map((opt, oi) => `<button class="answer" type="button" data-q="${qi}" data-o="${oi}">${opt}</button>`).join('')}
      </div>
      <div class="feedback" id="feedback-${qi}" role="status"></div>
    </section>
  `).join('');

  $$('.answer', container).forEach((btn) => {
    btn.addEventListener('click', () => answerQuiz(Number(btn.dataset.q), Number(btn.dataset.o)));
  });
  updateQuizScore();
}

function answerQuiz(qi, oi) {
  if (quizState.answered.has(qi)) return;
  const item = quizData[qi];
  const correct = oi === item.correct;
  quizState.answered.set(qi, correct);
  if (correct) quizState.score += 1;

  const qEl = $(`.question[data-question="${qi}"]`);
  if (!qEl) return;
  const buttons = $$('.answer', qEl);
  buttons.forEach((b, idx) => {
    b.disabled = true;
    if (idx === item.correct) b.classList.add('correct');
    if (idx === oi && !correct) b.classList.add('wrong');
  });
  const fb = $('#feedback-' + qi);
  if (fb) {
    fb.textContent = (correct ? 'Corect. ' : 'Nu chiar. ') + item.explain;
    fb.className = 'feedback show ' + (correct ? 'ok' : 'no');
  }
  if (correct) soundSuccess(); else soundError();
  updateQuizScore();
  if (quizState.answered.size === quizData.length) {
    setTimeout(() => {
      if (quizState.score >= 5) toast('Excelent! Ai stăpânit conicele.');
      else if (quizState.score >= 3) toast('Bun început. Reia animațiile pentru clarificare.');
      else toast('Reia lecția și încearcă din nou — progresul vine pas cu pas.');
    }, 250);
  }
}

function updateQuizScore() {
  const total = quizData.length;
  const answered = quizState.answered.size;
  const pct = (answered / total) * 100;
  const scorePct = (quizState.score / total) * 100;
  $('#quizScore').textContent = `${quizState.score} / ${total} corecte`;
  $('#quizProgress').style.width = pct + '%';
  $('#scoreNumber').textContent = String(quizState.score);
  const ring = $('#scoreRing');
  if (ring) ring.style.background = `conic-gradient(var(--green-2) ${scorePct}%, var(--line) ${scorePct}%)`;
  const msg = $('#scoreMessage');
  if (!msg) return;
  if (answered === 0) msg.textContent = 'Începe cu prima întrebare. Fiecare răspuns corect te apropie de 6/6.';
  else if (answered < total) msg.textContent = `Ai răspuns la ${answered} din ${total}. Continuă — feedbackul îți arată imediat ce trebuie reținut.`;
  else if (quizState.score === total) msg.textContent = 'Perfect! Recunoști toate conicele și proprietățile lor esențiale.';
  else if (quizState.score >= 4) msg.textContent = 'Foarte bine! Reia doar întrebările la care ai greșit pentru un scor perfect.';
  else msg.textContent = 'Mai exersează: pornește de la definiția unificată și de la secțiunile planului cu conul.';
}

function resetQuiz() {
  quizState.answered.clear();
  quizState.score = 0;
  renderQuiz();
  toast('Testul a fost resetat.');
  soundTick();
}

/* ============================================================
   INTERACȚIUNI
   ============================================================ */

function selectConic(name, announce = true) {
  if (!CONICS[name]) return;
  state.conic = name;
  const cfg = CONICS[name];
  state.param = cfg.defaultParam;
  state.ecc = cfg.defaultEcc;
  state.t = 0;
  state.playing = true;
  setPlaying(true);
  updateUI();
  if (announce) {
    toast(`${cfg.name} încărcat în laborator.`);
    soundSwitch();
  }
}

function activateTab(name, focusTab = false) {
  const tab = document.querySelector(`.tab[data-tab="${name}"]`);
  if (!tab) return;
  $$('.tab').forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
  $$('.panel').forEach((panel) => {
    const on = panel.id === 'tab-' + name;
    panel.classList.toggle('active', on);
    panel.hidden = !on;
  });
  if (focusTab) tab.focus();
  if (name === 'animatii') {
    requestAnimationFrame(() => { drawFocus(); });
  } else if (name === 'teorie') {
    requestAnimationFrame(() => { drawCone(); drawGraph(); });
  }
  soundTick();
}

function setupEvents() {
  $$('[data-conic]').forEach((btn) => {
    btn.addEventListener('click', () => selectConic(btn.dataset.conic));
  });
  $$('[data-conic-card]').forEach((card) => {
    card.addEventListener('click', () => {
      selectConic(card.dataset.conicCard);
      const target = $('.lesson-grid');
      if (target && window.innerWidth < 1000) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  $('#paramRange')?.addEventListener('input', (e) => {
    state.param = Number(e.target.value);
    updateUI();
  });
  $('#eccRange')?.addEventListener('input', (e) => {
    state.ecc = Number(e.target.value);
    updateUI();
  });
  $('#speedRange')?.addEventListener('input', (e) => {
    state.speed = Number(e.target.value);
    $('#speedValue').textContent = fmt(state.speed, 1) + '×';
    updateSliderFill(e.target);
  });

  $$('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const which = btn.dataset.step;
      const dir = Number(btn.dataset.dir);
      if (which === 'param') {
        const cfg = CONICS[state.conic];
        state.param = clamp(state.param + dir * cfg.step * 2, cfg.min, cfg.max);
      } else {
        const cfg = CONICS[state.conic];
        state.ecc = clamp(state.ecc + dir * 0.02, cfg.eccMin, cfg.eccMax);
      }
      updateUI();
    });
  });

  $('#btnPlay')?.addEventListener('click', () => {
    setPlaying(!state.playing);
    toast(state.playing ? 'Animația continuă.' : 'Animația este în pauză.');
  });
  $('#btnReset')?.addEventListener('click', () => {
    state.t = 0;
    setPlaying(true);
    updateProgressUI();
    soundTick();
  });

  $('#focusEccRange')?.addEventListener('input', (e) => {
    focusState.ecc = Number(e.target.value);
    focusState.t = 0;
    updateFocusUI();
  });
  $('#btnFocusPlay')?.addEventListener('click', () => {
    setFocusPlaying(!focusState.playing);
  });
  $('#btnFocusStep')?.addEventListener('click', () => {
    setFocusPlaying(false);
    focusState.t = (focusState.t + 0.045) % 1;
  });
  $('#btnFocusReset')?.addEventListener('click', () => {
    focusState.t = 0;
    setFocusPlaying(true);
    soundTick();
  });

  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      const tabs = $$('.tab');
      const idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activateTab(tabs[next].dataset.tab, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activateTab(tabs[0].dataset.tab, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        activateTab(tabs[tabs.length - 1].dataset.tab, true);
      }
    });
  });

  // preferințe
  const prefsPanel = $('#prefsPanel');
  $('#btnPrefs')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = prefsPanel?.classList.toggle('open');
    $('#btnPrefs').setAttribute('aria-expanded', String(!!open));
  });
  document.addEventListener('click', (e) => {
    if (!prefsPanel?.classList.contains('open')) return;
    if (!e.target.closest('#prefsPanel') && !e.target.closest('#btnPrefs')) {
      prefsPanel.classList.remove('open');
      $('#btnPrefs')?.setAttribute('aria-expanded', 'false');
    }
  });
  $('#prefGrid')?.addEventListener('change', (e) => { state.grid = e.target.checked; });
  $('#prefFoci')?.addEventListener('change', (e) => { state.labels = e.target.checked; });
  $('#prefAuto')?.addEventListener('change', (e) => {
    state.auto = e.target.checked;
    if (state.auto) { setPlaying(true); setFocusPlaying(true); }
  });
  $('#prefSound')?.addEventListener('change', (e) => setSound(e.target.checked));
  $('#btnResetPrefs')?.addEventListener('click', () => {
    state.grid = true; state.labels = true; state.auto = true;
    $('#prefGrid').checked = true;
    $('#prefFoci').checked = true;
    $('#prefAuto').checked = true;
    setSound(true, false);
    setPlaying(true);
    setFocusPlaying(true);
    updateUI();
    toast('Preferințele au fost resetate.');
  });

  // bara de sus
  $('#btnSound')?.addEventListener('click', () => setSound(!state.sound));
  $('#btnDisplay')?.addEventListener('click', (e) => {
    const on = document.body.classList.toggle('text-big');
    e.currentTarget.setAttribute('aria-pressed', String(on));
    toast(on ? 'Text mărit pentru lizibilitate.' : 'Text revenit la dimensiunea normală.');
  });
  $('#btnBoard')?.addEventListener('click', (e) => {
    const on = document.body.classList.toggle('board');
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.textContent = on ? 'Mod luminos' : 'Mod tablă';
    toast(on ? 'Mod tablă activat.' : 'Mod luminos activat.');
  });
  $('#btnHelp')?.addEventListener('click', () => {
    const dialog = $('#helpDialog');
    if (dialog?.showModal) dialog.showModal(); else dialog?.setAttribute('open', '');
  });
  $('#btnHelpClose')?.addEventListener('click', () => $('#helpDialog')?.close());
  $('#helpDialog')?.addEventListener('click', (e) => {
    if (e.target === $('#helpDialog')) $('#helpDialog').close();
  });

  $('#btnLang')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = $('#langMenu');
    const open = menu?.classList.toggle('open');
    $('#btnLang').setAttribute('aria-expanded', String(!!open));
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnLang') || e.target.closest('#langMenu')) return;
    $('#langMenu')?.classList.remove('open');
    $('#btnLang')?.setAttribute('aria-expanded', 'false');
  });

  $('#btnDownload')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = location.href.split('#')[0];
    a.download = 'conice-lectie.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Fișierul HTML a fost descărcat lângă styles.css și app.js.');
  });

  $('#btnQuizReset')?.addEventListener('click', resetQuiz);

  // feedback sonor general, discret
  let lastClickSound = 0;
  document.addEventListener('click', (e) => {
    if (!e.target.closest('button')) return;
    const now = performance.now();
    if (now - lastClickSound > 90) {
      lastClickSound = now;
      tone(520, 0.035, 'sine', 0.012);
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('input[type=range], input[type=checkbox]')) tone(620, 0.035, 'sine', 0.011);
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!$('#tab-teorie').hidden) { drawCone(); drawGraph(); }
      if (!$('#tab-animatii').hidden) drawFocus();
    }, 90);
  });
}

/* ============================================================
   BUCLE DE ANIMAȚIE
   ============================================================ */

let lastFrame = performance.now();

function animationLoop(now) {
  const dt = Math.min(0.06, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;

  if (state.playing) {
    state.t = (state.t + dt * 0.18 * state.speed) % 1;
    updateProgressUI();
  }
  if (focusState.playing) {
    focusState.t = (focusState.t + dt * 0.15 * focusState.speed) % 1;
  }

  if (!$('#tab-teorie').hidden) {
    drawCone();
    drawGraph();
  }
  if (!$('#tab-animatii').hidden) drawFocus();

  requestAnimationFrame(animationLoop);
}

/* ============================================================
   INIȚIALIZARE
   ============================================================ */

function init() {
  renderQuiz();
  setupEvents();
  updateUI();
  updateFocusUI();
  setPlaying(true);
  setFocusPlaying(true);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    setPlaying(false);
    setFocusPlaying(false);
    state.t = 0.28;
    focusState.t = 0.18;
    updateProgressUI();
  }

  requestAnimationFrame(() => {
    drawCone();
    drawGraph();
    drawFocus();
  });
  requestAnimationFrame(animationLoop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* navigare directă către un tab prin #tab-animatii etc. */
function activateHashTab() {
  const h = location.hash.replace('#tab-', '');
  if (['teorie', 'animatii', 'fizica', 'exerseaza', 'harta'].includes(h)) {
    activateTab(h);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 60);
  }
}
window.addEventListener('load', activateHashTab);
window.addEventListener('hashchange', activateHashTab);
