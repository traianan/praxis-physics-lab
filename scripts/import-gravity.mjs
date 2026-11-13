import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {labNamespaces} from './lab-registry.mjs';
import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='interactiunea-gravitationala';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),s);};
const raw=(await read('Interactiunea-gravitationala.html')).replaceAll('\r\n','\n');
let body=raw.match(/<main>([\s\S]*?)<\/main>/)[1];
body=body.replace(/<section class="hero"[\s\S]*?<\/section>/,'')
 .replace(/<footer>[\s\S]*?<\/footer>/,'')
 .replace('Primele șase afirmații provin din exercițiul final al PDF-ului; ultimele patru sunt aplicații suplimentare.','Zece afirmații despre gravitație, câmp și mișcarea orbitală.')
 .replace('Aplicația păstrează notația manualului: K nu este G.','În această lecție, K nu este G.')
 .replace('style="height:420px"','');
body=body.replace(/<div class="eyebrow">[^<]*<\/div>/g,'').replace(/<p\b/g,'<p data-no-science-math');
body=body.replace('id="forceResult"','id="forceResult" data-science-math');
const sections=[['newton','Laborator','simulation'],['teorie','Teorie','theory'],['camp','Câmpul','simulation'],['sateliti','Sateliți','simulation'],['probleme','Probleme','problem'],['quiz','Verifică-te','assessment'],['formule','Formule','formula']];
for(const [section,,type] of sections){
 body=body.replace('<section id="'+section+'">','<section id="'+section+'" role="tabpanel" aria-labelledby="tab-'+section+'" tabindex="0"'+(section==='newton'?'':' hidden')+'>');
 body=body.replace(new RegExp('(<section id="'+section+'"[\\s\\S]*?)<h2>'),'$1<h2 data-content-type="'+type+'">');
}
// Keep secondary orbital explanations available without pushing the experiment down.
body=body.replace(/(<section id="sateliti"[\s\S]*?)<p[^>]*class="sub">([\s\S]*?)<\/p>/,'$1<details class="orbit-theory"><summary>De ce rămâne satelitul pe orbită?</summary><p data-no-science-math>$2</p></details>');
body=body.replace('gravitația.<br>O urmează.','gravitația. O urmează.');
body=body.replace('<div class="formula">v = √(KM / r)<br>T = 2π √(r³ / KM)</div>','<details><summary>Formule și interpretare</summary><div class="formula">v = √(KM / r)<br>T = 2π √(r³ / KM)</div>')
 .replace('<div class="note" id="orbitNote"></div>','<div class="note" id="orbitNote"></div></details>')
 .replace('<div class="note">Dacă r se dublează, F devine F/4. Dacă doar o masă se dublează, F se dublează.</div>','<details><summary>Cum se schimbă forța?</summary><p data-no-science-math>Dacă r se dublează, F devine F/4. Dacă doar o masă se dublează, F se dublează.</p></details>');
body=body.replace(/<p([^>]*)>(Dimensiuni schematice\.[\s\S]*?)<\/p>/,'<details><summary>Scara animației</summary><p$1>$2</p></details>');
body=body.replace('<div class="grid" style="margin-top:20px"><article','<details><summary>Sateliți naturali, geostaționari și GPS</summary><div class="grid"><article')
 .replace('</article></div><details><summary>De ce plutesc','</article></div></details><details><summary>De ce plutesc');
const tabs='<nav class="tabs" role="tablist" aria-label="Secțiunile lecției">'+sections.map(([section,label])=>'<button type="button" role="tab" id="tab-'+section+'" data-tab="'+section+'" aria-controls="'+section+'" aria-selected="'+(section==='newton')+'" tabindex="'+(section==='newton'?0:-1)+'">'+label+'</button>').join('')+'</nav>';
let css=raw.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/:root\b|\bhtml\b|\bbody\b/g,':scope');
css='@scope (#gravity-root) {\n'+css+'\n'+await read('scripts/adaptations/gravity.css')+'\n}\nbody[data-praxis-course="'+id+'"] *,body[data-praxis-course="'+id+'"] *::before,body[data-praxis-course="'+id+'"] *::after{box-sizing:border-box}\n';
await write('public/shared/gravity.css',css);
let js=raw.match(/<script>([\s\S]*?)<\/script>/)[1];
js=js.replace("x.toLocaleString('ro-RO'","x.toLocaleString(PraxisI18n.locale")
 .replace(".replace('.',',').replace('e'",".replace('.',PraxisI18n.language==='en'?'.':',').replace('e'")
 .replace("dpr=devicePixelRatio||1","dpr=PraxisCanvasResolution.ratio(Math.max(1,box.width),Math.max(1,box.height))")
 .replace("$('theme').onclick=()=>{document.body.classList.toggle('light');$('theme').setAttribute('aria-pressed',document.body.classList.contains('light'))};",'')
 .replace(/window.addEventListener\('scroll',[\s\S]*?\}\);render\(\);/,'render();')
 .replace("try{localStorage.setItem('orbitaScore',score)}catch{}",'')
 .replace("try{localStorage.removeItem('orbitaScore')}catch{}",'')
 .replace("if(playing){let T=","if(playing&&!document.hidden&&!$('sateliti').hidden){let T=")
 .replace("c.fillText('v',","vectorLabel(c,'v',").replace("c.fillText('F',","vectorLabel(c,'F',")
 .replace("c.fillText('Attraction réciproque'.replace('Attraction réciproque','Atracție reciprocă · forțe egale')","c.fillText('Atracție reciprocă · forțe egale'");
js=js.replace('function ball(c,','function vectorLabel(c,text,x,y){c.fillText(text,x,y);const width=c.measureText(text).width;line(c,x,y-16,x+width,y-16,c.fillStyle,1);line(c,x+width-3,y-19,x+width,y-16,c.fillStyle,1);line(c,x+width-3,y-13,x+width,y-16,c.fillStyle,1);}\nfunction ball(c,');
// A recognisable satellite, rather than three solid squares resembling missing glyphs.
const oldSatellite="c.fillStyle='#bcabff';c.fillRect(x-7,y-7,14,14);c.fillStyle='#768cf0';c.fillRect(x-23,y-5,12,10);c.fillRect(x+11,y-5,12,10);";
if(!js.includes(oldSatellite))throw new Error('Satellite source changed');
js=js.replace(oldSatellite,`c.save();c.translate(x,y);c.rotate(angle+Math.PI/2);
line(c,-25,0,25,0,'#cbd5e1',2);
for(const px of [-29,11]){c.fillStyle='#244f78';c.fillRect(px,-9,18,18);c.strokeStyle='#8dbedb';c.lineWidth=1;c.strokeRect(px,-9,18,18);for(const dx of [6,12])line(c,px+dx,-9,px+dx,9,'#8dbedb',.7);line(c,px,0,px+18,0,'#8dbedb',.7);}
c.beginPath();c.moveTo(-7,-10);c.lineTo(7,-10);c.lineTo(9,7);c.lineTo(0,12);c.lineTo(-9,7);c.closePath();c.fillStyle='#e8d7a0';c.fill();c.strokeStyle='#fff3cb';c.lineWidth=1;c.stroke();
line(c,0,-10,0,-17,'#fff3cb',1.5);c.beginPath();c.arc(0,-18,3,Math.PI,2*Math.PI);c.stroke();c.restore();`);
js=js.replace("c.textAlign='left';graph('forceChart'","if($('fVectors').checked){c.textAlign='left';c.fillStyle='#63e2da';vectorLabel(c,'F₁',x1+rad1+8,y-14);c.fillStyle='#bcabff';vectorLabel(c,'F₂',x2-rad2-35,y-14);}c.textAlign='left';graph('forceChart'");
// The preference remains accessible alongside the orbital controls.
body=body.replace('<button id="resetO">Reia orbita</button>','<button id="resetO">Reia orbita</button><label><input id="motion" type="checkbox"> Mișcare redusă / pauză globală</label>');
await write('public/simulari/'+id+'/app.js',js+'\n'+await read('scripts/adaptations/gravity-tabs.js'));
const messages=JSON.parse(await read('scripts/adaptations/gravity-en.json'));
for(const lang of ['ro','en'])await write('public/locales/courses/'+id+'/ui/'+lang+'.json',JSON.stringify({locale:lang,namespace:'courses/'+id+'/ui',messages:lang==='en'?messages:Object.fromEntries(Object.keys(messages).map(key=>[key,key]))},null,2)+'\n');
const ns=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css','shared/gravity.css'];
const scripts=['sound.js','lab-header.js','canvas-resolution.js','canvas-typography.js','scientific-colors.js','course-localization.js'];
const head=styles.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>'<script src="../../shared/'+p+'"></script>').join('');
await write('public/simulari/'+id+'/index.html',withFavicon('<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Interacțiunea gravitațională — Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true"><main id="praxis-original">'+tabs+'<div id="gravity-root">'+body+'</div><p><a data-offline-download href="'+id+'.zip" download>Descarcă lecția offline</a></p></main><script src="./app.js"></script><script src="../../shared/course.js" data-course="'+id+'" data-title="Interacțiunea gravitațională" data-subtitle="Gravitație, câmp și orbite circulare"></script></body></html>'));
await write('docs/imported-gravity.json',JSON.stringify({id,source:'Interactiunea-gravitationala.html',sha256:createHash('sha256').update(raw).digest('hex'),adaptations:['Shared navigation, presentation, bilingual content and offline export','Scoped Praxis palette and keyboard-accessible activity tabs','Shared Canvas sampling and suspended hidden orbital animation','Removed external tracking, session-only source link and unrelated branding; quiz does not persist without consent']},null,2)+'\n');
console.log('Integrat: Interacțiunea gravitațională');
