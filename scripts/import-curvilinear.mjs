import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),id='miscarea-curbilinie-plana';
const read=path=>readFile(new URL(path,root),'utf8');
const source=await read('sources/'+id+'/index.html'),target=new URL('public/simulari/'+id+'/',root);
await mkdir(target,{recursive:true});
const namespaces=['common','chapters/miscare','courses/shared','courses/'+id+'/ui'],embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces)embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));
const palette={'#070b16':'#f6f8f6','#0c1226':'#f6f8f6','#eef2ff':'#243c40','#c6cfe6':'#536e64','#97a3c4':'#536e64','#6b7699':'#6d8478','#bceaff':'#3879ac','#aab6d1':'#8ca69a','#8f9bb8':'#6d8478','#e8c66a':'#216e61','#c9a13b':'#216e61','#3ddc97':'#43876f','#ff6b6b':'#b54d45','#ffc857':'#b28b3b','#b39dff':'#83689e','#6fd3ff':'#3879ac'};
function colors(code){
 for(const [from,to]of Object.entries(palette))code=code.replaceAll(from,to);
 return code.replace(/rgba\((\d+),(\d+),(\d+),([.\d]+)\)/g,(all,r,g,b,a)=>{
  const hex='#'+[r,g,b].map(v=>(+v).toString(16).padStart(2,'0')).join('');
  if(hex==='#ffffff')return 'rgba(109,132,120,'+Math.min(.35,Number(a)+.1)+')';
  if(!palette[hex])return all;return 'rgba('+[1,3,5].map(i=>parseInt(palette[hex].slice(i,i+2),16)).join(',')+','+a+')';
 });
}
const css=source.match(/<style>([\s\S]*?)<\/style>/)[1];
let js=source.match(/<script>([\s\S]*?)<\/script>/)[1];
// The common Praxis header replaces the animated decorative hero.
js=js.replace(/\/\* ============ Hero:[\s\S]*?\}\)\(\);/,'');
const arrowStart=js.indexOf('  if(label){',js.indexOf('function arrow(')),arrowEnd=js.indexOf('\nfunction dot(',arrowStart);
js=js.slice(0,arrowStart)+`  if(label){
    ctx.save();ctx.font='italic 600 15px Georgia,serif';ctx.fillStyle=color;
    window.PraxisVelocityLabels.label(ctx,label.replaceAll('⃗',''),ex+ux*18-uy*14,ey+uy*18+ux*14,{anchor:[ex,ey],vectorNotation:label.includes('⃗')});ctx.restore();
  }
}
`+js.slice(arrowEnd);
js=js.replace('  return{ctx,w,h:hgt};',`  window.PraxisVelocityLabels.begin(ctx,w,hgt);
  const canvasBox=cv.getBoundingClientRect();for(const overlay of cv.parentElement.querySelectorAll('.legend,#s2Scale')){const box=overlay.getBoundingClientRect();if(box.width&&box.height)window.PraxisVelocityLabels.reserve(ctx,{x:box.left-canvasBox.left-4,y:box.top-canvasBox.top-4,w:box.width+8,h:box.height+8});}
  return{ctx,w,h:hgt};`);
js=js.replace('function arrow(',`function labeledDraw(fn,id){return function(...args){const canvas=document.getElementById(id);if(!canvas.clientWidth||!canvas.clientHeight)return;try{return fn(...args);}finally{window.PraxisVelocityLabels.flush(canvas.getContext('2d'));}};}
drawTheory=labeledDraw(drawTheory,'theoryCanvas');drawSim1=labeledDraw(drawSim1,'sim1');drawSim2=labeledDraw(drawSim2,'sim2');drawEllipse=labeledDraw(drawEllipse,'simEllipse');
function arrow(`);
js=js.replaceAll('ctx.fillText(','window.PraxisVelocityLabels.label(ctx,');
js=js.replace('if(updateHash&&location.hash',"window.dispatchEvent(new CustomEvent('praxis-curvilinear-tab-change',{detail:{id}}));\n if(updateHash&&location.hash");
js=js.replace(' const step=()=>{if(!TH.play)return;TH.t=Math.min(3.4,TH.t+1/60);drawTheory();'," const clock=window.PraxisAnimationClock.create(1,.05);const step=stamp=>{if(!TH.play)return;TH.t=Math.min(3.4,TH.t+clock.step(stamp));drawTheory();");
js=colors(js).replaceAll('ctx.shadowBlur=16','ctx.shadowBlur=0');
let html=source.replace(/<style>[\s\S]*?<\/style>/,'<link rel="stylesheet" href="source.css">').replace(/<script>[\s\S]*?<\/script>/,'<script src="app.js"></script>')
 .replace(/<header id="top">[\s\S]*?<\/header>/,'')
 .replace(/<footer>[\s\S]*?<\/footer>/,'')
 .replace(/<small>Secțiunea [IVX]+<\/small>/g,'')
 .replace(/(<button class="tab-btn[^>]* data-tab="([^"]+)")/g,'$1 id="curvilinear-tab-$2" aria-controls="panel-$2" role="tab"');
html=html.replace(/(<vec>[^<]*<\/vec>)(<sub>[^<]*<\/sub>|[₀₁₂ₘₙₜ])?/g,'<span class="math-symbol">$1$2</span>');
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','shared/curvilinear.css','design-system/compact.css'];
const head='<link rel="icon" href="../../assets/favicon.svg">'+styles.map(path=>'<link rel="stylesheet" href="../../'+path+'">').join('')+
 '<script src="../../shared/i18n.js"></script><script>window.PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:namespaces,embedded})+');</script>'+
 ['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','animation-clock.js','velocity-labels.js'].map(name=>'<script src="../../shared/'+name+'"></script>').join('');
html=html.replace('</head>',()=>head+'</head>').replace('<body>','<body data-praxis-laboratory="true" data-praxis-course="'+id+'"><div id="praxis-original" lang="ro">')
 .replace('</body>','</div><script src="../../shared/course.js" data-course="'+id+'" data-title="Mișcarea curbilinie plană" defer></script><script src="../../shared/curvilinear.js" defer></script></body>');
await writeFile(new URL('index.html',target),html);await writeFile(new URL('source.css',target),colors(css));await writeFile(new URL('app.js',target),js);
await writeFile(new URL('docs/imported-curvilinear.json',root),JSON.stringify({id,source:'sources/'+id+'/index.html',sha256:createHash('sha256').update(source).digest('hex'),sections:['teorie','viteza','acceleratie'],canvas:['theoryCanvas','simEllipse','sim1','sim2'],duplicates:'Original lesson and repeated concepts preserved'},null,2)+'\n');
console.log('Mișcarea curbilinie plană integrată, cu sursa originală păstrată.');
