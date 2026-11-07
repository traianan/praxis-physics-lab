import {labNamespaces} from './lab-registry.mjs';
import {thermoReadability} from './adaptations/thermodynamics-readability.mjs';
import {cp,readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),id='notiuni-termodinamice';
const read=p=>readFile(new URL(p,root),'utf8');
const source=new URL('sources/'+id+'/site/',root),target=new URL('public/simulari/'+id+'/',root);
await mkdir(target,{recursive:true});await cp(source,target,{recursive:true});
let html=thermoReadability('notions','index.html',await read('sources/'+id+'/site/index.html'));
html=html.replace(/<header class="hero"[\s\S]*?<\/header>/,'<span id="top"></span>')
 .replace('Capitolul 1 · Elemente de termodinamică','Elemente de termodinamică').replace('>Capitolul 1<','>Prezentare<').replace('Privire înainte — 1.2 Calorimetrie','Privire înainte — Calorimetrie')
 .replace(/<link rel="manifest"[^>]*>/,'')
 .replace(/<footer>[\s\S]*?<\/footer>/,'')
 .replace(/<section class="sec" id="s12">[\s\S]*?<\/section>/,'')
 .replace(/<li><a href="#s12">[\s\S]*?<\/li>/,'')
 .replace('Corecturi la manual','Precizări importante')
 .replace(/<span>manual:[\s\S]*?<\/span>/g,'')
 .replace('Precizare la manual','Proces adiabatic și reversibilitate')
 .replace('Manualul asociază procesul adiabatic cu „entropia constantă”. Aceasta este adevărat numai pentru un proces adiabatic','Entropia rămâne constantă într-un proces adiabatic numai dacă acesta este')
 .replace(/<small>1\.1(?:\.\d+)?<\/small>/g,'')
 .replace(/1\.1\.\d+\s*·\s*/g,'')
 .replace(/\s*\((?:Fig\.|vezi Fig\.|Fig\. E)\s*1\.1\.[^)]*\)/g,'')
 .replace(/(Activitate experimentală|Exercițiul|Exercițiu)\s*1\.1\.[\d.]+/g,'$1')
 .replace(/\s*·?\s*§1\.1\.[\d.]+/g,'')
 .replace(/<a href="https?:[\s\S]*?<\/a>/g,'')
 .replaceAll('href="../index.html"','href="../calcul-vectorial/index.html"')
 .replace('href="../unde-mecanice/"','href="../unde-mecanice/index.html"')
 .replace('Denumirea corectă, conform SR ISO 31-9/1995, este','Se mai numește')
 .replace(/este cantitatea de substanță care conține atâtea entități[\s\S]*?Cantitatea de substanță se notează/,String.raw`este cantitatea de substanță care conține exact \(6{,}02214076\cdot10^{23}\) entități elementare (atomi, molecule, ioni…). Cantitatea de substanță se notează`)
 .replace(/este fracțiunea[\s\S]*?Atunci/,String.raw`este unitatea SI a temperaturii termodinamice, definită prin valoarea exactă a constantei lui Boltzmann. Pentru un termometru ideal calibrat la punctul triplu al apei se folosește relația:`)
 .replace(/\(Fig\. 1\.1\.[\s\S]*?volumul gazului să rămână constant\)/,'(balon cu gaz și manometru; volumul gazului se menține constant)')
 .replace('1/273,16 din temperatura punctului triplu al apei','unitatea SI a temperaturii termodinamice, definită prin constanta lui Boltzmann');
// Avoid decorations and publisher numbering in the shared lesson navigation.
html=html.replace(/<div class="chap rv">[\s\S]*?<\/div>\s*<\/section>/, '</section>')
 .replace(/<p>Capitolul are șapte părți[\s\S]*?<\/p>/,'')
 .replace('Coperta capitolului arată un','Diagrama interactivă prezintă o')
 .replace('<span>coperta capitolului (p. 3)</span>','')
 .replace(/<span>AE 1\.1\.[^<]*<\/span>/g,'')
 .replace(/<div class="num">\d+<\/div>/g,'').replace(/(<nav class="toc"[\s\S]*?<\/nav>)/,nav=>nav.replace(/<span>\d+<\/span>/g,'').replace('1.1 · Cuprins','Cuprins'));
html=html.replace(/<section class="sec" id="(s\d+)"/g,(all,sectionId)=>{
 const title=html.match(new RegExp('<a href="#'+sectionId+'">([^<]*)</a>'))?.[1]||sectionId;
 return all+' data-thermo-title="'+title.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"';
});
html=html.replace('Fig. 4 — Laboratorul molului','Fig. 4 — Masă molară și cantitate de substanță')
 .replace('M<sub>r</sub> · ν · N · m · amestecuri','M<sub>r</sub>, μ, ν, N, m, amestecuri');
html=html.replace('Fig. 0 — Ciclul motorului cu aprindere prin scânteie','Fig. 0 — Ciclurile ideale Otto și Diesel')
 .replace('<canvas></canvas>','<div class="tabs" role="group" aria-label="Ciclul ideal"><button class="btn on" type="button" data-mode="otto">Otto</button><button class="btn" type="button" data-mode="diesel">Diesel</button></div><canvas></canvas>')
 .replace('<dl class="ro c3">','<dl class="ro"><div><dt>r = V<sub>max</sub>/V<sub>min</sub></dt><dd data-o="r">—</dd></div>')
 .replace('p / p<sub>atm</sub>','p / p<sub>0</sub>')
 .replace('efectuat de gaz la fiecare rotație','efectuat de gaz la fiecare ciclu')
 .replace('Punctul roșu parcurge ciclul; aria colorată este lucrul mecanic util dintr-un ciclu.','<span data-in="otto">Otto ideal: 1→2 compresie adiabatică; 2→3 încălzire izocoră; 3→4 destindere adiabatică; 4→1 răcire izocoră.</span><span data-in="diesel">Diesel ideal: a→b compresie adiabatică; b→c încălzire izobară; c→d destindere adiabatică; d→a răcire izocoră.</span><p>Admisia și evacuarea au aceeași presiune p₀. Aria închisă de ciclul termodinamic reprezintă lucrul mecanic util.</p>');
const namespaces=await labNamespaces('notiuni-termodinamice'),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces){try{embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));}catch{embedded[lang][ns]={locale:lang,namespace:ns,messages:{}};}}
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/thermodynamics.css'];
const head=styles.map(path=>'<link rel="stylesheet" href="../../'+path+'">').join('')+'<script src="../../shared/i18n.js"></script><script>window.PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded})+');</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','velocity-labels.js','ideal-engine-cycles.js'].map(name=>'<script src="../../shared/'+name+'"></script>').join('');
html=html.replace('</head>',()=>head+'</head>').replace('<body>','<body data-praxis-laboratory="true" data-praxis-course="'+id+'"><div id="praxis-original" lang="ro">').replace('</body>','</div><script src="../../shared/course.js" data-course="'+id+'" data-title="Noțiuni termodinamice de bază" defer></script><script src="../../shared/thermodynamics.js" defer></script></body>');
await writeFile(new URL('index.html',target),html);
let base=thermoReadability('notions','js/baza.js',await read('sources/'+id+'/site/js/baza.js'));
base=base.replace("const out=inp.parentElement.querySelector('output');","const out=inp.closest('label').querySelector('output');").replace("const S={on:localStorage.getItem('nt-sound')!=='0'};","const S={on:window.PraxisSound.enabled};")
 .replace('if(!S.on)return null;','if(!S.on||!window.PraxisSound.enabled||document.hidden)return null;')
 .replace("S.set=on=>{S.on=on;localStorage.setItem('nt-sound',on?'1':'0');",'S.set=on=>{S.on=on;')
 .replace('return S;','window.addEventListener("praxis-sound-change",()=>S.set(window.PraxisSound.enabled));document.addEventListener("visibilitychange",()=>{if(document.hidden&&ac)ac.suspend();});return S;')
 .replace('if(this.raf)return;','if(this.raf||document.hidden)return;')
 .replace('if(!this.vis)return;','if(!this.vis||document.hidden)return;')
 .replace('this.draw&&this.draw(this.ctx,this.w,this.h)','this.draw&&this.draw(this.ctx,this.w,this.h)');
// Both text passes use the same deferred labels; flush only once after drawing geometry.
base=base.replace('ctx.strokeText(s,px,py);ctx.fillText(s,px,py);','window.PraxisVelocityLabels.label(ctx,s,px,py,{anchorBounds:true});')
 .replace('this.ctx.clearRect(0,0,this.w,this.h);this.draw&&this.draw(this.ctx,this.w,this.h)','this.ctx.clearRect(0,0,this.w,this.h);this.cv.forEach(c=>window.PraxisVelocityLabels.begin(c.getContext("2d"),c._w,c._h));this.draw&&this.draw(this.ctx,this.w,this.h);this.cv.forEach(c=>window.PraxisVelocityLabels.flush(c.getContext("2d")))');
base+='\ndocument.addEventListener("visibilitychange",()=>{if(!document.hidden)ALL.filter(s=>s.vis).forEach(s=>s.loop());});\n';
await writeFile(new URL('js/baza.js',target),base);
for(const file of ['figuri-1.js','figuri-2.js']){
 let code=thermoReadability('notions','js/'+file,await read('sources/'+id+'/site/js/'+file));
 if(file==='figuri-1.js'){
  const start=code.indexOf('/* ---------- Fig. 0'),end=code.indexOf('/* ---------- Fig. 1',start);
  if(start<0||end<0)throw new Error('Engine source block not found');
  code=code.slice(0,start)+await read('scripts/adaptations/thermodynamics-engine.js')+'\n'+code.slice(end);
 }
 if(file==='figuri-1.js'){
  const oldBox="txt(ctx,l,bx[i],y,{color:c,font:'italic 600 16px \"Source Serif 4\", Georgia, serif'})";
  const newBox="window.PraxisCanvasTypography.textInBox(ctx,l,{x:bx[i]-bw/2,y:y-24,w:bw,h:48},{color:c,font:'italic 600 16px \"Source Serif 4\", Georgia, serif'})";
  if(!code.includes(oldBox))throw new Error('Mole conversion label not found');code=code.replace(oldBox,newBox);
  const oldName="txt(ctx,plain(q[0]),x0-6,y+bh/2,{font:MONO,align:'right',color:on?COL.a:COL.r})";
  const newName="window.PraxisCanvasTypography.textInBox(ctx,plain(q[0]),{x:4,y,w:x0-14,h:bh},{font:MONO,color:on?COL.a:COL.r})";
  if(!code.includes(oldName))throw new Error('Molar mass bar label not found');code=code.replace(oldName,newName);
  const oldValue="txt(ctx,String(v),x0+(x1-x0-50)*v/mx+6,y+bh/2,{font:MONO,align:'left',color:on?COL.a:COL.muted})";
  const newValue="window.PraxisCanvasTypography.textInBox(ctx,String(v),{x:x0+(x1-x0-50)*v/mx+6,y,w:32,h:bh},{font:MONO,color:on?COL.a:COL.muted})";
  if(!code.includes(oldValue))throw new Error('Molar mass bar value not found');code=code.replace(oldValue,newValue);
  const oldAtom="txt(ctx,e,x,y+1,{font:'600 12px \"JetBrains Mono\", monospace',color:e==='H'?COL.r:'#fff'})";
  const newAtom="window.PraxisCanvasTypography.textInBox(ctx,e,{x:x-r,y:y-r,w:2*r,h:2*r},{font:'600 12px \"JetBrains Mono\", monospace',color:e==='H'?COL.r:'#fff'})";
  if(!code.includes(oldAtom))throw new Error('Molecule atom label not found');code=code.replace(oldAtom,newAtom);
 }
 code=code.replace(/exercițiul 1\.1\.[\d.]+/g,'exercițiul despre amestec');await writeFile(new URL('js/'+file,target),code);
}
let lesson=await read('sources/'+id+'/site/js/lectie.js');
lesson=lesson.replace(/\/\* ---------- Fundalul eroului:[\s\S]*?(?=\/\* ---------- Cuprins complet)/,'').replace(/\/\* PWA:[\s\S]*$/,'');
lesson=lesson.replace("items.forEach(it=>it.n=norm([it.t,it.sub||'',it.full||''].join(' ')));",`function indexTerms(){items.forEach(it=>{const source=[it.t,it.sub||'',it.full||''];it.n=norm([...source,...source.map(value=>window.PraxisI18n.tr(value))].join(' '));});}indexTerms();window.addEventListener('load',()=>{indexTerms();render();});window.addEventListener('praxis-language-change',()=>{indexTerms();render();});`);
lesson=lesson.replace("function go(id){const el=document.getElementById(id);if(!el)return;close();","function go(id){const el=document.getElementById(id);if(!el)return;window.PraxisThermodynamicsTabs?.reveal(el);close();");
lesson=lesson.replace('${lab} · ${it.num}','${lab}');
lesson=lesson.replace('sub:txt.slice(0,140)','sub:txt').replace("mark((it.sub||'').slice(0,110),ws)","mark(window.PraxisI18n.tr(it.sub||'').slice(0,110),ws)").replace("TYPE[it.type]+' · '","window.PraxisI18n.tr(TYPE[it.type])+' · '");
lesson=lesson.replace("gq.addEventListener('input',gf);gf();","gq.addEventListener('input',gf);window.addEventListener('praxis-language-change',()=>queueMicrotask(gf));gf();");
lesson=lesson.replace('SND.set(!SND.on);','window.PraxisSound.setEnabled(!window.PraxisSound.enabled);');
lesson=lesson.replace('renderMathInElement(document.body,','renderMathInElement(document.getElementById("praxis-original"),');
await writeFile(new URL('js/lectie.js',target),lesson);
const files=[];
async function inventory(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isDirectory())await inventory(new URL(e.name+'/',dir),prefix+e.name+'/');else files.push({path:prefix+e.name,sha256:createHash('sha256').update(await readFile(new URL(e.name,dir))).digest('hex')});}}
await inventory(source);await writeFile(new URL('docs/imported-thermodynamics.json',root),JSON.stringify({id,source:'sources/'+id+'/site',files,excluded:'Textbook references and errata section, publisher numbering, decorative hero and original PWA registration'},null,2)+'\n');
console.log('Noțiuni termodinamice integrate cu sursele originale păstrate.');
