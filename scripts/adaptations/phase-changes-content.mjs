import {liquefactionStrings} from './liquefaction-content.mjs';
// Editorial and scientific adaptation. The external source remains unchanged.
export function adaptContent(data,lang){
 const ro=lang==='ro';
 const pairs={
 'nav.home':['Introducere','Introduction'],
 'home.title':['De la solid la vapori','From solid to vapour'],
 'sec.quiz.short':['Verificare','Self-check'],
 'sec.resurse.short':['Resurse','Resources'],
 'sec.evap.short':['Evaporare','Evaporation'],
 'sec.fierbere.short':['Fierbere','Boiling'],
 'fie.st.fierbe':['Fierbe — temperatură constantă la presiune fixă','Boiling — constant temperature at fixed pressure'],
 'sec.fierbere.lead':['Compară două moduri de a produce fierberea: încălzirea apei la presiune fixă și scăderea presiunii deasupra apei într-o seringă închisă. Urmărește separat temperatura, presiunea și formarea vaporilor.','Compare two ways of producing boiling: heating water at fixed pressure and lowering the pressure above water in a sealed syringe. Track temperature, pressure and vapour formation separately.'],
 'fie.p1':['La încălzirea apei pot apărea mai întâi bule de aer dizolvat, care se degajă. Acestea nu dovedesc singure că apa fierbe. Bulele de vapori pot crește în masa lichidului când presiunea lor poate echilibra presiunea locală; într-un vas puțin adânc neglijăm contribuția hidrostatică.','Heating water can first release dissolved air bubbles. These alone do not prove boiling. Vapour bubbles can grow within the liquid when their pressure can balance the local pressure; the hydrostatic contribution is neglected in this shallow-vessel model.'],
 'fie.p2':['Pentru apă pură la presiunea atmosferică normală, fierberea are loc la aproximativ 100 °C. La presiune fixă, căldura furnizată în continuare vaporizează apa, fără a-i crește temperatura. La altă presiune, temperatura de fierbere este diferită.','Pure water boils at approximately 100 °C at normal atmospheric pressure. At fixed pressure, further supplied heat vaporises the water without increasing its temperature. A different pressure gives a different boiling temperature.'],
 'fie.safe.body':['În activitatea practică folosește o seringă fără ac și apă la temperatura camerei. Nu încălzi seringa. Pentru experimentul cu arzătorul, vasul și sursa de încălzire se manevrează conform regulilor laboratorului.','For the practical activity use a needle-free syringe and room-temperature water. Do not heat the syringe. Handle the heated vessel and heat source according to laboratory rules.'],
 'fie.demo.title':['Demo · încălzire și fierbere în seringă','Demo · heating and boiling in a syringe'],
 'fie.demo.syringe':['Trage pistonul','Pull the plunger'],
 'fie.demo.hint':['Alege experimentul de mai sus. În modul Încălzire, pornește arzătorul și observă creșterea temperaturii, apoi platoul. În modul Seringă, trage pistonul și observă scăderea presiunii și apariția temporară a bulelor; împinge-l înapoi pentru a opri fierberea.','Choose the experiment above. In Heating mode, start the burner and observe the temperature rise followed by a plateau. In Syringe mode, pull the plunger and observe the pressure drop and temporary bubbles; push it back to stop boiling.'],
 'toast.syringe':['Piston tras: volumul gazului crește; presiunea scade inițial.','Plunger pulled: gas volume increases and pressure initially falls.'],
 'boil.protocol.title':['Experimentul cu seringa, pas cu pas','The syringe experiment, step by step'],
 'boil.protocol.1':['Aspiră aproximativ 5 mL de apă la temperatura camerei într-o seringă transparentă, fără ac. Elimină bulele mari de aer și închide orificiul cu un capac potrivit.','Draw about 5 mL of room-temperature water into a transparent, needle-free syringe. Expel large air bubbles and close the outlet with a suitable cap.'],
 'boil.protocol.2':['Trage pistonul: volumul spațiului de deasupra apei crește, iar presiunea scade. Dacă presiunea totală devine suficient de mică, pot crește bule de vapori chiar la temperatura camerei.','Pull the plunger: the space above the water expands and pressure falls. If the total pressure becomes sufficiently low, vapour bubbles can grow even at room temperature.'],
 'boil.protocol.3':['Ține pistonul în poziție. Vaporii formați măresc presiunea din incinta închisă, iar vaporizarea consumă energie și răcește puțin apa. Fierberea se atenuează și se oprește; presiunea nu rămâne impusă la valoarea minimă.','Hold the plunger in place. Newly formed vapour raises pressure in the sealed chamber, while vaporisation consumes energy and slightly cools the water. Boiling weakens and stops; pressure does not stay fixed at its minimum.'],
 'boil.protocol.4':['Împinge pistonul înapoi. Presiunea crește, o parte din vapori condensează și fierberea se oprește. Compară această situație cu vasul încălzit la presiune fixă: în seringă nu există arzător.','Push the plunger back. Pressure rises, some vapour condenses and boiling stops. Compare this with heating at fixed pressure: the syringe has no burner.'],
 'boil.mode.heat':['Încălzire','Heating'],
 'boil.mode.syringe':['Pregătește seringa','Prepare the syringe'],
 'boil.push':['Împinge pistonul','Push the plunger'],
 'boil.run':['Pornește / Pauză','Start / Pause'],
 'boil.time':['Timp simulat','Simulated time'],
 'boil.model.details':['Ipotezele modelului','Model assumptions'],
 'boil.scale.note':['Graficul arată valori calculate; pentru seringă, scara verticală este detaliată deoarece răcirea poate fi mică.','The graph shows calculated values; the syringe uses a detailed vertical scale because cooling can be small.'],
 'boil.events':['Evenimentele experimentului','Experiment events'],
 'boil.pressure':['Presiune actuală','Current pressure'],
 'boil.note':['Model orientativ: apă pură, gaz ideal în spațiul de deasupra și schimb de căldură latentă. În seringă: 5 mL apă la 25 °C; spațiul gazos crește de la 0,2 la 20 mL, apoi presiunea se recalculează pe măsură ce apar vapori. Răcirea poate fi mică; graficul folosește o scară detaliată. Valorile sunt calculate, nu măsurate. Încălzirea rulează de 4 ori mai repede; experimentul cu seringa rulează în timp simulat 1:1.','Illustrative model: pure water, ideal gas headspace and latent heat exchange. The syringe contains 5 mL of water at 25 °C; headspace increases from 0.2 to 20 mL, then pressure is recalculated as vapour forms. Cooling can be small; the graph uses a detailed scale. Values are calculated, not measured. Heating runs four times faster; the syringe uses 1:1 simulated time.'],
 'boil.graph.title':['Temperatura în funcție de timp','Temperature versus time'],
 'boil.diagram.heat':['Vas în incintă cu presiune impusă','Vessel in a controlled-pressure chamber'],
 'boil.diagram.syringe':['Seringă închisă, fără încălzire','Sealed syringe, no heating'],
 'boil.diagram.closed':['Orificiu închis','Closed outlet'],
 'boil.event.pull':['Piston tras','Plunger pulled'],
 'boil.event.push':['Piston împins','Plunger pushed'],
 'boil.event.pressure':['Presiune schimbată','Pressure changed'],
 'boil.state.ready':['Pregătit / în pauză','Ready / paused'],
 'boil.state.sealed':['Seringă pregătită — trage pistonul','Syringe ready — pull the plunger'],
 'boil.state.heating':['Apa se încălzește','Water is warming'],
 'boil.state.noheat':['Încălzire oprită','Heating is off'],
 'boil.state.pushed':['Fierbere oprită — piston revenit','Boiling stopped — plunger returned'],
 'boil.state.flash':['Fierbere temporară — apa se răcește','Temporary boiling — water is cooling'],
 'boil.state.saturated':['Fierbere oprită — presiunea a crescut','Boiling stopped — pressure has risen'],
 'sec.faze.short':['Diagrama de faze','Phase diagram'],
 'eva.demo.title':['Demo · răcirea apei prin evaporare','Demo · evaporative cooling of water'],
 'eva.demo.rate':['Debit masic','Mass flow rate'],
 'eva.rate.title':['Viteza de evaporare — debit masic','Evaporation rate — mass flow rate'],
 'eva.rate.definition':['Viteza medie de evaporare este masa netă de lichid evaporată în unitatea de timp. Pentru viteza instantanee folosim scăderea masei lichidului:','The average evaporation rate is the net mass of liquid evaporated per unit time. The instantaneous rate is given by the decrease in liquid mass:'],
 'eva.rate.units':['Δm_ev este masa evaporată, Δt intervalul de timp, iar m_l masa lichidului rămas. Unitatea SI este kg/s; în simulare debitul este afișat în g/s: 1 g/s = 10⁻³ kg/s. Aceasta este o viteză de pierdere a masei.','Δm_ev is the evaporated mass, Δt the time interval and m_l the remaining liquid mass. The SI unit is kg/s; the simulation displays g/s: 1 g/s = 10⁻³ kg/s. This measures the rate of mass loss.'],
 'eva.rate.dalton':['O relație empirică de tip Dalton descrie dependența de suprafață și de deficitul de presiune a vaporilor:','An empirical Dalton-type relation describes dependence on surface area and vapour-pressure deficit:'],
 'eva.rate.symbols':['S este aria suprafeței libere [m²], p_sat(T) presiunea de saturație la temperatura suprafeței lichidului [Pa], iar p_v presiunea parțială a vaporilor în aer [Pa]. Coeficientul k, în kg/(m²·s·Pa), depinde de curentul de aer, presiunea atmosferică, temperatură și geometrie.','S is the free-surface area [m²], p_sat(T) the saturation pressure at the liquid-surface temperature [Pa] and p_v the vapour partial pressure in the air [Pa]. The coefficient k, in kg/(m²·s·Pa), depends on airflow, atmospheric pressure, temperature and geometry.'],
 'eva.rate.interpretation':['O suprafață mai mare și un aer mai uscat favorizează evaporarea. Când p_v = p_sat(T), debitul net este zero; dacă p_v depășește p_sat(T), apare condensarea. Relația este aproximativă; demonstrația folosește un debit orientativ și parametri relativi, fără calibrarea experimentală a lui k.','A larger surface and drier air favour evaporation. At p_v = p_sat(T), net flow is zero; if p_v exceeds p_sat(T), condensation occurs. This relation is approximate; the demonstration uses an illustrative rate and relative parameters without experimentally calibrating k.'],
 'eva.demo.hint':['Model orientativ pentru 50 g de apă: energia pierdută prin vaporizare răcește lichidul, iar mediul la 300 K îi furnizează căldură. Aria și vântul sunt parametri relativi; debitul nu este o măsurătoare experimentală. Modelul se oprește la îngheț sau la epuizarea apei.','Illustrative model for 50 g of water: vaporisation removes heat while the 300 K surroundings supply heat. Area and wind are relative parameters; the mass flow is not an experimental measurement. The model stops at freezing or when the water is exhausted.'],
 'home.lead':['Topire și solidificare, vaporizare și condensare, evaporare, fierbere, sublimare și punctul triplu, cu demonstrații interactive, formule și probleme rezolvate.','Melting and freezing, vaporisation and condensation, evaporation, boiling, sublimation and the triple point, with interactive demonstrations, formulas and worked problems.'],
 'home.fact.examples':['probleme rezolvate','worked problems'],
 'home.map.title':['Harta lecției','Lesson map'],
 'home.map.3':['Temperaturi de topire și călduri latente specifice','Melting temperatures and specific latent heats'],
 'home.map.7':['Fierberea: presiunea, temperatura de fierbere și o problemă rezolvată','Boiling: pressure, boiling temperature and a worked problem'],
 'home.offline':['Funcționează complet offline','Works completely offline'],
 'home.iceValue':['gheață: 334 kJ/kg','ice: 334 kJ/kg'],
 'home.waterValue':['apă la 100 °C: 2,26 MJ/kg','water at 100 °C: 2.26 MJ/kg'],
 'home.dynamicValue':['echilibru dinamic','dynamic equilibrium'],
 'vap.obs2':['La fierberea unei substanțe pure în echilibru, la presiune constantă, temperatura rămâne constantă. Condensarea în aceleași condiții are loc la aceeași temperatură. Evaporarea de la suprafață poate avea loc și sub temperatura de fierbere.','When a pure substance boils in equilibrium at constant pressure, its temperature stays constant. Condensation under the same conditions occurs at the same temperature. Surface evaporation also occurs below the boiling temperature.'],
 'vap.tree.vid':['în vid — rapidă, până la saturație dacă rămâne lichid','in vacuum — rapid, reaching saturation if liquid remains'],
 'vid.concl1':['vaporizarea într-o incintă inițial vidată poate fi foarte rapidă;','vaporisation in an initially evacuated chamber can be very rapid;'],
 'tab.why1':['Topirea a 1 kg de gheață necesită circa 334 kJ, de aproximativ 160 de ori căldura necesară încălzirii aceleiași mase de gheață cu 1 K.','Melting 1 kg of ice requires about 334 kJ, approximately 160 times the heat needed to warm the same mass of ice by 1 K.'],
 'faze.obs2':['Iodul și camforul pot trece din solid în vapori. Mirosul unui material solid poate proveni din componente volatile, fără ca întregul material să sublimeze.','Iodine and camphor can pass from solid to vapour. A solid material’s smell may come from volatile components without the entire material subliming.'],
 'faze.p3':['Pentru apă, curba de topire este înclinată spre stânga: gheața ocupă mai mult volum decât apa lichidă, iar presiunea favorizează topirea. Pentru majoritatea substanțelor, curba este înclinată spre dreapta.','For water, the melting curve slopes left: ice occupies more volume than liquid water, so pressure favours melting. For most substances the curve slopes right.'],
 'home.law.note':['La schimbarea de fază a unei substanțe pure, în echilibru și la presiune constantă, căldura latentă modifică starea fără să schimbe temperatura.','During an equilibrium phase change of a pure substance at constant pressure, latent heat changes the phase without changing the temperature.'],
 'sec.tabele.short':['Valori de referință','Reference values'],
 'sec.tabele.title':['Temperaturi de topire și călduri latente','Melting temperatures and latent heats'],
 'sec.tabele.lead':['Valori aproximative la presiunea atmosferică normală. Selectează o substanță din tabel pentru a evidenția valorile în grafic.','Approximate values at normal atmospheric pressure. Select a substance in the table to highlight its values in the chart.'],
 'sec.faze.lead':['Temperaturile de topire, vaporizare și sublimare depind de presiune. Diagrama schematică arată regiunile de stabilitate și frontierele dintre fazele apei.','Melting, vaporisation and sublimation temperatures depend on pressure. The schematic diagram shows water’s stable phases and their boundaries.'],
 'etapa.note':['Valori utilizate: c_g = 2090 J/(kg·K), c_a = 4181 J/(kg·K), λ_t = 334 kJ/kg, λ_v = 2,26 MJ/kg la 100 °C, c_abur = 2010 J/(kg·K). Se neglijează pierderile de căldură.','Values used: c_g = 2090 J/(kg·K), c_a = 4181 J/(kg·K), λ_t = 334 kJ/kg, λ_v = 2.26 MJ/kg at 100 °C, c_steam = 2010 J/(kg·K). Heat losses are neglected.'],
 'tab.ref.body':['Valorile sunt rotunjite și pot varia cu puritatea substanței, presiunea și temperatura. Comparațiile au rol didactic.','Values are rounded and may vary with purity, pressure and temperature. Comparisons are illustrative.'],
 'vid.dalton.body':['Într-un gaz, transportul vaporilor este încetinit de difuzie. În aproximația amestecului ideal, presiunea parțială de saturație a vaporilor depinde de temperatură, nu de prezența gazelor necondensabile.','In a gas, vapour transport is slowed by diffusion. In the ideal-mixture approximation, saturation vapour partial pressure depends on temperature rather than the presence of non-condensable gases.'],
 'psat.demo.hint':['Repere: aproximativ 4,6 torr la 0 °C, 760 torr la 100 °C și 10 atm la 180 °C. Curba Antoine este o aproximație.','Reference points: approximately 4.6 torr at 0 °C, 760 torr at 100 °C and 10 atm at 180 °C. The Antoine curve is an approximation.'],
 'psat.ref.0':['aproximativ 4,6 torr la 0 °C','approximately 4.6 torr at 0 °C'],
 'psat.ref.100':['aproximativ 760 torr la 100 °C','approximately 760 torr at 100 °C'],
 'psat.ref.180':['aproximativ 10 atm la 180 °C','approximately 10 atm at 180 °C'],
 'quiz.lead':['Treisprezece întrebări despre transformările de stare. Primești feedback imediat; semnalele sonore respectă preferința comună.','Thirteen questions about phase changes, with immediate feedback and sound cues controlled by the shared preference.'],
 'res.prev.body':['Continuă explorarea cu celelalte laboratoare din capitolul Căldură și termodinamică.','Continue exploring the other laboratories in Heat and thermodynamics.'],
 'st.solidvapori':['Solid + vapori','Solid + vapour'],
 'st.solidlichid':['Solid + lichid','Solid + liquid'],
 'ex1521.text':['Într-o incintă vidată se introduce o picătură de apă la aproximativ 0 °C. În modelul adiabatic, ce fracțiune f îngheață prin vaporizarea restului? Folosește λ_g = 334 kJ/kg și λ_v = 2,50 MJ/kg. Neglijează căldura schimbată cu vasul și sublimarea ulterioară.','A water drop at approximately 0 °C is placed in an evacuated chamber. In an adiabatic model, what fraction f freezes as the remainder vaporises? Use λ_g = 334 kJ/kg and λ_v = 2.50 MJ/kg. Neglect heat exchange with the vessel and subsequent sublimation.'],
 'model.limits':['Model schematic: echilibru pentru substanțe pure; aproximări ale curbelor de saturație și neglijarea pierderilor termice. Diagrama nu include fazele de gheață de înaltă presiune.','Schematic model: pure-substance equilibrium, approximate saturation curves and neglected heat losses. High-pressure ice phases are excluded.']
 };
 for(const [key,values]of Object.entries(pairs))data.strings[key]=values[ro?0:1];
 Object.assign(data.strings,liquefactionStrings(lang));
 data.strings['quiz.lead']=ro?'Cincisprezece întrebări despre transformările de stare, lichefierea gazelor și punctul critic. Primești feedback imediat.':'Fifteen questions about phase changes, gas liquefaction and the critical point, with immediate feedback.';
 data.strings['boil.note']+=ro?' Vasul conține 100 g de apă, iar puterea maximă este 800 W. Pentru seringă neglijăm lucrul mecanic al pistonului și schimbul de căldură cu pereții.':' The vessel contains 100 g of water and maximum heater power is 800 W. For the syringe, piston work and heat transfer through the walls are neglected.';
 for(const key of Object.keys(data.strings))if(/^(home\.err|sec\.kicker|ex\d+\.err|res\.src|foot\.)/.test(key))data.strings[key]='';
 data.strings['ano.p2']=data.strings['ano.p2'].replace('950','917');
 data.strings['problem.1']=ro?'Problema 1':'Problem 1';data.strings['problem.2']=ro?'Problema 2':'Problem 2';
 data.answers={ex1511:ro?'Q = 77 300 J (77,3 kJ), cu λ_t = 334 kJ/kg.':'Q = 77,300 J (77.3 kJ), with λ_t = 334 kJ/kg.',ex1521:ro?'f = λ_v/(λ_g + λ_v) ≈ 0,882: îngheață aproximativ 88,2 %, iar 11,8 % se vaporizează.':'f = λ_v/(λ_g + λ_v) ≈ 0.882: approximately 88.2% freezes and 11.8% vaporises.'};
 const first=data.steps.ex1511;
 first[5].n=ro?'Topirea consumă circa 43 % din căldura totală, fără creșterea temperaturii.':'Melting consumes about 43% of the total heat without increasing temperature.';
 const drop=data.steps.ex1521;
 drop[0].n=ro?'Într-un model adiabatic simplificat, vaporizarea unei părți din picătură extrage căldura eliberată prin înghețarea restului. Se neglijează schimbul de căldură cu vasul și sublimarea ulterioară.':'In a simplified adiabatic model, vaporising part of the drop uses the heat released by freezing the remainder. Heat exchange with the vessel and subsequent sublimation are neglected.';
 drop[4].n=ro?'Masa se simplifică. Considerăm procesele la aproximativ 0 °C, în apropierea punctului triplu. În vid menținut, coexistența celor trei faze nu este un echilibru permanent.':'Mass cancels. The processes are approximated at 0 °C near the triple point. In a continuously evacuated chamber, three-phase coexistence is not a permanent equilibrium.';
 drop[5]={t:ro?'Evaluare numerică':'Numerical evaluation',f:['\\lambda_v=2{,}50\\cdot10^6\\ \\mathrm{J/kg},\\quad\\lambda_g=3{,}34\\cdot10^5\\ \\mathrm{J/kg}','f=\\frac{2{,}50}{2{,}50+0{,}334}\\approx0{,}882'],n:ro?'La 0 °C, căldura de vaporizare este aproximativ 2,50 MJ/kg; 2,83 MJ/kg este căldura de sublimare.':'At 0 °C the latent heat of vaporisation is approximately 2.50 MJ/kg; 2.83 MJ/kg is the latent heat of sublimation.'};
 data.questions.push({type:'mc',ok:1,text:ro?{q:'Un gaz la T > T_c poate fi lichefiat doar prin creșterea presiunii, menținând temperatura?',opts:['Da, dacă p depășește p_c','Nu; pentru lichefiere izotermă trebuie mai întâi răcit sub T_c','Da, dacă volumul este suficient de mare'],why:'Peste temperatura critică nu există o frontieră lichid–vapori pe izotermă. Compresia produce o schimbare continuă; creșterea presiunii singură nu realizează lichefierea.'}:{q:'Can a gas at T > T_c be liquefied by pressure alone while temperature is held constant?',opts:['Yes, once p exceeds p_c','No; isothermal liquefaction requires cooling below T_c first','Yes, if volume is large enough'],why:'Above critical temperature there is no liquid–vapour boundary along an isotherm. Compression gives a continuous change; pressure alone does not liquefy the gas.'}});
 data.questions.push({type:'mc',ok:0,text:ro?{q:'Ce se întâmplă pe platoul unei izoterme Andrews sub temperatura critică, la compresie?',opts:['Volumul scade și crește fracțiunea de lichid, la T și p constante','Temperatura crește, iar cantitatea de vapori rămâne constantă','Presiunea crește fără să apară lichid'],why:'Între G și L, lichidul și vaporii coexistă. Condensarea reduce volumul la presiunea de saturație și la temperatura impusă; căldura trebuie evacuată.'}:{q:'During compression on the plateau of an Andrews isotherm below critical temperature, what happens?',opts:['Volume decreases and the liquid fraction grows at constant T and p','Temperature rises while the amount of vapour stays constant','Pressure rises without any liquid forming'],why:'Between G and L, liquid and vapour coexist. Condensation reduces volume at the saturation pressure and imposed temperature; heat must be removed.'}});
 data.questions.forEach((q,i)=>{q.tag=(i+1)+' / '+data.questions.length;});
 data.questions[2].ok=77300;data.questions[2].text.why=ro?'Q = 2090 J + 33 400 J + 41 810 J = 77 300 J.':'Q = 2090 J + 33,400 J + 41,810 J = 77,300 J.';
 data.questions[2].text.q=data.questions[2].text.q.replace('c_g = 2090,','c_g = 2090 J/(kg·K),');
 data.questions[11].ok=2.50/(2.50+.334);
 data.questions[11].text.q=data.questions[11].text.q.replace('2,83','2,50').replace('2.83','2.50');
 data.questions[11].text.why=ro?'f = 2,50/(2,50 + 0,334) ≈ 0,882. Folosim căldura de vaporizare a apei la 0 °C, nu căldura de sublimare.':'f = 2.50/(2.50 + 0.334) ≈ 0.882. Use water’s vaporisation heat at 0 °C, not its sublimation heat.';
 data.questions[4].text.why=data.questions[4].text.why.replace('950','917');
 const clean=value=>{
  if(typeof value==='string')return value
   .replace(/\s*\((?:[^)]*(?:fig\.|figure|figura|1\.5\.)[^)]*)\)/gi,'')
   .replace(/(?:Fig(?:ura)?\.?|Figure|Tabel(?:ul|ele)?|Table|Ex(?:ercițiul)?\.?|Exercise)\s*1\.5(?:\.\d+)*(?:[–-]\d+)?\.?\s*[·:–—]?\s*/gi,'')
   .replace(/\b1\.5(?:\.\d+)*\.?\s*[·:–—]?\s*/g,'')
   .replace(/subcapitol(?:ul|ului)?/gi,'lecția').replace(/subchapter/gi,'lesson')
   .replace(/3\{,\}35|3,35/g,m=>m.includes('{')?'3{,}34':'3,34').replaceAll('33\\ 500','33\\ 400').replaceAll('77\\ 400','77\\ 300')
   .replace(/(?<!\\)lambda_/g,'\\lambda_');
  if(Array.isArray(value))return value.map(clean);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clean(item)]));
  return value;
 };
 const result=clean(data);
 const leftover=JSON.stringify(result).match(/.{0,35}(?:manual|textbook|subcapitol|subchapter|Mantea|Garabet|pagina|pages? \d).{0,80}/i);
 if(leftover)throw new Error('Unadapted '+lang+' reference: '+leftover[0]);
 return result;
}
