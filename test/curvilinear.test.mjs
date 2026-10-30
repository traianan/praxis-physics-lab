import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function math(){
 const js=await read('public/simulari/miscarea-curbilinie-plana/app.js');
 const start=js.indexOf('const DEFAULT_POINTS='),end=js.indexOf('/* ============ Theory:',start);
 const context=vm.createContext({});vm.runInContext(js.slice(start,end)+'\nglobalThis.model={curve,customCurve,bezier,points:customPoints};',context);return context.model;
}
test('the curvilinear source is preserved and the complete lab is registered in mechanics',async()=>{
 const source=await read('sources/miscarea-curbilinie-plana/index.html'),original=await read('miscarea-curbilinie-plana.html').catch(error=>{if(error.code==='ENOENT')return null;throw error;});if(original!==null)assert.equal(source,original);
 const manifest=JSON.parse(await read('docs/imported-curvilinear.json'));assert.equal(manifest.sha256,createHash('sha256').update(source).digest('hex'));
 assert.ok(findSimulations('miscare','curbilinie osculator').some(s=>s.id==='miscarea-curbilinie-plana'));
 const html=await read('public/simulari/miscarea-curbilinie-plana/index.html');
 for(const id of ['panel-teorie','panel-viteza','panel-acceleratie','theoryCanvas','sim1','sim2','simEllipse'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(source,/prof\. Traian Anghel/);assert.match(source,/Colegiul Național/);assert.doesNotMatch(html.split('</head>')[1],/curvilinear-introduction|Material didactic realizat|Material realizat de/);assert.doesNotMatch(html,/(?:src|href)="https?:/);
});
test('velocity and acceleration derivatives match all four planar paths',async()=>{
 const {curve}=await math(),h=1e-4;
 for(const shape of ['circle','ellipse','general','custom'])for(const theta of [.4,1.2,3.1,5.7]){
  const a=curve(theta-h,160,80,shape),b=curve(theta,160,80,shape),c=curve(theta+h,160,80,shape);
  for(const axis of ['x','y']){
   assert.ok(Math.abs((c[axis]-a[axis])/(2*h)-b['d'+axis])<1e-4,shape+' velocity '+axis);
   assert.ok(Math.abs((c['d'+axis]-a['d'+axis])/(2*h)-b['dd'+axis])<1e-4,shape+' acceleration '+axis);
  }
 }
});
test('custom curve endpoints match the editable handles and circular motion keeps constant speed',async()=>{
 const {curve,customCurve,points}=await math();
 for(const [theta,index]of [[0,0],[2*Math.PI,5]]){const p=customCurve(theta);assert.ok(Math.abs(p.x-points[index].x*160)<1e-8);assert.ok(Math.abs(p.y-points[index].y*110)<1e-8);}
 for(const theta of [0,1,2,3,4]){const p=curve(theta,150,80,'circle');assert.ok(Math.abs(Math.hypot(p.dx,p.dy)-150)<1e-8);assert.ok(Math.abs(p.dx*p.ddx+p.dy*p.ddy)<1e-8);}
});
