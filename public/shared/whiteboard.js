/* Keep the live experiment in its original DOM ancestry, including React event delegation. */
(() => {
 if(window.PraxisWhiteboard)return;
 const width=1600,height=900;
 const root=document.documentElement;
 const words={
  ro:{enter:'Mod tablă',exit:'Revino la lecție',full:'Ecran complet',leaveFull:'Ieși din ecran complet',options:'Opțiuni și explicații',close:'Închide',workspace:'Zonă de lucru',area:'Tablă digitală'},
  en:{enter:'Board mode',exit:'Return to lesson',full:'Fullscreen',leaveFull:'Exit fullscreen',options:'Options and explanations',close:'Close',workspace:'Workspace',area:'Whiteboard'}
 };
 const language=()=>window.PraxisI18n?.language==='en'?'en':'ro';
 const visible=element=>element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden';
 const boardLayouts={
  'compunerea-oscilatiilor':{select:'[data-composition-section=laborator]>.layout',move:['[data-composition-section=laborator]>.mode-tabs','.composition-control-body'],extras:['#amplitudeHint','#presetDescription','#ratioPresets','.sound-panel','.switches','#nextExtreme','#eventInfo','#save','.results']},
  'oglinzi-si-lentile':{select:'.workspace',move:['.workspace-top>.module-tabs'],extras:['.curvature-summary','.insight','.display-options']},
  'legea-lui-ohm':{popover:'.lab-controls'},
  'motoare-termice':{select:'[data-workspace-figure]',extras:['.praxis-workspace-figure-controls>.hint']},
  'calcul-vectorial':{extras:[':scope>.praxis-workspace-disclosure']},
  'marimi-fizice-unitati':{select:'[data-workspace-layout]'},
  'notiuni-termodinamice':{extras:[':scope>.praxis-workspace-disclosure']},
  'calorimetrie':{extras:[':scope>.praxis-workspace-disclosure']},
  'principiul-i-aplicatii':{extras:[':scope>.praxis-workspace-disclosure','.demo-hint','.molecule-hint','#degreesExplanation','#gammaFormula']},
  'transformari-stare-agregare':{extras:[':scope>.praxis-workspace-disclosure','.demo-hint','.boil-model-details','.model-note:not(.boil-model-details *)','#boilEvents']},
  'oscilatori-mecanici-cuplati':{extras:[':scope>p','.sim-row>div>p.muted','#f1out',':scope#lab1 .btn-row + .btn-row']},
  'figuri-chladni':{extras:['.calc','#driveHint','#settlingInfo','#driveOut','aside.panel>div:has(:is(#vol,#sp,#cnt))']},
  'viteza-si-acceleratia':{extras:['#poly-events-analysis','.poly-equations-banner','.control-group:has(#curv-chk-hodograph)','.control-group:has(#curv-slider-dt)>p','#curv-desc-text']}
 };
 const experimentTabs={
  'legea-lui-ohm':'#lesson-tab-laborator',
  'viteza-si-acceleratia':'#btn-tab-rectiliniu',
  'miscarea-curbilinie-plana':'#curvilinear-tab-viteza',
  'principiul-i-al-termodinamicii':'[data-tab=general]',
  'principiul-i-aplicatii':'[data-tab=izocor]',
  'transformari-stare-agregare':'[data-tab=topire]',
  'motoare-termice':'a[href="#s3"]',
  'oscilatori-mecanici-cuplati':'#btnLab',
  'principiile-mecanicii-newtoniene':'[data-tab=newton2]',
  'miscarea-circulara-uniforma':'[data-tab=laborator]',
  'compunerea-oscilatiilor':'[data-tab=laborator]',
  'retele-electrice':'#tab-k-anim'
 };
 let board=null,frame=0;

 function clientToLocal(element,x,y,logicalWidth=element.offsetWidth,logicalHeight=element.offsetHeight){
  const rect=element.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  return {x:(x-rect.left)*logicalWidth/rect.width,y:(y-rect.top)*logicalHeight/rect.height};
 }
 function button(parent,action){
  const el=document.createElement('button');el.type='button';el.className='button secondary';
  el.addEventListener('click',action);parent.append(el);return el;
 }
 function layout(){
  frame=0;if(!board)return;
  const viewport=window.visualViewport;
  const {shell,space,target}=board;
  const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0;
  const availableWidth=Math.min(viewport?.width||root.clientWidth,root.clientWidth-left);
  const availableHeight=Math.min(viewport?.height||window.innerHeight,window.innerHeight-top);
  Object.assign(shell.style,{left:left+'px',top:top+'px',width:availableWidth+'px',height:availableHeight+'px'});
  const room=space.getBoundingClientRect();
  // Unmigrated views can keep their intrinsic bounds until an explicit layout is provided.
  const logicalWidth=Math.max(width,target.offsetWidth,target.scrollWidth),logicalHeight=Math.max(height,target.offsetHeight,target.scrollHeight);
  const scale=Math.min(room.width/logicalWidth,room.height/logicalHeight);
  if(!(scale>0))return;
  const x=room.left+(room.width-logicalWidth*scale)/2;
  const y=room.top+(room.height-logicalHeight*scale)/2;
  target.style.setProperty('--wb-scale',scale);
  target.style.setProperty('--wb-x',x+'px');
  target.style.setProperty('--wb-y',y+'px');
  // Imported panels can establish a fixed containing block. Translate in its local origin.
  const placed=target.getBoundingClientRect();
  if(Math.abs(placed.left-x)>.1)target.style.setProperty('--wb-x',x+(x-placed.left)+'px');
  if(Math.abs(placed.top-y)>.1)target.style.setProperty('--wb-y',y+(y-placed.top)+'px');
  const changed=board.scale!==scale;
  board.scale=scale;board.bounds={width:logicalWidth,height:logicalHeight};
  if(changed)window.dispatchEvent(new Event('resize'));
 }
 function schedule(){if(board&&!frame)frame=requestAnimationFrame(layout);}
 function labels(){
  if(!board)return;
  const t=words[language()];
  board.shell.setAttribute('aria-label',t.area);board.exit.textContent=t.exit;
  board.full.textContent=document.fullscreenElement?t.leaveFull:t.full;
  board.options.textContent=t.options;board.heading.textContent=t.options;board.close.textContent=t.close;
  board.switcher.setAttribute('aria-label',t.workspace);
  [...board.switcher.options].forEach((option,index)=>{option.textContent=workspaceLabel(board.targets[index],index);});
 }
 function workspaceLabel(target,index){
  return target.querySelector('h2,h3,h4,legend')?.textContent.trim()||target.getAttribute('aria-label')||words[language()].workspace+' '+(index+1);
 }
 function clearTarget(){
  board.observer.disconnect();
  if(board.secondary){
   board.secondary.hidePopover();
   board.secondary.removeAttribute('popover');
   board.secondary.removeAttribute('data-wb-secondary');
   board.options.popoverTargetElement=null;
   board.secondary=null;
  }
  for(const {node,anchor} of board.parked)anchor.replaceWith(node);
  board.parked=[];
  if(board.originalDisclosure)board.originalDisclosure.element.open=board.originalDisclosure.open;
  board.originalDisclosure=null;
  for(const el of board.path)delete el.dataset.wbPath;
  if(board.target){
   if(board.stagePopover){board.target.hidePopover();board.target.removeAttribute('popover');board.stagePopover=false;}
   delete board.target.dataset.wbStage;
   for(const property of ['--wb-scale','--wb-x','--wb-y'])board.target.style.removeProperty(property);
  }
 }
 function setTarget(target){
  clearTarget();board.target=target;
  board.path=[];
  for(let node=target;node&&node!==root;node=node.parentElement){node.dataset.wbPath='';board.path.push(node);}
  target.dataset.wbStage=board.id;
  if(typeof target.showPopover==='function'&&!target.hasAttribute('popover')){
   // A manual top-layer box uses the viewport while retaining DOM ancestry and listeners.
   target.setAttribute('popover','manual');target.showPopover();board.stagePopover=true;
  }
  target.append(board.dialog);
  const secondarySelector=boardLayouts[board.id]?.popover;
  const secondary=secondarySelector&&target.querySelector(secondarySelector);
  if(secondary&&typeof secondary.showPopover==='function'&&!secondary.hasAttribute('popover')){
   // React owns these controls. A top-layer panel keeps their parent and events.
   secondary.setAttribute('popover','auto');
   secondary.setAttribute('data-wb-secondary','');
   board.options.popoverTargetElement=secondary;
   board.secondary=secondary;
  }
  const disclosure=target.querySelector(':scope>details.controls');
  if(disclosure){board.originalDisclosure={element:disclosure,open:disclosure.open};disclosure.open=true;}
  const [source,destination]=boardLayouts[board.id]?.move||[];
  const node=source&&document.querySelector(source);
  if(node){
   const anchor=document.createComment('whiteboard controls');node.before(anchor);
   (destination?target.querySelector(destination):target).prepend(node);board.parked.push({node,anchor});
  }
  const optionsStart=board.parked.length;
  for(const selector of boardLayouts[board.id]?.extras||[]){
   for(const node of target.querySelectorAll(selector)){
    const anchor=document.createComment('whiteboard panel');node.before(anchor);board.dialogBody.append(node);
    board.parked.push({node,anchor});
   }
  }
  board.options.hidden=!board.secondary&&board.parked.length===optionsStart;
  board.observer.observe(target);board.observer.observe(board.space);
  layout();schedule();
 }
 function close(){
  if(!board)return;
  const {shell,dialog,trigger,scroll,ownsFullscreen}=board;
  if(dialog.open)dialog.close();
  clearTarget();dialog.remove();shell.remove();delete root.dataset.praxisWhiteboard;board=null;
  window.dispatchEvent(new Event('resize'));
  trigger?.setAttribute('aria-pressed','false');
  if(trigger?.checkVisibility())trigger.focus({preventScroll:true});
  else document.querySelector('.site-menu-toggle')?.focus({preventScroll:true});
  window.scrollTo(scroll.x,scroll.y);
  if(ownsFullscreen&&document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});
 }
 async function toggleFullscreen(){
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else {await root.requestFullscreen();if(board)board.ownsFullscreen=true;}
  }catch{schedule();}
 }
 function open(trigger,retrying=false){
  if(document.body.hasAttribute('data-praxis-adaptive-lab'))return false;
  if(board){close();return true;}
  window.PraxisLabWorkspace?.mount();
  const id=document.body.dataset.praxisCourse||document.body.dataset.praxisWorkspace||(document.querySelector('#scene-wrap #scene')?'oglinzi-si-lentile':location.pathname.split('/').filter(Boolean).at(-2));
  const selector=boardLayouts[id]?.select||'[data-workspace-layout]';
  let targets=[...document.querySelectorAll(selector)].filter(visible);
  if(!targets.length&&!retrying){
   const tab=experimentTabs[id]&&document.querySelector(experimentTabs[id]);
   if(tab){tab.click();requestAnimationFrame(()=>open(trigger,true));return true;}
  }
  targets=targets.filter(el=>!targets.some(other=>el!==other&&other.contains(el)));
  if(!targets.length)return false;
  const scroll={x:window.scrollX,y:window.scrollY};
  const shell=document.createElement('section');shell.dataset.wbShell='';shell.dataset.noI18n='';
  const toolbar=document.createElement('div');toolbar.className='praxis-whiteboard-toolbar';
  const space=document.createElement('div');space.className='praxis-whiteboard-space';space.setAttribute('aria-hidden','true');
  const dialog=document.createElement('dialog');dialog.className='praxis-whiteboard-dialog';
  const heading=document.createElement('h2');heading.id='praxis-whiteboard-dialog-title';dialog.setAttribute('aria-labelledby',heading.id);dialog.append(heading);
  const closeDialog=button(dialog,()=>dialog.close());
  const dialogBody=document.createElement('div');dialog.append(dialogBody);
  const title=document.createElement('strong');title.textContent=document.querySelector('.praxis-lab-intro h1,h1')?.textContent.trim()||document.title;toolbar.append(title);
  const switcher=document.createElement('select');targets.forEach((_,index)=>switcher.add(new Option('',String(index))));switcher.hidden=targets.length<2;
  switcher.addEventListener('change',()=>setTarget(targets[Number(switcher.value)]));toolbar.append(switcher);
  const options=button(toolbar,()=>{if(!board.secondary)dialog.showModal();});
  const full=button(toolbar,toggleFullscreen);full.hidden=!document.fullscreenEnabled;
  const exit=button(toolbar,close);
  shell.append(toolbar,space,dialog);document.body.append(shell);
  board={id,shell,space,dialog,heading,dialogBody,close:closeDialog,options,full,exit,switcher,targets,trigger,scroll,path:[],parked:[],observer:new ResizeObserver(schedule)};
  root.dataset.praxisWhiteboard='true';trigger?.setAttribute('aria-pressed','true');
  labels();setTarget(targets.find(el=>el.getBoundingClientRect().bottom>0)||targets[0]);
  switcher.value=String(targets.indexOf(board.target));exit.focus({preventScroll:true});
  return true;
 }
 function mountStandaloneEntry(){
  if(window.PraxisNavigation||!document.body?.hasAttribute('data-praxis-laboratory')||document.body.hasAttribute('data-praxis-adaptive-lab'))return;
  const tools=document.querySelector('.praxis-lab-actions');
  if(!tools||tools.querySelector('#board-mode,.praxis-whiteboard-entry'))return;
  const entry=button(tools,()=>open(entry));
  entry.classList.add('praxis-whiteboard-entry');entry.setAttribute('aria-pressed','false');
  const translate=()=>{entry.textContent=words[language()].enter;};translate();
  window.addEventListener('praxis-language-change',translate);
 }
 function start(){
  if(!document.body.hasAttribute('data-praxis-laboratory')||document.body.hasAttribute('data-praxis-adaptive-lab'))return;
  mountStandaloneEntry();
  document.addEventListener('click',event=>{
   const trigger=event.target.closest?.('.site-board-button,#board-mode');
   if(!trigger||!open(trigger))return;
   event.preventDefault();event.stopImmediatePropagation();
  },true);
  document.addEventListener('keydown',event=>{
   if(board?.secondary?.matches(':popover-open')&&event.key==='Escape')return;
   if(board&&event.key==='Escape'&&!board.dialog.open&&!document.fullscreenElement){event.preventDefault();close();}
  });
 }
 window.PraxisWhiteboard={open,close,clientToLocal,get scale(){return board?.scale||1;},get bounds(){return board?.bounds||null;}};
 for(const event of ['resize','orientationchange'])window.addEventListener(event,schedule);
 for(const event of ['resize','scroll'])window.visualViewport?.addEventListener(event,schedule);
 document.addEventListener('fullscreenchange',()=>{
  if(board?.stagePopover&&!board.target.matches(':popover-open'))board.target.showPopover();
  labels();schedule();
 });
 window.addEventListener('praxis-language-change',()=>{labels();schedule();});
 window.addEventListener('praxis-lab-header-ready',()=>{
  if(root.dataset.praxisStandalone==='true')mountStandaloneEntry();
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
