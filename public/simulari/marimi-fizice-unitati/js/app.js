import { prefs, setPref, onPrefs, sfx, toast, fmt, parseNum, esc } from './core.js';
import { PREFIXES, LIBRARY } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- Preferințe aplicate pe pagină ----------
function applyPrefs() {
  document.documentElement.style.setProperty('--scale', prefs.scale);
  document.body.classList.toggle('contrast', prefs.contrast);
  document.body.classList.toggle('board', prefs.board);
  document.body.classList.toggle('no-anim', !prefs.anim);
  $('#btnSound').setAttribute('aria-pressed', prefs.sound);
  $('#btnBoard').setAttribute('aria-pressed', prefs.board);
  $$('#displayPop [data-scale]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.scale) === prefs.scale));
  $('#optContrast').checked = prefs.contrast;
  $('#prefNotation').value = prefs.notation;
  $('#prefDigits').value = prefs.digits;
  $('#prefDigitsOut').textContent = prefs.digits;
  $('#prefAnim').checked = prefs.anim;
}
onPrefs(applyPrefs);
applyPrefs();

// ---------- Popovers ----------
function setupPopover(btn, pop, alignRight) {
  const place = () => {
    const r = btn.getBoundingClientRect();
    pop.style.top = r.bottom + 8 + 'px';
    const w = pop.offsetWidth;
    let left = alignRight ? r.right - w : r.left;
    left = Math.max(8, Math.min(left, innerWidth - w - 8));
    pop.style.left = left + 'px';
  };
  const close = () => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = pop.hidden;
    $$('.popover').forEach(p => { p.hidden = true; });
    if (open) { pop.hidden = false; place(); btn.setAttribute('aria-expanded', 'true'); sfx('click'); }
    else close();
  });
  pop.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', close);
  addEventListener('resize', () => { if (!pop.hidden) place(); });
  addEventListener('scroll', () => { if (!pop.hidden) place(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { close(); btn.focus(); } });
}
setupPopover($('#btnDisplay'), $('#displayPop'), false);
setupPopover($('#btnPrefs'), $('#prefsPop'), true);

$$('#displayPop [data-scale]').forEach(b => b.addEventListener('click', () => { setPref('scale', Number(b.dataset.scale)); sfx('click'); }));
$('#optContrast').addEventListener('change', e => setPref('contrast', e.target.checked));
$('#prefNotation').addEventListener('change', e => setPref('notation', e.target.value));
$('#prefDigits').addEventListener('input', e => setPref('digits', Number(e.target.value)));
$('#prefAnim').addEventListener('change', e => setPref('anim', e.target.checked));
$('#prefReset').addEventListener('click', () => { setPref('bestPct', 0); setPref('dimBest', 0); toast('Progresul a fost resetat.'); });

// ---------- Sunet & mod tablă ----------
function toggleSound() {
  setPref('sound', !prefs.sound);
  sfx('click');
  toast(prefs.sound ? 'Sunet pornit' : 'Sunet oprit');
}
function toggleBoard() {
  const on = !prefs.board;
  setPref('board', on);
  sfx('swap');
  try {
    if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  } catch { /* fullscreen indisponibil (ex. iOS) */ }
  toast(on ? 'Mod tablă activat' : 'Mod tablă dezactivat');
}
$('#btnSound').addEventListener('click', toggleSound);
$('#btnBoard').addEventListener('click', toggleBoard);

// ---------- Tab-uri (laboratoarele se încarcă la prima deschidere) ----------
const TABS = $$('[role=tab]');
const loaded = new Set(['teorie']);

async function showTab(name, { focus = false, sound = true } = {}) {
  const tab = TABS.find(t => t.dataset.tab === name) || TABS[0];
  name = tab.dataset.tab;
  TABS.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefs.anim ? 'smooth' : 'auto' });
  if (sound) sfx('click');

  const url = new URL(location.href);
  if (name === 'teorie') url.searchParams.delete('tab'); else url.searchParams.set('tab', name);
  history.replaceState(null, '', url);

  if (!loaded.has(name)) {
    loaded.add(name);
    const panel = $('#panel-' + name);
    panel.innerHTML = '<div class="card muted">Se încarcă laboratorul…</div>';
    try {
      const mod = await import(`./labs/${name}.js`);
      panel.innerHTML = '';
      mod.mount(panel);
    } catch (err) {
      loaded.delete(name);
      panel.innerHTML = '<div class="card">Laboratorul nu s-a putut încărca. Verifică conexiunea și încearcă din nou.</div>';
      console.error(err);
    }
  }
}

TABS.forEach((t, i) => {
  t.addEventListener('click', () => showTab(t.dataset.tab));
  t.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === 'Home') { e.preventDefault(); showTab(TABS[0].dataset.tab, { focus: true }); }
    if (e.key === 'End') { e.preventDefault(); showTab(TABS.at(-1).dataset.tab, { focus: true }); }
    if (d) { e.preventDefault(); showTab(TABS[(i + d + TABS.length) % TABS.length].dataset.tab, { focus: true }); }
  });
});
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if (g) { e.preventDefault(); showTab(g.dataset.goto); window.scrollTo({ top: 0, behavior: prefs.anim ? 'smooth' : 'auto' }); }
  // Fișa de lucru se încarcă doar la cerere
  if (e.target.closest('[data-sheet]')) {
    sfx('click');
    import('./fisa.js').then(m => m.openSheet()).catch(() => toast('Fișa nu s-a putut încărca. Verifică conexiunea.'));
  }
});

// ---------- Capitole teorie ----------
const CHIPS = $$('.chip[data-chapter]');
function showChapter(ch) {
  CHIPS.forEach(c => { const selected = c.dataset.chapter === ch; c.classList.toggle('is-on', selected); c.setAttribute('aria-pressed', String(selected)); });
  $$('.chapter').forEach((a, i) => {
    a.hidden = ch !== 'all' && a.dataset.ch !== ch;
    a.style.animationDelay = ch === 'all' ? Math.min(i, 3) * 0.06 + 's' : '0s';
    // repornește animația de apariție
    a.style.animationName = 'none'; void a.offsetWidth; a.style.animationName = '';
  });
}
CHIPS.forEach(c => c.addEventListener('click', () => { showChapter(c.dataset.chapter); sfx('click'); }));
window.addEventListener('praxis-chapter', e => {
  showTab('teorie'); showChapter(String(e.detail));
  window.scrollTo({ top: $('.chips').getBoundingClientRect().top + scrollY - 12, behavior: prefs.anim ? 'smooth' : 'auto' });
});
$$('[data-goto-chapter]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault(); showTab('teorie'); showChapter(a.dataset.gotoChapter);
}));
showChapter('1');

// Bandă de prefixe în capitolul 3
$('#prefixStrip').innerHTML = PREFIXES.filter(p => p.e !== 0).slice().reverse().map(p => `
  <button class="pfx${p.e < 0 ? ' sub' : ''}" data-goto="prefixe" data-e="${p.e}" title="Deschide în laborator">
    <b>${p.s}</b><span>${p.n}</span><small>10<sup>${String(p.e).replace('-', '−')}</sup></small>
  </button>`).join('');
$('#prefixStrip').addEventListener('click', e => {
  const b = e.target.closest('.pfx');
  if (!b) return;
  sessionStorage.setItem('praxis-prefix', b.dataset.e);
  window.dispatchEvent(new CustomEvent('praxis-prefix', { detail: Number(b.dataset.e) }));
});

// ---------- Mini-calculator de erori ----------
function calcErrors() {
  const vals = $('#errInput').value.split(/[;\s]+/).map(parseNum).filter(Number.isFinite);
  const out = $('#errOut');
  if (vals.length < 2) {
    out.innerHTML = '<div class="stat wide"><small>Atenție</small>Introdu cel puțin două valori numerice.</div>';
    sfx('bad'); return;
  }
  const n = vals.length;
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  const devs = vals.map(v => Math.abs(v - mean));
  const dmean = devs.reduce((a, b) => a + b, 0) / n;
  const rel = mean !== 0 ? dmean / Math.abs(mean) * 100 : NaN;
  const o = { mode: 'dec' };
  out.innerHTML = `
    <div class="stat"><small>Număr determinări n</small><b>${n}</b></div>
    <div class="stat" style="animation-delay:.05s"><small>Valoarea medie x̄</small><b>${fmt(mean, o)}</b></div>
    <div class="stat" style="animation-delay:.1s"><small>Eroarea absolută medie Δx̄</small><b>${fmt(dmean, { ...o, sig: 2 })}</b></div>
    <div class="stat" style="animation-delay:.15s"><small>Eroarea relativă ε</small><b>${fmt(rel, { ...o, sig: 2 })} %</b></div>
    <div class="stat wide" style="animation-delay:.2s"><small>Erori absolute Δxᵢ = |xᵢ − x̄|</small><b>${devs.map(d => fmt(d, { ...o, sig: 2 })).join(' ; ')}</b></div>
    <div class="stat wide" style="animation-delay:.25s"><small>Rezultatul se scrie</small><b>x = (${fmt(mean, o)} ± ${fmt(dmean, { ...o, sig: 2 })}) unități</b></div>`;
  sfx('ok');
}
$('#errBtn').addEventListener('click', calcErrors);
$('#errInput').addEventListener('keydown', e => { if (e.key === 'Enter') calcErrors(); });

// ---------- Dialoguri ----------
const DLG = { library: '#dlgLibrary', help: '#dlgHelp', about: '#dlgAbout' };
function openDlg(name) {
  const d = $(DLG[name]);
  if (!d) return;
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  sfx('click');
  if (name === 'library') { renderLib(''); $('#libSearch').value = ''; }
}
$$('.dlg').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
});
$('#btnLibrary').addEventListener('click', () => openDlg('library'));
$('#btnHelp').addEventListener('click', () => openDlg('help'));
$$('[data-open]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openDlg(a.dataset.open); }));

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function renderLib(q) {
  const nq = norm(q);
  const items = LIBRARY.filter(x => !nq || norm(`${x.s} ${x.n} ${x.d}`).includes(nq));
  $('#libList').innerHTML = items.length
    ? items.map(x => `<li><b>${esc(x.s)}</b><span>${esc(x.n)}</span><small>${esc(x.d)}</small></li>`).join('')
    : '<li><b>?</b><span>Nimic găsit</span><small>Încearcă alt termen.</small></li>';
}
$('#libSearch').addEventListener('input', e => renderLib(e.target.value));

// ---------- Scurtături tastatură ----------
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest('input, select, textarea, dialog[open]')) return;
  if ($('#panel-test:not([hidden]) .opts')) return; // testul folosește tastele 1–4
  const k = e.key.toLowerCase();
  if (k >= '1' && k <= '5') showTab(TABS[Number(k) - 1].dataset.tab);
  else if (k === 'b') toggleBoard();
  else if (k === 's') toggleSound();
});

// ---------- Pornire ----------
const start = new URLSearchParams(location.search).get('tab');
if (start && start !== 'teorie') showTab(start, { sound: false });
