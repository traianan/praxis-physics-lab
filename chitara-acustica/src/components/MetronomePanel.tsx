import React, { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

function getTempoMarking(bpm: number): string {
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 168) return 'Allegro';
  return 'Presto';
}

export const MetronomePanel: React.FC = () => {
  const [bpm, setBpm] = useState<number>(100);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0); // 1..beatsPerMeasure, 0 when stopped
  const [flashIntensity, setFlashIntensity] = useState<number>(0);

  const bpmRef = useRef<number>(bpm);
  const beatsRef = useRef<number>(beatsPerMeasure);
  const schedulerIdRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const nextBeatIndexRef = useRef<number>(0);
  const visualQueueRef = useRef<Array<{ beat: number; time: number }>>([]);
  const lastVisualBeatTimeRef = useRef<number>(0);
  const lastVisualBeatIndexRef = useRef<number>(0);
  const tapTimesRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  const stopMetronome = () => {
    if (schedulerIdRef.current !== null) {
      window.clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
    visualQueueRef.current = [];
    setIsRunning(false);
    setCurrentBeat(0);
    setFlashIntensity(0);
  };

  useEffect(() => {
    return () => {
      if (schedulerIdRef.current !== null) {
        window.clearInterval(schedulerIdRef.current);
      }
    };
  }, []);

  const startMetronome = () => {
    const ctx = audioEngine.ensureContext();
    stopMetronome();

    nextBeatIndexRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.04;
    lastVisualBeatTimeRef.current = nextNoteTimeRef.current;
    lastVisualBeatIndexRef.current = 0;
    setIsRunning(true);

    const lookaheadMs = 25;
    const scheduleAheadSec = 0.1;

    const schedule = () => {
      const currentTime = ctx.currentTime;
      while (nextNoteTimeRef.current < currentTime + scheduleAheadSec) {
        const beatNum = (nextBeatIndexRef.current % beatsRef.current) + 1;
        const isAccent = beatNum === 1;
        audioEngine.scheduleMetronomeClick(nextNoteTimeRef.current, isAccent);
        visualQueueRef.current.push({
          beat: beatNum,
          time: nextNoteTimeRef.current,
        });

        const secondsPerBeat = 60 / bpmRef.current;
        nextNoteTimeRef.current += secondsPerBeat;
        nextBeatIndexRef.current = (nextBeatIndexRef.current + 1) % beatsRef.current;
      }
    };

    schedule();
    schedulerIdRef.current = window.setInterval(schedule, lookaheadMs);
  };

  // Synchronized RAF visual loop driven directly by AudioContext.currentTime
  useEffect(() => {
    let rafId = 0;

    const render = () => {
      const ctx = isRunning ? audioEngine.ensureContext() : null;
      const nowAudio = ctx?.currentTime ?? 0;

      if (isRunning && ctx) {
        while (
          visualQueueRef.current.length > 0 &&
          visualQueueRef.current[0].time <= nowAudio
        ) {
          const item = visualQueueRef.current.shift()!;
          lastVisualBeatTimeRef.current = item.time;
          lastVisualBeatIndexRef.current = item.beat;
          setCurrentBeat(item.beat);
        }

        const elapsed = Math.max(0, nowAudio - lastVisualBeatTimeRef.current);
        const decay = Math.max(0, 1 - elapsed / 0.18);
        setFlashIntensity(decay);
      }

      // Draw synchronized pendulum + beat phase indicator on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(300, Math.floor(rect.width));
        const h = 112;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        const c = canvas.getContext('2d');
        if (c) {
          c.save();
          c.scale(dpr, dpr);

          c.fillStyle = '#fcfdfc';
          c.fillRect(0, 0, w, h);

          const pivotX = w / 2;
          const pivotY = h - 14;
          const armLen = h - 32;
          const maxAngle = 0.62; // radians (~35 deg)

          // Background arc
          c.strokeStyle = '#dce6e1';
          c.lineWidth = 2;
          c.beginPath();
          c.arc(pivotX, pivotY, armLen, -Math.PI / 2 - maxAngle, -Math.PI / 2 + maxAngle);
          c.stroke();

          // Left/Right endpoint markers
          [-1, 1].forEach((side) => {
            const a = -Math.PI / 2 + side * maxAngle;
            const ex = pivotX + Math.cos(a) * armLen;
            const ey = pivotY + Math.sin(a) * armLen;
            c.fillStyle = '#b7c7bf';
            c.beginPath();
            c.arc(ex, ey, 4, 0, Math.PI * 2);
            c.fill();
          });

          // Pendulum angle synced to exact audio beat phase
          let angle = 0;
          if (isRunning && ctx && lastVisualBeatIndexRef.current > 0) {
            const beatSec = 60 / bpmRef.current;
            const phase = Math.min(1, Math.max(0, (nowAudio - lastVisualBeatTimeRef.current) / beatSec));
            // Alternate swing direction on odd/even beats
            const dir = lastVisualBeatIndexRef.current % 2 === 1 ? 1 : -1;
            // Smooth cosine ease from -dir*maxAngle to +dir*maxAngle
            angle = dir * (-maxAngle * Math.cos(Math.PI * phase));
          }

          const bobX = pivotX + Math.sin(angle) * armLen;
          const bobY = pivotY - Math.cos(angle) * armLen;

          const isAccentBeat = currentBeat === 1 && flashIntensity > 0.15;
          const isPulse = flashIntensity > 0.15;

          c.strokeStyle = '#0d4a3e';
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(pivotX, pivotY);
          c.lineTo(bobX, bobY);
          c.stroke();

          c.fillStyle = isAccentBeat ? '#b85d2b' : isPulse ? '#0d4a3e' : '#53665f';
          c.beginPath();
          c.arc(bobX, bobY, isPulse ? 10 : 8, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = '#ffffff';
          c.lineWidth = 2;
          c.stroke();

          c.fillStyle = '#0d4a3e';
          c.beginPath();
          c.arc(pivotX, pivotY, 4.5, 0, Math.PI * 2);
          c.fill();

          c.strokeStyle = '#d8e2dc';
          c.lineWidth = 1;
          c.strokeRect(0.5, 0.5, w - 1, h - 1);

          c.restore();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, currentBeat, flashIntensity]);

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter((t) => now - t < 2200);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const estimatedBpm = Math.round(60000 / avgMs);
      setBpm(Math.max(40, Math.min(208, estimatedBpm)));
    }
  };

  const clampBpm = (val: number) => Math.max(40, Math.min(208, val));
  const beatPeriodMs = 60000 / bpm;

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">Metronom de precizie (Web Audio API)</h3>
          <p className="text-xs text-[#53665f] mt-0.5">
            Tempo reglabil între 40 și 208 BPM, cu ceas hardware Web Audio și indicator vizual sincronizat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {[
              { beats: 2, label: '2/4' },
              { beats: 3, label: '3/4' },
              { beats: 4, label: '4/4' },
              { beats: 6, label: '6/8' },
            ].map((sig) => (
              <button
                key={sig.label}
                type="button"
                onClick={() => setBeatsPerMeasure(sig.beats)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  beatsPerMeasure === sig.beats
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {sig.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleTapTempo}
            className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-semibold text-[#13221d] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tap Tempo
          </button>

          <button
            type="button"
            onClick={() => (isRunning ? stopMetronome() : startMetronome())}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isRunning
                ? 'bg-[#b85d2b] hover:bg-[#9c4c20] text-white'
                : 'bg-[#0d4a3e] hover:bg-[#09382f] text-white'
            }`}
          >
            {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Oprește' : 'Pornește'}</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">TEMPO</div>
          <div className="text-lg font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {bpm} BPM
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">INDICAȚIE MUZICALĂ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5">{getTempoMarking(bpm)}</div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">TIMP CURENT</div>
          <div className="text-base font-bold text-[#0d4a3e] mt-0.5 font-mono tabular-nums">
            {isRunning && currentBeat > 0 ? `${currentBeat} / ${beatsPerMeasure}` : 'Oprit'}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">INTERVAL BĂTAIE</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {beatPeriodMs.toFixed(0)} ms
          </div>
        </div>
      </div>

      {/* Tempo Slider & Synchronized Beat Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-center">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#13221d]">Reglaj tempo (40 – 208 BPM)</span>
              <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">{bpm} BPM</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBpm((b) => clampBpm(b - 1))}
                aria-label="Scade tempo cu 1 BPM"
                className="w-8 h-8 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-sm font-semibold text-[#13221d] cursor-pointer shrink-0"
              >
                −
              </button>
              <input
                type="range"
                min={40}
                max={208}
                step={1}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="lab-slider w-full"
              />
              <button
                type="button"
                onClick={() => setBpm((b) => clampBpm(b + 1))}
                aria-label="Crește tempo cu 1 BPM"
                className="w-8 h-8 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-sm font-semibold text-[#13221d] cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Synchronized Beat Lights */}
          <div className="flex items-center gap-2">
            {Array.from({ length: beatsPerMeasure }, (_, idx) => {
              const beatNum = idx + 1;
              const isActive = isRunning && currentBeat === beatNum;
              const isAccent = beatNum === 1;
              return (
                <div
                  key={beatNum}
                  className={`flex-1 h-10 rounded-lg border font-mono text-xs font-bold flex items-center justify-center transition-transform duration-75 ${
                    isActive
                      ? isAccent
                        ? 'bg-[#b85d2b] text-white border-[#b85d2b] scale-[1.03]'
                        : 'bg-[#0d4a3e] text-white border-[#0d4a3e] scale-[1.03]'
                      : isAccent
                      ? 'bg-[#fdf3ee] text-[#8a3e16] border-[#e7c7b5]'
                      : 'bg-[#edf3f0] text-[#53665f] border-[#dce6e1]'
                  }`}
                >
                  {beatNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Synchronized Canvas Pendulum */}
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg block"
          style={{ height: 112 }}
        />
      </div>
    </div>
  );
};
