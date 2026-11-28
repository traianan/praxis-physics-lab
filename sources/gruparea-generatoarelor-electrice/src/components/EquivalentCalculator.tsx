import React, { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { CircuitState, GeneratorUnit, GroupingTopology, ModuleTabId } from '../types/physics';
import { buildMixedBranches, formatCurrent, formatPower, solveCircuit } from '../utils/physicsEngine';
import { soundEngine } from '../utils/sound';

interface EquivalentCalculatorProps {
  onApplyToLab: (partialState: Partial<CircuitState>, targetTab: ModuleTabId) => void;
}

export const EquivalentCalculator: React.FC<EquivalentCalculatorProps> = ({ onApplyToLab }) => {
  const [mode, setMode] = useState<'series' | 'parallel' | 'mixed'>('series');
  const [generators, setGenerators] = useState<GeneratorUnit[]>([
    { id: 'c1', label: 'G1', emf: 6, internalResistance: 1.5, reversed: false },
    { id: 'c2', label: 'G2', emf: 6, internalResistance: 1.5, reversed: false },
    { id: 'c3', label: 'G3', emf: 4.5, internalResistance: 1, reversed: false },
  ]);
  const [mixedN, setMixedN] = useState(2);
  const [mixedM, setMixedM] = useState(3);
  const [mixedCellE, setMixedCellE] = useState(3.7);
  const [mixedCellR, setMixedCellR] = useState(0.6);
  const [loadR, setLoadR] = useState(10);

  const calcState: CircuitState = useMemo(() => {
    return {
      topology: mode as GroupingTopology,
      switchClosed: true,
      loadResistance: loadR,
      flowMode: 'conventional',
      generators,
      mixedSeriesCount: mixedN,
      mixedParallelCount: mixedM,
      mixedBranches: buildMixedBranches(mixedN, mixedM, mixedCellE, mixedCellR),
    };
  }, [mode, generators, mixedN, mixedM, mixedCellE, mixedCellR, loadR]);

  const metrics = useMemo(() => solveCircuit(calcState), [calcState]);

  const addGenerator = () => {
    if (generators.length >= 6) return;
    soundEngine.playClick();
    setGenerators((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        label: `G${prev.length + 1}`,
        emf: 6,
        internalResistance: 1.5,
        reversed: false,
      },
    ]);
  };

  const removeGenerator = (id: string) => {
    if (generators.length <= 2) return;
    soundEngine.playClick();
    setGenerators((prev) =>
      prev.filter((g) => g.id !== id).map((g, i) => ({ ...g, label: `G${i + 1}` }))
    );
  };

  const updateGen = (id: string, patch: Partial<GeneratorUnit>) => {
    setGenerators((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const handleLoadIntoLab = () => {
    soundEngine.playSuccess();
    onApplyToLab(
      {
        topology: mode,
        switchClosed: true,
        loadResistance: loadR,
        generators: generators.map((g) => ({ ...g })),
        mixedSeriesCount: mixedN,
        mixedParallelCount: mixedM,
        mixedBranches: buildMixedBranches(mixedN, mixedM, mixedCellE, mixedCellR),
      },
      mode
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Configurator */}
      <div className="lg:col-span-5 rounded-2xl border border-[#E4E2D8] bg-white p-5 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-[#0F4C3A] mb-1">
            <Calculator className="w-5 h-5" />
            <h2 className="text-lg font-bold text-[#17231E]">
              Calculator de rezistență și t.e.m. echivalentă
            </h2>
          </div>
          <p className="text-sm text-[#4E5D56]">
            Introdu sursele (cu E și r variabile) pentru a calcula instantaneu sursa echivalentă (E_e, r_e) și pașii algebrici.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F2F1EB]">
          {(
            [
              { id: 'series', label: 'Serie' },
              { id: 'parallel', label: 'Paralel' },
              { id: 'mixed', label: 'Mixtă' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundEngine.playClick();
                setMode(item.id);
              }}
              className={`min-h-[42px] px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === item.id
                  ? 'bg-[#0F4C3A] text-white shadow-sm'
                  : 'text-[#4E5D56] hover:text-[#17231E]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Generators Input */}
        {mode !== 'mixed' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#4E5D56]">
                Generatoare ({generators.length}/6)
              </span>
              <button
                onClick={addGenerator}
                disabled={generators.length >= 6}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg border border-[#D4D9D5] bg-[#F7F6F1] text-xs font-semibold text-[#0F4C3A] hover:bg-[#EAECE6] disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adaugă sursă
              </button>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {generators.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#17231E]">{g.label}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          updateGen(g.id, { reversed: !g.reversed });
                        }}
                        className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                          g.reversed
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-[#D4D9D5] text-[#4E5D56] hover:text-[#17231E]'
                        }`}
                        title="Inversează polaritatea"
                      >
                        <RefreshCw className="w-3 h-3 inline mr-1" />
                        {g.reversed ? 'Opoziție (−/+)' : 'Normal (+/−)'}
                      </button>
                      {generators.length > 2 && (
                        <button
                          onClick={() => removeGenerator(g.id)}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-md border border-[#E4E2D8] text-[#64748B] hover:text-red-600 hover:border-red-200 transition-colors"
                          aria-label={`Șterge ${g.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs text-[#4E5D56] block mb-1">T.e.m. E (V)</span>
                      <input
                        type="number"
                        min={0.5}
                        max={48}
                        step={0.5}
                        value={g.emf}
                        onChange={(e) =>
                          updateGen(g.id, { emf: Math.max(0.5, Math.min(48, Number(e.target.value) || 0.5)) })
                        }
                        className="w-full min-h-[40px] rounded-lg border border-[#D4D9D5] bg-white px-2.5 text-sm font-mono tabular-nums font-semibold text-[#17231E]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-[#4E5D56] block mb-1">Rez. internă r (Ω)</span>
                      <input
                        type="number"
                        min={0.1}
                        max={50}
                        step={0.1}
                        value={g.internalResistance}
                        onChange={(e) =>
                          updateGen(g.id, {
                            internalResistance: Math.max(0.1, Math.min(50, Number(e.target.value) || 0.1)),
                          })
                        }
                        className="w-full min-h-[40px] rounded-lg border border-[#D4D9D5] bg-white px-2.5 text-sm font-mono tabular-nums font-semibold text-[#17231E]"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-[#4E5D56] block mb-1">Surse în serie / ramură (n)</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={mixedN}
                  onChange={(e) => setMixedN(Math.max(1, Math.min(4, Math.round(Number(e.target.value) || 1))))}
                  className="w-full min-h-[42px] rounded-lg border border-[#D4D9D5] bg-white px-3 text-sm font-mono font-semibold"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#4E5D56] block mb-1">Ramuri în paralel (m)</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={mixedM}
                  onChange={(e) => setMixedM(Math.max(1, Math.min(4, Math.round(Number(e.target.value) || 1))))}
                  className="w-full min-h-[42px] rounded-lg border border-[#D4D9D5] bg-white px-3 text-sm font-mono font-semibold"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#4E5D56] block mb-1">T.e.m. per celulă E (V)</span>
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.1}
                  value={mixedCellE}
                  onChange={(e) => setMixedCellE(Math.max(0.5, Math.min(24, Number(e.target.value) || 1)))}
                  className="w-full min-h-[42px] rounded-lg border border-[#D4D9D5] bg-white px-3 text-sm font-mono font-semibold"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#4E5D56] block mb-1">Rez. internă celulă r (Ω)</span>
                <input
                  type="number"
                  min={0.1}
                  max={20}
                  step={0.1}
                  value={mixedCellR}
                  onChange={(e) => setMixedCellR(Math.max(0.1, Math.min(20, Number(e.target.value) || 0.1)))}
                  className="w-full min-h-[42px] rounded-lg border border-[#D4D9D5] bg-white px-3 text-sm font-mono font-semibold"
                />
              </label>
            </div>
          </div>
        )}

        {/* Load resistance input */}
        <label className="block rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-[#17231E]">Rezistența externă de sarcină (R)</span>
            <span className="text-sm font-mono font-bold text-[#0F4C3A] tabular-nums">{loadR} Ω</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={100}
            step={0.5}
            value={loadR}
            onChange={(e) => setLoadR(Number(e.target.value))}
            className="praxis-slider"
          />
        </label>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleLoadIntoLab}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B] transition-colors"
          >
            Simulează în laborator <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setGenerators([
                { id: 'c1', label: 'G1', emf: 6, internalResistance: 1.5, reversed: false },
                { id: 'c2', label: 'G2', emf: 6, internalResistance: 1.5, reversed: false },
              ]);
              setLoadR(10);
            }}
            className="min-h-[44px] px-3.5 rounded-xl border border-[#D4D9D5] bg-white text-sm font-semibold text-[#4E5D56] hover:text-[#17231E]"
            title="Resetează calculatorul"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Step-by-Step Result Panel */}
      <div className="lg:col-span-7 rounded-2xl border border-[#E4E2D8] bg-white p-5 space-y-5">
        <h3 className="text-base font-bold text-[#17231E]">
          Rezultate echivalente și rezolvare pas cu pas
        </h3>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-[#F4F8F6] border border-[#DCE6E1] p-3.5">
            <div className="text-xs font-medium text-[#4E5D56]">T.e.m. echivalentă (E_e)</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#0F4C3A] mt-1">
              {metrics.equivalentEmf.toFixed(2)} V
            </div>
          </div>
          <div className="rounded-xl bg-[#F4F8F6] border border-[#DCE6E1] p-3.5">
            <div className="text-xs font-medium text-[#4E5D56]">Rez. internă echiv. (r_e)</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#0F4C3A] mt-1">
              {metrics.equivalentInternalR.toFixed(2)} Ω
            </div>
          </div>
          <div className="rounded-xl bg-[#FCFBF8] border border-[#E4E2D8] p-3.5">
            <div className="text-xs font-medium text-[#4E5D56]">Curent prin R (I)</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#C2410C] mt-1">
              {formatCurrent(metrics.loadCurrentAbs)}
            </div>
          </div>
          <div className="rounded-xl bg-[#FCFBF8] border border-[#E4E2D8] p-3.5">
            <div className="text-xs font-medium text-[#4E5D56]">Tensiune borne (U)</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#0284C7] mt-1">
              {metrics.terminalVoltage.toFixed(2)} V
            </div>
          </div>
        </div>

        {/* Algebraic Derivation */}
        <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-4 space-y-3 text-sm">
          <div className="font-bold text-[#17231E]">Pasul 1 — Calculul rezistenței interne echivalente (r_e)</div>
          {mode === 'series' && (
            <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] overflow-x-auto">
              r_e = {generators.map((g) => g.internalResistance).join(' + ')} ={' '}
              <strong className="text-[#0F4C3A]">{metrics.equivalentInternalR.toFixed(2)} Ω</strong>
            </div>
          )}
          {mode === 'parallel' && (
            <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] overflow-x-auto">
              1 / r_e = {generators.map((g) => `1/${g.internalResistance}`).join(' + ')} ={' '}
              {(1 / metrics.equivalentInternalR).toFixed(3)} S ⇒ r_e ={' '}
              <strong className="text-[#0F4C3A]">{metrics.equivalentInternalR.toFixed(3)} Ω</strong>
            </div>
          )}
          {mode === 'mixed' && (
            <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] overflow-x-auto">
              r_e = (n · r) / m = ({mixedN} · {mixedCellR}) / {mixedM} ={' '}
              <strong className="text-[#0F4C3A]">{metrics.equivalentInternalR.toFixed(3)} Ω</strong>
            </div>
          )}

          <div className="font-bold text-[#17231E] pt-1">
            Pasul 2 — Calculul tensiunii electromotoare echivalente (E_e)
          </div>
          {mode === 'series' && (
            <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] overflow-x-auto">
              E_e ={' '}
              {generators
                .map((g, idx) => `${idx === 0 ? (g.reversed ? '-' : '') : g.reversed ? ' − ' : ' + '}${g.emf}`)
                .join('')}{' '}
              = <strong className="text-[#0F4C3A]">{metrics.equivalentEmf.toFixed(2)} V</strong>
            </div>
          )}
          {mode === 'parallel' && (
            <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] overflow-x-auto">
              E_e = [ {generators.map((g) => `(${g.reversed ? -g.emf : g.emf}/${g.internalResistance})`).join(' + ')} ] / (1/r_e) ={' '}
              <strong className="text-[#0F4C3A]">{metrics.equivalentEmf.toFixed(2)} V</strong>
            </div>
          )}
          {mode === 'mixed' && (
            <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] overflow-x-auto">
              E_e = n · E = {mixedN} · {mixedCellE} ={' '}
              <strong className="text-[#0F4C3A]">{metrics.equivalentEmf.toFixed(2)} V</strong>
            </div>
          )}

          <div className="font-bold text-[#17231E] pt-1">
            Pasul 3 — Legea lui Ohm pentru circuitul echivalent & bilanț energetic
          </div>
          <div className="font-mono text-xs sm:text-sm bg-white rounded-lg border border-[#E4E2D8] p-3 text-[#17231E] space-y-1.5 overflow-x-auto">
            <div>
              I = |E_e| / (R + r_e) = {metrics.equivalentEmfAbs.toFixed(2)} / ({loadR} +{' '}
              {metrics.equivalentInternalR.toFixed(2)}) ={' '}
              <strong className="text-[#C2410C]">{formatCurrent(metrics.loadCurrentAbs)}</strong>
            </div>
            <div>
              U = I · R = {metrics.terminalVoltage.toFixed(2)} V · P_R ={' '}
              {formatPower(metrics.loadPower)} · P_internă = {formatPower(metrics.internalPower)} · η ={' '}
              <strong>{metrics.efficiency.toFixed(1)}%</strong>
            </div>
            <div>
              Curent de scurtcircuit: I_sc = E_e / r_e = {formatCurrent(metrics.shortCircuitCurrent)} ·
              Putere maximă posibilă (la R = r_e): {formatPower(metrics.maxTransferPower)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
