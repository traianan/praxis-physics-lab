import test from 'node:test';import assert from 'node:assert/strict';
import {CONTACTS,circuitRoutes,loadWindingPoints} from '../public/simulari/generator-electric/assembly-geometry.js';
test('load winding reaches both wired terminals as one continuous resistive path',()=>{
 const p=loadWindingPoints();assert.deepEqual(p[0],CONTACTS.loadLeft);assert.deepEqual(p.at(-1),CONTACTS.loadRight);
 let turns=0;for(let j=4;j<p.length-4;j++){const a=p[j-1],b=p[j];assert.ok(Math.hypot(...a.map((v,i)=>v-b[i]))<.05,'gap between successive winding samples');turns+=Math.atan2(Math.sin(Math.atan2(b[2]-2.55,b[1]+1.25)-Math.atan2(a[2]-2.55,a[1]+1.25)),Math.cos(Math.atan2(b[2]-2.55,b[1]+1.25)-Math.atan2(a[2]-2.55,a[1]+1.25)));}assert.ok(turns>13*2*Math.PI);
});
test('wires terminate on the same explicit contacts as the series devices and measuring branch',()=>{
 const routes=circuitRoutes();for(const route of routes){assert.deepEqual(route.points[0],CONTACTS[route.from]);assert.deepEqual(route.points.at(-1),CONTACTS[route.to]);}
 const series=[...routes.filter(r=>r.color!=='meter').map(r=>[r.from,r.to]),['ammeterA','ammeterB'],['loadRight','loadLeft'],['switchA','switchB']];
 function connected(edges){const seen=new Set(['brushA']);for(let k=0;k<edges.length;k++)for(const [a,b]of edges){if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);}return seen.has('brushB');}
 assert.ok(connected(series));assert.equal(connected(series.filter(e=>e[0]!=='switchA')),false);
 assert.deepEqual(routes.filter(r=>r.color==='meter').map(r=>r.from),['brushA','brushB']);
});
