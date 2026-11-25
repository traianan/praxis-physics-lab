import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { BodyResonanceConfig, ExcitationTechnique, LabModuleId, MissionId, NotationSystem, SandboxSoundSource, ScaleId, StringState, TuningId } from '../../types/guitar';
import {
  ANGLO_NAMES,
  GUIDED_MISSIONS,
  SCALES,
  TUNING_PRESETS,
  formatMidiLabel,
  formatNoteName,
  frequencyToNote,
  getEffectiveFretLength,
  getFretFrequency,
  harmonicAmplitudes,
  stringFundamentalFrequency,
} from '../../utils/musicTheory';
import { AcousticGuitar2D, StringPluckEvent } from '../AcousticGuitar2D';
import { AdsrEnvelopePanel } from '../AdsrEnvelopePanel';
import { BodyResonancePanel } from '../BodyResonancePanel';
import { ChromaticTunerPanel } from '../ChromaticTunerPanel';
import { FourierAnalyzerPanel } from '../FourierAnalyzerPanel';
import { HarmonicAnalyzerPanel } from '../HarmonicAnalyzerPanel';
import { MetronomePanel } from '../MetronomePanel';
import { OscilloscopePanel } from '../OscilloscopePanel';
import { PhysicsChallengesPanel } from '../PhysicsChallengesPanel';
import { PolyphonicTunerPanel } from '../PolyphonicTunerPanel';
import { Spectrogram2DPanel } from '../Spectrogram2DPanel';
import { StringVibration3DPanel } from '../StringVibration3DPanel';
import { TimbreComparisonPanel } from '../TimbreComparisonPanel';
import { WavRecorderPanel } from '../WavRecorderPanel';

type Module8SandboxProps = {
  strings: StringState[];
  tuning: TuningId;
  onChangeTuning: (t: TuningId) => void;
  notation: NotationSystem;
  completedMissions: MissionId[];
  onCompleteMission: (id: MissionId) => void;
  onNavigateModule: (id: LabModuleId) => void;
};

export const Module8Sandbox: React.FC<Module8SandboxProps> = ({
  strings,
  tuning,
  onChangeTuning,
  notation,
  completedMissions,
  onCompleteMission,
  onNavigateModule,
}) => {
  const [selectedStringId, setSelectedStringId] = useState<number>(6);
  const [fretsMap, setFretsMap] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  const [technique, setTechnique] = useState<ExcitationTechnique>('normal');
  const [pickPosition, setPickPosition] = useState<number>(0.22);
  const [overlayScale, setOverlayScale] = useState<ScaleId | 'none'>('none');
  const [overlayRoot, setOverlayRoot] = useState<number>(0);
  const [lastPluck, setLastPluck] = useState<StringPluckEvent | null>(null);
  const [pluckTimestamps, setPluckTimestamps] = useState<Record<number, number>>({});
  const [toolFilter, setToolFilter] = useState<
    | 'all'
    | 'harmonics_analyzer'
    | 'adsr'
    | 'spectrogram2d'
    | 'challenges'
    | 'timbre'
    | 'bodyeq'
    | 'vib3d'
    | 'poly'
    | 'tuner'
    | 'metronome'
    | 'recorder'
    | 'oscilloscope'
    | 'fourier'
  >('harmonics_analyzer');
  const [soundSource, setSoundSource] = useState<SandboxSoundSource>('guitar');
  const [customHarmonics, setCustomHarmonics] = useState<number[]>(() => harmonicAmplitudes(0.22, 8));
  const [useCustomHarmonics, setUseCustomHarmonics] = useState<boolean>(false);
  const [bodyConfig, setBodyConfig] = useState<BodyResonanceConfig>(() => audioEngine.getBodyResonance());

  type PhysicsPresetId = 'standard' | 'loose' | 'bright_thin' | 'heavy_bass' | 'custom';
  const [physicsPreset, setPhysicsPreset] = useState<PhysicsPresetId>('standard');
  const initialStr = strings.find((s) => s.id === 6) ?? strings[5];
  const [lengthM, setLengthM] = useState<number>(initialStr.length);
  const [tensionN, setTensionN] = useState<number>(initialStr.tension);
  const [densityGPerM, setDensityGPerM] = useState<number>(
    Number((initialStr.linearDensity * 1000).toFixed(2))
  );

  // Sync physical string parameters when tuning changes and preset is nominal
  useEffect(() => {
    if (physicsPreset === 'standard') {
      const s = strings.find((st) => st.id === selectedStringId) ?? strings[5];
      setLengthM(s.length);
      setTensionN(s.tension);
      setDensityGPerM(Number((s.linearDensity * 1000).toFixed(2)));
    }
  }, [strings, selectedStringId, physicsPreset]);

  const scaleOverlayPitchClasses = useMemo(() => {
    if (overlayScale === 'none') return [];
    return SCALES[overlayScale].intervals.map((semi) => (overlayRoot + semi) % 12);
  }, [overlayScale, overlayRoot]);

  const activeString = strings.find((s) => s.id === selectedStringId) ?? strings[5];
  const activeFret = fretsMap[selectedStringId] ?? 0;
  const effectiveLengthM = getEffectiveFretLength(lengthM, activeFret);
  const muKgPerM = densityGPerM / 1000;
  const activeFreq = stringFundamentalFrequency(effectiveLengthM, tensionN, muKgPerM);
  const activeNoteInfo = useMemo(() => frequencyToNote(activeFreq), [activeFreq]);

  // Higher tension & lower linear density preserve upper harmonics longer (brighter harmonic sustain)
  const stiffnessBrightness = Math.max(
    0,
    Math.min(1, (tensionN / 115) * (1.8 / Math.max(0.45, densityGPerM)))
  );
  const computedDamping = Number((0.988 + Math.min(0.009, stiffnessBrightness * 0.008)).toFixed(4));
  const visualGaugeMm = Math.max(0.25, Math.min(1.65, Math.sqrt(densityGPerM / 4.8)));

  const applyPhysicsPreset = (preset: PhysicsPresetId, targetString = activeString) => {
    setPhysicsPreset(preset);
    if (preset === 'standard') {
      setLengthM(targetString.length);
      setTensionN(targetString.tension);
      setDensityGPerM(Number((targetString.linearDensity * 1000).toFixed(2)));
    } else if (preset === 'loose') {
      setLengthM(0.65);
      setTensionN(Number((targetString.tension * 0.68).toFixed(1)));
      setDensityGPerM(Number((targetString.linearDensity * 1000).toFixed(2)));
    } else if (preset === 'bright_thin') {
      setLengthM(0.62);
      setTensionN(118);
      setDensityGPerM(0.65);
    } else if (preset === 'heavy_bass') {
      setLengthM(0.72);
      setTensionN(78);
      setDensityGPerM(8.8);
    }
  };

  const playNoteWithSource = (
    freq: number,
    source: SandboxSoundSource,
    stopPrevious = false,
    dampingOverride = computedDamping
  ) => {
    if (stopPrevious) {
      audioEngine.stopAll();
    }
    if (source === 'guitar') {
      audioEngine.playPluckedString(freq, {
        method: useCustomHarmonics ? 'harmonics' : 'karplus',
        pickPosition,
        technique,
        damping: dampingOverride,
        duration: 3.0,
        customHarmonics: useCustomHarmonics ? customHarmonics : undefined,
      });
    } else {
      audioEngine.playTone(freq, 2.2, source, 0.22);
    }
  };

  const handlePluck = (sid: number, fret: number, _reportedFreq?: number) => {
    const clickedStr = strings.find((s) => s.id === sid) ?? activeString;
    let useL = lengthM;
    let useT = tensionN;
    let useMu = muKgPerM;

    if (sid !== selectedStringId && physicsPreset === 'standard') {
      useL = clickedStr.length;
      useT = clickedStr.tension;
      useMu = clickedStr.linearDensity;
      setLengthM(useL);
      setTensionN(useT);
      setDensityGPerM(Number((useMu * 1000).toFixed(2)));
    }

    const effLen = getEffectiveFretLength(useL, fret);
    const freq = stringFundamentalFrequency(effLen, useT, useMu);
    const bright = Math.max(0, Math.min(1, (useT / 115) * (1.8 / Math.max(0.45, useMu * 1000))));
    const damp = Number((0.988 + Math.min(0.009, bright * 0.008)).toFixed(4));

    setSelectedStringId(sid);
    setFretsMap((prev) => ({ ...prev, [sid]: fret }));

    playNoteWithSource(freq, soundSource, false, damp);

    const ts = performance.now();
    setLastPluck({ stringId: sid, fret, frequency: freq, timestamp: ts });

    if (sid === 1 && fret === 5 && Math.abs(freq - 440) < 6) {
      onCompleteMission('m1_a4_string1');
    }
    if (sid === 6 && fret === 5 && Math.abs(freq - 110) < 3) {
      onCompleteMission('m2_a2_string6');
    }
  };

  const handleStrumAll = () => {
    const ordered = strings.slice().reverse(); // 6 -> 1
    const freqs = ordered.map((s) => getFretFrequency(s.openFrequency, fretsMap[s.id] ?? 0));
    if (soundSource === 'guitar') {
      audioEngine.playChord(freqs, 42, {
        method: useCustomHarmonics ? 'harmonics' : 'karplus',
        pickPosition,
        technique,
        damping: computedDamping,
        duration: 3.0,
        customHarmonics: useCustomHarmonics ? customHarmonics : undefined,
      });
    } else {
      freqs.forEach((f, idx) => {
        window.setTimeout(() => {
          audioEngine.playTone(f, 2.0, soundSource, 0.09);
        }, idx * 42);
      });
    }
    const now = performance.now();
    const nextTs: Record<number, number> = {};
    ordered.forEach((s, idx) => {
      nextTs[s.id] = now + idx * 42;
    });
    setPluckTimestamps(nextTs);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <details className="rounded-xl border border-[#d8e2dc] bg-white overflow-hidden" open={window.innerWidth > 1200}>
        <summary className="min-h-[52px] cursor-pointer px-4 py-3 text-[#13221d] touch-manipulation">
          <div>
            <h2 className="text-base font-semibold">Modulul 8: Laborator liber & Misiuni</h2>
            <p className="text-xs text-[#53665f] mt-1">
              Combină liber acordajul chitarei, tehnica de ciupire, gamele pe manșon și analiza spectrală Fourier.
            </p>
          </div>
          <span className="text-xs font-medium text-[#53665f]">
            Parametrii chitarei · {completedMissions.length}/{GUIDED_MISSIONS.length} misiuni
          </span>
        </summary>
        <div className="p-4 sm:p-5 space-y-4">

        {/* Tuning */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Acordaj chitară</label>
          <select
            value={tuning}
            onChange={(e) => onChangeTuning(e.target.value as TuningId)}
            className="w-full rounded-lg border border-[#d8e2dc] bg-[#fafcfa] px-3 py-2 text-xs font-medium text-[#13221d] outline-none focus:border-[#0d4a3e]"
          >
            {(Object.keys(TUNING_PRESETS) as TuningId[]).map((tid) => (
              <option key={tid} value={tid}>
                {TUNING_PRESETS[tid].name}
              </option>
            ))}
          </select>
        </div>

        {/* Sound Source: Acoustic Guitar vs Pure Oscillator */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">
            Sursă de sunet (comparație formă de undă)
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'guitar', label: 'Chitară acustică' },
                { id: 'sine', label: 'Sinusoidal' },
                { id: 'triangle', label: 'Triunghiular' },
                { id: 'sawtooth', label: 'Dinte fierăstrău' },
              ] as const
            ).map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => {
                  setSoundSource(src.id);
                  playNoteWithSource(activeFreq, src.id, true);
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  soundSource === src.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>

        {/* Excitation technique */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Tehnică de excitare a corzii</label>
          <select
            value={technique}
            onChange={(e) => setTechnique(e.target.value as ExcitationTechnique)}
            className="w-full rounded-lg border border-[#d8e2dc] bg-[#fafcfa] px-3 py-2 text-xs font-medium text-[#13221d] outline-none focus:border-[#0d4a3e]"
          >
            <option value="normal">Ciupire standard (p = {pickPosition.toFixed(2)})</option>
            <option value="bridge">Lângă căluș (sul ponticello — tăios)</option>
            <option value="sweet_spot">Deasupra rozetei (sul tasto — cald)</option>
            <option value="harmonic_12">Armonic natural la fret 12 (2f₀)</option>
            <option value="harmonic_7">Armonic natural la fret 7 (3f₀)</option>
            <option value="harmonic_5">Armonic natural la fret 5 (4f₀)</option>
          </select>
        </div>

        {/* Pick position */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Poziție pană / deget p</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">{pickPosition.toFixed(2)} L</span>
          </div>
          <input
            type="range"
            min={0.06}
            max={0.48}
            step={0.01}
            value={pickPosition}
            onChange={(e) => setPickPosition(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        {/* Optional Scale Overlay */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Suprapunere gamă pe manșon</label>
          <div className="grid grid-cols-[1fr_76px] gap-2">
            <select
              value={overlayScale}
              onChange={(e) => setOverlayScale(e.target.value as ScaleId | 'none')}
              className="rounded-lg border border-[#d8e2dc] bg-[#fafcfa] px-2.5 py-2 text-xs text-[#13221d]"
            >
              <option value="none">Fără suprapunere</option>
              {(Object.keys(SCALES) as ScaleId[]).map((sid) => (
                <option key={sid} value={sid}>
                  {SCALES[sid].name}
                </option>
              ))}
            </select>
            <select
              value={overlayRoot}
              disabled={overlayScale === 'none'}
              onChange={(e) => setOverlayRoot(Number(e.target.value))}
              className="rounded-lg border border-[#d8e2dc] bg-[#fafcfa] px-2 py-2 text-xs text-[#13221d] disabled:opacity-40"
            >
              {ANGLO_NAMES.map((_, pc) => (
                <option key={pc} value={pc}>
                  {formatNoteName(pc, notation)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Physical String Parameters Selector & Sliders (L, T, mu) */}
        <div className="pt-2 border-t border-[#e3ebe6] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-[#13221d]">
              Parametri fizici coardă (L, T, μ)
            </label>
            {physicsPreset !== 'standard' && (
              <button
                type="button"
                onClick={() => applyPhysicsPreset('standard')}
                className="text-[11px] font-medium text-[#0d4a3e] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Nominal</span>
              </button>
            )}
          </div>

          <select
            value={physicsPreset}
            onChange={(e) => applyPhysicsPreset(e.target.value as PhysicsPresetId)}
            className="w-full rounded-lg border border-[#d8e2dc] bg-[#fafcfa] px-2.5 py-2 text-xs font-medium text-[#13221d] outline-none focus:border-[#0d4a3e]"
          >
            <option value="standard">Standard coardă (acordaj activ)</option>
            <option value="loose">Tensiune redusă (−32% T · sunet relaxat)</option>
            <option value="bright_thin">Coardă subțire & întinsă (bogată în armonice)</option>
            <option value="heavy_bass">Coardă groasă & lungă (gravă, armonice calde)</option>
            <option value="custom">Personalizat (L, T, μ manual)</option>
          </select>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-medium text-[#13221d]">Lungime diapazon L</span>
              <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">
                {lengthM.toFixed(2)} m (L_ef {(effectiveLengthM * 100).toFixed(1)} cm)
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={0.85}
              step={0.01}
              value={lengthM}
              onChange={(e) => {
                setPhysicsPreset('custom');
                setLengthM(Number(e.target.value));
              }}
              className="lab-slider w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-medium text-[#13221d]">Tensiune T</span>
              <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">
                {tensionN.toFixed(1)} N
              </span>
            </div>
            <input
              type="range"
              min={35}
              max={160}
              step={0.5}
              value={tensionN}
              onChange={(e) => {
                setPhysicsPreset('custom');
                setTensionN(Number(e.target.value));
              }}
              className="lab-slider w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-medium text-[#13221d]">Densitate liniară μ</span>
              <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">
                {densityGPerM.toFixed(2)} g/m
              </span>
            </div>
            <input
              type="range"
              min={0.35}
              max={10.5}
              step={0.05}
              value={densityGPerM}
              onChange={(e) => {
                setPhysicsPreset('custom');
                setDensityGPerM(Number(e.target.value));
              }}
              className="lab-slider w-full"
            />
          </div>

          <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#0d4a3e]">f₁ și conținut armonic</span>
              <span className="font-mono font-bold text-[#13221d] tabular-nums">
                f₁ = {activeFreq.toFixed(1)} Hz
              </span>
            </div>
            <div className="text-[10.5px] font-mono text-[#53665f] tabular-nums">
              2f₁ {Math.round(activeFreq * 2)} · 3f₁ {Math.round(activeFreq * 3)} · 4f₁{' '}
              {Math.round(activeFreq * 4)} Hz
            </div>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10.5px] text-[#53665f]">
                {stiffnessBrightness >= 0.55
                  ? 'Armonice înalte luminoase'
                  : stiffnessBrightness >= 0.25
                    ? 'Echilibru armonic echilibrat'
                    : 'Amortizare rapidă a înaltelor'}
              </span>
              <button
                type="button"
                onClick={() => handlePluck(selectedStringId, activeFret, activeFreq)}
                className="px-2.5 py-1 rounded-md bg-[#0d4a3e] hover:bg-[#09382f] text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Audiază</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guided Missions Checklist */}
        <div className="pt-2 border-t border-[#e3ebe6] space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#0d4a3e]">Misiuni experimentale ghidate</h3>
            <span className="text-xs font-mono font-semibold text-[#13221d] tabular-nums">
              {completedMissions.length} / {GUIDED_MISSIONS.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {GUIDED_MISSIONS.map((m) => {
              const done = completedMissions.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`rounded-lg border p-2.5 space-y-1 ${
                    done ? 'bg-[#edf3f0] border-[#0d4a3e]/30' : 'bg-[#fafcfa] border-[#d8e2dc]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0d4a3e] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#9aaea5] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className={`text-xs font-semibold ${done ? 'text-[#0d4a3e]' : 'text-[#13221d]'}`}>
                          {m.title}
                        </div>
                        <p className="text-[11px] text-[#53665f] mt-0.5 leading-snug">{m.description}</p>
                      </div>
                    </div>
                  </div>
                  {!done && (
                    <div className="flex items-center justify-between pt-1 pl-6">
                      <span className="text-[10.5px] text-[#53665f] italic">{m.hint}</span>
                      {m.targetModule !== 'string' && (
                        <button
                          type="button"
                          onClick={() => onNavigateModule(m.targetModule)}
                          className="text-[11px] font-semibold text-[#0d4a3e] hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer ml-2"
                        >
                          <span>Deschide</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </details>

      {/* Right Stage */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">COARDĂ ACTIVĂ</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono">
                Coarda {selectedStringId} · Fret {activeFret}
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">NOTĂ REZULTATĂ</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 tabular-nums">
                {formatMidiLabel(activeNoteInfo.midi, notation)}
                <span className="text-xs font-mono font-normal text-[#53665f] ml-1.5">
                  ({activeNoteInfo.cents >= 0 ? '+' : ''}
                  {activeNoteInfo.cents.toFixed(0)} sutimi)
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {activeFreq.toFixed(2)} Hz
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">ACORDAJ ACTIV</div>
              <div className="text-sm font-bold text-[#0d4a3e] mt-1 truncate">{TUNING_PRESETS[tuning].name.split(' ')[0]}</div>
            </div>
          </div>

          <AcousticGuitar2D
            strings={strings}
            notation={notation}
            selectedStringId={selectedStringId}
            activeFrets={fretsMap}
            highlightedPitchClasses={scaleOverlayPitchClasses}
            rootPitchClass={overlayScale !== 'none' ? overlayRoot : null}
            pickPosition={pickPosition}
            showHarmonicNodes={
              technique === 'harmonic_12' ? 2 : technique === 'harmonic_7' ? 3 : technique === 'harmonic_5' ? 4 : null
            }
            lastPluck={lastPluck}
            pluckTimestampMap={pluckTimestamps}
            onSelectFret={(sid, f) => {
              setSelectedStringId(sid);
              setFretsMap((prev) => ({ ...prev, [sid]: f }));
            }}
            onPluckString={handlePluck}
            onStrumAll={handleStrumAll}
          />
        </div>

        {/* Quick Lab Tools Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d8e2dc] bg-white px-4 py-2.5">
          <span className="text-xs font-semibold text-[#13221d]">Instrumente de laborator:</span>
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'all', label: 'Toate' },
                { id: 'harmonics_analyzer', label: 'Analizor de Armonice' },
                { id: 'adsr', label: 'Plic Envelope' },
                { id: 'spectrogram2d', label: 'Spectrogramă 2D' },
                { id: 'challenges', label: 'Provocări de Fizică' },
                { id: 'timbre', label: 'Comparație timbre' },
                { id: 'bodyeq', label: 'Rezonanță corp (EQ)' },
                { id: 'vib3d', label: 'Vibrație 3D' },
                { id: 'poly', label: 'Acordor polifonic' },
                { id: 'tuner', label: 'Acordor cromatic' },
                { id: 'metronome', label: 'Metronom' },
                { id: 'recorder', label: 'Înregistrare .wav' },
                { id: 'oscilloscope', label: 'Osciloscop' },
                { id: 'fourier', label: 'Spectru Fourier' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setToolFilter(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  toolFilter === item.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {(toolFilter === 'all' || toolFilter === 'harmonics_analyzer') && (
          <HarmonicAnalyzerPanel
            activeFrequency={activeFreq}
            noteLabel={formatMidiLabel(activeNoteInfo.midi, notation)}
            customHarmonics={customHarmonics}
            useCustomHarmonics={useCustomHarmonics}
            onChangeCustomHarmonics={setCustomHarmonics}
            onToggleUseCustomHarmonics={setUseCustomHarmonics}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'adsr') && (
          <AdsrEnvelopePanel
            activeFrequency={activeFreq}
            noteLabel={formatMidiLabel(activeNoteInfo.midi, notation)}
            lastPluckTimestamp={lastPluck?.timestamp ?? 0}
            onPlaySampleNote={() => handlePluck(selectedStringId, activeFret, activeFreq)}
            onPlaySampleChord={handleStrumAll}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'spectrogram2d') && (
          <Spectrogram2DPanel
            expectedFrequency={activeFreq}
            stringId={selectedStringId}
            fret={activeFret}
            openMidi={activeNoteInfo.midi - activeFret}
            notation={notation}
            onPluckDemo={() => handlePluck(selectedStringId, activeFret, activeFreq)}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'challenges') && <PhysicsChallengesPanel />}

        {(toolFilter === 'all' || toolFilter === 'timbre') && (
          <TimbreComparisonPanel
            activeFreq={activeFreq}
            openMidi={activeNoteInfo.midi - activeFret}
            fret={activeFret}
            stringId={selectedStringId}
            notation={notation}
            pickPosition={pickPosition}
            technique={technique}
            bodyConfig={bodyConfig}
            onPlayGuitar={() => handlePluck(selectedStringId, activeFret, activeFreq)}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'bodyeq') && (
          <BodyResonancePanel
            activeFrequency={activeFreq}
            onPlaySampleNote={() => handlePluck(selectedStringId, activeFret, activeFreq)}
            onPlaySampleChord={handleStrumAll}
            onConfigChange={setBodyConfig}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'vib3d') && (
          <StringVibration3DPanel
            frequency={activeFreq}
            stringId={selectedStringId}
            fret={activeFret}
            openMidi={activeNoteInfo.midi - activeFret}
            gaugeMm={visualGaugeMm}
            notation={notation}
            pickPosition={pickPosition}
            technique={technique}
            lastPluckTimestamp={lastPluck?.timestamp ?? 0}
            onPluckDemo={() => handlePluck(selectedStringId, activeFret, activeFreq)}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'poly') && (
          <PolyphonicTunerPanel strings={strings} notation={notation} />
        )}

        {(toolFilter === 'all' || toolFilter === 'tuner') && (
          <ChromaticTunerPanel strings={strings} notation={notation} />
        )}

        {(toolFilter === 'all' || toolFilter === 'metronome') && <MetronomePanel />}

        {(toolFilter === 'all' || toolFilter === 'recorder') && <WavRecorderPanel />}

        {(toolFilter === 'all' || toolFilter === 'oscilloscope') && (
          <OscilloscopePanel
            expectedFrequency={activeFreq}
            soundSource={soundSource}
            onChangeSoundSource={setSoundSource}
            onPlaySourceSample={(src) => playNoteWithSource(activeFreq, src, true)}
          />
        )}

        {(toolFilter === 'all' || toolFilter === 'fourier') && (
          <FourierAnalyzerPanel
            notation={notation}
            expectedFundamental={activeFreq}
            title="Vizualizare Fourier în timp real (Laborator liber)"
            subtitle="Compară spectrul unei ciupiri normale cu armonicele naturale sau cu ciupirea lângă căluș."
            compact
          />
        )}
      </div>
    </div>
  );
};
