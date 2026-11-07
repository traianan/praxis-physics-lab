"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawArrow, formatTick, prepareCanvas } from "@/lib/canvas";
import { clamp, type ProcessResult } from "@/lib/physics";
import { useTheme } from "./ThemeProvider";

interface PVChartProps {
  model: ProcessResult;
  progress: number;
  onScrub: (ratio: number) => void;
}

interface Scale {
  plot: { x: number; y: number; w: number; h: number };
  pMax: number;
  Vmax: number;
  p1: number;
  V1: number;
  isochoric: boolean;
}

const MONO = '11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';

export function PVChart({ model, progress, onScrub }: PVChartProps) {
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
      axis: dark ? "#9cb2a7" : "#6d8177",
      grid: dark ? "rgba(197,232,165,.075)" : "rgba(24,51,47,.075)",
      text: dark ? "#e8f1e9" : "#18332f",
      muted: dark ? "#7e978d" : "#7b8d83",
      curve: dark ? "#c5e8a5" : "#155a50",
      curveGlow: dark ? "rgba(197,232,165,.35)" : "rgba(21,90,80,.24)",
      surface: dark ? "#0e231d" : "#fffefa",
      guide: dark ? "rgba(232,241,233,.2)" : "rgba(24,51,47,.18)",
      areaPos: dark ? "rgba(197,232,165,.15)" : "rgba(47,125,104,.13)",
      areaNeg: dark ? "rgba(229,143,112,.14)" : "rgba(196,91,79,.11)",
      state1: dark ? "#e8b85c" : "#b17b20",
      state2: dark ? "#e58f70" : "#c45b4f",
      ghostIsobar: dark ? "rgba(116,179,220,.5)" : "rgba(79,143,191,.45)",
      ghostIsotherm: dark ? "rgba(111,201,191,.55)" : "rgba(79,168,160,.5)",
      ghostAdiabat: dark ? "rgba(232,184,92,.6)" : "rgba(177,123,32,.52)",
      ghostIsochor: dark ? "rgba(176,160,230,.55)" : "rgba(139,123,196,.5)",
      ghostLinear: dark ? "rgba(224,160,173,.6)" : "rgba(201,123,139,.55)",
    };

    const padL = width < 520 ? 44 : 56;
    const padR = 16;
    const padT = 24;
    const padB = 36;
    const plot = {
      x: padL,
      y: padT,
      w: Math.max(20, width - padL - padR),
      h: Math.max(20, height - padT - padB),
    };
    const pMax = Math.max(model.p1, model.p2, 1000) * 1.26;
    const Vmax = Math.max(model.V1, model.V2, 1e-6) * 1.28;
    const X = (v: number) => plot.x + plot.w * clamp(v / Vmax, 0, 1);
    const Y = (p: number) => plot.y + plot.h * (1 - clamp(p / pMax, 0, 1));

    scaleRef.current = {
      plot,
      pMax,
      Vmax,
      p1: model.p1,
      V1: model.V1,
      isochoric: model.isochoric,
    };

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.save();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    const cols = 5;
    const rows = 4;
    for (let i = 0; i <= cols; i += 1) {
      const x = plot.x + (plot.w * i) / cols;
      ctx.beginPath();
      ctx.moveTo(x, plot.y);
      ctx.lineTo(x, plot.y + plot.h);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j += 1) {
      const y = plot.y + (plot.h * j) / rows;
      ctx.beginPath();
      ctx.moveTo(plot.x, y);
      ctx.lineTo(plot.x + plot.w, y);
      ctx.stroke();
    }
    ctx.restore();

    // Axes
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h, palette.axis, 6, 1.2);
    drawArrow(ctx, plot.x, plot.y + plot.h, plot.x, plot.y, palette.axis, 6, 1.2);

    ctx.font = MONO;
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 1; i <= cols; i += 1) {
      const v = (Vmax * i) / cols;
      ctx.fillText(formatTick(v * 1000), plot.x + (plot.w * i) / cols, plot.y + plot.h + 8);
    }
    ctx.fillText("0", plot.x, plot.y + plot.h + 8);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let j = 1; j <= rows; j += 1) {
      const p = (pMax * j) / rows;
      ctx.fillText(formatTick(p / 1000), plot.x - 8, plot.y + plot.h - (plot.h * j) / rows);
    }
    ctx.fillText("0", plot.x - 8, plot.y + plot.h);

    ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
    ctx.fillStyle = palette.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("p (kPa)", plot.x, plot.y - 7);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("V (L)", plot.x + plot.w, plot.y + plot.h + 22);

    // Ghost family
    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.x + 1, plot.y + 1, plot.w - 2, plot.h - 2);
    ctx.clip();
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 5]);

    const ghostPath = (exponent: number) => {
      const start = Vmax * 0.1;
      const end = Vmax * 0.985;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 160; i += 1) {
        const v = start + ((end - start) * i) / 160;
        const p = model.p1 * Math.pow(model.V1 / v, exponent);
        if (!Number.isFinite(p) || p <= 0 || p > pMax * 1.12) continue;
        const x = X(v);
        const y = Y(p);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    ctx.strokeStyle = palette.ghostIsobar;
    ctx.beginPath();
    ctx.moveTo(plot.x, Y(model.p1));
    ctx.lineTo(plot.x + plot.w * 0.96, Y(model.p1));
    ctx.stroke();

    ctx.strokeStyle = palette.ghostIsotherm;
    ghostPath(1);

    ctx.strokeStyle = palette.ghostAdiabat;
    ghostPath(model.gas.gamma);

    ctx.strokeStyle = palette.ghostLinear;
    ghostPath(-1);

    ctx.strokeStyle = palette.ghostIsochor;
    ctx.beginPath();
    ctx.moveTo(X(model.V1), plot.y + plot.h);
    ctx.lineTo(X(model.V1), plot.y + 4);
    ctx.stroke();
    ctx.restore();

    // Ghost labels
    ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    const labelAt = (text: string, x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };
    labelAt("n = 0", plot.x + plot.w * 0.94, Y(model.p1) - 5, palette.ghostIsobar);
    labelAt(
      "n = 1",
      X(Vmax * 0.9),
      Y(model.p1 * model.V1 / (Vmax * 0.9)) - 5,
      palette.ghostIsotherm,
    );
    labelAt(
      "n = γ",
      X(Vmax * 0.94),
      Y(model.p1 * Math.pow(model.V1 / (Vmax * 0.94), model.gas.gamma)) - 5,
      palette.ghostAdiabat,
    );
    labelAt("n = −1", X(Vmax * 0.52), Y(model.p1 * 0.52) - 5, palette.ghostLinear);
    labelAt("V = ct", X(model.V1) - 6, plot.y + 14, palette.ghostIsochor);

    // Current curve (full, muted)
    const curvePressure = (v: number) =>
      model.p1 * Math.pow(model.V1 / Math.max(v, 1e-12), model.n ?? 1);
    const points: Array<{ v: number; p: number }> = [];
    if (!model.isochoric) {
      for (let i = 0; i <= 140; i += 1) {
        const v = model.V1 + ((model.V2 - model.V1) * i) / 140;
        points.push({ v, p: curvePressure(v) });
      }
    } else {
      for (let i = 0; i <= 80; i += 1) {
        points.push({
          v: model.V1,
          p: model.p1 + ((model.p2 - model.p1) * i) / 80,
        });
      }
    }

    const strokePoints = (list: Array<{ v: number; p: number }>, alpha: number, lineWidth: number) => {
      if (list.length < 2) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = palette.curve;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      list.forEach((point, index) => {
        const x = X(point.v);
        const y = Y(point.p);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    };

    strokePoints(points, 0.32, 2);

    const visibleCount = Math.max(1, Math.round((points.length - 1) * progress) + 1);
    const visible = points.slice(0, visibleCount);
    if (visible.length > 1) {
      if (!model.isochoric) {
        const areaColor = model.L >= 0 ? palette.areaPos : palette.areaNeg;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(X(visible[0].v), Y(0));
        visible.forEach((point) => ctx.lineTo(X(point.v), Y(point.p)));
        ctx.lineTo(X(visible[visible.length - 1].v), Y(0));
        ctx.closePath();
        ctx.fillStyle = areaColor;
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.shadowColor = palette.curveGlow;
      ctx.shadowBlur = 10;
      strokePoints(visible, 1, 3.2);
      ctx.restore();
    }

    // Guides for the final state
    if (!model.isochoric) {
      ctx.save();
      ctx.strokeStyle = palette.guide;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(X(model.V2), Y(model.p2));
      ctx.lineTo(X(model.V2), Y(0));
      ctx.moveTo(X(model.V2), Y(model.p2));
      ctx.lineTo(plot.x, Y(model.p2));
      ctx.stroke();
      ctx.restore();
    }

    // Markers
    const marker = (v: number, p: number, color: string, label: string, dim = false) => {
      const x = X(v);
      const y = Y(p);
      ctx.save();
      ctx.globalAlpha = dim ? 0.45 : 1;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = palette.surface;
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.font = '600 11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(label, x + 9, y - 6);
      ctx.restore();
    };

    marker(model.V1, model.p1, palette.state1, "1");
    marker(model.V2, model.p2, palette.state2, "2", progress < 0.92);

    const currentV = model.isochoric
      ? model.V1
      : model.V1 + (model.V2 - model.V1) * progress;
    const movingP = model.isochoric
      ? model.p1 + (model.p2 - model.p1) * progress
      : curvePressure(currentV);
    const cx = X(currentV);
    const cy = Y(movingP);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fillStyle = palette.curveGlow;
    ctx.globalAlpha = 0.55;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.curve;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.surface;
    ctx.stroke();
    ctx.restore();

    // Keep the two physical states visible above the moving marker.
    marker(model.V1, model.p1, palette.state1, "1");
    marker(model.V2, model.p2, palette.state2, "2", progress < 0.92);

    // Axis annotations for state 2, drawn inside the plot so they never
    // collide with the numeric tick labels.
    if (!model.isochoric) {
      ctx.font = '10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      const vx = Math.min(X(model.V2), plot.x + plot.w - 18);
      const vy = plot.y + plot.h - 6;
      const vw = ctx.measureText("V₂").width;
      ctx.fillStyle = palette.surface;
      ctx.globalAlpha = 0.82;
      ctx.fillRect(vx - vw / 2 - 2, vy - 11, vw + 4, 12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("V₂", vx, vy);

      const py = Y(model.p2);
      const pw = ctx.measureText("p₂").width;
      ctx.fillStyle = palette.surface;
      ctx.globalAlpha = 0.82;
      ctx.fillRect(plot.x + 4, py - 6, pw + 4, 12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("p₂", plot.x + 6, py);
    }
  }, [model, progress, theme]);

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
    const y = event.clientY - rect.top;
    const ratio = scale.isochoric
      ? (scale.pMax * (1 - (y - scale.plot.y) / scale.plot.h)) / scale.p1
      : (scale.Vmax * ((x - scale.plot.x) / scale.plot.w)) / scale.V1;
    onScrub(clamp(ratio, 0.4, 2.5));
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
      className={`pv-canvas ${model.isochoric ? "pv-canvas-vertical" : ""}`}
      role="img"
      aria-label={`Grafic presiune-volum pentru procesul ${model.info.name}. Starea 1: ${(model.p1 / 1000).toFixed(1)} kilopascali, ${(model.V1 * 1000).toFixed(1)} litri. Starea 2: ${(model.p2 / 1000).toFixed(1)} kilopascali, ${(model.V2 * 1000).toFixed(1)} litri.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  );
}
