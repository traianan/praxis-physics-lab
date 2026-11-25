import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, Play } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { BodyResonanceConfig, ExcitationTechnique, NotationSystem } from '../types/guitar';
import { formatMidiLabel, harmonicAmplitudes } from '../utils/musicTheory';

export type ReferenceInstrumentId = 'tuning_fork' | 'flute' | 'piano' | 'clarinet';

type ReferenceInstrumentSpec = {
  id: ReferenceInstrumentId;
  name: string;
  shortName: string;
  harmonics: number[]; // n = 1..10 normalized relative amplitudes
  description: string;
};

const REFERENCE_INSTRUMENTS: Record<ReferenceInstrumentId, ReferenceInstrumentSpec> = {
  tuning_fork: {
    id: 'tuning_fork',
    name: 'Diapazon pur',
    shortName: 'Diapazon',
    harmonics: [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    description:
      'Oscilație sinusoidală pură fără armonice superioare (doar fundamentală f₀) — ideală ca etalon zero al timbrului.',
  },
  flute: {
    id: 'flute',
    name: 'Flaut traversier',
    shortName: 'Flaut',
    harmonics: [1.0, 0.36, 0.14, 0.05, 0.018, 0.008, 0.004, 0.002, 0.0, 0.0],
    description:
      'Fundamentală foarte puternică și armonice superioare cu cădere rapidă — timbru aerisit, curat și rotund.',
  },
  piano: {
    id: 'piano',
    name: 'Pian acustic',
    shortName: 'Pian',
    harmonics: [1.0, 0.72, 0.46, 0.34, 0.22, 0.15, 0.09, 0.06, 0.04, 0.025],
    description:
      'Coardă lovită cu ciocănel: spectru bogat până la armonicele 6–8, cu atac percusiv și tranziție graduală.',
  },
  clarinet: {
    id: 'clarinet',
    name: 'Clarinet (tub cilindric)',
    shortName: 'Clarinet',
    harmonics: [1.0, 0.07, 0.78, 0.05, 0.46, 0.03, 0.24, 0.02, 0.12, 0.01],
    description:
      'Predomină armonicele impare (f₀, 3f₀, 5f₀, 7f₀…), în timp ce armonicele pare sunt puternic atenuate.',
  },
};

const FFT_SIZE = 4096;
const SAMPLE_RATE = 44100;
const MIN_FREQ = 55;
const MAX_FREQ = 4500;

/**
 * In-place Radix-2 Cooley-Tukey FFT returning magnitude spectrum in dB (0 .. N/2-1)
 */
function computeHannFftDb(samples: Float32Array): Float32Array {
  const N = FFT_SIZE;
  const re = new Float32Array(N);
  const im = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const win = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    re[i] = (samples[i] ?? 0) * win;
  }

  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < N; i++) {
    let bit = N >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
    }
  }

  // Butterfly passes
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    const ang = (-2 * Math.PI) / len;
    const wStepRe = Math.cos(ang);
    const wStepIm = Math.sin(ang);

    for (let i = 0; i < N; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let k = 0; k < half; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + half] * wRe - im[i + k + half] * wIm;
        const vIm = re[i + k + half] * wIm + im[i + k + half] * wRe;

        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + half] = uRe - vRe;
        im[i + k + half] = uIm - vIm;

        const nextWRe = wRe * wStepRe - wIm * wStepIm;
        wIm = wRe * wStepIm + wIm * wStepRe;
        wRe = nextWRe;
      }
    }
  }

  const bins = N >> 1;
  const db = new Float32Array(bins);
  // Coherent gain normalization of Hann window (N / 4 for one-sided peak)
  const norm = N * 0.25;
  for (let i = 0; i < bins; i++) {
    const mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]) / norm;
    db[i] = Math.max(-100, Math.min(0, 20 * Math.log10(Math.max(1e-6, mag))));
  }
  return db;
}

function synthesizeHarmonicSamples(f0: number, amps: number[]): Float32Array {
  const out = new Float32Array(FFT_SIZE);
  const nyquist = SAMPLE_RATE * 0.48;
  let maxVal = 0.0001;

  for (let i = 0; i < FFT_SIZE; i++) {
    const t = i / SAMPLE_RATE;
    let sum = 0;
    for (let k = 0; k < amps.length; k++) {
      const f = f0 * (k + 1);
      if (f > nyquist || amps[k] <= 0.0005) continue;
      sum += amps[k] * Math.sin(2 * Math.PI * f * t);
    }
    out[i] = sum;
    if (Math.abs(sum) > maxVal) maxVal = Math.abs(sum);
  }

  // Normalize peak to 0.85 for fair spectral comparison
  const scale = 0.85 / maxVal;
  for (let i = 0; i < FFT_SIZE; i++) {
    out[i] *= scale;
  }
  return out;
}

function getGuitarHarmonicProfile(
  f0: number,
  pickPosition: number,
  technique: ExcitationTechnique,
  bodyConfig: BodyResonanceConfig
): number[] {
  let effectivePick = pickPosition;
  if (technique === 'bridge') effectivePick = 0.08;
  if (technique === 'sweet_spot') effectivePick = 0.35;

  let base: number[];
  if (technique === 'harmonic_12') {
    base = [0.02, 1.0, 0.04, 0.14, 0.01, 0.03, 0.0, 0.01, 0.0, 0.0];
  } else if (technique === 'harmonic_7') {
    base = [0.02, 0.03, 1.0, 0.02, 0.01, 0.12, 0.0, 0.0, 0.02, 0.0];
  } else if (technique === 'harmonic_5') {
    base = [0.02, 0.03, 0.02, 1.0, 0.01, 0.01, 0.0, 0.1, 0.0, 0.0];
  } else {
    // Acoustic guitar plucked string harmonic profile with string stiffness brightness
    const raw = harmonicAmplitudes(effectivePick, 10);
    // Boost upper harmonics subtly to reflect bright steel/bronze acoustic string attack
    base = raw.map((a, idx) => {
      const n = idx + 1;
      const bodySlope = Math.pow(n, 0.45);
      return a * bodySlope;
    });
  }

  // Apply active Body Resonance EQ response (in linear amplitude) to each harmonic
  const freqs = new Float32Array(base.length);
  for (let k = 0; k < base.length; k++) {
    freqs[k] = f0 * (k + 1);
  }
  const eqDb = audioEngine.computeBodyFrequencyResponseDb(freqs, bodyConfig);
  const shaped = base.map((a, k) => a * Math.pow(10, eqDb[k] / 20));
  const peak = Math.max(...shaped, 0.0001);
  return shaped.map((v) => v / peak);
}

type TimbreComparisonPanelProps = {
  activeFreq: number;
  openMidi: number;
  fret: number;
  stringId: number;
  notation: NotationSystem;
  pickPosition: number;
  technique: ExcitationTechnique;
  bodyConfig: BodyResonanceConfig;
  onPlayGuitar: () => void;
};

export const TimbreComparisonPanel: React.FC<TimbreComparisonPanelProps> = ({
  activeFreq,
  openMidi,
  fret,
  stringId,
  notation,
  pickPosition,
  technique,
  bodyConfig,
  onPlayGuitar,
}) => {
  const [refInstrument, setRefInstrument] = useState<ReferenceInstrumentId>('flute');
  const [isAbPlaying, setIsAbPlaying] = useState<boolean>(false);
  const [abPhase, setAbPhase] = useState<'none' | 'guitar' | 'reference'>('none');

  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const abTimersRef = useRef<number[]>([]);

  const clearAbTimers = () => {
    abTimersRef.current.forEach((id) => window.clearTimeout(id));
    abTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearAbTimers();
  }, []);

  const refSpec = REFERENCE_INSTRUMENTS[refInstrument];
  const noteLabel = formatMidiLabel(openMidi + fret, notation);

  const comparison = useMemo(() => {
    const guitarAmps = getGuitarHarmonicProfile(activeFreq, pickPosition, technique, bodyConfig);
    const refAmps = refSpec.harmonics.slice(0, 10);

    const guitarSamples = synthesizeHarmonicSamples(activeFreq, guitarAmps);
    const refSamples = synthesizeHarmonicSamples(activeFreq, refAmps);

    const guitarDb = computeHannFftDb(guitarSamples);
    const refDb = computeHannFftDb(refSamples);

    const calcStats = (amps: number[]) => {
      let weightedFreqSum = 0;
      let ampSum = 0;
      let energyTotal = 0;
      let energyUpper = 0;

      amps.forEach((a, idx) => {
        const n = idx + 1;
        const f = activeFreq * n;
        const e = a * a;
        weightedFreqSum += f * a;
        ampSum += a;
        energyTotal += e;
        if (n >= 2) energyUpper += e;
      });

      const centroidHz = ampSum > 0 ? weightedFreqSum / ampSum : activeFreq;
      const upperEnergyPct = energyTotal > 0 ? (energyUpper / energyTotal) * 100 : 0;
      return { centroidHz, upperEnergyPct };
    };

    const guitarStats = calcStats(guitarAmps);
    const refStats = calcStats(refAmps);

    // Find harmonic n >= 2 with largest amplitude difference (Guitar - Reference)
    let maxDiffN = 2;
    let maxDiffVal = -Infinity;
    for (let k = 1; k < 8; k++) {
      const diff = (guitarAmps[k] ?? 0) - (refAmps[k] ?? 0);
      if (diff > maxDiffVal) {
        maxDiffVal = diff;
        maxDiffN = k + 1;
      }
    }

    return {
      guitarAmps: guitarAmps.slice(0, 8),
      refAmps: refAmps.slice(0, 8),
      guitarDb,
      refDb,
      guitarStats,
      refStats,
      maxDiffN,
      maxDiffVal,
    };
  }, [activeFreq, pickPosition, technique, bodyConfig, refSpec]);

  const handlePlayReference = () => {
    audioEngine.stopAll();
    audioEngine.playHarmonicSeries(activeFreq, refSpec.harmonics, 2.0);
  };

  const handlePlayAb = () => {
    clearAbTimers();
    audioEngine.stopAll();
    setIsAbPlaying(true);
    setAbPhase('guitar');
    onPlayGuitar();

    const t1 = window.setTimeout(() => {
      audioEngine.stopAll();
      setAbPhase('reference');
      audioEngine.playHarmonicSeries(activeFreq, refSpec.harmonics, 1.8);
    }, 1350);

    const t2 = window.setTimeout(() => {
      setIsAbPlaying(false);
      setAbPhase('none');
    }, 3150);

    abTimersRef.current = [t1, t2];
  };

  // Draw superimposed FFT Spectra Canvas
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 720;
    const h = 230;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 42;
    const padR = 16;
    const padT = 22;
    const padB = 26;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const freqToX = (f: number) => {
      const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, f));
      return padL + (Math.log2(clamped / MIN_FREQ) / Math.log2(MAX_FREQ / MIN_FREQ)) * plotW;
    };

    const dbToY = (db: number) => {
      const norm = Math.max(0, Math.min(1, (db - -90) / (0 - -90)));
      return padT + plotH * (1 - norm);
    };

    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, w, h);

    // Horizontal dB lines
    ctx.font = '10px "Consolas", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [0, -20, -40, -60, -80].forEach((db) => {
      const y = dbToY(db);
      ctx.strokeStyle = '#e6ede9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = '#53665f';
      ctx.fillText(`${db}`, padL - 6, y);
    });

    // Vertical frequency grid ticks
    ctx.textAlign = 'center';
    [60, 110, 220, 440, 880, 1760, 3520].forEach((f) => {
      const x = freqToX(f);
      ctx.strokeStyle = '#e8efeb';
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#53665f';
      ctx.fillText(f >= 1000 ? `${(f / 1000).toFixed(1)}k` : `${f}`, x, h - 10);
    });

    // Harmonic markers for active fundamental
    for (let k = 1; k <= 8; k++) {
      const hf = activeFreq * k;
      if (hf > MAX_FREQ) break;
      const hx = freqToX(hf);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = k === 1 ? 'rgba(13, 74, 62, 0.55)' : 'rgba(83, 102, 95, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, padT + plotH);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = k === 1 ? '#0d4a3e' : '#53665f';
      ctx.font = '600 10px "Consolas", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(k === 1 ? 'f₀' : `${k}f₀`, hx + 3, padT + 10);
    }

    const binWidth = SAMPLE_RATE / FFT_SIZE;
    const drawCurve = (dbArray: Float32Array, strokeColor: string, fillColor: string, lineWidth: number) => {
      const points: Array<{ x: number; y: number }> = [];
      for (let px = 0; px <= plotW; px += 2) {
        const fCenter = MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, px / plotW);
        const fNext = MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, (px + 2) / plotW);
        const bStart = Math.max(1, Math.floor(fCenter / binWidth));
        const bEnd = Math.min(dbArray.length - 1, Math.max(bStart, Math.ceil(fNext / binWidth)));
        let localMax = -90;
        for (let b = bStart; b <= bEnd; b++) {
          if (dbArray[b] > localMax) localMax = dbArray[b];
        }
        points.push({ x: padL + px, y: dbToY(localMax) });
      }

      // Fill area
      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Stroke top line
      ctx.beginPath();
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Plot Reference first (forest green), then Guitar on top (copper)
    drawCurve(comparison.refDb, '#0d4a3e', 'rgba(13, 74, 62, 0.14)', 2.0);
    drawCurve(comparison.guitarDb, '#b85d2b', 'rgba(184, 93, 43, 0.14)', 2.2);

    ctx.strokeStyle = '#d8e2dc';
    ctx.lineWidth = 1;
    ctx.strokeRect(padL, padT, plotW, plotH);
  }, [comparison, activeFreq]);

  // Draw grouped harmonic amplitude bars (n = 1..8)
  useEffect(() => {
    const canvas = barsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 720;
    const h = 165;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 42;
    const padR = 16;
    const padT = 18;
    const padB = 34;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, w, h);

    // Horizontal grid (0, 0.5, 1.0)
    ctx.font = '10px "Consolas", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [0, 0.25, 0.5, 0.75, 1.0].forEach((val) => {
      const y = padT + plotH * (1 - val);
      ctx.strokeStyle = '#e6ede9';
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillStyle = '#53665f';
      ctx.fillText(val.toFixed(2), padL - 6, y);
    });

    const groupW = plotW / 8;
    const barW = Math.min(22, groupW * 0.32);
    const gap = 3;

    for (let k = 0; k < 8; k++) {
      const centerX = padL + groupW * (k + 0.5);
      const gAmp = comparison.guitarAmps[k] ?? 0;
      const rAmp = comparison.refAmps[k] ?? 0;

      // Guitar bar (left, copper)
      const gH = Math.max(1, gAmp * plotH);
      ctx.fillStyle = '#b85d2b';
      ctx.fillRect(centerX - barW - gap / 2, padT + plotH - gH, barW, gH);

      // Reference bar (right, forest green)
      const rH = Math.max(1, rAmp * plotH);
      ctx.fillStyle = '#0d4a3e';
      ctx.fillRect(centerX + gap / 2, padT + plotH - rH, barW, rH);

      // Harmonic label + freq
      ctx.fillStyle = '#13221d';
      ctx.font = '600 10px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(k === 0 ? 'f₀' : `${k + 1}f₀`, centerX, padT + plotH + 12);

      const hf = activeFreq * (k + 1);
      ctx.fillStyle = '#53665f';
      ctx.font = '9px "Consolas", monospace';
      ctx.fillText(hf >= 1000 ? `${(hf / 1000).toFixed(1)}k` : `${Math.round(hf)}`, centerX, padT + plotH + 24);
    }

    ctx.strokeStyle = '#d8e2dc';
    ctx.strokeRect(padL, padT, plotW, plotH);
  }, [comparison, activeFreq]);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#13221d]">
              Comparație Timbre: Chitară acustică vs. Instrument de referință
            </h3>
            <span className="rounded border border-[#c8dad1] bg-[#edf3f0] px-2 py-0.5 text-[11px] font-mono font-medium text-[#0d4a3e]">
              Spectru FFT suprapus
            </span>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Vizualizează la aceeași frecvență fundamentală ({noteLabel} · {activeFreq.toFixed(1)} Hz) de ce timbrul chitarei sună diferit față de un diapazon pur, flaut, pian sau clarinet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPlayGuitar}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              abPhase === 'guitar'
                ? 'bg-[#b85d2b] text-white'
                : 'border border-[#b85d2b]/40 bg-[#fdf6f2] text-[#b85d2b] hover:bg-[#fae9df]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Redă chitară</span>
          </button>

          <button
            type="button"
            onClick={handlePlayReference}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              abPhase === 'reference'
                ? 'bg-[#0d4a3e] text-white'
                : 'border border-[#0d4a3e]/30 bg-[#edf3f0] text-[#0d4a3e] hover:bg-[#dce8e2]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Redă {refSpec.shortName}</span>
          </button>

          <button
            type="button"
            onClick={handlePlayAb}
            disabled={isAbPlaying}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{isAbPlaying ? 'Redare A / B...' : 'Compară audio A / B'}</span>
          </button>
        </div>
      </div>

      {/* Reference Instrument Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
          {(['tuning_fork', 'flute', 'piano', 'clarinet'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setRefInstrument(id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                refInstrument === id
                  ? 'bg-[#0d4a3e] text-white'
                  : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              {REFERENCE_INSTRUMENTS[id].name}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-[#53665f]">
          Coarda {stringId} · Fret {fret} · p = {pickPosition.toFixed(2)} L
        </span>
      </div>

      {/* 4-KPI Comparison Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">NOTĂ COMPARATĂ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {noteLabel} · {activeFreq.toFixed(1)} Hz
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">CENTROID SPECTRAL</div>
          <div className="text-sm font-bold text-[#13221d] mt-1 font-mono tabular-nums">
            <span className="text-[#b85d2b]">{Math.round(comparison.guitarStats.centroidHz)} Hz</span>
            {' vs '}
            <span className="text-[#0d4a3e]">{Math.round(comparison.refStats.centroidHz)} Hz</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ENERGIE ARMONICE (n ≥ 2)</div>
          <div className="text-sm font-bold text-[#13221d] mt-1 font-mono tabular-nums">
            <span className="text-[#b85d2b]">{comparison.guitarStats.upperEnergyPct.toFixed(0)}%</span>
            {' vs '}
            <span className="text-[#0d4a3e]">{comparison.refStats.upperEnergyPct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">DIFERENȚĂ MAXIMĂ</div>
          <div className="text-sm font-bold text-[#0d4a3e] mt-1 font-mono tabular-nums">
            {comparison.maxDiffVal > 0.02
              ? `Armonicul ${comparison.maxDiffN} (+${Math.round(comparison.maxDiffVal * 100)}%)`
              : 'Profil apropiat'}
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="rounded-lg bg-[#fafcfa] border border-[#d8e2dc] px-3.5 py-2 text-xs text-[#53665f]">
        <span className="font-semibold text-[#13221d]">{refSpec.name}: </span>
        {refSpec.description}
      </div>

      {/* Superimposed FFT Spectrum Canvas */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#13221d]">
            Spectru Fourier suprapus (dB vs. frecvență logaritmică)
          </span>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-[#b85d2b]">
              <span className="inline-block w-3 h-0.5 bg-[#b85d2b]" />
              Chitară acustică
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#0d4a3e]">
              <span className="inline-block w-3 h-0.5 bg-[#0d4a3e]" />
              {refSpec.name}
            </span>
          </div>
        </div>
        <canvas
          ref={spectrumCanvasRef}
          className="w-full h-[230px] rounded-lg border border-[#d8e2dc]"
          aria-label="Spectru Fourier suprapus pentru comparația timbrelor"
        />
      </div>

      {/* Grouped Harmonic Bars Canvas */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#13221d]">
            Intensitatea relativă a armonicelor individuale (f₀ … 8f₀)
          </span>
          <span className="text-[11px] text-[#53665f]">
            Stânga (cupru): Chitară · Dreapta (verde): {refSpec.shortName}
          </span>
        </div>
        <canvas
          ref={barsCanvasRef}
          className="w-full h-[165px] rounded-lg border border-[#d8e2dc]"
          aria-label="Comparație a amplitudinii armonicelor superioare"
        />
      </div>
    </div>
  );
};

