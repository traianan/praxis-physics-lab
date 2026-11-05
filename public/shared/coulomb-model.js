(function(root){
 'use strict';
 const k=8.9875517923e9;
 function interaction(q1,q2,r){
  if(![q1,q2,r].every(Number.isFinite)||r<=0)throw new RangeError('Finite charges and positive separation required');
  const force=k*Math.abs(q1*q2)*1e-12/(r/100)**2;
  const direction=q1*q2<0?1:q1*q2>0?-1:0;
  return {force,direction,force1:direction*force,force2:-direction*force};
 }
 function geometry(r,width,force,direction){
  // Leave room for the charge radius and a complete arrowhead even on phones.
  const max=Math.max(180,width-240),min=Math.min(160,max-20);
  const separation=min+(r-10)/90*(max-min),x1=(width-separation)/2,x2=(width+separation)/2;
  const available=direction>0?(separation-74)/2-10:x1-55;
  const length=Math.max(0,Math.min(85,35+12*Math.log10(1+force*100),available));
  return {min,max,separation,x1,x2,length};
 }
 root.PraxisCoulombModel={k,interaction,geometry};
})(globalThis);
