/* Semantic corrections shared by web and self-contained lesson exports. */
(() => {
 function mount(){
  const id=document.body.dataset.praxisCourse;
  const headings={
   condensatorul:['h3[data-content-type="diagram"]',2],
   'miscarea-rectilinie':['.block-head h3,.pb-title',2],
   'principiul-i-al-termodinamicii':['.interactive .sim-panel h4',3],
   'interactii-atomice':['#pairs>h3',2],
   'transformari-stare-agregare':['h4[data-i18n="home.state.solid"]',3],
   'oscilator-mecanic':['h4[data-content-type="simulation"],.demo-head h4',3],
   'pendulul-gravitational':['.stage-h h3',2]
  };
  if(headings[id]){const [selector,level]=headings[id];document.querySelectorAll(selector).forEach(el=>el.setAttribute('aria-level',String(level)));}
  const en=window.PraxisI18n?.language==='en';
  const sectionNav=document.querySelector('.praxis-lab-nav');
  if(sectionNav)sectionNav.setAttribute('aria-label',en?'Laboratory section selector':'Selectorul secțiunilor laboratorului');
  document.querySelectorAll('#praxis-original header.hero').forEach(el=>el.setAttribute('role','presentation'));
  if(id==='calcul-vectorial'){
   document.querySelectorAll('#praxis-original section.hero').forEach(el=>{el.setAttribute('role','region');el.setAttribute('aria-label',en?'Introduction':'Introducere');});
   document.querySelectorAll('input[data-c]').forEach(el=>{const key=el.dataset.c;el.setAttribute('aria-label',key==='k'?'k':en?`Vector ${key[0]}, component ${key[1]}`:`Vector ${key[0]}, componenta ${key[1]}`);});
   document.querySelectorAll('button[data-act="reset"]').forEach(el=>{if(!el.textContent.trim())el.setAttribute('aria-label',en?'Reset':'Resetează');});
   document.querySelectorAll('[data-i]>h4').forEach(el=>el.setAttribute('aria-level','3'));
  }
  if(id==='viteza-si-acceleratia'){
   document.querySelectorAll('.control-group h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('aside>.control-group:first-child>h4').forEach(el=>el.setAttribute('aria-level','2'));
   const mode=document.getElementById('curv-mode-select'),heading=mode?.parentElement.querySelector('h4');
   if(mode&&heading){heading.id='curvilinear-mode-heading';mode.setAttribute('aria-labelledby',heading.id);}
  }
  if(['notiuni-termodinamice','calorimetrie','motoare-termice','oscilatori-mecanici-cuplati'].includes(id))document.querySelectorAll('.q h4,.pb h4').forEach(el=>el.setAttribute('aria-level','3'));
  if(id==='principiul-i-al-termodinamicii')document.querySelectorAll('.calc-card h4,.graph-panel h4').forEach(el=>el.setAttribute('aria-level','3'));
  if(id==='pendulul-gravitational'){
   document.querySelectorAll('#praxis-original h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('#praxis-original aside>h4').forEach(el=>el.setAttribute('aria-level','2'));
  }
  document.querySelectorAll('.energy-split[aria-label]').forEach(el=>el.setAttribute('role','img'));
  if(id==='condensatorul'){
   document.querySelectorAll('.side-card h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('.toc h4').forEach(el=>el.setAttribute('aria-level','2'));
  }
  if(id==='miscarea-rectilinie'){
   document.querySelectorAll('#praxis-original h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('.calc-field').forEach(field=>{const label=field.querySelector('label'),input=field.querySelector('input[id]');if(label&&input)label.htmlFor=input.id;});
   const actionHeading=document.querySelector('#uv-cases thead th:last-child');
   if(actionHeading&&!actionHeading.textContent.trim())actionHeading.textContent=window.PraxisI18n?.language==='en'?'Action':'Acțiune';
  }
  document.querySelectorAll('select[title]:not([aria-label]):not([aria-labelledby])').forEach(el=>{if(!el.closest('#root,[data-reactroot]')&&!el.labels?.length)el.setAttribute('aria-label',el.title);});
  document.querySelectorAll('th[data-science-source]').forEach(el=>el.setAttribute('aria-label',el.dataset.scienceSource));
  document.querySelectorAll('th:has(math):not([aria-label])').forEach(el=>{if(el.closest('#root,[data-reactroot]'))return;const source=el.querySelector('annotation')?.textContent||el.querySelector('math')?.textContent;if(source?.trim())el.setAttribute('aria-label',source.trim());});
  document.querySelectorAll('.science-math .wave-math-item,.table-wrap,.sim-frame').forEach(el=>{
   if(el.closest('#root,[data-reactroot]'))return;
   if(el.clientWidth>0&&el.scrollWidth>el.clientWidth+1){
    el.dataset.accessibleScroll='';el.tabIndex=0;el.setAttribute('role','group');
    el.setAttribute('aria-label',en?'Content with horizontal scrolling':'Conținut cu derulare orizontală');
   }else if(el.hasAttribute('data-accessible-scroll')){
    el.removeAttribute('data-accessible-scroll');el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');
   }
  });
  document.querySelectorAll('.pn a.disabled').forEach(el=>{el.setAttribute('aria-disabled','true');el.tabIndex=-1;});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 window.addEventListener('load',mount);
 window.addEventListener('praxis-language-change',mount);
 window.addEventListener('resize',mount);
 let scheduled=false;
 const observer=new MutationObserver(records=>{
  if(scheduled||!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1)))return;
  scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
 // Arrow keys follow the standard tablist pattern; native buttons retain Enter/Space.
 document.addEventListener('keydown',event=>{
  if(event.defaultPrevented)return;
  const tab=event.target.closest?.('[role="tab"]'),list=tab?.closest('[role="tablist"]');
  if(!list||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  const vertical=list.getAttribute('aria-orientation')==='vertical';
  if((vertical&&['ArrowLeft','ArrowRight'].includes(event.key))||(!vertical&&['ArrowUp','ArrowDown'].includes(event.key)))return;
  const tabs=[...list.querySelectorAll('[role="tab"]')].filter(el=>!el.disabled&&el.getAttribute('aria-disabled')!=='true'&&el.checkVisibility());
  const at=tabs.indexOf(tab);if(at<0)return;
  const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(at+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+tabs.length)%tabs.length;
  event.preventDefault();tabs[index].focus();tabs[index].click();
 });
})();
