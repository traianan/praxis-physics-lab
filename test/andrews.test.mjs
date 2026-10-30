import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
async function model(){const window={};vm.runInNewContext(await readFile(new URL('../public/shared/andrews.js',import.meta.url),'utf8'),{window});return window.PraxisAndrews;}
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(b)),`${a} ≠ ${b}`);
test('Andrews subcritical plateaus obey equal pressure and Maxwell equal areas',async()=>{
 const m=await model();for(const T of [.86,.9,.94,.98,.999]){const c=m.coexistence(T);assert.ok(c.vl<1&&c.vg>1);close(m.pressure(T,c.vl),c.p);close(m.pressure(T,c.vg),c.p);const F=v=>8*T/3*Math.log(3*v-1)+3/v;close(F(c.vg)-F(c.vl),c.p*(c.vg-c.vl));for(const f of [.1,.5,.9])close(m.state(T,c.vl+(c.vg-c.vl)*f).p,c.p);}
});
test('critical point is a horizontal inflection; supercritical compression stays single phase',async()=>{
 const m=await model();close(m.pressure(1,1),1);const h=1e-4;close((m.pressure(1,1+h)-m.pressure(1,1-h))/(2*h),0,1e-6);close((m.pressure(1,1+h)-2*m.pressure(1,1)+m.pressure(1,1-h))/h**2,0,1e-6);assert.equal(m.state(1,1).kind,'liq.state.critical');assert.equal(m.coexistence(1),null);
 for(const T of [1.001,1.06,1.1]){let last=Infinity;for(let v=.55;v<=6;v+=.05){const s=m.state(T,v);assert.ok(s.p<last);last=s.p;assert.equal(s.liquid,null);assert.notEqual(s.kind,'liq.state.mixture');}}
});
test('the lever rule conserves total volume and predicts growing liquid fraction under compression',async()=>{
 const m=await model(),T=.9,c=m.coexistence(T);let last=-1;for(let i=0;i<=20;i++){const v=c.vg-(c.vg-c.vl)*i/20,s=m.state(T,v);close(s.liquid*c.vl+(1-s.liquid)*c.vg,v);assert.ok(s.liquid>=last-1e-9);last=s.liquid;close(s.volumeLiquid,s.liquid*c.vl/v);}close(m.state(T,c.vl).liquid,1);close(m.state(T,c.vg).liquid,0);
 assert.ok(m.state(T,.55).p>c.p);assert.equal(m.state(T,6).kind,'liq.state.vapour');
});

test('physical axes convert model pressure to MPa and volume to litres for one mole',async()=>{
 const m=await model(),{TC,PC,VC}=m.constants;
 close(VC,3*8.314462618*TC/(8*PC*1e6)*1000);
 const critical=m.physical(1,1);close(critical.MPa,PC);close(critical.litres,VC);close(critical.celsius,TC-273.15);
 for(const T of [.86,.94,1,1.1])for(const v of [.55,1,3,6,20]){const s=m.physical(T,v);close(s.MPa,m.state(T,v).p*PC);close(s.litres,v*VC);assert.ok(s.MPa>0&&s.litres>0);}
});
test('saturation envelope joins both plateau endpoints continuously at its critical maximum',async()=>{
 const m=await model(),points=m.binodal();assert.ok(points.length>100);let prior={p:0,vl:1/3,vg:Infinity};
 for(const c of points){assert.ok(c.p>prior.p);assert.ok(c.vl>prior.vl);assert.ok(c.vg<prior.vg);assert.ok(c.p<=1);close(m.pressure(c.T,c.vl),c.p);close(m.pressure(c.T,c.vg),c.p);if(c.T<1){const inside=m.state(c.T,(c.vl+c.vg)/2);assert.equal(inside.kind,'liq.state.mixture');close(inside.p,c.p);}prior=c;}
 const end=points.at(-1);close(end.T,1);close(end.p,1);close(end.vl,1);close(end.vg,1);
});

test('labelled isotherms shorten their plateaus toward C and critical isotherm separates vapour from gas',async()=>{
 const m=await model();let width=Infinity;for(const row of m.isotherms){close(row.T*m.constants.TC-273.15,row.celsius);assert.ok(row.T<1);const c=m.coexistence(row.T);assert.ok(c.vg-c.vl<width);width=c.vg-c.vl;assert.equal(m.state(row.T,6).kind,'liq.state.vapour');assert.ok(m.state(row.T,6).p<m.pressure(1,6));assert.ok(m.state(row.T,.55).p<m.pressure(1,.55));}
 assert.equal(m.isotherms.length,6);for(const v of [.55,1,3,6,20]){assert.ok(m.state(1.06,v).p>m.pressure(1,v));assert.equal(m.state(1.06,v).liquid,null);}
 assert.equal(m.state(1.06,6).kind,'liq.state.gas');assert.equal(m.state(1.06,.55).kind,'liq.state.supercritical');
});
