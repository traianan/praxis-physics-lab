// Whole-literal corrections: markers are code comments, never visible text.
export const formulaContentTranslations={};
// Corrected RO key -> original RO lookup key. The importer can retrieve the
// existing EN translation before applying the same math-only corrections.
export const formulaContentOriginals={};
// True only when a correction supplies English for the entire original literal.
// Substring replacements must not overwrite surrounding translated prose.
export const formulaContentCustomEnglish={};
const corrections=[
 ['Factorul sin(2πx/λ) = amplitudine dependentă de poziție.','Factorul sinus este adimensional. Amplitudinea locală: A_st(x) = 2A·|sin(2πx/λ)|.','The sine factor is dimensionless. Local amplitude: A_st(x) = 2A·|sin(2πx/λ)|.'],
 ['|sin|=1','|sin(2πx/λ)|=1','|sin(2πx/λ)|=1'],
 ['Pentru presiune acustică: R_p=(Z₂-Z₁)/(Z₂+Z₁)','Pentru presiune acustică la incidență normală: R_p=(Z₂-Z₁)/(Z₂+Z₁). Coardă: Z=T_m/v=√(T_m·μ). Fluid: Z=ρv.','For acoustic pressure at normal incidence: R_p=(Z₂-Z₁)/(Z₂+Z₁). String: Z=T_m/v=√(T_m·μ). Fluid: Z=ρv.'],
 ['Pentru instrumente reale, corecție de capăt ΔL≈0.3·d.','Pentru un capăt deschis neflanșat, corecția aproximativă este ΔL≈0.3·d, cu d diametrul. L_eff = L + ΣΔL, însumând corecțiile capetelor deschise.','For an unflanged open end, the approximate correction is ΔL≈0.3·d, where d is diameter. L_eff = L + ΣΔL, summing the corrections at open ends.'],
 ['ω=2πν, viteza de fază unghiulară.','ω=2πν=2π/T, pulsația oscilației (rad/s).','ω=2πν=2π/T, angular frequency (rad/s).'],
 ['coardă √(T/μ), sunet √(γRT/M).','coardă: √(T_m/μ); gaz ideal: √(γR T_abs/M). T_m: tensiune; T_abs: temperatură absolută.','string: √(T_m/μ); ideal gas: √(γR T_abs/M). T_m: tension; T_abs: absolute temperature.'],
 ['I(r)=I₀·R₀²/r²','I(r)=I(R₀)·R₀²/r²','I(r)=I(R₀)·R₀²/r²'],
 ['10·log(I/I₀)','10·log₁₀(I/I₀)','10·log₁₀(I/I₀)'],
 ['10log(I/I₀)','10·log₁₀(I/I₀)','10·log₁₀(I/I₀)'],
 ['10 log(I/I₀)','10·log₁₀(I/I₀)','10·log₁₀(I/I₀)'],
 ['log10=6','log₁₀(I/I₀) = log₁₀(10⁶) = 6','log₁₀(I/I₀) = log₁₀(10⁶) = 6'],
 ['ν₁=v/2L=94.87/1.2=79.05 Hz','ν₁ = v/(2L) ≈ 94.87/1.2 ≈ 79.06 Hz','ν₁ = v/(2L) ≈ 94.87/1.2 ≈ 79.06 Hz'],
 ['n=2 => (2*2-1)=3','n = 2 ⇒ (2·2−1) = 3','n = 2 ⇒ (2·2−1) = 3'],
 ['Δr=nλ → constr, Δr=(2n+1)λ/2 → distr','Constructivă: Δr = nλ ; Distructivă: Δr = (2n+1)λ/2 ; n = 0,1,2,…','Constructive: Δr = nλ ; Destructive: Δr = (2n+1)λ/2 ; n = 0,1,2,…'],
 ['0.75/0.5=1.5 = (2*1+1)/2 => distructiv','m = Δr/λ = 0.75/0.5 = 1.5 ; m = (2·1+1)/2 ; interferență distructivă','m = Δr/λ = 0.75/0.5 = 1.5 ; m = (2·1+1)/2 ; destructive interference'],
 ['√rigid','√(k_rel)','√(k_rel)'],
 ['Metodă: autocorelare pe buffer timeDomain → T₀ = lag max corelație → f = sr/T₀. Note: midi = 69+12·log₂(f/440).','Autocorelare: N₀ este decalajul în eșantioane; T₀ = N₀/f_s ; f = f_s/N₀. f_s este frecvența de eșantionare. MIDI = 69+12·log₂(f/440).','Autocorrelation: N₀ is the sample lag; T₀ = N₀/f_s ; f = f_s/N₀. f_s is the sample rate. MIDI = 69+12·log₂(f/440).']
];
/** Correct standalone formulas or formula substrings in already translated text.
 * Pass 'en' to select authored English for exact Romanian correction fragments.
 * Numbered solution prefixes and all unmodified surrounding prose are retained.
 */
export function correctFormulaText(value,language='ro'){
 if(typeof value!=='string')return value;
 let revised=value;
 for(const[before,after,english]of corrections)revised=revised.replaceAll(before,language==='en'?english:after);
 return revised;
}
export function adaptWaveFormulaContent(html,reverse=false){
 if(reverse)return html.replace(/\/\*praxis-formula-value:([A-Za-z0-9+/=]+)\*\/[\s\S]*?\/\*\/praxis-formula-value\*\//g,(_,encoded)=>Buffer.from(encoded,'base64').toString('utf8')).replace(/\/\*praxis-formula-content:([A-Za-z0-9+/=]+)\*\/((?:"(?:[^"\\]|\\.)*"))/g,(_,encoded)=>Buffer.from(encoded,'base64').toString('utf8'));
 const before='expected:79.05,unit:"Hz"';
 html=html.replace(before,()=> '/*praxis-formula-value:'+Buffer.from(before).toString('base64')+'*/expected:79.05694150420949,unit:"Hz"/*/praxis-formula-value*/');
 return html.replace(/"(?:[^"\\]|\\.)*"/g,literal=>{
  let value;try{value=JSON.parse(literal)}catch{return literal;}
  const revised=correctFormulaText(value),en=correctFormulaText(value,'en');
  if(revised===value)return literal;
  const customEnglish=corrections.some(([before])=>value===before);
  if(!formulaContentCustomEnglish[revised]){
   formulaContentOriginals[revised]=value;
   formulaContentCustomEnglish[revised]=customEnglish;
   // Preserve the map's fallback for existing consumers, while exposing the
   // metadata needed to retain original English for substring-only edits.
   formulaContentTranslations[revised]=en;
  }
  return '/*praxis-formula-content:'+Buffer.from(literal).toString('base64')+'*/'+JSON.stringify(revised);
 });
}
