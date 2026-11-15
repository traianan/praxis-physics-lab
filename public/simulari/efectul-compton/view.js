function canvasContext(canvas) {
  const {width, height} = canvas.getBoundingClientRect();
  if (!width || !height) return null;
  const scale = PraxisCanvasResolution.ratio(width, height);
  const pixelWidth = Math.round(width * scale), pixelHeight = Math.round(height * scale);
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return {ctx, width, height};
}

function line(ctx, x, y, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function dot(ctx, x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function wave(ctx, x, y, x2, y2, wavelength, color) {
  const length = Math.hypot(x2 - x, y2 - y);
  const ux = (x2 - x) / length, uy = (y2 - y) / length;
  const period = wavelength * .72;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let s = 1; s < length; s++) {
    const envelope = Math.min(1, s / 8, (length - s) / 8);
    const offset = 5 * envelope * Math.sin(2 * Math.PI * s / period);
    ctx.lineTo(x + ux * s - uy * offset, y + uy * s + ux * offset);
  }
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawCollision(canvas, result, phase) {
  const plot = canvasContext(canvas);
  if (!plot) return;
  const {ctx, width, height} = plot;
  const style = getComputedStyle(canvas);
  const color = name => style.getPropertyValue('--praxis-science-' + name).trim();
  const rail = style.getPropertyValue('--praxis-color-border').trim();
  const x = width / 2, y = height * .55;
  const radius = Math.min(width * .32, height * .41);
  const dx = Math.cos(result.theta), dy = -Math.sin(result.theta);
  const detectorX = x + radius * dx, detectorY = y + radius * dy;

  ctx.lineWidth = 1.5;
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.arc(x, y, radius, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = rail;
  ctx.stroke();
  line(ctx, x, y, width - 16, y, rail);
  ctx.restore();
  if (result.theta > 0) {
    ctx.beginPath();
    ctx.arc(x, y, radius * .35, -result.theta, 0);
    ctx.strokeStyle = color('blue');
    ctx.stroke();
  }
  ctx.lineWidth = 2.5;
  wave(ctx, 20, y, x, y, result.wavelength, color('teal'));
  wave(ctx, x, y, detectorX, detectorY, result.scatteredWavelength, color('blue'));
  if (result.recoilAngle !== null) {
    const ex = Math.cos(result.recoilAngle), ey = Math.sin(result.recoilAngle);
    if (result.recoilAngle > 0) {
      ctx.beginPath();
      ctx.arc(x, y, radius * .46, 0, result.recoilAngle);
      ctx.strokeStyle = color('orange');
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineWidth = 2.5;
    }
    const distance = Math.min(radius, (height - y - 14) / Math.max(.01, ey));
    line(ctx, x, y, x + distance * ex, y + distance * ey, color('orange'));
    const travel = distance * Math.max(0, 2 * phase - 1);
    dot(ctx, x + travel * ex, y + travel * ey, 5, color('orange'));
  } else {
    dot(ctx, x, y, 5, color('orange'));
  }
  ctx.save();
  ctx.translate(detectorX, detectorY);
  ctx.rotate(-result.theta);
  ctx.fillStyle = color('blue');
  ctx.fillRect(-5, -13, 10, 26);
  ctx.restore();
  if (phase <= .5) {
    dot(ctx, 20 + (x - 20) * 2 * phase, y, 6, color('teal'));
  } else {
    const travel = radius * (2 * phase - 1);
    dot(ctx, x + travel * dx, y + travel * dy, 6, color('blue'));
  }
  dot(ctx, 20, y, 4, color('teal'));
}

export function drawSpectrum(canvas, {wavelength, scatteredWavelength}, format) {
  const plot = canvasContext(canvas);
  if (!plot) return;
  const {ctx, width, height} = plot;
  const style = getComputedStyle(canvas);
  const bottom = height - 28, left = 23, right = width - 25;
  const maxWavelength = 130;
  const x = wavelength => left + (right - left) * wavelength / maxWavelength;
  const incident = style.getPropertyValue('--praxis-science-teal').trim();
  const scattered = style.getPropertyValue('--praxis-science-blue').trim();
  ctx.fillStyle = style.color;
  ctx.font = '14px ' + style.fontFamily;
  ctx.textAlign = 'center';
  ctx.lineWidth = 1;
  line(ctx, left, bottom, right, bottom, style.color);
  for (let tick = 0; tick <= maxWavelength; tick += 25) {
    line(ctx, x(tick), bottom, x(tick), bottom + 5, style.color);
    ctx.fillText(format(tick), x(tick), height - 5);
  }
  ctx.lineWidth = 3;
  line(ctx, x(wavelength), bottom, x(wavelength), 14, incident);
  line(ctx, x(scatteredWavelength), bottom, x(scatteredWavelength), 24, scattered);
}
