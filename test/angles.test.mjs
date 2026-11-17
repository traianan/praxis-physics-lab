import test from 'node:test';
import assert from 'node:assert/strict';
import {plane,solid,toDegrees,toRadians,toDMS,drawingRadius} from '../public/simulari/masurarea-unghiurilor/model.js';
import {capProjection,capViews} from '../public/simulari/masurarea-unghiurilor/view.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('orthographic cap views distinguish the projected disk from the spherical area',()=>{
 const r=5,R=drawingRadius(r);
 const zero=capProjection(0,r),quarter=capProjection(60,r),half=capProjection(90,r),large=capProjection(120,r),full=capProjection(180,r);
 near(zero.topRadius,0);near(zero.edgeY,150-R);
 near(quarter.edgeY,150-R/2);near(quarter.topRadius,R*Math.sqrt(3)/2);
 near(half.topRadius,R);near(half.edgeY,150);
 near(large.topRadius,R);assert.equal(large.hiddenBoundary,true);
 near(full.topRadius,R);near(full.edgeY,150+R);
 assert.equal(quarter.hiddenBoundary,false);
 // At alpha = 60°, top projection is 3/4 of the sphere's projected disk,
 // while the spherical cap area is pi r². They must not be identified.
 near(Math.PI*(quarter.topRadius/24)**2,3*Math.PI*r*r/4);
 near(solid(60,r).area,Math.PI*r*r);
 for(const degrees of [0,.01,32.77,60,90,120,179.99,180])for(const radius of [.5,2,5]){
  const p=capProjection(degrees,radius);assert.ok(p.topRadius>=0&&p.topRadius<=p.R);
  assert.ok(!/NaN|Infinity/.test(capViews(degrees,radius,'axis').side));
 }
 assert.match(capViews(180,r,'axis').side,/<circle data-cap-fill/);
 assert.match(capViews(120,r,'axis').top,/data-cap-boundary[^>]*stroke-dasharray/);
});
test('sexagesimal conversion rounds seconds and carries into minutes and degrees',()=>{
 assert.deepEqual(toDMS(toDegrees(1)),{degrees:57,minutes:17,seconds:44.81});
 assert.deepEqual(toDMS(134.01),{degrees:134,minutes:0,seconds:36});
 assert.deepEqual(toDMS(134.29),{degrees:134,minutes:17,seconds:24});
 assert.deepEqual(toDMS(30.5),{degrees:30,minutes:30,seconds:0});
 assert.deepEqual(toDMS(59.9999999),{degrees:60,minutes:0,seconds:0});
 assert.deepEqual(toDMS(0),{degrees:0,minutes:0,seconds:0});
 assert.deepEqual(toDMS(360),{degrees:360,minutes:0,seconds:0});
});
test('the drawing uses one linear scale across the entire radius range',()=>{
 for(const radius of [.5,1,2,3,4,5])near(drawingRadius(radius)/radius,24);
 near(drawingRadius(4)/drawingRadius(2),2);
});
test('degree conversions and arc lengths preserve the angle under radius changes',()=>{
 for(const deg of [0,1,30,60,90,120,180,270,360])for(const r of [.5,1,2,5]){
  const p=plane(deg,r);near(toDegrees(p.radians),deg);near(p.arc/r,toRadians(deg));
 }
 near(plane(toDegrees(1),2).arc,2);
});
test('solid angle uses spherical area with hemisphere, full sphere and one steradian limits',()=>{
 for(const r of [.5,1,2,5])for(const [deg,omega]of [[0,0],[60,Math.PI],[90,2*Math.PI],[180,4*Math.PI]]){
  const s=solid(deg,r);near(s.omega,omega);near(s.area/r**2,omega);near(s.fraction,omega/(4*Math.PI));
 }
 const alpha=toDegrees(2*Math.asin(Math.sqrt(1/(4*Math.PI))));near(solid(alpha,2).area,4);
 near(solid(.0001,1).omega/toRadians(.0001)**2,Math.PI);
 let previous=-1;for(let deg=0;deg<=180;deg++){const s=solid(deg,2);assert.ok(s.omega>=previous);assert.ok(s.fraction>=0&&s.fraction<=1);previous=s.omega;}
});
