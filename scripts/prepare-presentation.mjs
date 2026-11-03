import {readFile,writeFile} from 'node:fs/promises';
import {chapters,simulations} from '../public/catalog.js';
import {scientificMathRuntime} from './scientific-math-runtime.mjs';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8'),write=(p,s)=>writeFile(new URL(p,root),s);
export async function preparePresentation(){
 const laboratory=(await read('public/design-system/laboratory.css')).replace(/\n\/\* praxis:lab-discovery \*\/[\s\S]*?\/\* \/praxis:lab-discovery \*\//g,'').replace(/\n\/\* praxis:workspace \*\/[\s\S]*?\/\* \/praxis:workspace \*\//g,'');
 await write('public/design-system/laboratory.css',laboratory.trimEnd()+'\n/* praxis:lab-discovery */\n'+await read('public/design-system/laboratory-premium.css')+'\n/* /praxis:lab-discovery */\n\n/* praxis:workspace */\n'+await read('public/design-system/lab-workspace.css')+'\n/* /praxis:workspace */\n');
 const catalog=JSON.parse(await read('public/design-system/content-types.json'));
 for(const lang of ['ro','en']){const path='public/locales/common/'+lang+'.json',data=JSON.parse(await read(path));for(const [ro,en]of Object.entries({'Reperele lecțiilor':'Lesson guide','Navigare în lecție':'Lesson navigation','Axa de rotație':'Rotation axis'}))data.messages[ro]=lang==='ro'?ro:en;for(const type of catalog.types)data.messages[type.ro]=lang==='ro'?type.ro:type.en;await write(path,JSON.stringify(data,null,2)+'\n');}
 const lessonChapters=Object.fromEntries(simulations.map(sim=>{const chapter=chapters.find(ch=>ch.id===sim.chapter);return [sim.id,{id:chapter.id,title:chapter.title}];}));
 const runtime='window.PraxisLessonChapters='+JSON.stringify(lessonChapters)+';\nwindow.PraxisContentCatalog='+JSON.stringify(catalog)+';\n'+await read('public/shared/canvas-resolution.js')+'\n'+await read('public/shared/content-types.js')+'\n'+await read('public/shared/scientific-readouts.js')+'\n'+await read('public/shared/panel-layout.js')+'\n'+await scientificMathRuntime();
 await write('public/shared/content-types.bundle.js',runtime);
 const iconCSS=Object.entries(catalog.icons).map(([id,path])=>{
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
  return '[data-content-icon="'+id+'"]{--content-icon:url("data:image/svg+xml,'+encodeURIComponent(svg)+'")}';
 }).join('\n');
 const css=(await read('public/design-system/components.css')).replace(/\n\/\* praxis:presentation \*\/[\s\S]*?\/\* \/praxis:presentation \*\//g,'');
 await write('public/design-system/components.css',css.trimEnd()+'\n/* praxis:presentation */\n'+iconCSS+'\n'+await read('public/design-system/premium.css')+'\n'+await read('public/shared/scientific-math.css')+'\n/* /praxis:presentation */\n');
 const header=(await read('public/shared/lab-header.js')).replace(/\n\/\* praxis:content-types \*\/[\s\S]*?\/\* \/praxis:content-types \*\//g,'');
 const workspace='window.PraxisLabWorkspaceConfig='+JSON.stringify(JSON.parse(await read('public/design-system/lab-workspaces.json')))+';\n'+await read('public/shared/lab-workspace.js');
 await write('public/shared/lab-header.js',header.trimEnd()+'\n/* praxis:content-types */\n'+runtime+'\n'+workspace+'\n/* /praxis:content-types */\n');
 let index=await read('public/index.html');if(!index.includes('shared/content-types.bundle.js'))index=index.replace('</head>','<script src="./shared/content-types.bundle.js" defer></script></head>');await write('public/index.html',index);
 const lines=['# Catalogul tipurilor de conținut Praxis','',catalog.policy,'','| Tip | RO / EN | Pictogramă | Utilizare |','| --- | --- | --- | --- |',...catalog.types.map(type=>'| `'+type.id+'` | '+type.ro+' / '+type.en+' | '+(type.icon||'Fără pictogramă')+' | '+type.usage+' |'),'','Sursa unică este `public/design-system/content-types.json`. Sunt șapte pictograme SVG locale, fără fonturi sau servicii externe.','', 'Pentru conținut nou, marchează titlul cu `data-content-type="simulation"` (sau tipul potrivit). Componenta comună îl recunoaște automat. `data-no-content-icon` exclude un titlu. Nu adăuga iconuri în formule, Canvas, jurnale editabile sau în fiecare paragraf.','', 'Build-ul include registrul și rendererul în antetul comun, inclusiv în distribuțiile autonome. Auditul euristic este doar o completare pentru lecțiile importate; atributul explicit este contractul pentru conținutul nou.',''];
 await write('docs/CATALOG_CONTINUT.md',lines.join('\n'));
 const path='public/design-system/components.json',components=JSON.parse(await read(path));components.version='1.1.0';components.contentTypes={catalog:'design-system/content-types.json',runtime:'shared/content-types.js',attribute:'data-content-type',iconFamilies:Object.keys(catalog.icons),policy:catalog.policy};await write(path,JSON.stringify(components,null,2)+'\n');
}
