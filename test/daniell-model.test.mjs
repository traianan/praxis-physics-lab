import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS as D,F,MCU,MZN,initial,emf,observe,advance,limit,chemicalEnergy,validate} from '../public/shared/daniell-model.js';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
test('standard and nonstandard reference values',()=>{
 const s=observe(D,initial());near(s.E,1.1);near(s.deltaG,-212267.730664,1e-6);near(s.current,11/120);near(s.voltage,11/12);near(s.pExternal,.0840277777778);near(s.pInternal,.0168055555556);
 near(emf({...D,cZn:1000,cCu:100}),1.070420325,1e-9);near(emf({...D,cZn:100,cCu:1000}),1.129579675,1e-9);
 const q=193,xi=q/(2*F),x=observe(D,{...initial(),xi});near(x.copperGain,MCU*xi);near(D.mZn-x.mZn,MZN*xi);near(x.charge,q);
});
test('open circuit, removed bridge, short circuit',()=>{
 for(const p of [{...D,open:true},{...D,bridge:false}]){const s=advance(p,initial(),600);near(s.xi,0);near(observe(p,s).current,0);near(s.external+s.internal,0);}
 near(observe({...D,open:true},initial()).voltage,1.1);assert.equal(observe({...D,bridge:false},initial()).voltage,null);
 const s=observe({...D,R:0},initial());near(s.current,.55);near(s.voltage,0);near(s.pExternal,0);near(s.pChemical,s.pInternal);
});
test('atom, charge and energy balances over discharge',()=>{
 const raw=advance(D,initial(),3600),s=observe(D,raw);
 near((s.cZn-D.cZn)*D.vZn,s.xi);near((D.cCu-s.cCu)*D.vCu,s.xi);
 near(s.mZn/MZN+s.cZn*D.vZn,D.mZn/MZN+D.cZn*D.vZn);
 near(s.copperGain/MCU+s.cCu*D.vCu,D.cCu*D.vCu);
 near(s.charge,2*F*s.xi);near(s.pChemical,s.pExternal+s.pInternal);
 near(s.external+s.internal,chemicalEnergy(D,0,s.xi),1e-7);
 // Independent composite trapezoid integration of E dq.
 let integral=0;const n=10000,h=s.xi/n;for(let i=0;i<n;i++)integral+=F*h*(emf(D,i*h)+emf(D,(i+1)*h));near(integral,s.external+s.internal,1e-7);
 // Counterions cancel the charge changes of both ideal reservoirs.
 near(2*(s.cZn-D.cZn)*D.vZn-2*s.xi,0);near(2*(s.cCu-D.cCu)*D.vCu+2*s.xi,0);
});
test('time partition invariance and second-order convergence',()=>{
 const a=advance(D,initial(),600);let b=initial();for(let i=0;i<60;i++)b=advance(D,b,10);near(a.xi,b.xi,1e-13);
 const p={...D,cCu:10,R:0},ref=advance(p,initial(),100,.025),coarse=advance(p,initial(),100,4),fine=advance(p,initial(),100,2);
 assert.ok(Math.abs(fine.xi-ref.xi)<Math.abs(coarse.xi-ref.xi)/3);
});
test('reactant boundaries are finite and absorbing, including zero zinc',()=>{
 for(const p of [{...D,cCu:1.01,R:0},{...D,mZn:1e-7,R:0},{...D,mZn:0}]){
  const s=advance(p,initial(),1000),o=observe(p,s);near(s.xi,limit(p),1e-13);assert.ok(o.cCu>=1-1e-10);assert.ok(o.mZn>=0);assert.ok(o.ended);near(o.current,0);assert.equal(o.voltage,null);assert.deepEqual(advance(p,s,10),s);
 }
});
test('reject nonphysical data and invalid time',()=>{
 for(const change of [{r:0},{R:-1},{cZn:0},{cCu:0},{vCu:0},{mZn:-1},{cCu:NaN}])assert.throws(()=>validate({...D,...change}));
 assert.throws(()=>advance(D,initial(),-1));assert.throws(()=>advance(D,initial(),1,0));assert.throws(()=>emf(D,.1));
});
