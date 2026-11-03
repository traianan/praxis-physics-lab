/* Dedicated wave QA; inject after canvas-resolution.browser.js. Never shipped. */
(() => {
 'use strict';
 const visible=e=>!!e&&e.getClientRects().length>0&&!e.closest('[hidden],[inert]')&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
 const label=e=>(e.getAttribute('aria-label')||e.textContent||e.id).replace(/\s+/g,' ').trim();
 const nodeKey=e=>{if(e.id)return '#'+e.id;const parts=[];for(let n=e;n&&n!==document.body;n=n.parentElement){if(n.id){parts.unshift('#'+n.id);break;}parts.unshift(n.tagName.toLowerCase()+':'+[...n.parentElement.children].indexOf(n));}return parts.join('/');};
 const settle=()=>new Promise(resolve=>setTimeout(resolve,90));
 async function run({language='ro'}={}){
  if(!window.PraxisResolutionAudit?.scan)throw Error('Load canvas-resolution.browser.js before the wave pass');
  if(!document.querySelector('section.lesson-section'))throw Error('The wave lesson has not mounted');
  if(window.PraxisI18n?.setLanguage)await window.PraxisI18n.setLanguage(language);
  await settle();
  const originalHash=location.hash,details=new Map(),signals=new Map(),results=[],errors=[],navigation=[],inspected=new Set(),sections=[...document.querySelectorAll('section.lesson-section')].map(e=>e.id);
  const activities=sections.flatMap(id=>{const section=document.getElementById(id),parts=[...section.querySelectorAll('.lesson-part-content')];return parts.length?parts.map(p=>({section:id,id:p.id})): [{section:id,id}];});
  function reveal(panel){
   // Disclosures and idle waveform surfaces can be inspected without starting
   // an instrument, audio, recording, random exercise, or simulation clock.
   for(const disclosure of panel.querySelectorAll('details')){if(!details.has(disclosure))details.set(disclosure,disclosure.open);disclosure.open=true;}
   for(const instrument of panel.querySelectorAll('[data-instrument-layout]')){if(!signals.has(instrument))signals.set(instrument,instrument.getAttribute('data-signal-ready'));instrument.setAttribute('data-signal-ready','qa-inspection');}
  }
  function collect(route){const sample=window.PraxisResolutionAudit.scan(route);results.push(sample);for(const canvas of sample.canvases)inspected.add(canvas.id);}
  try{
   for(const activity of activities){
    try{
     // Use the lesson's destination resolver. Enumerating the mounted section
     // and activity IDs cannot lose a parent when sibling navigation hides it.
     window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:activity.id}));await settle();
     const section=document.getElementById(activity.section),panel=document.getElementById(activity.id);
     if(!visible(section)||!visible(panel))throw Error('Destination did not activate '+activity.id);
     reveal(panel);await settle();collect([activity.section,activity.id]);navigation.push({control:'lesson:navigate',target:activity.id,visited:true});
     const tabs=[...panel.querySelectorAll('[role="tablist"] button[role="tab"],.wave-water-tabs button')].map(button=>({id:button.id,text:label(button)}));
     for(const tab of tabs){
      const button=tab.id?document.getElementById(tab.id):[...panel.querySelectorAll('[role="tablist"] button')].find(e=>label(e)===tab.text);
      if(!visible(button)||button.disabled)throw Error('Nested activity tab is inaccessible: '+tab.text);
      button.click();await settle();reveal(panel);await settle();collect([activity.section,activity.id,tab.text]);navigation.push({control:activity.id,target:tab.id||tab.text,visited:true});
     }
    }catch(error){errors.push({route:[activity.section,activity.id],error:String(error)});navigation.push({control:'lesson:navigate',target:activity.id,visited:false});}
   }
  }finally{
   for(const [element,open]of details)if(element.isConnected)element.open=open;
   for(const [element,value]of signals)if(element.isConnected){if(value===null)element.removeAttribute('data-signal-ready');else element.setAttribute('data-signal-ready',value);}
   window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:originalHash.slice(1)||'acasa'}));await settle();
  }
  const canvasInventory=[...document.querySelectorAll('canvas')].map(e=>({id:e.id||nodeKey(e),visible:visible(e),observed:inspected.has(e.id||nodeKey(e))}));
  const pending=canvasInventory.filter(c=>!c.observed).map(c=>c.id);
  const failures=results.flatMap(r=>[
   ...r.canvases.filter(c=>c.invalid||c.sharp===false).map(c=>({route:r.route,id:c.id,type:'canvas',reason:c.invalid?'invalid dimensions':'undersampled'})),
   ...r.images.filter(i=>i.invalid||i.undersampled).map(i=>({route:r.route,id:i.id,type:i.type,reason:i.invalid?'invalid dimensions or unloaded':'undersampled'})),
   ...r.vectors.filter(v=>v.invalid).map(v=>({route:r.route,id:v.id,type:'svg',reason:'invalid dimensions'}))
  ]);
  if(pending.length)failures.push({type:'coverage',reason:'Wave canvases were never displayed',pending});
  if(errors.length)failures.push({type:'coverage',reason:'Wave destinations were inaccessible',errors});
  return {url:location.href,language:document.documentElement.lang,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,policyAvailable:!!window.PraxisCanvasResolution,states:results.length,sections:sections.length,activities:activities.length,complete:!pending.length&&!errors.length,capped:false,pending,navigation,skipped:[],errors,failures,canvasInventory,results,inspection:{disclosures:details.size,idleInstrumentSurfaces:signals.size,note:'Idle waveform surfaces were temporarily revealed without starting audio or simulations; attributes and disclosures restored.'}};
 }
 window.PraxisWaveResolutionAudit={run};
})();
