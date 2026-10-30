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
test('fracture reaches R before separation and removes transmitted load at the same instant',()=>{
 for(const kind of ['ductile','brittle','elastomer']){
  const end=M.curves[kind].at(-1),before=M.fracture(kind,6-1e-6),hit=M.fracture(kind,6),after=M.fracture(kind,7),done=M.fracture(kind,8);
  assert.equal(before.broken,false);assert.ok(before.x<end[0]&&before.load>0);near(hit.x,end[0]);near(hit.y,end[1]);assert.equal(hit.broken,true);near(hit.load,0);assert.ok(hit.gap>0&&after.gap>hit.gap);near(done.x,hit.x);near(done.y,hit.y);assert.equal(done.done,true);
  for(const t of [0,1,3,5]){const q=M.fracture(kind,t);near(q.y,M.stress(kind,q.x));near(q.x,end[0]*t/6);assert.equal(q.unloading,false);}
 }
});
test('ductile necking starts at M, grows towards R and persists through fracture and plastic unloading',()=>{
 const atM=6*.70/.94;near(M.fracture('ductile',atM).neck,0);
 let previous=0;for(let i=1;i<=20;i++){const t=atM+(6-atM)*i/20,q=M.fracture('ductile',t);near(q.neck,i/20);assert.ok(q.neck>previous);previous=q.neck;if(i<20)assert.equal(q.broken,false);}
 near(M.fracture('ductile',6).neck,1);near(M.fracture('ductile',8).neck,1);
 const peak=M.cycle('ductile',90,4);assert.ok(peak.neck>0);near(M.cycle('ductile',90,8).neck,peak.neck);near(M.cycle('ductile',60,4).neck,0);
 for(const kind of ['brittle','elastomer'])for(const t of [0,4,5,6,8])near(M.fracture(kind,t).neck,0);
 near(M.fracture('ductile',0).neck,0);
});
