import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { MissionId, NotationSystem, StringState } from '../../types/guitar';
import {
  formatNoteName,
  frequencyToNote,
  getEffectiveFretLength,
  stringFundamentalFrequency,
} from '../../utils/musicTheory';
import { AcousticGuitar2D, StringPluckEvent } from '../AcousticGuitar2D';
import { formatScientificIndices } from '../ScientificNotation';

type Module2StringProps = {
  strings: StringState[];
  notation: NotationSystem;
  onCompleteMission?: (id: MissionId) => void;
};

export const Module2String: React.FC<Module2StringProps> = ({
  strings,
  notation,
  onCompleteMission,
}) => {
  const [selectedStringId, setSelectedStringId] = useState<number>(6);
  const activeSpec = strings.find((s) => s.id === selectedStringId) ?? strings[5];

  const [lengthM, setLengthM] = useState<number>(activeSpec.length);
  const [tensionN, setTensionN] = useState<number>(activeSpec.tension);
  const [densityGPerM, setDensityGPerM] = useState<number>(Number((activeSpec.linearDensity * 1000).toFixed(2)));
  const [fret, setFret] = useState<number>(0);
  const [lastPluck, setLastPluck] = useState<StringPluckEvent | null>(null);

  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPluckTimeRef = useRef<number>(0);

  // Sync physical defaults when user switches string
  const handleSelectString = (sid: number, newFret = 0) => {
    const spec = strings.find((s) => s.id === sid);
    if (!spec) return;
    setSelectedStringId(sid);
    setLengthM(spec.length);
    setTensionN(spec.tension);
    setDensityGPerM(Number((spec.linearDensity * 1000).toFixed(2)));
    setFret(newFret);
  };

  const resetStringPhysics = () => {
    setLengthM(activeSpec.length);
    setTensionN(activeSpec.tension);
    setDensityGPerM(Number((activeSpec.linearDensity * 1000).toFixed(2)));
    setFret(0);
  };

  const effectiveLength = getEffectiveFretLength(lengthM, fret);
  const muKgPerM = densityGPerM / 1000;
  const f1 = stringFundamentalFrequency(effectiveLength, tensionN, muKgPerM);
  const waveSpeed = Math.sqrt(tensionN / muKgPerM);
  const note = frequencyToNote(f1);
  const pc = ((note.midi % 12) + 12) % 12;
  const noteLabel = `${formatNoteName(pc, notation)}${note.octave}`;

  const pluckCurrent = (overrideSid?: number, overrideFret?: number) => {
    const sid = overrideSid ?? selectedStringId;
    const fNum = overrideFret ?? fret;
    const spec = strings.find((s) => s.id === sid) ?? activeSpec;
    const L = overrideSid && overrideSid !== selectedStringId ? spec.length : lengthM;
    const T = overrideSid && overrideSid !== selectedStringId ? spec.tension : tensionN;
    const mu = overrideSid && overrideSid !== selectedStringId ? spec.linearDensity : muKgPerM;
    const Leff = getEffectiveFretLength(L, fNum);
    const freq = stringFundamentalFrequency(Leff, T, mu);

    audioEngine.playPluckedString(freq, { method: 'karplus', duration: 2.8 });
    const ts = performance.now();
    lastPluckTimeRef.current = ts;
    setLastPluck({ stringId: sid, fret: fNum, frequency: freq, timestamp: ts });

    // Check missions
    if (sid === 1 && fNum === 5 && Math.abs(freq - 440) < 6) {
      onCompleteMission?.('m1_a4_string1');
    }
    if (sid === 6 && fNum === 5 && Math.abs(freq - 110) < 3) {
      onCompleteMission?.('m2_a2_string6');
    }
  };

  // Standing wave physics canvas
  useEffect(() => {
    let rafId = 0;
    const drawWave = () => {
      const canvas = waveCanvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(360, Math.floor(rect.width));
      const h = 156;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#fcfdfc';
      ctx.fillRect(0, 0, w, h);

      const padX = 40;
      const maxSpanW = w - padX * 2;
      // Visual proportional span for L (0.35..0.90m)
      const totalSpanPx = Math.min(maxSpanW, (lengthM / 0.85) * maxSpanW);
      const nutX = padX;
      const bridgeX = padX + totalSpanPx;
      const effectiveFrac = effectiveLength / lengthM;
      const activeStartX = bridgeX - totalSpanPx * effectiveFrac;
      const cy = h / 2;

      // Equilibrium line
      ctx.strokeStyle = '#dce6e1';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(nutX, cy);
      ctx.lineTo(bridgeX, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fixed endpoints
      ctx.fillStyle = '#53665f';
      ctx.fillRect(nutX - 3, cy - 28, 6, 56);
      ctx.fillRect(bridgeX - 3, cy - 28, 6, 56);

      // Inactive portion (nut -> fret)
      if (fret > 0) {
        ctx.strokeStyle = '#9aaea5';
        ctx.lineWidth = Math.max(1.5, activeSpec.gaugeMm * 2.8);
        ctx.beginPath();
        ctx.moveTo(nutX, cy);
        ctx.lineTo(activeStartX, cy);
        ctx.stroke();

        // Finger press marker
        ctx.fillStyle = '#0d4a3e';
        ctx.beginPath();
        ctx.arc(activeStartX, cy, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vibrating envelope + instantaneous wave
      const now = performance.now();
      const elapsed = (now - lastPluckTimeRef.current) / 1000;
      const decayAmp = lastPluckTimeRef.current > 0 && elapsed < 3.0 ? Math.exp(-elapsed * 1.4) : 0.35;
      const ampPx = 36 * decayAmp;
      const phase = Math.sin(now * 0.015 * Math.min(4, f1 / 110));

      // Envelope dashed curve
      ctx.strokeStyle = 'rgba(184, 93, 43, 0.30)';
      ctx.lineWidth = 1.2;
      [1, -1].forEach((sign) => {
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const u = i / 80;
          const x = activeStartX + u * (bridgeX - activeStartX);
          const y = cy + sign * ampPx * Math.sin(Math.PI * u);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Active vibrating string
      ctx.strokeStyle = '#b85d2b';
      ctx.lineWidth = Math.max(2, activeSpec.gaugeMm * 3);
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        const x = activeStartX + u * (bridgeX - activeStartX);
        const y = cy + ampPx * phase * Math.sin(Math.PI * u);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#53665f';
      ctx.font = '500 11px "Consolas", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Prăguș', nutX - 4, 18);
      ctx.textAlign = 'right';
      ctx.fillText('Căluș', bridgeX + 4, 18);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0d4a3e';
      ctx.fillText(
        `L efectivă = ${(effectiveLength * 100).toFixed(1)} cm · Ventru central (modul 1)`,
        (activeStartX + bridgeX) / 2,
        h - 12
      );

      ctx.restore();
      rafId = requestAnimationFrame(drawWave);
    };

    rafId = requestAnimationFrame(drawWave);
    return () => cancelAnimationFrame(rafId);
  }, [lengthM, effectiveLength, fret, f1, activeSpec.gaugeMm]);

  const activeFretsMap: Record<number, number> = {
    [selectedStringId]: fret,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#13221d]">Modulul 2: Coarda chitarei</h2>
            <p className="text-xs text-[#53665f] mt-1">
              Modifică lungimea, tensiunea și grosimea corzii sau apasă un fret pentru a vedea efectul fizic asupra frecvenței.
            </p>
          </div>
          <button
            type="button"
            onClick={resetStringPhysics}
            title="Resetează parametrii corzii"
            className="p-2 rounded-lg border border-[#d8e2dc] hover:bg-[#edf3f0] text-[#53665f] hover:text-[#13221d] cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* String selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Selectează coarda (1 = subțire, 6 = groasă)</label>
          <div className="grid grid-cols-6 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {strings.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectString(s.id, 0)}
                className={`py-1.5 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  selectedStringId === s.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                C{s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Fret slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Fret apăsat</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">
              {fret === 0 ? '0 (coardă liberă)' : `Fret ${fret}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFret((f) => Math.max(0, f - 1))}
              className="w-8 h-8 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-sm font-semibold cursor-pointer shrink-0"
            >
              −
            </button>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={fret}
              onChange={(e) => setFret(Number(e.target.value))}
              className="lab-slider w-full"
            />
            <button
              type="button"
              onClick={() => setFret((f) => Math.min(15, f + 1))}
              className="w-8 h-8 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-sm font-semibold cursor-pointer shrink-0"
            >
              +
            </button>
          </div>
        </div>

        {/* Length L */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Lungimea corzii L</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">{lengthM.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min={0.4}
            max={0.85}
            step={0.01}
            value={lengthM}
            onChange={(e) => setLengthM(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        {/* Tension T */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Tensiunea T (cheița de acordaj)</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">{tensionN.toFixed(1)} N</span>
          </div>
          <input
            type="range"
            min={35}
            max={160}
            step={0.5}
            value={tensionN}
            onChange={(e) => setTensionN(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        {/* Linear Density mu */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Densitate lineică μ (grosime)</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">{densityGPerM.toFixed(2)} g/m</span>
          </div>
          <input
            type="range"
            min={0.35}
            max={10.5}
            step={0.05}
            value={densityGPerM}
            onChange={(e) => setDensityGPerM(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        <button
          type="button"
          data-guitar-quick-action="string"
          onClick={() => pluckCurrent()}
          className="w-full py-2.5 px-4 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Ciupește coarda ({noteLabel})</span>
        </button>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-[#0d4a3e]">Ecuația corzii fixate la capete</div>
          <div className="font-mono text-sm font-semibold text-[#13221d]">
            {formatScientificIndices('f₁ = 1 / (2L_ef) · √(T / μ)')}
          </div>
          <ul className="text-xs text-[#53665f] space-y-1 pt-1 list-disc list-inside">
            <li>Coardă mai scurtă (L ↓) → sunet mai înalt (f ↑)</li>
            <li>Tensiune mai mare (T ↑) → sunet mai înalt (f ↑)</li>
            <li>Coardă mai groasă (μ ↑) → sunet mai grav (f ↓)</li>
          </ul>
        </div>
      </div>

      {/* Right Stage */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[#13221d]">Chitara acustică 2D și parametrii fizici</h3>
            <p className="text-xs text-[#53665f]">
              Trage degetul pe manșon pentru a schimba fretul și ciupește coarda pentru a observa vibrația.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ f₁</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{f1.toFixed(2)} Hz</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">NOTĂ MUZICALĂ</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 tabular-nums">
                {noteLabel}
                <span className="text-xs font-mono font-normal text-[#53665f] ml-1.5">
                  ({note.cents >= 0 ? '+' : ''}{note.cents.toFixed(0)} sutimi)
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">LUNGIME EFECTIVĂ</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {(effectiveLength * 100).toFixed(1)} cm
              </div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">VITEZĂ UNDĂ √(T/μ)</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
                {waveSpeed.toFixed(1)} m/s
              </div>
            </div>
          </div>

          <AcousticGuitar2D
            strings={strings}
            notation={notation}
            selectedStringId={selectedStringId}
            activeFrets={activeFretsMap}
            lastPluck={lastPluck}
            onSelectFret={(sid, f) => {
              if (sid !== selectedStringId) {
                handleSelectString(sid, f);
              } else {
                setFret(f);
              }
            }}
            onPluckString={(sid, f) => {
              if (sid !== selectedStringId) {
                handleSelectString(sid, f);
              } else {
                setFret(f);
              }
              pluckCurrent(sid, f);
            }}
          />
        </div>

        {/* Standing wave close-up */}
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#13221d]">Undă staționară pe coarda {selectedStringId} (modul fundamental)</h4>
            <span className="text-xs font-mono text-[#53665f]">
              f₁ = 1 / (2 × {effectiveLength.toFixed(3)}) × √({tensionN.toFixed(1)} / {muKgPerM.toFixed(5)}) = {f1.toFixed(1)} Hz
            </span>
          </div>
          <div className="rounded-xl border border-[#d8e2dc] overflow-hidden">
            <canvas ref={waveCanvasRef} className="w-full block" style={{ height: 156 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

