import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {findSimulations,getHomeSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function model(){const window={};vm.runInNewContext(await read('public/shared/first-law-model.js'),{window});return window.PraxisFirstLawModel;}
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),a+' ≠ '+b);
test('first law and all three ideal gas laws preserve the signed SI balances at slider extremes',async()=>{
 const m=await model();for(const Q of [-2000,0,500,2000])for(const L of [-2000,0,200,2000])close(m.firstLaw(Q,L),Q-L);
 for(const V of [.005,.02,.04])close(m.isothermal(V)*V,2026.5);
 for(const T of [200,273.15,300,500]){close(m.isobaric(T)/T,.0224/273.15);close(m.isochoric(T)/T,101325/273.15);}
 for(const ratioP of [.5,1,2])for(const ratioV of [.25,1,3]){const T2=m.general(101325,.0224,273.15,101325*ratioP,.0224*ratioV);close(T2,273.15*ratioP*ratioV);}
});
test('the four exercise calculators match independent hydrostatic, thermal expansion and force balances',async()=>{
 const m=await model(),rho=13600,g=9.81;
 close(m.openTube(2,22.2,23.4),rho*g*.02*(23.4+22.2)/(23.4-22.2));
 const l0=(60-10)/2;close(m.closedTube(60,10,5),rho*g*.10*(l0*l0-5*5)/(2*l0*5));
 close(m.expansion(17,162),145/290.15*100);close(m.stopper(290,3,3.16,9),290*(101325+12.16/.0003)/101325);
});
test('equation of state solves each missing variable and rejects unphysical or ambiguous input',async()=>{
 const m=await model(),state={p:101325,V:m.R*273.15/101325,nu:1,T:273.15};close(m.state(...Object.values(state)).relativeError,0);
 for(const key of Object.keys(state)){const answer=m.solve({...state,[key]:null});assert.equal(answer.key,key);close(answer.value,state[key]);}
 for(const action of [()=>m.firstLaw(NaN,1),()=>m.general(1,0,300,2,2),()=>m.isothermal(-1),()=>m.isochoric(0),()=>m.openTube(2,24,22),()=>m.closedTube(60,10,25),()=>m.expansion(-273.15,20),()=>m.stopper(290,0,1,1),()=>m.stopper(290,3,-1,1),()=>m.state(1,1,0,1),()=>m.solve(state),()=>m.solve({...state,p:null,V:null}),()=>m.solve({...state,p:null,T:-1})])assert.throws(action);
});
test('the original first-law lesson is preserved and its six topics are registered under heat',async()=>{
 const manifest=JSON.parse(await read('docs/imported-first-law.json'));const original=await read('sources/principiul-i-al-termodinamicii/original.html');assert.equal(createHash('sha256').update(original).digest('hex'),manifest.sha256);
 const body=(await read('public/simulari/principiul-i-al-termodinamicii/index.html')).split('<body')[1];assert.equal((body.match(/<section /g)||[]).length,6);assert.equal((body.match(/<canvas /g)||[]).length,12);assert.doesNotMatch(body,/manual|Mantea|Garabet|1\.3\.\d|fonts\.googleapis/);
 assert.equal(findSimulations('caldura-termodinamica').length,8);assert.equal(findSimulations('caldura-termodinamica','principiul').length,2);assert.equal(getHomeSimulations().filter(s=>s.chapter==='caldura-termodinamica').length,2);
});

test('all three projections preserve every simple process and the orientations of its constant coordinates',async()=>{
 const m=await model();
 for(const [kind,values]of [['boyle',[5,20,40]],['gay',[200,300,500]],['charles',[200,300,500]]]){
  const states=values.map(v=>m.processState(kind,v));for(const state of states){for(const plane of ['pv','vt','pt']){const point=m.project(state,plane);close(point.x,plane==='pv'?state.V*1000:state.T);close(point.y,plane==='vt'?state.V*1000:state.p/1000);}close(state.p*state.V/state.T,states[0].p*states[0].V/states[0].T);}
  const points=plane=>states.map(s=>m.project(s,plane));
  if(kind==='boyle'){assert.equal(new Set(points('vt').map(p=>p.x)).size,1);assert.equal(new Set(points('pt').map(p=>p.x)).size,1);}
  if(kind==='gay'){assert.equal(new Set(points('pv').map(p=>p.y)).size,1);assert.equal(new Set(points('pt').map(p=>p.y)).size,1);}
  if(kind==='charles'){assert.equal(new Set(points('pv').map(p=>p.x)).size,1);assert.equal(new Set(points('vt').map(p=>p.y)).size,1);}
 }
});
