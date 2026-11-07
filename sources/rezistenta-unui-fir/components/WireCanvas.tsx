"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawArrow, prepareCanvas, roundedRect } from "@/lib/canvas";
import { alpha, darken, lighten } from "@/lib/color";
import { clamp, heatLevel, type WireResult } from "@/lib/resistance";
import { fmtArea, fmtDiameter, fmtLength } from "@/lib/format";
import { useTheme } from "./ThemeProvider";

interface WireCanvasProps {
  model: WireResult;
  animate: boolean;
  showReference: boolean;
}

interface Electron {
  /** Poziția pe lungimea firului, 0..1. */
  x: number;
  /** Poziția pe grosime, −0.5..0.5. */
  y: number;
  /** Faza pentru tremurul termic. */
  phase: number;
}

interface Spark {
  x: number;
  y: number;
  life: number;
}

/** Geometrie de referință pentru comparație: 1 m de cupru, 1 mm². */
const REFERENCE = { length: 1, area: 1 };

const ELECTRON_COUNT = 46;

/** Proiecția lungimii pe ecran: scară logaritmică, 0,1 m → 20 m. */
function lengthRatio(meters: number): number {
  const t = Math.log10(Math.max(meters, 0.02) / 0.02) / Math.log10(500 / 0.02);
  return clamp(0.34 + 0.66 * t, 0.34, 1);
}

/** Proiecția grosimii pe ecran: diametru 0,1 mm → 6 mm. */
function thicknessRatio(area: number): number {
  const diameter = Math.sqrt((4 * Math.max(area, 0.005)) / Math.PI);
  const t = Math.log10(Math.max(diameter, 0.1) / 0.1) / Math.log10(60);
  return clamp(t, 0, 1);
}

export function WireCanvas({ model, animate, showReference }: WireCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const electronsRef = useRef<Electron[]>([]);
  const sparkRef = useRef<Spark[]>([]);
  const stateRef = useRef({ model, animate, showReference });
  const themeRef = useRef("light");
  const { theme } = useTheme();

  useEffect(() => {
    stateRef.current = { model, animate, showReference };
  }, [model, animate, showReference]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (electronsRef.current.length === 0) {
      electronsRef.current = Array.from({ length: ELECTRON_COUNT }, (_, index) => ({
        x: (index / ELECTRON_COUNT + Math.random() * 0.02) % 1,
        y: (Math.random() - 0.5) * 0.92,
        phase: Math.random() * Math.PI * 2,
      }));
    }
  }, []);

  const draw = useCallback((now: number, delta: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const frame = prepareCanvas(canvas);
    if (!frame) return;
    const { ctx, width, height } = frame;
    const { model: current, animate: running, showReference: reference } =
      stateRef.current;
    const dark = themeRef.current === "dark";

    const level = heatLevel(current.currentDensity);
    const base = current.material.color;

    const palette = {
      text: dark ? "#e7edf0" : "#22303a",
      muted: dark ? "#7d919b" : "#83939b",
      line: dark ? "rgba(231,237,240,.16)" : "rgba(34,48,58,.16)",
      faint: dark ? "rgba(231,237,240,.07)" : "rgba(34,48,58,.07)",
      surface: dark ? "#101b22" : "#fffdf9",
      terminal: dark ? "#c9a06a" : "#a8763f",
      terminalEdge: dark ? "#8c6c45" : "#7b532c",
      electron: dark ? "#ffeccc" : "#fff6e6",
      ion: dark ? "rgba(255,226,196,.55)" : "rgba(66,44,28,.5)",
      heat:
        level === "critical"
          ? "#e2563c"
          : level === "overload"
            ? "#e08a3c"
            : level === "warm"
              ? "#d9a24a"
              : "",
    };

    ctx.clearRect(0, 0, width, height);

    const padL = width < 560 ? 46 : 66;
    const padR = width < 560 ? 58 : 92;
    const span = Math.max(60, width - padL - padR);
    const cy = height * 0.46;

    const wireWidth = Math.max(44, span * lengthRatio(current.length));
    // Grosimea se raportează la înălțimea cadrului, ca firul să rămână
    // vizibil și pe ecrane mici, și pe proiector.
    const thickness = Math.max(
      18,
      height * (0.1 + 0.26 * thicknessRatio(current.area)),
    );
    const half = thickness / 2;

    const X0 = padL;
    const X1 = padL + wireWidth;

    // ---- fundal: grilă tehnică
    ctx.save();
    ctx.strokeStyle = palette.faint;
    ctx.lineWidth = 1;
    for (let x = padL; x <= width - padR + 30; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, cy - Math.min(120, height * 0.36));
      ctx.lineTo(x, cy + Math.min(120, height * 0.36));
      ctx.stroke();
    }
    ctx.restore();

    // ---- firul de referință
    if (reference) {
      const refWidth = Math.max(44, span * lengthRatio(REFERENCE.length));
      const refThickness = 9 + 46 * thicknessRatio(REFERENCE.area);
      ctx.save();
      ctx.setLineDash([5, 6]);
      ctx.strokeStyle = dark
        ? "rgba(143,211,182,.4)"
        : "rgba(63,143,107,.45)";
      ctx.lineWidth = 1.4;
      roundedRect(
        ctx,
        X0,
        cy - refThickness / 2,
        refWidth,
        refThickness,
        refThickness / 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = dark ? "rgba(143,211,182,.65)" : "rgba(52,120,92,.8)";
      ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        `referință · 1 m · 1 mm²`,
        X0 + 2,
        cy - refThickness / 2 - 6,
      );
      ctx.restore();
    }

    // ---- priza de curent (borne)
    const drawTerminal = (x: number, label: string) => {
      const overhang = Math.min(18, thickness * 0.42);
      ctx.save();
      // Firele de legătură se desenează înaintea plăcuței, ca să nu taie firul.
      ctx.strokeStyle = alpha(palette.terminal, 0.45);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, cy - half - overhang);
      ctx.lineTo(x - span * 0.2, cy - 3);
      ctx.lineTo(x, cy + half + overhang);
      ctx.stroke();

      roundedRect(
        ctx,
        x - 9,
        cy - half - overhang,
        18,
        thickness + overhang * 2,
        7,
      );
      ctx.fillStyle = palette.terminal;
      ctx.fill();
      ctx.strokeStyle = palette.terminalEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = palette.muted;
      ctx.font = '600 11px "Cascadia Code", Consolas, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, x, cy + half + overhang + 8);
      ctx.restore();
    };

    // ---- corpul firului
    ctx.save();
    const body = ctx.createLinearGradient(0, cy - half, 0, cy + half);
    body.addColorStop(0, lighten(base, dark ? 0.18 : 0.42));
    body.addColorStop(0.3, base);
    body.addColorStop(0.62, darken(base, 0.24));
    body.addColorStop(1, darken(base, 0.5));
    ctx.shadowColor = dark ? "rgba(0,0,0,.55)" : "rgba(24,32,38,.28)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    roundedRect(ctx, X0, cy - half, wireWidth, thickness, Math.min(half, 20));
    ctx.fillStyle = body;
    ctx.fill();
    ctx.restore();

    // ---- lumina de pe partea de sus
    ctx.save();
    roundedRect(ctx, X0, cy - half, wireWidth, thickness, Math.min(half, 20));
    ctx.clip();

    const gloss = ctx.createLinearGradient(0, cy - half, 0, cy);
    gloss.addColorStop(0, "rgba(255,255,255,.34)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(X0, cy - half, wireWidth, half);

    // ---- rețeaua cristalină (ionii)
    const spacing = Math.max(13, Math.min(26, thickness * 0.42));
    const rows = Math.max(2, Math.floor(thickness / spacing));
    const columns = Math.max(3, Math.floor(wireWidth / spacing));
    const vibration =
      (0.6 + clamp((current.temperature - 20) / 380, 0, 1) * 4.2) *
      (running ? 1 : 0.4);
    const time = now / 1000;

    ctx.fillStyle = palette.ion;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const baseX =
          X0 + spacing * 0.6 + column * spacing + (row % 2) * (spacing / 2);
        const baseY = cy - half + spacing * 0.45 + row * spacing;
        const wobbleX = Math.sin(time * 7 + row * 1.7 + column) * vibration;
        const wobbleY = Math.cos(time * 6.3 + column * 2.1 + row) * vibration;
        ctx.beginPath();
        ctx.arc(baseX + wobbleX, baseY + wobbleY, Math.min(2.1, spacing * 0.13), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- electronii
    const electronRadius = clamp(2.4 + thickness * 0.022, 2.4, 4.2);
    const speed =
      8 + 130 * clamp(current.current / (current.current + 1.1), 0, 1);
    const electrons = electronsRef.current;
    const travel = (running ? speed : speed * 0.12) * delta;

    for (const electron of electrons) {
      if (running || current.current > 0) {
        electron.x -= travel / Math.max(wireWidth, 1);
        if (electron.x < 0) electron.x += 1;
      }
      const jitterX = running
        ? Math.sin(time * 9 + electron.phase) * (0.7 + vibration * 0.5)
        : 0;
      const jitterY = running
        ? Math.cos(time * 11 + electron.phase * 1.3) * (0.8 + vibration * 0.6)
        : 0;
      const px = X0 + electron.x * wireWidth + jitterX;
      const py = cy + electron.y * (thickness - 8) + jitterY;

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = palette.electron;
      ctx.beginPath();
      ctx.arc(px + electronRadius * 1.3, py, electronRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(px, py, electronRadius, 0, Math.PI * 2);
      ctx.fillStyle = palette.electron;
      ctx.fill();
    }

    // ---- scânteile din ciocniri
    if (running && current.current > 0.02) {
      const spawnRate = clamp(current.current / 4, 0.05, 1);
      if (Math.random() < spawnRate * delta * 3.4) {
        sparkRef.current.push({
          x: X0 + Math.random() * wireWidth,
          y: cy + (Math.random() - 0.5) * thickness * 0.8,
          life: 1,
        });
      }
      sparkRef.current = sparkRef.current.filter((spark) => spark.life > 0);
      if (sparkRef.current.length > 26) {
        sparkRef.current.splice(0, sparkRef.current.length - 26);
      }
      for (const spark of sparkRef.current) {
        spark.life -= delta * 1.8;
        const radius = (1 - spark.life) * 9 + 1.5;
        ctx.save();
        ctx.globalAlpha = Math.max(spark.life, 0) * 0.75;
        ctx.strokeStyle = level === "normal" ? "#ffe6bd" : palette.heat;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ---- încălzirea
    if (palette.heat) {
      const strength =
        level === "critical" ? 0.42 : level === "overload" ? 0.28 : 0.16;
      const heat = ctx.createLinearGradient(0, cy - half, 0, cy + half);
      heat.addColorStop(0, alpha(palette.heat, strength * 0.2));
      heat.addColorStop(0.5, alpha(palette.heat, strength));
      heat.addColorStop(1, alpha(palette.heat, strength * 0.4));
      ctx.fillStyle = heat;
      ctx.fillRect(X0, cy - half, wireWidth, thickness);
    }

    ctx.restore();

    // ---- contur
    ctx.save();
    roundedRect(ctx, X0, cy - half, wireWidth, thickness, Math.min(half, 20));
    ctx.strokeStyle = alpha(lighten(base, 0.6), 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // ---- borne
    drawTerminal(X0, "A");
    drawTerminal(X1, "B");

    // ---- săgeata curentului convențional
    const arrowY = cy - half - 34;
    ctx.save();
    drawArrow(
      ctx,
      X0 + 10,
      arrowY,
      X1 - 10,
      arrowY,
      dark ? "rgba(233,187,111,.9)" : "rgba(154,90,44,.9)",
      6,
      1.4,
    );
    ctx.fillStyle = dark ? "rgba(233,187,111,.9)" : "rgba(154,90,44,.9)";
    ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("I · sens convențional", (X0 + X1) / 2, arrowY - 4);
    ctx.restore();

    // ---- săgeata electronilor (sens invers)
    const eY = cy + half + 34;
    ctx.save();
    drawArrow(
      ctx,
      X1 - 10,
      eY,
      X0 + 10,
      eY,
      dark ? "rgba(143,211,182,.75)" : "rgba(61,132,102,.8)",
      5,
      1.2,
    );
    ctx.fillStyle = dark ? "rgba(143,211,182,.75)" : "rgba(61,132,102,.8)";
    ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("e⁻ · deriva electronilor", (X0 + X1) / 2, eY + 5);
    ctx.restore();

    // ---- cote: L și d
    const dimY = cy + half + 62;
    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X0, dimY);
    ctx.lineTo(X1, dimY);
    ctx.moveTo(X0, dimY - 5);
    ctx.lineTo(X0, dimY + 5);
    ctx.moveTo(X1, dimY - 5);
    ctx.lineTo(X1, dimY + 5);
    ctx.stroke();

    // săgeți mici la capete
    drawArrow(ctx, X0 + 1, dimY, X0 + 9, dimY, palette.muted, 4, 1);
    drawArrow(ctx, X1 - 1, dimY, X1 - 9, dimY, palette.muted, 4, 1);

    ctx.fillStyle = palette.muted;
    ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const lengthTag = `L = ${fmtLength(current.length)}`;
    const tagWidth = ctx.measureText(lengthTag).width;
    ctx.fillStyle = palette.surface;
    ctx.fillRect((X0 + X1) / 2 - tagWidth / 2 - 5, dimY - 11, tagWidth + 10, 14);
    ctx.fillStyle = palette.muted;
    ctx.fillText(lengthTag, (X0 + X1) / 2, dimY + 5);
    ctx.restore();

    // cota diametrului, în dreapta firului
    const dimX = X1 + 22;
    if (dimX < width - 8) {
      ctx.save();
      ctx.strokeStyle = palette.line;
      ctx.beginPath();
      ctx.moveTo(dimX, cy - half);
      ctx.lineTo(dimX, cy + half);
      ctx.moveTo(dimX - 5, cy - half);
      ctx.lineTo(dimX + 5, cy - half);
      ctx.moveTo(dimX - 5, cy + half);
      ctx.lineTo(dimX + 5, cy + half);
      ctx.stroke();
      ctx.fillStyle = palette.muted;
      ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`d = ${fmtDiameter(current.diameter)}`, dimX + 9, cy);
      ctx.restore();
    }

    // ---- etichetele bornelor cu valori
    ctx.save();
    ctx.fillStyle = palette.muted;
    ctx.font = '600 10px "Cascadia Code", Consolas, monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `${current.material.symbol} · ${fmtArea(current.area)}`,
      X0,
      cy - half - 58 > 20 ? cy - half - 58 : 14,
    );
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();

    if (reduced) {
      draw(last, 0);
      const observer = new ResizeObserver(() => draw(last, 0));
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    const tick = (now: number) => {
      const delta = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      draw(now, delta);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="wire-canvas"
      role="img"
      aria-label={`Conductor din ${model.material.name}, lungime ${fmtLength(
        model.length,
      )}, secțiune ${fmtArea(model.area)}, la ${Math.round(
        model.temperature,
      )} grade Celsius, parcurs de curentul de ${model.current.toFixed(
        2,
      )} amperi. Rezistența este ${model.resistance.toFixed(3)} ohmi.`}
    />
  );
}
