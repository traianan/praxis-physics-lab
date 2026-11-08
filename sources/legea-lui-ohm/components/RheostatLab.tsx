"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { clamp, computeRheostat } from "@/lib/physics";
import {
  fmt,
  fmtCurrent,
  fmtLength,
  fmtPower,
  fmtResistance,
  fmtVoltage,
} from "@/lib/format";
import { RheostatSchematic, type RheostatMode } from "./RheostatSchematic";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Formula } from "./Formula";
import { ArrowRight, Reset, Ruler, SlidersIcon, Target } from "./Icons";

const WIRE_TOTAL = 20; // Ω, fir de nicrom pentru laborator

export function RheostatLab() {
  const [mode, setMode] = useState<RheostatMode>("series");
  const [fraction, setFraction] = useState(0.45);
  const [emf, setEmf] = useState(12);
  const [internal, setInternal] = useState(0.5);
  const [wireResistance, setWireResistance] = useState(WIRE_TOTAL);
  const [load, setLoad] = useState(6);

  const model = useMemo(
    () =>
      computeRheostat({
        emf,
        internal,
        wireResistance,
        wireLength: 1,
        cursorLength: fraction,
        load: mode === "divider" ? Infinity : load,
        // reostatul din serie e în serie cu un consumator de 6 Ω
      }),
    [emf, internal, wireResistance, fraction, load, mode],
  );

  // Montaj serie: doar porțiunea A–C rămâne în circuit.
  const activeSeries = wireResistance * fraction;
  const seriesCurrent = model.seriesCurrent;
  const current = mode === "series" ? seriesCurrent : Math.max(model.dividerCurrent, 0);
  const voltageOut = mode === "series" ? activeSeries * seriesCurrent : model.dividerVoltage;

  const reset = () => {
    setMode("series");
    setFraction(0.45);
    setEmf(12);
    setInternal(0.5);
    setWireResistance(WIRE_TOTAL);
    setLoad(6);
  };

  const activePower =
    mode === "series"
      ? activeSeries * seriesCurrent * seriesCurrent
      : model.activePower;

  return (
    <section className="section section-rheostat" id="reostat">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Reostat"
            title="Reostatul și montajul potențiometric"
            lead="Rezistența unui fir este proporțională cu lungimea lui. Pe această proprietate se bazează reostatul: un cursor care ia mai mult sau mai puțin fir în circuit. În serie reglează curentul; ca divizor de tensiune reglează tensiunea."
            action={
              <span className="lab-head-chip">
                <SlidersIcon size={16} />
                cursor glisant
              </span>
            }
          />
        </Reveal>

        <Reveal className="rheostat-law" delay={40}>
          <div className="rheostat-law-item">
            <span className="card-kicker">principiul</span>
            <Formula tex="R_{AC}=\rho\dfrac{l_{AC}}{S}=k\cdot l_{AC}" />
            <p>Rezistența porțiunii de fir crește liniar cu lungimea utilizată.</p>
          </div>
          <div className="rheostat-law-item">
            <span className="card-kicker">în serie</span>
            <Formula tex="I=\dfrac{E}{R_{AC}+\ldots+r}" />
            <p>Cu cât lungimea <Formula tex="l_{AC}" /> este mai mare, cu atât curentul scade.</p>
          </div>
          <div className="rheostat-law-item">
            <span className="card-kicker">ca divizor</span>
            <Formula tex="U_{AC}=k\cdot I\cdot l_{AC}" />
            <p>Cu cât lungimea <Formula tex="l_{AC}" /> este mai mare, cu atât tensiunea crește.</p>
          </div>
        </Reveal>

        <Reveal className="rheostat-shell" delay={60}>
          <div className="rheostat-toolbar">
            <div className="segmented rheostat-mode">
              <button
                type="button"
                className={mode === "series" ? "is-active" : ""}
                onClick={() => setMode("series")}
              >
                Montaj serie
              </button>
              <button
                type="button"
                className={mode === "divider" ? "is-active" : ""}
                onClick={() => setMode("divider")}
              >
                Montaj potențiometric
              </button>
            </div>
            <div className="rheostat-toolbar-right">
              <span className="chip">
                {mode === "series" ? "reglează curentul" : "reglează tensiunea"}
              </span>
              <button type="button" className="icon-button" onClick={reset} title="Reia" aria-label="Reia valorile">
                <Reset size={18} />
              </button>
            </div>
          </div>

          <div className="rheostat-body">
            <div className="rheostat-canvas-card">
              <RheostatSchematic
                mode={mode}
                fraction={fraction}
                emf={emf}
                internal={internal}
                current={current}
                voltage={voltageOut}
                activeResistance={mode === "series" ? activeSeries : model.activeResistance}
                totalResistance={wireResistance}
              />
              <div className="rheostat-slot">
                <span className="rheostat-slot-label">cursor</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={Math.round(fraction * 100)}
                  aria-label="Poziția cursorului pe fir"
                  onChange={(event) => setFraction(Number(event.target.value) / 100)}
                  style={{ "--fill": `${fraction * 100}%` } as CSSProperties}
                />
                <span className="rheostat-slot-value">{fmt(fraction * 100, 0)} %</span>
              </div>
              <div className="rheostat-canvas-foot">
                <span>
                  <Ruler size={14} />
                  l<sub>AC</sub> = {fmtLength(fraction, 3)}
                </span>
                <span>
                  R<sub>AC</sub> = {fmtResistance(mode === "series" ? activeSeries : model.activeResistance)}
                </span>
                <span>
                  R<sub>AB</sub> = {fmtResistance(wireResistance)}
                </span>
              </div>
              <div className="rheostat-canvas-legend">
                <div>
                  <span className="rheostat-legend-term">A, B</span>
                  <span>capetele firului de rezistență</span>
                </div>
                <div>
                  <span className="rheostat-legend-term">C</span>
                  <span>cursorul care alege lungimea activă</span>
                </div>
                <div>
                  <Formula className="rheostat-legend-term" tex="R_{AC}" />
                  <span>partea din fir rămasă în circuit</span>
                </div>
                {mode === "series" ? (
                  <div>
                    <span className="rheostat-legend-term">C–B</span>
                    <span>restul firului, în afara circuitului</span>
                  </div>
                ) : (
                  <div>
                    <span className="rheostat-legend-term">V</span>
                    <span>culege tensiunea între A și cursor</span>
                  </div>
                )}
              </div>
            </div>

            <aside className="rheostat-side">
              <div className="rheostat-readout">
                <div className="rheostat-readout-main">
                  <span className="card-kicker">
                    {mode === "series" ? "curentul în circuit" : "tensiunea la bornele A–C"}
                  </span>
                  <strong>{mode === "series" ? fmtCurrent(current) : fmtVoltage(voltageOut)}</strong>
                  <span className="metric-formula">
                    <Formula tex={mode === "series" ? "I=E/(R_{AC}+R_s+r)" : "U_{AC}=k\\cdot I\\cdot l_{AC}"} />
                  </span>
                </div>
                <div className="rheostat-readout-grid">
                  <div>
                    <span className="card-kicker">cădere pe <Formula tex="R_{AC}" /></span>
                    <strong>{fmtVoltage((mode === "series" ? activeSeries : model.activeResistance) * current)}</strong>
                  </div>
                  <div>
                    <span className="card-kicker">putere pe reostat</span>
                    <strong>{fmtPower(activePower)}</strong>
                  </div>
                  <div>
                    <span className="card-kicker">rest de fir</span>
                    <strong>{fmt(fraction <= 1 ? (1 - fraction) * 100 : 0, 0)} %</strong>
                  </div>
                  <div>
                    <span className="card-kicker">rezistență specifică</span>
                    <strong>{fmt(wireResistance, 1)} Ω/m</strong>
                  </div>
                </div>
              </div>

              <div className={`rheostat-hint rheostat-hint-${mode}`}>
                <Target size={16} />
                <p>
                  {mode === "series"
                    ? "Mișcă cursorul spre B: lungimea activă crește, deci curentul scade. Acesta este comportamentul reostatului conectat în serie."
                    : <>Mișcă cursorul spre B: porțiunea A–C crește, deci tensiunea <Formula tex="U_{AC}" /> crește, iar becul se aprinde mai tare. Montajul funcționează ca divizor potențiometric.</>}
                </p>
              </div>

              <div className="rheostat-mini-chart">
                <span className="card-kicker">
                  {mode === "series" ? "I(l)" : "U(l)"} — dependența de lungime
                </span>
                <RheostatMiniChart
                  mode={mode}
                  emf={emf}
                  internal={internal}
                  wireResistance={wireResistance}
                  load={load}
                  fraction={fraction}
                />
              </div>
            </aside>
          </div>

          <div className="rheostat-controls">
            <div className="lab-field">
              <label className="field-label">
                <span>Tensiunea electromotoare</span>
                <span className="field-value">{fmtVoltage(emf)}</span>
              </label>
              <input
                type="range"
                min={2}
                max={24}
                step={0.1}
                value={emf}
                aria-label="Tensiunea electromotoare"
                onChange={(event) => setEmf(Number(event.target.value))}
                style={{ "--fill": `${((emf - 2) / 22) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">sursa care alimentează montajul</span>
            </div>
            <div className="lab-field">
              <label className="field-label">
                <span>Rezistența totală a firului</span>
                <span className="field-value">{fmtResistance(wireResistance)}</span>
              </label>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={wireResistance}
                aria-label="Rezistența totală a firului"
                onChange={(event) => setWireResistance(Number(event.target.value))}
                style={{ "--fill": `${((wireResistance - 2) / 58) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">fir de nicrom înfășurat pe suport izolator</span>
            </div>
            <div className="lab-field">
              <label className="field-label">
                <span>Rezistența consumatorului</span>
                <span className="field-value">{fmtResistance(load)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={load}
                aria-label="Rezistența consumatorului"
                onChange={(event) => setLoad(Number(event.target.value))}
                style={{ "--fill": `${((load - 1) / 39) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">
                {mode === "series" ? "în serie cu reostatul" : "doar pentru montajul serie"}
              </span>
            </div>
            <div className="lab-field">
              <label className="field-label">
                <span>Rezistența internă a sursei</span>
                <span className="field-value">{fmtResistance(internal, 2)}</span>
              </label>
              <input
                type="range"
                min={0.05}
                max={3}
                step={0.05}
                value={internal}
                aria-label="Rezistența internă a sursei"
                onChange={(event) => setInternal(Number(event.target.value))}
                style={{ "--fill": `${((internal - 0.05) / 2.95) * 100}%` } as CSSProperties}
              />
              <span className="field-hint">influențează curentul maxim posibil</span>
            </div>
          </div>
        </Reveal>

        <div className="rheostat-explain">
          <Reveal className="explain-card" delay={40}>
            <span className="card-kicker">Demonstrație · montaj serie</span>
            <h3>Reostatul în serie</h3>
            <p>
              Deplasează cursorul C de la A spre B. Lungimea utilizată crește,
              rezistența crește, iar intensitatea curentului scade. Dacă întorci
              cursorul, curentul crește din nou.
            </p>
            <div className="explain-steps">
              <div>
                <span className="solution-label">legea porțiunii</span>
                <Formula tex="R_{AC}=k\,l_{AC}" />
              </div>
              <div>
                <span className="solution-label">înlocuit în lege</span>
                <Formula tex="I=\dfrac{E}{R_{AC}+\ldots+r}=\dfrac{E}{k\,l_{AC}+\ldots+r}" />
              </div>
              <div className="explain-result">
                <span className="solution-label">concluzie</span>
                <p>
                  cu cât <Formula tex="l_{AC}" /> este mai mare, cu atât curentul
                  este mai mic
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="explain-card" delay={90}>
            <span className="card-kicker">Demonstrație · montaj potențiometric</span>
            <h3>Montajul potențiometric</h3>
            <p>
              Cursorul ia o fracțiune din tensiunea de pe fir. Voltmetrul arată o
              tensiune reglabilă între <Formula tex="0" /> și tensiunea de
              alimentare. Dispozitivul astfel montat se numește{" "}
              <strong>potențiometru</strong> sau <strong>divizor de tensiune</strong>.
            </p>
            <div className="explain-steps">
              <div>
                <span className="solution-label">tensiunea pe porțiune</span>
                <Formula tex="U_{AC}=I\cdot R_{AC}=k\,I\,l_{AC}" />
              </div>
              <div>
                <span className="solution-label">fracțiunea din tensiune</span>
                <Formula tex="\dfrac{U_{AC}}{U_{AB}}=\dfrac{l_{AC}}{L}" />
              </div>
              <div className="explain-result">
                <span className="solution-label">concluzie</span>
                <p>
                  cu cât <Formula tex="l_{AC}" /> este mai mare, cu atât tensiunea
                  este mai mare
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="rheostat-problem" delay={50}>
          <div className="rheostat-problem-copy">
            <span className="eyebrow">Problemă aplicată</span>
            <h3>Cât de departe trebuie dus cursorul?</h3>
            <p>
              Montajul potențiometric conține o sursă cu{" "}
              <Formula tex="E=40\ \mathrm{V}" /> și <Formula tex="r=1\ \Omega" />,
              un fir <Formula tex="AB" /> de <Formula tex="L=0{,}8\ \mathrm{m}" />{" "}
              cu rezistența <Formula tex="R_1=6\ \Omega" />. Pe porțiunea{" "}
              <Formula tex="AC" /> căderea de tensiune trebuie să fie{" "}
              <Formula tex="U=15\ \mathrm{V}" />. Află distanța{" "}
              <Formula tex="x=AC" />.
            </p>
            <div className="review-card-chips">
              <span className="chip chip-amber">fir omogen</span>
              <span className="chip">R ∝ l</span>
            </div>
          </div>
          <div className="rheostat-problem-steps">
            <div className="solution-step">
              <span className="solution-label">1 · raportul tensiunilor</span>
              <Formula tex="\dfrac{E}{U}=\dfrac{R_1+r}{R_x}+1" />
            </div>
            <div className="solution-step">
              <span className="solution-label">2 · proporționalitatea cu lungimea</span>
              <Formula tex="\dfrac{R_1}{R_x}=\dfrac{L}{x}" />
            </div>
            <div className="solution-step">
              <span className="solution-label">3 · eliminăm R_x</span>
              <Formula tex="x=L\cdot\dfrac{R_1}{R_1+r}\cdot\dfrac{U}{E-U}" />
            </div>
            <div className="solution-step solution-step-accent">
              <span className="solution-label">rezultat</span>
              <Formula tex="x=0{,}8\cdot\dfrac{6}{7}\cdot\dfrac{15}{25}=0{,}4\ \mathrm{m}" />
            </div>
          </div>
        </Reveal>

        <Reveal className="rheostat-cards" delay={60}>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-copper">
              <Ruler size={18} />
            </span>
            <h3>De ce firul este înfășurat?</h3>
            <p>
              Ca să încapă o lungime mare într-un spațiu mic. Firul de nicrom are
              rezistivitate mare, deci o lungime moderată dă deja zeci de ohmi.
            </p>
          </article>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-cyan">
              <ArrowRight size={18} />
            </span>
            <h3>Serie sau divizor?</h3>
            <p>
              În serie reostatul limitează curentul. Ca divizor, el oferă o
              tensiune variabilă. Aceeași piesă, două funcții — depinde doar de
              felul în care o legi.
            </p>
          </article>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-amber">
              <Target size={18} />
            </span>
            <h3>Atenție la sarcină</h3>
            <p>
              Un divizor cu sarcină nu mai este ideal: consumatorul se pune în
              paralel cu porțiunea A–C și „trage” tensiunea în jos. Cu cât
              consumatorul e mai mic, cu atât abaterea e mai mare.
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

interface MiniChartProps {
  mode: RheostatMode;
  emf: number;
  internal: number;
  wireResistance: number;
  load: number;
  fraction: number;
}

function RheostatMiniChart({ mode, emf, internal, wireResistance, load, fraction }: MiniChartProps) {
  const width = 320;
  const height = 130;
  const pad = { l: 36, r: 10, t: 12, b: 22 };
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;

  const points = Array.from({ length: 41 }, (_, index) => {
    const f = index / 40;
    if (mode === "series") {
      // doar porțiunea activă rămâne în circuit: I scade pe măsură ce f crește
      const i = emf / (internal + wireResistance * f + load);
      return { f, value: i };
    }
    const total = internal + wireResistance;
    const bus = (emf / total) * wireResistance;
    return { f, value: bus * f };
  });

  const maxValue = Math.max(...points.map((point) => point.value)) || 1;
  const X = (f: number) => pad.l + plotW * f;
  const Y = (value: number) => pad.t + plotH - plotH * clamp(value / maxValue, 0, 1);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${X(point.f).toFixed(1)},${Y(point.value).toFixed(1)}`).join(" ");

  const markerValue =
    mode === "series"
      ? emf / (internal + wireResistance * fraction + load)
      : (emf / (internal + wireResistance)) * wireResistance * fraction;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="rheostat-mini-svg" role="img" aria-label={`Grafic ${mode === "series" ? "curent" : "tensiune"} în funcție de lungimea activă a firului.`}>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <line
          key={tick}
          x1={pad.l + plotW * tick}
          y1={pad.t}
          x2={pad.l + plotW * tick}
          y2={pad.t + plotH}
          stroke="var(--grid-color)"
          strokeWidth="1"
        />
      ))}
      <line x1={pad.l} y1={pad.t + plotH} x2={pad.l + plotW} y2={pad.t + plotH} stroke="var(--line-strong)" strokeWidth="1.2" />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + plotH} stroke="var(--line-strong)" strokeWidth="1.2" />
      <text x={pad.l - 6} y={pad.t + 6} textAnchor="end" className="char-tick">
        {mode === "series" ? `${Math.round(maxValue * 1000)}` : `${maxValue.toFixed(1)}`}
      </text>
      <text x={pad.l - 6} y={pad.t + plotH} textAnchor="end" className="char-tick">0</text>
      <text x={pad.l + plotW} y={pad.t + plotH + 16} textAnchor="end" className="char-tick">L</text>
      <text x={pad.l} y={pad.t + plotH + 16} textAnchor="middle" className="char-tick">0</text>
      <path d={path} fill="none" stroke="var(--copper)" strokeWidth="2.4" strokeLinecap="round" />
      <line
        x1={X(fraction)}
        y1={pad.t}
        x2={X(fraction)}
        y2={pad.t + plotH}
        stroke="var(--cyan)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <circle cx={X(fraction)} cy={Y(markerValue)} r="4.5" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="2.2" />
      <text x={pad.l} y={pad.t - 3} className="char-axis">
        {mode === "series" ? "I (mA)" : "U (V)"}
      </text>
    </svg>
  );
}
