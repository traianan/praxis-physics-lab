import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/shared/first-law-applications-canvas.js',import.meta.url),'utf8');
test('oscillator quality can use two samples per CSS pixel without changing other renderers or logical coordinates',()=>{
 const window={devicePixelRatio:1},transforms=[];
 const canvas={id:'cv-fork',dataset:{logicalWidth:'640',logicalHeight:'320'},style:{},width:640,height:320,getBoundingClientRect:()=>({width:960,height:480}),getContext:()=>({setTransform:(...v)=>transforms.push(v),clearRect(){}})};
 vm.runInNewContext(source,{window});const prepare=window.PraxisApplicationsCanvas.prepare;
 const logical=prepare(canvas,{minDpr:2});assert.equal(canvas.width,1920);assert.equal(canvas.height,960);assert.equal(logical.w,640);assert.equal(logical.h,320);
 prepare(canvas);assert.equal(canvas.width,960);assert.equal(canvas.height,480);
 window.devicePixelRatio=3;prepare(canvas,{minDpr:2});assert.equal(canvas.width,2880);assert.equal(canvas.height,1440);
 assert.deepEqual(transforms[0],[3,0,0,3,0,0]);
});
