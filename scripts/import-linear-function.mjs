import {flattenScopedCSS} from './scoped-lesson-css.mjs';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {labNamespaces} from './lab-registry.mjs';
const root=new URL('../',import.meta.url), id='functia-gradul-intai';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{const url=new URL(p,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,s);};
const source='../functia-gradul-intai/';
const messages=Object.fromEntries((await read('scripts/adaptations/linear-function-en.tsv')).trim().split(/\r?\n/).map(line=>line.split('\t')));
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?messages:Object.fromEntries(Object.keys(messages).map(k=>[k,k]))},null,2)+'\n');
let html=await read(source+'index.html');
html=html.replace(/<header class="topbar">[\s\S]*?<main id="main" class="page" tabindex="-1">/,'<main id="praxis-original" class="page" tabindex="-1">')
 .replace(/<section class="banner"[\s\S]*?<\/section>/,'')
 .replace(/<footer class="footer">[\s\S]*?<\/footer>/,'')
 .replace(/<dialog class="info-dialog"[\s\S]*?<\/dialog>/,'')
 .replace('href="#main"','href="#praxis-original"')
 .replace('<body>','<body data-praxis-course="'+id+'" data-praxis-laboratory="true">')
 .replace('id="btnDownload"','id="btnDownload" data-offline-download');
// Secondary explanations stay available without pushing the experiment below the viewport.
html=html.replace('<div class="theory-grid">','<details class="linear-reading"><summary>Teorie și formule</summary><div class="theory-grid">')
 .replace('  <!-- ================= ANIMAȚII ================= -->','  <!-- ================= ANIMAȚII ================= -->');
html=html.replace(/(<\/div>\s*)(<\/section>\s*<!-- ================= ANIMAȚII)/,'$1</details>$2');
html=html.replace('<details class="explain" open>','<details class="explain">');
html=html.replace('<div class="examples">','<details class="linear-reading"><summary>Exemple rezolvate</summary><div class="examples">')
 .replace(/(<\/div>\s*)(<\/section>\s*<!-- ================= EXERSEAZĂ)/,'$1</details>$2');
html=html.replace('<div class="quiz-summary card">','<details class="linear-reading"><summary>Recapitulare rapidă</summary><div class="quiz-summary card">')
 .replace(/(<\/div>\s*)(<\/section>\s*<div class="download-row">)/,'$1</details>$2');
html=html.replace(/<(p|li)(\s[^>]*)?>/g,(all,tag,attrs='')=>attrs.includes('equation')?all:'<'+tag+' data-no-science-math'+attrs+'>');
html=html.replace(/(<section class="panel[^\"]*" id="panel-(?:teorie|animatii|fizica)"[^>]*>\s*<div class="lab-grid">\s*)<article class="card">([\s\S]*?)<\/article>/g,(_,start,body)=>{
 const match=body.match(/^([\s\S]*?<\/h2>)(\s*<div class="graph-box[^\"]*">[\s\S]*?<\/div>)([\s\S]*)$/);
 if(!match)throw new Error('Linear scene structure changed');
 return start+'<article class="card linear-scene-card">'+match[1]+'<div class="linear-scene-body"><div class="linear-visual">'+match[2]+'</div><div class="linear-readouts">'+match[3]+'</div></div></article>';
});
html=html.replace(/<div class="formulas formulas-stack">([\s\S]*?)<\/div>\s*<details class="explain">\s*<summary>Cum interpretezi desenul\?<\/summary>/,'<details class="explain"><summary>Cum interpretezi desenul?</summary><div class="formulas formulas-stack">$1</div>');
html=html.replace('<p data-no-science-math id="physExplain">','<p data-no-science-math>Redare didactică accelerată: 4 s/s la mișcare, 3 min/s la rezervor. La Ohm se variază curentul; marcatorii nu reprezintă viteza electronilor.</p><p data-no-science-math id="physExplain">');
html=html.replace(/<div class="prefs-wrap">\s*<button[\s\S]*?<\/button>/,'<div class="prefs-wrap">')
 .replace('<h3>Ce arătăm pe grafic?</h3>','<p class="linear-prefs-title"><strong>Ce arătăm pe grafic?</strong></p>')
 .replace('class="popover prefs-popover" id="prefsPopover" hidden','class="linear-prefs" id="prefsPopover" hidden');
html=html.replace('<div class="tabbar">','<div class="tabbar" style="margin:0;padding:0">');
const ns=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css'];
const scripts=['sound.js','lab-header.js','canvas-resolution.js','canvas-typography.js','scientific-colors.js','course-localization.js'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>'<script src="../../shared/'+p+'"></script>').join('');
html=html.replace('<link rel="stylesheet" href="style.css">',head+'<link rel="stylesheet" href="style.css">')
 .replace('</body>','<script src="../../shared/course.js" data-course="'+id+'" data-title="Funcția de gradul întâi" data-subtitle="Pantă, ordonată și modele liniare în fizică"></script></body>');
await write('public/simulari/'+id+'/index.html',html.replace(/^[ \t]+$/gm,''));
let css=await read(source+'style.css');
// Scope source styles so they cannot change the shared header or dialogs.
css=css.replace(/:root\b|\bhtml\b|\bbody\b/g,':scope');
css='@scope (#praxis-original) {\n'+css+'\n}\n'+await read('scripts/adaptations/linear-function.css');
await write('public/simulari/'+id+'/style.css',await flattenScopedCSS(css));
for(const name of await readdir(new URL(source+'js/',root))){
 let js=await read(source+'js/'+name);
 if(name==='core.js'){
  js=js.replace(/  \/\* ---------- dialoguri informative ---------- \*\/[\s\S]*?  \/\* ---------- taburi ---------- \*\//,'  /* ---------- taburi ---------- */').replace('  Praxis.openInfo = openInfo;','');
  js=js.replace(/const store = \{[\s\S]*?\n  \};/,'const session = new Map(); const store = { get:(key,fallback)=>session.has(key)?session.get(key):fallback, set:(key,value)=>session.set(key,value) };');
  js=js.replace(/const sound = \{[\s\S]*?\n  \};/,'const sound = {get enabled(){return PraxisSound.enabled;},play(name){PraxisSound.play(name);},setEnabled(value){PraxisSound.setEnabled(value,{persist:false});}};');
  js=js.replace("points: true, sound: true","points: true, sound: false");
  js=js.replace(/function initChrome\(\) \{[\s\S]*?    \/\/ preferințe/,'function initChrome() {\n    // preferințe');
  js=js.replace(/    const btnPrefs = \$\('#btnPrefs'\);[\s\S]*?    const prefMap/,'    const prefMap');
  js=js.replace(/    document.addEventListener\('click', \(event\) => \{\n      if \(prefsPopover.hidden\)[\s\S]*?    \}\);/,'');
  js=js.replace(/    \/\/ informații[\s\S]*?    \/\/ taburi/,'    // taburi');
  js=js.replace("sound.setEnabled(prefs.sound, true);\n    document.dispatchEvent", "document.dispatchEvent");
  js=js.replace("const pref = $('#prefSound');", "const pref = $('#prefSound');");
  js=js.replace("    // taburi\n    initTabs();", "    window.addEventListener('praxis-sound-change',()=>{prefs.sound=PraxisSound.enabled;syncPrefControls();});\n    window.addEventListener('load',()=>{const tools=document.querySelector('.praxis-course-tools');if(tools){tools.append(prefsPopover);prefsPopover.hidden=false;document.querySelector('.tabbar')?.remove();}});\n    // taburi\n    initTabs();");
  js=js.replace("toLocaleString('ro-RO'",'toLocaleString(PraxisI18n.locale');
  js=js.replace('clamp(size / 16, 1, 1.4)','clamp(size / 16, 1, 2)');
 }
 if(name==='theory.js'){
  js=js.replace("mZero ? 'x₀ nu există'", "mZero ? (Math.abs(n)<1e-9?'Orice x real este zero':'x₀ nu există')").replace("mZero ? '—'", "mZero ? (Math.abs(n)<1e-9?'ℝ':'—')");
  js=js.replace('el.eq.textContent = P.equationLine(m, n);','PraxisMath.set(el.eq,P.equationLine(m,n));');
 }
 if(name==='animations.js')js=js.replace('el.equation.textContent = P.equationLine(m, n);','PraxisMath.set(el.equation,P.equationLine(m,n));');
 if(name==='animations.js')js=js.replace('  P.Animations =','  window.addEventListener("praxis-language-change",()=>render(true));\n  P.Animations =');
 if(name==='physics.js'){
  js=js.replace('el.equation.textContent = formula();','PraxisMath.set(el.equation,formula());').replace('el.formula.textContent = formula();','PraxisMath.set(el.formula,formula());');
  js=js.replace('ctx.lineTo(x0, y1);\n    ctx.closePath();','ctx.lineTo(x0, y1);\n    ctx.lineTo(x0, midY + 4);\n    ctx.moveTo(x0, midY - 4);\n    ctx.lineTo(x0, y0);');
  js=js.replaceAll('midY - 8','midY - 4').replaceAll('midY + 8','midY + 4');
  js=js.replaceAll("'U = ' + P.fmt(p.R * iDisp, 2) + ' V'","'E, r'");
  js=js.replace('const pos = pointOnRect(d, x0, y0, x1, y1);','const pos = pointOnRect(d, x0, y0, x1, y1);\n      if(pos.x===x0 && Math.abs(pos.y-midY)<8)continue;');
  js=js.replace('Pentru un rezistor ohmic, dependența este liniară și trece prin origine.','Pentru un rezistor ohmic, dependența este liniară și trece prin origine. Sursa ideală: r = 0 Ω, E = U.');
  js=js.replace('  P.Physics =','  window.addEventListener("praxis-language-change",()=>render());\n  P.Physics =');
 }
 if(name==='graph.js')js=js.replace('Math.min(window.devicePixelRatio || 1, 2.5)','PraxisCanvasResolution.ratio(nextW,nextH)').replace('nextH === height && canvas.width','nextH === height && canvas.width === Math.round(nextW*dpr)');
 if(name==='physics.js')js=js.replace('Math.min(window.devicePixelRatio || 1, 2.5)','PraxisCanvasResolution.ratio(rect.width,rect.height)').replace('h === height && canvas.width','h === height && canvas.width === Math.round(w*dpr)');
 if(name==='main.js')js=js.replace('    P.initChrome();','    P.initChrome();\n    const refresh=()=>{P.Theory?.render();document.dispatchEvent(new CustomEvent("praxis:theme"));window.dispatchEvent(new Event("resize"));};\n    window.addEventListener("praxis-language-change",refresh);\n    window.addEventListener("praxis-course-presentation-change",refresh);');
 await write('public/simulari/'+id+'/js/'+name,js);
}
const provenance={source:'../functia-gradul-intai',files:{}};
for(const file of ['index.html','style.css',...(await readdir(new URL(source+'js/',root))).map(f=>'js/'+f)])provenance.files[file]=createHash('sha256').update(await read(source+file)).digest('hex');
await write('docs/imported-linear-function.json',JSON.stringify(provenance,null,2)+'\n');
console.log('Integrat: Funcția de gradul întâi');
