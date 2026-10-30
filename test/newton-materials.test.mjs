import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const scope={};vm.runInNewContext(await readFile(new URL('../public/shared/newton-materials-model.js',import.meta.url),'utf8'),scope);const M=scope.PraxisMaterialModel;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('elastic specimens recover completely; loading and unloading retrace without hysteresis',()=>{
 for(const [kind,level] of [['ductile',20],['brittle',85],['elastomer',85]]){
  for(const t of [0,1,2,3,4]){const a=M.cycle(kind,level,t),b=M.cycle(kind,level,8-t);near(a.x,b.x);near(a.y,b.y);}
  const q=M.cycle(kind,level,8);near(q.x,0);near(q.y,0);assert.equal(q.done,true);
 }
});
test('plastic unloading is continuous, has the initial elastic slope and retains strain at zero stress',()=>{
 for(const level of [30,60,90]){const top=M.cycle('ductile',level,4),end=M.cycle('ductile',level,8),middle=M.cycle('ductile',level,6);assert.ok(end.x>0&&end.x<top.x);near(end.y,0);near((top.y-middle.y)/(top.x-middle.x),.42/.16);near(M.cycle('ductile',level,4+1e-10).y,top.y);near(end.x,end.residual);}
});
