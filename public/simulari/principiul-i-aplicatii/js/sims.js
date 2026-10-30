/* ==========================================================================
   sims.js — demonstrațiile interactive (Canvas 2D, fără nicio bibliotecă)
   Fiecare demo are un state, o funcție draw(dt) și este animat doar când
   secțiunea respectivă este vizibilă.
   ========================================================================== */
(function (global) {
  'use strict';

  var R = 8.314, T0 = 273.15;
  var COL = {
    accent: '#3b82f6', accent2: '#60a5fa', gold: '#f59e0b', cyan: '#22d3ee',
    violet: '#a78bfa', green: '#10b981', red: '#f43f5e',
    grid: '#1b2436', axis: '#475569', text: '#9ca3af', bright: '#e5e7eb',
    fill: 'rgba(59,130,246,.22)', fillGold: 'rgba(245,158,11,.20)'
  };

  /* ---------------------------- utilitare canvas ------------------------- */
  function fit(cv) { return global.PraxisApplicationsCanvas.prepare(cv); }
  function txt(g, s, x, y, opt) {
    opt = opt || {};
    g.save();
    g.font = (opt.bold ? '600 ' : '') + (opt.size || 11) + 'px "Consolas","Segoe UI",monospace';
    g.fillStyle = COL.text;
    g.textAlign = opt.align || 'left';
    g.textBaseline = opt.base || 'alphabetic';
    if (opt.rot) { g.translate(x, y); g.rotate(opt.rot); g.fillText(s, 0, 0); }
    else g.fillText(s, x, y);
    g.restore();
  }
  function axes(g, x0, y0, w, h, lab) {
    g.strokeStyle = COL.axis; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(x0, y0 - h); g.lineTo(x0, y0); g.lineTo(x0 + w, y0); g.stroke();
    /* săgeți */
    g.beginPath();
    g.moveTo(x0, y0 - h); g.lineTo(x0 - 3.5, y0 - h + 8); g.lineTo(x0 + 3.5, y0 - h + 8); g.closePath();
    g.moveTo(x0 + w, y0); g.lineTo(x0 + w - 8, y0 - 3.5); g.lineTo(x0 + w - 8, y0 + 3.5); g.closePath();
    g.fillStyle = COL.axis; g.fill();
    if (lab) {
      txt(g, lab.y, x0 - 8, y0 - h + 4, { align: 'right', color: COL.bright, bold: true });
      txt(g, lab.x, x0 + w - 2, y0 + 16, { align: 'right', color: COL.bright, bold: true });
    }
  }
  function grid(g, x0, y0, w, h, nx, ny) {
    g.strokeStyle = COL.grid; g.lineWidth = 1; g.beginPath();
    for (var i = 1; i <= nx; i++) { var x = x0 + w * i / nx; g.moveTo(x, y0); g.lineTo(x, y0 - h); }
    for (var j = 1; j <= ny; j++) { var y = y0 - h * j / ny; g.moveTo(x0, y); g.lineTo(x0 + w, y); }
    g.stroke();
  }
  function fmt(n, d) { return global.Util.num(n, d === undefined ? 2 : d); }
  function energyJ(J) {
    return Math.abs(J) >= 1000 ? fmt(J / 1000, 2) + ' kJ' : fmt(J, 1) + ' J';
  }

  /* ========================= 1. MODELUL MOLECULEI ======================== */
  var MolDemo = global.PraxisMolecularDegrees.create({prepare:fit,colors:COL,arrow:arrow,txt:txt});
  function arrow(g, x1, y1, x2, y2, color, lab) {
    g.save(); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1);
    g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - 7 * Math.cos(a - .4), y2 - 7 * Math.sin(a - .4));
    g.lineTo(x2 - 7 * Math.cos(a + .4), y2 - 7 * Math.sin(a + .4));
    g.closePath(); g.fill();
    if (lab) txt(g, lab, x2 + 4, y2 - 2, { size: 9, color: color });
    g.restore();
  }

  /* ===================== 2. GAZUL ÎNTR-UN VAS (motor comun) ============== */
  /* Același motor de particule este folosit de izocor (V fix) și izobar (V variabil). */
  function GasEngine(n) {
    this.p = [];
    for (var i = 0; i < n; i++) this.p.push({ x: Math.random(), y: Math.random(), a: Math.random() * 6.283 });
    this.speed = 1;
  }
  GasEngine.prototype.step = function (dt, box, vScale, onHit) {
    var s = this.speed * dt * 0.9;
    for (var i = 0; i < this.p.length; i++) {
      var m = this.p[i];
      var vx = Math.cos(m.a) * s, vy = Math.sin(m.a) * s * (vScale || 1);
      m.x += vx / box.w; m.y += vy / box.h;
      var hit = 0;
      if (m.x < 0) { m.x = 0; m.a = Math.PI - m.a; hit = 1; }
      if (m.x > 1) { m.x = 1; m.a = Math.PI - m.a; hit = 1; }
      if (m.y < 0) { m.y = 0; m.a = -m.a; hit = 1; }
      if (m.y > 1) { m.y = 1; m.a = -m.a; hit = 1; }
      if (hit && onHit) onHit(m);
    }
  };
  GasEngine.prototype.paint = function (g, box, temp) {
    var hue = global.Util.clamp(210 - (temp - 300) * 0.42, 0, 210);
    for (var i = 0; i < this.p.length; i++) {
      var m = this.p[i], x = box.x + m.x * box.w, y = box.y + m.y * box.h;
      g.beginPath(); g.arc(x, y, 3.4, 0, 7);
      g.fillStyle = 'hsl(' + hue + ',90%,62%)'; g.fill();
      g.beginPath(); g.moveTo(x, y);
      g.lineTo(x + Math.cos(m.a) * 9, y + Math.sin(m.a) * 9);
      g.strokeStyle = 'hsla(' + hue + ',90%,70%,.35)'; g.lineWidth = 1; g.stroke();
    }
  };

  /* ============================ 3. IZOCORUL ============================== */
  var Izocor = {
    cv: null, eng: new GasEngine(46), nu: 0.5, V: 10e-3, Ti: 300,
    T: 300, target: 300, Q: 0, hits: 0, running: false, runT: 0,
    init: function () { this.cv = document.getElementById('izocCanvas'); },
    setQ: function (pct) {
      this.Q = pct / 100 * 2000;                       /* 0 … 2000 J */
      this.target = this.Ti + this.Q / (this.nu * 12.471); this.T = this.target;
    },
    reset: function () { this.Q = 0; this.setQ(0); this.T = this.Ti; },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      if (this.running) {
        this.runT += dt;
        var pct = Math.min(100, this.runT * 22);
        this.setQ(pct);
        var el = document.getElementById('izocQ');
        if (el) { el.value = pct; global.Util.paint(el); el.dispatchEvent(new Event('input', { bubbles: true })); }
        if (pct >= 100) this.running = false;
      }
      this.T = global.Util.lerp(this.T, this.target, 1 - Math.pow(0.001, dt));
      this.eng.speed = 60 * Math.sqrt(this.T / 300);

      var box = { x: 26, y: 22, w: w - 92, h: h - 52 };
      /* perete rigid */
      g.strokeStyle = COL.bright; g.lineWidth = 3; g.strokeRect(box.x, box.y, box.w, box.h);
      g.save(); g.strokeStyle = 'rgba(36,60,64,.18)'; g.lineWidth = 1;
      for (var i = 0; i < box.w; i += 9) {
        g.beginPath(); g.moveTo(box.x + i, box.y); g.lineTo(box.x + i - 6, box.y - 8); g.stroke();
        g.beginPath(); g.moveTo(box.x + i, box.y + box.h); g.lineTo(box.x + i - 6, box.y + box.h + 8); g.stroke();
      }
      g.restore();
      g.save(); g.beginPath(); g.rect(box.x, box.y, box.w, box.h); g.clip();
      var hits = 0;
      this.eng.step(dt, box, 1, function () { hits++; });
      this.eng.paint(g, box, this.T);
      g.restore();

      this.hits = hits;
      var p = this.nu * R * this.T / this.V;
      var dU = this.nu * 12.471 * (this.T - this.Ti);

      /* termometru */
      var tx = w - 46, ty = box.y, th = box.h;
      g.fillStyle = '#1e293b'; g.fillRect(tx, ty, 12, th);
      var frac = global.Util.clamp((this.T - 250) / 500, 0, 1);
      g.fillStyle = 'hsl(' + (210 - frac * 210) + ',85%,55%)'; g.fillRect(tx, ty + th * (1 - frac), 12, th * frac);
      txt(g, 'T', tx + 6, ty - 8, { align: 'center', color: COL.bright, bold: true });

      txt(g, 'V = ' + fmt(this.V * 1000, 0) + ' L  (rigid)', box.x + 4, box.y + box.h + 20, { color: COL.cyan });
      txt(g, 'L = 0', w - 54, h - 8, { color: COL.gold, align: 'right', bold: true });
      if (this.T > this.Ti + 1) txt(g, 'Q →', box.x + 4, box.y - 12, { color: COL.red, align: 'left', bold: true });

      /* sunetul șocurilor: rata crește odată cu presiunea */
      var rel = p / 1e5;
      if (hits > 0) global.Sound.impacts(rel * 3.2, global.Util.clamp(rel / 4, 0, 1));

      return { T: this.T, p: p, dU: dU, L: 0, Q: this.Q };
    }
  };

  /* ============================ 4. IZOBARUL ============================== */
  var Izobar = {
    cv: null, eng: new GasEngine(46), nu: 0.5, Ti: 300,
    T: 300, p: 1e5, Vnow: 0.0075,
    init: function () { this.cv = document.getElementById('izobCanvas'); },
    set: function (T, pPa) { this.T = T; this.p = pPa; },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      var V = this.nu * R * this.T / this.p;                 /* m³ */
      this.Vnow = V;
      var vMax = 0.03, frac = global.Util.clamp(this.Vnow / vMax, .08, 1);

      var cx = 40, cy = 18, cw = w - 120, ch = h - 46;
      var pistonY = cy + ch * (1 - frac);
      /* cilindru */
      g.strokeStyle = COL.bright; g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx, cy); g.lineTo(cx, cy + ch); g.lineTo(cx + cw, cy + ch); g.lineTo(cx + cw, cy);
      g.stroke();
      /* gazul */
      var box = { x: cx + 2, y: pistonY + 8, w: cw - 4, h: Math.max(20, cy + ch - pistonY - 10) };
      g.save(); g.beginPath(); g.rect(box.x, box.y, box.w, box.h); g.clip();
      g.fillStyle = 'rgba(59,130,246,.06)'; g.fillRect(box.x, box.y, box.w, box.h);
      this.eng.speed = 60 * Math.sqrt(this.T / 300);
      var hits = 0;
      this.eng.step(dt, box, 1, function () { hits++; });
      this.eng.paint(g, box, this.T);
      g.restore();
      /* pistonul + greutatea */
      g.fillStyle = '#64748b'; g.fillRect(cx + 2, pistonY - 6, cw - 4, 12);
      g.strokeStyle = COL.gold; g.lineWidth = 2;
      g.strokeRect(cx + cw / 2 - 22, pistonY - 40, 44, 32);
      txt(g, 'M·g', cx + cw / 2, pistonY - 19, { align: 'center', color: COL.gold, bold: true });
      /* săgeata p_a */
      g.strokeStyle = COL.text; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(cx + cw / 2, cy - 12); g.lineTo(cx + cw / 2, pistonY - 44); g.stroke();
      g.beginPath(); g.moveTo(cx + cw / 2, pistonY - 40);
      g.lineTo(cx + cw / 2 - 4, pistonY - 47); g.lineTo(cx + cw / 2 + 4, pistonY - 47); g.closePath();
      g.fillStyle = COL.text; g.fill();
      txt(g, 'p_a', cx + cw / 2 + 8, cy + 2, { color: COL.text });
      txt(g, 'p = ' + fmt(this.p / 1000, 0) + ' kPa  (constant)', cx, h - 6, { color: COL.gold });
      txt(g, 'V = ' + fmt(this.Vnow * 1000, 1) + ' L', cx + cw, h - 6, { align: 'right', color: COL.cyan });

      if (hits > 0) global.Sound.impacts((this.p / 1e5) * 2.6, global.Util.clamp(this.p / 3e5, 0, 1));

      var dT = this.T - this.Ti;
      var Q = this.nu * 20.785 * dT, dU = this.nu * 12.471 * dT, L = this.nu * R * dT;
      return { V: this.Vnow, Q: Q, dU: dU, L: L, T: this.T, p: this.p };
    }
  };

  /* ====================== 5. IZOTERMA · aria de sub curbă ================ */
  var Izoterm = {
    cv: null, nu: 2, T: 300, Vi: 10e-3, Vf: 20e-3, anim: 0, animDir: 0, direction: 1,
    init: function () { this.cv = document.getElementById('izoCanvas'); },
    set: function (VfL, nu) { this.Vf = VfL * 1e-3; this.nu = nu; this.direction = 1; this.animDir = 0; },
    start: function (dir) { this.direction = dir; this.animDir = dir; this.anim = dir > 0 ? this.Vi : this.Vf; },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      var x0 = 46, y0 = h - 34, aw = w - 70, ah = h - 60;
      var vMax = 65e-3, pMax = this.nu * R * this.T / (this.Vi * 0.85);
      var X = function (v) { return x0 + aw * v / vMax; };
      var Y = function (p) { return y0 - ah * p / pMax; };
      var P = function (v) { return this.nu * R * this.T / v; }.bind(this);

      grid(g, x0, y0, aw, ah, 6, 4);
      axes(g, x0, y0, aw, ah, { x: 'V [m³]', y: 'p [Pa]' });

      if (this.animDir) {
        var goal = this.animDir > 0 ? this.Vf : this.Vi;
        this.anim += (goal - this.anim) * (1 - Math.pow(0.004, dt));
        if (Math.abs(goal - this.anim) < 1e-4) { this.anim = goal; this.animDir = 0; }
      }
      var initialVolume = this.direction < 0 ? this.Vf : this.Vi;
      var vHi = this.animDir ? this.anim : this.direction < 0 ? this.Vi : this.Vf;
      var lo = Math.min(initialVolume, vHi), hi = Math.max(initialVolume, vHi);

      /* aria hașurată = L */
      g.beginPath(); g.moveTo(X(lo), Y(0));
      for (var v = lo; v <= hi; v += hi / 120) g.lineTo(X(v), Y(P(v)));
      g.lineTo(X(hi), Y(0)); g.closePath();
      g.fillStyle = COL.fill; g.fill();
      g.save(); g.strokeStyle = 'rgba(59,130,246,.45)'; g.lineWidth = 1;
      g.clip(); g.beginPath();
      for (var s = -h; s < w; s += 7) { g.moveTo(x0 + s, y0); g.lineTo(x0 + s + ah, y0 - ah); }
      g.stroke(); g.restore();

      /* hiperbola */
      g.beginPath();
      for (var vv = this.Vi * 0.5; vv <= vMax; vv += vMax / 220) {
        var px = X(vv), py = Y(P(vv));
        if (vv === this.Vi * 0.5) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokeStyle = COL.cyan; g.lineWidth = 2.4; g.stroke();
      txt(g, 'T = ' + fmt(this.T, 0) + ' K', X(vMax * .72), Y(P(vMax * .72)) - 8, { color: COL.cyan });

      /* punctele inițial și final */
      [[initialVolume, 'i'], [vHi, 'f']].forEach(function (pt) {
        g.beginPath(); g.arc(X(pt[0]), Y(P(pt[0])), 4.5, 0, 7);
        g.fillStyle = pt[1] === 'i' ? COL.gold : COL.green; g.fill();
        txt(g, pt[1], X(pt[0]) + 7, Y(P(pt[0])) - 6, { color: COL.bright, bold: true });
      });
      /* liniile de ape */
      g.setLineDash([3, 3]); g.strokeStyle = COL.axis; g.lineWidth = 1;
      g.beginPath();
      g.moveTo(X(initialVolume), y0); g.lineTo(X(initialVolume), Y(P(initialVolume)));
      g.moveTo(X(vHi), y0); g.lineTo(X(vHi), Y(P(vHi)));
      g.stroke(); g.setLineDash([]);
      txt(g, 'V_i', X(initialVolume), y0 + 14, { align: 'center', color: COL.text });
      txt(g, 'V_f', X(vHi), y0 + 14, { align: 'center', color: COL.text });
      txt(g, '|L| = aria', x0 + aw * .42, y0 - ah * .18, { color: COL.accent2, bold: true });

      var L = this.nu * R * this.T * Math.log(vHi / initialVolume);
      return { L: L, pi: P(initialVolume), pf: P(vHi), T: this.T };
    }
  };

  /* ============ 6. ADIABATA vs IZOTERMA (fig. 1.4.1 din manual) ========== */
  var Adiabat = {
    cv: null, gamma: 1.4, ratio: 2.5, nu: 0.5, Ti: 300, Vi: 10e-3, pulse: 0,
    init: function () { this.cv = document.getElementById('adCanvas'); },
    set: function (gm, ratio) { this.gamma = gm; this.ratio = ratio; },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      var x0 = 46, y0 = h - 34, aw = w - 70, ah = h - 60;
      var Vf = this.Vi * this.ratio, vMax = Math.max(45e-3, Vf * 1.15);
      var pi = this.nu * R * this.Ti / this.Vi;
      var pMax = pi * 1.25;
      var X = function (v) { return x0 + aw * v / vMax; };
      var Y = function (p) { return y0 - ah * p / pMax; };

      grid(g, x0, y0, aw, ah, 6, 4);
      axes(g, x0, y0, aw, ah, { x: 'V [m³]', y: 'p [Pa]' });

      /* izoterma (albastru) */
      g.beginPath();
      for (var v = this.Vi * .55; v <= vMax; v += vMax / 240) {
        var p = this.nu * R * this.Ti / v;
        if (v === this.Vi * .55) g.moveTo(X(v), Y(p)); else g.lineTo(X(v), Y(p));
      }
      g.strokeStyle = COL.accent2; g.lineWidth = 2.2; g.stroke();
      txt(g, 'izotermă', X(vMax * .62), Y(this.nu * R * this.Ti / (vMax * .62)) + 16, { color: COL.accent2 });

      /* adiabata (auriu) — trece prin același punct inițial */
      var K = pi * Math.pow(this.Vi, this.gamma);
      g.beginPath();
      for (var v2 = this.Vi * .6; v2 <= vMax; v2 += vMax / 240) {
        var p2 = K * Math.pow(v2, -this.gamma);
        if (v2 === this.Vi * .6) g.moveTo(X(v2), Y(p2)); else g.lineTo(X(v2), Y(p2));
      }
      g.strokeStyle = COL.gold; g.lineWidth = 2.4; g.stroke();
      txt(g, 'adiabatǎ  γ=' + fmt(this.gamma, 2), X(vMax * .34), Y(K * Math.pow(vMax * .34, -this.gamma)) - 8, { color: COL.gold, bold: true });

      /* punctul comun de intersecție */
      g.beginPath(); g.arc(X(this.Vi), Y(pi), 5.5, 0, 7);
      g.fillStyle = '#fff'; g.fill();
      g.strokeStyle = COL.red; g.lineWidth = 2; g.stroke();
      txt(g, 'un singur punct comun', X(this.Vi) + 10, Y(pi) + 18, { color: COL.red, size: 10 });

      /* aria sub adiabată = L */
      g.beginPath(); g.moveTo(X(this.Vi), Y(0));
      for (var sample = 0; sample <= 120; sample++) { var v3 = this.Vi + (Vf - this.Vi) * sample / 120; g.lineTo(X(v3), Y(K * Math.pow(v3, -this.gamma))); }
      g.lineTo(X(Vf), Y(0)); g.closePath();
      g.fillStyle = COL.fillGold; g.fill();

      g.setLineDash([3, 3]); g.strokeStyle = COL.axis;
      g.beginPath(); g.moveTo(X(Vf), y0); g.lineTo(X(Vf), Y(K * Math.pow(Vf, -this.gamma))); g.stroke();
      g.setLineDash([]);
      txt(g, 'V_i', X(this.Vi), y0 + 14, { align: 'center', color: COL.text });
      txt(g, 'V_f', X(Vf), y0 + 14, { align: 'center', color: COL.text });

      var Tf = this.Ti * Math.pow(this.Vi / Vf, this.gamma - 1);
      /* C_V molare aproximativ, în funcție de γ (mono/biatomic) */
      var cvMolar = R / (this.gamma - 1);
      var dU = this.nu * cvMolar * (Tf - this.Ti);
      var L = -dU;

      if (this.pulse > 0) {
        this.pulse -= dt * 2.2;
        g.strokeStyle = 'rgba(244,63,94,' + Math.max(0, this.pulse) + ')'; g.lineWidth = 3;
        g.beginPath(); g.arc(X(this.Vi), Y(pi), 12 + (1 - this.pulse) * 26, 0, 7); g.stroke();
      }
      return { pr: Math.pow(1 / this.ratio, this.gamma), tr: Math.pow(1 / this.ratio, this.gamma - 1), Tf: Tf, dU: dU, L: L };
    }
  };

  /* ==================== 7. GRAFICUL SINTEZĂ (Tabel 1.4.2) ================ */
  var Synth = {
    cv: null, which: 'izobar', t: 0,
    init: function () { this.cv = document.getElementById('synthCanvas'); },
    set: function (name) { this.which = name; this.t = 0; },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      this.t += dt;
      var x0 = 46, y0 = h - 34, aw = w - 70, ah = h - 60;
      var nu = 0.5, Ti = 300, Vi = 10e-3, vMax = 30e-3;
      var pMax = 2.4e5;
      var X = function (v) { return x0 + aw * v / vMax; };
      var Y = function (p) { return y0 - ah * p / pMax; };
      grid(g, x0, y0, aw, ah, 6, 4);
      axes(g, x0, y0, aw, ah, { x: 'V [m³]', y: 'p [Pa]' });
      var pi = nu * R * Ti / Vi;
      var prog = Math.min(1, this.t * 0.6);
      var path = [], area = [];

      if (this.which === 'izocor') {
        var p2 = pi * 1.6;
        for (var s = 0; s <= 1; s += .02) path.push([Vi, pi + (p2 - pi) * s * prog]);
        area = null;
        txt(g, 'p crește, V nu se schimbă ⇒ L = 0', x0 + 12, y0 - ah * .82, { color: COL.cyan, size: 11 });
      } else if (this.which === 'izobar') {
        var v2 = Vi * 2.2;
        for (var s2 = 0; s2 <= 1; s2 += .02) path.push([Vi + (v2 - Vi) * s2 * prog, pi]);
        area = [[X(Vi), Y(0)]].concat(path.map(function (q) { return [X(q[0]), Y(q[1])]; })).concat([[X(v2 * prog + Vi * (1 - prog)), Y(0)]]);
        txt(g, 'L = p·ΔV (dreptunghiul)', x0 + 12, y0 - ah * .3, { color: COL.gold, size: 11 });
      } else if (this.which === 'izoterm') {
        var vend = Vi * 2.6;
        for (var s3 = 0; s3 <= 1; s3 += .02) {
          var vq = Vi + (vend - Vi) * s3 * prog;
          path.push([vq, nu * R * Ti / vq]);
        }
        area = [[X(Vi), Y(0)]].concat(path.map(function (q) { return [X(q[0]), Y(q[1])]; })).concat([[X(path[path.length - 1][0]), Y(0)]]);
        txt(g, 'ΔU = 0 ⇒ Q = L = aria', x0 + 12, y0 - ah * .3, { color: COL.accent2, size: 11 });
      } else {
        var gm = 1.4, K = pi * Math.pow(Vi, gm), vend2 = Vi * 2.4;
        for (var s4 = 0; s4 <= 1; s4 += .02) {
          var vr = Vi + (vend2 - Vi) * s4 * prog;
          path.push([vr, K * Math.pow(vr, -gm)]);
        }
        area = [[X(Vi), Y(0)]].concat(path.map(function (q) { return [X(q[0]), Y(q[1])]; })).concat([[X(path[path.length - 1][0]), Y(0)]]);
        txt(g, 'Q = 0 ⇒ L = −ΔU', x0 + 12, y0 - ah * .3, { color: COL.gold, size: 11 });
      }

      if (area && area.length > 3) {
        g.beginPath(); g.moveTo(area[0][0], area[0][1]);
        for (var i = 1; i < area.length; i++) g.lineTo(area[i][0], area[i][1]);
        g.closePath(); g.fillStyle = COL.fill; g.fill();
      }
      g.beginPath();
      path.forEach(function (q, i) { i ? g.lineTo(X(q[0]), Y(q[1])) : g.moveTo(X(q[0]), Y(q[1])); });
      g.strokeStyle = COL.green; g.lineWidth = 2.6; g.stroke();
      var last = path[path.length - 1];
      g.beginPath(); g.arc(X(last[0]), Y(last[1]), 4.5, 0, 7); g.fillStyle = COL.green; g.fill();
      g.beginPath(); g.arc(X(Vi), Y(pi), 4.5, 0, 7); g.fillStyle = COL.gold; g.fill();
      txt(g, 'i', X(Vi) + 8, Y(pi) - 6, { color: COL.bright, bold: true });
      txt(g, 'f', X(last[0]) + 8, Y(last[1]) - 6, { color: COL.bright, bold: true });
      txt(g, global.I18N.t('dyn.' + this.which), x0 + aw - 4, y0 - ah - 6, { align: 'right', color: COL.bright, bold: true, size: 12 });
    }
  };

  /* ============ 8. ÎMPĂRȚIREA CĂLDURII: ΔU vs L (bară stivuită) ========== */
  var Ratio = {
    cv: null, t: 0,
    init: function () { this.cv = document.getElementById('ratioCanvas'); },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      this.t = Math.min(1, this.t + dt * 1.1);
      var rows = [
        { k: 'izocor', du: 1, l: 0 },
        { k: 'izobar', du: 3 / 5, l: 2 / 5 },
        { k: 'izoterm', du: 0, l: 1 },
        { k: 'adiabat', du: 0, l: 0 }
      ];
      var bh = 26, gap = (h - 22 - rows.length * bh) / (rows.length + 1);
      var x0 = 92, bw = w - x0 - 16;
      rows.forEach(function (r, i) {
        var y = 12 + gap * (i + 1) + bh * i;
        txt(g, global.I18N.t('dyn.' + r.k), x0 - 8, y + bh * .68, { align: 'right', color: COL.bright, size: 11, bold: true });
        g.fillStyle = '#131c2c'; g.fillRect(x0, y, bw, bh);
        if (r.du + r.l === 0) {
          g.save(); g.strokeStyle = COL.axis; g.setLineDash([5, 5]); g.strokeRect(x0 + .5, y + .5, bw - 1, bh - 1); g.restore();
          txt(g, 'Q = 0', x0 + bw / 2, y + bh * .68, { align: 'center', color: COL.text });
          return;
        }
        var du = bw * r.du * this.t, l = bw * r.l * this.t;
        g.fillStyle = COL.cyan; g.fillRect(x0, y, du, bh);
        g.fillStyle = COL.gold; g.fillRect(x0 + du, y, l, bh);
        if (du > 34) txt(g, 'ΔU ' + Math.round(r.du * 100) + '%', x0 + du / 2, y + bh * .68, { align: 'center', color: '#04121f', size: 10, bold: true });
        if (l > 34) txt(g, 'L ' + Math.round(r.l * 100) + '%', x0 + du + l / 2, y + bh * .68, { align: 'center', color: '#1a1206', size: 10, bold: true });
      }, this);
      txt(g, 'Q = ΔU + L', w - 8, h - 2, { align: 'right', color: COL.text, size: 10 });
    }
  };

  /* ==================== 9. FAMILIA POLITROPES (pVⁿ = ct) ================= */
  var Politrop = {
    cv: null, n: 1, ghost: [],
    init: function () { this.cv = document.getElementById('polCanvas'); },
    set: function (n) { this.n = n; },
    curve: function (n, Vi, pi, v) {
      if (n >= 3) return v < Vi ? pi * 8 : pi * 0.02;             /* izocoră aproximată */
      if (Math.abs(n - 1) < 1e-4) return pi * Vi / v;             /* izotermă */
      return pi * Math.pow(Vi / v, n);
    },
    draw: function () {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      var x0 = 44, y0 = h - 32, aw = w - 66, ah = h - 56;
      var Vi = 8e-3, pi = 1.5e5, vMax = 40e-3, pMax = 3.4e5;
      var X = function (v) { return x0 + aw * v / vMax; };
      var Y = function (p) { return y0 - ah * global.Util.clamp(p / pMax, 0, 1.02); };
      grid(g, x0, y0, aw, ah, 6, 5);
      axes(g, x0, y0, aw, ah, { x: 'V [m³]', y: 'p [Pa]' });

      /* curbele fantomă pentru n = 0, 1, γ, ∞ */
      var refs = [{ n: 0, c: 'rgba(167,139,250,.45)', l: 'n=0 izobar' },
      { n: 1, c: 'rgba(96,165,250,.45)', l: 'n=1 izoterm' },
      { n: 1.4, c: 'rgba(16,185,129,.45)', l: 'n=γ adiabatic' },
      { n: 999, c: 'rgba(245,158,11,.45)', l: 'n→∞ izocor' }];
      refs.forEach(function (r) {
        g.beginPath();
        for (var v = Vi * .5; v <= vMax; v += vMax / 200) {
          var p = this.curve(r.n, Vi, pi, v);
          if (p > pMax * 1.1 || p <= 0) continue;
          g.lineTo(X(v), Y(p));
        }
        g.strokeStyle = r.c; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]);
      }, this);

      /* politropa curentă */
      var n = this.n;
      g.beginPath();
      var started = false;
      for (var v = Vi * .45; v <= vMax; v += vMax / 300) {
        var p = this.curve(n, Vi, pi, v);
        if (p <= 0 || !isFinite(p)) continue;
        var yy = Y(p);
        if (!started) { g.moveTo(X(v), yy); started = true; } else g.lineTo(X(v), yy);
      }
      g.strokeStyle = COL.red; g.lineWidth = 3; g.stroke();

      /* punctul de plecare */
      g.beginPath(); g.arc(X(Vi), Y(pi), 5, 0, 7); g.fillStyle = '#fff'; g.fill();
      g.strokeStyle = COL.red; g.lineWidth = 2; g.stroke();

      /* etichete pe margine */
      txt(g, 'n = ' + (n >= 3 ? '→ ∞' : fmt(n, 2)), x0 + aw - 4, y0 - ah + 12, { align: 'right', color: COL.red, bold: true, size: 13 });
      txt(g, 'pV' + (n >= 3 ? 'ⁿ=ct' : supers(n)) + ' = constant', x0 + 6, y0 - ah + 12, { color: COL.bright });
      /* legendă compactă jos */
      var lx = x0 + 4;
      refs.forEach(function (r) {
        g.fillStyle = r.c.replace(/[\d.]+\)$/, '1)'); g.fillRect(lx, y0 + 20, 10, 3);
        txt(g, r.l.split(' ')[0], lx + 13, y0 + 25, { size: 9, color: COL.text });
        lx += 62;
      });
    }
  };
  function supers(n) {
    var map = { '-': '⁻', '.': '·', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(n.toFixed(2)).split('').map(function (c) { return map[c] || c; }).join('');
  }

  /* =============== 10. GRAFUL TABEL 1.4.1 · teorie vs experiment ========== */
  var Chart141 = {
    cv: null, t: 0, playing: false,
    rows: [
      { gas: 'He', kind: 'mono', cv: 12.47, cp: 20.78, gm: 1.667, th: 5 / 3 },
      { gas: 'Ar', kind: 'mono', cv: 12.47, cp: 20.78, gm: 1.667, th: 5 / 3 },
      { gas: 'H₂', kind: 'di', cv: 20.42, cp: 28.74, gm: 1.407, th: 7 / 5 },
      { gas: 'N₂', kind: 'di', cv: 20.76, cp: 29.07, gm: 1.400, th: 7 / 5 },
      { gas: 'O₂', kind: 'di', cv: 21.10, cp: 29.41, gm: 1.394, th: 7 / 5 }
    ],
    init: function () { this.cv = document.getElementById('chart141'); },
    play: function () { this.t = 0; this.playing = true; },
    draw: function (dt) {
      if (!this.cv) return;
      var f = fit(this.cv), g = f.g, w = f.w, h = f.h;
      if (this.playing) { this.t = Math.min(1, this.t + dt * 1.4); if (this.t >= 1) this.playing = false; }
      var x0 = 40, y0 = h - 34, aw = w - 56, ah = h - 56;
      var lo = 1.3, hi = 1.72;
      var Y = function (v) { return y0 - ah * (v - lo) / (hi - lo); };
      grid(g, x0, y0, aw, ah, 5, 4);
      axes(g, x0, y0, aw, ah, { x: '', y: 'γ' });
      [1.3, 1.4, 1.5, 1.6, 1.7].forEach(function (v) {
        txt(g, fmt(v, 1), x0 - 6, Y(v) + 3, { align: 'right', size: 10, color: COL.text });
      });
      var slot = aw / this.rows.length, bw = Math.min(26, slot * .3);
      this.rows.forEach(function (r, i) {
        var cx = x0 + slot * (i + .5);
        var ease = global.Util.clamp(this.t * 1.25 - i * .12, 0, 1);
        var e = 1 - Math.pow(1 - ease, 3);
        g.fillStyle = COL.accent; g.fillRect(cx - bw - 2, Y(lo + (r.th - lo) * e), bw, (Y(lo) - Y(lo + (r.th - lo) * e)));
        g.fillStyle = COL.gold; g.fillRect(cx + 2, Y(lo + (r.gm - lo) * e), bw, (Y(lo) - Y(lo + (r.gm - lo) * e)));
        txt(g, r.gas, cx, y0 + 15, { align: 'center', color: COL.bright, size: 11, bold: true });
        txt(g, r.kind === 'mono' ? 'mono' : 'biat', cx, y0 + 27, { align: 'center', color: COL.text, size: 9 });
      }, this);
      /* linia mediei teoretice */
      g.setLineDash([6, 4]); g.strokeStyle = 'rgba(36,60,64,.35)';
      g.beginPath(); g.moveTo(x0, Y(5 / 3)); g.lineTo(x0 + aw, Y(5 / 3)); g.stroke();
      g.beginPath(); g.moveTo(x0, Y(7 / 5)); g.lineTo(x0 + aw, Y(7 / 5)); g.stroke();
      g.setLineDash([]);
      txt(g, '5/3', x0 + aw - 6, Y(5 / 3) - 6, { align: 'right', size: 10, color: COL.text });
      txt(g, '7/5', x0 + aw - 6, Y(7 / 5) - 6, { align: 'right', size: 10, color: COL.text });
    }
  };

  /* ------------------------------ registry ------------------------------- */
  var ALL = {
    mol: MolDemo, izocor: Izocor, izobar: Izobar, izoterm: Izoterm,
    adiabat: Adiabat, synth: Synth, ratio: Ratio, politrop: Politrop, chart141: Chart141
  };
  var active = {};   /* nume -> true dacă e vizibil */

  function initAll() {
    Object.keys(ALL).forEach(function (k) { ALL[k].init(); });
    /* canvas-urile din secțiuni ascunse se desenează o dată, pentru layout */
    Object.keys(ALL).forEach(function (k) { try { ALL[k].draw(0); } catch (e) { } });
  }
  function frame(dt) {
    Object.keys(active).forEach(function (k) {
      if (!active[k]) return;
      try {
        var out = ALL[k].draw(dt);
        if (out) ALL[k].out = out;
      } catch (e) { /* un canvas lipsă nu oprește bucla */ }
    });
  }

  global.Sims = {
    init: initAll,
    frame: frame,
    resize: function(){document.querySelectorAll("canvas").forEach(function(cv){delete cv.dataset.dpr;});frame(0);},
    show: function (name, on) { active[name] = on; },
    get: function (name) { return ALL[name]; },
    colors: COL,
    consts: { R: R, T0: T0 }
  };
})(window);
