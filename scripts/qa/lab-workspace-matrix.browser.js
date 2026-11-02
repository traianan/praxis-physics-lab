/* Same-origin iframe audit: exact CSS sizes, independent of host window limits.
   Run from a served application page. Never ship this file to public/. */
async ({from=0,to=19,deep=false}={}) => {
 const {simulations}=await import('/catalog.js');
 const settle=w=>new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));
 const output=[];
 for(const simulation of simulations.slice(from,to)){
  const frame=document.createElement('iframe');frame.style.cssText='position:fixed;left:0;top:0;z-index:-1;width:1920px;height:1080px;border:0';
  document.body.append(frame);
  try{
   await new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=reject;frame.src=new URL(simulation.href,location.origin).href;});
   const w=frame.contentWindow,d=frame.contentDocument;
   await new Promise(r=>setTimeout(r,250));await settle(w);
   const report={id:simulation.id,mounted:d.body.dataset.praxisWorkspace,groups:0,states:0,issues:[],sizes:[]};
   const scan=label=>{
    report.states++;
    if(d.documentElement.scrollWidth>w.innerWidth+1)report.issues.push({label,kind:'page-overflow',width:d.documentElement.scrollWidth,viewport:w.innerWidth});
    for(const nav of d.querySelectorAll('.praxis-workspace-activities')){
     if(nav.querySelectorAll('[aria-pressed=true]').length!==1)report.issues.push({label,kind:'activity-selection'});
    }
    if(w.innerWidth>=1050)for(const figure of d.querySelectorAll('[data-workspace-figure]')){
     const canvas=figure.querySelector(':scope>canvas'),panel=figure.querySelector('.praxis-workspace-figure-controls');
     if(canvas?.getClientRects().length&&panel?.getClientRects().length&&Math.abs(canvas.getBoundingClientRect().top-panel.getBoundingClientRect().top)>2)report.issues.push({label,kind:'figure-controls-not-aligned',id:figure.id});
    }
   };
   if(!report.mounted)report.issues.push({kind:'not-mounted'});
   const config=w.PraxisLabWorkspaceConfig?.[simulation.id];
   for(const entry of config?.workspaces||[]){
    if(!d.querySelector(entry.selector))report.issues.push({kind:'selector-missing',selector:entry.selector});
    for(const role of ['controls','scene','graphs'])if(entry[role]&&![...d.querySelectorAll(entry.selector)].some(group=>group.querySelector(entry[role])))report.issues.push({kind:'role-missing',selector:entry.selector,role});
   }
   report.groups=d.querySelectorAll('[data-workspace-layout]').length;
   const inputs=[...d.querySelectorAll('input')].map(e=>[e,e.value,e.checked]);
   const count=d.querySelectorAll('.praxis-workspace-activities,.praxis-workspace-disclosure').length;
   w.PraxisLabWorkspace?.mount();w.PraxisLabWorkspace?.mount();
   if(count!==d.querySelectorAll('.praxis-workspace-activities,.praxis-workspace-disclosure').length)report.issues.push({kind:'not-idempotent'});
   if(inputs.some(([e,v,c])=>!e.isConnected||e.value!==v||e.checked!==c))report.issues.push({kind:'mount-reset'});
   for(const [width,height]of [[3840,2160],[1920,1080],[1366,768],[1024,768],[390,844]]){
    frame.style.width=width+'px';frame.style.height=height+'px';await settle(w);
    for(const lang of ['ro','en']){
     await w.PraxisI18n?.setLanguage(lang);await settle(w);
     for(const size of [100,200]){
      d.documentElement.style.fontSize=(16*size/100)+'px';w.dispatchEvent(new w.Event('resize'));await settle(w);
      scan(`${width}x${height}/${lang}/${size}%`);
     }
    }
    report.sizes.push([w.innerWidth,w.innerHeight]);
   }
   frame.style.width='1920px';frame.style.height='1080px';d.documentElement.style.fontSize='16px';await w.PraxisI18n?.setLanguage('ro');await settle(w);
   // Exercise native section navigation and common activity groups without
   // starting all animations or changing scientific input values.
   const visible=e=>e.isConnected&&e.getClientRects().length&&w.getComputedStyle(e).visibility!=='hidden';
   const subs=async()=>{
    for(const sub of [...d.querySelectorAll('.praxis-workspace-activities button,.lesson-parts button,.thermo-subtabs button,.engine-subtabs button,.lab-nav button')]){
     if(!visible(sub))continue;sub.click();await settle(w);scan(sub.textContent.trim().slice(0,60));
    }
   };
   const visit=async()=>{
   const sectionSelect=d.querySelector('.praxis-course-sections');
   if(sectionSelect&&visible(sectionSelect))for(const option of [...sectionSelect.options]){sectionSelect.value=option.value;sectionSelect.dispatchEvent(new w.Event('change',{bubbles:true}));await settle(w);scan('Section: '+option.text);await subs();}
   for(const button of [...d.querySelectorAll('.praxis-lab-nav .tabs .tab,.praxis-lab-nav .tabs button,.praxis-lab-nav .module-tabs button,.lesson-tabs [role=tab]')]){
    if(!visible(button))continue;button.click();await settle(w);scan(button.textContent.trim().slice(0,60));
    await subs();
    for(const topic of [...d.querySelectorAll('.lesson-topics [role=tab]')]){if(!visible(topic))continue;topic.click();await settle(w);scan(topic.textContent.trim().slice(0,60));await subs();}
   }
   };
   if(deep){
    for(const [width,height]of [[1920,1080],[1024,768]])for(const lang of ['ro','en'])for(const size of [100,200]){
     frame.style.width=width+'px';frame.style.height=height+'px';await w.PraxisI18n?.setLanguage(lang);d.documentElement.style.fontSize=16*size/100+'px';w.dispatchEvent(new w.Event('resize'));await settle(w);await visit();
    }
   }else await visit();
   output.push(report);
  }catch(error){output.push({id:simulation.id,error:String(error)});}
  finally{frame.remove();}
 }
 return output;
}
