import { prefs, setPref, sfx, confetti, shuffle, esc } from '../core.js';
import { bank, CHAPTERS, LEVELS } from '../questions.js';

const SIZES = [5, 10, 15, 20];

export function mount(panel) {
  const $ = s => panel.querySelector(s);
  const cfg = { ch: 0, lvl: 0, n: 10, ...prefs.quiz };
  let all, qs, i, score, locked, log;

  const pool = () => all.filter(x => (!cfg.ch || x.ch === cfg.ch) && (!cfg.lvl || x.lvl === cfg.lvl));
  const chName = id => CHAPTERS.find(c => c.id === id).n;

  // ---------- Setări ----------
  function setup() {
    all = bank();
    panel.innerHTML = `
      <div class="lab-head">
        <div><h2>Test: verifică-te</h2><p>Alege capitolul și nivelul de dificultate. Răspunde atingând varianta sau cu tastele <kbd>1</kbd>–<kbd>4</kbd>.</p></div>
        <div class="score-pill">Cel mai bun rezultat: <b>${prefs.bestPct || 0}%</b></div>
      </div>
      <div class="card quiz quiz-setup">
        <div class="setup-row">
          <span class="setup-lbl">Capitol</span>
          <div class="chips wrap-chips" role="group" aria-label="Capitol">
            <button class="chip" data-ch="0">Toate capitolele</button>
            ${CHAPTERS.map(c => `<button class="chip" data-ch="${c.id}">${c.id}. ${esc(c.n)}</button>`).join('')}
          </div>
        </div>
        <div class="setup-row">
          <span class="setup-lbl">Nivel</span>
          <div class="seg" role="group" aria-label="Nivel de dificultate">
            <button data-lvl="0">Toate</button>
            ${[1, 2, 3].map(l => `<button data-lvl="${l}"><span class="lvl-dot l${l}"></span>${LEVELS[l]}</button>`).join('')}
          </div>
        </div>
        <div class="setup-row">
          <span class="setup-lbl">Număr de întrebări</span>
          <div class="seg seg-sm" role="group" aria-label="Număr de întrebări">
            ${SIZES.map(n => `<button data-n="${n}">${n}</button>`).join('')}
          </div>
        </div>
        <p class="avail" id="qAvail" aria-live="polite"></p>
        <div class="actions">
          <button class="btn btn-primary" id="qStart">Începe testul ›</button>
          <button class="btn btn-outline" data-sheet>Fișă de lucru tipăribilă</button>
        </div>
      </div>`;
    syncSetup();
  }

  function syncSetup() {
    panel.querySelectorAll('[data-ch]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.ch) === cfg.ch));
    panel.querySelectorAll('[data-lvl]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.lvl) === cfg.lvl));
    panel.querySelectorAll('[data-n]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.n) === cfg.n));
    const n = pool().length;
    $('#qAvail').innerHTML = n === 0
      ? 'Nu există întrebări pentru această combinație. Alege alt nivel.'
      : `<b>${n}</b> întrebări disponibile${n < cfg.n ? ` — testul va avea <b>${n}</b>` : ''}.`;
    $('#qStart').disabled = n === 0;
  }

  // ---------- Test ----------
  function start() {
    setPref('quiz', { ...cfg });
    const picked = shuffle(pool()).slice(0, cfg.n);
    // la „Toate nivelurile”, întrebările urcă treptat în dificultate
    if (!cfg.lvl) picked.sort((a, b) => a.lvl - b.lvl);
    qs = picked.map(x => {
      const opts = shuffle([x.right, ...x.wrong]);
      return { ...x, opts, right: opts.indexOf(x.right) };
    });
    i = 0; score = 0; log = [];
    panel.innerHTML = `
      <div class="lab-head">
        <div><h2>Test: ${cfg.ch ? esc(chName(cfg.ch)) : 'toate capitolele'}</h2><p>Nivel: <b>${cfg.lvl ? LEVELS[cfg.lvl] : 'toate nivelurile'}</b> • ${qs.length} întrebări</p></div>
        <div class="score-pill">Cel mai bun rezultat: <b>${prefs.bestPct || 0}%</b></div>
      </div>
      <div class="card quiz"><div class="progress"><i id="qBar" style="width:0"></i></div><div id="qBody"></div></div>`;
    show();
  }

  function show() {
    locked = false;
    const q = qs[i];
    $('#qBar').style.width = i / qs.length * 100 + '%';
    $('#qBody').innerHTML = `
      <div class="q-meta">
        <span>Întrebarea ${i + 1} din ${qs.length} • Cap. ${q.ch} <span class="lvl-tag l${q.lvl}">${LEVELS[q.lvl]}</span></span>
        <span>Scor: ${score}</span>
      </div>
      <p class="q-text">${q.q}</p>
      <div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}"><kbd>${k + 1}</kbd><span>${o}</span></button>`).join('')}</div>
      <div id="qAfter"></div>`;
  }

  function answer(k) {
    if (locked) return;
    locked = true;
    const q = qs[i];
    const ok = k === q.right;
    const btns = panel.querySelectorAll('.opt');
    btns.forEach(b => { b.disabled = true; });
    btns[q.right].classList.add('right');
    if (ok) { score++; sfx('ok'); }
    else { btns[k].classList.add('wrong'); sfx('bad'); }
    log.push({ q, ok, picked: k });
    $('#qAfter').innerHTML = `
      <div class="explain">${ok ? '<b>Corect!</b> ' : '<b>Greșit.</b> '}${esc(q.ex)}</div>
      <div class="q-nav">
        <button class="btn btn-ghost" id="qQuit">Oprește testul</button>
        <button class="btn btn-primary" id="qNext">${i + 1 < qs.length ? 'Următoarea ›' : 'Vezi rezultatul'}</button>
      </div>`;
    $('#qBar').style.width = (i + 1) / qs.length * 100 + '%';
    $('#qNext').focus({ preventScroll: true });
  }

  function finish() {
    const total = log.length;
    const pct = total ? score / total : 0;
    const pc = Math.round(pct * 100);
    const C = 2 * Math.PI * 70;
    // recordul contează doar pentru teste de cel puțin 5 întrebări terminate
    const record = total >= 5 && total === qs.length && pc > (prefs.bestPct || 0);
    if (record) setPref('bestPct', pc);
    const msg = pct === 1 ? 'Perfect! Stăpânești unitățile de măsură.' : pct >= 0.7 ? 'Foarte bine! Mai recitește capitolele unde ai greșit.' : pct >= 0.4 ? 'Bun început. Exersează în laboratoare și reia testul.' : 'Recitește teoria și încearcă din nou — vei vedea progresul!';

    const byCh = CHAPTERS.map(c => {
      const items = log.filter(x => x.q.ch === c.id);
      return { ...c, cnt: items.length, ok: items.filter(x => x.ok).length };
    }).filter(c => c.cnt);
    const weak = byCh.filter(c => c.ok < c.cnt).sort((a, b) => a.ok / a.cnt - b.ok / b.cnt)[0];
    const wrong = log.filter(x => !x.ok);

    $('#qBody').innerHTML = `
      <div class="finish">
        <div class="ring"><svg viewBox="0 0 160 160"><circle class="bg" cx="80" cy="80" r="70"/><circle class="fg" id="qRing" cx="80" cy="80" r="70" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><b>${score}/${total}</b></div>
        <h3>${msg}</h3>
        <p class="muted">${pc}% răspunsuri corecte${record ? ' — <b>record personal nou!</b>' : ''}</p>
      </div>
      ${byCh.length > 1 ? `
      <h4 class="sub-h">Rezultate pe capitole</h4>
      <div class="breakdown">
        ${byCh.map((c, k) => `
          <div class="bd-row">
            <span>${c.id}. ${esc(c.n)}</span>
            <div class="bd-bar"><i style="--w:${c.ok / c.cnt * 100}%;animation-delay:${k * 0.08}s"></i></div>
            <b>${c.ok}/${c.cnt}</b>
          </div>`).join('')}
      </div>` : ''}
      ${wrong.length ? `
      <h4 class="sub-h">De revăzut (${wrong.length})</h4>
      <ol class="review">
        ${wrong.map(x => `<li><p>${x.q.q}</p><div><span class="r-bad">Ai ales: ${x.q.opts[x.picked]}</span><span class="r-ok">Corect: ${x.q.opts[x.q.right]}</span></div><small>${esc(x.q.ex)}</small></li>`).join('')}
      </ol>` : ''}
      <div class="actions" style="justify-content:center;margin-top:1.2rem">
        <button class="btn btn-primary" id="qAgain">Încă un test</button>
        <button class="btn btn-outline" id="qSetup">Schimbă capitolul / nivelul</button>
        ${weak ? `<button class="btn btn-outline" data-review-ch="${weak.id}">Recitește cap. ${weak.id}</button>` : ''}
      </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { $('#qRing').style.strokeDashoffset = C * (1 - pct); }));
    if (pct >= 0.8 && total >= 5) { sfx('win'); confetti(); } else sfx('swap');
  }

  panel.addEventListener('click', e => {
    const t = e.target;
    const opt = t.closest('.opt');
    if (opt) return answer(Number(opt.dataset.k));
    if (t.closest('#qNext')) { i++; sfx('click'); return i < qs.length ? show() : finish(); }
    if (t.closest('#qQuit')) { sfx('click'); return finish(); }
    if (t.closest('#qStart') || t.closest('#qAgain')) { sfx('click'); return start(); }
    if (t.closest('#qSetup')) { sfx('click'); return setup(); }
    const rc = t.closest('[data-review-ch]');
    if (rc) { window.dispatchEvent(new CustomEvent('praxis-chapter', { detail: rc.dataset.reviewCh })); return; }
    const b = t.closest('[data-ch], [data-lvl], [data-n]');
    if (b && panel.querySelector('.quiz-setup')) {
      if (b.dataset.ch !== undefined) cfg.ch = Number(b.dataset.ch);
      if (b.dataset.lvl !== undefined) cfg.lvl = Number(b.dataset.lvl);
      if (b.dataset.n !== undefined) cfg.n = Number(b.dataset.n);
      sfx('tick');
      syncSetup();
    }
  });
  document.addEventListener('keydown', e => {
    if (panel.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, select, dialog[open]')) return;
    if (/^[1-4]$/.test(e.key) && panel.querySelector('.opt:not(:disabled)')) answer(Number(e.key) - 1);
  });

  setup();
}
