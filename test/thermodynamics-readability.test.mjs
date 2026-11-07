import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {thermoReadability} from '../scripts/adaptations/thermodynamics-readability.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const noop=()=>{};
const context=()=>new Proxy({},{get:(obj,key)=>obj[key]??noop,set:(obj,key,value)=>(obj[key]=value,true)});

test('calorimetry displayed internal energy follows heating and returns to zero after cooling',async()=>{
 const source=thermoReadability('calorimetry','js/figuri-1.js',await read('sources/calorimetrie/site/js/figuri-1.js'));
 const block=source.slice(source.indexOf('(()=>{const S=new Sim(\'#fig2\''),source.indexOf('/* ---------- Fig. 3'));
 for(const mode of ['izo','bar']){
  let sim;const window={};const readings={};
  const sandbox={window,Math,Sim:function(){sim=this;this.p={Ti:300,dT:60};this.mode=mode;this.time=0;this.out=(key,value)=>readings[key]=value;},TAU:Math.PI*2,COL:{},MONO:'12px monospace',SERIF:()=>'',clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),lerp:(a,b,t)=>a+(b-a)*t,f:(n,d)=>n.toFixed(d),heat:()=>'',grid:noop,txt:noop,line:noop,dot:noop,flame:noop,rrect:noop,SND:{whoosh:noop,chime:noop},axes:()=>({X:x=>x,Y:y=>y})};
  vm.runInNewContext(block.replace('bars.forEach','window.bars=bars;bars.forEach'),sandbox);
  const draw=()=>sim.draw(context(),800,500),delta=()=>window.bars.find(row=>row[1]==='ΔU')[0];
  sim.act('heat');sim.step(.65);draw();assert.ok(Math.abs(delta()-1.5*8.31*15)<1e-9);assert.equal(readings.dU,delta().toFixed(0)+' J');
  sim.step(1.95);draw();assert.ok(Math.abs(delta()-1.5*8.31*60)<1e-9);
  sim.act('cool');sim.step(1.3);draw();assert.ok(Math.abs(delta()-1.5*8.31*30)<1e-9);
  sim.step(1.3);draw();assert.equal(delta(),0);assert.equal(readings.dU,'0 J');
  const heatIn=Number.parseFloat(readings.Qif),heatOut=Number.parseFloat(readings.Qfi);
  assert.ok(Math.abs(heatIn+heatOut+(mode==='bar'?8.31*60:0))<1);
 }
});

test('polytrope preserves p V^n and renders decimal exponents and the isochoric limit in DOM',async()=>{
 const source=await read('sources/principiul-i-aplicatii/js/sims.js');
 const block=source.slice(source.indexOf('  var Politrop = {'),source.indexOf('  /* =============== 10.'));
 const formula={},canvas={};const formulas=[];
 const global={Util:{clamp:(x,a,b)=>Math.max(a,Math.min(b,x))},PraxisMath:{set:(el,raw,options)=>formulas.push({raw,options})}};
 const sandbox={global,document:{getElementById:id=>id==='polCanvas'?canvas:formula},Math,COL:{},fmt:(n,d)=>n.toFixed(d).replace('.',','),fit:()=>({g:context(),w:440,h:320}),grid:noop,axes:noop,txt:noop};
 vm.runInNewContext(block+';global.polytrope=Politrop;',sandbox);
 const p=global.polytrope;p.init();
 for(const n of [-1,0,1,1.4,2.3]){
  p.set(n);p.draw();assert.equal(formulas.at(-1).raw,`pV^{${n.toFixed(2).replace('.',',')}}=\\mathrm{const.}`);
  for(const volume of [.004,.008,.016,.032])assert.ok(Math.abs(p.curve(n,.008,150000,volume)*volume**n/(150000*.008**n)-1)<1e-12);
 }
 p.set(3);p.draw();assert.equal(formulas.at(-1).raw,'V=\\mathrm{const.}');
});
