/* =========================================================
   Condensatorul — logica paginii de teorie
   calculator + grafic RC animat + quiz + cuprins activ
   ========================================================= */
(function () {
  'use strict';

  var E0 = 8.854187817e-12;

  /* ---------------- tab-uri generice ---------------- */
  document.querySelectorAll('[data-calc-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-calc-mode]').forEach(function (b) {
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      var mode = btn.getAttribute('data-calc-mode');
      ['plan', 'rc', 'energie'].forEach(function (m) {
        var el = document.getElementById({plan:'calcPlan',rc:'calcRC',energie:'calcEnergie'}[m]);
        if (el) el.hidden = m !== mode;
      });
    });
  });

  /* ---------------- calculator: condensator plan ---------------- */
  var cArie = document.getElementById('cArie');
  var cDist = document.getElementById('cDist');
  var cEps = document.getElementById('cEps');

  function fmtRo(n, d) {
    return n.toFixed(d).replace('.', ',');
  }

  function updatePlan() {
    if (!cArie || !cDist || !cEps) return;
    var S = parseFloat(cArie.value) * 1e-4;      /* cm² → m² */
    var d = parseFloat(cDist.value) * 1e-3;      /* mm → m */
    var er = parseFloat(cEps.value);
    var C = E0 * er * S / d;
    var E = 100 / d;                              /* V/m pentru 100 V */

    document.getElementById('cArieVal').textContent = fmtRo(parseFloat(cArie.value), 0) + ' cm²';
    document.getElementById('cDistVal').textContent = fmtRo(parseFloat(cDist.value), 2) + ' mm';
    document.getElementById('cEpsVal').textContent = fmtRo(er, 2);
    document.getElementById('outC').textContent = window.siFormat(C, 'F', 3);
    document.getElementById('outE').textContent = window.siFormat(E, 'V/m', 3);
  }
  [cArie, cDist, cEps].forEach(function (el) {
    if (el) el.addEventListener('input', updatePlan);
  });
  updatePlan();

  /* ---------------- calculator: RC ---------------- */
  var rcR = document.getElementById('rcR');
  var rcC = document.getElementById('rcC');
  function updateRC() {
    if (!rcR || !rcC) return;
    var R = parseFloat(rcR.value) * 1e3;
    var C = parseFloat(rcC.value) * 1e-6;
    var tau = R * C;
    document.getElementById('rcRVal').textContent = window.siFormat(R, 'Ω', 3);
    document.getElementById('rcCVal').textContent = window.siFormat(C, 'F', 3);
    document.getElementById('outTau').textContent = window.siFormat(tau, 's', 3);
    document.getElementById('out5Tau').textContent = window.siFormat(tau * 5, 's', 3);
    document.getElementById('out63').textContent = '63,2 %';
    document.getElementById('out95').textContent = '95,0 %';
  }
  [rcR, rcC].forEach(function (el) { if (el) el.addEventListener('input', updateRC); });
  updateRC();

  /* ---------------- calculator: energie ---------------- */
  var enC = document.getElementById('enC');
  var enU = document.getElementById('enU');
  function updateEn() {
    if (!enC || !enU) return;
    var C = parseFloat(enC.value) * 1e-6;
    var U = parseFloat(enU.value);
    var W = C * U * U / 2;
    var Q = C * U;
    document.getElementById('enCVal').textContent = window.siFormat(C, 'F', 3);
    document.getElementById('enUVal').textContent = U + ' V';
    document.getElementById('outW').textContent = window.siFormat(W, 'J', 3);
    document.getElementById('outQ').textContent = window.siFormat(Q, 'C', 3);
  }
  [enC, enU].forEach(function (el) { if (el) el.addEventListener('input', updateEn); });
  updateEn();

  /* ---------------- grafic RC animat ---------------- */
  var rcCanvas = document.getElementById('rcCanvas');
  if (rcCanvas) {
    var rctx = rcCanvas.getContext('2d');
    var RCW = 820, RCH = 340;
    var mode = 'charge';
    var t0 = performance.now();
    var DURATION = 3200;

    function fit() {
      var cssW = rcCanvas.clientWidth; if(!cssW)return;
      var cssH = Math.max(180,Math.min(260,cssW * (RCH / RCW)));
      var dpr = window.PraxisCanvasResolution?.ratio(cssW,cssH)||2;
      rcCanvas.width = Math.round(cssW * dpr);
      rcCanvas.height = Math.round(cssH * dpr);
      rcCanvas.style.height = cssH + 'px';
      rcCanvas._dpr = dpr;
      rcCanvas._w = cssW;
      rcCanvas._h = cssH;
    }
    fit();
    window.addEventListener('resize', fit);

    function resetAnim() { t0 = performance.now(); }

    document.querySelectorAll('[data-rc-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-rc-mode]').forEach(function (x) {
          x.setAttribute('aria-selected', x === b ? 'true' : 'false');
        });
        mode = b.getAttribute('data-rc-mode');
        resetAnim();
      });
    });
    var replay = document.getElementById('rcReplay');
    if (replay) replay.addEventListener('click', resetAnim);

    var previous=performance.now();
    function drawRC(now) {
      var delta=now-previous;previous=now;
      if(document.hidden||!rcCanvas.getClientRects().length){t0+=delta;requestAnimationFrame(drawRC);return;}
      var w = rcCanvas._w || RCW;
      var h = rcCanvas._h || RCH;
      var dpr = rcCanvas._dpr || 1;
      var c = rctx;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);

      var padL = 46, padR = 18, padT = 20, padB = 34;
      var plotW = w - padL - padR;
      var plotH = h - padT - padB;

      /* progres 0..1 pe 5τ */
      var p = Math.min(1, (now - t0) / DURATION);
      var tMax = 5;                      /* 5τ */
      var tNow = p * tMax;

      /* axa */
      c.strokeStyle = 'rgba(255,255,255,0.09)';
      c.lineWidth = 1;
      c.font = '500 10px Inter, system-ui, sans-serif';
      c.fillStyle = 'rgba(147,162,196,0.85)';
      c.textAlign = 'center';
      for (var k = 0; k <= 5; k++) {
        var x = padL + plotW * (k / tMax);
        c.beginPath();
        c.moveTo(x, padT);
        c.lineTo(x, padT + plotH);
        c.stroke();
        c.fillText(k + 'τ', x, padT + plotH + 16);
      }
      for (var v = 0; v <= 1.0001; v += 0.25) {
        var y = padT + plotH * (1 - v);
        c.beginPath();
        c.moveTo(padL, y);
        c.lineTo(padL + plotW, y);
        c.stroke();
        c.textAlign = 'right';
        c.fillText(Math.round(v * 100) + '%', padL - 8, y + 3);
      }

      /* asimptota */
      c.save();
      c.setLineDash([5, 6]);
      c.strokeStyle = 'rgba(255,182,77,0.75)';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(padL, mode==='charge'?padT:padT+plotH);
      c.lineTo(padL + plotW, mode==='charge'?padT:padT+plotH);
      c.stroke();
      c.restore();

      /* curba completă (ghost) */
      function curve(t) {
        return mode === 'charge' ? 1 - Math.exp(-t) : Math.exp(-t);
      }
      c.save();
      c.strokeStyle = 'rgba(62,230,210,0.18)';
      c.lineWidth = 1.6;
      c.beginPath();
      for (var s = 0; s <= 200; s++) {
        var tt = (s / 200) * tMax;
        var yy = padT + plotH * (1 - curve(tt));
        var xx = padL + plotW * (s / 200);
        if (s === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy);
      }
      c.stroke();
      c.restore();

      /* curba desenată până la tNow */
      var grad = c.createLinearGradient(padL, 0, padL + plotW, 0);
      grad.addColorStop(0, '#3ee6d2');
      grad.addColorStop(1, '#8c7bff');
      c.save();
      c.strokeStyle = grad;
      c.lineWidth = 2.8;
      c.lineCap = 'round';
      c.shadowColor = 'rgba(62,230,210,0.6)';
      c.shadowBlur = 14;
      c.beginPath();
      var steps = Math.max(2, Math.round(200 * p));
      for (var i = 0; i <= steps; i++) {
        var t2 = (i / 200) * tMax;
        var y2 = padT + plotH * (1 - curve(t2));
        var x2 = padL + plotW * (i / 200);
        if (i === 0) c.moveTo(x2, y2); else c.lineTo(x2, y2);
      }
      c.stroke();
      c.restore();

      /* punctul curent */
      var cx = padL + plotW * (tNow / tMax);
      var cy = padT + plotH * (1 - curve(tNow));
      c.save();
      c.fillStyle = '#ffffff';
      c.shadowColor = '#3ee6d2';
      c.shadowBlur = 18;
      c.beginPath();
      c.arc(cx, cy, 5.5, 0, Math.PI * 2);
      c.fill();
      c.restore();

      /* marker τ = 1 */
      var xTau = padL + plotW * (1 / tMax);
      var yTau = padT + plotH * (1 - curve(1));
      c.save();
      c.setLineDash([3, 4]);
      c.strokeStyle = 'rgba(147,162,196,0.55)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(xTau, padT + plotH);
      c.lineTo(xTau, yTau);
      c.lineTo(padL, yTau);
      c.stroke();
      c.restore();
      c.fillStyle = 'rgba(238,243,255,0.85)';
      c.font = '600 10px Inter, system-ui, sans-serif';
      c.textAlign = 'left';
      var pctTau = Math.round(curve(1) * 1000) / 10;
      c.fillText(mode === 'charge' ? '63,2 %' : '36,8 %', xTau + 6, yTau - 8);

      /* valoare curentă */
      c.save();
      c.fillStyle = 'rgba(62,230,210,0.95)';
      c.font = '600 12px Sora, Inter, sans-serif';
      c.textAlign = 'right';
      c.fillText('t = ' + (tNow).toFixed(2) + 'τ · U = ' + (curve(tNow) * 100).toFixed(1) + ' %', padL + plotW, padT + 14);
      c.restore();

      if (p >= 1) {
        var again = (now - t0 - DURATION) / 2400;
        if (again > 1.6) t0 = now;
      }
      requestAnimationFrame(drawRC);
    }
    requestAnimationFrame(drawRC);
  }

  /* ---------------- quiz ---------------- */
  var QUESTIONS = [
    {
      q: 'Un condensator de 220 µF este legat la 12 V. Ce sarcină are o armătură?',
      opts: ['2,64 mC', '26,4 mC', '1,83 mC', '264 µC'],
      correct: 0,
      why: 'Q = C·U = 220·10⁻⁶ F · 12 V = 2,64·10⁻³ C = 2,64 mC.'
    },
    {
      q: 'Dacă dublăm distanța dintre armăturile unui condensator plan, capacitatea…',
      opts: ['se dublează', 'se înjumătățește', 'rămâne neschimbată', 'crește de 4 ori'],
      correct: 1,
      why: 'C = ε₀ε_r·S/d — capacitatea este invers proporțională cu d, deci se înjumătățește.'
    },
    {
      q: 'Ce unitate are constanta de timp τ = R·C?',
      opts: ['farad', 'ohm', 'secundă', 'coulomb'],
      correct: 2,
      why: 'Ω · F = (V/A)·(C/V) = C/A = s. Constanta de timp se măsoară în secunde.'
    },
    {
      q: 'Un condensator de 1000 µF la 50 V stochează o energie de aproximativ:',
      opts: ['50 J', '1,25 J', '2,5 J', '25 J'],
      correct: 1,
      why: 'W = C·U²/2 = 1000·10⁻⁶ · 2500 / 2 = 1,25 J.'
    },
    {
      q: 'Trei condensatoare de 6 µF în paralel au capacitatea echivalentă:',
      opts: ['2 µF', '6 µF', '18 µF', '3 µF'],
      correct: 2,
      why: 'În paralel capacitățile se adună: 6 + 6 + 6 = 18 µF.'
    },
    {
      q: 'La încărcarea prin rezistor, curentul din circuit…',
      opts: ['crește exponențial', 'scade exponențial spre zero', 'rămâne constant', 'crește liniar'],
      correct: 1,
      why: 'I(t) = (E/R)·e^(−t/τ). La început este maxim, apoi scade spre zero pe măsură ce condensatorul se încarcă.'
    },
    {
      q: 'După câte constante de timp condensatorul este practic încărcat complet?',
      opts: ['1 τ', '2 τ', '5 τ', '10 τ'],
      correct: 2,
      why: 'După 5τ tensiunea atinge 99,3 % din valoarea finală — în practică, încărcare completă.'
    }
  ];

  var body = document.getElementById('quizBody');
  var scoreRing = document.getElementById('scoreRing');
  var scoreText = document.getElementById('scoreText');
  var quizMsg = document.getElementById('quizMsg');
  var answered = 0, correctCount = 0, answeredFlags = [];

  function renderQuiz() {
    if (!body) return;
    answered = 0; correctCount = 0; answeredFlags = QUESTIONS.map(function () { return false; });
    body.innerHTML = '';
    QUESTIONS.forEach(function (item, qi) {
      var wrap = document.createElement('div');
      wrap.className = 'quiz-q';
      var p = document.createElement('p');
      p.textContent = (qi + 1) + '. ' + item.q;
      wrap.appendChild(p);

      var opts = document.createElement('div');
      opts.className = 'quiz-opts';
      item.opts.forEach(function (text, oi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-opt';
        b.setAttribute('data-q', qi);
        b.setAttribute('data-o', oi);
        b.innerHTML = '<span class="key">' + 'ABCD'[oi] + '</span><span>' + window.esc(text) + '</span>';
        b.addEventListener('click', function () { answer(qi, oi, wrap); });
        opts.appendChild(b);
      });
      wrap.appendChild(opts);

      var fb = document.createElement('p');
      fb.className = 'quiz-fb';
      fb.setAttribute('data-fb', qi);
      wrap.appendChild(fb);
      body.appendChild(wrap);
    });
    updateScore();
    if (quizMsg) quizMsg.textContent = 'Răspunde la întrebări pentru a-ți vedea scorul.';
  }

  function answer(qi, oi, wrap) {
    if (answeredFlags[qi]) return;
    answeredFlags[qi] = true;
    answered++;
    var item = QUESTIONS[qi];
    var isRight = oi === item.correct;
    if (isRight) correctCount++;

    wrap.querySelectorAll('.quiz-opt').forEach(function (b, idx) {
      b.classList.add('locked');
      if (idx === item.correct) b.classList.add('correct');
      else if (idx === oi) b.classList.add('wrong');
      b.disabled = true;
    });
    var fb = wrap.querySelector('.quiz-fb');
    if (fb) {
      fb.textContent = (isRight ? '✔ Corect. ' : '✕ Nu chiar. ') + item.why;
      fb.style.color = isRight ? '#8affd0' : '#ffb7c6';
      fb.classList.add('show');
    }
    if (window.CondSound) {
      if (isRight) window.CondSound.correct(); else window.CondSound.wrong();
    }
    updateScore();
  }

  function updateScore() {
    if (!scoreRing) return;
    scoreText.textContent = correctCount + '/' + QUESTIONS.length;
    scoreRing.style.setProperty('--score', (correctCount / QUESTIONS.length) * 100);
    if (quizMsg) {
      if (answered < QUESTIONS.length) {
        quizMsg.textContent = 'Ai răspuns la ' + answered + ' din ' + QUESTIONS.length + ' întrebări.';
      } else if (correctCount === QUESTIONS.length) {
        quizMsg.textContent = '🏆 Perfect! Stăpânești condensatorul. Treci la laborator.';
        if (window.CondSound) window.CondSound.chime();
      } else if (correctCount >= 5) {
        quizMsg.textContent = 'Foarte bine! Recitește capitolele la care ai greșit.';
      } else {
        quizMsg.textContent = 'Mai exersează — recitește secțiunile 2, 3 și 6.';
      }
    }
  }

  var reset = document.getElementById('quizReset');
  if (reset) reset.addEventListener('click', renderQuiz);
  renderQuiz();

  /* ---------------- cuprins activ la scroll ---------------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var sections = tocLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-90px 0px -65% 0px' });
    sections.forEach(function (s) { obs.observe(s); });
  }
})();
