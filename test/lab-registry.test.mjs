import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {chapters,simulations} from '../public/catalog.js';
import {readManifest,validateManifest,registryOutputs} from '../scripts/lab-registry.mjs';

test('manifest migration preserves every laboratory, chapter and workspace',async()=>{
 const manifest=await readManifest();
 assert.deepEqual(manifest.chapters,chapters);
 assert.deepEqual(manifest.labs.map(lab=>lab.metadata),simulations);
 assert.deepEqual(Object.fromEntries(manifest.labs.map(lab=>[lab.metadata.id,lab.workspace])),JSON.parse(await readFile(new URL('../public/design-system/lab-workspaces.json',import.meta.url),'utf8')));
});
test('registered lessons ship the offline format declared by their manifest',async()=>{
 for(const {metadata,offline} of (await readManifest()).labs){
  if(['archive','faraday'].includes(offline.kind)){
   await access(new URL('../public/simulari/'+metadata.id+'/'+offline.file,import.meta.url));
  }else if(offline.kind==='web-only'){
   await access(new URL('../public/'+metadata.href,import.meta.url));
  }else assert.fail('Unsupported offline format for '+metadata.id+': '+offline.kind);
 }
});
test('registry rejects duplicate ids, invalid chapters and unsafe paths',async()=>{
 const original=await readManifest();
 for(const mutate of [m=>m.labs.push(m.labs[0]),m=>m.labs[0].metadata.chapter='missing',m=>{m.labs.find(lab=>lab.offline.kind==='archive').offline.file='../escape.zip';},m=>m.labs[0].locales.push('../private')]){
  const changed=structuredClone(original);mutate(changed);assert.throws(()=>validateManifest(changed));
 }
});
test('generated registry files exactly match the manifest',async()=>{
 for(const [file,expected]of Object.entries(registryOutputs(await readManifest())))assert.equal((await readFile(new URL('../'+file,import.meta.url),'utf8')).replaceAll('\r\n','\n'),expected,file);
});

test('registry validates card details and publication order within a day',async()=>{
 const original=await readManifest();
 for(const fields of [{status:'unknown'},{image:'./assets/../private.svg'},{alt:' '},{addedOn:'2026-02-30'},{addedOrder:0}]){
  const manifest=structuredClone(original);
  Object.assign(manifest.labs[0].metadata,fields);
  assert.throws(()=>validateManifest(manifest));
 }
 const manifest=structuredClone(original);
 const [{metadata:first},{metadata:second}]=manifest.labs;
 Object.assign(second,{addedOn:first.addedOn,addedOrder:first.addedOrder});
 assert.throws(()=>validateManifest(manifest),/duplicate addition order/);
});

test('distributed embedded lessons use namespace ordering from the manifest',async()=>{
 for(const lab of (await readManifest()).labs){
  const html=await readFile(new URL('../public/'+lab.metadata.href,import.meta.url),'utf8');
  const embedded=html.match(/"namespaceList"\s*:\s*(\[[^\]]*\])/);
  if(embedded)assert.deepEqual(JSON.parse(embedded[1]),lab.locales,lab.metadata.id);
  else{
   const app=await readFile(new URL('../public/simulari/'+lab.metadata.id+'/app.js',import.meta.url),'utf8');
   assert.match(app,new RegExp("namespaceList:\\s*labNamespaces\\['"+lab.metadata.id+"'\\]"),lab.metadata.id);
  }
 }
});
