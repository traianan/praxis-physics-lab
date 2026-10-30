import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const window={};vm.runInNewContext(await readFile(new URL('../public/shared/ideal-engine-cycles.js',import.meta.url),'utf8'),{window});
const create=window.PraxisIdealEngineCycles.create;
const close=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<tolerance*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('ideal engine paths meet exactly, with intake and exhaust on the same pressure line',()=>{
 for(const kind of ['otto','diesel'])for(const compression of [3,4,6,8,18]){
  const model=create(kind,{compression});
  model.branches.forEach((branch,i)=>{for(const u of [0,1]){const p=model.point(i,u),state=model.states[u?branch.to:branch.from];close(p.V,state.V);close(p.p,state.p);}});
  for(let i=0;i<=100;i++){close(model.point(0,i/100).p,1);close(model.point(5,i/100).p,1);}
 }
});
test('Otto has two isochores; Diesel heat input is an isobar; both compression and expansion conserve pV^gamma',()=>{
 for(const kind of ['otto','diesel']){
  const model=create(kind),states=model.states;
  for(let i=0;i<=100;i++){
   const u=i/100,heating=model.point(2,u),cooling=model.point(4,u);close(cooling.V,states[4].V);
   if(kind==='otto')close(heating.V,states[2].V);else close(heating.p,states[2].p);
   for(const phase of [1,3]){const p=model.point(phase,u),start=states[model.branches[phase].from];close(p.p*p.V**model.gamma,start.p*start.V**model.gamma);}
  }
 }
});
test('cycle area equals net heat and the ideal Otto/Diesel efficiencies agree with independent expressions',()=>{
 for(const kind of ['otto','diesel'])for(const compression of [3,4,6,8,18]){
  const gamma=1.4,cutoff=2.2,model=create(kind,{compression,gamma,cutoff,heatRatio:3});let area=0;
  for(let phase=1;phase<=4;phase++){let a=model.point(phase,0);for(let i=1;i<=10000;i++){const b=model.point(phase,i/10000);area+=(a.p+b.p)/2*(b.V-a.V);a=b;}}
  close(area,model.work,1e-6);assert.ok(area>0);close(model.work,model.heatIn-model.heatOut);
  const eta=kind==='otto'?1-compression**(1-gamma):1-(cutoff**gamma-1)/(gamma*(cutoff-1)*compression**(gamma-1));close(model.efficiency,eta);
 }
});
