import React from 'react';
import { ArrowUpRight, BatteryCharging, Lightbulb } from 'lucide-react';
import { PRACTICAL_PRESETS } from '../data/lessonContent';
import { CircuitState, ModuleTabId, PracticalPreset } from '../types/physics';
import { buildMixedBranches } from '../utils/physicsEngine';
import { soundEngine } from '../utils/sound';

interface PracticalExamplesProps {
  onLoadPreset: (partialState: Partial<CircuitState>, targetTab: ModuleTabId) => void;
}

export const PracticalExamples: React.FC<PracticalExamplesProps> = ({ onLoadPreset }) => {
  const handleLoad = (preset: PracticalPreset) => {
    soundEngine.playSuccess();
    const patch: Partial<CircuitState> = {
      topology: preset.topology,
      loadResistance: preset.loadResistance,
      switchClosed: preset.switchClosed,
    };
    if (preset.generators) {
      patch.generators = preset.generators.map((g) => ({ ...g }));
    }
    if (preset.topology === 'mixed' && preset.mixedSeriesCount && preset.mixedParallelCount) {
      patch.mixedSeriesCount = preset.mixedSeriesCount;
      patch.mixedParallelCount = preset.mixedParallelCount;
      patch.mixedBranches = buildMixedBranches(
        preset.mixedSeriesCount,
        preset.mixedParallelCount,
        3.7,
        0.3
      );
    }
    onLoadPreset(patch, preset.targetModule);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E4E2D8] bg-white p-5">
        <div className="flex items-center gap-2 text-[#0F4C3A] mb-1">
          <BatteryCharging className="w-5 h-5" />
          <h2 className="text-lg font-bold text-[#17231E]">
            Exemple practice din inginerie și viața de zi cu zi
          </h2>
        </div>
        <p className="text-sm text-[#4E5D56] max-w-3xl">
          Alege un scenariu real pentru a-l încărca instantaneu în simulatorul interactiv și a urmări valorile măsurate în timp real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRACTICAL_PRESETS.map((preset) => (
          <article
            key={preset.id}
            className="rounded-2xl border border-[#E4E2D8] bg-white p-5 flex flex-col justify-between gap-4 hover:border-[#0F4C3A]/40 transition-colors"
          >
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-[#4E5D56]">{preset.category}</div>
              <h3 className="text-base font-bold text-[#17231E]">{preset.title}</h3>
              <p className="text-sm text-[#4E5D56] leading-relaxed">{preset.summary}</p>
              <div className="rounded-xl bg-[#F4F8F6] border border-[#DCE6E1] p-3 text-xs text-[#17231E] leading-relaxed flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#0F4C3A] shrink-0 mt-0.5" />
                <span>{preset.physicsInsight}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EFECE3]">
              <span className="text-xs font-mono text-[#4E5D56]">
                Sarcină R = {preset.loadResistance} Ω
              </span>
              <button
                onClick={() => handleLoad(preset)}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B] transition-colors whitespace-nowrap"
              >
                Încarcă în simulator <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
