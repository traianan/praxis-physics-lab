"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  ArrowRight,
  CheckCircle,
  Flame,
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
    question:
      "Într-un proces politrop, mărimea care rămâne constantă este…",
    options: ["temperatura", "presiunea", "căldura molară", "volumul"],
    correct: 2,
    explanation:
      "Prin definiție, procesul politrop are căldura molară C constantă. ν rămâne și el constant pentru un sistem închis, dar condiția definitorie este C = constant.",
  },
  {
    id: "q2",
    tag: "Lege",
    question: "Legea după care se desfășoară procesul politrop este…",
    options: ["pV = constant", "pVⁿ = constant", "V/T = constant", "p/T = constant"],
    correct: 1,
    explanation:
      "Legea politrope este pVⁿ = constant, unde n este indicele politropic. Celelalte forme se obțin cu ecuația termică de stare.",
  },
  {
    id: "q3",
    tag: "Procese simple",
    question: "Ce proces corespunde valorii n = 0?",
    options: ["izoterm", "izobar", "izocor", "adiabatic"],
    correct: 1,
    explanation:
      "Pentru n = 0, pV⁰ = p = constant: proces izobar. Căldura molară devine C_p.",
  },
  {
    id: "q4",
    tag: "Procese simple",
    question: "Ce proces corespunde valorii n = 1?",
    options: ["izoterm", "izobar", "izocor", "adiabatic"],
    correct: 0,
    explanation:
      "Pentru n = 1, pV = constant: proces izoterm. ΔU = 0, deci Q = L; lucrul se calculează cu logaritm, nu cu relația (5).",
  },
  {
    id: "q5",
    tag: "Adiabată",
    question: "Pentru n = γ, căldura schimbată cu exteriorul este…",
    options: ["Q = ΔU", "Q = L", "Q = 0", "Q → ∞"],
    correct: 2,
    explanation:
      "La adiabată Q = 0. Atunci ΔU = −L: gazul se răcește la expansiune și se încălzește la comprimare.",
  },
  {
    id: "q6",
    tag: "Limite",
    question: "Când n → ±∞, procesul politrop tinde spre…",
    options: ["izobar", "izocor", "izoterm", "proces liniar"],
    correct: 1,
    explanation:
      "În limita n → ±∞, volumul rămâne constant: proces izocor. Lucrul mecanic este zero, iar C → C_V.",
  },
  {
    id: "q7",
    tag: "Lucru mecanic",
    question: "Pentru n ≠ 1, lucrul mecanic al politropei este…",
    options: [
      "L = νRΔT/(n−1)",
      "L = −νRΔT/(n−1)",
      "L = νRT ln(V₂/V₁)",
      "L = pΔV",
    ],
    correct: 1,
    explanation:
      "Relația (5) este L = −νRΔT/(n−1). Semnul contează: la expansiune ΔT este negativ pentru n > 1, deci L iese pozitiv.",
  },
  {
    id: "q8",
    tag: "Caz particular",
    question: "Procesul liniar p = k·V are indicele politropic…",
    options: ["n = 1", "n = 0", "n = −1", "n = γ"],
    correct: 2,
    explanation:
      "pV⁻¹ = constant se rescrie p = k·V. Este procesul liniar, cu C = (C_p + C_V)/2.",
  },
  {
    id: "q9",
    tag: "Căldura molară",
    question: "Relația dintre n și căldura molară C este…",
    options: [
      "n = (C − C_p)/(C − C_V)",
      "n = (C + C_p)/(C − C_V)",
      "n = (C − C_V)/(C − C_p)",
      "n = C_p/C_V",
    ],
    correct: 0,
    explanation:
      "Din Q = ΔU + L și relația Robert Mayer se obține n = (C − C_p)/(C − C_V), echivalent cu C = (C_p − nC_V)/(1−n).",
  },
  {
    id: "q10",
    tag: "Calcul",
    question:
      "Un mol de gaz diatomic suferă o încălzire izobară cu ΔT = 60 K. Lucrul mecanic este aproximativ…",
    options: ["0 J", "499 J", "1 247 J", "1 746 J"],
    correct: 1,
    explanation:
      "L = pΔV = νRΔT = 1 × 8,314 × 60 ≈ 499 J. Pentru comparație, Q = νC_pΔT ≈ 1 746 J, iar ΔU ≈ 1 247 J.",
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
      ? "Excelent — stăpânești familia politropelor."
      : percent >= 70
        ? "Foarte bine — ai o imagine clară a proceselor."
        : percent >= 50
          ? "Bun început — mai exersează cazurile speciale."
          : "Reia teoria și laboratorul, apoi încearcă din nou.";

  return (
    <section className="section section-quiz" id="verificare">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="Verificare"
            title="Testează-ți intuiția"
            lead="Zece întrebări scurte despre definiție, procesele simple, lucru mecanic și căldura molară. Primești feedback imediat și explicația fiecărui răspuns."
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
                    className={`quiz-feedback ${
                      isCorrect ? "is-correct" : "is-wrong"
                    }`}
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
              <h3>{percent}% — {verdict}</h3>
              <p>
                {score >= 7
                  ? "Poți trece la problemele de calcul și la comparația proceselor din laborator."
                  : "Reia definiția, legea pVⁿ = constant și tabelul proceselor simple, apoi încearcă din nou."}
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
                  <Flame size={16} />
                  Înapoi la laborator
                </a>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
