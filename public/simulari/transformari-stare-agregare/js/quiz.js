/* ==========================================================================
   quiz.js — 13 întrebări de verificare pentru subcapitolul 1.5
   Tipuri: mc (grilă) și num (răspuns numeric cu toleranță).
   Fiecare întrebare are tag-ul paginii din manual și o explicație afișată
   după verificare, plus un semnal sonor diferit pentru corect/greșit.
   ========================================================================== */
(function (global) {
  'use strict';

  var Q=global.PraxisPhaseLocales.ro.questions.map(function(q,i){var row=Object.assign({},q);delete row.text;row.ro=q.text;row.en=global.PraxisPhaseLocales.en.questions[i].text;return row;});

  var idx = 0, score = 0, answered = false, picks = [];

  function lang() { return global.I18N.lang; }
  function el(id) { return document.getElementById(id); }
  function L(s) { return global.I18N.t(s); }

  function renderQuestion() {
    var q = Q[idx], d = q[lang()], body = el('quizBody');
    answered = false;
    el('quizIdx').textContent = idx + 1;
    el('quizTot').textContent = Q.length;
    el('quizBar').style.width = (idx / Q.length * 100) + '%';
    el('quizNext').disabled = true;

    var html = '<div class="q-card"><div class="q-tag">' + q.tag + '</div>' +
      '<div class="q-text">' + d.q + '</div>';

    if (q.type === 'mc') {
      html += '<div class="q-opts" role="radiogroup">' + d.opts.map(function (o, i) {
        return '<label><input type="radio" name="qopt" value="' + i + '" /><span>' + o + '</span></label>';
      }).join('') + '</div>';
    } else {
      html += '<div class="q-num"><div class="row"><input type="number" step="any" id="qAns" aria-label="' + (lang() === 'ro' ? 'Răspuns numeric' : 'Numeric answer') + '" placeholder="' +
        L('quiz.placeholder') + '" /><span class="unit">' + (q.unit || '') + '</span></div>' +
        '<div class="small">' + L('quiz.tol') + Math.round(q.tol * 100) + ' %.</div></div>';
    }
    html += '<div class="q-fb" id="qFb"></div></div>';
    body.innerHTML = html;

    var inputs = body.querySelectorAll('input[name=qopt]');
    Array.prototype.forEach.call(inputs, function (inp) {
      inp.addEventListener('change', function () {
        global.Sound.play('click');
        Array.prototype.forEach.call(inputs, function (o) { o.checked = false; });
        inp.checked = true;
      });
    });
    var num = el('qAns');
    if (num) num.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  }

  function check() {
    if (answered) { next(); return; }
    var q = Q[idx], d = q[lang()], fb = el('qFb'), correct = false, given = null;

    if (q.type === 'mc') {
      var sel = document.querySelector('input[name=qopt]:checked');
      if (!sel) { showFb(fb, 'no', L('quiz.need'), ''); global.Sound.play('no'); return; }
      given = +sel.value;
      correct = given === q.ok;
      var labels = document.querySelectorAll('.q-opts label');
      Array.prototype.forEach.call(labels, function (lb, i) {
        lb.classList.add('locked');
        if (i === q.ok) lb.classList.add('right');
        else if (i === given) lb.classList.add('wrong');
      });
    } else {
      var inp = el('qAns');
      given = parseFloat(String(inp.value).replace(',', '.'));
      if (isNaN(given)) { showFb(fb, 'no', L('quiz.need'), ''); global.Sound.play('no'); return; }
      correct = q.ok === 0 ? Math.abs(given) <= q.tol : Math.abs(given - q.ok) <= Math.abs(q.ok) * q.tol;
      inp.disabled = true;
    }

    answered = true;
    if (correct) { score += 1; el('quizScore').textContent = score; }
    picks[idx] = correct;
    showFb(fb, correct ? 'ok' : 'no',
      (correct ? L('quiz.correct') : L('quiz.wrong')) +
      (correct ? '' : ' ' + L('quiz.answer') + ' ' +
        (q.type === 'mc' ? d.opts[q.ok] : global.Util.num(q.ok, Math.abs(q.ok) < 10 ? 3 : 0) + (q.unit ? ' ' + q.unit : ''))),
      d.why);
    global.Sound.play(correct ? 'ok' : 'no');
    el('quizNext').disabled = false;
    el('quizBar').style.width = ((idx + 1) / Q.length * 100) + '%';
  }

  function showFb(node, kind, title, why) {
    node.className = 'q-fb show ' + kind;
    node.innerHTML = '<b>' + title + '</b>' + (why ? '<span>' + why + '</span>' : '');
  }

  function next() {
    if (idx < Q.length - 1) { idx++; renderQuestion(); }
    else finish();
  }

  function finish() {
    var pct = Math.round(score / Q.length * 100);
    var msg = pct >= 85 ? 'quiz.great' : pct >= 60 ? 'quiz.good' : 'quiz.low';
    var res = el('quizResult');
    res.hidden = false;
    res.innerHTML = '<div class="grade">' + score + ' / ' + Q.length + '</div>' +
      '<h3>' + L('quiz.result') + ' · ' + pct + ' %</h3><p>' + L(msg) + '</p>' +
      '<ul>' + Q.map(function (q, i) {
        return '<li class="' + (picks[i] ? 'ok' : 'no') + '">' + (i + 1) + (picks[i] ? ' ✓' : ' ✕') + '</li>';
      }).join('') + '</ul>';
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    global.Sound.play(pct >= 60 ? 'win' : 'lose');
    el('quizNext').disabled = true;
  }

  function restart() {
    idx = 0; score = 0; picks = []; answered = false;
    el('quizScore').textContent = '0';
    el('quizResult').hidden = true;
    renderQuestion();
  }

  function init() {
    el('quizCheck').addEventListener('click', check);
    el('quizNext').addEventListener('click', function () { global.Sound.play('click'); next(); });
    el('quizRestart').addEventListener('click', function () { global.Sound.play('click'); restart(); });
    renderQuestion();
    document.addEventListener('languagechange', function () {
      /* păstrează progresul, doar rescrie textul întrebării curente */
      var selected=document.querySelector('input[name=qopt]:checked'),number=el('qAns');var value=selected?selected.value:number?number.value:null,wasAnswered=answered,oldScore=score,done=!el('quizResult').hidden;renderQuestion();if(value!==null){var input=Q[idx].type==='mc'?document.querySelector('input[name=qopt][value="'+value+'"]'):el('qAns');if(input){if(Q[idx].type==='mc')input.checked=true;else input.value=value;}}if(wasAnswered){check();score=oldScore;el('quizScore').textContent=score;}if(done)finish();
    });
  }

  global.Quiz = { init: init, count: function () { return Q.length; } };
})(window);
