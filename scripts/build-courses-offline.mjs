import {readManifest} from './lab-registry.mjs';
import {inlineMathFonts} from './scientific-math-runtime.mjs';
import {withFavicon} from './favicon.mjs';
import {withLinkPresentation} from './link-presentation.mjs';
import {preparePresentation} from './prepare-presentation.mjs';
import {inlineStandaloneModule} from './standalone-module.mjs';
await preparePresentation();
import {cp,readFile,writeFile,mkdir,readdir} from 'node:fs/promises';import {zipDirectory} from './zip.mjs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import vm from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url)),report=[];
const courses=(await readManifest()).labs.filter(lab=>lab.offline.kind==='archive');
const requested=process.argv.find(arg=>arg.startsWith('--course='))?.slice('--course='.length);
if(!requested||requested==='laboratorul-electromagnetic-faraday')await import('./build-faraday-offline.mjs');
if(requested==='laboratorul-electromagnetic-faraday')process.exit(0);
if(requested&&!courses.some(lab=>lab.metadata.id===requested))throw new Error('Unknown offline course: '+requested);
const selected=courses.filter(lab=>!requested||lab.metadata.id===requested);
const moduleStyles=new Map([
 ['legea-lui-hooke','style.css'],
 ['generator-electric','style.css'],
 ['pila-daniell','style.css'],
 ['unde-seismice','seismic.css'],
]);
if(requested){try{report.push(...JSON.parse(await readFile(path.join(root,'docs/offline-courses.json'),'utf8')).courses.filter(course=>course.id!==requested));}catch(error){if(error.code!=='ENOENT')throw error;}}
for(const {metadata:{id},offline:{file:zipName},locales,inlineLocales}of selected){
 const source=path.join(root,'public/simulari',id),target=path.join(root,'outputs/offline-lessons',id);await mkdir(target,{recursive:true});
 const moduleStyle=moduleStyles.get(id);
 if(moduleStyle)await cp(path.join(source,moduleStyle),path.join(target,moduleStyle));
 else await cp(source,target,{recursive:true,filter:file=>!file.toLowerCase().endsWith('.zip')});
 let html=withLinkPresentation(withFavicon(await readFile(path.join(source,'index.html'),'utf8')));
 if(moduleStyle)html=await inlineStandaloneModule(html,{id,source,root,namespaceList:locales,inlineLocales});
 html=html.replace(/<a data-offline-download /g,'<a hidden ');
 for(const match of [...html.matchAll(/<link[^>]+href="\.\.\/\.\.\/([^"]+\.css)"[^>]*>/g)]){const css=await readFile(path.join(root,'public',match[1]),'utf8');html=html.replace(match[0],()=>'<style>'+css+'</style>');}
 for(const match of [...html.matchAll(/<script([^>]*?)src="\.\.\/\.\.\/([^"]+)"([^>]*)><\/script>/g)]){
  const js=await inlineMathFonts(await readFile(path.join(root,'public',match[2]),'utf8'));html=html.replace(match[0],()=>'<script'+match[1]+match[3]+'>'+js.replaceAll('</script','<\\/script')+'</script>');
 }
 html=html.replace('href="../../assets/favicon.svg"','href="./assets/favicon.svg"');
 html=html.replace('<head>','<head><script>document.documentElement.dataset.praxisStandalone="true";</script>');
 if(id==='generator-electric')await cp(path.join(root,'public/vendor/three/LICENSE'),path.join(target,'THREE-LICENSE.txt'));
 await mkdir(path.join(target,'assets'),{recursive:true});await cp(path.join(root,'public/assets/favicon.svg'),path.join(target,'assets/favicon.svg'));
 await writeFile(path.join(target,'index.html'),html,'utf8');
 if(id==='calcul-vectorial'){
  const worker=path.join(target,'sw.js');let sw=await readFile(worker,'utf8');
  sw=sw.replace(/'\.\.\/\.\.\/[^']+',?/g,'').replace(/const VERSION = '[^']+';/,"const VERSION = 'praxis-vectori-standalone-"+createHash('sha256').update(html).digest('hex').slice(0,12)+"';");
  await writeFile(worker,sw,'utf8');
 }
 const graphicsNote=id==='generator-electric'?'\nRO: Ansamblul 3D necesită un browser cu WebGL 2.\nEN: The 3D assembly requires a browser with WebGL 2.\n':'';
 await writeFile(path.join(target,'README.txt'),'PRAXIS SCIENCE LAB\nRO / EN · offline · Praxis / Vivid · Touch mode\n\nRO: Pe calculator, deschide index.html în browser, după dezarhivarea completă. Nu sunt necesare internetul, Node sau instalări. Home revine la începutul lecției. Pentru biblioteca întreagă și Android prin LAN folosește pachetul Praxis-Fizica-local.zip și Porneste-local.cmd pe PC.\n\nEN: On a computer, extract all files, then open index.html in your browser. No internet, Node or installation is required. Home returns to the lesson start. For the full library and Android over LAN, use Praxis-Fizica-local.zip and run Porneste-local.cmd on the PC.\n\nRO: Pe Android, deschide o dată https://praxis-physics-lab.vercel.app/offline/index.html în Chrome cu internet. Apoi selectează acest ZIP în pagina Arhive offline, chiar și fără conexiune. Deschide lecția din Lecții salvate.\nEN: On Android, open https://praxis-physics-lab.vercel.app/offline/index.html once in Chrome while online. Then choose this ZIP on the offline page, even without a connection. Open it from the saved lessons list.\n'+graphicsNote);
 if(/(?:src|href)="\.\.\/\.\.\/(?:shared|design-system)\//.test(html))throw new Error('External shared dependency in '+id);
 for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/application\/json|type="module"/.test(script[1])&&script[2].trim())new vm.Script(script[2]);
 const destination=path.join(source,zipName);await zipDirectory(target,destination);
 report.push({id,file:'public/simulari/'+id+'/'+zipName,sha256:createHash('sha256').update(await readFile(destination)).digest('hex'),languages:['ro','en'],sharedDependencies:'inlined',localResources:true});
}
await writeFile(path.join(root,'docs/offline-courses.json'),JSON.stringify({builtAt:new Date().toISOString(),courses:report},null,2)+'\n');console.log(selected.length+' arhive autonome bilingve actualizate, fără cereri de traducere în rețea.');
