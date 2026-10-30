import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
import {adaptVectorNavigation} from '../scripts/vector-navigation-adapter.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('vector tabs cover all fourteen original subjects without modifying lesson content',async()=>{
 const code=await read('public/shared/vector-tabs.js'),groups=vm.runInNewContext(code.match(/const groups=(\[[\s\S]*?\]);/)[1]);
 assert.equal(groups.length,7);assert.deepEqual(Array.from(groups.flatMap(g=>g.ids)),Array.from({length:14},(_,i)=>'s'+(i+1)));
 const html=await read('public/simulari/calcul-vectorial/index.html');for(const id of groups.flatMap(g=>g.ids))assert.match(html,new RegExp('<section class="sec" id="'+id+'"'));
 assert.match(html,/shared\/vector-tabs\.js/);assert.match(html,/shared\/vector-tabs\.css/);
 assert.equal(adaptVectorNavigation(adaptVectorNavigation(html,true)),html);
});
test('vector demonstrations stop when their subject is hidden and preserve runner cancellation',async()=>{
 const html=await read('public/simulari/calcul-vectorial/index.html'),code=html.match(/function runner\(\)\{[^\n]+/)[0],section={hidden:false},window={},document={hidden:false,querySelector:()=>section};
 const run=vm.runInNewContext(code+'\nrunner()',{window,document});let first,second;
 run(alive=>first=alive);assert.equal(first(),true);section.hidden=true;assert.equal(first(),false);section.hidden=false;
 run(alive=>second=alive);assert.equal(first(),false);assert.equal(second(),true);document.hidden=true;assert.equal(second(),false);document.hidden=false;run.cancel();assert.equal(second(),false);
 assert.equal(window.PraxisVectorRunners.length,1);
});
