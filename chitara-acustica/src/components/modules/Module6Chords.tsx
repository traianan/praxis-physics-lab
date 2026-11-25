import React, { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { ChordQualityId, MissionId, NotationSystem, StringState } from '../../types/guitar';
import {
  ANGLO_NAMES,
  CHORDS,
  formatMidiLabel,
  formatNoteName,
  getGuitarChordVoicing,
  midiToFrequency,
} from '../../utils/musicTheory';
import { AcousticGuitar2D } from '../AcousticGuitar2D';
import { FourierAnalyzerPanel } from '../FourierAnalyzerPanel';

type Module6ChordsProps = {
  strings: StringState[];
  notation: NotationSystem;
  onCompleteMission?: (id: MissionId) => void;
};

export const Module6Chords: React.FC<Module6ChordsProps> = ({
  strings,
  notation,
  onCompleteMission,
}) => {
  const [rootPc, setRootPc] = useState<number>(0); // C
  const [quality, setQuality] = useState<ChordQualityId>('major');
  const [pluckTimestamps, setPluckTimestamps] = useState<Record<number, number>>({});

  const chordDef = CHORDS[quality];
  const voicing = useMemo(() => getGuitarChordVoicing(rootPc, quality, strings), [rootPc, quality, strings]);

  const activeFretsMap = useMemo(() => {
    const map: Record<number, number | null> = {};
    voicing.forEach((v) => {
      map[v.stringId] = v.fret;
    });
    return map;
  }, [voicing]);

  const chordNotes = chordDef.intervals.map((semi, idx) => {
    const pc = (rootPc + semi) % 12;
    const midi = 48 + rootPc + semi;
    return {
      pc,
      label: formatNoteName(pc, notation),
      intervalName: chordDef.intervalNames[idx] ?? `+${semi} st`,
      frequency: midiToFrequency(midi),
    };
  });

  const playableStrings = voicing
    .filter((v) => v.fret !== null)
    .slice()
    .reverse(); // bass string 6 -> treble string 1

  const chordSymbol = `${formatNoteName(rootPc, notation)}${chordDef.symbol}`;
  const bassFreq = playableStrings[0] ? midiToFrequency(playableStrings[0].midi) : chordNotes[0].frequency;

  const playChord = (arpeggioMs: number) => {
    const freqs = playableStrings.map((v) => midiToFrequency(v.midi));
    audioEngine.playChord(freqs, arpeggioMs, { method: 'karplus', duration: 3.1 });

    const now = performance.now();
    const map: Record<number, number> = {};
    playableStrings.forEach((v, idx) => {
      map[v.stringId] = now + idx * arpeggioMs;
    });
    setPluckTimestamps(map);

    if (rootPc === 0 && quality === 'major') {
      onCompleteMission?.('m3_c_major');
    }
  };

  // Compute chord box diagram window
  const frettedNumbers = voicing.map((v) => v.fret).filter((f): f is number => f !== null && f > 0);
  const minFret = frettedNumbers.length > 0 ? Math.min(...frettedNumbers) : 1;
  const maxFret = frettedNumbers.length > 0 ? Math.max(...frettedNumbers) : 4;
  const startFret = maxFret <= 4 ? 1 : minFret;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#13221d]">Modulul 6: Constructor de acorduri</h2>
          <p className="text-xs text-[#53665f] mt-1">
            Alege nota fundamentală și tipul acordului pentru a vedea intervalele, poziția pe chitară și spectrul sumei sunetelor.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Fundamentală</label>
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

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Tip de acord</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(CHORDS) as ChordQualityId[]).map((q) => {
              const c = CHORDS[q];
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`px-2.5 py-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    quality === q
                      ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                      : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                  }`}
                >
                  <div className="font-semibold truncate">{c.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => playChord(45)}
            className="py-2.5 px-3 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Arpegiat</span>
          </button>
          <button
            type="button"
            onClick={() => playChord(8)}
            className="py-2.5 px-3 rounded-lg border border-[#0d4a3e] bg-[#edf3f0] hover:bg-[#dce8e2] text-[#0d4a3e] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simultan</span>
          </button>
        </div>

        {/* Component intervals breakdown */}
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3.5 space-y-2">
          <div className="text-xs font-semibold text-[#0d4a3e]">Structura acordului {chordSymbol}</div>
          <div className="space-y-1.5">
            {chordNotes.map((cn) => (
              <div key={cn.intervalName} className="flex items-center justify-between text-xs">
                <span className="text-[#13221d] font-medium">{cn.intervalName}</span>
                <span className="font-mono text-[#0d4a3e] font-semibold">
                  {cn.label} ({cn.frequency.toFixed(1)} Hz)
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#53665f] pt-1 border-t border-[#d8e2dc]">{chordDef.consonanceNote}</p>
        </div>
      </div>

      {/* Right Stage */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">ACORD SELECTAT</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5">{chordSymbol}</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">NOTE COMPONENTE</div>
              <div className="text-base font-bold text-[#13221d] mt-0.5 truncate">
                {chordNotes.map((n) => n.label).join(' – ')}
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">CORZI SUNATE</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {playableStrings.length} / 6
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ BAS</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {bassFreq.toFixed(1)} Hz
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[190px_1fr] gap-4 items-center">
            {/* Compact vertical SVG Chord Diagram */}
            <div className="rounded-xl border border-[#d8e2dc] bg-[#fafcfa] p-3 flex flex-col items-center">
              <div className="text-xs font-semibold text-[#13221d] mb-1">Diagramă acord {chordSymbol}</div>
              <svg width="150" height="175" viewBox="0 0 150 175" className="select-none">
                {/* Nut or start fret */}
                {startFret === 1 ? (
                  <rect x="25" y="28" width="100" height="5" fill="#13221d" rx="1" />
                ) : (
                  <text x="12" y="45" fontSize="11" fontFamily="Consolas" fill="#53665f" fontWeight="600">
                    {startFret}fr
                  </text>
                )}

                {/* 5 horizontal fret lines */}
                {[0, 1, 2, 3, 4].map((row) => (
                  <line
                    key={row}
                    x1="25"
                    y1={30 + row * 28}
                    x2="125"
                    y2={30 + row * 28}
                    stroke="#cbd7d0"
                    strokeWidth="1.5"
                  />
                ))}

                {/* 6 vertical string lines (string 6 on left -> string 1 on right) */}
                {voicing
                  .slice()
                  .reverse()
                  .map((v, colIdx) => {
                    const x = 25 + colIdx * 20;
                    const isMuted = v.fret === null;
                    const isOpen = v.fret === 0;
                    return (
                      <g key={v.stringId}>
                        <line x1={x} y1="30" x2={x} y2="142" stroke="#6c7e77" strokeWidth={1.8 - colIdx * 0.15} />
                        {isMuted && (
                          <text x={x} y="19" textAnchor="middle" fontSize="12" fontWeight="700" fill="#b85d2b">
                            ×
                          </text>
                        )}
                        {isOpen && (
                          <circle cx={x} cy="15" r="4.5" fill="none" stroke="#0d4a3e" strokeWidth="1.8" />
                        )}
                        {v.fret !== null && v.fret > 0 && (
                          <circle
                            cx={x}
                            cy={30 + (v.fret - startFret + 0.5) * 28}
                            r="7.5"
                            fill="#0d4a3e"
                          />
                        )}
                        <text x={x} y="162" textAnchor="middle" fontSize="9.5" fontFamily="Consolas" fill="#53665f">
                          {v.fret === null ? '—' : formatMidiLabel(v.midi, notation).replace(/\d+$/, '')}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>

            {/* Interactive 2D Guitar showing the chord */}
            <AcousticGuitar2D
              strings={strings}
              notation={notation}
              activeFrets={activeFretsMap}
              pluckTimestampMap={pluckTimestamps}
              compact
              onPluckString={(sid, f, freq) => {
                audioEngine.playPluckedString(freq, { method: 'karplus' });
                setPluckTimestamps((prev) => ({ ...prev, [sid]: performance.now() }));
              }}
              onStrumAll={() => playChord(35)}
            />
          </div>
        </div>

        <FourierAnalyzerPanel
          notation={notation}
          expectedFundamental={bassFreq}
          title="Spectrul acordului"
          subtitle="Apasă „Arpegiat” sau „Simultan” pentru a observa suprapunerea armonicelor notelor din acord."
          compact
        />
      </div>
    </div>
  );
};

