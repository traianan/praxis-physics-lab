import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {readManifest} from './lab-registry.mjs';

export async function buildOfflineReader(base){
 const read=(file,encoding)=>readFile(new URL(file,base),encoding);
 const {labs}=await readManifest();
 const archives=await Promise.all(labs.filter(({offline})=>['archive','faraday'].includes(offline.kind)).map(async ({metadata,offline})=>{
  const path='simulari/'+metadata.id+'/'+offline.file;
  const bytes=await read(path);
  return {id:metadata.id,title:metadata.title,path,sha256:createHash('sha256').update(bytes).digest('hex')};
 }));
 const previous=JSON.parse(await readFile(new URL('./offline-previous-archives.json',import.meta.url),'utf8'));
 const catalog=JSON.stringify({archives,previous});
 await writeFile(new URL('offline/archives.json',base),catalog+'\n');
 const shell=['offline/sw.js','offline/index.html','offline/offline.css','offline/app.js','offline/zip.js','design-system/tokens.css','assets/favicon.svg'];
 const version=createHash('sha256').update(catalog);
 for(const file of shell)version.update((await read(file,'utf8')).replaceAll('\r\n','\n'));
 await writeFile(new URL('offline/shell-version.js',base),'const VERSION = '+JSON.stringify(version.digest('hex'))+';\n');
}
