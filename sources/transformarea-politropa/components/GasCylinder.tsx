"use client";

import { useEffect, useRef } from "react";
import { prepareCanvas, roundedRect } from "@/lib/canvas";
import { clamp, type ProcessResult } from "@/lib/physics";
import { useTheme } from "./ThemeProvider";

interface GasCylinderProps {
  model: ProcessResult;
  progress: number;
}

const PARTICLE_COUNT = 18;

export function GasCylinder({ model, progress }: GasCylinderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ model, progress });
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    stateRef.current = { model, progress };
  }, [model, progress]);

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
      const current = state.model;
      const p = state.progress;
      const dark = themeRef.current === "dark";
      const frameData = prepareCanvas(canvas);
      if (!frameData) return;
      const { ctx, width: w, height: h } = frameData;

      const palette = {
        body: dark ? "#0b1f1a" : "#fbf9f2",
        bodyStroke: dark ? "#2b4c40" : "#c9d5c6",
        inner: dark ? "#081713" : "#f4f1e6",
        piston: dark ? "#c5e8a5" : "#155a50",
        pistonDark: dark ? "#9ed46f" : "#0f4a42",
        rod: dark ? "#7e978d" : "#9aaca1",
        text: dark ? "#e8f1e9" : "#18332f",
        muted: dark ? "#7e978d" : "#7b8d83",
        molecule: dark ? "#c5e8a5" : "#2f7d68",
        glow: dark ? "rgba(197,232,165,.18)" : "rgba(47,125,104,.12)",
        heatIn: dark ? "#e58f70" : "#c45b4f",
        heatOut: dark ? "#74b3dc" : "#4f8fbf",
        gold: dark ? "#e8b85c" : "#b17b20",
        surface: dark ? "#0e231d" : "#fffefa",
      };

      ctx.clearRect(0, 0, w, h);

      const bodyLeft = w * 0.12;
      const bodyRight = w * 0.88;
      const bodyTop = h * 0.16;
      const bodyBottom = h * 0.83;
      const gasLeft = bodyLeft + 9;
      const maxPiston = bodyRight - 34;
      const Vmax = Math.max(current.V1, current.V2) * 1.18;
      const currentV = current.isochoric
        ? current.V1
        : current.V1 + (current.V2 - current.V1) * p;
      const gasWidth = Math.max(26, maxPiston - gasLeft);
      const pistonX = gasLeft + 12 + gasWidth * clamp(currentV / Vmax, 0.06, 1);

      // Cylinder body
      roundedRect(ctx, bodyLeft, bodyTop, bodyRight - bodyLeft, bodyBottom - bodyTop, 16);
      ctx.fillStyle = palette.body;
      ctx.fill();
      ctx.strokeStyle = palette.bodyStroke;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      roundedRect(ctx, bodyLeft + 5, bodyTop + 5, bodyRight - bodyLeft - 10, bodyBottom - bodyTop - 10, 12);
      ctx.strokeStyle = dark ? "rgba(197,232,165,.08)" : "rgba(16,63,59,.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Gas chamber
      const chamberTop = bodyTop + 12;
      const chamberBottom = bodyBottom - 12;
      ctx.save();
      ctx.beginPath();
      ctx.rect(gasLeft, chamberTop, Math.max(8, pistonX - gasLeft), chamberBottom - chamberTop);
      ctx.clip();

      const currentT = current.isochoric
        ? current.T1 + (current.T2 - current.T1) * p
        : (current.p1 * Math.pow(current.V1 / Math.max(currentV, 1e-12), current.n ?? 1) * currentV) /
          (current.nu * 8.314462618);
      const glow = ctx.createRadialGradient(
        (gasLeft + pistonX) / 2,
        (chamberTop + chamberBottom) / 2,
        4,
        (gasLeft + pistonX) / 2,
        (chamberTop + chamberBottom) / 2,
        Math.max(24, pistonX - gasLeft),
      );
      glow.addColorStop(0, palette.glow);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(gasLeft, chamberTop, Math.max(8, pistonX - gasLeft), chamberBottom - chamberTop);

      const speed = clamp(Math.sqrt(Math.max(currentT, 80) / Math.max(current.T1, 80)), 0.55, 2.2);
      const t = reduced ? 0 : (now - started) * 0.001;
      const chamberW = Math.max(8, pistonX - gasLeft - 12);
      const chamberH = chamberBottom - chamberTop - 12;
      ctx.fillStyle = palette.molecule;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const driftX = (i * 41.7 + t * (11 + (i % 5) * 5) * speed) % Math.max(8, chamberW);
        const driftY =
          (i * 67.3 + Math.sin(t * 0.8 + i * 1.9) * 7 + t * (5 + (i % 4) * 3) * speed) %
          Math.max(8, chamberH);
        const x = gasLeft + 6 + driftX;
        const y = chamberTop + 6 + ((driftY + chamberH) % Math.max(8, chamberH));
        const radius = 1.8 + (i % 3) * 0.55;
        ctx.globalAlpha = 0.55 + (i % 4) * 0.1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Piston and rod
      roundedRect(ctx, pistonX, chamberTop, 13, chamberBottom - chamberTop, 4);
      ctx.fillStyle = palette.piston;
      ctx.fill();
      ctx.strokeStyle = palette.pistonDark;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const midY = (chamberTop + chamberBottom) / 2;
      ctx.strokeStyle = palette.rod;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pistonX + 13, midY);
      ctx.lineTo(bodyRight - 8, midY);
      ctx.stroke();

      roundedRect(ctx, bodyRight - 12, midY - 26, 8, 52, 4);
      ctx.fillStyle = palette.pistonDark;
      ctx.fill();

      // Heat flow arrows
      const heat = current.Q;
      const heatColor = heat >= 0 ? palette.heatIn : palette.heatOut;
      if (Math.abs(heat) > 0.5) {
        const inward = heat > 0;
        for (let i = 0; i < 3; i += 1) {
          const y = chamberTop + (chamberBottom - chamberTop) * (0.3 + i * 0.2);
          const startX = inward ? bodyLeft - 24 : gasLeft + 10;
          const endX = inward ? gasLeft + 10 : bodyLeft - 24;
          const steps = 16;
          ctx.beginPath();
          for (let s = 0; s <= steps; s += 1) {
            const ratio = s / steps;
            const x = startX + (endX - startX) * ratio;
            const yy = y + Math.sin(ratio * Math.PI * 3 + i) * 3.2;
            if (s === 0) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
          }
          ctx.strokeStyle = heatColor;
          ctx.lineWidth = 2;
          ctx.stroke();
          const angle = Math.atan2(0, endX - startX);
          const size = 6;
          ctx.beginPath();
          ctx.moveTo(endX, y);
          ctx.lineTo(
            endX - size * Math.cos(angle - Math.PI / 6),
            y - size * Math.sin(angle - Math.PI / 6),
          );
          ctx.lineTo(
            endX - size * Math.cos(angle + Math.PI / 6),
            y - size * Math.sin(angle + Math.PI / 6),
          );
          ctx.closePath();
          ctx.fillStyle = heatColor;
          ctx.fill();
        }
        ctx.font = '600 11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.fillStyle = heatColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("Q", 7, chamberTop + 14);
      } else {
        ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.fillStyle = palette.gold;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("Q = 0", 7, chamberTop + 14);
      }

      // Piston work arrow
      if (Math.abs(current.L) > 0.5) {
        const expanding = current.L > 0;
        const y = bodyBottom + 13;
        const fromX = expanding ? bodyLeft + 10 : bodyRight - 10;
        const toX = expanding ? bodyRight - 10 : bodyLeft + 10;
        ctx.strokeStyle = palette.gold;
        ctx.fillStyle = palette.gold;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fromX, y);
        ctx.lineTo(toX, y);
        ctx.stroke();
        const dir = expanding ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(toX, y);
        ctx.lineTo(toX - dir * 7, y - 4);
        ctx.lineTo(toX - dir * 7, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("L", (fromX + toX) / 2, y - 5);
      }

      // Labels
      ctx.font = 'italic 12px Georgia, "Palatino Linotype", serif';
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("gaz", (gasLeft + pistonX) / 2, chamberBottom - 20);
      ctx.textAlign = "left";
      ctx.fillText("V", gasLeft, bodyTop - 16);
      ctx.textAlign = "right";
      ctx.fillText("piston", bodyRight, bodyTop - 16);

      ctx.font = '10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${Math.round(currentT)} K`, gasLeft, bodyTop - 31);
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
      className="cylinder-canvas"
      role="img"
      aria-label="Cilindru cu piston: moleculele se mișcă, pistonul se deplasează, iar săgețile arată schimbul de căldură și lucrul mecanic."
    />
  );
}
