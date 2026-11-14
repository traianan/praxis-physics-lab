import test from 'node:test';
import assert from 'node:assert/strict';
import {flight,sample,trajectory,optimalAngle,safetyHeight,safetyRange} from '../public/simulari/miscarea-in-camp-gravitational/model.js';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('free fall and downward throw use correct ground event',()=>{
 const f=flight({height:20,speed:0,g:10});near(f.duration,2);near(f.impactSpeed,20);near(sample(f,1).y,15);
 const d=flight({height:15,speed:10,angle:-90,g:10});near(d.duration,1);near(d.impactSpeed,20);
 near(sample(d,99).y,0);near(sample(d,99).t,1);
});
test('vertical launch apex and return, including ground degeneracy',()=>{
 const f=flight({speed:20,angle:90,g:10});near(f.apexTime,2);near(f.maxHeight,20);near(f.duration,4);near(f.range,0);near(sample(f,2).speed,0);
 for(const angle of [-90,0])near(flight({height:0,speed:20,angle}).duration,0);
 near(flight({speed:0,height:0}).duration,0);
});
test('horizontal independence and nonzero oblique apex speed',()=>{
 const a=flight({height:20,speed:15,angle:0,g:10}),b=flight({height:20,speed:0,g:10});near(a.duration,b.duration);near(a.range,30);
 for(const t of [0,.2,1,2])near(sample(a,t).y,sample(b,t).y);
 const o=flight({speed:20,angle:30,g:10});near(sample(o,o.apexTime).vy,0);near(sample(o,o.apexTime).speed,10*Math.sqrt(3));
});
test('complementary range only at equal height and optimal angle for elevated launch',()=>{
 near(flight({angle:30}).range,flight({angle:60}).range);
 assert.ok(Math.abs(flight({height:20,angle:30}).range-flight({height:20,angle:60}).range)>1);
 for(const h of [0,10,80]){const angle=optimalAngle(h,20,9.81),best=flight({height:h,speed:20,angle});for(let a=0;a<=90;a++)assert.ok(best.range+1e-9>=flight({height:h,speed:20,angle:a}).range);}
});
test('mechanical energy and mass independence across the parameter domain',()=>{
 for(const height of [0,20,80])for(const angle of [-90,-30,0,30,90])for(const g of [1.62,9.81,10,24.79]){
  const f=flight({height,angle,g,speed:40,mass:3});const initial=.5*3*1600+3*g*height;
  for(const s of trajectory(f)){near(s.energy,initial,1e-7);assert.ok(s.y>=0);}
  near(f.duration,flight({height,angle,g,speed:40,mass:10}).duration);
 }
});
test('invalid parameters rejected and downward root remains stable',()=>{
 for(const params of [{g:0},{height:-1},{mass:0},{speed:NaN},{angle:91}])assert.throws(()=>flight(params),RangeError);
 assert.ok(flight({height:1e-12,speed:40,angle:-90}).duration>0);
});
test('safety parabola bounds all trajectories and is tangent at the envelope angle',()=>{
 for(const height of [0,20])for(const speed of [5,20,40]){
  const p={height,speed,g:9.81};near(safetyHeight(p,safetyRange(p)),0);
  for(let angle=-85;angle<=90;angle+=5)for(const s of trajectory(flight({...p,angle})))assert.ok(s.y<=safetyHeight(p,s.x)+1e-8);
  for(const x of [safetyRange(p)*.2,safetyRange(p)*.8]){
   const angle=Math.atan(speed*speed/(p.g*x))*180/Math.PI,f=flight({...p,angle});
   const s=sample(f,x/f.vx);near(s.y,safetyHeight(p,x));near(s.vy/s.vx,-p.g*x/(speed*speed));
  }
 }
});
