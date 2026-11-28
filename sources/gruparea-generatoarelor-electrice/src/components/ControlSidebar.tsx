import React from 'react';
import {
  BookOpen,
  Minus,
  Plus,
  Power,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { CircuitMetrics, CircuitState, GeneratorUnit, ModuleTabId } from '../types/physics';
import { formatPower, formatResistance } from '../utils/physicsEngine';
import { soundEngine } from '../utils/sound';

interface ControlSidebarProps {
  activeTab: ModuleTabId;
  state: CircuitState;
  metrics: CircuitMetrics;
  onUpdateState: (updater: (prev: CircuitState) => CircuitState) => void;
  onToggleSwitch: () => void;
  onTogglePolarity: (id: string) => void;
  onJumpToModule: (tab: ModuleTabId) => void;
}

const StepperSlider: React.FC<{
  label: string;
  valueDisplay: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (val: number) => void;
}> = ({ label, valueDisplay, value, min, max, step, minLabel, maxLabel, onChange }) => {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(2))));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#4E5D56]">{label}</span>
        <span className="text-sm font-bold font-mono tabular-nums text-[#17231E]">
          {valueDisplay}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onChange(clamp(value - step));
          }}
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full border border-[#D4D9D5] bg-white text-[#17231E] hover:bg-[#F2F1EB] active:scale-95 transition"
          aria-label={`Scade ${label}`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="praxis-slider flex-1"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onChange(clamp(value + step));
          }}
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full border border-[#D4D9D5] bg-white text-[#17231E] hover:bg-[#F2F1EB] active:scale-95 transition"
          aria-label={`Crește ${label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex justify-between text-[11px] font-mono text-[#64748B] px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  activeTab,
  state,
  metrics,
  onUpdateState,
  onToggleSwitch,
  onTogglePolarity,
  onJumpToModule,
}) => {
  const { topology, generators, loadResistance, switchClosed, mixedSeriesCount, mixedParallelCount } =
    state;

  const moduleMeta: Record<string, { title: string; subtitle: string; formulaTitle: string; formulaLine: string; formulaNote: string }> = {
    basic: {
      title: 'Modulul 1: Concepte de bază și Generatorul real',
      subtitle:
        'Explorează relația dintre t.e.m. E, rezistența internă r (inclusă în sursă) și tensiunea la borne U.',
      formulaTitle: 'Formula Legii lui Ohm',
      formulaLine: 'I = E / (R + r)  |  U = I · R = E − I · r',
      formulaNote: `Puterea internă P_r = I²r = ${formatPower(metrics.internalPower)}; puterea utilă pe R este ${formatPower(metrics.loadPower)}.`,
    },
    series: {
      title: 'Modulul 2: Gruparea în serie și în opoziție',
      subtitle:
        'Modifică E și r pentru fiecare generator sau inversează polaritatea (+/−) pentru a studia legarea în opoziție.',
      formulaTitle: 'Formulele grupării în serie',
      formulaLine: 'E_e = Σ (± E_i)  |  r_e = Σ r_i',
      formulaNote: `Acum: E_e = ${metrics.equivalentEmf.toFixed(1)} V, r_e = ${metrics.equivalentInternalR.toFixed(2)} Ω, I_sc = ${metrics.shortCircuitCurrent.toFixed(2)} A.`,
    },
    parallel: {
      title: 'Modulul 3: Gruparea în paralel (Teorema Millman)',
      subtitle:
        'Compară surse identice (E_e = E, r_e = r/m) și surse cu t.e.m. diferite, observând curenții de ramură I_k.',
      formulaTitle: 'Formulele grupării în paralel',
      formulaLine: '1/r_e = Σ(1/r_i)  |  E_e = (Σ E_i/r_i) / (Σ 1/r_i)',
      formulaNote: `Acum: E_e = ${metrics.equivalentEmf.toFixed(2)} V, r_e = ${metrics.equivalentInternalR.toFixed(2)} Ω. ${metrics.hasCirculatingCurrent ? 'Există curent de circulație între surse!' : 'Surse echilibrate.'}`,
    },
    mixed: {
      title: 'Modulul 4: Gruparea mixtă (n × m)',
      subtitle:
        'Combină n generatoare în serie pe m ramuri în paralel pentru a adapta simultan E_e și r_e la sarcina R.',
      formulaTitle: 'Formulele grupării mixte',
      formulaLine: 'E_e = n · E  |  r_e = (n · r) / m',
      formulaNote: `Transfer maxim de putere are loc la R = r_e = ${metrics.equivalentInternalR.toFixed(2)} Ω (P_max = ${formatPower(metrics.maxTransferPower)}).`,
    },
  };

  const info = moduleMeta[activeTab] ?? moduleMeta.basic;

  const updateGenerator = (id: string, patch: Partial<GeneratorUnit>) => {
    onUpdateState((prev) => ({
      ...prev,
      generators: prev.generators.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  };

  const addGenerator = () => {
    if (generators.length >= 4) return;
    soundEngine.playClick();
    onUpdateState((prev) => ({
      ...prev,
      generators: [
        ...prev.generators,
        {
          id: `g-${Date.now()}`,
          label: `G${prev.generators.length + 1}`,
          emf: prev.generators[0]?.emf ?? 6,
          internalResistance: prev.generators[0]?.internalResistance ?? 1.5,
          reversed: false,
        },
      ],
    }));
  };

  const removeGenerator = (id: string) => {
    if (generators.length <= 2) return;
    soundEngine.playClick();
    onUpdateState((prev) => ({
      ...prev,
      generators: prev.generators
        .filter((g) => g.id !== id)
        .map((g, i) => ({ ...g, label: `G${i + 1}` })),
    }));
  };

  return (
    <aside className="rounded-2xl border border-[#E4E2D8] bg-white p-5 space-y-5">
      {/* Module Title & Intro */}
      <div className="space-y-1.5">
        <div className="flex items-start gap-2 text-[#17231E]">
          <BookOpen className="w-5 h-5 text-[#0F4C3A] shrink-0 mt-0.5" />
          <h2 className="text-lg font-extrabold leading-snug">{info.title}</h2>
        </div>
        <p className="text-xs sm:text-sm text-[#4E5D56] leading-relaxed">{info.subtitle}</p>
      </div>

      {/* BASIC TOPOLOGY CONTROLS */}
      {topology === 'basic' && generators[0] && (
        <div className="space-y-4">
          <StepperSlider
            label="Tensiune electromotoare (E)"
            valueDisplay={`${generators[0].emf} V`}
            value={generators[0].emf}
            min={1}
            max={24}
            step={0.5}
            minLabel="1 V"
            maxLabel="24 V"
            onChange={(val) => updateGenerator(generators[0].id, { emf: val })}
          />
          <StepperSlider
            label="Rezistența internă (r)"
            valueDisplay={`${generators[0].internalResistance} Ω`}
            value={generators[0].internalResistance}
            min={0.5}
            max={40}
            step={0.5}
            minLabel="0.5 Ω"
            maxLabel="40 Ω"
            onChange={(val) => updateGenerator(generators[0].id, { internalResistance: val })}
          />
        </div>
      )}

      {/* SERIES / PARALLEL MULTI-GENERATOR CONTROLS */}
      {(topology === 'series' || topology === 'parallel') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#4E5D56]">
              Surse electrice ({generators.length}/4)
            </span>
            <button
              type="button"
              onClick={addGenerator}
              disabled={generators.length >= 4}
              className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-lg border border-[#D4D9D5] bg-[#F7F6F1] text-xs font-semibold text-[#0F4C3A] hover:bg-[#EAECE6] disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" /> Adaugă sursă
            </button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-0.5">
            {generators.map((g) => (
              <div
                key={g.id}
                className={`rounded-xl border p-3 space-y-2.5 ${
                  g.reversed
                    ? 'border-red-200 bg-red-50/40'
                    : 'border-[#E4E2D8] bg-[#FCFBF8]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#17231E]">
                    {g.label} {g.reversed ? '(polaritate inversată)' : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {topology === 'series' && (
                      <button
                        type="button"
                        onClick={() => onTogglePolarity(g.id)}
                        className={`min-h-[32px] px-2.5 rounded-md border text-[11px] font-semibold transition-colors ${
                          g.reversed
                            ? 'border-red-300 bg-red-100 text-red-800'
                            : 'border-[#D4D9D5] bg-white text-[#4E5D56] hover:text-[#17231E]'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3 inline mr-1" />
                        {g.reversed ? 'Opoziție' : 'Inversează +/−'}
                      </button>
                    )}
                    {generators.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeGenerator(g.id)}
                        className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-md border border-[#E4E2D8] bg-white text-[#64748B] hover:text-red-600"
                        aria-label={`Elimină ${g.label}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <StepperSlider
                  label="T.e.m. (E)"
                  valueDisplay={`${g.emf} V`}
                  value={g.emf}
                  min={1}
                  max={24}
                  step={0.5}
                  minLabel="1 V"
                  maxLabel="24 V"
                  onChange={(val) => updateGenerator(g.id, { emf: val })}
                />
                <StepperSlider
                  label="Rez. internă (r)"
                  valueDisplay={`${g.internalResistance} Ω`}
                  value={g.internalResistance}
                  min={0.2}
                  max={20}
                  step={0.2}
                  minLabel="0.2 Ω"
                  maxLabel="20 Ω"
                  onChange={(val) => updateGenerator(g.id, { internalResistance: val })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MIXED TOPOLOGY CONTROLS */}
      {topology === 'mixed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-2.5">
              <div className="text-[11px] font-medium text-[#4E5D56] mb-1">
                Serie / ramură (n)
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateState((prev) => {
                      const nextN = Math.max(1, prev.mixedSeriesCount - 1);
                      const baseE = prev.mixedBranches[0]?.generators[0]?.emf ?? 4.5;
                      const baseR = prev.mixedBranches[0]?.generators[0]?.internalResistance ?? 1.5;
                      return {
                        ...prev,
                        mixedSeriesCount: nextN,
                        mixedBranches: Array.from({ length: prev.mixedParallelCount }, (_, m) => ({
                          id: `branch-${m + 1}`,
                          generators: Array.from({ length: nextN }, (__, n) => ({
                            id: `m-${m}-n-${n}`,
                            label: `G${m + 1}.${n + 1}`,
                            emf: baseE,
                            internalResistance: baseR,
                            reversed: false,
                          })),
                        })),
                      };
                    });
                  }}
                  className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D4D9D5] bg-white flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-base tabular-nums">{mixedSeriesCount}</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateState((prev) => {
                      const nextN = Math.min(3, prev.mixedSeriesCount + 1);
                      const baseE = prev.mixedBranches[0]?.generators[0]?.emf ?? 4.5;
                      const baseR = prev.mixedBranches[0]?.generators[0]?.internalResistance ?? 1.5;
                      return {
                        ...prev,
                        mixedSeriesCount: nextN,
                        mixedBranches: Array.from({ length: prev.mixedParallelCount }, (_, m) => ({
                          id: `branch-${m + 1}`,
                          generators: Array.from({ length: nextN }, (__, n) => ({
                            id: `m-${m}-n-${n}`,
                            label: `G${m + 1}.${n + 1}`,
                            emf: baseE,
                            internalResistance: baseR,
                            reversed: false,
                          })),
                        })),
                      };
                    });
                  }}
                  className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D4D9D5] bg-white flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-2.5">
              <div className="text-[11px] font-medium text-[#4E5D56] mb-1">
                Ramuri paralel (m)
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateState((prev) => {
                      const nextM = Math.max(1, prev.mixedParallelCount - 1);
                      const baseE = prev.mixedBranches[0]?.generators[0]?.emf ?? 4.5;
                      const baseR = prev.mixedBranches[0]?.generators[0]?.internalResistance ?? 1.5;
                      return {
                        ...prev,
                        mixedParallelCount: nextM,
                        mixedBranches: Array.from({ length: nextM }, (_, m) => ({
                          id: `branch-${m + 1}`,
                          generators: Array.from({ length: prev.mixedSeriesCount }, (__, n) => ({
                            id: `m-${m}-n-${n}`,
                            label: `G${m + 1}.${n + 1}`,
                            emf: baseE,
                            internalResistance: baseR,
                            reversed: false,
                          })),
                        })),
                      };
                    });
                  }}
                  className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D4D9D5] bg-white flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-base tabular-nums">{mixedParallelCount}</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateState((prev) => {
                      const nextM = Math.min(4, prev.mixedParallelCount + 1);
                      const baseE = prev.mixedBranches[0]?.generators[0]?.emf ?? 4.5;
                      const baseR = prev.mixedBranches[0]?.generators[0]?.internalResistance ?? 1.5;
                      return {
                        ...prev,
                        mixedParallelCount: nextM,
                        mixedBranches: Array.from({ length: nextM }, (_, m) => ({
                          id: `branch-${m + 1}`,
                          generators: Array.from({ length: prev.mixedSeriesCount }, (__, n) => ({
                            id: `m-${m}-n-${n}`,
                            label: `G${m + 1}.${n + 1}`,
                            emf: baseE,
                            internalResistance: baseR,
                            reversed: false,
                          })),
                        })),
                      };
                    });
                  }}
                  className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D4D9D5] bg-white flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <StepperSlider
            label="T.e.m. per celulă (E)"
            valueDisplay={`${state.mixedBranches[0]?.generators[0]?.emf ?? 4.5} V`}
            value={state.mixedBranches[0]?.generators[0]?.emf ?? 4.5}
            min={1}
            max={18}
            step={0.5}
            minLabel="1 V"
            maxLabel="18 V"
            onChange={(val) =>
              onUpdateState((prev) => ({
                ...prev,
                mixedBranches: prev.mixedBranches.map((b) => ({
                  ...b,
                  generators: b.generators.map((g) => ({ ...g, emf: val })),
                })),
              }))
            }
          />

          <StepperSlider
            label="Rezistența internă per celulă (r)"
            valueDisplay={`${state.mixedBranches[0]?.generators[0]?.internalResistance ?? 1.5} Ω`}
            value={state.mixedBranches[0]?.generators[0]?.internalResistance ?? 1.5}
            min={0.2}
            max={12}
            step={0.2}
            minLabel="0.2 Ω"
            maxLabel="12 Ω"
            onChange={(val) =>
              onUpdateState((prev) => ({
                ...prev,
                mixedBranches: prev.mixedBranches.map((b) => ({
                  ...b,
                  generators: b.generators.map((g) => ({ ...g, internalResistance: val })),
                })),
              }))
            }
          />
        </div>
      )}

      {/* EXTERNAL LOAD RESISTOR R */}
      <StepperSlider
        label="Rezistența de sarcină (R)"
        valueDisplay={formatResistance(loadResistance)}
        value={loadResistance}
        min={1}
        max={250}
        step={1}
        minLabel="1 Ω"
        maxLabel="250 Ω"
        onChange={(val) =>
          onUpdateState((prev) => ({
            ...prev,
            loadResistance: val,
          }))
        }
      />

      {/* SWITCH K TOGGLE BUTTON (Matches screenshot) */}
      <button
        type="button"
        onClick={onToggleSwitch}
        className={`w-full min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
          switchClosed
            ? 'border-[#D4D9D5] bg-[#F7F6F1] text-[#17231E] hover:bg-[#EAECE6]'
            : 'border-[#0F4C3A] bg-[#0F4C3A] text-white hover:bg-[#0A382B]'
        }`}
      >
        <Power className="w-4 h-4" />
        {switchClosed ? 'Deschide întrerupătorul K' : 'Închide întrerupătorul K'}
      </button>

      {/* QUICK PRESETS (Matches screenshot "Valori uzuale (Repere rapide)") */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-[#4E5D56]">Valori uzuale (Repere rapide)</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '4.5 V · 18 Ω', emf: 4.5, r: 1.5, R: 18 },
            { label: '9 V · 45 Ω', emf: 9, r: 3, R: 45 },
            { label: '12 V · 20 Ω', emf: 12, r: 2, R: 20 },
            { label: 'Adaptat R = r_e', emf: 12, r: 10, R: Math.max(1, Math.round(metrics.equivalentInternalR)) },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                if (idx === 3) {
                  onUpdateState((prev) => ({
                    ...prev,
                    loadResistance: Math.max(1, Number(metrics.equivalentInternalR.toFixed(1))),
                  }));
                } else {
                  onUpdateState((prev) => ({
                    ...prev,
                    loadResistance: preset.R,
                    generators: prev.generators.map((g) => ({
                      ...g,
                      emf: preset.emf,
                      internalResistance: preset.r,
                      reversed: false,
                    })),
                    mixedBranches: prev.mixedBranches.map((b) => ({
                      ...b,
                      generators: b.generators.map((g) => ({
                        ...g,
                        emf: preset.emf,
                        internalResistance: preset.r,
                        reversed: false,
                      })),
                    })),
                  }));
                }
              }}
              className="min-h-[38px] rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] px-2.5 py-1.5 text-xs font-semibold text-[#17231E] hover:border-[#0F4C3A]/50 hover:bg-[#F4F8F6] transition-colors tabular-nums"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* FORMULA SUMMARY CARD AT BOTTOM (Matches screenshot) */}
      <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-[#17231E]">{info.formulaTitle}</div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onJumpToModule('calculator');
            }}
            className="text-[11px] font-semibold text-[#0F4C3A] hover:underline"
          >
            Calculator →
          </button>
        </div>
        <div className="text-xs sm:text-sm font-mono font-bold text-[#0F4C3A]">{info.formulaLine}</div>
        <p className="text-xs text-[#4E5D56] leading-relaxed">{info.formulaNote}</p>
      </div>
    </aside>
  );
};
