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
    for (const q of on) { segs.push([prev, q.i]); prev = q.i; }
    segs.push([prev, wp.b]);
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
      const a1 = p.flip ? n2 : n1, a2 = p.flip ? n1 : n2;
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
  out.nodeSums = [];
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
    // grilă
    const gGrid = svgEl('g', { opacity: .55 }, svg);
    for (let x = 0; x <= 760; x += GRID) {
      svgEl('line', { x1: x, y1: 0, x2: x, y2: 460, stroke: 'rgba(148,163,184,.055)', 'stroke-width': .7 }, gGrid);
    }
    for (let y = 0; y <= 460; y += GRID) {
      svgEl('line', { x1: 0, y1: y, x2: 760, y2: y, stroke: 'rgba(148,163,184,.055)', 'stroke-width': .7 }, gGrid);
    }

    // conductorii
    const gW = svgEl('g', {}, svg);
    S.wires.forEach(w => {
      const path = svgEl('path', {
        d: `M${w.x1} ${w.y1} L${w.x2} ${w.y2}`,
        class: 'wire' + (w.live ? ' hi' : ''), 'data-wire': w.id,
        'stroke-width': w.live ? 3 : 2.4,
      }, gW);
      path.style.cursor = S.mode === 'del' ? 'pointer' : 'default';
      if (w.live) path.setAttribute('filter', 'url(#glowC)');
    });

    // piesele
    const gP = svgEl('g', {}, svg);
    S.pieces.forEach(p => gP.appendChild(pieceSVG(p)));

    // animație de curent (dash-uri care alunecă pe ramurile sub curent)
    const gF = svgEl('g', {}, svg);
    const addFlow = (x1, y1, x2, y2, I) => {
      const l = svgEl('line', { x1, y1, x2, y2, class: 'fwire' }, gF);
      const dur = clamp(1.6 / Math.max(0.25, Math.abs(I)), 0.35, 3);
      l.style.animationDuration = dur.toFixed(2) + 's';
      if (I < 0) l.style.animationDirection = 'reverse';
      return l;
    };
    S.wires.forEach(w => {
      if (!w.live) return;
      const I = S.pieces.reduce((m, p) => Math.max(m, Math.abs(p.I || 0)), 0);
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
    // fire „sub tensiune”
    const liveSet = new Set();
    S.pieces.forEach(p => { if (Math.abs(p.I || 0) > 0.005) liveSet.add(p.id); });
    S.wires.forEach(w => { w.live = liveSet.size > 0 && anyNear(w); });
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

  function anyNear(w) { return true; } // toate firele primesc glow dacă există curent

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
      ? rows.map(([l, v]) => `<div class="mrow"><span>${l}</span><span class="mv">${v}</span></div>`).join('')
      : `<span class="muted">Adaugă piese pe tablou pentru a vedea măsurători.</span>`;

    const B = $('#balanceBox');
    if (B) {
      const res = S.net;
      const sumI = S.pieces.filter(p => p.type === 'ammeter').reduce((s, p) => s + Math.abs(p.I || 0), 0);
      const P = S.pieces.reduce((s, p) => {
        if (p.type === 'battery') return s + p.E * Math.abs(p.I || 0);
        if (p.type === 'resistor' || p.type === 'lamp') return s + (p.I || 0) ** 2 * p.R;
        return s;
      }, 0);
      B.innerHTML = `
        piese: ${S.pieces.length} · conductori: ${S.wires.length}<br>
        Σ puteri debitate (surse): ${fmt(P, 2)} W<br>
        noduri distincte: ${res ? res.nodeCount : 0}<br>
        ${res && res.singular ? '<span style="color:#fda4af">⚠ rețea incompletă / flotantă</span>' : '<span style="color:#86efac">✔ rețea conectată</span>'}`;
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
      const anchor = t ? { x: t.x, y: t.y, p: t.p, i: t.i } : { x: snap(pt.x), y: snap(pt.y) };
      wireDrag = { x1: anchor.x, y1: anchor.y, from: anchor };
      render();
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
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
      wireDrag.x2 = pt.x; wireDrag.y2 = pt.y;
      render();
      return;
    }
    if (!drag) return;
    const p = drag.p;
    const nx = clamp(snap(pt.x - drag.dx), LEN + 0, 760 - LEN);
    const ny = clamp(snap(pt.y - drag.dy), 30, 430);
    if (nx !== p.x || ny !== p.y) {
      p.x = nx; p.y = ny; drag.moved = true;
      Sound.slide();
      render();
    }
  }

  function pointerUp(e) {
    if (wireDrag) {
      const pt = toSvg(e);
      const t = findTerminal(pt);
      const ex = t ? t.x : snap(pt.x), ey = t ? t.y : snap(pt.y);
      const sameAsStart = Math.abs(ex - wireDrag.x1) < 1 && Math.abs(ey - wireDrag.y1) < 1;
      if (!sameAsStart) {
        S.wires.push({ id: 'w' + (S.id++), x1: wireDrag.x1, y1: wireDrag.y1, x2: ex, y2: ey });
        Sound.connect();
      }
      wireDrag = null;
      compute();
      return;
    }
    if (drag) {
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
      id: 'p' + (S.id++), type, x: snap(x), y: snap(y), rot: 0, ...JSON.parse(JSON.stringify(def)), ...props,
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
    const flipBtn = `<button class="btn btn-sm btn-ghost" data-act="flip">⇄ Inversă polaritatea</button>`;
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

  /* ---------- exemplu din manual ---------- */
  function loadExample() {
    S.pieces = []; S.wires = []; S.id = 1;
    const W = (x1, y1, x2, y2) => S.wires.push({ id: 'w' + (S.id++), x1, y1, x2, y2 });
    const P = (type, x, y, props = {}) => {
      const p = { id: 'p' + (S.id++), type, x, y, rot: 0, ...JSON.parse(JSON.stringify(PIECE_DEFS[type])), ...props };
      delete p.name; delete p.kind; S.pieces.push(p); return p;
    };
    // ---- rețeaua din manual: 2 noduri (B sus, A jos), 3 laturi, 2 surse reale
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
    msg('Exemplul din manual: E₁ = 22 V, E₂ = 19 V, r = 1 Ω, R₁ = 4 Ω, R₂ = 6 Ω, R₃ = 4 Ω');
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
    svg.addEventListener('pointercancel', pointerUp);

    $$('#gMode .seg').forEach(b => b.addEventListener('click', () => {
      $$('#gMode .seg').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      S.mode = b.dataset.mode;
      Sound.click();
      msg(S.mode === 'wire' ? 'Conductor: trage de la o bornă la alta.'
        : S.mode === 'del' ? 'Ștergere: click pe o piesă sau pe un conductor.'
          : 'Mută: trage piesele; click = selectare.');
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
