import {signal, velocities} from './model.js';

const ink = '#e7f3eb';
const muted = '#acc6be';
const ground = '#102c2b';
const grid = '#2c4845';
const gold = '#f3cb80';
const colorRoles = {p: 'blue', s: 'red', surface: 'purple', love: 'purple', rayleigh: 'teal'};

export function waveColor(phase) {
  // These canvases use a dark scientific surface in both interface themes.
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--seismic-' + colorRoles[phase]).trim();
}

function prepare(canvas) {
  const {width, height} = canvas.getBoundingClientRect();
  if (!width || !height) return null;
  const ratio = PraxisCanvasResolution.ratio(width, height);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.font = `${Math.max(13, Math.min(18, parseFloat(getComputedStyle(canvas).fontSize)))}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  return {ctx, width, height};
}

function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function dot(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function label(ctx, text, x, y, color = ink, align = 'left') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

export function drawPropagation(canvas, {distance, depth, time, times, tr}) {
  const frame = prepare(canvas);
  if (!frame) return;
  const {ctx, width, height} = frame;
  const surface = 53;
  const scale = Math.min(Math.max(10, width - 110) / distance, (height - surface - 22) / Math.max(depth, 30));
  const epicentre = (width - distance * scale) / 2;
  const focus = surface + depth * scale;
  const station = epicentre + distance * scale;
  const depthLabel = Math.max(surface + 22, focus);
  ctx.fillStyle = '#163735';
  ctx.fillRect(0, 0, width, surface);
  for (let y = surface + 20 * scale; y < height; y += 20 * scale) line(ctx, 0, y, width, y, grid);
  line(ctx, 0, surface, width, surface, muted, 1.4);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, surface, width, height - surface);
  ctx.clip();
  if (time > 0) {
    for (const phase of ['s', 'p']) {
      const radius = time * velocities[phase] * scale;
      ctx.strokeStyle = waveColor(phase);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(epicentre, focus, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.setLineDash([3, 5]);
  line(ctx, epicentre, surface, epicentre, focus, muted);
  line(ctx, epicentre, focus, station, surface, '#77958b');
  ctx.restore();
  if (time > depth / velocities.p) {
    const reach = (time - depth / velocities.p) * velocities.surface * scale;
    line(ctx, Math.max(0, epicentre - reach), surface, Math.min(width, epicentre + reach), surface, waveColor('surface'), 3);
  }
  dot(ctx, epicentre, surface, 3, ink);
  dot(ctx, epicentre, focus, 5, gold);
  const latest = Object.keys(times).findLast(phase => time >= times[phase]);
  const stationColor = latest ? waveColor(latest) : ink;
  ctx.fillStyle = stationColor;
  ctx.fillRect(station - 6, surface - 11, 12, 11);
  const caption = tr('Epicentru');
  label(ctx, caption, Math.max(8, epicentre - ctx.measureText(caption).width / 2), 18, muted);
  line(ctx, epicentre, 29, epicentre, surface - 5, muted);
  label(ctx, tr('Stație'), Math.min(width - 10, station + 4), 32, stationColor, station > width - 60 ? 'right' : 'center');
  label(ctx, tr('Focar'), epicentre + 10, depthLabel, gold);
}

export function drawSeismogram(canvas, {time, end, times, tr}) {
  const frame = prepare(canvas);
  if (!frame) return;
  const {ctx, width, height} = frame;
  const left = 24, right = width - 24, centre = height * 0.48;
  const x = t => left + (right - left) * t / end;
  const y = amplitude => centre - amplitude * height * 0.45;
  const increment = width < 480 ? 20 : 10;
  for (let t = 0; t <= end; t += increment) {
    line(ctx, x(t), 31, x(t), height - 47, grid);
    label(ctx, String(t), x(t), height - 35, muted, 'center');
  }
  line(ctx, left, centre, right, centre, grid);
  const active = Object.entries(times).filter(([, at]) => time >= at);
  let labelEdge = -Infinity;
  for (const [phase, at] of active) {
    const color = waveColor(phase);
    line(ctx, x(at), 29, x(at), height - 48, color);
    const caption = phase === 'surface' ? tr('Suprafață') : phase.toUpperCase();
    const size = ctx.measureText(caption).width;
    const position = Math.min(width - size - 4, Math.max(x(at), labelEdge + 4));
    label(ctx, caption, position, 15, color);
    labelEdge = position + size;
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, centre);
  const lastPixel = x(time);
  for (let pixel = left + 0.5; pixel <= lastPixel; pixel += 0.5) {
    const t = (pixel - left) * end / (right - left);
    ctx.lineTo(pixel, y(signal(t, times)));
  }
  ctx.stroke();
  dot(ctx, lastPixel, y(signal(time, times)), 3, gold);
  label(ctx, tr('Timp de la rupere (s)'), width / 2, height - 14, muted, 'center');
}

export function drawParticles(canvas, {time, mode, tr}) {
  const frame = prepare(canvas);
  if (!frame) return;
  const {ctx, width, height} = frame;
  const left = 26, top = 67, span = width - left * 2;
  const rows = 5;
  const columns = Math.max(8, Math.floor(span / 20));
  const isSurface = mode === 'rayleigh' || mode === 'love';
  const color = waveColor(mode);
  label(ctx, tr(mode === 'love' ? 'Vedere de sus' : 'Secțiune verticală'), left, 23, muted);
  const direction = tr('Propagare');
  const arrowEnd = width - 22;
  label(ctx, direction, arrowEnd - 30, 23, muted, 'right');
  line(ctx, arrowEnd - 22, 23, arrowEnd, 23, ink);
  line(ctx, arrowEnd - 6, 19, arrowEnd, 23, ink);
  line(ctx, arrowEnd - 6, 27, arrowEnd, 23, ink);
  const columnStep = span / (columns - 1);
  const rowStep = (height - top - 32) / (rows - 1);
  for (let row = 0; row < rows; row++) {
    const y = top + row * rowStep;
    line(ctx, left, y, left + span, y, grid);
    for (let col = 0; col < columns; col++) {
      const x = left + col * columnStep;
      const phase = 2 * Math.PI * (col / 8 - time * 0.55);
      const amplitude = (mode === 'rayleigh' ? Math.exp(-row * 0.55) : 1) * 10;
      const dx = mode === 'p' || mode === 'rayleigh' ? amplitude * Math.cos(phase) : 0;
      const dy = mode === 'p' ? 0 : amplitude * Math.sin(phase) * (isSurface ? 1 : 0.85);
      const tracked = col === Math.floor(columns / 2) && row === (isSurface ? 0 : 2);
      if (tracked) {
        ctx.strokeStyle = gold;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y, mode === 's' || mode === 'love' ? 1 : amplitude, mode === 'p' ? 1 : amplitude, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      dot(ctx, x + dx, y + dy, tracked ? 5 : 2.8, tracked ? gold : color);
    }
  }
}
