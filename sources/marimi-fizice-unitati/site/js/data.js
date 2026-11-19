// Date de referință: prefixe SI, unități pentru convertor, mărimi derivate.

export const PREFIXES = [
  { s: 'p', n: 'pico', e: -12 },
  { s: 'n', n: 'nano', e: -9 },
  { s: 'µ', n: 'micro', e: -6 },
  { s: 'm', n: 'mili', e: -3 },
  { s: 'c', n: 'centi', e: -2 },
  { s: 'd', n: 'deci', e: -1 },
  { s: '', n: '(fără prefix)', e: 0 },
  { s: 'da', n: 'deca', e: 1 },
  { s: 'h', n: 'hecto', e: 2 },
  { s: 'k', n: 'kilo', e: 3 },
  { s: 'M', n: 'mega', e: 6 },
  { s: 'G', n: 'giga', e: 9 },
  { s: 'T', n: 'tera', e: 12 },
];

// f = factorul față de unitatea SI (valoare_SI = valoare · f)
export const QUANTITIES = [
  { id: 'lungime', name: 'Lungime', sym: 'ℓ', si: 'm', units: [
    { u: 'm', n: 'metru', f: 1 }, { u: 'km', n: 'kilometru', f: 1e3 }, { u: 'hm', n: 'hectometru', f: 100 },
    { u: 'dam', n: 'decametru', f: 10 }, { u: 'dm', n: 'decimetru', f: 0.1 }, { u: 'cm', n: 'centimetru', f: 0.01 },
    { u: 'mm', n: 'milimetru', f: 1e-3 }, { u: 'µm', n: 'micrometru', f: 1e-6 }, { u: 'nm', n: 'nanometru', f: 1e-9 },
    { u: 'in', n: 'țol (inch)', f: 0.0254 }, { u: 'ft', n: 'picior (foot)', f: 0.3048 }, { u: 'mi', n: 'milă terestră', f: 1609.344 },
    { u: 'NM', n: 'milă marină', f: 1852 }, { u: 'UA', n: 'unitate astronomică', f: 1.495978707e11 }, { u: 'a.l.', n: 'an-lumină', f: 9.4607304725808e15 },
  ], facts: [['1 km', '1000 m'], ['1 m', '100 cm'], ['1 in', '2,54 cm'], ['1 a.l.', '9,46·10¹⁵ m']] },

  { id: 'masa', name: 'Masă', sym: 'm', si: 'kg', units: [
    { u: 'kg', n: 'kilogram', f: 1 }, { u: 'g', n: 'gram', f: 1e-3 }, { u: 'mg', n: 'miligram', f: 1e-6 }, { u: 'µg', n: 'microgram', f: 1e-9 },
    { u: 't', n: 'tonă', f: 1e3 }, { u: 'q', n: 'chintal', f: 100 }, { u: 'dag', n: 'decagram', f: 1e-2 }, { u: 'hg', n: 'hectogram', f: 0.1 },
    { u: 'lb', n: 'livră (pound)', f: 0.45359237 }, { u: 'oz', n: 'uncie', f: 0.028349523125 },
  ], facts: [['1 t', '1000 kg'], ['1 q', '100 kg'], ['1 kg', '1000 g'], ['1 lb', '0,4536 kg']] },

  { id: 'timp', name: 'Timp', sym: 't', si: 's', units: [
    { u: 's', n: 'secundă', f: 1 }, { u: 'ms', n: 'milisecundă', f: 1e-3 }, { u: 'µs', n: 'microsecundă', f: 1e-6 },
    { u: 'min', n: 'minut', f: 60 }, { u: 'h', n: 'oră', f: 3600 }, { u: 'zi', n: 'zi', f: 86400 },
    { u: 'săpt', n: 'săptămână', f: 604800 }, { u: 'an', n: 'an (365,25 zile)', f: 31557600 },
  ], facts: [['1 h', '3600 s'], ['1 zi', '86 400 s'], ['1 min', '60 s'], ['1 an', '≈ 3,16·10⁷ s']] },

  { id: 'arie', name: 'Arie', sym: 'S', si: 'm²', units: [
    { u: 'm²', n: 'metru pătrat', f: 1 }, { u: 'km²', n: 'kilometru pătrat', f: 1e6 }, { u: 'ha', n: 'hectar', f: 1e4 },
    { u: 'ar', n: 'ar', f: 100 }, { u: 'dm²', n: 'decimetru pătrat', f: 1e-2 }, { u: 'cm²', n: 'centimetru pătrat', f: 1e-4 },
    { u: 'mm²', n: 'milimetru pătrat', f: 1e-6 },
  ], facts: [['1 ha', '10 000 m²'], ['1 ar', '100 m²'], ['1 cm²', '10⁻⁴ m²'], ['1 km²', '100 ha']] },

  { id: 'volum', name: 'Volum', sym: 'V', si: 'm³', units: [
    { u: 'm³', n: 'metru cub', f: 1 }, { u: 'dm³', n: 'decimetru cub', f: 1e-3 }, { u: 'cm³', n: 'centimetru cub', f: 1e-6 },
    { u: 'mm³', n: 'milimetru cub', f: 1e-9 }, { u: 'L', n: 'litru', f: 1e-3 }, { u: 'hL', n: 'hectolitru', f: 0.1 },
    { u: 'dL', n: 'decilitru', f: 1e-4 }, { u: 'mL', n: 'mililitru', f: 1e-6 },
  ], facts: [['1 L', '1 dm³'], ['1 mL', '1 cm³'], ['1 m³', '1000 L'], ['1 cm³', '10⁻⁶ m³']] },

  { id: 'viteza', name: 'Viteză', sym: 'v', si: 'm/s', units: [
    { u: 'm/s', n: 'metru pe secundă', f: 1 }, { u: 'km/h', n: 'kilometru pe oră', f: 1 / 3.6 }, { u: 'cm/s', n: 'centimetru pe secundă', f: 0.01 },
    { u: 'km/s', n: 'kilometru pe secundă', f: 1000 }, { u: 'm/min', n: 'metru pe minut', f: 1 / 60 },
    { u: 'nod', n: 'nod (milă marină/h)', f: 1852 / 3600 }, { u: 'mph', n: 'milă pe oră', f: 0.44704 },
  ], facts: [['1 m/s', '3,6 km/h'], ['36 km/h', '10 m/s'], ['72 km/h', '20 m/s'], ['1 nod', '1,852 km/h']] },

  { id: 'densitate', name: 'Densitate', sym: 'ρ', si: 'kg/m³', units: [
    { u: 'kg/m³', n: 'kilogram pe metru cub', f: 1 }, { u: 'g/cm³', n: 'gram pe centimetru cub', f: 1000 },
    { u: 'kg/dm³', n: 'kilogram pe decimetru cub', f: 1000 }, { u: 'g/L', n: 'gram pe litru', f: 1 }, { u: 'kg/L', n: 'kilogram pe litru', f: 1000 },
  ], facts: [['1 g/cm³', '1000 kg/m³'], ['ρ apă', '1000 kg/m³'], ['ρ fier', '7800 kg/m³'], ['ρ aer', '≈ 1,29 kg/m³']] },

  { id: 'forta', name: 'Forță', sym: 'F', si: 'N', units: [
    { u: 'N', n: 'newton', f: 1 }, { u: 'kN', n: 'kilonewton', f: 1e3 }, { u: 'mN', n: 'milinewton', f: 1e-3 },
    { u: 'MN', n: 'meganewton', f: 1e6 }, { u: 'dyn', n: 'dyna', f: 1e-5 }, { u: 'kgf', n: 'kilogram-forță', f: 9.80665 },
  ], facts: [['1 N', '1 kg·m/s²'], ['1 kgf', '9,81 N'], ['1 dyn', '10⁻⁵ N'], ['1 kN', '1000 N']] },

  { id: 'presiune', name: 'Presiune', sym: 'p', si: 'Pa', units: [
    { u: 'Pa', n: 'pascal', f: 1 }, { u: 'hPa', n: 'hectopascal', f: 100 }, { u: 'kPa', n: 'kilopascal', f: 1e3 },
    { u: 'MPa', n: 'megapascal', f: 1e6 }, { u: 'bar', n: 'bar', f: 1e5 }, { u: 'mbar', n: 'milibar', f: 100 },
    { u: 'atm', n: 'atmosferă fizică', f: 101325 }, { u: 'mmHg', n: 'milimetru coloană de mercur (torr)', f: 133.322387415 },
  ], facts: [['1 atm', '101 325 Pa'], ['1 atm', '760 mmHg'], ['1 bar', '10⁵ Pa'], ['1 hPa', '1 mbar']] },

  { id: 'energie', name: 'Energie', sym: 'E', si: 'J', units: [
    { u: 'J', n: 'joule', f: 1 }, { u: 'kJ', n: 'kilojoule', f: 1e3 }, { u: 'MJ', n: 'megajoule', f: 1e6 },
    { u: 'Wh', n: 'watt-oră', f: 3600 }, { u: 'kWh', n: 'kilowatt-oră', f: 3.6e6 }, { u: 'cal', n: 'calorie', f: 4.1868 },
    { u: 'kcal', n: 'kilocalorie', f: 4186.8 }, { u: 'eV', n: 'electronvolt', f: 1.602176634e-19 },
  ], facts: [['1 kWh', '3,6·10⁶ J'], ['1 cal', '4,1868 J'], ['1 kcal', '4186,8 J'], ['1 eV', '1,6·10⁻¹⁹ J']] },

  { id: 'putere', name: 'Putere', sym: 'P', si: 'W', units: [
    { u: 'W', n: 'watt', f: 1 }, { u: 'kW', n: 'kilowatt', f: 1e3 }, { u: 'MW', n: 'megawatt', f: 1e6 },
    { u: 'mW', n: 'miliwatt', f: 1e-3 }, { u: 'CP', n: 'cal-putere', f: 735.49875 },
  ], facts: [['1 CP', '≈ 735,5 W'], ['1 kW', '≈ 1,36 CP'], ['1 W', '1 J/s'], ['1 MW', '10⁶ W']] },

  { id: 'temperatura', name: 'Temperatură', sym: 'T', si: 'K', temp: true, units: [
    { u: 'K', n: 'kelvin' }, { u: '°C', n: 'grad Celsius' }, { u: '°F', n: 'grad Fahrenheit' },
  ], facts: [['0 °C', '273,15 K'], ['100 °C', '373,15 K'], ['0 K', '−273,15 °C'], ['37 °C', '98,6 °F']] },
];

export function tempToK(v, u) { return u === 'K' ? v : u === '°C' ? v + 273.15 : (v - 32) * 5 / 9 + 273.15; }
export function tempFromK(k, u) { return u === 'K' ? k : u === '°C' ? k - 273.15 : (k - 273.15) * 9 / 5 + 32; }

// Exponenți față de [m, kg, s, A, K, mol, cd]
export const BASE = [
  { s: 'm', n: 'metru', q: 'lungime' },
  { s: 'kg', n: 'kilogram', q: 'masă' },
  { s: 's', n: 'secundă', q: 'timp' },
  { s: 'A', n: 'amper', q: 'curent electric' },
  { s: 'K', n: 'kelvin', q: 'temperatură' },
  { s: 'mol', n: 'mol', q: 'cant. de substanță' },
  { s: 'cd', n: 'candelă', q: 'intens. luminoasă' },
];

export const DERIVED = [
  { q: 'Arie', f: 'S = ℓ · L', u: 'm²', un: 'metru pătrat', d: [2, 0, 0, 0, 0, 0, 0], hint: 'Înmulțești două lungimi.' },
  { q: 'Volum', f: 'V = ℓ · L · h', u: 'm³', un: 'metru cub', d: [3, 0, 0, 0, 0, 0, 0], hint: 'Înmulțești trei lungimi.' },
  { q: 'Viteză', f: 'v = d / t', u: 'm/s', un: 'metru pe secundă', d: [1, 0, -1, 0, 0, 0, 0], hint: 'O lungime împărțită la un timp.' },
  { q: 'Accelerație', f: 'a = Δv / Δt', u: 'm/s²', un: 'metru pe secundă la pătrat', d: [1, 0, -2, 0, 0, 0, 0], hint: 'Viteza (m/s) împărțită încă o dată la timp.' },
  { q: 'Densitate', f: 'ρ = m / V', u: 'kg/m³', un: 'kilogram pe metru cub', d: [-3, 1, 0, 0, 0, 0, 0], hint: 'Masa împărțită la volum (m³).' },
  { q: 'Forță', f: 'F = m · a', u: 'N', un: 'newton', d: [1, 1, -2, 0, 0, 0, 0], hint: 'kg înmulțit cu unitatea accelerației.' },
  { q: 'Greutate', f: 'G = m · g', u: 'N', un: 'newton', d: [1, 1, -2, 0, 0, 0, 0], hint: 'Greutatea este o forță: kg · m/s².' },
  { q: 'Presiune', f: 'p = F / S', u: 'Pa', un: 'pascal', d: [-1, 1, -2, 0, 0, 0, 0], hint: 'Newtonul împărțit la m².' },
  { q: 'Lucru mecanic', f: 'L = F · d', u: 'J', un: 'joule', d: [2, 1, -2, 0, 0, 0, 0], hint: 'Newtonul înmulțit cu metrul.' },
  { q: 'Energie cinetică', f: 'Ec = m·v² / 2', u: 'J', un: 'joule', d: [2, 1, -2, 0, 0, 0, 0], hint: 'kg înmulțit cu (m/s)².' },
  { q: 'Putere', f: 'P = L / t', u: 'W', un: 'watt', d: [2, 1, -3, 0, 0, 0, 0], hint: 'Joule împărțit la secundă.' },
  { q: 'Impuls', f: 'p = m · v', u: 'kg·m/s', un: 'kilogram-metru pe secundă', d: [1, 1, -1, 0, 0, 0, 0], hint: 'Masa înmulțită cu viteza.' },
  { q: 'Frecvență', f: 'ν = N / t', u: 'Hz', un: 'hertz', d: [0, 0, -1, 0, 0, 0, 0], hint: 'Numărul N nu are unitate; rămâne 1/s.' },
  { q: 'Sarcină electrică', f: 'q = I · t', u: 'C', un: 'coulomb', d: [0, 0, 1, 1, 0, 0, 0], hint: 'Amper înmulțit cu secundă.' },
  { q: 'Tensiune electrică', f: 'U = P / I', u: 'V', un: 'volt', d: [2, 1, -3, -1, 0, 0, 0], hint: 'Watt împărțit la amper.' },
  { q: 'Rezistență electrică', f: 'R = U / I', u: 'Ω', un: 'ohm', d: [2, 1, -3, -2, 0, 0, 0], hint: 'Volt împărțit la amper.' },
  { q: 'Concentrație molară', f: 'c = ν / V', u: 'mol/m³', un: 'mol pe metru cub', d: [-3, 0, 0, 0, 0, 1, 0], hint: 'Moli împărțiți la volum.' },
];

// Bibliotecă (dialog) — construită din datele de mai sus + câteva completări
export const LIBRARY = [
  ...BASE.map(b => ({ s: b.s, n: b.n, d: `Unitate fundamentală SI — ${b.q}` })),
  { s: 'N', n: 'newton', d: 'Forță — 1 N = 1 kg·m/s²' },
  { s: 'Pa', n: 'pascal', d: 'Presiune — 1 Pa = 1 N/m²' },
  { s: 'J', n: 'joule', d: 'Lucru mecanic, energie, căldură — 1 J = 1 N·m' },
  { s: 'W', n: 'watt', d: 'Putere — 1 W = 1 J/s' },
  { s: 'Hz', n: 'hertz', d: 'Frecvență — 1 Hz = 1 s⁻¹' },
  { s: 'C', n: 'coulomb', d: 'Sarcină electrică — 1 C = 1 A·s' },
  { s: 'V', n: 'volt', d: 'Tensiune electrică — 1 V = 1 W/A' },
  { s: 'Ω', n: 'ohm', d: 'Rezistență electrică — 1 Ω = 1 V/A' },
  { s: 'L', n: 'litru', d: 'Volum (acceptat în SI) — 1 L = 1 dm³ = 10⁻³ m³' },
  { s: 't', n: 'tonă', d: 'Masă (acceptată în SI) — 1 t = 1000 kg' },
  { s: 'ha', n: 'hectar', d: 'Arie — 1 ha = 10 000 m²' },
  { s: 'h', n: 'oră', d: 'Timp (acceptată în SI) — 1 h = 3600 s' },
  { s: '°C', n: 'grad Celsius', d: 'Temperatură — T(K) = t(°C) + 273,15' },
  { s: 'kWh', n: 'kilowatt-oră', d: 'Energie (facturi) — 1 kWh = 3,6·10⁶ J' },
  { s: 'atm', n: 'atmosferă', d: 'Presiune — 1 atm = 101 325 Pa = 760 mmHg' },
  { s: 'km/h', n: 'kilometru pe oră', d: 'Viteză — 1 km/h = 1/3,6 m/s' },
  { s: 'a.l.', n: 'an-lumină', d: 'Lungime (astronomie) — distanța parcursă de lumină într-un an ≈ 9,46·10¹⁵ m' },
  { s: 'UA', n: 'unitate astronomică', d: 'Lungime — distanța medie Pământ–Soare ≈ 1,496·10¹¹ m' },
  { s: 'cal', n: 'calorie', d: 'Energie (nutriție) — 1 cal = 4,1868 J' },
  { s: 'CP', n: 'cal-putere', d: 'Putere (motoare) — 1 CP ≈ 735,5 W' },
];
