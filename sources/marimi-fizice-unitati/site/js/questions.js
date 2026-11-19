// Banca de întrebări pentru test. Se încarcă doar împreună cu tabul „Test”.
// Format: [capitol, nivel (1 ușor, 2 mediu, 3 greu), întrebare, corect, greșit1, greșit2, greșit3, explicație]
import { DERIVED, PREFIXES, BASE, QUANTITIES } from './data.js';
import { shuffle, esc, fmt, supText } from './core.js';

export const CHAPTERS = [
  { id: 1, n: 'Mărimi fizice' },
  { id: 2, n: 'Sistemul Internațional' },
  { id: 3, n: 'Multipli & Submultipli' },
  { id: 4, n: 'Unități derivate' },
  { id: 5, n: 'Scalari & Vectori' },
  { id: 6, n: 'Măsurare & Erori' },
];
export const LEVELS = ['', 'Ușor', 'Mediu', 'Greu'];

const P = e => `10<sup>${String(e).replace('-', '−')}</sup>`;

const STATIC = [
  // ---------- 1. Mărimi fizice ----------
  [1, 1, 'Ce este o <b>mărime fizică</b>?', 'o proprietate a unui corp sau fenomen care poate fi măsurată', 'orice obiect din laborator', 'o unitate de măsură', 'un instrument de măsură', 'Mărimea fizică descrie o proprietate măsurabilă: lungimea, masa, temperatura etc.'],
  [1, 1, 'A <b>măsura</b> o mărime fizică înseamnă:', 'a o compara cu o mărime de același fel aleasă ca unitate', 'a o estima din ochi', 'a o calcula din alte mărimi', 'a-i stabili direcția', 'Rezultatul măsurării arată de câte ori mărimea cuprinde unitatea.'],
  [1, 1, 'În scrierea „ℓ = 2,5 m”, numărul 2,5 este:', 'valoarea numerică', 'unitatea de măsură', 'simbolul mărimii', 'eroarea de măsurare', 'Mărime = valoare numerică × unitate de măsură.'],
  [1, 1, 'Simbolul folosit de obicei pentru <b>timp</b> este:', 't', 'T', 'm', 'v', 'T se folosește pentru temperatura absolută și pentru perioadă.'],
  [1, 1, 'Care dintre următoarele <b>nu</b> este o mărime fizică?', 'culoarea preferată', 'masa', 'volumul', 'temperatura', 'O preferință nu poate fi măsurată prin comparare cu o unitate.'],
  [1, 2, 'Instrumentul folosit pentru măsurarea <b>masei</b> este:', 'balanța', 'dinamometrul', 'cilindrul gradat', 'termometrul', 'Dinamometrul măsoară forța (greutatea), nu masa.'],
  [1, 2, 'Cilindrul gradat se folosește pentru a măsura:', 'volumul lichidelor', 'masa lichidelor', 'densitatea', 'presiunea', 'Volumul se citește la baza meniscului.'],
  [1, 2, 'Dacă alegi o unitate de 10 ori mai mică, valoarea numerică a aceleiași mărimi:', 'crește de 10 ori', 'scade de 10 ori', 'rămâne aceeași', 'crește de 100 de ori', 'Unitatea „încape” de mai multe ori în aceeași mărime: 1 m = 10 dm.'],
  [1, 2, 'Pentru a măsura durata unei curse de 100 m se folosește:', 'cronometrul', 'ceasul cu cuc', 'clepsidra', 'metronomul', 'Cronometrul măsoară intervale de timp, de obicei cu precizie de 0,01 s.'],
  [1, 3, 'Intervalul de timp Δt = t₂ − t₁ între momentele t₁ = 8 h 45 min și t₂ = 10 h 10 min este:', '85 min', '125 min', '1 h 65 min', '55 min', '10 h 10 min − 8 h 45 min = 1 h 25 min = 85 min.'],
  [1, 3, 'Scrierea „m = 3 kg” arată că masa corpului este:', 'de 3 ori mai mare decât unitatea kilogram', 'de 3 ori mai mică decât 1 kg', '3 grame', 'egală cu greutatea de 3 N', 'Valoarea numerică arată de câte ori se cuprinde unitatea în mărime.'],

  [1, 3, 'Un elev măsoară lungimea băncii: 1,2 m. Dacă ar folosi ca unitate <b>palma</b> (≈ 20 cm), ar obține:', 'aproximativ 6 palme', 'aproximativ 0,6 palme', 'aproximativ 24 de palme', 'tot 1,2', '1,2 m : 0,2 m = 6 — valoarea numerică depinde de unitatea aleasă.'],
  [1, 3, 'De ce s-au introdus unități de măsură <b>standard</b> (SI)?', 'ca rezultatele să fie aceleași și comparabile oriunde', 'pentru că unitățile vechi erau prea mici', 'ca măsurătorile să nu mai aibă erori', 'pentru a elimina calculele', 'Cot, palmă, pas diferă de la om la om; etaloanele comune fac rezultatele comparabile.'],
  [1, 3, 'Un tren pleacă la 22:40 și ajunge a doua zi la 06:15. Durata călătoriei este:', '7 h 35 min', '8 h 25 min', '16 h 25 min', '7 h 25 min', 'Până la 24:00 sunt 1 h 20 min, plus 6 h 15 min = 7 h 35 min.'],

  // ---------- 2. Sistemul Internațional ----------
  [2, 1, 'Câte mărimi fizice <b>fundamentale</b> are SI?', '7', '5', '3', '10', 'Lungime, masă, timp, curent, temperatură, cantitate de substanță, intensitate luminoasă.'],
  [2, 1, 'Unitatea de măsură a lungimii în SI este:', 'metrul', 'centimetrul', 'kilometrul', 'pasul', '[ℓ]SI = m.'],
  [2, 1, 'Unitatea de măsură a masei în SI este:', 'kilogramul', 'gramul', 'newtonul', 'tona', 'Kilogramul este singura unitate fundamentală care conține un prefix.'],
  [2, 1, 'Unitatea de măsură a timpului în SI este:', 'secunda', 'minutul', 'ora', 'ziua', '[t]SI = s.'],
  [2, 1, 'Care este mărime <b>fundamentală</b> în SI?', 'intensitatea curentului electric', 'viteza', 'forța', 'densitatea', 'Amperul (A) este unitate fundamentală.'],
  [2, 1, 'Care este mărime <b>derivată</b>?', 'presiunea', 'masa', 'timpul', 'temperatura', 'p = F/S — se definește printr-o formulă.'],
  [2, 2, 'Unitatea SI a <b>temperaturii</b> este:', 'kelvinul (K)', 'gradul Celsius (°C)', 'gradul Fahrenheit (°F)', 'joule-ul (J)', 'T(K) = t(°C) + 273,15.'],
  [2, 2, 'Simbolul corect pentru „5 kilograme” este:', '5 kg', '5 Kg', '5 kg.', '5 kgs', 'Simbolurile nu au majusculă (doar din nume proprii), punct sau plural.'],
  [2, 2, 'Simbolul unității <b>cantitate de substanță</b> este:', 'mol', 'M', 'n', 'kmol', 'Molul este unitate fundamentală SI.'],
  [2, 2, 'Candela (cd) este unitatea pentru:', 'intensitatea luminoasă', 'cantitatea de substanță', 'puterea electrică', 'fluxul de căldură', 'Cea de-a șaptea unitate fundamentală.'],
  [2, 2, 'Temperatura de 27 °C, în kelvin, este:', '300,15 K', '246,15 K', '27 K', '273 K', 'T = t + 273,15.'],
  [2, 3, 'Ce unitate SI are <b>un nume propriu</b> și totuși se scrie cu literă mică în text?', 'newton (simbol N)', 'Newton (simbol n)', 'Kelvin (simbol k)', 'Watt (simbol w)', 'Numele se scrie cu literă mică; simbolul, cu majusculă: newton, N.'],
  [2, 3, 'Diferența de temperatură de 15 °C exprimată în kelvin este:', '15 K', '288,15 K', '258,15 K', '−258,15 K', 'Gradul Celsius și kelvinul au aceeași „mărime”: ΔT = Δt.'],
  [2, 3, 'Din 2019, toate unitățile SI sunt definite prin:', 'valori fixate ale unor constante ale naturii', 'etaloane de platină păstrate la Paris', 'dimensiunile Pământului', 'decizii ale fiecărei țări', 'Ex.: kilogramul — prin constanta lui Planck, metrul — prin viteza luminii.'],
  [2, 3, 'Ce valoare are, prin definiție, viteza luminii în vid?', '299 792 458 m/s', '300 000 km/s exact', '3·10<sup>8</sup> km/s', '299 792 km/h', 'Metrul este definit fixând această valoare exactă.'],

  // ---------- 3. Multipli & Submultipli ----------
  [3, 1, 'Câte grame are 0,35 kg?', '350 g', '35 g', '3500 g', '0,035 g', '1 kg = 1000 g.'],
  [3, 1, '450 mm reprezintă:', '0,45 m', '4,5 m', '45 m', '0,045 m', '1 mm = 10⁻³ m.'],
  [3, 1, '2,5 h înseamnă:', '9000 s', '150 s', '250 s', '2500 s', '2,5 · 3600 s = 9000 s.'],
  [3, 1, '1 km are:', '1000 m', '100 m', '10 000 m', '10 m', 'kilo = 10³.'],
  [3, 1, '3 min reprezintă:', '180 s', '300 s', '30 s', '1800 s', '1 min = 60 s.'],
  [3, 1, '1 L este egal cu:', '1 dm³', '1 cm³', '1 m³', '10 cm³', 'Litrul este volumul unui cub cu latura de 1 dm.'],
  [3, 2, '72 km/h exprimat în m/s este:', '20 m/s', '7,2 m/s', '259,2 m/s', '2 m/s', '72 : 3,6 = 20 m/s.'],
  [3, 2, 'Cât înseamnă 1 L în m³?', P(-3) + ' m³', P(-6) + ' m³', P(3) + ' m³', '1 m³', '1 L = 1 dm³ = 10⁻³ m³.'],
  [3, 2, '1 cm² este egal cu:', P(-4) + ' m²', P(-2) + ' m²', P(-6) + ' m²', P(2) + ' m²', '(10⁻² m)² = 10⁻⁴ m².'],
  [3, 2, '1 ha este egal cu:', '10 000 m²', '1000 m²', '100 m²', '100 000 m²', '1 ha = 1 hm² = (100 m)².'],
  [3, 2, 'Scrierea corectă în notație științifică a lui 0,00042 este:', '4,2·' + P(-4), '42·' + P(-5), '0,42·' + P(-3), '4,2·' + P(4), 'Mantisa trebuie să fie între 1 și 10.'],
  [3, 2, '250 mL de apă reprezintă:', '0,25 L', '2,5 L', '25 L', '0,025 L', '1 mL = 10⁻³ L.'],
  [3, 2, 'Distanța 3,8·10<sup>8</sup> m (Pământ–Lună) înseamnă:', '380 000 km', '38 000 km', '3 800 000 km', '3800 km', '3,8·10⁸ m = 3,8·10⁵ km.'],
  [3, 3, 'Densitatea apei, 1 g/cm³, în SI este:', '1000 kg/m³', '1 kg/m³', '0,001 kg/m³', '100 kg/m³', '1 g/cm³ = 10⁻³ kg / 10⁻⁶ m³ = 10³ kg/m³.'],
  [3, 3, '1 kWh este egal cu:', '3,6·' + P(6) + ' J', '1000 J', '3600 J', '3,6·' + P(3) + ' kJ·h', '1000 W · 3600 s = 3,6·10⁶ J.'],
  [3, 3, '1 mm³ exprimat în m³ este:', P(-9) + ' m³', P(-3) + ' m³', P(-6) + ' m³', P(-12) + ' m³', '(10⁻³ m)³ = 10⁻⁹ m³.'],
  [3, 3, 'Câți µm sunt într-un mm?', '1000', '100', '10', '10 000', 'mm = 10⁻³ m, µm = 10⁻⁶ m → raport 10³.'],
  [3, 3, 'O viteză de 15 m/s, în km/h, este:', '54 km/h', '4,17 km/h', '15 km/h', '150 km/h', '15 · 3,6 = 54 km/h.'],
  [3, 3, '1 an-lumină ≈ 9,46·10<sup>15</sup> m. În km, aceasta înseamnă:', '9,46·' + P(12) + ' km', '9,46·' + P(18) + ' km', '9,46·' + P(15) + ' km', '9,46·' + P(13) + ' km', 'Împarți la 10³: exponentul scade cu 3.'],

  // ---------- 4. Unități derivate ----------
  [4, 1, 'Unitatea SI a vitezei este:', 'm/s', 'km/h', 'm/s²', 'm·s', 'v = d/t → m/s.'],
  [4, 1, 'Unitatea SI a forței este:', 'newtonul (N)', 'kilogramul (kg)', 'joule-ul (J)', 'pascalul (Pa)', 'F = m·a → kg·m/s² = N.'],
  [4, 1, 'Unitatea SI a ariei este:', 'm²', 'm', 'm³', 'ha', 'S = ℓ · L → m · m = m².'],
  [4, 1, 'Densitatea se calculează cu formula:', 'ρ = m / V', 'ρ = V / m', 'ρ = m · V', 'ρ = m · g', 'Masa unității de volum.'],
  [4, 2, 'Joule-ul exprimat prin alte unități SI este:', 'N·m', 'N/m', 'W/s', 'kg·m/s', 'L = F · d → N · m = J.'],
  [4, 2, '1 Pa este egal cu:', '1 N/m²', '1 N·m²', '1 J/s', '1 kg/m³', 'p = F / S.'],
  [4, 2, '1 W este egal cu:', '1 J/s', '1 J·s', '1 N·m', '1 N/s', 'P = L / t.'],
  [4, 2, 'Unitatea SI a accelerației este:', 'm/s²', 'm/s', 'm²/s', 'N/s', 'a = Δv/Δt → (m/s)/s.'],
  [4, 2, 'Hertzul (Hz) exprimat în unități fundamentale este:', 's<sup>−1</sup>', 's', 'm/s', 'rad·s', 'ν = N/t; numărul de oscilații N nu are unitate.'],
  [4, 3, 'Newtonul exprimat în unități fundamentale SI este:', 'kg·m·s<sup>−2</sup>', 'kg·m·s<sup>−1</sup>', 'kg·m²·s<sup>−2</sup>', 'kg·s<sup>−2</sup>', 'F = m·a → kg · m/s².'],
  [4, 3, 'Joule-ul exprimat în unități fundamentale SI este:', 'kg·m²·s<sup>−2</sup>', 'kg·m·s<sup>−2</sup>', 'kg·m²·s<sup>−3</sup>', 'kg·m<sup>−1</sup>·s<sup>−2</sup>', 'J = N·m = kg·m/s²·m.'],
  [4, 3, 'Pascalul exprimat în unități fundamentale SI este:', 'kg·m<sup>−1</sup>·s<sup>−2</sup>', 'kg·m·s<sup>−2</sup>', 'kg·m<sup>−2</sup>·s<sup>−2</sup>', 'kg·m²·s<sup>−2</sup>', 'Pa = N/m² = kg·m·s⁻² / m².'],
  [4, 3, 'Care relație este <b>corectă dimensional</b> (d = distanță, v = viteză, t = timp, a = accelerație)?', 'd = v·t + a·t²/2', 'd = v/t + a·t', 'd = v·t² + a/t', 'd = a·t + v²', 'Fiecare termen trebuie să aibă unitatea m.'],
  [4, 3, 'Ce unitate rezultă din produsul N · m/s?', 'W', 'J', 'Pa', 'N·s', 'N·m = J, iar J/s = W (P = F·v).'],

  // ---------- 5. Scalari & Vectori ----------
  [5, 1, 'Care mărime este <b>vectorială</b>?', 'forța', 'masa', 'temperatura', 'volumul', 'Forța are direcție, sens și punct de aplicație.'],
  [5, 1, 'Care mărime este <b>scalară</b>?', 'energia', 'viteza', 'accelerația', 'deplasarea', 'Energia este complet determinată de valoare și unitate.'],
  [5, 1, 'O mărime scalară este complet determinată de:', 'valoarea numerică și unitatea de măsură', 'direcție și sens', 'doar unitatea de măsură', 'punctul de aplicație', 'Ex.: m = 2 kg, t = 5 s.'],
  [5, 1, 'Care mărime este vectorială?', 'viteza', 'timpul', 'densitatea', 'aria', 'Viteza indică și încotro se mișcă un corp.'],
  [5, 2, 'Pe lângă modul, un vector este caracterizat de:', 'direcție, sens și punct de aplicație', 'doar unitatea de măsură', 'densitate și volum', 'masă și greutate', 'Modulul (mărimea) este una dintre cele patru caracteristici.'],
  [5, 2, 'Greutatea unui corp este:', 'o mărime vectorială, orientată vertical în jos', 'o mărime scalară', 'același lucru cu masa', 'o mărime fără unitate', 'G = m·g, vector vertical, spre centrul Pământului.'],
  [5, 2, 'Două forțe de 3 N și 4 N pe aceeași direcție și în același sens au rezultanta:', '7 N', '1 N', '5 N', '12 N', 'Forțele de același sens se adună.'],
  [5, 3, 'Două forțe de 3 N și 4 N, <b>perpendiculare</b>, au rezultanta:', '5 N', '7 N', '1 N', '12 N', 'R = √(3² + 4²) = 5 N (regula paralelogramului).'],
  [5, 3, 'Două forțe de 6 N și 10 N pe aceeași direcție, dar de <b>sensuri opuse</b>, au rezultanta:', '4 N, în sensul forței de 10 N', '16 N', '4 N, în sensul forței de 6 N', '0 N', 'Se scad, iar rezultanta are sensul forței mai mari.'],
  [5, 3, 'Între ce limite poate fi rezultanta a două forțe de 5 N și 8 N?', 'între 3 N și 13 N', 'între 5 N și 8 N', 'între 0 N și 13 N', 'exact 13 N', '|F₁ − F₂| ≤ R ≤ F₁ + F₂.'],

  [5, 1, 'Ce reprezintă lungimea săgeții care desenează un vector?', 'modulul (valoarea) vectorului', 'direcția', 'sensul', 'punctul de aplicație', 'Săgeata se desenează la scară: lungimea ei arată valoarea.'],
  [5, 2, 'Ce mărime este <b>scalară</b>, deși poate avea și valori negative?', 'temperatura în °C', 'forța', 'viteza', 'deplasarea', 'Semnul minus la −5 °C nu indică un sens în spațiu.'],
  [5, 2, 'La scara 1 cm ↔ 2 N, o forță de 7 N se reprezintă printr-o săgeată de:', '3,5 cm', '14 cm', '7 cm', '9 cm', '7 N : 2 N/cm = 3,5 cm.'],
  [5, 3, 'Un corp se deplasează 3 m spre est, apoi 4 m spre nord. Mărimea deplasării totale este:', '5 m', '7 m', '1 m', '12 m', 'Deplasarea e vector: √(3² + 4²) = 5 m, deși distanța parcursă este 7 m.'],

  // ---------- 6. Măsurare & Erori ----------
  [6, 1, 'Ce instrument măsoară forța?', 'dinamometrul', 'balanța', 'șublerul', 'manometrul', 'Dinamometrul se bazează pe deformarea unui resort.'],
  [6, 1, 'Pentru măsurarea grosimii unei sârme subțiri se folosește:', 'micrometrul', 'rigla', 'ruleta', 'cilindrul gradat', 'Micrometrul are precizie de 0,01 mm.'],
  [6, 1, 'Pentru a reduce erorile întâmplătoare, o mărime se măsoară:', 'de mai multe ori și se face media', 'o singură dată, cu atenție', 'doar cu ochiul liber', 'cu instrumente diferite, fără medie', 'Media mai multor determinări este mai apropiată de valoarea reală.'],
  [6, 1, 'Cea mai mică diviziune a unei rigle școlare este de obicei:', '1 mm', '1 cm', '0,1 mm', '1 dm', 'Rigla are precizia de 1 mm.'],
  [6, 2, 'Eroarea relativă se exprimă:', 'fără unitate (adesea în %)', 'în aceeași unitate ca mărimea', 'în m', 'în unități pătrate', 'ε = Δx/x̄ — raport de mărimi de același fel.'],
  [6, 2, 'Valorile 12,1 cm; 12,3 cm; 12,2 cm au media:', '12,2 cm', '12,3 cm', '36,6 cm', '12,1 cm', 'x̄ = 36,6 / 3 = 12,2 cm.'],
  [6, 2, 'Eroarea de paralaxă apare când:', 'privești scala oblic, nu perpendicular', 'instrumentul este nou', 'măsori de mai multe ori', 'folosești unitatea SI', 'Ochiul trebuie să fie pe perpendiculara pe scală.'],
  [6, 2, 'Precizia unui șubler cu vernier este, de obicei:', '0,1 mm', '1 mm', '1 cm', '0,001 mm', 'Vernierul permite citirea zecimilor de milimetru.'],
  [6, 3, 'Media este 20 cm, iar eroarea absolută medie 0,5 cm. Eroarea relativă este:', '2,5 %', '0,5 %', '25 %', '40 %', 'ε = 0,5 / 20 = 0,025 = 2,5 %.'],
  [6, 3, 'Valorile 4,0 s; 4,2 s; 3,8 s au eroarea absolută medie:', '≈ 0,13 s', '0,2 s', '0,4 s', '0 s', 'Abaterile: 0; 0,2; 0,2 → media 0,4/3 ≈ 0,13 s.'],
  [6, 3, 'Rezultatul unei măsurători se scrie corect:', 'ℓ = (12,2 ± 0,1) cm', 'ℓ = 12,2 cm ± 0,1', 'ℓ = 12,2 ± 0,1', 'ℓ = 12,2 cm (± 1 %) cm', 'Valoarea medie ± eroarea, între paranteze, urmate de unitate.'],
  [6, 3, 'O măsurătoare cu ε = 1 % este, față de una cu ε = 5 %:', 'mai precisă', 'mai puțin precisă', 'la fel de precisă', 'imposibil de comparat', 'Eroarea relativă mai mică înseamnă precizie mai mare.'],
];

// ---------- Întrebări generate ----------
function generated() {
  const qs = [];
  // Unitatea SI a unei mărimi derivate (cap. 4)
  const uniq = [...new Map(DERIVED.map(d => [d.u, d])).values()];
  shuffle(uniq).slice(0, 5).forEach(d => {
    const wrong = shuffle(uniq.filter(x => x.u !== d.u)).slice(0, 3).map(x => esc(x.u));
    const lvl = ['m²', 'm³', 'm/s', 'N'].includes(d.u) ? 1 : 2;
    qs.push([4, lvl, `Unitatea de măsură în SI pentru <b>${esc(d.q.toLowerCase())}</b> (${esc(d.f)}) este:`, esc(d.u), ...wrong, `[${d.q.toLowerCase()}]SI = ${d.u} (${d.un}).`]);
  });
  // Exprimarea în unități fundamentale (cap. 4, greu)
  const exprOf = d => [1, 0, 2, 3, 4, 5, 6].filter(i => d[i]).map(i => BASE[i].s + (d[i] !== 1 ? `<sup>${String(d[i]).replace('-', '−')}</sup>` : '')).join('·');
  shuffle(uniq.filter(d => d.d.filter(Boolean).length > 1)).slice(0, 3).forEach(d => {
    const others = shuffle(uniq.filter(x => x.u !== d.u && x.d.filter(Boolean).length > 1)).slice(0, 3).map(x => exprOf(x.d));
    qs.push([4, 3, `Unitatea <b>${esc(d.u)}</b> (${esc(d.un)}), exprimată în unități fundamentale SI, este:`, exprOf(d.d), ...others, `Pornești de la formula ${d.f}. ${d.hint}`]);
  });
  // Valoarea unui prefix (cap. 3)
  const pf = PREFIXES.filter(p => p.e !== 0);
  shuffle(pf).slice(0, 4).forEach(p => {
    const wrong = shuffle(pf.filter(x => x.e !== p.e)).slice(0, 3);
    const lvl = Math.abs(p.e) <= 3 ? 1 : 2;
    qs.push([3, lvl, `Prefixul <b>${esc(p.n)}</b> (${esc(p.s)}) înseamnă:`, P(p.e), ...wrong.map(w => P(w.e)), `${p.n} = 10^${p.e}.`]);
  });
  // Simbolul unei unități fundamentale (cap. 2)
  shuffle(BASE).slice(0, 2).forEach(b => {
    const wrong = shuffle(BASE.filter(x => x.s !== b.s)).slice(0, 3).map(x => x.s);
    qs.push([2, 1, `Simbolul unității SI pentru <b>${esc(b.q)}</b> este:`, b.s, ...wrong, `${b.q}: ${b.n} (${b.s}).`]);
  });
  // Transformări cu factori din convertor (cap. 3, mediu)
  const pick = ['lungime', 'masa', 'timp', 'volum', 'arie'].map(id => QUANTITIES.find(q => q.id === id));
  shuffle(pick).slice(0, 3).forEach(q => {
    const metric = q.units.filter(u => u.f && Number.isInteger(Math.log10(u.f)) && u.f !== 1);
    const u = shuffle(metric)[0];
    if (!u) return;
    const val = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
    const ans = val * u.f;
    const k = Math.log10(u.f);
    const fake = [ans * 10, ans / 10, ans * 10 ** (k > 0 ? -2 * k : 2 * -k)].map(x => `${fmt(x, { mode: 'auto', sig: 6 })} ${q.si}`);
    qs.push([3, 2, `${val} ${esc(u.u)} exprimat în ${q.si} este:`, `${fmt(ans, { mode: 'auto', sig: 6 })} ${q.si}`, ...fake, `1 ${u.u} = 10${supText(k)} ${q.si}, deci ${val} ${u.u} = ${val}·10${supText(k)} ${q.si}.`]);
  });
  return qs;
}

/** Toate întrebările disponibile, fiecare ca obiect. */
export function bank() {
  return [...STATIC, ...generated()].map(([ch, lvl, q, right, ...rest]) => {
    const ex = rest.pop();
    return { ch, lvl, q, right, wrong: rest, ex };
  });
}
