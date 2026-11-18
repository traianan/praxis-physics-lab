/* Tab Exersează: șase întrebări cu verificare imediată. */
(function () {
  'use strict';
  const P = window.Praxis;
  if (!P) return;
  const $ = P.$;

  const ANSWERS = {
    1: { type: 'radio', value: '3', text: 'Panta este coeficientul lui x: m = 3.' },
    2: { type: 'number', value: -2, text: 'f(3) = −2 · 3 + 4 = −6 + 4 = −2.' },
    3: { type: 'radio', value: 'a', text: 'Pe axa Oy, x = 0, deci y = f(0) = 1. Punctul este (0; 1).' },
    4: { type: 'number', value: 3, text: 'f(x) = 0 → 4x − 12 = 0 → 4x = 12 → x = 3.' },
    5: { type: 'radio', value: 'b', text: 'În s(t) = s₀ + v·t, coeficientul lui t este viteza: v = 2 m/s.' },
    6: { type: 'radio', value: 'b', text: 'm = −3 < 0, deci funcția este strict descrescătoare pe ℝ.' }
  };

  const cards = {};

  function getAnswer(id) {
    const card = cards[id];
    if (!card) return null;
    if (ANSWERS[id].type === 'radio') {
      const checked = card.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : null;
    }
    const input = card.querySelector('.numeric-input');
    if (!input || !input.value.trim()) return null;
    const value = P.parseNum(input.value);
    return Number.isFinite(value) ? value : null;
  }

  function isCorrect(id, answer) {
    if (answer === null) return false;
    if (ANSWERS[id].type === 'number') {
      return Math.abs(Number(answer) - ANSWERS[id].value) < 1e-9;
    }
    return String(answer) === ANSWERS[id].value;
  }

  function setFeedback(id, state, message) {
    const card = cards[id];
    const feedback = card.querySelector('.q-feedback');
    feedback.classList.remove('is-correct', 'is-wrong');
    if (state === 'correct') {
      feedback.classList.add('is-correct');
      feedback.textContent = 'Corect. ' + ANSWERS[id].text;
    } else if (state === 'wrong') {
      feedback.classList.add('is-wrong');
      feedback.textContent = message;
    } else {
      feedback.textContent = message || '';
    }
  }

  function check(event) {
    event.preventDefault();
    let correct = 0;
    let answered = 0;
    Object.keys(ANSWERS).forEach((key) => {
      const id = Number(key);
      const answer = getAnswer(id);
      if (answer !== null) answered += 1;
      const ok = isCorrect(id, answer);
      if (ok) {
        correct += 1;
        setFeedback(id, 'correct');
      } else if (answer === null) {
        setFeedback(id, 'wrong', 'Alege un răspuns sau scrie o valoare.');
      } else {
        const expected = ANSWERS[id].type === 'number'
          ? P.fmtSigned(ANSWERS[id].value)
          : cardAnswerLabel(id);
        setFeedback(id, 'wrong', 'Nu este corect. Răspunsul așteptat este ' + expected + '. ' + ANSWERS[id].text);
      }
    });

    const score = $('#quizScore');
    score.textContent = 'Ai răspuns corect la ' + correct + ' din 6 întrebări (' + answered + ' completate).';
    score.dataset.score = String(correct);
    if (correct === 6) {
      P.toast('Excelent! Toate răspunsurile sunt corecte.');
      P.sound.play('ok');
    } else if (correct >= 4) {
      P.toast('Bun! Mai verifică întrebările marcate.');
      P.sound.play('ok');
    } else {
      P.toast('Reia teoria și încearcă din nou.');
      P.sound.play('err');
    }
  }

  function cardAnswerLabel(id) {
    if (ANSWERS[id].type === 'number') return P.fmtSigned(ANSWERS[id].value);
    const card = cards[id];
    const input = card.querySelector('input[value="' + ANSWERS[id].value + '"]');
    if (!input) return ANSWERS[id].value;
    const label = input.closest('.option');
    return label ? label.textContent.trim() : ANSWERS[id].value;
  }

  function reset() {
    const form = $('#quizForm');
    form.reset();
    Object.keys(cards).forEach((key) => {
      const card = cards[key];
      card.classList.remove('is-correct', 'is-wrong');
      const feedback = card.querySelector('.q-feedback');
      feedback.textContent = '';
      feedback.classList.remove('is-correct', 'is-wrong');
    });
    $('#quizScore').textContent = '';
    delete $('#quizScore').dataset.score;
    P.sound.play('tap');
    const first = form.querySelector('input');
    if (first) first.focus();
  }

  function init() {
    const form = $('#quizForm');
    if (!form) return;
    Object.keys(ANSWERS).forEach((key) => {
      cards[key] = form.querySelector('.quiz-card[data-q="' + key + '"]');
      const card = cards[key];
      card.addEventListener('change', () => setFeedback(Number(key), null, ''));
      card.addEventListener('input', (event) => {
        if (event.target.classList.contains('numeric-input')) setFeedback(Number(key), null, '');
      });
    });
    form.addEventListener('submit', check);
    $('#btnResetQuiz').addEventListener('click', reset);
  }

  P.Quiz = { init };
})();
