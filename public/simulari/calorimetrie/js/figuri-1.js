/* =====================================================================
   Figurile 1–4: coeficienți calorici, teorema transformărilor inverse,
   teorema egalității căldurilor schimbate, calorimetrul
   ===================================================================== */
// culoare după „temperatură”: 0 = rece (albastru) … 1 = fierbinte (roșu)
function heat(s,a=1){s=clamp(s,0,1);const r=Math.round(lerp(31,200,s)),g=Math.round(s<.5?lerp(90,122,s*2):lerp(122,64,(s-.5)*2)),b=Math.round(lerp(138,42,s));return `rgba(${r},${g},${b},${a})`}
const SUPS={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sci(x,d=2){if(!isFinite(x))return '—';if(x===0)return '0';const e=Math.floor(Math.log10(Math.abs(x))+1e-9);if(e>=-2&&e<=3)return f(x,d);return `${f(x/10**e,d)}·10${String(e).split('').map(c=>SUPS[c]).join('')}`}
const SERIF=(px,wt=500)=>`italic ${wt} ${px}px "Source Serif 4", Georgia, serif`;
// sistem de axe într-un dreptunghi; întoarce funcțiile de conversie X(v), Y(v)
function axes(ctx,b,xr,yr,o={}){
  const X=v=>b.x+(v-xr[0])/(xr[1]-xr[0])*b.w,Y=v=>b.y+b.h-(v-yr[0])/(yr[1]-yr[0])*b.h;
  ctx.save();ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(b.x,b.y,b.w,b.h);
  if(o.gy){ctx.strokeStyle='rgba(217,207,186,.7)';ctx.lineWidth=1;ctx.beginPath();for(let v=yr[0]+o.gy;v<yr[1]+1e-9;v+=o.gy){ctx.moveTo(b.x,Y(v));ctx.lineTo(b.x+b.w,Y(v))}ctx.stroke()}
  ctx.restore();
  drawArrowPx(ctx,b.x,b.y+b.h,b.x+b.w+14,b.y+b.h,COL.r,{w:1.4,head:.7});
  drawArrowPx(ctx,b.x,b.y+b.h,b.x,b.y-14,COL.r,{w:1.4,head:.7});
  fixedTxt(ctx,o.xl??'',b.x+b.w+12,b.y+b.h-10,{align:'right'});fixedTxt(ctx,o.yl??'',b.x+34,b.y+13,{align:'left'});
  if(o.xt)o.xt.forEach(([v,s])=>fixedTxt(ctx,s,X(v),b.y+b.h+14,{font:MONO,color:COL.muted}));
  if(o.yt)o.yt.forEach(([v,s])=>fixedTxt(ctx,s,b.x-6,Y(v),{font:MONO,color:COL.muted,align:'right'}));
  return {X,Y};
}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function flame(ctx,x,y,s,t,a=1){ctx.save();ctx.globalAlpha=a;for(let k=0;k<3;k++){const q=1-k*.3,fl=Math.sin(t*14+k*2)*.12;
  ctx.fillStyle=['rgba(200,64,42,.85)','rgba(232,140,40,.9)','rgba(255,214,90,.95)'][k];ctx.beginPath();ctx.moveTo(x-10*s*q,y);
  ctx.quadraticCurveTo(x-12*s*q,y-18*s*q,x+fl*20*s,y-(34+6*Math.sin(t*9+k))*s*q);ctx.quadraticCurveTo(x+12*s*q,y-18*s*q,x+10*s*q,y);ctx.fill()}ctx.restore()}
// termometru cu lichid: x = axa, y = capătul de sus, hh = lungimea tubului
function thermo(ctx,x,y,hh,t,lo=0,hi=100,o={}){const r=o.r||6,br=r*1.75,top=y+hh-4-(hh-12)*clamp((t-lo)/(hi-lo),0,1);
  ctx.save();ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=1.5;rrect(ctx,x-r,y,2*r,hh,r);ctx.fill();ctx.stroke();
  ctx.fillStyle=COL.a;ctx.fillRect(x-r*.42,top,r*.84,y+hh-top+2);dot(ctx,x,y+hh+br*.55,br,COL.a,COL.r);
  if(o.ticks!==false){ctx.strokeStyle=COL.r;ctx.lineWidth=1;for(let k=0;k<=10;k++){const yy=y+hh-4-(hh-12)*k/10;ctx.beginPath();ctx.moveTo(x+r,yy);ctx.lineTo(x+r+(k%5?3:6),yy);ctx.stroke()}}
  if(o.label!==false)txt(ctx,f(t,o.d??1)+' °C',x+(o.lx??r+8),o.ly??top,{font:o.font||'600 12px "JetBrains Mono", monospace',align:'left',color:COL.a});ctx.restore()}
// căldurile specifice folosite în lecție — valori corecte, J/(kg·K)
const MAT={apa:{n:'apă',c:4180,mu:18,col:'rgba(31,90,138,.45)',liq:1},al:{n:'aluminiu',c:900,mu:27,col:'#b6bcc4'},fe:{n:'fier',c:450,mu:55.8,col:'#6d7178'},
  cu:{n:'cupru',c:385,mu:63.5,col:'#c07a43'},pb:{n:'plumb',c:128,mu:207.2,col:'#7d8290'},alama:{n:'alamă',c:380,mu:64,col:'#c9a646'},
  ulei:{n:'ulei',c:1900,col:'rgba(201,166,70,.55)',liq:1},cos:{n:'cositor',c:227,mu:118.7,col:'#a9adb3'},otel:{n:'oțel',c:460,mu:55.8,col:'#8a9099'}};
// bloc de material colorat după temperatură (metal: muchii; lichid: pahar)
function body(ctx,x,y,w,h,mat,s){if(mat.liq){ctx.fillStyle=heat(s,.55);ctx.fillRect(x,y+h*.12,w,h*.88);ctx.strokeStyle=COL.r;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.lineTo(x+w,y);ctx.stroke()}
  else{ctx.fillStyle=mat.col;rrect(ctx,x,y,w,h,4);ctx.fill();ctx.fillStyle=heat(s,.45);rrect(ctx,x,y,w,h,4);ctx.fill();ctx.strokeStyle=COL.r;ctx.lineWidth=2;rrect(ctx,x,y,w,h,4);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x+4,y+4,w*.18,h-8)}}

/* ---------- Fig. 1 — Coeficienți calorici: C, c, Cμ ---------- */
(()=>{const S=new Sim('#fig1',{fmt:{m:v=>v.toFixed(1)+' kg',P:v=>v+' W'}});
  let on=false,tau=0,T=20,hist=[],k=1,boilT=0,ghost=[],bub=[],nextB=0,hum=null;
  const setOn=v=>{on=v;if(v&&!hum){hum=SND.loop('hum',96);hum&&hum.vol(.05)}if(!v&&hum){hum.stop();hum=null}};
  S.onHide=()=>{if(hum){hum.stop();hum=null}};SND.onChange(v=>{if(!v&&hum){hum.stop();hum=null}});
  const C=()=>MAT[S.mode].c*S.p.m;
  function init(){setOn(false);tau=0;T=20;boilT=0;hist=[[0,20]];bub=[];k=C()*80/S.p.P/6;S.label('heat','Pornește încălzitorul')}
  init();
  const keep=()=>{if(hist.length>3){ghost.push({h:hist,n:MAT[S.mode].n,m:S.p.m});if(ghost.length>3)ghost.shift()}};
  S.onMode=()=>{keep();init()};S.onParam=()=>{keep();init()};
  S.act=a=>{if(a==='reset'){init();ghost=[];SND.tick()}
    if(a==='heat'){if(T>=100&&!MAT[S.mode].liq){init()}setOn(!on);S.label('heat',on?'Oprește încălzitorul':'Pornește încălzitorul');on?SND.whoosh():SND.tick()}};
  S.step=dt=>{S.time+=dt;if(on&&!hum&&S.vis)setOn(true);if(!on)return;const d=dt*k;tau+=d;const mat=MAT[S.mode];
    if(T<100){T=Math.min(100,T+S.p.P*d/C());if(T>=100){if(mat.liq){toast('Apa fierbe: temperatura rămâne 100 °C');SND.ping()}else{setOn(false);S.label('heat','Încălzește din nou');SND.ping()}}}
    else if(mat.liq){boilT+=d;if(S.p.P*boilT>C()*20){setOn(false);S.label('heat','Pornește încălzitorul')}}
    hist.push([S.p.P*tau,T]);
    if(T>=100&&mat.liq&&S.time>nextB){nextB=S.time+.06+Math.random()*.1;SND.bubble(.8)}
    if(mat.liq&&T>60&&Math.random()<dt*(T-60)/4)bub.push({x:Math.random(),y:1,v:.4+Math.random()*.5})};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const mat=MAT[S.mode],narrow=w<560;
    // stânga (sau sus): corpul pe plita electrică
    const L=narrow?{x:0,y:0,w,h:h*.42}:{x:0,y:0,w:w*.42,h};
    const bs=Math.min(L.w*.55,L.h*.42)*(.65+.35*Math.cbrt(S.p.m/2)),bx=L.x+L.w/2-bs/2-14,by=L.y+L.h-70-bs*.8;
    const s=(T-20)/80;
    ctx.fillStyle='#3a3d46';rrect(ctx,bx-14,L.y+L.h-62,bs+28,16,3);ctx.fill();
    ctx.strokeStyle=on?`rgba(232,90,40,${.6+.3*Math.sin(S.time*8)})`:'#6f6a5f';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<7;i++){const xx=bx+i*bs/6;ctx.moveTo(xx,L.y+L.h-58);ctx.lineTo(xx+bs/12,L.y+L.h-50)}ctx.stroke();
    txt(ctx,'P = '+S.p.P+' W',L.x+L.w/2-14,L.y+L.h-32,{font:MONO,color:on?COL.a:COL.muted});
    body(ctx,bx,by,bs,bs*.8,mat,s);
    if(mat.liq){ctx.save();ctx.beginPath();ctx.rect(bx,by+bs*.1,bs,bs*.7);ctx.clip();bub=bub.filter(b=>(b.y-=b.v*.016)>0);bub.forEach(b=>{ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(bx+b.x*bs,by+bs*.1+b.y*bs*.7,2+(1-b.y)*3,0,TAU);ctx.stroke()});ctx.restore();
      if(T>=100)for(let i=0;i<4;i++){const yy=by-10-((S.time*30+i*18)%60);ctx.strokeStyle=`rgba(111,106,95,${.4*(1-((S.time*30+i*18)%60)/60)})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+bs*(.25+i*.17),yy+12);ctx.quadraticCurveTo(bx+bs*(.2+i*.17),yy+6,bx+bs*(.25+i*.17),yy);ctx.stroke()}}
    thermo(ctx,bx+bs+16,by-40,bs*.8+16,T,0,110,{r:5});
    txt(ctx,`${mat.n} · ${f(S.p.m,1)} kg`,bx+bs/2,by-18,{font:SERIF(15,600)});
    // dreapta (sau jos): t în funcție de Q
    const b=narrow?{x:54,y:L.h+30,w:w-90,h:h-L.h-76}:{x:w*.5,y:42,w:w*.44,h:h-110};
    const Qm=Math.max(C()*80*1.25,...ghost.map(g=>g.h[g.h.length-1][0]))/1000;
    const {X,Y}=axes(ctx,b,[0,Qm],[0,110],{xl:'Q (kJ)',yl:'t (°C)',xt:[[Qm,f(Qm,Qm<10?1:0)]],yt:[[20,'20'],[100,'100']],gy:20});
    ghost.forEach((g,i)=>{ctx.beginPath();g.h.forEach((q,j)=>j?ctx.lineTo(X(q[0]/1000),Y(q[1])):ctx.moveTo(X(q[0]/1000),Y(q[1])));ctx.strokeStyle='rgba(111,106,95,.5)';ctx.lineWidth=1.6;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
      const q=g.h[g.h.length-1];txt(ctx,`${g.n} ${f(g.m,1)} kg`,Math.min(X(q[0]/1000),b.x+b.w-4),Y(q[1])-10-i*12,{font:'500 10px "JetBrains Mono", monospace',color:COL.muted,align:'right'})});
    ctx.beginPath();hist.forEach((q,j)=>j?ctx.lineTo(X(q[0]/1000),Y(q[1])):ctx.moveTo(X(q[0]/1000),Y(q[1])));ctx.strokeStyle=COL.a;ctx.lineWidth=2.8;ctx.stroke();
    const q=hist[hist.length-1];dot(ctx,X(q[0]/1000),Y(q[1]),4.5,COL.a);
    txt(ctx,'panta = 1 / C',b.x+12,b.y+10,{align:'left',font:SERIF(14),color:COL.muted});
    const Q=S.p.P*tau,dT=T-20,heating=dT>.05;
    S.out('tau',f(tau,0)+' s');S.out('Q',sci(Q/1000,2)+' kJ');S.out('dT',f(dT,1)+' K');
    S.out('C',f(heating&&!boilT?Q/dT:C(),0)+' J/K');S.out('c',f(mat.c,0)+' J/(kg·K)');S.out('Cm',mat.mu?f(mat.c*mat.mu/1000,1)+' J/(mol·K)':'—');
    S.out('hint',boilT?'Apa fierbe: căldura primită nu mai ridică temperatura (se consumă la vaporizare) — aici C = Q/ΔT nu se mai aplică.':
      tau?`ΔT = Q / C: cu C = ${f(C(),0)} J/K, fiecare kilojoule ridică temperatura cu ${f(1000/C(),2)} K.`:'Alege materialul și masa, apoi pornește încălzitorul. Curba anterioară rămâne punctată, pentru comparație.')};
})();

/* ---------- Fig. 2 — U = U(T) și teorema transformărilor inverse ---------- */
(()=>{const S=new Sim('#fig2',{fmt:{Ti:v=>v+' K',dT:v=>v+' K'}});
  const R=8.31,Cv=1.5*R,Cp=2.5*R; // 1 mol de gaz ideal monoatomic
  const N=34,P=[];for(let i=0;i<N;i++){const a=Math.random()*TAU;P.push({x:Math.random(),y:Math.random(),a})}
  let T,ph='i',u=0,Qif=0,Qfi=0,Lfi=0,done={h:false,c:false};
  function init(){T=S.p.Ti;ph='i';u=0;Qif=0;Qfi=0;Lfi=0;done={h:false,c:false}}init();
  S.onParam=S.onMode=()=>init();
  const Tf=()=>S.p.Ti+S.p.dT,isoBar=()=>S.mode==='bar';
  S.act=a=>{if(a==='reset'){init();SND.tick();return}
    if(a==='heat'){if(ph!=='i'){toast('Sistemul trebuie să fie în starea i — apasă „Răcește” sau „Resetează”.');SND.bad();return}ph='heat';u=0;Qif=0;Qfi=0;Lfi=0;done.c=false;SND.whoosh()}
    if(a==='cool'){if(ph!=='f'){toast('Încălzește întâi sistemul până în starea f.');SND.bad();return}ph='cool';u=0;Qfi=0;Lfi=0;SND.whoosh()}};
  S.step=dt=>{S.time+=dt;const sp=Math.sqrt(T/300)*.5;
    P.forEach(p=>{p.x+=Math.cos(p.a)*sp*dt;p.y+=Math.sin(p.a)*sp*dt;if(p.x<0||p.x>1){p.a=Math.PI-p.a;p.x=clamp(p.x,0,1)}if(p.y<0||p.y>1){p.a=-p.a;p.y=clamp(p.y,0,1)}});
    if(ph==='heat'||ph==='cool'){u=Math.min(1,u+dt/2.6);const a=ph==='heat'?S.p.Ti:Tf(),b=ph==='heat'?Tf():S.p.Ti;T=lerp(a,b,u);
      if(ph==='heat')Qif=Cv*(T-S.p.Ti);else{Qfi=(isoBar()?Cp:Cv)*(T-Tf());Lfi=isoBar()?R*(T-Tf()):0}
      if(u>=1){if(ph==='heat'){ph='f';done.h=true}else{ph='i';done.c=true}SND.chime()}}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const narrow=w<560;
    // vasul cu gaz (V = const, sau cu piston la răcirea izobară)
    const vw=narrow?w*.44:w*.34,vh=h*.42,vx=narrow?16:28,vy=60;
    const hf=isoBar()&&(ph==='cool'||(ph==='i'&&done.c))?T/Tf():1, gh=vh*hf;
    ctx.fillStyle=heat((T-250)/150,.18);ctx.fillRect(vx,vy+vh-gh,vw,gh);
    ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(vx,vy-6);ctx.lineTo(vx,vy+vh);ctx.lineTo(vx+vw,vy+vh);ctx.lineTo(vx+vw,vy-6);ctx.stroke();
    if(isoBar()){ctx.fillStyle='#3a3d46';ctx.fillRect(vx+2,vy+vh-gh-10,vw-4,10);ctx.fillRect(vx+vw/2-4,vy+vh-gh-46,8,36);txt(ctx,'piston liber (p = const.)',vx+vw/2,vy-22,{font:MONO,color:COL.muted})}
    else{ctx.fillStyle='#3a3d46';ctx.fillRect(vx-4,vy-10,vw+8,10);txt(ctx,'capac fix (V = const.)',vx+vw/2,vy-22,{font:MONO,color:COL.muted})}
    P.forEach(p=>dot(ctx,vx+8+p.x*(vw-16),vy+vh-6-p.y*(gh-14),3.6,heat((T-250)/150,.9)));
    // sursa: flacără la încălzire, baie rece la răcire
    const sy=vy+vh+14;
    if(ph==='heat')for(let i=0;i<3;i++)flame(ctx,vx+vw*(.25+i*.25),sy+34,.7,S.time+i);
    if(ph==='cool'){ctx.fillStyle='rgba(31,90,138,.25)';rrect(ctx,vx,sy,vw,30,4);ctx.fill();window.PraxisCanvasTypography.textInBox(ctx,'baie rece',{x:vx,y:sy,w:vw,h:30},{font:MONO,color:COL.b})}
    txt(ctx,`T = ${f(T,0)} K`,vx+vw/2,sy+56,{font:SERIF(18,600),color:COL.a});
    txt(ctx,ph==='i'?'starea i':ph==='f'?'starea f':ph==='heat'?'încălzire i → f':'răcire f → i',vx+vw/2,sy+78,{font:MONO,color:COL.muted});
    // graficul U(T) — o singură dreaptă: U depinde doar de T
    const b={x:narrow?vx+vw+44:w*.48,y:46,w:(narrow?w-vx-vw-70:w*.46),h:h*.4};
    const Tmin=240,Tmax=440,{X,Y}=axes(ctx,b,[Tmin,Tmax],[0,1.5*R*Tmax/1000],{xl:'T (K)',yl:'U (kJ)',xt:[[S.p.Ti,'Tᵢ'],[Tf(),'T_f']]});
    ctx.strokeStyle=COL.b;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(Tmin),Y(Cv*Tmin/1000));ctx.lineTo(X(Tmax),Y(Cv*Tmax/1000));ctx.stroke();
    txt(ctx,'U = (3/2)·νRT',X(Tmax)-4,Y(Cv*Tmax/1000)+16,{align:'right',font:SERIF(13),color:COL.b});
    [[S.p.Ti,'i'],[Tf(),'f']].forEach(([t,l])=>{dot(ctx,X(t),Y(Cv*t/1000),4,'#fff',COL.r);txt(ctx,l,X(t)-10,Y(Cv*t/1000)-10)});
    dot(ctx,X(T),Y(Cv*T/1000),6,COL.a);
    // barele căldurilor
    const bb={x:b.x,y:b.y+b.h+56,w:b.w,h:h-b.y-b.h-80},Qm=Cp*100*1.05,bw=Math.min(54,bb.w/5);
    const bars=[[Qif,'Q_if',COL.a,'primită'],[Math.abs(Qfi),'|Q_fi|',COL.b,'cedată'],[Cv*S.p.dT*(done.h||ph!=='i'||done.c?1:0),'ΔU',COL.c,'']];
    if(isoBar())bars.push([Math.abs(Lfi),'|L_fi|',COL.o,'']);
    line(ctx,bb.x,bb.y+bb.h,bb.x+bb.w,bb.y+bb.h,COL.r,1.4);
    bars.forEach(([v,l,c],i)=>{const x=bb.x+12+i*(bw+14),hh=bb.h*v/Qm;ctx.fillStyle=c;ctx.globalAlpha=.85;ctx.fillRect(x,bb.y+bb.h-hh,bw,hh);ctx.globalAlpha=1;
      txt(ctx,l,x+bw/2,bb.y+bb.h+14,{font:'600 11px "JetBrains Mono", monospace',color:c});txt(ctx,f(v,0)+' J',x+bw/2,bb.y+bb.h-hh-10,{font:MONO})});
    const eq=done.h&&done.c&&!isoBar();
    S.out('Qif',f(Qif,0)+' J');S.out('Qfi',f(Qfi,0)+' J');S.out('dU',f(Cv*(T-S.p.Ti),0)+' J');
    S.out('hint',!done.h?'Încălzește gazul de la Tᵢ la T_f (vasul este închis, V = const.). Urmărește punctul pe dreapta U(T).':
      !done.c?'Acum răcește-l înapoi, cu aceeași diferență de temperatură ΔT.':
      eq?`Q_if = |Q_fi| = ${f(Cv*S.p.dT,0)} J — teorema transformărilor inverse. Punctul a mers pe aceeași dreaptă U(T), dus-întors.`:
      `Răcire izobară: |Q_fi| = ${f(Cp*S.p.dT,0)} J ≠ Q_if = ${f(Cv*S.p.dT,0)} J. ΔU este același (U depinde doar de T), dar o parte din energie s-a schimbat ca lucru mecanic.`)};
})();

/* ---------- Fig. 3 — Teorema egalității căldurilor schimbate ---------- */
(()=>{const S=new Sim('#fig3',{fmt:{m1:v=>v.toFixed(1)+' kg',m2:v=>v.toFixed(1)+' kg',t1:v=>v+' °C',t2:v=>v+' °C'}});
  const B3={mat:MAT.al,m:.5,t0:60},TENV=20;
  let on=false,T=[],T0=[],hist=[],time=0,kap=1,lam=0,eqDone=false,Qenv=0;
  const mats=()=>[MAT[S.mode],MAT.apa,B3.mat].slice(0,S.t.three?3:2);
  const ms=()=>[S.p.m1,S.p.m2,B3.m].slice(0,S.t.three?3:2);
  const Cs=()=>mats().map((m,i)=>m.c*ms()[i]);
  function init(){on=false;time=0;eqDone=false;Qenv=0;T0=[S.p.t1,S.p.t2,B3.t0].slice(0,S.t.three?3:2);T=[...T0];hist=[[0,...T]];
    const C=Cs(),cm=Math.min(...C);kap=cm/1.3;lam=kap*.18;S.label('go','Pune corpurile în contact')}
  S.onParam=S.onMode=S.onToggle=()=>init();init();
  S.act=a=>{if(a==='reset'){init();SND.tick()}if(a==='go'){if(eqDone)init();on=!on;S.label('go',on?'Pauză':'Continuă');on&&SND.knock()}};
  S.step=dt=>{S.time+=dt;if(!on)return;const C=Cs(),n=T.length;
    for(let s=0;s<4;s++){const h=dt/4,dQ=new Array(n).fill(0);
      for(let i=0;i<n-1;i++){const q=kap*(T[i]-T[i+1])*h;dQ[i]-=q;dQ[i+1]+=q}
      if(!S.t.adiab)for(let i=0;i<n;i++){const q=lam*(T[i]-TENV)*h;dQ[i]-=q;Qenv+=q}
      for(let i=0;i<n;i++)T[i]+=dQ[i]/C[i]}
    time+=dt;if(hist.length<2000)hist.push([time,...T]);
    const sp=Math.max(...T)-Math.min(...T);
    if(!eqDone&&sp<.05){eqDone=true;SND.chime();if(S.t.adiab){on=false;S.label('go','Pune corpurile în contact')}}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const C=Cs(),M=mats(),n=T.length;
    // incinta
    const E={x:20,y:22,w:w-40,h:h*.4};
    if(S.t.adiab){ctx.fillStyle='rgba(176,122,18,.12)';ctx.fillRect(E.x,E.y,E.w,E.h);ctx.save();ctx.beginPath();ctx.rect(E.x,E.y,E.w,E.h);ctx.rect(E.x+12,E.y+12,E.w-24,E.h-24);ctx.clip('evenodd');
      ctx.strokeStyle='rgba(176,122,18,.5)';ctx.lineWidth=1.2;for(let x=E.x-E.h;x<E.x+E.w;x+=9){ctx.beginPath();ctx.moveTo(x,E.y+E.h);ctx.lineTo(x+E.h,E.y);ctx.stroke()}ctx.restore();
      ctx.strokeStyle=COL.r;ctx.lineWidth=1.5;ctx.strokeRect(E.x,E.y,E.w,E.h);ctx.strokeRect(E.x+12,E.y+12,E.w-24,E.h-24);txt(ctx,'înveliș adiabatic',E.x+E.w-18,E.y+E.h+12,{font:MONO,color:COL.o,align:'right'})}
    else{ctx.strokeStyle=COL.muted;ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.strokeRect(E.x+12,E.y+12,E.w-24,E.h-24);ctx.setLineDash([]);txt(ctx,'pereți conductori — se pierde căldură spre exterior (20 °C)',E.x+E.w-18,E.y+E.h+12,{font:MONO,color:COL.a,align:'right'})}
    const iw=E.w-60,sz=ms().map(m=>Math.cbrt(m)),tot=sz.reduce((a,b)=>a+b,0),bh=E.h-56;let x=E.x+30+(iw-tot/Math.max(...sz)*bh*.8)/2;
    const rects=[];sz.forEach((s,i)=>{const bw=Math.min(iw/n-4,s/Math.max(...sz)*bh*.8),hh=bh*(.55+.45*s/Math.max(...sz));rects.push([x,E.y+E.h-28-hh,bw,hh]);x+=bw});
    rects.forEach(([x,y,bw,hh],i)=>{body(ctx,x,y,bw,hh,M[i],T[i]/100);window.PraxisCanvasTypography.textInBox(ctx,`${i+1}: ${M[i].n}`,{x,y:y+4,w:bw,h:22},{font:'600 11px "JetBrains Mono", monospace',color:COL.r});window.PraxisCanvasTypography.textInBox(ctx,f(T[i],1)+' °C',{x,y:y+hh/2-8,w:bw,h:28},{font:SERIF(16,600),color:COL.r})});
    // săgeți de căldură între corpuri
    for(let i=0;i<n-1;i++){const fl=kap*(T[i]-T[i+1]),[x1,y1,w1,h1]=rects[i],xm=x1+w1,ym=y1+h1*.72;if(Math.abs(T[i]-T[i+1])<.05||!on&&!time)continue;const d=Math.sign(fl),L=26,wd=clamp(Math.abs(T[i]-T[i+1])/12,1,7);
      drawArrowPx(ctx,xm-d*L,ym,xm+d*L,ym,COL.a,{w:wd});txt(ctx,'Q',xm,ym-14,{color:COL.a})}
    if(!S.t.adiab&&(on||time))rects.forEach(([x,y,bw])=>{const tt=(S.time*.8)%1;ctx.globalAlpha=1-tt;drawArrowPx(ctx,x+bw/2,y-4-tt*10,x+bw/2,y-22-tt*14,COL.a,{w:1.6});ctx.globalAlpha=1});
    // graficul t(τ)
    const b={x:54,y:E.y+E.h+50,w:w-100,h:h-E.y-E.h-90},tmax=Math.max(10,time*1.1),lo=Math.min(TENV,...T0)-5,hi=Math.max(...T0)+5;
    const {X,Y}=axes(ctx,b,[0,tmax],[lo,hi],{xl:'timp',yl:'t (°C)',yt:T0.map((t,i)=>[t,f(t,0)])});
    const cols=[COL.a,COL.b,COL.o];
    const teq=C.reduce((s,c,i)=>s+c*T0[i],0)/C.reduce((a,b)=>a+b,0);
    line(ctx,b.x,Y(teq),b.x+b.w,Y(teq),COL.c,1.2,[5,4]);txt(ctx,`t_ech = ${f(teq,1)} °C (calculat)`,b.x+b.w-4,Y(teq)-10,{align:'right',font:MONO,color:COL.c});
    for(let k=1;k<=n;k++){ctx.beginPath();hist.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[k])):ctx.moveTo(X(q[0]),Y(q[k])));ctx.strokeStyle=cols[k-1];ctx.lineWidth=2.4;ctx.stroke()}
    // bilanț
    const Q=T.map((t,i)=>C[i]*(t-T0[i])),prim=Q.filter(q=>q>0).reduce((a,b)=>a+b,0),ced=-Q.filter(q=>q<0).reduce((a,b)=>a+b,0);
    S.out('Q1',sci(Q[0]/1000,2)+' kJ');S.out('Q2',sci(Q[1]/1000,2)+' kJ');S.out('Q3',n>2?sci(Q[2]/1000,2)+' kJ':'—');
    S.out('prim',sci(prim/1000,2)+' kJ');S.out('ced',sci(ced/1000,2)+' kJ');S.out('teq',f(teq,1)+' °C');
    S.out('hint',!time?'Corpurile sunt separate. Pune-le în contact și urmărește căldurile Q = m·c·(t − t₀).':
      !S.t.adiab?`Fără înveliș adiabatic: Σ|Q_cedat| − ΣQ_primit = ${f((ced-prim)/1000,2)} kJ s-au pierdut în exterior. Ecuația calorimetrică nu mai este valabilă.`:
      eqDone?`Echilibru termic la ${f(T[0],1)} °C. ΣQ_primit = Σ|Q_cedat| = ${sci(prim/1000,2)} kJ — ecuația calorimetrică.`:
      'Corpul cald cedează căldură, cel rece primește. Cele două sume cresc la fel de repede.')};
})();

/* ---------- Fig. 4 — Calorimetrul (Fig. 1.2.1 din manual, interactiv) ---------- */
(()=>{const S=new Sim('#fig4');const mini=S.cv[1],mctx=mini.getContext('2d');
  const PARTS={V1:['V₁ — vasul exterior','Protejează vasul interior; între cele două vase rămâne un strat de aer.'],
    V2:['V₂ — vasul interior','Conține apa (sau lichidul) în care au loc schimburile de căldură. Este de obicei din metal subțire, lustruit: absoarbe și radiază puțină căldură.'],
    C:['C — capacul','Acoperă ambele vase și oprește pierderile prin convecție și evaporare. Are orificii pentru termometru și agitator.'],
    T:['T — termometrul','Măsoară temperatura apei. Rezervorul lui trebuie să fie cufundat în lichid.'],
    A:['A — agitatorul','Amestecă lichidul ca temperatura să devină aceeași peste tot — altfel termometrul arată doar temperatura stratului în care se află.'],
    D:['D — distanțierii izolatori','Suporturi mici din material izolator (plută, plastic): vasul interior atinge vasul exterior doar în câteva puncte, deci conducția este redusă.'],
    aer:['Stratul de aer','Aerul conduce foarte slab căldura; închis între vase, nu poate face nici curenți de convecție mari. Este „izolatorul” principal.'],
    apa:['Apa','Corpul de lucru: căldura cedată de corpul cald este primită de apă (și, puțin, de vasul V₂).']};
  let hov=null,sel=null,hits=[],L=[20,20,20,20,20,20],stir=0,agY=0,curves=null,mt=0;
  const mean=()=>L.reduce((a,b)=>a+b,0)/L.length;
  function pour(){L=[70,62,48,34,24,20];curves={t0:mean(),k1:1/40,k2:1/4.5};mt=0;SND.pour(1.2)}
  S.act=a=>{if(a==='pour')pour();if(a==='stir'){stir=2.2;SND.stir()}if(a==='reset'){L=[20,20,20,20,20,20];curves=null;mt=0;sel=null;SND.tick()}};
  S.step=dt=>{S.time+=dt;const mix=stir>0?6:.05;stir=Math.max(0,stir-dt);agY=stir>0?Math.sin(S.time*9)*.5+.5:lerp(agY,0,.1);
    const n=[...L];for(let i=0;i<L.length;i++){const up=i?L[i-1]:L[i],dn=i<L.length-1?L[i+1]:L[i];n[i]+=mix*dt*(up+dn-2*L[i])*.5}
    if(stir>0){const m=n.reduce((a,b)=>a+b,0)/n.length;for(let i=0;i<n.length;i++)n[i]=lerp(n[i],m,dt*2.5)}
    L=n;if(stir>0&&Math.random()<dt*3)SND.stir();if(curves)mt=Math.min(60,mt+dt*4)};
  const hit=(x,y)=>{for(const h of hits)if(x>=h[1]&&x<=h[1]+h[3]&&y>=h[2]&&y<=h[2]+h[4])return h[0];return null};
  S.c.addEventListener('pointermove',e=>{const [x,y]=S.pt(e),k=hit(x,y);if(k!==hov){hov=k;S.c.style.cursor=k?'pointer':'default';S.render()}});
  S.c.addEventListener('pointerleave',()=>{hov=null;S.render()});
  S.c.addEventListener('click',e=>{const [x,y]=S.pt(e),k=hit(x,y);sel=k;if(k){SND.tick();if(k==='A'){stir=2.2;SND.stir()}}S.render()});
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);hits=[];
    const W=Math.min(w-130,480),x0=(w-W)/2,y0=70,H=h-110;
    const o={x:x0,y:y0+46,w:W,h:H-46},inn={x:x0+W*.22,y:y0+H*.42,w:W*.56,h:H*.5};
    const hl=k=>k===hov||k===sel;
    // V1
    ctx.fillStyle=hl('V1')?'rgba(31,90,138,.12)':'rgba(235,227,209,.6)';ctx.fillRect(o.x,o.y,o.w,o.h);
    ctx.strokeStyle=COL.r;ctx.lineWidth=hl('V1')?4:2.4;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x,o.y+o.h);ctx.lineTo(o.x+o.w,o.y+o.h);ctx.lineTo(o.x+o.w,o.y);ctx.stroke();
    // aer
    if(hl('aer')){ctx.fillStyle='rgba(42,127,134,.14)';ctx.fillRect(o.x+3,o.y+3,o.w-6,o.h-6)}
    hits.push(['V1',o.x-8,o.y,14,o.h],['V1',o.x+o.w-6,o.y,14,o.h]);
    // D — distanțieri
    const dy=inn.y+inn.h;[inn.x+inn.w*.2,inn.x+inn.w*.8].forEach(xx=>{ctx.fillStyle=hl('D')?COL.o:'#6f6a5f';ctx.beginPath();ctx.moveTo(xx-11,o.y+o.h);ctx.lineTo(xx,dy);ctx.lineTo(xx+11,o.y+o.h);ctx.closePath();ctx.fill();hits.push(['D',xx-14,dy,28,o.y+o.h-dy])});
    // V2 cu apă stratificată
    const lh=inn.h*.78/L.length,wy=inn.y+inn.h*.22;
    L.forEach((t,i)=>{ctx.fillStyle=heat((t-15)/60,hl('apa')?.75:.55);ctx.fillRect(inn.x,wy+i*lh,inn.w,lh+1)});
    ctx.strokeStyle=COL.r;ctx.lineWidth=hl('V2')?4:2.4;ctx.beginPath();ctx.moveTo(inn.x,inn.y);ctx.lineTo(inn.x,dy);ctx.lineTo(inn.x+inn.w,dy);ctx.lineTo(inn.x+inn.w,inn.y);ctx.stroke();
    hits.push(['apa',inn.x+inn.w*.5,wy+8,inn.w*.22,inn.h*.6],['V2',inn.x-7,inn.y,14,inn.h],['V2',inn.x+inn.w-7,inn.y,14,inn.h],['V2',inn.x,dy-6,inn.w,12]);
    // C — capacul (două trepte)
    ctx.fillStyle=hl('C')?COL.o:'#8f8a7e';ctx.fillRect(o.x-24,o.y-22,o.w+48,20);ctx.fillRect(inn.x-14,o.y-2,inn.w+28,14);
    hits.push(['C',o.x-24,o.y-22,o.w+48,20]);
    // T — termometru (rezervorul în stratul de jos)
    const tx=inn.x+inn.w*.26,ty=y0-20,tb=dy-26;thermo(ctx,tx,ty,tb-ty,L[L.length-2],0,100,{r:hl('T')?7:6,lx:-74,ly:ty+14});
    hits.push(['T',tx-10,ty,20,tb-ty+18]);
    // A — agitator
    const ax=inn.x+inn.w*.66,ay=agY*inn.h*.32;ctx.fillStyle=hl('A')?COL.a:COL.r;ctx.fillRect(ax-5,y0-46-ay,10,dy-y0+20);ctx.beginPath();ctx.ellipse(ax,dy-24-ay,inn.w*.16,7,0,0,TAU);ctx.fill();
    hits.push(['A',ax-10,y0-46,20,dy-y0+20]);
    if(stir>0)for(let i=0;i<3;i++){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(ax+(i-1)*22,wy+inn.h*.5-ay*.4,8+i*2,0,Math.PI);ctx.stroke()}
    // etichete ca în manual
    const lab=(k,s,x,y,tx2,ty2)=>{window.PraxisCanvasTypography.textInBox(ctx,s,{x:x-22,y:y-15,w:44,h:30},{font:SERIF(18,hl(k)?700:500),color:hl(k)?COL.a:COL.r});if(tx2!=null)drawArrowPx(ctx,x+(tx2>x?10:-10),y,tx2,ty2,hl(k)?COL.a:COL.r,{w:1.2,head:.6});hits.push([k,x-22,y-22,44,44])};
    lab('V1','V₁',o.x-44,o.y+o.h*.5,o.x-2,o.y+o.h*.5);lab('V2','V₂',o.x+o.w+40,inn.y+inn.h*.55,inn.x+inn.w+2,inn.y+inn.h*.55);
    lab('C','C',o.x+o.w+30,o.y-50,o.x+o.w+10,o.y-18);lab('T','T',tx-26,ty+4);lab('A','A',ax+26,y0-34);
    lab('D','D',inn.x-60,o.y+o.h-10,inn.x+inn.w*.2-12,o.y+o.h-8);lab('aer','aer',o.x+o.w+40,o.y+o.h-16,o.x+o.w-4,o.y+o.h-16);lab('apa','apă',inn.x-60,wy+inn.h*.35,inn.x-2,wy+inn.h*.35);
    // fluxuri de căldură spre exterior (mici)
    if(S.t.flux){const g=(mean()-20)/50;if(g>.02){[[inn.x-4,inn.y+inn.h*.6,o.x+6,inn.y+inn.h*.6],[inn.x+inn.w+4,inn.y+inn.h*.6,o.x+o.w-6,inn.y+inn.h*.6],[inn.x+inn.w*.5,o.y-4,inn.x+inn.w*.5,o.y-40]].forEach(([a,b,c,d])=>drawArrowPx(ctx,a,b,c,d,COL.a,{w:1+g*2,dash:[4,4],alpha:.7}))
      txt(ctx,'pierderi mici: aer, distanțieri, capac',w/2,h-18,{font:MONO,color:COL.a})}}
    // ieșiri
    const sp=Math.max(...L)-Math.min(...L);
    S.out('tT',f(L[L.length-2],1)+' °C');S.out('tm',f(mean(),1)+' °C');S.out('sp',f(sp,1)+' K');
    S.out('hint',sel?`<b>${PARTS[sel][0]}</b> — ${PARTS[sel][1]}`:sp>2?'Apa este stratificată: sus e mai caldă. Termometrul arată temperatura stratului în care se află — folosește agitatorul!':'Atinge (sau treci cu mouse-ul peste) o piesă pentru explicație. „Toarnă apă caldă” peste apa rece și apoi agită.');
    drawMini()};
  // mini-grafic: răcirea apei în calorimetru și într-un pahar obișnuit
  function drawMini(){const w=mini._w,h=mini._h;if(!w)return;mctx.clearRect(0,0,w,h);grid(mctx,w,h,24,.4);
    const b={x:52,y:20,w:w-80,h:h-48};const {X,Y}=axes(mctx,b,[0,60],[15,50],{xl:'min',yl:'t (°C)',xt:[[0,'0'],[30,'30'],[60,'60']],yt:[[20,'20'],[45,'45']]});
    if(!curves){txt(mctx,w<520?'Toarnă apă caldă: calorimetru vs. pahar.':'Toarnă apă caldă: comparăm răcirea în calorimetru și într-un pahar obișnuit.',b.x+b.w/2,b.y+b.h/2,{font:SERIF(13),color:COL.muted});return}
    [[curves.k1,COL.c,'calorimetru'],[curves.k2,COL.a,'pahar']].forEach(([k,c,l])=>{mctx.beginPath();for(let t=0;t<=mt;t+=.5){const v=20+(45-20)*Math.exp(-k*t);t?mctx.lineTo(X(t),Y(v)):mctx.moveTo(X(t),Y(v))}mctx.strokeStyle=c;mctx.lineWidth=2.4;mctx.stroke();
      const v=20+25*Math.exp(-k*mt);txt(mctx,`${l} ${f(v,1)} °C`,Math.min(X(mt)+6,b.x+b.w-110),Y(v)-10,{align:'left',font:'600 11px "JetBrains Mono", monospace',color:c})})}
})();
