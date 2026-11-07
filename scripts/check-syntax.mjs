import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root=fileURLToPath(new URL('../',import.meta.url));
async function collect(directory){
 const files=[];
 for(const entry of await readdir(path.join(root,directory),{withFileTypes:true})){
  if(entry.name==='vendor'||entry.name==='node_modules')continue;
  const relative=path.join(directory,entry.name);
  if(entry.isDirectory())files.push(...await collect(relative));
  else if(entry.isFile()&&/\.(?:m?js|cjs)$/.test(entry.name))files.push(relative);
 }
 return files.sort();
}
const files=[...await collect('public'),...await collect('scripts')];
let failures=0;
for(const file of files){
 // This import adapter is injected inside a function by import-waves.mjs.
 // Parse it in that context instead of excluding it or rejecting valid returns.
 if(file.replaceAll(path.sep,'/')==='scripts/waves-jsx-adapter.js'){
  try{new vm.Script('(function(type,props,key){\n'+await readFile(path.join(root,file),'utf8')+'\n})',{filename:file});}
  catch(error){failures++;console.error(error);}
  continue;
 }
 const result=spawnSync(process.execPath,['--check',file],{cwd:root,encoding:'utf8'});
 if(result.error||result.status!==0){
  failures++;
  console.error(`${file}\n${result.error?.message||result.stderr||result.stdout}`);
 }
}
console.log(`Syntax: ${files.length} JavaScript files checked; ${failures} failures (vendor excluded).`);
if(failures)process.exitCode=1;
