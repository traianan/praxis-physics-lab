"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  BULBS,
  clamp,
  dipoleCurrent,
  materialById,
  MATERIALS,
  resistanceOfWire,
  resistivityAt,
  sig,
  type DipoleKind,
  type Material,
} from "@/lib/physics";
import {
  fmt,
  fmtCurrent,
  fmtLength,
  fmtPower,
  fmtResistance,
  fmtVoltage,
} from "@/lib/format";
import { ConductorCanvas } from "./ConductorCanvas";
import { UIPlot, type RecordedPoint } from "./UIPlot";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Formula } from "./Formula";
import {
  ArrowRight,
  Bolt,
  Lightbulb,
  Play,
  Reset,
  Ruler,
  SlidersIcon,
  Target,
} from "./Icons";

interface LabSliderProps {
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
}: LabSliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={`lab-field ${disabled ? "is-disabled" : ""}`}>
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
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

const PRESETS = [
  { id: "lamp", label: "Bec de lanternă", kind: "bulb" as DipoleKind, bulb: "bulb-6v" },
  { id: "auto", label: "Bec auto", kind: "bulb" as DipoleKind, bulb: "bulb-12v" },
  { id: "signal", label: "Bec de semnal", kind: "bulb" as DipoleKind, bulb: "bulb-24v" },
  { id: "resistor", label: "Rezistor ohmic", kind: "resistor" as DipoleKind, bulb: "bulb-12v" },
];

const MATERIAL_PRESETS: { materialId: string; length: number; diameter: number; label: string }[] = [
  { materialId: "copper", length: 2, diameter: 0.5, label: "Fir de cupru" },
  { materialId: "nichrome", length: 1, diameter: 0.4, label: "Nicrom" },
  { materialId: "tungsten", length: 0.4, diameter: 0.05, label: "Filament W" },
  { materialId: "graphite", length: 0.1, diameter: 1.2, label: "Mină de creion" },
];

export function OhmLab() {
  const [kind, setKind] = useState<DipoleKind>("bulb");
  const [bulbId, setBulbId] = useState("bulb-12v");
  const [resistance, setResistance] = useState(40);
  const [voltage, setVoltage] = useState(4);
  const [presetId, setPresetId] = useState("auto");
  const [materialId, setMaterialId] = useState("copper");
  const [length, setLength] = useState(2);
  const [diameter, setDiameter] = useState(0.5);
  const [temperature, setTemperature] = useState(20);
  const [recorded, setRecorded] = useState<RecordedPoint[]>([]);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(0);

  const bulb = BULBS.find((item) => item.id === bulbId) ?? BULBS[1];
  const material = materialById(materialId);
  const wireResistance = useMemo(
    () => resistanceOfWire({ materialId, length, diameter, temperature }),
    [materialId, length, diameter, temperature],
  );

  const uMax = kind === "bulb" ? bulb.ratedVoltage * 1.45 : Math.max(8, resistance * 0.32);
  const activeResistance = kind === "resistor" ? resistance : wireResistance;
  const current = dipoleCurrent(kind, activeResistance, bulb, voltage);
  const iMax = useMemo(() => {
    const atMax = dipoleCurrent(kind, activeResistance, bulb, uMax);
    return Math.max(1e-4, atMax * 1.12);
  }, [kind, activeResistance, bulb, uMax]);

  const curve = useMemo(
    () => (u: number) => dipoleCurrent(kind, activeResistance, bulb, u),
    [kind, activeResistance, bulb],
  );

  const reference = useMemo(() => {
    if (kind !== "bulb") {
      const slope = (resistance * 0.55) / uMax;
      return { resistance: 1 / Math.max(slope, 1e-6), label: "referință liniară" };
    }
    const cold = bulb.ratedVoltage ** 2 / bulb.ratedPower;
    return {
      resistance: cold * bulb.coldRatio,
      label: "R la rece",
    };
  }, [kind, resistance, bulb, uMax]);

  const hotResistance = voltage / Math.max(current, 1e-9);
  const power = voltage * current;

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setKind(preset.kind);
    setBulbId(preset.bulb);
    setVoltage(preset.kind === "bulb" ? (BULBS.find((b) => b.id === preset.bulb)?.ratedVoltage ?? 6) * 0.6 : 8);
  };

  const applyMaterialPreset = (materialKey: string) => {
    const preset = MATERIAL_PRESETS.find((item) => item.materialId === materialKey);
    if (!preset) return;
    setKind("resistor");
    setPresetId("resistor");
    setMaterialId(preset.materialId);
    setLength(preset.length);
    setDiameter(preset.diameter);
    setVoltage(6);
  };

  const record = () => {
    setRecorded((points) => [
      ...points,
      { id: Date.now() + points.length, u: voltage, i: current, r: hotResistance },
    ]);
  };

  useEffect(() => {
    if (!playing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 1 : 5200;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = clamp((now - started) / duration, 0, 1);
      setVoltage(Number((uMax * progress).toFixed(3)));
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [playing, uMax]);

  const reset = () => {
    setPlaying(false);
    setVoltage(0);
    setRecorded([]);
  };

  const load = clamp(voltage / (bulb.ratedVoltage || 1), 0, 1.25);
  const isOhmic = kind === "resistor";
  const linearity = isOhmic
    ? "dreaptă prin origine — conductor ohmic"
    : "curbă aplatizată — conductor neliniar";

  return (
    <section className="section section-lab lab-section" id="laborator">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Laborator U–I"
            title="Trasează caracteristica curent–tensiune"
            lead="Crește tensiunea și urmărește curentul. La un rezistor obții o dreaptă; la un bec, filamentul se încălzește, rezistența crește, iar curba se apleacă. Trage direct pe grafic pentru a varia tensiunea."
            action={
              <span className="lab-head-chip">
                <SlidersIcon size={16} />
                măsurare interactivă
              </span>
            }
          />
        </Reveal>

        <Reveal className="lab-shell" delay={50}>
          <div className="lab-toolbar">
            <div className="lab-presets" role="group" aria-label="Tipuri de dipol">
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
                  <small>
                    {preset.kind === "resistor"
                      ? "liniar"
                      : `${BULBS.find((b) => b.id === preset.bulb)?.ratedPower} W`}
                  </small>
                </button>
              ))}
            </div>
            <div className="lab-playback">
              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => {
                  if (playing) {
                    setPlaying(false);
                    return;
                  }
                  setVoltage(0);
                  setPlaying(true);
                }}
              >
                <Play size={16} />
                {playing ? "Pauză" : "Rulează măsurarea"}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={reset}
                title="Reia de la zero"
                aria-label="Reia măsurarea de la zero"
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
                    caracteristica dipolului
                  </div>
                  <h3>{kind === "bulb" ? bulb.name : `Rezistor ${fmt(resistance, 0)} Ω`}</h3>
                  <p>{linearity}</p>
                </div>
                <div className="lab-chart-badges">
                  <span className={`chip ${isOhmic ? "chip-cyan" : "chip-amber"}`}>
                    {isOhmic ? "I = U / R" : "R = R(T)"}
                  </span>
                  <span className="chip">{fmtResistance(hotResistance)}</span>
                </div>
              </div>

              <div className="lab-chart-wrap">
                <UIPlot
                  uMax={uMax}
                  iMax={iMax}
                  curve={curve}
                  reference={reference}
                  voltage={voltage}
                  recorded={recorded}
                  onScrub={(u) => {
                    setPlaying(false);
                    setVoltage(u);
                  }}
                  axisCaption={isOhmic ? "pantă constantă" : "pantă descrescătoare"}
                />
                <span className="lab-chart-hint">
                  <span aria-hidden="true">↔</span>
                  trage pe grafic pentru a regla U
                </span>
              </div>

              <div className="lab-timeline">
                <span className="lab-timeline-label">0 V</span>
                <input
                  type="range"
                  min={0}
                  max={uMax}
                  step={0.01}
                  value={voltage}
                  aria-label="Tensiunea aplicată"
                  onChange={(event) => {
                    setPlaying(false);
                    setVoltage(Number(event.target.value));
                  }}
                  style={{ "--fill": `${(voltage / uMax) * 100}%` } as CSSProperties}
                />
                <span className="lab-timeline-label">{fmt(uMax, 1)} V</span>
                <span className="lab-timeline-value">{fmt(voltage, 2)} V</span>
              </div>

              <div className="lab-actions-inline">
                <button type="button" className="button button-secondary button-small" onClick={record}>
                  <Target size={15} />
                  Înregistrează punctul
                </button>
                <button
                  type="button"
                  className="lab-link-button"
                  onClick={() => setRecorded([])}
                  disabled={recorded.length === 0}
                >
                  Șterge punctele ({recorded.length})
                </button>
              </div>

              <div className="lab-legend">
                <span>
                  <i className="legend-line legend-current" />
                  caracteristica I(U)
                </span>
                <span>
                  <i className="legend-line legend-reference" />
                  {reference?.label ?? "referință"}
                </span>
                <span>
                  <i className="legend-dot legend-dot-amber" />
                  punct de lucru
                </span>
              </div>
            </div>

            <aside className="lab-side">
              <div className="cylinder-card">
                <div className="cylinder-card-head">
                  <span className="card-kicker">
                    {kind === "bulb" ? "filament" : "conductor"}
                  </span>
                  <span
                    className={`heat-chip ${
                      power < 0.02 ? "is-zero" : voltage > 0 ? "is-in" : "is-zero"
                    }`}
                  >
                    {power < 0.02 ? "fără curent" : `${fmtPower(power)} disipați`}
                  </span>
                </div>
                <ConductorCanvas
                  current={current}
                  resistance={hotResistance}
                  temperature={
                    kind === "bulb"
                      ? 20 + load * load * 2500
                      : 20 + (power > 0 ? Math.min(600, power * 12) : 0)
                  }
                  material={kind === "bulb" ? "filament de wolfram" : material.name}
                  glowing={kind === "bulb"}
                  load={load}
                />
                <div className="cylinder-foot">
                  <span>
                    <Bolt size={15} />
                    {fmtVoltage(voltage)}
                  </span>
                  <span>
                    <ArrowRight size={15} />
                    {fmtCurrent(current)}
                  </span>
                  <span>
                    <Lightbulb size={15} />
                    {fmtResistance(hotResistance)}
                  </span>
                </div>
              </div>

              <div className="state-pair">
                <div className="state-card state-card-1">
                  <span className="state-index">U</span>
                  <span className="state-title">tensiune aplicată</span>
                  <strong>{fmtVoltage(voltage)}</strong>
                  <span>măsurată cu voltmetrul</span>
                </div>
                <div className="state-card state-card-2">
                  <span className="state-index">I</span>
                  <span className="state-title">curent prin dipol</span>
                  <strong>{fmtCurrent(current)}</strong>
                  <span>măsurat cu ampermetrul</span>
                </div>
              </div>

              <div className="readout-card">
                <div className="readout-row readout-row-accent">
                  <span>R = U / I</span>
                  <strong>{fmtResistance(hotResistance)}</strong>
                </div>
                <div className="readout-row">
                  <span>P = U · I</span>
                  <strong>{fmtPower(power)}</strong>
                </div>
                <div className="readout-row">
                  <span>panta graficului</span>
                  <strong>{fmt(1 / Math.max(hotResistance, 1e-9), 5)} S</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="lab-controls">
            <div className="lab-field lab-gas-field">
              <span className="field-label">
                <span>Tipul dipolului</span>
                <span className="field-value">{isOhmic ? "ohmic" : "neliniar"}</span>
              </span>
              <div className="segmented">
                <button
                  type="button"
                  className={kind === "bulb" ? "is-active" : ""}
                  onClick={() => {
                    setKind("bulb");
                    setPresetId(bulbId.replace("bulb-", ""));
                  }}
                >
                  Bec
                </button>
                <button
                  type="button"
                  className={kind === "resistor" ? "is-active" : ""}
                  onClick={() => {
                    setKind("resistor");
                    setPresetId("resistor");
                  }}
                >
                  Rezistor
                </button>
              </div>
              <span className="field-hint">
                {isOhmic
                  ? "R constant → caracteristică liniară"
                  : "filament de wolfram → R crește cu T"}
              </span>
            </div>

            <LabSlider
              label="Tensiunea U"
              value={voltage}
              min={0}
              max={uMax}
              step={0.01}
              display={fmtVoltage(voltage)}
              hint={`până la ${fmt(uMax, 1)} V`}
              onChange={(value) => {
                setPlaying(false);
                setVoltage(value);
              }}
            />

            {isOhmic ? (
              <LabSlider
                label="Rezistența R"
                value={resistance}
                min={2}
                max={400}
                step={1}
                display={fmtResistance(resistance)}
                hint={`panta = 1/R = ${fmt(1 / resistance, 5)} S`}
                onChange={setResistance}
              />
            ) : (
              <div className="lab-field">
                <span className="field-label">
                  <span>Becul</span>
                  <span className="field-value">{fmt(bulb.ratedPower, 0)} W</span>
                </span>
                <div className="segmented lab-bulb-toggle">
                  {BULBS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={bulbId === item.id ? "is-active" : ""}
                      onClick={() => {
                        setBulbId(item.id);
                        setVoltage(0);
                      }}
                    >
                      {item.ratedVoltage} V
                    </button>
                  ))}
                </div>
                <span className="field-hint">{bulb.note}</span>
              </div>
            )}

            <div className="lab-field">
              <span className="field-label">
                <span>Materialul conductorului</span>
                <span className="field-value">{material.symbol}</span>
              </span>
              <div className="segmented lab-gas-toggle lab-material-toggle">
                {MATERIAL_PRESETS.map((item) => (
                  <button
                    key={item.materialId}
                    type="button"
                    className={materialId === item.materialId ? "is-active" : ""}
                    onClick={() => applyMaterialPreset(item.materialId)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="field-hint">
                ρ(20 °C) = {fmt(material.rho20 * 1e8, 2)}·10⁻⁸ Ω·m
              </span>
            </div>

            <LabSlider
              label="Lungimea firului"
              value={length}
              min={0.05}
              max={5}
              step={0.05}
              display={fmtLength(length)}
              hint={`R fir = ${fmtResistance(wireResistance)}`}
              onChange={setLength}
            />

            <LabSlider
              label="Diametrul firului"
              value={diameter}
              min={0.02}
              max={2}
              step={0.01}
              display={`${fmt(diameter, 2)} mm`}
              hint={`A = ${fmt(Math.PI * diameter * diameter * 0.25, 3)} mm²`}
              onChange={setDiameter}
            />

            <LabSlider
              label="Temperatura"
              value={temperature}
              min={-50}
              max={900}
              step={5}
              display={`${fmt(temperature, 0)} °C`}
              hint={`ρ = ${fmt(resistivityAt(material, temperature) * 1e8, 2)}·10⁻⁸ Ω·m`}
              onChange={setTemperature}
            />

            <div className="lab-control-actions">
              <button type="button" className="button button-secondary button-small" onClick={reset}>
                <Reset size={15} />
                Reinițializează
              </button>
              <a className="lab-calc-link" href="#circuit">
                Circuitul complet
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="lab-status" aria-live="polite">
            <div className="lab-status-item">
              <span className="card-kicker">dipol</span>
              <strong>{isOhmic ? "rezistor ohmic" : "filament de bec"}</strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">R la punctul de lucru</span>
              <strong>{fmtResistance(hotResistance)}</strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">tabel R = U/I</span>
              <strong>
                {recorded.length === 0
                  ? "niciun punct înregistrat"
                  : `${fmt(recorded[recorded.length - 1].r, 1)} Ω · ${recorded.length} puncte`}
              </strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">verdict</span>
              <strong>{isOhmic ? "liniar" : load > 0.2 ? "se încălzește" : "aproape liniar"}</strong>
            </div>
          </div>
        </Reveal>

        <Reveal className="lab-cards" delay={70}>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-cyan">
              <Bolt size={18} />
            </span>
            <h3>De ce becul nu respectă legea?</h3>
            <p>
              Legea lui Ohm presupune <Formula tex="R" /> constant. Filamentul se
              încălzește până la 2 500 K, iar rezistivitatea wolframului crește de
              peste 10 ori. Caracteristica rămâne o curbă, nu o dreaptă.
            </p>
          </article>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-amber">
              <Ruler size={18} />
            </span>
            <h3>Cum citești panta</h3>
            <p>
              În graficul <Formula tex="I=f(U)" />, panta este{" "}
              <Formula tex="1/R" />. O dreaptă mai aplecată înseamnă o rezistență
              mai mare. În graficul <Formula tex="U=f(I)" />, panta este chiar{" "}
              <Formula tex="R" />.
            </p>
          </article>
          <article className="lab-card">
            <span className="lab-card-icon lab-card-icon-copper">
              <Target size={18} />
            </span>
            <h3>Metoda celor două puncte</h3>
            <p>
              Pentru un rezistor ohmic, măsoară{" "}
              <Formula tex="(U_1,I_1)" /> și <Formula tex="(U_2,I_2)" />, apoi
              calculează <Formula tex="R=(U_2-U_1)/(I_2-I_1)" />. Rezultatul nu
              depinde de origine — semn că dipolul este liniar.
            </p>
          </article>
        </Reveal>

        <Reveal className="data-table-card" delay={60}>
          <div className="data-table-head">
            <div>
              <span className="card-kicker">tabel de măsurători</span>
              <h3>Punctele înregistrate</h3>
            </div>
            <span className="chip">{recorded.length} / 12</span>
          </div>
          {recorded.length === 0 ? (
            <p className="data-empty">
              Mută tensiunea și apasă <b>Înregistrează punctul</b>. După 4–5
              măsurători, compară raportul <Formula tex="U/I" />: la rezistor
              rămâne constant, la bec scade pe măsură ce filamentul se încălzește.
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>U (V)</th>
                    <th>I (mA)</th>
                    <th>R = U/I (Ω)</th>
                    <th>P (W)</th>
                  </tr>
                </thead>
                <tbody>
                  {recorded.map((point, index) => (
                    <tr key={point.id}>
                      <td className="mono">{String(index + 1).padStart(2, "0")}</td>
                      <td className="mono">{fmt(point.u, 2)}</td>
                      <td className="mono">{fmt(point.i * 1000, 1)}</td>
                      <td className="mono">{fmt(point.r, 1)}</td>
                      <td className="mono">{fmt(point.u * point.i, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {recorded.length > 1 ? (
            <div className="data-summary">
              {(() => {
                const first = recorded[0];
                const last = recorded[recorded.length - 1];
                const spread = (last.r - first.r) / first.r;
                return (
                  <>
                    <span>
                      ΔR/R = <b>{fmt(spread * 100, 1)} %</b> între primul și ultimul punct
                    </span>
                    <span>
                      {Math.abs(spread) < 0.05
                        ? "practic constant — dipol ohmic"
                        : "variație mare — dipol neliniar"}
                    </span>
                  </>
                );
              })()}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
