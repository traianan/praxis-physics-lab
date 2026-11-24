const waveformCache = new WeakMap();

function cssColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function fitCanvas(canvas) {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(280, Math.round(bounds.width));
  const height = Math.max(150, Math.round(bounds.height));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height };
}

function font(size = 12, weight = 400) {
  return `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function axisText(context, value, x, y, align = "center") {
  context.fillStyle = cssColor("--muted", "#65758a");
  context.font = font(12);
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(value, x, y);
}

function drawGrid(context, plot, xTicks, yTicks, xLabel, yLabel, { yFromTop = false } = {}) {
  context.save();
  context.strokeStyle = cssColor("--grid", "#e1e7ee");
  context.lineWidth = 1;
  context.fillStyle = cssColor("--muted", "#65758a");
  context.font = font(12);
  context.textAlign = "center";
  context.textBaseline = "top";
  for (const tick of xTicks.values) {
    const x = plot.x + (tick.value / xTicks.max) * plot.width;
    context.beginPath();
    context.moveTo(x, plot.y);
    context.lineTo(x, plot.y + plot.height);
    context.stroke();
    context.fillText(tick.label, x, plot.y + plot.height + 9);
  }
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (const tick of yTicks.values) {
    const y = plot.y + (yFromTop ? tick.value / yTicks.max : 1 - tick.value / yTicks.max) * plot.height;
    context.beginPath();
    context.moveTo(plot.x, y);
    context.lineTo(plot.x + plot.width, y);
    context.stroke();
    context.fillText(tick.label, plot.x - 9, y);
  }
  context.textAlign = "center";
  context.textBaseline = "bottom";
  context.font = font(12, 600);
  context.fillText(xLabel, plot.x + plot.width / 2, plot.y + plot.height + 30);
  context.save();
  context.translate(14, plot.y + plot.height / 2);
  context.rotate(-Math.PI / 2);
  context.fillText(yLabel, 0, 0);
  context.restore();
  context.restore();
}

function spectrumPlot(canvas) {
  const { context, width, height } = fitCanvas(canvas);
  return { context, width, height, plot: { x: 52, y: 14, width: width - 70, height: height - 52 } };
}

export function drawSpectrum(canvas, magnitudes, sampleRate, fftSize, options = {}) {
  const { context, width, height, plot } = spectrumPlot(canvas);
  const maxFrequency = options.maxFrequency ?? 5000;
  const binWidth = sampleRate / fftSize;
  const lastBin = Math.min(magnitudes.length - 1, Math.floor(maxFrequency / binWidth));
  let maximum = 1e-12;
  for (let i = 1; i <= lastBin; i += 1) maximum = Math.max(maximum, magnitudes[i]);

  const xTicks = { max: maxFrequency, values: [] };
  for (let i = 0; i <= 5; i += 1) {
    const value = (maxFrequency / 5) * i;
    xTicks.values.push({ value, label: i === 0 ? "0" : `${Math.round(value / 100) / 10}k` });
  }
  const yTicks = { max: 80, values: [0, 20, 40, 60, 80].map((value) => ({ value, label: value === 0 ? "0 dB" : `−${value}` })) };
  drawGrid(context, plot, xTicks, yTicks, "Frecvență (Hz)", "Amplitudine", { yFromTop: true });

  const points = [];
  const pixels = Math.max(1, Math.floor(plot.width));
  for (let pixel = 0; pixel <= pixels; pixel += 1) {
    const frequency = (pixel / pixels) * maxFrequency;
    const center = Math.round(frequency / binWidth);
    const from = Math.max(1, center - 1);
    const to = Math.min(lastBin, center + 1);
    let peak = 1e-12;
    for (let bin = from; bin <= to; bin += 1) peak = Math.max(peak, magnitudes[bin]);
    const db = 20 * Math.log10(Math.max(peak / maximum, 1e-6));
    const x = plot.x + (pixel / pixels) * plot.width;
    const y = plot.y + (Math.min(80, -db) / 80) * plot.height;
    points.push([x, y]);
  }

  const accent = options.accent || cssColor("--accent", "#b75b2c");
  const gradient = context.createLinearGradient(0, plot.y, 0, plot.y + plot.height);
  gradient.addColorStop(0, `${accent}38`);
  gradient.addColorStop(1, `${accent}02`);
  context.beginPath();
  context.moveTo(points[0][0], plot.y + plot.height);
  for (const [x, y] of points) context.lineTo(x, y);
  context.lineTo(points[points.length - 1][0], plot.y + plot.height);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.strokeStyle = accent;
  context.lineWidth = 1.6;
  context.lineJoin = "round";
  context.stroke();

  if (options.fundamental && options.showHarmonics !== false) {
    context.save();
    context.font = font(12, 600);
    context.textBaseline = "top";
    for (let harmonic = 1; harmonic <= (options.harmonicMarkers ?? 6); harmonic += 1) {
      const frequency = options.fundamental * harmonic;
      if (frequency > maxFrequency) break;
      const x = plot.x + (frequency / maxFrequency) * plot.width;
      context.setLineDash([3, 4]);
      context.strokeStyle = harmonic === 1 ? accent : cssColor("--marker", "#8997a8");
      context.beginPath();
      context.moveTo(x, plot.y);
      context.lineTo(x, plot.y + plot.height);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = harmonic === 1 ? accent : cssColor("--muted", "#65758a");
      context.textAlign = x > width - 50 ? "right" : "left";
      context.fillText(harmonic === 1 ? "f₀" : `${harmonic}f₀`, x + (x > width - 50 ? -4 : 4), plot.y + 3);
    }
    context.restore();
  }

  context.fillStyle = cssColor("--muted", "#65758a");
  context.font = font(12);
  context.textAlign = "right";
  context.textBaseline = "top";
  context.fillText("scară dB relativă", width - 12, 2);
}

export function drawHarmonics(canvas, amplitudes, fundamental, options = {}) {
  const { context, width, height } = fitCanvas(canvas);
  const plot = { x: 42, y: 18, width: width - 58, height: height - 58 };
  const accent = options.accent || cssColor("--accent", "#b75b2c");
  const progress = options.progress ?? 1;
  const count = amplitudes.length;
  const slot = plot.width / count;
  const barWidth = Math.min(48, slot * 0.58);

  context.strokeStyle = cssColor("--grid", "#e1e7ee");
  context.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const y = plot.y + plot.height - (step / 4) * plot.height;
    context.beginPath();
    context.moveTo(plot.x, y);
    context.lineTo(plot.x + plot.width, y);
    context.stroke();
    axisText(context, `${step / 4}`, plot.x - 10, y, "right");
  }

  amplitudes.forEach((amplitude, index) => {
    const value = Math.max(0, Math.min(1, amplitude)) * progress;
    const x = plot.x + slot * index + (slot - barWidth) / 2;
    const barHeight = Math.max(1, value * plot.height);
    const y = plot.y + plot.height - barHeight;
    roundedRect(context, x, y, barWidth, barHeight, 4);
    context.fillStyle = index === 0 ? accent : `${accent}b8`;
    context.fill();
    context.fillStyle = cssColor("--ink", "#17243a");
    context.font = font(12, 600);
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText(value.toFixed(2), x + barWidth / 2, Math.max(plot.y + 12, y - 5));
    context.fillStyle = cssColor("--muted", "#65758a");
    context.font = font(12);
    context.textBaseline = "top";
    context.fillText(`k=${index + 1}`, x + barWidth / 2, plot.y + plot.height + 9);
    context.font = font(12);
    if (slot >= 44) context.fillText(`${Math.round(fundamental * (index + 1))} Hz`, x + barWidth / 2, plot.y + plot.height + 25);
  });

  context.fillStyle = cssColor("--muted", "#65758a");
  context.font = font(12);
  context.textAlign = "right";
  context.fillText("amplitudine relativă", width - 10, 3);
}

const spectrogramStops = [
  [0, [13, 24, 39]],
  [0.28, [22, 62, 82]],
  [0.55, [28, 119, 126]],
  [0.78, [91, 190, 170]],
  [1, [246, 210, 94]]
];

function spectralColor(value) {
  const normalized = Math.max(0, Math.min(1, (value + 80) / 80));
  let lower = spectrogramStops[0];
  let upper = spectrogramStops[spectrogramStops.length - 1];
  for (let i = 1; i < spectrogramStops.length; i += 1) {
    if (normalized <= spectrogramStops[i][0]) {
      lower = spectrogramStops[i - 1];
      upper = spectrogramStops[i];
      break;
    }
  }
  const ratio = (normalized - lower[0]) / Math.max(upper[0] - lower[0], 1e-6);
  return lower[1].map((channel, index) => Math.round(channel + (upper[1][index] - channel) * ratio));
}

export function drawSpectrogram(canvas, spectrogram, options = {}) {
  const { context, width, height } = fitCanvas(canvas);
  const plot = { x: 52, y: 14, width: width - 70, height: height - 52 };
  const duration = options.duration ?? spectrogram.times[spectrogram.times.length - 1] ?? 1;
  const offscreen = document.createElement("canvas");
  offscreen.width = spectrogram.frameCount;
  offscreen.height = spectrogram.frequencyBins;
  const offscreenContext = offscreen.getContext("2d");
  const image = offscreenContext.createImageData(spectrogram.frameCount, spectrogram.frequencyBins);

  for (let frame = 0; frame < spectrogram.frameCount; frame += 1) {
    for (let bin = 0; bin < spectrogram.frequencyBins; bin += 1) {
      const db = spectrogram.values[frame * spectrogram.frequencyBins + bin];
      const color = spectralColor(db);
      const target = ((spectrogram.frequencyBins - 1 - bin) * spectrogram.frameCount + frame) * 4;
      image.data[target] = color[0];
      image.data[target + 1] = color[1];
      image.data[target + 2] = color[2];
      image.data[target + 3] = 255;
    }
  }
  offscreenContext.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(offscreen, plot.x, plot.y, plot.width, plot.height);
  context.imageSmoothingEnabled = true;

  const maxFrequency = spectrogram.frequencyBins * spectrogram.binWidth;
  const xTicks = { max: duration, values: [] };
  for (let i = 0; i <= 4; i += 1) {
    const value = (duration / 4) * i;
    const label = duration < 10 ? `${value.toFixed(1)} s` : `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
    xTicks.values.push({ value, label });
  }
  const yTicks = { max: maxFrequency, values: [] };
  for (const frequency of [0, 500, 1000, 2000, 4000]) {
    if (frequency <= maxFrequency) yTicks.values.push({ value: frequency, label: frequency === 0 ? "0" : `${frequency / 1000}k` });
  }
  const translate = (text) => window.PraxisI18n?.tr(text) ?? text;
  drawGrid(context, plot, xTicks, yTicks, translate(options.xLabel ?? "Timp în piesă"), translate("Frecvență (Hz)"));

  if (Number.isFinite(options.selectionStart) && options.selectionDuration > 0 && duration > 0) {
    const start = Math.max(0, options.selectionStart);
    const end = Math.min(duration, start + options.selectionDuration);
    const x1 = plot.x + (start / duration) * plot.width;
    const x2 = plot.x + (end / duration) * plot.width;
    context.save();
    context.fillStyle = "rgba(255,255,255,.18)";
    context.fillRect(x1, plot.y, Math.max(2, x2 - x1), plot.height);
    context.setLineDash([5, 4]);
    context.strokeStyle = "rgba(255,255,255,.95)";
    context.lineWidth = 1.4;
    context.beginPath();
    context.moveTo(x1, plot.y);
    context.lineTo(x1, plot.y + plot.height);
    context.moveTo(x2, plot.y);
    context.lineTo(x2, plot.y + plot.height);
    context.stroke();
    context.restore();
  }

  const fundamentals = options.fundamentals ?? spectrogram.fundamentals;
  if (fundamentals?.length) {
    context.save();
    context.lineJoin = "round";
    context.lineCap = "round";
    for (const [strokeStyle, lineWidth] of [["rgba(13,24,39,.9)", 4], ["rgba(255,255,255,.95)", 2]]) {
      context.beginPath();
      let drawing = false;
      for (let frame = 0; frame < fundamentals.length; frame += 1) {
        const frequency = fundamentals[frame];
        if (!frequency || frequency > maxFrequency) {
          drawing = false;
          continue;
        }
        const x = plot.x + (spectrogram.times[frame] / duration) * plot.width;
        const y = plot.y + plot.height - (frequency / maxFrequency) * plot.height;
        if (drawing) context.lineTo(x, y);
        else context.moveTo(x, y);
        drawing = true;
      }
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;
      context.stroke();
    }
    context.restore();
  } else if (options.fundamental) {
    const y = plot.y + plot.height - (options.fundamental / maxFrequency) * plot.height;
    context.save();
    context.setLineDash([5, 4]);
    context.strokeStyle = "rgba(255,255,255,.9)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(plot.x, y);
    context.lineTo(plot.x + plot.width, y);
    context.stroke();
    context.restore();
  }
}

function getWaveformPeaks(samples, pointCount = 1600) {
  const cached = waveformCache.get(samples);
  if (cached?.length === pointCount) return cached;
  const peaks = new Float32Array(pointCount * 2);
  const bucketSize = samples.length / pointCount;
  for (let point = 0; point < pointCount; point += 1) {
    const from = Math.floor(point * bucketSize);
    const to = Math.min(samples.length, Math.max(from + 1, Math.floor((point + 1) * bucketSize)));
    let minimum = 1;
    let maximum = -1;
    for (let i = from; i < to; i += 1) {
      minimum = Math.min(minimum, samples[i]);
      maximum = Math.max(maximum, samples[i]);
    }
    peaks[point * 2] = minimum;
    peaks[point * 2 + 1] = maximum;
  }
  waveformCache.set(samples, peaks);
  return peaks;
}

export function drawWaveform(canvas, samples, options = {}) {
  const { context, width, height } = fitCanvas(canvas);
  const padding = 10;
  const plotWidth = width - padding * 2;
  const center = height / 2;
  const amplitude = height * 0.39;
  const duration = options.duration || samples.length / (options.sampleRate || 44100);
  const peaks = getWaveformPeaks(samples, Math.max(400, Math.floor(plotWidth)));

  context.strokeStyle = cssColor("--grid", "#e1e7ee");
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding, center);
  context.lineTo(width - padding, center);
  context.stroke();

  context.strokeStyle = cssColor("--wave", "#9aa9ba");
  context.lineWidth = 1;
  context.beginPath();
  for (let point = 0; point < peaks.length / 2; point += 1) {
    const x = padding + (point / (peaks.length / 2 - 1)) * plotWidth;
    context.moveTo(x, center - peaks[point * 2 + 1] * amplitude);
    context.lineTo(x, center - peaks[point * 2] * amplitude);
  }
  context.stroke();

  const start = Math.max(0, Math.min(duration, options.selectionStart || 0));
  const selectionDuration = Math.max(0, Math.min(duration - start, options.selectionDuration || 0));
  const selectionX = padding + (start / duration) * plotWidth;
  const selectionWidth = (selectionDuration / duration) * plotWidth;
  context.fillStyle = `${options.accent || cssColor("--accent", "#b75b2c")}20`;
  context.fillRect(selectionX, 4, selectionWidth, height - 8);
  context.strokeStyle = options.accent || cssColor("--accent", "#b75b2c");
  context.lineWidth = 1.4;
  context.strokeRect(selectionX, 4, selectionWidth, height - 8);
  context.fillStyle = options.accent || cssColor("--accent", "#b75b2c");
  roundedRect(context, selectionX - 3, center - 14, 6, 28, 3);
  context.fill();
  roundedRect(context, selectionX + selectionWidth - 3, center - 14, 6, 28, 3);
  context.fill();

  const currentTime = Math.max(0, Math.min(duration, options.currentTime || 0));
  const playheadX = padding + (currentTime / duration) * plotWidth;
  context.strokeStyle = cssColor("--ink", "#17243a");
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(playheadX, 2);
  context.lineTo(playheadX, height - 2);
  context.stroke();
}
