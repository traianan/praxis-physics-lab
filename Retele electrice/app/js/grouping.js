/* ============================================================
   grouping.js — generatoare serie/paralel, șunt, rezistență adițională
   ============================================================ */
'use strict';

/* ============================================================
   GENERATOARE: serie vs paralel
   ============================================================ */
const GenLab = (() => {
  const S = { n: 2, E: 6, r: 1, R: 8, mode: 'serie', closed: true };
  let built = false, flow = null;

  function values() {
    const n = S.n;
    const Eg = S.mode === 'serie' ? n * S.E : S.E;
    const rg = S.mode === 'serie' ? n * S.r : S.r / n;
    const I = Eg / (S.R + rg);
    const U = Eg - I * rg;
    const P = U * I;             // puterea utilă pe R
    const Pg = Eg * I;           // puterea debitată de gruparea echivalentă
    const eta = P / Pg * 100;
    const Pmax = (Eg * Eg) / (4 * rg);
    const Ropt = rg;
    return { Eg, rg, I, U, P, Pg, eta, Pmax, Ropt };
  }

  function build() {
    const svg = $('#genCanvas');
    if (!svg || built) return;
    built = true;
    render();

    ['sN', 'sEg', 'sRg', 'sRload'].forEach(id => {
      const el = $('#' + id);
      if (el) el.addEventListener('input', () => {
        S[{ sN: 'n', sEg: 'E', sRg: 'r', sRload: 'R' }[id]] = parseFloat(el.value);
        Sound.tick(); render();
      });
    });
    $$('#genMode .seg').forEach(b => b.addEventListener('click', () => {
      $$('#genMode .seg').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      S.mode = b.dataset.mode;
      Sound.modeSwitch ? Sound.modeSwitch() : Sound.click();
      render();
    }));
    const m = $('#gMatch');
    if (m) m.addEventListener('click', () => {
      const v = values();
      const el = $('#sRload'); el.value = v.Ropt.toFixed(1);
      S.R = +el.value; Sound.ok(); render();
    });
  }

  function render() {
    const v = values();
    $('#oN').textContent = S.n;
    $('#oEg').textContent = S.E.toFixed(1) + ' V';
    $('#oRg').textContent = S.r.toFixed(1) + ' Ω';
    $('#oRload').textContent = S.R.toFixed(1) + ' Ω';

    const R = $('#genResults');
    R.innerHTML = [
      ['t.e.m. grup', fmt(v.Eg, 2) + ' V'],
      ['r internă grup', fmt(v.rg, 3) + ' Ω'],
      ['I circuit', fmt(v.I, 3) + ' A'],
      ['U la borne', fmt(v.U, 2) + ' V'],
      ['P utilă pe R', fmt(v.P, 2) + ' W'],
      ['η', fmt(v.eta, 1) + ' %'],
    ].map(([l, x]) => `<div class="res"><span class="rl">${l}</span><span class="rv">${x}</span></div>`).join('');

    $('#genFormula').innerHTML = S.mode === 'serie'
      ? `I = nE / (R + n·r) = ${S.n}·${fmt(S.E, 1)} / (${fmt(S.R, 1)} + ${S.n}·${fmt(S.r, 1)}) = ${fmt(v.I, 3)} A`
      : `I = E / (R + r/n) = ${fmt(S.E, 1)} / (${fmt(S.R, 1)} + ${fmt(S.r, 1)}/${S.n}) = ${fmt(v.I, 3)} A`;

    drawGenerators(v);
    drawChart(v);
  }

  function drawGenerators(v) {
    const svg = $('#genCanvas');
    svg.innerHTML = SVG_DEFS;
    const g = svgEl('g', {}, svg);
    const n = S.n;
    let pIn, pLoad;

    if (S.mode === 'serie') {
      // buclă dreptunghiulară, generatoare pe latura de sus
      const L = 90, Rt = 520, Ty = 78, By = 300;
      const slot = (Rt - L) / n;
      svgEl('path', { d: `M${L} ${Ty} H${Rt} V${By} H${L} Z`, class: 'wire' }, g);
      for (let i = 0; i < n; i++) {
        const x = L + slot * (i + 0.5);
        const gg = svgEl('g', { transform: `translate(${x},${Ty})` }, g);
        svgEl('line', { x1: -7, y1: -13, x2: -7, y2: 13, class: 'batt-thin' }, gg);
        svgEl('line', { x1: 7, y1: -19, x2: 7, y2: 19, class: 'batt-plate' }, gg);
        svgEl('text', { x: 0, y: -26, class: 'e-label', text: `E`, 'text-anchor': 'middle' }, gg);
        svgEl('text', { x: 0, y: 34, class: 'note', text: 'r', 'text-anchor': 'middle' }, gg);
      }
      // consumator pe latura de jos
      svgEl('rect', { x: 285, y: By - 11, width: 60, height: 22, rx: 4, class: 'res-box' }, g);
      svgEl('text', { x: 315, y: By + 26, class: 'i-label', text: `R = ${fmt(S.R, 1)} Ω`, 'text-anchor': 'middle' }, g);
      svgEl('text', { x: 315, y: By - 22, class: 'note', text: 'consumator', 'text-anchor': 'middle' }, g);
      pIn = svgEl('path', { d: `M${L} ${Ty} H${Rt} V${By} H${L} Z`, fill: 'none', stroke: 'none' }, g);
      pLoad = pIn;
      // săgeată curent
      svgEl('path', { d: `M${L + 26} ${By} H${L + 8}`, stroke: '#7dd3fc', 'stroke-width': 2.2, markerEnd: 'url(#arrC)' }, g);
    } else {
      // scară: două șine verticale, fiecare generator pe câte o ramură orizontală
      const Lx = 150, Rx = 500, Ty = 66, By = 336;
      const y0 = Ty + 46, y1 = By - 66;
      svgEl('path', { d: `M${Lx} ${Ty} V${By}`, class: 'wire' }, g);   // șina A (+)
      svgEl('path', { d: `M${Rx} ${Ty} V${By}`, class: 'wire' }, g);   // șina B (−)
      svgEl('path', { d: `M${Lx} ${Ty} H${Rx}`, class: 'wire' }, g);   // legătura de sus
      const slot = n > 1 ? (y1 - y0) / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        const y = n > 1 ? y0 + slot * i : (y0 + y1) / 2;
        svgEl('path', { d: `M${Lx} ${y} H${Lx + 110}`, class: 'wire' }, g);
        svgEl('path', { d: `M${Lx + 158} ${y} H${Rx}`, class: 'wire' }, g);
        const gg = svgEl('g', { transform: `translate(${Lx + 134},${y})` }, g);
        svgEl('line', { x1: -12, y1: -13, x2: -12, y2: 13, class: 'batt-plate' }, gg);
        svgEl('line', { x1: 12, y1: -7, x2: 12, y2: 7, class: 'batt-thin' }, gg);
        svgEl('text', { x: -14, y: -20, class: 'e-label', text: '+' }, gg);
        svgEl('text', { x: 14, y: -14, class: 'e-label', text: '−' }, gg);
        svgEl('text', { x: 0, y: 28, class: 'note', text: 'E, r', 'text-anchor': 'middle' }, gg);
      }
      // consumatorul, pe ramura de jos a scării
      svgEl('path', { d: `M${Lx} ${By} H${Lx + 150}`, class: 'wire' }, g);
      svgEl('rect', { x: Lx + 152, y: By - 11, width: 62, height: 22, rx: 4, class: 'res-box' }, g);
      svgEl('text', { x: Lx + 183, y: By + 30, class: 'i-label', text: `R = ${fmt(S.R, 1)} Ω`, 'text-anchor': 'middle' }, g);
      svgEl('path', { d: `M${Lx + 214} ${By} H${Rx}`, class: 'wire' }, g);
      svgEl('text', { x: Lx - 14, y: Ty - 8, class: 'node-label', text: 'A' }, g);
      svgEl('text', { x: Rx + 8, y: Ty - 8, class: 'node-label', text: 'B' }, g);
      pIn = svgEl('path', {
        d: `M${Lx} ${By} V${Ty} H${Rx} V${By} H${Lx}`,
        fill: 'none', stroke: 'none',
      }, g);
      pLoad = pIn;
      svgEl('path', { d: `M${Lx + 60} ${By} H${Lx + 42}`, stroke: '#7dd3fc', 'stroke-width': 2.2, markerEnd: 'url(#arrC)' }, g);
    }

    svgEl('text', { x: 24, y: 26, class: 'note', text: S.mode === 'serie' ? `${n} generatoare în SERIE` : `${n} generatoare în PARALEL` }, g);
    svgEl('text', { x: 24, y: 44, class: 'e-label', text: `E_grup = ${fmt(v.Eg, 2)} V   ·   r_grup = ${fmt(v.rg, 3)} Ω` }, g);

    flow = new Flow(svg, {});
    flow.speed = 1;
    flow.add(pLoad, { getI: () => v.I, color: '#7dd3fc', spacing: 34 });
    flow.start();
  }

  function drawChart(v) {
    const svg = $('#genChart');
    svg.innerHTML = SVG_DEFS;
    const W = 640, H = 220, pad = { l: 52, r: 16, t: 16, b: 30 };
    const g = svgEl('g', {}, svg);
    const Rmax = 40;
    const PmaxAxis = Math.max(v.Pmax * 1.35, 0.5);
    const X = R => pad.l + (R / Rmax) * (W - pad.l - pad.r);
    const Y = P => H - pad.b - (P / PmaxAxis) * (H - pad.t - pad.b);

    // grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 4;
      svgEl('line', { x1: pad.l, y1: y, x2: W - pad.r, y2: y, stroke: 'rgba(148,163,184,.12)' }, g);
      svgEl('text', { x: pad.l - 8, y: y + 3, fill: '#7183a3', 'font-size': 9, 'text-anchor': 'end', 'font-family': 'var(--mono)', text: fmt(PmaxAxis * (1 - i / 4), 1) }, g);
    }
    svgEl('line', { x1: pad.l, y1: H - pad.b, x2: W - pad.r, y2: H - pad.b, stroke: 'rgba(148,163,184,.3)' }, g);
    svgEl('line', { x1: pad.l, y1: pad.t, x2: pad.l, y2: H - pad.b, stroke: 'rgba(148,163,184,.3)' }, g);
    svgEl('text', { x: W - pad.r, y: H - 8, fill: '#7183a3', 'font-size': 9.5, 'text-anchor': 'end', text: 'R (Ω)' }, g);
    svgEl('text', { x: 2, y: 10, fill: '#7183a3', 'font-size': 9.5, 'font-family': 'var(--mono)', text: 'P (W)' }, g);

    // curba P(R)
    let d = '';
    for (let i = 0; i <= 200; i++) {
      const R = 0.2 + (Rmax - 0.2) * i / 200;
      const I = v.Eg / (R + v.rg);
      const P = I * I * R;
      d += (i ? ' L' : 'M') + X(R).toFixed(1) + ' ' + Y(P).toFixed(1);
    }
    svgEl('path', { d, fill: 'none', stroke: 'url(#gGrad)', 'stroke-width': 2.4, filter: 'url(#glowC)' }, g);
    // gradient
    const defs = svg.querySelector('defs');
    const lg = svgEl('linearGradient', { id: 'gGrad', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    svgEl('stop', { offset: 0, 'stop-color': '#22d3ee' }, lg);
    svgEl('stop', { offset: 1, 'stop-color': '#6366f1' }, lg);

    // punctul de putere maximă
    const Rx = clamp(v.Ropt, 0.2, Rmax);
    const Pxx = v.Eg * v.Eg / (4 * v.rg);
    svgEl('line', { x1: X(Rx), y1: H - pad.b, x2: X(Rx), y2: Y(Pxx), stroke: 'rgba(52,211,153,.45)', 'stroke-dasharray': '4 4' }, g);
    svgEl('circle', { cx: X(Rx), cy: Y(Pxx), r: 5, fill: '#34d399', filter: 'url(#glowG)' }, g);
    svgEl('text', { x: X(Rx) + 10, y: Y(Pxx) - 8, fill: '#a7f3d0', 'font-size': 9.5, 'font-family': 'var(--mono)', text: `P max la R = r_g = ${fmt(v.rg, 2)} Ω` }, g);

    // punctul curent
    if (S.R >= 0.2 && S.R <= Rmax) {
      svgEl('circle', { cx: X(S.R), cy: Y(v.P), r: 6, fill: '#fbbf24', filter: 'url(#glowG)' }, g);
      svgEl('line', { x1: X(S.R), y1: H - pad.b, x2: X(S.R), y2: Y(v.P), stroke: 'rgba(251,191,36,.5)', 'stroke-dasharray': '3 3' }, g);
      svgEl('text', { x: X(S.R) + 9, y: Y(v.P) + 14, fill: '#fde68a', 'font-size': 9.5, 'font-family': 'var(--mono)', text: `R = ${fmt(S.R, 1)} Ω → P = ${fmt(v.P, 2)} W` }, g);
    }
  }

  return { init: build, S, values };
})();

/* ============================================================
   ȘUNT + REZISTENȚĂ ADIȚIONALĂ
   ============================================================ */
const InstrumentLab = (() => {
  function init() {
    const upd = () => {
      const RA = parseFloat($('#sRA').value), nS = parseFloat($('#sNs').value);
      const RV = parseFloat($('#sRV').value), nA = parseFloat($('#sNa').value);
      $('#oRA').textContent = RA.toFixed(1) + ' Ω';
      $('#oNs').textContent = nS + '×';
      $('#oRV').textContent = RV.toFixed(0) + ' Ω';
      $('#oNa').textContent = nA + '×';

      const Rs = RA / (nS - 1);
      $('#suntVal').textContent = fmt(Rs, 3) + ' Ω';
      const Itot = 1.0;                  // curent total de referință 1 A
      const Is = Itot * RA / (RA + Rs);
      const Ia = Itot - Is;
      $('#suntIa').textContent = fmt(Ia, 3) + ' A';
      $('#suntIs').textContent = fmt(Is, 3) + ' A';

      const Ra = (nA - 1) * RV;
      $('#addVal').textContent = fmt(Ra, 0) + ' Ω';
      const Utot = nA * 10;             // 10 V domeniu de bază
      const Uv = Utot * RV / (RV + Ra);
      $('#addUv').textContent = fmt(Uv, 2) + ' V';
      $('#addUa').textContent = fmt(Utot - Uv, 2) + ' V';
    };
    ['sRA', 'sNs', 'sRV', 'sNa'].forEach(id => {
      const el = $('#' + id);
      if (el) el.addEventListener('input', () => { Sound.tick(); upd(); });
    });
    upd();
  }
  return { init };
})();
