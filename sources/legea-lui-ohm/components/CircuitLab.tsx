"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { computeCircuit, clamp } from "@/lib/physics";
import {
  fmt,
  fmtCurrent,
  fmtPercent,
  fmtPower,
  fmtResistance,
  fmtVoltage,
} from "@/lib/format";
import { CircuitSchematic } from "./CircuitSchematic";
import { SourceChart } from "./SourceChart";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Formula } from "./Formula";
import {
  ArrowRight,
  Battery,
  Bolt,
  Gauge,
  Reset,
  Target,
} from "./Icons";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step, display, hint, onChange }: SliderProps) {
  const fill = clamp(((value - min) / (max - min)) * 100, 0, 100);
  return (
    <div className="lab-field">
      <label className="field-label">
        <span>{label}</span>
        <span className="field-value">{display}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

const CASES = [
  { id: "lamp", label: "Baterie + bec", emf: 4.5, internal: 0.35, external: 6 },
  { id: "lantern", label: "Lanternă", emf: 6, internal: 0.5, external: 5 },
  { id: "lab", label: "Sursă de laborator", emf: 12, internal: 0.2, external: 40 },
  { id: "battery", label: "Acumulator auto", emf: 12, internal: 0.04, external: 1.2 },
];

export function CircuitLab() {
  const [emf, setEmf] = useState(12);
  const [internal, setInternal] = useState(0.5);
  const [external, setExternal] = useState(5);
  const [showFull, setShowFull] = useState(false);
  const [caseId, setCaseId] = useState("lab");

  const model = useMemo(
    () => computeCircuit({ emf, internal, external }),
    [emf, internal, external],
  );

  const shorted = external < 0.02;
  const openCircuit = external > 900;

  const applyCase = (id: string) => {
    const item = CASES.find((entry) => entry.id === id);
    if (!item) return;
    setCaseId(id);
    setEmf(item.emf);
    setInternal(item.internal);
    setExternal(item.external);
  };

  const reset = () => {
    setCaseId("lab");
    setEmf(12);
    setInternal(0.5);
    setExternal(5);
    setShowFull(false);
  };

  const efficiencyTone =
    model.efficiency > 0.9 ? "good" : model.efficiency > 0.6 ? "mid" : "low";

  return (
    <section className="section section-circuit section-tint" id="circuit">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Circuit complet"
            title="Legea lui Ohm pentru întreg circuitul"
            lead="O sursă reală nu are doar tensiune electromotoare: are și rezistență internă. De aceea tensiunea la borne scade atunci când crește curentul. Reglează E, r și R și urmărește bilanțul energetic al circuitului."
            action={
              <span className="lab-head-chip">
                <Battery size={16} />
                sursă reală
              </span>
            }
          />
        </Reveal>

        <Reveal className="circuit-law" delay={40}>
          <div className="circuit-law-copy">
            <span className="card-kicker">Relația sursei</span>
            <p>
              Tensiunea electromotoare se împarte între căderea de tensiune
              exterioară <Formula tex="U=I\cdot R" /> și cea interioară{" "}
              <Formula tex="u=I\cdot r" />:
            </p>
            <Formula block tex="E=U+u" label="E egal U plus u" />
          </div>
          <div className="circuit-law-arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </div>
          <div className="circuit-law-main">
            <span className="card-kicker">de unde rezultă</span>
            <Formula
              block
              tex="I=\dfrac{E}{R+r}"
              label="I egal E supra R plus r"
              className="circuit-law-formula"
            />
            <p>
              Curentul depinde de <strong>suma</strong> rezistențelor, nu doar de
              cea exterioară. Cu cât <Formula tex="r" /> este mai mică, cu atât
              sursa se apropie de una ideală.
            </p>
          </div>
          <div className="circuit-law-chips">
            <span className="chip chip-amber">E = U + u</span>
            <span className="chip chip-cyan">I = E / (R + r)</span>
            <span className="chip">U = E − r·I</span>
          </div>
        </Reveal>

        <Reveal className="circuit-shell" delay={60}>
          <div className="circuit-top">
            <div className="circuit-presets" role="group" aria-label="Situații reale">
              {CASES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`lab-preset ${caseId === item.id ? "is-active" : ""}`}
                  onClick={() => applyCase(item.id)}
                  aria-pressed={caseId === item.id}
                >
                  <span className="lab-preset-dot" />
                  <span>{item.label}</span>
                  <small>
                    {item.emf} V · r = {item.internal} Ω
                  </small>
                </button>
              ))}
            </div>
            <div className="circuit-top-actions">
              <label className="toggle-inline">
                <input
                  type="checkbox"
                  checked={showFull}
                  onChange={(event) => setShowFull(event.target.checked)}
                />
                <span>arată tot graficul, până la scurtcircuit</span>
              </label>
              <button type="button" className="icon-button" onClick={reset} title="Reia valorile" aria-label="Reia valorile inițiale">
                <Reset size={18} />
              </button>
            </div>
          </div>

          <div className="circuit-body">
            <div className="circuit-schematic-card">
              <div className="circuit-schematic-head">
                <span className="card-kicker">schema circuitului</span>
                <span className={`chip ${shorted ? "chip-red" : openCircuit ? "chip-cyan" : "chip-green"}`}>
                  {shorted ? "scurtcircuit" : openCircuit ? "circuit deschis" : "circuit închis"}
                </span>
              </div>
              <CircuitSchematic
                emf={model.emf}
                internal={model.internal}
                external={model.external}
                current={model.current}
                terminal={model.terminal}
                shorted={shorted}
              />
              <div className="circuit-schematic-foot">
                <span>
                  <Battery size={14} /> E = {fmtVoltage(model.emf)}
                </span>
                <span>r = {fmtResistance(model.internal, 2)}</span>
                <span>R = {fmtResistance(model.external)}</span>
              </div>
            </div>

            <div className="circuit-chart-card">
              <div className="circuit-schematic-head">
                <span className="card-kicker">caracteristica sursei U(I)</span>
                <span className="chip">pantă = −r</span>
              </div>
              <SourceChart
                emf={model.emf}
                internal={model.internal}
                external={model.external}
                current={model.current}
                showFull={showFull}
                onScrub={(nextExternal) => {
                  setCaseId("");
                  setExternal(Number.isFinite(nextExternal) ? Math.max(0, Math.round(nextExternal * 100) / 100) : 1000);
                }}
              />
              <p className="circuit-chart-note">
                Dreapta pornește din <Formula tex="E" /> (mers în gol) și scade cu
                panta <Formula tex="-r" />. Trage punctul pentru a modifica{" "}
                <Formula tex="R" />.
              </p>
            </div>
          </div>

          <div className="circuit-metrics">
            <div className="metric-card metric-card-main">
              <span className="card-kicker">curentul</span>
              <strong>{fmtCurrent(model.current)}</strong>
              <span className="metric-formula">I = E / (R + r)</span>
            </div>
            <div className="metric-card">
              <span className="card-kicker">tensiunea la borne</span>
              <strong>{fmtVoltage(model.terminal)}</strong>
              <span className="metric-formula">U = I · R</span>
            </div>
            <div className="metric-card">
              <span className="card-kicker">cădere internă</span>
              <strong>{fmtVoltage(model.internalDrop)}</strong>
              <span className="metric-formula">u = I · r</span>
            </div>
            <div className="metric-card">
              <span className="card-kicker">putere totală</span>
              <strong>{fmtPower(model.totalPower)}</strong>
              <span className="metric-formula">P = E · I</span>
            </div>
            <div className="metric-card">
              <span className="card-kicker">putere utilă</span>
              <strong>{fmtPower(model.usefulPower)}</strong>
              <span className="metric-formula"><Formula tex="P_u=U\cdot I" /></span>
            </div>
            <div className={`metric-card metric-card-${efficiencyTone}`}>
              <span className="card-kicker">randament</span>
              <strong>{fmtPercent(model.efficiency)}</strong>
              <span className="metric-formula">η = U / E</span>
            </div>
          </div>

          <div className="balance-bar" aria-label="Bilanțul puterilor">
            <div className="balance-bar-head">
              <span className="card-kicker">bilanțul puterilor</span>
              <span>
                {fmtPower(model.usefulPower)} util + {fmtPower(model.internalPower)} pierdut
                = {fmtPower(model.totalPower)}
              </span>
            </div>
            <div className="balance-track">
              <span
                className="balance-useful"
                style={{ width: `${clamp(model.efficiency * 100, 0, 100)}%` }}
              />
              <span className="balance-internal" style={{ width: `${clamp((1 - model.efficiency) * 100, 0, 100)}%` }} />
            </div>
            <div className="balance-legend">
              <span>
                <i className="legend-dot legend-dot-cyan" />
                putere utilă în circuitul exterior
              </span>
              <span>
                <i className="legend-dot legend-dot-copper" />
                pierderi pe rezistența internă
              </span>
            </div>
          </div>

          <div className="circuit-controls">
            <Slider
              label="Tensiunea electromotoare E"
              value={emf}
              min={1}
              max={24}
              step={0.1}
              display={fmtVoltage(emf)}
              hint="proprietatea sursei, nu a circuitului"
              onChange={(value) => {
                setCaseId("");
                setEmf(value);
              }}
            />
            <Slider
              label="Rezistența internă r"
              value={internal}
              min={0.01}
              max={5}
              step={0.01}
              display={fmtResistance(internal, 2)}
              hint={`curent de scurtcircuit: ${fmtCurrent(model.shortCircuit)}`}
              onChange={(value) => {
                setCaseId("");
                setInternal(value);
              }}
            />
            <Slider
              label="Rezistența exterioară R"
              value={external}
              min={0}
              max={100}
              step={0.1}
              display={external > 900 ? "∞ (mers în gol)" : fmtResistance(external)}
              hint={`adaptare la R = r = ${fmtResistance(internal, 2)}`}
              onChange={(value) => {
                setCaseId("");
                setExternal(value);
              }}
            />
            <div className="circuit-quick">
              <span className="field-label">
                <span>Situații limită</span>
              </span>
              <div className="circuit-quick-buttons">
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => {
                    setCaseId("");
                    setExternal(0);
                  }}
                >
                  Scurtcircuit
                </button>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => {
                    setCaseId("");
                    setExternal(1000);
                  }}
                >
                  Mers în gol
                </button>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => {
                    setCaseId("");
                    setExternal(Number(internal.toFixed(2)));
                  }}
                >
                  Adaptare R = r
                </button>
              </div>
              <span className="field-hint">
                la adaptare, puterea utilă este maximă: {fmtPower(model.maxUsefulPower)}
              </span>
            </div>
          </div>
        </Reveal>

        <div className="circuit-explain">
          <Reveal className="explain-card" delay={40}>
            <span className="card-kicker">Problemă rezolvată</span>
            <h3>O spiră circulară cu curent</h3>
            <p>
              Printr-o spiră de diametru <Formula tex="D=1\ \mathrm{m}" /> trece
              curentul dat de o sursă cu <Formula tex="E=1{,}5\ \mathrm{V}" /> și{" "}
              <Formula tex="r=0{,}032\ \Omega" />. Sârma are secțiunea de{" "}
              <Formula tex="d=1\ \mathrm{mm}" /> și rezistivitatea{" "}
              <Formula tex="\rho=1{,}7\cdot10^{-8}\ \Omega\cdot\mathrm{m}" />.
              Află intensitatea curentului.
            </p>
            <div className="explain-steps">
              <div>
                <span className="solution-label">1 · rezistența spirei</span>
                <Formula tex="R=\rho\dfrac{\pi D}{\pi d^2/4}=\rho\dfrac{4D}{d^2}=6{,}8\cdot10^{-2}\ \Omega" />
              </div>
              <div>
                <span className="solution-label">2 · legea circuitului</span>
                <Formula tex="I=\dfrac{E}{R+r}=\dfrac{1{,}5}{0{,}068+0{,}032}" />
              </div>
              <div className="explain-result">
                <span className="solution-label">rezultat</span>
                <Formula tex="I=15\ \mathrm{A}" />
              </div>
            </div>
          </Reveal>

          <Reveal className="explain-card" delay={90}>
            <span className="card-kicker">Problemă rezolvată</span>
            <h3>Curentul de scurtcircuit ca metodă de măsurare</h3>
            <p>
              Un acumulator cu <Formula tex="E=12\ \mathrm{V}" /> are curentul de
              scurtcircuit <Formula tex="I_{sc}=40\ \mathrm{A}" />. Ce rezistor{" "}
              <Formula tex="R" /> trebuie legat la borne ca tensiunea să devină{" "}
              <Formula tex="U=11\ \mathrm{V}" />?
            </p>
            <div className="explain-steps">
              <div>
                <span className="solution-label">1 · rezistența internă</span>
                <Formula tex="r=\dfrac{E}{I_{sc}}=\dfrac{12}{40}=0{,}3\ \Omega" />
              </div>
              <div>
                <span className="solution-label">2 · din U = E·R/(R+r)</span>
                <Formula tex="R=\dfrac{U}{E-U}\cdot r=\dfrac{11}{1}\cdot0{,}3" />
              </div>
              <div className="explain-result">
                <span className="solution-label">rezultat</span>
                <Formula tex="R=3{,}3\ \Omega" />
              </div>
            </div>
            <p className="explain-note">
              <Target size={14} /> Rezultatul se verifică imediat:{" "}
              <Formula tex="I=12/3{,}6=3{,}33\ \mathrm{A}" />, deci{" "}
              <Formula tex="U=I\cdot R\approx11\ \mathrm{V}" />.
            </p>
          </Reveal>
        </div>

        <Reveal className="circuit-cards" delay={60}>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-amber">
              <Bolt size={18} />
            </span>
            <h3>Mers în gol</h3>
            <p>
              Când <Formula tex="R\to\infty" />, curentul tinde spre zero, iar
              tensiunea la borne devine egală cu t.e.m.:{" "}
              <Formula tex="U_0=E" />. Așa se măsoară <Formula tex="E" /> cu un
              voltmetru ideal.
            </p>
          </article>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-copper">
              <Gauge size={18} />
            </span>
            <h3>Scurtcircuit</h3>
            <p>
              Când <Formula tex="R=0" />, curentul atinge valoarea maximă{" "}
              <Formula tex="I_{sc}=E/r" />. Toată puterea se disipă pe sursă, care
              se poate supraîncălzi — de aceea se folosesc siguranțe.
            </p>
          </article>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-cyan">
              <Target size={18} />
            </span>
            <h3>Adaptare de putere</h3>
            <p>
              Puterea utilă <Formula tex="P_u=E^2R/(R+r)^2" /> este maximă când{" "}
              <Formula tex="R=r" />. Randamentul este atunci 50 %, deci adaptarea nu
              înseamnă și eficiență.
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
