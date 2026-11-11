export const velocities = {p: 6, s: 3.5, surface: 2.9};

export function arrivals(distance, depth) {
  const path = Math.hypot(distance, depth);
  return {
    p: path / velocities.p,
    s: path / velocities.s,
    surface: depth / velocities.p + distance / velocities.surface
  };
}

const packets = Object.entries({
  p: {amplitude: 0.23, period: 1.25, decay: 2.9},
  s: {amplitude: 0.48, period: 1.9, decay: 3.9},
  surface: {amplitude: 0.8, period: 3.7, decay: 4.8}
});

export function signal(time, times) {
  return packets.reduce((value, [key, {amplitude, period, decay}]) => {
    const delay = time - times[key];
    if (delay <= 0) return value;
    const envelope = (1 - Math.exp(-delay * 2)) * Math.exp(-delay / decay);
    return value + amplitude * envelope * Math.sin(2 * Math.PI * delay / period);
  }, 0);
}

export function magnitudeRatios(difference) {
  return {amplitude: 10 ** difference, energy: 10 ** (1.5 * difference)};
}
