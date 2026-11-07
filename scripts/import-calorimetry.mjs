import {labNamespaces} from './lab-registry.mjs';
import {thermoReadability} from './adaptations/thermodynamics-readability.mjs';
import {cp,readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),id='calorimetrie';
const read=p=>readFile(new URL(p,root),'utf8');
const source=new URL('sources/'+id+'/site/',root),target=new URL('public/simulari/'+id+'/',root);
await mkdir(target,{recursive:true});await cp(source,target,{recursive:true});
let html=thermoReadability('calorimetry','index.html',await read('sources/'+id+'/site/index.html'));
html=html.replace(/<header class="hero"[\s\S]*?<\/header>/,'<span id="top"></span>')
 .replace(/<link rel="manifest"[^>]*>/,'').replace(/<footer>[\s\S]*?<\/footer>/,'')
 .replace(/<section class="sec" id="s8">[\s\S]*?<\/section>/,'').replace(/<li><a href="#s8">[\s\S]*?<\/li>/,'')
 .replace(/<a href="https?:[\s\S]*?<\/a>/g,'').replace(/<div class="num">\d+<\/div>/g,'')
 .replace(/(<nav class="toc"[\s\S]*?<\/nav>)/,nav=>nav.replace(/<span>\d+<\/span>/g,'').replace('1.2 · Cuprins','Cuprins'))
 .replace('Calorimetrul din manual (Fig. 1.2.1) are:','Calorimetrul are:')
 .replace('manual: Fig. 1.2.1 · atinge o piesă','Atinge o piesă')
 .replace('Enunț (manual)','Enunț').replace('Aplicație · Exercițiul 1.21 (p. 22)','Aplicație: căldura specifică a uleiului')
 .replace('exercițiul 1.21','Bilanț termic').replace('m_3=0{,}4','m_3=0{,}8')
 .replace(/<div class="box fix"><span class="tag">Eroare în manual<\/span>[\s\S]*?<\/div>/,String.raw`<div class="box app"><span class="tag">Rezultat</span><p>\[c_2=\frac{380\cdot2\cdot10}{0{,}8\cdot10-0{,}4\cdot10}=1900\ \mathrm{J/(kg\cdot K)}.\]</p></div>`)
 .replace(/<button[^>]*data-act="manual"[\s\S]*?<\/button>/,'').replace('Corectat: m₃ = 0,8 kg','Reia exemplul')
 .replace('value="0.4" data-k="m3"><output>0.40 kg','value="0.8" data-k="m3"><output>0.80 kg')
 .replace('Tabel de identificare (valori corectate)','Tabel pentru identificarea substanței')
 .replace(/<h3 id="ae2-tabel">[\s\S]*?<\/table>/,block=>block.replace('<th>manual</th>','').replace('corect ','').replace(/(<tr><td[^>]*>[\s\S]*?<\/td>)<td[^>]*>[\s\S]*?<\/td>/g,'$1'));
html=html.replace('Manualul prezintă \\(U=U(T)\\) ca fapt experimental general. Afirmația este','Dependența \\(U=U(T)\\) este').replace(/\s*\((?:Fig\.|vezi Fig\.)\s*1\.2\.[^)]*\)/g,'').replace(/1\.2\.\d+\s*·\s*/g,'').replace(/<small>1\.2(?:\.\d+)?<\/small>/g,'').replace(/\s*\(p\.\s*\d+\)/g,'')
 .replace(/AE1:?\s*/g,'').replace(/AE2:?\s*/g,'').replaceAll('href="../index.html"','href="../calcul-vectorial/index.html"');
html=html.replaceAll('Exercițiul 1.21','Căldura specifică a uleiului').replaceAll('· Amestecuri','Amestecarea apei').replaceAll('· Căldura specifică','Identificarea materialelor').replaceAll('← 1.1 Noțiuni termodinamice','← Noțiuni termodinamice').replace(/\s*\(pag\.\s*[\d–-]+\)/g,'').replace(/§[\d.]+/g,'').replace(/1\.2 · /g,'').replace(/1\.1 · /g,'').replace('Coeficienții calorici au fost introduși în lecția precedentă (). Îi recapitulăm,','Recapitulăm coeficienții calorici,').replace('recapitulare ','recapitulare').replaceAll(' ()','').replaceAll('Lecția anterioară · 1.1','Lecția anterioară').replaceAll('href="../notiuni-termodinamice/"','href="../notiuni-termodinamice/index.html"').replaceAll('href="../unde-mecanice/"','href="../unde-mecanice/index.html"').replaceAll('se tratează în ','se studiază separat').replaceAll('LECȚIA ANTERIOARĂ','Lecția anterioară').replaceAll('ACEASTĂ LECȚIE','Această lecție');
html=html.replace(/<section class="sec" id="(s\d+)"/g,(all,sectionId)=>{const title=html.match(new RegExp('<a href="#'+sectionId+'">([^<]*)</a>'))?.[1]||sectionId;return all+' data-thermo-title="'+title.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"';});
const namespaces=await labNamespaces('calorimetrie'),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces){try{embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));}catch{embedded[lang][ns]={locale:lang,namespace:ns,messages:{}};}}
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/calorimetry.css'];
const head=styles.map(path=>'<link rel="stylesheet" href="../../'+path+'">').join('')+'<script src="../../shared/i18n.js"></script><script>window.PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded})+');</script>'+['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','velocity-labels.js','calorimetry-model.js'].map(name=>'<script src="../../shared/'+name+'"></script>').join('');
html=html.replace('</head>',()=>head+'</head>').replace('<body>','<body data-praxis-laboratory="true" data-praxis-course="'+id+'"><div id="praxis-original" lang="ro">').replace('</body>','</div><script src="../../shared/course.js" data-course="'+id+'" data-title="Calorimetrie" defer></script><script src="../../shared/calorimetry.js" defer></script></body>');
await writeFile(new URL('index.html',target),html);
let base=thermoReadability('calorimetry','js/baza.js',await read('sources/'+id+'/site/js/baza.js'));
base=base.replace("const out=inp.parentElement.querySelector('output');","const out=inp.closest('label').querySelector('output');").replace("const S={on:localStorage.getItem('cal-sound')!=='0'};","const S={on:window.PraxisSound.enabled};")
 .replace('if(!S.on)return null;','if(!S.on||!window.PraxisSound.enabled||document.hidden)return null;')
 .replace("S.set=on=>{S.on=on;localStorage.setItem('cal-sound',on?'1':'0');",'S.set=on=>{S.on=on;')
 .replace('return S;','window.addEventListener("praxis-sound-change",()=>S.set(window.PraxisSound.enabled));document.addEventListener("visibilitychange",()=>{if(document.hidden&&ac)ac.suspend();});return S;')
 .replace('if(this.raf)return;','if(this.raf||document.hidden)return;')
 .replace('if(!this.vis)return;','if(!this.vis||document.hidden)return;')
 .replace('this.draw&&this.draw(this.ctx,this.w,this.h)','this.draw&&this.draw(this.ctx,this.w,this.h)');
// Both text passes use the same deferred labels; flush only once after drawing geometry.
base=base.replace('ctx.strokeText(s,px,py);ctx.fillText(s,px,py);','window.PraxisVelocityLabels.label(ctx,s,px,py,{anchorBounds:true});')
 .replace('this.ctx.clearRect(0,0,this.w,this.h);this.draw&&this.draw(this.ctx,this.w,this.h)','this.ctx.clearRect(0,0,this.w,this.h);this.cv.forEach(c=>window.PraxisVelocityLabels.begin(c.getContext("2d"),c._w,c._h));this.draw&&this.draw(this.ctx,this.w,this.h);this.cv.forEach(c=>window.PraxisVelocityLabels.flush(c.getContext("2d")))');
base=base.replace(/function txt\(ctx,s,px,py,o=\{\}\)\{[\s\S]*?ctx\.restore\(\)\}/,`function txt(ctx,s,px,py,o={}){ctx.save();ctx.font=o.font||'italic 500 16px "Source Serif 4", Georgia, serif';ctx.fillStyle=o.color||COL.r;ctx.textAlign=o.align||'center';ctx.textBaseline=o.base||'middle';const width=ctx.measureText(s).width;const left=o.align==='left'?px:o.align==='right'?px-width:px-width/2;window.PraxisVelocityLabels.label(ctx,s,left,py+8,{bounds:{x:8,y:8,w:ctx.canvas._w-16,h:ctx.canvas._h-16},ignorePanels:true,movable:true,anchor:[px,py]});ctx.restore()}`);
base+=`\nfunction fixedTxt(ctx,s,x,y,o={}){ctx.save();ctx.font=o.font||MONO;const m=ctx.measureText(s),w=m.width+8,h=Number(ctx.font.match(/([\\d.]+)px/)?.[1]||12)+10;let left=(o.align==='left'?x:o.align==='right'?x-w:x-w/2);left=clamp(left,6,ctx.canvas._w-w-6);const top=clamp(y-h/2,6,ctx.canvas._h-h-6);ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(left,top,w,h);window.PraxisCanvasTypography.textInBox(ctx,s,{x:left,y:top,w,h},{font:ctx.font,color:o.color||COL.r});ctx.restore();}\n`;
base+='\ndocument.addEventListener("visibilitychange",()=>{if(!document.hidden)ALL.filter(s=>s.vis).forEach(s=>s.loop());});\n';
await writeFile(new URL('js/baza.js',target),base);
for(const file of ['figuri-1.js','figuri-2.js']){
 let code=thermoReadability('calorimetry','js/'+file,await read('sources/'+id+'/site/js/'+file));
 code=code.replaceAll(' — răspunsul din manual.','.').replaceAll('1900 — răspunsul din manual','1900 J/(kg·K)')
 .replaceAll('în enunțul manualului masa uleiului cald trebuia să fie 0,8 kg.','bilanțul termic este satisfăcut.')
 .replaceAll('manualul cere 4–5 serii.','efectuează 4–5 serii.').replaceAll('(cu valorile corectate)','')
 .replaceAll('Datele din manual: numitorul este exact 0!','Aceste date nu admit o căldură specifică finită.');
 if(file==='figuri-1.js'){
 const start=code.indexOf('function axes('),end=code.indexOf('\n}',start)+2;
 let axes=code.slice(start,end).replaceAll('txt(ctx,','fixedTxt(ctx,').replace("b.x+8,b.y-14","b.x+34,b.y+13");code=code.slice(0,start)+axes+code.slice(end);
 }
 if(file==='figuri-1.js'){
 code=code.replace("txt(ctx,`${i+1}: ${M[i].n}`,x+bw/2,y+16,{font:'600 11px \"JetBrains Mono\", monospace'});txt(ctx,f(T[i],1)+' °C',x+bw/2,y+hh/2+6,{font:SERIF(16,600),color:COL.r})", "window.PraxisCanvasTypography.textInBox(ctx,`${i+1}: ${M[i].n}`,{x,y:y+4,w:bw,h:22},{font:'600 11px \"JetBrains Mono\", monospace',color:COL.r});window.PraxisCanvasTypography.textInBox(ctx,f(T[i],1)+' °C',{x,y:y+hh/2-8,w:bw,h:28},{font:SERIF(16,600),color:COL.r})");
 code=code.replace("txt(ctx,'baie rece',vx+vw/2,sy+15,{font:MONO,color:COL.b})","window.PraxisCanvasTypography.textInBox(ctx,'baie rece',{x:vx,y:sy,w:vw,h:30},{font:MONO,color:COL.b})");
 code=code.replace("txt(ctx,s,x,y,{font:SERIF(18,hl(k)?700:500),color:hl(k)?COL.a:COL.r})","window.PraxisCanvasTypography.textInBox(ctx,s,{x:x-22,y:y-15,w:44,h:30},{font:SERIF(18,hl(k)?700:500),color:hl(k)?COL.a:COL.r})").replace('hits.push([k,x-16,y-12,32,24])','hits.push([k,x-22,y-22,44,44])');
 }
 if(file==='figuri-2.js'){
 code=code.replaceAll('g.V.y-74','Math.max(8,g.V.y-74)').replaceAll('g.V.y-78','Math.max(8,g.V.y-78)');
 code=code.replace("txt(ctx,f(Tth,1)+' °C',lx+48,g.V.y-57,{font:'600 16px \"JetBrains Mono\", monospace',color:'#ffd27a'})","window.PraxisCanvasTypography.textInBox(ctx,f(Tth,1)+' °C',{x:lx,y:g.V.y-74,w:96,h:34},{font:'600 16px \"JetBrains Mono\", monospace',color:'#ffd27a'})")
 .replace("txt(ctx,f(Tw,1)+' °C',lx+48,g.V.y-61,{font:'600 16px \"JetBrains Mono\", monospace',color:'#ffd27a'})","window.PraxisCanvasTypography.textInBox(ctx,f(Tw,1)+' °C',{x:lx,y:g.V.y-78,w:96,h:34},{font:'600 16px \"JetBrains Mono\", monospace',color:'#ffd27a'})")
 .replace("txt(ctx,S.mode,sx,sy,{font:'700 12px \"JetBrains Mono\", monospace',color:'#fff'})","window.PraxisCanvasTypography.textInBox(ctx,S.mode,{x:sx-ss/2,y:sy-ss/2,w:ss,h:ss},{font:'700 12px \"JetBrains Mono\", monospace',color:'#fff'})");
 // Integrate the exact fraction poured, including frames crossing interval endpoints.
 code=code.replace("pour.u+=dt/1.6;const u=pour.u;\n      if(u>.25&&u<.8){const add=pour.m*dt/1.6/.55;", "const before=pour.u;pour.u+=dt/1.6;const u=pour.u,fraction=window.PraxisCalorimetry.pouringFraction(before,u);\n      if(fraction>0){const add=pour.m*fraction;");
 // The same pure balance is used in the figure and automated numerical checks.
 code=code.replace('c2:c1*m1*(T-T1)/den','c2:window.PraxisCalorimetry.oilSpecificHeat({...S.p,m3,c1})');
 }
 await writeFile(new URL('js/'+file,target),code);
}
let lesson=await read('sources/'+id+'/site/js/lectie.js');
lesson=lesson.replace(/\/\* ---------- Fundalul eroului:[\s\S]*?(?=\/\* ---------- Cuprins complet)/,'').replace(/\/\* PWA:[\s\S]*$/,'');
lesson=lesson.replace("items.forEach(it=>it.n=norm([it.t,it.sub||'',it.full||''].join(' ')));",`function indexTerms(){items.forEach(it=>{const source=[it.t,it.sub||'',it.full||''];it.n=norm([...source,...source.map(value=>window.PraxisI18n.tr(value))].join(' '));});}indexTerms();window.addEventListener('load',()=>{indexTerms();render();});window.addEventListener('praxis-language-change',()=>{indexTerms();render();});`);
lesson=lesson.replace("function go(id){const el=document.getElementById(id);if(!el)return;close();","function go(id){const el=document.getElementById(id);if(!el)return;window.PraxisCalorimetryTabs?.reveal(el);close();");
lesson=lesson.replace('${lab} · ${it.num}','${lab}');
lesson=lesson.replace('sub:txt.slice(0,140)','sub:txt').replace("mark((it.sub||'').slice(0,110),ws)","mark(window.PraxisI18n.tr(it.sub||'').slice(0,110),ws)").replace("TYPE[it.type]+' · '","window.PraxisI18n.tr(TYPE[it.type])+' · '");
lesson=lesson.replace("gq.addEventListener('input',gf);gf();","gq.addEventListener('input',gf);window.addEventListener('praxis-language-change',()=>queueMicrotask(gf));gf();");
lesson=lesson.replace('SND.set(!SND.on);','window.PraxisSound.setEnabled(!window.PraxisSound.enabled);');
lesson=lesson.replace('renderMathInElement(document.body,','renderMathInElement(document.getElementById("praxis-original"),');
lesson=lesson.replaceAll(' (vezi Corecturi)','').replace(/ Cu [^'\n]*?numitorul ar fi 0 \(Fig\. 5\)\./,'').replace('Definiția din manual (p. 21):','Calorimetria studiază').replace('Valoarea 730 din tabelul manualului este greșită; cuprul are c ≈ 385 J/(kg·K).','Cuprul are căldura specifică aproximativ 385 J/(kg·K).').replace('Exercițiul 1.21 cu datele corectate:','Aplicație:');
await writeFile(new URL('js/lectie.js',target),lesson);
const files=[];
async function inventory(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isDirectory())await inventory(new URL(e.name+'/',dir),prefix+e.name+'/');else files.push({path:prefix+e.name,sha256:createHash('sha256').update(await readFile(new URL(e.name,dir))).digest('hex')});}}
await inventory(source);await writeFile(new URL('docs/imported-calorimetry.json',root),JSON.stringify({id,source:'sources/'+id+'/site',files,excluded:'Textbook references and errata section, publisher numbering, decorative hero and original PWA registration'},null,2)+'\n');
console.log('Calorimetrie integrată cu sursele originale păstrate.');
