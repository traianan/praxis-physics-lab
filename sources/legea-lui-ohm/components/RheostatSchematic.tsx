"use client";

import { useEffect, useRef } from "react";
import { elapsedSeconds, prepareCanvas } from "@/lib/canvas";
import {
  battery,
  drawSubscriptText,
  meter,
  schematicGrid,
  schematicPalette,
  sliderCursor,
  wire,
} from "@/lib/schematic";
import { useTheme } from "./ThemeProvider";

export type RheostatMode = "series" | "divider";

interface RheostatSchematicProps {
  mode: RheostatMode;
  /** fracțiunea utilizată din fir, 0..1 */
  fraction: number;
  emf: number;
  internal: number;
  current: number;
  voltage: number;
  activeResistance: number;
  totalResistance: number;
}

/**
 * Două montaje:
 *  - series: borna A și cursorul C sunt în circuit, restul firului (C–B) rămâne
 *    în afara lui. Curentul scade când cursorul merge spre B.
 *  - divider: sursa alimentează tot firul A–B, iar între A și C se culege o
 *    tensiune variabilă.
 */
export function RheostatSchematic({
  mode,
  fraction,
  emf,
  internal,
  current,
  voltage,
  activeResistance,
  totalResistance,
}: RheostatSchematicProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    mode,
    fraction,
    emf,
    internal,
    current,
    voltage,
    activeResistance,
    totalResistance,
  });
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    stateRef.current = {
      mode,
      fraction,
      emf,
      internal,
      current,
      voltage,
      activeResistance,
      totalResistance,
    };
  }, [mode, fraction, emf, internal, current, voltage, activeResistance, totalResistance]);

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
      const mono = (size: number, weight = "600") =>
        `${weight} ${size}px "Cascadia Code", "Cascadia Mono", Consolas, monospace`;

      ctx.clearRect(0, 0, w, h);
      schematicGrid(ctx, w, h, dark ? "rgba(232,237,246,.028)" : "rgba(27,32,41,.028)", 24);

      const left = w * 0.13;
      const right = w * 0.9;
      const top = h * 0.17;
      const barY = h * 0.74;
      const wireLeft = left + 14;
      const wireRight = right - 14;
      const barWidth = wireRight - wireLeft;
      const cursorX = wireLeft + barWidth * state.fraction;
      const returnY = barY - h * 0.26;

      // ---------------- circuitul principal ----------------
      wire(ctx, [[w / 2 - 32, top], [left, top]], palette.wire);
      wire(ctx, [[left, top], [left, barY]], palette.wire);
      wire(ctx, [[left, barY], [wireLeft, barY]], palette.wire);
      wire(ctx, [[wireRight, barY], [right, barY]], palette.wire);
      wire(ctx, [[right, barY], [right, top]], palette.wire);
      wire(ctx, [[right, top], [w / 2 + 32, top]], palette.wire);

      battery(ctx, w / 2, top, palette.battery, palette.text, {
        length: 14,
        leadLength: 25,
        leadColor: palette.wire,
        label: "E",
        label2: "r",
      });

      // ---------------- bara reostatului ----------------
      // porțiunea inactivă (C–B), mai ștearsă
      ctx.save();
      ctx.strokeStyle = dark ? "rgba(226,160,106,.32)" : "rgba(185,111,51,.3)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cursorX, barY);
      ctx.lineTo(wireRight, barY);
      ctx.stroke();
      ctx.restore();

      // porțiunea activă (A–C)
      ctx.save();
      ctx.strokeStyle = palette.component;
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(wireLeft, barY);
      ctx.lineTo(Math.max(wireLeft + 1, cursorX), barY);
      ctx.stroke();
      // hașuri de înfășurare pe tot firul
      ctx.strokeStyle = dark ? "rgba(11,18,32,.4)" : "rgba(255,253,249,.55)";
      ctx.lineWidth = 1.3;
      for (let x = wireLeft + 5; x < wireRight - 3; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, barY - 4);
        ctx.lineTo(x + 3.5, barY + 4);
        ctx.stroke();
      }
      ctx.restore();

      // borne A și B
      ctx.save();
      ctx.strokeStyle = palette.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wireLeft, barY);
      ctx.lineTo(wireLeft, barY + 9);
      ctx.moveTo(wireRight, barY);
      ctx.lineTo(wireRight, barY + 9);
      ctx.stroke();
      ctx.font = mono(11);
      ctx.fillStyle = palette.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("A", wireLeft, barY + 13);
      ctx.fillText("B", wireRight, barY + 13);
      ctx.font = mono(9, "400");
      ctx.fillStyle = palette.muted;
      ctx.fillText("0", wireLeft, barY + 30);
      ctx.fillText("L", wireRight, barY + 30);
      ctx.restore();

      // ---------------- cursor C ----------------
      ctx.save();
      ctx.strokeStyle = palette.component;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cursorX, barY - 12);
      ctx.lineTo(cursorX, returnY);
      ctx.stroke();
      ctx.restore();

      sliderCursor(ctx, cursorX, barY - 6, palette.component, palette.surface, 9);

      ctx.save();
      ctx.font = mono(10);
      ctx.fillStyle = palette.component;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("C", cursorX, barY - 20);
      ctx.restore();

      if (state.mode === "series") {
        // Cursorul închide circuitul: firul urcă de la C, merge la dreapta pe
        // șina de întoarcere și coboară în colțul drept.
        wire(ctx, [[cursorX, returnY], [right, returnY]], palette.wire);
        wire(ctx, [[right, returnY], [right, top]], palette.wire);

        // bec pe șina de întoarcere
        const bulbX = cursorX + (right - cursorX) * 0.55;
        ctx.save();
        ctx.fillStyle = palette.surface;
        ctx.beginPath();
        ctx.arc(bulbX, returnY, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.component;
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.arc(bulbX, returnY, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bulbX - 8.5, returnY - 8.5);
        ctx.lineTo(bulbX + 8.5, returnY + 8.5);
        ctx.moveTo(bulbX + 8.5, returnY - 8.5);
        ctx.lineTo(bulbX - 8.5, returnY + 8.5);
        ctx.stroke();
        ctx.font = 'italic 11px Georgia, "Palatino Linotype", serif';
        ctx.fillStyle = palette.muted;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("consumator", bulbX, returnY + 22);
        ctx.restore();

        // ampermetru pe latura din dreapta
        const ampY = (top + returnY) / 2 + 8;
        ctx.save();
        ctx.fillStyle = palette.surfaceAlt;
        ctx.beginPath();
        ctx.arc(right, ampY, 27, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        meter(ctx, right, ampY, "A", palette.meter, palette.surface, 15);
        ctx.save();
        ctx.font = mono(9);
        ctx.fillStyle = palette.meter;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          state.current >= 0.1
            ? `${state.current.toFixed(2)} A`
            : `${(state.current * 1000).toFixed(0)} mA`,
          right + 22,
          ampY,
        );
        ctx.restore();
      } else {
        // ---------- montaj potențiometric ----------
        // Cursorul culege tensiunea față de A; voltmetrul stă deasupra barei.
        const tapY = barY - h * 0.13;
        wire(ctx, [[wireLeft, barY], [wireLeft, tapY]], palette.wireHot, 1.8);
        wire(ctx, [[wireLeft, tapY], [cursorX - 24, tapY]], palette.wireHot, 1.8);
        wire(ctx, [[cursorX + 24, tapY], [cursorX, tapY]], palette.wireHot, 1.8);
        wire(ctx, [[cursorX, tapY], [cursorX, barY - 14]], palette.wireHot, 1.8);

        ctx.save();
        ctx.fillStyle = palette.surface;
        ctx.fillRect(cursorX - 24, tapY - 19, 48, 38);
        ctx.restore();
        meter(
          ctx,
          cursorX,
          tapY,
          "V",
          palette.battery,
          palette.surface,
          15,
          `${state.voltage.toFixed(2)} V`,
        );

        ctx.save();
        ctx.font = mono(9);
        ctx.fillStyle = palette.battery;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        drawSubscriptText(ctx, "U", "AC", "", wireLeft - 4, tapY, "right");
        ctx.restore();

        // voltmetru pe tot firul, jos
        ctx.save();
        ctx.font = mono(9);
        ctx.fillStyle = palette.muted;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const busVoltage =
          (state.emf * state.totalResistance) /
          Math.max(state.totalResistance + state.internal, 1e-6);
        drawSubscriptText(ctx, "U", "AB", ` = ${busVoltage.toFixed(2)} V`, (wireLeft + wireRight) / 2, barY + 34, "center");
        ctx.restore();
      }

      // ---------------- etichete pe reostat ----------------
      ctx.save();
      ctx.font = mono(10);
      ctx.fillStyle = palette.component;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      drawSubscriptText(ctx, "R", "AC", ` = ${state.activeResistance.toFixed(2)} Ω`, wireLeft, barY - 12);
      ctx.font = mono(9, "400");
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "right";
      ctx.fillText(`L = ${Math.round(state.fraction * 100)} %`, cursorX - 10, barY - 12);
      ctx.restore();

      // ---------------- curent animat ----------------
      const speed = Math.min(1, Math.log10(1 + Math.abs(state.current) * 14) / 1.7);
      const t = reduced ? 0 : elapsedSeconds(now, started);
      const loop: Array<[number, number]> =
        state.mode === "series"
          ? [
              [w / 2 + 32, top],
              [right, top],
              [right, returnY],
              [cursorX, returnY],
              [cursorX, barY],
              [wireLeft, barY],
              [left, barY],
              [left, top],
              [w / 2 - 32, top],
            ]
          : [
              [w / 2 + 32, top],
              [right, top],
              [right, barY],
              [wireRight, barY],
              [wireLeft, barY],
              [left, barY],
              [left, top],
              [w / 2 - 32, top],
            ];

      const lengths: number[] = [];
      let total = 0;
      for (let index = 0; index < loop.length - 1; index += 1) {
        const [ax, ay] = loop[index];
        const [bx, by] = loop[index + 1];
        const len = Math.hypot(bx - ax, by - ay);
        lengths.push(len);
        total += len;
      }
      const dots = 24;
      ctx.fillStyle = palette.meter;
      for (let index = 0; index < dots; index += 1) {
        let distance = (((index / dots + t * speed * 0.12) % 1) + 1) % 1;
        distance *= total;
        let segment = 0;
        while (segment < lengths.length - 1 && distance > lengths[segment]) {
          distance -= lengths[segment];
          segment += 1;
        }
        const [ax, ay] = loop[segment];
        const [bx, by] = loop[segment + 1];
        const frac = lengths[segment] > 0 ? distance / lengths[segment] : 0;
        ctx.globalAlpha = 0.2 + 0.5 * Math.min(1, Math.abs(state.current) * 5);
        ctx.beginPath();
        ctx.arc(ax + (bx - ax) * frac, ay + (by - ay) * frac, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ---------------- etichetă montaj ----------------
      ctx.save();
      ctx.font = mono(10);
      ctx.fillStyle = state.mode === "series" ? palette.meter : palette.battery;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(
        state.mode === "series"
          ? "reostat în serie — borna A și cursorul C"
          : "divizor de tensiune — borna A și cursorul C",
        left - 6,
        h - 18,
      );
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
      className="rheostat-canvas"
      role="img"
      aria-label={`Reostat în montaj ${mode === "series" ? "serie" : "potențiometric"}. Cursorul este la ${Math.round(fraction * 100)} procente, rezistența activă ${activeResistance.toFixed(2)} ohmi, tensiunea ${voltage.toFixed(2)} volți, curentul ${(current * 1000).toFixed(1)} miliamperi.`}
    />
  );
}
