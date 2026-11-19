import { prefs, onPrefs, sfx, fmt, parseNum, esc } from '../core.js';
import { QUANTITIES, tempToK, tempFromK } from '../data.js';

export function mount(panel) {
  panel.innerHTML = `
    <div class="lab-head">
      <div>
        <h2>Convertor de unități</h2>
        <p>Alege mărimea fizică, apoi unitățile. Vezi imediat rezultatul și <b>pașii transformării</b> — trecerea prin unitatea SI.</p>
      </div>
      <button class="btn btn-outline" data-sheet><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>Fișă de lucru tipăribilă</button>
    </div>
    <div class="qty-grid" role="group" aria-label="Mărime fizică">
      ${QUANTITIES.map(q => `<button class="qty" data-q="${q.id}"><b>${q.name}</b><small>${q.sym} — [${q.sym}]<sub>SI</sub> = ${q.si}</small></button>`).join('')}
    </div>
    <div class="lab-grid">
      <div class="card">
        <div class="conv">
          <label>Valoare și unitate inițială
            <input type="text" inputmode="decimal" id="cvIn" value="72" autocomplete="off" aria-label="Valoare">
            <select id="cvFrom" aria-label="Unitate inițială"></select>
          </label>
          <button class="swap" id="cvSwap" aria-label="Inversează unitățile" title="Inversează unitățile">
            <svg class="ico" viewBox="0 0 24 24"><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>
          </button>
          <label>Unitate finală
            <input type="text" id="cvOut" readonly tabindex="-1" aria-label="Rezultat">
            <select id="cvTo" aria-label="Unitate finală"></select>
          </label>
        </div>
        <div class="result" id="cvRes" aria-live="polite"></div>
        <div class="steps-box"><h4>Pașii transformării</h4><ol id="cvSteps"></ol></div>
      </div>
      <aside class="card side">
        <h3>Echivalențe utile</h3>
        <div class="facts" id="cvFacts"></div>
        <p class="muted" style="margin-top:.75rem">Atinge o echivalență pentru a o verifica în convertor. Poți scrie și <b>3·10^5</b> sau <b>3e5</b>.</p>
      </aside>
    </div>`;

  const $ = s => panel.querySelector(s);
  let q = QUANTITIES.find(x => x.id === 'viteza');

  function selectQty(id, keep) {
    q = QUANTITIES.find(x => x.id === id);
    panel.querySelectorAll('.qty').forEach(b => b.classList.toggle('is-on', b.dataset.q === id));
    const opts = q.units.map(u => `<option value="${esc(u.u)}">${esc(u.u)} — ${esc(u.n)}</option>`).join('');
    $('#cvFrom').innerHTML = opts; $('#cvTo').innerHTML = opts;
    if (!keep) {
      $('#cvFrom').value = q.units[1]?.u ?? q.units[0].u;
      $('#cvTo').value = q.units[0].u;
      if (q.temp) { $('#cvFrom').value = '°C'; $('#cvTo').value = 'K'; $('#cvIn').value = '25'; }
    }
    $('#cvFacts').innerHTML = q.facts.map(([a, b]) => `<button class="fact" data-a="${esc(a)}"><span>${esc(a)}</span><span>= ${esc(b)}</span></button>`).join('');
    update(true);
  }

  function update(flash) {
    const v = parseNum($('#cvIn').value);
    const from = $('#cvFrom').value, to = $('#cvTo').value;
    const res = $('#cvRes'), steps = $('#cvSteps');
    if (!Number.isFinite(v)) {
      res.innerHTML = '<small>Rezultat</small><div class="result-val">—</div>';
      steps.innerHTML = '<li>Introdu o valoare numerică (ex.: 12,5).</li>';
      $('#cvOut').value = '';
      return;
    }
    let r, html;
    if (q.temp) {
      const k = tempToK(v, from);
      r = tempFromK(k, to);
      const kTxt = fmt(k, { mode: 'dec' });
      html = [
        from === 'K' ? `Temperatura este deja în kelvin: <span class="m">T = ${kTxt} K</span>` :
          from === '°C' ? `Trecem în kelvin: <span class="m">T = t + 273,15 = ${fmt(v, { mode: 'dec' })} + 273,15 = ${kTxt} K</span>` :
          `Trecem în kelvin: <span class="m">T = (t<sub>F</sub> − 32)·5/9 + 273,15 = ${kTxt} K</span>`,
        to === 'K' ? 'Unitatea finală este kelvinul (unitate SI).' :
          to === '°C' ? `Din kelvin în Celsius: <span class="m">t = T − 273,15</span>` : `Din kelvin în Fahrenheit: <span class="m">t<sub>F</sub> = (T − 273,15)·9/5 + 32</span>`,
        `Rezultat: <span class="m"><b>${fmt(r)} ${esc(to)}</b></span>`,
      ];
      if (k < 0) html.push('<b style="color:var(--red)">Atenție: temperatura nu poate fi sub 0 K (zero absolut)!</b>');
    } else {
      const uf = q.units.find(u => u.u === from), ut = q.units.find(u => u.u === to);
      const si = v * uf.f;
      r = si / ut.f;
      const k = uf.f / ut.f;
      html = [
        `Exprimăm în unitatea SI: <span class="m">1 ${esc(from)} = ${fmt(uf.f)} ${q.si}</span> ⇒ <span class="m">${fmt(v)} ${esc(from)} = ${fmt(si)} ${q.si}</span>`,
        `Din SI în unitatea dorită: <span class="m">1 ${q.si} = ${fmt(1 / ut.f)} ${esc(to)}</span>, deci înmulțim cu ${fmt(1 / ut.f)}`,
        `Rezultat: <span class="m"><b>${fmt(v)} ${esc(from)} = ${fmt(r)} ${esc(to)}</b></span> &nbsp;<span class="muted">(1 ${esc(from)} = ${fmt(k)} ${esc(to)})</span>`,
      ];
    }
    res.innerHTML = `<small>${esc(q.name)} • ${fmt(v)} ${esc(from)} =</small><div class="result-val"><span class="pop">${fmt(r)}</span><span class="u">${esc(to)}</span></div>`;
    steps.innerHTML = html.map(h => `<li><span>${h}</span></li>`).join('');
    $('#cvOut').value = fmt(r).replace(/<sup>(.*?)<\/sup>/, '^$1');
    if (flash) { res.classList.remove('flash'); void res.offsetWidth; res.classList.add('flash'); }
  }

  panel.querySelector('.qty-grid').addEventListener('click', e => {
    const b = e.target.closest('.qty');
    if (b) { selectQty(b.dataset.q); sfx('click'); }
  });
  $('#cvIn').addEventListener('input', () => update(false));
  $('#cvIn').addEventListener('change', () => { update(true); sfx('tick'); });
  $('#cvFrom').addEventListener('change', () => { update(true); sfx('tick'); });
  $('#cvTo').addEventListener('change', () => { update(true); sfx('tick'); });
  $('#cvSwap').addEventListener('click', () => {
    const f = $('#cvFrom').value;
    $('#cvFrom').value = $('#cvTo').value; $('#cvTo').value = f;
    $('#cvSwap').classList.toggle('spin');
    sfx('swap'); update(true);
  });
  $('#cvFacts').addEventListener('click', e => {
    const b = e.target.closest('.fact');
    if (!b) return;
    const m = b.dataset.a.match(/^([\d,.]+)\s+(.+)$/);
    if (!m || !q.units.some(u => u.u === m[2])) return;
    $('#cvIn').value = m[1]; $('#cvFrom').value = m[2];
    const right = b.lastElementChild.textContent.match(/([^\s]+)$/)?.[1];
    if (q.units.some(u => u.u === right)) $('#cvTo').value = right;
    sfx('click'); update(true);
  });
  onPrefs(k => { if (k === 'notation' || k === 'digits') update(false); });

  selectQty('viteza', false);
  $('#cvIn').value = '72'; $('#cvFrom').value = 'km/h'; $('#cvTo').value = 'm/s';
  update(true);
}
