/* Run as a function through Chrome DevTools evaluate_script after loading the lesson.
   Exercises the real controls; results are also suitable for an offline file:// page. */
async () => {
 const report={url:location.href,width:innerWidth,languages:[],errors:[]};
 const check=(condition,message)=>{if(!condition)report.errors.push(message);};
 const click=(sim,selector)=>{const button=sim.fig.querySelector(selector);check(!!button,sim.fig.id+': missing '+selector);button?.click();return button;};
 const states=()=>ALL.map(sim=>({id:sim.fig.id,mode:sim.mode,p:{...sim.p},t:{...sim.t}}));
 for(const language of ['ro','en']){
  await PraxisI18n.setLanguage(language);
  const result={language,figures:[],sections:[]};report.languages.push(result);
  for(const sim of ALL){
   const id=sim.fig.id;
   PraxisHeatEnginesTabs.select(sim.fig.closest('.sec').id,{scroll:false});sim.resize();
   for(const button of sim.fig.querySelectorAll('[data-mode]')){
    button.click();check(sim.mode===button.dataset.mode,id+': mode mismatch');
    for(const peer of sim.fig.querySelectorAll('[data-mode]')){
     const active=peer.dataset.mode===sim.mode;
     check(peer.classList.contains('on')===active&&peer.getAttribute('aria-pressed')===String(active),id+': mode button mismatch');
    }
    for(const element of sim.fig.querySelectorAll('[data-in]'))check(element.hidden===!element.dataset.in.split(' ').includes(sim.mode),id+': mode content mismatch');
   }
   for(const button of sim.fig.querySelectorAll('[data-t]'))for(let n=0;n<2;n++){
    button.click();const active=sim.t[button.dataset.t];
    check(button.classList.contains('on')===active&&button.getAttribute('aria-pressed')===String(active),id+': toggle mismatch');
    if(id==='fig6'&&button.dataset.t==='scale')check(sim.fig.querySelector('.carnot-schematic-note').hidden===active,id+': schematic note mismatch');
   }
   for(const input of sim.fig.querySelectorAll('input[type=range]')){
    const old=input.value;
    for(const value of [input.min,input.max,old]){
     input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
     check(sim.p[input.dataset.k]===+input.value,id+': slider mismatch');
     if(sim.c4)check(sim.c4.P.every(point=>Number.isFinite(point.V)&&Number.isFinite(point.T)),id+': invalid cycle state');
    }
   }
   for(const button of sim.fig.querySelectorAll('[data-act]')){
    button.click();
    const running=button.dataset.act==='run'&&button.querySelector('use')?.getAttribute('href')==='#i-pause';
    for(let n=0;n<180;n++)sim.step?.(.05);sim.render();
    if(running){button.click();check(button.querySelector('use')?.getAttribute('href')==='#i-play',id+': pause mismatch');}
    if(button.dataset.act==='step')check(sim.btn('run').querySelector('use')?.getAttribute('href')==='#i-play',id+': step must stop continuous playback');
   }
   if(['fig7','fig8','fig9'].includes(id)){
    const rows=[...sim.fig.closest('.sec').querySelectorAll('tr[data-st]')];
    if(rows.length){
     const before=rows.findIndex(row=>row.classList.contains('on'));
     click(sim,'[data-act="step"]');for(let n=0;n<40;n++)sim.step(.05);sim.render();
     check(rows.findIndex(row=>row.classList.contains('on'))===(before+1)%4,id+': process table mismatch');
    }
   }
   const before=JSON.stringify(states());
   PraxisHeatEnginesTabs.select('s11',{scroll:false});
   check(ALL.every(item=>item.vis===false&&item.raf===null),id+': hidden animation still scheduled');
   PraxisHeatEnginesTabs.select(sim.fig.closest('.sec').id,{scroll:false});sim.resize();
   check(JSON.stringify(states())===before,id+': navigation changed retained controls');
   result.figures.push({id,controls:sim.fig.querySelectorAll('[data-mode],[data-t],[data-act],input[type=range]').length});
  }
  for(const section of document.querySelectorAll('.sec')){
   PraxisHeatEnginesTabs.select(section.id,{scroll:false});
   check(!section.hidden&&PraxisHeatEnginesTabs.activeSection===section.id,section.id+': section mismatch');
   check(document.querySelector('.praxis-course-sections').value===section.id,section.id+': section selector mismatch');
   check(document.documentElement.scrollWidth<=innerWidth,section.id+': horizontal overflow');
   result.sections.push(section.id);
  }
  for(const section of ['s3','s4','s3']){
   PraxisHeatEnginesTabs.select(section,{scroll:false});
   check(ALL.filter(sim=>['fig3','fig4'].includes(sim.fig.id)).every(sim=>sim.fig.closest('.sec').id===section&&sim.mode===(section==='s3'?'otto':'diesel')),section+': shared engine mismatch');
  }
 }
 await PraxisI18n.setLanguage('ro');PraxisHeatEnginesTabs.select('top',{scroll:false});
 report.passed=report.errors.length===0;return report;
}
