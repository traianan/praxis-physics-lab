import {labNamespaces} from '../../shared/lab-locales.js';
import {pairs, t, title, subtitle, tabs, theory, problems, questions} from './content.js';
import {diffraction, photon, relativeSignal} from './model.js';
import {drawBench} from './view.js';
import {microscopePanel, mountMicroscope} from './microscope.js';

const $ = selector => document.querySelector(selector);
const range = (id, ro, en, min, max, value, unit) => `
  <div class="duality-range">
    <label for="${id}">${t(ro, en)}</label>
    <output id="${id}-value" for="${id}">${value} ${unit}</output>
    <div class="duality-stepper praxis-range-stepper">
      <button type="button" data-adjust="${id}:-1" aria-label="${t('Scade: '+ro, 'Decrease: '+en)}">−</button>
      <input id="${id}" type="range" min="${min}" max="${max}" value="${value}">
      <button type="button" data-adjust="${id}:1" aria-label="${t('Crește: '+ro, 'Increase: '+en)}">+</button>
    </div>
  </div>`;
const playLabel = t('Pornește', 'Play');
const pauseLabel = t('Pauză', 'Pause');
const none = t('Niciun maxim în model', 'No peak in the model');
const lab = `
  <div class="duality-workspace">
    <div class="duality-scene">
      <h2 data-content-type="simulation">${t('Davisson–Germer', 'Davisson–Germer')}</h2>
      <canvas id="bench" role="img" aria-label="${t('Tun electronic, detector mobil și graficul semnalului relativ', 'Electron gun, movable detector and relative signal plot')}"></canvas>
      <ul class="duality-legend">
        <li class="incident">${t('Fascicul incident', 'Incident beam')}</li>
        <li class="scattered">${t('Detector mobil', 'Movable detector')}</li>
        <li class="recoil">${t('Cristal de nichel', 'Nickel crystal')}</li>
      </ul>
      <p>${t('Graficul arată semnalul relativ în funcție de unghiul detectorului. Curba și deplasarea marcatorului sunt schematice.', 'The plot shows relative signal against detector angle. The curve and marker motion are schematic.')}</p>
    </div>
    <div class="duality-controls">
      <h2>${t('Tun electronic și detector', 'Electron gun and detector')}</h2>
      ${range('voltage', 'Tensiunea de accelerare', 'Accelerating voltage', 25, 250, 54, 'V')}
      ${range('angle', 'Unghiul detectorului φ', 'Detector angle φ', 0, 180, 50, '°')}
      <div class="duality-actions">
        <button type="button" id="peak">${t('Alege primul maxim', 'Find first peak')}</button>
        <button type="button" id="play" class="primary" aria-pressed="false">${playLabel}</button>
        <button type="button" id="step">${t('Pas', 'Step')}</button>
        <button type="button" id="reset">${t('Resetează', 'Reset')}</button>
      </div>
      <dl class="duality-readings">
        <div class="incident"><dt>λ<sub>dB</sub> (pm)</dt><dd id="wavelength"></dd></div>
        <div class="scattered"><dt>${t('Primul maxim', 'First peak')} φ</dt><dd id="max-angle"></dd></div>
        <div class="recoil"><dt>${t('Semnal relativ', 'Relative signal')}</dt><dd id="signal"></dd></div>
      </dl>
    </div>
  </div>
  <details>
    <summary>${t('Investighează maximele', 'Explore the peaks')}</summary>
    <p>${t('La 54 V, deplasează detectorul în jurul unghiului de 50°. Dublează și apoi mărește la 216 V tensiunea pentru a vedea cum se mută maximul. Diagrama folosește d = 91 pm și modelează pozițiile Bragg, cu înălțimi și lățimi ale vârfurilor alese ilustrativ.', 'At 54 V, move the detector near 50°. Double the voltage and then raise it to 216 V to see how the peak moves. The diagram uses d = 91 pm and models Bragg peak positions, with illustrative peak heights and widths.')}</p>
    <a href="#theory">${t('Vezi relația lui Bragg', 'See Bragg’s equation')}</a>
  </details>`;
const photonPanel = `
  <div class="duality-controls">
    <h2 data-content-type="experiment">${t('Calculator pentru fotoni', 'Photon calculator')}</h2>
    ${range('photon-wave', 'Lungimea de undă', 'Wavelength', 380, 780, 600, 'nm')}
    <dl class="duality-readings">
      <div class="incident"><dt>ν (THz)</dt><dd id="frequency"></dd></div>
      <div class="scattered"><dt>E (eV)</dt><dd id="photon-energy"></dd></div>
      <div class="recoil"><dt>p (10<sup>−27</sup> kg·m/s)</dt><dd id="photon-momentum"></dd></div>
    </dl>
  </div>`;

const practice = `<h2 data-content-type="problem">${t('Calculează și verifică', 'Calculate and check')}</h2>
  <div class="duality-exercises">${problems.map(([prompt, , , solution], i) => `<form class="duality-exercise" data-problem="${i}">
    <label for="answer-${i}">${prompt}</label>
    <div class="duality-actions"><input id="answer-${i}" inputmode="decimal" autocomplete="off" aria-describedby="result-${i}">
    <button>${t('Verifică', 'Check')}</button></div>
    <p id="result-${i}" role="status"></p>
    <details><summary>${t('Rezolvare', 'Solution')}</summary><p>${solution}</p></details>
    </form>`).join('')}</div><p><a href="#lab">${t('Verifică modelul în laborator', 'Check the model in the lab')}</a></p>`;
const quiz = `<h2 data-content-type="assessment">${t('Verifică ce ai înțeles', 'Check your understanding')}</h2>
  <form id="quiz-form">
    <div class="duality-exercises">${questions.map(([prompt, options], i) => `<fieldset class="duality-exercise">
      <legend>${prompt}</legend>
      ${options.map((option, j) => `<label class="duality-option"><input type="radio" name="q${i}" value="${j}"><span>${option}</span></label>`).join('')}
      <p id="feedback-${i}"></p>
    </fieldset>`).join('')}</div>
    <div class="duality-actions"><button class="primary">${t('Trimite răspunsurile', 'Submit answers')}</button>
    <button type="reset">${t('Reia testul', 'Retry quiz')}</button></div>
    <p id="score" role="status"></p>
  </form>`;
const correct = t('Corect.', 'Correct.');
const wrong = t('Mai încearcă.', 'Try again.');
const unanswered = t('Fără răspuns.', 'Unanswered.');
const invalid = t('Introdu un număr.', 'Enter a number.');
const score = t('Scor', 'Score');
const offline = t('Descarcă lecția (ZIP)', 'Download lesson (ZIP)');
const sectionLabel = t('Secțiunea lecției', 'Lesson section');
const panels = {lab, theory: theory + photonPanel, microscope: microscopePanel(range), problems: practice, quiz};

$('#praxis-original').insertAdjacentHTML('beforeend', `
  <div class="tabs" role="tablist" aria-label="${sectionLabel}">${tabs.map(([id, label], i) =>
    `<button type="button" class="tab" role="tab" id="tab-${id}" data-tab="${id}" aria-controls="${id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${label}</button>`).join('')}</div>
  ${tabs.map(([id], i) => `<section tabindex="0" id="${id}" role="tabpanel" aria-labelledby="tab-${id}" ${i ? 'hidden' : ''}>${panels[id]}</section>`).join('')}
  <a class="duality-download" data-offline-download href="dualismul-unda-corpuscul.zip" download>${offline}</a>`);

const namespace = 'labs/dualismul-unda-corpuscul/ui';
await PraxisI18n.init({
  baseUrl: '../../locales/', namespaceList: labNamespaces['dualismul-unda-corpuscul'],
  embedded: {
    ro: {[namespace]: {messages: Object.fromEntries(pairs.map(([ro]) => [ro, ro]))}},
    en: {[namespace]: {messages: Object.fromEntries(pairs)}}
  }
});
const tr = text => PraxisI18n.tr(text);
const format = (value, digits = 0) => value.toLocaleString(PraxisI18n.locale, {maximumFractionDigits: digits});
const renderMicroscope = mountMicroscope($('#microscope'), tr, format);

const angle = $('#angle'), voltage = $('#voltage'), photonWave = $('#photon-wave'), bench = $('#bench');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const play = $('#play');
let active = 'lab', phase = 0, frame = null, previous = null, playing = false, visible = false, graded = false;
let result;
const practiceResults = new Map();

function draw() {
  if (active === 'lab') drawBench(bench, Number(angle.value), result.maxima, phase);
}
function render() {
  result = diffraction(Number(voltage.value));
  const peak = result.maxima[0];
  $('#voltage-value').value = voltage.value + ' V';
  $('#angle-value').value = angle.value + '°';
  $('#photon-wave-value').value = photonWave.value + ' nm';
  $('#wavelength').textContent = format(result.wavelength, 2);
  $('#max-angle').textContent = peak ? format(peak.detectorAngle, 1) + '°' : tr(none);
  $('#peak').disabled = !peak;
  $('#signal').textContent = format(relativeSignal(Number(angle.value), result.maxima) * 100, 1) + '%';
  const light = photon(Number(photonWave.value));
  $('#frequency').textContent = format(light.frequency / 1e12, 2);
  $('#photon-energy').textContent = format(light.energyEv, 3);
  $('#photon-momentum').textContent = format(light.momentum * 1e27, 3);
  play.textContent = tr(playing ? pauseLabel : playLabel);
  play.setAttribute('aria-pressed', String(playing));
  play.disabled = motion.matches;
  draw();
  renderMicroscope();
}

function cancelFrame() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = previous = null;
}
function schedule() {
  if (frame === null && playing && !motion.matches && !document.hidden && active === 'lab' && visible) {
    frame = requestAnimationFrame(tick);
  }
}
function advance(delta) {
  phase += delta;
  if (phase >= 1) {
    phase %= 1;
    if (!document.hidden && active === 'lab' && visible && relativeSignal(Number(angle.value), result.maxima) > .7) PraxisSound.play('event');
  }
  draw();
}
function tick(now) {
  frame = null;
  if (previous !== null) advance(Math.min(now - previous, 60) / 2200);
  previous = now;
  schedule();
}

function showTab(id) {
  if (!tabs.some(([key]) => key === id)) return;
  cancelFrame();
  active = id;
  for (const [key] of tabs) {
    const selected = id === key, tab = $('#tab-' + key);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $('#' + key).hidden = !selected;
  }
  const picker = $('.praxis-course-sections');
  if (picker) picker.value = id;
  render();
  schedule();
}

for (const [id] of tabs) {
  const tab = $('#tab-' + id);
  tab.addEventListener('click', () => showTab(id));
  tab.addEventListener('keydown', event => {
    const index = tabs.findIndex(([key]) => key === id), last = tabs.length - 1;
    const next = ({Home: 0, End: last, ArrowLeft: index ? index - 1 : last, ArrowRight: index === last ? 0 : index + 1})[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const nextId = tabs[next][0];
    showTab(nextId);
    $('#tab-' + nextId).focus();
  });
}
const showHash = () => {
  const id = location.hash.slice(1);
  if (panels[id] && tabs.some(([key]) => id === key)) {
    showTab(id);
    $('#' + id).focus();
  }
};
window.addEventListener('hashchange', showHash);
for (const link of document.querySelectorAll('.duality a[href^="#"]')) link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const id = link.hash.slice(1);
  showTab(id);
  $('#' + id).focus();
});
for (const input of [angle, voltage, photonWave]) input.addEventListener('input', render);
for (const button of document.querySelectorAll('[data-adjust]')) button.addEventListener('click', () => {
  const [id, step] = button.dataset.adjust.split(':');
  const input = $('#' + id);
  if (step === '1') input.stepUp();
  else input.stepDown();
  render();
});
$('#peak').addEventListener('click', () => {
  angle.value = Math.round(result.maxima[0].detectorAngle);
  render();
});
play.addEventListener('click', () => {
  playing = !playing;
  cancelFrame();
  render();
  schedule();
});
$('#step').addEventListener('click', () => {
  playing = false;
  cancelFrame();
  advance(.25);
  render();
});
$('#reset').addEventListener('click', () => {
  playing = false;
  phase = 0;
  angle.value = angle.defaultValue;
  voltage.value = voltage.defaultValue;
  cancelFrame();
  render();
});
motion.addEventListener('change', () => {
  if (motion.matches) {
    playing = false;
    cancelFrame();
  }
  render();
});
for (const form of document.querySelectorAll('[data-problem]')) form.addEventListener('submit', event => {
  event.preventDefault();
  const i = Number(form.dataset.problem), [, answer, tolerance] = problems[i];
  const value = $('#answer-' + i).value.trim().replace(',', '.');
  const input = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? Number(value) : NaN;
  const verdict = !Number.isFinite(input) ? invalid : Math.abs(input - answer) <= tolerance ? correct : wrong;
  practiceResults.set(i, verdict);
  $('#result-' + i).textContent = tr(verdict);
});
function grade() {
  let points = 0;
  questions.forEach(([, , answer, explanation], i) => {
    const marked = $(`input[name=q${i}]:checked`);
    const valid = marked && Number(marked.value) === answer;
    if (valid) points++;
    $('#feedback-' + i).textContent = tr(!marked ? unanswered : valid ? correct : wrong) + ' ' + tr(explanation);
  });
  $('#score').textContent = tr(score) + ' ' + points + ' / ' + questions.length;
}
$('#quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  graded = true;
  grade();
});
$('#quiz-form').addEventListener('reset', () => {
  graded = false;
  questions.forEach((_, i) => $('#feedback-' + i).textContent = '');
  $('#score').textContent = '';
});

const resizer = new ResizeObserver(render);
resizer.observe(bench);
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (!visible) cancelFrame();
  schedule();
}).observe(bench);
document.addEventListener('visibilitychange', () => { cancelFrame(); schedule(); });
window.addEventListener('pagehide', cancelFrame);
window.addEventListener('pageshow', schedule);
window.addEventListener('praxis-course-presentation-change', render);
window.addEventListener('praxis-language-change', () => {
  render();
  if (graded) grade();
  for (const [i, verdict] of practiceResults) $('#result-' + i).textContent = tr(verdict);
});

if (document.documentElement.dataset.praxisStandalone === 'true') {
  document.querySelector('[data-related]').hidden = true;
}
render();
PraxisI18n.apply(document);
showHash();
const integration = document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course = 'dualismul-unda-corpuscul';
integration.dataset.title = title;
integration.dataset.subtitle = subtitle;
integration.onload = () => {
  PraxisLabWorkspace.mount();
  PraxisI18n.apply(document);
  showTab(active);
};
document.body.append(integration);
