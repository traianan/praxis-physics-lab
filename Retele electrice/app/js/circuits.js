/* ============================================================
   circuits.js — desene statice: hero, mini-art, scheme teoretice
   ============================================================ */
'use strict';

/* ---------- HERO 1: rețea Kirchhoff stilizată ---------- */
function drawHeroK(svg) {
  svg.setAttribute('viewBox', '0 0 320 240');
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  // fir rețea
  const P = { F: [30, 60], B: [190, 60], E: [30, 190], A: [190, 190], C: [290, 190], D: [290, 60] };
  const wire = (a, b) => svgEl('path', { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, class: 'wire' }, g);
  wire(P.F, P.B); wire(P.E, P.A); wire(P.A, P.C); wire(P.B, P.D); wire(P.B, P.A);
  // laturi cu piese
  resSymbol(g, 110, 60, 40, 15);
  resSymbol(g, 110, 190, 40, 15);
  resSymbol(g, 240, 60, 40, 15);
  resSymbol(g, 190, 125, 15, 34);
  // sursă
  battSymbol(g, 30, 125, true, false);
  // noduri
  Object.entries(P).forEach(([k, p]) => {
    svgEl('circle', { cx: p[0], cy: p[1], r: 5.5, class: 'node-dot' }, g);
    svgEl('text', {
      x: p[0] + (k === 'A' ? 8 : k === 'C' || k === 'D' ? 10 : -12),
      y: p[1] + (k === 'C' || k === 'D' ? 22 : -12), class: 'node-label', text: k,
    }, g);
  });
  // ochiuri (săgeți)
  svgEl('path', { d: 'M70 82 C 78 110, 110 128, 150 128 C 130 128, 90 112, 78 88 Z', class: 'loop-arrow', markerEnd: 'url(#arrLoop)' }, g);
  svgEl('text', { x: 96, y: 148, class: 'loop-label', text: 'ochi I' }, g);
  svgEl('path', { d: 'M215 82 C 210 108, 214 132, 224 148', class: 'loop-arrow', markerEnd: 'url(#arrLoop)' }, g);
  svgEl('text', { x: 228, y: 132, class: 'loop-label', text: 'ochi II' }, g);
  // etichete curenți
  svgEl('text', { x: 78, y: 52, class: 'i-label', text: 'I₁' }, g);
  svgEl('text', { x: 214, y: 176, class: 'i-label out', text: 'I₃' }, g);
  svgEl('text', { x: 42, y: 100, class: 'e-label', text: 'E' }, g);
  return svg;
}

/* ---------- HERO 2: grupări ---------- */
function drawHeroG(svg) {
  svg.setAttribute('viewBox', '0 0 320 240');
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  // serie
  svgEl('text', { x: 20, y: 26, class: 'note', text: 'serie' }, g);
  svgEl('path', { d: 'M30 50 H70', class: 'wire' }, g);
  resSymbol(g, 92, 50, 40, 15);
  svgEl('path', { d: 'M114 50 H150', class: 'wire' }, g);
  resSymbol(g, 172, 50, 40, 15);
  svgEl('path', { d: 'M194 50 H240 V72', class: 'wire' }, g);
  battSymbol(g, 240, 90, true);
  svgEl('path', { d: 'M240 108 V130 H30 V50', class: 'wire' }, g);
  svgEl('text', { x: 92, y: 34, class: 'i-label', text: 'R₁', 'text-anchor': 'middle' }, g);
  svgEl('text', { x: 172, y: 34, class: 'i-label', text: 'R₂', 'text-anchor': 'middle' }, g);
  svgEl('text', { x: 256, y: 94, class: 'e-label', text: 'E, r' }, g);
  // paralel
  svgEl('text', { x: 20, y: 168, class: 'note', text: 'paralel' }, g);
  const Y1 = 188, Y2 = 212, YB = 236;
  svgEl('path', { d: `M40 ${Y1} V${YB} H280`, class: 'wire' }, g);
  svgEl('path', { d: `M40 ${Y1} H280 V${YB}`, class: 'wire' }, g);
  svgEl('path', { d: `M40 ${Y2} H280`, class: 'wire' }, g);
  resSymbol(g, 170, Y1, 44, 14);
  resSymbol(g, 170, Y2, 44, 14);
  svgEl('circle', { cx: 40, cy: Y1, r: 4, class: 'node-dot' }, g);
  svgEl('circle', { cx: 280, cy: Y1, r: 4, class: 'node-dot' }, g);
  svgEl('text', { x: 170, y: Y1 - 12, class: 'i-label', text: 'R₁', 'text-anchor': 'middle' }, g);
  svgEl('text', { x: 170, y: Y2 + 20, class: 'i-label', text: 'R₂', 'text-anchor': 'middle' }, g);
  battSymbol(g, 96, YB, false);
  svgEl('text', { x: 96, y: YB + 18, class: 'e-label', text: 'E, r', 'text-anchor': 'middle' }, g);
  return svg;
}

/* ---------- mini-art noduri/laturi/ochiuri ---------- */
function drawMiniArt(svg, kind) {
  svg.setAttribute('viewBox', '0 0 240 96');
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  if (kind === 'node') {
    const cx = 120, cy = 50;
    const rays = [[40, 16], [200, 16], [40, 84], [200, 84], [120, 88]];
    rays.forEach(([x, y]) => {
      svgEl('path', { d: `M${x} ${y} L${cx} ${cy}`, class: 'wire' }, g);
      svgEl('circle', { cx: x, cy: y, r: 3.5, fill: '#64748b' }, g);
    });
    svgEl('circle', { cx, cy, r: 8.5, class: 'node-dot glow' }, g);
    svgEl('text', { x: cx + 14, y: cy - 12, class: 'node-label', text: 'A' }, g);
    svgEl('text', { x: 150, y: 22, class: 'note', text: '≥ 3 conductori' }, g);
  } else if (kind === 'branch') {
    svgEl('path', { d: 'M28 48 H212', class: 'wire' }, g);
    resSymbol(g, 120, 48, 46, 17);
    [28, 212].forEach(x => svgEl('circle', { cx: x, cy: 48, r: 7, class: 'node-dot' }, g));
    svgEl('text', { x: 20, y: 34, class: 'node-label', text: 'A' }, g);
    svgEl('text', { x: 208, y: 34, class: 'node-label', text: 'B' }, g);
    svgEl('text', { x: 120, y: 76, class: 'i-label', text: 'latura AB' }, g);
  } else {
    const p = [[50, 20], [190, 20], [190, 76], [50, 76]];
    svgEl('path', { d: `M${p[0]} L${p[1]} L${p[2]} L${p[3]} Z`, class: 'wire' }, g);
    p.forEach(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 6, class: 'node-dot' }, g));
    svgEl('text', { x: 128, y: 48, class: 'loop-label', 'font-size': 12, text: 'ochi ABCA' }, g);
  }
}

/* ---------- scheme teoretice ---------- */
function drawSchSeries(svg) {
  svg.setAttribute("viewBox","0 0 460 165");
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  svgEl('path', { d: 'M40 30 H100', class: 'wire' }, g);
  resSymbol(g, 128, 30, 46, 18);
  svgEl('path', { d: 'M151 30 H225', class: 'wire' }, g);
  resSymbol(g, 253, 30, 46, 18);
  svgEl('path', { d: 'M276 30 H410 V70', class: 'wire' }, g);
  battSymbol(g, 410, 88, true);
  svgEl('path', { d: 'M410 106 V122 H40 V30', class: 'wire' }, g);
  svgEl('text', { x: 128, y: 14, class: 'i-label', text: 'R₁' }, g);
  svgEl('text', { x: 253, y: 14, class: 'i-label', text: 'R₂' }, g);
  svgEl('text', { x: 424, y: 84, class: 'e-label', text: '+' }, g);
  svgEl('text', { x: 424, y: 100, class: 'e-label', text: '−' }, g);
  svgEl('text', { x: 396, y: 60, class: 'note', text: 'E, r', 'text-anchor': 'end' }, g);
  // curent
  svgEl('path', { d: 'M60 122 H48', stroke: '#7dd3fc', 'stroke-width': 2, markerEnd: 'url(#arrC)' }, g);
  svgEl('text', { x: 90, y: 112, class: 'i-label', text: 'I = I₁ = I₂' }, g);
  // voltmetre
  const vm = (x) => {
    svgEl('path', { d: `M${x - 20} 30 V-2 H${x + 20} V30`, class: 'wire', 'stroke-width': 1.6 }, g);
    svgEl('circle', { cx: x, cy: -8, r: 10, fill: '#0e1830', stroke: '#a5b4fc', 'stroke-width': 1.6 }, g);
    svgEl('text', { x, y: -7, fill: '#a5b4fc', 'font-size': 9, 'text-anchor': 'middle', 'dominant-baseline': 'middle', text: 'V' }, g);
  };
  // prea sus — mutăm schimbarea: desenăm voltmetrele dedesubt
  const vmDown = (x) => {
    svgEl('path', { d: `M${x - 20} 30 V62 H${x + 20} V30`, class: 'wire', 'stroke-width': 1.6 }, g);
    svgEl('circle', { cx: x, cy: 62, r: 11, fill: '#0e1830', stroke: '#a5b4fc', 'stroke-width': 1.6 }, g);
    svgEl('text', { x, y: 63, fill: '#a5b4fc', 'font-size': 9.5, 'text-anchor': 'middle', 'dominant-baseline': 'middle', text: 'V' }, g);
  };
  vmDown(128); vmDown(253);
  svgEl('text', { x: 128, y: 88, class: 'note', text: 'U₁', 'text-anchor': 'middle' }, g);
  svgEl('text', { x: 253, y: 88, class: 'note', text: 'U₂', 'text-anchor': 'middle' }, g);
}

function drawSchParallel(svg) {
  svg.setAttribute("viewBox","0 0 460 165");
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  svgEl('circle', { cx: 50, cy: 40, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 38, y: 28, class: 'node-label', text: 'M' }, g);
  svgEl('circle', { cx: 360, cy: 40, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 366, y: 28, class: 'node-label', text: 'N' }, g);
  svgEl('path', { d: 'M50 40 V8 H360 V40', class: 'wire' }, g);
  svgEl('path', { d: 'M50 40 V72 H360 V40', class: 'wire' }, g);
  resSymbol(g, 205, 8, 48, 17);
  resSymbol(g, 205, 72, 48, 17);
  svgEl('text', { x: 205, y: -6, class: 'i-label', text: 'R₁' }, g);
  svgEl('text', { x: 205, y: 96, class: 'i-label', text: 'R₂' }, g);
  // ampermetre
  meterSymbol(g, 290, 8, 11, 'A₁', '#22d3ee');
  meterSymbol(g, 290, 72, 11, 'A₂', '#22d3ee');
  // ramura principală
  svgEl('path', { d: 'M50 40 V110 H180', class: 'wire' }, g);
  meterSymbol(g, 205, 110, 12, 'A', '#22d3ee');
  svgEl('path', { d: 'M217 110 H310', class: 'wire' }, g);
  battSymbol(g, 330, 110, false);
  svgEl('path', { d: 'M350 110 H382 V40 H360', class: 'wire' }, g);
  svgEl('text', { x: 330, y: 96, class: 'e-label', text: 'E', 'text-anchor': 'middle' }, g);
  svgEl('path', { d: 'M76 110 H62', stroke: '#7dd3fc', 'stroke-width': 2, markerEnd: 'url(#arrC)' }, g);
  svgEl('text', { x: 84, y: 128, class: 'i-label', text: 'I = I₁ + I₂', 'text-anchor': 'middle' }, g);
}

function drawSchGenSer(svg) {
  svg.setAttribute("viewBox","0 0 300 120");
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  svgEl('path', { d: 'M40 34 H95', class: 'wire' }, g);
  battSymbol(g, 118, 34, false);
  svgEl('path', { d: 'M141 34 H190', class: 'wire' }, g);
  battSymbol(g, 213, 34, false);
  svgEl('path', { d: 'M236 34 H268 V70 H190', class: 'wire' }, g);
  resSymbol(g, 150, 70, 46, 17);
  svgEl('path', { d: 'M40 34 V70 H104', class: 'wire' }, g);
  svgEl('path', { d: 'M104 70 H127', class: 'wire' }, g);
  svgEl('text', { x: 118, y: 12, class: 'e-label', text: 'E, r' }, g);
  svgEl('text', { x: 213, y: 12, class: 'e-label', text: 'E, r' }, g);
  svgEl('text', { x: 150, y: 94, class: 'i-label', text: 'R' }, g);
  svgEl('path', { d: 'M60 70 H48', stroke: '#7dd3fc', 'stroke-width': 2, markerEnd: 'url(#arrC)' }, g);
}

function drawSchGenPar(svg) {
  svg.setAttribute("viewBox","0 0 300 128");
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  // nod A stânga, B dreapta
  svgEl('circle', { cx: 40, cy: 45, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 28, y: 33, class: 'node-label', text: 'A' }, g);
  svgEl('circle', { cx: 260, cy: 45, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 266, y: 33, class: 'node-label', text: 'B' }, g);
  svgEl('path', { d: 'M40 45 V14 H110', class: 'wire' }, g);
  battSymbol(g, 133, 14, false);
  svgEl('path', { d: 'M156 14 H260 V45', class: 'wire' }, g);
  svgEl('path', { d: 'M40 45 V45 H110', class: 'wire' }, g);
  battSymbol(g, 133, 45, false);
  svgEl('path', { d: 'M156 45 H260', class: 'wire' }, g);
  // ramura cu R
  svgEl('path', { d: 'M40 45 V84 H113', class: 'wire' }, g);
  resSymbol(g, 136, 84, 46, 17);
  svgEl('path', { d: 'M159 84 H260 V45', class: 'wire' }, g);
  svgEl('text', { x: 133, y: -2, class: 'e-label', text: 'E, r' }, g);
  svgEl('text', { x: 133, y: 66, class: 'e-label', text: 'E, r' }, g);
  svgEl('text', { x: 136, y: 106, class: 'i-label', text: 'R' }, g);
  svgEl('path', { d: 'M62 84 H50', stroke: '#7dd3fc', 'stroke-width': 2, markerEnd: 'url(#arrC)' }, g);
}

function drawSchSunt(svg) {
  svg.setAttribute("viewBox","0 0 440 178");
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  svgEl('path', { d: 'M20 60 H86', class: 'wire' }, g);
  svgEl('circle', { cx: 96, cy: 60, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 92, y: 44, class: 'node-label', text: 'B' }, g);
  meterSymbol(g, 150, 60, 17, 'A', '#22d3ee');
  svgEl('path', { d: 'M167 60 H250', class: 'wire' }, g);
  svgEl('circle', { cx: 260, cy: 60, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 258, y: 44, class: 'node-label', text: 'C' }, g);
  // șuntul
  svgEl('path', { d: 'M96 60 V120 H150', class: 'wire' }, g);
  resSymbol(g, 195, 120, 46, 17);
  svgEl('path', { d: 'M218 120 H260 V60', class: 'wire' }, g);
  svgEl('text', { x: 195, y: 148, class: 'i-label', text: 'Rₛ', 'text-anchor': 'middle' }, g);
  svgEl('text', { x: 104, y: 96, class: 'i-label', text: 'Iₛ' }, g);
  svgEl('text', { x: 150, y: 34, class: 'i-label', text: 'I_A', 'text-anchor': 'middle' }, g);
  svgEl('path', { d: 'M40 60 H28', stroke: '#7dd3fc', 'stroke-width': 2, markerEnd: 'url(#arrC)' }, g);
  svgEl('text', { x: 34, y: 44, class: 'i-label', text: 'I' }, g);
  svgEl('text', { x: 150, y: 90, class: 'note', text: 'R_A', 'text-anchor': 'middle' }, g);
}

function drawSchAdd(svg) {
  svg.setAttribute("viewBox","0 0 440 178");
  svg.innerHTML = SVG_DEFS;
  const g = svgEl('g', {}, svg);
  svgEl('path', { d: 'M40 60 V26 H96', class: 'wire' }, g);
  meterSymbol(g, 116, 26, 17, 'V', '#a5b4fc');
  svgEl('path', { d: 'M133 26 H200', class: 'wire' }, g);
  resSymbol(g, 226, 26, 46, 17);
  svgEl('path', { d: 'M249 26 H330 V60 H300', class: 'wire' }, g);
  svgEl('text', { x: 226, y: 8, class: 'i-label', text: 'Rₐ' }, g);
  svgEl('circle', { cx: 40, cy: 60, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 26, y: 48, class: 'node-label', text: 'A' }, g);
  svgEl('circle', { cx: 330, cy: 60, r: 5, class: 'node-dot' }, g);
  svgEl('text', { x: 336, y: 48, class: 'node-label', text: 'B' }, g);
  svgEl('path', { d: 'M40 60 H120', class: 'wire' }, g);
  resSymbol(g, 146, 60, 46, 17);
  svgEl('path', { d: 'M169 60 H330', class: 'wire' }, g);
  svgEl('text', { x: 146, y: 88, class: 'i-label', text: 'R', 'text-anchor': 'middle' }, g);
  svgEl('text', { x: 76, y: 50, class: 'note', text: 'U', 'text-anchor': 'middle' }, g);
  svgEl('path', { d: 'M70 118 H320', stroke: '#a5b4fc', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, g);
  svgEl('text', { x: 195, y: 134, class: 'loop-label', text: 'U = U_V + U_a' }, g);
}

/* containerele hero/mini-art sunt <div>: creăm în ele un <svg> real */
function asSvg(host) {
  if (!host) return null;
  if (host.tagName && host.tagName.toLowerCase() === 'svg') return host;
  let s = host.querySelector('svg');
  if (!s) { s = document.createElementNS(NS, 'svg'); host.appendChild(s); }
  return s;
}

function initStaticCircuits() {
  drawHeroK(asSvg($('#heroArt')));
  drawHeroG(asSvg($('#heroArt2')));
  $$('.mini-art').forEach(el => drawMiniArt(asSvg(el), el.dataset.art));
  drawSchSeries($('#schSeries'));
  drawSchParallel($('#schParallel'));
  drawSchGenSer($('#schGenSer'));
  drawSchGenPar($('#schGenPar'));
  drawSchSunt($('#schSunt'));
  drawSchAdd($('#schAdd'));
}
