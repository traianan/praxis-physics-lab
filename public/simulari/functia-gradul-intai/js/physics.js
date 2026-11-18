/* Tab Exemple în fizică: trei modele liniare, scenă animată și grafic. */
(function () {
  'use strict';
  const P = window.Praxis;
  if (!P) return;
  const $ = P.$;

  const MODELS = {
    motion: { title: 'Mișcarea rectilinie uniformă', tMax: 20, scene: 'Drumul mobilului' },
    ohm: { title: 'Legea lui Ohm', tMax: 1, scene: 'Circuitul electric' },
    tank: { title: 'Umplerea rezervorului', tMax: 20, scene: 'Rezervorul' }
  };
  const TANK_CAP = 1200;

  const state = {
    model: 'motion',
    playing: false,
    t: 0,
    phase: 0,
    params: {
      motion: { s0: 10, v: 4 },
      ohm: { R: 20, I: 0.25 },
      tank: { V0: 200, Q: 15 }
    }
  };

  let canvas = null;
  let ctx = null;
  let width = 0, height = 0, dpr = 1;
  let raf = 0;
  let lastTs = 0;
  let frame = 0;
  let ro = null;

  const el = {};

  function setFont(px, weight) {
    const ui = Math.min(P.uiScale ? P.uiScale() : 1, 1.3);
    ctx.font = (weight ? weight + ' ' : '') + (px * ui).toFixed(1) + 'px "Segoe UI", Roboto, Arial, sans-serif';
  }

  function model() { return MODELS[state.model]; }
  function params() { return state.params[state.model]; }

  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    let mult = 1;
    if (n > 5) mult = 10;
    else if (n > 2.5) mult = 5;
    else if (n > 2) mult = 2.5;
    else if (n > 1) mult = 2;
    return mult * pow;
  }

  function niceAxis(max) {
    const step = niceStep(max / 5);
    const count = Math.max(2, Math.ceil(max / step));
    return { max: step * count, step, count };
  }

  function derive() {
    if (state.model === 'motion') {
      const p = params();
      const s = p.s0 + p.v * state.t;
      const axis = niceAxis(Math.max(20, p.s0 + p.v * 20));
      return {
        x: state.t, y: s, m: p.v, n: p.s0,
        xMax: 20, xCount: 4,
        yMax: axis.max, yStep: axis.step, yCount: axis.count,
        xLabel: 't (s)', yLabel: 's (m)',
        xDigits: 0
      };
    }
    if (state.model === 'ohm') {
      const p = params();
      const U = p.R * p.I;
      const axis = niceAxis(Math.max(5, p.R));
      return {
        x: p.I, y: U, m: p.R, n: 0,
        xMax: 1, xCount: 4,
        yMax: axis.max, yStep: axis.step, yCount: axis.count,
        xLabel: 'I (A)', yLabel: 'U (V)',
        xDigits: 2
      };
    }
    const p = params();
    const V = p.V0 + p.Q * state.t;
    const axis = niceAxis(Math.max(100, p.V0 + p.Q * 20));
    return {
      x: state.t, y: V, m: p.Q, n: p.V0,
      xMax: 20, xCount: 4,
      yMax: axis.max, yStep: axis.step, yCount: axis.count,
      xLabel: 't (min)', yLabel: 'V (L)',
      xDigits: 0
    };
  }

  function fmtUnit(value, unit, digits) {
    return P.fmt(value, digits === undefined ? 2 : digits) + ' ' + unit;
  }

  function formula() {
    if (state.model === 'motion') {
      const p = params();
      const t = p.s0 === 0 ? P.fmt(p.v) + '·t' : P.fmt(p.s0) + ' + ' + P.fmt(p.v) + '·t';
      return 's(t) = ' + t;
    }
    if (state.model === 'ohm') return 'U = ' + P.fmt(params().R) + ' · I';
    const p = params();
    return 'V(t) = ' + P.fmt(p.V0) + ' + ' + P.fmt(p.Q) + '·t';
  }

  function interpretation() {
    if (state.model === 'motion') {
      const p = params();
      return 'Panta dreptei este viteza: ' + P.fmt(p.v) + ' m/s. Ordonata la origine este poziția inițială: ' + P.fmt(p.s0) + ' m.';
    }
    if (state.model === 'ohm') {
      return 'Panta dreptei este rezistența: ' + P.fmt(params().R) + ' Ω. Dreapta trece prin origine: U = 0 când I = 0.';
    }
    const p = params();
    return 'Panta dreptei este debitul: ' + P.fmt(p.Q) + ' L/min. Ordonata la origine este volumul inițial: ' + P.fmt(p.V0) + ' L.';
  }

  function explainText() {
    if (state.model === 'motion') {
      return 'Scena arată mobilul pe drum, iar graficul de dedesubt arată poziția s în funcție de timpul t. Panta dreptei este viteza constantă, iar intersecția cu axa verticală este poziția inițială.';
    }
    if (state.model === 'ohm') {
      return 'Scena arată un circuit simplu cu rezistență. Graficul arată tensiunea U în funcție de intensitatea I; panta este rezistența R. Pentru un rezistor ohmic, dependența este liniară și trece prin origine. Sursa ideală: r = 0 Ω, E = U.';
    }
    return 'Scena arată rezervorul care se umple. Graficul arată volumul V în funcție de timp; panta este debitul constant Q, iar intersecția cu axa verticală este volumul inițial V₀.';
  }

  function updateDom() {
    const d = derive();
    const p = params();
    const m = model();

    el.title.textContent = m.title;
    PraxisMath.set(el.equation,formula());
    PraxisMath.set(el.formula,formula());
    el.interpret.textContent = interpretation();
    el.explain.textContent = explainText();

    if (state.model === 'motion') {
      const td = Math.round(state.t * 10) / 10;
      const sd = p.s0 + p.v * td;
      el.noteLabel.textContent = 'Poziția la t = ' + P.fmt(td) + ' s';
      el.noteValue.textContent = 's = ' + P.fmt(sd) + ' m';
      el.tileLabels[0].textContent = 's₀';
      el.tileLabels[1].textContent = 'v';
      el.tileLabels[2].textContent = 't';
      el.tileLabels[3].textContent = 's(t)';
      el.tileValues[0].textContent = fmtUnit(p.s0, 'm', 0);
      el.tileValues[1].textContent = fmtUnit(p.v, 'm/s', 1);
      el.tileValues[2].textContent = fmtUnit(td, 's', 1);
      el.tileValues[3].textContent = fmtUnit(sd, 'm', 1);
    } else if (state.model === 'ohm') {
      const id = Math.round(p.I * 100) / 100;
      const ud = p.R * id;
      el.noteLabel.textContent = 'Tensiunea la I = ' + P.fmt(id, 2) + ' A';
      el.noteValue.textContent = 'U = ' + P.fmt(ud, 2) + ' V';
      el.tileLabels[0].textContent = 'R';
      el.tileLabels[1].textContent = 'I';
      el.tileLabels[2].textContent = 'U';
      el.tileLabels[3].textContent = 'P = U·I';
      el.tileValues[0].textContent = fmtUnit(p.R, 'Ω', 0);
      el.tileValues[1].textContent = fmtUnit(id, 'A', 2);
      el.tileValues[2].textContent = fmtUnit(ud, 'V', 2);
      el.tileValues[3].textContent = fmtUnit(ud * id, 'W', 2);
    } else {
      const td = Math.round(state.t * 10) / 10;
      const vd = p.V0 + p.Q * td;
      el.noteLabel.textContent = 'Volumul la t = ' + P.fmt(td) + ' min';
      el.noteValue.textContent = 'V = ' + P.fmt(vd) + ' L';
      el.tileLabels[0].textContent = 'V₀';
      el.tileLabels[1].textContent = 'Q';
      el.tileLabels[2].textContent = 't';
      el.tileLabels[3].textContent = 'V(t)';
      el.tileValues[0].textContent = fmtUnit(p.V0, 'L', 0);
      el.tileValues[1].textContent = fmtUnit(p.Q, 'L/min', 0);
      el.tileValues[2].textContent = fmtUnit(td, 'min', 1);
      el.tileValues[3].textContent = fmtUnit(vd, 'L', 0);
    }

    // slider outputs
    if (state.model === 'motion') {
      el.outS0.textContent = P.fmt(p.s0);
      el.outV.textContent = P.fmt(p.v);
    } else if (state.model === 'ohm') {
      el.outR.textContent = P.fmt(p.R);
      el.outI.textContent = P.fmt(p.I, 2);
    } else {
      el.outV0.textContent = P.fmt(p.V0);
      el.outQ.textContent = P.fmt(p.Q);
    }

    el.canvas.setAttribute('aria-label', 'Scenă și grafic pentru ' + m.title + ': ' + formula());
    draw();
  }

  /* ---------- desen canvas ---------- */
  function cssVar(name, fallback) {
    const value = getComputedStyle(canvas).getPropertyValue(name).trim();
    return value || fallback;
  }

  function colors() {
    return {
      ink: cssVar('--ink', '#123f38'),
      muted: cssVar('--muted', '#5c6c63'),
      line: cssVar('--line', '#e1e6da'),
      grid: cssVar('--chart-grid', 'rgba(14,63,57,.09)'),
      axis: cssVar('--chart-axis', '#9fb2a7'),
      text: cssVar('--chart-text', '#6a7b71'),
      chartLine: cssVar('--chart-line', '#0e3f39'),
      point: cssVar('--chart-point', '#b87327'),
      n: cssVar('--chart-n', '#1b5b50'),
      guide: cssVar('--chart-guide', 'rgba(14,63,57,.38)'),
      fill: cssVar('--chart-fill', 'rgba(27,91,80,.10)'),
      surface: cssVar('--surface', '#fdfef8'),
      water: cssVar('--chart-water', '#8fb9ae'),
      waterDeep: cssVar('--chart-water-deep', '#4e8d7f'),
      brand: cssVar('--brand', '#0e3f39'),
      amber: cssVar('--amber', '#c07a2c'),
      soft: cssVar('--surface-soft', '#ecf3eb')
    };
  }

  function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function fit() {
    if (!canvas) return;
    const box = canvas.parentElement;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = PraxisCanvasResolution.ratio(rect.width,rect.height);
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === width && h === height && canvas.width === Math.round(w*dpr)) return;
    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  function draw() {
    if (!canvas) return;
    if (!width || !height) { fit(); if (!width) return; }
    if (!ctx) ctx = canvas.getContext('2d');
    const c = colors();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const sceneH = Math.max(90, Math.round(height * 0.37));
    drawScene(sceneH, c);
    drawGraph(sceneH, c);
  }

  function drawScene(sceneH, c) {
    ctx.save();
    ctx.textBaseline = 'middle';
    if (state.model === 'motion') drawMotionScene(sceneH, c);
    else if (state.model === 'ohm') drawOhmScene(sceneH, c);
    else drawTankScene(sceneH, c);
    ctx.restore();
  }

  function drawMotionScene(sceneH, c) {
    const p = params();
    const groundY = sceneH * 0.62;
    const startX = width * 0.16;
    const endX = width * 0.88;
    const tMax = 20;
    const carX = startX + 15 + (endX - startX - 30) * P.clamp(state.t / tMax, 0, 1);

    // banda drumului
    ctx.fillStyle = c.soft;
    roundRect(width * 0.04, groundY - 10, width * 0.92, 34, 8);
    ctx.fill();

    // drum
    ctx.fillStyle = c.line;
    ctx.globalAlpha = 0.7;
    roundRect(width * 0.05, groundY + 6, width * 0.9, 12, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(width * 0.07, groundY + 12);
    ctx.lineTo(width * 0.93, groundY + 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // marcaje de start și sosire
    [startX, endX].forEach((x, index) => {
      ctx.strokeStyle = index === 0 ? c.n : c.axis;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, groundY + 4);
      ctx.lineTo(x, groundY - 20);
      ctx.stroke();
      ctx.fillStyle = index === 0 ? c.n : c.axis;
      ctx.beginPath();
      ctx.moveTo(x, groundY - 20);
      ctx.lineTo(x + 11, groundY - 16);
      ctx.lineTo(x, groundY - 12);
      ctx.closePath();
      ctx.fill();
    });

    // automobil
    drawCar(carX, groundY, c);

    // etichete
    setFont(11.5, '600');
    ctx.textAlign = 'center';
    ctx.fillStyle = c.n;
    const td = Math.round(state.t * 10) / 10;
    ctx.fillText('s(t) = ' + P.fmt(p.s0 + p.v * td) + ' m', carX, groundY - 36);

    const compact = width < 430;
    if (!compact) {
      ctx.fillStyle = c.muted;
      setFont(10.5);
      ctx.textAlign = 'left';
      ctx.fillText('s₀ = ' + P.fmt(p.s0) + ' m', startX - 6, groundY + 30);
      ctx.textAlign = 'right';
      ctx.fillText('v = ' + P.fmt(p.v) + ' m/s', endX, groundY + 30);
    }
  }

  function drawCar(x, groundY, c) {
    const y = groundY + 2;
    ctx.save();
    ctx.fillStyle = c.brand;
    roundRect(x - 23, y - 15, 46, 16, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 15);
    ctx.lineTo(x - 10, y - 24);
    ctx.lineTo(x + 8, y - 24);
    ctx.lineTo(x + 15, y - 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.surface;
    roundRect(x - 9, y - 21, 15, 6, 2);
    ctx.fill();
    ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(x - 13, y + 2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 13, y + 2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.amber;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x + 27, y - 8);
    ctx.lineTo(x + 41, y - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 36, y - 13);
    ctx.lineTo(x + 41, y - 8);
    ctx.lineTo(x + 36, y - 3);
    ctx.stroke();
    ctx.restore();
  }

  function drawOhmScene(sceneH, c) {
    const p = params();
    const compact = width < 430;
    const x0 = width * 0.15;
    const x1 = width * 0.85;
    const y0 = sceneH * (compact ? 0.27 : 0.2);
    const y1 = sceneH * 0.82;
    const midY = (y0 + y1) / 2;
    const r = 7;

    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x0, midY + 4);
    ctx.moveTo(x0, midY - 4);
    ctx.lineTo(x0, y0);
    ctx.stroke();

    // baterie pe latura stângă
    ctx.strokeStyle = c.brand;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x0 - 11, midY - 4);
    ctx.lineTo(x0 + 11, midY - 4);
    ctx.moveTo(x0 - 6, midY + 4);
    ctx.lineTo(x0 + 6, midY + 4);
    ctx.stroke();
    const iDisp = Math.round(p.I * 100) / 100;
    ctx.fillStyle = c.muted;
    setFont(11, '600');
    if (compact) {
      ctx.textAlign = 'left';
      ctx.fillText('E, r', x0 + 12, midY - 14);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText('E, r', x0 - 17, midY);
    }

    // rezistor pe latura de sus
    const rw = 58, rh = 20;
    ctx.fillStyle = c.surface;
    ctx.strokeStyle = c.amber;
    ctx.lineWidth = 2;
    roundRect(width / 2 - rw / 2, y0 - rh / 2, rw, rh, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.amber;
    setFont(12, '600');
    ctx.textAlign = 'center';
    ctx.fillText('R', width / 2, y0);
    ctx.fillStyle = c.muted;
    setFont(11);
    ctx.fillText('R = ' + P.fmt(p.R) + ' Ω', width / 2, y0 - 19);

    // curent
    ctx.fillStyle = c.muted;
    ctx.textAlign = 'left';
    ctx.fillText('I = ' + P.fmt(iDisp, 2) + ' A', x0 + 12, midY + 2);

    // electroni
    const phase = state.phase % 1;
    const dots = 14;
    for (let i = 0; i < dots; i++) {
      const d = ((i / dots) + phase) % 1;
      const pos = pointOnRect(d, x0, y0, x1, y1);
      if(pos.x===x0 && Math.abs(pos.y-midY)<8)continue;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3.1, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? c.amber : c.chartLine;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function pointOnRect(t, x0, y0, x1, y1) {
    const w = x1 - x0;
    const h = y1 - y0;
    const per = 2 * (w + h);
    let d = t * per;
    if (d < w) return { x: x0 + d, y: y0 };
    d -= w;
    if (d < h) return { x: x1, y: y0 + d };
    d -= h;
    if (d < w) return { x: x1 - d, y: y1 };
    d -= w;
    return { x: x0, y: y1 - d };
  }

  function drawTankScene(sceneH, c) {
    const p = params();
    const compact = width < 430;
    const tankW = Math.min(220, width * 0.36);
    const x0 = width / 2 - tankW / 2;
    const x1 = width / 2 + tankW / 2;
    const y0 = sceneH * (compact ? 0.2 : 0.16);
    const y1 = sceneH * 0.82;
    const innerH = y1 - y0 - 8;
    const volume = P.clamp(p.V0 + p.Q * (Math.round(state.t * 10) / 10), 0, TANK_CAP);
    const waterH = (volume / TANK_CAP) * innerH;

    // suport
    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0 - 8, y1 + 4);
    ctx.lineTo(x1 + 8, y1 + 4);
    ctx.stroke();

    // rezervor
    ctx.fillStyle = c.surface;
    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 2;
    roundRect(x0, y0, tankW, y1 - y0, 8);
    ctx.fill();
    ctx.stroke();

    // apă
    if (waterH > 0.5) {
      ctx.save();
      roundRect(x0 + 3, y0 + 3, tankW - 6, y1 - y0 - 6, 6);
      ctx.clip();
      const wy = y1 - 4 - waterH;
      ctx.fillStyle = c.water;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(x0 + 3, wy, tankW - 6, waterH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = c.waterDeep;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0 + 3, wy);
      ctx.lineTo(x1 - 3, wy);
      ctx.stroke();
      ctx.restore();
    }

    // gradații
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const gy = y1 - 4 - (i / 5) * innerH;
      ctx.beginPath();
      ctx.moveTo(x1 - 10, gy);
      ctx.lineTo(x1 - 3, gy);
      ctx.stroke();
    }

    // robinet
    ctx.strokeStyle = c.brand;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x0 + 18, y0 - 12);
    ctx.lineTo(x0 + 18, y0 - 2);
    ctx.lineTo(x0 + 32, y0 - 2);
    ctx.stroke();
    ctx.fillStyle = c.brand;
    roundRect(x0 + 12, y0 - 16, 14, 6, 2);
    ctx.fill();

    // picături
    if (state.playing) {
      const dropPhase = (state.phase * 2) % 1;
      for (let i = 0; i < 2; i++) {
        const dy = y0 + 4 + ((dropPhase + i * 0.5) % 1) * (waterH > 0 ? 30 : 60);
        ctx.beginPath();
        ctx.arc(x0 + 25, dy, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = c.waterDeep;
        ctx.fill();
      }
    }

    // etichete
    ctx.fillStyle = c.n;
    setFont(12, '600');
    ctx.textAlign = 'center';
    ctx.fillText('V = ' + P.fmt(volume) + ' L', width / 2, y0 - 12);
    if (!compact) {
      ctx.fillStyle = c.muted;
      setFont(10.5);
      ctx.textAlign = 'left';
      ctx.fillText('V₀ = ' + P.fmt(p.V0) + ' L', x0, y1 + 18);
      ctx.textAlign = 'right';
      ctx.fillText('Q = ' + P.fmt(p.Q) + ' L/min', x1, y1 + 18);
    }
  }

  function drawGraph(sceneH, c) {
    const d = derive();
    const left = width < 430 ? 42 : 54;
    const right = 16;
    const top = sceneH + 24;
    const bottom = height - 42;
    const plotW = width - left - right;
    const plotH = bottom - top;
    if (plotW < 40 || plotH < 40) return;
    const sx = (x) => left + (x / d.xMax) * plotW;
    const sy = (y) => bottom - (y / d.yMax) * plotH;

    // grilă
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= d.xCount; i++) {
      const x = left + (i / d.xCount) * plotW;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    }
    for (let i = 0; i <= d.yCount; i++) {
      const y = top + (i / d.yCount) * plotH;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke();
    }
    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(left + plotW, bottom); ctx.stroke();

    // etichete axe
    ctx.fillStyle = c.text;
    setFont(10);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (let i = 0; i <= d.xCount; i++) {
      const val = (i / d.xCount) * d.xMax;
      ctx.fillText(P.fmt(val, d.xDigits), left + (i / d.xCount) * plotW, bottom + 5);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= d.yCount; i++) {
      const val = i * d.yStep;
      ctx.fillText(P.fmt(val, d.yStep < 1 ? 2 : 0), left - 6, bottom - (i / d.yCount) * plotH);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    setFont(10.5, '600');
    ctx.fillStyle = c.muted;
    ctx.fillText(d.xLabel, left + plotW, height - 5);
    ctx.textAlign = 'left';
    ctx.fillText(d.yLabel, left - 38, top - 5);

    // dreapta
    const lineEndX = Math.min(d.xMax, d.m > 0 ? (d.yMax - d.n) / d.m : d.xMax);
    const xEnd = Math.max(0, lineEndX);
    const yEnd = d.n + d.m * xEnd;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, plotW, plotH);
    ctx.clip();

    // umplere sub dreaptă
    ctx.beginPath();
    ctx.moveTo(sx(0), bottom);
    ctx.lineTo(sx(0), sy(d.n));
    ctx.lineTo(sx(xEnd), sy(yEnd));
    ctx.lineTo(sx(xEnd), bottom);
    ctx.closePath();
    ctx.fillStyle = c.fill;
    ctx.fill();

    ctx.strokeStyle = c.chartLine;
    ctx.lineWidth = 2.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(d.n));
    ctx.lineTo(sx(xEnd), sy(yEnd));
    ctx.stroke();

    // ordonata la origine (înaintea punctului curent)
    if (d.n >= 0 && d.n <= d.yMax) {
      ctx.beginPath();
      ctx.arc(sx(0), sy(d.n), 4, 0, Math.PI * 2);
      ctx.fillStyle = c.n;
      ctx.fill();
    }

    // punctul curent
    if (d.x >= 0 && d.x <= d.xMax && d.y >= 0 && d.y <= d.yMax) {
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = c.guide;
      ctx.beginPath();
      ctx.moveTo(sx(d.x), sy(d.y));
      ctx.lineTo(sx(d.x), bottom);
      ctx.moveTo(sx(d.x), sy(d.y));
      ctx.lineTo(left, sy(d.y));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(sx(d.x), sy(d.y), 7, 0, Math.PI * 2);
      ctx.fillStyle = c.surface;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx(d.x), sy(d.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = c.point;
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- animație ---------- */
  function loop(ts) {
    if (!state.playing) { raf = 0; return; }
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.06);
    lastTs = ts;
    state.phase = (state.phase + dt * (state.model === 'ohm' ? (0.15 + params().I * 1.2) : 0.35)) % 1;

    if (state.model === 'motion') {
      state.t = Math.min(20, state.t + dt * 4);
      if (state.t >= 20) finish();
    } else if (state.model === 'tank') {
      state.t = Math.min(20, state.t + dt * 3);
      if (state.t >= 20) finish();
    } else {
      params().I = Math.min(1, params().I + dt * 0.35);
      el.sliders.I.value = String(params().I);
      P.syncRange(el.sliders.I);
      if (params().I >= 1) finish();
    }
    render();
    if (state.playing) raf = requestAnimationFrame(loop);
  }

  function finish() {
    state.playing = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    el.btnPlay.textContent = '▶ Redă';
    el.btnPlay.setAttribute('aria-pressed', 'false');
  }

  function play() {
    if (state.playing) return;
    // dacă animația este la capăt, o luăm de la început
    if (state.model === 'motion' || state.model === 'tank') {
      if (state.t >= 19.99) state.t = 0;
    } else if (params().I >= 0.999) {
      params().I = 0;
    }
    state.playing = true;
    lastTs = 0;
    el.btnPlay.textContent = '⏸ Pauză';
    el.btnPlay.setAttribute('aria-pressed', 'true');
    P.sound.play('start');
    if (!raf) raf = requestAnimationFrame(loop);
    render();
  }

  function pause() {
    if (!state.playing) return;
    finish();
    P.sound.play('stop');
    render();
  }

  function togglePlay() {
    if (state.playing) pause(); else play();
  }

  function reset() {
    pause();
    state.t = 0;
    if (state.model === 'ohm') {
      params().I = 0;
      el.sliders.I.value = '0';
      P.syncRange(el.sliders.I);
    }
    state.phase = 0;
    render();
    P.sound.play('tap');
    P.toast('Modelul a revenit la starea inițială.');
  }

  function setModel(key) {
    if (!MODELS[key] || key === state.model) return;
    pause();
    state.model = key;
    state.t = 0;
    state.phase = 0;
    P.$$('.chip[data-model]').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.model === key);
    });
    P.$$('.phys-group').forEach((group) => {
      group.hidden = group.dataset.for !== key;
    });
    syncControls();
    render();
    P.sound.play('tap');
  }

  function syncControls() {
    const p = params();
    if (state.model === 'motion') {
      el.sliders.s0.value = String(p.s0);
      el.sliders.v.value = String(p.v);
      el.outputs.s0.textContent = P.fmt(p.s0);
      el.outputs.v.textContent = P.fmt(p.v);
      P.syncRange(el.sliders.s0);
      P.syncRange(el.sliders.v);
    } else if (state.model === 'ohm') {
      el.sliders.R.value = String(p.R);
      el.sliders.I.value = String(p.I);
      el.outputs.R.textContent = P.fmt(p.R);
      el.outputs.I.textContent = P.fmt(p.I, 2);
      P.syncRange(el.sliders.R);
      P.syncRange(el.sliders.I);
    } else {
      el.sliders.V0.value = String(p.V0);
      el.sliders.Q.value = String(p.Q);
      el.outputs.V0.textContent = P.fmt(p.V0);
      el.outputs.Q.textContent = P.fmt(p.Q);
      P.syncRange(el.sliders.V0);
      P.syncRange(el.sliders.Q);
    }
  }

  function clampParam(key, value) {
    const ranges = {
      s0: [0, 40], v: [1, 10], R: [5, 100], I: [0, 1], V0: [0, 400], Q: [5, 40]
    };
    const range = ranges[key] || [value, value];
    return P.clamp(value, range[0], range[1]);
  }

  function bindSlider(input, key, digits) {
    input.addEventListener('input', () => {
      const value = clampParam(key, Number(input.value));
      params()[key] = value;
      if (state.model === 'ohm' && key === 'I') pause();
      const output = el.outputs[key];
      if (output) output.textContent = P.fmt(value, digits);
      P.syncRange(input);
      render();
      frame += 1;
      if (frame % 12 === 0) P.sound.play('tick');
    });
  }

  function bindStep(key, delta, digits) {
    P.$$('[data-phys-step="' + key + '"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = Number(params()[key]);
        const next = clampParam(key, P.roundTo(current + Number(btn.dataset.dir || delta), Math.abs(Number(btn.dataset.dir || delta))));
        params()[key] = next;
        const slider = el.sliders[key];
        if (slider) {
          slider.value = String(next);
          P.syncRange(slider);
        }
        const output = el.outputs[key];
        if (output) output.textContent = P.fmt(next, digits);
        if (key === 'I' && state.playing) pause();
        render();
        P.sound.play('tick');
      });
    });
  }

  function render() {
    updateDom();
  }

  function init() {
    canvas = $('#physCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    el.title = $('#physTitle');
    el.equation = $('#physEquation');
    el.noteLabel = $('#physNoteLabel');
    el.noteValue = $('#physNoteValue');
    el.explain = $('#physExplain');
    el.formula = $('#physFormula');
    el.interpret = $('#physInterpret');
    el.btnPlay = $('#btnPhysPlay');
    el.btnReset = $('#btnPhysReset');
    el.canvas = canvas;
    el.sliders = { s0: $('#slS0'), v: $('#slV'), R: $('#slR'), I: $('#slI'), V0: $('#slV0'), Q: $('#slQ') };
    el.outputs = {
      s0: $('#valS0'), v: $('#valV'), R: $('#valR'), I: $('#valI'), V0: $('#valV0'), Q: $('#valQ')
    };
    el.outS0 = $('#valS0');
    el.outV = $('#valV');
    el.outR = $('#valR');
    el.outI = $('#valI');
    el.outV0 = $('#valV0');
    el.outQ = $('#valQ');
    el.tiles = $('#physTiles');
    el.tileValues = Array.from(el.tiles.querySelectorAll('b'));
    el.tileLabels = Array.from(el.tiles.querySelectorAll('.tile span'));

    bindSlider(el.sliders.s0, 's0', 0);
    bindSlider(el.sliders.v, 'v', 1);
    bindSlider(el.sliders.R, 'R', 0);
    bindSlider(el.sliders.I, 'I', 2);
    bindSlider(el.sliders.V0, 'V0', 0);
    bindSlider(el.sliders.Q, 'Q', 0);
    bindStep('s0', 1, 0);
    bindStep('v', 0.5, 1);
    bindStep('R', 5, 0);
    bindStep('I', 0.05, 2);
    bindStep('V0', 10, 0);
    bindStep('Q', 1, 0);

    el.btnPlay.addEventListener('click', togglePlay);
    el.btnReset.addEventListener('click', reset);
    P.$$('.chip[data-model]').forEach((chip) => {
      chip.addEventListener('click', () => setModel(chip.dataset.model));
    });

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => { fit(); draw(); });
      ro.observe(canvas.parentElement);
    }
    window.addEventListener('resize', () => { fit(); draw(); });
    document.addEventListener('praxis:tabchange', (event) => {
      if (event.detail.tab !== 'fizica') {
        pause();
      } else {
        setTimeout(() => { fit(); draw(); }, 40);
      }
    });
    document.addEventListener('praxis:visibility', () => {
      if (document.hidden) pause();
    });
    document.addEventListener('praxis:prefs', () => draw());
    document.addEventListener('praxis:theme', () => draw());

    syncControls();
    requestAnimationFrame(() => { fit(); render(); });
  }

  window.addEventListener("praxis-language-change",()=>render());
  P.Physics = {
    init,
    pause,
    getState: () => ({
      model: state.model,
      playing: state.playing,
      t: state.t,
      raf: raf,
      I: params().I
    })
  };
})();
