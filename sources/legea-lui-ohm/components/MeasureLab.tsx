"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { clamp, computeMeasurement } from "@/lib/physics";
import {
  fmt,
  fmtCurrent,
  fmtPower,
  fmtResistance,
  fmtVoltage,
} from "@/lib/format";
import { MeasureSchematic } from "./MeasureSchematic";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Formula } from "./Formula";
import { CalculatorIcon, CheckCircle, Reset, Target, XCircle } from "./Icons";

const PRESETS = [
  { id: "big", label: "Rezistor mare", target: 4700, ammeter: 0.5, voltmeter: 1e6 },
  { id: "mid", label: "Rezistor mediu", target: 267.5, ammeter: 4, voltmeter: 1e5 },
  { id: "small", label: "Rezistor mic", target: 12, ammeter: 0.4, voltmeter: 2e4 },
];

export function MeasureLab() {
  const [amonte, setAmonte] = useState(true);
  const [target, setTarget] = useState(4700);
  const [ammeter, setAmmeter] = useState(0.5);
  const [voltmeter, setVoltmeter] = useState(1e6);
  const [emf, setEmf] = useState(12);
  const [internal, setInternal] = useState(0.3);
  const [presetId, setPresetId] = useState("big");

  const model = useMemo(
    () => computeMeasurement({ target, voltmeter, ammeter, emf, internal, amonte }),
    [target, voltmeter, ammeter, emf, internal, amonte],
  );

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setTarget(preset.target);
    setAmmeter(preset.ammeter);
    setVoltmeter(preset.voltmeter);
  };

  const reset = () => {
    setAmonte(true);
    setPresetId("big");
    setTarget(4700);
    setAmmeter(0.5);
    setVoltmeter(1e6);
    setEmf(12);
    setInternal(0.3);
  };

  const errorPercent = model.relativeError * 100;
  const corrected =
    amonte
      ? model.voltmeterReading / model.ammeterReading - ammeter
      : (model.voltmeterReading * voltmeter) /
        Math.max(voltmeter - model.voltmeterReading, 1e-9);

  // regula practică: amonte pentru R >> R_A, aval pentru R << R_V
  const geometric = Math.sqrt(ammeter * voltmeter);
  const recommended = target > geometric ? "amonte" : "aval";
  const matches = (recommended === "amonte") === amonte;

  return (
    <section className="section section-measure" id="masurare">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="Lucrare de laborator"
            title="Măsurarea rezistenței cu voltmetrul și ampermetrul"
            lead="Din legea lui Ohm, R = U/I. Dar instrumentele reale nu sunt ideale: voltmetrul consumă un curent mic, ampermetrul are o rezistență proprie. Alege montajul și vezi imediat cât de mult contează."
            action={
              <span className="lab-head-chip">
                <CalculatorIcon size={16} />
                montaj amonte vs aval
              </span>
            }
          />
        </Reveal>

        <Reveal className="measure-shell" delay={50}>
          <div className="measure-toolbar">
            <div className="segmented measure-mode">
              <button
                type="button"
                className={amonte ? "is-active" : ""}
                onClick={() => setAmonte(true)}
              >
                Montaj amonte (R mare)
              </button>
              <button
                type="button"
                className={!amonte ? "is-active" : ""}
                onClick={() => setAmonte(false)}
              >
                Montaj aval (R mică)
              </button>
            </div>
            <div className="measure-toolbar-right">
              <div className="measure-presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`lab-preset ${presetId === preset.id ? "is-active" : ""}`}
                    onClick={() => applyPreset(preset.id)}
                    aria-pressed={presetId === preset.id}
                  >
                    <span className="lab-preset-dot" />
                    <span>{preset.label}</span>
                    <small>{preset.target >= 1000 ? `${fmt(preset.target / 1000, 1)} kΩ` : `${preset.target} Ω`}</small>
                  </button>
                ))}
              </div>
              <button type="button" className="icon-button" onClick={reset} title="Reia" aria-label="Reia valorile">
                <Reset size={18} />
              </button>
            </div>
          </div>

          <div className="measure-body">
            <div className="measure-canvas-card">
              <MeasureSchematic
                amonte={amonte}
                target={target}
                ammeter={ammeter}
                voltmeter={voltmeter}
                emf={emf}
                internal={internal}
                voltmeterReading={model.voltmeterReading}
                ammeterReading={model.ammeterReading}
              />
              <div className="measure-canvas-foot">
                <span>V: {fmtVoltage(model.voltmeterReading, 3)}</span>
                <span>A: {fmtCurrent(model.ammeterReading, 2)}</span>
                <span><Formula tex="R_A" /> = {fmtResistance(ammeter, 2)}</span>
                <span><Formula tex="R_V" /> = {fmtResistance(voltmeter, 0)}</span>
              </div>
            </div>

            <aside className="measure-side">
              <div className="measure-equation">
                <span className="card-kicker">calculul din citiri</span>
                <Formula
                  block
                  tex="R_{\text{measured}}=\dfrac{U}{I}=\dfrac{U_V}{I_A}"
                  label="R measured equals U over I"
                />
                <div className="measure-comparison">
                  <div>
                    <span className="card-kicker">valoare reală</span>
                    <strong>{fmtResistance(target)}</strong>
                  </div>
                  <div>
                    <span className="card-kicker">valoare măsurată</span>
                    <strong>{fmtResistance(model.measured)}</strong>
                  </div>
                  <div className={Math.abs(errorPercent) < 1 ? "is-good" : "is-bad"}>
                    <span className="card-kicker">eroare relativă</span>
                    <strong>
                      {errorPercent > 0 ? "+" : ""}
                      {fmt(errorPercent, 2)} %
                    </strong>
                  </div>
                </div>
              </div>

              <div className={`measure-verdict ${matches ? "is-good" : "is-bad"}`}>
                {matches ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <div>
                  <strong>
                    {matches
                      ? "Montajul ales este potrivit."
                      : `Pentru ${fmtResistance(target)} ar fi mai bun montajul ${recommended}.`}
                  </strong>
                  <p>
                    Regula practică: compară <Formula tex="R" /> cu{" "}
                    <Formula tex="\sqrt{R_A R_V}" /> ={" "}
                    <span className="mono">{fmtResistance(geometric)}</span>. Sub această
                    valoare, montajul aval dă eroare mai mică.
                  </p>
                </div>
              </div>

              <div className="measure-correction">
                <span className="card-kicker">corecția citirii</span>
                <p>
                  {amonte ? (
                    <>
                      Voltmetrul măsoară și căderea pe ampermetru, deci{" "}
                      <Formula tex="\dfrac{U}{I}=R+R_A" />. Corectăm scăzând{" "}
                      <Formula tex="R_A" />.
                    </>
                  ) : (
                    <>
                      Ampermetrul măsoară și curentul voltmetrului, deci{" "}
                      <Formula tex="\dfrac{U}{I}=\dfrac{RR_V}{R+R_V}" />. Corectăm
                      cu formula de mai jos.
                    </>
                  )}
                </p>
                <div className="measure-correction-value">
                  <span>R corectat</span>
                  <strong>{fmtResistance(corrected)}</strong>
                </div>
                <div className="measure-correction-value">
                  <span>R rămas</span>
                  <strong>{fmtResistance(Math.abs(corrected - target), 2)}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="measure-methods">
            <div className={`method-card ${amonte ? "is-active" : ""}`}>
              <span className="method-tag">amonte</span>
              <h3>Ampermetru înaintea rezistorului</h3>
              <p>
                Voltmetrul cuprinde și ampermetrul. Curentul este corect, tensiunea
                este prea mare, deci <Formula tex="R" /> iese supraevaluat.
              </p>
              <Formula tex="R=\dfrac{U}{I}-R_A" />
              <span className="method-use">
                <Target size={14} />
                pentru <Formula tex="R \gg R_A" />
              </span>
            </div>
            <div className={`method-card ${!amonte ? "is-active" : ""}`}>
              <span className="method-tag">aval</span>
              <h3>Voltmetru doar pe rezistor</h3>
              <p>
                Ampermetrul măsoară și curentul voltmetrului. Tensiunea este
                corectă, curentul este prea mare, deci <Formula tex="R" /> iese
                subevaluat.
              </p>
              <Formula tex="R=\dfrac{U}{I-R_V^{-1}U}" />
              <span className="method-use">
                <Target size={14} />
                pentru <Formula tex="R \ll R_V" />
              </span>
            </div>
            <div className="method-card method-card-note">
              <span className="method-tag">de ce doi pași</span>
              <h3>O soluție practică</h3>
              <p>
                Dacă ambele rezistențe sunt mici sau ambele sunt comparabile cu
                instrumentele, se măsoară de două ori — în amonte și în aval — și
                se compară. Diferența arată care instrument deformează citirea.
              </p>
              <span className="method-use">
                <CalculatorIcon size={14} />
                media geometrică a montajelor
              </span>
            </div>
          </div>

          <div className="measure-controls">
            <div className="lab-field">
              <label className="field-label">
                <span>Rezistența de măsurat R</span>
                <span className="field-value">{fmtResistance(target, 1)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10000}
                step={1}
                value={target}
                aria-label="Rezistența de măsurat"
                onChange={(event) => {
                  setPresetId("");
                  setTarget(Number(event.target.value));
                }}
                style={{ "--fill": `${(Math.log10(target) / 4) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">scară logaritmică, 1 Ω → 10 kΩ</span>
            </div>
            <div className="lab-field">
              <label className="field-label">
                <span>Rezistența ampermetrului</span>
                <span className="field-value">{fmtResistance(ammeter, 2)}</span>
              </label>
              <input
                type="range"
                min={0.01}
                max={50}
                step={0.01}
                value={ammeter}
                aria-label="Rezistența internă a ampermetrului"
                onChange={(event) => {
                  setPresetId("");
                  setAmmeter(Number(event.target.value));
                }}
                style={{ "--fill": `${(Math.log10(ammeter * 100) / Math.log10(5000)) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">ideal ar fi zero</span>
            </div>
            <div className="lab-field">
              <label className="field-label">
                <span>Rezistența voltmetrului</span>
                <span className="field-value">{fmtResistance(voltmeter, 0)}</span>
              </label>
              <input
                type="range"
                min={1000}
                max={2000000}
                step={1000}
                value={voltmeter}
                aria-label="Rezistența internă a voltmetrului"
                onChange={(event) => {
                  setPresetId("");
                  setVoltmeter(Number(event.target.value));
                }}
                style={{ "--fill": `${(Math.log10(voltmeter / 1000) / Math.log10(2000)) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">ideal ar fi infinit</span>
            </div>
            <div className="lab-field">
              <label className="field-label">
                <span>Tensiunea de alimentare</span>
                <span className="field-value">{fmtVoltage(emf)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={24}
                step={0.5}
                value={emf}
                aria-label="Tensiunea de alimentare"
                onChange={(event) => setEmf(Number(event.target.value))}
                style={{ "--fill": `${((emf - 1) / 23) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">sursa montajului de laborator</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="measure-lab-table" delay={60}>
          <div className="data-table-head">
            <div>
              <span className="card-kicker">tabel de laborator</span>
              <h3>Aceleași instrumente, trei rezistențe</h3>
            </div>
            <span className="chip"><Formula tex="R_A" /> = {fmtResistance(ammeter, 2)}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>R reală</th>
                  <th>amonte: R măsurat</th>
                  <th>eroare amonte</th>
                  <th>aval: R măsurat</th>
                  <th>eroare aval</th>
                  <th>montaj recomandat</th>
                </tr>
              </thead>
              <tbody>
                {[4.7, 47, 470, 4700, 47000].map((value) => {
                  const on = computeMeasurement({
                    target: value,
                    voltmeter,
                    ammeter,
                    emf,
                    internal,
                    amonte: true,
                  });
                  const off = computeMeasurement({
                    target: value,
                    voltmeter,
                    ammeter,
                    emf,
                    internal,
                    amonte: false,
                  });
                  const best = Math.abs(on.relativeError) < Math.abs(off.relativeError) ? "amonte" : "aval";
                  return (
                    <tr key={value}>
                      <td className="mono">{fmtResistance(value)}</td>
                      <td className="mono">{fmtResistance(on.measured)}</td>
                      <td className={`mono ${Math.abs(on.relativeError) > 0.02 ? "cell-warn" : ""}`}>
                        {fmt(on.relativeError * 100, 2)} %
                      </td>
                      <td className="mono">{fmtResistance(off.measured)}</td>
                      <td className={`mono ${Math.abs(off.relativeError) > 0.02 ? "cell-warn" : ""}`}>
                        {fmt(off.relativeError * 100, 2)} %
                      </td>
                      <td>
                        <span className={`chip ${best === "amonte" ? "chip-amber" : "chip-cyan"}`}>
                          {best}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="measure-table-note">
            <Target size={14} />
            Erorile se inversează la mijlocul intervalului: montajul amonte
            supraevaluează, cel aval subevaluează. Pentru rezistențe comparabile cu{" "}
            <Formula tex="\sqrt{R_A R_V}" /> ambele erori sunt mici, dar niciunul nu
            este „gratuit”.
          </p>
        </Reveal>

        <Reveal className="measure-callout" delay={50}>
          <div className="callout">
            <span className="callout-icon">!</span>
            <p>
              <strong>De ce contează?</strong> Un voltmetru de laborator are{" "}
              <Formula tex="R_V\sim10^5\ \Omega" />, iar un ampermetru{" "}
              <Formula tex="R_A\sim1\ \Omega" />. Diferența de cinci ordine de
              mărime explică de ce pentru rezistențe obișnuite erorile sunt mici —
              și de ce pentru rezistențe extreme trebuie ales montajul potrivit.
            </p>
          </div>
          <div className="callout callout-cyan">
            <span className="callout-icon">
              <CheckCircle size={16} />
            </span>
            <p>
              <strong>Concluzia lucrării:</strong> valoarea{" "}
              <Formula tex="R=U/I" /> coincide cu valoarea reală doar dacă{" "}
              <Formula tex="R_A\ll R" /> în amonte și <Formula tex="R\ll R_V" /> în
              aval. Altfel, citirea se corectează sau se alege celălalt montaj.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
