// Authored content, shared by the Web and standalone importer.
export const messages = {};
const t = (ro,en) => (messages[ro]=en,ro);
const p = (ro,en) => `<p data-science-math="prose">${t(ro,en)}</p>`;
const detail = (ro,en,body) => `<details><summary>${t(ro,en)}</summary>${body}</details>`;
export const extension = `
<section id="masurare" data-mcu-section="masurare" hidden>
 <h2 data-content-type="simulation">${t('Măsoară zece rotații','Measure ten revolutions')}</h2>
 <div class="mcu-experiment">
  <div>
   <svg id="rotation-scene" viewBox="0 0 360 300" role="img" aria-label="${t('Două puncte ale aceluiași disc în rotație','Two points on the same rotating disc')}">
    <circle cx="180" cy="150" r="110" fill="none" stroke="var(--praxis-science-blue,#487ca2)" stroke-width="2"/>
    <circle cx="180" cy="150" r="55" fill="none" stroke="var(--praxis-science-orange,#b28b3b)" stroke-dasharray="5 5"/>
    <path d="M180 150 H300" stroke="currentColor" stroke-dasharray="3 4"/>
    <g id="rotation-arm"><path d="M180 150 H290" stroke="currentColor"/><circle cx="290" cy="150" r="9" fill="var(--praxis-science-blue,#487ca2)"/><circle cx="235" cy="150" r="7" fill="var(--praxis-science-orange,#b28b3b)"/></g>
    <text x="160" y="172">O</text><text x="300" y="143">0</text>
   </svg>
   <p>${t('Albastru: R. Portocaliu: R/2. Aceeași perioadă, dar viteza punctului albastru este dublă. Desen schematic, ajustat la spațiul disponibil.','Blue: R. Orange: R/2. Same period, but the blue point has twice the speed. Schematic drawing, fitted to the available space.')}</p>
  </div>
  <div class="mcu-measure-controls">
   <label for="measure-radius">${t('Raza discului R','Disc radius R')} <output id="measure-radius-value"></output></label>
   <input id="measure-radius" type="range" min="0.1" max="2" step="0.1" value="0.5">
   <label for="measure-frequency">${t('Frecvența ν','Frequency ν')} <output id="measure-frequency-value"></output></label>
   <input id="measure-frequency" type="range" min="0.2" max="1" step="0.1" value="0.5">
   <div class="mcu-measure-actions"><button id="measure-play" class="button primary" data-no-i18n></button><button id="measure-reset" class="button secondary">${t('Resetează proba','Reset trial')}</button></div>
   <output id="measure-readout" data-no-i18n></output>
   <p id="measure-status" role="status" data-no-i18n></p>
   <p>${t('Un ton discret marchează fiecare rotație dacă activezi Sunet în antet. Timpul afișat este timpul simulării, la scară 1:1.','A soft tone marks each revolution when Sound is enabled in the header. The display shows simulation time, at a 1:1 scale.')}</p>
  </div>
 </div>
 <details><summary>${t('Rezultate și protocol experimental','Results and experimental protocol')}</summary>
 ${p('Pornește din dreptul reperului 0. Cronometrează zece rotații; repetă de trei ori. În simulare, fiecare probă se salvează automat. Modificarea unui parametru începe o probă nouă; tabelul păstrează ultimele trei probe.','Start at marker 0. Time ten revolutions and repeat three times. The simulation saves each trial automatically. Changing a parameter starts a new trial; the table keeps the latest three trials.')}
 <div class="mcu-table-wrap"><table><thead><tr><th>R (m)</th><th>N</th><th>t (s)</th><th>T (s)</th><th>ν (Hz)</th><th>ω (rad/s)</th><th>v (m/s)</th></tr></thead><tbody id="measure-results" data-no-i18n></tbody></table></div>
 <p data-science-math="prose">T = t/N; ν = N/t; ω = 2πν; v = ωR.</p>
 ${p('În clasă, urmărește un semn pe un disc rotit lent. Măsurarea mai multor rotații reduce influența timpului de reacție. Compară probe cu aceeași rază și frecvență; rezultatele identice ale modelului ideal nu reprezintă precizia unui experiment real.','In class, track a mark on a slowly rotating disc. Timing several revolutions reduces the effect of reaction time. Compare trials at the same radius and frequency; identical ideal-model results do not represent real measurement accuracy.')}
 </details>
</section>
<section id="cotidian" data-mcu-section="cotidian" hidden>
 <h2 data-content-type="theory">${t('Mișcarea circulară în jurul nostru','Circular motion around us')}</h2>
 <div class="mcu-life-grid">
 ${detail('Roata bicicletei','Bicycle wheel',p('Față de axul roții, un punct de pe jantă descrie un cerc. La R = 0,35 m și 120 rot/min, ν = 2 Hz, iar v ≈ 4,40 m/s. Față de șosea, punctul de pe jantă descrie o cicloidă când roata rulează fără alunecare, nu un cerc.','Relative to the axle, a rim point follows a circle. At R = 0.35 m and 120 rpm, ν = 2 Hz and v ≈ 4.40 m/s. Relative to the road, the rim point follows a cycloid when the wheel rolls without slipping, rather than a circle.'))}
 ${detail('Ventilatorul și discul rigid','Fan and rigid disc',p('Toate punctele discului au aceeași viteză unghiulară. Dacă distanța față de ax se dublează, v și accelerația centripetă se dublează, la aceeași ω. De aceea vârful paletei se deplasează mai repede decât un punct apropiat de ax.','All points on a disc share the same angular velocity. Doubling the distance from the axis doubles speed and centripetal acceleration at fixed ω. The blade tip therefore moves faster than a point near the axis.'))}
 ${detail('Automobilul în viraj','A car turning',p('Chiar dacă vitezometrul indică o valoare constantă, direcția vitezei se schimbă. La 54 km/h pe un viraj cu R = 50 m, v = 15 m/s și a = v²/R = 4,5 m/s². Pe drum orizontal, frecarea statică poate asigura rezultanta spre centru.','Even at a constant speedometer reading, velocity changes direction. At 54 km/h on a bend of R = 50 m, v = 15 m/s and a = v²/R = 4.5 m/s². On a level road, static friction can provide the inward resultant force.'))}
 ${detail('Ceasul și radianul','Clock and radian',p('Vârful secundarului are perioada 60 s și viteza unghiulară π/30 rad/s. O rotație înseamnă 2π rad = 360°. Un radian subîntinde un arc egal cu raza: s = Rθ, cu θ în radiani. Unghiul semnat crește în sens trigonometric și scade în sens orar.','The second-hand tip has a period of 60 s and angular speed π/30 rad/s. One revolution is 2π rad = 360°. One radian subtends an arc equal to the radius: s = Rθ, with θ in radians. The signed angle increases counterclockwise and decreases clockwise.'))}
 </div>
 ${p('Legea unghiului: θ(t) = θ₀ + ω(t − t₀). Pentru un unghi semnat, și ω este semnată; modulul vitezei este v = R|ω|. Turația n în rot/min se transformă prin ν = n/60.','Angular position: θ(t) = θ₀ + ω(t − t₀). With a signed angle, ω is also signed; speed is v = R|ω|. Convert n in rpm using ν = n/60.')}
</section>
<section id="probleme-aplicate" data-mcu-section="probleme-aplicate" hidden>
 <h2 data-content-type="problem">${t('Aplică relațiile, pas cu pas','Apply the relations, step by step')}</h2>
 ${detail('3. Două viteze, o singură pistă','3. Two speeds, one track',
 p('Doi cicliști pleacă simultan din același punct, în același sens, cu 54 km/h și 36 km/h. Câte ture face primul până la prima ajungere din urmă?','Two cyclists start together from the same point in the same direction at 54 km/h and 36 km/h. How many laps does the faster cyclist complete before first lapping the other?')+
 p('1. Convertim: v₁ = 15 m/s, v₂ = 10 m/s. Viteza relativă este 5 m/s.','1. Convert: v₁ = 15 m/s, v₂ = 10 m/s. Relative speed is 5 m/s.')+
 p('2. Notăm lungimea pistei cu L. Primul recuperează exact o tură: (v₁ − v₂)t = L.','2. Let L be the track length. The faster rider gains exactly one lap: (v₁ − v₂)t = L.')+
 p('3. Numărul de ture este N₁ = v₁t/L = v₁/(v₁ − v₂) = 3. Al doilea face 2 ture. Raza pistei nu este necesară.','3. The lap count is N₁ = v₁t/L = v₁/(v₁ − v₂) = 3. The other rider completes 2 laps. The track radius is not needed.'))}
 ${detail('4. De la turație la accelerație','4. From rpm to acceleration',
 p('O roată cu R = 0,35 m efectuează 120 rot/min. Determină perioada, viteza și accelerația unui punct de pe jantă față de ax.','A wheel of R = 0.35 m turns at 120 rpm. Find the period, speed and acceleration of a rim point relative to the axle.')+
 p('1. ν = 120/60 = 2 Hz; T = 1/ν = 0,5 s.','1. ν = 120/60 = 2 Hz; T = 1/ν = 0.5 s.')+
 p('2. ω = 2πν = 4π rad/s; v = ωR = 1,4π ≈ 4,40 m/s.','2. ω = 2πν = 4π rad/s; v = ωR = 1.4π ≈ 4.40 m/s.')+
 p('3. a = ω²R = 5,6π² ≈ 55,27 m/s², orientată spre ax. Valoarea vitezei rămâne constantă.','3. a = ω²R = 5.6π² ≈ 55.27 m/s², directed towards the axle. Speed stays constant.'))}
 ${detail('5. Dacă perioada se dublează?','5. What if the period doubles?',
 p('Un mobil are R = 2 m și T = 4 s. Apoi perioada devine 8 s, pe același cerc.','A particle has R = 2 m and T = 4 s. Its period then becomes 8 s on the same circle.')+
 p('Inițial: ν = 0,25 Hz; ω = π/2 rad/s; v = π m/s; a = π²/2 ≈ 4,93 m/s².','Initially: ν = 0.25 Hz; ω = π/2 rad/s; v = π m/s; a = π²/2 ≈ 4.93 m/s².')+
 p('După schimbare: ν = 0,125 Hz; ω = π/4 rad/s; v = π/2 m/s; a = π²/8 ≈ 1,23 m/s². Frecvența și viteza se înjumătățesc, accelerația devine un sfert.','After the change: ν = 0.125 Hz; ω = π/4 rad/s; v = π/2 m/s; a = π²/8 ≈ 1.23 m/s². Frequency and speed halve; acceleration becomes one quarter.'))}
</section>`;
for (const pair of [['Măsurători','Measurements'],['În viața reală','In real life'],['Începe proba','Start trial'],['Continuă','Continue'],['Pauză','Pause'],['Probă încheiată','Trial complete'],['Probă încheiată. Rezultatul este în tabel.','Trial complete. The result is in the table.'],['Alege parametrii, apoi pornește.','Choose the parameters, then start.'],['Numără trecerile prin reperul 0.','Count crossings of marker 0.']]) t(...pair);
