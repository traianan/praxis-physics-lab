import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(await read('public/shared/coulomb-model.js'),context);
const model=context.PraxisCoulombModel;
test('Coulomb converts microcoulombs and centimetres to SI and follows inverse-square scaling',()=>{
 const f=model.interaction(5,5,50).force;
 assert.ok(Math.abs(f-.89875517923)<1e-12);
 assert.equal(model.interaction(5,5,100).force,f/4);
 assert.equal(model.interaction(10,5,50).force,2*f);
 assert.equal(model.interaction(5,10,50).force,2*f);
});
test('Coulomb force pair obeys action-reaction for both signs and zero charges',()=>{
 for(const [a,b,dir] of [[5,5,-1],[-5,-5,-1],[5,-5,1],[-5,5,1],[0,5,0],[5,0,0]]){
  const result=model.interaction(a,b,50);assert.equal(result.direction,dir);assert.equal(result.force1+result.force2,0);
  if(!dir)assert.equal(result.force,0);
 }
 assert.throws(()=>model.interaction(5,5,0),/positive separation/);
});
test('force arrows remain separate and inside the scene across all slider endpoints and narrow widths',()=>{
 for(const width of [320,390,600,800])for(const r of [10,50,100])for(const b of [-10,10]){
  const {force,direction}=model.interaction(10,b,r),g=model.geometry(r,width,force,direction);
  const e1=g.x1+direction*(37+g.length),e2=g.x2-direction*(37+g.length);
  assert.ok(e1>=0&&e2<=width);assert.ok(e1<e2,'arrows must not cross');
  assert.ok(g.length>=15,'a complete arrowhead must fit outside the charge');assert.ok(g.x1>=31&&g.x2<=width-31);
 }
});
test('Coulomb integration preserves source, uses shared presentation and excludes injected network code',async()=>{
 const html=await read('public/simulari/legea-lui-coulomb/index.html');
 assert.match(html,/data-praxis-course="legea-lui-coulomb"/);
 for(const file of ['i18n.js','course.js','scientific-colors.js','coulomb-model.js'])assert.ok(html.includes(file));
 assert.doesNotMatch(html,/cdn-cgi|__CF|target="_blank"|color:white/);
 assert.match(html,/data-science-math="tex"/);assert.match(html,/legea-lui-coulomb.zip/);
 assert.equal(await read('public/simulari/legea-lui-coulomb/app.js'),await read('scripts/adaptations/coulomb-app.js'));
 const en=JSON.parse(await read('public/locales/coulomb/en.json'));
 assert.equal(en.messages['Fără forță'],'No force');assert.equal(en.messages['Respingere'],'Repulsion');
});
