import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={window:{}};vm.runInNewContext(fs.readFileSync('public/shared/waves-diffraction-model.js','utf8'),scope);const api=scope.window.PraxisDiffraction;
test('aperture quadrature is symmetric, in phase and spans only the opening',()=>{
 for(const a of [.3,1,2,6]){const s=api.aperture(a);assert.ok(s.every(p=>Math.abs(p.y)<a/2));assert.ok(Math.abs(s.reduce((n,p)=>n+p.weight,0)-a)<1e-12);const f=api.field(s,3,.7,8),g=api.field(s,3,-.7,8);assert.ok(Math.hypot(f.re-g.re,f.im-g.im)<1e-12);assert.deepEqual({...api.field(s,3,0,2)},{re:0,im:0});}
});
test('coherent quadrature independently approaches the single-slit far-field law',()=>{
 for(const a of [.3,1,3,6])for(const angle of [0,.15,.4,.8]){
  const R=1e5,s=api.aperture(a),f=api.field(s,R*Math.cos(angle),R*Math.sin(angle)),axis=api.field(s,R,0),measured=(f.re*f.re+f.im*f.im)/(axis.re*axis.re+axis.im*axis.im);
  assert.ok(Math.abs(measured-api.intensity(a,angle))<.001,`${a},${angle}: ${measured}`);
 }
 assert.equal(api.firstMinimum(.3),null);assert.equal(api.firstMinimum(1),Math.PI/2);assert.ok(api.firstMinimum(6)<api.firstMinimum(2));
});
test('fronts have causal onset, evolve with time and remain finite for every supported slit',()=>{
 for(const a of [.3,1,6]){const g=api.prepare(a);assert.equal(api.fronts(g,-1),'');assert.equal(api.fronts(g,0),'');const p=api.fronts(g,3);assert.ok(p.length>300);assert.notEqual(api.fronts(g,3.25),p);assert.doesNotMatch(p,/NaN|Infinity/);}
});
test('two outgoing ray samples follow the local phase normal of the resultant wave',()=>{
 for(const a of [.3,1,6]){const sources=api.aperture(a),time=7,rays=api.rays(sources,time);assert.equal(rays.length,2);for(const r of rays){const f=api.field(sources,r.x,r.y,time),q=api.field(sources,r.x-.001*r.ny,r.y+.001*r.nx,time);assert.ok(Math.abs(Math.atan2(q.im,q.re)-Math.atan2(f.im,f.re))<.002);assert.ok(r.nx>0);}}
});
