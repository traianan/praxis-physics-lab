import {labNamespaces} from './lab-registry.mjs';
import {inlineMathFonts} from './scientific-math-runtime.mjs';
/** File-compatible bundle of the authoritative local modules. */
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {zipDirectory} from './zip.mjs';
import {preparePresentation} from './prepare-presentation.mjs';
import {inlineStandaloneModule} from './standalone-module.mjs';
await preparePresentation();
const root=fileURLToPath(new URL('../',import.meta.url)),id='laboratorul-electromagnetic-faraday',source=path.join(root,'public/simulari',id),target=path.join(root,'outputs/offline-lessons',id);
const read=p=>readFile(p,'utf8');
let html=await inlineStandaloneModule(await read(path.join(source,'index.html')),{
 id,source,root,namespaceList:await labNamespaces(id)
});
for(const match of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)]){const css=await read(path.resolve(source,match[1]));html=html.replace(match[0],()=>'<style>'+css+'</style>');}
for(const match of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]){const js=await inlineMathFonts(await read(path.resolve(source,match[1])));html=html.replace(match[0],()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');}
html=html.replace('<head>','<head><script>document.documentElement.dataset.praxisStandalone="true";</script>').replace('../../assets/favicon.svg','assets/favicon.svg');
await mkdir(path.join(target,'assets'),{recursive:true});await writeFile(path.join(target,'index.html'),html);await cp(path.join(root,'public/assets/favicon.svg'),path.join(target,'assets/favicon.svg'));
await cp(path.join(root,'public/vendor/three/LICENSE'),path.join(target,'THREE-LICENSE.txt'));
await writeFile(path.join(target,'README.txt'),'Praxis · Faraday\nRO: Dezarhivează complet și deschide index.html. RO/EN și resursele 3D sunt incluse. Este necesar WebGL 2.\nEN: Extract all files and open index.html. RO/EN and 3D resources are included. WebGL 2 required.\n\nRO: Pe Android, Chrome poate refuza accesul din Descărcări. Consultă secțiunea Android din README.md al proiectului pentru metoda prin USB cu ADB.\nEN: On Android, Chrome may deny access from Downloads. See the Android section of the project README.md for the USB method using ADB.\n');
await zipDirectory(target,path.join(source,'faraday-offline.zip'));console.log('Faraday standalone: '+target);

