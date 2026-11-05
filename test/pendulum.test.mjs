import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/simulari/pendulul-gravitational/app.js',import.meta.url),'utf8');
function model(){
 const context={Math};vm.createContext(context);
 const physics=source.match(/  const physics = \{[\s\S]*?\n  \};/)[0];
 const step=source.match(/  function stepPhysics\(dtSim\) \{[\s\S]*?\n  \}/)[0];
 vm.runInContext(`const PI=Math.PI,TAU=2*PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const S={len:1,mass:1,g:9.81,damp:0,theta:.1,omega:0,t:0,measuring:null};const AudioKit={tick(){}};${physics}\n${step}\nglobalThis.model={S,physics,stepPhysics};`,context);
 return context.model;
}
// Independent numerical quadrature of the complete elliptic integral.
function referencePeriod(L,g,angle){const n=10000,h=Math.PI/2/n,k=Math.sin(angle/2);let sum=0;for(let i=0;i<=n;i++){const y=1/Math.sqrt(1-k*k*Math.sin(i*h)**2);sum+=(i===0||i===n?1:i%2?4:2)*y;}return 4*Math.sqrt(L/g)*sum*h/3;}
test('pendulum AGM period agrees with quadrature at small and large amplitudes',()=>{
 const {physics}=model();for(const L of [.1,1,3])for(const g of [1.62,9.81,24.79])for(const degrees of [1,10,80,90]){const a=degrees*Math.PI/180;assert.ok(Math.abs(physics.exactT(L,g,a)/referencePeriod(L,g,a)-1)<1e-10);}
 assert.ok(Math.abs(physics.smallT(1,9.81)-2.00606668)<1e-7);
 assert.equal(physics.smallT(4,9.81)/physics.smallT(1,9.81),2);
});
test('nonlinear trajectory conserves energy within integration tolerance and damping dissipates it',()=>{
 for(const damp of [0,.3]){const {S,physics,stepPhysics}=model();S.theta=80*Math.PI/180;S.damp=damp;const initial=physics.energy(S.len,S.mass,S.g,S.theta).E;let error=0;for(let i=0;i<2000;i++){stepPhysics(.01);const energy=physics.energy(S.len,S.mass,S.g,S.theta).E;error=Math.max(error,Math.abs(energy/initial-1));}if(damp===0)assert.ok(error<.004,`energy drift ${error}`);else assert.ok(physics.energy(S.len,S.mass,S.g,S.theta).E<initial*.01);}
});
test('numerical period and mass independence match the analytical pendulum model',()=>{
 const periods=[];for(const mass of [.1,5]){const {S,physics,stepPhysics}=model();S.mass=mass;S.theta=20*Math.PI/180;const crossings=[];let previous=S.theta;while(crossings.length<8){stepPhysics(.001);if(previous<0&&S.theta>=0)crossings.push(S.t);previous=S.theta;}const period=(crossings.at(-1)-crossings[0])/7;assert.ok(Math.abs(period/physics.exactT(1,9.81,20*Math.PI/180)-1)<.001);periods.push(period);}assert.equal(periods[0],periods[1]);
});
test('import excludes the unrelated network challenge and grade references; bilingual messages match',async()=>{
 const html=await readFile(new URL('../public/simulari/pendulul-gravitational/index.html',import.meta.url),'utf8');
 assert.doesNotMatch(html,/cdn-cgi|__CF\$|<iframe|clasa a XI-a/);
 const ro=JSON.parse(await readFile(new URL('../public/locales/pendulum/ro.json',import.meta.url),'utf8'));
 const en=JSON.parse(await readFile(new URL('../public/locales/pendulum/en.json',import.meta.url),'utf8'));
 assert.deepEqual(Object.keys(ro.messages).sort(),Object.keys(en.messages).sort());
 for(const [key,value]of Object.entries(en.messages))assert.deepEqual([...key.matchAll(/\{\w+\}/g)].map(x=>x[0]).sort(),[...value.matchAll(/\{\w+\}/g)].map(x=>x[0]).sort());
});
test('force diagram resolves weight correctly and tension points towards the pivot',async()=>{
 const svg=await readFile(new URL('../scripts/adaptations/pendulum-forces.svg',import.meta.url),'utf8');
 const vector=name=>{const tag=svg.match(new RegExp('<line data-force="'+name+'"[^>]+>'))[0];const n=attr=>Number(tag.match(new RegExp(attr+'="([^"]+)"'))[1]);return [n('x2')-n('x1'),n('y2')-n('y1')];};
 const [radial,tangent,tension,weight,string]=['radial','tangential','tension','weight','string'].map(vector);
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
 assert.ok(Math.abs(cross(radial,string))<.001);assert.ok(dot(radial,string)>0);
 assert.ok(Math.abs(cross(tension,string))<.001);assert.ok(dot(tension,string)<0);
 assert.ok(Math.abs(dot(tangent,string))<.001);
 for(let i=0;i<2;i++)assert.ok(Math.abs(radial[i]+tangent[i]-weight[i])<1e-6);
 const arc=svg.match(/data-force="angle" d="M([\d.]+) ([\d.]+) A70 70 0 0 1 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
 assert.equal(arc[0],370);assert.equal(arc[1],115);
 assert.ok(Math.abs(cross([arc[2]-370,arc[3]-45],string))<.001);
});
