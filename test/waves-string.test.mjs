import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/shared/waves-string-model.js',import.meta.url),'utf8');
const scope={window:{}};vm.runInNewContext(source,scope);const api=scope.window.PraxisStringWaves;
const close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('speed, crossing time, spectra, and parameter bounds use SI units',()=>{
 const p=api.parameters({L:2,tension:80,mu:.02,n:3});
 close(api.speed(p),Math.sqrt(4000));
 close(api.mode(p).frequency,3*Math.sqrt(4000)/4);
 close(api.mode({...p,right:'free'}).frequency,5*Math.sqrt(4000)/8);
 close(api.mode({...p,right:'free'}).wavelength,8/5);
 assert.throws(()=>api.parameters({mu:0}));assert.throws(()=>api.parameters({n:1.5}));
 assert.throws(()=>api.parameters({right:'unknown'}));
});
test('method of images obeys the fixed left and selected right boundary for all pulse phases',()=>{
 for(const right of ['fixed','free']){
  const p=api.parameters({right}),v=api.speed(p),h=p.L*1e-5;
  for(let j=0;j<=240;j++){
   const time=j/60*p.L/v;
   close(api.pulse(p,0,time).sum,0);
   if(right==='fixed')close(api.pulse(p,p.L,time).sum,0);
   else{
    const left=api.pulse(p,p.L-h,time).sum,rightValue=api.pulse(p,p.L+h,time).sum;
    close((rightValue-left)/(2*h),0,1e-7);
   }
  }
 }
});
test('first reflected pulse inverts at a fixed end and adds to double amplitude at a free end',()=>{
 for(const right of ['fixed','free']){
  const p=api.parameters({right}),v=api.speed(p),hit=.75*p.L/v;
  const atEnd=api.pulse(p,p.L,hit);close(atEnd.incident,p.A);
  close(atEnd.reflected,right==='fixed'?-p.A:p.A);close(atEnd.sum,right==='fixed'?0:2*p.A);
  const returned=api.pulse(p,.8*p.L,.95*p.L/v);
  close(returned.incident,0);close(returned.reflected,right==='fixed'?-p.A:p.A);
 }
});
test('pulse starts with one compact right-moving bump and every decomposition sums exactly',()=>{
 const p=api.parameters(),v=api.speed(p);
 close(api.pulse(p,p.L/4,0).sum,p.A);
 close(api.pulse(p,.31*p.L,0).sum,0);
 close(api.pulse(p,.19*p.L,0).sum,0);
 for(let i=0;i<81;i++)for(let j=0;j<41;j++){
  const result=api.pulse(p,p.L*i/80,p.L/v*j/10);close(result.sum,result.incident+result.reflected);
 }
});
test('standing waves have exact sums, correct nodes, and a free-end antinode',()=>{
 for(const right of ['fixed','free'])for(let n=1;n<=6;n++){
  const p=api.parameters({right,n}),mode=api.mode(p);
  for(const time of [0,.113/mode.frequency,.25/mode.frequency]){
   for(let j=0;j<=60;j++){
    const x=j/60*p.L,result=api.standing(p,x,time);
    close(result.sum,result.incident+result.reflected);
    close(result.sum,2*p.A*Math.sin(2*Math.PI*x/mode.wavelength)*Math.cos(2*Math.PI*time*mode.frequency));
   }
   for(const x of mode.nodes)close(api.standing(p,x,time).sum,0);
  }
  for(const x of mode.antinodes)close(Math.abs(api.standing(p,x,0).sum),2*p.A);
  if(right==='free'){
   const h=p.L*1e-5,time=.137/mode.frequency;
   close((api.standing(p,p.L+h,time).sum-api.standing(p,p.L-h,time).sum)/(2*h),0,1e-8);
  }
  if(right==='free')close(mode.antinodes.at(-1),p.L);else close(mode.nodes.at(-1),p.L);
 }
});
test('both pulse and highest mode stay within the small-slope string approximation',()=>{
 const p=api.parameters({n:6}),h=p.L*1e-6;
 let maximum=0;for(let j=1;j<1000;j++)maximum=Math.max(maximum,Math.abs((api.pulse(p,j*p.L/1000+h,0).sum-api.pulse(p,j*p.L/1000-h,0).sum)/(2*h)));
 assert.ok(maximum<.06);assert.ok(2*p.A*2*Math.PI/api.mode(p).wavelength<.08);
});
test('analytic clock is independent of frame partition and restarts only on explicit reset',()=>{
 for(const kind of ['reflection','standing'])for(const right of ['fixed','free']){
  const a=api.create({right},kind),b=api.create({right},kind);
  a.advanceWall(3);for(let j=0;j<180;j++)b.advanceWall(1/60);
  close(a.time,b.time);close(a.crossings,b.crossings);
  close(api.displayRate(a.params,kind),kind==='reflection'?a.params.L/api.speed(a.params)/1.5:.2/api.mode({...a.params,n:1}).frequency);
  a.reset({n:3});close(a.time,0);assert.equal(a.params.n,3);
 }
});
const component=fs.readFileSync(new URL('../scripts/waves-string-component.js',import.meta.url),'utf8');
const translations=JSON.parse(fs.readFileSync(new URL('../scripts/waves-string-translations.json',import.meta.url),'utf8'));
function render(kind,{params={},english=false,running=false,active=true,hidden=false,crossings=0}={}){
 const effects=[],callbacks=new Map(),writes=[],usedTranslations=[];let serial=0,state=0,model;
 const document={hidden,addEventListener(){},removeEventListener(){}};
 const globals={
  window:{PraxisStringWaves:{...api,create:(options,k)=>{model=api.create(params,k);if(crossings)model.seekCrossings(crossings);return model;}},PraxisWaveMath:{subscribe(){},bare:()=>false,language:()=>english?'en':'ro'},PraxisI18n:{tr:value=>{usedTranslations.push(value);return english?(translations[value]??value):value;}}},
  N:{useContext:()=>({active,owner:{active}}),useRef:initial=>({current:initial}),useState:initial=>[state++===0?running:initial,value=>writes.push(value)],useSyncExternalStore:(subscribe,language)=>language(),useEffect:fn=>effects.push(fn)},
  Cv:(type,props)=>({type,props}),LessonActivityContext:{},LessonMathText:'math',document,performance:{now:()=>0},
  requestAnimationFrame:fn=>{callbacks.set(++serial,fn);return serial;},cancelAnimationFrame:id=>callbacks.delete(id),Math
 };
 const prose=fs.readFileSync(new URL('../scripts/waves-math-prose.js',import.meta.url),'utf8');
 const tree=vm.runInNewContext(prose+'\n'+component+';LessonStringWaves({kind:'+JSON.stringify(kind)+'})',globals);
 return{tree,model,effects,callbacks,writes,document,usedTranslations};
}
function nodes(tree){if(Array.isArray(tree))return tree.flatMap(nodes);if(!tree||typeof tree!=='object')return[];return[tree,...nodes(tree.props?.children)];}
function words(tree){if(Array.isArray(tree))return tree.map(words).join(' ');if(tree&&typeof tree==='object')return words(tree.props.children);return tree==null?'':String(tree);}

test('slowed-animation prose renders the phase-speed subscript while preserving sentence punctuation',()=>{
 for(const english of [false,true]){
  const tree=render('reflection',{english}).tree;
  const note=nodes(tree).find(n=>n.type==='p'&&words(n).includes(english?'one L/':'o traversare L/'));
  assert.ok(note);const script=nodes(note).find(n=>n.props?.className==='wave-script');
  assert.equal(words(script),'v f ');assert.ok(nodes(script).some(n=>n.type==='sub'&&words(n)==='f'));
  assert.match(words(note),english?/on screen\. The slider/:/pe ecran\. Sliderul/);
  assert.match(words(note),/; /);
 }
});

test('reflection phase and equivalent path are visible for both ends and are distinct from the spatial midpoint',()=>{
 for(const kind of ['reflection','standing'])for(const right of ['fixed','free']){
  const children=nodes(render(kind,{params:{right}}).tree);
  const fixed=children.find(n=>n.props?.['data-string-reflection-case']==='fixed');
  const free=children.find(n=>n.props?.['data-string-reflection-case']==='free');
  assert.ok(fixed&&free,'both endpoint cases must be in the primary view');
  assert.match(words(fixed),/Δφ = π rad/);assert.match(words(fixed),/Δs = λ\/2/);
  assert.match(words(free),/Δφ = 0 rad/);assert.match(words(free),/Δs = 0λ/);
  assert.equal(fixed.props['data-selected'],String(right==='fixed'));
  assert.equal(free.props['data-selected'],String(right==='free'));
  const midpoint=children.find(n=>n.props?.['data-string-coordinate']==='midpoint');
  assert.match(midpoint.props['aria-label'],/x = L\/2: mijlocul corzii/);
  assert.match(words(midpoint),/mijlocul corzii/);
  const disclosureNodes=children.filter(n=>n.type==='details').flatMap(nodes);
  assert.ok(!disclosureNodes.includes(fixed)&&!disclosureNodes.includes(free));
 }
});

test('React void controls receive no children property',()=>{
 for(const kind of ['reflection','standing'])for(const input of nodes(render(kind).tree).filter(n=>n.type==='input'))assert.equal(Object.hasOwn(input.props,'children'),false);
});
test('actual SVG pulse sum reaches the frictionless ring, with zero displacement at the left wall',()=>{
 const {tree}=render('reflection',{params:{right:'free'},crossings:.75});
 const children=nodes(tree),curve=children.find(n=>n.props?.['data-string-curve']==='sum');
 const points=curve.props.points.split(' ').map(pair=>pair.split(',').map(Number));
 close(points[0][0],58);close(points[0][1],130);close(points.at(-1)[0],602);close(points.at(-1)[1],78);
 close(children.find(n=>n.props?.className==='string-free-ring').props.cy,78);
 assert.match(words(tree),/y\(L,t\) = 2y_inc\(L,t\)/);
});
test('actual standing component exposes the selected spectrum and all mode markers',()=>{
 const {tree,model}=render('standing',{params:{right:'free',n:3}}),children=nodes(tree);
 assert.equal(children.filter(n=>n.props?.['data-string-node']!==undefined).length,3);
 const antinodes=children.filter(n=>n.props?.['data-string-antinode']!==undefined);assert.equal(antinodes.length,3);close(antinodes.at(-1).props['data-string-antinode'],2);
 assert.match(words(tree),new RegExp(api.mode(model.params).frequency.toFixed(2).replace('.','\\.')+' Hz'));
 assert.ok(children.some(n=>n.type==='input'&&n.props.min===1&&n.props.max===6));
});
test('all authored prose is translated and language changes do not alter the physical snapshot',()=>{
 for(const kind of ['reflection','standing']){
  const ro=render(kind,{params:{right:'free'},crossings:.75}),en=render(kind,{params:{right:'free'},english:true,crossings:.75});
  for(const phrase of ro.usedTranslations)assert.ok(Object.hasOwn(translations,phrase),'Missing translation: '+phrase);
  const curves=result=>nodes(result.tree).filter(n=>n.props?.['data-string-curve']).map(n=>n.props.points);
  assert.deepEqual(curves(ro),curves(en));close(ro.model.time,en.model.time);
 }
});
test('component clock obeys inactivity, hidden documents, cleanup, and elapsed wall time',()=>{
 for(const options of [{active:false},{hidden:true}]){
  const r=render('reflection',{...options,running:true});r.effects[2]();assert.equal(r.callbacks.size,0);close(r.model.time,0);
 }
 const r=render('reflection',{running:true}),cleanup=r.effects[2]();
 const frame=r.callbacks.get(1);r.callbacks.delete(1);frame(1500);close(r.model.crossings,1);
 const time=r.model.time;r.document.hidden=true;const next=[...r.callbacks.values()][0];r.callbacks.clear();next(3000);close(r.model.time,time);assert.ok(r.writes.includes(false));
 cleanup();assert.equal(r.callbacks.size,0);
});
