
(function(){
"use strict";
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------------- utilitare ---------------- */
function fmt(n, d){
  d = (d === undefined) ? 3 : d;
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return Number(n).toLocaleString(PraxisI18n.locale, {maximumFractionDigits:d, minimumFractionDigits:0});
}
function sgn(n){ return n < 0 ? "−" : ""; }
function abs(n){ return Math.abs(n); }

const prefs={grid:true,roots:true,vertex:true,inter:true};
function beep(){PraxisSound.play("select");}
/* ---------------- hartă grafic ---------------- */
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
function axesHTML(m, opt){
  opt = opt || {};
  const ink = "var(--muted)", line = "var(--line)", axis = getComputedStyle(document.body).getPropertyValue("--muted").trim() || "#5f6d65";
  const gridStroke = getComputedStyle(document.body).getPropertyValue("--line").trim() || "#e4e6e0";
  let s = "";
  const stepX = niceStep(m.win.x1 - m.win.x0, 10/(parseFloat(getComputedStyle(document.documentElement).fontSize)/16));
  const stepY = niceStep(m.win.y1 - m.win.y0, 8/(parseFloat(getComputedStyle(document.documentElement).fontSize)/16));

  if (prefs.grid){
    for (let v = Math.ceil(m.win.x0 / stepX) * stepX; v <= m.win.x1 + 1e-9; v += stepX){
      const X = m.X(v);
      s += `<line x1="${X.toFixed(1)}" y1="${m.box.y}" x2="${X.toFixed(1)}" y2="${m.box.y + m.box.h}" stroke="${gridStroke}" stroke-width="1"/>`;
      if (Math.abs(v) > 1e-9)
        s += `<text x="${X.toFixed(1)}" y="${(m.box.y + m.box.h + 15).toFixed(1)}" font-size="11" fill="${axis}" text-anchor="middle">${fmt(v,2)}</text>`;
    }
    for (let v = Math.ceil(m.win.y0 / stepY) * stepY; v <= m.win.y1 + 1e-9; v += stepY){
      const Y = m.Y(v);
      s += `<line x1="${m.box.x}" y1="${Y.toFixed(1)}" x2="${m.box.x + m.box.w}" y2="${Y.toFixed(1)}" stroke="${gridStroke}" stroke-width="1"/>`;
      if (Math.abs(v) > 1e-9)
        s += `<text x="${(m.box.x - 7).toFixed(1)}" y="${(Y + 3.5).toFixed(1)}" font-size="11" fill="${axis}" text-anchor="end">${fmt(v,2)}</text>`;
    }
  }
  /* axe */
  const y0 = m.Y(0), x0 = m.X(0);
  if (y0 >= m.box.y && y0 <= m.box.y + m.box.h)
    s += `<line x1="${m.box.x}" y1="${y0.toFixed(1)}" x2="${m.box.x + m.box.w}" y2="${y0.toFixed(1)}" stroke="${axis}" stroke-width="1.6"/>`;
  if (x0 >= m.box.x && x0 <= m.box.x + m.box.w)
    s += `<line x1="${x0.toFixed(1)}" y1="${m.box.y}" x2="${x0.toFixed(1)}" y2="${m.box.y + m.box.h}" stroke="${axis}" stroke-width="1.6"/>`;
  s += `<text x="${m.box.x + m.box.w - 2}" y="${(y0 - 7).toFixed(1)}" font-size="12.5" fill="${axis}" text-anchor="end" font-style="italic">x</text>`;
  s += `<text x="${(x0 + 8).toFixed(1)}" y="${m.box.y + 13}" font-size="12.5" fill="${axis}" font-style="italic">y</text>`;
  if (opt.xLabel)
    s += `<text x="${m.box.x + m.box.w}" y="${m.box.y + m.box.h + 30}" font-size="12" fill="${axis}" text-anchor="end">${opt.xLabel}</text>`;
  if (opt.yLabel)
    s += `<text x="${m.box.x}" y="${m.box.y - 8}" font-size="12" fill="${axis}" text-anchor="start">${opt.yLabel}</text>`;
  return s;
}
function label(text, x, y, color, anchor, size){
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size||12.5}" fill="${color}"
    text-anchor="${anchor||"middle"}" font-weight="600" paint-order="stroke"
    stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round">${text}</text>`;
}
function dot(x, y, color, r){
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r||5.5}" fill="${color}"
    stroke="var(--card)" stroke-width="2"/>`;
}

/* ---------------- starea aplicației ---------------- */
const S = {a:1, b:-2, c:-3};

function f(x){ return S.a * x * x + S.b * x + S.c; }
function delta(){ return S.b * S.b - 4 * S.a * S.c; }
function vertex(){
  const h = -S.b / (2 * S.a);
  return S.a===0?{h:NaN,k:NaN}:{h:h,k:f(h)};
}
function roots(){return QuadraticModel.roots(S.a,S.b,S.c)||[];}

function expr(a, b, c){
  let out = "y = ";
  function term(coef, pow){
    if (Math.abs(coef) < 1e-9) return null;
    const sign = coef < 0 ? "−" : "+";
    const body = pow === 2 ? "x²" : pow === 1 ? "x" : "";
    let num;
    if (pow === 0) num = fmt(abs(coef), 2);
    else num = (Math.abs(Math.abs(coef) - 1) < 1e-9) ? "" : fmt(abs(coef), 2);
    return {sign:sign, body:num + body};
  }
  const parts = [term(a,2), term(b,1), term(c,0)].filter(Boolean);
  if (!parts.length) return "y = 0";
  parts.forEach((p, i) => {
    out += (i === 0 ? (p.sign === "−" ? "−" : "") : " " + p.sign + " ") + p.body;
  });
  return out;
}

/* ---------------- view parabolă ---------------- */
const TH_BOX = {x:46, y:18, w:578, h:384};
const TH_WIN = {x0:-8, x1:8, y0:-10, y1:10};

function parabolaPath(m){
  const pts = [];
  const N = 320;
  let d = "", drawing = false;
  for (let i = 0; i <= N; i++){
    const x = m.win.x0 + (m.win.x1 - m.win.x0) * i / N;
    const y = f(x);
    const inside = y >= m.win.y0 - 1e-9 && y <= m.win.y1 + 1e-9;
    if (inside){
      const X = m.X(x), Y = m.Y(y);
      d += (drawing ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1) + " ";
      drawing = true;
    } else drawing = false;
  }
  return d;
}

function renderParabola(svgHost, opts){
  opts = opts || {};
  const m = makeMap(TH_WIN, TH_BOX);
  let s = `<svg viewBox="0 0 640 430" role="img" aria-label="Graficul parabolei">`;
  s += axesHTML(m, {});
  s += `<clipPath id="clip-${opts.id||"x"}"><rect x="${TH_BOX.x}" y="${TH_BOX.y}" width="${TH_BOX.w}" height="${TH_BOX.h}"/></clipPath>`;
  s += `<g clip-path="url(#clip-${opts.id||"x"})">`;

  /* axa de simetrie */
  const V = vertex();
  if (prefs.vertex && V.h >= TH_WIN.x0 && V.h <= TH_WIN.x1){
    s += `<line x1="${m.X(V.h).toFixed(1)}" y1="${TH_BOX.y}" x2="${m.X(V.h).toFixed(1)}" y2="${TH_BOX.y + TH_BOX.h}"
      stroke="#8a6a1f" stroke-width="1.4" stroke-dasharray="6 5"/>`;
  }
  /* curba */
  s += `<path d="${parabolaPath(m)}" fill="none" stroke="var(--green-2)" stroke-width="3" stroke-linecap="round"/>`;
  s += `</g>`;

  /* rădăcini */
  if (prefs.roots){
    roots().forEach((r, i) => {
      if (r >= TH_WIN.x0 && r <= TH_WIN.x1){
        const X = m.X(r);
        s += dot(X, m.Y(0), "#a4462f", 6);
        s += rootMarkerLabel(i,X,m.Y(0));
      }
    });
  }
  /* vârf */
  if (prefs.vertex && V.h >= TH_WIN.x0 && V.h <= TH_WIN.x1 && V.k >= TH_WIN.y0 && V.k <= TH_WIN.y1){
    const X = m.X(V.h), Y = m.Y(V.k);
    s += dot(X, Y, "#e39b34", 6.5);
    s += vertexMarkerLabel(V,X,Y);
  }
  /* intersecția cu Oy */
  if (prefs.inter && S.c >= TH_WIN.y0 && S.c <= TH_WIN.y1){
    const X = m.X(0), Y = m.Y(S.c);
    s += dot(X, Y, "#1c5b3f", 5);
    s += interceptMarkerLabel(V,X,Y);
  }
  /* punct mobil (animație) */
  if (opts.point){
    const px = opts.point.x, py = f(px);
    if (py >= TH_WIN.y0 && py <= TH_WIN.y1){
      const X = m.X(px), Y = m.Y(py);
      s += `<line x1="${X.toFixed(1)}" y1="${Y.toFixed(1)}" x2="${X.toFixed(1)}" y2="${m.Y(0).toFixed(1)}" stroke="#e39b34" stroke-width="1.3" stroke-dasharray="5 4"/>`;
      s += `<line x1="${X.toFixed(1)}" y1="${Y.toFixed(1)}" x2="${m.X(0).toFixed(1)}" y2="${Y.toFixed(1)}" stroke="#e39b34" stroke-width="1.3" stroke-dasharray="5 4"/>`;
      s += dot(X, Y, "#e39b34", 7);
      s += pointMarkerLabel(V,X,Y);
    }
  }
  s += `</svg>`;
  svgHost.innerHTML = s; finishSVG(svgHost);
}

/* ---------------- view animație ---------------- */
const AN_BOX = {x:46, y:18, w:578, h:384};
const AN_WIN = {x0:-9, x1:9, y0:-11, y1:11};

function renderAnimView(){
  AN_WIN.y0=anim.type==="point"?-8:-11; AN_WIN.y1=anim.type==="point"?90:11;
  const m = makeMap(AN_WIN, AN_BOX);
  let s = `<svg viewBox="0 0 640 430" role="img" aria-label="Animație pe grafic">`;
  s += axesHTML(m, {});
  s += `<clipPath id="clip-an"><rect x="${AN_BOX.x}" y="${AN_BOX.y}" width="${AN_BOX.w}" height="${AN_BOX.h}"/></clipPath>`;
  s += `<g clip-path="url(#clip-an)">`;
  const V = vertex();
  if (prefs.vertex && V.h >= AN_WIN.x0 && V.h <= AN_WIN.x1){
    s += `<line x1="${m.X(V.h).toFixed(1)}" y1="${AN_BOX.y}" x2="${m.X(V.h).toFixed(1)}" y2="${AN_BOX.y + AN_BOX.h}"
      stroke="#8a6a1f" stroke-width="1.4" stroke-dasharray="6 5"/>`;
  }
  /* curba cu interpolare */
  let d = "", drawing = false;
  const N = 340;
  for (let i = 0; i <= N; i++){
    const x = AN_WIN.x0 + (AN_WIN.x1 - AN_WIN.x0) * i / N;
    const y = f(x);
    if (y >= AN_WIN.y0 - 1e-9 && y <= AN_WIN.y1 + 1e-9){
      d += (drawing ? "L" : "M") + m.X(x).toFixed(1) + " " + m.Y(y).toFixed(1) + " ";
      drawing = true;
    } else drawing = false;
  }
  s += `<path d="${d}" fill="none" stroke="var(--green-2)" stroke-width="3" stroke-linecap="round"/>`;
  s += `</g>`;

  if (prefs.roots){
    roots().forEach((r, i) => {
      if (r >= AN_WIN.x0 && r <= AN_WIN.x1){
        s += dot(m.X(r), m.Y(0), "#a4462f", 6);
        s += rootMarkerLabel(i,m.X(r),m.Y(0));
      }
    });
  }
  if (prefs.vertex && V.h >= AN_WIN.x0 && V.h <= AN_WIN.x1 && V.k >= AN_WIN.y0 && V.k <= AN_WIN.y1){
    s += dot(m.X(V.h), m.Y(V.k), "#e39b34", 6.5);
    s += vertexMarkerLabel(V,m.X(V.h),m.Y(V.k));
  }
  if (prefs.inter && S.c >= AN_WIN.y0 && S.c <= AN_WIN.y1){
    s += dot(m.X(0), m.Y(S.c), "#1c5b3f", 5);
  }
  if (anim.type === "point"){
    const px = anim.px;
    const py = f(px);
    if (py >= AN_WIN.y0 && py <= AN_WIN.y1){
      const X = m.X(px), Y = m.Y(py);
      s += `<line x1="${X.toFixed(1)}" y1="${Y.toFixed(1)}" x2="${X.toFixed(1)}" y2="${m.Y(0).toFixed(1)}" stroke="#e39b34" stroke-width="1.3" stroke-dasharray="5 4"/>`;
      s += `<line x1="${X.toFixed(1)}" y1="${Y.toFixed(1)}" x2="${m.X(0).toFixed(1)}" y2="${Y.toFixed(1)}" stroke="#e39b34" stroke-width="1.3" stroke-dasharray="5 4"/>`;
      s += dot(X, Y, "#e39b34", 7);
      s += pointMarkerLabel(V,X,Y);
    }
  }
  s += `</svg>`;
  $("#svgAnim").innerHTML = s; finishSVG($("#svgAnim"));
}

/* ---------------- sincronizare UI teorie ---------------- */
function syncTheoryUI(){
  $("#slA").value = S.a; $("#slB").value = S.b; $("#slC").value = S.c;
  $("#valA").textContent = fmt(S.a, 2);
  $("#valB").textContent = fmt(S.b, 2);
  $("#valC").textContent = fmt(S.c, 2);
  PraxisMath.set($("#eqTheory"),expr(S.a,S.b,S.c));
  PraxisMath.set($("#eqAnim"),expr(S.a,S.b,S.c));

  const d = delta(), rs = roots();
  $("#tileDelta").textContent = S.a===0?"—":fmt(d,2);
  $("#tileRoots").textContent = rs.length === 0 ? "0 (Δ < 0)" : (rs.length === 1 ? "1 (Δ = 0)" : "2");
  const V = vertex();
  $("#tileVertex").textContent = "(" + fmt(V.h,2) + "; " + fmt(V.k,2) + ")";
  $("#tileF0").textContent = fmt(S.c, 2);

  if (rs.length === 2)      $("#rootsNote").textContent = "x₁ = " + fmt(rs[0],2) + ", x₂ = " + fmt(rs[1],2);
  else if (rs.length === 1) $("#rootsNote").textContent = "x₀ = " + fmt(rs[0],2) + " (Δ = 0)";
  else                      $("#rootsNote").textContent = "nicio rădăcină reală (Δ < 0)";

  const sens = S.a > 0 ? "deschisă în sus și are un minim" : "deschisă în jos și are un maxim";
  $("#theoryHint").innerHTML =
    "Parabola este " + sens + ". Coeficientul a = " + fmt(S.a,2) +
    ", iar simetria este față de dreapta x = " + fmt(V.h,2) + ". Intersecția cu axa Oy este (0; " + fmt(S.c,2) + ").";

  $$(".chip[data-preset]").forEach(ch => {
    const p = ch.dataset.preset.split(",").map(Number);
    ch.classList.toggle("active", Math.abs(p[0]-S.a) < 1e-9 && Math.abs(p[1]-S.b) < 1e-9 && Math.abs(p[2]-S.c) < 1e-9);
  });

  if(S.a===0){$("#tileVertex").textContent="—";$("#theoryHint").textContent="a = 0: funcția nu mai este de gradul al doilea; nu are vârf de parabolă.";const all=S.b===0&&S.c===0;$("#tileRoots").textContent=all?"ℝ":String(rs.length);$("#rootsNote").textContent=all?"Orice număr real este rădăcină.":rs.length?"x₀ = "+fmt(rs[0],2):"Nicio rădăcină reală.";}
  renderParabola($("#svgTheory"), {id:"th"});
  renderAnimView();
}

function renderTheory(){ syncTheoryUI(); }

/* citirile inițiale din tabul Animații (fără a modifica S) */
function initAnimReadouts(){
  if (anim.type === "a"){
    $("#tileAName").textContent = "Coeficient a";
    $("#tileBName").textContent = "Deschidere";
    $("#tileCName").textContent = "Sens";
    $("#tileA").textContent = fmt(S.a,2);
    $("#tileB").textContent = fmt(Math.abs(S.a),2);
    $("#tileC").textContent = S.a===0?"dreaptă":S.a > 0 ? "în sus" : "în jos";
    $("#animValue").textContent = "a = " + fmt(S.a,2);
  }
  $("#tileD").textContent = S.a===0?"—":fmt(delta(),2);
  $("#animProgress").textContent = "0%";
}

/* ---------------- animații ---------------- */
const anim = {type:"a", playing:false, t:0, speed:1, px:0, last:0, raf:0};
const DUR = {a:7000, point:6000, roots:8000};

const ANIM_META = {
  a:{
    label:"Coeficientul a în timp:",
    explain:["<li><b>Coeficientul a se schimbă:</b> a parcurge intervalul [−1,6; 1,6]. La a = 0 funcția devine liniară.</li>",
             "<li><b>Punct mobil:</b> un punct P(x; f(x)) parcurge curba de la stânga la dreapta; liniile punctate arată proiecțiile sale pe axe.</li>",
             "<li><b>Rădăcinile apar:</b> c scade treptat, Δ crește de la valori negative la pozitive, iar punctele x₁ și x₂ „ies” din vârf pe axa x.</li>"]
  },
  point:{
    label:"Punctul P:",
    explain:["<li><b>Punctul mobil:</b> x crește uniform de la −8 la 8, iar P(x; f(x)) parcurge parabola; liniile portocalii punctate sunt proiecțiile pe axe.</li>",
             "<li>Se observă direct că y crește apoi scade (sau invers) — monotonie și extrem.</li>",
             "<li><b>Coeficientul a se schimbă / Rădăcinile apar</b> sunt celelalte două animații disponibile.</li>"]
  },
  roots:{
    label:"Coeficientul c:",
    explain:["<li><b>Rădăcinile apar:</b> pornești de la c = 4 (Δ &lt; 0, nicio intersecție cu axa x) și cobori până la c = −4 (Δ &gt; 0, două rădăcini).</li>",
             "<li>Momentul în care parabola atinge axa x corespunde exact lui Δ = 0.</li>",
             "<li>Se vede legătura dintre algebra (ecuația de gradul 2) și geometrie (intersectarea curbei cu axa x).</li>"]
  }
};

function applyAnimFrame(p){
  if (anim.type === "a"){
    const a = 1.6 * Math.sin(2 * Math.PI * p);
    S.a = Math.abs(a)<1e-12?0:a;
    S.b = -2; S.c = -3;
    $("#animValue").textContent = "a = " + fmt(S.a, 2);
    $("#tileAName").textContent = "Coeficient a";
    $("#tileBName").textContent = "Deschidere";
    $("#tileCName").textContent = "Sens";
    $("#tileA").textContent = fmt(S.a,2);
    $("#tileB").textContent = fmt(Math.abs(S.a),2);
    $("#tileC").textContent = S.a===0?"dreaptă":S.a > 0 ? "în sus" : "în jos";
  } else if (anim.type === "point"){
    S.a = 1; S.b = -2; S.c = -3;
    const x = -8 + 16 * p;
    anim.px = x;
    $("#animValue").textContent = "x = " + fmt(x,2);
    $("#tileAName").textContent = "Punct x";
    $("#tileBName").textContent = "f(x)";
    $("#tileCName").textContent = "y";
    $("#tileA").textContent = fmt(x,2);
    $("#tileB").textContent = fmt(f(x),2);
    $("#tileC").textContent = fmt(f(x),2);
  } else {
    S.a = 1; S.b = 0;
    S.c = 4 - 8 * p;
    $("#animValue").textContent = "c = " + fmt(S.c,2);
    $("#tileAName").textContent = "Coeficient c";
    $("#tileBName").textContent = "Δ";
    $("#tileCName").textContent = "Rădăcini";
    $("#tileA").textContent = fmt(S.c,2);
    $("#tileB").textContent = fmt(delta(),2);
    $("#tileC").textContent = roots().length === 0 ? "0" : (roots().length === 1 ? "1" : "2");
  }
  $("#tileD").textContent = S.a===0?"—":fmt(delta(),2);
  $("#animProgress").textContent = Math.round(p * 100) + "%";
  syncTheoryUI();
}

function animLoop(ts){
  if (!anim.playing) return;
  if (!anim.last) anim.last = ts;
  const dt = ts - anim.last;
  anim.last = ts;
  anim.t += dt * anim.speed;
  const dur = DUR[anim.type];
  let p = anim.t / dur;
  if (p >= 1){
    anim.t = 0; p = 0;
    beep(760);
  }
  applyAnimFrame(p);
  anim.raf = requestAnimationFrame(animLoop);
}
function playAnim(){
  anim.playing = true; anim.last = 0;
  $("#btnPlay").textContent = "❚❚ Pauză";
  beep(680);
  anim.raf = requestAnimationFrame(animLoop);
}
function pauseAnim(){
  anim.playing = false;
  cancelAnimationFrame(anim.raf);
  $("#btnPlay").textContent = "▶ Redă";
}
function restartAnim(){
  anim.t = 0; anim.last = 0;
  applyAnimFrame(0);
  beep(560);
  if (!anim.playing) playAnim();
}

/* ---------------- fizică ---------------- */
const P = {ex:"proj", v0:20, th:45, h0:2, vu:12, H:45, g:9.81, t:0, playing:false, last:0, raf:0};

function physData(){
  const g = P.g, model=QuadraticModel.physics(P);
  if (P.ex === "proj"){
    const rad = P.th * Math.PI / 180;
    const vy = P.v0 * Math.sin(rad), vx = P.v0 * Math.cos(rad);
    const H = model.height;
    const tz = model.tEnd;
    const R = model.range;
    return {
      title:"Traiectoria unui proiectil",
      eq:"y = x·tan θ − g·x² / (2v₀²·cos²θ)",
      xLabel:"distanța x (m)", yLabel:"înălțimea y (m)",
      xMax:Math.max(R * 1.12, 5), yMax:Math.max(H * 1.3, 3),
      tEnd:tz,
      curve:X => X * Math.tan(rad) - g * X * X / (2 * P.v0 * P.v0 * Math.cos(rad) * Math.cos(rad)),
      pos:model.pos,
      tiles:[
        ["Înălțimea maximă H", fmt(H,2) + " m"],
        ["Raza de cădere R", fmt(R,2) + " m"],
        ["Timp până la vârf", fmt(vy / g,2) + " s"],
        ["Timp de zbor", fmt(tz,2) + " s"]
      ],
      f1:"H = v₀²·sin²θ / 2g", f2:"R = v₀²·sin2θ / g",
      note:"Proiectilul la momentul t =",
      hint:"Axa x este distanța parcursă (m), axa y este înălțimea (m). Traseul este o parabolă: componenta orizontală este uniformă, cea verticală este uniform accelerată.",
      explain:"Axa x este distanța parcursă (m), iar axa y este înălțimea (m). Curba este traiectoria proiectilului; punctul portocaliu arată poziția curentă, iar linia orizontală marchează înălțimea maximă atinsă. Ecuatia traiectoriei se elimină din t din ecuațiile parametrice — rezultă o funcție de gradul al doilea y(x)."
    };
  }
  if (P.ex === "up"){
    const g2 = g;
    const tv = P.vu / g2;
    const hmax = P.h0 + P.vu * P.vu / (2 * g2);
    const disc = P.vu * P.vu + 2 * g2 * P.h0;
    const timp = model.tEnd;
    const vimp = Math.sqrt(disc);
    return {
      title:"Înălțimea unei mingi aruncate în sus",
      eq:"h(t) = h₀ + v₀·t − g·t²/2",
      xLabel:"timpul t (s)", yLabel:"înălțimea h (m)",
      xMax:Math.max(timp * 1.1, 2), yMax:Math.max(hmax * 1.25, 3),
      tEnd:timp,
      curve:t => P.h0 + P.vu * t - 0.5 * g2 * t * t,
      pos:model.pos,
      tiles:[
        ["Înălțimea maximă", fmt(hmax,2) + " m"],
        ["Timp până la vârf", fmt(tv,2) + " s"],
        ["Timp până la sol", fmt(timp,2) + " s"],
        ["Viteza la impact", fmt(vimp,2) + " m/s"]
      ],
      f1:"t(vârf) = v₀ / g", f2:"h(max) = h₀ + v₀² / 2g",
      note:"Mingea la momentul t =",
      hint:"h(t) este o funcție de gradul al doilea în timp: a = −g/2 < 0, deci parabola este deschisă în jos și are un maxim în vârf.",
      explain:"Axa x este timpul (s), axa y este înălțimea (m). Curba este graficul h(t) = h₀ + v₀t − gt²/2 — o parabolă deschisă în jos. Vârful graficului dă înălțimea maximă și momentul în care mingea se oprește din urcare."
    };
  }
  const timp = model.tEnd;
  const vimp = Math.sqrt(2 * g * P.H);
  return {
    title:"Căderea liberă a unui corp",
    eq:"h(t) = H − g·t²/2",
    xLabel:"timpul t (s)", yLabel:"înălțimea h (m)",
    xMax:Math.max(timp * 1.1, 2), yMax:Math.max(P.H * 1.15, 3),
    tEnd:timp,
    curve:t => P.H - 0.5 * g * t * t,
    pos:model.pos,
    tiles:[
      ["Timpul de cădere", fmt(timp,2) + " s"],
      ["Viteza la impact", fmt(vimp,2) + " m/s"],
      ["Viteza inițială", "0 m/s"],
      ["Înălțimea H", fmt(P.H,0) + " m"]
    ],
    f1:"t = √(2H / g)", f2:"v = √(2gH)",
    note:"Corpul la momentul t =",
    hint:"Corpul pornește din repaus și accelerează constant; graficul h(t) este o parabolă deschisă în jos (a = −g/2).",
    explain:"Axa x este timpul (s), axa y este înălțimea (m). Corpul pornește de la H cu viteză zero și accelerează datorită gravitației; graficul este o porțiune de parabolă deschisă în jos."
  };
}

function renderPhys(){
  const d = physData();
  $("#physTitle").textContent = d.title;
  PraxisMath.set($("#eqPhys"),d.eq);
  $("#physHint").textContent = d.hint;
  $("#physExplain").textContent = d.explain;
  $("#physF1").textContent = d.f1;
  $("#physF2").textContent = d.f2;

  const box = {x:52, y:22, w:572, h:378};
  const m = makeMap({x0:0, x1:d.xMax, y0:0, y1:d.yMax}, box);
  let s = `<svg viewBox="0 0 640 430" role="img" aria-label="${d.title}">`;
  s += axesHTML(m, {xLabel:d.xLabel, yLabel:d.yLabel});

  /* curbă */
  let path = "", drawing = false;
  const N = 260;
  for (let i = 0; i <= N; i++){
    const t = d.tEnd * i / N;
    const pt = d.pos(t);
    if (pt.y >= -1e-9 && pt.y <= d.yMax + 1e-9 && pt.x <= d.xMax + 1e-9){
      path += (drawing ? "L" : "M") + m.X(pt.x).toFixed(1) + " " + m.Y(pt.y).toFixed(1) + " ";
      drawing = true;
    } else drawing = false;
  }
  s += `<path d="${path}" fill="none" stroke="var(--green-2)" stroke-width="3.2" stroke-linecap="round"/>`;

  /* linia înălțimii maxime / linia zero */
  let yTop = 0;
  d.tiles.forEach(t => { const v = parseFloat(t[1]); if (/Înălțimea/.test(t[0]) && isFinite(v)) yTop = Math.max(yTop, v); });
  if (P.ex === "proj" || P.ex === "up"){
    const rad = P.th * Math.PI / 180;
    let hmax = 0;
    if (P.ex === "proj") hmax = (P.v0 * Math.sin(rad)) ** 2 / (2 * P.g);
    else hmax = P.h0 + P.vu * P.vu / (2 * P.g);
    const Y = m.Y(hmax);
    s += `<line x1="${box.x}" y1="${Y.toFixed(1)}" x2="${box.x + box.w}" y2="${Y.toFixed(1)}" stroke="#8a6a1f" stroke-width="1.4" stroke-dasharray="7 6"/>`;
    s += label("H = " + fmt(hmax,2) + " m", box.x + box.w - 4, Y - 7, "#8a6a1f", "end", 12);
    /* punctul vârf */
    const tV = (P.ex === "proj") ? (P.v0*Math.sin(rad)/P.g) : (P.vu/P.g);
    const pv = d.pos(tV);
    s += dot(m.X(pv.x), m.Y(pv.y), "#8a6a1f", 5);
  }

  /* corpul curent */
  const cur = d.pos(Math.min(P.t, d.tEnd));
  if (cur.y >= -1e-9){
    const X = m.X(cur.x), Y = m.Y(cur.y);
    if (P.ex === "proj"){
      s += `<line x1="${X.toFixed(1)}" y1="${Y.toFixed(1)}" x2="${X.toFixed(1)}" y2="${m.Y(0).toFixed(1)}" stroke="#e39b34" stroke-width="1.2" stroke-dasharray="4 4"/>`;
    } else {
      s += `<line x1="${box.x}" y1="${Y.toFixed(1)}" x2="${X.toFixed(1)}" y2="${Y.toFixed(1)}" stroke="#e39b34" stroke-width="1.2" stroke-dasharray="4 4"/>`;
      s += `<line x1="${X.toFixed(1)}" y1="${Y.toFixed(1)}" x2="${X.toFixed(1)}" y2="${m.Y(0).toFixed(1)}" stroke="#e39b34" stroke-width="1.2" stroke-dasharray="4 4"/>`;
    }
    s += dot(X, Y, "#e39b34", 7.5);
  }
  s += `</svg>`;
  $("#svgPhys").innerHTML = s; finishSVG($("#svgPhys"));

  $("#physNoteLabel").textContent = d.note;
  $("#physNoteValue").textContent = fmt(P.t,2) + " s";

  const tw = $("#physTiles");
  tw.innerHTML = d.tiles.map(t => `<div class="tile"><span>${t[0]}</span><b>${t[1]}</b></div>`).join("");
}

function physLoop(ts){
  if (!P.playing) return;
  if (!P.last) P.last = ts;
  const dt = ts - P.last;
  P.last = ts;
  const d = physData();
  P.t += dt / 1000;
  if (P.t > d.tEnd){ P.t = 0; beep(760); }
  renderPhys();
  P.raf = requestAnimationFrame(physLoop);
}
function physPlay(){
  if(physData().tEnd<=0){P.t=0;physPause();renderPhys();return;}
  P.playing = true; P.last = 0;
  $("#btnPhysPlay").textContent = "❚❚ Pauză";
  beep(680);
  P.raf = requestAnimationFrame(physLoop);
}
function physPause(){
  P.playing = false;
  cancelAnimationFrame(P.raf);
  $("#btnPhysPlay").textContent = "▶ Redă";
}

function syncPhysUI(){
  P.t=Math.min(P.t,physData().tEnd);
  $("#valV0").textContent = fmt(P.v0,0);
  $("#valTh").textContent = fmt(P.th,0);
  $("#valH0").textContent = fmt(P.h0,0);
  $("#valVu").textContent = fmt(P.vu,0);
  $("#valH").textContent = fmt(P.H,0);
  $("#valG").textContent = fmt(P.g,2);
  $("#slV0").value = P.v0; $("#slTh").value = P.th; $("#slH0").value = P.h0;
  $("#slVu").value = P.vu; $("#slH").value = P.H; $("#slG").value = P.g;
  $$(".phys-ctl").forEach(el => el.style.display = "none");
  $("#ctl-" + P.ex).style.display = "block";
  renderPhys();
}

/* ---------------- evenimente ---------------- */
/* taburi */
$$(".tab").forEach(t => t.addEventListener("click", () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  $$(".panel").forEach(p => p.classList.remove("active"));
  $("#tab-" + t.dataset.tab).classList.add("active");
  if (t.dataset.tab !== "animatii") pauseAnim();
  if (t.dataset.tab !== "fizica") physPause();
  beep(700);
  if (t.dataset.tab === "fizica") syncPhysUI();
}));

/* sliders teorie */
["A","B","C"].forEach(k => {
  const el = $("#sl" + k);
  el.addEventListener("input", () => {
    pauseAnim();
    const key = k.toLowerCase();
    let v = parseFloat(el.value);

    S[key] = v;
    renderTheory();
    beep(520);
  });
});
$$(".step[data-var]").forEach(b => b.addEventListener("click", () => {
  pauseAnim();
  const key = b.dataset.var;
  const step = key === "a" ? 0.05 : 0.1;
  let v = S[key] + step * parseFloat(b.dataset.d);
  const lim = {a:[-3,3], b:[-6,6], c:[-8,8]}[key];
  v = Math.min(lim[1], Math.max(lim[0], v));

  S[key] = v;
  renderTheory();
  beep(600);
}));
$$(".chip[data-preset]").forEach(ch => ch.addEventListener("click", () => {
  pauseAnim();
  const p = ch.dataset.preset.split(",").map(Number);
  S.a = p[0]; S.b = p[1]; S.c = p[2];
  renderTheory();
  beep(740);
}));

/* animație */
$("#btnPlay").addEventListener("click", () => anim.playing ? pauseAnim() : playAnim());
$("#btnRestart").addEventListener("click", restartAnim);
$$(".chip[data-anim]").forEach(ch => ch.addEventListener("click", () => {
  $$(".chip[data-anim]").forEach(x => x.classList.remove("active"));
  ch.classList.add("active");
  anim.type = ch.dataset.anim;
  anim.t = 0;
  $("#animLabel").textContent = ANIM_META[anim.type].label;
  $("#animExplain").innerHTML = ANIM_META[anim.type].explain.join("");
  applyAnimFrame(0);
  beep(720);
  if (!anim.playing) playAnim();
}));
$("#slSpeed").addEventListener("input", () => {
  anim.speed = parseFloat($("#slSpeed").value);
  $("#valSpeed").textContent = fmt(anim.speed,2) + "×";
  beep(540);
});
function setSpeed(delta){
  const el = $("#slSpeed");
  let v = Math.min(3, Math.max(0.25, parseFloat(el.value) + delta));
  el.value = v; anim.speed = v;
  $("#valSpeed").textContent = fmt(v,2) + "×";
  beep(540);
}
$("#spdDown").addEventListener("click", () => setSpeed(-0.25));
$("#spdUp").addEventListener("click", () => setSpeed(0.25));

/* fizică */
$$(".chip[data-phys]").forEach(ch => ch.addEventListener("click", () => {
  $$(".chip[data-phys]").forEach(x => x.classList.remove("active"));
  ch.classList.add("active");
  P.ex = ch.dataset.phys;
  P.t = 0;
  syncPhysUI();
  beep(720);
}));
$("#slV0").addEventListener("input", e => { P.v0 = parseFloat(e.target.value); syncPhysUI(); beep(520); });
$("#slTh").addEventListener("input", e => { P.th = parseFloat(e.target.value); syncPhysUI(); beep(520); });
$("#slH0").addEventListener("input", e => { P.h0 = parseFloat(e.target.value); syncPhysUI(); beep(520); });
$("#slVu").addEventListener("input", e => { P.vu = parseFloat(e.target.value); syncPhysUI(); beep(520); });
$("#slH").addEventListener("input",  e => { P.H  = parseFloat(e.target.value); syncPhysUI(); beep(520); });
$("#slG").addEventListener("input",  e => { P.g  = parseFloat(e.target.value); syncPhysUI(); beep(520); });
$$(".step[data-phys-var]").forEach(b => b.addEventListener("click", () => {
  const k = b.dataset.physVar, d = parseFloat(b.dataset.d);
  const limMap  = {v0:[5,60], th:[5,85], h0:[0,40], vu:[0,30], H:[5,150], g:[1.5,25]};
  let v = QuadraticModel.step(P[k],d,...limMap[k]);
  const lim = limMap[k];
  v = Math.min(lim[1], Math.max(lim[0], v));
  P[k] = v;
  syncPhysUI();
  beep(600);
}));
$("#btnPhysPlay").addEventListener("click", () => P.playing ? physPause() : physPlay());
$("#btnPhysReset").addEventListener("click", () => { P.t = 0; renderPhys(); beep(560); if (!P.playing) physPlay(); });

/* Common shell integration; the model state is never reset by presentation changes. */
function finishSVG(host){
 const svg=host.querySelector('svg');if(!svg)return;
 const available=host.getBoundingClientRect().width;if(available<=0)return;
 const textScale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
 if(textScale>1.5&&available<500){svg.style.width='640px';svg.style.minWidth='640px';}
 const width=svg.getBoundingClientRect().width;
 const scale=Math.max(1,Math.min(2.8,640/width))*textScale;
 if(scale>1.3){svg.setAttribute('viewBox','0 -18 640 490');for(const text of svg.querySelectorAll('text[font-size]')){text.setAttribute('font-size',Number(text.getAttribute('font-size'))*scale);if(Number(text.getAttribute('y'))===430)text.setAttribute('y',458);}}
 for(const element of svg.querySelectorAll('[fill],[stroke]'))for(const attribute of ['fill','stroke']){const value=element.getAttribute(attribute);if(value)element.setAttribute(attribute,PraxisScientificColors.color(value,PraxisCourseLocalization.colors));}
 for(const text of svg.querySelectorAll('text')){const box=text.getBBox();let shift=box.x<8?8-box.x:box.x+box.width>632?632-box.x-box.width:0;if(shift)text.setAttribute('x',Number(text.getAttribute('x'))+shift);}
}
const tabButtons=$$('.tabs [data-tab]');
// Exact coordinates remain in the adjacent readouts; compact graph markers
// stay distinct near a double root and when the text size is increased.
function rootMarkerLabel(index,x,y){
 const pair=roots().length===2,side=pair?(index===0?-1:1):0;
 const offset=20+30*(parseFloat(getComputedStyle(document.documentElement).fontSize)/16);
 return label(pair?(index===0?'x₁':'x₂'):'x₀',x+side*10,y+offset,'#a4462f',side<0?'end':side>0?'start':'middle');
}
function vertexMarkerLabel(V,x,y){return label('V',x+(V.h<0?-12:12),y<60?y+48:y-12,'#b5761d',V.h<0?'end':'start');}
function interceptMarkerLabel(V,x,y){return label('f(0)',x+(V.h<0?12:-12),y<60?y+48:y-10,'#1c5b3f',V.h<0?'start':'end',12);}
function pointMarkerLabel(V,x,y){return label('P',x+(V.h<0?12:-12),y-12,'#b5761d',V.h<0?'start':'end');}
function updateTabs(){for(const button of tabButtons){const active=button.classList.contains('active');button.id='quadratic-tab-'+button.dataset.tab;button.setAttribute('aria-selected',String(active));button.setAttribute('aria-controls','tab-'+button.dataset.tab);button.tabIndex=active?0:-1;const panel=$('#tab-'+button.dataset.tab);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);}}
for(const button of tabButtons){button.addEventListener('click',updateTabs);button.addEventListener('keydown',event=>{let index=tabButtons.indexOf(button);if(event.key==='ArrowRight')index=(index+1)%tabButtons.length;else if(event.key==='ArrowLeft')index=(index+tabButtons.length-1)%tabButtons.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabButtons.length-1;else return;event.preventDefault();tabButtons[index].click();tabButtons[index].focus();});}
updateTabs();
for(const panel of $$('.panel')){
 const readouts=panel.querySelector('.quadratic-readouts'),controls=panel.querySelector('.quadratic-controls');
 if(!controls||!readouts)continue;
 const tiles=controls.querySelector('.tiles');if(tiles)readouts.append(tiles);
 const equation=readouts.querySelector(':scope>.eq');
 if(equation){equation.classList.add('quadratic-equation');equation.tabIndex=0;panel.querySelector('.quadratic-scene-body').before(equation);}
 const hint=readouts.querySelector('.hint');if(hint){const details=document.createElement('details'),summary=document.createElement('summary');details.className='explain';summary.textContent='Interpretarea graficului';hint.before(details);details.append(summary,hint);}
 const formulas=controls.querySelector('.formulas'),explain=controls.querySelector('details.explain');if(formulas&&explain)explain.insertBefore(formulas,explain.querySelector('summary').nextSibling);
}
for(const range of $$('input[type=range]')){const heading=range.closest('.ctl').querySelector('.ctl-head>span');heading.id='label-'+range.id;range.setAttribute('aria-labelledby',heading.id);range.setAttribute('aria-label',heading.textContent);const row=range.closest('.ctl-row');row.querySelectorAll('button').forEach((button,index)=>button.setAttribute('aria-label',(index?'Crește ':'Scade ')+heading.textContent));}
function refreshSound(){const control=$('#optSound');control.checked=PraxisSound.enabled;}
for(const [id,key]of [['optGrid','grid'],['optRoots','roots'],['optVertex','vertex'],['optInter','inter']])$('#'+id).addEventListener('change',event=>{prefs[key]=event.target.checked;renderTheory();renderPhys();});
$('#optSound').addEventListener('change',event=>PraxisSound.setEnabled(event.target.checked,{persist:false}));
window.addEventListener('praxis-sound-change',refreshSound);refreshSound();
$('#btnResetPrefs').addEventListener('click',()=>{for(const [id,key]of [['optGrid','grid'],['optRoots','roots'],['optVertex','vertex'],['optInter','inter']]){prefs[key]=true;$('#'+id).checked=true;}renderTheory();renderPhys();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseAnim();physPause();}});
window.addEventListener('pagehide',()=>{pauseAnim();physPause();});
function refreshPresentation(){renderTheory();renderPhys();PraxisI18n.apply(document.body);}
window.addEventListener('praxis-language-change',refreshPresentation);
window.addEventListener('praxis-course-presentation-change',()=>{renderTheory();renderPhys();});
let resizeFrame=0;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{renderTheory();renderPhys();});});
window.addEventListener('load',()=>{
 const tools=document.querySelector('.praxis-course-tools'),preferences=$('#prefsPanel');
 const details=document.createElement('details'),summary=document.createElement('summary');details.className='quadratic-settings';summary.textContent='Repere pe grafic';details.append(summary,preferences);tools.append(details);
 document.querySelector('#btnPrefs')?.remove();document.querySelector('.tabbar')?.remove();
 for(const heading of $$('#praxis-original h2')){heading.dataset.contentType=heading.closest('#quadratic-practice')?'assessment':heading.closest('.theory-grid')?'theory':heading.closest('.examples')?'problem':heading.closest('.quadratic-controls')?'controls':'simulation';heading.querySelector('.ico')?.remove();}
 for(const host of $$('.formula-box,.formulas .f'))PraxisMath.set(host,host.textContent);
 const download=$('#btnDownload');download.href='functia-gradul-al-doilea.zip';download.setAttribute('download','functia-gradul-al-doilea.zip');
 if(document.documentElement.dataset.praxisStandalone==='true')download.hidden=true;
 refreshPresentation();
});

/* ---------------- inițializare ---------------- */
$("#animLabel").textContent = ANIM_META.a.label;
renderTheory();
initAnimReadouts();
syncPhysUI();
})();
