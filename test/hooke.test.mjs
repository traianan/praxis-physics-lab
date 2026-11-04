import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,LIMITS,validate,elastic,work,observe} from '../public/shared/hooke-model.js';
import {advanceTime} from '../public/shared/hooke-clock.js';
const near=(a,b,e=1e-10)=>assert.ok(Math.abs(a-b)<=e,`${a} ≠ ${b}`);
test('Hooke: playback scales elapsed time, not physical energy, and caps stalls',()=>{
  near(advanceTime(3,.05,.1),3.005);near(advanceTime(3,.05,2),3.1);
  near(advanceTime(3,4,2),3.2);
  for(const speed of [.1,.5,1,2]){let time=0;for(let i=0;i<100;i++)time=advanceTime(time,.01,speed);near(time,speed);near(observe(DEFAULTS,time,true).energy,.5);}
  for(const speed of [0,2.1,NaN,Infinity])assert.throws(()=>advanceTime(0,.01,speed),RangeError);
});
test('Hooke: signed deformation, energy and work references',()=>{
  assert.deepEqual(elastic(100,.1),{force:-10,potential:.5});
  assert.deepEqual(elastic(100,-.1),{force:10,potential:.5});
  near(elastic(100,.2).potential,2);near(work(100,.1,.2),-1.5);
  near(work(100,-.1,.1),0);near(work(100,.2,.1),1.5);
});
test('Hooke: initial conditions, quarter period, power and periodicity',()=>{
  const s=observe(DEFAULTS),T=s.period;near(T,.6283185307179586);near(s.applied,10);near(s.acceleration,0);
  const q=observe(DEFAULTS,T/4,true);near(q.x,0);near(q.v,-1);near(q.kinetic,.5);near(q.applied,0);
  near(observe(DEFAULTS,T/8,true).power,5);
  const end=observe(DEFAULTS,T,true);near(end.x,.1);near(end.v,0);
});
test('Hooke: all parameter corners conserve energy and satisfy work-energy theorem',()=>{
  for(const k of LIMITS.k)for(const m of LIMITS.m)for(const x0 of [-.2,0,.2]){
    const p={k,m,x0},E=.5*k*x0*x0;
    for(let i=0;i<1000;i++){
      const s=observe(p,i*.137,true);near(s.energy,E,1e-12);
      near(s.kinetic,work(k,x0,s.x),1e-12);near(s.force,m*s.acceleration);
      assert.ok(Math.abs(s.x)<=Math.abs(x0)+1e-12);
    }
  }
});
test('Hooke: power is dK/dt and restoring force is -dU/dx',()=>{
  const h=1e-6,t=.031,s=observe(DEFAULTS,t,true);
  near((observe(DEFAULTS,t+h,true).kinetic-observe(DEFAULTS,t-h,true).kinetic)/(2*h),s.power,1e-8);
  near(-(elastic(100,s.x+h).potential-elastic(100,s.x-h).potential)/(2*h),s.force,1e-8);
});
test('Hooke: rejects nonphysical/nonfinite inputs and leaves input unchanged',()=>{
  for(const [key,values] of Object.entries({k:[0,-1,201,NaN,Infinity],m:[0,-1,6,NaN],x0:[-.21,.21,Infinity]}))
    for(const value of values)assert.throws(()=>validate({...DEFAULTS,[key]:value}),RangeError);
  assert.throws(()=>observe(DEFAULTS,-1),RangeError);assert.throws(()=>observe(DEFAULTS,NaN),RangeError);
  const p=Object.freeze({...DEFAULTS,x0:0});const s=observe(p,100,true);
  for(const key of ['x','v','force','potential','kinetic','energy','power'])near(s[key],0);
});
