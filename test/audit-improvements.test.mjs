import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('Home classification bundle stays below 25 KB without a mathematics runtime',async()=>{
 const bundle=await read('public/shared/content-types.bundle.js');
 assert.ok(Buffer.byteLength(bundle)<25*1024,`${Buffer.byteLength(bundle)} bytes`);
 assert.match(bundle,/PraxisContentUI/);
 assert.doesNotMatch(bundle,/PraxisMath|base64|window\.katex/);
});

test('shared web header stays below 100 KB without embedding the math engine or fonts',async()=>{
 const header=await read('public/shared/lab-header.js');
 assert.ok(Buffer.byteLength(header)<100*1024);
 assert.doesNotMatch(header,/data:font\/woff2;base64/);
 assert.match(header,/PraxisLoadMathEngine/);
});

test('Home provides every catalog link without JavaScript',async()=>{
 const html=await read('public/index.html');
 const fallback=html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0];
 assert.ok(fallback,'Missing static fallback');
 for(const lab of simulations)assert.ok(fallback.includes(`href="${lab.href}"`),lab.id);
 assert.ok(html.includes(`${simulations.length} simulări`));
});

test('capacitor navigation and complete subtitle translate through the actual dictionary',async()=>{
 const {messages}=JSON.parse(await read('public/locales/capacitor/en.json'));
 assert.equal(messages['Laborator'],'Laboratory');
 assert.equal(messages['Secțiunile lecției'],'Lesson sections');
 assert.equal(messages['Laborator interactiv de electrostatică'],'Interactive electrostatics laboratory');
});

test('English dictionaries do not copy Romanian text containing diacritics',async()=>{
 async function scan(directory){
  for(const entry of await readdir(new URL('../'+directory,import.meta.url),{withFileTypes:true})){
   const path=directory+'/'+entry.name;
   if(entry.isDirectory())await scan(path);
   else if(entry.name==='en.json')for(const [key,value]of Object.entries(JSON.parse(await read(path)).messages||{}))
    assert.ok(key!==value||!/[ăâîșț]/i.test(key),path+': '+key);
  }
 }
 await scan('public/locales');
});

test('pendulum results remain in page memory and cannot survive reload, including offline',async()=>{
 const source=await read('public/simulari/pendulul-gravitational/app.js');
 const fragment=source.match(/const pageResults = new Map\(\);[\s\S]*?\n  \};/)[0];
 const page=()=>{const context={localStorage:{setItem(){assert.fail('Results must not persist');},getItem(){assert.fail('Results must not be restored');}}};vm.runInNewContext(fragment+'\nglobalThis.store=store;',context);return context.store;};
 const first=page();first.set('points',[[1,2]]);assert.equal(JSON.stringify(first.get('points',[])),'[[1,2]]');
 assert.equal(JSON.stringify(page().get('points',[])),'[]');
});
