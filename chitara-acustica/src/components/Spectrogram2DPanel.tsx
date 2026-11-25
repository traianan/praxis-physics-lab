import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Waves } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { NotationSystem } from '../types/guitar';
import { formatMidiLabel } from '../utils/musicTheory';

type FreqScaleMode = 'log' | 'linear';
type ColorPaletteId = 'copper' | 'viridis';

type SpectrogramSlice = {
  timeMs: number;
  binsDb: Float32Array;
  sampleRate: number;
};

type Spectrogram2DPanelProps = {
  expectedFrequency: number;
  stringId: number;
  fret: number;
  openMidi: number;
  notation: NotationSystem;
  onPluckDemo: () => void;
};

const MAX_WINDOW_SEC = 10;
const LOG_MIN_F = 55;
const MAX_F = 4500;

function sampleColormap(norm: number, palette: ColorPaletteId): [number, number, number] {
  const t = Math.max(0, Math.min(1, norm));
  if (palette === 'copper') {
    // Deep forest -> dark teal -> copper -> warm amber -> bright ivory
    if (t < 0.25) {
      const k = t / 0.25;
      return [
        Math.round(12 + k * 14),
        Math.round(31 + k * 42),
        Math.round(26 + k * 36),
      ];
    }
    if (t < 0.55) {
      const k = (t - 0.25) / 0.3;
      return [
        Math.round(26 + k * 158),
        Math.round(73 + k * 20),
        Math.round(62 - k * 19),
      ];
    }
    if (t < 0.82) {
      const k = (t - 0.55) / 0.27;
      return [
        Math.round(184 + k * 56),
        Math.round(93 + k * 82),
        Math.round(43 + k * 34),
      ];
    }
    const k = (t - 0.82) / 0.18;
    return [
      Math.round(240 + k * 15),
      Math.round(175 + k * 70),
      Math.round(77 + k * 145),
    ];
  }

  // Viridis-inspired scientific palette (deep navy -> teal -> emerald -> bright yellow)
  if (t < 0.35) {
    const k = t / 0.35;
    return [
      Math.round(18 + k * 14),
      Math.round(26 + k * 78),
      Math.round(58 + k * 66),
    ];
  }
  if (t < 0.7) {
    const k = (t - 0.35) / 0.35;
    return [
      Math.round(32 + k * 56),
      Math.round(104 + k * 76),
      Math.round(124 - k * 34),
    ];
  }
  const k = (t - 0.7) / 0.3;
  return [
    Math.round(88 + k * 162),
    Math.round(180 + k * 58),
    Math.round(90 - k * 46),
  ];
}

function sampleBinDb(
  binsDb: Float32Array,
  binWidth: number,
  freq: number,
  floorDb: number
): number {
  const exactBin = freq / binWidth;
  const b0 = Math.max(1, Math.min(binsDb.length - 2, Math.floor(exactBin)));
  const b1 = b0 + 1;
  const frac = Math.max(0, Math.min(1, exactBin - b0));
  const v0 = Number.isFinite(binsDb[b0]) ? binsDb[b0] : floorDb;
  const v1 = Number.isFinite(binsDb[b1]) ? binsDb[b1] : floorDb;
  const maxLocal = Math.max(v0, v1, binsDb[Math.max(1, b0 - 1)] ?? floorDb);
  const lerpVal = v0 + (v1 - v0) * frac;
  return 0.65 * maxLocal + 0.35 * lerpVal;
}

export const Spectrogram2DPanel: React.FC<Spectrogram2DPanelProps> = ({
  expectedFrequency,
  stringId,
  fret,
  openMidi,
  notation,
  onPluckDemo,
}) => {
  const [freqScale, setFreqScale] = useState<FreqScaleMode>('log');
  const [windowSec, setWindowSec] = useState<4 | 6 | 10>(6);
  const [palette, setPalette] = useState<ColorPaletteId>('copper');
  const [floorDb, setFloorDb] = useState<number>(-92);
  const [showHarmonics, setShowHarmonics] = useState<boolean>(true);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  const [harmonicLevels, setHarmonicLevels] = useState<{
    f1: number;
    f2: number;
    f3: number;
    f4: number;
  }>({ f1: -100, f2: -100, f3: -100, f4: -100 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const decayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<SpectrogramSlice[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const noteLabel = useMemo(
    () => formatMidiLabel(openMidi + fret, notation),
    [openMidi, fret, notation]
  );

  // Store state in refs so RAF loop always has live preferences without clearing history
  const configRef = useRef({
    expectedFrequency,
    freqScale,
    windowSec,
    palette,
    floorDb,
    showHarmonics,
    isFrozen,
  });

  useEffect(() => {
    configRef.current = {
      expectedFrequency,
      freqScale,
      windowSec,
      palette,
      floorDb,
      showHarmonics,
      isFrozen,
    };
  }, [expectedFrequency, freqScale, windowSec, palette, floorDb, showHarmonics, isFrozen]);

  const handleClear = () => {
    historyRef.current = [];
    setHarmonicLevels({ f1: -100, f2: -100, f3: -100, f4: -100 });
  };

  useEffect(() => {
    let rafId = 0;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const renderLoop = (now: number) => {
      const cfg = configRef.current;

      // Capture spectrum slices ~45 times/sec when not frozen
      if (!cfg.isFrozen && now - lastSampleTimeRef.current >= 22) {
        lastSampleTimeRef.current = now;
        const analyser = audioEngine.getAnalyser();
        const spectrum = audioEngine.getSpectrumData();
        const sr = audioEngine.getSampleRate();

        if (analyser && spectrum) {
          const sliceCopy = new Float32Array(spectrum);
          historyRef.current.push({
            timeMs: now,
            binsDb: sliceCopy,
            sampleRate: sr,
          });

          // Trim history older than MAX_WINDOW_SEC + 0.5s
          const cutoff = now - (MAX_WINDOW_SEC + 0.5) * 1000;
          while (historyRef.current.length > 0 && historyRef.current[0].timeMs < cutoff) {
            historyRef.current.shift();
          }

          // Update numeric harmonic dB readout ~10 Hz
          if (now - lastUiUpdateRef.current > 95) {
            lastUiUpdateRef.current = now;
            const binWidth = sr / 2 / sliceCopy.length;
            const f0 = cfg.expectedFrequency;
            setHarmonicLevels({
              f1: sampleBinDb(sliceCopy, binWidth, f0, -100),
              f2: sampleBinDb(sliceCopy, binWidth, f0 * 2, -100),
              f3: sampleBinDb(sliceCopy, binWidth, f0 * 3, -100),
              f4: sampleBinDb(sliceCopy, binWidth, f0 * 4, -100),
            });
          }
        }
      }

      const history = historyRef.current;
      const latestTimeMs =
        history.length > 0 ? history[history.length - 1].timeMs : now;
      const startTimeMs = latestTimeMs - cfg.windowSec * 1000;

      // 1. Render 2D Time-Frequency Spectrogram Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth || 720;
        const h = 250;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);

          const padL = 52;
          const padR = 54; // Space for dB colorbar
          const padT = 16;
          const padB = 28;
          const plotW = Math.max(120, Math.floor(w - padL - padR));
          const plotH = Math.max(80, Math.floor(h - padT - padB));

          const minF = cfg.freqScale === 'log' ? LOG_MIN_F : 40;
          const maxDb = -18;
          const minDb = cfg.floorDb;

          const freqToY = (f: number) => {
            if (cfg.freqScale === 'log') {
              const clamped = Math.max(minF, Math.min(MAX_F, f));
              const frac = Math.log2(clamped / minF) / Math.log2(MAX_F / minF);
              return padT + plotH * (1 - frac);
            }
            const clamped = Math.max(minF, Math.min(MAX_F, f));
            const frac = (clamped - minF) / (MAX_F - minF);
            return padT + plotH * (1 - frac);
          };

          const yToFreq = (py: number) => {
            const frac = 1 - py / Math.max(1, plotH - 1);
            if (cfg.freqScale === 'log') {
              return minF * Math.pow(MAX_F / minF, frac);
            }
            return minF + frac * (MAX_F - minF);
          };

          // Rasterize spectrogram heatmap into offscreen ImageData at crisp pixel grid
          const rasterW = Math.min(plotW, 360);
          const rasterH = plotH;
          const offscreen = offscreenCanvasRef.current!;
          if (offscreen.width !== rasterW || offscreen.height !== rasterH) {
            offscreen.width = rasterW;
            offscreen.height = rasterH;
          }
          const offCtx = offscreen.getContext('2d');
          if (offCtx) {
            const img = offCtx.createImageData(rasterW, rasterH);
            const data = img.data;
            const [bgR, bgG, bgB] = sampleColormap(0, cfg.palette);

            // Precompute frequency lookup per Y row
            const rowFreqs = new Float32Array(rasterH);
            for (let py = 0; py < rasterH; py++) {
              rowFreqs[py] = yToFreq(py);
            }

            // Map each X column to nearest captured slice
            let sliceCursor = 0;
            for (let px = 0; px < rasterW; px++) {
              const colTime = startTimeMs + (px / Math.max(1, rasterW - 1)) * cfg.windowSec * 1000;
              while (
                sliceCursor + 1 < history.length &&
                history[sliceCursor + 1].timeMs <= colTime
              ) {
                sliceCursor++;
              }

              const slice =
                history.length > 0 &&
                colTime >= history[0].timeMs - 80 &&
                Math.abs(history[sliceCursor].timeMs - colTime) < 160
                  ? history[sliceCursor]
                  : null;

              if (!slice) {
                for (let py = 0; py < rasterH; py++) {
                  const idx = (py * rasterW + px) * 4;
                  data[idx] = bgR;
                  data[idx + 1] = bgG;
                  data[idx + 2] = bgB;
                  data[idx + 3] = 255;
                }
              } else {
                const binWidth = slice.sampleRate / 2 / slice.binsDb.length;
                for (let py = 0; py < rasterH; py++) {
                  const freq = rowFreqs[py];
                  const bin = Math.min(
                    slice.binsDb.length - 1,
                    Math.max(1, Math.round(freq / binWidth))
                  );
                  const db = Number.isFinite(slice.binsDb[bin]) ? slice.binsDb[bin] : minDb;
                  const norm = (db - minDb) / Math.max(1, maxDb - minDb);
                  const [r, g, b] = sampleColormap(norm, cfg.palette);
                  const idx = (py * rasterW + px) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                  data[idx + 3] = 255;
                }
              }
            }
            offCtx.putImageData(img, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(offscreen, padL, padT, plotW, plotH);
          }

          // Frequency axis ticks & subtle grid
          const freqTicks =
            cfg.freqScale === 'log'
              ? [60, 110, 220, 440, 880, 1760, 3520]
              : [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000];

          ctx.font = '10px "Consolas", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          freqTicks.forEach((f) => {
            if (f < minF || f > MAX_F) return;
            const y = freqToY(f);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
            ctx.stroke();

            ctx.fillStyle = '#53665f';
            const label = f >= 1000 ? `${(f / 1000).toFixed(1)}k` : `${f}`;
            ctx.fillText(`${label}`, padL - 6, y);
          });

          // Time axis ticks
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const numTimeTicks = cfg.windowSec === 10 ? 5 : cfg.windowSec === 6 ? 6 : 4;
          for (let i = 0; i <= numTimeTicks; i++) {
            const frac = i / numTimeTicks;
            const x = padL + frac * plotW;
            const secAgo = -((1 - frac) * cfg.windowSec);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.beginPath();
            ctx.moveTo(x, padT);
            ctx.lineTo(x, padT + plotH);
            ctx.stroke();

            ctx.fillStyle = '#53665f';
            ctx.fillText(secAgo === 0 ? 'Acum' : `${secAgo.toFixed(0)}s`, x, padT + plotH + 6);
          }

          // Harmonic frequency horizontal guides (f0..6f0)
          if (cfg.showHarmonics && cfg.expectedFrequency >= minF) {
            for (let k = 1; k <= 6; k++) {
              const hf = cfg.expectedFrequency * k;
              if (hf > MAX_F) break;
              const hy = freqToY(hf);
              ctx.save();
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle =
                k === 1 ? 'rgba(255, 240, 210, 0.78)' : 'rgba(94, 234, 212, 0.48)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(padL, hy);
              ctx.lineTo(padL + plotW, hy);
              ctx.stroke();
              ctx.restore();

              ctx.fillStyle = k === 1 ? '#fff4df' : '#99f6e4';
              ctx.font = '600 10px "Consolas", monospace';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'bottom';
              ctx.fillText(k === 1 ? 'f₀' : `${k}f₀`, padL + 5, hy - 2);
            }
          }

          // Plot frame border
          ctx.strokeStyle = '#d8e2dc';
          ctx.lineWidth = 1;
          ctx.strokeRect(padL, padT, plotW, plotH);

          // dB Colorbar on right
          const barX = padL + plotW + 12;
          const barW = 10;
          for (let py = 0; py < plotH; py++) {
            const norm = 1 - py / Math.max(1, plotH - 1);
            const [r, g, b] = sampleColormap(norm, cfg.palette);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(barX, padT + py, barW, 1);
          }
          ctx.strokeStyle = '#d8e2dc';
          ctx.strokeRect(barX, padT, barW, plotH);

          ctx.fillStyle = '#53665f';
          ctx.font = '9px "Consolas", monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${maxDb}dB`, barX + barW + 4, padT + 4);
          ctx.fillText(`${Math.round((maxDb + minDb) / 2)}`, barX + barW + 4, padT + plotH / 2);
          ctx.fillText(`${minDb}`, barX + barW + 4, padT + plotH - 4);
        }
      }

      // 2. Render Synchronized Harmonic Envelope Decay Trace (f0 vs 2f0 vs 3f0 vs 4f0)
      const decayCanvas = decayCanvasRef.current;
      if (decayCanvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = decayCanvas.clientWidth || 720;
        const h = 135;
        if (decayCanvas.width !== Math.floor(w * dpr) || decayCanvas.height !== Math.floor(h * dpr)) {
          decayCanvas.width = Math.floor(w * dpr);
          decayCanvas.height = Math.floor(h * dpr);
        }

        const ctx = decayCanvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = '#fcfdfc';
          ctx.fillRect(0, 0, w, h);

          const padL = 52;
          const padR = 54;
          const padT = 14;
          const padB = 22;
          const plotW = Math.max(120, w - padL - padR);
          const plotH = Math.max(60, h - padT - padB);
          const minDb = cfg.floorDb;
          const maxDb = -18;

          const dbToY = (db: number) => {
            const norm = Math.max(0, Math.min(1, (db - minDb) / Math.max(1, maxDb - minDb)));
            return padT + plotH * (1 - norm);
          };

          // Horizontal dB lines
          ctx.font = '10px "Consolas", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          [-25, -50, -75].forEach((db) => {
            if (db < minDb) return;
            const y = dbToY(db);
            ctx.strokeStyle = '#e6eee9';
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
            ctx.stroke();
            ctx.fillStyle = '#53665f';
            ctx.fillText(`${db}`, padL - 6, y);
          });

          const harmonicSeries = [
            { mult: 1, color: '#0d4a3e', width: 2.2 }, // f0
            { mult: 2, color: '#b85d2b', width: 1.9 }, // 2f0
            { mult: 3, color: '#2b6cb0', width: 1.6 }, // 3f0
            { mult: 4, color: '#8b5cf6', width: 1.4 }, // 4f0
          ];

          const visibleSlices = history.filter((s) => s.timeMs >= startTimeMs);
          if (visibleSlices.length > 1) {
            harmonicSeries.forEach(({ mult, color, width }) => {
              const targetFreq = cfg.expectedFrequency * mult;
              if (targetFreq > MAX_F) return;

              ctx.strokeStyle = color;
              ctx.lineWidth = width;
              ctx.beginPath();
              visibleSlices.forEach((slice, idx) => {
                const fracX = (slice.timeMs - startTimeMs) / (cfg.windowSec * 1000);
                const x = padL + Math.max(0, Math.min(1, fracX)) * plotW;
                const binWidth = slice.sampleRate / 2 / slice.binsDb.length;
                const db = sampleBinDb(slice.binsDb, binWidth, targetFreq, minDb);
                const y = dbToY(db);
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.stroke();
            });
          }

          ctx.strokeStyle = '#d8e2dc';
          ctx.strokeRect(padL, padT, plotW, plotH);

          ctx.fillStyle = '#53665f';
          ctx.font = '10px "Segoe UI", sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText('Curbe de stingere (decay dB) pentru f₀, 2f₀, 3f₀, 4f₀', padL + 6, padT + 4);
        }
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#13221d]">
              Spectrogramă 2D: Evoluția în timp și stingerea armonicelor
            </h3>
            <span className="rounded border border-[#c8dad1] bg-[#edf3f0] px-2 py-0.5 text-[11px] font-mono font-medium text-[#0d4a3e]">
              Timp × Frecvență
            </span>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Urmărește evoluția temporală a frecvențelor după ciupire și observă cum armonicele superioare (2f₀, 3f₀, 4f₀…) se sting mai rapid decât fundamentala f₀.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isFrozen) setIsFrozen(false);
              onPluckDemo();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Ciupește și observă decay</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFrozen((f) => !f)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFrozen
                ? 'border-[#b85d2b] bg-[#fdf2ee] text-[#b85d2b]'
                : 'border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-[#13221d]'
            }`}
          >
            {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isFrozen ? 'Reia captura' : 'Îngheață imaginea'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-medium text-[#53665f] hover:text-[#13221d] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Șterge</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Harmonic Level Readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">FUNDAMENTALĂ f₀</div>
          <div className="text-base font-bold text-[#0d4a3e] mt-0.5 font-mono tabular-nums">
            {harmonicLevels.f1 > -96 ? `${harmonicLevels.f1.toFixed(1)} dB` : '—'}
          </div>
          <div className="text-[11px] text-[#53665f]">
            C{stringId} Fret {fret} ({noteLabel} · {expectedFrequency.toFixed(1)} Hz)
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ARMONIC 2 (2f₀)</div>
          <div className="text-base font-bold text-[#b85d2b] mt-0.5 font-mono tabular-nums">
            {harmonicLevels.f2 > -96 ? `${harmonicLevels.f2.toFixed(1)} dB` : '—'}
          </div>
          <div className="text-[11px] text-[#53665f] font-mono tabular-nums">
            {(expectedFrequency * 2).toFixed(1)} Hz
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ARMONIC 3 (3f₀)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {harmonicLevels.f3 > -96 ? `${harmonicLevels.f3.toFixed(1)} dB` : '—'}
          </div>
          <div className="text-[11px] text-[#53665f] font-mono tabular-nums">
            {(expectedFrequency * 3).toFixed(1)} Hz
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ARMONIC 4 (4f₀)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {harmonicLevels.f4 > -96 ? `${harmonicLevels.f4.toFixed(1)} dB` : '—'}
          </div>
          <div className="text-[11px] text-[#53665f] font-mono tabular-nums">
            {(expectedFrequency * 4).toFixed(1)} Hz
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'log', label: 'Axă Log (Hz)' },
                { id: 'linear', label: 'Axă Liniară (Hz)' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFreqScale(s.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  freqScale === s.id ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {([4, 6, 10] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setWindowSec(sec)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  windowSec === sec ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'copper', label: 'Cupru' },
                { id: 'viridis', label: 'Termic' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  palette === p.id ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#53665f]">Prag zgomot:</span>
            <span className="font-mono font-semibold text-[#13221d] tabular-nums w-12">
              {floorDb} dB
            </span>
            <input
              type="range"
              min={-100}
              max={-68}
              step={2}
              value={floorDb}
              onChange={(e) => setFloorDb(Number(e.target.value))}
              className="lab-slider w-24"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs font-medium text-[#13221d] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHarmonics}
              onChange={(e) => setShowHarmonics(e.target.checked)}
              className="accent-[#0d4a3e] w-3.5 h-3.5"
            />
            <span>Repere f₀…6f₀</span>
          </label>
        </div>
      </div>

      {/* 2D Spectrogram Canvas */}
      <div className="space-y-1.5">
        <canvas
          ref={canvasRef}
          className="w-full h-[250px] rounded-lg border border-[#d8e2dc]"
          aria-label="Spectrogramă 2D a evoluției în timp a frecvențelor"
        />
      </div>

      {/* Synchronized Decay Curves Canvas */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#53665f]">
          <span className="font-semibold text-[#13221d]">
            Compararea stingerii (decay) între fundamentală și armonicele superioare
          </span>
          <div className="flex flex-wrap items-center gap-3 font-mono">
            <span className="flex items-center gap-1 text-[#0d4a3e]">
              <span className="inline-block w-2.5 h-0.5 bg-[#0d4a3e]" /> f₀
            </span>
            <span className="flex items-center gap-1 text-[#b85d2b]">
              <span className="inline-block w-2.5 h-0.5 bg-[#b85d2b]" /> 2f₀
            </span>
            <span className="flex items-center gap-1 text-[#2b6cb0]">
              <span className="inline-block w-2.5 h-0.5 bg-[#2b6cb0]" /> 3f₀
            </span>
            <span className="flex items-center gap-1 text-[#8b5cf6]">
              <span className="inline-block w-2.5 h-0.5 bg-[#8b5cf6]" /> 4f₀
            </span>
          </div>
        </div>
        <canvas
          ref={decayCanvasRef}
          className="w-full h-[135px] rounded-lg border border-[#d8e2dc]"
          aria-label="Curbele de stingere în timp pentru fundamentală și armonice"
        />
      </div>
    </div>
  );
};

