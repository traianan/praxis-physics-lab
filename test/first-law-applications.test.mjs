import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const id='principiul-i-aplicatii',dir='public/simulari/'+id+'/';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8*Math.max(1,Math.abs(expected)),`${actual} ≠ ${expected}`);
async function simulation(){
 const html=await read(dir+'index.html'),canvases=new Map();
 const context=new Proxy({measureText:text=>({width:String(text).length*7}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 for(const match of html.matchAll(/<canvas\b[^>]*>/g)){
  const attr=name=>match[0].match(new RegExp(name+'="([^"]+)"'))?.[1];
  const canvas={width:+attr('width'),height:+attr('height'),displayWidth:+attr('width'),style:{},dataset:{},getBoundingClientRect(){return {width:this.displayWidth};},getAttribute(key){return String(this[key]);},getContext:()=>context};
  canvases.set(attr('id'),canvas);
 }
 const window={devicePixelRatio:1,Sound:{impacts(){},engine(){},play(){}},I18N:{lang:'ro',t:k=>k}};
 const sandbox=vm.createContext({window,document:{getElementById:id=>canvases.get(id)||null,querySelectorAll:selector=>selector==='canvas'?[...canvases.values()]:[]}});
 vm.runInContext(await read('public/shared/first-law-applications-canvas.js'),sandbox);vm.runInContext(await read('public/shared/molecular-degrees.js'),sandbox);vm.runInContext(await read(dir+'js/math.js'),sandbox);vm.runInContext(await read(dir+'js/sims.js'),sandbox);window.Sims.init();
 return {window,canvases};
}
test('applications retain source provenance, eleven topics, nine simulations and all bilingual questions',async()=>{
 const report=JSON.parse(await read('docs/imported-first-law-applications.json'));
 for(const file of report.files)assert.equal(createHash('sha256').update(await read(id+'/'+file.path)).digest('hex'),file.sha256);
 const [sim]=findSimulations('caldura-termodinamica','aplicatii principiul');assert.equal(sim.id,id);await stat(new URL('../public/'+sim.image,import.meta.url));
 const html=await read(dir+'index.html');assert.equal((html.match(/class="view/g)||[]).length,11);assert.equal((html.match(/<canvas /g)||[]).length,9);
 assert.match(html,/shared\/course.js/);assert.match(html,/initEmbedded/);assert.doesNotMatch(html,/(?:src|href)="https?:/);
 for(const lang of ['ro','en']){
  const data=JSON.parse(await read('public/locales/courses/'+id+'/content/'+lang+'.json'));
  assert.equal(data.questions.length,13);assert.equal(Object.keys(data.steps).length,6);
  for(const q of data.questions){assert.ok(q.text.q);assert.ok(q.text.why);if(q.type==='mc')assert.ok(q.text.opts[q.ok]);else assert.ok(Number.isFinite(q.ok));}
 }
});
test('heat, work and internal energy obey independent ideal-gas balances at control extremes',async()=>{
 const {window:w}=await simulation(),R=8.314;
 const ic=w.Sims.get('izocor');for(const pct of [0,20,100]){ic.setQ(pct);const s=ic.draw(0);close(s.Q,pct*20);close(s.dU,s.Q);close(s.L,0);}
 const ib=w.Sims.get('izobar');for(const T of [300,400,650])for(const p of [50000,100000,250000]){ib.set(T,p);const s=ib.draw(0);close(p*s.V,ib.nu*R*T);close(s.Q,s.dU+s.L);close(s.L,ib.nu*R*(T-ib.Ti));}
 const it=w.Sims.get('izoterm');for(const V of [10,20,60]){it.set(V,2);const s=it.draw(0);close(s.L,2*R*300*Math.log(V/10));close(s.pi*it.Vi,2*R*300);close(s.pf*V/1000,2*R*300);}
 const ad=w.Sims.get('adiabat');for(const gamma of [1.3,1.4,5/3])for(const ratio of [1,2,4]){ad.set(gamma,ratio);const s=ad.draw(0);close(s.pr,ratio**(-gamma));close(s.Tf,300*ratio**(1-gamma));close(s.dU,.5*R/(gamma-1)*(s.Tf-300));close(s.L,-s.dU);}
});
test('pixel-ratio changes never alter logical canvas dimensions and hidden simulations do not advance',async()=>{
 const {window:w,canvases}=await simulation();const names=['mol','chart141','izocor','izobar','izoterm','adiabat','synth','ratio','politrop'];
 const sizes=new Map([...canvases].map(([id,c])=>[id,[c.width,c.height]]));
 for(const [scale,dpr]of [[1,2],[1.6,1.5],[.75,1],[2,2],[1,3]]){w.devicePixelRatio=dpr;for(const [id,c]of canvases)c.displayWidth=sizes.get(id)[0]*scale;w.Sims.resize();for(let i=0;i<4;i++)for(const name of names)w.Sims.get(name).draw(0);for(const [id,c]of canvases){assert.equal(c.width,Math.round(sizes.get(id)[0]*scale*dpr));assert.equal(c.height,Math.round(sizes.get(id)[1]*scale*dpr));close(+c.dataset.logicalWidth,sizes.get(id)[0]);close(+c.dataset.logicalHeight,sizes.get(id)[1]);}}
 const ic=w.Sims.get('izocor');ic.running=true;w.Sims.show('izocor',false);const t=ic.runT;w.Sims.frame(.05);assert.equal(ic.runT,t);w.Sims.show('izocor',true);w.Sims.frame(.05);assert.ok(ic.runT>t);
});
test('polytropic isobaric, isothermal and linear limits preserve their defining invariants',async()=>{
 const {window:w}=await simulation(),pol=w.Sims.get('politrop'),Vi=.008,pi=150000;
 for(const V of [.004,.008,.024]){close(pol.curve(0,Vi,pi,V),pi);close(pol.curve(1,Vi,pi,V)*V,pi*Vi);close(pol.curve(-1,Vi,pi,V)/V,pi/Vi);close(pol.curve(1.4,Vi,pi,V)*V**1.4,pi*Vi**1.4);}
});

test('molecular orientation is static until a manual action and rotational limits stay physical',async()=>{
 const {window:w}=await simulation(),mol=w.Sims.get('mol');
 const initial=[mol.yaw,mol.pitch];w.Sims.show('mol',true);for(let n=0;n<120;n++)w.Sims.frame(1/60);
 assert.deepEqual([mol.yaw,mol.pitch],initial);
 mol.set('di');mol.rotate(.5,.2);assert.notDeepEqual([mol.yaw,mol.pitch],initial);
 const changed=[mol.yaw,mol.pitch];for(let n=0;n<60;n++)w.Sims.frame(1/60);assert.deepEqual([mol.yaw,mol.pitch],changed);
 for(const [kind,translations,rotations]of [['mono',3,0],['di',3,2],['poly',3,3]]){mol.set(kind);assert.equal(mol.data[kind].i,translations+rotations);}
});

test('isothermal compression has negative work and reverses the initial and final pressures',async()=>{
 const {window:w}=await simulation(),iso=w.Sims.get('izoterm');iso.set(20,2);iso.start(-1);
 for(let i=0;i<200;i++)iso.draw(.05);
 const state=iso.draw(0);assert.ok(state.L<0);close(state.L,-2*8.314*300*Math.log(2));close(state.pf,2*state.pi);close(state.T,300);
});

test('rigid molecule preserves bond lengths with two diatomic and three nonlinear rotation controls',async()=>{
 const {window:w}=await simulation(),mol=w.Sims.get('mol');mol.set('di');
 for(const axis of ['y','z']){mol.axis=axis;mol.rotate(.7);const a=mol.transform([-40,0,0]),b=mol.transform([40,0,0]),ox=mol.transform([1,0,0]);for(let n=0;n<3;n++)close(b[n]-a[n],80*ox[n]);close(Math.hypot(...b.map((v,n)=>v-a[n])),80);}
 mol.axis='x';mol.rotate(.4);assert.equal(mol.roll,0);
 const pose=[mol.yaw,mol.pitch,mol.roll];mol.translate(23,-17);assert.deepEqual([mol.yaw,mol.pitch,mol.roll],pose);assert.deepEqual({...mol.pan},{x:23,y:-17});
 mol.set('poly');const before=mol.transform([0,58,0]);mol.axis='x';mol.rotate(.5);assert.notDeepEqual(mol.transform([0,58,0]),before);close(Math.hypot(...mol.transform([0,58,0])),58);
 mol.reset();assert.deepEqual({...mol.pan},{x:0,y:0});
});

test('reference axes stay fixed while atoms rotate about the selected world axis',async()=>{
 const {window:w}=await simulation(),mol=w.Sims.get('mol');mol.set('poly');mol.reset();
 const project=mol.project,drawn=[];mol.project=function(point,...args){const value=project.call(this,point,...args);drawn.push({...value});return value;};
 mol.draw(0);const axes=drawn.slice(0,3),atoms=drawn.slice(3);drawn.length=0;
 mol.axis='y';mol.rotate(Math.PI/2);mol.draw(0);
 assert.deepEqual(drawn.slice(0,3),axes);assert.notDeepEqual(drawn.slice(3),atoms);
 let v=mol.transform([1,0,0]);close(v[0],0);close(v[1],0);close(v[2],-1);
 mol.axis='x';mol.rotate(Math.PI/2);v=mol.transform([1,0,0]);
 close(v[0],0);close(v[1],1);close(v[2],0);
 mol.reset();v=mol.transform([1,0,0]);close(v[0],1);close(v[1],0);close(v[2],0);
 mol.set('di');const pose=mol.transform([40,0,0]);mol.axis='x';mol.rotate(.6);assert.deepEqual(mol.transform([40,0,0]),pose);
});

test('every imported and worked-solution formula parses in the local mathematical renderer',async()=>{
 const sandbox={};vm.runInNewContext(await read(dir+'vendor/katex/katex.min.js'),sandbox);
 const html=await read(dir+'index.html'),sources=[...html.matchAll(/data-fx(?:-inline)?="([^"]+)"/g)].map(match=>match[1].replaceAll('&amp;','&'));
 for(const lang of ['ro','en']){const content=JSON.parse(await read('public/locales/courses/'+id+'/content/'+lang+'.json'));for(const steps of Object.values(content.steps))for(const step of steps)sources.push(...(step.f||[]));}
 assert.ok(sources.length>80);
 for(const source of sources){const rendered=sandbox.katex.renderToString(source,{throwOnError:true,trust:false});assert.match(rendered,/katex/);}
});
