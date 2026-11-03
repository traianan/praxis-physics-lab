import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {extractCoreFunction} from '../scripts/waves-core-audit-adapter.mjs';
import {adaptWaveAnimations} from '../scripts/waves-animation-adapter.mjs';
import {adaptWaveCanvasFormulas} from '../scripts/waves-canvas-formula-adapter.mjs';
const generated=fs.readFileSync(new URL('../public/simulari/unde-mecanice/index.html',import.meta.url),'utf8');
const original=adaptWaveCanvasFormulas(await adaptWaveAnimations(generated,true),true);
const output=adaptWaveCanvasFormulas(original);
function render(name,states=[]){
 let index=0;const make=(type,props)=>({type,props});
 return vm.runInNewContext('('+extractCoreFunction(output,name)+')()',{
  N:{useRef:initial=>({current:initial}),useState:initial=>[states[index++]??initial,()=>{}],useMemo:fn=>fn()},
  wn:()=>false,lessonUseEffect(){},t:make,f:make,LessonMathText:'math',Me:'formula',Math
 });
}
function text(tree){if(tree==null)return'';if(Array.isArray(tree))return tree.map(text).join(' ');if(typeof tree==='object')return text(tree.props?.children);return String(tree);}
test('canvas formula layer is reversible and compatible with the following animation layer',async()=>{
 assert.equal(adaptWaveCanvasFormulas(output,true),original);
 assert.equal(await adaptWaveAnimations(await adaptWaveAnimations(output),true),output);
 assert.throws(()=>adaptWaveCanvasFormulas(output),/already applied/);
});
test('beat DOM readouts follow the same selected frequencies, including equal tones',()=>{
 const a=text(render('hm',[440,443,false]));assert.match(a,/f_b = \|f₁ − f₂\| = 3.0 Hz/);assert.match(a,/T_b = 1\/f_b = 0.333 s/);
 const b=text(render('hm',[445,445,false]));assert.match(b,/f_b = \|f₁ − f₂\| = 0.0 Hz/);assert.match(b,/Fără bătăi/);assert.doesNotMatch(b,/T_b = .*0.000/);
});
test('spherical relative amplitude and intensity use the chosen distance and reference radius',()=>{
 const a=text(render('_m',[.4,false]));assert.match(a,/A\/A₀ = 0.500/);assert.match(a,/I\/I₀ = 0.2500/);
 const b=text(render('_m',[.8,false]));assert.match(b,/A\/A₀ = 0.250/);assert.match(b,/I\/I₀ = 0.0625/);
});
test('phase degree magnitude remains visible when its duplicate canvas formula is removed',()=>{
 const a=text(render('Um',[2,.5,.4]));assert.match(a,/270\s*°/);assert.match(a,/rad/);
});
test('Fraunhofer formula and beta definition remain readable while curve calculation is preserved',()=>{
 const a=text(render('Pm'));assert.match(a,/I\(θ\).*sin β\/β/);assert.match(a,/β = \(πa\/λ\).*sin θ/);
 const source=extractCoreFunction(output,'Pm');assert.ok(source.includes('Math.PI*e*Math.sin(T)'));
 assert.ok(!source.includes('o.fillText("I(θ)'));
});
test('all changed functions compile and geometric axes/numeric labels remain',()=>{
 for(const name of ['Um','dm','Pm','Vm','Jm','hm','_m','Em'])new vm.Script('('+extractCoreFunction(output,name)+')');
 assert.ok(extractCoreFunction(output,'Vm').includes('E.fillText(`N${W}`'));
 assert.ok(extractCoreFunction(output,'Km').includes('L.fillText("f² [Hz²]"'));
 assert.ok(extractCoreFunction(output,'Jm').includes('Q.fillText(`${on.toFixed(0)}km`'));
});
test('water orbit stat labels remain inside the short canvas at parameter extremes',()=>{
 const source=extractCoreFunction(output,'Em');
 for(const [depth,wavelength,amplitude]of [[.5,100,2],[50,2,.1],[2,20,2]]){
  const labels=[],effects=[];const context=new Proxy({fillText:(value,x,y)=>labels.push({value,x,y})},{get:(t,k)=>t[k]??(()=>{})});
  let state=0,ref=0;const states=[depth,wavelength,amplitude,9.81,false,true,true,false,false];
  vm.runInNewContext('('+source+')()',{
   N:{useRef:initial=>({current:ref++<2?{width:800,height:170,getContext:()=>context}:initial}),useState:initial=>[states[state++]??initial,()=>{}]},
   wn:()=>false,lessonUseEffect:callback=>effects.push(callback),t:()=>null,f:()=>null,Math,isFinite
  });effects[2]();
  assert.equal(labels.filter(p=>p.value.startsWith('b/a=')).length,5);
  for(const label of labels)assert.ok(label.y>=10&&label.y<=162,JSON.stringify(label));
 }
});
