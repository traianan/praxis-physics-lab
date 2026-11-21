
(function(){
"use strict";

/* ================= utilitare ================= */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const D2R = Math.PI / 180;
const TAU = Math.PI * 2;

function fmt(n, d){
  d = (d === undefined) ? 2 : d;
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return Number(n).toLocaleString(window.PraxisI18n?.locale || "ro-RO", {maximumFractionDigits:d, minimumFractionDigits:0});
}
function fmt3(n){
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return Number(n).toLocaleString(window.PraxisI18n?.locale || "ro-RO", {minimumFractionDigits:3, maximumFractionDigits:3});
}
function r1(n){ return Math.round(n * 10) / 10; }
function clamp(v, a, b){ return Math.min(b, Math.max(a, v)); }
function frameSeconds(ts, last, cap = 0.1){
  if (document.hidden || !last) return 0;
  return Math.min(cap, Math.max(0, (ts - last) / 1000));
}
function norm360(a){ return ((a % 360) + 360) % 360; }
function sinD(a){ return Math.sin(a * D2R); }
function cosD(a){ return Math.cos(a * D2R); }
function tanD(a){ return Math.tan(a * D2R); }

function clipSegmentEndToViewBox(start,end,width,height){
  const dx=end.x-start.x,dy=end.y-start.y;
  let t=1;
  if(dx>0)t=Math.min(t,(width-start.x)/dx);
  else if(dx<0)t=Math.min(t,(0-start.x)/dx);
  if(dy>0)t=Math.min(t,(height-start.y)/dy);
  else if(dy<0)t=Math.min(t,(0-start.y)/dy);
  t=clamp(t,0,1);
  return {x:start.x+dx*t,y:start.y+dy*t};
}

const PI_FRACS = {
  0:"0", 30:"π/6", 45:"π/4", 60:"π/3", 90:"π/2",
  120:"2π/3", 135:"3π/4", 150:"5π/6", 180:"π",
  210:"7π/6", 225:"5π/4", 240:"4π/3", 270:"3π/2",
  300:"5π/3", 315:"7π/4", 330:"11π/6", 360:"2π"
};
function radShort(deg){
  const d = Math.round(deg);
  if (PI_FRACS[d] !== undefined) return PI_FRACS[d];
  return fmt(deg * D2R, 2);
}
function degTick(v){
  const key = String(Math.round(v));
  if (state.unit === "rad"){
    const m = {"-360":"−2π","-270":"−3π/2","-180":"−π","-90":"−π/2",
      "0":"0","90":"π/2","180":"π","270":"3π/2","360":"2π"};
    return m[key] !== undefined ? m[key] : fmt(v * D2R, 2);
  }
  return (v < 0 ? "−" : "") + Math.abs(Math.round(v)) + "°";
}
function radTick(v){
  const key = String(Math.round(v));
  const m = {"0":"0","90":"π/2","180":"π","270":"3π/2","360":"2π"};
  return m[key] !== undefined ? m[key] : fmt(v * D2R, 2);
}
function quadrant(deg){
  const a = norm360(deg);
  if (Math.abs(a) < 1e-9 || Math.abs(a - 90) < 1e-9 || Math.abs(a - 180) < 1e-9 || Math.abs(a - 270) < 1e-9)
    return "pe axă";
  if (a < 90) return "cadranul I";
  if (a < 180) return "cadranul II";
  if (a < 270) return "cadranul III";
  return "cadranul IV";
}
function trig(deg){
  const s = sinD(deg), c = cosD(deg);
  const eps = 1e-9;
  return {
    s: s, c: c,
    tan: Math.abs(c) < eps ? NaN : s / c,
    cot: Math.abs(s) < eps ? NaN : c / s
  };
}
const EXACT = {
  0:["0","1","0","—"],
  30:["1/2","√3/2","√3/3","√3"],
  45:["√2/2","√2/2","1","1"],
  60:["√3/2","1/2","√3","√3/3"],
  90:["1","0","—","0"],
  120:["√3/2","−1/2","−√3","−√3/3"],
  135:["√2/2","−√2/2","−1","−1"],
  150:["1/2","−√3/2","−√3/3","−√3"],
  180:["0","−1","0","—"],
  210:["−1/2","−√3/2","√3/3","√3"],
  225:["−√2/2","−√2/2","1","1"],
  240:["−√3/2","−1/2","√3","√3/3"],
  270:["−1","0","—","0"],
  300:["−√3/2","1/2","−√3","−√3/3"],
  315:["−√2/2","√2/2","−1","−1"],
  330:["−1/2","√3/2","−√3/3","−√3"],
  360:["0","1","0","—"]
};

/* ================= sunet ================= */
let soundOn = window.PraxisSound?.enabled ?? true;
window.addEventListener("praxis-sound-change", e => { soundOn = e.detail.enabled; const option=$("#optSound"); if(option)option.checked=soundOn; });
function playTone(freq, dur, vol, type, delay){
  if (!soundOn || !window.PraxisSound?.enabled) return;
  let stop;
  setTimeout(() => { stop=window.PraxisSound.startTone({frequency:freq||640,type:type||"sine",gain:vol||0.05}); setTimeout(()=>stop?.(),(dur||0.1)*1000); },(delay||0)*1000);
}
function beep(){ /* Shared Praxis sound provides interface feedback. */ }
function chord(){}
function buzz(){}

/* ================= preferințe ================= */
const prefs = {grid:true, proj:true, tan:true, cot:true};
function loadPrefs(){
  try{
    const raw = localStorage.getItem("ftg_prefs");
    if (raw) Object.assign(prefs, JSON.parse(raw));
    soundOn = window.PraxisSound?.enabled ?? true;
  }catch(e){}
}
function savePrefs(){
  try{
    localStorage.setItem("ftg_prefs", JSON.stringify(prefs));
    window.PraxisSound?.setEnabled(soundOn);
  }catch(e){}
}
loadPrefs();

/* ================= stare globală ================= */
const state = {unit:"deg", angle:30};

/* ================= ajutoare SVG ================= */
function cssVar(name){
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}
function pal(){
  const dark = document.body.classList.contains("board");
  return dark
    ? {sin:"#f0b055", cos:"#7fb6d4", tan:"#e0856b", cot:"#c9a24a", main:"#9fd8bd", arc:"#a9c3b6"}
    : {sin:"#965200", cos:"#2f6f8f", tan:"#a4462f", cot:"#8a6a1f", main:"#1c5b3f", arc:"#5f6d65"};
}
function makeMap(win, box){
  return {
    win:win, box:box,
    X: v => box.x + (v - win.x0) / (win.x1 - win.x0) * box.w,
    Y: v => box.y + box.h - (v - win.y0) / (win.y1 - win.y0) * box.h
  };
}
function niceStep(range, target){
  target = target || 10;
  const raw = range / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  let m = 1;
  if (n > 5) m = 10; else if (n > 2) m = 5; else if (n > 1) m = 2;
  return m * pow;
}
function label(text, x, y, color, anchor, size, weight){
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${size || 12.5}" fill="${color}"
    text-anchor="${anchor || "middle"}" font-weight="${weight || 600}" paint-order="stroke"
    stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round">${text}</text>`;
}
function dot(x, y, color, r){
  return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r || 5.5}" fill="${color}"
    stroke="var(--card)" stroke-width="2"/>`;
}
function vec(x1, y1, x2, y2, color, w, head){
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = head || 8;
  const p1 = `${r1(x2)},${r1(y2)}`;
  const p2 = `${r1(x2 - h * Math.cos(ang - 0.42))},${r1(y2 - h * Math.sin(ang - 0.42))}`;
  const p3 = `${r1(x2 - h * Math.cos(ang + 0.42))},${r1(y2 - h * Math.sin(ang + 0.42))}`;
  return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"
      stroke="${color}" stroke-width="${w || 2.4}" stroke-linecap="round"/>
    <polygon points="${p1} ${p2} ${p3}" fill="${color}"/>`;
}
function graphAxes(m, opt){
  opt = opt || {};
  const win = m.win, box = m.box;
  const ink = cssVar("--muted") || "#5f6d65";
  const grid = cssVar("--line") || "#e4e6e0";
  const stepX = opt.stepX || niceStep(win.x1 - win.x0, 8);
  const stepY = opt.stepY || niceStep(win.y1 - win.y0, 6);
  let s = "";
  for (let v = Math.ceil(win.x0 / stepX) * stepX; v <= win.x1 + 1e-9; v += stepX){
    const X = m.X(v);
    s += `<line x1="${r1(X)}" y1="${box.y}" x2="${r1(X)}" y2="${box.y + box.h}" stroke="${grid}" stroke-width="1"/>`;
    const lab = opt.labelX ? opt.labelX(v) : (Math.abs(v) > 1e-9 ? fmt(v, 2) : "");
    if (lab) s += `<text x="${r1(X)}" y="${r1(box.y + box.h + 17)}" font-size="11" fill="${ink}" text-anchor="middle">${lab}</text>`;
  }
  for (let v = Math.ceil(win.y0 / stepY) * stepY; v <= win.y1 + 1e-9; v += stepY){
    const Y = m.Y(v);
    s += `<line x1="${box.x}" y1="${r1(Y)}" x2="${box.x + box.w}" y2="${r1(Y)}" stroke="${grid}" stroke-width="1"/>`;
    if (Math.abs(v) > 1e-9 && opt.showY !== false)
      s += `<text x="${box.x - 8}" y="${r1(Y + 3.5)}" font-size="11" fill="${ink}" text-anchor="end">${fmt(v, 2)}</text>`;
  }
  if (win.y0 <= 0 && win.y1 >= 0){
    const Y = m.Y(0);
    s += `<line x1="${box.x}" y1="${r1(Y)}" x2="${box.x + box.w}" y2="${r1(Y)}" stroke="${ink}" stroke-width="1.6"/>`;
  }
  if (win.x0 <= 0 && win.x1 >= 0){
    const X = m.X(0);
    s += `<line x1="${r1(X)}" y1="${box.y}" x2="${r1(X)}" y2="${box.y + box.h}" stroke="${ink}" stroke-width="1.6"/>`;
  }
  if (opt.xLabel) s += `<text x="${box.x + box.w}" y="${box.y + box.h + 34}" font-size="12" fill="${ink}" text-anchor="end">${opt.xLabel}</text>`;
  if (opt.yLabel) s += `<text x="${box.x}" y="${box.y - 10}" font-size="12" fill="${ink}" text-anchor="start">${opt.yLabel}</text>`;
  return s;
}

/* ================= cercul trigonometric ================= */
const CC = {w:620, h:540, cx:300, cy:270, r:130};

function renderCircle(host, angle){
  const P = pal();
  const cx = CC.cx, cy = CC.cy, R = CC.r;
  const t = angle * D2R;
  const co = Math.cos(t), si = Math.sin(t);
  const px = cx + R * co, py = cy - R * si;
  const X = u => cx + u * R;
  const Y = u => cy - u * R;
  let s = `<svg viewBox="0 0 ${CC.w} ${CC.h}" role="img" aria-label="Cercul trigonometric pentru unghiul de ${Math.round(angle)} grade">`;

  if (prefs.grid){
    for (let k = -1; k <= 1; k += 0.5){
      if (Math.abs(k) < 1e-9) continue;
      s += `<line x1="${r1(X(k))}" y1="${cy - R}" x2="${r1(X(k))}" y2="${cy + R}" stroke="var(--line)" stroke-width="1"/>`;
      s += `<line x1="${cx - R}" y1="${r1(Y(k))}" x2="${cx + R}" y2="${r1(Y(k))}" stroke="var(--line)" stroke-width="1"/>`;
    }
  }
  /* axe */
  s += `<line x1="${cx - R - 40}" y1="${cy}" x2="${cx + R + 40}" y2="${cy}" stroke="var(--muted)" stroke-width="1.5"/>`;
  s += `<line x1="${cx}" y1="${cy + R + 40}" x2="${cx}" y2="${cy - R - 40}" stroke="var(--muted)" stroke-width="1.5"/>`;
  s += `<text x="${cx + R + 36}" y="${cy - 8}" font-size="13" fill="var(--muted)" text-anchor="end" font-style="italic">x</text>`;
  s += `<text x="${cx + 9}" y="${cy - R - 32}" font-size="13" fill="var(--muted)" font-style="italic">y</text>`;
  s += `<text x="${r1(X(1))}" y="${cy + 17}" font-size="11" fill="var(--muted)" text-anchor="middle">1</text>`;
  s += `<text x="${cx - 8}" y="${r1(Y(1)) + 4}" font-size="11" fill="var(--muted)" text-anchor="end">1</text>`;
  s += `<text x="${cx - 8}" y="${r1(Y(-1)) + 4}" font-size="11" fill="var(--muted)" text-anchor="end">−1</text>`;

  /* cercul */
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--green-2)" stroke-width="2"/>`;
  const qs = [[45,"I"],[135,"II"],[225,"III"],[315,"IV"]];
  qs.forEach(q => {
    s += `<text x="${r1(X(0.76 * Math.cos(q[0] * D2R)))}" y="${r1(Y(0.76 * Math.sin(q[0] * D2R))) + 4}"
      font-size="12" fill="var(--muted)" text-anchor="middle" opacity=".65">${q[1]}</text>`;
  });

  /* ghidaje tangentă / cotangentă */
  if (prefs.tan) s += `<line x1="${r1(X(1))}" y1="0" x2="${r1(X(1))}" y2="${CC.h}" stroke="${P.tan}" stroke-width="1.2" stroke-dasharray="5 5" opacity=".5"/>`;

  /* tangenta */
  const tv = Math.abs(co) < 1e-9 ? NaN : si / co;
  if (prefs.tan && isFinite(tv)){
    const tanY = Y(tv);
    const tanLabelY = clamp(tanY + (tv >= 0 ? -9 : 18), 18, CC.h - 12);
    s += `<line x1="${r1(X(1))}" y1="${cy}" x2="${r1(X(1))}" y2="${r1(tanY)}" stroke="${P.tan}" stroke-width="4" stroke-linecap="round"/>`;
    s += label("tan θ", X(1) + 9, tanLabelY, P.tan, "start", 12);
  }

  /* cotangenta */
  const cv = Math.abs(si) < 1e-9 ? NaN : co / si;
  if (prefs.cot) s += `<line x1="0" y1="${r1(Y(1))}" x2="${CC.w}" y2="${r1(Y(1))}" stroke="${P.cot}" stroke-width="1.2" stroke-dasharray="5 5" opacity=".5"/>`;
  if (prefs.cot && isFinite(cv)){
    const cotX = X(cv);
    const cotLabelX = clamp(cotX + (cv >= 0 ? -9 : 9), 12, CC.w - 12);
    s += `<line x1="${cx}" y1="${r1(Y(1))}" x2="${r1(cotX)}" y2="${r1(Y(1))}" stroke="${P.cot}" stroke-width="4" stroke-linecap="round"/>`;
    s += label("cot θ", cotLabelX, Y(1) - 9, P.cot, cv >= 0 ? "end" : "start", 12);
  }

  /* proiecții */
  if (prefs.proj){
    s += `<line x1="${cx}" y1="${cy}" x2="${r1(X(co))}" y2="${cy}" stroke="${P.cos}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${r1(Y(si))}" stroke="${P.sin}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<line x1="${r1(px)}" y1="${r1(py)}" x2="${r1(px)}" y2="${cy}" stroke="${P.cos}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".8"/>`;
    s += `<line x1="${r1(px)}" y1="${r1(py)}" x2="${cx}" y2="${r1(py)}" stroke="${P.sin}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".8"/>`;
    if (Math.abs(co) > 0.09) s += label("cos θ", (cx + X(co)) / 2, cy + 19, P.cos, "middle", 12);
    if (Math.abs(si) > 0.09) s += label("sin θ", cx - 11, (cy + Y(si)) / 2, P.sin, "end", 12);
  }

  /* raza și punctul */
  s += `<line x1="${cx}" y1="${cy}" x2="${r1(px)}" y2="${r1(py)}" stroke="var(--green-2)" stroke-width="2.6"/>`;
  if (prefs.tan || prefs.cot){
    const lineParameters = [0, 1];
    if (prefs.tan && isFinite(tv)) lineParameters.push(1 / co);
    if (prefs.cot && isFinite(cv)) lineParameters.push(1 / si);
    const lineMin = Math.min(...lineParameters);
    const lineMax = Math.max(...lineParameters);
    for (const parameter of [lineMin, lineMax]){
      if (Math.abs(parameter - 1) < 1e-9) continue;
      const endpoint = {x:cx + (px - cx) * parameter,y:cy + (py - cy) * parameter};
      const clippedEndpoint = clipSegmentEndToViewBox({x:px,y:py},endpoint,CC.w,CC.h);
      s += `<line x1="${px}" y1="${py}" x2="${clippedEndpoint.x}" y2="${clippedEndpoint.y}" stroke="${P.tan}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".9"/>`;
    }
  }
  s += dot(px, py, "var(--green-2)", 6);

  /* arc */
  const ar = 44;
  if (angle > 0.4){
    if (angle >= 359.6){
      s += `<circle cx="${cx}" cy="${cy}" r="${ar}" fill="none" stroke="${P.arc}" stroke-width="2" opacity=".8"/>`;
    }else{
      const large = angle > 180 ? 1 : 0;
      s += `<path d="M ${cx + ar} ${cy} A ${ar} ${ar} 0 ${large} 0 ${r1(cx + ar * co)} ${r1(cy - ar * si)}"
        fill="none" stroke="${P.arc}" stroke-width="2" opacity=".9"/>`;
    }
    const mid = angle / 2 * D2R;
    s += `<text x="${r1(cx + (ar + 19) * Math.cos(mid))}" y="${r1(cy - (ar + 19) * Math.sin(mid)) + 4}"
      font-size="12.5" fill="var(--muted)" text-anchor="middle">θ</text>`;
  }

  /* eticheta P */
  s += label("P", px + (co >= 0 ? 11 : -11), py + (si >= 0 ? -10 : 19), "var(--ink)", co >= 0 ? "start" : "end", 13, 650);

  /* cadran */
  s += `<text x="${CC.w - 12}" y="${CC.h - 12}" font-size="12" fill="var(--muted)" text-anchor="end">${quadrant(angle)}</text>`;
  s += `</svg>`;
  host.innerHTML = s;
}

/* ================= tab Teorie ================= */
function setAngle(v){
  state.angle = clamp(Math.round(v), 0, 360);
  renderTheory();
}
function setUnit(u){
  state.unit = u;
  $$(".unit-btn").forEach(b => {
    const active = b.dataset.unit === u;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  renderTheory();
  renderGraph();
  beep(620);
}
function renderTheory(){
  const a = state.angle;
  renderCircle($("#svgTheory"), a);
  const tr = trig(a);
  const ex = EXACT[Math.round(a)] || ["—","—","—","—"];

  $("#angDeg").textContent = fmt(a, 0) + "°";
  $("#angRad").textContent = radShort(a) + " rad";
  $("#quadrant").textContent = quadrant(a);
  $("#valAngle").textContent = state.unit === "rad" ? radShort(a) + " rad" : fmt(a, 0) + "°";
  $("#slAngle").value = a;
  $("#slAngle").setAttribute("aria-valuetext", state.unit === "rad" ? radShort(a) + " rad (" + fmt(a, 0) + "°)" : fmt(a, 0) + "°");

  $("#tSin").textContent = fmt3(tr.s);
  $("#tCos").textContent = fmt3(tr.c);
  $("#tTan").textContent = isFinite(tr.tan) ? fmt3(tr.tan) : "nu există";
  $("#tCot").textContent = isFinite(tr.cot) ? fmt3(tr.cot) : "nu există";
  $("#tSinEx").textContent = ex[0] === "—" ? "valoare inexactă" : ex[0];
  $("#tCosEx").textContent = ex[1] === "—" ? "valoare inexactă" : ex[1];
  $("#tTanEx").textContent = ex[2] === "—" ? "nedefinit" : ex[2];
  $("#tCotEx").textContent = ex[3] === "—" ? "nedefinit" : ex[3];

  $("#circleEq").textContent =
    "P(cos " + fmt(a, 0) + "°; sin " + fmt(a, 0) + "°) = (" + fmt3(tr.c) + "; " + fmt3(tr.s) + ")";

  const q = quadrant(a);
  let hint = "Punctul P se mișcă pe cercul de rază 1. Coordonatele lui sunt chiar cos θ și sin θ.";
  if (q === "pe axă") hint = "Unghiul se află pe una dintre axe: una dintre funcții este 0, iar alta poate fi nedefinită.";
  else if (q === "cadranul II") hint = "În cadranul II sinusul este pozitiv, iar cosinusul, tangenta și cotangenta sunt negative.";
  else if (q === "cadranul III") hint = "În cadranul III tangenta și cotangenta sunt pozitive; sinusul și cosinusul sunt negative.";
  else if (q === "cadranul IV") hint = "În cadranul IV cosinusul este pozitiv; sinusul, tangenta și cotangenta sunt negative.";
  else hint = "În cadranul I toate cele patru funcții sunt pozitive.";
  $("#theoryHint").textContent = hint;

  $$(".chip[data-angle]").forEach(ch => {
    ch.classList.toggle("active", Math.round(a) === Number(ch.dataset.angle));
  });
}

/* ================= tab Grafice ================= */
const G = {fn:"sin", A:1, w:1, phi:0, playing:false, last:0, raf:0};
const GB = {x:70, y:26, w:790, h:330};
const GW = {x0:-360, x1:360, y0:-2.6, y1:2.6};

function waveVal(xDeg){
  const arg = (G.w * xDeg + G.phi) * D2R;
  if (G.fn === "sin") return G.A * Math.sin(arg);
  if (G.fn === "cos") return G.A * Math.cos(arg);
  if (G.fn === "tan") return G.A * Math.tan(arg);
  const sn = Math.sin(arg);
  if (Math.abs(sn) < 1e-9) return NaN;
  return G.A * Math.cos(arg) / sn;
}
function graphFormula(){
  const names = {sin:"sin", cos:"cos", tan:"tan", cot:"cot"};
  const a = Math.abs(G.A - 1) < 1e-9 ? "" : fmt(G.A, 2) + "·";
  const w = Math.abs(G.w - 1) < 1e-9 ? "" : fmt(G.w, 2);
  const arg = (w ? w + "·" : "") + "x" +
    (G.phi === 0 ? "" : (G.phi > 0 ? " + " : " − ") + Math.abs(G.phi) + "°");
  return "y = " + a + names[G.fn] + "(" + arg + ")";
}
function renderGraph(){
  const P = pal();
  const m = makeMap(GW, GB);
  const fnColor = {sin:P.sin, cos:P.cos, tan:P.tan, cot:P.cot}[G.fn];
  let s = `<svg viewBox="0 0 920 410" role="img" aria-label="Graficul funcției ${G.fn}">`;
  s += graphAxes(m, {stepX:90, stepY:1, labelX:degTick, xLabel:"x", yLabel:"y"});

  /* asimptote */
  if (G.fn === "tan" || G.fn === "cot"){
    const base = (G.fn === "tan") ? 90 : 0;
    for (let k = -10; k <= 10; k++){
      const x = (base + 180 * k - G.phi) / G.w;
      if (x > GW.x0 && x < GW.x1){
        const X = m.X(x);
        s += `<line x1="${r1(X)}" y1="${GB.y}" x2="${r1(X)}" y2="${GB.y + GB.h}"
          stroke="${P.tan}" stroke-width="1.2" stroke-dasharray="5 5" opacity=".55"/>`;
      }
    }
  }

  /* curba */
  let d = "", pen = false, prev = null;
  const N = 1600;
  for (let i = 0; i <= N; i++){
    const x = GW.x0 + (GW.x1 - GW.x0) * i / N;
    const y = waveVal(x);
    const inside = isFinite(y) && Math.abs(y) <= GW.y1;
    const jump = prev !== null && Math.abs(y - prev) > 3.2;
    if (inside && !jump){
      d += (pen ? "L" : "M") + r1(m.X(x)) + " " + r1(m.Y(y)) + " ";
      pen = true;
    }else{
      pen = false;
    }
    prev = y;
  }
  s += `<path d="${d}" fill="none" stroke="${fnColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

  /* marcaj pe axa Ox la origine */
  s += `<circle cx="${r1(m.X(0))}" cy="${r1(m.Y(0))}" r="3.2" fill="${fnColor}"/>`;
  s += `</svg>`;
  $("#svgGraph").innerHTML = s;

  /* citiri */
  const T = 360 / G.w;
  const shift = -G.phi / G.w;
  const amp = (G.fn === "sin" || G.fn === "cos") ? Math.abs(G.A) : null;
  $("#gFormula").textContent = graphFormula();
  $("#gPeriod").textContent = fmt(T, 1) + "°";
  $("#gPeriodRad").textContent = fmt(TAU / G.w, 2) + " rad";
  $("#gAmp").textContent = amp === null ? "—" : fmt(amp, 2);
  $("#gAmpNote").textContent = amp === null ? "tan și cot nu au amplitudine" : "valoarea maximă |y|";
  $("#gShift").textContent = fmt(shift, 1) + "°";
  $("#gExtrem").textContent = amp === null ? "±∞" : "±" + fmt(amp, 2);
  $("#gExtremNote").textContent = amp === null ? "creștere nemărginită" : "minim și maxim";

  if (G.fn === "sin" || G.fn === "cos"){
    const off = (G.fn === "sin") ? 0 : 90;
    $("#gZero").textContent = "Zerouri: ωx + φ = " + off + "° + k·180°";
    $("#gDetails").innerHTML =
      "Perioada este <b>" + fmt(T, 1) + "°</b> (" + fmt(TAU / G.w, 2) + " rad), deci graficul se repetă la fiecare " +
      fmt(T, 1) + "°. Amplitudinea este <b>" + fmt(amp, 2) + "</b>, iar deplasarea de fază este <b>" +
      fmt(shift, 1) + "°</b> față de unda de bază. Maximul este " + fmt(amp, 2) + ", minimul " + fmt(-amp, 2) + ".";
  }else{
    $("#gZero").textContent = (G.fn === "tan" ? "Zerouri: ωx + φ = k·180°" : "Zerouri: ωx + φ = 90° + k·180°");
    $("#gDetails").innerHTML =
      "Funcția " + G.fn + " are perioada <b>" + fmt(T, 1) + "°</b> (" + fmt(TAU / G.w, 2) +
      " rad) și nu este definită în punctele în care numitorul se anulează. Acolo apar <b>asimptote verticale</b>, " +
      "marcate cu linii punctate. Valorile cresc nemărginit lângă asimptote.";
  }

  $("#slAmp").value = G.A;
  $("#slOmega").value = G.w;
  $("#slPhi").value = G.phi;
  $("#valAmp").textContent = fmt(G.A, 2);
  $("#valOmega").textContent = fmt(G.w, 2);
  $("#valPhi").textContent = fmt(G.phi, 0) + "°";
}

function waveLoop(ts){
  if (!G.playing) return;
  if (!G.last) G.last = ts;
  const dt = frameSeconds(ts, G.last);
  G.last = ts;
  G.phi += dt * 55;
  if (G.phi > 180) G.phi -= 360;
  renderGraph();
  G.raf = requestAnimationFrame(waveLoop);
}
function wavePlay(){
  G.playing = true; G.last = 0;
  $("#btnWavePlay").textContent = "❚❚ Pauză";
  beep(680);
  G.raf = requestAnimationFrame(waveLoop);
}
function wavePause(){
  G.playing = false;
  cancelAnimationFrame(G.raf);
  $("#btnWavePlay").textContent = "▶ Animație undă";
}

/* ================= tab Animații ================= */
const A2 = {type:"sin", playing:false, angle:0, speed:1, dur:8000, last:0, raf:0};
const AN = {cx:190, cy:215, r:95, gx0:360, gw:520, gy:215, amp:95, w:900, h:430};

function tracePath(kind, ang){
  const X2 = a => AN.gx0 + (a / 360) * AN.gw;
  const Y2 = v => AN.gy - v * AN.amp;
  let d = "", pen = false, prev = null;
  if (kind === "tan"){
    for (let a = 0; a <= ang + 0.001; a += 1){
      const c = Math.cos(a * D2R), v = Math.tan(a * D2R);
      const ok = Math.abs(c) > 0.055 && Math.abs(v) <= 1.8;
      if (ok){
        d += (pen ? "L" : "M") + r1(X2(a)) + " " + r1(Y2(v)) + " ";
        pen = true;
      }else{
        pen = false;
      }
    }
    return d;
  }
  const step = 2;
  for (let a = 0; a <= ang + 0.001; a += step){
    const v = kind === "sin" ? Math.sin(a * D2R) : Math.cos(a * D2R);
    d += (pen ? "L" : "M") + r1(X2(a)) + " " + r1(Y2(v)) + " ";
    pen = true;
  }
  const vEnd = kind === "sin" ? Math.sin(ang * D2R) : Math.cos(ang * D2R);
  d += "L" + r1(X2(ang)) + " " + r1(Y2(vEnd)) + " ";
  return d;
}

function renderAnim2(){
  const P = pal();
  const ang = A2.angle;
  const t = ang * D2R;
  const cx = AN.cx, cy = AN.cy, R = AN.r;
  const px = cx + R * Math.cos(t), py = cy - R * Math.sin(t);
  const X2 = a => AN.gx0 + (a / 360) * AN.gw;
  const Y2 = v => AN.gy - v * AN.amp;
  let s = `<svg viewBox="0 0 ${AN.w} ${AN.h}" role="img" aria-label="Animație: unghiul pe cercul unitate și graficul funcției">`;

  /* grilă grafic */
  for (let a = 0; a <= 360; a += 90){
    const X = X2(a);
    s += `<line x1="${r1(X)}" y1="${AN.gy - AN.amp - 20}" x2="${r1(X)}" y2="${AN.gy + AN.amp + 20}" stroke="var(--line)" stroke-width="1"/>`;
    s += `<text x="${r1(X)}" y="${AN.gy + AN.amp + 36}" font-size="11" fill="var(--muted)" text-anchor="middle">${state.unit === "rad" ? radTick(a) : a + "°"}</text>`;
  }
  for (let v = -1; v <= 1; v += 0.5){
    if (Math.abs(v) < 1e-9) continue;
    const Y = Y2(v);
    s += `<line x1="${AN.gx0}" y1="${r1(Y)}" x2="${AN.gx0 + AN.gw}" y2="${r1(Y)}" stroke="var(--line)" stroke-width="1"/>`;
    s += `<text x="${AN.gx0 - 9}" y="${r1(Y + 3.5)}" font-size="11" fill="var(--muted)" text-anchor="end">${fmt(v, 1)}</text>`;
  }
  /* axe grafic */
  s += `<line x1="${AN.gx0}" y1="${AN.gy}" x2="${AN.gx0 + AN.gw + 8}" y2="${AN.gy}" stroke="var(--muted)" stroke-width="1.5"/>`;
  s += `<line x1="${AN.gx0}" y1="${AN.gy - AN.amp - 26}" x2="${AN.gx0}" y2="${AN.gy + AN.amp + 26}" stroke="var(--muted)" stroke-width="1.5"/>`;
  s += `<text x="${AN.gx0 + AN.gw}" y="${AN.gy - 9}" font-size="12" fill="var(--muted)" text-anchor="end" font-style="italic">θ</text>`;
  s += `<text x="${AN.gx0 + 8}" y="${AN.gy - AN.amp - 30}" font-size="12" fill="var(--muted)" font-style="italic">y</text>`;

  /* axe cerc */
  s += `<line x1="${cx - R - 36}" y1="${cy}" x2="${cx + R + 36}" y2="${cy}" stroke="var(--muted)" stroke-width="1.4"/>`;
  s += `<line x1="${cx}" y1="${cy + R + 36}" x2="${cx}" y2="${cy - R - 36}" stroke="var(--muted)" stroke-width="1.4"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--green-2)" stroke-width="2"/>`;
  s += `<text x="${cx + R + 30}" y="${cy - 7}" font-size="11.5" fill="var(--muted)" text-anchor="end" font-style="italic">x</text>`;
  s += `<text x="${cx + 8}" y="${cy - R - 28}" font-size="11.5" fill="var(--muted)" font-style="italic">y</text>`;

  /* proiecții pe cerc */
  if (prefs.proj){
    s += `<line x1="${cx}" y1="${cy}" x2="${r1(px)}" y2="${cy}" stroke="${P.cos}" stroke-width="4.5" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${r1(py)}" stroke="${P.sin}" stroke-width="4.5" stroke-linecap="round"/>`;
    s += `<line x1="${r1(px)}" y1="${r1(py)}" x2="${r1(px)}" y2="${cy}" stroke="${P.cos}" stroke-width="1.1" stroke-dasharray="4 4" opacity=".8"/>`;
    s += `<line x1="${r1(px)}" y1="${r1(py)}" x2="${cx}" y2="${r1(py)}" stroke="${P.sin}" stroke-width="1.1" stroke-dasharray="4 4" opacity=".8"/>`;
  }

  /* tangentă pe cerc */
  if (A2.type === "tan"){
    s += `<line x1="${cx + R}" y1="${cy - R}" x2="${cx + R}" y2="${cy + R}" stroke="${P.tan}" stroke-width="1.1" stroke-dasharray="5 5" opacity=".5"/>`;
    const tv = Math.tan(t);
    if (isFinite(tv) && Math.abs(Math.cos(t)) > 0.02){
      const cl = clamp(tv, -1.7, 1.7);
      s += `<line x1="${cx + R}" y1="${cy}" x2="${cx + R}" y2="${r1(cy - cl * R)}" stroke="${P.tan}" stroke-width="4" stroke-linecap="round"/>`;
    }
  }

  /* trasee */
  if (A2.type === "sin" || A2.type === "both"){
    s += `<path d="${tracePath("sin", ang)}" fill="none" stroke="${P.sin}" stroke-width="2.8" stroke-linecap="round"/>`;
  }
  if (A2.type === "cos" || A2.type === "both"){
    s += `<path d="${tracePath("cos", ang)}" fill="none" stroke="${P.cos}" stroke-width="2.8" stroke-linecap="round"/>`;
  }
  if (A2.type === "tan"){
    s += `<path d="${tracePath("tan", ang)}" fill="none" stroke="${P.tan}" stroke-width="2.8" stroke-linecap="round"/>`;
  }

  /* marcaj vertical pe grafic */
  if (ang > 0.5){
    s += `<line x1="${r1(X2(ang))}" y1="${AN.gy - AN.amp - 20}" x2="${r1(X2(ang))}" y2="${AN.gy + AN.amp + 20}"
      stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>`;
  }

  /* raza, punctul, arcul */
  s += `<line x1="${cx}" y1="${cy}" x2="${r1(px)}" y2="${r1(py)}" stroke="var(--green-2)" stroke-width="2.4"/>`;
  s += dot(px, py, "var(--green-2)", 6);
  const ar = 30;
  if (ang > 0.4){
    if (ang >= 359.6){
      s += `<circle cx="${cx}" cy="${cy}" r="${ar}" fill="none" stroke="${P.arc}" stroke-width="1.8" opacity=".8"/>`;
    }else{
      const large = ang > 180 ? 1 : 0;
      s += `<path d="M ${cx + ar} ${cy} A ${ar} ${ar} 0 ${large} 0 ${r1(cx + ar * Math.cos(t))} ${r1(cy - ar * Math.sin(t))}"
        fill="none" stroke="${P.arc}" stroke-width="1.8" opacity=".9"/>`;
    }
    const mid = ang / 2 * D2R;
    s += `<text x="${r1(cx + (ar + 16) * Math.cos(mid))}" y="${r1(cy - (ar + 16) * Math.sin(mid)) + 4}"
      font-size="12" fill="var(--muted)" text-anchor="middle">θ</text>`;
  }

  /* conectori și puncte pe grafic */
  if (A2.type !== "tan"){
    if (A2.type === "sin" || A2.type === "both"){
      const gy = Y2(Math.sin(t));
      s += `<line x1="${r1(px)}" y1="${r1(py)}" x2="${r1(X2(ang))}" y2="${r1(gy)}" stroke="${P.sin}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".9"/>`;
      s += dot(X2(ang), gy, P.sin, 5);
    }
    if (A2.type === "cos" || A2.type === "both"){
      const gy = Y2(Math.cos(t));
      s += `<line x1="${r1(px)}" y1="${r1(py)}" x2="${r1(X2(ang))}" y2="${r1(gy)}" stroke="${P.cos}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".7"/>`;
      s += dot(X2(ang), gy, P.cos, 5);
    }
  }else{
    const tv = Math.tan(t);
    if (isFinite(tv) && Math.abs(tv) <= 1.8) s += dot(X2(ang), Y2(tv), P.tan, 5);
  }

  /* etichete funcție */
  const names = {sin:"sin θ", cos:"cos θ", both:"sin θ și cos θ", tan:"tan θ"};
  s += `<text x="${AN.gx0 + AN.gw}" y="${AN.gy - AN.amp - 32}" font-size="13" fill="${P.main}" text-anchor="end" font-weight="600">${names[A2.type]}</text>`;

  s += `</svg>`;
  $("#svgAnim2").innerHTML = s;

  /* citiri */
  const tr = trig(ang);
  $("#anNoteValue").textContent = fmt(ang, 0) + "° = " + radShort(ang) + " rad";
  $("#anAngle").textContent = fmt(ang, 0) + "°";
  $("#anRad").textContent = radShort(ang) + " rad";
  $("#anSin").textContent = fmt3(tr.s);
  $("#anCos").textContent = fmt3(tr.c);
  $("#anTan").textContent = isFinite(tr.tan) ? fmt3(tr.tan) : "nu există";
  const pct = Math.round(ang / 360 * 100);
  $("#anProgress").textContent = pct + "%";
  $("#anBar").style.width = pct + "%";
}

function animLoop2(ts){
  if (!A2.playing) return;
  if (!A2.last) A2.last = ts;
  const dt = frameSeconds(ts, A2.last);
  A2.last = ts;
  A2.angle += (dt * A2.speed / (A2.dur / 1000)) * 360;
  if (A2.angle >= 360){
    A2.angle = 0;
    beep(780);
  }
  renderAnim2();
  A2.raf = requestAnimationFrame(animLoop2);
}
function animPlay2(){
  A2.playing = true; A2.last = 0;
  $("#btnAnimPlay").textContent = "❚❚ Pauză";
  beep(680);
  A2.raf = requestAnimationFrame(animLoop2);
}
function animPause2(){
  A2.playing = false;
  cancelAnimationFrame(A2.raf);
  $("#btnAnimPlay").textContent = "▶ Redă";
}

/* ================= tab Fizică ================= */
const Ph = {
  model:"osc", playing:false, t:0, last:0, raf:0, speed:1,
  A:20, T:1.5, phi:0,
  U0:230, f:50,
  alpha:30, m:5, mu:0.2, s:0, v:0
};
const INC = {A:{x:140, y:360}, L:380};
const GRAV = 9.81;
document.addEventListener("visibilitychange",()=>{G.last=A2.last=Ph.last=0;});

function tilesHTML(arr){
  return arr.map(t => `<div class="tile"><span>${t[0]}</span><b>${t[1]}</b>${t[2] ? `<em>${t[2]}</em>` : ""}</div>`).join("");
}

function renderOsc(){
  const P = pal();
  const A = Ph.A, T = Ph.T, phi = Ph.phi, om = TAU / T, t = Ph.t;
  const x = A * Math.sin(om * t + phi * D2R);
  const v = A * om * Math.cos(om * t + phi * D2R);
  const cx = 240, ceilY = 46, eqY = 238, k = 1.6;
  const blockTop = eqY - 27 - x * k;
  let s = `<svg viewBox="0 0 900 430" role="img" aria-label="Oscilație armonică: masă pe arc elastic și graficul elongației">`;

  /* tavan */
  s += `<line x1="${cx - 100}" y1="${ceilY}" x2="${cx + 100}" y2="${ceilY}" stroke="var(--muted)" stroke-width="4" stroke-linecap="round"/>`;
  for (let hx = cx - 90; hx <= cx + 90; hx += 20)
    s += `<line x1="${hx}" y1="${ceilY}" x2="${hx - 8}" y2="${ceilY - 12}" stroke="var(--muted)" stroke-width="1.4" opacity=".55"/>`;

  /* arc */
  let pts = [];
  const coils = 10, yTop = ceilY, yBot = blockTop;
  for (let i = 0; i <= coils * 2; i++){
    const yy = yTop + (yBot - yTop) * i / (coils * 2);
    const xx = cx + (i === 0 || i === coils * 2 ? 0 : (i % 2 ? 16 : -16));
    pts.push(r1(xx) + "," + r1(yy));
  }
  s += `<polyline points="${pts.join(" ")}" fill="none" stroke="var(--green-2)" stroke-width="2.2" stroke-linejoin="round"/>`;

  /* corp */
  s += `<rect x="${cx - 35}" y="${r1(blockTop)}" width="70" height="54" rx="7" fill="var(--tile)" stroke="var(--green-2)" stroke-width="2"/>`;
  s += `<text x="${cx}" y="${r1(blockTop + 33)}" font-size="14" fill="var(--ink)" text-anchor="middle" font-weight="600">m</text>`;

  /* echilibru */
  s += `<line x1="${cx - 72}" y1="${eqY - 27}" x2="${cx + 72}" y2="${eqY - 27}" stroke="${P.sin}" stroke-width="1.2" stroke-dasharray="5 4"/>`;
  s += `<text x="${cx + 78}" y="${eqY - 23}" font-size="11.5" fill="${P.sin}">x = 0</text>`;

  /* săgeată elongație */
  if (Math.abs(x) > 0.6){
    s += vec(cx + 56, eqY - 27, cx + 56, eqY - 27 - x * k, P.sin, 2.2, 7);
    s += `<text x="${cx + 64}" y="${r1(eqY - 27 - x * k / 2)}" font-size="11.5" fill="${P.sin}">x(t)</text>`;
  }

  /* grafic */
  const box = {x:455, y:82, w:395, h:268};
  const win = {x0:0, x1:2 * T, y0:-A * 1.25, y1:A * 1.25};
  const m = makeMap(win, box);
  s += graphAxes(m, {stepX:T / 2, stepY:A / 2, labelX:v => fmt(v, 2), xLabel:"t (s)", yLabel:"x (cm)"});
  let d = "";
  for (let i = 0; i <= 240; i++){
    const tt = 2 * T * i / 240;
    const xx = A * Math.sin(om * tt + phi * D2R);
    d += (i ? "L" : "M") + r1(m.X(tt)) + " " + r1(m.Y(xx)) + " ";
  }
  s += `<path d="${d}" fill="none" stroke="${P.sin}" stroke-width="2.8" stroke-linecap="round"/>`;
  const tv = t % (2 * T);
  const xv = A * Math.sin(om * tv + phi * D2R);
  s += `<line x1="${r1(m.X(tv))}" y1="${box.y}" x2="${r1(m.X(tv))}" y2="${box.y + box.h}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/>`;
  s += dot(m.X(tv), m.Y(xv), P.sin, 6);
  s += `</svg>`;
  $("#svgPhys").innerHTML = s;

  $("#physTitle").textContent = "Oscilație armonică";
  $("#physHint").textContent = "Un corp prins de un arc elastic oscilează sinusoidal. Graficul din dreapta arată elongația x(t) pe două perioade.";
  $("#physExplain").textContent = "Poziția corpului față de echilibru este x(t) = A·sin(ωt + φ). Când faza crește, corpul urcă și coboară, iar graficul desenează o sinusoidă. Amplitudinea A este distanța maximă față de echilibru, iar perioada T este timpul unei oscilații complete.";
  $("#physNoteLabel").textContent = "Timpul:";
  $("#physNoteValue").textContent = fmt(t, 2) + " s";
  $("#physF1").textContent = "x(t) = A·sin(ωt + φ)";
  $("#physF2").textContent = "v(t) = Aω·cos(ωt + φ)";
  $("#physLegend").innerHTML =
    `<span><i style="background:${P.sin}"></i>elongația x(t)</span>` +
    `<span><i style="background:var(--green-2)"></i>arcul și corpul</span>`;
  $("#physTiles").innerHTML = tilesHTML([
    ["Amplitudinea A", fmt(A, 1) + " cm", "elongația maximă"],
    ["Perioada T", fmt(T, 2) + " s", "o oscilație completă"],
    ["Frecvența f", fmt(1 / T, 2) + " Hz", "f = 1/T"],
    ["Pulsația ω", fmt(om, 2) + " rad/s", "ω = 2π/T"],
    ["Elongația x(t)", fmt(x, 1) + " cm", "la momentul curent"],
    ["Viteza v(t)", fmt(v, 1) + " cm/s", "v = dx/dt"]
  ]);
}

function renderAC(){
  const P = pal();
  const T = 1 / Ph.f, om = TAU * Ph.f;
  const phase = Math.PI * Ph.t + Ph.phi * D2R;
  const u = Ph.U0 * Math.sin(phase);
  const uef = Ph.U0 / Math.SQRT2;
  const cx = 205, cy = 215, R = 95;

  let s = `<svg viewBox="0 0 900 430" role="img" aria-label="Curent alternativ: fazor rotitor și graficul tensiunii">`;

  /* fazor */
  s += `<line x1="${cx - R - 34}" y1="${cy}" x2="${cx + R + 34}" y2="${cy}" stroke="var(--muted)" stroke-width="1.3"/>`;
  s += `<line x1="${cx}" y1="${cy + R + 34}" x2="${cx}" y2="${cy - R - 34}" stroke="var(--muted)" stroke-width="1.3"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--green-2)" stroke-width="2"/>`;
  const vx = cx + R * Math.cos(phase), vy = cy - R * Math.sin(phase);
  s += `<line x1="${cx}" y1="${cy}" x2="${r1(vx)}" y2="${r1(vy)}" stroke="${P.sin}" stroke-width="2.6"/>`;
  s += `<line x1="${r1(vx)}" y1="${r1(vy)}" x2="${r1(vx)}" y2="${cy}" stroke="${P.sin}" stroke-width="1.1" stroke-dasharray="4 4" opacity=".8"/>`;
  s += `<line x1="${r1(vx)}" y1="${r1(vy)}" x2="${cx}" y2="${r1(vy)}" stroke="${P.cos}" stroke-width="1.1" stroke-dasharray="4 4" opacity=".55"/>`;
  s += dot(vx, vy, P.sin, 6);
  s += `<text x="${cx}" y="${cy + R + 48}" font-size="12" fill="var(--muted)" text-anchor="middle">fazor rotitor</text>`;

  /* grafic */
  const box = {x:455, y:82, w:395, h:268};
  const win = {x0:0, x1:2 * T, y0:-Ph.U0 * 1.22, y1:Ph.U0 * 1.22};
  const m = makeMap(win, box);
  s += graphAxes(m, {stepX:T / 2, stepY:Ph.U0 / 2, labelX:v => fmt(v, 3), xLabel:"t (s)", yLabel:"u (V)"});
  let d = "";
  for (let i = 0; i <= 240; i++){
    const tt = 2 * T * i / 240;
    const uu = Ph.U0 * Math.sin(TAU * Ph.f * tt + Ph.phi * D2R);
    d += (i ? "L" : "M") + r1(m.X(tt)) + " " + r1(m.Y(uu)) + " ";
  }
  s += `<path d="${d}" fill="none" stroke="${P.sin}" stroke-width="2.8" stroke-linecap="round"/>`;
  const tv = (Ph.t * T / 2) % (2 * T);
  const uv = Ph.U0 * Math.sin(TAU * Ph.f * tv + Ph.phi * D2R);
  s += `<line x1="${r1(m.X(tv))}" y1="${box.y}" x2="${r1(m.X(tv))}" y2="${box.y + box.h}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/>`;
  s += dot(m.X(tv), m.Y(uv), P.sin, 6);
  s += `</svg>`;
  $("#svgPhys").innerHTML = s;

  $("#physTitle").textContent = "Curent alternativ";
  $("#physHint").textContent = "Tensiunea rețelei este o sinusoidă. Fazorul din stânga se rotește, iar proiecția lui pe verticală dă valoarea instantanee.";
  $("#physExplain").textContent = "Tensiunea alternativă se scrie u(t) = U₀·sin(ωt + φ), unde U₀ este valoarea de vârf, ω = 2πf este pulsația, iar φ este faza inițială. Valoarea efectivă este Uef = U₀/√2. Pentru rețeaua de 230 V, vârful este aproximativ 325 V.";
  $("#physNoteLabel").textContent = "Tensiunea instantanee:";
  $("#physNoteValue").textContent = fmt(u, 0) + " V";
  $("#physF1").textContent = "u(t) = U₀·sin(ωt + φ)";
  $("#physF2").textContent = "Uef = U₀ / √2";
  $("#physLegend").innerHTML =
    `<span><i style="background:${P.sin}"></i>tensiunea u(t)</span>` +
    `<span><i style="background:${P.cos}"></i>proiecția orizontală (cos)</span>`;
  $("#physTiles").innerHTML = tilesHTML([
    ["Tensiunea de vârf U₀", fmt(Ph.U0, 0) + " V", "amplitudinea"],
    ["Tensiunea efectivă", fmt(uef, 0) + " V", "U₀/√2"],
    ["Frecvența f", fmt(Ph.f, 0) + " Hz", "cicluri pe secundă"],
    ["Perioada T", fmt(T, 4) + " s", "T = 1/f"],
    ["Pulsația ω", fmt(om, 1) + " rad/s", "ω = 2πf"],
    ["u(t) acum", fmt(u, 0) + " V", "valoare instantanee"]
  ]);
}

function renderInc(){
  const P = pal();
  const al = Ph.alpha * D2R;
  const A = INC.A, L = INC.L;
  const B = {x:A.x + L * Math.cos(al), y:A.y - L * Math.sin(al)};
  const C = {x:B.x, y:A.y};
  const g = GRAV;
  const Gf = Ph.m * g;
  const par = Gf * Math.sin(al), perp = Gf * Math.cos(al);
  const Nf = perp, Ff = Ph.mu * Nf;
  const acc = g * (Math.sin(al) - Ph.mu * Math.cos(al));

  const sPos = clamp(Ph.s, 0, L);
  const bx = B.x + (A.x - B.x) * (sPos / L);
  const by = B.y + (A.y - B.y) * (sPos / L);
  const nx = -Math.sin(al), ny = -Math.cos(al);
  const bcx = bx + nx * 25, bcy = by + ny * 25;

  let s = `<svg viewBox="0 0 900 430" role="img" aria-label="Corp pe plan înclinat și descompunerea greutății">`;

  /* sol */
  s += `<line x1="70" y1="${A.y}" x2="880" y2="${A.y}" stroke="var(--muted)" stroke-width="2"/>`;
  for (let hx = 80; hx < 880; hx += 22)
    s += `<line x1="${hx}" y1="${A.y}" x2="${hx - 9}" y2="${A.y + 11}" stroke="var(--muted)" stroke-width="1.1" opacity=".45"/>`;

  /* plan */
  s += `<polygon points="${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}" fill="var(--tile)" stroke="var(--green-2)" stroke-width="2"/>`;

  /* unghi */
  const ar = 62;
  s += `<path d="M ${A.x + ar} ${A.y} A ${ar} ${ar} 0 0 0 ${r1(A.x + ar * Math.cos(al))} ${r1(A.y - ar * Math.sin(al))}" fill="none" stroke="${P.sin}" stroke-width="2"/>`;
  s += `<text x="${r1(A.x + (ar + 20) * Math.cos(al / 2))}" y="${r1(A.y - (ar + 20) * Math.sin(al / 2)) + 4}" font-size="13" fill="${P.sin}" text-anchor="middle">α = ${fmt(Ph.alpha, 0)}°</text>`;

  s += `<g data-incline-motion data-origin-s="${sPos}">`;
  /* corp */
  s += `<g transform="rotate(${r1(-Ph.alpha)} ${r1(bcx)} ${r1(bcy)})">
      <rect x="${r1(bcx - 26)}" y="${r1(bcy - 18)}" width="52" height="36" rx="5" fill="var(--card)" stroke="var(--green-2)" stroke-width="2"/>
      <text x="${r1(bcx)}" y="${r1(bcy + 5)}" font-size="13" fill="var(--ink)" text-anchor="middle" font-weight="600">m</text>
    </g>`;

  /* vectori */
  const sc = 70 / Gf;
  const gEnd = {x:bcx, y:bcy + Gf * sc};
  const parEnd = {x:bcx - Math.cos(al) * par * sc, y:bcy + Math.sin(al) * par * sc};
  const perpEnd = {x:bcx + Math.sin(al) * perp * sc, y:bcy + Math.cos(al) * perp * sc};
  s += `<line x1="${r1(parEnd.x)}" y1="${r1(parEnd.y)}" x2="${r1(gEnd.x)}" y2="${r1(gEnd.y)}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 5" opacity=".8"/>`;
  s += `<line x1="${r1(perpEnd.x)}" y1="${r1(perpEnd.y)}" x2="${r1(gEnd.x)}" y2="${r1(gEnd.y)}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 5" opacity=".8"/>`;
  s += vec(bcx, bcy, gEnd.x, gEnd.y, P.tan, 2.6, 8);
  s += label("G", gEnd.x + 8, gEnd.y + 4, P.tan, "start", 12);
  s += vec(bcx, bcy, parEnd.x, parEnd.y, P.sin, 2.4, 7);
  s += label("G∥", parEnd.x - 6, parEnd.y + 14, P.sin, "end", 12);
  s += vec(bcx, bcy, perpEnd.x, perpEnd.y, P.cos, 2.2, 7);
  s += label("G⊥", perpEnd.x + 6, perpEnd.y + 12, P.cos, "start", 12);
  const nEnd = {x:bcx - Math.sin(al) * Nf * sc, y:bcy - Math.cos(al) * Nf * sc};
  s += vec(bcx, bcy, nEnd.x, nEnd.y, P.main, 2.2, 7);
  s += label("N", nEnd.x - 6, nEnd.y - 6, P.main, "end", 12);
  if (Ff > 0.5){
    const fStart = {x:bcx + Math.sin(al) * 19, y:bcy + Math.cos(al) * 19};
    const fEnd = {x:fStart.x + Math.cos(al) * Ff * sc, y:fStart.y - Math.sin(al) * Ff * sc};
    s += vec(fStart.x, fStart.y, fEnd.x, fEnd.y, P.cot, 2, 6);
    s += label("Ff", fEnd.x + 6, fEnd.y - 6, P.cot, "start", 12);
  }
  s += `</g>`;

  /* panou forțe */
  const px = 575, pw = 270;
  s += `<text x="${px}" y="70" font-size="13.5" fill="var(--ink)" font-weight="650">Descompunerea greutății (N)</text>`;
  const bars = [
    ["G = mg", Gf, P.tan],
    ["G∥ = mg·sin α", par, P.sin],
    ["G⊥ = mg·cos α", perp, P.cos],
    ["N = G⊥", Nf, P.main],
    ["Ff = μ·N", Ff, P.cot]
  ];
  bars.forEach((b, i) => {
    const y = 96 + i * 38;
    const w = Math.max(1, b[1] / Gf * (pw - 8));
    s += `<text x="${px}" y="${y}" font-size="11.5" fill="var(--muted)">${b[0]}</text>`;
    s += `<rect x="${px}" y="${y + 7}" width="${r1(w)}" height="9" rx="4" fill="${b[2]}" opacity=".85"/>`;
    s += `<text x="${px + pw}" y="${y}" font-size="11.5" fill="var(--ink)" text-anchor="end">${fmt(b[1], 1)}</text>`;
  });
  s += `<text x="${px}" y="316" font-size="13" fill="var(--ink)" font-weight="650">Accelerația pe pantă</text>`;
  s += `<text x="${px}" y="342" font-size="15" fill="${acc > 0 ? P.main : P.tan}" font-weight="650">a = ${fmt(acc, 2)} m/s²</text>`;
  s += `<text x="${px}" y="366" font-size="11.5" fill="var(--muted)">${acc > 0 ? "corpul coboară accelerat" : "frecarea oprește alunecarea"}</text>`;

  s += `</svg>`;
  $("#svgPhys").innerHTML = s;

  $("#physTitle").textContent = "Corp pe plan înclinat";
  $("#physHint").textContent = "Greutatea se descompune în componenta paralelă cu planul (mg·sin α) și cea perpendiculară (mg·cos α).";
  $("#physExplain").textContent = "Componenta paralelă trage corpul în jos pe pantă, iar cea perpendiculară apasă planul și generează reacțiunea normală N. Frecarea Ff = μ·N se opune mișcării. Dacă mg·sin α > μ·mg·cos α, corpul coboară cu accelerația a = g(sin α − μ·cos α).";
  $("#physNoteLabel").textContent = "Unghiul planului:";
  $("#physNoteValue").textContent = fmt(Ph.alpha, 0) + "°";
  $("#physF1").textContent = "G∥ = m·g·sin α";
  $("#physF2").textContent = "a = g(sin α − μ·cos α)";
  $("#physLegend").innerHTML =
    `<span><i style="background:${P.tan}"></i>greutatea G</span>` +
    `<span><i style="background:${P.sin}"></i>G∥</span>` +
    `<span><i style="background:${P.cos}"></i>G⊥</span>` +
    `<span><i style="background:${P.main}"></i>reacțiunea N</span>` +
    `<span><i style="background:${P.cot}"></i>frecarea Ff</span>`;
  $("#physTiles").innerHTML = tilesHTML([
    ["Greutatea G", fmt(Gf, 1) + " N", "G = m·g"],
    ["Componenta G∥", fmt(par, 1) + " N", "mg·sin α"],
    ["Componenta G⊥", fmt(perp, 1) + " N", "mg·cos α"],
    ["Reacțiunea N", fmt(Nf, 1) + " N", "N = G⊥"],
    ["Frecarea Ff", fmt(Ff, 1) + " N", "Ff = μ·N"],
    ["Accelerația a", fmt(acc, 2) + " m/s²", acc > 0 ? "coboară" : "rămâne în repaus"]
  ]);
}

function renderPhys(){
  $$(".phys-ctl").forEach(el => el.style.display = "none");
  const ctl = $("#ctl-" + Ph.model);
  if (ctl) ctl.style.display = "block";
  $$(".chip[data-model]").forEach(ch => ch.classList.toggle("active", ch.dataset.model === Ph.model));
  if (Ph.model === "osc") renderOsc();
  else if (Ph.model === "ac") renderAC();
  else renderInc();
  $("#btnPhysPlay").textContent = Ph.playing ? "❚❚ Pauză" : "▶ Redă";
}

function updateInclineMotion(){
  const moving=$("#svgPhys [data-incline-motion]");
  if(!moving){renderPhys();return;}
  const al=Ph.alpha*D2R,delta=Ph.s-Number(moving.dataset.originS||0);
  moving.setAttribute("transform",`translate(${r1(-Math.cos(al)*delta)} ${r1(Math.sin(al)*delta)})`);
}

function physLoop(ts){
  if (!Ph.playing) return;
  if (!Ph.last) Ph.last = ts;
  const dt = frameSeconds(ts, Ph.last);
  Ph.last = ts;

  if (Ph.model === "inc"){
    const al = Ph.alpha * D2R;
    const acc = GRAV * (Math.sin(al) - Ph.mu * Math.cos(al));
    if (acc > 0){
      const simDt=dt*1.12;
      Ph.s += Ph.v * simDt + 0.5 * acc * simDt * simDt;
      Ph.v += acc * simDt;
      if (Ph.s >= INC.L){
        Ph.s = INC.L;
        Ph.playing = false;
        Ph.v = 0;
        beep(520);
      }
    }else{
      Ph.playing = false;
    }
  }else{
    Ph.t += dt * Ph.speed;
  }

  if (Ph.model === "inc") updateInclineMotion();
  else renderPhys();
  if (Ph.playing) Ph.raf = requestAnimationFrame(physLoop);
  else $("#btnPhysPlay").textContent = "▶ Redă";
}
function physPlay(){
  if (Ph.model === "inc" && Ph.s >= INC.L){ Ph.s = 0; Ph.v = 0; updateInclineMotion(); }
  Ph.playing = true; Ph.last = 0;
  $("#btnPhysPlay").textContent = "❚❚ Pauză";
  beep(680);
  Ph.raf = requestAnimationFrame(physLoop);
}
function physPause(){
  Ph.playing = false;
  cancelAnimationFrame(Ph.raf);
  $("#btnPhysPlay").textContent = "▶ Redă";
}
function physReset(){
  Ph.t = 0; Ph.s = 0; Ph.v = 0;
  renderPhys();
  beep(560);
}

function syncPhysUI(){
  $("#valOscA").textContent = fmt(Ph.A, 0);
  $("#valOscT").textContent = fmt(Ph.T, 2);
  $("#valOscPhi").textContent = fmt(Ph.phi, 0) + "°";
  $("#valAcU").textContent = fmt(Ph.U0, 0);
  $("#valAcF").textContent = fmt(Ph.f, 0);
  $("#valIncAlpha").textContent = fmt(Ph.alpha, 0) + "°";
  $("#valIncM").textContent = fmt(Ph.m, 1);
  $("#valIncMu").textContent = fmt(Ph.mu, 2);
  $("#slOscA").value = Ph.A; $("#slOscT").value = Ph.T; $("#slOscPhi").value = Ph.phi;
  $("#slAcU").value = Ph.U0; $("#slAcF").value = Ph.f;
  $("#slIncAlpha").value = Ph.alpha; $("#slIncM").value = Ph.m; $("#slIncMu").value = Ph.mu;
  renderPhys();
}

/* ================= tab Exersează ================= */
const QUESTIONS = [
  {q:"sin 30° = ?", opts:["1/2","√3/2","√2/2","1"], a:0,
   ex:"sin 30° = 1/2. În triunghiul dreptunghic cu unghi de 30°, cateta opusă este jumătate din ipotenuză."},
  {q:"cos 60° = ?", opts:["√3/2","1/2","0","1"], a:1,
   ex:"cos 60° = 1/2. Cosinusul este sinusul unghiului complementar: cos 60° = sin 30°."},
  {q:"tan 45° = ?", opts:["0","√3/3","1","√3"], a:2,
   ex:"tan 45° = sin 45° / cos 45° = (√2/2) / (√2/2) = 1."},
  {q:"180° în radiani înseamnă…", opts:["π/2","π","2π","π/4"], a:1,
   ex:"180° = π rad. Un unghi complet, 360°, este 2π rad."},
  {q:"sin²x + cos²x = ?", opts:["0","1","2","sin 2x"], a:1,
   ex:"Identitatea fundamentală: sin²x + cos²x = 1, pentru orice unghi x."},
  {q:"În cadranul II, cosinusul este…", opts:["pozitiv","negativ","zero","depinde de unghi"], a:1,
   ex:"În cadranul II, x < 0 și y > 0, deci cos x < 0, iar sin x > 0."},
  {q:"Perioada funcției sin x este…", opts:["π","2π","π/2","4π"], a:1,
   ex:"sin(x + 2π) = sin x, deci perioada este 2π (360°)."},
  {q:"cot 90° = ?", opts:["0","1","nu există","−1"], a:0,
   ex:"cot 90° = cos 90° / sin 90° = 0 / 1 = 0. Tangenta în schimb nu este definită la 90°."},
  {q:"sin(90° − x) = ?", opts:["sin x","cos x","−cos x","tan x"], a:1,
   ex:"sin(90° − x) = cos x. Funcțiile unghiurilor complementare se schimbă între ele."},
  {q:"tan x este egal cu…", opts:["cos x / sin x","sin x / cos x","1 / sin x","sin x · cos x"], a:1,
   ex:"tan x = sin x / cos x, definită când cos x ≠ 0. cot x este inversul: cos x / sin x."}
];
let qi = 0, score = 0, answered = false;

function renderQuiz(){
  const q = QUESTIONS[qi];
  $("#qProgress").textContent = "Întrebarea " + (qi + 1) + " din " + QUESTIONS.length;
  $("#qScore").textContent = score + " / " + QUESTIONS.length + " puncte";
  $("#qBar").style.width = (qi / QUESTIONS.length * 100) + "%";
  $("#qText").textContent = q.q;
  $("#qOptions").innerHTML = q.opts.map((o, i) =>
    `<button class="opt" data-opt="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join("");
  $("#qFeedback").textContent = "";
  $("#qNext").disabled = true;
  $("#qNext").textContent = (qi === QUESTIONS.length - 1) ? "Vezi rezultatul →" : "Următoarea →";
  answered = false;
  $$("#qOptions .opt").forEach(b => b.addEventListener("click", () => answerQuiz(Number(b.dataset.opt))));
}
function answerQuiz(i){
  if (answered) return;
  answered = true;
  const q = QUESTIONS[qi];
  $$("#qOptions .opt").forEach((b, j) => {
    b.disabled = true;
    if (j === q.a) b.classList.add("correct");
  });
  if (i === q.a){
    score++;
    chord([660, 880]);
    $("#qFeedback").innerHTML = "<b>Corect!</b> " + q.ex;
  }else{
    const btn = $(`#qOptions .opt[data-opt="${i}"]`);
    if (btn) btn.classList.add("wrong");
    buzz();
    $("#qFeedback").innerHTML = "<b>Nu chiar.</b> " + q.ex;
  }
  $("#qScore").textContent = score + " / " + QUESTIONS.length + " puncte";
  $("#qBar").style.width = ((qi + 1) / QUESTIONS.length * 100) + "%";
  $("#qNext").disabled = false;
}
function showQuizResult(){
  const pct = Math.round(score / QUESTIONS.length * 100);
  let msg = "Reia teoria și animațiile, apoi încearcă din nou.";
  if (pct >= 90) msg = "Excelent! Stăpânești cercul trigonometric.";
  else if (pct >= 70) msg = "Foarte bine! Reia doar valorile remarcabile.";
  else if (pct >= 50) msg = "Bine — mai exersează semnele pe cadrane.";
  $("#qProgress").textContent = "Test încheiat";
  $("#qText").textContent = "Rezultat final";
  $("#qOptions").innerHTML = `<div class="result"><b>${score} / ${QUESTIONS.length}</b>${pct}% răspunsuri corecte<br><span style="font-size:14px;color:var(--muted)">${msg}</span></div>`;
  $("#qFeedback").textContent = "";
  $("#qBar").style.width = "100%";
  $("#qNext").disabled = true;
  $("#qNext").textContent = "Test încheiat";
  if (pct >= 70) chord([660, 880, 1040]); else beep(420);
}
function nextQuiz(){
  if (qi < QUESTIONS.length - 1){
    qi++;
    renderQuiz();
    beep(620);
  }else{
    showQuizResult();
  }
}
function restartQuiz(){
  qi = 0; score = 0;
  renderQuiz();
  beep(600);
}

/* ================= taburi ================= */
function activateTab(name){
  $$(".tab").forEach(t => {
    const on = t.dataset.tab === name;
    t.tabIndex = on ? 0 : -1;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  $$(".panel").forEach(p => { const selected=p.id === "tab-" + name; p.classList.toggle("active",selected); p.hidden=!selected; });
  if (name !== "animatii") animPause2();
  if (name !== "grafice") wavePause();
  if (name !== "fizica") physPause();
  if (name === "animatii") renderAnim2();
  if (name === "grafice") renderGraph();
  if (name === "fizica") syncPhysUI();
  try{ if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name); }catch(e){}
  beep(700);
  window.scrollTo({top:0, behavior:"smooth"});
}
window.addEventListener("hashchange", () => {
  const n = (location.hash || "").replace("#", "");
  if (["teorie","animatii","grafice","fizica","exerseaza"].indexOf(n) >= 0) activateTab(n);
});

/* ================= subtaburi teorie ================= */
const theoryTabs = Array.from(document.querySelectorAll("[data-theory-page]"));
function activateTheoryPage(page, focus = false){
  theoryTabs.forEach((tab,index)=>{
    const active=tab.dataset.theoryPage===page;
    tab.classList.toggle("active",active);
    tab.setAttribute("aria-selected",String(active));
    tab.tabIndex=active?0:-1;
    if(active&&focus)tab.focus({preventScroll:true});
  });
  Array.from(document.querySelectorAll("[data-theory-screen]")).forEach(screen=>{screen.hidden=screen.dataset.theoryScreen!==page;});
}
theoryTabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>activateTheoryPage(tab.dataset.theoryPage));
  tab.addEventListener("keydown",event=>{
    const next={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1,Home:-index,End:theoryTabs.length-1-index}[event.key];
    if(next===undefined)return;
    event.preventDefault();
    activateTheoryPage(theoryTabs[(index+next+theoryTabs.length)%theoryTabs.length].dataset.theoryPage,true);
  });
});
activateTheoryPage("basics");

/* ================= evenimente ================= */
$$(".tab").forEach((t,index,all) => {
  t.tabIndex=t.getAttribute("aria-selected")==="true"?0:-1;
  t.addEventListener("click", () => activateTab(t.dataset.tab));
  t.addEventListener("keydown",e=>{const next={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1,Home:-all.length,End:all.length}[e.key];if(next===undefined)return;e.preventDefault();const target=all[(index+next+all.length)%all.length];activateTab(target.dataset.tab);target.focus();});
 });
$$("[data-goto]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  activateTab(el.dataset.goto);
}));

/* unghi */
$("#slAngle").addEventListener("input", e => {
  state.angle = Number(e.target.value);
  renderTheory();
  beep(500 + state.angle);
});
$$("[data-ang-step]").forEach(b => b.addEventListener("click", () => {
  setAngle(state.angle + Number(b.dataset.angStep));
  beep(580);
}));
$$(".chip[data-angle]").forEach(ch => ch.addEventListener("click", () => {
  setAngle(Number(ch.dataset.angle));
  beep(740);
}));
$$(".unit-btn").forEach(b => b.addEventListener("click", () => setUnit(b.dataset.unit)));

/* grafice */
$$(".chip[data-fn]").forEach(ch => ch.addEventListener("click", () => {
  $$(".chip[data-fn]").forEach(x => x.classList.remove("active"));
  ch.classList.add("active");
  G.fn = ch.dataset.fn;
  renderGraph();
  beep(720);
}));
$("#slAmp").addEventListener("input", e => { G.A = Number(e.target.value); renderGraph(); beep(520); });
$("#slOmega").addEventListener("input", e => { G.w = Number(e.target.value); renderGraph(); beep(540); });
$("#slPhi").addEventListener("input", e => { G.phi = Number(e.target.value); renderGraph(); beep(560); });
$$("[data-gstep]").forEach(b => b.addEventListener("click", () => {
  const key = b.dataset.gstep, d = Number(b.dataset.d);
  const lim = {A:[0.25, 2.5], w:[0.5, 3], phi:[-180, 180]}[key];
  G[key] = clamp(G[key] + d, lim[0], lim[1]);
  renderGraph();
  beep(600);
}));
$("#btnWavePlay").addEventListener("click", () => G.playing ? wavePause() : wavePlay());
$("#btnWaveReset").addEventListener("click", () => {
  wavePause();
  G.A = 1; G.w = 1; G.phi = 0;
  renderGraph();
  beep(560);
});
$("#btnTone").addEventListener("click", () => {
  const f = 180 + G.w * 90;
  playTone(f, 1.1, 0.06, "sine");
  beep(f);
});

/* animații */
$("#btnAnimPlay").addEventListener("click", () => A2.playing ? animPause2() : animPlay2());
$("#btnAnimRestart").addEventListener("click", () => {
  animPause2();
  A2.angle = 0;
  renderAnim2();
  beep(560);
  animPlay2();
});
$$(".chip[data-atype]").forEach(ch => ch.addEventListener("click", () => {
  $$(".chip[data-atype]").forEach(x => x.classList.remove("active"));
  ch.classList.add("active");
  A2.type = ch.dataset.atype;
  A2.angle = 0;
  const hints = {
    sin:"Înălțimea punctului P desenează curba sinus, de la 0° la 360°.",
    cos:"Deplasarea orizontală a punctului P desenează curba cosinus — o sinusoidă deplasată cu 90°.",
    both:"Urmărește ambele proiecții: sinus pornește din 0, cosinus pornește din 1.",
    tan:"Prelungirea razei intersectează verticala x = 1; acolo citim tangenta. Aproape de 90° valoarea explodează."
  };
  $("#anHint").textContent = hints[A2.type];
  renderAnim2();
  beep(720);
  if (!A2.playing) animPlay2();
}));
$("#slAnimSpeed").addEventListener("input", e => {
  A2.speed = Number(e.target.value);
  $("#valAnimSpeed").textContent = fmt(A2.speed, 2) + "×";
  beep(540);
});
function setAnimSpeed(d){
  A2.speed = clamp(Math.round((A2.speed + d) * 100) / 100, 0.25, 3);
  $("#slAnimSpeed").value = A2.speed;
  $("#valAnimSpeed").textContent = fmt(A2.speed, 2) + "×";
  beep(540);
}
$("#anSpdDown").addEventListener("click", () => setAnimSpeed(-0.25));
$("#anSpdUp").addEventListener("click", () => setAnimSpeed(0.25));

/* fizică */
$$(".chip[data-model]").forEach(ch => ch.addEventListener("click", () => {
  Ph.model = ch.dataset.model;
  Ph.playing = false;
  Ph.t = 0; Ph.s = 0; Ph.v = 0;
  syncPhysUI();
  beep(720);
}));
$$(".btn[data-model]").forEach(b => b.addEventListener("click", () => {
  Ph.model = b.dataset.model;
  Ph.playing = false;
  Ph.t = 0; Ph.s = 0; Ph.v = 0;
  syncPhysUI();
  beep(740);
}));
$("#btnPhysPlay").addEventListener("click", () => Ph.playing ? physPause() : physPlay());
$("#btnPhysReset").addEventListener("click", physReset);

const PSL = {
  slOscA:{key:"A", step:1, lim:[5, 40], dec:0, suf:" cm"},
  slOscT:{key:"T", step:0.1, lim:[0.5, 3], dec:2, suf:" s"},
  slOscPhi:{key:"phi", step:15, lim:[-180, 180], dec:0, suf:"°"},
  slAcU:{key:"U0", step:5, lim:[12, 325], dec:0, suf:" V"},
  slAcF:{key:"f", step:1, lim:[10, 60], dec:0, suf:" Hz"},
  slIncAlpha:{key:"alpha", step:1, lim:[5, 60], dec:0, suf:"°"},
  slIncM:{key:"m", step:0.5, lim:[1, 20], dec:1, suf:" kg"},
  slIncMu:{key:"mu", step:0.05, lim:[0, 0.6], dec:2, suf:""}
};
Object.keys(PSL).forEach(id => {
  const cfg = PSL[id];
  $("#" + id).addEventListener("input", e => {
    Ph[cfg.key] = Number(e.target.value);
    if (cfg.key === "alpha" || cfg.key === "m" || cfg.key === "mu"){ Ph.s = 0; Ph.v = 0; }
    syncPhysUI();
    beep(520);
  });
});
$$("[data-pvar]").forEach(b => b.addEventListener("click", () => {
  const key = b.dataset.pvar;
  const cfg = Object.keys(PSL).map(k => PSL[k]).find(c => c.key === key);
  if (!cfg) return;
  Ph[key] = clamp(Ph[key] + Number(b.dataset.d), cfg.lim[0], cfg.lim[1]);
  if (key === "alpha" || key === "m" || key === "mu"){ Ph.s = 0; Ph.v = 0; }
  syncPhysUI();
  beep(600);
}));

/* quiz */
$("#qNext").addEventListener("click", nextQuiz);
$("#qRestart").addEventListener("click", restartQuiz);

/* bară de sus */

document.addEventListener("click", () => {
  $("#langMenu").classList.remove("open");
  $("#prefsPanel").classList.remove("open");
});
$("#prefsPanel").addEventListener("click", e => e.stopPropagation());
$("#langMenu").addEventListener("click", e => e.stopPropagation());

/* preferințe */
$("#btnPrefs").addEventListener("click", e => {
  e.stopPropagation();
  $("#prefsPanel").classList.toggle("open");
  beep(640);
});
function bindOpt(id, key){
  $(id).checked = prefs[key];
  $(id).addEventListener("change", () => {
    prefs[key] = $(id).checked;
    savePrefs();
    renderTheory();
    renderAnim2();
    beep(620);
  });
}
bindOpt("#optGrid", "grid");
bindOpt("#optProj", "proj");
bindOpt("#optTan", "tan");
bindOpt("#optCot", "cot");
$("#optSound").checked = soundOn;
$("#optSound").addEventListener("change", () => {
  soundOn = $("#optSound").checked;
  window.PraxisSound?.setEnabled(soundOn);
  $("#btnSound").classList.toggle("on", soundOn);
  $("#btnSound").innerHTML = soundOn ? '<span class="dot"></span> Sunet activ' : "Sunet oprit";
  savePrefs();
  if (soundOn) beep(700);
});
$("#btnResetPrefs").addEventListener("click", () => {
  prefs.grid = prefs.proj = prefs.tan = prefs.cot = true;
  soundOn = true;
  window.PraxisSound?.setEnabled(true);
  ["#optGrid","#optProj","#optTan","#optCot","#optSound"].forEach(id => $(id).checked = true);
  $("#btnSound").classList.add("on");
  $("#btnSound").innerHTML = '<span class="dot"></span> Sunet activ';
  savePrefs();
  renderTheory(); renderAnim2();
  beep(660);
});


/* tastatură */
document.addEventListener("keydown", e => {
  if (e.target.matches("input,textarea,select")) return;
  const active = $(".tab.active");
  if (!active || active.dataset.tab !== "teorie") return;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight"){
    const step = e.shiftKey ? 15 : 1;
    setAngle(state.angle + (e.key === "ArrowRight" ? step : -step));
    beep(520);
    e.preventDefault();
  }
});

/* The archive link is managed by the shared offline export. */
/* ================= inițializare ================= */
$("#btnSound").classList.toggle("on", soundOn);
$("#btnSound").innerHTML = soundOn ? '<span class="dot"></span> Sunet activ' : "Sunet oprit";
$("#valAnimSpeed").textContent = fmt(A2.speed, 2) + "×";
renderTheory();
renderGraph();
renderAnim2();
syncPhysUI();
renderQuiz();
const initialTab = (location.hash || "").replace("#", "");
if (["teorie","animatii","grafice","fizica","exerseaza"].indexOf(initialTab) >= 0) activateTab(initialTab);
})();
