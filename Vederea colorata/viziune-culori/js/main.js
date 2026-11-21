// main.js — registrul de activități și comutarea taburilor.
import beams from './beams.js';
import pigments from './pigments.js';
import filters from './filters.js';
import eye from './eye.js';
import neon from './neon.js';
import pixels from './pixels.js';

const ACTIVITY = [beams, pigments, filters, eye, neon, pixels];

const tabsEl = document.getElementById('tabs');
const stageEl = document.getElementById('stage');
let resizeHooks = [];
let current = null;

function buildTabs() {
  ACTIVITY.forEach((a, i) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.textContent = a.label;
    b.dataset.id = a.id;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => select(a.id));
    tabsEl.appendChild(b);
  });
}

function select(id) {
  const a = ACTIVITY.find(x => x.id === id) || ACTIVITY[0];
  current = a.id;
  [...tabsEl.children].forEach(t => t.classList.toggle('active', t.dataset.id === a.id));
  // Curățăm stage-ul și reconstruim.
  resizeHooks = [];
  stageEl.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'activity';
  const scene = document.createElement('div'); scene.className = 'scene';
  const panel = document.createElement('aside'); panel.className = 'panel';
  wrap.append(scene, panel);
  stageEl.appendChild(wrap);

  const ctx = {
    onResize(fn) { resizeHooks.push(fn); },
  };
  try {
    a.mount(scene, panel, ctx);
  } catch (err) {
    console.error(err);
    panel.innerHTML = '<p class="lead">Eroare la încărcarea activității.</p>';
  }
  localStorage.setItem('viziune-tab', a.id);
}

window.addEventListener('resize', () => {
  resizeHooks.forEach(fn => { try { fn(); } catch (e) { /* noop */ } });
});

buildTabs();
const saved = localStorage.getItem('viziune-tab');
select(ACTIVITY.some(a => a.id === saved) ? saved : ACTIVITY[0].id);
