/* Shared top navigation; keep native control nodes and their event handlers. */
(() => {
 if(window.PraxisNavigation)return;
 const base=new URL('../',document.currentScript.src);
 const text={ro:{library:'Bibliotecă',guide:'Cum folosești laboratorul',board:'Mod tablă',close:'Închide ghidul',title:'Din bibliotecă, în laborator.',steps:['Alege un capitol și deschide un laborator.','Explorează explicațiile și modifică parametrii simulărilor.','Folosește Mod tablă pentru prezentare și comenzile de afișare pentru lizibilitate.','Sunetul pornește inactiv. Îl poți activa sau opri din meniu.','Alege RO sau EN. Memorarea preferințelor depinde de acordul tău.'],navigation:'Navigare principală'},en:{library:'Library',guide:'How to use the laboratory',board:'Board mode',close:'Close guide',title:'From the library to the laboratory.',steps:['Choose a chapter and open a laboratory.','Explore explanations and change the simulation parameters.','Use Board mode for presenting and display controls for readability.','Sound starts muted. You can turn it on or off from the menu.','Choose RO or EN. Remembering preferences depends on your consent.'],navigation:'Main navigation'}};
 const lang=()=>window.PraxisI18n?.language==='en'?'en':'ro';
 function mount(header,{library,guide,board,sound,language,context,actions=[]}={}){
  if(!header||header.dataset.siteNavigation)return;
  header.dataset.siteNavigation='';header.classList.add('praxis-site-header');
  const row=document.createElement('div');row.className='praxis-site-row';
  const logo=document.createElement('a');logo.href=new URL('?home=1',base);logo.className='praxis-site-brand';logo.setAttribute('aria-label','Praxis Science Lab');logo.innerHTML=`<img src="${new URL('assets/favicon.svg',base)}" width="37" height="39" alt=""><span>praxis <small>SCIENCE LAB</small></span>`;
  const menu=document.createElement('nav');menu.id='praxis-main-menu';menu.className='praxis-site-menu';menu.dataset.noI18n='';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='site-menu-toggle';toggle.dataset.noI18n='';toggle.setAttribute('aria-controls',menu.id);toggle.setAttribute('aria-expanded','false');
  const quickLanguage=document.createElement('span');quickLanguage.className='site-quick-language';quickLanguage.dataset.noI18n='';
  const mobile=matchMedia('(max-width:1140px)');let expanded=false;
  function setOpen(value,restoreFocus=false){expanded=mobile.matches&&value;header.dataset.navigationOpen=String(expanded);toggle.setAttribute('aria-expanded',String(expanded));menu.inert=mobile.matches&&!expanded;toggle.innerHTML=`<span aria-hidden="true">${expanded?'×':'☰'}</span><span>${lang()==='en'?'Menu':'Meniu'}</span>`;toggle.setAttribute('aria-label',lang()==='en'?(expanded?'Close menu':'Open menu'):(expanded?'Închide meniul':'Deschide meniul'));if(restoreFocus)toggle.focus();}
  toggle.addEventListener('click',()=>setOpen(!expanded));
  mobile.addEventListener('change',()=>{placeQuickControls();setOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&expanded){event.preventDefault();setOpen(false,true);}});
  document.addEventListener('click',event=>{if(expanded&&!event.composedPath().includes(header))setOpen(false);});
  const hasLibrary=!!library;library ||= document.createElement('a');if(!hasLibrary)library.href=new URL('?home=1',base);library.classList.add('site-menu-control','site-library-link');
  if(location.pathname===base.pathname||location.pathname===new URL('index.html',base).pathname)library.setAttribute('aria-current','page');
  guide ||= document.createElement('button');guide.type='button';guide.className='site-menu-control site-guide-button';
  let dialog=null;
  if(!document.getElementById('guide-dialog')){
   dialog=document.createElement('dialog');dialog.className='site-guide-dialog';dialog.dataset.noI18n='';dialog.setAttribute('aria-labelledby','site-guide-heading');document.body.append(dialog);
   guide.addEventListener('click',()=>dialog.showModal());
   dialog.addEventListener('click',event=>{if(event.target.closest('[data-guide-close]'))dialog.close();else if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});
  }
  const fallbackBoard=!board;board ||= document.createElement('button');board.type='button';board.classList.add('site-menu-control','site-board-button');
  if(fallbackBoard){board.setAttribute('aria-pressed','false');board.addEventListener('click',()=>{const enabled=document.documentElement.dataset.siteBoard!=='true';document.documentElement.dataset.siteBoard=String(enabled);board.setAttribute('aria-pressed',String(enabled));window.dispatchEvent(new Event('resize'));});}
  sound ||= window.PraxisSound.createToggle();sound.classList.add('site-menu-control','site-sound-button');
  language ||= window.PraxisI18n.createSelector();language.classList.add('site-menu-control','site-language');
  menu.append(library,guide,board,sound,language);row.append(logo,quickLanguage,toggle,menu);
  function placeQuickControls(){(mobile.matches?quickLanguage:menu).append(sound,language);}
  placeQuickControls();
  menu.addEventListener('click',event=>{if(event.target.closest('.site-library-link,.site-guide-button,.site-board-button'))setOpen(false);});
  let infoHeading=null,infoCurrent=null;
  if(!context&&document.querySelector('.info-content h1')){
   infoHeading=document.querySelector('.info-content h1');
   context=document.createElement('nav');context.className='praxis-lab-path';context.setAttribute('aria-label','Navigare în lecție');
   const home=document.createElement('a');home.href=new URL('?home=1',base);home.textContent='Bibliotecă';
   const separator=document.createElement('span');separator.className='praxis-breadcrumb-separator';separator.textContent='/';separator.setAttribute('aria-hidden','true');
   const current=document.createElement('strong');current.textContent=infoHeading.textContent;current.setAttribute('aria-current','page');context.append(home,separator,current);infoCurrent=current;
  }
  const detail=document.createElement('div');detail.className='praxis-site-context';if(context)detail.append(context);const extra=actions.filter(action=>action!==board);if(extra.length){const controls=document.createElement('div');controls.className='praxis-site-extra';controls.append(...extra);detail.append(controls);}
  // Keep the complete hierarchy outside the collapsible menu on every screen.
  // Reuse original action nodes/listeners in the utility row.
  if(header.classList.contains('praxis-lab-header')){
   const extra=detail.querySelector('.praxis-site-extra');if(extra)menu.prepend(...extra.children);
   extra?.remove();
  }
  header.replaceChildren(row);if(detail.childNodes.length)header.append(detail);
  function render(){const t=text[lang()];menu.setAttribute('aria-label',t.navigation);library.textContent=t.library;guide.textContent=t.guide;board.textContent=t.board;if(infoCurrent)infoCurrent.textContent=infoHeading.textContent;if(context)window.PraxisI18n.apply(context);if(dialog)dialog.innerHTML=`<header><h2 id="site-guide-heading">${t.title}</h2><button type="button" data-guide-close aria-label="${t.close}">×</button></header><ol>${t.steps.map(step=>`<li>${step}</li>`).join('')}</ol>`;}
  render();setOpen(false);window.addEventListener('praxis-language-change',()=>{render();setOpen(expanded);});
  new ResizeObserver(()=>document.documentElement.style.setProperty('--praxis-header-height',header.getBoundingClientRect().height+'px')).observe(header);
  return header;
 }
 window.PraxisNavigation={mount};
 function normalize(){
  const header=document.querySelector('.topbar');if(!header||header.dataset.siteNavigation)return false;
  const sound=header.querySelector('[data-praxis-sound]'),language=header.querySelector('[data-language-select]');
  if(!sound||!language||(!header.classList.contains('praxis-lab-header')&&!header.querySelector('#library-board-entry')))return false;
  const board=header.querySelector('#library-board-entry,#board-mode');
  const actions=[...(header.querySelector('.praxis-lab-actions')?.children||[])].filter(el=>el!==sound&&el!==language&&el!==board&&!el.classList.contains('library-return'));
  mount(header,{library:header.querySelector('.library-return')||undefined,guide:header.querySelector('#guide-button')||undefined,board:board||undefined,sound,language,context:header.querySelector('.praxis-lab-path')||undefined,actions});return true;
 }
 document.addEventListener('DOMContentLoaded',()=>{if(normalize())return;const observer=new MutationObserver(()=>{if(document.querySelector('.topbar')?.dataset.siteNavigation!==undefined||normalize())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});});
})();
