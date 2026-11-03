// Reversible scientific corrections after the textbook/core adapters.
// The model formulas below remain in the actual lesson functions, so regression
// tests exercise the same formulas that feed the displayed results.
export const acousticsAuditTranslations = {};
const tr=(ro,en)=>{acousticsAuditTranslations[ro]=en;return ro;};
const words=[
 ['Profile modale normalizate: deplasarea și presiunea au unități diferite și sunt în cuadratură temporală. Desenul compară formele spațiale, nu valori simultane.', 'Normalized mode profiles: displacement and pressure have different units and are in temporal quadrature. The drawing compares spatial shapes, not simultaneous values.'],
 ['Reglaj relativ s = A/A₀: ', 'Relative control s = A/A₀: '],
 ['P = 1 mW·s², s = A/A₀ este un reglaj relativ; I = P/(4πr²) = ', 'P = 1 mW·s²; s = A/A₀ is a relative control; I = P/(4πr²) = '],
 ['Sinteză sonoră: frecvențele sub 30 Hz sunt redate la 30 Hz; desenul este încetinit schematic. Valorile numerice păstrează frecvența fizică.', 'Audio synthesis: frequencies below 30 Hz are played at 30 Hz; the drawing is schematically slowed. Numerical results retain the physical frequency.'],
 ['Spectru normalizat: barele sunt valori logaritmice ale analizorului, fără calibrare în Pa, W/m² sau dB SPL.', 'Normalized spectrum: bars are logarithmic analyser values, without calibration in Pa, W/m² or dB SPL.'],
 ['t_surface ≈ Δ/3.2 + h/6 = ', 't_surface ≈ Δ/3.2 + h/6 = '],
 [' (întârziere schematică de generare; nu traseu seismic real)', ' (schematic generation delay; not a real seismic ray path)'],
 [' (GPa)', ' (GPa)'],
 ['K [GPa] = ρ·vP² - 4μ/3 = ', 'K [GPa] = ρ·vP² - 4μ/3 = '],
 ['Z – vertical (proiecții P/S/R)', 'Z – vertical (P/S/R projections)'],
 ['N-S – orizontal (proiecții)', 'N-S – horizontal (projections)'],
 ['E-W – orizontal (proiecții)', 'E-W – horizontal (projections)'],
 ['Fiecare stație măsoară Δt = tS−tP. Relația dₕ = Δt·vP·vS/(vP−vS) dă distanța hipocentrală. La adâncime cunoscută h, cercurile epicentrale au raza Δ = √(dₕ²−h²). Model omogen cu viteze constante.', 'Each station measures Δt = tS−tP. The relation dₕ = Δt·vP·vS/(vP−vS) gives hypocentral distance. At known depth h, epicentral circles have radius Δ = √(dₕ²−h²). Homogeneous constant-speed model.'],
 ['7 probleme × 3p = 21p; nota pentru probleme = 10·p/21. Cele două teste au fiecare 10p și se evaluează separat.', '7 problems × 3 points = 21 points; the problem grade is 10·points/21. Each of the two tests has 10 points and is graded separately.'],
 ['fₙ = f₀·[1,1.59,2.135…] – sinteză ilustrativă', 'fₙ = f₀·[1,1.59,2.135…] – illustrative synthesis'],
 ['rapoarte ilustrative', 'illustrative ratios'],
 ['Profilele depind de model. Love: strat elastic lent peste semispațiu rapid, densități egale. Rayleigh: semispațiu omogen izotrop, coeficient Poisson 0,25. Deplasările sunt amplificate vizual; sunetele sunt sonificări.', 'Profiles depend on the model. Love: a slow elastic layer over a fast half-space, equal densities. Rayleigh: a homogeneous isotropic half-space, Poisson ratio 0.25. Displacements are visually amplified; sounds are sonifications.'],
 ['vR≈0.9194 vS | vS strat < vL < vS substrat', 'vR≈0.9194 vS | vS layer < vL < vS substrate'],
 ['Love: modul fundamental SH al unui strat cu suprafață liberă. vL se calculează din tan(aH)=μ₂b/(μ₁a), cu a=ω√(1/vS₁²−1/vL²), b=ω√(1/vL²−1/vS₂²), densități egale. Deplasarea este perpendiculară pe propagare și orizontală.', 'Love: the fundamental SH mode of a layer with a free surface. vL is obtained from tan(aH)=μ₂b/(μ₁a), with a=ω√(1/vS₁²−1/vL²), b=ω√(1/vL²−1/vS₂²), equal densities. Displacement is horizontal and transverse to propagation.'],
 ['y=A·cos(az)·sin(kx−ωt) în strat; continuare evanescentă în substrat', 'y=A·cos(az)·sin(kx−ωt) in the layer; evanescent continuation in the substrate'],
 ['tan(aH)=μ₂b/(μ₁a); μ₂/μ₁=(4.5/3.5)²', 'tan(aH)=μ₂b/(μ₁a); μ₂/μ₁=(4.5/3.5)²'],
 ['Parametru de referință ', 'Reference parameter '],
 [' km (nu modifică modelul)', ' km (does not change the model)'],
 ['Rayleigh: mișcare eliptică în plan vertical. Soluția folosește două exponențiale evanescente și condiția de suprafață liberă. La suprafață mișcarea este retrogradă; variația cu adâncimea depinde de raportul vitezelor P/S. Nu există o adâncime universală de inversare.', 'Rayleigh: elliptical motion in the vertical plane. The solution uses two evanescent exponentials and the free-surface condition. Surface motion is retrograde; depth dependence is controlled by the P/S speed ratio. There is no universal reversal depth.'],
 ['θ=kx−ωt; p=√(1−vR²/vP²), q=√(1−vR²/vS²), z≥0 în jos', 'θ=kx−ωt; p=√(1−vR²/vP²), q=√(1−vR²/vS²), z≥0 downward'],
 ['Profil = combinație de exp(−pkz) și exp(−qkz)', 'Profile = a combination of exp(−pkz) and exp(−qkz)'],
 ['Profil evanescent SH', 'Evanescent SH profile'],
 ['Două exponențiale', 'Two exponentials'],
 ['Eliptică în plan vertical XZ; sensul depinde de adâncime și de model', 'Elliptical in vertical plane XZ; sense depends on depth and model'],
 ['cos(az) în strat, exponențial în substrat; tensiune tangențială nulă la suprafață', 'cos(az) in the layer, exponential in the substrate; zero surface shear traction'],
 ['Combinație de două exponențiale; energie localizată lângă suprafață', 'Combination of two exponentials; energy localized near the surface'],
 ['Potențial distructiv; efectul depinde de mișcarea solului, teren și structură', 'Potentially damaging; effects depend on ground motion, soil and structure'],
 ['Rayleigh combină mișcarea verticală și longitudinală în cuadratură. Love produce mișcare orizontală transversală. Răspunsul clădirii depinde de spectrul excitației și de proprietățile structurii; această animație nu estimează avarii.', 'Rayleigh combines vertical and longitudinal motion in quadrature. Love produces horizontal transverse motion. Building response depends on the excitation spectrum and structural properties; this animation does not estimate damage.'],
 ['• Love: model fundamental cu densități egale, strat lent peste substrat rapid. vL rămâne între vitezele S; profilul cos(az) respectă tensiunea tangențială nulă la suprafață. La frecvență mică vL tinde spre viteza substratului, iar la frecvență mare spre viteza stratului.', '• Love: fundamental-mode model with equal densities, a slow layer over a fast substrate. vL remains between the S speeds; cos(az) satisfies zero surface shear traction. At low frequency vL tends to the substrate speed, and at high frequency to the layer speed.'],
 ['• Rayleigh: semispațiu omogen izotrop cu Poisson 0,25, vP=√3·vS, vR≈0,9194·vS. Profilele sunt combinații evanescente cu mișcare retrogradă la suprafață. Într-un mediu stratificat, viteza, elipticitatea și sensul mișcării pot diferi.', '• Rayleigh: a homogeneous isotropic half-space with Poisson ratio 0.25, vP=√3·vS, vR≈0.9194·vS. Profiles combine evanescent terms with retrograde surface motion. In layered media, speed, ellipticity and motion sense can differ.'],
 ['• Rezonanța cere apropierea frecvenței excitației de frecvența proprie și depinde de amortizare; tipul undei nu determină singur clădirea afectată.', '• Resonance requires excitation near a natural frequency and depends on damping; wave type alone does not determine which building is affected.'],
 [' km (lungime de atenuare în substrat)', ' km (substrate decay length)'],
 [' (faze și proiecții schematice)', ' (schematic phases and projections)'],
 ['f² în funcție de T', 'f² versus T'],
];
for(const [ro,en]of words)tr(ro,en);

function replaceText(s,before,after){return s.replaceAll(before,after);}
function literalMap(s,fn){return s.replace(/"(?:[^"\\]|\\.)*"/g,literal=>{let value;try{value=JSON.parse(literal)}catch{return literal}const changed=fn(value);return changed===value?literal:JSON.stringify(changed);});}
function textEdits(s){
 const protocol=tr('Protocol general laborator avansat: 1) Sonometru: verifică liniaritatea f² în funcție de T; panta p = 1/(4μL²). 2) Kundt: caută rezonanța, măsoară d=λ/2 și folosește v=2df. 3) Osciloscop: estimează 440 Hz prin autocorelare. 4) Seismic: declanșează evenimentul schematic, măsoară Δt și estimează distanța hipocentrală dₕ=Δt·vP·vS/(vP−vS), în modelul cu viteze constante. Observă că undele S nu se propagă prin lichid; triangulează epicentrul cu trei stații și adâncime focală cunoscută.','General advanced-laboratory protocol: 1) Sonometer: check f² versus T linearity; slope p = 1/(4μL²). 2) Kundt: find resonance, measure d=λ/2 and use v=2df. 3) Oscilloscope: estimate 440 Hz by autocorrelation. 4) Seismic: trigger the schematic event, measure Δt and estimate hypocentral distance dₕ=Δt·vP·vS/(vP−vS) in the constant-speed model. Observe that S waves do not propagate through liquid; triangulate the epicentre with three stations and known focal depth.');
 s=s.replace(/children:\[t\("b",\{children:"Protocol general laborator avansat:"\}\),("(?:[^"\\]|\\.)*")\]/g,()=> 'children:'+JSON.stringify(protocol));
 return literalMap(s,value=>{
 const original=value;
 value=value.replaceAll('T vs f²','f² în funcție de T');
 value=value.replaceAll('fₙ = f₀·[1,1.59,2.135…] – clopot ideal',words[14][0]);
 value=value.replaceAll('Probleme verificare: 7 probleme, 2p calcul +1p pași =21p. Total 30p → notă = p/3.',words[13][0]);
 if(value==='fₙ = f₀·[1,1.59,2.135...] castron')value=tr('fₙ = f₀·[1,1.59,2.135...] castron (rapoarte ilustrative)','fₙ = f₀·[1,1.59,2.135...] bowl (illustrative ratios)');
 if(value!==original&&!Object.hasOwn(acousticsAuditTranslations,value)){
  const english=value.startsWith('1) Sonometru:')?'1) Sonometer: check f² versus T; slope = 1/(4μL²). 2) Kundt: find resonance and measure d=λ/2 to determine speed. 3) Oscilloscope: measure 440 Hz by autocorrelation. 4) Seismology: measure Δt and estimate hypocentral distance d=Δt·vP·vS/(vP−vS) in the constant-speed model.':value.startsWith('1. Fixează')?'1. Fix μ and L. 2. Vary tension T. 3. Measure f₁. 4. Plot f² versus T. 5. Determine μ from the slope.':value;
  tr(value,english);
 }
 return value;
});}
function edit(html,name,change){
 const start=html.indexOf(`function ${name}(`);if(start<0)throw Error(`Acoustics audit: missing ${name}`);
 // The imported lesson's named functions are declarations at script level.
 const rest=html.slice(start+9),next=/\bfunction\s+[\w$]+\s*\(/.exec(rest);
 let end=next?start+9+next.index:html.indexOf('</script>',start);
 const nextWrapper=html.indexOf('/*praxis-acoustics-audit:',start);
 if(nextWrapper>=0&&nextWrapper<end)end=nextWrapper;
 if(end<start)throw Error(`Acoustics audit: no boundary for ${name}`);
 const before=html.slice(start,end),after=change(before);
 if(before===after)return html;
 return html.slice(0,start)+`/*praxis-acoustics-audit:${Buffer.from(before).toString('base64')}*/`+after+'/*/praxis-acoustics-audit*/'+html.slice(end);
}
export function adaptWaveAcousticsAudit(html,reverse=false){
 if(reverse)return html.replace(/\/\*praxis-acoustics-audit:([A-Za-z0-9+/=]+)\*\/[\s\S]*?\/\*\/praxis-acoustics-audit\*\//g,(_,original)=>Buffer.from(original,'base64').toString('utf8'));
 if(html.includes('/*praxis-acoustics-audit:'))return html;
 html=edit(html,'pm',s=>{
  s=s.replace('(e==="open"?r*340/(2*o):0)','(r*340/(2*o))').replace('(e==="closed"?(2*r-1)*340/(4*o):0)','((2*r-1)*340/(4*o))');
  return s.replace('children:[t("canvas",{ref:n',`children:[t("p",{className:"text-xs",children:${JSON.stringify(words[0][0])}}),t("canvas",{ref:n`);
 });
 html=edit(html,'ym',s=>s.replace('"Amplitudine A la r₀ = 1 m: ",l.toExponential(1)," m "',`"${words[1][0]}",(l/0.0005).toFixed(2)," × "`).replace('P ∝ A²; P = 1 mW la A₀ = 0,5 mm. I = P/(4πr²) = ',words[2][0]));
 html=edit(html,'Km',s=>s.replace('children:[f("div",{className:"mb-3',`children:[t("p",{className:"text-xs",children:${JSON.stringify(words[3][0])}}),f("div",{className:"mb-3`).replace('Math.floor(L/O)','Math.round(L/O-0.5)').replace('M[W-E-1]','(W===E?M[E-1]:M[W-E-1])'));
 // Older imports have an invalid index at the first feedback sample. Existing
 // physics patches already fix Om; retain a guarded correction here as well.
 html=edit(html,'Om',s=>s.replace('I[s]=0.5*(I[s-O]+I[s-O-1])*d','I[s]=0.5*(I[s-O]+(s===O?M[O-1]:I[s-O-1]))*d').replace('O=Math.max(8,Math.floor(L/r))','O=Math.max(8,Math.round(L/r-0.5))'));
 html=edit(html,'Cm',s=>s.replace('I(r)=I₀·R₀²/r² = ',tr('I(r)=I_ref·R_ref²/r², R_ref=0.5 m, I_ref=I plană = ','I(r)=I_ref·R_ref²/r², R_ref=0.5 m, I_ref=plane I = ')));
 html=edit(html,'Bm',s=>s.replace('Q=Cn/2+B*Cn*0.4*d','Q=Cn/2+B*Cn*0.4').replace('children:[f("div",{className:"mb-3',`children:[t("p",{className:"text-xs",children:${JSON.stringify(words[4][0])}}),f("div",{className:"mb-3`));
 html=edit(html,'Im',s=>{
  s=s.replace('onChange:(D)=>T(parseFloat(D.target.value))','onChange:(D)=>T(Math.max(parseFloat(D.target.value),Math.sqrt(4/3)*$+0.01))').replace('onChange:(D)=>g(parseFloat(D.target.value))','onChange:(D)=>g(Math.min(parseFloat(D.target.value),P/Math.sqrt(4/3)-0.01))');
  const substitutions=[['t_surface ≈ Δ / 3.2 = ',words[5][0]],[' (Love/Rayleigh)',words[6][0]],[' (unit. arb.)',words[7][0]],['K = ρ·vP² - 4μ/3 = ',words[8][0]],['Z – vertical (P)',words[9][0]],['N-S – orizontal (S, Love)',words[10][0]],['E-W – orizontal (Rayleigh)',words[11][0]],['Fiecare stație măsoară Δt = tS-tP. Distanța estimată d = Δt·vP·vS/(vP-vS). Desenează cercuri cu rază d în jurul stațiilor; intersecția ≈ epicentrul. În realitate se folosește și adâncimea + model de viteză stratificat, aici simplificat v constant.',words[12][0]],['Formula distanță: d = Δt·vP·vS/(vP-vS) (ip. sursă superficială, v constant)','Formula distanță hipocentrală: dₕ = Δt·vP·vS/(vP−vS), viteze constante']];
  tr(substitutions.at(-1)[1],'Hypocentral distance formula: dₕ = Δt·vP·vS/(vP−vS), constant speeds');
  for(const [a,b]of substitutions)s=s.replaceAll(a,b);
  s=literalMap(s,value=>{
   if(value.includes('amplitudine mică pe Z, sosesc primele.'))return tr(value.replace('amplitudine mică pe Z, sosesc primele.','proiecția pe fiecare canal depinde de direcția razei; sosesc primele.'),'P waves are longitudinal; each recorded component depends on the ray direction. In this model they arrive first.');
   if(value.includes('amplitudine mare orizontal.'))return tr(value.replace('amplitudine mare orizontal.','polarizarea poate fi SH sau SV; nu sunt exclusiv orizontale.'),'S waves are transverse and do not propagate through the liquid outer core; their polarization can be SH or SV and is not exclusively horizontal.');
   if(value==='Mic Z, prima')return tr('Proiecție pe axa senzorului','Projection onto the sensor axis');
   if(value==='Mare N-S/E-W, a doua')return tr('SH sau SV, a doua','SH or SV, second');
   return value;
  });
  s=s.replace('o.current+=0.192','o.current+=12*seismicClock.step(performance.now())').replace('function Im(){','function Im(){const seismicClock=window.PraxisAnimationClock.create();');
  return s;
 });
 for(const name of ['Zm','Gm','Wm'])html=edit(html,name,textEdits);
 // The bowl illustration is already qualified in its introduction; its badge
 // and formula map must use the same qualification.
 html=edit(html,'Tm',textEdits);
 html=edit(html,'gm',s=>{
  const note=tr('Oscilator liniar cu un grad de libertate: x este deplasarea relativă la bază. Animația clădirii și solului folosește scări vizuale schematice, fără evaluarea avariilor. Curba arată amplitudinea relativă staționară pentru accelerație sinusoidală; f₀≈10/N este o ipoteză didactică, nu o lege universală.','Linear single-degree-of-freedom oscillator: x is displacement relative to the base. The building and ground animation uses schematic visual scales, without estimating damage. The curve shows steady relative amplitude under sinusoidal acceleration; f₀≈10/N is a teaching assumption, not a universal law.');
  s=s.replace('children:[f("div",{className:"mb-3',`children:[t("p",{className:"text-xs",children:${JSON.stringify(note)}}),f("div",{className:"mb-3`);
  s=s.replaceAll('coincide cu f sol moale',tr('se compară cu f sol moale','is compared with soft-soil frequency'));
  s=s.replaceAll('32 blocuri prăbușite, 1570 victime – rezonanță sit',tr('Exemplu schematic de efect de sit','Schematic example of a site effect'));
  s=s.replaceAll('REZONANȚĂ!',tr('Răspuns mare','Large response')).replaceAll('Avariat',tr('Răspuns mediu','Medium response')).replaceAll('Stabil',tr('Răspuns mic','Small response'));
  return s;
 });
 html=edit(html,'Jm',s=>{
  const start=s.indexOf('s=N.useMemo(()=>{'),end=s.indexOf(',ln=N.useMemo',start);
  if(start<0||end<0)throw Error('Acoustics audit: Love speed model missing');
  s=s.slice(0,start)+`s=N.useMemo(()=>{const w=2*Math.PI*g,c1=3.5,c2=4.5;let lo=c1+1e-10,hi=c2-1e-10;const cut=1/(c1*c1)-Math.pow(Math.PI/(2*w*v),2);if(cut>0)hi=Math.min(hi,1/Math.sqrt(cut)-1e-10);for(let j=0;j<80;j++){const c=(lo+hi)/2,a=w*Math.sqrt(1/(c1*c1)-1/(c*c)),b=w*Math.sqrt(1/(c*c)-1/(c2*c2));if(Math.tan(a*v)>c2*c2*b/(c1*c1*a))hi=c;else lo=c}return(lo+hi)/2},[g,v])`+s.slice(end);
  s=s.replace('Vn=N.useMemo(()=>3.22,[])','Vn=N.useMemo(()=>3.5*Math.sqrt(2-2/Math.sqrt(3)),[])');
  // One clock owns time for both scenes; neither renderer advances it.
  const raf=s.includes('lessonRequestAnimationFrame')?'lessonRequestAnimationFrame':'requestAnimationFrame',caf=s.includes('lessonCancelAnimationFrame')?'lessonCancelAnimationFrame':'cancelAnimationFrame';
  s=s.replace('function Jm(){',`function Jm(){const sharedClock=N.useRef(window.PraxisAnimationClock.create());`);
  s=s.replace('lessonUseEffect(()=>{let G=0,rn=()=>{let B=e.current;',`lessonUseEffect(()=>{let ticket=0;const frame=stamp=>{const dt=sharedClock.current.step(stamp);if(!h)o.current+=dt*i;ticket=${raf}(frame)};ticket=${raf}(frame);return()=>${caf}(ticket)},[h,i]);lessonUseEffect(()=>{let G=0,rn=()=>{let B=e.current;`);
  // Before animation adaptation the effect uses N.useEffect instead.
  if(!s.includes('const frame=stamp'))s=s.replace('N.useEffect(()=>{let G=0,rn=()=>{let B=e.current;',`N.useEffect(()=>{let ticket=0;const frame=stamp=>{const dt=sharedClock.current.step(stamp);if(!h)o.current+=dt*i;ticket=${raf}(frame)};ticket=${raf}(frame);return()=>${caf}(ticket)},[h,i]);N.useEffect(()=>{let G=0,rn=()=>{let B=e.current;`);
  s=s.replaceAll('!h)o.current+=0.016*i','false)o.current+=0');
  s=s.replace('R=ln*0.6,un=Math.exp(-Fn/R)','R=1/(dn*Math.sqrt(1/(s*s)-1/(4.5*4.5))),un=Math.cos(dn*Math.sqrt(1/(3.5*3.5)-1/(s*s))*Fn)');
  s=s.replace('Fn=Math.exp(-on/(ln*0.6))','Fn=Math.cos(dn*Math.sqrt(1/(3.5*3.5)-1/(s*s))*on)');
  s=s.replace('un*(1-0.15*k*0.1)','un');
  // Exact homogeneous-half-space Rayleigh profiles for nu=1/4. Depth is
  // positive downward. Signs give retrograde surface particle motion.
  s=s.replace('un=0.88*R,In=0.36*R','un=Math.sqrt(1-Vn*Vn/(3*3.5*3.5))*R,In=Math.sqrt(1-Vn*Vn/(3.5*3.5))*R');
  const old='Gn=0.19*mn,en=1-on/Gn*1.2,Y=E*0.9,pn=-Y*0.18*(On-0.62*En)*Math.sin(Ln)*(en>0?1:en);if(en<0)pn=-pn*0.7;let S=Y*0.22*(On-0.3*En)*Math.cos(Ln)';
  const profile='Gn=0,en=1,Y=E*0.9,rayP=un/R,rayQ=In/R,rayH=On-2*rayP*rayQ/(1+rayQ*rayQ)*En,rayV=rayP*(2/(1+rayQ*rayQ)*En-On),pn=-Y*0.18*rayH*Math.sin(Ln);let S=Y*0.18*rayV*Math.cos(Ln)';
  if(!s.includes(old))throw Error('Acoustics audit: Rayleigh profile missing');s=s.replace(old,profile);
  s=s.replace('Xn=-Y*0.18*(On-0.62*En)*nn*Math.cos(Ln)*Pn*0.15,ue=-Y*0.22*(On-0.3*En)*nn*Math.sin(Ln)*Pn*0.15','Xn=Y*0.18*rayH*nn*Math.cos(Ln)*Pn*0.15,ue=Y*0.18*rayV*nn*Math.sin(Ln)*Pn*0.15');
  s=s.replace('Fn=Math.exp(-Zn*on*0.9)','Fn=Math.exp(-Math.sqrt(1-Vn*Vn/(3.5*3.5))*Zn*on)');
  const stringReplacements=new Map([
   ['vR≈0.92 vS  |  vS crustă < vL < vS mantă  |  A(z)=A0·exp(-kz)',words[17][0]],
   ['Undă de forfecare orizontală prinsă în crustă (ghid de undă). Mișcare perpendicular pe direcția de propagare, fără componentă verticală. vL < vS mantă, dispersivă, ghidată. Particulele oscilează pe Y (stânga-dreapta) cu y=A·sin(kx-ωt)·exp(-z/δ). vLove între vS crustă (3.5km/s) și vS mantă (4.5km/s). Perioade tipic 5-20s.',words[18][0]],
   ['y(x,z,t)=A·sin(kx-ωt)·exp(-z/δ)  SH',words[19][0]],
   ['vL = vS_m - (vS_m - vS_c)·exp(-f·H/..) dispersivă',words[20][0]],
   ['δ ref z ',words[21][0]],[' km (vizual)',words[22][0]],
   ['Undă P-SV cuplată, mișcare eliptică retrogradă la suprafață (particule se rotesc invers față de propagare), vR≈0.92 vS, cea mai distructivă, amplitudine scade exponențial cu adâncimea. La suprafață particula sus se mișcă înapoi (spre sursă), la ~0.19λ elipsa devine progradă. Rostogolește clădirile: componentă verticală + orizontală defazate 90°.',words[23][0]],
   ['x = -A·k·b·e^{qz}·sin(kx-ωt) ; z = A·q·e^{qz}·cos(kx-ωt)',words[24][0]],
   ['Eliptică în plan vertical XZ, retrogradă la suprafață, progradă la ~0.19λ',words[28][0]],
   ['A(z)≈A₀·exp(-z/δ): profil schematic, maxim la suprafață; tensiunea tangențială este nulă la suprafața liberă.',words[29][0]],
   ['A(z)=A0·exp(-k z), scade exponențial, 90% energie în 1λ adâncime',words[30][0]],
   ['Cea mai distructivă – mișcare eliptică răstoarnă, verticală + orizontală combinate',words[31][0]],
   [' Rayleigh are atât componentă orizontală cât și verticală defazate 90°, elipsă retrogradă la suprafață: când solul se ridică, se mișcă înapoi spre epicentru, apoi coboară și înainte – efect de “val” care răstoarnă fundații. Love zguduie lateral (SH) fără verticală, dar prinsă în crustă → amplitudine mare, lungă durată.',words[32][0]],
   ['• Love 1911: undă SH prinsă între suprafață liberă și interfață cu viteză mai mare (Moho). Condiție ghid: reflexie totală la interfață, interferență constructivă în strat. vL = ω/k, ecuație dispersie tan(k_H·H)=... unde k_H = ω√(1/vS_c² -1/vL²). În limita f→∞, vL→vS_crust; f→0, vL→vS_mantă.',words[33][0]],
   ['• Rayleigh 1885: soluție P-SV cuplată la suprafață liberă, condiție det |M|=0 → vR≈0.92 vS pentru Poisson 0.25. Mișcare eliptică retrogradă la suprafață deoarece componenta verticală și orizontală sunt în cuadratură. La ~0.19λ sensul devine prograd (particula sus se mișcă înainte). Energia prinsă în ~λ adâncime, de aceea distructivă.',words[34][0]],
   ['• De ce rostogolește: cuplul vertical+orizontal creează moment de răsturnare pe fundații. Clădirile cu frecvență proprie ~0.1-0.3Hz (10-30 etaje) intră în rezonanță cu Rayleigh de 10-20s perioadă → amplificare.',words[35][0]],
   ['A(z)=A0 exp(-z/δ)',words[26][0]],['A(z)=A0 exp(-k z)',words[27][0]],
  ]);
  s=literalMap(s,value=>stringReplacements.get(value)??value);
  s=s.replace('children:[f("div",{className:"mb-3',`children:[t("p",{className:"text-xs",children:${JSON.stringify(words[16][0])}}),f("div",{className:"mb-3`);
  s=s.replace('vR≈0.92·vS=','vR≈0.9194·vS=').replace('km/s  A(z)=A0·exp(-k z)  k=2π/λ','km/s; k=2π/λ');
  s=s.replace('"km flip 0.19λ≈",(0.19*mn).toFixed(1),"km retro→pro"',`"km ",${JSON.stringify(words[25][0])}`);
  s=s.replace('δ≈",(ln*0.6).toFixed(0),"km"','δ≈",(1/(dn*Math.sqrt(1/(s*s)-1/(4.5*4.5)))).toFixed(1),"km"');
  s=s.replace('z≈${Fn.toFixed(0)}km A∝exp(-z/δ) δ~${R.toFixed(0)}km → ${un.toFixed(2)}','z≈${Fn.toFixed(0)}km A/A₀=${un.toFixed(2)}');
  s=s.replace('A(z)=A0·exp(-kz)  k=2π/λ  z=0..','Profil P-SV; k=2π/λ; z=0..');
  tr('Profil P-SV; k=2π/λ; z=0..{0}λ ({1}km)','P-SV profile; k=2π/λ; z=0..{0}λ ({1}km)');
  tr('z≈{0}km A/A₀={1}','z≈{0}km A/A₀={1}');
  s=s.replace('km/s, slab dispersivă, ~0.9 vS','km/s, nedispersivă în semispațiul omogen');
  tr('vR≈0.92·vS≈3.2 km/s, nedispersivă în semispațiul omogen','vR≈0.92·vS≈3.2 km/s, non-dispersive in a homogeneous half-space');
  s=literalMap(s,value=>value==='Dispersie slabă, dependentă de structura crustei, viteză crește ușor cu T'?tr('Nedispersivă în semispațiul omogen; stratificarea poate produce dispersie','Non-dispersive in the homogeneous half-space; layering can cause dispersion'):value);
  return s;
 });
 return html;
}
