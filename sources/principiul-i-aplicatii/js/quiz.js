/* ==========================================================================
   quiz.js — 12 întrebări de verificare pentru subcapitolul 1.4
   Tipuri: mc (grilă) și num (răspuns numeric cu toleranță).
   ========================================================================== */
(function (global) {
  'use strict';

  var Q = [
    {
      type: 'mc', tag: '1.4 · p.33',
      ro: { q: 'Într-o transformare izocoră a unui gaz ideal, care dintre mărimi este nulă?', opts: ['Variația energiei interne ΔU', 'Lucrul mecanic L_if', 'Căldura schimbată Q_if', 'Variația presiunii'], why: 'ΔV = 0 ⇒ L_if = 0, deci tot Q_if se transformă în ΔU.' },
      en: { q: 'In an isochoric transformation of an ideal gas, which quantity is zero?', opts: ['The change of internal energy ΔU', 'The mechanical work L_if', 'The exchanged heat Q_if', 'The change of pressure'], why: 'ΔV = 0 ⇒ L_if = 0, so all of Q_if becomes ΔU.' },
      ok: 1
    },
    {
      type: 'num', tag: '1.4 · p.33', unit: 'J/(mol·K)', tol: 0.06,
      ro: { q: 'Câtă este căldura molară la volum constant C_V pentru un gaz monoatomic? (R = 8,314 J/(mol·K))', why: 'C_V = (3/2)·R = 12,471 J/(mol·K).' },
      en: { q: 'What is the molar heat at constant volume C_V of a monatomic gas? (R = 8.314 J/(mol·K))', why: 'C_V = (3/2)·R = 12.471 J/(mol·K).' },
      ok: 12.47
    },
    {
      type: 'mc', tag: '1.4 · p.33',
      ro: { q: 'Care este enunțul corect al relației lui R. Mayer?', opts: ['C_p = C_V + R', 'C_V = C_p + R', 'C_p · C_V = R', 'C_p = γ · C_V'], why: 'C_p = C_V + R; de aici C_p = (5/2)R pentru un gaz monoatomic.' },
      en: { q: 'Which is the correct statement of Robert Mayer’s relation?', opts: ['C_p = C_V + R', 'C_V = C_p + R', 'C_p · C_V = R', 'C_p = γ · C_V'], why: 'C_p = C_V + R; hence C_p = (5/2)R for a monatomic gas.' },
      ok: 0
    },
    {
      type: 'mc', tag: '1.4 · p.34',
      ro: { q: 'Pentru un gaz biatomic, exponentul adiabatic γ valează:', opts: ['5/3 ≈ 1,667', '7/5 = 1,400', '3/2 = 1,500', '1,394 doar pentru orice gaz'], why: 'C_V = (5/2)R și C_p = (7/2)R, deci γ = 7/5 = 1,400.' },
      en: { q: 'For a diatomic gas, the adiabatic exponent γ equals:', opts: ['5/3 ≈ 1.667', '7/5 = 1.400', '3/2 = 1.500', '1.394 for any gas'], why: 'C_V = (5/2)R and C_p = (7/2)R, so γ = 7/5 = 1.400.' },
      ok: 1
    },
    {
      type: 'num', tag: 'Ex. 1.4.1 · p.34', unit: 'J/(kg·K)', tol: 0.03,
      ro: { q: 'Oxigen: m = 2 kg, ΔT = 5 K, Q = 9,16 kJ la presiune constantă. Care este căldura specifică izobară c_p?', why: 'c_p = Q/(m·ΔT) = 9160/(2·5) = 916 J/(kg·K).' },
      en: { q: 'Oxygen: m = 2 kg, ΔT = 5 K, Q = 9.16 kJ at constant pressure. What is the isobaric specific heat c_p?', why: 'c_p = Q/(m·ΔT) = 9160/(2·5) = 916 J/(kg·K).' },
      ok: 916
    },
    {
      type: 'num', tag: 'Ex. 1.4.1 · p.34', unit: 'kJ', tol: 0.06,
      ro: { q: 'La problema de mai sus, care este variația energiei interne ΔU, știind că L = 2,598 kJ?', why: 'ΔU = Q − L = 9,16 − 2,598 = 6,56 kJ.' },
      en: { q: 'In the problem above, what is ΔU if L = 2.598 kJ?', why: 'ΔU = Q − L = 9.16 − 2.598 = 6.56 kJ.' },
      ok: 6.56
    },
    {
      type: 'mc', tag: 'p.35',
      ro: { q: 'Care expresie a lucrului mecanic corespunde transformării izoterme?', opts: ['L = p·(V_f − V_i)', 'L = νR(T_f − T_i)', 'L = νRT·ln(V_f/V_i)', 'L = −νC_V(T_f − T_i)'], why: 'La T constant, p = νRT/V, iar integrala dă logaritmul natural al raportului de volume.' },
      en: { q: 'Which expression for the mechanical work belongs to the isothermal change?', opts: ['L = p·(V_f − V_i)', 'L = νR(T_f − T_i)', 'L = νRT·ln(V_f/V_i)', 'L = −νC_V(T_f − T_i)'], why: 'At constant T, p = νRT/V and the integral yields the natural logarithm of the volume ratio.' },
      ok: 2
    },
    {
      type: 'num', tag: 'Ex. 1.4.2 · p.35 (corectat)', unit: 'J', tol: 0.05,
      ro: { q: 'Vas rigid: m = 1 g oxigen, c_V = 700 J/(kg·K), T₁ = 300,15 K, p₁ = 100 kPa → p₂ = 200 kPa. Câtă este căldura Q corectă?', why: 'Q = m·c_V·T₁·(p₂/p₁ − 1) = 0,7·300,15·1 ≈ 210 J. Manualul înmulțește eronat cu 2 și obține 420,2 J.' },
      en: { q: 'Rigid vessel: m = 1 g oxygen, c_V = 700 J/(kg·K), T₁ = 300.15 K, p₁ = 100 kPa → p₂ = 200 kPa. What is the correct heat Q?', why: 'Q = m·c_V·T₁·(p₂/p₁ − 1) = 0.7·300.15·1 ≈ 210 J. The textbook multiplies wrongly by 2 and gets 420.2 J.' },
      ok: 210
    },
    {
      type: 'mc', tag: 'p.36',
      ro: { q: 'De ce adiabata este mai înclinată decât izoterma în coordonate (p, V)?', opts: ['Pentru că temperatura scade întotdeauna', 'Pentru că γ > 1, deci presiunea variază mai rapid cu V', 'Pentru că volumul rămâne constant', 'Pentru că Q = ΔU'], why: 'p ∝ V^(−γ) față de p ∝ V^(−1); cum γ > 1, adiabata coboară mai abrupt, iar cele două curbe se taie într-un singur punct.' },
      en: { q: 'Why is the adiabat steeper than the isotherm in (p, V) coordinates?', opts: ['Because the temperature always falls', 'Because γ > 1, so pressure varies faster with V', 'Because the volume stays constant', 'Because Q = ΔU'], why: 'p ∝ V^(−γ) versus p ∝ V^(−1); since γ > 1 the adiabat drops faster and the two curves meet at a single point.' },
      ok: 1
    },
    {
      type: 'mc', tag: 'Tabelul 1.4.2 · p.36',
      ro: { q: 'Care este corespondența corectă pentru transformarea adiabatică?', opts: ['Q = νC_pΔT, L = 0', 'Q = 0, L = −νC_V(T_f − T_i)', 'ΔU = 0, Q = L', 'L = νR(T_f − T_i), Q = 0'], why: 'Q_if = 0, deci L_if = −ΔU = −νC_V(T_f − T_i).' },
      en: { q: 'Which correspondence is correct for the adiabatic transformation?', opts: ['Q = νC_pΔT, L = 0', 'Q = 0, L = −νC_V(T_f − T_i)', 'ΔU = 0, Q = L', 'L = νR(T_f − T_i), Q = 0'], why: 'Q_if = 0, therefore L_if = −ΔU = −νC_V(T_f − T_i).' },
      ok: 1
    },
    {
      type: 'num', tag: 'Ex. 1.4.4 · p.37', unit: 'J', tol: 0.12,
      ro: { q: 'Destindere adiabatică: p₁ = 1 bar, V₁ = 10 cm³ → V₂ = 20 cm³, γ = 1,4. Cât este lucrul mecanic L?', why: 'L = p₁V₁·[1 − (V₁/V₂)^(γ−1)]/(γ−1) = 1·(1 − 0,7579)/0,4 ≈ 0,6 J.' },
      en: { q: 'Adiabatic expansion: p₁ = 1 bar, V₁ = 10 cm³ → V₂ = 20 cm³, γ = 1.4. What is the work L?', why: 'L = p₁V₁·[1 − (V₁/V₂)^(γ−1)]/(γ−1) = 1·(1 − 0.7579)/0.4 ≈ 0.6 J.' },
      ok: 0.6
    },
    {
      type: 'mc', tag: '1.4.1 · p.38',
      ro: { q: 'Într-un proces politrop pVⁿ = constant, ce proces simplu corespunde lui n → ∞?', opts: ['Izobar (p = constant)', 'Izoterm (pV = constant)', 'Adiabatic (pV^γ = constant)', 'Izocor (V = constant)'], why: 'n = 0 ⇒ izobar, n = 1 ⇒ izoterm, n = γ ⇒ adiabatic, n → ∞ ⇒ izocor.' },
      en: { q: 'In a polytropic process pVⁿ = constant, which simple process corresponds to n → ∞?', opts: ['Isobaric (p = constant)', 'Isothermal (pV = constant)', 'Adiabatic (pV^γ = constant)', 'Isochoric (V = constant)'], why: 'n = 0 ⇒ isobaric, n = 1 ⇒ isothermal, n = γ ⇒ adiabatic, n → ∞ ⇒ isochoric.' },
      ok: 3
    },
    {
      type: 'mc', tag: '1.4.1 · p.38',
      ro: { q: 'Din relația n = (C − C_p)/(C − C_V), ce înseamnă n = γ pentru căldura molară C a procesului?', opts: ['C = C_p', 'C = C_V', 'C = 0', 'C = ∞'], why: 'Pentru C = 0, n = (0 − C_p)/(0 − C_V) = C_p/C_V = γ: adiabata este politropa cu căldură molară nulă.' },
      en: { q: 'From n = (C − C_p)/(C − C_V), what does n = γ mean for the molar heat C of the process?', opts: ['C = C_p', 'C = C_V', 'C = 0', 'C = ∞'], why: 'With C = 0, n = (0 − C_p)/(0 − C_V) = C_p/C_V = γ: the adiabat is the polytrope whose molar heat vanishes.' },
      ok: 2
    }
  ];

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
      html += '<div class="q-num"><div class="row"><input type="number" step="any" id="qAns" placeholder="' +
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
      if (!answered) renderQuestion();
    });
  }

  global.Quiz = { init: init, count: function () { return Q.length; } };
})(window);
