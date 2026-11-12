"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import {
  clamp,
  compareSimpleProcesses,
  computeProcess,
  GASES,
  R,
  type GasKind,
} from "@/lib/physics";
import {
  fmt,
  fmtEnergy,
  fmtMolarHeat,
  fmtPressure,
  fmtTemp,
  fmtVolume,
} from "@/lib/format";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  CalculatorIcon,
  Copy,
  Printer,
  Reset,
  ArrowRight,
} from "./Icons";

function CalcField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="calc-field">
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        <span className="field-value">
          {fmt(value, step < 0.1 ? 2 : 1)} <small>{unit}</small>
        </span>
      </label>
      <div className="input-with-unit">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(clamp(next, min, max));
          }}
        />
        <span>{unit}</span>
      </div>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function CalculatorSection() {
  const [gas, setGas] = useState<GasKind>("di");
  const [nu, setNu] = useState(1);
  const [p1, setP1] = useState(100);
  const [V1, setV1] = useState(25);
  const [n, setN] = useState(1.2);
  const [V2, setV2] = useState(45);
  const [copied, setCopied] = useState(false);

  const gasData = GASES[gas];
  const ratio = V2 / V1;
  const model = useMemo(
    () =>
      computeProcess({
        gas,
        nu,
        p1,
        V1,
        n,
        ratio,
        isochoric: false,
      }),
    [gas, nu, p1, V1, n, ratio],
  );

  const comparison = compareSimpleProcesses({ gas, nu, p1, V1, ratio });
  const comparisonRows = useMemo(() => {
    const rows = [...comparison];
    if (!rows.some((row) => Math.abs(row.n - n) < 1e-4)) {
      rows.push({ n, result: model });
    }
    return rows;
  }, [comparison, model, n]);

  const capacity =
    !Number.isFinite(model.C)
      ? "∞"
      : Math.abs(model.C) > 1500
        ? "→ ±∞"
        : fmt(model.C, 2);

  const reset = () => {
    setGas("di");
    setNu(1);
    setP1(100);
    setV1(25);
    setN(1.2);
    setV2(45);
    setCopied(false);
  };

  const copyResults = async () => {
    const text = [
      "Transformarea politropă — rezultate",
      `Gaz: ${gasData.name}; ν = ${fmt(nu, 1)} mol`,
      `p₁ = ${fmtPressure(model.p1)}; V₁ = ${fmtVolume(model.V1)}; T₁ = ${fmtTemp(model.T1)}`,
      `n = ${fmt(n, 2)}; V₂ = ${fmtVolume(model.V2)}`,
      `p₂ = ${fmtPressure(model.p2)}; T₂ = ${fmtTemp(model.T2)}`,
      `L = ${fmtEnergy(model.L, 0)}; ΔU = ${fmtEnergy(model.dU, 0)}; Q = ${fmtEnergy(model.Q, 0)}`,
      `C = ${capacity} J/(mol·K)`,
      "Q = ΔU + L",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const nOptions = [
    { label: "−1", value: -1 },
    { label: "0", value: 0 },
    { label: "1", value: 1 },
    { label: "γ", value: gasData.gamma },
  ];

  return (
    <section className="section section-calc" id="calculator">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Aplicație de calcul"
            title="De la date la rezultat, pas cu pas"
            lead="Introdu starea inițială, indicele politropic și volumul final. Calculatorul afișează starea finală, lucrul mecanic, căldura, variația energiei interne și rezolvarea completă — utilă la tablă sau pentru verificarea temelor."
            action={
              <span className="lab-head-chip">
                <CalculatorIcon size={16} />
                calculate live
              </span>
            }
          />
        </Reveal>

        <div className="calc-grid">
          <Reveal className="calc-form" delay={40}>
            <div className="calc-form-head">
              <div>
                <span className="card-kicker">datele problemei</span>
                <h3>Starea inițială și destinația</h3>
              </div>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={reset}
              >
                <Reset size={15} />
                Reset
              </button>
            </div>

            <div className="calc-fields">
              <div className="calc-field calc-field-full">
                <span className="field-label">
                  <span>Gazul</span>
                  <span className="field-value">{gasData.short}</span>
                </span>
                <div className="segmented calc-gas-toggle">
                  <button
                    type="button"
                    className={gas === "di" ? "is-active" : ""}
                    onClick={() => setGas("di")}
                  >
                    Diatomic
                  </button>
                  <button
                    type="button"
                    className={gas === "mono" ? "is-active" : ""}
                    onClick={() => setGas("mono")}
                  >
                    Monoatomic
                  </button>
                </div>
              </div>

              <CalcField
                label="Cantitate ν"
                unit="mol"
                value={nu}
                min={0.05}
                max={20}
                step={0.1}
                onChange={setNu}
              />
              <CalcField
                label="Presiunea p₁"
                unit="kPa"
                value={p1}
                min={10}
                max={1000}
                step={1}
                onChange={setP1}
              />
              <CalcField
                label="Volumul V₁"
                unit="L"
                value={V1}
                min={1}
                max={200}
                step={1}
                onChange={setV1}
              />
              <CalcField
                label="Volumul V₂"
                unit="L"
                value={V2}
                min={1}
                max={200}
                step={1}
                onChange={setV2}
                hint={`raport V₂/V₁ = ${fmt(ratio, 2)}×`}
              />

              <div className="calc-field calc-field-full calc-n-field">
                <label className="field-label" htmlFor="calc-n-range">
                  <span>Indicele politropic n</span>
                  <span className="field-value">n = {fmt(n, 2)}</span>
                </label>
                <div className="calc-n-row">
                  <input
                    id="calc-n-range"
                    type="range"
                    min={-1.5}
                    max={2.5}
                    step={0.01}
                    value={n}
                    onChange={(event) => setN(Number(event.target.value))}
                    style={
                      {
                        "--fill": `${((n + 1.5) / 4) * 100}%`,
                      } as CSSProperties
                    }
                  />
                  <input
                    className="calc-n-number"
                    type="number"
                    min={-1.5}
                    max={2.5}
                    step={0.01}
                    value={n}
                    aria-label="Valoarea indicelui politropic"
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isFinite(next)) setN(clamp(next, -1.5, 2.5));
                    }}
                  />
                </div>
                <div className="calc-quick-n">
                  {nOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={Math.abs(n - option.value) < 1e-4 ? "is-active" : ""}
                      onClick={() => setN(option.value)}
                    >
                      n = {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="calc-form-foot">
              <span className={`process-chip process-chip-${model.info.tone}`}>
                {model.info.name}
              </span>
              <span>
                T₁ = <strong>{fmtTemp(model.T1)}</strong>
              </span>
              <span>
                C<sub>V</sub> = <strong>{fmtMolarHeat(gasData.cv, 2)}</strong>
              </span>
            </div>
          </Reveal>

          <Reveal className="calc-results" delay={90}>
            <div className="calc-result-grid" aria-live="polite">
              <div className="calc-result-card calc-result-q">
                <span className="calc-result-label">căldura Q</span>
                <strong>{fmtEnergy(model.Q, 0)}</strong>
                <small>{model.Q >= 0 ? "primită de gaz" : "cedată de gaz"}</small>
              </div>
              <div className="calc-result-card calc-result-l">
                <span className="calc-result-label">lucru L</span>
                <strong>{fmtEnergy(model.L, 0)}</strong>
                <small>{model.L >= 0 ? "efectuat de gaz" : "asupra gazului"}</small>
              </div>
              <div className="calc-result-card calc-result-du">
                <span className="calc-result-label">ΔU</span>
                <strong>{fmtEnergy(model.dU, 0)}</strong>
                <small>{model.dU >= 0 ? "energie internă crește" : "energie internă scade"}</small>
              </div>
              <div className="calc-result-card calc-result-c">
                <span className="calc-result-label">C molar</span>
                <strong>{capacity}</strong>
                <small>J/(mol·K)</small>
              </div>
            </div>

            <div className="calc-state-strip">
              <div className="calc-state">
                <span className="calc-state-tag">01 · inițial</span>
                <strong>{fmtPressure(model.p1)}</strong>
                <span>
                  {fmtVolume(model.V1)} · {fmtTemp(model.T1)}
                </span>
              </div>
              <span className="calc-state-arrow">
                <ArrowRight size={18} />
              </span>
              <div className="calc-state calc-state-final">
                <span className="calc-state-tag">02 · final</span>
                <strong>{fmtPressure(model.p2)}</strong>
                <span>
                  {fmtVolume(model.V2)} · {fmtTemp(model.T2)}
                </span>
              </div>
            </div>

            <div className="calc-balance">
              <div>
                <span className="card-kicker">bilanț energetic</span>
                <strong>Q = ΔU + L</strong>
              </div>
              <span>
                {Math.round(model.Q)} J = {Math.round(model.dU)} J +{" "}
                {Math.round(model.L)} J
              </span>
            </div>

            <div className="calc-actions">
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={copyResults}
              >
                <Copy size={15} />
                {copied ? "Copiat!" : "Copiază rezultatele"}
              </button>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                Printează fișa
              </button>
              <span className="calc-actions-note">
                actualizare instant, fără buton „calculează”
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal className="calc-steps-card" delay={40}>
          <div className="calc-section-head">
            <div>
              <span className="eyebrow">rezolvare completă</span>
              <h3>Ce se întâmplă, în șase pași</h3>
            </div>
            <span className={`process-chip process-chip-${model.info.tone}`}>
              {model.info.name}
            </span>
          </div>

          <div className="calc-steps">
            <div className="calc-step">
              <span className="calc-step-num">01</span>
              <div>
                <strong>Temperatura inițială</strong>
                <Formula block tex="T_{1}=\dfrac{p_{1}V_{1}}{\nu R}" />
                <p>
                  {fmt(p1, 1)} kPa × {fmt(V1, 1)} L / ({fmt(nu, 1)} mol ×
                  8,314 J/(mol·K)) = <b>{fmtTemp(model.T1)}</b>
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">02</span>
              <div>
                <strong>Presiunea finală</strong>
                <Formula block tex="p_{2}=p_{1}\left(\dfrac{V_{1}}{V_{2}}\right)^{n}" />
                <p>
                  {fmt(p1, 1)} kPa × ({fmt(V1, 1)}/{fmt(V2, 1)})^{fmt(n, 2)} ={" "}
                  <b>{fmtPressure(model.p2)}</b>
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">03</span>
              <div>
                <strong>Temperatura finală</strong>
                {model.isIsothermal ? (
                  <>
                    <Formula block tex="T_{2}=T_{1}" />
                    <p>izotermă: temperatura rămâne constantă.</p>
                  </>
                ) : (
                  <>
                    <Formula block tex="T_{2}=T_{1}\left(\dfrac{V_{1}}{V_{2}}\right)^{n-1}" />
                    <p>
                      {fmtTemp(model.T1)} × ({fmt(V1, 1)}/{fmt(V2, 1)})^{fmt(n - 1, 2)} ={" "}
                      <b>{fmtTemp(model.T2)}</b>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">04</span>
              <div>
                <strong>Lucrul mecanic</strong>
                {model.isIsothermal ? (
                  <>
                    <Formula block tex="L=\nu RT_{1}\ln\dfrac{V_{2}}{V_{1}}" />
                    <p>
                      {fmt(nu, 1)} mol × 8,314 × {fmtTemp(model.T1)} × ln(
                      {fmt(ratio, 2)}) = <b>{fmtEnergy(model.L, 0)}</b>
                    </p>
                  </>
                ) : (
                  <>
                    <Formula block tex="L=\dfrac{p_{1}V_{1}-p_{2}V_{2}}{n-1}" />
                    <p>
                      ({fmt(p1, 1)} × {fmt(V1, 1)} − {fmt(model.p2 / 1000, 1)} ×{" "}
                      {fmt(V2, 1)}) / ({fmt(n, 2)} − 1) ={" "}
                      <b>{Math.round(model.L)} J</b>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">05</span>
              <div>
                <strong>Variația energiei interne</strong>
                <Formula block tex="\Delta U=\nu C_{V}(T_{2}-T_{1})" />
                <p>
                  {fmt(nu, 1)} × {fmt(gasData.cv, 2)} × ({fmtTemp(model.T2)} −{" "}
                      {fmtTemp(model.T1)}) = <b>{Math.round(model.dU)} J</b>
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">06</span>
              <div>
                <strong>Căldura și căldura molară</strong>
                <Formula block tex="\begin{gathered}Q=\Delta U+L\\C=C_{V}+\dfrac{R}{1-n}\end{gathered}" />
                <p>
                  Q = {Math.round(model.dU)} J + {Math.round(model.L)} J ={" "}
                  <b>{Math.round(model.Q)} J</b>; C = {fmt(gasData.cv, 2)} +{" "}
                  {fmt(R, 2)}/(1 − {fmt(n, 2)}) = <b>{capacity} J/(mol·K)</b>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="calc-compare-card" delay={40}>
          <div className="calc-section-head">
            <div>
              <span className="eyebrow">comparație</span>
              <h3>Aceeași stare inițială, același V₂</h3>
            </div>
            <span className="chip">toate procesele pornesc din starea 1</span>
          </div>
          <p className="calc-compare-lead">
            Schimbarea lui <em>n</em> schimbă felul în care este împărțită energia
            între căldură, lucru mecanic și energie internă. Tabelul folosește
            aceleași date de intrare ca formularul de mai sus.
          </p>
          <div className="table-wrap calc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>n</th>
                  <th>proces</th>
                  <th>p₂</th>
                  <th>T₂</th>
                  <th>L</th>
                  <th>Q</th>
                  <th>ΔU</th>
                  <th>C</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => {
                  const result = row.result;
                  const isCurrent = Math.abs(row.n - n) < 1e-4;
                  const nLabel =
                    Math.abs(row.n + 1) < 1e-4
                      ? "−1"
                      : Math.abs(row.n) < 1e-4
                        ? "0"
                        : Math.abs(row.n - 1) < 1e-4
                          ? "1"
                          : Math.abs(row.n - gasData.gamma) < 1e-4
                            ? "γ"
                            : fmt(row.n, 2);
                  return (
                    <tr key={`${row.n}`} className={isCurrent ? "is-current" : ""}>
                      <td>
                        <b className="mono">{nLabel}</b>
                      </td>
                      <td>
                        <span className={`process-chip process-chip-${result.info.tone}`}>
                          {result.info.name}
                        </span>
                      </td>
                      <td className="num">{fmtPressure(result.p2)}</td>
                      <td className="num">{fmtTemp(result.T2)}</td>
                      <td className="num">{fmtEnergy(result.L, 0)}</td>
                      <td className="num">{fmtEnergy(result.Q, 0)}</td>
                      <td className="num">{fmtEnergy(result.dU, 0)}</td>
                      <td className="num">
                        {Number.isFinite(result.C) ? fmtMolarHeat(result.C, 2) : "∞"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="calc-compare-note">
            Izocorul nu apare în tabel: cu V₂ = V₁ el nu poate ajunge la aceeași
            destinație. Îl poți studia separat în laborator.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
