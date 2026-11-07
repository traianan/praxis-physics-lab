"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  clamp,
  computeProcess,
  DEFAULT_INPUT,
  easeInOutCubic,
  GASES,
  type GasKind,
} from "@/lib/physics";
import {
  fmt,
  fmtEnergy,
  fmtMolarHeat,
  fmtN,
  fmtPressure,
  fmtRatio,
  fmtTemp,
  fmtVolume,
} from "@/lib/format";
import { EnergyBars } from "./EnergyBars";
import { GasCylinder } from "./GasCylinder";
import { PVChart } from "./PVChart";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  ArrowRight,
  Gauge,
  Pause,
  Play,
  Reset,
  Ruler,
  Sparkles,
  Thermometer,
} from "./Icons";

const N_MIN = -1.5;
const N_MAX = 2.5;
const RATIO_MIN = 0.4;
const RATIO_MAX = 2.5;

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function LabSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  hint,
  disabled = false,
  onChange,
}: SliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={`lab-field ${disabled ? "is-disabled" : ""}`}>
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
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function PolytropicLab() {
  const [gas, setGas] = useState<GasKind>(DEFAULT_INPUT.gas);
  const [nu, setNu] = useState(DEFAULT_INPUT.nu);
  const [p1, setP1] = useState(DEFAULT_INPUT.p1);
  const [V1, setV1] = useState(DEFAULT_INPUT.V1);
  const [n, setN] = useState(DEFAULT_INPUT.n);
  const [ratio, setRatio] = useState(DEFAULT_INPUT.ratio);
  const [isochoric, setIsochoric] = useState(false);
  const [progress, setProgress] = useState(1);
  const [playing, setPlaying] = useState(false);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const model = useMemo(
    () => computeProcess({ gas, nu, p1, V1, n, ratio, isochoric }),
    [gas, nu, p1, V1, n, ratio, isochoric],
  );
  const gasData = GASES[gas];

  const inputKey = `${gas}|${nu}|${p1}|${V1}|${n}|${ratio}|${isochoric}`;
  useEffect(() => {
    setPlaying(false);
    setProgress(1);
  }, [inputKey]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let start: number | null = null;
    const from = progressRef.current >= 0.999 ? 0 : progressRef.current;
    const duration = Math.max(500, 2600 * (1 - from));
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      setProgress(from + (1 - from) * easeInOutCubic(t));
      if (t < 1) {
        raf = window.requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [playing]);

  const presets = [
    { id: "linear", label: "Liniară", n: -1, tone: "rose", formula: "p = k·V" },
    { id: "isobar", label: "Izobară", n: 0, tone: "blue", formula: "p = ct" },
    { id: "isotherm", label: "Izotermă", n: 1, tone: "cyan", formula: "pV = ct" },
    {
      id: "adiabat",
      label: "Adiabatică",
      n: gasData.gamma,
      tone: "gold",
      formula: "pVᵞ = ct",
    },
    { id: "isochor", label: "Izocoră", n: undefined, tone: "violet", formula: "V = ct" },
  ];

  const activePreset = isochoric
    ? "isochor"
    : (presets.find(
        (preset) =>
          preset.n !== undefined && Math.abs(n - preset.n) < 1e-4,
      )?.id ?? "");

  const applyPreset = (preset: (typeof presets)[number]) => {
    if (preset.id === "isochor") {
      setIsochoric(true);
      return;
    }
    setIsochoric(false);
    if (preset.n !== undefined) setN(preset.n);
  };

  const changeGas = (kind: GasKind) => {
    if (Math.abs(n - GASES[gas].gamma) < 1e-4) {
      setN(GASES[kind].gamma);
    }
    setGas(kind);
  };

  const resetAll = () => {
    setGas(DEFAULT_INPUT.gas);
    setNu(DEFAULT_INPUT.nu);
    setP1(DEFAULT_INPUT.p1);
    setV1(DEFAULT_INPUT.V1);
    setN(DEFAULT_INPUT.n);
    setRatio(DEFAULT_INPUT.ratio);
    setIsochoric(false);
    setProgress(1);
    setPlaying(false);
  };

  const resetProgress = () => {
    setPlaying(false);
    setProgress(0);
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
  };

  const capacity =
    !Number.isFinite(model.C)
      ? "∞"
      : Math.abs(model.C) > 1500
        ? "→ ±∞"
        : fmt(model.C, 2);

  return (
    <section className="section section-lab" id="laborator">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Laborator virtual"
            title="Familia politropelor, în mișcare"
            lead="Alege procesul, reglează starea inițială și urmărește curba, pistonul și fluxul de energie. Trage punctul 2 direct pe grafic sau folosește derularea pentru a explica pas cu pas."
            action={
              <span className="lab-head-chip">
                <Sparkles size={16} />
                grafic interactiv
              </span>
            }
          />
        </Reveal>

        <Reveal className="lab-shell" delay={50}>
          <div className="lab-toolbar">
            <div className="lab-presets" role="group" aria-label="Procese simple">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`lab-preset lab-preset-${preset.tone} ${
                    activePreset === preset.id ? "is-active" : ""
                  }`}
                  onClick={() => applyPreset(preset)}
                  aria-pressed={activePreset === preset.id}
                >
                  <span className="lab-preset-dot" />
                  <span>{preset.label}</span>
                  <small>{preset.formula}</small>
                </button>
              ))}
            </div>
            <div className="lab-playback">
              <button
                type="button"
                className="button button-primary button-small lab-play"
                onClick={togglePlay}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
                {playing ? "Pauză" : "Rulează procesul"}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={resetProgress}
                title="Reia de la starea 1"
                aria-label="Reia animația de la starea 1"
              >
                <Reset size={18} />
              </button>
            </div>
          </div>

          <div className="lab-main">
            <div className="lab-chart-card">
              <div className="lab-chart-head">
                <div>
                  <div className="lab-chart-kicker">
                    <span className="live-dot" />
                    proces curent
                  </div>
                  <h3>{model.info.name}</h3>
                  <p>{model.info.note}</p>
                </div>
                <div className="lab-chart-badges">
                  <span className={`process-chip process-chip-${model.info.tone}`}>
                    {model.info.law}
                  </span>
                  <span className="chip">{model.isochoric ? "n → ±∞" : `n = ${fmtN(model.n)}`}</span>
                </div>
              </div>

              <div className="lab-chart-wrap">
                <PVChart
                  model={model}
                  progress={progress}
                  onScrub={(nextRatio) => {
                    setPlaying(false);
                    setRatio(clamp(nextRatio, RATIO_MIN, RATIO_MAX));
                  }}
                />
                <div className="lab-chart-hint">
                  <span aria-hidden="true">↔</span>
                  {model.isochoric
                    ? "trage vertical pentru presiunea finală"
                    : "trage punctul 2 pe orizontală"}
                </div>
              </div>

              <div className="lab-timeline">
                <span className="lab-timeline-label">starea 1</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(progress * 100)}
                  aria-label="Derulare proces"
                  onChange={(event) => {
                    setPlaying(false);
                    setProgress(Number(event.target.value) / 100);
                  }}
                  style={{ "--fill": `${progress * 100}%` } as CSSProperties}
                />
                <span className="lab-timeline-label">starea 2</span>
                <span className="lab-timeline-value">
                  {Math.round(progress * 100)}%
                </span>
              </div>

              <div className="lab-legend">
                <span>
                  <i className="legend-line legend-current" />
                  procesul curent
                </span>
                <span>
                  <i className="legend-line legend-isobar" />
                  n = 0
                </span>
                <span>
                  <i className="legend-line legend-isotherm" />
                  n = 1
                </span>
                <span>
                  <i className="legend-line legend-adiabat" />
                  n = γ
                </span>
                <span>
                  <i className="legend-line legend-isochor" />
                  V = ct
                </span>
              </div>
            </div>

            <aside className="lab-side">
              <div className="cylinder-card">
                <div className="cylinder-card-head">
                  <span className="card-kicker">cilindru cu piston</span>
                  <span
                    className={`heat-chip ${
                      Math.abs(model.Q) < 0.5
                        ? "is-zero"
                        : model.Q > 0
                          ? "is-in"
                          : "is-out"
                    }`}
                  >
                    {Math.abs(model.Q) < 0.5
                      ? "Q = 0"
                      : model.Q > 0
                        ? "primește căldură"
                        : "cedează căldură"}
                  </span>
                </div>
                <GasCylinder model={model} progress={progress} />
                <div className="cylinder-foot">
                  <span>
                    <Thermometer size={15} />
                    T₁ = {fmtTemp(model.T1)}
                  </span>
                  <span>
                    <Ruler size={15} />
                    V₁ = {fmtVolume(model.V1)}
                  </span>
                  <span>
                    <Gauge size={15} />
                    p₁ = {fmtPressure(model.p1)}
                  </span>
                </div>
              </div>

              <div className="state-pair">
                <div className="state-card state-card-1">
                  <span className="state-index">01</span>
                  <span className="state-title">starea inițială</span>
                  <strong>{fmtPressure(model.p1)}</strong>
                  <span>
                    {fmtVolume(model.V1)} · {fmtTemp(model.T1)}
                  </span>
                </div>
                <div className="state-card state-card-2">
                  <span className="state-index">02</span>
                  <span className="state-title">starea finală</span>
                  <strong>{fmtPressure(model.p2)}</strong>
                  <span>
                    {fmtVolume(model.V2)} · {fmtTemp(model.T2)}
                  </span>
                </div>
              </div>

              <EnergyBars model={model} progress={progress} />
            </aside>
          </div>

          <div className="lab-controls">
            <div className="lab-field lab-gas-field">
              <span className="field-label">
                <span>Gazul</span>
                <span className="field-value">{gasData.short}</span>
              </span>
              <div className="segmented lab-gas-toggle">
                <button
                  type="button"
                  className={gas === "di" ? "is-active" : ""}
                  onClick={() => changeGas("di")}
                >
                  Diatomic
                </button>
                <button
                  type="button"
                  className={gas === "mono" ? "is-active" : ""}
                  onClick={() => changeGas("mono")}
                >
                  Monoatomic
                </button>
              </div>
              <span className="field-hint">
                {gasData.examples} · C<sub>V</sub> = {fmtMolarHeat(gasData.cv, 2)} · γ
                = {fmt(gasData.gamma, 3)}
              </span>
            </div>

            <LabSlider
              label="Cantitate ν"
              value={nu}
              min={0.5}
              max={2}
              step={0.1}
              display={`${fmt(nu, 1)} mol`}
              hint={`T₁ = ${fmtTemp(model.T1)}`}
              onChange={setNu}
            />
            <LabSlider
              label="Presiunea p₁"
              value={p1}
              min={50}
              max={250}
              step={1}
              display={`${fmt(p1, 0)} kPa`}
              hint="starea inițială"
              onChange={setP1}
            />
            <LabSlider
              label="Volumul V₁"
              value={V1}
              min={10}
              max={50}
              step={1}
              display={`${fmt(V1, 0)} L`}
              hint="starea inițială"
              onChange={setV1}
            />
            <LabSlider
              label="Indicele n"
              value={n}
              min={N_MIN}
              max={N_MAX}
              step={0.01}
              display={isochoric ? "n → ±∞" : `n = ${fmt(n, 2)}`}
              hint={
                isochoric
                  ? "izocoră: alege alt preset pentru n finit"
                  : "n = 1 → izotermă · n = γ → adiabată"
              }
              disabled={isochoric}
              onChange={setN}
            />
            <LabSlider
              label={isochoric ? "Raportul p₂/p₁" : "Raportul V₂/V₁"}
              value={ratio}
              min={RATIO_MIN}
              max={RATIO_MAX}
              step={0.01}
              display={fmtRatio(ratio)}
              hint={
                isochoric
                  ? "crește presiunea la volum constant"
                  : "destinația punctului 2"
              }
              onChange={setRatio}
            />

            <div className="lab-control-actions">
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={resetAll}
              >
                <Reset size={15} />
                Reinițializează
              </button>
              <a className="lab-calc-link" href="#calculator">
                Calculator pas cu pas
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="lab-status" aria-live="polite">
            <div className="lab-status-item">
              <span className="card-kicker">proces</span>
              <strong>{model.info.name}</strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">indice</span>
              <strong>{model.isochoric ? "→ ±∞" : fmtN(model.n)}</strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">căldura molară</span>
              <strong>{capacity} J/(mol·K)</strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">bilanț</span>
              <strong>
                Q = {fmtEnergy(model.Q, 0)} · L = {fmtEnergy(model.L, 0)}
              </strong>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
