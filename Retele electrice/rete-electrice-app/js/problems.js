/* ============================================================
   problems.js — probleme rezolvate + test rapid
   ============================================================ */
'use strict';

const PROBLEMS = [
  {
    no: '2.3.1',
    tag: 'Kirchhoff',
    title: 'Rețea cu două surse reale: aflarea curenților pe laturi',
    stmt: `În circuitul din figura din laborator se cunosc: E₁ = 22 V, r₁ = 1 Ω, E₂ = 19 V, r₂ = 1 Ω,
      R₁ = R₃ = 4 Ω, R₂ = 6 Ω. Aflați intensitățile I₁, I₂ și I₃ ale curenților care parcurg rezistoarele
      de rezistență R₁, R₂, respectiv R₃.`,
    steps: [
      ['Alegem arbitrar sensurile curenților: I₁ și I₂ prin laturile superioare, I₃ prin latura comună, în jos.',
        'sensuri alese: I₁ ↓ stânga, I₂ ↓ dreapta, I₃ ↓ prin R₃'],
      ['Scriem prima lege a lui Kirchhoff pentru nodul B (n = 2 noduri → n − 1 = 1 ecuație independentă).',
        'I₁ + I₂ − I₃ = 0'],
      ['A doua lege a lui Kirchhoff pentru ochiul stâng (sursa E₁, r₁, R₁, R₃).',
        'E₁ = I₁·R₁ + I₃·R₃ + I₁·r₁'],
      ['A doua lege a lui Kirchhoff pentru ochiul drept.',
        'E₂ = I₂·R₂ + I₃·R₃ + I₂·r₂'],
      ['Înlocuim valorile numerice. Observăm că r₁ și r₂ se însumează cu R₁, respectiv R₂.',
        '22 = 5·I₁ + 4·I₃  și  19 = 7·I₂ + 4·I₃'],
      ['Înlocuim I₃ = I₁ + I₂ și rezolvăm sistemul de 3 ecuații cu 3 necunoscute.',
        '22 = 9I₁ + 4I₂ ;  19 = 4I₁ + 11I₂  →  Δ = 83'],
    ],
    answer: 'I₁ = 2 A, I₂ = 1 A, I₃ = 3 A',
    verify: () => {
      const E1 = 22, E2 = 19, R1 = 4, r1 = 1, R2 = 6, r2 = 1, R3 = 4;
      const a1 = R1 + r1, a2 = R2 + r2;
      const det = (a1 + R3) * (a2 + R3) - R3 * R3;
      const I1 = (E1 * (a2 + R3) - R3 * E2) / det;
      const I2 = ((a1 + R3) * E2 - R3 * E1) / det;
      return `I₁ = ${fmt(I1, 3)} A · I₂ = ${fmt(I2, 3)} A · I₃ = ${fmt(I1 + I2, 3)} A
        → nod: ${fmt(I1 + I2 - (I1 + I2), 6)} = 0 ✔`;
    },
  },
  {
    no: '2.3.2',
    tag: 'Kirchhoff',
    title: 'Două ecuații de ochi + diferența de potențial între două noduri',
    stmt: `În circuitul din laborator se cunosc: E₂ = 19 V, r₂ = 1 Ω, R₁ = 4 Ω, R₂ = R₃ = 2 Ω și I₁ = 2 A.
      Aflați I₂, I₃, E₁ și diferența de potențial V_A − V_B.`,
    steps: [
      ['Prima lege a lui Kirchhoff pentru nodul A.', 'I₁ + I₂ − I₃ = 0  →  2 + I₂ = I₃'],
      ['Legea a doua pentru ochiul stâng (conține E₁, r₁, R₁, R₃).', 'E₁ = I₃·R₃ + I₁·R₁ + I₁·r₁ = 2·I₃ + 2·4 + 2·1 = 2I₃ + 10'],
      ['Legea a doua pentru ochiul drept (conține E₂, r₂, R₂, R₃).', 'E₂ = I₃·R₃ + I₂·R₂ + I₂·r₂ = 2I₃ + 3I₂'],
      ['Din ecuația ochiului drept și din I₃ = 2 + I₂ obținem I₂ și I₃.',
        '19 = 2(2 + I₂) + 3I₂ = 4 + 5I₂  →  I₂ = 3 A, I₃ = 5 A'],
      ['Revenim în ecuația ochiului stâng.', 'E₁ = 2·5 + 10 = 20 V'],
      ['Calculăm V_A − V_B pe trei trasee independente (rezultatul trebuie să fie identic).',
        'a) V_A − V_B = I₃R₃ = 10 V · b) E₂ − I₂(r₂+R₂) = 10 V · c) E₁ − I₁(R₁+r₁) = 10 V'],
    ],
    answer: 'I₂ = 3 A, I₃ = 5 A, E₁ = 20 V, V_A − V_B = 10 V',
    verify: () => `Verificare ochi stâng: E₁ = 2·5 + 2·4 + 2·1 = ${2 * 5 + 2 * 4 + 2 * 1} V ✔ ·
      ochi drept: ${2 * 5 + 3 * 3} = 19 V ✔ · trasee: toate dau 10 V ✔`,
  },
  {
    no: '2.4.1.1',
    tag: 'Grupare',
    title: 'Rezistența echivalentă a unui dipol (serie + paralel)',
    stmt: `Aflați rezistența echivalentă R a dipolului AB. Se dau: R₁ = R₂ = R₃ = 2 Ω, R₄ = 3 Ω.
      R₂ și R₄ sunt în serie; gruparea lor este în paralel cu R₃; totul în serie cu R₁.`,
    steps: [
      ['R₂ și R₄ sunt în serie (același curent le străbate).', 'R₅ = R₂ + R₄ = 2 + 3 = 5 Ω'],
      ['R₅ este în paralel cu R₃.', '1/R₆ = 1/R₃ + 1/R₅ = 1/2 + 1/5 = 7/10  →  R₆ = 10/7 Ω ≈ 1,43 Ω'],
      ['R₁ este în serie cu R₆.', 'R = R₁ + R₆ = 2 + 10/7 = 24/7 Ω'],
      ['Rezultat numeric.', 'R ≈ 3,43 Ω'],
    ],
    answer: 'R = 24/7 Ω ≈ 3,43 Ω',
    verify: () => {
      const R6 = 1 / (1 / 2 + 1 / 5);
      return `R₆ = 1/(1/2 + 1/5) = ${fmt(R6, 4)} Ω · R = 2 + ${fmt(R6, 4)} = ${fmt(2 + R6, 4)} Ω`;
    },
  },
  {
    no: '2.4.2.1',
    tag: 'Generatoare',
    title: 'Două surse reale în serie + consumator variabil',
    stmt: `Un circuit conține două surse E₁ = 4 V, E₂ = 3,2 V cu r₁ = 0,5 Ω, respectiv r₂ = 1,5 Ω, legate în
      serie, și un rezistor R₁ = 10 Ω. Aflați: a) căderea de tensiune U în circuitul exterior; b) tensiunile U₁ și U₂
      la bornele fiecărei surse; c) numărul N de electroni care trec printr-o secțiune în τ = 10 s;
      d) intensitățile I₁, I₂ dacă în paralel cu R₁ se leagă R₂ = 5 Ω.`,
    steps: [
      ['a) Legea a doua a lui Kirchhoff pe ochiul unic, cu ambele surse în serie (același sens).',
        'E₁ + E₂ = I(R₁ + r₁ + r₂)  →  I = 7,2/12 = 0,6 A'],
      ['Tensiunea exterioară este căderea pe R₁ (fără r!).', 'U = I·R₁ = 0,6·10 = 6 V'],
      ['b) Atenție la semn: r se scade din E, pentru fiecare sursă în parte.',
        'U₁ = E₁ − I·r₁ = 4 − 0,6·0,5 = 3,7 V ;  U₂ = E₂ − I·r₂ = 3,2 − 0,6·1,5 = 2,3 V'],
      ['c) Sarcina totală împărțită la sarcina electronului.',
        'N = Q/|e| = I·τ/|e| = 0,6·10 / 1,602·10⁻¹⁹ = 3,75·10¹⁹ electroni'],
      ['d) R₁ ∥ R₂, deci curentul principal se ramifică. Sistem Kirchhoff cu 2 ochiuri.',
        'I = I₁ + I₂ ;  E₁ + E₂ = I₁R₁ + I(r₁+r₂) ;  0 = −I₁R₁ + I₂R₂'],
      ['Rezolvăm: I = 3I₁, 5I₁ + I = 3,6 → 8I₁ = 3,6.', 'I₁ = 0,45 A ; I = 1,35 A ; I₂ = 0,9 A'],
    ],
    answer: 'a) U = 6 V · b) U₁ = 3,7 V, U₂ = 2,3 V · c) N = 3,75·10¹⁹ · d) I = 1,35 A, I₁ = 0,45 A, I₂ = 0,9 A',
    verify: () => {
      const E = 4 + 3.2, r = 0.5 + 1.5;
      const I = E / (10 + r);
      const I1p = 3.6 / (1 / (1 / 10 + 1 / 5) + r);
      return `serie: I = ${fmt(I, 3)} A, U = ${fmt(I * 10, 3)} V, U₁ = ${fmt(4 - I * 0.5, 3)} V, U₂ = ${fmt(3.2 - I * 1.5, 3)} V
        · cu R₂ ∥ R₁: R_ext = ${fmt(1 / (1 / 10 + 1 / 5), 3)} Ω, I = ${fmt(I1p, 3)} A`;
    },
  },
  {
    no: '2.4.2.2',
    tag: 'Generatoare',
    title: 'Trei surse reale în paralel (cu rezistențe interne diferite)',
    stmt: `Trei surse E₁ = 1 V, E₂ = 1,1 V, E₃ = 1,2 V cu r₁ = 2 Ω, r₂ = 3 Ω, r₃ = 1 Ω sunt conectate în paralel.
      La bornele comune A și B este legat un rezistor R = 20 Ω. Aflați: a) intensitatea I prin R;
      b) intensitățile prin surse dacă E₃ este scoasă din circuit; c) tensiunea U măsurată de un voltmetru cu R_V = 2 kΩ.`,
    steps: [
      ['a) Aplicăm Kirchhoff: un nod (A) și două ochiuri independente (3 laturi, 2 noduri → o = 3 − 2 + 1 = 2).',
        'I₁ + I₂ + I₃ = I ; E₁ − E₂ = I₁r₁ − I₂r₂ ; E₂ − E₃ = I₂r₂ − I₃r₃ ; E₃ = I₃r₃ + I·R'],
      ['Înlocuim valorile numerice (atenție: E₃ este „cea mai puternică”, deci dă curent).',
        '2I₁ − 3I₂ = −0,1 ; 3I₂ − I₃ = −0,1 ; I₃ + 20I = 1,2'],
      ['Exprimăm I₃ = 1,2 − 20I și reducem sistemul.', 'I₂ = 21I − 1,2 − I₁ ; apoi sistem 2×2 în I, I₁'],
      ['Adunăm ecuațiile și aflăm curentul principal.', '−226·I = −12,4  →  I = 12,4/226 = 54,9 mA'],
      ['b) Sursa E₃ scoasă → rămân două surse în paralel; I′ = curentul total.',
        'I′ = (E₁/r₁ + E₂/r₂) / (1 + R/r₁ + R/r₂) = (1/2 + 1,1/3) / (1 + 20(1/2 + 1/3)) = 49 mA'],
      ['Curenții prin fiecare sursă: I₁ = (E₁ − I′R)/r₁, I₂ = (E₂ − I′R)/r₂.',
        'I₁ = (1 − 0,98)/2 = 10 mA ; I₂ = (1,1 − 0,98)/3 = 40 mA'],
      ['c) Voltmetrul are rezistență proprie — se pune în paralel cu R și modifică circuitul!',
        '1/R_e = 1/R + 1/R_V = 1/20 + 1/2000 = 0,0505 → R_e = 19,8 Ω'],
      ['Recalculăm curentul și tensiunea.', 'I_e ≈ 49,5 mA ;  U = I_e·R_e ≈ 0,98 V'],
    ],
    answer: 'a) I = 54,9 mA · b) I′ = 49 mA, I₁ = 10 mA, I₂ = 40 mA · c) U ≈ 0,98 V',
    verify: () => {
      const R = 20, RV = 2000;
      const Re = 1 / (1 / R + 1 / RV);
      return `R_e (R ∥ R_V) = ${fmt(Re, 3)} Ω. Voltmetrul nu este „invizibil”: el consumă curent și scade
        tensiunea măsurată cu aproximativ ${fmt(1.2 - 0.98, 2)} V față de cazul ideal.`;
    },
  },
  {
    no: '2.4.3',
    tag: 'Instrumente',
    title: 'Șuntul ampermetrului',
    stmt: `Un ampermetru cu rezistența internă R_A = 2 Ω măsoară curenți până la I_A = 1 A.
      Ce rezistență R_s trebuie legată în paralel pentru a mări domeniul de n = 5 ori?`,
    steps: [
      ['Curentul total se ramifică: o parte prin ampermetru, restul prin șunt.',
        'I = I_A + I_s  cu I = n·I_A  →  I_s = (n − 1)·I_A'],
      ['Legea a doua a lui Kirchhoff pe ochiul format de ampermetru și șunt (aceeași tensiune).',
        '0 = I_A·R_A − I_s·R_s  →  I_A·R_A = I_s·R_s'],
      ['Înlocuim I_s.', 'R_s = I_A·R_A / ((n−1)·I_A) = R_A/(n − 1)'],
      ['Numeric, pentru n = 5.', 'R_s = 2/4 = 0,5 Ω'],
    ],
    answer: 'R_s = R_A/(n − 1) = 0,5 Ω',
    verify: () => `Cu R_s = 0,5 Ω: la I = 5 A, prin ampermetru trec ${fmt(5 * 0.5 / 2.5, 2)} A · prin șunt ${fmt(5 * 2 / 2.5, 2)} A ✔`,
  },
];

/* ---------- randare ---------- */
function initProblems() {
  const host = $('#probList');
  if (!host) return;
  host.innerHTML = PROBLEMS.map((p, i) => `
    <article class="card prob" data-i="${i}">
      <div class="prob-head">
        <div class="prob-no">${i + 1}</div>
        <div class="prob-title">Ex. ${p.no} — ${p.title}</div>
        <span class="prob-tag">${p.tag}</span>
        <span class="prob-caret">▾</span>
      </div>
      <div class="prob-body">
        <div class="prob-stmt">${p.stmt}</div>
        <h4>Rezolvare</h4>
        ${p.steps.map(([t, m], k) => `
          <div class="step"><div class="step-n">${k + 1}</div>
          <div class="step-t">${t}${m ? `<span class="mono">${m}</span>` : ''}</div></div>`).join('')}
        <div class="answer"><b>Răspuns:</b> ${p.answer}</div>
        <div class="verify">
          <button class="btn btn-sm btn-ghost" data-ver="${i}">🔁 Verifică numeric (live)</button>
          <div class="vout" id="vout${i}" style="margin-top:9px"></div>
        </div>
      </div>
    </article>`).join('');

  host.querySelectorAll('.prob-head').forEach(h => h.addEventListener('click', () => {
    h.parentElement.classList.toggle('open');
    Sound.click();
  }));
  host.querySelectorAll('[data-ver]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const i = +b.dataset.ver;
    const out = $('#vout' + i);
    out.innerHTML = `<span class="mono">${PROBLEMS[i].verify()}</span> <span class="ok">✓</span>`;
    Sound.ok();
  }));
  host.querySelectorAll('.prob')[0].classList.add('open');
}

/* ============================================================
   QUIZ
   ============================================================ */
const QUIZ = [
  {
    q: 'Un nod de rețea este un punct în care se întâlnesc…',
    o: ['exact doi conductori', 'minimum trei conductori', 'doar surse de tensiune', 'doar rezistoare'],
    a: 1,
    e: 'Prin definiție, nodul de rețea este punctul în care se întâlnesc minimum trei conductori.',
  },
  {
    q: 'Prima lege a lui Kirchhoff este expresia…',
    o: ['conservării energiei', 'conservării sarcinii electrice', 'legii lui Ohm', 'legii lui Joule'],
    a: 1,
    e: 'Σ I = 0 într-un nod exprimă faptul că sarcina electrică nu se acumulează în nod.',
  },
  {
    q: 'Intr-o rețea cu n = 4 noduri și l = 6 laturi, câte ochiuri independente există?',
    o: ['2', '3', '4', '6'],
    a: 1,
    e: 'o = l − n + 1 = 6 − 4 + 1 = 3. Totalul ecuațiilor independente = (n−1) + o = 6 = numărul laturilor.',
  },
  {
    q: 'Două rezistoare R₁ = 6 Ω și R₂ = 3 Ω sunt legate în paralel. Rezistența echivalentă este:',
    o: ['9 Ω', '4,5 Ω', '2 Ω', '0,5 Ω'],
    a: 2,
    e: '1/R = 1/6 + 1/3 = 1/2 → R = 2 Ω. În paralel, R_ep este mai mică decât cea mai mică rezistență.',
  },
  {
    q: 'Un generator real are E = 12 V și r = 2 Ω. La borne, când prin el trece I = 1,5 A, tensiunea este:',
    o: ['12 V', '9 V', '15 V', '3 V'],
    a: 1,
    e: 'U = E − I·r = 12 − 1,5·2 = 9 V. Rezistența internă „fură” o parte din t.e.m.',
  },
  {
    q: 'n generatoare identice (E, r) în serie debitează pe R curentul:',
    o: ['I = E/(R + r)', 'I = nE/(R + nr)', 'I = E/(R + r/n)', 'I = nE/(nR + r)'],
    a: 1,
    e: 'E_es = nE, r_es = nr, deci I = nE/(R + nr).',
  },
  {
    q: 'Un ampermetru cu R_A = 3 Ω trebuie să măsoare de 4 ori mai mult. Șuntul are:',
    o: ['R_s = 12 Ω', 'R_s = 1 Ω', 'R_s = 0,75 Ω', 'R_s = 0,25 Ω'],
    a: 1,
    e: 'R_s = R_A/(n−1) = 3/3 = 1 Ω.',
  },
  {
    q: 'Puterea utilă transferată de o sursă (E, r) unui consumator R este maximă când:',
    o: ['R → 0', 'R = r', 'R = 2r', 'R → ∞'],
    a: 1,
    e: 'P = E²R/(R+r)² are maxim la R = r, iar randamentul este atunci de 50%.',
  },
];

const Quiz = (() => {
  let i = 0, score = 0, answered = false;
  function render() {
    answered = false;
    const q = QUIZ[i];
    $('#quizIdx').textContent = i + 1;
    $('#quizTotal').textContent = QUIZ.length;
    $('#quizScore').textContent = score;
    $('#quizBarFill').style.width = (i / QUIZ.length * 100) + '%';
    $('#quizQ').textContent = q.q;
    $('#quizFb').textContent = '';
    $('#quizOpts').innerHTML = q.o.map((o, k) =>
      `<button class="opt" data-k="${k}">${String.fromCharCode(65 + k)}. ${o}</button>`).join('');
    $$('#quizOpts .opt').forEach(b => b.addEventListener('click', () => pick(+b.dataset.k, b)));
  }
  function pick(k, btn) {
    if (answered) return;
    answered = true;
    const q = QUIZ[i];
    const opts = $$('#quizOpts .opt');
    opts.forEach(o => o.disabled = true);
    if (k === q.a) {
      btn.classList.add('correct'); score++; Sound.ok();
      $('#quizFb').innerHTML = `✔ <b>Corect!</b> ${q.e}`;
    } else {
      btn.classList.add('wrong');
      opts[q.a].classList.add('correct');
      Sound.err();
      $('#quizFb').innerHTML = `✖ Nu chiar. ${q.e}`;
    }
    $('#quizScore').textContent = score;
    $('#quizBarFill').style.width = ((i + 1) / QUIZ.length * 100) + '%';
    setTimeout(() => {
      if (i < QUIZ.length - 1) { i++; render(); }
      else {
        $('#quizQ').innerHTML = `Test încheiat! Scor: <b>${score} / ${QUIZ.length}</b> — ${score >= 6 ? 'Excelent, ai stăpânit legile lui Kirchhoff! 🎉' : 'Recitește secțiunile de teorie și încearcă din nou.'}`;
        $('#quizOpts').innerHTML = '';
        $('#quizFb').textContent = '';
        if (score >= 6) Sound.win();
      }
    }, 1400);
  }
  function restart() { i = 0; score = 0; render(); Sound.click(); }
  function init() {
    const r = $('#quizRestart');
    if (r) r.addEventListener('click', restart);
    Router.on('quiz', render);
    render();
  }
  return { init, render };
})();
