import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceMotion,frameDelta,circularState,oscillatorState,lightState,radiationState} from '../public/simulari/masurarea-unghiurilor/physics-model.js';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('MCU integrates angular speed continuously across frequency changes and preserves radius-independent angle',()=>{
 let state={time:0,phase:0};state=advanceMotion(state,2,.5);
 near(state.phase,2*Math.PI);near(state.time,.5);
 const a=circularState(state,2,.25),b=circularState(state,2,.5);
 near(a.omega,4*Math.PI);near(a.speed,Math.PI);near(b.speed,2*a.speed);near(a.turns,1);
 state=advanceMotion(state,1,.25);near(state.phase,2.5*Math.PI);
 near(circularState(state,0,.25).omega,0);assert.equal(circularState(state,0,.25).period,null);
});
test('physical time and phase are frame-rate independent and hidden/resumed frames cannot introduce a jump',()=>{
 for(const fps of [30,60,120]){
  let state={time:0,phase:0};for(let i=1;i<=fps*4;i++)state=advanceMotion(state,.5,frameDelta((i-1)*1000/fps,i*1000/fps,.5,true));
  near(state.time,2);near(state.phase,2*Math.PI);
 }
 assert.equal(frameDelta(null,100000,1,true),0);assert.equal(frameDelta(0,100000,1,false),0);
 assert.equal(frameDelta(100,50,1,true),0);near(frameDelta(0,100000,1,true),.1);
});
test('oscillator and phasor have a common phase, with correct velocity and limiting frequency',()=>{
 const state=advanceMotion({time:0,phase:0},.5,.25),s=oscillatorState(state,.5,.1,0);
 near(s.phase,Math.PI/4);near(s.position,.1/Math.sqrt(2));near(s.velocity,.1*Math.PI/Math.sqrt(2));
 near(oscillatorState(state,0,.1,0).velocity,0);
 near(oscillatorState({phase:0,time:0},1,.2,Math.PI/2).position,.2);
});
test('photometry preserves flux under radius changes and distinguishes fixed intensity from fixed flux',()=>{
 const a=lightState(30,2,10,'intensity'),b=lightState(30,4,10,'intensity');
 near(a.omega,Math.PI*(2-Math.sqrt(3)));near(a.flux,10*a.omega);
 near(b.flux,a.flux);near(b.area,4*a.area);near(b.illuminance,a.illuminance/4);
 near(a.illuminance*a.area,a.flux);
 const c=lightState(15,2,20,'flux'),d=lightState(60,2,20,'flux');
 near(c.flux,20);near(d.flux,20);assert.ok(c.intensity>d.intensity);
 near(lightState(30,2,0,'intensity').flux,0);
});
test('isotropic radiation conserves power for the full angular and radius ranges',()=>{
 for(const alpha of [0,1,30,60,90,120,180])for(const radius of [.5,2,5]){
  const s=radiationState(alpha,radius,12);near(s.selected+s.remaining,12);
  near(s.irradiance*s.area,s.selected);assert.ok(s.fraction>=0&&s.fraction<=1);
 }
 near(radiationState(60,2,12).selected,3);near(radiationState(180,2,12).selected,12);
 near(radiationState(0,2,12).selected,0);
});
