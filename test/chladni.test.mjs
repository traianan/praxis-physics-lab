import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8'),window={};vm.runInNewContext(await read('public/shared/chladni-model.js'),{window});const M=window.PraxisChladniModel;
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
let basis;const getBasis=()=>basis??=M.createField(80);
test('Chladni import preserves the external source and all original controls without network dependencies',async()=>{
 const manifest=JSON.parse(await read('docs/imported-chladni.json'));assert.equal(createHash('sha256').update(await read(manifest.source)).digest('hex'),manifest.sha256);
 const html=await read('public/simulari/figuri-chladni/index.html');for(const id of ['cv','fr','sweep','snd','sp','amp','cnt','shake','ctr','mat','rad','thk','chips','modePick','play','save','vol'])assert.ok(html.includes(`id="${id}"`),id);
 assert.doesNotMatch(html,/(?:src|href)="https?:\/\/(?:fonts|cdn)/);assert.match(html,/initEmbedded/);assert.equal(M.MODES.length,19);assert.equal(findSimulations('sunete-si-unde','figuri chladni')[0].id,'figuri-chladni');
});
test('all nineteen eigenvalues satisfy both free-edge boundary conditions and the labeled radial-node counts',()=>{
 for(const mode of M.MODES){const [n,s,lambda2]=mode,x=Math.sqrt(lambda2),b=M.boundary(n,x),C=M.coefficient(n,x);close(b.mJ+C*b.mI,0,1e-9);assert.ok(Math.abs(b.vJ+C*b.vI)/(1+Math.abs(b.vJ)+Math.abs(C*b.vI))<2e-9,`shear ${n},${s}`);
  let last=M.radial(mode,.0001),nodes=0;for(let k=1;k<=2000;k++){const value=M.radial(mode,k/2000);if(value*last<0)nodes++;last=value;}assert.equal(nodes,s,`radial nodes ${n},${s}`);
 }
});
test('plate frequency scaling agrees with independent SI stiffness, thickness, radius and material calculations',()=>{
 const p={E:69e9,rho:2700,a:.1,h:.001},a=M.plate(p),D=69e9*1e-9/(12*(1-.33**2)),K=1/(2*Math.PI*.01)*Math.sqrt(D/(2700*.001));close(a.D,D);close(a.K,K);close(a.frequencies[1],9.068898661786182*K);
 for(let i=0;i<19;i++){close(M.plate({...p,h:.002}).frequencies[i]/a.frequencies[i],2);close(M.plate({...p,a:.15}).frequencies[i]/a.frequencies[i],4/9);close(M.plate({...p,E:200e9,rho:7850}).frequencies[i]/a.frequencies[i],Math.sqrt(200/7850/(69/2700)));}
});
test('central forcing excludes non-axisymmetric modes and rotating the exciter rotates the complete complex field',()=>{
 const B=getBasis(),fm=M.plate().frequencies;M.MODES.forEach((m,i)=>{const c=B.coupling(i,{x:0,y:0});if(m[0]>0)close(Math.hypot(c.c,c.s),0);else assert.ok(Math.abs(c.c)>0);});
 const f=fm[2],A=B.compute(f,fm,{x:.45,y:.25}),C=B.compute(f,fm,{x:-.25,y:.45});
 for(const [x,y]of [[.2,.3],[-.4,.5],[.6,.1],[-.1,-.6]])close(M.sample(A.field,B.G,x,y),M.sample(C.field,B.G,-y,x),2e-6);
 assert.ok(A.field.every(v=>Number.isFinite(v)&&v>=0&&v<=1.000001));
});
test('harmonic response has the correct resonance phase and limiting static response',()=>{
 const r=M.response(100,100);close(r.re,0);close(r.im,-M.Q);close(r.gain,M.Q);const zero=M.response(0,100);close(zero.re,1);close(zero.im,0);assert.ok(M.response(1000,100).re<0);
});
test('nodal guides contain exactly the advertised radial circles at zeros of the mode shape',()=>{
 const B=getBasis();M.MODES.forEach((m,i)=>{assert.equal(B.basis[i].nodes.length,m[1]);for(const r of B.basis[i].nodes){assert.ok(r>0&&r<1);close(M.radial(m,r),0,2e-9);}});
});
test('resonance selection stays on the requested mode even with weak off-center excitation',()=>{
 const B=getBasis(),fm=M.plate().frequencies;for(const point of [{x:.45,y:.25},{x:.02,y:0}])for(let i=0;i<M.MODES.length;i++){const c=B.coupling(i,point);if(Math.hypot(c.c,c.s)<1e-7)continue;const selection=B.nearest(fm[i],fm,point);assert.equal(selection.mode,i);assert.equal(selection.near,true);}
 const selection=B.nearest(fm[0],fm,{x:0,y:0});assert.equal(selection.near,false);
});
test('choosing a resonance restarts paused sand, resets its distribution and brings the disk into view',async()=>{
 const app=await read('public/shared/chladni.js'),start=app.indexOf('function choose('),end=app.indexOf(' function compute(',start),events=[];
 const context={playing:false,last:999,frequencies:[123,456],sand:{scatter:()=>events.push('scatter')},stopSweep:()=>events.push('stopSweep'),setF:f=>events.push(['frequency',f]),compute:()=>events.push('compute'),buttons:()=>events.push('buttons'),audio:()=>events.push('audio'),draw:()=>events.push('draw'),canvas:{scrollIntoView:options=>events.push(['scroll',options.block])}};
 vm.createContext(context);vm.runInContext(app.slice(start,end),context);vm.runInContext('choose(1)',context);
 assert.equal(context.playing,true);assert.equal(context.last,null);assert.ok(events.includes('scatter'));assert.ok(events.some(e=>Array.isArray(e)&&e[0]==='frequency'&&e[1]===456));assert.equal(events.at(-2),'draw');assert.deepEqual(events.at(-1),['scroll','center']);
 const count=events.length;vm.runInContext('choose(-1);choose(500)',context);assert.equal(events.length,count);
});
test('frequency reset stops the sweep, restores the range minimum and leaves a mixed, idle scene',async()=>{
 const app=await read('public/shared/chladni.js'),start=app.indexOf('function resetFrequency('),end=app.indexOf(' function labels(',start),events=[];
 const context={playing:true,last:500,$:id=>id==='fr'?{min:'1'}:null,stopSweep:()=>events.push('stopSweep'),setF:f=>events.push(['frequency',f]),sand:{scatter:()=>events.push('scatter')},compute:()=>events.push('compute'),buttons:()=>{},audio:()=>{},draw:()=>events.push('draw')};
 vm.createContext(context);vm.runInContext(app.slice(start,end),context);vm.runInContext('resetFrequency()',context);assert.equal(context.playing,false);assert.equal(context.last,null);assert.deepEqual(events,["stopSweep",["frequency",1],"scatter","compute","draw"]);
});
test('sand uses a fixed clock at 30, 60 and 120 Hz, remains inside the disk and conserves grain count',()=>{
 const B=getBasis(),r=B.compute(M.plate().frequencies[1],M.plate().frequencies,{x:0,y:0}),results=[];
 for(const fps of [30,60,120]){const p=M.createParticles(400,123);for(let i=0;i<fps*2;i++)p.advance(1/fps,r.field,B.G,r.strength,.7);assert.equal(p.count,400);for(let i=0;i<p.count;i++)assert.ok(Math.hypot(p.x[i],p.y[i])<.986);results.push(p);}
 for(const p of results.slice(1)){assert.deepEqual([...p.x],[...results[0].x]);assert.deepEqual([...p.y],[...results[0].y]);}
});
test('sand accumulates at low-amplitude regions while a zero drive leaves every grain unchanged',()=>{
 const B=getBasis(),r=B.compute(M.plate().frequencies[1],M.plate().frequencies,{x:0,y:0}),p=M.createParticles(1000,7),mean=()=>[...p.x].reduce((sum,x,i)=>sum+M.sample(r.field,B.G,x,p.y[i]),0)/p.count,before=mean();
 for(let i=0;i<360;i++)p.advance(1/60,r.field,B.G,r.strength,.7);assert.ok(mean()<before*.65,`${mean()} vs ${before}`);
 const x=[...p.x],y=[...p.y];for(let i=0;i<60;i++)p.advance(1/60,r.field,B.G,0,1);assert.deepEqual([...p.x],x);assert.deepEqual([...p.y],y);
});
