// Local scanned F1 manual, printed pp. 29–55 (27 PDF pages).
// Applied after the physical corrections; every edit is reversible for provenance.
import {readFileSync} from 'node:fs';
const mathComponents=readFileSync(new URL('./waves-math-components.js',import.meta.url),'utf8');
const mathProse=readFileSync(new URL('./waves-math-prose.js',import.meta.url),'utf8');
const tsunamiComponent=readFileSync(new URL('./waves-tsunami-component.js',import.meta.url),'utf8');
const foundationComponent=readFileSync(new URL('./waves-foundations-component.js',import.meta.url),'utf8');
const stringComponent=readFileSync(new URL('./waves-string-component.js',import.meta.url),'utf8');
const huygensComponent=readFileSync(new URL('./waves-huygens-component.js',import.meta.url),'utf8');
export const textbookTranslations = {
 'Unde staționare într-o coardă elastică':'Standing waves on an elastic string',
 'Reflexia la capăt fix sau liber':'Reflection at a fixed or free end',
 'Unde staționare și moduri proprii':'Standing waves and normal modes',
 '10. Viteza de fază este:':'10. Phase speed is:',
 'v_f = λ/T = λ·ν; într-o perioadă faza înaintează cu o lungime de undă.':'v_f = λ/T = λ·ν; phase advances one wavelength in one period.',
 'Periodicitate spațială':'Spatial periodicity',
 'y(x + λ,t) = y(x,t); perioada spațială este λ.':'y(x + λ,t) = y(x,t); the spatial period is λ.',
 'v din λ și T':'v from λ and T',
 'Explicația construcției':'Construction explained',
 'Simulare':'Simulation','Mărimi și orbită':'Quantities and orbit','Explicații':'Explanations','Aplicații':'Applications',
 'Suprafață, rază și front':'Surface, ray and wavefront','Viteză și mediu':'Speed and medium','Model cu piese domino':'Domino model','Secțiune':'Section','Temă':'Topic','Activitate':'Activity','Activități: unde pe apă':'Activities: water waves','Secțiunea laboratorului':'Laboratory section',
 'Regim: ':'Regime: ','Regim:':'Regime:','adâncă':'deep','mică':'shallow','intermediară':'intermediate',
 'Detalii despre reprezentare':'Representation details','regim':'regime','stabil':'stable',
 'Prag schematic: H/h = 2A/h > 0.78':'Schematic threshold: H/h = 2A/h > 0.78',
 'Undă transversală în coardă: v_f = √(T_m/μ) ; μ = m/L':'Transverse string wave: v_f = √(T_m/μ) ; μ = m/L',
 'Undă longitudinală într-o bară elastică subțire: v_l = √(E/ρ)':'Longitudinal wave in a slender elastic rod: v_l = √(E/ρ)'
};
const text = (ro, en) => { if(en!==undefined)textbookTranslations[ro]=en;else if(!Object.hasOwn(textbookTranslations,ro))textbookTranslations[ro]=ro;return JSON.stringify(ro); };
Object.assign(textbookTranslations,JSON.parse(readFileSync(new URL('./waves-huygens-translations.json',import.meta.url),'utf8')));
const p = (ro,en) => `t("p",{children:${text(ro,en)}})`;
const h = (ro,en) => `t("h4",{className:"mt-6 font-bold",children:${text(ro,en)}})`;
const formula = ro => {
 // Native MathML keeps the two defining equations in the printed fraction form.
 const mi=x=>`t("mi",{children:${JSON.stringify(x)}})`,mo=x=>`t("mo",{children:${JSON.stringify(x)}})`;
 const row=xs=>`f("mrow",{children:[${xs.join(',')}]})`;
 const frac=(a,b)=>`f("mfrac",{children:[${a},${b}]})`;
 const vf=`f("msub",{children:[${mi('v')},${mi('f')}]})`;
 let math;
 if(ro==='y(x,t) = A·sin ω(t − τ) = A·sin ω(t − x/v_f)'){
  const left=[mi('y'),mo('('),mi('x'),mo(','),mi('t'),mo(')'),mo('='),mi('A'),mo('·'),mi('sin'),mi('ω'),mo('('),mi('t'),mo('−')];
  const rows=[row([...left,mi('τ'),mo(')')]),row([...left,frac(mi('x'),vf),mo(')')])];
  math=`f("mtable",{columnalign:"left",rowspacing:".35em",children:[${rows.map(r=>`t("mtr",{children:t("mtd",{children:${r}})})`).join(',')}]})`;
 }
 if(ro==='y(x,t) = A·sin 2π(t/T − x/λ)')math=row([mi('y'),mo('('),mi('x'),mo(','),mi('t'),mo(')'),mo('='),mi('A'),mo('·'),mi('sin'),`t("mn",{children:"2"})`,mi('π'),mo('('),frac(mi('t'),mi('T')),mo('−'),frac(mi('x'),mi('λ')),mo(')')]);
 return `t(Me,{children:${math?`t("math",{xmlns:"http://www.w3.org/1998/Math/MathML",displaystyle:"true","data-no-i18n":"","aria-label":${text(ro)},children:${math}})`:text(ro)}})`;
};
const section = (id,title,items) => `f(ie,{id:"${id}",title:${text(title)},children:[${items.join(',')}]})`;
const domino = [
 h('Model experimental cu piese de domino','Experimental domino model'),
 p('Compară timpul de transmitere pe două șiruri de aceeași lungime, cu distanțe diferite între piese. Observă transmiterea din aproape în aproape. Modelul este doar o analogie: piesele cad, nu oscilează elastic, iar distanța dintre molecule nu determină singură viteza sunetului.','Compare transmission times along two equal-length rows with different domino spacing. Observe transmission from neighbour to neighbour. This is only an analogy: dominoes fall rather than oscillate elastically, and molecular spacing alone does not determine sound speed.')
];
export function textbookNotation(s) {
 return s.replaceAll('ωt - kx','ω(t − x/v_f)').replaceAll('ωt + kx','ω(t + x/v_f)').replaceAll('ωt-kx','ω(t − x/v_f)').replaceAll('kr₁','2πr₁/λ').replaceAll('kr₂','2πr₂/λ').replaceAll('kΔr/2','πΔr/λ').replaceAll('sin(kx)','sin(2πx/λ)').replaceAll('kx=nπ','2πx/λ=nπ').replaceAll('sin(kL)','sin(2πL/λ)').replaceAll('kL=nπ','2πL/λ=nπ');
}
const chapters = {
 clasificare: section('clasificare','Propagarea unei perturbații într-un mediu elastic. Transferul de energie',[
  p('O perturbație se transmite din aproape în aproape, cu viteză finită. Sursa sau centrul de oscilație este locul unde se aplică perturbația externă. O undă mecanică transmite starea de oscilație printr-un mediu material; dacă interacțiunile sunt elastice, vorbim despre o undă elastică.','A disturbance travels from particle to particle at a finite speed. The source or centre of oscillation is where the external disturbance is applied. A mechanical wave transmits oscillation through a material medium; elastic interactions produce an elastic wave.'),
  p('Unda transportă energie, fără transport net de substanță: particulele oscilează în jurul pozițiilor de echilibru. Sunetul nu se propagă în vid. Modelul folosit aici presupune un mediu nedisipativ, fără pierderi de energie.','A wave carries energy without net transport of matter: particles oscillate about their equilibrium positions. Sound cannot travel in a vacuum. The model used here assumes a non-dissipative medium with no energy loss.'),
  p('Undă transversală: oscilația este perpendiculară pe direcția de propagare. Undă longitudinală: oscilația este paralelă cu direcția de propagare. În fluide, undele elastice de volum sunt longitudinale; în solide pot exista ambele tipuri.','Transverse wave: oscillation is perpendicular to propagation. Longitudinal wave: oscillation is parallel to propagation. Bulk elastic waves in fluids are longitudinal; solids can support both types.'),
  't(um,{})',
  h('Unde la suprafața apei','Water surface waves'),
  p('La suprafața apei, particulele pot descrie traiectorii circulare sau eliptice în plan vertical. Mișcarea are componente longitudinală și transversală; nu este o oscilație transversală pură. Forma traiectoriei depinde de adâncime.','At the water surface, particles can follow circular or elliptical paths in a vertical plane. Motion has longitudinal and transverse components; it is not purely transverse. The path depends on water depth.'),
  't(Em,{})'
 ]),
 marimi: section('marimi','Modelul undă plană. Periodicitatea spațială și temporală',[
  p('Vectorul de oscilație are originea în poziția de repaus a particulei și extremitatea în poziția ei la momentul t. El reprezintă deplasarea particulei față de echilibru.','The oscillation vector starts at the equilibrium position and ends at the particle position at time t. It represents the particle displacement from equilibrium.'),
  p('Într-o undă transversală, componenta sa pe axa Oy este elongația y. Vectorul de oscilație nu este vectorul vitezei de oscilație și nu indică direcția propagării.','In a transverse wave, its Oy component is displacement y. The oscillation vector is distinct from the particle velocity vector and does not indicate propagation direction.'),
  't(LessonWaveFoundations,{kind:"vector"})',
  h('Puncte de egală fază','Equal-phase points'),
  p('Două puncte sunt în fază dacă au permanent vectori de oscilație egali și aceeași tendință de variație: elongațiile cresc sau scad simultan. Aceeași elongație la un singur moment nu este suficientă.','Two points are in phase if their oscillation vectors remain equal and change in the same way: displacements increase or decrease together. Equal displacement at just one instant is insufficient.'),
  p('În figură, P₁ este în fază cu P₃, iar P₂ cu P₄. P₁ și P₂ au elongații egale la momentul ales, dar tendințe de variație opuse; nu sunt în fază.','In the figure, P₁ is in phase with P₃, and P₂ with P₄. P₁ and P₂ have equal displacements at the selected instant but opposite trends; they are not in phase.'),
  't(LessonWaveFoundations,{kind:"phase"})',
  h('Lungimea de undă','Wavelength'),
  p('Lungimea de undă λ este distanța, pe direcția de propagare, dintre două puncte vecine de fază egală, de exemplu două creste sau două depresiuni succesive. A este amplitudinea, T perioada, ν frecvența, iar ω pulsația.','Wavelength λ is the distance along propagation between neighbouring points of equal phase, for example successive crests or troughs. A is amplitude, T period, ν frequency and ω angular frequency.'),
  't(LessonWaveFoundations,{kind:"wavelength"})',
  formula('ν = 1/T ; ω = 2π/T ; λ = v_f·T ; v_f = λ/T = λ·ν'),
  h('Propagarea într-o perioadă','Propagation over one period'),
  't(LessonWavePropagation,{})',
  h('Simulare și mărimi','Simulation and quantities'),
  p('Compară amplitudinea A, lungimea de undă λ și perioada T. Viteza de fază rezultă din v_f = λ/T; viteza de oscilație a unei particule este o mărime diferită.','Compare amplitude A, wavelength λ and period T. Phase speed is v_f = λ/T; particle velocity is a different quantity.'),
  't(om,{})',
  h('Suprafață de undă, rază și front de undă','Wave surface, ray and wavefront'),
  p('O suprafață de undă sau suprafață de fază egală reunește punctele de aceeași fază. În mediul omogen și izotrop, o sursă punctiformă produce suprafețe sferice concentrice; o sursă plană produce suprafețe plane paralele. Razele sunt perpendiculare pe aceste suprafețe și indică propagarea. Frontul undei este suprafața de undă cea mai îndepărtată de sursă la momentul considerat.','A wave surface or equal-phase surface contains points of the same phase. In a homogeneous isotropic medium, a point source produces concentric spherical surfaces; a plane source produces parallel plane surfaces. Rays are perpendicular to these surfaces and indicate propagation. The wavefront is the wave surface farthest from the source at the chosen time.'),
  't(_m,{})',
  h('Viteza de fază și proprietățile mediului','Phase speed and medium properties'),
  p('Într-o perioadă T, faza înaintează cu λ. Viteza de fază depinde de elasticitatea și inerția mediului, iar perioada este impusă de sursă. Lungimea de undă depinde de ambele. Viteza de propagare nu este viteza de oscilație a unei particule.','In one period T, phase advances by λ. Phase speed depends on medium elasticity and inertia; the period is set by the source. Wavelength depends on both. Propagation speed is distinct from particle oscillation velocity.'),
  formula('Undă transversală în coardă: v_f = √(T_m/μ) ; μ = m/L'),
  p('T_m este tensiunea din coardă, în N, distinctă de perioada T; μ este masa pe unitatea de lungime, în kg/m.','T_m is string tension in N, distinct from period T; μ is mass per unit length in kg/m.'),
  formula('Undă longitudinală într-o bară elastică subțire: v_l = √(E/ρ)'),
  p('E este modulul de elasticitate longitudinală (Young), în N/m², iar ρ este densitatea, în kg/m³. Relația se referă la modelul barei elastice; nu se aplică direct gazelor sau oricărei unde de volum într-un solid.','E is Young’s modulus in N/m² and ρ is density in kg/m³. This relation describes a slender elastic rod; it does not apply directly to gases or to every bulk wave in a solid.'),
  ...domino
 ]),
 ecuatia: section('ecuatia','Ecuația undei plane',[
  p('Într-o undă sferică energia se distribuie pe suprafețe tot mai mari, iar amplitudinea scade. În modelul undei plane nedisipative, energia transmisă pe aceeași arie și amplitudinea rămân constante.','In a spherical wave, energy spreads over increasingly large surfaces and amplitude decreases. In the non-dissipative plane-wave model, energy transmitted across the same area and amplitude remain constant.'),
  p('Planul sursei oscilează armonic. Axa Ox este perpendiculară pe el, O este în planul sursei, iar P are coordonata x. Unda înaintează spre x crescător cu viteza v_f.','The source plane oscillates harmonically. Ox is perpendicular to it, O lies in the source plane and P has coordinate x. The wave travels towards increasing x at phase speed v_f.'),
  formula('y(t) = A·sin ωt ; τ = x/v_f'),
  p('P reproduce oscilația sursei la timpul t − τ. Simularea arată regimul armonic deja stabilit. Dacă sursa pornește la t = 0, P rămâne în repaus până la sosirea undei, la t = τ.','P reproduces the source oscillation at time t − τ. The simulation shows an established harmonic wave. If the source starts at t = 0, P remains at rest until the wave arrives at t = τ.'),
  formula('y(x,t) = A·sin ω(t − τ) = A·sin ω(t − x/v_f)'),
  formula('ω = 2π/T ; λ = v_f·T'),
  formula('y(x,t) = A·sin 2π(t/T − x/λ)'),
  't(tm,{})',
  h('Dubla periodicitate','Double periodicity'),
  p('La x fix, elongația este periodică în timp cu perioada T. La t fix, profilul este periodic în spațiu cu perioada λ. Simularea reprezintă o undă armonică deja stabilită în regiunea desenată.','At fixed x, displacement is periodic in time with period T. At fixed t, the profile is periodic in space with period λ. The simulation shows a harmonic wave already established in the displayed region.'),
  formula('y(x,t + T) = y(x,t) ; y(x + λ,t) = y(x,t)'),
  h('Fază și diferență de fază','Phase and phase difference'),
  formula('φ(x,t) = 2π(t/T − x/λ) ; |Δφ| = 2π·|x₂ − x₁|/λ'),
  p('Punctele separate printr-un număr întreg de lungimi de undă sunt în fază. La un număr impar de semilungimi de undă sunt în opoziție de fază. Aici afișăm modulul defazajului; pentru φ₂ − φ₁, semnul este opus celui al lui x₂ − x₁.','Points separated by an integer number of wavelengths are in phase. An odd number of half-wavelengths gives opposite phase. The displayed phase difference is its magnitude; for φ₂ − φ₁, the sign is opposite to that of x₂ − x₁.'),
  't(Um,{})'
 ]),
 stationare: section('stationare','Unde staționare într-o coardă elastică',[
  't(LessonStringWaves,{kind:"reflection"})',
  h('Formarea undei staționare. Moduri proprii','Standing-wave formation. Normal modes'),
  't(LessonStringWaves,{kind:"standing"})'
 ])
};

export function adaptWaveTextbook(html, reverse=false) {
 if(reverse) {html=html.replace(/\/\*praxis-tsunami:([A-Za-z0-9+/=]+)\*\/[\s\S]*?\/\*\/praxis-tsunami\*\//g,(_,s)=>Buffer.from(s,'base64').toString('utf8'));const newline=html.includes('\r\n')?'\r\n':'\n';return html.replace(/\/\*praxis-textbook:([A-Za-z0-9+/=]+)\*\/[\s\S]*?\/\*\/praxis-textbook\*\//g,(_,s)=>Buffer.from(s,'base64').toString('utf8').replace(/\r?\n/g,newline));}
 function replace(before,after) {
  if(!html.includes(before)) throw Error('Textbook adaptation must be unique: '+before.slice(0,100));
  html=html.replaceAll(before,()=>`/*praxis-textbook:${Buffer.from(before).toString('base64')}*/${after}/*/praxis-textbook*/`);
 }
 for(const [id,after]of Object.entries(chapters)) {
  const start=html.indexOf(`f(ie,{id:"${id}",title:`),end=html.indexOf(',f(ie,{id:',start+1);
  if(start<0||end<0)throw Error('Missing textbook section '+id);
  replace(html.slice(start,end),after);
 }
 replace('t(dm,{}),t("h4",{className:"font-bold mt-6",children:"Capăt FIX vs LIBER – coeficient reflexie"})','t(dm,{}),'+h('Reflexia prin principiul lui Huygens','Reflection using Huygens’s principle')+',t(LessonHuygensBoundary,{kind:"reflection"}),'+h('Refracția prin principiul lui Huygens','Refraction using Huygens’s principle')+',t(LessonHuygensBoundary,{kind:"refraction"}),t("h4",{className:"font-bold mt-6",children:"Capăt FIX vs LIBER – coeficient reflexie"})');
 replace("if(term.term==='Difracție')return 'reflexie-content-3';","if(term.term==='Difracție')return 'reflexie-content-5';");
 const proseStart=html.indexOf('function lessonMath(value){'),proseEnd=html.indexOf('function lessonJsx(',proseStart);
 replace(html.slice(proseStart,proseEnd),mathProse+'\n');
 const waterStart=html.indexOf('function Em(){'),waterEnd=html.indexOf('function ',waterStart+12),waterOriginal=html.slice(waterStart,waterEnd);
 let water=waterOriginal.replace('t("canvas",{ref:n,width:800,height:350','t("canvas",{ref:n,width:800,height:350,waterReadout:{regime:W,ratio:j,speed:s,deep:tn,shallow:Nn,breaking:dn}');
 const labelStart=water.indexOf('q.fillStyle=_?"#e2e8f0":"#0f172a",q.font="bold 12px system-ui",q.fillText(`Regim:');
 const labelEnd=water.indexOf(',g)q.fillStyle=',labelStart);
 if(labelStart<0||labelEnd<0)throw Error('Water animation summary changed');
 // These are static state readouts, now displayed as normal, scalable DOM math.
 water=water.slice(0,labelStart)+'q.font="16px system-ui"'+water.slice(labelEnd);
 replace(waterOriginal,water);
 // Restrict the wavelength readout change to the introductory renderer.
 const omStart=html.indexOf('function om(){'),omEnd=html.indexOf('function ',omStart+10),om=html.slice(omStart,omEnd);
 replace(om,om.replace('"k = 2π/λ = "','"λ = "').replace('(2*Math.PI/r).toFixed(2)," m⁻¹"','r.toFixed(2)," m"'));
 // Explicit relations: a typographical tilde must not disappear or imply equality.
 const sphericalStart=html.indexOf('function _m(){'),sphericalNext=html.indexOf('function ',sphericalStart+14),sphericalMarker=html.indexOf('/*praxis-textbook:',sphericalStart+14),sphericalEnd=Math.min(sphericalNext,sphericalMarker<0?Infinity:sphericalMarker),sphericalOriginal=html.slice(sphericalStart,sphericalEnd);
 const spherical=sphericalOriginal
  .replace('"Plană: sursă la infinit, fronturi plane paralele, I=const. Sferică: fronturi sferice, A~1/r, I~P/4πr². Raza = ⊥ pe front."',text('Plană: A = const ; I = const. Sferică: A ∝ 1/r ; I = P/(4πr²). Sursă izotropă, fără absorbție. P: puterea sursei; r: distanța.','Plane: A = const ; I = const. Spherical: A ∝ 1/r ; I = P/(4πr²). Isotropic source, no absorption. P: source power; r: distance.'))
  .replace('g.fillText(`Sferic: A∝1/r=${I.toFixed(2)}, I∝1/r²=${E.toFixed(3)}`,10,16)', 'g.fillText('+text('Sferic: r₀ = 0,20 m','Spherical: r₀ = 0.20 m')+',10,16),g.fillText(`A/A₀ = ${I.toFixed(3)} ; I/I₀ = ${E.toFixed(4)}`,10,32)');
 if(spherical===sphericalOriginal||spherical.includes('A~1/r'))throw Error('Spherical-wave readout adaptation changed');
 replace(sphericalOriginal,spherical);
 // Keep calculations unchanged while replacing the displayed notation.
 const pairs=[
  ["items:id==='laborator'&&i<2?[t(LessonRecordingHelp,{},'recording-help'),c]:[c]","items:id==='laborator'&&i===1?[t(LessonRecordingHelp,{},'recording-help'),c]:[c]"],
  ['"\\uD83C\\uDFB8 CHITARĂ – model Karplus-Strong"',text('Chitară · coardă ciupită','Guitar · plucked string')],
  ['"y[n]=½(y[n-N]+y[n-N-1])·decay + corp lowpass"',text('Coardă fixată la ambele capete','String fixed at both ends')],
  ['t("div",{className:"mt-2 text-[11px] opacity-60",children:"Poziția 0.1 = lângă căluș (strălucitor, multe armonice), 0.5 = mijloc (sunet gol, armonice pare suprimate: sin(nπp)=0). Decay → lungimea notei. Corp lowpass = cutia de rezonanță a chitarei."})',`f("div",{className:"mt-2 wave-guitar-notes",children:[f(LessonGuitarHelp,{children:[t("summary",{children:${text('Cum este generat sunetul','How the sound is generated')}}),${p('Poziția ciupirii modifică ponderea armonicelor. La mijloc, modurile pare nu sunt excitate în modelul ideal. Amortizarea controlează durata sunetului; filtrul de corp modifică timbrul.','Plucking position changes harmonic strengths. At the midpoint, even modes are not excited in the ideal model. Damping controls sound duration; the body filter changes timbre.')},t(LessonRecordingHelp,{}),${p('Sinteză numerică Karplus–Strong: un semnal inițial este recirculat printr-o linie de întârziere, mediat și atenuat la fiecare trecere. Un filtru trece-jos este aplicat apoi semnalului; el aproximează schimbarea timbrului produsă de corp, fără a modela rezonanțele reale ale cutiei. Desenul corzii este o reprezentare încetinită, separată de sunetul sintetizat.','Karplus–Strong numerical synthesis: an initial signal circulates through a delay line and is averaged and attenuated on each pass. A low-pass filter then changes the timbre; it does not model the actual resonances of the guitar body. The string drawing is a slowed representation, separate from the synthesized sound.')}]})]})`],
  ['"Rezonanță corp "',text('Filtru de corp ','Body filter ')],
  ['"x = -A·k·b·e^",NaN,"qz","}","·sin(kx-ωt) , z = A·q·e^",NaN,"qz","}","·cos(kx-ωt)"','"x = -A·k·b·e^{qz}·sin(kx-ωt) ; z = A·q·e^{qz}·cos(kx-ωt)"'],
  ['"De suprafață pe apă = compus: traiectorie eliptică (transversal + longitudinal)"',text('Unde de suprafață pe apă = unde compuse: traiectorii eliptice (transversal + longitudinal)','Water surface waves = combined waves: elliptical trajectories (transverse + longitudinal)')],
  ['" ",t("br",{})," v = "','" | v = "'],
  
  ['"y = A sin(ωt - kx) = "','"y = A·sin 2π(t/T − x/λ) = "'],
  ['", k=",C.toFixed(2)','", λ=",d.toFixed(2)," m"'],
  ['`vf = ω/k = v = ${2 .toFixed(2)} m/s, Δφ=kΔx=${U.toFixed(2)} rad=${(U*180/Math.PI).toFixed(0)}°`','`v_f = λ/T = ${2 .toFixed(2)} m/s; |Δφ| = 2π|Δx|/λ = ${Math.abs(U).toFixed(2)} rad = ${(Math.abs(U)*180/Math.PI).toFixed(0)}°`'],
  ['"φ(x,t)=ωt-kx, v_f = ω/k = "','"v_f = λ/T = "'],
  ['" m/s, Δφ = k·(x₂-x₁) = ",U.toFixed(3)','" m/s; |Δφ| = ",Math.abs(U).toFixed(3)'],
  ['function ie({id,title,children}){',mathComponents+foundationComponent+stringComponent+huygensComponent+`function LessonTextbookLayout({items}){
 const demos=[um,Em,om,_m,tm,Um,im,LessonWaveFoundations,LessonWavePropagation],notes=[],formulas=[],experiments=[];
 for(const item of items){if(item?.type==='h4')continue;if(demos.includes(item?.type))experiments.push(item);else if(item?.type===Me||item?.type===LessonFormulaBox)formulas.push(item);else notes.push(item);}
 return f('div',{className:'wave-textbook-page'+(experiments.length?'':' wave-textbook-reading'),'data-textbook-water':experiments.some(item=>item.type===Em)?'':undefined,children:[
  f('div',{className:'wave-textbook-notes',children:[...notes,formulas.length>0&&f('div',{className:'wave-textbook-formulas',children:formulas})]}),
  experiments.length>0&&f('div',{className:'wave-textbook-experiment',children:experiments})
 ]});
}
function LessonWaterActivity({elementProps}){
 const [view,setView]=N.useState(0),children=N.Children.toArray(elementProps.children);
 const figures=children.filter(c=>c?.props?.className==='praxis-wave-figure');
 const [scene,orbit]=figures;
 const heading=children.find(c=>N.Children.toArray(c?.props?.children).some(x=>x?.type==='h3'));
 const controls=children.find(c=>c?.props?.className?.includes('md:grid-cols-4'));
 const notes=children.find(c=>c?.props?.className?.includes('md:grid-cols-3'));
 const actions=children.find(c=>c?.props?.className?.includes('mt-4 flex'));
 const footnote=children.find(c=>c?.props?.className?.startsWith('mt-3 text-[11px] opacity-60'));
 const orbitNote=children.find(c=>lessonPlain(c).startsWith('Orbite liniare:'));
 const extraNotes=children.filter(c=>![heading,scene,orbit,controls,notes,actions,footnote,orbitNote].includes(c));
 const cards=N.Children.toArray(notes.props.children),buttons=N.Children.toArray(actions.props.children);
 const readout=scene.props,ratio=Number(readout['data-water-ratio']),speeds=[['v_general',readout['data-water-speed']],['v_adâncă',readout['data-water-deep']],['v_mică',readout['data-water-shallow']]];
 const labels=['Simulare','Mărimi și orbită','Explicații','Aplicații'];
 const select=event=>{const current=Number(event.currentTarget.dataset.waterView);let next;if(event.key==='ArrowRight')next=(current+1)%4;if(event.key==='ArrowLeft')next=(current+3)%4;if(event.key==='Home')next=0;if(event.key==='End')next=3;if(next!==undefined){event.preventDefault();setView(next);document.getElementById('water-activity-'+next)?.focus();}};
 return f('div',{className:'wave-water-activity','data-water-view':view,children:[
  t('div',{className:'wave-water-tabs',role:'tablist','aria-label':'Activități: unde pe apă',children:labels.map((label,i)=>t('button',{id:'water-activity-'+i,type:'button',role:'tab','data-water-view':i,'aria-selected':view===i,'aria-controls':'water-panel-'+i,tabIndex:view===i?0:-1,onClick:()=>setView(i),onKeyDown:select,children:label},i))}),
  f('div',{className:'wave-water-body',children:[
   f('div',{hidden:view!==0,className:'wave-water-readout',children:[t('strong',{children:['Regim: ',t('span',{children:readout['data-water-regime']})]}),t(LessonMathText,{children:'h/λ = '+ratio.toFixed(3)}),t('div',{className:'wave-water-speed-values',children:speeds.map(([symbol,value])=>t(LessonMathText,{children:symbol+' = '+Number(value).toFixed(2)+' m/s'},symbol))}),readout['data-water-breaking']&&t('div',{className:'wave-water-breaking',role:'status',children:t(LessonMathText,{children:'Prag schematic: H/h = 2A/h > 0.78'})})]}),
   f('div',{id:'water-panel-0',hidden:view!==0,role:'tabpanel','aria-labelledby':'water-activity-0',className:'wave-water-scene',children:[scene,t('p',{className:'wave-water-orbit-note',children:'Centre fixe pe orizontale (model liniar). ×n: mărire locală a orbitelor mici, aceeași pe ambele axe, cel mult ×8.'})]}),
   t('div',{id:'water-panel-1',hidden:view!==1,role:'tabpanel','aria-labelledby':'water-activity-1',className:'wave-water-scene',children:[orbitNote,orbit]}),
   t('div',{hidden:view>1,className:'wave-water-controls',children:controls}),
   t('div',{hidden:view>1,className:'wave-water-actions',children:buttons.filter((_,i)=>i<3||i===buttons.length-1)}),
   t('div',{hidden:view!==1,className:'wave-water-results',children:cards[0]}),
   f('div',{id:'water-panel-2',hidden:view!==2,role:'tabpanel','aria-labelledby':'water-activity-2',className:'wave-water-reading',children:[...extraNotes,heading,cards[1],t('details',{className:'wave-water-representation-note',children:[t('summary',{children:'Detalii despre reprezentare'}),footnote]})]}),
   f('div',{id:'water-panel-3',hidden:view!==3,role:'tabpanel','aria-labelledby':'water-activity-3',className:'wave-water-reading',children:[cards[2],t('div',{className:'wave-water-actions',onClickCapture:event=>{if(event.target.closest('button')===event.currentTarget.querySelector('button'))setView(0);},children:buttons.filter((_,i)=>i===3||i===4)})]})
  ]})
 ]});
}
function ie({id,title,children}){`],
  ["groups.length>1&&t('div',{className:'lesson-parts'", "groups.length>5&&t('label',{className:'wave-part-choice',children:[t('span',{children:'Activitate'}),t('select',{'aria-label':'Activitate',value:String(part),onChange:event=>{const i=Number(event.target.value);setPart(i);ctx?.go({topic:id,part:i},false)},children:groups.map((g,i)=>t('option',{value:String(i),children:g.label},i))})]}),groups.length>1&&t('div',{className:'lesson-parts'"],
  ["const short=lessonTopics.find", "if(id==='stationare'){groups[0].label='Reflexia la capăt fix sau liber';groups[1].label='Unde staționare și moduri proprii'}if(id==='marimi'){const names=['Vectorul de oscilație','Puncte de egală fază','Lungimea de undă','Propagarea într-o perioadă','Simulare și mărimi','Suprafață, rază și front','Viteză și mediu','Model cu piese domino'];groups.forEach((g,i)=>g.label=names[i]||g.label)}const short=id==='stationare'?'Unde staționare într-o coardă elastică':lessonTopics.find"],
  ["className:'lesson-part-content',children:g.items", "className:'lesson-part-content',children:['clasificare','marimi','ecuatia','huygens'].includes(id)?t(LessonTextbookLayout,{items:g.items}):g.items"],
  ["return f('div',{className:'lesson-navigation',children:[", "return f('div',{className:'lesson-navigation',children:[t('label',{className:'wave-group-choice',children:[t('span',{children:'Secțiune'}),t('select',{'aria-label':'Secțiunea laboratorului',value:String(gi),onChange:event=>ctx.go(lessonGroups[Number(event.target.value)].topics[0][0],false),children:lessonGroups.map((g,i)=>t('option',{value:String(i),children:g.name},i))})]}),"],
  ['"10. Numărul de undă k=",options:["2π/λ","λ/2π","v/T","A·ω"],correct:0,expl:"k=2π/λ (m⁻¹), analog spațial cu ω=2πν. v=ω/k."',`"10. Viteza de fază este:",options:["λ/T","T/λ","λ·T","A·ω"],correct:0,expl:"v_f = λ/T = λ·ν; într-o perioadă faza înaintează cu o lungime de undă."`],
  ['"k (număr de undă)",def:"k=2π/λ, analog spațial cu ω."','"Periodicitate spațială",def:"y(x + λ,t) = y(x,t); perioada spațială este λ."'],
  ['"v = ω/k",demo:"marimi",desc:"v din ω,k"','"v_f = λ/T",demo:"marimi",desc:"v din λ și T"'],
  ['"k = 2π/λ, ω=2πν"','"ω = 2π/T, ν = 1/T"'],
  ['"T, ν=1/T, ω=2πν, λ=vT, k=2π/λ, v=λν=ω/k. v depinde de mediu, ν de sursă."','"T, ν=1/T, ω=2πν, λ=vT, v=λν=λ/T. v depinde de mediu, ν de sursă."'],
  ['"v=λν=ω/k, depinde de mediu: coardă √(T/μ), sunet √(γRT/M)."','"v=λν=λ/T, depinde de mediu: coardă √(T/μ), sunet √(γRT/M)."'],
  ['id:"interferenta",title:"1.3.3 Interferența. Coerență. Bătăi.",children:[',`id:"interferenta",title:"Interferența undelor. Unde staționare",children:[${p('Într-un mediu liniar, principiul superpoziției: în regiunea de suprapunere, elongația rezultantă este suma algebrică a elongațiilor, iar după traversare undele își continuă propagarea independent. Două unde sunt coerente dacă au aceeași pulsație și diferență de fază constantă. Câmpul de interferență este regiunea în care ele se suprapun; franjele unesc punctele de amplitudine maximă sau minimă.','In a linear medium, superposition: in the overlap region, resultant displacement is the algebraic sum of displacements; after crossing, waves continue independently. Coherent waves have the same angular frequency and constant phase difference. The interference field is their overlap region; fringes connect points of maximum or minimum amplitude.')},${formula('A = √(A₁² + A₂² + 2A₁A₂ cos Δφ) ; A_max = A₁ + A₂ ; A_min = |A₁ − A₂|')},`],
  ["const names=['Ideile de bază','Unde plane și sferice','Unde pe apă','Tsunami']","const names=['Propagare și clasificare','Unde pe apă']"],
  ["['clasificare','Clasificare și propagare'],['marimi','Mărimi caracteristice']","['clasificare','Propagare și clasificare'],['marimi','Modelul undă plană']"],
  ["['reflexie','Reflexie, refracție, difracție'],['interferenta'","['reflexie','Reflexie și refracție'],['rezonanta-cladiri','Unde seismice'],['interferenta'"],
  ["['rezonanta-cladiri','Rezonanță seismică'],",''],
  ['id:"rezonanta-cladiri",title:"12. De ce cad blocurile – rezonanță seismică clădiri (extensie seismic)",children:[',`id:"rezonanta-cladiri",title:${text('Unde seismice','Seismic waves')},children:[${p('Undele interne P sunt longitudinale, iar undele S sunt transversale. La suprafață, undele Love au oscilație transversală orizontală, iar Rayleigh au mișcare eliptică în plan vertical. Undele S nu se propagă prin lichide. Hipocentrul este sursa din interiorul Pământului; epicentrul este proiecția sa pe suprafață. Magnitudinea caracterizează evenimentul, iar intensitatea descrie efectele într-un anumit loc.','Internal P waves are longitudinal and S waves are transverse. At the surface, Love waves move transversely in the horizontal plane; Rayleigh waves follow elliptical motion in a vertical plane. S waves do not travel through liquids. The hypocentre is the source inside Earth; the epicentre is its surface projection. Magnitude describes the event; intensity describes local effects.')},${h('Tsunami: propagare și măsurare','Tsunami: propagation and measurement')},t(zm,{}),${h('Extensie: rezonanța clădirilor','Extension: building resonance')},`],
  ['id:"acustica",title:"1.3.6 Acustica: intensitate, nivel, calități",children:[',`id:"acustica",title:"1.3.6 Acustica: intensitate, nivel, calități",children:[${p('Acustica studiază producerea, propagarea și recepția sunetelor. Un sunet pur este o oscilație armonică de o singură frecvență; armonicele au frecvențe multipli întregi ai fundamentalei. Sunetul compus suprapune fundamentala și armonicele. Sunetele muzicale sunt periodice; zgomotele sunt în general aperiodice.','Acoustics studies sound production, propagation and reception. A pure tone is a harmonic oscillation at one frequency; harmonics have frequencies that are integer multiples of the fundamental. A complex tone combines the fundamental and harmonics. Musical tones are periodic; noise is generally aperiodic.')},t(Cm,{}),`],
  ['children:"Difracția"','children:'+text('Extensie: difracția','Extension: diffraction')],
  ['children:"Bătăile – caz particular"','children:'+text('Extensie: bătăile','Extension: beats')]
 ];
 for(const [before,after]of pairs)replace(before,after);
 // Other sections, reference cards and assessment use the same explicit notation.
 html=html.replace(/"(?:[^"\\]|\\.)*"/g,literal=>{
  let s;try{s=JSON.parse(literal)}catch{return literal}
  const out=textbookNotation(s);
  if(out===s)return literal;
  return `/*praxis-textbook:${Buffer.from(literal).toString('base64')}*/${JSON.stringify(out)}/*/praxis-textbook*/`;
 });
 const tsunamiStart=html.indexOf('function zm(){'),tsunamiEnd=html.indexOf('function gm(){',tsunamiStart);
 if(tsunamiStart<0||tsunamiEnd<0)throw Error('Missing original tsunami stand');
 const originalTsunami=html.slice(tsunamiStart,tsunamiEnd);
 html=html.slice(0,tsunamiStart)+'/*praxis-tsunami:'+Buffer.from(originalTsunami).toString('base64')+'*/'+tsunamiComponent+'\n/*/praxis-tsunami*/'+html.slice(tsunamiEnd);
 return html;
}
