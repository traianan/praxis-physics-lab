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

export function fmtSigned(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return sign + fmt(value, digits);
}

export function fmtVoltage(volts: number, digits = 2): string {
  const abs = Math.abs(volts);
  if (abs >= 1) return `${fmt(volts, digits)} V`;
  return `${fmt(volts * 1000, 0)} mV`;
}

export function fmtCurrent(amps: number, digits = 3): string {
  const abs = Math.abs(amps);
  if (abs >= 1) return `${fmt(amps, digits)} A`;
  if (abs >= 0.001) return `${fmt(amps * 1000, digits === 3 ? 1 : digits)} mA`;
  if (abs === 0) return "0 A";
  return `${fmt(amps * 1e6, 0)} µA`;
}

export function fmtResistance(ohms: number, digits = 1): string {
  const abs = Math.abs(ohms);
  if (abs >= 1e6) return `${fmt(ohms / 1e6, 2)} MΩ`;
  if (abs >= 1000) return `${fmt(ohms / 1000, 2)} kΩ`;
  if (abs < 0.01 && abs > 0) return `${fmt(ohms * 1000, 1)} mΩ`;
  return `${fmt(ohms, digits)} Ω`;
}

export function fmtPower(watts: number, digits = 2): string {
  const abs = Math.abs(watts);
  if (abs >= 1000) return `${fmt(watts / 1000, 2)} kW`;
  if (abs >= 1) return `${fmt(watts, digits)} W`;
  if (abs >= 0.001) return `${fmt(watts * 1000, 1)} mW`;
  return `${fmt(watts * 1e6, 0)} µW`;
}

export function fmtPercent(fraction: number, digits = 1): string {
  return `${fmt(fraction * 100, digits)} %`;
}

export function fmtLength(meters: number, digits = 2): string {
  if (Math.abs(meters) < 0.01) return `${fmt(meters * 1000, 0)} mm`;
  if (Math.abs(meters) < 1) return `${fmt(meters * 100, 1)} cm`;
  return `${fmt(meters, digits)} m`;
}
