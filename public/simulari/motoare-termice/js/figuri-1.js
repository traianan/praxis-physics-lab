/* =====================================================================
   Figurile 1–5: schema motorului termic, randamentul, motorul în patru
   timpi, compresia din motorul Diesel, mașina frigorifică
   ===================================================================== */
// culoare după „temperatură”: 0 = rece (albastru) … 1 = fierbinte (roșu)
function heat(s,a=1){s=clamp(s,0,1);const r=Math.round(lerp(31,200,s)),g=Math.round(s<.5?lerp(90,122,s*2):lerp(122,64,(s-.5)*2)),b=Math.round(lerp(138,42,s));return `rgba(${r},${g},${b},${a})`}
const SERIF=(px,wt=500)=>`italic ${wt} ${px}px "Source Serif 4", Georgia, serif`;
const MONOB='600 11px "JetBrains Mono", monospace';
// sistem de axe într-un dreptunghi; întoarce funcțiile de conversie X(v), Y(v)
function axes(ctx,b,xr,yr,o={}){
  const X=v=>b.x+(v-xr[0])/(xr[1]-xr[0])*b.w,Y=v=>b.y+b.h-(v-yr[0])/(yr[1]-yr[0])*b.h;
  ctx.save();ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(b.x,b.y,b.w,b.h);
  if(o.gy){ctx.strokeStyle='rgba(217,207,186,.7)';ctx.lineWidth=1;ctx.beginPath();for(let v=yr[0]+o.gy;v<yr[1]+1e-9;v+=o.gy){ctx.moveTo(b.x,Y(v));ctx.lineTo(b.x+b.w,Y(v))}ctx.stroke()}
  ctx.restore();
  drawArrowPx(ctx,b.x,b.y+b.h,b.x+b.w+14,b.y+b.h,COL.r,{w:1.4,head:.7});
  drawArrowPx(ctx,b.x,b.y+b.h,b.x,b.y-14,COL.r,{w:1.4,head:.7});
  o.xlb?txt(ctx,o.xl??'',b.x+b.w+14,b.y+b.h+32,{align:'right'}):txt(ctx,o.xl??'',b.x+b.w+12,b.y+b.h-10,{align:'right'});txt(ctx,o.yl??'',b.x+8,b.y-14,{align:'left'});
  if(o.xt)o.xt.forEach(([v,s])=>txt(ctx,s,X(v),b.y+b.h+14,{font:MONO,color:COL.muted}));
  if(o.yt)o.yt.forEach(([v,s])=>txt(ctx,s,b.x-6,Y(v),{font:MONO,color:COL.muted,align:'right'}));
  return {X,Y};
}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function flame(ctx,x,y,s,t,a=1){ctx.save();ctx.globalAlpha=a;for(let k=0;k<3;k++){const q=1-k*.3,fl=Math.sin(t*14+k*2)*.12;
  ctx.fillStyle=['rgba(200,64,42,.85)','rgba(232,140,40,.9)','rgba(255,214,90,.95)'][k];ctx.beginPath();ctx.moveTo(x-10*s*q,y);
  ctx.quadraticCurveTo(x-12*s*q,y-18*s*q,x+fl*20*s,y-(34+6*Math.sin(t*9+k))*s*q);ctx.quadraticCurveTo(x+12*s*q,y-18*s*q,x+10*s*q,y);ctx.fill()}ctx.restore()}
// rezervor (termostat): dreptunghi colorat, cu eticheta lui
function tank(ctx,x,y,w,h,hot,title,sub){const g=ctx.createLinearGradient(x,y,x,y+h);
  if(hot){g.addColorStop(0,'rgba(200,64,42,.30)');g.addColorStop(1,'rgba(200,64,42,.12)')}else{g.addColorStop(0,'rgba(31,90,138,.12)');g.addColorStop(1,'rgba(31,90,138,.30)')}
  ctx.fillStyle=g;rrect(ctx,x,y,w,h,8);ctx.fill();ctx.strokeStyle=hot?COL.a:COL.b;ctx.lineWidth=1.6;rrect(ctx,x,y,w,h,8);ctx.stroke();
  txt(ctx,title,x+14,y+h/2-(sub?8:0),{align:'left',font:SERIF(16,600),color:hot?COL.a:COL.b});if(sub)txt(ctx,sub,x+14,y+h/2+11,{align:'left',font:MONO,color:COL.muted})}
// „bandă” Sankey: o linie groasă de-a lungul unei curbe Bézier, cu vârf de săgeată
function band(ctx,pts,wd,col,o={}){if(wd<.5)return;const [a,c1,c2,b]=pts;ctx.save();ctx.strokeStyle=col;ctx.globalAlpha=o.alpha??.22;ctx.lineWidth=wd;ctx.lineCap='butt';
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],b[0],b[1]);ctx.stroke();ctx.restore();
  if(o.head!==false){const dx=b[0]-c2[0],dy=b[1]-c2[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,hw=wd/2+7,hl=Math.min(16,wd*.5+8);
    ctx.save();ctx.fillStyle=col;ctx.globalAlpha=(o.alpha??.22)*2.2;ctx.beginPath();ctx.moveTo(b[0]+ux*hl,b[1]+uy*hl);ctx.lineTo(b[0]-uy*hw,b[1]+ux*hw);ctx.lineTo(b[0]+uy*hw,b[1]-ux*hw);ctx.closePath();ctx.fill();ctx.restore()}}
// punct pe curba Bézier (pentru „pachetele” de energie)
function bez(pts,t){const [a,b,c,d]=pts,m=1-t;return [m*m*m*a[0]+3*m*m*t*b[0]+3*m*t*t*c[0]+t*t*t*d[0],m*m*m*a[1]+3*m*m*t*b[1]+3*m*t*t*c[1]+t*t*t*d[1]]}
function bezN(pts,t){const e=.01,p=bez(pts,clamp(t-e,0,1)),q=bez(pts,clamp(t+e,0,1)),dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy)||1;return [-dy/L,dx/L]}
const seg=(a,b)=>[a,[lerp(a[0],b[0],.4),lerp(a[1],b[1],.4)],[lerp(a[0],b[0],.6),lerp(a[1],b[1],.6)],b];
// setează programatic un slider (și declanșează actualizarea simulării)
function setK(S,k,v){const i=$(`input[data-k="${k}"]`,S.fig);if(!i)return;i.value=v;i.dispatchEvent(new Event('input'))}
function bolt(ctx,x,y,s,col){ctx.save();ctx.fillStyle=col;ctx.beginPath();[[1,-12],[-6,2],[-1,2],[-3,12],[6,-3],[1,-3]].forEach(([a,b],i)=>i?ctx.lineTo(x+a*s,y+b*s):ctx.moveTo(x+a*s,y+b*s));ctx.closePath();ctx.fill();ctx.restore()}
function snow(ctx,x,y,r,col){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.lineCap='round';for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.beginPath();ctx.moveTo(x-Math.cos(a)*r,y-Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke()}ctx.restore()}

/* ---------- Fig. 1 — Schema motorului termic și a mașinii frigorifice ---------- */
(()=>{const S=new Sim('#fig1',{fmt:{Qp:v=>v+' J',r:v=>v+' %',Qf:v=>v+' J',Lf:v=>v+' J'}});
  const PER=3.4,PK=20; // durata unui ciclu (s), energia unui „pachet” (J)
  let run=true,ph=0,cyc=0,stopAt=null,pk=[],acc=0,sp=[0,0],lift=0,wheel=0,G=null,glow={h:0,c:0,w:0};
  const E=()=>{if(S.mode==='motor'){const a=S.p.Qp,b=Math.round(a*S.p.r/100);return {a,b,L:a-b}}const a=S.p.Qf,L=S.p.Lf;return {a,L,b:a+L}};
  const reset=()=>{pk=[];ph=0;sp=[0,0];acc=0;cyc=0;lift=0};
  S.onMode=()=>{reset();SND.tick()};
  const setRun=v=>{run=v;S.label('run',v?'Pauză':'Continuă',v?'#i-pause':'#i-play')};
  S.act=a=>{if(a==='run'){stopAt=null;setRun(!run);SND.tick()}if(a==='cycle'){if(!run){ph=0;sp=[0,0]}stopAt=cyc+1;setRun(true);SND.tick()}};
  S.step=dt=>{S.time+=dt;glow.h=Math.max(0,glow.h-dt*3);glow.c=Math.max(0,glow.c-dt*3);glow.w=Math.max(0,glow.w-dt*3);if(!run||!G)return;
    const e=E();wheel+=dt*(S.mode==='motor'?1:-1)*2.2;ph+=dt/PER;
    // pachetele care intră în mașină, distribuite uniform pe durata ciclului
    const nA=Math.round(e.a/PK),nB=S.mode==='frig'?Math.round(e.L/PK):0,f=Math.min(ph,1);
    while(sp[0]<nA*f){pk.push({p:S.mode==='motor'?'h':'c2',u:0,j:Math.random()*2-1});sp[0]++}
    while(sp[1]<nB*f){pk.push({p:'w2',u:0,j:Math.random()*2-1});sp[1]++}
    pk.forEach(q=>{q.u+=dt/1.15;if(q.u<1)return;
      if(q.p==='h'){q.p=null;acc+=S.p.r/100;if(acc>=1-1e-9){acc-=1;pk.push({p:'c',u:0,j:q.j})}else pk.push({p:'w',u:0,j:q.j})}
      else if(q.p==='c2'||q.p==='w2'){q.p=null;pk.push({p:'h2',u:0,j:q.j})}
      else{if(q.p==='w'){lift+=PK;glow.w=1}if(q.p==='c')glow.c=1;if(q.p==='h2')glow.h=1;q.p=null}});
    pk=pk.filter(q=>q.p);
    if(ph>=1){ph-=1;sp=[0,0];cyc++;SND.tick(.25);if(stopAt!==null&&cyc>=stopAt){stopAt=null;setRun(false);SND.ok()}}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const e=E(),mot=S.mode==='motor',narrow=w<560;
    const cx=narrow?w*.4:w*.4,cy=h*.5,R=Math.min(50,w*.09),k=Math.min(70,h*.13)/(mot?1000:1300);
    const wx=Math.min(w-60,cx+R+(narrow?100:180)),bw=Math.min(cx*2-36,wx-88),hot={x:18,y:18,w:bw,h:64},cold={x:18,y:h-82,w:bw,h:64};
    const tiny=w<460;tank(ctx,hot.x,hot.y,hot.w,hot.h,true,'Sursa caldă',tiny?'temperatura T_c':mot?'T_c · ex.: arderea combustibilului':'T_c · ex.: aerul din cameră');
    tank(ctx,cold.x,cold.y,cold.w,cold.h,false,'Sursa rece',tiny?'temperatura T_r':mot?'T_r · ex.: aerul atmosferic':'T_r · ex.: interiorul frigiderului');
    if(glow.h){ctx.fillStyle=`rgba(200,64,42,${.18*glow.h})`;rrect(ctx,hot.x,hot.y,hot.w,hot.h,8);ctx.fill()}
    if(glow.c){ctx.fillStyle=`rgba(31,90,138,${.18*glow.c})`;rrect(ctx,cold.x,cold.y,cold.w,cold.h,8);ctx.fill()}
    if(mot)for(let i=0;i<3;i++)flame(ctx,hot.x+hot.w-26-i*22,hot.y+30,.45,S.time+i*1.7,.8);else snow(ctx,cold.x+cold.w-24,cold.y+20,8,COL.b);
    // traseele energiei (benzi cu lățimea proporțională cu energia)
    const T=hot.y+hot.h,B=cold.y;
    G=mot?{h:seg([cx,T],[cx,cy-R]),c:seg([cx,cy+R],[cx,B]),w:[[cx+R,cy],[cx+R+60,cy],[wx-90,cy],[wx-34,cy]]}
         :{c2:seg([cx,B],[cx,cy+R]),h2:seg([cx,cy-R],[cx,T]),w2:[[wx-34,cy],[wx-90,cy],[cx+R+60,cy],[cx+R,cy]]};
    const W={h:e.a*k,c:e.b*k,w:e.L*k,c2:e.a*k,h2:e.b*k,w2:e.L*k},CL={h:COL.a,c:COL.b,w:COL.o,c2:COL.b,h2:COL.a,w2:COL.o};
    Object.keys(G).forEach(p=>band(ctx,G[p],W[p],CL[p]));
    // pachetele
    pk.forEach(q=>{const g=G[q.p];if(!g)return;const [x,y]=bez(g,q.u),[nx,ny]=bezN(g,q.u),o=q.j*W[q.p]*.36;dot(ctx,x+nx*o,y+ny*o,3.6,CL[q.p])});
    // etichetele energiilor
    const lab=(s,v,x,y,c,al='left')=>{txt(ctx,s,x,y-9,{align:al,font:SERIF(17,600),color:c});txt(ctx,v+' J',x,y+10,{align:al,font:MONOB,color:c})};
    if(mot){lab('Q_p',e.a,cx+W.h/2+14,(T+cy-R)/2,COL.a);lab('|Q_c|',e.b,cx+W.c/2+14,(B+cy+R)/2,COL.b);lab('L',e.L,(cx+R+wx-34)/2,cy-W.w/2-20,COL.o,'center')}
    else{lab('Q_p',e.a,cx+W.c2/2+14,(B+cy+R)/2,COL.b);lab('|Q_c| = Q_p + L',e.b,cx+W.h2/2+14,(T+cy-R)/2,COL.a);lab('L',e.L,(cx+R+wx-34)/2,cy-W.w2/2-20,COL.o,'center')}
    // mașina (roată care se învârte)
    ctx.save();ctx.translate(cx,cy);ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.stroke();
    ctx.rotate(wheel);ctx.strokeStyle='rgba(26,29,38,.25)';ctx.lineWidth=5;for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(R*.2,0);ctx.lineTo(R*.82,0);ctx.stroke()}ctx.restore();
    dot(ctx,cx,cy,R*.2,COL.r);txt(ctx,mot?'motor':'mașină',cx-R-10,cy-8,{align:'right',font:SERIF(15,600)});if(!mot)txt(ctx,'frigorifică',cx-R-10,cy+10,{align:'right',font:SERIF(15,600)});
    // în dreapta: greutatea ridicată (motor) sau rețeaua electrică (frigider)
    if(mot){const pr=18,px=wx,py=cy;ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,pr,0,TAU);ctx.fill();ctx.stroke();dot(ctx,px,py,3,COL.r);
      const top=py+60,bot=h-40,fr=(lift%3000)/3000,yw=bot-fr*(bot-top);line(ctx,px+pr,py,px+pr,yw-18,COL.r,1.4);
      ctx.fillStyle=glow.w?`rgba(176,122,18,${.5+.4*glow.w})`:'#6f6a5f';rrect(ctx,px+pr-16,yw-18,32,30,4);ctx.fill();txt(ctx,'m',px+pr,yw-3,{color:'#fff',font:SERIF(15,700),halo:false});
      txt(ctx,'lucrul mecanic',px,py-pr-26,{font:MONO,color:COL.o});txt(ctx,'ridică greutatea',px,py-pr-12,{font:MONO,color:COL.o});
      txt(ctx,`ΣL = ${f(lift/1000,2)} kJ`,px,h-18,{font:MONOB,color:COL.o})}
    else{const px=wx,py=cy;ctx.fillStyle='#fff';ctx.strokeStyle=COL.o;ctx.lineWidth=2;rrect(ctx,px-24,py-30,48,60,8);ctx.fill();ctx.stroke();bolt(ctx,px,py,1.6,glow.h?COL.a:COL.o);
      txt(ctx,'rețeaua',px,py+46,{font:MONO,color:COL.o});txt(ctx,'electrică',px,py+60,{font:MONO,color:COL.o})}
    // indicatorul ciclului
    const ix=w-22,iy=26;ctx.strokeStyle=COL.rule;ctx.lineWidth=4;ctx.beginPath();ctx.arc(ix-10,iy+4,12,0,TAU);ctx.stroke();ctx.strokeStyle=COL.a;ctx.beginPath();ctx.arc(ix-10,iy+4,12,-Math.PI/2,-Math.PI/2+TAU*ph);ctx.stroke();
    txt(ctx,`ciclul ${cyc+1}`,ix-30,iy+4,{align:'right',font:MONO,color:COL.muted});
    if(mot){const eta=e.L/e.a;S.out('k1','Q<sub>p</sub> (primită)');S.out('v1',e.a+' J');S.out('k2','|Q<sub>c</sub>| (cedată)');S.out('v2',e.b+' J');S.out('k3','L · η');S.out('v3',`${e.L} J · ${f(eta*100,0)} %`);
      S.out('hint',S.p.r<=5?'Ai ajuns la limită: |Q<sub>c</sub>| nu poate fi zero. Fără sursă rece ciclul ar fi monoterm — interzis de principiul al II-lea.':
        `Din fiecare 100 J primiți de la sursa caldă, ${S.p.r} J ajung inevitabil la sursa rece și doar ${100-S.p.r} J devin lucru mecanic. ΔU = 0 pe ciclu, deci L = Q<sub>p</sub> − |Q<sub>c</sub>|.`)}
    else{S.out('k1','Q<sub>p</sub> (de la rece)');S.out('v1',e.a+' J');S.out('k2','L (consumat)');S.out('v2',e.L+' J');S.out('k3','|Q<sub>c</sub>| (spre cald)');S.out('v3',e.b+' J');
      S.out('hint',`Săgețile s-au inversat: mașina ia ${e.a} J de la sursa rece, primește ${e.L} J ca lucru mecanic și cedează sursei calde |Q<sub>c</sub>| = Q<sub>p</sub> + L = ${e.b} J. Căldura nu trece singură de la rece la cald — trebuie „plătită” cu lucru mecanic.`)}};
})();

/* ---------- Fig. 2 — Randamentul termic și de ce η < 1 ---------- */
(()=>{const S=new Sim('#fig2',{fmt:{Qp:v=>v+' J',Qc:v=>v+' J',fr:v=>v+' %'}});
  let tw=null,shake=0,stamp=0;
  S.act=a=>{if(a==='mono'){tw={k:'Qc',from:S.p.Qc,to:0,u:0,dur:1.1,done:()=>{shake=.7;SND.bad();toast('Imposibil: fără sursă rece ciclul ar fi monoterm — principiul al II-lea o interzice.')}};SND.whoosh()}
    if(a==='ex'){setK(S,'Qp',1000);setK(S,'Qc',450);setK(S,'fr',25);if(!S.t.real)$('[data-t="real"]',S.fig).click();SND.ok();toast('Motor de autoturism: η teoretic ≈ 55 %, dar η real ≈ 30 %.')}};
  S.onParam=k=>{if(k==='Qc'&&S.p.Qc===0&&!tw){shake=.5;SND.bad()}};
  S.step=dt=>{S.time+=dt;shake=Math.max(0,shake-dt);stamp=lerp(stamp,S.p.Qc===0||S.p.Qc>=S.p.Qp?1:0,.15);
    if(tw){tw.u=Math.min(1,tw.u+dt/tw.dur);const e=1-Math.pow(1-tw.u,3);setK(S,tw.k,Math.round(lerp(tw.from,tw.to,e)/10)*10);if(tw.u>=1){const d=tw.done;tw=null;d&&d()}}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const Qp=S.p.Qp,Qc=Math.min(S.p.Qc,Qp),L=Qp-Qc,los=S.t.real?Math.min(L,Qp*S.p.fr/100):0,Lu=L-los,narrow=w<560;
    ctx.save();if(shake)ctx.translate(Math.sin(S.time*60)*8*shake,0);
    const k=Math.min(120,h*.24)/2000,cy=h*.3,nx=narrow?w*.3:w*.3,Wp=Qp*k,Wc=Qc*k,WL=L*k,Wl=los*k,Wu=Lu*k;
    // intrarea: Q_p
    flame(ctx,30,cy+Wp/2+40,.7,S.time);txt(ctx,'combustibil',34,cy+Wp/2+54,{font:MONO,color:COL.muted,align:'left'});
    band(ctx,seg([20,cy],[nx,cy]),Wp,COL.a,{head:false,alpha:.28});txt(ctx,`Q_p = ${Qp} J`,24,cy-Wp/2-14,{align:'left',font:SERIF(17,600),color:COL.a});
    // nodul (motorul)
    ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=2;rrect(ctx,nx-8,cy-Wp/2-6,16,Wp+12,4);ctx.fill();ctx.stroke();
    // ieșirile: L (sus, spre dreapta), |Q_c| (jos, spre sursa rece)
    const yL=cy-Wp/2+WL/2,yC=cy+Wp/2-Wc/2,xs=narrow?w*.62:w*.55,coldY=h-70;
    if(Qc>0){band(ctx,[[nx+8,yC],[nx+120,yC],[nx+60,coldY-60],[nx+70,coldY-14]],Wc,COL.b,{alpha:.26});tank(ctx,nx-40,coldY,narrow?150:200,48,false,'sursa rece');txt(ctx,`|Q_c| = ${Qc} J`,nx+Wc/2+90,(yC+coldY)/2+10,{align:'left',font:SERIF(17,600),color:COL.b})}
    if(L>0){if(S.t.real&&los>0){band(ctx,seg([nx+8,yL],[xs,yL]),WL,COL.o,{head:false,alpha:.26});
        const yU=yL-WL/2+Wu/2,yl=yL+WL/2-Wl/2;band(ctx,seg([xs,yU],[w-40,yU]),Wu,COL.o,{alpha:.3});
        band(ctx,[[xs,yl],[xs+90,yl],[xs+40,coldY-40],[xs+60,coldY-10]],Wl,COL.plum,{alpha:.24});
        txt(ctx,`pierderi ${f(los,0)} J`,xs+70,coldY+4,{align:'left',font:MONOB,color:COL.plum});txt(ctx,'frecări, pereți, ardere incompletă',xs+70,coldY+20,{align:'left',font:MONO,color:COL.muted});
        txt(ctx,`L util = ${f(Lu,0)} J`,w-40,yU-Wu/2-14,{align:'right',font:SERIF(17,600),color:COL.o})}
      else{band(ctx,seg([nx+8,yL],[w-40,yL]),WL,COL.o,{alpha:.3});txt(ctx,`L = ${L} J`,w-40,yL-WL/2-14,{align:'right',font:SERIF(17,600),color:COL.o})}}
    ctx.restore();
    // cadranul randamentului
    const gr=Math.min(78,w*.14),gx=w-gr-34,gy=h-46;ctx.save();ctx.lineCap='round';
    ctx.strokeStyle=COL.rule;ctx.lineWidth=12;ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI,TAU);ctx.stroke();
    const ang=v=>Math.PI+Math.PI*clamp(v,0,1),eta=L/Qp,etr=Lu/Qp;
    ctx.strokeStyle=COL.o;ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI,ang(eta));ctx.stroke();ctx.globalAlpha=1;
    for(let i=0;i<=10;i++){const a=ang(i/10);line(ctx,gx+Math.cos(a)*(gr-16),gy+Math.sin(a)*(gr-16),gx+Math.cos(a)*(gr-(i%5?10:4)),gy+Math.sin(a)*(gr-(i%5?10:4)),COL.r,1)}
    drawArrowPx(ctx,gx,gy,gx+Math.cos(ang(eta))*(gr-14),gy+Math.sin(ang(eta))*(gr-14),COL.a,{w:2.6});
    if(S.t.real)drawArrowPx(ctx,gx,gy,gx+Math.cos(ang(etr))*(gr-24),gy+Math.sin(ang(etr))*(gr-24),COL.plum,{w:2.2});
    dot(ctx,gx,gy,5,COL.r);ctx.restore();
    txt(ctx,'0',gx-gr,gy+14,{font:MONO,color:COL.muted});txt(ctx,'100 %',gx+gr,gy+14,{font:MONO,color:COL.muted});txt(ctx,`η = ${f(eta*100,1)} %`,gx,gy-gr-18,{font:SERIF(17,600),color:COL.a});
    // ștampila „imposibil”
    if(stamp>.02){ctx.save();ctx.globalAlpha=stamp;ctx.translate(nx+(narrow?40:120),cy+30);ctx.rotate(-.18);ctx.strokeStyle=COL.a;ctx.lineWidth=3;rrect(ctx,-130,-30,260,60,6);ctx.stroke();
      txt(ctx,S.p.Qc===0?'IMPOSIBIL':'NU E MOTOR',0,-8,{font:'700 22px "JetBrains Mono", monospace',color:COL.a});txt(ctx,S.p.Qc===0?'principiul al II-lea':'L ≤ 0: consumă lucru mecanic',0,16,{font:MONO,color:COL.a});ctx.restore()}
    S.out('L',`${L} J`);S.out('eta',f(eta*100,1)+' %');S.out('etar',S.t.real?f(etr*100,1)+' %':'—');
    S.out('hint',S.p.Qc===0?'Un motor care ar transforma toată căldura primită în lucru mecanic (η = 100 %) ar lucra cu o singură sursă de căldură — un „perpetuum mobile de speța a II-a”. Principiul al II-lea îl interzice.':
      S.p.Qc>=Qp?'Dacă |Q<sub>c</sub>| ≥ Q<sub>p</sub>, lucrul mecanic nu mai este pozitiv: sistemul nu mai funcționează ca motor.':
      S.t.real?`Pierderile (${S.p.fr} % din Q<sub>p</sub>) scad randamentul de la ${f(eta*100,1)} % la ${f(etr*100,1)} %. Motoarele reale de automobil au η ≈ 25–40 %.`:
      `η = L/Q<sub>p</sub> = 1 − |Q<sub>c</sub>|/Q<sub>p</sub> = 1 − ${Qc}/${Qp} = ${f(eta,3)}. Mărimea este adimensională.`)};
})();

/* ---------- Fig. 3 — Motorul în patru timpi și diagrama p–V ---------- */
(()=>{const S=new Sim('#fig3',{fmt:{rpm:v=>v+' rot/min'}});
  const MODELS={otto:window.PraxisHeatEnginesModel.create("otto"),diesel:window.PraxisHeatEnginesModel.create("diesel")};const model=()=>MODELS[S.mode];const CF={otto:{e:3},diesel:{e:4}};
  const NAMES=['1 · Admisia','2 · Compresia','3 · Timpul motor','4 · Evacuarea'];
  let th=0,run=false,target=null,flash=0,smoke=[];
  // poziția pistonului (0 = PMS … 2 = PMI), bielă de 3,2 ori manivela
  const X=d=>{const a=d*Math.PI/180,l=3.2;return 1+l-(Math.cos(a)+Math.sqrt(l*l-Math.sin(a)**2))};
  const vol=d=>{const V2=1/CF[S.mode].e;return V2+(1-V2)*X(d)/2};
  const stage=d=>model().at(d).stroke;
  const setRun=v=>{run=v;S.label('run',v?'Oprește motorul':'Pornește motorul',v?'#i-pause':'#i-play')};
  S.onMode=()=>{th=0;target=null;setRun(false);SND.tick()};
  S.act=a=>{if(a==='run'){target=null;setRun(!run);run&&SND.whoosh()}if(a==='step'){setRun(false);target=model().boundaries[stage(th)];if(target<=th+1e-8)target+=model().period;SND.tick()}};
  function cross(a,b){const s0=stage(a),s1=stage(b);if(s0===s1)return;
    if(s1===0){SND.tick(.3);if(S.p.rpm<=30)SND.whoosh()}
    if(s1===1)SND.tick(.3);
    if(s1===2){flash=1;SND.knock();if(S.mode==='otto')SND.tick(.4)}
    if(s1===3){SND.tick(.3);for(let i=0;i<12;i++)smoke.push({x:0,y:0,vx:20+Math.random()*30,vy:-30-Math.random()*40,a:1})}}
  S.step=dt=>{S.time+=dt;flash=Math.max(0,flash-dt*2.2);smoke.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.a-=dt*.6});smoke=smoke.filter(s=>s.a>0);
    if(!run&&target===null)return;const sp=target!==null?Math.max(S.p.rpm*6,90):S.p.rpm*6,old=th;th+=sp*dt;
    if(target!==null&&th>=target){th=target;target=null}cross(old,th);if(th>=model().period){th-=model().period;if(target!==null)target-=model().period}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const m=model(),state=m.at(th),c=CF[S.mode],narrow=w<620,st=state.stroke,d=state.angle,u=(d%180)/180;
    const lw=narrow?w*.46:w*.42,cx=lw/2+(narrow?4:10),B=Math.min(130,lw*.52),y0=82,Ls=Math.min(h*.27,150),r=Ls/2,l=3.2*r,hc=Ls*.2,pH=B*.5;
    const yT=y0+hc,yp=yT+X(d)*r,yc=yT+pH*.5+r+l,a=d*Math.PI/180,kx=cx+r*Math.sin(a),ky=yc-r*Math.cos(a);
    // gazul din cilindru
    const gas=st===0?(S.mode==='otto'?'rgba(46,125,87,.22)':'rgba(31,90,138,.16)'):st===1?heat(.15+.45*u,.3):st===2?heat(1-.55*u,.38+.3*flash):'rgba(111,106,95,.3)';
    ctx.fillStyle=gas;ctx.fillRect(cx-B/2,y0,B,yp-y0);
    if(st===2&&flash>0){const g=ctx.createRadialGradient(cx,y0+6,2,cx,y0+6,B*.9);g.addColorStop(0,`rgba(255,214,90,${flash})`);g.addColorStop(1,'rgba(232,140,40,0)');ctx.fillStyle=g;ctx.fillRect(cx-B/2,y0,B,yp-y0)}
    // pereții cilindrului și chiulasa
    const cyl=yT+2*r+pH+12;ctx.fillStyle='#d8d1c2';ctx.fillRect(cx-B/2-16,y0,16,cyl-y0);ctx.fillRect(cx+B/2,y0,16,cyl-y0);
    ctx.strokeStyle=COL.r;ctx.lineWidth=1.6;ctx.strokeRect(cx-B/2-16,y0,16,cyl-y0);ctx.strokeRect(cx+B/2,y0,16,cyl-y0);
    ctx.fillStyle='#bfb6a3';ctx.fillRect(cx-B/2-34,y0-30,B+68,30);ctx.strokeRect(cx-B/2-34,y0-30,B+68,30);
    // conductele de admisie și evacuare, supapele
    const vA=st===0?Math.sin(u*Math.PI):0,vE=st===3?Math.sin(u*Math.PI):0,vx=B*.28;
    [[-1,vA,'A',COL.b],[1,vE,'E',COL.muted]].forEach(([s,o,n,col])=>{const x=cx+s*vx;
      ctx.fillStyle=o>.05?(s<0?(S.mode==='otto'?'rgba(46,125,87,.25)':'rgba(31,90,138,.2)'):'rgba(111,106,95,.3)'):'#efe9dc';
      ctx.beginPath();ctx.moveTo(x-12,y0);ctx.lineTo(x+12,y0);ctx.lineTo(x+s*40+12*s,y0-30);ctx.lineTo(x+s*40-12*s,y0-30);ctx.closePath();ctx.fill();
      const yv=y0+o*12;ctx.fillStyle=COL.r;ctx.fillRect(x-1.5,y0-46,3,yv-y0+46);ctx.beginPath();ctx.moveTo(x-15,yv+2);ctx.lineTo(x+15,yv+2);ctx.lineTo(x+5,yv-4);ctx.lineTo(x-5,yv-4);ctx.closePath();ctx.fill();
      txt(ctx,n,x,y0-56,{font:SERIF(16,700),color:o>.05?COL.a:COL.r});
      if(o>.05){const t=(S.time*1.6)%1;for(let i=0;i<3;i++){const q=(t+i/3)%1;const px=s<0?lerp(x-60,x,q):lerp(x,x+60,q),py=s<0?lerp(y0-40,y0+10,q):lerp(y0+10,y0-40,q);dot(ctx,px,py,2.6,s<0?(S.mode==='otto'?COL.c:COL.b):COL.muted)}}});
    // bujia / injectorul
    ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=1.4;rrect(ctx,cx-6,y0-44,12,40,3);ctx.fill();ctx.stroke();
    txt(ctx,S.mode==='otto'?'bujie':'injector',cx,y0-70,{font:MONO,color:COL.muted});
    if(S.mode==='otto'&&st===2&&flash>.6){ctx.strokeStyle='#ffd65a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,y0);for(let i=1;i<5;i++)ctx.lineTo(cx+(i%2?6:-6),y0+i*4);ctx.stroke()}
    if(S.mode==='diesel'&&d>=356&&d<420){ctx.fillStyle='rgba(176,122,18,.55)';for(let i=0;i<26;i++){const q=Math.random(),an=(Math.random()-.5)*1.4;dot(ctx,cx+Math.sin(an)*q*B*.45,y0+2+Math.cos(an)*q*(yp-y0)*.9,1.4)}}
    // pistonul, biela, arborele cotit
    const pg=ctx.createLinearGradient(cx-B/2,0,cx+B/2,0);pg.addColorStop(0,'#7d8290');pg.addColorStop(.5,'#c5c9d0');pg.addColorStop(1,'#6d7178');
    ctx.fillStyle=pg;ctx.fillRect(cx-B/2+1,yp,B-2,pH);ctx.strokeStyle=COL.r;ctx.lineWidth=1.4;ctx.strokeRect(cx-B/2+1,yp,B-2,pH);
    for(let i=1;i<=2;i++)line(ctx,cx-B/2+1,yp+i*6,cx+B/2-1,yp+i*6,'rgba(26,29,38,.5)',1);
    ctx.fillStyle='rgba(176,122,18,.12)';ctx.beginPath();ctx.arc(cx,yc,r+18,0,TAU);ctx.fill();
    ctx.strokeStyle='#3a3d46';ctx.lineWidth=B*.13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,yp+pH*.5);ctx.lineTo(kx,ky);ctx.stroke();
    ctx.lineWidth=B*.16;ctx.strokeStyle='#5a5e68';ctx.beginPath();ctx.moveTo(cx,yc);ctx.lineTo(kx,ky);ctx.stroke();ctx.lineCap='butt';
    dot(ctx,cx,yp+pH*.5,4,'#fff',COL.r);dot(ctx,kx,ky,5,'#fff',COL.r);dot(ctx,cx,yc,6,COL.r);
    // PMS / PMI
    [[yT,'PMS'],[yT+2*r,'PMI']].forEach(([y,s])=>{line(ctx,cx+B/2+20,y,cx+B/2+36,y,COL.muted,1,[3,3]);txt(ctx,s,cx+B/2+40,y,{align:'left',font:MONO,color:COL.muted})});
    // fum la evacuare
    smoke.forEach(s=>{ctx.fillStyle=`rgba(111,106,95,${.35*s.a})`;ctx.beginPath();ctx.arc(cx+vx+52+s.x,y0-36+s.y,6+(1-s.a)*10,0,TAU);ctx.fill()});
    txt(ctx,NAMES[st],cx,h-20,{font:SERIF(narrow?16:19,700),color:st===2?COL.a:COL.r});
    // Only 1→2→3→4→1 is plotted. The cursor waits at state 1 during gas exchange.
    const plot={x:lw+(narrow?25:40),y:48,w:w-lw-(narrow?62:84),h:h-112};
    window.PraxisIdealCycleDiagram.draw(ctx,plot,{kind:S.mode,cycle:m.cycle,phase:state.phase>=1&&state.phase<=4?state.phase-1:-1,fraction:state.fraction,area:S.t.area,mark:true});

    const vs=['deschisă','închisă'];S.out('st',NAMES[st]);S.out('valv',st===0?'A deschisă':st===3?'E deschisă':'ambele închise');S.out('ang',`${f(d,0)}° (rot. ${d<360?1:2}/2)`);
    const H=S.mode==='otto'?['Pistonul coboară, supapa A este deschisă: intră amestecul de vapori de benzină și aer, la presiunea atmosferică.','Ambele supape închise: pistonul urcă și comprimă adiabatic în modelul ideal amestecul (1→2). Temperatura crește.','Scânteia bujiei aprinde amestecul: presiunea crește brusc la V = const. (2→3), apoi gazele împing pistonul — destindere adiabatică (3→4). Timpul care furnizează lucru mecanic util.','Se deschide supapa E: presiunea scade la V = const. (4→1), apoi pistonul împinge gazele arse afară.']
      :['Pistonul coboară, supapa A este deschisă: intră numai aer, la presiunea atmosferică.','Aerul este comprimat adiabatic (1→2): volumul scade, iar presiunea și temperatura cresc.','Injectorul pulverizează motorina, care se autoaprinde. Arderea are loc la p = const. (2→3) cât timp pistonul începe să coboare, apoi urmează destinderea adiabatică (3→4).','Se deschide supapa E: presiunea scade la V = const. (4→1), apoi gazele arse sunt evacuate.'];
    S.out('hint',H[st])};
})();

/* ---------- Fig. 4 — Compresia adiabatică: autoaprindere vs. detonație ---------- */
(()=>{const S=new Sim('#fig4',{fmt:{eps:v=>v%1?f(v,1):String(v),t1:v=>v+' °C'}});
  const TH={diesel:450,otto:530}; // praguri orientative (°C)
  let u=0,ph='idle',tt=0,hist=[],mol=[],drops=[];
  for(let i=0;i<46;i++)mol.push({x:Math.random(),y:Math.random(),a:Math.random()*TAU});
  const n=()=>S.t.loss?1.3:1.4,T1=()=>S.p.t1+273.15;
  const V=()=>1-u*(1-1/S.p.eps),T=()=>T1()*Math.pow(1/V(),n()-1),P=()=>Math.pow(1/V(),n());
  function init(){u=0;ph='idle';tt=0;hist=[];drops=[];S.label('go','Comprimă','#i-play')}
  S.onParam=S.onMode=S.onToggle=()=>init();
  S.act=a=>{if(a==='reset'){init();SND.tick()}if(a==='go'){if(ph!=='idle')init();ph='comp';SND.whoosh();S.label('go','Comprimă din nou','#i-reset')}};
  S.step=dt=>{S.time+=dt;const sp=Math.sqrt(T()/300);mol.forEach(m=>{m.x+=Math.cos(m.a)*sp*dt*.6;m.y+=Math.sin(m.a)*sp*dt*.6;if(m.x<0||m.x>1){m.a=Math.PI-m.a;m.x=clamp(m.x,0,1)}if(m.y<0||m.y>1){m.a=-m.a;m.y=clamp(m.y,0,1)}});
    if(ph==='comp'){u=Math.min(1,u+dt/2.6);hist.push([V(),T()-273.15]);
      if(S.mode==='otto'&&T()-273.15>TH.otto){ph='knock';tt=0;SND.knock();SND.bad();setTimeout(()=>SND.knock(),90);toast('Detonație! Amestecul s-a aprins singur înainte de scânteie.')}
      else if(u>=1){ph=S.mode==='diesel'?'inj':'spark';tt=0;S.mode==='diesel'?SND.splash():SND.tick(.5)}}
    else if(ph==='inj'){tt+=dt;if(Math.random()<dt*40)drops.push({r:0,a:(Math.random()-.5)*1.1,v:.6+Math.random()*.5});drops.forEach(d=>d.r+=d.v*dt);
      if(tt>.6){if(T()-273.15>=TH.diesel){ph='burn';tt=0;SND.knock();SND.whoosh();toast('Autoaprindere: motorina s-a aprins singură în aerul fierbinte.')}else{ph='miss';tt=0;SND.bad();toast('Rateu: aerul nu este destul de fierbinte ca motorina să se aprindă.')}}}
    else if(ph==='spark'){tt+=dt;if(tt>.25){ph='burn';tt=0;SND.knock();SND.whoosh()}}
    else if(ph==='burn'||ph==='knock'||ph==='miss')tt+=dt};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const dsl=S.mode==='diesel',t=T()-273.15,narrow=w<560;
    // cilindrul orizontal
    const x0=narrow?40:70,Lc=w-x0-(narrow?80:150),ch=Math.min(110,h*.2),cy=36+ch/2+10,xp=x0+Lc*V();
    ctx.fillStyle=heat((t-0)/800,.32);ctx.fillRect(x0,cy-ch/2,xp-x0,ch);
    mol.forEach(m=>dot(ctx,x0+5+m.x*(xp-x0-10),cy-ch/2+5+m.y*(ch-10),2.4,heat(t/800,.85)));
    if(ph==='burn'||ph==='knock'){const R=(ph==='knock'?1:Math.min(1,tt*2.2))*(xp-x0)*1.3,ox=ph==='knock'?lerp(x0,xp,.6):x0;const g=ctx.createRadialGradient(ox,cy,2,ox,cy,Math.max(4,R));
      g.addColorStop(0,'rgba(255,214,90,.95)');g.addColorStop(.6,'rgba(232,120,40,.7)');g.addColorStop(1,'rgba(200,64,42,0)');ctx.save();ctx.beginPath();ctx.rect(x0,cy-ch/2,xp-x0,ch);ctx.clip();ctx.fillStyle=g;ctx.fillRect(x0,cy-ch/2,xp-x0,ch);
      if(ph==='knock'&&tt<.6){ctx.strokeStyle=`rgba(200,64,42,${1-tt/.6})`;ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(ox,cy,(tt*200+i*16),0,TAU);ctx.stroke()}}ctx.restore()}
    if(ph==='inj'||ph==='miss'||ph==='burn')drops.forEach(d=>{const r=d.r*(xp-x0);if(r<xp-x0-4)dot(ctx,x0+6+Math.cos(d.a)*r,cy+Math.sin(d.a)*r*.8,1.8,ph==='burn'?'rgba(232,140,40,.4)':'rgba(176,122,18,.8)')});
    ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0+Lc+40,cy-ch/2);ctx.lineTo(x0,cy-ch/2);ctx.lineTo(x0,cy+ch/2);ctx.lineTo(x0+Lc+40,cy+ch/2);ctx.stroke();
    // injector / bujie în capul cilindrului
    ctx.fillStyle='#fff';ctx.lineWidth=1.4;rrect(ctx,x0-30,cy-7,30,14,3);ctx.fill();ctx.stroke();txt(ctx,dsl?'injector':'bujie',x0-14,cy-ch/2-12,{font:MONO,color:COL.muted});
    if(ph==='spark'){ctx.strokeStyle='#e8a020';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x0+8,cy-5);ctx.lineTo(x0+4,cy+3);ctx.lineTo(x0+12,cy);ctx.stroke()}
    // pistonul și tija
    const pg=ctx.createLinearGradient(0,cy-ch/2,0,cy+ch/2);pg.addColorStop(0,'#7d8290');pg.addColorStop(.5,'#c5c9d0');pg.addColorStop(1,'#6d7178');
    ctx.fillStyle=pg;ctx.fillRect(xp,cy-ch/2+2,30,ch-4);ctx.strokeStyle=COL.r;ctx.lineWidth=1.4;ctx.strokeRect(xp,cy-ch/2+2,30,ch-4);ctx.fillStyle='#5a5e68';ctx.fillRect(xp+30,cy-6,w-xp-30,12);
    if(ph==='comp')drawArrowPx(ctx,xp+90,cy-ch/2-16,xp+40,cy-ch/2-16,COL.r,{w:2});
    // citiri mari
    const rx=narrow?w-14:w-24;const ry=cy+ch/2+24;txt(ctx,f(t,0)+' °C',rx,ry,{align:'right',font:'600 22px "JetBrains Mono", monospace',color:heat(t/800)});txt(ctx,f(P(),1)+' atm',rx-120,ry,{align:'right',font:MONOB,color:COL.r});
    // graficul t(V)
    const b={x:62,y:cy+ch/2+60,w:w-110,h:h-cy-ch/2-104},tmax=900,tmin=-40;
    const {X,Y}=axes(ctx,b,[0,1],[tmin,tmax],{xl:'V / V_max',yl:'t (°C)',xt:[[1/S.p.eps,'1/ε'],[1,'1']],yt:[[0,'0'],[TH[S.mode],String(TH[S.mode])]],gy:100});
    const tc=dsl?COL.c:COL.a;line(ctx,b.x,Y(TH[S.mode]),b.x+b.w,Y(TH[S.mode]),tc,1.4,[6,4]);
    txt(ctx,dsl?'prag orientativ pentru autoaprinderea sigură a motorinei':'prag orientativ de detonație a benzinei',b.x+b.w-4,Y(TH[S.mode])-11,{align:'right',font:MONO,color:tc});
    ctx.beginPath();for(let q=0;q<=1.0001;q+=.01){const vv=1-q*(1-1/S.p.eps),tv=T1()*Math.pow(1/vv,n()-1)-273.15;q?ctx.lineTo(X(vv),Y(tv)):ctx.moveTo(X(vv),Y(tv))}ctx.strokeStyle='rgba(111,106,95,.45)';ctx.lineWidth=1.4;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();hist.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.strokeStyle=COL.a;ctx.lineWidth=2.8;ctx.stroke();
    dot(ctx,X(V()),Y(t),5,COL.a);txt(ctx,`T·V${[...f(n()-1,1)].map(ch=>'⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(ch)]||'˙').join('')} = const.`,X(.62),Y(tmax*.62),{font:SERIF(15),color:COL.muted});
    S.out('v','1/'+f(1/V(),2));S.out('p',f(P(),1)+' atm');S.out('t',f(t,0)+' °C');
    const fin=T1()*Math.pow(S.p.eps,n()-1)-273.15;
    S.out('hint',ph==='idle'?`La final, aerul va avea ≈ ${f(fin,0)} °C și ≈ ${f(Math.pow(S.p.eps,n()),0)} atm (t₁ = ${S.p.t1} °C, ε = ${S.p.eps}). Apasă „Comprimă”.`:
      ph==='comp'?'Compresie rapidă, adiabatică în modelul ideal: lucrul mecanic primit crește energia internă, deci temperatura.':
      ph==='knock'?`Benzina s-a autoaprins la ${f(TH.otto,0)} °C, înainte de scânteie: detonație („bătaie” în motor). De aceea un motor Otto are ε ≈ 8…12.`:
      ph==='miss'?(S.t.loss?'Pereții reci au furat căldură (compresia nu mai e adiabatică). La pornirea pe frig, bujiile incandescente preîncălzesc aerul din cilindru.':'Raport de compresie prea mic: aerul nu ajunge la temperatura de autoaprindere. Motoarele Diesel au ε ≈ 14…22.'):
      ph==='inj'?'Injectorul pulverizează motorina în aerul fierbinte…':
      dsl?`Autoaprindere la ${f(t,0)} °C — fără bujie. Arderea continuă cât timp se injectează motorina.`:'Scânteia a aprins amestecul exact la capătul compresiei: ardere normală, fără detonație.')};
})();

/* ---------- Fig. 5 — Frigiderul și pompa de căldură ---------- */
(()=>{const S=new Sim('#fig5',{fmt:{tr:v=>v+' °C',tc:v=>v+' °C',L:v=>v+' J'}});
  let pk=[],run=0,hum=null,n=0,tot=0;
  const stopHum=()=>{if(hum){hum.stop();hum=null}};S.onHide=stopHum;SND.onChange(v=>{if(!v)stopHum()});
  const E=()=>{const Tr=S.p.tr+273.15,Tc=Math.max(S.p.tc,S.p.tr+1)+273.15,k=S.t.ideal?1:.45,fr=S.mode==='frig';
    const e=(fr?Tr:Tc)/(Tc-Tr)*k,L=S.p.L,Qc=fr?(e+1)*L:e*L,Qp=Qc-L;return {e,L,Qp,Qc,eC:(fr?Tr:Tc)/(Tc-Tr)}};
  S.onMode=()=>{pk=[];SND.tick()};
  S.act=a=>{if(a==='pump'){if(run>0)return;run=2.4;n++;const e=E();tot+=S.mode==='frig'?e.Qp:e.Qc;stopHum();hum=SND.loop('hum',62);hum&&hum.vol(.06);SND.knock()}};
  S.step=dt=>{S.time+=dt;if(run>0){run-=dt;if(Math.random()<dt*22)pk.push({p:'c',u:0,j:Math.random()*2-1});if(Math.random()<dt*7)pk.push({p:'w',u:0,j:Math.random()*2-1});if(run<=0){stopHum();SND.chime()}}
    pk.forEach(q=>{q.u+=dt/1;if(q.u>=1&&q.p!=='h'){q.p='h';q.u=0}});pk=pk.filter(q=>!(q.p==='h'&&q.u>=1))};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const e=E(),fr=S.mode==='frig',narrow=w<560;
    S.out('lr',fr?'t<sub>r</sub> (în frigider)':'t<sub>r</sub> (afară)');S.out('lc',fr?'t<sub>c</sub> (camera)':'t<sub>c</sub> (în casă)');
    const cx=narrow?w*.38:w*.34,cy=h*.5,R=40,k=Math.min(80,h*.15)/Math.max(e.Qc,1),bw=narrow?w*.62:w*.5;
    const hot={x:cx-bw/2,y:18,w:bw,h:70},cold={x:cx-bw/2,y:h-88,w:bw,h:70},px=Math.min(w-40,cx+(narrow?110:200));
    tank(ctx,hot.x,hot.y,hot.w,hot.h,true,fr?'Camera':'Casa (interior)',`t_c = ${S.p.tc} °C · primește |Q_c|`);
    tank(ctx,cold.x,cold.y,cold.w,cold.h,false,fr?'Interiorul frigiderului':'Aerul de afară',`t_r = ${S.p.tr} °C · cedează Q_p`);
    snow(ctx,cold.x+cold.w-26,cold.y+cold.h/2,11,COL.b);
    const G={c:seg([cx,cold.y],[cx,cy+R]),w:[[px-28,cy],[px-80,cy],[cx+R+50,cy],[cx+R,cy]],h:seg([cx,cy-R],[cx,hot.y+hot.h])};
    const W={c:e.Qp*k,w:e.L*k,h:e.Qc*k},C={c:COL.b,w:COL.o,h:COL.a};
    Object.keys(G).forEach(p=>band(ctx,G[p],W[p],C[p],{alpha:.24}));
    pk.forEach(q=>{const g=G[q.p],[x,y]=bez(g,q.u),[nx,ny]=bezN(g,q.u);const o=q.j*W[q.p]*.36;dot(ctx,x+nx*o,y+ny*o,3.4,C[q.p])});
    // compresorul
    ctx.save();ctx.translate(cx,cy);ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=2.4;rrect(ctx,-R,-R*.8,2*R,1.6*R,10);ctx.fill();ctx.stroke();
    const sh=run>0?Math.sin(S.time*40)*1.5:0;ctx.fillStyle='#5a5e68';rrect(ctx,-R*.55,-R*.35+sh,R*1.1,R*.7,6);ctx.fill();ctx.restore();
    txt(ctx,'compresor',cx-R-10,cy,{align:'right',font:SERIF(15,600)});
    ctx.fillStyle='#fff';ctx.strokeStyle=COL.o;ctx.lineWidth=2;rrect(ctx,px-22,cy-28,44,56,8);ctx.fill();ctx.stroke();bolt(ctx,px,cy,1.5,COL.o);
    const lab=(s,v,x,y,c)=>{txt(ctx,s,x,y-9,{align:'left',font:SERIF(16,600),color:c});txt(ctx,f(v,0)+' J',x,y+10,{align:'left',font:MONOB,color:c})};
    lab('Q_p',e.Qp,cx+W.c/2+12,(cold.y+cy+R)/2,COL.b);lab('|Q_c|',e.Qc,cx+W.h/2+12,(hot.y+hot.h+cy-R)/2,COL.a);lab('L',e.L,(cx+R+px-28)/2-10,cy-W.w/2-22,COL.o);
    // cadranul eficacității (scară logaritmică, 1 … 100)
    if(!narrow){const gx=w-100,gy=h*.72,gr=62,lg=v=>clamp(Math.log10(Math.max(v,1))/2,0,1),an=v=>Math.PI+Math.PI*lg(v);ctx.save();ctx.lineCap='round';
      ctx.strokeStyle=COL.rule;ctx.lineWidth=10;ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI,TAU);ctx.stroke();
      ctx.strokeStyle=COL.c;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(gx,gy,gr,Math.PI,an(e.e));ctx.stroke();ctx.restore();
      [1,3,10,30,100].forEach(v=>{const a=an(v);txt(ctx,String(v),gx+Math.cos(a)*(gr+14),gy+Math.sin(a)*(gr+14),{font:MONO,color:COL.muted})});
      drawArrowPx(ctx,gx,gy,gx+Math.cos(an(e.e))*(gr-10),gy+Math.sin(an(e.e))*(gr-10),COL.c,{w:2.4});dot(ctx,gx,gy,4,COL.r);
      txt(ctx,`ε = ${f(e.e,2)}`,gx,gy+24,{font:SERIF(17,600),color:COL.c});if(n)txt(ctx,`${n} cicluri · ${f(tot/1000,2)} kJ ${fr?'scoși':'livrați'}`,gx,gy+44,{font:MONO,color:COL.muted})}
    S.out('Qp',f(e.Qp,0)+' J');S.out('Qc',f(e.Qc,0)+' J');S.out('e',f(e.e,2)+(S.t.ideal?' (Carnot)':' (real)'));
    const dT=Math.max(S.p.tc,S.p.tr+1)-S.p.tr;
    S.out('hint',S.p.tc<=S.p.tr?'Sursa caldă trebuie să fie mai caldă decât cea rece.':
      (S.t.ideal?`Limita Carnot: ε = ${fr?'T_r':'T_c'}/(T_c − T_r) = ${f(fr?S.p.tr+273.15:S.p.tc+273.15,0)}/${dT} = ${f(e.e,2)}. `:`O mașină reală are ε de 2–3 ori mai mic decât limita Carnot (${f(e.eC,2)}). `)+
      (fr?`Pentru fiecare joule consumat, frigiderul scoate ${f(e.e,2)} J din interior.`:`Pentru fiecare joule de energie electrică, casa primește ${f(e.e,2)} J de căldură.`)+(dT>40?' Diferență mare de temperatură → eficacitate mică.':''))};
})();
