/* ==========================================================================
   Verificare — test cu 9 întrebări, feedback imediat, scor și record local.
   ========================================================================== */
(function (global) {
  'use strict';
  var RR = global.RR;
  if (!RR) return;

  var BEST_KEY = 'rr.refractie.quiz.best.v1';

  var QUESTIONS = [
    {
      q: 'Care este enunțul principiului lui Huygens?',
      options: [
        'Fiecare punct al unui front de undă este o sursă de unde sferice secundare; înfășurătoarea lor este noul front de undă.',
        'Undele se propagă numai în linie dreaptă, iar frontul de undă nu își schimbă forma.',
        'Toate punctele mediului oscilează cu aceeași amplitudine, oricât de departe ar fi de sursă.',
        'Reflexia și refracția se produc numai la suprafața apei.'
      ],
      correct: 0,
      explain: 'Orice punct de pe frontul de undă poate fi considerat sursa unor unde sferice secundare (elementare); înfășurătoarea tuturor undelor elementare constituie noul front de undă.'
    },
    {
      q: 'Ce reprezintă înfășurătoarea undelor elementare?',
      options: [
        'Traiectoria unei singure raze de undă.',
        'Noul front de undă, la momentul următor.',
        'Suprafața de separație dintre cele două medii.',
        'Poziția sursei de oscilații.'
      ],
      correct: 1,
      explain: 'Curba tangentă la toate undele elementare, dusă în sensul de propagare, este noul front de undă.'
    },
    {
      q: 'În experiența cu fanta, dincolo de paravan unda se propagă:',
      options: [
        'tot ca o undă plană, fără nicio schimbare de formă.',
        'cu fronturi circulare, ca și cum fiecare punct al fantei ar fi o sursă.',
        'doar în lungul axei fantei, într-un fascicul îngust.',
        'deloc — paravanul oprește unda complet.'
      ],
      correct: 1,
      explain: 'Experimental se constată că, dincolo de obstacol, unda are suprafețe circulare, indiferent de forma frontului inițial: fiecare punct al fantei radiază unde elementare.'
    },
    {
      q: 'Unghiurile de incidență, de reflexie și de refracție se măsoară față de:',
      options: [
        'suprafața de separație dintre medii.',
        'normala la suprafața de separație.',
        'raza incidentă.',
        'directia de oscilație a particulelor.'
      ],
      correct: 1,
      explain: 'Toate unghiurile se măsoară față de normală. Față de suprafață s-ar obține unghiuri complementare — o confuzie frecventă.'
    },
    {
      q: 'O undă atinge suprafața sub un unghi de incidență de 40°. Unghiul dintre raza incidentă și raza reflectată este:',
      options: ['40°', '50°', '80°', '100°'],
      correct: 2,
      explain: 'Legea reflexiei dă r = i = 40°. Razele sunt de o parte și de alta a normalei, deci unghiul dintre ele este i + r = 80°.'
    },
    {
      q: 'Legea refracției se scrie:',
      options: [
        'sin i / sin r = v₂ / v₁',
        'sin i / sin r = v₁ / v₂',
        'sin i · sin r = v₁ · v₂',
        'i / r = v₁ / v₂'
      ],
      correct: 1,
      explain: 'Raportul dintre sinusul unghiului de incidență și sinusul unghiului de refracție este egal cu raportul vitezelor în cele două medii: sin i / sin r = v₁ / v₂.'
    },
    {
      q: 'Raportul n₂₁ = v₁ / v₂ se numește:',
      options: [
        'indice de refracție al mediului 2 față de mediul 1.',
        'lungime de undă redusă.',
        'unghi critic.',
        'frecvență relativă.'
      ],
      correct: 0,
      explain: 'n₂₁ = v₁/v₂ este indicele de refracție al mediului 2 față de mediul 1. Pentru o pereche de medii elastice, el este o constantă specifică.'
    },
    {
      q: 'O undă trece dintr-un mediu cu viteză mai mică într-unul cu viteză mai mare (v₂ > v₁). Raza refractată:',
      options: [
        'se apropie de normală (r < i).',
        'se depărtează de normală (r > i).',
        'nu își schimbă direcția.',
        'dispare întotdeauna.'
      ],
      correct: 1,
      explain: 'Când v₂ > v₁, din sin i / sin r = v₁ / v₂ < 1 rezultă sin r > sin i, deci r > i: raza refractată se depărtează de normală.'
    },
    {
      q: 'Reflexia totală poate apărea când:',
      options: [
        'unda trece dintr-un mediu mai rapid într-unul mai lent.',
        'unda trece dintr-un mediu mai lent într-unul mai rapid și unghiul de incidență depășește unghiul critic.',
        'unghiul de incidență este zero.',
        'cele două medii au aceeași viteză de propagare.'
      ],
      correct: 1,
      explain: 'Reflexia totală apare pentru v₂ > v₁, când i > i_c, cu sin i_c = v₁/v₂. Atunci nu mai există rază refractată, iar unda se reflectă integral.'
    }
  ];

  var state = { index: 0, score: 0, answered: false, wrong: [], finished: false };
  var quiz = document.getElementById('quiz');
  var body = document.getElementById('quizBody');
  var progressEl = document.getElementById('quizProgress');
  var track = document.getElementById('quizTrack');
  var restartBtn = document.getElementById('quizRestart');
  var bestEl = document.getElementById('quizBest');
  if (!quiz || !body) return;

  function bestScore() {
    var v = 0;
    try { v = parseInt(global.localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (e) { }
    return v;
  }
  function paintBest() {
    if (!bestEl) return;
    var b = bestScore();
    bestEl.textContent = b > 0 ? b + '/9' : '—';
    bestEl.title = b > 0 ? 'Cel mai bun scor obținut pe acest dispozitiv' : 'Nu ai un record încă';
  }

  function soundOn() { return RR.audio.enabled; }

  function renderQuestion(focusQuestion) {
    var item = QUESTIONS[state.index];
    state.answered = false;
    if (progressEl) progressEl.innerHTML = 'Întrebarea <b>' + (state.index + 1) + '</b> din ' + QUESTIONS.length;
    if (track) track.style.width = (state.index / QUESTIONS.length) * 100 + '%';

    body.innerHTML = '';
    var q = RR.el('h3', { class: 'q-text', tabindex: '-1' });
    q.textContent = item.q;
    body.appendChild(q);

    var opts = RR.el('div', { class: 'q-options', role: 'group', 'aria-label': 'Variante de răspuns' });
    item.options.forEach(function (text, i) {
      var b = RR.el('button', { type: 'button', class: 'q-option' });
      b.innerHTML = '<span class="k">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="q-option-text"></span>' +
        '<svg class="mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5 9.5 17.5 19.5 7"/></svg>';
      b.querySelector('.q-option-text').textContent = text;
      b.addEventListener('click', function () { answer(i, b, opts); });
      opts.appendChild(b);
    });
    body.appendChild(opts);

    var fb = RR.el('div', { class: 'q-feedback', id: 'qFeedback', role: 'status', tabindex: '-1' });
    body.appendChild(fb);

    var row = RR.el('div', { class: 'q-next-row' });
    body.appendChild(row);
    if (focusQuestion && q.focus) q.focus();
  }

  function answer(choice, btn, group) {
    if (state.answered) return;
    state.answered = true;
    var item = QUESTIONS[state.index];
    var ok = choice === item.correct;
    if (ok) state.score += 1; else state.wrong.push(state.index + 1);

    RR.qsa('.q-option', group).forEach(function (b, i) {
      b.disabled = true;
      if (i === item.correct) b.classList.add('is-correct');
      else if (i === choice) b.classList.add('is-wrong');
    });
    if (ok) { if (soundOn()) RR.audio.chime(); } else { if (soundOn()) RR.audio.error(); }

    var fb = document.getElementById('qFeedback');
    if (fb) {
      fb.innerHTML = '';
      var verdict = document.createElement('span');
      verdict.className = 'verdict ' + (ok ? 'ok' : 'no');
      verdict.textContent = ok ? 'corect' : 'greșit';
      var exp = document.createElement('span');
      exp.innerHTML = '<b>De ce:</b> ' + escapeHtml(item.explain);
      fb.appendChild(verdict);
      fb.appendChild(exp);
    }

    var row = body.querySelector('.q-next-row');
    if (row) {
      var next = RR.el('button', { type: 'button', class: 'btn btn--primary' });
      next.innerHTML = (state.index === QUESTIONS.length - 1 ? 'Vezi rezultatul' : 'Următoarea întrebare') +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      next.addEventListener('click', function () {
        if (state.index === QUESTIONS.length - 1) finish();
        else { state.index += 1; renderQuestion(true); }
      });
      row.appendChild(next);
    }
    /* un singur anunț: feedback-ul (role="status") primește focusul, apoi
       utilizatorul ajunge cu Tab la butonul „Următoarea întrebare” */
    if (fb && fb.focus) fb.focus();
    if (track) track.style.width = ((state.index + 1) / QUESTIONS.length) * 100 + '%';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function finish() {
    state.finished = true;
    var total = QUESTIONS.length;
    var score = state.score;
    var best = bestScore();
    if (score > best) {
      try { global.localStorage.setItem(BEST_KEY, String(score)); } catch (e) { }
      paintBest();
    }
    if (progressEl) progressEl.innerHTML = 'Rezultat';
    if (track) track.style.width = '100%';

    var verdict, advice;
    if (score === total) { verdict = 'Impecabil'; advice = 'Ai reținut principiul și ambele legi. Poți trece la exerciții mai grele.'; }
    else if (score >= 7) { verdict = 'Foarte bine'; advice = 'Ai o imagine clară a fenomenelor. Recitește doar observațiile despre reflexia totală.'; }
    else if (score >= 5) { verdict = 'Aproape'; advice = 'Reia construcția Huygens pentru reflexie și refracție, apoi întoarce-te la test.'; }
    else { verdict = 'De reluat'; advice = 'Revino la principiul lui Huygens și la exemplele de reflexie și refracție, apoi reia testul.'; }

    body.innerHTML = '';
    var wrap = RR.el('div', { class: 'q-result' });
    wrap.innerHTML =
      '<h3>' + verdict + '</h3>' +
      '<p>' + advice + '</p>' +
      '<div class="score-line"><b>' + score + ' / ' + total + '</b><span>răspunsuri corecte</span></div>' +
      (state.wrong.length
        ? '<p>Merită revăzute întrebările: <b>' + state.wrong.join(', ') + '</b>.</p>'
        : '<p>Toate răspunsurile au fost corecte.</p>');
    var row = RR.el('div', { class: 'q-next-row' });
    row.style.justifyContent = 'flex-start';
    row.style.gap = '10px';
    row.style.flexWrap = 'wrap';
    var again = RR.el('button', { type: 'button', class: 'btn btn--primary', text: 'Reia testul' });
    again.addEventListener('click', function () { reset(); });
    var back = RR.el('a', { class: 'btn btn--ghost', href: '#principiu', text: 'Reia principiul' });
    row.appendChild(again); row.appendChild(back);
    wrap.appendChild(row);
    body.appendChild(wrap);
    if (score === total && soundOn()) RR.audio.chime();
    else if (soundOn()) RR.audio.ping(520);
    if (again) again.focus();
  }

  function reset() {
    state = { index: 0, score: 0, answered: false, wrong: [], finished: false };
    renderQuestion(true);
  }

  if (restartBtn) RR.on(restartBtn, 'click', function () { if (soundOn()) RR.audio.tap(); reset(); });
  paintBest();
  renderQuestion();
})(window);
