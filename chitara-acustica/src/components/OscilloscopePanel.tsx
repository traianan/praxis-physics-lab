import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { SandboxSoundSource } from '../types/guitar';

type OscilloscopePanelProps = {
  expectedFrequency?: number | null;
  soundSource?: SandboxSoundSource;
  onChangeSoundSource?: (source: SandboxSoundSource) => void;
  onPlaySourceSample?: (source: SandboxSoundSource) => void;
};

const SOURCE_OPTIONS: Array<{ id: SandboxSoundSource; label: string; hint: string }> = [
  { id: 'guitar', label: 'Chitară acustică', hint: 'Karplus–Strong · armonice cu decaiere naturală' },
  { id: 'sine', label: 'Sinusoidal', hint: 'Undă pură · doar fundamentala f₀' },
  { id: 'triangle', label: 'Triunghiular', hint: 'Doar armonice impare (1/n²)' },
  { id: 'sawtooth', label: 'Dinte de fierăstrău', hint: 'Toate armonicele (1/n) · timbru bogat' },
];

export const OscilloscopePanel: React.FC<OscilloscopePanelProps> = ({
  expectedFrequency = null,
  soundSource,
  onChangeSoundSource,
  onPlaySourceSample,
}) => {
  const [timeWindowMs, setTimeWindowMs] = useState<number>(25);
  const [gainScale, setGainScale] = useState<number>(1.5);
  const [triggerEnabled, setTriggerEnabled] = useState<boolean>(true);
  const [paused, setPaused] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    peak: number;
    rms: number;
    periodMs: number | null;
    active: boolean;
  }>({
    peak: 0,
    rms: 0,
    periodMs: null,
    active: false,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frozenBufferRef = useRef<Float32Array | null>(null);
  const lastStatsUpdateRef = useRef<number>(0);

  useEffect(() => {
    let rafId = 0;

    const draw = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(340, Math.floor(rect.width));
      const h = 210;

      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const sampleRate = audioEngine.getSampleRate();
      const liveTime = audioEngine.getTimeDomainData();

      if (!paused && liveTime) {
        frozenBufferRef.current = new Float32Array(liveTime);
      }

      const samples = paused ? frozenBufferRef.current : liveTime;

      ctx.save();
      ctx.scale(dpr, dpr);

      const padL = 42;
      const padR = 14;
      const padT = 16;
      const padB = 26;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cy = padT + plotH / 2;

      // Crisp off-white scientific background
      ctx.fillStyle = '#fcfdfc';
      ctx.fillRect(0, 0, w, h);

      // Grid lines (8 vertical time divisions, 4 horizontal amplitude divisions)
      ctx.strokeStyle = '#e5ede8';
      ctx.lineWidth = 1;

      const timeDivs = 8;
      for (let i = 0; i <= timeDivs; i++) {
        const x = padL + (i / timeDivs) * plotW;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();

        const msVal = (i / timeDivs) * timeWindowMs;
        ctx.fillStyle = '#6c7e77';
        ctx.font = '500 10px "Consolas", monospace';
        ctx.textAlign = i === 0 ? 'left' : i === timeDivs ? 'right' : 'center';
        ctx.fillText(`${msVal.toFixed(msVal % 1 === 0 ? 0 : 1)}ms`, x, padT + plotH + 15);
      }

      [-1, -0.5, 0, 0.5, 1].forEach((level) => {
        const y = cy - level * (plotH * 0.45);
        ctx.strokeStyle = level === 0 ? '#b7c7bf' : '#e5ede8';
        ctx.lineWidth = level === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();

        const displayAmp = level / gainScale;
        ctx.fillStyle = '#6c7e77';
        ctx.font = '500 10px "Consolas", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayAmp.toFixed(2), padL - 6, y);
      });

      // Draw raw audio waveform
      if (samples && samples.length > 0) {
        const requestedSamples = Math.min(
          samples.length,
          Math.max(64, Math.floor((timeWindowMs / 1000) * sampleRate))
        );

        let triggerIdx = 0;
        if (triggerEnabled) {
          const searchLimit = Math.max(1, samples.length - requestedSamples);
          for (let i = 1; i < searchLimit; i++) {
            if (samples[i - 1] < 0 && samples[i] >= 0 && samples[i + 1] > samples[i]) {
              triggerIdx = i;
              break;
            }
          }
        }

        const available = Math.min(requestedSamples, samples.length - triggerIdx);

        // Compute peak & RMS + estimate period from zero-crossings
        let peak = 0;
        let sumSq = 0;
        const crossings: number[] = [];
        for (let i = 0; i < available; i++) {
          const v = samples[triggerIdx + i];
          const abs = Math.abs(v);
          if (abs > peak) peak = abs;
          sumSq += v * v;
          if (i > 0 && samples[triggerIdx + i - 1] < 0 && v >= 0) {
            crossings.push(i);
          }
        }
        const rms = Math.sqrt(sumSq / Math.max(1, available));

        let measuredPeriodMs: number | null = null;
        if (crossings.length >= 2 && peak > 0.015) {
          const diffs: number[] = [];
          for (let k = 1; k < crossings.length; k++) {
            diffs.push(crossings[k] - crossings[k - 1]);
          }
          const avgSamples = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          measuredPeriodMs = (avgSamples / sampleRate) * 1000;
        }

        if (now - lastStatsUpdateRef.current > 90) {
          lastStatsUpdateRef.current = now;
          setStats({
            peak,
            rms,
            periodMs: measuredPeriodMs,
            active: peak > 0.008,
          });
        }

        // Draw waveform path clipped to plot rectangle
        ctx.save();
        ctx.beginPath();
        ctx.rect(padL, padT, plotW, plotH);
        ctx.clip();

        ctx.beginPath();
        for (let i = 0; i < available; i++) {
          const x = padL + (i / Math.max(1, available - 1)) * plotW;
          const v = samples[triggerIdx + i] * gainScale;
          const clampedV = Math.max(-1.05, Math.min(1.05, v));
          const y = cy - clampedV * (plotH * 0.45);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#0d4a3e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Trigger marker
        if (triggerEnabled) {
          ctx.fillStyle = '#b85d2b';
          ctx.beginPath();
          ctx.arc(padL, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      } else if (now - lastStatsUpdateRef.current > 200) {
        lastStatsUpdateRef.current = now;
        setStats({ peak: 0, rms: 0, periodMs: null, active: false });
      }

      // Frame border
      ctx.strokeStyle = '#d8e2dc';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [timeWindowMs, gainScale, triggerEnabled, paused]);

  const theoreticalPeriodMs = expectedFrequency && expectedFrequency > 0 ? 1000 / expectedFrequency : null;

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">Osciloscop în timp real — unda sonoră brută</h3>
          <p className="text-xs text-[#53665f] mt-0.5">
            Vizualizează variația instantanee a presiunii acustice generate de corzile chitarei (domeniul timp).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {[10, 25, 50, 80].map((ms) => (
              <button
                key={ms}
                type="button"
                onClick={() => setTimeWindowMs(ms)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  timeWindowMs === ms
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {ms} ms
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {[1, 1.5, 3].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGainScale(g)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  gainScale === g
                    ? 'bg-[#b85d2b] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {g}×
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTriggerEnabled((t) => !t)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              triggerEnabled
                ? 'border-[#0d4a3e]/40 bg-[#edf3f0] text-[#0d4a3e]'
                : 'border-[#d8e2dc] bg-[#fafcfa] text-[#53665f]'
            }`}
          >
            {triggerEnabled ? 'Trigger: Front crescător' : 'Trigger: Liber'}
          </button>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              paused
                ? 'bg-[#b85d2b] text-white border-[#b85d2b]'
                : 'bg-[#0d4a3e] text-white border-[#0d4a3e] hover:bg-[#09382f]'
            }`}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{paused ? 'Reia live' : 'Îngheață'}</span>
          </button>
        </div>
      </div>

      {soundSource && onChangeSoundSource && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="flex flex-wrap items-center gap-1">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChangeSoundSource(opt.id);
                  onPlaySourceSample?.(opt.id);
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  soundSource === opt.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d] bg-white/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#53665f]">
            <span className="hidden sm:inline">
              {SOURCE_OPTIONS.find((o) => o.id === soundSource)?.hint}
            </span>
            {onPlaySourceSample && (
              <button
                type="button"
                onClick={() => onPlaySourceSample(soundSource)}
                className="px-2.5 py-1 rounded-md bg-white border border-[#d8e2dc] hover:bg-[#fafcfa] text-xs font-semibold text-[#0d4a3e] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Redă nota</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">AMPLITUDINE VÂRF</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {stats.peak.toFixed(3)}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">NIVEL EFICACE (RMS)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {stats.rms.toFixed(3)}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">PERIOADĂ T (1/f₀)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {stats.periodMs
              ? `${stats.periodMs.toFixed(2)} ms`
              : theoreticalPeriodMs
              ? `~${theoreticalPeriodMs.toFixed(2)} ms`
              : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">STARE OSCILOSCOP</div>
          <div className="text-base font-bold text-[#0d4a3e] mt-0.5">
            {paused ? 'Înghețat' : stats.active ? 'Semnal activ' : 'Așteptare'}
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg block"
        style={{ height: 210 }}
      />
    </div>
  );
};

