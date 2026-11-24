import { FAMILIES, PIECES, piecesForFamily } from "./data.js";
import {
  DEFAULT_FFT_SIZE,
  averageSpectrum,
  computeSpectrogram,
  estimateFundamental,
  frequencyToNote,
  harmonicAmplitudes,
  spectrum
} from "./fourier.js";
import { drawHarmonics, drawSpectrogram, drawSpectrum, drawWaveform as drawWaveformChart } from "./charts.js";

const $ = (id) => document.getElementById(id);
const tr = (text, values) => window.PraxisI18n?.tr(text, values) ?? text;
const elements = {
  familyButtons: [...document.querySelectorAll("[data-family]")],
  pieceSelect: $("pieceSelect"),
  trackTitle: $("trackTitle"),
  trackComposer: $("trackComposer"),
  trackDescription: $("trackDescription"),
  demoBadge: document.querySelector(".demo-badge"),
  audio: $("audio"),
  playButton: $("playButton"),
  playIcon: $("playIcon"),
  volumeRange: $("volumeRange"),
  volumeValue: $("volumeValue"),
  resetLabButton: $("resetLabButton"),
  seekRange: $("seekRange"),
  currentTime: $("currentTime"),
  totalTime: $("totalTime"),
  waveform: $("waveformCanvas"),
  startInput: $("startInput"),
  durationInput: $("durationInput"),
  analyzeButton: $("analyzeButton"),
  resetButton: $("resetButton"),
  dropZone: $("dropZone"),
  fileInput: $("fileInput"),
  selectionCaption: $("selectionCaption"),
  statusPill: $("statusPill"),
  noteValue: $("noteValue"),
  frequencyValue: $("frequencyValue"),
  resolutionValue: $("resolutionValue"),
  analyzedDurationValue: $("analyzedDurationValue"),
  errorBox: $("errorBox"),
  spectrumCanvas: $("spectrumCanvas"),
  harmonicsCanvas: $("harmonicsCanvas"),
  averageCanvas: $("averageCanvas"),
  spectrogramCanvas: $("spectrogramCanvas"),
  timeTab: $("result-tab-time"),
  spectrogramStatus: $("spectrogramStatus"),
  spectrumSummary: $("spectrumSummary"),
  harmonicsSummary: $("harmonicsSummary"),
  averageSummary: $("averageSummary"),
  spectrogramSummary: $("spectrogramSummary"),
  insightText: $("insightText")
};

const state = {
  family: "strings",
  piece: null,
  samples: null,
  sampleRate: 0,
  duration: 0,
  average: null,
  trackSpectrogram: null,
  trackSpectrogramPromise: null,
  analysis: null,
  selectionStart: 0,
  selectionDuration: 1,
  objectUrl: null,
  customPiece: null,
  loadToken: 0,
  analyzing: false,
  drag: null,
  harmonicAnimation: 0,
  analysisTimer: 0
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function formatTime(seconds) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const remainder = Math.floor(safe % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function nextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function setStatus(message, status = "ready") {
  elements.statusPill.textContent = tr(message);
  elements.statusPill.dataset.state = status;
}

function showError(message) {
  elements.errorBox.textContent = tr(message);
  elements.errorBox.hidden = false;
}

function clearError() {
  elements.errorBox.hidden = true;
  elements.errorBox.textContent = "";
}

function setBusy(busy) {
  elements.analyzeButton.disabled = busy || !state.samples;
  elements.resetLabButton.disabled = busy;
  elements.analyzeButton.querySelector("span").textContent = tr(busy ? "Se analizează…" : "Reanalizează fragmentul");
}

function updateVolume() {
  const volume = clamp(Number(elements.volumeRange.value), 0, 1);
  elements.audio.volume = volume;
  elements.volumeValue.value = `${Math.round(volume * 100)}%`;
  elements.volumeValue.textContent = elements.volumeValue.value;
}

async function resetLaboratory() {
  if (elements.resetLabButton.disabled) return;
  elements.resetLabButton.disabled = true;
  window.clearTimeout(state.analysisTimer);
  state.analysisTimer = 0;
  elements.audio.pause();
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = null;
  state.customPiece = null;
  elements.fileInput.value = "";
  elements.volumeRange.value = "0.8";
  updateVolume();
  state.family = "strings";
  setAccent(state.family);
  document.getElementById("result-tab-note")?.click();
  const firstPiece = renderPieceOptions("bach-air");
  await loadPiece(firstPiece);
}

function setAccent(family) {
  const config = FAMILIES[family];
  const root = document.documentElement;
  root.style.setProperty("--accent", config.accent);
  root.style.setProperty("--accent-soft", config.soft);
  root.style.setProperty("--accent-ink", family === "strings" ? "#8d421d" : "#0d5b60");
  elements.familyButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.family === family));
  });
}

function renderPieceOptions(selectedId) {
  const options = piecesForFamily(state.family);
  if (state.customPiece?.family === state.family) options.push(state.customPiece);
  elements.pieceSelect.replaceChildren();
  for (const piece of options) {
    const option = document.createElement("option");
    option.value = piece.id;
    option.textContent = `${piece.title} — ${piece.instrument}`;
    elements.pieceSelect.append(option);
  }
  const next = options.find((piece) => piece.id === selectedId) || options[0];
  elements.pieceSelect.value = next.id;
  return next;
}

function updateTrackInfo(piece) {
  elements.trackTitle.textContent = piece.title;
  elements.trackComposer.textContent = `${piece.composer} · ${piece.instrument}`;
  elements.trackDescription.textContent = piece.description;
  elements.demoBadge.hidden = piece.id === "uploaded";
}

function updatePlayButton() {
  const playing = !elements.audio.paused && !elements.audio.ended;
  elements.playIcon.setAttribute("href", playing ? "#icon-pause" : "#icon-play");
  elements.playButton.setAttribute("aria-label", playing ? "Pune piesa pe pauză" : "Redă piesa");
}

function updateSelectionInputs() {
  elements.startInput.value = state.selectionStart.toFixed(2);
  elements.durationInput.value = state.selectionDuration.toFixed(2);
  elements.startInput.max = Math.max(0, state.duration - 0.25).toFixed(2);
  elements.durationInput.max = Math.min(4, state.duration).toFixed(2);
}

function normalizeSelection() {
  if (!state.duration) return false;
  const minimumDuration = Math.min(0.25, state.duration);
  let start = Number.parseFloat(elements.startInput.value);
  let duration = Number.parseFloat(elements.durationInput.value);
  if (!Number.isFinite(start)) start = 0;
  if (!Number.isFinite(duration)) duration = minimumDuration;
  start = clamp(start, 0, Math.max(0, state.duration - minimumDuration));
  duration = clamp(duration, minimumDuration, Math.min(4, state.duration - start));
  state.selectionStart = start;
  state.selectionDuration = duration;
  updateSelectionInputs();
  return true;
}

function setDefaultSelection() {
  state.selectionStart = clamp(state.piece.defaultStart || 0, 0, Math.max(0, state.duration - 0.25));
  state.selectionDuration = clamp(state.piece.defaultDuration || 1, Math.min(0.25, state.duration), Math.min(4, state.duration - state.selectionStart));
  updateSelectionInputs();
}

function drawWaveform() {
  if (!state.samples) return;
  drawWaveformChart(elements.waveform, state.samples, {
    duration: state.duration,
    sampleRate: state.sampleRate,
    selectionStart: state.selectionStart,
    selectionDuration: state.selectionDuration,
    currentTime: elements.audio.currentTime || 0,
    accent: FAMILIES[state.family].accent
  });
}

function drawTrackSpectrogram() {
  if (!state.trackSpectrogram) return;
  drawSpectrogram(elements.spectrogramCanvas, state.trackSpectrogram, {
    duration: state.duration,
    fundamentals: state.trackSpectrogram.fundamentals,
    selectionStart: state.selectionStart,
    selectionDuration: state.selectionDuration
  });
}

async function prepareTrackSpectrogram() {
  if (!state.samples) return;
  if (state.trackSpectrogram) {
    drawTrackSpectrogram();
    return;
  }
  if (state.trackSpectrogramPromise) return state.trackSpectrogramPromise;

  const samples = state.samples;
  const sampleRate = state.sampleRate;
  const duration = state.duration;
  elements.spectrogramStatus.textContent = tr("Se calculează spectrograma completă…");
  state.trackSpectrogramPromise = (async () => {
    try {
      await nextPaint();
      const spectrogram = computeSpectrogram(samples, sampleRate, 0, duration, {
        fftSize: 2048,
        hopSize: 512,
        maxFrames: 1800,
        maxFrequency: 5000
      });
      if (state.samples !== samples) return;
      state.trackSpectrogram = spectrogram;
      drawTrackSpectrogram();
      elements.spectrogramStatus.textContent = tr("Analiză completă: {frames} cadre pe {duration} secunde.", {
        frames: spectrogram.frameCount,
        duration: duration.toFixed(1)
      });
    } catch {
      if (state.samples === samples) elements.spectrogramStatus.textContent = tr("Calculul spectrogramei a eșuat. Încearcă o înregistrare mai scurtă.");
    }
  })().finally(() => {
    state.trackSpectrogramPromise = null;
  });
  return state.trackSpectrogramPromise;
}

function setSelectionCenter(center) {
  state.selectionStart = clamp(center - state.selectionDuration / 2, 0, Math.max(0, state.duration - state.selectionDuration));
  updateSelectionInputs();
  drawWaveform();
  drawTrackSpectrogram();
  scheduleAnalysis();
}

function selectTrackTime(event) {
  if (!state.trackSpectrogram) return;
  const bounds = elements.spectrogramCanvas.getBoundingClientRect();
  const ratio = clamp((event.clientX - bounds.left - 52) / Math.max(1, bounds.width - 70), 0, 1);
  setSelectionCenter(ratio * state.duration);
}

function handleTrackSpectrogramKeyboard(event) {
  if (!state.samples) return;
  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    setSelectionCenter(event.key === "Home" ? 0 : state.duration);
    return;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const step = event.shiftKey ? 1 : Math.max(0.1, state.selectionDuration / 2);
  const direction = event.key === "ArrowLeft" ? -1 : 1;
  setSelectionCenter(state.selectionStart + state.selectionDuration / 2 + direction * step);
}

async function decodeAudio(arrayBuffer) {
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineContext) throw new Error("Browserul nu pune la dispoziție Web Audio API. Folosește o versiune recentă de Chrome, Edge, Firefox sau Safari.");
  const context = new OfflineContext(1, 1, 44100);
  try {
    return await context.decodeAudioData(arrayBuffer.slice(0));
  } catch {
    throw new Error("Fișierul nu poate fi decodat. Încearcă un WAV sau MP3 valid.");
  } finally {
    if (typeof context.close === "function") await context.close();
  }
}

function mixToMono(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const mixed = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) mixed[i] += data[i] / buffer.numberOfChannels;
  }
  return mixed;
}

async function loadPiece(piece) {
  const token = ++state.loadToken;
  state.piece = piece;
  state.samples = null;
  state.average = null;
  state.trackSpectrogram = null;
  state.trackSpectrogramPromise = null;
  state.analysis = null;
  clearError();
  setStatus("Se încarcă", "loading");
  setBusy(true);
  elements.playButton.disabled = true;
  elements.resetButton.disabled = true;
  elements.seekRange.disabled = true;
  elements.audio.pause();
  updateTrackInfo(piece);

  try {
    let arrayBuffer;
    if (piece.file instanceof File) {
      if (!state.objectUrl) state.objectUrl = URL.createObjectURL(piece.file);
      elements.audio.src = state.objectUrl;
      arrayBuffer = await piece.file.arrayBuffer();
    } else {
      elements.audio.src = piece.file;
      const response = await fetch(piece.file);
      if (!response.ok) throw new Error(`Fișierul audio nu a fost găsit (${response.status}).`);
      arrayBuffer = await response.arrayBuffer();
    }
    elements.audio.load();
    const buffer = await decodeAudio(arrayBuffer);
    if (token !== state.loadToken) return;

    state.samples = mixToMono(buffer);
    state.sampleRate = buffer.sampleRate;
    state.duration = buffer.duration;
    setDefaultSelection();
    elements.totalTime.textContent = formatTime(state.duration);
    elements.seekRange.max = String(state.duration);
    elements.seekRange.value = "0";
    elements.currentTime.textContent = "0:00";
    elements.playButton.disabled = false;
    elements.resetButton.disabled = false;
    elements.seekRange.disabled = false;
    drawWaveform();
    await analyze({ automatic: true });
    if (elements.timeTab.getAttribute("aria-selected") === "true") await prepareTrackSpectrogram();
  } catch (error) {
    if (token !== state.loadToken) return;
    setStatus("Eroare", "error");
    showError(error.message || "Încărcarea piesei a eșuat.");
    setBusy(false);
  }
}

function chooseFamily(family) {
  if (!FAMILIES[family]) return;
  state.family = family;
  setAccent(family);
  const piece = renderPieceOptions();
  loadPiece(piece);
}

function chooseFftSize() {
  const desired = state.selectionDuration * state.sampleRate;
  return 2 ** Math.round(Math.log2(clamp(desired, 2048, 32768)));
}

function strongestHarmonic(amplitudes) {
  let index = 0;
  for (let i = 1; i < amplitudes.length; i += 1) {
    if (amplitudes[i] > amplitudes[index]) index = i;
  }
  return index + 1;
}

function buildInsight(fundamental, amplitudes) {
  if (!fundamental) return tr("Nu s-a detectat o notă stabilă. Încearcă un fragment mai lung sau o porțiune cu o notă susținută.");
  const dominant = strongestHarmonic(amplitudes);
  const second = amplitudes[1] || 0;
  if (state.family === "winds") {
    return tr("Fundamentala domină spectrul, iar a doua armonică are {percent}% din amplitudinea maximă. Acest raport contribuie la timbrul flautului, apropiat de o undă sinusoidală.", { percent: Math.round(second * 100) });
  }
  if (dominant > 1) {
    return tr("Cea mai puternică componentă afișată este armonica {harmonic}. Instrumentele cu corzi pot pune multă energie în armonice superioare, nu doar în fundamentală.", { harmonic: dominant });
  }
  return tr("Fundamentala este cea mai puternică componentă a fragmentului. Compară alt instrument la aceeași notă: înălțimea poate fi identică, dar forma spectrului se schimbă.");
}

function animateHarmonics(amplitudes, fundamental) {
  cancelAnimationFrame(state.harmonicAnimation);
  if (reducedMotion.matches) {
    drawHarmonics(elements.harmonicsCanvas, amplitudes, fundamental, { accent: FAMILIES[state.family].accent, progress: 1 });
    return;
  }
  const started = performance.now();
  const duration = 420;
  const frame = (now) => {
    const progress = clamp((now - started) / duration, 0, 1);
    const eased = 1 - 2 ** (-10 * progress);
    drawHarmonics(elements.harmonicsCanvas, amplitudes, fundamental, { accent: FAMILIES[state.family].accent, progress: eased });
    if (progress < 1) state.harmonicAnimation = requestAnimationFrame(frame);
  };
  state.harmonicAnimation = requestAnimationFrame(frame);
}

async function analyze({ automatic = false } = {}) {
  if (!state.samples || state.analyzing) return;
  if (!normalizeSelection()) return;
  clearError();
  state.analyzing = true;
  setBusy(true);
  setStatus(automatic ? "Se pregătește analiza" : "Se analizează", "loading");
  await nextPaint();

  try {
    const fftSize = chooseFftSize();
    const windowDuration = fftSize / state.sampleRate;
    const center = state.selectionStart + state.selectionDuration / 2;
    const windowStart = clamp(center - windowDuration / 2, 0, Math.max(0, state.duration - windowDuration));
    const magnitudes = spectrum(state.samples, Math.floor(windowStart * state.sampleRate), fftSize);
    const fundamental = estimateFundamental(magnitudes, state.sampleRate, fftSize);
    const amplitudes = fundamental
      ? harmonicAmplitudes(magnitudes, state.sampleRate, fftSize, fundamental, 8)
      : new Float64Array(8);
    if (!state.average) state.average = averageSpectrum(state.samples, state.sampleRate, DEFAULT_FFT_SIZE);

    state.analysis = { magnitudes, fundamental, amplitudes, fftSize, windowStart };
    const note = fundamental ? frequencyToNote(fundamental) : null;
    const end = state.selectionStart + state.selectionDuration;
    const accent = FAMILIES[state.family].accent;

    drawSpectrum(elements.spectrumCanvas, magnitudes, state.sampleRate, fftSize, {
      fundamental,
      accent,
      maxFrequency: 5000,
      harmonicMarkers: 6
    });
    animateHarmonics(amplitudes, fundamental || 220);
    drawTrackSpectrogram();
    drawSpectrum(elements.averageCanvas, state.average, state.sampleRate, DEFAULT_FFT_SIZE, {
      accent,
      maxFrequency: 5000,
      showHarmonics: false
    });
    drawWaveform();

    elements.noteValue.textContent = note ? note.name : "—";
    elements.frequencyValue.textContent = fundamental ? `${fundamental.toFixed(1)} Hz` : "—";
    elements.resolutionValue.textContent = `${(state.sampleRate / fftSize).toFixed(2)} Hz`;
    elements.analyzedDurationValue.textContent = `${state.selectionDuration.toFixed(2)} s`;
    elements.selectionCaption.textContent = `${state.piece.title} · ${formatTime(state.selectionStart)}–${formatTime(end)}${note ? ` · ${note.cents > 0 ? "+" : ""}${note.cents} ct` : ""}`;
    elements.spectrumSummary.textContent = fundamental
      ? tr("Spectrul fragmentului conține o componentă dominantă la {frequency} hertz, nota {note}. Liniile punctate marchează armonicele.", { frequency: fundamental.toFixed(1), note: note.name })
      : tr("Spectrul fragmentului nu a permis detectarea unei fundamente clare.");
    const ranked = [...amplitudes].map((value, index) => ({ value, harmonic: index + 1 })).sort((a, b) => b.value - a.value).slice(0, 3);
    elements.harmonicsSummary.textContent = fundamental
      ? tr("Cele mai puternice armonice: {items}.", { items: ranked.map((item) => `k=${item.harmonic}, ${Math.round(item.value * 100)}%`).join("; ") })
      : tr("Nu există armonice de afișat pentru o fundamentală nedetectată.");
    elements.averageSummary.textContent = tr("Spectrul mediu arată amplitudinea frecvențelor pe toată durata piesei, calculată din ferestre FFT nesuprapuse.");
    elements.spectrogramSummary.textContent = tr("Spectrograma arată întreaga piesă și intensitatea frecvențelor între 0 și 5000 hertz.");
    elements.insightText.textContent = buildInsight(fundamental, amplitudes);

    if (!fundamental) {
      showError("Nu s-a detectat o notă stabilă în acest fragment. Spectrul și spectrograma rămân vizibile; încearcă o durată mai lungă sau o notă susținută.");
      setStatus("Fără notă stabilă", "error");
    } else {
      setStatus("Analiză finalizată", "success");
    }
  } catch (error) {
    showError(error.message || "Analiza a eșuat. Încearcă un alt fragment.");
    setStatus("Eroare", "error");
  } finally {
    state.analyzing = false;
    setBusy(false);
  }
}

function scheduleAnalysis() {
  window.clearTimeout(state.analysisTimer);
  state.analysisTimer = window.setTimeout(() => analyze(), 180);
}

function timeFromPointer(event) {
  const bounds = elements.waveform.getBoundingClientRect();
  const padding = 10;
  const ratio = clamp((event.clientX - bounds.left - padding) / Math.max(1, bounds.width - padding * 2), 0, 1);
  return ratio * state.duration;
}

function beginWaveformDrag(event) {
  if (!state.samples || ((event.pointerType === "mouse" || event.pointerType === "pen") && event.button !== 0)) return;
  const time = timeFromPointer(event);
  const end = state.selectionStart + state.selectionDuration;
  const trackWidth = Math.max(1, elements.waveform.clientWidth - 20);
  const selectionWidth = (state.selectionDuration / state.duration) * trackWidth;
  const edgePad = event.pointerType === "touch" || event.pointerType === "pen" ? 16 : 7;
  const edgeHit = Math.min(edgePad, Math.max(2, selectionWidth * 0.28));
  const offset = ((time - state.selectionStart) / state.duration) * trackWidth;
  let mode = "seek";
  const inside = time >= state.selectionStart && time <= end;
  if (event.pointerType === "touch" && inside) mode = "move";
  else if (inside && offset <= edgeHit) mode = "start";
  else if (inside && selectionWidth - offset <= edgeHit) mode = "end";
  else if (inside) mode = "move";
  else if (Math.abs(offset) <= edgePad) mode = "start";
  else if (Math.abs(offset - selectionWidth) <= edgePad) mode = "end";

  if (mode === "seek") {
    elements.audio.currentTime = time;
    elements.seekRange.value = String(time);
    elements.currentTime.textContent = formatTime(time);
    drawWaveform();
    return;
  }

  state.drag = {
    mode,
    pointerId: event.pointerId,
    time,
    start: state.selectionStart,
    end,
    changed: false
  };
  if (elements.waveform.setPointerCapture) elements.waveform.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function moveWaveformDrag(event) {
  const drag = state.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const time = timeFromPointer(event);
  const delta = time - drag.time;
  const minimum = Math.min(0.25, state.duration);
  if (drag.mode === "start") {
    state.selectionStart = clamp(drag.start + delta, 0, drag.end - minimum);
    state.selectionDuration = drag.end - state.selectionStart;
  } else if (drag.mode === "end") {
    const end = clamp(drag.end + delta, drag.start + minimum, state.duration);
    state.selectionDuration = end - drag.start;
  } else {
    const length = drag.end - drag.start;
    const start = clamp(drag.start + delta, 0, state.duration - length);
    state.selectionStart = start;
    state.selectionDuration = length;
  }
  drag.changed = true;
  updateSelectionInputs();
  drawWaveform();
  event.preventDefault();
}

function endWaveformDrag(event) {
  const drag = state.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  state.drag = null;
  if (elements.waveform.hasPointerCapture(event.pointerId)) elements.waveform.releasePointerCapture(event.pointerId);
  if (drag.changed) scheduleAnalysis();
}

function handleWaveformKeyboard(event) {
  if (!state.samples) return;
  const step = event.shiftKey ? 0.25 : 0.1;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === "ArrowUp") {
    state.selectionDuration = clamp(state.selectionDuration + step, Math.min(0.25, state.duration), Math.min(4, state.duration - state.selectionStart));
  } else if (event.key === "ArrowDown") {
    state.selectionDuration = clamp(state.selectionDuration - step, Math.min(0.25, state.duration), Math.min(4, state.duration - state.selectionStart));
  } else {
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    state.selectionStart = clamp(state.selectionStart + direction * step, 0, state.duration - state.selectionDuration);
  }
  updateSelectionInputs();
  drawWaveform();
  scheduleAnalysis();
}

async function handleFile(file) {
  if (!file) return;
  if (file.size > 80 * 1024 * 1024) {
    showError("Fișierul are mai mult de 80 MB. Alege o înregistrare mai scurtă sau comprimată.");
    return;
  }
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = URL.createObjectURL(file);
  const title = file.name.replace(/\.[^.]+$/, "");
  state.customPiece = {
    id: "uploaded",
    family: state.family,
    title,
    composer: "Fișier local",
    instrument: "Încărcat de utilizator",
    file,
    defaultStart: 0,
    defaultDuration: Math.min(1.2, 4),
    description: "Înregistrare proprie, analizată integral în browser. Selectează un fragment clar pentru cele mai bune rezultate."
  };
  renderPieceOptions("uploaded");
  await loadPiece(state.customPiece);
}

function bindEvents() {
  elements.familyButtons.forEach((button) => button.addEventListener("click", () => chooseFamily(button.dataset.family)));
  elements.pieceSelect.addEventListener("change", () => {
    const piece = PIECES.find((item) => item.id === elements.pieceSelect.value) || state.customPiece;
    if (piece) loadPiece(piece);
  });
  elements.playButton.addEventListener("click", async () => {
    try {
      if (elements.audio.paused) await elements.audio.play();
      else elements.audio.pause();
    } catch {
      showError("Redarea nu a putut porni. Apasă din nou butonul sau verifică formatul audio.");
    }
  });
  elements.volumeRange.addEventListener("input", updateVolume);
  elements.resetLabButton.addEventListener("click", () => void resetLaboratory());
  elements.audio.addEventListener("play", updatePlayButton);
  elements.audio.addEventListener("pause", updatePlayButton);
  elements.audio.addEventListener("ended", updatePlayButton);
  elements.audio.addEventListener("timeupdate", () => {
    const current = elements.audio.currentTime || 0;
    elements.currentTime.textContent = formatTime(current);
    elements.seekRange.value = String(current);
    drawWaveform();
  });
  elements.seekRange.addEventListener("input", () => {
    elements.audio.currentTime = Number(elements.seekRange.value);
    elements.currentTime.textContent = formatTime(elements.audio.currentTime);
    drawWaveform();
  });
  elements.analyzeButton.addEventListener("click", () => analyze());
  elements.resetButton.addEventListener("click", () => {
    setDefaultSelection();
    drawWaveform();
    analyze();
  });
  for (const input of [elements.startInput, elements.durationInput]) {
    input.addEventListener("change", () => {
      if (normalizeSelection()) {
        drawWaveform();
        analyze();
      }
    });
  }
  elements.waveform.addEventListener("pointerdown", beginWaveformDrag);
  elements.waveform.addEventListener("pointermove", moveWaveformDrag);
  elements.waveform.addEventListener("pointerup", endWaveformDrag);
  elements.waveform.addEventListener("pointercancel", endWaveformDrag);
  elements.waveform.addEventListener("keydown", handleWaveformKeyboard);
  elements.fileInput.addEventListener("change", () => handleFile(elements.fileInput.files?.[0]));
  for (const eventName of ["dragenter", "dragover"]) {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.add("is-dragging");
    });
  }
  for (const eventName of ["dragleave", "drop"]) {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.remove("is-dragging");
    });
  }
  elements.dropZone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files?.[0]));
  elements.timeTab.addEventListener("click", () => void prepareTrackSpectrogram());
  elements.spectrogramCanvas.addEventListener("pointerdown", selectTrackTime);
  elements.spectrogramCanvas.addEventListener("keydown", handleTrackSpectrogramKeyboard);
  window.addEventListener("resize", () => {
    drawWaveform();
    drawTrackSpectrogram();
    if (!state.analysis) return;
    const { magnitudes, fundamental, amplitudes, fftSize } = state.analysis;
    const accent = FAMILIES[state.family].accent;
    drawSpectrum(elements.spectrumCanvas, magnitudes, state.sampleRate, fftSize, { fundamental, accent, maxFrequency: 5000 });
    drawHarmonics(elements.harmonicsCanvas, amplitudes, fundamental || 220, { accent });
    drawSpectrum(elements.averageCanvas, state.average, state.sampleRate, DEFAULT_FFT_SIZE, { accent, maxFrequency: 5000, showHarmonics: false });
  });
  window.addEventListener("beforeunload", () => {
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  });
}

async function initialize() {
  bindEvents();
  updateVolume();
  setAccent(state.family);
  const first = renderPieceOptions(PIECES[0].id);
  await loadPiece(first);
}

initialize();

window.addEventListener("praxis-language-change", () => {
  if (state.samples && !state.analyzing) void analyze();
  if (!state.trackSpectrogram) return;
  drawTrackSpectrogram();
  elements.spectrogramStatus.textContent = tr("Analiză completă: {frames} cadre pe {duration} secunde.", {
    frames: state.trackSpectrogram.frameCount,
    duration: state.duration.toFixed(1)
  });
});

const integration = document.createElement("script");
integration.src = '../../shared/course.js';
integration.dataset.course = 'fourier-instrumente';
integration.dataset.title = 'Analiza Fourier a instrumentelor';
integration.dataset.subtitle = 'Laborator interactiv de sunet, armonice și timbru';
document.body.append(integration);
