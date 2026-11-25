import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AudioWaveform, Play, RefreshCw, Square, Volume2 } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { harmonicAmplitudes } from '../utils/musicTheory';

type HarmonicAnalyzerPanelProps = {
  activeFrequency: number;
  noteLabel: string;
  customHarmonics: number[];
  useCustomHarmonics: boolean;
  onChangeCustomHarmonics: (next: number[]) => void;
  onToggleUseCustomHarmonics: (enabled: boolean) => void;
};

type HarmonicPresetId =
  | 'guitar_standard'
  | 'guitar_bridge'
  | 'guitar_sweet'
  | 'odd_only'
  | 'sawtooth'
  | 'pure_sine'
  | 'custom';

const HARMONIC_INTERVALS = [
  'Fundamentală (f₁)',
  'Octavă (2f₁)',
  'Cvintă + Oct. (3f₁)',
  'Dublă octavă (4f₁)',
  'Terță M + 2 Oct. (5f₁)',
  'Cvintă + 2 Oct. (6f₁)',
  'Septimă arm. (7f₁)',
  'Triplă octavă (8f₁)',
];

const HARMONIC_SHORT_INTERVALS = [
  'Fund.',
  '8va',
  '12ma (5)',
  '2×8va',
  '3M+2×8',
  '5+2×8',
  '7 arm.',
  '3×8va',
];

export const HarmonicAnalyzerPanel: React.FC<HarmonicAnalyzerPanelProps> = ({
  activeFrequency,
  noteLabel,
  customHarmonics,
  useCustomHarmonics,
  onChangeCustomHarmonics,
  onToggleUseCustomHarmonics,
}) => {
  const [enabledBands, setEnabledBands] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);
  const [presetId, setPresetId] = useState<HarmonicPresetId>('guitar_standard');
  const [droneActive, setDroneActive] = useState<boolean>(false);
  const [showComponents, setShowComponents] = useState<boolean>(true);
  const [liveMeasured, setLiveMeasured] = useState<number[]>(() => new Array(8).fill(0));
  const [liveDetectedF0, setLiveDetectedF0] = useState<number | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);

  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastActiveMeasuredRef = useRef<number[]>(new Array(8).fill(0));
  const peakHoldRef = useRef<number[]>(new Array(8).fill(0));
  const lastUiMeterUpdateRef = useRef<number>(0);

  const effectiveAmplitudes = useMemo(
    () => customHarmonics.map((a, idx) => (enabledBands[idx] ? a : 0)),
    [customHarmonics, enabledBands]
  );

  // Stop continuous harmonic drone on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopHarmonicDrone();
    };
  }, []);

  // Update continuous drone whenever f0 or slider amplitudes change while drone is active
  useEffect(() => {
    if (droneActive) {
      audioEngine.updateHarmonicDrone(activeFrequency, effectiveAmplitudes);
    }
  }, [droneActive, activeFrequency, effectiveAmplitudes]);

  const toggleDrone = () => {
    if (droneActive) {
      audioEngine.stopHarmonicDrone();
      setDroneActive(false);
    } else {
      audioEngine.startHarmonicDrone(activeFrequency, effectiveAmplitudes);
      setDroneActive(true);
    }
  };

  const handlePlaySynthesis = () => {
    if (droneActive) {
      audioEngine.stopHarmonicDrone();
      setDroneActive(false);
    }
    audioEngine.playHarmonicSeries(activeFrequency, effectiveAmplitudes, 2.8);
  };

  const applyPreset = (id: Exclude<HarmonicPresetId, 'custom'>) => {
    let next: number[] = [];
    if (id === 'guitar_standard') {
      next = harmonicAmplitudes(0.22, 8);
    } else if (id === 'guitar_bridge') {
      next = harmonicAmplitudes(0.08, 8);
    } else if (id === 'guitar_sweet') {
      next = harmonicAmplitudes(0.42, 8);
    } else if (id === 'odd_only') {
      next = [1.0, 0, 0.36, 0, 0.22, 0, 0.14, 0];
    } else if (id === 'sawtooth') {
      next = Array.from({ length: 8 }, (_, idx) => Number((1 / (idx + 1)).toFixed(2)));
    } else if (id === 'pure_sine') {
      next = [1.0, 0, 0, 0, 0, 0, 0, 0];
    }
    setPresetId(id);
    setEnabledBands(next.map((v) => v > 0.005));
    onChangeCustomHarmonics(next);
  };

  const handleBandSlider = (idx: number, val: number) => {
    const next = [...customHarmonics];
    next[idx] = val;
    if (val > 0 && !enabledBands[idx]) {
      const nextEn = [...enabledBands];
      nextEn[idx] = true;
      setEnabledBands(nextEn);
    }
    setPresetId('custom');
    onChangeCustomHarmonics(next);
  };

  const toggleBand = (idx: number) => {
    const nextEn = [...enabledBands];
    nextEn[idx] = !nextEn[idx];
    setEnabledBands(nextEn);
    setPresetId('custom');
  };

  const handleCaptureLiveToSliders = () => {
    const src = lastActiveMeasuredRef.current;
    const peak = Math.max(...src);
    if (peak < 0.05) {
      setCaptureNotice('Redă mai întâi un sunet de chitară (sau pornește microfonul) pentru a captura armonicele.');
      window.setTimeout(() => setCaptureNotice(null), 3500);
      return;
    }
    const normalized = src.map((v) => Number(Math.min(1, v / peak).toFixed(2)));
    setEnabledBands(normalized.map((v) => v >= 0.02));
    setPresetId('custom');
    onChangeCustomHarmonics(normalized);
    setCaptureNotice('Coeficienții Fourier ai sunetului live au fost încărcați în cele 8 glisoare.');
    window.setTimeout(() => setCaptureNotice(null), 3500);
  };

  // Real-time Fourier decomposition loop (reads AnalyserNode + renders live spectrum bars)
  useEffect(() => {
    let rafId = 0;

    const renderLoop = (now: number) => {
      const analyser = audioEngine.getAnalyser();
      const spectrum = audioEngine.getSpectrumData();
      const sampleRate = audioEngine.getSampleRate();

      // Determine reference fundamental: live detected pitch when signal is clearly ringing, else activeFrequency
      let refF0 = activeFrequency;
      let detectedF: number | null = null;
      const measured = new Array<number>(8).fill(0);
      let hasLiveSignal = false;

      if (analyser && spectrum) {
        const pitch = audioEngine.detectFundamental();
        if (pitch && pitch.peakDb > -74) {
          detectedF = pitch.frequency;
          // If live pitch is close to an octave/note we're exploring or user played another string, track it cleanly
          refF0 = pitch.frequency;
          hasLiveSignal = true;
        }

        const nyquist = sampleRate / 2;
        const binWidth = nyquist / spectrum.length;
        const minDb = analyser.minDecibels;
        const maxDb = analyser.maxDecibels;

        // Measure peak magnitude inside a narrow window around each harmonic n * refF0
        let maxNorm = 0;
        const rawNorms = new Array<number>(8).fill(0);
        for (let idx = 0; idx < 8; idx++) {
          const n = idx + 1;
          const targetF = refF0 * n;
          if (targetF >= nyquist - 50) continue;
          const centerBin = Math.round(targetF / binWidth);
          const tolBins = Math.max(1, Math.round((targetF * 0.03) / binWidth));
          let localPeakDb = minDb;
          for (
            let b = Math.max(1, centerBin - tolBins);
            b <= Math.min(spectrum.length - 1, centerBin + tolBins);
            b++
          ) {
            if (spectrum[b] > localPeakDb) localPeakDb = spectrum[b];
          }
          const dbNorm = Math.max(0, Math.min(1, (localPeakDb - minDb) / (maxDb - minDb)));
          // Convert logarithmic dB response to perceptually balanced amplitude scale
          const lin = dbNorm > 0.08 ? Math.pow(dbNorm, 1.35) : 0;
          rawNorms[idx] = lin;
          if (lin > maxNorm) maxNorm = lin;
        }

        if (maxNorm > 0.14) {
          hasLiveSignal = true;
          for (let i = 0; i < 8; i++) {
            measured[i] = Number((rawNorms[i] / Math.max(0.25, maxNorm)).toFixed(3));
            peakHoldRef.current[i] = Math.max(peakHoldRef.current[i] * 0.985, measured[i]);
          }
          lastActiveMeasuredRef.current = [...measured];
        } else {
          for (let i = 0; i < 8; i++) {
            peakHoldRef.current[i] *= 0.96;
          }
        }
      }

      if (now - lastUiMeterUpdateRef.current > 85) {
        lastUiMeterUpdateRef.current = now;
        setLiveMeasured(measured);
        setLiveDetectedF0(hasLiveSignal && detectedF ? detectedF : null);
      }

      // Draw Canvas 1: Real-time Fourier Spectral Decomposition (Live FFT + 8 Harmonic Bars)
      const specCanvas = spectrumCanvasRef.current;
      if (specCanvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = specCanvas.getBoundingClientRect();
        const w = Math.max(300, Math.floor(rect.width));
        const h = 230;
        if (specCanvas.width !== Math.floor(w * dpr) || specCanvas.height !== Math.floor(h * dpr)) {
          specCanvas.width = Math.floor(w * dpr);
          specCanvas.height = Math.floor(h * dpr);
        }

        const ctx = specCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);

          const padL = 36;
          const padR = 14;
          const padT = 26;
          const padB = 34;
          const plotW = w - padL - padR;
          const plotH = h - padT - padB;

          ctx.fillStyle = '#fafcfa';
          ctx.fillRect(0, 0, w, h);

          // Horizontal grid (0%, 25%, 50%, 75%, 100%)
          ctx.font = '10px "Consolas", monospace';
          ctx.textBaseline = 'middle';
          [0, 0.25, 0.5, 0.75, 1].forEach((val) => {
            const y = padT + (1 - val) * plotH;
            ctx.strokeStyle = val === 0 ? '#bac9c2' : '#e6ede9';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
            ctx.stroke();

            ctx.fillStyle = '#53665f';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round(val * 100)}%`, padL - 6, y);
          });

          const fMin = Math.max(25, refF0 * 0.45);
          const fMax = Math.min(sampleRate / 2 - 100, refF0 * 8.65);
          const fToX = (f: number) => padL + ((f - fMin) / Math.max(1, fMax - fMin)) * plotW;

          // Continuous live FFT curve backdrop (linear-harmonic axis)
          if (analyser && spectrum && hasLiveSignal) {
            const binWidth = sampleRate / 2 / spectrum.length;
            const minDb = analyser.minDecibels;
            const maxDb = analyser.maxDecibels;

            ctx.beginPath();
            ctx.moveTo(padL, padT + plotH);
            for (let px = 0; px <= plotW; px += 2) {
              const freq = fMin + (px / plotW) * (fMax - fMin);
              const bin = Math.min(spectrum.length - 1, Math.max(1, Math.round(freq / binWidth)));
              const db = Math.max(
                spectrum[bin] ?? minDb,
                spectrum[Math.max(0, bin - 1)] ?? minDb,
                spectrum[Math.min(spectrum.length - 1, bin + 1)] ?? minDb
              );
              const dbNorm = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));
              const ampNorm = dbNorm > 0.08 ? Math.pow(dbNorm, 1.35) : 0;
              ctx.lineTo(padL + px, padT + (1 - ampNorm) * plotH);
            }
            ctx.lineTo(padL + plotW, padT + plotH);
            ctx.closePath();
            ctx.fillStyle = 'rgba(184, 93, 43, 0.10)';
            ctx.fill();
          }

          // Paired bars at f₁..8f₁: Target Fourier Slider vs Live Measured FFT
          const barSlotW = Math.max(14, Math.min(34, plotW / 12));
          const halfW = barSlotW * 0.44;

          for (let idx = 0; idx < 8; idx++) {
            const n = idx + 1;
            const hf = refF0 * n;
            if (hf > fMax) break;
            const cx = fToX(hf);

            const targetAmp = effectiveAmplitudes[idx] ?? 0;
            const liveAmp = Math.min(1, measured[idx] ?? 0);
            const peakAmp = Math.min(1, peakHoldRef.current[idx] ?? 0);

            // Target manual harmonic bar (left, forest green)
            const tH = targetAmp * plotH;
            ctx.fillStyle = enabledBands[idx] ? '#0d4a3e' : '#cbd5e1';
            ctx.fillRect(cx - halfW - 1, padT + plotH - tH, halfW, tH);

            // Live measured harmonic bar (right, copper)
            const lH = liveAmp * plotH;
            ctx.fillStyle = 'rgba(184, 93, 43, 0.85)';
            ctx.fillRect(cx + 1, padT + plotH - lH, halfW, lH);

            // Peak hold tick above live bar
            if (peakAmp > 0.04) {
              const py = padT + (1 - peakAmp) * plotH;
              ctx.strokeStyle = '#b85d2b';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cx + 1, py);
              ctx.lineTo(cx + 1 + halfW, py);
              ctx.stroke();
            }

            // Bottom labels: n·f₀ & Hz
            ctx.fillStyle = '#13221d';
            ctx.font = '700 10px "Consolas", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(n === 1 ? 'f₁' : `${n}f₁`, cx, padT + plotH + 6);

            ctx.fillStyle = '#53665f';
            ctx.font = '500 9px "Consolas", monospace';
            ctx.fillText(`${Math.round(hf)}`, cx, padT + plotH + 19);
          }

          // Top Legend inside canvas
          ctx.font = '600 10px "Segoe UI", sans-serif';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#0d4a3e';
          ctx.fillRect(padL, 8, 10, 8);
          ctx.fillStyle = '#13221d';
          ctx.fillText('Țintă manuală (glisoare)', padL + 15, 12);

          ctx.fillStyle = '#b85d2b';
          ctx.fillRect(padL + 155, 8, 10, 8);
          ctx.fillStyle = '#13221d';
          ctx.fillText('Descompunere live FFT', padL + 170, 12);

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, [activeFrequency, effectiveAmplitudes, enabledBands]);

  // Draw Canvas 2: Fourier Series Time-Domain Waveform Reconstruction
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = 230;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const padL = 36;
    const padR = 14;
    const padT = 26;
    const padB = 34;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const cy = padT + plotH / 2;

    ctx.fillStyle = '#fafcfa';
    ctx.fillRect(0, 0, w, h);

    // Center zero line and subtle amplitude grid
    ctx.strokeStyle = '#bac9c2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, cy);
    ctx.lineTo(padL + plotW, cy);
    ctx.stroke();

    [0.5, -0.5].forEach((lvl) => {
      const y = cy - lvl * (plotH * 0.44);
      ctx.strokeStyle = '#e6ede9';
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
    });

    // Vertical cycle dividers (0, T₀, 2T₀)
    [0, 0.5, 1].forEach((frac, idx) => {
      const x = padL + frac * plotW;
      ctx.strokeStyle = idx === 0 ? '#bac9c2' : '#dce6e1';
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#53665f';
      ctx.font = '500 10px "Consolas", monospace';
      ctx.textAlign = idx === 2 ? 'right' : idx === 0 ? 'left' : 'center';
      ctx.textBaseline = 'top';
      const periodMs = (1000 / Math.max(20, activeFrequency)) * idx;
      ctx.fillText(idx === 0 ? '0' : `${idx}T₀ (${periodMs.toFixed(1)} ms)`, x, padT + plotH + 8);
    });

    // Compute normalization peak across 2 periods so composite wave always fits comfortably
    const samples = 280;
    const composite = new Float32Array(samples + 1);
    let maxAbs = 0.01;
    for (let i = 0; i <= samples; i++) {
      const phase = (i / samples) * Math.PI * 4; // 2 full periods (0 .. 4pi)
      let yVal = 0;
      for (let idx = 0; idx < 8; idx++) {
        const a = effectiveAmplitudes[idx];
        if (a <= 0.001) continue;
        yVal += a * Math.sin((idx + 1) * phase);
      }
      composite[i] = yVal;
      if (Math.abs(yVal) > maxAbs) maxAbs = Math.abs(yVal);
    }
    const scaleY = (plotH * 0.43) / Math.max(1, maxAbs);

    // Optional individual sine components
    if (showComponents) {
      effectiveAmplitudes.forEach((amp, idx) => {
        if (amp <= 0.01) return;
        const n = idx + 1;
        ctx.strokeStyle = 'rgba(13, 74, 62, 0.24)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const phase = (i / samples) * Math.PI * 4;
          const px = padL + (i / samples) * plotW;
          const py = cy - amp * Math.sin(n * phase) * scaleY;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
    }

    // Composite Fourier sum wave
    ctx.strokeStyle = '#b85d2b';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const px = padL + (i / samples) * plotW;
      const py = cy - composite[i] * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Top label
    ctx.fillStyle = '#13221d';
    ctx.font = '600 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Forma de undă sintetizată (2 perioade 2T₀)', padL, 12);

    ctx.restore();
  }, [activeFrequency, effectiveAmplitudes, showComponents]);

  // Quantitative timbre metrics derived from the 8 Fourier coefficients
  const timbreMetrics = useMemo(() => {
    const sumAmp = effectiveAmplitudes.reduce((acc, a) => acc + a, 0);
    if (sumAmp <= 0.001) {
      return {
        centroidOrder: 0,
        centroidHz: 0,
        harmonicRatioPct: 0,
        character: 'Fără semnal (toate benzile la 0)',
      };
    }

    const weightedOrder =
      effectiveAmplitudes.reduce((acc, a, idx) => acc + a * (idx + 1), 0) / sumAmp;
    const centroidHz = weightedOrder * activeFrequency;

    const totalEnergy = effectiveAmplitudes.reduce((acc, a) => acc + a * a, 0);
    const upperEnergy = effectiveAmplitudes.slice(1).reduce((acc, a) => acc + a * a, 0);
    const harmonicRatioPct = totalEnergy > 0 ? Math.sqrt(upperEnergy / totalEnergy) * 100 : 0;

    const oddSum = effectiveAmplitudes.filter((_, idx) => idx % 2 === 0).reduce((a, b) => a + b, 0);
    const evenSum = effectiveAmplitudes.filter((_, idx) => idx % 2 === 1).reduce((a, b) => a + b, 0);

    let character = 'Echilibrat (timbru acustic)';
    if (harmonicRatioPct < 8) {
      character = 'Ton pur sinusoidal (doar f₁)';
    } else if (oddSum > evenSum * 2.6 && effectiveAmplitudes[2] > 0.15) {
      character = 'Gol / clarinet (dominat de impare)';
    } else if (weightedOrder >= 3.1 || harmonicRatioPct > 65) {
      character = 'Strălucitor, tăios (bogat în înalte)';
    } else if (weightedOrder < 1.85) {
      character = 'Cald, rotund (predomină joasele)';
    }

    return {
      centroidOrder: weightedOrder,
      centroidHz,
      harmonicRatioPct,
      character,
    };
  }, [effectiveAmplitudes, activeFrequency]);

  const fourierFormula = useMemo(() => {
    const terms: string[] = [];
    effectiveAmplitudes.forEach((a, idx) => {
      if (a <= 0.01) return;
      const n = idx + 1;
      terms.push(`${a.toFixed(2)}·sin(${n === 1 ? '' : n}ωt)`);
    });
    if (terms.length === 0) return 'y(t) = 0';
    return `y(t) = ${terms.join(' + ')}`;
  }, [effectiveAmplitudes]);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AudioWaveform className="w-4 h-4 text-[#0d4a3e]" />
            <h3 className="text-sm font-semibold text-[#13221d]">
              Analizor de Armonice: Descompunere și Sinteză Fourier (n = 1…8)
            </h3>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Analizează în timp real spectrul notei active ({noteLabel} ·{' '}
            <span className="font-mono tabular-nums">{activeFrequency.toFixed(1)} Hz</span>) și ajustează manual
            amplitudinea primelor 8 armonice pentru a modela timbrul chitarei.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePlaySynthesis}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Audiază sinteza</span>
          </button>

          <button
            type="button"
            onClick={toggleDrone}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              droneActive
                ? 'bg-[#b85d2b] text-white border-[#b85d2b]'
                : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
            }`}
          >
            {droneActive ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#0d4a3e]" />}
            <span>{droneActive ? 'Oprește sunet continuu' : 'Sunet continuu (Live)'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleUseCustomHarmonics(!useCustomHarmonics)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              useCustomHarmonics
                ? 'bg-[#edf3f0] text-[#0d4a3e] border-[#0d4a3e]/40'
                : 'bg-[#fafcfa] text-[#53665f] border-[#d8e2dc] hover:text-[#13221d]'
            }`}
            title="Când este activ, ciupirea corzilor de pe chitară folosește profilul tău cu 8 armonice"
          >
            {useCustomHarmonics ? 'Ciupirea folosește profilul (Activ)' : 'Aplică profilul la ciupire'}
          </button>

          <button
            type="button"
            onClick={handleCaptureLiveToSliders}
            className="px-2.5 py-1.5 rounded-lg border border-[#d8e2dc] bg-white hover:bg-[#edf3f0] text-xs font-medium text-[#13221d] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copiază amplitudinile măsurate din ultimul sunet real în glisoare"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0d4a3e]" />
            <span>Preia din sunet live</span>
          </button>
        </div>
      </div>

      {captureNotice && (
        <div className="rounded-lg border border-[#d8e2dc] bg-[#edf3f0] px-3.5 py-2 text-xs font-medium text-[#0d4a3e]">
          {captureNotice}
        </div>
      )}

      {/* 4-KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">FUNDAMENTALĂ (f₁)</div>
          <div className="text-sm font-bold font-mono text-[#13221d] tabular-nums mt-0.5">
            {(liveDetectedF0 ?? activeFrequency).toFixed(1)} Hz
          </div>
          <div className="text-[10.5px] text-[#53665f] font-mono tabular-nums">
            {liveDetectedF0 ? 'detectat live FFT' : `țintă ${noteLabel}`}
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">CENTROID SPECTRAL</div>
          <div className="text-sm font-bold font-mono text-[#0d4a3e] tabular-nums mt-0.5">
            {timbreMetrics.centroidHz.toFixed(0)} Hz
          </div>
          <div className="text-[10.5px] text-[#53665f] font-mono tabular-nums">
            ordin mediu {timbreMetrics.centroidOrder.toFixed(2)}×f₁
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">PONDERE ARMONICE (n ≥ 2)</div>
          <div className="text-sm font-bold font-mono text-[#b85d2b] tabular-nums mt-0.5">
            {timbreMetrics.harmonicRatioPct.toFixed(1)}%
          </div>
          <div className="text-[10.5px] text-[#53665f]">din energia totală a seriei</div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">CARACTER TIMBRAL</div>
          <div className="text-xs font-bold text-[#13221d] mt-1 leading-snug">{timbreMetrics.character}</div>
        </div>
      </div>

      {/* Presets Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'guitar_standard', label: 'Chitară standard (p=0.22)' },
              { id: 'guitar_bridge', label: 'Lângă căluș (tăios)' },
              { id: 'guitar_sweet', label: 'Deasupra rozetei (cald)' },
              { id: 'odd_only', label: 'Doar armonice impare' },
              { id: 'sawtooth', label: 'Dinte de fierăstrău (1/n)' },
              { id: 'pure_sine', label: 'Ton pur (doar f₁)' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                presetId === p.id
                  ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                  : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 text-xs text-[#53665f] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showComponents}
            onChange={(e) => setShowComponents(e.target.checked)}
            className="accent-[#0d4a3e]"
          />
          <span>Arată sinusoidele individuale</span>
        </label>
      </div>

      {/* Dual Real-Time Canvases: Spectral Decomposition + Fourier Waveform */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#d8e2dc] bg-[#fafcfa] overflow-hidden">
          <canvas ref={spectrumCanvasRef} className="w-full h-[230px] block" />
        </div>
        <div className="rounded-lg border border-[#d8e2dc] bg-[#fafcfa] overflow-hidden">
          <canvas ref={waveCanvasRef} className="w-full h-[230px] block" />
        </div>
      </div>

      {/* Dynamic Fourier Series Formula Readout */}
      <div className="rounded-lg border border-[#e3ebe6] bg-[#edf3f0]/55 px-3.5 py-2 text-xs font-mono text-[#13221d] overflow-x-auto whitespace-nowrap">
        {fourierFormula}
      </div>

      {/* 8 Manual Harmonic Sliders Console */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {customHarmonics.slice(0, 8).map((amp, idx) => {
          const n = idx + 1;
          const isOn = enabledBands[idx];
          const eff = isOn ? amp : 0;
          const freq = activeFrequency * n;
          const liveVal = liveMeasured[idx] ?? 0;

          return (
            <div
              key={n}
              className={`rounded-lg border p-2.5 space-y-2 transition-colors ${
                isOn ? 'border-[#d8e2dc] bg-[#fafcfa]' : 'border-[#e3ebe6] bg-[#f5f7f5] opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold text-[#0d4a3e]">{n === 1 ? '1·f₁' : `${n}·f₁`}</span>
                <button
                  type="button"
                  onClick={() => toggleBand(idx)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                    isOn
                      ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                      : 'bg-white text-[#53665f] border-[#d8e2dc]'
                  }`}
                  title={HARMONIC_INTERVALS[idx]}
                >
                  {isOn ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="text-[10.5px] text-[#53665f] leading-tight">
                <div className="font-mono font-semibold text-[#13221d] tabular-nums">{freq.toFixed(0)} Hz</div>
                <div className="truncate">{HARMONIC_SHORT_INTERVALS[idx]}</div>
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={amp}
                onChange={(e) => handleBandSlider(idx, Number(e.target.value))}
                className="lab-slider w-full"
                aria-label={`Amplitudine armonica ${n}`}
              />

              {/* Live measured FFT bar indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                  <span className="font-bold text-[#13221d]">{Math.round(eff * 100)}%</span>
                  <span className="text-[#b85d2b]">live {Math.round(liveVal * 100)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-sm bg-[#e3ebe6] overflow-hidden">
                  <div
                    className="h-full bg-[#b85d2b] transition-[width] duration-75"
                    style={{ width: `${Math.min(100, Math.round(liveVal * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

