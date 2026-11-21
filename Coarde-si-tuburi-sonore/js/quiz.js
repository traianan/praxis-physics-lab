/* ==========================================================================
   Evaluare: 10 întrebări cu feedback și scor
   ========================================================================== */
(function () {
  'use strict';
  const App = window.App;
  const { $, fmt } = App;

  const QUESTIONS = [
    {
      q: 'O coardă fixată la ambele capete are lungimea L. Care este lungimea de undă a fundamentalei?',
      options: ['L', '2L', '4L'],
      correct: 1,
      why: 'Capetele fixe sunt noduri, iar între două noduri vecine este λ/2. Deci L = λ/2 și λ = 2L.'
    },
    {
      q: 'Dacă tensiunea unei coarde crește de 4 ori, frecvența fundamentală…',
      options: ['se dublează', 'se înjumătățește', 'crește de 4 ori'],
      correct: 0,
      why: 'f ∝ √T. Pentru T → 4T, √T crește de 2 ori, deci f se dublează.'
    },
    {
      q: 'Un tub închis la un capăt rezonează cu…',
      options: ['toate armonicele', 'doar armonicele impare', 'doar armonicele pare'],
      correct: 1,
      why: 'La capătul închis deplasarea are nod, la cel deschis ventru. Condiția permite doar armonicile impare: 1, 3, 5, …'
    },
    {
      q: 'Care este formula frecvențelor unui tub deschis–deschis?',
      options: ['fₙ = n·v/(2L)', 'fₙ = (2n−1)·v/(4L)', 'fₙ = n·v/L'],
      correct: 0,
      why: 'Tubul deschis are ventre la ambele capete; distanța dintre ventre vecine este λ/2, deci fₙ = n·v/(2L).'
    },
    {
      q: 'Două instrumente cântă aceeași notă La4. De ce sună totuși diferit?',
      options: ['au lungimi de undă diferite', 'au viteze ale sunetului diferite', 'au rețete de armonice (spectre) diferite'],
      correct: 2,
      why: 'Înălțimea este dată de fundamentală; timbrul este dat de numărul, amplitudinile și fazele armonicelor.'
    },
    {
      q: 'Lungimea unei coarde se dublează, iar T și μ rămân constante. Frecvența fundamentală…',
      options: ['se dublează', 'se înjumătățește', 'rămâne aceeași'],
      correct: 1,
      why: 'f₁ = v/(2L). Dacă L se dublează, f₁ se înjumătățește.'
    },
    {
      q: 'Un tub închis la un capăt are L = 0,50 m, iar v = 343 m/s. Care este fundamentala?',
      options: ['343 Hz', '171,5 Hz', '686 Hz'],
      correct: 1,
      why: 'f₁ = v/(4L) = 343/(4·0,50) = 343/2 = 171,5 Hz.'
    },
    {
      q: 'Ce armonice conține o undă pătrată?',
      options: ['doar impare, cu amplitudini care scad ca 1/n', 'toate, cu amplitudini egale', 'doar pare, cu amplitudini care scad ca 1/n²'],
      correct: 0,
      why: 'Seria Fourier a undei pătrate are doar termeni impari: (4/π)(sin ωt + sin 3ωt/3 + sin 5ωt/5 + …).'
    },
    {
      q: 'Temperatura aerului dintr-un tub crește. Ce se întâmplă cu frecvența de rezonanță?',
      options: ['crește, pentru că v crește', 'scade, pentru că aerul devine mai dens', 'nu se schimbă'],
      correct: 0,
      why: 'v ≈ 331 + 0,6·t crește cu temperatura, iar f este proporțională cu v pentru o lungime fixă.'
    },
    {
      q: 'La capătul închis al unui tub sonor, deplasarea aerului are…',
      options: ['ventru', 'nod', 'amplitudine maximă'],
      correct: 1,
      why: 'Aerul nu poate ieși prin peretele închis, deci deplasarea este zero: nod. Presiunea are acolo ventru.'
    }
  ];

  let rendered = false;

  function render() {
    const host = $('#quiz-questions');
    if (!host) return;
    host.innerHTML = QUESTIONS.map((item, i) => {
      const opts = item.options.map((opt, j) => (
        '<label class="option"><input type="radio" name="q' + (i + 1) + '" value="' + j + '"><span>' + opt + '</span></label>'
      )).join('');
      return '<div class="question" data-q="' + (i + 1) + '">' +
        '<div class="question-head"><span class="q-num">' + (i + 1) + '</span>' +
        '<p class="q-text">' + item.q + '</p></div>' +
        '<div class="options">' + opts + '</div>' +
        '<p class="q-feedback"><strong>Explicație.</strong> ' + item.why + '</p>' +
        '</div>';
    }).join('');
    rendered = true;
    host.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        const name = input.name;
        host.querySelectorAll('input[name="' + name + '"]').forEach((other) => {
          other.closest('.option').classList.toggle('selected', other.checked);
        });
      });
    });
  }

  function reset() {
    const form = $('#quiz');
    if (form) form.reset();
    const host = $('#quiz-questions');
    if (host) {
      host.querySelectorAll('.question').forEach((q) => q.classList.remove('correct', 'wrong'));
      host.querySelectorAll('.option').forEach((o) => o.classList.remove('selected', 'correct-answer', 'wrong-answer'));
      host.querySelectorAll('.q-feedback').forEach((f) => f.classList.remove('show'));
    }
    const result = $('#quiz-result');
    if (result) result.hidden = true;
    const bar = $('#quiz-bar');
    if (bar) bar.style.width = '0%';
    const check = $('#quiz-check');
    if (check) check.textContent = 'Verifică răspunsurile';
    const formEl = $('#quiz');
    if (formEl) formEl.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'center' });
  }

  function check() {
    const host = $('#quiz-questions');
    if (!host) return;
    let score = 0;
    QUESTIONS.forEach((item, i) => {
      const q = host.querySelector('.question[data-q="' + (i + 1) + '"]');
      if (!q) return;
      const selected = q.querySelector('input[type="radio"]:checked');
      const correctOpt = q.querySelectorAll('.option')[item.correct];
      const selectedOpt = selected ? selected.closest('.option') : null;
      q.classList.remove('correct', 'wrong');
      q.querySelectorAll('.option').forEach((o) => o.classList.remove('correct-answer', 'wrong-answer'));
      if (correctOpt) correctOpt.classList.add('correct-answer');
      if (selected && Number(selected.value) === item.correct) {
        score++;
        q.classList.add('correct');
      } else {
        q.classList.add('wrong');
        if (selectedOpt) selectedOpt.classList.add('wrong-answer');
      }
      const fb = q.querySelector('.q-feedback');
      if (fb) fb.classList.add('show');
    });

    const result = $('#quiz-result');
    const scoreEl = $('#quiz-score');
    const title = $('#quiz-title');
    const msg = $('#quiz-message');
    const bar = $('#quiz-bar');
    if (scoreEl) scoreEl.textContent = String(score);
    if (bar) bar.style.width = Math.round((score / QUESTIONS.length) * 100) + '%';
    if (title) {
      title.textContent = score >= 9 ? 'Excelent!' : score >= 7 ? 'Foarte bine!' : score >= 5 ? 'Aproape acolo' : 'Mai exersează';
    }
    if (msg) {
      if (score >= 9) msg.textContent = 'Stăpânești coardele, tuburile și spectrul. Poți explica acum de ce instrumentele sună diferit.';
      else if (score >= 7) msg.textContent = 'Ai înțeles ideile principale. Reia întrebările greșite și urmărește explicațiile.';
      else if (score >= 5) msg.textContent = 'Baza este acolo, dar mai exersează formulele pentru tubul închis și Fourier.';
      else msg.textContent = 'Reia teoria și laboratorul, apoi încearcă din nou. Fiecare răspuns are o explicație mai jos.';
    }
    if (result) {
      result.hidden = false;
      result.scrollIntoView({ behavior: App.motionReduced() ? 'auto' : 'smooth', block: 'center' });
    }
    const checkBtn = $('#quiz-check');
    if (checkBtn) checkBtn.textContent = 'Verifică din nou';
    App.ui.toast('Scor: ' + score + ' / ' + QUESTIONS.length + '.');
  }

  function init() {
    if (!rendered) render();
    const form = $('#quiz');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); check(); });
    const retry = $('#quiz-retry');
    if (retry) retry.addEventListener('click', reset);
  }

  App.quiz = { init, reset, check };
})();
