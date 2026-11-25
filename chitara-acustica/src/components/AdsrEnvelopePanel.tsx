import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, SlidersHorizontal, Volume2 } from 'lucide-react';
import { ADSR_PRESETS, audioEngine } from '../audio/AudioEngine';
import { AdsrEnvelopeConfig, AdsrPresetId } from '../types/guitar';

type AdsrEnvelopePanelProps = {
  activeFrequency: number;
  noteLabel: string;
  lastPluckTimestamp: number;
  onPlaySampleNote: () => void;
  onPlaySampleChord: () => void;
};

type DragTarget = 'attack' | 'sustain' | 'release' | null;

function formatTimeLabel(sec: number): string {
  if (sec < 0.1) return `${Math.round(sec * 1000)} ms`;
  return `${sec.toFixed(2)} s`;
}

export const AdsrEnvelopePanel: React.FC<AdsrEnvelopePanelProps> = ({
  activeFrequency,
  noteLabel,
  lastPluckTimestamp,
  onPlaySampleNote,
  onPlaySampleChord,
}) => {
  const [config, setConfig] = useState<AdsrEnvelopeConfig>(() => audioEngine.getAdsrEnvelope());
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [hoverTarget, setHoverTarget] = useState<DragTarget>(null);
  const [animStartMs, setAnimStartMs] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Sync every ADSR edit directly into the global Web Audio engine
  useEffect(() => {
    audioEngine.setAdsrEnvelope(config);
  }, [config]);

  // Trigger playhead sweep whenever the user plucks a string in the sandbox
  useEffect(() => {
    if (lastPluckTimestamp > 0) {
      setAnimStartMs(lastPluckTimestamp);
    }
  }, [lastPluckTimestamp]);

  const totalDurationSec = useMemo(() => {
    return config.attackSec + config.decaySec + config.holdSec + config.releaseSec;
  }, [config]);

  // Axis horizon adapts smoothly with headroom so dragging Release right doesn't immediately clip
  const axisMaxSec = useMemo(() => {
    return Math.max(2.5, Math.ceil(totalDurationSec * 1.12 * 2) / 2);
  }, [totalDurationSec]);

  const activePresetInfo = useMemo(() => {
    if (config.presetId === 'custom') return null;
    return ADSR_PRESETS[config.presetId];
  }, [config.presetId]);

  const handleSelectPreset = (id: Exclude<AdsrPresetId, 'custom'>) => {
    setConfig({ ...ADSR_PRESETS[id].config });
  };

  const updateParam = <K extends keyof Pick<AdsrEnvelopeConfig, 'attackSec' | 'decaySec' | 'sustainLevel' | 'holdSec' | 'releaseSec'>>(
    key: K,
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      enabled: true,
      presetId: 'custom',
      [key]: value,
    }));
  };

  const handlePlayNote = () => {
    setAnimStartMs(performance.now());
    onPlaySampleNote();
  };

  const handlePlayChord = () => {
    setAnimStartMs(performance.now());
    onPlaySampleChord();
  };

  // Compute exact normalized envelope amplitude [0..1] at time t (seconds)
  const evalEnvelopeAt = (t: number, cfg: AdsrEnvelopeConfig): number => {
    const a = Math.max(0.003, cfg.attackSec);
    const d = Math.max(0.02, cfg.decaySec);
    const s = Math.max(0.005, Math.min(1, cfg.sustainLevel));
    const h = Math.max(0.04, cfg.holdSec);
    const r = Math.max(0.03, cfg.releaseSec);

    if (t <= 0) return 0;
    if (t <= a) {
      return t / a;
    }
    if (t <= a + d) {
      const frac = (t - a) / d;
      // Exponential decay matching Web Audio exponentialRampToValueAtTime
      return Math.pow(s, frac);
    }
    if (t <= a + d + h) {
      return s;
    }
    if (t <= a + d + h + r) {
      const frac = (t - a - d - h) / r;
      const floor = 0.0008;
      return s * Math.pow(floor / Math.max(floor, s), frac);
    }
    return 0;
  };

  // Helper to convert Canvas client coords into ADSR parameters while dragging handles
  const getPlotMetrics = (canvas: HTMLCanvasElement) => {
    const width = canvas.clientWidth || 720;
    const height = canvas.clientHeight || 225;
    const padLeft = 44;
    const padRight = 18;
    const padTop = 26;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    return { width, height, padLeft, padRight, padTop, padBottom, plotW, plotH };
  };

  const detectHandle = (clientX: number, clientY: number): DragTarget => {
    const canvas = canvasRef.current;
    if (!canvas || !config.enabled) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { padLeft, padTop, plotW, plotH } = getPlotMetrics(canvas);

    const tToX = (t: number) => padLeft + (t / axisMaxSec) * plotW;
    const aToY = (amp: number) => padTop + (1 - amp) * plotH;

    const pAttack = { x: tToX(config.attackSec), y: aToY(1) };
    const pSustain = { x: tToX(config.attackSec + config.decaySec), y: aToY(config.sustainLevel) };
    const pRelease = { x: tToX(totalDurationSec), y: aToY(0) };

    const dist = (px: number, py: number) => Math.hypot(x - px, y - py);
    const threshold = 15;
    if (dist(pAttack.x, pAttack.y) <= threshold) return 'attack';
    if (dist(pSustain.x, pSustain.y) <= threshold) return 'sustain';
    if (dist(pRelease.x, pRelease.y) <= threshold) return 'release';
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = detectHandle(e.clientX, e.clientY);
    if (hit) {
      setDragTarget(hit);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!dragTarget) {
      setHoverTarget(detectHandle(e.clientX, e.clientY));
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { padLeft, padTop, plotW, plotH } = getPlotMetrics(canvas);

    const tAtCursor = Math.max(0, Math.min(axisMaxSec, ((x - padLeft) / Math.max(1, plotW)) * axisMaxSec));
    const ampAtCursor = Math.max(0.02, Math.min(1, 1 - (y - padTop) / Math.max(1, plotH)));

    if (dragTarget === 'attack') {
      const nextA = Number(Math.max(0.004, Math.min(1.0, tAtCursor)).toFixed(3));
      updateParam('attackSec', nextA);
    } else if (dragTarget === 'sustain') {
      const nextD = Number(Math.max(0.04, Math.min(2.0, tAtCursor - config.attackSec)).toFixed(2));
      const nextS = Number(ampAtCursor.toFixed(2));
      setConfig((prev) => ({
        ...prev,
        enabled: true,
        presetId: 'custom',
        decaySec: nextD,
        sustainLevel: nextS,
      }));
    } else if (dragTarget === 'release') {
      const noteOffT = config.attackSec + config.decaySec + config.holdSec;
      const nextR = Number(Math.max(0.05, Math.min(3.5, tAtCursor - noteOffT)).toFixed(2));
      updateParam('releaseSec', nextR);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragTarget) {
      setDragTarget(null);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if not captured
      }
    }
  };

  // High-DPI Canvas render loop (active while playhead animates, static otherwise)
  useEffect(() => {
    let active = true;

    const draw = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height, padLeft, padTop, plotW, plotH } = getPlotMetrics(canvas);
      const targetW = Math.floor(width * dpr);
      const targetH = Math.floor(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear background
      ctx.fillStyle = '#fafcfa';
      ctx.fillRect(0, 0, width, height);

      const tToX = (t: number) => padLeft + (t / axisMaxSec) * plotW;
      const aToY = (amp: number) => padTop + (1 - amp) * plotH;

      // Amplitude horizontal gridlines
      const ampTicks = [0, 0.25, 0.5, 0.75, 1];
      ctx.font = '10px "Consolas", monospace';
      ctx.textBaseline = 'middle';
      ampTicks.forEach((amp) => {
        const y = aToY(amp);
        ctx.strokeStyle = amp === 0 ? '#bac9c2' : '#e6ede9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();

        ctx.fillStyle = '#53665f';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(amp * 100)}%`, padLeft - 6, y);
      });

      // Time vertical gridlines
      const stepSec = axisMaxSec <= 3 ? 0.5 : 1.0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let t = 0; t <= axisMaxSec + 0.001; t += stepSec) {
        const x = tToX(t);
        ctx.strokeStyle = t === 0 ? '#bac9c2' : '#e6ede9';
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + plotH);
        ctx.stroke();

        ctx.fillStyle = '#53665f';
        ctx.fillText(`${t.toFixed(1)}s`, x, padTop + plotH + 7);
      }

      if (!config.enabled) {
        // Draw dashed natural exponential pluck curve for reference when ADSR is bypassed
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#7b8f87';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const steps = 160;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * axisMaxSec;
          const amp = t < 0.006 ? t / 0.006 : Math.exp(-t * 1.85);
          const px = tToX(t);
          const py = aToY(amp);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#53665f';
        ctx.font = '600 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          'Plic ADSR ocolit — se folosește curba naturală implicită a ciupirii',
          padLeft + plotW / 2,
          padTop + plotH * 0.44
        );
        return;
      }

      const tA = config.attackSec;
      const tD = tA + config.decaySec;
      const tH = tD + config.holdSec;
      const tR = tH + config.releaseSec;

      // Helper to shade each ADSR phase under the real curve
      const fillPhase = (tStart: number, tEnd: number, fillStyle: string) => {
        if (tEnd <= tStart) return;
        ctx.beginPath();
        ctx.moveTo(tToX(tStart), aToY(0));
        const subSteps = 32;
        for (let i = 0; i <= subSteps; i++) {
          const t = tStart + (i / subSteps) * (tEnd - tStart);
          ctx.lineTo(tToX(t), aToY(evalEnvelopeAt(t, config)));
        }
        ctx.lineTo(tToX(tEnd), aToY(0));
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
      };

      fillPhase(0, tA, 'rgba(13, 74, 62, 0.16)');
      fillPhase(tA, tD, 'rgba(184, 93, 43, 0.14)');
      fillPhase(tD, tH, 'rgba(15, 118, 110, 0.10)');
      fillPhase(tH, tR, 'rgba(184, 93, 43, 0.07)');

      // Vertical dashed phase dividers & top phase labels
      const phases = [
        { label: 'A', start: 0, end: tA, color: '#0d4a3e' },
        { label: 'D', start: tA, end: tD, color: '#b85d2b' },
        { label: 'S', start: tD, end: tH, color: '#0f766e' },
        { label: 'R', start: tH, end: tR, color: '#b85d2b' },
      ];

      ctx.font = '700 11px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      phases.forEach((ph, idx) => {
        if (idx > 0) {
          const bx = tToX(ph.start);
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = '#c5d3cc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx, padTop);
          ctx.lineTo(bx, padTop + plotH);
          ctx.stroke();
          ctx.restore();
        }
        const spanPx = tToX(ph.end) - tToX(ph.start);
        if (spanPx >= 14) {
          ctx.fillStyle = ph.color;
          ctx.fillText(ph.label, (tToX(ph.start) + tToX(ph.end)) / 2, padTop - 6);
        }
      });

      // Main envelope stroke
      ctx.strokeStyle = '#0d4a3e';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const totalCurveSteps = 220;
      for (let i = 0; i <= totalCurveSteps; i++) {
        const t = (i / totalCurveSteps) * tR;
        const amp = evalEnvelopeAt(t, config);
        const px = tToX(t);
        const py = aToY(amp);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Draw interactive breakpoint handles
      const handles: Array<{ id: DragTarget; x: number; y: number; color: string; title: string }> = [
        { id: 'attack', x: tToX(tA), y: aToY(1), color: '#0d4a3e', title: 'Vârf A' },
        { id: 'sustain', x: tToX(tD), y: aToY(config.sustainLevel), color: '#b85d2b', title: 'D / S' },
        { id: 'release', x: tToX(tR), y: aToY(0), color: '#b85d2b', title: 'Sfârșit R' },
      ];

      // Non-draggable Gate-Off marker
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.arc(tToX(tH), aToY(config.sustainLevel), 3.8, 0, Math.PI * 2);
      ctx.fill();

      handles.forEach((h) => {
        const isActive = dragTarget === h.id || hoverTarget === h.id;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = h.color;
        ctx.lineWidth = isActive ? 3 : 2.2;
        ctx.beginPath();
        ctx.arc(h.x, h.y, isActive ? 6.5 : 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Playhead cursor animation if within active playback window
      const elapsedSec = animStartMs > 0 ? (performance.now() - animStartMs) / 1000 : -1;
      if (elapsedSec >= 0 && elapsedSec <= tR) {
        const curX = tToX(elapsedSec);
        const curAmp = evalEnvelopeAt(elapsedSec, config);
        const curY = aToY(curAmp);

        ctx.strokeStyle = '#b85d2b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(curX, padTop);
        ctx.lineTo(curX, padTop + plotH);
        ctx.stroke();

        ctx.fillStyle = '#b85d2b';
        ctx.beginPath();
        ctx.arc(curX, curY, 5, 0, Math.PI * 2);
        ctx.fill();

        rafRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [config, axisMaxSec, dragTarget, hoverTarget, animStartMs]);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0d4a3e]" />
            <h3 className="text-sm font-semibold text-[#13221d]">
              Plic Envelope (ADSR): Modelarea atacului și stingerii
            </h3>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Controlează evoluția amplitudinii în timp pentru nota activă ({noteLabel} ·{' '}
            <span className="font-mono tabular-nums">{activeFrequency.toFixed(1)} Hz</span>). Poți trage direct punctele
            de pe grafic sau ajusta glisoarele.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                enabled: !prev.enabled,
              }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              config.enabled
                ? 'bg-[#edf3f0] text-[#0d4a3e] border-[#0d4a3e]/35'
                : 'bg-[#fafcfa] text-[#53665f] border-[#d8e2dc]'
            }`}
          >
            {config.enabled ? 'Plic ADSR activ' : 'Ocolit (natural)'}
          </button>

          <button
            type="button"
            onClick={handlePlayNote}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Audiază cu plic ADSR</span>
          </button>

          <button
            type="button"
            onClick={handlePlayChord}
            className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-semibold text-[#13221d] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#0d4a3e]" />
            <span>Acord</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('guitar_pluck')}
            className="px-2.5 py-1.5 rounded-lg border border-[#d8e2dc] bg-white hover:bg-[#edf3f0] text-xs font-medium text-[#53665f] hover:text-[#13221d] flex items-center gap-1 transition-colors cursor-pointer"
            title="Revino la ciupirea naturală de chitară"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetează</span>
          </button>
        </div>
      </div>

      {/* Presets Strip */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(ADSR_PRESETS) as Array<Exclude<AdsrPresetId, 'custom'>>).map((pid) => {
            const p = ADSR_PRESETS[pid];
            const isSelected = config.enabled && config.presetId === pid;
            return (
              <button
                key={pid}
                type="button"
                onClick={() => handleSelectPreset(pid)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d4a3e] text-white border-[#0d4a3e]'
                    : 'bg-[#fafcfa] text-[#13221d] border-[#d8e2dc] hover:bg-[#edf3f0]'
                }`}
              >
                {p.name}
              </button>
            );
          })}
          {config.enabled && config.presetId === 'custom' && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#fdf3ed] text-[#b85d2b] border border-[#b85d2b]/30">
              Profil personalizat
            </span>
          )}
        </div>

        <p className="text-xs text-[#53665f]">
          {!config.enabled
            ? 'Modul ocolire: sunetul folosește curba exponențială standard a corzii, fără modelare ADSR suplimentară.'
            : activePresetInfo
              ? activePresetInfo.description
              : 'Profil personalizat: trage nodurile graficului sau glisoarele pentru a experimenta atacuri lente ori stingeri abrupte.'}
        </p>
      </div>

      {/* 4-KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">ATTACK (A)</div>
          <div className="text-sm font-bold font-mono text-[#0d4a3e] tabular-nums mt-0.5">
            {formatTimeLabel(config.attackSec)}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">DECAY (D)</div>
          <div className="text-sm font-bold font-mono text-[#b85d2b] tabular-nums mt-0.5">
            {formatTimeLabel(config.decaySec)}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">SUSTAIN (S)</div>
          <div className="text-sm font-bold font-mono text-[#0f766e] tabular-nums mt-0.5">
            {Math.round(config.sustainLevel * 100)}%
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2">
          <div className="text-[10.5px] font-semibold text-[#53665f]">RELEASE (R)</div>
          <div className="text-sm font-bold font-mono text-[#b85d2b] tabular-nums mt-0.5">
            {formatTimeLabel(config.releaseSec)}
          </div>
        </div>
        <div className="rounded-lg bg-[#fafcfa] border border-[#d8e2dc] px-3 py-2 col-span-2 sm:col-span-1">
          <div className="text-[10.5px] font-semibold text-[#53665f]">DURATĂ TOTALĂ</div>
          <div className="text-sm font-bold font-mono text-[#13221d] tabular-nums mt-0.5">
            {totalDurationSec.toFixed(2)} s
          </div>
        </div>
      </div>

      {/* Interactive ADSR Canvas Plot */}
      <div className="rounded-lg border border-[#d8e2dc] bg-[#fafcfa] overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            setHoverTarget(null);
            setDragTarget(null);
          }}
          className={`w-full h-[225px] block touch-none ${
            dragTarget ? 'cursor-grabbing' : hoverTarget ? 'cursor-grab' : 'cursor-default'
          }`}
        />
      </div>

      {/* 4 Primary ADSR Sliders + Sustain Gate Hold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0d4a3e]">1. Attack (Timp de creștere)</span>
            <span className="font-mono font-bold text-[#13221d] tabular-nums">
              {formatTimeLabel(config.attackSec)}
            </span>
          </div>
          <input
            type="range"
            min={0.004}
            max={1.0}
            step={0.004}
            value={config.attackSec}
            onChange={(e) => updateParam('attackSec', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <p className="text-[11px] text-[#53665f]">
            Intervalul de la liniște (0%) la vârful de amplitudine (100%). Valori mici = atac percurent de pană; valori
            mari = intrare lină tip arcuș.
          </p>
        </div>

        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#b85d2b]">2. Decay (Cădere inițială)</span>
            <span className="font-mono font-bold text-[#13221d] tabular-nums">
              {formatTimeLabel(config.decaySec)}
            </span>
          </div>
          <input
            type="range"
            min={0.04}
            max={2.0}
            step={0.02}
            value={config.decaySec}
            onChange={(e) => updateParam('decaySec', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <p className="text-[11px] text-[#53665f]">
            Timpul în care energia scade exponențial de la vârful de atac până la nivelul stabil de Sustain.
          </p>
        </div>

        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0f766e]">3. Sustain (Nivel de susținere)</span>
            <span className="font-mono font-bold text-[#13221d] tabular-nums">
              {Math.round(config.sustainLevel * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.02}
            max={1.0}
            step={0.01}
            value={config.sustainLevel}
            onChange={(e) => updateParam('sustainLevel', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <p className="text-[11px] text-[#53665f]">
            Nivelul relativ de amplitudine menținut cât timp nota rămâne activă înaintea eliberării (Note-Off).
          </p>
        </div>

        <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#b85d2b]">4. Release (Stingere finală)</span>
            <span className="font-mono font-bold text-[#13221d] tabular-nums">
              {formatTimeLabel(config.releaseSec)}
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={3.5}
            step={0.02}
            value={config.releaseSec}
            onChange={(e) => updateParam('releaseSec', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <p className="text-[11px] text-[#53665f]">
            Durata stingerii corzii după punctul de eliberare: scurtă pentru palm-mute, lungă pentru rezonanță liberă.
          </p>
        </div>
      </div>

      {/* Hold / Gate Window Control */}
      <div className="rounded-lg border border-[#e3ebe6] bg-[#edf3f0]/55 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#13221d]">
          <span className="font-semibold">Durată menținere notă (Gate / Plateau S):</span>{' '}
          <span className="text-[#53665f]">
            determină cât timp rămâne nota la nivelul Sustain înainte să înceapă faza de Release.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:w-64">
          <input
            type="range"
            min={0.06}
            max={1.5}
            step={0.02}
            value={config.holdSec}
            onChange={(e) => updateParam('holdSec', Number(e.target.value))}
            className="lab-slider w-full"
          />
          <span className="font-mono text-xs font-bold text-[#0d4a3e] tabular-nums w-14 text-right">
            {config.holdSec.toFixed(2)} s
          </span>
        </div>
      </div>
    </div>
  );
};

