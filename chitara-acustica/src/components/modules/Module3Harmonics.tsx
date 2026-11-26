import { LabStepper } from "../LabStepper";
import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { MissionId, NotationSystem } from '../../types/guitar';
import { HARMONIC_DESCRIPTIONS, harmonicAmplitudes } from '../../utils/musicTheory';
import { FourierAnalyzerPanel } from '../FourierAnalyzerPanel';

type Module3HarmonicsProps = {
  notation: NotationSystem;
  onCompleteMission?: (id: MissionId) => void;
};

export const Module3Harmonics: React.FC<Module3HarmonicsProps> = ({
  notation,
  onCompleteMission,
}) => {
  const [f0, setF0] = useState<number>(110); // A2
  const [amplitudes, setAmplitudes] = useState<number[]>([1.0, 0.55, 0.35, 0.22, 0.14, 0.09, 0.05, 0.03]);
  const [enabled, setEnabled] = useState<boolean[]>([true, true, true, true, true, true, false, false]);
  const [pickPos, setPickPos] = useState<number>(0.22);

  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const effectiveAmplitudes = amplitudes.map((a, idx) => (enabled[idx] ? a : 0));
  const activeCount = enabled.filter(Boolean).length;

  const applyPickPosition = (p: number) => {
    setPickPos(p);
    const nextAmps = harmonicAmplitudes(p, 8);
    setAmplitudes(nextAmps);
    setEnabled(nextAmps.map((val) => val > 0.01));
    if (Math.abs(p - 0.2) < 0.015) {
      onCompleteMission?.('m5_pick_fifth');
    }
  };

  const playHarmonicMix = () => {
    audioEngine.playHarmonicSeries(f0, effectiveAmplitudes, 2.8);

    // Check mission: only harmonic 3 active
    const only3 =
      !enabled[0] &&
      !enabled[1] &&
      enabled[2] &&
      amplitudes[2] > 0.05 &&
      !enabled[3] &&
      !enabled[4] &&
      !enabled[5] &&
      !enabled[6] &&
      !enabled[7];
    if (only3) {
      onCompleteMission?.('m4_harmonic_3');
    }
    if (Math.abs(pickPos - 0.2) < 0.015) {
      onCompleteMission?.('m5_pick_fifth');
    }
  };

  const presetOnlyThird = () => {
    setEnabled([false, false, true, false, false, false, false, false]);
    setAmplitudes((prev) => {
      const next = [...prev];
      next[2] = 0.85;
      return next;
    });
    audioEngine.playHarmonicSeries(f0, [0, 0, 0.85, 0, 0, 0, 0, 0], 2.5);
    onCompleteMission?.('m4_harmonic_3');
  };

  // Animated composite standing wave of the string
  useEffect(() => {
    let rafId = 0;
    const draw = (now: number) => {
      const canvas = compositeCanvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(360, Math.floor(rect.width));
      const h = 190;
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

      const padX = 28;
      const spanW = w - padX * 2;
      const cy = h / 2;
      const t = now * 0.004;

      // Equilibrium line
      ctx.strokeStyle = '#dce6e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, cy);
      ctx.lineTo(padX + spanW, cy);
      ctx.stroke();

      // Draw individual active modes lightly
      effectiveAmplitudes.forEach((amp, idx) => {
        if (amp <= 0.01) return;
        const n = idx + 1;
        ctx.strokeStyle = 'rgba(13, 74, 62, 0.22)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const u = i / 120;
          const x = padX + u * spanW;
          const y = cy - amp * 34 * Math.sin(n * Math.PI * u) * Math.cos(n * t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Draw composite string shape in copper #b85d2b
      const sumAmp = effectiveAmplitudes.reduce((a, b) => a + b, 0) || 1;
      const scale = 58 / Math.max(1, sumAmp * 0.65);

      ctx.strokeStyle = '#b85d2b';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const u = i / 160;
        const x = padX + u * spanW;
        let disp = 0;
        for (let idx = 0; idx < effectiveAmplitudes.length; idx++) {
          const amp = effectiveAmplitudes[idx];
          if (amp <= 0.001) continue;
          const n = idx + 1;
          disp += amp * Math.sin(n * Math.PI * u) * Math.cos(n * t);
        }
        const y = cy - disp * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Endpoints
      ctx.fillStyle = '#0d4a3e';
      ctx.beginPath();
      ctx.arc(padX, cy, 5, 0, Math.PI * 2);
      ctx.arc(padX + spanW, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // If single harmonic active, highlight its interior nodes
      const singleIdx = effectiveAmplitudes.findIndex((a) => a > 0.01);
      const activeIndices = effectiveAmplitudes.filter((a) => a > 0.01).length;
      if (activeIndices === 1 && singleIdx > 0) {
        const n = singleIdx + 1;
        for (let k = 1; k < n; k++) {
          const nx = padX + (k / n) * spanW;
          ctx.fillStyle = '#0d4a3e';
          ctx.beginPath();
          ctx.arc(nx, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [effectiveAmplitudes]);

  const maxAmp = Math.max(...effectiveAmplitudes, 0.01);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
      {/* Left Control Deck */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#13221d]">Modulul 3: Armonicele corzii</h2>
          <p className="text-xs text-[#53665f] mt-1">
            Activează sau ajustează primele 8 armonice (nf₀) pentru a vedea cum suma lor formează timbrul chitarei.
          </p>
        </div>

        {/* Fundamental selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#13221d]">Fundamentală f₀</label>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {[
              { label: 'E2 (82)', freq: 82.41 },
              { label: 'A2 (110)', freq: 110 },
              { label: 'D3 (147)', freq: 146.83 },
              { label: 'A3 (220)', freq: 220 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setF0(item.freq)}
                className={`py-1.5 px-1 rounded-md text-[11px] font-mono font-medium cursor-pointer ${
                  Math.abs(f0 - item.freq) < 0.5 ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pick position p */}
        <div className="space-y-2 rounded-lg bg-[#edf3f0] border border-[#dce6e1] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#13221d]">Poziție ciupire p (fracție din L)</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">p = {pickPos.toFixed(2)}</span>
          </div>
          <LabStepper
  min={0.05}
  max={0.5}
  step={0.01}
  value={pickPos}
  label="Poziție ciupire"
  onValueChange={(value) => applyPickPosition(Number(value))}
/>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPickPosition(0.2)}
              className="px-2 py-1 rounded bg-white border border-[#d8e2dc] text-[11px] font-medium text-[#13221d] hover:bg-[#fafcfa] cursor-pointer"
            >
              p = 0,20 (fret 5 · anulează n=5)
            </button>
            <button
              type="button"
              onClick={() => applyPickPosition(0.5)}
              className="px-2 py-1 rounded bg-white border border-[#d8e2dc] text-[11px] font-medium text-[#13221d] hover:bg-[#fafcfa] cursor-pointer"
            >
              p = 0,50 (mijloc · doar impare)
            </button>
          </div>
        </div>

        {/* Harmonic controls 1..8 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#13221d]">Amplitudini armonice (n = 1…8)</span>
            <button
              type="button"
              onClick={presetOnlyThird}
              className="text-[11px] font-medium text-[#b85d2b] hover:underline cursor-pointer"
            >
              Izolează n=3
            </button>
          </div>

          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {HARMONIC_DESCRIPTIONS.map((h, idx) => (
              <div key={h.n} className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled[idx]}
                      onChange={(e) => {
                        const next = [...enabled];
                        next[idx] = e.target.checked;
                        setEnabled(next);
                      }}
                      className="accent-[#0d4a3e] w-3.5 h-3.5 rounded"
                    />
                    <span className="font-mono font-semibold text-[#13221d]">
                      n={h.n} ({Math.round(f0 * h.n)} Hz)
                    </span>
                  </label>
                  <span className="text-[11px] text-[#53665f] truncate">{h.interval}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LabStepper
  min={0}
  max={1}
  step={0.02}
  value={amplitudes[idx]}
  disabled={!enabled[idx]}
  label={`Amplitudine armonică n=${h.n}`}
  onValueChange={(value) => {
                      const next = [...amplitudes];
                      next[idx] = Number(value);
                      setAmplitudes(next);
                    }}
/>
                  <span className="w-10 text-right text-[11px] font-mono tabular-nums text-[#53665f]">
                    {enabled[idx] ? amplitudes[idx].toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          data-guitar-quick-action="harmonics"
          onClick={playHarmonicMix}
          className="w-full py-2.5 px-4 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Ascultă sunetul compus</span>
        </button>
      </div>

      {/* Right Stage */}
      <div className="space-y-5">
        {/* Composite wave + Harmonic fingerprint */}
        <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FUNDAMENTALĂ f₀</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{f0.toFixed(1)} Hz</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">ARMONICE ACTIVE</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{activeCount} / 8</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">POZIȚIE CIUPIRE p</div>
              <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{pickPos.toFixed(2)} L</div>
            </div>
            <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-[#53665f]">FORMULA AMPLITUDINII</div>
              <div className="text-sm font-bold text-[#13221d] mt-1 font-mono">|sin(nπp)| / n²</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#13221d]">Forma compusă a corzii vibrante</span>
              <span className="text-[#53665f]">Verde pal: moduri individuale · Cupru: forma rezultantă</span>
            </div>
            <div className="rounded-xl border border-[#d8e2dc] overflow-hidden">
              <canvas ref={compositeCanvasRef} className="w-full block" style={{ height: 190 }} />
            </div>
          </div>

          {/* Harmonic fingerprint matching the copper bar chart in screenshot */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <div>
                <h4 className="font-semibold text-[#13221d]">Amprenta armonică (contribuția fiecărei armonice k·f₀)</h4>
              </div>
              <span className="text-[#53665f]">amplitudine relativă</span>
            </div>

            <div className="grid grid-cols-8 gap-2 sm:gap-3 items-end h-36 pt-6 px-3 pb-2 rounded-xl border border-[#e3ebe6] bg-[#fcfdfc]">
              {effectiveAmplitudes.map((amp, idx) => {
                const pct = Math.round((amp / maxAmp) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end">
                    <span className="text-[10px] font-mono text-[#13221d] tabular-nums mb-1">
                      {amp.toFixed(2)}
                    </span>
                    <div className="w-full max-w-[38px] bg-[#edf3f0] rounded-t-md h-20 flex items-end overflow-hidden">
                      <div
                        className="w-full rounded-t-md transition-all duration-150"
                        style={{
                          height: `${Math.max(2, pct)}%`,
                          backgroundColor: amp > 0.01 ? '#b85d2b' : '#d8e2dc',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-[#13221d] mt-1.5">k={idx + 1}</span>
                    <span className="text-[9.5px] font-mono text-[#53665f] tabular-nums">
                      {Math.round(f0 * (idx + 1))} Hz
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live FFT Analyzer */}
        <FourierAnalyzerPanel
          notation={notation}
          expectedFundamental={f0}
          title="Spectrul Fourier al armonicelor generate"
          subtitle="Apasă „Ascultă sunetul compus” și observă vârfurile la f₀, 2f₀, 3f₀…"
          compact
        />
      </div>
    </div>
  );
};
