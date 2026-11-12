"use client";

import { useId, useMemo, useState } from "react";
import {
  areaFromDiameter,
  clamp,
  computeWire,
  MATERIALS,
  type MaterialId,
} from "@/lib/resistance";
import {
  fmt,
  fmtArea,
  fmtCurrent,
  fmtDiameter,
  fmtLength,
  fmtMass,
  fmtPower,
  fmtResistance,
  fmtRho,
  fmtVoltage,
} from "@/lib/format";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  ArrowRight,
  CalculatorIcon,
  Copy,
  Printer,
  Reset,
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
  const [materialId, setMaterialId] = useState<MaterialId>("nicrom");
  const [length, setLength] = useState(5);
  const [diameter, setDiameter] = useState(0.5);
  const [temperature, setTemperature] = useState(20);
  const [voltage, setVoltage] = useState(12);
  const [copied, setCopied] = useState(false);

  const area = areaFromDiameter(diameter);

  const model = useMemo(
    () =>
      computeWire({
        materialId,
        length,
        area,
        temperature,
        current: 0,
      }),
    [materialId, length, area, temperature],
  );

  const current = voltage / Math.max(model.resistance, 1e-9);
  const power = voltage * current;
  const density = current / Math.max(area, 1e-6);
  const material = model.material;

  const reset = () => {
    setMaterialId("nicrom");
    setLength(5);
    setDiameter(0.5);
    setTemperature(20);
    setVoltage(12);
    setCopied(false);
  };

  const copyResults = async () => {
    const text = [
      "Rezistența unui fir — rezultate",
      `Material: ${material.name} (ρ₀ = ${fmtRho(material.rho20)})`,
      `L = ${fmtLength(length)}; d = ${fmtDiameter(diameter)}; A = ${fmtArea(area)}`,
      `t = ${fmt(temperature, 0)} °C; ρ = ${fmtRho(model.rho)}`,
      `R = ${fmtResistance(model.resistance, 3)}`,
      `U = ${fmtVoltage(voltage)}; I = ${fmtCurrent(current)}; P = ${fmtPower(power)}`,
      "R = ρL/A",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section section-calc" id="calculator">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="Aplicație de calcul"
            title="De la date la rezultat, pas cu pas"
            lead="Aplicația rezolvă problema ca la tablă: rezistivitatea la temperatura dată, secțiunea din diametru, rezistența, apoi curentul și puterea. Ideal pentru verificarea temelor și pentru prezentarea unui calcul complet."
            action={
              <span className="head-chip">
                <CalculatorIcon size={16} />
                calcul live
              </span>
            }
          />
        </Reveal>

        <div className="calc-grid">
          <Reveal className="calc-form" delay={40}>
            <div className="calc-form-head">
              <div>
                <span className="card-kicker">datele problemei</span>
                <h3>Firul și regimul de lucru</h3>
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
                <label className="field-label" htmlFor="calc-material">
                  <span>Materialul conductor</span>
                  <span className="field-value">{material.symbol}</span>
                </label>
                <select
                  id="calc-material"
                  value={materialId}
                  onChange={(event) => setMaterialId(event.target.value as MaterialId)}
                >
                  {MATERIALS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · ρ₀ = {fmtRho(item.rho20)} · α ={" "}
                      {fmt(item.alpha, 5)} K⁻¹
                    </option>
                  ))}
                </select>
              </div>

              <CalcField
                label="Lungimea L"
                unit="m"
                value={length}
                min={0.001}
                max={5000}
                step={0.01}
                onChange={setLength}
              />
              <CalcField
                label="Diametrul d"
                unit="mm"
                value={diameter}
                min={0.01}
                max={12}
                step={0.01}
                onChange={setDiameter}
                hint={`A = πd²/4 = ${fmtArea(area)}`}
              />
              <CalcField
                label="Temperatura t"
                unit="°C"
                value={temperature}
                min={-40}
                max={2500}
                step={1}
                onChange={setTemperature}
                hint={`ρ = ${fmtRho(model.rho)}`}
              />
              <CalcField
                label="Tensiunea U"
                unit="V"
                value={voltage}
                min={0.01}
                max={400}
                step={0.1}
                onChange={setVoltage}
                hint="pentru curentul prin fir"
              />
            </div>

            <div className="calc-form-foot">
              <span className="chip chip-copper">{material.name}</span>
              <span>
                ρ₀ = <strong>{fmtRho(material.rho20)}</strong>
              </span>
              <span>
                A = <strong>{fmtArea(area)}</strong>
              </span>
            </div>
          </Reveal>

          <Reveal className="calc-results" delay={90}>
            <div className="calc-result-grid" aria-live="polite">
              <div className="calc-result-card calc-result-r">
                <span className="calc-result-label">rezistența R</span>
                <strong>{fmtResistance(model.resistance, 3)}</strong>
                <small>la {fmt(temperature, 0)} °C</small>
              </div>
              <div className="calc-result-card calc-result-i">
                <span className="calc-result-label">curentul I</span>
                <strong>{fmtCurrent(current)}</strong>
                <small>U / R, la {fmtVoltage(voltage)}</small>
              </div>
              <div className="calc-result-card calc-result-u">
                <span className="calc-result-label">puterea P</span>
                <strong>{fmtPower(power)}</strong>
                <small>{fmt(density, 1)} A/mm²</small>
              </div>
              <div className="calc-result-card calc-result-m">
                <span className="calc-result-label">masa firului</span>
                <strong>{fmtMass(model.mass)}</strong>
                <small>{fmt(material.density, 0)} kg/m³</small>
              </div>
            </div>

            <div className="calc-state-strip">
              <div className="calc-state">
                <span className="calc-state-tag">determinat</span>
                <strong>{fmtRho(model.rho)}</strong>
                <span>rezistivitatea la t</span>
              </div>
              <span className="calc-state-arrow">
                <ArrowRight size={18} />
              </span>
              <div className="calc-state calc-state-final">
                <span className="calc-state-tag">rezultat</span>
                <strong>{fmtResistance(model.resistance, 3)}</strong>
                <span>R = ρL/A</span>
              </div>
            </div>

            <div className="calc-balance">
              <div>
                <span className="card-kicker">verificare</span>
                <strong>U = R·I</strong>
              </div>
              <span>
                {fmtVoltage(model.resistance * current)} ={" "}
                {fmtResistance(model.resistance, 3)} × {fmtCurrent(current)}
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
              <h3>Ce se întâmplă, în cinci pași</h3>
            </div>
            <span className="chip chip-copper">{material.name}</span>
          </div>

          <div className="calc-steps">
            <div className="calc-step">
              <span className="calc-step-num">01</span>
              <div>
                <strong>Rezistivitatea la temperatura dată</strong>
                <Formula block tex="\begin{aligned}\rho&=\rho_0(1+\alpha\,\Delta t)\\\Delta t&=t-20\,^{\circ}\mathrm{C}\end{aligned}" />
                <p>
                  {fmtRho(material.rho20)} × [1 + {fmt(material.alpha, 5)} × (
                  {fmt(temperature, 0)} − 20)] = <b>{fmtRho(model.rho)}</b>.
                  {material.alpha < 0
                    ? " α este negativ, deci ρ scade la încălzire."
                    : ""}
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">02</span>
              <div>
                <strong>Secțiunea transversală</strong>
                <Formula block tex="A=\dfrac{\pi d^{2}}{4}" />
                <p>
                  π × ({fmt(diameter, 2)} mm)² / 4 = <b>{fmtArea(area)}</b> ={" "}
                  {fmt(area * 1e-6, 3)} m².
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">03</span>
              <div>
                <strong>Rezistența firului</strong>
                <Formula block tex="R=\rho\,\dfrac{L}{A}" />
                <p>
                  {fmtRho(model.rho)} × {fmtLength(length)} / {fmtArea(area)} ={" "}
                  <b>{fmtResistance(model.resistance, 3)}</b>.
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">04</span>
              <div>
                <strong>Curentul prin fir</strong>
                <Formula block tex="I=\dfrac{U}{R}" />
                <p>
                  {fmtVoltage(voltage)} / {fmtResistance(model.resistance, 3)} ={" "}
                  <b>{fmtCurrent(current)}</b>.
                </p>
              </div>
            </div>

            <div className="calc-step">
              <span className="calc-step-num">05</span>
              <div>
                <strong>Puterea disipată și masa</strong>
                <Formula block tex="\begin{gathered}P=UI=R\,I^{2}\\m=\rho_{m}\,L\,A\end{gathered}" />
                <p>
                  P = {fmtVoltage(voltage)} × {fmtCurrent(current)} ={" "}
                  <b>{fmtPower(power)}</b>; m = {fmt(material.density, 0)} ×{" "}
                  {fmtLength(length)} × {fmtArea(area)} ={" "}
                  <b>{fmtMass(model.mass)}</b>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="calc-compare-card" delay={40}>
          <div className="calc-section-head">
            <div>
              <span className="eyebrow">comparație</span>
              <h3>Aceeași geometrie, alt material</h3>
            </div>
            <span className="chip">
              L = {fmtLength(length)} · d = {fmtDiameter(diameter)}
            </span>
          </div>
          <p className="calc-compare-lead">
            Tabelul recalculează rezistența pentru fiecare material, păstrând
            dimensiunile introduse mai sus. Este util când alegi între cupru și
            aluminiu pentru un cablu sau când explici de ce un reșou folosește
            nicrom.
          </p>
          <div className="table-wrap calc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>material</th>
                  <th>ρ (Ω·mm²/m)</th>
                  <th>R</th>
                  <th>I la U</th>
                  <th>P</th>
                  <th>masa</th>
                </tr>
              </thead>
              <tbody>
                {MATERIALS.map((item) => {
                  const row = computeWire({
                    materialId: item.id,
                    length,
                    area,
                    temperature,
                    current: 0,
                  });
                  const rowCurrent = voltage / Math.max(row.resistance, 1e-9);
                  return (
                    <tr
                      key={item.id}
                      className={item.id === materialId ? "is-current" : ""}
                    >
                      <td>
                        <span
                          className="calc-dot"
                          style={{ background: item.color }}
                        />
                        {item.name}
                      </td>
                      <td className="num">{fmt(item.rho20 * 1e6, 3)}</td>
                      <td className="num">{fmtResistance(row.resistance, 3)}</td>
                      <td className="num">{fmtCurrent(rowCurrent)}</td>
                      <td className="num">
                        {fmtPower(voltage * rowCurrent)}
                      </td>
                      <td className="num">{fmtMass(row.mass)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="calc-compare-note">
            Valorile de rezistivitate sunt orientative, la 20 °C, pentru metale
            și aliaje uzuale; la temperaturi mari, rezistența reală depinde și de
            răcire și de montaj.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
