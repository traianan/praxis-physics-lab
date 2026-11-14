const rad = degrees => degrees * Math.PI / 180;
export function transmission(intensity, angle) {
  const value = intensity * Math.cos(rad(angle)) ** 2;
  return Math.abs(value) < 1e-12 ? 0 : value;
}
export function polarizers({intensity = 100, angle = 45, middle = 45, third = false, polarized = false} = {}) {
  const first = intensity * (polarized ? 1 : .5);
  const intermediate = third ? transmission(first, middle) : first;
  const output = transmission(intermediate, third ? angle - middle : angle);
  return {first, intermediate, output, fraction: intensity ? output / intensity : 0};
}
export function reflection(n2, incidence, n1 = 1) {
  const i = rad(incidence), r = Math.asin(n1 / n2 * Math.sin(i));
  const rs = ((n1 * Math.cos(i) - n2 * Math.cos(r)) / (n1 * Math.cos(i) + n2 * Math.cos(r))) ** 2;
  const rp = ((n2 * Math.cos(i) - n1 * Math.cos(r)) / (n2 * Math.cos(i) + n1 * Math.cos(r))) ** 2;
  return {brewster: Math.atan(n2 / n1) * 180 / Math.PI, refraction: r * 180 / Math.PI, rs, rp};
}
export function field(phase, ratio, delay) {
  return {x: Math.cos(phase), y: ratio * Math.cos(phase + rad(delay))};
}
