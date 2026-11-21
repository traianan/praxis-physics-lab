// color.js — matematica culorii pentru simulare (model aditiv/subtractiv simplificat)
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export function rgbToCss([r, g, b], alpha = 1) {
  return `rgba(${Math.round(clamp(r) * 255)},${Math.round(clamp(g) * 255)},${Math.round(clamp(b) * 255)},${alpha})`;
}

// Convertește o lungime de undă (nm) într-un RGB aproximativ (spectru vizibil 380–700 nm).
export function wavelengthToRGB(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; b = 1; }
  else if (wl >= 440 && wl < 490) { g = (wl - 440) / 50; b = 1; }
  else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / 20; }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70; g = 1; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; }
  else if (wl >= 645 && wl <= 780) { r = 1; }
  // Atenuare la capetele spectrului.
  let f = 1;
  if (wl >= 380 && wl < 420) f = 0.3 + 0.7 * (wl - 380) / 40;
  else if (wl > 700 && wl <= 780) f = 0.3 + 0.7 * (780 - wl) / 80;
  else if (wl < 380 || wl > 780) f = 0;
  const gamma = 0.85;
  return [
    clamp(Math.pow(r * f, gamma)),
    clamp(Math.pow(g * f, gamma)),
    clamp(Math.pow(b * f, gamma)),
  ];
}

// Sensibilitate spectrală a celulelor L/M/S (aproximații Gaussiene, vârf ~560/530/420 nm).
function gauss(x, mu, sigma) { return Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)); }
export function coneResponse(wl) {
  const L = gauss(wl, 560, 45) + 0.12 * gauss(wl, 610, 60);
  const M = gauss(wl, 530, 42);
  const S = gauss(wl, 420, 40);
  return [clamp(L), clamp(M), clamp(S)];
}

// Amestec aditiv (lumină): înmulțește fiecare canal cu intensitatea și însumeă, cu trunchiere.
export function additive(beams) {
  const out = [0, 0, 0];
  for (const b of beams) {
    const inten = b.intensity ?? 1;
    for (let i = 0; i < 3; i++) out[i] += b.rgb[i] * inten;
  }
  return out.map(v => clamp(v));
}

// Amestec subtractiv (pigmenți/filtre): produs pe fiecare canal (reflecție/transmisie).
export function subtractive(colors) {
  const out = [1, 1, 1];
  for (const c of colors) for (let i = 0; i < 3; i++) out[i] *= clamp(c[i]);
  return out;
}

// Nume aproximativ al culorii dominante (RO), pentru feedback didactic.
export function colorName(rgb) {
  const [r, g, b] = rgb;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx < 0.12) return 'negru';
  if (mx - mn < 0.12) return l > 0.75 ? 'alb' : l > 0.35 ? 'gri' : 'gri închis';
  if (r >= g && r >= b) return g > 0.6 * r ? (b < 0.5 * r ? 'galben' : 'portocaliu') : 'roșu';
  if (g >= r && g >= b) return r > 0.6 * g ? 'galben-verde' : 'verde';
  if (b >= r && b >= g) return r > 0.6 * b ? 'violet' : (g > 0.6 * b ? 'cyan' : 'albastru');
  return 'culore';
}

// Pregătire canvas cu densitate de pixeli (HiDPI).
export function fitCanvas(canvas, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
