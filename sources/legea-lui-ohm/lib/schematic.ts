/* ==========================================================================
   Primitive de desen pentru scheme electrice, pe canvas 2D.
   Toate coordonatele sunt în pixeli CSS.
   ========================================================================== */

export interface SchematicPalette {
  wire: string;
  wireHot: string;
  component: string;
  componentSoft: string;
  text: string;
  muted: string;
  surface: string;
  surfaceAlt: string;
  meter: string;
  battery: string;
  glow: string;
  danger: string;
}

export function schematicPalette(dark: boolean): SchematicPalette {
  return {
    wire: dark ? "#5a6b86" : "#98a2b1",
    wireHot: dark ? "#7fa8d8" : "#7f93a8",
    component: dark ? "#e2a06a" : "#b96f33",
    componentSoft: dark ? "rgba(226,160,106,.16)" : "rgba(192,122,62,.12)",
    text: dark ? "#e8edf6" : "#1b2029",
    muted: dark ? "#8d9ab0" : "#6c7482",
    surface: dark ? "#101a2b" : "#fffdf9",
    surfaceAlt: dark ? "#0c1524" : "#faf6ee",
    meter: dark ? "#5fc3d9" : "#0f6f84",
    battery: dark ? "#edb85f" : "#b1741f",
    glow: dark ? "rgba(95,195,217,.35)" : "rgba(15,111,132,.2)",
    danger: dark ? "#ea8f7e" : "#b8503f",
  };
}

export function wire(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  color: string,
  lineWidth = 2.2,
): void {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index][0], points[index][1]);
  }
  ctx.stroke();
  ctx.restore();
}

/** Rezistor desenat vertical sau orizontal, centrat în (x, y). */
export function resistor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  color: string,
  vertical = false,
  label?: string,
  labelColor?: string,
): void {
  const half = length / 2;
  const body = length * 0.58;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  if (vertical) {
    ctx.moveTo(x, y - half);
    ctx.lineTo(x, y - body / 2);
    const teeth = 4;
    const step = body / teeth;
    for (let index = 0; index < teeth; index += 1) {
      const top = y - body / 2 + index * step;
      ctx.lineTo(x + (index % 2 === 0 ? 8 : -8), top + step * 0.25);
      ctx.lineTo(x + (index % 2 === 0 ? 8 : -8), top + step * 0.75);
    }
    ctx.lineTo(x, y + body / 2);
    ctx.lineTo(x, y + half);
  } else {
    ctx.moveTo(x - half, y);
    ctx.lineTo(x - body / 2, y);
    const teeth = 4;
    const step = body / teeth;
    for (let index = 0; index < teeth; index += 1) {
      const left = x - body / 2 + index * step;
      ctx.lineTo(left + step * 0.25, y - 8);
      ctx.lineTo(left + step * 0.75, y + 8);
    }
    ctx.lineTo(x + body / 2, y);
    ctx.lineTo(x + half, y);
  }
  ctx.stroke();
  if (label) {
    ctx.fillStyle = labelColor ?? color;
    ctx.font = 'italic 13px Georgia, "Palatino Linotype", serif';
    if (vertical) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + 14, y);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, x, y + 13);
    }
  }
  ctx.restore();
}

export function drawSubscriptText(
  ctx: CanvasRenderingContext2D,
  base: string,
  subscript: string,
  suffix: string,
  x: number,
  y: number,
  align: CanvasTextAlign = "left",
): void {
  ctx.save();
  const mainFont = ctx.font;
  const baseline = ctx.textBaseline;
  const size = Number(mainFont.match(/([\d.]+)px/)?.[1] ?? 10);
  const subFont = mainFont.replace(/[\d.]+px/, `${Math.max(6, size * 0.72)}px`);
  ctx.textAlign = "left";
  const baseWidth = ctx.measureText(base).width;
  ctx.font = subFont;
  const subWidth = ctx.measureText(subscript).width;
  ctx.font = mainFont;
  const suffixWidth = ctx.measureText(suffix).width;
  const totalWidth = baseWidth + subWidth + suffixWidth;
  const start = align === "center" ? x - totalWidth / 2 : align === "right" ? x - totalWidth : x;
  ctx.fillText(base, start, y);
  ctx.font = subFont;
  ctx.textBaseline = "top";
  ctx.fillText(subscript, start + baseWidth, y + 2);
  ctx.font = mainFont;
  ctx.textBaseline = baseline;
  ctx.fillText(suffix, start + baseWidth + subWidth, y);
  ctx.restore();
}

export interface BatteryOptions {
  /** distanța dintre cele două borne */
  length?: number;
  label?: string;
  label2?: string;
  vertical?: boolean;
  leadLength?: number;
  leadColor?: string;
  showPolarity?: boolean;
}

/** Baterie / sursă cu t.e.m. E și rezistență internă r. */
export function battery(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  textColor: string,
  options: BatteryOptions = {},
): void {
  const length = options.length ?? 14;
  const vertical = options.vertical ?? false;
  const half = length / 2;
  const leadLength = options.leadLength ?? 24;
  const longPlate = 16;
  const shortPlate = 10;
  ctx.save();
  ctx.strokeStyle = options.leadColor ?? color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (vertical) {
    ctx.moveTo(x, y - half - leadLength);
    ctx.lineTo(x, y - half);
    ctx.moveTo(x, y + half);
    ctx.lineTo(x, y + half + leadLength);
    ctx.moveTo(x - longPlate / 2, y - half);
    ctx.lineTo(x + longPlate / 2, y - half);
    ctx.moveTo(x - shortPlate / 2, y + half);
    ctx.lineTo(x + shortPlate / 2, y + half);
  } else {
    ctx.moveTo(x - half - leadLength, y);
    ctx.lineTo(x - half, y);
    ctx.moveTo(x + half, y);
    ctx.lineTo(x + half + leadLength, y);
    ctx.moveTo(x - half, y - longPlate / 2);
    ctx.lineTo(x - half, y + longPlate / 2);
    ctx.moveTo(x + half, y - shortPlate / 2);
    ctx.lineTo(x + half, y + shortPlate / 2);
  }
  ctx.stroke();

  if (options.showPolarity !== false) {
    ctx.font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    ctx.fillStyle = textColor;
    if (vertical) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("+", x + longPlate / 2 + 4, y - half);
      ctx.fillText("−", x + shortPlate / 2 + 4, y + half);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("+", x - half, y + longPlate / 2 + 3);
      ctx.fillText("−", x + half, y + shortPlate / 2 + 3);
    }
  }

  if (options.label) {
    ctx.font = 'italic 11px Georgia, "Palatino Linotype", serif';
    ctx.fillStyle = textColor;
    if (vertical) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(options.label, x + longPlate / 2 + 16, y - half);
      if (options.label2) {
        ctx.font = 'italic 10px Georgia, "Palatino Linotype", serif';
        ctx.fillStyle = color;
        ctx.fillText(options.label2, x + shortPlate / 2 + 16, y + half);
      }
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(options.label, x - half, y - longPlate / 2 - 2);
      if (options.label2) {
        ctx.font = 'italic 10px Georgia, "Palatino Linotype", serif';
        ctx.fillStyle = color;
        ctx.fillText(options.label2, x + half, y - shortPlate / 2 - 2);
      }
    }
  }
  ctx.restore();
}

/** Instrument de măsură circular, cu simbol A sau V. */
export function meter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  symbol: "A" | "V" | "Ω",
  color: string,
  surface: string,
  radius = 17,
  reading?: string,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.stroke();
  ctx.font = '600 12px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, x, y + 1);
  if (reading) {
    ctx.font = '600 9px "Cascadia Code", "Cascadia Mono", Consolas, monospace';
    ctx.textBaseline = "top";
    ctx.fillText(reading, x, y + radius + 5);
  }
  ctx.restore();
}

/** Scurtcircuit: fir gros între două puncte, cu scânteie. */
export function shortWire(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** Săgeată mică de curent, cu vârf. */
export function currentArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  size = 6,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.75, -size * 0.7);
  ctx.lineTo(-size * 0.75, size * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Cursor glisant (reostat) desenat ca un triunghi. */
export function sliderCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  surface: string,
  size = 9,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y + size * 0.7);
  ctx.lineTo(x - size, y + size * 0.7);
  ctx.closePath();
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Etichetă cu fundal, ca să rămână lizibilă peste fire. */
export function tag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  background: string,
  align: CanvasTextAlign = "center",
  font = '600 10px "Cascadia Code", "Cascadia Mono", Consolas, monospace',
): void {
  ctx.save();
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const padding = 4;
  const width = metrics.width + padding * 2;
  let left = x - width / 2;
  if (align === "left") left = x - padding;
  if (align === "right") left = x - width + padding;
  ctx.fillStyle = background;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(left, y - 9, width, 14);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Grilă de fundal, discretă. */
export function schematicGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  step = 22,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}
