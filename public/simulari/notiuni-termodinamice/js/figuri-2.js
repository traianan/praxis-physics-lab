/* =====================================================================
   Figurile 7–12: procese, lucrul mecanic, transferul de căldură,
   echilibrul termic, scări de temperatură, capacitatea calorică
   (folosește utilitarele din baza.js și figuri-1.js)
   ===================================================================== */
const SERIF=(s=16,wt=500)=>`italic ${wt} ${s}px "Source Serif 4", Georgia, serif`;

/* ---------- Fig. 7 — procese termodinamice ---------- */
(()=>{const S=new Sim('#fig7',{fmt:{r:v=>v.toFixed(2)+'×',q:v=>v.toFixed(2)+'×'}});let s=0,dir=0,parts=[];
  for(let i=0;i<46;i++)parts.push({x:Math.random(),y:Math.random(),a:Math.random()*TAU});
  // starea (V, p, T) normalizată la starea inițială, pentru fracțiunea u ∈ [0,1] din proces
  function st(u,m=S.mode){const r=S.p.r,q=S.p.q;
    if(m==='izoterm'){const V=lerp(1,r,u);return {V,p:1/V,T:1}}
    if(m==='izobar'){const V=lerp(1,r,u);return {V,p:1,T:V}}
    if(m==='izocor'){const p=lerp(1,q,u);return {V:1,p,T:p}}
    if(m==='adiab'){const V=lerp(1,r,u);return {V,p:Math.pow(V,-1.4),T:Math.pow(V,-.4)}}
    const k=u*4,i=Math.min(3,k|0),e=k-i,C=[[1,1],[2,1],[2,.5],[1,.5],[1,1]];const V=lerp(C[i][0],C[i+1][0],e),p=lerp(C[i][1],C[i+1][1],e);return {V,p,T:p*V}}
  const K={izoterm:['T = const. ⇒ pV = const.','Comprimă sau destinde gazul la temperatură constantă (legea Boyle–Mariotte).'],
    izobar:['p = const. ⇒ V/T = const.','La presiune constantă, volumul crește proporțional cu temperatura.'],
    izocor:['V = const. ⇒ p/T = const.','Pistonul este blocat: încălzirea mărește doar presiunea.'],
    adiab:['Q = 0','Fără schimb de căldură: la destindere gazul se răcește singur.'],
    ciclu:['starea finală = starea inițială','Proces ciclic: sistemul revine în starea inițială.']};
  S.onMode=()=>{s=0;dir=0;S.label('go','Parcurge procesul','#i-play');SND.tick()};
  S.onParam=()=>{if(!dir)s=0};
  S.onToggle=()=>{s=0;dir=0};
  S.act=a=>{if(a==='go'){if(dir){dir=0;S.label('go','Continuă','#i-play');return}if(s>=1)s=0;dir=1;S.label('go','Pauză','#i-pause');SND.whoosh()}
    if(a==='back'){if(!S.t.qs){toast('Un proces necvasistatic nu poate fi parcurs în sens invers prin aceleași stări — stările intermediare nici nu sunt definite.');SND.bad();return}
      dir=-1;S.label('go','Pauză','#i-pause');SND.whoosh()}};
  S.step=dt=>{S.time+=dt;if(dir){s=clamp(s+dir*dt/(S.mode==='ciclu'?5:3),0,1);if(s===0||s===1){dir=0;S.label('go',s===1?'Din nou':'Parcurge procesul','#i-play');SND.ping()}}
    const T=st(s).T;parts.forEach(p=>{p.a+=randn()*dt*4;const v=dt*.35*Math.sqrt(T)*(S.t.qs?1:1.6);p.x+=Math.cos(p.a)*v;p.y+=Math.sin(p.a)*v;
      if(p.x<0||p.x>1){p.x=clamp(p.x,0,1);p.a=Math.PI-p.a}if(p.y<0||p.y>1){p.y=clamp(p.y,0,1);p.a=-p.a}})};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const m=S.mode,c=st(s),qs=S.t.qs,mid=!qs&&s>0&&s<1;
    // cilindru vertical
    const cw=Math.min(130,w*.22),cx=24,yb=h-40,ymax=h-60,Vmax=m==='ciclu'?2.2:Math.max(2.6,S.p.r*1.05),hy=V=>(ymax-70)*V/Vmax;
    const top=yb-hy(c.V);ctx.fillStyle=heat((c.T-.4)/1.3,.2);ctx.fillRect(cx,top,cw,yb-top);
    parts.forEach(p=>{let x=cx+5+p.x*(cw-10),y=top+5+p.y*(yb-top-10);if(mid){x+=Math.sin(S.time*7+p.y*9)*6;y+=Math.cos(S.time*5+p.x*11)*4*(1-p.y)}dot(ctx,x,y,2.8,heat((c.T-.4)/1.3))});
    ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,40);ctx.lineTo(cx,yb);ctx.lineTo(cx+cw,yb);ctx.lineTo(cx+cw,40);ctx.stroke();
    ctx.fillStyle='#5b5f6b';ctx.fillRect(cx+2,top-14,cw-4,14);ctx.fillStyle='#8a8e99';ctx.fillRect(cx+cw/2-4,22,8,top-36);
    if(m==='izocor'){ctx.fillStyle=COL.a;ctx.fillRect(cx-8,top-20,8,26);ctx.fillRect(cx+cw,top-20,8,26);txt(ctx,'blocat',cx+cw/2,top-28,{font:MONO,color:COL.a})}
    if(m==='izobar'){for(let i=0;i<3;i++){ctx.fillStyle='#3a3d46';ctx.fillRect(cx+cw/2-16+i*4,top-24-i*9,32-i*8,8)}txt(ctx,'greutate',cx+cw/2,top-56,{font:MONO,color:COL.muted})}
    if(m==='izoterm'){ctx.fillStyle='rgba(31,90,138,.12)';ctx.fillRect(cx-12,yb-hy(Vmax)-10,cw+24,hy(Vmax)+22);txt(ctx,'termostat',cx+cw/2,yb+18,{font:MONO,color:COL.b})}
    if(m==='adiab'){ctx.strokeStyle='#c9bfa8';ctx.lineWidth=8;ctx.strokeRect(cx-6,40,cw+12,yb-34);txt(ctx,'izolat termic',cx+cw/2,yb+18,{font:MONO,color:COL.muted})}
    if(m==='izocor'||m==='ciclu'){if(dir!==0||(s>0&&s<1)){const heating=m==='izocor'?(S.p.q>1)===(dir>=0):(s<.25||(s>.5&&s<.75))===(dir>=0);
      if(heating)flame(ctx,cx+cw/2,yb+36,.8,S.time);else txt(ctx,'❄ răcire',cx+cw/2,yb+18,{font:MONO,color:COL.b})}}
    // diagrama p–V
    const b={x:cx+cw+70,y:30,w:0,h:h-80};b.w=w-b.x-30;const pm=Math.max(2.1,m==='izocor'?S.p.q*1.1:1.1);
    const {X,Y}=axes(ctx,b,[0,Vmax],[0,pm],{xt:[[1,'V₁']],yt:[[1,'p₁']],gx:.5,gy:.5});
    if(m!=='ciclu'&&m!=='izocor'){[.5,1,2].forEach(T=>{ctx.beginPath();for(let k=0;k<=60;k++){const V=lerp(.25,Vmax,k/60),p=T/V;if(p>pm*1.1)continue;const x=X(V),y=Y(Math.min(p,pm));ctx.lineTo(x,y)}ctx.strokeStyle='rgba(111,106,95,.3)';ctx.setLineDash([2,4]);ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([])})}
    const N=80,path=[];for(let k=0;k<=N;k++)path.push(st(k/N));
    ctx.beginPath();path.forEach((q,i)=>i?ctx.lineTo(X(q.V),Y(q.p)):ctx.moveTo(X(q.V),Y(q.p)));
    if(qs){ctx.strokeStyle=COL.a;ctx.lineWidth=2.6;ctx.stroke();
      const done=path.slice(0,Math.round(s*N)+1);ctx.beginPath();done.forEach((q,i)=>i?ctx.lineTo(X(q.V),Y(q.p)):ctx.moveTo(X(q.V),Y(q.p)));ctx.strokeStyle=COL.r;ctx.lineWidth=4;ctx.stroke()}
    else{ctx.strokeStyle='rgba(200,64,42,.45)';ctx.setLineDash([6,6]);ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
      txt(ctx,'stările intermediare nu sunt stări de echilibru',b.x+b.w/2,b.y+10,{font:MONO,color:COL.a})}
    const A=path[0],B=path[N];dot(ctx,X(A.V),Y(A.p),6,COL.b,'#fff');txt(ctx,'1',X(A.V)-12,Y(A.p)-12,{color:COL.b});
    if(m!=='ciclu'){dot(ctx,X(B.V),Y(B.p),6,COL.c,'#fff');txt(ctx,'2',X(B.V)+12,Y(B.p)-12,{color:COL.c})}
    else{[[2,1,'2'],[2,.5,'3'],[1,.5,'4']].forEach(([V,p,l])=>{dot(ctx,X(V),Y(p),4,COL.r);txt(ctx,l,X(V)+12,Y(p)-12)});
      [.125,.375,.625,.875].forEach(u=>{const q1=st(u-.02),q2=st(u+.02);drawArrowPx(ctx,X(q1.V),Y(q1.p),X(q2.V),Y(q2.p),COL.a,{w:2})})}
    if(!mid){dot(ctx,X(c.V),Y(c.p),12,'rgba(200,64,42,.18)');dot(ctx,X(c.V),Y(c.p),6,COL.a,'#fff')}
    S.out('p',mid?'?':f(c.p,2)+'·p₁');S.out('V',mid?'?':f(c.V,2)+'·V₁');S.out('T',mid?'?':f(c.T,2)+'·T₁');S.out('k',K[m][0]);
    S.out('hint',qs?K[m][1]:'Proces necvasistatic (rapid): gazul nu are timp să ajungă la echilibru — numai stările 1 și 2 se pot reprezenta.')};
})();

/* ---------- Fig. 8 — lucrul mecanic = aria de sub curbă ---------- */
(()=>{const S=new Sim('#fig8',{fmt:{V1:v=>v+' L',V2:v=>v+' L',p:v=>v+' kPa',p2:v=>v+' kPa'}});let path='abc',u=0;
  const setPath=p=>{path=p;['abc','adc'].forEach(a=>S.btn(a).classList.toggle('on',a===p))};
  S.act=a=>{if(a==='abc'||a==='adc'){setPath(a);u=0;SND.tick()}};S.onMode=()=>{u=0;SND.tick()};
  // segmentele procesului: listă de stări (V [L], p [kPa]) pe care le parcurgem
  function segs(){const {V1,V2,p,p2}=S.p,m=S.mode;
    if(m==='izobar')return [[[V1,p],[V2,p]]];
    if(m==='izocor')return [[[V1,p],[V1,p2]]];
    if(m==='izoterm'){const a=[];for(let k=0;k<=40;k++){const V=lerp(V1,V2,k/40);a.push([V,p*V1/V])}return [a]}
    return path==='abc'?[[[V1,p],[V2,p]],[[V2,p],[V2,p2]]]:[[[V1,p],[V1,p2]],[[V1,p2],[V2,p2]]]}
  function calc(){const {V1,V2,p,p2}=S.p,m=S.mode;let L,U;
    if(m==='izobar'){L=p*(V2-V1);U=1.5*p*(V2-V1)}else if(m==='izoterm'){L=p*V1*Math.log(V2/V1);U=0}
    else if(m==='izocor'){L=0;U=1.5*V1*(p2-p)}else{L=(path==='abc'?p:p2)*(V2-V1);U=1.5*(p2*V2-p*V1)}return {L,U,Q:L+U}}
  S.step=dt=>{S.time+=dt;u=(u+dt/3)%1.4};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const m=S.mode,sg=segs(),{L,U,Q}=calc();
    const bw=Math.min(210,w*.3),b={x:56,y:30,w:w-bw-110,h:h-78};
    const {X,Y}=axes(ctx,b,[0,10],[0,320],{xl:'V (L)',yl:'p (kPa)',xt:[2,4,6,8].map(v=>[v,String(v)]),yt:[100,200,300].map(v=>[v,String(v)]),gx:1,gy:50});
    // aria de sub drum
    const pts=sg.flat();ctx.beginPath();ctx.moveTo(X(pts[0][0]),Y(0));pts.forEach(([V,p])=>ctx.lineTo(X(V),Y(p)));ctx.lineTo(X(pts[pts.length-1][0]),Y(0));ctx.closePath();
    ctx.fillStyle=L>=0?'rgba(200,64,42,.16)':'rgba(31,90,138,.18)';ctx.fill();
    if(Math.abs(L)>0.5){const mx=(pts[0][0]+pts[pts.length-1][0])/2;txt(ctx,`|L| = aria = ${f(Math.abs(L),0)} J`,X(mx),Y(Math.min(...pts.map(q=>q[1]))/2),{color:L>=0?COL.a:COL.b,font:SERIF(15,600)})}
    if(m==='drum'){const {V1,V2,p,p2}=S.p,alt=path==='abc'?[[V1,p],[V1,p2],[V2,p2]]:[[V1,p],[V2,p],[V2,p2]];ctx.beginPath();alt.forEach(([V,q],i)=>i?ctx.lineTo(X(V),Y(q)):ctx.moveTo(X(V),Y(q)));ctx.strokeStyle='rgba(111,106,95,.55)';ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);
      [['A',V1,p],[path==='abc'?'B':'D',...(path==='abc'?[V2,p]:[V1,p2])],[path==='abc'?'D':'B',...(path==='abc'?[V1,p2]:[V2,p])],['C',V2,p2]].forEach(([l,V,q])=>{dot(ctx,X(V),Y(q),3.5,COL.r);txt(ctx,l,X(V)+11,Y(q)-11)})}
    sg.forEach(a=>{ctx.beginPath();a.forEach(([V,p],i)=>i?ctx.lineTo(X(V),Y(p)):ctx.moveTo(X(V),Y(p)));ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.stroke();
      const n=a.length,q1=a[Math.max(0,Math.floor(n/2)-1)],q2=a[Math.min(n-1,Math.floor(n/2)+(n===2?0:1))];if(n===2){const mV=(a[0][0]+a[1][0])/2,mp=(a[0][1]+a[1][1])/2,dV=(a[1][0]-a[0][0])*.02,dp=(a[1][1]-a[0][1])*.02;drawArrowPx(ctx,X(mV-dV),Y(mp-dp),X(mV+dV),Y(mp+dp),COL.r,{w:2.4})}else drawArrowPx(ctx,X(q1[0]),Y(q1[1]),X(q2[0]),Y(q2[1]),COL.r,{w:2.4})});
    // punctul care parcurge drumul
    const all=[];sg.forEach(a=>a.forEach((q,i)=>{if(i||!all.length)all.push(q)}));let len=[0];for(let i=1;i<all.length;i++)len.push(len[i-1]+Math.hypot(X(all[i][0])-X(all[i-1][0]),Y(all[i][1])-Y(all[i-1][1])));
    const tot=len[len.length-1],d=Math.min(u,1)*tot;let i=1;while(i<len.length-1&&len[i]<d)i++;const e=tot?(d-len[i-1])/((len[i]-len[i-1])||1):0,P=[lerp(all[i-1][0],all[i][0],e),lerp(all[i-1][1],all[i][1],e)];
    dot(ctx,X(P[0]),Y(P[1]),6,COL.a,'#fff');
    // bare: L, ΔU, Q (semnul contează!)
    const bx=w-bw-20,by0=48,bh=h-110,zero=by0+bh/2,mx=Math.max(1000,Math.abs(L),Math.abs(U),Math.abs(Q)),sc=v=>v/mx*bh/2*.92;
    line(ctx,bx,zero,bx+bw,zero,COL.r,1.5);txt(ctx,'+',bx-8,by0+10,{font:MONO,color:COL.muted});txt(ctx,'−',bx-8,by0+bh-10,{font:MONO,color:COL.muted});
    [['L',L,COL.a],['ΔU',U,COL.plum],['Q',Q,COL.o]].forEach(([l,v,c],k)=>{const x=bx+10+k*bw/3,ww=bw/3-20,hh=sc(v);ctx.fillStyle=c;ctx.globalAlpha=.8;ctx.fillRect(x,hh>0?zero-hh:zero,ww,Math.abs(hh));ctx.globalAlpha=1;
      txt(ctx,l,x+ww/2,by0+bh+16,{color:c,font:SERIF(16,600)});txt(ctx,`${v>0.5?'+':''}${f(v,0)} J`,x+ww/2,hh>0?zero-hh-12:zero-hh+12,{font:MONO,color:c})});
    txt(ctx,'Q = ΔU + L',bx+bw/2,24,{font:SERIF(15,600)});
    S.out('L',`${f(L,0)} J`);S.out('U',`${f(U,0)} J`);S.out('Q',`${f(Q,0)} J`);
    S.out('hint',m==='izoterm'?'Izoterm: ΔU = 0, deci toată căldura primită devine lucru mecanic (Q = L).':m==='izocor'?'Izocor: volumul nu se schimbă ⇒ L = 0 (nu există arie sub curbă).':m==='drum'?`Același start A, același final C, ΔU egal — dar L diferă: L<sub>ABC</sub> = ${f(S.p.p*(S.p.V2-S.p.V1),0)} J, L<sub>ADC</sub> = ${f(S.p.p2*(S.p.V2-S.p.V1),0)} J. L și Q depind de drum, U nu.`:L<0?'Comprimare: L < 0 — gazul primește lucru mecanic din exterior.':'Destindere: L > 0 — gazul efectuează lucru mecanic asupra exteriorului. 1 kPa·L = 1 J.')};
})();

/* ---------- Fig. 9 — conducție, convecție, radiație ---------- */
(()=>{const S=new Sim('#fig9',{fmt:{P:v=>Math.round(v*100)+'%',sp:v=>v+'×'}});let on=false,tt=0;
  const RODS=[['Cupru',1.11e-4,'#b8733a'],['Aluminiu',9.7e-5,'#9aa3ad'],['Fier',2.3e-5,'#5d6168']],NC=40,DX=.0125;
  let T,pins,tr,Tw,plates,rays;
  function init(){T=RODS.map(()=>Array(NC).fill(20));pins=RODS.map(()=>Array(6).fill(0).map(()=>({fall:0,y:0,t:null})));tr=[];Tw=20;plates=[20,20,20];rays=[];tt=0;on=false;S.label('heat','Aprinde','#i-flame')}
  init();
  S.onMode=()=>{init();SND.tick()};
  S.act=a=>{if(a==='reset'){init();SND.tick()}if(a==='heat'){on=!on;S.label('heat',on?'Stinge':'Aprinde','#i-flame');on?SND.whoosh():SND.tick()}};
  S.step=dt=>{S.time+=dt;const P=S.p.P,sp=S.p.sp,m=S.mode;
    if(m==='cond'){let ph=dt*25*sp;tt+=ph;const n=Math.ceil(ph/.4),d=ph/n;
      for(let s=0;s<n;s++)RODS.forEach(([,al],r)=>{const a=T[r],b=a.slice(),k=al*d/(DX*DX);
        for(let i=0;i<NC;i++){const L=i?a[i-1]:a[0],R=i<NC-1?a[i+1]:a[i];b[i]=a[i]+k*(L-2*a[i]+R)-.002*d*(a[i]-20)}
        if(on)b[0]=20+380*P;T[r]=b});
      pins.forEach((row,r)=>row.forEach((p,i)=>{const c=Math.round((i+1)*(NC-1)/7);if(!p.fall&&T[r][c]>60){p.fall=1;p.t=tt;SND.knock()}if(p.fall)p.y=Math.min(p.y+dt*260,80)}))}
    if(m==='conv'){tt+=dt*sp;if(on){Tw=Math.min(95,Tw+dt*sp*P*.8);if(Math.random()<dt*14&&tr.length<500)tr.push({x:.12+Math.random()*.06,y:.96,a:1})}else Tw+=(20-Tw)*dt*.01*sp;
      const s=.12*P*sp*(on?1:.15)*Math.min(1,(Tw-18)/20);// funcția de curent ψ = sin(πx)·sin(πy): o singură celulă de convecție, urcă în stânga (deasupra flăcării)
      tr.forEach(p=>{const u=Math.PI*Math.sin(Math.PI*p.x)*Math.cos(Math.PI*p.y),v=-Math.PI*Math.cos(Math.PI*p.x)*Math.sin(Math.PI*p.y);
        p.x=clamp(p.x+u*s*dt+randn()*.004*Math.sqrt(sp),.02,.98);p.y=clamp(p.y+v*s*dt+randn()*.004*Math.sqrt(sp),.02,.98)})}
    if(m==='rad'){tt+=dt*sp;[.95,.4,.05].forEach((a,i)=>{plates[i]+=(on?a*P*9:0)*dt*sp-(plates[i]-20)*.06*dt*sp});
      if(on&&Math.random()<dt*30*P)rays.push({t:0,k:Math.random()*3|0,y:(Math.random()-.5)});rays.forEach(r=>r.t+=dt*1.6);rays=rays.filter(r=>r.t<1.25)}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const m=S.mode;
    if(m==='cond'){const x0=110,x1=w-40,rh=14,gap=(h-80)/3;
      RODS.forEach(([n,,c],r)=>{const y=40+r*gap+20,cw=(x1-x0)/NC;
        for(let i=0;i<NC;i++){ctx.fillStyle=heat((T[r][i]-20)/300);ctx.fillRect(x0+i*cw,y,cw+.5,rh)}
        ctx.strokeStyle=c;ctx.lineWidth=2;ctx.strokeRect(x0,y,x1-x0,rh);txt(ctx,n,x0-60,y+rh/2,{font:SERIF(15,600),color:COL.r});
        txt(ctx,`${f(T[r][Math.round(NC/2)],0)} °C la mijloc`,x1,y-10,{font:MONO,color:COL.muted,align:'right'});
        pins[r].forEach((p,i)=>{if(p.y>=80)return;const px=x0+(i+1)*(x1-x0)/7;ctx.save();ctx.globalAlpha=1-p.y/80;ctx.fillStyle='#e8dcb0';ctx.beginPath();ctx.arc(px,y+rh+4+p.y,4,0,TAU);ctx.fill();line(ctx,px,y+rh+8+p.y,px,y+rh+22+p.y,'#3a3d46',2);ctx.restore()})});
      // suportul comun (capetele vergelelor), încălzit de flacăra de dedesubt
      const yb=40+2*gap+rh+24;ctx.fillStyle=on?heat(.35+.6*S.p.P,.95):'#5b5f6b';ctx.fillRect(x0-6,40,8,yb-40);
      ctx.fillStyle='#3a3d46';ctx.fillRect(x0-22,yb+46,40,10);if(on)flame(ctx,x0-2,yb+44,.5+S.p.P*.5,S.time);
      const n=pins.map(r=>r.filter(p=>p.fall).length);RODS.forEach(([nm],r)=>{S.out('l'+(r+1),`${nm} — ținte căzute`);S.out('abc'[r],`${n[r]} / 6`)});
      S.out('hint',`Ceara topită eliberează ținte: căldura „curge” prin metal din aproape în aproape. Timp fizic: ${f(tt/60,1)} min. Cuprul conduce cel mai bine.`)}
    if(m==='conv'){const bx=w*.06,by=40,bw=Math.min(w*.48,420),bh=h-110;
      const g=ctx.createLinearGradient(bx,by,bx+bw,by+bh);g.addColorStop(0,heat((Tw-20)/150,.22));g.addColorStop(1,heat((Tw-30)/150,.14));ctx.fillStyle=g;ctx.fillRect(bx,by+10,bw,bh-10);
      tr.forEach(p=>{ctx.fillStyle='rgba(123,63,97,.55)';ctx.fillRect(bx+p.x*bw-2,by+p.y*bh-2,4,4)});
      if(tr.length<3||on){ctx.fillStyle='#4b1d3f';for(let i=0;i<5;i++)ctx.fillRect(bx+bw*.12+i*4,by+bh-6-(i%2)*3,4,4)}
      ctx.strokeStyle=COL.r;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx+bw,by);ctx.stroke();
      ctx.fillStyle='#3a3d46';ctx.fillRect(bx+bw*.05,by+bh+26,bw*.2,8);if(on)flame(ctx,bx+bw*.15,by+bh+24,.8*S.p.P+.3,S.time);
      if(on||tr.length){drawArrowPx(ctx,bx+bw*.15,by+bh*.75,bx+bw*.15,by+bh*.25,COL.a,{w:2,alpha:.6,dash:[6,5]});drawArrowPx(ctx,bx+bw*.85,by+bh*.25,bx+bw*.85,by+bh*.75,COL.b,{w:2,alpha:.6,dash:[6,5]});
        txt(ctx,'cald ↑',bx+bw*.15,by+bh*.18,{font:MONO,color:COL.a});txt(ctx,'rece ↓',bx+bw*.85,by+bh*.82,{font:MONO,color:COL.b})}
      const X=bx+bw+24,yN=wrapTxt(ctx,'Apa caldă e mai puțin densă și urcă; cea rece coboară.',X,by+40,w-X-12,22,{font:SERIF(15)});
      wrapTxt(ctx,'Cristalele de KMnO₄ colorează curenții de convecție.',X,yN+20,w-X-12,16,{font:MONO,color:COL.plum});
      S.out('l1','temperatura apei');S.out('a',f(Tw,1)+' °C');S.out('l2','particule colorate');S.out('b',String(tr.length));S.out('l3','timp');S.out('c',f(tt,0)+' s');
      S.out('hint','Convecția transportă căldura prin deplasarea fluidului însuși — apare doar în lichide și gaze.')}
    if(m==='rad'){const lx=80,ly=h/2,R=26;const gl=ctx.createRadialGradient(lx,ly,4,lx,ly,R*3);gl.addColorStop(0,on?'rgba(255,200,90,.9)':'rgba(180,180,180,.5)');gl.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(lx,ly,R*3,0,TAU);ctx.fill();
      dot(ctx,lx,ly,R,on?'#f2b84b':'#c9c3b5',COL.r);txt(ctx,'sursă',lx,ly+R+16,{font:MONO,color:COL.muted});
      const px=w-140,ys=[h*.2,h*.5,h*.8],L=['negru mat','gri','oglindă'],AB=['a ≈ 0,95','a ≈ 0,4','a ≈ 0,05'],FC=['#1a1d26','#8a8e99','#dfe7ee'];
      rays.forEach(r=>{const y=ys[r.k]+r.y*30,q=Math.min(r.t,1),x=lerp(lx+R,px,q),yy=lerp(ly,y,q);ctx.save();ctx.strokeStyle='rgba(200,64,42,.7)';ctx.lineWidth=1.6;ctx.beginPath();for(let k=0;k<=12;k++){const e=Math.max(0,q-.15)+k/12*.15,X=lerp(lx+R,px,e),Y=lerp(ly,y,e),nx=-(y-ly),ny=px-lx,nl=Math.hypot(nx,ny);const o=Math.sin(e*60)*4;k?ctx.lineTo(X+nx/nl*o,Y+ny/nl*o):ctx.moveTo(X+nx/nl*o,Y+ny/nl*o)}ctx.stroke();
        if(r.t>1&&r.k===2){const e=r.t-1;line(ctx,px,y,px-e*300,y-e*100,'rgba(200,64,42,.5)',1.4)}ctx.restore()});
      ys.forEach((y,i)=>{ctx.fillStyle=FC[i];ctx.strokeStyle=COL.r;ctx.lineWidth=1.5;ctx.fillRect(px,y-30,14,60);ctx.strokeRect(px,y-30,14,60);
        const tq=clamp((plates[i]-20)/120,0,1);ctx.fillStyle=heat(tq,.9);ctx.fillRect(px+30,y-30+60*(1-tq),8,60*tq);ctx.strokeRect(px+30,y-30,8,60);
        txt(ctx,L[i],px+46,y-16,{font:MONO,align:'left'});txt(ctx,AB[i],px+46,y,{font:MONO,align:'left',color:COL.muted});txt(ctx,f(plates[i],1)+' °C',px+46,y+16,{font:MONO,align:'left',color:COL.a})});
      txt(ctx,'vid — radiația nu are nevoie de mediu',(lx+px)/2,24,{font:MONO,color:COL.muted});
      ['negru','gri','oglindă'].forEach((n,i)=>{S.out('l'+(i+1),'placă '+n);S.out('abc'[i],f(plates[i],1)+' °C')});
      S.out('hint','Radiația se propagă și prin vid (așa ne încălzește Soarele). Suprafețele negre absorb mult, cele lucioase reflectă.')}};
})();

/* ---------- Fig. 10 — contactul termic și principiul zero ---------- */
(()=>{const S=new Sim('#fig10',{fmt:{T1:v=>v+' °C',T2:v=>v+' °C',m1:v=>v.toFixed(1)+' kg',m2:v=>v.toFixed(1)+' kg'}});
  let st='idle',t1,t2,tm=0,slide=0,hist=[],eqd=false,th={x:0,y:0,r:20,ph:0,t:0,A:null,B:null};const K=.15;
  function init(){st='idle';t1=S.p.T1;t2=S.p.T2;tm=0;slide=0;hist=[];eqd=false;th={ph:0,t:0,r:20,A:null,B:null};S.label('go',S.mode==='zero'?'Măsoară cu termometrul C':'Pune în contact')}
  init();
  const lab=()=>{const z=S.mode==='zero';S.out('s1',z?'t<sub>A</sub>':'t<sub>1</sub>');S.out('s2',z?'t<sub>B</sub>':'t<sub>2</sub>')};lab();
  S.onMode=()=>{init();lab();SND.tick()};S.onParam=()=>{if(st==='idle'||S.mode==='zero')init()};
  S.act=a=>{if(a==='reset'){init();SND.tick()}if(a==='go'){init();st='run';SND.knock()}};
  S.onToggle=()=>{SND.tick()};
  S.step=dt=>{S.time+=dt;if(st!=='run')return;
    if(S.mode==='contact'){slide=Math.min(1,slide+dt*2);if(slide<1)return;const d=dt,k=S.t.adiab?0:K,dT=t2-t1;
      t1+=k*dT/S.p.m1*d;t2-=k*dT/S.p.m2*d;tm+=d;if(hist.length<2000)hist.push([tm,t1,t2]);
      if(!eqd&&!S.t.adiab&&Math.abs(t2-t1)<.15){eqd=true;SND.ping()}}
    else{th.t+=dt;const tgt=th.ph<2?S.p.T1:S.p.T2;if(th.ph===1||th.ph===3)th.r+=(tgt-th.r)*Math.min(1,dt*1.6);
      if(th.t>(th.ph%2?2.6:1.2)){th.t=0;if(th.ph===1)th.A=th.r;if(th.ph===3){th.B=th.r;st='done';Math.abs(th.A-th.B)<1?SND.ok():SND.bad()}th.ph++;if(th.ph===1||th.ph===3)SND.tick()}}};
  function block(ctx,x,y,s,T,l,mk){ctx.fillStyle=heat(T/100,.85);ctx.strokeStyle=COL.r;ctx.lineWidth=2;rrect(ctx,x,y,s,s,6);ctx.fill();ctx.stroke();
    txt(ctx,l,x+s/2,y+s/2-10,{font:SERIF(20,600)});txt(ctx,f(T,1)+' °C',x+s/2,y+s/2+14,{font:MONO});if(mk)txt(ctx,mk,x+s/2,y+s+14,{font:MONO,color:COL.muted})}
  function therm(ctx,x,y,T,l){const H=130;ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=1.5;rrect(ctx,x-7,y-H,14,H,7);ctx.fill();ctx.stroke();dot(ctx,x,y+6,11,COL.a,COL.r);
    const q=clamp(T/100,0,1);ctx.fillStyle=COL.a;ctx.fillRect(x-3,y-8-(H-20)*q,6,(H-20)*q+10);txt(ctx,l,x,y-H-14,{font:SERIF(16,600),color:COL.plum});txt(ctx,f(T,1)+'°',x+14,y-(H-20)*q-8,{font:MONO,align:'left',color:COL.a})}
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const nar=w<480,s=nar?Math.min(76,w*.22):Math.min(110,w*.18),y=50;
    if(S.mode==='contact'){const gap=lerp(nar?40:90,0,slide),cx=nar?w*.5:w*.3,x1=cx-s-gap/2,x2=cx+gap/2;
      block(ctx,x1,y,s,t1,'1',`${nar?'':'m₁ = '}${f(S.p.m1,1)} kg`);block(ctx,x2,y,s,t2,'2',`${nar?'':'m₂ = '}${f(S.p.m2,1)} kg`);
      if(slide>=1){if(S.t.adiab){ctx.fillStyle='#c9bfa8';ctx.fillRect(cx-4,y-6,8,s+12)}else if(Math.abs(t2-t1)>.3){const hot=t2>t1;drawArrowPx(ctx,cx+(hot?24:-24),y-16,cx+(hot?-24:24),y-16,COL.a,{w:2.4});txt(ctx,'Q',cx,y-32,{color:COL.a,font:SERIF(16,600)})}}
      const b=nar?{x:52,y:y+s+44,w:w-110,h:h-y-s-90}:{x:w*.58,y:40,w:w*.42-40,h:h-100},tmax=Math.max(10,tm*1.1),Teq=(S.p.m1*S.p.T1+S.p.m2*S.p.T2)/(S.p.m1+S.p.m2);
      const {X,Y}=axes(ctx,b,[0,tmax],[0,100],{xl:'τ (min)',yl:'t (°C)',yt:[[0,'0'],[50,'50'],[100,'100']],gy:25});
      line(ctx,b.x,Y(Teq),b.x+b.w,Y(Teq),COL.c,1.2,[5,4]);txt(ctx,`echilibru: ${f(Teq,1)} °C`,b.x+b.w-4,Y(Teq)-10,{font:MONO,color:COL.c,align:'right'});
      [1,2].forEach(k=>{ctx.beginPath();hist.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[k])):ctx.moveTo(X(q[0]),Y(q[k])));ctx.strokeStyle=k===1?COL.b:COL.a;ctx.lineWidth=2.4;ctx.stroke()});
      // bilanț
      const yb=y+s+50;if(!nar){txt(ctx,'Căldura cedată de corpul cald =',20,yb,{align:'left',font:SERIF(15)});txt(ctx,'căldura primită de corpul rece',20,yb+20,{align:'left',font:SERIF(15)});
      const ye=wrapTxt(ctx,`t = (m₁t₁ + m₂t₂)/(m₁ + m₂) = ${f(Teq,1)} °C`,20,yb+50,b.x-50,16,{font:MONO,color:COL.c});txt(ctx,'(aceeași substanță)',20,ye,{align:'left',font:MONO,color:COL.muted})}
      S.out('l1','t₁');S.out('a',f(t1,1)+' °C');S.out('l2','t₂');S.out('b',f(t2,1)+' °C');S.out('l3','timp');S.out('c',f(tm,1)+' min');
      S.out('hint',st==='idle'?'Alege temperaturile și masele, apoi pune corpurile în contact.':S.t.adiab?'Perete adiabatic între corpuri: nu există contact termic — temperaturile rămân diferite.':eqd?'Echilibru termic: temperaturile au devenit egale și nu se mai schimbă.':'Căldura trece de la corpul mai cald la cel mai rece până se egalează temperaturile.')}
    else{const ax=w*.18,bx=w*.58,yb=h-110,s2=Math.min(140,w*.22);
      block(ctx,ax,yb-s2,s2,S.p.T1,'A');block(ctx,bx,yb-s2,s2,S.p.T2,'B');
      const p=th.ph,e=clamp(th.t/1.2,0,1),xa=ax+s2/2,xb=bx+s2/2,yUp=yb-s2-20,yIn=yb-s2*.4;
      let x,yy;if(p===0){x=lerp(w*.5,xa,e);yy=lerp(yUp,yIn,e)}else if(p===1){x=xa;yy=yIn}else if(p===2){x=lerp(xa,xb,e);yy=yIn-Math.sin(e*Math.PI)*s2*.8}else{x=xb;yy=yIn}
      if(st==='idle'){x=w*.5;yy=yUp}therm(ctx,x,yy,th.r,'C');
      if(th.A!=null&&th.B!=null){const eq=Math.abs(th.A-th.B)<1;txt(ctx,eq?'A ~ C și B ~ C  ⇒  A ~ B':'A și B indică temperaturi diferite',w/2,30,{font:SERIF(20,600),color:eq?COL.c:COL.a})}
      S.out('l1','C în contact cu A');S.out('a',th.A!=null?f(th.A,1)+' °C':'—');S.out('l2','C în contact cu B');S.out('b',th.B!=null?f(th.B,1)+' °C':'—');
      const eq=th.A!=null&&th.B!=null&&Math.abs(th.A-th.B)<1;S.out('l3','concluzie');S.out('c',th.B==null?'…':eq?'A și B în echilibru':'nu sunt în echilibru');
      S.out('hint',th.B==null?'Termometrul C ajunge în echilibru termic cu A, apoi cu B. Principiul zero: dacă A ~ C și B ~ C, atunci A ~ B.':eq?'Fără să atingem A de B, știm că puse în contact nu ar schimba căldură. Așa funcționează orice termometru.':`Puse în contact, căldura ar trece de la ${th.A>th.B?'A la B':'B la A'}.`)}};
})();

/* ---------- Fig. 11 — scări de temperatură, termometrul cu gaz ---------- */
(()=>{const S=new Sim('#fig11',{fmt:{t:v=>v+' °C'}});const inp=$('#fig11 input[data-k=t]');
  const set=v=>{inp.value=v;inp.dispatchEvent(new Event('input'))};
  S.act=a=>{const v={ice:0,boil:100,body:37,pb:327}[a];if(v!=null){set(v);SND.tick()}};S.onMode=()=>SND.tick();
  const TMIN=-60,TMAX=340;
  function tube(ctx,x,y0,y1,t,c,lab,ticks){const Y=v=>lerp(y1,y0,(v-TMIN)/(TMAX-TMIN));ctx.fillStyle='#fff';ctx.strokeStyle=COL.r;ctx.lineWidth=1.5;rrect(ctx,x-8,y0-6,16,y1-y0+14,8);ctx.fill();ctx.stroke();
    dot(ctx,x,y1+16,14,c,COL.r);ctx.fillStyle=c;ctx.fillRect(x-4,Y(t),8,y1+8-Y(t));
    ticks.forEach(([v,s,hl])=>{const yy=Y(v);line(ctx,x+10,yy,x+(hl?26:18),yy,hl?COL.r:COL.muted,hl?1.6:1);if(s)txt(ctx,s,x+30,yy,{font:MONO,align:'left',color:hl?COL.r:COL.muted})});
    txt(ctx,lab,x,y0-22,{font:SERIF(18,600),color:c});return Y}
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const t=S.p.t,T=t+273.15,F=1.8*t+32,y0=50,y1=h-60,m=S.mode;
    if(m==='scari'){const nar=w<480,xs=nar?[w*.1,w*.4,w*.7]:[w*.12,w*.34,w*.56];
      const Y=tube(ctx,xs[0],y0,y1,t,COL.a,'Celsius',[[-40,'−40'],[0,'0',1],[37,'37'],[100,'100',1],[200,'200'],[300,'300']]);
      tube(ctx,xs[1],y0,y1,t,COL.b,'Kelvin',[[-40,'233'],[0,nar?'273':'273,15',1],[100,nar?'373':'373,15',1],[200,'473'],[300,'573']]);
      tube(ctx,xs[2],y0,y1,t,COL.c,'Fahrenheit',[[-40,'−40'],[0,'32',1],[37,'98,6'],[100,'212',1],[200,'392'],[300,'572']]);
      line(ctx,xs[0]-30,Y(t),Math.min(w-4,xs[2]+70),Y(t),COL.a,1,[4,4]);
      if(!nar)[[0,'gheața se topește'],[100,'apa fierbe']].forEach(([v,s])=>txt(ctx,s,w-10,Y(v),{font:MONO,align:'right',color:COL.muted}));
      if(!nar)txt(ctx,'la −40 °C: C = F',w-10,Y(-40),{font:MONO,align:'right',color:COL.c});
      S.out('l1','t (Celsius)');S.out('a',f(t,0)+' °C');S.out('l2','T = t + 273,15');S.out('b',f(T,2)+' K');S.out('l3','t<sub>F</sub> = 1,8·t + 32');S.out('c',f(F,1)+' °F');
      S.out('hint','Un grad Celsius = un kelvin: ΔT = Δt. Doar originea diferă (0 K = −273,15 °C).')}
    else if(m==='gaz'){const r=T/273.16,bx=w*.13,by=h*.55;
      ctx.fillStyle=heat((t+60)/400,.22);rrect(ctx,bx-60,by-60,120,140,10);ctx.fill();txt(ctx,`baie la ${f(t,0)} °C`,bx,by+96,{font:MONO,color:COL.muted});
      dot(ctx,bx,by,34,'rgba(31,90,138,.15)',COL.r);txt(ctx,'gaz',bx,by,{font:MONO,color:COL.b});
      const ux=bx+90,ub=by+60,top=50,hp=Math.min(140,(h-170)/2.6);line(ctx,bx+34,by,ux,by,COL.r,4);
      const d=clamp((r-1)*hp,-ub+top+40,ub-top);ctx.fillStyle='rgba(160,160,170,.9)';ctx.fillRect(ux-5,by+d/2,10,ub-by-d/2);ctx.fillRect(ux+25,by-d/2,10,ub-by+d/2);ctx.fillRect(ux-5,ub,40,10);
      ctx.strokeStyle=COL.r;ctx.lineWidth=1.5;ctx.strokeRect(ux-6,top,12,ub-top+10);ctx.strokeRect(ux+24,top,12,ub-top+10);
      line(ctx,ux-10,by,ux+44,by,COL.c,1,[3,3]);txt(ctx,'reper (V = const.)',ux-10,by-10,{font:MONO,align:'right',color:COL.c});
      const b={x:w*.46,y:36,w:w*.5,h:h-100};const {X,Y}=axes(ctx,b,[-300,350],[0,2.4],{xl:'t (°C)',yl:'p/pₜᵣ',xt:[[-273.15,'−273,15'],[0,'0'],[100,'100'],[300,'300']],yt:[[1,'1'],[2,'2']],gy:.5});
      ctx.beginPath();ctx.moveTo(X(-273.15),Y(0));ctx.lineTo(X(350),Y((350+273.15)/273.16));ctx.strokeStyle='rgba(111,106,95,.5)';ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(X(-60),Y((213.15)/273.16));ctx.lineTo(X(340),Y(613.15/273.16));ctx.strokeStyle=COL.b;ctx.lineWidth=2.6;ctx.stroke();
      dot(ctx,X(-273.15),Y(0),5,COL.a,'#fff');txt(ctx,'0 K — zero absolut',X(-273.15)+8,Y(0)-14,{font:MONO,align:'left',color:COL.a});
      dot(ctx,X(.01),Y(1),4,COL.c);dot(ctx,X(t),Y(r),6,COL.a,'#fff');
      S.out('l1','p / p<sub>tr</sub>');S.out('a',f(r,3));S.out('l2','T = 273,16 K · p/p<sub>tr</sub>');S.out('b',f(T,1)+' K');S.out('l3','t');S.out('c',f(t,0)+' °C');
      S.out('hint','La volum constant presiunea gazului e proporțională cu T. Prelungind dreapta, p = 0 la −273,15 °C: zero absolut.')}
    else{const rd=-6+1.15*t,xs=[w*.22,w*.5];
      const Y=tube(ctx,xs[0],y0,y1,t,COL.c,'corect',[[0,'0',1],[40,'40'],[100,'100',1],[200,'200'],[300,'300']]);
      tube(ctx,xs[1],y0,y1,clamp(rd,TMIN,TMAX),COL.a,'greșit',[[-6,'0',1],[109,'100',1],[40,'40']].map(([v,s,hl])=>[v,s,hl]));
      line(ctx,xs[0]+10,Y(0),xs[1]-10,Y(-6),COL.muted,1,[3,3]);line(ctx,xs[0]+10,Y(100),xs[1]-10,Y(109),COL.muted,1,[3,3]);
      const X0=w*.66;txt(ctx,'în gheață: −6°',X0,h*.3,{align:'left',font:SERIF(16)});txt(ctx,'în apă care fierbe: 109°',X0,h*.3+24,{align:'left',font:SERIF(16)});
      txt(ctx,'t_ind = −6 + 1,15·t',X0,h*.3+60,{align:'left',font:SERIF(17,600),color:COL.a});
      txt(ctx,'coincid la t = 40 °C',X0,h*.3+90,{align:'left',font:MONO,color:COL.c});
      S.out('l1','t real');S.out('a',f(t,0)+' °C');S.out('l2','indicat');S.out('b',f(rd,1)+'°');S.out('l3','eroare');S.out('c',f(rd-t,1)+'°');
      S.out('hint',Math.abs(rd-t)<.6?'Exact! La 40 °C termometrul greșit indică valoarea corectă.':'Mută sliderul și caută temperatura la care cele două termometre indică la fel.')}};
})();

/* ---------- Fig. 12 — capacitatea calorică ---------- */
(()=>{const S=new Sim('#fig12',{fmt:{m1:v=>v.toFixed(1)+' kg',m2:v=>v.toFixed(1)+' kg',P:v=>v+' W'}});
  const C={apa:[4180,'apă','rgba(31,90,138,.35)'],al:[900,'aluminiu','#b6bcc4'],fe:[450,'fier','#6d7178'],cu:[385,'cupru','#c07a43']};
  let on=false,tau=0,T=[20,20],hist=[];
  function init(){on=false;tau=0;T=[20,20];hist=[[0,20,20]];S.label('heat','Pornește încălzitoarele')}init();
  const Cs=()=>[C[S.mode][0]*S.p.m1,C[S.mode][0]*S.p.m2];
  S.onMode=S.onParam=()=>{init()};
  S.act=a=>{if(a==='reset'){init();SND.tick()}if(a==='heat'){on=!on;S.label('heat',on?'Oprește':'Pornește încălzitoarele');on?SND.whoosh():SND.tick()}};
  S.step=dt=>{S.time+=dt;if(!on)return;const c=Cs(),d=dt*80*Math.max(...c)/S.p.P/8;tau+=d; // tot graficul se parcurge în ~8 s
    T=T.map((v,i)=>Math.min(100,v+S.p.P*d/c[i]));hist.push([tau,...T]);if(T[0]>=100&&T[1]>=100){on=false;S.label('heat','Pornește încălzitoarele');SND.ping()}};
  S.draw=(ctx,w,h)=>{grid(ctx,w,h);const [c,nm,col]=C[S.mode],cc=Cs(),Q=S.p.P*tau,sz=m=>28+Math.cbrt(m)*26;
    [0,1].forEach(i=>{const m=i?S.p.m2:S.p.m1,s=sz(m),x=40+i*(w*.22),y=h-60-s;
      ctx.fillStyle=S.mode==='apa'?col:col;ctx.strokeStyle=COL.r;ctx.lineWidth=2;rrect(ctx,x,y,s*1.1,s,S.mode==='apa'?2:6);ctx.fill();ctx.stroke();
      ctx.fillStyle=heat((T[i]-20)/80,.5);ctx.fillRect(x+3,y+3,s*1.1-6,s-6);
      ctx.fillStyle='#3a3d46';ctx.fillRect(x+s*.55-14,h-56,28,8);if(on&&T[i]<100)flame(ctx,x+s*.55,h-58,.5,S.time+i);
      txt(ctx,`${i+1}: ${f(m,1)} kg`,x+s*.55,y-26,{font:MONO});txt(ctx,f(T[i],1)+' °C',x+s*.55,y-10,{font:MONO,color:COL.a})});
    const b={x:w*.52,y:36,w:w*.44,h:h-100},tm=80*Math.max(...cc)/S.p.P;
    const {X,Y}=axes(ctx,b,[0,tm*1.05],[0,110],{xl:'',yl:'t (°C)',xt:[[tm,f(tm,0)+' s']],yt:[[20,'20'],[100,'100']],gy:20});txt(ctx,'timpul τ',b.x+b.w/2,b.y+b.h+30,{font:SERIF(14),color:COL.muted});
    [1,2].forEach(k=>{ctx.beginPath();hist.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[k])):ctx.moveTo(X(q[0]),Y(q[k])));ctx.strokeStyle=k===1?COL.a:COL.b;ctx.lineWidth=2.6;ctx.stroke();
      const q=hist[hist.length-1];txt(ctx,String(k),X(q[0])+8,Y(q[k]),{align:'left',color:k===1?COL.a:COL.b,font:SERIF(15,600)})});
    txt(ctx,`${nm}: c = ${c} J/(kg·K)`,b.x+6,b.y+6,{align:'left',font:MONO,color:COL.muted});
    const d1=T[0]-20,d2=T[1]-20;
    S.out('Q',sci(Q,2)+' J');S.out('C1',f(cc[0],0)+' J/K');S.out('C2',f(cc[1],0)+' J/K');S.out('r',d2>.05&&T[0]<100?f(d1/d2,2):f(cc[1]/cc[0],2));
    S.out('hint',tau?`Aceeași căldură Q, dar corpul cu capacitate calorică mai mare se încălzește mai puțin: ΔT = Q / C.`:`Ambele corpuri sunt din ${nm} și primesc aceeași putere. Pornește încălzitoarele și compară pantele.`)};
})();
