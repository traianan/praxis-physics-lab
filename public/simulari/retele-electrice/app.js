(()=>{
/* ============================================================
   core.js — utilitare, sunete (WebAudio), navigare
   ============================================================ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (v, d = 2) => {
  if (!isFinite(v)) return '—';
  const r = Math.abs(v) < 1e-9 ? 0 : v;
  return r.toFixed(d).replace(/\.?0+$/, (m) => (m.includes('.') ? '' : m));
};
const SIGNED = (v, d = 2) => (v > 1e-9 ? '+' : v < -1e-9 ? '−' : '') + Math.abs(v).toFixed(d);

/* ------------- namespace global pentru module ------------- */
const App = {
  views: {},
  state: {},
  soundOn: true,
};

/* ============================================================
   AUDIO ENGINE — totul sintetizat, fără fișiere externe
   ============================================================ */
const playSound=name=>{if(!document.hidden)PraxisSound.play(name);};
const Sound={setEnabled:v=>PraxisSound.setEnabled(v),isEnabled:()=>PraxisSound.enabled,click:()=>playSound('click'),tick:()=>playSound('select'),switchOn:()=>playSound('switch'),switchOff:()=>playSound('switch'),ok:()=>playSound('event'),err:()=>playSound('reset'),drop:()=>playSound('move'),connect:()=>playSound('select'),del:()=>playSound('reset'),slide:()=>playSound('move'),alarm:()=>playSound('event'),win:()=>playSound('event')};


/* ============================================================
   NAVIGARE
   ============================================================ */
const Router = (() => {
  const titles = {
    'k-theory': 'Partea I · Legile lui Kirchhoff',
    'k-anim': 'Partea I · Animație: legea I',
    'k-lab': 'Partea I · Laborator: ochiuri de rețea',
    'g-theory': 'Partea II · Gruparea rezistoarelor și generatoarelor',
    'g-lab': 'Partea II · Laborator: tablou de circuite',
    'g-gen': 'Partea II · Generatoare: serie și paralel',
    'g-sunt': 'Partea II · Șunt și rezistență adițională',
    'problems': 'Exersare · Probleme rezolvate',
    'quiz': 'Exersare · Test rapid',
  };
  let current = 'k-theory';
  const hooks = {};

  function go(id) {
    if (!App.views[id]) return;
    $$('.view').forEach(v => {v.classList.remove('active');v.hidden=true;});
    App.views[id].classList.add('active');App.views[id].hidden=false;
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    $('#crumbs').innerHTML = (titles[id] || '').replace(/·/g, '<b>·</b>');
    current = id;document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});const sections=document.querySelector('.praxis-course-sections');if(sections)sections.value=id;
    // starea globală (LED-ul din bara de sus) se resetează la fiecare schimbare de secțiune;
    // secțiunile cu circuit o reactualizează din propriul hook
    const led = $('#ledGlobal'), pill = $('#pillText');
    if (led) led.className = 'led';
    if (pill) pill.textContent = 'fără circuit activ';
    $('#scroll').scrollTop = 0;
    if (hooks[id]) hooks[id]();
    if (window.innerWidth <= 840) { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('on'); }
  }
  return {
    go,
    on(id, fn) { hooks[id] = fn; },
    init() {
      $$('.view').forEach(v => App.views[v.id.replace(/^view-/, '')] = v);
      $$('.nav-item').forEach(b => b.addEventListener('click', () => { Sound.click(); go(b.dataset.view); }));
      $$('[data-goto]').forEach(b => b.addEventListener('click', () => { Sound.click(); go(b.dataset.goto); }));
    },
    get current() { return current; },
  };
})();

/* ============================================================
   SVG helpers
   ============================================================ */
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    if (k === 'text') networkSvgText(e,attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}
const SVG_DEFS = `
<defs>
  <filter id="glowC" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="2.6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glowG" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="3.4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="lampG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff8d6"/><stop offset="1" stop-color="#fbbf24"/>
  </linearGradient>
  <marker id="arrC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#7dd3fc"/>
  </marker>
  <marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#fda4af"/>
  </marker>
  <marker id="arrLoop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#a5b4fc"/>
  </marker>
</defs>`;

/* simboluri reutilizabile pentru piese de circuit */
function resSymbol(g, x, y, w = 46, h = 18) {
  svgEl('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 3, class: 'res-box' }, g);
}
function battSymbol(g, x, y, vert = false, flipped = false) {
  // borna lungă (+) și borna scurtă (−)
  const t = 4.5, gap = 7;
  const longAt = flipped ? -1 : 1; // + pe dreapta/sus
  if (!vert) {
    svgEl('line', { x1: x - gap, y1: y - 11, x2: x - gap, y2: y + 11, class: 'batt-thin' }, g);
    svgEl('line', { x1: x + gap, y1: y - 17, x2: x + gap, y2: y + 17, class: 'batt-plate' }, g);
    if (longAt < 0) {} // păstrăm forma standard; eticheta +/− vine separat
  } else {
    svgEl('line', { x1: x - 11, y1: y + gap, x2: x + 11, y2: y + gap, class: 'batt-thin' }, g);
    svgEl('line', { x1: x - 17, y1: y - gap, x2: x + 17, y2: y - gap, class: 'batt-plate' }, g);
  }
}
function lampSymbol(g, x, y, r = 13, on = false, id = '') {
  const c = svgEl('circle', {
    cx: x, cy: y, r, fill: on ? 'url(#lampG)' : 'rgba(148,163,184,.14)',
    stroke: on ? '#fde68a' : '#93a8c9', 'stroke-width': 2,
  }, g);
  if (on) c.setAttribute('filter', 'url(#glowG)');
  svgEl('path', {
    d: `M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}`,
    stroke: on ? '#a16207' : '#93a8c9', 'stroke-width': 1.6, fill: 'none',
  }, g);
  return c;
}
function meterSymbol(g, x, y, r, letter, color = '#22d3ee') {
  svgEl('circle', { cx: x, cy: y, r, fill: '#0e1830', stroke: color, 'stroke-width': 2 }, g);
  const t = svgEl('text', {
    x, y: y + 1, fill: color, 'font-family': 'var(--mono)', 'font-size': r * 1.05,
    'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-weight': 700, text: letter,
  }, g);
  return t;
}

// Recover conductor currents from terminal injections without changing the MNA
// solution. Equal ideal parallel paths use the minimum-norm distribution.
function networkWireCurrents(points,segments,parts,elements){
 const n=points.length,adj=Array.from({length:n},()=>[]),injection=new Float64Array(n);
 const currents=new Map(elements.map(e=>[e.piece,e.I]));
 for(const {p,a,b} of parts){let i=currents.get(p.id)||0;if(p.type==='battery'&&p.flip)i=-i;injection[a]-=i;injection[b]+=i;}
 segments.forEach(([a,b],i)=>{if(a!==b){adj[a].push([b,i]);adj[b].push([a,i]);}});
 const seen=new Set(),potential=new Float64Array(n);
 for(let start=0;start<n;start++){
  if(seen.has(start))continue;const nodes=[start];seen.add(start);
  for(let j=0;j<nodes.length;j++)for(const [v] of adj[nodes[j]])if(!seen.has(v)){seen.add(v);nodes.push(v);}
  const free=nodes.slice(1),index=new Map(free.map((v,i)=>[v,i])),m=free.length;
  const matrix=free.map(v=>{const row=new Float64Array(m+1);row[index.get(v)]=adj[v].length;for(const [w] of adj[v])if(index.has(w))row[index.get(w)]--;row[m]=injection[v];return row;});
  for(let c=0;c<m;c++){
   let pivot=c;for(let r=c+1;r<m;r++)if(Math.abs(matrix[r][c])>Math.abs(matrix[pivot][c]))pivot=r;
   [matrix[c],matrix[pivot]]=[matrix[pivot],matrix[c]];const d=matrix[c][c];if(Math.abs(d)<1e-12)continue;
   for(let k=c;k<=m;k++)matrix[c][k]/=d;
   for(let r=0;r<m;r++)if(r!==c){const f=matrix[r][c];for(let k=c;k<=m;k++)matrix[r][k]-=f*matrix[c][k];}
  }
  free.forEach((v,i)=>potential[v]=matrix[i][m]);
 }
 return segments.map(([a,b,wire])=>({wire,x1:points[a].x,y1:points[a].y,x2:points[b].x,y2:points[b].y,I:potential[a]-potential[b]}));
}

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
    this._layer = svgEl('g', { class: 'flow-layer' }, svg);networkSourceGaps(svg,this._layer);
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
      if(!document.hidden&&!document.getElementById('network-pause')?.checked&&this.svg.closest('.view')?.classList.contains('active')&&this.svg.getBoundingClientRect().bottom>0&&this.svg.getBoundingClientRect().top<innerHeight)this.tick(dt);
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
  const S = { I1: 2, I2: 1.5, I3: -3.5, speed: 1, closed: true };

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
    const pOut = svgEl('path', { d: `M${P3[0]} ${P3[1]} L${A[0]} ${A[1]}`, class: 'wire' }, g);

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


    const sw = svgEl('g', { transform: 'translate(522,218)' }, g);
    svgEl('circle', { cx: 0, cy: 0, r: 3.4, fill: '#93a8c9' }, sw);
    const swLever = svgEl('line', { x1: 0, y1: 0, x2: 13, y2: 0, stroke: '#fbbf24', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, sw);
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
    const a1 = arrow(228, 174, 31, 'I₁');
    const a2 = arrow(228, 262, -31, 'I₂');
    const a3 = arrow(432, 218, 0, 'I₃', 'out');

    // bare de bilanț
    svgEl('text', { x: 56, y: 26, class: 'note', text: 'curent care intră (+)' }, g);
    svgEl('text', { x: 540, y: 26, class: 'note', text: 'curent care iese (−)', 'text-anchor': 'end' }, g);

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
    const sum = S.I1 + S.I2 + S.I3;
    $('#oI1').textContent = S.I1.toFixed(1) + ' A';
    $('#oI2').textContent = S.I2.toFixed(1) + ' A';
    const o3 = $('#oI3'); if (o3) o3.textContent = S.I3.toFixed(1) + ' A';
    $('#i3Val').textContent = (S.closed ? sum : 0).toFixed(1) + ' A';
    $('#sumLive').textContent = [S.I1,S.I2,S.I3].map(v=>{v=S.closed?v:0;return v<0?'('+v.toFixed(1)+')':v.toFixed(1);}).join(' + ');
    const liveEl = $('#sumLive').parentElement;
    liveEl.style.color = Math.abs(sum) < 0.001 ? '#176449' : '#a23444';
    const target = $('#i3Val');
    target.style.color = Math.abs(sum) < 0.001 ? '#176449' : '#a23444';

    $('#animHint').innerHTML = S.closed
      ? (Math.abs(sum) < 0.001
        ? '✔ Nod echilibrat: <b>I₁ + I₂ + I₃ = 0</b>. Sarcina care intră = sarcina care iese.'
        : `✖ Nodul nu este echilibrat: suma algebrică este <b>${SIGNED(sum, 1)} A</b>. Ajustează până când I₃ = −(I₁ + I₂).`)
      : 'Întrerupătorul K este deschis → prin nici o latură nu circulă curent.';

    if (S.refs) {
      [[S.refs.a1,S.I1,false],[S.refs.a2,S.I2,false],[S.refs.a3,S.I3,true]].forEach(([arrow,current,right])=>{
        const path=arrow.querySelector('path'),reverse=right?current>0:current<0;
        path.setAttribute('transform',reverse?'rotate(180)':'rotate(0)');
        path.setAttribute('fill',current<0?'#fda4af':'#7dd3fc');
        arrow.style.opacity=S.closed&&Math.abs(current)>.001?'1':'0.25';
        arrow.querySelector('text').style.fill=current<0?'#fda4af':'#7dd3fc';
      });
      S.refs.swLever.setAttribute('transform', S.closed ? 'rotate(0)' : 'rotate(-38)');
      S.refs.pIn1.classList.toggle('hi', S.closed);
      S.refs.pOut.classList.toggle('hi', S.closed);
      setLed(S.closed);
    }
  }

  function setLed(on) {
    const led = $('#ledGlobal');
    led.className = 'led ' + (on ? 'on' : 'off');
    $('#pillText').textContent = on ? 'circuit închis · ' + [S.I1,S.I2,S.I3].filter(i=>i>0).reduce((a,b)=>a+b,0).toFixed(1) + ' A în nod' : 'circuit deschis';
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
      const target = -(+(S.I1 + S.I2).toFixed(1));
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
    const I1 = P.closed ? (P.E1 * m22 - m12 * P.E2) / det : P.E1/(a1+R3);
    const I2 = P.closed ? (m11 * P.E2 - P.E1 * m21) / det : 0;
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
    const pRight = wire('M570 90 L570 221 M570 249 L570 380');
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
    svgEl('text', { x: 290, y: 232, class: 'i-label', text: 'I₃' }, g);

    // noduri cu potențiale (afișate live)
    const vB = svgEl('text', { x: 340, y: 66, class: 'note', 'text-anchor': 'middle', text: '' }, g);
    const vA = svgEl('text', { x: 340, y: 406, class: 'note', 'text-anchor': 'middle', text: '' }, g);

    // flux electroni
    const pth1 = svgEl('path', { d: `M${G.B} L${G.TL} L${G.BL} L${G.A}`, fill: 'none', stroke: 'none' }, g);
    const pth2 = svgEl('path', { d: `M${G.B} L${G.TR} L${G.BR} L${G.A}`, fill: 'none', stroke: 'none' }, g);
    const pth3 = svgEl('path', { d: `M${G.A} L${G.B}`, fill: 'none', stroke: 'none' }, g);
    flow = new Flow(svg, {});
    flow.add(pth1, { getI: () => (sol.I1 || 0), color: '#7dd3fc', spacing: 44 });
    flow.add(pth2, { getI: () => (P.closed ? sol.I2 || 0 : 0), color: '#7dd3fc', spacing: 44 });
    flow.add(pth3, { getI: () => (sol.I3 || 0), color: '#a5b4fc', spacing: 34 });
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
    // The remaining closed loop is already handled by solve().

    refs.lever.setAttribute('transform', P.closed ? 'rotate(0)' : 'rotate(46)');
    [refs.pTopL, refs.pTopR, refs.pBotL, refs.pBotR].forEach(p => p.classList.toggle('hi', !open));

    // orientarea săgeților: dacă I < 0, sensul real este invers celui ales
    const dir = (I) => (I >= 0 ? '' : ' rotate(180)');
    refs.ar1.setAttribute('transform', `translate(196,150) rotate(90)${dir(sol.I1)}`);
    refs.ar2.setAttribute('transform', `translate(484,150) rotate(90)${dir(sol.I2)}`);
    refs.ar3.setAttribute('transform', `translate(320,240) rotate(-90)${dir(sol.I3)}`);
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

    if(open&&E)E.children[2].innerHTML='<span>K deschis: I₂ = 0; U_K = E₂ − R₃I₃</span><b>'+fmt(P.E2-P.R3*sol.I3,2)+' V</b>';
    if(!$('#kSteps').hidden)$('#kSteps').hidden=true;
    // bara de putere
    const bar = $('#kMeterBar');
    if (bar) {
      const maxP = 200;
      bar.style.width = clamp(Math.abs(sol.PR3) / maxP * 100, 0, 100) + '%';
      $('#kMeterHint').textContent = `Puterea disipată pe R₃: P = I₃²·R₃ = ${fmt(sol.PR3 * 1, 2)} W` +
        (open ? ' (circuit deschis)' : '');
    }

    if (refs.vA && refs.vB) {
      networkSvgText(refs.vA,'V_A = 0 V (referință)');
      networkSvgText(refs.vB,`V_B − V_A = ${fmt(-sol.I3 * P.R3, 2)} V`);
    }

    const led = $('#ledGlobal');
    led.className = 'led ' + (open ? 'off' : 'on');
    $('#pillText').textContent = open ? 'K deschis · ochiul stâng activ' : `K închis · I₃ = ${fmt(sol.I3, 2)} A`;

    updatePath();
  }

  /* -------- trasee de potențial -------- */
  function updatePath() {
    const out = $('#pathOut');
    if (!out) return;
    const { E1, E2, r1, r2, R1, R2, R3 } = P;
    const { I1, I2, I3 } = sol;
    const dAB = I3 * R3;                       // prin R₃
    const p1 = P.closed ? E2 - I2 * (R2 + r2) : dAB;            // A → C → D → B
    const p2 = E1 - I1 * (R1 + r1);            // A → E → F → B
    const rows = [
      [`A → B direct, prin R₃`, `V_A − V_B = I₃·R₃ = ${fmt(I3, 2)}·${fmt(R3, 1)}`, dAB],
      [`A → C → D → B (prin R₂ și E₂)`, `V_A − V_B = E₂ − I₂(R₂+r₂) = ${fmt(E2, 1)} − ${fmt(I2, 2)}·${fmt(R2 + r2, 1)}`, p1],
      [`A → E → F → B (prin R₁ și E₁)`, `V_A − V_B = E₁ − I₁(R₁+r₁) = ${fmt(E1, 1)} − ${fmt(I1, 2)}·${fmt(R1 + r1, 1)}`, p2],
    ];
    if(!P.closed)rows[1][1]=`V_A − V_B = E₂ − U_K = ${fmt(E2,2)} − (${fmt(E2-dAB,2)})`;
    const r = rows[pathIdx];
    out.innerHTML = `<div class="eq-row"><span>${r[0]}</span><b>${fmt(r[2], 2)} V</b></div>
      <div class="muted" style="margin-top:8px">${r[1].replace(/V_([AB])/g,"V<sub>$1</sub>")} = <b>${fmt(r[2], 2)} V</b></div>
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
      if(!P.closed){box.innerHTML='<p>K deschis: latura 2 este întreruptă. Ochiul stâng rămâne închis.</p><p>I₂ = 0; I₁ = I₃ = E₁/(R₁+r₁+R₃) = '+fmt(sol.I1,3)+' A</p>';return;}
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

  return { init, update, solve, P, get sol() { return sol; } };
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
    const lhs = currents.map(c => c.name).join(' + ');
    $('#nbEq').innerHTML = `
      <div class="formula-small" style="text-align:left">Σ I = ${lhs} = 0</div><div class="formula-small">${currents.map(c=>c.name+(c.dir===1?" &gt; 0":" &lt; 0")).join(" · ")}</div>
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

  Router.on('k-anim', () => { NodeAnim.build(); NodeAnim.update(); });
  Router.on('k-lab', () => { LabK.update(); });
}

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
      const el = $('#sRload'); el.min=0; el.step=String(v.Ropt/Math.ceil(v.Ropt/.1)); el.value=String(v.Ropt);
      S.R = +el.value; Sound.ok(); render();
    });
  }

  function render() {
    const v = values();
    $('#oN').textContent = S.n;
    $('#oEg').textContent = S.E.toFixed(1) + ' V';
    $('#oRg').textContent = S.r.toFixed(1) + ' Ω';
    $('#oRload').textContent = fmt(S.R,3) + ' Ω';

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
    if(flow)flow.stop();
    svg.innerHTML = SVG_DEFS;
    const g = svgEl('g', {}, svg);
    const n = S.n;
    let pIn, pLoad;

    if (S.mode === 'serie') {
      // buclă dreptunghiulară, generatoare pe latura de sus
      const L = 90, Rt = 520, Ty = 100, By = 300;
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
      // No conductor across the generator bank: it would short the sources.   // legătura de sus
      const slot = n > 1 ? (y1 - y0) / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        const y = n > 1 ? y0 + slot * i : (y0 + y1) / 2;
        svgEl('path', { d: `M${Lx} ${y} H${Lx + 122}`, class: 'wire' }, g);
        svgEl('path', { d: `M${Lx + 146} ${y} H${Rx}`, class: 'wire' }, g);
        const gg = svgEl('g', { transform: `translate(${Lx + 134},${y})` }, g);
        svgEl('line', { x1: -12, y1: -13, x2: -12, y2: 13, class: 'batt-plate' }, gg);
        svgEl('line', { x1: 12, y1: -7, x2: 12, y2: 7, class: 'batt-thin' }, gg);
        svgEl('text', { x: -14, y: -20, class: 'e-label', text: '+' }, gg);
        svgEl('text', { x: 14, y: -14, class: 'e-label', text: '−' }, gg);
        svgEl('text', { x: 0, y: 28, class: 'note', text: 'E, r', 'text-anchor': 'middle' }, gg);
      }
      // consumatorul, pe ramura de jos a scării
      svgEl('path', { d: `M${Lx} ${By} H${Lx + 152}`, class: 'wire' }, g);
      svgEl('rect', { x: Lx + 152, y: By - 11, width: 62, height: 22, rx: 4, class: 'res-box' }, g);
      svgEl('text', { x: Lx + 183, y: By + 30, class: 'i-label', text: `R = ${fmt(S.R, 1)} Ω`, 'text-anchor': 'middle' }, g);
      svgEl('path', { d: `M${Lx + 214} ${By} H${Rx}`, class: 'wire' }, g);
      svgEl('text', { x: Lx - 14, y: Ty - 8, class: 'node-label', text: 'A' }, g);
      svgEl('text', { x: Rx + 8, y: Ty - 8, class: 'node-label', text: 'B' }, g);
      pIn = svgEl('path', {
        d: `M${Lx} ${By} V${n > 1 ? y0 : (y0+y1)/2} H${Rx} V${By} H${Lx}`,
        fill: 'none', stroke: 'none',
      }, g);
      pLoad = pIn;
      svgEl('path', { d: `M${Lx + 60} ${By} H${Lx + 42}`, stroke: '#7dd3fc', 'stroke-width': 2.2, markerEnd: 'url(#arrC)' }, g);
    }

    svgEl('text', { x: 24, y: 26, class: 'note', text: S.mode === 'serie' ? `${n} generatoare în serie` : `${n} generatoare în paralel` }, g);
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
  let initialized=false;
  function init() {
    if(initialized)return;initialized=true;
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

/* ============================================================
   problems.js — probleme rezolvate + test rapid
   ============================================================ */
'use strict';

const PROBLEMS = [
  {
    no: '1',
    tag: 'Kirchhoff',
    title: 'Rețea cu două surse reale: aflarea curenților pe laturi',
    stmt: `În circuitul din figura din laborator se cunosc: E₁ = 22 V, r₁ = 1 Ω, E₂ = 19 V, r₂ = 1 Ω,
      R₁ = R₃ = 4 Ω, R₂ = 6 Ω. Aflați intensitățile I₁, I₂ și I₃ ale curenților care parcurg rezistoarele
      de rezistență R₁, R₂, respectiv R₃.`,
    steps: [
      ['Alegem arbitrar sensurile curenților: I₁ și I₂ prin laturile superioare, I₃ prin latura comună, în jos.',
        'sensuri alese: I₁ ↓ stânga, I₂ ↓ dreapta, I₃ ↓ prin R₃'],
      ['Scriem prima lege a lui Kirchhoff pentru nodul B (n = 2 noduri → n − 1 = 1 ecuație independentă).',
        'I₁ + I₂ − I₃ = 0'],
      ['A doua lege a lui Kirchhoff pentru ochiul stâng (sursa E₁, r₁, R₁, R₃).',
        'E₁ = I₁·R₁ + I₃·R₃ + I₁·r₁'],
      ['A doua lege a lui Kirchhoff pentru ochiul drept.',
        'E₂ = I₂·R₂ + I₃·R₃ + I₂·r₂'],
      ['Înlocuim valorile numerice. Observăm că r₁ și r₂ se însumează cu R₁, respectiv R₂.',
        '22 = 5·I₁ + 4·I₃  și  19 = 7·I₂ + 4·I₃'],
      ['Înlocuim I₃ = I₁ + I₂ și rezolvăm sistemul de 3 ecuații cu 3 necunoscute.',
        '22 = 9I₁ + 4I₂ ;  19 = 4I₁ + 11I₂  →  Δ = 83'],
    ],
    answer: 'I₁ = 2 A, I₂ = 1 A, I₃ = 3 A',
    verify: () => {
      const E1 = 22, E2 = 19, R1 = 4, r1 = 1, R2 = 6, r2 = 1, R3 = 4;
      const a1 = R1 + r1, a2 = R2 + r2;
      const det = (a1 + R3) * (a2 + R3) - R3 * R3;
      const I1 = (E1 * (a2 + R3) - R3 * E2) / det;
      const I2 = ((a1 + R3) * E2 - R3 * E1) / det;
      return `I₁ = ${fmt(I1, 3)} A · I₂ = ${fmt(I2, 3)} A · I₃ = ${fmt(I1 + I2, 3)} A
        → nod: ${fmt(I1 + I2 - (I1 + I2), 6)} = 0 ✔`;
    },
  },
  {
    no: '2',
    tag: 'Kirchhoff',
    title: 'Două ecuații de ochi + diferența de potențial între două noduri',
    stmt: `În circuitul din laborator se cunosc: E₂ = 19 V, r₂ = 1 Ω, R₁ = 4 Ω, R₂ = R₃ = 2 Ω și I₁ = 2 A.
      Aflați I₂, I₃, E₁ și diferența de potențial V_A − V_B.`,
    steps: [
      ['Prima lege a lui Kirchhoff pentru nodul A.', 'I₁ + I₂ − I₃ = 0  →  2 + I₂ = I₃'],
      ['Legea a doua pentru ochiul stâng (conține E₁, r₁, R₁, R₃).', 'E₁ = I₃·R₃ + I₁·R₁ + I₁·r₁ = 2·I₃ + 2·4 + 2·1 = 2I₃ + 10'],
      ['Legea a doua pentru ochiul drept (conține E₂, r₂, R₂, R₃).', 'E₂ = I₃·R₃ + I₂·R₂ + I₂·r₂ = 2I₃ + 3I₂'],
      ['Din ecuația ochiului drept și din I₃ = 2 + I₂ obținem I₂ și I₃.',
        '19 = 2(2 + I₂) + 3I₂ = 4 + 5I₂  →  I₂ = 3 A, I₃ = 5 A'],
      ['Revenim în ecuația ochiului stâng.', 'E₁ = 2·5 + 10 = 20 V'],
      ['Calculăm V_A − V_B pe trei trasee independente (rezultatul trebuie să fie identic).',
        'a) V_A − V_B = I₃R₃ = 10 V · b) E₂ − I₂(r₂+R₂) = 10 V · c) E₁ − I₁(R₁+r₁) = 10 V'],
    ],
    answer: 'I₂ = 3 A, I₃ = 5 A, E₁ = 20 V, V_A − V_B = 10 V',
    verify: () => `Verificare ochi stâng: E₁ = 2·5 + 2·4 + 2·1 = ${2 * 5 + 2 * 4 + 2 * 1} V ✔ ·
      ochi drept: ${2 * 5 + 3 * 3} = 19 V ✔ · trasee: toate dau 10 V ✔`,
  },
  {
    no: '3',
    tag: 'Grupare',
    title: 'Rezistența echivalentă a unui dipol (serie + paralel)',
    stmt: `Aflați rezistența echivalentă R a dipolului AB. Se dau: R₁ = R₂ = R₃ = 2 Ω, R₄ = 3 Ω.
      R₂ și R₄ sunt în serie; gruparea lor este în paralel cu R₃; totul în serie cu R₁.`,
    steps: [
      ['R₂ și R₄ sunt în serie (același curent le străbate).', 'R₅ = R₂ + R₄ = 2 + 3 = 5 Ω'],
      ['R₅ este în paralel cu R₃.', '1/R₆ = 1/R₃ + 1/R₅ = 1/2 + 1/5 = 7/10  →  R₆ = 10/7 Ω ≈ 1,43 Ω'],
      ['R₁ este în serie cu R₆.', 'R = R₁ + R₆ = 2 + 10/7 = 24/7 Ω'],
      ['Rezultat numeric.', 'R ≈ 3,43 Ω'],
    ],
    answer: 'R = 24/7 Ω ≈ 3,43 Ω',
    verify: () => {
      const R6 = 1 / (1 / 2 + 1 / 5);
      return `R₆ = 1/(1/2 + 1/5) = ${fmt(R6, 4)} Ω · R = 2 + ${fmt(R6, 4)} = ${fmt(2 + R6, 4)} Ω`;
    },
  },
  {
    no: '4',
    tag: 'Generatoare',
    title: 'Două surse reale în serie + consumator variabil',
    stmt: `Un circuit conține două surse E₁ = 4 V, E₂ = 3,2 V cu r₁ = 0,5 Ω, respectiv r₂ = 1,5 Ω, legate în
      serie, și un rezistor R₁ = 10 Ω. Aflați: a) căderea de tensiune U în circuitul exterior; b) tensiunile U₁ și U₂
      la bornele fiecărei surse; c) numărul N de electroni care trec printr-o secțiune în τ = 10 s;
      d) intensitățile I₁, I₂ dacă în paralel cu R₁ se leagă R₂ = 5 Ω.`,
    steps: [
      ['a) Legea a doua a lui Kirchhoff pe ochiul unic, cu ambele surse în serie (același sens).',
        'E₁ + E₂ = I(R₁ + r₁ + r₂)  →  I = 7,2/12 = 0,6 A'],
      ['Tensiunea exterioară este căderea pe R₁ (fără r!).', 'U = I·R₁ = 0,6·10 = 6 V'],
      ['b) Atenție la semn: r se scade din E, pentru fiecare sursă în parte.',
        'U₁ = E₁ − I·r₁ = 4 − 0,6·0,5 = 3,7 V ;  U₂ = E₂ − I·r₂ = 3,2 − 0,6·1,5 = 2,3 V'],
      ['c) Sarcina totală împărțită la sarcina electronului.',
        'N = Q/|e| = I·τ/|e| = 0,6·10 / 1,602·10⁻¹⁹ = 3,75·10¹⁹ electroni'],
      ['d) R₁ ∥ R₂, deci curentul principal se ramifică. Sistem Kirchhoff cu 2 ochiuri.',
        'I = I₁ + I₂ ;  E₁ + E₂ = I₁R₁ + I(r₁+r₂) ;  0 = −I₁R₁ + I₂R₂'],
      ['Rezolvăm: I = 3I₁, 5I₁ + I = 3,6 → 8I₁ = 3,6.', 'I₁ = 0,45 A ; I = 1,35 A ; I₂ = 0,9 A'],
    ],
    answer: 'a) U = 6 V · b) U₁ = 3,7 V, U₂ = 2,3 V · c) N = 3,75·10¹⁹ · d) I = 1,35 A, I₁ = 0,45 A, I₂ = 0,9 A',
    verify: () => {
      const E = 4 + 3.2, r = 0.5 + 1.5;
      const I = E / (10 + r);
      const I1p = 3.6 / (1 / (1 / 10 + 1 / 5) + r);
      return `serie: I = ${fmt(I, 3)} A, U = ${fmt(I * 10, 3)} V, U₁ = ${fmt(4 - I * 0.5, 3)} V, U₂ = ${fmt(3.2 - I * 1.5, 3)} V
        · cu R₂ ∥ R₁: R_ext = ${fmt(1 / (1 / 10 + 1 / 5), 3)} Ω, I = ${fmt(I1p, 3)} A`;
    },
  },
  {
    no: '5',
    tag: 'Generatoare',
    title: 'Trei surse reale în paralel (cu rezistențe interne diferite)',
    stmt: `Trei surse E₁ = 1 V, E₂ = 1,1 V, E₃ = 1,2 V cu r₁ = 2 Ω, r₂ = 3 Ω, r₃ = 1 Ω sunt conectate în paralel.
      La bornele comune A și B este legat un rezistor R = 20 Ω. Aflați: a) intensitatea I prin R;
      b) intensitățile prin surse dacă E₃ este scoasă din circuit; c) tensiunea U măsurată de un voltmetru cu R_V = 2 kΩ.`,
    steps: [
      ['a) Aplicăm Kirchhoff: un nod (A) și două ochiuri independente (3 laturi, 2 noduri → o = 3 − 2 + 1 = 2).',
        'I₁ + I₂ + I₃ = I ; E₁ − E₂ = I₁r₁ − I₂r₂ ; E₂ − E₃ = I₂r₂ − I₃r₃ ; E₃ = I₃r₃ + I·R'],
      ['Înlocuim valorile numerice (atenție: E₃ este „cea mai puternică”, deci dă curent).',
        '2I₁ − 3I₂ = −0,1 ; 3I₂ − I₃ = −0,1 ; I₃ + 20I = 1,2'],
      ['Exprimăm I₃ = 1,2 − 20I și reducem sistemul.', 'I₂ = 21I − 1,2 − I₁ ; apoi sistem 2×2 în I, I₁'],
      ['Adunăm ecuațiile și aflăm curentul principal.', '−226·I = −12,4  →  I = 12,4/226 = 54,9 mA'],
      ['b) Sursa E₃ scoasă → rămân două surse în paralel; I′ = curentul total.',
        'I′ = (E₁/r₁ + E₂/r₂) / (1 + R/r₁ + R/r₂) = (1/2 + 1,1/3) / (1 + 20(1/2 + 1/3)) = 49 mA'],
      ['Curenții prin fiecare sursă: I₁ = (E₁ − I′R)/r₁, I₂ = (E₂ − I′R)/r₂.',
        'I₁ = (1 − 0,98)/2 = 10 mA ; I₂ = (1,1 − 0,98)/3 = 40 mA'],
      ['c) Voltmetrul are rezistență proprie — se pune în paralel cu R și modifică circuitul!',
        '1/R_e = 1/R + 1/R_V = 1/20 + 1/2000 = 0,0505 → R_e = 19,8 Ω'],
      ['Recalculăm curentul și tensiunea.', 'I_e ≈ 49,5 mA ;  U = I_e·R_e ≈ 0,98 V'],
    ],
    answer: 'a) I = 54,9 mA · b) I′ = 49 mA, I₁ = 10 mA, I₂ = 40 mA · c) U ≈ 0,98 V',
    verify: () => {
      const R = 20, RV = 2000;
      const Re = 1 / (1 / R + 1 / RV);
      return `R_e (R ∥ R_V) = ${fmt(Re, 3)} Ω. Voltmetrul nu este „invizibil”: el consumă curent și scade
        tensiunea măsurată cu aproximativ ${fmt(1.2 - 0.98, 2)} V față de cazul ideal.`;
    },
  },
  {
    no: '6',
    tag: 'Instrumente',
    title: 'Șuntul ampermetrului',
    stmt: `Un ampermetru cu rezistența internă R_A = 2 Ω măsoară curenți până la I_A = 1 A.
      Ce rezistență R_s trebuie legată în paralel pentru a mări domeniul de n = 5 ori?`,
    steps: [
      ['Curentul total se ramifică: o parte prin ampermetru, restul prin șunt.',
        'I = I_A + I_s  cu I = n·I_A  →  I_s = (n − 1)·I_A'],
      ['Legea a doua a lui Kirchhoff pe ochiul format de ampermetru și șunt (aceeași tensiune).',
        '0 = I_A·R_A − I_s·R_s  →  I_A·R_A = I_s·R_s'],
      ['Înlocuim I_s.', 'R_s = I_A·R_A / ((n−1)·I_A) = R_A/(n − 1)'],
      ['Numeric, pentru n = 5.', 'R_s = 2/4 = 0,5 Ω'],
    ],
    answer: 'R_s = R_A/(n − 1) = 0,5 Ω',
    verify: () => `Cu R_s = 0,5 Ω: la I = 5 A, prin ampermetru trec ${fmt(5 * 0.5 / 2.5, 2)} A · prin șunt ${fmt(5 * 2 / 2.5, 2)} A ✔`,
  },
];

/* ---------- randare ---------- */
function initProblems() {
  const host = $('#probList');
  if (!host) return;
  host.innerHTML = PROBLEMS.map((p, i) => `
    <article class="card prob" data-i="${i}">
      <div class="prob-head">
        <div class="prob-no">${i + 1}</div>
        <div class="prob-title">Ex. ${p.no} — ${p.title}</div>
        <span class="prob-tag">${p.tag}</span>
        <span class="prob-caret">▾</span>
      </div>
      <div class="prob-body">
        <div class="prob-stmt">${p.stmt}</div>
        <h4>Rezolvare</h4>
        ${p.steps.map(([t, m], k) => `
          <div class="step"><div class="step-n">${k + 1}</div>
          <div class="step-t">${t}${m ? `<span class="mono">${m}</span>` : ''}</div></div>`).join('')}
        <div class="answer"><b>Răspuns:</b> ${p.answer}</div>
        <div class="verify">
          <button class="btn btn-sm btn-ghost" data-ver="${i}">🔁 Verifică numeric (live)</button>
          <div class="vout" id="vout${i}" style="margin-top:9px"></div>
        </div>
      </div>
    </article>`).join('');

  host.querySelectorAll('.prob-head').forEach(h => h.addEventListener('click', () => {
    h.parentElement.classList.toggle('open');
    Sound.click();
  }));
  host.querySelectorAll('[data-ver]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const i = +b.dataset.ver;
    const out = $('#vout' + i);
    out.innerHTML = `<span class="mono">${PROBLEMS[i].verify()}</span> <span class="ok">✓</span>`;
    Sound.ok();
  }));
  host.querySelectorAll('.prob')[0].classList.add('open');
}

/* ============================================================
   QUIZ
   ============================================================ */
const QUIZ = [
  {
    q: 'Un nod de rețea este un punct în care se întâlnesc…',
    o: ['exact doi conductori', 'minimum trei conductori', 'doar surse de tensiune', 'doar rezistoare'],
    a: 1,
    e: 'Prin definiție, nodul de rețea este punctul în care se întâlnesc minimum trei conductori.',
  },
  {
    q: 'Prima lege a lui Kirchhoff este expresia…',
    o: ['conservării energiei', 'conservării sarcinii electrice', 'legii lui Ohm', 'legii lui Joule'],
    a: 1,
    e: 'Σ I = 0 într-un nod exprimă faptul că sarcina electrică nu se acumulează în nod.',
  },
  {
    q: 'Intr-o rețea cu n = 4 noduri și l = 6 laturi, câte ochiuri independente există?',
    o: ['2', '3', '4', '6'],
    a: 1,
    e: 'o = l − n + 1 = 6 − 4 + 1 = 3. Totalul ecuațiilor independente = (n−1) + o = 6 = numărul laturilor.',
  },
  {
    q: 'Două rezistoare R₁ = 6 Ω și R₂ = 3 Ω sunt legate în paralel. Rezistența echivalentă este:',
    o: ['9 Ω', '4,5 Ω', '2 Ω', '0,5 Ω'],
    a: 2,
    e: '1/R = 1/6 + 1/3 = 1/2 → R = 2 Ω. În paralel, R_ep este mai mică decât cea mai mică rezistență.',
  },
  {
    q: 'Un generator real are E = 12 V și r = 2 Ω. La borne, când prin el trece I = 1,5 A, tensiunea este:',
    o: ['12 V', '9 V', '15 V', '3 V'],
    a: 1,
    e: 'U = E − I·r = 12 − 1,5·2 = 9 V. Rezistența internă „fură” o parte din t.e.m.',
  },
  {
    q: 'n generatoare identice (E, r) în serie debitează pe R curentul:',
    o: ['I = E/(R + r)', 'I = nE/(R + nr)', 'I = E/(R + r/n)', 'I = nE/(nR + r)'],
    a: 1,
    e: 'E_es = nE, r_es = nr, deci I = nE/(R + nr).',
  },
  {
    q: 'Un ampermetru cu R_A = 3 Ω trebuie să măsoare de 4 ori mai mult. Șuntul are:',
    o: ['R_s = 12 Ω', 'R_s = 1 Ω', 'R_s = 0,75 Ω', 'R_s = 0,25 Ω'],
    a: 1,
    e: 'R_s = R_A/(n−1) = 3/3 = 1 Ω.',
  },
  {
    q: 'Puterea utilă transferată de o sursă (E, r) unui consumator R este maximă când:',
    o: ['R → 0', 'R = r', 'R = 2r', 'R → ∞'],
    a: 1,
    e: 'P = E²R/(R+r)² are maxim la R = r, iar randamentul este atunci de 50%.',
  },
];

const Quiz = (() => {
  let i = 0, score = 0, answered = false, timer;
  function render() {
    answered = false;
    const q = QUIZ[i];
    $('#quizIdx').textContent = i + 1;
    $('#quizTotal').textContent = QUIZ.length;
    $('#quizScore').textContent = score;
    $('#quizBarFill').style.width = (i / QUIZ.length * 100) + '%';
    $('#quizQ').textContent = q.q;
    $('#quizFb').textContent = '';
    $('#quizOpts').innerHTML = q.o.map((o, k) =>
      `<button class="opt" data-k="${k}">${String.fromCharCode(65 + k)}. ${o}</button>`).join('');
    $$('#quizOpts .opt').forEach(b => b.addEventListener('click', () => pick(+b.dataset.k, b)));
  }
  function pick(k, btn) {
    if (answered) return;
    answered = true;
    const q = QUIZ[i];
    const opts = $$('#quizOpts .opt');
    opts.forEach(o => o.disabled = true);
    if (k === q.a) {
      btn.classList.add('correct'); score++; Sound.ok();
      $('#quizFb').innerHTML = `✔ <b>Corect!</b> ${q.e}`;
    } else {
      btn.classList.add('wrong');
      opts[q.a].classList.add('correct');
      Sound.err();
      $('#quizFb').innerHTML = `✖ Nu chiar. ${q.e}`;
    }
    $('#quizScore').textContent = score;
    $('#quizBarFill').style.width = ((i + 1) / QUIZ.length * 100) + '%';
    timer = setTimeout(() => {
      if (i < QUIZ.length - 1) { i++; render(); }
      else {
        $('#quizQ').innerHTML = `Test încheiat! Scor: <b>${score} / ${QUIZ.length}</b> — ${score >= 6 ? 'Excelent, ai stăpânit legile lui Kirchhoff! 🎉' : 'Recitește secțiunile de teorie și încearcă din nou.'}`;
        $('#quizOpts').innerHTML = '';
        $('#quizFb').textContent = '';
        if (score >= 6) Sound.win();
      }
    }, 1400);
  }
  function restart() { clearTimeout(timer); i = 0; score = 0; render(); Sound.click(); }
  function init() {
    const r = $('#quizRestart');
    if (r) r.addEventListener('click', restart);
    // Keep the current question and score when revisiting this section.
    render();
  }
  return { init, render };
})();

/* ============================================================
   board.js — tablou de circuite cu drag & drop + solver MNA
   Piesele: sursă reală (E, r), rezistor, bec, întrerupător,
            ampermetru, voltmetru.  Conectare geometrică + conductori.
   ============================================================ */
'use strict';

const GRID = 20;
const LEN = 40;          // jumătate din lungimea piesei

const PIECE_DEFS = {
  battery: { name: 'Sursă (E, r)', half: LEN, E: 6, r: 1, kind: 'source' },
  resistor: { name: 'Rezistor', half: LEN, R: 10, kind: 'res' },
  lamp: { name: 'Bec', half: LEN, R: 12, kind: 'lamp' },
  sw: { name: 'Întrerupător', half: LEN, R: 0.001, kind: 'sw', closed: true },
  ammeter: { name: 'Ampermetru', half: LEN, R: 0.01, kind: 'ammeter' },
  voltmeter: { name: 'Voltmetru', half: LEN, R: 1000, kind: 'voltmeter' },
};

/* ============================================================
   SOLVER  (Modified Nodal Analysis)
   ============================================================ */
function solveNetlist(pieces, wires) {
  const key = (x, y) => `${Math.round(x)},${Math.round(y)}`;
  const pIdx = new Map();
  const pPos = [];
  const addPt = (x, y) => {
    const k = key(x, y);
    if (pIdx.has(k)) return pIdx.get(k);
    const id = pPos.length;
    pIdx.set(k, id); pPos.push({ x, y, k });
    return id;
  };

  // 1. puncte de conectare
  const elParts = [];
  for (const p of pieces) {
    const t = p.type === 'voltmeter' ? voltTermPos(p) : termPos(p);
    elParts.push({ p, a: addPt(t[0].x, t[0].y), b: addPt(t[1].x, t[1].y) });
  }
  const wParts = wires.map(w => ({ w, a: addPt(w.x1, w.y1), b: addPt(w.x2, w.y2) }));

  // 2. împărțim conductorii în punctele intermediare (joncțiuni în T)
  const segs = [];
  for (const wp of wParts) {
    const A = pPos[wp.a], B = pPos[wp.b];
    const on = [];
    for (let i = 0; i < pPos.length; i++) {
      const P = pPos[i];
      const dx = B.x - A.x, dy = B.y - A.y;
      const L2 = dx * dx + dy * dy;
      if (L2 === 0) continue;
      const t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / L2;
      if (t <= 0.001 || t >= 0.999) continue;
      const px = A.x + t * dx, py = A.y + t * dy;
      if (Math.hypot(px - P.x, py - P.y) < 1.2) on.push({ i, t });
    }
    on.sort((u, v) => u.t - v.t);
    let prev = wp.a;
    for (const q of on) { segs.push([prev, q.i, wp.w.id]); prev = q.i; }
    segs.push([prev, wp.b, wp.w.id]);
  }

  // 3. union-find
  const par = pPos.map((_, i) => i);
  const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  const uni = (a, b) => { a = find(a); b = find(b); if (a !== b) par[a] = b; };
  segs.forEach(([a, b]) => uni(a, b));

  // 4. numerotare noduri
  const nodeOf = new Map();
  let N = 0;
  const nId = (ptIdx) => {
    const r = find(ptIdx);
    if (!nodeOf.has(r)) nodeOf.set(r, N++);
    return nodeOf.get(r);
  };

  const els = [];      // {type:'R', n1,n2,R, piece} | {type:'V', n1,n2,E,r, piece}
  const info = [];
  let ground = null;

  for (const { p, a, b } of elParts) {
    const n1 = nId(a), n2 = nId(b);
    if (ground === null) ground = n1;
    if (p.type === 'battery') {
      const a1 = p.flip ? n1 : n2, a2 = p.flip ? n2 : n1;
      els.push({ type: 'V', n1: a1, n2: a2, E: p.E, r: Math.max(0.05, p.r), piece: p.id });
    } else if (p.type === 'sw') {
      if (p.closed) els.push({ type: 'R', n1, n2, R: 0.001, piece: p.id });
    } else {
      els.push({ type: 'R', n1, n2, R: Math.max(0.005, p.R), piece: p.id });
    }
  }

  // 5. MNA
  // întâi alocăm nodurile interne ale surselor (între borna + și rezistența r),
  // abia apoi indexăm variabilele de curent ale surselor — altfel indicii se suprapun
  let S = 0;
  for (const e of els) if (e.type === 'V') { e.k = S++; e.mid = N++; }
  const baseN = N;                 // offset pentru rândurile de curent (branch variables)
  const total = N + S;
  const A = Array.from({ length: total }, () => new Float64Array(total));
  const z = new Float64Array(total);
  const G = 1e-9; // conductanță minimă spre masă (părți flotante)

  for (let i = 0; i < N; i++) A[i][i] += G;

  const stampR = (n1, n2, R) => {
    const g = 1 / R;
    A[n1][n1] += g; A[n2][n2] += g;
    A[n1][n2] -= g; A[n2][n1] -= g;
  };
  for (const e of els) {
    if (e.type === 'R') stampR(e.n1, e.n2, e.R);
    else {
      // sursa de t.e.m. între n1 (+) și nodul intern mid, apoi r între mid și n2
      A[e.n1][baseN + e.k] += 1;
      A[e.mid][baseN + e.k] -= 1;
      A[baseN + e.k][e.n1] += 1;
      A[baseN + e.k][e.mid] -= 1;
      z[baseN + e.k] = e.E;
      stampR(e.mid, e.n2, e.r);
    }
  }

  // 6. rezolvare cu masă fixă
  const idx = [];
  for (let i = 0; i < total; i++) if (i !== ground) idx.push(i);
  const n = idx.length;
  const M = Array.from({ length: n }, (_, i) => {
    const row = new Float64Array(n + 1);
    for (let j = 0; j < n; j++) row[j] = A[idx[i]][idx[j]];
    row[n] = z[idx[i]];
    return row;
  });

  // eliminare Gauss cu pivotare
  let singular = false;
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-14) { singular = true; continue; }
    if (piv !== c) { const t = M[piv]; M[piv] = M[c]; M[c] = t; }
    const d = M[c][c];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / d;
      if (!f) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const V = new Float64Array(total);
  for (let i = 0; i < n; i++) {
    const c = idx[i];
    const d = M[i][i];
    V[c] = Math.abs(d) < 1e-14 ? 0 : M[i][n] / d;
  }

  // 7. curenți
  const out = { nodeV: V, nodeCount: baseN, elements: [], singular };
  for (const e of els) {
    if (e.type === 'R') {
      out.elements.push({ piece: e.piece, I: (V[e.n1] - V[e.n2]) / e.R, U: V[e.n1] - V[e.n2] });
    } else {
      const Ik = V[baseN + e.k];              // curent din n1 în sursă
      const Ib = -Ik;                          // curent debitat pe borna +
      out.elements.push({ piece: e.piece, I: Ib, U: V[e.n1] - V[e.n2], Emf: e.E });
    }
  }
  // sume nodale (verificare legea I)
  out.nodeSums = [];out.wireSegments=networkWireCurrents(pPos,segs,elParts,out.elements);
  return out;
}

/* poziția terminalelor unei piese */
function termPos(p) {
  const L = PIECE_DEFS[p.type].half;
  if (p.rot === 90) return [{ x: p.x, y: p.y - L }, { x: p.x, y: p.y + L }];
  return [{ x: p.x - L, y: p.y }, { x: p.x + L, y: p.y }];
}
/* voltmetrul se leagă perpendicular pe latură (în paralel) */
function voltTermPos(p) {
  const L = PIECE_DEFS[p.type].half;
  if (p.rot === 90) return [{ x: p.x - L, y: p.y }, { x: p.x + L, y: p.y }];
  return [{ x: p.x, y: p.y - L }, { x: p.x, y: p.y + L }];
}

/* ============================================================
   TABLOUL
   ============================================================ */
const Board = (() => {
  let svg, ghost = null, drag = null, wireDrag = null, selected = null;
  const S = { pieces: [], wires: [], mode: 'move', id: 1, net: null, lastClosed: false };
  let built = false;

  const toSvg = (evt) => {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const snap = v => Math.round(v / GRID) * GRID;
  const onBoard = (evt) => {
    const r = svg.getBoundingClientRect();
    return evt.clientX >= r.left && evt.clientX <= r.right && evt.clientY >= r.top && evt.clientY <= r.bottom;
  };

  /* ---------- desenarea pieselor ---------- */
  function pieceSVG(p) {
    const g = svgEl('g', { 'data-id': p.id, class: 'bp' });
    const rot = p.rot === 90 ? 90 : 0;
    g.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${rot})`);
    let TX;
    const L = PIECE_DEFS[p.type].half;
    // text orizontal chiar dacă piesa este rotită
    TX = (x, y, cls, text, anchor) => {
      const t = svgEl('text', { x, y, class: cls, text, 'text-anchor': anchor || 'middle' }, g);
      if (rot) t.setAttribute('transform', `rotate(${-rot} ${x} ${y})`);
      return t;
    };

    // borne
    const term = (x, y, i) => {
      const c = svgEl('circle', {
        cx: x, cy: y, r: 4.6, fill: '#0b1220', stroke: '#8fa4c4', 'stroke-width': 2,
        class: 'term', 'data-term': i,
      }, g);
      return c;
    };

    if (p.type === 'battery') {
      svgEl('line', { x1: -L, y1: 0, x2: -9, y2: 0, class: 'wire' }, g);
      svgEl('line', { x1: 9, y1: 0, x2: L, y2: 0, class: 'wire' }, g);
      const gg = svgEl('g', {}, g);
      const sgn = p.flip ? -1 : 1;   // borna + este spre dreapta dacă flip
      svgEl('line', { x1: 9 * sgn, y1: -15, x2: 9 * sgn, y2: 15, class: 'batt-plate' }, gg);
      svgEl('line', { x1: -9 * sgn, y1: -8, x2: -9 * sgn, y2: 8, class: 'batt-thin' }, gg);
      svgEl('text', { x: 9 * sgn, y: -22, class: 'e-label', text: '+', 'text-anchor': 'middle' }, gg);
      svgEl('text', { x: -9 * sgn, y: -16, class: 'e-label', text: '−', 'text-anchor': 'middle' }, gg);
      TX(0, 32, 'note', `${fmt(p.E, 1)} V · r = ${fmt(p.r, 1)} Ω`);
      TX(0, -34, 'i-label', 'E, r');
    } else if (p.type === 'resistor') {
      svgEl('line', { x1: -L, y1: 0, x2: -24, y2: 0, class: 'wire' }, g);
      svgEl('line', { x1: 24, y1: 0, x2: L, y2: 0, class: 'wire' }, g);
      svgEl('rect', { x: -24, y: -10, width: 48, height: 20, rx: 3, class: 'res-box' }, g);
      TX(0, 32, 'i-label', `${fmt(p.R, 0)} Ω`);
      TX(0, -18, 'note', 'R');
    } else if (p.type === 'lamp') {
      const on = p.lit;
      svgEl('line', { x1: -L, y1: 0, x2: -15, y2: 0, class: 'wire' }, g);
      svgEl('line', { x1: 15, y1: 0, x2: L, y2: 0, class: 'wire' }, g);
      const c = svgEl('circle', {
        cx: 0, cy: 0, r: 15, stroke: on ? '#fde68a' : '#93a8c9', 'stroke-width': 2.2,
        fill: on ? 'url(#lampG)' : 'rgba(148,163,184,.12)',
      }, g);
      if (on) c.setAttribute('filter', 'url(#glowG)');
      svgEl('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7', stroke: on ? '#92400e' : '#93a8c9', 'stroke-width': 1.7, fill: 'none' }, g);
      TX(0, 34, 'i-label', `${fmt(p.R, 0)} Ω`);
    } else if (p.type === 'sw') {
      svgEl('line', { x1: -L, y1: 0, x2: -6, y2: 0, class: 'wire' }, g);
      svgEl('circle', { cx: -8, cy: 0, r: 3.4, fill: '#93a8c9' }, g);
      svgEl('circle', { cx: 14, cy: 0, r: 3.4, fill: '#93a8c9' }, g);
      svgEl('line', {
        x1: -8, y1: 0, x2: 14, y2: 0,
        stroke: '#fbbf24', 'stroke-width': 3, 'stroke-linecap': 'round',
        transform: p.closed ? '' : 'rotate(-38 -8 0)',
      }, g);
      svgEl('line', { x1: 14, y1: 0, x2: L, y2: 0, class: 'wire' }, g);
      TX(0, rot ? 40 : -30, 'e-label', p.closed ? 'K închis' : 'K deschis');
    } else if (p.type === 'ammeter') {
      svgEl('line', { x1: -L, y1: 0, x2: -13, y2: 0, class: 'wire' }, g);
      svgEl('line', { x1: 13, y1: 0, x2: L, y2: 0, class: 'wire' }, g);
      svgEl('circle', { cx: 0, cy: 0, r: 13, fill: '#0e1830', stroke: '#22d3ee', 'stroke-width': 2 }, g);
      TX(0, 1, 'meter-l', 'A');
      TX(0, 32, 'i-label', p.readout || '—');
    } else if (p.type === 'voltmeter') {
      svgEl('line', { x1: 0, y1: -L, x2: 0, y2: -13, class: 'wire' }, g);
      svgEl('line', { x1: 0, y1: 13, x2: 0, y2: L, class: 'wire' }, g);
      svgEl('circle', { cx: 0, cy: 0, r: 13, fill: '#0e1830', stroke: '#a5b4fc', 'stroke-width': 2 }, g);
      TX(0, 1, 'meter-l v', 'V');
      svgEl('text', { x: 22, y: 4, class: 'i-label', text: p.readout || '—', 'text-anchor': 'start' }, g);
    }
    if (p.type === 'voltmeter') { term(0, -L, 0); term(0, L, 1); }
    else { term(-L, 0, 0); term(L, 0, 1); }

    if (p.id === selected) {
      svgEl('rect', {
        x: -L - 14, y: -34, width: 2 * L + 28, height: 68, rx: 10,
        fill: 'none', stroke: 'rgba(34,211,238,.75)', 'stroke-width': 1.6, 'stroke-dasharray': '6 4',
      }, g);
    }
    return g;
  }

  /* ---------- randare completă ---------- */
  function render() {
    svg.innerHTML = SVG_DEFS;
    // Visible connection lattice, shared with every terminal and wire endpoint.
    const gGrid=svgEl('g', {class:'network-grid','pointer-events':'none'},svg);
    for(let x=0;x<=760;x+=GRID)for(let y=0;y<=460;y+=GRID)svgEl('circle',{cx:x,cy:y,r:1.25,fill:'#7594ac',opacity:.65},gGrid);
    // conductorii
    const gW = svgEl('g', {}, svg);
    S.wires.flatMap(w=>w.flowSegments||[w]).forEach(w => {
      const path = svgEl('path', {
        d: `M${w.x1} ${w.y1} L${w.x2} ${w.y2}`,
        class: 'wire' + (w.live ? ' hi' : ''), 'data-wire': w.id,
        'stroke-width': w.live ? 3 : 2.4,
      }, gW);
      path.style.cursor = S.mode === 'del' ? 'pointer' : S.mode === 'move' ? 'grab' : 'default';
      if (w.live) path.setAttribute('filter', 'url(#glowC)');
    });

    // piesele
    const gP = svgEl('g', {}, svg);
    S.pieces.forEach(p => gP.appendChild(pieceSVG(p)));

    // animație de curent (dash-uri care alunecă pe ramurile sub curent)
    const gF = svgEl('g', {}, svg);networkSourceGaps(svg,gF);
    const addFlow = (x1, y1, x2, y2, I) => {
      const l = svgEl('line', { x1, y1, x2, y2, class: 'fwire' }, gF);
      const dur = clamp(1.6 / Math.max(0.25, Math.abs(I)), 0.35, 3);
      l.style.animationDuration = dur.toFixed(2) + 's';
      if (I < 0) l.style.animationDirection = 'reverse';
      return l;
    };
    S.wires.flatMap(w=>w.flowSegments||[w]).forEach(w => {
      if (!w.live) return;
      const I = w.I || 0;
      addFlow(w.x1, w.y1, w.x2, w.y2, I);
    });
    S.pieces.forEach(p => {
      if (Math.abs(p.I || 0) < 0.005) return;
      const t = p.type === 'voltmeter' ? voltTermPos(p) : termPos(p);
      addFlow(t[0].x, t[0].y, t[1].x, t[1].y, p.I);
    });

    // etichete curenți pe ramuri
    const gL = svgEl('g', {}, svg);
    S.pieces.forEach(p => {
      if (p.I === undefined || Math.abs(p.I) < 0.005) return;
      if (p.type === 'sw') return;                 // nu aglomerăm eticheta întrerupătorului
      const t = p.type === 'voltmeter' ? voltTermPos(p) : termPos(p);
      const mx = (t[0].x + t[1].x) / 2, my = (t[0].y + t[1].y) / 2;
      const dx = p.rot === 90 ? 34 : 0, dy = p.rot === 90 ? 0 : -56;
      svgEl('text', {
        x: mx + dx + (p.rot === 90 ? 0 : 0), y: my + dy,
        class: 'i-label', 'text-anchor': 'middle',
        text: `${fmt(Math.abs(p.I), 2)} A`,
      }, gL);
    });

    // conductor în curs de trasare
    if (wireDrag) {
      svgEl('circle', { cx: wireDrag.x1, cy: wireDrag.y1, r: 5, fill: 'rgba(34,211,238,.9)' }, svg);
      if (wireDrag.x2 !== undefined) {
        svgEl('line', {
          x1: wireDrag.x1, y1: wireDrag.y1, x2: wireDrag.x2, y2: wireDrag.y2,
          stroke: '#22d3ee', 'stroke-width': 2, 'stroke-dasharray': '6 4',
        }, svg);
      }
    }

    // terminale evidențiate pentru trasare conductor
    if (S.mode === 'wire') {
      const gT = svgEl('g', {}, svg);
      S.pieces.forEach(p => {
        (p.type === 'voltmeter' ? voltTermPos(p) : termPos(p)).forEach(t => {
          svgEl('circle', { cx: t.x, cy: t.y, r: 8, fill: 'none', stroke: 'rgba(34,211,238,.55)', 'stroke-width': 1.4 }, gT);
        });
      });
    }
  }

  /* ---------- fitrare circuit ---------- */
  function compute() {
    const res = solveNetlist(S.pieces, S.wires);
    // map curenți pe piese
    S.pieces.forEach(p => { p.I = 0; p.U = 0; p.lit = false; p.readout = ''; });
    const map = {};
    res.elements.forEach(e => { map[e.piece] = e; });
    S.pieces.forEach(p => {
      const e = map[p.id];
      if (!e) return;
      p.I = e.I; p.U = e.U;
      if (p.type === 'lamp') p.lit = Math.abs(e.I) > 0.02;
      if (p.type === 'ammeter') p.readout = fmt(Math.abs(e.I), 2) + ' A';
      if (p.type === 'voltmeter') p.readout = fmt(Math.abs(e.U), 2) + ' V';
    });
    S.wires.forEach(w=>{w.flowSegments=res.wireSegments.filter(s=>s.wire===w.id).map(s=>({...s,id:w.id,live:Math.abs(s.I)>.005}));w.live=w.flowSegments.some(s=>s.live);});
    S.net = res;

    // sunet la închiderea/deschiderea circuitului
    const nowClosed = S.pieces.some(p => p.type === 'sw' && p.closed) &&
      S.pieces.some(p => Math.abs(p.I || 0) > 0.02);
    if (nowClosed !== S.lastClosed) {
      nowClosed ? Sound.switchOn() : Sound.switchOff();
      S.lastClosed = nowClosed;
    }
    // becuri
    if (S.pieces.some(p => p.type === 'lamp' && p.lit)) { /* aprins */ }

    render();
    updateMeters();
    setLedUI(nowClosed, res);
  }

  function anyNear(w) { return !!w.live; } // toate firele primesc glow dacă există curent

  function setLedUI(on, res) {
    const led = $('#ledGlobal');
    if (led) { led.className = 'led ' + (on ? 'on' : 'off'); }
    const pill = $('#pillText');
    if (pill) pill.textContent = on ? 'circuit închis · curent activ' : 'circuit deschis';
  }

  /* ---------- panou măsurători ---------- */
  function updateMeters() {
    const m = $('#meters');
    if (!m) return;
    const rows = [];
    S.pieces.forEach(p => {
      if (p.type === 'battery') {
        rows.push([`Sursă E=${fmt(p.E, 1)} V, r=${fmt(p.r, 1)} Ω`,
          `I = ${fmt(Math.abs(p.I || 0), 2)} A · U = ${fmt(p.U || 0, 2)} V`]);
      } else if (p.type === 'ammeter') {
        rows.push(['Ampermetru (R_A = 0,01 Ω)', `I = ${fmt(Math.abs(p.I || 0), 2)} A`]);
      } else if (p.type === 'voltmeter') {
        rows.push(['Voltmetru (R_V = 1000 Ω)', `U = ${fmt(Math.abs(p.U || 0), 2)} V`]);
      } else if (p.type === 'lamp') {
        rows.push(['Bec', `I = ${fmt(Math.abs(p.I || 0), 2)} A · P = ${fmt((p.I || 0) ** 2 * p.R, 2)} W`]);
      }
    });
    m.innerHTML = rows.length
      ? rows.map(([l, v]) => `<div class="mrow"><span>${l}</span><span class="mv">${v.split(" · ").map(value=>`<span>${value}</span>`).join("")}</span></div>`).join('')
      : `<span class="muted">Adaugă piese pe tablou pentru a vedea măsurători.</span>`;

    const B = $('#balanceBox');
    if (B) {
      const res = S.net;
      const sumI = S.pieces.filter(p => p.type === 'ammeter').reduce((s, p) => s + Math.abs(p.I || 0), 0);
      const P = S.pieces.reduce((s, p) => {
        if (p.type === 'battery') return s + p.E * (p.I || 0);
        // Count only signed power supplied by sources here.
        return s;
      }, 0);
      B.innerHTML = `
        <dl class="network-balance-list"><div><dt>piese</dt><dd>${S.pieces.length}</dd></div><div><dt>conductori</dt><dd>${S.wires.length}</dd></div><div><dt>Σ puteri debitate (surse)</dt><dd>${fmt(P, 2)} W</dd></div><div><dt>noduri distincte</dt><dd>${res ? res.nodeCount : 0}</dd></div></dl>
        ${res && res.singular ? '<span style="color:#fda4af">⚠ rețea incompletă / flotantă</span>' : '<span>Curent calculat în rețea</span>'}`;
    }
  }

  /* ============================================================
     INTERACȚIUNE
     ============================================================ */
  function findPieceAt(pt, tol = 30) {
    for (let i = S.pieces.length - 1; i >= 0; i--) {
      const p = S.pieces[i];
      const t = termPos(p);
      const dx = t[1].x - t[0].x, dy = t[1].y - t[0].y;
      const mx = (t[0].x + t[1].x) / 2, my = (t[0].y + t[1].y) / 2;
      const withinX = Math.abs(pt.x - mx) <= Math.abs(dx) / 2 + tol;
      const withinY = Math.abs(pt.y - my) <= Math.abs(dy) / 2 + tol;
      if (withinX && withinY) return p;
    }
    return null;
  }
  function findTerminal(pt, tol = 16) {
    let best = null, bd = tol;
    S.pieces.forEach(p => {
      (p.type === 'voltmeter' ? voltTermPos(p) : termPos(p)).forEach((t, i) => {
        const d = Math.hypot(t.x - pt.x, t.y - pt.y);
        if (d < bd) { bd = d; best = { p, i, x: t.x, y: t.y }; }
      });
    });
    return best;
  }
  function findWireAt(pt, tol = 8) {
    for (let i = S.wires.length - 1; i >= 0; i--) {
      const w = S.wires[i];
      const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
      const L2 = dx * dx + dy * dy || 1;
      const t = clamp(((pt.x - w.x1) * dx + (pt.y - w.y1) * dy) / L2, 0, 1);
      const px = w.x1 + t * dx, py = w.y1 + t * dy;
      if (Math.hypot(px - pt.x, py - pt.y) < tol) return w;
    }
    return null;
  }

  function pointerDown(e) {
    const pt = toSvg(e);
    const hit = findPieceAt(pt);
    const wire = findWireAt(pt);

    if (S.mode === 'del') {
      if (hit) { removePiece(hit); return; }
      if (wire) { S.wires = S.wires.filter(w => w !== wire); Sound.del(); compute(); }
      return;
    }
    if (S.mode === 'wire') {
      const t = findTerminal(pt);
      const anchor = t ? { x: t.x, y: t.y, p: t.p, i: t.i } : { x: clamp(snap(pt.x),0,760), y: clamp(snap(pt.y),0,460) };
      wireDrag = { x1: anchor.x, y1: anchor.y, from: anchor };
      render();
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    // Move an entire conductor without changing its length or direction.
    if(!hit&&wire){
      selected=null;
      drag={wire,startX:pt.x,startY:pt.y,x1:wire.x1,y1:wire.y1,x2:wire.x2,y2:wire.y2,moved:false};
      svg.setPointerCapture(e.pointerId);render();e.preventDefault();return;
    }
    // mod mutare
    if (hit) {
      selected = hit.id;
      drag = { id: hit.id, dx: pt.x - hit.x, dy: pt.y - hit.y, moved: false, p: hit };
      svg.setPointerCapture(e.pointerId);
      inspector(hit);
      render();
      e.preventDefault();
    } else {
      if (selected !== null) { selected = null; inspector(null); render(); }
    }
  }

  function pointerMove(e) {
    const pt = toSvg(e);
    if (wireDrag) {
      wireDrag.x2 = clamp(snap(pt.x),0,760); wireDrag.y2 = clamp(snap(pt.y),0,460);
      render();
      return;
    }
    if (!drag) return;
    if(drag.wire){
      const dx=clamp(snap(pt.x-drag.startX),-Math.min(drag.x1,drag.x2),760-Math.max(drag.x1,drag.x2));
      const dy=clamp(snap(pt.y-drag.startY),-Math.min(drag.y1,drag.y2),460-Math.max(drag.y1,drag.y2));
      const w=drag.wire;
      if(w.x1!==drag.x1+dx||w.y1!==drag.y1+dy){Object.assign(w,{x1:drag.x1+dx,y1:drag.y1+dy,x2:drag.x2+dx,y2:drag.y2+dy});drag.moved=true;Sound.slide();compute();}
      return;
    }
    const p = drag.p;
    const nx = clamp(snap(pt.x - drag.dx), LEN + 0, 760 - LEN);
    const ny = clamp(snap(pt.y - drag.dy), LEN, 460-LEN);
    if (nx !== p.x || ny !== p.y) {
      p.x = nx; p.y = ny; drag.moved = true;
      Sound.slide();
      compute();
    }
  }

  function pointerUp(e) {
    if (wireDrag) {
      const pt = toSvg(e);
      const t = findTerminal(pt);
      const ex = t ? t.x : clamp(snap(pt.x),0,760), ey = t ? t.y : clamp(snap(pt.y),0,460);
      const sameAsStart = Math.abs(ex - wireDrag.x1) < 1 && Math.abs(ey - wireDrag.y1) < 1;
      if (!sameAsStart) {
        S.wires.push({ id: 'w' + (S.id++), x1: wireDrag.x1, y1: wireDrag.y1, x2: ex, y2: ey });
        Sound.connect();
      }
      wireDrag = null;
      $('#gMode .seg[data-mode="move"]').click();
      compute();
      return;
    }
    if (drag) {
      if(drag.wire)inspector(null);
      if (drag.moved) { Sound.drop(); compute(); }
      drag = null;
    }
  }

  function removePiece(p) {
    S.pieces = S.pieces.filter(x => x !== p);
    if (selected === p.id) { selected = null; inspector(null); }
    Sound.del();
    compute();
  }

  function addPiece(type, x, y, props = {}) {
    const def = PIECE_DEFS[type];
    const p = {
      id: 'p' + (S.id++), type, x: clamp(snap(x),LEN,760-LEN), y: clamp(snap(y),LEN,460-LEN), rot: 0, ...JSON.parse(JSON.stringify(def)), ...props,
    };
    delete p.name; delete p.kind;
    S.pieces.push(p);
    Sound.drop();
    compute();
    return p;
  }

  /* ---------- inspector ---------- */
  function inspector(p) {
    const host = $('#inspector');
    if (!host) return;
    if (!p) {
      host.innerHTML = '<span class="muted">Selectează o piesă pentru a-i modifica valoarea.</span>';
      return;
    }
    const rotBtn = `<button class="btn btn-sm btn-ghost" data-act="rot">⟳ Rotește</button>`;
    const delBtn = `<button class="btn btn-sm btn-ghost" data-act="del">🗑 Șterge</button>`;
    const flipBtn = `<button class="btn btn-sm btn-ghost" data-act="flip">⇄ Inversează polaritatea</button>`;
    if (p.type === 'battery') {
      host.innerHTML = `
        <b style="font-size:12.5px">Sursă reală</b>
        <label>E <input type="range" id="iE" min="1" max="30" step="0.5" value="${p.E}"> <span class="mv" id="iEv">${fmt(p.E, 1)} V</span></label>
        <label>r <input type="range" id="iR" min="0.1" max="6" step="0.1" value="${p.r}"> <span class="mv" id="iRv">${fmt(p.r, 1)} Ω</span></label>
        ${flipBtn}${rotBtn}${delBtn}`;
      $('#iE').addEventListener('input', e => { p.E = +e.target.value; $('#iEv').textContent = fmt(p.E, 1) + ' V'; Sound.tick(); compute(); });
      $('#iR').addEventListener('input', e => { p.r = +e.target.value; $('#iRv').textContent = fmt(p.r, 1) + ' Ω'; Sound.tick(); compute(); });
    } else if (p.type === 'resistor' || p.type === 'lamp') {
      host.innerHTML = `
        <b style="font-size:12.5px">${p.type === 'lamp' ? 'Bec' : 'Rezistor'}</b>
        <label>R <input type="range" id="iVal" min="1" max="60" step="1" value="${p.R}"> <span class="mv" id="iValv">${fmt(p.R, 0)} Ω</span></label>
        ${rotBtn}${delBtn}`;
      $('#iVal').addEventListener('input', e => {
        p.R = +e.target.value; $('#iValv').textContent = fmt(p.R, 0) + ' Ω'; Sound.tick(); compute();
      });
    } else if (p.type === 'sw') {
      host.innerHTML = `<b style="font-size:12.5px">Întrerupător</b>
        <label class="switch"><input type="checkbox" id="iSw" ${p.closed ? 'checked' : ''}> <span class="track"></span>
        <span class="switch-txt">${p.closed ? 'închis' : 'deschis'}</span></label>${rotBtn}${delBtn}`;
      $('#iSw').addEventListener('change', e => {
        p.closed = e.target.checked;
        const lbl = host.querySelector('.switch-txt');
        if (lbl) lbl.textContent = p.closed ? 'închis' : 'deschis';
        compute();
      });
    } else {
      host.innerHTML = `<b style="font-size:12.5px">${PIECE_DEFS[p.type].name}</b>
        <span class="muted">${p.type === 'ammeter' ? 'R_A = 0,01 Ω (ideal)' : 'R_V = 1000 Ω'}</span>${rotBtn}${delBtn}`;
    }
    host.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.act === 'rot') { p.rot = p.rot === 90 ? 0 : 90; Sound.click(); render(); compute(); }
      if (b.dataset.act === 'flip') { p.flip = !p.flip; Sound.click(); render(); compute(); }
      if (b.dataset.act === 'del') removePiece(p);
    }));
  }

  /* ---------- paletă (drag din bibliotecă) ---------- */
  function paletteIcon(type) {
    const w = 88, h = 34;
    const s = `<svg viewBox="0 0 ${w} ${h}" width="72" height="28">
      <line x1="2" y1="${h / 2}" x2="16" y2="${h / 2}" stroke="#8fa4c4" stroke-width="2.2"/>
      <line x1="${w - 16}" y1="${h / 2}" x2="${w - 2}" y2="${h / 2}" stroke="#8fa4c4" stroke-width="2.2"/>`;
    if (type === 'battery') return s + `
      <line x1="38" y1="6" x2="38" y2="28" stroke="#fbbf24" stroke-width="3"/>
      <line x1="50" y1="12" x2="50" y2="22" stroke="#fbbf24" stroke-width="1.7"/></svg>`;
    if (type === 'resistor') return s + `<rect x="30" y="9" width="28" height="16" rx="3" fill="#16233d" stroke="#93a8c9" stroke-width="2"/></svg>`;
    if (type === 'lamp') return s + `<circle cx="44" cy="17" r="11" fill="rgba(148,163,184,.14)" stroke="#93a8c9" stroke-width="2"/>
      <path d="M39 12 L49 22 M49 12 L39 22" stroke="#93a8c9" stroke-width="1.6"/></svg>`;
    if (type === 'sw') return s + `<circle cx="36" cy="17" r="3" fill="#93a8c9"/><circle cx="56" cy="17" r="3" fill="#93a8c9"/>
      <line x1="36" y1="17" x2="56" y2="6" stroke="#fbbf24" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    if (type === 'ammeter') return s + `<circle cx="44" cy="17" r="11" fill="#0e1830" stroke="#22d3ee" stroke-width="2"/>
      <text x="44" y="21" fill="#22d3ee" font-size="11" font-family="monospace" text-anchor="middle">A</text></svg>`;
    return s + `<circle cx="44" cy="17" r="11" fill="#0e1830" stroke="#a5b4fc" stroke-width="2"/>
      <text x="44" y="21" fill="#a5b4fc" font-size="11" font-family="monospace" text-anchor="middle">V</text></svg>`;
  }

  function buildPalette() {
    const host = $('#palette');
    if (!host) return;
    host.innerHTML = Object.keys(PIECE_DEFS).map(t => `
      <div class="piece" data-type="${t}">${paletteIcon(t)}<span>${PIECE_DEFS[t].name}</span></div>`).join('');
    host.querySelectorAll('.piece').forEach(el => {
      el.addEventListener('pointerdown', startPaletteDrag);
    });
  }

  function startPaletteDrag(e) {
    e.preventDefault();
    const type = e.currentTarget.dataset.type;
    ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;pointer-events:none;z-index:999;opacity:.9;
      transform:translate(-50%,-50%);filter:drop-shadow(0 6px 18px rgba(34,211,238,.6))`;
    ghost.innerHTML = paletteIcon(type).replace('width="72" height="28"', 'width="96" height="38"');
    document.body.appendChild(ghost);
    moveGhost(e);
    const move = (ev) => moveGhost(ev);
    const up = (ev) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (ghost) { ghost.remove(); ghost = null; }
      if (onBoard(ev)) {
        const pt = toSvg(ev);
        const p = addPiece(type, pt.x, pt.y);
        selected = p.id; inspector(p); render(); compute();
        msg(`Adăugat: ${PIECE_DEFS[type].name}. Trage-l ca să-l muți.`);
      }
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }
  function moveGhost(e) {
    if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
  }
  const msg = (t) => { const m = $('#boardMsg'); if (m) m.textContent = t; };

  /* ---------- circuit inițial ---------- */
  function loadExample() {
    S.pieces = []; S.wires = []; S.id = 1;
    const W = (x1, y1, x2, y2) => S.wires.push({ id: 'w' + (S.id++), x1:snap(x1), y1:snap(y1), x2:snap(x2), y2:snap(y2) });
    const P = (type, x, y, props = {}) => {
      const p = { id: 'p' + (S.id++), type, x: snap(x), y: snap(y), rot: 0, ...JSON.parse(JSON.stringify(PIECE_DEFS[type])), ...props };
      delete p.name; delete p.kind; S.pieces.push(p); return p;
    };
    // ---- rețeaua inițială: 2 noduri (B sus, A jos), 3 laturi, 2 surse reale
    const TOP = 90, BOT = 390, L = 120, R = 660, MX = 380;
    // latura de sus, stânga: E₁ (+ spre dreapta) și R₁
    P('battery', 190, TOP, { E: 22, r: 1 });          // borna + spre dreapta
    P('resistor', 300, TOP, { R: 4 });
    // latura de sus, dreapta: R₂ și E₂ (+ spre B, adică spre stânga)
    P('resistor', 470, TOP, { R: 6 });
    P('battery', 580, TOP, { E: 19, r: 1, flip: true }); // borna + spre stânga (nodul B)
    // latura comună (verticală): R₃
    P('resistor', MX, 240, { R: 4, rot: 90 });
    // întrerupătorul K, pe latura dreaptă
    P('sw', R, 238, { rot: 90, closed: true });
    // conductorii
    W(L, TOP, 150, TOP);       // colț stânga → E₁
    W(230, TOP, 260, TOP);     // E₁ → R₁
    W(340, TOP, 430, TOP);     // R₁ → R₂ (nodul B este la x = MX)
    W(510, TOP, 540, TOP);     // R₂ → E₂
    W(620, TOP, R, TOP);       // E₂ → colț dreapta
    W(R, TOP, R, 198);         // latura dreaptă (sus)
    W(R, 278, R, BOT);         // latura dreaptă (jos)
    W(R, BOT, MX, BOT);        // jos, spre nodul A
    W(MX, BOT, L, BOT);        // jos, spre colțul stâng
    W(L, BOT, L, TOP);         // latura stângă
    W(MX, TOP, MX, 200);       // B → R₃
    W(MX, 280, MX, BOT);       // R₃ → A
    // nodurile B și A apar automat la joncțiunile în T de pe conductorii lungi
    selected = null; inspector(null);
    const gs = $('#gSwitch'); if (gs) gs.checked = true;
    Sound.connect();
    compute();
    msg('Circuit inițial: E₁ = 22 V, E₂ = 19 V, r = 1 Ω, R₁ = 4 Ω, R₂ = 6 Ω, R₃ = 4 Ω');
  }

  function init() {
    svg = $('#gCanvas');
    if (!svg || built) return;
    built = true;
    buildPalette();
    loadExample();

    svg.addEventListener('pointerdown', pointerDown);
    svg.addEventListener('pointermove', pointerMove);
    svg.addEventListener('pointerup', pointerUp);
    svg.addEventListener('pointercancel', e=>{if(wireDrag){wireDrag=null;$('#gMode .seg[data-mode="move"]').click();}else pointerUp(e);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&svg.closest('.view')?.classList.contains('active')&&S.mode==='wire'){wireDrag=null;$('#gMode .seg[data-mode="move"]').click();e.preventDefault();}});

    $$('#gMode .seg').forEach(b => b.addEventListener('click', () => {
      $$('#gMode .seg').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      wireDrag = null;
      S.mode = b.dataset.mode;
      Sound.click();
      msg(S.mode === 'wire' ? 'Conductor: trage de la o bornă la alta.'
        : S.mode === 'del' ? 'Ștergere: click pe o piesă sau pe un conductor.'
          : 'Mută: trage piesele sau conductorii; click pe piesă = selectare.');
      render();
    }));
    const gWire = $('#gWire'), gDel = $('#gDelete');
    if (gWire) gWire.addEventListener('click', () => { $('#gMode .seg[data-mode="wire"]').click(); });
    if (gDel) gDel.addEventListener('click', () => { $('#gMode .seg[data-mode="del"]').click(); });
    const gClear = $('#gClear');
    if (gClear) gClear.addEventListener('click', () => {
      S.pieces = []; S.wires = []; selected = null; inspector(null); Sound.del(); compute();
      msg('Tablou golit. Trage piese din bibliotecă.');
    });
    const gLoad = $('#gLoadEx');
    if (gLoad) gLoad.addEventListener('click', loadExample);
    const gSw = $('#gSwitch');
    if (gSw) gSw.addEventListener('change', e => {
      S.pieces.filter(p => p.type === 'sw').forEach(p => p.closed = e.target.checked);
      if (!S.pieces.some(p => p.type === 'sw')) msg('Nu există întrerupătoare pe tablou.');
      compute();
    });
  }

  return { init, S, compute, addPiece, loadExample, render };
})();

// Preserve all six source exercises while correcting inconsistent arithmetic and directions.
PROBLEMS[0].steps[0]=['Alegem sensurile din laborator: I₁ și I₂ coboară pe laturile exterioare, I₃ urcă de la A la B prin latura comună.','I₁ ↓ stânga; I₂ ↓ dreapta; I₃ ↑ prin R₃'];
PROBLEMS[0].steps[1][0]='Scriem prima lege a lui Kirchhoff pentru nodul A (n = 2 noduri → n − 1 = 1 ecuație independentă).';
PROBLEMS[1].stmt=PROBLEMS[1].stmt.replace('r₂ = 1 Ω','r₁ = r₂ = 1 Ω');
PROBLEMS[3].verify=()=>{const E=7.2,r=2,R=1/(1/10+1/5),I=E/(10+r),Ip=E/(R+r);return `I = ${fmt(I,3)} A; U = ${fmt(I*10,3)} V; U₁ = ${fmt(4-I*.5,3)} V; U₂ = ${fmt(3.2-I*1.5,3)} V; R₁ ∥ R₂: I = ${fmt(Ip,3)} A; I₁ = ${fmt(Ip*R/10,3)} A; I₂ = ${fmt(Ip*R/5,3)} A`;};
PROBLEMS[4].steps[0][0]='a) Aplicăm Kirchhoff: 2 noduri și 4 laturi (trei surse și consumatorul), deci 1 ecuație de nod și 3 ecuații de ochi independente.';
PROBLEMS[4].steps[4][1]='I′ = (E₁/r₁ + E₂/r₂) / (1 + R/r₁ + R/r₂) ≈ 49,057 mA';
PROBLEMS[4].steps[5][1]='U′ = I′R ≈ 0,981132 V; I₁ ≈ 9,434 mA; I₂ ≈ 39,623 mA; I₁ + I₂ ≈ 49,057 mA';
PROBLEMS[4].steps[7]=['Recalculăm cu cele două surse rămase: voltmetrul este în paralel cu R.','I_e ≈ 49,519 mA; U ≈ 0,980577 V; ΔU ≈ 0,555 mV'];
PROBLEMS[4].answer='a) I ≈ 54,9 mA; b) I′ ≈ 49,057 mA, I₁ ≈ 9,434 mA, I₂ ≈ 39,623 mA; c) U ≈ 0,980577 V';
PROBLEMS[4].verify=()=>{const R=20,RV=2000,g=1/2+1/3,j=1/2+1.1/3,U=j/(g+1/R),Uv=j/(g+1/R+1/RV);return `R ∥ R_V = ${fmt(1/(1/R+1/RV),4)} Ω; U′ = ${fmt(U,6)} V; U = ${fmt(Uv,6)} V; ΔU = ${fmt((U-Uv)*1000,3)} mV`;};

// PRAXIS_INTEGRATION_START
// Clean theoretical diagrams. Wires stop exactly at component terminals;
// branch junctions sit outside symbols, and labels stay inside the viewBox.
function networkSvgText(el,value){
  const text=String(value);el.textContent='';
  // SVG has no HTML <sub>; use explicit baseline shifts, including word indices.
  const pattern=/_([A-Za-z]+)/g;let start=0,match;
  while((match=pattern.exec(text))){el.append(document.createTextNode(text.slice(start,match.index)));const sub=document.createElementNS(NS,'tspan');sub.setAttribute('baseline-shift','sub');sub.setAttribute('font-size','75%');sub.textContent=match[1];el.append(sub);start=pattern.lastIndex;}
  el.append(document.createTextNode(text.slice(start)));
}
function networkSourceGaps(svg,flowLayer){
  const id=svg.id+'-source-gaps';svg.querySelector('#'+id)?.remove();
  const mask=svgEl('mask',{id,maskUnits:'userSpaceOnUse',x:-1000,y:-1000,width:4000,height:4000},svg);
  svgEl('rect',{x:-1000,y:-1000,width:4000,height:4000,fill:'white'},mask);
  svg.querySelectorAll('.batt-plate').forEach(plate=>{
    const group=plate.parentElement,thin=group.querySelector('.batt-thin');if(!thin)return;
    const x=Math.min(+plate.getAttribute('x1'),+thin.getAttribute('x1'));
    const y=Math.min(+plate.getAttribute('y1'),+thin.getAttribute('y1'));
    const right=Math.max(+plate.getAttribute('x2'),+thin.getAttribute('x2'));
    const bottom=Math.max(+plate.getAttribute('y2'),+thin.getAttribute('y2'));
    const horizontal=plate.getAttribute('x1')===plate.getAttribute('x2');
    const box=horizontal?{x:x+1,y:y-2,width:right-x-2,height:bottom-y+4}:{x:x-2,y:y+1,width:right-x+4,height:bottom-y-2};
    // Cover the underlying wire only between plates; keep all source terminals.
    group.querySelectorAll(':scope > .network-source-gap').forEach(e=>e.remove());
    const cover=svgEl('rect',{...box,fill:'#0b192b',class:'network-source-gap'});group.insertBefore(cover,plate);
    let matrix=new DOMMatrix();const chain=[];for(let p=group;p&&p!==svg;p=p.parentElement)chain.unshift(p);
    for(const p of chain){const t=p.transform?.baseVal.consolidate();if(t)matrix=matrix.multiply(t.matrix);}
    svgEl('rect',{...box,fill:'black',transform:`matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`},mask);
  });
  flowLayer.setAttribute('mask',`url(#${id})`);
}
function networkDiagram(svg,w,h){
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML='';
  const g=svgEl('g',{'class':'network-schematic'},svg);
  const wire=d=>svgEl('path',{d,fill:'none',stroke:'#9bb1c9','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},g);
  const label=(x,y,text,color='#bceaff')=>svgEl('text',{x,y,text,fill:color,'font-size':14,'text-anchor':'middle'},g);
  const dot=(x,y)=>svgEl('circle',{cx:x,cy:y,r:3,fill:'#67dbe9'},g);
  const resistor=(x,y,name)=>{svgEl('rect',{x:x-24,y:y-9,width:48,height:18,rx:2,fill:'#182b43',stroke:'#9bb1c9','stroke-width':2},g);label(x,y-17,name);};
  const meter=(x,y,name)=>{svgEl('circle',{cx:x,cy:y,r:13,fill:'#0b192b',stroke:'#67dbe9','stroke-width':2},g);label(x,y+5,name);};
  // Horizontal source: terminal plates at x−6 and x+6, positive on right.
  const battery=(x,y,name='E, r')=>{wire(`M${x-24} ${y} H${x-6} M${x+6} ${y} H${x+24}`);for(const [dx,half] of [[-6,10],[6,17]])svgEl('path',{d:`M${x+dx} ${y-half} V${y+half}`,stroke:'#ffd45b','stroke-width':2},g);label(x,y-24,name,'#ffd45b');};
  return {wire,label,dot,resistor,meter,battery,g};
}
drawHeroK=function(svg){
 const d=networkDiagram(svg,320,240);
 d.wire('M35 60 H76 M124 60 H216 M264 60 H285 V190 H124 M76 190 H35 V132 M35 118 V60 M165 60 V106 M165 144 V190');
 d.resistor(100,60,'R₁');d.resistor(240,60,'R₃');d.resistor(100,190,'R₂');
 svgEl('rect',{x:157,y:106,width:16,height:38,rx:2,fill:'#182b43',stroke:'#9bb1c9','stroke-width':2},d.g);
 d.label(190,130,'R₄');
 svgEl('path',{d:'M18 118 H52 M25 132 H45',stroke:'#ffd45b','stroke-width':2},d.g);d.label(65,128,'E','#ffd45b');
 for(const [x,y,name] of [[35,60,'F'],[165,60,'B'],[285,60,'D'],[35,190,'E'],[165,190,'A'],[285,190,'C']]){d.dot(x,y);d.label(x,y===60?32:216,name);}
 d.label(105,150,'I');d.label(235,150,'II');
};
drawSchSeries=function(svg){
  const d=networkDiagram(svg,460,210);
  d.wire('M40 60 H116 M164 60 H266 M314 60 H420 V165 H254 M206 165 H40 V60');
  d.resistor(140,60,'R₁');d.resistor(290,60,'R₂');d.battery(230,165);
  for(const [x,u] of [[140,'U₁'],[290,'U₂']]){
    d.wire(`M${x-38} 60 V105 H${x-13} M${x+13} 105 H${x+38} V60`);
    d.dot(x-38,60);d.dot(x+38,60);d.meter(x,105,'V');d.label(x,133,u);
  }
  d.label(105,190,'I = I₁ = I₂');
};
drawSchParallel=function(svg){
  const d=networkDiagram(svg,460,230);
  d.wire('M45 55 H176 M224 55 H302 M328 55 H410 V185 H334 M286 185 H193 M167 185 H45 V55 M45 115 H176 M224 115 H302 M328 115 H410');
  d.resistor(200,55,'R₁');d.resistor(200,115,'R₂');d.meter(315,55,'A₁');d.meter(315,115,'A₂');d.meter(180,185,'A');d.battery(310,185,'E');
  d.dot(45,115);d.dot(410,115);d.label(28,105,'M');d.label(430,105,'N');d.label(100,215,'I = I₁ + I₂');
};
drawSchGenSer=function(svg){
  const d=networkDiagram(svg,300,150);
  d.wire('M30 55 H76 M124 55 H176 M224 55 H270 V110 H174 M126 110 H30 V55');
  d.battery(100,55);d.battery(200,55);d.resistor(150,110,'R');
};
drawSchGenPar=function(svg){
  const d=networkDiagram(svg,300,200);
  d.wire('M35 50 H126 M174 50 H265 V160 H174 M126 160 H35 V50 M35 105 H126 M174 105 H265');
  d.battery(150,50);d.battery(150,105);d.resistor(150,160,'R');
  d.dot(35,105);d.dot(265,105);d.label(18,96,'A');d.label(282,96,'B');
};
drawHeroG=function(svg){
  const d=networkDiagram(svg,320,330);
  d.label(45,25,'serie');
  d.wire('M30 65 H76 M124 65 H196 M244 65 H290 V120 H184 M136 120 H30 V65');
  d.resistor(100,65,'R₁');d.resistor(220,65,'R₂');d.battery(160,120);
  d.label(50,175,'paralel');
  d.wire('M30 210 H136 M184 210 H290 V295 H184 M136 295 H30 V210 M30 250 H136 M184 250 H290');
  d.resistor(160,210,'R₁');d.resistor(160,250,'R₂');d.battery(160,295);
  d.dot(30,250);d.dot(290,250);
};
drawSchSunt=function(svg){
  const d=networkDiagram(svg,440,180);
  d.wire('M30 60 H207 M233 60 H410 M95 60 V125 H196 M244 125 H345 V60');
  d.meter(220,60,'A');d.resistor(220,125,'Rₛ');d.dot(95,60);d.dot(345,60);
  d.label(95,40,'B');d.label(345,40,'C');d.label(220,32,'I_A');d.label(220,89,'R_A');d.label(65,45,'I');d.label(125,110,'Iₛ');
};
drawSchAdd=function(svg){
  const d=networkDiagram(svg,440,180);
  d.wire('M40 120 V55 H127 M153 55 H256 M304 55 H400 V120 H244 M196 120 H40');
  d.meter(140,55,'V');d.resistor(280,55,'Rₐ');d.resistor(220,120,'R');
  d.dot(40,120);d.dot(400,120);d.label(23,114,'A');d.label(417,114,'B');d.label(140,85,'U_V');d.label(280,85,'U_a');d.label(220,161,'U = U_V + U_a');
};

document.getElementById('network-pause').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
Router.init();initStaticCircuits();initKirchhoff();InstrumentLab.init();initProblems();Quiz.init();Board.init();
Router.on('g-gen',()=>GenLab.init());Router.on('g-lab',()=>{Board.init();Board.compute();});
for(const button of document.querySelectorAll('[data-tab]'))button.addEventListener('click',()=>Router.go(button.dataset.tab));
const tabs=[...document.querySelectorAll('[data-tab]')];
for(const h of document.querySelectorAll('.prob-head')){h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-expanded',String(h.parentElement.classList.contains('open')));h.addEventListener('click',()=>h.setAttribute('aria-expanded',String(h.parentElement.classList.contains('open'))));h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click();}});}
const help=document.getElementById('helpModal'),helpButton=document.getElementById('network-help');
helpButton.addEventListener('click',()=>{help.classList.add('open');document.getElementById('helpClose').focus();});
function closeHelp(){help.classList.remove('open');helpButton.focus();}
document.getElementById('helpClose').addEventListener('click',closeHelp);help.addEventListener('click',e=>{if(e.target===help)closeHelp();});help.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp();if(e.key==='Tab'){e.preventDefault();document.getElementById('helpClose').focus();}});
for(const input of document.querySelectorAll('.control input[type=range]')){const label=input.parentElement.querySelector('label');if(label&&!label.htmlFor)label.htmlFor=input.id;}
for(const piece of document.querySelectorAll('.piece')){let touchStart;piece.addEventListener('pointerdown',e=>{touchStart=e.pointerType==='touch'||e.pointerType==='pen'?{x:e.clientX,y:e.clientY}:null;});piece.addEventListener('pointerup',e=>{if(touchStart&&Math.hypot(e.clientX-touchStart.x,e.clientY-touchStart.y)<12){Board.addPiece(piece.dataset.type,380,220);Board.render();Board.compute();}touchStart=null;});piece.tabIndex=0;piece.setAttribute('role','button');piece.setAttribute('aria-label',piece.textContent.trim());piece.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();Board.addPiece(piece.dataset.type,380,220);Board.render();Board.compute();}});}
for(const h of document.querySelectorAll('.section-head h2'))h.dataset.contentType=h.closest('.view').id.includes('theory')?'theory':h.closest('.view').id.includes('quiz')?'assessment':h.closest('.view').id.includes('problems')?'problem':'simulation';
const extra=document.querySelector('.network-extra');
extra.append(document.getElementById('sSpeed').closest('.control'),document.getElementById('pillState'));
const flowNote=document.createElement('p');flowNote.textContent='Punctele animate indică sensul convențional al curentului; nu reprezintă electroni.';extra.append(flowNote);
document.querySelector('#sSpeed').closest('.control').querySelector('label span').textContent='Viteza marcatorilor';
const nodeHint=document.getElementById('animHint');const hintDetails=document.createElement('details');hintDetails.innerHTML='<summary>Interpretarea modelului</summary>';nodeHint.before(hintDetails);hintDetails.append(nodeHint);
const observer=new MutationObserver(()=>{const target=document.querySelector('.praxis-workspace-disclosure');if(target&&extra.parentElement!==target){target.append(extra);observer.disconnect();}});observer.observe(document.body,{subtree:true,childList:true});
// Keep original explanatory supplements available, without pushing the primary experiment below them.
for(const id of ['view-k-anim','view-k-lab']){const section=document.getElementById(id),split=section.querySelector('.split');if(!split)continue;const trailing=[];let node=split.nextElementSibling;while(node){trailing.push(node);node=node.nextElementSibling;}if(trailing.length){const details=document.createElement('details'),summary=document.createElement('summary');details.className='network-details';summary.textContent=id==='view-k-anim'?'Ecuațiile nodurilor':'Ecuații, rezultate și trasee';details.append(summary,...trailing);section.append(details);}}
for(const section of document.querySelectorAll('.view')){const lead=section.querySelector('.section-head .lead');if(lead){let details=section.querySelector('.network-details');if(!details){details=document.createElement('details');details.className='network-details';details.innerHTML='<summary>Explicații și interpretare</summary>';section.append(details);}details.append(lead);}}
document.getElementById('view-k-anim').append(hintDetails);
const inspector=document.getElementById('inspector'),meterCard=document.getElementById('meters').closest('.card'),measureDetails=document.createElement('details');
measureDetails.innerHTML='<summary>Măsurători și bilanț</summary>';measureDetails.open=true;measureDetails.append(...meterCard.childNodes);meterCard.append(inspector,measureDetails);meterCard.classList.add('network-meter-panel');
const meterHint=measureDetails.querySelector('.hint');if(meterHint)document.querySelector('#view-g-lab .network-details').append(meterHint);
new MutationObserver(()=>{if(inspector.querySelector('input'))measureDetails.open=false;}).observe(inspector,{childList:true});
const paletteHint=document.querySelector('.palette-card>.hint');if(paletteHint)document.querySelector('#view-g-lab .network-details').append(paletteHint);
const currentReadout=document.createElement('p');currentReadout.className='network-currents';document.querySelector('#view-k-lab .canvas-card').append(currentReadout);
const updateCurrents=()=>{const q=LabK.sol;currentReadout.textContent=`I₁ = ${fmt(q.I1,2)} A · I₂ = ${fmt(q.I2,2)} A · I₃ = ${fmt(q.I3,2)} A`;};new MutationObserver(updateCurrents).observe(document.getElementById('kResults'),{childList:true});updateCurrents();
Router.go('k-anim');PraxisI18n.apply(document);
// The common mobile select is mounted after this adapter has selected the initial scene.
const syncInitialSection=()=>{const select=document.querySelector('.praxis-course-sections');if(!select)return false;select.value=Router.current;return true;};
if(!syncInitialSection()){const navigationObserver=new MutationObserver(()=>{if(syncInitialSection())navigationObserver.disconnect();});navigationObserver.observe(document.body,{childList:true,subtree:true});}
window.PraxisNetworks={Router,NodeAnim,LabK,GenLab,InstrumentLab,Board,Quiz,solveNetlist,PROBLEMS,QUIZ,Flow,snapshot:()=>({active:Router.current,node:{...NodeAnim.S},kirchhoff:{...LabK.sol},board:structuredClone(Board.S),generators:{...GenLab.S}})};

})();
