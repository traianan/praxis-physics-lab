import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('calorimetry local source provenance remains intact',async()=>{
 const manifest=JSON.parse(await read('docs/imported-calorimetry.json'));
 for(const file of manifest.files){const data=await readFile(new URL('../'+manifest.source+'/'+file.path,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256);if(!['index.html','js/baza.js','js/lectie.js','js/figuri-1.js','js/figuri-2.js'].includes(file.path))assert.deepEqual(await readFile(new URL('../public/simulari/calorimetrie/'+file.path,import.meta.url)),data);}
});

test('thermodynamics local source provenance remains intact',async()=>{
 const manifest=JSON.parse(await read('docs/imported-thermodynamics.json'));
 for(const file of manifest.files){const source=await readFile(new URL('../'+manifest.source+'/'+file.path,import.meta.url));assert.equal(createHash('sha256').update(source).digest('hex'),file.sha256);if(!['index.html','js/baza.js','js/lectie.js','js/figuri-1.js','js/figuri-2.js'].includes(file.path))assert.deepEqual(await readFile(new URL('../public/simulari/notiuni-termodinamice/'+file.path,import.meta.url)),source);}
});
