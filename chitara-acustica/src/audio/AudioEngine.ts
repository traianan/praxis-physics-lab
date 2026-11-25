import {
  AdsrEnvelopeConfig,
  AdsrPresetId,
  BodyResonanceConfig,
  BodyWoodId,
  ExcitationTechnique,
  SynthesisMethod,
} from '../types/guitar';
import { frequencyToNote, harmonicAmplitudes } from '../utils/musicTheory';

export type PluckedOptions = {
  duration?: number;
  damping?: number;
  pickPosition?: number;
  method?: SynthesisMethod;
  technique?: ExcitationTechnique;
  customHarmonics?: number[];
};

export type AdsrPresetInfo = {
  id: Exclude<AdsrPresetId, 'custom'>;
  name: string;
  shortName: string;
  description: string;
  config: AdsrEnvelopeConfig;
};

export const ADSR_PRESETS: Record<Exclude<AdsrPresetId, 'custom'>, AdsrPresetInfo> = {
  guitar_pluck: {
    id: 'guitar_pluck',
    name: 'Ciupire naturală chitară',
    shortName: 'Ciupire naturală',
    description: 'Atac instantaneu (6 ms), tranziție rapidă a penei și stingere naturală a corzii.',
    config: {
      enabled: true,
      presetId: 'guitar_pluck',
      attackSec: 0.006,
      decaySec: 0.52,
      sustainLevel: 0.36,
      holdSec: 0.35,
      releaseSec: 1.45,
    },
  },
  bowed_swell: {
    id: 'bowed_swell',
    name: 'Atac lent (Vioară / Arcuș)',
    shortName: 'Atac lent',
    description: 'Creștere progresivă a amplitudinii fără tranzient percurent, asemănător arcușului.',
    config: {
      enabled: true,
      presetId: 'bowed_swell',
      attackSec: 0.42,
      decaySec: 0.34,
      sustainLevel: 0.8,
      holdSec: 0.65,
      releaseSec: 1.25,
    },
  },
  pizzicato: {
    id: 'pizzicato',
    name: 'Percusiv scurt (Pizzicato)',
    shortName: 'Percusiv scurt',
    description: 'Ciupire scurtă și amortizată cu palm-mute: decay rapid și coadă de stingere scurtă.',
    config: {
      enabled: true,
      presetId: 'pizzicato',
      attackSec: 0.005,
      decaySec: 0.14,
      sustainLevel: 0.08,
      holdSec: 0.08,
      releaseSec: 0.22,
    },
  },
  pad_sustain: {
    id: 'pad_sustain',
    name: 'Susținere lungă (Pad / E-Bow)',
    shortName: 'Susținere lungă',
    description: 'Menținere continuă a energiei urmată de o stingere foarte lentă (efect E-Bow).',
    config: {
      enabled: true,
      presetId: 'pad_sustain',
      attackSec: 0.26,
      decaySec: 0.4,
      sustainLevel: 0.88,
      holdSec: 0.85,
      releaseSec: 2.2,
    },
  },
};

export type WoodPresetInfo = {
  id: BodyWoodId;
  name: string;
  shortName: string;
  subtitle: string;
  acousticCharacter: string;
  config: BodyResonanceConfig;
};

export const BODY_WOOD_PRESETS: Record<Exclude<BodyWoodId, 'custom'>, WoodPresetInfo> = {
  spruce: {
    id: 'spruce',
    name: 'Molid Sitka (Spruce)',
    shortName: 'Molid',
    subtitle: 'Rigiditate longitudinală mare · atac clar, dinamic și strălucitor',
    acousticCharacter:
      'Molidul (Picea sitchensis) are un raport ridicat rigiditate/masă, oferind o proiecție articulată, medii-înalte definite și armonice cristaline.',
    config: {
      woodId: 'spruce',
      enabled: true,
      helmholtz: { frequency: 98, Q: 2.2, gain: 2.5 },
      topPlate: { frequency: 195, Q: 1.6, gain: 3.0 },
      presence: { frequency: 1850, Q: 1.0, gain: 2.8 },
      brilliance: { frequency: 4100, gain: 3.4 },
    },
  },
  cedar: {
    id: 'cedar',
    name: 'Cedru Roșu (Cedar)',
    shortName: 'Cedru',
    subtitle: 'Densitate mică, amortizare internă mare · cald, bogat în joase, catifelat',
    acousticCharacter:
      'Cedrul (Thuja plicata) răspunde rapid la ciupiri ușoare, accentuând rezonanța gravă a cutiei (A0/T1) și atenuând ușor vârfurile înalte pentru un timbru cald.',
    config: {
      woodId: 'cedar',
      enabled: true,
      helmholtz: { frequency: 108, Q: 2.0, gain: 4.6 },
      topPlate: { frequency: 215, Q: 1.5, gain: 4.8 },
      presence: { frequency: 1150, Q: 0.9, gain: -1.6 },
      brilliance: { frequency: 3400, gain: -4.2 },
    },
  },
  mahogany: {
    id: 'mahogany',
    name: 'Mahon masiv (Mahogany)',
    shortName: 'Mahon',
    subtitle: 'Medii centrale dense · sunet percusiv, concentrat și „lemnos”',
    acousticCharacter:
      'Fața din mahon accentuează zona mediilor fundamentale (500–900 Hz) și limitează armonicele foarte înalte, oferind un sunet direct de blues/folk.',
    config: {
      woodId: 'mahogany',
      enabled: true,
      helmholtz: { frequency: 102, Q: 2.1, gain: 1.6 },
      topPlate: { frequency: 225, Q: 1.7, gain: 2.4 },
      presence: { frequency: 760, Q: 1.1, gain: 3.4 },
      brilliance: { frequency: 3600, gain: -2.6 },
    },
  },
  maple: {
    id: 'maple',
    name: 'Arțar figurat (Maple)',
    shortName: 'Arțar',
    subtitle: 'Joase controlate · separație clară a notelor și atac rapid',
    acousticCharacter:
      'Arțarul atenuează rezonanțele joase prelungite și scoate în evidență tranzițiile de atac și mediile-înalte, prevenind suprapunerea tulbure în acorduri.',
    config: {
      woodId: 'maple',
      enabled: true,
      helmholtz: { frequency: 100, Q: 2.0, gain: -1.8 },
      topPlate: { frequency: 190, Q: 1.5, gain: 0.8 },
      presence: { frequency: 2500, Q: 1.1, gain: 4.0 },
      brilliance: { frequency: 4400, gain: 2.8 },
    },
  },
  bypass: {
    id: 'bypass',
    name: 'Fără filtru corp (Neutru)',
    shortName: 'Neutru (0 dB)',
    subtitle: 'Răspuns plat 0 dB · izolează doar vibrația pură a corzii',
    acousticCharacter:
      'Dezactivează colorarea cutiei de rezonanță pentru a compara sunetul brut al corzii cu efectul acustic al lemnului.',
    config: {
      woodId: 'bypass',
      enabled: false,
      helmholtz: { frequency: 100, Q: 2.1, gain: 0 },
      topPlate: { frequency: 200, Q: 1.6, gain: 0 },
      presence: { frequency: 1600, Q: 1.0, gain: 0 },
      brilliance: { frequency: 3800, gain: 0 },
    },
  },
};

class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private signalBus: GainNode | null = null;
  private eqHelmholtz: BiquadFilterNode | null = null;
  private eqTopPlate: BiquadFilterNode | null = null;
  private eqPresence: BiquadFilterNode | null = null;
  private eqBrilliance: BiquadFilterNode | null = null;
  private bodyConfig: BodyResonanceConfig = BODY_WOOD_PRESETS.spruce.config;
  private adsrConfig: AdsrEnvelopeConfig = { ...ADSR_PRESETS.guitar_pluck.config };
  private masterGain: GainNode | null = null;
  private metronomeGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private polyAnalyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private spectrumBuf: Float32Array<ArrayBuffer> = new Float32Array(2048);
  private polySpectrumBuf: Float32Array<ArrayBuffer> = new Float32Array(8192);
  private timeBuf: Float32Array<ArrayBuffer> = new Float32Array(4096);
  private volume = 0.8;
  private muted = false;
  private recordingActive = false;
  private recordingChunks: Float32Array[] = [];
  private recordingSampleCount = 0;
  private recordingPeak = 0;
  private recordingProcessor: ScriptProcessorNode | null = null;
  private recordingSink: GainNode | null = null;
  private recordingIncludeMetronome = false;
  private harmonicDrone: {
    bus: GainNode;
    oscs: OscillatorNode[];
    gains: GainNode[];
  } | null = null;

  public ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.signalBus = this.ctx.createGain();
      this.signalBus.gain.value = 1.0;

      this.eqHelmholtz = this.ctx.createBiquadFilter();
      this.eqHelmholtz.type = 'peaking';
      this.eqTopPlate = this.ctx.createBiquadFilter();
      this.eqTopPlate.type = 'peaking';
      this.eqPresence = this.ctx.createBiquadFilter();
      this.eqPresence.type = 'peaking';
      this.eqBrilliance = this.ctx.createBiquadFilter();
      this.eqBrilliance.type = 'highshelf';

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;

      this.signalBus.connect(this.eqHelmholtz);
      this.eqHelmholtz.connect(this.eqTopPlate);
      this.eqTopPlate.connect(this.eqPresence);
      this.eqPresence.connect(this.eqBrilliance);
      this.eqBrilliance.connect(this.masterGain);

      this.applyBodyConfigToNodes(this.bodyConfig);

      this.metronomeGain = this.ctx.createGain();
      this.metronomeGain.gain.value = this.muted ? 0 : this.volume;
      this.metronomeGain.connect(this.ctx.destination);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.72;
      this.analyser.minDecibels = -100;
      this.analyser.maxDecibels = -20;

      this.polyAnalyser = this.ctx.createAnalyser();
      this.polyAnalyser.fftSize = 16384;
      this.polyAnalyser.smoothingTimeConstant = 0.55;
      this.polyAnalyser.minDecibels = -105;
      this.polyAnalyser.maxDecibels = -15;

      this.masterGain.connect(this.analyser);
      this.masterGain.connect(this.polyAnalyser);
      this.analyser.connect(this.ctx.destination);

      this.spectrumBuf = new Float32Array(this.analyser.frequencyBinCount);
      this.polySpectrumBuf = new Float32Array(this.polyAnalyser.frequencyBinCount);
      this.timeBuf = new Float32Array(this.analyser.fftSize);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // A later note click retries resume while the browser has a user gesture.
      });
    }
    return this.ctx;
  }

  private applyBodyConfigToNodes(config: BodyResonanceConfig) {
    if (!this.ctx || !this.eqHelmholtz || !this.eqTopPlate || !this.eqPresence || !this.eqBrilliance) {
      return;
    }
    const now = this.ctx.currentTime;
    const active = config.enabled && config.woodId !== 'bypass';

    this.eqHelmholtz.frequency.setTargetAtTime(config.helmholtz.frequency, now, 0.02);
    this.eqHelmholtz.Q.setTargetAtTime(config.helmholtz.Q, now, 0.02);
    this.eqHelmholtz.gain.setTargetAtTime(active ? config.helmholtz.gain : 0, now, 0.02);

    this.eqTopPlate.frequency.setTargetAtTime(config.topPlate.frequency, now, 0.02);
    this.eqTopPlate.Q.setTargetAtTime(config.topPlate.Q, now, 0.02);
    this.eqTopPlate.gain.setTargetAtTime(active ? config.topPlate.gain : 0, now, 0.02);

    this.eqPresence.frequency.setTargetAtTime(config.presence.frequency, now, 0.02);
    this.eqPresence.Q.setTargetAtTime(config.presence.Q, now, 0.02);
    this.eqPresence.gain.setTargetAtTime(active ? config.presence.gain : 0, now, 0.02);

    this.eqBrilliance.frequency.setTargetAtTime(config.brilliance.frequency, now, 0.02);
    this.eqBrilliance.gain.setTargetAtTime(active ? config.brilliance.gain : 0, now, 0.02);
  }

  public setBodyResonance(config: BodyResonanceConfig) {
    this.bodyConfig = {
      ...config,
      helmholtz: { ...config.helmholtz },
      topPlate: { ...config.topPlate },
      presence: { ...config.presence },
      brilliance: { ...config.brilliance },
    };
    this.applyBodyConfigToNodes(this.bodyConfig);
  }

  public getBodyResonance(): BodyResonanceConfig {
    return this.bodyConfig;
  }

  public setAdsrEnvelope(config: AdsrEnvelopeConfig) {
    this.adsrConfig = { ...config };
  }

  public getAdsrEnvelope(): AdsrEnvelopeConfig {
    return { ...this.adsrConfig };
  }

  /**
   * Schedules an ADSR amplitude envelope on a GainNode.
   * Returns total duration in seconds, or null if custom ADSR is bypassed.
   */
  private scheduleAdsrEnvelope(env: GainNode, peakGain: number, now: number): number | null {
    if (!this.adsrConfig.enabled) return null;

    const a = Math.max(0.003, Math.min(2.0, this.adsrConfig.attackSec));
    const d = Math.max(0.02, Math.min(2.5, this.adsrConfig.decaySec));
    const s = Math.max(0.005, Math.min(1.0, this.adsrConfig.sustainLevel));
    const h = Math.max(0.04, Math.min(2.5, this.adsrConfig.holdSec));
    const r = Math.max(0.03, Math.min(4.0, this.adsrConfig.releaseSec));

    const sustainGain = Math.max(0.0005, peakGain * s);
    const t1 = now + a;
    const t2 = t1 + d;
    const t3 = t2 + h;
    const t4 = t3 + r;

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, t1);
    env.gain.exponentialRampToValueAtTime(sustainGain, t2);
    env.gain.setValueAtTime(sustainGain, t3);
    env.gain.exponentialRampToValueAtTime(0.0001, t4);

    return a + d + h + r;
  }

  /**
   * Computes exact combined frequency response (in dB) of the 4-band acoustic body EQ
   * across the supplied frequency grid (Hz).
   */
  public computeBodyFrequencyResponseDb(frequencies: Float32Array, config: BodyResonanceConfig): Float32Array {
    const outDb = new Float32Array(frequencies.length);
    if (!config.enabled || config.woodId === 'bypass') {
      return outDb; // Flat 0 dB
    }

    const fs = this.ctx?.sampleRate ?? 48000;

    const evalPeakingMag = (f0: number, Q: number, gainDb: number, f: number): number => {
      if (Math.abs(gainDb) < 0.001) return 1;
      const A = Math.pow(10, gainDb / 40);
      const w0 = (2 * Math.PI * f0) / fs;
      const alpha = Math.sin(w0) / (2 * Math.max(0.1, Q));
      const cosW0 = Math.cos(w0);

      const b0 = 1 + alpha * A;
      const b1 = -2 * cosW0;
      const b2 = 1 - alpha * A;
      const a0 = 1 + alpha / A;
      const a1 = -2 * cosW0;
      const a2 = 1 - alpha / A;

      const w = (2 * Math.PI * f) / fs;
      const cosW = Math.cos(w);
      const sinW = Math.sin(w);
      const cos2W = Math.cos(2 * w);
      const sin2W = Math.sin(2 * w);

      const numRe = b0 + b1 * cosW + b2 * cos2W;
      const numIm = -b1 * sinW - b2 * sin2W;
      const denRe = a0 + a1 * cosW + a2 * cos2W;
      const denIm = -a1 * sinW - a2 * sin2W;

      return Math.sqrt((numRe * numRe + numIm * numIm) / Math.max(1e-12, denRe * denRe + denIm * denIm));
    };

    const evalHighShelfMag = (f0: number, gainDb: number, f: number): number => {
      if (Math.abs(gainDb) < 0.001) return 1;
      const A = Math.pow(10, gainDb / 40);
      const w0 = (2 * Math.PI * f0) / fs;
      const cosW0 = Math.cos(w0);
      const sinW0 = Math.sin(w0);
      // Web Audio BiquadFilter highshelf uses S = 1 (alpha = sin(w0)/2 * sqrt((A+1/A)*(1/S - 1) + 2) = sin(w0)/sqrt(2))
      const alpha = (sinW0 / 2) * Math.SQRT2;
      const twoSqrtAAlpha = 2 * Math.sqrt(A) * alpha;

      const b0 = A * (A + 1 + (A - 1) * cosW0 + twoSqrtAAlpha);
      const b1 = -2 * A * (A - 1 + (A + 1) * cosW0);
      const b2 = A * (A + 1 + (A - 1) * cosW0 - twoSqrtAAlpha);
      const a0 = A + 1 - (A - 1) * cosW0 + twoSqrtAAlpha;
      const a1 = 2 * (A - 1 - (A + 1) * cosW0);
      const a2 = A + 1 - (A - 1) * cosW0 - twoSqrtAAlpha;

      const w = (2 * Math.PI * f) / fs;
      const cosW = Math.cos(w);
      const sinW = Math.sin(w);
      const cos2W = Math.cos(2 * w);
      const sin2W = Math.sin(2 * w);

      const numRe = b0 + b1 * cosW + b2 * cos2W;
      const numIm = -b1 * sinW - b2 * sin2W;
      const denRe = a0 + a1 * cosW + a2 * cos2W;
      const denIm = -a1 * sinW - a2 * sin2W;

      return Math.sqrt((numRe * numRe + numIm * numIm) / Math.max(1e-12, denRe * denRe + denIm * denIm));
    };

    for (let i = 0; i < frequencies.length; i++) {
      const f = frequencies[i];
      const mag =
        evalPeakingMag(config.helmholtz.frequency, config.helmholtz.Q, config.helmholtz.gain, f) *
        evalPeakingMag(config.topPlate.frequency, config.topPlate.Q, config.topPlate.gain, f) *
        evalPeakingMag(config.presence.frequency, config.presence.Q, config.presence.gain, f) *
        evalHighShelfMag(config.brilliance.frequency, config.brilliance.gain, f);
      outDb[i] = 20 * Math.log10(Math.max(1e-5, mag));
    }

    return outDb;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx) {
      const target = this.muted ? 0 : this.volume;
      this.masterGain?.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
      this.metronomeGain?.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx) {
      const target = this.muted ? 0 : this.volume;
      this.masterGain?.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
      this.metronomeGain?.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    }
  }

  public scheduleMetronomeClick(time: number, accent: boolean) {
    const ctx = this.ensureContext();
    if (!this.metronomeGain) return;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(accent ? 1320 : 880, time);
    osc.frequency.exponentialRampToValueAtTime(accent ? 660 : 440, time + 0.035);

    const peakGain = accent ? 0.52 : 0.32;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(peakGain, time + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.048);

    osc.connect(env);
    env.connect(this.metronomeGain);

    osc.start(time);
    osc.stop(time + 0.055);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getSampleRate(): number {
    return this.ctx?.sampleRate ?? 48000;
  }

  public getSpectrumData(): Float32Array<ArrayBuffer> | null {
    if (!this.analyser) return null;
    this.analyser.getFloatFrequencyData(this.spectrumBuf);
    return this.spectrumBuf;
  }

  public getTimeDomainData(): Float32Array<ArrayBuffer> | null {
    if (!this.analyser) return null;
    this.analyser.getFloatTimeDomainData(this.timeBuf);
    return this.timeBuf;
  }

  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop?.();
      } catch {
        // Ignore already stopped nodes
      }
      try {
        node.disconnect();
      } catch {
        // Ignore
      }
    });
    this.activeNodes = [];
    this.stopHarmonicDrone();
  }

  public startHarmonicDrone(f0: number, amplitudes: number[]) {
    const ctx = this.ensureContext();
    const targetBus = this.signalBus ?? this.masterGain;
    if (!targetBus) return;

    this.stopHarmonicDrone();
    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.connect(targetBus);

    const count = Math.min(8, Math.max(1, amplitudes.length));
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    for (let idx = 0; idx < count; idx++) {
      const n = idx + 1;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      const freq = Math.min(ctx.sampleRate / 2 - 200, Math.max(30, f0 * n));
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(Math.max(0, amplitudes[idx] ?? 0), now);
      osc.connect(g);
      g.connect(bus);
      osc.start(now);
      oscs.push(osc);
      gains.push(g);
    }

    const totalAmp = amplitudes.slice(0, count).reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const normScale = 0.28 / Math.max(1, Math.sqrt(totalAmp));
    bus.gain.linearRampToValueAtTime(normScale, now + 0.04);

    this.harmonicDrone = { bus, oscs, gains };
  }

  public updateHarmonicDrone(f0: number, amplitudes: number[]) {
    if (!this.harmonicDrone || !this.ctx) return;
    const now = this.ctx.currentTime;
    const { bus, oscs, gains } = this.harmonicDrone;
    const count = oscs.length;

    for (let idx = 0; idx < count; idx++) {
      const n = idx + 1;
      const freq = Math.min(this.ctx.sampleRate / 2 - 200, Math.max(30, f0 * n));
      oscs[idx].frequency.setTargetAtTime(freq, now, 0.02);
      gains[idx].gain.setTargetAtTime(Math.max(0, amplitudes[idx] ?? 0), now, 0.02);
    }

    const totalAmp = amplitudes.slice(0, count).reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const normScale = 0.28 / Math.max(1, Math.sqrt(totalAmp));
    bus.gain.setTargetAtTime(normScale, now, 0.025);
  }

  public stopHarmonicDrone() {
    if (!this.harmonicDrone) return;
    const { bus, oscs, gains } = this.harmonicDrone;
    this.harmonicDrone = null;
    try {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        bus.gain.cancelScheduledValues(now);
        bus.gain.setTargetAtTime(0.0001, now, 0.015);
      }
      window.setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Ignore
          }
        });
        gains.forEach((g) => {
          try {
            g.disconnect();
          } catch {
            // Ignore
          }
        });
        try {
          bus.disconnect();
        } catch {
          // Ignore
        }
      }, 65);
    } catch {
      // Ignore cleanup errors
    }
  }

  public playTone(frequency: number, duration = 1.4, type: OscillatorType = 'sine', gainLevel = 0.25) {
    const ctx = this.ensureContext();
    const targetBus = this.signalBus ?? this.masterGain;
    if (!targetBus) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    const adsrTotal = this.scheduleAdsrEnvelope(env, gainLevel, now);
    const effectiveDuration = adsrTotal ?? duration;
    if (adsrTotal === null) {
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(gainLevel, now + 0.015);
      env.gain.setValueAtTime(gainLevel, Math.max(now + 0.02, now + duration - 0.15));
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    osc.connect(env);
    env.connect(targetBus);

    osc.start(now);
    osc.stop(now + effectiveDuration + 0.03);
    this.activeNodes.push(osc);
  }

  public playDualTones(freq1: number, freq2: number, duration = 2.6, gainLevel = 0.18) {
    const ctx = this.ensureContext();
    const targetBus = this.signalBus ?? this.masterGain;
    if (!targetBus) return;

    const now = ctx.currentTime;
    [freq1, freq2].forEach((freq) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(gainLevel, now + 0.02);
      env.gain.setValueAtTime(gainLevel, now + duration - 0.2);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(env);
      env.connect(targetBus);

      osc.start(now);
      osc.stop(now + duration + 0.02);
      this.activeNodes.push(osc);
    });
  }

  /**
   * Didactic additive harmonic synthesizer (one OscillatorNode per harmonic).
   */
  public playHarmonicSeries(f0: number, amplitudes: number[], duration = 2.6) {
    const ctx = this.ensureContext();
    const targetBus = this.signalBus ?? this.masterGain;
    if (!targetBus) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    const totalAmp = amplitudes.reduce((acc, val) => acc + Math.max(0, val), 0) || 1;
    const normScale = 0.45 / Math.max(1, Math.sqrt(totalAmp));
    bus.gain.setValueAtTime(normScale, now);
    bus.connect(targetBus);

    amplitudes.forEach((amp, idx) => {
      if (amp <= 0.001) return;
      const n = idx + 1;
      const freq = f0 * n;
      if (freq > ctx.sampleRate / 2 - 200) return;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Higher harmonics decay faster naturally
      const harmonicDecay = Math.max(0.6, duration / Math.pow(n, 0.35));
      const adsrTotal = this.scheduleAdsrEnvelope(env, amp, now);
      const stopDur = adsrTotal ?? harmonicDecay;
      if (adsrTotal === null) {
        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(amp, now + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, now + harmonicDecay);
      }

      osc.connect(env);
      env.connect(bus);

      osc.start(now);
      osc.stop(now + stopDur + 0.03);
      this.activeNodes.push(osc);
    });
  }

  /**
   * Generates a Karplus-Strong plucked acoustic guitar string AudioBuffer.
   * Incorporates pick-position comb filtering and realistic body warmth.
   */
  public createPluckedStringBuffer(
    frequency: number,
    duration = 3.0,
    damping = 0.996,
    pickPosition = 0.22,
    preserveSustain = false
  ): AudioBuffer {
    const ctx = this.ensureContext();
    const sampleRate = ctx.sampleRate;
    const safeFreq = Math.max(40, Math.min(2400, frequency));
    const exactDelay = sampleRate / safeFreq;
    const delayLength = Math.max(2, Math.round(exactDelay));
    const totalSamples = Math.ceil(duration * sampleRate);

    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // 1. Initial pluck excitation: filtered noise + pick-position comb filter
    const noise = new Float32Array(delayLength);
    let prev = 0;
    for (let i = 0; i < delayLength; i++) {
      const white = Math.random() * 2 - 1;
      // Gentle one-pole lowpass to soften harsh metallic click on nylon/acoustic strings
      prev = 0.55 * white + 0.45 * prev;
      noise[i] = prev;
    }

    // Apply pick position comb filter: y[n] = x[n] - x[n - round(p * N)]
    const pickDelay = Math.max(1, Math.min(delayLength - 1, Math.round(pickPosition * delayLength)));
    for (let i = 0; i < delayLength; i++) {
      const delayed = i >= pickDelay ? noise[i - pickDelay] : 0;
      data[i] = (noise[i] - 0.82 * delayed) * 0.85;
    }

    // 2. Karplus-Strong feedback loop with low-pass averaging filter
    // Scale damping subtly by pitch so low strings sustain naturally and high strings don't sound sterile
    const baseDamping = preserveSustain ? Math.max(damping, 0.9992) : damping;
    const maxCap = preserveSustain ? 0.9996 : 0.9985;
    const effectiveDamping = Math.min(
      maxCap,
      Math.max(0.975, baseDamping - (safeFreq > 450 && !preserveSustain ? 0.002 : 0))
    );
    for (let i = delayLength; i < totalSamples; i++) {
      const previousIndex = i - delayLength - 1;
      const previousSample = data[previousIndex >= 0 ? previousIndex : delayLength - 1];
      data[i] = effectiveDamping * 0.5 * (data[i - delayLength] + previousSample);
    }

    // Optional soft RMS floor compensation when user crafts slow attack / long sustain envelopes
    // so the string waveguide stays audible while the external GainNode dictates the ADSR shape
    if (preserveSustain) {
      let peakInit = 0;
      for (let i = 0; i < delayLength; i++) {
        peakInit = Math.max(peakInit, Math.abs(data[i]));
      }
      const targetRms = Math.max(0.08, peakInit * 0.35);
      const windowLen = Math.max(delayLength, Math.floor(sampleRate * 0.04));
      for (let start = delayLength; start < totalSamples; start += windowLen) {
        const end = Math.min(totalSamples, start + windowLen);
        let sumSq = 0;
        for (let i = start; i < end; i++) {
          sumSq += data[i] * data[i];
        }
        const rms = Math.sqrt(sumSq / Math.max(1, end - start));
        if (rms > 1e-6 && rms < targetRms) {
          const boost = Math.min(8, targetRms / rms);
          for (let i = start; i < end; i++) {
            data[i] = Math.max(-0.95, Math.min(0.95, data[i] * boost));
          }
        }
      }
    }

    return buffer;
  }

  public playPluckedString(frequency: number, options: PluckedOptions = {}) {
    const ctx = this.ensureContext();
    const targetBus = this.signalBus ?? this.masterGain;
    if (!targetBus) return;

    const {
      duration = 2.8,
      damping = 0.996,
      pickPosition = 0.22,
      method = 'karplus',
      technique = 'normal',
      customHarmonics,
    } = options;

    let effectiveFreq = frequency;
    let effectivePick = pickPosition;
    let effectiveDamping = damping;

    if (technique === 'bridge') {
      effectivePick = 0.08;
      effectiveDamping = Math.min(0.997, damping);
    } else if (technique === 'sweet_spot') {
      effectivePick = 0.35;
    } else if (technique === 'harmonic_12') {
      effectiveFreq = frequency * 2;
      this.playHarmonicSeries(effectiveFreq, [1, 0.15, 0.04], 2.5);
      return;
    } else if (technique === 'harmonic_7') {
      effectiveFreq = frequency * 3;
      this.playHarmonicSeries(effectiveFreq, [1, 0.12, 0.03], 2.4);
      return;
    } else if (technique === 'harmonic_5') {
      effectiveFreq = frequency * 4;
      this.playHarmonicSeries(effectiveFreq, [1, 0.1, 0.02], 2.2);
      return;
    }

    if (method === 'harmonics') {
      const amps = customHarmonics ?? harmonicAmplitudes(effectivePick, 8);
      this.playHarmonicSeries(effectiveFreq, amps, duration);
      return;
    }

    if (method === 'periodic') {
      const amps = customHarmonics ?? harmonicAmplitudes(effectivePick, 10);
      const real = new Float32Array(amps.length + 1);
      const imag = new Float32Array(amps.length + 1);
      amps.forEach((a, idx) => {
        imag[idx + 1] = a;
      });
      const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const now = ctx.currentTime;
      osc.setPeriodicWave(wave);
      osc.frequency.setValueAtTime(effectiveFreq, now);
      const adsrTotal = this.scheduleAdsrEnvelope(env, 0.32, now);
      const stopDur = adsrTotal ?? duration;
      if (adsrTotal === null) {
        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.32, now + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      }
      osc.connect(env);
      env.connect(targetBus);
      osc.start(now);
      osc.stop(now + stopDur + 0.03);
      this.activeNodes.push(osc);
      return;
    }

    // Default: Karplus-Strong physical synthesis routed through global Body Resonance EQ & ADSR Envelope
    const now = ctx.currentTime;
    const env = ctx.createGain();
    const adsrTotal = this.scheduleAdsrEnvelope(env, 0.62, now);
    const effectiveDuration = adsrTotal !== null ? Math.max(duration, adsrTotal + 0.06) : duration;
    const needsSustainHold =
      this.adsrConfig.enabled &&
      (this.adsrConfig.attackSec > 0.04 ||
        this.adsrConfig.sustainLevel > 0.45 ||
        this.adsrConfig.releaseSec > 1.7 ||
        effectiveDuration > 3.1);

    const buffer = this.createPluckedStringBuffer(
      effectiveFreq,
      effectiveDuration,
      effectiveDamping,
      effectivePick,
      needsSustainHold
    );
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    if (adsrTotal === null) {
      env.gain.setValueAtTime(0.58, now);
      env.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    source.connect(env);
    env.connect(targetBus);

    source.start(now);
    source.stop(now + effectiveDuration + 0.03);
    this.activeNodes.push(source);
  }

  public playChord(frequencies: number[], arpeggioMs = 38, options: PluckedOptions = {}) {
    frequencies.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playPluckedString(freq, {
          ...options,
          duration: options.duration ?? 3.0,
        });
      }, idx * arpeggioMs);
    });
  }

  public async startMicrophone(): Promise<void> {
    const ctx = this.ensureContext();
    if (!this.analyser) return;

    await this.stopMicrophone();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.micStream = stream;
    this.micSource = ctx.createMediaStreamSource(stream);
    // Connect ONLY to analysers, never to destination, to avoid audio feedback!
    this.micSource.connect(this.analyser);
    if (this.polyAnalyser) {
      this.micSource.connect(this.polyAnalyser);
    }
  }

  public async stopMicrophone(): Promise<void> {
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // Ignore
      }
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  /**
   * Robust fundamental pitch detection from FFT spectrum (dB values).
   * Searches for significant spectral peaks and checks subharmonic support
   * so strong 2nd/3rd harmonics don't mask the fundamental.
   */
  public detectFundamental(): {
    frequency: number;
    note: ReturnType<typeof frequencyToNote>;
    peakDb: number;
  } | null {
    if (!this.analyser || !this.ctx) return null;
    this.analyser.getFloatFrequencyData(this.spectrumBuf);

    const sampleRate = this.ctx.sampleRate;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / this.spectrumBuf.length;

    const minBin = Math.max(2, Math.floor(55 / binWidth));
    const maxBin = Math.min(this.spectrumBuf.length - 3, Math.ceil(2200 / binWidth));

    let maxDb = -Infinity;
    let maxIdx = -1;
    for (let i = minBin; i <= maxBin; i++) {
      if (this.spectrumBuf[i] > maxDb) {
        maxDb = this.spectrumBuf[i];
        maxIdx = i;
      }
    }

    if (maxIdx < 0 || maxDb < -68) return null;

    // Look for the lowest local peak within 14 dB of the global maximum that has harmonic support
    let chosenIdx = maxIdx;
    const threshold = maxDb - 14;
    for (let i = minBin + 1; i < maxIdx; i++) {
      const val = this.spectrumBuf[i];
      if (
        val >= threshold &&
        val > this.spectrumBuf[i - 1] &&
        val >= this.spectrumBuf[i + 1]
      ) {
        // Check if 2*i is close to maxIdx or also strong
        const h2Idx = Math.min(this.spectrumBuf.length - 1, i * 2);
        const h2Db = Math.max(this.spectrumBuf[h2Idx - 1] ?? -100, this.spectrumBuf[h2Idx] ?? -100, this.spectrumBuf[h2Idx + 1] ?? -100);
        if (h2Db > maxDb - 18 || Math.abs(maxIdx - i * 2) <= 2 || Math.abs(maxIdx - i * 3) <= 3) {
          chosenIdx = i;
          break;
        }
      }
    }

    // Parabolic interpolation for sub-bin frequency accuracy
    const y0 = this.spectrumBuf[chosenIdx - 1] ?? -100;
    const y1 = this.spectrumBuf[chosenIdx];
    const y2 = this.spectrumBuf[chosenIdx + 1] ?? -100;
    const denom = y0 - 2 * y1 + y2;
    const delta = denom !== 0 ? (0.5 * (y0 - y2)) / denom : 0;
    const refinedIdx = chosenIdx + Math.max(-0.5, Math.min(0.5, delta));

    const freq = refinedIdx * binWidth;
    if (freq < 50 || freq > 3500) return null;

    return {
      frequency: freq,
      note: frequencyToNote(freq),
      peakDb: maxDb,
    };
  }

  public isMicrophoneActive(): boolean {
    return Boolean(this.micStream && this.micSource);
  }

  /**
   * High-precision YIN (CMNDF) time-domain fundamental pitch detector.
   * Ideal for a chromatic guitar tuner because it resolves sub-cent accuracy
   * even at low guitar fundamentals (E2 = 82.41 Hz) where FFT bins are coarse.
   */
  public detectPitchAutocorrelation(a4 = 440): {
    frequency: number;
    note: ReturnType<typeof frequencyToNote>;
    confidence: number;
    rms: number;
  } | null {
    if (!this.analyser || !this.ctx) return null;
    this.analyser.getFloatTimeDomainData(this.timeBuf);

    const sampleRate = this.ctx.sampleRate;
    const len = this.timeBuf.length;
    const halfLen = Math.floor(len / 2);

    // 1. Noise gate via RMS
    let sumSq = 0;
    for (let i = 0; i < halfLen; i++) {
      const s = this.timeBuf[i];
      sumSq += s * s;
    }
    const rms = Math.sqrt(sumSq / halfLen);
    if (rms < 0.008) return null;

    const minLag = Math.max(8, Math.floor(sampleRate / 1200));
    const maxLag = Math.min(halfLen - 2, Math.ceil(sampleRate / 65));
    const windowSize = Math.min(1536, len - maxLag - 1);

    const cmndf = new Float32Array(maxLag + 1);
    cmndf[0] = 1;
    let runningSum = 0;

    for (let tau = 1; tau <= maxLag; tau++) {
      let diff = 0;
      for (let j = 0; j < windowSize; j++) {
        const delta = this.timeBuf[j] - this.timeBuf[j + tau];
        diff += delta * delta;
      }
      runningSum += diff;
      cmndf[tau] = runningSum > 0 ? (diff * tau) / runningSum : 1;
    }

    // 2. Find first dip below threshold (0.18) or fallback to global best dip (< 0.32)
    let bestTau = -1;
    const threshold = 0.18;
    for (let tau = minLag; tau < maxLag; tau++) {
      if (cmndf[tau] < threshold) {
        while (tau + 1 < maxLag && cmndf[tau + 1] < cmndf[tau]) {
          tau++;
        }
        bestTau = tau;
        break;
      }
    }

    if (bestTau === -1) {
      let minVal = 1;
      for (let tau = minLag; tau < maxLag; tau++) {
        if (cmndf[tau] < minVal) {
          minVal = cmndf[tau];
          bestTau = tau;
        }
      }
      if (minVal > 0.32) return null;
    }

    // 3. Parabolic interpolation around bestTau
    const y0 = cmndf[Math.max(1, bestTau - 1)];
    const y1 = cmndf[bestTau];
    const y2 = cmndf[Math.min(maxLag, bestTau + 1)];
    const denom = y0 - 2 * y1 + y2;
    const shift = denom !== 0 ? (0.5 * (y0 - y2)) / denom : 0;
    const refinedTau = bestTau + Math.max(-0.5, Math.min(0.5, shift));

    if (refinedTau <= 0) return null;
    const freq = sampleRate / refinedTau;
    if (freq < 60 || freq > 1300) return null;

    return {
      frequency: freq,
      note: frequencyToNote(freq, a4),
      confidence: Math.max(0, Math.min(1, 1 - y1)),
      rms,
    };
  }

  public getPolySpectrumData(): Float32Array<ArrayBuffer> | null {
    if (!this.polyAnalyser) return null;
    this.polyAnalyser.getFloatFrequencyData(this.polySpectrumBuf);
    return this.polySpectrumBuf;
  }

  public getPolyBinWidth(): number {
    const sr = this.ctx?.sampleRate ?? 48000;
    return sr / 16384;
  }

  /**
   * Simultaneous 6-string polyphonic FFT pitch detector.
   * Uses the 16384-point FFT (~2.93 Hz/bin at 48 kHz) with parabolic peak interpolation
   * across each string's ±75-cent fundamental search window.
   */
  public detectPolyphonicStrings(
    targets: Array<{ stringId: number; targetFreq: number }>,
    thresholdDb = -74
  ): Array<{
    stringId: number;
    targetFreq: number;
    detectedFreq: number | null;
    cents: number | null;
    peakDb: number;
    detected: boolean;
  }> {
    if (!this.polyAnalyser || !this.ctx) {
      return targets.map((t) => ({
        stringId: t.stringId,
        targetFreq: t.targetFreq,
        detectedFreq: null,
        cents: null,
        peakDb: -105,
        detected: false,
      }));
    }

    this.polyAnalyser.getFloatFrequencyData(this.polySpectrumBuf);
    const binWidth = this.ctx.sampleRate / 16384;
    const maxIdx = this.polySpectrumBuf.length - 2;

    return targets.map(({ stringId, targetFreq }) => {
      // ±75 cents window around target string frequency (well within neighboring string spacing)
      const fLow = targetFreq * Math.pow(2, -0.75 / 12);
      const fHigh = targetFreq * Math.pow(2, 0.75 / 12);
      const binStart = Math.max(2, Math.floor(fLow / binWidth));
      const binEnd = Math.min(maxIdx, Math.ceil(fHigh / binWidth));

      let bestBin = -1;
      let bestDb = -Infinity;
      for (let b = binStart; b <= binEnd; b++) {
        const val = this.polySpectrumBuf[b];
        if (Number.isFinite(val) && val > bestDb) {
          bestDb = val;
          bestBin = b;
        }
      }

      if (bestBin < 0 || bestDb < thresholdDb) {
        return {
          stringId,
          targetFreq,
          detectedFreq: null,
          cents: null,
          peakDb: Number.isFinite(bestDb) ? bestDb : -105,
          detected: false,
        };
      }

      // Parabolic interpolation on dB spectrum around bestBin
      const y0 = this.polySpectrumBuf[bestBin - 1];
      const y1 = this.polySpectrumBuf[bestBin];
      const y2 = this.polySpectrumBuf[bestBin + 1];
      const denom = y0 - 2 * y1 + y2;
      const delta = denom !== 0 && Number.isFinite(denom) ? (0.5 * (y0 - y2)) / denom : 0;
      const refinedBin = bestBin + Math.max(-0.5, Math.min(0.5, delta));
      const detectedFreq = refinedBin * binWidth;
      const cents = 1200 * Math.log2(detectedFreq / targetFreq);

      return {
        stringId,
        targetFreq,
        detectedFreq,
        cents,
        peakDb: bestDb,
        detected: true,
      };
    });
  }

  public isRecording(): boolean {
    return this.recordingActive;
  }

  public getRecordingLiveInfo(): { durationSec: number; peak: number } {
    const sr = this.ctx?.sampleRate ?? 48000;
    return {
      durationSec: this.recordingSampleCount / sr,
      peak: this.recordingPeak,
    };
  }

  public startRecording(includeMetronome = false): void {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    if (this.recordingActive) {
      this.stopRecording();
    }

    this.recordingChunks = [];
    this.recordingSampleCount = 0;
    this.recordingPeak = 0;
    this.recordingIncludeMetronome = includeMetronome;
    this.recordingActive = true;

    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const sink = ctx.createGain();
    sink.gain.value = 0;

    processor.onaudioprocess = (event) => {
      if (!this.recordingActive) return;
      const input = event.inputBuffer.getChannelData(0);
      const copy = new Float32Array(input.length);
      let chunkPeak = 0;
      for (let i = 0; i < input.length; i++) {
        const s = input[i];
        copy[i] = s;
        const abs = Math.abs(s);
        if (abs > chunkPeak) chunkPeak = abs;
      }
      this.recordingChunks.push(copy);
      this.recordingSampleCount += copy.length;
      this.recordingPeak = chunkPeak;
    };

    this.masterGain.connect(processor);
    if (includeMetronome && this.metronomeGain) {
      this.metronomeGain.connect(processor);
    }
    processor.connect(sink);
    sink.connect(ctx.destination);

    this.recordingProcessor = processor;
    this.recordingSink = sink;
  }

  public stopRecording(): {
    blob: Blob;
    samples: Float32Array;
    sampleRate: number;
    durationSec: number;
  } | null {
    if (!this.recordingActive) return null;
    this.recordingActive = false;

    if (this.recordingProcessor) {
      try {
        this.masterGain?.disconnect(this.recordingProcessor);
      } catch {
        // Ignore
      }
      if (this.recordingIncludeMetronome) {
        try {
          this.metronomeGain?.disconnect(this.recordingProcessor);
        } catch {
          // Ignore
        }
      }
      try {
        this.recordingProcessor.disconnect();
      } catch {
        // Ignore
      }
      this.recordingProcessor.onaudioprocess = null;
      this.recordingProcessor = null;
    }

    if (this.recordingSink) {
      try {
        this.recordingSink.disconnect();
      } catch {
        // Ignore
      }
      this.recordingSink = null;
    }

    const sampleRate = this.ctx?.sampleRate ?? 48000;
    const totalLength = this.recordingChunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.recordingChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    this.recordingChunks = [];
    this.recordingSampleCount = 0;

    const blob = this.encodeWavBlob(merged, sampleRate);
    return {
      blob,
      samples: merged,
      sampleRate,
      durationSec: totalLength / sampleRate,
    };
  }

  private encodeWavBlob(samples: Float32Array, sampleRate: number): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const dataLength = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (pos: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');

    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const clamped = Math.max(-1, Math.min(1, samples[i]));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }
}

export const audioEngine = new GuitarAudioEngine();
