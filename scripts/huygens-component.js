function im(){
 const canvas=N.useRef(null),front=N.useRef({x:140,radius:36,elapsed:0,time:0,cycle:1}),timeline=N.useRef(null),timeOutput=N.useRef(null),[speed,setSpeed]=N.useState(25),[revision,setRevision]=N.useState(0),[paused,setPaused]=N.useState(false),[mode,setMode]=N.useState('spherical'),dark=wn();
 const interval=1;
 const seed=()=>({x:140,radius:36,elapsed:0,time:0,cycle:1});
 const seek=event=>{front.current.elapsed=Math.min(interval,Math.max(0,Number(event.target.value)||0));setPaused(true);setRevision(n=>n+1);};
 const restart=(newMode=mode,stop=true)=>{front.current=seed();setMode(newMode);setPaused(stop);setRevision(n=>n+1);};
 lessonUseEffect(()=>{
  const clock=window.PraxisAnimationClock.create();let ticket=0;
  const draw=now=>{
   const c=canvas.current;if(!c)return;
   const dt=paused?0:clock.step(now),ctx=c.getContext('2d'),w=c.width,h=c.height,F=front.current;
   // One common emission instant per generation. The green envelope is continuous
   // at the automatic handover: R0+v*1 = next R0+v*0 (and likewise for x).
   if(!paused){
    F.elapsed+=dt;
    while(F.elapsed>=interval-1e-9){
     F.elapsed=Math.max(0,F.elapsed-interval);F.time+=interval;
     if(mode==='plane')F.x+=3*speed*interval;else F.radius+=speed*interval;
     // Fixed scale within a demonstration; replay only when the next whole stage
     // would leave the viewport. This is an explicitly labelled replay, not zoom.
     if(mode==='plane'?F.x+3*speed*interval>650:F.radius+speed*interval>136){const cycle=F.cycle+1,elapsed=F.elapsed;Object.assign(F,seed(),{cycle,elapsed});}
    }
   }
   if(timeline.current)timeline.current.value=String(F.elapsed);
   if(timeOutput.current)timeOutput.current.textContent=F.elapsed.toLocaleString(window.PraxisI18n?.locale||'ro-RO',{minimumFractionDigits:2,maximumFractionDigits:2})+' s';
   ctx.fillStyle=dark?'#1c1f2b':'#ffffff';ctx.fillRect(0,0,w,h);
   ctx.strokeStyle=dark?'#334155':'#e2e8f0';ctx.lineWidth=1;
   for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
   for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
   const scale=mode==='plane'?3:1;
   const r=speed*F.elapsed*scale,cx=w/2,cy=h/2,base=F.radius,px=F.x;
   const sourceColor=dark?'#fbbf24':'#b45309',waveColor=dark?'rgba(96,165,250,.65)':'rgba(37,99,235,.55)',newColor=dark?'#34d399':'#047857';
   ctx.setLineDash([4,5]);ctx.strokeStyle=sourceColor;ctx.lineWidth=1.5;ctx.beginPath();
   if(mode==='plane'){ctx.moveTo(px,32);ctx.lineTo(px,h-32);}else ctx.arc(cx,cy,base,0,2*Math.PI);
   ctx.stroke();ctx.setLineDash([]);
   const points=mode==='plane'?Array.from({length:9},(_,j)=>[px,42+j*(h-84)/8]):Array.from({length:12},(_,j)=>[cx+base*Math.cos(j*Math.PI/6),cy+base*Math.sin(j*Math.PI/6)]);
   // Full circles are 2D sections of the elementary SPHERICAL waves.
   // The green envelope selects the forward propagation direction.
   for(const [x,y]of points){
    if(r>0){ctx.strokeStyle=waveColor;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.stroke();}
    ctx.fillStyle=sourceColor;ctx.beginPath();ctx.arc(x,y,3,0,2*Math.PI);ctx.fill();
   }
   {ctx.strokeStyle=newColor;ctx.lineWidth=3;ctx.beginPath();if(mode==='plane'){ctx.moveTo(px+r,32);ctx.lineTo(px+r,h-32);}else ctx.arc(cx,cy,base+r,0,2*Math.PI);ctx.stroke();}
   const sx=mode==='plane'?px:cx+base,sy=cy;
   if(r>0){ctx.strokeStyle=newColor;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+r,sy);ctx.stroke();ctx.fillStyle=newColor;ctx.font='13px system-ui';ctx.fillText('r = v·Δt',sx+6,sy-8);}
   ctx.font='13px system-ui';ctx.fillStyle=sourceColor;ctx.fillText('Front la t₀ · surse active simultan',12,19);
   ctx.fillStyle=dark?'#e2e8f0':'#334155';ctx.fillText('Ciclu demonstrativ: '+F.cycle,w-190,19);
   ctx.fillStyle=newColor;ctx.fillText('Front la t₀ + Δt · înfășurătoare înainte',12,h-13);
   ctx.fillStyle=dark?'#e2e8f0':'#334155';ctx.fillText('t₀ = '+F.time.toFixed(2)+' s · Δt = '+F.elapsed.toFixed(2)+' s',w-242,h-13);
   ticket=lessonRequestAnimationFrame(draw);
  };
  ticket=lessonRequestAnimationFrame(draw);return()=>lessonCancelAnimationFrame(ticket);
 },[speed,paused,dark,revision,mode]);
 return f('div',{className:'rounded-xl border p-3',style:{background:'var(--card)',borderColor:'var(--border)'},children:[
  f('div',{className:'praxis-huygens-selector',role:'group','aria-label':'Tipul frontului',children:[
   t('button',{type:'button','aria-pressed':mode==='plane','data-huygens-mode':'plane',onClick:()=>restart('plane',false),children:'Front de undă plan'}),
   t('button',{type:'button','aria-pressed':mode==='spherical','data-huygens-mode':'spherical',onClick:()=>restart('spherical',false),children:'Front de undă sferic'})
  ]}),
  t('canvas',{ref:canvas,width:720,height:340,'aria-label':'Construcția Huygens de la t₀ la t₀ + Δt',className:'w-full rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700'}),
  f('div',{className:'praxis-wave-controls',children:[
   t('span',{children:mode==='plane'?'La t₀, toate punctele frontului plan emit simultan unde sferice elementare. Centrele portocalii rămân fixe; cercurile albastre sunt secțiunile undelor elementare, cu aceeași rază r = v·Δt. Tangenta comună verde este frontul la t₀ + Δt, în sensul propagării spre dreapta.':'La t₀, toate punctele frontului sferic emit simultan unde sferice elementare. Centrele portocalii rămân fixe pe sfera de rază R₀; toate cercurile albastre au raza r = v·Δt. Înfășurătoarea exterioară verde are raza R₀ + v·Δt. Desenul reprezintă o secțiune prin sfere.'}),
   t('span',{children:'Propagarea este continuă: la fiecare secundă, noul front devine automat frontul la t₀ al etapei următoare. Scara rămâne fixă; demonstrația se reia când următoarea etapă ar ieși din desen. Sliderul Δt (0–1 s) și butoanele −/+ pun pe pauză și permit examinarea etapei curente pas cu pas.'}),
   f('label',{children:['Viteză ',speed,' u/s ',t('input',{type:'range',min:10,max:40,step:1,value:speed,onChange:e=>{front.current=seed();setSpeed(+e.target.value);setRevision(n=>n+1);}})]}),
   f('label',{'data-huygens-timeline':'',children:['Δt ',t('output',{ref:timeOutput,'data-no-i18n':'',children:'0,00 s'}),t('input',{ref:timeline,'data-huygens-time':'','aria-label':'Intervalul Δt',type:'range',min:0,max:1,step:0.01,defaultValue:0,onChange:seek})]}),
   t('button',{'data-huygens-action':'play',onClick:()=>setPaused(!paused),className:'rounded-full px-3 py-1',children:paused?'Pornește':'Pauză'}),
   t('button',{'data-huygens-action':'reset',onClick:()=>restart(),className:'rounded-full px-3 py-1',children:'Resetează'})
  ]})
 ]});
}
