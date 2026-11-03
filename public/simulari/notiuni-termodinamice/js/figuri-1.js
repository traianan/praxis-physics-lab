/* =====================================================================
   Figurile 0–6: ciclul Otto, stări de agregare, difuzie / mișcare
   browniană, grade de libertate, molul, sisteme, relaxarea spre echilibru
   ===================================================================== */
const randn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v)};
// culoare după „temperatură”: 0 = rece (albastru) … 1 = fierbinte (roșu)
function heat(s,a=1){s=clamp(s,0,1);const r=Math.round(lerp(31,200,s)),g=Math.round(s<.5?lerp(90,122,s*2):lerp(122,64,(s-.5)*2)),b=Math.round(lerp(138,42,s));return `rgba(${r},${g},${b},${a})`}
const SUPS={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
// notație științifică: 6.02·10²³
function sci(x,d=2){if(!isFinite(x))return '—';if(x===0)return '0';const e=Math.floor(Math.log10(Math.abs(x))+1e-9);if(e>=-2&&e<=3)return f(x,d);return `${f(x/10**e,d)}·10${String(e).split('').map(c=>SUPS[c]).join('')}`}
// sistem de axe într-un dreptunghi; întoarce funcțiile de conversie X(v), Y(v)
function axes(ctx,b,xr,yr,o={}){
  const X=v=>b.x+(v-xr[0])/(xr[1]-xr[0])*b.w,Y=v=>b.y+b.h-(v-yr[0])/(yr[1]-yr[0])*b.h;
  ctx.save();ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(b.x,b.y,b.w,b.h);
  if(o.gx){ctx.strokeStyle='rgba(217,207,186,.7)';ctx.lineWidth=1;ctx.beginPath();for(let v=xr[0]+o.gx;v<xr[1]+1e-9;v+=o.gx){ctx.moveTo(X(v),b.y);ctx.lineTo(X(v),b.y+b.h)}ctx.stroke()}
  if(o.gy){ctx.strokeStyle='rgba(217,207,186,.7)';ctx.lineWidth=1;ctx.beginPath();for(let v=yr[0]+o.gy;v<yr[1]+1e-9;v+=o.gy){ctx.moveTo(b.x,Y(v));ctx.lineTo(b.x+b.w,Y(v))}ctx.stroke()}
  ctx.restore();
  drawArrowPx(ctx,b.x,b.y+b.h,b.x+b.w+14,b.y+b.h,COL.r,{w:1.4,head:.7});
  drawArrowPx(ctx,b.x,b.y+b.h,b.x,b.y-14,COL.r,{w:1.4,head:.7});
  txt(ctx,o.xl??'V',b.x+b.w+12,b.y+b.h+16);txt(ctx,o.yl??'p',b.x-14,b.y-10);
  if(o.xt)o.xt.forEach(([v,s])=>txt(ctx,s,X(v),b.y+b.h+14,{font:MONO,color:COL.muted}));
  if(o.yt)o.yt.forEach(([v,s])=>txt(ctx,s,b.x-6,Y(v),{font:MONO,color:COL.muted,align:'right'}));
  return {X,Y};
}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function flame(ctx,x,y,s,t,a=1){ctx.save();ctx.globalAlpha=a;for(let k=0;k<3;k++){const q=1-k*.3,fl=Math.sin(t*14+k*2)*.12;
  ctx.fillStyle=['rgba(200,64,42,.85)','rgba(232,140,40,.9)','rgba(255,214,90,.95)'][k];ctx.beginPath();ctx.moveTo(x-10*s*q,y);
  ctx.quadraticCurveTo(x-12*s*q,y-18*s*q,x+fl*20*s,y-(34+6*Math.sin(t*9+k))*s*q);ctx.quadraticCurveTo(x+12*s*q,y-18*s*q,x+10*s*q,y);ctx.fill()}ctx.restore()}
function playLabel(S,act,on){S.label(act,on?'Pauză':'Pornește',on?'#i-pause':'#i-play')}

/* Ideal Otto and Diesel cycles, using the same states for piston, plot and readouts. */
(()=>{
 const S=new Sim('#fig0',{fmt:{sp:v=>v.toFixed(1)+'×'}});let r=3;
 function makeCycle(){r=S.mode==='diesel'?6:3;return window.PraxisIdealEngineCycles.create(S.mode||'otto',{compression:r,heatRatio:3,cutoff:2.2});}
 let cycle=makeCycle(),ph=0,s=0,run=true;
 const durations=()=>[1,1,cycle.kind==='otto'?.35:.65,1,.35,1];
 const names=()=>['Admisie','Compresie adiabatică',cycle.kind==='otto'?'Încălzire izocoră':'Încălzire izobară','Destindere adiabatică','Răcire izocoră','Evacuare'];
 const colors=()=>[COL.c,COL.o,COL.a,COL.a,COL.b,COL.b];
 const G=()=>{const cx=Math.min(110,S.w*.2)+10,top=64,Lc=clamp((S.h-126)/2.05,60,150),R=Lc*(r-1)/r/2,rod=R*2.4,yc=top+Lc/r+22+rod+R;return {cx,top,Lc,R,rod,yc};};
 function mechanicalState(){
  const point=cycle.point(ph,s),{R,rod,yc}=G(),yp=t=>yc-R*Math.cos(t)-Math.sqrt(rod*rod-(R*Math.sin(t))**2)-22;
  const y0=yp(0),y1=yp(Math.PI),target=y0+(point.V-1)/(r-1)*(y1-y0);let low=0,high=Math.PI;
  for(let i=0;i<32;i++){const mid=(low+high)/2;if(yp(mid)<target)low=mid;else high=mid;}
  const angle=(low+high)/2,th=ph===0?angle:ph===1?2*Math.PI-angle:ph===5?4*Math.PI-angle:2*Math.PI+angle;
  return {...point,th,y:target};
 }
 function advance(){ph=(ph+1)%6;s=0;if(ph===2)SND.rumble(.3,.25);else if(ph===4||ph===5)SND.whoosh();else SND.tick();}
 S.onMode=()=>{cycle=makeCycle();ph=0;s=0;};
 S.step=dt=>{S.time+=dt;if(!run)return;let remaining=dt*S.p.sp*1.3;while(remaining>0){const duration=durations()[ph],until=(1-s)*duration;if(remaining<until){s+=remaining/duration;break;}remaining-=until;advance();}};
 S.act=action=>{if(action==='play'){run=!run;playLabel(S,'play',run);}if(action==='next'){run=false;playLabel(S,'play',false);advance();}};
 S.enginePoint=()=>cycle.point(ph,s);S.engineCycle=()=>cycle;
 S.setEnginePhase=(phase,fraction=0)=>{ph=phase;s=fraction;run=false;playLabel(S,'play',false);S.render();};
 function arrowOn(ctx,X,Y,phase,u,color){
  const a=cycle.point(phase,Math.max(0,u-.025)),b=cycle.point(phase,Math.min(1,u+.025)),x=X((a.V+b.V)/2),y=Y((a.p+b.p)/2),dx=X(b.V)-X(a.V),dy=Y(b.p)-Y(a.p),length=Math.hypot(dx,dy);
  if(length<.01)return;const start=cycle.point(phase,0),end=cycle.point(phase,1),half=Math.min(12,Math.hypot(X(end.V)-X(start.V),Y(end.p)-Y(start.p))/3);drawArrowPx(ctx,x-dx/length*half,y-dy/length*half,x+dx/length*half,y+dy/length*half,color,{w:1.8,head:.65});
 }
 function stateLabel(ctx,text,x,y,dx,dy){ctx.save();ctx.font='600 16px "Source Serif 4",serif';ctx.fillStyle=COL.r;window.PraxisVelocityLabels.label(ctx,text,x+dx,y+dy,{anchor:[x,y],anchorBounds:true});ctx.restore();}
 S.draw=(ctx,w,h)=>{
  grid(ctx,w,h);const st=mechanicalState(),{cx,top,Lc,R,rod,yc}=G(),wb=yc+R-rod+8,cw=Math.min(120,w*.2),gx=cx-cw/2,gy=top;
  const minT=cycle.states[1].p*cycle.states[1].V,maxT=cycle.states[3].p*cycle.states[3].V;
  const hot=ph===0||ph===5?.15:clamp((st.T-minT)/(maxT-minT),0,1);
  ctx.fillStyle=heat(hot,.38);ctx.fillRect(gx,gy,cw,Math.max(0,st.y-gy));
  ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,wb);ctx.lineTo(gx,gy);ctx.lineTo(gx+cw,gy);ctx.lineTo(gx+cw,wb);ctx.stroke();
  [['a',gx+cw*.22,COL.c,'admisie'],['e',gx+cw*.78,COL.b,'evacuare']].forEach(([key,x,color,label])=>{
   const open=key==='a'?ph===0:ph===5;line(ctx,x,gy-34,x,gy-2+(open?9:0),color,3);ctx.fillStyle=color;ctx.fillRect(x-11,gy-4+(open?9:0),22,4);txt(ctx,label,x,gy-44-(key==='e'&&cw<110?14:0),{font:MONO,color});
  });
  ctx.fillStyle=COL.r;ctx.fillRect(cx-3,gy-26,6,24);
  if(ph===2){
   if(cycle.kind==='otto'){for(let k=0;k<6;k++){const angle=k/6*TAU+S.time;line(ctx,cx,gy+4,cx+Math.cos(angle)*12,gy+4+Math.sin(angle)*12,COL.o,2);}}
   else for(let k=0;k<5;k++)line(ctx,cx,gy+2,cx+(k-2)*4,gy+18+(k%2)*5,COL.o,1.5);
  }
  ctx.fillStyle='#5b5f6b';ctx.fillRect(gx+3,st.y,cw-6,22);ctx.fillStyle='#8a8e99';ctx.fillRect(gx+3,st.y+4,cw-6,3);
  const pinx=cx+R*Math.sin(st.th),piny=yc-R*Math.cos(st.th);
  ctx.strokeStyle=COL.muted;ctx.lineWidth=1.2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(cx,yc,R,0,TAU);ctx.stroke();ctx.setLineDash([]);
  line(ctx,cx,st.y+12,pinx,piny,'#3a3d46',7);line(ctx,cx,yc,pinx,piny,COL.o,9);dot(ctx,cx,yc,6,COL.r);dot(ctx,pinx,piny,4,'#fff',COL.r);dot(ctx,cx,st.y+12,4,'#fff',COL.r);
  txt(ctx,'arbore cotit',cx,yc+R+18,{font:MONO,color:COL.muted});
  const b={x:Math.max(cx+cw/2+60,w*.36),y:42,w:0,h:h-112};b.w=w-b.x-48;
  const maximum=cycle.states[3].p,{X,Y}=axes(ctx,b,[0,r*1.13],[0,maximum*1.16],{xl:'V',yl:'p'});
  const volumes=cycle.kind==='otto'?[[1,'PMI'],[r,'PME']]:[[1,'V₂'],[cycle.cutoff,'V₃'],[r,'V₁']];
  for(const [V,label]of volumes){const topP=V===1?cycle.states[2].p:V===r?cycle.states[4].p:cycle.states[3].p;line(ctx,X(V),Y(topP),X(V),Y(0),COL.muted,1,[3,4]);txt(ctx,label,X(V),Y(0)+28,{font:MONO,color:COL.muted});}
  const tint='rgba(200,64,42,.10)';ctx.beginPath();
  for(let phase=1;phase<=4;phase++)for(let k=0;k<=60;k++){const p=cycle.point(phase,k/60);if(phase===1&&k===0)ctx.moveTo(X(p.V),Y(p.p));else ctx.lineTo(X(p.V),Y(p.p));}
  ctx.closePath();ctx.fillStyle=tint;ctx.fill();
  const C=colors();
  // Intake and exhaust have exactly p=p0; their opposite arrows share the baseline.
  line(ctx,X(1),Y(1),X(r),Y(1),COL.muted,1.1);arrowOn(ctx,X,Y,0,.30,COL.c);arrowOn(ctx,X,Y,5,.30,COL.b);
  for(let phase=1;phase<=4;phase++){
   ctx.beginPath();for(let k=0;k<=80;k++){const p=cycle.point(phase,k/80);if(k)ctx.lineTo(X(p.V),Y(p.p));else ctx.moveTo(X(p.V),Y(p.p));}
   ctx.strokeStyle=C[phase];ctx.lineWidth=phase===ph?3.3:2.2;ctx.stroke();arrowOn(ctx,X,Y,phase,.55,C[phase]);
  }
  txt(ctx,'p₀',b.x-20,Y(1),{font:MONO,color:COL.muted});
  cycle.states.forEach((p,index)=>{dot(ctx,X(p.V),Y(p.p),3,COL.r);const left=index===0||index===2||(index===3&&cycle.kind==='otto');stateLabel(ctx,cycle.labels[index],X(p.V),Y(p.p),left?-22:12,index===1?18:-8);});
  const heatPoint=cycle.point(2,.5),coolPoint=cycle.point(4,.5);
  txt(ctx,'Q₁',X(heatPoint.V)+18,Y(heatPoint.p)-18,{font:MONO,color:COL.a});txt(ctx,'Q₂',X(coolPoint.V)+18,Y(coolPoint.p),{font:MONO,color:COL.b});
  if(cycle.kind==='diesel')drawArrowPx(ctx,X(heatPoint.V),Y(heatPoint.p)-27,X(heatPoint.V),Y(heatPoint.p)-3,COL.a,{w:2,head:.65});
  drawArrowPx(ctx,X(coolPoint.V)+3,Y(coolPoint.p),X(coolPoint.V)+27,Y(coolPoint.p),COL.b,{w:2,head:.65});
  const marker=cycle.point(ph,s);dot(ctx,X(marker.V),Y(marker.p),10,'rgba(200,64,42,.18)');dot(ctx,X(marker.V),Y(marker.p),5,C[ph],'#fff');
  const branch=cycle.branches[ph];S.out('ph',cycle.labels[branch.from]+'→'+cycle.labels[branch.to]+' · '+names()[ph]);S.out('r',String(r));S.out('V',f(st.V/r,2));S.out('p',f(st.p,1));
 };
})();

/* ---------- Fig. 1 — gaz, lichid, solid ---------- */
(()=>{const S=new Sim('#fig1',{fmt:{T:v=>v+' K'}});let P=[],sites=[],bonds=[],trail=[],run=true,Tprev=300;const R=6,D=15;
  const box=()=>({x:16,y:16,w:S.w-32,h:S.h-32});
  function init(){P=[];sites=[];bonds=[];trail=[];Tprev=S.p.T;if(!S.w)return;const b=box(),m=S.mode;
    if(m==='gaz'){const v=80*Math.sqrt(S.p.T/300);for(let i=0;i<34;i++){const a=Math.random()*TAU,s=v*(.4+Math.random()*1.2);P.push({x:b.x+R+Math.random()*(b.w-2*R),y:b.y+R+Math.random()*(b.h-2*R),vx:s*Math.cos(a),vy:s*Math.sin(a)})}return}
    if(m==='lichid'){const cols=Math.floor((b.w-6)/D),rows=9;for(let j=0;j<rows;j++)for(let i=0;i<cols-(j%2);i++)sites.push({x:b.x+3+D/2+i*D+(j%2)*D/2,y:b.y+b.h-D/2-2-j*D*.87,o:-1});
      const n=Math.round(sites.length*.86);const free=sites.map((_,k)=>k);
      // ocupăm de jos în sus, cu câteva goluri — lichidul ia forma vasului
      for(let k=0;k<n;k++){const idx=k<n-cols?k:free[k];const st=sites[idx];if(st.o>=0)continue;st.o=P.length;P.push({x:st.x,y:st.y,s:idx,ux:0,uy:0})}
      for(let k=0;k<sites.length;k++){if(sites[k].o<0&&Math.random()<.5&&k<sites.length-cols*2){const e=sites.findIndex((q,i)=>i>=sites.length-cols&&q.o>=0);if(e>=0){const pi=sites[e].o;sites[e].o=-1;sites[k].o=pi;P[pi].s=k;P[pi].x=sites[k].x;P[pi].y=sites[k].y}}}}
    else{const cols=11,rows=9,x0=b.x+b.w/2-(cols-1)*D/2,y0=b.y+b.h-24-(rows-1)*D;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){sites.push({x:x0+i*D,y:y0+j*D,o:P.length});P.push({x:x0+i*D,y:y0+j*D,s:sites.length-1,ux:0,uy:0})}
      for(let a=0;a<P.length;a++)for(let c=a+1;c<P.length;c++){const d=Math.hypot(sites[a].x-sites[c].x,sites[a].y-sites[c].y);if(d<D*1.05)bonds.push([a,c])}}
    // molecula urmărită — una din mijloc
    if(P.length){const t=P.reduce((best,p,i)=>Math.hypot(p.x-b.x-b.w/2,p.y-b.y-b.h*.7)<Math.hypot(P[best].x-b.x-b.w/2,P[best].y-b.y-b.h*.7)?i:best,0);[P[0],P[t]]=[P[t],P[0]];if(sites.length){sites[P[0].s].o=0;sites[P[t].s].o=t}}}
  S.onResize=init;S.onMode=()=>{init();SND.tick()};
  S.onParam=k=>{if(k==='T'&&S.mode==='gaz'){const q=Math.sqrt(S.p.T/Tprev);P.forEach(p=>{p.vx*=q;p.vy*=q})}Tprev=S.p.T};
  S.act=a=>{if(a==='play'){run=!run;playLabel(S,'play',run)}if(a==='reset'){init();SND.tick()}};
  S.step=dt=>{if(!run||!P.length)return;S.time+=dt;const b=box(),T=S.p.T;
    if(S.mode==='gaz'){P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;
        if(p.x<b.x+R){p.x=b.x+R;p.vx=Math.abs(p.vx)}if(p.x>b.x+b.w-R){p.x=b.x+b.w-R;p.vx=-Math.abs(p.vx)}
        if(p.y<b.y+R){p.y=b.y+R;p.vy=Math.abs(p.vy)}if(p.y>b.y+b.h-R){p.y=b.y+b.h-R;p.vy=-Math.abs(p.vy)}});
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],c=P[j],dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy);
        if(d<2*R&&d>0){const nx=dx/d,ny=dy/d,rv=(c.vx-a.vx)*nx+(c.vy-a.vy)*ny;if(rv<0){a.vx+=rv*nx;a.vy+=rv*ny;c.vx-=rv*nx;c.vy-=rv*ny}const o=(2*R-d)/2;a.x-=nx*o;a.y-=ny*o;c.x+=nx*o;c.y+=ny*o}}}
    else{const liq=S.mode==='lichid',A=(liq?.17:.075)*D*Math.sqrt(T/300),k=liq?10:16,sg=A*Math.sqrt(2*k);
      P.forEach((p,i)=>{p.ux+=-p.ux*k*dt+sg*Math.sqrt(dt)*randn();p.uy+=-p.uy*k*dt+sg*Math.sqrt(dt)*randn();
        if(liq&&Math.random()<dt*2.4*Math.exp(-560/T)){const st=sites[p.s];const nb=sites.map((q,j)=>[q,j]).filter(([q])=>q.o<0&&Math.hypot(q.x-st.x,q.y-st.y)<D*1.2&&q.y>=st.y-D*.95);
          if(nb.length){const [q,j]=nb[Math.random()*nb.length|0];st.o=-1;q.o=i;p.s=j;if(i===0)SND.tick(.06)}}
        const st=sites[p.s],e=Math.min(1,dt*(liq?9:30));p.x+=(st.x+p.ux-p.x)*e;p.y+=(st.y+p.uy-p.y)*e})}
    if(S.t.trail){trail.push([P[0].x,P[0].y]);if(trail.length>(S.mode==='gaz'?420:900))trail.shift()}};
  S.draw=(ctx,w,h)=>{if(!P.length)init();grid(ctx,w,h);const b=box(),m=S.mode,T=S.p.T,hc=heat((T-50)/750,.9);
    ctx.strokeStyle=COL.r;ctx.lineWidth=2.5;ctx.beginPath();if(m==='gaz'){ctx.rect(b.x,b.y,b.w,b.h)}else{ctx.moveTo(b.x,b.y+30);ctx.lineTo(b.x,b.y+b.h);ctx.lineTo(b.x+b.w,b.y+b.h);ctx.lineTo(b.x+b.w,b.y+30)}ctx.stroke();
    if(m==='lichid'){let top=Infinity;P.forEach(p=>top=Math.min(top,sites[p.s].y));ctx.fillStyle='rgba(31,90,138,.06)';ctx.fillRect(b.x+1,top-D/2,b.w-2,b.y+b.h-top+D/2-1)}
    if(m==='solid'){ctx.strokeStyle='rgba(111,106,95,.45)';ctx.lineWidth=1;ctx.beginPath();bonds.forEach(([a,c])=>{ctx.moveTo(P[a].x,P[a].y);ctx.lineTo(P[c].x,P[c].y)});ctx.stroke()}
    if(S.t.trail&&trail.length>1){ctx.save();ctx.strokeStyle='rgba(200,64,42,.55)';ctx.lineWidth=1.5;ctx.beginPath();trail.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore()}
    P.forEach((p,i)=>{if(i)dot(ctx,p.x,p.y,R,hc,'rgba(26,29,38,.35)')});dot(ctx,P[0].x,P[0].y,R+1,COL.a,'#fff');
    if(m==='gaz'){const p=P[0];drawArrowPx(ctx,p.x,p.y,p.x+p.vx*.35,p.y+p.vy*.35,COL.a,{w:1.6,head:.6})}
    txt(ctx,m==='gaz'?'gazul ocupă tot vasul':m==='lichid'?'lichidul ia forma vasului':'solidul își păstrează forma',b.x+b.w/2,b.y+16,{font:MONO,color:COL.muted});
    const I={gaz:['nu','nu','zig-zag între ciocniri; forțe intermoleculare foarte slabe — gazul este expansibil'],
      lichid:['nu','da','oscilează într-o „celulă”, apoi sare într-o celulă vecină liberă'],
      solid:['da','da','oscilează în jurul unor poziții fixe — nodurile rețelei cristaline']}[m];
    S.out('fo',I[0]);S.out('vo',I[1]);S.out('mv',I[2]);S.out('v',f(Math.sqrt(T/300),2)+'×')};
})();

/* ---------- Fig. 2 — difuzia și mișcarea browniană ---------- */
(()=>{const S=new Sim('#fig2',{fmt:{T:v=>v+' K',M:v=>v,R:v=>v}});let P=[],B=null,wall=true,t0=0,mixS=0,trail=[],Tp=300,Mp=32,vB=0,start=null;const r=4,K=16.8;
  const box=()=>({x:14,y:34,w:S.w-28,h:S.h-48});
  function init(){P=[];trail=[];wall=true;t0=0;mixS=0;Tp=S.p.T;Mp=S.p.M;if(!S.w)return;const b=box(),T=S.p.T;
    if(S.mode==='dif'){const cx=b.x+b.w/2;for(let k=0;k<2;k++)for(let i=0;i<70;i++){const M=k?S.p.M:28,sg=K*Math.sqrt(T/M);
        P.push({x:k?cx+r+Math.random()*(b.w/2-2*r):b.x+r+Math.random()*(b.w/2-2*r),y:b.y+r+Math.random()*(b.h-2*r),vx:sg*randn(),vy:sg*randn(),m:M,k})}
      S.label('wall','Ridică peretele')}
    else{const sg=55*Math.sqrt(T/300);for(let i=0;i<260;i++)P.push({x:b.x+Math.random()*b.w,y:b.y+Math.random()*b.h,vx:sg*randn(),vy:sg*randn()});
      B={x:b.x+b.w/2,y:b.y+b.h/2,vx:0,vy:0};start={x:B.x,y:B.y};S.time=0;vB=0}}
  S.onResize=init;S.onMode=()=>{init();SND.tick()};
  S.onParam=k=>{const T=S.p.T;if(k==='T'){const q=Math.sqrt(T/Tp);P.forEach(p=>{p.vx*=q;p.vy*=q});Tp=T}
    if(k==='M'){const q=Math.sqrt(Mp/S.p.M);P.forEach(p=>{if(p.k){p.vx*=q;p.vy*=q;p.m=S.p.M}});Mp=S.p.M}};
  S.act=a=>{if(a==='reset'){init();SND.tick()}
    if(a==='wall'){wall=!wall;const b=box(),cx=b.x+b.w/2;if(!wall){t0=S.time;SND.whoosh()}else{P.forEach(p=>{if(Math.abs(p.x-cx)<r)p.x=p.x<cx?cx-r:cx+r});SND.knock()}S.label('wall',wall?'Ridică peretele':'Pune peretele la loc')}};
  S.step=dt=>{if(!P.length)return;S.time+=dt;const b=box(),cx=b.x+b.w/2;
    if(S.mode==='dif'){P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;
        if(p.x<b.x+r){p.x=b.x+r;p.vx=Math.abs(p.vx)}if(p.x>b.x+b.w-r){p.x=b.x+b.w-r;p.vx=-Math.abs(p.vx)}
        if(p.y<b.y+r){p.y=b.y+r;p.vy=Math.abs(p.vy)}if(p.y>b.y+b.h-r){p.y=b.y+b.h-r;p.vy=-Math.abs(p.vy)}
        if(wall){if(p.k===0&&p.x>cx-r){p.x=cx-r;p.vx=-Math.abs(p.vx)}if(p.k===1&&p.x<cx+r){p.x=cx+r;p.vx=Math.abs(p.vx)}}});
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],c=P[j],dx=c.x-a.x;if(dx>2*r||dx<-2*r)continue;const dy=c.y-a.y,d=Math.hypot(dx,dy);
        if(d<2*r&&d>0){const nx=dx/d,ny=dy/d,rv=(c.vx-a.vx)*nx+(c.vy-a.vy)*ny;if(rv<0){const J=2*rv/(a.m+c.m);a.vx+=J*c.m*nx;a.vy+=J*c.m*ny;c.vx-=J*a.m*nx;c.vy-=J*a.m*ny}}}
      let rl=0,bl=0;P.forEach(p=>{if(p.k&&p.x<cx)rl++;if(!p.k&&p.x>cx)bl++});mixS+=(Math.min(100,(rl+bl)/70*100)-mixS)*Math.min(1,dt*3)}
    else{const R=S.p.R,mB=(R/2)**2;P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;
        if(p.x<b.x){p.x=b.x;p.vx=Math.abs(p.vx)}if(p.x>b.x+b.w){p.x=b.x+b.w;p.vx=-Math.abs(p.vx)}if(p.y<b.y){p.y=b.y;p.vy=Math.abs(p.vy)}if(p.y>b.y+b.h){p.y=b.y+b.h;p.vy=-Math.abs(p.vy)}
        const dx=p.x-B.x,dy=p.y-B.y,d=Math.hypot(dx,dy);if(d<R+2&&d>0){const nx=dx/d,ny=dy/d,rv=(p.vx-B.vx)*nx+(p.vy-B.vy)*ny;
          if(rv<0){const J=2*rv/(1+mB);p.vx-=J*mB*nx;p.vy-=J*mB*ny;B.vx+=J*nx;B.vy+=J*ny}p.x=B.x+nx*(R+2);p.y=B.y+ny*(R+2)}});
      B.x+=B.vx*dt;B.y+=B.vy*dt;if(B.x<b.x+R){B.x=b.x+R;B.vx=Math.abs(B.vx)}if(B.x>b.x+b.w-R){B.x=b.x+b.w-R;B.vx=-Math.abs(B.vx)}if(B.y<b.y+R){B.y=b.y+R;B.vy=Math.abs(B.vy)}if(B.y>b.y+b.h-R){B.y=b.y+b.h-R;B.vy=-Math.abs(B.vy)}
      vB+=(Math.hypot(B.vx,B.vy)-vB)*Math.min(1,dt*.8);
      if(S.t.trail){trail.push([B.x,B.y]);if(trail.length>2400)trail.shift()}}};
  S.draw=(ctx,w,h)=>{if(!P.length)init();grid(ctx,w,h);const b=box(),cx=b.x+b.w/2;
    ctx.strokeStyle=COL.r;ctx.lineWidth=2.5;ctx.strokeRect(b.x,b.y,b.w,b.h);
    if(S.mode==='dif'){
      // profilul concentrației gazului roșu (10 benzi)
      const n=10,cnt=Array(n).fill(0),tot=Array(n).fill(0);P.forEach(p=>{const i=clamp((p.x-b.x)/b.w*n|0,0,n-1);tot[i]++;if(p.k)cnt[i]++});
      for(let i=0;i<n;i++){const q=tot[i]?cnt[i]/tot[i]:0;ctx.fillStyle=`rgba(200,64,42,${.06+.14*q})`;ctx.fillRect(b.x+i*b.w/n,b.y,b.w/n,b.h);ctx.fillStyle=COL.a;ctx.fillRect(b.x+i*b.w/n+3,b.y-6-16*q,b.w/n-6,16*q)}
      txt(ctx,'concentrația gazului roșu',b.x+4,b.y-24,{font:MONO,color:COL.muted,align:'left'});
      P.forEach(p=>dot(ctx,p.x,p.y,r,p.k?COL.a:COL.b));
      if(wall){ctx.fillStyle=COL.r;ctx.fillRect(cx-2,b.y,4,b.h)}else{ctx.save();ctx.setLineDash([4,6]);line(ctx,cx,b.y,cx,b.y+b.h,COL.muted,1);ctx.restore()}
      txt(ctx,'aer (M = 28)',b.x+b.w*.25,b.y+b.h-14,{font:MONO,color:COL.b});txt(ctx,`gaz roșu (M = ${S.p.M})`,b.x+b.w*.75,b.y+b.h-14,{font:MONO,color:COL.a});
      S.out('l1','amestecare');S.out('a',wall?'—':f(mixS,0)+' %');S.out('l2','timp de la ridicarea peretelui');S.out('b',wall?'—':f(S.time-t0,1)+' s');
      S.out('l3','v roșu / v aer');S.out('c',f(Math.sqrt(28/S.p.M),2));
      S.out('hint',wall?'Ridică peretele despărțitor: gazele se amestecă singure.':S.p.M<28?'Moleculele ușoare (M mic) sunt mai rapide: difuzează mai repede.':'Încearcă: crește T sau micșorează M — amestecarea se face mai repede.')}
    else{P.forEach(p=>dot(ctx,p.x,p.y,1.6,'rgba(31,90,138,.45)'));
      if(trail.length>1){ctx.strokeStyle='rgba(200,64,42,.6)';ctx.lineWidth=1.4;ctx.beginPath();trail.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}
      const R=S.p.R;const gr=ctx.createRadialGradient(B.x-R*.3,B.y-R*.3,R*.1,B.x,B.y,R);gr.addColorStop(0,'#f2d47a');gr.addColorStop(1,'#b07a12');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(B.x,B.y,R,0,TAU);ctx.fill();
      txt(ctx,'granulă de polen în apă (moleculele de apă — puncte albastre)',b.x+4,b.y-14,{font:MONO,color:COL.muted,align:'left'});
      S.out('l1','distanța față de start');S.out('a',f(Math.hypot(B.x-start.x,B.y-start.y)/10,1)+' µm');S.out('l2','timp');S.out('b',f(S.time,0)+' s');
      S.out('l3','viteza granulei');S.out('c',f(vB/10,2)+' µm/s');
      S.out('hint','Ciocnirile cu moleculele nu se compensează: granula se mișcă haotic. Mai intens la T mare și R mic.')}};
})();

/* ---------- Fig. 3 — grade de libertate ---------- */
(()=>{const S=new Sim('#fig3');
  const M={'1':{a:[[0,0,0,22,COL.teal]],ex:'He, Ne, Ar',rot:0},
    '2':{a:[[-26,0,0,18,COL.b],[26,0,0,18,COL.b]],ex:'H₂, N₂, O₂',rot:2},
    '3':{a:[[0,0,0,17,'#3a3d46'],...[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(([x,y,z])=>[x*20,y*20,z*20,11,'#d9d2c1'])],ex:'CH₄, H₂O, NH₃',rot:3}};
  S.step=dt=>{S.time+=dt};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const m=M[S.mode],t=S.time,cx=Math.min(w*.32,190)+Math.sin(t*1.1)*6,cy=h/2+8+Math.cos(t*.9)*4;
    const a=t*.9,tl=.42,P=m.a.map(([x,y,z,r,c])=>{const x1=x*Math.cos(a)+z*Math.sin(a),z1=-x*Math.sin(a)+z*Math.cos(a),y1=y*Math.cos(tl)-z1*Math.sin(tl),z2=y*Math.sin(tl)+z1*Math.cos(tl);return {x:cx+x1,y:cy+y1,z:z2,r,c}});
    // translații: trei săgeți fixe
    [[1,0,'x',COL.a],[0,-1,'y',COL.c],[-.62,.48,'z',COL.b]].forEach(([dx,dy,l,c])=>{drawArrowPx(ctx,cx,cy,cx+dx*92,cy+dy*92,c,{w:1.8,head:.7,alpha:.75});txt(ctx,l,cx+dx*104,cy+dy*104,{color:c})});
    if(P.length>1&&S.mode==='2'){line(ctx,P[0].x,P[0].y,P[1].x,P[1].y,'#3a3d46',5)}
    if(S.mode==='3')P.slice(1).forEach(p=>line(ctx,P[0].x,P[0].y,p.x,p.y,'#3a3d46',4));
    [...P].sort((p,q)=>q.z-p.z).forEach(p=>{const g=ctx.createRadialGradient(p.x-p.r*.35,p.y-p.r*.35,p.r*.1,p.x,p.y,p.r);g.addColorStop(0,'#fff');g.addColorStop(.35,p.c);g.addColorStop(1,'rgba(26,29,38,.85)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill()});
    // rotații
    const arc=(x,y,rx,ry,c,dash)=>{ctx.save();ctx.strokeStyle=c;ctx.lineWidth=2;if(dash)ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,.25,TAU-.6);ctx.stroke();ctx.restore();
      const e=TAU-.6,ex=x+rx*Math.cos(e),ey=y+ry*Math.sin(e);drawArrowPx(ctx,ex-rx*Math.sin(e)*.01-1,ey+ry*Math.cos(e)*.01,ex+ (-Math.sin(e))*rx*.2,ey+Math.cos(e)*ry*.2,c,{w:2,head:.6})};
    if(m.rot>=1)arc(cx,cy-58,44,9,COL.plum);
    if(m.rot>=2)arc(cx+66,cy+2,9,34,COL.plum);
    if(m.rot>=3)arc(cx-50,cy+40,26,14,COL.plum);
    if(S.mode==='2'){arc(cx-70,cy,6,16,COL.muted,1);txt(ctx,'≈ 0',cx-92,cy-22,{font:MONO,color:COL.muted})}
    const X=Math.max(cx+130,w*.56);
    // notă pe mai multe rânduri, încadrată în lățimea rămasă
    const note=(s,y)=>{ctx.save();ctx.font=MONO;const ws=s.split(' '),L=[];let cur='';ws.forEach(wd=>{const t=cur?cur+' '+wd:wd;if(cur&&ctx.measureText(t).width>w-X-14){L.push(cur);cur=wd}else cur=t});L.push(cur);ctx.restore();L.forEach((l,k)=>txt(ctx,l,X,y+k*15,{align:'left',font:MONO,color:COL.muted}))};
    txt(ctx,'3 translații',X,h*.28,{align:'left',color:COL.r,font:'600 17px "Source Serif 4", Georgia, serif'});
    note('(de-a lungul axelor x, y, z)',h*.28+20);
    txt(ctx,m.rot?`+ ${m.rot} rotații`:'+ 0 rotații',X,h*.48,{align:'left',color:COL.plum,font:'600 17px "Source Serif 4", Georgia, serif'});
    note(m.rot===0?'(un punct material nu „se rotește”)':m.rot===2?'(rotația în jurul axei legăturii nu contează)':'(în jurul a trei axe)',h*.48+20);
    txt(ctx,`i = ${3+m.rot}`,X,h*.72,{align:'left',color:COL.a,font:'italic 600 34px "Source Serif 4", Georgia, serif'});
    S.out('ex',m.ex);S.out('tr',`3 + ${m.rot}`);S.out('i',3+m.rot)};
})();

/* ---------- Fig. 4 — laboratorul molului ---------- */
(()=>{const S=new Sim('#fig4',{fmt:{m:v=>v+' g',N1:v=>v+'·10²³',N2:v=>v+'·10²³'}});
  const A={H:1,He:4,C:12,N:14,O:16,Na:23,S:32,Cl:35.5,K:39,Mn:55};
  const AC={H:'#e6dfcf',He:COL.teal,C:'#3a3d46',N:COL.b,O:COL.a,Na:COL.plum,S:COL.o,Cl:COL.c,K:'#8a5a9e',Mn:'#7a6a50'};
  const SB=[['H<sub>2</sub>',{H:2},1],['He',{He:1},1],['N<sub>2</sub>',{N:2},1],['O<sub>2</sub>',{O:2},1],['H<sub>2</sub>O',{H:2,O:1},0],['CO<sub>2</sub>',{C:1,O:2},1],['CH<sub>4</sub>',{C:1,H:4},1],['NaCl',{Na:1,Cl:1},0],['H<sub>2</sub>SO<sub>4</sub>',{H:2,S:1,O:4},0],['KMnO<sub>4</sub>',{K:1,Mn:1,O:4},0]];
  const Mr=c=>Object.entries(c).reduce((s,[e,n])=>s+A[e]*n,0),plain=s=>s.replace(/<sub>(\d)<\/sub>/g,(_,d)=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  let cur=4;const chips=$('#chips4');
  chips.innerHTML=SB.map((s,i)=>`<button class="btn sm${i===cur?' on':''}" type="button" data-i="${i}">${s[0]}</button>`).join('');
  $$('button',chips).forEach(b=>b.addEventListener('click',()=>{SND.unlock();cur=+b.dataset.i;$$('button',chips).forEach(x=>x.classList.toggle('on',x===b));SND.tick();S.render()}));
  let dots=[];const mkDots=()=>{dots=[];for(let k=0;k<2;k++){const n=Math.round((k?S.p.N2:S.p.N1)*2);for(let i=0;i<n;i++)dots.push({k,x:Math.random(),y:Math.random(),a:Math.random()*TAU})}};mkDots();
  S.onParam=k=>{if(k==='N1'||k==='N2')mkDots()};
  S.step=dt=>{S.time+=dt;dots.forEach(d=>{d.a+=randn()*dt*3;d.x=clamp(d.x+Math.cos(d.a)*dt*.06,0,1);d.y=clamp(d.y+Math.sin(d.a)*dt*.06,0,1);if(d.x<=0||d.x>=1||d.y<=0||d.y>=1)d.a+=Math.PI})};
  function molecule(ctx,cx,cy,c,sc=1){const at=[];Object.entries(c).forEach(([e,n])=>{for(let i=0;i<n;i++)at.push(e)});
    const rad=e=>(9+Math.cbrt(A[e])*4.2)*sc;let center=null;
    const single=Object.entries(c).filter(([e,n])=>n===1&&e!=='K').sort((p,q)=>A[q[0]]-A[p[0]]);
    if(at.length>2&&single.length){center=single[0][0];at.splice(at.indexOf(center),1)}
    const pos=[];if(center)pos.push([cx,cy,center]);
    if(!center&&at.length===2){pos.push([cx-rad(at[0])*.8,cy,at[0]],[cx+rad(at[1])*.8,cy,at[1]])}
    else if(!center&&at.length===1)pos.push([cx,cy,at[0]]);
    else at.forEach((e,i)=>{const a=-Math.PI/2+i/at.length*TAU+(at.length===2?Math.PI/2+.5:0),R=(rad(center)+rad(e))*.82;pos.push([cx+Math.cos(a)*R,cy+Math.sin(a)*R,e])});
    if(center)pos.slice(1).forEach(([x,y])=>line(ctx,cx,cy,x,y,'#3a3d46',3));
    [...pos].sort((p,q)=>(p[2]===center)-(q[2]===center)).forEach(([x,y,e])=>{const r=rad(e),g=ctx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.4,AC[e]);g.addColorStop(1,'rgba(26,29,38,.8)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
      window.PraxisCanvasTypography.textInBox(ctx,e,{x:x-r,y:y-r,w:2*r,h:2*r},{font:'600 12px "JetBrains Mono", monospace',color:e==='H'?COL.r:'#fff'})})}
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const s=SB[cur],M=Mr(s[1]),nm=plain(s[0]);const big='italic 500 19px "Source Serif 4", Georgia, serif';
    if(S.mode==='mm'){const nar=w<480,fx=nar?16:w*.52,fy=nar?[.29,.37,.45]:[.17,.27,.37],fnt=nar?'italic 500 16px "Source Serif 4", Georgia, serif':big;
      // pe ecrane înguste molecula urcă deasupra formulelor
      nar?molecule(ctx,w*.5,h*.14,s[1],.85):molecule(ctx,w*.27,h*.3,s[1],1.25);
      const sum=Object.entries(s[1]).map(([e,n])=>`${n>1?n+'·':''}${A[e]}`).join(' + ');
      txt(ctx,`Mᵣ(${nm}) = ${sum} = ${M}`,fx,h*fy[0],{align:'left',font:fnt});
      txt(ctx,`μ = ${M} g/mol = ${f(M/1000,4)} kg/mol`,fx,h*fy[1],{align:'left',font:fnt,color:COL.b});
      txt(ctx,`m₀ = Mᵣ·u = ${sci(M*1.66e-27,2)} kg`,fx,h*fy[2],{align:'left',font:fnt,color:COL.plum});
      if(!nar)txt(ctx,'(masa unei singure molecule)',fx,h*fy[2]+20,{align:'left',font:MONO,color:COL.muted});
      // comparație între substanțe
      const x0=60,x1=w-30,y0=h*.56,bh=(h-y0-16)/SB.length,mx=158;
      SB.forEach((q,i)=>{const v=Mr(q[1]),y=y0+i*bh,on=i===cur;ctx.fillStyle=on?COL.a:'rgba(31,90,138,.35)';ctx.fillRect(x0,y+2,(x1-x0-50)*v/mx,bh-5);
        window.PraxisCanvasTypography.textInBox(ctx,plain(q[0]),{x:4,y,w:x0-14,h:bh},{font:MONO,color:on?COL.a:COL.r});window.PraxisCanvasTypography.textInBox(ctx,String(v),{x:x0+(x1-x0-50)*v/mx+6,y,w:32,h:bh},{font:MONO,color:on?COL.a:COL.muted})});
      S.out('l1','M<sub>r</sub> (adimensional)');S.out('a',M);S.out('l2','μ — masa molară');S.out('b',M+' g/mol');S.out('l3','m₀ — masa unei molecule');S.out('c',sci(M*1.66e-27,2)+' kg');
      S.out('hint','Alege o substanță. Atenție: M<sub>r</sub> (fără unitate), μ (masa unui mol) și m₀ (masa unei molecule) sunt mărimi diferite.')}
    else if(S.mode==='conv'){const m=S.p.m,nu=m/M,N=nu*6.022e23;molecule(ctx,w*.5,h*.15,s[1],.8);
      const bw=Math.min(150,(w-80)/3.4),y=h*.36,bx=[w*.5-bw*1.75,w*.5,w*.5+bw*1.75];
      [[`m = ${m} g`,COL.r],[`ν = ${f(nu,nu<10?3:1)} mol`,COL.b],[`N = ${sci(N,2)}`,COL.plum]].forEach(([l,c],i)=>{ctx.fillStyle='#fff';ctx.strokeStyle=c;ctx.lineWidth=2;rrect(ctx,bx[i]-bw/2,y-24,bw,48,8);ctx.fill();ctx.stroke();window.PraxisCanvasTypography.textInBox(ctx,l,{x:bx[i]-bw/2,y:y-24,w:bw,h:48},{color:c,font:'italic 600 16px "Source Serif 4", Georgia, serif'})});
      drawArrowPx(ctx,bx[0]+bw/2+4,y,bx[1]-bw/2-4,y,COL.muted,{w:1.6,head:.7});txt(ctx,`÷ μ = ${M} g/mol`,(bx[0]+bx[1])/2,y-36,{font:MONO,color:COL.muted});
      drawArrowPx(ctx,bx[1]+bw/2+4,y,bx[2]-bw/2-4,y,COL.muted,{w:1.6,head:.7});txt(ctx,'× N_A',(bx[1]+bx[2])/2,y-36,{font:MONO,color:COL.muted});
      // moli ca „pungi” (până la 30)
      const y2=h*.56,n=Math.min(30,Math.floor(nu)),fr=nu-Math.floor(nu),cs=Math.min(26,(w-60)/16);
      txt(ctx,nu<=30?`fiecare cerc = 1 mol = 6,022·10²³ molecule ${nm}`:`ν > 30 mol: se desenează doar primii 30`,30,y2-16,{font:MONO,color:COL.muted,align:'left'});
      for(let i=0;i<n+(fr>.01&&n<30?1:0);i++){const x=30+cs/2+(i%15)*(cs+4),yy=y2+cs/2+Math.floor(i/15)*(cs+6),part=i<n?1:fr;ctx.beginPath();ctx.moveTo(x,yy);ctx.arc(x,yy,cs/2,-Math.PI/2,-Math.PI/2+part*TAU);ctx.closePath();ctx.fillStyle='rgba(31,90,138,.55)';ctx.fill();ctx.strokeStyle=COL.b;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,yy,cs/2,0,TAU);ctx.stroke()}
      if(s[2]){const V=nu*22.4;txt(ctx,`Ca gaz, în condiții normale: V = ν·V_μ0 = ${f(nu,2)}·22,4 L = ${f(V,1)} L`,30,h-40,{align:'left',font:'italic 500 16px "Source Serif 4", Georgia, serif',color:COL.c})}
      else txt(ctx,`${nm} nu este gaz în condiții normale: V_μ0 = 22,4 L/mol nu se aplică.`,30,h-40,{align:'left',font:'italic 500 16px "Source Serif 4", Georgia, serif',color:COL.muted});
      S.out('l1','μ');S.out('a',M+' g/mol');S.out('l2','ν = m / μ');S.out('b',f(nu,3)+' mol');S.out('l3','N = ν·N<sub>A</sub>');S.out('c',sci(N,3));
      S.out('hint','Mută sliderul m. Cu cât molecula e mai grea (μ mare), cu atât aceeași masă conține mai puțini moli.')}
    else{const N1=S.p.N1,N2=S.p.N2,nu1=N1/6.022,nu2=N2/6.022,m=nu1*28+nu2*32,mu=(N1+N2)?(N1*28+N2*32)/(N1+N2):NaN;
      const b={x:30,y:30,w:Math.min(w*.42,260),h:h*.52};ctx.strokeStyle=COL.r;ctx.lineWidth=2;ctx.strokeRect(b.x,b.y,b.w,b.h);
      dots.forEach(d=>dot(ctx,b.x+6+d.x*(b.w-12),b.y+6+d.y*(b.h-12),4.5,d.k?COL.a:COL.b));
      txt(ctx,'● N₂ (μ₁ = 28 g/mol)',b.x,b.y+b.h+18,{font:MONO,color:COL.b,align:'left'});txt(ctx,'● O₂ (μ₂ = 32 g/mol)',b.x,b.y+b.h+36,{font:MONO,color:COL.a,align:'left'});
      txt(ctx,'1 punct = 0,5·10²³ molecule',b.x,b.y+b.h+54,{font:MONO,color:COL.muted,align:'left'});
      const X0=b.x+b.w+30;
      const formula=S.outs.mixFormula,source=`\\mu=\\frac{${N1}\\cdot28+${N2}\\cdot32}{${N1+N2}}=${f(mu,2)}\\ \\mathrm{g/mol}`;
      if(formula&&formula._source!==source){formula._source=source;if(window.PraxisMath)window.PraxisMath.set(formula,source,{syntax:'tex'});else formula.textContent=`μ = (${N1}·28 + ${N2}·32) / ${N1+N2} = ${f(mu,2)} g/mol`;}
      // scara 28…32 g/mol
      const sx0=X0,sx1=w-30,sy=b.y+b.h-10,X=v=>lerp(sx0,sx1,(v-28)/4);line(ctx,sx0,sy,sx1,sy,COL.r,2);
      [28,29,30,31,32].forEach(v=>{line(ctx,X(v),sy-5,X(v),sy+5,COL.r,1.5);txt(ctx,String(v),X(v),sy+16,{font:MONO,color:COL.muted})});
      txt(ctx,'aer',X(28.97),sy-22,{font:MONO,color:COL.c});line(ctx,X(28.97),sy-14,X(28.97),sy,COL.c,1.5);
      if(isFinite(mu)){dot(ctx,X(mu),sy,7,COL.a,'#fff')}
      S.out('l1','ν = ν₁ + ν₂');S.out('a',f(nu1+nu2,2)+' mol');S.out('l2','m = m₁ + m₂');S.out('b',f(m,1)+' g');S.out('l3','μ amestec');S.out('c',isFinite(mu)?f(mu,2)+' g/mol':'—');
      S.out('hint',N1===12&&N2===4?'Exact exercițiul despre amestec: μ = 29·10⁻³ kg/mol — aproape cât aerul!':'Încearcă N₁ = 12, N₂ = 4 (exercițiul despre amestec) sau N₁ ≈ 4·N₂ (compoziția aerului).')}};
})();

/* ---------- Fig. 5 — gaz într-un cilindru cu piston: tipuri de sisteme ---------- */
(()=>{const S=new Sim('#fig5');let P=[],T=300,px=0,pv=0,pext=0,push=0,heatT=0,pump=0,ev='Alege o acțiune.',fx=[];const r=3;
  const G=()=>({x0:40,y0:120,x1:S.w-70,y1:S.h-120});
  function add(n){const g=G();for(let i=0;i<n;i++){const a=Math.random()*TAU,v=70*Math.sqrt(T/300)*(.5+Math.random());P.push({x:g.x0+r+Math.random()*(px-g.x0-2*r),y:g.y0+r+Math.random()*(g.y1-g.y0-2*r),vx:v*Math.cos(a),vy:v*Math.sin(a)})}}
  function init(){P=[];T=300;const g=G();px=g.x0+(g.x1-g.x0)*.55;pext=40*T/(px-g.x0);add(40);fx=[]}
  S.onResize=()=>{if(!P.length)init();else{const g=G();px=clamp(px,g.x0+60,g.x1)}};
  const fxAdd=(x,y,s,c)=>fx.push({x,y,s,c,t:0});
  S.act=a=>{const g=G();
    if(a==='heat'){if(S.t.adiab){ev='Pereții sunt adiabatici: căldura nu trece, Q = 0.';SND.bad();fxAdd((g.x0+g.x1)/2,g.y1+30,'Q = 0',COL.muted)}else{heatT=2.2;ev='Gazul primește căldură (Q > 0)'+(S.t.fix?'; pistonul blocat: L = 0.':' și se destinde, efectuând lucru mecanic (L > 0).');SND.whoosh();fxAdd((g.x0+px)/2,g.y1+30,'Q →',COL.a)}}
    if(a==='push'){if(S.t.fix){ev='Pistonul este blocat: nu se poate schimba lucru mecanic.';SND.bad();fxAdd(px+30,(g.y0+g.y1)/2,'L = 0',COL.muted)}else{push=1.6;ev='Comprimăm gazul: el primește lucru mecanic (L < 0) și se încălzește.';SND.knock();fxAdd(px+40,(g.y0+g.y1)/2,'← L',COL.b)}}
    if(a==='pump'){if(S.t.shut){ev='Robinetul este închis: sistemul nu primește substanță (sistem închis).';SND.bad();fxAdd(g.x0+50,g.y0-40,'m = const.',COL.muted)}else{pump=1;ev='Intră gaz în cilindru: masa sistemului crește (sistem deschis).';SND.plop();fxAdd(g.x0+50,g.y0-60,'Δm > 0',COL.c)}}};
  S.onToggle=()=>SND.tick();
  S.step=dt=>{if(!P.length)init();S.time+=dt;const g=G(),T0=T,V0=px-g.x0;
    if(heatT>0){heatT-=dt;if(!S.t.adiab)T+=75*dt}else if(!S.t.adiab)T+=(300-T)*dt*.12;
    if(pump>0){pump-=dt;if(!S.t.shut&&Math.random()<dt*9&&P.length<120){const v=70*Math.sqrt(T/300);P.push({x:g.x0+50+randn()*3,y:g.y0+r+1,vx:randn()*20,vy:v})}}
    if(push>0)push-=dt;
    if(!S.t.fix){const pe=pext*(push>0?1.9:1),target=clamp(g.x0+P.length*T/pe,g.x0+60,g.x1);const npx=px+(target-px)*Math.min(1,dt*2.5);pv=(npx-px)/dt;px=npx}else pv=0;
    const V1=px-g.x0;if(Math.abs(V1-V0)>1e-6)T*=Math.pow(V0/V1,.67);
    const q=Math.sqrt(T/T0);P.forEach(p=>{p.vx*=q;p.vy*=q;p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.x<g.x0+r){p.x=g.x0+r;p.vx=Math.abs(p.vx)}if(p.x>px-r){p.x=px-r;if(p.vx>pv)p.vx=-p.vx+2*Math.min(pv,0)}
      if(p.y<g.y0+r){p.y=g.y0+r;p.vy=Math.abs(p.vy)}if(p.y>g.y1-r){p.y=g.y1-r;p.vy=-Math.abs(p.vy)}});
    fx.forEach(e=>e.t+=dt);fx=fx.filter(e=>e.t<2.2)};
  S.draw=(ctx,w,h)=>{if(!P.length)init();grid(ctx,w,h);const g=G(),t=S.time,ad=S.t.adiab,cy=(g.y0+g.y1)/2;
    ctx.fillStyle=heat((T-260)/240,.18);ctx.fillRect(g.x0,g.y0,px-g.x0,g.y1-g.y0);
    // pereți
    const wt=ad?12:4;ctx.fillStyle=ad?'#c9bfa8':COL.r;ctx.fillRect(g.x0-wt,g.y0-wt,g.x1-g.x0+wt+30,wt);ctx.fillRect(g.x0-wt,g.y1,g.x1-g.x0+wt+30,wt);ctx.fillRect(g.x0-wt,g.y0-wt,wt,g.y1-g.y0+2*wt);
    if(ad){ctx.save();ctx.strokeStyle='rgba(111,106,95,.6)';ctx.lineWidth=1;ctx.beginPath();for(let x=g.x0-wt;x<g.x1+30;x+=8){ctx.moveTo(x,g.y0-wt);ctx.lineTo(x+wt,g.y0);ctx.moveTo(x,g.y1);ctx.lineTo(x+wt,g.y1+wt)}ctx.stroke();ctx.restore();txt(ctx,'pereți adiabatici',g.x0+70,g.y1+wt+14,{font:MONO,color:COL.muted})}
    // conductă + robinet + butelie
    const tx=g.x0+50;ctx.fillStyle=COL.r;ctx.fillRect(tx-9,g.y0-70,3,70-wt);ctx.fillRect(tx+6,g.y0-70,3,70-wt);ctx.fillRect(tx-9,g.y0-73,60,3);ctx.fillRect(tx+6,g.y0-58,45,3);
    rrect(ctx,tx+51,g.y0-96,46,56,10);ctx.fillStyle='#dfe7ee';ctx.fill();ctx.strokeStyle=COL.b;ctx.lineWidth=2;ctx.stroke();txt(ctx,'gaz',tx+74,g.y0-68,{font:MONO,color:COL.b});
    const sh=S.t.shut;dot(ctx,tx,g.y0-34,9,'#fff',sh?COL.a:COL.c);ctx.save();ctx.translate(tx,g.y0-34);ctx.rotate(sh?0:Math.PI/2);ctx.fillStyle=sh?COL.a:COL.c;ctx.fillRect(-14,-2.5,28,5);ctx.restore();
    txt(ctx,sh?'robinet închis':'robinet deschis',tx+18,g.y0-24,{font:MONO,color:sh?COL.a:COL.c,align:'left'});
    // piston
    ctx.fillStyle='#5b5f6b';ctx.fillRect(px,g.y0,14,g.y1-g.y0);ctx.fillStyle='#8a8e99';ctx.fillRect(px+14,cy-5,g.x1+60-px,10);
    if(push>0){drawArrowPx(ctx,px+110,cy-28,px+40,cy-28,COL.b,{w:3})}
    if(S.t.fix){ctx.fillStyle=COL.a;ctx.fillRect(g.x1+18,cy-22,8,44);txt(ctx,'blocat',g.x1+22,cy-34,{font:MONO,color:COL.a})}
    // flacără
    if(heatT>0)flame(ctx,(g.x0+px)/2,g.y1+wt+52,1.1,t);
    ctx.fillStyle='#3a3d46';ctx.fillRect((g.x0+px)/2-18,g.y1+wt+52,36,10);
    // granița sistemului
    ctx.save();ctx.setLineDash([6,5]);ctx.strokeStyle=COL.a;ctx.lineWidth=1.4;ctx.strokeRect(g.x0+4,g.y0+4,px-g.x0-8,g.y1-g.y0-8);ctx.restore();
    txt(ctx,'sistemul = gazul',g.x0+10,g.y0+16,{font:MONO,color:COL.a,align:'left'});txt(ctx,'mediul exterior',w-16,22,{font:MONO,color:COL.muted,align:'right'});
    P.forEach(p=>dot(ctx,p.x,p.y,r,heat((T-260)/240)));
    fx.forEach(e=>txt(ctx,e.s,e.x,e.y-e.t*14,{color:e.c,font:'italic 600 18px "Source Serif 4", Georgia, serif'}));
    const isol=ad&&S.t.fix&&sh;
    S.out('iz',ad&&S.t.fix?'nu schimbă (Q = 0, L = 0)':ad?'doar lucru mecanic':S.t.fix?'doar căldură':'căldură și lucru mecanic');
    S.out('dc',sh?'nu — sistem închis':'da — sistem deschis');S.out('n',`${P.length} · T ≈ ${f(T,0)} K`);
    S.out('ev',`<b>${isol?'Sistem izolat':'Sistem neizolat'}, ${sh?'închis':'deschis'}.</b> ${ev}`)};
})();

/* ---------- Fig. 6 — deplasarea bruscă a pistonului: relaxarea spre echilibru ---------- */
(()=>{const S=new Sim('#fig6');let P=[],xp=0,mv=null,sm=[],hist=[],stage='a',tEnd=null,below=0,tr=null,maxNu=0;const N=420,NZ=5,THR=.18,SG=70;
  const G=()=>({x0:30,x1:S.w-80,y0:44,y1:Math.min(220,S.h*.42)});
  function init(){const g=G();xp=g.x1;mv=null;P=[];for(let i=0;i<N;i++)P.push({x:g.x0+Math.random()*(g.x1-g.x0),y:g.y0+Math.random()*(g.y1-g.y0),vx:SG*randn(),vy:SG*randn()});
    sm=Array(NZ).fill(N/NZ);hist=[];stage='a';tEnd=null;tr=null;below=0;maxNu=0;S.time=0}
  S.onResize=()=>{if(!P.length)init()};
  S.act=a=>{const g=G();if(a==='reset'){init();SND.tick();return}
    if(mv||xp<g.x1-5){init()}
    const to=g.x0+(g.x1-g.x0)*.55;mv={from:xp,to,t:0,d:a==='fast'?.55:8};tEnd=null;tr=null;below=0;maxNu=0;stage='b';if(a==='fast')SND.knock();else SND.tick()};
  S.step=dt=>{if(!P.length)init();const g=G();S.time+=dt;let vp=0;
    if(mv){mv.t+=dt;const q=clamp(mv.t/mv.d,0,1),nx=lerp(mv.from,mv.to,q);vp=(nx-xp)/dt;xp=nx;if(q>=1){mv=null;tEnd=S.time}}
    P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(Math.random()<dt*2){const s=Math.hypot(p.vx,p.vy),a=Math.random()*TAU;p.vx=s*Math.cos(a);p.vy=s*Math.sin(a)}
      if(p.x<g.x0){p.x=g.x0;p.vx=Math.abs(p.vx)}if(p.x>xp){p.x=xp;if(p.vx>vp)p.vx=2*vp-p.vx}
      if(p.y<g.y0){p.y=g.y0;p.vy=Math.abs(p.vy)}if(p.y>g.y1){p.y=g.y1;p.vy=-Math.abs(p.vy)}});
    const c=Array(NZ).fill(0);P.forEach(p=>c[clamp((p.x-g.x0)/(xp-g.x0)*NZ|0,0,NZ-1)]++);
    for(let i=0;i<NZ;i++)sm[i]+=(c[i]-sm[i])*Math.min(1,dt*4);
    const nu=Math.max(...sm.map(v=>Math.abs(v-N/NZ)))/(N/NZ);hist.push([S.time,nu]);while(hist.length&&hist[0][0]<S.time-10)hist.shift();maxNu=Math.max(maxNu,nu);
    if(stage==='b'&&!mv&&tEnd!=null){if(nu<THR){below+=dt;if(below>.4){tr=S.time-tEnd-.4;stage='c';SND.ping()}}else below=0}
    S._nu=nu};
  S.draw=(ctx,w,h)=>{if(!P.length)init();grid(ctx,w,h);const g=G(),nu=S._nu||0;
    ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(g.x1+40,g.y0-3);ctx.lineTo(g.x0-3,g.y0-3);ctx.lineTo(g.x0-3,g.y1+3);ctx.lineTo(g.x1+40,g.y1+3);ctx.stroke();
    P.forEach(p=>{ctx.fillStyle=heat(Math.hypot(p.vx,p.vy)/260,.85);ctx.fillRect(p.x-1.6,p.y-1.6,3.2,3.2)});
    ctx.fillStyle='#5b5f6b';ctx.fillRect(xp,g.y0,12,g.y1-g.y0);ctx.fillStyle='#8a8e99';ctx.fillRect(xp+12,(g.y0+g.y1)/2-4,w-xp,8);
    if(mv)drawArrowPx(ctx,xp+70,g.y0-16,xp+20,g.y0-16,COL.b,{w:2.5});
    const lab={a:'a) echilibru — gaz uniform',b:'b) neechilibru — densitatea diferă de la loc la loc',c:'c) echilibru din nou, după relaxare'}[stage];
    txt(ctx,lab,g.x0,22,{align:'left',font:'italic 600 16px "Source Serif 4", Georgia, serif',color:stage==='b'?COL.a:COL.c});
    // densitatea pe zone
    const by0=g.y1+34,bh=Math.min(110,h*.2),zw=(xp-g.x0)/NZ;txt(ctx,'densitatea pe zone',g.x0,by0-12,{font:MONO,color:COL.muted,align:'left'});
    line(ctx,g.x0,by0+bh-bh*.5,g.x1,by0+bh-bh*.5,COL.muted,1,[3,4]);
    sm.forEach((v,i)=>{const q=v/(N/NZ),hh=clamp(q*.5,0,1)*bh;ctx.fillStyle=Math.abs(q-1)>THR?'rgba(200,64,42,.6)':'rgba(46,125,87,.55)';ctx.fillRect(g.x0+i*zw+3,by0+bh-hh,zw-6,hh)});
    // neuniformitatea în timp
    const b={x:g.x0+10,y:by0+bh+40,w:w-g.x0-40,h:h-(by0+bh+40)-34};
    if(b.h>40){const {X,Y}=axes(ctx,b,[S.time-10,S.time],[0,1],{xl:'t',yl:'',yt:[[THR,'prag']]});
      txt(ctx,'neuniformitate',b.x+6,b.y-6,{font:MONO,color:COL.muted,align:'left'});
      line(ctx,b.x,Y(THR),b.x+b.w,Y(THR),COL.c,1,[4,4]);ctx.beginPath();hist.forEach(([t,v],i)=>{const x=X(t),y=Y(Math.min(v,1));i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=COL.a;ctx.lineWidth=2;ctx.stroke()}
    S.out('st',stage==='b'?'neechilibru':'echilibru');S.out('nu',f(nu*100,0)+' %');
    S.out('tr',tr!=null?(maxNu<THR*1.05?'≈ 0 (cvasistatic)':f(tr,2)+' s'):stage==='b'?'…':'—')};
})();
