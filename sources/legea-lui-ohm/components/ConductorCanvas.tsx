"use client";

import { useEffect, useRef } from "react";
import { elapsedSeconds, prepareCanvas, roundedRect } from "@/lib/canvas";
import { useTheme } from "./ThemeProvider";

interface ConductorCanvasProps {
  /** Intensitatea curentului, A */
  current: number;
  /** Rezistența, Ω */
  resistance: number;
  /** Temperatura conductorului, °C */
  temperature: number;
  /** Nume material, pentru etichetă */
  material: string;
  /** Modul bec aprinde filamentul */
  glowing: boolean;
  /** Intensitate relativă 0..1 pentru luminozitate */
  load: number;
}

const LATTICE_ROWS = 4;
const LATTICE_COLS = 9;
const ELECTRONS = 26;

export function ConductorCanvas({
  current,
  resistance,
  temperature,
  material,
  glowing,
  load,
}: ConductorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ current, resistance, temperature, material, glowing, load });
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    stateRef.current = { current, resistance, temperature, material, glowing, load };
  }, [current, resistance, temperature, material, glowing, load]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    let visible = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();

    const draw = (now: number) => {
      const state = stateRef.current;
      const dark = themeRef.current === "dark";
      const prepared = prepareCanvas(canvas);
      if (!prepared) return;
      const { ctx, width: w, height: h } = prepared;

      const hot = Math.min(1, Math.max(0, (state.temperature - 20) / 780));
      const palette = {
        body: dark ? "#0c1524" : "#fffdf9",
        stroke: dark ? "#2b3d5b" : "#ddd3c3",
        inner: dark ? "#081120" : "#f4efe4",
        lattice: dark ? "#4d6c8c" : "#a9b4c2",
        latticeHot: dark ? "#e2a06a" : "#c07a3e",
        electron: dark ? "#8fe3f2" : "#0f6f84",
        electronCore: dark ? "#eafaff" : "#c9f1f8",
        text: dark ? "#e8edf6" : "#1b2029",
        muted: dark ? "#7c889c" : "#858b96",
        copper: dark ? "#e2a06a" : "#b96f33",
        amber: dark ? "#edb85f" : "#d0912c",
        glow: dark ? "rgba(237,184,95,.55)" : "rgba(224,165,63,.45)",
      };

      ctx.clearRect(0, 0, w, h);

      const bodyLeft = w * 0.07;
      const bodyRight = w * 0.93;
      const bodyTop = h * 0.3;
      const bodyBottom = h * 0.78;
      const bodyH = bodyBottom - bodyTop;

      // glow halo when the filament is lit
      if (state.glowing && state.load > 0.02) {
        const centerX = (bodyLeft + bodyRight) / 2;
        const centerY = (bodyTop + bodyBottom) / 2;
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          10,
          centerX,
          centerY,
          Math.max(w, h) * 0.62,
        );
        gradient.addColorStop(0, palette.glow.replace(/[\d.]+\)$/, `${0.55 * state.load})`));
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // conductor body
      roundedRect(ctx, bodyLeft, bodyTop, bodyRight - bodyLeft, bodyH, 20);
      ctx.fillStyle = state.glowing
        ? dark
          ? "#1a1608"
          : "#fdf6e6"
        : palette.body;
      ctx.fill();
      ctx.strokeStyle = hot > 0.3 ? palette.latticeHot : palette.stroke;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // inner chamber
      roundedRect(ctx, bodyLeft + 6, bodyTop + 6, bodyRight - bodyLeft - 12, bodyH - 12, 15);
      ctx.fillStyle = state.glowing
        ? dark
          ? "#241d08"
          : "#fdf3dc"
        : palette.inner;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      roundedRect(ctx, bodyLeft + 6, bodyTop + 6, bodyRight - bodyLeft - 12, bodyH - 12, 15);
      ctx.clip();

      // heat tint
      if (hot > 0.02) {
        ctx.fillStyle = `rgba(224,140,60,${0.1 + hot * 0.22})`;
        ctx.fillRect(bodyLeft, bodyTop, bodyRight - bodyLeft, bodyH);
      }
      if (state.glowing && state.load > 0.02) {
        // filament bands, brighter with load
        for (let index = 0; index < 4; index += 1) {
          const y = bodyTop + bodyH * (0.26 + index * 0.16);
          ctx.strokeStyle = `rgba(255,${190 + index * 10},${90 + index * 24},${0.28 + state.load * 0.5})`;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(bodyLeft + 8, y);
          ctx.bezierCurveTo(
            bodyLeft + (bodyRight - bodyLeft) * 0.33,
            y - 10,
            bodyLeft + (bodyRight - bodyLeft) * 0.66,
            y + 10,
            bodyRight - 8,
            y,
          );
          ctx.stroke();
        }
      }

      // crystalline lattice
      const colStep = (bodyRight - bodyLeft - 24) / (LATTICE_COLS - 1);
      const rowStep = (bodyH - 24) / (LATTICE_ROWS + 1);
      const jitter = hot * 1.6;
      const t = reduced ? 0 : elapsedSeconds(now, started);
      for (let row = 0; row < LATTICE_ROWS; row += 1) {
        for (let col = 0; col < LATTICE_COLS; col += 1) {
          const baseX = bodyLeft + 12 + col * colStep;
          const baseY = bodyTop + 12 + (row + 1) * rowStep;
          const dx = reduced ? 0 : Math.sin(t * (1.4 + hot * 2.4) + row * 1.7 + col) * jitter;
          const dy = reduced ? 0 : Math.cos(t * (1.2 + hot * 2.1) + col * 1.3 + row) * jitter;
          ctx.beginPath();
          ctx.arc(baseX + dx, baseY + dy, 3.1, 0, Math.PI * 2);
          ctx.fillStyle = hot > 0.25 ? palette.latticeHot : palette.lattice;
          ctx.globalAlpha = 0.4 + hot * 0.35;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // drifting electrons: speed saturates visually
      const currentMagnitude = Math.abs(state.current);
      const drift = Math.min(1, Math.pow(currentMagnitude / 0.4, 0.55));
      const direction = state.current >= 0 ? 1 : -1;
      const span = bodyRight - bodyLeft - 22;
      const jitterY = 6;
      for (let index = 0; index < ELECTRONS; index += 1) {
        const lane = (index % 5) - 2;
        const speed = 0.055 + (index % 4) * 0.008;
        const phase = ((index * 0.0387 + t * speed * (0.15 + drift * 1.9) * direction) % 1 + 1) % 1;
        const x = bodyLeft + 11 + phase * span;
        const y =
          bodyTop + bodyH / 2 +
          lane * (bodyH / 7) +
          Math.sin(t * 2.2 + index * 1.9) * jitterY * (0.4 + hot * 0.1);
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = palette.electron;
        ctx.globalAlpha = 0.2 + drift * 0.18;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = palette.electronCore;
        ctx.globalAlpha = 0.75 + drift * 0.25;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // terminal labels
      ctx.font = '600 11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("−", bodyLeft - 2, bodyTop - 22);
      ctx.fillText("+", bodyRight - 8, bodyTop - 22);

      // current direction arrow above the conductor
      const arrowY = bodyTop - 12;
      const from = direction > 0 ? bodyLeft + 6 : bodyRight - 6;
      const to = direction > 0 ? bodyRight - 6 : bodyLeft + 6;
      if (currentMagnitude > 0.0002) {
        ctx.strokeStyle = palette.copper;
        ctx.fillStyle = palette.copper;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.35 + drift * 0.55;
        ctx.beginPath();
        ctx.moveTo(from, arrowY);
        ctx.lineTo(to, arrowY);
        ctx.stroke();
        const dir = direction;
        ctx.beginPath();
        ctx.moveTo(to, arrowY);
        ctx.lineTo(to - dir * 7, arrowY - 4);
        ctx.lineTo(to - dir * 7, arrowY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.fillStyle = palette.copper;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("I", (from + to) / 2, arrowY - 6);
      }

      // footer text
      ctx.font = '10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(state.material, bodyLeft, bodyBottom + 10);
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(state.temperature)} °C`, bodyRight, bodyBottom + 10);
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reduced) {
        frame = window.requestAnimationFrame(loop);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) {
          if (!frame) frame = window.requestAnimationFrame(loop);
        } else if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);
    frame = window.requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="conductor-canvas"
      role="img"
      aria-label={`Conductor din ${material} cu rețea cristalină și electroni în mișcare. Curentul este ${(Math.abs(current) * 1000).toFixed(1)} miliamperi, temperatura ${Math.round(temperature)} grade Celsius.`}
    />
  );
}
