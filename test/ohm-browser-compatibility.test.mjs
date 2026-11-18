import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';

test('Ohm concept map has usable styles on Chrome without CSS scope support',async()=>{
 const css=await readFile(new URL('../public/simulari/legea-lui-ohm/app.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/@scope\b/,'unsupported scope rules must not hide the map height and layout');
 assert.match(css,/#ohm-root[^{}]*\.concept-map-surface\s*\{/);
});

test('Ohm canvases skip stale resize callbacks after their activity is removed',async()=>{
 const source=await readFile(new URL('../sources/legea-lui-ohm/lib/canvas.ts',import.meta.url),'utf8');
 const {code}=await transform(source,{loader:'ts',format:'esm'});
 const {prepareCanvas}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const getContext=()=>assert.fail('a hidden or detached canvas must not draw');
 assert.equal(prepareCanvas({isConnected:false,getBoundingClientRect:()=>({width:500,height:300}),getContext}),null);
 assert.equal(prepareCanvas({isConnected:true,getBoundingClientRect:()=>({width:0,height:0}),getContext}),null);
});

test('circuit balance and both measurement corrections stay valid at the classroom examples and limits',async()=>{
 const source=await readFile(new URL('../sources/legea-lui-ohm/lib/physics.ts',import.meta.url),'utf8');
 const {code}=await transform(source,{loader:'ts',format:'esm'});
 const {computeCircuit,computeMeasurement}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} versus ${b}`);
 for(const external of [0,.5,5,4700,1e6]){
  const c=computeCircuit({emf:12,internal:.5,external});
  near(c.current,12/(external+.5));near(c.terminal+c.internalDrop,12);
  near(c.usefulPower+c.internalPower,c.totalPower);
 }
 for(const amonte of [true,false])for(const target of [12,267.5,4700,1e6]){
  const m=computeMeasurement({emf:12,internal:.5,target,ammeter:.5,voltmeter:1e6,amonte});
  near(m.measured,amonte?target+.5:target*1e6/(target+1e6));
  near(amonte?m.measured-.5:m.voltmeterReading/(m.ammeterReading-m.voltmeterReading/1e6),target);
 }
});
