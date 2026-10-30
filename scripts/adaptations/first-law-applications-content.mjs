// Editorial adaptation of the imported lesson; original files stay available for provenance.
export function adaptApplicationsContent(data,lang){
 const ro=lang==='ro';
 Object.assign(data.strings,ro?{
  'cal.demo.poly':'Poliatomică neliniară',
  'cal.rotate':'Alege axa, apoi trage molecula cu mouseul sau degetul pentru a roti cadrul rigid. Trage de originea O pentru a deplasa întregul sistem. Tastatură: săgeți pentru rotație, Alt + săgeți pentru deplasare, Home pentru resetare.',
  'cal.axis':'Axa de rotație',
  'cal.resetView':'Resetează perspectiva',
  'izo.demo.v':'Volumul maxim al procesului V_max','izo.kf2':'|L| = aria',
  'izo.p2':'Graficul este o hiperbolă. Modulul lucrului mecanic este aria de sub curbă: L > 0 la destindere și L < 0 la comprimare. Demonstrația folosește T = 300 K și volumul minim 10 L.',
  'pol.vertical':'Diagramă verticală: V constant; dp/dV nu este finit.',
  'ad.demo.pump':'Revino la V_i',
  'cal.degrees.mono':'<strong>3 translații = 3 grade de libertate.</strong> Centrul atomului se poate deplasa independent pe Ox, Oy și Oz. Modelul monoatomic nu include rotații sau vibrații interne.',
  'cal.degrees.di':'<strong>3 translații + 2 rotații = 5 grade de libertate.</strong> Legătura rămâne aliniată cu Ox; cadrul se poate roti numai în jurul axelor perpendiculare Oy și Oz. Rotația în jurul legăturii și vibrațiile nu sunt incluse în acest model rigid.',
  'cal.degrees.poly':'<strong>3 translații + 3 rotații = 6 grade de libertate.</strong> Exemplul este o moleculă neliniară rigidă, care se poate roti în jurul a trei axe independente. O moleculă poliatomică liniară are numai două rotații relevante. Vibrațiile nu sunt incluse.',
  'ad.demo.g':'Exponentul γ (fără unitate)','ad.demo.v':'Raportul V_f/V_i (fără unitate)',
  'tab141.note':'Modelul rigid descrie aproximativ gazele monoatomice și biatomice în domeniul în care rotațiile relevante sunt active și vibrațiile sunt neglijabile. Valorile experimentale pot diferi din cauza temperaturii și a interacțiunilor moleculare.',
  'ex1411.text':'Pentru o cantitate constantă de gaz ideal care urmează procesul liniar p = kV, determinați indicele politropic n, căldura molară C și lucrul mecanic L între temperaturile T_i și T_f.'
 }:{
  'cal.demo.poly':'Nonlinear polyatomic',
  'cal.rotate':'Choose an axis, then drag the molecule with a mouse or finger to rotate the rigid frame. Drag the origin O to move the whole system. Keyboard: arrows to rotate, Alt + arrows to move, Home to reset.',
  'cal.axis':'Rotation axis',
  'cal.resetView':'Reset view',
  'izo.demo.v':'Maximum process volume V_max','izo.kf2':'|L| = area',
  'izo.p2':'The graph is a hyperbola. The magnitude of work is the area under the curve: L > 0 during expansion and L < 0 during compression. The demonstration uses T = 300 K and minimum volume 10 L.',
  'pol.vertical':'Vertical diagram: V constant; dp/dV is not finite.',
  'ad.demo.pump':'Return to V_i',
  'cal.degrees.mono':'<strong>3 translations = 3 degrees of freedom.</strong> The atom can move independently along Ox, Oy and Oz. The monatomic model includes no internal rotations or vibrations.',
  'cal.degrees.di':'<strong>3 translations + 2 rotations = 5 degrees of freedom.</strong> The bond stays aligned with Ox; the frame rotates only about the perpendicular Oy and Oz axes. Rotation about the bond and vibrations are excluded in this rigid model.',
  'cal.degrees.poly':'<strong>3 translations + 3 rotations = 6 degrees of freedom.</strong> This example is a rigid nonlinear molecule, with three independent rotational axes. A linear polyatomic molecule has only two relevant rotations. Vibrations are excluded.',
  'ad.demo.g':'Exponent γ (dimensionless)','ad.demo.v':'Ratio V_f/V_i (dimensionless)',
  'tab141.note':'The rigid model approximates monatomic and diatomic gases when the relevant rotations are active and vibrations are negligible. Experimental values may differ because of temperature and molecular interactions.',
  'ex1411.text':'For a fixed amount of ideal gas following the linear process p = kV, find the polytropic index n, the molar heat capacity C and the work L between temperatures T_i and T_f.'
 });
 data.temperatures=ro?[
  'La %T K folosim modelul biatomic rigid: 3 translații + 2 rotații, i = 5. Domeniul exact de aplicabilitate depinde de gaz.',
  'La %T K vibrațiile pot deveni importante, în funcție de gaz. Nu există un prag universal la 600 K; atunci C_V și γ nu mai sunt constante.',
  'La %T K unele rotații pot fi slab excitate, în funcție de gaz. Pragurile sunt specifice moleculei; modelul clasic cu i = 5 poate să nu fie aplicabil.'
 ]:[
  'At %T K we use the rigid diatomic model: 3 translations + 2 rotations, i = 5. Its precise range of validity depends on the gas.',
  'At %T K vibrations may become important, depending on the gas. There is no universal threshold at 600 K; C_V and γ then vary with temperature.',
  'At %T K some rotations may be weakly excited, depending on the gas. The thresholds are molecule-specific; the classical i = 5 model may not apply.'
 ];
 for(const key of Object.keys(data.strings))if(/^(home\.err|sec\.kicker|foot\.|res\.src\.|ex\d+\.err\.)/.test(key))delete data.strings[key];
 Object.assign(data.strings,ro?{
  'home.lead':'De la căldurile molare la procesele politrope, cu demonstrații interactive, formule, probleme rezolvate și un test de verificare.',
  'home.fact.examples':'probleme rezolvate','home.map.title':'Harta lecției',
  'home.map.3':'Transformarea izocoră și o problemă rezolvată',
  'home.map.4':'Transformarea izobară și o problemă rezolvată',
  'home.map.6':'Transformarea adiabatică, exponentul adiabatic și probleme rezolvate',
  'home.map.7':'Sinteza celor patru transformări și o problemă cu piston',
  'izob.gap.tag':'Deducerea variației energiei interne',
  'izob.gap.body':'Din relația lui Mayer, C_p − R = C_V, rezultă ΔU = νC_pΔT − νRΔT = νC_VΔT.',
  'quiz.lead':'Treisprezece întrebări despre transformările gazului ideal. Primești feedback imediat și un semnal sonor pentru fiecare răspuns, dacă sunetul este activ.',
  'quiz.great':'Excelent — stăpânești conceptele lecției.',
  'ad.demo.title':'Demo · adiabata și izoterma','tab141.cap':'Compararea teoriei cu experimentul'
 }:{
  'home.lead':'Explore molar heat capacities and polytropic processes through interactive demonstrations, formulas, worked problems and a self-check quiz.',
  'home.fact.examples':'worked problems','home.map.title':'Lesson map',
  'home.map.3':'Isochoric process and a worked problem',
  'home.map.4':'Isobaric process and a worked problem',
  'home.map.6':'Adiabatic process, adiabatic exponent and worked problems',
  'home.map.7':'Summary of the four processes and a piston problem',
  'izob.gap.tag':'Deriving the internal energy change',
  'izob.gap.body':'Mayer’s relation, C_p − R = C_V, gives ΔU = νC_pΔT − νRΔT = νC_VΔT.',
  'quiz.lead':'Thirteen questions about ideal gas processes, with instant feedback and a sound cue for each answer when sound is enabled.',
  'quiz.great':'Excellent — you have mastered the concepts in this lesson.',
  'ad.demo.title':'Demo · adiabat and isotherm','tab141.cap':'Theory compared with experiment'
 });
 for(const steps of Object.values(data.steps))for(const step of steps)if(/manual|textbook|figure 1\.4|figura 1\.4/i.test(step.n||''))delete step.n;
 data.answers.ex142=ro?'Q ≈ 210,1 J':'Q ≈ 210.1 J';
 data.questions.forEach((q,index)=>q.tag=(index+1)+' / '+data.questions.length);
 data.questions[7].text.why=ro?'Q = m·c_V·T₁·(p₂/p₁ − 1) = 0,7·300,15·1 ≈ 210 J.':'Q = m·c_V·T₁·(p₂/p₁ − 1) = 0.7·300.15·1 ≈ 210 J.';
 for(let i=1;i<=6;i++)data.strings['problem.'+i]=(ro?'Problema ':'Problem ')+i;
 // Every remaining string must be independent of source chapter/page numbering.
 const clean=value=>{
  if(typeof value==='string')return value.replace(/subcapitol(?:ul|ului)?/gi,'lecția').replace(/subchapters?/gi,'lesson').replace(/\b1\.4\.\d+(?:\.\d+)*\b/g,'').replace(/\s+\(fig\.[^)]*\)/gi,'');
  if(Array.isArray(value))return value.map(clean);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clean(v)]));
  return value;
 };
 const result=clean(data);
 const remaining=JSON.stringify(result).match(/.{0,65}(?:manual|textbook|subcapitol|subchapter|Mantea|Garabet|ISBN).{0,100}/i);
 if(remaining)throw new Error('Source reference left in '+lang+' lesson content: '+remaining[0]);
 return result;
}

export function adaptApplicationsBody(body,strings){
 body=body.replace(/<div class="notice">[\s\S]*?<\/div>\s*<\/div>/,'')
  .replace(/<div class="err-flag">[\s\S]*?<\/div>/g,'')
  .replace(/<div class="prose">\s*<h3 data-i18n="res\.src\.title">[\s\S]*?<\/div>/,'')
  .replace(/<p class="kicker"[^>]*>[\s\S]*?<\/p>/g,'')
  .replace(/<!--[^]*?-->/g,'');
 // Render the same editorial text before and after the first language application.
 body=body.replace(/(<([a-z][a-z0-9]*)\b[^>]*data-i18n="([^"]+)"[^>]*>)[\s\S]*?<\/\2>/gi,(all,open,tag,key)=>strings[key]===undefined?all:open+strings[key]+'</'+tag+'>');
 let card=0;body=body.replace('<ol class="toc">','<ol class="lesson-map">').replace(/(<a href="#[^"]+" data-nav="[^"]+">)<b>[^<]*<\/b>(<span data-i18n="home\.map\.\d+">)/g,(_,open,caption)=>open+'<b class="lesson-map-number">'+(++card)+'</b>'+caption);
 const problems={'1.4.2':1,'1.4.1':2,'1.4.3':3,'1.4.4':4,'1.4.5':5,'1.4.1.1':6};
 body=body.replace(/<span class="ex-badge">Ex\. ([\d.]+)<\/span>/g,(_,number)=>'<span class="ex-badge" data-i18n="problem.'+problems[number]+'">'+strings['problem.'+problems[number]]+'</span>');
 if(/manual|textbook|subcapitol|subchapter|Mantea|Garabet|ISBN|\b1\.4\.\d+/i.test(body))throw new Error('Source reference left in lesson markup');
 return body;
}
