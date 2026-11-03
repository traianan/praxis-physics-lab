import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
function surface(){
 const transforms=[],canvas={style:{},addEventListener(){},getBoundingClientRect:()=>({width:640,height:320}),getContext:()=>({setTransform:(...v)=>transforms.push(v)})};
 return {canvas,transforms};
}
test('vector 2D/3D density changes keep CSS geometry and pointer mapping',async()=>{
 const source=await read('public/simulari/calcul-vectorial/index.html');
 let ratio=2;const listeners=[],window={PraxisCanvasResolution:{forCanvas:()=>ratio},addEventListener:(name,fn)=>listeners.push(fn)};
 const scope=vm.createContext({window,devicePixelRatio:1,ALL:[],clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}}});
 for(const [name,end]of [['Plane','class View3D{'],['View3D','/* --------- legături comune']]){
  const start=source.indexOf('class '+name+'{'),Class=vm.runInContext('('+source.slice(start,source.indexOf(end,start)).trim()+')',scope);
  Class.prototype.render=()=>{};const {canvas,transforms}=surface(),p=new Class(canvas);p.resize();
  const geometry=name==='Plane'?[...p.P(2,3),...p.W(100,200)]:[...p.P([2,3,1])];
  assert.equal(canvas.width,1280);ratio=3;listeners.at(-1)();assert.equal(canvas.width,1920);assert.deepEqual(transforms.at(-1),[3,0,0,3,0,0]);
  assert.deepEqual(name==='Plane'?[...p.P(2,3),...p.W(100,200)]:[...p.P([2,3,1])],geometry);ratio=2;
 }
});
test('rectilinear track and plot refresh their backing on DPR-only resize without moving physical coordinates',async()=>{
 for(const name of ['Track','Plot']){
  let ratio=2;const listeners=[],MR={onRedraw(){}},window={MR,PraxisCanvasResolution:{forCanvas:()=>ratio},addEventListener:(name,fn)=>listeners.push(fn)};
  const file='js/'+name.toLowerCase()+'.js',source=await read('public/simulari/miscarea-rectilinie/'+file);
  vm.runInNewContext(source,{window,ResizeObserver:class{observe(){}}});
  const {canvas,transforms}=surface(),p=new MR[name](canvas);p.render=()=>{};p.resize();
  assert.equal(canvas.width,1280);assert.equal(p.w,640);assert.equal(p.h,320);
  ratio=3;listeners[0]();assert.equal(canvas.width,1920);assert.equal(p.w,640);assert.equal(p.h,320);assert.deepEqual(transforms.at(-1),[3,0,0,3,0,0]);
 }
});
