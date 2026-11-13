import test from 'node:test';
import assert from 'node:assert/strict';
import {ellipse, orbit, sweptArea, period, circular, geostationaryAltitude, isGeostationary, SIDEREAL_DAY, EARTH_RADIUS} from '../public/simulari/mecanica-cereasca/model.js';
const close=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('ellipse geometry and textbook examples',()=>{
 const e=ellipse(10,.2);close(e.rp,8);close(e.ra,12);close(e.b**2+e.c**2,100);
 close(period(4)/period(1),8);close(period(1.52),1.873981857,1e-8);
 close(period(9),27);close(period(4),8);
 assert.throws(()=>ellipse(1,1));assert.throws(()=>period(0));
});
test('Kepler solver conserves energy and angular momentum, including eccentric orbits',()=>{
 for(const eccentricity of [0,.2,.6,.85])for(let i=0;i<100;i++){
  const p=orbit(2,eccentricity,i*.37,1.5),mu=4*Math.PI**2*1.5;
  close(p.x*p.vy-p.y*p.vx,Math.sqrt(mu*2*(1-eccentricity**2)),1e-8);
  close(p.speed**2/2-mu/p.r,-mu/4,1e-8);
  close(p.E-eccentricity*Math.sin(p.E),p.mean,1e-10);
 }
 const p=orbit(1,.5,0),a=orbit(1,.5,Math.PI);close(p.speed/a.speed,3);
});
test('equal elapsed times sweep equal areas; central mass changes the period',()=>{
 close(sweptArea(3,.6,2*Math.PI),Math.PI*3*2.4);
 close(sweptArea(3,.6,.4),sweptArea(3,.6,1.4)-sweptArea(3,.6,1));
 close(period(2,4),period(2)/2);
});
test('circular speed, escape speed and geostationary conditions are distinct',()=>{
 const surface=circular(0);assert.ok(surface.speed>7.90&&surface.speed<7.91);close(surface.escape/surface.speed,Math.SQRT2);
 const leo=circular(400);assert.ok(leo.speed>7.66&&leo.speed<7.68);assert.ok(leo.T/60>92&&leo.T/60<93);
 const h=geostationaryAltitude(),geo=circular(h);close(geo.T,SIDEREAL_DAY,1e-8);assert.ok(h>35785&&h<35787);
 assert.ok(isGeostationary(h,0,1));assert.ok(!isGeostationary(h,15,1));assert.ok(!isGeostationary(h,0,-1));assert.ok(!isGeostationary(400,0,1));
 close(geo.r,h+EARTH_RADIUS);assert.throws(()=>circular(-1));
});
