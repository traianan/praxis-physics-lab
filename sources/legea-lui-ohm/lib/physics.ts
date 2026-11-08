/* ==========================================================================
   Legea lui Ohm — model fizic
   Toate mărimile în SI. Interfața afișează V, mA, Ω, W.
   ========================================================================== */

export const R_GAS = 8.314462618;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Rounded to a sensible number of significant digits for display. */
export function sig(value: number, digits = 3): number {
  if (value === 0 || !Number.isFinite(value)) return value;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, digits - 1 - magnitude);
  return Math.round(value * factor) / factor;
}

/* -------------------------------------------------------------------------- */
/*                             METALE ȘI MATERIALE                            */
/* -------------------------------------------------------------------------- */

export interface Material {
  id: string;
  name: string;
  symbol: string;
  /** Rezistivitate la 20 °C, Ω·m */
  rho20: number;
  /** Coeficient termic de rezistivitate, 1/K */
  alpha: number;
  /** Densitate, kg/m³ */
  density: number;
  tone: "copper" | "amber" | "cyan" | "violet" | "blue" | "green" | "red";
  note: string;
}

export const MATERIALS: Material[] = [
  {
    id: "copper",
    name: "Cupru",
    symbol: "Cu",
    rho20: 1.68e-8,
    alpha: 3.93e-3,
    density: 8960,
    tone: "copper",
    note: "Standardul instalațiilor electrice: conductivitate excelentă.",
  },
  {
    id: "aluminium",
    name: "Aluminiu",
    symbol: "Al",
    rho20: 2.65e-8,
    alpha: 4.29e-3,
    density: 2700,
    tone: "blue",
    note: "Linii aeriene: de 1,6 ori mai rezistiv, dar de 3,3 ori mai ușor.",
  },
  {
    id: "silver",
    name: "Argint",
    symbol: "Ag",
    rho20: 1.59e-8,
    alpha: 3.8e-3,
    density: 10490,
    tone: "violet",
    note: "Cel mai bun conductor metalic, folosit doar în contacte speciale.",
  },
  {
    id: "gold",
    name: "Aur",
    symbol: "Au",
    rho20: 2.44e-8,
    alpha: 3.4e-3,
    density: 19300,
    tone: "amber",
    note: "Contacte care nu se oxidează: conectori, electronică de precizie.",
  },
  {
    id: "iron",
    name: "Fier",
    symbol: "Fe",
    rho20: 9.71e-8,
    alpha: 6.5e-3,
    density: 7870,
    tone: "green",
    note: "Șine, armături, rezistențe de putere pentru încălzire.",
  },
  {
    id: "nichrome",
    name: "Nicrom",
    symbol: "NiCr",
    rho20: 1.1e-6,
    alpha: 1.7e-4,
    density: 8400,
    tone: "red",
    note: "Rezistivitate mare și α mic: rezistențe de încălzire și reostate.",
  },
  {
    id: "tungsten",
    name: "Wolfram",
    symbol: "W",
    rho20: 5.6e-8,
    alpha: 4.5e-3,
    density: 19300,
    tone: "cyan",
    note: "Filament de bec: suportă 2 700 K fără să se topească.",
  },
  {
    id: "constantan",
    name: "Constantan",
    symbol: "CuNi",
    rho20: 4.9e-7,
    alpha: 2.0e-5,
    density: 8900,
    tone: "amber",
    note: "α aproape nul: șunturi de măsurare și termocuple.",
  },
  {
    id: "graphite",
    name: "Grafit",
    symbol: "C",
    rho20: 1.0e-5,
    alpha: -2.0e-4,
    density: 2260,
    tone: "violet",
    note: "Mina de creion: conductor, dar cu α negativ.",
  },
  {
    id: "sea",
    name: "Apă de mare",
    symbol: "H₂O",
    rho20: 0.2,
    alpha: 2.0e-2,
    density: 1025,
    tone: "blue",
    note: "Electrolit: conduce prin ioni, nu prin electroni liberi.",
  },
];

export function materialById(id: string): Material {
  return MATERIALS.find((material) => material.id === id) ?? MATERIALS[0];
}

/** Rezistivitatea la temperatura dată (model liniar, cu prag fizic). */
export function resistivityAt(material: Material, temperatureC: number): number {
  const factor = 1 + material.alpha * (temperatureC - 20);
  return material.rho20 * Math.max(0.02, factor);
}

/* -------------------------------------------------------------------------- */
/*                          REZISTENȚA UNUI CONDUCTOR                         */
/* -------------------------------------------------------------------------- */

export interface WireInput {
  materialId: string;
  /** Lungime, m */
  length: number;
  /** Diametru, mm */
  diameter: number;
  /** Temperatură, °C */
  temperature: number;
}

export function sectionFromDiameter(diameterMm: number): number {
  const d = diameterMm / 1000;
  return Math.PI * d * d * 0.25;
}

export function resistanceOfWire(input: WireInput): number {
  const material = materialById(input.materialId);
  const rho = resistivityAt(material, input.temperature);
  const area = Math.max(1e-12, sectionFromDiameter(input.diameter));
  return (rho * input.length) / area;
}

/* -------------------------------------------------------------------------- */
/*                         COMPONENTE NELINIARE (BEC)                         */
/* -------------------------------------------------------------------------- */

export interface BulbSpec {
  id: string;
  name: string;
  /** Tensiune nominală, V */
  ratedVoltage: number;
  /** Putere nominală, W */
  ratedPower: number;
  /** Rezistență la rece (raport din cea nominală) */
  coldRatio: number;
  note: string;
}

export const BULBS: BulbSpec[] = [
  {
    id: "bulb-6v",
    name: "Bec 6 V / 3 W",
    ratedVoltage: 6,
    ratedPower: 3,
    coldRatio: 0.12,
    note: "Bec de lanternă: filament scurt, se aprinde repede.",
  },
  {
    id: "bulb-12v",
    name: "Bec 12 V / 5 W",
    ratedVoltage: 12,
    ratedPower: 5,
    coldRatio: 0.11,
    note: "Bec auto: filament de wolfram, α mare.",
  },
  {
    id: "bulb-24v",
    name: "Bec 24 V / 21 W",
    ratedVoltage: 24,
    ratedPower: 21,
    coldRatio: 0.09,
    note: "Bec de semnalizare: curent mare la rece.",
  },
];

/**
 * Rezistența filamentului crește cu temperatura, iar temperatura crește cu
 * puterea disipată. Modelul de mai jos dă o dependență monotonă și sublineară
 * a curentului: R(U) = R_rece + (R_nominal − R_rece)·(U/U_n)^0,45.
 *
 * Exponentul 0,45 este cel al wolframului: la tensiune dublă, curentul crește de
 * aproximativ 1,55 ori, nu de două ori. La tensiune zero rămâne R_rece, deci
 * curentul de pornire este mare — exact comportamentul real al unui bec.
 */
export function bulbResistanceAt(spec: BulbSpec, voltage: number): number {
  const hot = (spec.ratedVoltage * spec.ratedVoltage) / spec.ratedPower;
  const cold = hot * spec.coldRatio;
  const load = Math.abs(voltage) / Math.max(spec.ratedVoltage, 1e-6);
  return cold + (hot - cold) * Math.pow(clamp(load, 0, 1.8), 0.45);
}

/* -------------------------------------------------------------------------- */
/*                          CARACTERISTICA U–I A UNUI DIPOL                   */
/* -------------------------------------------------------------------------- */

export type DipoleKind = "resistor" | "bulb";

export interface DipolePoint {
  u: number;
  i: number;
}

/**
 * Rezistor ohmic: I = U/R, dreaptă prin origine.
 * Bec: R crește cu temperatura filamentului, deci I(U) se aplatizează.
 */
export function dipoleCurrent(
  kind: DipoleKind,
  resistance: number,
  bulb: BulbSpec,
  voltage: number,
): number {
  if (kind === "resistor") return voltage / Math.max(resistance, 1e-9);
  const r = bulbResistanceAt(bulb, voltage);
  return voltage / Math.max(r, 1e-9);
}

export function dipoleCurve(
  kind: DipoleKind,
  resistance: number,
  bulb: BulbSpec,
  uMax: number,
  samples = 160,
): DipolePoint[] {
  const points: DipolePoint[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const u = (uMax * index) / samples;
    points.push({ u, i: dipoleCurrent(kind, resistance, bulb, u) });
  }
  return points;
}

/* -------------------------------------------------------------------------- */
/*                            CIRCUITUL COMPLET                               */
/* -------------------------------------------------------------------------- */

export interface CircuitInput {
  /** Tensiunea electromotoare, V */
  emf: number;
  /** Rezistența internă, Ω */
  internal: number;
  /** Rezistența exterioară, Ω */
  external: number;
}

export interface CircuitResult {
  emf: number;
  internal: number;
  external: number;
  /** Intensitatea curentului, A */
  current: number;
  /** Tensiunea la borne, V */
  terminal: number;
  /** Căderea de tensiune internă, V */
  internalDrop: number;
  /** Puterea totală debitată de sursă, W */
  totalPower: number;
  /** Puterea utilă în circuitul exterior, W */
  usefulPower: number;
  /** Puterea disipată pe rezistența internă, W */
  internalPower: number;
  /** Randamentul transferului, adimensional */
  efficiency: number;
  /** Curentul de scurtcircuit, A */
  shortCircuit: number;
  /** Rezistența exterioară pentru transfer maxim de putere, Ω */
  matchedExternal: number;
  /** Puterea utilă maximă, W */
  maxUsefulPower: number;
}

export function computeCircuit(input: CircuitInput): CircuitResult {
  const emf = Math.max(0, input.emf);
  const internal = Math.max(1e-4, input.internal);
  const external = Math.max(0, input.external);
  const current = emf / (external + internal);
  const terminal = current * external;
  const internalDrop = current * internal;
  const totalPower = emf * current;
  const usefulPower = terminal * current;
  const internalPower = internalDrop * current;
  const efficiency = totalPower > 0 ? usefulPower / totalPower : 0;
  const shortCircuit = emf / internal;
  const matchedExternal = internal;
  const maxUsefulPower = (emf * emf) / (4 * internal);
  return {
    emf,
    internal,
    external,
    current,
    terminal,
    internalDrop,
    totalPower,
    usefulPower,
    internalPower,
    efficiency,
    shortCircuit,
    matchedExternal,
    maxUsefulPower,
  };
}

/** Tensiunea la borne în funcție de curent: U(I) = E − r·I. */
export function terminalAtCurrent(emf: number, internal: number, current: number): number {
  return emf - internal * current;
}

/** Rezistența exterioară pentru care curentul este cel dat. */
export function externalForCurrent(emf: number, internal: number, current: number): number {
  if (current <= 0) return Infinity;
  return Math.max(0, emf / current - internal);
}

/* -------------------------------------------------------------------------- */
/*                        REOSTAT ȘI MONTaj POTENȚIOMETRIC                     */
/* -------------------------------------------------------------------------- */

export interface RheostatInput {
  emf: number;
  /** Rezistența totală a firului, Ω */
  wireResistance: number;
  /** Lungimea totală a firului, m */
  wireLength: number;
  /** Lungimea utilizată (poziția cursorului), m */
  cursorLength: number;
  /** Rezistența de sarcină bornele A–C, Ω; Infinity pentru voltmetru ideal */
  load: number;
  internal: number;
}

export interface RheostatResult {
  /** Rezistența porțiunii A–C, Ω */
  activeResistance: number;
  /** Rezistența porțiunii rămase, Ω */
  restResistance: number;
  /** Rezistența pe unitatea de lungime, Ω/m */
  perMeter: number;
  /** Curentul prin circuit (montaj serie), A */
  seriesCurrent: number;
  /** Tensiunea U_AC în montaj potențiometric, V */
  dividerVoltage: number;
  /** Tensiunea de alimentare efectivă a divizorului, V */
  busVoltage: number;
  /** Curentul prin divizor, A */
  dividerCurrent: number;
  /** Puterea disipată pe porțiunea activă, W */
  activePower: number;
}

export function computeRheostat(input: RheostatInput): RheostatResult {
  const emf = Math.max(0, input.emf);
  const wire = Math.max(1e-4, input.wireResistance);
  const length = Math.max(1e-4, input.wireLength);
  const cursor = clamp(input.cursorLength, 0, length);
  const perMeter = wire / length;
  const activeResistance = perMeter * cursor;
  const restResistance = Math.max(0, wire - activeResistance);
  const internal = Math.max(1e-4, input.internal);

  // Montaj serie: doar porțiunea A–C rămâne în circuit, deci
  // I = E / (r + R_AC + R_sarcină). Curentul scade când cursorul merge spre B.
  const seriesCurrent = emf / (internal + activeResistance + Math.max(0, input.load));

  // Montaj potențiometric: cursorul ia o fracțiune din tensiunea de pe fir.
  // Cu sarcină finită, sarcina se pune în paralel cu porțiunea A–C.
  const load = input.load;
  let dividerVoltage: number;
  let dividerCurrent: number;
  let busVoltage: number;

  if (!Number.isFinite(load)) {
    // Voltmetru ideal: divizor neîncărcat, curentul de pe fir este E/(r + R_fir).
    dividerCurrent = emf / (internal + wire);
    busVoltage = dividerCurrent * wire;
    dividerVoltage = dividerCurrent * activeResistance;
  } else {
    const parallel =
      activeResistance <= 0
        ? 0
        : (activeResistance * Math.max(0, load)) / (activeResistance + Math.max(0, load));
    const total = internal + restResistance + parallel;
    dividerCurrent = emf / Math.max(total, 1e-9);
    busVoltage = dividerCurrent * restResistance;
    dividerVoltage = dividerCurrent * parallel;
  }

  return {
    activeResistance,
    restResistance,
    perMeter,
    seriesCurrent,
    dividerVoltage,
    busVoltage,
    dividerCurrent,
    activePower: (dividerVoltage * dividerVoltage) / Math.max(activeResistance, 1e-9),
  };
}

/* -------------------------------------------------------------------------- */
/*                       MĂSURAREA REZISTENȚEI CU A/V                         */
/* -------------------------------------------------------------------------- */

export interface MeasurementInput {
  /** Rezistența de măsurat, Ω */
  target: number;
  /** Rezistența internă a voltmetrului, Ω */
  voltmeter: number;
  /** Rezistența internă a ampermetrului, Ω */
  ammeter: number;
  /** Tensiunea electromotoare a sursei de laborator, V */
  emf: number;
  /** Rezistența internă a sursei, Ω */
  internal: number;
  /** true = montaj amonte (ampermetru înaintea voltmetrului) */
  amonte: boolean;
}

export interface MeasurementResult {
  /** Valoarea citită pe voltmetru, V */
  voltmeterReading: number;
  /** Valoarea citită pe ampermetru, A */
  ammeterReading: number;
  /** R = U/I calculat din citiri, Ω */
  measured: number;
  /** Eroarea relativă față de valoarea reală */
  relativeError: number;
  /** Curentul real prin rezistor, A */
  trueCurrent: number;
  /** Tensiunea reală pe rezistor, V */
  trueVoltage: number;
  /** Puterea disipată pe rezistor, W */
  power: number;
}

/**
 * Convenția folosită pentru montajul potențiometric:
 *
 * Montaj AMONTE — ampermetrul este montat înaintea rezistorului, iar voltmetrul
 * măsoară tensiunea pe ansamblul (R + A). Curentul citit este exact curentul prin
 * R, dar tensiunea citită este prea mare:
 *     U/I = R + R_A   ⇒   R = U/I − R_A   (valoare supraevaluată)
 * Se folosește pentru rezistențe MARI, comparativ cu R_A.
 *
 * Montaj AVAL — voltmetrul este în paralel doar pe R, iar ampermetrul măsoară și
 * curentul voltmetrului. Tensiunea citită este corectă, curentul este prea mare:
 *     U/I = R·R_V/(R + R_V)   (valoare subevaluată)
 * Se folosește pentru rezistențe MICI, comparativ cu R_V.
 */
export function computeMeasurement(input: MeasurementInput): MeasurementResult {
  const target = Math.max(1e-6, input.target);
  const rv = Math.max(1, input.voltmeter);
  const ra = Math.max(0, input.ammeter);
  const emf = Math.max(0, input.emf);
  const internal = Math.max(1e-4, input.internal);

  let voltmeterReading: number;
  let ammeterReading: number;
  let trueCurrent: number;
  let trueVoltage: number;

  if (input.amonte) {
    // Sursă → (R serie cu A) în paralel cu V. Voltmetrul citește U_R + U_A.
    const branch = target + ra;
    const parallel = (branch * rv) / (branch + rv);
    const totalCurrent = emf / (internal + parallel);
    voltmeterReading = totalCurrent * parallel;
    ammeterReading = voltmeterReading / branch;
    trueCurrent = ammeterReading;
    trueVoltage = ammeterReading * target;
  } else {
    // Sursă → A serie cu (R în paralel cu V). Ampermetrul citește I_R + I_V.
    const parallel = (target * rv) / (target + rv);
    ammeterReading = emf / (internal + ra + parallel);
    voltmeterReading = ammeterReading * parallel;
    trueVoltage = voltmeterReading;
    trueCurrent = voltmeterReading / target;
  }

  const measured = voltmeterReading / Math.max(ammeterReading, 1e-12);
  return {
    voltmeterReading,
    ammeterReading,
    measured,
    relativeError: (measured - target) / target,
    trueCurrent,
    trueVoltage,
    power: trueVoltage * trueCurrent,
  };
}

/* -------------------------------------------------------------------------- */
/*                              SCĂRI PENTRU GRAFICE                          */
/* -------------------------------------------------------------------------- */

export function niceStep(range: number, targetTicks: number): number {
  if (!Number.isFinite(range) || range <= 0) return 1;
  const raw = range / Math.max(1, targetTicks);
  const exponent = Math.floor(Math.log10(raw));
  const base = Math.pow(10, exponent);
  const normalized = raw / base;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * base;
}

export function niceMax(value: number, targetTicks = 5): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const step = niceStep(value, targetTicks);
  return Math.ceil(value / step) * step;
}

/** Formatează un tick de grafic, cu virgulă zecimală. */
export function tickLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `${Math.round(value / 100) / 10}k`;
  if (abs >= 10) return String(Math.round(value));
  if (abs >= 1) return String(Math.round(value * 10) / 10).replace(".", ",");
  return String(Math.round(value * 100) / 100).replace(".", ",");
}
