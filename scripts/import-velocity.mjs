import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),id='viteza-si-acceleratia';
const read=p=>readFile(new URL(p,root),'utf8');
const sciencePatches=JSON.parse(await read('scripts/velocity-science-patches.json'));
function adaptScience(code,file){
 for(const patch of sciencePatches.filter(p=>p.file===file)){
  if(code.split(patch.before).length!==2)throw new Error('Velocity science patch target changed: '+file+' '+patch.before.slice(0,60));
  code=code.replace(patch.before,()=>patch.after);
 }
 return code;
}
// These indices have real Unicode subscript glyphs, supported by both DOM and Canvas.
const indices={m:'ₘ',n:'ₙ',t:'ₜ'};
const subscripts=text=>text.replace(/\b([va])_([mnt])\b/g,(_,symbol,index)=>symbol+indices[index]);
const target=new URL('public/simulari/'+id+'/',root);
await mkdir(target,{recursive:true});
const namespaces=['common','chapters/miscare','courses/shared','courses/'+id+'/ui'];
const embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces)embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));
let html=subscripts(adaptScience(await read('sources/'+id+'/index.html'),'index.html'));
// The common course bridge owns the only header, settings and section navigation.
html=html.replace(/<div class="brand-group">[\s\S]*?<nav class="main-nav"/,'<nav class="tabs"')
 .replace(/(<button class="nav-btn[^>]*)( onclick="switchMainTab\('([^']+)'\)")/g,'$1 data-tab="$3"$2')
 .replace('<header class="app-header">','<header class="velocity-navigation">')
 .replace(/(<button[^>]*id="btn-tab-[^"]+"[^>]*>)[\s\S]*?<\/button>/g,(all,open)=>all.replace(/<span>[^<]*<\/span>\s*\d+\.\s*/,''));
html=html.replace(/(<canvas[^>]*width="(\d+)" height="(\d+)")/g,'$1 data-logical-width="$2" data-logical-height="$3"');
// Keep vector arrows and their indices in one inline box; flex items must not split formulas.
html=html.replace(/(<span class="vec">[^<]*<\/span>)(<sub>[^<]*<\/sub>|[₀₁₂₃₄₅₆₇₈₉])?/g,'<span class="math-symbol">$1$2</span>')
 .replace(/(<label class="check-label">)(<input[^>]*\/>)([\s\S]*?)(<\/label>)/g,'$1$2<span class="check-text">$3</span>$4')
 .replace(/([a-zA-Zω])(<sub>[^<]*<\/sub>)/g,'<span class="math-symbol">$1$2</span>')
 .replace(/(<div class="telemetry-label">)(<span class="color-dot"[^>]*><\/span>)([\s\S]*?)(<\/div>)/g,'$1$2<span class="telemetry-caption">$3</span>$4');
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','shared/velocity.css','design-system/compact.css'];
const head='<link rel="icon" href="../../assets/favicon.svg">'+styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+
 '<script src="../../shared/i18n.js"></script><script>window.PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded})+');</script>'+
 ['sound.js','lab-header.js','scientific-colors.js','course-localization.js','velocity-labels.js','velocity-canvas.js'].map(p=>`<script src="../../shared/${p}"></script>`).join('');
html=html.replace('</head>',()=>head+'</head>').replace('<body>','<body data-praxis-laboratory="true" data-praxis-course="'+id+'"><div id="praxis-original" lang="ro">')
 .replace('</body>','</div><script src="../../shared/course.js" data-course="'+id+'" data-title="Viteza și accelerația" defer></script><script src="../../shared/velocity.js" defer></script></body>');
await writeFile(new URL('index.html',target),html);
await writeFile(new URL('style.css',target),await read('sources/'+id+'/style.css'));
let js=adaptScience(await read('sources/'+id+'/app.js'),'app.js');
// Queue every annotation until geometry is complete; remove the source's early label masks.
js=js.replace(/    ctx.fillStyle = '#070b18';\n    const tw = ctx.measureText\(label\).width;\n    ctx.fillRect\(lx - 3, ly - 11, tw \+ 6, 15\);\n/,'')
 .replace('ctx.fillText(label, lx, ly);','ctx.fillText(label, lx, ly, {anchor:[x2,y2]});')
 .replace('curPx + 8, curPy - 8);','curPx + 8, curPy - 8, {anchor:[curPx,curPy]});')
 .replace('sx1 - 30, sy1 - 10);','sx1 - 30, sy1 - 10, {anchor:[sx1,sy1]});')
 .replace('sx2 + 8, sy2 + 14);','sx2 + 8, sy2 + 14, {anchor:[sx2,sy2]});')
 .replaceAll('ctx.fillText(', 'window.PraxisVelocityLabels.label(ctx,');
js=js.replace('// Initialize all laboratories on page load',`// Finish each canvas annotation pass after all points, curves and vectors.
for(const [lab,id] of [[rectLab,'rect-canvas'],[curvLab,'curv-canvas'],[polyLab,'poly-canvas']]){
 const draw=lab.draw;lab.draw=function(){try{return draw.call(this);}finally{const canvas=document.getElementById(id);if(canvas)window.PraxisVelocityLabels.flush(canvas.getContext('2d'));}};
}
// Initialize all laboratories on page load`);
// const bindings are not window properties: the source's guards never paused hidden labs.
js=js.replaceAll('window.rectLab','rectLab').replaceAll('window.curvLab','curvLab').replaceAll('window.polyLab','polyLab');
js=js.replaceAll('const W = canvas.width;\n    const H = canvas.height;', 'const {width: W, height: H} = window.PraxisVelocityCanvas.prepare(canvas);');
// Replace dark drawing surfaces and pale labels with the light Praxis palette.
const colors={'#070b18':'#f6f8f6','#283666':'#d5e2d9','#93c5fd':'#216e61','#94a3b8':'#536e64','#64748b':'#536e64','#475569':'#8ca69a','#334155':'#536e64','#f8fafc':'#243c40','#c084fc':'#83689e','#34d399':'#43876f','#facc15':'#98751d','#10b981':'#43876f','#ec4899':'#a3497e','#f59e0b':'#b28b3b'};
for(const [source,color] of Object.entries(colors))js=js.replaceAll(source,color);
js=js.replace(/rgba\(15, 22, 43, [\d.]+\)/g,'#ffffff')
 .replace(/rgba\(255,\s*255,\s*255,\s*[\d.]+\)/g,'#b8cbc0')
 .replace('rgba(148, 163, 184, 0.08)','rgba(109, 132, 120, 0.16)')
 .replace(/ctx.shadowBlur = \d+;/g,'ctx.shadowBlur = 0;');
// Cancel pending frames on pause, stop and presets so rapid resume cannot double the clock.
js=js.replaceAll('lastFrame: 0,','lastFrame: 0,\n  frame: null,')
 .replaceAll('this.running = false;','this.running = false;\n    cancelAnimationFrame(this.frame); this.frame = null;')
 .replaceAll('requestAnimationFrame(', 'this.frame = requestAnimationFrame(')
 .replaceAll('(ts - this.lastFrame) / 1000','Math.min(0.1, Math.max(0, (ts - this.lastFrame) / 1000))');
await writeFile(new URL('app.js',target),subscripts(js));
const files=[];for(const file of ['index.html','app.js','style.css','README_INSTRUCTIUNI.txt','Viteza_si_acceleratia_SingleFile.html'])files.push({path:file,sha256:createHash('sha256').update(await read('sources/'+id+'/'+file)).digest('hex')});
await writeFile(new URL('docs/imported-velocity.json',root),JSON.stringify({id,source:'sources/'+id,files,adaptedFiles:['index.html','app.js'],shared:['course.js','velocity.js','velocity-canvas.js','velocity-labels.js','velocity.css']},null,2)+'\n');
console.log('Laborator integrat: '+fileURLToPath(target));
