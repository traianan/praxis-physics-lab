export function fmt(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "∞";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 100_000 || abs < 0.001)) {
    return value
      .toExponential(2)
      .replace(".", ",")
      .replace("e+", "·10^")
      .replace("e-", "·10^−");
  }
  return value.toFixed(digits).replace(".", ",");
}

export function fmtSigned(value: number, digits = 0): string {
  const sign = value > 0 ? "+" : "";
  return sign + fmt(value, digits);
}

export function fmtPressure(pa: number, digits = 1): string {
  return `${fmt(pa / 1000, digits)} kPa`;
}

export function fmtVolume(m3: number, digits = 1): string {
  return `${fmt(m3 * 1000, digits)} L`;
}

export function fmtTemp(k: number, digits = 0): string {
  return `${fmt(k, digits)} K`;
}

export function fmtEnergy(j: number, digits = 0): string {
  const abs = Math.abs(j);
  if (abs >= 1000) return `${fmt(j / 1000, 2)} kJ`;
  return `${fmt(j, digits)} J`;
}

export function fmtMolarHeat(c: number, digits = 2): string {
  if (!Number.isFinite(c)) return "∞";
  return `${fmt(c, digits)} J/(mol·K)`;
}

export function fmtRatio(value: number, digits = 2): string {
  return `${fmt(value, digits)}×`;
}

export function fmtN(n: number | null): string {
  if (n === null) return "→ ±∞";
  return fmt(n, 2);
}

export function celsius(k: number, digits = 0): string {
  return `${fmt(k - 273.15, digits)} °C`;
}
