import test from 'node:test';import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';
import {simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('generator catalog, local resources, workspace and translations',async()=>{
 const entry=simulations.find(s=>s.id==='generator-electric');assert.ok(entry,'generator absent from catalog');assert.equal(entry.chapter,'electricitate-magnetism-circuite');
 for(const f of ['index.html','app.js','view.js','style.css'])assert.ok((await stat(new URL('../public/simulari/generator-electric/'+f,import.meta.url))).size>0);
 const workspace=JSON.parse(await read('public/design-system/lab-workspaces.json'));assert.ok(workspace['generator-electric']);
 const ro=JSON.parse(await read('public/locales/labs/generator-electric/ui/ro.json')),en=JSON.parse(await read('public/locales/labs/generator-electric/ui/en.json'));assert.deepEqual(Object.keys(ro.messages).sort(),Object.keys(en.messages).sort());
 for(const [key,value]of Object.entries(en.messages)){assert.ok(value);assert.deepEqual((key.match(/\{\w+\}/g)||[]).sort(),(value.match(/\{\w+\}/g)||[]).sort());}
});
