// Photon energy × wavelength, in keV·pm, and electron rest energy, in keV.
export const HC = 1239.841984332;
export const REST_ENERGY = 510.99895;
export const COMPTON_WAVELENGTH = HC / REST_ENERGY;

export function scatter(energy, angle) {
  const theta = angle * Math.PI / 180;
  const shift = 2 * COMPTON_WAVELENGTH * Math.sin(theta / 2) ** 2;
  const wavelength = HC / energy;
  const scatteredEnergy = energy / (1 + shift / wavelength);
  const recoil = scatteredEnergy * shift / wavelength;
  const momentumX = recoil + scatteredEnergy * shift / COMPTON_WAVELENGTH;
  const momentumY = -scatteredEnergy * Math.sin(theta);
  // Solve energy conservation with K = p²/(2m), using photon momentum
  // conservation. The smaller quadratic root tends to zero at theta = 0.
  const alpha = energy / REST_ENERGY;
  const lossTerm = shift / wavelength;
  const b = 1 + lossTerm;
  const fractionalLoss = 2 * lossTerm / (b + Math.sqrt(b ** 2 - 2 * alpha * lossTerm));
  const recoilNR = energy * fractionalLoss;
  const photonNR = energy - recoilNR;
  const recoilAngle = recoilNR === 0 ? null : Math.atan2(
    photonNR * Math.sin(theta),
    recoilNR + photonNR * shift / COMPTON_WAVELENGTH
  );

  return {
    theta, wavelength, shift, scatteredWavelength: wavelength + shift,
    scatteredEnergy, recoil, momentumX, momentumY, recoilNR, recoilAngle
  };
}
