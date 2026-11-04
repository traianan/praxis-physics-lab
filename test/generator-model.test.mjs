import test from 'node:test';
import assert from 'node:assert/strict';
const moduleUrl=new URL('../public/shared/generator-model.js',import.meta.url);
test('generator model is implemented',async()=>{const fs=await import('node:fs/promises');assert.ok(await fs.stat(moduleUrl).catch(()=>null),'missing physical model');});
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
test('reference, Faraday, limits, conservation and stable energy',async()=>{
 const {DEFAULTS:p,stateAt:s,energyBetween:e,validateParameters:v}=await import(moduleUrl);
 close(s(p,.05).emf,15.707963267948966);close(s(p,.05).current,.7139983303613167);close(s(p,0).flux,.005);
 close(s(p,.1).flux,-.005);close(s(p,.15).emf,-15.707963267948966);close(s(p,.2).emf,0);
 close(s(p,0).emfRms,11.107207345395915);close(s(p,0).voltageRms,10.097461223087196);
 close(e(p,0,.2).mechanical,1.1215459546692452);
 for(const key of ['B','A','N','omega']){const z=s({...p,[key]:0},.05);close(z.emf,0);close(z.current,0);close(z.pMechanical,0);}
 assert.equal(s({...p,omega:0},1).period,null);
 const open=s({...p,open:true},.05);close(open.voltage,open.emf);close(open.current,0);close(open.torque,0);
 const short=s({...p,R:0},.05);close(short.voltage,0);close(short.current,short.emf/p.r);
 for(const key of ['N','B','A','omega'])close(s({...p,[key]:2*p[key],theta0:Math.PI/2},0).emf,2*s({...p,theta0:Math.PI/2},0).emf);
 for(const key of ['N','B','A','omega','R','r'])assert.throws(()=>v({...p,[key]:NaN}));
 assert.throws(()=>v({...p,N:1.5}));assert.throws(()=>v({...p,R:0,r:0}));
 for(const omega of [p.omega,-p.omega,0,1e-10])for(const theta0 of [0,.7,Math.PI/2]){
  const q={...p,omega,theta0};let sum=0,charge=0;const dt=.2/10000;
  for(let j=0;j<=10000;j++){const x=s(q,j*dt),weight=(j===0||j===10000)?.5:1;close(x.pMechanical,x.pLoad+x.pCopper,1e-10);close(x.pMechanical,-x.torque*omega,1e-10);assert.ok(x.torque*omega<=1e-10);sum+=weight*x.pMechanical*dt;charge+=weight*x.current*dt;}
  close(e(q,0,.2).mechanical,sum,1e-7);if(Math.abs(omega)===p.omega)close(charge,0);
  for(const dt of [1e-12,1e-8,.001])assert.ok(e(q,0,dt).mechanical>=0);
 }
 const theta0=.8,positive=s({...p,theta0},0),negative=s({...p,omega:-p.omega,theta0},0);close(negative.emf,-positive.emf);close(negative.torque,-positive.torque);close(negative.pMechanical,positive.pMechanical);
 const t=.031,h=1e-7;close(s(p,t).emf,-p.N*(s(p,t+h).flux-s(p,t-h).flux)/(2*h),1e-7);
 close(e(p,0,.2).mechanical,e(p,0,.07).mechanical+e(p,.07,.2).mechanical);
});
