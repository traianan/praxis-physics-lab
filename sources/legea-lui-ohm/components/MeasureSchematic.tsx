"use client";

import { useEffect, useRef } from "react";
import { elapsedSeconds, prepareCanvas } from "@/lib/canvas";
import { battery, drawSubscriptText, meter, schematicGrid, schematicPalette, tag, wire } from "@/lib/schematic";
import { useTheme } from "./ThemeProvider";

interface MeasureSchematicProps {
  amonte: boolean;
  target: number;
  ammeter: number;
  voltmeter: number;
  emf: number;
  internal: number;
  voltmeterReading: number;
  ammeterReading: number;
}

/**
 * Cele două montaje din manual, desenate explicit:
 *  amonte:  sursă → ampermetru → (R serie cu A) iar voltmetrul peste ambele;
 *  aval:    sursă → ampermetru → R, iar voltmetrul numai peste R.
 */
export function MeasureSchematic({
  amonte,
  target,
  ammeter,
  voltmeter,
  emf,
  internal,
  voltmeterReading,
  ammeterReading,
}: MeasureSchematicProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ amonte, target, ammeter, voltmeter, emf, internal, voltmeterReading, ammeterReading });
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    stateRef.current = { amonte, target, ammeter, voltmeter, emf, internal, voltmeterReading, ammeterReading };
  }, [amonte, target, ammeter, voltmeter, emf, internal, voltmeterReading, ammeterReading]);

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
      schematicGrid(ctx, w, h, dark ? "rgba(232,237,246,.03)" : "rgba(27,32,41,.03)", 24);

      const left = w * 0.1;
      const right = w * 0.93;
      const top = h * 0.42;
      const bottom = h * 0.8;
      const ampX = w * 0.29;
      const resX = w * 0.64;
      const resLen = Math.min(112, w * 0.24);
      const voltY = h * 0.17;

      // ---------------- bucla ----------------
      wire(ctx, [[left, top], [ampX - 18, top]], palette.wire);
      wire(ctx, [[ampX + 18, top], [resX - resLen / 2, top]], palette.wire);
      wire(ctx, [[resX + resLen / 2, top], [right, top]], palette.wire);
      wire(ctx, [[right, top], [right, bottom]], palette.wire);
      wire(ctx, [[right, bottom], [left, bottom]], palette.wire);
      wire(ctx, [[left, bottom], [left, top]], palette.wire);

      // ---- sursa, pe latura de jos ----
      const sourceX = (left + right) / 2;
      ctx.save();
      ctx.fillStyle = palette.surface;
      ctx.fillRect(sourceX - 44, bottom - 14, 88, 28);
      ctx.restore();
      battery(ctx, sourceX, bottom, palette.battery, palette.text, {
        length: 14,
        leadLength: 37,
        leadColor: palette.wire,
        label: "E",
        label2: "r",
      });

      // ---- ampermetru, pe latura de sus, în serie ----
      ctx.save();
      ctx.fillStyle = palette.surface;
      ctx.beginPath();
      ctx.arc(ampX, top, 21, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      meter(ctx, ampX, top, "A", palette.meter, palette.surface, 15);
      ctx.save();
      ctx.font = '600 9px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.meter;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        `${(state.ammeterReading * 1000).toFixed(1)} mA`,
        ampX,
        top + 24,
      );
      ctx.font = '400 8.5px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      const ammeterResistance = state.ammeter < 1
        ? `${(state.ammeter * 1000).toFixed(0)} mΩ`
        : `${state.ammeter.toFixed(1)} Ω`;
      drawSubscriptText(ctx, "R", "A", ` = ${ammeterResistance}`, ampX, top + 37, "center");
      ctx.restore();

      // ---- rezistorul R, pe aceeași latură ----
      const rX = w * 0.64;
      const rLength = Math.min(112, w * 0.24);
      ctx.save();
      ctx.fillStyle = palette.surface;
      ctx.fillRect(rX - rLength / 2, top - 10, rLength, 20);
      ctx.strokeStyle = palette.component;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(rX - rLength / 2, top - 10, rLength, 20);
      ctx.restore();
      ctx.save();
      ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
      ctx.fillStyle = palette.component;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("R", rX, top + 16);
      ctx.font = '600 9px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.fillText(
        state.target >= 1000 ? `${(state.target / 1000).toFixed(2)} kΩ` : `${state.target.toFixed(0)} Ω`,
        rX,
        top + 33,
      );
      ctx.restore();

      // ---- voltmetru ----
      {
        // Ramura stângă: înainte de ampermetru (amonte) sau după el (aval).
        const leftTapX = state.amonte ? ampX - 42 : ampX + 42;
        const rightTapX = rX + rLength / 2 + 12;
        const voltY = h * 0.17;

        wire(
          ctx,
          [
            [leftTapX, top],
            [leftTapX, voltY],
            [rightTapX, voltY],
            [rightTapX, top],
          ],
          palette.wireHot,
          1.8,
        );
        for (const [px, py] of [
          [leftTapX, top],
          [rightTapX, top],
        ]) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, 3.4, 0, Math.PI * 2);
          ctx.fillStyle = palette.wireHot;
          ctx.fill();
          ctx.restore();
        }

        const voltCenter = (leftTapX + rightTapX) / 2;
        ctx.save();
        ctx.fillStyle = palette.surface;
        ctx.beginPath();
        ctx.arc(voltCenter, voltY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        meter(ctx, voltCenter, voltY, "V", palette.battery, palette.surface, 15);
        ctx.save();
        ctx.font = '600 9px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.fillStyle = palette.battery;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${state.voltmeterReading.toFixed(3)} V`, voltCenter, voltY - 23);
        ctx.font = '400 8.5px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
        ctx.fillStyle = palette.muted;
        ctx.textBaseline = "top";
        const voltmeterResistance = state.voltmeter >= 1e6
          ? `${(state.voltmeter / 1e6).toFixed(1)} MΩ`
          : `${(state.voltmeter / 1000).toFixed(0)} kΩ`;
        drawSubscriptText(ctx, "R", "V", ` = ${voltmeterResistance}`, voltCenter, voltY + 25, "center");
        ctx.restore();

        tag(
          ctx,
          state.amonte ? "cuprinde A și R" : "cuprinde doar R",
          Math.min(rightTapX + 10, w - 10),
          voltY + 30,
          state.amonte ? palette.battery : palette.meter,
          palette.surface,
          "left",
        );
      }

      // ---- bornele A / B ale rezistorului ----
      ctx.save();
      ctx.font = '600 9px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = palette.muted;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("A", rX - rLength / 2, top - 17);
      ctx.fillText("B", rX + rLength / 2, top - 17);
      ctx.restore();

      // ---- curent animat ----
      const current = state.ammeterReading;
      const speed = Math.min(1, Math.log10(1 + Math.abs(current) * 40) / 1.8);
      const t = reduced ? 0 : elapsedSeconds(now, started);
      const loopPath: Array<[number, number]> = [
        [left, top],
        [left, bottom],
        [right, bottom],
        [right, top],
        [left, top],
      ];
      const lengths: number[] = [];
      let total = 0;
      for (let index = 0; index < loopPath.length - 1; index += 1) {
        const [ax, ay] = loopPath[index];
        const [bx, by] = loopPath[index + 1];
        const len = Math.hypot(bx - ax, by - ay);
        lengths.push(len);
        total += len;
      }
      const dots = 22;
      ctx.fillStyle = palette.meter;
      for (let index = 0; index < dots; index += 1) {
        let distance = (((index / dots - t * speed * 0.1) % 1) + 1) % 1;
        distance *= total;
        let segment = 0;
        while (segment < lengths.length - 1 && distance > lengths[segment]) {
          distance -= lengths[segment];
          segment += 1;
        }
        const [ax, ay] = loopPath[segment];
        const [bx, by] = loopPath[segment + 1];
        const frac = lengths[segment] > 0 ? distance / lengths[segment] : 0;
        ctx.globalAlpha = 0.2 + 0.55 * Math.min(1, Math.abs(current) * 12);
        ctx.beginPath();
        ctx.arc(ax + (bx - ax) * frac, ay + (by - ay) * frac, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ---- etichetă montaj ----
      ctx.save();
      ctx.font = '600 11px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = state.amonte ? palette.battery : palette.meter;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(
        state.amonte ? "montaj amonte — R mare" : "montaj aval — R mică",
        left + 4,
        h - 20,
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
      className="measure-canvas"
      role="img"
      aria-label={`Montaj ${amonte ? "amonte" : "aval"} pentru măsurarea rezistenței. Voltmetru citește ${voltmeterReading.toFixed(3)} volți, ampermetru citește ${(ammeterReading * 1000).toFixed(1)} miliamperi.`}
    />
  );
}
