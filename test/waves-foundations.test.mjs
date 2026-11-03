import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../scripts/waves-foundations-component.js',import.meta.url),'utf8');
const translations=JSON.parse(fs.readFileSync(new URL('../scripts/waves-foundations-translations.json',import.meta.url),'utf8'));
const render=(kind,english=false)=>vm.runInNewContext(source+';LessonWaveFoundations({kind:'+JSON.stringify(kind)+'})',{
 Cv:(tag,props)=>({tag,props}),LessonMathText:'math-label',N:{useSyncExternalStore(){}},window:{PraxisWaveMath:{subscribe(){},language:()=>english?'en':'ro'},PraxisI18n:{tr:s=>english?(translations[s]??s):s}}
});
function all(tree){return[tree,...[tree?.props?.children??[]].flat().flatMap(child=>child&&typeof child==='object'?all(child):[])];}
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
test('phase snapshot matches the stated +x wave and its temporal trends',()=>{
 const tree=render('phase'),points=all(tree).filter(node=>node.props?.['data-foundation-point']);
 assert.equal(points.length,4);
 const xs=[1/8,3/8,9/8,11/8];
 points.forEach((point,i)=>{
  const p=point.props;assert.equal(p['data-foundation-point'],['P₁','P₂','P₃','P₄'][i]);
  near(p['data-x-lambda'],xs[i]);
  near(p.cx,60+542*xs[i]/1.5);
  near(p['data-y-amplitude'],Math.sin(2*Math.PI*(.5-xs[i])));
  near(p['data-temporal-slope'],Math.cos(2*Math.PI*(.5-xs[i])));
  near(p.cy,145-52*Math.sin(2*Math.PI*(.5-xs[i])));
 });
 near(points[0].props.cy,points[1].props.cy);
 assert.ok(points[0].props['data-temporal-slope']<0&&points[1].props['data-temporal-slope']>0);
 near(points[0].props['data-temporal-slope'],points[2].props['data-temporal-slope']);
 near(points[1].props['data-temporal-slope'],points[3].props['data-temporal-slope']);
});
test('elongation arrow joins equilibrium position to the actual particle position',()=>{
 const nodes=all(render('vector')),point=nodes.find(n=>n.props?.['data-foundation-point']),arrow=nodes.find(n=>n.props?.['data-foundation-displacement']!==undefined);
 assert.ok(point&&arrow);near(arrow.props.x1,point.props.cx);near(arrow.props.x2,point.props.cx);
 near(arrow.props.y1,145);near(arrow.props.y2,point.props.cy);
 near(point.props.cy,145-52/Math.sqrt(2));
 assert.ok(arrow.props.markerEnd);
});
test('wavelength joins adjacent same-phase crests and troughs; amplitude is vertical',()=>{
 const nodes=all(render('wavelength')),distances=nodes.filter(n=>n.props?.['data-foundation-wavelength']);
 assert.equal(distances.length,2);
 for(const node of distances){
  const p=node.props,start=p['data-start-lambda'],end=p['data-end-lambda'];
  near(end-start,1);near(p.y1,p.y2);near(p.x2-p.x1,542/2);
  near(Math.sin(2*Math.PI*(.5-start)),Math.sin(2*Math.PI*(.5-end)));
  near(Math.abs(Math.sin(2*Math.PI*(.5-start))),1);
 }
 const amplitude=nodes.find(n=>n.props?.['data-foundation-amplitude']!==undefined);
 near(amplitude.props.x1,amplitude.props.x2);near(Math.abs(amplitude.props.y2-amplitude.props.y1),52);
});
test('each kind has accessible localized title/description and distinct marker identifiers',()=>{
 const markers=[];
 for(const kind of ['vector','phase','wavelength']){
  const ro=all(render(kind)),en=all(render(kind,true)),svg=ro.find(n=>n.tag==='svg');
  assert.equal(svg.props.role,'img');assert.ok(svg.props['aria-labelledby']);
  assert.notEqual(ro.find(n=>n.tag==='title').props.children[0],en.find(n=>n.tag==='title').props.children[0]);
  markers.push(...ro.filter(n=>n.tag==='marker').map(n=>n.props.id));
 }
 assert.equal(new Set(markers).size,markers.length);
});
test('all authored prose has a translation and localization preserves scientific point identifiers',()=>{
 for(const kind of ['vector','phase','wavelength']){
  const ro=all(render(kind)),en=all(render(kind,true));
  const roText=ro.flatMap(n=>n.props?.children??[]).filter(v=>typeof v==='string');
  const enText=en.flatMap(n=>n.props?.children??[]).filter(v=>typeof v==='string');
  roText.forEach((value,i)=>{if(/[ăâîșț]/i.test(value))assert.notEqual(value,enText[i],value);});
  assert.deepEqual(en.filter(n=>n.props?.['data-foundation-point']).map(n=>n.props['data-foundation-point']),ro.filter(n=>n.props?.['data-foundation-point']).map(n=>n.props['data-foundation-point']));
 }
});
