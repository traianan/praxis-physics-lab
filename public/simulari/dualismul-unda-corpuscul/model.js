const PLANCK = 6.62607015e-34;
const ELECTRON_MASS = 9.1093837139e-31;
const ELEMENTARY_CHARGE = 1.602176634e-19;
const LIGHT_SPEED = 299792458;

export const NICKEL_SPACING_PM = 91;

export function temWavelength(voltageKv) {
  const kineticEnergy = ELEMENTARY_CHARGE * voltageKv * 1000;
  const restEnergy = ELECTRON_MASS * LIGHT_SPEED ** 2;
  const momentum = Math.sqrt(kineticEnergy * (kineticEnergy + 2 * restEnergy)) / LIGHT_SPEED;
  return PLANCK / momentum * 1e12;
}

export function photon(wavelengthNm) {
  const wavelength = wavelengthNm * 1e-9;
  return {
    frequency: LIGHT_SPEED / wavelength,
    energyEv: PLANCK * LIGHT_SPEED / (wavelength * ELEMENTARY_CHARGE),
    momentum: PLANCK / wavelength
  };
}

export function diffraction(voltage, spacing = NICKEL_SPACING_PM) {
  const momentum = Math.sqrt(2 * ELECTRON_MASS * ELEMENTARY_CHARGE * voltage);
  const wavelength = PLANCK / momentum * 1e12;
  const maxima = [];
  for (let order = 1; order * wavelength <= 2 * spacing; order++) {
    const braggAngle = Math.asin(order * wavelength / (2 * spacing)) * 180 / Math.PI;
    maxima.push({order, braggAngle, detectorAngle: 180 - 2 * braggAngle});
  }
  return {wavelength, momentum, maxima};
}

// Display an illustrative peak profile. This does not predict measured current.
export function relativeSignal(angle, maxima) {
  return Math.max(0, ...maxima.map(({order, detectorAngle}) =>
    Math.exp(-.5 * ((angle - detectorAngle) / 4) ** 2) / order
  ));
}
