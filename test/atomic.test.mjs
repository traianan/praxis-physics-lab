import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const code=await read('public/simulari/interactii-atomice/js/app.js');
test('atomic laboratory is searchable under heat and preserves source provenance and all quiz questions',async()=>{
 const [sim]=findSimulations('caldura-termodinamica','interactii atomice');assert.equal(sim.id,'interactii-atomice');
 assert.equal(findSimulations('fenomene-cuantice','interactii').length,0);
 assert.ok((await stat(new URL('../public/'+sim.image,import.meta.url))).size>100);
 const original=await read('sources/interactii-atomice/js/app.js'),report=JSON.parse(await read('docs/imported-atomic.json'));
 assert.equal(report.sha256.js,createHash('sha256').update(original).digest('hex'));
 const quiz=text=>text.match(/const Q = ([\s\S]*?);\s*let tried/)[1];
 assert.equal(quiz(code),quiz(original));assert.equal(vm.runInNewContext(quiz(code)).length,6);
 const model=text=>text.match(/const U = [\s\S]*?const F = [^;]*;/)[0];assert.equal(model(code),model(original));
});
test('Lennard-Jones force equals minus the energy derivative across the seven pairs and slider extremes',()=>{
 const atoms=vm.runInNewContext('('+code.match(/const ATOMS = ([\s\S]*?);\s*const PAIRS/)[1]+')');
 const pairs=vm.runInNewContext(code.match(/const PAIRS = ([^;]*);/)[1]);
 const parameters=pairs.map(([a,b])=>({sigma:(atoms[a].s+atoms[b].s)/2,eps:Math.sqrt(atoms[a].e*atoms[b].e)}));
 parameters.push({sigma:200,eps:20},{sigma:500,eps:300});
 const model=code.match(/const U = [\s\S]*?const F = [^;]*;/)[0];
 for(const st of parameters){
  const {U,F}=vm.runInNewContext(model+'\n({U,F})',{st}),r0=2**(1/6)*st.sigma;
  assert.ok(Math.abs(U(r0)+st.eps)<1e-10);assert.ok(Math.abs(F(r0))<1e-10);
  assert.ok(F(st.sigma)>0);assert.ok(F(2*st.sigma)<0);
  for(const scale of [.88,1,1.12,1.5,2,4]){const r=scale*st.sigma,h=r*1e-5,derivative=-(U(r+h)-U(r-h))/(2*h);assert.ok(Math.abs(F(r)-derivative)<1e-6*Math.max(1,Math.abs(F(r))));}
 }
});
test('atomic event cues obey shared mute and visibility, preserving pitch and duration',()=>{
 const calls=[],timers=[],window={PraxisSound:{startTone(options){calls.push(options);return ()=>calls.push('stop');}}},document={hidden:false};let hidden=false;
 const beep=vm.runInNewContext(code.match(/function beep\([\s\S]*?\n\}/)[0]+'\nbeep',{window,document,$:()=>({hidden}),setTimeout:(fn,ms)=>timers.push({fn,ms})});
 beep(880,.12,'triangle',.05);assert.equal(calls[0].frequency,880);assert.equal(calls[0].type,'triangle');assert.equal(timers[0].ms,120);timers[0].fn();assert.equal(calls[1],'stop');
 document.hidden=true;beep(300);assert.equal(timers.length,1);document.hidden=false;hidden=true;beep(400);assert.equal(timers.length,2);
 assert.doesNotMatch(code,/ia-sound|new .*AudioContext|serviceWorker\.register/);
});
test('force arrows on both atoms are equal and opposite and remain inside the scene',()=>{
 const body=code.match(/function forcePair\([\s\S]*?\n  \}/)[0];
 for(const force of [-100,-5,0,5,100])for(const [x0,xb,W]of [[90,300,356],[116,500,1000]]){
  const arrows=[],pair=vm.runInNewContext(body+'\nforcePair',{len:f=>Math.sign(f)*Math.min(42*Math.asinh(Math.abs(f)/2),180),x0,xb,W,ya:240,arrow:(...args)=>arrows.push(args)});
  pair(force,'green',7);assert.equal(arrows.length,2);
  const [right,left]=arrows;assert.ok(Math.abs((right[2]-right[0])+(left[2]-left[0]))<1e-10);
  assert.equal(right[1],left[1]);assert.equal(right[4],left[4]);
  for(const arrow of arrows){assert.ok(arrow[2]>=12&&arrow[2]<=W-12);assert.equal(arrow[1],247);}
 }
 assert.match(code,/forcePair\(F\(st.r\), COL.tot\)/);assert.match(code,/forcePair\(Fatt\(st.r\), COL.attr, -7\)/);assert.match(code,/forcePair\(Frep\(st.r\), COL.rep, 7\)/);
});
test('equilibrium action cancels velocity, pauses and preserves the selected atoms and parameters',()=>{
 const action=code.match(/\$\('#equilibrium'\)\.onclick = (\(\) => \{[\s\S]*?\n\});/)[1];
 for(const sigma of [200,275,340,440,500]){
  const st={sigma,eps:120,pair:6,r:600,v:73,drag:'atom',play:true,fm:'comp',zoom:2};let drawn=false;
  const handler=vm.runInNewContext('('+action+')',{st,setPlay:p=>st.play=p,draw:()=>drawn=true,beep:()=>{}});handler();
  assert.ok(Math.abs(st.r-2**(1/6)*sigma)<1e-10);assert.equal(st.v,0);assert.equal(st.play,false);assert.equal(st.drag,null);assert.equal(drawn,true);
  assert.equal(st.pair,6);assert.equal(st.eps,120);assert.equal(st.fm,'comp');assert.equal(st.zoom,2);
 }
});

test('atomic integration supplies every statically bound control before tab initialization',async()=>{
 const html=await read('public/simulari/interactii-atomice/index.html');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
 const bound=[...code.matchAll(/\$\('#([^']+)'\)\.(?:onclick\s*=|addEventListener\()/g)].map(match=>match[1]);
 assert.ok(bound.includes('equilibrium'));
 for(const id of bound)assert.ok(ids.has(id),'Missing control prevents script startup: '+id);
 for(const panel of ['sim','teorie','test','resurse']){assert.ok(ids.has(panel));assert.ok(ids.has('tab-'+panel));}
});
test('atomic offline archive exists and integrated page has no missing manifest or external dependencies',async()=>{
 const html=await read('public/simulari/interactii-atomice/index.html');
 assert.match(html,/data-praxis-laboratory/);assert.match(html,/initEmbedded/);assert.match(html,/shared\/atomic.css/);
 assert.doesNotMatch(html,/manifest.webmanifest|vendor\/|https?:\/\//);
 const zip=await readFile(new URL('../public/simulari/interactii-atomice/interactii-atomice.zip',import.meta.url));assert.equal(zip.readUInt32LE(),0x04034b50);
});
