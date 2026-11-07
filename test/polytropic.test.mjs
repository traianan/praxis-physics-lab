import test from 'node:test';
import assert from 'node:assert/strict';
import {computeProcess,energyAt,GASES,R} from '../public/simulari/transformarea-politropa/physics.mjs';
const near=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const input={gas:'di',nu:1,p1:100,V1:25,n:1.2,ratio:1.8,isochoric:false};
test('polytropic work agrees with independent quadrature in expansion and compression',()=>{
 for(const gas of ['mono','di'])for(const n of [-1.5,-1,0,.5,1,1.2,GASES[gas].gamma,2.5])for(const ratio of [.4,1,2.5]){
  const m=computeProcess({...input,gas,n,ratio}),count=2000,step=(m.V2-m.V1)/count;
  let integral=0;for(let i=0;i<=count;i++){const V=m.V1+i*step;integral+=(i===0||i===count?1:i%2?4:2)*m.p1*(m.V1/V)**n;}integral*=step/3;
  near(m.L,integral);near(m.Q,m.dU+m.L);near(m.p2*m.V2,m.nu*R*m.T2);
  const end=energyAt(m,1);for(const key of ['L','Q','dU'])near(end[key],m[key]);near(end.p,m.p2);near(end.T,m.T2);
  const start=energyAt(m,0);near(start.L,0);near(start.Q,0);near(start.dU,0);
 }
});
test('isochoric pressure changes preserve volume, zero work and the first law',()=>{
 for(const ratio of [.4,1,2.5]){const m=computeProcess({...input,isochoric:true,ratio});near(m.V2,m.V1);near(m.L,0);near(m.Q,m.dU);near(m.T2/m.T1,ratio);near(m.C,m.gas.cv);for(const t of [0,.3,1]){const s=energyAt(m,t);near(s.V,m.V1);near(s.L,0);near(s.Q,s.dU);}}
});
test('limiting-process snapping keeps the animated endpoint identical to the result',()=>{
 for(const n of [0,1,GASES.di.gamma])for(const offset of [-.00005,0,.00005]){const m=computeProcess({...input,n:n+offset}),s=energyAt(m,1);near(s.p,m.p2);near(s.T,m.T2);near(s.L,m.L);near(s.Q,m.Q);near(s.dU,m.dU);}
});
test('negative exponents put molar heat capacity strictly between Cv and Cp',()=>{
 for(const n of [-10,-1.5,-1,-.1]){const m=computeProcess({...input,n});assert.ok(m.C>m.gas.cv&&m.C<m.gas.cp);if(n!==-1)assert.match(m.info.note,/C_V < C < C_p/);}
});
