const pairs = [];
function message(ro, en) {
  pairs.push([ro, en]);
  return ro;
}

export const title = message('Unde seismice', 'Seismic waves');
export const subtitle = message('Urmărește undele de la ruperea faliei până la seismograf.', 'Follow the waves from fault rupture to seismograph.');

[
  ['Secțiunea lecției', 'Lesson section'],
  ['Stație seismică', 'Seismic station'],
  ['Tipuri de unde', 'Wave types'],
  ['Scări seismice', 'Earthquake scales'],
  ['Cutremure reale', 'Real earthquakes'],
  ['Verificare și surse', 'Self-check and sources'],
  ['De la focar la stație', 'From the focus to the station'],
  ['Secțiune prin scoarță, cu focar, epicentru, stație și fronturi de undă', 'Crust cross-section with a focus, epicentre, station and wavefronts'],
  ['Seismogramă sintetică', 'Synthetic seismogram'],
  ['Semnal seismic normalizat în funcție de timpul de la rupere', 'Normalised seismic signal against time since rupture'],
  ['Controlează experimentul', 'Control the experiment'],
  ['Pornește seismul', 'Start earthquake'],
  ['Distanță epicentrală', 'Epicentral distance'],
  ['Adâncimea focarului', 'Focal depth'],
  ['Ritmul redării', 'Playback speed'],
  ['Suprafață', 'Surface'],
  ['Sunetul din antet activează tonuri sintetice la sosiri.', 'Turn on sound in the header to hear synthetic arrival tones.'],
  ['Cum estimezi distanța din decalajul S–P?', 'How do you estimate distance from the S–P delay?'],
  ['Modelul folosește un mediu omogen și raze drepte. Vitezele alese sunt 6,0 km/s pentru P și 3,5 km/s pentru S. Pentru suprafață, modelul adaugă timpul parcurs de P până la epicentru și apoi deplasarea la 2,9 km/s de-a lungul suprafeței.', 'The model uses a homogeneous medium and straight rays. It uses 6.0 km/s for P and 3.5 km/s for S. The surface arrival includes the P travel time to the epicentre followed by travel at 2.9 km/s along the surface.'],
  ['Din t = d/v obții Δt = d(1/vₛ − 1/vₚ). Aici d este distanța focar–stație. La Δt = 10 s, d ≈ 84 km. Dacă focarul e la 40 km adâncime, distanța epicentrală este ≈ 74 km.', 'From t = d/v you obtain Δt = d(1/vₛ − 1/vₚ). Here d is the focus-to-station distance. For Δt = 10 s, d ≈ 84 km. If the focus is 40 km deep, the epicentral distance is ≈ 74 km.'],
  ['O stație estimează distanța. Datele mai multor stații ajută la localizarea focarului și la estimarea timpului de origine. Amplitudinile și tonurile din laborator sunt ilustrative.', 'One station estimates the distance. Data from multiple stations help locate the focus and estimate the origin time. The amplitudes and tones in this lab are illustrative.'],
  ['Mișcarea particulelor', 'Particle motion'],
  ['Grilă de particule cu un punct urmărit și direcția de propagare', 'Grid of particles with a tracked point and direction of propagation'],
  ['Alege tipul de undă', 'Choose a wave type'],
  ['P · compresie', 'P · compression'],
  ['S · forfecare', 'S · shear'],
  ['Love · suprafață', 'Love · surface'],
  ['Rayleigh · suprafață', 'Rayleigh · surface'],
  ['Animează', 'Animate'],
  ['Mișcare amplificată. Punctul auriu urmărește aceeași particulă.', 'Motion is exaggerated. The gold dot tracks the same particle.'],
  ['Pauză', 'Pause'],
  ['Continuă', 'Resume'],
  ['Repetă seismul', 'Replay earthquake'],
  ['Ajustează distanța și adâncimea, apoi pornește seismul.', 'Adjust the distance and depth, then start the earthquake.'],
  ['Ruperea a început. Stația așteaptă prima undă.', 'Rupture has begun. The station is waiting for the first wave.'],
  ['Unda P a ajuns la stație.', 'The P wave has reached the station.'],
  ['Unda S a ajuns la stație.', 'The S wave has reached the station.'],
  ['Undele de suprafață au ajuns la stație.', 'Surface waves have reached the station.'],
  ['Înregistrarea s-a încheiat.', 'The recording is complete.'],
  ['Epicentru', 'Epicentre'],
  ['Focar', 'Focus'],
  ['Stație', 'Station'],
  ['Timp de la rupere (s)', 'Time since rupture (s)'],
  ['Propagare', 'Propagation'],
  ['Vedere de sus', 'Top view'],
  ['Secțiune verticală', 'Vertical section'],
  ['Corect.', 'Correct.'],
  ['Mai încearcă.', 'Try again.']
].forEach(([ro, en]) => message(ro, en));

export const waveDescriptions = {
  p: message('Undă internă longitudinală. Particulele oscilează paralel cu direcția de propagare, formând compresii și dilatări. Undele P traversează solide și fluide și ajung primele.', 'A longitudinal body wave. Particles oscillate parallel to propagation, producing compression and expansion. P waves travel through solids and fluids and arrive first.'),
  s: message('Undă internă transversală. Particulele oscilează perpendicular pe propagare. Undele S pot avea polarizare verticală sau orizontală și nu se propagă prin lichide.', 'A transverse body wave. Particles oscillate perpendicular to propagation. S waves can be vertically or horizontally polarised and do not travel through liquids.'),
  love: message('Undă de suprafață cu forfecare orizontală, perpendiculară pe propagare. În vederea de sus, punctele se mișcă lateral. La adâncime, mișcarea se atenuează.', 'A surface wave with horizontal shear perpendicular to propagation. In the top view, dots move sideways. Motion weakens with depth.'),
  rayleigh: message('Undă de suprafață cu mișcare eliptică în plan vertical. Elipsa este adesea parcursă retrograd la suprafață. Amplitudinea scade cu adâncimea.', 'A surface wave with elliptical motion in a vertical plane. Near the surface, the motion is often retrograde. Amplitude decreases with depth.')
};

const card = (title, body, type = 'theory') =>
  `<article class="seismic-card"><h2 data-content-type="${type}">${title}</h2><p>${body}</p></article>`;

export const definitions = [
  card(message('Cum ia naștere un seism?', 'How does an earthquake begin?'),
    message('Rocile deformate acumulează energie elastică. Când o falie alunecă brusc, o parte din energie se propagă sub formă de unde seismice. Seismologia studiază sursele, propagarea și înregistrarea acestor unde. Exploziile pot genera și ele unde seismice.', 'Deformed rock stores elastic energy. When a fault slips suddenly, some of that energy travels as seismic waves. Seismology studies the sources, propagation and recording of these waves. Explosions can also generate seismic waves.')),
  card(message('Focar, epicentru și seismogramă', 'Focus, epicentre and seismogram'),
    message('Focarul (hipocentrul) este locul din interior unde începe ruperea. Epicentrul este punctul de la suprafață aflat vertical deasupra lui. Seismometrul detectează mișcarea solului, iar înregistrarea în timp se numește seismogramă.', 'The focus (hypocentre) is the point below ground where rupture begins. The epicentre lies directly above it on the surface. A seismometer detects ground motion and the record over time is called a seismogram.')),
  card(message('Ce aflăm despre interiorul Pământului?', 'What can we learn about Earth’s interior?'),
    message('Fronturile se pot reflecta și refracta când se schimbă proprietățile rocilor. Undele P sunt deviate la intrarea în nucleul extern, iar undele S directe nu îl traversează. Tiparul sosirilor indică existența unui nucleu extern lichid.', 'Wavefronts can reflect and refract where rock properties change. P waves bend as they enter the outer core, and direct S waves cannot cross it. Arrival patterns reveal a liquid outer core.'))
].join('');

export const scales = [
  card(message('Richter (Mₗ) și magnitudinea moment (Mw)', 'Richter (Mₗ) and moment magnitude (Mw)'),
    message('Richter este o scară logaritmică a magnitudinii locale. O creștere de o unitate corespunde unei amplitudini de referință de 10 ori mai mari, după corecția pentru distanță. Magnitudinea moment Mw se bazează pe momentul seismic, proporțional cu rigiditatea rocii, aria rupturii și alunecarea medie. Mw descrie bine și seismele foarte mari.', 'Richter is a logarithmic local magnitude scale. An increase of one unit corresponds to a tenfold increase in reference amplitude after correcting for distance. Moment magnitude Mw is based on seismic moment, proportional to rock rigidity, rupture area and average slip. Mw also characterises very large earthquakes well.')),
  card(message('Mercalli modificată (MMI)', 'Modified Mercalli (MMI)'),
    message('Scară de intensitate cu 12 grade, de la I la XII. Gradul descrie mișcarea într-un loc, estimată din percepția oamenilor și efectele asupra obiectelor, clădirilor și terenului. Același seism produce intensități diferite, în funcție de distanță, adâncime, sol și construcții.', 'A 12-degree intensity scale from I to XII. The degree describes shaking at a site, estimated from human observations and effects on objects, buildings and terrain. One earthquake produces different intensities depending on distance, depth, soil and structures.')),
  card(message('MSK-64 (Medvedev–Sponheuer–Kárník)', 'MSK-64 (Medvedev–Sponheuer–Kárník)'),
    message('Scară macroseismică istorică cu gradele I–XII, folosită și în studiile despre Vrancea. Clasifică efectele locale și ține cont de tipul clădirii și de severitatea avariilor. În Europa, revizuirea ei a dus la EMS-98. Gradele MSK și MMI au criterii proprii.', 'A historical macroseismic scale from I to XII, also used in studies of Vrancea earthquakes. It classifies local effects and accounts for building type and damage severity. Its European revision led to EMS-98. MSK and MMI degrees have their own criteria.')),
].join('') + `<article class="seismic-card seismic-compare">
  <h2 data-content-type="formula">${message('Ce înseamnă o diferență de magnitudine?', 'What does a magnitude difference mean?')}</h2>
  <p id="magnitude-example" data-no-i18n></p>
  <div class="seismic-parameter">
    <label for="delta-m">${message('Diferență de magnitudine ΔM', 'Magnitude difference ΔM')} <output id="delta-value" for="delta-m"></output></label>
    <input type="range" id="delta-m" min="0" max="3" value="1" step="0.1">
  </div>
  <dl class="seismic-arrivals">
    <div><dt>${message('Raportul amplitudinilor corectate (Mₗ)', 'Corrected amplitude ratio (Mₗ)')}</dt><dd id="amp-ratio"></dd></div>
    <div><dt>${message('Raportul estimat al energiilor radiate', 'Estimated radiated energy ratio')}</dt><dd id="energy-ratio"></dd></div>
  </dl>
  <p>${message('Primul raport rezultă din definiția Richter, după corecția pentru distanță. Al doilea folosește o relație empirică și poate diferi pentru seisme reale. Mișcarea solului într-un loc depinde și de adâncime, distanță și teren.', 'The first ratio follows from the Richter definition after correcting for distance. The second uses an empirical relationship and can differ for real earthquakes. Ground motion at a site also depends on depth, distance and local ground conditions.')}</p>
</article>`;

export const sources = {
  waves: ['https://www.usgs.gov/programs/earthquake-hazards/what-are-effects-earthquakes', message('USGS · Unde și efecte seismice', 'USGS · Seismic waves and earthquake effects')],
  magnitude: ['https://www.usgs.gov/programs/earthquake-hazards/earthquake-magnitude-energy-release-and-shaking-intensity', message('USGS · Magnitudine, energie și intensitate', 'USGS · Magnitude, energy and intensity')],
  msk: ['https://www.gfz.de/en/section/seismic-hazard-and-risk-dynamics/data-products-services/ems-98-european-macroseismic-scale/', message('GFZ · De la MSK-64 la EMS-98', 'GFZ · From MSK-64 to EMS-98')],
  romplus: ['https://phenomenal.infp.ro/documente/D1.1%20Raport.pdf', message('INCDFP · Catalogul ROMPLUS', 'INCDFP · ROMPLUS catalogue')],
  vrancea: ['https://phenomenal.infp.ro/documente/D1.2%20Raport.pdf', message('INCDFP · Intensități observate în Vrancea', 'INCDFP · Observed Vrancea intensities')],
  chile: ['https://pubs.usgs.gov/circ/c1187/', message('USGS · Cutremurul și tsunamiul din Chile', 'USGS · Chile earthquake and tsunami')],
  valdivia: ['https://earthquake.usgs.gov/earthquakes/eventpage/official19600522191120_30', message('USGS · Fișa seismului Valdivia', 'USGS · Valdivia earthquake record')],
  tohoku: ['https://earthquake.usgs.gov/earthquakes/eventpage/official20110311054624120_30', message('USGS · Cutremurul Tōhoku', 'USGS · Tōhoku earthquake')]
};

export const events = [
  ['Vrancea', '1940-11-10T01:39:07Z', 7.7, 150, [45.80, 26.70], 'romplus',
    message('Cutremur vrâncean de adâncime intermediară. Catalogul ROMPLUS estimează magnitudinea moment la 7,7, cea mai mare dintre seismele vrâncene din secolul XX.', 'An intermediate-depth Vrancea earthquake. The ROMPLUS catalogue estimates a moment magnitude of 7.7, the highest among twentieth-century Vrancea earthquakes.')],
  ['Vrancea', '1977-03-04T19:21:54Z', 7.4, 94, [45.77, 26.76], 'romplus',
    message('Seismul a provocat distrugeri grave, inclusiv în București. Raportul INCDFP indică o intensitate maximă observată IX–X pe scara MSK.', 'The earthquake caused severe damage, including in Bucharest. The INCDFP report gives a maximum observed intensity of IX–X on the MSK scale.')],
  ['Vrancea', '1986-08-30T21:28:37Z', 7.1, 131, [45.52, 26.49], 'romplus',
    message('S-a produs mai adânc decât evenimentul din 1977. Raportul INCDFP indică intensitatea maximă IX MSK. Cele două evenimente permit compararea magnitudinii cu efectele observate.', 'It occurred deeper than the 1977 event. The INCDFP report gives a maximum intensity of IX MSK. The two events allow a comparison of magnitude and observed effects.')],
  ['Valdivia', '1960-05-22T19:11:20Z', 9.5, 25, [-38.143, -73.407], 'valdivia',
    message('Cel mai mare cutremur înregistrat instrumental. Deplasarea fundului oceanic a generat un tsunami care a traversat Pacificul și a ajuns în Hawaii și Japonia.', 'The largest earthquake on instrumental record. Seafloor displacement generated a tsunami that crossed the Pacific and reached Hawaii and Japan.')],
  ['Tōhoku', '2011-03-11T05:46:24Z', 9.1, 29, [38.297, 142.373], 'tohoku',
    message('Rupere de subducție în largul coastei insulei Honshū. Tsunamiul rezultat a afectat sever coasta Japoniei. Tsunamiul este o undă a apei produsă prin deplasarea acesteia.', 'A subduction rupture offshore from Honshū. The resulting tsunami severely affected the Japanese coast. A tsunami is a wave in water generated by displacement of the water.')]
];

export const questions = [
  [message('Care undă ajunge prima în modelul stației?', 'Which wave arrives first in the station model?'),
    ['S', 'P', 'Rayleigh'], 1, message('Unda P are viteza cea mai mare în model.', 'The P wave has the highest speed in the model.')],
  [message('Ce se întâmplă cu decalajul S–P când stația se îndepărtează, la aceeași adâncime a focarului?', 'What happens to the S–P delay as the station moves farther away at the same focal depth?'),
    [message('Crește', 'It increases'), message('Scade', 'It decreases'), message('Rămâne constant', 'It stays the same')], 0,
    message('Unda S acumulează o întârziere mai mare pe un traseu mai lung.', 'The S wave builds up a greater delay along a longer path.')],
  [message('Două orașe au observat grade MMI diferite pentru același seism. Ce a variat?', 'Two cities observed different MMI degrees for the same earthquake. What changed?'),
    [message('Magnitudinea moment', 'Moment magnitude'), message('Timpul de origine', 'Origin time'), message('Intensitatea locală', 'Local intensity')], 2,
    message('Gradul MMI reflectă efectele locale ale mișcării.', 'The MMI degree reflects the local effects of shaking.')],
  [message('Ce mișcare a particulelor este caracteristică undei Rayleigh?', 'Which particle motion is characteristic of a Rayleigh wave?'),
    [message('Eliptică în plan vertical', 'Elliptical in a vertical plane'), message('Forfecare orizontală', 'Horizontal shear'), message('Compresie longitudinală', 'Longitudinal compression')], 0,
    message('Mișcarea combină o deplasare orizontală și una verticală.', 'The motion combines horizontal and vertical displacement.')]
];

export const labels = {
  sources: message('Surse și date', 'Sources and data'),
  quiz: message('Verifică ce ai observat', 'Check what you observed'),
  select: message('Alege cutremurul', 'Choose an earthquake'),
  magnitudeExample: message('Exemplu ipotetic: Mₗ {lower} și Mₗ {higher}. Rapoartele compară al doilea eveniment cu primul.', 'Hypothetical example: Mₗ {lower} and Mₗ {higher}. The ratios compare the second event with the first.'),
  depth: message('Adâncimea hipocentrului', 'Hypocentral depth'),
  compare: message('Magnitudini moment raportate', 'Reported moment magnitudes'),
  epicentre: message('Epicentru (latitudine, longitudine)', 'Epicentre (latitude, longitude)'),
  west: message('V', 'W'),
  origin: message('Momentul de origine (UTC)', 'Origin time (UTC)'),
  magnitude: message('Magnitudine moment', 'Moment magnitude')
};

export {pairs};
