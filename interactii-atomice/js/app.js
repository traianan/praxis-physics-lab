/* Interacții atomice — simulare Lennard-Jones (inspirată de PhET „Atomic Interactions”).
   Unități interne: distanță în pm, energie în K (ε/k_B), masă în u, timp în ps.
   a [pm/ps²] = F [K/pm] · 8314 / m [u] */
'use strict';
(() => {
const KB = 1.380649e-23, ACC = 8314;
const ATOMS = {
  Ne: { n: 'Neon', s: 275, e: 36, m: 20.18, c: '#e0703a' },
  Ar: { n: 'Argon', s: 340, e: 120, m: 39.95, c: '#4f6fb8' },
  O:  { n: 'Oxigen', s: 300, e: 80, m: 16.0, c: '#c23b4e' },
  X:  { n: 'Personalizat', s: 340, e: 120, m: 30, c: '#8a4fa3' }
};
const PAIRS = [['Ne','Ne'],['Ar','Ar'],['O','O'],['Ne','Ar'],['Ne','O'],['Ar','O'],['X','X']];
const COL = { curve: '#c8402a', attr: '#e08a1e', rep: '#c0397e', tot: '#2e7d57', ink: '#1a1d26', muted: '#6f6a5f', rule: '#d9cfba', h: '#2e9d4f' };
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const $ = s => document.querySelector(s);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const fmt = (x, d = 0) => x.toFixed(d).replace('.', ',').replace('-', '−');

if (location.protocol === 'file:') document.documentElement.classList.add('file');

/* ---------- sunete ---------- */
let actx = null, soundOn = localStorage.getItem('ia-sound') !== '0';
const sb = $('#soundBtn'); sb.classList.toggle('on', soundOn);
sb.onclick = () => { soundOn = !soundOn; localStorage.setItem('ia-sound', soundOn ? '1' : '0'); sb.classList.toggle('on', soundOn); beep(660, .08); };
function beep(f, d = .06, type = 'sine', vol = .08) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) {}
}

/* ---------- stare ---------- */
const st = { pair: 0, sigma: 275, eps: 36, m: 20.18, r: 400, v: 0, play: true, speed: 1, fm: 'total', zoom: 0, drag: null, A: ATOMS.Ne, B: ATOMS.Ne };

function setPair(i, keepR) {
  st.pair = i; const [a, b] = PAIRS[i]; st.A = ATOMS[a]; st.B = ATOMS[b];
  st.sigma = (st.A.s + st.B.s) / 2; st.eps = Math.sqrt(st.A.e * st.B.e); st.m = st.B.m; st.eRef = a === 'X' ? 120 : st.eps;
  $('#sim').classList.toggle('custom', a === 'X');
  syncSliders();
  if (!keepR) { st.r = 1.5 * st.sigma; st.v = 0; }
}
function syncSliders() {
  $('#sS').value = Math.round(st.sigma); $('#sE').value = Math.round(st.eps);
  $('#oS').textContent = Math.round(st.sigma) + ' pm';
  $('#oE').textContent = fmt(st.eps * KB * 1e21, 2) + '·10⁻²¹ J';
}
function setCustom(s, e) {
  ATOMS.X.s = st.sigma = clamp(Math.round(s), 200, 500);
  ATOMS.X.e = st.eps = clamp(e, 20, 300);
  syncSliders();
}

const U = r => { const q = Math.pow(st.sigma / r, 6); return 4 * st.eps * (q * q - q); };
const Frep = r => { const q = Math.pow(st.sigma / r, 6); return 48 * st.eps * q * q / r; };
const Fatt = r => -24 * st.eps * Math.pow(st.sigma / r, 6) / r;
const F = r => Frep(r) + Fatt(r); // > 0 = respingere (spre dreapta)

/* ---------- panouri ---------- */
const pairsEl = $('#pairs');
PAIRS.forEach(([a, b], i) => {
  const l = document.createElement('label');
  l.innerHTML = `<input type="radio" name="pair" value="${i}"${i ? '' : ' checked'}><span class="pair">${a === 'X' ? '<span style="grid-column:1/-1">Atracție personalizată</span>' : `<span>${ATOMS[a].n}</span><span>${ATOMS[b].n}</span>`}</span>`;
  l.querySelector('input').onchange = () => { setPair(i); beep(520, .05); };
  pairsEl.appendChild(l);
});
$('#sS').oninput = e => setCustom(+e.target.value, st.eps);
$('#sE').oninput = e => setCustom(st.sigma, +e.target.value);
document.querySelectorAll('input[name=fm]').forEach(x => x.onchange = () => { st.fm = x.value; });
document.querySelectorAll('input[name=sp]').forEach(x => x.onchange = () => { st.speed = +x.value; });
document.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { st.zoom = clamp(st.zoom + +b.dataset.z, -3, 4); beep(440 + st.zoom * 60, .04); });
const playBtn = $('#play');
function setPlay(p) { st.play = p; playBtn.textContent = p ? '❚❚ Pauză' : '▶ Pornește'; playBtn.classList.toggle('on', p); }
playBtn.onclick = () => setPlay(!st.play);
$('#step').onclick = () => { setPlay(false); advance(1 / 60 * 0.5); };
$('#reset').onclick = () => {
  ATOMS.X.s = 340; ATOMS.X.e = 120; st.zoom = 0; setPlay(true);
  pairsEl.querySelector('input').checked = true; setPair(0);
  document.querySelector('input[name=fm][value=total]').checked = true; st.fm = 'total';
  document.querySelector('input[name=sp][value="1"]').checked = true; st.speed = 1;
  beep(330, .1, 'triangle');
};

/* ---------- dinamică ---------- */
let rMaxView = 1200;
function advance(T) {
  const n = Math.ceil(T / 0.002), dt = T / n;
  for (let i = 0; i < n; i++) {
    const a1 = F(st.r) * ACC / st.m;
    st.r += st.v * dt + .5 * a1 * dt * dt;
    const a2 = F(st.r) * ACC / st.m;
    const v0 = st.v; st.v += .5 * (a1 + a2) * dt;
    if (v0 < 0 && st.v >= 0) beep(180 + 4e4 / st.sigma, .05, 'triangle', .05); // punct de întoarcere (ciocnire)
    if (st.r > rMaxView) { st.r = rMaxView; st.v = -Math.abs(st.v); }
    if (st.r < .7 * st.sigma) { st.r = .7 * st.sigma; st.v = Math.abs(st.v); }
  }
}

/* ---------- desen ---------- */
const cv = $('#cv'), ctx = cv.getContext('2d');
let W = 0, H = 0, L = {};
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2), b = cv.getBoundingClientRect();
  W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const s = Math.min(.6, (W - 60) / (W < 600 ? 780 : 1000));       // px / pm
  const x0 = 26 + .3 * 500 * s;
  const gTop = 54, gBot = H * .6;
  L = { s, x0, gTop, gBot, gH: gBot - gTop, yz: gTop + (gBot - gTop) * .42, ya: gBot + (H - gBot) * .52 };
  rMaxView = (W - 20 - x0) / s - .3 * 500;
  rMaxView = Math.max(rMaxView, 600);
}
const X = r => L.x0 + r * L.s;
const kU = () => (L.gBot - L.yz) / (st.eRef * 2.2 * Math.pow(1.6, -st.zoom)); // px / K
const YU = u => L.yz - u * kU();

function txt(s, x, y, o = {}) {
  ctx.font = o.font || `12px ${MONO}`; ctx.fillStyle = o.color || COL.ink;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y);
}
function arrow(x1, y1, x2, y2, c, w = 3, head = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1); if (len < 1) return;
  head = Math.min(head, len * .8);
  ctx.strokeStyle = ctx.fillStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * head * .8, y2 - Math.sin(a) * head * .8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - .45), y2 - head * Math.sin(a - .45));
  ctx.lineTo(x2 - head * Math.cos(a + .45), y2 - head * Math.sin(a + .45)); ctx.fill();
}
function atom(x, y, A, R) {
  const g = ctx.createRadialGradient(x - R * .35, y - R * .35, R * .1, x, y, R);
  g.addColorStop(0, '#fff'); g.addColorStop(.25, A.c + 'cc'); g.addColorStop(1, A.c);
  ctx.save(); ctx.shadowColor = A.c; ctx.shadowBlur = 18;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill(); ctx.restore();
}
function handle(x, y, dir) {
  ctx.fillStyle = COL.h; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = COL.h; ctx.lineWidth = 2;
  if (dir === 'h') { arrow(x + 10, y, x + 24, y, COL.h, 2, 6); arrow(x - 10, y, x - 24, y, COL.h, 2, 6); }
  else { arrow(x, y + 10, x, y + 24, COL.h, 2, 6); arrow(x, y - 10, x, y - 24, COL.h, 2, 6); }
}
const custom = () => PAIRS[st.pair][0] === 'X';

function draw() {
  ctx.clearRect(0, 0, W, H);
  const { x0, gTop, gBot, yz, ya, s } = L, xR = W - 14;
  // grafic
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x0, gTop - 8); ctx.lineTo(x0, gBot); ctx.stroke();
  arrow(x0, gTop + 6, x0, gTop - 12, COL.ink, 1.2, 7);
  ctx.beginPath(); ctx.moveTo(x0, yz); ctx.lineTo(xR - 8, yz); ctx.stroke();
  arrow(xR - 20, yz, xR, yz, COL.ink, 1.2, 7);
  txt('Energia potențială U', x0 + 10, gTop - 6, { font: `italic 14px "Source Serif 4", Georgia, serif` });
  txt('distanța dintre atomi r', xR - 4, yz + 14, { align: 'right', color: COL.muted, font: `italic 13px "Source Serif 4", Georgia, serif` });
  // gradații r (la 100 pm)
  for (let r = 100; X(r) < xR - 30; r += 100) {
    const x = X(r); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, yz - 3); ctx.lineTo(x, yz + 3); ctx.stroke();
    if (r % 200 === 0 && X(r) < xR - 150) txt(r + ' pm', x, yz - 11, { align: 'center', color: COL.muted, font: `10px ${MONO}` });
  }
  // curba
  ctx.save(); ctx.beginPath(); ctx.rect(x0, gTop - 14, xR - x0, gBot - gTop + 14); ctx.clip();
  ctx.strokeStyle = COL.curve; ctx.lineWidth = 2.6; ctx.beginPath();
  let first = true;
  for (let px = X(.8 * st.sigma); px <= xR; px += 1.5) {
    const r = (px - x0) / s, y = Math.max(YU(U(r)), gTop - 30);
    first ? ctx.moveTo(px, y) : ctx.lineTo(px, y); first = false;
  }
  ctx.stroke(); ctx.restore();
  // σ și ε
  const r0 = Math.pow(2, 1 / 6) * st.sigma, xs = X(st.sigma), x0e = X(r0), ye = YU(-st.eps);
  arrow(x0 + 2, yz + 22, xs, yz + 22, COL.ink, 1.3, 7); arrow(xs - 2, yz + 22, x0 + 2, yz + 22, COL.ink, 1.3, 7);
  txt('σ', (x0 + xs) / 2, yz + 34, { align: 'center', font: `italic 600 16px "Source Serif 4", serif` });
  if (ye < gBot + 40) {
    arrow(x0e, ye - 2, x0e, yz, COL.ink, 1.3, 7); arrow(x0e, yz + 2, x0e, Math.min(ye, gBot + 40), COL.ink, 1.3, 7);
    txt('ε', x0e + 8, (yz + ye) / 2, { font: `italic 600 16px "Source Serif 4", serif` });
  }
  if (custom()) { handle(xs, yz, 'h'); if (ye < gBot + 40) handle(x0e, ye, 'v'); }
  // punctul curent pe curbă
  const yd = clamp(YU(U(st.r)), gTop - 8, gBot + 40);
  ctx.fillStyle = '#8a4fa3'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(X(st.r), yd, 7, 0, 7); ctx.fill(); ctx.stroke();
  ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(138,79,163,.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X(st.r), yd + 8); ctx.lineTo(X(st.r), ya); ctx.stroke(); ctx.setLineDash([]);

  // atomi
  const RA = .3 * st.A.s * s, RB = .3 * st.B.s * s, xb = X(st.r);
  atom(x0, ya, st.A, RA); atom(xb, ya, st.B, RB);
  // pioneză
  ctx.fillStyle = '#c8402a'; ctx.beginPath(); ctx.arc(x0 + 2, ya - 4, 6, 0, 7); ctx.fill();
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 2, ya + 2); ctx.lineTo(x0 - 3, ya + 12); ctx.stroke();
  txt(st.A.n, x0, ya + RA + 14, { align: 'center', color: COL.muted, font: `11px ${MONO}` });
  txt(st.B.n, xb, ya + RB + 14, { align: 'center', color: COL.muted, font: `11px ${MONO}` });

  // forțe
  const len = f => Math.sign(f) * Math.min(42 * Math.asinh(Math.abs(f) / 2), 180);
  if (st.fm === 'total') { const l = len(F(st.r)); if (Math.abs(l) > 3) arrow(xb, ya, xb + l, ya, COL.tot, 5, 14); }
  if (st.fm === 'comp') {
    arrow(xb, ya - 7, xb + len(Fatt(st.r)), ya - 7, COL.attr, 5, 14);
    arrow(xb, ya + 7, xb + len(Frep(st.r)), ya + 7, COL.rep, 5, 14);
  }

  // valori
  const f = F(st.r) * KB * 1e12 * 1e12; // pN
  $('#oR').textContent = Math.round(st.r) + ' pm';
  $('#oU').textContent = fmt(U(st.r) * KB * 1e21, 2) + '·10⁻²¹ J';
  $('#oF').textContent = Math.abs(f) < .05 ? '0 pN' : fmt(Math.abs(f), 1) + ' pN ' + (f > 0 ? '(resp.)' : '(atr.)');
  $('#oR0').textContent = Math.round(r0) + ' pm';
}

/* ---------- tragere ---------- */
function pos(e) { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }
cv.addEventListener('pointerdown', e => {
  const p = pos(e), xb = X(st.r), RB = .3 * st.B.s * L.s;
  const r0 = Math.pow(2, 1 / 6) * st.sigma, near = (x, y, d = 16) => Math.hypot(p.x - x, p.y - y) < d;
  if (custom() && near(X(st.sigma), L.yz)) st.drag = 'sigma';
  else if (custom() && near(X(r0), YU(-st.eps))) st.drag = 'eps';
  else if (Math.hypot(p.x - xb, p.y - L.ya) < RB + 8 || near(xb, clamp(YU(U(st.r)), L.gTop - 8, L.gBot + 40), 18)) st.drag = 'atom';
  if (st.drag) { cv.setPointerCapture(e.pointerId); move(p); beep(800, .03); e.preventDefault(); }
});
cv.addEventListener('pointermove', e => {
  const p = pos(e);
  if (st.drag) move(p);
  else {
    const xb = X(st.r), hit = Math.abs(p.x - xb) < .3 * st.B.s * L.s + 8;
    cv.style.cursor = hit ? 'grab' : 'default';
  }
});
const end = () => { if (st.drag) { st.drag = null; beep(500, .04); } };
cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
function move(p) {
  if (st.drag === 'atom') { st.r = clamp((p.x - L.x0) / L.s, .88 * st.sigma, rMaxView); st.v = 0; }
  else if (st.drag === 'sigma') setCustom((p.x - L.x0) / L.s, st.eps);
  else if (st.drag === 'eps') setCustom(st.sigma, (L.yz - p.y) / kU());
}

/* ---------- buclă ---------- */
let last = performance.now();
function loop(t) {
  const dt = Math.min((t - last) / 1000, .05); last = t;
  if (st.play && st.drag !== 'atom') advance(dt * st.speed);
  draw(); requestAnimationFrame(loop);
}
addEventListener('resize', resize);
setPair(0); resize();
if (document.fonts) document.fonts.ready.then(resize);
requestAnimationFrame(loop);

/* ---------- test ---------- */
const Q = [
  ['La distanța de echilibru r₀, forța rezultantă dintre atomi este:', ['maximă, de atracție', 'zero', 'maximă, de respingere'], 1,
    'La r₀ atracția și respingerea se echilibrează; energia potențială este minimă (U = −ε).'],
  ['Ce se întâmplă dacă apropii atomii la o distanță mai mică decât σ?', ['se atrag foarte puternic', 'nu interacționează', 'se resping puternic'], 2,
    'Norii electronici se suprapun, iar respingerea (∝ 1/r¹³ ca forță) domină.'],
  ['Mărimea ε (intensitatea interacțiunii) reprezintă:', ['adâncimea gropii de potențial', 'diametrul atomului', 'masa atomului'], 0,
    'ε este energia necesară pentru a separa complet doi atomi aflați în echilibru.'],
  ['Distanța de echilibru r₀ este legată de σ prin:', ['r₀ = σ/2', 'r₀ ≈ 1,12·σ', 'r₀ = 2σ'], 1,
    'r₀ = 2^(1/6)·σ ≈ 1,12·σ — atomii în echilibru sunt puțin mai depărtați decât σ.'],
  ['Argonul are ε mai mare decât neonul. Ce substanță are temperatura de fierbere mai mare?', ['neonul', 'argonul', 'au aceeași'], 1,
    'Legătura mai puternică între atomi necesită o agitație termică mai mare pentru a-i separa: Ar fierbe la 87 K, Ne la 27 K.'],
  ['La distanțe mari (r ≫ r₀), forța dintre atomi este:', ['slabă, de atracție', 'puternică, de respingere', 'exact zero'], 0,
    'Atracția van der Waals scade repede cu distanța, dar rămâne atracție.']
];
let tried = 0, good = 0;
const quiz = $('#quiz');
Q.forEach(([q, opts, ok, ex]) => {
  const d = document.createElement('div'); d.className = 'q';
  d.innerHTML = `<p>${q}</p>${opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join('')}<div class="ex">${ex}</div>`;
  d.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (d.classList.contains('done')) return;
    const i = +b.dataset.i; d.classList.add('done'); tried++;
    d.querySelectorAll('button')[ok].classList.add('ok');
    if (i === ok) { good++; beep(880, .12); setTimeout(() => beep(1320, .15), 100); } else { b.classList.add('bad'); beep(160, .25, 'sawtooth', .05); }
    $('#score').textContent = `Scor: ${good} / ${tried}` + (tried === Q.length ? (good === Q.length ? ' — excelent! 🎉' : ' — reia simularea pentru întrebările greșite.') : '');
  });
  quiz.appendChild(d);
});

/* ---------- offline ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
