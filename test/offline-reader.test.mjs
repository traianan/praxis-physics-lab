import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readManifest} from '../scripts/lab-registry.mjs';
import {readPraxisZip} from '../public/offline/zip.js';

test('the Android reader can unpack every distributed Praxis archive',async()=>{
 for(const {metadata,offline} of (await readManifest()).labs){
  const bytes=await readFile(new URL('../public/simulari/'+metadata.id+'/'+offline.file,import.meta.url));
  let entry;
  for await(const {file,decoded} of readPraxisZip(new Uint8Array(bytes).buffer)){
   if(file==='index.html')entry=new TextDecoder().decode(decoded);
  }
  assert.match(entry||'',/<html\b/i,metadata.id);
 }
});

test('the Android reader rejects unsafe archive paths and truncated input',async()=>{
 const bytes=await readFile(new URL('../public/simulari/legea-lui-hooke/legea-lui-hooke.zip',import.meta.url));
 const damaged=new Uint8Array(bytes);
 damaged.set(new TextEncoder().encode('../'),30);
 await assert.rejects(async()=>{for await(const _ of readPraxisZip(damaged.buffer)){}},/Cale ZIP/);
 await assert.rejects(async()=>{for await(const _ of readPraxisZip(new Uint8Array(bytes.subarray(0,20)).buffer)){}},/incomplet/);
});

test('the published offline catalog identifies only the exact distributed archives',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../dist/offline/archives.json',import.meta.url)));
 const {labs}=await readManifest();
 assert.deepEqual(catalog.archives.map(x=>x.id),labs.map(x=>x.metadata.id));
 for(const {path,sha256} of catalog.archives){
  const body=await readFile(new URL('../dist/'+path,import.meta.url));
  assert.equal(sha256,createHash('sha256').update(body).digest('hex'),path);
 }
});
