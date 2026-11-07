export const R = 8.314462618;

export type GasKind = "mono" | "di";

export interface Gas {
  kind: GasKind;
  name: string;
  short: string;
  examples: string;
  degrees: number;
  cv: number;
  cp: number;
  gamma: number;
}

export const GASES: Record<GasKind, Gas> = {
  mono: {
    kind: "mono",
    name: "Monoatomic",
    short: "Mono",
    examples: "He, Ar, Ne",
    degrees: 3,
    cv: (3 / 2) * R,
    cp: (5 / 2) * R,
    gamma: 5 / 3,
  },
  di: {
    kind: "di",
    name: "Diatomic",
    short: "Diatomic",
    examples: "N₂, O₂, H₂",
    degrees: 5,
    cv: (5 / 2) * R,
    cp: (7 / 2) * R,
    gamma: 7 / 5,
  },
};

export type ProcessTone =
  | "isochoric"
  | "isobaric"
  | "isothermal"
  | "adiabatic"
  | "linear"
  | "generic";

export interface ProcessInfo {
  name: string;
  shortName: string;
  law: string;
  note: string;
  tone: ProcessTone;
  nLabel: string;
}

export interface ModelInput {
  gas: GasKind;
  nu: number;
  p1: number;
  V1: number;
  n: number;
  ratio: number;
  isochoric: boolean;
}

export interface ProcessResult {
  gas: Gas;
  nu: number;
  p1: number;
  V1: number;
  T1: number;
  p2: number;
  V2: number;
  T2: number;
  n: number | null;
  ratio: number;
  isochoric: boolean;
  isIsobaric: boolean;
  isIsothermal: boolean;
  isAdiabatic: boolean;
  isLinear: boolean;
  C: number;
  L: number;
  Q: number;
  dU: number;
  info: ProcessInfo;
}

export const DEFAULT_INPUT: ModelInput = {
  gas: "di",
  nu: 1,
  p1: 100,
  V1: 25,
  n: 1.2,
  ratio: 1.8,
  isochoric: false,
};

const EPS = 1e-4;

function near(a: number, b: number, tolerance = 1e-4): boolean {
  return Math.abs(a - b) < tolerance;
}

export function getProcessInfo(
  n: number,
  gas: Gas,
  isochoric = false,
): ProcessInfo {
  if (isochoric) {
    return {
      name: "Izocoră",
      shortName: "V = const",
      law: "V = constant",
      note: "n → ±∞ · C = C_V · L = 0",
      tone: "isochoric",
      nLabel: "n → ±∞",
    };
  }
  if (near(n, 0)) {
    return {
      name: "Izobară",
      shortName: "p = const",
      law: "p = constant",
      note: "n = 0 · C = C_p · L = pΔV",
      tone: "isobaric",
      nLabel: "n = 0",
    };
  }
  if (near(n, 1)) {
    return {
      name: "Izotermă",
      shortName: "pV = const",
      law: "pV = constant",
      note: "n = 1 · C → ∞ · ΔU = 0 · Q = L",
      tone: "isothermal",
      nLabel: "n = 1",
    };
  }
  if (near(n, gas.gamma)) {
    return {
      name: "Adiabatică",
      shortName: "pVᵞ = const",
      law: "pV^γ = constant",
      note: "n = γ · C = 0 · Q = 0 · ΔU = −L",
      tone: "adiabatic",
      nLabel: "n = γ",
    };
  }
  if (near(n, -1)) {
    return {
      name: "Liniară",
      shortName: "p = k·V",
      law: "p = k · V",
      note: "n = −1 · C = (C_p + C_V)/2",
      tone: "linear",
      nLabel: "n = −1",
    };
  }
  if (n < 0) {
    return {
      name: "Politropă · n < 0",
      shortName: "pVⁿ = const",
      law: "pV^n = constant",
      note: "C < C_V · căldura molară este sub C_V",
      tone: "generic",
      nLabel: `n = ${n.toFixed(2).replace(".", ",")}`,
    };
  }
  if (n < 1) {
    return {
      name: "Politropă · 0 < n < 1",
      shortName: "pVⁿ = const",
      law: "pV^n = constant",
      note: "C > C_p · gazul primește căldură la expansiune",
      tone: "generic",
      nLabel: `n = ${n.toFixed(2).replace(".", ",")}`,
    };
  }
  if (n < gas.gamma) {
    return {
      name: "Politropă · 1 < n < γ",
      shortName: "pVⁿ = const",
      law: "pV^n = constant",
      note: "C < 0 · căldura schimbată are semn opus variației de temperatură",
      tone: "generic",
      nLabel: `n = ${n.toFixed(2).replace(".", ",")}`,
    };
  }
  return {
    name: "Politropă · n > γ",
    shortName: "pVⁿ = const",
    law: "pV^n = constant",
    note: "0 < C < C_V · expansiunea răcește gazul",
    tone: "generic",
    nLabel: `n = ${n.toFixed(2).replace(".", ",")}`,
  };
}

/**
 * Complete polytropic model. Inputs use kPa, litres and mol; outputs use SI
 * (Pa, m³, K, J) so every displayed value is converted in one place.
 *
 * For the isochoric limit, `ratio` is interpreted as p2 / p1 because the
 * volume cannot define a second state on the same vertical line.
 */
export function computeProcess(input: ModelInput): ProcessResult {
  const gas = GASES[input.gas];
  const nu = Math.max(input.nu, 1e-6);
  const p1 = Math.max(input.p1, 1) * 1000;
  const V1 = Math.max(input.V1, 0.1) / 1000;
  const ratio = Math.max(input.ratio, 0.05);
  const T1 = (p1 * V1) / (nu * R);

  let p2: number;
  let V2: number;
  let T2: number;
  let C: number;
  let L: number;
  let Q: number;
  let dU: number;
  let n: number | null = input.n;
  let isIsobaric = false;
  let isIsothermal = false;
  let isAdiabatic = false;
  let isLinear = false;

  if (input.isochoric) {
    V2 = V1;
    p2 = p1 * ratio;
    T2 = (p2 * V2) / (nu * R);
    C = gas.cv;
    L = 0;
    dU = nu * gas.cv * (T2 - T1);
    Q = dU;
    n = null;
  } else {
    V2 = V1 * ratio;
    isIsobaric = near(input.n, 0, EPS);
    isIsothermal = near(input.n, 1, EPS);
    isAdiabatic = near(input.n, gas.gamma, EPS);
    isLinear = near(input.n, -1, EPS);

    if (isIsothermal) {
      p2 = (p1 * V1) / V2;
      T2 = T1;
      C = Number.POSITIVE_INFINITY;
      L = p1 * V1 * Math.log(ratio);
      dU = 0;
      Q = L;
    } else {
      p2 = p1 * Math.pow(V1 / V2, input.n);
      T2 = T1 * Math.pow(V1 / V2, input.n - 1);
      C = gas.cv + R / (1 - input.n);
      L = (p1 * V1 - p2 * V2) / (input.n - 1);
      dU = nu * gas.cv * (T2 - T1);
      Q = dU + L;
      if (isAdiabatic) {
        Q = 0;
        dU = -L;
        C = 0;
      }
      if (isIsobaric) {
        p2 = p1;
        T2 = (p2 * V2) / (nu * R);
        C = gas.cp;
        L = p1 * (V2 - V1);
        dU = nu * gas.cv * (T2 - T1);
        Q = dU + L;
      }
    }
  }

  if (Math.abs(Q) < 1e-9) Q = 0;
  if (Math.abs(L) < 1e-12) L = 0;
  if (Math.abs(dU) < 1e-9) dU = 0;

  return {
    gas,
    nu,
    p1,
    V1,
    T1,
    p2,
    V2,
    T2,
    n,
    ratio,
    isochoric: input.isochoric,
    isIsobaric,
    isIsothermal,
    isAdiabatic,
    isLinear,
    C,
    L,
    Q,
    dU,
    info: getProcessInfo(input.n, gas, input.isochoric),
  };
}

export interface EnergySnapshot {
  V: number;
  p: number;
  T: number;
  L: number;
  Q: number;
  dU: number;
}

/**
 * Energy values for the part of the process already travelled at `progress`.
 * This keeps the energy-flow panel consistent with the moving point on the
 * p-V chart instead of linearly interpolating the final values.
 */
export function energyAt(model: ProcessResult, progress: number): EnergySnapshot {
  const t = clamp(progress, 0, 1);
  if (model.isochoric) {
    const V = model.V1;
    const p = model.p1 + (model.p2 - model.p1) * t;
    const T = (p * V) / (model.nu * R);
    const L = 0;
    const dU = model.nu * model.gas.cv * (T - model.T1);
    return { V, p, T, L, Q: dU, dU };
  }

  const V = model.V1 + (model.V2 - model.V1) * t;
  const p =
    model.p1 *
    Math.pow(model.V1 / Math.max(V, 1e-12), model.n ?? 1);
  const T = (p * V) / (model.nu * R);
  const L = model.isIsothermal
    ? model.p1 * model.V1 * Math.log(V / model.V1)
    : (model.p1 * model.V1 - p * V) / ((model.n ?? 1) - 1);
  const dU = model.nu * model.gas.cv * (T - model.T1);
  const Q = model.isAdiabatic ? 0 : dU + L;
  return { V, p, T, L, Q, dU };
}

export interface ComparisonRow {
  n: number;
  result: ProcessResult;
}

export function compareSimpleProcesses(
  base: Pick<ModelInput, "gas" | "nu" | "p1" | "V1" | "ratio">,
): ComparisonRow[] {
  const gas = GASES[base.gas];
  return [-1, 0, 1, gas.gamma].map((n) => ({
    n,
    result: computeProcess({ ...base, n, isochoric: false }),
  }));
}

/** Pressure at volume V for a polytrope that starts at (p1, V1). */
export function pressureAt(
  p1: number,
  V1: number,
  n: number,
  V: number,
): number {
  return p1 * Math.pow(V1 / V, n);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
