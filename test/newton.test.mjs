import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8'),scope={};vm.runInNewContext(await read('public/shared/newton-model.js'),scope);const M=scope.PraxisNewtonModel;
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
test('Newton: force scaling, inertia, momentum balance and mean impulse agree',()=>{
 near(M.acceleration(16,5),3.2);near(M.meanForce(.2,8,.1),16);near(M.extension(1,50),.196);
 for(const m1 of [20,40,120])for(const m2 of [20,80,120])for(const J of [0,10,40]){const r=M.recoil(m1,m2,J);near(m1*r.v1+m2*r.v2,0);near(r.v1,-J/m1);near(M.acceleration(0,m1),0);}
});
test('incline balances normal and tangential forces; static friction adapts and kinetic friction dissipates',()=>{
 for(const m of [1,5,20])for(const angle of [0,20,30,50])for(const muS of [0,.4,1])for(const fraction of [0,.75,1]){
  const q=M.incline(m,angle,muS,muS*fraction),a=angle*Math.PI/180;
  near(q.N,m*9.8*Math.cos(a));near(q.parallel-q.friction,m*q.acceleration);
  assert.ok(q.friction>=0&&q.friction<=q.limit+1e-8);if(!q.sliding)near(q.friction,q.parallel);else{assert.ok(q.acceleration>0);near(q.friction,muS*fraction*q.N);}
 }near(M.incline(5,0,.4,.3).friction,0);assert.equal(M.incline(5,Math.atan(.4)*180/Math.PI,.4,.3).sliding,false);
 const q=M.incline(5,30,.4,.3);near(q.limit,16.974097914175);near(q.acceleration,2.35388531287375);
});
test('force parallelogram covers equal, opposite and perpendicular forces',()=>{
 near(M.resultant(40,30,90),50);near(M.resultant(80,80,0),160);near(M.resultant(80,80,180),0);near(M.resultant(80,30,180),50);
});
test('vertical spring oscillation satisfies Newton and Hooke laws and conserves energy',()=>{
 for(const m of [.1,1,4])for(const k of [10,50,200]){
  const rest=M.spring(m,k);near(rest.x,m*9.8/k);near(rest.elastic,rest.weight);near(rest.a,0);near(rest.v,0);
  const initial=M.spring(m,k,0,true);near(initial.x,1.25*rest.equilibrium);near(initial.v,0);near(initial.a,-9.8/4);
  for(const fraction of [0,.125,.25,.5,.75,1,2.125]){
   const q=M.spring(m,k,rest.period*fraction,true);near(q.elastic,k*q.x);near(q.elasticX,-k*q.x);near(q.net,m*q.a);near(q.energy,initial.energy);assert.ok(q.x>0);
  }
  const upper=M.spring(m,k,rest.period/2,true);near(upper.x,.75*rest.equilibrium);near(upper.a,9.8/4);
 }
});
test('spring period, velocity and acceleration agree with independent derivatives',()=>{
 for(const m of [.1,1,4])for(const k of [10,50,200]){
  const T=2*Math.PI*Math.sqrt(m/k);near(M.spring(m,k).period,T);
  for(const fraction of [.1,.25,.4,.7]){
   const t=T*fraction,dt=T*1e-6,a=M.spring(m,k,t-dt,true),q=M.spring(m,k,t,true),b=M.spring(m,k,t+dt,true),again=M.spring(m,k,t+3*T,true);
   near((b.x-a.x)/(2*dt),q.v,1e-6);near((b.v-a.v)/(2*dt),q.a,1e-6);near(again.x,q.x);near(again.v,q.v);
  }
 }
});
test('cart playback preserves physical motion at different rates and stops at the exact arrival time',()=>{
 const limit=440/12,a=3,arrival=Math.sqrt(2*limit/a);
 for(const rate of [.1,.5,1,2])for(const fps of [30,60,120]){
  let s={F:30,m:10,x:0,v:0,t:0},remaining=1.5/rate;
  while(remaining>1e-12){const wall=Math.min(1/fps,remaining);s={...s,...M.cartStep(s,wall*rate)};remaining-=wall;}
  near(s.t,1.5,1e-8);near(s.x,.5*a*1.5**2,1e-8);near(s.v,a*1.5,1e-8);
  s={...s,...M.cartStep(s,arrival+1)};near(s.x,limit);near(s.t,arrival);near(s.v,a*arrival);assert.equal(s.end,true);
 }
 const coast=M.cartStep({F:0,m:10,x:2,v:5,t:1},.5);near(coast.x,4.5);near(coast.v,5);near(coast.t,1.5);
});
test('automatic cart repetition preserves leftover time across frame boundaries and restarts from rest',()=>{
 const a=3,arrival=Math.sqrt(2*(440/12)/a),duration=3*arrival+.321;
 for(const fps of [30,60,120])for(const rate of [.1,.5,2]){
  let s={F:30,m:10,x:0,v:0,t:0},remaining=duration;
  while(remaining>1e-12){const dt=Math.min(rate/fps,remaining);s={...s,...M.cartStep(s,dt,true)};remaining-=dt;}
  near(s.t,.321,1e-8);near(s.x,.5*a*.321**2,1e-8);near(s.v,a*.321,1e-8);assert.equal(s.end,false);
 }
 const still=M.cartStep({F:0,m:10,x:0,v:0,t:0},5,true);near(still.x,0);near(still.v,0);near(still.t,5);
});
const inertiaSource=await read('public/shared/newton.js'),inertiaHelpers=inertiaSource.slice(inertiaSource.indexOf(' function releaseInertia('),inertiaSource.indexOf(' function bind('));
function inertiaClock(rate=1,repeat=false){const state={playing:true,inertia:{angle:-Math.PI/2,released:false,t:0,circleT:0,trail:[],rate,repeat,repeatReleaseTime:null,autoReleaseTime:null}};return {state,...vm.runInNewContext(inertiaHelpers+';({releaseInertia,stepInertia})',{state,syncPlay(){}})};}
test('inertia keeps physical angular speed and tangent velocity at every playback rate, with the velocity tip inside the scene',()=>{
 for(const rate of [.1,1,2]){
  const C=inertiaClock(rate),s=C.state.inertia;C.stepInertia(.6/rate);near(s.angle,-Math.PI/2+.9);C.releaseInertia(s);
  const x0=280+112*Math.cos(s.releaseAngle),y0=200+112*Math.sin(s.releaseAngle),vx=-168*Math.sin(s.releaseAngle),vy=168*Math.cos(s.releaseAngle),dt=Math.min(.1,s.endT/2);
  C.stepInertia(dt/rate);near(s.t,dt);near(s.trail.at(-1)[0],x0+vx*dt);near(s.trail.at(-1)[1],y0+vy*dt);near((x0-280)*vx+(y0-200)*vy,0);
 }
 for(let a=0;a<2*Math.PI;a+=.1){const C=inertiaClock(),s=C.state.inertia;s.angle=a;C.releaseInertia(s);assert.ok(s.endT>0);C.stepInertia(s.endT);const [x,y]=s.trail.at(-1),tipX=x-Math.sin(a)*68,tipY=y+Math.cos(a)*68;assert.ok(tipX>=40-1e-8&&tipX<=600+1e-8&&tipY>=48-1e-8&&tipY<=352+1e-8);assert.equal(C.state.playing,false);}
});
test('inertia repetition preserves the selected release point and leftover frame time across rates',()=>{
 for(const rate of [.1,1,2])for(const fps of [30,120]){
  const C=inertiaClock(rate,true),s=C.state.inertia;C.stepInertia(.6/rate);C.releaseInertia(s);const duration=3*(.6+s.endT)+.2;
  // Start a fresh cycle, preserving the memorised release point.
  C.state.inertia.angle=-Math.PI/2;s.circleT=0;s.t=0;s.released=false;s.autoReleaseTime=s.repeatReleaseTime;s.trail=[];
  let remaining=duration/rate;while(remaining>1e-12){const dt=Math.min(1/fps,remaining);C.stepInertia(dt);remaining-=dt;}
  near(s.circleT,.2,1e-8);near(s.angle,-Math.PI/2+.3,1e-8);near(s.repeatReleaseTime,.6,1e-8);assert.equal(s.released,false);assert.equal(C.state.playing,true);
 }
});
test('new lesson has bilingual parity, one correct option per question, nine tabs and no source mentions',async()=>{
 const ro=JSON.parse(await read('public/locales/newton/ro.json')),en=JSON.parse(await read('public/locales/newton/en.json'));
 assert.deepEqual(Object.keys(ro.sections),Object.keys(en.sections));assert.deepEqual(Object.keys(ro.ui),Object.keys(en.ui));assert.equal(ro.tabs.length,9);
 for(const d of [ro,en]){assert.equal(d.questions.length,14);assert.equal(d.problems.length,4);assert.doesNotMatch(JSON.stringify(d),/manual|litera|textbook|\bpag\.?\s*\d/i);for(const q of d.questions){assert.equal(q[1].length,4);assert.ok(q[2]>=0&&q[2]<4);assert.equal(new Set(q[1]).size,4);}}
 const html=await read('public/simulari/principiile-mecanicii-newtoniene/index.html');assert.doesNotMatch(html,/(?:src|href)="https?:/);assert.equal((html.match(/role="tab"/g)||[]).length,9);
});
