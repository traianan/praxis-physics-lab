import {chapters,simulations,findSimulations,getHomeSimulations,getLatestSimulations,localizeCatalog} from './catalog.js';
import {createBoardController} from './board.js';
import {prepareAdvertising} from './advertising.js';
const i18n=window.PraxisI18n;
const homeRequested=new URL(location.href).searchParams.get('home')==='1';
const chapterRequested=new URL(location.href).searchParams.get('chapter')==='1'&&chapters.some(c=>location.hash==='#capitol/'+c.id);
await i18n.init({namespaceList:['common',...chapters.map(c=>'chapters/'+c.id)]});
localizeCatalog(ns=>i18n.getNamespace(ns));
const $=id=>document.getElementById(id);
let selected='',query='',view='grid';
let board,returned=null;
try{returned=JSON.parse(sessionStorage.getItem('praxis-library-return')||'null');if(returned?.url===location.pathname+location.search+location.hash){query=String(returned.query||'');view=returned.view==='list'?'list':'grid';}}catch{}
if(homeRequested||chapterRequested){const canonical=new URL('./',location.href).pathname+(chapterRequested?location.hash:'');try{if(returned?.url===canonical)sessionStorage.removeItem('praxis-library-return');}catch{}returned=null;query='';view='grid';history.replaceState(null,'',canonical);}
const homeLogo=document.querySelector('.topbar .brand');homeLogo.href='./?home=1';homeLogo.setAttribute('aria-label','Acasă — biblioteca de fizică');homeLogo.title='Acasă — biblioteca de fizică';
const paths={motion:'<path d="M4 24h24M7 21l6-9 7 4 7-11M22 5h5v5"/><circle cx="9" cy="6" r="2"/>',wave:'<path d="M2 16c4-17 9-17 14 0s10 17 14 0M2 26h28"/>',energy:'<path d="m18 2-13 17h10l-1 11L28 12H18Z"/>',heat:'<path d="M12 21V7a4 4 0 0 1 8 0v14a7 7 0 1 1-8 0ZM16 9v15M24 6h4m-4 5h3m-3 5h4"/>',quantum:'<ellipse cx="16" cy="16" rx="14" ry="6"/><ellipse cx="16" cy="16" rx="14" ry="6" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="14" ry="6" transform="rotate(120 16 16)"/><circle cx="16" cy="16" r="2"/>',light:'<path d="M16 2Q3 16 16 30Q29 16 16 2ZM1 7h8m-8 9h7m-7 9h8m14-17 8 8-8 8"/>',circuit:'<path d="M11 6H4v20h24V6h-8M12 1v10m6-8v6M16 26v-7m-4 0h8"/><circle cx="28" cy="16" r="3"/>'};
const icon=c=>`<svg viewBox="0 0 32 32" aria-hidden="true">${paths[c.icon]}</svg>`;
const count=id=>simulations.filter(s=>s.chapter===id).length;
function renderChapters(){
 const dates=new Intl.DateTimeFormat(i18n.locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 const latestLinks=getLatestSimulations().map(sim=>`<li><a href="${sim.href}" data-simulation><span>${sim.title}</span><time datetime="${sim.addedOn}">${dates.format(new Date(sim.addedOn+'T00:00:00Z'))}</time></a></li>`).join('');
 for(const id of ['sidebar-latest-list','home-latest-list'])$(id).innerHTML=latestLinks;
 $('chapter-nav').innerHTML=`<a href="#" class="chapter-link all ${!selected?'selected':''}" ${!selected?'aria-current="page"':''}><span class="all-icon">▦</span><span>Toate capitolele</span><span class="nav-count">7</span></a>`+chapters.map(c=>`<a href="#capitol/${c.id}" class="chapter-link ${selected===c.id?'selected':''}" style="--chapter:${c.color}" ${selected===c.id?'aria-current="page"':''}><span class="nav-icon">${icon(c)}</span><span>${c.title}</span>${count(c.id)?'<span class="available-dot" aria-label="Simulare disponibilă"></span>':''}</a>`).join('');
 $('chapter-grid').innerHTML=chapters.map((c,i)=>`<a class="chapter-card" href="#capitol/${c.id}" style="--chapter:${c.color}"><span class="chapter-art">${icon(c)}</span><div><h3>${c.title}</h3><span>${count(c.id)?(count(c.id)===1?'1 simulare disponibilă':count(c.id)+' simulări disponibile'):'În pregătire'}</span></div><span class="chapter-number">0${i+1}</span></a>`).join('');
}
function render(){
 const c=chapters.find(c=>c.id===selected),found=findSimulations(selected,query);
 const home=!selected&&!query.trim(),visible=home?getHomeSimulations():found;
 document.body.dataset.libraryView=selected?'chapter':query.trim()?'search':'home';
 $('discovery-entry').hidden=!home;
 $('discovery-caption').textContent=simulations.find(s=>s.id==='oglinzi-si-lentile').title;
 $('home-latest').hidden=!home;
 $('breadcrumb-title').textContent=c?c.title.toLocaleUpperCase(i18n.locale):query.trim()?'Rezultatele căutării':'FIZICĂ';
 $('page-title').innerHTML=c?c.title:'Fizica are sens<br><span>Când o explorezi</span>';
 $('page-description').textContent=c?'Experimentele acestui capitol, adunate într-un singur loc.':'Simulări interactive pentru întrebări, predicții și descoperiri la clasă.';
 $('chapters-section').hidden=!!selected||!!query.trim();
 $('simulations-title').textContent=c?'Simulările capitolului':query.trim()?'Rezultatele căutării':'Începe cu un experiment';
 $('results-status').textContent=found.length===1?'1 laborator disponibil':found.length?`${found.length} laboratoare disponibile`:query.trim()?'Niciun rezultat pentru această căutare':'Conținutul va fi stabilit pe parcurs';
 if(home&&visible.length<found.length)$('results-status').textContent=i18n.tr('{shown} din {total} laboratoare afișate',{shown:visible.length,total:found.length});
 $('catalog-count').textContent=`${selected?'1 capitol':'7 capitole'} · ${found.length} ${found.length===1?'simulare':'simulări'}`;
 $('simulations').className=`simulation-grid ${view==='list'?'list-view':''}`;
 const renderCard=s=>`<article class="simulation-card" data-chapter="${s.chapter}"><a href="${s.href}" class="simulation-image" aria-label="${i18n.tr('Laborator interactiv')}: ${s.title}"><img src="${s.image}" alt="${s.alt}" loading="lazy" decoding="async"><span class="image-pill"><i></i> Laborator interactiv</span></a><div class="simulation-body"><div class="card-eyebrow">${chapters.find(c=>c.id===s.chapter).title.toLocaleUpperCase(i18n.locale)} <span>${String(simulations.filter(item=>item.chapter===s.chapter).indexOf(s)+1).padStart(2,'0')}</span></div><h3><a href="${s.href}">${s.title}</a></h3><p>${s.description}</p><div class="tags">${s.tags.map(t=>`<span>${t}</span>`).join('')}</div></div><div class="simulation-action"><a class="button primary" href="${s.href}">Deschide laboratorul <span aria-hidden="true">→</span></a><span>Revino la capitol din antet</span></div></article>`;
 $('simulations').innerHTML=home?chapters.filter(ch=>visible.some(s=>s.chapter===ch.id)).map(ch=>`<section class="simulation-chapter" aria-label="${ch.title}"><h3 class="simulation-chapter-title">${ch.title}</h3><div class="simulation-chapter-grid">${visible.filter(s=>s.chapter===ch.id).map(renderCard).join('')}</div></section>`).join(''):visible.map(renderCard).join('');
 $('home-more').hidden=!home;$('home-more').innerHTML=home?chapters.filter(chapter=>count(chapter.id)>2).map(chapter=>`<a class="button secondary" href="#capitol/${chapter.id}"><span>${chapter.title}</span><span>Vezi toate simulările →</span></a>`).join(''):'';
 $('empty-state').hidden=found.length>0;
 $('empty-state').innerHTML=query.trim()?'<span class="empty-symbol">⌕</span><h3>Nu am găsit o simulare.</h3><p>Încearcă „lentile”, „oglinzi” sau elimină filtrul de capitol.</p><button class="button secondary" id="reset-filters">Resetează căutarea și filtrele</button>':`<span class="empty-symbol">${c?icon(c):'✧'}</span><h3>Loc pentru următoarele experimente.</h3><p>Structura capitolului este pregătită. Simulările și conținutul vor fi adăugate pe parcurs.</p><a class="button secondary" href="#">Vezi toate capitolele →</a>`;
 $('reset-filters')?.addEventListener('click',()=>{$('search').value=query='';location.hash='';readRoute();});
 $('view-grid').setAttribute('aria-pressed',String(view==='grid'));$('view-list').setAttribute('aria-pressed',String(view==='list'));renderChapters();board?.render();i18n.apply(document);
}
const narrow=matchMedia('(max-width:850px)');
function closeChapters(){document.body.classList.remove('chapters-open');$('sidebar-shade').hidden=true;$('chapters-button').setAttribute('aria-expanded','false');if(narrow.matches&&$('chapter-panel').contains(document.activeElement))$('chapters-button').focus();$('chapter-panel').inert=narrow.matches;}
narrow.addEventListener('change',closeChapters);
function readRoute(){const id=location.hash.startsWith('#capitol/')?location.hash.slice(9):'';selected=chapters.some(c=>c.id===id)?id:'';closeChapters();render();}
window.addEventListener('hashchange',readRoute);
$('search').addEventListener('input',e=>{query=e.target.value;render();});
for(const [id,mode] of [['view-grid','grid'],['view-list','list']])$(id).addEventListener('click',()=>{view=mode;render();});
$('chapters-button').setAttribute('aria-expanded','false');
$('chapters-button').addEventListener('click',()=>{$('chapter-panel').inert=false;document.body.classList.add('chapters-open');$('sidebar-shade').hidden=false;$('chapters-button').setAttribute('aria-expanded','true');$('close-chapters').focus();});
$('close-chapters').addEventListener('click',closeChapters);$('sidebar-shade').addEventListener('click',closeChapters);
const guide=$('guide-dialog');$('guide-button').addEventListener('click',()=>guide.showModal());
const mobileGuide=document.createElement('button');mobileGuide.className='icon-button mobile-guide';mobileGuide.textContent='?';mobileGuide.setAttribute('aria-label','Ghidul bibliotecii');mobileGuide.addEventListener('click',()=>guide.showModal());document.querySelector('.topbar').append(mobileGuide);
for(const id of ['close-guide','guide-start'])$(id).addEventListener('click',()=>guide.close());
guide.addEventListener('click',e=>{const b=guide.getBoundingClientRect();if(e.target===guide&&(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom))guide.close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeChapters();if(e.key==='/'&&!guide.open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
board=createBoardController({getContext:()=>({selected,query}),icon,setQuery(value){query=value;$('search').value=value;render();},navigateChapter(id){location.hash=id?'#capitol/'+id:'';readRoute();}});
document.querySelector('.topbar').append(window.PraxisSound.createToggle());
document.querySelector('.topbar').append(i18n.createSelector());
window.addEventListener('praxis-language-change',()=>{localizeCatalog(ns=>i18n.getNamespace(ns));render();});
document.addEventListener('click',e=>{if(!e.target.closest('.simulation-card a,[data-simulation]'))return;try{sessionStorage.setItem('praxis-library-return',JSON.stringify({url:location.pathname+location.search+location.hash,query,view,board:board.snapshot()}));}catch{}});
$('search').value=query;
readRoute();
if(board.restore)board.resume(homeRequested?{panel:'chapters',page:0}:chapterRequested?{panel:'simulations',page:0}:returned?.board||(selected?{panel:'simulations',page:0}:undefined));
prepareAdvertising().catch(()=>{});
