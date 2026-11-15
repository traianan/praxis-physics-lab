import {relativeSignal} from './model.js';

export function drawBench(canvas, angle, maxima, phase) {
  const {width, height} = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const scale = PraxisCanvasResolution.ratio(width, height);
  const w = Math.round(scale * width), h = Math.round(scale * height);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(w / width, 0, 0, h / height, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const css = getComputedStyle(canvas);
  const token = name => css.getPropertyValue(name).trim();
  const teal = token('--praxis-science-teal'), blue = token('--praxis-science-blue');
  const amber = token('--praxis-science-orange'), guide = token('--praxis-color-muted');
  const x = width * .25, y = height * .5;
  const radius = Math.min(width * .24, height * .34);
  const theta = angle * Math.PI / 180;
  const dx = x + radius * Math.sin(theta), dy = y - radius * Math.cos(theta);
  const sy = y - radius - 9;
  function line(x1, y1, x2, y2, color, size = 1) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.stroke();
  }
  function dot(x1, y1, radius, color) {
    ctx.beginPath(); ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color; ctx.fill();
  }
  ctx.beginPath();
  ctx.setLineDash([3, 4]);
  ctx.arc(x, y, radius, -Math.PI/2, Math.PI/2);
  ctx.strokeStyle = guide; ctx.stroke();
  ctx.setLineDash([]);
  line(x, sy, x, y, teal, 2);
  line(x, y, dx, dy, blue, 2);
  ctx.fillStyle = amber; ctx.fillRect(x - 10, y - 4, 20, 8);
  dot(x, sy, 5, teal);
  dot(dx, dy, 6 + 3 * relativeSignal(angle, maxima), blue);
  if (phase < .52) dot(x, sy + (y - sy) * phase / .52, 4, teal);
  else {
    const progress = (phase - .52) / .48;
    dot(x + (dx - x) * progress, y + (dy - y) * progress, 4, blue);
  }
  const left = width * .54, right = width - 14, bottom = height * .75;
  const gx = a => left + (right - left) * a / 180;
  const gy = s => bottom - height * .5 * s;
  line(left, gy(1), left, bottom, guide);
  line(left, bottom, right, bottom, guide);
  ctx.beginPath();
  for(let a=0;a<=180;a++){
    const yy=gy(relativeSignal(a,maxima));
    if(a===0)ctx.moveTo(gx(a),yy);
    else ctx.lineTo(gx(a),yy);
  }
  ctx.strokeStyle = blue; ctx.lineWidth = 2; ctx.stroke();
  line(gx(angle), bottom, gx(angle), gy(1), amber);
  dot(gx(angle), gy(relativeSignal(angle,maxima)), 3.5, amber);
  ctx.fillStyle = css.color; ctx.font = '12px '+css.fontFamily;
  ctx.fillText('0°',left,bottom+17);
  ctx.textAlign = 'right'; ctx.fillText('180°',right,bottom+17);
}
