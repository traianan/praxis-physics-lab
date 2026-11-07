import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('compression threshold captions stay inside the plot in English and Romanian at phone and desktop widths',async()=>{
 const source=await read('public/simulari/motoare-termice/js/figuri-1.js');
 const drawing=source.slice(source.indexOf('(()=>{const S=new Sim(\'#fig4\''),source.indexOf('/* ---------- Fig. 5'));
 const translations=JSON.parse(await read('scripts/heat-engines-translations.json'));
 const labels={diesel:'prag orientativ pentru autoaprinderea sigură a motorinei',otto:'prag orientativ de detonație a benzinei'};
 for(const language of ['en','ro','default'])for(const mode of ['diesel','otto'])for(const width of [320,340,720]){
  const translate=text=>language==='en'?(translations[text]??text):text,records=[];
  let simulation,plot,threshold;
  const ctx=new Proxy({measureText:text=>({width:translate(text).length*6.6}),createLinearGradient:()=>({addColorStop(){}})}, {get:(object,key)=>object[key]??(()=>{}),set:(object,key,value)=>(object[key]=value,true)});
  const environment={Sim:function(){simulation=this;this.mode=mode;this.p={eps:18,t1:20};this.t={};this.out=()=>{};},Math,window:language==='default'?{}:{PraxisI18n:{tr:translate}},MONO:'11px monospace',MONOB:'bold 11px monospace',COL:{c:'green',a:'red',r:'black',muted:'gray'},TAU:Math.PI*2,grid(){},dot(){},rrect(){},heat(){return 'red';},f:String,
   line(ctx,x1,y1,x2,y2,color,lineWidth,dash){if(dash?.[0]===6)threshold={x1,y1,x2,y2,color};},
   axes(ctx,box,xRange,yRange){plot=box;return {X:x=>box.x+x*box.w,Y:y=>box.y+box.h-(y-yRange[0])/(yRange[1]-yRange[0])*box.h};},
   txt(ctx,text,x,y,options){records.push({text:translate(text),x,y,...options});},SERIF:()=>''};
  vm.runInNewContext(drawing,environment);simulation.draw(ctx,width,320);
  const caption=records.filter(record=>record.color===(mode==='diesel'?'green':'red')&&record.font===environment.MONO);
  assert.equal(caption.map(record=>record.text).join(' '),translate(labels[mode]),'wrapping preserves the entire translated caption in reading order');
  for(const record of caption){
   const textWidth=ctx.measureText(record.text).width;
   assert.ok(record.x-textWidth>=plot.x+3,`${language}/${mode}/${width}: caption extends left of plot (${record.x-textWidth})`);
   assert.ok(record.x<=plot.x+plot.w-3,'right edge stays inset');
   assert.ok(record.y>=plot.y&&record.y<=threshold.y1-11,'caption stays above its physical threshold and below the cylinder');
  }
  assert.equal(caption.at(-1).y,threshold.y1-11,'last line retains the threshold offset');
  assert.equal(threshold.y1,plot.y+plot.h-(mode==='diesel'?490:570)/940*plot.h,'physical temperature threshold is unchanged');
 }
});

test('heat-engine section selector includes the introduction without changing other courses',async()=>{
 const source=await read('public/shared/course.js'),start=source.indexOf(' const entries='),end=source.indexOf(' for(const entry of entries)',start);
 for(const id of ['motoare-termice','calorimetrie']){
  const context={id,original:{querySelector:()=>null,querySelectorAll:()=>[{hash:'#s1',textContent:'1 Motoare termice'}]}};
  vm.runInNewContext(source.slice(start,end)+';globalThis.result=entries;',context);
  assert.deepEqual(Array.from(context.result,entry=>entry.id),id==='motoare-termice'?['top','s1']:['s1']);
 }
});
test('Otto/Diesel navigation keeps the section, shared engine and compression experiment consistent',async()=>{
 const source=await read('public/shared/heat-engines.js'),end=source.indexOf('/* Mount each topic');
 assert.match(source,/PraxisHeatEngineNavigation/);
 const window={};vm.runInNewContext(source.slice(0,end),{window});
 const host=()=>({children:[],prepend(fig){if(fig.parentElement)fig.parentElement.children=fig.parentElement.children.filter(item=>item!==fig);this.children.unshift(fig);fig.parentElement=this;this.children.forEach((item,index)=>item.nextElementSibling=this.children[index+1]||null);}}),ottoHost=host(),dieselHost=host();
 function simulator(mode){const sim={mode,changes:0,originalCalls:0,fig:{},onMode(){this.originalCalls++;}};sim.fig.querySelector=selector=>({click(){sim.mode=selector.match(/data-mode="(.*?)"/)[1];sim.changes++;sim.onMode(sim.mode);}});return sim;}
 const engine=simulator('otto'),compression=simulator('otto'),selections=[];ottoHost.prepend(engine.fig);
 let navigation;navigation=window.PraxisHeatEngineNavigation.create({engine,compression,ottoHost,dieselHost,select:id=>{selections.push(id);navigation.sync(id);}});
 engine.fig.querySelector('[data-mode="diesel"]').click();assert.equal(selections.at(-1),'s4');assert.equal(engine.fig.parentElement,dieselHost);assert.equal(compression.mode,'diesel');
 navigation.sync('s3');assert.equal(engine.mode,'otto');assert.equal(engine.fig.parentElement,ottoHost);assert.equal(selections.length,1,'programmatic synchronisation does not recurse');
 assert.equal(compression.mode,'otto');assert.equal(compression.fig.parentElement,ottoHost,'the compression experiment is also available under Otto');
 assert.equal(engine.fig.nextElementSibling,compression.fig,'the engine precedes the compression experiment in both views');
 navigation.sync('s4');assert.equal(engine.mode,'diesel');assert.equal(engine.fig.parentElement,dieselHost);
 engine.fig.querySelector('[data-mode="otto"]').click();assert.equal(selections.at(-1),'s3');assert.equal(engine.fig.parentElement,ottoHost);
 const before=engine.changes;navigation.sync('s3');assert.equal(engine.changes,before,'reselecting the same engine preserves its animation');assert.equal(engine.originalCalls,engine.changes);
 compression.fig.querySelector('[data-mode="diesel"]').click();assert.equal(selections.at(-1),'s4');assert.equal(engine.mode,'diesel');assert.equal(compression.fig.parentElement,dieselHost);assert.equal(engine.fig.parentElement,dieselHost);
 assert.equal(compression.originalCalls,compression.changes);
});
test('four-stroke diagram renders only a closed ideal cycle, without a gas-exchange baseline',async()=>{
 const drawing=await read('scripts/adaptations/heat-engines-diagram.js');
 assert.doesNotMatch(drawing,/separate dashed isobar|p₀|PY\(1\)/);
 assert.match(drawing,/PraxisIdealCycleDiagram/);
});
test('Otto and Diesel render four exact ideal branches, with visible heat-transfer segments and a cursor confined to the cycle',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/ideal-engine-cycles.js'),{window});
 vm.runInNewContext(await read('public/shared/ideal-cycle-diagram.js'),{window});
 for(const kind of ['otto','diesel']){
  let path=[];const strokes=[],ctx={save(){},restore(){},beginPath(){path=[];},moveTo(...p){path.push(p);},lineTo(...p){path.push(p);},stroke(){strokes.push(path.slice());},fillRect(){},fillText(){},strokeText(){},arc(){},fill(){},closePath(){}};
  const cycle=window.PraxisIdealCycleDiagram.reference(kind),plot=window.PraxisIdealCycleDiagram.draw(ctx,{x:40,y:40,w:400,h:336},{kind,cycle,mark:true});
  assert.equal(plot.states.length,4);assert.equal(strokes.filter(p=>p.length===81).length,4);
  assert.deepEqual(Array.from(plot.types),kind==='otto'?['adiabatic','isochoric','adiabatic','isochoric']:['adiabatic','isobaric','adiabatic','isochoric']);
  assert.equal(plot.marker.V,plot.states[0].V);assert.equal(plot.marker.p,plot.states[0].p);
  assert.ok(Math.abs(plot.xy(plot.states[3])[1]-plot.xy(plot.states[0])[1])>36,'cooling isochore remains visible');
  if(kind==='diesel')assert.ok(plot.xy(plot.states[2])[0]-plot.xy(plot.states[1])[0]>40,'isobaric heat input remains visible');
  for(let leg=0;leg<4;leg++)for(let j=0;j<=100;j++){
   const p=plot.point(leg,j/100),a=plot.states[leg];
   if(plot.types[leg]==='adiabatic')assert.ok(Math.abs(p.p*p.V**cycle.gamma-a.p*a.V**cycle.gamma)<1e-8);
   if(plot.types[leg]==='isochoric')assert.equal(p.V,a.V);
   if(plot.types[leg]==='isobaric')assert.equal(p.p,a.p);
   if(j===100){const b=plot.states[(leg+1)%4];assert.ok(Math.abs(p.V-b.V)<1e-9&&Math.abs(p.p-b.p)<1e-9,'branches meet exactly');}
  }
 }
});
test('heat engines is available in the library with every simulation and no textbook references',async()=>{
 const sim=simulations.find(s=>s.id==='motoare-termice');
 assert.ok(sim);assert.equal(sim.chapter,'caldura-termodinamica');
 const html=await read('public/simulari/motoare-termice/index.html');
 for(let i=1;i<=9;i++)assert.match(html,new RegExp('id="fig'+i+'"'));
 assert.match(html,/id="heroField"/);
 const source=(await read('sources/motoare-termice/index.html'))
  .replace(/(<figure class="fig" id="fig7">[\s\S]*?<\/figure>)/,s=>s.replace('value="8" data-k="eps"','value="3" data-k="eps"'))
  .replace(/(<figure class="fig" id="fig8">[\s\S]*?<\/figure>)/,s=>s.replace('value="18" data-k="eps"','value="6" data-k="eps"'));
 const sliders=s=>Array.from(s.matchAll(/<input type="range"[^>]+>/g),m=>m[0]);
 assert.deepEqual(sliders(html),sliders(source).map(s=>s.includes('data-k="k"')?s.replace('value="2"','value="3"'):s),'physical slider limits are preserved; Carnot starts with the conventional reference geometry');
 assert.doesNotMatch(html, /manual|1\.6\.\d|id="s10"|manifest.webmanifest/i);
 assert.doesNotMatch(html,/clasa a X-a|grade 10/i);
 for(const file of ['baza','figuri-1','figuri-2','lectie']){
  const code=await read('public/simulari/motoare-termice/js/'+file+'.js');
  assert.doesNotMatch(code,/manual|serviceWorker\.register/i);new vm.Script(code);
 }
});
test('Carnot reference states give the conventional clockwise diagram and the Carnot efficiency',async()=>{
 const code=await read('public/simulari/motoare-termice/js/figuri-2.js');
 const helpers=code.split('// Schelet comun:')[0],start=code.indexOf("CycleFig('#fig6'"),end=code.indexOf('/* ---------- Fig. 7',start);
 let configuration;
 vm.runInNewContext(helpers+code.slice(start,end),{CycleFig:(selector,cfg)=>{configuration=cfg;},COL:{a:'red',b:'blue'},f:String});
 for(const mode of ['di','mono']){
  const cycle=configuration.build({mode,p:{Tc:600,Tr:300,k:3}}),P=cycle.P;
  assert.equal(cycle.carnot,true);
  if(mode==='mono')assert.ok(P[0].V<P[3].V&&P[3].V<P[1].V&&P[1].V<P[2].V);
  const p=P.map(s=>8.31*s.T/s.V);assert.ok(p[0]>p[1]&&p[3]>p[2]);if(mode==='mono')assert.ok(p[1]>p[3]);
  assert.equal(P[0].T,P[1].T);assert.equal(P[2].T,P[3].T);
  for(const [a,b]of [[P[1],P[2]],[P[3],P[0]]])assert.ok(Math.abs(a.T*a.V**(cycle.g-1)-b.T*b.V**(cycle.g-1))<1e-8);
  const Q1=8.31*600*Math.log(P[1].V/P[0].V),Q2=8.31*300*Math.log(P[2].V/P[3].V);
  assert.ok(Math.abs(1-Q2/Q1-(1-300/600))<1e-12);
 }
});
test('Carnot schematic follows the reference geometry, with separated states 2 and 4',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/carnot-diagram.js'),{window,document:{documentElement:{dataset:{}}}});
 const factor=2**1.5,P=[{V:5,T:600},{V:15,T:600},{V:15*factor,T:300},{V:5*factor,T:300}];
 const ctx=new Proxy({}, {get:(object,key)=>object[key]??(()=>{}),set:(object,key,value)=>(object[key]=value,true)});
 const diagram=window.PraxisCarnotDiagram.draw(ctx,{x:40,y:40,w:640,h:400},P,5/3),p=P.map(diagram.xy),width=p[2][0]-p[0][0],height=p[2][1]-p[0][1];
 assert.ok(p[0][0]<p[3][0]&&p[3][0]<p[1][0]&&p[1][0]<p[2][0]);
 assert.ok(p[0][1]<p[1][1]&&p[1][1]<p[3][1]&&p[3][1]<p[2][1]);
 assert.ok((p[1][0]-p[3][0])/width>.25,'state 4 is well to the left of state 2, as in the reference');
 assert.ok((p[3][1]-p[1][1])/height>.22,'state 4 is visibly below state 2');
});
test('the optional calculated Carnot view retains a linear physical p–V projection',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/carnot-diagram.js'),{window,document:{documentElement:{dataset:{}}}});
 const factor=2**1.5,P=[{V:5,T:600},{V:15,T:600},{V:15*factor,T:300},{V:5*factor,T:300}],ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const diagram=window.PraxisCarnotDiagram.draw(ctx,{x:40,y:40,w:640,h:400},P,5/3,{proportional:true}),a=diagram.xy(P[0]),b=diagram.xy(P[2]);
 const V=(P[0].V+P[2].V)/2,p=(8.31*P[0].T/P[0].V+8.31*P[2].T/P[2].V)/2,m=diagram.xy({V,T:p*V/8.31});
 assert.ok(Math.abs(m[0]-(a[0]+b[0])/2)<1e-8);assert.ok(Math.abs(m[1]-(a[1]+b[1])/2)<1e-8);
});
test('schematic heat arrows enter through the hot branch and leave through the cold branch',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/carnot-diagram.js'),{window,document:{documentElement:{dataset:{}}}});
 for(const [hot,cold,gamma]of [[600,300,5/3],[900,250,1.4],[400,390,1.4]])for(const width of [240,640]){
  const factor=(hot/cold)**(1/(gamma-1)),P=[{V:5,T:hot},{V:15,T:hot},{V:15*factor,T:cold},{V:5*factor,T:cold}];
  const strokes=[],stack=[];let path=[];
  const ctx={save(){stack.push(this.strokeStyle);},restore(){this.strokeStyle=stack.pop();},beginPath(){path=[];},moveTo(x,y){path.push([x,y]);},lineTo(x,y){path.push([x,y]);},stroke(){strokes.push({color:this.strokeStyle,path:path.slice()});},fillRect(){},rect(){},clip(){},arc(){},fill(){},strokeText(){},fillText(){}};
  const box={x:42,y:30,w:width,h:364},diagram=window.PraxisCarnotDiagram.draw(ctx,box,P,gamma);
  assert.equal(strokes.filter(s=>s.path.length>20).length,4,'draw only the four cycle branches, without extended isotherms');
  const curves=strokes.filter(s=>s.path.length>20);
  for(const [color,index,sign]of [['#c8402a',0,1],['#1f5a8a',2,-1]]){
   const arrow=strokes.find(s=>s.color===color);assert.ok(arrow);
   const path=curves[index].path,a=path[38],b=path[42],dx=b[0]-a[0],dy=b[1]-a[1],ax=arrow.path[1][0]-arrow.path[0][0],ay=arrow.path[1][1]-arrow.path[0][1];
   assert.ok(sign*(dx*ay-dy*ax)>0,'heat crosses the boundary in the correct direction');
  }
 }
});
test('animated engine follows exact ideal branches continuously and holds its piston during isochores',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/ideal-engine-cycles.js'),{window});
 vm.runInNewContext(await read('public/shared/heat-engines-model.js'),{window});
 for(const kind of ['otto','diesel']){
  const model=window.PraxisHeatEnginesModel.create(kind),c=model.cycle;
  assert.deepEqual(Array.from(c.branches.slice(1,5),b=>b.type),kind==='otto'?['adiabatic','isochoric','adiabatic','isochoric']:['adiabatic','isobaric','adiabatic','isochoric']);
  for(let a=0;a<model.period;a+=.25){
   const s=model.at(a),b=c.branches[s.phase],start=c.states[b.from];
   assert.ok(s.angle>=0&&s.angle<=720);
   if(b.type==='adiabatic')assert.ok(Math.abs(s.p*s.V**c.gamma-start.p*start.V**c.gamma)<1e-8);
   if(b.type==='isobaric')assert.ok(Math.abs(s.p-start.p)<1e-8);
   if(b.type==='isochoric')assert.ok(Math.abs(s.V-start.V)<1e-8);
   const next=model.at(a+1e-5);assert.ok(Math.abs(next.p-s.p)<.01,'continuous pressure');
   if(s.phase===4)assert.equal(s.angle,540);
   if(kind==='otto'&&s.phase===2)assert.equal(s.angle,360);
  }
  assert.ok(c.work>0);assert.ok(c.efficiency>0&&c.efficiency<1);
 }
});
test('introductory animation tolerates a frame timestamp earlier than its scheduling time',async()=>{
 const source=await read('public/simulari/motoare-termice/js/lectie.js');
 const start=source.indexOf("(()=>{const c=$('#heroField')"),end=source.indexOf('\n})();',start)+6;
 const helpers=(await read('public/simulari/motoare-termice/js/figuri-2.js')).split('// Schelet comun:')[0];
 const callbacks=[],ctx=new Proxy({}, {get:(obj,key)=>obj[key]??(()=>{}),set:(obj,key,value)=>(obj[key]=value,true)});
 const canvas={getContext:()=>ctx},hero={addEventListener(){}};
 const context={Math,window:{addEventListener(){}},document:{hidden:false,addEventListener(){}},$:s=>s==='#heroField'?canvas:hero,matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},performance:{now:()=>100},requestAnimationFrame:fn=>(callbacks.push(fn),callbacks.length),lerp:(a,b,t)=>a+(b-a)*t,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),TAU:2*Math.PI,f:String,SND:{whoosh(){}}};
 vm.runInNewContext(helpers+source.slice(start,end),context);
 assert.doesNotThrow(()=>callbacks.shift()(99));
 assert.doesNotThrow(()=>callbacks.shift()(132));
});

test('engine photographs retain their intrinsic aspect and enough source pixels at each display density',async()=>{
 const source=await read('public/shared/heat-engines.js'),window={devicePixelRatio:2,PraxisCanvasResolution:{ratio:()=>3}};
 vm.runInNewContext(source.slice(0,source.indexOf('/* Mount each topic')),{window});
 const image={naturalWidth:1000,naturalHeight:667,style:{}};
 window.PraxisHeatEnginePhotos.fit(image);assert.equal(parseFloat(image.style.maxWidth),1000/3);assert.equal(image.width,1000);assert.equal(image.height,667);assert.equal(image.style.aspectRatio,'auto');assert.equal(image.style.height,'auto');assert.equal(image.style.boxSizing,'border-box');
 window.PraxisCanvasResolution.ratio=()=>2;window.PraxisHeatEnginePhotos.fit(image);assert.equal(image.style.maxWidth,'500px');
 const pending={naturalWidth:0,naturalHeight:0,style:{}};window.PraxisHeatEnginePhotos.fit(pending);assert.deepEqual(pending.style,{});
});
