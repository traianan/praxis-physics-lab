export const DEFAULT_FFT_SIZE = 8192;
export const NOTE_NAMES = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

/** FFT radix-2 in-place. Real and imaginary arrays must have a power-of-two length. */
export function fft(real, imaginary) {
  const n = real.length;
  if (n !== imaginary.length || n < 2 || (n & (n - 1)) !== 0) {
    throw new RangeError("FFT cere două tabluri egale cu o lungime putere a lui 2.");
  }

  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imaginary[i], imaginary[j]] = [imaginary[j], imaginary[i]];
    }
  }

  for (let length = 2; length <= n; length <<= 1) {
    const angle = (-2 * Math.PI) / length;
    const stepReal = Math.cos(angle);
    const stepImaginary = Math.sin(angle);
    const half = length / 2;

    for (let offset = 0; offset < n; offset += length) {
      let twiddleReal = 1;
      let twiddleImaginary = 0;
      for (let k = 0; k < half; k += 1) {
        const even = offset + k;
        const odd = even + half;
        const oddReal = real[odd] * twiddleReal - imaginary[odd] * twiddleImaginary;
        const oddImaginary = real[odd] * twiddleImaginary + imaginary[odd] * twiddleReal;

        real[odd] = real[even] - oddReal;
        imaginary[odd] = imaginary[even] - oddImaginary;
        real[even] += oddReal;
        imaginary[even] += oddImaginary;

        const nextTwiddleReal = twiddleReal * stepReal - twiddleImaginary * stepImaginary;
        twiddleImaginary = twiddleReal * stepImaginary + twiddleImaginary * stepReal;
        twiddleReal = nextTwiddleReal;
      }
    }
  }
}

export function hannWindow(size) {
  if (!Number.isInteger(size) || size < 1) throw new RangeError("Dimensiunea ferestrei trebuie să fie un întreg pozitiv.");
  const window = new Float64Array(size);
  if (size === 1) {
    window[0] = 1;
    return window;
  }
  for (let i = 0; i < size; i += 1) {
    window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }
  return window;
}

/** Single-sided amplitude spectrum of a Hann-windowed segment. */
export function spectrum(samples, start, size = DEFAULT_FFT_SIZE) {
  if (!Number.isInteger(size) || size < 2 || (size & (size - 1)) !== 0) {
    throw new RangeError("Dimensiunea FFT trebuie să fie o putere a lui 2.");
  }
  const real = new Float64Array(size);
  const imaginary = new Float64Array(size);
  const window = hannWindow(size);
  const first = Math.max(0, Math.floor(start));
  let windowSum = 0;

  for (let i = 0; i < size; i += 1) {
    real[i] = (samples[first + i] ?? 0) * window[i];
    windowSum += window[i];
  }

  fft(real, imaginary);
  const magnitudes = new Float64Array(size / 2);
  const normalization = 2 / Math.max(windowSum, Number.EPSILON);
  for (let i = 0; i < magnitudes.length; i += 1) {
    magnitudes[i] = Math.hypot(real[i], imaginary[i]) * normalization;
  }
  return magnitudes;
}

/** Mean spectrum over consecutive, non-overlapping frames. */
export function averageSpectrum(samples, sampleRate, size = DEFAULT_FFT_SIZE) {
  if (samples.length < size) return spectrum(samples, 0, size);
  const mean = new Float64Array(size / 2);
  let frames = 0;
  for (let start = 0; start + size <= samples.length; start += size) {
    const frame = spectrum(samples, start, size);
    for (let i = 0; i < mean.length; i += 1) mean[i] += frame[i];
    frames += 1;
  }
  for (let i = 0; i < mean.length; i += 1) mean[i] /= Math.max(frames, 1);
  return mean;
}

function amplitudeAt(magnitudes, frequency, binWidth, toleranceBins = 2) {
  const index = Math.round(frequency / binWidth);
  let maximum = 0;
  const from = Math.max(0, index - toleranceBins);
  const to = Math.min(magnitudes.length - 1, index + toleranceBins);
  for (let i = from; i <= to; i += 1) maximum = Math.max(maximum, magnitudes[i]);
  return maximum;
}

/** Local spectral peaks with parabolic frequency interpolation. */
export function findPeaks(magnitudes, sampleRate, fftSize, minFrequency = 60, maxFrequency = 2000, threshold = 0.035) {
  const binWidth = sampleRate / fftSize;
  const first = Math.max(1, Math.ceil(minFrequency / binWidth));
  const last = Math.min(magnitudes.length - 2, Math.floor(maxFrequency / binWidth));
  let rangeMaximum = 0;
  for (let i = first; i <= last; i += 1) rangeMaximum = Math.max(rangeMaximum, magnitudes[i]);
  if (rangeMaximum <= 1e-9) return [];

  const peaks = [];
  for (let i = first; i <= last; i += 1) {
    if (magnitudes[i] <= magnitudes[i - 1] || magnitudes[i] < magnitudes[i + 1]) continue;
    if (magnitudes[i] < rangeMaximum * threshold) continue;
    const left = magnitudes[i - 1];
    const center = magnitudes[i];
    const right = magnitudes[i + 1];
    const denominator = left - 2 * center + right;
    const offset = Math.abs(denominator) > 1e-12 ? 0.5 * (left - right) / denominator : 0;
    peaks.push({ frequency: (i + offset) * binWidth, amplitude: center });
  }
  return peaks.sort((a, b) => b.amplitude - a.amplitude);
}

/** Fundamental estimate based on the energy of the first harmonic series. */
export function estimateFundamental(magnitudes, sampleRate, fftSize, options = {}) {
  const minFrequency = options.minFrequency ?? 60;
  const maxFrequency = options.maxFrequency ?? 1400;
  const harmonicCount = options.harmonicCount ?? 6;
  const binWidth = sampleRate / fftSize;
  const candidates = findPeaks(magnitudes, sampleRate, fftSize, minFrequency, maxFrequency).slice(0, 18);
  if (candidates.length === 0) return null;

  let bestFrequency = null;
  let bestScore = -1;
  for (const candidate of candidates) {
    let score = 0;
    let presentHarmonics = 0;
    for (let harmonic = 1; harmonic <= harmonicCount; harmonic += 1) {
      const amplitude = amplitudeAt(magnitudes, candidate.frequency * harmonic, binWidth);
      score += amplitude / Math.sqrt(harmonic);
      if (amplitude > candidate.amplitude * 0.08) presentHarmonics += 1;
    }
    score *= 0.72 + 0.28 * (presentHarmonics / harmonicCount);
    if (score > bestScore) {
      bestScore = score;
      bestFrequency = candidate.frequency;
    }
  }
  return bestFrequency;
}

/** Amplitudes of k·f0, normalized to the strongest displayed harmonic. */
export function harmonicAmplitudes(magnitudes, sampleRate, fftSize, fundamental, count = 8) {
  const binWidth = sampleRate / fftSize;
  const values = [];
  for (let harmonic = 1; harmonic <= count; harmonic += 1) {
    values.push(amplitudeAt(magnitudes, fundamental * harmonic, binWidth));
  }
  const maximum = Math.max(...values, 1e-12);
  return Float64Array.from(values, (value) => value / maximum);
}

export function frequencyToNote(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;
  const exactMidi = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(exactMidi);
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  return {
    name: `${name}${octave}`,
    midi,
    cents: Math.round((exactMidi - midi) * 100)
  };
}

export function noteToFrequency(note) {
  const match = /^(Do|Re|Mi|Fa|Sol|La|Si|C|D|E|F|G|A|B)(#|b)?(-?\d+)$/i.exec(note.trim());
  if (!match) throw new RangeError("Nota trebuie să aibă forma Do4, Re#4 sau Sib4.");
  const semitones = { Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11, C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const normalized = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
  let pitch = semitones[normalized];
  if (match[2] === "#") pitch += 1;
  if (match[2] === "b") pitch -= 1;
  const octave = Number(match[3]);
  return 440 * 2 ** ((pitch + (octave + 1) * 12 - 69) / 12);
}

export function rms(samples, start = 0, length = samples.length - start) {
  const from = Math.max(0, Math.floor(start));
  const to = Math.min(samples.length, from + Math.max(0, Math.floor(length)));
  if (to <= from) return 0;
  let sum = 0;
  for (let i = from; i < to; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / (to - from));
}

/** STFT data for a time range. Values are decibels relative to the strongest frame. */
export function computeSpectrogram(samples, sampleRate, start, duration, options = {}) {
  const fftSize = options.fftSize ?? 2048;
  const hopSize = Math.max(1, Math.floor(options.hopSize ?? fftSize / 2));
  const firstSample = Math.max(0, Math.floor(start * sampleRate));
  const lastSample = Math.min(samples.length, Math.ceil((start + duration) * sampleRate));
  const sampleSpan = Math.max(1, lastSample - firstSample);
  const requestedFrames = options.frameCount ?? Math.ceil(sampleSpan / hopSize) + 1;
  const frameCount = Math.min(options.maxFrames ?? 1800, Math.max(24, Math.floor(requestedFrames)));
  const maxFrequency = options.maxFrequency ?? 5000;
  const frequencyBins = Math.min(fftSize / 2, Math.ceil(maxFrequency / (sampleRate / fftSize)));
  const values = new Float32Array(frameCount * frequencyBins);
  const times = new Float64Array(frameCount);
  const fundamentals = new Float32Array(frameCount);
  const window = hannWindow(fftSize);
  let globalMaximum = 1e-12;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const ratio = frameCount === 1 ? 0 : frame / (frameCount - 1);
    const center = firstSample + ratio * Math.max(0, sampleSpan - 1);
    const frameStart = Math.round(center - fftSize / 2);
    const real = new Float64Array(fftSize);
    const imaginary = new Float64Array(fftSize);
    for (let i = 0; i < fftSize; i += 1) real[i] = (samples[frameStart + i] ?? 0) * window[i];
    fft(real, imaginary);
    times[frame] = center / sampleRate;
    const magnitudes = new Float64Array(fftSize / 2);
    for (let bin = 0; bin < magnitudes.length; bin += 1) {
      const magnitude = Math.hypot(real[bin], imaginary[bin]);
      magnitudes[bin] = magnitude;
      globalMaximum = Math.max(globalMaximum, magnitude);
      if (bin < frequencyBins) values[frame * frequencyBins + bin] = magnitude;
    }
    if (rms(samples, Math.max(0, frameStart), fftSize) >= (options.minRms ?? 1e-5)) {
      fundamentals[frame] = estimateFundamental(magnitudes, sampleRate, fftSize) ?? 0;
    }
  }

  for (let i = 0; i < values.length; i += 1) {
    values[i] = 20 * Math.log10(Math.max(values[i] / globalMaximum, 1e-6));
  }

  return {
    values,
    times,
    fundamentals,
    frameCount,
    frequencyBins,
    hopSize,
    binWidth: sampleRate / fftSize,
    minDb: -80,
    maxDb: 0
  };
}
