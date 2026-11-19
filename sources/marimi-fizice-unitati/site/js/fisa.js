// Fișă de lucru tipăribilă: exerciții de transformare + pagină cu răspunsuri.
// Modulul se încarcă doar când utilizatorul apasă un buton [data-sheet].
import { sfx, fmt, shuffle, esc, supText } from './core.js';
import { QUANTITIES, tempToK, tempFromK } from './data.js';

// Unități „exotice” — apar doar la nivelul greu
const EXOTIC = new Set(['in', 'ft', 'mi', 'NM', 'UA', 'a.l.', 'lb', 'oz', 'eV', 'nod', 'mph', 'dyn', 'kgf', 'mmHg', 'cal', 'kcal', 'CP', '°F', 'atm', 'µs', 'săpt', 'an', 'q']);
const LEVELS = { 1: 'Ușor', 2: 'Mediu', 3: 'Greu' };
const DEFAULT_Q = ['lungime', 'masa', 'timp', 'arie', 'volum', 'viteza'];

const st = { qs: new Set(DEFAULT_Q), lvl: 1, n: 15, answers: true, items: [] };
let dlg;

const rnd = a => a[Math.floor(Math.random() * a.length)];
const isPow10 = f => Number.isInteger(Math.round(Math.log10(f) * 1e9) / 1e9);
const clean = x => Number(x.toPrecision(12));
// rezultat „frumos”: cel mult 6 cifre semnificative
const nice = x => Math.abs(Number(x.toPrecision(6)) - x) <= Math.abs(x) * 1e-10;

function value(lvl) {
  if (lvl === 1) return rnd([rnd([2, 3, 4, 5, 6, 7, 8, 9, 12, 25, 40, 75]), Math.floor(Math.random() * 90 + 10) / 10]);
  if (lvl === 2) return rnd([Math.floor(Math.random() * 990 + 10) / 10, Math.floor(Math.random() * 500 + 1), rnd([0.5, 0.25, 1.5, 2.5, 0.05])]);
  return rnd([Math.floor(Math.random() * 9000 + 1000) / 100, Math.floor(Math.random() * 99 + 1) / 1000, Math.floor(Math.random() * 90 + 10) * 100]);
}

function make(q, lvl) {
  if (q.temp) {
    const pairs = lvl === 1 ? [['°C', 'K'], ['K', '°C']] : lvl === 2 ? [['°C', 'K'], ['K', '°C']] : [['°C', '°F'], ['°F', '°C'], ['K', '°F']];
    const [a, b] = rnd(pairs);
    const v = a === 'K' ? rnd([250, 273, 300, 310, 373, 400]) + (lvl > 1 ? 0.15 : 0) : rnd([-20, -5, 0, 15, 20, 25, 37, 100]);
    const ans = clean(tempFromK(tempToK(v, a), b));
    const rule = b === '°F' || a === '°F' ? 't(°F) = 1,8·t(°C) + 32' : 'T(K) = t(°C) + 273,15';
    return { q, v, a, b, ans, exact: nice(ans), rule };
  }
  let units = q.units.filter(u => lvl === 3 || !EXOTIC.has(u.u));
  if (lvl === 1) units = units.filter(u => isPow10(u.f));
  if (units.length < 2) return null;
  const A = rnd(units), B = rnd(units.filter(u => u !== A));
  const span = Math.abs(Math.log10(A.f / B.f));
  if (lvl === 1 && span > (q.si.includes('²') || q.si.includes('³') ? 6 : 3)) return null;
  if (span > 9) return null;
  const v = value(lvl);
  const ans = clean(v * A.f / B.f);
  const mag = Math.abs(Math.log10(ans));
  if (lvl < 3 && (!nice(ans) || mag > 7)) return null;
  if (!Number.isFinite(ans) || ans === 0) return null;
  const k = clean(A.f / B.f);
  return { q, v, a: A.u, b: B.u, ans, exact: nice(ans), rule: `1 ${A.u} = ${plain(k)} ${B.u}` };
}

// număr ca text simplu (fără HTML), pentru explicații
function plain(x) {
  return fmt(x, { sig: 6, mode: 'auto' }).replace(/<sup>(.*?)<\/sup>/g, (_, e) => supText(e.replace('−', '-'))).replace(/^1·10/, '10');
}

function generate() {
  const list = QUANTITIES.filter(q => st.qs.has(q.id));
  const items = [], seen = new Set();
  let guard = 0;
  while (items.length < st.n && guard++ < 4000) {
    const q = list[items.length % list.length];
    const it = make(q, st.lvl);
    if (!it) continue;
    const key = `${it.v}${it.a}${it.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(it);
  }
  st.items = shuffle(items);
}

function num(x, { exact = true } = {}) {
  const s = fmt(x, { sig: exact ? 6 : 4, mode: 'auto' });
  return exact ? s : '≈ ' + s;
}

function sheetHTML() {
  const today = new Date().toLocaleDateString('ro-RO');
  const qn = QUANTITIES.filter(q => st.qs.has(q.id)).map(q => q.name.toLowerCase()).join(', ');
  const page1 = `
    <section class="sheet">
      <header class="sh-head">
        <div class="sh-brand"><b>praxis</b> SCIENCE LAB • Mărimi fizice și unități de măsură</div>
        <h1>Fișă de lucru — Transformări de unități</h1>
        <div class="sh-fields"><span>Nume și prenume: <i></i></span><span>Clasa: <i class="s"></i></span><span>Data: <i class="s"></i></span></div>
        <p class="sh-meta">Nivel: <b>${LEVELS[st.lvl]}</b> • ${st.items.length} exerciții • Mărimi: ${esc(qn)}</p>
      </header>
      <p class="sh-task"><b>Cerință:</b> Transformă în unitatea cerută. Scrie rezultatul pe linie${st.lvl === 3 ? ', rotunjit la 4 cifre semnificative; folosește notația științifică pentru numere foarte mari sau foarte mici' : ''}.</p>
      <ol class="sh-list">
        ${st.items.map(it => `<li><span>${fmt(it.v, { sig: 6, mode: 'dec' })} ${esc(it.a)}</span> = <i></i> ${esc(it.b)}</li>`).join('')}
      </ol>
      <div class="sh-help">
        <b>Amintește-ți:</b>
        T = 10<sup>12</sup> • G = 10<sup>9</sup> • M = 10<sup>6</sup> • k = 10<sup>3</sup> • h = 10<sup>2</sup> • da = 10 • d = 10<sup>−1</sup> • c = 10<sup>−2</sup> • m = 10<sup>−3</sup> • µ = 10<sup>−6</sup> • n = 10<sup>−9</sup>
        <br>1 h = 3600 s • 1 L = 1 dm³ • 1 ha = 10<sup>4</sup> m² • 1 t = 1000 kg • 1 m/s = 3,6 km/h • T(K) = t(°C) + 273,15
      </div>
      <footer class="sh-foot"><span>Punctaj: ______ / ${st.items.length}</span><span>${today}</span></footer>
    </section>`;
  const page2 = !st.answers ? '' : `
    <section class="sheet sh-answers">
      <header class="sh-head">
        <div class="sh-brand"><b>praxis</b> SCIENCE LAB • pentru profesor</div>
        <h1>Răspunsuri</h1>
      </header>
      <ol class="sh-list sh-ans">
        ${st.items.map(it => `<li><span>${fmt(it.v, { sig: 6, mode: 'dec' })} ${esc(it.a)} = <b>${num(it.ans, { exact: it.exact })} ${esc(it.b)}</b></span><small>${esc(it.rule)}</small></li>`).join('')}
      </ol>
    </section>`;
  return page1 + page2;
}

function build() {
  dlg = document.createElement('dialog');
  dlg.className = 'dlg dlg-wide';
  dlg.setAttribute('aria-labelledby', 'shTitle');
  dlg.innerHTML = `
    <div class="dlg-head"><h2 id="shTitle">Fișă de lucru tipăribilă</h2><button class="x" data-close aria-label="Închide">×</button></div>
    <div class="sh-opts">
      <div class="setup-row">
        <span class="setup-lbl">Mărimi (poți alege mai multe)</span>
        <div class="chips wrap-chips" role="group" aria-label="Mărimi">
          ${QUANTITIES.map(q => `<button class="chip" data-sq="${q.id}" aria-pressed="false">${esc(q.name)}</button>`).join('')}
        </div>
      </div>
      <div class="sh-row2">
        <div class="setup-row"><span class="setup-lbl">Nivel</span>
          <div class="seg" role="group" aria-label="Nivel">${[1, 2, 3].map(l => `<button data-sl="${l}"><span class="lvl-dot l${l}"></span>${LEVELS[l]}</button>`).join('')}</div>
        </div>
        <div class="setup-row"><span class="setup-lbl">Exerciții</span>
          <div class="seg seg-sm" role="group" aria-label="Număr de exerciții">${[10, 15, 20, 30].map(n => `<button data-sn="${n}">${n}</button>`).join('')}</div>
        </div>
        <label class="switch"><input type="checkbox" id="shAns" checked><span></span> Pagină cu răspunsuri</label>
      </div>
    </div>
    <div class="sh-preview" id="shPrev" aria-label="Previzualizare fișă"></div>
    <div class="actions sh-actions">
      <button class="btn btn-outline" id="shNew">↻ Altă variantă</button>
      <button class="btn btn-primary" id="shPrint">Tipărește / Salvează PDF</button>
    </div>`;
  document.body.appendChild(dlg);

  dlg.addEventListener('click', e => {
    const t = e.target;
    if (t === dlg || t.closest('[data-close]')) return dlg.close();
    const q = t.closest('[data-sq]');
    if (q) {
      const id = q.dataset.sq;
      if (st.qs.has(id) && st.qs.size > 1) st.qs.delete(id); else st.qs.add(id);
      return refresh(true);
    }
    const l = t.closest('[data-sl]');
    if (l) { st.lvl = Number(l.dataset.sl); return refresh(true); }
    const n = t.closest('[data-sn]');
    if (n) { st.n = Number(n.dataset.sn); return refresh(true); }
    if (t.closest('#shNew')) { sfx('swap'); return refresh(true, true); }
    if (t.closest('#shPrint')) return print();
  });
  dlg.querySelector('#shAns').addEventListener('change', e => { st.answers = e.target.checked; refresh(false); });
}

function refresh(regen, spin) {
  if (regen) { generate(); if (!spin) sfx('tick'); }
  dlg.querySelectorAll('[data-sq]').forEach(b => { const on = st.qs.has(b.dataset.sq); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
  dlg.querySelectorAll('[data-sl]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.sl) === st.lvl));
  dlg.querySelectorAll('[data-sn]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.sn) === st.n));
  const prev = dlg.querySelector('#shPrev');
  prev.innerHTML = sheetHTML();
  if (spin) prev.firstElementChild.classList.add('flash');
}

function print() {
  sfx('click');
  let out = document.getElementById('printSheet');
  if (!out) { out = document.createElement('div'); out.id = 'printSheet'; document.body.appendChild(out); }
  out.innerHTML = sheetHTML();
  document.body.classList.add('print-sheet');
  const done = () => { document.body.classList.remove('print-sheet'); out.innerHTML = ''; removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  window.print();
}

export function openSheet() {
  if (!dlg) build();
  refresh(true);
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}
