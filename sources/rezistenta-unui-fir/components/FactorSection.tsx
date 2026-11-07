"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  computeWire,
  MATERIAL_MAP,
  type MaterialId,
} from "@/lib/resistance";
import {
  fmt,
  fmtArea,
  fmtLength,
  fmtResistance,
  fmtTemperature,
} from "@/lib/format";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Formula } from "./Formula";
import {
  ArrowRight,
  Bolt,
  CrossSection,
  Lightbulb,
  Ruler,
  Sparkles,
  Thermometer,
} from "./Icons";

type FactorKey = "length" | "area" | "temperature";

interface FactorTab {
  key: FactorKey;
  label: string;
  symbol: string;
  law: string;
  color: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  current: number;
  format: (value: number) => string;
  hint: string;
}

const BASE = {
  materialId: "cupru" as MaterialId,
  length: 1,
  area: 1,
  temperature: 20,
  current: 1,
};

const TABS: FactorTab[] = [
  {
    key: "length",
    label: "Lungimea",
    symbol: "L",
    law: "R = ρ·L/A",
    color: "#b8733f",
    unit: "m",
    min: 0.1,
    max: 10,
    step: 0.05,
    current: 1,
    format: (value) => fmtLength(value),
    hint: "dublarea lungimii dublează rezistența",
  },
  {
    key: "area",
    label: "Secțiunea",
    symbol: "A",
    law: "R = ρ·L/A",
    color: "#3f8f6b",
    unit: "mm²",
    min: 0.1,
    max: 6,
    step: 0.05,
    current: 1,
    format: (value) => fmtArea(value),
    hint: "dublarea secțiunii înjumătățește rezistența",
  },
  {
    key: "temperature",
    label: "Temperatura",
    symbol: "t",
    law: "ρ(t) = ρ₀(1 + αΔt)",
    color: "#8b7bc4",
    unit: "°C",
    min: -40,
    max: 400,
    step: 5,
    current: 20,
    format: (value) => fmtTemperature(value),
    hint: "la metale, căldura crește rezistența",
  },
];

function resistanceFor(
  factor: FactorKey,
  value: number,
  materialId: MaterialId,
): number {
  const model = computeWire({
    materialId,
    length: factor === "length" ? value : BASE.length,
    area: factor === "area" ? value : BASE.area,
    temperature: factor === "temperature" ? value : BASE.temperature,
    current: 1,
  });
  return model.resistance;
}

export function FactorSection() {
  const [tabKey, setTabKey] = useState<FactorKey>("length");
  const [values, setValues] = useState<Record<FactorKey, number>>({
    length: BASE.length,
    area: BASE.area,
    temperature: BASE.temperature,
  });
  const tab = TABS.find((item) => item.key === tabKey) ?? TABS[0];
  const value = values[tabKey];
  const baseline = useMemo(
    () => resistanceFor(tabKey, tab.current, BASE.materialId),
    [tabKey],
  );
  const current = resistanceFor(tabKey, value, BASE.materialId);
  const ratio = current / baseline;

  const curve = useMemo(() => {
    const width = 520;
    const height = 236;
    const padL = 50;
    const padR = 16;
    const padT = 30;
    const padB = 32;
    const samples = 90;
    const points: Array<{ x: number; y: number; v: number; r: number }> = [];
    let maxR = 0;
    for (let i = 0; i <= samples; i += 1) {
      const v = tab.min + ((tab.max - tab.min) * i) / samples;
      const r = resistanceFor(tabKey, v, BASE.materialId);
      maxR = Math.max(maxR, r);
      points.push({ x: 0, y: 0, v, r });
    }
    // Plafon „rotund”, ca etichetele axei să fie numere curate.
    const rough = Math.max(maxR * 1.02, 1e-6);
    const exponent = Math.floor(Math.log10(rough));
    const base = Math.pow(10, exponent);
    const normalized = rough / base;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
    const niceMax = Math.max(step * base, 1e-6);
    const mapped = points.map((point) => ({
      ...point,
      x: padL + ((point.v - tab.min) / (tab.max - tab.min)) * (width - padL - padR),
      y: padT + (1 - point.r / niceMax) * (height - padT - padB),
    }));
    const path = mapped
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" ");
    const areaPath = `${path} L${mapped[mapped.length - 1].x.toFixed(1)},${(
      height - padB
    ).toFixed(1)} L${mapped[0].x.toFixed(1)},${(height - padB).toFixed(1)} Z`;
    const markerX = padL + ((value - tab.min) / (tab.max - tab.min)) * (width - padL - padR);
    const markerY = padT + (1 - current / niceMax) * (height - padT - padB);
    return { width, height, padL, padR, padT, padB, mapped, path, areaPath, markerX, markerY, niceMax };
  }, [tab, tabKey, value, current]);

  const setValue = (next: number) => {
    setValues((previous) => ({ ...previous, [tabKey]: next }));
  };

  const experiments = useMemo(() => {
    const baselineModel = computeWire({
      materialId: BASE.materialId,
      length: BASE.length,
      area: BASE.area,
      temperature: BASE.temperature,
      current: BASE.current,
    });
    const r = baselineModel.resistance;
    const doubledLength = computeWire({
      materialId: BASE.materialId,
      length: BASE.length * 2,
      area: BASE.area,
      temperature: BASE.temperature,
      current: 1,
    }).resistance;
    const doubledArea = computeWire({
      materialId: BASE.materialId,
      length: BASE.length,
      area: BASE.area * 2,
      temperature: BASE.temperature,
      current: 1,
    }).resistance;
    const doubledDiameter = computeWire({
      materialId: BASE.materialId,
      length: BASE.length,
      area: BASE.area * 4,
      temperature: BASE.temperature,
      current: 1,
    }).resistance;
    const hot = computeWire({
      materialId: BASE.materialId,
      length: BASE.length,
      area: BASE.area,
      temperature: 120,
      current: 1,
    }).resistance;
    return [
      {
        title: "Dublezi lungimea",
        change: "L → 2L",
        result: r * 2,
        ratio: doubledLength / r,
        text: "drumul se lungește, deci și numărul de ciocniri",
      },
      {
        title: "Dublezi aria",
        change: "A → 2A",
        result: doubledArea,
        ratio: doubledArea / r,
        text: "de două ori mai multe „benzi” pentru electroni",
      },
      {
        title: "Dublezi diametrul",
        change: "d → 2d",
        result: doubledDiameter,
        ratio: doubledDiameter / r,
        text: "atenție: aria crește de patru ori!",
      },
      {
        title: "Încălzești la 120 °C",
        change: "20 °C → 120 °C",
        result: hot,
        ratio: hot / r,
        text: "rețeaua vibrează mai puternic, ciocnirile se înmulțesc",
      },
    ];
  }, []);

  const activeMaterial = MATERIAL_MAP[BASE.materialId];

  return (
    <section className="section section-factor" id="factori">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Experimente ghidate"
            title="Trei pârghii, trei tipuri de dependență"
            lead="Alege un factor și mișcă-l. Curba arată cum se schimbă rezistența când toate celelalte mărimi rămân fixe. Observă diferența dintre o dependență liniară și una inversă."
            action={
              <span className="head-chip">
                <Sparkles size={16} />
                explorare interactivă
              </span>
            }
          />
        </Reveal>

        <Reveal className="factor-explorer" delay={40}>
          <div className="factor-tabs" role="tablist" aria-label="Factorul de studiat">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tabKey === item.key}
                className={`factor-tab ${tabKey === item.key ? "is-active" : ""}`}
                onClick={() => setTabKey(item.key)}
                style={{ "--tab-color": item.color } as CSSProperties}
              >
                <span className="factor-tab-symbol">{item.symbol}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="factor-main">
            <div className="factor-plot-card">
              <div className="factor-plot-head">
                <div>
                  <span className="card-kicker">R în funcție de {tab.label.toLowerCase()}</span>
                  <strong>
                    {tab.law}
                  </strong>
                </div>
                <span className="chip chip-copper">
                  cupru · {tab.key === "length" ? "A = 1 mm²" : tab.key === "area" ? "L = 1 m" : "L = 1 m · A = 1 mm²"}
                </span>
              </div>

              <svg
                className="factor-plot"
                viewBox={`0 0 ${curve.width} ${curve.height}`}
                role="img"
                aria-label={`Graficul rezistenței în funcție de ${tab.label.toLowerCase()}. La ${tab.format(
                  value,
                )}, rezistența este ${fmtResistance(current, 3)}.`}
              >
                <defs>
                  <linearGradient id={`factor-fill-${tab.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor={tab.color} stopOpacity="0.26" />
                    <stop offset="1" stopColor={tab.color} stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3, 4].map((row) => {
                  const y = curve.padT + ((curve.height - curve.padT - curve.padB) * row) / 4;
                  return (
                    <line
                      key={`grid-${row}`}
                      x1={curve.padL}
                      y1={y}
                      x2={curve.width - curve.padR}
                      y2={y}
                      stroke="var(--grid-color)"
                      strokeWidth="1"
                    />
                  );
                })}
                {[0, 1, 2, 3, 4].map((column) => {
                  const x =
                    curve.padL +
                    ((curve.width - curve.padL - curve.padR) * column) / 4;
                  return (
                    <line
                      key={`vgrid-${column}`}
                      x1={x}
                      y1={curve.padT}
                      x2={x}
                      y2={curve.height - curve.padB}
                      stroke="var(--grid-color)"
                      strokeWidth="1"
                    />
                  );
                })}

                <line
                  x1={curve.padL}
                  y1={curve.height - curve.padB}
                  x2={curve.width - curve.padR}
                  y2={curve.height - curve.padB}
                  stroke="var(--line-strong)"
                  strokeWidth="1.2"
                />
                <line
                  x1={curve.padL}
                  y1={curve.padT}
                  x2={curve.padL}
                  y2={curve.height - curve.padB}
                  stroke="var(--line-strong)"
                  strokeWidth="1.2"
                />

                <path d={curve.areaPath} fill={`url(#factor-fill-${tab.key})`} />
                <path
                  d={curve.path}
                  fill="none"
                  stroke={tab.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                <line
                  x1={curve.markerX}
                  y1={curve.markerY}
                  x2={curve.markerX}
                  y2={curve.height - curve.padB}
                  stroke={tab.color}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.55"
                />
                <line
                  x1={curve.padL}
                  y1={curve.markerY}
                  x2={curve.markerX}
                  y2={curve.markerY}
                  stroke={tab.color}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.55"
                />
                <circle
                  cx={curve.markerX}
                  cy={curve.markerY}
                  r="6.5"
                  fill={tab.color}
                  stroke="var(--surface)"
                  strokeWidth="2.5"
                />

                {[0, 1, 2, 3, 4].map((tick) => {
                  const tickValue = tab.min + ((tab.max - tab.min) * tick) / 4;
                  const x =
                    curve.padL +
                    ((curve.width - curve.padL - curve.padR) * tick) / 4;
                  return (
                    <text
                      key={`xlabel-${tick}`}
                      x={x}
                      y={curve.height - curve.padB + 15}
                      textAnchor="middle"
                      fill="var(--muted-2)"
                      fontSize="9.5"
                      fontFamily="var(--font-mono)"
                    >
                      {fmt(
                        tickValue,
                        tab.max <= 12 ? (tickValue >= 10 ? 0 : 1) : 0,
                      )}
                    </text>
                  );
                })}
                {[0, 1, 2, 3, 4].map((tick) => {
                  const y =
                    curve.padT +
                    ((curve.height - curve.padT - curve.padB) * tick) / 4;
                  const tickValue = curve.niceMax * (1 - tick / 4);
                  const decimals = curve.niceMax >= 20 ? 0 : curve.niceMax >= 2 ? 1 : curve.niceMax >= 0.2 ? 2 : 3;
                  return (
                    <text
                      key={`ylabel-${tick}`}
                      x={curve.padL - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="var(--muted-2)"
                      fontSize="9.5"
                      fontFamily="var(--font-mono)"
                    >
                      {fmt(tickValue, decimals)}
                    </text>
                  );
                })}
                <text
                  x={curve.width - curve.padR}
                  y={curve.height - 4}
                  textAnchor="end"
                  fill="var(--muted)"
                  fontSize="10"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                >
                  {tab.label.toLowerCase()} ({tab.unit})
                </text>
                <text
                  x={curve.padL - 42}
                  y={curve.padT - 12}
                  fill="var(--muted)"
                  fontSize="10"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                >
                  R (Ω)
                </text>
              </svg>

              <div className="factor-readout">
                <div>
                  <span className="card-kicker">{tab.label}</span>
                  <strong>{tab.format(value)}</strong>
                </div>
                <ArrowRight size={16} />
                <div>
                  <span className="card-kicker">rezistența</span>
                  <strong>{fmtResistance(current, 3)}</strong>
                </div>
                <div className="factor-readout-ratio">
                  <span className="card-kicker">față de referință</span>
                  <strong>
                    {fmt(ratio, 2)}×
                  </strong>
                </div>
              </div>

              <input
                type="range"
                min={tab.min}
                max={tab.max}
                step={tab.step}
                value={value}
                aria-label={`Modifică ${tab.label.toLowerCase()}`}
                onChange={(event) => setValue(Number(event.target.value))}
                style={
                  {
                    "--fill": `${((value - tab.min) / (tab.max - tab.min)) * 100}%`,
                  } as CSSProperties
                }
              />
              <p className="factor-hint">{tab.hint}</p>
            </div>

            <div className="factor-side">
              <div className="factor-explanation">
                <span className="eyebrow">ce se întâmplă</span>
                {tabKey === "length" ? (
                  <>
                    <h3>Direct proporțional</h3>
                    <p>
                      Dacă lungimea crește, crește și rezistența, în aceeași
                      proporție. Graficul este o dreaptă care pleacă din origine:{" "}
                      <Formula tex="R \sim L" />.
                    </p>
                    <p className="factor-math">
                      2L → 2R · 3L → 3R · L/2 → R/2
                    </p>
                  </>
                ) : tabKey === "area" ? (
                  <>
                    <h3>Invers proporțional</h3>
                    <p>
                      Aria stă la numitor, deci graficul este o hiperbolă. Dublezi
                      secțiunea, rezistența scade la jumătate:{" "}
                      <Formula tex="R \sim 1/A" />.
                    </p>
                    <p className="factor-math">
                      2A → R/2 · 4A → R/4 · A/2 → 2R
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Aproape liniar</h3>
                    <p>
                      Rezistivitatea crește aproape liniar cu temperatura, prin
                      coeficientul α:{" "}
                      <Formula tex="\rho = \rho_0(1+\alpha\Delta t)" />.
                    </p>
                    <p className="factor-math">
                      Cu α ≈ 0,0039 K⁻¹ la cupru, +100 °C ≈ +39 % R
                    </p>
                  </>
                )}

                <div className="factor-compare">
                  <span className="card-kicker">valori reper</span>
                  {tabKey === "length" ? (
                    <>
                      <div>
                        <span>L = 0,5 m</span>
                        <b>{fmtResistance(resistanceFor("length", 0.5, BASE.materialId), 3)}</b>
                      </div>
                      <div>
                        <span>L = 1 m</span>
                        <b>{fmtResistance(baseline, 3)}</b>
                      </div>
                      <div>
                        <span>L = 5 m</span>
                        <b>{fmtResistance(resistanceFor("length", 5, BASE.materialId), 3)}</b>
                      </div>
                    </>
                  ) : tabKey === "area" ? (
                    <>
                      <div>
                        <span>A = 0,5 mm²</span>
                        <b>{fmtResistance(resistanceFor("area", 0.5, BASE.materialId), 3)}</b>
                      </div>
                      <div>
                        <span>A = 1 mm²</span>
                        <b>{fmtResistance(baseline, 3)}</b>
                      </div>
                      <div>
                        <span>A = 2,5 mm²</span>
                        <b>{fmtResistance(resistanceFor("area", 2.5, BASE.materialId), 3)}</b>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span>0 °C</span>
                        <b>{fmtResistance(resistanceFor("temperature", 0, BASE.materialId), 3)}</b>
                      </div>
                      <div>
                        <span>20 °C</span>
                        <b>{fmtResistance(baseline, 3)}</b>
                      </div>
                      <div>
                        <span>200 °C</span>
                        <b>{fmtResistance(resistanceFor("temperature", 200, BASE.materialId), 3)}</b>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="factor-meta-card">
                <div>
                  <CrossSection size={16} />
                  <span>
                    secțiune de referință
                    <b>{fmtArea(BASE.area)}</b>
                  </span>
                </div>
                <div>
                  <Ruler size={16} />
                  <span>
                    lungime de referință
                    <b>{fmtLength(BASE.length)}</b>
                  </span>
                </div>
                <div>
                  <Thermometer size={16} />
                  <span>
                    temperatură de referință
                    <b>{fmtTemperature(BASE.temperature)}</b>
                  </span>
                </div>
                <div>
                  <Bolt size={16} />
                  <span>
                    material
                    <b>{activeMaterial.name}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="factor-experiment-head">
            <span className="eyebrow">patru experimente mintale</span>
            <h3>Ce se întâmplă cu R dacă…</h3>
          </div>
        </Reveal>

        <div className="factor-experiments">
          {experiments.map((experiment, index) => {
            const up = experiment.ratio > 1;
            const equal = Math.abs(experiment.ratio - 1) < 0.002;
            return (
              <Reveal
                key={experiment.title}
                className="factor-experiment"
                delay={40 + index * 40}
              >
                <span className="factor-experiment-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4>{experiment.title}</h4>
                <span className="factor-experiment-change">{experiment.change}</span>
                <div className="factor-experiment-value">
                  <strong>{fmtResistance(experiment.result, 3)}</strong>
                  <span className={equal ? "" : up ? "is-up" : "is-down"}>
                    {equal ? "=" : up ? "▲" : "▼"} {fmt(experiment.ratio, 2)}×
                  </span>
                </div>
                <p>{experiment.text}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="factor-note" delay={40}>
          <Lightbulb size={20} />
          <p>
            <strong>Capcana diametrului.</strong> Dacă dublezi diametrul, aria
            crește de <em>patru</em> ori, nu de două ori, pentru că aria depinde
            de pătratul razei: <Formula tex="A=\pi d^{2}/4" />. De aceea un fir
            de 2 mm conduce de patru ori mai bine decât unul de 1 mm, nu de două
            ori.
          </p>
        </Reveal>

        <Reveal className="factor-cta" delay={40}>
          <div>
            <span className="eyebrow">aplicație practică</span>
            <p>
              De ce firul de la reșou este subțire și lung, iar cablul de
              alimentare este gros și scurt? Pentru că avem nevoie de rezistențe
              foarte diferite: una mare, care produce căldură, una mică, care
              pierde cât mai puțin.
            </p>
          </div>
          <a className="button button-secondary button-small" href="#materiale">
            Compară materialele
            <ArrowRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
