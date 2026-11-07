/**
 * Modelul fizic pentru rezistența unui fir conductor.
 *
 * Mărimile de intrare sunt în unități de laborator (metri, mm², °C, amperi),
 * iar calculul se face în SI, astfel încât fiecare conversie să existe într-un
 * singur loc. Valorile de rezistivitate sunt orientative, la 20 °C.
 */

export const ELECTRON_CHARGE = 1.602176634e-19;
export const AVOGADRO = 6.02214076e23;
export const REFERENCE_TEMPERATURE = 20;

export type MaterialId =
  | "argint"
  | "cupru"
  | "aur"
  | "aluminiu"
  | "wolfram"
  | "fier"
  | "nichel"
  | "constantan"
  | "nicrom"
  | "grafit";

export interface Material {
  id: MaterialId;
  name: string;
  symbol: string;
  family: "metal" | "aliaj" | "nemetal";
  /** Rezistivitatea la 20 °C, în Ω·m. */
  rho20: number;
  /** Coeficientul de temperatură, în K⁻¹. */
  alpha: number;
  /** Densitatea, în kg/m³. */
  density: number;
  /** Masa molară, în kg/mol (valoare medie pentru aliaje). */
  molarMass: number;
  /** Electroni de conducție aproximativi pe atom. */
  valence: number;
  /** Culoarea firului în desen. */
  color: string;
  /** Întrebuințare tipică. */
  use: string;
  note: string;
}

export const MATERIALS: Material[] = [
  {
    id: "argint",
    name: "Argint",
    symbol: "Ag",
    family: "metal",
    rho20: 1.59e-8,
    alpha: 0.0038,
    density: 10490,
    molarMass: 0.10787,
    valence: 1,
    color: "#cfd6d9",
    use: "contacte electrice",
    note: "cel mai bun conductor metalic, dar scump",
  },
  {
    id: "cupru",
    name: "Cupru",
    symbol: "Cu",
    family: "metal",
    rho20: 1.68e-8,
    alpha: 0.00393,
    density: 8960,
    molarMass: 0.063546,
    valence: 1,
    color: "#c07a45",
    use: "instalații și cabluri",
    note: "etalonul practic: ρ ≈ 0,017 Ω·mm²/m",
  },
  {
    id: "aur",
    name: "Aur",
    symbol: "Au",
    family: "metal",
    rho20: 2.44e-8,
    alpha: 0.0034,
    density: 19300,
    molarMass: 0.19697,
    valence: 1,
    color: "#d8b25e",
    use: "conectori de precizie",
    note: "nu se oxidează, de aceea se folosește la contacte",
  },
  {
    id: "aluminiu",
    name: "Aluminiu",
    symbol: "Al",
    family: "metal",
    rho20: 2.65e-8,
    alpha: 0.00429,
    density: 2700,
    molarMass: 0.026982,
    valence: 3,
    color: "#b9c3c8",
    use: "linii electrice aeriene",
    note: "rezistivitate mai mare, dar de trei ori mai ușor",
  },
  {
    id: "wolfram",
    name: "Wolfram",
    symbol: "W",
    family: "metal",
    rho20: 5.6e-8,
    alpha: 0.0045,
    density: 19300,
    molarMass: 0.18384,
    valence: 4,
    color: "#8e959c",
    use: "filamente de bec",
    note: "suportă temperaturi foarte mari fără să se topească",
  },
  {
    id: "fier",
    name: "Fier",
    symbol: "Fe",
    family: "metal",
    rho20: 9.71e-8,
    alpha: 0.0065,
    density: 7870,
    molarMass: 0.055845,
    valence: 2,
    color: "#8a8079",
    use: "rezistențe de putere, șine",
    note: "se oxidează ușor; α relativ mare",
  },
  {
    id: "nichel",
    name: "Nichel",
    symbol: "Ni",
    family: "metal",
    rho20: 6.99e-8,
    alpha: 0.006,
    density: 8908,
    molarMass: 0.058693,
    valence: 2,
    color: "#a8aca4",
    use: "straturi de protecție",
    note: "rezistent la coroziune, adesea în aliaje",
  },
  {
    id: "constantan",
    name: "Constantan",
    symbol: "CuNi",
    family: "aliaj",
    rho20: 4.9e-7,
    alpha: 0.00002,
    density: 8900,
    molarMass: 0.06136,
    valence: 1.5,
    color: "#9a9a93",
    use: "rezistențe etalon, termocuple",
    note: "ρ aproape independent de temperatură: α ≈ 0,00002 K⁻¹",
  },
  {
    id: "nicrom",
    name: "Nicrom",
    symbol: "NiCr",
    family: "aliaj",
    rho20: 1.1e-6,
    alpha: 0.0004,
    density: 8400,
    molarMass: 0.05735,
    valence: 2,
    color: "#8d8f8a",
    use: "rezistențe de încălzire",
    note: "ρ mare și rezistă la temperaturi înalte",
  },
  {
    id: "grafit",
    name: "Grafit",
    symbol: "C",
    family: "nemetal",
    rho20: 3.5e-5,
    alpha: -0.0005,
    density: 2260,
    molarMass: 0.012011,
    valence: 1,
    color: "#4a4c4e",
    use: "electrozi, mină de creion",
    note: "α negativ: la încălzire rezistivitatea scade",
  },
];

export const MATERIAL_MAP: Record<MaterialId, Material> = MATERIALS.reduce(
  (accumulator, material) => {
    accumulator[material.id] = material;
    return accumulator;
  },
  {} as Record<MaterialId, Material>,
);

export interface WireInput {
  materialId: MaterialId;
  /** Lungimea, în metri. */
  length: number;
  /** Aria secțiunii transversale, în mm². */
  area: number;
  /** Temperatura conductorului, în °C. */
  temperature: number;
  /** Intensitatea curentului, în amperi. */
  current: number;
}

export interface WireResult {
  material: Material;
  length: number;
  area: number;
  diameter: number;
  temperature: number;
  rho20: number;
  rho: number;
  alpha: number;
  temperatureFactor: number;
  resistance: number;
  conductance: number;
  volume: number;
  mass: number;
  current: number;
  voltage: number;
  power: number;
  currentDensity: number;
  electronDensity: number;
  driftSpeed: number;
  /** Ω pe kilometru — util pentru cabluri. */
  ohmPerKm: number;
}

export const DEFAULT_INPUT: WireInput = {
  materialId: "cupru",
  length: 1,
  area: areaFromDiameter(1),
  temperature: 20,
  current: 1,
};

export function areaFromDiameter(diameterMm: number): number {
  const d = Math.max(diameterMm, 1e-4);
  return (Math.PI * d * d) / 4;
}

export function diameterFromArea(areaMm2: number): number {
  return Math.sqrt((4 * Math.max(areaMm2, 1e-6)) / Math.PI);
}

/** Rezistivitatea la temperatura t, în Ω·m. */
export function resistivityAt(material: Material, temperature: number): number {
  const factor = Math.max(
    0.15,
    1 + material.alpha * (temperature - REFERENCE_TEMPERATURE),
  );
  return material.rho20 * factor;
}

export function computeWire(input: WireInput): WireResult {
  const material = MATERIAL_MAP[input.materialId] ?? MATERIAL_MAP.cupru;
  const length = Math.max(input.length, 1e-3);
  const area = Math.max(input.area, 1e-4);
  const temperature = input.temperature;
  const rho = resistivityAt(material, temperature);
  const temperatureFactor = rho / material.rho20;

  const areaM2 = area * 1e-6;
  const resistance = (rho * length) / areaM2;
  const volume = areaM2 * length;
  const mass = material.density * volume;

  const electronDensity =
    (material.valence * material.density * AVOGADRO) / material.molarMass;
  const current = Math.max(0, input.current);
  const driftSpeed =
    current / (electronDensity * ELECTRON_CHARGE * areaM2);

  return {
    material,
    length,
    area,
    diameter: diameterFromArea(area),
    temperature,
    rho20: material.rho20,
    rho,
    alpha: material.alpha,
    temperatureFactor,
    resistance,
    conductance: resistance > 0 ? 1 / resistance : 0,
    volume,
    mass,
    current,
    voltage: current * resistance,
    power: current * current * resistance,
    currentDensity: current / area,
    electronDensity,
    driftSpeed,
    ohmPerKm: resistance * 1000,
  };
}

export type HeatLevel = "normal" | "warm" | "overload" | "critical";

/**
 * Regim termic orientativ după densitatea de curent. Pragurile sunt didactice,
 * pentru fire de laborator în aer; ele nu înlocuiesc datele producătorului.
 */
export function heatLevel(currentDensity: number): HeatLevel {
  if (currentDensity <= 4) return "normal";
  if (currentDensity <= 8) return "warm";
  if (currentDensity <= 16) return "overload";
  return "critical";
}

export const HEAT_LABEL: Record<HeatLevel, string> = {
  normal: "regim normal",
  warm: "se încălzește",
  overload: "suprasarcină",
  critical: "fir incandescent",
};

export interface MaterialComparison {
  material: Material;
  resistance: number;
  mass: number;
  /** Raportul ariei necesare pentru aceeași rezistență, față de cupru. */
  areaRatio: number;
  /** Raportul masei la aceeași rezistență, față de cupru. */
  massRatio: number;
  /** Rezistența raportată la cea a cuprului, la aceeași geometrie. */
  resistanceRatio: number;
}

/**
 * Aceeași lungime și aceeași secțiune pentru toate materialele. Pentru
 * comparația „aceeași rezistență”, masele se raportează la cupru prin
 * produsul densitate × rezistivitate.
 */
export function compareMaterials(
  length: number,
  area: number,
  temperature = REFERENCE_TEMPERATURE,
): MaterialComparison[] {
  const copper = MATERIAL_MAP.cupru;
  const copperRho = resistivityAt(copper, temperature);

  return MATERIALS.map((material) => {
    const rho = resistivityAt(material, temperature);
    const resistance = (rho * length) / (area * 1e-6);
    return {
      material,
      resistance,
      mass: material.density * length * area * 1e-6,
      areaRatio: rho / copperRho,
      massRatio:
        (material.density * rho) / (copper.density * copperRho),
      resistanceRatio: rho / copperRho,
    };
  }).sort((a, b) => a.resistance - b.resistance);
}

/** Masă raportată la cupru dacă firul ar avea aceeași rezistență și lungime. */
export function copperMassAtEqualResistance(length: number, area: number): number {
  const copper = MATERIAL_MAP.cupru;
  return copper.density * length * area * 1e-6;
}

export interface GaugeRow {
  area: number;
  label: string;
  maxCurrent: number;
  usage: string;
}

/** Secțiuni uzuale la instalații electrice de 230 V (cupru, orientativ). */
export const WIRE_GAUGES: GaugeRow[] = [
  { area: 0.5, label: "0,5 mm²", maxCurrent: 10, usage: "instalații de iluminat vechi" },
  { area: 0.75, label: "0,75 mm²", maxCurrent: 13, usage: "prelungitoare, corpuri de iluminat" },
  { area: 1.5, label: "1,5 mm²", maxCurrent: 16, usage: "circuite de iluminat" },
  { area: 2.5, label: "2,5 mm²", maxCurrent: 20, usage: "priză simplă, circuite de forță" },
  { area: 4, label: "4 mm²", maxCurrent: 25, usage: "mașină de spălat, boiler" },
  { area: 6, label: "6 mm²", maxCurrent: 32, usage: "plite electrice, branșamente" },
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
