import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';import vm from'node:vm';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8'),window={};vm.runInNewContext(await read('public/shared/mcu-model.js'),{window});const M=window.PraxisMCUModel,near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);
test('bank drawing uses one proportional scale for all forces and keeps arrow endpoints inside the scene',async()=>{
 const source=await read('public/shared/mcu.js'),body=source.slice(source.indexOf('  function bank(){'),source.indexOf('  function draw(){'));
 for(const w of [320,565,640])for(const vectorScale of [.25,.75,1.5])for(const bankAngle of [0,10,20])for(const mu of [0,.3,.6])for(const bankSpeed of [0,12,40]){
  const h=620,bankRadius=20,s=M.bank(bankRadius,bankAngle,mu,bankSpeed),t=bankAngle*Math.PI/180,c=Math.cos(t),sin=Math.sin(t),arrows=[];
  const g=new Proxy({},{get:(_,key)=>()=>{}});
  vm.runInNewContext(body+'bank();',{prepare:()=>({g,w,h}),bankCanvas:{},palette:()=>({}),model:M,bankRadius,bankAngle,mu,bankSpeed,vectorScale,label:()=>{},arrow:(_g,x,y,dx,dy)=>arrows.push({x,y,dx,dy})});
  const forces=[[0,M.g],[-s.N*sin,-s.N*c],[s.friction*c,-s.friction*sin],...(Math.hypot(s.realX,s.realY)>1e-9?[[s.realX,-s.realY]]:[]),...(s.q>1e-9?[[-s.q,0]]:[]),[s.friction*c,-s.friction*sin],[s.realX,-s.realY],[-s.q,0]];
  const up=Math.max(s.N*c,s.friction*sin,0),down=Math.max(M.g,-s.friction*sin,0),left=Math.max(s.N*sin,-s.friction*c,s.q,0),right=Math.max(s.friction*c,0),x=w*.55;
  const factor=Math.min(190*vectorScale/Math.max(M.g,s.N,Math.abs(s.friction),Math.hypot(s.realX,s.realY),s.q),(h-255)/(up+down),(x-20)/Math.max(left,.001),(w-x-20)/Math.max(right,.001),(w*.7-60)/Math.max(-s.realX,s.q,Math.abs(s.friction*c),.001));
  assert.equal(arrows.length,forces.length);
  arrows.forEach((a,i)=>{near(a.dx,forces[i][0]*factor);near(a.dy,forces[i][1]*factor);for(const [x,y]of [[a.x,a.y],[a.x+a.dx,a.y+a.dy]])assert.ok(x>=8&&x<=w-8&&y>=8&&y<=h-8,JSON.stringify({w,vectorScale,bankAngle,mu,bankSpeed,x,y}));});
 }
});
test('uniform circular motion: derivatives, orthogonality, period and Newton law agree for both rotation senses',()=>{
 for(const R of [.5,2,5])for(const omega of [-4,-.1,.1,1.2,4])for(const m of [.1,1,5])for(const theta of [0,.7,2.8]){
  const s=M.circular(R,omega,m,theta),dt=1e-5,a=M.circular(R,omega,m,theta-omega*dt),b=M.circular(R,omega,m,theta+omega*dt);
  near((b.x-a.x)/(2*dt),s.vx,1e-7);near((b.y-a.y)/(2*dt),s.vy,1e-7);near((b.vx-a.vx)/(2*dt),s.ax,1e-6);near((b.vy-a.vy)/(2*dt),s.ay,1e-6);near(s.vx*s.ax+s.vy*s.ay,0);near(s.a,s.v*s.v/R);near(s.F,m*s.a);near(s.frequency*s.T,1);
 }assert.equal(M.circular(2,0).T,Infinity);
});
test('bank speed limits agree with friction inequalities and available forces never exceed static-friction capacity',()=>{
 for(const r of [20,50,200])for(const angle of [0,10,20,60])for(const mu of [0,.05,.3,.6,1]){
  const s=M.bank(r,angle,mu),t=angle*Math.PI/180;
  for(const v of [0,s.min,s.optimal,...(Number.isFinite(s.max)?[s.max,s.max+1]:[100])]){
   const q=M.bank(r,angle,mu,v);assert.ok(Math.abs(q.friction)<=q.capacity+1e-8);assert.equal(q.status==='safe',Math.abs(q.requiredFriction)<=q.capacity+1e-7);
   if(q.status==='safe'){near(q.realX,-v*v/r);near(q.realY,0);}near(q.N,M.g*Math.cos(t)+v*v/r*Math.sin(t));
  }
 }near(M.bank(50,0,.3).max,Math.sqrt(50*9.81*.3));near(M.bank(50,10,0).min,M.bank(50,10,0).max);assert.equal(M.bank(50,60,1).max,Infinity);
});
test('worked disk and bank problems have independently checked numerical answers',()=>{
 near(60/(2*Math.PI)*Math.sqrt(.24*9.81/.6),18.916286426021365,1e-10);
 const b=M.bank(50,10,.3);near(b.min,0);near(b.optimal,9.299913119889995,1e-10);near(b.max,15.706294688921131,1e-10);
});
test('everyday examples: rpm conversion, equal angular speeds and doubled period',()=>{
 const wheel=M.circular(.35,120/60*2*Math.PI);
 near(wheel.T,.5);near(wheel.v,4.39822971502571);near(wheel.a,55.2697846461004);
 const outer=M.circular(2,Math.PI/2),inner=M.circular(1,Math.PI/2),slower=M.circular(2,Math.PI/4);
 near(outer.T,inner.T);near(outer.v,2*inner.v);near(outer.a,2*inner.a);
 near(slower.T,2*outer.T);near(slower.v,outer.v/2);near(slower.a,outer.a/4);
 // One extra lap is independent of track radius.
 for(const radius of [20,50,100]){const L=2*Math.PI*radius,time=L/(15-10);near(15*time/L,3);near(10*time/L,2);}
});
test('MCU source is preserved; distributed lesson has nine tabs, three laboratories, accessible controls and complete local assets',async()=>{
 const info=JSON.parse(await read('docs/imported-mcu.json'));assert.equal(createHash('sha256').update(await read(info.source)).digest('hex'),info.sha256);const html=await read('public/simulari/miscarea-circulara-uniforma/index.html'),app=await read('public/simulari/miscarea-circulara-uniforma/app.js');
 assert.equal((html.match(/data-tab=/g)||[]).length,9);assert.doesNotMatch(app,/manual|Litera|\bpag\.?\s*\d/i);assert.match(app,/data-mcu-phase/);for(const key of ['bank-angle','bank-friction','bank-radius','bank-speed'])assert.ok(app.includes(key));
 for(const lang of ['ro','en']){const d=JSON.parse(await read('public/locales/mcu/'+lang+'.json'));assert.ok(Object.keys(d.messages).length>180);assert.doesNotMatch(JSON.stringify(d),/manual|Litera|\bpag\.?\s*\d/i);}assert.doesNotMatch(html,/<(?:script|link)\b[^>]*(?:src|href)="https?:/);
});

test('the acceleration diagram has equal tangent velocities and the difference goes from the first tip to the second',async()=>{
 const source=await read('scripts/adaptations/mcu-jsx.js'),start=source.indexOf('function McuAccelerationFigure()');
 const root=vm.runInNewContext('('+source.slice(start)+')()',{mcuJsx:(type,props)=>({type,...props})});
 const circle=root.children[0].children[0],triangle=root.children[1].children[0],velocities=circle.children.filter(n=>n.type==='g').map(n=>n.children[0]),arrows=triangle.children.filter(n=>n.type==='g').map(n=>n.children[0]);
 assert.equal(velocities.length,2);for(const v of velocities){near(Math.hypot(v.x1-110,v.y1-128),70);near((v.x1-110)*(v.x2-v.x1)+(v.y1-128)*(v.y2-v.y1),0);near(Math.hypot(v.x2-v.x1,v.y2-v.y1),64);}
 const [v1,v2,dv]=arrows;near(dv.x1,v1.x2);near(dv.y1,v1.y2);near(dv.x2,v2.x2);near(dv.y2,v2.y2);
 const mid={x:velocities[0].x1+velocities[1].x1-220,y:velocities[0].y1+velocities[1].y1-256},delta={x:dv.x2-dv.x1,y:dv.y2-dv.y1};near(mid.x*delta.y-mid.y*delta.x,0);assert.ok(mid.x*delta.x+mid.y*delta.y<0);
});

test('vector notation uses separate arrow symbols and real subscripts instead of unsupported combining glyphs',async()=>{
 const context={window:{PraxisI18n:{tr:s=>s,language:'ro'}},Rc:(type,props)=>({type,...props})};vm.createContext(context);vm.runInContext(await read('scripts/adaptations/mcu-jsx.js'),context);
 const result=vm.runInContext("mcuJsx('code',{children:'F_cp = -m ω² R⃗'})",context),nodes=[];function visit(n){if(!n||typeof n!=='object')return;nodes.push(n);const children=Array.isArray(n.children)?n.children:[n.children];children.forEach(visit);}visit(result);
 assert.equal(nodes.filter(n=>n.className==='mcu-vector-symbol').length,2);assert.equal(nodes.filter(n=>n.type==='sub'&&n.children==='cp').length,1);assert.doesNotMatch(JSON.stringify(result),/\u20d7/);
});

test('force notation distinguishes vector identities from magnitudes and projections',async()=>{
 const context={};vm.createContext(context);vm.runInContext(await read('scripts/adaptations/mcu-jsx.js'),context);
 const notation=value=>context.mcuNotation(value);
 assert.equal(notation('F_i = -m·a₀'),'F⃗_i = −m·a⃗₀');
 assert.equal(notation('F_cf = m ω² R'),'F⃗_cf = m ω² R⃗');
 assert.equal(notation('ΣF = m·a_cp = F_cp'),'ΣF⃗ = m·a⃗_cp = F⃗_cp');
 assert.equal(notation('F_cp + F_cf = 0 în SRNI (echilibru aparent)'),'F⃗_cp + F⃗_cf = 0⃗ în SRNI (echilibru aparent)');
 for(const scalar of ['F_cp = m·a_cp = m·v²/R = m·ω²·R','F_cp = m·a_cp','m v²/r = N sinθ ± μ N cosθ','0 = N cosθ ∓ μ N sinθ - m g','Condiție: F_fmax = F_cp'])assert.equal(notation(scalar),scalar);
 assert.equal(notation('ΣF — rezultanta N + G + F_f'),'ΣF⃗ — rezultanta N⃗ + G⃗ + F⃗_f');
});

test('velocity and acceleration vectors stay distinct from scalar magnitudes in both languages',async()=>{
 const context={};vm.createContext(context);vm.runInContext(await read('scripts/adaptations/mcu-jsx.js'),context);
 const n=context.mcuNotation;
 assert.equal(n('Δv = v₂ - v₁'),'Δv⃗ = v⃗₂ - v⃗₁');
 assert.equal(n('v ⟂ R, |v|=const'),'v⃗ ⟂ R⃗, |v|=const');
 assert.equal(n('Δv → 0 când Δt → 0'),'Δv⃗ → 0⃗ când Δt → 0');
 assert.equal(n('Draw Δv from the tip of v₁ to the tip of v₂.'),'Draw Δv⃗ from the tip of v⃗₁ to the tip of v⃗₂.');
 assert.equal(n('In vector form: a = −ω²R.'),'In vector form: a⃗ = −ω²R⃗.');
 assert.equal(n(' a_cp'),' a⃗_cp');assert.equal(n(' v'),' v⃗');
 for(const scalar of ['v = ωR','a_cp = ω²R','a_cp = v² / R = ω² R','v₁ = 15 m/s, v₂ = 10 m/s','Viteză test v','v_min','v_max','ω = 2π/T','v₀ = √(r g tgθ)','|v| = const'])assert.equal(n(scalar),scalar);
});

test('Canvas labels draw vector accents for velocity and acceleration, but not the radius length',async()=>{
 const source=await read('public/shared/mcu.js'),body=source.slice(source.indexOf('  function label('),source.indexOf('  function arrow('));
 for(const [text,count]of [['v',1],['a_cp',1],['F_cp',1],['ΣF',1],['R',0],['O',0]]){
  let strokes=0;const g={praxisWidth:400,praxisHeight:300,praxisLabelBoxes:[],measureText:s=>({width:s.length*8}),fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){strokes++;}};
  vm.runInNewContext(body+'label(g,text,20,28,"blue");',{g,text,tr:s=>s,document:{documentElement:{}},getComputedStyle:()=>({getPropertyValue:()=> 'Arial'})});assert.equal(strokes,count,text);
 }
});
