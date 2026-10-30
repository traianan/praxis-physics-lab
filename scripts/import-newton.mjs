import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='principiile-mecanicii-newtoniene';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,s)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),s);};
const data=JSON.parse(await read('scripts/newton-content.json'));
for(const lang of ['ro','en'])await write('public/locales/newton/'+lang+'.json',JSON.stringify({locale:lang,...data[lang]},null,2)+'\n');
const ns=['common','chapters/miscare','courses/shared','newton'],embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const styles=['design-system/tokens.css','design-system/components.css','shared/course.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/newton.css'];
const scripts=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','newton-model.js','newton-materials-model.js','newton-materials.js'];
const tabs=data.ro.tabs.map(([key,label])=>`<button class="tab" role="tab" data-tab="${key}">${label}</button>`).join('');
const head=styles.map(p=>`<link rel="stylesheet" href="../../${p}">`).join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+scripts.map(p=>`<script src="../../shared/${p}"></script>`).join('');
await write('public/simulari/'+id+'/index.html',withFavicon(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Principiile mecanicii newtoniene: șase experimente interactive, teorie, probleme și test, în română și engleză."><title>Principiile mecanicii newtoniene — Praxis</title>${head}</head><body data-praxis-course="${id}" data-praxis-laboratory="true"><main id="praxis-original"><div class="tabs" role="tablist" aria-label="Secțiunea lecției">${tabs}</div><div id="newton-content" data-no-i18n></div><p class="newton-download"><a href="${id}.zip">Descarcă lecția offline</a></p></main><script src="../../shared/newton.js"></script><script src="../../shared/course.js" data-course="${id}" data-title="Principiile mecanicii newtoniene"></script></body></html>`));
const sim={id,addedOn:'2026-10-30',addedOrder:4,chapter:'miscare',title:data.ro.title,subtitle:data.ro.subtitle,description:data.ro.description,href:'./simulari/'+id+'/index.html',image:'./assets/'+id+'.svg',alt:data.ro.alt,tags:['Dinamică','Experimente','Test','Offline'],keywords:'newton mecanica dinamica inertie masa forta acceleratie actiune reactiune impuls galilei frecare plan inclinat hooke elasticitate young tensiune',status:'available'};
let catalog=await read('public/catalog.js');if(!catalog.includes('"id":"'+id+'"'))await write('public/catalog.js',catalog.replace('\n];\nexport const normalize',',\n '+JSON.stringify(sim)+'\n];\nexport const normalize'));
for(const lang of ['ro','en']){const p='public/locales/chapters/miscare/'+lang+'.json',locale=JSON.parse(await read(p));locale.simulations[id]={title:data[lang].title,subtitle:data[lang].subtitle,description:data[lang].description,alt:data[lang].alt,tags:lang==='ro'?sim.tags:['Dynamics','Experiments','Quiz','Offline']};await write(p,JSON.stringify(locale,null,2)+'\n');}
console.log('Integrat: '+id);
