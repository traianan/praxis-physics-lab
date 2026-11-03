import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import vm from'node:vm';
const read=name=>readFile(new URL('../public/simulari/miscarea-rectilinie/js/'+name,import.meta.url),'utf8'),core=await read('core.js');
function runtime(){
 class Element{constructor(){this.value='';this.checked=false;this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={add(){},remove(){}};this.lastElementChild={innerHTML:''};}set innerHTML(s){this.html=s;if(!s)this.children=[];}get innerHTML(){return this.html??'';}prepend(li){li.parent=this;this.children.unshift(li);}remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}get lastChild(){return this.children.at(-1);}addEventListener(){}closest(){return this;}querySelector(){return null;}querySelectorAll(){return[];}}
 const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},document={documentElement:{},getElementById:el,querySelector:s=>el(s.replace(/^#/,'')),querySelectorAll:()=>[],createElement:()=>new Element()},window={addEventListener(){},PraxisI18n:{language:'ro',locale:'ro-RO'},PraxisSound:{enabled:false}},sandbox={window,document,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},getComputedStyle:()=>({getPropertyValue:()=> '#000000'})};
 const context=vm.createContext(sandbox);vm.runInContext(core,context);const MR=window.MR;MR.sound.on=false;const tracks=[],plots=[],bindings={};MR.Track=class{constructor(c,o){this.id=[...elements].find(([k,v])=>v===c)?.[0];this.o=o;tracks.push(this);}set(scene){this.scene=scene;}setRange(min,max){this.o={min,max};}};MR.Plot=class{constructor(c){this.id=[...elements].find(([k,v])=>v===c)?.[0];plots.push(this);}set(s){this.scene=s;}setCursor(t){this.scene.cursor=t;}};MR.transport=()=>({update(){}});MR.bindControls=(root,fn)=>bindings[[...elements].find(([k,v])=>v===root)[0]]=fn;MR.setVal=(id,value)=>el(id).value=String(value);MR.chipGroup=()=>{};
 return{MR,context,el,tracks,plots,bindings};
}
async function uv(){const h=runtime();for(const [id,v]of Object.entries({'uv-x0':-40,'uv-v0':12,'uv-a':-2,'uv-T':10}))h.el(id).value=v;const src=await read('sec3-mruv.js'),stop=src.indexOf('  /* ================= Calculator Galilei');vm.runInContext(src.slice(0,stop)+'MR.audit={U,X,V,A,dist,setup,frame,run};})();',h.context);return {...h,...h.MR.audit};}
const near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<eps,a+' vs '+b);
test('MRUV: signed states, distance, track and plot functions agree before/after reversal and braking',async()=>{
 const h=await uv();for(const v0 of [-12,0,12])for(const a of [-2,0,2])for(const brake of [false,true]){
  for(const [id,v]of Object.entries({'uv-x0':-40,'uv-v0':v0,'uv-a':a,'uv-T':10}))h.el(id).value=v;h.el('uv-brake').checked=brake;h.setup();const stop=v0*a<0?-v0/a:Infinity;
  for(const t of [0,3,6,8,10]){const time=brake?Math.min(t,stop):t,x=-40+v0*time+a*time*time/2,v=brake&&t>=stop?0:v0+a*t,acc=brake&&t>=stop?0:a,dist=t<=stop||!Number.isFinite(stop)?Math.abs(v0*t+a*t*t/2):v0*v0/(2*Math.abs(a))+(brake?0:Math.abs(a)*(t-stop)**2/2);
   near(h.X(t),x);near(h.V(t),v);near(h.A(t),acc);near(h.dist(t),dist);h.frame(t,t,false);near(h.tracks[0].scene.bodies[0].x,x);near(h.plots[0].scene.series[0].fn(t),x);near(h.plots[1].scene.series[0].fn(t),v);near(h.plots[2].scene.series[0].fn(t),acc);
  }
 }
});
test('one stop event per journal; reset clears it; origin tangency and both roots in one step are detected',async()=>{
 const h=await uv();h.frame(6.05,5.95,true);h.frame(6.05,5.95,true);assert.equal(h.el('uv-log').children.length,1);assert.match(h.el('uv-log').children[0].innerHTML,/m și/);h.run.reset();assert.equal(h.el('uv-log').children.length,0);
 h.el('uv-x0').value=-36;h.setup();h.frame(6.1,5.9,true);const origin=h.el('uv-log').children.filter(li=>li.innerHTML.includes('originea O'));assert.equal(origin.length,1);assert.match(origin[0].innerHTML,/ajunge/);
 h.run.reset();h.el('uv-x0').value=-35.9999;h.setup();h.frame(6.02,5.98,true);assert.equal(h.el('uv-log').children.filter(li=>li.innerHTML.includes('originea O')).length,2);
 h.el('uv-brake').checked=true;h.setup();h.frame(6,6,false);assert.match(h.el('uv-phase').lastElementChild.innerHTML,/repaus/);
});
test('MRU, average velocity and meetings handle negative directions, equal velocities and time endpoints',async()=>{
 const h=runtime();for(const [id,v]of Object.entries({'d-t1':2,'d-t2':8,'d-x1':-10,'d-x2':-40,'mru-x0':40,'mru-v':-8,'mru-T':12,'met-xa':80,'met-va':-10,'met-xb':-70,'met-vb':5}))h.el(id).value=v;
 let src=await read('sec2-mru.js');src=src.slice(0,src.lastIndexOf('})();'))+'MR.audit={M,E,xm,mSetup,mFrame,eSetup,eFrame,xa,xb,depUpdate};})();';vm.runInContext(src,h.context);const a=h.MR.audit;
 for(const v of [-8,0,8]){h.el('mru-v').value=v;a.mSetup();a.mFrame(5,5,false);near(h.tracks.find(t=>t.id==='mru-track').scene.bodies[0].x,40+v*5);near(h.plots.find(p=>p.id==='mru-pv').scene.series[0].fn(5),v);}
 h.el('d-t1').value=20;h.el('d-t2').value=20;a.depUpdate('d-t1');assert.ok(+h.el('d-t2').value>+h.el('d-t1').value);h.el('d-t2').value=0;a.depUpdate('d-t2');assert.ok(+h.el('d-t2').value>+h.el('d-t1').value);assert.ok(!/Infinity|NaN/.test(h.el('dep-vm').innerHTML));
 a.eSetup();near(a.xa(10),a.xb(10));h.el('met-vb').value=-10;a.eSetup();assert.match(h.el('met-status').lastElementChild.innerHTML,/Nu se întâlnesc/);h.el('met-xb').value=80;a.eSetup();assert.match(h.el('met-status').lastElementChild.innerHTML,/mereu/);
});
test('Galilei solver keeps all valid signed roots and rejects past-only or inconsistent data',()=>{
 const {MR}=runtime(),solve=MR.solveGalilei;
 const s=solve('v0',{v:10,a:2,dx:20});assert.equal(s.solutions.length,2);for(const c of s.solutions){assert.ok(c.t>=0);near(c.value+2*c.t,10);near(c.value*c.t+c.t*c.t,20);}
 near(solve('v',{v0:-10,a:-2,dx:-36}).solutions[0].value,-Math.sqrt(244));assert.equal(solve('v',{v0:0,a:0,dx:0}).solutions[0].value,0);assert.equal(solve('v',{v0:10,a:0,dx:-20}).ok,false);
 assert.equal(solve('a',{v0:10,v:-10,dx:20}).ok,false);assert.equal(solve('dx',{v0:20,v:10,a:2}).ok,false);assert.equal(solve('dx',{v0:0,v:0,a:0}).solutions[0].value,0);assert.equal(solve('a',{v0:0,v:0,dx:1}).ok,false);assert.equal(solve('v',{v0:NaN,a:1,dx:2}).ok,false);
 near(solve('a',{v0:-10,v:-20,dx:-75}).solutions[0].value,-2);near(solve('dx',{v0:-10,v:-20,a:-2}).solutions[0].value,-75);
 assert.equal(MR.roots(1,2,1).length,1);const roots=MR.roots(1,-1e8,1);near(roots[0],1e-8,1e-15);near(roots[1],1e8,1e-7);
});
function problemBank(source){const end=source.indexOf('  /* ---------- stare ----------');const window={MR:{},PraxisI18n:{language:"ro"},innerWidth:1280};return vm.runInNewContext(source.slice(0,end)+'return P;})();',{window});}
const problemsSource=await read('sec4-probleme.js'),problems=problemBank(problemsSource);
function answers(id,p){const u=p.vk/3.6;switch(id){case'vmed':return[p.vk,u];case'lege':return[p.x0+p.v*p.t,-p.x0/p.v];case'opuse':return[p.t,p.va*p.t];case'urmarire':{const t=p.v1*p.dt/(p.v2-p.v1);return[t,p.v2*t];}case'jumatati':return[2/(1/p.v1+1/p.v2)];case'pod':return[(p.L+p.P)/u];case'grafic-xt':return[p.v1,-p.v2,p.ti,p.v1*p.ti];case'repaus':return[p.a*p.t,p.a*p.t*p.t/2];case'franare':return[u/p.a,u*u/(2*p.a)];case'grafic-vt':{const d=p.V*(p.t1/2+p.t2+p.t3/2);return[p.V/p.t1,-p.V/p.t3,d,d/(p.t1+p.t2+p.t3)];}case'galilei':return[(p.u*p.u-p.u0*p.u0)/(2*p.d),2*p.d/(p.u+p.u0)];case'expertiza':return[p.u,3.6*p.u,p.u/p.a];case'decolare':return[u*u/(2*p.d),u/Math.sqrt(2),Math.sqrt(2)*p.d/u];case'secunda':return[p.a*p.k*p.k/2,p.a*(p.k-.5)];case'vertical':return[p.u0*p.u0/20,p.u0/5];case'doua-inaltimi':return[p.t1,p.t2,5*(p.t2-p.t1)];case'balcon':return[p.u0/5,5*p.T*p.T-p.u0*p.T+p.u0*p.u0/20,p.T,10*p.T-p.u0];case'camion':return[2*p.u/p.a,2*p.u*p.u/p.a,2*p.u];case'intalnire-mruv':return[p.t,p.a1*p.t*p.t/2,p.a1*p.t,-p.a2*p.t];case'intoarcere':{const t=p.u0/p.a,T=t+p.ex;return[t,p.u0*T-p.a*T*T/2,p.u0*t/2+p.a*p.ex*p.ex/2];}default:throw Error(id);}}
test('all 20 motion problems: original and 32 regenerated sets agree with independent answers and finite solutions',()=>{
 assert.equal(problems.length,20);for(const problem of problems){for(const p of [problem.base,...Array.from({length:32},()=>problem.gen())]){const expected=answers(problem.id,p),actual=problem.ans(p);assert.equal(actual.length,expected.length);actual.forEach((a,i)=>{assert.ok(Number.isFinite(a.v));near(a.v,expected[i],Math.max(1e-7,Math.abs(expected[i])*1e-10));});const content=problem.text(p)+problem.steps(p).flat().join('')+(problem.fig?.(p)||'');assert.ok(!/NaN|Infinity|undefined/.test(content),problem.id);}}
});
const exports={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports,module:{exports}});
function declaration(code,name){let found;const ast=exports.parse(code,{ecmaVersion:'latest'});function visit(n){if(!n||typeof n!=='object')return;if(n.type==='VariableDeclarator'&&n.id.name===name)found=n.init;for(const [k,v]of Object.entries(n))if(k!=='start'&&k!=='end')if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}visit(ast);return code.slice(found.start,found.end);}
test('classification examples have consistent derivatives and all ten quiz keys match their physical cases',async()=>{
 const src=await read('sec1-tipuri.js'),ACC=vm.runInNewContext('('+declaration(src,'ACC')+')'),QS=vm.runInNewContext('('+declaration(src,'QS')+')');for(const d of Object.values(ACC))for(const t of [.5,2,5]){const dt=.0001;near((d.x(t+dt)-d.x(t-dt))/(2*dt),d.v(t),1e-6);near((d.v(t+dt)-d.v(t-dt))/(2*dt),d.a(t),1e-6);}
 const expected=[['rect','unif'],['rect','acc'],['rect','inc'],['curb','unif'],['curb','var'],['rect','acc'],['rect','inc'],['curb','unif'],['rect','var'],['curb','var']];assert.equal(QS.length,10);QS.forEach((q,i)=>assert.deepEqual([q.t,q.a],expected[i]));
});
test('measuring all trajectory descriptions leaves the selected description unchanged',async()=>{
 const src=await read('sec1-tipuri.js'),start=src.indexOf('  function trajInfo('),end=src.indexOf('  function trajResize(',start),live={innerHTML:''},MR={};
 vm.runInNewContext('const TRAJ='+declaration(src,'TRAJ')+';let tKind="circ";const $=()=>live;'+src.slice(start,end)+'trajInfo();',{live,MR,document:{createElement:()=>({innerHTML:''})}});
 const before=live.innerHTML,variants=MR.motionTypeInfoVariants();assert.equal(variants.length,5);assert.equal(new Set(variants).size,5);assert.equal(live.innerHTML,before);assert.match(before,/Mișcarea circulară/);assert.ok(variants.some(html=>html.includes('Mișcarea eliptică')));
});
test('acceleration layout variants contain every explanation without operating the simulation',async()=>{
 const src=await read('sec1-tipuri.js'),start=src.indexOf('  function accelerationInfo('),end=src.indexOf('  function aSetup()',start),MR={};
 vm.runInNewContext('const ACC='+declaration(src,'ACC')+';'+src.slice(start,end),{MR,document:{createElement:()=>({innerHTML:''})}});
 const variants=MR.accelerationInfoVariants();assert.equal(variants.length,4);assert.equal(new Set(variants).size,4);
 for(const word of ['Mișcare uniformă','Mișcare uniform accelerată','Mișcare uniform încetinită','Mișcare variată'])assert.ok(variants.some(s=>s.includes(word)));
});
test('random-test marking gives 10 for all correct, 1 for all wrong and per-problem partial credit',async()=>{
 const src=await read('sec4-test.js'),start=src.indexOf('  function finish(auto)'),end=src.indexOf('    const msg =',start),fn=src.slice(start,end)+'return {res,grade,round};}',parseStart=problemsSource.indexOf('  const parse ='),parseEnd=problemsSource.indexOf('  function check()',parseStart),PB=vm.runInNewContext('(function(){'+problemsSource.slice(parseStart,parseEnd)+'return {parse,near};})()');PB.markSolved=()=>{};
 for(const mode of ['correct','wrong','partial']){const items=problems.slice(0,5).map(p=>({p,q:p.base,vals:p.ans(p.base).map((a,i)=>mode==='correct'||mode==='partial'&&i===0?String(a.v):'999999')})),finish=vm.runInNewContext('('+fn+')',{stopTimer(){},T:{items,t0:0,lim:0},PB,PTS:1.8});const r=finish(false),expected=mode==='correct'?10:mode==='wrong'?1:1+items.reduce((sum,item)=>sum+1.8/item.p.ans(item.q).length,0);near(r.grade,expected);assert.ok(r.grade>=1-1e-9&&r.grade<=10+1e-9);}
 assert.equal(PB.parse('−12,5'),-12.5);assert.equal(PB.parse('Infinity'),null);assert.equal(PB.near(-10,10),false);
});

test('plot scrubbing stops on pointer cancellation',async()=>{
 const {MR,context}=runtime(),handlers={},canvas={getContext:()=>({}),getBoundingClientRect:()=>({left:0,width:400}),addEventListener:(name,fn)=>handlers[name]=fn,setPointerCapture(){}};
 // Use the original plotting class, rather than the lightweight model fixture.
 context.ResizeObserver=class{observe(){}};vm.runInContext(await read('plot.js'),context);const plot=new MR.Plot(canvas,{onScrub:()=>scrubs++});let scrubs=0;plot.scene={t0:0,t1:10};handlers.pointerdown({clientX:100,pointerId:1});assert.equal(scrubs,1);handlers.pointercancel();handlers.pointermove({clientX:300});assert.equal(scrubs,1);assert.equal(plot.drag,false);
});
