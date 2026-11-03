import {extractCoreFunction} from './waves-core-audit-adapter.mjs';

export const canvasFormulaTranslations={
 'Fără bătăi: frecvențe egale':'No beats: equal frequencies',
 'Orbite liniare: raportul axelor este păstrat; scara poate varia.':'Linear orbits: axis ratio is preserved; scale may vary.'
};

function unique(source,before,after){
 const start=source.indexOf(before);
 if(start<0||source.indexOf(before,start+before.length)>=0)throw Error('Canvas formula replacement must be unique: '+before.slice(0,100));
 return source.slice(0,start)+after+source.slice(start+before.length);
}
function replaceCanvasCall(source,argumentPrefix,replacement='void 0'){
 const start=source.indexOf(argumentPrefix);
 if(start<0||source.indexOf(argumentPrefix,start+argumentPrefix.length)>=0)throw Error('Canvas formula call must be unique: '+argumentPrefix);
 const dot=source.lastIndexOf('.fillText(',start);let begin=dot;
 if(dot<0)throw Error('Missing fillText receiver');
 while(begin>0&&/[\w$]/.test(source[begin-1]))begin--;
 let depth=0,quote=null;
 for(let i=source.indexOf('(',dot);i<source.length;i++){
  const c=source[i];
  if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}
  if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='(')depth++;
  if(c===')'&&!--depth)return source.slice(0,begin)+replacement+source.slice(i+1);
 }
 throw Error('Unclosed canvas formula call');
}
function compactReadout(children){return 'f("div",{className:"mt-2 flex flex-wrap gap-3 text-sm",children:['+children.join(',')+']}),';}
const math=expression=>'t(LessonMathText,{children:'+expression+'})';

export function adaptWaveCanvasFormulas(html,reverse=false){
 if(reverse)return html.replace(/\/\*praxis-canvas-formula:([A-Za-z0-9+/=]+)\*\/[\s\S]*?\/\*\/praxis-canvas-formula\*\//g,(_,source)=>Buffer.from(source,'base64').toString('utf8'));
 if(html.includes('/*praxis-canvas-formula:'))throw Error('Canvas formula layer already applied');
 function adapt(name,change){
  const before=extractCoreFunction(html,name),after=change(before);
  if(before===after)throw Error('No canvas formula change: '+name);
  html=unique(html,before,`/*praxis-canvas-formula:${Buffer.from(before).toString('base64')}*/${after}/*/praxis-canvas-formula*/`);
 }
 adapt('Um',source=>{
  source=replaceCanvasCall(source,'`v_f = λ/T = ');
  return unique(source,'" rad, în fază dacă Δφ=2πn, opoziție (2n+1)π"','" rad = ",(Math.abs(U)*180/Math.PI).toFixed(0),"°"');
 });
 adapt('dm',source=>replaceCanvasCall(source,'"Snell: sin r / sin i = v2/v1"'));
 adapt('Pm',source=>{
  source=replaceCanvasCall(source,'"I(θ)=I₀·(sinβ/β)², β=(πa/λ)·sinθ"');
  return unique(source,'f("div",{className:"mt-2 flex gap-3 items-center text-sm"',compactReadout([math('"I(θ) = I₀·(sin β/β)² ; β = (πa/λ)·sin θ"')])+'f("div",{className:"mt-2 flex gap-3 items-center text-sm"');
 });
 // Vm is the actual Kundt component. wm is the unrelated measurement journal.
 adapt('Vm',source=>{
  source=replaceCanvasCall(source,'`λ = v/f = ');
  source=replaceCanvasCall(source,'`L = ${u.toFixed(2)} m = ');
  // Preserve the computed wavelength in addition to the existing resonance controls.
  return unique(source,'f("div",{className:"grid md:grid-cols-3 gap-3 text-[13px]"',compactReadout([math('`λ = v/f = ${T.toFixed(3)} m`')])+'f("div",{className:"grid md:grid-cols-3 gap-3 text-[13px]"');
 });
 adapt('Jm',source=>{
  for(const prefix of ['`Love SH: vL=','`Rayleigh: vR≈0.92 vS=','`Profil P-SV; k=2π/λ;'])source=replaceCanvasCall(source,prefix);
  return source;
 });
 adapt('hm',source=>{
  source=replaceCanvasCall(source,'`f_bătăi = |f1-f2| = ');
  source=replaceCanvasCall(source,'beat.period===null?"Fără bătăi: frecvențe egale"');
  return unique(source,'f("div",{className:"mt-3 grid md:grid-cols-3 gap-3 text-sm"',compactReadout([
   math('`f_b = |f₁ − f₂| = ${waveCoreBeatState(e,r).frequency.toFixed(1)} Hz`'),
   'waveCoreBeatState(e,r).period===null?t("span",{children:"Fără bătăi: frecvențe egale"}):'+math('`T_b = 1/f_b = ${waveCoreBeatState(e,r).period.toFixed(3)} s`')
  ])+'f("div",{className:"mt-3 grid md:grid-cols-3 gap-3 text-sm"');
 });
 adapt('_m',source=>{
  for(const prefix of ['"A = const, I = const (sursă la ∞)"','"Sferic: r₀ = 0,20 m"','`A/A₀ = '])source=replaceCanvasCall(source,prefix);
  return unique(source,'f("div",{className:"mt-3 flex flex-wrap items-center gap-3 text-sm"',compactReadout([
   math('`r₀ = ${d.toFixed(2)} m`'),math('`A/A₀ = ${(d/l).toFixed(3)}`'),math('`I/I₀ = ${((d/l)**2).toFixed(4)}`')
  ])+'f("div",{className:"mt-3 flex flex-wrap items-center gap-3 text-sm"');
 });
 adapt('Em',source=>{
  source=replaceCanvasCall(source,'"Apă adâncă: circular (a≈b=A·e^{kz})');
  source=replaceCanvasCall(source,JSON.stringify('Orbite liniare: aceeași scară pe cele două axe ale fiecărei elipse; scara poate diferi între elipse.'));
  const note='Orbite liniare: raportul axelor este păstrat; scara poate varia.';
  source=unique(source,'F=Math.min(q*0.45,q-110)','F=q*0.4');
  // This note belongs next to the orbit canvas, rather than inside its pixel buffer.
  const prefix='t("canvas",{ref:e,width:800,height:170';
  source=unique(source,prefix,'t("p",{className:"text-xs",children:'+JSON.stringify(note)+'}),'+prefix);
  return source;
 });
 return html;
}
