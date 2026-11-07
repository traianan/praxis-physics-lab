const ELECTRON_CHARGE = 1602176634e-28;
const AVOGADRO = 602214076e15;
const REFERENCE_TEMPERATURE = 20;
const MATERIALS = [
  {
    id: "argint",
    name: "Argint",
    symbol: "Ag",
    family: "metal",
    rho20: 159e-10,
    alpha: 38e-4,
    density: 10490,
    molarMass: 0.10787,
    valence: 1,
    color: "#cfd6d9",
    use: "contacte electrice",
    note: "cel mai bun conductor metalic, dar scump"
  },
  {
    id: "cupru",
    name: "Cupru",
    symbol: "Cu",
    family: "metal",
    rho20: 168e-10,
    alpha: 393e-5,
    density: 8960,
    molarMass: 0.063546,
    valence: 1,
    color: "#c07a45",
    use: "instala\u021Bii \u0219i cabluri",
    note: "etalonul practic: \u03C1 \u2248 0,017 \u03A9\xB7mm\xB2/m"
  },
  {
    id: "aur",
    name: "Aur",
    symbol: "Au",
    family: "metal",
    rho20: 244e-10,
    alpha: 34e-4,
    density: 19300,
    molarMass: 0.19697,
    valence: 1,
    color: "#d8b25e",
    use: "conectori de precizie",
    note: "nu se oxideaz\u0103, de aceea se folose\u0219te la contacte"
  },
  {
    id: "aluminiu",
    name: "Aluminiu",
    symbol: "Al",
    family: "metal",
    rho20: 265e-10,
    alpha: 429e-5,
    density: 2700,
    molarMass: 0.026982,
    valence: 3,
    color: "#b9c3c8",
    use: "linii electrice aeriene",
    note: "rezistivitate mai mare, dar de trei ori mai u\u0219or"
  },
  {
    id: "wolfram",
    name: "Wolfram",
    symbol: "W",
    family: "metal",
    rho20: 56e-9,
    alpha: 45e-4,
    density: 19300,
    molarMass: 0.18384,
    valence: 4,
    color: "#8e959c",
    use: "filamente de bec",
    note: "suport\u0103 temperaturi foarte mari f\u0103r\u0103 s\u0103 se topeasc\u0103"
  },
  {
    id: "fier",
    name: "Fier",
    symbol: "Fe",
    family: "metal",
    rho20: 971e-10,
    alpha: 65e-4,
    density: 7870,
    molarMass: 0.055845,
    valence: 2,
    color: "#8a8079",
    use: "rezisten\u021Be de putere, \u0219ine",
    note: "se oxideaz\u0103 u\u0219or; \u03B1 relativ mare"
  },
  {
    id: "nichel",
    name: "Nichel",
    symbol: "Ni",
    family: "metal",
    rho20: 699e-10,
    alpha: 6e-3,
    density: 8908,
    molarMass: 0.058693,
    valence: 2,
    color: "#a8aca4",
    use: "straturi de protec\u021Bie",
    note: "rezistent la coroziune, adesea \xEEn aliaje"
  },
  {
    id: "constantan",
    name: "Constantan",
    symbol: "CuNi",
    family: "aliaj",
    rho20: 49e-8,
    alpha: 2e-5,
    density: 8900,
    molarMass: 0.06136,
    valence: 1.5,
    color: "#9a9a93",
    use: "rezisten\u021Be etalon, termocuple",
    note: "\u03C1 aproape independent de temperatur\u0103: \u03B1 \u2248 0,00002 K\u207B\xB9"
  },
  {
    id: "nicrom",
    name: "Nicrom",
    symbol: "NiCr",
    family: "aliaj",
    rho20: 11e-7,
    alpha: 4e-4,
    density: 8400,
    molarMass: 0.05735,
    valence: 2,
    color: "#8d8f8a",
    use: "rezisten\u021Be de \xEEnc\u0103lzire",
    note: "\u03C1 mare \u0219i rezist\u0103 la temperaturi \xEEnalte"
  },
  {
    id: "grafit",
    name: "Grafit",
    symbol: "C",
    family: "nemetal",
    rho20: 35e-6,
    alpha: -5e-4,
    density: 2260,
    molarMass: 0.012011,
    valence: 1,
    color: "#4a4c4e",
    use: "electrozi, min\u0103 de creion",
    note: "\u03B1 negativ: la \xEEnc\u0103lzire rezistivitatea scade"
  }
];
const MATERIAL_MAP = MATERIALS.reduce(
  (accumulator, material) => {
    accumulator[material.id] = material;
    return accumulator;
  },
  {}
);
const DEFAULT_INPUT = {
  materialId: "cupru",
  length: 1,
  area: areaFromDiameter(1),
  temperature: 20,
  current: 1
};
function areaFromDiameter(diameterMm) {
  const d = Math.max(diameterMm, 1e-4);
  return Math.PI * d * d / 4;
}
function diameterFromArea(areaMm2) {
  return Math.sqrt(4 * Math.max(areaMm2, 1e-6) / Math.PI);
}
function resistivityAt(material, temperature) {
  const factor = Math.max(
    0.15,
    1 + material.alpha * (temperature - REFERENCE_TEMPERATURE)
  );
  return material.rho20 * factor;
}
function computeWire(input) {
  const material = MATERIAL_MAP[input.materialId] ?? MATERIAL_MAP.cupru;
  const length = Math.max(input.length, 1e-3);
  const area = Math.max(input.area, 1e-4);
  const temperature = input.temperature;
  const rho = resistivityAt(material, temperature);
  const temperatureFactor = rho / material.rho20;
  const areaM2 = area * 1e-6;
  const resistance = rho * length / areaM2;
  const volume = areaM2 * length;
  const mass = material.density * volume;
  const electronDensity = material.valence * material.density * AVOGADRO / material.molarMass;
  const current = Math.max(0, input.current);
  const driftSpeed = current / (electronDensity * ELECTRON_CHARGE * areaM2);
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
    ohmPerKm: resistance / length * 1e3
  };
}
function heatLevel(currentDensity) {
  if (currentDensity <= 4) return "normal";
  if (currentDensity <= 8) return "warm";
  if (currentDensity <= 16) return "overload";
  return "critical";
}
const HEAT_LABEL = {
  normal: "regim normal",
  warm: "se \xEEnc\u0103lze\u0219te",
  overload: "suprasarcin\u0103",
  critical: "fir incandescent"
};
function compareMaterials(length, area, temperature = REFERENCE_TEMPERATURE) {
  const copper = MATERIAL_MAP.cupru;
  const copperRho = resistivityAt(copper, temperature);
  return MATERIALS.map((material) => {
    const rho = resistivityAt(material, temperature);
    const resistance = rho * length / (area * 1e-6);
    return {
      material,
      resistance,
      mass: material.density * length * area * 1e-6,
      areaRatio: rho / copperRho,
      massRatio: material.density * rho / (copper.density * copperRho),
      resistanceRatio: rho / copperRho
    };
  }).sort((a, b) => a.resistance - b.resistance);
}
function copperMassAtEqualResistance(length, area) {
  const copper = MATERIAL_MAP.cupru;
  return copper.density * length * area * 1e-6;
}
const WIRE_GAUGES = [
  { area: 0.5, label: "0,5 mm\xB2", maxCurrent: 10, usage: "instala\u021Bii de iluminat vechi" },
  { area: 0.75, label: "0,75 mm\xB2", maxCurrent: 13, usage: "prelungitoare, corpuri de iluminat" },
  { area: 1.5, label: "1,5 mm\xB2", maxCurrent: 16, usage: "circuite de iluminat" },
  { area: 2.5, label: "2,5 mm\xB2", maxCurrent: 20, usage: "priz\u0103 simpl\u0103, circuite de for\u021B\u0103" },
  { area: 4, label: "4 mm\xB2", maxCurrent: 25, usage: "ma\u0219in\u0103 de sp\u0103lat, boiler" },
  { area: 6, label: "6 mm\xB2", maxCurrent: 32, usage: "plite electrice, bran\u0219amente" }
];
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
  AVOGADRO,
  DEFAULT_INPUT,
  ELECTRON_CHARGE,
  HEAT_LABEL,
  MATERIALS,
  MATERIAL_MAP,
  REFERENCE_TEMPERATURE,
  WIRE_GAUGES,
  areaFromDiameter,
  clamp,
  compareMaterials,
  computeWire,
  copperMassAtEqualResistance,
  diameterFromArea,
  easeInOutCubic,
  heatLevel,
  lerp,
  resistivityAt
};
