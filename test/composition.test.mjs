import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
async function model(p){const window={};vm.runInNewContext(await read('public/shared/composition-model.js'),{window});return window.PraxisCompositionModel(p);}

test('layout measurement covers all presets and restores model identity and live content, including on errors',async()=>{
 const src=await read('public/simulari/compunerea-oscilatiilor/app.js'),exports={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports,module:{exports}});
 const ast=exports.parse(src,{ecmaVersion:'latest'}),parts={};
 function visit(node){if(!node||typeof node!=='object')return;if(node.type==='VariableDeclarator'&&node.id.name==='presets')parts.presets=src.slice(node.init.start,node.init.end);if(node.type==='FunctionDeclaration')parts[node.id.name]=src.slice(node.start,node.end);for(const value of Object.values(node))if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
 visit(ast);const start=src.indexOf('window.PraxisCompositionPanelVariants='),end=src.indexOf('function updateInterpretation',start),window={},live={};
 const ctx=vm.createContext({window,live});vm.runInContext('const TWO=2*Math.PI;const presets='+parts.presets+';let mode="same",params={ax:3,ay:3,wx:2,wy:2,phase:0};const saved=params;const $=id=>live[id]??=( {textContent:"unchanged",innerHTML:"unchanged"});'+['gcd','ratioIntegers','period','xy','contacts','symmetries','updateInterpretation'].map(k=>parts[k]).join('\n')+'\n'+src.slice(start,end),ctx);
 const variants=window.PraxisCompositionPanelVariants();assert.ok(variants.analysis.length>=16);assert.equal(variants.presetDescription.length,12);assert.equal(JSON.stringify(live),'{}');assert.equal(vm.runInContext('params===saved&&mode==="same"',ctx),true);
 vm.runInContext('contacts=()=>{throw Error("measurement failure")}',ctx);assert.throws(()=>window.PraxisCompositionPanelVariants(),/measurement failure/);assert.equal(vm.runInContext('params===saved&&mode==="same"',ctx),true);
});
test('composition preserves the five original files and includes all controls and seven theory topics',async()=>{
 const manifest=JSON.parse(await read('docs/imported-composition.json'));
 for(const [file,hash]of Object.entries(manifest.hashes))assert.equal(createHash('sha256').update(await read(manifest.source+file)).digest('hex'),hash,file);
 const html=await read('public/simulari/compunerea-oscilatiilor/index.html');
 assert.equal((html.match(/<canvas /g)||[]).length,3);assert.equal((html.match(/<article class="panel"><h3>/g)||[]).length,7);
 for(const id of ['sameTab','differentTab','ratioButtons','soundToggle','soundVolume','nextExtreme','save','didactic','showSymmetry','showDirection','showContacts','showBox'])assert.ok(html.includes(`id="${id}"`),id);
 assert.equal(findSimulations('sunete-si-unde','compunerea lissajous')[0].id,'compunerea-oscilatiilor');
 assert.ok(html.includes('courses/shared'));assert.doesNotMatch(html,/<(?:script|link)\b[^>]*(?:src|href)="https?:/);
});
test('component superposition satisfies the ellipse equation and changes traversal with the phase sign',async()=>{
 for(const phase of [-180,-90,-45,0,45,90,180]){
  const p={ax:4,ay:2,wx:2,wy:2,phase},m=await model(p),d=phase*Math.PI/180;
  for(let i=0;i<50;i++){
   const t=i*.07,[x,y]=m.xy(t),vx=p.ax*p.wx*Math.cos(p.wx*t),vy=p.ay*p.wy*Math.cos(p.wy*t+d);
   close((x/p.ax)**2+(y/p.ay)**2-2*x*y/(p.ax*p.ay)*Math.cos(d),Math.sin(d)**2);
   close(x*vy-y*vx,-p.ax*p.ay*p.wx*Math.sin(d));
  }
 }
});
test('decimal frequencies give the exact common period and contacts distinguish tangencies from corners',async()=>{
 for(const [wx,wy,phase,expected]of [[1.5,3,0,[2,4,0]],[1.5,3,90,[0,1,2]],[3,4,90,[2,3,2]],[2,2,0,[0,0,2]]]){
  const p={ax:3,ay:2,wx,wy,phase},m=await model(p),C=m.contacts(),T=m.period();
  assert.deepEqual([C.tangentVertical.length,C.tangentHorizontal.length,C.corners.length],expected);
  for(const t of [0,.37,1.1])m.xy(t).forEach((v,i)=>close(v,m.xy(t+T)[i]));
  assert.equal(C.events.filter(e=>e.axis==='x').length,Math.round(wx*T/Math.PI));
  assert.equal(C.events.filter(e=>e.axis==='y').length,Math.round(wy*T/Math.PI));
 }
 const long=await model({ax:3,ay:3,wx:2.01,wy:2,phase:45});close(long.period(),200*Math.PI);assert.equal(long.contacts(),null);
});
test('symmetries distinguish a tilted ellipse, a circle, and a parabola',async()=>{
 for(const [p,expected]of [[{wx:2,wy:2,phase:45},[false,false,true]],[{wx:2,wy:2,phase:90},[true,true,true]],[{wx:1,wy:2,phase:90},[false,true,false]]]){
  const s=(await model({ax:3,ay:3,...p})).symmetries();assert.deepEqual([s.ox,s.oy,s.center],expected);
 }
});
test('display density changes preserve logical coordinates and avoid reallocating unchanged bitmaps',async()=>{
 const window={devicePixelRatio:1};vm.runInNewContext(await read('public/shared/first-law-applications-canvas.js'),{window});
 let width=308,allocations=0,pixelsW=760,pixelsH=600;const transforms=[];
 const canvas={dataset:{logicalWidth:'308',logicalHeight:'320'},style:{},getAttribute:k=>k==='width'?'760':'600',getBoundingClientRect:()=>({width}),getContext:()=>({setTransform:(...a)=>transforms.push(a),clearRect(){}}),get width(){return pixelsW;},set width(v){allocations++;pixelsW=v;},get height(){return pixelsH;},set height(v){allocations++;pixelsH=v;}};
 for(const dpr of [1,1.5,2,3])for(const w of [308,600,1000]){
  width=w;window.devicePixelRatio=dpr;const state=window.PraxisApplicationsCanvas.prepare(canvas);
  assert.equal(state.w,308);assert.equal(state.h,320);assert.equal(canvas.width,Math.round(w*dpr));assert.equal(canvas.height,Math.round(w*320/308*dpr));
  const n=allocations;window.PraxisApplicationsCanvas.prepare(canvas);assert.equal(n,allocations);close(transforms.at(-1)[0],canvas.width/308);
 }
});
