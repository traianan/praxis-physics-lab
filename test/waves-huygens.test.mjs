import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const scope={window:{}};vm.runInNewContext(read('public/shared/waves-huygens-model.js'),scope);
const api=scope.window.PraxisHuygens,close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);

test('interface points emit only after arrival; radii are speed times individual source age',()=>{
 for(const kind of ['reflection','refraction'])for(const angle of [15,40,60])for(const ratio of [.5,.7,1,1.1])for(const progress of [0,.25,.48,7/9,1]){
  const m=api.snapshot({kind,angle,ratio,progress});
  for(const s of m.sources){close(s.birth,s.x*Math.sin(m.i));assert.equal(s.active,m.time>=s.birth-1e-12);close(s.radius,m.speed*Math.max(0,m.time-s.birth));}
  const active=m.sources.filter(s=>s.active);for(let j=1;j<active.length;j++)assert.ok(active[j].radius<=active[j-1].radius);
  if(progress===0)assert.equal(active.length,0);
  if(progress===7/9){assert.equal(active.length,9);close(m.time,m.duration);close(active.at(-1).radius,0);}
 }
});

test('the constructed front is the forward common tangent to all active secondary circles',()=>{
 for(const kind of ['reflection','refraction'])for(const angle of [15,30,45,60])for(const ratio of [.5,.7,1,1.1])for(const progress of [.48,.7,7/9,1]){
  const m=api.snapshot({kind,angle,ratio,progress}),[a,b]=m.front;
  close((b.x-a.x)*m.n.x+(b.y-a.y)*m.n.y,0);
  for(const s of m.sources.filter(s=>s.active)){
   close(Math.hypot(s.tangent.x-s.x,s.tangent.y),s.radius);
   close(s.tangent.x*m.n.x+s.tangent.y*m.n.y,m.speed*m.time);
   assert.ok(kind==='reflection'?s.tangent.y>=0:s.tangent.y<=0);
  }
 }
});

test('reflection and Snell laws, ray directions and incident front geometry agree independently',()=>{
 for(const angle of [15,40,60])for(const ratio of [.5,.7,1,1.1]){
  const a=api.snapshot({kind:'reflection',angle,ratio,progress:7/9}),b=api.snapshot({kind:'refraction',angle,ratio,progress:7/9});
  close(a.i,a.r);close(a.n.x,a.incidentDirection.x);close(a.n.y,-a.incidentDirection.y);
  close(Math.sin(b.i)/Math.sin(b.r),1/ratio);
  assert.ok(ratio<1?b.r<b.i:ratio>1?b.r>b.i:Math.abs(b.r-b.i)<1e-12);
  const first=api.snapshot({angle,progress:0}),[p,q]=first.incident;
  close((q.x-p.x)*first.incidentDirection.x+(q.y-p.y)*first.incidentDirection.y,0);
 }
});

test('after construction the envelope translates normally at the wave speed',()=>{
 for(const kind of ['reflection','refraction']){
  const a=api.snapshot({kind,progress:.9}),b=api.snapshot({kind,progress:1}),dt=b.time-a.time;
  for(let j=0;j<2;j++){close(b.front[j].x-a.front[j].x,b.speed*dt*b.n.x);close(b.front[j].y-a.front[j].y,b.speed*dt*b.n.y);}
 }
});

function render(kind,progress,{running=false,angle=40}={}){
 let i=0,id=0;const states=[progress,angle,.7,running],effects=[],maths=[],pending=new Map(),owner={active:true};
 const N={useContext:()=>({active:true,owner}),useState:v=>{const k=i++;return [states[k]??v,next=>{states[k]=typeof next==='function'?next(states[k]):next;}];},useRef:v=>({current:v}),useEffect:fn=>effects.push(fn),useSyncExternalStore:()=> 'ro'};
 const context={window:{PraxisHuygens:api,PraxisI18n:{tr:s=>s},PraxisWaveMath:{}},N,LessonActivityContext:{},LessonMathText:'MathText',Cv:(tag,props)=>{if(tag==='MathText')maths.push(props.children);return {tag,props};},performance:{now:()=>100},document:{hidden:false},Math,requestAnimationFrame:fn=>{pending.set(++id,fn);return id;},cancelAnimationFrame:id=>pending.delete(id)};
 vm.runInNewContext(read('scripts/waves-huygens-component.js')+'\nglobalThis.tree=LessonHuygensBoundary({kind:'+JSON.stringify(kind)+'});',context);
 return {tree:context.tree,maths,effects,states,pending,owner,context};
}
const nodes=tree=>!tree||typeof tree!=='object'?[]:[tree,...(Array.isArray(tree.props?.children)?tree.props.children:[tree.props?.children]).flatMap(nodes)];

test('the actual SVG component shows causal wavelets first, then the envelope and propagation',()=>{
 for(const kind of ['reflection','refraction']){
  const first=nodes(render(kind,0).tree),growing=nodes(render(kind,.48).tree),built=nodes(render(kind,7/9).tree);
  assert.equal(first.filter(n=>n.props?.['data-secondary-source']!==undefined).length,0);
  assert.ok(growing.filter(n=>n.props?.['data-secondary-source']!==undefined).length>1);
  assert.equal(growing.filter(n=>Object.hasOwn(n.props||{},'data-constructed-front')).length,0);
  assert.equal(built.filter(n=>n.props?.['data-secondary-source']!==undefined).length,9);
  assert.equal(built.filter(n=>Object.hasOwn(n.props||{},'data-constructed-front')).length,1);
  assert.equal(built.filter(n=>n.props?.['data-tangent-point']!==undefined).length,8);
 }
});

test('textbook proof formulas render with fractions and structural indices',()=>{
 const c=vm.createContext({window:{addEventListener(){},PraxisI18n:{language:'ro',tr:s=>s}}});
 vm.runInContext(read('public/simulari/calorimetrie/vendor/katex/katex.min.js'),c);c.window.katex=c.katex;
 vm.runInContext(read('public/shared/waves-math.js'),c);
 for(const kind of ['reflection','refraction'])for(const formula of render(kind,7/9).maths)assert.doesNotMatch(c.window.PraxisWaveMath.render(formula),/wave-math-error/,formula);
 const law=c.window.PraxisWaveMath.render('sin i / sin r = v₁/v₂');assert.match(law,/<mfrac>/);assert.match(law,/<msub>/);
});

test('the component owns one clock, ignores negative elapsed time, and stops when hidden or inactive',()=>{
 for(const condition of ['hidden','inactive']){
  const r=render('refraction',.48,{running:true}),cleanup=r.effects[2]();assert.equal(r.pending.size,1);
  const step=now=>{const [id,fn]=[...r.pending][0];r.pending.delete(id);fn(now);};
  step(99);close(r.states[0],.48);assert.equal(r.pending.size,1);
  step(116);assert.ok(r.states[0]>.48);assert.equal(r.pending.size,1);
  const held=r.states[0];if(condition==='hidden')r.context.document.hidden=true;else r.owner.active=false;
  step(132);close(r.states[0],held);assert.equal(r.states[3],false);assert.equal(r.pending.size,0);cleanup();
 }
 const r=render('reflection',.9999,{running:true});r.effects[2]();const [id,fn]=[...r.pending][0];r.pending.delete(id);fn(200);close(r.states[0],1);assert.equal(r.states[3],false);assert.equal(r.pending.size,0);
});

test('all authored Romanian prose has an English counterpart',()=>{
 const translations=JSON.parse(read('scripts/waves-huygens-translations.json'));
 for(const match of read('scripts/waves-huygens-component.js').matchAll(/'([^'\r\n]*)'/g))if(/[ăâîșțĂÂÎȘȚ]/.test(match[1]))assert.ok(translations[match[1]]&&translations[match[1]]!==match[1],match[1]);
});

test('one physical clock preserves speed across angles and frame partitions',()=>{
 for(const angle of [15,40,60])for(const stamps of [[1100],[200,300,400,500,600,700,800,900,1000,1100]]){
  const r=render('refraction',.48,{running:true,angle}),before=api.snapshot({kind:'refraction',angle,progress:.48}).time;
  const cleanup=r.effects[2]();for(const stamp of stamps){const [id,fn]=[...r.pending][0];r.pending.delete(id);fn(stamp);}
  close(api.snapshot({kind:'refraction',angle,progress:r.states[0]}).time-before,.12);assert.equal(r.pending.size,1);cleanup();assert.equal(r.pending.size,0);
 }
});

test('two marginal rays delimit every displayed new front and remain perpendicular to it',()=>{
 for(const kind of ['reflection','refraction']){
  const all=nodes(render(kind,0).tree),f=all.find(n=>Object.hasOwn(n.props||{},'data-incident-front')).props,rays=all.filter(n=>n.props?.['data-huygens-ray']==='incident');assert.equal(rays.length,2);
  rays.forEach((node,j)=>{const r=node.props,dx=r.x2-r.x1,dy=r.y2-r.y1;close(dx*(f.x2-f.x1)+dy*(f.y2-f.y1),0);close(((j?f.x2:f.x1)-r.x1)*dy-((j?f.y2:f.y1)-r.y1)*dx,0);});
 }
 for(const kind of ['reflection','refraction'])for(const progress of [.65,7/9,1]){
  const all=nodes(render(kind,progress).tree),incident=all.filter(n=>n.props?.['data-huygens-ray']==='incident'),rays=all.filter(n=>n.props?.['data-huygens-ray']===kind),f=all.find(n=>Object.hasOwn(n.props||{},'data-constructed-front')).props;
  assert.equal(incident.length,2);assert.equal(rays.length,2);
  rays.forEach((node,j)=>{
   const r=node.props,dx=r.x2-r.x1,dy=r.y2-r.y1,x=j?f.x2:f.x1,y=j?f.y2:f.y1;
   close(dx*(f.x2-f.x1)+dy*(f.y2-f.y1),0);close((x-r.x1)*dy-(y-r.y1)*dx,0);assert.ok(r.markerEnd);
  });
 }
});
