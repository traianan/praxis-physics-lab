/* Keep all original vector lesson nodes and state; show one subject at a time. */
(() => {
 const root=document.getElementById('praxis-original'),nav=document.querySelector('.praxis-lab-nav'),main=root.querySelector('.layout>main');
 const groups=[
  {id:'basics',title:'Bazele vectorilor',ids:['s1','s2']},
  {id:'operations',title:'Operații cu vectori',ids:['s3','s4','s5','s6','s7']},
  {id:'products',title:'Produse de vectori',ids:['s8','s9','s10']},
  {id:'calculator',title:'Calculator',ids:['s11']},
  {id:'summary',title:'Fișă recapitulativă',ids:['s12']},
  {id:'quiz',title:'Test',ids:['s13']},
  {id:'resources',title:'Resurse',ids:['s14']}
 ];
 const titles=new Map([...root.querySelectorAll('.toc a[href^="#s"]')].map(link=>[link.hash.slice(1),link.textContent.trim().replace(/^\d+\s*/, '')]));
 const primary=document.createElement('div');primary.className='tabs vector-tabs';primary.setAttribute('role','tablist');primary.setAttribute('aria-label','Secțiunea lecției');
 const topics=new Map();
 function button(title,id){const b=document.createElement('button');b.type='button';b.className='tab';b.id=id;b.textContent=title;b.setAttribute('role','tab');return b;}
 for(const group of groups){
  group.last=group.ids[0];group.button=button(group.title,'vector-tab-'+group.id);
  group.panel=document.createElement('div');group.panel.id='vector-panel-'+group.id;group.panel.className='vector-topic-panel';group.panel.setAttribute('role','tabpanel');group.panel.setAttribute('aria-labelledby',group.button.id);group.button.setAttribute('aria-controls',group.panel.id);
  const secondary=document.createElement('div');secondary.className='tabs vector-subtabs';secondary.setAttribute('role','tablist');secondary.setAttribute('aria-label',group.title);
  if(group.ids.length>1)group.panel.append(secondary);
  for(const id of group.ids){
   const section=document.getElementById(id),tab=group.ids.length>1?button(titles.get(id),'vector-subtab-'+id):null;
   if(tab){tab.setAttribute('aria-controls',id);section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',tab.id);tab.addEventListener('click',()=>select(id));secondary.append(tab);}
   topics.set(id,{section,tab,group});group.panel.append(section);
  }
  group.button.addEventListener('click',()=>select(group.last));primary.append(group.button);main.append(group.panel);
 }
 nav.replaceChildren(primary);
 function resolve(hash){const id=hash.replace(/^#/,'');if(topics.has(id))return id;return document.getElementById(id)?.closest('section.sec')?.id;}
 function select(id,{historyMode='push',scroll=false}={}){
  const item=topics.get(id);if(!item)return;item.group.last=id;
  for(const group of groups){const active=group===item.group;group.panel.hidden=!active;group.button.setAttribute('aria-selected',String(active));group.button.tabIndex=active?0:-1;}
  for(const [key,topic]of topics){const active=key===id;topic.section.hidden=!active;if(topic.tab){topic.tab.setAttribute('aria-selected',String(active));topic.tab.tabIndex=active?0:-1;}}
  for(const run of window.PraxisVectorRunners||[])if(run.section?.hidden)run.cancel();
  if(typeof ALL!=='undefined')for(const view of ALL){
   if(view.c.closest('section.sec')?.hidden){if(view.raf){cancelAnimationFrame(view.raf);view.raf=null;}if('vis'in view)view.vis=false;view.drag=null;view.dragging=null;}
   else view.resize();
  }
  if(historyMode!=='none'&&location.hash!=='#'+id)history[historyMode+'State'](null,'','#'+id);
  window.PraxisSound.stopAll();
  window.dispatchEvent(new CustomEvent('praxis-vector-section-change',{detail:{id}}));
  if(scroll)nav.scrollIntoView({block:'start',behavior:'instant'});
 }
 function route(){select(resolve(location.hash)||'s1',{historyMode:'none',scroll:true});}
 window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link||!root.contains(link))return;const id=resolve(link.hash);if(!id)return;
  event.preventDefault();select(id,{scroll:true});if(link.hash!=='#'+id)document.getElementById(link.hash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'});
 });
 for(const list of [primary,...main.querySelectorAll('.vector-subtabs')])list.addEventListener('keydown',event=>{
  const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key)||!event.target.matches('[role=tab]'))return;
  event.preventDefault();const buttons=[...list.querySelectorAll('[role=tab]')],index=buttons.indexOf(event.target),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;
  buttons[next].focus();buttons[next].click();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const run of window.PraxisVectorRunners||[])run.cancel();});
 window.PraxisI18n.apply(nav);route();
})();
