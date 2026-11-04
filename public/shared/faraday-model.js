/** Quasistatic teaching models. All inputs and outputs SI; no DOM or rendering clock. */
export const MU0=4*Math.PI*1e-7;
const finite=(...values)=>{if(!values.every(Number.isFinite))throw new RangeError('Finite SI values required');};
const positive=(...values)=>{finite(...values);if(values.some(v=>v<=0))throw new RangeError('Positive value required');};
const turns=(n,zero=false)=>{finite(n);if(!Number.isInteger(n)||n<(zero?0:1))throw new RangeError('Invalid turns');};
export function dipoleField(m,x,y){
 finite(m,x,y);const r=Math.hypot(x,y);if(r<.01)return null;
 const c=MU0*m/(4*Math.PI*r**3);return {bx:c*(3*x*x/r**2-1),by:c*3*x*y/r**2};
}
export function pickup(p,x,v){
 finite(p.m,x,v);positive(p.a,p.R);turns(p.N,true);if(x<0)throw new RangeError('Invalid distance');
 const q=p.a*p.a+x*x,flux=MU0*p.m*p.a*p.a/(2*q**1.5),gradient=-3*MU0*p.m*p.a*p.a*x/(2*q**2.5);
 const emf=-p.N*gradient*v,current=p.open?0:emf/p.R,force=p.N*current*gradient,power=current*current*p.R;
 return {x,v,flux,linkage:p.N*flux,emf,current,force,power,mechanical:-force*v};
}
/** Constant-speed bounded segment; Simpson work integral, subdivided in space (not frames). */
export function movePickup(p,x,target,dt){
 finite(x,target,dt);if(dt<0||x<.1||x>.5)throw new RangeError('Invalid motion');
 target=Math.max(.1,Math.min(.5,target));const speed=Math.min(.2,Math.abs(p.speed??.2));finite(speed);
 const dx=Math.sign(target-x)*Math.min(Math.abs(target-x),speed*dt),next=x+dx,v=dt&&dx?Math.sign(dx)*speed:0;
 let energy=0;
 if(dx){const duration=Math.abs(dx)/speed,n=Math.max(2,2*Math.ceil(Math.abs(dx)/.002));for(let j=0;j<=n;j++){const s=pickup(p,x+dx*j/n,v);energy+=(j===0||j===n?1:j%2?4:2)*s.power;}energy*=duration/(3*n);}
 const stopped=Math.abs(next-target)<1e-12;return {...pickup(p,next,stopped?0:v),energy};
}
export function rlStep(p,i0,dt){
 finite(p.U,i0,dt);positive(p.R,p.L,p.A);turns(p.N);if(dt<0)throw new RangeError('Invalid time');
 const tau=p.L/p.R,a=p.U/p.R,b=i0-a,z=dt/tau,decay=Math.exp(-z),one=-Math.expm1(-z),two=-Math.expm1(-2*z);
 const current=i0*decay+a*one,derivative=(p.U-p.R*current)/p.L;
 const source=p.U*(a*dt+b*tau*one),heat=Math.max(0,p.R*(a*a*dt+2*a*b*tau*one+b*b*tau*two/2));
 return {current,derivative,flux:p.L*current/p.N,linkage:p.L*current,B:p.L*current/(p.N*p.A),emf:-p.L*derivative,stored:.5*p.L*current**2,source,heat,power:p.R*current**2,inputPower:p.U*current,tau};
}
export function transformer(p,t){
 turns(p.N1);turns(p.N2);positive(p.R);finite(p.phi,p.omega,t);if(p.phi<0||p.omega<0||t<0)throw new RangeError('Invalid transformer');
 const flux=p.phi*Math.cos(p.omega*t),u1=p.N1*p.phi*p.omega*Math.sin(p.omega*t),u2=p.N2*p.phi*p.omega*Math.sin(p.omega*t),current=p.open?0:u2/p.R,i1=p.N2/p.N1*current;
 const u1rms=p.N1*p.phi*p.omega/Math.SQRT2,u2rms=p.N2*p.phi*p.omega/Math.SQRT2;
 return {flux,emf:u2,u1,u2,current,i1,power:u2*current,inputPower:u1*i1,u1rms,u2rms,meanPower:p.open?0:u2rms*u2rms/p.R};
}
export function uniformRamp(p){positive(p.dt,p.R);finite(p.N,p.A,p.B0,p.B1);const emf=-p.N*p.A*(p.B1-p.B0)/p.dt;return {emf,current:emf/p.R,power:emf*emf/p.R};}
