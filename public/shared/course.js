/* Integration only: original lessons, simulations, problems and storage remain in place. */
(() => {
 const script=document.currentScript;
 function mountCourse(){
 const id=script.dataset.course,title=script.dataset.title;
 const original=document.getElementById('praxis-original'),i18n=window.PraxisI18n;
 if(document.documentElement.dataset.praxisStandalone==='true')original.querySelectorAll('a[href$=".zip"]').forEach(link=>link.hidden=true);
 let returnUrl=new URL('../../',location.href);
 try{const saved=JSON.parse(sessionStorage.getItem('praxis-library-return')||'null'),candidate=new URL(saved?.url||'./',returnUrl);if(candidate.origin===returnUrl.origin&&candidate.pathname.startsWith(returnUrl.pathname))returnUrl=candidate;}catch{}
 const sections=document.createElement('select');sections.className='praxis-course-sections';sections.setAttribute('aria-label','Secțiunea lecției');
 const entries=original.querySelector('.tabs [data-tab]')?[...original.querySelectorAll('.tabs [data-tab]')].map(e=>({id:e.dataset.tab,title:e.textContent.trim().replace(/^\d+/, '').trim(),button:e})):[...original.querySelectorAll('nav.toc a[href^="#s"]')].map(e=>({id:e.hash.slice(1),title:e.textContent.trim().replace(/^\d+/, '').trim()}));
 if(id==='motoare-termice')entries.unshift({id:'top',title:'Introducere'});
 for(const entry of entries)sections.add(new Option(entry.title,entry.id));
 sections.addEventListener('change',()=>{const entry=entries.find(e=>e.id===sections.value);if(entry.button)entry.button.click();else document.getElementById(entry.id)?.scrollIntoView({behavior:'instant',block:'start'});});
 const settings=document.createElement('button');settings.className='button secondary';settings.textContent='Text / afișare';
 const theme=original.querySelector('#btn-theme');const {header}=window.PraxisLabHeader.mount({title,returnHref:returnUrl.href,before:original,actions:[settings,...(theme?[theme]:[])]});
 const intro=document.createElement('div');intro.className='praxis-lab-intro';const introText=document.createElement('div');const heading=document.createElement('h1');heading.textContent=title;const subtitle=document.createElement('p');subtitle.textContent=id==='principiile-mecanicii-newtoniene'?'Laborator interactiv de dinamică':['miscarea-rectilinie','viteza-si-acceleratia','miscarea-curbilinie-plana','miscarea-circulara-uniforma'].includes(id)?'Laborator interactiv de cinematică':['motoare-termice','notiuni-termodinamice','calorimetrie','principiul-i-al-termodinamicii','principiul-i-aplicatii','interactii-atomice','transformari-stare-agregare'].includes(id)?'Laborator interactiv de căldură și termodinamică':['oscilator-mecanic','oscilatori-mecanici-cuplati','compunerea-oscilatiilor','figuri-chladni'].includes(id)?'Laborator de oscilații mecanice':id==='unde-mecanice'?'Laborator de unde și acustică':'Instrumente matematice pentru fizică';introText.append(heading,subtitle);intro.append(introText);
 const nav=document.createElement('nav');nav.className='praxis-lab-nav';nav.setAttribute('aria-label','Secțiunea lecției');const tabs=['motoare-termice','notiuni-termodinamice','calorimetrie'].includes(id)?null:original.querySelector('.tabs');if(tabs){nav.append(tabs);sections.classList.add('praxis-course-nav-select');}if(id!=='unde-mecanice')nav.append(sections);
 const presentation=window.PraxisCourseLocalization,tools=document.createElement('div');tools.className='praxis-course-tools';
 const colorLabel=document.createElement('label');colorLabel.append(document.createTextNode('Culori'));const colorSelect=document.createElement('select');colorSelect.id='course-colors';colorSelect.setAttribute('aria-label','Culori');colorSelect.add(new Option('Praxis · tonuri calme','praxis'));colorSelect.add(new Option('Vii · contrast puternic','vivid'));colorSelect.value=presentation.colors;colorLabel.append(colorSelect);
 const touchButton=document.createElement('button');touchButton.id='course-touch';touchButton.type='button';touchButton.textContent='Mod tactil';touchButton.setAttribute('aria-pressed',String(presentation.touch));
 colorSelect.addEventListener('change',()=>presentation.setColors(colorSelect.value));touchButton.addEventListener('click',()=>{presentation.setTouch(!presentation.touch);touchButton.setAttribute('aria-pressed',String(presentation.touch));});tools.append(colorLabel,touchButton);
 window.addEventListener('praxis-course-presentation-change',()=>{colorSelect.value=presentation.colors;});
 if(id==='calcul-vectorial'){for(const h2 of original.querySelectorAll('.sec-head h2'))h2.textContent=h2.textContent.replace(/\s+/g,' ').trim();const h1=original.querySelector('header.hero h1');if(h1)h1.textContent=title;}
 original.before(intro,nav,tools);presentation.start(original);
 if(id==='miscarea-rectilinie'){
  const info=original.querySelector('#traj-info');let frame=null,lastWidth=0;
  function fitMotionExplanations(){
   frame=null;if(!info||!window.MR?.motionTypeInfoVariants)return;
   const width=info.getBoundingClientRect().width;if(width<=0)return;lastWidth=width;
   const probe=info.cloneNode(false);probe.removeAttribute('id');probe.dataset.measuringMotion='';probe.setAttribute('aria-hidden','true');probe.style.width=width+'px';info.parentElement.append(probe);
   let maximum=0;
   for(const html of window.MR.motionTypeInfoVariants()){probe.innerHTML=html;i18n.apply(probe);maximum=Math.max(maximum,probe.getBoundingClientRect().height);}
   probe.remove();info.style.setProperty('--motion-info-height',Math.ceil(maximum)+'px');
  }
  function scheduleMotionFit(){if(frame===null)frame=requestAnimationFrame(fitMotionExplanations);}
  if(info)new ResizeObserver(()=>{if(Math.abs(info.getBoundingClientRect().width-lastWidth)>.5)scheduleMotionFit();}).observe(info);
  for(const event of ['resize','praxis-language-change','praxis-course-presentation-change'])window.addEventListener(event,scheduleMotionFit);
  document.fonts?.ready.then(scheduleMotionFit);scheduleMotionFit();
 }
 const hero=id==='calcul-vectorial'?original.querySelector('header.hero'):null;if(hero){const introduction=document.createElement('details');introduction.className='praxis-course-introduction';const summary=document.createElement('summary');summary.textContent='Introducere și prezentarea lecției';introduction.append(summary);hero.before(introduction);introduction.append(hero);i18n.apply(summary);}
 const dialog=document.createElement('dialog');dialog.className='praxis-course-settings';dialog.setAttribute('aria-labelledby','course-settings-title');dialog.innerHTML='<header><h2 id="course-settings-title">Text și afișare</h2><button class="button secondary" aria-label="Închide fereastra">×</button></header><label>Mărimea textului <select aria-label="Mărimea textului"></select></label><p>Conținutul original este păstrat integral: explicații, formule, simulări, exerciții și teste.</p>';
 const sizes=dialog.querySelector('select');for(const n of [100,125,150,175,200])sizes.add(new Option(n+'%',String(n)));
 function setSize(value){document.documentElement.style.fontSize=(16*value/100)+'px';sizes.value=String(value);try{localStorage.setItem('praxis-course-text-size',String(value));}catch{}window.dispatchEvent(new Event('resize'));}
 let size=100;try{size=Number(localStorage.getItem('praxis-course-text-size'))||100;}catch{}setSize([100,125,150,175,200].includes(size)?size:100);
 sizes.addEventListener('change',()=>setSize(Number(sizes.value)));dialog.querySelector('button').addEventListener('click',()=>dialog.close());settings.addEventListener('click',()=>{dialog.showModal();keepDialogVisible();});document.body.append(dialog);
 // Move the settings modal by its title bar; controls keep their native gestures.
 const dragHandle=dialog.querySelector('header');dragHandle.classList.add('praxis-dialog-drag-handle');dragHandle.tabIndex=0;
 let dialogPosition=null,dialogDrag=null;
 function placeDialog(x,y){
  const rect=dialog.getBoundingClientRect(),width=document.documentElement.clientWidth,height=window.innerHeight;
  dialogPosition={x:Math.max(0,Math.min(x,width-rect.width)),y:Math.max(0,Math.min(y,height-rect.height))};
  dialog.style.margin='0';dialog.style.inset='auto';dialog.style.left=dialogPosition.x+'px';dialog.style.top=dialogPosition.y+'px';
 }
 function keepDialogVisible(){if(dialog.open&&dialogPosition)placeDialog(dialogPosition.x,dialogPosition.y);}
 dragHandle.addEventListener('pointerdown',event=>{
  if(event.button!==0||dialogDrag||event.target.closest('button,input,select,a'))return;
  const rect=dialog.getBoundingClientRect();dialogDrag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};
  dragHandle.setPointerCapture(event.pointerId);dragHandle.focus({preventScroll:true});dialog.classList.add('is-dragging');event.preventDefault();
 });
 dragHandle.addEventListener('pointermove',event=>{if(dialogDrag?.id===event.pointerId)placeDialog(dialogDrag.left+event.clientX-dialogDrag.x,dialogDrag.top+event.clientY-dialogDrag.y);});
 function finishDialogDrag(){dialogDrag=null;dialog.classList.remove('is-dragging');}
 for(const type of ['pointerup','pointercancel','lostpointercapture'])dragHandle.addEventListener(type,finishDialogDrag);
 dialog.addEventListener('close',()=>{if(dialogDrag&&dragHandle.hasPointerCapture(dialogDrag.id))dragHandle.releasePointerCapture(dialogDrag.id);finishDialogDrag();});
 dragHandle.addEventListener('keydown',event=>{
  if(event.target!==dragHandle)return;const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(!direction)return;
  event.preventDefault();const rect=dialog.getBoundingClientRect(),step=event.shiftKey?40:10;placeDialog(rect.left+direction[0]*step,rect.top+direction[1]*step);
 });
 window.addEventListener('resize',keepDialogVisible);new ResizeObserver(keepDialogVisible).observe(dialog);
 new ResizeObserver(()=>document.documentElement.style.setProperty('--course-header',header.getBoundingClientRect().height+'px')).observe(header);
 function renderChrome(){i18n.apply(header);i18n.apply(intro);i18n.apply(nav);i18n.apply(tools);i18n.apply(dialog);const summary=original.querySelector('.praxis-course-introduction>summary');if(summary)i18n.apply(summary);}
 window.addEventListener('praxis-language-change',renderChrome);renderChrome();
 function syncRoute(){const value=location.hash.replace(/^#\/?/,'');if(entries.some(e=>e.id===value))sections.value=value;}
 window.addEventListener('hashchange',syncRoute);syncRoute();
 // Preserve the original event sounds, but make the library mute authoritative.
 if(window.MR){
  const sound=window.MR.sound,button=document.getElementById('btn-sound');
  function syncSound(){sound.on=window.PraxisSound.enabled;button.setAttribute('aria-pressed',String(sound.on));button.querySelectorAll('.wave').forEach(e=>e.style.display=sound.on?'':'none');button.querySelector('.mute').style.display=sound.on?'none':'';if(!sound.on&&sound.ctx?.state==='running')sound.ctx.suspend();}
  syncSound();window.addEventListener('praxis-sound-change',syncSound);document.addEventListener('visibilitychange',()=>{if(document.hidden&&sound.ctx?.state==='running')sound.ctx.suspend();});
  original.querySelectorAll('button').forEach(b=>b.dataset.sound='none');
 }
 // Native input events retain the original numerical synchronisation and simulation code.
 function installSteppers(){for(const range of original.querySelectorAll('input[type=range]')){
  const label=range.closest('label')?.cloneNode(true);label?.querySelectorAll('input,output,button').forEach(e=>e.remove());
  const name=range.getAttribute('aria-label')||label?.textContent.trim().replace(/\s+/g,' ')||range.id||'valoarea';
  if(!range.getAttribute('aria-label'))range.setAttribute('aria-label',name);
  if(range.closest('.praxis-range-stepper')){for(const [index,button]of [...range.closest('.praxis-range-stepper').querySelectorAll('button')].entries())if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label',(index===0?'Scade ':'Crește ')+name+' cu '+(range.step||1));continue;}
  const number=range.closest('label')?.querySelector('input[type=number]');if(number&&!number.hasAttribute('aria-label'))number.setAttribute('aria-label',name);
  const row=document.createElement('span');row.className='praxis-range-stepper';range.before(row);row.append(range);
  for(const direction of [-1,1]){const button=document.createElement('button');button.type='button';button.textContent=direction<0?'−':'+';button.setAttribute('aria-label',(direction<0?'Scade ':'Crește ')+name+' cu '+(range.step||1));button.dataset.sound='none';button.addEventListener('click',e=>{e.preventDefault();range[direction<0?'stepDown':'stepUp']();range.dispatchEvent(new Event('input',{bubbles:true}));range.dispatchEvent(new Event('change',{bubbles:true}));window.PraxisSound.play('select');});direction<0?row.prepend(button):row.append(button);}
 }}
 installSteppers();new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('input[type=range]')||n.querySelector('input[type=range]')))))installSteppers();}).observe(original,{childList:true,subtree:true});
 }
 if(script.dataset.course==='unde-mecanice'&&!document.querySelector('.lesson-redesign')){const observer=new MutationObserver(()=>{if(document.querySelector('.lesson-redesign')){observer.disconnect();mountCourse();}});observer.observe(document.getElementById('root'),{childList:true,subtree:true});}else mountCourse();
})();
