import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';import vm from'node:vm';
import{adaptWaveAnimations}from'../scripts/waves-animation-adapter.mjs';
import{adaptWavePhysics}from'../scripts/waves-physics-adapter.mjs';
import{adaptWaveEditorial}from'../scripts/lesson-editorial-adapter.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('wave figures keep large drawings at native display size while small diagrams retain modest enlargement',async()=>{
 const source=await read('scripts/waves-jsx-adapter.js');
 const context=vm.createContext({window:{PraxisScientificColors:{},PraxisCourseLocalization:{colors:'praxis'}},Cv:(type,props,key)=>({type,props,key}),LessonCanvas:()=>{}});
 const jsx=vm.runInContext('(function(type,props,key){'+source+'})',context);
 assert.equal(jsx('canvas',{width:800,height:350}).props.style['--wave-render-width'],'50rem');
 assert.equal(jsx('canvas',{width:340,height:140}).props.style['--wave-render-width'],'26.5625rem');
});
test('wave import preserves all original content except documented reversible physics and presentation corrections',async()=>{
 const manifest=JSON.parse(await read('docs/unde-mecanice-source.json')),html=await read('public/simulari/unde-mecanice/index.html');const module=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)][0][1];
 const restored=(await adaptWavePhysics(await adaptWaveAnimations(adaptWaveEditorial(module,true),true),true)).replace(/\n\/\* praxis:effect-adapter \*\/[\s\S]*?\/\* \/praxis:effect-adapter \*\/\n/,'').replace('undefined:[...deps,active,...(deps.length?[presentationRevision]:[])]);','undefined:[...deps,active]);').replace(/\n\/\* praxis:input-adapter \*\/[\s\S]*?\/\* \/praxis:input-adapter \*\/\n/,'');assert.equal(createHash('sha256').update(restored).digest('hex'),manifest.moduleSha256);
 assert.equal(manifest.topics,19);assert.equal(manifest.screens,37);assert.match(module,/lessonFrameRunnable/);assert.match(module,/lessonUseEffect/);assert.match(module,/setPointerCapture/);assert.match(html,/shared\/waves-audio\.js/);assert.match(html,/shared\/course\.js/);
});
test('wave master volume and mute affect every AudioContext without redirecting recording outputs',async()=>{
 const listeners={},audio={muted:false,volume:1};let enabled=false;
 class AudioNode{constructor(context){this.context=context;}connect(destination){this.destination=destination;return destination;}}
 class AudioContext{constructor(){this.destination={};this.currentTime=0;this.state='running';}createGain(){const g=new AudioNode(this);g.gain={value:1,setTargetAtTime(v){this.value=v;}};return g;}}
 const window={AudioNode,AudioContext,PraxisSound:{get enabled(){return enabled;}},addEventListener:(name,fn)=>listeners[name]=fn};const document={hidden:false,querySelectorAll:()=>[audio],addEventListener:(name,fn)=>listeners[name]=fn};
 vm.runInNewContext(await read('public/shared/waves-audio.js'),{window,AudioNode,document,localStorage:{getItem:()=>null,setItem(){}}});
 const ctx=new window.AudioContext(),source=new AudioNode(ctx);source.connect(ctx.destination);const master=source.destination;assert.notEqual(master,ctx.destination);assert.equal(master.destination,ctx.destination);assert.equal(master.gain.value,0);
 enabled=true;listeners['praxis-sound-change']();assert.equal(master.gain.value,.35);window.PraxisWavesAudio.setVolume(.6);assert.equal(master.gain.value,.6);assert.equal(audio.volume,.6);assert.equal(audio.muted,false);
 const recording={};source.connect(recording);assert.equal(source.destination,recording);enabled=false;listeners['praxis-sound-change']();assert.equal(master.gain.value,0);assert.equal(audio.muted,true);
 enabled=true;document.hidden=true;listeners.visibilitychange();assert.equal(master.gain.value,0);
});
test('every laboratory distribution includes the mandatory shared presentation',async()=>{
 const optics=await read('public/simulari/oglinzi-si-lentile/index.html');assert.match(optics,/data-praxis-laboratory="true"/);assert.match(optics,/Mandatory laboratory presentation/);
 for(const id of ['miscarea-rectilinie','calcul-vectorial','unde-mecanice']){const html=await read('public/simulari/'+id+'/index.html');assert.match(html,/data-praxis-laboratory="true"/);assert.match(html,/design-system\/laboratory\.css/);}
});
