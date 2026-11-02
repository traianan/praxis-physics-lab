/* ===== demos.js — demonstrații interactive (canvas 2D + Sound) ===== */
'use strict';
const C = {
  accent: '#38bdf8', amber: '#fbbf24', green: '#34d399', red: '#f87171',
  violet: '#a78bfa', pink: '#f472b6', muted: '#526970', ink: '#253f46',
  grid: '#d5e0dc', axis: '#475569',
};

/* ---------- helpers desene ---------- */
function grid(ctx, w, h, step = 40) {
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke();
}
function hLine(ctx, x1, x2, y, color, dash = []) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.setLineDash([]);
}
function arrow(ctx, x1, y1, x2, y2, color, lw = 2.5) {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 8;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4));
  ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}
function spring(ctx, x1, y, x2, coils = 9, r = 9) {
  const L = x2 - x1, seg = L / (coils * 2 + 2);
  ctx.strokeStyle = C.muted; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + seg, y);
  for (let i = 0; i < coils * 2; i++) {
    ctx.lineTo(x1 + seg * (i + 2), y + (i % 2 ? r : -r));
  }
  ctx.lineTo(x2, y); ctx.stroke();
}
function label(ctx, txt, x, y, color = C.ink, size = 12, align = 'left') {
  ctx.fillStyle = color; ctx.font = `${Math.max(12,size)}px "Segoe UI", sans-serif`;
  ctx.textAlign = align; ctx.fillText(txt, x, y); ctx.textAlign = 'left';
}
function ball(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 5, x, y, r);
  g.addColorStop(0, '#ffffffcc'); g.addColorStop(0.25, color); g.addColorStop(1, '#00000088');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

/* =============================================================
 * 1) DEMO diapazon — „vizualizarea" sunetului 
 * ============================================================= */
App.register({
  id: 'demo-fork',
  reset(s) { s.strikeT = -10; },
  wire(shell, s) {
    s.strikeT = -10; s.auto = true;
    shell.querySelector('[data-act="strike"]').addEventListener('click', () => {
      s.strikeT = s.t; Sound.ensure(); Sound.pluckTuningFork(440);
    });
    shell.querySelector('[data-act="autopulse"]').addEventListener('change', e => { s.auto = e.target.checked; });
  },
  frame(s, dt) {
    if (s.auto && s.t - s.strikeT > 4.2) { s.strikeT = s.t; Sound.pluckTuningFork(440, 0.18); }
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 36);
    const mid = h / 2, t0 = s.t - s.strikeT;
    // axa timpului
    hLine(ctx, 10, w - 10, mid, C.axis);
    label(ctx, 'semnal înregistrat de „exploratorul sonic" — nota LA (440 Hz)', 14, 20, C.muted, 12);
    label(ctx, 't (s) →', w - 60, mid - 8, C.muted);
    // anvelopa A0 e^{-bt}, b mic 
    const b = 0.55, span = 4.2, px = (w - 60) / span;
    ctx.strokeStyle = C.amber; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const tt = i / 120 * span; const y = (h / 2 - 22) * Math.exp(-b * tt); if (i === 0) ctx.moveTo(50 + tt * px, mid - y); else ctx.lineTo(50 + tt * px, mid - y); }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const tt = i / 120 * span; const y = (h / 2 - 22) * Math.exp(-b * tt); if (i === 0) ctx.moveTo(50 + tt * px, mid + y); else ctx.lineTo(50 + tt * px, mid + y); }
    ctx.stroke(); ctx.setLineDash([]);
    // unda
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    ctx.beginPath();
    const amp = h / 2 - 22;
    const samples=Math.max(900,Math.ceil((w-60)*Math.max(1,Math.abs(ctx.getTransform?.()?.a||1))*2));
    for (let i = 0; i <= samples; i++) {
      const tt = i / samples * span;
      const env = t0 >= 0 ? Math.exp(-b * Math.max(0, tt)) : 0;
      // 440 Hz ar fi vizibil doar cu „pachete" de perioade — desenăm 60 osc/ds ca în registratoarele grafice
      const y = amp * env * Math.sin(2 * Math.PI * 14 * tt);
      const X = 50 + tt * px, Y = mid - y;
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // diapazon minimalist în colț
    const forkX = 24, forkY = h - 56, struck = (s.t - s.strikeT) < 1.2;
    ctx.strokeStyle = struck ? C.amber : C.muted; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(forkX, forkY + 34); ctx.lineTo(forkX, forkY + 12);
    const d = struck ? 3 * Math.sin(s.t * 14) : 0;
    ctx.moveTo(forkX - 7 + d, forkY - 18); ctx.lineTo(forkX - 7 + d, forkY + 12);
    ctx.moveTo(forkX + 7 - d, forkY - 18); ctx.lineTo(forkX + 7 - d, forkY + 12);
    ctx.moveTo(forkX - 10, forkY + 12); ctx.lineTo(forkX + 10, forkY + 12);
    ctx.stroke();
    if (s.ro) s.ro.textContent = t0 >= 0 && t0 < 6 ? `t = ${t0.toFixed(2)} s de la lovire · A = A₀·e^(−0,55·t)` : 'Apasă „Lovește diapazonul"';
  },
});

/* =============================================================
 * 2) DEMO exemple periodice (balansoar, pendul, coardă, seism)
 * ============================================================= */
App.register({
  id: 'demo-examples',
  wire(shell, s) {
    s.cells = [
      { name: 'balansoar', color: C.accent },
      { name: 'pendul', color: C.amber },
      { name: 'coarda chitarei (sunet!)', color: C.pink },
      { name: 'seism (teren)', color: C.green },
    ];
    shell.querySelector('canvas').addEventListener('click', (e) => {
      const r = e.target.getBoundingClientRect();
      const i = Math.min(3,Math.floor((e.clientY-r.top)/(r.height/4)));
      if (i === 2) Sound.beep(146.83, 0.9, 0.25, 'sawtooth');       // Re3 coardă
      else if (i === 3) Sound.beep(45, 0.5, 0.35, 'sine');           // f joasă seism
      else Sound.tick(0.15);
    });
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const cw = w / 4, t = s.t;
    s.cells.forEach((c, i) => {
      const cx = cw * i + cw / 2, base = h - 46;
      ctx.strokeStyle = C.axis;
      switch (i) {
        case 0: { // balansoar
          const th = 0.5 * Math.sin(t * 2.2);
          ctx.strokeStyle = c.color; ctx.lineWidth = 2;
          ctx.save(); ctx.translate(cx, 24); ctx.rotate(th);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 90); ctx.stroke();
          ctx.fillStyle = c.color; ctx.fillRect(-24, 90, 48, 8);
          ball(ctx, 0, 82, 8, c.color);
          ctx.restore();
          break;
        }
        case 1: { // pendul gravitațional
          const th = 0.6 * Math.sin(t * 2.6);
          ctx.save(); ctx.translate(cx, 18); ctx.rotate(th);
          ctx.strokeStyle = c.color; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.stroke();
          ball(ctx, 0, 110, 11, c.color);
          ctx.restore();
          hLine(ctx, cx - 46, cx + 46, 18, C.axis, [4, 4]);
          break;
        }
        case 2: { // coardă fixă la ambele capete — mod fundamental
          ctx.strokeStyle = c.color; ctx.lineWidth = 2.4;
          ctx.beginPath();
          for (let x = -cw / 2 + 12; x <= cw / 2 - 12; x += 3) {
            const u = (x + cw / 2 - 12) / (cw - 24);
            const y = 70 * Math.sin(t * 9) * Math.sin(Math.PI * u);
            if (x === -cw / 2 + 12) ctx.moveTo(cx + x, 70 + y); else ctx.lineTo(cx + x, 70 + y);
          }
          ctx.stroke();
          ctx.fillStyle = C.muted;
          ctx.fillRect(cx - cw / 2 + 8, 60, 5, 20); ctx.fillRect(cx + cw / 2 - 13, 60, 5, 20);
          break;
        }
        case 3: { // teren seism
          ctx.strokeStyle = c.color; ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = -cw / 2 + 10; x <= cw / 2 - 10; x += 4) {
            const u = (x + cw / 2) / cw;
            const y = 10 * Math.sin(t * 12 + u * 9);
            if (x === -cw / 2 + 10) ctx.moveTo(cx + x, base + y); else ctx.lineTo(cx + x, base + y);
          }
          ctx.stroke();
          // clădire
          const sh = 5 * Math.sin(t * 12);
          ctx.fillStyle = c.color + '55'; ctx.strokeStyle = c.color;
          ctx.fillRect(cx - 16 + sh, base - 58, 32, 58); ctx.strokeRect(cx - 16 + sh, base - 58, 32, 58);
          break;
        }
      }
      const words=PraxisI18n.tr(c.name).split(' ');let row='',line=0;for(const word of words){if(ctx.measureText(row+' '+word).width>cw-16&&row){label(ctx,row,cw*i+8,h-30+line*15,c.color,12);row=word;line++;}else row+=(row?' ':'')+word;}label(ctx,row,cw*i+8,h-30+line*15,c.color,12);
    });
    label(ctx, 'Toate sunt mișcări periodice — „sursă de oscilație"', 12, 16, C.muted, 11);
  },
});

/* =============================================================
 * 3) DEMO pendul : oscilație completă
 * ============================================================= */
App.register({
  id: 'demo-pendulum',
  reset(s) { s.N = 0; s.lastSign = 0; },
  wire(shell, s) { s.N = 0; s.lastSign = 0; },
  onParam(s, k) { if (k === 'L' || k === 'A') { s.t=0;s.N = 0; s.lastSign = 0; } },
  frame(s, dt) {
    const L = +s.sliders.L.value, A = +s.sliders.A.value * Math.PI / 180;
    const th = A * Math.cos(s.t * Math.sqrt(9.81 / L));   // model armonic (unghiuri mici)
    s.th = th;
    const sign = Math.cos(s.t * Math.sqrt(9.81 / L)) > 0 ? 1 : -1;
    s.N=Math.floor(s.t*Math.sqrt(9.81/L)/(2*Math.PI)+1e-9);
    s.lastSign = sign;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const L = +s.sliders.L.value, A = +s.sliders.A.value * Math.PI / 180;
    const px = 24, ox = w / 2, oy = 40, R = Math.min(204,(h - 90) * (L / 2.5 + 0.3));
    const th = s.th || 0;
    // tavan
    hLine(ctx, ox - R * 0.7, ox + R * 0.7, oy, C.axis);
    ctx.fillStyle = C.axis;
    for (let x = ox - R * 0.7; x < ox + R * 0.7; x += 12) { ctx.fillRect(x, oy - 6, 6, 6); }
    // axa de simetrie + puncte de întoarcere
    hLine(ctx, ox, ox, oy, C.axis, [3, 5]);
    const xL = ox + Math.sin(-A) * R, xRt = ox + Math.sin(A) * R, yy = oy + Math.cos(A) * R;
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(xL, yy); ctx.moveTo(ox, oy); ctx.lineTo(xRt, yy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = C.amber;
    [xL, xRt].forEach(x => ctx.strokeRect(x - 5, oy + Math.cos(A) * R - 5, 10, 10));
    label(ctx, 'puncte de întoarcere', ox, h - 14, C.amber, 11, 'center');
    // fir + Bila
    const bx = ox + Math.sin(th) * R, by = oy + Math.cos(th) * R;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.stroke();
    ball(ctx, bx, by, 15, C.accent);
    // forța de revenire Gt (tangentă la traiectorie, spre echilibru)
    const Gt = 60 * Math.sin(Math.abs(th)) / Math.max(0.15, A) * 0.5;
    const dir = th > 0 ? -1 : 1;
    if (Math.abs(th) > 0.01) {
      const tx = Math.cos(th) * dir, ty = -Math.sin(th) * dir;
      arrow(ctx, bx, by, bx + tx * Gt, by + ty * Gt, C.red, 3);
      label(ctx, 'Gt (forță de revenire)', 20, 278, C.red, 12);
    }
    // unghiul
    ctx.strokeStyle = C.violet; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ox, oy, 34, Math.PI / 2 - Math.max(th, 0), Math.PI / 2 - Math.min(th, 0)); ctx.stroke();
    label(ctx, `θ = ${(th * 180 / Math.PI).toFixed(1)}°`, ox + 40, oy + 44, C.violet, 11);
    if (s.ro) s.ro.textContent = `N = ${s.N} oscilații complete · T = ${(2 * Math.PI * Math.sqrt(L / 9.81)).toFixed(2)} s`;
  },
});

/* =============================================================
 * 4) DEMO mărimi caracteristice : A, T, ν + cronometru
 * ============================================================= */
App.register({
  id: 'demo-marimi',
  reset(s) { s.samples = []; s.N = 0; s.lastPhase = 0; },
  wire(shell, s) { s.samples = []; s.N = 0; s.lastPhaseCycle = -1; },
  onParam(s) { s.t=0;s.samples = []; s.N = 0; s.lastPhaseCycle = -1; },
  frame(s, dt) {
    const A = +s.sliders.A.value, T = +s.sliders.T.value;
    const y = A * Math.cos(2 * Math.PI * s.t / T);  // start din punct de întoarcere
    s.y = y;
    const cycle = Math.floor(s.t / T);
    if (cycle !== s.lastPhaseCycle) {
      if (s.lastPhaseCycle >= 0 && s.running && s.checks.sound && s.checks.sound.checked) Sound.tick(0.25);
      s.lastPhaseCycle = cycle; s.N = cycle;
    }
    if (!s.running) return;
    s.samples.push([s.t, y]);
    const span = Math.max(6, 4 * T);
    while (s.samples.length && s.samples[0][0] < s.t - span) s.samples.shift();
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = +s.sliders.A.value, T = +s.sliders.T.value;
    const span = Math.max(6, 4 * T);
    const midY = h / 2, pxs = (w - 90) / span;
    const ox = 70;
    // axa y (elongație)
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(34, 14); ctx.lineTo(34, h - 14); ctx.moveTo(14, midY); ctx.lineTo(w - 14, midY); ctx.stroke();
    label(ctx, 'x (m)', 40, 22, C.muted); label(ctx, 't (s)', w - 56, midY - 8, C.muted);
    // nivel ±A
    const yA = (h / 2 - 30);
    hLine(ctx, 34, w - 14, midY - yA, C.amber, [6, 4]);
    hLine(ctx, 34, w - 14, midY + yA, C.amber, [6, 4]);
    label(ctx, `+A = ${A.toFixed(2)} m`, 38, midY - yA - 4, C.amber, 11);
    label(ctx, `−A`, 38, midY + yA + 14, C.amber, 11);
    // marcaje T
    for (let k = Math.ceil((s.t - span) / T); k * T <= s.t; k++) {
      const X = ox + (k * T - (s.t - span)) * pxs;
      ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.moveTo(X, midY - 6); ctx.lineTo(X, midY + 6); ctx.stroke();
      if (k > 0 && (k === 1 || (k - 1) * T >= s.t - span)) {
        ctx.strokeStyle = C.violet; ctx.lineWidth = 1.2;
        arrow(ctx, ox + ((k - 1) * T - (s.t - span)) * pxs, midY + 34, X, midY + 34, C.violet, 1.2);
        label(ctx, 'T', (ox + ((k - 1) * T - (s.t - span)) * pxs + X) / 2 - 4, midY + 30, C.violet, 11);
      }
    }
    // bila pe axa verticală în stânga
    const yPix = (s.y || 0) * ((h / 2 - 30) / A);
    ball(ctx, 34, midY - yPix, 9, C.accent);
    // linie ghidaj până la grafic
    ctx.strokeStyle = C.accent + '44'; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(43, midY - yPix); ctx.lineTo(ox + (s.t - (s.t - span)) * pxs, midY - yPix); ctx.stroke();
    ctx.setLineDash([]);
    // curba
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath();
    let first = true;
    for (const [tt, yy] of s.samples) {
      const X = ox + (tt - (s.t - span)) * pxs, Y = midY - yy * ((h / 2 - 30) / A);
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // punct curent
    const cy = midY - (s.y || 0) * ((h / 2 - 30) / A);
    ball(ctx, ox + span * pxs, cy, 6, C.green);
    // puncte de întoarcere □
    ctx.strokeStyle = C.amber;
    ctx.strokeRect(ox + span * pxs - 4, midY - (h / 2 - 30) - 4, 8, 8);
    ctx.strokeRect(ox + span * pxs - 4, midY + (h / 2 - 30) - 4, 8, 8);
    if (s.ro) {
      const nu = s.N / Math.max(s.t, 1e-6);
      s.ro.textContent = `Δt = ${s.t.toFixed(1)} s · N = ${s.N} · ν = ${nu.toFixed(2)} Hz · 1/T = ${(1 / T).toFixed(2)} Hz`;
    }
  },
});

/* =============================================================
 * 5) DEMO amortizare : aer → apă → tranzitoriu → aperiodic
 * ============================================================= */
App.register({
 id:'demo-amort',
 reset(s){s.t=0;},
 wire(shell,s){s.regimeSelect=shell.querySelector('[data-sl="regim"]');const custom=document.createElement('option');custom.value='custom';custom.textContent='Personalizat';s.regimeSelect.append(custom);s.regimeSelect.addEventListener('change',()=>{const w0=2*Math.PI/+s.sliders.T.value,preset=s.regimeSelect.value;if(preset==='custom')return;s.presetCritical=preset==='tranzitoriu';const b=preset==='aer'?.08:preset==='apa'?.8:preset==='tranzitoriu'?w0:1.4*w0;s.sliders.b.value=b;s.sliders.b_fmt();s.t=0;});},
 onParam(s,key){s.t=0;if(key==='T'||key==='b'){s.regimeSelect.value='custom';s.presetCritical=false;}},
 render(ctx,w,h,s){
  const T0=+s.sliders.T.value,w0=2*Math.PI/T0,b=s.presetCritical?w0:+s.sliders.b.value,under=b<w0-1e-6,critical=Math.abs(b-w0)<1e-6,period=under?2*Math.PI/Math.sqrt(w0*w0-b*b):null;
  if(s.presetCritical){const out=document.querySelector('#demo-amort [data-val="b"]');if(out)out.textContent=b.toFixed(3);}s.sliders.b.setAttribute('aria-valuetext',b.toFixed(3)+' s⁻¹');
  const initialV=under?-b:0,value=t=>PraxisOscillatorModel.damped(t,w0,b,1,initialV),span=Math.max(8,6*T0),start=Math.max(0,s.t-span),end=start+span;
  const left=55,right=w-25,top=42,bottom=h-45,X=t=>left+(t-start)/span*(right-left),Y=x=>(top+bottom)/2-x*(bottom-top)/2.2;
  function line(x1,y1,x2,y2,color=C.grid){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  for(const y of [-1,0,1]){line(left,Y(y),right,Y(y));label(ctx,String(y),left-10,Y(y)+4,C.ink,12,'right');}
  for(let i=0;i<=4;i++){const t=start+i*span/4;line(X(t),top,X(t),bottom);label(ctx,t.toFixed(1),X(t),bottom+19,C.ink,12,'center');}
  line(left,top,left,bottom,C.axis);line(left,Y(0),right,Y(0),C.axis);label(ctx,'x / A₀',left,20,C.ink,12);label(ctx,'t (s)',right,bottom+38,C.ink,12,'right');
  const samples=Math.max(180,Math.ceil((right-left)*Math.max(1,Math.abs(ctx.getTransform?.()?.a||1))*2));
  if(under){ctx.setLineDash([5,4]);ctx.strokeStyle=C.amber;for(const sign of [-1,1]){ctx.beginPath();for(let i=0;i<=samples;i++){const t=start+i*span/samples,x=sign*Math.exp(-b*t);i?ctx.lineTo(X(t),Y(x)):ctx.moveTo(X(t),Y(x));}ctx.stroke();}ctx.setLineDash([]);}
  ctx.strokeStyle=C.accent;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=samples;i++){const t=start+(s.t-start)*i/samples;const p=value(t);i?ctx.lineTo(X(t),Y(p.x)):ctx.moveTo(X(t),Y(p.x));}ctx.stroke();const p=value(s.t);s.x=p.x;s.v=p.v;ball(ctx,X(s.t),Y(p.x),5,C.accent);
  const regime=critical?'critic amortizat':under?'oscilatoriu amortizat':'aperiodic (fără oscilații)';s.regime=regime;
  if(s.ro)s.ro.textContent=under?`T₀ = ${T0.toFixed(2)} s · T′ = ${period.toFixed(2)} s · τ = ${(1/b).toFixed(2)} s · D = ${(b*period).toFixed(3)} · N½ = ${(Math.log(2)/(b*period)).toFixed(2)} · regim: ${regime}`:`b = ${b.toFixed(2)} s⁻¹ · regim: ${regime} · T′, D și N½ nu sunt definite`;
 }
});


/* =============================================================
 * 6) DEMO oscilator mass-spring : F = -k y, T = 2π√(m/k)
 * ============================================================= */


/* =============================================================
 * 7) DEMO fazor : mișcare circulară uniformă → proiecție + sunet
 * ============================================================= */


/* =============================================================
 * 8) DEMO y, v, a (defazaje)
 * ============================================================= */
App.register({
  id: 'demo-yva',
  wire(shell, s) {
    ['y', 'v', 'a'].forEach(k => {
      const el = shell.querySelector(`[data-act="${k}"]`);
      if (el) { s['show' + k] = el.checked; el.addEventListener('change', () => { s['show' + k] = el.checked; }); }
    });
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = 1, w0 = 2, phi = +s.sliders.phi.value;
    const span = 10, ox = 40, pxs = (w - 60) / span;
    const rows = [
      { on: s.showy, f: t => A * Math.sin(w0 * t + phi), color: C.accent, name: `y(t) = A·sin(ωt+φ₀) [m]` },
      { on: s.showv, f: t => A * w0 * Math.cos(w0 * t + phi), color: C.green, name: `v(t) = Aω·cos(ωt+φ₀) [m/s]  (+π/2)` },
      { on: s.showa, f: t => -A * w0 * w0 * Math.sin(w0 * t + phi), color: C.red, name: `a(t) = −Aω²·sin(ωt+φ₀) [m/s²]  (+π)` },
    ];
    const rh = (h - 30) / 3;
    rows.forEach((r, i) => {
      const cy = 15 + rh * i + rh / 2;
      hLine(ctx, ox, ox + span * pxs, cy, C.axis);
      if (r.on) {
        ctx.strokeStyle = r.color; ctx.lineWidth = 2.2; ctx.beginPath();
        for (let j = 0; j <= 500; j++) {
          const tt = s.t - span + j / 500 * span;
          const X = ox + (j / 500) * span * pxs, Y = cy - r.f(tt) / (A * w0 * w0) * (rh / 2 - 6) * 2;
          if (j === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.stroke();
        // punct curent
        const Y0 = cy - r.f(s.t) / (A * w0 * w0) * (rh / 2 - 6) * 2;
        ball(ctx, ox + span * pxs, Y0, 5, r.color);
      }
      label(ctx, r.name, ox + 4, cy - rh / 2 + 12, r.color, 11);
    });
    // linie de timp comună
    ctx.strokeStyle = C.amber; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(ox + span * pxs, 12); ctx.lineTo(ox + span * pxs, h - 12); ctx.stroke(); ctx.setLineDash([]);
    if (s.ro) s.ro.textContent = `A = 1 m · ω = 2 rad/s · φ₀ = ${phi.toFixed(2)} rad · v_max = 2 m/s · a_max = 4 m/s²`;
  },
});

/* =============================================================
 * 9) DEMO pendul gravitațional: armonic vs real (sin θ)
 * ============================================================= */
App.register({
  id: 'demo-simple',
  reset(s) { s.th1 = 0; s.w1 = 0; s.th2 = 0; s.w2 = 0; s.init = false; s.pReal = null; s.tHalf=undefined; s.cross = 0; },
  wire(shell, s) { s.th1 = 0; s.th2 = 0; s.init = false; s.pReal = null; },
  onParam(s) { s.init = false; s.pReal = null; },
  frame(s, dt) {
    const L = +s.sliders.L.value, A0 = +s.sliders.A.value * Math.PI / 180;
    if (!s.init) { s.th1 = A0; s.w1 = 0; s.th2 = A0; s.w2 = 0; s.init = true; s.t0cross = null; s.pReal = null; }
    const n = 8;
    const hstep = dt / n;
    for (let i = 0; i < n; i++) {
      // armonic: θ̈ = -(g/L) θ
      s.w1 += -(9.81 / L) * s.th1 * hstep; s.th1 += s.w1 * hstep;
      // real: θ̈ = -(g/L) sin θ
      const prev = s.th2;
      s.w2 += -(9.81 / L) * Math.sin(s.th2) * hstep; s.th2 += s.w2 * hstep;
      // măsură perioadă reală: zero-crossing cu w<0 la jumătate de perioadă; folosim întoarcerile (w=0) la fel ca la bip
      if (prev * s.th2 < 0 && s.w2 > 0) {
        if (s.tHalf === undefined) { /* primul crossing ignorat */ }
        else if (s.t - s.tHalf > 0.2) {
          const half = s.t - s.tHalf;
          s.pReal = s.pReal === null ? half : 0.75 * s.pReal + 0.25 * half;
        }
        s.tHalf = s.t;
      }
    }
    // bip la final de oscilație (întoarcere la extrema pozitivă)
    if (s.checks.sound && s.checks.sound.checked && s.pReal !== null) {
      const c = Math.floor(s.t / s.pReal);
      if (c !== s.lastBeep && s.running) { s.lastBeep = c; Sound.tick(0.25); }
    }
    s.th2 = s.th2; s.th1 = s.th1;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const L = +s.sliders.L.value, A0 = +s.sliders.A.value * Math.PI / 180;
    const Tmic = 2 * Math.PI * Math.sqrt(L / 9.81);
    const R = 144 * Math.min(1, L / 1.4);
    const ox1 = w * 0.28, ox2 = w * 0.72, oy = 34;
    hLine(ctx, ox1 - R * 0.6, ox1 + R * 0.6, oy, C.axis);
    hLine(ctx, ox2 - R * 0.6, ox2 + R * 0.6, oy, C.axis);
    const drawP = (ox, th, color, name) => {
      const bx = ox + Math.sin(th) * R, by = oy + Math.cos(th) * R;
      ctx.strokeStyle = C.axis; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + R); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.stroke();
      ball(ctx, bx, by, 13, color);
      label(ctx, name, ox, h - 30, color, 12, 'center');
    };
    drawP(ox1, s.th1 || 0, C.accent, 'model armonic: sinθ ≈ θ');
    drawP(ox2, s.th2 || 0, C.amber, 'real: θ̈ = −(g/L)·sinθ');
    // pragul de 6°
    ctx.strokeStyle = C.violet; ctx.lineWidth = 1;
    [ox1, ox2].forEach(ox => {
      const lim = 6 * Math.PI / 180;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.sin(lim) * R, oy + Math.cos(lim) * R);
      ctx.moveTo(ox, oy); ctx.lineTo(ox - Math.sin(lim) * R, oy + Math.cos(lim) * R); ctx.stroke(); ctx.setLineDash([]);
    });
    label(ctx, 'zona „unghiuri mici” (θ < 6°)', ox1, h - 58, C.violet, 10, 'center');
    const A0deg = (+s.sliders.A.value);
    label(ctx, A0deg <= 6
      ? 'θ₀ ≤ 6°: cele două pendule rămân sincron — modelul armonic e valid'
      : 'θ₀ > 6°: pendulul real se retrage vizibil (perioada crește cu amplitudinea)', 14, 20, A0deg <= 6 ? C.green : C.pink, 12);
    if (s.ro) {
      const p = s.pReal !== null ? s.pReal : Tmic;
      const diff = ((p - Tmic) / Tmic * 100);
      s.ro.textContent = `T (mic) = ${Tmic.toFixed(2)} s · T real ≈ ${p.toFixed(2)} s · eroare ≈ ${diff >= 0.05 ? '+' + diff.toFixed(1) + '%' : '<0,1%'}`;
    }
  },
});

/* =============================================================
 * 10) DEMO energie: Ec ⇄ Ep, groapa de potențial
 * ============================================================= */
App.register({
  id: 'demo-energy',
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const m = 1, k = 20, A = 1, w0 = Math.sqrt(k / m);
    const t = s.t;
    const y = A * Math.cos(w0 * t), v = -A * w0 * Math.sin(w0 * t);
    const Ec = 0.5 * m * v * v, Ep = 0.5 * k * y * y, E = 0.5 * k * A * A;
    // stânga: groapa de energie potențială
    const gx = w * 0.06, gw = w * 0.44, gy = 30, gh = h - 70;
    ctx.strokeStyle = C.axis;
    ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    label(ctx, 'Ep = ½·k·y²  (groapa de potențial)', gx + 4, 18, C.muted, 11);
    const X0 = gx + gw / 2, ymax = 26;
    ctx.strokeStyle = C.violet; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const uu = -1.3 + i / 100 * 2.6;
      const X = X0 + uu * (gw / 3.2);
      const Y = gy + gh - (0.5 * k * (uu * A) ** 2 / E) * (gh - 20);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // bila în groapă
    const bX = X0 + (y / A) * (gw / 3.2), bY = gy + gh - Ep / E * (gh - 20) - 8;
    ball(ctx, bX, bY, 11, C.accent);
    // linia energiei totale
    hLine(ctx, gx, gx + gw, gy + gh - (gh - 20) - 8 + 8 - (gh - 20) + (gh - 20), 'transparent');
    ctx.strokeStyle = C.amber; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5;
    const Ey = gy + gh - 1 * (gh - 20) - 0; // E/E = 1
    ctx.beginPath(); ctx.moveTo(X0 - gw / 3.0, gy + 20); ctx.lineTo(X0 + gw / 3.0, gy + 20); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'E = ½kA² = const', X0 - 40, gy + 14, C.amber, 11);
    // markers ±A
    ctx.strokeStyle = C.axis;
    [-(gw / 3.2), (gw / 3.2)].forEach(dx => { ctx.beginPath(); ctx.moveTo(X0 + dx, gy + gh - 4); ctx.lineTo(X0 + dx, gy + gh + 4); ctx.stroke(); });
    label(ctx, '−A', X0 - gw / 3.2 - 8, gy + gh + 18, C.muted, 10);
    label(ctx, '+A', X0 + gw / 3.2 - 6, gy + gh + 18, C.muted, 10);
    // dreapta: bare Ec / Ep
    const bx = w * 0.6, bw = w * 0.12, bh = h - 80, by = 40;
    ctx.strokeStyle = C.axis; ctx.strokeRect(bx, by, bw, bh);
    const hEp = Ep / E * bh, hEc = Ec / E * bh;
    ctx.fillStyle = C.pink; ctx.fillRect(bx, by + bh - hEp, bw, hEp);
    ctx.fillStyle = C.green; ctx.fillRect(bx + bw + 18, by + bh - hEc, bw, hEc);
    ctx.strokeStyle = C.axis; ctx.strokeRect(bx + bw + 18, by, bw, bh);
    ctx.fillStyle = C.amber; ctx.fillRect(bx + 2 * bw + 44, by, bw / 2.4, bh);
    label(ctx, 'Ep', bx + bw / 2 - 8, by + bh + 18, C.pink, 12);
    label(ctx, 'Ec', bx + bw + 26, by + bh + 18, C.green, 12);
    label(ctx, 'E', bx + 2 * bw + 46, by + bh + 18, C.amber, 12);
    label(ctx, `Ep = ${Ep.toFixed(1)} J  ·  Ec = ${Ec.toFixed(1)} J  ·  E = ${E.toFixed(1)} J`, bx - 60, by - 10, C.ink, 12);
    // oscilator mini jos-dreapta
    const oy2 = by + bh + 44;
    const sx = w * 0.58, sw = w * 0.38;
    hLine(ctx, sx, sx + sw, oy2, C.axis);
    const px2 = sx + sw / 2 + (y / A) * sw / 2.2;
    spring(ctx, sx, oy2, px2 - 14, 8, 7);
    ctx.fillStyle = C.accent; ctx.fillRect(px2 - 14, oy2 - 12, 28, 24);
    if (s.ro) s.ro.textContent = `y = ${y.toFixed(2)} m · Ec = ${Ec.toFixed(1)} J · Ep = ${Ep.toFixed(1)} J · E = ${E.toFixed(0)} J`;
  },
});

/* =============================================================
 * 11) DEMO recapitulare Ex. * ============================================================= */
App.register({
  id: 'demo-ex42',
  wire(shell, s) {
    s.samples = []; s.playing = false;
    const btn = shell.querySelector('[data-act="strike"]');
    btn.addEventListener('click', () => {
      s.playing = true; s.t = 0; s.samples = []; s.lastTick = -1;
      Sound.ensure();
      btn.textContent = '▶ în curs…';
      setTimeout(() => { btn.textContent = '▶ Redă mișcarea + sunet la fiecare trecere prin echilibru'; }, 4200);
    });
  },
  frame(s, dt) {
    if (!s.playing) return;
    const w0 = 4, A = 0.1; // y = 0,1 cos(4t)
    const y = A * Math.cos(w0 * s.t);
    s.y = y;
    s.samples.push([s.t, y]);
    if (s.t > 4.2) s.playing = false;
    const cross = Math.floor((w0 * s.t + Math.PI / 2) / Math.PI);
    if (cross !== s.lastTick && s.lastTick >= 0) Sound.tick(0.3);
    s.lastTick = cross;
  },
  render(ctx, w, h, s) {
    grid(ctx, w, h, 40);
    const A = 0.1, w0 = 4;
    const y = s.playing ? (s.y || 0) : A;
    const cy = 60, eq = w * 0.24, scale = (w * 0.32) / A * 0.55;
    // perete + resort + corp
    ctx.fillStyle = C.axis; ctx.fillRect(34, cy - 46, 10, 92);
    const bx = eq + y * scale;
    spring(ctx, 44, cy, bx - 18, 9, 11);
    ctx.fillStyle = C.accent; ctx.fillRect(bx - 18, cy - 18, 36, 36);
    label(ctx, 'm = 0,5 kg', bx - 18, cy + 34, C.ink, 11);
    hLine(ctx, 30, w * 0.42, cy + 20, C.axis);
    ctx.strokeStyle = C.violet; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(eq, cy - 26); ctx.lineTo(eq, cy + 46); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'echilibru', eq - 24, cy + 46, C.violet, 10);
    ctx.strokeStyle = C.amber;
    ctx.strokeRect(eq + A * scale - 4, cy - 30, 8, 8);
    label(ctx, 'y₀ = 10 cm (punct de întoarcere)', eq + A * scale - 60, cy - 38, C.amber, 11);
    // grafic
    const gx = w * 0.46, gw = w - gx - 14, gy = 24, gh = h - 60;
    ctx.strokeStyle = C.axis; ctx.strokeRect(gx, gy, gw, gh);
    hLine(ctx, gx, gx + gw, gy + gh / 2, C.grid);
    label(ctx, 'y(t) = 0,1·cos(4t) m', gx + 6, gy + 16, C.muted, 11);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath();
    let first = true;
    for (const [tt, yy] of s.samples) {
      const X = gx + (tt / 4.2) * gw, Y = gy + gh / 2 - (yy / A) * (gh / 2 - 8);
      if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // marcaje v_max
    if (s.ro) s.ro.textContent = s.playing
      ? `t = ${s.t.toFixed(2)} s · y = ${(y * 100).toFixed(1)} cm · ω = 4 rad/s`
      : 'Apasă ▶ — y(t) = 0,1·cos(4t) m, v_max = 0,4 m/s';
  },
});

/* Analytic spring and phasor views. Mechanism and plot have disjoint bounds. */
(()=>{
 const tr=s=>PraxisI18n.tr(s),TAU=2*Math.PI;
 function readout(s,text){s.ro.dataset.noI18n='';const value=tr(text);if(s.ro.textContent!==value)s.ro.textContent=value;}
 function line(g,x1,y1,x2,y2,color=C.axis,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
 function panel(g,b){g.strokeStyle=C.grid;g.lineWidth=1;g.strokeRect(b.x,b.y,b.w,b.h);}
 const layout={mechanism:{x:16,y:18,w:270,h:270},plot:{x:310,y:18,w:314,h:270}};
 function chart(g,s,A,w,phase,kind,maxA){
  const left=352,right=610,top=66,bottom=230,mid=148,scale=80/maxA,T=TAU/w,span=2*T,start=Math.max(0,s.t-span),end=start+span;
  const X=t=>left+(t-start)/span*(right-left),Y=y=>mid-y*scale;
  panel(g,layout.plot);label(g,'y (m)',left,38,C.ink,12);label(g,'t (s)',right,278,C.ink,12,'right');
  for(const y of [-maxA,0,maxA]){line(g,left,Y(y),right,Y(y),C.grid);label(g,y.toFixed(1),left-9,Y(y)+4,C.ink,12,'right');}
  for(let i=0;i<=2;i++){const t=start+i*span/2;line(g,X(t),top,X(t),bottom,C.grid);label(g,t.toFixed(2),X(t),253,C.ink,12,i===0?'left':i===2?'right':'center');}
  line(g,left,mid,right,mid,C.axis);line(g,left,top,left,bottom,C.axis);
  const from=Math.max(start,s.segmentStart||0),to=s.t,fun=p=>kind==='cos'?Math.cos(p):Math.sin(p);g.save();g.beginPath();g.rect(left-1,top-1,right-left+2,bottom-top+2);g.clip();g.strokeStyle=C.accent;g.lineWidth=2.2;g.beginPath();
  const samples=Math.max(240,Math.ceil((right-left)*Math.max(1,Math.abs(g.getTransform?.()?.a||1))*2));
  for(let i=0;i<=samples;i++){const t=from+(to-from)*i/samples,y=A*fun(phase+w*(t-s.t));i?g.lineTo(X(t),Y(y)):g.moveTo(X(t),Y(y));}g.stroke();g.restore();
  const y=A*fun(phase);ball(g,X(s.t),Y(y),4.5,C.green);return {x:X(s.t),y:Y(y),value:y};
 }
 function prepare(shell,s){s.phase=0;s.segmentStart=0;s.lastCross=0;if(s.ro)s.ro.dataset.noI18n='';}
 function reset(s){s.phase=0;s.segmentStart=0;s.lastCross=0;s.t=0;Sound.setTone('phasor',false,0);}
 App.register({id:'demo-oscillator',wire:prepare,reset,onParam(s,key){if(key!=='speed')reset(s);},frame(s){const w=Math.sqrt(+s.sliders.k.value/+s.sliders.m.value);s.phase=w*s.t;const cross=Math.floor((s.phase+Math.PI/2)/Math.PI);if(s.lastCross!==undefined&&cross!==s.lastCross&&s.checks.sound?.checked)Sound.tick(.1);s.lastCross=cross;},
 render(g,w,h,s){const k=+s.sliders.k.value,m=+s.sliders.m.value,A=+s.sliders.A.value,omega=Math.sqrt(k/m),phase=omega*s.t,y=A*Math.cos(phase),F=-k*y;
  panel(g,layout.mechanism);label(g,tr('oscilator'),28,38,C.ink,12);label(g,'F = '+F.toFixed(2)+' N',28,67,C.red,12);
  const eq=170,cy=155,bx=eq+y*56,half=16;
  g.save();g.beginPath();g.rect(18,85,266,150);g.clip();g.fillStyle=C.axis;g.fillRect(38,104,8,88);spring(g,46,cy,bx-half,8,8);g.fillStyle=C.accent;g.fillRect(bx-half,cy-half,half*2,half*2);g.strokeStyle=C.axis;g.strokeRect(bx-half,cy-half,half*2,half*2);label(g,'m',bx,cy+4,C.ink,12,'center');
  line(g,30,190,274,190,C.axis,2);g.setLineDash([3,4]);line(g,eq,195,eq,233,C.violet);g.setLineDash([]);line(g,35,222,272,222,C.axis);line(g,bx,195,bx,227,C.green);
  if(Math.abs(F)>.01){const length=Math.sign(F)*Math.min(60,Math.abs(F)*.7);arrow(g,bx,105,bx+length,105,C.red,2.5);}g.restore();
  label(g,tr('O (echilibru)'),eq,246,C.violet,12,'center');label(g,'y = '+y.toFixed(3)+' m',28,276,C.ink,12);
  chart(g,s,A,omega,phase,'cos',1.2);s.y=y;s.w=omega;s.force=F;s.bodyBox={x:bx-half,y:cy-half,w:half*2,h:half*2};
  readout(s,`ω = ${omega.toFixed(3)} rad/s · T = ${(TAU/omega).toFixed(3)} s · ν = ${(omega/TAU).toFixed(3)} Hz`);
 }});
 App.register({id:'demo-phasor',wire:prepare,reset,onParam(s,key){if(key!=='speed')reset(s);},onCheck(s,key,checked){if(key==='sound'&&!checked)Sound.setTone('phasor',false,0);},frame(s){const omega=+s.sliders.w.value;s.phase=omega*s.t+(+s.sliders.phi.value);if(s.checks.sound?.checked)Sound.setTone('phasor',true,Math.max(80,omega/TAU*80),.025);else Sound.setTone('phasor',false,0);},
 render(g,w,h,s){const A=+s.sliders.A.value,omega=+s.sliders.w.value,phi=+s.sliders.phi.value,phase=omega*s.t+phi,angle=((phase%TAU)+TAU)%TAU,cx=145,cy=148,R=80,r=A*40,px=cx+r*Math.cos(angle),py=cy-r*Math.sin(angle);
  panel(g,layout.mechanism);label(g,'Oy',cx+8,38,C.ink,12);
  g.save();g.beginPath();g.rect(18,45,266,210);g.clip();g.strokeStyle=C.grid;g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();arrow(g,45,cy,253,cy,C.axis,1);arrow(g,cx,248,cx,48,C.axis,1);label(g,'Ox',250,cy+30,C.ink,12,'right');
  arrow(g,cx,cy,px,py,C.pink,2.5);g.setLineDash([3,4]);line(g,px,py,cx,py,C.violet);g.setLineDash([]);ball(g,px,py,5,C.pink);ball(g,cx,py,4,C.violet);
  label(g,'P',px+(Math.cos(angle)>=0?11:-11),py+(Math.sin(angle)>=0?-11:19),C.ink,12,Math.cos(angle)>=0?'left':'right');label(g,'Q',cx-12,py+4,C.ink,12,'right');g.strokeStyle=C.amber;g.beginPath();g.arc(cx,cy,20,0,-angle,true);g.stroke();g.restore();
  label(g,'φ = '+angle.toFixed(2)+' rad',28,274,C.ink,12);chart(g,s,A,omega,phase,'sin',2);s.y=A*Math.sin(phase);s.ph=phase;s.point={x:px,y:py};s.projection={x:cx,y:py};
  readout(s,`A = ${A.toFixed(2)} m · ω = ${omega.toFixed(2)} rad/s · ν = ${(omega/TAU).toFixed(3)} Hz · T = ${(TAU/omega).toFixed(3)} s`);
 }});
 window.PraxisOscillatorViews={layout};
})();

/* Layout corrections applied after registering the preserved source demonstrations. */
(()=>{
 const spec=id=>App.demos.find(d=>d.shell.id===id).spec;
 const text=(g,t,x,y,c=C.ink,align='left')=>label(g,t,x,y,c,12,align);
 const info=(s,t)=>{s.ro.dataset.noI18n='';t=PraxisI18n.tr(t);if(s.ro.textContent!==t)s.ro.textContent=t;};
 const pendulum=spec('demo-pendulum');
 pendulum.render=(g,w,h,s)=>{
  const L=+s.sliders.L.value,A=+s.sliders.A.value*Math.PI/180,omega=Math.sqrt(9.81/L),theta=s.th??A,cx=w/2,py=35,R=Math.min(190,(h-105)*(L/2.5+.3));
  const left={x:cx-R*Math.sin(A),y:py+R*Math.cos(A)},right={x:cx+R*Math.sin(A),y:left.y},equilibrium={x:cx,y:py+R};
  s.turningPoints={left,right,angle:A,radius:R};
  const phase=omega*s.t,vmax=L*A*omega,sine=Math.sin(phase),speed=Math.abs(sine)<1e-10?0:vmax*Math.abs(sine);
  s.equilibrium={...equilibrium,speed,vmax};
  hLine(g,cx-90,cx+90,py,C.axis);
  g.strokeStyle=C.grid;g.lineWidth=2;g.beginPath();g.arc(cx,py,R,Math.PI/2-A,Math.PI/2+A);g.stroke();
  g.strokeStyle=C.green;g.lineWidth=2.5;g.beginPath();g.arc(cx,equilibrium.y,7,0,2*Math.PI);g.stroke();
  const bx=cx+R*Math.sin(theta),by=py+R*Math.cos(theta);
  lineSegment(g,cx,py,bx,by,C.ink,2);polishedBall(g,bx,by,11,C.accent);
  for(const [name,p,side] of [['A',left,-1],['B',right,1]]){
   g.fillStyle='#fff';g.strokeStyle=C.amber;g.lineWidth=2.5;g.beginPath();g.arc(p.x,p.y,6,0,2*Math.PI);g.fill();g.stroke();
   label(g,name,p.x+side*19,p.y-13,C.ink,14,'center');
  }
  label(g,'E',cx,equilibrium.y+25,C.green,14,'center');
  const dir=-Math.sign(Math.sin(omega*s.t)),length=45*speed/Math.max(vmax,1e-9);
  s.velocityVector={x:bx,y:by,endX:bx+dir*Math.cos(theta)*length,endY:by-dir*Math.sin(theta)*length,speed,angularVelocity:-A*omega*sine};
  text(g,'θ = '+(theta*180/Math.PI).toFixed(1)+'°',26,65,C.ink);
  text(g,'v = '+speed.toFixed(3)+' m/s',26,87,C.green);
  text(g,'v_max = '+vmax.toFixed(3)+' m/s',26,109,C.green);
  const forceDir=theta>0?-1:1,forceLength=34*Math.sin(Math.abs(theta))/Math.max(.15,A),fx=bx+forceDir*Math.cos(theta)*forceLength,fy=by-forceDir*Math.sin(theta)*forceLength;
  s.forceVector={x:bx,y:by,endX:fx,endY:fy};
  // Collinear vectors retain the same origin: a fine dashed shaft/open head for force,
  // and a narrower solid shaft/filled head for velocity, with labels on opposite sides.
  if(Math.abs(theta)>.001&&s.showForce!==false){
   g.save();g.strokeStyle=C.red;g.lineWidth=2.8;g.setLineDash([5,4]);g.beginPath();g.moveTo(bx,by);g.lineTo(fx,fy);g.stroke();g.setLineDash([]);g.lineWidth=2;
   const a=Math.atan2(fy-by,fx-bx);g.beginPath();g.moveTo(fx-9*Math.cos(a-.55),fy-9*Math.sin(a-.55));g.lineTo(fx,fy);g.lineTo(fx-9*Math.cos(a+.55),fy-9*Math.sin(a+.55));g.stroke();g.restore();

  }
  if(length>1&&s.showVelocity!==false){arrow(g,bx,by,s.velocityVector.endX,s.velocityVector.endY,C.green,2.1);label(g,'v',s.velocityVector.endX-Math.sin(theta)*16,s.velocityVector.endY-Math.cos(theta)*16,C.green,12,'center');}
  label(g,'Gt — '+PraxisI18n.tr('Forță: roșu întrerupt, vârf deschis'),w-26,65,C.ink,12,'right');
  label(g,PraxisI18n.tr('Viteză: verde continuu, vârf plin'),w-26,87,C.ink,12,'right');
  label(g,PraxisI18n.tr('Ambii vectori pornesc din centrul bilei.'),cx,282,C.ink,12,'center');
  label(g,PraxisI18n.tr('Lungimile lor folosesc scări diferite.'),cx,305,C.muted,12,'center');
  info(s,`N = ${s.N} oscilații complete · T = ${(2*Math.PI*Math.sqrt(L/9.81)).toFixed(2)} s`);
 };
 const pendulumView=App.demos.find(d=>d.shell.id==='demo-pendulum');
 if(pendulumView.shell.querySelectorAll){
  const {shell,state}=pendulumView;
  for(const button of shell.querySelectorAll('[data-pendulum-phase]'))button.addEventListener('click',()=>{
   const omega=Math.sqrt(9.81/+state.sliders.L.value);state.t=+button.dataset.pendulumPhase/omega;state.running=false;pendulum.frame(state,0);state.last=0;
   shell.querySelector('[data-act="startpause"]').textContent=PraxisI18n.tr('▶ Redă');
   for(const b of shell.querySelectorAll('[data-pendulum-phase]'))b.setAttribute('aria-pressed',String(b===button));
  });
  const clearSelection=()=>{for(const b of shell.querySelectorAll('[data-pendulum-phase]'))b.setAttribute('aria-pressed','false');};
  shell.querySelector('[data-act="startpause"]').addEventListener('click',clearSelection);shell.addEventListener('input',e=>{if(e.target.type==='range')clearSelection();});
  for(const input of shell.querySelectorAll('[data-pendulum-vector]'))input.addEventListener('change',()=>{state[input.dataset.pendulumVector]=input.checked;});
 }
 // Four compact rows share one vertical centreline; labels never enter the motion area.
 const examples=spec('demo-examples');
 examples.render=(g,w,h,s)=>{
  const compact=w<500,row=h/4,cx=compact?w/2:430,offset=compact?44:0,t=s.t,colors=[C.accent,C.amber,C.pink,C.green];
  const names=['balansoar','pendul','coarda chitarei (sunet!)','seism (teren)'];
  const notes=['mișcare pendulară','oscilație gravitațională','vibrație transversală','oscilația terenului'];
  s.exampleBands=[];
  for(let i=0;i<4;i++){
   const y=i*row,color=colors[i];s.exampleBands.push({top:y,bottom:y+row,centreX:cx});
   g.save();g.beginPath();g.rect(0,y,w,row);g.clip();
   g.fillStyle=i%2?'#f0f5f3':'#f8faf9';g.fillRect(0,y,w,row);hLine(g,14,w-14,y+row-.5,C.grid);
   label(g,PraxisI18n.tr(names[i]),compact?cx:20,y+(compact?19:25),C.ink,12,compact?'center':'left');label(g,PraxisI18n.tr(notes[i]),compact?cx:20,y+(compact?37:46),C.muted,12,compact?'center':'left');
   g.lineCap='round';g.lineJoin='round';
   if(i<2){
    const a=(i===0?.45:.55)*Math.sin(t*(i===0?2.2:2.6)),L=37,py=y+10+offset;
    hLine(g,cx-25,cx+25,py,C.axis);
    g.strokeStyle=C.grid;g.setLineDash([2,3]);g.beginPath();g.arc(cx,py,L,Math.PI/2-.6,Math.PI/2+.6);g.stroke();g.setLineDash([]);
    const bx=cx+L*Math.sin(a),by=py+L*Math.cos(a);
    if(i===0){lineSegment(g,cx-8,py,bx-8,by,color,2);lineSegment(g,cx+8,py,bx+8,by,color,2);g.save();g.translate(bx,by+5);g.rotate(-a);g.fillStyle=color;g.fillRect(-16,-3,32,6);g.restore();}
    else lineSegment(g,cx,py,bx,by,color,2.3);
    polishedBall(g,bx,by,i===0?6:8,color);
   }else if(i===2){
    const left=compact?35:300,right=compact?w-35:560,mid=y+34+offset;g.strokeStyle=color;g.lineWidth=2.2;g.beginPath();
    for(let j=0;j<=200;j++){const u=j/200,x=left+u*(right-left),v=mid+13*Math.sin(t*9)*Math.sin(Math.PI*u);j?g.lineTo(x,v):g.moveTo(x,v);}g.stroke();
    lineSegment(g,left,mid-12,left,mid+12,C.axis,4);lineSegment(g,right,mid-12,right,mid+12,C.axis,4);
   }else{
    const base=y+56+offset,shift=4*Math.sin(t*6),lift=2*Math.sin(t*6);g.strokeStyle=color;g.lineWidth=2;g.beginPath();
    for(let j=0;j<=100;j++){const x=(compact?35:300)+j*(compact?(w-70)/100:2.6),v=base+2*Math.sin(t*6+(x-cx)*.025);j?g.lineTo(x,v):g.moveTo(x,v);}g.stroke();
    const x=cx-16+shift,by=base+lift;g.fillStyle=color+'33';g.fillRect(x,by-34,32,34);g.strokeRect(x,by-34,32,34);
    for(let r=0;r<2;r++)for(let c=0;c<2;c++){g.fillStyle=color;g.fillRect(x+6+c*14,by-27+r*13,5,6);}
   }
   g.restore();
  }
 };
 function lineSegment(g,x,y,X,Y,color,width){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();}
 function polishedBall(g,x,y,r,color){const fill=g.createRadialGradient(x-r*.3,y-r*.35,.5,x,y,r);fill.addColorStop(0,'#ffffff');fill.addColorStop(.4,color);fill.addColorStop(1,color);g.fillStyle=fill;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.strokeStyle=C.ink+'66';g.lineWidth=.8;g.stroke();}
 function curve(g,{left=62,right=610,top,bottom,mid,max,start,span,fn,color,end=start+span}){
  const X=t=>left+(t-start)/span*(right-left),Y=v=>mid-v/max*(bottom-top)/2;
  hLine(g,left,right,mid,C.axis);g.save();g.beginPath();g.rect(left,top,right-left,bottom-top);g.clip();g.strokeStyle=color;g.lineWidth=2;g.beginPath();
  const samples=Math.max(360,Math.ceil((right-left)*Math.max(1,Math.abs(g.getTransform?.()?.a||1))*2));
  for(let i=0;i<=samples;i++){const t=start+(end-start)*i/samples;i?g.lineTo(X(t),Y(fn(t))):g.moveTo(X(t),Y(fn(t)));}g.stroke();g.restore();
  ball(g,X(end),Y(fn(end)),3.5,color);
  return {X,Y};
 }
 const yva=spec('demo-yva');
 yva.renderAdditional=(shell,s,fit)=>{const canvas=shell.querySelector('#cv-yva-phasors');if(!canvas)return;const {ctx,w,h}=fit(canvas);ctx.clearRect(0,0,w,h);yva.renderPhasors(ctx,w,h,s);};
 yva.renderPhasors=(g,w,h,s)=>{
  const phase=2*s.t+ +s.sliders.phi.value,cx=182,cy=164,scale=26.5,outerRadius=4*scale;
  text(g,PraxisI18n.tr('Fazori: module maxime'),22,24);text(g,'ω = 2 rad/s   ↺',22,46);
  lineSegment(g,cx-outerRadius-18,cy,cx+outerRadius+18,cy,C.axis,1);lineSegment(g,cx,cy-outerRadius-18,cx,cy+outerRadius+18,C.axis,1);
  text(g,'O',cx-15,cy+16);
  // Positive mathematical angles require inverted canvas y coordinates.
  s.phasors=[['y',1,C.accent,'m'],['v',2,C.green,'m/s'],['a',4,C.red,'m/s²']].map(([key,max,color,unit],i)=>{
   const radius=max*scale,angle=phase+i*Math.PI/2,endX=cx+radius*Math.cos(angle),endY=cy-radius*Math.sin(angle),visible=!!s['show'+key],value=max*Math.sin(angle);
   if(visible){
    g.save();g.strokeStyle=color;g.lineWidth=1;g.setLineDash([3,4]);g.beginPath();g.arc(cx,cy,radius,0,2*Math.PI);g.stroke();g.restore();
    lineSegment(g,cx,cy,endX,endY,color,2.5);
    const dx=Math.cos(angle),dy=-Math.sin(angle);g.fillStyle=color;g.beginPath();g.moveTo(endX,endY);g.lineTo(endX-11*dx+5*dy,endY-11*dy-5*dx);g.lineTo(endX-11*dx-5*dy,endY-11*dy+5*dx);g.closePath();g.fill();
    ball(g,endX,endY,3,color);
   }
   const row=84+i*66;text(g,`${key}_max = ${max} ${unit}  ·  `+['φ','φ + π/2','φ + π'][i],350,row,color);
   text(g,visible?`${key} = ${value.toFixed(2)} ${unit}`:PraxisI18n.tr('Ascuns'),350,row+20,visible?color:C.ink);
   return {key,x:cx,y:cy,endX,endY,radius,magnitude:max,angle,value,visible};
  });
  ball(g,cx,cy,3,C.ink);text(g,'φ = ωt + φ₀',350,286);text(g,`t = ${s.t.toFixed(2)} s`,22,308);
 };
 yva.render=(g,w,h,s)=>{
  const phi=+s.sliders.phi.value,span=3*Math.PI,start=s.t-span;
  const rows=[['y',1,'y (m)',C.accent,t=>Math.sin(2*t+phi)],['v',2,'v (m/s)',C.green,t=>2*Math.cos(2*t+phi)],['a',4,'a (m/s²)',C.red,t=>-4*Math.sin(2*t+phi)]];
  s.plotBands=[];
  rows.forEach(([key,max,title,color,fn],i)=>{const top=30+i*94,bottom=top+54,mid=(top+bottom)/2;
   g.strokeStyle=C.grid;g.strokeRect(8,8+i*94,624,90);text(g,title,62,23+i*94,color);
   for(const v of [-max,0,max])text(g,String(v),52,mid-v/max*27+4,C.ink,'right');
   if(s['show'+key])curve(g,{top,bottom,mid,max,start,span,fn,color});else hLine(g,62,610,mid,C.axis);
   s.plotBands.push({top,bottom,mid,max});
  });
  for(let i=0;i<4;i++)text(g,(start+span*i/3).toFixed(1),62+548*i/3,305,C.ink,i===0?'left':i===3?'right':'center');
  text(g,'t (s)',610,319,C.ink,'right');
  info(s,`A = 1 m · ω = 2 rad/s · φ₀ = ${phi.toFixed(2)} rad · v_max = 2 m/s · a_max = 4 m/s²`);
 };
 const quantities=spec('demo-marimi');
 quantities.frame=(s)=>{const T=+s.sliders.T.value;s.y=+s.sliders.A.value*Math.cos(2*Math.PI*s.t/T);s.N=Math.floor(s.t/T);if(s.N!==s.lastPhaseCycle&&s.lastPhaseCycle>=0&&s.checks.sound?.checked)Sound.tick(.1);s.lastPhaseCycle=s.N;};
 quantities.render=(g,w,h,s)=>{const A=+s.sliders.A.value,T=+s.sliders.T.value,span=3*T,start=Math.max(0,s.t-span),mid=156,top=65,bottom=247;
  text(g,'y (m)',62,23);text(g,'t (s)',610,302,C.ink,'right');
  for(const v of [-A,0,A]){const y=mid-v/A*91;hLine(g,62,610,y,C.grid);text(g,v.toFixed(2),52,y+4,C.ink,'right');}
  curve(g,{top,bottom,mid,max:A,start,span,end:s.t,fn:t=>A*Math.cos(2*Math.PI*t/T),color:C.accent});
  for(let i=0;i<=3;i++)text(g,(start+i*T).toFixed(2),62+i*548/3,275,C.ink,i===0?'left':i===3?'right':'center');
  text(g,`A = ${A.toFixed(2)} m     T = ${T.toFixed(2)} s`,62,44,C.ink);
  info(s,`Δt = ${s.t.toFixed(1)} s · N = ${s.N} · ν = ${(s.N/Math.max(s.t,1e-6)).toFixed(2)} Hz · 1/T = ${(1/T).toFixed(2)} Hz`);
 };
 const energy=spec('demo-energy');
 energy.render=(g,w,h,s)=>{const y=Math.cos(Math.sqrt(20)*s.t),Ep=10*y*y,Ec=10-Ep;
  text(g,'Ep = ½ky² (J)',32,24,C.violet);text(g,'E = 10 J',32,45,C.amber);
  const X=y=>164+y*90,Y=e=>244-e*15;
  hLine(g,38,290,244,C.axis);text(g,'y (m)',290,281,C.ink,'right');
  const samples=Math.max(180,Math.ceil(256*Math.max(1,Math.abs(g.getTransform?.()?.a||1))*2));
  g.save();g.beginPath();g.rect(36,62,256,184);g.clip();g.strokeStyle=C.violet;g.lineWidth=2;g.beginPath();for(let i=0;i<=samples;i++){const x=-1.4+i*2.8/samples;i?g.lineTo(X(x),Y(10*x*x)):g.moveTo(X(x),Y(10*x*x));}g.stroke();g.restore();
  hLine(g,44,284,Y(10),C.amber,[5,4]);ball(g,X(y),Y(Ep),7,C.accent);
  for(const v of [-1,0,1])text(g,String(v),X(v),264,C.ink,'center');
  for(const [i,name,value,color] of [[0,'Ep',Ep,C.pink],[1,'Ec',Ec,C.green],[2,'E',10,C.amber]]){const x=350+i*90;g.strokeStyle=C.grid;g.strokeRect(x,70,52,174);g.fillStyle=color;g.fillRect(x,244-value*17.4,52,value*17.4);text(g,name,x+26,266,color,'center');text(g,value.toFixed(1)+' J',x+26,49,C.ink,'center');}
  info(s,`y = ${y.toFixed(2)} m · Ec = ${Ec.toFixed(1)} J · Ep = ${Ep.toFixed(1)} J · E = 10 J`);
 };
 const recap=spec('demo-ex42');
 recap.frame=s=>{if(!s.playing)return;s.motionTime=Math.min(s.t,4.2);s.y=.1*Math.cos(4*s.motionTime);const n=Math.floor((4*s.motionTime+Math.PI/2)/Math.PI);if(n!==s.lastTick&&s.lastTick>=0)Sound.tick(.1);s.lastTick=n;if(s.t>=4.2)s.playing=false;};
 recap.render=(g,w,h,s)=>{const t=s.playing?Math.min(s.t,4.2):(s.motionTime||0),y=.1*Math.cos(4*t),bx=160+y*560;
  g.strokeStyle=C.grid;g.strokeRect(12,14,264,286);g.strokeRect(302,14,326,286);
  text(g,'m = 0,5 kg',30,42);text(g,'y₀ = 10 cm',30,65,C.amber);
  g.fillStyle=C.axis;g.fillRect(36,108,8,86);spring(g,44,150,bx-15,8,8);g.fillStyle=C.accent;g.fillRect(bx-15,135,30,30);hLine(g,30,258,193,C.axis);text(g,'O',160,220,C.violet,'center');text(g,'y = '+(y*100).toFixed(1)+' cm',30,274);
  text(g,'y (m)',350,38);const start=0,span=4.2,mid=160,top=80,bottom=240;
  for(const v of [-.1,0,.1])text(g,v.toFixed(1),340,mid-v*800+4,C.ink,'right');
  curve(g,{left:350,right:610,top,bottom,mid,max:.1,start,span,end:t,fn:t=>.1*Math.cos(4*t),color:C.accent});
  text(g,'0',350,262);text(g,'4,2',610,262,C.ink,'right');text(g,'t (s)',610,284,C.ink,'right');
  info(s,`t = ${t.toFixed(2)} s · y = ${(y*100).toFixed(1)} cm · ω = 4 rad/s`);
 };
})();
