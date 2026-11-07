/** Utilitare mici de culoare pentru canvas și SVG. */

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;
  const value = Number.parseInt(full, 16);
  return [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ];
}

export function mixColors(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const ratio = Math.min(1, Math.max(0, t));
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const bl = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function lighten(hex: string, amount: number): string {
  return mixColors(hex, "#ffffff", amount);
}

export function darken(hex: string, amount: number): string {
  return mixColors(hex, "#000000", amount);
}

export function alpha(hex: string, value: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${value})`;
}
