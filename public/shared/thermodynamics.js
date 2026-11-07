/* Integration: one header, shared sound and a complete searchable table of contents. */
(() => {
 const menu=document.getElementById('menuBtn'),actions=document.querySelector('.praxis-lab-actions');
 const translateMenu=()=>{const label=menu?.querySelector('.lbl');if(label)label.textContent=window.PraxisI18n.tr('Cuprins');};
 translateMenu();window.addEventListener('praxis-language-change',translateMenu);
 if(menu&&actions){menu.className='button secondary';actions.insertBefore(menu,actions.querySelector('[data-praxis-sound]'));}
 const nativeSound=document.getElementById('soundBtn');if(nativeSound)nativeSound.hidden=true;
 for(const sim of ALL){
  const buttons=[...sim.fig.querySelectorAll('[data-mode],[data-t]')];
  const sync=()=>buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('on'))));
  sync();buttons.forEach(button=>button.addEventListener('click',sync));
  sim.cv.forEach(canvas=>{canvas.setAttribute('role','img');canvas.setAttribute('aria-label',sim.fig.querySelector('.fig-h b')?.textContent||'Simulare termodinamică');});
 }
 // Topics are mounted once; tab changes preserve inputs, quiz answers and simulations.
 const main=document.querySelector('#praxis-original .layout>main');
 const nav=document.querySelector('.praxis-lab-nav');
 const definitions=[
  ['matter','Structura substanței',['s0','s1','s2','s3']],
  ['systems','Sisteme și procese',['s4','s5','s6','s7']],
  ['heat','Căldură și temperatură',['s8','s9','s10','s11']],
  ['summary','Recapitulare',['s13']],
  ['quiz','Test',['s14']],['problems','Probleme',['s15']],['resources','Resurse',['s16']]
 ];
 const primary=document.createElement('div');primary.className='tabs thermo-tabs';primary.setAttribute('role','tablist');primary.setAttribute('aria-label','Secțiunea lecției');nav.append(primary);
 const groups=[],topics=new Map();let active='';
 function buttonFor(id,title,controls){
  const button=document.createElement('button');button.id=id;button.type='button';button.className='tab';button.setAttribute('role','tab');button.setAttribute('aria-controls',controls);button.textContent=title;return button;
 }
 for(const [id,title,ids]of definitions){
  const group={id,ids,last:ids[0]},panel=document.createElement('div');panel.id='thermo-panel-'+id;panel.className='thermo-topic-group';panel.setAttribute('role','tabpanel');
  const button=buttonFor('thermo-tab-'+id,title,panel.id);panel.setAttribute('aria-labelledby',button.id);group.button=button;group.panel=panel;
  primary.append(button);main.append(panel);
  const secondary=document.createElement('div');secondary.className='tabs thermo-subtabs';secondary.setAttribute('role','tablist');secondary.setAttribute('aria-label',title);
  if(ids.length>1)panel.append(secondary);
  for(const sectionId of ids){
   const section=document.getElementById(sectionId),option=document.querySelector('.praxis-course-sections option[value="'+sectionId+'"]');
   const title=section.dataset.thermoTitle||option?.textContent||section.querySelector('h2').textContent;
   const topic={section,group};topics.set(sectionId,topic);panel.append(section);
   if(ids.length>1){const child=buttonFor('thermo-tab-'+sectionId,title,sectionId);topic.button=child;secondary.append(child);section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',child.id);child.addEventListener('click',()=>select(sectionId));}
  }
  button.addEventListener('click',()=>select(group.last));groups.push(group);
 }
 function select(id,{scroll=true,updateHash=true}={}){
  const topic=topics.get(id);if(!topic)return;active=id;topic.group.last=id;
  for(const group of groups){const selected=group===topic.group;group.panel.hidden=!selected;group.button.setAttribute('aria-selected',String(selected));group.button.tabIndex=selected?0:-1;}
  for(const [key,item]of topics){const selected=key===id;item.section.hidden=!selected;if(item.button){item.button.setAttribute('aria-selected',String(selected));item.button.tabIndex=selected?0:-1;}}
  const selector=document.querySelector('.praxis-course-sections');if(selector)selector.value=id;
  for(const sim of ALL){
   if(!topic.section.contains(sim.fig)){sim.vis=false;cancelAnimationFrame(sim.raf);sim.raf=null;sim.onHide?.();}
  }
  if(updateHash)history.replaceState(null,'','#'+id);
  requestAnimationFrame(()=>{for(const sim of ALL)if(topic.section.contains(sim.fig))sim.resize();});
  if(scroll)nav.scrollIntoView({block:'start',behavior:'instant'});
 }
 function selectTarget(target){const section=target?.closest('section.sec');if(section)select(section.id,{scroll:false,updateHash:false});}
 // Reveal a destination before the original contents/search navigation scrolls to it.
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const id=link.hash.slice(1);if(id==='top')select('s0',{scroll:false,updateHash:false});else selectTarget(document.getElementById(id));},true);
 document.querySelector('.praxis-course-sections')?.addEventListener('change',event=>select(event.target.value));
 window.addEventListener('hashchange',()=>selectTarget(document.getElementById(location.hash.slice(1))));
 for(const list of [primary,...main.querySelectorAll('.thermo-subtabs')])list.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||event.target.getAttribute('role')!=='tab')return;
  const buttons=[...list.querySelectorAll('[role=tab]')],index=buttons.indexOf(event.target);event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();
 });
 const destination=document.getElementById(location.hash.slice(1));select(destination?.closest('section.sec')?.id||'s0',{scroll:false,updateHash:false});
 window.PraxisThermodynamicsTabs={select,reveal:selectTarget,get activeSection(){return active;}};
 window.PraxisI18n.apply(nav);main.querySelectorAll('.thermo-subtabs').forEach(list=>window.PraxisI18n.apply(list));
})();
