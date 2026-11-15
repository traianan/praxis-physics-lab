export const pairs = [];
export function t(ro, en) { pairs.push([ro, en]); return ro; }
export const title = t('Dualismul undă–corpuscul', 'Wave–particle duality');
export const subtitle = t('De la foton la difracția electronilor', 'From photons to electron diffraction');
export const tabs = [
  ['lab', t('Laborator', 'Laboratory')],
  ['theory', t('Teorie', 'Theory')],
  ['microscope', t('Microscopul electronic', 'Electron microscope')],
  ['problems', t('Probleme', 'Problems')],
  ['quiz', t('Verificare', 'Self-check')]
];
const eq = source => `<p class="duality-equation"><span data-science-math="tex" data-science-source="${source}">${source}</span></p>`;
export const theory = `
  <div class="duality-reading">
    <article>
      <h2 data-content-type="theory">${t('Lumina și fotonii', 'Light and photons')}</h2>
      <p>${t('Interferența, difracția și polarizarea evidențiază caracterul ondulatoriu al luminii. Efectul fotoelectric și efectul Compton arată că lumina schimbă energie și impuls cu materia prin interacțiuni discrete.', 'Interference, diffraction and polarization reveal the wave properties of light. The photoelectric effect and Compton scattering show that light transfers energy and momentum to matter in discrete interactions.')}</p>
      <p>${t('Fotonul are sarcină electrică și masă de repaus nule. Constanta lui Planck leagă frecvența și lungimea de undă de energia și impulsul fotonului.', 'The photon has zero electric charge and zero rest mass. Planck’s constant relates its frequency and wavelength to its energy and momentum.')}</p>
      ${eq(String.raw`E=h\nu,\qquad p=\frac{h}{\lambda},\qquad h=ET=p\lambda`)}
      <p>${t('Perioada T este inversul frecvenței. Produsul dintre energie și perioadă are aceeași unitate ca produsul dintre impuls și lungimea de undă.', 'The period T is the reciprocal of frequency. Energy times period has the same unit as momentum times wavelength.')}</p>
      <p data-related><a href="../efectul-fotoelectric-extern/index.html">${t('Efectul fotoelectric extern', 'The external photoelectric effect')}</a> · <a href="../efectul-compton/index.html">${t('Efectul Compton', 'The Compton effect')}</a></p>
      <h2 data-content-type="theory">${t('Ipoteza de Broglie', 'The de Broglie hypothesis')}</h2>
      <p>${t('Unei particule cu impuls de modul p îi asociem o lungime de undă de Broglie. Pentru un electron accelerat din repaus prin tensiunea U, în regim nerelativist, energia cinetică este eU.', 'A particle with momentum magnitude p has a de Broglie wavelength. For an electron accelerated from rest through voltage U in the nonrelativistic regime, the kinetic energy is eU.')}</p>
      ${eq(String.raw`\lambda_{\mathrm{dB}}=\frac hp=\frac{h}{\sqrt{2m_e eU}}`)}
      <p>${t('Când tensiunea crește de patru ori, lungimea de undă se înjumătățește. Pentru obiecte macroscopice, lungimea de undă este de obicei mult prea mică pentru observarea difracției.', 'Quadrupling the voltage halves the wavelength. For macroscopic objects, the wavelength is usually far too small for diffraction to be observable.')}</p>
      <p>${t('Un detector înregistrează electronii prin evenimente individuale. Distribuția acumulată în multe asemenea evenimente poate prezenta maxime și minime de interferență. Cele două observații fac parte din aceeași descriere cuantică.', 'A detector registers electrons as individual events. The distribution accumulated from many such events can exhibit interference maxima and minima. Both observations are part of the same quantum description.')}</p>
    </article>
    <article>
      <h2 data-content-type="experiment">${t('Experimentul Davisson–Germer', 'The Davisson–Germer experiment')}</h2>
      <p>${t('Un tun electronic trimite electroni accelerați spre un monocristal de nichel. Un colector mobil măsoară curentul datorat electronilor împrăștiați. Maximele apar în direcții compatibile cu interferența constructivă.', 'An electron gun aims accelerated electrons at a nickel single crystal. A movable collector measures the current from scattered electrons. The maxima occur in directions consistent with constructive interference.')}</p>
      ${eq(String.raw`2d\sin\theta_B=n\lambda_{\mathrm{dB}}`)}
      <p data-no-science-math>${t('Unghiul Bragg θᴮ se măsoară față de planele cristaline. În schema simetrică, unghiul detectorului φ se măsoară între direcția spre sursă și cea spre detector. Astfel, φ = 180° − 2θᴮ.', 'The Bragg angle θᴮ is measured relative to the crystal planes. In the symmetric diagram, detector angle φ lies between the directions to the source and the detector. Thus φ = 180° − 2θᴮ.')}</p>
      <p>${t('La 54 V rezultă aproximativ 167 pm din relația de Broglie. Din maximul observat în jurul direcției de 50°, modelul Bragg cu d ≈ 91 pm dă aproximativ 165 pm. Măsurarea și calculul indică aceeași scară.', 'At 54 V, the de Broglie equation gives about 167 pm. From the observed maximum near 50°, the Bragg model with d ≈ 91 pm gives about 165 pm. The measurement and calculation agree in scale.')}</p>
      <p><a href="#lab">${t('Explorează maximul de difracție', 'Explore the diffraction maximum')}</a></p>
      <h2 data-content-type="theory">${t('Microscopul electronic', 'The electron microscope')}</h2>
      <p>${t('Câmpuri electrice și magnetice focalizează fasciculul. Într-un microscop electronic cu transmisie, electronii traversează un preparat subțire, iar un detector înregistrează imaginea. Lungimile de undă mici permit rezoluții mai bune decât cele ale microscopiei optice convenționale, iar rezoluția efectivă depinde și de lentile și de probă.', 'Electric and magnetic fields focus the beam. In a transmission electron microscope, the electrons pass through a thin specimen and a detector records the image. Short wavelengths allow finer resolution than conventional optical microscopy, and actual resolution also depends on the lenses and specimen.')}</p>
      <p><a href="#microscope">${t('Explorează coloana și focalizarea', 'Explore the column and focusing')}</a></p>
    </article>
  </div>`;
export const problems = [
  [t('Un foton are λ = 600 nm. Calculează energia lui în eV.', 'A photon has λ = 600 nm. Find its energy in eV.'), 2.066, .015,
    t('E = hc/λ ≈ (1240 eV·nm)/(600 nm) ≈ 2,07 eV.', 'E = hc/λ ≈ (1240 eV·nm)/(600 nm) ≈ 2.07 eV.')],
  [t('Un electron este accelerat prin 54 V. Calculează lungimea sa de undă în pm.', 'An electron is accelerated through 54 V. Find its wavelength in pm.'), 166.9, 1,
    t('În limita nerelativistă, λ ≈ 1226 pm/√54 ≈ 167 pm.', 'In the nonrelativistic limit, λ ≈ 1226 pm/√54 ≈ 167 pm.')],
  [t('La primul maxim, d = 91 pm și θᴮ = 65°. Calculează λ în pm.', 'At the first maximum, d = 91 pm and θᴮ = 65°. Find λ in pm.'), 164.95, 1,
    t('Pentru n = 1, λ = 2d sin θᴮ ≈ 165 pm.', 'For n = 1, λ = 2d sin θᴮ ≈ 165 pm.')]
];
export const questions = [
  [t('Ce evidențiază difracția electronilor?', 'What does electron diffraction reveal?'),
    [t('Caracterul ondulatoriu', 'Wave behaviour'), t('Masa de repaus nulă', 'Zero rest mass'), t('Sarcina pozitivă', 'Positive charge')], 0,
    t('Maximele sunt compatibile cu interferența undelor asociate electronilor.', 'The maxima are consistent with interference of the waves associated with electrons.')],
  [t('Ce se întâmplă cu λ când tensiunea crește de patru ori?', 'What happens to λ when the voltage is quadrupled?'),
    [t('Se dublează', 'It doubles'), t('Se înjumătățește', 'It halves'), t('Rămâne constantă', 'It stays constant')], 1,
    t('Lungimea de undă este invers proporțională cu rădăcina tensiunii.', 'The wavelength is inversely proportional to the square root of the voltage.')],
  [t('Care este relația dintre impuls și lungimea de undă?', 'How are momentum and wavelength related?'),
    ['λ = hp', 'λ = p/h', 'λ = h/p'], 2, t('Impulsul mai mare corespunde unei lungimi de undă mai mici.', 'Greater momentum corresponds to a shorter wavelength.')],
  [t('Ce măsoară colectorul în experiment?', 'What does the collector measure in the experiment?'),
    [t('Curentul datorat electronilor împrăștiați', 'The current from scattered electrons'), t('Temperatura cristalului', 'The crystal temperature'), t('Frecvența luminii vizibile', 'The frequency of visible light')], 0,
    t('Curentul variază cu unghiul detectorului și cu energia electronilor.', 'The current varies with detector angle and electron energy.')]
];
