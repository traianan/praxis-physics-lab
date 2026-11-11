import {labNamespaces} from '../../shared/lab-locales.js';
import {arrivals, magnitudeRatios} from './model.js';
import {drawPropagation, drawSeismogram, drawParticles} from './view.js';
import {pairs, title, subtitle, definitions, waveDescriptions, scales, events, sources, questions, labels} from './content.js';

const $ = selector => document.querySelector(selector);
const tr = (message, values) => PraxisI18n.tr(message, values);
const namespace = 'labs/unde-seismice/ui';
await PraxisI18n.init({
  baseUrl: '../../locales/',
  namespaceList: labNamespaces['unde-seismice'],
  embedded: {
    ro: {[namespace]: {messages: Object.fromEntries(pairs.map(([ro]) => [ro, ro]))}},
    en: {[namespace]: {messages: Object.fromEntries(pairs)}}
  }
});

const number = (value, digits = 1) => value.toLocaleString(PraxisI18n.locale, {maximumFractionDigits: digits});
const tabs = [...document.querySelectorAll('[data-tab]')];
const playback = {station: {time: 0, running: false}, waves: {time: 0, running: false}};
const visible = new Map();
const arrivalMessages = {
  p: 'Unda P a ajuns la stație.',
  s: 'Unda S a ajuns la stație.',
  surface: 'Undele de suprafață au ajuns la stație.'
};
const tones = {p: [660, 130], s: [370, 210], surface: [158, 370]};
let active = 'station';
let frame = null;
let previous = null;
let stopTone = null;
let toneTimer = null;
let selectedEvent = 1;
let model;

function write(selector, value) {
  const element = $(selector);
  if (element.textContent !== value) element.textContent = value;
}

function silence() {
  stopTone?.();
  clearTimeout(toneTimer);
  stopTone = null;
}

function playArrival(phase) {
  if (!PraxisSound.enabled) return;
  silence();
  const [frequency, duration] = tones[phase];
  stopTone = PraxisSound.startTone({frequency, gain: 0.045, type: phase === 'surface' ? 'triangle' : 'sine'});
  toneTimer = setTimeout(silence, duration);
}

function updateModel() {
  const distance = Number($('#distance').value);
  const depth = Number($('#depth').value);
  const times = arrivals(distance, depth);
  model = {distance, depth, times, end: Math.ceil((times.surface + 14) / 10) * 10, tr};
  write('#distance-value', number(distance) + ' km');
  write('#depth-value', number(depth) + ' km');
  for (const [phase, time] of Object.entries(times)) write('#arrival-' + phase, number(time) + ' s');
  write('#arrival-delay', number(times.s - times.p) + ' s');
}

function draw() {
  if (active === 'station') {
    const {time, running} = playback.station;
    const observation = {...model, time};
    drawPropagation($('#propagation'), observation);
    drawSeismogram($('#seismogram'), observation);
    const finished = time >= model.end;
    const latest = Object.keys(model.times).findLast(phase => time >= model.times[phase]);
    write('#play', tr(running ? 'Pauză' : finished ? 'Repetă seismul' : time ? 'Continuă' : 'Pornește seismul'));
    const status = finished ? 'Înregistrarea s-a încheiat.' : latest ? arrivalMessages[latest] :
      time || running ? 'Ruperea a început. Stația așteaptă prima undă.' : 'Ajustează distanța și adâncimea, apoi pornește seismul.';
    write('#station-status', tr(status));
  } else if (active === 'waves') {
    const {time, running} = playback.waves;
    const mode = $('#wave-mode').value;
    drawParticles($('#particles'), {time, mode, tr});
    write('#wave-description', tr(waveDescriptions[mode]));
    write('#wave-play', tr(running ? 'Pauză' : time ? 'Continuă' : 'Animează'));
  }
}

function cancelFrame() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  previous = null;
  silence();
}

function schedule() {
  if (frame === null && playback[active]?.running && visible.get(active) && !document.hidden) {
    frame = requestAnimationFrame(tick);
  }
}

function tick(now) {
  frame = null;
  const simulation = playback[active];
  const elapsed = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
  previous = now;
  if (active === 'station') {
    const before = simulation.time;
    simulation.time = Math.min(model.end, before + elapsed * Number($('#speed').value));
    for (const [phase, time] of Object.entries(model.times)) {
      if (before < time && simulation.time >= time) playArrival(phase);
    }
    if (simulation.time >= model.end) simulation.running = false;
  } else {
    simulation.time += elapsed;
  }
  draw();
  schedule();
}

function toggle(section) {
  const simulation = playback[section];
  if (section === 'station' && simulation.time >= model.end) simulation.time = 0;
  simulation.running = !simulation.running;
  cancelFrame();
  draw();
  schedule();
}

function reset(section) {
  Object.assign(playback[section], {time: 0, running: false});
  cancelFrame();
  draw();
}

function selectTab(tab) {
  active = tab.dataset.tab;
  for (const button of tabs) {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
  }
  const sectionPicker = $('.praxis-course-sections');
  if (sectionPicker) sectionPicker.value = active;
  cancelFrame();
  draw();
  schedule();
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const next = {ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    selectTab(tabs[next]);
  });
}

function renderRatios() {
  const difference = Number($('#delta-m').value);
  const {amplitude, energy} = magnitudeRatios(difference);
  write('#magnitude-example', tr(labels.magnitudeExample, {lower: number(3), higher: number(3 + difference)}));
  write('#delta-value', number(difference));
  write('#amp-ratio', '×' + number(amplitude));
  write('#energy-ratio', '×' + number(energy));
}

const sourceLink = ([url, label]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const eventLabel = ([name, date]) => `${name} ${date.slice(0, 4)}`;
function showEvent(index) {
  selectedEvent = index;
  const [name, date, magnitude, depth, [latitude, longitude], source, description] = events[index];
  const origin = new Date(date);
  const readableDate = new Intl.DateTimeFormat(PraxisI18n.locale, {dateStyle: 'long', timeZone: 'UTC'}).format(origin);
  const readableTime = origin.toISOString().slice(11, 19);
  const lat = number(Math.abs(latitude), 3) + '° ' + (latitude < 0 ? 'S' : 'N');
  const lon = number(Math.abs(longitude), 3) + '° ' + (longitude < 0 ? tr(labels.west) : 'E');
  $('#event-detail').innerHTML = `<h2>${name} ${date.slice(0, 4)}</h2>
    <dl class="seismic-arrivals seismic-event-parameters">
      <div><dt>${labels.epicentre}</dt><dd>${lat} · ${lon}</dd></div>
      <div><dt>${labels.depth}</dt><dd>${number(depth)} km</dd></div>
      <div><dt>${labels.origin}</dt><dd><time datetime="${date}">${readableDate} · ${readableTime}</time></dd></div>
      <div><dt>${labels.magnitude}</dt><dd>Mw ${number(magnitude)}</dd></div>
    </dl>
    <p>${description}</p><p>${sourceLink(sources[source])}</p>`;
  PraxisI18n.apply($('#event-detail'));
  for (const [eventIndex, event] of events.entries()) {
    const button = $('#event-' + eventIndex);
    button.setAttribute('aria-pressed', String(eventIndex === index));
    button.querySelector('output').textContent = number(event[2]);
  }
}

function feedback() {
  questions.forEach(([, , answer, explanation], index) => {
    const selected = $(`input[name="check-${index}"]:checked`);
    if (selected) write('#feedback-' + index, tr(Number(selected.value) === answer ? 'Corect.' : 'Mai încearcă.') + ' ' + tr(explanation));
  });
}

$('#definitions').innerHTML = definitions;
$('#scales').innerHTML = scales;
$('#events').innerHTML = `<div class="seismic-workspace event-workspace">
  <div class="seismic-card" id="event-detail" aria-live="polite"></div>
  <div class="seismic-card"><h2 data-content-type="diagram">${labels.compare}</h2>
    <div class="seismic-event-list" role="group" aria-label="${labels.select}">
      ${events.map((event, index) => `<button type="button" class="button secondary" id="event-${index}" style="--magnitude:${event[2] * 10}%"><span>${eventLabel(event)}</span><output></output></button>`).join('')}
    </div>
  </div>
</div>`;
$('#review').innerHTML = `<div class="seismic-card"><h2 data-content-type="assessment">${labels.quiz}</h2>
  <div class="seismic-quiz">${questions.map(([question, options], index) => `<fieldset><legend>${question}</legend>
    ${options.map((option, value) => `<label><input type="radio" name="check-${index}" value="${value}"><span>${option}</span></label>`).join('')}
    <p id="feedback-${index}" role="status" data-no-i18n></p></fieldset>`).join('')}</div></div>
  <details class="seismic-card seismic-note"><summary>${labels.sources}</summary>
    <ul>${Object.values(sources).map(source => `<li>${sourceLink(source)}</li>`).join('')}</ul>
  </details>`;

$('#play').addEventListener('click', () => toggle('station'));
$('#reset').addEventListener('click', () => reset('station'));
$('#wave-play').addEventListener('click', () => toggle('waves'));
$('#wave-reset').addEventListener('click', () => reset('waves'));
$('#wave-mode').addEventListener('change', draw);
$('#delta-m').addEventListener('input', renderRatios);
$('#review').addEventListener('change', feedback);
events.forEach((_, index) => $('#event-' + index).addEventListener('click', () => showEvent(index)));
for (const selector of ['#distance', '#depth']) {
  $(selector).addEventListener('input', () => {
    updateModel();
    reset('station');
  });
}

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
  if (!visible.get(active)) cancelFrame();
  schedule();
});
observer.observe($('#station'));
observer.observe($('#waves'));
const resizer = new ResizeObserver(draw);
for (const canvas of document.querySelectorAll('canvas')) resizer.observe(canvas);
window.addEventListener('resize', draw);
window.addEventListener('praxis-course-presentation-change', draw);
window.addEventListener('praxis-sound-change', event => { if (!event.detail.enabled) silence(); });
window.addEventListener('praxis-language-change', () => {
  updateModel();
  renderRatios();
  showEvent(selectedEvent);
  feedback();
  draw();
});
document.addEventListener('visibilitychange', () => { cancelFrame(); schedule(); });
window.addEventListener('pagehide', cancelFrame);
window.addEventListener('pageshow', schedule);

updateModel();
renderRatios();
showEvent(selectedEvent);
draw();
PraxisI18n.apply(document);

const integration = document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course = 'unde-seismice';
integration.dataset.title = title;
integration.onload = () => {
  const intro = $('.praxis-lab-intro p');
  if (intro) intro.textContent = subtitle;
  PraxisI18n.apply(document);
  PraxisLabWorkspace.mount();
};
document.body.append(integration);
