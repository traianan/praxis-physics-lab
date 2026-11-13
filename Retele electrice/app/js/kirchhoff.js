/* ============================================================
   kirchhoff.js — animație nod + laborator rețea (legile Kirchhoff)
   ============================================================ */
'use strict';

/* ============================================================
   Flow — motor de animație pentru electroni pe un <path> SVG
   ============================================================ */
class Flow {
  constructor(svg, opts = {}) {
    this.svg = svg;
    this.branches = [];
    this.running = false;
    this.speed = opts.speed || 1;
    this.t = 0;
    this._raf = null;
    this._last = 0;
    this._layer = svgEl('g', { class: 'flow-layer' }, svg);
  }
  /** path: element SVG; getI: () => amperaj; dir: +1 / -1 (sensul considerat pozitiv) */
  add(path, { getI, color = '#7dd3fc', spacing = 34, r = 3.1, showNeg = '#fda4af' }) {
    const len = path.getTotalLength();
    const n = Math.max(2, Math.round(len / spacing));
    const dots = [];
    for (let i = 0; i < n; i++) {
      const c = svgEl('circle', { r, class: 'electron', fill: color }, this._layer);
      dots.push({ p: i / n, el: c });
    }
    this.branches.push({ path, len, dots, getI, color, showNeg });
    return this;
  }
  setVisible(v) { this._layer.style.display = v ? '' : 'none'; }
  start() {
    if (this.running) return;
    this.running = true;
    this._last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this._last) / 1000);
      this._last = now;
      this.tick(dt);
      if (this.running) this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; if (this._raf) cancelAnimationFrame(this._raf); }
  tick(dt) {
    for (const b of this.branches) {
      const I = b.getI() || 0;
      const sp = Math.abs(I) * 0.16 * this.speed;
      const sign = I >= 0 ? 1 : -1;
      b.dots.forEach((d, i) => {
        if (sp > 0.0005) {
          d.p = (d.p + sign * sp * dt + 1) % 1;
        }
        const pt = b.path.getPointAtLength(d.p * b.len);
        d.el.setAttribute('cx', pt.x);
        d.el.setAttribute('cy', pt.y);
        d.el.setAttribute('fill', I >= 0 ? b.color : b.showNeg);
        d.el.setAttribute('opacity', Math.abs(I) < 0.02 ? 0.18 : 0.95);
      });
    }
  }
}

/* ============================================================
   ANIMAȚIA NODULUI (prima lege)
   ============================================================ */
const NodeAnim = (() => {
  let flow = null, built = false;
  const S = { I1: 2, I2: 1.5, I3: 3.5, speed: 1, closed: true };

  function build() {
    const svg = $('#animNode');
    if (!svg || built) return;
    svg.innerHTML = SVG_DEFS;
    const A = [300, 218];
    const g = svgEl('g', {}, svg);

    // trasee (linii spre nod)
    const P1 = [70, 76], P2 = [70, 360], P3 = [548, 218];
    const pIn1 = svgEl('path', { d: `M${P1[0]} ${P1[1]} L${A[0]} ${A[1]}`, class: 'wire' }, g);
    const pIn2 = svgEl('path', { d: `M${P2[0]} ${P2[1]} L${A[0]} ${A[1]}`, class: 'wire' }, g);
    const pOut = svgEl('path', { d: `M${A[0]} ${A[1]} L${P3[0]} ${P3[1]}`, class: 'wire' }, g);

    const angle = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
    const resAlong = (p, q, frac, label) => {
      const cx = p[0] + (q[0] - p[0]) * frac, cy = p[1] + (q[1] - p[1]) * frac;
      const a = angle(p, q) * Math.PI / 180;
      const gg = svgEl('g', { transform: `translate(${cx},${cy}) rotate(${angle(p, q)})` }, g);
      svgEl('rect', { x: -26, y: -10, width: 52, height: 20, rx: 3, class: 'res-box' }, gg);
      // eticheta se pune perpendicular pe latură, ca să nu se suprapună
      svgEl('text', {
        x: cx + Math.sin(a) * 22, y: cy - Math.cos(a) * 22 + 4,
        class: 'i-label', text: label, 'text-anchor': 'middle',
      }, g);
      return gg;
    };
    resAlong(P1, A, 0.44, 'R₁');
    resAlong(P2, A, 0.44, 'R₂');
    // R₃ și sursa pe latura de ieșire: R₃ la 1/3, sursa lângă capăt
    const g3 = svgEl('g', { transform: `translate(${A[0] + (P3[0] - A[0]) * 0.36},${A[1]})` }, g);
    svgEl('rect', { x: -26, y: -10, width: 52, height: 20, rx: 3, class: 'res-box' }, g3);
    svgEl('text', { x: 0, y: -20, class: 'i-label', text: 'R₃', 'text-anchor': 'middle' }, g3);

    // sursa + întrerupătorul
    battSymbol(g, 470, 218, false);
    svgEl('text', { x: 470, y: 196, class: 'e-label', text: 'E, r', 'text-anchor': 'middle' }, g);
    const sw = svgEl('g', { transform: 'translate(522,218)' }, g);
    svgEl('circle', { cx: 0, cy: 0, r: 3.4, fill: '#93a8c9' }, sw);
    const swLever = svgEl('line', { x1: 0, y1: 0, x2: 12, y2: -13, stroke: '#fbbf24', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, sw);
    svgEl('circle', { cx: 13, cy: 0, r: 3.4, fill: '#93a8c9' }, sw);
    svgEl('text', { x: 6, y: -22, class: 'e-label', text: 'K', 'text-anchor': 'middle' }, sw);

    // nod
    svgEl('circle', { cx: A[0], cy: A[1], r: 13, fill: 'rgba(34,211,238,.12)' }, g);
    svgEl('circle', { cx: A[0], cy: A[1], r: 7, class: 'node-dot', filter: 'url(#glowC)' }, g);
    svgEl('text', { x: A[0] + 16, y: A[1] - 16, class: 'node-label', 'font-size': 15, text: 'A' }, g);

    // săgeți de sens
    const arrow = (x, y, rot, id, cls) => {
      const gg = svgEl('g', { transform: `translate(${x},${y}) rotate(${rot})` }, g);
      svgEl('path', { d: 'M-9 -6 L9 0 L-9 6 Z', fill: cls === 'out' ? '#fda4af' : '#7dd3fc', opacity: .95 }, gg);
      svgEl('text', { x: 0, y: -14, class: 'i-label ' + (cls || ''), text: id, 'text-anchor': 'middle' }, gg);
      return gg;
    };
    const a1 = arrow(176, 140, 31, 'I₁');
    const a2 = arrow(176, 296, -31, 'I₂');
    const a3 = arrow(432, 218, 0, 'I₃', 'out');

    // bare de bilanț
    svgEl('text', { x: 56, y: 26, class: 'note', text: 'sarcina care intră' }, g);
    svgEl('text', { x: 540, y: 26, class: 'note', text: 'sarcina care iese', 'text-anchor': 'end' }, g);

    // trasee de flux (electronii)
    flow = new Flow(svg);
    flow.add(pIn1, { getI: () => (S.closed ? S.I1 : 0) });
    flow.add(pIn2, { getI: () => (S.closed ? S.I2 : 0) });
    flow.add(pOut, { getI: () => (S.closed ? S.I3 : 0) });
    flow.start();

    built = true;
    S.refs = { a1, a2, a3, swLever, pIn1, pIn2, pOut };
    update();
  }

  function update() {
    const sum = S.I1 + S.I2 - S.I3;
    $('#oI1').textContent = S.I1.toFixed(1) + ' A';
    $('#oI2').textContent = S.I2.toFixed(1) + ' A';
    const o3 = $('#oI3'); if (o3) o3.textContent = S.I3.toFixed(1) + ' A';
    $('#i3Val').textContent = S.I3.toFixed(1) + ' A';
    $('#sumLive').textContent = (S.I1 + S.I2).toFixed(1);
    const liveEl = $('#sumLive').parentElement;
    liveEl.style.color = Math.abs(sum) < 0.001 ? '#86efac' : '#fda4af';
    const target = $('#i3Val');
    target.style.color = Math.abs(sum) < 0.001 ? '#86efac' : '#fda4af';

    $('#animHint').innerHTML = S.closed
      ? (Math.abs(sum) < 0.001
        ? '✔ Nod echilibrat: <b>I₁ + I₂ − I₃ = 0</b>. Sarcina care intră = sarcina care iese.'
        : `✖ Nodul nu este echilibrat: suma algebrică este <b>${SIGNED(sum, 1)} A</b>. Ajustează până când I₃ = I₁ + I₂.`)
      : 'Întrerupătorul K este deschis → prin nici o latură nu circulă curent.';

    if (S.refs) {
      S.refs.swLever.setAttribute('transform', S.closed ? 'rotate(0)' : 'rotate(-38)');
      S.refs.pIn1.classList.toggle('hi', S.closed);
      S.refs.pOut.classList.toggle('hi', S.closed);
      setLed(S.closed);
    }
  }

  function setLed(on) {
    const led = $('#ledGlobal');
    led.className = 'led ' + (on ? 'on' : 'off');
    $('#pillText').textContent = on ? 'circuit închis · ' + (S.I1 + S.I2).toFixed(1) + ' A în nod' : 'circuit deschis';
  }

  function init() {
    build();
    const bind = (id, key) => {
      const el = $('#' + id);
      el.addEventListener('input', () => {
        S[key] = parseFloat(el.value);
        Sound.tick();
      });
      el.addEventListener('change', () => update());
    };
    bind('sI1', 'I1'); bind('sI2', 'I2');
    const s3 = $('#sI3');
    if (s3) {
      s3.addEventListener('input', () => { S.I3 = parseFloat(s3.value); Sound.tick(); });
    }
    'sI1,sI2,sI3'.split(',').forEach(id => {
      const el = $('#' + id); if (el) el.addEventListener('input', update);
    });
    $('#sSpeed').addEventListener('input', e => {
      S.speed = parseFloat(e.target.value);
      $('#oSpeed').textContent = S.speed.toFixed(1) + '×';
      if (flow) flow.speed = S.speed;
    });
    $('#kSwitch').addEventListener('change', e => {
      S.closed = e.target.checked;
      S.closed ? Sound.switchOn() : Sound.switchOff();
      update();
    });
    $('#btnBalance').addEventListener('click', () => {
      const target = +(S.I1 + S.I2).toFixed(1);
      const el = $('#sI3');
      if (el) { el.value = target; S.I3 = target; }
      Sound.ok();
      update();
    });
  }

  return { init, update, build, S };
})();

/* ============================================================
   LABORATOR KIRCHHOFF (2 noduri, 3 laturi, 2 surse cu r)
   ============================================================ */
const LabK = (() => {
  const P = { E1: 22, r1: 1, E2: 19, r2: 1, R1: 4, R2: 6, R3: 4, closed: true };
  const G = {
    TL: [110, 90], B: [340, 90], TR: [570, 90],
    BL: [110, 380], A: [340, 380], BR: [570, 380],
  };
  let built = false, flow = null, refs = {}, pathIdx = 0, sol = {};

  /* -------- soluția sistemului -------- */
  function solve() {
    const a1 = P.R1 + P.r1, a2 = P.R2 + P.r2, R3 = P.R3;
    const m11 = a1 + R3, m12 = R3, m21 = R3, m22 = a2 + R3;
    const det = m11 * m22 - m12 * m21;
    const I1 = (P.E1 * m22 - m12 * P.E2) / det;
    const I2 = (m11 * P.E2 - P.E1 * m21) / det;
    const I3 = I1 + I2;
    const U1 = P.E1 - I1 * P.r1;          // tensiunea la bornele sursei 1
    const U2 = P.E2 - I2 * P.r2;
    const Pe = P.E1 * I3 * 0 + P.E1 * I1 + P.E2 * I2; // puterea debitată de surse
    const PR3 = I3 * I3 * R3;
    const Rext = P.R1 + P.R2; // nu e traseu unic; informativ
    return { I1, I2, I3, U1, U2, PR3, Pe, det, R3 };
  }

  /* -------- desen -------- */
  function build() {
    const svg = $('#labK');
    if (!svg || built) return;
    svg.setAttribute('viewBox', '0 0 680 470');
    svg.innerHTML = SVG_DEFS;
    const g = svgEl('g', {}, svg);
    const wire = (d) => svgEl('path', { d, class: 'wire' }, g);

    // contur + latura comună
    const pTopL = wire(`M${G.TL} L${G.B}`);
    const pTopR = wire(`M${G.B} L${G.TR}`);
    const pRight = wire(`M${G.TR} L${G.BR}`);
    const pBotR = wire(`M${G.BR} L${G.A}`);
    const pBotL = wire(`M${G.A} L${G.BL}`);
    const pLeft = wire(`M${G.BL} L${G.TL}`);
    const pMid = wire(`M${G.B} L${G.A}`);

    const box = (x, y, w, h, rot, label, sub) => {
      const gg = svgEl('g', { transform: `translate(${x},${y}) rotate(${rot})` }, g);
      svgEl('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 4, class: 'res-box' }, gg);
      if (label) svgEl('text', { x: 0, y: 1, class: 'res-label', text: label }, gg);
      if (sub) svgEl('text', { x: 0, y: h / 2 + 16, class: 'note', text: sub, 'text-anchor': 'middle' }, gg);
      return gg;
    };

    // ---- sursa 1: E₁ cu borna + spre stânga, r₁ în serie
    box(168, 90, 40, 15, 0, 'r₁');
    const e1 = svgEl('g', { transform: 'translate(232,90)' }, g);
    svgEl('line', { x1: -16, y1: -20, x2: -16, y2: 20, class: 'batt-plate' }, e1);
    svgEl('line', { x1: 6, y1: -11, x2: 6, y2: 11, class: 'batt-thin' }, e1);
    svgEl('text', { x: -24, y: -26, class: 'e-label', text: '+' }, e1);
    svgEl('text', { x: 10, y: -18, class: 'e-label', text: '−' }, e1);
    svgEl('text', { x: 0, y: -36, class: 'i-label', text: 'E₁', 'text-anchor': 'middle' }, e1);

    // ---- sursa 2: E₂ cu borna + spre dreapta, r₂ în serie
    box(512, 90, 40, 15, 0, 'r₂');
    const e2 = svgEl('g', { transform: 'translate(448,90)' }, g);
    svgEl('line', { x1: 16, y1: -20, x2: 16, y2: 20, class: 'batt-plate' }, e2);
    svgEl('line', { x1: -6, y1: -11, x2: -6, y2: 11, class: 'batt-thin' }, e2);
    svgEl('text', { x: 24, y: -26, class: 'e-label', text: '+' }, e2);
    svgEl('text', { x: -10, y: -18, class: 'e-label', text: '−' }, e2);
    svgEl('text', { x: 0, y: -36, class: 'i-label', text: 'E₂', 'text-anchor': 'middle' }, e2);

    // ---- consumatori
    box(240, 380, 52, 18, 0, 'R₁');
    box(450, 380, 52, 18, 0, 'R₂');
    box(340, 240, 18, 50, 0, 'R₃');

    // ampermetre pe laturile de sus
    meterSymbol(g, 300, 90, 10, 'A', '#22d3ee');
    meterSymbol(g, 380, 90, 10, 'A', '#22d3ee');

    // întrerupător pe latura dreaptă
    const sw = svgEl('g', { transform: 'translate(570,235)' }, g);
    svgEl('circle', { cx: 0, cy: -14, r: 3.6, fill: '#93a8c9' }, sw);
    svgEl('circle', { cx: 0, cy: 14, r: 3.6, fill: '#93a8c9' }, sw);
    const lever = svgEl('line', { x1: 0, y1: 14, x2: 0, y2: -14, stroke: '#fbbf24', 'stroke-width': 2.8, 'stroke-linecap': 'round' }, sw);
    svgEl('text', { x: 16, y: 4, class: 'e-label', text: 'K' }, sw);

    // noduri
    [G.B, G.A].forEach((p, i) => {
      svgEl('circle', { cx: p[0], cy: p[1], r: 6.5, class: 'node-dot', filter: 'url(#glowC)' }, g);
      svgEl('text', { x: p[0] + 14, y: p[1] - 14, class: 'node-label', text: i ? 'A' : 'B' }, g);
    });
    [[110, 90], [570, 90], [110, 380], [570, 380]].forEach(([x, y]) =>
      svgEl('circle', { cx: x, cy: y, r: 3.2, fill: '#64748b' }, g));

    // săgeți de sens + etichete
    const arrowAt = (x, y, rot, cls) => svgEl('path', {
      d: 'M-5 0 L5 0 M5 0 L1 -4 M5 0 L1 4', stroke: cls || '#7dd3fc', 'stroke-width': 2.2,
      'stroke-linecap': 'round', fill: 'none', transform: `translate(${x},${y}) rotate(${rot})`,
    }, g);
    const ar1 = arrowAt(196, 150, 90);
    const ar2 = arrowAt(484, 150, 90);
    const ar3 = arrowAt(240, 240, 0, '#a5b4fc');
    svgEl('text', { x: 176, y: 176, class: 'i-label', text: 'I₁' }, g);
    svgEl('text', { x: 506, y: 176, class: 'i-label', text: 'I₂' }, g);
    svgEl('text', { x: 214, y: 232, class: 'i-label', text: 'I₃' }, g);

    // noduri cu potențiale (afișate live)
    const vB = svgEl('text', { x: 340, y: 66, class: 'note', 'text-anchor': 'middle', text: '' }, g);
    const vA = svgEl('text', { x: 340, y: 406, class: 'note', 'text-anchor': 'middle', text: '' }, g);

    // flux electroni
    const pth1 = svgEl('path', { d: `M${G.B} L${G.TL} L${G.BL} L${G.A}`, fill: 'none', stroke: 'none' }, g);
    const pth2 = svgEl('path', { d: `M${G.B} L${G.TR} L${G.BR} L${G.A}`, fill: 'none', stroke: 'none' }, g);
    const pth3 = svgEl('path', { d: `M${G.A} L${G.B}`, fill: 'none', stroke: 'none' }, g);
    flow = new Flow(svg, {});
    flow.add(pth1, { getI: () => (P.closed ? sol.I1 || 0 : 0), color: '#7dd3fc', spacing: 44 });
    flow.add(pth2, { getI: () => (P.closed ? sol.I2 || 0 : 0), color: '#7dd3fc', spacing: 44 });
    flow.add(pth3, { getI: () => (P.closed ? sol.I3 || 0 : 0), color: '#a5b4fc', spacing: 34 });
    flow.start();

    // indicatoare pentru ochiuri
    svgEl('path', { d: 'M215 150 C 235 210, 265 260, 300 300', class: 'loop-arrow', markerEnd: 'url(#arrLoop)', opacity: .5 }, g);
    svgEl('path', { d: 'M462 150 C 442 210, 412 260, 380 300', class: 'loop-arrow', markerEnd: 'url(#arrLoop)', opacity: .5 }, g);
    svgEl('text', { x: 176, y: 300, class: 'loop-label', text: 'ochiul I' }, g);
    svgEl('text', { x: 486, y: 300, class: 'loop-label', text: 'ochiul II' }, g);

    refs = { lever, ar1, ar2, ar3, pTopL, pTopR, pBotL, pBotR, vA, vB };
    built = true;
    update();
  }

  /* -------- actualizare -------- */
  function update() {
    sol = solve();
    const open = !P.closed;
    if (open) { sol.I1 = sol.I2 = sol.I3 = 0; sol.U1 = P.E1; sol.U2 = P.E2; sol.PR3 = 0; }

    refs.lever.setAttribute('transform', P.closed ? 'rotate(0)' : 'rotate(46)');
    [refs.pTopL, refs.pTopR, refs.pBotL, refs.pBotR].forEach(p => p.classList.toggle('hi', !open));

    // orientarea săgeților: dacă I < 0, sensul real este invers celui ales
    const dir = (I) => (I >= 0 ? '' : ' rotate(180)');
    refs.ar1.setAttribute('transform', `translate(196,150) rotate(90)${dir(sol.I1)}`);
    refs.ar2.setAttribute('transform', `translate(484,150) rotate(90)${dir(sol.I2)}`);
    refs.ar3.setAttribute('transform', `translate(240,240) rotate(0)${dir(sol.I3)}`);
    refs.ar1.setAttribute('stroke', sol.I1 >= 0 ? '#7dd3fc' : '#fda4af');
    refs.ar2.setAttribute('stroke', sol.I2 >= 0 ? '#7dd3fc' : '#fda4af');
    refs.ar3.setAttribute('stroke', sol.I3 >= 0 ? '#a5b4fc' : '#fda4af');

    // ieșiri numerice sliders
    const map = [['oE1', P.E1, ' V', 0], ['oR1', P.r1, ' Ω', 1], ['oE2', P.E2, ' V', 0], ['oR2', P.r2, ' Ω', 1],
    ['oRR1', P.R1, ' Ω', 0], ['oRR2', P.R2, ' Ω', 0], ['oRR3', P.R3, ' Ω', 0]];
    map.forEach(([id, v, u, d]) => { const e = $('#' + id); if (e) e.textContent = v.toFixed(d) + u; });

    // rezultate
    const R = $('#kResults');
    if (R) {
      R.innerHTML = [
        ['I₁', fmt(sol.I1, 2) + ' A', sol.I1],
        ['I₂', fmt(sol.I2, 2) + ' A', sol.I2],
        ['I₃', fmt(sol.I3, 2) + ' A', sol.I3],
        ['U₁ = E₁ − I₁r₁', fmt(sol.U1, 2) + ' V', sol.U1],
        ['U₂ = E₂ − I₂r₂', fmt(sol.U2, 2) + ' V', sol.U2],
        ['P pe R₃', fmt(sol.PR3, 2) + ' W', 1],
      ].map(([l, v, s]) =>
        `<div class="res ${s < -1e-6 ? 'neg' : 'pos'}"><span class="rl">${l}</span><span class="rv">${v}</span></div>`
      ).join('');
    }

    // sistem de ecuații
    const E = $('#kEqStack');
    if (E) {
      const a1 = P.R1 + P.r1, a2 = P.R2 + P.r2;
      const nodal = Math.abs(sol.I1 + sol.I2 - sol.I3);
      E.innerHTML = `
        <div class="eq-row"><span><span class="eq-tag">nod A</span> I₁ + I₂ − I₃ = 0</span>
          <b class="sum">${fmt(sol.I1, 2)} + ${fmt(sol.I2, 2)} − ${fmt(sol.I3, 2)} = ${fmt(nodal, 3)} ${nodal < 1e-6 ? '✓' : '✗'}</b></div>
        <div class="eq-row"><span><span class="eq-tag">ochi I</span> E₁ = (R₁+r₁)·I₁ + R₃·I₃</span>
          <b>${fmt(a1, 2)}·${fmt(sol.I1, 2)} + ${fmt(P.R3, 1)}·${fmt(sol.I3, 2)} = ${fmt(sol.I1 * a1 + sol.I3 * P.R3, 2)} V</b></div>
        <div class="eq-row"><span><span class="eq-tag">ochi II</span> E₂ = (R₂+r₂)·I₂ + R₃·I₃</span>
          <b>${fmt(a2, 2)}·${fmt(sol.I2, 2)} + ${fmt(P.R3, 1)}·${fmt(sol.I3, 2)} = ${fmt(sol.I2 * a2 + sol.I3 * P.R3, 2)} V</b></div>
        <div class="eq-row"><span><span class="eq-tag">sursa 1</span> U₁ = E₁ − I₁·r₁</span><b>${fmt(sol.U1, 2)} V</b></div>
        <div class="eq-row"><span><span class="eq-tag">sursa 2</span> U₂ = E₂ − I₂·r₂</span><b>${fmt(sol.U2, 2)} V</b></div>`;
    }

    // bara de putere
    const bar = $('#kMeterBar');
    if (bar) {
      const maxP = 200;
      bar.style.width = clamp(Math.abs(sol.PR3) / maxP * 100, 0, 100) + '%';
      $('#kMeterHint').textContent = `Puterea disipată pe R₃: P = I₃²·R₃ = ${fmt(sol.PR3 * 1, 2)} W` +
        (open ? ' (circuit deschis)' : '');
    }

    if (refs.vA && refs.vB) {
      refs.vA.textContent = 'V_A = 0 V (referință)';
      refs.vB.textContent = `V_B − V_A = ${fmt(-sol.I3 * P.R3, 2)} V`;
    }

    const led = $('#ledGlobal');
    led.className = 'led ' + (open ? 'off' : 'on');
    $('#pillText').textContent = open ? 'circuit deschis' : `K închis · I₃ = ${fmt(sol.I3, 2)} A`;

    updatePath();
  }

  /* -------- trasee de potențial -------- */
  function updatePath() {
    const out = $('#pathOut');
    if (!out) return;
    const { E1, E2, r1, r2, R1, R2, R3 } = P;
    const { I1, I2, I3 } = sol;
    const dAB = I3 * R3;                       // prin R₃
    const p1 = E2 - I2 * (R2 + r2);            // A → C → D → B
    const p2 = E1 - I1 * (R1 + r1);            // A → E → F → B
    const rows = [
      [`A → B direct, prin R₃`, `V_A − V_B = I₃·R₃ = ${fmt(I3, 2)}·${fmt(R3, 1)}`, dAB],
      [`A → C → D → B (prin R₂ și E₂)`, `V_A − V_B = E₂ − I₂(R₂+r₂) = ${fmt(E2, 1)} − ${fmt(I2, 2)}·${fmt(R2 + r2, 1)}`, p1],
      [`A → E → F → B (prin R₁ și E₁)`, `V_A − V_B = E₁ − I₁(R₁+r₁) = ${fmt(E1, 1)} − ${fmt(I1, 2)}·${fmt(R1 + r1, 1)}`, p2],
    ];
    const r = rows[pathIdx];
    out.innerHTML = `<div class="eq-row"><span>${r[0]}</span><b>${fmt(r[2], 2)} V</b></div>
      <div class="muted" style="margin-top:8px">${r[1]} = <b>${fmt(r[2], 2)} V</b></div>
      <div class="hint">Toate cele trei trasee dau <b>același</b> rezultat: tensiunea între două puncte nu depinde de drum.
      Diferența maximă între metode: <b>${fmt(Math.max(Math.abs(dAB - p1), Math.abs(dAB - p2), Math.abs(p1 - p2)), 6)} V</b>.</div>`;
  }

  let bound = false;
  function init() {
    if ($('#labK')) build();
    if (bound) { if ($('#labK')) update(); return; }
    bound = true;
    const bind = (id, key, dec) => {
      const el = $('#' + id);
      if (!el) return;
      el.addEventListener('input', () => { P[key] = parseFloat(el.value); Sound.tick(); update(); });
    };
    bind('sE1', 'E1'); bind('sR1', 'r1'); bind('sE2', 'E2'); bind('sR2', 'r2');
    bind('sRR1', 'R1'); bind('sRR2', 'R2'); bind('sRR3', 'R3');
    const sw = $('#kSwitch2');
    if (sw) sw.addEventListener('change', e => {
      P.closed = e.target.checked;
      P.closed ? Sound.switchOn() : Sound.switchOff();
      update();
    });
    const rst = $('#kReset');
    if (rst) rst.addEventListener('click', () => {
      Object.assign(P, { E1: 22, r1: 1, E2: 19, r2: 1, R1: 4, R2: 6, R3: 4, closed: true });
      const vals = { sE1: 22, sR1: 1, sE2: 19, sR2: 1, sRR1: 4, sRR2: 6, sRR3: 4 };
      Object.entries(vals).forEach(([id, v]) => { const e = $('#' + id); if (e) e.value = v; });
      if (sw) sw.checked = true;
      Sound.drop(); update();
    });
    const steps = $('#kShowSteps');
    if (steps) steps.addEventListener('click', () => {
      const box = $('#kSteps');
      box.hidden = !box.hidden;
      Sound.click();
      const a1 = P.R1 + P.r1, a2 = P.R2 + P.r2, R3 = P.R3;
      box.innerHTML = `<ol>
        <li>Notăm: <span class="mono">a₁ = R₁+r₁ = ${fmt(a1, 2)} Ω</span>, <span class="mono">a₂ = R₂+r₂ = ${fmt(a2, 2)} Ω</span>.</li>
        <li>Nodul A: <span class="mono">I₃ = I₁ + I₂</span>.</li>
        <li>Ochiul I: <span class="mono">E₁ = a₁I₁ + R₃I₃ = (a₁+R₃)I₁ + R₃I₂</span></li>
        <li>Ochiul II: <span class="mono">E₂ = a₂I₂ + R₃I₃ = R₃I₁ + (a₂+R₃)I₂</span></li>
        <li>Sistem 2×2, determinant: <span class="mono">Δ = (a₁+R₃)(a₂+R₃) − R₃² = ${fmt(a1 + R3, 2)}·${fmt(a2 + R3, 2)} − ${fmt(R3, 1)}² = ${fmt((a1 + R3) * (a2 + R3) - R3 * R3, 2)}</span></li>
        <li><span class="mono">I₁ = [E₁(a₂+R₃) − R₃E₂]/Δ = ${fmt(sol.I1, 3)} A</span></li>
        <li><span class="mono">I₂ = [(a₁+R₃)E₂ − R₃E₁]/Δ = ${fmt(sol.I2, 3)} A</span></li>
        <li><span class="mono">I₃ = I₁ + I₂ = ${fmt(sol.I3, 3)} A</span></li>
      </ol>
      <p class="hint">Un rezultat <b>negativ</b> înseamnă că sensul real al curentului este invers celui ales inițial.</p>`;
    });
    $$('#pathTabs .seg').forEach(b => b.addEventListener('click', () => {
      $$('#pathTabs .seg').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); pathIdx = +b.dataset.path; Sound.click(); updatePath();
    }));
    if ($('#labK')) update();
  }

  return { init, update, P, get sol() { return sol; } };
})();

/* ============================================================
   CONSTRUCTOR DE ECUAȚII PENTRU NOD
   ============================================================ */
const NodeBuilder = (() => {
  const currents = [
    { name: 'I₁', dir: 1 },
    { name: 'I₂', dir: -1 },
    { name: 'I₃', dir: 1 },
    { name: 'I₄', dir: -1 },
  ];
  function render() {
    const host = $('#nodeBuilder');
    if (!host) return;
    host.innerHTML = currents.map((c, i) => `
      <div class="nb-row">
        <span class="nb-name">${c.name}</span>
        <button class="seg nb-toggle ${c.dir === 1 ? 'on' : ''}" data-i="${i}">
          ${c.dir === 1 ? '↓ intră în nod (+)' : '↑ iese din nod (−)'}
        </button>
      </div>`).join('') + `<div class="nb-eq" id="nbEq"></div>`;
    host.querySelectorAll('.nb-toggle').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      currents[i].dir *= -1;
      Sound.tick(); render(); calc();
    }));
    calc();
  }
  function calc() {
    const pos = currents.filter(c => c.dir === 1), neg = currents.filter(c => c.dir === -1);
    const lhs = currents.map(c => (c.dir === 1 ? '+' : '−') + c.name).join(' ').replace(/^\+/, '');
    $('#nbEq').innerHTML = `
      <div class="formula-small" style="text-align:left">Σ I = ${lhs} = 0</div>
      <p class="hint">Sensul ales este <b>arbitrar</b>: ${pos.length ? pos.map(c => c.name).join(', ') : '—'}
        intră în nod, ${neg.length ? neg.map(c => c.name).join(', ') : '—'} iese din nod.
        Dacă suma nu se închide cu datele reale, înseamnă că un sens ales este greșit — nu legea.</p>`;
  }
  return { init: render };
})();

/* ============================================================
   INIT global
   ============================================================ */
function initKirchhoff() {
  NodeAnim.init();
  LabK.init();
  NodeBuilder.init();
  Router.on('k-anim', () => { NodeAnim.build(); NodeAnim.update(); });
  Router.on('k-lab', () => { LabK.init(); });
}
