import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceMotion,frameDelta,circularState,oscillatorState,lightState,radiationState} from '../public/simulari/masurarea-unghiurilor/physics-model.js';
import {wavefrontRadii,wavefrontArc} from '../public/simulari/masurarea-unghiurilor/wavefronts.js';
import {physicsView} from '../public/simulari/masurarea-unghiurilor/physics-view.js';
import {recordAngularTrace,wrappedTrace} from '../public/simulari/masurarea-unghiurilor/angular-trace.js';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('the angular history retains t=0 and exact frequency-change corners without storing every frame',()=>{
 const points=[];
 recordAngularTrace(points,{time:0,phase:0,frequency:2});
 for(let i=1;i<=50;i++)recordAngularTrace(points,{time:i/100,phase:4*Math.PI*i/100,frequency:2});
 assert.equal(points.length,2);near(points[0].time,0);near(points.at(-1).phase,2*Math.PI);
 recordAngularTrace(points,{time:.5,phase:2*Math.PI,frequency:1});
 for(let i=51;i<=100;i++)recordAngularTrace(points,{time:i/100,phase:2*Math.PI+2*Math.PI*(i/100-.5),frequency:1});
 assert.equal(points.length,3);near(points[1].time,.5);near(points[1].phase,2*Math.PI);near(points.at(-1).phase,3*Math.PI);
});
test('a wrapped angle graph ends each revolution at 2pi and restarts at zero without a false descending line',()=>{
 const points=wrappedTrace([{time:0,phase:0},{time:1,phase:4*Math.PI}],0,1);
 const breaks=points.flatMap((p,i)=>p===null?[i]:[]);assert.equal(breaks.length,2);
 for(const i of breaks){near(points[i-1][1],2*Math.PI);near(points[i+1][1],0);near(points[i-1][0],points[i+1][0]);}
 near(points[breaks[0]-1][0],.5);
 const rounded=wrappedTrace([{time:0,phase:0},{time:.5,phase:2*Math.PI-1e-12}],0,.5);
 near(rounded.at(-1)[1],0);
 const clipped=wrappedTrace([{time:0,phase:0},{time:10000,phase:40000*Math.PI}],9996,10000);
 assert.ok(clipped.length<40);assert.ok(clipped.filter(Boolean).every(p=>p[0]>=9996&&p[0]<=10000));
});
test('each visual emission front has equal radius in every direction, without an angular time offset',()=>{
 for(const time of [0,.1,.7,6.705,10.174])for(const R of [12,48,120]){
  const fronts=wavefrontRadii(time,R);assert.equal(fronts.length,3);
  for(const r of fronts){assert.ok(r>=0&&r<R);for(let j=0;j<32;j++){
   const angle=2*Math.PI*j/32;near(Math.hypot(r*Math.cos(angle),r*Math.sin(angle)),r);
  }}
  const r=fronts[1],a=Math.PI/3,path=wavefrontArc(0,0,r,a,0);
  const coords=[...path.matchAll(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)].map(m=>Number(m[0]));
  near(Math.hypot(coords[0],coords[1]),r);near(Math.hypot(coords.at(-2),coords.at(-1)),r);
 }
});
test('isotropic and conical views render synchronized wavefronts, and a switched-off source emits none',()=>{
 const labels={axis:'axis',power:'Power',selected:'Selected',rest:'Rest'},format=n=>String(n);
 const rad={alpha:56.65,radius:4.34,power:26.2},light={alpha:48.11,radius:3.48,source:50.7,mode:'intensity'};
 const r=physicsView('radiation',{...radiationState(rad.alpha,rad.radius,rad.power),time:10.174},rad,[],false,labels,format);
 assert.equal((r.match(/data-wavefront="sphere"/g)||[]).length,3);
 const l=physicsView('light',{...lightState(light.alpha,light.radius,light.source,light.mode),time:6.705},light,[],false,labels,format);
 assert.equal((l.match(/data-wavefront="cone"/g)||[]).length,3);
 assert.doesNotMatch(physicsView('radiation',{...radiationState(60,2,0),time:1},{...rad,power:0},[],false,labels,format),/data-wavefront/);
 assert.doesNotMatch(physicsView('light',{...lightState(30,2,0,'intensity'),time:1},{...light,source:0},[],false,labels,format),/data-wavefront/);
});
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
