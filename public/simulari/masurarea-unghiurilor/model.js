export const toRadians = degrees => degrees * Math.PI / 180;
export const toDegrees = radians => radians * 180 / Math.PI;
export function toDMS(degrees) {
  const centiseconds = Math.round(degrees * 3600 * 100);
  return {
    degrees: Math.floor(centiseconds / 360000),
    minutes: Math.floor(centiseconds % 360000 / 6000),
    seconds: centiseconds % 6000 / 100
  };
}
// One fixed scale throughout the radius slider, in SVG units per metre.
export const drawingRadius = radius => 24 * radius;
export function plane(degrees, radius) {
  const radians = toRadians(degrees);
  return {radians, arc: radius * radians};
}
// alpha is the cone's half-angle, measured from its axis to a generator.
export function solid(degrees, radius) {
  const alpha = toRadians(degrees);
  const omega = 4 * Math.PI * Math.sin(alpha / 2) ** 2;
  return {alpha, omega, area: omega * radius ** 2, fraction: omega / (4 * Math.PI)};
}
