import test from'node:test';import assert from'node:assert/strict';import vm from'node:vm';import{readFile}from'node:fs/promises';
const html=await readFile(new URL('../public/simulari/calcul-vectorial/index.html',import.meta.url),'utf8');
function harness(id,width=800){
 const observers=[],plots=[],bindings=[],records={},inputs={ax:2,ay:1,az:0,bx:1,by:3,bz:1,cx:0,cy:1,cz:2,k:2},pending=[],listeners={};let slider,defer=false;
 const ctx=new Proxy({measureText:()=>({width:8})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),canvas=()=>({style:{},getContext:()=>ctx,addEventListener(){},getBoundingClientRect:()=>({width,height:320}),setPointerCapture(){}}),cv=canvas(),mini=canvas(),outEl={innerHTML:''},root={querySelector:selector=>selector.includes('data-c=')?{get value(){return inputs[selector.match(/data-c="([^"]+)/)[1]];},set value(v){inputs[selector.match(/data-c="([^"]+)/)[1]]=v;}}:{},addEventListener:(name,fn)=>listeners[name]=fn};
 const sandbox={$:s=>s==='#calcOut'?outEl:s.startsWith('#')?root:cv,$$:(s)=>s==='canvas'?[cv,mini]:[],devicePixelRatio:1,ResizeObserver:class{constructor(cb){this.cb=cb;}observe(){observers.push(this.cb);}},IntersectionObserver:class{observe(){}},requestAnimationFrame:()=>1,performance:{now:()=>0},out:(r,v)=>Object.assign(records,v),setSlider(){},sliders:(r,cb)=>slider=cb,bind:(r,a)=>bindings.push(a),txt(){}};
 const context=vm.createContext(sandbox),math=html.slice(html.indexOf('const COL='),html.indexOf('function runner()'));const aliases=math.slice(0,math.indexOf('const $='))+math.slice(math.indexOf('const clamp='));vm.runInContext(aliases,context);
 vm.runInContext("function runner(){let id=0;const run=fn=>{const mine=++id;return fn(()=>mine===id)};run.cancel=()=>++id;return run}",context);
 sandbox.wait=async()=>true;sandbox.tw=(ms,fn,alive)=>defer?new Promise(resolve=>pending.push({step:t=>{if(!alive||alive())fn(t);if(t===1)resolve(!alive||alive());}})):Promise.resolve((fn(1),true));
 const planeCode=html.slice(html.indexOf('class Plane{'),html.indexOf('class View3D{')),BasePlane=vm.runInContext('('+planeCode.trim()+')',context),viewCode=html.slice(html.indexOf('class View3D{'),html.indexOf('/* --------- legături comune')),BaseView=vm.runInContext('('+viewCode.trim()+')',context);
 const drawing=Base=>class extends Base{constructor(...args){super(...args);this.arrows=[];this.lines=[];this.polys=[];plots.push(this);}render(){this.arrows=[];this.lines=[];this.polys=[];super.render();}arrow(a,b,c,o={}){this.arrows.push({a:[...a],b:[...b],label:o.label});}line(a,b){this.lines.push({a,b});}poly(points){this.polys.push(points);}arc(){}right(){}dot(){}text(){}path(){}grid(){}axes(){}drawHandles(){}};
 sandbox.Plane=drawing(BasePlane);sandbox.View3D=drawing(BaseView);
 const marker=id===11?"(()=>{const root=$('#calc')":"(()=>{const root=$('#fig"+id+"')",start=html.indexOf(marker),end=html.indexOf('})();',start)+5;vm.runInContext(html.slice(start,end),context);observers.forEach(fn=>fn());
 return {plots,records,inputs,outEl,bindings,pending,set:(k,v)=>slider(k,v),drag:(i,v)=>{const p=plots[0];p.onGrab?.();p.handles[i].set(...v);p.onChange();},input:()=>listeners.input(),defer:()=>{defer=true;},arrow:(name,p=plots[0])=>p.arrows.find(a=>a.label===name)};
}
const vector=a=>a.b.map((v,i)=>v-a.a[i]),near=(a,b)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<1e-9,x+' vs '+b[i]));},number=s=>parseFloat(String(s).replaceAll('−','-'));
test('figures 1–3: dragging, components, null-vector angles and sum agree with the drawing',async()=>{
 const a=harness(1);a.drag(0,[-1,2]);a.drag(1,[2,6]);near(vector(a.arrow('v')),[3,4]);assert.equal(number(a.records.mod),5);await a.bindings[0].equal();near(vector(a.arrow('u')),[3,4]);await a.bindings[0].opp();near(vector(a.arrow('− v')),[-3,-4]);a.drag(1,[-1,2]);assert.equal(a.records.th,'nedefinit');
 const b=harness(2);b.drag(0,[-3,4]);near(vector(b.arrow('v_x')),[-3,0]);near(vector(b.arrow('v_y')),[0,4]);assert.equal(number(b.records.mod),5);b.drag(0,[0,0]);assert.equal(b.records.al,'nedefinit');assert.equal(b.records.hat,'nedefinit');
 const c=harness(3);c.drag(0,[3,0]);c.drag(1,[0,4]);near(vector(c.arrow('R')),[3,4]);assert.equal(number(c.records.Rm),5);c.drag(1,[-3,0]);near(vector(c.arrow('R')),[0,0]);assert.equal(number(c.records.Rf),0);c.drag(0,[0,0]);assert.equal(c.records.al,'nedefinit');
});
test('figures 4–6: polygon, subtraction methods and scalar values update all geometry',async()=>{
 const a=harness(4);a.drag(0,[4,1]);const p=a.plots[0],forces=p.arrows.filter(x=>/^F_/.test(x.label)),sum=forces.reduce((s,v)=>vector(v).map((x,i)=>x+s[i]),[0,0]);near(vector(a.arrow('R')),sum);assert.equal(number(a.records.rx),sum[0]);assert.equal(number(a.records.ry),sum[1]);await a.bindings[0].eq();assert.ok(Math.hypot(number(a.records.rx),number(a.records.ry))<1e-9);
 const b=harness(5);b.drag(0,[4,2]);b.drag(1,[-1,3]);near(vector(b.arrow('d')),[5,-1]);await b.bindings[0].m2();near(vector(b.arrow('a − b')),[5,-1]);b.drag(0,[0,0]);assert.equal(b.records.al,'nedefinit');
 const c=harness(6);c.drag(0,[2,-1]);for(const k of [-3,0,.5,3]){c.set('k',k);if(k)near(vector(c.arrow('k · a')),[2*k,-k]);else assert.equal(c.arrow('k · a'),undefined);}c.drag(0,[0,0]);assert.match(c.records.sens,/nul/);
});
test('figure 8: signed projections, angles and null-vector cases match geometry',()=>{
 const a=harness(8);a.drag(0,[3,0]);a.drag(1,[-2,4]);assert.equal(number(a.records.d2),-6);assert.equal(number(a.records.pr),-2);assert.ok(a.plots[0].lines.some(l=>l.b[0]===-2&&l.b[1]===0));a.drag(1,[0,4]);assert.equal(number(a.records.th),90);assert.equal(number(a.records.pr),0);a.drag(0,[0,0]);assert.equal(a.records.th,'nedefinit');assert.equal(a.records.pr,'nedefinit');assert.equal(number(a.records.d2),0);assert.match(a.records.st,/nu este definit/);
});
test('figure 9: magnitudes, angle endpoints and interrupted swaps give the correct cross-product direction',async()=>{
 const h=harness(9);h.set('A',3);h.set('B',2);h.set('th',90);near(vector(h.arrow('a × b')),[0,0,3]);assert.equal(number(h.records.cm),6);h.set('th',0);assert.equal(h.arrow('a × b'),undefined);assert.equal(number(h.records.cm),0);h.set('th',180);assert.equal(h.arrow('a × b'),undefined);h.set('th',90);
 h.defer();const first=h.bindings[0].swap();h.pending[0].step(.25);const second=h.bindings[0].swap();h.pending[1].step(1);await second;h.pending[0].step(1);await first;near(vector(h.arrow('a × b')),[0,0,3]);assert.equal(number(h.records.cm),6);
});
test('figure 10: positive, negative and coplanar triple products equal base area times signed height',()=>{
 const h=harness(10);for(const beta of [-70,0,55,85])for(const phi of [0,40,180,360]){h.set('be',beta);h.set('ph',phi);const a=vector(h.arrow('a')),b=vector(h.arrow('b')),c=vector(h.arrow('c')),det=(a[0]*b[1]-a[1]*b[0])*c[2];assert.ok(Math.abs(number(h.records.mx)-det)<.006);assert.ok(Math.abs(number(h.records.V)-Math.abs(det))<.006);assert.ok(Math.abs(number(h.records.h)-Math.abs(c[2]))<.006);}
});
test('all 2D derived arrows and 3D extrema remain visible on small and large canvases',()=>{
 for(const width of [306,800])for(const id of [1,2,3,4,5,6,8,9,10,11]){const h=harness(id,width);if(id===3||id===5){h.drag(0,[6,4]);h.drag(1,[5,3]);}if(id===6)h.set('k',3);if(id===9){h.set('A',3.5);h.set('B',3.5);h.set('th',90);}const p=h.plots[0],poses=id>=9?[-Math.PI,-.7,0,Math.PI/2].flatMap(yaw=>[-.25,.4,1.45].map(pitch=>[yaw,pitch])):[[0,0]];for(const [yaw,pitch]of poses){if(id>=9){p.yaw=yaw;p.pitch=pitch;p.render();}for(const arrow of p.arrows)for(const point of [arrow.a,arrow.b]){const q=point.length===3?p.P(point):p.P(...point);assert.ok(q[0]>=15&&q[0]<=width-15,'fig '+id+' x='+q[0]);assert.ok(q[1]>=15&&q[1]<=p.h-15,'fig '+id+' y='+q[1]);}}}
});
test('figure 11: calculator inputs update scalar, vector and triple products and the scaled-vector drawing',()=>{
 for(const width of [306,800]){
  const h=harness(11,width);Object.assign(h.inputs,{ax:1,ay:0,az:0,bx:0,by:1,bz:0,cx:0,cy:0,cz:1,k:-3});h.input();
  const a=vector(h.arrow('a')),b=vector(h.arrow('b')),ka=vector(h.arrow('k · a')),cross=vector(h.arrow('a × b'));near(ka,a.map(x=>-3*x));near(cross,[0,0,a[0]]);near(vector(h.arrow('a + b')),a.map((x,i)=>x+b[i]));
  const rows=[...h.outEl.innerHTML.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map(m=>m[1]);assert.equal(rows[2],'(−3.00, 0.00, 0.00)');assert.equal(rows[5],'90.00°');assert.equal(number(rows[6]),0);assert.equal(rows[8],'(0.00, 0.00, 1.00)');assert.equal(number(rows[10]),1);assert.equal(rows[11],rows[12]);
  h.bindings[1].toggle('cc',true);assert.ok(h.arrow('c'));Object.assign(h.inputs,{cx:0,cy:0,cz:-2,k:2});h.input();assert.equal(number([...h.outEl.innerHTML.matchAll(/<dd>([\s\S]*?)<\/dd>/g)][10][1]),-2);near(vector(h.arrow('k · a')),vector(h.arrow('a')).map(x=>2*x));
  const p=h.plots[0];for(const ar of p.arrows)for(const point of [ar.a,ar.b]){const q=p.P(point);assert.ok(q[0]>=15&&q[0]<=width-15);assert.ok(q[1]>=15&&q[1]<=p.h-15);}
  Object.assign(h.inputs,{ax:0,ay:0,az:0,bx:0,by:0,bz:0,cx:0,cy:0,cz:0,k:0});h.input();assert.ok(!/NaN|Infinity/.test(h.outEl.innerHTML));assert.ok(h.outEl.innerHTML.includes('nedefinit'));
 }
});
test('stopping formula uses signed acceleration and explicitly states the positive-axis convention',async()=>{
 const motion=await readFile(new URL('../public/simulari/miscarea-rectilinie/index.html',import.meta.url),'utf8'),line=motion.split('\n').find(line=>line.includes('<i>d</i><sub>opr</sub> = '));assert.match(line,/<i>d<\/i><sub>opr<\/sub> = −<span class="frac">/);assert.ok(!line.includes('|<i>a</i>|'));assert.ok(motion.includes('v₀ > 0 și a < 0'));
 for(const [v0,a,t,d]of [[12,-2,6,36],[20,-4,5,50]]){assert.equal(-v0/a,t);assert.equal(-v0*v0/(2*a),d);}
 // Reversing the axis changes displacement sign, not the travelled distance.
 assert.equal(-(-12)/2,6);assert.equal(-((-12)**2)/(2*2),-36);
});

