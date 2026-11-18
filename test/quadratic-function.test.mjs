import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const html=await readFile(new URL('../public/simulari/functia-gradul-al-doilea/index.html',import.meta.url),'utf8');
const script=html.match(/<script id="quadratic-model">([\s\S]*?)<\/script>/)?.[1];
function model(){const context={window:{},document:{hidden:false},Math};vm.runInNewContext(script,context);return context.window.QuadraticModel;}
test('discriminant distinguishes absent, double and distinct real roots',()=>{
 const m=model();assert.deepEqual(Array.from(m.roots(1,0,1)),[]);assert.deepEqual(Array.from(m.roots(1,-2,1)),[1]);assert.deepEqual(Array.from(m.roots(1,-2,-3)),[-1,3]);assert.deepEqual(Array.from(m.roots(-1,0,4)),[-2,2]);
});
test('root solver avoids cancellation for very different root magnitudes',()=>{const [small,large]=Array.from(model().roots(1,-1e8,1));assert.ok(Math.abs(small-1e-8)<1e-20);assert.ok(Math.abs(large-1e8)<1e-7);assert.ok(Math.abs(small*large-1)<1e-12);});
test('coefficient zero has explicit linear and constant cases',()=>{
 const m=model();assert.deepEqual(Array.from(m.roots(0,2,-4)),[2]);assert.deepEqual(Array.from(m.roots(0,0,1)),[]);assert.equal(m.roots(0,0,0),null);
});
test('physics buttons apply the requested increment exactly once',()=>{const m=model();assert.equal(m.step(45,5,5,85),50);assert.equal(m.step(45,-5,5,150),40);assert.equal(m.step(9.81,.5,1.5,25),10.31);assert.equal(m.step(84,5,5,85),85);});
test('projectile returns to ground and reaches its analytical maximum',()=>{
 const m=model(),p=m.physics({ex:'proj',v0:20,th:45,g:9.81});assert.ok(Math.abs(p.pos(p.tEnd).y)<1e-10);assert.ok(Math.abs(p.pos(p.tEnd/2).y-400/39.24)<1e-10);assert.ok(Math.abs(p.pos(p.tEnd).x-400/9.81)<1e-10);
});
test('vertical launch and fall match ground time including the zero-duration case',()=>{
 const m=model();for(const p of [{ex:'up',h0:2,vu:12,g:9.81},{ex:'fall',H:45,g:9.81},{ex:'up',h0:0,vu:0,g:9.81}]){const d=m.physics(p);assert.ok(Number.isFinite(d.tEnd));assert.ok(Math.abs(d.pos(d.tEnd).y)<1e-10);}
});
test('physics remains finite at supported parameter limits',()=>{const m=model();for(const g of [1.5,25])for(const v0 of [5,60])for(const th of [5,85]){const d=m.physics({ex:'proj',v0,th,g});assert.ok(d.height>0&&d.range>0&&d.tEnd>0);assert.ok(Math.abs(d.pos(d.tEnd).y)<1e-8);}for(const g of [1.5,25])for(const h0 of [0,40])for(const vu of [0,30]){const d=m.physics({ex:'up',h0,vu,g});assert.ok(Number.isFinite(d.height));assert.ok(Math.abs(d.pos(d.tEnd).y)<1e-8);}});
