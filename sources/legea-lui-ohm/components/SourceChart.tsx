"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawArrow, prepareCanvas, tickLabel } from "@/lib/canvas";
import { clamp } from "@/lib/physics";
import { useTheme } from "./ThemeProvider";

interface SourceChartProps {
  emf: number;
  internal: number;
  external: number;
  /** curentul de lucru, A */
  current: number;
  /** dacă se arată dreapta completă până la scurtcircuit */
  showFull: boolean;
  onScrub: (external: number) => void;
}

interface Scale {
  plot: { x: number; y: number; w: number; h: number };
  emf: number;
  internal: number;
  iMax: number;
}

/**
 * Caracteristica sursei U(I) = E − r·I, cu zona de funcționare marcată și
 * punctul de adaptare (R = r). Utilizatorul poate trage punctul de lucru.
 */
export function SourceChart({
  emf,
  internal,
  external,
  current,
  showFull,
  onScrub,
}: SourceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scaleRef = useRef<Scale | null>(null);
  const draggingRef = useRef(false);
  const { theme } = useTheme();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const frame = prepareCanvas(canvas);
    if (!frame) return;
    const { ctx, width, height } = frame;

    const dark = theme === "dark";
    const palette = {
      axis: dark ? "#8d9ab0" : "#6c7482",
      grid: dark ? "rgba(232,237,246,.07)" : "rgba(27,32,41,.07)",
      text: dark ? "#e8edf6" : "#1b2029",
      muted: dark ? "#7c889c" : "#858b96",
      curve: dark ? "#e2a06a" : "#b96f33",
      curveGlow: dark ? "rgba(226,160,106,.35)" : "rgba(185,111,51,.24)",
      surface: dark ? "#101a2b" : "#fffdf9",
      guide: dark ? "rgba(232,237,246,.2)" : "rgba(27,32,41,.16)",
      point: dark ? "#5fc3d9" : "#0f6f84",
      matched: dark ? "rgba(95,195,217,.9)" : "rgba(15,111,132,.85)",
      danger: dark ? "#ea8f7e" : "#b8503f",
      zoneFill: dark ? "rgba(95,195,217,.07)" : "rgba(15,111,132,.06)",
    };

    const padL = width < 520 ? 52 : 62;
    const padR = 22;
    const padT = 28;
    const padB = 44;
    const plot = {
      x: padL,
      y: padT,
      w: Math.max(20, width - padL - padR),
      h: Math.max(20, height - padT - padB),
    };

    const iMax = showFull ? emf / Math.max(internal, 1e-6) : Math.min(emf / Math.max(internal, 1e-6), Math.max(current * 2.4, 0.05));
    const X = (i: number) => plot.x + plot.w * clamp(i / iMax, 0, 1);
    const Y = (u: number) => plot.y + plot.h - plot.h * clamp(u / Math.max(emf, 1e-6), 0, 1);
    scaleRef.current = { plot, emf, internal, iMax };

    ctx.clearRect(0, 0, width, height);

    // grid
    ctx.save();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let index = 0; index <= 5; index += 1) {
      const x = plot.x + (plot.w * index) / 5;
      ctx.beginPath();
      ctx.moveTo(x, plot.y);
      ctx.lineTo(x, plot.y + plot.h);
      ctx.stroke();
    }
    for (let index = 0; index <= 4; index += 1) {
      const y = plot.y + (plot.h * index) / 4;
      ctx.beginPath();
      ctx.moveTo(plot.x, y);
      ctx.lineTo(plot.x + plot.w, y);
      ctx.stroke();
    }
    ctx.restore();

    // zona de funcționare normală (U > 0)
    ctx.save();
    ctx.fillStyle = palette.zoneFill;
    ctx.fillRect(plot.x, Y(emf), plot.w, Y(0) - Y(emf));
    ctx.restore();

    // axes
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x + plot.w + 6, plot.y + plot.h, palette.axis, 6, 1.2);
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x, plot.y - 6, palette.axis, 6, 1.2);

    ctx.font = '11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let index = 0; index <= 5; index += 1) {
      const i = (iMax * index) / 5;
      ctx.fillText(tickLabel(i * 1000), plot.x + (plot.w * index) / 5, plot.y + plot.h + 9);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let index = 0; index <= 4; index += 1) {
      const u = (emf * index) / 4;
      ctx.fillText(tickLabel(u), plot.x - 9, plot.y + plot.h - (plot.h * index) / 4);
    }
    ctx.fillText("0", plot.x - 9, plot.y + plot.h);

    ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
    ctx.fillStyle = palette.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("U (V)", plot.x - 2, plot.y - 9);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("I (mA)", plot.x + plot.w, plot.y + plot.h + 24);

    // caracteristica
    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.x, plot.y - 4, plot.w, plot.h + 8);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(X(0), Y(emf));
    ctx.lineTo(X(iMax), Y(Math.max(0, emf - internal * iMax)));
    ctx.strokeStyle = palette.curve;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.shadowColor = palette.curveGlow;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // punct de adaptare R = r
    const matchedCurrent = emf / (2 * internal);
    if (matchedCurrent <= iMax) {
      ctx.save();
      ctx.strokeStyle = palette.matched;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(X(matchedCurrent), Y(emf));
      ctx.lineTo(X(matchedCurrent), Y(emf / 2));
      ctx.lineTo(plot.x, Y(emf / 2));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(X(matchedCurrent), Y(emf / 2), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = palette.surface;
      ctx.fill();
      ctx.strokeStyle = palette.matched;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '600 9.5px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.matched;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("R = r", X(matchedCurrent) - 7, Y(emf / 2) - 7);
      ctx.restore();
    }

    // scurtcircuit
    if (showFull) {
      const isc = emf / Math.max(internal, 1e-6);
      ctx.save();
      ctx.strokeStyle = palette.danger;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(X(isc), Y(0));
      ctx.lineTo(X(isc), plot.y + plot.h);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(X(isc), Y(0), 4, 0, Math.PI * 2);
      ctx.fillStyle = palette.danger;
      ctx.fill();
      ctx.font = '600 9.5px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.danger;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("I sc", X(isc) - 6, plot.y + plot.h - 6);
      ctx.restore();
    }
    ctx.restore();

    // punct de lucru
    const px = X(current);
    const py = Y(emf - internal * current);
    ctx.save();
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, plot.y + plot.h);
    ctx.moveTo(px, py);
    ctx.lineTo(plot.x, py);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fillStyle = palette.curveGlow;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.point;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.surface;
    ctx.stroke();
    ctx.restore();

    ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    const labelRight = px + 78 < plot.x + plot.w;
    ctx.fillStyle = palette.surface;
    ctx.globalAlpha = 0.86;
    ctx.fillRect(labelRight ? px + 12 : px - 12 - 74, py - 16, 74, 22);
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.point;
    ctx.textAlign = labelRight ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`U = ${(emf - internal * current).toFixed(2)} V`, labelRight ? px + 16 : px - 16, py - 5);
  }, [emf, internal, current, showFull, theme]);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  const scrub = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const scale = scaleRef.current;
    if (!canvas || !scale) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const i = (scale.iMax * (x - scale.plot.x)) / scale.plot.w;
    if (i <= 0) {
      onScrub(Infinity);
      return;
    }
    onScrub(Math.max(0, scale.emf / i - scale.internal));
  };

  return (
    <canvas
      ref={canvasRef}
      className="source-canvas"
      role="img"
      aria-label={`Caracteristica sursei: tensiunea la borne scade liniar cu curentul, de la ${emf.toFixed(1)} volți în gol până la zero la scurtcircuit. Punct de lucru la ${(current * 1000).toFixed(1)} miliamperi și ${(emf - internal * current).toFixed(2)} volți.`}
      onPointerDown={(event) => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        scrub(event);
      }}
      onPointerMove={(event) => {
        if (draggingRef.current) scrub(event);
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    />
  );
}
