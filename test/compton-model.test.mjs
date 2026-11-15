import test from 'node:test';
import assert from 'node:assert/strict';
import {scatter, COMPTON_WAVELENGTH, REST_ENERGY} from '../public/simulari/efectul-compton/model.js';

const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

test('Compton shift has the expected forward, right-angle and backward limits', () => {
  near(COMPTON_WAVELENGTH, 2.42631, .00001);
  for (const energy of [10, 60, 200]) {
    near(scatter(energy, 0).shift, 0);
    near(scatter(energy, 0).recoil, 0);
    near(scatter(energy, 90).shift, COMPTON_WAVELENGTH);
    near(scatter(energy, 180).shift, 2 * COMPTON_WAVELENGTH);
  }
});

test('Compton scattering conserves energy and both components of momentum', () => {
  for (const energy of [10, 60, 100, 200]) {
    for (let angle = 0; angle <= 180; angle++) {
      const {theta, scatteredEnergy, recoil, momentumX, momentumY} = scatter(energy, angle);
      near(scatteredEnergy + recoil, energy);
      near(scatteredEnergy * Math.cos(theta) + momentumX, energy);
      near(scatteredEnergy * Math.sin(theta) + momentumY, 0);
      near(momentumX ** 2 + momentumY ** 2, recoil ** 2 + 2 * REST_ENERGY * recoil);
    }
  }
});

test('nonrelativistic recoil satisfies the classical energy and momentum equations', () => {
  assert.equal(scatter(60, 0).recoilAngle, null);
  near(scatter(60, 0).recoilNR, 0);
  near(scatter(60, 180).recoilAngle, 0);
  for (const incident of [10, 60, 131, 200]) {
    for (let angle = 1; angle <= 180; angle++) {
      const {theta, recoilNR, recoilAngle} = scatter(incident, angle);
      const scattered = incident - recoilNR;
      const px = incident - scattered * Math.cos(theta);
      const py = scattered * Math.sin(theta);
      near(recoilNR, Math.hypot(px, py) ** 2 / (2 * REST_ENERGY));
      near(recoilAngle, Math.atan2(py, px));
    }
  }
});

test('doubling photon energy halves incident wavelength at a fixed angle', () => {
  const first = scatter(60, 90), second = scatter(120, 90);
  near(first.wavelength, 2 * second.wavelength);
  near(first.shift, second.shift);
  assert.ok(second.scatteredWavelength < first.scatteredWavelength);
});
