/* The same closed ideal diagrams are used in the introduction and in the engine lesson. */
(()=>{const c=$('#heroField'),ctx=c.getContext('2d'),hero=$('.hero');let w=0,h=0,k=0,u=0,raf=null,vis=true,last=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const names=['OTTO','DIESEL','CARNOT'],factor=2**1.5,carnot=[{V:5,T:600},{V:15,T:600},{V:15*factor,T:300},{V:5*factor,T:300}];
 function frame(dt){
  if(w<=0||h<=0)return;u=(u+dt*.11)%1;const phase=Math.floor(u*4),fraction=u*4-phase;ctx.clearRect(0,0,w,h);
  const box={x:48,y:42,w:w-100,h:h-98};
  if(k<2)window.PraxisIdealCycleDiagram.draw(ctx,box,{kind:k===0?'otto':'diesel',phase,fraction,area:true,mark:true});
  else{const plot=window.PraxisCarnotDiagram.draw(ctx,box,carnot,5/3,{phase}),state=legAt(carnot[phase],carnot[(phase+1)%4],phase%2===0?'T':'S',fraction,5/3),[x,y]=plot.xy(state);ctx.beginPath();ctx.arc(x,y,4.5,0,TAU);ctx.fillStyle='#c8402a';ctx.fill();}
  ctx.save();ctx.font='600 11px "JetBrains Mono", monospace';ctx.textAlign='right';ctx.fillStyle='#6f6a5f';ctx.fillText(names[k],w-28,18);ctx.restore();
 }
 function loop(){if(raf||reduce||document.hidden)return;last=performance.now();const step=now=>{raf=null;if(!vis||document.hidden)return;const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;frame(dt);raf=requestAnimationFrame(step);};raf=requestAnimationFrame(step);}
 function resize(){const r=c.getBoundingClientRect(),d=window.PraxisCanvasResolution?.forCanvas(c)??Math.min(2,devicePixelRatio||1);w=r.width;h=r.height;c.width=w*d;c.height=h*d;ctx.setTransform(d,0,0,d,0,0);frame(0);}
 new ResizeObserver(resize).observe(c);window.addEventListener('resize',resize);new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)loop();}).observe(hero);
 hero.addEventListener('pointerdown',event=>{if(event.target.closest('a,button'))return;k=(k+1)%3;u=0;SND.whoosh();frame(0);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&vis)loop();});loop();
})();
