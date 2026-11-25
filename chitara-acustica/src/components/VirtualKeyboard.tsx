import React from 'react';
import { NotationSystem } from '../types/guitar';
import { formatNoteName, midiToFrequency } from '../utils/musicTheory';

type VirtualKeyboardProps = {
  startMidi?: number; // e.g. 48 (C3)
  octaves?: number; // e.g. 2
  notation: NotationSystem;
  activeMidi?: number | null;
  highlightedPitchClasses?: number[];
  rootPitchClass?: number | null;
  onSelectMidi: (midi: number, frequency: number) => void;
};

const BLACK_KEY_OFFSETS = [1, 3, 6, 8, 10];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  startMidi = 48,
  octaves = 2,
  notation,
  activeMidi = null,
  highlightedPitchClasses = [],
  rootPitchClass = null,
  onSelectMidi,
}) => {
  const totalSemitones = octaves * 12 + 1; // include top C
  const keys = Array.from({ length: totalSemitones }, (_, i) => {
    const midi = startMidi + i;
    const pc = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    const isBlack = BLACK_KEY_OFFSETS.includes(pc);
    const label = `${formatNoteName(pc, notation)}${octave}`;
    const shortLabel = formatNoteName(pc, notation);
    return {
      midi,
      pc,
      octave,
      isBlack,
      label,
      shortLabel,
      frequency: midiToFrequency(midi),
    };
  });

  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="relative min-w-[580px] h-40 select-none rounded-xl border border-[#d8e2dc] bg-[#edf3f0] p-2">
        {/* White keys */}
        <div className="flex h-full gap-1">
          {whiteKeys.map((k) => {
            const isActive = activeMidi === k.midi;
            const isHighlighted = highlightedPitchClasses.includes(k.pc);
            const isRoot = rootPitchClass === k.pc;

            let bg = 'bg-white hover:bg-[#f6f9f7] text-[#13221d]';
            if (isActive) {
              bg = 'bg-[#0d4a3e] text-white';
            } else if (isRoot) {
              bg = 'bg-[#d9ebe4] text-[#0d4a3e] ring-1 ring-inset ring-[#0d4a3e]';
            } else if (isHighlighted) {
              bg = 'bg-[#f8eae2] text-[#8a3e16] ring-1 ring-inset ring-[#b85d2b]';
            }

            return (
              <button
                key={k.midi}
                type="button"
                onClick={() => onSelectMidi(k.midi, k.frequency)}
                className={`relative flex-1 rounded-b-lg rounded-t-sm border border-[#cfdcd5] flex flex-col justify-end items-center pb-2 transition-colors cursor-pointer ${bg}`}
              >
                <span className="text-[11px] font-semibold leading-none">{k.shortLabel}</span>
                <span className={`text-[9px] font-mono mt-0.5 tabular-nums ${isActive ? 'text-white/80' : 'text-[#53665f]'}`}>
                  {k.octave}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black keys positioned accurately between white keys */}
        <div className="pointer-events-none absolute inset-x-2 top-2 bottom-2">
          {blackKeys.map((k) => {
            // Find index of the white key immediately to the left
            const leftWhiteIndex = whiteKeys.findIndex((wk) => wk.midi === k.midi - 1);
            if (leftWhiteIndex < 0) return null;
            const leftPercent = ((leftWhiteIndex + 0.68) / whiteKeys.length) * 100;
            const widthPercent = (0.62 / whiteKeys.length) * 100;

            const isActive = activeMidi === k.midi;
            const isHighlighted = highlightedPitchClasses.includes(k.pc);
            const isRoot = rootPitchClass === k.pc;

            let bg = 'bg-[#1c2b26] hover:bg-[#2a3f38] text-white border-[#111c18]';
            if (isActive) {
              bg = 'bg-[#b85d2b] text-white border-[#8f441c]';
            } else if (isRoot) {
              bg = 'bg-[#0d4a3e] text-white border-[#09382f]';
            } else if (isHighlighted) {
              bg = 'bg-[#7d3b18] text-white border-[#5e2a0f]';
            }

            return (
              <button
                key={k.midi}
                type="button"
                onClick={() => onSelectMidi(k.midi, k.frequency)}
                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                className={`pointer-events-auto absolute top-0 h-[58%] rounded-b-md border flex flex-col justify-end items-center pb-1.5 shadow-sm transition-colors cursor-pointer ${bg}`}
              >
                <span className="text-[9px] font-semibold leading-none">{k.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
