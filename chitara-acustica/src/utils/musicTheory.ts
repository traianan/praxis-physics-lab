import {
  ChordQualityId,
  Mission,
  Note,
  NotationSystem,
  ScaleId,
  StringState,
  TuningId,
  TuningPreset,
} from '../types/guitar';

export const ANGLO_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const SOLFEGE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'] as const;

export const ROMAN_DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

export const DEGREE_NAMES_RO = [
  'Tonică',
  'Supratonică',
  'Mediantă',
  'Subdominantă',
  'Dominantă',
  'Submediantă',
  'Sensibilă / Subtonică',
] as const;

export function midiToFrequency(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidiFloat(frequency: number, a4 = 440): number {
  return 69 + 12 * Math.log2(frequency / a4);
}

export function frequencyToNote(frequency: number, a4 = 440): Note {
  const safeFreq = Math.max(20, Math.min(20000, frequency));
  const midiFloat = frequencyToMidiFloat(safeFreq, a4);
  const nearest = Math.round(midiFloat);
  const cents = (midiFloat - nearest) * 100;
  const pitchClass = ((nearest % 12) + 12) % 12;
  const octave = Math.floor(nearest / 12) - 1;

  return {
    name: ANGLO_NAMES[pitchClass],
    solfege: SOLFEGE_NAMES[pitchClass],
    octave,
    midi: nearest,
    frequency: safeFreq,
    cents,
  };
}

export function formatNoteName(pitchClass: number, notation: NotationSystem): string {
  const idx = ((pitchClass % 12) + 12) % 12;
  return notation === 'anglo' ? ANGLO_NAMES[idx] : SOLFEGE_NAMES[idx];
}

export function formatMidiLabel(midi: number, notation: NotationSystem): string {
  const idx = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${formatNoteName(idx, notation)}${octave}`;
}

export function centsDifference(f1: number, f2: number): number {
  if (f1 <= 0 || f2 <= 0) return 0;
  return 1200 * Math.log2(f2 / f1);
}

/**
 * Physical fundamental frequency of a vibrating string fixed at both ends:
 * f1 = (1 / (2L)) * sqrt(T / mu)
 */
export function stringFundamentalFrequency(lengthMeters: number, tensionNewtons: number, linearDensityKgPerM: number): number {
  if (lengthMeters <= 0 || tensionNewtons <= 0 || linearDensityKgPerM <= 0) return 0;
  return (1 / (2 * lengthMeters)) * Math.sqrt(tensionNewtons / linearDensityKgPerM);
}

export function getFretFrequency(openFrequency: number, fret: number): number {
  return openFrequency * Math.pow(2, fret / 12);
}

export function getEffectiveFretLength(scaleLengthMeters: number, fret: number): number {
  return scaleLengthMeters * Math.pow(2, -fret / 12);
}

/**
 * Pluck position harmonic amplitude distribution:
 * A_n proportional to |sin(n * pi * p)| / n^2
 */
export function harmonicAmplitudes(pickPosition: number, harmonicCount = 8): number[] {
  const amps: number[] = [];
  for (let n = 1; n <= harmonicCount; n++) {
    const val = Math.abs(Math.sin(n * Math.PI * pickPosition)) / (n * n);
    amps.push(val);
  }
  const max = Math.max(...amps, 0.0001);
  return amps.map((a) => Number((a / max).toFixed(3)));
}

export const TUNING_PRESETS: Record<TuningId, TuningPreset> = {
  standard: {
    id: 'standard',
    name: 'Standard (E–A–D–G–B–E)',
    description: 'Acordaj clasic de chitară acustică: Mi2, La2, Re3, Sol3, Si3, Mi4.',
    // Ordered string 1 (high E4) -> string 6 (low E2) for top-to-bottom fretboard display
    openMidis: [64, 59, 55, 50, 45, 40],
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D (D–A–D–G–B–E)',
    description: 'Coarda 6 este coborâtă cu un ton la Re2 (73,42 Hz) pentru bași profunzi.',
    openMidis: [64, 59, 55, 50, 45, 38],
  },
  openG: {
    id: 'openG',
    name: 'Open G (D–G–D–G–B–D)',
    description: 'Corzile libere formează un acord Sol major (G) fără a apăsa freturi.',
    openMidis: [62, 59, 55, 50, 43, 38],
  },
  dadgad: {
    id: 'dadgad',
    name: 'DADGAD (Modal Dsus4)',
    description: 'Acordaj celtic/modal bazat pe cvinte și cvarte perfecte.',
    openMidis: [62, 57, 55, 50, 45, 38],
  },
};

// Realistic acoustic string physical properties for standard scale length L = 0.65m
// mu (kg/m) and tension T (N) calibrated so f1 = (1/(2L))*sqrt(T/mu) matches standard MIDI pitch
const BASE_STRING_SPECS = [
  { id: 1, gaugeMm: 0.3, linearDensityGPerM: 0.56 },
  { id: 2, gaugeMm: 0.41, linearDensityGPerM: 1.02 },
  { id: 3, gaugeMm: 0.61, linearDensityGPerM: 1.82 },
  { id: 4, gaugeMm: 0.81, linearDensityGPerM: 3.18 },
  { id: 5, gaugeMm: 1.07, linearDensityGPerM: 5.55 },
  { id: 6, gaugeMm: 1.35, linearDensityGPerM: 8.6 },
];

export function buildStringsForTuning(tuning: TuningId): StringState[] {
  const preset = TUNING_PRESETS[tuning];
  const L = 0.65; // 650 mm standard classical/acoustic scale length
  return preset.openMidis.map((midi, idx) => {
    const spec = BASE_STRING_SPECS[idx];
    const openFrequency = midiToFrequency(midi);
    const mu = spec.linearDensityGPerM / 1000; // kg/m
    // T = (2 * L * f1)^2 * mu
    const tension = Math.pow(2 * L * openFrequency, 2) * mu;

    return {
      id: spec.id,
      label: `Coarda ${spec.id}`,
      openMidi: midi,
      openFrequency,
      length: L,
      tension: Number(tension.toFixed(1)),
      linearDensity: mu,
      gaugeMm: spec.gaugeMm,
      fret: 0,
      harmonics: [1, 0.52, 0.31, 0.19, 0.12, 0.08, 0.05, 0.03],
    };
  });
}

export function getGuitarPositionsForPitchClass(
  pitchClass: number,
  strings: StringState[],
  maxFret = 15,
  exactMidi?: number
): Array<{ stringId: number; fret: number; midi: number; frequency: number }> {
  const results: Array<{ stringId: number; fret: number; midi: number; frequency: number }> = [];
  for (const s of strings) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const midi = s.openMidi + fret;
      const matches = exactMidi !== undefined ? midi === exactMidi : ((midi % 12) + 12) % 12 === pitchClass;
      if (matches) {
        results.push({
          stringId: s.id,
          fret,
          midi,
          frequency: midiToFrequency(midi),
        });
      }
    }
  }
  return results;
}

export type ScaleDefinition = {
  id: ScaleId;
  name: string;
  intervals: number[]; // semitones from root
  stepFormula: string;
  diatonicQualities: string[];
  description: string;
};

export const SCALES: Record<ScaleId, ScaleDefinition> = {
  major: {
    id: 'major',
    name: 'Gamă majoră (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    stepFormula: 'T – T – ½ – T – T – T – ½',
    diatonicQualities: ['Maj', 'min', 'min', 'Maj', 'Maj', 'min', 'dim'],
    description: 'Structura de bază a muzicii tonale occidentale, luminoasă și stabilă.',
  },
  minor_natural: {
    id: 'minor_natural',
    name: 'Gamă minoră naturală (Eolian)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    stepFormula: 'T – ½ – T – T – ½ – T – T',
    diatonicQualities: ['min', 'dim', 'Maj', 'min', 'min', 'Maj', 'Maj'],
    description: 'Caracter melancolic și introspectiv, cu terță, sextă și septimă mici.',
  },
  minor_harmonic: {
    id: 'minor_harmonic',
    name: 'Gamă minoră armonică',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    stepFormula: 'T – ½ – T – T – ½ – 1½ – ½',
    diatonicQualities: ['min', 'dim', 'aug', 'min', 'Maj', 'Maj', 'dim'],
    description: 'Ridică treapta a VII-a cu un semiton pentru a crea o sensibilă puternică spre tonică.',
  },
  pentatonic_major: {
    id: 'pentatonic_major',
    name: 'Pentatonică majoră',
    intervals: [0, 2, 4, 7, 9],
    stepFormula: 'T – T – 1½ – T – 1½',
    diatonicQualities: ['Maj', 'min', 'min', 'Maj', 'min'],
    description: 'Scară de 5 note fără semitonoane, foarte folosită în folk și improvizație.',
  },
  pentatonic_minor: {
    id: 'pentatonic_minor',
    name: 'Pentatonică minoră',
    intervals: [0, 3, 5, 7, 10],
    stepFormula: '1½ – T – T – 1½ – T',
    diatonicQualities: ['min', 'Maj', 'min', 'min', 'Maj'],
    description: 'Cea mai populară scară pentru solouri de chitară rock, blues și pop.',
  },
  blues: {
    id: 'blues',
    name: 'Gamă Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    stepFormula: '1½ – T – ½ – ½ – 1½ – T',
    diatonicQualities: ['min7', 'Maj', 'min', 'dim', 'min', 'Maj'],
    description: 'Adaugă „nota blues” (cvarta mărită / cvinta micșorată) la pentatonica minoră.',
  },
};

export type ChordDefinition = {
  id: ChordQualityId;
  name: string;
  symbol: string;
  intervals: number[];
  intervalNames: string[];
  consonanceNote: string;
};

export const CHORDS: Record<ChordQualityId, ChordDefinition> = {
  major: {
    id: 'major',
    name: 'Acord Major',
    symbol: '',
    intervals: [0, 4, 7],
    intervalNames: ['Fundamentă (1)', 'Terță mare (3M)', 'Quintă perfectă (5P)'],
    consonanceNote: 'Consonanță puternică: raport ideal ~ 4 : 5 : 6.',
  },
  minor: {
    id: 'minor',
    name: 'Acord Minor',
    symbol: 'm',
    intervals: [0, 3, 7],
    intervalNames: ['Fundamentă (1)', 'Terță mică (3m)', 'Quintă perfectă (5P)'],
    consonanceNote: 'Consonanță blândă, expresivă: raport ideal ~ 10 : 12 : 15.',
  },
  dom7: {
    id: 'dom7',
    name: 'Septimă de dominantă (7)',
    symbol: '7',
    intervals: [0, 4, 7, 10],
    intervalNames: ['Fundamentă (1)', 'Terță mare (3M)', 'Quintă perfectă (5P)', 'Septimă mică (7m)'],
    consonanceNote: 'Tensiune armonică între 3M și 7m (triton) care cere rezolvare.',
  },
  maj7: {
    id: 'maj7',
    name: 'Septimă mare (maj7)',
    symbol: 'maj7',
    intervals: [0, 4, 7, 11],
    intervalNames: ['Fundamentă (1)', 'Terță mare (3M)', 'Quintă perfectă (5P)', 'Septimă mare (7M)'],
    consonanceNote: 'Sonoritate caldă de jazz, cu armonice apropiate între 7M și octavă.',
  },
  min7: {
    id: 'min7',
    name: 'Minor 7 (m7)',
    symbol: 'm7',
    intervals: [0, 3, 7, 10],
    intervalNames: ['Fundamentă (1)', 'Terță mică (3m)', 'Quintă perfectă (5P)', 'Septimă mică (7m)'],
    consonanceNote: 'Echilibru stabil, catifelat, format din două terțe suprapuse.',
  },
  sus2: {
    id: 'sus2',
    name: 'Suspendat 2 (sus2)',
    symbol: 'sus2',
    intervals: [0, 2, 7],
    intervalNames: ['Fundamentă (1)', 'Secundă mare (2M)', 'Quintă perfectă (5P)'],
    consonanceNote: 'Fără terță: sunet deschis, aerisit, bogat în cvinte.',
  },
  sus4: {
    id: 'sus4',
    name: 'Suspendat 4 (sus4)',
    symbol: 'sus4',
    intervals: [0, 5, 7],
    intervalNames: ['Fundamentă (1)', 'Cuartă perfectă (4P)', 'Quintă perfectă (5P)'],
    consonanceNote: 'Tensiune între 4P și 5P care tinde să se rezolve spre terța mare.',
  },
  dim: {
    id: 'dim',
    name: 'Diminuat (dim)',
    symbol: 'dim',
    intervals: [0, 3, 6],
    intervalNames: ['Fundamentă (1)', 'Terță mică (3m)', 'Quintă micșorată (5d)'],
    consonanceNote: 'Disonanță pronunțată datorată tritonului (raport √2 ≈ 1,414).',
  },
};

export const HARMONIC_DESCRIPTIONS = [
  { n: 1, ratio: 'f₀', interval: 'Fundamentală', shape: '1 ventru central (0 noduri interioare)' },
  { n: 2, ratio: '2f₀', interval: 'Octavă', shape: '2 ventruri · 1 nod la mijloc (L/2)' },
  { n: 3, ratio: '3f₀', interval: 'Octavă + quintă', shape: '3 ventruri · 2 noduri (L/3, 2L/3)' },
  { n: 4, ratio: '4f₀', interval: 'Două octave', shape: '4 ventruri · 3 noduri (L/4, L/2, 3L/4)' },
  { n: 5, ratio: '5f₀', interval: 'Două octave + terță mare', shape: '5 ventruri · 4 noduri' },
  { n: 6, ratio: '6f₀', interval: 'Două octave + quintă', shape: '6 ventruri · 5 noduri' },
  { n: 7, ratio: '7f₀', interval: 'Două octave + septimă armonică', shape: '7 ventruri · 6 noduri' },
  { n: 8, ratio: '8f₀', interval: 'Trei octave', shape: '8 ventruri · 7 noduri' },
];

export const JUST_INTONATION_RATIOS = [
  { id: 'octave', name: 'Octavă pură', num: 2, den: 1, semitones: 12 },
  { id: 'fifth', name: 'Quintă pură', num: 3, den: 2, semitones: 7 },
  { id: 'fourth', name: 'Cuartă pură', num: 4, den: 3, semitones: 5 },
  { id: 'maj_third', name: 'Terță mare pură', num: 5, den: 4, semitones: 4 },
  { id: 'min_third', name: 'Terță mică pură', num: 6, den: 5, semitones: 3 },
  { id: 'harm_seventh', name: 'Septimă armonică', num: 7, den: 4, semitones: 10 },
  { id: 'maj_second', name: 'Secundă mare (ton pur)', num: 9, den: 8, semitones: 2 },
] as const;

export const GUIDED_MISSIONS: Mission[] = [
  {
    id: 'm1_a4_string1',
    title: '1. Găsește A4 (440 Hz) pe coarda 1',
    description: 'În Modul Coarda chitarei sau Laborator liber, apasă fretul potrivit pe coarda 1 (Mi4) și ciupește-o pentru a obține 440 Hz.',
    targetModule: 'string',
    hint: 'Coarda 1 liberă este E4 (329,63 Hz). Fiecare fret urcă un semiton: E → F → F# → G → G# → A.',
  },
  {
    id: 'm2_a2_string6',
    title: '2. Găsește La2 (110 Hz) pe coarda 6',
    description: 'Apasă fretul care produce nota A2 (110 Hz) pe coarda 6 (Mi grav) și ciupește coarda.',
    targetModule: 'string',
    hint: 'Coarda 6 liberă este E2. Urcă 5 semitonoane până la fretul 5.',
  },
  {
    id: 'm3_c_major',
    title: '3. Construiește acordul Do major (C)',
    description: 'În Modul Acorduri, selectează nota fundamentală C (Do) și tipul Major, apoi ascultă acordul.',
    targetModule: 'chords',
    hint: 'Notele componente ale acordului Do major sunt C, E și G.',
  },
  {
    id: 'm4_harmonic_3',
    title: '4. Izolează armonicul 3 (3f₀)',
    description: 'În Modul Armonice, dezactivează celelalte armonice și ascultă doar armonicul 3 (octavă + quintă).',
    targetModule: 'harmonics',
    hint: 'Activează exclusiv armonicul n = 3 cu amplitudine > 0 și apasă „Ascultă sunetul compus”.',
  },
  {
    id: 'm5_pick_fifth',
    title: '5. Anulează armonicul 5 din poziția ciupirii',
    description: 'Setează poziția de ciupire la p = 0.20 (1/5 din lungime, deasupra fretului 5) și ascultă efectul asupra timbrului.',
    targetModule: 'harmonics',
    hint: 'Când p = 1/5, sin(5·π·1/5) = sin(π) = 0, deci armonicul 5 dispare din spectru.',
  },
  {
    id: 'm6_pure_fifth',
    title: '6. Compară quinta pură (3:2) cu quinta temperată',
    description: 'În Modul Temperament, selectează Quinta pură (3:2) și ascultă bătăile simultan cu quinta temperată.',
    targetModule: 'temperament',
    hint: 'Diferența este de ~1,96 sutimi de semiton; pe A440 vei auzi bătăi lente la ≈ 0,75 Hz.',
  },
];

/**
 * Generates an acoustic guitar voicing (6 fret numbers, -1 for muted) for a given root pitch class & quality.
 * Uses standard E-A-D-G-B-E open/movable barre shapes so chords sound natural on guitar.
 */
export function getGuitarChordVoicing(
  rootPitchClass: number,
  quality: ChordQualityId,
  strings: StringState[]
): Array<{ stringId: number; fret: number | null; midi: number; pitchClass: number }> {
  // Compute target pitch classes of the chord
  const def = CHORDS[quality];
  const chordPitchClasses = def.intervals.map((semi) => (rootPitchClass + semi) % 12);

  // Pick a root bass string (string 6, 5, or 4)
  // Find lowest fret >= 0 on strings 6, 5, 4 that plays the root
  let bassStringIdx = 5; // string 6 (index 5 in [1..6])
  let bestBassFret = 99;
  for (const idx of [5, 4, 3]) {
    const openPc = ((strings[idx].openMidi % 12) + 12) % 12;
    const fret = (rootPitchClass - openPc + 12) % 12;
    if (fret <= 7 && fret < bestBassFret) {
      bestBassFret = fret;
      bassStringIdx = idx;
    }
  }
  if (bestBassFret === 99) {
    const openPc = ((strings[5].openMidi % 12) + 12) % 12;
    bestBassFret = (rootPitchClass - openPc + 12) % 12;
    bassStringIdx = 5;
  }

  const windowMin = Math.max(0, bestBassFret - 1);
  const windowMax = windowMin + 4;

  const voicing: Array<{ stringId: number; fret: number | null; midi: number; pitchClass: number }> = [];

  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    if (i > bassStringIdx) {
      // Mute strings thicker than bass root
      voicing.push({ stringId: s.id, fret: null, midi: 0, pitchClass: -1 });
      continue;
    }
    if (i === bassStringIdx) {
      const midi = s.openMidi + bestBassFret;
      voicing.push({ stringId: s.id, fret: bestBassFret, midi, pitchClass: rootPitchClass });
      continue;
    }

    // Choose a chord tone within [windowMin, windowMax], preferring open string 0 if it fits
    let chosenFret: number | null = null;
    const openPc = ((s.openMidi % 12) + 12) % 12;

    if (windowMin === 0 && chordPitchClasses.includes(openPc)) {
      chosenFret = 0;
    } else {
      let bestDist = 999;
      for (let f = windowMin; f <= windowMax; f++) {
        const pc = (((s.openMidi + f) % 12) + 12) % 12;
        if (chordPitchClasses.includes(pc)) {
          const dist = Math.abs(f - bestBassFret);
          if (dist < bestDist) {
            bestDist = dist;
            chosenFret = f;
          }
        }
      }
    }

    if (chosenFret !== null) {
      const midi = s.openMidi + chosenFret;
      voicing.push({ stringId: s.id, fret: chosenFret, midi, pitchClass: ((midi % 12) + 12) % 12 });
    } else {
      voicing.push({ stringId: s.id, fret: null, midi: 0, pitchClass: -1 });
    }
  }

  return voicing;
}
