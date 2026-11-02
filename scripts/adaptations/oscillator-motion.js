/* Analytic spring and phasor views. Mechanism and plot have disjoint bounds. */
(()=>{
 const tr=s=>PraxisI18n.tr(s),TAU=2*Math.PI;
 function readout(s,text){s.ro.dataset.noI18n='';const value=tr(text);if(s.ro.textContent!==value)s.ro.textContent=value;}
 function line(g,x1,y1,x2,y2,color=C.axis,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
 function panel(g,b){g.strokeStyle=C.grid;g.lineWidth=1;g.strokeRect(b.x,b.y,b.w,b.h);}
 const layout={mechanism:{x:16,y:18,w:270,h:270},plot:{x:310,y:18,w:314,h:270}};
 function chart(g,s,A,w,phase,kind,maxA){
  const left=352,right=610,top=66,bottom=230,mid=148,scale=80/maxA,T=TAU/w,span=2*T,start=Math.max(0,s.t-span),end=start+span;
  const X=t=>left+(t-start)/span*(right-left),Y=y=>mid-y*scale;
  panel(g,layout.plot);label(g,'y (m)',left,38,C.ink,12);label(g,'t (s)',right,278,C.ink,12,'right');
  for(const y of [-maxA,0,maxA]){line(g,left,Y(y),right,Y(y),C.grid);label(g,y.toFixed(1),left-9,Y(y)+4,C.ink,12,'right');}
  for(let i=0;i<=2;i++){const t=start+i*span/2;line(g,X(t),top,X(t),bottom,C.grid);label(g,t.toFixed(2),X(t),253,C.ink,12,i===0?'left':i===2?'right':'center');}
  line(g,left,mid,right,mid,C.axis);line(g,left,top,left,bottom,C.axis);
  const from=Math.max(start,s.segmentStart||0),to=s.t,fun=p=>kind==='cos'?Math.cos(p):Math.sin(p);g.save();g.beginPath();g.rect(left-1,top-1,right-left+2,bottom-top+2);g.clip();g.strokeStyle=C.accent;g.lineWidth=2.2;g.beginPath();
  const samples=Math.max(240,Math.ceil((right-left)*Math.max(1,Math.abs(g.getTransform?.()?.a||1))*2));
  for(let i=0;i<=samples;i++){const t=from+(to-from)*i/samples,y=A*fun(phase+w*(t-s.t));i?g.lineTo(X(t),Y(y)):g.moveTo(X(t),Y(y));}g.stroke();g.restore();
  const y=A*fun(phase);ball(g,X(s.t),Y(y),4.5,C.green);return {x:X(s.t),y:Y(y),value:y};
 }
 function prepare(shell,s){s.phase=0;s.segmentStart=0;s.lastCross=0;if(s.ro)s.ro.dataset.noI18n='';}
 function reset(s){s.phase=0;s.segmentStart=0;s.lastCross=0;s.t=0;Sound.setTone('phasor',false,0);}
 App.register({id:'demo-oscillator',wire:prepare,reset,onParam(s,key){if(key!=='speed')reset(s);},frame(s){const w=Math.sqrt(+s.sliders.k.value/+s.sliders.m.value);s.phase=w*s.t;const cross=Math.floor((s.phase+Math.PI/2)/Math.PI);if(s.lastCross!==undefined&&cross!==s.lastCross&&s.checks.sound?.checked)Sound.tick(.1);s.lastCross=cross;},
 render(g,w,h,s){const k=+s.sliders.k.value,m=+s.sliders.m.value,A=+s.sliders.A.value,omega=Math.sqrt(k/m),phase=omega*s.t,y=A*Math.cos(phase),F=-k*y;
  panel(g,layout.mechanism);label(g,tr('oscilator'),28,38,C.ink,12);label(g,'F = '+F.toFixed(2)+' N',28,67,C.red,12);
  const eq=170,cy=155,bx=eq+y*56,half=16;
  g.save();g.beginPath();g.rect(18,85,266,150);g.clip();g.fillStyle=C.axis;g.fillRect(38,104,8,88);spring(g,46,cy,bx-half,8,8);g.fillStyle=C.accent;g.fillRect(bx-half,cy-half,half*2,half*2);g.strokeStyle=C.axis;g.strokeRect(bx-half,cy-half,half*2,half*2);label(g,'m',bx,cy+4,C.ink,12,'center');
  line(g,30,190,274,190,C.axis,2);g.setLineDash([3,4]);line(g,eq,195,eq,233,C.violet);g.setLineDash([]);line(g,35,222,272,222,C.axis);line(g,bx,195,bx,227,C.green);
  if(Math.abs(F)>.01){const length=Math.sign(F)*Math.min(60,Math.abs(F)*.7);arrow(g,bx,105,bx+length,105,C.red,2.5);}g.restore();
  label(g,tr('O (echilibru)'),eq,246,C.violet,12,'center');label(g,'y = '+y.toFixed(3)+' m',28,276,C.ink,12);
  chart(g,s,A,omega,phase,'cos',1.2);s.y=y;s.w=omega;s.force=F;s.bodyBox={x:bx-half,y:cy-half,w:half*2,h:half*2};
  readout(s,`ω = ${omega.toFixed(3)} rad/s · T = ${(TAU/omega).toFixed(3)} s · ν = ${(omega/TAU).toFixed(3)} Hz`);
 }});
 App.register({id:'demo-phasor',wire:prepare,reset,onParam(s,key){if(key!=='speed')reset(s);},onCheck(s,key,checked){if(key==='sound'&&!checked)Sound.setTone('phasor',false,0);},frame(s){const omega=+s.sliders.w.value;s.phase=omega*s.t+(+s.sliders.phi.value);if(s.checks.sound?.checked)Sound.setTone('phasor',true,Math.max(80,omega/TAU*80),.025);else Sound.setTone('phasor',false,0);},
 render(g,w,h,s){const A=+s.sliders.A.value,omega=+s.sliders.w.value,phi=+s.sliders.phi.value,phase=omega*s.t+phi,angle=((phase%TAU)+TAU)%TAU,cx=145,cy=148,R=80,r=A*40,px=cx+r*Math.cos(angle),py=cy-r*Math.sin(angle);
  panel(g,layout.mechanism);label(g,'Oy',cx+8,38,C.ink,12);
  g.save();g.beginPath();g.rect(18,45,266,210);g.clip();g.strokeStyle=C.grid;g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();arrow(g,45,cy,253,cy,C.axis,1);arrow(g,cx,248,cx,48,C.axis,1);label(g,'Ox',250,cy+30,C.ink,12,'right');
  arrow(g,cx,cy,px,py,C.pink,2.5);g.setLineDash([3,4]);line(g,px,py,cx,py,C.violet);g.setLineDash([]);ball(g,px,py,5,C.pink);ball(g,cx,py,4,C.violet);
  label(g,'P',px+(Math.cos(angle)>=0?11:-11),py+(Math.sin(angle)>=0?-11:19),C.ink,12,Math.cos(angle)>=0?'left':'right');label(g,'Q',cx-12,py+4,C.ink,12,'right');g.strokeStyle=C.amber;g.beginPath();g.arc(cx,cy,20,0,-angle,true);g.stroke();g.restore();
  label(g,'φ = '+angle.toFixed(2)+' rad',28,274,C.ink,12);chart(g,s,A,omega,phase,'sin',2);s.y=A*Math.sin(phase);s.ph=phase;s.point={x:px,y:py};s.projection={x:cx,y:py};
  readout(s,`A = ${A.toFixed(2)} m · ω = ${omega.toFixed(2)} rad/s · ν = ${(omega/TAU).toFixed(3)} Hz · T = ${(TAU/omega).toFixed(3)} s`);
 }});
 window.PraxisOscillatorViews={layout};
})();
