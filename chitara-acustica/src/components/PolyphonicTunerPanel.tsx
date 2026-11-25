import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Mic, MicOff, Play, Radar, RotateCcw } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { NotationSystem, StringState } from '../types/guitar';
import { formatMidiLabel } from '../utils/musicTheory';

type PolyphonicTunerPanelProps = {
  strings: StringState[];
  notation: NotationSystem;
};

type StringScanResult = {
  stringId: number;
  label: string;
  targetFreq: number;
  detectedFreq: number | null;
  cents: number | null;
  peakDb: number;
  detected: boolean;
};

const SCAN_DURATION_MS = 1800;
const IN_TUNE_TOLERANCE_CENTS = 8;

export const PolyphonicTunerPanel: React.FC<PolyphonicTunerPanelProps> = ({
  strings,
  notation,
}) => {
  const orderedStrings = useMemo(() => strings.slice().reverse(), [strings]); // 6 (low) -> 1 (high)

  const initialResults = useMemo<StringScanResult[]>(
    () =>
      orderedStrings.map((s) => ({
        stringId: s.id,
        label: formatMidiLabel(s.openMidi, notation),
        targetFreq: s.openFrequency,
        detectedFreq: null,
        cents: null,
        peakDb: -105,
        detected: false,
      })),
    [orderedStrings, notation]
  );

  const [mode, setMode] = useState<'scan' | 'live'>('scan');
  const [micActive, setMicActive] = useState<boolean>(() => audioEngine.isMicrophoneActive());
  const [micError, setMicError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [simulateDetune, setSimulateDetune] = useState<boolean>(false);
  const [results, setResults] = useState<StringScanResult[]>(initialResults);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peakHoldMapRef = useRef<Record<number, StringScanResult>>({});
  const snapshotSpectrumRef = useRef<Float32Array | null>(null);
  const scanStartRef = useRef<number>(0);
  const lastUiSyncRef = useRef<number>(0);

  // Reset results when tuning/notation changes
  useEffect(() => {
    setResults(initialResults);
    peakHoldMapRef.current = {};
  }, [initialResults]);

  const toggleMicrophone = async () => {
    setMicError(null);
    if (micActive) {
      await audioEngine.stopMicrophone();
      setMicActive(false);
    } else {
      try {
        await audioEngine.startMicrophone();
        setMicActive(true);
      } catch {
        setMicError('Accesul la microfon a fost refuzat sau indisponibil.');
        setMicActive(false);
      }
    }
  };

  const beginSingleScan = () => {
    audioEngine.ensureContext();
    peakHoldMapRef.current = {};
    snapshotSpectrumRef.current = null;
    scanStartRef.current = performance.now();
    setMode('scan');
    setIsScanning(true);
    setScanProgress(0);
    setResults(initialResults);
  };

  const runVirtualStrumTest = () => {
    beginSingleScan();
    // Apply slight realistic detuning on strings 5 and 2 if simulateDetune is enabled
    const detuneCentsMap: Record<number, number> = simulateDetune
      ? { 6: -2, 5: -22, 4: 3, 3: 1, 2: +19, 1: -3 }
      : { 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const freqs = orderedStrings.map((s) => {
      const shift = detuneCentsMap[s.id] ?? 0;
      return s.openFrequency * Math.pow(2, shift / 12);
    });
    audioEngine.playChord(freqs, 45, { method: 'karplus', duration: 2.8 });
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    peakHoldMapRef.current = {};
    snapshotSpectrumRef.current = null;
    setResults(initialResults);
  };

  // Main FFT detection & Canvas rendering loop
  useEffect(() => {
    let rafId = 0;

    const minF = 60;
    const maxF = 430;

    const freqToX = (f: number, w: number) => {
      const clamped = Math.max(minF, Math.min(maxF, f));
      return (Math.log2(clamped / minF) / Math.log2(maxF / minF)) * w;
    };

    const tick = (now: number) => {
      const targets = orderedStrings.map((s) => ({
        stringId: s.id,
        targetFreq: s.openFrequency,
      }));

      if (mode === 'live' || isScanning) {
        const liveDetections = audioEngine.detectPolyphonicStrings(targets, -74);
        const polySpec = audioEngine.getPolySpectrumData();

        if (isScanning) {
          const elapsed = now - scanStartRef.current;
          const progress = Math.min(1, elapsed / SCAN_DURATION_MS);
          setScanProgress(Math.round(progress * 100));

          // Accumulate highest-energy spectral peak per string over the strum window
          liveDetections.forEach((det) => {
            const sObj = orderedStrings.find((s) => s.id === det.stringId)!;
            const prev = peakHoldMapRef.current[det.stringId];
            if (det.detected && (!prev || !prev.detected || det.peakDb > prev.peakDb)) {
              peakHoldMapRef.current[det.stringId] = {
                stringId: det.stringId,
                label: formatMidiLabel(sObj.openMidi, notation),
                targetFreq: det.targetFreq,
                detectedFreq: det.detectedFreq,
                cents: det.cents,
                peakDb: det.peakDb,
                detected: true,
              };
            } else if (!prev) {
              peakHoldMapRef.current[det.stringId] = {
                stringId: det.stringId,
                label: formatMidiLabel(sObj.openMidi, notation),
                targetFreq: det.targetFreq,
                detectedFreq: null,
                cents: null,
                peakDb: det.peakDb,
                detected: false,
              };
            }
          });

          // Peak-hold spectrum envelope for visual inspection after scan ends
          if (polySpec) {
            if (!snapshotSpectrumRef.current || snapshotSpectrumRef.current.length !== polySpec.length) {
              snapshotSpectrumRef.current = new Float32Array(polySpec);
            } else {
              for (let i = 0; i < polySpec.length; i++) {
                if (polySpec[i] > snapshotSpectrumRef.current[i]) {
                  snapshotSpectrumRef.current[i] = polySpec[i];
                }
              }
            }
          }

          if (now - lastUiSyncRef.current > 80) {
            lastUiSyncRef.current = now;
            setResults(
              orderedStrings.map(
                (s) =>
                  peakHoldMapRef.current[s.id] ?? {
                    stringId: s.id,
                    label: formatMidiLabel(s.openMidi, notation),
                    targetFreq: s.openFrequency,
                    detectedFreq: null,
                    cents: null,
                    peakDb: -105,
                    detected: false,
                  }
              )
            );
          }

          if (elapsed >= SCAN_DURATION_MS) {
            setIsScanning(false);
            setScanProgress(100);
            setResults(
              orderedStrings.map(
                (s) =>
                  peakHoldMapRef.current[s.id] ?? {
                    stringId: s.id,
                    label: formatMidiLabel(s.openMidi, notation),
                    targetFreq: s.openFrequency,
                    detectedFreq: null,
                    cents: null,
                    peakDb: -105,
                    detected: false,
                  }
              )
            );
          }
        } else if (mode === 'live' && now - lastUiSyncRef.current > 85) {
          lastUiSyncRef.current = now;
          setResults(
            liveDetections.map((det) => {
              const sObj = orderedStrings.find((s) => s.id === det.stringId)!;
              return {
                stringId: det.stringId,
                label: formatMidiLabel(sObj.openMidi, notation),
                targetFreq: det.targetFreq,
                detectedFreq: det.detectedFreq,
                cents: det.cents,
                peakDb: det.peakDb,
                detected: det.detected,
              };
            })
          );
          if (polySpec) {
            snapshotSpectrumRef.current = polySpec;
          }
        }
      }

      // Render zoomed 60–430 Hz 16384-FFT Spectrum Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = 172;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);

          const padL = 38;
          const padR = 14;
          const padT = 22;
          const padB = 26;
          const plotW = w - padL - padR;
          const plotH = h - padT - padB;

          ctx.fillStyle = '#fcfdfc';
          ctx.fillRect(0, 0, w, h);

          // Horizontal dB lines
          [-20, -40, -60, -80, -100].forEach((db) => {
            const norm = (db - -105) / (-15 - -105);
            const y = padT + plotH * (1 - norm);
            ctx.strokeStyle = '#e6ede9';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
            ctx.stroke();

            ctx.fillStyle = '#6c7e77';
            ctx.font = '500 9.5px "Consolas", monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${db}`, padL - 5, y);
          });

          // Target string frequency bands (±75 cents)
          orderedStrings.forEach((s) => {
            const fLow = s.openFrequency * Math.pow(2, -0.75 / 12);
            const fHigh = s.openFrequency * Math.pow(2, 0.75 / 12);
            const x1 = padL + freqToX(fLow, plotW);
            const x2 = padL + freqToX(fHigh, plotW);
            const xc = padL + freqToX(s.openFrequency, plotW);

            ctx.fillStyle = 'rgba(13, 74, 62, 0.07)';
            ctx.fillRect(x1, padT, Math.max(2, x2 - x1), plotH);

            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = 'rgba(13, 74, 62, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xc, padT);
            ctx.lineTo(xc, padT + plotH);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#0d4a3e';
            ctx.font = '600 10px "Consolas", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`C${s.id}:${formatMidiLabel(s.openMidi, notation)}`, xc, padT + plotH + 14);
          });

          // Draw 16384-FFT spectrum curve (either live in live mode or peak-hold snapshot in scan mode)
          const spec = mode === 'live' ? audioEngine.getPolySpectrumData() : snapshotSpectrumRef.current;
          if (spec) {
            const binWidth = audioEngine.getPolyBinWidth();
            const minDb = -105;
            const maxDb = -15;

            ctx.beginPath();
            for (let px = 0; px <= plotW; px += 2) {
              const freq = minF * Math.pow(maxF / minF, px / plotW);
              const bin = Math.min(spec.length - 1, Math.max(1, Math.round(freq / binWidth)));
              const db = Math.max(
                spec[bin] ?? minDb,
                spec[Math.max(0, bin - 1)] ?? minDb,
                spec[Math.min(spec.length - 1, bin + 1)] ?? minDb
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

          // Mark detected string peaks
          results.forEach((r) => {
            if (!r.detected || r.detectedFreq === null || r.cents === null) return;
            const px = padL + freqToX(r.detectedFreq, plotW);
            const norm = Math.max(0, Math.min(1, (r.peakDb - -105) / (-15 - -105)));
            const py = padT + plotH * (1 - norm);
            const inTune = Math.abs(r.cents) <= IN_TUNE_TOLERANCE_CENTS;

            ctx.fillStyle = inTune ? '#0d4a3e' : '#b85d2b';
            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });

          ctx.strokeStyle = '#d8e2dc';
          ctx.lineWidth = 1;
          ctx.strokeRect(padL, padT, plotW, plotH);

          ctx.fillStyle = '#53665f';
          ctx.font = '500 10px "Segoe UI", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('Ferestre fundamentale FFT 16384 (60 Hz – 430 Hz)', padL + plotW, 12);

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mode, isScanning, orderedStrings, notation, results]);

  const detectedCount = results.filter((r) => r.detected).length;
  const inTuneCount = results.filter(
    (r) => r.detected && r.cents !== null && Math.abs(r.cents) <= IN_TUNE_TOLERANCE_CENTS
  ).length;
  const polyResHz = audioEngine.getPolyBinWidth().toFixed(2);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">
            Acordor polifonic FFT — scanare simultană a celor 6 corzi
          </h3>
          <p className="text-xs text-[#53665f] mt-0.5">
            Analizează spectrul FFT de înaltă rezoluție (16384 puncte) pentru a verifica acordajul întregii chitare dintr-o singură ciupire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            <button
              type="button"
              onClick={() => {
                setMode('scan');
                setIsScanning(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'scan' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              Scanare unică (Strum)
            </button>
            <button
              type="button"
              onClick={() => {
                audioEngine.ensureContext();
                setIsScanning(false);
                setMode('live');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'live' ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              Monitorizare continuă
            </button>
          </div>

          <button
            type="button"
            onClick={toggleMicrophone}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              micActive
                ? 'bg-[#b85d2b] hover:bg-[#9c4c20] text-white'
                : 'border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-[#13221d]'
            }`}
          >
            {micActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{micActive ? 'Microfon activ' : 'Activează microfon'}</span>
          </button>
        </div>
      </div>

      {micError && (
        <div className="rounded-lg border border-[#b85d2b]/40 bg-[#fdf3ee] px-3.5 py-2 text-xs text-[#8a3e16]">
          {micError}
        </div>
      )}

      {/* Action bar for single scan & virtual strum test */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={beginSingleScan}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>{isScanning ? `Scanare în curs (${scanProgress}%)…` : 'Pornește scanare 6 corzi (1,8 s)'}</span>
          </button>

          <button
            type="button"
            onClick={runVirtualStrumTest}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-lg border border-[#0d4a3e]/30 bg-white hover:bg-[#fafcfa] disabled:opacity-60 text-[#0d4a3e] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Testează cu strum virtual</span>
          </button>

          <button
            type="button"
            onClick={resetScan}
            title="Resetează rezultatele scanării"
            className="p-2 rounded-lg border border-[#d8e2dc] bg-white hover:bg-[#fafcfa] text-[#53665f] hover:text-[#13221d] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[#13221d] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={simulateDetune}
            onChange={(e) => setSimulateDetune(e.target.checked)}
            className="accent-[#b85d2b] w-3.5 h-3.5 rounded"
          />
          <span>Simulează corzi dezacordate (C5 și C2) la test</span>
        </label>
      </div>

      {/* 4-KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">CORZI DETECTATE</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {detectedCount} / 6
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ACORDATE (±{IN_TUNE_TOLERANCE_CENTS} sutimi)</div>
          <div className="text-base font-bold text-[#0d4a3e] mt-0.5 font-mono tabular-nums">
            {inTuneCount} / 6
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">REZOLUȚIE FFT</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {polyResHz} Hz
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">STARE SCANER</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5">
            {isScanning
              ? 'Captează corzile…'
              : mode === 'live'
              ? 'Monitorizare live'
              : detectedCount > 0
              ? 'Scanare completă'
              : 'Pregătit'}
          </div>
        </div>
      </div>

      {/* Simultaneous 6-String Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {results.map((r) => {
          const isInTune =
            r.detected && r.cents !== null && Math.abs(r.cents) <= IN_TUNE_TOLERANCE_CENTS;
          const isFlat = r.detected && r.cents !== null && r.cents < -IN_TUNE_TOLERANCE_CENTS;
          const isSharp = r.detected && r.cents !== null && r.cents > IN_TUNE_TOLERANCE_CENTS;

          const statusText = !r.detected
            ? 'Nedetectat'
            : isInTune
            ? 'Acordat'
            : isFlat
            ? 'Prea jos'
            : 'Prea sus';

          const centsPosPct =
            r.cents !== null ? Math.max(4, Math.min(96, ((r.cents + 50) / 100) * 100)) : 50;

          return (
            <div
              key={r.stringId}
              className={`rounded-xl border p-3 space-y-2 transition-colors ${
                isInTune
                  ? 'bg-[#edf3f0] border-[#0d4a3e]/40'
                  : isFlat || isSharp
                  ? 'bg-[#fdf6f2] border-[#b85d2b]/45'
                  : 'bg-[#fafcfa] border-[#d8e2dc]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#53665f]">Coarda {r.stringId}</span>
                <span className="font-bold text-[#13221d]">{r.label}</span>
              </div>

              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-[#53665f] tabular-nums">
                  Țintă: {r.targetFreq.toFixed(1)} Hz
                </div>
                <div className="text-xs font-mono font-semibold text-[#13221d] tabular-nums">
                  {r.detectedFreq ? `${r.detectedFreq.toFixed(1)} Hz` : '—'}
                </div>
              </div>

              {/* Micro cents gauge */}
              <div className="relative h-2 rounded-full bg-[#dce6e1] overflow-hidden">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#53665f]/50 -translate-x-1/2" />
                {r.detected && (
                  <div
                    className={`absolute top-0 bottom-0 w-2 rounded-full -translate-x-1/2 ${
                      isInTune ? 'bg-[#0d4a3e]' : 'bg-[#b85d2b]'
                    }`}
                    style={{ left: `${centsPosPct}%` }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span
                  className={`inline-flex items-center gap-1 ${
                    isInTune ? 'text-[#0d4a3e]' : r.detected ? 'text-[#b85d2b]' : 'text-[#53665f]'
                  }`}
                >
                  {isInTune && <CheckCircle2 className="w-3 h-3" />}
                  <span>{statusText}</span>
                </span>
                <span className="font-mono tabular-nums text-[#13221d]">
                  {r.cents !== null ? `${r.cents >= 0 ? '+' : ''}${r.cents.toFixed(0)} sutimi` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low-Frequency 16384-FFT Spectrum Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg block"
        style={{ height: 172 }}
      />
    </div>
  );
};

