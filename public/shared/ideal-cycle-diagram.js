/* Four-state air-standard diagrams. Intake/exhaust belong to the mechanism, not this plot. */
(() => {
 const R=8.31;
 function reference(kind){return window.PraxisIdealEngineCycles.create(kind,{compression:kind==='otto'?3:4,gamma:1.4,heatRatio:3,cutoff:2});}
 function draw(ctx,box,{kind='otto',cycle=null,states=null,gamma=1.4,phase=-1,fraction=0,area=false,mark=false,maxPressure=0}={}){
  if(!states){cycle=cycle||reference(kind);states=cycle.states.slice(1);gamma=cycle.gamma;}
  const P=states.map(s=>({V:s.V,p:s.p??R*s.T/s.V}));
  const types=['adiabatic',kind==='otto'?'isochoric':'isobaric','adiabatic','isochoric'];
  const {x,y,w,h}=box,vmax=P[0].V*1.15,pmax=Math.max(maxPressure,...P.map(s=>s.p))*1.18;
  const xy=s=>[x+w*s.V/vmax,y+h-h*(s.p??R*s.T/s.V)/pmax];
  function point(leg,u){const a=P[leg],b=P[(leg+1)%4],V=a.V+(b.V-a.V)*u;return {V,p:types[leg]==='adiabatic'?a.p*(a.V/V)**gamma:a.p+(b.p-a.p)*u};}
  const ink='#1a1d26',red='#c8402a',blue='#1f5a8a';
  function text(value,px,py,color=ink,align='center'){ctx.save();ctx.font='500 14px "Source Serif 4", Georgia, serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.strokeText(value,px,py);ctx.fillStyle=color;ctx.fillText(value,px,py);ctx.restore();}
  function arrow(a,b,color=ink){const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<1)return;const ux=dx/length,uy=dy/length,head=Math.min(7,length*.4);ctx.save();ctx.lineWidth=1.6;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.moveTo(b[0]-head*ux-head*.5*uy,b[1]-head*uy+head*.5*ux);ctx.lineTo(...b);ctx.lineTo(b[0]-head*ux+head*.5*uy,b[1]-head*uy-head*.5*ux);ctx.stroke();ctx.restore();}
  ctx.save();ctx.fillStyle='#fff';ctx.fillRect(x-34,y-28,w+75,h+76);
  arrow([x,y+h],[x+w+12,y+h]);arrow([x,y+h],[x,y-10]);text('p',x-14,y-12);text('V',x+w+12,y+h+20);
  const paths=types.map((_,i)=>Array.from({length:81},(_,j)=>point(i,j/80)));
  if(area){ctx.beginPath();paths.flat().forEach((p,i)=>i?ctx.lineTo(...xy(p)):ctx.moveTo(...xy(p)));ctx.closePath();ctx.fillStyle='rgba(176,122,18,.13)';ctx.fill();}
  paths.forEach((points,i)=>{ctx.beginPath();points.forEach((p,j)=>j?ctx.lineTo(...xy(p)):ctx.moveTo(...xy(p)));ctx.strokeStyle=ink;ctx.lineWidth=phase===i?3.2:2.2;ctx.stroke();arrow(xy(point(i,.43)),xy(point(i,.59)));});
  P.forEach((p,i)=>{const [px,py]=xy(p);ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fillStyle=ink;ctx.fill();const offsets=[[13,16],[-13,0],[kind==='otto'?-12:12,-15],[13,-12]][i];text(String(i+1),px+offsets[0],py+offsets[1]);});
  const [hotX,hotY]=xy(point(1,.5)),[coldX,coldY]=xy(point(3,.5));
  if(kind==='otto'){arrow([hotX-27,hotY],[hotX-4,hotY],red);text('Q₁',hotX-22,hotY-18,red);}
  else{arrow([hotX,hotY-30],[hotX,hotY-5],red);text('Q₁',hotX+16,hotY-21,red);}
  arrow([coldX+4,coldY],[coldX+29,coldY],blue);text('Q₂',coldX+21,coldY-18,blue);
  const marker=phase>=0?point(phase,Math.max(0,Math.min(1,fraction))):P[0];
  if(mark){const [mx,my]=xy(marker);ctx.beginPath();ctx.arc(mx,my,9,0,Math.PI*2);ctx.fillStyle='rgba(200,64,42,.18)';ctx.fill();ctx.beginPath();ctx.arc(mx,my,4.5,0,Math.PI*2);ctx.fillStyle=red;ctx.fill();}
  ctx.restore();return {xy,point,states:P,types,marker};
 }
 window.PraxisIdealCycleDiagram={reference,draw};
})();
