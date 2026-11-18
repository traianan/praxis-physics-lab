import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {transform} from 'esbuild';
const root=new URL('../',import.meta.url),id='functia-gradul-al-doilea';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,text)=>{const url=new URL(p,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,text);};
const source=await read('sources/'+id+'/index.html');
let css=source.match(/<style>([\s\S]*?)<\/style>/)[1];
let js=source.match(/<script>([\s\S]*?)<\/script>/)[1];
let html=source.replace(/<style>[\s\S]*?<\/style>/,'<link rel="stylesheet" href="style.css">').replace(/<script>[\s\S]*?<\/script>/,'<script src="lesson.js"></script>');
html=html.replace('<button class="tab" data-tab="fizica" role="tab">Exemple în fizică</button>','$&<button class="tab" data-tab="exerseaza" role="tab">Exersează</button>');
html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'').replace(/<footer>[\s\S]*?<\/footer>/,'')
 .replace(/<nav class="crumbs">[\s\S]*?<\/nav>/,'').replace(/<div class="banner">[\s\S]*?<\/div>/,'')
 .replace('<body>','<body data-praxis-course="'+id+'" data-praxis-laboratory="true" data-praxis-adaptive-lab="true">')
 .replace('<div class="wrap">','<main id="praxis-original" class="wrap" tabindex="-1">').replace(/<\/div>\s*<script src="lesson.js">/,'</main><script src="lesson.js">')
 .replace('id="btnDownload"','id="btnDownload" data-offline-download').replace('Descarcă lecția (HTML)','Descarcă lecția (ZIP)');
html=html.replace(/<button class="pill" id="btnPrefs"[^>]*>[\s\S]*?<\/button>/,'').replace('class="popover" id="prefsPanel"','class="quadratic-preferences" id="prefsPanel"');
html=html.replaceAll('<h4>','<p class="quadratic-preferences-heading" id="quadratic-graph-options-title">').replaceAll('</h4>','</p>')
 .replace('class="quadratic-preferences" id="prefsPanel"','class="quadratic-preferences" id="prefsPanel" role="group" aria-labelledby="quadratic-graph-options-title"');
html=html.replaceAll('class="ctl-row"','class="ctl-row praxis-range-stepper"');
// Supplementary reading remains complete but starts collapsed.
html=html.replaceAll('<div class="theory-grid">','<details class="quadratic-reading"><summary>Teorie și formule</summary><div class="theory-grid">')
 .replace(/(<\/div>\s*)(<\/section>\s*<!-- ============ TAB: (?:ANIMAȚII|EXEMPLE))/g,'$1</details>$2')
 .replace('<div class="examples">','<details class="quadratic-reading"><summary>Exemple rezolvate</summary><div class="examples">')
 .replace(/(<\/div>\s*)(<\/section>\s*<div class="download">)/,'$1</details>$2').replace('<details class="explain" open>','<details class="explain">');
html=html.replace(/(<section class="panel[^\"]*" id="tab-[^\"]+">\s*<div class="grid2">\s*)<div class="card">([\s\S]*?)<\/div>\s*\n\s*<div class="card">/g,(_,start,body)=>{
 const match=body.match(/^([\s\S]*?<\/h2>)(\s*<div id="svg[^\"]+"><\/div>)([\s\S]*)$/);
 if(!match)throw Error('Quadratic scene structure changed');
 return start+'<div class="card quadratic-scene-card">'+match[1]+'<div class="quadratic-scene-body"><div class="quadratic-visual">'+match[2]+'</div><div class="quadratic-readouts">'+match[3]+'</div></div></div><div class="card quadratic-controls">';
});
html=html.replace('bijiectivă pe fiecare interval de monotonie.','bijiectivă de pe fiecare interval de monotonie pe imaginea sa.').replace('parabola se rotește','parabola își schimbă deschiderea').replace('deschideria','deschiderea');
html=html.replace(/<p class="hint" id="animHint">[\s\S]*?<\/p>/,'<p class="hint" id="animHint">Animația actualizează coeficienții; la a = 0 graficul este o dreaptă. Poți opri și prelua controlul manual.</p>');
html=html.replace(/<li><b>Coeficientul a se schimbă:<\/b>[\s\S]*?<\/li>/,'<li><b>Coeficientul a se schimbă:</b> a parcurge intervalul [−1,6; 1,6]. La a = 0 funcția devine liniară.</li>');
html=html.replace('Coeficientul b (deplasare laterală)','Coeficientul b (poziția axei de simetrie)').replaceAll('Traectoria','Traiectoria').replaceAll('Graviția','Gravitația');
html=html.replace('<div class="download">','<section class="panel" id="tab-exerseaza"><div id="quadratic-practice" data-no-science-math></div></section><div class="download">');
html=html.replace(/<(p|li)(\s[^>]*)?>/g,(all,tag,attrs='')=>'<'+tag+' data-no-science-math'+attrs+'>');
const ns=['common','chapters/elemente-de-matematica','courses/shared','courses/'+id+'/ui'];
const en=Object.fromEntries((await read('scripts/adaptations/quadratic-function-en.tsv')).trim().split(/\r?\n/).map(line=>line.split('\t')));
const embedded={ro:{},en:{}};
for(const lang of ['ro','en']){
 await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?en:Object.fromEntries(Object.keys(en).map(key=>[key,key]))},null,2)+'\n');
 for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
}
const head=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css'].map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+
 '<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+
 ['sound.js','lab-header.js','canvas-resolution.js','canvas-typography.js','scientific-colors.js','course-localization.js'].map(p=>'<script src="../../shared/'+p+'"></script>').join('');
html=html.replace('<link rel="stylesheet" href="style.css">',head+'<link rel="stylesheet" href="style.css">')
 .replace('<script src="lesson.js">','<script id="quadratic-model">'+await read('scripts/adaptations/quadratic-function-model.js')+'</script><script src="lesson.js">')
 .replace('</body>','<script>'+await read('scripts/adaptations/quadratic-practice.js')+'</script><script src="../../shared/course.js" data-course="'+id+'" data-title="Funcția de gradul al doilea" data-subtitle="Coeficienți, vârf, rădăcini și modele în fizică"></script></body>');
// School-board Chrome must not lose the lesson's layout when @scope is unsupported.
const animations=[];
for(let match;(match=/@keyframes\s+[\w-]+\s*\{/.exec(css));){
 let end=match.index+match[0].length,depth=1;
 while(depth&&end<css.length){if(css[end]==='{')depth++;else if(css[end]==='}')depth--;end++;}
 animations.push(css.slice(match.index,end));css=css.slice(0,match.index)+css.slice(end);
}
css=(await transform(':where(#praxis-original){\n'+css.replace(/:root\b|\bhtml\b|\bbody\b/g,'&')+'\n}',{loader:'css',target:'chrome100'})).code+'\n'+animations.join('\n')+'\n'+await read('scripts/adaptations/quadratic-function.css');
js=js.replace(/\/\* sunet \*\/[\s\S]*?\/\* ---------------- hartă grafic ---------------- \*\//,'const prefs={grid:true,roots:true,vertex:true,inter:true};\nfunction beep(){PraxisSound.play("select");}\n/* ---------------- hartă grafic ---------------- */');
js=js.replace('toLocaleString("ro-RO"','toLocaleString(PraxisI18n.locale');
js=js.replace('$("#tileDelta").textContent = fmt(d, 2);','$("#tileDelta").textContent = S.a===0?"—":fmt(d,2);')
 .replaceAll('$("#tileD").textContent = fmt(delta(),2);','$("#tileD").textContent = S.a===0?"—":fmt(delta(),2);');
js=js.replace('niceStep(m.win.x1 - m.win.x0, 10)','niceStep(m.win.x1 - m.win.x0, 10/(parseFloat(getComputedStyle(document.documentElement).fontSize)/16))').replace('niceStep(m.win.y1 - m.win.y0, 8)','niceStep(m.win.y1 - m.win.y0, 8/(parseFloat(getComputedStyle(document.documentElement).fontSize)/16))');
js=js.replace(/function roots\(\)\{[\s\S]*?\n\}/,'function roots(){return QuadraticModel.roots(S.a,S.b,S.c)||[];}');
js=js.replace('return {h:h, k:f(h)};','return S.a===0?{h:NaN,k:NaN}:{h:h,k:f(h)};');
js=js.replace('S.a = Math.abs(a) < 0.06 ? (a < 0 ? -0.06 : 0.06) : a;','S.a = Math.abs(a)<1e-12?0:a;');
js=js.replace('if (key === "a" && Math.abs(v) < 0.05) v = v < 0 ? -0.05 : 0.05;','').replace('if (key === "a" && Math.abs(v) < 0.05) v = b.dataset.d > 0 ? 0.05 : -0.05;','');
js=js.replace('const step = key === "a" ? 0.1 : 0.2;','const step = key === "a" ? 0.05 : 0.1;');
js=js.replace('const AN_WIN = {x0:-9, x1:9, y0:-11, y1:11};','const AN_WIN = {x0:-9, x1:9, y0:-11, y1:11};');
js=js.replace('label((roots().length === 2 ? (i === 0 ? "x₁" : "x₂") : "x₀"), X, m.Y(0) + 20, "#a4462f")','rootMarkerLabel(i,X,m.Y(0))')
 .replace('label((roots().length === 2 ? (i === 0 ? "x₁" : "x₂") : "x₀"), m.X(r), m.Y(0) + 20, "#a4462f")','rootMarkerLabel(i,m.X(r),m.Y(0))')
 .replace(/label\("V\("[^\n]+?"start"\)/g,match=>match.includes('X + 12')?'vertexMarkerLabel(V,X,Y)':'vertexMarkerLabel(V,m.X(V.h),m.Y(V.k))')
 .replace('label("(0; " + fmt(S.c,2) + ")", X + 10, Y - 10, "#1c5b3f", "start", 12)','interceptMarkerLabel(V,X,Y)')
 .replace(/label\("P\("[^\n]+?"start"\)/g,'pointMarkerLabel(V,X,Y)');
js=js.replace('function renderAnimView(){','function renderAnimView(){\n  AN_WIN.y0=anim.type==="point"?-8:-11; AN_WIN.y1=anim.type==="point"?90:11;');
js=js.replace('const g = P.g;','const g = P.g, model=QuadraticModel.physics(P);');
js=js.replace('const H = vy * vy / (2 * g);','const H = model.height;').replace('const tz = 2 * vy / g;','const tz = model.tEnd;').replace('const R = vx * tz;','const R = model.range;');
js=js.replaceAll('pos:t => ({x:vx * t, y:vy * t - 0.5 * g * t * t})','pos:model.pos').replaceAll('pos:t => ({x:t, y:P.h0 + P.vu * t - 0.5 * g2 * t * t})','pos:model.pos').replaceAll('pos:t => ({x:t, y:P.H - 0.5 * g * t * t})','pos:model.pos');
js=js.replace('const timp = (P.vu + Math.sqrt(disc)) / g2;','const timp = model.tEnd;').replace('const timp = Math.sqrt(2 * P.H / g);','const timp = model.tEnd;');
js=js.replace('P.t += (dt / 1000) * 0.55;','P.t += dt / 1000;');
js=js.replace('function physPlay(){','function physPlay(){\n  if(physData().tEnd<=0){P.t=0;physPause();renderPhys();return;}');
js=js.replace('function syncPhysUI(){','function syncPhysUI(){\n  P.t=Math.min(P.t,physData().tEnd);');
js=js.replaceAll('S.a > 0 ? "în sus" : "în jos"','S.a===0?"dreaptă":S.a > 0 ? "în sus" : "în jos"');
js=js.replace(/  const stepMap = \{[^\n]+\};\n/,'').replace('let v = P[k] + (stepMap[k] || 1) * d;','let v = QuadraticModel.step(P[k],d,...limMap[k]);');
const runtime=await read('scripts/adaptations/quadratic-function-runtime.js');
js=js.replace(/\/\* bară de sus \*\/[\s\S]*?\/\* ---------------- inițializare ---------------- \*\//,()=>runtime+'\n/* ---------------- inițializare ---------------- */');
js=js.replace(/\$\("#btnSound"\)\.classList.toggle\("on", soundOn\);[\s\S]*?\$\("#animLabel"\)/,'$("#animLabel")');
js=js.replaceAll('parabola se rotește','parabola își schimbă deschiderea').replaceAll('<li><li>','<li>').replaceAll('Traectoria','Traiectoria').replaceAll('graviției','gravitației');
js=js.replace('a parcurge intervalul [−1,6 ; 1,6] — parabola își schimbă deschiderea, trece prin deschiderea în jos, se aplatizează la a ≈ 0 și se redeschide în sus.','a parcurge intervalul [−1,6; 1,6]. La a = 0 funcția devine liniară.');
js=js.replace('$("#eqTheory").textContent = expr(S.a, S.b, S.c);','PraxisMath.set($("#eqTheory"),expr(S.a,S.b,S.c));').replace('$("#eqAnim").textContent = expr(S.a, S.b, S.c);','PraxisMath.set($("#eqAnim"),expr(S.a,S.b,S.c));').replace('$("#eqPhys").textContent = d.eq;','PraxisMath.set($("#eqPhys"),d.eq);');
js=js.replace('  renderParabola($("#svgTheory"), {id:"th"});','  if(S.a===0){$("#tileVertex").textContent="—";$("#theoryHint").textContent="a = 0: funcția este liniară, fără vârf sau axă de simetrie.";const all=S.b===0&&S.c===0;$("#tileRoots").textContent=all?"ℝ":String(rs.length);$("#rootsNote").textContent=all?"Orice număr real este rădăcină.":rs.length?"x₀ = "+fmt(rs[0],2):"Nicio rădăcină reală.";}\n  renderParabola($("#svgTheory"), {id:"th"});');
js=js.replace('a = 0: funcția este liniară, fără vârf sau axă de simetrie.','a = 0: funcția nu mai este de gradul al doilea; nu are vârf de parabolă.');
js=js.replace('svgHost.innerHTML = s;','svgHost.innerHTML = s; finishSVG(svgHost);').replace('$("#svgAnim").innerHTML = s;','$("#svgAnim").innerHTML = s; finishSVG($("#svgAnim"));').replace('$("#svgPhys").innerHTML = s;','$("#svgPhys").innerHTML = s; finishSVG($("#svgPhys"));');
for(const [file,value]of [['index.html',html],['style.css',css],['lesson.js',js]])await write('public/simulari/'+id+'/'+file,value.replace(/[\t ]+$/gm,''));
await write('docs/imported-quadratic-function.json',JSON.stringify({source:'sources/'+id,files:{'index.html':createHash('sha256').update(await readFile(new URL('sources/'+id+'/index.html',root))).digest('hex')}},null,2)+'\n');
console.log('Integrat: Funcția de gradul al doilea');
