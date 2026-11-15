import {labNamespaces} from '../../shared/lab-locales.js';
import {pairs, t, math, title, subtitle, tabs, theory, problems, questions} from './content.js';
import {scatter} from './model.js';
import {drawCollision, drawSpectrum} from './view.js';

const $ = selector => document.querySelector(selector);
const range = (id, ro, en, min, max, value, unit) => `
  <div class="compton-range">
    <label for="${id}">${t(ro, en)}</label>
    <output id="${id}-value" for="${id}">${value} ${unit}</output>
    <div class="compton-stepper praxis-range-stepper">
      <button type="button" data-adjust="${id}:-1" aria-label="${t('Scade: '+ro, 'Decrease: '+en)}">−</button>
      <input id="${id}" type="range" min="${min}" max="${max}" value="${value}">
      <button type="button" data-adjust="${id}:1" aria-label="${t('Crește: '+ro, 'Increase: '+en)}">+</button>
    </div>
  </div>`;
const metrics = [
  ['incident', 'λ₀', 'pm', 'wavelength'], ['scattered', 'λ′', 'pm', 'scatteredWavelength'],
  ['shift', 'Δλ', 'pm', 'shift'], ['energy', 'E′', 'keV', 'scatteredEnergy']
];
const playLabel = t('Pornește', 'Play');
const pauseLabel = t('Pauză', 'Pause');
const detectorLabel = t('Traiectorii schematice ale fotonului și electronului', 'Schematic photon and electron trajectories');
const spectrumLabel = t('Pozițiile liniilor λ₀ și λ′ pe axa lungimilor de undă', 'Positions of the λ₀ and λ′ lines on the wavelength axis');
const lab = `
  <div class="compton-workspace">
    <div class="compton-scene">
      <h2 data-content-type="simulation">${t('Împrăștiere pe grafit', 'Scattering from graphite')}</h2>
      <canvas id="collision" role="img" aria-label="${detectorLabel}"></canvas>
      <ul class="compton-legend">
        <li class="incident">${t('Foton incident', 'Incident photon')}</li>
        <li class="scattered">${t('Foton împrăștiat', 'Scattered photon')}</li>
        <li class="recoil">${t('Electron de recul', 'Recoil electron')}</li>
      </ul>
      <h3 data-content-type="diagram">${t('Spectru schematic', 'Schematic spectrum')}</h3>
      <canvas id="spectrum" role="img" aria-label="${spectrumLabel}"></canvas>
      <p class="compton-axis">${t('Lungime de undă (pm)', 'Wavelength (pm)')}</p>
    </div>
    <div class="compton-controls">
      <h2>${t('Sursă și detector', 'Source and detector')}</h2>
      ${range('angle', 'Unghiul fotonului', 'Photon angle', 0, 180, 90, '°')}
      ${range('energy-input', 'Energia incidentă', 'Incident energy', 10, 200, 60, 'keV')}
      <div class="compton-actions" aria-label="${t('Unghiuri de referință', 'Reference angles')}">
        <button type="button" data-angle="0">0°</button><button type="button" data-angle="90">90°</button><button type="button" data-angle="180">180°</button>
      </div>
      <div class="compton-actions">
        <button type="button" id="play" class="primary" aria-pressed="false">${playLabel}</button>
        <button type="button" id="step">${t('Pas', 'Step')}</button>
        <button type="button" id="reset">${t('Resetează', 'Reset')}</button>
      </div>
      <dl class="compton-readings">${metrics.map(([id, label, unit]) => `<div class="${id}"><dt>${label} (${unit})</dt><dd id="read-${id}"></dd></div>`).join('')}</dl>
      <h3 class="compton-recoil-title">${t('Recul nerelativist', 'Nonrelativistic recoil')}</h3>
      <dl class="compton-readings compton-recoil-results">
        <div class="recoil"><dt>${t('Unghiul φ', 'Angle φ')}</dt><dd id="read-recoil-angle"></dd></div>
        <div class="recoil"><dt>${t('Energia cinetică', 'Kinetic energy')} ${math(t('E_c', 'K'))} (keV)</dt><dd id="read-recoil"></dd></div>
      </dl>

    </div>
  </div>
      <details><summary>${t('Investighează dependența de unghi', 'Investigate the effect of angle')}</summary>
        <p>${t('Compară 0°, 90° și 180°. La 90°, dublează energia de la 60 la 120 keV și urmărește separat Δλ și energia cinetică de recul.', 'Compare 0°, 90°, and 180°. At 90°, double the incident energy from 60 to 120 keV and look at Δλ and recoil kinetic energy separately.')}</p>
        <p>${t('Pasul ondulațiilor urmărește lungimea de undă. Traiectoriile, viteza animației și înălțimile liniilor spectrale sunt schematice.', 'Wave spacing follows wavelength. Paths, animation speeds and spectral line heights are schematic.')}</p>
        <a href="#theory">${t('De ce apare deplasarea?', 'Why does the shift occur?')}</a>
      </details>`;

const practice = `<h2 data-content-type="problem">${t('Calculează și verifică', 'Calculate and check')}</h2>
  <div class="compton-exercises">${problems.map(({prompt, solution}, i) => `<form class="compton-exercise" data-problem="${i}">
    <label for="answer-${i}">${prompt}</label>
    <div class="compton-actions"><input id="answer-${i}" inputmode="decimal" autocomplete="off" aria-describedby="result-${i}">
    <button>${t('Verifică', 'Check')}</button></div>
    <p id="result-${i}" role="status"></p>
    <details><summary>${t('Rezolvare', 'Solution')}</summary><p>${solution}</p></details>
    </form>`).join('')}</div><p><a href="#lab">${t('Verifică modelul în laborator', 'Check the model in the lab')}</a></p>`;
const quiz = `<h2 data-content-type="assessment">${t('Verifică ce ai înțeles', 'Check your understanding')}</h2>
  <form id="quiz-form">
    <div class="compton-exercises">${questions.map(([prompt, options], i) => `<fieldset class="compton-exercise">
      <legend>${prompt}</legend>
      ${options.map((option, j) => `<label class="compton-option"><input type="radio" name="q${i}" value="${j}"><span>${option}</span></label>`).join('')}
      <p id="feedback-${i}"></p>
    </fieldset>`).join('')}</div>
    <div class="compton-actions"><button class="primary">${t('Trimite răspunsurile', 'Submit answers')}</button>
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
const panels = {lab, theory, problems: practice, quiz};

$('#praxis-original').insertAdjacentHTML('beforeend', `
  <div class="tabs" role="tablist" aria-label="${sectionLabel}">${tabs.map(([id, label], i) =>
    `<button type="button" class="tab" role="tab" id="tab-${id}" data-tab="${id}" aria-controls="${id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${label}</button>`).join('')}</div>
  ${tabs.map(([id], i) => `<section tabindex="0" id="${id}" role="tabpanel" aria-labelledby="tab-${id}" ${i ? 'hidden' : ''}>${panels[id]}</section>`).join('')}
  <a class="compton-download" data-offline-download href="efectul-compton.zip" download>${offline}</a>`);

const namespace = 'labs/efectul-compton/ui';
await PraxisI18n.init({
  baseUrl: '../../locales/', namespaceList: labNamespaces['efectul-compton'],
  embedded: {
    ro: {[namespace]: {messages: Object.fromEntries(pairs.map(([ro]) => [ro, ro]))}},
    en: {[namespace]: {messages: Object.fromEntries(pairs)}}
  }
});
const tr = text => PraxisI18n.tr(text);
const format = (value, digits = 0) => value.toLocaleString(PraxisI18n.locale, {maximumFractionDigits: digits});

const angle = $('#angle'), energy = $('#energy-input'), collision = $('#collision'), spectrum = $('#spectrum');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const play = $('#play');
let active = 'lab', phase = 0, frame = null, previous = null, playing = false, visible = false, graded = false;
let result;
const practiceResults = new Map();

function draw() {
  if (active === 'lab') drawCollision(collision, result, phase);
}
function render() {
  result = scatter(Number(energy.value), Number(angle.value));
  $('#angle-value').value = angle.value + '°';
  $('#energy-input-value').value = energy.value + ' keV';
  for (const [id, , , key] of metrics) $('#read-' + id).textContent = format(result[key], 3);
  $('#read-recoil').textContent = format(result.recoilNR, 3);
  $('#read-recoil-angle').textContent = result.recoilAngle === null ? '—' : format(result.recoilAngle * 180 / Math.PI, 1) + '°';
  play.textContent = tr(playing ? pauseLabel : playLabel);
  play.setAttribute('aria-pressed', String(playing));
  play.disabled = motion.matches;
  if (active === 'lab') {
    draw();
    drawSpectrum(spectrum, result, format);
  }
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
    if (!document.hidden && active === 'lab' && visible) PraxisSound.play('event');
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
for (const link of document.querySelectorAll('.compton a[href^="#"]')) link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const id = link.hash.slice(1);
  showTab(id);
  $('#' + id).focus();
});
for (const input of [angle, energy]) input.addEventListener('input', render);
for (const button of document.querySelectorAll('[data-adjust]')) button.addEventListener('click', () => {
  const [id, step] = button.dataset.adjust.split(':');
  const input = $('#' + id);
  if (step === '1') input.stepUp();
  else input.stepDown();
  render();
});
for (const button of document.querySelectorAll('[data-angle]')) button.addEventListener('click', () => {
  angle.value = button.dataset.angle;
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
  energy.value = energy.defaultValue;
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
  const i = Number(form.dataset.problem), {answer, tolerance} = problems[i];
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
resizer.observe(collision);
resizer.observe(spectrum);
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (!visible) cancelFrame();
  schedule();
}).observe(collision);
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
  document.querySelector('[data-related]').parentElement.hidden = true;
}
render();
PraxisI18n.apply(document);
showHash();
const integration = document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course = 'efectul-compton';
integration.dataset.title = title;
integration.dataset.subtitle = subtitle;
integration.onload = () => {
  PraxisLabWorkspace.mount();
  PraxisI18n.apply(document);
  showTab(active);
};
document.body.append(integration);
