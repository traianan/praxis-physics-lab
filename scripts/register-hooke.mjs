// Idempotent catalog/workspace/locale registration. Native public files are authoritative.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pairs} from '../public/simulari/legea-lui-hooke/content.js';
const root=new URL('../public/',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const save=async(p,data)=>{const url=new URL(p,root);await mkdir(new URL('.',url),{recursive:true});await writeFile(url,JSON.stringify(data,null,2)+'\n');};
const id='legea-lui-hooke';
const metadata={title:'Legea lui Hooke',subtitle:'De la deformare la lucru mecanic și energie',description:'Resort interactiv, grafice forță–deformare și energie, lucru mecanic și conservarea energiei.',alt:'Resort orizontal și graficele forței și energiei elastice',tags:['Elasticitate','Lucru mecanic','Energie'],keywords:'hooke resort elastic constantă elastică deformare compresie lucru mecanic energie putere'};
const en={title:'Hooke’s law',subtitle:'From deformation to work and energy',description:'Interactive spring, force–deformation and energy graphs, work and energy conservation.',alt:'Horizontal spring and spring force and energy graphs',tags:['Elasticity','Work','Energy'],keywords:'hooke spring elasticity stiffness deformation compression work energy power'};
for(const locale of ['ro','en']){
 const chapter=await read(`locales/chapters/lucru-energie-putere/${locale}.json`);chapter.messages[metadata.title]=locale==='ro'?metadata.title:en.title;chapter.simulations[id]=locale==='ro'?metadata:en;
 await save(`locales/chapters/lucru-energie-putere/${locale}.json`,chapter);
 await save(`locales/labs/${id}/ui/${locale}.json`,{locale,namespace:`labs/${id}/ui`,messages:Object.fromEntries(pairs.map(([ro,en])=>[ro,locale==='ro'?ro:en]))});
}
const workspaces=await read('design-system/lab-workspaces.json');workspaces[id]={workspaces:[{selector:'.hooke-workspace',scene:'.hooke-visual',controls:'.hooke-controls',graphs:'.hooke-graphs',layout:'native'}]};await save('design-system/lab-workspaces.json',workspaces);
let catalog=await readFile(new URL('catalog.js',root),'utf8');
const entry={id,addedOn:'2026-11-04',addedOrder:3,chapter:'lucru-energie-putere',...metadata,href:`./simulari/${id}/index.html`,image:'./assets/legea-lui-hooke.svg',status:'available'};
if(!catalog.includes("\"id\":\"legea-lui-hooke\"")){
 catalog=catalog.replace(/(export const simulations\s*=\s*\[)/,`$1\n ${JSON.stringify(entry)},`);
}else catalog=catalog.replace(/^ *\{"id":"legea-lui-hooke".*\},\r?$/m,` ${JSON.stringify(entry)},`);
await writeFile(new URL('catalog.js',root),catalog);
