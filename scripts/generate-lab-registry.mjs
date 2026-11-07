import {readFile,writeFile} from 'node:fs/promises';
import {readManifest,registryOutputs} from './lab-registry.mjs';
const root=new URL('../',import.meta.url),manifest=await readManifest();
for(const lab of manifest.labs)for(const ns of lab.locales){
 if(lab.inlineLocales?.includes(ns))continue;
 for(const language of ['ro','en']){
  const data=JSON.parse(await readFile(new URL(`public/locales/${ns}/${language}.json`,root),'utf8'));
  if(data.locale!==language||(data.namespace!==undefined&&data.namespace!==ns))throw Error('Incorrect locale identity: '+ns+'/'+language);
 }
}
for(const [file,source]of Object.entries(registryOutputs(manifest))){
 if(process.argv.includes('--check')){
  if((await readFile(new URL(file,root),'utf8')).replaceAll('\r\n','\n')!==source)throw Error('Stale registry output: '+file+'; run npm run registry:generate');
 }else await writeFile(new URL(file,root),source);
}
console.log(`Laboratory registry: ${manifest.labs.length} laboratories; ${process.argv.includes('--check')?'verified':'generated'}.`);
