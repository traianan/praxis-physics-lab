import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {labNamespaces} from './lab-registry.mjs';
const root=new URL('../',import.meta.url),id='retele-electrice',source='Retele electrice/app/';
const standaloneText=s=>s.replaceAll(' (din manual)','').replaceAll(' (from the textbook)','')
 .replaceAll(', exact ca în manual (§2.4.3, §2.4.4)','').replaceAll(', as in the textbook (§2.4.3, §2.4.4)','')
 .replaceAll('Exerciții din manual','Exerciții').replaceAll('Textbook exercises','Exercises')
 .replaceAll('Exemplul din manual:','Circuit inițial:').replaceAll('Textbook example:','Initial circuit:')
 .replaceAll('exemplul din manual','circuitul inițial').replaceAll('the textbook example','the initial circuit')
 .replaceAll('Exemplu manual','Circuit inițial').replaceAll('Textbook example','Initial circuit')
 .replaceAll('exemplu din manual','circuit inițial').replaceAll('rețeaua din manual','rețeaua inițială')
 .replaceAll('problema 2.3.1','problema 1').replaceAll('problem 2.3.1','problem 1')
 .replace(/Ex\. (2\.3\.1|2\.3\.2|2\.4\.1\.1|2\.4\.2\.1|2\.4\.2\.2|2\.4\.3)(?= —)/g,(_,n)=>'Ex. '+(['2.3.1','2.3.2','2.4.1.1','2.4.2.1','2.4.2.2','2.4.3'].indexOf(n)+1));
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),s);};
const hashes={};async function original(p){const s=await read(source+p);hashes[p]=createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');return s.replaceAll('\r\n','\n');}
let html=await original('index.html');
html=html.replace(/^[ \t]*<div class="card">\s*<h3>Citește ecuația pentru fiecare nod<\/h3>[\s\S]*?<div class="node-builder" id="nodeBuilder"><\/div>\s*<\/div>/m,'');
html=html.replace('Σ<sub>k=1..n</sub> I<sub>k</sub> = 0','<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mi>I</mi><mi>k</mi></msub><mo>=</mo><mn>0</mn></mrow></math>');
html=html.replace('Valorile din manual','Resetare');
html=html.replace('id="sI1" min="0"','id="sI1" min="-4"').replace('id="sI2" min="0"','id="sI2" min="-4"').replace('id="sI3" min="0"','id="sI3" min="-8"').replace('step="0.1" value="3.5"','step="0.1" value="-3.5"');
html=html.replace('(latura de ieșire)','(latura AD)').replace('I<sub>1</sub> + I<sub>2</sub> − I<sub>3</sub> = 0','I<sub>1</sub> + I<sub>2</sub> + I<sub>3</sub> = 0').replace('<span id="sumLive">3.5</span> − I<sub>3</sub>','<span id="sumLive"></span>').replace('I<sub>3</sub> = <b id="i3Val">3.5 A</b>','Σ I = <b id="i3Val">0.0 A</b>');
html=html.replace(/^[ \t]*<button[^>]*id="gLoadEx"[^>]*>[^\n]*<\/button>\n/m,'').replace(/^[ \t]*<p class="hint">Sfat: începe cu[^\n]*<\/p>\n/m,'');
const labels=[['k-theory','Legile lui Kirchhoff'],['k-anim','Nodul electric'],['k-lab','Ochiuri de rețea'],['g-theory','Grupări'],['g-lab','Tablou de circuite'],['g-gen','Generatoare'],['g-sunt','Instrumente'],['problems','Probleme'],['quiz','Verifică-te']];
html=html.match(/<body>([\s\S]*?)<script src="js\/core.js">/)[1];
// Preserve all lesson sections and help; replace only duplicate application chrome.
html=html.replace(/<aside class="sidebar"[\s\S]*?<\/aside>/,'<aside id="sidebar" hidden></aside>');
html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'<div id="crumbs" hidden></div><div id="pillState" class="pill"><span id="ledGlobal" class="led"></span><span id="pillText"></span></div>');
html=html.replace('<main class="main">','<div class="network-main">').replace('</main>','</div>');
html=html.replace('Navighează din meniul din stânga:', 'Navighează din secțiunile lecției:');
html=html.replace('<div class="modal" id="helpModal">','<div class="modal" id="helpModal" role="dialog" aria-modal="true" aria-labelledby="network-help-title">').replace('<h3>Cum folosești aplicația</h3>','<h3 id="network-help-title">Cum folosești aplicația</h3>');
html=html.replace(/<section class="view" id="view-([^"]+)">/g,(_,key)=>`<section class="view" id="view-${key}" role="tabpanel" aria-labelledby="tab-${key}" hidden>`);
html=standaloneText(html).replace(/<span class="badge badge-[kg]">2\.4\.[34]<\/span>/g,'');
html='<nav class="tabs" role="tablist" aria-label="Secțiunea lecției">'+labels.map(([key,label])=>`<button class="tab" id="tab-${key}" data-tab="${key}" role="tab" aria-controls="view-${key}" aria-selected="false" tabindex="-1">${label}</button>`).join('')+'</nav><div class="network-extra"><button id="network-help">Ghidul lecției</button><label><input id="network-pause" type="checkbox"> Pauză animații</label></div>'+html+'<p><a data-offline-download href="retele-electrice.zip" download>Offline (ZIP)</a></p>';
let core=await original('js/core.js');
core=core.replace("if (k === 'text') e.textContent = attrs[k];", "if (k === 'text') networkSvgText(e,attrs[k]);");
core=core.replace(/const Sound = \(\(\) => \{[\s\S]*?\}\)\(\);/,await read('scripts/adaptations/networks-sound.js'));
core=core.replace("$$('.view').forEach(v => v.classList.remove('active'));",()=>"$$('.view').forEach(v => {v.classList.remove('active');v.hidden=true;});").replace("App.views[id].classList.add('active');","App.views[id].classList.add('active');App.views[id].hidden=false;");
core=core.replace("current = id;","current = id;document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});const sections=document.querySelector('.praxis-course-sections');if(sections)sections.value=id;");
let js=core+'\n'+await read('scripts/adaptations/networks-wire-currents.js');
for(const name of ['circuits','kirchhoff','grouping','problems','board']){let s=await original('js/'+name+'.js');
 if(name==='kirchhoff'){
  s=s.replace('  NodeBuilder.init();','');
  const boundary=s.indexOf('const LabK =');let node=s.slice(0,boundary);
  node=node.replace('I3: 3.5','I3: -3.5').replaceAll('S.I1 + S.I2 - S.I3','S.I1 + S.I2 + S.I3').replace('const target = +(S.I1 + S.I2).toFixed(1);','const target = -(+(S.I1 + S.I2).toFixed(1));');
  node=node.replace('M${A[0]} ${A[1]} L${P3[0]} ${P3[1]}','M${P3[0]} ${P3[1]} L${A[0]} ${A[1]}');
  node=node.replace("$('#i3Val').textContent = S.I3.toFixed(1) + ' A';","$('#i3Val').textContent = (S.closed ? sum : 0).toFixed(1) + ' A';").replace("$('#sumLive').textContent = (S.I1 + S.I2).toFixed(1);","$('#sumLive').textContent = [S.I1,S.I2,S.I3].map(v=>{v=S.closed?v:0;return v<0?'('+v.toFixed(1)+')':v.toFixed(1);}).join(' + ');");
  node=node.replaceAll('I₁ + I₂ − I₃ = 0','I₁ + I₂ + I₃ = 0').replace('I₃ = I₁ + I₂.','I₃ = −(I₁ + I₂).');
  node=node.replace("text: 'sarcina care intră'","text: 'curent care intră (+)'").replace("text: 'sarcina care iese'","text: 'curent care iese (−)'");
  node=node.replace('if (S.refs) {',`if (S.refs) {
      [[S.refs.a1,S.I1,false],[S.refs.a2,S.I2,false],[S.refs.a3,S.I3,true]].forEach(([arrow,current,right])=>{
        const path=arrow.querySelector('path'),reverse=right?current>0:current<0;
        path.setAttribute('transform',reverse?'rotate(180)':'rotate(0)');
        path.setAttribute('fill',current<0?'#fda4af':'#7dd3fc');
        arrow.style.opacity=S.closed&&Math.abs(current)>.001?'1':'0.25';
        arrow.querySelector('text').style.fill=current<0?'#fda4af':'#7dd3fc';
      });`);
  node=node.replace("(S.I1 + S.I2).toFixed(1) + ' A în nod'","[S.I1,S.I2,S.I3].filter(i=>i>0).reduce((a,b)=>a+b,0).toFixed(1) + ' A în nod'");
  s=node+s.slice(boundary);
  s=s.replace("const lhs = currents.map(c => (c.dir === 1 ? '+' : '−') + c.name).join(' ').replace(/^\\+/, '');", "const lhs = currents.map(c => c.name).join(' + ');");
  s=s.replace('Σ I = ${lhs} = 0</div>','Σ I = ${lhs} = 0</div><div class="formula-small">${currents.map(c=>c.name+(c.dir===1?" &gt; 0":" &lt; 0")).join(" · ")}</div>');
  s=s.replace("this._layer = svgEl('g', { class: 'flow-layer' }, svg);", "this._layer = svgEl('g', { class: 'flow-layer' }, svg);networkSourceGaps(svg,this._layer);");
  s=s.replace('    battSymbol(g, 470, 218, false);','').replace("    svgEl('text', { x: 470, y: 196, class: 'e-label', text: 'E, r', 'text-anchor': 'middle' }, g);",'');
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
 if(name==='grouping')s=s.replaceAll('generatoare în SERIE','generatoare în serie').replaceAll('generatoare în PARALEL','generatoare în paralel').replace("    svg.innerHTML = SVG_DEFS;", "    if(flow)flow.stop();\n    svg.innerHTML = SVG_DEFS;")
  .replace('Ty = 78','Ty = 100')
  .replace("svgEl('path', { d: `M${Lx} ${Ty} H${Rx}`, class: 'wire' }, g);", "// No conductor across the generator bank: it would short the sources.")
  .replace('H${Lx + 110}', 'H${Lx + 122}').replace('M${Lx + 158}', 'M${Lx + 146}')
  .replace('H${Lx + 150}', 'H${Lx + 152}')
  .replace('d: `M${Lx} ${By} V${Ty} H${Rx} V${By} H${Lx}`', 'd: `M${Lx} ${By} V${n > 1 ? y0 : (y0+y1)/2} H${Rx} V${By} H${Lx}`');
 if(name==='grouping')s=s.replace('const InstrumentLab = (() => {\n  function init() {','const InstrumentLab = (() => {\n  let initialized=false;\n  function init() {\n    if(initialized)return;initialized=true;');
 // Make the optimum reachable even when parallel sources have r/n below 0.1 ohm.
 if(name==='grouping')s=s.replace('const el = $(\'#sRload\'); el.value = v.Ropt.toFixed(1);',"const el = $('#sRload'); el.min=0; el.step=String(v.Ropt/Math.ceil(v.Ropt/.1)); el.value=String(v.Ropt);").replace("S.R.toFixed(1) + ' Ω'","fmt(S.R,3) + ' Ω'");
 if(name==='problems')s=s.replace('let i = 0, score = 0, answered = false;','let i = 0, score = 0, answered = false, timer;').replace('setTimeout(() => {','timer = setTimeout(() => {').replace('function restart() { i = 0;','function restart() { clearTimeout(timer); i = 0;').replace("Router.on('quiz', render);",'// Keep the current question and score when revisiting this section.');
 // The long battery plate is the positive terminal (right/bottom unless flipped).
 if(name==='board'){
  s=s.replaceAll('Inversă polaritatea','Inversează polaritatea');
  s=s.replace('<span class="mv">${v}</span>','<span class="mv">${v.split(" · ").map(value=>`<span>${value}</span>`).join("")}</span>');
  s=s.replace('piese: ${S.pieces.length} · conductori: ${S.wires.length}<br>\n        Σ puteri debitate (surse): ${fmt(P, 2)} W<br>\n        noduri distincte: ${res ? res.nodeCount : 0}<br>', '<dl class="network-balance-list"><div><dt>piese</dt><dd>${S.pieces.length}</dd></div><div><dt>conductori</dt><dd>${S.wires.length}</dd></div><div><dt>Σ puteri debitate (surse)</dt><dd>${fmt(P, 2)} W</dd></div><div><dt>noduri distincte</dt><dd>${res ? res.nodeCount : 0}</dd></div></dl>');
  s=s.replace('segs.push([prev, q.i])','segs.push([prev, q.i, wp.w.id])').replace('segs.push([prev, wp.b])','segs.push([prev, wp.b, wp.w.id])');
  s=s.replace('out.nodeSums = [];','out.nodeSums = [];out.wireSegments=networkWireCurrents(pPos,segs,elParts,out.elements);');
  s=s.replace(/    \/\/ fire „sub tensiune”[\s\S]*?    S.net = res;/,`    S.wires.forEach(w=>{w.flowSegments=res.wireSegments.filter(s=>s.wire===w.id).map(s=>({...s,id:w.id,live:Math.abs(s.I)>.005}));w.live=w.flowSegments.some(s=>s.live);});
    S.net = res;`);
  s=s.replace('function anyNear(w) { return true; }','function anyNear(w) { return !!w.live; }');
  s=s.replaceAll('S.wires.forEach(w => {','S.wires.flatMap(w=>w.flowSegments||[w]).forEach(w => {');
  s=s.replace('const I = S.pieces.reduce((m, p) => Math.max(m, Math.abs(p.I || 0)), 0);','const I = w.I || 0;');
 }
 if(name==='board')s=s.replace("const gF = svgEl('g', {}, svg);", "const gF = svgEl('g', {}, svg);networkSourceGaps(svg,gF);");
 if(name==='board')s=s.replace('const a1 = p.flip ? n2 : n1, a2 = p.flip ? n1 : n2;','const a1 = p.flip ? n1 : n2, a2 = p.flip ? n2 : n1;').replace('return s + p.E * Math.abs(p.I || 0);','return s + p.E * (p.I || 0);').replace("if (p.type === 'resistor' || p.type === 'lamp') return s + (p.I || 0) ** 2 * p.R;",'// Count only signed power supplied by sources here.').replace('<span style="color:#86efac">✔ rețea conectată</span>', '<span>Curent calculat în rețea</span>');
 js+='\n'+s;
}
js+='\n'+await read('scripts/adaptations/networks-content.js');
let problemNumber=0;js=standaloneText(js).replace(/no: '2\.[\d.]+'/g,()=>`no: '${++problemNumber}'`);
js+='\n// PRAXIS_INTEGRATION_START\n'+await read('scripts/adaptations/networks-diagrams.js')+'\n'+await read('scripts/adaptations/networks-integration.js');
await write('public/simulari/'+id+'/app.js','(()=>{\n'+js+'\n})();\n');
// Preserve scientific case (r ≠ R, η ≠ Η); never uppercase UI labels.
await write('public/simulari/'+id+'/source.css',(await original('css/style.css')).replaceAll('text-transform:uppercase','text-transform:none'));
await write('public/simulari/'+id+'/style.css',await read('scripts/adaptations/networks.css'));
const messages=Object.fromEntries(Object.entries(JSON.parse(await read('scripts/adaptations/networks-en.json'))).map(([k,v])=>[standaloneText(k),standaloneText(v)]));
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?messages:Object.fromEntries(Object.keys(messages).map(k=>[k,k]))},null,2)+'\n');
const ns=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css'];
const scripts=['sound.js','lab-header.js','canvas-resolution.js','scientific-colors.js','course-localization.js'];
const head='<link rel="stylesheet" href="source.css">'+styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+'<link rel="stylesheet" href="style.css"><script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>`<script src="../../shared/${p}"></script>`).join('');
await write('public/simulari/'+id+'/index.html','<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rețele electrice · Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true"><main id="praxis-original" class="networks math-prose">'+html+'</main><script src="app.js"></script><script src="../../shared/course.js" data-course="'+id+'" data-title="Rețele electrice" data-subtitle="Legile lui Kirchhoff, grupări și instrumente de măsură"></script></body></html>');
await write('docs/retele-electrice-source.json',JSON.stringify({source,normalization:'LF',files:hashes},null,2)+'\n');
console.log('Rețele electrice: imported all nine original sections.');
