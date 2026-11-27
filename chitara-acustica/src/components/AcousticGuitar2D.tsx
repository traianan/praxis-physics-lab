import React, { useEffect, useRef, useState } from 'react';
import { NotationSystem, StringState } from '../types/guitar';
import { formatMidiLabel, getFretFrequency } from '../utils/musicTheory';

export type StringPluckEvent = {
  stringId: number;
  fret: number;
  frequency: number;
  timestamp: number;
};

type AcousticGuitar2DProps = {
  strings: StringState[];
  notation: NotationSystem;
  selectedStringId?: number;
  activeFrets?: Record<number, number | null>; // stringId -> fret (0 = open, null = muted)
  highlightedPitchClasses?: number[];
  rootPitchClass?: number | null;
  highlightedPositions?: Array<{ stringId: number; fret: number }>;
  pickPosition?: number; // 0.05..0.5 fraction from bridge to nut
  showHarmonicNodes?: number | null; // if set (1..8), draws standing wave nodes on active string
  lastPluck?: StringPluckEvent | null;
  pluckTimestampMap?: Record<number, number>; // stringId -> timestamp ms
  onSelectFret?: (stringId: number, fret: number) => void;
  onPluckString?: (stringId: number, fret: number, frequency: number) => void;
  onStrumAll?: () => void;
  compact?: boolean;
};

const MAX_FRETS = 15;

export const AcousticGuitar2D: React.FC<AcousticGuitar2DProps> = ({
  strings,
  notation,
  selectedStringId = 1,
  activeFrets,
  highlightedPitchClasses = [],
  rootPitchClass = null,
  highlightedPositions = [],
  pickPosition = 0.22,
  showHarmonicNodes = null,
  lastPluck,
  pluckTimestampMap,
  onSelectFret,
  onPluckString,
  onStrumAll,
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ stringId: number; fret: number; label: string; freq: number } | null>(null);
  const [isDraggingFret, setIsDraggingFret] = useState(false);
  const localPlucksRef = useRef<Record<number, number>>({});

  // Sync external pluck timestamps
  useEffect(() => {
    if (lastPluck) {
      localPlucksRef.current[lastPluck.stringId] = lastPluck.timestamp;
    }
  }, [lastPluck]);

  useEffect(() => {
    if (pluckTimestampMap) {
      Object.entries(pluckTimestampMap).forEach(([sid, ts]) => {
        localPlucksRef.current[Number(sid)] = ts;
      });
    }
  }, [pluckTimestampMap]);

  const getGeometry = (width: number, height: number) => {
    const nutX = Math.max(58, width * 0.075);
    const bridgeX = width - Math.max(52, width * 0.07);
    const scalePx = bridgeX - nutX;
    // True logarithmic fret formula: x(f) = nutX + scalePx * (1 - 2^(-f/12))
    const fretX = (f: number) => nutX + scalePx * (1 - Math.pow(2, -f / 12));
    const neckEndX = fretX(MAX_FRETS) + 12;

    const boardTop = Math.max(26, height * 0.16);
    const boardBottom = height - Math.max(26, height * 0.16);
    const boardHeight = boardBottom - boardTop;

    const stringY = (index0to5: number) => {
      const pad = boardHeight * 0.1;
      const usable = boardHeight - pad * 2;
      return boardTop + pad + (index0to5 / 5) * usable;
    };

    const soundholeX = neckEndX + (bridgeX - neckEndX) * 0.36;
    const soundholeR = Math.min(boardHeight * 0.62, (bridgeX - neckEndX) * 0.27);

    return {
      nutX,
      bridgeX,
      scalePx,
      fretX,
      neckEndX,
      boardTop,
      boardBottom,
      boardHeight,
      stringY,
      soundholeX,
      soundholeR,
    };
  };

  useEffect(() => {
    let rafId = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const width = Math.max(520, Math.floor(rect.width));
      const height = compact ? 235 : 285;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear background
      ctx.fillStyle = '#fafcfa';
      ctx.fillRect(0, 0, width, height);

      const g = getGeometry(width, height);
      const now = performance.now();

      // 1. Acoustic Spruce Body (right half)
      ctx.save();
      const bodyStartX = g.fretX(12);
      ctx.beginPath();
      ctx.moveTo(bodyStartX, g.boardTop - 16);
      ctx.bezierCurveTo(
        bodyStartX + 45,
        8,
        g.bridgeX + 20,
        6,
        g.bridgeX + 36,
        height * 0.25
      );
      ctx.lineTo(g.bridgeX + 36, height * 0.75);
      ctx.bezierCurveTo(
        g.bridgeX + 20,
        height - 6,
        bodyStartX + 45,
        height - 8,
        bodyStartX,
        g.boardBottom + 16
      );
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(bodyStartX, 0, g.bridgeX + 36, height);
      bodyGrad.addColorStop(0, '#ebd3ad');
      bodyGrad.addColorStop(0.5, '#f2dfc0');
      bodyGrad.addColorStop(1, '#dfc092');
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#9b6b3e';
      ctx.stroke();

      // Soundhole & rosette
      ctx.beginPath();
      ctx.arc(g.soundholeX, height / 2, g.soundholeR + 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#0d4a3e';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(g.soundholeX, height / 2, g.soundholeR + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#b85d2b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(g.soundholeX, height / 2, g.soundholeR, 0, Math.PI * 2);
      ctx.fillStyle = '#201814';
      ctx.fill();
      ctx.restore();

      // 2. Headstock stub on the left
      ctx.fillStyle = '#33251e';
      ctx.beginPath();
      ctx.roundRect(10, g.boardTop + 6, g.nutX - 10, g.boardHeight - 12, [6, 0, 0, 6]);
      ctx.fill();

      // 3. Rosewood Fretboard
      const neckGrad = ctx.createLinearGradient(0, g.boardTop, 0, g.boardBottom);
      neckGrad.addColorStop(0, '#443128');
      neckGrad.addColorStop(0.5, '#523b31');
      neckGrad.addColorStop(1, '#3b2922');
      ctx.fillStyle = neckGrad;
      ctx.fillRect(g.nutX, g.boardTop, g.neckEndX - g.nutX, g.boardHeight);

      ctx.strokeStyle = '#261a15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(g.nutX, g.boardTop, g.neckEndX - g.nutX, g.boardHeight);

      // 4. Bridge & Saddle
      ctx.fillStyle = '#2d1e18';
      ctx.beginPath();
      ctx.roundRect(g.bridgeX - 7, g.boardTop - 8, 22, g.boardHeight + 16, 4);
      ctx.fill();

      ctx.fillStyle = '#f8f5ef';
      ctx.fillRect(g.bridgeX - 1, g.boardTop - 2, 4, g.boardHeight + 4);

      // 5. Nut (Prăguș)
      ctx.fillStyle = '#f5f1e8';
      ctx.fillRect(g.nutX - 4, g.boardTop - 1, 5, g.boardHeight + 2);

      // 6. Frets & Inlays
      const inlayFrets = [3, 5, 7, 9, 12, 15];
      for (let f = 1; f <= MAX_FRETS; f++) {
        const x = g.fretX(f);
        ctx.strokeStyle = '#d3d7d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, g.boardTop + 1);
        ctx.lineTo(x, g.boardBottom - 1);
        ctx.stroke();

        // Fret number label along top edge
        const prevX = g.fretX(f - 1);
        const midX = (prevX + x) / 2;
        ctx.fillStyle = '#53665f';
        ctx.font = '500 10px "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(f), midX, g.boardTop - 8);

        if (inlayFrets.includes(f)) {
          ctx.fillStyle = 'rgba(242, 238, 228, 0.72)';
          if (f === 12) {
            ctx.beginPath();
            ctx.arc(midX, g.boardTop + g.boardHeight * 0.28, 4, 0, Math.PI * 2);
            ctx.arc(midX, g.boardTop + g.boardHeight * 0.72, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(midX, height / 2, 4.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Open string label
      ctx.fillStyle = '#53665f';
      ctx.font = '600 10px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('0', g.nutX - 14, g.boardTop - 8);

      // 7. Pick position vertical guide over strings (near soundhole/bridge)
      const pickX = g.bridgeX - pickPosition * g.scalePx;
      if (pickX > g.neckEndX && pickX < g.bridgeX - 8) {
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = 'rgba(184, 93, 43, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pickX, g.boardTop - 6);
        ctx.lineTo(pickX, g.boardBottom + 6);
        ctx.stroke();
        ctx.fillStyle = '#b85d2b';
        ctx.font = '600 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Ciupire p=${pickPosition.toFixed(2)}`, pickX, g.boardBottom + 20);
        ctx.restore();
      }

      // 8. Strings (with vibrating standing wave animation!)
      strings.forEach((s, idx) => {
        const y = g.stringY(idx);
        const fret = activeFrets ? activeFrets[s.id] : s.fret;
        const isMuted = fret === null;
        const pressedFret = fret ?? 0;

        // Open string note badge on left
        const openLabel = formatMidiLabel(s.openMidi, notation);
        const isSelected = s.id === selectedStringId;

        ctx.fillStyle = isSelected ? '#0d4a3e' : '#edf3f0';
        ctx.beginPath();
        ctx.roundRect(14, y - 10, g.nutX - 24, 20, 5);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#0d4a3e' : '#cbd7d0';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#ffffff' : '#13221d';
        ctx.font = '600 10.5px "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isMuted ? '×' : openLabel, 14 + (g.nutX - 24) / 2, y);

        // Vibration envelope
        const pluckTs = localPlucksRef.current[s.id] ?? 0;
        const elapsedSec = (now - pluckTs) / 1000;
        const isVibrating = !isMuted && pluckTs > 0 && elapsedSec < 2.2;
        const amp = isVibrating ? Math.exp(-elapsedSec * 2.1) * (4.5 + idx * 0.45) : 0;

        const startVibX = pressedFret > 0 ? g.fretX(pressedFret) : g.nutX;
        const vibLen = g.bridgeX - startVibX;

        // Draw non-vibrating segment (nut -> fret)
        ctx.strokeStyle = isMuted
          ? 'rgba(180, 180, 180, 0.4)'
          : idx >= 2
          ? '#c7975c' // bronze wound strings
          : '#d6dde0'; // plain steel strings
        ctx.lineWidth = Math.max(1.1, s.gaugeMm * 2.1);

        if (pressedFret > 0) {
          ctx.beginPath();
          ctx.moveTo(g.nutX, y);
          ctx.lineTo(startVibX, y);
          ctx.stroke();
        }

        // Draw vibrating segment (startVibX -> bridgeX)
        ctx.beginPath();
        if (!isVibrating) {
          ctx.moveTo(startVibX, y);
          ctx.lineTo(g.bridgeX, y);
        } else {
          const modeN = showHarmonicNodes && isSelected ? showHarmonicNodes : 1;
          const phase = Math.sin(elapsedSec * (32 + idx * 5));
          const steps = 64;
          for (let i = 0; i <= steps; i++) {
            const u = i / steps;
            const px = startVibX + u * vibLen;
            const envelope = Math.sin(modeN * Math.PI * u) * phase;
            const py = y + amp * envelope;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        // Draw harmonic nodes if requested on selected string
        if (showHarmonicNodes && showHarmonicNodes > 1 && isSelected) {
          for (let k = 1; k < showHarmonicNodes; k++) {
            const nx = startVibX + (k / showHarmonicNodes) * vibLen;
            ctx.fillStyle = '#0d4a3e';
            ctx.beginPath();
            ctx.arc(nx, y, 3.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Scale note markers on fretboard
        if (highlightedPitchClasses.length > 0) {
          for (let f = 0; f <= MAX_FRETS; f++) {
            const midi = s.openMidi + f;
            const pc = ((midi % 12) + 12) % 12;
            if (highlightedPitchClasses.includes(pc)) {
              const mx = f === 0 ? g.nutX - 4 : (g.fretX(f - 1) + g.fretX(f)) / 2;
              const isRoot = rootPitchClass === pc;
              ctx.fillStyle = isRoot ? '#0d4a3e' : '#b85d2b';
              ctx.beginPath();
              ctx.arc(mx, y, isRoot ? 8.5 : 7, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.3;
              ctx.stroke();

              ctx.fillStyle = '#ffffff';
              ctx.font = '600 8.5px "Segoe UI", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const shortName = formatMidiLabel(midi, notation).replace(/\d+$/, '');
              ctx.fillText(shortName, mx, y + 0.5);
            }
          }
        }

        // Target note position markers
        highlightedPositions.forEach((pos) => {
          if (pos.stringId === s.id && pos.fret <= MAX_FRETS) {
            const mx = pos.fret === 0 ? g.nutX - 4 : (g.fretX(pos.fret - 1) + g.fretX(pos.fret)) / 2;
            ctx.fillStyle = 'rgba(184, 93, 43, 0.9)';
            ctx.beginPath();
            ctx.arc(mx, y, 7.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });

        // Pressed fret finger dot
        if (!isMuted && pressedFret > 0) {
          const fx = (g.fretX(pressedFret - 1) + g.fretX(pressedFret)) / 2;
          ctx.fillStyle = '#0d4a3e';
          ctx.beginPath();
          ctx.arc(fx, y, 9.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 9.5px "Consolas", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(pressedFret), fx, y + 0.5);
        }
      });

      // Hover indicator
      if (hoverInfo) {
        const idx = strings.findIndex((s) => s.id === hoverInfo.stringId);
        if (idx >= 0) {
          const y = g.stringY(idx);
          const hx =
            hoverInfo.fret === 0
              ? g.nutX - 4
              : (g.fretX(hoverInfo.fret - 1) + g.fretX(hoverInfo.fret)) / 2;
          ctx.strokeStyle = 'rgba(13, 74, 62, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(hx, y, 10.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [
    strings,
    notation,
    selectedStringId,
    activeFrets,
    highlightedPitchClasses,
    rootPitchClass,
    highlightedPositions,
    pickPosition,
    showHarmonicNodes,
    hoverInfo,
    compact,
  ]);

  const hitTest = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const g = getGeometry(rect.width, rect.height);

    // Closest string
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < strings.length; i++) {
      const dist = Math.abs(y - g.stringY(i));
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    if (bestDist > 26) return null;
    const str = strings[bestIdx];

    // Check if over body/pluck zone (past neckEndX)
    if (x > g.neckEndX) {
      const currentFret = activeFrets ? activeFrets[str.id] ?? 0 : str.fret ?? 0;
      const freq = getFretFrequency(str.openFrequency, currentFret);
      return {
        zone: 'pluck' as const,
        stringId: str.id,
        fret: currentFret,
        freq,
        label: formatMidiLabel(str.openMidi + currentFret, notation),
      };
    }

    // Check fret 0..MAX_FRETS
    let hitFret = 0;
    if (x >= g.nutX) {
      for (let f = 1; f <= MAX_FRETS; f++) {
        if (x <= g.fretX(f)) {
          hitFret = f;
          break;
        }
      }
      if (x > g.fretX(MAX_FRETS)) hitFret = MAX_FRETS;
    }

    const freq = getFretFrequency(str.openFrequency, hitFret);
    return {
      zone: 'fretboard' as const,
      stringId: str.id,
      fret: hitFret,
      freq,
      label: formatMidiLabel(str.openMidi + hitFret, notation),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) return;

    if (hit.zone === 'fretboard') {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDraggingFret(true);
      onSelectFret?.(hit.stringId, hit.fret);
      onPluckString?.(hit.stringId, hit.fret, hit.freq);
    } else {
      onPluckString?.(hit.stringId, hit.fret, hit.freq);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) {
      setHoverInfo(null);
      return;
    }
    setHoverInfo({
      stringId: hit.stringId,
      fret: hit.fret,
      label: hit.label,
      freq: hit.freq,
    });

    if (isDraggingFret && hit.zone === 'fretboard') {
      onSelectFret?.(hit.stringId, hit.fret);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingFret(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingFret(false);
    setHoverInfo(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="grid h-[3.75rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[minmax(0,1fr)_1.25rem] items-center gap-x-3 text-xs text-[#53665f]">
        <span className="line-clamp-2 leading-5">
          Click sau trage pe manșon pentru a apăsa un fret · Click pe corzi în dreapta pentru a ciupi
        </span>
        <span aria-live="polite" className="col-start-1 row-start-2 min-h-5 truncate font-mono font-medium text-[#0d4a3e] tabular-nums">
          {hoverInfo
            ? `Coarda ${hoverInfo.stringId} · Fret ${hoverInfo.fret} · ${hoverInfo.label} (${hoverInfo.freq.toFixed(1)} Hz)`
            : '\u00a0'}
        </span>
        {onStrumAll && (
          <button
            type="button"
            data-guitar-quick-action="strum"
            onClick={onStrumAll}
            className="col-start-2 row-span-2 row-start-1 min-h-11 w-max whitespace-nowrap rounded-lg bg-[#0d4a3e] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#09382f] cursor-pointer"
          >
            Ciupire toate corzile (Strum)
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-xl border border-[#d8e2dc] bg-[#fafcfa]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={() => setIsDraggingFret(false)}
          onPointerLeave={() => {
            setHoverInfo(null);
          }}
          className="block w-full cursor-pointer select-none touch-pan-y"
        />
      </div>
    </div>
  );
};

