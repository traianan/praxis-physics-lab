import test from 'node:test';
import assert from 'node:assert/strict';
import {computeWire,areaFromDiameter,diameterFromArea,compareMaterials,MATERIALS} from '../public/simulari/rezistenta-unui-fir/physics.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const input={materialId:'cupru',length:1,area:1,temperature:20,current:2};
test('wire SI conversions, Ohm and Joule laws agree with independent values',()=>{
 const w=computeWire(input);close(w.resistance,.0168);close(w.voltage,.0336);close(w.power,.0672);close(w.mass,.00896);
 for(const material of MATERIALS)for(const length of [.02,1,120,500])for(const area of [.01,1,16]){
  const result=computeWire({...input,materialId:material.id,length,area});
  close(result.resistance,material.rho20*length/(area*1e-6));close(result.power,result.current*result.voltage);close(result.ohmPerKm,material.rho20*1000/(area*1e-6));
 }
});
test('wire geometry and temperature relationships',()=>{
 const r=computeWire(input).resistance;close(computeWire({...input,length:2}).resistance,2*r);close(computeWire({...input,area:2}).resistance,r/2);
 for(const d of [.01,.5,1,12])close(diameterFromArea(areaFromDiameter(d)),d);
 close(computeWire({...input,temperature:120}).resistance/r,1+.00393*100);
 assert.ok(computeWire({...input,materialId:'grafit',temperature:120}).resistance<computeWire({...input,materialId:'grafit'}).resistance);
});
test('material comparison preserves equal-resistance mass relation',()=>{
 const rows=compareMaterials(1,1);for(const row of rows)close(row.massRatio,row.material.density*row.areaRatio/8960);
 assert.equal(rows[0].material.id,'argint');assert.equal(rows.at(-1).material.id,'grafit');
});
