/* Reference-style schematic by default; the proportional p–V view remains available for numerical study. */
(() => {
 const R=8.31;
 function drawProportional(ctx,box,states,gamma,{phase=-1}={}){
  const {y,h}=box,w=Math.min(box.w,h*1.05),x=box.x+(box.w-w)/2,hot=states[0].T,cold=states[2].T;
  const vmax=states[2].V*1.24,pmax=R*hot/states[0].V*1.32;
  const X=V=>x+w*V/vmax,Y=p=>y+h-h*p/pmax,xy=s=>[X(s.V),Y(R*s.T/s.V)];
  const ink=window.PraxisScientificColors?.color('#1a1d26',document.documentElement.dataset.courseColors||'praxis')||'#1a1d26';
  const text=(s,px,py,size=14,align='center',color=ink)=>{ctx.save();ctx.font=`500 ${size}px "Source Serif 4", Georgia, serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.lineWidth=4;ctx.strokeStyle='#fbf8f1';ctx.strokeText(s,px,py);ctx.fillStyle=color;ctx.fillText(s,px,py);ctx.restore();};
  function arrow(a,b,color=ink,size=6){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.moveTo(b[0]-size*ux-size*.5*uy,b[1]-size*uy+size*.5*ux);ctx.lineTo(b[0],b[1]);ctx.lineTo(b[0]-size*ux+size*.5*uy,b[1]-size*uy-size*.5*ux);ctx.stroke();ctx.restore();}
  ctx.save();ctx.fillStyle='#fff';ctx.fillRect(box.x-28,y-22,box.w+75,h+60);
  arrow([x,y+h],[x+w+12,y+h],ink,9);arrow([x,y+h],[x,y-8],ink,9);
  text('V',x+w+12,y+h+22,18);text('p',x-16,y-8,18);
  for(let leg=0;leg<4;leg++){
   const a=states[leg],b=states[(leg+1)%4];
   const at=u=>{const V=a.V*(b.V/a.V)**u;return {V,T:leg%2===0?a.T:a.T*(a.V/V)**(gamma-1)};};
   ctx.beginPath();for(let i=0;i<=80;i++){const p=xy(at(i/80));i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.strokeStyle=ink;ctx.lineWidth=leg===phase?3:2;ctx.stroke();
   arrow(xy(at(.45)),xy(at(.56)),ink,6);
  }
  const offsets=[[-4,-16],[8,-13],[0,17],[-9,16]];
  states.forEach((s,i)=>{const [px,py]=xy(s);ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fillStyle=ink;ctx.fill();const dy=py+offsets[i][1]>y+h-18?-14:offsets[i][1];text(String(i+1),px+offsets[i][0],py+dy,15);});
  text('T₁ > T₂',x+w*.76,y+h*.27,15);
  function heat(T,a,b,label,color,sign){
   const V=Math.sqrt(a.V*b.V),p=xy({V,T}),slope=h*R*T*vmax/(pmax*V*V*w),normalLength=Math.hypot(slope,1),nx=-slope/normalLength,ny=1/normalLength;
   const length=Math.max(5,Math.min(22,h*.09,(y+h-p[1]-10)/ny,(p[0]-x-10)/Math.max(.01,-nx)));
   arrow([p[0]-nx*length,p[1]-ny*length],[p[0]+nx*length,p[1]+ny*length],color,6);
   const direction=sign===1?-1:1;
   text(label,Math.max(x+14,Math.min(x+w-14,p[0]+direction*nx*length*1.7+12)),Math.max(y+14,Math.min(y+h-14,p[1]+direction*ny*length*1.7)),14,'center',color);
  }
  heat(hot,states[0],states[1],'Q₁','#c8402a',1);
  heat(cold,states[3],states[2],'Q₂','#1f5a8a',-1);
  ctx.restore();return {xy};
 }

 // Control points follow the supplied teaching sketch. These coordinates are not a numeric p–V scale.
 const curves=[
  [[.30,.26],[.38,.37],[.48,.46],[.58,.51]],
  [[.58,.51],[.62,.65],[.70,.79],[.78,.84]],
  [[.78,.84],[.65,.82],[.53,.76],[.43,.70]],
  [[.43,.70],[.36,.60],[.32,.43],[.30,.26]]
 ];
 function drawSchematic(ctx,box,states,gamma,{phase=-1}={}){
  const w=Math.min(box.w,box.h*1.38),h=w/1.38,x=box.x+(box.w-w)/2,y=box.y+(box.h-h)/2,ink='#1a1d26';
  function point(leg,u){const [a,b,c,d]=curves[leg],v=1-u;return [x+w*(v*v*v*a[0]+3*v*v*u*b[0]+3*v*u*u*c[0]+u*u*u*d[0]),y+h*(v*v*v*a[1]+3*v*v*u*b[1]+3*v*u*u*c[1]+u*u*u*d[1])];}
  function xy(state){
   const T=state.T??state.p*state.V/R,hot=states[0].T,cold=states[2].T,near=(a,b)=>Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(b));let leg;
   if(near(T,hot))leg=0;else if(near(T,cold))leg=2;
   else{const K=T*state.V**(gamma-1),K12=states[1].T*states[1].V**(gamma-1),K41=states[3].T*states[3].V**(gamma-1);leg=Math.abs(K/K12-1)<Math.abs(K/K41-1)?1:3;}
   const a=states[leg],b=states[(leg+1)%4],u=Math.log(state.V/a.V)/Math.log(b.V/a.V);
   return point(leg,Math.max(0,Math.min(1,u)));
  }
  function text(value,px,py,color=ink,size=15){ctx.save();ctx.font=`500 ${size}px "Source Serif 4", Georgia, serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.strokeText(value,px,py);ctx.fillStyle=color;ctx.fillText(value,px,py);ctx.restore();}
  function arrow(a,b,color=ink,head=6){const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;ctx.save();ctx.lineWidth=1.6;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.moveTo(b[0]-head*ux-head*.5*uy,b[1]-head*uy+head*.5*ux);ctx.lineTo(...b);ctx.lineTo(b[0]-head*ux+head*.5*uy,b[1]-head*uy-head*.5*ux);ctx.stroke();ctx.restore();}
  ctx.save();ctx.fillStyle='#fff';ctx.fillRect(box.x-30,box.y-24,box.w+80,box.h+76);
  arrow([x,y+h],[x+w+12,y+h],ink,8);arrow([x,y+h],[x,y-8],ink,8);text('p',x-16,y-8,ink,18);text('V',x+w+12,y+h+22,ink,18);
  for(let leg=0;leg<4;leg++){ctx.beginPath();for(let i=0;i<=80;i++){const p=point(leg,i/80);i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.strokeStyle=ink;ctx.lineWidth=leg===phase?3:2.2;ctx.stroke();arrow(point(leg,.45),point(leg,.56));}
  const offsets=[[-4,-16],[8,-14],[0,18],[-10,16]];
  for(let i=0;i<4;i++){const [px,py]=point(i,0);ctx.beginPath();ctx.arc(px,py,3.3,0,Math.PI*2);ctx.fillStyle=ink;ctx.fill();text(String(i+1),px+offsets[i][0],py+offsets[i][1]);}
  function heat(leg,label,color){const mid=point(leg,.52),a=point(leg,.49),b=point(leg,.55);let dx=b[0]-a[0],dy=b[1]-a[1];if(leg===2){dx=-dx;dy=-dy;}const length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length,d=Math.min(19,h*.075);arrow([mid[0]-nx*d,mid[1]-ny*d],[mid[0]+nx*d,mid[1]+ny*d],color);const side=leg===0?-1:1;text(label,mid[0]+side*nx*d*1.8+12,mid[1]+side*ny*d*1.8,color,14);}
  heat(0,'Q₁','#c8402a');heat(2,'Q₂','#1f5a8a');text('T₁ > T₂',x+w*.85,y+h*.45);
  ctx.restore();return {xy,point,schematic:true};
 }
 function draw(ctx,box,states,gamma,options={}){return options.proportional?drawProportional(ctx,box,states,gamma,options):drawSchematic(ctx,box,states,gamma,options);}

 window.PraxisCarnotDiagram={draw};
})();
