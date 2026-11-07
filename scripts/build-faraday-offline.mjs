import {labNamespaces} from './lab-registry.mjs';
import {inlineMathFonts} from './scientific-math-runtime.mjs';
/** File-compatible bundle of the authoritative local modules. */
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {zipDirectory} from './zip.mjs';
import {preparePresentation} from './prepare-presentation.mjs';
const {build}=await import(process.env.PRAXIS_ESBUILD_MODULE?pathToFileURL(process.env.PRAXIS_ESBUILD_MODULE).href:'esbuild');
await preparePresentation();
const root=fileURLToPath(new URL('../',import.meta.url)),id='laboratorul-electromagnetic-faraday',source=path.join(root,'public/simulari',id),target=path.join(root,'outputs/offline-lessons',id);
const read=p=>readFile(p,'utf8'),embedded={};
for(const lang of ['ro','en']){embedded[lang]={};for(const ns of await labNamespaces(id))embedded[lang][ns]=JSON.parse(await read(path.join(root,'public/locales',ns,lang+'.json')));}
let app=await read(path.join(source,'app.js'));
app=app.replace("namespaceList:labNamespaces['laboratorul-electromagnetic-faraday']","namespaceList:labNamespaces['laboratorul-electromagnetic-faraday'],embedded:window.FaradayEmbedded");
const courseScript=await read(path.join(root,'public/shared/course.js'));
app=app.replace("integration.src='../../shared/course.js'",()=> 'integration.textContent='+JSON.stringify(courseScript));
app=app.replace('document.body.append(integration);','document.body.append(integration);integration.onload();');
const imports=[...app.matchAll(/^import .*?;$/gm)].map(m=>m[0]);app=app.replace(/^import .*?;$/gm,'');
const bundled=await build({stdin:{contents:imports.join('\n')+'\n(async()=>{'+app+'\n})().catch(console.error);',resolveDir:source,sourcefile:'faraday-offline-entry.js'},bundle:true,format:'iife',write:false,minify:true,target:'es2022',legalComments:'inline'});
let html=await read(path.join(source,'index.html'));html=html.replace(/<script type="module" src="app.js"><\/script>/,'');
for(const match of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)]){const css=await read(path.resolve(source,match[1]));html=html.replace(match[0],()=>'<style>'+css+'</style>');}
for(const match of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]){const js=await inlineMathFonts(await read(path.resolve(source,match[1])));html=html.replace(match[0],()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');}
html=html.replace('<head>','<head><script>document.documentElement.dataset.praxisStandalone="true";</script>').replace('../../assets/favicon.svg','assets/favicon.svg').replace('</body>',()=>'<script>window.FaradayEmbedded='+JSON.stringify(embedded)+';'+bundled.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script></body>');
await mkdir(path.join(target,'assets'),{recursive:true});await writeFile(path.join(target,'index.html'),html);await cp(path.join(root,'public/assets/favicon.svg'),path.join(target,'assets/favicon.svg'));
await cp(path.join(root,'public/vendor/three/LICENSE'),path.join(target,'THREE-LICENSE.txt'));
await writeFile(path.join(target,'README.txt'),'Praxis · Faraday\nRO: Dezarhivează complet și deschide index.html. RO/EN și resursele 3D sunt incluse. Este necesar WebGL 2.\nEN: Extract all files and open index.html. RO/EN and 3D resources are included. WebGL 2 required.\n');
await zipDirectory(target,path.join(source,'faraday-offline.zip'));console.log('Faraday standalone: '+target);

