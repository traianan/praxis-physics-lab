"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import {
  computeProcess,
  GASES,
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
import { PVChart } from "./PVChart";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { ArrowRight, Flask, Ruler, Thermometer } from "./Icons";

function LinearSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="linear-field">
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        <span className="field-value">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

export function LinearLab() {
  const [gas, setGas] = useState<GasKind>("di");
  const [nu, setNu] = useState(1);
  const [p1, setP1] = useState(100);
  const [V1, setV1] = useState(25);
  const [ratio, setRatio] = useState(1.8);

  const model = useMemo(
    () =>
      computeProcess({
        gas,
        nu,
        p1,
        V1,
        n: -1,
        ratio,
        isochoric: false,
      }),
    [gas, nu, p1, V1, ratio],
  );
  const gasData = GASES[gas];

  return (
    <section className="section section-linear" id="liniar">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Caz particular · exercițiul 1.4.1.1"
            title="Procesul liniar: o dreaptă prin origine"
            lead="Când indicele politropic este n = −1, legea pVⁿ = constant devine p = k·V. În coordonate (p, V) obținem o dreaptă care trece prin origine — un caz pe care manualul îl tratează separat."
            action={
              <a className="button button-secondary button-small" href="#calculator">
                Calculator complet
                <ArrowRight size={15} />
              </a>
            }
          />
        </Reveal>

        <div className="linear-grid">
          <Reveal className="linear-copy" delay={40}>
            <div className="linear-intro">
              <span className="eyebrow">de ce n = −1?</span>
              <p>
                Pornim de la legea politropei <Formula tex="pV^{n}=\mathrm{constant}" />.
                Pentru <Formula tex="n=-1" />, exponentul devine negativ și relația se
                rescrie:
              </p>
              <div className="linear-main-formula">
                <Formula
                  block
                  tex="pV^{-1}=\mathrm{constant}\quad\Longrightarrow\quad p=k\,V"
                  label="p ori V la minus unu egal constant, deci p egal k ori V"
                />
              </div>
              <p>
                Dreapta trece prin origine, iar panta <Formula tex="k=p_{1}/V_{1}" />.
                Temperatura crește cu pătratul volumului: din{" "}
                <Formula tex="pV=\nu RT" /> rezultă{" "}
                <Formula tex="T=\dfrac{k}{\nu R}V^{2}" />.
              </p>
            </div>

            <div className="linear-facts">
              <div className="linear-fact linear-fact-c">
                <span className="linear-fact-kicker">căldura molară</span>
                <Formula block tex="C=\dfrac{C_{p}+C_{V}}{2}=\dfrac{\gamma+1}{2}C_{V}" />
                <span>constantă pe tot procesul</span>
              </div>
              <div className="linear-fact linear-fact-l">
                <span className="linear-fact-kicker">lucru mecanic</span>
                <Formula block tex="L=\dfrac{p_{1}+p_{2}}{2}(V_{2}-V_{1})" />
                <span>aria trapezului sub dreaptă</span>
              </div>
              <div className="linear-fact linear-fact-t">
                <span className="linear-fact-kicker">temperatura</span>
                <Formula block tex="T \propto V^{2}" />
                <span>crește mai repede decât volumul</span>
              </div>
            </div>

            <div className="linear-note">
              <span className="linear-note-mark">i</span>
              <p>
                <strong>Precizare.</strong> Manualul cere „L, γ și V” folosind
                relațiile (4), (5) și (6). În contextul acestor relații, mărimea
                care se calculează este căldura molară <Formula tex="C" />;{" "}
                <Formula tex="\gamma" /> rămâne exponentul adiabatic. Am completat
                exercițiul și cu dependența <Formula tex="T(V)" />.
              </p>
            </div>
          </Reveal>

          <Reveal className="linear-demo" delay={100}>
            <div className="linear-demo-head">
              <div>
                <span className="card-kicker">demo interactiv</span>
                <h3>p = k · V</h3>
              </div>
              <span className="chip chip-gold">n = −1</span>
            </div>

            <div className="linear-chart">
              <PVChart
                model={model}
                progress={1}
                onScrub={(nextRatio) =>
                  setRatio(Math.min(2.5, Math.max(0.4, nextRatio)))
                }
              />
            </div>
            <p className="linear-chart-hint">
              Trage punctul 2 pe dreaptă sau folosește sliderul.
            </p>

            <div className="linear-controls">
              <div className="linear-gas">
                <span className="field-label">
                  <span>Gazul</span>
                  <span className="field-value">{gasData.short}</span>
                </span>
                <div className="segmented">
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
              <LinearSlider
                label="Cantitate ν"
                value={nu}
                min={0.5}
                max={2}
                step={0.1}
                display={`${fmt(nu, 1)} mol`}
                onChange={setNu}
              />
              <LinearSlider
                label="Presiunea p₁"
                value={p1}
                min={50}
                max={250}
                step={1}
                display={`${fmt(p1, 0)} kPa`}
                onChange={setP1}
              />
              <LinearSlider
                label="Volumul V₁"
                value={V1}
                min={10}
                max={50}
                step={1}
                display={`${fmt(V1, 0)} L`}
                onChange={setV1}
              />
              <LinearSlider
                label="Raportul V₂/V₁"
                value={ratio}
                min={0.4}
                max={2.5}
                step={0.01}
                display={`${fmt(ratio, 2)}×`}
                onChange={setRatio}
              />
            </div>

            <div className="linear-readouts">
              <div className="linear-readout">
                <span>C</span>
                <strong>{fmtMolarHeat(model.C, 2)}</strong>
              </div>
              <div className="linear-readout linear-readout-l">
                <span>L</span>
                <strong>{fmtEnergy(model.L, 0)}</strong>
              </div>
              <div className="linear-readout linear-readout-q">
                <span>Q</span>
                <strong>{fmtEnergy(model.Q, 0)}</strong>
              </div>
              <div className="linear-readout linear-readout-du">
                <span>ΔU</span>
                <strong>{fmtEnergy(model.dU, 0)}</strong>
              </div>
              <div className="linear-readout">
                <span>p₂</span>
                <strong>{fmtPressure(model.p2)}</strong>
              </div>
              <div className="linear-readout">
                <span>T₂</span>
                <strong>{fmtTemp(model.T2)}</strong>
              </div>
            </div>

            <div className="linear-balance">
              <span>Q = ΔU + L</span>
              <span>
                {Math.round(model.Q)} J = {Math.round(model.dU)} J +{" "}
                {Math.round(model.L)} J
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal className="linear-exercise" delay={50}>
          <div className="linear-exercise-head">
            <div>
              <span className="eyebrow">exercițiul 1.4.1.1</span>
              <h3>Rezolvare pas cu pas</h3>
            </div>
            <span className="chip chip-mint">n = −1</span>
          </div>
          <ol className="linear-steps">
            <li>
              <span className="linear-step-num">01</span>
              <div>
                <strong>Identificăm indicele.</strong>
                <p>
                  <Formula tex="pV^{-1}=\mathrm{constant}" /> se scrie{" "}
                  <Formula tex="p=kV" />, deci procesul este liniar în (p, V),
                  cu <Formula tex="n=-1" />.
                </p>
              </div>
            </li>
            <li>
              <span className="linear-step-num">02</span>
              <div>
                <strong>Calculăm căldura molară.</strong>
                <p>
                  Din <Formula tex="C=C_{V}+\dfrac{R}{1-n}" /> cu{" "}
                  <Formula tex="n=-1" />:
                </p>
                <Formula block tex="C=C_{V}+\dfrac{R}{2}=\dfrac{C_{p}+C_{V}}{2}" />
              </div>
            </li>
            <li>
              <span className="linear-step-num">03</span>
              <div>
                <strong>Calculăm lucrul mecanic.</strong>
                <p>
                  Lucrul este aria trapezului sub dreaptă, echivalent cu relația
                  (5):
                </p>
                <Formula
                  block
                  tex="L=\dfrac{p_{1}+p_{2}}{2}(V_{2}-V_{1})=\dfrac{\nu R\,\Delta T}{2}"
                />
              </div>
            </li>
            <li>
              <span className="linear-step-num">04</span>
              <div>
                <strong>Găsim dependența T(V).</strong>
                <p>
                  Din <Formula tex="pV=\nu RT" /> și <Formula tex="p=kV" />:
                </p>
                <Formula block tex="T=\dfrac{k}{\nu R}V^{2}\quad\Rightarrow\quad T \propto V^{2}" />
              </div>
            </li>
            <li>
              <span className="linear-step-num">05</span>
              <div>
                <strong>Verificăm prima lege.</strong>
                <p>
                  <Formula tex="\Delta U=\nu C_{V}\Delta T" />,{" "}
                  <Formula tex="Q=\nu C\Delta T" />, iar{" "}
                  <Formula tex="Q=\Delta U+L" /> confirmă rezultatul.
                </p>
                <div className="linear-step-check">
                  <span>
                    Cu datele din demo: L = {fmtEnergy(model.L, 0)}, Q ={" "}
                    {fmtEnergy(model.Q, 0)}, ΔU = {fmtEnergy(model.dU, 0)}.
                  </span>
                </div>
              </div>
            </li>
          </ol>
          <div className="linear-exercise-foot">
            <span>
              <Flask size={16} /> C = {fmtMolarHeat(model.C, 2)}
            </span>
            <span>
              <Ruler size={16} /> V₂ = {fmtVolume(model.V2)}
            </span>
            <span>
              <Thermometer size={16} /> T₂ = {fmtTemp(model.T2)}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
