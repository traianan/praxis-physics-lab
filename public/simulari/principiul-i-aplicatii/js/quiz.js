/* ==========================================================================
   quiz.js — 12 întrebări de verificare pentru subcapitolul 1.4
   Tipuri: mc (grilă) și num (răspuns numeric cu toleranță).
   ========================================================================== */
(function (global) {
  'use strict';

  var Q = global.PraxisApplicationsLocales.ro.questions.map(function(q,i){ var row=Object.assign({},q);delete row.text;row.ro=q.text;row.en=global.PraxisApplicationsLocales.en.questions[i].text;return row; });

  var idx = 0, score = 0, answered = false, picks = [];

  function lang() { return global.I18N.lang; }
  function el(id) { return document.getElementById(id); }

  function renderQuestion() {
    var q = Q[idx], L = q[lang()], body = el('quizBody');
    answered = false;
    el('quizIdx').textContent = idx + 1;
    el('quizTot').textContent = Q.length;
    el('quizBar').style.width = (idx / Q.length * 100) + '%';
    el('quizNext').disabled = true;

    var html = '<div class="q-card"><div class="q-tag">' + q.tag + '</div>' +
      '<div class="q-text">' + L.q + '</div>';

    if (q.type === 'mc') {
      html += '<div class="q-opts" role="radiogroup">' + L.opts.map(function (o, i) {
        return '<label><input type="radio" name="qopt" value="' + i + '" /><span>' + o + '</span></label>';
      }).join('') + '</div>';
    } else {
      html += '<div class="q-num"><div class="row"><input type="number" step="any" id="qAns" aria-label="' + (lang() === 'ro' ? 'Răspuns numeric' : 'Numeric answer') + '" placeholder="' +
        (lang() === 'ro' ? 'valoarea' : 'the value') + '" /><span class="unit">' + q.unit + '</span></div>' +
        '<div class="small">' + (lang() === 'ro' ? 'Toleranță ±' + Math.round(q.tol * 100) + ' %.' : 'Tolerance ±' + Math.round(q.tol * 100) + ' %.') + '</div></div>';
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
    var q = Q[idx], L = q[lang()], fb = el('qFb'), correct = false, given = null;

    if (q.type === 'mc') {
      var sel = document.querySelector('input[name=qopt]:checked');
      if (!sel) { showFb(fb, 'no', global.I18N.t('quiz.need'), ''); global.Sound.play('no'); return; }
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
      if (isNaN(given)) { showFb(fb, 'no', global.I18N.t('quiz.need'), ''); global.Sound.play('no'); return; }
      correct = Math.abs(given - q.ok) <= Math.abs(q.ok) * q.tol;
      inp.disabled = true;
    }

    answered = true;
    if (correct) { score += 1; el('quizScore').textContent = score; }
    picks[idx] = correct;
    showFb(fb, correct ? 'ok' : 'no',
      (correct ? global.I18N.t('quiz.correct') : global.I18N.t('quiz.wrong')) +
      (correct ? '' : ' ' + (lang() === 'ro' ? 'Răspuns corect: ' : 'Correct answer: ') +
        (q.type === 'mc' ? L.opts[q.ok] : global.Util.num(q.ok, q.ok < 10 ? 2 : 0) + ' ' + q.unit)),
      L.why);
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
      '<h3>' + global.I18N.t('quiz.result') + ' · ' + pct + ' %</h3><p>' + global.I18N.t(msg) + '</p>' +
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
      var selected=document.querySelector('input[name=qopt]:checked'),number=el('qAns');
      var value=selected?selected.value:number?number.value:null,wasAnswered=answered,oldScore=score,done=!el('quizResult').hidden;
      renderQuestion();
      if(value!==null){var input=Q[idx].type==='mc'?document.querySelector('input[name=qopt][value="'+value+'"]'):el('qAns');if(input){if(Q[idx].type==='mc')input.checked=true;else input.value=value;}}
      if(wasAnswered){check();score=oldScore;el('quizScore').textContent=score;}
      if(done)finish();
    });
  }

  global.Quiz = { init: init, count: function () { return Q.length; } };
})(window);
