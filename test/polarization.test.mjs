import test from 'node:test';
import assert from 'node:assert/strict';
import {polarizers,transmission,reflection,field} from '../public/simulari/polarizarea-luminii/model.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('Malus, source polarization and crossed filters',()=>{near(polarizers({intensity:120,angle:60}).output,15);near(polarizers({intensity:80,angle:60,polarized:true}).output,20);near(polarizers({angle:90}).output,0);near(polarizers({angle:180}).output,50);});
test('Middle filter restores transmission without creating energy',()=>{near(polarizers({intensity:160,angle:90,middle:45,third:true}).output,20);for(let a=0;a<=180;a+=3)for(let b=0;b<=180;b+=3){const v=polarizers({intensity:100,angle:a,middle:b,third:true});assert.ok(v.output<=v.intermediate+1e-10&&v.intermediate<=v.first+1e-10);}near(transmission(100,45),50);});
test('Fresnel normal incidence and Brewster orthogonality',()=>{const normal=reflection(1.5,0);near(normal.rs,.04);near(normal.rp,.04);for(const n of [1.1,1.33,1.5,2,2.5]){const b=reflection(n,0).brewster,m=reflection(n,b);near(m.rp,0);near(m.refraction+b,90);assert.ok(m.rs>0);}});
test('Circular fields have constant norm; linear fields are collinear',()=>{for(let t=0;t<7;t+=.03){const c=field(t,1,90),l=field(t,.5,0);near(c.x*c.x+c.y*c.y,1);near(l.y,.5*l.x);}});
