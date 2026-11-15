const pairs = [];
export {pairs};
export function t(ro, en) {
  pairs.push([ro, en]);
  return ro;
}
export const title = t('Efectul Compton', 'The Compton effect');
export const subtitle = t('Cum schimbă o ciocnire energia și lungimea de undă a unui foton?', 'How does a collision change a photon’s energy and wavelength?');
export const tabs = [
  ['lab', t('Laborator', 'Laboratory')],
  ['theory', t('Teorie', 'Theory')],
  ['problems', t('Probleme', 'Problems')],
  ['quiz', t('Verificare', 'Self-check')]
];
export const math = source => `<span data-science-math="tex" data-science-source="${source}">${source}</span>`;
const kineticEnergy = math(t('E_c', 'K'));
export const theory = `
  <div class="compton-reading">
    <article>
      <h2 data-content-type="theory">${t('Ce vede detectorul?', 'What does the detector see?')}</h2>
      <p>${t('Un fascicul îngust de raze X cade pe grafit. La unghiuri diferite, spectrul poate avea o linie la lungimea de undă inițială și o componentă deplasată spre lungimi de undă mai mari. Componenta deplasată apare când fotonul cedează energie și impuls unui electron.', 'A narrow X-ray beam strikes graphite. At different angles, the spectrum can contain a line at the incident wavelength and a component shifted to longer wavelengths. The shifted component appears when a photon transfers energy and momentum to an electron.')}</p>
      <p>${t('Pentru calcul, considerăm un electron liber, inițial în repaus. Aproximația este utilă când energia de legătură este mică față de energia transferată. Linia nedeplasată provine din împrăștierea coerentă pe atomi, care preiau reculul cu o variație de energie foarte mică.', 'The calculation assumes a free electron initially at rest. This approximation is useful when binding energy is small compared with the energy transferred. The unshifted line comes from coherent scattering by atoms, whose recoil costs very little energy.')}</p>
      <a href="#lab">${t('Încearcă unghiurile în laborator', 'Try the angles in the lab')}</a>
      <h2 data-content-type="formula">${t('Legea deplasării Compton', 'The Compton shift equation')}</h2>
      <p class="compton-equation">${math(String.raw`\Delta\lambda = \lambda' - \lambda_0 = \frac{h}{m_e c}(1-\cos\theta)`)}</p>
      <p>${t('Lungimea de undă Compton a electronului este aproximativ 2,426 pm. Deplasarea depinde numai de unghi în acest model: este nulă la 0°, egală cu 2,426 pm la 90° și maximă la 180° (aproximativ 4,853 pm).', 'The electron Compton wavelength is about 2.426 pm. In this model, the shift depends only on angle: zero at 0°, 2.426 pm at 90°, and a maximum of about 4.853 pm at 180°.')}</p>
    </article>
    <article>
      <h2 data-content-type="theory">${t('Cum se deduce relația?', 'How is the equation derived?')}</h2>
      <ol>
        <li>${t('Fotonul are energie E = hc/λ și impuls de modul p = E/c.', 'A photon has energy E = hc/λ and momentum magnitude p = E/c.')}</li>
        <li>${t('Conservarea energiei dă energia cinetică de recul', 'Energy conservation gives the recoil kinetic energy')} ${math(t("E_c = E_0 - E'", "K = E_0 - E'"))}.</li>
        <li>${t('Impulsul electronului este diferența vectorială dintre impulsurile fotonului incident și împrăștiat. Teorema cosinusului dă relația de mai jos.', 'The electron’s momentum is the vector difference between the incident and scattered photon momenta. The cosine rule gives the equation below.')}
          <p class="compton-equation">${math(String.raw`p_e^2c^2=E_0^2+E'^2-2E_0E'\cos\theta`)}</p>
        </li>
        <li>${t('Folosim relația relativistă a electronului cu energia totală', 'Use the relativistic electron relation with total energy')} ${math(t('m_e c^2 + E_c', 'm_e c^2 + K'))}.
          <p class="compton-equation">${math(t('p_e^2c^2 = E_c^2 + 2 E_c m_e c^2', 'p_e^2c^2 = K^2 + 2 K m_e c^2'))}</p>
        </li>
        <li>${t('Egalăm expresiile pentru pₑ²c², înlocuim', 'Equate the expressions for pₑ²c², substitute')} ${kineticEnergy} ${t('și simplificăm.', 'and simplify.')}
          <p class="compton-equation">${math(String.raw`\frac1{E'}-\frac1{E_0}=\frac{1-\cos\theta}{m_e c^2}`)}</p>
          ${t('Înmulțim cu hc și obținem legea deplasării.', 'Multiply by hc to obtain the wavelength shift.')}
        </li>
      </ol>
      <h2 data-content-type="formula">${t('Reculul în aproximația nerelativistă', 'Recoil in the nonrelativistic approximation')}</h2>
      <p>${t('Pentru citirile de recul, rezolvăm separat conservarea energiei și a impulsului cu', 'For the recoil readouts we separately solve energy and momentum conservation with')} ${math(t(String.raw`E_c = \frac{p_e^2}{2m_e}`, String.raw`K = \frac{p_e^2}{2m_e}`))}.</p>
      <p>${t('Unghiul φ se măsoară între direcția incidentă și electronul de recul.', 'Angle φ is measured between the incident direction and the recoil electron.')}
        ${t('La', 'At')} ${math(String.raw`\theta = 0^\circ`)}, ${t('electronul rămâne în repaus, iar φ este nedefinit.', 'the electron remains at rest and φ is undefined.')}</p>
      <p>${t('Aproximația este bună când', 'The approximation is accurate when')} ${kineticEnergy} ${t('este mult mai mică decât 511 keV. Spectrul folosește relația Compton relativistă, așa că diferența E₀ − E′ și citirea nerelativistă pot diferi la energii mari.', 'is much smaller than 511 keV. The spectrum uses the relativistic Compton equation, so E₀ − E′ can differ from the nonrelativistic readout at high energies.')}</p>
      <p>${t('În efectul fotoelectric, fotonul este absorbit. În efectul Compton, un foton iese din ciocnire cu energie mai mică pentru θ > 0.', 'In the photoelectric effect, the photon is absorbed. In Compton scattering at θ > 0, a photon leaves the collision with lower energy.')}</p>
      <p><a data-related href="../efectul-fotoelectric-extern/index.html">${t('Efectul fotoelectric extern', 'The external photoelectric effect')}</a></p>
    </article>
  </div>`;
export const problems = [
  {
    prompt: t('Raze X cu λ₀ = 100 pm se împrăștie la 90°. Calculează λ′ în pm.', 'X-rays with λ₀ = 100 pm scatter through 90°. Calculate λ′ in pm.'),
    answer: 102.4263, tolerance: .02,
    solution: t('La 90°, cos θ = 0. Rezultă Δλ ≈ 2,426 pm, deci λ′ ≈ 102,426 pm.', 'At 90°, cos θ = 0. Thus Δλ ≈ 2.426 pm and λ′ ≈ 102.426 pm.')
  },
  {
    prompt: t('Un foton de 100 keV este retroîmprăștiat. Calculează energia cinetică de recul în keV.', 'A 100 keV photon is backscattered. Calculate the recoil kinetic energy in keV.'),
    answer: 28.129, tolerance: .05,
    solution: t('La 180°, E′ = 100 / (1 + 200/511) keV ≈ 71,87 keV. Electronul primește aproximativ 28,13 keV.', 'At 180°, E′ = 100 / (1 + 200/511) keV ≈ 71.87 keV. The electron gains about 28.13 keV.')
  },
  {
    prompt: t('Deplasarea este 1,213 pm. Determină unghiul fotonului în grade.', 'The wavelength shift is 1.213 pm. Find the photon angle in degrees.'),
    answer: 60, tolerance: .1,
    solution: t('Raportul Δλ/Λ este aproximativ 0,5. Rezultă cos θ ≈ 0,5, deci θ ≈ 60°.', 'The ratio Δλ/Λ is about 0.5. Therefore cos θ ≈ 0.5 and θ ≈ 60°.')
  }
];
export const questions = [
  [t('La ce unghi este deplasarea maximă?', 'At which angle is the shift greatest?'), ['0°', '90°', '180°'], 2, t('La 180°, factorul 1 − cos θ este 2.', 'At 180°, the factor 1 − cos θ equals 2.')],
  [t('Dublezi energia incidentă, cu detectorul fix. Cum se schimbă Δλ?', 'You double the incident energy at a fixed detector angle. What happens to Δλ?'),
    [t('Se dublează', 'It doubles'), t('Rămâne aceeași', 'It stays the same'), t('Se înjumătățește', 'It halves')], 1,
    t('Deplasarea depinde de unghi și de masa electronului.', 'The shift depends on the angle and the electron mass.')],
  [t('Unde ajunge energia cedată de foton în modelul cu electron liber?', 'Where does the photon’s lost energy go in the free-electron model?'),
    [t('În energia cinetică a electronului', 'Into electron kinetic energy'), t('În masa de repaus a electronului', 'Into electron rest mass'), t('Într-un al doilea foton', 'Into a second photon')], 0,
    t('Energia cinetică de recul este diferența dintre cele două energii ale fotonului.', 'Recoil kinetic energy is the difference between the two photon energies.')],
  [t('Ce presupunem despre electron înainte de ciocnire?', 'What do we assume about the electron before the collision?'),
    [t('Se deplasează cu c', 'It moves at c'), t('Este liber și în repaus', 'It is free and at rest'), t('Are impulsul fotonului', 'It has the photon’s momentum')], 1,
    t('În model, energia inițială a electronului este energia sa de repaus.', 'The model takes its initial energy to be its rest energy.')],
  [t('Pentru un unghi nenul, cum se compară frecvențele?', 'At a nonzero angle, how do the frequencies compare?'),
    ['ν′ > ν₀', 'ν′ = ν₀', 'ν′ < ν₀'], 2,
    t('Fotonul împrăștiat are energie mai mică, iar E = hν.', 'The scattered photon has lower energy, and E = hν.')]
];
