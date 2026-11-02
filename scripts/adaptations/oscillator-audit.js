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
