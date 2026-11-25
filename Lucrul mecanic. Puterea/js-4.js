
  /* ============================================================
     EVALUARE — 8 questions with instant feedback
     ============================================================ */
  const QUESTIONS = [
    {
      q: 'O forță de <b>20 N</b> trage un corp pe <b>10 m</b>, sub un unghi de <b>60°</b> față de deplasare. Lucrul mecanic al forței este:',
      opts: ['200 J', '100 J', '173 J', '0 J'],
      correct: 1,
      explain: '<b>L = F · d · cos α = 20 · 10 · 0,5 = 100 J.</b> Doar componenta orizontală, F cos α = 10 N, contribuie la lucru; componenta perpendiculară are lucru nul.'
    },
    {
      q: 'Forța normală exercitată de sol asupra unui corp care alunecă pe o suprafață orizontală efectuează un lucru mecanic:',
      opts: ['pozitiv', 'negativ', 'nul', 'depinde de masă'],
      correct: 2,
      explain: '<b>Nul.</b> Normala este perpendiculară pe deplasare (α = 90°), iar cos 90° = 0. Ea susține corpul, dar nu îl deplasează pe direcția ei.'
    },
    {
      q: 'Un corp de <b>2 kg</b> cade liber pe o distanță de <b>3 m</b>. Lucrul mecanic al greutății este (g = 10 m/s²):',
      opts: ['−60 J', '+60 J', '0 J', '+6 J'],
      correct: 1,
      explain: '<b>L = m g h = 2 · 10 · 3 = +60 J.</b> La coborâre, greutatea are aceeași direcție și sens cu deplasarea, deci lucrul este pozitiv (motor).'
    },
    {
      q: 'Care dintre următoarele forțe este <b>conservativă</b>?',
      opts: ['frecarea la alunecare', 'greutatea', 'forța de tracțiune', 'rezistența aerului'],
      correct: 1,
      explain: '<b>Greutatea.</b> Lucrul ei depinde doar de diferența de nivel, nu de drum; pe un drum închis, L = 0. Frecarea și tracțiunea depind de drum.'
    },
    {
      q: 'Un resort cu <b>k = 100 N/m</b> este comprimat cu <b>10 cm</b>. Lucrul mecanic al forței elastice este:',
      opts: ['−0,5 J', '+0,5 J', '−5 J', '−1 J'],
      correct: 0,
      explain: '<b>L = −½ k x² = −½ · 100 · 0,1² = −0,5 J.</b> Forța elastică se opune comprimării; lucrul exterior necesar este +0,5 J.'
    },
    {
      q: 'Un motor efectuează un lucru mecanic de <b>600 J</b> în <b>20 s</b>. Puterea sa este:',
      opts: ['30 W', '120 W', '12 W', '1200 W'],
      correct: 0,
      explain: '<b>P = L / Δt = 600 / 20 = 30 W.</b> Wattul este joule pe secundă: 30 J în fiecare secundă.'
    },
    {
      q: 'La un plan înclinat, lucrul util este <b>200 J</b>, iar lucrul consumat este <b>250 J</b>. Randamentul este:',
      opts: ['50%', '80%', '125%', '20%'],
      correct: 1,
      explain: '<b>η = L<sub>u</sub> / L<sub>c</sub> = 200 / 250 = 0,80 = 80%.</b> Restul de 50 J s-a pierdut prin frecare, în principal ca și căldură.'
    },
    {
      q: 'Aceeași lucrare mecanică este efectuată în <b>4 s</b>, respectiv în <b>8 s</b>. Raportul puterilor <b>P₁ / P₂</b> este:',
      opts: ['1/2', '1', '2', '4'],
      correct: 2,
      explain: '<b>P₁ / P₂ = (L/4) / (L/8) = 8/4 = 2.</b> La același lucru, puterea este invers proporțională cu timpul: de două ori mai repede înseamnă putere dublă.'
    }
  ];

  const quizSkeleton = `
    <div class="lm-quiz-top">
      <span id="evCount">Întrebarea 1 din 8</span>
      <div class="lm-prog" style="width:150px"><i id="evBar" style="width:0%"></i></div>
      <span id="evScore">0 corecte</span>
    </div>
    <h3 id="evQ">Se încarcă întrebarea…</h3>
    <div class="lm-opts" id="evOpts"></div>
    <div class="lm-explain" id="evExp" aria-live="polite"></div>
    <div class="lm-quiz-foot">
      <span id="evHint">Alege varianta corectă.</span>
      <button id="evNext" class="lm-btn primary" disabled>Următoarea <span aria-hidden="true">→</span></button>
    </div>`;

  let quizIdx = 0;
  let quizAnswers = [];

  function quizEls() {
    return {
      card: $('#evCard'),
      count: $('#evCount'),
      bar: $('#evBar'),
      score: $('#evScore'),
      q: $('#evQ'),
      opts: $('#evOpts'),
      exp: $('#evExp'),
      hint: $('#evHint'),
      next: $('#evNext'),
      dots: $('#evDots'),
      big: $('#evScoreBig'),
      last: $('#evLast')
    };
  }

  function updateQuizMeta() {
    const e = quizEls();
    if (!e.card || !e.count) return;
    const answered = quizAnswers.filter(v => v === true || v === false).length;
    const score = quizAnswers.filter(v => v === true).length;
    e.count.textContent = 'Întrebarea ' + (quizIdx + 1) + ' din ' + QUESTIONS.length;
    e.score.textContent = score + ' corecte';
    if (e.big) e.big.textContent = score + ' / ' + QUESTIONS.length;
    if (e.bar) e.bar.style.width = (answered / QUESTIONS.length * 100) + '%';
    if (e.last) {
      const v = quizAnswers[quizIdx];
      e.last.textContent = v === true ? 'corect' : v === false ? 'greșit' : '—';
    }
    if (e.dots) {
      e.dots.innerHTML = QUESTIONS.map((_, i) => {
        let cls = 'lm-dot';
        if (quizAnswers[i] === true) cls += ' is-ok';
        else if (quizAnswers[i] === false) cls += ' is-bad';
        if (i === quizIdx) cls += ' is-now';
        return '<span class="' + cls + '">' + (i + 1) + '</span>';
      }).join('');
    }
  }

  function renderQuestion() {
    const e = quizEls();
    if (!e.card || !e.opts) return;
    const q = QUESTIONS[quizIdx];
    e.q.innerHTML = q.q;
    e.opts.innerHTML = q.opts.map((opt, i) =>
      '<button class="lm-opt" data-i="' + i + '"><span class="ol">' + 'ABCD'[i] + '</span><span>' + opt + '</span></button>'
    ).join('');
    e.opts.querySelectorAll('.lm-opt').forEach(b => {
      b.addEventListener('click', () => answerQuestion(parseInt(b.dataset.i, 10)));
    });
    e.exp.classList.remove('is-on');
    e.exp.innerHTML = '';
    e.hint.textContent = 'Alege varianta corectă.';
    e.next.disabled = true;
    e.next.innerHTML = quizIdx === QUESTIONS.length - 1
      ? 'Vezi rezultatul <span aria-hidden="true">→</span>'
      : 'Următoarea <span aria-hidden="true">→</span>';
    updateQuizMeta();
  }

  function answerQuestion(i) {
    const e = quizEls();
    if (!e.opts || quizAnswers[quizIdx] === true || quizAnswers[quizIdx] === false) return;
    const q = QUESTIONS[quizIdx];
    const ok = i === q.correct;
    quizAnswers[quizIdx] = ok;

    e.opts.querySelectorAll('.lm-opt').forEach((b, j) => {
      b.disabled = true;
      if (j === q.correct) b.classList.add('is-correct');
      if (j === i && !ok) b.classList.add('is-wrong');
    });
    e.exp.innerHTML = '<b>' + (ok ? 'Corect.' : 'Nu chiar.') + '</b> ' + q.explain;
    e.exp.classList.add('is-on');
    e.hint.textContent = ok ? 'Răspuns corect înregistrat.' : 'Citește explicația, apoi continuă.';
    e.next.disabled = false;
    e.next.innerHTML = quizIdx === QUESTIONS.length - 1
      ? 'Vezi rezultatul <span aria-hidden="true">→</span>'
      : 'Următoarea <span aria-hidden="true">→</span>';
    updateQuizMeta();
    if (ok) sfx.good(); else sfx.bad();
  }

  function showQuizResult() {
    const e = quizEls();
    if (!e.card) return;
    const score = quizAnswers.filter(v => v === true).length;
    const pct = Math.round(score / QUESTIONS.length * 100);
    const wrong = QUESTIONS.length - score;
    const C = 2 * Math.PI * 52;
    const dash = (pct / 100 * C).toFixed(1);
    let title, msg;
    if (score === 8) {
      title = 'Impecabil.';
      msg = 'Ai stăpânit relația, semnul lucrului, forțele conservative și randamentul. Poți trece mai departe cu încredere.';
    } else if (score >= 6) {
      title = 'Foarte bine.';
      msg = 'Baza este solidă. Recitește explicațiile de la întrebările greșite și închide ultimele goluri.';
    } else if (score >= 4) {
      title = 'Bine — dar mai exersează.';
      msg = 'Relațiile sunt aproape. Reia secțiunea „Semn și cazuri” și problemele cu forță variabilă, apoi reîncearcă.';
    } else {
      title = 'Mai exersează.';
      msg = 'Întoarce-te la definiție și la semnul lucrului mecanic. Simulările din teorie te ajută să vezi de ce apare fiecare semn.';
    }

    e.card.innerHTML = `
      <div class="lm-resultview">
        <div class="lm-ring">
          <svg viewBox="0 0 118 118" aria-hidden="true">
            <circle class="ring-c" cx="59" cy="59" r="52"></circle>
            <circle class="ring-v" cx="59" cy="59" r="52" stroke-dasharray="${dash} ${C.toFixed(1)}"></circle>
          </svg>
          <b>${pct}%</b>
        </div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <div class="lm-result-chips">
          <span>${score} corecte</span><span>${wrong} greșite</span><span>${QUESTIONS.length} întrebări</span>
        </div>
        <div class="lm-result-actions">
          <button class="lm-btn primary" data-act="restart">Reia evaluarea</button>
          <button class="lm-btn" data-act="theory">Revizuiește teoria</button>
          <button class="lm-btn ghost" data-act="problems">Probleme rezolvate</button>
        </div>
      </div>`;

    const restart = $('[data-act="restart"]', e.card);
    if (restart) restart.addEventListener('click', () => { sfx.nav(); initQuiz(); });
    const theory = $('[data-act="theory"]', e.card);
    if (theory) theory.addEventListener('click', () => goto('teorie', { sub: 'def' }));
    const problems = $('[data-act="problems"]', e.card);
    if (problems) problems.addEventListener('click', () => goto('probleme', { prob: 'p1' }));

    if (score >= 6) sfx.finish(); else sfx.bad();
  }

  function initQuiz() {
    const card = $('#evCard');
    if (!card) return;
    card.innerHTML = quizSkeleton;
    quizIdx = 0;
    quizAnswers = [];
    const e = quizEls();
    if (e.next) e.next.addEventListener('click', () => {
      if (quizIdx < QUESTIONS.length - 1) {
        quizIdx++;
        sfx.nav();
        renderQuestion();
      } else {
        showQuizResult();
      }
    });
    renderQuestion();
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function syncSoundUI() {
    const btn = $('#soundBtn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    const lbl = $('#soundLbl');
    if (lbl) lbl.textContent = soundOn ? 'Sunet activ' : 'Sunet oprit';
  }

  function boot() {
    initNav();
    initT1();
    initT2();
    initT3();
    initT4();
    initT5();
    initLab1();
    initLab2();
    initCase2();
    initCase3();
    initCase4();
    initCase5();
    initProblems();
    initQuiz();
    syncSoundUI();
    $$('input[type="range"]', lesson).forEach(fillRange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
