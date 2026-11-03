import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../scripts/waves-foundations-component.js',import.meta.url),'utf8');
const translations=JSON.parse(fs.readFileSync(new URL('../scripts/waves-foundations-translations.json',import.meta.url),'utf8'));
function render(english=false){const phrases=[];const tree=vm.runInNewContext(source+';LessonWavePropagation()',{
 Cv:(tag,props)=>({tag,props}),LessonMathText:'math',N:{useSyncExternalStore(){}},window:{PraxisWaveMath:{subscribe(){},language:()=>english?'en':'ro'},PraxisI18n:{tr:s=>{phrases.push(s);return english?(translations[s]??s):s;}}}
});return {tree,phrases};}
function nodes(tree){if(Array.isArray(tree))return tree.flatMap(nodes);return tree&&typeof tree==='object'?[tree,...nodes(tree.props?.children)]:[];}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('six textbook stages show causal propagation from the oscillating source',()=>{
 const cards=nodes(render().tree).filter(n=>n.props?.['data-time-periods']!==undefined);
 assert.deepEqual(cards.map(n=>n.props['data-time-periods']),[0,.25,.5,.75,1,1.25]);
 for(const card of cards){
  const time=card.props['data-time-periods'],parts=nodes(card),profile=parts.find(n=>n.props?.['data-propagation-profile']!==undefined);
  const points=profile.props.points.split(' ').map(pair=>pair.split(',').map(Number));
  for(const [x,y]of points){const u=(x-45)/160,expected=u<=time?Math.sin(2*Math.PI*(time-u)):0;near(y,70-24*expected);}
  near(points[0][1],70-24*Math.sin(2*Math.PI*time));near(points.at(-1)[1],70);
  if(time===0)assert.ok(points.every(([,y])=>y===70));
  const end=parts.find(n=>n.props?.['data-wavefront']!==undefined);if(time>0)near(end.props.x1,45+160*time);
 }
});
test('one source period corresponds to precisely one wavelength, before reaching the far end',()=>{
 const all=nodes(render().tree),card=all.find(n=>n.props?.['data-one-period']!==undefined),dimension=nodes(card).find(n=>n.props?.['data-period-distance']!==undefined);
 near(dimension.props.x2-dimension.props.x1,160);
 const profiles=all.filter(n=>n.props?.['data-propagation-profile']!==undefined);assert.ok(profiles.every(n=>n.props['data-front-lambda']<2));
 assert.ok(all.some(n=>n.tag==='math'&&n.props.children==='λ = v_f·T'));
});
test('all six stages have localized accessible descriptions and unique marker identifiers',()=>{
 const ro=render(),en=render(true),a=nodes(ro.tree),b=nodes(en.tree);
 for(const phrase of ro.phrases)assert.ok(Object.hasOwn(translations,phrase),phrase);
 assert.equal(a.filter(n=>n.tag==='svg').length,6);
 const ids=a.filter(n=>n.props?.id).map(n=>n.props.id);assert.equal(new Set(ids).size,ids.length);
 assert.notDeepEqual(a.filter(n=>n.tag==='desc').map(n=>n.props.children),b.filter(n=>n.tag==='desc').map(n=>n.props.children));
 assert.deepEqual(a.filter(n=>n.tag==='polyline').map(n=>n.props.points),b.filter(n=>n.tag==='polyline').map(n=>n.props.points));
 assert.equal(a.filter(n=>n.tag==='tspan'&&n.props.baselineShift==='sub').length,5);
});
