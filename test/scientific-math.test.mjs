import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {scientificMathRuntime} from '../scripts/scientific-math-runtime.mjs';
async function setup(){
 const window={addEventListener(){},PraxisI18n:{language:'ro',tr:s=>s}},document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(await scientificMathRuntime(),{window,document,Set,WeakMap});return window;
}
test('common math uses a local lazy engine and preserves healthy renderers',async()=>{
 const w=await setup();assert.equal(w.katex,undefined);
 const html=w.PraxisMath.render('a = ΣF/m');assert.ok(w.katex);assert.ok(html.includes('<mfrac>'));
 const original=w.katex;w.PraxisMath.tex('pV^{1.40}=C');assert.equal(w.katex,original);
 assert.equal(w.PraxisWaveMath,undefined);
});
test('formulas from all subject families retain fractions, exponents and signs',async()=>{
 const m=(await setup()).PraxisMath;
 for(const source of ['v = 2πR/T','a = ΣF/m','a⃗ = ΣF⃗/m','U = 4ε[(σ/r)^12 − (σ/r)^6]','K = √(D/(ρh))/(2πa²)','ε = T_r/(T_c − T_r)','μ = (N₁μ₁+N₂μ₂)/(N₁+N₂)']){
  const html=m.render(source);assert.ok(!html.includes('wave-math-error'),source);assert.ok(html.includes('<mfrac>'),source);
 }
 const tex=m.tex('pV^{1.40}=C');assert.ok(tex.includes('<msup>'));assert.ok(!tex.includes('¹·⁴'));
 assert.ok(m.render('a⃗ = ΣF⃗/m').includes('<mover'));
 assert.ok(m.render('r₀ = 2^(1/6)·σ').includes('<msup><mn>2</mn><mfrac>'));
 assert.ok(m.formula('Accelerația a⃗ = ΣF⃗/m'));
 assert.equal(m.toTex('tgθ'),'\\tan \\theta');
 assert.ok(m.render('tgθ = v²/(Rg)').includes('tan'));
 assert.equal(m.toTex('Aᵧ²'),'A_{y}^{2}');
});
test('scientific prose attaches scripts and escapes arbitrary markup',async()=>{
 const m=(await setup()).PraxisMath,html=m.prose('T_f, Q_if, E_total <script>');
 assert.ok(html.includes('<msub>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
 assert.equal((m.prose('Proiecțiile vₓ și vᵧ').match(/<msub>/g)||[]).length,2);
});
test('native updates replace mathematical values while preserving host identity and language source',async()=>{
 const w=await setup(),m=w.PraxisMath,classes=new Set();
 const el={nodeType:1,tagName:'OUTPUT',isConnected:true,dataset:{},innerHTML:'',plain:'',classList:{add:v=>classes.add(v),contains:v=>classes.has(v)},setAttribute(){},closest:()=>null,matches:()=>true,querySelectorAll:()=>[],get childNodes(){return[{nodeType:3,data:this.plain}];}};
 m.set(el,'a = 1/2');assert.ok(el.innerHTML.includes('<mn>1</mn><mn>2</mn>'));
 const same=el;m.typeset(el);assert.equal(el,same);
 el.plain='a = 3/4';el.innerHTML=el.plain;m.typeset(el);
 assert.ok(el.innerHTML.includes('<mn>3</mn><mn>4</mn>'));assert.equal(el.dataset.scienceSource,'a = 3/4');
 w.PraxisI18n.language='en';m.typeset(el);assert.equal(el,same);assert.ok(el.innerHTML.includes('<mfrac>'));
});

test('native enhancement leaves raw TeX source and its text node for the existing KaTeX renderer',async()=>{
 const math=(await setup()).PraxisMath;
 for(const source of [String.raw`\(a = \frac{v^2}{R}\)`,String.raw`\frac{v^2}{R}`,'$a = v²/R$','$$T_0 = 1/ν$$']){
  const text={nodeType:3,data:source},childNodes=[text];let writes=0,html=source;
  const host={nodeType:1,tagName:'P',isConnected:true,dataset:{},children:[],childNodes,
   classList:{contains:()=>false,add(){}},closest:()=>null,querySelector:()=>null,querySelectorAll:()=>[],
   matches:selector=>selector.includes('.formula,.newton-formula'),setAttribute(){},
   get innerHTML(){return html;},set innerHTML(value){writes++;html=value;}};
  math.enhance(host);
  assert.equal(writes,0,source);assert.equal(host.innerHTML,source);
  assert.equal(host.childNodes,childNodes);assert.equal(host.childNodes[0],text);assert.equal(text.data,source);
  assert.equal(host.dataset.scienceMath,undefined);assert.equal(host.dataset.scienceSource,undefined);
 }
});

test('native vector markers and the formula DOM surrounding them retain their original nodes',async()=>{
 const math=(await setup()).PraxisMath;
 for(const isMarker of [false,true]){
  const marker={nodeType:1,tagName:'SPAN',className:'vec',classList:{contains:name=>name==='vec'},childNodes:[{nodeType:3,data:'a'}]};
  const childNodes=isMarker?marker.childNodes:[marker,{nodeType:3,data:' = F/m'}];
  let writes=0,html=isMarker?'a':'<span class="vec">a</span> = F/m';
  const host={nodeType:1,tagName:isMarker?'SPAN':'P',isConnected:true,dataset:{},children:isMarker?[]:[marker],childNodes,
   classList:{contains:()=>false,add(){}},closest:()=>null,setAttribute(){},
   matches:selector=>selector==='[data-science-math]'||selector==='[data-no-science-math]'?false:selector==='.vec'?isMarker:true,
   querySelector:selector=>selector.includes('.vec')&&!isMarker?marker:null,querySelectorAll:()=>[],
   get innerHTML(){return html;},set innerHTML(value){writes++;html=value;}};
  const original=host.innerHTML;math.enhance(host);
  assert.equal(writes,0);assert.equal(host.innerHTML,original);assert.equal(host.childNodes,childNodes);
  assert.equal(host.dataset.scienceMath,undefined);assert.equal(host.dataset.scienceSource,undefined);
  if(!isMarker)assert.equal(host.childNodes[0],marker);
 }
});
