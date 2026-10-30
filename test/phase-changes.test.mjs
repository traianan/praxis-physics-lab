import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {findSimulations} from '../public/catalog.js';
const id='transformari-stare-agregare',dir='public/simulari/'+id+'/',read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} ≠ ${b}`);
async function simulation(){
 const html=await read(dir+'index.html'),canvases=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:text=>({width:String(text).length*6}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
 for(const match of html.matchAll(/<canvas\b[^>]*>/g)){const attr=key=>match[0].match(new RegExp(key+'="([^"]+)"'))?.[1],canvas={width:+attr('width'),height:+attr('height'),displayWidth:+attr('width'),style:{},dataset:{},getAttribute(key){return String(this[key]);},getBoundingClientRect(){return {width:this.displayWidth};},getContext:()=>ctx};canvases.set(attr('id'),canvas);}
 const window={devicePixelRatio:1,Sound:{play(){},beat(){}},I18N:{lang:'ro',t:key=>key}},sandbox=vm.createContext({window,document:{getElementById:id=>canvases.get(id)||null}});
 for(const path of ['public/shared/first-law-applications-canvas.js','public/shared/boiling-experiment.js','public/shared/andrews.js',dir+'js/math.js',dir+'js/sims.js'])vm.runInContext(await read(path),sandbox);
 window.Sims.init();return {window,canvases};
}
test('phase changes preserve original assets and expose all topics, problems and bilingual quiz questions',async()=>{
 const report=JSON.parse(await read('docs/imported-phase-changes.json'));
 for(const file of report.files)assert.equal(createHash('sha256').update(await read(report.source+'/'+file.path)).digest('hex'),file.sha256);
 const [sim]=findSimulations('caldura-termodinamica','transformari agregare');assert.equal(sim.id,id);await stat(new URL('../public/'+sim.image,import.meta.url));
 const html=await read(dir+'index.html');assert.equal((html.match(/class="view/g)||[]).length,12);assert.equal((html.match(/<canvas /g)||[]).length,11);assert.match(html,/shared\/phase-changes.js/);assert.match(html,/view-lichefiere/);
 for(const lang of ['ro','en']){const data=JSON.parse(await read('public/locales/courses/'+id+'/content/'+lang+'.json'));assert.equal(data.questions.length,15);assert.equal(Object.keys(data.steps).length,2);assert.doesNotMatch(JSON.stringify(data),/manualul|textbook|subcapitol|subchapter|Mantea|Garabet|pagina|\b1\.5\.\d/);for(const q of data.questions){assert.ok(q.text.q);assert.ok(q.text.why);if(q.type==='mc')assert.ok(q.text.opts[q.ok]);else assert.ok(Number.isFinite(q.ok));}}
});
test('heating curve and five heat stages agree with independent energy balances',async()=>{
 const {window:w}=await simulation(),inc=w.Sims.get('inc'),stages=w.Sims.get('etapa');
 for(const m of [.05,.1,.5]){inc.set({m,amorph:false});const cold=m*2090*20,latent=m*334000;close(inc.Tof(cold/2),-10);close(inc.Tof(cold+latent/2),0);close(inc.frac(cold+latent/2),.5);close(inc.Tof(cold+latent+m*4181*40),40);close(inc.Tof(inc.Emax()),100);inc.set({amorph:true});close(inc.Tof(inc.Emax()),100);stages.m=m;stages.Tf=100;close(stages.report().Q,m*(2090*10+334000+4181*100));stages.Tf=120;close(stages.report().Q,m*(2090*10+334000+4181*100+2260000+2010*20));}
});
test('saturation pressure, latent heat and triple-point boundaries respect their physical limits',async()=>{
 const {window:w}=await simulation(),p=w.Sims.phys,f=w.Sims.get('faze');
 close(p.LV0,2500000);close(p.LT,334000);assert.ok(Math.abs(p.psatW(100)-760)<6);assert.ok(p.psatW(20)<p.psatW(80));
 for(const t of [5,25,80,100,180])assert.ok(Math.abs(p.tsatW(p.psatW(t))-t)<.5);
 close(f.psatPa(p.T_TR),p.P_TR);close(f.tm(p.P_TR),p.T_TR);
 f.TK=p.T_TR;f.p=Math.log10(p.P_TR)/7*100;assert.equal(f.classify().st,'st.triplu');
 f.TK=250;const icePressure=f.psatPa(250);f.p=Math.log10(icePressure)/7*100;assert.equal(f.classify().st,'st.solidvapori');f.p=Math.log10(icePressure*2)/7*100;assert.equal(f.classify().st,'st.solid');f.p=Math.log10(icePressure/2)/7*100;assert.equal(f.classify().st,'st.vapori');
 f.TK=300;f.p=Math.log10(101325)/7*100;assert.equal(f.classify().st,'st.lichid');f.TK=390;assert.equal(f.classify().st,'st.vapori');
 f.p=100;f.TK=f.tm(1e7);assert.equal(f.classify().st,'st.solidlichid');f.TK+=.1;assert.ok(f.TK<p.T_TR);assert.equal(f.classify().st,'st.lichid');
});
test('repeated canvas density changes keep all eleven logical scenes stable and hidden clocks paused',async()=>{
 const {window:w,canvases}=await simulation(),names=['inc','etapa','anom','bars','tub','echi','evap','fierb','psat','faze','andrews'],sizes=new Map([...canvases].map(([id,c])=>[id,[c.width,c.height]]));
 for(const [scale,dpr]of [[1.5,2],[.7,3],[1,1],[2,2]]){w.devicePixelRatio=dpr;for(const [id,c]of canvases)c.displayWidth=sizes.get(id)[0]*scale;for(const name of names)w.Sims.get(name).draw(0);for(const [id,c]of canvases){assert.equal(c.width,Math.round(sizes.get(id)[0]*scale*dpr));close(+c.dataset.logicalWidth,sizes.get(id)[0]);assert.equal(c.height,Math.round(sizes.get(id)[1]*scale*dpr));}}
 const inc=w.Sims.get('inc');inc.run=true;w.Sims.show('inc',false);const E=inc.E;w.Sims.frame(.05);close(inc.E,E);w.Sims.show('inc',true);w.Sims.frame(.05);assert.ok(inc.E>E);
});
test('evaporation cools through latent heat and vacuum boiling can fall below room temperature',async()=>{
 const {window:w}=await simulation(),ev=w.Sims.get('evap'),fi=w.Sims.get('fierb');
 ev.T0=ev.amb;ev.reset();ev.run=true;const start=ev.T;ev.draw(.05);assert.ok(ev.T<start);assert.ok(ev.lost>0);close((start-ev.T)*(ev.mass)*4181,ev.lost*2450000);
 for(let i=0;i<100;i++)ev.draw(.05);assert.ok(ev.lost<ev.mass);assert.ok(ev.T>=273.16);
 ev.run=false;const saved=[ev.T,ev.lost];ev.draw(.05);assert.deepEqual([ev.T,ev.lost],saved);
 fi.prepare('syringe');const pBefore=fi.pExt();fi.pull();assert.ok(fi.pExt()<pBefore);fi.advance(.5);assert.ok(fi.T<25);assert.ok(fi.out.boil);
});
test('worked answers and every formula parse consistently in the local renderer',async()=>{
 const sandbox={};vm.runInNewContext(await read(dir+'vendor/katex/katex.min.js'),sandbox);
 const html=await read(dir+'index.html'),formulas=[...html.matchAll(/data-fx(?:-inline)?="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
 for(const lang of ['ro','en']){const data=JSON.parse(await read('public/locales/courses/'+id+'/content/'+lang+'.json'));close(data.questions[2].ok,.1*(2090*10+334000+4181*100));close(data.questions[11].ok,2500000/(2500000+334000));for(const steps of Object.values(data.steps))for(const step of steps)formulas.push(...step.f);}
 assert.equal(formulas.length,43);for(const f of formulas)assert.match(sandbox.katex.renderToString(f,{throwOnError:true,trust:false}),/katex/);
});

test('sealed syringe expansion follows the gas law and conserves mass and latent heat',async()=>{
 const {window:w}=await simulation(),s=w.Sims.get('fierb'),{M,CP}=w.PraxisBoilingExperiment.constants,L=w.PraxisBoilingExperiment.latentHeat;
 s.prepare('syringe');const initial={T:s.T,p:s.pExt(),V:s.volume,m:s.mass,n:s.vapour,total:s.mass+s.vapour*M};s.pull();
 close(s.pExt(),initial.p*initial.V/s.volume);assert.equal(s.q,0);assert.ok(s.out.boil===false); // Flow starts on the next physical step.
 s.advance(.05);assert.ok(s.out.boil);assert.ok(s.T<initial.T);close(s.mass+s.vapour*M,initial.total);close((initial.T-s.T)*s.mass*CP,(s.vapour-initial.n)*M*L(initial.T));
 const earlyP=s.pExt();s.advance(12);assert.ok(s.pExt()>earlyP);assert.equal(s.out.boil,false);assert.ok(s.T<25&&s.T>24);close(s.mass+s.vapour*M,initial.total);
 s.push();assert.equal(s.pulled,false);assert.equal(s.out.boil,false);assert.ok(Math.abs(s.pExt()-760)<1);assert.ok(s.T>24.99);close(s.mass+s.vapour*M,initial.total);
});

test('heated vessel reaches the pressure-dependent plateau and supplied heat vaporises water',async()=>{
 const {window:w}=await simulation(),s=w.Sims.get('fierb'),model=w.PraxisBoilingExperiment;close(model.psatW(100),760);close(model.tsatW(760),100);close(model.latentHeat(100),2260000);for(const p of [5,15,25,760,1200])close(model.psatW(model.tsatW(p)),p);
 s.prepare('heat');const initial=s.mass;s.running=true;s.advance(100);assert.ok(s.out.boil);close(s.T,s.Tb());assert.ok(s.mass<initial);const plateau=s.T,mass=s.mass;s.advance(10);close(s.T,plateau);assert.ok(s.mass<mass);
 s.q=0;s.advance(10);assert.equal(s.out.boil,false);assert.ok(s.T<plateau);s.setPressure(100);s.q=60;s.advance(30);close(s.T,s.Tb());assert.ok(s.T<60);
});

test('pause, reset and hidden-topic navigation keep the syringe protocol state coherent',async()=>{
 const {window:w}=await simulation(),s=w.Sims.get('fierb');s.prepare('syringe');s.pull();s.advance(.5);s.running=false;const before=[s.time,s.T,s.mass,s.pExt()];s.advance(5);assert.deepEqual([s.time,s.T,s.mass,s.pExt()],before);
 s.running=true;w.Sims.show('fierb',false);w.Sims.frame(.1);close(s.time,before[0]);w.Sims.show('fierb',true);w.Sims.frame(.1);close(s.time,before[0]+.1);
 s.reset();assert.equal(s.mode,'syringe');assert.equal(s.q,0);assert.equal(s.time,0);assert.equal(s.pulled,false);assert.equal(s.running,false);assert.equal(s.T,25);
 const html=await read(dir+'index.html');for(const id of ['boilRun','boilPush','fieSyringe','boilHeatingControls','boilPressure','boilTime','boilEvents'])assert.match(html,new RegExp('id="'+id+'"'));assert.match(html,/boil.protocol.4/);
});

test('equilibrium particles are clamped inside the vessel and rebound inward without edge jitter',async()=>{
 const {window:w}=await simulation(),e=w.Sims.get('echi');
 e.parts=[{x:-40,y:-40,vx:-2,vy:-3}];e.draw(0);const p=e.parts[0];assert.equal(p.x,44);assert.equal(p.y,64);assert.ok(p.vx>0&&p.vy>0);
 const x=p.x,y=p.y;e.draw(.001);assert.ok(p.x>x&&p.y>y);
});
