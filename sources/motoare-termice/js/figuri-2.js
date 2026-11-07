/* =====================================================================
   Figurile 6–9: ciclurile Carnot, Otto, Diesel și Rankine (1 mol de gaz)
   V în litri, p = RT/V în kPa, căldurile și lucrul mecanic în jouli
   ===================================================================== */
const R=8.31;
// starea (V, T) la fracțiunea s dintr-o transformare a → b
// tip: 'T' izotermă, 'S' adiabată, 'V' izocoră, 'p' izobară
function legAt(a,b,tp,s,g){
  if(tp==='T')return {V:a.V*Math.pow(b.V/a.V,s),T:a.T};
  if(tp==='S'){const V=a.V*Math.pow(b.V/a.V,s);return {V,T:a.T*Math.pow(a.V/V,g-1)}}
  if(tp==='V')return {V:a.V,T:lerp(a.T,b.T,s)};
  const V=lerp(a.V,b.V,s);return {V,T:a.T*V/a.V};
}
function legQ(a,b,tp,g){const Cv=R/(g-1);
  if(tp==='T')return R*a.T*Math.log(b.V/a.V);if(tp==='S')return 0;if(tp==='V')return Cv*(b.T-a.T);return g*Cv*(b.T-a.T)}
const pk=(st)=>R*st.T/st.V; // kPa
// pas „rotund” pentru gradațiile axelor
function niceStep(span,n=5){const r=span/n,p=Math.pow(10,Math.floor(Math.log10(r))),m=r/p;return (m<1.5?1:m<3.5?2:m<7.5?5:10)*p}
function ticks(max,n=5){const s=niceStep(max,n),out=[];for(let v=s;v<=max*1.0001;v+=s)out.push([v,s>=1?f(v,0):f(v,s>=.1?1:2)]);return out}
const kJ=q=>Math.abs(q)>=1e4?f(q/1000,1)+' kJ':f(q,0)+' J';
const pct=x=>f(x*100,1)+' %';

// Schelet comun: o figură cu un ciclu în 4 transformări pe diagrama p–V
function CycleFig(sel,cfg){
  const S=new Sim(sel,{fmt:cfg.fmt});let u=0,run=false,target=null,started=false;
  const tab=cfg.tab?$(cfg.tab):null,rows=tab?$$('tr[data-st]',tab):[];
  const setRun=v=>{run=v;S.label('run',v?'Pauză':'Parcurge ciclul',v?'#i-pause':'#i-play')};
  S.act=(a,b)=>{if(a==='run'){target=null;started=true;setRun(!run);SND.tick()}
    else if(a==='step'){started=true;setRun(false);target=Math.floor(u+1e-6)+1;SND.tick()}
    else cfg.act&&cfg.act(S,a,b)};
  S.onParam=k=>cfg.onParam&&cfg.onParam(S,k);
  S.step=dt=>{S.time+=dt;if(!run&&target===null)return;const c=S.c4,old=u;u+=dt/1.5;
    if(target!==null&&u>=target){u=target;target=null}
    if(Math.floor(old+1e-9)!==Math.floor(u+1e-9)){const i=Math.floor(u+1e-9)%4;if(u>=4-1e-9){u=0;SND.chime()}else SND.tick(.25);
      if(c&&cfg.onLeg)cfg.onLeg(S,i,c)}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const c=cfg.build(S);S.c4=c;const {P,legs,g}=c,side=w>=620;
    c.Q=legs.map((tp,i)=>legQ(P[i],P[(i+1)%4],tp,g));
    c.Qp=c.Q.filter(q=>q>0).reduce((a,b)=>a+b,0);c.Qc=-c.Q.filter(q=>q<0).reduce((a,b)=>a+b,0);c.L=c.Qp-c.Qc;c.eta=c.L/c.Qp;
    const samp=(i,n=60)=>{const a=P[i],b=P[(i+1)%4],o=[];for(let k=0;k<=n;k++)o.push(legAt(a,b,legs[i],k/n,g));return o};
    const all=[0,1,2,3].map(i=>samp(i));
    let Vm=Math.max(...P.map(s=>s.V)),pm=Math.max(...P.map(pk));if(c.ext){Vm=Math.max(Vm,c.ext.V||0);pm=Math.max(pm,c.ext.p||0)}
    const b={x:62,y:34,w:w-62-(side?168:24),h:h-80},xr=[0,Vm*1.08],yr=[0,pm*1.1];
    const {X,Y}=axes(ctx,b,xr,yr,{xlb:1,xl:'V (L)',yl:'p (kPa)',xt:ticks(xr[1]),yt:ticks(yr[1],6)});
    const xy=s=>[X(s.V),Y(pk(s))];
    // izotermele de fond (opționale)
    ctx.save();ctx.beginPath();ctx.rect(b.x,b.y-10,b.w+10,b.h+10);ctx.clip();
    (c.iso||[]).forEach(([T,col])=>{ctx.beginPath();for(let k=0;k<=80;k++){const V=lerp(Vm*.02,xr[1],k/80),[x,y]=xy({V,T});k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=col;ctx.globalAlpha=.4;ctx.lineWidth=1;ctx.setLineDash([2,4]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
      const [lx,ly]=xy({V:xr[1]*.93,T});txt(ctx,`T = ${f(T,0)} K`,lx,ly-10,{align:'right',font:MONO,color:col})});
    // aria = lucrul mecanic
    ctx.beginPath();all.flat().forEach((s,k)=>{const [x,y]=xy(s);k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fillStyle='rgba(176,122,18,.16)';ctx.fill();
    if(cfg.overlay)cfg.overlay(S,ctx,xy,c,b);
    const cur=Math.floor(u+1e-9)%4,su=u-Math.floor(u+1e-9);
    all.forEach((pts,i)=>{const q=c.Q[i],col=q>1e-6?COL.a:q<-1e-6?COL.b:COL.r;ctx.beginPath();pts.forEach((s,k)=>{const [x,y]=xy(s);k?ctx.lineTo(x,y):ctx.moveTo(x,y)});
      ctx.strokeStyle=col;ctx.lineWidth=started&&i===cur?4:2.4;ctx.stroke();
      const m1=xy(pts[27]),m2=xy(pts[33]);drawArrowPx(ctx,m1[0],m1[1],m2[0],m2[1],col,{w:2,head:.9})});
    ctx.restore();
    const cx0=P.reduce((a,s)=>a+xy(s)[0],0)/4,cy0=P.reduce((a,s)=>a+xy(s)[1],0)/4;
    P.forEach((s,i)=>{const [x,y]=xy(s),dx=x-cx0,dy=y-cy0,L=Math.hypot(dx,dy)||1;dot(ctx,x,y,4,'#fff',COL.r);txt(ctx,String(i+1),x+dx/L*15,y+dy/L*15,{font:SERIF(16,700)})});
    txt(ctx,'L = aria ciclului',b.x+b.w-6,b.y+4,{align:'right',font:SERIF(14),color:COL.o});
    // punctul mobil
    const st=legAt(P[cur],P[(cur+1)%4],legs[cur],su,g),[mx,my]=xy(st);
    if(started){ctx.strokeStyle='rgba(200,64,42,.3)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(mx,my,9+2*Math.sin(S.time*6),0,TAU);ctx.stroke()}dot(ctx,mx,my,5.5,COL.a);
    // cilindrul lateral: piston, gaz, rezervorul cu care schimbă căldură
    if(side){const Tmin=Math.min(...P.map(s=>s.T)),Tmax=Math.max(...P.map(s=>s.T)),q=c.Q[cur];
      const cx=w-84,cw=70,top=46,Hc=h-200,yp=top+Hc*(1-st.V/Vm*.92);
      ctx.fillStyle=heat((st.T-Tmin)/(Tmax-Tmin||1)*.85+.1,.45);ctx.fillRect(cx-cw/2,yp,cw,top+Hc-yp);
      ctx.strokeStyle=COL.r;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(cx-cw/2,top-10);ctx.lineTo(cx-cw/2,top+Hc);ctx.lineTo(cx+cw/2,top+Hc);ctx.lineTo(cx+cw/2,top-10);ctx.stroke();
      ctx.fillStyle='#9aa0aa';ctx.fillRect(cx-cw/2+2,yp-14,cw-4,14);ctx.fillStyle='#5a5e68';ctx.fillRect(cx-4,top-24,8,yp-14-top+24);
      txt(ctx,f(st.T,0)+' K',cx,top+Hc-16,{font:MONOB});
      const ry=top+Hc+8,rh=46,lab=q>1e-6?'sursa caldă':q<-1e-6?'sursa rece':'izolat';
      if(Math.abs(q)>1e-6){ctx.fillStyle=q>0?'rgba(200,64,42,.25)':'rgba(31,90,138,.25)';rrect(ctx,cx-55,ry,110,rh,6);ctx.fill();if(q>0&&started)flame(ctx,cx,ry+rh-6,.5,S.time);
        if(started){const yy=ry-2,dd=q>0?-1:1;drawArrowPx(ctx,cx+44,dd<0?yy+12:yy-16,cx+44,dd<0?yy-16:yy+12,q>0?COL.a:COL.b,{w:2.2})}}
      else{ctx.fillStyle='#ebe3d1';rrect(ctx,cx-55,ry,110,rh,6);ctx.fill();ctx.save();ctx.beginPath();ctx.rect(cx-55,ry,110,rh);ctx.clip();ctx.strokeStyle='rgba(111,106,95,.45)';for(let k=-60;k<120;k+=10){ctx.beginPath();ctx.moveTo(cx-55+k,ry+rh);ctx.lineTo(cx-55+k+rh,ry);ctx.stroke()}ctx.restore()}
      txt(ctx,lab,cx,ry+rh+14,{font:MONO,color:q>1e-6?COL.a:q<-1e-6?COL.b:COL.muted});
      const tl=['','izotermă','adiabată','izocoră','izobară'][' TSVp'.indexOf(legs[cur])];txt(ctx,`${cur+1}→${(cur+1)%4+1} · ${tl}`,cx,22,{font:MONOB})}
    rows.forEach((r,i)=>r.classList.toggle('on',started&&i===cur));
    if(S.cv[1]){const m=S.cv[1],mc=m.getContext('2d');if(m._w){mc.clearRect(0,0,m._w,m._h);cfg.mini(S,mc,m._w,m._h,c,cur,su)}}
    cfg.out(S,c,cur,started)};
  return S;
}
// mini-grafic: curbe η(ε) cu marcaj pentru valoarea curentă
function etaPlot(ctx,w,h,curves,mark,o={}){const b={x:46,y:16,w:w-70,h:h-44},xr=o.xr||[1,25],{X,Y}=axes(ctx,b,xr,[0,1],{xl:'ε',yl:'η',xt:o.xt||[[5,'5'],[10,'10'],[15,'15'],[20,'20']],yt:[[.5,'50 %'],[1,'100 %']]});
  const ve=curves.map(c=>c[0](xr[1]*.97)),top=Math.max(...ve.filter(isFinite));
  curves.forEach(([fn,col,lab,dash],ci)=>{ctx.beginPath();let first=true;for(let k=0;k<=120;k++){const e=lerp(xr[0],xr[1],k/120),v=fn(e);if(!isFinite(v)||v<0){first=true;continue}const [x,y]=[X(e),Y(clamp(v,0,1))];first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false}
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash(dash||[]);ctx.stroke();ctx.setLineDash([]);
    const e=xr[1]*.97,v=fn(e);if(isFinite(v))txt(ctx,lab,X(e),Y(v)+(curves.length>1&&v<top?13:-10),{align:'right',font:MONO,color:col})});
  if(o.hline!=null){line(ctx,b.x,Y(o.hline),b.x+b.w,Y(o.hline),COL.c,1.2,[5,4]);txt(ctx,o.hlab||'',b.x+6,Y(o.hline)-9,{align:'left',font:MONO,color:COL.c})}
  if(mark){const mx=X(mark[0]),my=Y(mark[1]);line(ctx,mx,my,mx,b.y+16,'rgba(200,64,42,.45)',1,[3,3]);dot(ctx,mx,my,5,COL.a,'#fff');txt(ctx,pct(mark[1]),mx,b.y+8,{font:MONOB,color:COL.a})}}

/* ---------- Fig. 6 — Ciclul Carnot ---------- */
CycleFig('#fig6',{fmt:{Tc:v=>v+' K',Tr:v=>v+' K',k:v=>f(v,1)},
  build(S){const g=S.mode==='mono'?5/3:1.4,{Tc,Tr,k}=S.p,V1=5,fV=Math.pow(Tc/Tr,1/(g-1));
    return {g,legs:['T','S','T','S'],P:[{V:V1,T:Tc},{V:V1*k,T:Tc},{V:V1*k*fV,T:Tr},{V:V1*fV,T:Tr}],iso:[[Tc,COL.a],[Tr,COL.b]]}},
  onLeg(S,i){if(i===0||i===2)SND.whoosh()},
  mini(S,ctx,w,h,c,cur,su){const prog=i=>i<cur?1:i===cur?su:0,qin=prog(0)*c.Q[0],qout=-prog(2)*c.Q[2];let Lp=0;
    for(let i=0;i<4;i++){const p=prog(i);if(!p)continue;const a=c.P[i],b=legAt(a,c.P[(i+1)%4],c.legs[i],p,c.g);Lp+=p*c.Q[i]-R/(c.g-1)*(b.T-a.T)}
    const bars=[['Q_p primită',c.Qp,qin,COL.a],['|Q_c| cedată',c.Qc,qout,COL.b],['L efectuat',c.L,Lp,COL.o]],x0=Math.min(130,w*.3),bw=w-x0-90,bh=Math.min(22,(h-30)/3-10);
    bars.forEach(([s,v,p,col],i)=>{const y=14+i*(bh+12);txt(ctx,s,x0-10,y+bh/2,{align:'right',font:SERIF(14,600),color:col});
      ctx.fillStyle='rgba(217,207,186,.55)';rrect(ctx,x0,y,bw*v/c.Qp,bh,4);ctx.fill();ctx.fillStyle=col;ctx.globalAlpha=.75;rrect(ctx,x0,y,Math.max(0,bw*clamp(p,0,v)/c.Qp),bh,4);ctx.fill();ctx.globalAlpha=1;
      txt(ctx,kJ(v),x0+bw*v/c.Qp+8,y+bh/2,{align:'left',font:MONOB,color:col})})},
  out(S,c){const {Tc,Tr}=S.p;S.out('Qp',kJ(c.Qp));S.out('Qc',kJ(c.Qc));S.out('L',kJ(c.L));S.out('r34',f(c.P[2].V/c.P[3].V,2)+' = V₂/V₁');S.out('eta',pct(c.eta));S.out('etaC',pct(1-Tr/Tc));
    S.out('hint',`Q<sub>p</sub> = νRT<sub>c</sub>ln(V<sub>2</sub>/V<sub>1</sub>), |Q<sub>c</sub>| = νRT<sub>r</sub>ln(V<sub>3</sub>/V<sub>4</sub>), iar adiabatele impun V<sub>3</sub>/V<sub>4</sub> = V<sub>2</sub>/V<sub>1</sub>. Rezultă η<sub>C</sub> = 1 − T<sub>r</sub>/T<sub>c</sub> = ${pct(1-Tr/Tc)} — nu depinde de V<sub>2</sub>/V<sub>1</sub> și nici de gaz${S.mode==='mono'?' (schimbă tabul: η rămâne același)':''}. Este cel mai mare randament posibil între ${Tc} K și ${Tr} K.`)}});

/* ---------- Fig. 7 — Ciclul Otto ---------- */
CycleFig('#fig7',{tab:'#tab-otto',fmt:{eps:v=>v%1?f(v,1):String(v),T3:v=>v+' K'},
  build(S){const g=S.mode==='mono'?5/3:1.4,e=S.p.eps,T1=300,V1=24.93,T2=T1*Math.pow(e,g-1),T3=Math.max(S.p.T3,T2*1.05),T4=T3/Math.pow(e,g-1);
    const c={g,legs:['S','V','S','V'],P:[{V:V1,T:T1},{V:V1/e,T:T2},{V:V1/e,T:T3},{V:V1,T:T4}],clampT:T3>S.p.T3};
    if(S.t.carnot){const Va=V1/2.5,Vb=Va*Math.pow(T1/T3,1/(g-1)),Vc=V1*Math.pow(T1/T3,1/(g-1));c.car={Va,Vb,Vc,V1,T1,T3,pmax:R*T3/Vb}}return c},
  onLeg(S,i){if(i===1)SND.knock()},
  overlay(S,ctx,xy,c){if(!c.car)return;const {Va,Vb,Vc,V1,T1,T3}=c.car,g=c.g;ctx.save();ctx.setLineDash([6,4]);ctx.strokeStyle=COL.c;ctx.lineWidth=1.8;ctx.beginPath();
    const pts=[];for(let k=0;k<=40;k++)pts.push({V:V1*Math.pow(Va/V1,k/40),T:T1});for(let k=0;k<=40;k++){const V=Va*Math.pow(Vb/Va,k/40);pts.push({V,T:T1*Math.pow(Va/V,g-1)})}
    for(let k=0;k<=40;k++)pts.push({V:Vb*Math.pow(Vc/Vb,k/40),T:T3});for(let k=0;k<=40;k++){const V=Vc*Math.pow(V1/Vc,k/40);pts.push({V,T:T3*Math.pow(Vc/V,g-1)})}
    pts.forEach((s,k)=>{const [x,y]=xy(s);k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.restore();
    const [lx,ly]=xy({V:Va,T:T1});txt(ctx,'Carnot (T₁, T₃)',lx,ly-16,{font:MONO,color:COL.c})},
  mini(S,ctx,w,h){const g=S.mode==='mono'?5/3:1.4,eO=(e,gg)=>1-1/Math.pow(e,gg-1);
    etaPlot(ctx,w,h,[[e=>eO(e,1.4),COL.a,'γ = 1,4'],[e=>eO(e,5/3),COL.plum,'γ = 5/3',[5,4]]],[S.p.eps,eO(S.p.eps,g)],{xr:[1,15],xt:[[5,'5'],[8,'8'],[10,'10'],[14,'14']]})},
  out(S,c){const [p1,p2,p3,p4]=c.P,etaC=1-p1.T/p3.T,etaO=1-1/Math.pow(S.p.eps,c.g-1);
    S.out('T12',`${f(p1.T,0)} K / ${f(p2.T,0)} K`);S.out('T34',`${f(p3.T,0)} K / ${f(p4.T,0)} K`);S.out('Q',`${f(c.Q[1]/1000,1)} / ${f(-c.Q[3]/1000,1)} kJ`);S.out('eta',pct(etaO));S.out('etaC',pct(etaC));S.out('L',kJ(c.L));
    S.out('hint',c.clampT?`T<sub>3</sub> trebuie să fie mai mare decât T<sub>2</sub> = ${f(p2.T,0)} K (arderea încălzește gazul). Am folosit T<sub>3</sub> = ${f(p3.T,0)} K.`:
      c.car?`Ciclul Carnot între T<sub>1</sub> = 300 K și T<sub>3</sub> = ${f(p3.T,0)} K ar avea η<sub>C</sub> = ${pct(etaC)} > η<sub>O</sub> = ${pct(etaO)}, dar ar cere presiuni de ≈ ${f(c.car.pmax/1000,0)} MPa — imposibil în practică.`:
      `η<sub>O</sub> = 1 − 1/ε<sup>γ−1</sup> = 1 − 1/${S.p.eps}<sup>${c.g===1.4?'0,4':'2/3'}</sup> = ${pct(etaO)}. Depinde numai de ε și γ — modifică T<sub>3</sub>: aria (L) se schimbă, randamentul nu.`)}});

/* ---------- Fig. 8 — Ciclul Diesel ---------- */
(()=>{const etaD=(e,r,g)=>1-(Math.pow(r,g)-1)/(g*Math.pow(e,g-1)*(r-1)),etaO=(e,g)=>1-1/Math.pow(e,g-1);
CycleFig('#fig8',{tab:'#tab-diesel',fmt:{eps:v=>v%1?f(v,1):String(v),rho:v=>f(v,1),g:v=>f(v,2)},
  build(S){const g=S.p.g,e=S.p.eps,r=Math.min(S.p.rho,e-.5),T1=300,V1=24.93,V2=V1/e,T2=T1*Math.pow(e,g-1),T3=T2*r,T4=T3*Math.pow(r*V2/V1,g-1);
    const c={g,r,legs:['S','p','S','V'],P:[{V:V1,T:T1},{V:V2,T:T2},{V:r*V2,T:T3},{V:V1,T:T4}]};
    if(S.t.otto){const Q=g*R/(g-1)*(T3-T2),T3o=T2+Q*(g-1)/R;c.oT=T3o;c.ext={p:R*T3o/V2}}return c},
  act(S,a){if(a==='app'){setK(S,'eps',10);setK(S,'rho',2);setK(S,'g',1.4);SND.ok();toast('ε = 10, ρ = 2, γ = 1,4 → η Diesel = 53,4 %, iar η Carnot = 80,1 %.')}},
  onLeg(S,i){if(i===1)SND.knock()},
  overlay(S,ctx,xy,c){if(!c.oT)return;const [p1,p2]=c.P,g=c.g,T4o=c.oT/Math.pow(p1.V/p2.V,g-1),pts=[p2,{V:p2.V,T:c.oT}];
    for(let k=1;k<=50;k++){const V=p2.V*Math.pow(p1.V/p2.V,k/50);pts.push({V,T:c.oT*Math.pow(p2.V/V,g-1)})}pts.push(p1);
    ctx.save();ctx.setLineDash([6,4]);ctx.strokeStyle=COL.plum;ctx.lineWidth=1.8;ctx.beginPath();pts.forEach((s,k)=>{const [x,y]=xy(s);k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.lineTo(...xy({V:p1.V,T:T4o}));ctx.stroke();ctx.restore();
    const [x,y]=xy({V:p2.V,T:c.oT});txt(ctx,'Otto (aceeași căldură primită)',x+10,y+2,{align:'left',font:MONO,color:COL.plum})},
  mini(S,ctx,w,h,c){const g=S.p.g;etaPlot(ctx,w,h,[[e=>etaO(e,g),COL.plum,'Otto',[5,4]],[e=>e>c.r+.2?etaD(e,c.r,g):NaN,COL.a,`Diesel (ρ = ${f(c.r,1)})`]],[S.p.eps,etaD(S.p.eps,c.r,g)])},
  out(S,c){const e=S.p.eps,g=c.g,eD=etaD(e,c.r,g),eC=1-c.P[0].T/c.P[2].T;S.out('eta',pct(eD));S.out('etaC',pct(eC));S.out('etaO',pct(etaO(e,g)));
    S.out('hint',c.r<S.p.rho?'ρ trebuie să fie mai mic decât ε.':
      S.t.otto?`La același ε, ciclul Otto are randament mai mare (${pct(etaO(e,g))} > ${pct(eD)}). Dar Diesel poate lucra la ε mult mai mare (fără detonație), deci în practică câștigă.`:
      `η<sub>D</sub> = 1 − (ρ<sup>γ</sup> − 1)/[γε<sup>γ−1</sup>(ρ − 1)] = ${pct(eD)}, sub limita Carnot între T<sub>1</sub> = 300 K și T<sub>3</sub> = ${f(c.P[2].T,0)} K (${pct(eC)}). Mărirea lui ρ (mai multă motorină) scade randamentul.`)}});
})();

/* ---------- Fig. 9 — Ciclul Rankine ---------- */
(()=>{const etaR=(e,r,g)=>1-g*(e-1)/(Math.pow(e/r,g)*(1+g*(r-1))-1);
CycleFig('#fig9',{tab:'#tab-rankine',fmt:{eps:v=>v%1?f(v,1):String(v),rho:v=>f(v,1)},
  build(S){const g=1.4,e=S.p.eps,r=Math.min(S.p.rho,e-.5),T1=300,V1=24.93,T2=T1*Math.pow(e/r,g),T3=T2*r;
    return {g,r,legs:['V','p','S','p'],P:[{V:V1,T:T1},{V:V1,T:T2},{V:r*V1,T:T3},{V:e*V1,T:T1*e}]}},
  onLeg(S,i){if(i===0)SND.whoosh()},
  mini(S,ctx,w,h,c){etaPlot(ctx,w,h,[[e=>e>c.r+.2?etaR(e,c.r,1.4):NaN,COL.a,`Rankine (ρ = ${f(c.r,1)})`]],[S.p.eps,etaR(S.p.eps,c.r,1.4)],{xr:[1,16],xt:[[4,'4'],[8,'8'],[12,'12'],[16,'16']]})},
  out(S,c){const eR=etaR(S.p.eps,c.r,1.4),T3=c.P[2].T;S.out('eta',pct(eR));S.out('Tr',`${f(T3,0)} K / 300 K`);S.out('etaC',pct(1-300/T3));
    S.out('hint',c.r<S.p.rho?`ρ trebuie să fie mai mic decât ε (V<sub>3</sub> < V<sub>4</sub>). Am folosit ρ = ${f(c.r,1)}.`:
      `Apa se încălzește în cazan la V = const. (1→2), se vaporizează la p = const. (2→3), aburul se destinde adiabatic în turbină (3→4) și se condensează la p = const. (4→1). η<sub>R</sub> = ${pct(eR)}, sub limita Carnot de ${pct(1-300/T3)}.`)}});
})();
