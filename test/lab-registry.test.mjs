import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chapters,simulations} from '../public/catalog.js';
import {readManifest,validateManifest,registryOutputs} from '../scripts/lab-registry.mjs';

test('manifest migration preserves every laboratory, chapter and workspace',async()=>{
 const manifest=await readManifest();
 assert.deepEqual(manifest.chapters,chapters);
 assert.deepEqual(manifest.labs.map(lab=>lab.metadata),simulations);
 assert.deepEqual(Object.fromEntries(manifest.labs.map(lab=>[lab.metadata.id,lab.workspace])),JSON.parse(await readFile(new URL('../public/design-system/lab-workspaces.json',import.meta.url),'utf8')));
 assert.equal(manifest.labs.filter(lab=>lab.offline.kind==='archive').length,23);
 assert.equal(manifest.labs.filter(lab=>lab.offline.kind==='faraday').length,1);
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

test('distributed embedded lessons use namespace ordering from the manifest',async()=>{
 for(const lab of (await readManifest()).labs){
  const html=await readFile(new URL('../public/'+lab.metadata.href,import.meta.url),'utf8');
  const embedded=html.match(/"namespaceList":(\[[^\]]*\])/);
  if(embedded)assert.deepEqual(JSON.parse(embedded[1]),lab.locales,lab.metadata.id);
  else{
   const app=await readFile(new URL('../public/simulari/'+lab.metadata.id+'/app.js',import.meta.url),'utf8');
   assert.ok(app.includes("namespaceList:labNamespaces['"+lab.metadata.id+"']"),lab.metadata.id);
  }
 }
});
