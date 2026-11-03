import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {adaptWaveCoreAudit, extractCoreFunction} from '../scripts/waves-core-audit-adapter.mjs';
import {adaptWaveAnimations} from '../scripts/waves-animation-adapter.mjs';

const generated=fs.readFileSync(new URL('../public/simulari/unde-mecanice/index.html',import.meta.url),'utf8');
const original=adaptWaveCoreAudit(await adaptWaveAnimations(generated,true),true);
const output=()=>adaptWaveCoreAudit(original);
function model(name,owner){
 const source=extractCoreFunction(extractCoreFunction(output(),owner),name);
 return vm.runInNewContext('('+source+')');
}
test('layer is exactly reversible and refuses applying twice',()=>{
 const html=output();assert.equal(adaptWaveCoreAudit(html,true),original);
 assert.throws(()=>adaptWaveCoreAudit(html),/already applied/);
});
test('layer remains compatible with following animation adaptation',async()=>{
 const beforeAnimations=original;
 const patched=adaptWaveCoreAudit(beforeAnimations);
 const animated=await adaptWaveAnimations(patched);
 assert.equal(adaptWaveCoreAudit(await adaptWaveAnimations(animated,true),true),beforeAnimations);
});
test('equal tones have no finite beat period; detuned tones have correct maxima rate',()=>{
 const beat=model('waveCoreBeatState','hm');
 assert.equal(beat(440,440).period,null);
 assert.equal(beat(440,443).frequency,3);
 assert.equal(beat(440,443).period,1/3);
 const hm=extractCoreFunction(output(),'hm');
 assert.ok(hm.includes('Math.cos(Math.PI*y*a)*22'));
 assert.ok(!hm.includes('Math.cos(Math.PI*y*a)*30'));
});
test('interference displays time averaged intensity with coherent maxima/minima and incoherent sum',()=>{
 const intensity=model('waveCoreInterferenceIntensity','vm');
 assert.equal(intensity(0,3,1,true),4);
 assert.ok(Math.abs(intensity(0,.5,1,true))<1e-12);
 for(const path of [0,.25,.5,100])assert.equal(intensity(0,path,1,false),2);
});
test('finite-depth orbits retain physical aspect under display scaling over the full slider range',()=>{
 const orbit=model('waveCoreWaterOrbit','Em'),scale=model('waveCoreWaterScale','Em');
 for(const h of [.5,2,12,50,4000])for(const wavelength of [2,20,100,200000])for(const A of [.1,.8,2])for(const depth of [0,.22,.48,.74,.94,1]){
  const k=2*Math.PI/wavelength,z=-depth*h,{a,b}=orbit(A,k,h,z);
  const expected=Math.tanh(k*(h+z));
  if(a>1e-200)assert.ok(Math.abs(b/a-expected)<1e-10);
  const {x,y}=scale(a,b,42,38);
  assert.ok(x<=42+1e-10&&y<=38+1e-10);
  if(x>1e-200)assert.ok(Math.abs(y/x-expected)<1e-10);
  if(depth===1)assert.equal(b,0);
 }
});
test('water uses selected amplitude in tsunami mode and physical orbit ratios in readouts',()=>{
 const water=extractCoreFunction(output(),'Em');
 assert.ok(!water.includes('X=v?1.2:i'));
 assert.ok(water.includes('X=i'));
 assert.ok(!water.includes('(J/(D||1))'));
 assert.ok(!water.includes('viteză între cele două formule'));
});

test('small submerged orbits gain bounded uniform magnification, preserving their physical shape',()=>{
 const orbit=model('waveCoreWaterOrbit','Em'),scale=model('waveCoreWaterSceneScale','Em');
 for(const h of [.5,12,50])for(const lambda of [2,24,100])for(const z of [.22,.48,.74,.94]){
  const {a,b}=orbit(.8,2*Math.PI/lambda,h,-z*h),base=14,s=scale(a,base);
  assert.ok(s>=base&&s<=8*base);assert.ok(Number.isFinite(s));
  if(a>1e-200)assert.ok(Math.abs((b*s)/(a*s)-b/a)<1e-12);
 }
 const a=orbit(.8,2*Math.PI/24,12,-.94*12).a;
 assert.ok(a*scale(a,14)>7,'near-bed orbit is visible beyond the particle marker');
 assert.ok(extractCoreFunction(output(),'Em').includes('localOrbitScale=R===0?mainOrbitScale:'),'surface particle keeps the wave surface scale');
});

test('all five fixed horizontal levels and contrasted orbit centres are drawn without phase dependence',()=>{
 const levels=model('waveCoreWaterLevels','Em'),draw=model('waveCoreWaterDrawOrbit','Em'),segments=[],ellipses=[];
 const ctx=new Proxy({moveTo:(...a)=>segments.push(a),lineTo:(...a)=>segments.push(a),ellipse:(...a)=>ellipses.push(a)},{get:(o,k)=>o[k]??(()=>{})});
 levels(ctx,800,68,232,[0,.22,.48,.74,.94],false);
 assert.equal(segments.length,10);for(let i=0;i<5;i++){assert.equal(segments[2*i][1],68+[0,.22,.48,.74,.94][i]*232);assert.equal(segments[2*i][1],segments[2*i+1][1]);}
 draw(ctx,400,180,9,2,false);assert.deepEqual(Array.from(ellipses[0]).slice(0,4),[400,180,9,2]);
 assert.equal(ctx.lineWidth,1.3);assert.equal(segments.length,14,'centre cross uses fixed equilibrium coordinates');
});
test('all adapted demonstration functions compile as JavaScript',()=>{
 for(const name of ['hm','vm','Em'])new vm.Script('('+extractCoreFunction(output(),name)+')');
});

test('water owns one animation ticket and cancels it completely on pause or option changes',()=>{
 const source=extractCoreFunction(output(),'Em'),effects=[],pending=new Map();let id=0,state=0,ref=0;
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
 const canvas={width:800,height:350,getContext:()=>ctx};
 const values=[12,24,.8,9.81,true,true,false,false,false];
 const N={useRef:initial=>({current:ref++<2?canvas:initial}),useState:initial=>[values[state++]??initial,()=>{}]};
 vm.runInNewContext('('+source+')()',{N,wn:()=>false,lessonUseEffect:fn=>effects.push(fn),lessonRequestAnimationFrame:fn=>{pending.set(++id,fn);return id;},lessonCancelAnimationFrame:id=>pending.delete(id),t(){},f(){},Math,isFinite});
 const cleanup=effects[1]();assert.equal(pending.size,1,'no duplicate initial animation loop');
 const [ticket,callback]=[...pending][0];pending.delete(ticket);callback(16);assert.equal(pending.size,1);
 cleanup();assert.equal(pending.size,0,'no stale closure can repaint old orbit visibility');
});
test('actual water component draws finite-depth ellipses with the physical aspect ratio',()=>{
 const source=extractCoreFunction(output(),'Em');
 for(const scenario of [[.5,100,.8,false],[50,2,2,false],[12,24,.1,true]]){
  const [h,wavelength,amplitude,tsunami]=scenario,ellipses=[],effects=[];
  const context=new Proxy({createLinearGradient:()=>({addColorStop(){}}),ellipse:(...args)=>ellipses.push(args)}, {get:(target,key)=>target[key]??(()=>{})});
  const canvas={width:800,height:350,getContext:()=>context};
  const states=[h,wavelength,amplitude,9.81,false,true,true,tsunami,false];let state=0,ref=0;
  const N={useRef:initial=>({current:ref++<2?canvas:initial}),useState:initial=>[states[state++]??initial,()=>{}]};
  const scope={N,wn:()=>false,lessonUseEffect:callback=>effects.push(callback),lessonRequestAnimationFrame:()=>1,lessonCancelAnimationFrame(){},t:()=>null,f:()=>null,Math,isFinite};
  vm.runInNewContext('('+source+')()',scope);
  effects[1]();effects[2]();
  assert.equal(ellipses.length,20);
  const physicalH=tsunami?4000:h,physicalLambda=tsunami?200000:wavelength;
  for(let i=0;i<ellipses.length;i++){
   const depth=[0,.22,.48,.74,.94][i%5];
   const expected=Math.tanh(2*Math.PI/physicalLambda*physicalH*(1-depth));
   const ellipse=ellipses[i];if(ellipse[2]>1e-200)assert.ok(Math.abs(ellipse[3]/ellipse[2]-expected)<1e-10);
  }
 }
});
