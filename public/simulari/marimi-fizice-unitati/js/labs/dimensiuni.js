import { prefs, setPref, sfx, toast, confetti, shuffle, esc, supText } from '../core.js';
import { BASE, DERIVED } from '../data.js';

const sup = n => String(n).replace('-', '−');

/** Expresia unei unități din exponenți: kg·m·s⁻² */
function expr(d, animate) {
  if (d.every(e => !e)) return '<span class="lbl2">'+(window.PraxisI18n?.tr('Adaugă unități fundamentale cu butoanele +/−')||'Add base units with the +/− buttons')+'</span>';
  // kg în față, ca în manuale
  const order = [1, 0, 2, 3, 4, 5, 6];
  const sorted = order.map(i => d[i] ? `<span class="piece"${animate ? '' : ' style="animation:none"'}>${BASE[i].s}${d[i] !== 1 ? `<sup>${sup(d[i])}</sup>` : ''}</span>` : '').filter(Boolean);
  return sorted.join('<span>·</span>');
}

export function mount(panel) {
  panel.innerHTML = `
    <div class="lab-head">
      <div>
        <h2>Analiză dimensională — construiește unitatea</h2>
        <p>Orice unitate SI derivată se scrie ca produs de puteri ale celor 7 unități fundamentale. Folosește <b>+</b> / <b>−</b> pentru a alege exponenții, apoi verifică.</p>
      </div>
      <div class="score-pill">Scor: <b id="dmScore">0</b> / <span id="dmTotal">0</span> • Record: <b id="dmBest">${prefs.dimBest}</b></div>
    </div>
    <div class="target">
      <div>
        <h3 id="dmQ"></h3>
        <div class="formula-sm" id="dmF"></div>
      </div>
      <div class="unit-name" id="dmName">Unitate: ?</div>
    </div>
    <div class="base-grid" id="dmBase">
      ${BASE.map((b, i) => `
        <div class="base" data-i="${i}">
          <div class="sym">${b.s}<sup class="ex"></sup></div>
          <div class="nm">${b.q}</div>
          <div class="stepper">
            <button data-d="-1" aria-label="${window.PraxisI18n?.tr("Scade exponentul pentru")||"Decrease the exponent for"} ${window.PraxisI18n?.tr(b.n)||b.n}">−</button>
            <output aria-label="Exponent ${window.PraxisI18n?.tr(b.n)||b.n}">0</output>
            <button data-d="1" aria-label="${window.PraxisI18n?.tr("Crește exponentul pentru")||"Increase the exponent for"} ${window.PraxisI18n?.tr(b.n)||b.n}">+</button>
          </div>
        </div>`).join('')}
    </div>
    <div class="built" id="dmBuilt" aria-live="polite"></div>
    <div class="actions">
      <button class="btn btn-primary" id="dmCheck">${window.PraxisI18n?.tr("Verifică")||"Check"}</button>
      <button class="btn btn-outline" id="dmHint">${window.PraxisI18n?.tr("Indiciu")||"Hint"}</button>
      <button class="btn btn-outline" id="dmReset">${window.PraxisI18n?.tr("Golește")||"Clear"}</button>
      <button class="btn btn-ghost" id="dmNext">Următoarea ›</button>
    </div>
    <div class="feedback" id="dmFb"></div>`;

  const $ = s => panel.querySelector(s);
  let deck = shuffle(DERIVED), pos = 0, cur, exps, score = 0, total = 0, answered = false, timer;

  function load() {
    clearTimeout(timer);
    if (pos >= deck.length) { deck = shuffle(DERIVED); pos = 0; }
    cur = deck[pos++];
    cur.q = window.PraxisI18n?.tr(cur.q)||cur.q;
    cur.hint = window.PraxisI18n?.tr(cur.hint)||cur.hint;
    exps = [0, 0, 0, 0, 0, 0, 0];
    answered = false;
    $('#dmQ').textContent = cur.q;
    $('#dmF').textContent = cur.f;
    $('#dmName').textContent = (window.PraxisI18n?.tr('Unitate SI:')||'SI unit:')+' ?';
    $('#dmFb').className = 'feedback';
    draw(false);
  }

  function draw(animate) {
    panel.querySelectorAll('.base').forEach(el => {
      const e = exps[el.dataset.i];
      el.classList.toggle('nz', e !== 0);
      el.querySelector('output').textContent = sup(e);
      el.querySelector('.ex').textContent = e && e !== 1 ? sup(e) : '';
    });
    $('#dmBuilt').innerHTML = `<span class="lbl2">[${esc((window.PraxisI18n?.tr(cur.q)||cur.q).toLowerCase())}]<sub>SI</sub> =</span> ${expr(exps, animate)}`;
  }

  window.addEventListener('praxis-language-change', () => draw(false));
  $('#dmBase').addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b) return;
    const i = b.closest('.base').dataset.i;
    exps[i] = Math.max(-4, Math.min(4, exps[i] + Number(b.dataset.d)));
    sfx('tick');
    draw(true);
  });

  $('#dmCheck').addEventListener('click', () => {
    const fb = $('#dmFb');
    const ok = exps.every((e, i) => e === cur.d[i]);
    fb.className = 'feedback';
    void fb.offsetWidth;
    if (ok) {
      if (!answered) { score++; total++; }
      answered = true;
      fb.className = 'feedback ok';
      fb.innerHTML = `Corect! <b>1 ${esc(cur.u)}</b> (${esc(window.PraxisI18n?.tr(cur.un)||cur.un)}) = ${expr(cur.d, false)}`;
      $('#dmName').innerHTML = `${window.PraxisI18n?.tr("Unitate SI:")||"SI unit:"} <b>${esc(cur.u)}</b> — ${esc(cur.un)}`;
      sfx('ok');
      if (score > prefs.dimBest) { setPref('dimBest', score); $('#dmBest').textContent = score; if (score % 5 === 0) { confetti(); sfx('win'); } }
      timer = setTimeout(load, prefs.anim ? 2200 : 1500);
    } else {
      if (!answered) { total++; answered = 'wrong'; }
      fb.className = 'feedback bad';
      const diff = exps.map((e, i) => e !== cur.d[i] ? BASE[i].s : null).filter(Boolean);
      fb.innerHTML = `Nu încă. Verifică exponenții pentru: <b>${diff.join(', ')}</b>.`;
      sfx('bad');
    }
    $('#dmScore').textContent = score;
    $('#dmTotal').textContent = total;
  });

  $('#dmHint').addEventListener('click', () => {
    const fb = $('#dmFb');
    fb.className = 'feedback hint';
    fb.innerHTML = `Indiciu: ${esc(cur.hint)}`;
    sfx('click');
  });
  $('#dmReset').addEventListener('click', () => { exps = [0, 0, 0, 0, 0, 0, 0]; sfx('click'); draw(false); });
  $('#dmNext').addEventListener('click', () => {
    if (!answered) { total++; $('#dmTotal').textContent = total; toast(`Răspuns: 1 ${cur.u} = ${cur.d.map((e, i) => e ? BASE[i].s + (e !== 1 ? supText(e) : '') : '').filter(Boolean).join('·')}`); }
    sfx('swap'); load();
  });

  load();
}
