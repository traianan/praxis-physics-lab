import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
async function harness(){
 class Context{
  constructor(){this.canvas={width:300,height:160};this.font='12px sans-serif';this.textAlign='left';this.calls=[];}
  measureText(text){const width=String(text).length*parseFloat(this.font)*.5;return {width,actualBoundingBoxAscent:10,actualBoundingBoxDescent:2};}
  getTransform(){return {a:1,b:0,c:0,d:1,e:0,f:0};}
  save(){this.saved=[this.font,this.textAlign];}restore(){[this.font,this.textAlign]=this.saved;}
  fillText(text,x,y){this.calls.push({text,x,y,font:this.font});}strokeText(...args){this.fillText(...args);}
 }
 const window={CanvasRenderingContext2D:Context};vm.runInNewContext(await readFile(new URL('../public/shared/canvas-typography.js',import.meta.url),'utf8'),{window,CanvasRenderingContext2D:Context});
 const ctx=new Context();ctx.typography=window.PraxisCanvasTypography;return ctx;
}
test('scientific Canvas indices stay attached, smaller and below their physical symbol',async()=>{
 const ctx=await harness();ctx.fillText('a_m = f_exc',20,40);
 assert.ok(ctx.calls.every(call=>!call.text.includes('_')));
 const base=ctx.calls.find(call=>call.text==='a'),sub=ctx.calls.find(call=>call.text==='m');
 assert.ok(sub.y>base.y);assert.ok(parseFloat(sub.font)<parseFloat(base.font));
 assert.ok(sub.x>=base.x+6 && sub.x<=base.x+8);
});
test('Canvas labels at the right and lower edges stay inside the drawing',async()=>{
 const ctx=await harness();ctx.fillText('Station B',298,160);const call=ctx.calls[0];
 assert.ok(call.x+ctx.measureText(call.text).width<=297);assert.ok(call.y+2<=157);
});


test('Greek scientific subscripts retain the complete symbol, including the standard molar-volume index',async()=>{
 const ctx=await harness();ctx.fillText('V_μ0',20,40);
 assert.deepEqual(ctx.calls.map(call=>call.text),['V','μ0']);
 assert.ok(ctx.calls[1].y>ctx.calls[0].y);
 assert.ok(parseFloat(ctx.calls[1].font)<parseFloat(ctx.calls[0].font));
});


test('text inside a diagram box is centred by its actual glyph bounds',async()=>{
 const ctx=await harness();ctx.measureText=()=>({width:96,actualBoundingBoxLeft:2,actualBoundingBoxRight:98,actualBoundingBoxAscent:13,actualBoundingBoxDescent:3});
 const cell={x:40,y:60,w:150,h:48};
 const ink=ctx.typography.textInBox(ctx,'N = 4.48·10²⁴',cell);
 assert.equal(ink.x+ink.w/2,cell.x+cell.w/2);assert.equal(ink.y+ink.h/2,cell.y+cell.h/2);
 assert.ok(ink.x>=cell.x&&ink.x+ink.w<=cell.x+cell.w);assert.ok(ink.y>=cell.y&&ink.y+ink.h<=cell.y+cell.h);
 assert.equal(ctx.calls.length,1);
});
