import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/shared/waves-tsunami-model.js',import.meta.url),'utf8'),context);
const api=context.window.PraxisTsunamiModel;
const uniform=(h,extra={})=>api.create({nx:300,ny:5,dx:1000,depth:new Float64Array(1500).fill(h),sponge:false,...extra});
test('tsunami: an undisturbed ocean remains exactly at rest',()=>{
 const m=uniform(4000);m.initialise(()=>0);m.advance(1000);
 assert.equal(m.diagnostics().maxAbs,0);assert.equal(m.diagnostics().finite,true);
});
test('tsunami: measured propagation speed follows sqrt(g h), including the depth ratio',()=>{
 const speeds=[];
 for(const h of [1000,4000]){
  const m=uniform(h);m.initialise((x)=>Math.exp(-(((x-80000)/12000)**2)));m.advance(300);
  let peak=0,pos=0;for(let x=95;x<190;x++){const value=m.eta[2*m.nx+x];if(value>peak){peak=value;pos=(x+.5)*m.dx;}}
  const measured=(pos-80000)/m.time,expected=Math.sqrt(9.81*h);
  assert.ok(Math.abs(measured/expected-1)<.04,`h=${h}: ${measured} vs ${expected}`);speeds.push(measured);
 }
 assert.ok(Math.abs(speeds[1]/speeds[0]-2)<.08);
});
test('tsunami: closed coasts conserve displaced volume and keep dry cells impermeable',()=>{
 const depth=new Float64Array(1500).fill(4000);for(let y=0;y<5;y++)depth[y*300+155]=0;
 const m=uniform(4000,{depth});m.initialise(x=>x<130000?Math.exp(-(((x-80000)/12000)**2)):0);
 const initial=m.diagnostics().volume;m.advance(2200);
 assert.ok(Math.abs(m.diagnostics().volume/initial-1)<1e-10);
 for(let y=0;y<5;y++)for(let x=155;x<300;x++)assert.equal(m.eta[y*300+x],0);
 assert.equal(m.diagnostics().finite,true);assert.ok(m.diagnostics().maxAbs<2);
});
test('tsunami: numerical time is independent of animation frame partition and amplitude scales linearly',()=>{
 const a=uniform(4000),b=uniform(4000),c=uniform(4000);
 for(const [m,amp]of [[a,1],[b,1],[c,2]])m.initialise(x=>amp*Math.exp(-(((x-80000)/12000)**2)));
 a.advance(400);for(let i=0;i<40;i++)b.advance(10);c.advance(400);
 assert.equal(a.time,b.time);for(let i=0;i<a.eta.length;i++){assert.equal(a.eta[i],b.eta[i]);assert.ok(Math.abs(c.eta[i]-2*a.eta[i])<1e-12);}
});
test('tsunami: every schematic source and station is in water; invalid source selection leaves state untouched',()=>{
 const m=api.create();for(const source of api.sources){assert.ok(m.depthAt(source.x,source.y)>=500);m.reset({source,amplitude:.5});assert.ok(m.diagnostics().maxAbs>0);}
 for(const station of m.stations)assert.ok(m.depthAt(station.x,station.y)>0);
 m.advance(100);const time=m.time,eta=Array.from(m.eta);assert.throws(()=>m.reset({source:{x:0,y:0},amplitude:1}));
 assert.equal(m.time,time);assert.deepEqual(Array.from(m.eta),eta);
});
test('tsunami: a long run stays finite and bounded; reset clears station measurements',()=>{
 const m=api.create();m.reset({source:api.sources[0],amplitude:2});m.advance(10800);
 assert.equal(m.diagnostics().finite,true);assert.ok(m.diagnostics().maxAbs<15);assert.ok(m.stations.some(s=>s.arrival!==null));
 m.reset({source:api.sources[1],amplitude:.5});assert.equal(m.time,0);assert.ok(m.stations.every(s=>s.arrival===null&&s.maximum===0));
});
test('tsunami: stations within the initial uplift measure it at time zero',()=>{
 const m=api.create();m.reset({source:{x:.38,y:.3},amplitude:1});
 assert.equal(m.stations[0].arrival,0);assert.equal(m.stations[0].value,1);assert.equal(m.stations[0].maximum,1);
});
test('tsunami: a depth interface reflects and transmits the analytical long-wave amplitudes',()=>{
 const nx=600,ny=3,depth=new Float64Array(nx*ny);
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)depth[y*nx+x]=x<250?4000:1000;
 const m=api.create({nx,ny,dx:1000,depth,sponge:false});
 m.initialise(x=>Math.exp(-(((x-120000)/15000)**2)));m.advance(1100);
 const max=(lo,hi)=>Math.max(...Array.from(m.eta.slice(nx+lo,nx+hi)));
 // An initially stationary pulse splits into two incident waves of amplitude 1/2.
 // c1/c2=2: R=(c1-c2)/(c1+c2)=1/3; T=2c1/(c1+c2)=4/3.
 assert.ok(Math.abs(max(135,190)-1/6)<.02,'reflected crest must be 1/6');
 assert.ok(Math.abs(max(265,330)-2/3)<.02,'transmitted crest must be 2/3');
});

