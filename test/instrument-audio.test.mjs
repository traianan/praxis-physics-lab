import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function setup(){
 const timers=[],events={},nodes=[];let enabled=true;
 const param=()=>({value:0,events:[],setTargetAtTime(value,t,s){this.value=value;this.events.push(['target',value,t,s]);},cancelScheduledValues(t){this.events.push(['cancel',t]);}});
 class AudioNode{constructor(context,type){this.context=context;this.type=type;this.connections=[];nodes.push(this);}connect(target){this.connections.push(target);return target;}disconnect(){this.connections=[];this.disconnected=true;}}
 class AudioContext{constructor(){this.destination={};this.currentTime=1;this.state='running';}createGain(){const n=new AudioNode(this,'gain');n.gain=param();return n;}createDynamicsCompressor(){const n=new AudioNode(this,'compressor');for(const k of ['threshold','knee','ratio','attack','release'])n[k]=param();return n;}}
 const window={AudioNode,AudioContext,PraxisSound:{get enabled(){return enabled;}},addEventListener:(n,f)=>events[n]=f};const document={hidden:false,querySelectorAll:()=>[],addEventListener:(n,f)=>events[n]=f};
 vm.runInNewContext(await read('public/shared/waves-audio.js'),{window,document,AudioNode,localStorage:{getItem:()=>null,setItem(){}},setTimeout:cb=>timers.push(cb)});
 return {window,document,events,nodes,timers,AudioNode,setEnabled:v=>enabled=v};
}
test('all instruments use calibrated compression and peak control before the master and recording split',async()=>{
 const h=await setup(),ctx=new h.window.AudioContext(),api=h.window.PraxisWavesAudio;
 assert.deepEqual({...api.instrumentProfiles},{guitar:1.6,bowl:1.2,drum:3.2,xylophone:1.35});assert.ok(Object.isFrozen(api.instrumentProfiles));
 for(const id of Object.keys(api.instrumentProfiles)){
  const source=ctx.createGain(),output=api.instrumentOutput(ctx,id,source),voice=source.connections[0],trim=voice.connections[0],body=trim.connections[0],makeup=body.connections[0],limiter=makeup.connections[0];
  assert.equal(trim.gain.value,api.instrumentProfiles[id]);assert.equal(body.type,'compressor');assert.equal(body.threshold.value,-18);assert.equal(body.ratio.value,4);assert.equal(makeup.gain.value,1.8);assert.equal(limiter.type,'compressor');assert.equal(limiter.attack.value,0);assert.equal(limiter.ratio.value,20);assert.equal(limiter.connections[0],output);assert.equal(output.gain.value,.85);
  output.connect(ctx.destination);const master=output.connections.at(-1);assert.notEqual(master,ctx.destination);assert.equal(master.gain.value,.35);
  const recording={};output.connect(recording);assert.equal(output.connections.at(-1),recording);
  h.setEnabled(false);h.events['praxis-sound-change']();assert.equal(master.gain.value,0);assert.equal(output.gain.value,.85,'mute changes live output, not recording calibration');
  h.setEnabled(true);api.setVolume(.75);assert.equal(master.gain.value,.75);api.setVolume(.35);
 }
 assert.throws(()=>api.instrumentOutput(ctx,'unknown',ctx.createGain()),/Unknown instrument/);
});
test('repeated hits reuse the processing chain and fade the preceding voice instead of adding uncontrolled levels',async()=>{
 const h=await setup(),ctx=new h.window.AudioContext(),api=h.window.PraxisWavesAudio,source=ctx.createGain(),first=api.instrumentOutput(ctx,'drum',source),voice=source.connections[0];
 const compressors=h.nodes.filter(n=>n.type==='compressor').length;
 const second=api.instrumentOutput(ctx,'drum',ctx.createGain());assert.equal(first,second);assert.equal(h.nodes.filter(n=>n.type==='compressor').length,compressors);assert.ok(voice.gain.events.some(e=>e[0]==='target'&&e[1]===0));
 h.timers.forEach(cb=>cb());assert.equal(voice.disconnected,true);
 const before=h.nodes.filter(n=>n.type==='compressor').length;api.instrumentOutput(ctx,'guitar',ctx.createGain());assert.equal(h.nodes.filter(n=>n.type==='compressor').length,before+2);
});
test('every distributed instrument routes through its profile; recorders tap the same calibrated output',async()=>{
 const html=await read('public/simulari/unde-mecanice/index.html');for(const id of ['guitar','bowl','drum','xylophone'])assert.match(html,new RegExp('instrumentOutput\\([^;]*["\']'+id+'["\']'));
 assert.match(html,/createMediaStreamDestination\(\),output\.connect\(W\)/);assert.match(html,/if\(I\)output\.connect\(I\)/);
 assert.doesNotMatch(await read('public/shared/waves-audio.js'),/createWaveShaper/);
});
