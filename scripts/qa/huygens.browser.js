async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),reports=[];
 const root=kind=>document.querySelector('[data-huygens-kind='+kind+']');
 const change=(el,value)=>{Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));if(el.tagName!=='SELECT')el.dispatchEvent(new Event('change',{bubbles:true}));};
 const go=async kind=>{window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:root(kind).closest('.lesson-part-content').id}));await wait(100);};
 const stage=async(kind,n)=>{change(root(kind).querySelector('[data-huygens-stage-choice]'),n);await wait(80);};
 await PraxisI18n.setLanguage('ro');
 for(const kind of ['reflection','refraction']){
  await go(kind);await stage(kind,0);let r=root(kind);if(!r.checkVisibility())throw Error(kind+' not visible');
  const first=r.querySelectorAll('[data-secondary-source]').length;
  r.querySelector('[data-huygens-play]').click();await wait(250);r.querySelector('[data-huygens-play]').click();await wait(70);
  const time=Number(r.dataset.huygensProgress);await wait(130);const held=Number(r.dataset.huygensProgress)===time;
  await PraxisI18n.setLanguage('en');await wait(70);const english=r.textContent.includes('Construction stage'),languageHeld=Number(r.dataset.huygensProgress)===time;await PraxisI18n.setLanguage('ro');
  await stage(kind,1);const growing=r.querySelectorAll('[data-secondary-source]').length,earlyFront=!!r.querySelector('[data-constructed-front]');
  await stage(kind,2);const built=r.querySelectorAll('[data-secondary-source]').length,tangencies=r.querySelectorAll('[data-tangent-point]').length,before=r.querySelector('[data-constructed-front]').getAttribute('y1');
  const incidentRays=r.querySelectorAll('[data-huygens-ray=incident]').length,outgoing=[...r.querySelectorAll('[data-huygens-ray='+kind+']')],front=r.querySelector('[data-constructed-front]');
  const coord=(e,k)=>Number(e.getAttribute(k)),fx=coord(front,'x2')-coord(front,'x1'),fy=coord(front,'y2')-coord(front,'y1');
  const perpendicular=outgoing.every(ray=>Math.abs((coord(ray,'x2')-coord(ray,'x1'))*fx+(coord(ray,'y2')-coord(ray,'y1'))*fy)<1e-6);
  const bounded=outgoing.every((ray,j)=>Math.abs((coord(front,j?'x2':'x1')-coord(ray,'x1'))*(coord(ray,'y2')-coord(ray,'y1'))-(coord(front,j?'y2':'y1')-coord(ray,'y1'))*(coord(ray,'x2')-coord(ray,'x1')))<1e-6);
  await stage(kind,3);const moved=r.querySelector('[data-constructed-front]').getAttribute('y1')!==before;
  r.querySelector('[data-huygens-play]').click();await wait(120);const replay=Number(r.dataset.huygensProgress)<.1;
  await go(kind==='reflection'?'refraction':'reflection');await wait(70);const hiddenTime=Number(r.dataset.huygensProgress);await wait(100);const hiddenHeld=r.dataset.huygensRunning==='false'&&Number(r.dataset.huygensProgress)===hiddenTime;
  await go(kind);r.querySelector('[data-huygens-reset]').click();await wait(70);const reset=Number(r.dataset.huygensProgress)===0;
  await stage(kind,2);
  let bending=true;
  if(kind==='refraction'){
   const slider=r.querySelector('[data-huygens-ratio]'),p=Number(r.dataset.huygensProgress);
   change(slider,.5);await wait(70);const low=Number(r.dataset.huygensR);
   change(slider,1.1);await wait(70);const high=Number(r.dataset.huygensR);
   bending=low<40*Math.PI/180&&high>40*Math.PI/180&&Number(r.dataset.huygensProgress)===p;
   change(slider,.7);await wait(70);
  }
  const proof=r.querySelector('details');proof.open=true;await wait(50);const errors=r.querySelectorAll('.wave-math-error').length,fractions=proof.querySelectorAll('mfrac').length;proof.open=false;
  const report={kind,first,time,held,english,languageHeld,growing,earlyFront,built,tangencies,incidentRays,outgoingRays:outgoing.length,perpendicular,bounded,moved,replay,hiddenHeld,reset,bending,errors,fractions};
  if(first!==0||!(time>0)||!held||!english||!languageHeld||growing!==4||earlyFront||built!==9||tangencies!==8||incidentRays!==2||outgoing.length!==2||!perpendicular||!bounded||!moved||!replay||!hiddenHeld||!reset||!bending||errors)throw Error('Huygens audit: '+JSON.stringify(report));
  reports.push(report);
 }
 window.scrollTo(0,0);return reports;
}
