import {chapters,findSimulations} from './catalog.js';

/** Separate paginated presentation: large touch targets, no viewport scrolling. */
export function createBoardController({getContext,setQuery,navigateChapter,icon}) {
 const levels=[1,1.25,1.5,1.75,2,2.5,3];
 let enabled=false,desired=innerWidth>=2500&&innerHeight>=1300?2:1,applied=1,page=0,panel='chapters',restore=false;
 try {const saved=Number(localStorage.getItem('praxis-library-board-scale'));if(levels.includes(saved))desired=saved;restore=localStorage.getItem('praxis-library-board')==='true';}catch{}
 const root=document.createElement('section');root.id='library-board';root.hidden=true;root.setAttribute('aria-label','Biblioteca în Mod tablă');
 root.innerHTML='<div class="board-canvas"><header class="library-board-header"><strong>Fizică interactivă</strong><button id="lb-chapters">Capitole</button><button id="lb-simulations">Simulări</button><button id="lb-search" aria-label="Caută o simulare">⌕</button><div class="library-size-group"><button id="lb-smaller" aria-label="Micșorează textul și butoanele">A−</button><button id="lb-size" aria-label="Alege mărimea textului și butoanelor">100%</button><button id="lb-larger" aria-label="Mărește textul și butoanele">A+</button></div><button id="lb-exit">Ieși</button></header><div class="library-board-body"><div class="library-board-heading"><div><h1 id="lb-title">Capitole de fizică</h1><p id="lb-context"></p></div><button id="lb-all">Toate</button></div><div id="lb-content" class="library-board-content"></div><footer class="library-board-pagination"><button id="lb-prev">← Înapoi</button><span id="lb-page" role="status"></span><button id="lb-next">Înainte →</button></footer></div></div>';
 document.body.append(root);
 const home=document.createElement('a');home.href='./?home=1';home.className='praxis-home-mark';home.setAttribute('aria-label','Acasă — biblioteca de fizică');home.title='Acasă — biblioteca de fizică';home.innerHTML='<img src="./assets/favicon.svg" width="32" height="32" alt="">';root.querySelector('.library-board-header').prepend(home);
 const language=window.PraxisI18n.createSelector();root.querySelector(".library-board-header").insertBefore(language,root.querySelector("#lb-exit"));
 root.querySelector(".library-board-header").insertBefore(window.PraxisSound.createToggle({compact:true}),root.querySelector("#lb-exit"));
 const by=id=>document.getElementById(id);
 const entry=document.createElement('button');entry.id='library-board-entry';entry.className='button secondary';entry.textContent='Mod tablă';entry.setAttribute('aria-pressed','false');document.querySelector('.topbar').append(entry);
 const searchDialog=document.createElement('dialog');searchDialog.id='lb-search-dialog';searchDialog.className='library-board-dialog';searchDialog.setAttribute('aria-labelledby','lb-search-title');
 searchDialog.innerHTML='<header><h2 id="lb-search-title">Caută o simulare</h2><button class="icon-button" data-close aria-label="Închide căutarea">×</button></header><label for="lb-query">Titlu sau cuvânt-cheie</label><input id="lb-query" type="search" placeholder="Ex.: lentile, oglinzi" autocomplete="off"><div class="lb-dialog-actions"><button id="lb-clear">Șterge</button><button id="lb-show-results">Vezi rezultatele →</button></div>';
 const sizeDialog=document.createElement('dialog');sizeDialog.id='lb-size-dialog';sizeDialog.className='library-board-dialog';sizeDialog.setAttribute('aria-labelledby','lb-size-title');
 sizeDialog.innerHTML='<header><h2 id="lb-size-title">Text și butoane</h2><button class="icon-button" data-close aria-label="Închide mărimea">×</button></header><label for="lb-size-select">Mărime preferată</label><select id="lb-size-select"></select><p id="lb-size-note" role="status"></p>';
 const sizeSteps=document.createElement('div');sizeSteps.className='lb-dialog-actions';sizeDialog.append(sizeSteps);
 for(const id of ['lb-smaller','lb-larger'])sizeSteps.append(root.querySelector('#'+id));
 for(const dialog of [searchDialog,sizeDialog]){document.body.append(dialog);dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});}
 for(const value of levels)by('lb-size-select').add(new Option(`${Math.round(value*100)}%`,String(value)));
 function fitDialogs(){for(const dialog of [searchDialog,sizeDialog]){dialog.style.setProperty('--library-dialog-scale',String(applied));}}
 function render(){
  if(!enabled)return;
  applied=Math.max(1,Math.floor(Math.min(desired,innerWidth/500,innerHeight/340)*20)/20);
  const width=innerWidth/applied,height=innerHeight/applied;
  root.style.setProperty('--library-scale',String(applied));root.dataset.compact=String(height<500);root.dataset.narrow=String(width<1100);
  const {selected,query}=getContext(),chapter=chapters.find(c=>c.id===selected);
  const columns=width>=1100?4:width>=750?3:2,rows=Math.max(1,Math.min(2,Math.floor((height-184)/138)));
  const entries=panel==='chapters'?chapters:findSimulations(selected,query),capacity=panel==='chapters'?columns*rows:(width>=1100&&height>=600?2:1);
  const pages=Math.max(1,Math.ceil(entries.length/capacity));page=Math.min(page,pages-1);
  const shown=entries.slice(page*capacity,(page+1)*capacity),content=by('lb-content');
  content.style.setProperty('--lb-columns',String(panel==='chapters'?columns:1));content.style.setProperty('--lb-rows',String(panel==='chapters'?rows:Math.min(capacity,Math.max(1,shown.length))));
  content.className='library-board-content '+(panel==='chapters'?'lb-chapter-grid':'lb-simulation-grid');
  by('lb-title').textContent=panel==='chapters'?'Capitole de fizică':'Simulări';
  by('lb-context').textContent=panel==='chapters'?'Alege unul dintre cele șapte capitole':(chapter?.title||'Toate capitolele')+(query.trim()?` · Căutare: ${query}`:'');
  by('lb-context').title=by('lb-context').textContent;by('lb-all').hidden=!selected&& !query;
  if(panel==='chapters')content.innerHTML=shown.map(c=>`<a class="lb-chapter" href="#capitol/${c.id}" data-board-chapter="${c.id}" style="--chapter:${c.color}"><span class="lb-chapter-icon">${icon(c)}</span><span><strong>${c.title}</strong><small>${findSimulations(c.id).length?(findSimulations(c.id).length===1?'1 simulare disponibilă':findSimulations(c.id).length+' simulări disponibile'):'În pregătire'}</small></span></a>`).join('');
  else content.innerHTML=shown.map(s=>`<article class="lb-simulation"><img src="${s.image}" alt="${s.alt}"><div><span class="eyebrow">${chapters.find(c=>c.id===s.chapter).title.toLocaleUpperCase(window.PraxisI18n.locale)}</span><h2>${s.title}</h2><p>${s.description}</p><a class="button primary" data-simulation="${s.id}" href="${s.href}">Deschide laboratorul →</a></div></article>`).join('');
  if(!shown.length)content.innerHTML='<div class="lb-empty"><h2>'+ (query.trim()?'Niciun rezultat':'Capitol în pregătire')+'</h2><p>'+(query.trim()?'Modifică termenii de căutare sau apasă „Toate”.':'Conținutul acestui capitol va fi stabilit pe parcurs.')+'</p><button id="lb-empty-all">Vezi toate simulările →</button></div>';
  by('lb-empty-all')?.addEventListener('click',()=>{setQuery('');navigateChapter('');});
  for(const id of ['lb-chapters','lb-simulations'])by(id).setAttribute('aria-pressed',String(id===`lb-${panel}`));
  by('lb-prev').disabled=page===0;by('lb-next').disabled=page>=pages-1;by('lb-page').textContent=`Pagina ${page+1} / ${pages}`;
  by('lb-size').textContent=`${Math.round(desired*100)}%`;by('lb-size').title=`Mărime aplicată: ${Math.round(applied*100)}%`;
  by('lb-smaller').disabled=desired===levels[0];by('lb-larger').disabled=desired===levels.at(-1);by('lb-size-select').value=String(desired);
  by('lb-size-note').textContent=`Mărime aleasă: ${Math.round(desired*100)}%.`+(applied<desired?` Aplicată: ${Math.round(applied*100)}%, adaptată pentru a încăpea fără derulare.`:' Alegerea se memorează pe acest dispozitiv.');fitDialogs();window.PraxisI18n.apply(document);
 }
 function setEnabled(value){enabled=value;root.hidden=!value;document.documentElement.dataset.libraryBoard=String(value);entry.setAttribute('aria-pressed',String(value));try{localStorage.setItem('praxis-library-board',String(value));}catch{}if(value){window.scrollTo(0,0);render();by('lb-chapters').focus();}else{searchDialog.close();sizeDialog.close();entry.focus();}}
 function changeSize(value){desired=value;try{localStorage.setItem('praxis-library-board-scale',String(value));}catch{}render();}
 entry.addEventListener('click',()=>setEnabled(true));by('lb-exit').addEventListener('click',()=>setEnabled(false));
 by('lb-chapters').addEventListener('click',()=>{panel='chapters';page=0;render();});by('lb-simulations').addEventListener('click',()=>{panel='simulations';page=0;render();});
 by('lb-prev').addEventListener('click',()=>{page=Math.max(0,page-1);render();});by('lb-next').addEventListener('click',()=>{page++;render();});
 by('lb-smaller').addEventListener('click',()=>changeSize(levels[Math.max(0,levels.indexOf(desired)-1)]));by('lb-larger').addEventListener('click',()=>changeSize(levels[Math.min(levels.length-1,levels.indexOf(desired)+1)]));
 by('lb-size-select').addEventListener('change',e=>changeSize(Number(e.target.value)));
 by('lb-size').addEventListener('click',()=>{render();sizeDialog.showModal();});
 by('lb-search').addEventListener('click',()=>{by('lb-query').value=getContext().query;fitDialogs();searchDialog.showModal();});
 by('lb-query').addEventListener('input',e=>{page=0;setQuery(e.target.value);});
 by('lb-clear').addEventListener('click',()=>{by('lb-query').value='';setQuery('');});
 by('lb-show-results').addEventListener('click',()=>{panel='simulations';page=0;searchDialog.close();render();});
 by('lb-all').addEventListener('click',()=>{setQuery('');navigateChapter('');page=0;render();});
 root.addEventListener('click',e=>{const link=e.target.closest('[data-board-chapter]');if(link){e.preventDefault();panel='simulations';page=0;navigateChapter(link.dataset.boardChapter);render();}});
 window.addEventListener('resize',()=>{if(enabled)render();});
 return {render,setEnabled,restore,snapshot:()=>({enabled,desired,panel,page}),resume(snapshot){if(snapshot){panel=snapshot.panel==='simulations'?'simulations':'chapters';page=Math.max(0,Number(snapshot.page)||0);}setEnabled(true);}};
}
