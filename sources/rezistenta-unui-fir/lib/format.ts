export function fmt(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "∞";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1_000_000 || abs < 0.0001)) {
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

/** Rezistența, cu prefixul potrivit (mΩ, Ω, kΩ). */
export function fmtResistance(ohm: number, digits = 2): string {
  const abs = Math.abs(ohm);
  if (abs >= 1000) return `${fmt(ohm / 1000, 2)} kΩ`;
  if (abs >= 1) return `${fmt(ohm, digits)} Ω`;
  if (abs >= 0.001) return `${fmt(ohm * 1000, 1)} mΩ`;
  return `${fmt(ohm, 2)} Ω`;
}

/** Rezistivitatea, în Ω·mm²/m — unitatea din manualele școlare. */
export function fmtRho(rhoSi: number, digits = 3): string {
  return `${fmt(rhoSi * 1e6, digits)} Ω·mm²/m`;
}

export function fmtResistivitySI(rhoSi: number): string {
  return `${fmt(rhoSi, 3)} Ω·m`;
}

export function fmtLength(meters: number): string {
  if (meters < 0.01) return `${fmt(meters * 1000, 1)} mm`;
  if (meters < 1) return `${fmt(meters * 100, 0)} cm`;
  if (meters >= 1000) return `${fmt(meters / 1000, 2)} km`;
  return `${fmt(meters, meters < 10 ? 2 : 1)} m`;
}

/** Aria secțiunii, în mm². */
export function fmtArea(areaMm2: number): string {
  if (areaMm2 < 0.1) return `${fmt(areaMm2, 3)} mm²`;
  return `${fmt(areaMm2, areaMm2 < 10 ? 2 : 1)} mm²`;
}

export function fmtDiameter(mm: number): string {
  if (mm < 0.1) return `${fmt(mm * 1000, 0)} µm`;
  return `${fmt(mm, 2)} mm`;
}

export function fmtCurrent(amperes: number): string {
  if (Math.abs(amperes) < 0.001) return `${fmt(amperes * 1e6, 0)} µA`;
  if (Math.abs(amperes) < 1) return `${fmt(amperes * 1000, 1)} mA`;
  return `${fmt(amperes, 2)} A`;
}

export function fmtVoltage(volts: number): string {
  if (Math.abs(volts) < 0.001) return `${fmt(volts * 1e6, 0)} µV`;
  if (Math.abs(volts) < 1) return `${fmt(volts * 1000, 1)} mV`;
  return `${fmt(volts, 2)} V`;
}

export function fmtPower(watts: number): string {
  if (Math.abs(watts) < 0.001) return `${fmt(watts * 1e6, 0)} µW`;
  if (Math.abs(watts) < 1) return `${fmt(watts * 1000, 1)} mW`;
  if (Math.abs(watts) >= 1000) return `${fmt(watts / 1000, 2)} kW`;
  return `${fmt(watts, 2)} W`;
}

export function fmtMass(kg: number): string {
  if (kg < 0.001) return `${fmt(kg * 1e6, 1)} mg`;
  if (kg < 1) return `${fmt(kg * 1000, kg * 1000 < 10 ? 2 : 1)} g`;
  return `${fmt(kg, 2)} kg`;
}

export function fmtSpeed(metersPerSecond: number): string {
  const mmPerSecond = metersPerSecond * 1000;
  if (mmPerSecond < 0.001) return `${fmt(mmPerSecond * 1e6, 1)} nm/s`;
  if (mmPerSecond < 1) return `${fmt(mmPerSecond * 1000, 1)} µm/s`;
  if (mmPerSecond < 1000) return `${fmt(mmPerSecond, 2)} mm/s`;
  return `${fmt(metersPerSecond, 1)} m/s`;
}

export function fmtDensity(moleculesPerM3: number): string {
  return `${fmt(moleculesPerM3 / 1e28, 2)}·10²⁸ m⁻³`;
}

export function fmtTemperature(celsius: number): string {
  return `${fmt(celsius, 0)} °C`;
}

export function fmtPercent(value: number, digits = 0): string {
  return `${fmt(value * 100, digits)} %`;
}
