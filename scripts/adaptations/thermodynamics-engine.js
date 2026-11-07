/* Ideal Otto and Diesel cycles, using the same states for piston, plot and readouts. */
(()=>{
 const S=new Sim('#fig0',{fmt:{sp:v=>v.toFixed(1)+'×'}});let r=3;
 function makeCycle(){r=S.mode==='diesel'?6:3;return window.PraxisIdealEngineCycles.create(S.mode||'otto',{compression:r,heatRatio:3,cutoff:2.2});}
 let cycle=makeCycle(),ph=0,s=0,run=true;
 const durations=()=>[1,1,cycle.kind==='otto'?.35:.65,1,.35,1];
 const names=()=>['Admisie','Compresie adiabatică',cycle.kind==='otto'?'Încălzire izocoră':'Încălzire izobară','Destindere adiabatică','Răcire izocoră','Evacuare'].map(text=>window.PraxisI18n?.tr(text)??text);
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
