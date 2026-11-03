import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function model(){
 const pending=new Map();let next=0;
 const context=vm.createContext({window:{addEventListener(){}},document:{getElementById:()=>({value:0,classList:{toggle(){}}})},performance:{now:()=>0},requestAnimationFrame:fn=>{pending.set(++next,fn);return next;},cancelAnimationFrame:id=>pending.delete(id)});
 vm.runInContext(await read('public/simulari/viteza-si-acceleratia/app.js')+'\nglobalThis.labs=[rectLab,curvLab,polyLab];globalThis.switchTab=switchMainTab;',context);
 for(const lab of context.labs){lab.draw=()=>{};lab.updateTelemetry=()=>{};}
 return {context,pending,labs:context.labs};
}
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
test('annotations fit their panel and avoid existing labels, particles and lines',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/velocity-labels.js'),{window});
 const place=window.PraxisVelocityLabels.place,bounds={x:10,y:10,w:180,h:120};
 const rect=place({x:185,y:100,w:85,h:20},bounds,{boxes:[{x:95,y:90,w:95,h:30}],lines:[[10,80,190,80]]});
 assert.ok(rect.x>=10&&rect.x+rect.w<=190);assert.ok(rect.y>=10&&rect.y+rect.h<=130);
 assert.ok(rect.y+rect.h<=90||rect.y>=120||rect.x+rect.w<=95);
 assert.ok(rect.y+rect.h<80||rect.y>80);
});

test('captions outside a filled piston keep the canvas bounds while plot labels keep their panel',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/velocity-labels.js'),{window});
 const ctx={canvas:{id:'engine'},font:'11px sans-serif',fillStyle:'#000',beginPath(){},moveTo(){},lineTo(){},arc(){},stroke(){},fillRect(){}};
 const labels=window.PraxisVelocityLabels;labels.begin(ctx,300,200);ctx.fillRect(70,70,110,70);
 labels.label(ctx,'exhaust',90,25,{anchorBounds:true});labels.label(ctx,'crankshaft',100,180,{anchorBounds:true});labels.label(ctx,'gas',100,100,{anchorBounds:true});
 const [top,bottom,inside]=labels.inspect(ctx);
 assert.equal(top.bounds.y,8);assert.equal(bottom.bounds.h,184);assert.equal(inside.bounds.y,77);assert.equal(inside.bounds.h,56);
});
test('canvas backing pixels follow displayed size and DPR without changing scientific coordinates',async()=>{
 let displayed=1200,transform;
 const context={setTransform(...args){transform=args;}};
 const canvas={dataset:{logicalWidth:'920',logicalHeight:'520'},style:{},width:920,height:520,getBoundingClientRect:()=>({width:displayed}),getContext:()=>context};
 const window={devicePixelRatio:2};vm.runInNewContext(await read('public/shared/velocity-canvas.js'),{window});
 const logical=window.PraxisVelocityCanvas.prepare(canvas);
 assert.equal(logical.width,920);assert.equal(logical.height,520);
 assert.equal(canvas.width,2400);assert.equal(canvas.height,1357);close(transform[0],2400/920);
 displayed=360;window.devicePixelRatio=3;window.PraxisVelocityCanvas.prepare(canvas);
 assert.equal(canvas.width,1080);assert.equal(canvas.height,610);close(transform[3],610/520);
 displayed=0;window.PraxisVelocityCanvas.prepare(canvas);assert.equal(canvas.width,1080);
});
test('velocity laboratory is discoverable in Motion with all local resources',async()=>{
 const sim=findSimulations('miscare','viteza polinomiale').find(s=>s.id==='viteza-si-acceleratia');assert.ok(sim);
 const html=await read('public/'+sim.href);assert.match(html,/data-course="viteza-si-acceleratia"/);
 for(const file of ['app.js','style.css'])assert.ok((await read('public/simulari/viteza-si-acceleratia/'+file)).length>1000);
 assert.doesNotMatch(html,/(?:src|href)="https?:/);
});
test('polynomial derivatives and four planar models retain consistent physical components',async()=>{
 const {labs:[rect,curv,poly]}=await model();
 Object.assign(rect,{x0:2,v0:3,a:4});close(rect.pos(2),16);close(rect.vel(2),11);
 Object.assign(poly,{A:.5,B:-4.5,C:10,D:0});close(poly.pos(2),6);close(poly.vel(2),-2);close(poly.acc(2),-3);
 for(const mode of ['circular_uniform','circular_variat','projectile','elliptic']){
  Object.assign(curv,{mode,p1:100,p2:mode==='projectile'?45:1,p3:mode==='projectile'?10:.2});
  const s=curv.stateAt(2);
  close(s.atx+s.anx,s.ax);close(s.aty+s.any,s.ay);close(s.atx*s.anx+s.aty*s.any,0);
  close(s.aMag**2,s.atScalar**2+s.anScalar**2);
  if(mode==='circular_uniform'){close(s.atScalar,0);close(s.anScalar,s.vMag**2/100);}
  if(mode==='projectile'){close(s.ax,0);close(s.ay,-10);}
 }
});
test('rapid pause/resume leaves one animation and switching tabs pauses hidden laboratories',async()=>{
 const {labs,context,pending}=await model();
 for(const lab of labs){lab.play();assert.equal(pending.size,1);lab.pause();assert.equal(pending.size,0);lab.play();assert.equal(pending.size,1);lab.stop();assert.equal(pending.size,0);}
 labs[0].play();context.switchTab('curbiliniu');assert.equal(labs[0].running,false);assert.equal(pending.size,0);
 labs[1].play();context.switchTab('teorie');assert.equal(labs[1].running,false);assert.equal(pending.size,0);
});

test('Frenet components are undefined at reversal, while physical acceleration remains continuous',async()=>{
 const {labs:[,curv]}=await model();
 Object.assign(curv,{mode:'circular_variat',p1:100,p2:.6,p3:-.3});
 const stopped=curv.stateAt(2),before=curv.stateAt(2-1e-3),after=curv.stateAt(2+1e-3);
 assert.equal(stopped.frenetDefined,false);assert.equal(stopped.atScalar,null);assert.equal(stopped.anScalar,null);
 close(stopped.vMag,0);close(stopped.aMag,30);
 assert.equal(before.frenetDefined,true);assert.equal(after.frenetDefined,true);
 assert.ok(before.atScalar<0);assert.ok(after.atScalar>0);
 for(const s of [before,after]){close(s.atx+s.anx,s.ax);close(s.aty+s.any,s.ay);}
 close(stopped.x,100*Math.cos(.6));close(stopped.y,100*Math.sin(.6));
});
