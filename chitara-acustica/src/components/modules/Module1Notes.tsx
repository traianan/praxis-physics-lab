import React, { useEffect, useRef, useState } from 'react';
import { Play, Volume2 } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { NotationSystem, StringState } from '../../types/guitar';
import {
  formatMidiLabel,
  formatNoteName,
  frequencyToNote,
  getGuitarPositionsForPitchClass,
  midiToFrequency,
} from '../../utils/musicTheory';
import { VirtualKeyboard } from '../VirtualKeyboard';

type Module1NotesProps = {
  notation: NotationSystem;
  onChangeNotation: (n: NotationSystem) => void;
  strings: StringState[];
};

export const Module1Notes: React.FC<Module1NotesProps> = ({
  notation,
  onChangeNotation,
  strings,
}) => {
  const [frequency, setFrequency] = useState<number>(440);
  const [soundType, setSoundType] = useState<'sine' | 'guitar'>('sine');
  const [startMidi, setStartMidi] = useState<number>(48); // C3..C5
  const axisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const noteInfo = frequencyToNote(frequency);
  const pc = ((noteInfo.midi % 12) + 12) % 12;
  const noteDisplay = `${formatNoteName(pc, notation)}${noteInfo.octave}`;
  const semitonesFromA4 = noteInfo.midi - 69;
  const ratioToA4 = frequency / 440;

  const exactPositions = getGuitarPositionsForPitchClass(pc, strings, 15, noteInfo.midi);
  const allOctavePositions = getGuitarPositionsForPitchClass(pc, strings, 15);

  const playCurrent = (freqToPlay = frequency) => {
    if (soundType === 'sine') {
      audioEngine.playTone(freqToPlay, 1.3, 'sine', 0.42);
    } else {
      audioEngine.playPluckedString(freqToPlay, { method: 'karplus', duration: 2.4 });
    }
  };

  const handleSelectMidi = (midi: number, freq: number) => {
    const rounded = Number(freq.toFixed(2));
    setFrequency(rounded);
    playCurrent(rounded);
  };

  const stepFrequency = (deltaHz: number) => {
    const next = Math.max(65, Math.min(1046.5, Number((frequency + deltaHz).toFixed(2))));
    setFrequency(next);
  };

  // Draw logarithmic frequency axis (55 Hz - 1200 Hz)
  useEffect(() => {
    const canvas = axisCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(360, Math.floor(rect.width));
    const h = 132;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, w, h);

    const padL = 24;
    const padR = 24;
    const plotW = w - padL - padR;
    const minF = 55;
    const maxF = 1150;
    const fToX = (f: number) => padL + (Math.log2(f / minF) / Math.log2(maxF / minF)) * plotW;

    const axisY = 74;

    // Horizontal log axis line
    ctx.strokeStyle = '#9bb0a7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, axisY);
    ctx.lineTo(padL + plotW, axisY);
    ctx.stroke();

    // Draw MIDI semitone ticks (A1=33 to C6=84)
    for (let m = 33; m <= 85; m++) {
      const f = midiToFrequency(m);
      if (f < minF || f > maxF) continue;
      const x = fToX(f);
      const isA = m % 12 === 9;
      const isC = m % 12 === 0;

      ctx.strokeStyle = isA ? '#0d4a3e' : isC ? '#b85d2b' : '#cbd7d0';
      ctx.lineWidth = isA || isC ? 1.8 : 1;
      const tickH = isA ? 16 : isC ? 12 : 6;
      ctx.beginPath();
      ctx.moveTo(x, axisY - tickH);
      ctx.lineTo(x, axisY + tickH);
      ctx.stroke();

      if (isA || isC) {
        ctx.fillStyle = isA ? '#0d4a3e' : '#b85d2b';
        ctx.font = '600 10px "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(formatMidiLabel(m, notation), x, axisY + 30);
        ctx.fillStyle = '#6c7e77';
        ctx.font = '400 9.5px "Consolas", monospace';
        ctx.fillText(`${Math.round(f)}Hz`, x, axisY + 43);
      }
    }

    // Current frequency marker pin
    const clamped = Math.max(minF, Math.min(maxF, frequency));
    const curX = fToX(clamped);

    ctx.strokeStyle = '#b85d2b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(curX, 24);
    ctx.lineTo(curX, axisY);
    ctx.stroke();

    ctx.fillStyle = '#b85d2b';
    ctx.beginPath();
    ctx.arc(curX, axisY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Marker label pill
    const tag = `${noteDisplay} · ${frequency.toFixed(1)} Hz`;
    ctx.font = '600 11px "Consolas", monospace';
    const textW = ctx.measureText(tag).width + 16;
    const tagX = Math.max(padL, Math.min(w - padR - textW, curX - textW / 2));
    ctx.fillStyle = '#0d4a3e';
    ctx.beginPath();
    ctx.roundRect(tagX, 6, textW, 22, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, tagX + textW / 2, 17);

    ctx.restore();
  }, [frequency, notation, noteDisplay]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-[#13221d]">Modulul 1: Note și frecvențe</h2>
          <p className="text-xs text-[#53665f] mt-1">
            Explorează legătura logaritmică dintre înălțimea percepută a notei muzicale și frecvența în Hz.
          </p>
        </div>

        {/* Notation toggle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Sistem de notație</label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            <button
              type="button"
              onClick={() => onChangeNotation('anglo')}
              className={`py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                notation === 'anglo' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              Anglo-saxon (C, D, E)
            </button>
            <button
              type="button"
              onClick={() => onChangeNotation('solfege')}
              className={`py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                notation === 'solfege' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              Do–Re–Mi
            </button>
          </div>
        </div>

        {/* Frequency slider with -/+ buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Frecvență (Hz)</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">{frequency.toFixed(2)} Hz</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepFrequency(-1)}
              aria-label="Scade frecvența cu 1 Hz"
              className="w-8 h-8 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-sm font-semibold text-[#13221d] cursor-pointer shrink-0"
            >
              −
            </button>
            <input
              type="range"
              min={82.41}
              max={880}
              step={0.1}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="lab-slider w-full"
            />
            <button
              type="button"
              onClick={() => stepFrequency(1)}
              aria-label="Crește frecvența cu 1 Hz"
              className="w-8 h-8 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-sm font-semibold text-[#13221d] cursor-pointer shrink-0"
            >
              +
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#53665f] font-mono tabular-nums">
            <span>82,4 Hz (E2)</span>
            <span>880 Hz (A5)</span>
          </div>
        </div>

        {/* Sound type + play button */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#13221d]">Tip de sunet</label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            <button
              type="button"
              onClick={() => setSoundType('sine')}
              className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                soundType === 'sine' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              Undă sinusoidală
            </button>
            <button
              type="button"
              onClick={() => setSoundType('guitar')}
              className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                soundType === 'guitar' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              Chitară ciupită
            </button>
          </div>

          <button
            type="button"
            data-sound="none"
            data-guitar-quick-action="note"
            onClick={() => playCurrent()}
            className="w-full py-2.5 px-4 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Redă nota ({noteDisplay})</span>
          </button>
        </div>

        {/* Quick presets */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-[#13221d]">Repere rapide</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'E2 · 82,4 Hz', f: 82.41 },
              { label: 'A2 · 110 Hz', f: 110 },
              { label: 'C4 · 261,6 Hz', f: 261.63 },
              { label: 'A4 · 440 Hz', f: 440 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setFrequency(preset.f);
                  playCurrent(preset.f);
                }}
                className="py-1.5 px-2.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-mono text-[#13221d] transition-colors cursor-pointer text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formula box */}
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-[#0d4a3e]">Formula temperamentului egal</div>
          <div className="font-mono text-sm font-semibold text-[#13221d]">
            fₙ = 440 · 2^(n / 12)
          </div>
          <p className="text-xs text-[#53665f] leading-relaxed">
            Fiecare octavă dublează frecvența (×2), iar cele 12 semitonoane egale au raportul 2^(1/12) ≈ 1,05946.
          </p>
        </div>
      </div>

      {/* Right Main Workspace */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#13221d]">Identificarea notei și scara logaritmică</h3>
              <p className="text-xs text-[#53665f]">
                Apasă o clapă pe tastatura virtuală sau ajustează frecvența pentru a vedea nota și poziția pe chitară.
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
              <button
                type="button"
                onClick={() => setStartMidi(48)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                  startMidi === 48 ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
                }`}
              >
                Octavele C3–C5
              </button>
              <button
                type="button"
                onClick={() => setStartMidi(60)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                  startMidi === 60 ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
                }`}
              >
                Octavele C4–C6
              </button>
            </div>
          </div>

          {/* 4-KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">NOTĂ & OCTAVĂ</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 tabular-nums">
                {noteDisplay}
                <span className="text-xs font-mono font-normal text-[#53665f] ml-1.5">
                  ({noteInfo.cents >= 0 ? '+' : ''}{noteInfo.cents.toFixed(0)} sutimi)
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {frequency.toFixed(2)} Hz
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">RAPORT FAȚĂ DE A4</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {ratioToA4.toFixed(4)}×
                <span className="text-xs font-normal text-[#53665f] ml-1">
                  ({semitonesFromA4 >= 0 ? '+' : ''}{semitonesFromA4} st)
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">POZIȚII EXACTE CHITARĂ</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {exactPositions.length} {exactPositions.length === 1 ? 'poziție' : 'poziții'}
              </div>
            </div>
          </div>

          {/* 2-octave Virtual Keyboard */}
          <VirtualKeyboard
            startMidi={startMidi}
            octaves={2}
            notation={notation}
            activeMidi={noteInfo.midi}
            onSelectMidi={handleSelectMidi}
          />

          {/* Logarithmic frequency axis */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#53665f]">
              <span className="font-semibold text-[#13221d]">Axă logaritmică de frecvență</span>
              <span>Observă cum octavele (A1, A2, A3, A4, A5) apar la distanțe egale</span>
            </div>
            <div className="rounded-xl border border-[#d8e2dc] overflow-hidden">
              <canvas ref={axisCanvasRef} className="w-full block" style={{ height: 132 }} />
            </div>
          </div>
        </div>

        {/* Guitar positions card */}
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-[#13221d]">
                Unde se găsește nota {noteDisplay} pe manșonul chitarei (freturi 0–15)
              </h4>
              <p className="text-xs text-[#53665f]">
                Apasă orice poziție de mai jos pentru a asculta nota sintetizată pe chitară.
              </p>
            </div>
          </div>

          {exactPositions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {exactPositions.map((pos) => (
                <button
                  key={`${pos.stringId}-${pos.fret}`}
                  type="button"
                  data-sound="none"
                  onClick={() => audioEngine.playPluckedString(pos.frequency, { method: 'karplus' })}
                  className="px-3 py-2 rounded-lg border border-[#d8e2dc] bg-[#edf3f0] hover:bg-[#dce8e2] text-xs font-mono text-[#13221d] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#0d4a3e]" />
                  <span>
                    Coarda {pos.stringId} · Fret {pos.fret === 0 ? '0 (liberă)' : pos.fret}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#53665f]">
              Această octavă ({noteDisplay}) se află în afara registrului standard 0–15 al chitarei; octavele echivalente pe manșon sunt:
            </p>
          )}

          {allOctavePositions.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1.5 text-xs text-[#53665f]">
              <span className="font-medium text-[#13221d]">Toate octavele notei {formatNoteName(pc, notation)}:</span>
              {allOctavePositions.slice(0, 10).map((pos) => (
                <span key={`oct-${pos.stringId}-${pos.fret}`} className="font-mono">
                  C{pos.stringId}:F{pos.fret} ({formatMidiLabel(pos.midi, notation)})
                  <span className="mx-1 text-[#cbd7d0]">·</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

