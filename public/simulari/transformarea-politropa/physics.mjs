const R = 8.314462618;
const GASES = {
  mono: {
    kind: "mono",
    name: "Monoatomic",
    short: "Mono",
    examples: "He, Ar, Ne",
    degrees: 3,
    cv: 3 / 2 * R,
    cp: 5 / 2 * R,
    gamma: 5 / 3
  },
  di: {
    kind: "di",
    name: "Diatomic",
    short: "Diatomic",
    examples: "N\u2082, O\u2082, H\u2082",
    degrees: 5,
    cv: 5 / 2 * R,
    cp: 7 / 2 * R,
    gamma: 7 / 5
  }
};
const DEFAULT_INPUT = {
  gas: "di",
  nu: 1,
  p1: 100,
  V1: 25,
  n: 1.2,
  ratio: 1.8,
  isochoric: false
};
const EPS = 1e-4;
function near(a, b, tolerance = 1e-4) {
  return Math.abs(a - b) < tolerance;
}
function getProcessInfo(n, gas, isochoric = false) {
  if (isochoric) {
    return {
      name: "Izocor\u0103",
      shortName: "V = const",
      law: "V = constant",
      note: "n \u2192 \xB1\u221E \xB7 C = C_V \xB7 L = 0",
      tone: "isochoric",
      nLabel: "n \u2192 \xB1\u221E"
    };
  }
  if (near(n, 0)) {
    return {
      name: "Izobar\u0103",
      shortName: "p = const",
      law: "p = constant",
      note: "n = 0 \xB7 C = C_p \xB7 L = p\u0394V",
      tone: "isobaric",
      nLabel: "n = 0"
    };
  }
  if (near(n, 1)) {
    return {
      name: "Izoterm\u0103",
      shortName: "pV = const",
      law: "pV = constant",
      note: "n = 1 \xB7 C \u2192 \u221E \xB7 \u0394U = 0 \xB7 Q = L",
      tone: "isothermal",
      nLabel: "n = 1"
    };
  }
  if (near(n, gas.gamma)) {
    return {
      name: "Adiabatic\u0103",
      shortName: "pV\u1D5E = const",
      law: "pV^\u03B3 = constant",
      note: "n = \u03B3 \xB7 C = 0 \xB7 Q = 0 \xB7 \u0394U = \u2212L",
      tone: "adiabatic",
      nLabel: "n = \u03B3"
    };
  }
  if (near(n, -1)) {
    return {
      name: "Liniar\u0103",
      shortName: "p = k\xB7V",
      law: "p = k \xB7 V",
      note: "n = \u22121 \xB7 C = (C_p + C_V)/2",
      tone: "linear",
      nLabel: "n = \u22121"
    };
  }
  if (n < 0) {
    return {
      name: "Politrop\u0103 \xB7 n < 0",
      shortName: "pV\u207F = const",
      law: "pV^n = constant",
      note: "C_V < C < C_p \xB7 c\u0103ldura molar\u0103 este \xEEntre C_V \u0219i C_p",
      tone: "generic",
      nLabel: `n = ${n.toFixed(2).replace(".", ",")}`
    };
  }
  if (n < 1) {
    return {
      name: "Politrop\u0103 \xB7 0 < n < 1",
      shortName: "pV\u207F = const",
      law: "pV^n = constant",
      note: "C > C_p \xB7 gazul prime\u0219te c\u0103ldur\u0103 la expansiune",
      tone: "generic",
      nLabel: `n = ${n.toFixed(2).replace(".", ",")}`
    };
  }
  if (n < gas.gamma) {
    return {
      name: "Politrop\u0103 \xB7 1 < n < \u03B3",
      shortName: "pV\u207F = const",
      law: "pV^n = constant",
      note: "C < 0 \xB7 c\u0103ldura schimbat\u0103 are semn opus varia\u021Biei de temperatur\u0103",
      tone: "generic",
      nLabel: `n = ${n.toFixed(2).replace(".", ",")}`
    };
  }
  return {
    name: "Politrop\u0103 \xB7 n > \u03B3",
    shortName: "pV\u207F = const",
    law: "pV^n = constant",
    note: "0 < C < C_V \xB7 expansiunea r\u0103ce\u0219te gazul",
    tone: "generic",
    nLabel: `n = ${n.toFixed(2).replace(".", ",")}`
  };
}
function computeProcess(input) {
  const gas = GASES[input.gas];
  input = { ...input, n: near(input.n, 0) ? 0 : near(input.n, 1) ? 1 : near(input.n, gas.gamma) ? gas.gamma : input.n };
  const nu = Math.max(input.nu, 1e-6);
  const p1 = Math.max(input.p1, 1) * 1e3;
  const V1 = Math.max(input.V1, 0.1) / 1e3;
  const ratio = Math.max(input.ratio, 0.05);
  const T1 = p1 * V1 / (nu * R);
  let p2;
  let V2;
  let T2;
  let C;
  let L;
  let Q;
  let dU;
  let n = input.n;
  let isIsobaric = false;
  let isIsothermal = false;
  let isAdiabatic = false;
  let isLinear = false;
  if (input.isochoric) {
    V2 = V1;
    p2 = p1 * ratio;
    T2 = p2 * V2 / (nu * R);
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
      p2 = p1 * V1 / V2;
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
        T2 = p2 * V2 / (nu * R);
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
    info: getProcessInfo(input.n, gas, input.isochoric)
  };
}
function energyAt(model, progress) {
  const t = clamp(progress, 0, 1);
  if (model.isochoric) {
    const V2 = model.V1;
    const p2 = model.p1 + (model.p2 - model.p1) * t;
    const T2 = p2 * V2 / (model.nu * R);
    const L2 = 0;
    const dU2 = model.nu * model.gas.cv * (T2 - model.T1);
    return { V: V2, p: p2, T: T2, L: L2, Q: dU2, dU: dU2 };
  }
  const V = model.V1 + (model.V2 - model.V1) * t;
  const p = model.p1 * Math.pow(model.V1 / Math.max(V, 1e-12), model.n ?? 1);
  const T = p * V / (model.nu * R);
  const L = model.isIsothermal ? model.p1 * model.V1 * Math.log(V / model.V1) : (model.p1 * model.V1 - p * V) / ((model.n ?? 1) - 1);
  const dU = model.nu * model.gas.cv * (T - model.T1);
  const Q = model.isAdiabatic ? 0 : dU + L;
  return { V, p, T, L, Q, dU };
}
function compareSimpleProcesses(base) {
  const gas = GASES[base.gas];
  return [-1, 0, 1, gas.gamma].map((n) => ({
    n,
    result: computeProcess({ ...base, n, isochoric: false })
  }));
}
function pressureAt(p1, V1, n, V) {
  return p1 * Math.pow(V1 / V, n);
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
export {
  DEFAULT_INPUT,
  GASES,
  R,
  clamp,
  compareSimpleProcesses,
  computeProcess,
  easeInOutCubic,
  energyAt,
  getProcessInfo,
  lerp,
  pressureAt
};
