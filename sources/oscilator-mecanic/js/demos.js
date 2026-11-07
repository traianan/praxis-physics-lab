/* ===== demos.js — demonstrații interactive (canvas 2D + Sound) ===== */
'use strict';
const C = {
  accent: '#38bdf8', amber: '#fbbf24', green: '#34d399', red: '#f87171',
  violet: '#a78bfa', pink: '#f472b6', muted: '#94a3b8', ink: '#e2e8f0',
  grid: '#1f2d44', axis: '#475569',
};

/* ---------- helpers desene ---------- */
function grid(ctx, w, h, step = 40) {
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke();
}
function hLine(ctx, x1, x2, y, color, dash = []) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.setLineDash([]);
}
function arrow(ctx, x1, y1, x2, y2, color, lw = 2.5) {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 8;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4));
  ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}
function spring(ctx, x1, y, x2, coils = 9, r = 9) {
  const L = x2 - x1, seg = L / (coils * 2 + 2);
  ctx.strokeStyle = C.muted; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + seg, y);
  for (let i = 0; i < coils * 2; i++) {
    ctx.lineTo(x1 + seg * (i + 2), y + (i % 2 ? r : -r));
  }
  ctx.lineTo(x2, y); ctx.stroke();
}
function label(ctx, txt, x, y, color = C.ink, size = 12, align = 'left') {
  ctx.fillStyle = color; ctx.font = `${size}px "Segoe UI", sans-serif`;
  ctx.textAlign = align; ctx.fillText(txt, x, y); ctx.textAlign = 'left';
}
function ball(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 5, x, y, r);
  g.addColorStop(0, '#ffffffcc'); g.addColorStop(0.25, color); g.addColorStop(1, '#00000088');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

/* =============================================================
 * 1) DEMO diapazon — „vizualizarea" sunetului (fig. 1.1.1.3–4)
 * ============================================================= */
App.register({
  id: 'demo-fork',
  reset(s) { s.strikeT = -10; },
  wire(shell, s) {
    s.strikeT = -10; s.auto = true;
    shell.querySelector('[data-act="strike"]').addEventListener('click', () => {
      s.strikeT = s.t; Sound.ensure(); Sound.pluckTuningFork(440);
    });
    shell.querySelector('[data-act="autopulse"]').addEventListener('change', e => { s.auto = e.target.checked; });
  },
  frame(s, dt) {
    if (s.auto && s.t - s.strikeT > 4.2) { s.strikeT = s.t; Sound.pluckTuningFork(440, 0.18); }
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 36);
    const mid = h / 2, t0 = s.t - s.strikeT;
    // axa timpului
    hLine(ctx, 10, w - 10, mid, C.axis);
    label(ctx, 'semnal înregistrat de „exploratorul sonic" — nota LA (440 Hz)', 14, 20, C.muted, 12);
    label(ctx, 't (s) →', w - 60, mid - 8, C.muted);
    // anvelopa A0 e^{-bt}, b mic (amortizare lentă, ca în fig. 1.1.3.2)
    const b = 0.55, span = 4.2, px = (w - 60) / span;
    ctx.strokeStyle = C.amber; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const tt = i / 120 * span; const y = (h / 2 - 22) * Math.exp(-b * tt); if (i === 0) ctx.moveTo(50 + tt * px, mid - y); else ctx.lineTo(50 + tt * px, mid - y); }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const tt = i / 120 * span; const y = (h / 2 - 22) * Math.exp(-b * tt); if (i === 0) ctx.moveTo(50 + tt * px, mid + y); else ctx.lineTo(50 + tt * px, mid + y); }
    ctx.stroke(); ctx.setLineDash([]);
    // unda
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    ctx.beginPath();
    const amp = h / 2 - 22;
    for (let i = 0; i <= 900; i++) {
      const tt = i / 900 * span;
      const env = t0 >= 0 ? Math.exp(-b * Math.max(0, tt)) : 0;
      // 440 Hz ar fi vizibil doar cu „pachete" de perioade — desenăm 60 osc/ds ca în registratoarele grafice
      const y = amp * env * Math.sin(2 * Math.PI * 14 * tt);
      const X = 50 + tt * px, Y = mid - y;
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // diapazon minimalist în colț
    const forkX = 24, forkY = h - 56, struck = (s.t - s.strikeT) < 1.2;
    ctx.strokeStyle = struck ? C.amber : C.muted; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(forkX, forkY + 34); ctx.lineTo(forkX, forkY + 12);
    const d = struck ? 3 * Math.sin(s.t * 55) : 0;
    ctx.moveTo(forkX - 7 + d, forkY - 18); ctx.lineTo(forkX - 7 + d, forkY + 12);
    ctx.moveTo(forkX + 7 - d, forkY - 18); ctx.lineTo(forkX + 7 - d, forkY + 12);
    ctx.moveTo(forkX - 10, forkY + 12); ctx.lineTo(forkX + 10, forkY + 12);
    ctx.stroke();
    if (s.ro) s.ro.textContent = t0 >= 0 && t0 < 6 ? `t = ${t0.toFixed(2)} s de la lovire · A = A₀·e^(−0,55·t)` : 'Apasă „Lovește diapazonul"';
  },
});

/* =============================================================
 * 2) DEMO exemple periodice (balansoar, pendul, coardă, seism)
 * ============================================================= */
App.register({
  id: 'demo-examples',
  wire(shell, s) {
    s.cells = [
      { name: 'balansoar', color: C.accent },
      { name: 'pendul', color: C.amber },
      { name: 'coarda chitarei (sunet!)', color: C.pink },
      { name: 'seism (teren)', color: C.green },
    ];
    shell.querySelector('canvas').addEventListener('click', (e) => {
      const r = e.target.getBoundingClientRect();
      const i = Math.floor((e.clientX - r.left) / (r.width / 4));
      if (i === 2) Sound.beep(146.83, 0.9, 0.25, 'sawtooth');       // Re3 coardă
      else if (i === 3) Sound.beep(45, 0.5, 0.35, 'sine');           // f joasă seism
      else Sound.tick(0.15);
    });
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const cw = w / 4, t = s.t;
    s.cells.forEach((c, i) => {
      const cx = cw * i + cw / 2, base = h - 46;
      ctx.strokeStyle = C.axis;
      switch (i) {
        case 0: { // balansoar
          const th = 0.5 * Math.sin(t * 2.2);
          ctx.strokeStyle = c.color; ctx.lineWidth = 2;
          ctx.save(); ctx.translate(cx, 24); ctx.rotate(th);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 90); ctx.stroke();
          ctx.fillStyle = c.color; ctx.fillRect(-24, 90, 48, 8);
          ball(ctx, 0, 82, 8, c.color);
          ctx.restore();
          break;
        }
        case 1: { // pendul gravitațional
          const th = 0.6 * Math.sin(t * 2.6);
          ctx.save(); ctx.translate(cx, 18); ctx.rotate(th);
          ctx.strokeStyle = c.color; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.stroke();
          ball(ctx, 0, 110, 11, c.color);
          ctx.restore();
          hLine(ctx, cx - 46, cx + 46, 18, C.axis, [4, 4]);
          break;
        }
        case 2: { // coardă fixă la ambele capete — mod fundamental
          ctx.strokeStyle = c.color; ctx.lineWidth = 2.4;
          ctx.beginPath();
          for (let x = -cw / 2 + 12; x <= cw / 2 - 12; x += 3) {
            const u = (x + cw / 2 - 12) / (cw - 24);
            const y = 70 * Math.sin(t * 9) * Math.sin(Math.PI * u);
            if (x === -cw / 2 + 12) ctx.moveTo(cx + x, 70 + y); else ctx.lineTo(cx + x, 70 + y);
          }
          ctx.stroke();
          ctx.fillStyle = C.muted;
          ctx.fillRect(cx - cw / 2 + 8, 60, 5, 20); ctx.fillRect(cx + cw / 2 - 13, 60, 5, 20);
          break;
        }
        case 3: { // teren seism
          ctx.strokeStyle = c.color; ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = -cw / 2 + 10; x <= cw / 2 - 10; x += 4) {
            const u = (x + cw / 2) / cw;
            const y = 10 * Math.sin(t * 12 + u * 9);
            if (x === -cw / 2 + 10) ctx.moveTo(cx + x, base + y); else ctx.lineTo(cx + x, base + y);
          }
          ctx.stroke();
          // clădire
          const sh = 5 * Math.sin(t * 12);
          ctx.fillStyle = c.color + '55'; ctx.strokeStyle = c.color;
          ctx.fillRect(cx - 16 + sh, base - 58, 32, 58); ctx.strokeRect(cx - 16 + sh, base - 58, 32, 58);
          break;
        }
      }
      label(ctx, c.name, cw * i + 8, h - 12, c.color, 12);
    });
    label(ctx, 'Toate sunt mișcări periodice — „sursă de oscilație"', 12, 16, C.muted, 11);
  },
});

/* =============================================================
 * 3) DEMO pendul (1.1.1 activitate experimentală): oscilație completă
 * ============================================================= */
App.register({
  id: 'demo-pendulum',
  reset(s) { s.N = 0; s.lastSign = 0; },
  wire(shell, s) { s.N = 0; s.lastSign = 0; },
  onParam(s, k) { if (k === 'L' || k === 'A') { s.N = 0; s.lastSign = 0; } },
  frame(s, dt) {
    const L = +s.sliders.L.value, A = +s.sliders.A.value * Math.PI / 180;
    const th = A * Math.cos(s.t * Math.sqrt(9.81 / L));   // model armonic (unghiuri mici)
    s.th = th;
    const sign = Math.cos(s.t * Math.sqrt(9.81 / L)) > 0 ? 1 : -1;
    if (sign === 1 && s.lastSign === -1) s.N++;
    s.lastSign = sign;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const L = +s.sliders.L.value, A = +s.sliders.A.value * Math.PI / 180;
    const px = 24, ox = w / 2, oy = 40, R = (h - 90) * (L / 2.5 + 0.3);
    const th = s.th || 0;
    // tavan
    hLine(ctx, ox - R * 0.7, ox + R * 0.7, oy, C.axis);
    ctx.fillStyle = C.axis;
    for (let x = ox - R * 0.7; x < ox + R * 0.7; x += 12) { ctx.fillRect(x, oy - 6, 6, 6); }
    // axa de simetrie + puncte de întoarcere
    hLine(ctx, ox, ox, oy, C.axis, [3, 5]);
    const xL = ox + Math.sin(-A) * R, xRt = ox + Math.sin(A) * R, yy = oy + Math.cos(A) * R;
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(xL, yy); ctx.moveTo(ox, oy); ctx.lineTo(xRt, yy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = C.amber;
    [xL, xRt].forEach(x => ctx.strokeRect(x - 5, oy + Math.cos(A) * R - 5, 10, 10));
    label(ctx, 'puncte de întoarcere', ox, h - 14, C.amber, 11, 'center');
    // fir + Bila
    const bx = ox + Math.sin(th) * R, by = oy + Math.cos(th) * R;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.stroke();
    ball(ctx, bx, by, 15, C.accent);
    // forța de revenire Gt (tangentă la traiectorie, spre echilibru)
    const Gt = 60 * Math.sin(Math.abs(th)) / Math.max(0.15, A) * 0.5;
    const dir = th > 0 ? -1 : 1;
    if (Math.abs(th) > 0.01) {
      const tx = Math.cos(th) * dir, ty = -Math.sin(th) * dir;
      arrow(ctx, bx, by, bx + tx * Gt, by + ty * Gt, C.red, 3);
      label(ctx, 'Gt (forță de revenire)', bx + tx * Gt + 4, by + ty * Gt - 4, C.red, 11);
    }
    // unghiul
    ctx.strokeStyle = C.violet; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ox, oy, 34, Math.PI / 2 - Math.max(th, 0), Math.PI / 2 - Math.min(th, 0)); ctx.stroke();
    label(ctx, `θ = ${(th * 180 / Math.PI).toFixed(1)}°`, ox + 40, oy + 44, C.violet, 11);
    if (s.ro) s.ro.textContent = `N = ${s.N} oscilații complete · T = ${(2 * Math.PI * Math.sqrt(L / 9.81)).toFixed(2)} s`;
  },
});

/* =============================================================
 * 4) DEMO mărimi caracteristice (1.1.2): A, T, ν + cronometru
 * ============================================================= */
App.register({
  id: 'demo-marimi',
  reset(s) { s.samples = []; s.N = 0; s.lastPhase = 0; },
  wire(shell, s) { s.samples = []; s.N = 0; s.lastPhaseCycle = -1; },
  onParam(s) { s.samples = []; s.N = 0; s.lastPhaseCycle = -1; },
  frame(s, dt) {
    const A = +s.sliders.A.value, T = +s.sliders.T.value;
    const y = A * Math.cos(2 * Math.PI * s.t / T);  // start din punct de întoarcere
    s.y = y;
    const cycle = Math.floor(s.t / T);
    if (cycle !== s.lastPhaseCycle) {
      if (s.lastPhaseCycle >= 0 && s.running && s.checks.sound && s.checks.sound.checked) Sound.tick(0.25);
      s.lastPhaseCycle = cycle; s.N = cycle;
    }
    if (!s.running) return;
    s.samples.push([s.t, y]);
    const span = Math.max(6, 4 * T);
    while (s.samples.length && s.samples[0][0] < s.t - span) s.samples.shift();
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = +s.sliders.A.value, T = +s.sliders.T.value;
    const span = Math.max(6, 4 * T);
    const midY = h / 2, pxs = (w - 90) / span;
    const ox = 70;
    // axa y (elongație)
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(34, 14); ctx.lineTo(34, h - 14); ctx.moveTo(14, midY); ctx.lineTo(w - 14, midY); ctx.stroke();
    label(ctx, 'x (m)', 40, 22, C.muted); label(ctx, 't (s)', w - 56, midY - 8, C.muted);
    // nivel ±A
    const yA = (h / 2 - 30);
    hLine(ctx, 34, w - 14, midY - yA, C.amber, [6, 4]);
    hLine(ctx, 34, w - 14, midY + yA, C.amber, [6, 4]);
    label(ctx, `+A = ${A.toFixed(2)} m`, 38, midY - yA - 4, C.amber, 11);
    label(ctx, `−A`, 38, midY + yA + 14, C.amber, 11);
    // marcaje T
    for (let k = Math.ceil((s.t - span) / T); k * T <= s.t; k++) {
      const X = ox + (k * T - (s.t - span)) * pxs;
      ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.moveTo(X, midY - 6); ctx.lineTo(X, midY + 6); ctx.stroke();
      if (k > 0 && (k === 1 || (k - 1) * T >= s.t - span)) {
        ctx.strokeStyle = C.violet; ctx.lineWidth = 1.2;
        arrow(ctx, ox + ((k - 1) * T - (s.t - span)) * pxs, midY + 34, X, midY + 34, C.violet, 1.2);
        label(ctx, 'T', (ox + ((k - 1) * T - (s.t - span)) * pxs + X) / 2 - 4, midY + 30, C.violet, 11);
      }
    }
    // bila pe axa verticală în stânga
    const yPix = (s.y || 0) * ((h / 2 - 30) / A);
    ball(ctx, 34, midY - yPix, 9, C.accent);
    // linie ghidaj până la grafic
    ctx.strokeStyle = C.accent + '44'; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(43, midY - yPix); ctx.lineTo(ox + (s.t - (s.t - span)) * pxs, midY - yPix); ctx.stroke();
    ctx.setLineDash([]);
    // curba
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath();
    let first = true;
    for (const [tt, yy] of s.samples) {
      const X = ox + (tt - (s.t - span)) * pxs, Y = midY - yy * ((h / 2 - 30) / A);
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // punct curent
    const cy = midY - (s.y || 0) * ((h / 2 - 30) / A);
    ball(ctx, ox + span * pxs, cy, 6, C.green);
    // puncte de întoarcere □
    ctx.strokeStyle = C.amber;
    ctx.strokeRect(ox + span * pxs - 4, midY - (h / 2 - 30) - 4, 8, 8);
    ctx.strokeRect(ox + span * pxs - 4, midY + (h / 2 - 30) - 4, 8, 8);
    if (s.ro) {
      const nu = s.N / Math.max(s.t, 1e-6);
      s.ro.textContent = `Δt = ${s.t.toFixed(1)} s · N = ${s.N} · ν = ${nu.toFixed(2)} Hz · 1/T = ${(1 / T).toFixed(2)} Hz`;
    }
  },
});

/* =============================================================
 * 5) DEMO amortizare (1.1.3): aer → apă → tranzitoriu → aperiodic
 * ============================================================= */
App.register({
  id: 'demo-amort',
  reset(s) { s.samples = []; },
  wire(shell, s) {
    s.samples = [];
    const sel = shell.querySelector('[data-sl="regim"]');
    const presets = {
      aer: 0.08, apa: 0.8, tranzitoriu: 2.2, aperiodic: 4.0,
    };
    sel.addEventListener('change', () => {
      const b = presets[sel.value];
      s.sliders.b.value = b;
      s.sliders.b_fmt();
      s.samples = []; s.t = 0;
    });
  },
  onParam(s) { s.samples = []; },
  frame(s, dt) {
    const b = +s.sliders.b.value, T = +s.sliders.T.value;
    const w0 = 2 * Math.PI / T;
    // integrare numerică: ẍ = -2b ẋ - ω0² x  (forma echivalentă legii A = A0 e^{-bt})
    if (s.x === undefined) { s.x = 1; s.v = 0; }
    if (s.t === 0 || s.samples.length === 0 && (s.x !== 1)) { s.x = 1; s.v = 0; }
    const k1 = 40; // subpase pentru stabilitate la b mare
    const h = dt / k1;
    for (let i = 0; i < k1; i++) {
      const a = -2 * b * s.v - w0 * w0 * s.x;
      s.v += a * h; s.x += s.v * h;
    }
    if (!s.running) return;
    s.samples.push([s.t, s.x]);
    const span = Math.max(8, 6 * T);
    while (s.samples.length && s.samples[0][0] < s.t - span) s.samples.shift();
    s.regime = b < w0 / 4 ? 'oscilatoriu amortizat' : (b < w0 ? 'tranzitoriu (cvasiaperiodic)' : 'aperiodic (fără oscilații)');
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const b = +s.sliders.b.value, T = +s.sliders.T.value;
    const span = Math.max(8, 6 * T);
    const midY = h / 2, ox = 40, pxs = (w - 70) / span, py = (h / 2 - 26);
    const A0 = 1;
    hLine(ctx, ox, w - 14, midY, C.axis);
    label(ctx, 'x / A₀', 10, 18, C.muted); label(ctx, 't (s)', w - 56, midY + 16, C.muted);
    // anvelopa A0 e^{-bt}
    ctx.strokeStyle = C.amber; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const tt = i / 160 * span, env = A0 * Math.exp(-b * tt);
      const X = ox + tt * pxs;
      if (i === 0) ctx.moveTo(X, midY - env * py); else ctx.lineTo(X, midY - env * py);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const tt = i / 160 * span, env = A0 * Math.exp(-b * tt);
      const X = ox + tt * pxs;
      if (i === 0) ctx.moveTo(X, midY + env * py); else ctx.lineTo(X, midY + env * py);
    }
    ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'A(t) = A₀·e^(−b·t)', ox + 6, 20, C.amber, 11);
    // semnalul înregistrat
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath();
    let first = true;
    for (const [tt, xx] of s.samples) {
      const X = ox + (tt - (s.t - span)) * pxs, Y = midY - Math.max(-1.1, Math.min(1.1, xx)) * py;
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // marcaj τ
    const tau = 1 / b;
    if (tau < span) {
      const X = ox + tau * pxs;
      ctx.strokeStyle = C.pink; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(X, midY - py * Math.exp(-1)); ctx.lineTo(X, h - 12); ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, `τ = ${tau.toFixed(1)} s (A / e)`, X - 40, h - 24, C.pink, 11);
    }
    // bila care oscilează pe o axă de jos
    const bx = ox + span * pxs - 14, by = h - 34;
    const yy2 = midY - Math.max(-1.1, Math.min(1.1, s.x || 0)) * py;
    ctx.strokeStyle = C.green + '66';
    ctx.beginPath(); ctx.moveTo(bx, yy2); ctx.lineTo(bx, by); ctx.stroke();
    ball(ctx, bx, by, 8, C.green);
    if (s.ro) {
      const D = b * T, Nhalf = Math.log(2) / Math.max(D, 1e-9);
      s.ro.textContent = `τ = ${tau.toFixed(1)} s · D = bT′ = ${D.toFixed(2)} · N½ = ${Nhalf.toFixed(1)} osc · regim: ${s.regime || ''}`;
    }
  },
});

/* =============================================================
 * 6) DEMO oscilator mass-spring (1.1.4): F = -k y, T = 2π√(m/k)
 * ============================================================= */
App.register({
  id: 'demo-oscillator',
  reset(s) { s.samples = []; s.lastCross = 0; },
  wire(shell, s) { s.samples = []; s.lastCross = 0; },
  onParam(s, k) { if (k === 'A') s.samples = []; },
  frame(s, dt) {
    const k = +s.sliders.k.value, m = +s.sliders.m.value, A = +s.sliders.A.value;
    const w = Math.sqrt(k / m);
    s.y = A * Math.cos(w * s.t);
    s.w = w;
    if (!s.running) return;
    s.samples.push([s.t, s.y]);
    const span = 6 * 2 * Math.PI / w;
    while (s.samples.length && s.samples[0][0] < s.t - span) s.samples.shift();
    // tic la trecerea prin echilibru
    const cross = Math.floor((w * s.t + Math.PI / 2) / Math.PI);
    if (s.lastCross !== undefined && cross !== s.lastCross && s.running && s.checks.sound && s.checks.sound.checked) Sound.tick(0.2);
    s.lastCross = cross;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const k = +s.sliders.k.value, m = +s.sliders.m.value, A = +s.sliders.A.value;
    const y = s.y || 0;
    const scale = (w * 0.42 - 80) / A;
    const eq = 60 + (w * 0.42) / 2, cy = 78;
    // perete
    ctx.fillStyle = C.axis;
    ctx.fillRect(46, cy - 52, 10, 104);
    for (let yy3 = cy - 50; yy3 < cy + 50; yy3 += 12) { ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(46, yy3); ctx.lineTo(38, yy3 + 8); ctx.stroke(); }
    // resort
    const bx = eq + y * scale;
    spring(ctx, 56, cy, bx - 22, 10, 12);
    // corp
    ctx.fillStyle = C.accent;
    ctx.strokeStyle = '#0b1220';
    ctx.fillRect(bx - 22, cy - 22, 44, 44); ctx.strokeRect(bx - 22, cy - 22, 44, 44);
    label(ctx, 'm', bx - 5, cy + 5, '#052033', 16);
    // sol
    hLine(ctx, 40, w * 0.46, cy + 26, C.axis);
    // axa Ox + poziția de echilibru
    const axY = cy + 60;
    arrow(ctx, 40, axY, w * 0.45, axY, C.muted, 1.4);
    ctx.strokeStyle = C.violet; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(eq, cy + 26); ctx.lineTo(eq, axY + 8); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'O (echilibru)', eq - 30, axY + 20, C.violet, 10);
    ctx.strokeStyle = C.green;
    ctx.beginPath(); ctx.moveTo(bx, cy + 26); ctx.lineTo(bx, axY + 8); ctx.stroke();
    label(ctx, `y = ${y.toFixed(2)} m`, bx + 6, axY + 20, C.green, 11);
    // forța F = -k y
    const F = -k * y, fLen = Math.max(-90, Math.min(90, F * scale * 0.06 * A));
    if (Math.abs(F) > 0.5) {
      arrow(ctx, bx, cy - 36, bx + fLen, cy - 36, C.red, 3.5);
      label(ctx, `F = −k·y (${F.toFixed(1)} N)`, bx + fLen / 2 - 30, cy - 44, C.red, 11);
    }
    // mini grafic y(t) dreapta
    const gx = w * 0.48, gw = w - gx - 12, gy = 30, gh = h - 70;
    ctx.strokeStyle = C.axis; ctx.strokeRect(gx, gy, gw, gh);
    hLine(ctx, gx, gx + gw, gy + gh / 2, C.grid);
    label(ctx, 'y(t)', gx + 6, gy + 14, C.muted, 11);
    const span = s.samples.length ? (s.t - s.samples[0][0]) || 1 : 1;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1.8; ctx.beginPath();
    let first = true;
    for (const [tt, yy4] of s.samples) {
      const X = gx + ((tt - (s.t - span)) / span) * gw, Y = gy + gh / 2 - (yy4 / A) * (gh / 2 - 4);
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    if (s.ro) s.ro.textContent = `ω = √(k/m) = ${s.w.toFixed(2)} rad/s · T = ${(2 * Math.PI / s.w).toFixed(2)} s · ν = ${(s.w / (2 * Math.PI)).toFixed(2)} Hz`;
  },
});

/* =============================================================
 * 7) DEMO fazor (1.1.4): mișcare circulară uniformă → proiecție + sunet
 * ============================================================= */
App.register({
  id: 'demo-phasor',
  wire(shell, s) { s.trace = []; },
  reset(s) { s.trace = []; },
  onParam(s) {
    s.trace = [];
    if (s.checks.sound && s.checks.sound.checked) {
      Sound.setTone('phasor', true, (+s.sliders.w.value) / (2 * Math.PI));
    }
  },
  frame(s, dt) {
    const A = +s.sliders.A.value, w = +s.sliders.w.value, phi = +s.sliders.phi.value;
    s.ph = w * s.t + phi;
    s.y = A * Math.sin(s.ph);
    if (!s.running) return;
    s.trace.push([s.t, s.y]);
    const span = Math.max(4, 6 * 2 * Math.PI / w);
    while (s.trace.length && s.trace[0][0] < s.t - span) s.trace.shift();
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = +s.sliders.A.value, wv = +s.sliders.w.value, phi = +s.sliders.phi.value;
    const R = Math.min(h / 2 - 30, 110), cx = 30 + R, cy = h / 2;
    const sc = R / 2; // A maxim 2 unități
    const ph = s.ph || 0, y = s.y || 0;
    // cercul
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    arrow(ctx, cx, cy, cx + R * 1.15, cy, C.muted, 1); label(ctx, 'Ox', cx + R * 1.15 - 20, cy - 6, C.muted, 11);
    arrow(ctx, cx, cy + R * 1.12, cx, cy - R * 1.12, C.muted, 1); label(ctx, 'Oy', cx + 6, cy - R * 1.05, C.muted, 11);
    const rA = A * sc;
    const px = cx + rA * Math.cos(ph), py2 = cy - rA * Math.sin(ph);
    // rază (fazor)
    arrow(ctx, cx, cy, px, py2, C.pink, 3);
    label(ctx, 'A (fazor)', px + 6, py2 - 8, C.pink, 11);
    ball(ctx, px, py2, 8, C.pink); label(ctx, 'P', px + 10, py2 + 4, C.pink, 12);
    // proiecția Q pe Oy + ghidaj
    ctx.strokeStyle = C.violet; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(px, py2); ctx.lineTo(cx, py2); ctx.stroke(); ctx.setLineDash([]);
    ball(ctx, cx, py2, 7, C.violet); label(ctx, 'Q', cx - 16, py2 + 4, C.violet, 12);
    // unghiul fazei
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, -ph % (2 * Math.PI), ph % (2 * Math.PI) > 0); ctx.stroke();
    label(ctx, `φ(t) = ωt + φ₀ = ${(ph % (2 * Math.PI)).toFixed(2)} rad`, 20, h - 12, C.amber, 11);
    // grafic y(t) în dreapta
    const gx = cx + R + 34, gw = w - gx - 12;
    const span = Math.max(4, 6 * 2 * Math.PI / wv);
    hLine(ctx, gx, gx + gw, cy, C.axis);
    hLine(ctx, gx, gx + gw, cy - A * sc, C.amber, [5, 4]);
    hLine(ctx, gx, gx + gw, cy + A * sc, C.amber, [5, 4]);
    label(ctx, '+A', gx + 2, cy - A * sc - 4, C.amber, 10);
    label(ctx, '−A', gx + 2, cy + A * sc + 12, C.amber, 10);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath();
    let first = true;
    for (const [tt, yy] of s.trace) {
      const X = gx + ((tt - (s.t - span)) / span) * gw, Y = cy - yy * sc;
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // link Q → punct curent grafic
    ctx.strokeStyle = C.violet + '66'; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy - y * sc); ctx.lineTo(gx + gw, cy - y * sc); ctx.stroke(); ctx.setLineDash([]);
    ball(ctx, gx + gw, cy - y * sc, 6, C.green);
    label(ctx, `y(t) = ${A.toFixed(2)}·sin(${wv.toFixed(1)}·t + ${phi.toFixed(2)})`, gx + 4, 18, C.ink, 12);
    if (s.ro) s.ro.textContent = `ν = ω/2π = ${(wv / (2 * Math.PI)).toFixed(2)} Hz · T = ${(2 * Math.PI / wv).toFixed(2)} s`;
  },
});

/* =============================================================
 * 8) DEMO y, v, a (defazaje)
 * ============================================================= */
App.register({
  id: 'demo-yva',
  wire(shell, s) {
    ['y', 'v', 'a'].forEach(k => {
      const el = shell.querySelector(`[data-act="${k}"]`);
      if (el) { s['show' + k] = el.checked; el.addEventListener('change', () => { s['show' + k] = el.checked; }); }
    });
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = 1, w0 = 2, phi = +s.sliders.phi.value;
    const span = 10, ox = 40, pxs = (w - 60) / span;
    const rows = [
      { on: s.showy, f: t => A * Math.sin(w0 * t + phi), color: C.accent, name: `y(t) = A·sin(ωt+φ₀) [m]` },
      { on: s.showv, f: t => A * w0 * Math.cos(w0 * t + phi), color: C.green, name: `v(t) = Aω·cos(ωt+φ₀) [m/s]  (+π/2)` },
      { on: s.showa, f: t => -A * w0 * w0 * Math.sin(w0 * t + phi), color: C.red, name: `a(t) = −Aω²·sin(ωt+φ₀) [m/s²]  (+π)` },
    ];
    const rh = (h - 30) / 3;
    rows.forEach((r, i) => {
      const cy = 15 + rh * i + rh / 2;
      hLine(ctx, ox, ox + span * pxs, cy, C.axis);
      if (r.on) {
        ctx.strokeStyle = r.color; ctx.lineWidth = 2.2; ctx.beginPath();
        for (let j = 0; j <= 500; j++) {
          const tt = s.t - span + j / 500 * span;
          const X = ox + (j / 500) * span * pxs, Y = cy - r.f(tt) / (A * w0 * w0) * (rh / 2 - 6) * 2;
          if (j === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.stroke();
        // punct curent
        const Y0 = cy - r.f(s.t) / (A * w0 * w0) * (rh / 2 - 6) * 2;
        ball(ctx, ox + span * pxs, Y0, 5, r.color);
      }
      label(ctx, r.name, ox + 4, cy - rh / 2 + 12, r.color, 11);
    });
    // linie de timp comună
    ctx.strokeStyle = C.amber; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(ox + span * pxs, 12); ctx.lineTo(ox + span * pxs, h - 12); ctx.stroke(); ctx.setLineDash([]);
    if (s.ro) s.ro.textContent = `A = 1 m · ω = 2 rad/s · φ₀ = ${phi.toFixed(2)} rad · v_max = 2 m/s · a_max = 4 m/s²`;
  },
});

/* =============================================================
 * 9) DEMO pendul gravitațional: armonic vs real (sin θ)
 * ============================================================= */
App.register({
  id: 'demo-simple',
  reset(s) { s.th1 = 0; s.w1 = 0; s.th2 = 0; s.w2 = 0; s.init = false; s.pReal = null; s.cross = 0; },
  wire(shell, s) { s.th1 = 0; s.th2 = 0; s.init = false; s.pReal = null; },
  onParam(s) { s.init = false; s.pReal = null; },
  frame(s, dt) {
    const L = +s.sliders.L.value, A0 = +s.sliders.A.value * Math.PI / 180;
    if (!s.init) { s.th1 = A0; s.w1 = 0; s.th2 = A0; s.w2 = 0; s.init = true; s.t0cross = null; s.pReal = null; }
    const n = 8;
    const hstep = dt / n;
    for (let i = 0; i < n; i++) {
      // armonic: θ̈ = -(g/L) θ
      s.w1 += -(9.81 / L) * s.th1 * hstep; s.th1 += s.w1 * hstep;
      // real: θ̈ = -(g/L) sin θ
      const prev = s.th2;
      s.w2 += -(9.81 / L) * Math.sin(s.th2) * hstep; s.th2 += s.w2 * hstep;
      // măsură perioadă reală: zero-crossing cu w<0 la jumătate de perioadă; folosim întoarcerile (w=0) la fel ca la bip
      if (prev * s.th2 < 0 && s.w2 > 0) {
        if (s.tHalf === undefined) { /* primul crossing ignorat */ }
        else if (s.t - s.tHalf > 0.2) {
          const half = s.t - s.tHalf;
          s.pReal = s.pReal === null ? 2 * half : 0.75 * s.pReal + 0.25 * 2 * half;
        }
        s.tHalf = s.t;
      }
    }
    // bip la final de oscilație (întoarcere la extrema pozitivă)
    if (s.checks.sound && s.checks.sound.checked && s.pReal !== null) {
      const c = Math.floor(s.t / s.pReal);
      if (c !== s.lastBeep && s.running) { s.lastBeep = c; Sound.tick(0.25); }
    }
    s.thReal = s.th2; s.thHarmonic = s.th1;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const L = +s.sliders.L.value, A0 = +s.sliders.A.value * Math.PI / 180;
    const Tmic = 2 * Math.PI * Math.sqrt(L / 9.81);
    const R = (h - 84) * Math.min(1, L / 1.4);
    const ox1 = w * 0.28, ox2 = w * 0.72, oy = 34;
    hLine(ctx, ox1 - R * 0.6, ox1 + R * 0.6, oy, C.axis);
    hLine(ctx, ox2 - R * 0.6, ox2 + R * 0.6, oy, C.axis);
    const drawP = (ox, th, color, name) => {
      const bx = ox + Math.sin(th) * R, by = oy + Math.cos(th) * R;
      ctx.strokeStyle = C.axis; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + R); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.stroke();
      ball(ctx, bx, by, 13, color);
      label(ctx, name, ox, h - 30, color, 12, 'center');
    };
    drawP(ox1, s.thHarmonic || 0, C.accent, 'model armonic: sinθ ≈ θ');
    drawP(ox2, s.thReal || 0, C.amber, 'real: θ̈ = −(g/L)·sinθ');
    // pragul de 6°
    ctx.strokeStyle = C.violet; ctx.lineWidth = 1;
    [ox1, ox2].forEach(ox => {
      const lim = 6 * Math.PI / 180;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.sin(lim) * R, oy + Math.cos(lim) * R);
      ctx.moveTo(ox, oy); ctx.lineTo(ox - Math.sin(lim) * R, oy + Math.cos(lim) * R); ctx.stroke(); ctx.setLineDash([]);
    });
    label(ctx, 'zona „unghiuri mici” (θ < 6°)', ox1, oy + 12, C.violet, 10, 'center');
    const A0deg = (+s.sliders.A.value);
    label(ctx, A0deg <= 6
      ? 'θ₀ ≤ 6°: cele două pendule rămân sincron — modelul armonic e valid'
      : 'θ₀ > 6°: pendulul real se retrage vizibil (perioada crește cu amplitudinea)', 14, 20, A0deg <= 6 ? C.green : C.pink, 12);
    if (s.ro) {
      const p = s.pReal !== null ? s.pReal : Tmic;
      const diff = ((p - Tmic) / Tmic * 100);
      s.ro.textContent = `T (mic) = ${Tmic.toFixed(2)} s · T real ≈ ${p.toFixed(2)} s · eroare ≈ ${diff >= 0.05 ? '+' + diff.toFixed(1) + '%' : '<0,1%'}`;
    }
  },
});

/* =============================================================
 * 10) DEMO energie: Ec ⇄ Ep, groapa de potențial
 * ============================================================= */
App.register({
  id: 'demo-energy',
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const m = 1, k = 20, A = 1, w0 = Math.sqrt(k / m);
    const t = s.t;
    const y = A * Math.cos(w0 * t), v = -A * w0 * Math.sin(w0 * t);
    const Ec = 0.5 * m * v * v, Ep = 0.5 * k * y * y, E = 0.5 * k * A * A;
    // stânga: groapa de energie potențială
    const gx = w * 0.06, gw = w * 0.44, gy = 30, gh = h - 70;
    ctx.strokeStyle = C.axis;
    ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    label(ctx, 'Ep = ½·k·y²  (groapa de potențial)', gx + 4, 18, C.muted, 11);
    const X0 = gx + gw / 2, ymax = 26;
    ctx.strokeStyle = C.violet; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const uu = -1.3 + i / 100 * 2.6;
      const X = X0 + uu * (gw / 3.2);
      const Y = gy + gh - (0.5 * k * (uu * A) ** 2 / E) * (gh - 20);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // bila în groapă
    const bX = X0 + (y / A) * (gw / 3.2), bY = gy + gh - Ep / E * (gh - 20) - 8;
    ball(ctx, bX, bY, 11, C.accent);
    // linia energiei totale
    hLine(ctx, gx, gx + gw, gy + gh - (gh - 20) - 8 + 8 - (gh - 20) + (gh - 20), 'transparent');
    ctx.strokeStyle = C.amber; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5;
    const Ey = gy + gh - 1 * (gh - 20) - 0; // E/E = 1
    ctx.beginPath(); ctx.moveTo(X0 - gw / 3.0, gy + 20); ctx.lineTo(X0 + gw / 3.0, gy + 20); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'E = ½kA² = const', X0 - 40, gy + 14, C.amber, 11);
    // markers ±A
    ctx.strokeStyle = C.axis;
    [-(gw / 3.2), (gw / 3.2)].forEach(dx => { ctx.beginPath(); ctx.moveTo(X0 + dx, gy + gh - 4); ctx.lineTo(X0 + dx, gy + gh + 4); ctx.stroke(); });
    label(ctx, '−A', X0 - gw / 3.2 - 8, gy + gh + 18, C.muted, 10);
    label(ctx, '+A', X0 + gw / 3.2 - 6, gy + gh + 18, C.muted, 10);
    // dreapta: bare Ec / Ep
    const bx = w * 0.6, bw = w * 0.12, bh = h - 80, by = 40;
    ctx.strokeStyle = C.axis; ctx.strokeRect(bx, by, bw, bh);
    const hEp = Ep / E * bh, hEc = Ec / E * bh;
    ctx.fillStyle = C.pink; ctx.fillRect(bx, by + bh - hEp, bw, hEp);
    ctx.fillStyle = C.green; ctx.fillRect(bx + bw + 18, by + bh - hEc, bw, hEc);
    ctx.strokeStyle = C.axis; ctx.strokeRect(bx + bw + 18, by, bw, bh);
    ctx.fillStyle = C.amber; ctx.fillRect(bx + 2 * bw + 44, by, bw / 2.4, bh);
    label(ctx, 'Ep', bx + bw / 2 - 8, by + bh + 18, C.pink, 12);
    label(ctx, 'Ec', bx + bw + 26, by + bh + 18, C.green, 12);
    label(ctx, 'E', bx + 2 * bw + 46, by + bh + 18, C.amber, 12);
    label(ctx, `Ep = ${Ep.toFixed(1)} J  ·  Ec = ${Ec.toFixed(1)} J  ·  E = ${E.toFixed(1)} J`, bx - 60, by - 10, C.ink, 12);
    // oscilator mini jos-dreapta
    const oy2 = by + bh + 44;
    const sx = w * 0.58, sw = w * 0.38;
    hLine(ctx, sx, sx + sw, oy2, C.axis);
    const px2 = sx + sw / 2 + (y / A) * sw / 2.2;
    spring(ctx, sx, oy2, px2 - 14, 8, 7);
    ctx.fillStyle = C.accent; ctx.fillRect(px2 - 14, oy2 - 12, 28, 24);
    if (s.ro) s.ro.textContent = `y = ${y.toFixed(2)} m · Ec = ${Ec.toFixed(1)} J · Ep = ${Ep.toFixed(1)} J · E = ${E.toFixed(0)} J`;
  },
});

/* =============================================================
 * 11) DEMO recapitulare Ex. 1.1.4.2
 * ============================================================= */
App.register({
  id: 'demo-ex42',
  wire(shell, s) {
    s.samples = []; s.playing = false;
    const btn = shell.querySelector('[data-act="strike"]');
    btn.addEventListener('click', () => {
      s.playing = true; s.t = 0; s.samples = []; s.lastTick = -1;
      Sound.ensure();
      btn.textContent = '▶ în curs…';
      setTimeout(() => { btn.textContent = '▶ Redă mișcarea + sunet la fiecare trecere prin echilibru'; }, 4200);
    });
  },
  frame(s, dt) {
    if (!s.playing) return;
    const w0 = 4, A = 0.1; // y = 0,1 cos(4t)
    const y = A * Math.cos(w0 * s.t);
    s.y = y;
    s.samples.push([s.t, y]);
    if (s.t > 4.2) s.playing = false;
    const cross = Math.floor((w0 * s.t + Math.PI / 2) / Math.PI);
    if (cross !== s.lastTick && s.lastTick >= 0) Sound.tick(0.3);
    s.lastTick = cross;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = 0.1, w0 = 4;
    const y = s.playing ? (s.y || 0) : A;
    const cy = 60, eq = w * 0.24, scale = (w * 0.32) / A * 0.55;
    // perete + resort + corp
    ctx.fillStyle = C.axis; ctx.fillRect(34, cy - 46, 10, 92);
    const bx = eq + y * scale;
    spring(ctx, 44, cy, bx - 18, 9, 11);
    ctx.fillStyle = C.accent; ctx.fillRect(bx - 18, cy - 18, 36, 36);
    label(ctx, 'm = 0,5 kg', bx - 18, cy + 34, C.ink, 11);
    hLine(ctx, 30, w * 0.42, cy + 20, C.axis);
    ctx.strokeStyle = C.violet; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(eq, cy - 26); ctx.lineTo(eq, cy + 46); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'echilibru', eq - 24, cy + 46, C.violet, 10);
    ctx.strokeStyle = C.amber;
    ctx.strokeRect(eq + A * scale - 4, cy - 30, 8, 8);
    label(ctx, 'y₀ = 10 cm (punct de întoarcere)', eq + A * scale - 60, cy - 38, C.amber, 11);
    // grafic
    const gx = w * 0.46, gw = w - gx - 14, gy = 24, gh = h - 60;
    ctx.strokeStyle = C.axis; ctx.strokeRect(gx, gy, gw, gh);
    hLine(ctx, gx, gx + gw, gy + gh / 2, C.grid);
    label(ctx, 'y(t) = 0,1·cos(4t) m', gx + 6, gy + 16, C.muted, 11);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath();
    let first = true;
    for (const [tt, yy] of s.samples) {
      const X = gx + (tt / 4.2) * gw, Y = gy + gh / 2 - (yy / A) * (gh / 2 - 8);
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // marcaje v_max
    if (s.ro) s.ro.textContent = s.playing
      ? `t = ${s.t.toFixed(2)} s · y = ${(y * 100).toFixed(1)} cm · ω = 4 rad/s`
      : 'Apasă ▶ — y(t) = 0,1·cos(4t) m, v_max = 0,4 m/s';
  },
});
