import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {adaptWaveResolution,restoreWaveResolution} from '../scripts/waves-resolution-adapter.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
function fixture(helper){
 const events=[];let matrix=[1,0,0,1,0,0],dash=[],saved=[];
 const ctx={fillStyle:'#000000',strokeStyle:'#000000',globalAlpha:1,globalCompositeOperation:'source-over',shadowBlur:0,filter:'none',lineWidth:1,
  getTransform:()=>Object.fromEntries(['a','b','c','d','e','f'].map((k,i)=>[k,matrix[i]])),setTransform:(...m)=>{matrix=m;events.push(['transform',...m]);},getLineDash:()=>dash.slice(),setLineDash:d=>{dash=d.slice();events.push(['dash',...d]);},
  save(){saved.push({matrix:matrix.slice(),fillStyle:this.fillStyle,lineWidth:this.lineWidth});},restore(){Object.assign(this,saved.pop());matrix=this.matrix??matrix;},
  beginPath:()=>events.push(['beginPath']),moveTo:(...a)=>events.push(['moveTo',...a]),lineTo:(...a)=>events.push(['lineTo',...a]),stroke:()=>events.push(['stroke',ctx.strokeStyle,ctx.lineWidth]),fill:()=>events.push(['fill',ctx.fillStyle]),clearRect:(...a)=>events.push(['clearRect',...a]),fillRect:(...a)=>events.push(['fillRect',...a]),
  createLinearGradient:(...a)=>{const g={args:a,matrix:matrix.slice(),stops:[],addColorStop(...s){this.stops.push(s);}};events.push(['gradient',g]);return g;},
  createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData:(data,...a)=>events.push(['putImageData',Array.from(data.data),...a]),drawImage:(...a)=>events.push(['drawImage',...a]),measureText:t=>({width:t.length*7})};
 const canvas={width:200,height:100,getContext:()=>ctx},document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
 const create=vm.runInNewContext(helper+';lessonRetainedContext',{document}),retained=create(canvas,{width:100,height:50},100,50);
 return {ctx,canvas,events,retained,draw:retained.facade,resize(){events.length=0;canvas.width=300;canvas.height=150;retained.replay();}};
}
test('one-shot wave figures replay vector paths and gradients at the new backing transform',async()=>{
 const f=fixture(await read('scripts/adaptations/waves-retained-context.js')),g=f.draw;
 g.clearRect(0,0,100,50);const gradient=g.createLinearGradient(0,0,100,0);gradient.addColorStop(0,'red');gradient.addColorStop(1,'blue');g.fillStyle=gradient;g.lineWidth=3;g.beginPath();g.moveTo(2,4);g.lineTo(90,40);g.fill();g.stroke();
 f.resize();assert.ok(f.events.some(e=>e[0]==='lineTo'&&e[1]===90&&e[2]===40));assert.ok(f.events.some(e=>e[0]==='stroke'&&e[2]===3));
 const rebuilt=f.events.find(e=>e[0]==='gradient')[1];assert.deepEqual([...rebuilt.matrix],[3,0,0,3,0,0]);assert.deepEqual(rebuilt.stops.map(s=>[...s]),[[0,'red'],[1,'blue']]);
 assert.equal(f.events.filter(e=>e[0]==='drawImage').length,0,'vector figure is redrawn, never enlarged from a screenshot');
});
test('retained wave frames stay bounded and snapshot mutable solver pixels without rerunning its model',async()=>{
 const f=fixture(await read('scripts/adaptations/waves-retained-context.js')),g=f.draw;
 for(let frame=0;frame<1000;frame++){g.clearRect(0,0,100,50);g.beginPath();g.moveTo(frame,0);g.lineTo(frame,10);g.stroke();}
 assert.ok(f.retained.stats().commands<10);assert.ok(f.retained.stats().path<5);
 const pixels=g.createImageData(2,1);pixels.data.set([2,4,6,255,8,10,12,255]);g.putImageData(pixels,0,0);pixels.data.fill(0);f.resize();
 assert.deepEqual(f.events.find(e=>e[0]==='putImageData')[1],[2,4,6,255,8,10,12,255]);assert.equal(g.canvas.width,100);assert.equal(g.measureText('abc').width,21);
});
test('wave adapter preserves the logical canvas facade and replaces bitmap copying on resize',async()=>{
 const original=await read('scripts/adaptations/waves-canvas-original.js')+'\n\n// Vector membrane:',adapted=adaptWaveResolution(original);
 assert.equal(restoreWaveResolution(adapted),original.replaceAll('\r\n','\n'));
 assert.ok(adapted.includes('PraxisCanvasResolution?.ratio(box.width,displayedHeight)'));
 assert.ok(adapted.includes('retainedContext?.replay(snapshot)'));
 assert.ok(!adapted.includes('// Preserve a one-shot plot until its next redraw'));
 assert.ok(adapted.includes("if(key==='width')return logicalWidth;if(key==='height')return logicalHeight;"));
});
