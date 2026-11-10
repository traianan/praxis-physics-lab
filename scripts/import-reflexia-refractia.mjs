import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {labNamespaces,labMetadata} from './lab-registry.mjs';
import {withFavicon} from './favicon.mjs';

const root=new URL('../',import.meta.url),sourceRoot=new URL('../../reflexia-refractia/',import.meta.url),id='reflexia-refractia';
const read=path=>readFile(new URL(path,sourceRoot),'utf8');
const write=async(path,data)=>{const url=new URL(path,root);await mkdir(new URL('./',url),{recursive:true});await writeFile(url,data);};
const source=(await read('index.html')).replaceAll('\r\n','\n');
const main=source.match(/<main id="main">([\s\S]*?)<\/main>/)?.[1];
if(!main)throw new Error('Main lesson content was not found in reflexia-refractia/index.html');

const tabs=[['deschidere','Introducere'],['principiu','Principiul lui Huygens'],['reflexia','Reflexia'],['refractia','Refracția'],['exemple','Exemple rezolvate'],['verificare','Verificare'],['resurse','Resurse']];
let body=main.trim();
for(const [id]of tabs){
 if(id==='deschidere')body=body.replace('<section class="hero">','<section class="hero" id="deschidere">');
 else if(!body.includes(`id="${id}"`))throw new Error(`Lesson section #${id} was not found`);
}
const tabNav='<nav class="tabs rr-tabs" role="tablist" aria-label="Secțiunile lecției">'+tabs.map(([key,label],index)=>`<button class="tab${index===0?' active':''}" id="rr-tab-${key}" type="button" role="tab" data-tab="${key}" aria-controls="${key}" aria-selected="${index===0}" tabindex="${index===0?'0':'-1'}">${label}</button>`).join('')+'</nav>';
body=body.replace('<section class="hero" id="deschidere">','<section class="hero" id="deschidere" data-rr-panel="deschidere">');
for(const [key]of tabs.slice(1))body=body.replace(`<section class="section" id="${key}">`,`<section class="section" id="${key}" data-rr-panel="${key}"${key==='principiu'?'':' hidden'}>`);
body=body.replace('</main>', '</main>');
const resourcesStart=body.indexOf('<section class="section" id="resurse"');
const resourcesEnd=body.indexOf('</section>',resourcesStart);
if(resourcesStart<0||resourcesEnd<0)throw new Error('The resources tab boundary changed');
body=body.slice(0,resourcesEnd)+'<p class="rr-offline-download"><a class="btn btn--ghost" href="./reflexia-refractia.zip" download>Descarcă lecția offline</a></p>\n      '+body.slice(resourcesEnd);
body=tabNav+'\n'+body;

const head=['tokens.css','components.css','lab-layout.css','laboratory.css','compact.css'].map(name=>`<link rel="stylesheet" href="../../design-system/${name}">`).join('')+
 '<link rel="stylesheet" href="../../shared/course.css">'+
 ['base.css','controls.css','sim-aperture.css','sim-huygens.css','sim-reflectie.css','sim-refractie.css'].map(name=>`<link rel="stylesheet" href="./css/${name}">`).join('')+
 '<link rel="stylesheet" href="./css/praxis-adaptation.css">'+
 '<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:['common','chapters/sunete-si-unde','courses/shared','courses/reflexia-refractia/ui'],embedded:{ro:{},en:{}}}).replaceAll('</script','<\\/script>')+');</script>'+
 ['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js'].map(name=>`<script src="../../shared/${name}"></script>`).join('');
const html='<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reflexia și refracția undelor mecanice — Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true"><main id="praxis-original">'+body+'</main>'+['core.js','praxis-adapter.js','app.js','sim-aperture.js','sim-huygens.js','sim-reflectie.js','sim-refractie.js','quiz.js','tabs.js'].map(name=>`<script src="./js/${name}"></script>`).join('')+'<script src="../../shared/course.js" data-course="'+id+'" data-title="Reflexia și refracția undelor mecanice"></script></body></html>';

const target=new URL('public/simulari/'+id+'/',root);await mkdir(target,{recursive:true});
for(const dir of ['css','js','fonts'])await cp(new URL(dir+'/',sourceRoot),new URL(dir+'/',target),{recursive:true});
await cp(new URL('scripts/adaptations/reflexia-refractia.css',root),new URL('css/praxis-adaptation.css',target));
await cp(new URL('scripts/adaptations/reflexia-refractia-audio.js',root),new URL('js/praxis-adapter.js',target));
await cp(new URL('scripts/adaptations/reflexia-refractia-tabs.js',root),new URL('js/tabs.js',target));
await write('public/simulari/'+id+'/index.html',withFavicon(html));

const uiMessages=JSON.parse(await readFile(new URL('scripts/reflexia-refractia-en.json',root),'utf8'));
for(const lang of ['ro','en'])await write(`public/locales/courses/${id}/ui/${lang}.json`,JSON.stringify({locale:lang,namespace:`courses/${id}/ui`,messages:lang==='en'?uiMessages:Object.fromEntries(Object.keys(uiMessages).map(key=>[key,key]))},null,2)+'\n');
const namespaces=await labNamespaces(id),embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const ns of namespaces)embedded[lang][ns]=JSON.parse(await readFile(new URL(`public/locales/${ns}/${lang}.json`,root),'utf8'));
const out=await readFile(new URL(`public/simulari/${id}/index.html`,root),'utf8');
const init=`PraxisI18n.initEmbedded(${JSON.stringify({namespaceList:namespaces,embedded}).replaceAll('</script','<\\/script>')});`;
await write(`public/simulari/${id}/index.html`,out.replace(/PraxisI18n\.initEmbedded\([\s\S]*?\);<\/script>/,init+'</script>'));
const metadata=await labMetadata(id);
for(const lang of ['ro','en']){
 const path=`public/locales/chapters/sunete-si-unde/${lang}.json`,data=JSON.parse(await readFile(new URL(path,root),'utf8'));
 data.simulations[id]=lang==='ro'?Object.fromEntries(['title','subtitle','description','alt','tags'].map(key=>[key,metadata[key]])):{title:'Mechanical wave reflection and refraction',subtitle:'Huygens’s principle, reflection and refraction',description:'Interactive lesson with four wave simulations, Huygens construction, solved examples and a nine-question check.',alt:'Incident, reflected and refracted wave fronts at a boundary',tags:['Waves','Huygens','Experiments','Offline']};
 await write(path,JSON.stringify(data,null,2)+'\n');
}
await write('docs/imported-reflexia-refractia.json',JSON.stringify({id,source:'../reflexia-refractia/index.html',sha256:createHash('sha256').update(source).digest('hex'),simulations:4,sections:tabs.map(([,label])=>label),adaptations:['Praxis shared header, settings, sound and chapter return','Seven accessible lesson tabs','Locally bundled lesson scripts, styles and fonts','Single shared sound switch']},null,2)+'\n');
console.log('Integrat: Reflexia și refracția undelor mecanice');
