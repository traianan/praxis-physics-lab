/** Pure SI model. Rendering, clocks and input conversion belong to the UI. */
export const DEFAULTS = Object.freeze({k:100,m:1,x0:0.1});
export const LIMITS = Object.freeze({k:[10,200],m:[0.2,5],x0:[-0.2,0.2]});
export function validate(p) {
  for (const [key,[min,max]] of Object.entries(LIMITS)) {
    if (!Number.isFinite(p[key]) || p[key]<min || p[key]>max) throw new RangeError(key);
  }
  return p;
}
export function elastic(k,x) {
  if(!Number.isFinite(k)||k<=0||!Number.isFinite(x)) throw new RangeError('k,x');
  return {force:-k*x,potential:0.5*k*x*x};
}
export function work(k,from,to) { return elastic(k,from).potential-elastic(k,to).potential; }
export function observe(p,t=0,released=false) {
  validate(p);
  if(!Number.isFinite(t)||t<0) throw new RangeError('t');
  const omega=Math.sqrt(p.k/p.m),period=2*Math.PI/omega;
  const x=released?p.x0*Math.cos(omega*t):p.x0;
  const v=released?-omega*p.x0*Math.sin(omega*t):0;
  const {force,potential}=elastic(p.k,x),kinetic=0.5*p.m*v*v;
  return {t,x,v,force,potential,kinetic,energy:potential+kinetic,initialEnergy:0.5*p.k*p.x0*p.x0,
    applied:released?0:-force,acceleration:released?force/p.m:0,power:force*v,omega,period,released};
}
