/* =========================================================================
   VITEZA ȘI ACCELERAȚIA - Fizică Clasa a IX-a (Motor Interactiv JavaScript)
   Conține:
   1. Navigare între secțiuni și filtrare teorie
   2. Utilitare desenare vectori cu săgeți, grile și grafice pe Canvas 2D
   3. Laborator 1: Mișcarea Rectilinie (medie vs instantanee + grafice)
   4. Laborator 2: Mișcarea Curbilinie Plană (vectori în plan + hodograf Δv)
   5. Laborator 3: Legi Polinomiale de Mișcare x(t) -> v(t) -> a(t)
   ========================================================================= */

// ----------------- 1. NAVIGARE TABURI & FILTRARE TEORIE -----------------
function switchMainTab(tabName) {
  const tabs = ['teorie', 'rectiliniu', 'curbiliniu', 'polinom'];
  tabs.forEach(t => {
    const sec = document.getElementById('tab-' + t);
    const btn = document.getElementById('btn-tab-' + t);
    if (sec) sec.classList.toggle('active', t === tabName);
    if (btn) btn.classList.toggle('active', t === tabName);
  });

  // Pause inactive labs and redraw active canvas
  if (tabName !== 'rectiliniu' && rectLab) rectLab.pause();
  if (tabName !== 'curbiliniu' && curvLab) curvLab.pause();
  if (tabName !== 'polinom' && polyLab) polyLab.pause();

  if (tabName === 'rectiliniu' && rectLab) rectLab.draw();
  if (tabName === 'curbiliniu' && curvLab) curvLab.draw();
  if (tabName === 'polinom' && polyLab) polyLab.draw();
}

function filterTheory(category, btnEl) {
  const pills = document.querySelectorAll('.subnav-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const cards = document.querySelectorAll('.theory-card');
  cards.forEach(c => {
    if (category === 'all' || c.getAttribute('data-category') === category) {
      c.style.display = '';
    } else {
      c.style.display = 'none';
    }
  });
}

// ----------------- 2. UTILITARE DESENARE CANVAS & VECTORI -----------------
function drawArrow(ctx, x1, y1, x2, y2, color, width = 2.5, label = '', dashed = false) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([6, 4]);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowhead
  ctx.setLineDash([]);
  const angle = Math.atan2(dy, dx);
  const headLen = Math.min(11, Math.max(7, len * 0.28));
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    const offsetX = 10 * Math.cos(angle - Math.PI / 2);
    const offsetY = 10 * Math.sin(angle - Math.PI / 2);
    const lx = x2 + 6 * Math.cos(angle) + offsetX * 0.6;
    const ly = y2 + 6 * Math.sin(angle) + offsetY * 0.6;
    ctx.fillStyle = color;
    window.PraxisVelocityLabels.label(ctx,label, lx, ly, {anchor:[x2,y2]});
  }
  ctx.restore();
}

function drawGrid(ctx, x, y, w, h, step = 30) {
  ctx.save();
  ctx.strokeStyle = 'rgba(109, 132, 120, 0.16)';
  ctx.lineWidth = 1;
  for (let gx = x; gx <= x + w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }
  ctx.restore();
}

function fmtSigned(val, decimals = 2) {
  const n = Number(val);
  if (Math.abs(n) < 1e-6) return '0';
  const s = Math.abs(n).toFixed(decimals).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return (n >= 0 ? '+ ' : '− ') + s;
}

// =========================================================================
// 3. LABORATOR 1: MIȘCAREA RECTILINIE (Medie vs. Instantanee pe axa Ox)
// =========================================================================
const rectLab = {
  x0: -15,
  v0: 14,
  a: -3.5,
  t: 0,
  tMax: 10,
  t1: 1.0,
  t2: 6.0,
  running: false,
  lastFrame: 0,
  frame: null,

  init() {
    this.updateParams();
  },

  pos(t) {
    return this.x0 + this.v0 * t + 0.5 * this.a * t * t;
  },

  vel(t) {
    return this.v0 + this.a * t;
  },

  acc() {
    return this.a;
  },

  setPreset(x0, v0, a, t1, t2) {
    this.pause();
    document.getElementById('rect-slider-x0').value = x0;
    document.getElementById('rect-slider-v0').value = v0;
    document.getElementById('rect-slider-a').value = a;
    document.getElementById('rect-slider-t1').value = t1;
    document.getElementById('rect-slider-t2').value = t2;
    this.t = 0;
    document.getElementById('rect-slider-t').value = 0;
    this.updateParams();
  },

  updateParams() {
    this.x0 = parseFloat(document.getElementById('rect-slider-x0').value);
    this.v0 = parseFloat(document.getElementById('rect-slider-v0').value);
    this.a = parseFloat(document.getElementById('rect-slider-a').value);
    let t1 = parseFloat(document.getElementById('rect-slider-t1').value);
    let t2 = parseFloat(document.getElementById('rect-slider-t2').value);
    if (t2 <= t1 + 0.4) {
      t2 = Math.min(10, t1 + 0.5);
      document.getElementById('rect-slider-t2').value = t2;
    }
    this.t1 = t1;
    this.t2 = t2;

    document.getElementById('rect-val-x0').textContent = this.x0.toFixed(1) + ' m';
    document.getElementById('rect-val-v0').textContent = this.v0.toFixed(1) + ' m/s';
    document.getElementById('rect-val-a').textContent = this.a.toFixed(1) + ' m/s²';
    document.getElementById('rect-val-t1').textContent = this.t1.toFixed(1) + ' s';
    document.getElementById('rect-val-t2').textContent = this.t2.toFixed(1) + ' s';

    const halfA = 0.5 * this.a;
    document.getElementById('rect-law-display').textContent =
      `x(t) = ${this.x0.toFixed(1)} ${fmtSigned(this.v0, 1)}·t ${fmtSigned(halfA, 2)}·t² [m]`;

    this.updateTelemetry();
    this.draw();
  },

  scrubTime(val) {
    this.t = parseFloat(val);
    this.updateTelemetry();
    this.draw();
  },

  play() {
    if (this.t >= this.tMax) this.t = 0;
    if (!this.running) {
      this.running = true;
      this.lastFrame = performance.now();
      this.frame = requestAnimationFrame(ts => this.loop(ts));
    }
  },

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
  },

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
    this.t = 0;
    document.getElementById('rect-slider-t').value = 0;
    this.updateTelemetry();
    this.draw();
  },

  reset() {
    this.setPreset(-15, 14, -3.5, 1.0, 6.0);
  },

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.1, Math.max(0, (ts - this.lastFrame) / 1000));
    this.lastFrame = ts;
    this.t += dt;
    if (this.t >= this.tMax) {
      this.t = this.tMax;
      this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
    }
    document.getElementById('rect-slider-t').value = this.t;
    this.updateTelemetry();
    this.draw();
    if (this.running) this.frame = requestAnimationFrame(nextTs => this.loop(nextTs));
  },

  updateTelemetry() {
    const x = this.pos(this.t);
    const v = this.vel(this.t);
    const a = this.acc();

    const x1 = this.pos(this.t1);
    const x2 = this.pos(this.t2);
    const dx = x2 - x1;
    const dt = this.t2 - this.t1;
    const vm = dx / dt;
    const am = (this.vel(this.t2) - this.vel(this.t1)) / dt;

    document.getElementById('rect-val-t').textContent = this.t.toFixed(2) + ' s';
    document.getElementById('rect-out-t').textContent = this.t.toFixed(2) + ' s';
    document.getElementById('rect-out-x').textContent = x.toFixed(2) + ' m';
    document.getElementById('rect-out-v').textContent = v.toFixed(2) + ' m/s';
    document.getElementById('rect-out-a').textContent = a.toFixed(2) + ' m/s²';
    document.getElementById('rect-out-dx').textContent = dx.toFixed(2) + ' m';
    document.getElementById('rect-out-vm').textContent = vm.toFixed(2) + ' m/s';
    document.getElementById('rect-out-am').textContent = am.toFixed(2) + ' m/s²';

    let regime = 'Mișcare Rectilinie Uniformă (v = const.)';
    if (Math.abs(a) < 1e-4 && Math.abs(v) < 1e-4) {
      regime = 'Repaus (v = 0, a = 0)';
    } else if (Math.abs(a) > 1e-4) {
      if (v * a > 0.05) regime = 'Mișcare Accelerată (v și a au același sens: v·a > 0)';
      else if (v * a < -0.05) regime = 'Mișcare Încetinită / Frânată (v și a au sensuri opuse: v·a < 0)';
      else regime = 'Moment de Oprire Instantanee / Întoarcere (v = 0)';
    }
    document.getElementById('rect-regime-label').textContent = 'Regim la momentul t: ' + regime;
  },

  draw() {
    const canvas = document.getElementById('rect-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const {width: W, height: H} = window.PraxisVelocityCanvas.prepare(canvas);

    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, 0, 0, W, H, 30);

    // --- TOP ZONE: 1D AXIS TRACK (y = 0..175) ---
    const trackY = 95;
    const padX = 55;
    const trackW = W - 2 * padX;

    // Determine dynamic spatial scale
    let minX = -50, maxX = 50;
    for (let tau = 0; tau <= this.tMax; tau += 0.25) {
      const px = this.pos(tau);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
    }
    const span = Math.max(60, (maxX - minX) * 1.2);
    const centerVal = (maxX + minX) / 2;
    minX = centerVal - span / 2;
    maxX = centerVal + span / 2;

    const toScreenX = val => padX + ((val - minX) / (maxX - minX)) * trackW;

    // Track Panel Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 12, W - 32, 165);
    ctx.strokeStyle = '#d5e2d9';
    ctx.strokeRect(16, 12, W - 32, 165);

    ctx.fillStyle = '#216e61';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    window.PraxisVelocityLabels.label(ctx,'AXA MIȘCĂRII RECTILINII Ox (Poziția M, Vectorii Instantanei v(t), a(t) și Mărimile Medii pe [t₁, t₂])', 28, 32);

    // Draw Ox Axis
    drawArrow(ctx, padX - 15, trackY, W - padX + 20, trackY, '#536e64', 2, 'Ox (m)');

    // Ticks on Ox
    const tickStep = span > 160 ? 25 : (span > 80 ? 10 : 5);
    const firstTick = Math.ceil(minX / tickStep) * tickStep;
    ctx.fillStyle = '#536e64';
    ctx.font = '11px monospace';
    for (let xv = firstTick; xv <= maxX; xv += tickStep) {
      const sx = toScreenX(xv);
      ctx.beginPath();
      ctx.moveTo(sx, trackY - 5);
      ctx.lineTo(sx, trackY + 5);
      ctx.strokeStyle = xv === 0 ? '#243c40' : '#8ca69a';
      ctx.lineWidth = xv === 0 ? 2 : 1;
      ctx.stroke();
      window.PraxisVelocityLabels.label(ctx,xv.toString(), sx - 8, trackY + 18);
    }

    // Positions at t1, t2 and current t
    const x1 = this.pos(this.t1);
    const x2 = this.pos(this.t2);
    const sx1 = toScreenX(x1);
    const sx2 = toScreenX(x2);

    // Markers for M1(t1) and M2(t2)
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(sx1, trackY, 5, 0, Math.PI * 2);
    ctx.fill();
    window.PraxisVelocityLabels.label(ctx,`x(t₁=${this.t1}s)`, sx1 - 24, trackY + 33);

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(sx2, trackY, 5, 0, Math.PI * 2);
    ctx.fill();
    window.PraxisVelocityLabels.label(ctx,`x(t₂=${this.t2}s)`, sx2 - 24, trackY + 46);

    const showV = document.getElementById('rect-chk-v').checked;
    const showA = document.getElementById('rect-chk-a').checked;
    const showVm = document.getElementById('rect-chk-vm').checked;
    const showDr = document.getElementById('rect-chk-dr').checked;

    // Displacement vector Δx between t1 and t2
    if (showDr && Math.abs(sx2 - sx1) > 3) {
      drawArrow(ctx, sx1, trackY + 56, sx2, trackY + 56, '#a855f7', 2.5, `Δx = ${(x2 - x1).toFixed(1)} m`, true);
    }

    // Average velocity vector vm
    const vm = (x2 - x1) / (this.t2 - this.t1);
    const velScale = 4.2;
    if (showVm && Math.abs(vm) > 0.1) {
      const midX = (sx1 + sx2) / 2;
      drawArrow(ctx, midX, trackY - 46, midX + vm * velScale, trackY - 46, '#06b6d4', 2.5, `vₘ = ${vm.toFixed(1)} m/s`);
    }

    // Current particle M(t)
    const curX = this.pos(this.t);
    const curV = this.vel(this.t);
    const curA = this.acc();
    const scX = toScreenX(curX);

    // Particle body (car / sphere)
    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(scX, trackY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(scX, trackY, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Instantaneous velocity vector v(t)
    if (showV && Math.abs(curV) > 0.05) {
      drawArrow(ctx, scX, trackY - 18, scX + curV * velScale, trackY - 18, '#43876f', 3, `v = ${curV.toFixed(1)} m/s`);
    }

    // Instantaneous acceleration vector a(t)
    if (showA && Math.abs(curA) > 0.05) {
      drawArrow(ctx, scX, trackY + 20, scX + curA * 9.0, trackY + 20, '#ef4444', 3, `a = ${curA.toFixed(1)} m/s²`);
    }

    // --- BOTTOM ZONE: 2 SYNCHRONIZED GRAPHS: x(t) with secant vs tangent, and v(t) with slope ---
    const gTop = 195;
    const gH = 285;
    const gW = (W - 52) / 2;

    this.drawPositionGraph(ctx, 16, gTop, gW, gH, minX, maxX);
    this.drawVelocityGraph(ctx, 32 + gW, gTop, gW, gH);
  },

  drawPositionGraph(ctx, gx, gy, gw, gh, minX, maxX) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#d5e2d9';
    ctx.strokeRect(gx, gy, gw, gh);

    ctx.fillStyle = '#83689e';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    window.PraxisVelocityLabels.label(ctx,'Graficul Poziției x(t): Coarda (vₘ) vs. Tangenta (v inst.)', gx + 12, gy + 20);

    const padL = 44, padR = 18, padT = 34, padB = 28;
    const pw = gw - padL - padR;
    const ph = gh - padT - padB;
    const ox = gx + padL;
    const oy = gy + padT;

    const toPxT = t => ox + (t / this.tMax) * pw;
    const toPxX = x => oy + ph - ((x - minX) / (maxX - minX)) * ph;

    // Zero line
    const zeroY = toPxX(0);
    if (zeroY >= oy && zeroY <= oy + ph) {
      ctx.strokeStyle = '#b8cbc0';
      ctx.beginPath();
      ctx.moveTo(ox, zeroY);
      ctx.lineTo(ox + pw, zeroY);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#8ca69a';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy + ph);
    ctx.lineTo(ox + pw, oy + ph);
    ctx.stroke();

    // Curve x(t)
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let tau = 0; tau <= this.tMax; tau += 0.05) {
      const px = toPxT(tau);
      const py = toPxX(this.pos(tau));
      if (tau === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Secant line between (t1, x1) and (t2, x2) -> slope = vm
    const p1x = toPxT(this.t1), p1y = toPxX(this.pos(this.t1));
    const p2x = toPxT(this.t2), p2y = toPxX(this.pos(this.t2));
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath(); ctx.arc(p1x, p1y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p2x, p2y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '11px sans-serif';
    window.PraxisVelocityLabels.label(ctx,'Coarda (panta = vₘ)', (p1x + p2x) / 2 - 40, (p1y + p2y) / 2 - 8);

    // Current point & tangent line (slope = v(t))
    const curPx = toPxT(this.t);
    const curPy = toPxX(this.pos(this.t));
    const dtTan = 1.2;
    const tanT1 = Math.max(0, this.t - dtTan);
    const tanT2 = Math.min(this.tMax, this.t + dtTan);
    const tanX1 = this.pos(this.t) + this.vel(this.t) * (tanT1 - this.t);
    const tanX2 = this.pos(this.t) + this.vel(this.t) * (tanT2 - this.t);

    ctx.strokeStyle = '#43876f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toPxT(tanT1), toPxX(tanX1));
    ctx.lineTo(toPxT(tanT2), toPxX(tanX2));
    ctx.stroke();

    ctx.fillStyle = '#43876f';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    window.PraxisVelocityLabels.label(ctx,'Tangenta (panta = v)', curPx + 8, curPy - 8, {anchor:[curPx,curPy]});

    ctx.fillStyle = '#536e64';
    ctx.font = '11px monospace';
    window.PraxisVelocityLabels.label(ctx,'0s', ox, oy + ph + 16);
    window.PraxisVelocityLabels.label(ctx,this.tMax + 's', ox + pw - 20, oy + ph + 16);
    ctx.restore();
  },

  drawVelocityGraph(ctx, gx, gy, gw, gh) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#d5e2d9';
    ctx.strokeRect(gx, gy, gw, gh);

    ctx.fillStyle = '#43876f';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    window.PraxisVelocityLabels.label(ctx,'Graficul Vitezei v(t) și Viteza Medie vₘ pe [t₁, t₂]', gx + 12, gy + 20);

    const padL = 44, padR = 18, padT = 34, padB = 28;
    const pw = gw - padL - padR;
    const ph = gh - padT - padB;
    const ox = gx + padL;
    const oy = gy + padT;

    let minV = -25, maxV = 25;
    for (let tau = 0; tau <= this.tMax; tau += 0.5) {
      const vv = this.vel(tau);
      if (vv < minV) minV = vv - 5;
      if (vv > maxV) maxV = vv + 5;
    }

    const toPxT = t => ox + (t / this.tMax) * pw;
    const toPxV = v => oy + ph - ((v - minV) / (maxV - minV)) * ph;

    // Zero line v = 0
    const zeroY = toPxV(0);
    ctx.strokeStyle = '#b8cbc0';
    ctx.beginPath();
    ctx.moveTo(ox, zeroY);
    ctx.lineTo(ox + pw, zeroY);
    ctx.stroke();

    // Axes
    ctx.strokeStyle = '#8ca69a';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy + ph);
    ctx.lineTo(ox + pw, oy + ph);
    ctx.stroke();

    // Average velocity horizontal bar on [t1, t2]
    const vm = (this.pos(this.t2) - this.pos(this.t1)) / (this.t2 - this.t1);
    const vmY = toPxV(vm);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(toPxT(this.t1), vmY);
    ctx.lineTo(toPxT(this.t2), vmY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#06b6d4';
    ctx.font = '11px sans-serif';
    window.PraxisVelocityLabels.label(ctx,`vₘ = ${vm.toFixed(1)} m/s`, toPxT((this.t1 + this.t2) / 2) - 30, vmY - 6);

    // Line v(t)
    ctx.strokeStyle = '#43876f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toPxT(0), toPxV(this.vel(0)));
    ctx.lineTo(toPxT(this.tMax), toPxV(this.vel(this.tMax)));
    ctx.stroke();

    // Current point (t, v(t))
    const curPx = toPxT(this.t);
    const curPy = toPxV(this.vel(this.t));
    ctx.fillStyle = '#43876f';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    window.PraxisVelocityLabels.label(ctx,`v(${this.t.toFixed(1)}s) = ${this.vel(this.t).toFixed(1)} m/s`, Math.min(ox + pw - 115, curPx + 8), curPy - 8);

    ctx.fillStyle = '#536e64';
    ctx.font = '11px monospace';
    window.PraxisVelocityLabels.label(ctx,'v=0', ox - 28, zeroY + 4);
    window.PraxisVelocityLabels.label(ctx,'0s', ox, oy + ph + 16);
    window.PraxisVelocityLabels.label(ctx,this.tMax + 's', ox + pw - 20, oy + ph + 16);
    ctx.restore();
  }
};

// =========================================================================
// 4. LABORATOR 2: MIȘCAREA CURBILINIE PLANĂ (2D Vectori în Plan)
// =========================================================================
const curvLab = {
  mode: 'circular_uniform',
  p1: 140,   // R or v0
  p2: 1.0,   // omega0 or launch angle
  p3: 0.0,   // alpha or gravity
  t: 0,
  tMax: 10,
  t1: 1.0,
  dt: 1.5,
  running: false,
  lastFrame: 0,
  frame: null,

  init() {
    this.changeMode('circular_uniform');
  },

  changeMode(newMode) {
    this.pause();
    this.mode = newMode;
    this.t = 0;
    document.getElementById('curv-slider-t').value = 0;

    const s1 = document.getElementById('curv-slider-p1');
    const s2 = document.getElementById('curv-slider-p2');
    const s3 = document.getElementById('curv-slider-p3');
    const l1 = document.getElementById('curv-lbl-p1');
    const l2 = document.getElementById('curv-lbl-p2');
    const l3 = document.getElementById('curv-lbl-p3');

    if (newMode === 'circular_uniform') {
      l1.innerHTML = 'Raza cercului R:';
      s1.min = 60; s1.max = 190; s1.step = 5; s1.value = 145;
      l2.innerHTML = 'Viteza unghiulară &omega;:';
      s2.min = 0.4; s2.max = 2.5; s2.step = 0.05; s2.value = 1.1;
      l3.innerHTML = 'Accelerația unghiulară &epsilon; (blocat 0):';
      s3.min = 0; s3.max = 0; s3.step = 0.05; s3.value = 0;
    } else if (newMode === 'circular_variat') {
      l1.innerHTML = 'Raza cercului R:';
      s1.min = 60; s1.max = 190; s1.step = 5; s1.value = 145;
      l2.innerHTML = 'Viteza unghiulară inițială &omega;<sub>0</sub>:';
      s2.min = 0.2; s2.max = 2.0; s2.step = 0.05; s2.value = 0.6;
      l3.innerHTML = 'Accelerația unghiulară &epsilon;:';
      s3.min = -0.3; s3.max = 0.5; s3.step = 0.05; s3.value = 0.25;
    } else if (newMode === 'projectile') {
      l1.innerHTML = 'Viteza inițială de lansare v<sub>0</sub>:';
      s1.min = 40; s1.max = 110; s1.step = 2; s1.value = 82;
      l2.innerHTML = 'Unghiul de lansare &alpha; (grade):';
      s2.min = 25; s2.max = 75; s2.step = 1; s2.value = 55;
      l3.innerHTML = 'Accelerația gravitațională g:';
      s3.min = 10; s3.max = 35; s3.step = 1; s3.value = 20;
    } else if (newMode === 'elliptic') {
      l1.innerHTML = 'Semiaxa orizontală A<sub>x</sub>:';
      s1.min = 80; s1.max = 220; s1.step = 5; s1.value = 180;
      l2.innerHTML = 'Semiaxa verticală A<sub>y</sub>:';
      s2.min = 60; s2.max = 170; s2.step = 5; s2.value = 115;
      l3.innerHTML = 'Pulsația &omega;:';
      s3.min = 0.5; s3.max = 2.0; s3.step = 0.05; s3.value = 1.0;
    }
    this.updateParams();
  },

  // Returns {x, y, vx, vy, ax, ay, at, an, Rcurv} in math coordinates (y up)
  stateAt(t) {
    if (this.mode === 'circular_uniform' || this.mode === 'circular_variat') {
      const R = this.p1;
      const w0 = this.p2;
      const eps = this.mode === 'circular_uniform' ? 0 : this.p3;
      const theta = w0 * t + 0.5 * eps * t * t;
      const w = w0 + eps * t;
      const x = R * Math.cos(theta);
      const y = R * Math.sin(theta);
      const vx = -R * w * Math.sin(theta);
      const vy = R * w * Math.cos(theta);
      const ax = -R * w * w * Math.cos(theta) - R * eps * Math.sin(theta);
      const ay = -R * w * w * Math.sin(theta) + R * eps * Math.cos(theta);
      return this.decomposeFrenet(x, y, vx, vy, ax, ay);
    } else if (this.mode === 'projectile') {
      const v0 = this.p1;
      const ang = (this.p2 * Math.PI) / 180;
      const g = this.p3;
      const x = -220 + v0 * Math.cos(ang) * t;
      const y = -140 + v0 * Math.sin(ang) * t - 0.5 * g * t * t;
      const vx = v0 * Math.cos(ang);
      const vy = v0 * Math.sin(ang) - g * t;
      const ax = 0;
      const ay = -g;
      return this.decomposeFrenet(x, y, vx, vy, ax, ay);
    } else {
      // Elliptic
      const Ax = this.p1;
      const Ay = this.p2;
      const w = this.p3;
      const x = Ax * Math.cos(w * t);
      const y = Ay * Math.sin(w * t);
      const vx = -Ax * w * Math.sin(w * t);
      const vy = Ay * w * Math.cos(w * t);
      const ax = -Ax * w * w * Math.cos(w * t);
      const ay = -Ay * w * w * Math.sin(w * t);
      return this.decomposeFrenet(x, y, vx, vy, ax, ay);
    }
  },

  decomposeFrenet(x, y, vx, vy, ax, ay) {
    const vMag = Math.hypot(vx, vy);
    const aMag = Math.hypot(ax, ay);
    let ux = 1, uy = 0;
    if (vMag > 1e-5) {
      ux = vx / vMag;
      uy = vy / vMag;
    }
    // Tangential scalar component: at = (v . a) / |v|
    const atScalar = ux * ax + uy * ay;
    const atx = atScalar * ux;
    const aty = atScalar * uy;
    // Normal component vector: an_vec = a_vec - at_vec
    const anx = ax - atx;
    const any = ay - aty;
    const anScalar = Math.hypot(anx, any);
    return { x, y, vx, vy, ax, ay, vMag, aMag, atScalar, atx, aty, anScalar, anx, any };
  },

  updateParams() {
    this.p1 = parseFloat(document.getElementById('curv-slider-p1').value);
    this.p2 = parseFloat(document.getElementById('curv-slider-p2').value);
    this.p3 = parseFloat(document.getElementById('curv-slider-p3').value);
    this.t1 = parseFloat(document.getElementById('curv-slider-t1').value);
    this.dt = parseFloat(document.getElementById('curv-slider-dt').value);

    if (this.mode === 'circular_uniform' || this.mode === 'circular_variat') {
      document.getElementById('curv-val-p1').textContent = this.p1.toFixed(0) + ' m';
      document.getElementById('curv-val-p2').textContent = this.p2.toFixed(2) + ' rad/s';
      document.getElementById('curv-val-p3').textContent = this.p3.toFixed(2) + ' rad/s²';
    } else if (this.mode === 'projectile') {
      document.getElementById('curv-val-p1').textContent = this.p1.toFixed(0) + ' m/s';
      document.getElementById('curv-val-p2').textContent = this.p2.toFixed(0) + '°';
      document.getElementById('curv-val-p3').textContent = this.p3.toFixed(0) + ' m/s²';
    } else {
      document.getElementById('curv-val-p1').textContent = this.p1.toFixed(0) + ' m';
      document.getElementById('curv-val-p2').textContent = this.p2.toFixed(0) + ' m';
      document.getElementById('curv-val-p3').textContent = this.p3.toFixed(2) + ' rad/s';
    }

    document.getElementById('curv-val-t1').textContent = this.t1.toFixed(2) + ' s';
    document.getElementById('curv-val-dt').textContent = this.dt.toFixed(2) + ' s';

    this.updateTelemetry();
    this.draw();
  },

  scrubTime(val) {
    this.t = parseFloat(val);
    this.updateTelemetry();
    this.draw();
  },

  play() {
    if (this.t >= this.tMax) this.t = 0;
    if (!this.running) {
      this.running = true;
      this.lastFrame = performance.now();
      this.frame = requestAnimationFrame(ts => this.loop(ts));
    }
  },

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
  },

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
    this.t = 0;
    document.getElementById('curv-slider-t').value = 0;
    this.updateTelemetry();
    this.draw();
  },

  reset() {
    this.changeMode(this.mode);
  },

  loop(ts) {
    if (!this.running) return;
    const elapsed = Math.min(0.1, Math.max(0, (ts - this.lastFrame) / 1000));
    this.lastFrame = ts;
    this.t += elapsed;
    if (this.t >= this.tMax) {
      this.t = 0; // Continuous loop for curvilinear lab
    }
    document.getElementById('curv-slider-t').value = this.t;
    this.updateTelemetry();
    this.draw();
    if (this.running) this.frame = requestAnimationFrame(nextTs => this.loop(nextTs));
  },

  updateTelemetry() {
    const s = this.stateAt(this.t);
    const s1 = this.stateAt(this.t1);
    const s2 = this.stateAt(this.t1 + this.dt);

    const dx = s2.x - s1.x;
    const dy = s2.y - s1.y;
    const vmMag = Math.hypot(dx, dy) / this.dt;

    const dvx = s2.vx - s1.vx;
    const dvy = s2.vy - s1.vy;
    const amMag = Math.hypot(dvx, dvy) / this.dt;

    document.getElementById('curv-val-t').textContent = this.t.toFixed(2) + ' s';
    document.getElementById('curv-out-pos').textContent = `(${s.x.toFixed(0)}, ${s.y.toFixed(0)}) m`;
    document.getElementById('curv-out-v').textContent = s.vMag.toFixed(1) + ' m/s';
    document.getElementById('curv-out-a').textContent = s.aMag.toFixed(1) + ' m/s²';
    document.getElementById('curv-out-at').textContent = s.atScalar.toFixed(1) + ' m/s²';
    document.getElementById('curv-out-an').textContent = s.anScalar.toFixed(1) + ' m/s²';
    document.getElementById('curv-out-vm').textContent = vmMag.toFixed(1) + ' m/s';
    document.getElementById('curv-out-am').textContent = amMag.toFixed(1) + ' m/s²';
  },

  draw() {
    const canvas = document.getElementById('curv-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const {width: W, height: H} = window.PraxisVelocityCanvas.prepare(canvas);

    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, 0, 0, W, H, 30);

    // Coordinate origin O on screen
    const ox = this.mode === 'projectile' ? 320 : 340;
    const oy = H / 2 + 10;
    const toSx = x => ox + x;
    const toSy = y => oy - y;

    // Draw Cartesian axes Ox, Oy
    drawArrow(ctx, 30, oy, 640, oy, '#536e64', 1.5, 'x');
    drawArrow(ctx, ox, H - 20, ox, 25, '#536e64', 1.5, 'y');
    ctx.fillStyle = '#536e64';
    ctx.font = 'bold 12px sans-serif';
    window.PraxisVelocityLabels.label(ctx,'O(0,0)', ox + 6, oy + 16);

    // 1. Draw full trajectory curve
    ctx.save();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.38)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (let tau = 0; tau <= this.tMax; tau += 0.04) {
      const pt = this.stateAt(tau);
      const sx = toSx(pt.x);
      const sy = toSy(pt.y);
      if (tau === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();

    const showR = document.getElementById('curv-chk-r').checked;
    const showV = document.getElementById('curv-chk-v').checked;
    const showA = document.getElementById('curv-chk-a').checked;
    const showAtAn = document.getElementById('curv-chk-atan').checked;
    const showAvg = document.getElementById('curv-chk-avg').checked;
    const showHodo = document.getElementById('curv-chk-hodograph').checked;

    // 2. Average vectors on interval [t1, t1 + dt]
    const s1 = this.stateAt(this.t1);
    const s2 = this.stateAt(this.t1 + this.dt);
    const sx1 = toSx(s1.x), sy1 = toSy(s1.y);
    const sx2 = toSx(s2.x), sy2 = toSy(s2.y);

    if (showAvg) {
      // Position vectors r1 and r2 (faint)
      drawArrow(ctx, ox, oy, sx1, sy1, 'rgba(168, 85, 247, 0.45)', 1.5, 'r₁', true);
      drawArrow(ctx, ox, oy, sx2, sy2, 'rgba(168, 85, 247, 0.45)', 1.5, 'r₂', true);

      // Chord Δr = r2 - r1
      drawArrow(ctx, sx1, sy1, sx2, sy2, '#a855f7', 2.8, 'Δr');

      // Average velocity vm along chord M1M2
      const vScale = 0.55;
      const vmx = (s2.x - s1.x) / this.dt;
      const vmy = (s2.y - s1.y) / this.dt;
      drawArrow(ctx, sx1, sy1, sx1 + vmx * vScale, sy1 - vmy * vScale, '#06b6d4', 3.0, 'vₘ', true);

      // Points M1, M2
      ctx.fillStyle = '#243c40';
      ctx.beginPath(); ctx.arc(sx1, sy1, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx2, sy2, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 12px sans-serif';
      window.PraxisVelocityLabels.label(ctx,`M₁(t₁=${this.t1.toFixed(1)}s)`, sx1 - 30, sy1 - 10, {anchor:[sx1,sy1]});
      window.PraxisVelocityLabels.label(ctx,`M₂(t₂=${(this.t1 + this.dt).toFixed(1)}s)`, sx2 + 8, sy2 + 14, {anchor:[sx2,sy2]});
    }

    // 3. Current state at moment t
    const cur = this.stateAt(this.t);
    const mx = toSx(cur.x);
    const my = toSy(cur.y);

    // Position vector r(t)
    if (showR) {
      drawArrow(ctx, ox, oy, mx, my, '#a855f7', 2.2, 'r(t)');
    }

    const vScale = 0.55;
    const aScale = this.mode === 'projectile' ? 3.2 : 0.42;

    // Acceleration components at and an + parallelogram
    if (showAtAn) {
      const atEndX = mx + cur.atx * aScale;
      const atEndY = my - cur.aty * aScale;
      const anEndX = mx + cur.anx * aScale;
      const anEndY = my - cur.any * aScale;
      const aEndX = mx + cur.ax * aScale;
      const aEndY = my - cur.ay * aScale;

      // Dashed parallelogram lines
      ctx.save();
      ctx.strokeStyle = '#b8cbc0';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(atEndX, atEndY);
      ctx.lineTo(aEndX, aEndY);
      ctx.lineTo(anEndX, anEndY);
      ctx.stroke();
      ctx.restore();

      if (Math.abs(cur.atScalar) > 0.5) {
        drawArrow(ctx, mx, my, atEndX, atEndY, '#b28b3b', 2.6, 'aₜ');
      }
      if (cur.anScalar > 0.5) {
        drawArrow(ctx, mx, my, anEndX, anEndY, '#a3497e', 2.6, 'aₙ');
      }
    }

    // Total acceleration vector a(t)
    if (showA) {
      drawArrow(ctx, mx, my, mx + cur.ax * aScale, my - cur.ay * aScale, '#ef4444', 3.2, 'a');
    }

    // Instantaneous velocity vector v(t) (tangent to curve)
    if (showV) {
      drawArrow(ctx, mx, my, mx + cur.vx * vScale, my - cur.vy * vScale, '#43876f', 3.2, 'v(t)');
    }

    // Draw moving particle M(t)
    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Right Inset Box: Velocity Triangle (Hodograph) Δv = v2 - v1 and am = Δv / Δt
    if (showHodo) {
      const boxW = 245, boxH = 225;
      const bx = W - boxW - 16, by = 16;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = '#216e61';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      window.PraxisVelocityLabels.label(ctx,'Triunghiul Vitezelor pe [t₁, t₂]', bx + 12, by + 20);
      ctx.fillStyle = '#536e64';
      ctx.font = '11px sans-serif';
      window.PraxisVelocityLabels.label(ctx,'Δv = v(t₂) − v(t₁)  și  aₘ = Δv / Δt', bx + 12, by + 36);

      const hox = bx + boxW / 2;
      const hoy = by + boxH / 2 + 15;
      const maxVel = Math.max(1, Math.hypot(s1.vx, s1.vy), Math.hypot(s2.vx, s2.vy));
      const hScale = 70 / maxVel;

      const v1EndX = hox + s1.vx * hScale;
      const v1EndY = hoy - s1.vy * hScale;
      const v2EndX = hox + s2.vx * hScale;
      const v2EndY = hoy - s2.vy * hScale;

      drawArrow(ctx, hox, hoy, v1EndX, v1EndY, '#43876f', 2.4, 'v₁');
      drawArrow(ctx, hox, hoy, v2EndX, v2EndY, '#43876f', 2.4, 'v₂');
      drawArrow(ctx, v1EndX, v1EndY, v2EndX, v2EndY, '#98751d', 2.8, 'Δv (∥ aₘ)');

      ctx.restore();
    }
  }
};

// =========================================================================
// 5. LABORATOR 3: SITUAȚII PARTICULARE — FUNCȚII POLINOMIALE DE MIȘCARE
//    x(t) = A*t^3 + B*t^2 + C*t + D  ==>  v(t) = 3A*t^2 + 2B*t + C  ==>  a(t) = 6A*t + 2B
// =========================================================================
const polyLab = {
  A: 0.5,
  B: -4.5,
  C: 10.0,
  D: 0.0,
  t: 0,
  tMax: 8,
  running: false,
  lastFrame: 0,
  frame: null,

  init() {
    this.updateParams();
  },

  pos(t) {
    return ((this.A * t + this.B) * t + this.C) * t + this.D;
  },

  vel(t) {
    return (3 * this.A * t + 2 * this.B) * t + this.C;
  },

  acc(t) {
    return 6 * this.A * t + 2 * this.B;
  },

  setCoeffs(A, B, C, D) {
    this.pause();
    document.getElementById('poly-slider-A').value = A;
    document.getElementById('poly-slider-B').value = B;
    document.getElementById('poly-slider-C').value = C;
    document.getElementById('poly-slider-D').value = D;
    this.t = 0;
    document.getElementById('poly-slider-t').value = 0;
    this.updateParams();
  },

  formatPolyX() {
    const terms = [];
    if (Math.abs(this.A) > 1e-4) terms.push(`${this.A.toFixed(2).replace(/\.00$/, '')}·t³`);
    if (Math.abs(this.B) > 1e-4) terms.push(`${terms.length ? fmtSigned(this.B, 2) : this.B}·t²`);
    if (Math.abs(this.C) > 1e-4) terms.push(`${terms.length ? fmtSigned(this.C, 2) : this.C}·t`);
    if (Math.abs(this.D) > 1e-4 || terms.length === 0) terms.push(`${terms.length ? fmtSigned(this.D, 2) : this.D}`);
    return 'x(t) = ' + terms.join(' ') + ' [m]';
  },

  formatPolyV() {
    const c2 = 3 * this.A;
    const c1 = 2 * this.B;
    const c0 = this.C;
    const terms = [];
    if (Math.abs(c2) > 1e-4) terms.push(`${c2.toFixed(2).replace(/\.00$/, '')}·t²`);
    if (Math.abs(c1) > 1e-4) terms.push(`${terms.length ? fmtSigned(c1, 2) : c1}·t`);
    if (Math.abs(c0) > 1e-4 || terms.length === 0) terms.push(`${terms.length ? fmtSigned(c0, 2) : c0}`);
    return 'v(t) = ' + terms.join(' ') + ' [m/s]';
  },

  formatPolyA() {
    const c1 = 6 * this.A;
    const c0 = 2 * this.B;
    const terms = [];
    if (Math.abs(c1) > 1e-4) terms.push(`${c1.toFixed(2).replace(/\.00$/, '')}·t`);
    if (Math.abs(c0) > 1e-4 || terms.length === 0) terms.push(`${terms.length ? fmtSigned(c0, 2) : c0}`);
    return 'a(t) = ' + terms.join(' ') + ' [m/s²]';
  },

  // Solve 3A t^2 + 2B t + C = 0 in [0, tMax]
  getVelocityRoots() {
    const a = 3 * this.A;
    const b = 2 * this.B;
    const c = this.C;
    const roots = [];
    if (Math.abs(a) < 1e-5) {
      if (Math.abs(b) > 1e-5) {
        const r = -c / b;
        if (r >= 0 && r <= this.tMax) roots.push(r);
      }
    } else {
      const delta = b * b - 4 * a * c;
      if (delta >= 0) {
        const r1 = (-b - Math.sqrt(delta)) / (2 * a);
        const r2 = (-b + Math.sqrt(delta)) / (2 * a);
        [r1, r2].sort((x, y) => x - y).forEach(r => {
          if (r >= 0 && r <= this.tMax) {
            if (roots.length === 0 || Math.abs(r - roots[roots.length - 1]) > 1e-3) {
              roots.push(r);
            }
          }
        });
      }
    }
    return roots;
  },

  updateParams() {
    this.A = parseFloat(document.getElementById('poly-slider-A').value);
    this.B = parseFloat(document.getElementById('poly-slider-B').value);
    this.C = parseFloat(document.getElementById('poly-slider-C').value);
    this.D = parseFloat(document.getElementById('poly-slider-D').value);

    document.getElementById('poly-val-A').textContent = this.A.toFixed(2);
    document.getElementById('poly-val-B').textContent = this.B.toFixed(2);
    document.getElementById('poly-val-C').textContent = this.C.toFixed(2);
    document.getElementById('poly-val-D').textContent = this.D.toFixed(2);

    document.getElementById('poly-eq-x').textContent = this.formatPolyX();
    document.getElementById('poly-eq-v').textContent = this.formatPolyV();
    document.getElementById('poly-eq-a').textContent = this.formatPolyA();

    // Update critical points analysis
    const roots = this.getVelocityRoots();
    let html = '<strong>🔍 Analiza Momentelor Caracteristice în [0, 8 s]:</strong><br/>';
    if (roots.length === 0) {
      html += '• <strong>Oprire (v = 0):</strong> Mobilul nu își schimbă sensul de mers în intervalul [0, 8 s].<br/>';
    } else {
      const rStr = roots.map(r => `t = <strong>${r.toFixed(2)} s</strong> (x = ${this.pos(r).toFixed(1)} m)`).join(', ');
      html += `• <span style="color:#98751d;">●</span> <strong>Momente de oprire / întoarcere (v = 0):</strong> ${rStr}<br/>`;
    }

    if (Math.abs(6 * this.A) > 1e-4) {
      const tAccZero = -(2 * this.B) / (6 * this.A);
      if (tAccZero >= 0 && tAccZero <= this.tMax) {
        html += `• <span style="color:#f472b6;">●</span> <strong>Accelerație nulă (a = 0, extrem al vitezei):</strong> t = <strong>${tAccZero.toFixed(2)} s</strong> (v = ${this.vel(tAccZero).toFixed(2)} m/s)`;
      } else {
        html += '• <strong>Accelerația a(t)</strong> nu se anulează în intervalul [0, 8 s].';
      }
    } else {
      html += `• <strong>Accelerația este constantă:</strong> a = ${(2 * this.B).toFixed(2)} m/s²`;
    }
    document.getElementById('poly-events-analysis').innerHTML = html;

    this.updateTelemetry();
    this.draw();
  },

  scrubTime(val) {
    this.t = parseFloat(val);
    this.updateTelemetry();
    this.draw();
  },

  play() {
    if (this.t >= this.tMax) this.t = 0;
    if (!this.running) {
      this.running = true;
      this.lastFrame = performance.now();
      this.frame = requestAnimationFrame(ts => this.loop(ts));
    }
  },

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
  },

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
    this.t = 0;
    document.getElementById('poly-slider-t').value = 0;
    this.updateTelemetry();
    this.draw();
  },

  reset() {
    this.setCoeffs(0.5, -4.5, 10.0, 0.0);
  },

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.1, Math.max(0, (ts - this.lastFrame) / 1000));
    this.lastFrame = ts;
    this.t += dt;
    if (this.t >= this.tMax) {
      this.t = this.tMax;
      this.running = false;
    cancelAnimationFrame(this.frame); this.frame = null;
    }
    document.getElementById('poly-slider-t').value = this.t;
    this.updateTelemetry();
    this.draw();
    if (this.running) this.frame = requestAnimationFrame(nextTs => this.loop(nextTs));
  },

  updateTelemetry() {
    const x = this.pos(this.t);
    const v = this.vel(this.t);
    const a = this.acc(this.t);

    document.getElementById('poly-val-t').textContent = this.t.toFixed(2) + ' s';
    document.getElementById('poly-out-t').textContent = this.t.toFixed(2) + ' s';
    document.getElementById('poly-out-x').textContent = x.toFixed(2) + ' m';
    document.getElementById('poly-out-v').textContent = v.toFixed(2) + ' m/s';
    document.getElementById('poly-out-a').textContent = a.toFixed(2) + ' m/s²';

    const natEl = document.getElementById('poly-out-nature');
    if (Math.abs(v) < 0.08) {
      natEl.textContent = 'Oprire inst. (v ≈ 0)';
      natEl.style.color = '#98751d';
    } else if (v * a > 0.05) {
      natEl.textContent = 'Accelerată (v·a > 0)';
      natEl.style.color = '#43876f';
    } else if (v * a < -0.05) {
      natEl.textContent = 'Încetinită (v·a < 0)';
      natEl.style.color = '#f87171';
    } else {
      natEl.textContent = 'Uniformă (a = 0)';
      natEl.style.color = '#216e61';
    }
  },

  draw() {
    const canvas = document.getElementById('poly-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const {width: W, height: H} = window.PraxisVelocityCanvas.prepare(canvas);

    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, 0, 0, W, H, 30);

    // Compute min/max for x, v, a over [0, tMax]
    let minX = -15, maxX = 15;
    let minV = -12, maxV = 12;
    let minA = -10, maxA = 10;

    for (let tau = 0; tau <= this.tMax; tau += 0.1) {
      const px = this.pos(tau);
      const pv = this.vel(tau);
      const pa = this.acc(tau);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (pv < minV) minV = pv;
      if (pv > maxV) maxV = pv;
      if (pa < minA) minA = pa;
      if (pa > maxA) maxA = pa;
    }
    const padRange = (mn, mx) => {
      const sp = Math.max(10, (mx - mn) * 1.2);
      const mid = (mx + mn) / 2;
      return [mid - sp / 2, mid + sp / 2];
    };
    [minX, maxX] = padRange(minX, maxX);
    [minV, maxV] = padRange(minV, maxV);
    [minA, maxA] = padRange(minA, maxA);

    // 1. TOP TRACK: 1D Particle moving according to polynomial x(t)
    const trackY = 65;
    const padX = 50;
    const trackW = W - 2 * padX;
    const toSx = x => padX + ((x - minX) / (maxX - minX)) * trackW;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 10, W - 28, 105);
    ctx.strokeStyle = '#d5e2d9';
    ctx.strokeRect(14, 10, W - 28, 105);

    ctx.fillStyle = '#83689e';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    window.PraxisVelocityLabels.label(ctx,'MIȘCAREA MOBILULUI PE AXA Ox CONFORM LEGII POLINOMIALE x(t)', 26, 28);

    drawArrow(ctx, padX - 10, trackY, W - padX + 15, trackY, '#536e64', 2, 'Ox');

    // Turning points markers on track
    const roots = this.getVelocityRoots();
    roots.forEach(r => {
      const rx = toSx(this.pos(r));
      ctx.fillStyle = '#98751d';
      ctx.beginPath();
      ctx.arc(rx, trackY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px sans-serif';
      window.PraxisVelocityLabels.label(ctx,`v=0 (${r.toFixed(1)}s)`, rx - 22, trackY + 26);
    });

    const curX = this.pos(this.t);
    const curV = this.vel(this.t);
    const curA = this.acc(this.t);
    const scX = toSx(curX);

    drawArrow(ctx, scX, trackY - 16, scX + curV * 3.5, trackY - 16, '#43876f', 2.8, `v=${curV.toFixed(1)}`);
    drawArrow(ctx, scX, trackY + 14, scX + curA * 3.5, trackY + 14, '#ef4444', 2.8, `a=${curA.toFixed(1)}`);

    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(scX, trackY, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. BOTTOM 3 SYNCHRONIZED GRAPHS: x(t), v(t), a(t)
    const gTop = 130;
    const gH = H - gTop - 14;
    const gap = 12;
    const gW = (W - 28 - 2 * gap) / 3;

    this.drawSingleCurveBox(
      ctx, 14, gTop, gW, gH,
      '1. Poziția x(t) [m]', '#a855f7',
      tau => this.pos(tau), minX, maxX, roots, 'extrem (v=0)'
    );

    this.drawSingleCurveBox(
      ctx, 14 + gW + gap, gTop, gW, gH,
      '2. Viteza v(t) = x\'(t) [m/s]', '#43876f',
      tau => this.vel(tau), minV, maxV, roots, 'v=0'
    );

    const accRoots = [];
    if (Math.abs(6 * this.A) > 1e-4) {
      const ra = -(2 * this.B) / (6 * this.A);
      if (ra >= 0 && ra <= this.tMax) accRoots.push(ra);
    }

    this.drawSingleCurveBox(
      ctx, 14 + 2 * (gW + gap), gTop, gW, gH,
      '3. Accelerația a(t) = v\'(t) [m/s²]', '#ef4444',
      tau => this.acc(tau), minA, maxA, accRoots, 'a=0'
    );
  },

  drawSingleCurveBox(ctx, gx, gy, gw, gh, title, color, fn, minVal, maxVal, highlightTimes, highlightLbl) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#d5e2d9';
    ctx.strokeRect(gx, gy, gw, gh);

    ctx.fillStyle = color;
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    window.PraxisVelocityLabels.label(ctx,title, gx + 10, gy + 20);

    const padL = 38, padR = 14, padT = 32, padB = 26;
    const pw = gw - padL - padR;
    const ph = gh - padT - padB;
    const ox = gx + padL;
    const oy = gy + padT;

    const toPxT = t => ox + (t / this.tMax) * pw;
    const toPxY = val => oy + ph - ((val - minVal) / (maxVal - minVal)) * ph;

    // Zero horizontal line
    const zeroY = toPxY(0);
    if (zeroY >= oy && zeroY <= oy + ph) {
      ctx.strokeStyle = '#b8cbc0';
      ctx.beginPath();
      ctx.moveTo(ox, zeroY);
      ctx.lineTo(ox + pw, zeroY);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#8ca69a';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy + ph);
    ctx.lineTo(ox + pw, oy + ph);
    ctx.stroke();

    // Curve
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let tau = 0; tau <= this.tMax; tau += 0.04) {
      const px = toPxT(tau);
      const py = toPxY(fn(tau));
      if (tau === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Highlighted roots
    highlightTimes.forEach(rt => {
      const rx = toPxT(rt);
      const ry = toPxY(fn(rt));
      ctx.fillStyle = '#98751d';
      ctx.beginPath();
      ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px sans-serif';
      window.PraxisVelocityLabels.label(ctx,`${highlightLbl}`, Math.min(ox + pw - 45, rx + 5), ry - 6);
    });

    // Current time vertical cursor + marker
    const curX = toPxT(this.t);
    const curY = toPxY(fn(this.t));
    ctx.strokeStyle = '#b8cbc0';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(curX, oy);
    ctx.lineTo(curX, oy + ph);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(curX, curY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#536e64';
    ctx.font = '10px monospace';
    window.PraxisVelocityLabels.label(ctx,'0s', ox, oy + ph + 15);
    window.PraxisVelocityLabels.label(ctx,this.tMax + 's', ox + pw - 16, oy + ph + 15);
    ctx.restore();
  }
};

// Finish each canvas annotation pass after all points, curves and vectors.
for(const [lab,id] of [[rectLab,'rect-canvas'],[curvLab,'curv-canvas'],[polyLab,'poly-canvas']]){
 const draw=lab.draw;lab.draw=function(){try{return draw.call(this);}finally{const canvas=document.getElementById(id);if(canvas)window.PraxisVelocityLabels.flush(canvas.getContext('2d'));}};
}
// Initialize all laboratories on page load
window.addEventListener('DOMContentLoaded', () => {
  rectLab.init();
  curvLab.init();
  polyLab.init();
});
