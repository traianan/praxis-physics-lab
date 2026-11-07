"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  ArrowRight,
  CheckCircle,
  CrossSection,
  Lightbulb,
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
    tag: "Lege",
    question: "Rezistența unui conductor omogen depinde de lungime astfel:",
    options: ["R ∼ L", "R ∼ 1/L", "R ∼ L²", "nu depinde de L"],
    correct: 0,
    explanation:
      "R = ρL/A: lungimea stă la numărător, deci rezistența crește proporțional cu ea. Dublezi lungimea, dublezi rezistența.",
  },
  {
    id: "q2",
    tag: "Lege",
    question: "Dacă aria secțiunii transversale se dublează, rezistența…",
    options: ["se dublează", "se înjumătățește", "rămâne aceeași", "crește de patru ori"],
    correct: 1,
    explanation:
      "Aria stă la numitor. R ∼ 1/A, deci 2A duce la R/2. Atenție: dublarea diametrului dublează aria de patru ori, nu de două ori.",
  },
  {
    id: "q3",
    tag: "Noțiuni",
    question: "Rezistivitatea ρ este o proprietate a…",
    options: ["firului concret", "materialului", "circuitului", "tensiunii aplicate"],
    correct: 1,
    explanation:
      "ρ caracterizează substanța (și depinde de temperatură). Rezistența R caracterizează obiectul concret și depinde și de L și A.",
  },
  {
    id: "q4",
    tag: "Unități",
    question: "Unitatea SI pentru rezistivitate este…",
    options: ["Ω", "Ω/m", "Ω·m", "S/m"],
    correct: 2,
    explanation:
      "Din R = ρL/A rezultă ρ = RA/L, deci Ω·m²/m = Ω·m. În practică se folosește des și Ω·mm²/m.",
  },
  {
    id: "q5",
    tag: "Materiale",
    question: "Care dintre aceste materiale conduce cel mai bine?",
    options: ["nicrom", "cupru", "grafit", "argint"],
    correct: 3,
    explanation:
      "Argintul are cea mai mică rezistivitate dintre metale (≈ 0,016 Ω·mm²/m), dar este scump. Cuprul este cel mai folosit în practică.",
  },
  {
    id: "q6",
    tag: "Temperatură",
    question: "La un metal, când temperatura crește, rezistența…",
    options: ["crește", "scade", "rămâne constantă", "devine zero"],
    correct: 0,
    explanation:
      "La metale α > 0: ionii rețelei vibrează mai puternic, electronii se ciocnesc mai des, deci R crește.",
  },
  {
    id: "q7",
    tag: "Calcul",
    question:
      "Un fir de cupru are L = 2 m și A = 1 mm². Cu ρ ≈ 0,017 Ω·mm²/m, rezistența este aproximativ…",
    options: ["0,0085 Ω", "0,034 Ω", "0,34 Ω", "34 Ω"],
    correct: 1,
    explanation:
      "R = ρL/A = 0,017 × 2 / 1 = 0,034 Ω. Un cablu obișnuit are rezistență foarte mică — tocmai de aceea nu se încălzește.",
  },
  {
    id: "q8",
    tag: "Calcul",
    question:
      "Același fir (0,034 Ω) este conectat la 12 V. Curentul prin el este aproximativ…",
    options: ["0,35 A", "3,5 A", "35 A", "353 A"],
    correct: 3,
    explanation:
      "I = U/R = 12 / 0,034 ≈ 353 A. Este un curent uriaș — în realitate sursa nu poate furniza atât, dar calculul arată de ce un scurtcircuit este periculos.",
  },
  {
    id: "q9",
    tag: "Geometrie",
    question: "Dublezi diametrul unui fir. Rezistența devine…",
    options: ["de două ori mai mare", "de două ori mai mică", "de patru ori mai mică", "aceeași"],
    correct: 2,
    explanation:
      "Aria depinde de d². Dacă diametrul se dublează, aria crește de patru ori, deci R scade de patru ori.",
  },
  {
    id: "q10",
    tag: "Aplicații",
    question: "De ce filamentul unui bec este lung și subțire?",
    options: [
      "ca să aibă rezistență mare și să se încălzească",
      "ca să aibă rezistență mică și să nu se încălzească",
      "ca să economisească material",
      "ca să conducă mai bine curentul",
    ],
    correct: 0,
    explanation:
      "Lungimea mare și secțiunea mică măresc rezistența. La un curent dat, P = RI² transformă energie în căldură și lumină.",
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
      ? "Excelent — stăpânești legea firului."
      : percent >= 70
        ? "Foarte bine — ai o imagine clară a dependențelor."
        : percent >= 50
          ? "Bun început — mai exersează calculul cu unități."
          : "Reia teoria și laboratorul, apoi încearcă din nou.";

  return (
    <section className="section section-quiz" id="verificare">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="Verificare"
            title="Testează-ți intuiția"
            lead="Zece întrebări scurte despre lege, unități, materiale și efectul temperaturii. Primești feedback imediat și explicația fiecărui răspuns."
            action={
              <span className="head-chip">
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
                  <span className="chip chip-copper">{current.tag}</span>
                  <span className="quiz-number">
                    întrebarea {index + 1} din {total}
                  </span>
                </div>
                <h3 className="quiz-question">{current.question}</h3>

                <div
                  className="quiz-options"
                  role="radiogroup"
                  aria-label="Variante de răspuns"
                >
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
                  ? "Poți trece la problemele de calcul și la comparația materialelor din laborator."
                  : "Reia legea R = ρL/A, unitățile și efectul temperaturii, apoi încearcă din nou."}
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
                      {answer?.correct ? (
                        <CheckCircle size={17} />
                      ) : (
                        <XCircle size={17} />
                      )}
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
                <a className="button button-secondary" href="#laborator">
                  <CrossSection size={16} />
                  Înapoi la laborator
                </a>
                <a className="button button-secondary" href="#materiale">
                  <Lightbulb size={16} />
                  Tabelul materialelor
                </a>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
