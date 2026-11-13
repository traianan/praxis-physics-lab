import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../public/simulari/retele-electrice/app.js',import.meta.url),'utf8');
const scope={};vm.runInNewContext(source.slice(0,source.indexOf('// PRAXIS_INTEGRATION_START'))+'globalThis.model={solveNetlist,LabK,GenLab,PROBLEMS,QUIZ};})();',scope);
const {solveNetlist,LabK,GenLab,PROBLEMS,QUIZ}=scope.model;
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('Kirchhoff conserves charge and energy, including reverse current and open right branch',()=>{
 for(const closed of [true,false])for(const E1 of [1,22,30])for(const E2 of [1,19,30]){
  Object.assign(LabK.P,{E1,E2,closed});const q=LabK.solve(),p=LabK.P;
  near(q.I1+q.I2,q.I3);near(q.I1*5+q.I3*4,E1);
  if(closed)near(q.I2*7+q.I3*4,E2);else near(q.I2,0);
  near(q.Pe,q.I1**2*5+q.I2**2*7+q.I3**2*4);
 }
 Object.assign(LabK.P,{E1:22,E2:19,closed:true});const q=LabK.solve();near(q.I1,2);near(q.I2,1);near(q.I3,3);
});
test('MNA battery polarity agrees with its drawn positive terminal, rotation and reverse polarity',()=>{
 for(const rot of [0,90])for(const flip of [false,true]){
  const vertical=rot===90,pieces=[{id:'b',type:'battery',x:40,y:40,rot,flip,E:12,r:2},{id:'r',type:'resistor',x:vertical?140:40,y:vertical?40:140,rot,R:4}];
  const wires=vertical?[{x1:40,y1:0,x2:140,y2:0},{x1:40,y1:80,x2:140,y2:80}]:[{x1:0,y1:40,x2:0,y2:140},{x1:80,y1:40,x2:80,y2:140}];
  const q=solveNetlist(pieces,wires);assert.equal(q.singular,false);const b=q.elements.find(e=>e.piece==='b'),r=q.elements.find(e=>e.piece==='r');near(b.I,2);near(b.U,8);near(r.I,flip?2:-2);
 }
});
test('generator combinations and matched load obey power balance',()=>{
 for(const mode of ['serie','paralel'])for(const n of [1,2,6])for(const R of [.1,2,20]){
 Object.assign(GenLab.S,{mode,n,R});const q=GenLab.values();near(q.Pg,q.P+q.I*q.I*q.rg);near(q.U,q.I*R);assert.ok(q.P<=q.Pmax+1e-9);
 GenLab.S.R=q.Ropt;const m=GenLab.values();near(m.P,m.Pmax);near(m.eta,50);
 }
});
test('all source exercises and quiz questions survive integration with corrected numeric checks',()=>{
 assert.equal(PROBLEMS.length,6);assert.equal(QUIZ.length,8);
 assert.match(PROBLEMS[3].verify(),/1[.,]35/);assert.match(PROBLEMS[4].verify(),/0[.,]555/);
 for(const q of QUIZ)assert.ok(q.a>=0&&q.a<q.o.length);
});
