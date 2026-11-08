"use client";

import { useState } from "react";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { CalculatorIcon, ChevronDown, Sparkles } from "./Icons";

interface Problem {
  id: string;
  number: string;
  tag: string;
  title: string;
  statement: React.ReactNode;
  given: Array<{ symbol: string; value: string }>;
  steps: Array<{ label: string; tex?: string; text?: React.ReactNode }>;
  answer: { tex: string; text: string };
  note?: React.ReactNode;
}

const PROBLEMS: Problem[] = [
  {
    id: "p1",
    number: "01",
    tag: "Legea pe o porțiune",
    title: "Curentul printr-un rezistor",
    statement: (
      <>
        Un rezistor de <Formula tex="R=250\ \Omega" /> este legat la o sursă care
        menține la bornele lui o tensiune de <Formula tex="U=5\ \mathrm{V}" />.
        Ce curent îl străbate și ce putere disipă?
      </>
    ),
    given: [
      { symbol: "R", value: "250 Ω" },
      { symbol: "U", value: "5 V" },
    ],
    steps: [
      { label: "aplicăm legea", tex: "I=\\dfrac{U}{R}=\\dfrac{5}{250}" },
      { label: "curentul", tex: "I=0{,}02\\ \\mathrm{A}=20\\ \\mathrm{mA}" },
      { label: "puterea", tex: "P=U\\cdot I=5\\cdot0{,}02=0{,}1\\ \\mathrm{W}" },
    ],
    answer: { tex: "I=20\\ \\mathrm{mA},\\quad P=0{,}1\\ \\mathrm{W}", text: "100 mW" },
    note: (
      <>
        Verificare: <Formula tex="P=I^2R=(0{,}02)^2\cdot250=0{,}1\ \mathrm{W}" />. Cele
        două căi dau același rezultat — semn că datele sunt coerente.
      </>
    ),
  },
  {
    id: "p2",
    number: "02",
    tag: "Circuit complet",
    title: "Tensiunea la bornele unei baterii",
    statement: (
      <>
        O baterie are <Formula tex="E=9\ \mathrm{V}" /> și{" "}
        <Formula tex="r=1{,}5\ \Omega" />. Ea alimentează un bec cu rezistența de{" "}
        <Formula tex="R=6\ \Omega" />. Calculează curentul, tensiunea la borne și
        randamentul.
      </>
    ),
    given: [
      { symbol: "E", value: "9 V" },
      { symbol: "r", value: "1,5 Ω" },
      { symbol: "R", value: "6 Ω" },
    ],
    steps: [
      { label: "curentul", tex: "I=\\dfrac{E}{R+r}=\\dfrac{9}{7{,}5}=1{,}2\\ \\mathrm{A}" },
      { label: "tensiunea la borne", tex: "U=I\\cdot R=1{,}2\\cdot6=7{,}2\\ \\mathrm{V}" },
      { label: "verificare", tex: "E=U+I\\cdot r=7{,}2+1{,}8=9\\ \\mathrm{V}\\ \\checkmark" },
      { label: "randamentul", tex: "\\eta=\\dfrac{U}{E}=\\dfrac{7{,}2}{9}=0{,}8=80\\,\\%" },
    ],
    answer: { tex: "I=1{,}2\\ \\mathrm{A},\\quad U=7{,}2\\ \\mathrm{V},\\quad \\eta=80\\,\\%", text: "1,2 A · 7,2 V · 80 %" },
    note: (
      <>
        Cei <Formula tex="1{,}8\ \mathrm{V}" /> lipsă sunt căderea internă{" "}
        <Formula tex="u=I\cdot r" />. Ea crește dacă becul se înlocuiește cu unul cu{" "}
        <Formula tex="R" /> mai mică — și atunci tensiunea la borne scade.
      </>
    ),
  },
  {
    id: "p3",
    number: "03",
    tag: "Adaptare de putere",
    title: "Puterea maximă transferată",
    statement: (
      <>
        O sursă cu <Formula tex="E=12\ \mathrm{V}" /> și{" "}
        <Formula tex="r=2\ \Omega" /> este conectată la un rezistor variabil{" "}
        <Formula tex="R" />. Pentru ce valoare a lui <Formula tex="R" /> puterea
        utilă este maximă și cât valorează ea?
      </>
    ),
    given: [
      { symbol: "E", value: "12 V" },
      { symbol: "r", value: "2 Ω" },
    ],
    steps: [
      {
        label: "puterea utilă",
        tex: "P_u=I^2R=\\dfrac{E^2R}{(R+r)^2}",
      },
      {
        label: "maxim când R = r",
        tex: "R=r=2\\ \\Omega",
      },
      {
        label: "puterea la adaptare",
        tex: "P_{u,\\max}=\\dfrac{E^2}{4r}=\\dfrac{144}{8}=18\\ \\mathrm{W}",
      },
      {
        label: "randamentul scade",
        tex: "\\eta=\\dfrac{R}{R+r}=50\\,\\%",
      },
    ],
    answer: { tex: "R=2\\ \\Omega,\\quad P_{u,\\max}=18\\ \\mathrm{W},\\quad \\eta=50\\,\\%", text: "2 Ω · 18 W · 50 %" },
    note: (
      <>
        Adaptarea de putere nu este același lucru cu eficiența. Pentru transportul
        energiei electrice se urmărește randament mare (<Formula tex="R\gg r" />), nu
        putere maximă pe un singur consumator.
      </>
    ),
  },
  {
    id: "p4",
    number: "04",
    tag: "Rezistența unui fir",
    title: "Cât de lung poate fi un cablu?",
    statement: (
      <>
        Un cablu de cupru (<Formula tex="\rho=1{,}7\cdot10^{-8}\ \Omega\cdot\mathrm{m}" />)
        are secțiunea de <Formula tex="1{,}5\ \mathrm{mm^2}" />. Acceptăm o cădere de
        tensiune de maximum <Formula tex="0{,}5\ \mathrm{V}" /> la un curent de{" "}
        <Formula tex="10\ \mathrm{A}" />. Ce lungime maximă poate avea cablul?
      </>
    ),
    given: [
      { symbol: "ρ", value: "1,7·10⁻⁸ Ω·m" },
      { symbol: "S", value: "1,5 mm²" },
      { symbol: "ΔU", value: "0,5 V" },
      { symbol: "I", value: "10 A" },
    ],
    steps: [
      {
        label: "rezistența admisă",
        tex: "R=\\dfrac{\\Delta U}{I}=\\dfrac{0{,}5}{10}=0{,}05\\ \\Omega",
      },
      {
        label: "din R = ρL/S",
        tex: "L=\\dfrac{R\\,S}{\\rho}=\\dfrac{0{,}05\\cdot1{,}5\\cdot10^{-6}}{1{,}7\\cdot10^{-8}}",
      },
      { label: "rezultat", tex: "L\\approx4{,}4\\ \\mathrm{m}" },
    ],
    answer: { tex: "L\\approx4{,}4\\ \\mathrm{m}", text: "≈ 4,4 m" },
    note: (
      <>
        În practică, lungimea utilă este jumătate: cablul are dus și întors, iar
        căderea de tensiune apare pe ambii conductori.
      </>
    ),
  },
  {
    id: "p5",
    number: "05",
    tag: "Măsurare",
    title: "Cât de mare este eroarea?",
    statement: (
      <>
        Se măsoară un rezistor de <Formula tex="R=100\ \Omega" /> cu un ampermetru
        de <Formula tex="R_A=1\ \Omega" /> și un voltmetru de{" "}
        <Formula tex="R_V=100\ \mathrm{k\Omega}" />. Ce erori relative dau cele două
        montaje?
      </>
    ),
    given: [
      { symbol: "R", value: "100 Ω" },
      { symbol: "R_A", value: "1 Ω" },
      { symbol: "R_V", value: "100 kΩ" },
    ],
    steps: [
      {
        label: "amonte",
        tex: "\\dfrac{\\Delta R}{R}=\\dfrac{R_A}{R}=1\\,\\%",
      },
      {
        label: "aval",
        tex: "\\dfrac{\\Delta R}{R}\\approx-\\dfrac{R}{R_V}=-0{,}1\\,\\%",
      },
      {
        label: "prag de decizie",
        tex: "\\sqrt{R_A R_V}=\\sqrt{10^5}\\approx316\\ \\Omega",
      },
    ],
    answer: { tex: "\\text{amonte: }+1\\,\\%,\\qquad\\text{aval: }-0{,}1\\,\\%", text: "+1 % vs −0,1 %" },
    note: (
      <>
        Pentru <Formula tex="R=100\ \Omega" />, montajul aval este clar mai bun:
        eroarea este de zece ori mai mică. Regula{" "}
        <Formula tex="R<\sqrt{R_A R_V}" /> confirmă: 100 Ω &lt; 316 Ω, deci aval.
      </>
    ),
  },
  {
    id: "p6",
    number: "06",
    tag: "Bec real",
    title: "De ce becul nu este ohmic",
    statement: (
      <>
        Un bec are marcat <Formula tex="6\ \mathrm{V}"/>, <Formula tex="3\ \mathrm{W}" />.
        La rece, filamentul are aproximativ <Formula tex="1{,}2\ \Omega" />. Compară
        curentul la rece cu cel nominal și explică abaterea.
      </>
    ),
    given: [
      { symbol: "U_n", value: "6 V" },
      { symbol: "P_n", value: "3 W" },
      { symbol: "R_rece", value: "1,2 Ω" },
    ],
    steps: [
      {
        label: "rezistența nominală (la cald)",
        tex: "R_n=\\dfrac{U_n^2}{P_n}=\\dfrac{36}{3}=12\\ \\Omega",
      },
      {
        label: "raportul de rezistență",
        tex: "\\dfrac{R_n}{R_{\\text{rece}}}=10",
      },
      {
        label: "curentul de pornire",
        tex: "I_0=\\dfrac{6}{1{,}2}=5\\ \\mathrm{A}\\quad\\text{față de }0{,}5\\ \\mathrm{A}",
      },
    ],
    answer: { tex: "R_{\\text{cald}}/R_{\\text{rece}}=10", text: "de zece ori mai mare la cald" },
    note: (
      <>
        La pornire, curentul este de zece ori mai mare decât în regim nominal. De
        aceea becurile se ard cel mai des la aprindere — și de aceea filamentul nu
        respectă legea lui Ohm cu <Formula tex="R" /> constant.
      </>
    ),
  },
];

const CALCULATORS = [
  {
    id: "law",
    label: "Legea lui Ohm",
    formula: "I=\\dfrac{U}{R}",
    fields: [
      { key: "u", label: "U", unit: "V", initial: 12 },
      { key: "r", label: "R", unit: "Ω", initial: 40 },
    ],
    results: (values: Record<string, number>) => {
      const { u, r } = values;
      return [
        { label: "I", value: `${(u / Math.max(r, 1e-9)).toFixed(4)} A`, tex: "I=U/R" },
        { label: "P", value: `${((u * u) / Math.max(r, 1e-9)).toFixed(3)} W`, tex: "P=U^2/R" },
      ];
    },
  },
  {
    id: "circuit",
    label: "Circuit complet",
    formula: "I=\\dfrac{E}{R+r}",
    fields: [
      { key: "e", label: "E", unit: "V", initial: 12 },
      { key: "r", label: "r", unit: "Ω", initial: 0.5 },
      { key: "bigR", label: "R", unit: "Ω", initial: 5 },
    ],
    results: (values: Record<string, number>) => {
      const { e, r, bigR } = values;
      const i = e / Math.max(r + bigR, 1e-9);
      const u = i * bigR;
      return [
        { label: "I", value: `${i.toFixed(4)} A`, tex: "I=E/(R+r)" },
        { label: "U", value: `${u.toFixed(3)} V`, tex: "U=I\\cdot R" },
        { label: "η", value: `${((u / Math.max(e, 1e-9)) * 100).toFixed(1)} %`, tex: "\\eta=U/E" },
      ];
    },
  },
  {
    id: "wire",
    label: "Rezistența firului",
    formula: "R=\\rho\\dfrac{L}{S}",
    fields: [
      { key: "rho", label: "ρ (10⁻⁸ Ω·m)", unit: "", initial: 1.68 },
      { key: "l", label: "L", unit: "m", initial: 10 },
      { key: "s", label: "S", unit: "mm²", initial: 1.5 },
    ],
    results: (values: Record<string, number>) => {
      const rho = values.rho * 1e-8;
      const area = values.s * 1e-6;
      const r = (rho * values.l) / Math.max(area, 1e-15);
      return [
        { label: "R", value: `${r.toFixed(4)} Ω`, tex: "R=\\rho L/S" },
        { label: "1/R", value: `${(1 / Math.max(r, 1e-12)).toFixed(3)} S`, tex: "G=1/R" },
      ];
    },
  },
  {
    id: "series",
    label: "Grupare serie/paralel",
    formula: "R_s=R_1+R_2",
    fields: [
      { key: "r1", label: "R₁", unit: "Ω", initial: 10 },
      { key: "r2", label: "R₂", unit: "Ω", initial: 15 },
    ],
    results: (values: Record<string, number>) => {
      const { r1, r2 } = values;
      const series = r1 + r2;
      const parallel = (r1 * r2) / Math.max(r1 + r2, 1e-9);
      return [
        { label: "serie", value: `${series.toFixed(2)} Ω`, tex: "R_s=R_1+R_2" },
        { label: "paralel", value: `${parallel.toFixed(2)} Ω`, tex: "1/R_p=1/R_1+1/R_2" },
      ];
    },
  },
];

export function ProblemsSection() {
  const [openId, setOpenId] = useState<string>("p1");
  const [calcId, setCalcId] = useState("law");
  const [values, setValues] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    for (const calc of CALCULATORS) {
      initial[calc.id] = Object.fromEntries(calc.fields.map((field) => [field.key, field.initial]));
    }
    return initial;
  });

  const activeCalc = CALCULATORS.find((calc) => calc.id === calcId) ?? CALCULATORS[0];
  const activeValues = values[activeCalc.id];
  const activeResults = activeCalc.results(activeValues);

  return (
    <section className="section section-problems" id="probleme">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="Aplicații și calcul"
            title="Șase probleme rezolvate, pas cu pas"
            lead="De la legea pe o porțiune, la circuit complet, adaptare de putere, rezistența unui cablu și erorile de măsurare. Deschide fiecare problemă ca să vezi raționamentul complet."
            action={
              <span className="lab-head-chip">
                <Sparkles size={16} />
                rezolvări detaliate
              </span>
            }
          />
        </Reveal>

        <div className="problems-layout">
          <Reveal className="problems-list" delay={40}>
            {PROBLEMS.map((problem) => {
              const open = openId === problem.id;
              return (
                <article className={`problem ${open ? "is-open" : ""}`} key={problem.id}>
                  <button
                    type="button"
                    className="problem-head"
                    onClick={() => setOpenId(open ? "" : problem.id)}
                    aria-expanded={open}
                  >
                    <span className="problem-number">{problem.number}</span>
                    <span className="problem-head-copy">
                      <span className="problem-tag">{problem.tag}</span>
                      <strong>{problem.title}</strong>
                    </span>
                    <span className={`problem-chevron ${open ? "is-open" : ""}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {open ? (
                    <div className="problem-body">
                      <p className="problem-statement">{problem.statement}</p>
                      <div className="problem-given">
                        {problem.given.map((item) => (
                          <span className="problem-given-item" key={item.symbol}>
                            <b>
                              <Formula
                                tex={item.symbol.replace(/_([A-Za-z0-9]+)/g, "_{\\mathrm{$1}}")}
                              />
                            </b>
                            <span>= {item.value}</span>
                          </span>
                        ))}
                      </div>
                      <ol className="problem-steps">
                        {problem.steps.map((step, index) => (
                          <li key={step.label}>
                            <span className="problem-step-index">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <span className="solution-label">{step.label}</span>
                              {step.tex ? <Formula tex={step.tex} /> : null}
                              {step.text ? <span>{step.text}</span> : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="problem-answer">
                        <span className="card-kicker">răspuns</span>
                        <Formula tex={problem.answer.tex} />
                        <span className="problem-answer-text">{problem.answer.text}</span>
                      </div>
                      {problem.note ? <p className="problem-note">{problem.note}</p> : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </Reveal>

          <Reveal className="calculator-card" delay={90}>
            <div className="calculator-head">
              <div>
                <span className="card-kicker">calculator rapid</span>
                <h3>Verifică-ți calculele</h3>
              </div>
              <span className="calculator-icon">
                <CalculatorIcon size={18} />
              </span>
            </div>

            <div className="calculator-tabs" role="tablist" aria-label="Tip de calcul">
              {CALCULATORS.map((calc) => (
                <button
                  key={calc.id}
                  type="button"
                  role="tab"
                  aria-selected={calcId === calc.id}
                  className={calcId === calc.id ? "is-active" : ""}
                  onClick={() => setCalcId(calc.id)}
                >
                  {calc.label}
                </button>
              ))}
            </div>

            <div className="calculator-formula">
              <Formula block tex={activeCalc.formula} />
            </div>

            <div className="calculator-fields">
              {activeCalc.fields.map((field) => (
                <label className="calculator-field" key={field.key}>
                  <span className="calculator-field-label">
                    {field.label} {field.unit ? <em>{field.unit}</em> : null}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={activeValues[field.key]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [activeCalc.id]: {
                          ...current[activeCalc.id],
                          [field.key]: Number(event.target.value),
                        },
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="calculator-results">
              {activeResults.map((result) => (
                <div className="calculator-result" key={result.label}>
                  <span className="card-kicker">{result.label}</span>
                  <strong>{result.value}</strong>
                </div>
              ))}
            </div>

            <p className="calculator-note">
              Valorile se recalculează instant. Păstrează două-trei cifre
              semnificative, ca în exemplele de mai sus.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
