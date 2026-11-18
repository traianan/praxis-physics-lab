import test from'node:test';import assert from'node:assert/strict';import vm from'node:vm';import{readFile}from'node:fs/promises';
const c={};vm.runInNewContext(await readFile(new URL('../scripts/adaptations/quadratic-concepts.js',import.meta.url),'utf8'),c);const{nodes,edges}=c.QuadraticConcepts;
test('concept map has bilingual nodes, valid relationships and existing lesson destinations',()=>{
 const ids=new Set(nodes.map(n=>n.id));assert.equal(ids.size,7);assert.equal(edges.length,6);
 for(const n of nodes){assert.ok(n.title.every(Boolean)&&n.text.every(Boolean));assert.ok(['teorie','animatii','fizica','exerseaza'].includes(n.tab));for(const id of n.related)assert.ok(ids.has(id)&&id!==n.id);}
 const reached=new Set(['function']);for(let i=0;i<nodes.length;i++)for(const[a,b,label]of edges){assert.ok(ids.has(a)&&ids.has(b)&&label.every(Boolean));if(reached.has(a))reached.add(b);}assert.equal(reached.size,nodes.length);
});
