import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import vm from'node:vm';
const html=await readFile(new URL('../public/simulari/unde-mecanice/index.html',import.meta.url),'utf8'),module=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)][0][1];
const exports={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports,module:{exports}});const ast=exports.parse(module,{ecmaVersion:'latest',sourceType:'module'});
const fn=name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert.ok(n,name);return module.slice(n.start,n.end);};
const array=name=>{for(const n of ast.body)if(n.type==='VariableDeclaration')for(const d of n.declarations)if(d.id.name===name)return vm.runInNewContext('('+module.slice(d.init.start,d.init.end)+')');throw Error(name);};
const jsx=(type,props)=>({type,props});
function hooks(refs=[]){let index=0;return {useRef:value=>({current:refs[index++]??value}),useState:value=>[typeof value==='function'?value():value,()=>{}]};}
function allNodes(tree){if(!tree||typeof tree!=='object')return[];return[tree,...[tree.props?.children].flat(2).flatMap(allNodes)];}
function huygensHarness(){
 const arcs=[],segments=[],queue=new Map(),refs=[],states=[],window={};let refIndex=0,stateIndex=0,ticket=0,dirty=false,tree,cleanup;
 const ctx=new Proxy({arc:(...args)=>arcs.push({args,color:ctx.strokeStyle}),moveTo:(...a)=>segments.push(['M',...a]),lineTo:(...a)=>segments.push(['L',...a])},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const canvas={width:720,height:340,getContext:()=>ctx};
 const N={useRef:value=>{const i=refIndex++;return refs[i]??=( {current:i===0?canvas:value});},useState:value=>{const i=stateIndex++;if(states[i]===undefined)states[i]=value;return[states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v;dirty=true;}];}};
 const sandbox={N,window,wn:()=>false,lessonUseEffect:effect=>{cleanup=effect();},lessonRequestAnimationFrame:cb=>(queue.set(++ticket,cb),ticket),lessonCancelAnimationFrame:id=>queue.delete(id),t:jsx,f:jsx};
 const render=()=>{cleanup?.();refIndex=stateIndex=0;dirty=false;tree=vm.runInNewContext(fn('im')+';im()',sandbox);};
 return {arcs,segments,refs,states,window,render,frame(now){arcs.length=segments.length=0;const [id,cb]=queue.entries().next().value;queue.delete(id);cb(now);if(dirty)render();},click(action){const node=allNodes(tree).find(n=>n.props?.['data-huygens-action']===action||n.props?.['data-huygens-mode']===action);assert.ok(node,action);node.props.onClick();if(dirty)render();},seek(value){const range=allNodes(tree).find(n=>n.props?.['data-huygens-time']!==undefined);assert.ok(range);range.props.onChange({target:{value}});if(dirty)render();},get tree(){return tree;}};
}
async function startHuygens(){const h=huygensHarness();vm.runInNewContext(await readFile(new URL('../public/shared/animation-clock.js',import.meta.url),'utf8'),{window:h.window});h.render();return h;}
test('Huygens spherical propagation keeps sources fixed within each common emission stage and grows the envelope',async()=>{
 const h=await startHuygens();h.frame(1000);h.frame(1100);
 const wavelets=h.arcs.filter(a=>String(a.color).includes('rgba(')&&a.args[2]===2.5);
 assert.equal(wavelets.length,12);assert.ok(wavelets.every(a=>a.args[3]===0&&a.args[4]===2*Math.PI));
 const envelope=h.arcs.find(a=>a.color==='#047857'&&a.args[0]===360&&a.args[1]===170);assert.equal(envelope.args[2],38.5);
 for(const {args:[x,y,r]}of wavelets)assert.ok(Math.abs(Math.hypot(x-360,y-170)+r-38.5)<1e-8);
 h.frame(1200);const next=h.arcs.filter(a=>String(a.color).includes('rgba(')&&a.args[2]===5);
 assert.deepEqual(next.map(a=>a.args.slice(0,2)),wavelets.map(a=>a.args.slice(0,2)));
});
test('Huygens automatically hands over to the next fixed source front without stopping or zooming',async()=>{
 const h=await startHuygens();h.frame(0);
 for(let t=100;t<=3500;t+=100){h.frame(t);const F=h.refs[1].current;assert.ok(Math.abs(F.radius+25*F.elapsed-(36+25*t/1000))<1e-8);const circle=h.arcs.find(a=>a.color==='#047857'&&a.args[0]===360&&a.args[1]===170);assert.ok(Math.abs(circle.args[2]-(36+25*t/1000))<1e-8);}
 assert.equal(h.states[2],false);assert.equal(h.refs[1].current.time,3);assert.equal(h.refs[1].current.radius,111);
 assert.ok(!allNodes(h.tree).some(n=>n.props?.['data-huygens-action']==='next'));
 for(let t=3600;t<=10000;t+=100)h.frame(t);assert.ok(h.refs[1].current.cycle>=3);assert.equal(h.states[2],false);
 h.click('reset');assert.equal(h.refs[1].current.radius,36);assert.equal(h.refs[1].current.elapsed,0);assert.equal(h.refs[1].current.time,0);assert.equal(h.states[2],true);
});
test('Huygens Δt scrubbing pauses and updates equal wavelet radii and the envelope, including both endpoints',async()=>{
 for(const mode of ['spherical','plane']){
  const h=await startHuygens();h.click(mode);
  for(const elapsed of [0,.01,.2,.5,1,.99,0]){
   h.seek(elapsed);h.frame(1000);h.frame(2000);const F=h.refs[1].current;
   assert.equal(F.elapsed,elapsed);assert.equal(F.time,0);assert.equal(h.states[2],true);
   const scale=mode==='plane'?3:1,expected=25*elapsed*scale;
   const waves=h.arcs.filter(a=>String(a.color).includes('rgba(')&&a.args[2]!==3);assert.equal(waves.length,elapsed?mode==='plane'?9:12:0);
   assert.ok(waves.every(a=>Math.abs(a.args[2]-expected)<1e-8));
   if(mode==='spherical'){const envelope=h.arcs.find(a=>a.color==='#047857'&&a.args[0]===360&&a.args[1]===170);assert.equal(envelope.args[2],36+expected);}
   else assert.ok(h.segments.some(a=>a[0]==='M'&&Math.abs(a[1]-(140+expected))<1e-8));
  }
  h.seek(1);h.click('play');h.frame(3000);assert.equal(h.refs[1].current.time,1);assert.equal(h.refs[1].current.elapsed,0);assert.equal(h.states[2],false);
 }
});
test('Huygens advances identically at 30, 60 and 120 Hz',async()=>{
 for(const fps of [30,60,120]){const h=await startHuygens();for(let frame=0;frame<=fps*2.5;frame++)h.frame(frame*1000/fps);assert.ok(Math.abs(h.refs[1].current.time+h.refs[1].current.elapsed-2.5)<1e-8);}
});

test('generated guitar audio is finite, audible and tuned near 110Hz at 44.1 and 48kHz',()=>{
 for(const sampleRate of [44100,48000]){
  let samples;const parameter={value:0},node=()=>({connect(){},start(){},stop(){},frequency:{...parameter},Q:{...parameter},gain:{...parameter}}),context={sampleRate,state:'running',destination:{},createBuffer:(n,length)=>{samples=new Float32Array(length);return{getChannelData:()=>samples};},createBufferSource:node,createBiquadFilter:node,createGain:node};
  const sandbox={window:{PraxisWavesAudio:{instrumentOutput:(ctx,id,source)=>source}},N:hooks(),wn:()=>false,de:()=>context,lessonUseEffect(){},t:jsx,f:jsx,gn(){},am:[{freq:110,label:'A2'}],Float32Array};
  const tree=vm.runInNewContext(fn('Om')+';Om()',sandbox);const button=allNodes(tree).find(n=>n.type==='button'&&String(n.props.children).includes('Ciupeste'));button.props.onClick();
  assert.ok(samples.every(Number.isFinite));assert.ok(samples.some(x=>Math.abs(x)>.05));assert.ok(samples.slice(-sampleRate/4).reduce((a,x)=>a+x*x,0)<samples.slice(0,sampleRate/4).reduce((a,x)=>a+x*x,0));
  let bestLag=0,best=-Infinity;for(let lag=Math.floor(sampleRate/115);lag<sampleRate/105;lag++){let sum=0;for(let i=sampleRate/2|0;i<sampleRate;i++)sum+=samples[i]*samples[i-lag];if(sum>best){best=sum;bestLag=lag;}}
  assert.ok(Math.abs(sampleRate/bestLag-110)<.6,'pitch: '+sampleRate/bestLag);
 }
});
test('free–free beam modes satisfy zero bending moment/shear and fundamental support nodes',()=>{
 const mode=vm.runInNewContext(fn('lessonFreeBeamMode')+';lessonFreeBeamMode'),h=1e-3;
 for(let n=0;n<4;n++)for(const x of [0,1]){
  const f=offset=>mode(n,x+offset),second=(f(h)-2*f(0)+f(-h))/(h*h),third=(f(2*h)-2*f(h)+2*f(-h)-f(-2*h))/(2*h*h*h);
  assert.ok(Math.abs(second)<.02,'free moment');assert.ok(Math.abs(third)<.2,'free shear');
 }
 assert.ok(Math.abs(mode(0,.2241575))<1e-6);assert.ok(Math.abs(mode(0,.7758425))<1e-6);assert.ok(Math.abs(mode(1,.2241575))>.1,'supports are not nodes of every mode');
});
test('all seven numerical answers agree with independent calculations and all 20 quiz keys are valid',()=>{
 const problems=array('$v'),expected=[340*.0025,Math.sqrt(90/.01)/1.2,340/.68,3*340/2,10*Math.log10(1e-6/1e-12),1000*340/306,.75/.5];assert.equal(problems.length,7);
 problems.forEach((p,i)=>assert.ok(Math.abs(p.expected-expected[i])<.01,'problem '+p.id));
 const keys=[[0,1,0,0,1,0,0,0,1,0],[0,0,1,0,1,1,1,1,1,1]];
 for(const [i,name]of ['km','Hm'].entries()){const questions=array(name);assert.equal(questions.length,10);questions.forEach((q,j)=>{assert.equal(q.correct,keys[i][j],name+' '+j);assert.equal(q.options.length,4);});}
 assert.match(problems[3].titlu,/armonica a treia/);assert.match(problems[6].enunt,/în fază/);
});
test('seismic SDOF integration agrees with the analytical steady sinusoidal response',async()=>{
 const window={};vm.runInNewContext(await readFile(new URL('../public/shared/animation-clock.js',import.meta.url),'utf8'),{window});
 const queue=[],refs=[],ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),canvas={width:400,height:500,getContext:()=>ctx};let refIndex=0;
 const N={useRef:value=>{const ref={current:refIndex===1?canvas:value};refs[refIndex++]=ref;return ref;},useState:value=>[typeof value==='function'?value():value,()=>{}],useMemo:calculate=>calculate()};
 const sandbox={N,window,wn:()=>false,lessonUseEffect:effect=>effect(),lessonRequestAnimationFrame:callback=>(queue.push(callback),queue.length),lessonCancelAnimationFrame(){},t:jsx,f:jsx};
 vm.runInNewContext(fn('gm')+';gm()',sandbox);
 for(let frame=0;frame<=3600;frame++)queue.shift()(frame*1000/60);
 const t=60,wn=2*Math.PI*1.25,w=2*Math.PI*.9,zeta=.05,a=1.6*.22*9.81,re=wn*wn-w*w,im=2*zeta*wn*w,expected=-a*(re*Math.sin(w*t)-im*Math.cos(w*t))/(re*re+im*im);
 assert.ok(Math.abs(refs[5].current.x-expected)<1e-6,refs[5].current.x+' vs '+expected);
});
test('motion Runner cancels pending frames and repeated Play never starts a second loop',async()=>{
 const code=await readFile(new URL('../public/simulari/miscarea-rectilinie/js/core.js',import.meta.url),'utf8'),start=code.indexOf('class Runner {'),end=code.indexOf('MR.Runner = Runner;',start),queue=new Map();let seq=0;
 const Runner=vm.runInNewContext(code.slice(start,end)+';Runner',{performance:{now:()=>0},requestAnimationFrame:callback=>(queue.set(++seq,callback),seq),cancelAnimationFrame:id=>queue.delete(id),MR:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}});
 const runner=new Runner({T:10,onFrame(){}});runner.play();runner.play();assert.equal(queue.size,1);runner.pause();assert.equal(queue.size,0);runner.play();assert.equal(queue.size,1);runner.reset();assert.equal(queue.size,0);assert.equal(runner.t,0);assert.equal(runner.playing,false);
});
test('plane Huygens propagates continuously and changes all source centres only at a common handover',async()=>{
 const h=await startHuygens();h.click('plane');h.frame(0);h.frame(100);
 const wavelets=h.arcs.filter(a=>String(a.color).includes('rgba(')&&a.args[2]===7.5);assert.equal(wavelets.length,9);
 assert.ok(wavelets.every(a=>a.args[0]===140&&a.args[3]===0&&a.args[4]===2*Math.PI));
 assert.ok(h.segments.some(a=>a[0]==='M'&&a[1]===147.5));
 for(let t=200;t<=1100;t+=100)h.frame(t);
 assert.equal(h.refs[1].current.x,215);assert.equal(h.refs[1].current.time,1);assert.ok(Math.abs(h.refs[1].current.elapsed-.1)<1e-8);assert.equal(h.states[2],false);
 const centres=h.arcs.filter(a=>String(a.color).includes('rgba(')).map(a=>a.args[0]);assert.ok(centres.every(x=>x===215));
});

test('drum raw modal synthesis preserves frequencies, strike dynamics and headroom before calibration',()=>{
 const modes=array('lessonDrumModes'),bessel=vm.runInNewContext(fn('lessonBessel')+';lessonBessel');
 let cases=0,maxBound=0,centralBus=0,geometryCache;
 for(const frequency of [60,120,250])for(const strike of [0,.01,.1,.2,.35,.5,.7,.85,.95])for(const mode of ['all','0','1','2','3','4']){
  const gains=[],oscillators=[],states=[frequency,strike,mode,false,0,false];let stateIndex=0,memoIndex=0;
  const param=()=>({value:0,events:[],setValueAtTime(value,t){this.events.push(['set',value,t]);},linearRampToValueAtTime(value,t){this.events.push(['linear',value,t]);},exponentialRampToValueAtTime(value,t){this.events.push(['exp',value,t]);}});
  const ctx={state:'running',currentTime:0,destination:{},createGain(){const node={gain:param(),connect(target){this.target=target;},disconnect(){}};gains.push(node);return node;},createOscillator(){const node={frequency:{value:0},connect(target){this.target=target;},start(t){this.started=t;},stop(t){this.stopped=t;}};oscillators.push(node);return node;}};
  const N={useContext:()=>({active:true}),useState:()=>[states[stateIndex++],()=>{}],useRef:value=>({current:value}),useEffect(){},useMemo:f=>memoIndex++===0?(geometryCache??=f()):f()};
  const tree=vm.runInNewContext(fn('lessonBessel')+';'+fn('LessonDrum')+';LessonDrum()',{window:{PraxisWavesAudio:{instrumentOutput:(ctx,id,source)=>source}},N,wn:()=>false,LessonActivityContext:{},lessonDrumModes:modes,lessonUseEffect(){},t:jsx,f:jsx,de:()=>ctx});
  allNodes(tree).find(n=>n.props?.className==='lesson-drum-hit').props.onClick();
  const bus=gains[0];assert.equal(bus.gain.value,.72);assert.equal(bus.target,ctx.destination,'master-volume routing stays intact');
  let bound=0;
  oscillators.forEach(osc=>{const j=modes.findIndex(m=>Math.abs(osc.frequency.value-frequency*m.a/modes[0].a)<1e-8);assert.ok(j>=0);const expected=Math.abs(bessel(modes[j].m,modes[j].a*strike)/(1+j*.45))*.7;const peak=osc.target.gain.events.find(e=>e[0]==='linear')[1];assert.ok(Math.abs(peak-expected)<1e-10);assert.equal(osc.started,0);assert.ok(osc.stopped>0);bound+=peak*bus.gain.value;});
  assert.ok(bound<.9,'sum of modal peaks remains below full scale: '+bound);maxBound=Math.max(maxBound,bound);
  if(mode==='all'&&strike===0&&frequency===120){centralBus=bus.gain.value;assert.ok(bound>.7,'central strike has an audible signal');}
  if(strike===0&&['1','2','4'].includes(mode))assert.equal(oscillators.length,0,'nodal modes stay silent; no per-hit normalization');
  cases++;
 }
 for(let n=0;n<=950;n++){const strike=n/1000,bound=modes.reduce((sum,m,j)=>sum+Math.abs(bessel(m.m,m.a*strike)/(1+j*.45))*.7*.72,0);assert.ok(bound<.9,'headroom at strike '+strike);}
 assert.equal(cases,162);assert.ok(maxBound>.8);assert.ok(20*Math.log10(centralBus/.22)>10.2,'more than 10.2 dB gain over the old bus');
});
