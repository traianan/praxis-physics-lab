/* Shared presentation only. Keep scientific nodes, listeners and state alive. */
(() => {
 'use strict';
 if(window.PraxisLabWorkspace)return;
 const mounted=new WeakSet(),grouped=new WeakSet(),noted=new WeakSet(),labels=new Map();
 const words={ro:{preferences:'Preferințe laborator',cases:'Cazuri de mișcare',options:'Afișare și sunete',reading:'Explicații și formule',introduction:'Introducere',activities:'Activități'},en:{preferences:'Laboratory preferences',cases:'Motion cases',options:'Display and sounds',reading:'Explanations and formulas',introduction:'Introduction',activities:'Activities'}};
 const language=()=>window.PraxisI18n?.language==='en'?'en':'ro';
 function caption(el,key){labels.set(el,key);el.textContent=words[language()][key];}
 function disclosure(element,key){
  if(element.closest('.praxis-workspace-disclosure'))return element.closest('.praxis-workspace-disclosure');
  const details=document.createElement('details'),summary=document.createElement('summary');
  details.className='praxis-workspace-disclosure';caption(summary,key);details.append(summary);
  element.before(details);details.append(element);
  details.addEventListener('toggle',()=>{if(details.open)window.dispatchEvent(new Event('resize'));});
  return details;
 }
 function activities(scope,config){
  if(grouped.has(scope))return;
  const items=[...scope.querySelectorAll(config.items)];if(items.length<2)return;
  grouped.add(scope);
  const nav=document.createElement('nav');nav.className='praxis-workspace-activities';nav.setAttribute('aria-label',words[language()].activities);
  let selected=Math.min(config.default,items.length-1);
  const buttons=items.map((item,index)=>{
   item.dataset.workspaceActivity=String(index);
   const heading=item.querySelector('h2,h3,h4');const button=document.createElement('button');button.type='button';
   button.textContent=heading?.textContent.trim()||String(index+1);button.dataset.sound='none';
   const select=()=>{
    selected=index;items.forEach((el,i)=>{el.dataset.workspaceActive=String(i===index);buttons[i].setAttribute('aria-pressed',String(i===index));});
    window.dispatchEvent(new CustomEvent('praxis-workspace-activity-change',{detail:{scope:scope.id}}));
    window.dispatchEvent(new Event('resize'));
   };
   button.addEventListener('click',select);nav.append(button);return button;
  });
  items.forEach((item,index)=>{item.dataset.workspaceActive=String(index===selected);buttons[index].setAttribute('aria-pressed',String(index===selected));});
  items[0].before(nav);
  // Translate with the lesson's own renderer, rather than retain stale copies.
  window.addEventListener('praxis-language-change',()=>{nav.setAttribute('aria-label',words[language()].activities);items.forEach((item,i)=>{const heading=item.querySelector('h2,h3,h4');if(heading)buttons[i].textContent=heading.textContent.trim();});});
 }
 function mount(root=document){
  const body=document.body;if(!body?.dataset.praxisLaboratory)return;
  const id=body.dataset.praxisCourse||location.pathname.match(/\/([^/]+)\/(?:index\.html)?$/)?.[1];
  const config=window.PraxisLabWorkspaceConfig?.[id];if(!config)return;
  body.dataset.praxisWorkspace=id;
  for(const entry of config.workspaces){
   for(const workspace of root.querySelectorAll(entry.selector)){
    if(mounted.has(workspace))continue;mounted.add(workspace);workspace.dataset.workspaceLayout=entry.layout;
    for(const role of ['controls','scene','graphs'])if(entry[role])for(const el of workspace.querySelectorAll(entry[role]))el.dataset.workspaceRole=role;
    if(entry.layout==='reading')for(const figure of workspace.querySelectorAll('.fig')){
     if(!figure.querySelector(':scope>canvas'))continue;
     const controls=[...figure.children].filter(el=>el.matches('.sliders,.ctrls,.ro,.chips,.hint'));
     if(!controls.length)continue;
     const panel=document.createElement('div');panel.className='praxis-workspace-figure-controls';panel.dataset.workspaceRole='controls';
     const heading=document.createElement('div');heading.className='praxis-workspace-figure-heading';
     heading.append(...[...figure.children].filter(el=>el.matches('.fig-h,.tabs,.compression-intro')));
     figure.prepend(heading);panel.append(...controls);figure.append(panel);figure.dataset.workspaceFigure='';
    }
    if(entry.layout==='motion'){
     const controls=workspace.querySelector('.sim-side'),transport=workspace.querySelector('.transport');
     if(controls&&transport)controls.prepend(transport);
     // Scientific derivations follow the working instrument; keep operating hints
     // beside it. Only this explicit, non-React lesson adapter moves these nodes.
     const block=workspace.parentElement;
     const theory=[...block.children].filter(el=>el.matches('.def,.grid-3'));
     if(theory.length){const details=disclosure(theory[0],'reading');details.append(...theory);block.append(details);}
     for(const el of controls?.querySelectorAll('.chips,.checks')||[]){
      const title=el.previousElementSibling?.matches('.group-title')?el.previousElementSibling:null;
      const details=disclosure(el,el.matches('.chips')?'cases':'options');if(title)details.insertBefore(title,el);
     }
    }
   }
  }
  if(!config.react){
   for(const entry of config.activities||[])for(const scope of root.querySelectorAll(entry.scope))activities(scope,entry);
   for(const entry of config.secondaryGroups||[])for(const scope of root.querySelectorAll(entry.scope)){
    if(noted.has(scope))continue;noted.add(scope);
    const notes=[...scope.querySelectorAll(entry.items)].filter(el=>!el.querySelector('input,button,select,textarea,canvas,svg'));
    if(notes.length){const details=disclosure(notes[0],'reading');details.append(...notes);scope.append(details);}
   }
   if(config.reading)for(const el of root.querySelectorAll(config.reading)){
    if(!el.querySelector('input,button,select,textarea,canvas')){
     const details=disclosure(el,el.classList.contains('hero')?'introduction':'reading');
     if(el.classList.contains('hero')&&details.nextElementSibling)details.parentElement.append(details);
    }
   }
  }
  for(const tools of document.querySelectorAll('.praxis-course-tools')){
   const details=disclosure(tools,'preferences'),nav=document.querySelector('.praxis-lab-nav');
   if(nav&&details.parentElement!==nav)nav.append(details);
  }
 }
 window.PraxisLabWorkspace={mount};
 function start(){
  mount();
  // Native lesson links may load a preset in another activity. Reveal the
  // destination before its existing handler scrolls to it; preserve that handler.
  document.addEventListener('click',event=>{
   const config=window.PraxisLabWorkspaceConfig?.[document.body.dataset.praxisWorkspace];
   for(const link of config?.reveals||[]){
    if(!event.target.closest?.(link.trigger))continue;
    const item=document.querySelector(link.target)?.closest('[data-workspace-activity]');
    const nav=item?.parentElement.querySelector(':scope>.praxis-workspace-activities');
    const button=nav?.children[Number(item?.dataset.workspaceActivity)];
    button?.click();button?.focus({preventScroll:true});
   }
  },true);
  // React and imported bridges can mount after DOMContentLoaded. Observe additions
  // only; numerical animation text and our attributes never retrigger this scan.
  let frame=null;
  const observer=new MutationObserver(records=>{
   if(!records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&!node.closest?.('[data-praxis-panel-probe]'))))return;
   if(frame===null)frame=requestAnimationFrame(()=>{frame=null;mount();});
  });observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('praxis-language-change',()=>{for(const [el,key]of labels){if(el.isConnected)caption(el,key);else labels.delete(el);}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
