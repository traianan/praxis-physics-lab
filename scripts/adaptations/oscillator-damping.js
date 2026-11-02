App.register({
 id:'demo-amort',
 reset(s){s.t=0;},
 wire(shell,s){s.regimeSelect=shell.querySelector('[data-sl="regim"]');const custom=document.createElement('option');custom.value='custom';custom.textContent='Personalizat';s.regimeSelect.append(custom);s.regimeSelect.addEventListener('change',()=>{const w0=2*Math.PI/+s.sliders.T.value,preset=s.regimeSelect.value;if(preset==='custom')return;s.presetCritical=preset==='tranzitoriu';const b=preset==='aer'?.08:preset==='apa'?.8:preset==='tranzitoriu'?w0:1.4*w0;s.sliders.b.value=b;s.sliders.b_fmt();s.t=0;});},
 onParam(s,key){s.t=0;if(key==='T'||key==='b'){s.regimeSelect.value='custom';s.presetCritical=false;}},
 render(ctx,w,h,s){
  const T0=+s.sliders.T.value,w0=2*Math.PI/T0,b=s.presetCritical?w0:+s.sliders.b.value,under=b<w0-1e-6,critical=Math.abs(b-w0)<1e-6,period=under?2*Math.PI/Math.sqrt(w0*w0-b*b):null;
  if(s.presetCritical){const out=document.querySelector('#demo-amort [data-val="b"]');if(out)out.textContent=b.toFixed(3);}s.sliders.b.setAttribute('aria-valuetext',b.toFixed(3)+' s⁻¹');
  const initialV=under?-b:0,value=t=>PraxisOscillatorModel.damped(t,w0,b,1,initialV),span=Math.max(8,6*T0),start=Math.max(0,s.t-span),end=start+span;
  const left=55,right=w-25,top=42,bottom=h-45,X=t=>left+(t-start)/span*(right-left),Y=x=>(top+bottom)/2-x*(bottom-top)/2.2;
  function line(x1,y1,x2,y2,color=C.grid){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  for(const y of [-1,0,1]){line(left,Y(y),right,Y(y));label(ctx,String(y),left-10,Y(y)+4,C.ink,12,'right');}
  for(let i=0;i<=4;i++){const t=start+i*span/4;line(X(t),top,X(t),bottom);label(ctx,t.toFixed(1),X(t),bottom+19,C.ink,12,'center');}
  line(left,top,left,bottom,C.axis);line(left,Y(0),right,Y(0),C.axis);label(ctx,'x / A₀',left,20,C.ink,12);label(ctx,'t (s)',right,bottom+38,C.ink,12,'right');
  const samples=Math.max(180,Math.ceil((right-left)*Math.max(1,Math.abs(ctx.getTransform?.()?.a||1))*2));
  if(under){ctx.setLineDash([5,4]);ctx.strokeStyle=C.amber;for(const sign of [-1,1]){ctx.beginPath();for(let i=0;i<=samples;i++){const t=start+i*span/samples,x=sign*Math.exp(-b*t);i?ctx.lineTo(X(t),Y(x)):ctx.moveTo(X(t),Y(x));}ctx.stroke();}ctx.setLineDash([]);}
  ctx.strokeStyle=C.accent;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=samples;i++){const t=start+(s.t-start)*i/samples;const p=value(t);i?ctx.lineTo(X(t),Y(p.x)):ctx.moveTo(X(t),Y(p.x));}ctx.stroke();const p=value(s.t);s.x=p.x;s.v=p.v;ball(ctx,X(s.t),Y(p.x),5,C.accent);
  const regime=critical?'critic amortizat':under?'oscilatoriu amortizat':'aperiodic (fără oscilații)';s.regime=regime;
  if(s.ro)s.ro.textContent=under?`T₀ = ${T0.toFixed(2)} s · T′ = ${period.toFixed(2)} s · τ = ${(1/b).toFixed(2)} s · D = ${(b*period).toFixed(3)} · N½ = ${(Math.log(2)/(b*period)).toFixed(2)} · regim: ${regime}`:`b = ${b.toFixed(2)} s⁻¹ · regim: ${regime} · T′, D și N½ nu sunt definite`;
 }
});
