"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawArrow, prepareCanvas, tickLabel } from "@/lib/canvas";
import { clamp } from "@/lib/physics";
import { useTheme } from "./ThemeProvider";

export interface RecordedPoint {
  id: number;
  u: number;
  i: number;
  r: number;
}

interface UIPlotProps {
  uMax: number;
  iMax: number;
  /** Curba dipolului: I(U) */
  curve: (u: number) => number;
  /** Dreapta ohmică de referință (R fix), dacă există */
  reference: { resistance: number; label: string } | null;
  voltage: number;
  recorded: RecordedPoint[];
  onScrub: (voltage: number) => void;
  axisCaption: string;
}

interface Scale {
  plot: { x: number; y: number; w: number; h: number };
  uMax: number;
}

const MONO = '11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';

export function UIPlot({
  uMax,
  iMax,
  curve,
  reference,
  voltage,
  recorded,
  onScrub,
  axisCaption,
}: UIPlotProps) {
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
      curve: dark ? "#5fc3d9" : "#0f6f84",
      curveGlow: dark ? "rgba(95,195,217,.4)" : "rgba(15,111,132,.24)",
      surface: dark ? "#101a2b" : "#fffdf9",
      guide: dark ? "rgba(232,237,246,.22)" : "rgba(27,32,41,.18)",
      reference: dark ? "rgba(226,160,106,.55)" : "rgba(192,122,62,.5)",
      point: dark ? "#edb85f" : "#b1741f",
      recorded: dark ? "rgba(143,227,242,.75)" : "rgba(15,111,132,.6)",
      area: dark ? "rgba(95,195,217,.1)" : "rgba(15,111,132,.09)",
    };

    const padL = width < 520 ? 48 : 60;
    const padR = 18;
    const padT = 26;
    const padB = 42;
    const plot = {
      x: padL,
      y: padT,
      w: Math.max(20, width - padL - padR),
      h: Math.max(20, height - padT - padB),
    };
    const X = (u: number) => plot.x + plot.w * clamp(u / uMax, 0, 1);
    const Y = (i: number) => plot.y + plot.h - plot.h * clamp(i / iMax, 0, 1);
    scaleRef.current = { plot, uMax };

    ctx.clearRect(0, 0, width, height);

    // grid
    ctx.save();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let index = 0; index <= 6; index += 1) {
      const x = plot.x + (plot.w * index) / 6;
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

    // axes
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x + plot.w + 6, plot.y + plot.h, palette.axis, 6, 1.2);
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x, plot.y - 6, palette.axis, 6, 1.2);

    ctx.font = MONO;
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let index = 1; index <= 6; index += 1) {
      const u = (uMax * index) / 6;
      ctx.fillText(tickLabel(u), plot.x + (plot.w * index) / 6, plot.y + plot.h + 9);
    }
    ctx.fillText("0", plot.x, plot.y + plot.h + 9);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let index = 1; index <= 4; index += 1) {
      const i = (iMax * index) / 4;
      ctx.fillText(tickLabel(i * 1000), plot.x - 9, plot.y + plot.h - (plot.h * index) / 4);
    }
    ctx.fillText("0", plot.x - 9, plot.y + plot.h);

    ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
    ctx.fillStyle = palette.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("I (mA)", plot.x - 2, plot.y - 9);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("U (V)", plot.x + plot.w, plot.y + plot.h + 24);

    // reference straight line
    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.x, plot.y - 4, plot.w, plot.h + 8);
    ctx.clip();

    if (reference) {
      const iRef = uMax / reference.resistance;
      ctx.strokeStyle = palette.reference;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0));
      ctx.lineTo(X(uMax), Y(iRef));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.reference;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      const labelY = Y(iRef) - 6;
      ctx.fillText(reference.label, X(uMax) - 4, clamp(labelY, plot.y + 12, plot.y + plot.h - 4));
    }

    // area under the current curve up to the operating point
    const areaEnd = clamp(voltage, 0.001, uMax);
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    const areaSteps = 40;
    for (let index = 0; index <= areaSteps; index += 1) {
      const u = (areaEnd * index) / areaSteps;
      ctx.lineTo(X(u), Y(curve(u)));
    }
    ctx.lineTo(X(areaEnd), Y(0));
    ctx.closePath();
    ctx.fillStyle = palette.area;
    ctx.fill();

    // dipole curve
    ctx.beginPath();
    const steps = 160;
    for (let index = 0; index <= steps; index += 1) {
      const u = (uMax * index) / steps;
      const i = curve(u);
      if (index === 0) ctx.moveTo(X(u), Y(i));
      else ctx.lineTo(X(u), Y(i));
    }
    ctx.strokeStyle = palette.curve;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.shadowColor = palette.curveGlow;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // recorded points
    for (const point of recorded) {
      const px = X(point.u);
      const py = Y(point.i);
      ctx.beginPath();
      ctx.arc(px, py, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = palette.surface;
      ctx.fill();
      ctx.strokeStyle = palette.recorded;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // operating point guides
    const current = curve(voltage);
    const px = X(voltage);
    const py = Y(current);
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

    // operating point
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fillStyle = palette.curveGlow;
    ctx.globalAlpha = 0.45;
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

    // point labels, kept inside the plot
    ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    const uLabel = `${tickLabel(voltage)} V`;
    const iLabel = `${tickLabel(current * 1000)} mA`;
    const labelRight = px + 54 < plot.x + plot.w;
    ctx.fillStyle = palette.surface;
    ctx.globalAlpha = 0.86;
    ctx.fillRect(
      labelRight ? px + 12 : px - 12 - 56,
      py - 30,
      56,
      30,
    );
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.point;
    ctx.textAlign = labelRight ? "left" : "right";
    ctx.textBaseline = "middle";
    const labelX = labelRight ? px + 16 : px - 16;
    ctx.fillText(uLabel, labelX, py - 22);
    ctx.fillText(iLabel, labelX, py - 11);

    // caption
    ctx.font = '10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(axisCaption, plot.x, plot.y + 2);
  }, [uMax, iMax, curve, reference, voltage, recorded, axisCaption, theme]);

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
    const u = (scale.uMax * (x - scale.plot.x)) / scale.plot.w;
    onScrub(clamp(u, 0, scale.uMax));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrub(event);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    scrub(event);
  };

  const endDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="ui-canvas"
      role="img"
      aria-label={`Caracteristica curent-tensiune. Punct de lucru: ${voltage.toFixed(2)} volți, ${(curve(voltage) * 1000).toFixed(1)} miliamperi. Trage pe grafic pentru a modifica tensiunea.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  );
}
