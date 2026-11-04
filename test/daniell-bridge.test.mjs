import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bridgePoint} from '../public/simulari/pila-daniell/view.js';
test('both bridge geometries carry K towards Cu and nitrate towards Zn',()=>{
 for(const compact of [false,true])for(const ion of ['K','NO3']){
  const start=bridgePoint(ion,0,compact),end=bridgePoint(ion,1,compact);
  assert.equal(start.y,end.y);assert.ok(ion==='K'?end.x>start.x:end.x<start.x);
  const a=bridgePoint(ion,.45,compact),b=bridgePoint(ion,.55,compact);
  assert.equal(a.y,b.y,'middle section is horizontal');assert.ok(ion==='K'?b.x>a.x:b.x<a.x);
  assert.ok(bridgePoint(ion,.01,compact).y<start.y,'entry leg rises');
  assert.ok(bridgePoint(ion,.99,compact).y<end.y,'exit leg descends');
  for(let i=0;i<=100;i++){const point=bridgePoint(ion,i/100,compact);assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));assert.ok(point.x>=Math.min(start.x,end.x)&&point.x<=Math.max(start.x,end.x));}
 }
});
test('ion lanes remain distinct and rendering positions are deterministic',()=>{
 for(const compact of [false,true]){assert.notEqual(bridgePoint('K',.5,compact).y,bridgePoint('NO3',.5,compact).y);assert.deepEqual(bridgePoint('K',.3,compact),bridgePoint('K',.3,compact));}
});
