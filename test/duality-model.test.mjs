import test from 'node:test';
import assert from 'node:assert/strict';
import {diffraction, photon, relativeSignal, temWavelength} from '../public/simulari/dualismul-unda-corpuscul/model.js';

const near = (a,b,tolerance) => assert.ok(Math.abs(a-b)<=tolerance, `${a} ≠ ${b}`);

test('de Broglie wavelength at 54 V and the square-root voltage scaling', () => {
  const classic = diffraction(54);
  near(classic.wavelength,166.9,.02);
  near(diffraction(216).wavelength,classic.wavelength/2,1e-9);
  near(classic.maxima[0].detectorAngle,47.015,.01);
  assert.equal(diffraction(25).maxima.length,0);
  assert.equal(relativeSignal(50,diffraction(25).maxima),0);
});

test('all allowed diffraction orders obey the Bragg and detector-angle relations', () => {
  for (let voltage=25;voltage<=250;voltage++){
    const {wavelength,maxima}=diffraction(voltage);
    assert.equal(maxima.length,Math.floor(182/wavelength));
    for (const peak of maxima){
      near(182*Math.sin(peak.braggAngle*Math.PI/180),peak.order*wavelength,1e-9);
      near(2*peak.braggAngle+peak.detectorAngle,180,1e-9);
      assert.ok(relativeSignal(peak.detectorAngle,maxima)>=1/peak.order);
    }
  }
});

test('600 nm photon has the expected energy, momentum and frequency', () => {
  const light=photon(600);
  near(light.energyEv,2.0664,.0001);
  near(light.frequency/1e12,499.654,.001);
  near(light.momentum*1e27,1.104345,.00001);
});

test('TEM uses the relativistic electron wavelength across operating voltages', () => {
  near(temWavelength(80), 4.176, .002);
  near(temWavelength(200), 2.508, .002);
  near(temWavelength(300), 1.969, .002);
  assert.ok(temWavelength(200) < diffraction(200000).wavelength);
});
