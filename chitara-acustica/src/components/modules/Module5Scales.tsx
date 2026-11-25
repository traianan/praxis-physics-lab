import React, { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { NotationSystem, ScaleId, StringState } from '../../types/guitar';
import {
  ANGLO_NAMES,
  DEGREE_NAMES_RO,
  ROMAN_DEGREES,
  SCALES,
  formatNoteName,
  midiToFrequency,
} from '../../utils/musicTheory';
import { AcousticGuitar2D, StringPluckEvent } from '../AcousticGuitar2D';
import { VirtualKeyboard } from '../VirtualKeyboard';

type Module5ScalesProps = {
  strings: StringState[];
  notation: NotationSystem;
};

export const Module5Scales: React.FC<Module5ScalesProps> = ({ strings, notation }) => {
  const [rootPc, setRootPc] = useState<number>(0); // C
  const [scaleId, setScaleId] = useState<ScaleId>('major');
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastPluck, setLastPluck] = useState<StringPluckEvent | null>(null);

  const timersRef = useRef<number[]>([]);

  const scale = SCALES[scaleId];
  const scalePitchClasses = scale.intervals.map((semi) => (rootPc + semi) % 12);
  const scaleName = `${formatNoteName(rootPc, notation)} ${scale.name.replace('Gamă ', '').toLowerCase()}`;

  const stopPlayback = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setIsPlaying(false);
    setActiveMidi(null);
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const playScale = () => {
    stopPlayback();
    setIsPlaying(true);
    const baseMidi = 60 + rootPc; // C4..B4 range
    const sequence = [...scale.intervals, 12]; // include octave at top

    sequence.forEach((semi, idx) => {
      const timerId = window.setTimeout(() => {
        const midi = baseMidi + semi;
        const freq = midiToFrequency(midi);
        setActiveMidi(midi);
        audioEngine.playPluckedString(freq, { method: 'karplus', duration: 1.5 });
        if (idx === sequence.length - 1) {
          const endTimer = window.setTimeout(() => {
            setIsPlaying(false);
            setActiveMidi(null);
          }, 500);
          timersRef.current.push(endTimer);
        }
      }, idx * 360);
      timersRef.current.push(timerId);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#13221d]">Modulul 5: Game și intervale</h2>
          <p className="text-xs text-[#53665f] mt-1">
            Alege tonica și tipul gamei pentru a evidenția treptele muzicale simultan pe tastatură și pe manșonul chitarei.
          </p>
        </div>

        {/* Tonic selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Tonică (nota fundamentală)</label>
          <div className="grid grid-cols-6 gap-1">
            {ANGLO_NAMES.map((_, pc) => (
              <button
                key={pc}
                type="button"
                onClick={() => setRootPc(pc)}
                className={`py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  rootPc === pc
                    ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                    : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                }`}
              >
                {formatNoteName(pc, notation)}
              </button>
            ))}
          </div>
        </div>

        {/* Scale type selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Tip de gamă</label>
          <div className="space-y-1.5">
            {(Object.keys(SCALES) as ScaleId[]).map((id) => {
              const s = SCALES[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setScaleId(id)}
                  className={`w-full px-3 py-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    scaleId === id
                      ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                      : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                  }`}
                >
                  <div className="font-semibold">{s.name}</div>
                  <div className={`font-mono text-[11px] mt-0.5 ${scaleId === id ? 'text-white/80' : 'text-[#53665f]'}`}>
                    {s.stepFormula}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            data-guitar-quick-action="scale"
            onClick={playScale}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Redă gama</span>
          </button>
          {isPlaying && (
            <button
              type="button"
              onClick={stopPlayback}
              className="py-2.5 px-3 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-[#13221d] cursor-pointer"
              title="Oprește redarea"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3.5 space-y-1">
          <div className="text-xs font-semibold text-[#0d4a3e]">Despre această gamă</div>
          <p className="text-xs text-[#53665f] leading-relaxed">{scale.description}</p>
        </div>
      </div>

      {/* Right Stage */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">TONALITATE ACTIVĂ</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 truncate">{scaleName}</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FORMULA DE INTERVALE</div>
              <div className="text-sm font-bold text-[#13221d] mt-1 font-mono truncate">{scale.stepFormula}</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">TREPTE</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {scale.intervals.length} note
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">TONICĂ (GRAD I)</div>
              <div className="text-base font-bold text-[#0d4a3e] mt-0.5">{formatNoteName(rootPc, notation)}</div>
            </div>
          </div>

          {/* Degrees & Diatonic Chords strip */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#13221d]">
              Treptele gamei (apasă orice treaptă pentru a o asculta)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {scale.intervals.map((semi, idx) => {
                const pc = (rootPc + semi) % 12;
                const midi = 60 + rootPc + semi;
                const isRoot = idx === 0;
                const roman = ROMAN_DEGREES[idx] ?? `${idx + 1}`;
                const quality = scale.diatonicQualities[idx] ?? '';
                return (
                  <button
                    key={semi}
                    type="button"
                    onClick={() => {
                      setActiveMidi(midi);
                      audioEngine.playPluckedString(midiToFrequency(midi), { method: 'karplus' });
                    }}
                    className={`rounded-lg border p-2.5 text-center transition-colors cursor-pointer ${
                      activeMidi === midi
                        ? 'bg-[#b85d2b] text-white border-[#b85d2b]'
                        : isRoot
                        ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                        : 'bg-[#fafcfa] hover:bg-[#edf3f0] text-[#13221d] border-[#d8e2dc]'
                    }`}
                  >
                    <div className="text-[10px] font-mono opacity-80">{roman}</div>
                    <div className="text-base font-bold mt-0.5">{formatNoteName(pc, notation)}</div>
                    <div className="text-[10px] opacity-80 truncate">
                      {scale.intervals.length === 7 ? `${DEGREE_NAMES_RO[idx].split(' ')[0]} · ${quality}` : quality}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Keyboard */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#53665f]">
              <span className="font-semibold text-[#13221d]">Notele gamei pe claviatură</span>
              <span>Verde: tonică · Cupru: treptele gamei</span>
            </div>
            <VirtualKeyboard
              startMidi={48}
              octaves={2}
              notation={notation}
              activeMidi={activeMidi}
              highlightedPitchClasses={scalePitchClasses}
              rootPitchClass={rootPc}
              onSelectMidi={(midi, freq) => {
                setActiveMidi(midi);
                audioEngine.playPluckedString(freq, { method: 'karplus' });
              }}
            />
          </div>
        </div>

        {/* Guitar Fretboard with Scale Overlay */}
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#13221d]">Notele gamei pe manșonul chitarei</h3>
              <p className="text-xs text-[#53665f]">
                Apasă orice poziție marcată pe corzi pentru a cânta nota în contextul gamei.
              </p>
            </div>
          </div>
          <AcousticGuitar2D
            strings={strings}
            notation={notation}
            highlightedPitchClasses={scalePitchClasses}
            rootPitchClass={rootPc}
            lastPluck={lastPluck}
            onPluckString={(sid, f, freq) => {
              const str = strings.find((s) => s.id === sid);
              if (str) setActiveMidi(str.openMidi + f);
              audioEngine.playPluckedString(freq, { method: 'karplus' });
              setLastPluck({ stringId: sid, fret: f, frequency: freq, timestamp: performance.now() });
            }}
          />
        </div>
      </div>
    </div>
  );
};
