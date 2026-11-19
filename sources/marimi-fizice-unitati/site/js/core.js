// Utilitare comune: preferințe, sunet, formatare numere, toast.

const KEY = 'praxis-unitati';
const defaults = { scale: 1, contrast: false, board: false, sound: true, anim: true, notation: 'auto', digits: 4, best: 0, bestPct: 0, dimBest: 0, quiz: null };

export const prefs = { ...defaults, ...safeLoad() };

function safeLoad() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function savePrefs() {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* mod privat */ }
}

const listeners = new Set();
export function onPrefs(fn) { listeners.add(fn); }
export function setPref(k, v) {
  prefs[k] = v;
  savePrefs();
  listeners.forEach(fn => fn(k, v));
}

// ---------- Sunet (WebAudio, fără fișiere) ----------
let ctx;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, start, dur, type = 'sine', gain = 0.08) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const SOUNDS = {
  click: () => tone(660, 0, 0.06, 'triangle', 0.05),
  tick: () => tone(1200, 0, 0.03, 'square', 0.02),
  swap: () => { tone(440, 0, 0.08, 'triangle'); tone(660, 0.07, 0.1, 'triangle'); },
  ok: () => { tone(523, 0, 0.12); tone(659, 0.09, 0.12); tone(784, 0.18, 0.2); },
  bad: () => { tone(220, 0, 0.18, 'sawtooth', 0.04); tone(180, 0.12, 0.22, 'sawtooth', 0.04); },
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.18, 'triangle', 0.07)),
};
export function sfx(name) {
  if (!prefs.sound) return;
  try { SOUNDS[name]?.(); } catch { /* audio indisponibil */ }
}

// ---------- Numere ----------
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const supText = n => String(n).split('').map(c => SUP[c] ?? c).join('');

function decimal(x, sig) {
  const s = Number(x.toPrecision(sig)).toLocaleString('fr-FR', { maximumSignificantDigits: sig, useGrouping: true });
  return s.replace(/ | /g, ' ').replace('-', '−');
}

/** Formatează un număr ca HTML (virgulă zecimală, ·10ⁿ). */
export function fmt(x, { sig = prefs.digits, mode = prefs.notation } = {}) {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x)));
  const useSci = mode === 'sci' || (mode === 'auto' && (e < -3 || e >= 6));
  if (!useSci) return decimal(x, sig);
  let m = Number((x / 10 ** e).toPrecision(sig));
  if (Math.abs(m) >= 10) { m /= 10; e += 1; }
  const ms = decimal(m, sig);
  return e === 0 ? ms : `${ms}·10<sup>${String(e).replace('-', '−')}</sup>`;
}

/** Acceptă „12,5”, „1 200”, „3e5”, „3·10^5”, „3x10^-2”. */
export function parseNum(str) {
  if (typeof str !== 'string') return NaN;
  let s = str.trim().replace(/[\s  ]/g, '').replace(/−/g, '-').replace(',', '.');
  s = s.replace(/[x×·*]10\^?/i, 'e');
  if (s === '' || s === '-' ) return NaN;
  return Number(s);
}

// ---------- UI ----------
let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

export function confetti() {
  if (!prefs.anim || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#1f6b5c', '#c7861a', '#0f3d36', '#7fb8a4', '#e3b35b'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    p.style.animationDelay = Math.random() * 0.4 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3800);
}

export const shuffle = a => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
