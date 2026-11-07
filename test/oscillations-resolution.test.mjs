import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('oscillator navigation redraw prepares below-fold activities without advancing simulation time',async()=>{
 const importer=await read('scripts/import-oscillator.mjs');
 const redraw=importer.match(/  function redraw\(\)\{[\s\S]*?\n  \}/)[0];
 const g={clearRect(){}},painted=[],fits=[],state={t:8.25,running:true,last:100},canvas={id:'cv-yva'},phasors={id:'cv-yva-phasors'};
 const shell={closest:()=>({hidden:false}),getClientRects:()=>[{}],getBoundingClientRect:()=>({top:1800,bottom:2200}),querySelector:()=>canvas};
 const demos=[{shell,state,spec:{render(ctx,w,h,s){assert.equal(s,state);painted.push([w,h]);},renderAdditional(node,s,fit){fit(phasors);}}}];
 const fitCanvas=cv=>{fits.push(cv.id);cv.width=1920;cv.height=960;return {ctx:g,w:640,h:320};};
 vm.runInNewContext(redraw+';redraw();',{demos,fitCanvas,document:{hidden:false}});
 assert.deepEqual(fits,['cv-yva','cv-yva-phasors']);assert.deepEqual(painted,[[640,320]]);assert.deepEqual(state,{t:8.25,running:true,last:100});assert.equal(canvas.width,1920);
});

test('atomic import changes pixel density while preserving scene geometry and physical range',async()=>{
 const importer=await read('scripts/import-atomic.mjs'),source=await read('sources/interactii-atomice/js/app.js');
 const start=importer.indexOf('const resizeSource='),end=importer.indexOf("js=js.replace(/if ",start);
 const adapted=vm.runInNewContext('let js=source;'+importer.slice(start,end)+'\njs',{source});
 const resize=adapted.match(/function resize\(\) \{[\s\S]*?\n\}/)[0];
 const snapshots=[];
 for(const density of [1,2,3,4.5]){
  const transforms=[],cv={getBoundingClientRect:()=>({width:719.5,height:443.25})},window={PraxisCanvasResolution:{forCanvas:canvas=>{assert.equal(canvas,cv);return density;}}};
  const result=vm.runInNewContext('let W=0,H=0,L={},rMaxView=0;'+resize+';resize();({W,H,L,rMaxView})',{cv,window,devicePixelRatio:1,ctx:{setTransform:(...args)=>transforms.push(args)}});
  snapshots.push(JSON.stringify(result));
  assert.equal(cv.width,Math.round(719.5*density));assert.equal(cv.height,Math.round(443.25*density));
  assert.equal(transforms[0][0],cv.width/result.W);assert.equal(transforms[0][3],cv.height/result.H);
 }
 assert.equal(new Set(snapshots).size,1);
 new vm.Script(adapted);
});

test('composition import resamples analytical component waves without moving phase or endpoints',async()=>{
 const importer=await read('scripts/import-composition.mjs');
 let app=(await read('sources/compunerea-oscilatiilor/app.js')).replaceAll('\r\n','\n');
 // Execute the durable sampling adapters directly, without writing generated assets.
 const patches=importer.slice(importer.indexOf("patch('const N=Math.max"),importer.indexOf('patch("if($(\'showSymmetry\')'));
 app=vm.runInNewContext('let app=source;function patch(a,b){if(!app.includes(a))throw Error(a);app=app.replace(a,b);}'+patches+'\napp',{source:app});
 new vm.Script(app);
 const wave=app.match(/function wave\(id,which\)\{[^\n]+/)[0];
 const runs=[];
 for(const density of [1,3]){
  const points=[],ctx={clearRect(){},fillRect(){},beginPath(){},getTransform:()=>({a:density}),moveTo:(x,y)=>points.push([x,y]),lineTo:(x,y)=>points.push([x,y]),stroke(){},fillText(){}},canvas={width:500,height:185,getContext:()=>ctx};
  vm.runInNewContext(wave+';wave("xWave","x");',{ $:()=>canvas,time:12,params:{wx:2,wy:2,ax:5,ay:3,phase:0},line(){},point(){}});
  runs.push(points);assert.ok(points.length>=500*density);
 }
 assert.deepEqual(runs[0][0],runs[1][0]);assert.deepEqual(runs[0].at(-1),runs[1].at(-1));assert.ok(runs[1].length>runs[0].length);
});
