import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {labNamespaces} from './lab-registry.mjs';
import {withFavicon} from './favicon.mjs';

const root=new URL('../',import.meta.url),id='functii-trigonometrice',source='sources/'+id+'/';
const read=path=>readFile(new URL(path,root),'utf8');
const write=async(path,value)=>{const url=new URL(path,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,value,'utf8');};
const original=await read(source+'index.html');
let html=original.match(/<html lang="ro">[\s\S]*?<\/html>/)?.[0];
let css=original.match(/<style>([\s\S]*?)<\/style>/)?.[1];
let js=original.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!html||!css||!js)throw new Error('Expected one complete self-contained source lesson.');

html=html.replace(/<style>[\s\S]*?<\/style>/,'<link rel="stylesheet" href="style.css">')
 .replace(/<script>[\s\S]*?<\/script>/,'<script src="lesson.js"></script>')
 .replace(/<header class="topbar">[\s\S]*?<\/header>/,'<header class="topbar" hidden><button id="btnBoard"></button><button id="btnText"></button><button id="btnSound"></button><button id="btnLang"></button><div id="langMenu"></div></header>')
 .replace(/<nav class="crumbs">[\s\S]*?<\/nav>/,'')
 .replace(/<div class="banner">[\s\S]*?<\/div>/,'')
 .replace(/<footer>[\s\S]*?<\/footer>/,'<footer hidden><button id="btnCookies"></button></footer>')
 .replace('<body>','<body data-praxis-course="'+id+'" data-praxis-laboratory="true">')
 .replace('<div class="wrap">','<main id="praxis-original" class="wrap" tabindex="-1">')
 .replace(/\n<\/div>\s*\n<\/body>/,'\n</main>\n</body>')
 .replace('href="#" id="btnDownload"','href="functii-trigonometrice.zip" id="btnDownload" data-offline-download download')
 .replace('Descarcă lecția (HTML)','Descarcă lecția (ZIP)');
if(html===original)throw new Error('Source wrapper adaptation failed.');
html=html.replace(/<section class="panel( active)?" id="tab-([a-z]+)">/g,(match,active,name)=>'<section class="panel'+(active||'')+'" id="tab-'+name+'" role="tabpanel" aria-labelledby="tab-button-'+name+'" tabindex="0"'+(active?'':' hidden')+'>');
html=html.replace(/<button class="tab( active)?" data-tab="([a-z]+)" role="tab" aria-selected="(true|false)">/g,(match,active,name,selected)=>'<button class="tab'+(active||'')+'" id="tab-button-'+name+'" data-tab="'+name+'" aria-controls="tab-'+name+'" role="tab" aria-selected="'+selected+'" tabindex="'+(selected==='true'?'0':'-1')+'">');
const sharedStyles=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','design-system/whiteboard.css','shared/course.css'];
const sharedScripts=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','whiteboard.js'];
html=html.replace('</head>',sharedStyles.map(path=>'<link rel="stylesheet" href="../../'+path+'">').join('')+'<script src="../../shared/i18n.js"></script>'+sharedScripts.map(path=>'<script src="../../shared/'+path+'"></script>').join('')+'</head>');
html=html.replace('</body>','<script src="../../shared/course.js" data-course="'+id+'" data-title="Funcții trigonometrice" data-subtitle="Sinus, cosinus, tangentă și cotangentă — de la cercul unitate la grafic și fizică"></script><script>(()=>{if(document.body.dataset.praxisCourse!=="'+id+'")return;const root=document.getElementById("praxis-original"),i18n=window.PraxisI18n;if(!root||!i18n)return;const observer=new MutationObserver(records=>{for(const record of records){const target=record.target.nodeType===Node.TEXT_NODE?record.target.parentElement:record.target;if(target?.closest("svg,script,style,code,pre"))continue;if(record.type==="childList"){for(const node of record.addedNodes){if(node.nodeType===Node.TEXT_NODE)node.parentElement&&i18n.apply(node.parentElement);else if(node.nodeType===Node.ELEMENT_NODE&&!node.closest("svg,script,style,code,pre"))i18n.apply(node);}}else if(target)i18n.apply(target);}});observer.observe(root,{subtree:true,childList:true,characterData:true});})();</script><script>(()=>{if(document.body.dataset.praxisCourse!=="'+id+'"||!window.PraxisWhiteboard?.open)return;const actions=document.querySelector(".praxis-lab-actions");if(!actions)return;const entry=document.createElement("button");entry.type="button";entry.id="board-mode";entry.className="button secondary site-board-button praxis-whiteboard-entry";entry.dataset.sound="none";const translate=()=>{entry.textContent=window.PraxisI18n?.tr("Mod tablă")||"Mod tablă";};translate();window.addEventListener("praxis-language-change",translate);actions.append(entry);})();</script></body>');
html=withFavicon(html.replace(/<title>[\s\S]*?<\/title>/,'<title>Funcții trigonometrice · Praxis Science Lab</title>'));

css=css.replace(/@import\s+[^;]+;/g,'').replace(/:root\b|\bhtml\b|\bbody\b/g,':scope')
 .replace('font-family:"Segoe UI",Roboto,-apple-system,"Helvetica Neue",Arial,sans-serif;','font-family:var(--praxis-font-ui,Segoe UI,Arial,sans-serif);')
 .replace('.wrap{max-width:1180px;margin:0 auto;padding:0 22px}', '.wrap{max-width:96rem;width:100%;min-width:0;margin:0 auto;padding:0 1rem}')
 .replace('@media (max-width:960px){\n    .grid2,.theory-grid,.examples{grid-template-columns:1fr}', '@media (max-width:960px){\n    .grid2,.theory-grid,.examples{grid-template-columns:repeat(2,minmax(0,1fr))}')
 .replace(/\.top-actions\{margin-left:0;width:100%\}\s*/,'');
css='@scope (#praxis-original) {\n'+css+'\n}\n'+[
 '#praxis-original{max-width:96rem;width:100%;margin-inline:auto;padding:0 clamp(.65rem,2vw,1.5rem);color:var(--praxis-color-ink);font-family:var(--praxis-font-ui,Segoe UI,Arial,sans-serif)}',
 '#praxis-original .topbar[hidden],#praxis-original .panel[hidden]{display:none!important}',
 '#praxis-original .tabbar{margin:0 0 .75rem;gap:.75rem}',
 '#praxis-original .tabs{gap:.4rem}',
 '#praxis-original .tab{min-height:48px;padding:10px 16px;font-size:1rem;touch-action:manipulation}',
 '#praxis-original .panel{min-width:0;max-width:100%;scroll-margin-block:1rem}',
 '#praxis-original .theory-screen[hidden]{display:none!important}',
 '#praxis-original .theory-pager{display:flex;flex-wrap:wrap;gap:.4rem;width:max-content;max-width:100%;margin:0 0 1rem;padding:.3rem;border:1px solid var(--praxis-color-border);border-radius:12px;background:var(--praxis-color-primary-soft)}',
 '#praxis-original .theory-screen-tab{min-height:48px;padding:.6rem 1rem;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--praxis-color-ink);font:600 1rem/1.3 var(--praxis-font-ui,Segoe UI,Arial,sans-serif);cursor:pointer;touch-action:manipulation}',
 '#praxis-original .theory-screen-tab[aria-selected="true"]{background:var(--praxis-color-primary);color:var(--praxis-color-on-primary,#fff)}',
 '#praxis-original .theory-screen-tab:focus-visible{outline:3px solid var(--praxis-color-focus,#b46b12);outline-offset:2px}',
 '#praxis-original .theory-screen .theory-grid{margin-top:0}',
 '#praxis-original .card{min-width:0}',
 '#praxis-original .ctl-row{min-height:48px}',
 '#praxis-original .ctl-row input[type=range]{min-height:44px;touch-action:pan-y}',
 '#praxis-original .step,#praxis-original .chip,#praxis-original .unit-btn,#praxis-original .btn{min-height:44px;touch-action:manipulation}',
 '#praxis-original :is(button,a,input,summary):focus-visible{outline:3px solid #b46b12;outline-offset:3px}',
 '#praxis-original .quiz-grid{min-width:0}',
 '#praxis-original #tab-grafice{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-items:start;gap:1rem}',
 '#praxis-original #tab-grafice>.graph-card{grid-column:1;grid-row:1}',
 '#praxis-original #tab-grafice>.grid2{grid-column:2;grid-row:1;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;margin-top:0!important}',
 'html[data-praxis-whiteboard] #praxis-original{max-width:none;padding:1rem 1.25rem}',
 'html[data-praxis-whiteboard] #praxis-original [data-wb-stage]{max-width:100%;min-width:0}',
 'html[data-praxis-whiteboard] #praxis-original [data-wb-stage] .card{padding:clamp(12px,1.1vw,22px)}',
 '@media(max-width:1200px){#praxis-original #tab-grafice{display:block}#praxis-original #tab-grafice>.grid2{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px!important}}',
 '@media(max-width:760px){#praxis-original{padding:0 .55rem}#praxis-original .tabbar{display:block}#praxis-original .tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#praxis-original .tab{padding:8px 10px}#praxis-original .grid2,#praxis-original .theory-grid,#praxis-original .examples{grid-template-columns:minmax(0,1fr)}#praxis-original #tab-grafice>.grid2{grid-template-columns:minmax(0,1fr)}#praxis-original .graph-card{padding:14px 10px}}',
 '@media(max-width:380px){#praxis-original .tabs{grid-template-columns:1fr}#praxis-original .tab{width:100%}}',
 'html[data-course-touch=true] #praxis-original :is(.tab,.step,.chip,.unit-btn,.btn){min-height:52px}',
 'html[data-course-touch=true] #praxis-original .theory-screen-tab{min-height:52px}',
 'html[data-course-touch=true] #praxis-original .ctl-row input[type=range]{min-height:52px}'
].join('\n')+'\n';

js=js.replace('let soundOn = true, actx = null, lastBeep = 0;','let soundOn = window.PraxisSound?.enabled ?? true;\nwindow.addEventListener("praxis-sound-change", e => { soundOn = e.detail.enabled; const option=$("#optSound"); if(option)option.checked=soundOn; });')
 .replace(/function playTone\(freq, dur, vol, type, delay\)\{[\s\S]*?\n\}/,'function playTone(freq, dur, vol, type, delay){\n  if (!soundOn || !window.PraxisSound?.enabled) return;\n  let stop;\n  setTimeout(() => { stop=window.PraxisSound.startTone({frequency:freq||640,type:type||"sine",gain:vol||0.05}); setTimeout(()=>stop?.(),(dur||0.1)*1000); },(delay||0)*1000);\n}')
 .replace(/function beep\(freq\)\{[\s\S]*?\n\}/,'function beep(){ /* Shared Praxis sound provides interface feedback. */ }')
 .replace(/function chord\(freqs\)\{[\s\S]*?\n\}/,'function chord(){}')
 .replace(/function buzz\(\)\{[\s\S]*?\n\}/,'function buzz(){}')
 .replace('    const s = localStorage.getItem("ftg_sound");\n    if (s !== null) soundOn = (s === "1");','    soundOn = window.PraxisSound?.enabled ?? true;')
 .replace('    localStorage.setItem("ftg_sound", soundOn ? "1" : "0");','    window.PraxisSound?.setEnabled(soundOn);')
 .replace('  $$(".panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));',()=> '  $$(".panel").forEach(p => { const selected=p.id === "tab-" + name; p.classList.toggle("active",selected); p.hidden=!selected; });')
 .replace('$$(".tab").forEach(t => t.addEventListener("click", () => activateTab(t.dataset.tab)));',()=> '$$(".tab").forEach((t,index,all) => {\n  t.tabIndex=t.getAttribute("aria-selected")==="true"?0:-1;\n  t.addEventListener("click", () => activateTab(t.dataset.tab));\n  t.addEventListener("keydown",e=>{const next={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1,Home:-all.length,End:all.length}[e.key];if(next===undefined)return;e.preventDefault();const target=all[(index+next+all.length)%all.length];activateTab(target.dataset.tab);target.focus();});\n });')
 .replace('/* ================= evenimente ================= */',`/* ================= subtaburi teorie ================= */
const theoryTabs = Array.from(document.querySelectorAll("[data-theory-page]"));
function activateTheoryPage(page, focus = false){
  theoryTabs.forEach((tab,index)=>{
    const active=tab.dataset.theoryPage===page;
    tab.classList.toggle("active",active);
    tab.setAttribute("aria-selected",String(active));
    tab.tabIndex=active?0:-1;
    if(active&&focus)tab.focus({preventScroll:true});
  });
  Array.from(document.querySelectorAll("[data-theory-screen]")).forEach(screen=>{screen.hidden=screen.dataset.theoryScreen!==page;});
}
theoryTabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>activateTheoryPage(tab.dataset.theoryPage));
  tab.addEventListener("keydown",event=>{
    const next={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1,Home:-index,End:theoryTabs.length-1-index}[event.key];
    if(next===undefined)return;
    event.preventDefault();
    activateTheoryPage(theoryTabs[(index+next+theoryTabs.length)%theoryTabs.length].dataset.theoryPage,true);
  });
});
activateTheoryPage("basics");

/* ================= evenimente ================= */`)
 .replace('  $$(".tab").forEach(t => {\n    const on = t.dataset.tab === name;',()=> '  $$(".tab").forEach(t => {\n    const on = t.dataset.tab === name;\n    t.tabIndex = on ? 0 : -1;')
 .replace(/\$\("#btnBoard"\)\.addEventListener\("click", function\(\)\{[\s\S]*?\n\}\);\n\$\("#btnText"\)\.addEventListener\("click", function\(\)\{[\s\S]*?\n\}\);\n\$\("#btnSound"\)\.addEventListener\("click", function\(\)\{[\s\S]*?\n\}\);\n\$\("#btnLang"\)\.addEventListener\("click", e => \{[\s\S]*?\n\}\);/,'')
 .replace('  soundOn = $("#optSound").checked;','  soundOn = $("#optSound").checked;\n  window.PraxisSound?.setEnabled(soundOn);')
 .replace('  soundOn = true;','  soundOn = true;\n  window.PraxisSound?.setEnabled(true);')
 .replace('$("#btnCookies").addEventListener("click", () => beep(600));','')
 .replace(/\/\* descărcare \*\/[\s\S]*?\/\* ================= inițializare ================= \*\//,'/* The archive link is managed by the shared offline export. */\n/* ================= inițializare ================= */');

const namespaces=await labNamespaces(id),translations=JSON.parse(await read('scripts/adaptations/trigonometry-en.json'));
const messages={ro:Object.fromEntries(Object.keys(translations).map(key=>[key,key])),en:translations};
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:messages[lang]},null,2)+'\n');
const embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces)embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));
html=html.replace('</head>','<script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded}).replaceAll('</script','<\\/script')+');</script></head>');
const target='public/simulari/'+id+'/';
await write(target+'index.html',html.replace(/[ \t]+$/gm,''));
await write(target+'style.css',css.replace(/[ \t]+$/gm,''));
await write(target+'lesson.js',js.replace(/[ \t]+$/gm,''));
await write('docs/imported-'+id+'.json',JSON.stringify({id,source:'sources/'+id,sha256:createHash('sha256').update(await read(source+'index.html')).digest('hex'),languages:['ro','en'],activities:['teorie','animatii','grafice','fizica','exerseaza'],boardWorkspaces:5},null,2)+'\n');
console.log('Imported the trigonometry lesson into the mathematics chapter.');
