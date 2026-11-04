/** Uniform-field alternator, resistive load, prescribed angular speed. All units SI. */
export const DEFAULTS=Object.freeze({N:100,B:.5,A:.01,omega:10*Math.PI,R:20,r:2,theta0:0,open:false});
export function validateParameters(p){
 for(const key of ['N','B','A','omega','R','r','theta0'])if(!Number.isFinite(p[key]))throw new RangeError(`Invalid ${key}`);
 if(!Number.isInteger(p.N)||p.N<0||p.B<0||p.A<0||p.R<0||p.r<0||p.R+p.r<=0||typeof p.open!=='boolean')throw new RangeError('Invalid generator parameters');
 return p;
}
export function stateAt(p,t){
 validateParameters(p);if(!Number.isFinite(t)||t<0)throw new RangeError('Invalid time');
 const theta=p.theta0+p.omega*t,flux=p.B*p.A*Math.cos(theta),emf=p.N*p.B*p.A*p.omega*Math.sin(theta),current=p.open?0:emf/(p.R+p.r),voltage=p.open?emf:p.R*current;
 const emfPeak=p.N*p.B*p.A*Math.abs(p.omega),emfRms=emfPeak/Math.SQRT2,currentRms=p.open?0:emfRms/(p.R+p.r);
 return {t,theta,flux,linkage:p.N*flux,emf,current,voltage,frequency:Math.abs(p.omega)/(2*Math.PI),period:p.omega?2*Math.PI/Math.abs(p.omega):null,emfPeak,emfRms,currentRms,voltageRms:p.open?emfRms:p.R*currentRms,torque:-p.N*p.B*p.A*current*Math.sin(theta),pMechanical:emf*current,pLoad:current*current*p.R,pCopper:current*current*p.r};
}
export function energyBetween(p,start,end){
 validateParameters(p);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<start)throw new RangeError('Invalid interval');
 const dt=end-start,x=p.omega*dt,mid=p.theta0+p.omega*(start+dt/2);
 // 1-sinc(x) evaluated by its series near zero, avoiding subtractive cancellation.
 const oneMinusSinc=Math.abs(x)<.01?x*x*(1/6-x*x*(1/120-x*x/5040)):1-Math.sin(x)/x;
 const integral=dt*Math.max(0,Math.sin(mid)**2+Math.cos(2*mid)*oneMinusSinc/2);
 const mechanical=p.open?0:(p.N*p.B*p.A*p.omega)**2/(p.R+p.r)*integral;
 const load=mechanical*p.R/(p.R+p.r),copper=mechanical*p.r/(p.R+p.r);
 return {mechanical,load,copper};
}
