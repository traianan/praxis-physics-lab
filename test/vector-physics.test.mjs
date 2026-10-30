import test from'node:test';import assert from'node:assert/strict';import vm from'node:vm';import{readFile}from'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('inclined-plane arrows and readouts scale with mass, preserve vector sum and stay inside the drawing',async()=>{
 const html=await read('public/simulari/calcul-vectorial/index.html'),start=html.indexOf("(()=>{const root=$('#fig7')"),end=html.indexOf('})();',start)+5,code=html.slice(start,end);
 for(const width of [306,800]){
  let slider,actions,readouts,plane;const root={},arrows=new Map();
  class Plane{constructor(canvas,options){this.w=width;this.h=320;this.o=options;this.ctx={clearRect(){}};plane=this;}render(){arrows.clear();this.o.draw(this);}arrow(a,b,color,options){arrows.set(options.label,{a,b});}line(){}poly(){}arc(){}right(){}dot(){}}
  vm.runInNewContext(code,{$:selector=>selector==='#fig7'?root:{},runner:()=>()=>{},Plane,DEG:180/Math.PI,COL:{},clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),add:(a,b)=>a.map((x,i)=>x+b[i]),mul:(a,k)=>a.map(x=>x*k),out:(r,v)=>readouts=v,setSlider(){},sliders:(r,cb)=>slider=cb,bind:(r,a)=>actions=a,f:(n,d=2)=>n.toFixed(d)});
  actions.toggle('N',true);
  const length=name=>{const {a,b}=arrows.get(name);return Math.hypot(b[0]-a[0],b[1]-a[1]);};
  for(const angle of [0,31,65]){
   slider('al',angle);slider('m',1);const unitForce=length('G'),unitTangential=length('G_t'),unitNormal=length('G_n'),scale=plane.u;
   for(const mass of [.5,2,7.5,10]){
    slider('m',mass);assert.equal(plane.u,scale,'no mass-dependent zoom');
    assert.ok(Math.abs(length('G')-mass*unitForce)<1e-12);assert.ok(Math.abs(length('G_t')-mass*unitTangential)<1e-12);assert.ok(Math.abs(length('G_n')-mass*unitNormal)<1e-12);assert.ok(Math.abs(length('N')-length('G_n'))<1e-12);
    const g=arrows.get('G'),t=arrows.get('G_t'),n=arrows.get('G_n');for(let i=0;i<2;i++)assert.ok(Math.abs((t.b[i]-t.a[i])+(n.b[i]-n.a[i])-(g.b[i]-g.a[i]))<1e-12);
    assert.ok(Math.abs(parseFloat(readouts.G)-mass*9.81)<.006);assert.ok(Math.abs(parseFloat(readouts.Gt)-mass*9.81*Math.sin(angle*Math.PI/180))<.006);assert.ok(Math.abs(parseFloat(readouts.Gn)-mass*9.81*Math.cos(angle*Math.PI/180))<.006);
    for(const {a,b}of arrows.values())for(const [x,y]of [a,b]){const px=plane.ox+x*plane.u,py=plane.oy-y*plane.u;assert.ok(px>=20&&px<=width-20,'horizontal bounds');assert.ok(py>=20&&py<=300,'vertical bounds: '+py);}
   }
  }
 }
});
