import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {scientificMathRuntime} from '../scripts/scientific-math-runtime.mjs';

const read=p=>readFile(new URL(p,import.meta.url),'utf8');

test('real composition plot keeps its coordinate tr local while Canvas typography and locale wrappers translate the period',async()=>{
 const importer=await read('../scripts/import-composition.mjs'),original=await read('../compunerea_oscilatiilor/app.js');
 const call=importer.split('\n').find(line=>line.startsWith('patch("ctx.fillText(`T comun'));
 const replacement={};vm.runInNewContext(call,{patch(before,after){assert.ok(original.includes(before));replacement.after=after;}});
 const plot=original.replace(original.match(/ctx\.fillText\(`T comun[^\n]+/)[0],replacement.after).match(/function plot\(\)\{[\s\S]*?\nfunction wave/)[0].replace(/\nfunction wave$/,'');
 assert.ok(plot.includes('const tr=t=>{const [x,y]=xy(t)'));
 const embedded={};for(const lang of ['ro','en']){embedded[lang]={};for(const ns of ['common','composition'])embedded[lang][ns]=JSON.parse(await read('../public/locales/'+ns+'/'+lang+'.json'));}
 for(const language of ['ro','en'])for(const T of [3.142,150]){
  const draws=[];
  class Canvas{
   constructor(){this.font='14px system-ui';this.textAlign='left';this.canvas={width:760,height:600};this.stack=[];}
   measureText(text){return{width:String(text).length*7,actualBoundingBoxAscent:14,actualBoundingBoxDescent:0};}
   fillText(text,x,y){draws.push({text,font:this.font,x,y});}
   strokeText(){}clearRect(){}fillRect(){}
   getTransform(){return{a:1,d:1,b:0,c:0,e:0,f:0};}
   save(){this.stack.push({font:this.font,textAlign:this.textAlign});}
   restore(){Object.assign(this,this.stack.pop());}
  }
  const document={documentElement:{dataset:{}},body:{},readyState:'loading',addEventListener(){},querySelectorAll:()=>[]};
  const window={CanvasRenderingContext2D:Canvas,PraxisScientificColors:{apply(){},color:v=>v},addEventListener(){}};
  const context={window,document,CanvasRenderingContext2D:Canvas,localStorage:{getItem:k=>k==='praxis-language'?language:null},matchMedia:()=>({matches:false}),Proxy};
  vm.runInNewContext(await read('../public/shared/i18n.js'),context);window.PraxisI18n.initEmbedded({namespaceList:['common','composition'],embedded});
  vm.runInNewContext(await read('../public/shared/canvas-typography.js'),context);
  vm.runInNewContext(await read('../public/shared/course-localization.js'),context);
  const ctx=new Canvas(),canvas={width:760,height:600,getContext:()=>ctx};
  Object.assign(context,{$:id=>id==='plot'?canvas:{checked:false},period:()=>T,xy:t=>[Math.sin(t),Math.cos(t)],line(){},point(){},time:0,params:{wx:2,wy:2},mode:'same',TWO:2*Math.PI});
  vm.runInNewContext(plot+';plot();',context);
  const start=draws.findIndex(run=>run.text==='T'),runs=draws.slice(start);assert.ok(start>=0);
  assert.equal(runs[1].text,language==='en'?'common':'comun');assert.ok(parseFloat(runs[1].font)<14);assert.ok(runs[1].y>runs[0].y);assert.equal(runs[2].y,runs[0].y);
  assert.ok(runs[2].text.includes(T.toFixed(3)+' s'));assert.ok(!runs.some(run=>String(run.text).includes('NaN')));
  if(T>120)assert.ok(runs[2].text.includes(language==='en'?'limited displayed interval':'interval afișat limitat'));
 }
});

test('authored composition, Chladni and atomic markers retain structural mathematical content',async()=>{
 const window={addEventListener(){},PraxisI18n:{language:'ro',tr:s=>window.PraxisI18n.language==='en'&&s==='comun'?'common':s}},document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(await scientificMathRuntime(),{window,document,Set,WeakMap});
 const m=window.PraxisMath;
 const sources=[];
 const collect=(name,markup)=>{for(const match of markup.matchAll(/data-science-source="([^"]*)"/g))sources.push([name,match[1].replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&amp;','&')]);};
 const composition=await read('../scripts/import-composition.mjs'),theory=await read('../compunerea_oscilatiilor/teorie.html');
 const c={theory};vm.runInNewContext(composition.slice(composition.indexOf('const mathAttr='),composition.indexOf('let app='))+';globalThis.marked=theory;',c);collect('composition',c.marked);
 const chladni=await read('../scripts/import-chladni.mjs'),body=await read('../chladni.html');
 const ch={body};vm.runInNewContext(chladni.slice(chladni.indexOf('const mathAttr='),chladni.indexOf('body=body.replace(/<h1>'))+';globalThis.marked=body;',ch);collect('chladni-lab',ch.marked);
 assert.equal((ch.marked.match(/<code data-science-math="plain"/g)||[]).length,2);
 const ct=await read('../scripts/adaptations/chladni-content.html');
 const formula=chladni.slice(chladni.indexOf('const content='),chladni.indexOf(",ns=['common'",chladni.indexOf('const content='))).replace("(await read('scripts/adaptations/chladni-content.html'))",'input');
 const ctx={input:ct};vm.runInNewContext(chladni.slice(chladni.indexOf('const mathAttr='),chladni.indexOf('body=body.replace(/<code>'))+formula+';globalThis.marked=content;',ctx);collect('chladni-theory',ctx.marked);
 const atomic=await read('../scripts/import-atomic.mjs'),ab=await read('../interactii-atomice/index.html'),a={body:ab};
 vm.runInNewContext(atomic.slice(atomic.indexOf('const mathAttr='),atomic.indexOf("body=body.replace('<div class=\"sim\""))+';globalThis.marked=body;',a);collect('atomic',a.marked);
 assert.equal(sources.length,16);
 for(const [name,source]of sources){const html=m.render(source);assert.ok(html.includes('<math'),name+': '+source);assert.doesNotMatch(html,/math-error/);if(source.includes('/'))assert.match(html,/<mfrac>/,name+': '+source);if(source.includes('√'))assert.match(html,/<msqrt>/,name+': '+source);}
 const common=sources.find(([,source])=>source.startsWith('T_comun'))?.[1];assert.ok(common);
 const commonMath=m.render(common);assert.match(commonMath,/<msub>/);assert.match(commonMath,/<mfrac>/);assert.match(commonMath,/comun/);
 window.PraxisI18n.language='en';assert.match(m.render(common),/common/);window.PraxisI18n.language='ro';
 const energy=m.render(sources.find(([name,source])=>name==='atomic'&&source.startsWith('U('))[1]);assert.match(energy,/<msup>/);assert.equal((energy.match(/<mfrac>/g)||[]).length,2);
 const equilibrium=m.render(sources.find(([name,source])=>name==='atomic'&&source.startsWith('r₀'))[1]);assert.match(equilibrium,/<msup><mn>2<\/mn><mfrac>/);
 for(const [name,source]of sources.filter(([name,source])=>name.startsWith('chladni')&&source.startsWith('K ='))){const html=m.render(source);assert.match(html,/<msqrt>/);assert.match(html,/<mfrac>/);}
});

test('coupled readouts preserve field order and pass complete formulas to the shared renderer',async()=>{
 const code=await read('../public/shared/coupled.js');
 const info=code.match(/ function info\(n,s\)\{[^\n]+/)[0];
 const host={dataset:{},children:[],replaceChildren(){this.children=[];},append(child){this.children.push(child);}};
 const calls=[];
 const context={window:{PraxisMath:true},PraxisMath:{set(leaf,source,options){calls.push([source,options.syntax]);leaf.source=source;}},document:{createElement:tag=>({tag})},$:()=>host};
 vm.runInNewContext(info+';globalThis.info=info;',context);
 const source='ω_s = 3.132 rad/s\nT_b = 10.000 s';
 context.info(3,source);
 assert.deepEqual(calls,[[source.split('\n')[0],'plain'],[source.split('\n')[1],'plain']]);
 assert.equal(host.children[1].tag,'br');
 context.info(3,source);assert.equal(calls.length,2,'unchanged readings do not re-render');
 context.info(3,'T_b = 12.000 s');assert.equal(host.children.length,1);assert.equal(calls.at(-1)[0],'T_b = 12.000 s');
});

