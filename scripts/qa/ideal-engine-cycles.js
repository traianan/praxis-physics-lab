// Browser QA: all six phases, both ideal cycles, midpoint and endpoints.
async function auditIdealEngineCycles(){
 const touch=document.getElementById('course-touch');if(touch.getAttribute('aria-pressed')!=='true')touch.click();
 PraxisThermodynamicsTabs.select('s0',{scroll:false});await new Promise(r=>requestAnimationFrame(r));
 const sim=ALL.find(s=>s.fig.id==='fig0'),issues=[];let samples=0;
 for(const kind of ['otto','diesel']){
  sim.fig.querySelector('[data-mode='+kind+']').click();
  for(let phase=0;phase<6;phase++)for(const fraction of [0,.5,1]){
   sim.setEnginePhase(phase,fraction);samples++;
   const labels=PraxisVelocityLabels.inspect(sim.ctx).filter(l=>l.box);
   for(const l of labels){const b=l.box;if(b.x<-.5||b.y<-.5||b.x+b.w>sim.w+.5||b.y+b.h>sim.h+.5)issues.push({type:'clip',kind,phase,fraction,text:l.text});}
   for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i].box,b=labels[j].box;if(Math.min(a.x+a.w,b.x+b.w)>Math.max(a.x,b.x)+1&&Math.min(a.y+a.h,b.y+b.h)>Math.max(a.y,b.y)+1)issues.push({type:'overlap',kind,phase,fraction,texts:[labels[i].text,labels[j].text]});}
   if(document.documentElement.scrollWidth>innerWidth+1)issues.push({type:'page-overflow',kind,phase});
   const actual=sim.enginePoint(),expected=sim.engineCycle().point(phase,fraction);if(Math.abs(actual.p-expected.p)>1e-8||Math.abs(actual.V-expected.V)>1e-8)issues.push({type:'state',kind,phase});
  }
 }
 return {viewport:innerWidth+'x'+innerHeight,language:PraxisI18n.language,touch:touch.getAttribute('aria-pressed'),samples,issues,katexErrors:document.querySelectorAll('.katex-error').length};
}
