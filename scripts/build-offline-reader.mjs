import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {readManifest} from './lab-registry.mjs';

const base = new URL('../dist/', import.meta.url);
const read = file => readFile(new URL(file,base));
const {labs} = await readManifest();
const archives = await Promise.all(labs.map(async ({metadata,offline}) => {
 const path = 'simulari/'+metadata.id+'/'+offline.file;
 const bytes = await read(path);
 return {id:metadata.id,title:metadata.title,path,sha256:createHash('sha256').update(bytes).digest('hex')};
}));
const previous = JSON.parse(await readFile(new URL('./offline-previous-archives.json',import.meta.url),'utf8'));
const catalog = JSON.stringify({archives,previous});
await writeFile(new URL('offline/archives.json',base),catalog);
const shell = ['offline/index.html','offline/offline.css','offline/app.js','offline/zip.js','design-system/tokens.css','assets/favicon.svg'];
const worker = await read('offline/sw.js');
const version = createHash('sha256').update(worker).update(catalog);
for(const file of shell)version.update(await read(file));
await writeFile(new URL('offline/sw.js',base),'const VERSION = '+JSON.stringify(version.digest('hex'))+';\n'+worker);
