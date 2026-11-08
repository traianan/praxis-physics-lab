"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  ArrowRight,
  CheckCircle,
  Reset,
  Sparkles,
  XCircle,
} from "./Icons";

interface Question {
  id: string;
  tag: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    tag: "Definiție",
    question: "Legea lui Ohm pentru o porțiune de circuit se scrie…",
    options: ["I = R/U", "I = U/R", "I = U·R", "U = I/R"],
    correct: 1,
    explanation:
      "Intensitatea curentului este proporțională cu tensiunea și invers proporțională cu rezistența: I = U/R. Celelalte forme (U = RI, R = U/I) sunt echivalente, dar numai a doua variantă are forma corectă.",
  },
  {
    id: "q2",
    tag: "Unitate",
    question: "Un ohm reprezintă rezistența unui conductor prin care, la 1 V, trece un curent de…",
    options: ["0,1 A", "1 A", "10 A", "1 mA"],
    correct: 1,
    explanation:
      "Prin definiție, 1 Ω = 1 V / 1 A. Conductorul lasă să treacă 1 A atunci când la capetele lui se aplică 1 V.",
  },
  {
    id: "q3",
    tag: "Caracteristică",
    question: "Caracteristica curent-tensiune a unui conductor ohmic este…",
    options: [
      "o parabolă",
      "o dreaptă care nu trece prin origine",
      "o dreaptă care trece prin origine",
      "o hiperbolă",
    ],
    correct: 2,
    explanation:
      "Proporționalitatea I ∝ U dă o dreaptă prin origine. Panta ei este 1/R, deci o rezistență mai mare înseamnă o dreaptă mai puțin abruptă.",
  },
  {
    id: "q4",
    tag: "Instrumente",
    question: "Ampermetrul se montează…",
    options: [
      "în paralel cu consumatorul",
      "în serie cu consumatorul",
      "în paralel cu sursa",
      "indiferent cum",
    ],
    correct: 1,
    explanation:
      "Ampermetrul trebuie străbătut de curentul de măsurat, deci se leagă în serie. Are rezistență internă mică, ca să nu modifice circuitul.",
  },
  {
    id: "q5",
    tag: "Circuit complet",
    question: "Legea lui Ohm pentru circuitul complet este…",
    options: [
      "I = E/R",
      "I = E/(R − r)",
      "I = E/(R + r)",
      "I = (E + r)/R",
    ],
    correct: 2,
    explanation:
      "Curentul depinde de suma rezistențelor: I = E/(R + r). Rezistența internă r limitează curentul oricât de mică ar fi R.",
  },
  {
    id: "q6",
    tag: "Sursă reală",
    question: "Tensiunea la bornele unei surse reale, când crește curentul, …",
    options: ["crește liniar", "rămâne constantă", "scade liniar", "scade parabolic"],
    correct: 2,
    explanation:
      "U = E − r·I: dependența este liniară, cu panta −r. La scurtcircuit, U = 0 și I = E/r.",
  },
  {
    id: "q7",
    tag: "Scurtcircuit",
    question: "Curentul de scurtcircuit al unei surse cu E și r este…",
    options: ["E·r", "E/r", "r/E", "0"],
    correct: 1,
    explanation:
      "Când R = 0, curentul este E/r. Cu cât rezistența internă r este mai mică, cu atât curentul de scurtcircuit este mai mare — de aceea acumulatorii pot fi periculoși.",
  },
  {
    id: "q8",
    tag: "Adaptare",
    question: "Puterea utilă transferată pe un rezistor exterior este maximă când…",
    options: ["R = 0", "R = r", "R = 2r", "R → ∞"],
    correct: 1,
    explanation:
      "Puterea transferată, E²R/(R+r)², are maxim la R = r, cu valoarea E²/(4r). Randamentul este atunci doar 50 %, deci adaptarea nu înseamnă eficiență.",
  },
  {
    id: "q9",
    tag: "Reostat",
    question: "Reostatul legat în serie cu un consumator, când cursorul ia mai mult fir în circuit, …",
    options: [
      "crește curentul",
      "scade curentul",
      "curentul rămâne același",
      "tensiunea la borne crește",
    ],
    correct: 1,
    explanation:
      "Rezistența porțiunii active crește odată cu lungimea firului, deci curentul scade. Așa se comportă reostatul conectat în serie.",
  },
  {
    id: "q10",
    tag: "Măsurare",
    question: "În montajul amonte, valoarea R = U/I obținută din citiri este…",
    options: [
      "mai mică decât valoarea reală",
      "egală cu valoarea reală",
      "mai mare decât valoarea reală",
      "independentă de instrumente",
    ],
    correct: 2,
    explanation:
      "Voltmetrul măsoară și căderea de tensiune pe ampermetru, deci raportul U/I este puțin mai mare decât rezistența reală. Valoarea se corectează scăzând rezistența ampermetrului.",
  },
];

interface AnswerRecord {
  selected: number;
  correct: boolean;
}

export function Quiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const current = QUESTIONS[index];
  const total = QUESTIONS.length;
  const answered = index + (checked ? 1 : 0);
  const progress = (answered / total) * 100;
  const isCorrect = selected === current.correct;

  const check = () => {
    if (selected === null || checked) return;
    const correct = selected === current.correct;
    setChecked(true);
    setAnswers((previous) => [...previous, { selected, correct }]);
    if (correct) setScore((value) => value + 1);
  };

  const next = () => {
    if (!checked) return;
    if (index >= total - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  const percent = Math.round((score / total) * 100);
  const verdict =
    percent >= 90
      ? "Excelent — legea lui Ohm nu mai are secrete."
      : percent >= 70
        ? "Foarte bine — ai prins esențialul."
        : percent >= 50
          ? "Bun început — reia circuitul complet și măsurările."
          : "Reia teoria și laboratorul, apoi încearcă din nou.";

  return (
    <section className="section section-quiz" id="verificare">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="07"
            eyebrow="Verificare"
            title="Testează-ți înțelegerea"
            lead="Zece întrebări scurte despre definiție, caracteristica U–I, circuitul complet, reostat și măsurări. Primești feedback imediat și explicația fiecărui răspuns."
            action={
              <span className="lab-head-chip">
                <Sparkles size={16} />
                10 întrebări
              </span>
            }
          />
        </Reveal>

        <Reveal className="quiz-shell" delay={50}>
          {!finished ? (
            <>
              <div className="quiz-top">
                <div className="quiz-score-box">
                  <span>scor</span>
                  <strong>{score}</strong>
                  <small>/ {total}</small>
                </div>
                <div className="quiz-progress-wrap">
                  <div className="quiz-progress">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <div className="quiz-progress-labels">
                    <span>progres</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
                <div className="quiz-counter">
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span>/ {total}</span>
                </div>
              </div>

              <div className="quiz-body">
                <div className="quiz-meta">
                  <span className="chip chip-mint">{current.tag}</span>
                  <span className="quiz-number">
                    întrebarea {index + 1} din {total}
                  </span>
                </div>
                <h3 className="quiz-question">{current.question}</h3>

                <div className="quiz-options" role="radiogroup" aria-label="Variante de răspuns">
                  {current.options.map((option, optionIndex) => {
                    const letter = String.fromCharCode(65 + optionIndex);
                    let stateClass = "";
                    if (checked) {
                      if (optionIndex === current.correct) stateClass = "is-correct";
                      else if (optionIndex === selected) stateClass = "is-wrong";
                    } else if (optionIndex === selected) {
                      stateClass = "is-selected";
                    }
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`quiz-option ${stateClass}`}
                        role="radio"
                        aria-checked={selected === optionIndex}
                        onClick={() => {
                          if (!checked) setSelected(optionIndex);
                        }}
                      >
                        <span className="quiz-option-letter">{letter}</span>
                        <span className="quiz-option-text">{option}</span>
                        {checked && optionIndex === current.correct ? (
                          <CheckCircle size={18} className="quiz-option-icon" />
                        ) : null}
                        {checked &&
                        optionIndex === selected &&
                        optionIndex !== current.correct ? (
                          <XCircle size={18} className="quiz-option-icon" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {checked ? (
                  <div
                    className={`quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}
                    role="status"
                  >
                    <div className="quiz-feedback-head">
                      {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      <strong>{isCorrect ? "Corect!" : "Nu chiar."}</strong>
                    </div>
                    <p>{current.explanation}</p>
                    {!isCorrect ? (
                      <span className="quiz-feedback-answer">
                        Răspunsul corect: {current.options[current.correct]}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="quiz-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={check}
                    disabled={selected === null || checked}
                  >
                    Verifică răspunsul
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={next}
                    disabled={!checked}
                  >
                    {index === total - 1 ? "Vezi rezultatul" : "Următoarea întrebare"}
                    <ArrowRight size={17} />
                  </button>
                  <button type="button" className="quiz-restart-link" onClick={restart}>
                    <Reset size={14} />
                    Reia testul
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="quiz-result">
              <div
                className="quiz-result-badge"
                style={{ "--score": `${percent}%` } as CSSProperties}
              >
                <div>
                  <strong>{score}</strong>
                  <span>din {total}</span>
                </div>
              </div>
              <span className="eyebrow">rezultat final</span>
              <h3>
                {percent}% — {verdict}
              </h3>
              <p>
                {score >= 7
                  ? "Poți trece la problemele de calcul și la analiza erorilor de măsurare."
                  : "Reia definiția, caracteristica U–I și legea circuitului complet, apoi încearcă din nou."}
              </p>
              <div className="quiz-review">
                {QUESTIONS.map((question, questionIndex) => {
                  const answer = answers[questionIndex];
                  return (
                    <div
                      className={`quiz-review-item ${
                        answer?.correct ? "is-correct" : "is-wrong"
                      }`}
                      key={question.id}
                    >
                      {answer?.correct ? <CheckCircle size={17} /> : <XCircle size={17} />}
                      <div>
                        <strong>{question.question}</strong>
                        <span>
                          {answer?.correct
                            ? "corect"
                            : `corect: ${question.options[question.correct]}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="quiz-result-actions">
                <button type="button" className="button button-primary" onClick={restart}>
                  <Reset size={16} />
                  Reia testul
                </button>
                <a className="button button-secondary" href="#probleme">
                  <Sparkles size={16} />
                  Înapoi la probleme
                </a>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
