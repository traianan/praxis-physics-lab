/* ==========================================================================
   sims.js — demonstrațiile interactive pentru subcapitolul 1.5
   Canvas 2D, fără nicio bibliotecă externă.
   Fiecare demo are starea lui, o funcție draw(dt) și rulează doar când
   secțiunea respectivă este vizibilă. Fiecare demo lasă în .out valorile pe
   care app.js le scrie în câmpurile de lectură.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------ constante ------------------------------ */
  var CG = 2090,        /* căldura specifică a gheții, J/(kg·K) */
    CA = 4181,          /* căldura specifică a apei */
    CST = 2010,         /* căldura specifică a aburului */
    LT = 3.34e5,        /* λ_t gheață, J/kg (Tabelul 1.5.1.2) */
    LT_EX = 3.34e5,     /* λ_t folosit în Ex. 1.5.1.1 */
    LV100 = 2.26e6,     /* λ_v apă la 100 °C */
    LV0 = 2.50e6,       /* λ_v apă la 0 °C */
    T_TR = 273.16,      /* punctul triplu al apei, K */
    P_TR = 611,         /* punctul triplu, Pa */
    PA_PER_TORR = 101325 / 760;

  /* ------------------- presiunea vaporilor saturanți --------------------- */
  /* Antoine pentru apă, în tori. Ramura 1: 1…99 °C, ramura 2: 99…374 °C. */
  function psatW(tC) {
    if (tC <= 99) return Math.pow(10, 8.07131 - 1730.63 / (233.426 + tC));
    return Math.pow(10, 8.14019 - 1810.94 / (244.485 + tC));
  }
  /* temperatura de saturație (°C) pentru o presiune dată, în tori */
  function tsatW(torr) {
    var l = Math.log(torr) / Math.LN10;
    if (l <= 2.8808) return 1730.63 / (8.07131 - l) - 233.426;
    return 1810.94 / (8.14019 - l) - 244.485;
  }
  /* eter etilic: Clausius–Clapeyron ancorat pe 34,6 °C (760 tori) */
  function psatEther(TK) {
    return 760 * Math.exp(-(27200 / 8.314) * (1 / TK - 1 / 307.75));
  }
  var Phys = {
    psatW: psatW, tsatW: tsatW, psatEther: psatEther,
    CG: CG, CA: CA, CST: CST, LT: LT, LV100: LV100, LV0: LV0,
    T_TR: T_TR, P_TR: P_TR, PA_PER_TORR: PA_PER_TORR
  };

  var COL = {
    accent: '#3b82f6', accent2: '#60a5fa', gold: '#f59e0b', cyan: '#22d3ee',
    violet: '#a78bfa', green: '#10b981', red: '#f43f5e', ice: '#93c5fd',
    grid: '#1b2436', axis: '#475569', text: '#9ca3af', bright: '#e5e7eb',
    fill: 'rgba(59,130,246,.22)', fillGold: 'rgba(245,158,11,.20)',
    hg: '#8d99ab', hgDark: '#4b5563', ether: '#22d3ee'
  };

  /* ---------------------------- utilitare canvas ------------------------- */
  function fit(cv){return global.PraxisApplicationsCanvas.prepare(cv);}
  function txt(g, s, x, y, opt) {
    opt = opt || {};
    g.save();
    g.font = (opt.bold ? '600 ' : '') + Math.max(12,opt.size||12) + 'px "Consolas","Segoe UI",monospace';
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
    g.beginPath();
    g.moveTo(x0, y0 - h); g.lineTo(x0 - 3.5, y0 - h + 8); g.lineTo(x0 + 3.5, y0 - h + 8); g.closePath();
    g.moveTo(x0 + w, y0); g.lineTo(x0 + w - 8, y0 - 3.5); g.lineTo(x0 + w - 8, y0 + 3.5); g.closePath();
    g.fillStyle = COL.axis; g.fill();
    if (lab) {
      txt(g,lab.y,x0,y0-h-10,{color:COL.bright,bold:true});
      txt(g, lab.x, x0 + w - 2, y0 + 36, { align: 'right', color: COL.bright, bold: true });
    }
  }
  function grid(g, x0, y0, w, h, nx, ny) {
    g.strokeStyle = COL.grid; g.lineWidth = 1; g.beginPath();
    for (var i = 1; i <= nx; i++) { var x = x0 + w * i / nx; g.moveTo(x, y0); g.lineTo(x, y0 - h); }
    for (var j = 1; j <= ny; j++) { var y = y0 - h * j / ny; g.moveTo(x0, y); g.lineTo(x0 + w, y); }
    g.stroke();
  }
  function dash(g, x1, y1, x2, y2, color) {
    g.save(); g.setLineDash([5, 4]); g.strokeStyle = color || 'rgba(36,60,64,.28)';
    g.lineWidth = 1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
  }
  function fmt(n, d) { return global.Util.num(n, d === undefined ? 2 : d); }
  function energyJ(J) {
    if (Math.abs(J) >= 1e6) return fmt(J / 1e6, 3) + ' MJ';
    if (Math.abs(J) >= 1e3) return fmt(J / 1e3, 2) + ' kJ';
    return fmt(J, 0) + ' J';
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* =========================== 1. CURBA DE ÎNCĂLZIRE ====================== */
  var Inc = {
    P: 250, m: 0.1, amorph: false, E: 0, run: false, scale: 30, out: null,
    /* energia totală până la 100 °C */
    Emax: function () {
      return this.m * (CG * 20 + (this.amorph ? 0.55 * LT : LT) + CA * (this.amorph?60:100));
    },
    /* temperatura corespunzătoare unei energii primite */
    Tof: function (E) {
      var m = this.m, e1 = m * CG * 20, e2 = m * (this.amorph ? 0.55 * LT : LT);
      if (this.amorph) {
        /* substanța amorfă se înmoaie treptat: căldura specifică crește în zona 0…40 °C */
        var e3 = m * CA * 60;
        if (E <= e1) return -20 + E / (m * CG);
        var u = (E - e1) / e2;                       /* 0…1 prin zona moale */
        if (E <= e1 + e2) return u * 40 - Math.sin(u * Math.PI) * 6;
        if (E <= e1 + e2 + e3) return 40 + (E - e1 - e2) / (m * CA);
        return 100;
      }
      if (E <= e1) return -20 + E / (m * CG);
      if (E <= e1 + e2) return 0;
      if (E <= e1 + e2 + m * CA * 100) return (E - e1 - e2) / (m * CA);
      return 100;
    },
    frac: function (E) {
      var e1 = this.m * CG * 20, e2 = this.m * LT;
      if (E <= e1) return 0;
      if (E >= e1 + e2) return 1;
      return (E - e1) / e2;
    },
    set: function (o) {
      if (o.P !== undefined) this.P = o.P;
      if (o.m !== undefined) this.m = o.m;
      if (o.amorph !== undefined) this.amorph = o.amorph;
      this.report();
    },
    reset: function () { this.E = 0; this.run = false; this.report(); },
    stateKey: function () {
      var f = this.frac(this.E), T = this.Tof(this.E);
      if (this.amorph) return T > 25 ? 'st.lichid' : (T > -5 ? 'st.amorf' : 'st.solid');
      if (f > 0 && f < 1) return 'inc.s2';
      if (f >= 1) return 'inc.s3';
      return 'inc.s1';
    },
    report: function () {
      var f = this.frac(this.E);
      this.out = {
        T: this.Tof(this.E), Q: this.E, frac: f,
        state: this.stateKey(), done: this.E >= this.Emax()
      };
      return this.out;
    },
    draw: function (dt) {
      var c = fit(document.getElementById('incCanvas')), g = c.g, W = c.w, H = c.h;
      if (this.run) {
        this.E += this.P * this.scale * dt;
        var em = this.Emax();
        if (this.E >= em) { this.E = em; this.run = false; }
      }
      this.report();
      var x0 = 46, y0 = H - 54, aw = W - x0 - 18, ah = H - 88;
      grid(g, x0, y0, aw, ah, 6, 4);
      axes(g, x0, y0, aw, ah, { x: 't [s]', y: 'T [°C]' });
      var Y = function (T) { return y0 - (T + 25) / 125 * ah; };
      /* axa temperaturii */
      [-20, 0, 20, 40, 60, 80, 100].forEach(function (T) {
        g.strokeStyle = T === 0 ? 'rgba(56,189,248,.35)' : COL.grid;
        g.beginPath(); g.moveTo(x0, Y(T)); g.lineTo(x0 + aw, Y(T)); g.stroke();
        txt(g, String(T), x0 - 6, Y(T) + 3, { align: 'right', size: 9 });
      });
      var em = this.Emax(), X = function (E) { return x0 + E / em * aw; };
      /* curba completă, șters */
      g.save(); g.strokeStyle = 'rgba(148,163,184,.35)'; g.lineWidth = 1.4;
      g.setLineDash([3, 3]); g.beginPath();
      for (var e = 0; e <= em; e += em / 120) {
        var px = X(e), py = Y(this.Tof(e));
        if (e === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke(); g.restore();
      /* curba parcursă */
      var cur = this.E;
      g.strokeStyle = this.amorph ? COL.violet : COL.cyan; g.lineWidth = 2.6;
      g.beginPath();
      for (var e2 = 0; e2 <= cur; e2 += Math.max(1, em / 200)) {
        var qx = X(e2), qy = Y(this.Tof(e2));
        if (e2 === 0) g.moveTo(qx, qy); else g.lineTo(qx, qy);
      }
      g.lineTo(X(cur), Y(this.Tof(cur))); g.stroke();
      /* marcajele A și B, doar la cristalin */
      if (!this.amorph) {
        var e1 = this.m * CG * 20, e2b = e1 + this.m * LT;
        dash(g, x0, Y(0), X(e2b), Y(0));
        txt(g,'T_t = 0 °C',X(e1)*.2+X(e2b)*.8,Y(0)+22,{align:'center',color:COL.bright,size:12});
        [['A', e1], ['B', e2b]].forEach(function (p) {
          g.fillStyle = COL.gold; g.beginPath(); g.arc(X(p[1]), Y(0), 3.4, 0, 7); g.fill();
          txt(g, p[0], X(p[1]) + 5, Y(0) - 6, { color: COL.gold, bold: true, size: 11 });
        });
      }
      /* punctul curent */
      var cx = X(cur), cy = Y(this.Tof(cur));
      g.fillStyle = this.amorph ? COL.violet : COL.cyan;
      g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.stroke();
      txt(g, (this.Tof(cur) >= 0 ? '+' : '') + fmt(this.Tof(cur), 1) + ' °C',
        Math.min(cx + 9, W - 52), cy - 8, { color: COL.bright, size: 10, bold: true });
      txt(g, this.amorph ? 'b)' : 'a)', x0 + 6, y0 - ah + 12, { color: COL.bright, bold: true });
      txt(g, global.I18N.t(this.amorph ? 'top.demo.amorf' : 'top.demo.crist'),
        x0 + 24, y0 - ah + 12, { size: 10 });
      /* tic-uri sonore pe platou: ruperea legăturilor de rețea */
      if (this.run && !this.amorph && this.frac(cur) > 0 && this.frac(cur) < 1) {
        global.Sound.beat('crack', 2.6, 0.3 + 0.7 * this.frac(cur));
      }
      return this.out;
    },
    init: function () { this.report(); }
  };

  /* ========================= 2. BUGETUL DE CĂLDURĂ ======================== */
  var Etapa = {
    Tf: 100, m: 0.1, shown: [0, 0, 0, 0, 0], out: null,
    stages: function () {
      var m = this.m, Tf = this.Tf, lim;
      lim = Math.min(Tf, 0);
      var s1 = m * CG * (lim + 10);
      var s2 = Tf > 0 ? m * LT : 0;
      var s3 = Tf > 0 ? m * CA * (Math.min(Tf, 100) - 0) : 0;
      var s4 = Tf > 100 ? m * LV100 : 0;
      var s5 = Tf > 100 ? m * CST * (Tf - 100) : 0;
      return [Math.max(0, s1), s2, s3, s4, s5];
    },
    stateKey: function () {
      var Tf = this.Tf;
      if (Tf < 0) return 'etapa.st.gheata';
      if (Tf === 0) return 'etapa.st.gheata';
      if (Tf < 100) return 'etapa.st.apa';
      if (Tf === 100) return 'etapa.st.apa';
      return 'etapa.st.abur';
    },
    report: function () {
      var s = this.stages(), tot = s[0] + s[1] + s[2] + s[3] + s[4];
      var mx = 0, mi = 0;
      s.forEach(function (v, i) { if (v > mx) { mx = v; mi = i; } });
      this.out = { Q: tot, parts: s, state: this.stateKey(), max: mi, maxV: mx };
      return this.out;
    },
    draw: function (dt) {
      var c = fit(document.getElementById('etapaCanvas')), g = c.g, W = c.w, H = c.h;
      var s = this.stages(), tot = s.reduce(function (a, b) { return a + b; }, 0);
      var mx = Math.max.apply(null, s) || 1;
      for (var i = 0; i < 5; i++) this.shown[i] += (s[i] / mx - this.shown[i]) * Math.min(1, dt * 6);
      var x0 = 40, y0 = H - 54, aw = W - x0 - 14, ah = H - 88;
      grid(g, x0, y0, aw, ah, 5, 4);
      axes(g, x0, y0, aw, ah, { x: '', y: 'Q' });
      var cols = ['#60a5fa', '#22d3ee', '#f59e0b', '#f43f5e', '#a78bfa'];
      var bw = aw / 5 * 0.56;
      for (var k = 0; k < 5; k++) {
        var bx = x0 + aw * (k + 0.5) / 5 - bw / 2;
        var bh = Math.max(0, this.shown[k]) * ah;
        g.fillStyle = cols[k] + 'cc';
        g.fillRect(bx, y0 - bh, bw, bh);
        g.fillStyle = cols[k]; g.fillRect(bx, y0 - bh, bw, Math.min(3, bh));
        txt(g, (k + 1), bx + bw / 2, y0 + 13, { align: 'center', color: COL.bright, size: 10, bold: true });
        if (s[k] > 0) txt(g, energyJ(s[k]), bx + bw / 2, y0 - bh - 5, { align: 'center', size: 8.5, color: cols[k] });
      }
      txt(g, 'Q = ' + energyJ(tot), W - 14, y0 - ah - 8, { align: 'right', size: 10, bold: true, color: COL.gold });
      this.report();
      return this.out;
    },
    init: function () { this.report(); }
  };

  /* ===================== 3. ANOMALIA VOLUMULUI (V–t) ====================== */
  var Anom = {
    apa: false, p: 1, out: null,
    SLOPE_NORMAL: 0.0355,   /* K/atm, ceară/parafină */
    SLOPE_APA: -0.0075,     /* K/atm, gheață */
    tm: function () { return (this.apa ? 0 : 52) + (this.apa ? this.SLOPE_APA : this.SLOPE_NORMAL) * (this.p - 1); },
    dv: function () { return this.apa ? -8.3 : 9.5; },
    report: function () {
      this.out = { tm: this.tm(), dv: this.dv(), shift: this.tm() - (this.apa ? 0 : 52) };
      return this.out;
    },
    draw: function () {
      var c = fit(document.getElementById('anomCanvas')), g = c.g, W = c.w, H = c.h;
      var tm = this.tm(), dv = this.dv() / 100;
      var x0 = 44, y0 = H - 54, aw = W - x0 - 20, ah = H - 88;
      var tmin = (this.apa ? 0 : 52) - 22, tmax = (this.apa ? 0 : 52) + 22;
      var X = function (t) { return x0 + (t - tmin) / (tmax - tmin) * aw; };
      var Y = function (v) { return y0 - (v - 0.86) / 0.3 * ah; };
      grid(g, x0, y0, aw, ah, 6, 4);
      axes(g, x0, y0, aw, ah, { x: 't [°C]', y: 'V/V_s' });
      dash(g, X(tm), y0, X(tm), y0 - ah);
      txt(g,'t_t',X(tm)+4,y0+18,{color:COL.bright,size:12});
      /* ramura solidă și cea lichidă, cu saltul la tm */
      var vSolid = function (t) { return 1 + (t - tm) * 0.0016; };
      var vLich = function (t) { return 1 + dv + (t - tm) * 0.0028; };
      g.strokeStyle = COL.cyan; g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(X(tmin), Y(vSolid(tmin))); g.lineTo(X(tm), Y(vSolid(tm))); g.stroke();
      g.beginPath();
      g.moveTo(X(tm), Y(vLich(tm))); g.lineTo(X(tmax), Y(vLich(tmax))); g.stroke();
      g.strokeStyle = COL.gold; g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(X(tm), Y(vSolid(tm))); g.lineTo(X(tm), Y(vLich(tm))); g.stroke();
      /* săgețile care arată sensul încălzirii / răcirii, ca în manual */
      function arr(x1, y1, x2, y2, col) {
        g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        var a = Math.atan2(y2 - y1, x2 - x1);
        g.beginPath(); g.moveTo(x2, y2);
        g.lineTo(x2 - 7 * Math.cos(a - 0.4), y2 - 7 * Math.sin(a - 0.4));
        g.lineTo(x2 - 7 * Math.cos(a + 0.4), y2 - 7 * Math.sin(a + 0.4));
        g.closePath(); g.fill();
      }
      arr(X(tm - 16), Y(vSolid(tm - 16)), X(tm - 6), Y(vSolid(tm - 6)), COL.cyan);
      arr(X(tm + 6), Y(vLich(tm + 6)), X(tm + 16), Y(vLich(tm + 16)), COL.cyan);
      arr(X(tm - 6), Y(vLich(tm - 6) - 0.02), X(tm - 16), Y(vLich(tm - 16) - 0.02), 'rgba(148,163,184,.8)');
      /* eticheta a) / b) */
      txt(g, this.apa ? 'b)' : 'a)', x0 + 8, y0 - ah + 14, { color: COL.bright, bold: true });
      txt(g, global.I18N.t(this.apa ? 'ano.demo.apa' : 'ano.demo.normal'),
        x0 + 26, y0 - ah + 14, { size: 10 });
      txt(g, (dv > 0 ? '+' : '') + fmt(dv * 100, 1) + ' %', X(tm) + 8,
        Y(1 + dv / 2), { color: COL.gold, size: 10, bold: true });
      this.report();
      return this.out;
    },
    init: function () { this.report(); }
  };

  /* ======================= 4. BARELE TABELELOR 1.5.1.1/2 ================== */
  /* Substanțele din cele două tabele ale manualului; „null” = nu apare. */
  var SUBST = [
    { id: 'mercur', ro: 'Mercur', en: 'Mercury', t: -39, lam: 11 },
    { id: 'gheata', ro: 'Gheață', en: 'Ice', t: 0, lam: 334, apa: true },
    { id: 'plumb', ro: 'Plumb', en: 'Lead', t: 327, lam: 23.1 },
    { id: 'cupru', ro: 'Cupru', en: 'Copper', t: null, lam: 214 },
    { id: 'argint', ro: 'Argint', en: 'Silver', t: 960, lam: null },
    { id: 'fier', ro: 'Fier', en: 'Iron', t: 1530, lam: 270 }
  ];
  var Bars = {
    mode: 't', sel: 'gheata', grow: 0, out: null,
    values: function () {
      var self = this;
      return SUBST.map(function (s) { return self.mode === 't' ? s.t : s.lam; });
    },
    draw: function (dt) {
      var c = fit(document.getElementById('barCanvas')), g = c.g, W = c.w, H = c.h;
      var v = this.values(), pos = v.filter(function (x) { return x !== null; });
      var lo = Math.min(0, Math.min.apply(null, pos)), hi = Math.max.apply(null, pos);
      this.grow += (1 - this.grow) * Math.min(1, dt * 4);
      var x0 = 52, y0 = H - 54, aw = W - x0 - 16, ah = H - 88;
      var Y = function (val) { return y0 - (val - lo) / (hi - lo) * ah; };
      grid(g, x0, y0, aw, ah, 6, 4);
      axes(g, x0, y0, aw, ah, { x: '', y: this.mode === 't' ? '°C' : 'kJ/kg' });
      if (lo < 0) { g.strokeStyle = 'rgba(36,60,64,.25)'; g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x0 + aw, Y(0)); g.stroke(); }
      var bw = aw / SUBST.length * 0.56, self = this;
      SUBST.forEach(function (s, i) {
        var val = v[i], bx = x0 + aw * (i + 0.5) / SUBST.length - bw / 2;
        var on = self.sel === s.id;
        if (val === null) {
          g.save(); g.setLineDash([3, 3]); g.strokeStyle = 'rgba(148,163,184,.4)';
          g.strokeRect(bx, Y(hi * 0.55), bw, Y(hi * 0.2) - Y(hi * 0.55)); g.restore();
          txt(g, '—', bx + bw / 2, Y(hi * 0.38), { align: 'center', size: 10 });
        } else {
          var yv = Y(lo + (val - lo) * self.grow), y00 = Y(Math.max(0, lo));
          var grad = g.createLinearGradient(0, yv, 0, y00);
          if (on) { grad.addColorStop(0, COL.gold); grad.addColorStop(1, 'rgba(245,158,11,.25)'); }
          else if (s.apa) { grad.addColorStop(0, COL.cyan); grad.addColorStop(1, 'rgba(34,211,238,.18)'); }
          else { grad.addColorStop(0, COL.accent2); grad.addColorStop(1, 'rgba(96,165,250,.16)'); }
          g.fillStyle = grad;
          g.fillRect(bx, Math.min(yv, y00), bw, Math.abs(y00 - yv));
          g.strokeStyle = on ? '#fff' : 'rgba(36,60,64,.25)'; g.lineWidth = on ? 1.6 : 1;
          g.strokeRect(bx, Math.min(yv, y00), bw, Math.abs(y00 - yv));
          txt(g, fmt(val, val < 10 ? 1 : 0), bx + bw / 2, yv - 7,
            { align: 'center', size: 9, color: on ? COL.gold : COL.text, bold: on });
        }
        txt(g, global.I18N.lang === 'ro' ? s.ro : s.en, bx + bw / 2, y0 + 14,
          { align: 'center', size: 9, color: on ? COL.bright : COL.text, bold: on });
      });
      return null;
    },
    init: function () { }
  };


  /* ==================== 5. TUBURILE TORRICELLI CU ETER ==================== */
  var D_SAT = 40;          /* doza care saturează spațiul din tub, % */
  var TUBE_L = 90;         /* lungimea tubului deasupra cuvetii, cm */
  var Tub = {
    d: 18, TK: 293, doses: [0, 15, 30, 52], wasSat: false, out: null,
    pOf: function (d) {
      var pm = psatEther(this.TK);
      return pm * Math.min(1, d / D_SAT);
    },
    report: function () {
      var pm = psatEther(this.TK), p = this.pOf(this.d);
      var reg = this.d <= 0.5 ? 'vid.reg.vid' : (p < pm * 0.995 ? 'vid.reg.nesat' : 'vid.reg.sat');
      this.out = { p: p * PA_PER_TORR / 1000, pm: pm * PA_PER_TORR / 1000, reg: reg, h: (760 - p) / 10 };
      return this.out;
    },
    draw: function () {
      var c = fit(document.getElementById('tubCanvas')), g = c.g, W = c.w, H = c.h;
      var bathY = H - 44, topY = 22, scale = (bathY - topY) / TUBE_L;
      /* cuva cu mercur */
      g.fillStyle = 'rgba(141,153,171,.35)';
      g.fillRect(14, bathY, W - 28, 30);
      g.strokeStyle = COL.hg; g.lineWidth = 1.4;
      g.strokeRect(14, bathY, W - 28, 30);
      var doses = this.doses.concat([this.d]);
      var self = this;
      doses.forEach(function (d, i) {
        var x = 44 + i * (W - 100) / 5;
        var p = self.pOf(d), pm = psatEther(self.TK);
        var h = (760 - p) / 10;                      /* coloana de mercur, cm */
        var hy = bathY - h * scale;
        var active = i === doses.length - 1;
        /* sticla */
        g.strokeStyle = active ? COL.bright : 'rgba(148,163,184,.55)';
        g.lineWidth = active ? 1.8 : 1.2;
        g.beginPath();
        g.moveTo(x - 7, bathY + 12); g.lineTo(x - 7, topY + 8);
        g.quadraticCurveTo(x - 7, topY, x, topY);
        g.quadraticCurveTo(x + 7, topY, x + 7, topY + 8);
        g.lineTo(x + 7, bathY + 12); g.stroke();
        /* mercur */
        g.fillStyle = active ? '#a3aec0' : COL.hg;
        g.fillRect(x - 6, hy, 12, bathY - hy + 10);
        /* vapori (puncte) */
        g.fillStyle = active ? 'rgba(34,211,238,.5)' : 'rgba(148,163,184,.35)';
        for (var k = 0; k < 16; k++) {
          var yy = topY + 8 + ((k * 37 + i * 13) % Math.max(4, (hy - topY - 10)));
          g.fillRect(x - 4 + (k % 4) * 2.4, yy, 1.6, 1.6);
        }
        /* lichid eter în exces, la partea închisă */
        if (p >= pm * 0.995 && d > D_SAT) {
          var th = Math.min(16, (d - D_SAT) * 0.28);
          g.fillStyle = 'rgba(34,211,238,.75)';
          g.fillRect(x - 6, topY + 4, 12, th);
          txt(g, 'eter', x + 10, topY + 4 + th / 2 + 3, { size: 8, color: COL.cyan });
        }
        /* linia nivelului pentru tubul activ */
        if (active) {
          dash(g, 14, hy, x - 8, hy, 'rgba(245,158,11,.6)');
          txt(g, fmt(h, 1) + ' cm', 16, 40, { size: 9, color: COL.gold });
        }
        txt(g, String(i + 1), x, bathY + 34, { align: 'center', size: 10, color: active ? COL.gold : COL.text, bold: active });
      });
      txt(g, '76 cm', W - 16, bathY - 76 * scale - 3, { align: 'right', size: 8.5 });
      dash(g, W - 60, bathY - 76 * scale, W - 8, bathY - 76 * scale, 'rgba(148,163,184,.35)');
      txt(g, 'p_atm = 760 tori', 16, 14, { size: 9 });
      txt(g, 'T = ' + fmt(this.TK - 273.15, 1) + ' °C', W - 16, 14, { align: 'right', size: 9, color: COL.bright });
      var pm = psatEther(this.TK);
      if (this.d > D_SAT && !this.wasSat) global.Sound.play('chime', 1);
      if (this.d > D_SAT && this.d < 100) global.Sound.beat('whoosh', 0.35, 1);
      this.wasSat = this.d > D_SAT;
      return this.report();
    },
    init: function () { this.report(); }
  };

  /* ================== 6. ECOUILIBRUL DINAMIC LICHID–VAPORI ================ */
  var Echi = {
    TK: 300, V: 70, n: 0, esc: 0, ret: 0, acc: 0, parts: [], out: null,
    target: function () {
      /* p_sat·V = n·R·T ⇒ n_eq ∝ p_sat(T)·V/T */
      return 10 * psatW(this.TK - 273.15) * this.V / this.TK;
    },
    rateOut: function () { return 18 + 130 * (this.TK - 260) / 120; },
    report: function () {
      var t = this.target();
      this.out = { esc: this.rateOut(), ret: this.rateOut() * this.n / t, ratio: this.n / t, n: this.n };
      return this.out;
    },
    draw: function (dt) {
      var c = fit(document.getElementById('echiCanvas')), g = c.g, W = c.w, H = c.h;
      var bx = 40, by = 60, bw = W - 70, bh = H - 88;
      var gasH = bh * this.V / 100;
      var liqY = by + bh - Math.max(26, bh - gasH);
      /* vas */
      g.strokeStyle = 'rgba(148,163,184,.6)'; g.lineWidth = 1.6;
      g.strokeRect(bx, by, bw, bh);
      /* lichid */
      var grad = g.createLinearGradient(0, liqY, 0, by + bh);
      grad.addColorStop(0, 'rgba(34,211,238,.5)'); grad.addColorStop(1, 'rgba(14,116,144,.75)');
      g.fillStyle = grad; g.fillRect(bx + 2, liqY, bw - 4, by + bh - liqY);
      g.strokeStyle = COL.cyan; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(bx + 2, liqY); g.lineTo(bx + bw - 2, liqY); g.stroke();
      txt(g, global.I18N.t('home.state.lichid').toLowerCase(), bx + 6, by + bh - 6, { size: 9, color: COL.bright });
      txt(g, global.I18N.t('st.vapori'), bx + 6, by - 14, { size: 9 });
      /* populația de molecule */
      var t = this.target();
      this.n += (t - this.n) * Math.min(1, dt * 1.6);
      var want = Math.min(240, Math.round(this.n));
      while (this.parts.length < want) this.parts.push(this.spawn(bx, by, bw, liqY));
      while (this.parts.length > want) this.parts.pop();
      var sp = 0.6 + 1.9 * (this.TK - 260) / 120;
      var self = this;
      this.parts.forEach(function (p) {
        p.x += p.vx * sp * dt * 60; p.y += p.vy * sp * dt * 60;
        if(p.x<bx+4){p.x=bx+4;p.vx=Math.abs(p.vx);}else if(p.x>bx+bw-4){p.x=bx+bw-4;p.vx=-Math.abs(p.vx);}
        if(p.y<by+4){p.y=by+4;p.vy=Math.abs(p.vy);}
        if(p.y>liqY-4){p.y=liqY-4;p.vy=-Math.abs(p.vy);}
        g.fillStyle = 'rgba(23,114,132,.9)';
        g.beginPath(); g.arc(p.x, p.y, 2.4, 0, 7); g.fill();
      });
      /* săgețile de schimb */
      this.acc += dt;
      var e = this.rateOut(), r = e * this.n / t;
      function arr(x1, y1, x2, y2, col, lab) {
        g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        var a = Math.atan2(y2 - y1, x2 - x1);
        g.beginPath(); g.moveTo(x2, y2);
        g.lineTo(x2 - 8 * Math.cos(a - 0.42), y2 - 8 * Math.sin(a - 0.42));
        g.lineTo(x2 - 8 * Math.cos(a + 0.42), y2 - 8 * Math.sin(a + 0.42));
        g.closePath(); g.fill();
        /* Arrowheads already show the direction; omit redundant arrow glyphs. */
      }
      arr(bx + bw * 0.3, liqY - 6, bx + bw * 0.3, liqY - 30, COL.green, '↑');
      arr(bx + bw * 0.66, liqY - 30, bx + bw * 0.66, liqY - 6, COL.gold, '↓');
      txt(g, fmt(e, 0) + '/s', bx + bw * 0.3, liqY + 14, { align: 'center', size: 9, color: COL.green });
      txt(g, fmt(r, 0) + '/s', bx + bw * 0.66, liqY + 14, { align: 'center', size: 9, color: COL.gold });
      txt(g, 'V = ' + fmt(this.V, 0) + ' %', W - 12, 20, { align: 'right', size: 12 });
      txt(g, 'p/p_m = ' + fmt(this.n / t, 2), W - 12, 42, { align: 'right', size: 12, color: COL.bright });
      if (this.acc > 0.4) {
        this.acc = 0;
        global.Sound.beat('tick', Math.min(9, e / 14), (this.TK - 260) / 120);
      }
      return this.report();
    },
    spawn: function (bx, by, bw, liqY) {
      return {
        x: rnd(bx + 6, bx + bw - 6), y: rnd(by + 6, Math.max(by + 8, liqY - 6)),
        vx: rnd(-1, 1), vy: rnd(-1, 1)
      };
    },
    init: function () { this.n = this.target(); this.report(); }
  };

  /* ========================= 7. EVAPORAREA (AE, p.43) ===================== */
  var Evap = {
    T0: 310, area: 50, wind: 20, run: false, T: 310, lost: 0, parts: [],
    drops: [], rate: 0, acc: 0, out: null,
    amb: 300, mass: 0.05,
    reset: function () { this.T = this.T0; this.lost = 0; this.parts = []; this.drops = []; this.rate = 0; this.run = false; this.report(); },
    report: function () {
      this.out = { T: this.T, rate: this.run?this.rate*this.mass/260*1000:0, lost: this.lost, cool: this.T0 - this.T };
      return this.out;
    },
    draw: function (dt) {
      var c = fit(document.getElementById('evapCanvas')), g = c.g, W = c.w, H = c.h;
      var bathY = H - 26, topL = 150;
      var bw = 70 + this.area * 2.6, bx = (W - bw) / 2;
      /* viteza de evaporare: lege Maxwell–Boltzmann, proporțională cu aria */
      var f = Math.exp(-(3800 / this.T)) * (bw / 200) * (1 + this.wind / 60);
      if (this.run) {
        this.rate = 140000 * f;
        var remaining=Math.max(1e-6,this.mass-this.lost),dm=Math.min(remaining,this.rate*dt*this.mass/260);
        this.T += (this.amb-this.T)*.22*dt - 2.45e6*dm/(remaining*4181);
        this.lost += dm;
        if(this.T<=273.16||this.lost>=this.mass-1e-6){this.T=Math.max(273.16,this.T);this.run=false;}
        this.acc += dt;
        if (this.acc > 1 / Math.max(1, this.rate)) {
          this.acc = 0;
          this.drops.push({ x: rnd(bx + 8, bx + bw - 8), y: topL, vx: rnd(-.3, .3) + this.wind / 120, vy: -rnd(.6, 1.4), life: 1 });
        }
      } else { this.rate = 1400 * f * 0; }
      /* lichidul */
      var grad = g.createLinearGradient(0, topL, 0, bathY);
      var cold = Math.max(0, Math.min(1, (this.amb - this.T) / 40));
      grad.addColorStop(0, 'rgba(' + Math.round(34 + 120 * (1 - cold)) + ',211,238,.55)');
      grad.addColorStop(1, 'rgba(14,116,144,.8)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(bx, topL); g.lineTo(bx + bw, topL); g.lineTo(bx + bw - 6, bathY); g.lineTo(bx + 6, bathY);
      g.closePath(); g.fill();
      g.strokeStyle = COL.cyan; g.lineWidth = 1.6; g.stroke();
      /* moleculele din lichid, mișcându-se haotic */
      if (!this.parts.length) for (var i = 0; i < 120; i++) this.parts.push({ x: rnd(bx + 10, bx + bw - 10), y: rnd(topL + 8, bathY - 8), vx: rnd(-1, 1), vy: rnd(-1, 1) });
      var sp = 0.35 + 1.5 * (this.T - 240) / 140, self = this;
      this.parts.forEach(function (p) {
        p.x += p.vx * sp * dt * 60; p.y += p.vy * sp * dt * 60;
        if (p.x < bx + 8) { p.x = bx + 8; p.vx *= -1; }
        if (p.x > bx + bw - 8) { p.x = bx + bw - 8; p.vx *= -1; }
        if (p.y < topL + 6) { p.y = topL + 6; p.vy *= -1; }
        if (p.y > bathY - 6) { p.y = bathY - 6; p.vy *= -1; }
        var hot = Math.abs(p.vx) + Math.abs(p.vy) > 1.6;
        g.fillStyle = hot ? 'rgba(250,204,21,.95)' : 'rgba(103,232,249,.8)';
        g.beginPath(); g.arc(p.x, p.y, hot ? 2.8 : 2.2, 0, 7); g.fill();
      });
      /* moleculele plecate */
      self.drops.forEach(function (d, k) {
        d.x += d.vx * dt * 60; d.y += d.vy * dt * 60; d.life -= dt * 0.5;
        g.fillStyle = 'rgba(250,204,21,' + Math.max(0, d.life) * 0.9 + ')';
        g.beginPath(); g.arc(d.x, d.y, 2.6, 0, 7); g.fill();
      });
      self.drops = self.drops.filter(function (d) { return d.life > 0 && d.y > -10; });
      /* termometrul */
      var tx = 16, ty = 40, th = H - 92;
      g.strokeStyle = 'rgba(226,232,240,.7)'; g.lineWidth = 1.2;
      g.strokeRect(tx, ty, 12, th);
      g.beginPath(); g.arc(tx + 6, ty + th + 8, 8, 0, 7); g.stroke();
      var frac = (this.T - 240) / 160;
      g.fillStyle = frac > 0.55 ? COL.red : COL.cyan;
      g.fillRect(tx + 3, ty + th - th * Math.max(0.05, frac), 6, th * Math.max(0.05, frac));
      g.beginPath(); g.arc(tx + 6, ty + th + 8, 5.5, 0, 7); g.fill();
      txt(g, fmt(this.T, 1) + ' K', tx + 16, ty + 10, { size: 10, color: COL.bright, bold: true });
      txt(g, 'T_amb = 300 K', W - 12, 16, { align: 'right', size: 9 });
      /* săgețile vântului */
      if (this.wind > 5) {
        g.strokeStyle = 'rgba(148,163,184,.5)'; g.lineWidth = 1.2;
        for (var k2 = 0; k2 < 3; k2++) {
          var yy = 30 + k2 * 16;
          g.beginPath(); g.moveTo(W - 90, yy); g.lineTo(W - 30 - this.wind * 0.3, yy); g.stroke();
        }
      }
      if (this.run && this.rate > 1) global.Sound.beat('tick', Math.min(8, this.rate / 22), (this.T - 250) / 130);
      return this.report();
    },
    init: function () { this.report(); }
  };


  /* ==================== 8. FIERBEREA (AE, p.43–44) ======================== */
  var Fierb=global.PraxisBoilingExperiment.create({fit:fit,txt:txt,colors:COL,psatW:psatW,tsatW:tsatW});

  /* ============== 9. PRESIUNEA VAPORILOR SATURANȚI p_sat(T) =============== */
  var Psat = {
    t: 100, out: null,
    refKey: function () {
      var t = this.t;
      if (Math.abs(t) < 1) return 'psat.ref.0';
      if (Math.abs(t - 100) < 1.5) return 'psat.ref.100';
      if (Math.abs(t - 180) < 2) return 'psat.ref.180';
      return 'psat.ref.none';
    },
    report: function () {
      var p = psatW(this.t);
      this.out = { p: p, atm: p / 760, ref: this.refKey() };
      return this.out;
    },
    draw: function () {
      var c = fit(document.getElementById('psatCanvas')), g = c.g, W = c.w, H = c.h;
      var x0 = 54, y0 = H - 54, aw = W - x0 - 16, ah = H - 88;
      var L0 = 0, L1 = 5;                      /* 10^0 … 10^5 tori */
      var X = function (t) { return x0 + t / 200 * aw; };
      var Y = function (p) { return y0 - (Math.log(Math.max(1, p)) / Math.LN10 - L0) / (L1 - L0) * ah; };
      grid(g, x0, y0, aw, ah, 8, 5);
      axes(g, x0, y0, aw, ah, { x: 't (°C)', y: 'p (tori)' });
      for (var d = 0; d <= 5; d++) {
        txt(g, d === 0 ? '1' : '10' + String(d).replace(/1/, '¹').replace(/2/, '²').replace(/3/, '³').replace(/4/, '⁴').replace(/5/, '⁵'),
          x0 - 6, Y(Math.pow(10, d)) + 3, { align: 'right', size: 9 });
      }
      [0, 50, 100, 150, 200].forEach(function (t) { txt(g, String(t), X(t), y0 + 14, { align: 'center', size: 9 }); });
      /* curba */
      g.strokeStyle = COL.cyan; g.lineWidth = 2.6; g.beginPath();
      for (var t = 0; t <= 200; t += 1) {
        var px = X(t), py = Y(psatW(t));
        if (t === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
      /* punctele de referință din manual */
      [[0, 4.54, '0 °C · 4,5 tori'], [100, 760, '100 °C · 760 tori'], [180, psatW(180), '180 °C · ~10 atm']].forEach(function (m) {
        g.fillStyle = COL.gold; g.beginPath(); g.arc(X(m[0]), Y(m[1]), 3.6, 0, 7); g.fill();
        txt(g, m[2], X(m[0]) + (m[0]>150?-8:6), Y(m[1]) - 8, { align: m[0]>150?'right':'left', size: 12, color: COL.gold });
      });
      /* punctul curent */
      var p = psatW(this.t);
      dash(g, X(this.t), y0, X(this.t), Y(p), 'rgba(244,63,94,.5)');
      dash(g, x0, Y(p), X(this.t), Y(p), 'rgba(244,63,94,.5)');
      g.fillStyle = COL.red; g.beginPath(); g.arc(X(this.t), Y(p), 5.2, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 1.3; g.stroke();
      return this.report();
    },
    init: function () { this.report(); }
  };

  /* ============ 10. DIAGRAMA DE FAZE ȘI PUNCTUL TRIPLU (1.5.3) ============ */
  var Faze = {
    TK: 290, p: 50, out: null,
    /* sliderul 0…100 mapped pe o scară log 1 Pa … 1e7 Pa */
    pPa: function () { return Math.pow(10, 0 + this.p / 100 * 7); },
    /* presiunea de sublimare / vaporizare, în Pa */
    psatPa: function(TK){return TK<T_TR ? P_TR*Math.exp(-2.834e6*.01801528/8.314*(1/TK-1/T_TR)) : P_TR*psatW(TK-273.15)/psatW(T_TR-273.15);},
    /* temperatura de topire la presiunea p (Pa), panta negativă a apei */
    tm: function (pPa) { return T_TR - 0.0075 * ((pPa-P_TR) / 101325); },
    classify: function(){
      var T=this.TK,p=this.pPa(),ps=this.psatPa(T),tm=this.tm(p);
      if(Math.abs(T-T_TR)<.03&&Math.abs(Math.log(p/P_TR))<.015)return {st:'st.triplu',pr:'faze.pr.triplu'};
      if(p>=P_TR&&Math.abs(T-tm)<.03)return {st:'st.solidlichid',pr:'faze.pr.top'};
      if(T<T_TR&&p>=P_TR)return {st:T<tm?'st.solid':'st.lichid',pr:'faze.pr.nimic'};
      if(Math.abs(p-ps)/ps<.04)return {st:T<T_TR?'st.solidvapori':'st.lichidvapori',pr:T<T_TR?'faze.pr.subl':'faze.pr.vap'};
      return {st:p<ps?'st.vapori':T<T_TR?'st.solid':'st.lichid',pr:'faze.pr.nimic'};
    },
    report: function () {
      var k = this.classify();
      this.out = { st: k.st, pr: k.pr, p: this.pPa() };
      return this.out;
    },
    draw: function () {
      var c = fit(document.getElementById('fazeCanvas')), g = c.g, W = c.w, H = c.h;
      var x0 = 50, y0 = H - 54, aw = W - x0 - 16, ah = H - 88;
      var Tmin = 180, Tmax = 400, L0 = 0, L1 = 7;      /* 1 Pa … 10^7 Pa */
      var X = function (T) { return x0 + (T - Tmin) / (Tmax - Tmin) * aw; };
      var Y = function (p) { return y0 - (Math.log(Math.max(1, p)) / Math.LN10 - L0) / (L1 - L0) * ah; };
      grid(g, x0, y0, aw, ah, 8, 7);
      axes(g, x0, y0, aw, ah, { x: 'T [K]', y: 'p [Pa]' });
      txt(g, '1 Pa', x0 - 6, Y(1) + 3, { align: 'right', size: 8.5 });
      txt(g, '10⁵ Pa', x0 - 6, Y(1e5) + 3, { align: 'right', size: 8.5 });
      txt(g, '10⁷ Pa', x0 - 6, Y(1e7) + 3, { align: 'right', size: 8.5 });
      [200, 273, 300, 373, 400].forEach(function (T) { txt(g, String(T), X(T), y0 + 14, { align: 'center', size: 8.5 }); });
      var self = this;
      /* curba de sublimare (T < T_tr) */
      g.strokeStyle = COL.violet; g.lineWidth = 2.4; g.beginPath();
      for (var T = 180; T <= T_TR; T += 0.5) {
        var py = Y(this.psatPa(T)); if (py < y0 - ah) break;
        if (T === 180) g.moveTo(X(T), py); else g.lineTo(X(T), py);
      }
      g.stroke();
      /* curba de vaporizare (T > T_tr) */
      g.beginPath();
      for (var T2 = T_TR; T2 <= Tmax; T2 += 0.5) {
        var py2 = Y(this.psatPa(T2));
        if (py2 < y0 - ah) { g.lineTo(X(T2), y0 - ah); break; }
        if (T2 === T_TR) g.moveTo(X(T2), py2); else g.lineTo(X(T2), py2);
      }
      g.strokeStyle = COL.gold; g.lineWidth = 2.4; g.stroke();
      /* curba de topire, aproape verticală, înclinată spre stânga (anomalia apei) */
      g.strokeStyle = COL.cyan; g.lineWidth = 2.4; g.beginPath();
      g.moveTo(X(this.tm(P_TR)), Y(P_TR)); g.lineTo(X(this.tm(1e7)), y0 - ah); g.stroke();
      /* etichetele regiunilor și ale curbelor */
      txt(g, global.I18N.t('st.solid'), x0 + 16, y0 - ah * 0.68, { size: 11, bold: true, color: COL.bright });
      txt(g, global.I18N.t('st.lichid'), x0 + aw * 0.42, y0 - ah * 0.62, { size: 11, bold: true, color: COL.bright });
      txt(g, global.I18N.t('st.vapori'), x0 + aw * 0.55, y0 - ah * 0.16, { size: 11, bold: true, color: COL.bright });
      /* Curve names are preserved in the HTML legend below the diagram. */
      /* punctul triplu */
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(T_TR), Y(P_TR), 4.6, 0, 7); g.fill();
      dash(g, x0, Y(P_TR), X(T_TR), Y(P_TR), 'rgba(36,60,64,.4)');
      dash(g, X(T_TR), y0, X(T_TR), Y(P_TR), 'rgba(36,60,64,.4)');
      txt(g, 'p_tr = 611 Pa', x0 + 2, Y(P_TR) - 5, { size: 8.5, color: COL.bright });
      txt(g, 'T_tr = 273,16 K', X(T_TR) - 4, y0 + 44, { size: 8.5, color: COL.bright, align: 'right' });
      txt(g, global.I18N.t('faze.demo.jump.tr'), X(T_TR) + 8, Y(P_TR) - 12, { size: 9, bold: true, color: COL.bright });
      /* punctul curent */
      var p = this.pPa();
      var cx = Math.max(x0 + 2, Math.min(x0 + aw - 2, X(this.TK)));
      var cy = Math.max(y0 - ah + 2, Math.min(y0 - 2, Y(p)));
      g.fillStyle = COL.red; g.beginPath(); g.arc(cx, cy, 5.6, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 1.3; g.stroke();
      var k = this.classify();
      if (k.pr !== 'faze.pr.nimic' && !this.near) global.Sound.play('chime', k.pr === 'faze.pr.triplu' ? 1.4 : 0.9);
      this.near = k.pr !== 'faze.pr.nimic';
      return this.report();
    },
    init: function () { this.near = false; this.report(); }
  };

  /* ------------------------------ registry ------------------------------- */
  var ALL = {
    inc: Inc, etapa: Etapa, anom: Anom, bars: Bars, tub: Tub,
    echi: Echi, evap: Evap, fierb: Fierb, psat: Psat, faze: Faze, andrews: global.PraxisAndrews.create({fit:fit,txt:txt,colors:COL})
  };
  var active = {};

  function initAll() {
    Object.keys(ALL).forEach(function (k) { ALL[k].init(); });
    /* canvas-urile din secțiunile ascunse se desenează o dată, pentru layout */
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
    show: function (name, on) { active[name] = on; },
    get: function (name) { return ALL[name]; },
    substances: SUBST,
    phys: Phys,
    colors: COL
  };
})(window);
