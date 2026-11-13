import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {labNamespaces} from './lab-registry.mjs';
const root=new URL('../',import.meta.url),id='retele-electrice',source='Retele electrice/app/';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),s);};
const hashes={};async function original(p){const s=await read(source+p);hashes[p]=createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');return s.replaceAll('\r\n','\n');}
let html=await original('index.html');
const labels=[['k-theory','Legile lui Kirchhoff'],['k-anim','Nodul electric'],['k-lab','Ochiuri de rețea'],['g-theory','Grupări'],['g-lab','Tablou de circuite'],['g-gen','Generatoare'],['g-sunt','Instrumente'],['problems','Probleme'],['quiz','Verifică-te']];
html=html.match(/<body>([\s\S]*?)<script src="js\/core.js">/)[1];
// Preserve all lesson sections and help; replace only duplicate application chrome.
html=html.replace(/<aside class="sidebar"[\s\S]*?<\/aside>/,'<aside id="sidebar" hidden></aside>');
html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'<div id="crumbs" hidden></div><div id="pillState" class="pill"><span id="ledGlobal" class="led"></span><span id="pillText"></span></div>');
html=html.replace('<main class="main">','<div class="network-main">').replace('</main>','</div>');
html=html.replace('Navighează din meniul din stânga:', 'Navighează din secțiunile lecției:');
html=html.replace('<div class="modal" id="helpModal">','<div class="modal" id="helpModal" role="dialog" aria-modal="true" aria-labelledby="network-help-title">').replace('<h3>Cum folosești aplicația</h3>','<h3 id="network-help-title">Cum folosești aplicația</h3>');
html=html.replace(/<section class="view" id="view-([^"]+)">/g,(_,key)=>`<section class="view" id="view-${key}" role="tabpanel" aria-labelledby="tab-${key}" hidden>`);
html='<nav class="tabs" role="tablist" aria-label="Secțiunea lecției">'+labels.map(([key,label])=>`<button class="tab" id="tab-${key}" data-tab="${key}" role="tab" aria-controls="view-${key}" aria-selected="false" tabindex="-1">${label}</button>`).join('')+'</nav><div class="network-extra"><button id="network-help">Ghidul lecției</button><label><input id="network-pause" type="checkbox"> Pauză animații</label></div>'+html+'<p><a data-offline-download href="retele-electrice.zip" download>Offline (ZIP)</a></p>';
let core=await original('js/core.js');
core=core.replace(/const Sound = \(\(\) => \{[\s\S]*?\}\)\(\);/,await read('scripts/adaptations/networks-sound.js'));
core=core.replace("$$('.view').forEach(v => v.classList.remove('active'));",()=>"$$('.view').forEach(v => {v.classList.remove('active');v.hidden=true;});").replace("App.views[id].classList.add('active');","App.views[id].classList.add('active');App.views[id].hidden=false;");
core=core.replace("current = id;","current = id;document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});const sections=document.querySelector('.praxis-course-sections');if(sections)sections.value=id;");
let js=core;
for(const name of ['circuits','kirchhoff','grouping','problems','board']){let s=await original('js/'+name+'.js');
 if(name==='kirchhoff'){
  s=s.replace('this.tick(dt);',"if(!document.hidden&&!document.getElementById('network-pause')?.checked&&this.svg.closest('.view')?.classList.contains('active')&&this.svg.getBoundingClientRect().bottom>0&&this.svg.getBoundingClientRect().top<innerHeight)this.tick(dt);");
  s=s.replace("Router.on('k-lab', () => { LabK.init(); });","Router.on('k-lab', () => { LabK.update(); });");
  s=s.replace('x2: 12, y2: -13', 'x2: 13, y2: 0');
  s=s.replace('arrow(176, 140, 31','arrow(228, 174, 31').replace('arrow(176, 296, -31','arrow(228, 262, -31');
  s=s.replaceAll("'#86efac' : '#fda4af'","'#176449' : '#a23444'");
  s=s.replace('const I1 = (P.E1 * m22 - m12 * P.E2) / det;', 'const I1 = P.closed ? (P.E1 * m22 - m12 * P.E2) / det : P.E1/(a1+R3);').replace('const I2 = (m11 * P.E2 - P.E1 * m21) / det;', 'const I2 = P.closed ? (m11 * P.E2 - P.E1 * m21) / det : 0;');
  s=s.replace('if (open) { sol.I1 = sol.I2 = sol.I3 = 0; sol.U1 = P.E1; sol.U2 = P.E2; sol.PR3 = 0; }','// The remaining closed loop is already handled by solve().');
  s=s.replace('P.closed ? sol.I1 || 0 : 0','sol.I1 || 0').replace('P.closed ? sol.I3 || 0 : 0','sol.I3 || 0');
  s=s.replace("const pRight = wire(`M${G.TR} L${G.BR}`);","const pRight = wire('M570 90 L570 221 M570 249 L570 380');");
  s=s.replace("refs.ar3.setAttribute('transform', `translate(240,240) rotate(0)${dir(sol.I3)}`);","refs.ar3.setAttribute('transform', `translate(320,240) rotate(-90)${dir(sol.I3)}`);");
  s=s.replace("x: 214, y: 232, class: 'i-label', text: 'I₃'","x: 290, y: 232, class: 'i-label', text: 'I₃'");
  s=s.replace('const p1 = E2 - I2 * (R2 + r2);','const p1 = P.closed ? E2 - I2 * (R2 + r2) : dAB;');
  s=s.replace('const r = rows[pathIdx];',"if(!P.closed)rows[1][1]=`V_A − V_B = E₂ − U_K = ${fmt(E2,2)} − (${fmt(E2-dAB,2)})`;\n    const r = rows[pathIdx];");
  s=s.replace('    // bara de putere',"    if(open&&E)E.children[2].innerHTML='<span>K deschis: I₂ = 0; U_K = E₂ − R₃I₃</span><b>'+fmt(P.E2-P.R3*sol.I3,2)+' V</b>';\n    if(!$('#kSteps').hidden)$('#kSteps').hidden=true;\n    // bara de putere");
  s=s.replace("      box.innerHTML = `<ol>","      if(!P.closed){box.innerHTML='<p>K deschis: latura 2 este întreruptă. Ochiul stâng rămâne închis.</p><p>I₂ = 0; I₁ = I₃ = E₁/(R₁+r₁+R₃) = '+fmt(sol.I1,3)+' A</p>';return;}\n      box.innerHTML = `<ol>");
  s=s.replace("open ? 'circuit deschis' : `K închis", "open ? 'K deschis · ochiul stâng activ' : `K închis");
  s=s.replace('return { init, update, P, get sol()', 'return { init, update, solve, P, get sol()');
 }
 // Instrument sliders are mounted once. Revisiting a tab must not duplicate listeners.
 if(name==='grouping')s=s.replace('const InstrumentLab = (() => {\n  function init() {','const InstrumentLab = (() => {\n  let initialized=false;\n  function init() {\n    if(initialized)return;initialized=true;');
 // Make the optimum reachable even when parallel sources have r/n below 0.1 ohm.
 if(name==='grouping')s=s.replace('const el = $(\'#sRload\'); el.value = v.Ropt.toFixed(1);',"const el = $('#sRload'); el.min=0; el.step=String(v.Ropt/Math.ceil(v.Ropt/.1)); el.value=String(v.Ropt);").replace("S.R.toFixed(1) + ' Ω'","fmt(S.R,3) + ' Ω'");
 if(name==='problems')s=s.replace('let i = 0, score = 0, answered = false;','let i = 0, score = 0, answered = false, timer;').replace('setTimeout(() => {','timer = setTimeout(() => {').replace('function restart() { i = 0;','function restart() { clearTimeout(timer); i = 0;').replace("Router.on('quiz', render);",'// Keep the current question and score when revisiting this section.');
 // The long battery plate is the positive terminal (right/bottom unless flipped).
 if(name==='board')s=s.replace('const a1 = p.flip ? n2 : n1, a2 = p.flip ? n1 : n2;','const a1 = p.flip ? n1 : n2, a2 = p.flip ? n2 : n1;').replace('return s + p.E * Math.abs(p.I || 0);','return s + p.E * (p.I || 0);').replace("if (p.type === 'resistor' || p.type === 'lamp') return s + (p.I || 0) ** 2 * p.R;",'// Count only signed power supplied by sources here.').replace('<span style="color:#86efac">✔ rețea conectată</span>', '<span>Curent calculat în rețea</span>');
 js+='\n'+s;
}
js+='\n'+await read('scripts/adaptations/networks-content.js');
js+='\n// PRAXIS_INTEGRATION_START\n'+await read('scripts/adaptations/networks-integration.js');
await write('public/simulari/'+id+'/app.js','(()=>{\n'+js+'\n})();\n');
await write('public/simulari/'+id+'/source.css',await original('css/style.css'));
await write('public/simulari/'+id+'/style.css',await read('scripts/adaptations/networks.css'));
const messages=JSON.parse(await read('scripts/adaptations/networks-en.json'));
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?messages:Object.fromEntries(Object.keys(messages).map(k=>[k,k]))},null,2)+'\n');
const ns=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css'];
const scripts=['sound.js','lab-header.js','canvas-resolution.js','scientific-colors.js','course-localization.js'];
const head='<link rel="stylesheet" href="source.css">'+styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+'<link rel="stylesheet" href="style.css"><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>`<script src="../../shared/${p}"></script>`).join('');
await write('public/simulari/'+id+'/index.html','<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rețele electrice · Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true"><main id="praxis-original" class="networks math-prose">'+html+'</main><script src="app.js"></script><script src="../../shared/course.js" data-course="'+id+'" data-title="Rețele electrice" data-subtitle="Legile lui Kirchhoff, grupări și instrumente de măsură"></script></body></html>');
await write('docs/retele-electrice-source.json',JSON.stringify({source,normalization:'LF',files:hashes},null,2)+'\n');
console.log('Rețele electrice: imported all nine original sections.');
