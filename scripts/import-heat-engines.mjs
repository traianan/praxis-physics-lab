import {cp,readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='motoare-termice';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{const u=new URL(p,root);await mkdir(new URL('./',u),{recursive:true});await writeFile(u,s);};
const source=new URL(id+'/',root),target=new URL('public/simulari/'+id+'/',root);
await mkdir(target,{recursive:true});await cp(source,target,{recursive:true});
const patch=(s,from,to)=>{if(!s.includes(from))throw new Error('Missing import anchor: '+from.slice(0,100));return s.replace(from,to);};
const clean=s=>s.replace(/\s*\([^)]*(?:manual|Fig\. 1\.6)[^)]*\)/gi,'')
 .replace(/<small>1\.6(?:\.\d+)*<\/small>/g,'')
 .replace(/\b(?:Fig\.|Tabelul|exercițiile|Exercițiul)\s*1\.6(?:\.\d+)*(?:\s*[,·–]\s*1\.6(?:\.\d+)*)*/g,'')
 .replace(/\b1\.6(?:\.\d+)*(?![\d.])\s*[·–]?\s*/g,'').replace(/\s*·\s*(?=<\/)/g,'');
let html=await read(id+'/index.html');
html=html.replace(' · Clasa a X-a','').replace('Clasa a X-a · ','').replace(' (clasa a X-a, 1.6)','');
html=html.replace(/<link rel="manifest"[^>]*>/,'')
 .replace(/<p class="src">[\s\S]*?<\/p>/,'')
 .replace(/<section class="sec" id="s10">[\s\S]*?<\/section>/,'')
 .replace(/<li><a href="#s10">[\s\S]*?<\/li>/,'')
 .replace(/<footer>[\s\S]*?<\/footer>/,'')
 .replace(/<span>manual:[\s\S]*?<\/span>/g,'')
 .replace('În modelul din manual (Fig. 1.6.2.3),','În această aproximație didactică,')
 .replace('Pagina 51 a manualului nu este inclusă aici; refacem calculul cu aceeași metodă. ','')
 .replace('diagrama p–V a ciclului real (Fig. 1.6.3)','diagrama p–V a ciclului ideal')
 .replace('Substanța de lucru este tratată','Substanța de lucru este tratată')
 .replaceAll('target="_blank" ','');
html=clean(html).replace('1.6 · Cuprins','Cuprins').replace('Capitolul 1 — Elemente de termodinamică','Elemente de termodinamică');
html=html.replace('← 1.2 Calorimetrie','← Calorimetrie').replace('← 1.1 Noțiuni termodinamice','← Noțiuni termodinamice')
 .replace('<small>1.2 · LECȚIE ANTERIOARĂ</small>','<small>Lecție conexă</small>')
 .replace('<div class="later"><small>1.3 – 1.4</small><b>Principiul I · Gazul ideal</b></div>','<a class="other-lessons" href="../principiul-i-al-termodinamicii/"><small>Lecție conexă</small><b>Principiul I · Gazul ideal</b></a>')
 .replace('<div class="later"><small>1.5</small><b>Transformări de stare de agregare</b></div>','<a class="other-lessons" href="../transformari-stare-agregare/"><small>Lecție conexă</small><b>Transformări de stare de agregare</b></a>')
 .replace('condensare în condensator, §1.5','condensare în condensator')
 .replaceAll('Lecție anterioară · 1.2','Lecție conexă').replaceAll('Lecție anterioară · 1.1','Lecție conexă');
// Keep the original animated introductory diagram, with linear pressure coordinates.
html=html.replace('<header class="hero" id="top">','<section class="hero sec" id="top" data-engine-title="Introducere">').replace('</header>','</section>');
html=html.replace('<h1>Motoare termice<em>căldură în mișcare</em></h1>','<h2>Motoare termice</h2>');
html=html.replace('  <canvas id="heroField" aria-hidden="true"></canvas>','');
html=html.replace(/<div class="hero-caption">([\s\S]*?)<\/div>/,'<figure class="engine-intro-diagram"><canvas id="heroField" role="img" aria-label="Diagramă termodinamică animată"></canvas><figcaption class="hero-caption">Cicluri ideale — reprezentare schematică, fără scară numerică. Fă clic pe diagramă pentru a schimba ciclul: Otto → Diesel → Carnot.</figcaption></figure>');
html=html.replace(/(<figure class="fig" id="fig6">[\s\S]*?<\/figure>)/,block=>block.replace('<button class="btn sm on" data-mode="di">','<button class="btn sm" data-mode="di">').replace('<button class="btn sm" data-mode="mono">','<button class="btn sm on" data-mode="mono">').replace('value="2" data-k="k"','value="3" data-k="k"').replace('<output>2.0</output>','<output>3.0</output>'));
html=html.replace(/(<figure class="fig" id="fig6">[\s\S]*?<canvas class="tall"><\/canvas>)/,'$1<p class="carnot-key">T₁ = T<sub>c</sub> &nbsp;·&nbsp; T₂ = T<sub>r</sub> &nbsp;·&nbsp; Q₁ = Q<sub>p</sub> &nbsp;·&nbsp; Q₂ = |Q<sub>c</sub>|</p>');
html=html.replace(/(<figure class="fig" id="fig6">[\s\S]*?)(<canvas class="tall">)/,'$1<div class="ctrls"><button type="button" class="btn sm" data-t="scale">Grafic p–V calculat</button><span class="carnot-schematic-note">Schemă de principiu, fără scară numerică.</span></div>$2');
html=html.replace(/(<figure class="fig" id="fig7">[\s\S]*?<\/figure>)/,s=>s.replace('value="8" data-k="eps"','value="3" data-k="eps"').replace('<output>8</output>','<output>3</output>'))
 .replace(/(<figure class="fig" id="fig8">[\s\S]*?<\/figure>)/,s=>s.replace('value="18" data-k="eps"','value="6" data-k="eps"').replace('<output>18</output>','<output>6</output>'));
html=html.replace('Singurul timp în care se efectuează lucru mecanic.','Singurul timp care furnizează lucru mecanic util.');
html=html.replace('Funcționarea lui se înțelege tot cu figura motorului Otto, cu observația că în locul bujiei se află o','În animația motorului în patru timpi, în locul bujiei se află o');
html=html.replace(/(<figure class="fig" id="fig4">[\s\S]*?<\/div>)/,'$1<p class="compression-intro">Experiment separat: comprimă gazul și urmărește temperatura și autoaprinderea.</p>');
html=html.replace(/<section class="sec" id="(s\d+)"/g,(all,section)=>{
 const title=html.match(new RegExp('<a href="#'+section+'">(?:<span>\\d+</span>)?([^<]*)</a>'))?.[1]||section;
 return all+' data-engine-title="'+title+'"';
});
html=html.replace('<main>','<div class="engine-content">').replace('</main>','</div>');
html=html.replace('Motorul în patru timpi și diagrama p–V','Motorul în patru timpi și ciclul ideal p–V');
html=html.replace('Admisia și evacuarea se fac pe aceeași dreaptă orizontală, la presiunea atmosferică: lucrurile lor mecanice se anulează. Rămâne aria buclei 1-2-3-4.',
 'Ciclul termodinamic ideal este bucla 1→2→3→4→1. Admisia și evacuarea sunt curse de schimb de gaze, în afara acestei bucle. În model au aceeași presiune p₀, iar lucrurile lor mecanice se anulează. La izocore, pistonul staționează pentru a face vizibil schimbul de căldură.');
html=html.replace('În model au aceeași presiune p₀, iar lucrurile lor mecanice se anulează.','Diagrama arată schematic numai cele patru transformări ideale, fără traseele de admisie și evacuare.');
const namespaces=['common','chapters/caldura-termodinamica','courses/shared','courses/'+id+'/ui'],embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces){try{embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));}catch{embedded[lang][ns]={locale:lang,namespace:ns,messages:{}};}}
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','shared/heat-engines.css','design-system/compact.css'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded}).replaceAll('<','\\u003c')+');</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','velocity-labels.js','ideal-engine-cycles.js','ideal-cycle-diagram.js','heat-engines-model.js','carnot-diagram.js'].map(p=>'<script src="../../shared/'+p+'"></script>').join('');
html=html.replace('</head>',()=>head+'</head>').replace('<body>','<body data-praxis-laboratory="true" data-praxis-course="'+id+'"><div id="praxis-original" lang="ro">').replace('</body>','</div><script src="../../shared/course.js" data-course="'+id+'" data-title="Motoare termice"></script><script src="../../shared/heat-engines.js"></script></body>');
await write('public/simulari/'+id+'/index.html',withFavicon(html).replace(/[ \t]+$/gm,''));
let base=await read(id+'/js/baza.js');
base=patch(base,"inp.parentElement.querySelector('output')","inp.closest('label').querySelector('output')");
base=patch(base,"const S={on:localStorage.getItem('mt-sound')!=='0'};",'const S={on:window.PraxisSound.enabled};');
base=patch(base,'if(!S.on)return null;','if(!S.on||!window.PraxisSound.enabled||document.hidden)return null;');
base=patch(base,"localStorage.setItem('mt-sound',on?'1':'0');",'');
base=patch(base,'return S;','window.addEventListener("praxis-sound-change",()=>S.set(window.PraxisSound.enabled));document.addEventListener("visibilitychange",()=>{if(document.hidden&&ac)ac.suspend();});return S;');
base=base.replace('if(this.raf)return;','if(this.raf||document.hidden)return;').replace('if(!this.vis)return;','if(!this.vis||document.hidden)return;');
base=base.replace('Math.min(.05,(now-last)/1000)','Math.max(0,Math.min(.05,(now-last)/1000))');
base+='\ndocument.addEventListener("visibilitychange",()=>{if(!document.hidden)ALL.filter(s=>s.vis).forEach(s=>s.loop());});\n';
await write('public/simulari/'+id+'/js/baza.js',base);
let figures=await read(id+'/js/figuri-1.js');
figures=patch(figures,"const CF={otto:{e:8,g:1.4,k:2.9,pm:60},diesel:{e:18,g:1.4,rho:2,pm:66}};",'const MODELS={otto:window.PraxisHeatEnginesModel.create("otto"),diesel:window.PraxisHeatEnginesModel.create("diesel")};const model=()=>MODELS[S.mode];const CF={otto:{e:3},diesel:{e:4}};');
const pStart=figures.indexOf('  const pres=d=>'),pEnd=figures.indexOf('  const setRun=',pStart);
if(pStart<0||pEnd<0)throw new Error('Engine pressure anchors');
figures=figures.slice(0,pStart)+'  const stage=d=>model().at(d).stroke;\n'+figures.slice(pEnd);
figures=patch(figures,'S.onMode=()=>{SND.tick()};','S.onMode=()=>{th=0;target=null;setRun(false);SND.tick()};');
figures=patch(figures,'target=(stage(th)+1)*180;if(target<=th)target+=720;','target=model().boundaries[stage(th)];if(target<=th+1e-8)target+=model().period;');
figures=patch(figures,'if(th>=720){th-=720;if(target!==null)target-=720}', 'if(th>=model().period){th-=model().period;if(target!==null)target-=model().period}');
figures=patch(figures,'const c=CF[S.mode],narrow=w<620,st=stage(th),d=((th%720)+720)%720,u=(d%180)/180;', 'const m=model(),state=m.at(th),c=CF[S.mode],narrow=w<620,st=state.stroke,d=state.angle,u=(d%180)/180;');
figures=patch(figures,'y0=70,Ls=', 'y0=82,Ls=');
figures=patch(figures,"'bujie':'injector',cx,y0-56", "'bujie':'injector',cx,y0-70");
const gStart=figures.indexOf('    // diagrama p–V',figures.indexOf('const MODELS=')),gEnd=figures.indexOf("    const vs=['deschisă'",gStart);
if(gStart<0||gEnd<0)throw new Error('Engine diagram anchors');
figures=figures.slice(0,gStart)+await read('scripts/adaptations/heat-engines-diagram.js')+'\n'+figures.slice(gEnd);
figures=figures.replace('Aerul este comprimat aproximativ adiabatic până la ~50 atm; temperatura lui depășește 600 °C.','Aerul este comprimat adiabatic (1→2): volumul scade, iar presiunea și temperatura cresc.');
figures=figures.replaceAll('aproximativ adiabatică','adiabatică în modelul ideal').replaceAll('aproximativ adiabatic','adiabatic în modelul ideal').replaceAll('V ≈ const.','V = const.').replaceAll('p ≈ const.','p = const.').replaceAll('Singurul timp cu lucru mecanic.','Timpul care furnizează lucru mecanic util.');
await write('public/simulari/'+id+'/js/figuri-1.js',figures);
let cycles=await read(id+'/js/figuri-2.js');
cycles=patch(cycles,"return {g,legs:['T','S','T','S'],P:","return {carnot:true,g,legs:['T','S','T','S'],P:");
const cycleGraphStart=cycles.indexOf('    const b={x:62,y:34'),cycleGraphEnd=cycles.indexOf('    // punctul mobil',cycleGraphStart);
if(cycleGraphStart<0||cycleGraphEnd<0)throw new Error('Cycle drawing anchors');
let genericGraph=cycles.slice(cycleGraphStart,cycleGraphEnd).replace('const xy=s=>','xy=s=>').replace('    const cur=Math.floor(u+1e-9)%4,su=u-Math.floor(u+1e-9);','');
cycles=cycles.slice(0,cycleGraphStart)+'    const cur=Math.floor(u+1e-9)%4,su=u-Math.floor(u+1e-9);let xy;\n    if(c.carnot){xy=window.PraxisCarnotDiagram.draw(ctx,{x:42,y:30,w:w-(side?240:90),h:h-84},P,g,{phase:started?cur:-1,proportional:!!S.t.scale}).xy;}else if(sel==="#fig7"||sel==="#fig8"){const plot={x:45,y:36,w:w-(side?240:95),h:h-96};xy=window.PraxisIdealCycleDiagram.draw(ctx,plot,{kind:sel==="#fig7"?"otto":"diesel",states:P,gamma:g,phase:started?cur:-1,area:true,maxPressure:c.ext?.p||0}).xy;if(cfg.overlay){ctx.save();ctx.beginPath();ctx.rect(plot.x,plot.y,plot.w,plot.h);ctx.clip();cfg.overlay(S,ctx,xy,c,plot);ctx.restore();}}else{\n'+genericGraph+'    }\n'+cycles.slice(cycleGraphEnd);
// Complete the comparison Otto cycle in physical order (no diagonal chord).
cycles=patch(cycles,'}pts.push(p1);','}pts.push({V:p1.V,T:T4o},p1);');
cycles=patch(cycles,'ctx.lineTo(...xy({V:p1.V,T:T4o}));ctx.stroke();','ctx.stroke();');
await write('public/simulari/'+id+'/js/figuri-2.js',cycles);
let lesson=await read(id+'/js/lectie.js');
lesson=lesson.replace(/\/\* PWA:[\s\S]*$/,'').replace('(Aplicația din manual) ','');
lesson=lesson.replace('p:Math.sqrt(R*s.T/s.V)','p:R*s.T/s.V').replace('p „comprimat” cu radical, doar pentru aspect','presiune pe scară liniară');
lesson=patch(lesson,"{n:'Carnot',g:1.4,legs:['T','S','T','S'],P:(()=>{const fV=Math.pow(2,2.5);return [{V:1,T:600},{V:2.5,T:600},{V:2.5*fV,T:300},{V:fV,T:300}]})()}","{n:'Carnot',g:5/3,legs:['T','S','T','S'],P:(()=>{const fV=Math.pow(2,1.5);return [{V:5,T:600},{V:15,T:600},{V:15*fV,T:300},{V:5*fV,T:300}]})()}");
lesson=patch(lesson,'wide=w>820,bx=wide?w*.66:w*.08,bw=wide?w*.29:w*.84,by=h*.14,bh=h*.7,al=wide?.9:.3;','wide=w>820,bx=w*.14,bw=w*.72,by=h*.14,bh=h*.7,al=1;');
lesson=patch(lesson,'    const X=x=>bx+x*bw,Y=y=>by+bh-y*bh;ctx.save();ctx.globalAlpha=al;',`    if(cy.n==='Carnot'){u=(u+dt*.11)%1;const phase=Math.floor(u*4),fraction=u*4-phase,diagram=window.PraxisCarnotDiagram.draw(ctx,{x:48,y:40,w:w-100,h:h-95},cy.P,cy.g),state=legAt(cy.P[phase],cy.P[(phase+1)%4],cy.legs[phase],fraction,cy.g),[px,py]=diagram.xy(state);ctx.fillStyle='#c8402a';ctx.beginPath();ctx.arc(px,py,5.5,0,TAU);ctx.fill();ctx.font='600 11px "JetBrains Mono", monospace';ctx.fillText('CARNOT',w-86,18);return;}\n    const X=x=>bx+x*bw,Y=y=>by+bh-y*bh;ctx.save();ctx.globalAlpha=al;`);
lesson=lesson.replace('SND.set(!SND.on);','window.PraxisSound.setEnabled(!window.PraxisSound.enabled);');
lesson=lesson.replace('renderMathInElement(document.body,','renderMathInElement(document.getElementById("praxis-original"),');
lesson=lesson.replace('close();const el=document.getElementById(id);','close();const el=document.getElementById(id);');
lesson=lesson.replace("function go(id){",'function go(id){window.PraxisHeatEnginesTabs?.reveal(document.getElementById(id));');
lesson=lesson.replace('${lab} · ${it.num}','${lab}');
lesson=lesson.replace("items.forEach(it=>it.n=norm([it.t,it.sub||'',it.full||''].join(' ')));",`function indexTerms(){items.forEach(it=>{const source=[it.t,it.sub||'',it.full||''];it.n=norm([...source,...source.map(value=>window.PraxisI18n.tr(value))].join(' '));});}indexTerms();window.addEventListener('load',()=>{indexTerms();render();});window.addEventListener('praxis-language-change',()=>{indexTerms();render();});`);
lesson=lesson.replace("if(raf||reduce)return;","if(raf||reduce||document.hidden)return;").replace('if(!vis)return;','if(!vis||document.hidden)return;');
lesson=lesson.replace('Math.min(.05,(now-last)/1000)','Math.max(0,Math.min(.05,(now-last)/1000))');
lesson=lesson.replace('  loop();','  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&vis)loop();});loop();');
const introStart=lesson.indexOf("(()=>{const c=$('#heroField')"),introEnd=lesson.indexOf('\n})();',introStart)+6;
if(introStart<0||introEnd<6)throw new Error('Introductory diagram anchors');
lesson=lesson.slice(0,introStart)+await read('scripts/adaptations/heat-engines-intro.js')+lesson.slice(introEnd);
await write('public/simulari/'+id+'/js/lectie.js',lesson.trimEnd()+'\n');
await write('public/simulari/'+id+'/css/lectie.css',(await read(id+'/css/lectie.css')).replaceAll('Subtitlul manualului','Subtitlul lecției').replaceAll('corectură a manualului','precizare'));
const sim={id,addedOn:'2026-10-31',addedOrder:1,chapter:'caldura-termodinamica',title:'Motoare termice',subtitle:'Cicluri ideale, randament și motoare în patru timpi',description:'Nouă simulări animate: motoare Otto și Diesel, transferuri de energie, frigider, ciclurile Carnot, Otto, Diesel și modelul didactic Rankine, cu 12 întrebări și 14 probleme.',href:'./simulari/'+id+'/index.html',image:'./assets/'+id+'.svg',alt:'Motor cu piston și ciclurile ideale Otto și Diesel pe diagrama presiune–volum',tags:['Termodinamică','Motoare','Cicluri ideale','Offline'],keywords:'motoare termice otto diesel carnot rankine randament ciclu ideal piston patru timpi frigider pompa caldura compresie adiabatic izocor izobar',status:'available'};
let catalog=await read('public/catalog.js');if(!catalog.includes('"id":"'+id+'"'))await write('public/catalog.js',catalog.replace('\n];\nexport const normalize',',\n '+JSON.stringify(sim)+'\n];\nexport const normalize'));
for(const lang of ['ro','en']){const p='public/locales/chapters/caldura-termodinamica/'+lang+'.json',data=JSON.parse(await read(p));data.simulations[id]=lang==='ro'?Object.fromEntries(['title','subtitle','description','alt','tags'].map(k=>[k,sim[k]])):{title:'Heat engines',subtitle:'Ideal cycles, efficiency and four-stroke engines',description:'Nine animated simulations: Otto and Diesel engines, energy transfers, refrigerator, Carnot, Otto, Diesel and a teaching model of Rankine, with 12 questions and 14 problems.',alt:'Piston engine and ideal Otto and Diesel pressure–volume cycles',tags:['Thermodynamics','Engines','Ideal cycles','Offline']};await write(p,JSON.stringify(data,null,2)+'\n');}
const files=[];async function inventory(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isDirectory())await inventory(new URL(e.name+'/',dir),prefix+e.name+'/');else files.push({path:prefix+e.name,sha256:createHash('sha256').update(await readFile(new URL(e.name,dir))).digest('hex')});}}
await inventory(source);await write('docs/imported-heat-engines.json',JSON.stringify({id,source:id,files,adaptations:'Shared Praxis UI, ideal p–V cycle and constant-volume dwells, linear hero pressure axis, corrected Otto comparison overlay, textbook references and source PWA removed. Original sources and animation mechanisms preserved.'},null,2)+'\n');
console.log('Integrat: '+id);
