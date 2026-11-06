import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({});vm.runInContext(await read('condensatorul/js/model.js'),ctx);
const m=ctx.CapacitorModel,near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1e-25,Math.abs(b)*1e-12),`${a} != ${b}`);
test('capacitor geometry, units and dielectric scaling',()=>{
 const C=m.capacitance(.02,.005);near(C,35.4167512512e-12);
 near(m.capacitance(.04,.005),2*C);near(m.capacitance(.02,.01),C/2);near(m.capacitance(.02,.005,6),6*C);
});
test('exact RC solution at one and five time constants, semigroup and no overshoot',()=>{
 const C=100e-6,R=1e4,E=12,tau=R*C;
 near(m.advance(0,C,E,R,tau,'charge'),C*E*(1-Math.exp(-1)));
 near(m.advance(C*E,C,E,R,5*tau,'discharge'),C*E*Math.exp(-5));
 near(m.advance(m.advance(0,C,E,R,.3,'charge'),C,E,R,.7,'charge'),m.advance(0,C,E,R,1,'charge'));
 for(const er of [1,3.1,80,1200])for(const area of [.002,.06])for(const d of [.0005,.02]){
  const c=m.capacitance(area,d,er),q=m.advance(0,c,24,1e6,.2/10000,'charge');assert.ok(q>=0&&q<=c*24);
 }
});
test('isolated charge, voltage and energy respond correctly to geometry and dielectric',()=>{
 const C=m.capacitance(.02,.005),q=C*9;
 assert.equal(m.advance(q,C/2,24,1e6,100,'off'),q);
 near(q/(C/2),18);near(q/(C*6),1.5);
 near(q*q/(2*(C/2)),2*q*q/(2*C));
 assert.equal(m.current(q,C,9,1e6,'off'),0);
 near(m.current(q,C,0,1e6,'charge'),-9e-6);
 near(m.current(q,C,9,1e6,'discharge'),-9e-6);
 assert.equal(m.current(q,C,9,1e6,'charge'),0);
});
test('RC energy supplied splits equally between stored energy and resistor loss',()=>{
 const C=100e-6,E=12,R=1e4,tau=R*C,steps=100000,dt=20*tau/steps;let heat=0;
 for(let n=0;n<steps;n++){const q=m.advance(0,C,E,R,(n+.5)*dt,'charge'),i=m.current(q,C,E,R,'charge');heat+=i*i*R*dt;}
 assert.ok(Math.abs(heat-.5*C*E*E)/heat<1e-7);
});
test('integrated source has unique anchors, shared UI, no grade or remote runtime dependencies',async()=>{
 const html=await read('public/simulari/condensatorul/index.html');
 assert.doesNotMatch(html,/clasa a XI|fonts.googleapis|js\/sound.js/);
 for(const file of ['course.js','lab-header.js','sound.js','canvas-resolution.js'])assert.ok(html.includes(file));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const f of ['lab','teorie','main','integration','model'])assert.equal(await read('condensatorul/js/'+f+'.js'),await read('public/simulari/condensatorul/js/'+f+'.js'));
 const ro=JSON.parse(await read('public/locales/capacitor/ro.json')),en=JSON.parse(await read('public/locales/capacitor/en.json'));
 assert.deepEqual(Object.keys(ro.messages),Object.keys(en.messages));assert.ok(Object.values(en.messages).every(v=>typeof v==='string'));
});
test('energy-density equation explicitly groups W over volume and the dielectric field energy',async()=>{
 const html=await read('public/simulari/condensatorul/index.html');
 const energy=html.match(/<section id="energie"[\s\S]*?<\/section>/)[0];
 assert.ok(energy.includes('data-science-source="\\displaystyle w=\\frac{W}{V}=\\frac{\\varepsilon_0\\varepsilon_r E^2}{2}"'));
 assert.equal([...energy.matchAll(/data-science-math="tex"/g)].length,2);
});
