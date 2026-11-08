"use client";

import { useEffect, useRef } from "react";
import { elapsedSeconds, prepareCanvas } from "@/lib/canvas";
import { battery, meter, schematicGrid, schematicPalette, wire, currentArrow, tag } from "@/lib/schematic";
import { useTheme } from "./ThemeProvider";

interface CircuitSchematicProps {
  emf: number;
  internal: number;
  external: number;
  current: number;
  terminal: number;
  shorted: boolean;
}

/**
 * Schema circuitului simplu: sursă cu E și r, rezistor R, ampermetru în serie,
 * voltmetru în paralel pe R. Curentul e animat prin puncte de-a lungul buclei.
 */
export function CircuitSchematic({
  emf,
  internal,
  external,
  current,
  terminal,
  shorted,
}: CircuitSchematicProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ emf, internal, external, current, terminal, shorted });
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    stateRef.current = { emf, internal, external, current, terminal, shorted };
  }, [emf, internal, external, current, terminal, shorted]);

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
      const palette = schematicPalette(dark);

      ctx.clearRect(0, 0, w, h);
      schematicGrid(ctx, w, h, dark ? "rgba(232,237,246,.035)" : "rgba(27,32,41,.035)", 24);

      const padX = w * 0.14;
      const padY = h * 0.24;
      const left = padX;
      const right = w - padX;
      const top = padY;
      const bottom = h - padY;

      // ---- bucla exterioară ----
      wire(ctx, [[left, top], [w / 2 - 34, top]], palette.wire);
      wire(ctx, [[w / 2 + 34, top], [right, top]], palette.wire);
      wire(ctx, [[right, top], [right, h / 2 - 26]], palette.wire);
      wire(ctx, [[right, h / 2 + 26], [right, bottom]], palette.wire);
      wire(ctx, [[right, bottom], [left, bottom]], palette.wire);
      wire(ctx, [[left, bottom], [left, top]], palette.wire);

      // ---- sursa ----
      battery(ctx, w / 2, top, palette.battery, palette.text, {
        length: 14,
        leadLength: 27,
        leadColor: palette.wire,
        label: "E",
        label2: "r",
      });

      // ---- rezistorul R pe latura de jos ----
      const resistorX = w / 2;
      const resY = bottom;
      const resLength = Math.min(130, (right - left) * 0.34);
      ctx.save();
      ctx.fillStyle = palette.surface;
      ctx.fillRect(resistorX - resLength / 2, resY - 10, resLength, 20);
      ctx.strokeStyle = palette.component;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(resistorX - resLength / 2, resY - 10, resLength, 20);
      ctx.restore();
      ctx.save();
      ctx.font = 'italic 14px Georgia, "Palatino Linotype", serif';
      ctx.fillStyle = palette.component;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("R", resistorX, resY + 15);
      ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.fillText(`${state.external.toFixed(1)} Ω`, resistorX, resY + 33);
      ctx.restore();

      // ---- ampermetru pe latura dreaptă ----
      const ampY = h / 2;
      ctx.save();
      ctx.fillStyle = palette.surfaceAlt;
      ctx.beginPath();
      ctx.arc(right, ampY, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      meter(ctx, right, ampY, "A", palette.meter, palette.surface, 15);
      ctx.save();
      ctx.font = '600 9px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.meter;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        state.current >= 0.1 ? `${state.current.toFixed(2)} A` : `${(state.current * 1000).toFixed(0)} mA`,
        right - 20,
        ampY,
      );
      ctx.restore();

      // ---- voltmetru în paralel pe R ----
      const voltY = bottom + 34;
      const voltLeft = resistorX - resLength / 2 - 6;
      const voltRight = resistorX + resLength / 2 + 6;
      wire(ctx, [[voltLeft, bottom], [voltLeft, voltY]], palette.wireHot, 1.6);
      wire(ctx, [[voltRight, bottom], [voltRight, voltY]], palette.wireHot, 1.6);
      wire(ctx, [[voltLeft, voltY], [resistorX - 22, voltY]], palette.wireHot, 1.6);
      wire(ctx, [[resistorX + 22, voltY], [voltRight, voltY]], palette.wireHot, 1.6);
      meter(ctx, resistorX, voltY, "V", palette.battery, palette.surface, 16, `${state.terminal.toFixed(2)} V`);

      // ---- curent animat ----
      const speed = Math.min(1, Math.log10(1 + Math.abs(state.current) * 12) / 1.6);
      const t = reduced ? 0 : elapsedSeconds(now, started);
      const loopPath: Array<[number, number]> = [
        [right, top],
        [right, bottom],
        [left, bottom],
        [left, top],
      ];
      const totalSegments = 3;
      const dotCount = 18;
      ctx.fillStyle = state.shorted ? palette.danger : palette.meter;
      for (let index = 0; index < dotCount; index += 1) {
        const progress = ((index / dotCount + t * speed * 0.16) % 1) * totalSegments;
        const segment = Math.min(totalSegments - 1, Math.floor(progress));
        const frac = progress - segment;
        const [ax, ay] = loopPath[segment];
        const [bx, by] = loopPath[segment + 1] ?? loopPath[0];
        const x = ax + (bx - ax) * frac;
        const y = ay + (by - ay) * frac;
        ctx.globalAlpha = 0.25 + 0.6 * Math.min(1, Math.abs(state.current) * 6);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ---- săgeți de curent ----
      if (state.current > 0.0005) {
        currentArrow(ctx, right, bottom - 34, -Math.PI / 2, palette.meter, 7);
        tag(ctx, "I", right + 14, bottom - 34, palette.meter, palette.surface, "left");
      }

      // ---- scurtcircuit ----
      if (state.shorted) {
        wire(ctx, [[left, bottom - 8], [left, top + 8]], palette.danger, 3.6);
        ctx.save();
        ctx.font = '600 11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.fillStyle = palette.danger;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("R = 0", left + 12, (top + bottom) / 2);
        ctx.restore();
        // scânteie
        const sparkPhase = (t * 3) % 1;
        ctx.save();
        ctx.strokeStyle = palette.danger;
        ctx.globalAlpha = 0.7 - sparkPhase * 0.6;
        ctx.lineWidth = 2;
        for (let index = 0; index < 3; index += 1) {
          const angle = (index / 3) * Math.PI * 2 + sparkPhase * 2;
          ctx.beginPath();
          ctx.moveTo(w / 2, top);
          ctx.lineTo(w / 2 + Math.cos(angle) * (18 + sparkPhase * 22), top + Math.sin(angle) * (12 + sparkPhase * 18));
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---- tensiuni pe laturi ----
      ctx.save();
      ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.component;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      // căderea internă, lângă sursă
      const dropY = top + 26;
      ctx.fillText(`u = ${(state.internal * state.current).toFixed(2)} V`, 12, dropY);
      ctx.restore();

      // ---- etichete borne ----
      ctx.save();
      ctx.font = 'italic 11px Georgia, "Palatino Linotype", serif';
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("circuit exterior", left + 6, bottom + 54);
      ctx.restore();
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
      className="circuit-canvas"
      role="img"
      aria-label={`Circuit simplu cu sursă de ${emf.toFixed(1)} volți și rezistență internă ${internal.toFixed(2)} ohmi, rezistor de ${external.toFixed(1)} ohmi. Curent ${(current * 1000).toFixed(1)} miliamperi, tensiune la borne ${terminal.toFixed(2)} volți.`}
    />
  );
}
