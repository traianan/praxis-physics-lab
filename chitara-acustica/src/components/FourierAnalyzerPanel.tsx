import React, { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { NotationSystem } from '../types/guitar';
import { formatNoteName, frequencyToNote, midiToFrequency } from '../utils/musicTheory';

type ViewMode = 'spectrum' | 'waveform' | 'spectrogram' | 'all';

type SpectrumSnapshot = {
  capturedAt: string;
  sampleRate: number;
  fftSize: number;
  binWidth: number;
  spectrumDb: Float32Array;
  waveform: Float32Array | null;
  detected: {
    noteLabel: string;
    freq: number;
    cents: number;
  } | null;
};

type FourierAnalyzerPanelProps = {
  notation: NotationSystem;
  expectedFundamental?: number | null;
  title?: string;
  subtitle?: string;
  defaultView?: ViewMode;
  compact?: boolean;
};

export const FourierAnalyzerPanel: React.FC<FourierAnalyzerPanelProps> = ({
  notation,
  expectedFundamental = null,
  title = 'Spectrul Fourier și analiza în timp real',
  subtitle = 'Axă logaritmică de frecvență (55 Hz – 4000 Hz) · FFT 4096 eșantioane',
  defaultView = 'spectrum',
  compact = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [detected, setDetected] = useState<{
    noteLabel: string;
    freq: number;
    cents: number;
  } | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPitchUpdateRef = useRef(0);
  const lastActiveSnapshotRef = useRef<SpectrumSnapshot | null>(null);
  const exportTimerRef = useRef<number | null>(null);

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    if (exportTimerRef.current !== null) {
      window.clearTimeout(exportTimerRef.current);
    }
    exportTimerRef.current = window.setTimeout(() => {
      setExportNotice(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (exportTimerRef.current !== null) {
        window.clearTimeout(exportTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let rafId = 0;

    const minF = 55;
    const maxF = 4000;

    const freqToX = (f: number, w: number) => {
      const clamped = Math.max(minF, Math.min(maxF, f));
      return (Math.log2(clamped / minF) / Math.log2(maxF / minF)) * w;
    };

    const renderFrame = (now: number) => {
      const analyser = audioEngine.getAnalyser();
      const spectrum = audioEngine.getSpectrumData();
      const timeData = audioEngine.getTimeDomainData();
      const sampleRate = audioEngine.getSampleRate();

      // Update pitch readout ~10 times/sec and cache latest active FFT snapshot
      if (now - lastPitchUpdateRef.current > 90) {
        lastPitchUpdateRef.current = now;
        const pitch = audioEngine.detectFundamental();
        if (pitch) {
          const pc = ((pitch.note.midi % 12) + 12) % 12;
          const noteLabel = `${formatNoteName(pc, notation)}${pitch.note.octave}`;
          const nextDetected = {
            noteLabel,
            freq: pitch.frequency,
            cents: pitch.note.cents,
          };
          setDetected(nextDetected);

          if (spectrum && analyser && pitch.peakDb > -78) {
            lastActiveSnapshotRef.current = {
              capturedAt: new Date().toISOString(),
              sampleRate,
              fftSize: analyser.fftSize,
              binWidth: sampleRate / 2 / spectrum.length,
              spectrumDb: new Float32Array(spectrum),
              waveform: timeData ? new Float32Array(timeData) : null,
              detected: nextDetected,
            };
          }
        } else if (spectrum && analyser) {
          // Also capture non-silent broadband signal even if pitch is ambiguous (e.g. chords)
          let peakDb = -Infinity;
          for (let i = 2; i < spectrum.length; i++) {
            if (spectrum[i] > peakDb) peakDb = spectrum[i];
          }
          if (peakDb > -74) {
            lastActiveSnapshotRef.current = {
              capturedAt: new Date().toISOString(),
              sampleRate,
              fftSize: analyser.fftSize,
              binWidth: sampleRate / 2 / spectrum.length,
              spectrumDb: new Float32Array(spectrum),
              waveform: timeData ? new Float32Array(timeData) : null,
              detected: null,
            };
          }
        }
      }

      // 1. Spectrum Canvas
      const specCanvas = spectrumCanvasRef.current;
      if (specCanvas && (viewMode === 'spectrum' || viewMode === 'all')) {
        const dpr = window.devicePixelRatio || 1;
        const rect = specCanvas.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = compact ? 190 : 240;
        if (specCanvas.width !== Math.floor(w * dpr) || specCanvas.height !== Math.floor(h * dpr)) {
          specCanvas.width = Math.floor(w * dpr);
          specCanvas.height = Math.floor(h * dpr);
        }

        const ctx = specCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);

          const padL = 42;
          const padR = 14;
          const padT = 22;
          const padB = 26;
          const plotW = w - padL - padR;
          const plotH = h - padT - padB;

          ctx.fillStyle = '#fcfdfc';
          ctx.fillRect(0, 0, w, h);

          // dB horizontal grid (-100 to -20 dB)
          ctx.strokeStyle = '#e6ede9';
          ctx.lineWidth = 1;
          ctx.font = '500 10px "Consolas", monospace';
          ctx.fillStyle = '#6c7e77';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';

          [-20, -40, -60, -80, -100].forEach((db) => {
            const norm = (db - -100) / (-20 - -100);
            const y = padT + plotH * (1 - norm);
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
            ctx.stroke();
            ctx.fillText(`${db}`, padL - 6, y);
          });

          // Musical note vertical grid (A1=55, A2=110, A3=220, A4=440, A5=880, A6=1760, etc.)
          for (let midi = 33; midi <= 105; midi++) {
            const f = midiToFrequency(midi);
            if (f < minF || f > maxF) continue;
            const x = padL + freqToX(f, plotW);
            const isA = midi % 12 === 9;
            const isE = midi % 12 === 4;
            if (isA || isE) {
              ctx.strokeStyle = isA ? 'rgba(13, 74, 62, 0.20)' : 'rgba(148, 163, 184, 0.22)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x, padT);
              ctx.lineTo(x, padT + plotH);
              ctx.stroke();

              if (isA) {
                const oct = Math.floor(midi / 12) - 1;
                ctx.fillStyle = '#53665f';
                ctx.font = '500 10px "Consolas", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${formatNoteName(9, notation)}${oct}`, x, padT + plotH + 14);
              }
            }
          }

          // Expected harmonic dashed lines (f0, 2f0, 3f0...)
          const fRef = expectedFundamental ?? detected?.freq ?? null;
          if (fRef && fRef >= minF && fRef <= maxF) {
            for (let k = 1; k <= 6; k++) {
              const hf = fRef * k;
              if (hf > maxF) break;
              const hx = padL + freqToX(hf, plotW);
              ctx.save();
              ctx.setLineDash([3, 3]);
              ctx.strokeStyle = k === 1 ? 'rgba(184, 93, 43, 0.7)' : 'rgba(83, 102, 95, 0.45)';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(hx, padT);
              ctx.lineTo(hx, padT + plotH);
              ctx.stroke();
              ctx.restore();

              ctx.fillStyle = k === 1 ? '#b85d2b' : '#53665f';
              ctx.font = '600 10px "Consolas", monospace';
              ctx.textAlign = 'left';
              ctx.fillText(k === 1 ? 'f₀' : `${k}f₀`, hx + 3, padT + 10);
            }
          }

          // Draw live FFT curve
          if (spectrum && analyser) {
            const nyquist = sampleRate / 2;
            const binWidth = nyquist / spectrum.length;
            const minDb = analyser.minDecibels;
            const maxDb = analyser.maxDecibels;

            ctx.beginPath();
            ctx.moveTo(padL, padT + plotH);
            let started = false;

            for (let px = 0; px <= plotW; px += 2) {
              const freq = minF * Math.pow(maxF / minF, px / plotW);
              const bin = Math.min(spectrum.length - 1, Math.max(1, Math.round(freq / binWidth)));
              // Local peak around bin for crisp display
              const db = Math.max(
                spectrum[bin] ?? minDb,
                spectrum[Math.max(0, bin - 1)] ?? minDb,
                spectrum[Math.min(spectrum.length - 1, bin + 1)] ?? minDb
              );
              const norm = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));
              const y = padT + plotH * (1 - norm);
              if (!started) {
                ctx.lineTo(padL + px, y);
                started = true;
              } else {
                ctx.lineTo(padL + px, y);
              }
            }

            ctx.lineTo(padL + plotW, padT + plotH);
            ctx.closePath();
            ctx.fillStyle = 'rgba(184, 93, 43, 0.14)';
            ctx.fill();

            // Stroke top line cleanly
            ctx.beginPath();
            for (let px = 0; px <= plotW; px += 2) {
              const freq = minF * Math.pow(maxF / minF, px / plotW);
              const bin = Math.min(spectrum.length - 1, Math.max(1, Math.round(freq / binWidth)));
              const db = Math.max(
                spectrum[bin] ?? minDb,
                spectrum[Math.max(0, bin - 1)] ?? minDb,
                spectrum[Math.min(spectrum.length - 1, bin + 1)] ?? minDb
              );
              const norm = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));
              const y = padT + plotH * (1 - norm);
              if (px === 0) ctx.moveTo(padL + px, y);
              else ctx.lineTo(padL + px, y);
            }
            ctx.strokeStyle = '#b85d2b';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Plot frame border
          ctx.strokeStyle = '#d8e2dc';
          ctx.lineWidth = 1;
          ctx.strokeRect(padL, padT, plotW, plotH);

          ctx.fillStyle = '#53665f';
          ctx.font = '500 10px "Segoe UI", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('scară dB · axă logaritmică Hz', padL + plotW, 12);

          ctx.restore();
        }
      }

      // 2. Time-domain Waveform Canvas
      const waveCanvas = waveCanvasRef.current;
      if (waveCanvas && (viewMode === 'waveform' || viewMode === 'all')) {
        const dpr = window.devicePixelRatio || 1;
        const rect = waveCanvas.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = compact ? 150 : 190;
        if (waveCanvas.width !== Math.floor(w * dpr) || waveCanvas.height !== Math.floor(h * dpr)) {
          waveCanvas.width = Math.floor(w * dpr);
          waveCanvas.height = Math.floor(h * dpr);
        }

        const ctx = waveCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.fillStyle = '#fcfdfc';
          ctx.fillRect(0, 0, w, h);

          // Center axis
          ctx.strokeStyle = '#d8e2dc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();

          if (timeData) {
            // Find rising zero-crossing trigger for stable waveform display
            let trigger = 0;
            for (let i = 1; i < timeData.length / 2; i++) {
              if (timeData[i - 1] < 0 && timeData[i] >= 0) {
                trigger = i;
                break;
              }
            }
            const samplesToShow = Math.min(1024, timeData.length - trigger);
            ctx.beginPath();
            for (let i = 0; i < samplesToShow; i++) {
              const x = (i / (samplesToShow - 1)) * w;
              const y = h / 2 - timeData[trigger + i] * (h * 0.44);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#0d4a3e';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.strokeStyle = '#d8e2dc';
          ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
          ctx.restore();
        }
      }

      // 3. Scrolling Waterfall Spectrogram Canvas
      const spectroCanvas = spectroCanvasRef.current;
      if (spectroCanvas && (viewMode === 'spectrogram' || viewMode === 'all')) {
        const rect = spectroCanvas.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = compact ? 150 : 190;
        if (spectroCanvas.width !== w || spectroCanvas.height !== h) {
          spectroCanvas.width = w;
          spectroCanvas.height = h;
          const initCtx = spectroCanvas.getContext('2d');
          if (initCtx) {
            initCtx.fillStyle = '#0c1f1a';
            initCtx.fillRect(0, 0, w, h);
          }
        }

        const ctx = spectroCanvas.getContext('2d');
        if (ctx && spectrum && analyser) {
          // Shift image 2px left
          ctx.drawImage(spectroCanvas, -2, 0);
          ctx.fillStyle = '#0c1f1a';
          ctx.fillRect(w - 2, 0, 2, h);

          const nyquist = sampleRate / 2;
          const binWidth = nyquist / spectrum.length;
          const minDb = analyser.minDecibels;
          const maxDb = analyser.maxDecibels;

          for (let py = 0; py < h; py++) {
            // Top = maxF (4000Hz), Bottom = minF (55Hz) logarithmic
            const frac = 1 - py / h;
            const freq = minF * Math.pow(maxF / minF, frac);
            const bin = Math.min(spectrum.length - 1, Math.max(1, Math.round(freq / binWidth)));
            const db = spectrum[bin] ?? minDb;
            const norm = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));

            if (norm > 0.08) {
              // Deep forest -> copper -> warm amber gradient
              const r = Math.round(12 + norm * 225);
              const g = Math.round(31 + norm * 120);
              const b = Math.round(26 + (1 - norm) * 40);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(w - 2, py, 2, 1);
            }
          }
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [viewMode, notation, expectedFundamental, compact]);

  const getExportSnapshot = (): { snapshot: SpectrumSnapshot; fromCache: boolean } | null => {
    const analyser = audioEngine.getAnalyser();
    const liveSpectrum = audioEngine.getSpectrumData();
    const liveTime = audioEngine.getTimeDomainData();
    const sampleRate = audioEngine.getSampleRate();

    if (analyser && liveSpectrum) {
      let peakDb = -Infinity;
      for (let i = 1; i < liveSpectrum.length; i++) {
        if (Number.isFinite(liveSpectrum[i]) && liveSpectrum[i] > peakDb) {
          peakDb = liveSpectrum[i];
        }
      }
      if (peakDb > -82) {
        const pitch = audioEngine.detectFundamental();
        const pitchInfo = pitch
          ? {
              noteLabel: `${formatNoteName(((pitch.note.midi % 12) + 12) % 12, notation)}${pitch.note.octave}`,
              freq: pitch.frequency,
              cents: pitch.note.cents,
            }
          : detected;

        return {
          snapshot: {
            capturedAt: new Date().toISOString(),
            sampleRate,
            fftSize: analyser.fftSize,
            binWidth: sampleRate / 2 / liveSpectrum.length,
            spectrumDb: new Float32Array(liveSpectrum),
            waveform: liveTime ? new Float32Array(liveTime) : null,
            detected: pitchInfo,
          },
          fromCache: false,
        };
      }
    }

    if (lastActiveSnapshotRef.current) {
      return { snapshot: lastActiveSnapshotRef.current, fromCache: true };
    }

    return null;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildFileSlug = (snap: SpectrumSnapshot) => {
    const notePart = snap.detected?.noteLabel
      ? snap.detected.noteLabel.replace('#', 'sharp')
      : expectedFundamental
      ? `${Math.round(expectedFundamental)}Hz`
      : 'semnal';
    const timePart = snap.capturedAt.slice(11, 19).replace(/:/g, '-');
    return `spectru_fourier_${notePart}_${timePart}`;
  };

  const handleExportCsv = () => {
    const res = getExportSnapshot();
    if (!res) {
      showNotice('Redă mai întâi un sunet sau pornește microfonul pentru a captura spectrul.');
      return;
    }
    const { snapshot, fromCache } = res;
    const maxExportFreq = 5000;
    const maxBin = Math.min(
      snapshot.spectrumDb.length - 1,
      Math.ceil(maxExportFreq / snapshot.binWidth)
    );

    const lines: string[] = [
      'bin_index,frequency_hz,magnitude_db,normalized_amplitude,nearest_note',
    ];

    for (let i = 1; i <= maxBin; i++) {
      const freq = i * snapshot.binWidth;
      const rawDb = snapshot.spectrumDb[i];
      const db = Number.isFinite(rawDb) ? rawDb : -120;
      const norm = Math.max(0, Math.min(1, (db - -100) / (-20 - -100)));
      const note = freq >= 25 ? frequencyToNote(freq) : null;
      const noteName = note
        ? `${formatNoteName(((note.midi % 12) + 12) % 12, notation)}${note.octave}`
        : '';
      lines.push(`${i},${freq.toFixed(2)},${db.toFixed(2)},${norm.toFixed(4)},${noteName}`);
    }

    const filename = `${buildFileSlug(snapshot)}.csv`;
    downloadFile('\uFEFF' + lines.join('\n'), filename, 'text/csv;charset=utf-8;');
    showNotice(
      fromCache
        ? `Exportat ultimul spectru activ: ${filename}`
        : `Exportat spectrul curent: ${filename}`
    );
  };

  const handleExportJson = () => {
    const res = getExportSnapshot();
    if (!res) {
      showNotice('Redă mai întâi un sunet sau pornește microfonul pentru a captura spectrul.');
      return;
    }
    const { snapshot, fromCache } = res;
    const maxExportFreq = 5000;
    const maxBin = Math.min(
      snapshot.spectrumDb.length - 1,
      Math.ceil(maxExportFreq / snapshot.binWidth)
    );

    const spectrumBins = [];
    for (let i = 1; i <= maxBin; i++) {
      const freq = i * snapshot.binWidth;
      const rawDb = snapshot.spectrumDb[i];
      const db = Number.isFinite(rawDb) ? Number(rawDb.toFixed(2)) : -120;
      const norm = Number(Math.max(0, Math.min(1, (db - -100) / (-20 - -100))).toFixed(4));
      spectrumBins.push({
        binIndex: i,
        frequencyHz: Number(freq.toFixed(2)),
        magnitudeDb: db,
        normalizedAmplitude: norm,
      });
    }

    const fRef = snapshot.detected?.freq ?? expectedFundamental ?? null;
    const harmonicPeaks = [];
    if (fRef && fRef > 30) {
      for (let k = 1; k <= 8; k++) {
        const targetF = fRef * k;
        if (targetF > maxExportFreq) break;
        const centerBin = Math.round(targetF / snapshot.binWidth);
        let peakDb = -120;
        for (let b = Math.max(1, centerBin - 1); b <= Math.min(maxBin, centerBin + 1); b++) {
          if (Number.isFinite(snapshot.spectrumDb[b]) && snapshot.spectrumDb[b] > peakDb) {
            peakDb = snapshot.spectrumDb[b];
          }
        }
        harmonicPeaks.push({
          order: k,
          expectedFrequencyHz: Number(targetF.toFixed(2)),
          magnitudeDb: Number(peakDb.toFixed(2)),
        });
      }
    }

    const payload = {
      application: 'Chitara acustică virtuală',
      capturedAt: snapshot.capturedAt,
      captureMode: fromCache ? 'last_active_frame' : 'live_frame',
      fftParameters: {
        sampleRateHz: snapshot.sampleRate,
        fftSize: snapshot.fftSize,
        frequencyBinCount: snapshot.spectrumDb.length,
        frequencyResolutionHz: Number(snapshot.binWidth.toFixed(3)),
        exportedMaxFrequencyHz: maxExportFreq,
      },
      pitchAnalysis: {
        detectedNote: snapshot.detected?.noteLabel ?? null,
        detectedFundamentalHz: snapshot.detected ? Number(snapshot.detected.freq.toFixed(2)) : null,
        centsDeviation: snapshot.detected ? Number(snapshot.detected.cents.toFixed(1)) : null,
        expectedFundamentalHz: expectedFundamental ? Number(expectedFundamental.toFixed(2)) : null,
      },
      harmonicPeaks,
      spectrumBins,
      waveformSamples: snapshot.waveform
        ? Array.from(snapshot.waveform.slice(0, 1024), (v) => Number(v.toFixed(5)))
        : [],
    };

    const filename = `${buildFileSlug(snapshot)}.json`;
    downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json;charset=utf-8;');
    showNotice(
      fromCache
        ? `Exportat ultimul spectru activ: ${filename}`
        : `Exportat spectrul curent: ${filename}`
    );
  };

  const kpiFreq = detected ? `${detected.freq.toFixed(1)} Hz` : expectedFundamental ? `${expectedFundamental.toFixed(1)} Hz` : '—';
  const kpiNote = detected ? detected.noteLabel : 'Așteptare semnal';
  const kpiCents = detected ? `${detected.cents >= 0 ? '+' : ''}${detected.cents.toFixed(0)} sutimi` : '0 sutimi';
  const fftRes = `${(audioEngine.getSampleRate() / 4096).toFixed(2)} Hz`;

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">{title}</h3>
          <p className="text-xs text-[#53665f] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'spectrum', label: 'Spectru Fourier' },
                { id: 'waveform', label: 'Formă de undă' },
                { id: 'spectrogram', label: 'Spectrogramă' },
                { id: 'all', label: 'Toate 3' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === tab.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-semibold text-[#0d4a3e] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Descarcă datele spectrale în format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-semibold text-[#b85d2b] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Descarcă analiza spectrală completă în format JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="rounded-lg border border-[#d8e2dc] bg-[#edf3f0] px-3.5 py-2 text-xs font-medium text-[#0d4a3e]">
          {exportNotice}
        </div>
      )}

      {/* 4-column pale-mint KPI strip matching reference screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f] tracking-wide">NOTĂ DETECTATĂ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 tabular-nums truncate">{kpiNote}</div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f] tracking-wide">FUNDAMENTALĂ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{kpiFreq}</div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f] tracking-wide">DEVIAȚIE ACORDAJ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{kpiCents}</div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f] tracking-wide">REZOLUȚIE FFT</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">{fftRes}</div>
        </div>
      </div>

      {(viewMode === 'spectrum' || viewMode === 'all') && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#53665f]">
            <span className="font-medium text-[#13221d]">Spectru instantaneu (dB vs frecvență)</span>
            <span>Vârfurile indică fundamentala f₀ și armonicele nf₀</span>
          </div>
          <canvas
            ref={spectrumCanvasRef}
            className="w-full rounded-lg block"
            style={{ height: compact ? 190 : 240 }}
          />
        </div>
      )}

      {(viewMode === 'waveform' || viewMode === 'all') && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#53665f]">
            <span className="font-medium text-[#13221d]">Osciloscop — forma de undă în timp</span>
            <span>Amplitudine instantanee</span>
          </div>
          <canvas
            ref={waveCanvasRef}
            className="w-full rounded-lg block"
            style={{ height: compact ? 150 : 190 }}
          />
        </div>
      )}

      {(viewMode === 'spectrogram' || viewMode === 'all') && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#53665f]">
            <span className="font-medium text-[#13221d]">Spectrogramă derulantă (evoluție în timp)</span>
            <span>Sus: 4000 Hz · Jos: 55 Hz · Observă stingerea armonicilor înalte</span>
          </div>
          <canvas
            ref={spectroCanvasRef}
            className="w-full rounded-lg block"
            style={{ height: compact ? 150 : 190 }}
          />
        </div>
      )}
    </div>
  );
};

