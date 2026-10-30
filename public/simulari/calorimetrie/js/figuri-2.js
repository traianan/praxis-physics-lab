/* =====================================================================
   Figurile 5–7: exercițiul 1.21, activitățile experimentale AE1 și AE2
   ===================================================================== */
const CW=4180,TROOM=22; // căldura specifică a apei, J/(kg·K); temperatura camerei, °C
// calorimetru desenat simplu; întoarce geometria vasului interior
function calVessel(ctx,cx,by,W,H,o={}){
  const V={x:cx-W/2,y:by-H,w:W,h:H},I={x:cx-W*.36,y:by-H*.84,w:W*.72,h:H*.76};
  ctx.fillStyle='rgba(235,227,209,.75)';ctx.fillRect(V.x,V.y,V.w,V.h);
  ctx.strokeStyle=COL.r;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(V.x,V.y);ctx.lineTo(V.x,by);ctx.lineTo(V.x+V.w,by);ctx.lineTo(V.x+V.w,V.y);ctx.stroke();
  ctx.fillStyle='#6f6a5f';[I.x+I.w*.2,I.x+I.w*.8].forEach(x=>{ctx.beginPath();ctx.moveTo(x-8,by);ctx.lineTo(x,I.y+I.h);ctx.lineTo(x+8,by);ctx.fill()});
  ctx.fillStyle='rgba(251,248,241,.9)';ctx.fillRect(I.x,I.y,I.w,I.h);
  let y=I.y+I.h;(o.layers||[]).forEach(L=>{const hh=I.h*L.h;if(hh<.2)return;ctx.fillStyle=heat((L.T-10)/75,.62);ctx.fillRect(I.x,y-hh,I.w,hh);y-=hh});
  ctx.strokeStyle=COL.r;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(I.x,I.y);ctx.lineTo(I.x,I.y+I.h);ctx.lineTo(I.x+I.w,I.y+I.h);ctx.lineTo(I.x+I.w,I.y);ctx.stroke();
  if(o.lid!==false){ctx.fillStyle='#8f8a7e';ctx.fillRect(V.x-10,V.y-12,V.w+20,12)}
  return {V,I,top:y};
}
function agitator(ctx,x,yTop,yBot,ph,hi){const off=ph*22;ctx.fillStyle=hi?COL.a:COL.r;ctx.fillRect(x-3,yTop+off,6,yBot-yTop-12);ctx.beginPath();ctx.ellipse(x,yBot-10,18,4.5,0,0,TAU);ctx.lineWidth=3;ctx.strokeStyle=hi?COL.a:COL.r;ctx.stroke()}
// pahar Berzelius cu apă; înclinat cu unghiul a în jurul colțului din dreapta-sus
function beaker(ctx,x,y,w,h,frac,T,a=0,lbl=''){ctx.save();ctx.translate(x+w,y);ctx.rotate(a);ctx.translate(-w,0);
  const lv=h*frac;if(lv>.5){ctx.fillStyle=heat((T-10)/75,.6);ctx.fillRect(0,h-lv,w,lv)}
  ctx.strokeStyle=COL.r;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(0,0);ctx.lineTo(0,h);ctx.lineTo(w,h);ctx.lineTo(w,0);ctx.stroke();
  for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(0,h-h*k/4);ctx.lineTo(7,h-h*k/4);ctx.lineWidth=1;ctx.stroke()}ctx.restore();
  if(lbl&&a<.05)lbl.split('\n').forEach((s,i)=>txt(ctx,s,x+w/2,y+h+16+i*14,{font:'600 11px "JetBrains Mono", monospace',color:COL.r}))}
// mic grafic t(timp) pentru laboratoare
function tGraph(ctx,b,hist,tmax,lo,hi,o={}){const {X,Y}=axes(ctx,b,[0,tmax],[lo,hi],{xl:'s',yl:'t (°C)',yt:[[lo,f(lo,0)],[hi,f(hi,0)]],xt:[[tmax,f(tmax,0)]]});
  if(o.ref!=null){line(ctx,b.x,Y(o.ref),b.x+b.w,Y(o.ref),COL.c,1.2,[5,4]);txt(ctx,o.refL,b.x+b.w-4,Y(o.ref)-9,{align:'right',font:MONO,color:COL.c})}
  if(hist.length>1){ctx.beginPath();hist.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.strokeStyle=COL.a;ctx.lineWidth=2.2;ctx.stroke()}}

/* ---------- Fig. 5 — Exercițiul 1.21: datele manualului și corectura ---------- */
(()=>{const S=new Sim('#fig5',{fmt:{m1:v=>f(v,1)+' kg',m2:v=>f(v,2)+' kg',m3:v=>f(v,2)+' kg',T1:v=>v+' K',T3:v=>v+' K',T:v=>v+' K'}});
  const c1=380;let bad=false;
  const calc=(m3=S.p.m3)=>{const {m1,m2,T1,T3,T}=S.p;const den=m3*(T3-T)-m2*(T-T1);return {den,c2:window.PraxisCalorimetry.oilSpecificHeat({...S.p,m3,c1}),ok:T>T1&&T<T3&&den>1e-9}};
  const setP=o=>{Object.entries(o).forEach(([k,v])=>{const inp=$(`[data-k="${k}"]`,S.fig);inp.value=v;inp.dispatchEvent(new Event('input'))})};
  const chk=()=>{const r=calc();if(!r.ok&&!bad){SND.bad()}bad=!r.ok};
  S.onParam=chk;
  S.act=a=>{if(a==='manual'){setP({m1:2,m2:.4,m3:.4,T1:283,T3:303,T:293});toast('Aceste date nu admit o căldură specifică finită.')}
    if(a==='fix'){setP({m1:2,m2:.4,m3:.8,T1:283,T3:303,T:293});bad=false;SND.ok();toast('Cu m₃ = 0,8 kg se obține c₂ = 1900 J/(kg·K).')}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const {m1,m2,m3,T1,T3,T}=S.p,r=calc();
    const b={x:62,y:34,w:w-100,h:h*.5};const Ym=8000;
    const {X,Y}=axes(ctx,b,[0,1.6],[0,Ym],{xl:'m₃ (kg)',yl:'c₂ (J/(kg·K))',xt:[[.4,'0,4'],[.8,'0,8'],[1.2,'1,2']],yt:[[1900,'1900'],[4000,'4000'],[8000,'8000']],gy:1000});
    line(ctx,b.x,Y(1900),b.x+b.w,Y(1900),COL.c,1.2,[5,4]);txt(ctx,'1900 J/(kg·K)',b.x+b.w-4,Y(1900)-10,{align:'right',font:MONO,color:COL.c});
    const valid=T>T1&&T<T3;
    if(valid){const ms=m2*(T-T1)/(T3-T);
      if(ms<1.6){line(ctx,X(ms),b.y,X(ms),b.y+b.h,COL.a,1.4,[4,4]);txt(ctx,'numitor = 0',X(ms)+6,b.y+12,{align:'left',font:MONO,color:COL.a});
        ctx.fillStyle='rgba(200,64,42,.07)';ctx.fillRect(b.x,b.y,X(ms)-b.x,b.h);txt(ctx,'fără soluție',(b.x+X(ms))/2,b.y+b.h-14,{font:MONO,color:COL.a})}
      ctx.beginPath();let st=false;for(let i=0;i<=400;i++){const x=i/400*1.6;const q=calc(x);if(!q.ok||q.c2>Ym*1.2){st=false;continue}st?ctx.lineTo(X(x),Y(q.c2)):ctx.moveTo(X(x),Y(q.c2));st=true}
      ctx.strokeStyle=COL.b;ctx.lineWidth=2.4;ctx.stroke();
      if(r.ok&&r.c2<=Ym){dot(ctx,X(m3),Y(r.c2),6,COL.a,'#fff');txt(ctx,f(r.c2,0),X(m3)+10,Y(r.c2)+16,{align:'left',font:'600 12px "JetBrains Mono", monospace',color:COL.a})}
      else{drawArrowPx(ctx,X(m3),b.y+30,X(m3),b.y-6,COL.a,{w:2});txt(ctx,r.ok?'c₂ > 8000':'c₂ → ∞ sau < 0',X(m3),b.y+44,{font:MONO,color:COL.a})}}
    else txt(ctx,'T trebuie să fie între T₁ și T₃',b.x+b.w/2,b.y+b.h/2,{font:SERIF(16),color:COL.a});
    // bilanțul căldurilor
    const bb={x:62,y:b.y+b.h+60,w:w-100,h:h-b.y-b.h-96};
    txt(ctx,'Bilanț:  Q primit  =  |Q cedat|',bb.x,bb.y-24,{align:'left',font:SERIF(15,600)});
    if(r.ok){const Qa=m1*c1*(T-T1),Qb=m2*r.c2*(T-T1),Qc=m3*r.c2*(T3-T),M=Math.max(Qa+Qb,Qc)*1.1,bw=Math.min(90,bb.w*.28);
      const W=v=>bb.h*v/M,x1=bb.x+bb.w*.18,x2=bb.x+bb.w*.62,base=bb.y+bb.h;
      ctx.fillStyle=COL.o;ctx.fillRect(x1,base-W(Qa),bw,W(Qa));ctx.fillStyle=COL.b;ctx.fillRect(x1,base-W(Qa)-W(Qb),bw,W(Qb));
      ctx.fillStyle=COL.a;ctx.fillRect(x2,base-W(Qc),bw,W(Qc));line(ctx,bb.x,base,bb.x+bb.w,base,COL.r,1.4);
      const tl=(a,b2,x,y,c)=>{txt(ctx,a,x,y-7,{align:'left',font:MONO,color:c});txt(ctx,b2,x,y+8,{align:'left',font:MONO,color:c})};
      tl('calorimetru',`${f(Qa/1000,1)} kJ`,x1+bw+6,base-W(Qa)/2,COL.o);tl('ulei rece',`${f(Qb/1000,1)} kJ`,x1+bw+6,base-W(Qa)-W(Qb)/2,COL.b);tl('ulei cald',`${f(Qc/1000,1)} kJ`,x2+bw+6,base-W(Qc)/2,COL.a);
      txt(ctx,'primit',x1+bw/2,base+14,{font:MONO});txt(ctx,'cedat',x2+bw/2,base+14,{font:MONO})}
    else wrapTxt(ctx,'Uleiul cald nu poate ceda nici măcar căldura de care are nevoie uleiul rece — pentru calorimetru nu mai rămâne nimic. Problema, cu aceste date, nu are soluție.',bb.x,bb.y+10,bb.w,22,{font:SERIF(15),color:COL.a});
    S.out('den',f(r.den,1)+' kg·K');S.out('c2',r.ok?f(r.c2,0)+' J/(kg·K)':'—');S.out('Qa',f(m1*c1*(T-T1)/1000,2)+' kJ');
    S.out('hint',!valid?'Temperatura de echilibru trebuie să fie între temperaturile inițiale.':!r.ok?`Numitorul m₃(T₃ − T) − m₂(T − T₁) = ${f(r.den,1)} kg·K. Împărțirea la zero (sau la un număr negativ) arată că datele sunt incompatibile.`:
      Math.abs(r.c2-1900)<15?'Cu m₃ = 0,8 kg ecuația dă exact 1900 J/(kg·K): bilanțul termic este satisfăcut.':'Mută slider-ul m₃ și urmărește curba: cu cât ulei cald adaugi mai mult, cu atât c₂ rezultă mai mic.')};
})();

/* ---------- Fig. 6 — AE1: amestecarea apei reci cu apa caldă (laborator virtual) ---------- */
(()=>{const S=new Sim('#fig6',{fmt:{m1:v=>v+' g',m2:v=>v+' g',t1:v=>v+' °C',t2:v=>v+' °C'}});
  const tb=$('tbody',S.fig),CC=95;let nr=0;
  let ph,L,Tc,Tth,pour,stir,hist,tm,taken,poured;
  function init(){ph=0;L=[];Tc=TROOM;Tth=TROOM;pour=null;stir=0;hist=[];tm=0;taken=false;poured={}}init();
  const totM=()=>L.reduce((a,l)=>a+l.m,0);
  S.onParam=k=>{if((k==='m1'||k==='t1')&&ph>=1||(k==='m2'||k==='t2')&&ph>=2){init();toast('Ai schimbat datele — calorimetrul a fost golit.')}};
  S.act=a=>{
    if(a==='cold'){if(ph!==0||pour){SND.bad();toast('Apa rece se toarnă prima, în calorimetrul gol.');return}pour={k:'cold',u:0,m:S.p.m1/1000,T:S.p.t1};poured.m1=S.p.m1;poured.t1=S.p.t1;SND.pour(1.1)}
    if(a==='hot'){if(ph!==1||pour){SND.bad();toast(ph===0?'Toarnă întâi apa rece.':'Golește calorimetrul pentru o nouă determinare.');return}pour={k:'hot',u:0,m:S.p.m2/1000,T:S.p.t2};poured.m2=S.p.m2;poured.t2=S.p.t2;SND.pour(1.1)}
    if(a==='stir'){if(!L.length){SND.bad();return}stir=2;SND.stir()}
    if(a==='read'){if(ph<2||pour){SND.bad();toast('Mai întâi toarnă ambele cantități de apă.');return}
      if(taken){toast('Ai notat deja această determinare. Golește calorimetrul și alege alte mase.');return}
      const spread=L.length>1?Math.abs(L[0].T-L[L.length-1].T):0;
      const tmes=Math.round(Tth*10)/10,{m1,m2,t1,t2}=poured,tcal=(m1*t1+m2*t2)/(m1+m2);taken=true;nr++;
      const tr=document.createElement('tr');tr.className='flash';
      tr.innerHTML=`<td>${nr}</td><td>${f(m1/1000,3)}</td><td>${f(m2/1000,3)}</td><td>${t1}</td><td>${t2}</td><td>${f((m1+m2)/1000,3)}</td><td><b>${f(tmes,1)}</b></td><td>${f(tcal,1)}</td><td>${f(tmes-tcal,1)}</td>`;
      tb.appendChild(tr);if(tb.children.length>8)tb.removeChild(tb.children[0]);
      SND.chime();if(spread>1.5)toast('Atenție: apa nu era amestecată — citirea este greșită. Folosește agitatorul înainte de citire!')}
    if(a==='empty'){init();SND.splash()}
    if(a==='clear'){tb.innerHTML='';nr=0;SND.tick()}};
  S.step=dt=>{S.time+=dt;
    if(pour){const before=pour.u;pour.u+=dt/1.6;const u=pour.u,fraction=window.PraxisCalorimetry.pouringFraction(before,u);
      if(fraction>0){const add=pour.m*fraction;if(pour.k==='cold'){if(!L.length)L.push({m:0,T:pour.T});const l=L[0];l.T=(l.m*l.T+add*pour.T)/(l.m+add);l.m+=add}
        else{if(L.length<2)L.push({m:0,T:pour.T});const l=L[1];l.T=(l.m*l.T+add*pour.T)/(l.m+add);l.m+=add}}
      if(u>=1){ph=pour.k==='cold'?1:2;if(pour.k==='hot'){stir=Math.max(stir,.6);tm=0;hist=[]}pour=null}}
    // schimburi de căldură: între straturi (rapid dacă agităm), cu vasul calorimetrului, spre exterior
    const km=stir>0?3:(pour&&pour.k==='hot'?.6:.04);stir=Math.max(0,stir-dt);
    for(let s=0;s<4;s++){const h=dt/4;
      if(L.length>1&&L[1].m>0){const q=km*(L[1].T-L[0].T)*Math.min(L[0].m,L[1].m)*CW*h;L[1].T-=q/(L[1].m*CW);L[0].T+=q/(L[0].m*CW)}
      if(S.t.cap&&L.length&&L[0].m>0){const q=.9*(L[0].T-Tc)*CC*h;L[0].T-=q/(L[0].m*CW);Tc+=q/CC}
      if(S.t.loss)L.forEach(l=>{if(l.m>0)l.T-=.004*(l.T-TROOM)*h*(stir>0?3:1)})}
    if(L.length>1&&stir===0&&Math.abs(L[1].T-L[0].T)<.08){const M=L[0].m+L[1].m,T=(L[0].m*L[0].T+L[1].m*L[1].T)/M;L[0]={m:M,T};L.length=1}
    const bulb=L.length?L[0].T:TROOM;Tth+=(bulb-Tth)*Math.min(1,dt*1.8);
    if(ph===2){tm+=dt;if(hist.length<1500&&(!hist.length||tm-hist[hist.length-1][0]>.1))hist.push([tm,Tth])}
    if(stir>0&&Math.random()<dt*2.5)SND.stir()};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const nar=w<520;
    const gh=nar?h*.26:h*.28,top=h-gh-40;
    const cx=w*.64,W=Math.min(200,w*.4),H=Math.min(top-70,W*1.05),by=top;
    const mt=totM(),cap=.5;// 0,5 kg umple vasul interior
    const layers=L.map(l=>({h:l.m/cap*.92,T:l.T}));
    const g=calVessel(ctx,cx,by,W,H,{layers,lid:!pour});
    // termometru (rezervor jos) și agitator
    const tx=g.I.x+g.I.w*.24;thermo(ctx,tx,g.V.y-60,g.I.y+g.I.h-12-(g.V.y-60),Tth,0,100,{r:4.5,label:false,ticks:false});
    agitator(ctx,g.I.x+g.I.w*.72,g.V.y-50,g.I.y+g.I.h-6,stir>0?(Math.sin(S.time*10)*.5+.5):0,stir>0);
    if(stir>0)for(let i=0;i<3;i++){ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(g.I.x+g.I.w*(.35+i*.15),g.top+12+i*6,6,0,Math.PI);ctx.stroke()}
    // afișajul termometrului
    const lx=Math.min(cx+W/2-6,w-102);ctx.fillStyle=COL.r;rrect(ctx,lx,Math.max(8,g.V.y-74),96,34,6);ctx.fill();window.PraxisCanvasTypography.textInBox(ctx,f(Tth,1)+' °C',{x:lx,y:g.V.y-74,w:96,h:34},{font:'600 16px "JetBrains Mono", monospace',color:'#ffd27a'});
    txt(ctx,'termometru',lx+48,g.V.y-30,{font:MONO,color:COL.muted});
    // paharele
    const bw=Math.min(62,w*.12),bh=bw*1.15,bx1=nar?14:w*.06,bx2=bx1+bw+(nar?14:24),byy=top-bh-(nar?16:0);
    const P=(k,x0,mass,T,lbl)=>{let x=x0,y=byy,a=0,frac=k==='cold'?(poured.m1&&!(pour&&pour.k==='cold')?0:mass/260):(poured.m2&&!(pour&&pour.k==='hot')?0:mass/260);
      if(pour&&pour.k===k){const u=pour.u,tx2=cx-W*.36-bw*1.02,ty2=g.V.y-bh-26,m=clamp(u/.25,0,1),bk=clamp((u-.8)/.2,0,1);
        x=lerp(x0,tx2,m-bk*m);y=lerp(byy,ty2,m-bk*m);a=u<.25?0:u<.8?Math.min(1.25,(u-.25)/.12*1.25):lerp(1.25,0,bk);frac=mass/260*clamp(1-(u-.25)/.55,0,1);
        if(u>.3&&u<.8){ctx.strokeStyle=heat((T-10)/75,.7);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+bw,y+2);ctx.quadraticCurveTo(x+bw+12,y+10,g.I.x+g.I.w*.42,g.top-2);ctx.stroke()}}
      beaker(ctx,x,y,bw,bh,frac,T,a,lbl)};
    const sep=nar?'\n':' · ';P('cold',bx1,S.p.m1,S.p.t1,`${S.p.m1} g${sep}${S.p.t1}°`);P('hot',bx2,S.p.m2,S.p.t2,`${S.p.m2} g${sep}${S.p.t2}°`);
    txt(ctx,nar?'rece':'apă rece',bx1+bw/2,byy-14,{font:MONO,color:COL.b});txt(ctx,nar?'caldă':'apă caldă',bx2+bw/2,byy-14,{font:MONO,color:COL.a});
    // graficul
    const b={x:52,y:top+46,w:w-90,h:gh-36};const {m1,m2,t1,t2}=poured;
    const tcal=ph===2?(m1*t1+m2*t2)/(m1+m2):null;
    tGraph(ctx,b,hist,Math.max(20,tm*1.1),0,100,{ref:tcal,refL:tcal!=null?`t calculat = ${f(tcal,1)} °C`:''});
    S.out('mt',f(mt,3)+' kg');S.out('tth',f(Tth,1)+' °C');S.out('tc',tcal!=null?f(tcal,1)+' °C':'—');
    S.out('hint',ph===0?'1. Alege masa și temperatura apei reci și apasă „Toarnă apa rece”.':ph===1?'2. Citește temperatura apei reci din calorimetru, apoi toarnă apa caldă.':
      taken?'Determinare notată. Golește calorimetrul, alege alte mase (m₁ ≠ m₂) și repetă — efectuează 4–5 serii.':
      L.length>1?'Apa caldă stă deasupra (este mai puțin densă). Termometrul măsoară doar stratul de jos — agită!':
      `Apa este omogenă. Notează temperatura: ${f(Tth,1)} °C (calculat: ${f(tcal,1)} °C).`)};
})();

/* ---------- Fig. 7 — AE2: căldura specifică a unui corp solid ---------- */
(()=>{const S=new Sim('#fig7',{fmt:{Va:v=>v+' ml',mx:v=>v+' g'}});
  const tb=$('tbody',S.fig),CC=95,TA=20;let nr=0;
  // probele „necunoscute”: metale amestecate la fiecare încărcare a paginii
  const POOL=['al','cu','pb','otel','alama','cos'].sort(()=>Math.random()-.5).slice(0,4),SAMP={};
  ['A','B','C','D'].forEach((k,i)=>SAMP[k]={mat:POOL[i],found:false});
  const REF=[['alama','alamă',377],['otel','oțel',460],['al','aluminiu',900],['pb','plumb',128],['cos','cositor',227],['cu','cupru',385],['fe','fontă',545]];
  let ph,Ts,Tw,pos,stir,hist,tm,taken,lastCx,mv;
  function init(){ph=0;Ts=TA;Tw=TA;pos=0;stir=0;hist=[];tm=0;taken=false;mv=null;S.label('heat','Încălzește proba')}init();
  const mat=()=>MAT[SAMP[S.mode].mat];
  S.onMode=()=>{init();lastCx=null};S.onParam=()=>{if(ph>=2){init();toast('Ai schimbat datele — experimentul a reînceput.')}};
  S.act=a=>{
    if(a==='heat'){if(ph!==0){SND.bad();return}ph=1;SND.whoosh()}
    if(a==='move'){if(ph!==1){SND.bad();toast('Încălzește întâi proba în apa care fierbe.');return}if(Ts<98){toast('Proba nu a ajuns încă la temperatura apei care fierbe — mai așteaptă.');SND.bad();return}ph=2;mv=0;SND.whoosh()}
    if(a==='stir'){if(ph<3){SND.bad();return}stir=2;SND.stir()}
    if(a==='read'){if(ph<3){SND.bad();toast('Transferă întâi proba în calorimetru.');return}if(taken){toast('Ai notat deja. Alege altă probă sau reîncepe.');return}
      const ma=S.p.Va/1000,mx=S.p.mx/1000,t=Math.round(Tw*10)/10,cx=ma*CW*(t-TA)/(mx*(100-t));lastCx=cx;taken=true;nr++;
      const best=REF.reduce((b,r)=>Math.abs(r[2]-cx)<Math.abs(b[2]-cx)?r:b);
      const tr=document.createElement('tr');tr.className='flash';
      tr.innerHTML=`<td>${nr}</td><td>${S.mode}</td><td>${S.p.Va}</td><td>${f(ma,3)}</td><td>${TA}</td><td>${f(mx,3)}</td><td>100</td><td><b>${f(t,1)}</b></td><td><b>${f(cx,0)}</b></td><td>${best[1]}?</td>`;
      tb.appendChild(tr);if(tb.children.length>8)tb.removeChild(tb.children[0]);SND.chime();
      if(Math.abs(Tw-Ts)>1)toast('Proba și apa nu erau încă în echilibru termic — rezultatul este afectat. Agită și așteaptă!')}
    if(a==='reset'){init();SND.tick()}
    if(a&&a.startsWith('id-')){const g=a.slice(3),sm=SAMP[S.mode];if(lastCx==null){toast('Fă întâi o măsurătoare cu această probă.');SND.bad();return}
      if(g===sm.mat){sm.found=true;SND.fanfare();toast(`Corect! Proba ${S.mode} este din ${MAT[g].n} (c ≈ ${MAT[g].c} J/(kg·K)).`)}else{SND.bad();toast('Nu — compară valoarea obținută cu tabelul de identificare .')}}};
  S.step=dt=>{S.time+=dt;const m=mat(),mx=S.p.mx/1000,ma=S.p.Va/1000,Cx=m.c*mx,Cw=ma*CW+(S.t.cap?CC:0);
    if(ph===1){Ts+=(100-Ts)*Math.min(1,dt*1.2);if(Math.random()<dt*9)SND.bubble(.5)}
    if(ph===2){mv+=dt/1.2;if(S.t.loss)Ts-=dt*6;if(mv>=1){ph=3;tm=0;hist=[];SND.sizzle(1.4);SND.plop()}}
    if(ph===3){const k=(stir>0?2.2:.35);for(let s=0;s<4;s++){const h=dt/4,q=k*(Ts-Tw)*Math.min(Cx,Cw)*h;Ts-=q/Cx;Tw+=q/Cw}
      tm+=dt;if(hist.length<1500&&(!hist.length||tm-hist[hist.length-1][0]>.1))hist.push([tm,Tw])}
    stir=Math.max(0,stir-dt);if(stir>0&&Math.random()<dt*2.5)SND.stir()};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const nar=w<520,m=mat();
    const gh=nar?h*.26:h*.28,top=h-gh-40;
    // oala cu apă care fierbe
    const pw=Math.min(120,w*.26),phh=pw*.62,px=nar?12:w*.05,py=top-phh-30;
    if(ph>=1&&ph<3)for(let i=0;i<3;i++)flame(ctx,px+pw*(.25+i*.25),top-2,.6,S.time+i);
    ctx.fillStyle='#3a3d46';ctx.fillRect(px-8,top-30,pw+16,6);
    ctx.fillStyle=heat(ph>=1?.95:.4,.5);ctx.fillRect(px,py+phh*.2,pw,phh*.8);
    ctx.strokeStyle=COL.r;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+phh);ctx.lineTo(px+pw,py+phh);ctx.lineTo(px+pw,py);ctx.stroke();
    if(ph===1)for(let i=0;i<6;i++){const yy=py+phh-((S.time*40+i*17)%(phh*.8));ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(px+pw*((i*.37)%1*.8+.1),yy,2.5,0,TAU);ctx.stroke()}
    txt(ctx,'apă care fierbe · 100 °C',Math.max(4,px-8),py-14,{align:'left',font:MONO,color:COL.muted});
    // calorimetrul
    const cx=w*.66,W=Math.min(190,w*.38),H=Math.min(top-80,W*1.05),ma=S.p.Va/1000;
    const g=calVessel(ctx,cx,top,W,H,{layers:[{h:ma/.45*.9,T:Tw}],lid:ph!==2});
    // proba: pe fir, în oală → în calorimetru
    const ss=10+Math.cbrt(S.p.mx)*3.2,A={x:px+pw/2,y:py+phh*.55},B={x:g.I.x+g.I.w*.5,y:g.I.y+g.I.h-ss-6};
    let sx=A.x,sy=A.y;if(ph===0){sy=py-72}if(ph===2){const u=clamp(mv,0,1);sx=lerp(A.x,B.x,u);sy=lerp(A.y,B.y,u)-Math.sin(u*Math.PI)*120}if(ph===3){sx=B.x;sy=B.y}
    line(ctx,sx,ph>=3?g.V.y-60:Math.min(sy,py)-60,sx,sy-ss/2,'#6f6a5f',1.2);
    body(ctx,sx-ss/2,sy-ss/2,ss,ss,{col:m.col},(Ts-20)/80);window.PraxisCanvasTypography.textInBox(ctx,S.mode,{x:sx-ss/2,y:sy-ss/2,w:ss,h:ss},{font:'700 12px "JetBrains Mono", monospace',color:'#fff'});
    if(ph===3&&Ts-Tw>4){for(let i=0;i<4;i++){const yy=sy-ss/2-((S.time*50+i*9)%34);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(sx+(i-1.5)*5,yy,1.8,0,TAU);ctx.stroke()}}
    thermo(ctx,g.I.x+g.I.w*.18,g.V.y-60,g.I.y+g.I.h-12-(g.V.y-60),Tw,0,100,{r:4.5,label:false,ticks:false});
    agitator(ctx,g.I.x+g.I.w*.82,g.V.y-50,g.I.y+g.I.h-6,stir>0?(Math.sin(S.time*10)*.5+.5):0,stir>0);
    const lx=Math.min(cx+W/2-6,w-102);ctx.fillStyle=COL.r;rrect(ctx,lx,Math.max(8,g.V.y-78),96,34,6);ctx.fill();window.PraxisCanvasTypography.textInBox(ctx,f(Tw,1)+' °C',{x:lx,y:g.V.y-78,w:96,h:34},{font:'600 16px "JetBrains Mono", monospace',color:'#ffd27a'});
    txt(ctx,`proba: ${f(Ts,1)} °C`,ph===1?Math.max(4,px-8):sx,ph===1?py-32:sy+ss/2+14,{align:ph===1?'left':'center',font:MONO,color:COL.a});
    const b={x:52,y:top+46,w:w-90,h:gh-36};tGraph(ctx,b,hist,Math.max(20,tm*1.1),15,Math.max(45,Math.ceil((Tw+6)/5)*5));
    S.out('tw',f(Tw,1)+' °C');S.out('ts',f(Ts,1)+' °C');S.out('cx',lastCx!=null?f(lastCx,0)+' J/(kg·K)':'—');
    S.out('hint',ph===0?'1. Scufundă proba în apa care fierbe (încălzește-o la t_x ≈ 100 °C).':ph===1?(Ts<98?'Proba se încălzește… așteaptă să ajungă la temperatura apei care fierbe.':'2. Proba are ≈ 100 °C. Transfer-o repede în calorimetru!'):
      ph===2?'Transfer…':taken?(SAMP[S.mode].found?'Proba a fost identificată. Încearcă altă probă (filele A–D).':'Compară c_x obținut cu tabelul și alege metalul de mai jos.'):
      Math.abs(Ts-Tw)>.5?'Proba cedează căldură apei. Agită pentru echilibru mai rapid.':'Echilibru termic atins — notează temperatura finală.')};
})();
