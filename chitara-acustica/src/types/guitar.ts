export type NotationSystem = 'anglo' | 'solfege';

export type LabModuleId =
  | 'notes'
  | 'string'
  | 'harmonics'
  | 'temperament'
  | 'scales'
  | 'chords'
  | 'spectrum'
  | 'sandbox';

export type TopSection = 'lab' | 'guide' | 'dictionary';

export type Note = {
  name: string;
  solfege: string;
  octave: number;
  midi: number;
  frequency: number;
  cents: number;
};

export type StringState = {
  id: number; // 1 (high E4) to 6 (low E2)
  label: string;
  openMidi: number;
  openFrequency: number;
  length: number; // meters, e.g. 0.65
  tension: number; // Newtons
  linearDensity: number; // kg/m
  gaugeMm: number;
  fret: number | null; // 0..15 or null (open = 0)
  harmonics: number[];
};

export type TuningId = 'standard' | 'dropD' | 'openG' | 'dadgad';

export type TuningPreset = {
  id: TuningId;
  name: string;
  description: string;
  openMidis: number[]; // ordered string 6 (low) -> string 1 (high) or string 1 -> 6; let's standardize 6->1 or 1->6 explicitly
};

export type ScaleId =
  | 'major'
  | 'minor_natural'
  | 'minor_harmonic'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues';

export type ChordQualityId =
  | 'major'
  | 'minor'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'sus2'
  | 'sus4'
  | 'dim';

export type SynthesisMethod = 'karplus' | 'harmonics' | 'periodic';

export type SandboxSoundSource = 'guitar' | 'sine' | 'triangle' | 'sawtooth';

export type BodyWoodId = 'bypass' | 'spruce' | 'cedar' | 'mahogany' | 'maple' | 'custom';

export type BodyEqBand = {
  frequency: number;
  Q: number;
  gain: number;
};

export type BodyResonanceConfig = {
  woodId: BodyWoodId;
  enabled: boolean;
  helmholtz: BodyEqBand; // Air cavity resonance A0 (~95-115 Hz)
  topPlate: BodyEqBand; // Main top-plate monopole T1 (~185-230 Hz)
  presence: BodyEqBand; // Upper-mid dipole / attack (~1.1-2.8 kHz)
  brilliance: { frequency: number; gain: number }; // High-shelf damping / sparkle (~3.2-5 kHz)
};

export type AdsrPresetId = 'guitar_pluck' | 'bowed_swell' | 'pizzicato' | 'pad_sustain' | 'custom';

export type AdsrEnvelopeConfig = {
  enabled: boolean;
  presetId: AdsrPresetId;
  attackSec: number;
  decaySec: number;
  sustainLevel: number;
  holdSec: number;
  releaseSec: number;
};

export type ExcitationTechnique = 'normal' | 'bridge' | 'sweet_spot' | 'harmonic_12' | 'harmonic_7' | 'harmonic_5';

export type MissionId =
  | 'm1_a4_string1'
  | 'm2_a2_string6'
  | 'm3_c_major'
  | 'm4_harmonic_3'
  | 'm5_pick_fifth'
  | 'm6_pure_fifth';

export type Mission = {
  id: MissionId;
  title: string;
  description: string;
  targetModule: LabModuleId;
  hint: string;
};

export type LabPreferences = {
  notation: NotationSystem;
  volume: number; // 0..1
  soundEnabled: boolean;
  boardMode: boolean;
  tuning: TuningId;
  activeModule: LabModuleId;
  completedMissions: MissionId[];
};
