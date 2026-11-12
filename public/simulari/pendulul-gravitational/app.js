
/* =====================================================================
   PENDULUL GRAVITAȚIONAL — aplicație didactică autonomă
   Fizică: ecuația exactă θ'' = -(g/ℓ)sinθ - βθ', integrare numerică
   ===================================================================== */
(function () {
  'use strict';

  /* copie curată a documentului, capturată înainte de orice modificare din JS
     (folosită de butonul „Salvează o copie offline”) */
  const PRISTINE_HTML = ''; // Downloads use the reproducible bilingual archive.

  /* ------------------------------- utils ------------------------------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const PI = Math.PI, TAU = 2 * PI;
  const deg2rad = d => d * PI / 180;
  const rad2deg = r => r * 180 / PI;

  /** număr formatat în stil românesc (virgulă zecimală) */
  function fmt(x, d = 2) {
    if (!isFinite(x)) return '—';
    const s = Number(x).toFixed(d);
    return s.replace('.', ',');
  }
  /** formatare semnificativă compactă */
  function fmtAuto(x, d = 3) {
    if (!isFinite(x)) return '—';
    if (x !== 0 && Math.abs(x) < 0.001) return x.toExponential(1).replace('.', ',');
    return fmt(x, d);
  }

  /* stocare tolerantă (funcționează și în iframe sandbox) */
  const pageResults = new Map();
  const store = {
    get(k, d) { return pageResults.has(k) ? JSON.parse(pageResults.get(k)) : d; },
    set(k, v) { pageResults.set(k, JSON.stringify(v)); }
  };

  /* ------------------------------ audio ------------------------------- */
  const AudioKit = {
    get on(){return PraxisSound.enabled;}, set on(value){PraxisSound.setEnabled(value);},
    init(){}, tick(){if(!document.hidden && views.lab.classList.contains('active')) PraxisSound.play('event');}
  };

  /* ------------------------------ toast ------------------------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast'); $('#toastTxt').textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* --------------------------- navigare tabs -------------------------- */
  const views = { theory: $('#view-theory'), lab: $('#view-lab') };
  function showView(name) {
    const select=document.querySelector('.praxis-course-sections');if(select)select.value=name;
    if(['lab','theory'].includes(name))history.replaceState(null,'','#'+name);
    Object.entries(views).forEach(([k, el]) => el.classList.toggle('active', k === name));
    $$('.tab-btn').forEach(b => {
      const on = b.dataset.view === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (name === 'lab') { requestAnimationFrame(() => { resizeCanvas(); chart.resize(); }); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updateToc, 60);
  }
  $$('.tab-btn').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
  $$('[data-goto]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); showView(a.dataset.goto);
  }));
  $('#btnGoLab').addEventListener('click', () => showView('lab'));
  $('#btnGoLab2').addEventListener('click', () => showView('lab'));

  /* ------------------------------ cuprins ----------------------------- */
  const tocLinks = $$('#tocList a');
  const sections = $$('.sec');
  function updateToc() {
    if (!views.theory.classList.contains('active')) return;
    let current = sections[0];
    const line = 140;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s; });
    tocLinks.forEach(a => a.classList.toggle('active', a.dataset.target === current.id));
  }
  tocLinks.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const el = document.getElementById(a.dataset.target);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 82, behavior: 'smooth' });
  }));
  window.addEventListener('scroll', () => { if (rafToc === null) rafToc = requestAnimationFrame(() => { rafToc = null; updateToc(); }); }, { passive: true });
  let rafToc = null;

  /* ================================ STARE ============================== */
  const DEFAULTS = { len: 1, mass: 1, amp: 20, g: 9.81, damp: 0, speed: 1 };

  const S = {
    len: 1, mass: 1, ampDeg: 20, g: 9.81, damp: 0, speed: 1,
    theta: deg2rad(20), omega: 0, t: 0, t0: 0,
    running: true,
    trace: [], samples: [], points: [], rows: [],
    measuring: null, crossings: 0,
    showForces: true, showVel: true, showTrace: false, showProt: true, showEnergy: false, showGhost: true,
    periodEst: 0, lastExtreme: 0
  };
  const physics = {
    smallT: (L, g) => TAU * Math.sqrt(L / g),
    /** perioada exactă prin medie aritmetico-geometrică (AGM) */
    exactT(L, g, ampRad) {
      const k = Math.sin(Math.abs(ampRad) / 2);
      let a = 1, b = Math.sqrt(1 - k * k);
      for (let i = 0; i < 24; i++) { const na = (a + b) / 2, nb = Math.sqrt(a * b); a = na; b = nb; }
      const w0 = Math.sqrt(g / L);
      return TAU / (w0 * a);
    },
    energy(L, m, g, th) {
      const v = L * S.omega;
      const Ec = 0.5 * m * v * v;
      const Ep = m * g * L * (1 - Math.cos(th));
      return { Ec, Ep, E: Ec + Ep, v };
    }
  };
  const cur = () => ({
    L: S.len, m: S.mass, g: S.g, amp: S.ampDeg, damp: S.damp,
    T: physics.exactT(S.len, S.g, deg2rad(S.ampDeg)),
    T0: physics.smallT(S.len, S.g)
  });

  /* ============================== SIMULARE ============================= */
  function resetMotion(keepRunning) {
    S.theta = deg2rad(S.ampDeg);
    S.omega = 0; S.t = 0; S.trace = []; S.samples = [];
    S.measuring = null; S.crossings = 0; S.periodEst = 0;
    if (keepRunning !== false) S.running = true;
    syncPlayBtn();
    dirty = true;
  }

  function setEquilibrium() {
    S.theta=0;S.omega=0;S.t=0;S.running=false;S.measuring=null;
    S.trace=[];S.samples=[];S.crossings=0;S.periodEst=0;
    collectSample();syncPlayBtn();dirty=true;drawScene();chart.draw();
    $('#ov-theta').textContent=fmt(0,1)+'°';$('#ov-time').textContent=fmt(0,2)+' s';
    $('#measurementStatus').textContent=PraxisI18n.tr('Măsurare inactivă');
    toast('Pendul oprit în poziția de echilibru');
  }
  $('#btnEquilibrium').addEventListener('click',setEquilibrium);
  function stepPhysics(dtSim) {
    const n = Math.max(1, Math.ceil(dtSim / 0.0015));
    const h = dtSim / n;
    const s = { L: S.len, g: S.g, damp: S.damp };
    for (let i = 0; i < n; i++) {
      const alpha = -(s.g / s.L) * Math.sin(S.theta) - s.damp * S.omega;
      S.omega += alpha * h;
      const prev = S.theta;
      S.theta += S.omega * h;
      // traversări prin echilibru (θ = 0) cu viteză pozitivă → oscilație completă
      if (prev < 0 && S.theta >= 0) {
        if (S.measuring) {
          if (S.measuring.tStart === null) { S.measuring.tStart = S.t; S.measuring.n = 0; }
          else {
            S.measuring.n++;
            if (S.measuring.n >= S.measuring.target) finishMeasure(S.t - S.measuring.tStart);
          }
        }
        AudioKit.tick(960);
      }
      if (prev > 0 && S.theta <= 0) AudioKit.tick(660);
      S.t += h;
    }
    // limitare numerică
    if (Math.abs(S.theta) > PI) S.theta = clamp(S.theta, -PI, PI);
  }

  let dirty = true;
  const SAMPLES_MAX = 1400;
  function collectSample() {
    const amp0 = deg2rad(S.ampDeg);
    S.samples.push({ t: S.t, th: S.theta, ...physics.energy(S.len, S.mass, S.g, S.theta), amp0 });
    if (S.samples.length > SAMPLES_MAX) S.samples.splice(0, S.samples.length - SAMPLES_MAX);
    if (S.showTrace) {
      S.trace.push({ th: S.theta, L: S.len });
      if (S.trace.length > 420) S.trace.shift();
    }
  }

  /* =============================== CANVAS ============================== */
  const cv = $('#sketch');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0;
  let ppm = 260, ppmTarget = 260;

  function resizeCanvas() {
    const r = cv.getBoundingClientRect();
    const dpr = PraxisCanvasResolution.ratio(r.width,r.height);
    W = Math.max(200, r.width); H = Math.max(240, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
  }
  window.addEventListener('resize', () => { resizeCanvas(); chart.resize(); });

  function arrow(x1, y1, x2, y2, color, width, label, dash) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 6) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = width; ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    const ang = Math.atan2(dy, dx), hl = 9 + width * 1.6;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(ang - 0.42), y2 - hl * Math.sin(ang - 0.42));
    ctx.lineTo(x2 - hl * Math.cos(ang + 0.42), y2 - hl * Math.sin(ang + 0.42));
    ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = '600 11px var(--mono, monospace)';
      ctx.font = '600 12px ui-monospace, monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const lx = x2 + 8 * Math.cos(ang), ly = y2 + 8 * Math.sin(ang);
      ctx.fillStyle = 'rgba(5,8,15,.75)';
      const tw = ctx.measureText(label).width;
      ctx.beginPath(); ctx.roundRect(lx - 3, ly - 14, tw + 7, 22, 5); ctx.fill();
      ctx.fillStyle = color; PraxisVectorLabel(ctx, label, lx + 1, ly);
    }
    ctx.restore();
  }

  function drawScene() {
    if (!W) return;
    const availH = H - 74;
    ppmTarget = clamp(availH / (S.len * 1.85), 60, 430);
    ppm += (ppmTarget - ppm) * 0.12;

    const pivot = { x: W / 2, y: 58 };
    const Lpx = S.len * ppm;
    const bob = {
      x: pivot.x + Lpx * Math.sin(S.theta),
      y: pivot.y + Lpx * Math.cos(S.theta)
    };
    const rBob = 9 + 8 * Math.cbrt(S.mass);

    ctx.clearRect(0, 0, W, H);

    /* fundal: grilă subtilă */
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,.055)'; ctx.lineWidth = 1;
    const gs = 34;
    for (let x = (W / 2) % gs; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 56 % gs; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();

    /* tavan + suport */
    const cw = Math.min(W * 0.6, 520);
    ctx.save();
    const cg = ctx.createLinearGradient(0, 30, 0, 52);
    cg.addColorStop(0, 'rgba(148,163,184,.42)');
    cg.addColorStop(1, 'rgba(100,116,139,.22)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.roundRect(pivot.x - cw / 2, 30, cw, 12, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(203,213,225,.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pivot.x - cw / 2, 30.5); ctx.lineTo(pivot.x + cw / 2, 30.5); ctx.stroke();
    // hașuri suport
    ctx.strokeStyle = 'rgba(148,163,184,.28)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < cw - 10; i += 15) {
      ctx.beginPath();
      ctx.moveTo(pivot.x - cw / 2 + i + 4, 42);
      ctx.lineTo(pivot.x - cw / 2 + i - 6, 54);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(pivot.x, pivot.y - 6, 5.5, 0, TAU);
    ctx.fillStyle = '#e2e8f0'; ctx.fill();
    ctx.beginPath(); ctx.arc(pivot.x, pivot.y - 6, 2.2, 0, TAU);
    ctx.fillStyle = '#0b1220'; ctx.fill();
    ctx.restore();

    /* raportor */
    if (S.showProt) {
      const R = Math.max(70, Math.min(Lpx * 0.62, 190));
      ctx.save();
      ctx.translate(pivot.x, pivot.y);
      ctx.strokeStyle = 'rgba(148,163,184,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, R, PI / 2 - PI / 2, PI / 2 + PI / 2); ctx.stroke();
      for (let a = -90; a <= 90; a += 5) {
        const rad = deg2rad(a);
        const big = a % 30 === 0, mid = a % 10 === 0;
        const len = big ? 12 : mid ? 8 : 4;
        const x1 = Math.sin(rad) * R, y1 = Math.cos(rad) * R;
        const x2 = Math.sin(rad) * (R - len), y2 = Math.cos(rad) * (R - len);
        ctx.strokeStyle = big ? 'rgba(203,213,225,.65)' : mid ? 'rgba(148,163,184,.45)' : 'rgba(148,163,184,.25)';
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        if (big) {
          ctx.fillStyle = 'rgba(148,163,184,.75)';
          ctx.font = '10px ui-monospace, monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(Math.abs(a) + '°', Math.sin(rad) * (R - 25), Math.cos(rad) * (R - 25));
        }
      }
      // marcaj amplitudine
      const am = deg2rad(S.ampDeg);
      [-1, 1].forEach(s => {
        const rad = am * s;
        ctx.strokeStyle = 'rgba(251,191,36,.5)'; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(rad) * R * 1.28, Math.cos(rad) * R * 1.28);
        ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.restore();
    }

    /* verticala de echilibru */
    if (S.showGhost) {
      const grd = ctx.createLinearGradient(0, pivot.y, 0, pivot.y + Math.max(Lpx, H - pivot.y - 20));
      grd.addColorStop(0, 'rgba(56,189,248,.45)');
      grd.addColorStop(1, 'rgba(56,189,248,.03)');
      ctx.save();
      ctx.strokeStyle = grd; ctx.lineWidth = 1.4; ctx.setLineDash([6, 7]);
      ctx.beginPath(); ctx.moveTo(pivot.x, pivot.y);
      ctx.lineTo(pivot.x, Math.min(pivot.y + Lpx * 1.18, H - 18)); ctx.stroke();
      ctx.restore();
      // bilă fantomă
      ctx.save();
      ctx.beginPath();
      ctx.arc(pivot.x, pivot.y + Lpx, rBob, 0, TAU);
      ctx.strokeStyle = 'rgba(56,189,248,.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.stroke();
      ctx.restore();
    }

    /* urmă */
    if (S.showTrace && S.trace.length > 1) {
      ctx.save();
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 1; i < S.trace.length; i++) {
        const a = S.trace[i - 1], b = S.trace[i];
        const al = i / S.trace.length;
        ctx.strokeStyle = `rgba(45,212,191,${al * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(pivot.x + a.L * ppm * Math.sin(a.th), pivot.y + a.L * ppm * Math.cos(a.th));
        ctx.lineTo(pivot.x + b.L * ppm * Math.sin(b.th), pivot.y + b.L * ppm * Math.cos(b.th));
        ctx.stroke();
      }
      ctx.restore();
    }

    /* fir */
    ctx.save();
    const rodG = ctx.createLinearGradient(pivot.x, pivot.y, bob.x, bob.y);
    rodG.addColorStop(0, 'rgba(186,230,253,.95)');
    rodG.addColorStop(1, 'rgba(56,189,248,.85)');
    ctx.strokeStyle = rodG; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pivot.x, pivot.y - 6); ctx.lineTo(bob.x, bob.y); ctx.stroke();
    ctx.restore();

    /* unghi */
    if (Math.abs(S.theta) > 0.02) {
      const arcR = Math.min(58, Lpx * 0.42);
      ctx.save();
      ctx.strokeStyle = 'rgba(251,191,36,.85)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pivot.x, pivot.y, arcR, PI / 2, PI / 2 - S.theta, S.theta > 0);
      ctx.stroke();
      ctx.fillStyle = '#fcd34d';
      ctx.font = '700 12px ui-monospace, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const mid = PI / 2 - S.theta / 2;
      ctx.fillText('θ', pivot.x + Math.cos(mid) * (arcR + 13), pivot.y + Math.sin(mid) * (arcR + 13));
      ctx.restore();
    }

    /* vectori */
    const vScalePx = 30 / Math.max(0.35, Math.sqrt(S.g / 9.81));
    const mgPx = 52 * Math.min(1.7, S.mass / 1.2) + 24;
    if (S.showForces) {
      // greutate
      arrow(bob.x, bob.y, bob.x, bob.y + mgPx, '#fb7185', 2.6, 'G');
      // componenta tangențială
      const Ft = -S.mass * S.g * Math.sin(S.theta);
      const tang = { x: Math.cos(S.theta), y: -Math.sin(S.theta) };
      const ftLen = clamp(Math.abs(Ft) / (S.mass * S.g) * mgPx, 0, mgPx);
      if (ftLen > 5) {
        arrow(bob.x, bob.y, bob.x + tang.x * Math.sign(Ft) * ftLen, bob.y + tang.y * Math.sign(Ft) * ftLen, '#fbbf24', 2.2, 'Fₜ');
      }
      // tensiune
      const Tn = S.mass * (S.g * Math.cos(S.theta) + S.len * S.omega * S.omega);
      const tnLen = clamp(Tn / (S.mass * S.g) * mgPx, 0, mgPx * 1.9);
      arrow(bob.x, bob.y, bob.x - Math.sin(S.theta) * tnLen, bob.y - Math.cos(S.theta) * tnLen, 'rgba(167,139,250,.85)', 1.8, 'T', [5, 4]);
    }
    if (S.showVel) {
      const v = S.len * S.omega;
      const vLen = clamp(Math.abs(v) * 48 * Math.sqrt(S.len), 0, 110);
      if (vLen > 5) {
        const dir = { x: Math.cos(S.theta), y: -Math.sin(S.theta) };
        arrow(bob.x, bob.y, bob.x + dir.x * Math.sign(v) * vLen, bob.y + dir.y * Math.sign(v) * vLen, '#38bdf8', 2.4, 'v');
      }
    }

    /* bila */
    ctx.save();
    const e = physics.energy(S.len, S.mass, S.g, S.theta);
    const frac = e.E > 0 ? e.Ec / e.E : 0;
    const c1 = S.showEnergy
      ? `hsl(${16 + frac * 150},92%,${64 + frac * 6}%)`
      : '#5eead4';
    const c2 = S.showEnergy
      ? `hsl(${8 + frac * 150},80%,${40 + frac * 4}%)`
      : '#0d9488';
    const bg = ctx.createRadialGradient(bob.x - rBob * 0.35, bob.y - rBob * 0.4, rBob * 0.15, bob.x, bob.y, rBob);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.28, c1);
    bg.addColorStop(1, c2);
    ctx.shadowColor = 'rgba(45,212,191,.55)'; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(bob.x, bob.y, rBob, 0, TAU); ctx.fillStyle = bg; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(15,23,42,.75)';
    ctx.font = '700 10px ui-monospace, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(S.mass, S.mass < 1 ? 2 : 1) + ' kg', bob.x, bob.y + 1);
    ctx.restore();

    /* bară de energie lângă bilă */
    if (S.showEnergy) {
      const h0 = Math.max(Lpx * (1 - Math.cos(deg2rad(S.ampDeg))), 8);
      const bx = bob.x + rBob + 18, bh = 104, bw = 13;
      const by = clamp(bob.y - bh / 2, 60, H - bh - 16);
      ctx.save();
      ctx.fillStyle = 'rgba(5,10,20,.65)';
      ctx.beginPath(); ctx.roundRect(bx - 4, by - 6, bw + 8, bh + 12, 7); ctx.fill();
      const ecH = (e.E > 0 ? e.Ec / e.E : 0) * bh;
      ctx.fillStyle = '#34d399';
      ctx.fillRect(bx, by + bh - ecH, bw, ecH);
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(bx, by, bw, bh - ecH);
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1;
      ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
      ctx.restore();
    }

    /* riglă (scară) */
    drawRuler(pivot, 16, H - 20);


  }

  function drawRuler(pivot, x, yMax) {
    const maxLen = Math.min(S.len * 1.25, 3.2);
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, pivot.y); ctx.lineTo(x, yMax); ctx.stroke();
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let m = 0; m <= maxLen; m += 0.5) {
      const yy = pivot.y + m * ppm;
      if (yy > yMax) break;
      const big = Math.abs(m % 1) < 0.001;
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + (big ? 7 : 4), yy); ctx.stroke();
      if (big && m > 0) ctx.fillText(m.toFixed(0) + ' m', x + 10, yy);
    }
    ctx.restore();
  }

  /* ============================== GRAFICE ============================== */
  const chart = {
    cv: $('#chart'), ctx: $('#chart').getContext('2d'), mode: 'theta', W: 0, H: 0,
    resize() {
      const r = this.cv.getBoundingClientRect();
      const dpr = PraxisCanvasResolution.ratio(r.width,r.height);
      this.W = Math.max(200, r.width); this.H = Math.max(150, r.height);
      this.cv.width = Math.round(this.W * dpr); this.cv.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    axes(xLabels, yLabels, o) {
      const c = this.ctx, W = this.W, H = this.H;
      const pad = { l: 48, r: 16, t: 30, b: 42 };
      c.clearRect(0, 0, W, H);
      const x0 = pad.l, y0 = H - pad.b, x1 = W - pad.r, y1 = pad.t;
      c.strokeStyle = 'rgba(148,163,184,.16)'; c.lineWidth = 1;
      c.font = '10px ui-monospace, monospace'; c.fillStyle = 'rgba(148,163,184,.75)';
      const nx = 5, ny = 4;
      for (let i = 0; i <= nx; i++) {
        const xx = x0 + (x1 - x0) * i / nx;
        c.beginPath(); c.moveTo(xx, y0); c.lineTo(xx, y1); c.stroke();
        c.textAlign = 'center'; c.textBaseline = 'top';
        c.fillText(xLabels(i / nx), xx, y0 + 7);
      }
      for (let j = 0; j <= ny; j++) {
        const yy = y0 - (y0 - y1) * j / ny;
        c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke();
        c.textAlign = 'right'; c.textBaseline = 'middle';
        c.fillText(yLabels(j / ny), x0 - 8, yy);
      }
      c.strokeStyle = 'rgba(148,163,184,.42)'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(x0, y1); c.lineTo(x0, y0); c.lineTo(x1, y0); c.stroke();
      return { x0, y0, x1, y1, px: v => x0 + (x1 - x0) * v, py: v => y0 - (y0 - y1) * v };
    },
    draw() {
      if (!this.W) this.resize();
      const m = this.mode;
      if (m === 'theta') this.drawTheta();
      else if (m === 'energy') this.drawEnergy();
      else if (m === 'Tl') this.drawTl(false);
      else this.drawTl(true);
    },
    empty(msg) {
      const c = this.ctx;
      c.clearRect(0, 0, this.W, this.H);
      c.fillStyle = 'rgba(148,163,184,.7)';
      c.font = '600 12px system-ui, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      msg.split('\n').forEach((line, i, arr) => c.fillText(line, this.W / 2, this.H / 2 + (i - (arr.length - 1) / 2) * 20));
    },
    line(pts, color, width, fill) {
      if (pts.length < 1) return;
      const c = this.ctx;
      c.save();
      c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
      c.stroke();
      if (fill) {
        const g = c.createLinearGradient(0, this.H * 0.2, 0, this.H);
        g.addColorStop(0, fill); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.lineTo(pts[pts.length - 1].x, pts[0].baseY);
        c.lineTo(pts[0].x, pts[0].baseY);
        c.closePath(); c.fillStyle = g; c.fill();
      }
      c.restore();
    },
    drawTheta() {
      const s = S.samples;
      const win = 12; // secunde
      const tEnd = Math.max(win, S.t);
      const tStart = tEnd - win;
      const amp = Math.max(5, S.ampDeg * 1.15);
      const A = this.axes(
        f => fmt(tStart + (tEnd - tStart) * f, 1) + ' s',
        f => fmt(-amp + 2 * amp * f, 0) + '°'
      );
      // zero line
      const c = this.ctx;
      c.save(); c.strokeStyle = 'rgba(148,163,184,.35)'; c.setLineDash([4, 4]); c.lineWidth = 1;
      c.beginPath(); c.moveTo(A.x0, A.py(0.5)); c.lineTo(A.x1, A.py(0.5)); c.stroke(); c.restore();

      const pts = [];
      for (let i = 0; i < s.length; i++) {
        const sm = s[i];
        if (sm.t < tStart) continue;
        pts.push({
          x: A.px((sm.t - tStart) / (tEnd - tStart)),
          y: A.py((rad2deg(sm.th) + amp) / (2 * amp))
        });
      }
      if (pts.length > 1) {
        pts.forEach(p => p.baseY = A.y0);
        this.line(pts, '#38bdf8', 2, 'rgba(56,189,248,.22)');
      }
      // marcaje amplitudine
      c.save();
      c.setLineDash([3, 5]); c.strokeStyle = 'rgba(251,191,36,.45)'; c.lineWidth = 1;
      [S.ampDeg, -S.ampDeg].forEach(a => {
        const y = A.py((a + amp) / (2 * amp));
        c.beginPath(); c.moveTo(A.x0, y); c.lineTo(A.x1, y); c.stroke();
      });
      c.restore();
      // etichete legendă
      this.legend([['θ (elongație unghiulară)', '#38bdf8'], ['±θ₀ amplitudine', '#fbbf24']]);
      this.title('θ(t) — elongația unghiulară în timp');
    },
    drawEnergy() {
      const s = S.samples;
      if (!s.length) { this.empty('Pornește simularea\npentru a vedea energiile'); return; }
      const win = 12, tEnd = Math.max(win, S.t), tStart = tEnd - win;
      const Emax = Math.max(1e-6, ...s.map(x => Math.max(x.E, x.amp0 ? 0 : 0)));
      const scale = Emax * 1.12;
      const A = this.axes(
        f => fmt(tStart + (tEnd - tStart) * f, 1) + ' s',
        f => fmt(scale * f, scale < 1 ? 3 : 2) + ' J'
      );
      const mk = key => {
        const out = [];
        for (const sm of s) {
          if (sm.t < tStart) continue;
          out.push({ x: A.px((sm.t - tStart) / (tEnd - tStart)), y: A.py(sm[key] / scale) });
        }
        return out;
      };
      const ec = mk('Ec'), ep = mk('Ep'), et = mk('E');
      if (ec.length > 1) {
        this.line(et, '#e2e8f0', 1.6);
        this.line(ep, '#a78bfa', 2);
        this.line(ec, '#34d399', 2);
      }
      this.legend([['E totală', '#e2e8f0'], ['E potențială', '#a78bfa'], ['E cinetică', '#34d399']]);
      this.title('Conservarea energiei mecanice');
    },
    drawTl(squared) {
      const pts = S.points;
      if (pts.length < 1) {
        this.empty(squared
          ? 'Adaugă cel puțin 2 puncte (ℓ, T)\npentru dreapta T²(ℓ)'
          : 'Adaugă puncte cu butonul „Adaugă punct (ℓ, T)”\npentru graficul T(ℓ)');
        return;
      }
      const xs = pts.map(p => p.L), ys = pts.map(p => squared ? p.T * p.T : p.T);
      const xMax = Math.max(1.5, ...xs) * 1.12;
      const yMax = Math.max(1, ...ys) * 1.15;
      const A = this.axes(
        f => fmt(xMax * f, 1),
        f => fmt(yMax * f, squared ? 1 : 2)
      );
      const c = this.ctx;
      // curbă teoretică
      const theo = [];
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const L = xMax * i / steps;
        if (L <= 0.02) continue;
        const T = physics.exactT(L, S.g, deg2rad(S.ampDeg));
        const y = squared ? T * T : T;
        if (y > yMax) break;
        theo.push({ x: A.px(L / xMax), y: A.py(y / yMax) });
      }
      this.line(theo, 'rgba(56,189,248,.55)', 1.8, null);
      // dreapta de regresie (T²)
      const fit = regress();
      if (squared && pts.length >= 2 && fit) {
        const segs = [];
        segs.push({ x: A.px(0), y: A.py(clamp(fit.intercept, -yMax, yMax) / yMax) });
        const xEnd = Math.min(xMax, (yMax - fit.intercept) / fit.slope);
        segs.push({ x: A.px(xEnd / xMax), y: A.py(clamp(fit.intercept + fit.slope * xEnd, 0, yMax) / yMax) });
        this.line(segs, 'rgba(251,191,36,.9)', 2);
      }
      // puncte
      pts.forEach(p => {
        const x = A.px(p.L / xMax);
        const y = A.py((squared ? p.T * p.T : p.T) / yMax);
        c.save();
        c.beginPath(); c.arc(x, y, 4.6, 0, TAU);
        c.fillStyle = '#7dd3fc'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.stroke();
        c.restore();
      });
      this.legend([
        ['puncte măsurate', '#7dd3fc'],
        ['curbă teoretică (amplitudinea selectată)', '#38bdf8'],
        squared && pts.length >= 2 ? ['dreaptă de regresie', '#fbbf24'] : ['', 'transparent']
      ].filter(l => l[0]));
      this.title(squared ? 'T²(ℓ) — liniarizare: panta = 4π²/g' : 'T(ℓ) — perioada crește cu √ℓ');
    },
    title(txt) {
      const c = this.ctx;
      c.save();
      c.font = '600 11px system-ui, sans-serif';
      c.fillStyle = 'rgba(203,213,225,.85)';
      c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText(txt, 12, 9);
      c.restore();
    },
    legend(items) {
      const c = this.ctx;
      c.save();
      c.font = '12px system-ui, sans-serif';
      c.textAlign = 'left'; c.textBaseline = 'middle';
      let x = 12, y = this.H - 11;
      items.forEach(([label, color], i) => {
        if (i > 0) x += 12;
        if (i > 0 && x > this.W - 120) { x = 10; y -= 14; }
        c.fillStyle = color;
        c.beginPath(); c.arc(x + 4, y, 3.4, 0, TAU); c.fill();
        c.fillStyle = 'rgba(148,163,184,.95)';
        c.fillText(label, x + 11, y + 0.5);
        x += 11 + c.measureText(label).width;
      });
      c.restore();
    }
  };
  $$('#chartTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#chartTabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    chart.mode = b.dataset.chart;
    chart.draw();
    const hints = {
      theta: 'Graficul θ(t) se desenează automat în timpul simulării.',
      energy: 'Verifică: E totală rămâne constantă dacă amortizarea este 0.',
      Tl: 'Adaugă puncte pentru mai multe lungimi: setează ℓ, apoi apasă „Adaugă punct”.',
      T2l: 'Cu minim 2 puncte obții panta dreptei și valoarea experimentală a lui g.'
    };
    $('#chartHint').textContent = hints[chart.mode];
  }));

  /* --------------------------- regresie liniară ------------------------ */
  function regress() {
    const pts = S.points;
    if (pts.length < 2) return null;
    const n = pts.length;
    const sx = pts.reduce((a, p) => a + p.L, 0);
    const sy = pts.reduce((a, p) => a + p.T * p.T, 0);
    const sxy = pts.reduce((a, p) => a + p.L * p.T * p.T, 0);
    const sxx = pts.reduce((a, p) => a + p.L * p.L, 0);
    const den = n * sxx - sx * sx;
    let slope, intercept;
    if (Math.abs(den) < 1e-12) { slope = sy / sx; intercept = 0; }
    else {
      slope = (n * sxy - sx * sy) / den;
      intercept = (sy - slope * sx) / n;
    }
    return { slope: Math.abs(slope), intercept, n };
  }

  /* ============================ MĂSURĂTORI ============================ */
  const body = $('#dataBody');
  function renderRows() {
    body.innerHTML = '';
    const runNames = ['A', 'B', 'C', 'D', 'E'];
    S.rows.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${fmt(r.L, 2)}</td>
        <td>${fmt(r.m, 2)}</td>
        <td>${fmt(r.amp, 0)}</td>
        <td>${fmt(r.g, 2)}</td>
        <td>${fmt(r.t10, 2)}</td>
        <td style="color:#5eead4;font-weight:600">${fmt(r.T, 3)}</td>
        <td>${fmt(r.T * r.T, 3)}</td>`;
      body.appendChild(tr);
    });
    $('#tblEmpty').style.display = S.rows.length ? 'none' : 'block';
    $('#rowsPill').innerHTML = `<b>${S.rows.length}</b> măsurători`;
    computeFit();
    store.set('rows', S.rows);
  }
  function addRow(r) {
    S.rows.push(r);
    renderRows();
    const last = body.lastElementChild;
    if (last) { last.classList.add('new'); setTimeout(() => last.classList.remove('new'), 900); }
    // punct automat în grafic
    S.points.push({ L: r.L, T: r.T, g: r.g });
    store.set('points', S.points);
    chart.draw(); computeFit();
  }
  function computeFit() {
    const fit = regress();
    if (fit && S.points.length >= 2) {
      const gExp = 4 * PI * PI / fit.slope;
      const gRef = S.g;
      const err = (gExp - gRef) / gRef * 100;
      $('#fitSlope').innerHTML = fmt(fit.slope, 3) + ' <small>s²/m</small>';
      $('#fitG').innerHTML = fmt(gExp, 3) + ' <small>m/s²</small>';
      $('#fitErr').innerHTML = (err >= 0 ? '+' : '') + fmt(err, 2) + ' <small>%</small>';
      $('#fitHint').textContent = `${fit.n} puncte · comparație cu g setat (${fmt(gRef, 2)} m/s²). Eroarea provine din amplitudinea folosită și din precizia măsurătorii.`;
    } else {
      $('#fitSlope').innerHTML = '—';
      $('#fitG').innerHTML = '—';
      $('#fitErr').innerHTML = '—';
      $('#fitHint').textContent = 'Sunt necesare minim 2 măsurători cu lungimi diferite.';
    }
    if (S.points.length) {
      const gs = S.points.map(p => 4 * PI * PI * p.L / (p.T * p.T));
      const mean = gs.reduce((a, b) => a + b, 0) / gs.length;
      $('#fitG2').innerHTML = fmt(mean, 3) + ' <small>m/s²</small>';
    } else $('#fitG2').innerHTML = '—';
  }

  function startMeasure() {
    if (S.measuring) { S.measuring = null; toast('Măsurare anulată'); return; }
    S.measuring = { tStart: null, n: 0, target: 10 };
    if (!S.running) { S.running = true; syncPlayBtn(); }
    toast('Măsurare pornită — se numără 10 oscilații complete');
  }
  function finishMeasure(t10) {
    const c = cur();
    const T = t10 / 10;
    S.measuring = null;
    addRow({ L: c.L, m: c.m, amp: c.amp, g: c.g, t10, T });
    toast(`Măsurat: t₁₀ = ${fmt(t10, 2)} s ⇒ T = ${fmt(T, 3)} s`);
    updateReadouts();
  }
  /** înregistrare instantanee — folosește perioada exactă calculată */
  function quickMark() {
    const c = cur();
    const T = c.T;
    addRow({ L: c.L, m: c.m, amp: c.amp, g: c.g, t10: T * 10, T });
    toast(`Linie adăugată: ℓ = ${fmt(c.L, 2)} m, T = ${fmt(T, 3)} s`);
  }

  /* ============================ CONTROALE ============================ */
  function setRangeFill(el) {
    const min = +el.min, max = +el.max, v = +el.value;
    const p = ((v - min) / (max - min)) * 100;
    el.style.setProperty('--p', p + '%');
  }
  const inLen = $('#inLen'), inMass = $('#inMass'), inAmp = $('#inAmp'), inDamp = $('#inDamp'),
        inSpeed = $('#inSpeed'), inG = $('#inG'), inGc = $('#inGcustom');

  function syncLabels() {
    $('#vLen').textContent = fmt(S.len, 2) + ' m';
    $('#vMass').textContent = fmt(S.mass, 2) + ' kg';
    $('#vAmp').textContent = fmt(S.ampDeg, 0) + '°';
    $('#vG').textContent = fmt(S.g, 2) + ' m/s²';
    $('#vDamp').textContent = S.damp === 0 ? 'ideal' : fmt(S.damp, 2);
    $('#vSpeed').textContent = fmt(S.speed, 2) + '×';
    [inLen, inMass, inAmp, inDamp, inSpeed, inGc].forEach(setRangeFill);
  }
  function updateReadouts() {
    const c = cur();
    const vmax = 2 * Math.sqrt(S.g * S.len) * Math.sin(deg2rad(S.ampDeg) / 2);
    const E = S.mass * S.g * S.len * (1 - Math.cos(deg2rad(S.ampDeg)));
    $('#roT').innerHTML = fmt(c.T, 3) + '<small>s</small>';
    $('#roF').innerHTML = fmt(1 / c.T, 3) + '<small>Hz</small>';
    $('#roW').innerHTML = fmt(TAU / c.T, 2) + '<small>rad/s</small>';
    $('#roVmax').innerHTML = fmt(vmax, 2) + '<small>m/s</small>';
    $('#roE').innerHTML = fmtAuto(E) + '<small>J</small>';
    $('#roTexact').innerHTML = fmt(c.T0, 3) + '<small>s</small>';
    $('#ov-T').textContent = fmt(c.T, 2) + ' s';
  }

  function onParamChange(reset = true) {
    S.len = +inLen.value;
    S.mass = +inMass.value;
    S.ampDeg = +inAmp.value;
    S.damp = +inDamp.value;
    S.speed = +inSpeed.value;
    if (inG.value !== 'custom') S.g = +inG.value;
    else S.g = +inGc.value;
    syncLabels(); updateReadouts();
    if (reset) resetMotion(true);
    dirty = true;
  }
  [inLen, inMass, inAmp, inDamp, inSpeed].forEach(el => el.addEventListener('input', () => onParamChange(true)));
  inG.addEventListener('change', () => {
    const custom = inG.value === 'custom';
    inGc.disabled = !custom;
    if (!custom) { inGc.value = inG.value; }
    onParamChange(true);
    if (custom) inGc.focus();
  });
  inGc.addEventListener('input', () => { onParamChange(true); });

  $('#btnDefaults').addEventListener('click', () => {
    inLen.value = DEFAULTS.len; inMass.value = DEFAULTS.mass; inAmp.value = DEFAULTS.amp;
    inDamp.value = DEFAULTS.damp; inSpeed.value = DEFAULTS.speed;
    inG.value = '9.81'; inGc.value = 9.81; inGc.disabled = true;
    $('#inPreset').value = '';
    onParamChange(true); toast('Valori implicite restaurate');
  });

  /* scenarii */
  const PRESETS = {
    p1: { L: 1, m: 1, amp: 10, g: 9.81, damp: 0, msg: 'Pendul etalon: ℓ = 1 m ⇒ T ≈ 2,0 s' },
    p2: { L: 0.25, m: 1, amp: 10, g: 9.81, damp: 0, msg: 'Începe cu ℓ = 0,25 m, apoi adaugă puncte pentru 1 m și 2,25 m' },
    p3: { L: 0.165, m: 1, amp: 10, g: 1.62, damp: 0, msg: 'Pe Lună, ℓ = 0,165 m dă aceeași perioadă (≈ 2 s) ca 1 m pe Pământ' },
    p4: { L: 1, m: 0.5, amp: 15, g: 9.81, damp: 0, msg: 'Schimbă masa: perioada rămâne aceeași!' },
    p5: { L: 1, m: 1, amp: 80, g: 9.81, damp: 0, msg: 'Amplitudine 80°: perioada reală este cu ~14% mai mare decât 2π√(ℓ/g)' },
    p6: { L: 1, m: 1, amp: 40, g: 9.81, damp: 0.28, msg: 'Amortizare: amplitudinea scade exponențial în timp' },
    p7: { L: 3, m: 4, amp: 25, g: 9.81, damp: 0, msg: 'Pendul de 3 m: T ≈ 3,5 s' }
  };
  $('#inPreset').addEventListener('change', e => {
    const p = PRESETS[e.target.value];
    if (!p) return;
    inLen.value = p.L; inMass.value = p.m; inAmp.value = p.amp;
    inDamp.value = p.damp;
    if ([...inG.options].some(o => +o.value === p.g)) { inG.value = String(p.g); inGc.disabled = true; inGc.value = p.g; }
    else { inG.value = 'custom'; inGc.disabled = false; inGc.value = p.g; }
    onParamChange(true);
    toast(p.msg);
  });

  /* afișare */
  const cks = {
    ckForces: 'showForces', ckVel: 'showVel', ckTrace: 'showTrace',
    ckProt: 'showProt', ckEnergy: 'showEnergy', ckGhost: 'showGhost'
  };
  Object.entries(cks).forEach(([id, key]) => {
    const el = $('#' + id);
    el.checked = S[key];
    el.addEventListener('change', () => {
      S[key] = el.checked;
      if (key === 'showTrace') S.trace = [];
      if (key === 'showEnergy') $('#legendEp').style.display = el.checked ? 'inline-flex' : 'none';
      dirty = true;
    });
  });

  /* butoane simulare */
  function syncPlayBtn() {
    $('#playTxt').textContent = S.running ? 'Pauză' : 'Start';
    $('#playIco').innerHTML = S.running
      ? '<path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"/>'
      : '<path d="M8 5.5v13l11-6.5z"/>';
    $('#playIco').setAttribute('viewBox', '0 0 24 24');
    $('#playIco').setAttribute('fill', 'currentColor');
    $('#stateTxt').textContent = S.running ? 'în oscilație' : 'pauză';
    $('#statePill').classList.toggle('live', S.running);
  }
  $('#btnPlay').addEventListener('click', () => { S.running = !S.running; syncPlayBtn(); dirty = true; });
  $('#btnReset').addEventListener('click', () => { resetMotion(true); toast('Pendul readus la amplitudinea inițială'); });
  $('#btnKickL').addEventListener('click', () => { S.omega -= 0.9; S.running = true; syncPlayBtn(); });
  $('#btnKickR').addEventListener('click', () => { S.omega += 0.9; S.running = true; syncPlayBtn(); });
  $('#btnMeasure').addEventListener('click', startMeasure);
  $('#btnMark').addEventListener('click', quickMark);
  $('#btnDelRow').addEventListener('click', () => {
    if (!S.rows.length) return;
    const r = S.rows.pop();
    const idx = S.points.findIndex(p => Math.abs(p.L - r.L) < 1e-9 && Math.abs(p.T - r.T) < 1e-9);
    if (idx >= 0) { S.points.splice(idx, 1); store.set('points', S.points); }
    renderRows(); chart.draw();
  });
  $('#btnClearRows').addEventListener('click', () => {
    S.rows = []; S.points = []; store.set('rows', []); store.set('points', []);
    renderRows(); chart.draw(); toast('Tabel și grafice golite');
  });
  $('#btnCsv').addEventListener('click', exportCsv);
  $('#btnAddPoint').addEventListener('click', () => {
    const c = cur();
    if (S.points.some(p => Math.abs(p.L - c.L) < 0.005)) {
      toast('Există deja un punct pentru această lungime — modifică ℓ');
      return;
    }
    S.points.push({ L: c.L, T: c.T, g: c.g });
    store.set('points', S.points);
    chart.mode = chart.mode === 'T2l' ? 'T2l' : 'Tl';
    $$('#chartTabs button').forEach(x => x.classList.toggle('active', x.dataset.chart === chart.mode));
    chart.draw(); computeFit();
    toast(`Punct adăugat: ℓ = ${fmt(c.L, 2)} m, T = ${fmt(c.T, 3)} s`);
  });
  $('#btnClearGraph').addEventListener('click', () => {
    S.points = []; store.set('points', []); chart.draw(); computeFit(); toast('Punctele din grafic au fost șterse');
  });

  function exportCsv() {
    if (!S.rows.length) { toast('Nu există măsurători de exportat'); return; }
    const head = 'nr,lungime_l_m,masa_kg,amplitudine_deg,g_m_s2,t10_s,T_s,T2_s2\n';
    const lines = S.rows.map((r, i) =>
      [i + 1, r.L.toFixed(3), r.m.toFixed(2), r.amp.toFixed(0), r.g.toFixed(2),
       r.t10.toFixed(3), r.T.toFixed(4), (r.T * r.T).toFixed(4)].join(',')).join('\n');
    const blob = new Blob([head + lines], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'masuratori-pendul.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Fișier CSV descărcat');
  }

  /* drag pe canvas */
  let dragging = false;
  function pointerAngle(ev) {
    const r = cv.getBoundingClientRect();
    const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    const py = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
    const pivot = { x: W / 2, y: 58 };
    const a = Math.atan2(px - pivot.x, py - pivot.y);
    return clamp(a, -deg2rad(90), deg2rad(90));
  }
  function startDrag(ev) {
    dragging = true; cv.classList.add('dragging');
    S.running = false; syncPlayBtn();
    applyDrag(ev); ev.preventDefault();
  }
  function applyDrag(ev) {
    const a = pointerAngle(ev);
    S.theta = a; S.omega = 0;
    S.ampDeg = Math.max(1, Math.abs(rad2deg(a)));
    inAmp.value = clamp(Math.round(S.ampDeg), 1, 90);
    syncLabels(); updateReadouts();
    S.t = 0; S.samples = []; S.trace = [];
    dirty = true;
  }
  function endDrag() {
    if (!dragging) return;
    dragging = false; cv.classList.remove('dragging');
    S.omega = 0; S.running = true; syncPlayBtn();
    toast(`Amplitudine setată: θ₀ = ${fmt(S.ampDeg, 0)}°`);
  }
  cv.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', e => { if (dragging) applyDrag(e); });
  window.addEventListener('mouseup', endDrag);
  cv.addEventListener('touchstart', startDrag, { passive: false });
  cv.addEventListener('touchmove', e => { if (dragging) { applyDrag(e); e.preventDefault(); } }, { passive: false });
  cv.addEventListener('touchend', endDrag);

  /* fullscreen */
  $('#btnFull').addEventListener('click', () => {
    const el = $('.stage');
    if (!document.fullscreenElement) { (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); }
    else document.exitFullscreen();
    setTimeout(() => { resizeCanvas(); chart.resize(); }, 300);
  });
  /* sunet */
  $('#btnSound').addEventListener('click', () => {
    AudioKit.on = !AudioKit.on;
    $('#btnSound').classList.toggle('on', AudioKit.on);
    if (AudioKit.on) { AudioKit.init(); AudioKit.tick(880); toast('Sunet activat'); }
    else toast('Sunet oprit');
  });

  /* ============================== ACTIVITĂȚI ========================== */
  const TASKS = [
    { t: 'Măsoară perioada pentru ℓ = 1 m', d: 'Setează θ₀ = 10°, apasă „Măsoară (10 oscilații)”. Verifică T ≈ 2,0 s.', c: 'T = 2π√(ℓ/g) = 2,006 s' },
    { t: 'Verifică independența de masă', d: 'Păstrează ℓ și θ₀, modifică masa de la 0,5 kg la 5 kg. Compară perioadele.', c: 'T nu depinde de m' },
    { t: 'Legea T ∝ √ℓ', d: 'Adaugă puncte pentru ℓ = 0,25; 1,00; 2,25 m și urmărește graficul T(ℓ).', c: 'de 4× ℓ ⇒ de 2× T' },
    { t: 'Determină g din pantă', d: 'Cu minim 3 puncte, citește panta din graficul T²(ℓ) și calculează g = 4π²/p.', c: 'g ≈ 9,8 m/s²' },
    { t: 'Compară Pământ – Lună', d: 'Alege g = 1,62 m/s². Găsește lungimea pentru care T rămâne 2 s.', c: 'ℓ ≈ 0,165 m' },
    { t: 'Efectul amplitudinii', d: 'Compară T la 5° și la 80° (pornește amortizarea pe 0). Estimează eroarea relativă.', c: '≈ 0,2% vs ≈ 7%' },
    { t: 'Energia se conservă', d: 'Activează graficul „Energie” cu amortizare 0. Observă suma constantă Ec + Ep.', c: 'E = mgℓ(1 − cos θ₀)' },
    { t: 'Amortizare', d: 'Setează β = 0,3 și urmărește descreșterea amplitudinii; explică transformarea energiei.', c: 'E mecanică → energie internă' }
  ];
  const checked = new Set(store.get('tasks', []));
  function renderTasks() {
    const box = $('#tasksList');
    box.innerHTML = TASKS.map((t, i) => `
      <label class="switch-row" style="align-items:flex-start;background:rgba(255,255,255,.03);border:1px solid ${checked.has(i) ? 'rgba(52,211,153,.35)' : 'var(--line)'};border-radius:12px;padding:11px 13px">
        <span class="lbl" style="padding-top:1px">
          <b style="color:#fff;font-size:.865rem;display:block;margin-bottom:2px">${i + 1}. ${t.t}</b>
          <span style="color:var(--muted);font-size:.78rem;line-height:1.45;display:block">${t.d}</span>
          <span class="chip t" style="margin-top:7px;display:inline-block;font-size:.68rem">${t.c}</span>
        </span>
        <input type="checkbox" data-task="${i}" ${checked.has(i) ? 'checked' : ''}>
        <span class="sw" style="margin-top:2px"></span>
      </label>`).join('');
    $$('input[data-task]', box).forEach(inp => inp.addEventListener('change', () => {
      const i = +inp.dataset.task;
      if (inp.checked) checked.add(i); else checked.delete(i);
      store.set('tasks', [...checked]);
      renderTasks();
      if (checked.size === TASKS.length) toast('Felicitări! Ai parcurs toate activitățile 🎉');
    }));
  }

  /* ================================ MODAL ============================= */
  const modal = $('#modal');
  function openModal(title, html) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    modal.classList.add('open');
    if(document.documentElement.dataset.praxisStandalone==='true')$('#btnSaveOffline')?.setAttribute('hidden','');
    $('#modalX').focus();
  }
  function closeModal() { modal.classList.remove('open'); }
  $('#modalX').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  $('#btnHelp').addEventListener('click', () => openModal('Ghid rapid', `
    <h4>Ce poți face aici</h4>
    <ul>
      <li><b>Teorie</b> — 10 secțiuni cu formule, scheme și tabele, navigabile din cuprins.</li>
      <li><b>Laborator</b> — simulare cu pendul real (ecuația exactă), vectori, energii, grafice și tabel de măsurători.</li>
    </ul>
    <h4>Scurtături de tastatură</h4>
    <ul>
      <li><kbd>Space</kbd> — start / pauză</li>
      <li><kbd>R</kbd> — reset la amplitudinea inițială</li>
      <li><kbd>←</kbd> / <kbd>→</kbd> — împinge pendulul</li>
      <li><kbd>M</kbd> — pornește măsurarea celor 10 oscilații</li>
      <li><kbd>Esc</kbd> — închide fereastra</li>
    </ul>
    <h4>Cum obții g experimental</h4>
    <ol>
      <li>Setează θ₀ ≤ 10° și amortizarea 0.</li>
      <li>Pentru 3–5 lungimi diferite apasă „Adaugă punct (ℓ, T)” (sau măsoară).</li>
      <li>Trece pe graficul <b>T²(ℓ)</b> și citește panta p; apoi g = 4π² / p.</li>
    </ol>
    <h4>Offline</h4>
    <p>Descarcă arhiva offline, dezarhiveaz-o și deschide index.html. Măsurătorile rămân doar în pagina curentă și se pierd la reîncărcare.</p>
    <p><button class="btn btn-teal btn-sm" id="btnSaveOffline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12M7 11l5 5 5-5M4 21h16"/></svg>
      Descarcă lecția offline
    </button></p>
  `));
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('#btnSaveOffline');
    if (!btn) return;
    try {
      const a = document.createElement('a'); a.href='pendulul-gravitational.zip'; a.download='pendulul-gravitational.zip'; a.click();
      toast('Copie offline salvată — o poți deschide oricând, fără internet');
    } catch (err) { toast('Descărcarea nu este permisă în acest context'); }
  });

  $('#btnAbout').addEventListener('click', e => {
    e.preventDefault();
    openModal('Despre aplicație', `
      <h4>Pendulul gravitational — aplicație didactică</h4>
      <p>Instrument interactiv pentru studiul pendulului matematic și al oscilațiilor mecanice: teorie structurată, laborator virtual, prelucrare de date și fișă de activități.</p>
      <h4>Model fizic</h4>
      <p>Simularea integrează numeric ecuația exactă <code>θ'' = −(g/ℓ)·sin θ − β·θ'</code>, fără aproximația unghiurilor mici — de aceea poți observa creșterea perioadei la amplitudini mari. Perioada „exactă” din panoul de date este calculată analitic prin media aritmetico-geometrică (AGM).</p>
      <h4>Confidențialitate</h4>
      <p>Măsurătorile și bifele rămân doar în memoria paginii și se pierd la reîncărcare. Exportă măsurătorile pentru a păstra un fișier pe dispozitiv.</p>
      <h4>Inspirație</h4>
      <p>Interfața și abordarea pedagogică se inspiră din <a href="https://phet.colorado.edu/ro/simulations/pendulum-lab" target="_blank" rel="noopener">PhET Interactive Simulations, University of Colorado Boulder</a> (licență CC BY 4.0).</p>
      <p style="color:var(--dim);font-size:.8rem;margin-top:16px">Versiunea 1.0 · construcție autonomă, fără dependențe externe.</p>
    `);
  });

  /* ============================== TASTATURĂ =========================== */
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (!views.lab.classList.contains('active')) {
      if (e.key === ' ' && tag !== 'button') { /* nimic */ }
      return;
    }
    if (e.code === 'Space') { e.preventDefault(); S.running = !S.running; syncPlayBtn(); dirty = true; }
    else if (e.key === 'r' || e.key === 'R') resetMotion(true);
    else if (e.key === 'ArrowLeft') { S.omega -= 0.9; S.running = true; syncPlayBtn(); }
    else if (e.key === 'ArrowRight') { S.omega += 0.9; S.running = true; syncPlayBtn(); }
    else if (e.key === 'm' || e.key === 'M') startMeasure();
  });

  /* =============================== BUCLE ============================== */
  let last = performance.now(), acc = 0, uiAcc = 0, chartAcc = 0;
  function loop(now) {
    const dtReal = Math.min(0.05, (now - last) / 1000);
    last = now;
    if(document.hidden || !views.lab.classList.contains('active')) { requestAnimationFrame(loop); return; }
    if (S.running) {
      const dtSim = dtReal * S.speed;
      stepPhysics(dtSim);
      acc += dtSim;
      if (acc > 0.012) { acc = 0; collectSample(); }
      if (!dirty && S.showTrace) dirty = true;
    }
    if (dirty || S.running) { drawScene(); dirty = false; }
    // UI throttled
    uiAcc += dtReal; chartAcc += dtReal;
    if (uiAcc > 0.09) {
      uiAcc = 0;
      const status=S.measuring?(S.measuring.tStart===null?'măsurare… aștept o oscilație':`măsurare: ${S.measuring.n}/10 oscilații`):'Măsurare inactivă';
      const statusText=PraxisI18n.tr(status);if($('#measurementStatus').textContent!==statusText)$('#measurementStatus').textContent=statusText;
      $('#ov-theta').textContent = fmt(rad2deg(S.theta), 1) + '°';
      $('#ov-time').textContent = fmt(S.t, 2) + ' s';
      if (!S.running) { $('#stateTxt').textContent = 'pauză'; }
      else if (S.damp > 0.02 && Math.abs(S.theta) < 0.004 && Math.abs(S.omega) < 0.02) {
        $('#stateTxt').textContent = 'amortizat';
      } else if (S.measuring) { $('#stateTxt').textContent = 'măsurare…'; }
      else { $('#stateTxt').textContent = 'în oscilație'; }
    }
    if (chartAcc > 0.12 && views.lab.classList.contains('active')) {
      chartAcc = 0;
      if (chart.mode === 'theta' || chart.mode === 'energy') chart.draw();
    }
    requestAnimationFrame(loop);
  }

  /* ============================== INIȚIALIZARE ======================== */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    // stare din param. impliciti
    S.rows = store.get('rows', []);
    S.points = store.get('points', []);
    syncLabels(); updateReadouts(); syncPlayBtn(); renderRows(); renderTasks();
    resizeCanvas(); chart.resize();
    resetMotion(true);
    setTimeout(() => { resizeCanvas(); chart.resize(); }, 120);
    requestAnimationFrame(loop);

    showView(/^#(?:theory|t\d)/.test(location.hash)?"theory":"lab");
    updateToc();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // expunere minimă pentru depanare
  window.Pendul = { S, physics, chart, showView, resetMotion, stepPhysics, regress, setEquilibrium };
  const syncSound=()=>{ $('#btnSound').classList.toggle('on',PraxisSound.enabled); $('#btnSound').setAttribute('aria-pressed',String(PraxisSound.enabled)); };
  syncSound(); window.addEventListener('praxis-sound-change',syncSound);
  window.addEventListener('praxis-language-change',()=>{syncLabels();updateReadouts();dirty=true;chart.draw();});
  window.addEventListener('praxis-course-presentation-change',()=>{resizeCanvas();chart.resize();});
  cv.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();inAmp.value=clamp(S.ampDeg+(e.key==='ArrowRight'?1:-1),1,90);inAmp.dispatchEvent(new Event('input'));});
  cv.addEventListener('touchcancel',endDrag);
  window.addEventListener('load',()=>{const select=document.querySelector('.praxis-course-sections');if(select)select.value=views.lab.classList.contains('active')?'lab':'theory';});
  new ResizeObserver(()=>{if(views.lab.classList.contains('active')){resizeCanvas();chart.resize();}}).observe($('.lab-grid'));
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
})();

// Move existing nodes, preserving all native handlers and simulation state.
(()=>{
 const root=document.getElementById('praxis-original');
 const disclose=(node,label)=>{const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=label;details.append(summary);node.before(details);details.append(node);return details;};
 const side=root.querySelector('.side');
 root.querySelector('.site-foot').before(root.querySelector('.pendulum-help'));
 const advanced=document.createElement('div');
 const damping=root.querySelector('#inDamp').closest('.ctl');damping.before(advanced);
 advanced.append(damping,root.querySelector('#inSpeed').closest('.ctl'));
 disclose(advanced,'Amortizare și viteză');
 const custom=root.querySelector('#inGcustom');const updateGravity=()=>{custom.closest('.praxis-range-stepper')?.toggleAttribute('hidden',root.querySelector('#inG').value!=='custom');custom.hidden=root.querySelector('#inG').value!=='custom';};
 root.querySelector('#inG').addEventListener('change',updateGravity);window.addEventListener('load',updateGravity);updateGravity();
 disclose(side.children[1],'Afișare');
 const readouts=side.querySelector('.readout-grid');disclose(readouts,'Date calculate');
 const data=root.querySelector('.data');disclose(data.children[1],'Măsurători');
 const legend=document.createElement('section');legend.className='card pendulum-command-legend';legend.setAttribute('aria-labelledby','pendulum-legend-title');
 legend.innerHTML='<div class="card-h"><h3 id="pendulum-legend-title">Legendă comenzi</h3></div><dl><dt>← / →</dt><dd>Aplică un impuls spre stânga / dreapta. Poate accelera, frâna sau inversa mișcarea.</dd><dt>Start / Pauză</dt><dd>Pornește sau oprește temporar simularea.</dd><dt>Reset</dt><dd>Reia oscilația de la amplitudinea aleasă, cu timpul zero.</dd><dt>Echilibru</dt><dd>Oprește pendulul vertical, cu viteză zero.</dd><dt>Măsoară</dt><dd>Cronometrează 10 oscilații complete și adaugă rezultatul în tabel.</dd></dl>';
 data.firstElementChild.after(legend);
 const tasks=root.querySelector('#tasksList').parentElement;tasks.style.gridArea='tasks';disclose(tasks,'Fișă de activități').style.gridArea='tasks';
 root.querySelectorAll('.chart-tools button').forEach(button=>{button.setAttribute('aria-selected',String(button.classList.contains('active')));button.addEventListener('click',()=>root.querySelectorAll('.chart-tools button').forEach(b=>b.setAttribute('aria-selected',String(b===button))));});
 root.querySelector('#inGcustom').setAttribute('aria-label','Accelerație gravitațională personalizată');
 root.querySelector('#chart').setAttribute('aria-label','Graficele pendulului');
 const modal=root.querySelector('#modal');let previousFocus;
 new MutationObserver(()=>{if(!modal.classList.contains('open'))previousFocus?.focus();}).observe(modal,{attributes:true,attributeFilter:['class']});
 for(const id of ['btnHelp','btnAbout']){const button=root.querySelector('#'+id);button.addEventListener('focus',()=>{previousFocus=button;});}
 modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const items=[...modal.querySelectorAll('button,a[href],input,select')].filter(el=>!el.hidden&&!el.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 for(const group of document.querySelectorAll('[role=tablist]'))group.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...group.querySelectorAll('[role=tab]')];const current=tabs.indexOf(document.activeElement);if(current<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(current+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();});
})();
