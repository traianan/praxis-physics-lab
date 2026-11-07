/* ==========================================================================
   quiz.js — 13 întrebări de verificare pentru subcapitolul 1.5
   Tipuri: mc (grilă) și num (răspuns numeric cu toleranță).
   Fiecare întrebare are tag-ul paginii din manual și o explicație afișată
   după verificare, plus un semnal sonor diferit pentru corect/greșit.
   ========================================================================== */
(function (global) {
  'use strict';

  var Q = [
    {
      type: 'mc', tag: '1.5.1 · p.39',
      ro: { q: 'Ce se întâmplă cu temperatura unei substanțe cristaline în timpul topirii, la presiune constantă?', opts: ['Crește lent', 'Rămâne constantă', 'Scade ușor', 'Depinde de căldura specifică'], why: 'Căldura primită este „cheltuită” pentru ruperea legăturilor din rețeaua cristalină, deci energia cinetică medie — și temperatura — nu se schimbă (segmentul AB din fig. 1.5.1.1).' },
      en: { q: 'What happens to the temperature of a crystalline substance while it melts, at constant pressure?', opts: ['It rises slowly', 'It stays constant', 'It decreases slightly', 'It depends on the specific heat'], why: 'The heat received is spent on breaking the lattice bonds, so the average kinetic energy — and the temperature — do not change (segment AB of fig. 1.5.1.1).' },
      ok: 1
    },
    {
      type: 'mc', tag: '1.5.1 · p.39',
      ro: { q: 'Care este deosebirea dintre o substanță cristalină și una amorfă (smoala) la topire?', opts: ['Cea amorfă nu absoarbe căldură', 'Cea cristalină se înmoaie treptat', 'Cea amorfă nu are o temperatură precisă de topire', 'Cea cristalină fierbe înainte să se topească'], why: 'Substanțele amorfe se înmoaie treptat și devin din ce în ce mai fluide pe măsură ce temperatura crește; nu au un punct de topire.' },
      en: { q: 'What distinguishes a crystalline substance from an amorphous one (pitch) when melting?', opts: ['The amorphous one absorbs no heat', 'The crystalline one softens gradually', 'The amorphous one has no precise melting temperature', 'The crystalline one boils before melting'], why: 'Amorphous substances soften gradually and become more and more fluid as the temperature rises; they have no melting point.' },
      ok: 2
    },
    {
      type: 'num', tag: 'Ex. 1.5.1.1 · p.40', unit: 'J', tol: 0.01,
      ro: { q: 'Câtă căldură Q trebuie furnizată pentru a transforma 100 g gheață de la −10 °C în apă la 100 °C? (c_g = 2090, λ_t = 3,35·10⁵ J/kg, c_a = 4181 J/(kg·K))', why: 'Q = Q₁ + Q₂ + Q₃ = 2090 + 33 500 + 41 810 = 77 400 J. Cu λ_t = 334 kJ/kg din Tabelul 1.5.1.2 se obține însă 77 300 J — aceasta este inconsecvența semnalată în aplicație.' },
      en: { q: 'How much heat Q is needed to turn 100 g of ice at −10 °C into water at 100 °C? (c_g = 2090, λ_t = 3.35·10⁵ J/kg, c_a = 4181 J/(kg·K))', why: 'Q = Q₁ + Q₂ + Q₃ = 2090 + 33 500 + 41 810 = 77 400 J. With λ_t = 334 kJ/kg from Table 1.5.1.2 the result is 77 300 J — the inconsistency flagged in the app.' },
      ok: 77400
    },
    {
      type: 'num', tag: 'Tabelul 1.5.1.2 · p.40', unit: 'kJ', tol:
        0.02,
      ro: { q: 'Câtă căldură este necesară pentru a topi complet 2 kg de gheață la 0 °C? (λ_t = 334 kJ/kg)', why: 'Q = λ_t · m = 334 · 2 = 668 kJ, de aproape 16 ori mai mult decât cât trebuie pentru a încălzi 2 kg de gheață cu 10 K.' },
      en: { q: 'How much heat is needed to melt 2 kg of ice completely at 0 °C? (λ_t = 334 kJ/kg)', why: 'Q = λ_t · m = 334 · 2 = 668 kJ, about 16 times more than what is needed to warm 2 kg of ice by 10 K.' },
      ok: 668
    },
    {
      type: 'mc', tag: 'fig. 1.5.1.2 · p.40',
      ro: { q: 'Ce se întâmplă cu volumul gheții atunci când se topește?', opts: ['Crește, iar densitatea scade', 'Scade, iar densitatea crește', 'Rămâne neschimbat', 'Depinde de presiunea atmosferică'], why: 'Gheața este o excepție: ρ_gheață = 950 kg/m³, ρ_apă = 1000 kg/m³. De aceea, la o presiune mai mare, temperatura de topire a gheții este mai scăzută.' },
      en: { q: 'What happens to the volume of ice when it melts?', opts: ['It grows and the density falls', 'It shrinks and the density grows', 'It stays the same', 'It depends on the atmospheric pressure'], why: 'Ice is an exception: ρ_ice = 950 kg/m³, ρ_water = 1000 kg/m³. That is why a higher pressure lowers the melting temperature of ice.' },
      ok: 1
    },
    {
      type: 'mc', tag: '1.5.2 · p.41',
      ro: { q: 'Care este relația de definiție a căldurii latente specifice de vaporizare?', opts: ['λ_v = Q·m', 'λ_v = Q/m', 'λ_v = m/Q', 'λ_v = Q·m²'], why: 'λ_v = Q/m, de unde Q = λ_v · m, cu [λ_v] = J/kg. Vaporizarea absoarbe căldură, condensarea cedează aceeași căldură în modul.' },
      en: { q: 'Which is the defining relation of the specific latent heat of vaporisation?', opts: ['λ_v = Q·m', 'λ_v = Q/m', 'λ_v = m/Q', 'λ_v = Q·m²'], why: 'λ_v = Q/m, hence Q = λ_v · m, with [λ_v] = J/kg. Vaporisation absorbs heat, condensation releases the same heat in modulus.' },
      ok: 1
    },
    {
      type: 'mc', tag: '1.5.2.1 · p.42',
      ro: { q: 'În experimentul cu tuburile barometrice, ce se întâmplă cu presiunea vaporilor saturanți dacă se introduce mai mult eter decât trebuie?', opts: ['Crește proporțional cu cantitatea', 'Rămâne egală cu p_m, iar excesul rămâne lichid', 'Scade, pentru că lichidul ocupă volum', 'Depinde de masa vaporilor din tub'], why: 'p_m nu depinde nici de masa lichidului, nici de masa vaporilor aflați în contact cu el (fig. 1.5.2.1.1, tuburile 4 și 5).' },
      en: { q: 'In the barometric-tube experiment, what happens to the saturated-vapour pressure if more ether is injected than needed?', opts: ['It grows proportionally with the amount', 'It stays equal to p_m and the excess remains liquid', 'It falls, because the liquid takes up volume', 'It depends on the mass of vapour in the tube'], why: 'p_m depends neither on the mass of liquid nor on the mass of vapour in contact with it (fig. 1.5.2.1.1, tubes 4 and 5).' },
      ok: 1
    },
    {
      type: 'mc', tag: 'fig. 1.5.2.1.2-a · p.42',
      ro: { q: 'La temperatură constantă, mărim volumul de deasupra lichidului. Ce pățește presiunea vaporilor saturanți?', opts: ['Scade pe legea lui Boyle–Mariotte', 'Crește', 'Rămâne neschimbată', 'Depinde de natura lichidului'], why: 'Creșterea volumului determină vaporizarea unei cantități suplimentare de lichid (și invers), dar nivelul coloanei de mercur nu se schimbă.' },
      en: { q: 'At constant temperature the volume above the liquid is increased. What happens to the saturated-vapour pressure?', opts: ['It falls, following Boyle–Mariotte', 'It grows', 'It stays unchanged', 'It depends on the nature of the liquid'], why: 'The larger volume makes an extra amount of liquid vaporise (and vice versa), but the level of the mercury column does not change.' },
      ok: 2
    },
    {
      type: 'mc', tag: 'AE Evaporarea · p.43',
      ro: { q: 'De ce scade temperatura unui lichid în timpul evaporării, fără să fie răcit din exterior?', opts: ['Pentru că vaporii „transportă” frig', 'Pentru că moleculele care pleacă au energii cinetice mai mari decât media', 'Pentru că forțele de coeziune dispar', 'Pentru că presiunea atmosferică crește'], why: 'Lichidul este părăsit de moleculele cele mai rapide, deci energia cinetică medie a moleculelor rămase — și temperatura — scade.' },
      en: { q: 'Why does a liquid cool down while evaporating, without being cooled from outside?', opts: ['Because the vapour „carries cold”', 'Because the molecules that leave have kinetic energies above the average', 'Because the cohesion forces vanish', 'Because the atmospheric pressure grows'], why: 'The fastest molecules leave the liquid, so the average kinetic energy of the remaining ones — and the temperature — drops.' },
      ok: 1
    },
    {
      type: 'mc', tag: 'AE Fierberea · p.44',
      ro: { q: 'Când începe fierberea unui lichid?', opts: ['Când temperatura atinge 100 °C', 'Când presiunea vaporilor saturanți devine egală cu presiunea exterioară', 'Când tot lichidul s-a transformat în vapori', 'Când căldura latentă devine nulă'], why: 'Condiția este p_saturat(T_fierbere) = p_externă; de aceea apa fierbe la 100 °C la 760 tori, dar la 0 °C la 4,5 tori.' },
      en: { q: 'When does a liquid start to boil?', opts: ['When the temperature reaches 100 °C', 'When its saturated-vapour pressure equals the external pressure', 'When all the liquid has turned into vapour', 'When the latent heat becomes zero'], why: 'The condition is p_saturated(T_boiling) = p_external; that is why water boils at 100 °C at 760 torr but at 0 °C at 4.5 torr.' },
      ok: 1
    },
    {
      type: 'num', tag: 'AE Fierberea · p.44', unit: '°C', tol: 0.15,
      ro: { q: 'La ce temperatură fierbe apa atunci când presiunea exterioară este de 4,5 tori?', why: 'Chiar la 0 °C: p_sat(0 °C) ≈ 4,54 tori. Este motivul pentru care, în experimentul cu seringa, apa de la temperatura camerei reîncepe să fiarbă.' },
      en: { q: 'At what temperature does water boil when the external pressure is 4.5 torr?', why: 'Exactly at 0 °C: p_sat(0 °C) ≈ 4.54 torr. That is why, in the syringe experiment, room-temperature water starts boiling again.' },
      ok: 0
    },
    {
      type: 'num', tag: 'Ex. 1.5.2.1 · p.45', unit: '', tol: 0.03,
      ro: { q: 'O picătură de apă la 0 °C este introdusă într-o incintă vidată. Ce fracțiune f îngheață? Folosește λ_v = 2,83·10⁶ J/kg și λ_g = 3,34·10⁵ J/kg.', why: 'f = λ_v/(λ_g + λ_v) = 2,83/(0,334 + 2,83) ≈ 0,894. Manualul dă doar formula; valoarea lui λ_v trebuie completată din tabelele standard.' },
      en: { q: 'A water drop at 0 °C is placed inside an evacuated enclosure. What fraction f freezes? Use λ_v = 2.83·10⁶ J/kg and λ_g = 3.34·10⁵ J/kg.', why: 'f = λ_v/(λ_g + λ_v) = 2.83/(0.334 + 2.83) ≈ 0.894. The textbook gives only the formula; λ_v has to be completed from standard tables.' },
      ok: 0.894
    },
    {
      type: 'mc', tag: '1.5.3 · p.45',
      ro: { q: 'Ce reprezintă punctul triplu al apei?', opts: ['Temperatura la care gheața, apa și vaporii coexistă', 'Temperatura de fierbere la presiunea normală', 'Punctul în care presiunea vaporilor este nulă', 'Topirea cea mai rapidă posibilă'], why: 'Este starea unică în care substanța coexistă în toate cele trei stări de agregare: 273,16 K și p_tr ≈ 611 Pa (4,58 tori).' },
      en: { q: 'What does the triple point of water represent?', opts: ['The state where ice, water and vapour coexist', 'The boiling temperature at normal pressure', 'The point where the vapour pressure is zero', 'The fastest possible melting'], why: 'It is the unique state in which the substance coexists in all three states of aggregation: 273.16 K and p_tr ≈ 611 Pa (4.58 torr).' },
      ok: 0
    }
  ];

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
      html += '<div class="q-num"><div class="row"><input type="number" step="any" id="qAns" placeholder="' +
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
      if (!answered) renderQuestion();
    });
  }

  global.Quiz = { init: init, count: function () { return Q.length; } };
})(window);
