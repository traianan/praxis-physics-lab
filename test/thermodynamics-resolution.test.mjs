import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {thermoReadability} from '../scripts/adaptations/thermodynamics-readability.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

for(const [course,path] of [['calorimetry','sources/calorimetrie/site/js/baza.js'],['notions','sources/notiuni-termodinamice/site/js/baza.js'],['engines','sources/motoare-termice/js/baza.js']]){
 test(`${course}: each canvas uses its own density and DPR-only resize preserves the model`,async()=>{
  const source=thermoReadability(course,'js/baza.js',await read(path));
  const method=source.slice(source.indexOf('  resize(){'),source.indexOf('\n  render(){'));
  const transforms=[];
  let hidden=false;
  const canvases=[400,800].map(width=>({_w:width,_h:200,getBoundingClientRect:()=>({width:hidden?0:width,height:hidden?0:200}),getContext:()=>({setTransform:(...args)=>transforms.push(args)})}));
  const sim={cv:canvases,c:canvases[0],w:400,h:200,time:3.25,onResize(){this.initializations=(this.initializations||0)+1;},render(){this.renders=(this.renders||0)+1;}};
  const window={PraxisCanvasResolution:{forCanvas:c=>c===canvases[0]?3:2.5}};
  const resize=vm.runInNewContext('({'+method+'}).resize',{window,devicePixelRatio:2,Math});
  resize.call(sim);assert.deepEqual(canvases.map(c=>c.width),[1200,2000]);assert.equal(sim.initializations,undefined);assert.equal(sim.time,3.25);assert.equal(sim.renders,1);
  assert.equal(transforms[0][0],3);assert.equal(transforms[1][0],2.5);
  delete window.PraxisCanvasResolution;resize.call(sim);assert.deepEqual(canvases.map(c=>c.width),[800,1600]);
  sim.w=300;resize.call(sim);assert.equal(sim.initializations,1);
  hidden=true;resize.call(sim);assert.equal(sim.w,400);assert.equal(sim.initializations,1);assert.equal(sim.time,3.25);
 });
}

test('an early first animation timestamp cannot poison liquid particle geometry with a negative stochastic time step',async()=>{
 const base=thermoReadability('notions','js/baza.js',await read('sources/notiuni-termodinamice/site/js/baza.js'));
 const start=base.indexOf('  loop(){'),end=base.indexOf('  // coordonate pointer',start),callbacks=[];
 const loop=vm.runInNewContext('({'+base.slice(start,end)+'}).loop',{performance:{now:()=>100},requestAnimationFrame:fn=>(callbacks.push(fn),callbacks.length),Math,document:{hidden:false}});
 const source=await read('sources/notiuni-termodinamice/site/js/figuri-1.js');
 const block=source.slice(source.indexOf("(()=>{const S=new Sim('#fig1'"),source.indexOf('/* ---------- Fig. 2'));
 let sim;
 vm.runInNewContext(block.replace('S.onResize=init;','S.particles=()=>P;S.onResize=init;'),{Sim:function(){sim=this;Object.assign(this,{w:800,h:400,time:0,mode:'lichid',p:{T:300},t:{},vis:true,render(){},label(){}});},Math,TAU:2*Math.PI,randn:()=>1,COL:{},clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
 sim.onResize();const initial=sim.particles().map(p=>[p.x,p.y]);
 let steps=0;const advance=sim.step;sim.step=dt=>{steps++;advance(dt);};
 loop.call(sim);callbacks.shift()(99);
 assert.equal(steps,0,'zero elapsed time redraws without evaluating piston velocity displacement/dt');
 assert.ok(sim.particles().every(p=>[p.x,p.y,p.ux,p.uy].every(Number.isFinite)),'an early frame must not create NaN particle obstacles');
 assert.equal(sim.time,0,'an early frame does not move the experiment backwards');
 assert.deepEqual(sim.particles().map(p=>[p.x,p.y]),initial);
 callbacks.shift()(116);
 assert.ok(sim.time>0);assert.ok(sim.particles().every(p=>[p.x,p.y,p.ux,p.uy].every(Number.isFinite)),'all particle obstacles remain finite for label placement');
});

test('fixed-coordinate thermo canvases sharpen to displayed size without logical or physical drift',async()=>{
 const window={devicePixelRatio:2,PraxisCanvasResolution:{ratio:(w,h)=>{assert.equal(w,800);assert.equal(h,400);return 3;}}};
 vm.runInNewContext(await read('public/shared/first-law-applications-canvas.js'),{window});
 const transforms=[],canvas={dataset:{},style:{},getAttribute:name=>name==='width'?'400':'200',getBoundingClientRect:()=>({width:800}),getContext:()=>({setTransform:(...args)=>transforms.push(args),clearRect(){}})};
 for(let i=0;i<2;i++){const result=window.PraxisApplicationsCanvas.prepare(canvas);assert.equal(result.w,400);assert.equal(result.h,200);assert.equal(canvas.width,2400);assert.equal(canvas.height,1200);assert.equal(transforms.at(-1)[0],6);}
 delete window.PraxisCanvasResolution;window.PraxisApplicationsCanvas.prepare(canvas);assert.equal(canvas.width,1600);
});

test('first-law graph buffer covers the fractional displayed box while preserving client-space geometry',async()=>{
 const source=await read('public/shared/first-law.js'),start=source.indexOf(' const d=window.PraxisCanvasResolution'),end=source.indexOf('const scale=',start);
 const transforms=[],canvas={getBoundingClientRect:()=>({width:480.328,height:300}),getContext:()=>({setTransform:(...args)=>transforms.push(args),clearRect(){}})};
 vm.runInNewContext(source.slice(start,end),{canvas,w:478,h:298,window:{PraxisCanvasResolution:{forCanvas:()=>3}},Math});
 assert.equal(canvas.width,1441);assert.equal(canvas.height,900);assert.equal(canvas._w,478);assert.equal(canvas._h,298);assert.equal(transforms[0][0],1441/478);assert.equal(transforms[0][3],900/298);
});
