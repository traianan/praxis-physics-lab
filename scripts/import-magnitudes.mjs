import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {labNamespaces} from './lab-registry.mjs';
import {withFavicon} from './favicon.mjs';

const id='marimi-fizice-unitati',root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const write=async(path,value)=>{const url=new URL(path,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,value,'utf8');};
const source='sources/'+id+'/site/',target='public/simulari/'+id+'/';
const translations=JSON.parse(await read('scripts/adaptations/magnitudes-en.json'));
const englishQuantityNames=Object.fromEntries(['Lungime','Masă','Timp','Arie','Volum','Viteză','Densitate','Forță','Presiune','Energie','Putere','Temperatură'].map(name=>[name,translations[name]]));
const messages={ro:{},en:{}};
for(const [ro,en] of Object.entries(translations)){messages.ro[ro]=ro;messages.en[ro]=en;}
for(const lang of ['ro','en'])await write('public/locales/labs/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'labs/'+id+'/ui',messages:messages[lang]},null,2)+'\n');

await cp(new URL(source,root),new URL(target,root),{recursive:true,force:true});
let html=await read(source+'index.html');
html=html.replace('Simbolurile unităților se scriu cu <b>literă mică</b>, cu excepția celor provenite din nume proprii: <b>A</b> (Ampère), <b>K</b> (Kelvin), <b>N</b> (Newton), <b>J</b> (Joule).','Simbolurile unităților se scriu cu <b>literă mică</b>, cu excepția celor provenite din nume proprii: <b>A</b> (Ampère), <b>K</b> (Kelvin), <b>N</b> (Newton), <b>J</b> (Joule). Numele unităților se scriu cu literă mică: ampere, kelvin, newton, joule.');
html=html.replace('<b>Precizia</b> unui instrument este cea mai mică diviziune a scalei sale.','<b>Rezoluția</b> (numită uneori precizia instrumentului în programa școlară) este cea mai mică diviziune a scalei sale.');
html=html.replace(/<link rel="preconnect"[^>]*>\s*/g,'').replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>\s*/g,'');
html=html.replace('<link rel="stylesheet" href="css/style.css">','');
html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'<header class="topbar" hidden aria-hidden="true"><button id="btnDisplay"></button><div id="displayPop" hidden><button data-scale="1"></button><input id="optContrast" type="checkbox"></div><button id="btnLibrary"></button><button id="btnBoard"></button><button id="btnSound"></button><button id="btnHelp"></button></header>');
html=html.replace(/<nav class="crumbs"[\s\S]*?<\/nav>/,'');
html=html.replace(/<section class="hero">[\s\S]*?<\/section>/,'');
html=html.replace(/<a class="skip" href="#main">[\s\S]*?<\/a>/,'');
html=html.replace(/<footer[\s\S]*?<\/footer>/,'');
html=html.replace('<main id="main" class="wrap">','<main id="praxis-original" class="wrap" tabindex="-1">');
html=html.replace(/(<section class="panel[^\"]*"[^>]*id="panel-(?:convertor|prefixe|dimensiuni|test)"[^>]*)(>)/g,'$1 data-workspace-layout$2');
html=html.replace(/<span class="m"/g,'<span class="m" data-no-science-math')
 .replace(/<div class="f-main"/g,'<div class="f-main" data-no-science-math');
html=html.replace(/<(p|li|td|th)(\b[^>]*)>/gi,(tag,name,attrs)=>/\bdata-no-science-math\b/i.test(attrs)?tag:`<${name} data-no-science-math${attrs}>`);
html=html.replace('<button class="chip is-on" data-chapter="all">','<button class="chip" aria-pressed="false" data-chapter="all">')
 .replace('<button class="chip" data-chapter="1">','<button class="chip is-on" aria-pressed="true" data-chapter="1">')
 .replace(/(<article class="card chapter"[^>]*data-ch="[2-6]"[^>]*)(>)/g,'$1 hidden$2');
html=html.replace('<div class="tabbar">','<div class="tabbar">');
html=html.replace('>Preferințe laborator</button>','>Afișare numere & test</button>');
html=html.replace('<body>','<body data-praxis-course="'+id+'" data-praxis-laboratory="true">');
const namespaces=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of namespaces)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','design-system/whiteboard.css'];
const commonScripts=['i18n.js','sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','whiteboard.js'];
const head=styles.map(path=>'<link rel="stylesheet" href="../../'+path+'">').join('')+
 '<link rel="stylesheet" href="./css/style.css?v=stepper-1"><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded}).replaceAll('</script','<\\/script')+');</script>'+commonScripts.filter(path=>path!=='i18n.js').map(path=>'<script src="../../shared/'+path+'"></script>').join('');
html=html.replace('</head>',head+'</head>')
 .replace('<script type="module" src="js/app.js">','<script type="module" src="js/app.js">')
 .replace('</body>','<script src="../../shared/course.js" data-course="'+id+'" data-title="Mărimi fizice și unități de măsură" data-subtitle="Măsurare și unități SI"></script></body>');
html=withFavicon(html.replace(/<main id="praxis-original" class="wrap" tabindex="-1">/,'<main id="praxis-original" class="wrap" tabindex="-1">'));
html=html.replace(/^[ \t]+$/gm,'');
const boardEntry=`<script>(()=>{if(document.body.dataset.praxisCourse!=='${id}'||!window.PraxisWhiteboard?.open)return;const actions=document.querySelector('.praxis-lab-actions');if(!actions)return;const entry=document.createElement('button');entry.type='button';entry.id='board-mode';entry.className='button secondary site-board-button praxis-whiteboard-entry';entry.dataset.sound='none';const translate=()=>{entry.textContent=window.PraxisI18n?.tr('Mod tablă')||'Mod tablă';};translate();window.addEventListener('praxis-language-change',translate);actions.append(entry);})();</script>`;
html=html.replace('</body>',boardEntry+'</body>');
await write(target+'index.html',html);

let theoryApp=await read(source+'js/app.js');
theoryApp=theoryApp.replace("CHIPS.forEach(c => c.classList.toggle('is-on', c.dataset.chapter === ch));", "CHIPS.forEach(c => { const selected = c.dataset.chapter === ch; c.classList.toggle('is-on', selected); c.setAttribute('aria-pressed', String(selected)); });")
 .replace("$$('[data-goto-chapter]').forEach(a => a.addEventListener('click', e => {\n  e.preventDefault(); showTab('teorie'); showChapter(a.dataset.gotoChapter);\n}));", () => "$$('[data-goto-chapter]').forEach(a => a.addEventListener('click', e => {\n  e.preventDefault(); showTab('teorie'); showChapter(a.dataset.gotoChapter);\n}));\nshowChapter('1');");
await write(target+'js/app.js',theoryApp);

let css=await read(source+'css/style.css');
css=css.replace(/@import\s+[^;]+;/g,'')
 .replace(/:root\b|\bhtml\b|\bbody\b/g,':scope')
 .replace(':scope { font-size: calc(16px * var(--scale)); -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }',':scope { scroll-behavior: smooth; }')
 .replace("--f-ui: 'Lexend', 'Segoe UI', sans-serif;",'--f-ui: var(--praxis-font-ui, Segoe UI, Arial, sans-serif);')
 .replace("--f-math: 'Noto Serif', 'Cambria Math', Georgia, serif;",'--f-math: Cambria Math, Georgia, serif;')
 .replaceAll('border-left: 3px solid var(--green)','border-left: 0')
 .replace('.f-main { font-family: var(--f-math); font-size: 1.12rem; display: flex; align-items: center; flex-wrap: wrap; gap: .15rem; }', '.f-main { font-family: var(--f-math); font-size: 1.12rem; line-height: 1.5; }')
 .replace('.tag { font-size: .66rem; font-weight: 600; letter-spacing: .08em; padding: .2rem .5rem;', '.tag { font-size: .72rem; font-weight: 600; letter-spacing: .08em; padding: .5rem .65rem;')
 .replace('.f-note { font-size: .74rem;', '.f-note { font-size: .8rem;')
 .replace('.table-wrap { overflow-x: auto; margin: .5rem 0 1rem;', '.table-wrap { overflow-x: auto; margin: .5rem 0 1rem; padding: .5rem;')
 .replace('.lbl-muted { fill: var(--muted); font-size: 10px;', '.lbl-muted { fill: var(--muted); font-size: 11.5px;')
 .replace('.lvl-tag { display: inline-block; color: #fff; font-size: .68rem; font-weight: 600; padding: .05rem .45rem;', '.lvl-tag { display: inline-block; color: #fff; font-size: .72rem; font-weight: 600; padding: .5rem .65rem;');
css='@scope (#praxis-original) {\n'+css+'\n}\n'+`
/* Shared Praxis presentation owns display scale, language, audio and board mode. */
#praxis-original .topbar[hidden]{display:none!important}
#praxis-original{max-width:94rem;width:100%;margin:0 auto;padding:0 1rem;color:var(--praxis-color-ink);font-family:var(--praxis-font-ui,Segoe UI,Arial,sans-serif)}
#praxis-original .tabbar{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin:.4rem 0 .75rem}
#praxis-original .tabs{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}
#praxis-original .panel{padding:.7rem 0}
#praxis-original .intro{padding:1rem;margin:.5rem 0}
#praxis-original .chapter{scroll-margin-block:1rem}
#praxis-original .chapter[hidden]{display:none!important}
#praxis-original .chapter h2{margin-block:.25rem .55rem}
#praxis-original .chapter p,#praxis-original .chapter li{line-height:1.5}
#praxis-original .data-table th,#praxis-original .data-table td{padding:.45rem .6rem}
#praxis-original .unit-library[open],#praxis-original dialog[open]{max-height:85dvh;overflow:auto}
#praxis-original .popover{z-index:1200}
#praxis-original .praxis-lab-settings{display:flex;justify-content:flex-end;margin:.3rem 0}
#praxis-original [data-workspace-layout]{min-width:0}
html[data-praxis-whiteboard] #praxis-original{max-width:none;width:100%;padding:1rem 1.25rem}
html[data-praxis-whiteboard] #praxis-original [data-workspace-layout]{max-width:100%}
html[data-praxis-whiteboard] body #praxis-original [data-wb-stage].chapter{padding:1.5rem!important;font-size:24px!important;line-height:1.4}
html[data-praxis-whiteboard] body #praxis-original [data-wb-stage].chapter h3{font-size:36px!important;line-height:1.15}
html[data-praxis-whiteboard] body #praxis-original [data-wb-stage].chapter :is(p,li,.f-note,.mini){font-size:23px!important;line-height:1.4}
html[data-praxis-whiteboard] body #praxis-original [data-wb-stage] :where(button,select,label,textarea,input:not([type=checkbox],[type=radio],[type=range]),summary,[role=button],[role=slider],a[href]){font-size:21px!important}
html[data-praxis-whiteboard] body #praxis-original [data-wb-stage] :is(p,.lab-head p,.f-note){font-size:21px!important;line-height:1.4}
html[data-praxis-whiteboard] body #praxis-original [data-wb-stage] :is(h2,h3){font-size:32px!important;line-height:1.2}
@media(max-width:760px){#praxis-original{padding:0 .6rem}#praxis-original .tabbar{display:grid;grid-template-columns:1fr}#praxis-original .tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#praxis-original .chapter{padding:.6rem}}
`;
await write(target+'css/style.css',css);

// Use the application-wide audio preference; the old standalone switch stays inert in its hidden source header.
const core=await read(source+'js/core.js');
const audioStart=core.indexOf('// ---------- Sunet (WebAudio, fără fișiere) ----------');
const audioEnd=core.indexOf('// ---------- Numere ----------');
if(audioStart<0||audioEnd<0)throw new Error('Could not find the source audio adapter boundary');
const adaptedCore=core.slice(0,audioStart)+`// ---------- Praxis shared sound ----------
export function sfx(name) { try { window.PraxisSound?.play(name); } catch { /* audio indisponibil */ } }

`+core.slice(audioEnd);
await write(target+'js/core.js',adaptedCore);
let data=await read(target+'js/data.js');
data=data.replace('Volum (acceptat în SI)','Volum (acceptat pentru utilizare împreună cu SI)')
 .replace('Masă (acceptată în SI)','Masă (acceptată pentru utilizare împreună cu SI)')
 .replace('Timp (acceptată în SI)','Timp (acceptat pentru utilizare împreună cu SI)');
await write(target+'js/data.js',data);
const convertorPath=target+'js/labs/convertor.js';let convertor=await read(convertorPath);
const invalidTemperature=`    let r, html;\n    if (q.temp) {`;
const guardedTemperature=`    if (q.temp && tempToK(v, from) < 0) {\n      res.innerHTML = '<small>'+(window.PraxisI18n?.tr('Temperatura minimă admisă')||'Minimum allowed temperature')+'</small><div class="result-val">0 K ('+(window.PraxisI18n?.tr('zero absolut')||'absolute zero')+')</div>';\n      steps.innerHTML = '<li>'+(window.PraxisI18n?.tr('Temperatura absolută nu poate fi mai mică decât zero absolut (0 K).')||'Absolute temperature cannot fall below absolute zero (0 K).')+'</li>';\n      $('#cvOut').value = '';\n      return;\n    }\n    let r, html;\n    if (q.temp) {`;
if(!convertor.includes(invalidTemperature))throw new Error('Temperature validation insertion point changed');
convertor=convertor.replace(invalidTemperature,guardedTemperature)
 .replace('Exprimăm în unitatea SI:', '${window.PraxisI18n?.tr("Exprimăm în unitatea SI:")||"Express in the SI unit:"}')
 .replace('Din SI în unitatea dorită:', '${window.PraxisI18n?.tr("Din SI în unitatea dorită:")||"From SI to the target unit:"}')
 .replace('deci înmulțim cu', '${window.PraxisI18n?.tr("deci înmulțim cu")||"so multiply by"}')
 .replace('Trecem în kelvin:', '${window.PraxisI18n?.tr("Trecem în kelvin:")||"Convert to kelvins:"}')
 .replace('Unitatea finală este kelvinul (unitate SI).', '${window.PraxisI18n?.tr("Unitatea finală este kelvinul (unitate SI).")||"The target unit is the kelvin (SI unit)."}')
 .replace('Din kelvin în Celsius:', '${window.PraxisI18n?.tr("Din kelvin în Celsius:")||"From kelvins to Celsius:"}')
 .replace('Din kelvin în Fahrenheit:', '${window.PraxisI18n?.tr("Din kelvin în Fahrenheit:")||"From kelvins to Fahrenheit:"}')
 .replace('Atenție: temperatura nu poate fi sub 0 K (zero absolut)!', '${window.PraxisI18n?.tr("Atenție: temperatura nu poate fi sub 0 K (zero absolut)!")||"Warning: temperature cannot be below 0 K (absolute zero)!"}')
 .replace('esc(q.name)', 'esc(document.documentElement.lang.toLowerCase().startsWith("en")?('+JSON.stringify(englishQuantityNames)+'[q.name]||q.name):q.name)');
convertor=convertor.replace("$('#cvTo').addEventListener('change', () => { update(true); sfx('tick'); });", "$('#cvTo').addEventListener('change', () => { update(true); sfx('tick'); });\n  window.addEventListener('praxis-language-change', () => update(false));");
await write(convertorPath,convertor);

const prefixePath=target+'js/labs/prefixe.js';
let prefixe=await read(target+'js/labs/prefixe.js');
prefixe=prefixe.replace('${b.u} — ${b.n}', '${b.u} — ${window.PraxisI18n?.tr(b.n)||b.n}')
 .replace('p.n + BASES.find(b => b.u === base).n', 'p.n + (window.PraxisI18n?.tr(BASES.find(b => b.u === base).n)||BASES.find(b => b.u === base).n)')
 .replace('${esc(e[0])}', '${esc(window.PraxisI18n?.tr(e[0])||e[0])}')
 .replace('Alege m, g sau s pentru exemple din viața reală.', '${window.PraxisI18n?.tr("Alege m, g sau s pentru exemple din viața reală.")||"Choose m, g or s for real-life examples."}');
await write(prefixePath,prefixe);

const dimensionsPath=target+'js/labs/dimensiuni.js';
let dimensions=await read(target+'js/labs/dimensiuni.js');
dimensions=dimensions.replaceAll('${b.n}', '${window.PraxisI18n?.tr(b.n)||b.n}')
 .replace('cur = deck[pos++];', 'cur = deck[pos++];\n    cur.q = window.PraxisI18n?.tr(cur.q)||cur.q;\n    cur.hint = window.PraxisI18n?.tr(cur.hint)||cur.hint;')
 .replace('esc(cur.un)', 'esc(window.PraxisI18n?.tr(cur.un)||cur.un)')
 .replace('${b.n}', '${window.PraxisI18n?.tr(b.n)||b.n}')
 .replace('Exponent ${b.n}', 'Exponent ${window.PraxisI18n?.tr(b.n)||b.n}')
 .replace('Crește exponentul pentru ${window.PraxisI18n?.tr(b.n)||b.n}', '${window.PraxisI18n?.tr("Crește exponentul pentru")||"Increase the exponent for"} ${window.PraxisI18n?.tr(b.n)||b.n}')
 .replace('Scade exponentul pentru ${window.PraxisI18n?.tr(b.n)||b.n}', '${window.PraxisI18n?.tr("Scade exponentul pentru")||"Decrease the exponent for"} ${window.PraxisI18n?.tr(b.n)||b.n}')
 .replace("if (d.every(e => !e)) return '<span class=\"lbl2\">Adaugă unități fundamentale cu butoanele +/−</span>';", "if (d.every(e => !e)) return '<span class=\"lbl2\">'+(window.PraxisI18n?.tr('Adaugă unități fundamentale cu butoanele +/−')||'Add base units with the +/− buttons')+'</span>';")
 .replace('esc(cur.q.toLowerCase())', 'esc((window.PraxisI18n?.tr(cur.q)||cur.q).toLowerCase())')
 .replace("$('#dmName').textContent = 'Unitate SI: ?';", "$('#dmName').textContent = (window.PraxisI18n?.tr('Unitate SI:')||'SI unit:')+' ?';")
 .replace('`Unitate SI: <b>${esc(cur.u)}</b>', '`${window.PraxisI18n?.tr("Unitate SI:")||"SI unit:"} <b>${esc(cur.u)}</b>')
 .replace('Verifică', '${window.PraxisI18n?.tr("Verifică")||"Check"}')
 .replace('Indiciu', '${window.PraxisI18n?.tr("Indiciu")||"Hint"}')
 .replace('Golește', '${window.PraxisI18n?.tr("Golește")||"Clear"}');
dimensions=dimensions.replace("  $('#dmBase').addEventListener('click', e => {", "  window.addEventListener('praxis-language-change', () => draw(false));\n  $('#dmBase').addEventListener('click', e => {");
dimensions=dimensions.replace(/[ \t]+$/gm,'');
await write(dimensionsPath,dimensions);

// The selected theory section or activity is a separate one-screen whiteboard workspace.
await write('docs/imported-'+id+'.json',JSON.stringify({id,source:'sources/'+id+'/site',archive:'marimi-fizice-unitati.zip',languages:['ro','en'],boardWorkspaces:'Six theory chapters and four interactive panels'},null,2)+'\n');
console.log('Imported physical quantities and SI units into Elements of mathematics.');
