/* Connect the imported lesson to the same preferences and scientific roles as all Praxis labs. */
(() => {
 function sound(){Sound.on=PraxisSound.enabled&&!document.hidden;}
 function palette(){const p=PraxisScientificColors.palette(PraxisCourseLocalization.colors);for(const [key,role]of Object.entries({accent:'blue',accent2:'blue',gold:'orange',cyan:'teal',violet:'purple',green:'green',red:'red',ice:'blue',ether:'teal'})){Sims.colors[key]=p[role];document.documentElement.style.setProperty('--'+(key==='accent2'?'accent-2':key),p[role]);}Object.assign(Sims.colors,{text:'#253f46',bright:'#1d3339',grid:'#d5e0dc',axis:'#526970',fill:p.blue+'26',fillGold:p.orange+'26'});const zoom=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;for(const canvas of document.querySelectorAll('canvas'))canvas.style.minWidth=+(canvas.dataset.logicalWidth||canvas.getAttribute('width'))*zoom+'px';Sims.frame(0);}
 function historyLabels(){const history=document.querySelector('.liquefaction-history table');if(history){const headers=[...history.querySelectorAll('thead th')].map(cell=>cell.textContent);for(const row of history.querySelectorAll('tbody tr'))[...row.children].forEach((cell,i)=>cell.dataset.label=headers[i]);}}
 document.addEventListener('languagechange',historyLabels);
 function language(){I18N.set(PraxisI18n.language);MathJ.typeset(document.getElementById('praxis-original'));historyLabels();for(const canvas of document.querySelectorAll('canvas'))canvas.setAttribute('aria-label',canvas.closest('.demo')?.querySelector('h3')?.textContent||'Diagramă de schimbare de fază');}
 function syncBoiling(){
  const s=Sims.get('fierb'),heat=s.mode==='heat',group=document.getElementById('boilHeatingControls');if(!group)return;group.hidden=!heat;
  for(const button of document.querySelectorAll('[data-boil-mode]')){const selected=button.dataset.boilMode===s.mode;button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));}
  const pull=document.getElementById('fieSyringe'),push=document.getElementById('boilPush'),run=document.getElementById('boilRun');pull.hidden=heat;push.hidden=heat;pull.disabled=s.pulled;push.disabled=!s.pulled;
  const runText=I18N.t(s.running?'ui.pause':'ui.run');if(run.textContent!==runText)run.textContent=runText;run.setAttribute('aria-pressed',String(s.running));
  document.getElementById('boilThresholdLegend').hidden=!heat;
  const events=document.getElementById('boilEvents'),signature=JSON.stringify([I18N.lang,s.events]);if(events.dataset.signature!==signature){events.dataset.signature=signature;events.replaceChildren(...s.events.slice(-6).map(event=>{const li=document.createElement('li');li.textContent=I18N.t(event.key)+' · '+Util.num(event.t,1)+' s';return li;}));events.hidden=!s.events.length;}events.setAttribute('aria-label',I18N.t('boil.events'));
 }
 window.PraxisBoilingUI={sync:syncBoiling};
 // The paired vacuum/boiling instruments are independent activities. Keep their
 // existing nodes, models and handlers while showing one complete stand at a time.
 const phaseGroups=[];
 function syncPhaseActivities(){for(const group of phaseGroups)for(const [index,item]of group.items.entries()){
  const selected=index===group.selected;item.hidden=!selected;group.buttons[index].setAttribute('aria-pressed',String(selected));
  for(const canvas of item.querySelectorAll('canvas'))Sims.show(canvas.id.replace('Canvas',''),selected&&!item.closest('.view').hidden);
 }}
 function mountPhaseActivities(){
  for(const demo of document.querySelectorAll('.demo:has(>.phase-experiment)')){
   if(demo.dataset.phaseActivities!==undefined)continue;demo.dataset.phaseActivities='';
   const items=[...demo.querySelectorAll(':scope>.phase-experiment')],nav=document.createElement('nav'),group={items,selected:0,buttons:[]};
   nav.className='phase-activities praxis-workspace-activities';nav.setAttribute('aria-label',PraxisI18n.tr('Activități'));
   items.forEach((item,index)=>{
    const heading=item.querySelector('h3'),button=document.createElement('button');button.type='button';button.className='btn small';button.dataset.i18n=heading.dataset.i18n;button.textContent=heading.textContent;
    button.addEventListener('click',()=>{group.selected=index;syncPhaseActivities();Sims.frame(0);window.dispatchEvent(new Event('resize'));});nav.append(button);group.buttons.push(button);
    const scene=item.querySelector(':scope>.sim-frame'),controls=document.createElement('div');controls.className='praxis-workspace-demo-controls';
    const notes=[...item.children].filter(el=>el.matches('.demo-hint,.model-note,.boil-model-details'));
    if(notes.length){const details=document.createElement('details'),summary=document.createElement('summary');details.className='phase-experiment-notes';summary.dataset.phaseNotes='';summary.textContent=PraxisI18n.tr('Explicații și formule');details.append(summary,...notes);item.append(details);}
    controls.append(...[...item.children].filter(el=>!el.matches('h3,.sim-frame,.phase-legend,details')));item.append(controls);item.dataset.workspaceDemo='';
    if(scene)scene.dataset.phaseScene='';
   });
   demo.prepend(nav);phaseGroups.push(group);
  }
  const melting=document.getElementById('view-topire'),stands=[...melting.querySelectorAll(':scope>.grid-2')];
  if(stands.length>1&&!melting.querySelector(':scope>.phase-activities')){
   const nav=document.createElement('nav'),group={items:stands,selected:0,buttons:[]};nav.className='phase-activities praxis-workspace-activities';nav.setAttribute('aria-label',PraxisI18n.tr('Activități'));
   stands.forEach((stand,index)=>{stand.dataset.phaseStand='';const heading=stand.querySelector('.demo h3'),button=document.createElement('button');button.type='button';button.className='btn small';button.dataset.i18n=heading.dataset.i18n;button.textContent=heading.textContent;button.addEventListener('click',()=>{group.selected=index;syncPhaseActivities();Sims.frame(0);window.dispatchEvent(new Event('resize'));});nav.append(button);group.buttons.push(button);});stands[0].before(nav);phaseGroups.push(group);
  }
  const andrews=document.getElementById('andrewsCanvas');andrews.dataset.logicalWidth='1000';andrews.dataset.logicalHeight='600';andrews.style.minWidth=1000*(parseFloat(getComputedStyle(document.documentElement).fontSize)/16)+'px';
  // A lesson introduction is reading material; keep it available in the same
  // disclosure as the surrounding prose instead of above the instrument.
  for(const view of document.querySelectorAll('.view')){const lead=view.querySelector(':scope>.sec-head>.sec-lead'),prose=view.querySelector('.prose');if(lead&&prose)prose.prepend(lead);}
  syncPhaseActivities();
 }
 document.addEventListener('click',event=>{if(event.target.closest('[data-nav]'))queueMicrotask(syncPhaseActivities);});
 window.addEventListener('hashchange',()=>queueMicrotask(syncPhaseActivities));
 window.addEventListener('praxis-language-change',()=>{for(const nav of document.querySelectorAll('.phase-activities'))nav.setAttribute('aria-label',PraxisI18n.tr('Activități'));for(const summary of document.querySelectorAll('[data-phase-notes]'))summary.textContent=PraxisI18n.tr('Explicații și formule');});
 function wireBoiling(){
  const s=Sims.get('fierb');const controls=()=>{for(const [id,value]of [['fieP',s.pSet],['fieQ',s.q]]){const input=document.getElementById(id);input.value=value;Util.paint(input);input.dispatchEvent(new Event('input',{bubbles:true}));}};for(const button of document.querySelectorAll('[data-boil-mode]'))button.addEventListener('click',()=>{s.prepare(button.dataset.boilMode);controls();syncBoiling();Sims.frame(0);});
  document.getElementById('boilPush').addEventListener('click',()=>{s.push();syncBoiling();Sims.frame(0);});document.getElementById('boilRun').addEventListener('click',()=>{s.running=!s.running;s.report();syncBoiling();Sims.frame(0);});
  for(const id of ['fieSyringe','fieReset'])document.getElementById(id).addEventListener('click',()=>{if(id==='fieReset')controls();syncBoiling();Sims.frame(0);});syncBoiling();
 }
 window.addEventListener('praxis-language-change',language);window.addEventListener('praxis-sound-change',sound);document.addEventListener('visibilitychange',sound);window.addEventListener('praxis-course-presentation-change',palette);window.addEventListener('resize',()=>Sims.frame(0));
 function start(){sound();language();palette();wireBoiling();mountPhaseActivities();const top=document.getElementById('toTop'),extra=document.querySelector('.praxis-site-extra');if(top&&extra)extra.append(top);for(const canvas of document.querySelectorAll('canvas')){canvas.setAttribute('role','img');canvas.setAttribute('aria-label',canvas.closest('.demo')?.querySelector('h3')?.textContent||'Diagramă de schimbare de fază');}document.addEventListener('click',event=>{if(event.target.closest('[data-all]'))document.querySelectorAll('.step-head').forEach(button=>button.setAttribute('aria-expanded',String(button.closest('li').classList.contains('open'))));});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
