import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {adaptWaveAcousticsAudit,acousticsAuditTranslations} from '../scripts/waves-acoustics-audit-adapter.mjs';

const imported=readFileSync(new URL('../public/simulari/unde-mecanice/index.html',import.meta.url),'utf8');
const baseline=adaptWaveAcousticsAudit(imported,true);
const adapted=adaptWaveAcousticsAudit(baseline);
const active=adapted.replace(/\/\*[\s\S]*?\*\//g,'');
test('the entire revised advanced protocol has English prose and an explicit slope symbol',()=>{
 const entry=Object.entries(acousticsAuditTranslations).find(([source])=>source.startsWith('Protocol general laborator avansat:'));
 assert.ok(entry);assert.ok(!/[ăâșțî]/u.test(entry[1]));assert.match(entry[0],/panta p = 1\/\(4μL²\)/);
 const text=allText(render('Zm',{}, {ie:'section',Km:'sonometer',Vm:'kundt',Bm:'oscilloscope',Im:'seismic'}).tree);
 assert.equal((text.match(/1\) Sonometru:/g)||[]).length,1);
 assert.ok(!text.includes('dovada lichidului'));
});
function functionSource(name){const from=active.indexOf(`function ${name}(`);assert.ok(from>=0,name);const next=/\bfunction\s+[\w$]+\s*\(/.exec(active.slice(from+9));return active.slice(from,from+9+next.index);}
function render(name,overrides={},extraContext={}){
 let index=0;const effects=[],state=[],frames=[];
 const N={useRef:value=>({current:value}),useState:initial=>{const n=index++,value=Object.hasOwn(overrides,n)?overrides[n]:typeof initial==='function'?initial():initial;state[n]=value;return[value,next=>{state[n]=typeof next==='function'?next(state[n]):next}]},useMemo:fn=>fn(),useEffect:fn=>effects.push(fn)};
 const element=(type,props)=>({type,props});
 const context={N,wn:()=>false,t:element,f:element,dt:'note',Me:'formula',LessonRecordingHelp:'recording-help',LessonGuitarHelp:'guitar-help',Math,performance:{now:()=>0},window:{PraxisAnimationClock:{create:()=>({step:()=>.016})}},lessonUseEffect:N.useEffect,lessonRequestAnimationFrame:fn=>frames.push(fn),lessonCancelAnimationFrame:()=>{},requestAnimationFrame:fn=>frames.push(fn),cancelAnimationFrame:()=>{},Jm:'surface',...extraContext};
 const tree=vm.runInNewContext(functionSource(name)+`;${name}()`,context);
 return{tree,state,effects,frames,context};
}
function allText(tree){if(Array.isArray(tree))return tree.map(allText).join(' ');if(tree&&typeof tree==='object')return allText(tree.props?.children);return typeof tree==='string'||typeof tree==='number'?String(tree):'';}
function inputs(tree,result=[]){if(Array.isArray(tree))tree.forEach(t=>inputs(t,result));else if(tree&&typeof tree==='object'){if(tree.type==='input')result.push(tree);inputs(tree.props?.children,result)}return result;}
test('scientific adaptations reverse exactly, including nested textbook markers',()=>{
 assert.equal(adaptWaveAcousticsAudit(adapted,true),baseline);
 assert.equal(adaptWaveAcousticsAudit(adapted),adapted);
});
test('guitar real synthesis callback creates finite audible buffers at all nominal notes',()=>{
 const notes=[82.41,110,146.83,196,246.94,329.63];
 for(const rate of [44100,48000])for(const frequency of notes){
  let samples;
  const node=()=>({connect(){return this},gain:{value:0},frequency:{value:0},Q:{value:0},start(){},stop(){}});
  const audio={state:'running',sampleRate:rate,destination:{},createBuffer:(channels,length)=>{samples=new Float32Array(length);return{getChannelData:()=>samples}},createBufferSource:node,createBiquadFilter:node,createGain:node};
  const {tree}=render('Om',{0:frequency},{de:()=>audio,gn:()=>{},setTimeout:()=>{},am:notes.map(freq=>({freq,label:String(freq)})),window:{PraxisWavesAudio:{instrumentOutput:(_audio,_name,output)=>output},PraxisAnimationClock:{create:()=>({step:()=>.016})}}});
  const buttons=[];const walk=element=>{if(Array.isArray(element))element.forEach(walk);else if(element?.props){if(element.type==='button')buttons.push(element);walk(element.props.children)}};walk(tree);
  const play=buttons.find(button=>/Ciup|ciup/.test(allText(button)));assert.ok(play,'guitar play action');play.props.onClick();
  assert.ok(samples?.length===rate*3);
  assert.ok(Array.from(samples).every(Number.isFinite),`${frequency} Hz @ ${rate}: finite`);
  const rms=Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length);assert.ok(rms>.001);
  // A Hann-windowed direct spectrum at sub-bin trial frequencies verifies the
  // actual synthesized fundamental, independent of the delay implementation.
  const begin=Math.floor(rate*.05),length=Math.floor(rate*.5),decimation=4;
  let peak=0,peakFrequency=0;
  for(let trial=frequency*.985;trial<=frequency*1.015;trial+=frequency*.0005){
   let real=0,imaginary=0;
   for(let i=0;i<length;i+=decimation){const value=samples[begin+i]*(.5-.5*Math.cos(2*Math.PI*i/(length-1))),angle=2*Math.PI*trial*i/rate;real+=value*Math.cos(angle);imaginary-=value*Math.sin(angle)}
   const power=real*real+imaginary*imaginary;if(power>peak){peak=power;peakFrequency=trial}
  }
  assert.ok(peak>1,`${frequency}: nonzero fundamental spectrum`);
  assert.ok(Math.abs(peakFrequency/frequency-1)<.005,`${frequency} Hz @ ${rate}: spectrum peak ${peakFrequency}`);
 }
});
test('both tube configurations display their own valid frequencies',()=>{
 const text=allText(render('pm').tree);
 assert.match(text,/566\.7/);assert.match(text,/425\.0/);
});
test('seismic time, moduli units, and hypocentral inversion agree',()=>{
 const text=allText(render('Im').tree);
 assert.match(text,/Δ\/3\.2 \+ h\/6/);assert.match(text,/80\.0/);assert.match(text,/33\.08/);assert.match(text,/53\.10/);assert.match(text,/GPa/);
 const values=render('Im'),controls=inputs(values.tree);
 const vp=controls.find(x=>x.props.min===5&&x.props.max===8),vs=controls.find(x=>x.props.min===3&&x.props.max===4.5);
 vp.props.onChange({target:{value:'5'}});assert.ok(values.state[2]**2>4/3*values.state[3]**2);
 const highS=render('Im',{2:5}),sControl=inputs(highS.tree).find(x=>x.props.min===3&&x.props.max===4.5);
 sControl.props.onChange({target:{value:'4.5'}});assert.ok(highS.state[2]**2>4/3*highS.state[3]**2);
 assert.ok(vs);
});
test('Love fundamental speeds satisfy both the guide bounds and dispersion equation',()=>{
 for(const frequency of [.05,.18,.5])for(const depth of [5,35,70]){
  const {tree}=render('Jm',{4:frequency,5:depth});
  // Numeric readout rounds to 2 decimals; evaluate the actual useMemo body
  // at full precision to verify the equation rather than rounded display text.
  const src=functionSource('Jm'),formula=src.slice(src.indexOf('s=N.useMemo(()=>{')+'s=N.useMemo(()=>{'.length,src.indexOf('},[g,v])'));
  const c=vm.runInNewContext(`(()=>{${formula}})()`,{g:frequency,v:depth,Math});
  assert.ok(c>3.5&&c<4.5,`${frequency},${depth}: ${c}`);
  const w=2*Math.PI*frequency,a=w*Math.sqrt(1/3.5**2-1/c**2),b=w*Math.sqrt(1/c**2-1/4.5**2);
  assert.ok(Math.abs(Math.tan(a*depth)-4.5**2*b/(3.5**2*a))<1e-8);
  assert.match(allText(tree),/tan\(aH\)/);
 }
});
test('Rayleigh profiles are continuous and solve the surface-wave characteristic equation',()=>{
 const source=functionSource('Jm'),c=3.5*Math.sqrt(2-2/Math.sqrt(3)),p=Math.sqrt(1-c*c/(3*3.5**2)),q=Math.sqrt(1-c*c/3.5**2);
 assert.ok(Math.abs((1+q*q)**2-4*p*q)<1e-12);
 assert.ok(!source.includes('if(en<0)pn=-pn*0.7'));
 assert.match(source,/rayH=On-2\*rayP\*rayQ\/\(1\+rayQ\*rayQ\)\*En/);
 assert.match(source,/rayV=rayP\*\(2\/\(1\+rayQ\*rayQ\)\*En-On\)/);
 assert.match(source,/Xn=Y\*0\.18\*rayH\*nn\*Math.cos/);
 assert.match(source,/ue=Y\*0\.18\*rayV\*nn\*Math.sin/);
 assert.equal((source.match(/o\.current\+=dt\*i/g)||[]).length,1);
 assert.ok(!source.includes('o.current+=0.016'));
});
test('relative source control and oscilloscope use consistent scaling',()=>{
 const text=allText(render('ym').tree);assert.match(text,/reglaj relativ/);assert.ok(!text.includes('Amplitudine A la'));
 const source=functionSource('Bm');assert.ok(!source.includes('Q=Cn/2+B*Cn*0.4*d'));assert.match(source,/Q=Cn\/2\+B\*Cn\*0\.4/);
 assert.match(allText(render('Bm').tree),/fără calibrare/);
 assert.ok(Object.values(acousticsAuditTranslations).every(value=>typeof value==='string'&&value.length));
});
test('sonometer delay-line synthesis stays finite at the first feedback sample',()=>{
 const source=functionSource('Km');
 const recurrence=/for\(let W=E;W<I;W\+\+\)([^;]+);/.exec(source)?.[1];
 assert.ok(recurrence);
 const samples=vm.runInNewContext(`(()=>{const E=64,I=1024,z=.998,M=new Float32Array(I);for(let j=0;j<E;j++)M[j]=Math.sin(j);for(let W=E;W<I;W++)${recurrence};return M})()`,{Float32Array,Math});
 assert.ok(Array.from(samples).every(Number.isFinite));
 assert.ok(Array.from(samples.slice(64)).some(x=>Math.abs(x)>.01));
 assert.match(source,/Math.round\(L\/O-0\.5\)/);
});
