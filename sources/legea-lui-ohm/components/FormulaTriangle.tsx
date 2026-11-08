"use client";

import { useState } from "react";
import { Formula } from "./Formula";

type Target = "U" | "I" | "R";

const DETAIL: Record<
  Target,
  { tex: string; label: string; legend: { symbol: string; name: string; unit: string }[] }
> = {
  I: {
    tex: "I=\\dfrac{U}{R}",
    label: "I egal U supra R",
    legend: [
      { symbol: "I", name: "intensitatea curentului", unit: "amper (A)" },
      { symbol: "U", name: "tensiunea aplicată", unit: "volt (V)" },
      { symbol: "R", name: "rezistența electrică", unit: "ohm (Ω)" },
    ],
  },
  U: {
    tex: "U=R\\cdot I",
    label: "U egal R ori I",
    legend: [
      { symbol: "U", name: "tensiunea la capete", unit: "volt (V)" },
      { symbol: "R", name: "rezistența electrică", unit: "ohm (Ω)" },
      { symbol: "I", name: "intensitatea curentului", unit: "amper (A)" },
    ],
  },
  R: {
    tex: "R=\\dfrac{U}{I}",
    label: "R egal U supra I",
    legend: [
      { symbol: "R", name: "rezistența electrică", unit: "ohm (Ω)" },
      { symbol: "U", name: "tensiunea la capete", unit: "volt (V)" },
      { symbol: "I", name: "intensitatea curentului", unit: "amper (A)" },
    ],
  },
};

const ORDER: Target[] = ["U", "I", "R"];

/**
 * Triunghiul U–I–R. Selectează mărimea căutată și formulele se rearanjează.
 */
export function FormulaTriangle() {
  const [target, setTarget] = useState<Target>("I");
  const detail = DETAIL[target];

  return (
    <div className="triangle-card">
      <div className="triangle-copy">
        <span className="card-kicker">o lege, trei forme</span>
        <h3>Alege ce cauți</h3>
        <p>
          Legea lui Ohm leagă trei mărimi. Dacă știi două, a treia se obține
          printr-o simplă împărțire sau înmulțire.
        </p>
        <div className="triangle-buttons" role="group" aria-label="Alege mărimea de calculat">
          {ORDER.map((item) => (
            <button
              key={item}
              type="button"
              className={`triangle-button ${target === item ? "is-active" : ""}`}
              onClick={() => setTarget(item)}
              aria-pressed={target === item}
            >
              <span className="triangle-button-symbol">{item}</span>
              <span className="triangle-button-label">
                {item === "U" ? "tensiunea" : item === "I" ? "curentul" : "rezistența"}
              </span>
            </button>
          ))}
        </div>
        <div className="triangle-legend">
          {detail.legend.map((row) => (
            <div className="triangle-legend-row" key={row.symbol}>
              <span className="triangle-symbol">{row.symbol}</span>
              <span>{row.name}</span>
              <span className="triangle-unit">{row.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="triangle-visual">
        <svg viewBox="0 0 260 220" className="triangle-svg" role="img" aria-label="Triunghiul U–I–R: U sus, I stânga jos, R dreapta jos">
          <defs>
            <linearGradient id="triangle-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--copper)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polygon points="130,22 244,196 16,196" fill="url(#triangle-fill)" stroke="var(--line-strong)" strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="130" y1="22" x2="130" y2="112" stroke="var(--line-strong)" strokeWidth="1.4" />
          <line x1="73" y1="154" x2="187" y2="154" stroke="var(--line-strong)" strokeWidth="1.4" />
          <text x="130" y="88" textAnchor="middle" className={`triangle-glyph ${target === "U" ? "is-active" : ""}`}>U</text>
          <text x="76" y="186" textAnchor="middle" className={`triangle-glyph ${target === "I" ? "is-active" : ""}`}>I</text>
          <text x="184" y="186" textAnchor="middle" className={`triangle-glyph ${target === "R" ? "is-active" : ""}`}>R</text>
          <text x="130" y="136" textAnchor="middle" className="triangle-tiny">supra</text>
        </svg>
        <div className="triangle-result">
          <Formula block tex={detail.tex} label={detail.label} />
          <span className="triangle-result-caption">
            deci <b>{target}</b> se calculează direct din celelalte două
          </span>
        </div>
      </div>
    </div>
  );
}
