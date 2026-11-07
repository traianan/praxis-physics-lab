"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawArrow, prepareCanvas } from "@/lib/canvas";
import { clamp } from "@/lib/resistance";
import { useTheme } from "./ThemeProvider";

interface IuChartProps {
  /** Rezistența firului, în ohmi. */
  resistance: number;
  /** Curentul de lucru, în amperi. */
  current: number;
  onCurrent: (amperes: number) => void;
}

interface Scale {
  plot: { x: number; y: number; w: number; h: number };
  iMax: number;
  uMax: number;
  uDecimals: number;
  iDecimals: number;
}

/**
 * Pas „rotund” (1, 2, 2,5 sau 5 ori o putere a lui 10) pentru o axă cu
 * patru diviziuni, astfel încât etichetele să fie numere curate.
 */
function niceStep(range: number): number {
  const safe = Math.max(range / 4, 1e-12);
  const exponent = Math.floor(Math.log10(safe));
  const base = Math.pow(10, exponent);
  const normalized = safe / base;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * base;
}

function tickDecimals(step: number): number {
  if (step >= 10) return 0;
  if (step >= 1) return 1;
  if (step >= 0.1) return 2;
  if (step >= 0.01) return 3;
  return 4;
}

export function IuChart({ resistance, current, onCurrent }: IuChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scaleRef = useRef<Scale | null>(null);
  const dragScaleRef = useRef<Scale | null>(null);
  const draggingRef = useRef(false);
  const { theme } = useTheme();

  const voltage = current * resistance;

  // Domeniile se recalculează în jurul punctului de funcționare, dar rămân
  // înghețate cât timp se trage, ca punctul să se miște, nu axa.
  const uStep = niceStep(Math.max(voltage * 1.15, 0.002));
  const iStep = niceStep(Math.max(current * 1.15, 0.002));
  const domain = {
    iMax: iStep * 4,
    uMax: uStep * 4,
    uDecimals: tickDecimals(uStep),
    iDecimals: tickDecimals(iStep),
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const frame = prepareCanvas(canvas);
    if (!frame) return;
    const { ctx, width, height } = frame;
    const dark = theme === "dark";

    const palette = {
      axis: dark ? "#7d919b" : "#6d7c85",
      grid: dark ? "rgba(231,237,240,.07)" : "rgba(34,48,58,.07)",
      text: dark ? "#e7edf0" : "#22303a",
      muted: dark ? "#7d919b" : "#83939b",
      surface: dark ? "#101b22" : "#fffdf9",
      line: dark ? "#e9bb6f" : "#a8763f",
      lineGlow: dark ? "rgba(233,187,111,.3)" : "rgba(168,118,63,.22)",
      point: dark ? "#8fd3b6" : "#2f7d68",
      guide: dark ? "rgba(231,237,240,.22)" : "rgba(34,48,58,.18)",
      area: dark ? "rgba(233,187,111,.1)" : "rgba(168,118,63,.09)",
    };

    const padL = width < 480 ? 50 : 62;
    const padR = 18;
    const padT = 24;
    const padB = 34;
    const plot = {
      x: padL,
      y: padT,
      w: Math.max(24, width - padL - padR),
      h: Math.max(24, height - padT - padB),
    };
    const active = draggingRef.current && dragScaleRef.current ? dragScaleRef.current : {
      plot,
      ...domain,
    };
    const { iMax, uMax } = active;
    // Rezervă: o scală înghețată dintr-un render anterior poate să nu aibă
    // încă preciziile calculate.
    const uDecimals = active.uDecimals ?? 2;
    const iDecimals = active.iDecimals ?? 2;
    const X = (u: number) => plot.x + plot.w * clamp(u / uMax, 0, 1);
    const Y = (i: number) => plot.y + plot.h * (1 - clamp(i / iMax, 0, 1));
    scaleRef.current = { plot, iMax, uMax, uDecimals, iDecimals };

    ctx.clearRect(0, 0, width, height);

    // grilă
    ctx.save();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const x = plot.x + (plot.w * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x, plot.y);
      ctx.lineTo(x, plot.y + plot.h);
      ctx.stroke();
    }
    for (let j = 0; j <= 4; j += 1) {
      const y = plot.y + (plot.h * j) / 4;
      ctx.beginPath();
      ctx.moveTo(plot.x, y);
      ctx.lineTo(plot.x + plot.w, y);
      ctx.stroke();
    }
    ctx.restore();

    // axe
    drawArrow(
      ctx,
      plot.x,
      plot.y + plot.h,
      plot.x + plot.w,
      plot.y + plot.h,
      palette.axis,
      6,
      1.2,
    );
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x, plot.y, palette.axis, 6, 1.2);

    // etichete de scală
    ctx.font = '10px "Cascadia Code", Consolas, monospace';
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    // Sub 1 V, axa se citește mai ușor în milivolți.
    const useMillivolts = uMax < 1;
    for (let i = 0; i <= 4; i += 1) {
      const u = (uMax * i) / 4;
      ctx.fillText(
        i === 0
          ? "0"
          : useMillivolts
            ? (u * 1000).toFixed(u * 1000 < 10 ? 1 : 0).replace(".", ",")
            : u.toFixed(uDecimals).replace(".", ","),
        plot.x + (plot.w * i) / 4,
        plot.y + plot.h + 8,
      );
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let j = 0; j <= 4; j += 1) {
      const i = (iMax * j) / 4;
      ctx.fillText(
        j === 0 ? "0" : i.toFixed(iDecimals).replace(".", ","),
        plot.x - 8,
        plot.y + plot.h - (plot.h * j) / 4,
      );
    }

    ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
    ctx.fillStyle = palette.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("I (A)", plot.x, plot.y - 6);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(
      useMillivolts ? "U (mV)" : "U (V)",
      plot.x + plot.w,
      plot.y + plot.h + 22,
    );

    // dreapta de sarcină I = U/R
    const slope = 1 / Math.max(resistance, 1e-9);
    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.x, plot.y, plot.w, plot.h);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(uMax), Y(Math.min(slope * uMax, iMax * 4)));
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.shadowColor = palette.lineGlow;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // zona sub dreaptă până la punctul de funcționare
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(voltage), Y(current));
    ctx.lineTo(X(voltage), Y(0));
    ctx.closePath();
    ctx.fillStyle = palette.area;
    ctx.fill();
    ctx.restore();

    // ghidaje
    ctx.save();
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(X(voltage), Y(current));
    ctx.lineTo(X(voltage), Y(0));
    ctx.moveTo(X(voltage), Y(current));
    ctx.lineTo(plot.x, Y(current));
    ctx.stroke();
    ctx.restore();

    // punctul de funcționare
    const px = X(voltage);
    const py = Y(current);
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fillStyle = palette.lineGlow;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = palette.point;
    ctx.fill();
    ctx.strokeStyle = palette.surface;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // eticheta punctului
    const isRight = px > plot.x + plot.w * 0.68;
    ctx.save();
    ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
    const tag = `I = ${current >= 1 ? current.toFixed(1).replace(".", ",") : current.toFixed(2).replace(".", ",")} A`;
    const tagWidth = ctx.measureText(tag).width;
    const tagX = isRight ? px - tagWidth - 14 : px + 12;
    ctx.fillStyle = dark ? "rgba(16,27,34,.9)" : "rgba(255,253,249,.92)";
    ctx.fillRect(tagX - 3, py - (py < plot.y + 30 ? -12 : 22), tagWidth + 6, 14);
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(tag, tagX, py - (py < plot.y + 30 ? -19 : 15));
    ctx.restore();
  }, [
    theme,
    resistance,
    current,
    voltage,
    domain.iMax,
    domain.uMax,
    domain.uDecimals,
    domain.iDecimals,
  ]);

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
    const scale = dragScaleRef.current;
    if (!canvas || !scale) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = (x - scale.plot.x) / scale.plot.w;
    const volts = clamp(ratio * scale.uMax, 0, scale.uMax);
    onCurrent(volts / Math.max(resistance, 1e-9));
  };

  return (
    <canvas
      ref={canvasRef}
      className="iu-canvas"
      role="img"
      aria-label={`Grafic intensitate-tensiune pentru o rezistență de ${resistance.toFixed(
        3,
      )} ohmi. La ${voltage.toFixed(3)} volți, curentul este de ${current.toFixed(
        3,
      )} amperi.`}
      onPointerDown={(event) => {
        draggingRef.current = true;
        dragScaleRef.current = scaleRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
        scrub(event);
      }}
      onPointerMove={(event) => {
        if (draggingRef.current) scrub(event);
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        dragScaleRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        dragScaleRef.current = null;
      }}
    />
  );
}
