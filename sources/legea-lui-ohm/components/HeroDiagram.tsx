"use client";

import { useEffect, useRef } from "react";
import { elapsedSeconds, prepareCanvas } from "@/lib/canvas";
import { useTheme } from "./ThemeProvider";

interface Particle {
  t: number;
  speed: number;
  lane: number;
}

/**
 * Circuit animat: punctele urmăresc electronii, iar săgețile indică sensul
 * curentului convențional. Cele două sensuri sunt opuse.
 */
export function HeroDiagram() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, language } = useTheme();
  const themeRef = useRef(theme);

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
    const particles: Particle[] = Array.from({ length: 26 }, (_, index) => ({
      t: (index / 26 + (index % 3) * 0.02) % 1,
      speed: 0.045 + (index % 5) * 0.006,
      lane: (index % 3) - 1,
    }));

    const draw = (now: number) => {
      const dark = themeRef.current === "dark";
      const prepared = prepareCanvas(canvas);
      if (!prepared) return;
      const { ctx, width: w, height: h } = prepared;

      const palette = {
        board: dark ? "#0c1524" : "#fffdf9",
        boardStroke: dark ? "#243650" : "#e2d8c7",
        wire: dark ? "#5a6b86" : "#9aa3b0",
        wireHot: dark ? "#5fc3d9" : "#157f96",
        copper: dark ? "#e2a06a" : "#b96f33",
        amber: dark ? "#edb85f" : "#d0912c",
        text: dark ? "#e8edf6" : "#1b2029",
        muted: dark ? "#8d9ab0" : "#6c7482",
        glow: dark ? "rgba(95,195,217,.35)" : "rgba(21,127,150,.22)",
        electron: dark ? "#8fe3f2" : "#0f6f84",
        electronCore: dark ? "#eafaff" : "#c8f0f8",
        badge: dark ? "rgba(226,160,106,.16)" : "rgba(192,122,62,.13)",
      };

      ctx.clearRect(0, 0, w, h);

      // ---- geometria buclei ----
      const padX = w < 520 ? 26 : 44;
      const padY = h < 380 ? 26 : 40;
      const left = padX;
      const right = w - padX;
      const top = padY + 16;
      const bottom = h - padY - 16;
      const radius = 18;

      const pathLength = 2 * (right - left - 2 * radius) + 2 * (bottom - top - 2 * radius) + 2 * Math.PI * radius;

      const strokeLoop = (color: string, lineWidth: number, dash?: number[]) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        if (dash) ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(left + radius, top);
        ctx.lineTo(right - radius, top);
        ctx.arcTo(right, top, right, top + radius, radius);
        ctx.lineTo(right, bottom - radius);
        ctx.arcTo(right, bottom, right - radius, bottom, radius);
        ctx.lineTo(left + radius, bottom);
        ctx.arcTo(left, bottom, left, bottom - radius, radius);
        ctx.lineTo(left, top + radius);
        ctx.arcTo(left, top, left + radius, top, radius);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      };

      // Halou subtil pe contur
      ctx.save();
      ctx.globalAlpha = dark ? 0.5 : 0.42;
      strokeLoop(palette.glow, 12);
      ctx.restore();
      strokeLoop(palette.wire, 2.4);

      // ---- poziții în lungul buclei ----
      const perimeterPoint = (t: number) => {
        const tt = ((t % 1) + 1) % 1;
        const straightX = right - left - 2 * radius;
        const straightY = bottom - top - 2 * radius;
        const arc = Math.PI * radius * 0.5;
        const segments = [
          { length: straightX, at: (d: number) => ({ x: left + radius + d, y: top, a: 0 }) },
          { length: arc, at: (d: number) => {
            const angle = -Math.PI / 2 + (d / arc) * (Math.PI / 2);
            return { x: right - radius + Math.cos(angle) * radius, y: top + radius + Math.sin(angle) * radius, a: angle + Math.PI / 2 };
          } },
          { length: straightY, at: (d: number) => ({ x: right, y: top + radius + d, a: Math.PI / 2 }) },
          { length: arc, at: (d: number) => {
            const angle = (d / arc) * (Math.PI / 2);
            return { x: right - radius + Math.cos(angle) * radius, y: bottom - radius + Math.sin(angle) * radius, a: angle + Math.PI / 2 };
          } },
          { length: straightX, at: (d: number) => ({ x: right - radius - d, y: bottom, a: Math.PI }) },
          { length: arc, at: (d: number) => {
            const angle = Math.PI / 2 + (d / arc) * (Math.PI / 2);
            return { x: left + radius + Math.cos(angle) * radius, y: bottom - radius + Math.sin(angle) * radius, a: angle + Math.PI / 2 };
          } },
          { length: straightY, at: (d: number) => ({ x: left, y: bottom - radius - d, a: -Math.PI / 2 }) },
          { length: arc, at: (d: number) => {
            const angle = Math.PI + (d / arc) * (Math.PI / 2);
            return { x: left + radius + Math.cos(angle) * radius, y: top + radius + Math.sin(angle) * radius, a: angle + Math.PI / 2 };
          } },
        ];
        let distance = tt * pathLength;
        for (const segment of segments) {
          if (distance <= segment.length) return segment.at(distance);
          distance -= segment.length;
        }
        return { x: left + radius, y: top, a: 0 };
      };

      // ---- baterie pe latura de sus ----
      const batteryX = (left + right) / 2;
      const batteryY = top;
      ctx.save();
      ctx.fillStyle = palette.board;
      ctx.strokeStyle = palette.board;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(batteryX - 42, batteryY);
      ctx.lineTo(batteryX + 42, batteryY);
      ctx.stroke();
      ctx.restore();

      // celulă reală: borne apropiate, placă pozitivă lungă și placă negativă scurtă
      ctx.save();
      ctx.strokeStyle = palette.amber;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(batteryX - 7, batteryY - 8);
      ctx.lineTo(batteryX - 7, batteryY + 8);
      ctx.moveTo(batteryX + 7, batteryY - 5);
      ctx.lineTo(batteryX + 7, batteryY + 5);
      ctx.stroke();
      ctx.strokeStyle = palette.wire;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(batteryX - 42, batteryY);
      ctx.lineTo(batteryX - 7, batteryY);
      ctx.moveTo(batteryX + 7, batteryY);
      ctx.lineTo(batteryX + 42, batteryY);
      ctx.stroke();
      ctx.restore();

      ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.amber;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("E", batteryX - 11, batteryY - 13);
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "left";
      ctx.fillText("r", batteryX + 11, batteryY - 13);

      // ---- rezistor pe latura de jos ----
      const resistorX = (left + right) / 2;
      const resistorY = bottom;
      const resW = Math.min(112, (right - left) * 0.34);
      ctx.save();
      ctx.fillStyle = palette.board;
      ctx.strokeStyle = palette.copper;
      ctx.lineWidth = 2.6;
      ctx.fillRect(resistorX - resW / 2, resistorY - 7, resW, 14);
      ctx.strokeRect(resistorX - resW / 2, resistorY - 7, resW, 14);
      ctx.restore();

      ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
      ctx.fillStyle = palette.copper;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("R", resistorX, resistorY + 14);

      // ---- ampermetru pe latura dreaptă ----
      const ampY = (top + bottom) / 2;
      ctx.save();
      ctx.fillStyle = palette.board;
      ctx.beginPath();
      ctx.arc(right, ampY, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.wireHot;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.font = '600 12px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.wireHot;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("A", right, ampY + 1);
      ctx.restore();

      // ---- voltmetru pe latura stângă (paralel pe R) ----
      const voltY = (top + bottom) / 2;
      ctx.save();
      ctx.fillStyle = palette.board;
      ctx.beginPath();
      ctx.arc(left, voltY, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.amber;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.font = '600 12px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.amber;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("V", left, voltY + 1);
      ctx.restore();

      // ---- electroni ----
      const time = reduced ? 0 : elapsedSeconds(now, started);
      for (const particle of particles) {
        const t = (particle.t + time * particle.speed) % 1;
        const point = perimeterPoint(t);
        const normal = {
          x: Math.cos(point.a) + Math.sin(point.a) * particle.lane * 0.55,
          y: Math.sin(point.a) - Math.cos(point.a) * particle.lane * 0.55,
        };
        const px = point.x + normal.x * 0;
        const py = point.y + normal.y * 0;
        const offset = particle.lane * 3.1;
        const x = px + Math.cos(point.a + Math.PI / 2) * offset;
        const y = py + Math.sin(point.a + Math.PI / 2) * offset;

        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = palette.electron;
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = palette.electronCore;
        ctx.beginPath();
        ctx.arc(x, y, 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ---- săgeți de curent ----
      const arrowAt = (t: number, angleOffset: number) => {
        const point = perimeterPoint(1 - t);
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(point.a + angleOffset);
        ctx.fillStyle = palette.wireHot;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-4, -4.6);
        ctx.lineTo(-4, 4.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      arrowAt(0.22, 0);
      arrowAt(0.62, 0);

      // ---- etichete unghiuri ----
      ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.textBaseline = "top";
      if (w < 560) {
        // On narrow canvases, place labels above the instruments to keep them
        // clear of both the meter symbols and the canvas edge.
        ctx.textAlign = "center";
        ctx.fillText("I", right, ampY - 34);
        ctx.fillStyle = palette.amber;
        ctx.fillText("U", left, voltY - 34);
      } else {
        ctx.textAlign = "left";
        ctx.fillText("I", right + 32, ampY - 6);
        ctx.fillStyle = palette.amber;
        ctx.textAlign = "right";
        ctx.fillText("U", left - 34, voltY - 6);
      }
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
      className="hero-canvas"
      role="img"
      aria-label={language === "en"
        ? "Circuit diagram: source with emf E and internal resistance r, resistor R, ammeter in series and voltmeter in parallel. The dots represent electrons moving opposite to conventional current I."
        : "Circuit electric: sursă cu t.e.m. E și rezistență internă r, rezistor R, ampermetru în serie și voltmetru în paralel. Bilele reprezintă electronii, care se deplasează în sens opus curentului convențional I."}
    />
  );
}
