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
  areaFromDiameter,
  clamp,
  computeWire,
  diameterFromArea,
  easeInOutCubic,
  HEAT_LABEL,
  heatLevel,
  MATERIALS,
  WIRE_GAUGES,
  type MaterialId,
} from "@/lib/resistance";
import {
  fmt,
  fmtArea,
  fmtCurrent,
  fmtDiameter,
  fmtLength,
  fmtPower,
  fmtResistance,
  fmtRho,
  fmtSpeed,
  fmtTemperature,
  fmtVoltage,
} from "@/lib/format";
import { IuChart } from "./IuChart";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { WireCanvas } from "./WireCanvas";
import {
  ArrowRight,
  Bolt,
  CrossSection,
  Flame,
  Pause,
  Play,
  Plug,
  Reset,
  Ruler,
  Sparkles,
  Thermometer,
  Warning,
} from "./Icons";

const LENGTH_MIN = 0.02;
const LENGTH_MAX = 500;
const DIAMETER_MIN = 0.01;
const DIAMETER_MAX = 12;
/** Pași pe scara logaritmică a sliderelor de geometrie. */
const LOG_STEPS = 1000;
const TEMP_MIN = -40;
const TEMP_MAX = 2500;
const CURRENT_MIN = 0;
const CURRENT_MAX = 20;

interface LabSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
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
  onChange,
}: LabSliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="lab-field">
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
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

/**
 * Slider logaritmic pentru lungime și diametru: de la 0,02 m la 500 m, respectiv
 * de la 0,01 mm la 12 mm. Liniar, valorile mici ar fi imposibil de nimerit.
 */
function LogSlider({
  label,
  value,
  min,
  max,
  display,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const toSlider = (raw: number) =>
    Math.round(
      (Math.log(Math.max(raw, min) / min) / Math.log(max / min)) * LOG_STEPS,
    );
  const fromSlider = (position: number) =>
    min * Math.pow(max / min, position / LOG_STEPS);
  const position = toSlider(value);
  const fill = (position / LOG_STEPS) * 100;
  return (
    <div className="lab-field">
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        <span className="field-value">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={LOG_STEPS}
        step={1}
        value={position}
        onChange={(event) => onChange(fromSlider(Number(event.target.value)))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

interface LabPreset {
  id: string;
  label: string;
  tag: string;
  materialId: MaterialId;
  length: number;
  diameter: number;
  temperature: number;
  current: number;
}

const PRESETS: LabPreset[] = [
  {
    id: "cablu",
    label: "Cablu de cupru",
    tag: "1 m · 1 mm²",
    materialId: "cupru",
    length: 1,
    diameter: diameterFromArea(1),
    temperature: 20,
    current: 2,
  },
  {
    id: "nicrom",
    label: "Fir de nicrom",
    tag: "0,5 m · 0,3 mm",
    materialId: "nicrom",
    length: 0.5,
    diameter: 0.3,
    temperature: 20,
    current: 1,
  },
  {
    id: "filament",
    label: "Filament de wolfram",
    tag: "4 cm · 0,03 mm",
    materialId: "wolfram",
    length: 0.04,
    diameter: 0.03,
    temperature: 2200,
    current: 0.18,
  },
  {
    id: "lea",
    label: "Linie aeriană",
    tag: "120 m · 16 mm²",
    materialId: "aluminiu",
    length: 120,
    diameter: diameterFromArea(16),
    temperature: 45,
    current: 12,
  },
  {
    id: "grafit",
    label: "Mină de creion",
    tag: "6 cm · 1 mm",
    materialId: "grafit",
    length: 0.06,
    diameter: 1,
    temperature: 25,
    current: 0.03,
  },
];

/**
 * Slider de temperatură cu răspuns pătratic: de la −40 °C la 2500 °C, dar cu
 * rezoluție fină în zona de lucru obișnuită (0…200 °C).
 */
function TempSlider({
  value,
  min,
  max,
  display,
  hint,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  display: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const position = Math.sqrt(clamp((value - min) / (max - min), 0, 1));
  const fromPosition = (raw: number) => min + (max - min) * raw * raw;
  return (
    <div className="lab-field">
      <label className="field-label" htmlFor={id}>
        <span>Temperatura t</span>
        <span className="field-value">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1000}
        step={1}
        value={Math.round(position * 1000)}
        onChange={(event) =>
          onChange(Math.round(fromPosition(Number(event.target.value) / 1000)))
        }
        style={{ "--fill": `${position * 100}%` } as CSSProperties}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function WireLab() {
  const [materialId, setMaterialId] = useState<MaterialId>("cupru");
  const [length, setLength] = useState(1);
  const [diameter, setDiameter] = useState(diameterFromArea(1));
  const [temperature, setTemperature] = useState(20);
  const [current, setCurrent] = useState(2);
  const [animate, setAnimate] = useState(true);
  const [showReference, setShowReference] = useState(false);
  const [activePreset, setActivePreset] = useState("cablu");
  const [sweep, setSweep] = useState(0);

  const area = areaFromDiameter(diameter);

  const model = useMemo(
    () =>
      computeWire({
        materialId,
        length,
        area,
        temperature,
        current,
      }),
    [materialId, length, area, temperature, current],
  );

  const level = heatLevel(model.currentDensity);
  const material = model.material;

  // Rezistența de referință pentru un fir de cupru cu aceleași dimensiuni.
  const copperResistance = useMemo(() => {
    const copper = computeWire({
      materialId: "cupru",
      length,
      area,
      temperature,
      current,
    });
    return copper.resistance;
  }, [length, area, temperature, current]);

  const ratioToCopper = model.resistance / Math.max(copperResistance, 1e-12);

  const sweepRef = useRef(sweep);
  useEffect(() => {
    sweepRef.current = sweep;
  }, [sweep]);

  useEffect(() => {
    if (!animate) return;
    setSweep((value) => (value > 0 && value < 1 ? value : 0));
    let raf = 0;
    let start: number | null = null;
    const from = sweepRef.current >= 0.999 ? 0 : sweepRef.current;
    const duration = 2400;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      setSweep(from + (1 - from) * easeInOutCubic(t));
      if (t < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
    // Reîncercăm doar când utilizatorul pornește animația.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  const changeMaterial = (next: MaterialId) => {
    setMaterialId(next);
    const nextMaterial = MATERIALS.find((item) => item.id === next);
    if (nextMaterial && Math.abs(nextMaterial.alpha) < 0.001) {
      setTemperature(20);
    }
    setActivePreset("");
  };

  const applyPreset = (preset: LabPreset) => {
    setMaterialId(preset.materialId);
    setLength(preset.length);
    setDiameter(preset.diameter);
    setTemperature(preset.temperature);
    setCurrent(preset.current);
    setActivePreset(preset.id);
  };

  const resetAll = () => {
    applyPreset(PRESETS[0]);
    setAnimate(true);
    setShowReference(false);
    setSweep(0);
  };

  const gaugeLabel =
    WIRE_GAUGES.find((gauge) => Math.abs(gauge.area - area) / area < 0.03)?.label ??
    null;

  const update = (setter: (value: number) => void) => (value: number) => {
    setter(value);
    setActivePreset("");
  };

  return (
    <section className="section section-lab" id="laborator">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Laborator virtual"
            title="Firul, sub controlul tău"
            lead="Schimbă materialul, lungimea, grosimea și temperatura și urmărește firul, electronii și graficul. Trage direct pe graficul I–U pentru a varia tensiunea. Toate valorile se recalculează instant."
            action={
              <span className="head-chip">
                <Sparkles size={16} />
                model în timp real
              </span>
            }
          />
        </Reveal>

        <Reveal className="lab-shell" delay={50}>
          <div className="lab-toolbar">
            <div className="lab-presets" role="group" aria-label="Situații de laborator">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`lab-preset ${activePreset === preset.id ? "is-active" : ""}`}
                  onClick={() => applyPreset(preset)}
                  aria-pressed={activePreset === preset.id}
                >
                  <span className="lab-preset-dot" />
                  <span>{preset.label}</span>
                  <small>{preset.tag}</small>
                </button>
              ))}
            </div>
            <div className="lab-playback">
              <button
                type="button"
                className="button button-copper button-small lab-play"
                onClick={() => setAnimate((value) => !value)}
              >
                {animate ? <Pause size={16} /> : <Play size={16} />}
                {animate ? "Pauză animație" : "Pornește animația"}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setSweep(0);
                  setAnimate(true);
                }}
                title="Reia animația"
                aria-label="Reia animația de la capăt"
              >
                <Reset size={18} />
              </button>
            </div>
          </div>

          <div className="lab-main">
            <div className="lab-stage-card">
              <div className="lab-stage-head">
                <div>
                  <div className="lab-chart-kicker">
                    <span className="live-dot" />
                    conductor în probă
                  </div>
                  <h3>{material.name}</h3>
                  <p>
                    {material.use} · ρ₀ = {fmtRho(material.rho20)} · α ={" "}
                    {fmt(material.alpha, 5)} K⁻¹
                  </p>
                </div>
                <div className="lab-stage-badges">
                  <span
                    className={`heat-chip heat-chip-${level}`}
                    aria-live="polite"
                  >
                    {level === "normal" ? <Bolt size={13} /> : <Flame size={13} />}
                    {HEAT_LABEL[level]}
                  </span>
                  <span className="chip">
                    j = {fmt(model.currentDensity, 1)} A/mm²
                  </span>
                </div>
              </div>

              <div className="lab-stage-wrap">
                <WireCanvas
                  model={model}
                  animate={animate}
                  showReference={showReference}
                />
                <div className="lab-stage-hint">
                  <CrossSection size={13} />
                  desen la scară logaritmică
                </div>
              </div>

              <div className="lab-timeline">
                <span className="lab-timeline-label">măsoară</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(sweep * 100)}
                  aria-label="Derulare proces de măsurare"
                  onChange={(event) => {
                    setAnimate(false);
                    setSweep(Number(event.target.value) / 100);
                  }}
                  style={{ "--fill": `${sweep * 100}%` } as CSSProperties}
                />
                <span className="lab-timeline-label">animează</span>
                <span className="lab-timeline-value">
                  {Math.round(sweep * 100)}%
                </span>
              </div>

              <div className="lab-legend">
                <span>
                  <i className="legend-line legend-wire" />
                  firul măsurat
                </span>
                <span>
                  <i className="legend-dot legend-electron" />
                  electroni de conducție
                </span>
                <span>
                  <i className="legend-dot legend-ion" />
                  ioni ai rețelei
                </span>
                {showReference ? (
                  <span>
                    <i className="legend-line legend-ref" />
                    referință 1 m · 1 mm²
                  </span>
                ) : null}
              </div>
            </div>

            <aside className="lab-side">
              <div className="lab-readout">
                <div className="lab-readout-head">
                  <span className="card-kicker">rezistența măsurată</span>
                  <span className="chip chip-copper">R = ρL/A</span>
                </div>
                <strong className="lab-readout-value">
                  {fmtResistance(model.resistance, 3)}
                </strong>
                <div className="lab-readout-scale">
                  <span
                    className="lab-readout-fill"
                    style={{
                      width: `${(
                        clamp(
                          (Math.log10(Math.max(model.resistance, 1e-4)) + 4) / 6,
                          0.02,
                          1,
                        ) * 100
                      ).toFixed(2)}%`,
                    }}
                  />
                </div>
                <div className="lab-readout-foot">
                  <span>μΩ</span>
                  <span>mΩ</span>
                  <span>Ω</span>
                  <span>kΩ</span>
                  <span>MΩ</span>
                </div>
                <div className="lab-readout-note">
                  {Math.abs(ratioToCopper - 1) < 0.02 ? (
                    <span>egal cu un fir de cupru identic</span>
                  ) : (
                    <span>
                      de <b>{fmt(ratioToCopper, 1)}×</b>{" "}
                      {ratioToCopper > 1 ? "mai mare" : "mai mic"} decât cuprul, la
                      aceleași dimensiuni
                    </span>
                  )}
                </div>
              </div>

              <div className="lab-chart-card">
                <div className="lab-chart-head">
                  <div>
                    <div className="lab-chart-kicker">
                      <span className="live-dot" />
                      legea lui Ohm
                    </div>
                    <h3>I–U pentru acest fir</h3>
                  </div>
                  <span className="chip">U = R·I</span>
                </div>
                <div className="lab-chart-wrap">
                  <IuChart
                    resistance={model.resistance}
                    current={current}
                    onCurrent={(value) => {
                      setCurrent(clamp(value, CURRENT_MIN, CURRENT_MAX));
                      setActivePreset("");
                    }}
                  />
                  <div className="lab-chart-hint">
                    <span aria-hidden="true">↔</span>
                    trage pe grafic pentru curent
                  </div>
                </div>
                <div className="iu-values">
                  <span>
                    U = <b>{fmtVoltage(model.voltage)}</b>
                  </span>
                  <span>
                    I = <b>{fmtCurrent(model.current)}</b>
                  </span>
                  <span>
                    P = <b>{fmtPower(model.power)}</b>
                  </span>
                </div>
              </div>
            </aside>
          </div>

          <div className="lab-controls">
            <div className="lab-field lab-material-field">
              <span className="field-label">
                <span>Materialul</span>
                <span className="field-value">{material.symbol}</span>
              </span>
              <select
                value={materialId}
                aria-label="Materialul conductorului"
                onChange={(event) => changeMaterial(event.target.value as MaterialId)}
              >
                {MATERIALS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.symbol}) · {fmt(item.rho20 * 1e6, 3)} Ω·mm²/m
                  </option>
                ))}
              </select>
              <span className="field-hint">
                {material.family === "aliaj"
                  ? "aliaj"
                  : material.family === "nemetal"
                    ? "nemetal"
                    : "metal"}{" "}
                · {material.note}
              </span>
            </div>

            <LogSlider
              label="Lungimea L"
              value={length}
              min={LENGTH_MIN}
              max={LENGTH_MAX}
              display={fmtLength(length)}
              hint="R crește proporțional cu L · scară logaritmică"
              onChange={update(setLength)}
            />

            <LogSlider
              label="Diametrul d"
              value={diameter}
              min={DIAMETER_MIN}
              max={DIAMETER_MAX}
              display={fmtDiameter(diameter)}
              hint={`secțiune ${fmtArea(area)}${gaugeLabel ? ` · ${gaugeLabel}` : ""}`}
              onChange={update(setDiameter)}
            />

            <TempSlider
              value={temperature}
              min={TEMP_MIN}
              max={TEMP_MAX}
              display={fmtTemperature(temperature)}
              hint={`ρ = ${fmtRho(model.rho)} · factor ${fmt(model.temperatureFactor, 3)}× · scară extinsă`}
              onChange={update(setTemperature)}
            />

            <LabSlider
              label="Curentul I"
              value={current}
              min={CURRENT_MIN}
              max={CURRENT_MAX}
              step={0.01}
              display={fmtCurrent(current)}
              hint={
                level === "normal"
                  ? `U = ${fmtVoltage(model.voltage)} · P = ${fmtPower(model.power)}`
                  : `${HEAT_LABEL[level]} · P = ${fmtPower(model.power)}`
              }
              onChange={update(setCurrent)}
            />

            <div className="lab-control-actions">
              <button
                type="button"
                className={`button button-secondary button-small ${
                  showReference ? "is-pressed" : ""
                }`}
                onClick={() => setShowReference((value) => !value)}
                aria-pressed={showReference}
              >
                <Ruler size={15} />
                {showReference ? "Ascunde referința" : "Compară cu 1 m · 1 mm²"}
              </button>
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

          <div className="lab-quick-gauge">
            <span className="card-kicker">secțiuni uzuale</span>
            {WIRE_GAUGES.map((gauge) => (
              <button
                key={gauge.area}
                type="button"
                className={
                  Math.abs(gauge.area - area) / area < 0.03 ? "is-active" : ""
                }
                onClick={() => {
                  setDiameter(diameterFromArea(gauge.area));
                  setActivePreset("");
                }}
                title={`${gauge.usage} · până la ~${gauge.maxCurrent} A`}
              >
                {gauge.label}
              </button>
            ))}
            <span className="lab-quick-gauge-note">
              cupru · curent maxim orientativ
            </span>
          </div>

          <div className="lab-status" aria-live="polite">
            <div className="lab-status-item">
              <span className="card-kicker">
                <Thermometer size={12} /> temperatură
              </span>
              <strong>
                ρ = {fmtRho(model.rho)}{" "}
                <em>({fmt(model.temperatureFactor, 3)}× ρ₀)</em>
              </strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">
                <CrossSection size={12} /> geometrie
              </span>
              <strong>
                L/A = {fmtLength(length)} / {fmtArea(area)}
              </strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">
                <Plug size={12} /> la tensiunea U
              </span>
              <strong>
                {fmtVoltage(model.voltage)} · {fmtCurrent(model.current)} ·{" "}
                {fmtPower(model.power)}
              </strong>
            </div>
            <div className="lab-status-item">
              <span className="card-kicker">
                {level === "normal" ? <Bolt size={12} /> : <Warning size={12} />}{" "}
                viteză de derivă
              </span>
              <strong>{fmtSpeed(model.driftSpeed)}</strong>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
