import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
test('language change refreshes translated subscripts even when the source formula is unchanged',async()=>{
 let language='ro',previous=[],cached;
 const context=vm.createContext({window:{PraxisI18n:{tr:s=>s},PraxisWaveMath:{flatten:s=>s,subscribe(){},language:()=>language,render:s=>language+':'+s}},
  N:{useSyncExternalStore:(subscribe,snapshot)=>snapshot(),useMemo:(fn,deps)=>{if(deps.some((value,i)=>value!==previous[i])){cached=fn();previous=deps;}return cached;}},Cv:(tag,props)=>({tag,props})});
 vm.runInContext(await readFile(new URL('scripts/waves-math-components.js',root),'utf8'),context);
 const render=()=>vm.runInContext("LessonMathText({children:'v_adâncă = 6.12 m/s'})",context).props.dangerouslySetInnerHTML.__html;
 assert.match(render(),/^ro:/);language='en';assert.match(render(),/^en:/);
 context.window.PraxisI18n.tr=s=>s==='Constructivă: Δr = nλ'?'Constructive: Δr = nλ':s;
 const numbered=vm.runInContext("LessonMathText({children:'1. Constructivă: Δr = nλ'})",context);
 assert.match(numbered.props.dangerouslySetInnerHTML.__html,/1\. Constructive:/);
});
async function math(){
 const context=vm.createContext({window:{addEventListener(){},PraxisI18n:{language:'ro',tr:s=>s}}});
 vm.runInContext(await readFile(new URL('public/simulari/calorimetrie/vendor/katex/katex.min.js',root),'utf8'),context);
 context.window.katex=context.katex;
 vm.runInContext(await readFile(new URL('public/shared/waves-math.js',root),'utf8'),context);
 return context.window.PraxisWaveMath;
}

test('prose and equation suffixes retain structural indices without parsing entire sentences as equations',async()=>{
 const m=await math();
 for(const source of ['O traversare L/v_f durează 1,5 s.','Heat from Tᵢ to T_f in a closed vessel.','v = 2 m/s cu T_f și v_{f}.']){
  const html=m.render(source);assert.doesNotMatch(html,/wave-math-error/);
  assert.match(html,/<sub>f<\/sub>/);assert.doesNotMatch(html,/v_f|T_f|v_\{f\}/);
 }
 const escaped=m.render('Valorile T_f <script> nu sunt cod.');
 assert.doesNotMatch(escaped,/<script>/);assert.match(escaped,/&lt;/);assert.match(escaped,/&gt;/);
 assert.doesNotMatch(m.render('Fișierul raport_final.csv'),/<sub>/);
 for(const source of ['Componentele a_{t} și a_{n} sunt perpendiculare.','Forțele G și F_f sunt reale; F_cp este rezultanta.','Lucrul dintre T_{i} și T_{f}.','Pozițiile M_{1}(r_{1}) și M_{2}(r_{2}).','Intervalul dintre v_min și v_max.','Căldura specifică c_{p} a gazului.']){
  const html=m.render(source).replace(/<annotation\b[^>]*>[\s\S]*?<\/annotation>/g,'');
  assert.match(html,/<sub>|<msub>/,source);assert.doesNotMatch(html,/[A-Za-z]_(?:\{|[a-z])/);
 }
});

test('short equations do not absorb following explanatory prose into MathML',async()=>{
 const m=await math();
 for(const phrase of ['este frecvența maximelor','is the frequency of maxima','cu','with']){
  const rendered=m.render('f_b = |ν₁−ν₂| '+phrase);
  assert.ok(rendered.includes('<span class="wave-math-prose">'+phrase+'</span>'));
  assert.ok(!rendered.slice(0,rendered.indexOf('</math>')).includes(phrase));
 }
 assert.ok(m.render('v = √(g/k·tanh(kh)) — dispersivă').includes('wave-math-prose">— dispersivă'));
 assert.ok(!m.render('sin i / sin r = v₁/v₂').includes('wave-math-error'));
});

test('prose around physical letter subscripts and delta quantities retains stacked fractions',async()=>{
 const m=await math();
 for(const source of ['Hypocentral distance dₕ=Δt·vP·vS/(vP−vS)','Distanța hipocentrală dₕ=Δt·vP·vS/(vP−vS)','path difference Δr=λ/2']){
  assert.ok(m.formula(source));const html=m.render(source);
  assert.ok(html.includes('<mfrac>'),source);assert.ok(!html.includes('wave-math-error'));
 }
});
test('wave fractions preserve implicit products and explicit multiplication in the denominator',async()=>{
 const m=await math();
 assert.equal(m.toTex('gλ/2π'),'\\frac{g \\lambda}{2 \\pi}');
 assert.equal(m.toTex('g/k·tanh(kh)'),'\\frac{g}{k} \\cdot \\tanh\\left(k h\\right)');
 assert.equal(m.toTex('(Z₁-Z₂)/(Z₁+Z₂)'),'\\frac{Z_{1} - Z_{2}}{Z_{1} + Z_{2}}');
});
test('complete trigonometric and oscillator left sides are not discarded as prose',async()=>{
 const m=await math();
 assert.match(m.render('sin i / sin r = v₁/v₂'),/\\frac\{\\sin i\}\{\\sin r\}/);
 const full=m.render("Clădirea: m·x'' + c·x' + k·x = -m·a_g(t)");
 assert.match(full,/m \\cdot x\^\{\\prime \\prime\} \+ c \\cdot x\^\{\\prime\} \+ k \\cdot x/);
 assert.match(m.render('A wave travels at v = 340 m/s'),/wave-math-prose">A wave travels at /);
});
test('fraction boundaries exclude sentence punctuation, subsequent quantities, and trailing SI units',async()=>{
 const m=await math();
 assert.equal(m.toTex('ν = 1/T.'),'\\nu = \\frac{1}{T} .');
 assert.equal(m.toTex('f₀ = 10/N Hz'),'f_{0} = \\frac{10}{N} \\,\\mathrm{Hz}');
 assert.equal(m.toTex('19.89 µW/m²'),'19.89 \\,\\frac{\\mathrm{µW}}{\\mathrm{m}^{2}}');
 const parts=m.statements('λ=22.0km vL=3.95km/s δ≈13km');assert.equal(parts.length,3);
});
test('all subscript alphabets and decimal powers stay attached to their bases',async()=>{
 const m=await math();
 assert.equal(m.toTex('dₕ²'),'d_{h}^{2}');
 assert.doesNotMatch(m.render('a = ω√(1/vS₁²−1/vL²)'),/wave-math-error/);
 assert.equal(m.toTex('x^0.25'),'x^{0.25}');
 assert.equal(m.toTex('√9000'),'\\sqrt{9000}');
 assert.equal(m.toTex('f(v±vo)/(v∓vs)'),'\\frac{f \\left(v \\pm v_{o}\\right)}{v \\mp v_{s}}');
});
test('the reviewed formula families retain their scientific fraction structure',async()=>{
 const m=await math();
 const families=[
  ['ω = 2π/T','\\omega = \\frac{2 \\pi}{T}'],
  ['v_f = λ/T','v_{f} = \\frac{\\lambda}{T}'],
  ['v = √(T_m/μ)','v = \\sqrt{\\frac{T_{m}}{\\mu}}'],
  ['v_l = √(E/ρ)','v_{l} = \\sqrt{\\frac{E}{\\rho}}'],
  ['R_p = (Z₂-Z₁)/(Z₂+Z₁)','R_{p} = \\frac{Z_{2} - Z_{1}}{Z_{2} + Z_{1}}'],
  ['sin r = (v₂/v₁)·sin i','\\sin r = \\left(\\frac{v_{2}}{v_{1}}\\right) \\cdot \\sin i'],
  ['νₙ = n·v/(2L)','\\nu_{n} = \\frac{n \\cdot v}{2 L}'],
  ['νₙ = (2n-1)·v/(4L)','\\nu_{n} = \\frac{\\left(2 n - 1\\right) \\cdot v}{4 L}'],
  ['I = E/(Δt·S)','I = \\frac{E}{\\Delta t \\cdot S}'],
  ['I = ½ρvω²A²','I = \\frac{1}{2} \\rho v \\omega^{2} A^{2}'],
  ['L = 10·log₁₀(I/I₀)','L = 10 \\cdot \\log_{10}\\left(\\frac{I}{I_{0}}\\right)'],
  ["f' = f·(v+v_o)/(v-v_s)",'f^{\\prime} = \\frac{f \\cdot \\left(v + v_{o}\\right)}{v - v_{s}}'],
  ['d_h = Δt·vP·vS/(vP-vS)','d_{h} = \\frac{\\Delta t \\cdot v_{P} \\cdot v_{S}}{v_{P} - v_{S}}'],
  ['Q = 1/(2ζ)','Q = \\frac{1}{2 \\zeta}'],
  ['f₀ = (1/2π)√(k/m)','f_{0} = \\left(\\frac{1}{2 \\pi}\\right) \\sqrt{\\frac{k}{m}}'],
  ['1/(4μL²)','\\frac{1}{4 \\mu L^{2}}'],
  ['sinβ/β','\\frac{\\sin \\beta}{\\beta}']
 ];
 for(const [source,expected]of families){assert.equal(m.toTex(source),expected,source);assert.doesNotMatch(m.render(source),/wave-math-error/,source);}
});
test('spherical-wave relations retain proportionality and equality signs in the imported lesson',async()=>{
 const m=await math(),html=m.render('A ∝ 1/r ; I = P/(4πr²)');
 assert.equal(m.toTex('A ∝ 1/r'),'A \\propto \\frac{1}{r}');
 assert.match(html,/<mo>∝<\/mo>/);assert.match(html,/<mo>=<\/mo>/);assert.match(html,/<mfrac>/);assert.doesNotMatch(html,/wave-math-error/);
 const imported=await readFile(new URL('public/simulari/unde-mecanice/index.html',root),'utf8');
 assert.ok(imported.includes('A ∝ 1/r ; I = P/(4πr²)'),'source must use explicit physical relations');
});
test('wave indices and unit powers use structural MathML, including complete Romanian labels',async()=>{
 const m=await math(),html=m.render('v_adâncă = √(gλ/2π) = 6.12 m/s ; I₀ = 10⁻¹² W/m²');
 assert.match(html,/msub/);assert.match(html,/adâncă/);assert.match(html,/msup/);
 assert.match(html,/mfrac/);assert.match(html,/msqrt/);assert.doesNotMatch(html,/wave-math-error/);
});
test('formula statements remain separate and prose does not become part of a fraction',async()=>{
 const m=await math(),parts=m.statements('Coardă: λ = v·T ; ν = 1/T ⇒ v = λ/T');
 assert.ok(parts.length>=3);
 assert.doesNotMatch(m.toTex('Coardă: λ/T'),/\\frac\{[^}]*Coardă/);
 assert.equal(m.statements('y = A sin ωt | v = 2 m/s').length,2);
 assert.equal(m.statements('vR ≈ 0.9194vS | vS₁ < vL < vS₂').length,2);
});
test('derivative primes and numerical SI units render without changing the displayed values',async()=>{
 const m=await math();
 assert.doesNotMatch(m.render("m·x'' + c·x' + k·x = -m·a_g(t)"),/wave-math-error/);
 assert.equal(m.toTex('6.12 m/s'),'6.12 \\,\\frac{\\mathrm{m}}{\\mathrm{s}}');
});
test('a parenthetical converted value is outside the SI-unit denominator',async()=>{
 const m=await math(),tex=m.toTex('6.12 m/s (22.0 km/h)');
 assert.equal(tex,'6.12 \\,\\frac{\\mathrm{m}}{\\mathrm{s}} \\left(22.0 \\,\\frac{\\mathrm{km}}{\\mathrm{h}}\\right)');
 assert.equal(m.toTex('½ρω²A²'),'\\frac{1}{2} \\rho \\omega^{2} A^{2}');
 assert.match(m.toTex('6.11 m/s — dispersivă'),/\\frac\{\\mathrm\{m\}\}\{\\mathrm\{s\}\}/);
});
test('a formula embedded in an explanation keeps the prose outside the mathematical numerator',async()=>{
 const m=await math(),source='Fundul oprește mișcarea verticală, iar a = A·cosh(k(z+h))/sinh(kh)';
 assert.equal(m.formula(source),true);
 const rendered=m.render(source);
 assert.match(rendered,/wave-math-prose[^>]*>Fundul/);
 assert.match(rendered,/mfrac/);
 assert.doesNotMatch(rendered,/wave-math-error/);
});
test('mode-ratio lists keep their commas as separators rather than decimal commas',async()=>{
 const m=await math();
 assert.equal(m.toTex('[1,2.758,5.406]'),'\\left[1 , 2.758 , 5.406\\right]');
});
test('variable exponents and scientific-notation values retain their mathematical meaning',async()=>{
 const m=await math();
 assert.equal(m.toTex('e^{qz}'),'e^{q z}');
 assert.equal(m.toTex('1e-12'),'1 \\times 10^{-12}');
});
test('short connecting words in mixed explanations remain prose',async()=>{
 const m=await math();
 assert.match(m.toTex('w = 0 la z = -h'),/\\text\{la \}/);
});
test('absolute-value differences remain one numerator, including the subtraction inside the bars',async()=>{
 const m=await math();
 assert.equal(m.toTex('2π·|x₂-x₁|/λ'),'\\frac{2 \\pi \\cdot \\left|x_{2} - x_{1}\\right|}{\\lambda}');
 assert.equal(m.statements('| Δφ | = 2π | Δx | /λ').length,1);
});
test('standalone mathematical choices are formatted without treating unit labels or export names as formulas',async()=>{
 const m=await math();
 assert.equal(m.bare('λ/(2L)'),true);
 assert.equal(m.bare('√(T/μ)'),true);
 assert.equal(m.bare('m/s'),false);
 assert.equal(m.bare('Descarcă CSV/JSON'),false);
 assert.equal(m.inline({type:'span',props:{contentEditable:true,children:'1/2'}}),false);
});
