// Browser QA: all substances, mass endpoints and all three molar-quantity views.
async function auditMolarQuantities(){
 const touch=document.getElementById('course-touch');if(touch.getAttribute('aria-pressed')!=='true')touch.click();
 PraxisThermodynamicsTabs.select('s3',{scroll:false});await new Promise(r=>requestAnimationFrame(r));
 const sim=ALL.find(s=>s.fig.id==='fig4'),api=PraxisCanvasTypography,native=api.textInBox,records=[],issues=[];let samples=0;
 api.textInBox=function(ctx,text,box,options){const ink=native(ctx,text,box,options);records.push({text,box,ink});return ink;};
 function check(){records.length=0;sim.render();samples++;
  for(const {text,box,ink}of records){
   if(Math.abs(ink.x+ink.w/2-box.x-box.w/2)>.1||Math.abs(ink.y+ink.h/2-box.y-box.h/2)>.1)issues.push({type:'centering',mode:sim.mode,text});
   if(ink.x<box.x-.5||ink.y<box.y-.5||ink.x+ink.w>box.x+box.w+.5||ink.y+ink.h>box.y+box.h+.5)issues.push({type:'box-fit',mode:sim.mode,text});
  }
  const labels=PraxisVelocityLabels.inspect(sim.ctx).filter(l=>l.box);
  for(const l of labels){const b=l.box;if(b.x<-.5||b.y<-.5||b.x+b.w>sim.w+.5||b.y+b.h>sim.h+.5)issues.push({type:'canvas-fit',mode:sim.mode,text:l.text});
   for(const r of records){const a=r.ink;if(Math.min(a.x+a.w,b.x+b.w)>Math.max(a.x,b.x)+1&&Math.min(a.y+a.h,b.y+b.h)>Math.max(a.y,b.y)+1)issues.push({type:'annotation-over-fixed',mode:sim.mode,texts:[r.text,l.text]});}
  }
  if(document.documentElement.scrollWidth>innerWidth+1)issues.push({type:'page-overflow'});
 }
 try{
  for(const mode of ['mm','conv']){
   sim.fig.querySelector('[data-mode='+mode+']').click();
   for(const button of document.querySelectorAll('#chips4 button')){button.click();
    if(mode==='conv'){const input=sim.fig.querySelector('[data-k=m]');for(const value of [input.min,134,input.max]){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));check();}}else check();
   }
  }
  sim.fig.querySelector('[data-mode=mix]').click();const n1=sim.fig.querySelector('[data-k=N1]'),n2=sim.fig.querySelector('[data-k=N2]');
  for(const values of [[12,4],[n1.min,n2.max],[n1.max,n2.min],[n1.max,n2.max]]){[n1,n2].forEach((input,i)=>{input.value=values[i];input.dispatchEvent(new Event('input',{bubbles:true}));});check();}
 }finally{api.textInBox=native;}
 return {viewport:innerWidth+'x'+innerHeight,language:PraxisI18n.language,samples,issues,title:sim.fig.querySelector('.fig-h b').textContent,legend:sim.fig.querySelector('.fig-h span').textContent};
}
