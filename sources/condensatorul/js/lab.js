/* =========================================================
   Condensatorul — simularea din laborator
   Model fizic: condensator plan cu dielectric, încărcare /
   descărcare prin rezistor, sursă deconectabilă.

   Notă despre timp: constantele de timp reale sunt de ordinul
   microsecundelor pentru aceste capacități, deci animația
   folosește o axă de timp dilatată (slow-motion). Valorile
   fizice reale (τ, C, Q, U, W) sunt calculate exact.
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('labCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var E0 = 8.854187817e-12;
  var R_MEASURE = 1e6;                 /* rezistența folosită pentru τ afișat */

  /* ---------------- materiale dielectrice ---------------- */
  var MATERIALS = [
    { name: 'Aer', er: 1, color: [140, 190, 235] },
    { name: 'Poliester', er: 3.1, color: [120, 220, 180] },
    { name: 'Hârtie', er: 3.7, color: [235, 205, 140] },
    { name: 'Sticlă', er: 6.0, color: [160, 210, 245] },
    { name: 'Apă distilată', er: 80, color: [130, 185, 255] },
    { name: 'Ceramică', er: 1200, color: [200, 160, 255] }
  ];

  /* ---------------- stare ---------------- */
  var state = {
    E: 9,                  /* tensiunea sursei, V */
    S: 200,                /* aria, cm² */
    d: 5,                  /* distanța, mm */
    erIndex: 0,
    inserted: false,
    speed: 1,
    mode: 'off',           /* off | charge | discharge */
    q: 0,                  /* sarcina, C */
    paused: false,
    tAnim: 0,
    dielecProgress: 0,
    lastQmax: 0,
    peakU: 0
  };
  var lastMaterial = 1;

  /* ---------------- elemente DOM ---------------- */
  var el = {
    C: document.getElementById('roC'),
    Q: document.getElementById('roQ'),
    U: document.getElementById('roU'),
    W: document.getElementById('roW'),
    tau: document.getElementById('roTau'),
    E: document.getElementById('roE'),
    tau5: document.getElementById('ro5Tau'),
    Qmax: document.getElementById('roQmax'),
    badge: document.getElementById('stateBadge'),
    volt: document.getElementById('sVolt'),
    voltVal: document.getElementById('sVoltVal'),
    area: document.getElementById('sArea'),
    areaVal: document.getElementById('sAreaVal'),
    dist: document.getElementById('sDist'),
    distVal: document.getElementById('sDistVal'),
    dielec: document.getElementById('sDielec'),
    dielecVal: document.getElementById('sDielecVal'),
    speed: document.getElementById('sSpeed'),
    speedVal: document.getElementById('sSpeedVal'),
    table: document.getElementById('dielecTable'),
    missions: document.getElementById('missions')
  };

  /* ---------------- fizică ---------------- */
  /* C = ε₀ · εr · S / d   (S în cm², d în mm în interfață) */
  function cap() {
    var S = state.S * 1e-4;
    var d = state.d * 1e-3;
    var er = state.inserted ? MATERIALS[state.erIndex].er : 1;
    return CapacitorModel.capacitance(S, d, er);
  }
  function epsilonR() { return state.inserted ? MATERIALS[state.erIndex].er : 1; }

  function voltage() {
    var C = cap();
    return C > 0 ? state.q / C : 0;
  }

  function tauAnimFor(C) {
    return Math.max(0.6,Math.min(3.5,0.6*Math.pow(C/3.54167512512e-11,0.3)));
  }

  /* ---------------- măsurători afișate ---------------- */
  function fmt(n, d) { return n.toFixed(d).replace('.', ','); }

  function updateReadouts() {
    if(btnInsert){btnInsert.setAttribute('aria-pressed',String(state.inserted));btnInsert.textContent=state.inserted?'Scoate dielectricul':'Inserează dielectric';}
    var C = cap();
    var U = voltage();
    var W = 0.5 * C * U * U;
    var tauReal = R_MEASURE * C;
    var Emax = U / (state.d * 1e-3);
    var Qmax = C * state.E;

    var timeScale=document.getElementById('timeScale');if(timeScale)timeScale.textContent='1 s animație = '+window.siFormat(tauReal/tauAnimFor(C),'s',3)+' fizice';
    var chargeLevel=document.getElementById('chargeLevel');if(chargeLevel)chargeLevel.textContent=state.E>0?'U/E = '+fmt(100*U/state.E,1)+' %':'U/E = —';
    if (el.C) el.C.innerHTML = window.siFormat(C, 'F', 3);
    if (el.Q) el.Q.innerHTML = window.siFormat(state.q, 'C', 3);
    if (el.U) el.U.innerHTML = fmt(U, U < 10 ? 2 : 1) + '<em>V</em>';
    if (el.W) el.W.innerHTML = window.siFormat(W, 'J', 3);
    if (el.tau) el.tau.innerHTML = window.siFormat(tauReal, 's', 2);
    if (el.E) el.E.innerHTML = window.siFormat(Emax, 'V/m', 3);
    if (el.tau5) el.tau5.innerHTML = window.siFormat(tauReal * 5, 's', 2);
    if (el.Qmax) el.Qmax.innerHTML = window.siFormat(Qmax, 'C', 3);

    if (el.voltVal) el.voltVal.textContent = fmt(state.E, 1) + ' V';
    if (el.areaVal) el.areaVal.textContent = fmt(state.S, 0) + ' cm²';
    if (el.distVal) el.distVal.textContent = fmt(state.d, 1) + ' mm';
    if (el.dielecVal) {
      el.dielecVal.textContent = state.inserted
        ? MATERIALS[state.erIndex].name + ' · ' + fmt(MATERIALS[state.erIndex].er, MATERIALS[state.erIndex].er >= 10 ? 0 : 1)
        : 'aer · 1,0';
    }
    if (el.speedVal) el.speedVal.textContent = fmt(state.speed, 2) + '×';

    var current=CapacitorModel.current(state.q,C,state.E,R_MEASURE,state.mode);
    var currentReadout=document.getElementById('roI');if(currentReadout)currentReadout.textContent=window.siFormat(current,'A',3);
    if (el.badge) {
      var txt, col, bg;
      if (state.mode === 'charge') { txt = current>1e-9?'se încarcă':current < -1e-9?'se descarcă spre sursă':'echilibru cu sursa'; col = '#8affc4'; bg = 'rgba(74,222,155,.4)'; }
      else if (state.mode === 'discharge') { txt = state.q>1e-16?'se descarcă':'descărcat'; col = '#ffd79a'; bg = 'rgba(255,182,77,.42)'; }
      else if (state.q > 1e-18) { txt = 'deconectat · încărcat'; col = '#bcd3ff'; bg = 'rgba(140,180,255,.4)'; }
      else { txt = 'descărcat'; col = '#8affc4'; bg = 'rgba(74,222,155,.4)'; }
      el.badge.textContent = state.paused?'pauză':txt;
      el.badge.style.color = col;
      el.badge.style.borderColor = bg;
    }
  }

  /* ---------------- tabel dielectric ---------------- */
  if (el.table) {
    el.table.innerHTML = MATERIALS.map(function (m, i) {
      return '<tr' + (i === state.erIndex && state.inserted ? ' style="background:rgba(62,230,210,.1)"' : '') +
        '><td>' + window.esc(m.name) + '</td><td>' + (m.er >= 10 ? m.er : String(m.er).replace('.', ',')) + '</td></tr>';
    }).join('');
  }

  /* ---------------- misiuni ---------------- */
  var MISSIONS = [
    { id: 'charge', text: 'Încarcă condensatorul peste 95 % din tensiunea sursei', done: false },
    { id: 'discharge', text: 'Descarcă-l complet (sub 5 % din sarcină)', done: false },
    { id: 'dielec', text: 'Inserează un dielectric între armături', done: false },
    { id: 'area', text: 'Mărește aria armăturilor la cel puțin 400 cm²', done: false },
    { id: 'isolate', text: 'Deconectează sursa, apoi depărtează plăcile și urmărește tensiunea', done: false },
    { id: 'full', text: 'Încarcă la tensiunea maximă (24 V)', done: false }
  ];

  function renderMissions() {
    if (!el.missions) return;
    el.missions.innerHTML = MISSIONS.map(function (m) {
      return '<li style="color:' + (m.done ? '#8affc4' : 'var(--muted)') + '">' +
        '<span class="tick" style="color:' + (m.done ? 'var(--green)' : 'var(--muted-2)') + '">' +
        (m.done ? '✓' : '○') + '</span><span>' + window.esc(m.text) + '</span></li>';
    }).join('');
  }

  var isolatedFlag = false, isolationD=state.d;
  function complete(id) {
    var m = MISSIONS.filter(function (x) { return x.id === id; })[0];
    if (!m || m.done) return;
    m.done = true;
    renderMissions();
    if (window.CondSound) window.CondSound.chime();
    window.toast('✅ Misiune îndeplinită: ' + m.text.split(',')[0]);
  }
  renderMissions();

  /* ---------------- controale ---------------- */
  function bindRange(input, key, after) {
    if (!input) return;
    input.addEventListener('input', function () {
      state[key] = parseFloat(input.value);
      if (after) after();
      updateReadouts();
    });
  }

  bindRange(el.volt, 'E');
  bindRange(el.area, 'S', function () {
    if (state.S >= 400) complete('area');
  });
  bindRange(el.dist, 'd', function () {
    if(state.mode==='off'&&state.q>1e-16&&state.d>isolationD)complete('isolate');
  });
  bindRange(el.speed, 'speed');
  if (el.dielec) {
    el.dielec.addEventListener('input', function () {
      state.erIndex = parseInt(el.dielec.value, 10);
      if (state.erIndex > 0) {
        state.inserted = true;
        lastMaterial = state.erIndex;
        complete('dielec');
        if (window.CondSound) window.CondSound.dielectric();
      } else {
        state.inserted = false;
      }
      updateReadouts();
      refreshDielecTable();
    });
  }

  function refreshDielecTable() {
    if (!el.table) return;
    el.table.innerHTML = MATERIALS.map(function (m, i) {
      var active = (i === state.erIndex && state.inserted) || (i === 0 && !state.inserted);
      return '<tr' + (active ? ' style="background:rgba(62,230,210,.1)"' : '') +
        '><td>' + window.esc(m.name) + '</td><td>' + (m.er >= 10 ? m.er : String(m.er).replace('.', ',')) + '</td></tr>';
    }).join('');
  }

  var btnInsert = document.getElementById('btnInsert');
  if (btnInsert) {
    btnInsert.addEventListener('click', function () {
      if (state.inserted) {
        lastMaterial = state.erIndex > 0 ? state.erIndex : lastMaterial;
        state.inserted = false;
        if (el.dielec) el.dielec.value = 0;
        state.erIndex = 0;
        if (window.CondSound) window.CondSound.switchOff();
      } else {
        state.erIndex = lastMaterial || 1;
        state.inserted = true;
        if (el.dielec) el.dielec.value = state.erIndex;
        complete('dielec');
        if (window.CondSound) window.CondSound.dielectric();
      }
      btnInsert.setAttribute('aria-pressed', state.inserted ? 'true' : 'false');
      btnInsert.textContent = state.inserted ? 'Scoate dielectricul' : 'Inserează dielectric';
      updateReadouts();
      refreshDielecTable();
    });
  }

  /* butoane principale */
  var btnCharge = document.getElementById('btnCharge');
  var btnDischarge = document.getElementById('btnDischarge');
  var btnPause = document.getElementById('btnPause');
  var btnReset = document.getElementById('btnReset');
  var btnOn = document.getElementById('btnSwitchOn');
  var btnOff = document.getElementById('btnSwitchOff');

  var dischargeStart=0;
  function setMode(m) {
    if(m==='discharge')dischargeStart=state.q;
    if(m==='off')isolationD=state.d;
    state.mode = m;
    if (m === 'charge') {
      if (window.CondSound) window.CondSound.switchOn();
    } else if (m === 'discharge') {
      if (window.CondSound) window.CondSound.discharge();
    } else if (window.CondSound) {
      window.CondSound.switchOff();
    }
    syncSwitchBtns();
    updateReadouts();
  }

  function syncSwitchBtns() {
    if (btnOn) btnOn.setAttribute('aria-pressed', state.mode === 'charge' ? 'true' : 'false');
    if (btnOff) btnOff.setAttribute('aria-pressed', state.mode === 'off' ? 'true' : 'false');
  }

  if (btnCharge) btnCharge.addEventListener('click', function () {
    setMode('charge');
    if (window.CondSound) window.CondSound.charge();
    window.toast('⚡ Sursa conectată — condensatorul se încarcă');
  });
  if (btnDischarge) btnDischarge.addEventListener('click', function () {
    setMode('discharge');
    window.toast('🔻 Descărcare prin rezistor');
  });
  if (btnOn) btnOn.addEventListener('click', function () { setMode('charge'); });
  if (btnOff) btnOff.addEventListener('click', function () {
    setMode('off');
    window.toast('⏸ Sursa deconectată — sarcina rămâne blocată');
  });
  if (btnPause) btnPause.addEventListener('click', function () {
    state.paused = !state.paused;
    btnPause.setAttribute('aria-pressed', state.paused ? 'true' : 'false');
    btnPause.textContent = state.paused ? 'Continuă' : 'Pauză';
    updateReadouts();
  });
  if (btnReset) btnReset.addEventListener('click', function () {
    state.q = 0; state.mode = 'off'; state.paused = false;
    state.speed=1; state.tAnim=0; state.peakU=0; state.dielecProgress=0; isolatedFlag=false; lastMaterial=1; dischargeStart=0; MISSIONS.forEach(function(m){m.done=false;});renderMissions();if(el.speed)el.speed.value=1;
    state.E = 9; state.S = 200; state.d = 5; state.erIndex = 0; state.inserted = false;
    if (el.volt) el.volt.value = 9;
    if (el.area) el.area.value = 200;
    if (el.dist) el.dist.value = 5;
    if (el.dielec) el.dielec.value = 0;
    if (btnPause) { btnPause.setAttribute('aria-pressed', 'false'); btnPause.textContent = 'Pauză'; }
    if (btnInsert) { btnInsert.setAttribute('aria-pressed', 'false'); btnInsert.textContent = 'Inserează dielectric'; }
    document.querySelectorAll('input[type="range"]').forEach(function (r) {
      if (window.paintRange) window.paintRange(r);
    });
    graphSamples.length = 0;
    setMode('off');
    updateReadouts();
    refreshDielecTable();
    window.toast('Simulare resetată');
  });

  /* presetări */
  document.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-preset');
      if (p === 'aer') {
        state.inserted = false; state.erIndex = 0;
        if (el.dielec) el.dielec.value = 0;
      } else if (p === 'ceramic') {
        state.inserted = true; state.erIndex = 5; lastMaterial = 5;
        if (el.dielec) el.dielec.value = 5;
        complete('dielec');
      } else if (p === 'mare') {
        state.S = 580; state.d = 1;
        if (el.area) el.area.value = 580;
        if (el.dist) el.dist.value = 1;
        complete('area');
      } else if (p === 'departe') {
        state.d = 18;
        if (el.dist) el.dist.value = 18;
      } else if (p === 'slab') {
        state.E = 3;
        if (el.volt) el.volt.value = 3;
      } else if (p === 'puternic') {
        state.E = 24;
        if (el.volt) el.volt.value = 24;
      }
      document.querySelectorAll('input[type="range"]').forEach(function (r) {
        if (window.paintRange) window.paintRange(r);
      });
      if (btnInsert) {
        btnInsert.setAttribute('aria-pressed', state.inserted ? 'true' : 'false');
        btnInsert.textContent = state.inserted ? 'Scoate dielectricul' : 'Inserează dielectric';
      }
      if (window.CondSound) window.CondSound.tap();
      updateReadouts();
      refreshDielecTable();
    });
  });

  /* ---------------- grafic ---------------- */
  var gCanvas = document.getElementById('graphCanvas');
  var gctx = gCanvas ? gCanvas.getContext('2d') : null;
  var graphSamples = [];
  var GSPAN = 10;                       /* secunde de animație afișate */

  /* fiecare canvas își păstrează raportul de aspect declarat */
  var baseSizes = [
    { cv: canvas, w: 900, h: 600 },
    { cv: gCanvas, w: 900, h: 200 }
  ];
  function fitAll() {
    baseSizes.forEach(function (s) {
      var cv = s.cv;
      if (!cv) return;
      var parentStyle = getComputedStyle(cv.parentElement);
      var contentWidth = cv.parentElement.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
      var cssW = Math.min(contentWidth,cv===canvas?(innerHeight<=850&&innerWidth>=900?450:720):900);
      if(cssW<=0)return;
      var cssH = cv===gCanvas?160:cssW * (s.h / s.w);
      var dpr = window.PraxisCanvasResolution?.ratio(cssW,cssH)||2;
      cv.style.width = cssW+'px';
      cv.style.height = cssH + 'px';
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssH * dpr);
      cv._dpr = dpr;
      cv._w = cssW;
      cv._h = cssH;
    });
  }
  fitAll();
  window.addEventListener('resize', fitAll);

  /* ---------------- desenare scenă ---------------- */
  var VW = 900, VH = 600;               /* spațiu de desenare normalizat */
  var PLATE_CY = 240;
  var THICK = 12;
  var RAIL = 530;

  function mapArea(S) { return 110 + (S - 20) / 580 * 210; }         /* 110..320 px */
  function mapGap(d) { return 34 + (d - 0.5) / 19.5 * 216; }         /* 34..250 px */

  function roundRect(c, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  var wireParticles = [], lastWireFlow=0;
  for (var i = 0; i < 16; i++) wireParticles.push({ t: i / 16, side: i % 2 });

  function drawScene(now, dt) {
    var w = canvas._w || VW, h = canvas._h || VH;
    var dpr = canvas._dpr || 1;
    var c = ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    /* scalăm desenul din spațiul 900×600 în spațiul real */
    var sc = w / VW;
    /* pe ecrane mici textul desenat ar deveni ilizibil, deci îl mărim */
    var narrow = w < 560;
    var tScale = Math.max(1.25,14/(12*sc));
    function fs(px) { return Math.round(px * tScale) + 'px'; }
    function fw(px) { return px * (narrow ? 1.35 : 1); }
    c.save();
    c.scale(sc, sc);

    var C = cap();
    var U = voltage();
    var E = state.E;
    var frac = Math.min(1, Math.abs(state.q)/3.1875e-10);
    // Fade both plates together throughout discharge, even for large dielectrics.
    if(state.mode==='discharge'&&dischargeStart>0)
      frac=Math.min(1,dischargeStart/3.1875e-10)*Math.max(0,state.q/dischargeStart);
    var er = epsilonR();

    var plateH = mapArea(state.S);
    var gap = mapGap(state.d);
    var pTop = PLATE_CY - plateH / 2;
    var pBot = PLATE_CY + plateH / 2;
    var lx = VW / 2 - gap / 2 - THICK;
    var rx = VW / 2 + gap / 2;

    /* halou */
    var halo = c.createRadialGradient(VW / 2, PLATE_CY, 20, VW / 2, PLATE_CY, 320);
    halo.addColorStop(0, 'rgba(62,230,210,' + (0.03 + Math.min(1, frac) * 0.1) + ')');
    halo.addColorStop(1, 'rgba(62,230,210,0)');
    c.fillStyle = halo;
    c.fillRect(0, 0, VW, VH);

    /* grilă */
    c.save();
    c.strokeStyle = 'rgba(255,255,255,0.035)';
    c.lineWidth = 1;
    for (var gx = 30; gx < VW; gx += 40) {
      c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, VH); c.stroke();
    }
    for (var gy = 20; gy < VH; gy += 40) {
      c.beginPath(); c.moveTo(0, gy); c.lineTo(VW, gy); c.stroke();
    }
    c.restore();

    /* ---- dielectric ---- */
    var targetProg = state.inserted ? 1 : 0;
    state.dielecProgress = targetProg;
    if (state.dielecProgress > 0.005) {
      var mat = MATERIALS[state.erIndex] || MATERIALS[0];
      var insH = plateH * state.dielecProgress;
      var dy = pTop + (plateH - insH) / 2;
      c.save();
      c.globalAlpha = 0.5 * Math.min(1, state.dielecProgress);
      var mg = c.createLinearGradient(lx + THICK, 0, rx, 0);
      var col = mat.color;
      mg.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.16)');
      mg.addColorStop(0.5, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.34)');
      mg.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.16)');
      c.fillStyle = mg;
      roundRect(c, lx + THICK - 1, dy, gap + 2, insH, 4);
      c.fill();
      /* hașură */
      c.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.32)';
      c.lineWidth = 1;
      c.save();
      roundRect(c, lx + THICK, dy, gap, insH, 4);
      c.clip();
      for (var hx = lx + THICK - insH; hx < rx + insH; hx += 14) {
        c.beginPath();
        c.moveTo(hx, pBot);
        c.lineTo(hx + insH, pBot - insH);
        c.stroke();
      }
      c.restore();
      /* etichetă */
      if (state.dielecProgress > 0.6) {
        c.globalAlpha = (state.dielecProgress - 0.6) / 0.4;
        c.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.95)';
        c.font = '600 ' + fs(16) + ' Sora, Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText(mat.name + ' · εᵣ = ' + (mat.er >= 10 ? mat.er : String(mat.er).replace('.', ',')), VW / 2, 65);
      }
      c.restore();
    }

    /* ---- linii de câmp ---- */
    var fieldN = Math.max(5, Math.floor(plateH / 34));
    for (var f = 0; f < fieldN; f++) {
      var fy = pTop + 16 + (plateH - 32) * (f / (fieldN - 1));
      var a = Math.min(1, Math.abs(U)/9) * 0.5;
      c.save();
      c.strokeStyle = 'rgba(62,230,210,' + a + ')';
      c.lineWidth = 1.5;
      c.setLineDash([6, 8]);
      c.lineDashOffset = 0;
      c.beginPath();
      c.moveTo(lx + THICK + 2, fy);
      c.lineTo(rx - 2, fy);
      c.stroke();
      c.restore();
      if (frac > 0.1) {
        var ax = lx + THICK + (gap) * 0.55;
        c.save();
        c.globalAlpha = 0.12 + Math.min(1, frac) * 0.5;
        c.fillStyle = '#3ee6d2';
        c.beginPath();
        c.moveTo(ax + 6, fy);
        c.lineTo(ax - 3, fy - 4.5);
        c.lineTo(ax - 3, fy + 4.5);
        c.closePath();
        c.fill();
        c.restore();
      }
    }

    /* ---- armături ---- */
    function plate(x, ca, cb, glowCol) {
      c.save();
      c.shadowColor = glowCol;
      c.shadowBlur = 14 + Math.min(1, frac) * 34;
      var grd = c.createLinearGradient(x, 0, x + THICK, 0);
      grd.addColorStop(0, ca);
      grd.addColorStop(0.45, cb);
      grd.addColorStop(1, ca);
      c.fillStyle = grd;
      roundRect(c, x, pTop, THICK, plateH, 5);
      c.fill();
      c.restore();
      c.save();
      c.strokeStyle = 'rgba(255,255,255,0.3)';
      c.lineWidth = 1;
      roundRect(c, x + 0.5, pTop + 0.5, THICK - 1, plateH - 1, 5);
      c.stroke();
      c.restore();
    }
    plate(lx, '#0d5f5a', '#3ee6d2', 'rgba(62,230,210,0.85)');
    plate(rx, '#362566', '#a97bff', 'rgba(139,107,255,0.85)');

    /* ---- sarcini pe fețe ---- */
    var maxMarks = Math.max(4, Math.floor(plateH / 30));
    var nMark = frac > 0.001 ? maxMarks : 0;
    for (var k = 0; k < nMark; k++) {
      var cy = pTop + 18 + (plateH - 36) * (nMark === 1 ? 0.5 : k / (nMark - 1));
      var pulse = 0.9;
      /* plus */
      c.save();
      c.globalAlpha = pulse * Math.min(1, Math.abs(frac));
      c.translate(lx + THICK + Math.min(16, gap / 4), cy);
      c.fillStyle = 'rgba(255,182,77,0.95)';
      c.shadowColor = 'rgba(255,182,77,0.9)';
      c.shadowBlur = 10;
      c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = 'rgba(45,26,0,0.95)';
      c.lineWidth = 1.7;
      c.beginPath();
      c.moveTo(-3.2, 0); c.lineTo(3.2, 0);
      c.moveTo(0, -3.2); c.lineTo(0, 3.2);
      c.stroke();
      c.restore();
      /* minus */
      c.save();
      c.globalAlpha = pulse * Math.min(1, Math.abs(frac));
      c.translate(rx - Math.min(16, gap / 4), cy);
      c.fillStyle = 'rgba(150,205,255,0.95)';
      c.shadowColor = 'rgba(130,195,255,0.9)';
      c.shadowBlur = 10;
      c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = 'rgba(8,24,42,0.95)';
      c.lineWidth = 1.7;
      c.beginPath(); c.moveTo(-3.2, 0); c.lineTo(3.2, 0); c.stroke();
      c.restore();
    }

    /* ---- cotă distanță d ---- */
    c.save();
    c.strokeStyle = 'rgba(147,162,196,0.55)';
    c.lineWidth = 1;
    var dimY = pBot + 22;
    c.beginPath();
    c.moveTo(lx + THICK, dimY); c.lineTo(rx, dimY);
    c.moveTo(lx + THICK, dimY - 5); c.lineTo(lx + THICK, dimY + 5);
    c.moveTo(rx, dimY - 5); c.lineTo(rx, dimY + 5);
    c.stroke();
    c.fillStyle = 'rgba(180,196,224,0.9)';
    c.font = '500 ' + fs(12) + ' Inter, system-ui, sans-serif';
    c.textAlign = 'center';
    var dTxt = 'd = ' + fmt(state.d, 1) + ' mm';
    var labelW = c.measureText(dTxt).width + 14;
    c.fillStyle = 'rgba(8,13,28,0.92)';
    roundRect(c, VW / 2 - labelW / 2, dimY - 9 * tScale, labelW, 18 * tScale, 9);
    c.fill();
    c.fillStyle = 'rgba(190,205,232,0.95)';
    c.fillText(dTxt, VW / 2, dimY + 4);
    c.restore();

    /* ---- cotă arie S (vertical, în stânga) ---- */
    c.save();
    c.strokeStyle = 'rgba(147,162,196,0.4)';
    var dimX = 140; // Outside the wire route, including at maximum plate separation.
    c.beginPath();
    c.moveTo(dimX, pTop); c.lineTo(dimX, pBot);
    c.moveTo(dimX - 5, pTop); c.lineTo(dimX + 5, pTop);
    c.moveTo(dimX - 5, pBot); c.lineTo(dimX + 5, pBot);
    c.stroke();
    c.save();
    c.translate(dimX - 12, PLATE_CY);
    c.rotate(-Math.PI / 2);
    c.fillStyle = 'rgba(150,168,200,0.9)';
    c.font = '500 ' + fs(11) + ' Inter, system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText('S = ' + fmt(state.S, 0) + ' cm²', 0, 0);
    c.restore();
    c.restore();

    /* ---- etichete armături ---- */
    c.save();
    c.fillStyle = 'rgba(62,230,210,0.9)';
    c.font = '700 ' + fs(14) + ' Sora, Inter, sans-serif';
    c.textAlign = 'center';
    c.fillText('+', lx + THICK / 2, pTop - 14);
    c.fillStyle = 'rgba(169,123,255,0.9)';
    c.fillText('−', rx + THICK / 2, pTop - 14);
    c.restore();

    /* ---- circuit ---- */
    drawCircuit(c, now, dt, lx, rx, pBot, frac, narrow, fs);

    /* ---- legendă sus ---- */
    c.save();
    c.font = '600 ' + fs(11) + ' Inter, system-ui, sans-serif';
    c.textAlign = 'left';
    c.fillStyle = 'rgba(147,162,196,0.75)';
    c.fillText(narrow ? 'CONDENSATOR' : 'CONDENSATOR PLAN · SECȚIUNE', 30, 34);
    c.textAlign = 'right';
    var qTxt = 'Q = ' + window.siFormat(state.q, 'C', 3);
    c.fillStyle = 'rgba(238,243,255,0.85)';
    c.fillText(qTxt, VW - 30, 34);
    c.restore();

    c.restore();
  }

  function drawCircuit(c, now, dt, lx, rx, pBot, frac, narrow, fs) {
    var Y = 470;          /* orizontală sus de circuit */
    var YR = RAIL;        /* bara de jos */
    var xL = 190, xR = 712;
    var midL = 400, midR = 500;

    var active = state.mode;
    var current=CapacitorModel.current(state.q,cap(),state.E,R_MEASURE,state.mode);
    var flow=Math.abs(current)<1e-9?0:Math.sign(current);

    /* culoare fire */
    var wireCol = flow ? 'rgba(160,200,240,0.7)' : 'rgba(140,160,195,0.32)';

    c.save();
    c.lineWidth = 2.6;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = wireCol;
    c.beginPath();
    /* Connections leave the outer face at the plate midpoint. */
    c.moveTo(lx, PLATE_CY);
    c.lineTo(xL, PLATE_CY);
    c.lineTo(xL, YR);
    c.lineTo(288, YR);c.moveTo(312,YR);c.lineTo(midL,YR);
    /* dreapta */
    c.moveTo(rx + THICK, PLATE_CY);
    c.lineTo(xR, PLATE_CY);
    c.lineTo(xR, 485);c.moveTo(xR,515);c.lineTo(xR,YR);
    c.lineTo(midR, YR);
    c.stroke();
    c.restore();

    c.save();c.strokeStyle='rgba(220,232,250,.95)';c.lineWidth=2;c.strokeRect(xR-10,485,20,30);c.font='600 '+fs(14)+' sans-serif';c.fillStyle='rgba(220,232,250,.95)';c.textAlign='right';c.fillText('R = 1 MΩ',xR-18,505);c.restore();

    /* ---- componentă centrală: baterie sau rezistor ---- */
    var showBattery = state.mode !== 'discharge';
    var compAlpha = state.mode === 'off' ? 0.45 : 1;

    if (showBattery) {
      c.save();
      c.globalAlpha = compAlpha;
      c.translate(450, RAIL);
      /* borne */
      c.strokeStyle = 'rgba(255,182,77,0.95)';
      c.lineWidth = 2.6;
      c.beginPath();
      c.moveTo(-50, 0); c.lineTo(-14, 0);
      c.moveTo(6, 0); c.lineTo(50, 0);
      c.stroke();
      /* plăci */
      c.beginPath();
      c.moveTo(-14, -26); c.lineTo(-14, 26);
      c.lineWidth = 4;
      c.strokeStyle = 'rgba(255,182,77,0.95)';
      c.stroke();
      c.beginPath();
      c.moveTo(6, -15); c.lineTo(6, 15);
      c.strokeStyle = 'rgba(235,243,255,0.85)';
      c.lineWidth = 4;
      c.stroke();
      c.fillStyle = 'rgba(255,182,77,0.95)';
      c.font = '700 ' + fs(13) + ' Sora, Inter, sans-serif';
      c.textAlign = 'center';
      c.fillText('+', -14, -34);
      c.fillStyle = 'rgba(220,232,250,0.85)';
      c.fillText('−', 6, -34);
      /* valoare */
      c.fillStyle = 'rgba(238,243,255,0.9)';
      c.font = '600 ' + fs(12) + ' Inter, system-ui, sans-serif';
      c.textAlign = 'center';
      c.fillText('E = ' + fmt(state.E, 1) + ' V', 0, 48);
      c.restore();
    } else {
      c.save();c.strokeStyle='rgba(220,232,250,.95)';c.lineWidth=2.6;
      c.beginPath();c.moveTo(midL,RAIL);c.lineTo(midR,RAIL);c.stroke();
      c.fillStyle='rgba(220,232,250,.95)';c.font='600 '+fs(13)+' sans-serif';c.textAlign='center';c.fillText('Descărcare',450,RAIL+55);c.restore();
    }

    /* ---- întrerupător ---- */
    var swX = 300, swY = RAIL;
    c.save();
    var closed = state.mode !== 'off';
    c.strokeStyle = closed ? 'rgba(74,222,155,0.95)' : 'rgba(150,168,200,0.75)';
    c.lineWidth = 2.4;
    c.beginPath();
    c.arc(swX - 12, swY, 3.4, 0, Math.PI * 2);
    c.fillStyle = closed ? 'rgba(74,222,155,0.95)' : 'rgba(150,168,200,0.75)';
    c.fill();
    c.stroke();
    c.beginPath();
    c.arc(swX + 12, swY, 3.4, 0, Math.PI * 2);
    c.fill(); c.stroke();
    /* levier */
    c.beginPath();
    c.lineWidth = 2.6;
    c.moveTo(swX - 12, swY);
    if (closed) c.lineTo(swX + 12, swY);
    else c.lineTo(swX + 6, swY - 22);
    c.stroke();
    c.fillStyle = closed ? 'rgba(74,222,155,0.9)' : 'rgba(180,196,224,0.8)';
    c.font = '600 ' + fs(11) + ' Inter, system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText(closed ? 'închis' : 'deschis', swX, swY + 26);
    c.restore();

    /* ---- particule de curent ---- */
    if (flow) {
      if(lastWireFlow && flow!==lastWireFlow)wireParticles.forEach(function(p){p.t=1-p.t;});
      lastWireFlow=flow;
      /* trasee: armătură stângă → sursă → armătură dreaptă */
      var pathL = [[lx, PLATE_CY], [xL, PLATE_CY], [xL, YR], [midL, YR]];
      var pathR = [[midR, YR], [xR, YR], [xR, PLATE_CY], [rx + THICK, PLATE_CY]];
      wireParticles.forEach(function (p) {
        p.t += 0.25 * dt * Math.min(2,Math.abs(current)/9e-6);
        if (p.t > 1) p.t -= 1;
        var segs = p.side === 0 ? pathL : pathR;
        var pos = pointOnPath(segs, flow > 0 ? 1 - p.t : p.t);
        c.save();
        c.fillStyle = flow > 0 ? '#ffd79a' : '#8affc4';
        c.shadowColor = c.fillStyle;
        c.shadowBlur = 12;
        c.beginPath();
        c.arc(pos[0], pos[1], 3.2, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });
    }
  }

  function pointOnPath(segs, t) {
    var lens = [], total = 0, i;
    for (i = 1; i < segs.length; i++) {
      var l = Math.hypot(segs[i][0] - segs[i - 1][0], segs[i][1] - segs[i - 1][1]);
      lens.push(l); total += l;
    }
    var target = t * total;
    for (i = 0; i < lens.length; i++) {
      if (target <= lens[i]) {
        var p = lens[i] === 0 ? 0 : target / lens[i];
        return [segs[i][0] + (segs[i + 1][0] - segs[i][0]) * p,
        segs[i][1] + (segs[i + 1][1] - segs[i][1]) * p];
      }
      target -= lens[i];
    }
    return segs[segs.length - 1];
  }

  /* ---------------- grafic ---------------- */
  function pushSample() {
    var U = voltage();
    var E = state.E;
    var Imax = E / R_MEASURE;
    var I = 0;
    if (state.mode === 'charge') I = (E - U) / R_MEASURE;
    else if (state.mode === 'discharge') I = -U / R_MEASURE;
    graphSamples.push({
      t: state.tAnim,
      u: U / 24,
      i: I / 24e-6
    });
    while(graphSamples.length>2&&graphSamples[0].t<state.tAnim-GSPAN)graphSamples.shift();
  }

  function drawGraph() {
    if (!gctx) return;
    var w = gCanvas._w || 900, h = gCanvas._h || 200;
    var dpr = gCanvas._dpr || 1;
    var c = gctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);

    var padL = 40, padR = 12, padT = 12, padB = 20;
    var pw = w - padL - padR, ph = h - padT - padB;

    var scale=Math.max(1,...graphSamples.map(function(s){return Math.max(Math.abs(s.u),Math.abs(s.i));}));
    function gy(v){return padT+ph*(scale-v)/(2*scale);}
    /* grilă */
    c.strokeStyle = 'rgba(255,255,255,0.07)';
    c.lineWidth = 1;
    c.font = '500 12px Inter, system-ui, sans-serif';
    c.fillStyle = 'rgba(147,162,196,0.8)';
    for (var g = 0; g <= 4; g++) {
      var y = padT + ph * (g / 4);
      c.beginPath(); c.moveTo(padL, y); c.lineTo(padL + pw, y); c.stroke();
      c.textAlign = 'right';
      c.fillText((scale*(1-g/2)).toFixed(1), padL - 6, y + 3);
    }

    var tEnd = Math.max(GSPAN, state.tAnim);
    var tStart = tEnd - GSPAN;
    var visible = graphSamples.filter(function (s) { return s.t >= tStart; });

    function lineFor(key, color, width, glow) {
      if (visible.length < 2) return;
      c.save();
      c.strokeStyle = color;
      c.lineWidth = width;
      c.lineJoin = 'round';
      if (glow) { c.shadowColor = color; c.shadowBlur = 8; }
      c.beginPath();
      visible.forEach(function (s, idx) {
        var x = padL + pw * ((s.t - tStart) / GSPAN);
        var y = gy(s[key]);
        if (idx === 0) c.moveTo(x, y); else c.lineTo(x, y);
      });
      c.stroke();
      c.restore();
    }
    lineFor('u', '#3ee6d2', 2.2, true);
    lineFor('i', '#ffb64d', 1.8, false);

    /* marcaj timp curent */
    if (visible.length) {
      var last = visible[visible.length - 1];
      var lx2 = padL + pw * ((last.t - tStart) / GSPAN);
      c.save();
      c.fillStyle = '#fff';
      c.shadowColor = '#3ee6d2';
      c.shadowBlur = 10;
      c.beginPath();
      c.arc(lx2, gy(last.u), 3.4, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    /* axa timp */
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.beginPath();
    c.moveTo(padL, padT + ph);
    c.lineTo(padL + pw, padT + ph);
    c.stroke();
    c.fillStyle = 'rgba(147,162,196,0.75)';
    c.textAlign = 'left';
    c.fillText(tStart.toFixed(1)+' s',padL,h-4);c.textAlign='right';c.fillText(tEnd.toFixed(1)+' s',padL+pw,h-4);
  }

  /* ---------------- bucla principală ---------------- */
  var lastT = performance.now();
  var lastUi = 0;

  function loop(now) {
    var dtReal = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    var visible=!document.hidden&&canvas.getClientRects().length>0;
    if (!visible){requestAnimationFrame(loop);return;}
    if (!state.paused) {
      var dt = dtReal * state.speed;
      var C = cap();
      var tau = tauAnimFor(C);
      var E = state.E;

      state.q=CapacitorModel.advance(state.q,C,E,R_MEASURE,dt*R_MEASURE*C/tau,state.mode);
      if (state.q < 1e-20) state.q = 0;
      state.tAnim += dt;
      if (state.q < 0) state.q = 0;

      var U = voltage();
      var f = E > 0 ? U / E : 0;
      if (state.mode === 'charge' && f > 0.95) complete('charge');
      if (state.mode === 'discharge' && dischargeStart>1e-16 && state.q/dischargeStart < 0.05) complete('discharge');
      if (state.mode === 'charge' && state.E >= 24 && f > 0.95) complete('full');

      state.peakU = Math.max(state.peakU, U);

      pushSample();
      /* DOM-ul se actualizează mai rar decât desenul, ca să rămână fluid */
      if (now - lastUi > 90) { lastUi = now; updateReadouts(); }
    }

    drawScene(state.tAnim*1000, state.paused?0:dtReal * state.speed);
    drawGraph();
    requestAnimationFrame(loop);
  }

  window.CapacitorLab={snapshot:function(){return {...state,C:cap(),U:voltage(),I:CapacitorModel.current(state.q,cap(),state.E,R_MEASURE,state.mode),tauAnimation:tauAnimFor(cap()),tauPhysical:R_MEASURE*cap()};}};
  /* inițializare */
  updateReadouts();
  syncSwitchBtns();
  requestAnimationFrame(loop);

  /* la schimbarea geometriei cu sursa deconectată, sarcina rămâne — deci U variază */
  document.addEventListener('cond:geometry', updateReadouts);
})();
