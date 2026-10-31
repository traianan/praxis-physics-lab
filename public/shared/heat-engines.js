/* Keep the lesson route and the shared four-stroke engine in the same mode. */
window.PraxisHeatEngineNavigation={create({engine,compression,ottoHost,dieselHost,select}){
 let synchronising=false;
 const changeMode=(sim,mode)=>{if(sim&&sim.mode!==mode)sim.fig.querySelector('[data-mode="'+mode+'"]')?.click();};
 for(const sim of [engine,compression]){const originalMode=sim.onMode;sim.onMode=function(mode){originalMode?.call(sim,mode);if(!synchronising)select(mode==='diesel'?'s4':'s3');};}
 return {sync(section){
  if(section!=='s3'&&section!=='s4')return;
  const mode=section==='s4'?'diesel':'otto',host=mode==='diesel'?dieselHost:ottoHost;
  synchronising=true;
  try{
   changeMode(engine,mode);changeMode(compression,mode);
   if(engine.fig.parentElement!==host||compression.fig.parentElement!==host||engine.fig.nextElementSibling!==compression.fig){host.prepend(compression.fig);host.prepend(engine.fig);}
  }
  finally{synchronising=false;}
 }};
}};
/* Mount each topic once so navigation preserves animation state and answers. */
(() => {
 const menu=document.getElementById('menuBtn'),actions=document.querySelector('.praxis-lab-actions');
 if(menu&&actions){menu.className='button secondary';actions.prepend(menu);}
 document.getElementById('soundBtn').hidden=true;
 const main=document.querySelector('.engine-content'),nav=document.querySelector('.praxis-lab-nav');
 const primary=document.createElement('div');primary.className='tabs engine-tabs';primary.setAttribute('role','tablist');primary.setAttribute('aria-label','Secțiunea lecției');nav.prepend(primary);
 const definitions=[['intro','Introducere',['top','s1','s2']],['engines','Motoare în patru timpi',['s3','s4']],['cooling','Mașini frigorifice',['s5']],['cycles','Cicluri ideale',['s6','s7','s8','s9']],['summary','Glosar',['s11']],['quiz','Test',['s12']],['problems','Probleme',['s13']],['resources','Resurse',['s14']]];
 const groups=[],topics=new Map();let active='';
 const engine=ALL.find(sim=>sim.fig.id==='fig3'),compression=ALL.find(sim=>sim.fig.id==='fig4');
 const engineNavigation=window.PraxisHeatEngineNavigation.create({engine,compression,ottoHost:engine.fig.parentElement,dieselHost:compression.fig.parentElement,select:id=>select(id)});
 function makeTab(id,title,controls){const b=document.createElement('button');b.type='button';b.id=id;b.className='tab';b.setAttribute('role','tab');b.setAttribute('aria-controls',controls);b.textContent=title;return b;}
 for(const [id,title,ids]of definitions){
  const panel=document.createElement('div');panel.id='engine-panel-'+id;panel.setAttribute('role','tabpanel');
  const button=makeTab('engine-tab-'+id,title,panel.id),group={panel,button,ids,last:ids[0]};groups.push(group);panel.setAttribute('aria-labelledby',button.id);primary.append(button);main.append(panel);
  const secondary=document.createElement('div');secondary.className='tabs engine-subtabs';secondary.setAttribute('role','tablist');secondary.setAttribute('aria-label',title);if(ids.length>1)panel.append(secondary);
  for(const sectionId of ids){const section=document.getElementById(sectionId),topic={section,group};topics.set(sectionId,topic);panel.append(section);
   if(ids.length>1){const child=makeTab('engine-tab-'+sectionId,section.dataset.engineTitle,sectionId);secondary.append(child);topic.button=child;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',child.id);child.addEventListener('click',()=>select(sectionId));}
  }
  button.addEventListener('click',()=>select(group.last));
 }
 function select(id,{scroll=true,updateHash=true}={}){
  const topic=topics.get(id);if(!topic)return;engineNavigation.sync(id);active=id;topic.group.last=id;
  for(const group of groups){const on=group===topic.group;group.panel.hidden=!on;group.button.setAttribute('aria-selected',String(on));group.button.tabIndex=on?0:-1;}
  for(const [key,item]of topics){const on=key===id;item.section.hidden=!on;if(item.button){item.button.setAttribute('aria-selected',String(on));item.button.tabIndex=on?0:-1;}}
  const selector=document.querySelector('.praxis-course-sections');if(selector)selector.value=id;
  for(const sim of ALL)if(!topic.section.contains(sim.fig)){sim.vis=false;cancelAnimationFrame(sim.raf);sim.raf=null;sim.onHide?.();}
  if(updateHash)history.replaceState(null,'','#'+id);
  requestAnimationFrame(()=>ALL.filter(sim=>topic.section.contains(sim.fig)).forEach(sim=>sim.resize()));
  if(scroll)nav.scrollIntoView({block:'start',behavior:'instant'});
 }
 function reveal(el){const section=el?.closest('.sec');if(section)select(section.id,{scroll:false,updateHash:false});}
 document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(a)reveal(document.getElementById(a.hash.slice(1)));},true);
 document.querySelector('.praxis-course-sections').addEventListener('change',event=>select(event.target.value));
 window.addEventListener('hashchange',()=>reveal(document.getElementById(location.hash.slice(1))));
 for(const list of [primary,...main.querySelectorAll('.engine-subtabs')])list.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||event.target.getAttribute('role')!=='tab')return;const buttons=[...list.querySelectorAll('[role=tab]')],index=buttons.indexOf(event.target),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;event.preventDefault();buttons[next].click();buttons[next].focus();});
 for(const sim of ALL){
  if(sim.fig.id==='fig6'){
   const note=sim.fig.querySelector('.carnot-schematic-note'),originalToggle=sim.onToggle;
   sim.onToggle=(key,value)=>{originalToggle?.(key,value);if(key==='scale'&&note)note.hidden=value;};
  }
  const buttons=[...sim.fig.querySelectorAll('[data-mode],[data-t]')],sync=()=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('on'))));sync();buttons.forEach(b=>b.addEventListener('click',sync));
  sim.cv.forEach(c=>{c.setAttribute('role','img');c.setAttribute('aria-label',sim.fig.querySelector('.fig-h b')?.textContent||'Diagramă termodinamică');});
 }
 window.PraxisHeatEnginesTabs={select,reveal,get activeSection(){return active;}};
 const destination=document.getElementById(location.hash.slice(1));select(destination?.closest('.sec')?.id||'top',{scroll:false,updateHash:false});
 window.PraxisI18n.apply(nav);main.querySelectorAll('.engine-subtabs').forEach(list=>window.PraxisI18n.apply(list));
})();
