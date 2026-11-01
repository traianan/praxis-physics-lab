/* Load after production-responsive-audit.browser.js in an isolated browser context. */
(() => {
 const runtimeErrors=[];
 window.addEventListener('error',event=>runtimeErrors.push(String(event.message||event.error).slice(0,500)));
 window.addEventListener('unhandledrejection',event=>runtimeErrors.push(String(event.reason).slice(0,500)));
 const wait = (ms=220) => new Promise(resolve=>setTimeout(resolve,ms));
 const visible = e => !!e && e.getClientRects().length>0 && (!e.checkVisibility||e.checkVisibility());
 const label = e => (e.textContent||e.getAttribute('aria-label')||e.id).trim().replace(/\s+/g,' ').slice(0,90);
 function metadata(){
  const root=document.documentElement, sample=document.querySelector('#praxis-original p,.praxis-lab-intro p');
  const language=document.querySelector('.site-quick-language .site-language,.praxis-site-menu .site-language');
  let languageFit=null;
  if(language&&visible(language)){
   const css=getComputedStyle(language),ctx=document.createElement('canvas').getContext('2d');ctx.font=css.font;
   const text=language.selectedOptions[0]?.textContent||'';
   languageFit={text,font:css.fontSize,width:language.clientWidth,required:Math.ceil(ctx.measureText(text).width+parseFloat(css.paddingLeft)+parseFloat(css.paddingRight)+18)};
   languageFit.clipped=languageFit.required>languageFit.width+2;
  }
  return {rootFont:getComputedStyle(root).fontSize,paragraphFont:sample?getComputedStyle(sample).fontSize:null,touch:root.dataset.courseTouch??root.dataset.touch,board:root.dataset.board==='true'?'dedicated':root.dataset.siteBoard==='true'?'common':'off',languageFit,boardSize:document.getElementById('board-size')?.value,boardSizeNote:document.getElementById('board-size-note')?.textContent,sceneHeight:document.querySelector('.scene-wrap')?.clientHeight};
 }
 function setTouch(enabled){const button=document.getElementById('course-touch')||document.getElementById('touch-mode');if(button&&!button.disabled&&button.getAttribute('aria-pressed')!==String(enabled))button.click();}
 async function setBoard(enabled){
  if(document.getElementById('board-exit')){if((document.documentElement.dataset.board==='true')!==enabled)document.getElementById(enabled?'board-mode':'board-exit').click();}
  else if((document.documentElement.dataset.siteBoard==='true')!==enabled){
   const toggle=document.querySelector('.site-menu-toggle');if(visible(toggle)&&toggle.getAttribute('aria-expanded')!=='true')toggle.click();
   document.querySelector('.site-board-button').click();
  }
  await wait();
 }
 const modalState = name => {
  const report=window.PraxisResponsiveAudit.scan(name),dialog=document.querySelector('dialog[open]');
  if(dialog){const r=dialog.getBoundingClientRect();report.dialog={id:dialog.id,class:dialog.className,left:r.left,top:r.top,width:r.width,height:r.height,horizontalOverflow:dialog.scrollWidth>dialog.clientWidth+3,outside:r.left< -2||r.top< -2||r.right>innerWidth+2||r.bottom>innerHeight+2};}
  return report;
 };
 async function run(){
  for(const b of document.querySelectorAll('button'))if(['Doar necesare','Necessary only'].includes(b.textContent.trim()))b.click();
  await wait();
  const optics=!!document.getElementById('board-exit'), modes=optics?[
   {name:'touch',board:false,touch:true,size:100},
   {name:'board',board:true,touch:true,size:100},
   {name:'board-large',board:true,touch:true,size:200},
   {name:'board-max',board:true,touch:true,size:300}
  ]:[
   {name:'touch',board:false,touch:true,size:100},
   {name:'large',board:false,touch:false,size:200},
   {name:'board',board:true,touch:true,size:100},
   {name:'combined',board:true,touch:true,size:200}
  ];
  const results=[];
  for(const mode of modes){
   document.querySelectorAll('dialog[open]').forEach(d=>d.close());await setBoard(false);setTouch(mode.touch);
   await window.PraxisI18n.setLanguage('ro');
   const dialogs=[];
   if(!optics){
    const dialog=document.querySelector('.praxis-course-settings'),button=[...document.querySelectorAll('.praxis-site-extra button')].find(b=>b.textContent.trim()===window.PraxisI18n.tr('Text / afișare'));
    if(!dialog||!button)throw new Error('Missing text settings');
    button.click();const select=dialog.querySelector('select');select.value=String(mode.size);select.dispatchEvent(new Event('change',{bubbles:true}));await wait();dialogs.push(modalState('text settings '+mode.size+'%'));dialog.querySelector('button').click();
   }
   await setBoard(mode.board);
   if(!optics&&mode.board){
    const dialog=document.querySelector('.praxis-course-settings'),button=[...document.querySelectorAll('.praxis-site-extra button')].find(b=>b.textContent.trim()===window.PraxisI18n.tr('Text / afișare'));
    button.click();await wait();dialogs.push(modalState('board text settings '+mode.size+'%'));dialog.querySelector('button').click();
   }
   if(optics&&mode.board){
    document.getElementById('board-appearance').click();const select=document.getElementById('board-size');select.value=String(mode.size/100);select.dispatchEvent(new Event('change',{bubbles:true}));await wait();dialogs.push(modalState('board appearance '+mode.size+'%'));select.closest('dialog').querySelector('button').click();await wait();
   }
   let report;
   if(optics&&mode.board){
    const states=[window.PraxisResponsiveAudit.scan('board scene RO')];await window.PraxisI18n.setLanguage('en');states.push(window.PraxisResponsiveAudit.scan('board scene EN'));
    for(const id of ['board-controls','board-appearance','board-more']){
     document.getElementById(id).click();await wait();states.push(modalState(id));
     if(id==='board-controls')for(const option of [...document.getElementById('board-control-page').options]){
      const select=document.getElementById('board-control-page');select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));await wait();states.push(modalState('board control '+option.value));
      if(option.value==='system'){
       const tabs=[...document.querySelectorAll('#board-controls-dialog .module-tabs button')];
       for(const tab of tabs){tab.click();await wait();states.push(modalState('board system '+label(tab)));}
       // Keep lenses selected so the refractive-index page is exercised as well.
       tabs[0]?.click();await wait();
      }
     }
     document.querySelector('dialog[open]').querySelector('button').click();
    }
    report={states:states.length,results:states,capped:false,resources:[]};
   }else report=await window.PraxisResponsiveAudit.run({maxStates:140});
   await wait();results.push({mode:mode.name,requested:mode,metadata:metadata(),dialogs,...report});
  }
  await setBoard(false);await wait();
  return {url:location.href,width:innerWidth,height:innerHeight,optics,results,runtimeErrors:[...new Set(runtimeErrors)],exit:{metadata:metadata(),scan:window.PraxisResponsiveAudit.scan('exit board mode')}};
 }
 window.PraxisDisplayAudit={run,metadata,modalState};
})();
