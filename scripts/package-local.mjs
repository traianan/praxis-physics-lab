import {cp,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {zipDirectory} from './zip.mjs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=new URL('../',import.meta.url),outputs=fileURLToPath(new URL('outputs/',root));
await mkdir(outputs,{recursive:true});
const target=await mkdtemp(path.join(outputs,'local-package-'));
if(!path.resolve(target).startsWith(path.resolve(outputs)+path.sep))throw new Error('Unsafe package staging path');
try{
 for(const name of ['.gitignore','DESIGN_SYSTEM.md','README.md','Porneste-local.cmd','Porneste-in-retea.cmd','package.json','vercel.json','public','dist','scripts','docs','sources','test','principiul-i-aplicatii','interactii-atomice','Transformari de stare de agregare','oscillator-mecanic','compunerea_oscilatiilor','chladni.html','Mcu-Lectie-Interactiva-Premium.html','gemini-code-1793291347541.html'])await cp(new URL(name,root),path.join(target,name),{recursive:true,filter:source=>!['.git','node_modules','.serena','.vercel'].includes(path.basename(source))});
 await zipDirectory(target,path.join(outputs,'Praxis-Fizica-local.zip'));
}finally{await rm(target,{recursive:true,force:true});}
console.log('Actualizat: outputs/Praxis-Fizica-local.zip');
