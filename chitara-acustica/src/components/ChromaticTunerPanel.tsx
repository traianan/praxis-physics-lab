import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, CheckCircle2, Download, Mic, MicOff, Pause, Play, Trash2 } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { NotationSystem, StringState } from '../types/guitar';
import { formatMidiLabel, formatNoteName, midiToFrequency } from '../utils/musicTheory';

type ChromaticTunerPanelProps = {
  strings: StringState[];
  notation: NotationSystem;
};

type TunerReading = {
  noteLabel: string;
  midi: number;
  measuredFreq: number;
  idealFreq: number;
  cents: number;
  confidence: number;
};

type PitchLogEntry = TunerReading & {
  id: number;
  timestampMs: number;
  elapsedSec: number;
};

type StabilityChartMode = 'cents' | 'freq';

const MAX_LOG_ENTRIES = 240;

export const ChromaticTunerPanel: React.FC<ChromaticTunerPanelProps> = ({
  strings,
  notation,
}) => {
  const [micActive, setMicActive] = useState<boolean>(() => audioEngine.isMicrophoneActive());
  const [micError, setMicError] = useState<string | null>(null);
  const [a4Ref, setA4Ref] = useState<number>(440);
  const [reading, setReading] = useState<TunerReading | null>(null);

  // Pitch logging & stability state
  const [isLogging, setIsLogging] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<StabilityChartMode>('cents');
  const [logEntries, setLogEntries] = useState<PitchLogEntry[]>([]);

  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stabilityCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const smoothedCentsRef = useRef<number>(0);
  const lastDetectTimeRef = useRef<number>(0);
  const lastHoldTimeRef = useRef<number>(0);
  const readingRef = useRef<TunerReading | null>(null);
  const isLoggingRef = useRef<boolean>(true);
  const logStartMsRef = useRef<number | null>(null);
  const nextLogIdRef = useRef<number>(1);
  const lastLoggedAtRef = useRef<number>(0);

  useEffect(() => {
    isLoggingRef.current = isLogging;
  }, [isLogging]);

  useEffect(() => {
    return () => {
      if (audioEngine.isMicrophoneActive()) {
        void audioEngine.stopMicrophone();
      }
    };
  }, []);

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
        setMicError(
          'Nu s-a putut accesa microfonul. Verifică permisiunile browserului și încearcă din nou.'
        );
        setMicActive(false);
      }
    }
  };

  useEffect(() => {
    let rafId = 0;

    const loop = (now: number) => {
      // Run autocorrelation ~14 times/sec for responsive, low-CPU pitch tracking
      if (now - lastDetectTimeRef.current > 70) {
        lastDetectTimeRef.current = now;
        const result = audioEngine.detectPitchAutocorrelation(a4Ref);
        if (result) {
          const pc = ((result.note.midi % 12) + 12) % 12;
          const noteLabel = `${formatNoteName(pc, notation)}${result.note.octave}`;
          const idealFreq = midiToFrequency(result.note.midi, a4Ref);
          const clampedCents = Math.max(-50, Math.min(50, result.note.cents));

          smoothedCentsRef.current = smoothedCentsRef.current * 0.45 + clampedCents * 0.55;
          lastHoldTimeRef.current = now;

          const nextReading: TunerReading = {
            noteLabel,
            midi: result.note.midi,
            measuredFreq: result.frequency,
            idealFreq,
            cents: result.note.cents,
            confidence: result.confidence,
          };
          readingRef.current = nextReading;
          setReading(nextReading);

          // Append to stability log (~7 entries/sec max to keep trace clean & readable)
          if (
            isLoggingRef.current &&
            result.confidence >= 0.72 &&
            now - lastLoggedAtRef.current >= 140
          ) {
            lastLoggedAtRef.current = now;
            if (logStartMsRef.current === null) {
              logStartMsRef.current = now;
            }
            const entry: PitchLogEntry = {
              ...nextReading,
              id: nextLogIdRef.current++,
              timestampMs: now,
              elapsedSec: (now - logStartMsRef.current) / 1000,
            };
            setLogEntries((prev) => {
              const next = [...prev, entry];
              return next.length > MAX_LOG_ENTRIES ? next.slice(next.length - MAX_LOG_ENTRIES) : next;
            });
          }
        } else if (now - lastHoldTimeRef.current > 1600) {
          smoothedCentsRef.current = smoothedCentsRef.current * 0.85;
          if (readingRef.current !== null) {
            readingRef.current = null;
            setReading(null);
          }
        }
      }

      // Render precision chromatic needle gauge on Canvas
      const canvas = gaugeCanvasRef.current;
      const activeReading = readingRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = 132;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);

          ctx.fillStyle = '#fcfdfc';
          ctx.fillRect(0, 0, w, h);

          const padL = 32;
          const padR = 32;
          const trackW = w - padL - padR;
          const trackY = 66;
          const centsToX = (c: number) => padL + ((c + 50) / 100) * trackW;

          // Center "in-tune" tolerance band (±5 cents)
          const bandLeft = centsToX(-5);
          const bandRight = centsToX(5);
          ctx.fillStyle = 'rgba(13, 74, 62, 0.14)';
          ctx.fillRect(bandLeft, trackY - 22, bandRight - bandLeft, 44);

          // Main horizontal scale axis
          ctx.strokeStyle = '#b7c7bf';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padL, trackY);
          ctx.lineTo(padL + trackW, trackY);
          ctx.stroke();

          // Tick marks (-50 to +50 every 5 cents)
          for (let c = -50; c <= 50; c += 5) {
            const x = centsToX(c);
            const isMajor = c % 10 === 0;
            const isZero = c === 0;
            const tickLen = isZero ? 22 : isMajor ? 14 : 7;

            ctx.strokeStyle = isZero ? '#0d4a3e' : isMajor ? '#6c7e77' : '#cbd7d0';
            ctx.lineWidth = isZero ? 2.4 : isMajor ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(x, trackY - tickLen);
            ctx.lineTo(x, trackY + tickLen);
            ctx.stroke();

            if (isMajor) {
              ctx.fillStyle = isZero ? '#0d4a3e' : '#53665f';
              ctx.font = `${isZero ? '700' : '500'} 10px "Consolas", monospace`;
              ctx.textAlign = 'center';
              ctx.fillText(c > 0 ? `+${c}` : `${c}`, x, trackY + 36);
            }
          }

          // Direction hints
          ctx.fillStyle = '#53665f';
          ctx.font = '600 10.5px "Segoe UI", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('♭ Prea jos (strânge coarda)', padL, 20);
          ctx.textAlign = 'right';
          ctx.fillText('Prea sus (slăbește coarda) ♯', padL + trackW, 20);
          ctx.textAlign = 'center';
          ctx.fillStyle = '#0d4a3e';
          ctx.fillText('±5 · Acordat', centsToX(0), 20);

          // Needle indicator
          if (activeReading) {
            const cVal = Math.max(-50, Math.min(50, smoothedCentsRef.current));
            const nx = centsToX(cVal);
            const inTune = Math.abs(activeReading.cents) <= 5;
            const needleColor = inTune ? '#0d4a3e' : '#b85d2b';

            ctx.strokeStyle = needleColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(nx, trackY - 28);
            ctx.lineTo(nx, trackY + 28);
            ctx.stroke();

            // Pointer triangle on top
            ctx.fillStyle = needleColor;
            ctx.beginPath();
            ctx.moveTo(nx, trackY - 22);
            ctx.lineTo(nx - 6, trackY - 32);
            ctx.lineTo(nx + 6, trackY - 32);
            ctx.closePath();
            ctx.fill();
          }

          ctx.strokeStyle = '#d8e2dc';
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [a4Ref, notation]);

  // Draw Tuning Stability Over Time Chart
  useEffect(() => {
    const canvas = stabilityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 720;
    const h = 190;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, w, h);

    const padL = 52;
    const padR = 16;
    const padT = 18;
    const padB = 26;
    const plotW = Math.max(120, w - padL - padR);
    const plotH = Math.max(80, h - padT - padB);

    if (logEntries.length === 0) {
      ctx.strokeStyle = '#d8e2dc';
      ctx.strokeRect(padL, padT, plotW, plotH);
      ctx.fillStyle = '#6c7e77';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'Pornește microfonul sau ciupește o coardă virtuală pentru a înregistra stabilitatea acordajului în timp.',
        padL + plotW / 2,
        padT + plotH / 2
      );
      return;
    }

    const tMin = logEntries[0].elapsedSec;
    const tMax = Math.max(tMin + 2, logEntries[logEntries.length - 1].elapsedSec);
    const timeToX = (sec: number) => padL + ((sec - tMin) / Math.max(0.1, tMax - tMin)) * plotW;

    if (chartMode === 'cents') {
      const yMin = -50;
      const yMax = 50;
      const valToY = (c: number) => {
        const clamped = Math.max(yMin, Math.min(yMax, c));
        return padT + plotH * (1 - (clamped - yMin) / (yMax - yMin));
      };

      // Tolerance band ±5 cents
      const yTopBand = valToY(5);
      const yBotBand = valToY(-5);
      ctx.fillStyle = 'rgba(13, 74, 62, 0.12)';
      ctx.fillRect(padL, yTopBand, plotW, yBotBand - yTopBand);

      // Horizontal cents grid
      ctx.font = '10px "Consolas", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      [-50, -25, 0, 25, 50].forEach((c) => {
        const y = valToY(c);
        ctx.strokeStyle = c === 0 ? '#89a397' : '#e6eee9';
        ctx.lineWidth = c === 0 ? 1.2 : 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();

        ctx.fillStyle = c === 0 ? '#0d4a3e' : '#53665f';
        ctx.fillText(`${c > 0 ? '+' : ''}${c}`, padL - 6, y);
      });

      // Connected trace (break line across silent pauses > 1.2s)
      ctx.strokeStyle = '#53665f';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      logEntries.forEach((pt, idx) => {
        const x = timeToX(pt.elapsedSec);
        const y = valToY(pt.cents);
        const prev = logEntries[idx - 1];
        if (idx === 0 || (prev && pt.elapsedSec - prev.elapsedSec > 1.2)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Color-coded points
      logEntries.forEach((pt) => {
        const x = timeToX(pt.elapsedSec);
        const y = valToY(pt.cents);
        const stable = Math.abs(pt.cents) <= 5;
        ctx.fillStyle = stable ? '#0d4a3e' : '#b85d2b';
        ctx.beginPath();
        ctx.arc(x, y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Frequency Hz mode
      let fMin = Infinity;
      let fMax = -Infinity;
      logEntries.forEach((e) => {
        fMin = Math.min(fMin, e.measuredFreq, e.idealFreq);
        fMax = Math.max(fMax, e.measuredFreq, e.idealFreq);
      });
      const span = Math.max(8, fMax - fMin);
      const yMin = Math.max(40, fMin - span * 0.18);
      const yMax = fMax + span * 0.18;
      const valToY = (f: number) => padT + plotH * (1 - (f - yMin) / Math.max(1, yMax - yMin));

      ctx.font = '10px "Consolas", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= 4; i++) {
        const fVal = yMin + (i / 4) * (yMax - yMin);
        const y = valToY(fVal);
        ctx.strokeStyle = '#e6eee9';
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
        ctx.fillStyle = '#53665f';
        ctx.fillText(`${fVal.toFixed(1)}`, padL - 6, y);
      }

      // Ideal note target dashed line
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#0d4a3e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      logEntries.forEach((pt, idx) => {
        const x = timeToX(pt.elapsedSec);
        const y = valToY(pt.idealFreq);
        const prev = logEntries[idx - 1];
        if (idx === 0 || (prev && pt.elapsedSec - prev.elapsedSec > 1.2)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.restore();

      // Measured frequency trace
      ctx.strokeStyle = '#b85d2b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      logEntries.forEach((pt, idx) => {
        const x = timeToX(pt.elapsedSec);
        const y = valToY(pt.measuredFreq);
        const prev = logEntries[idx - 1];
        if (idx === 0 || (prev && pt.elapsedSec - prev.elapsedSec > 1.2)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      logEntries.forEach((pt) => {
        const x = timeToX(pt.elapsedSec);
        const y = valToY(pt.measuredFreq);
        ctx.fillStyle = Math.abs(pt.cents) <= 5 ? '#0d4a3e' : '#b85d2b';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Time X-axis labels
    ctx.fillStyle = '#53665f';
    ctx.font = '10px "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 4; i++) {
      const sec = tMin + (i / 4) * (tMax - tMin);
      ctx.fillText(`${sec.toFixed(1)}s`, timeToX(sec), padT + plotH + 6);
    }

    ctx.strokeStyle = '#d8e2dc';
    ctx.lineWidth = 1;
    ctx.strokeRect(padL, padT, plotW, plotH);
  }, [logEntries, chartMode]);

  const logStats = useMemo(() => {
    if (logEntries.length === 0) {
      return {
        count: 0,
        inTunePct: 0,
        meanAbsCents: 0,
        stdDevCents: 0,
        minFreq: 0,
        maxFreq: 0,
      };
    }

    let inTuneCount = 0;
    let absSum = 0;
    let meanCents = 0;
    let minFreq = Infinity;
    let maxFreq = -Infinity;

    logEntries.forEach((e) => {
      if (Math.abs(e.cents) <= 5) inTuneCount++;
      absSum += Math.abs(e.cents);
      meanCents += e.cents;
      if (e.measuredFreq < minFreq) minFreq = e.measuredFreq;
      if (e.measuredFreq > maxFreq) maxFreq = e.measuredFreq;
    });
    meanCents /= logEntries.length;

    let varSum = 0;
    logEntries.forEach((e) => {
      const d = e.cents - meanCents;
      varSum += d * d;
    });

    return {
      count: logEntries.length,
      inTunePct: Math.round((inTuneCount / logEntries.length) * 100),
      meanAbsCents: absSum / logEntries.length,
      stdDevCents: Math.sqrt(varSum / logEntries.length),
      minFreq,
      maxFreq,
    };
  }, [logEntries]);

  const handleClearLog = () => {
    setLogEntries([]);
    logStartMsRef.current = null;
    nextLogIdRef.current = 1;
  };

  const handleExportCsv = () => {
    if (logEntries.length === 0) return;
    const header = 'id,elapsed_sec,note,measured_hz,ideal_hz,cents_deviation,confidence';
    const rows = logEntries.map(
      (e) =>
        `${e.id},${e.elapsedSec.toFixed(2)},${e.noteLabel},${e.measuredFreq.toFixed(2)},${e.idealFreq.toFixed(2)},${e.cents.toFixed(2)},${e.confidence.toFixed(3)}`
    );
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jurnal_acordor_cromatic_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inTune = reading ? Math.abs(reading.cents) <= 5 : false;
  const tuningGuidance = !reading
    ? micActive
      ? 'Ciupeste o coardă a chitarei reale aproape de microfon...'
      : 'Pornește microfonul pentru a acorda o chitară reală (sau ciupește o coardă virtuală).'
    : inTune
    ? 'Acordat exact (în toleranța ±5 sutimi de semiton)'
    : reading.cents < 0
    ? `Prea jos cu ${Math.abs(reading.cents).toFixed(1)} sutimi de semiton — strânge cheița`
    : `Prea sus cu ${reading.cents.toFixed(1)} sutimi de semiton — slăbește cheița`;

  // Find closest open string in current tuning
  const closestString = reading
    ? strings.reduce((best, s) => {
        const sIdeal = midiToFrequency(s.openMidi, a4Ref);
        const bestIdeal = midiToFrequency(best.openMidi, a4Ref);
        return Math.abs(Math.log2(reading.measuredFreq / sIdeal)) <
          Math.abs(Math.log2(reading.measuredFreq / bestIdeal))
          ? s
          : best;
      }, strings[0])
    : null;

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">Acordor cromatic live (microfon și detecție fundamentală)</h3>
          <p className="text-xs text-[#53665f] mt-0.5">
            Identifică frecvența fundamentală prin autocorelație temporală și măsoară deviația în sutimi de semiton față de nota ideală.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {[432, 440, 442].map((refHz) => (
              <button
                key={refHz}
                type="button"
                onClick={() => setA4Ref(refHz)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  a4Ref === refHz ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                A4={refHz}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleMicrophone}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              micActive
                ? 'bg-[#b85d2b] hover:bg-[#9c4c20] text-white'
                : 'bg-[#0d4a3e] hover:bg-[#09382f] text-white'
            }`}
          >
            {micActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{micActive ? 'Oprește microfonul' : 'Pornește microfonul'}</span>
          </button>
        </div>
      </div>

      {micError && (
        <div className="rounded-lg border border-[#b85d2b]/40 bg-[#fdf3ee] px-3.5 py-2 text-xs text-[#8a3e16]">
          {micError}
        </div>
      )}

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">NOTĂ DETECTATĂ</div>
          <div className="text-lg font-bold text-[#13221d] mt-0.5 flex items-center gap-1.5">
            <span>{reading ? reading.noteLabel : '—'}</span>
            {inTune && <CheckCircle2 className="w-4 h-4 text-[#0d4a3e]" />}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ MĂSURATĂ</div>
          <div className="text-base font-bold text-[#13221d] mt-1 font-mono tabular-nums">
            {reading ? `${reading.measuredFreq.toFixed(2)} Hz` : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">NOTĂ IDEALĂ (A4={a4Ref})</div>
          <div className="text-base font-bold text-[#13221d] mt-1 font-mono tabular-nums">
            {reading ? `${reading.idealFreq.toFixed(2)} Hz` : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">DEVIAȚIE (SUTIMI DE SEMITON)</div>
          <div
            className={`text-base font-bold mt-1 font-mono tabular-nums ${
              !reading ? 'text-[#13221d]' : inTune ? 'text-[#0d4a3e]' : 'text-[#b85d2b]'
            }`}
          >
            {reading ? `${reading.cents >= 0 ? '+' : ''}${reading.cents.toFixed(1)} sutimi` : '0.0 sutimi'}
          </div>
        </div>
      </div>

      {/* Precision Needle Gauge Canvas */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`font-semibold ${inTune ? 'text-[#0d4a3e]' : 'text-[#13221d]'}`}>
            {tuningGuidance}
          </span>
          {closestString && reading && (
            <span className="font-mono text-[#53665f]">
              Cea mai apropiată coardă liberă: Coarda {closestString.id} ({formatMidiLabel(closestString.openMidi, notation)})
            </span>
          )}
        </div>
        <canvas
          ref={gaugeCanvasRef}
          className="w-full rounded-lg block"
          style={{ height: 132 }}
        />
      </div>

      {/* Reference Strip of the 6 Open Strings */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {strings
          .slice()
          .reverse()
          .map((s) => {
            const targetFreq = midiToFrequency(s.openMidi, a4Ref);
            const isClosest = closestString?.id === s.id && reading !== null;
            const isExactMatch = isClosest && reading?.midi === s.openMidi;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => audioEngine.playPluckedString(targetFreq, { method: 'karplus', duration: 2.5 })}
                title="Ascultă tonul de referință pentru această coardă"
                className={`rounded-lg border px-2.5 py-2 text-center transition-colors cursor-pointer ${
                  isExactMatch && inTune
                    ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                    : isClosest
                    ? 'bg-[#f8eae2] text-[#8a3e16] border-[#b85d2b]'
                    : 'bg-[#fafcfa] hover:bg-[#edf3f0] text-[#13221d] border-[#d8e2dc]'
                }`}
              >
                <div className="text-[10px] font-mono opacity-80">Coarda {s.id}</div>
                <div className="text-sm font-bold mt-0.5">{formatMidiLabel(s.openMidi, notation)}</div>
                <div className="text-[10px] font-mono opacity-80 tabular-nums">{targetFreq.toFixed(1)} Hz</div>
              </button>
            );
          })}
      </div>

      {/* Frequency Logger & Tuning Stability Over Time Section */}
      <div className="pt-4 border-t border-[#e3ebe6] space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0d4a3e]" />
            <div>
              <h4 className="text-sm font-semibold text-[#13221d]">
                Jurnal de frecvențe și stabilitate acordaj în timp
              </h4>
              <p className="text-[11px] text-[#53665f]">
                Înregistrează automat frecvențele detectate și ilustrează grafic deviația în sutimi de semiton (±5) sau evoluția în Hz.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
              {(
                [
                  { id: 'cents', label: 'Deviație (±50 sutimi)' },
                  { id: 'freq', label: 'Frecvență (Hz)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMode(m.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    chartMode === m.id ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsLogging((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isLogging
                  ? 'border-[#0d4a3e]/30 bg-[#edf3f0] text-[#0d4a3e]'
                  : 'border-[#d8e2dc] bg-[#fafcfa] text-[#53665f]'
              }`}
            >
              {isLogging ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isLogging ? 'Logare activă' : 'Logare oprită'}</span>
            </button>

            <button
              type="button"
              disabled={logEntries.length === 0}
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] disabled:opacity-45 text-[11px] font-medium text-[#0d4a3e] flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              disabled={logEntries.length === 0}
              onClick={handleClearLog}
              className="px-2.5 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] disabled:opacity-45 text-[11px] font-medium text-[#53665f] hover:text-[#13221d] flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Șterge log</span>
            </button>
          </div>
        </div>

        {/* Stability Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-lg bg-[#fafcfa] border border-[#dce6e1] px-3 py-2">
            <div className="text-[10.5px] font-medium text-[#53665f]">EȘANTIOANE LOGATE</div>
            <div className="text-sm font-bold text-[#13221d] font-mono tabular-nums mt-0.5">
              {logStats.count}
            </div>
          </div>
          <div className="rounded-lg bg-[#fafcfa] border border-[#dce6e1] px-3 py-2">
            <div className="text-[10.5px] font-medium text-[#53665f]">STABILITATE (±5 sutimi)</div>
            <div className="text-sm font-bold text-[#0d4a3e] font-mono tabular-nums mt-0.5">
              {logStats.count > 0 ? `${logStats.inTunePct}%` : '—'}
            </div>
          </div>
          <div className="rounded-lg bg-[#fafcfa] border border-[#dce6e1] px-3 py-2">
            <div className="text-[10.5px] font-medium text-[#53665f]">DEVIAȚIE MEDIE / σ</div>
            <div className="text-sm font-bold text-[#b85d2b] font-mono tabular-nums mt-0.5">
              {logStats.count > 0
                ? `±${logStats.meanAbsCents.toFixed(1)} sutimi (σ=${logStats.stdDevCents.toFixed(1)})`
                : '—'}
            </div>
          </div>
          <div className="rounded-lg bg-[#fafcfa] border border-[#dce6e1] px-3 py-2">
            <div className="text-[10.5px] font-medium text-[#53665f]">INTERVAL FRECVENȚE</div>
            <div className="text-sm font-bold text-[#13221d] font-mono tabular-nums mt-0.5">
              {logStats.count > 0
                ? `${logStats.minFreq.toFixed(1)}–${logStats.maxFreq.toFixed(1)} Hz`
                : '—'}
            </div>
          </div>
        </div>

        {/* Stability Graph Canvas */}
        <canvas
          ref={stabilityCanvasRef}
          className="w-full h-[190px] rounded-lg border border-[#d8e2dc]"
          aria-label="Grafic stabilitate acordaj în timp"
        />

        {/* Recent Frequency Log Table */}
        {logEntries.length > 0 && (
          <div className="rounded-lg border border-[#d8e2dc] overflow-hidden">
            <div className="max-h-36 overflow-y-auto">
              <table className="w-full text-left text-[11px] font-mono tabular-nums">
                <thead className="bg-[#edf3f0] text-[#53665f] sticky top-0">
                  <tr>
                    <th className="px-3 py-1.5 font-semibold">#</th>
                    <th className="px-3 py-1.5 font-semibold">Timp</th>
                    <th className="px-3 py-1.5 font-semibold">Notă</th>
                    <th className="px-3 py-1.5 font-semibold">Măsurat</th>
                    <th className="px-3 py-1.5 font-semibold">Ideal</th>
                    <th className="px-3 py-1.5 font-semibold">Deviație</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3f0] bg-white">
                  {logEntries
                    .slice(-25)
                    .reverse()
                    .map((entry) => {
                      const ok = Math.abs(entry.cents) <= 5;
                      return (
                        <tr key={entry.id} className="hover:bg-[#fafcfa]">
                          <td className="px-3 py-1 text-[#53665f]">{entry.id}</td>
                          <td className="px-3 py-1 text-[#53665f]">{entry.elapsedSec.toFixed(1)}s</td>
                          <td className="px-3 py-1 font-semibold text-[#13221d]">{entry.noteLabel}</td>
                          <td className="px-3 py-1 text-[#13221d]">{entry.measuredFreq.toFixed(2)} Hz</td>
                          <td className="px-3 py-1 text-[#53665f]">{entry.idealFreq.toFixed(2)} Hz</td>
                          <td
                            className={`px-3 py-1 font-semibold ${
                              ok ? 'text-[#0d4a3e]' : 'text-[#b85d2b]'
                            }`}
                          >
                            {entry.cents >= 0 ? '+' : ''}
                            {entry.cents.toFixed(1)} sutimi
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

