// SI only. No DOM, timers or rendering dependencies.
export const F=96485.33212, RG=8.31446261815324, T=298.15, E0=1.10;
export const MZN=.06538, MCU=.063546, CUTOFF=1;
export const DEFAULTS=Object.freeze({cZn:1000,cCu:1000,vZn:1e-4,vCu:1e-4,mZn:.01,R:10,r:2,open:false,bridge:true});
export function validate(p){
 for(const k of ['cZn','cCu','vZn','vCu','mZn','R','r'])if(!Number.isFinite(p[k]))throw new RangeError(k);
 if(p.cZn<=0||p.cCu<CUTOFF||p.vZn<=0||p.vCu<=0||p.mZn<0||p.R<0||p.r<=0)throw new RangeError('physical domain');
 if(typeof p.open!=='boolean'||typeof p.bridge!=='boolean')throw new TypeError('switches');
 return p;
}
export const initial=()=>({t:0,xi:0,external:0,internal:0});
export function limit(p){return Math.min(p.mZn/MZN,Math.max(0,(p.cCu-CUTOFF)*p.vCu));}
export function emf(p,xi=0){
 const z=p.cZn+xi/p.vZn,c=p.cCu-xi/p.vCu;
 if(z<=0||c<=0)throw new RangeError('positive activities required');
 return E0-RG*T/(2*F)*Math.log(z/c);
}
export function observe(p,s){
 const max=limit(p),ended=s.xi>=max-1e-14,E=emf(p,s.xi);
 const current=!ended&&!p.open&&p.bridge?Math.max(0,E)/(p.R+p.r):0;
 return {...s,E,current,voltage:(!p.bridge||ended)?null:p.open?E:current*p.R,
  cZn:p.cZn+s.xi/p.vZn,cCu:p.cCu-s.xi/p.vCu,mZn:Math.max(0,p.mZn-MZN*s.xi),copperGain:MCU*s.xi,
  charge:2*F*s.xi,deltaG:-2*F*E,pExternal:current*current*p.R,pInternal:current*current*p.r,
  pChemical:E*current,ended,progress:max>0?s.xi/max:1};
}
// Stable primitive increment for n ln(n/nStandard) - n.
function entropyIncrement(n,d,standard){return d*Math.log(n/standard)+(n+d)*Math.log1p(d/n)-d;}
export function chemicalEnergy(p,a,b){
 const d=b-a,nz=p.cZn*p.vZn+a,nc=p.cCu*p.vCu-a;
 return 2*F*E0*d-RG*T*(entropyIncrement(nz,d,1000*p.vZn)+entropyIncrement(nc,-d,1000*p.vCu));
}
export function advance(p,s,seconds,maxStep=1){
 validate(p);if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(maxStep)||maxStep<=0)throw new RangeError('time');
 let next={...s},remaining=seconds,max=limit(p);
 if(!Number.isFinite(s.xi)||s.xi<0||s.xi>max+1e-14)throw new RangeError('extent');
 if(p.open||!p.bridge)return {...next,t:next.t+seconds};
 while(remaining>1e-10&&next.xi<max-1e-14){
  let dt=Math.min(maxStep,remaining),available=max-next.xi;
  const rate=d=>Math.max(0,emf(p,next.xi+d/2))/(2*F*(p.R+p.r));
  if(rate(0)===0)break;
  let delta;
  if(dt*rate(available)>=available){delta=available;dt=available/rate(available);}
  else {let lo=0,hi=Math.min(available,dt*rate(0));for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(mid>dt*rate(mid))hi=mid;else lo=mid;}delta=(lo+hi)/2;}
  const energy=chemicalEnergy(p,next.xi,next.xi+delta);
  next={t:next.t+dt,xi:Math.min(max,next.xi+delta),external:next.external+energy*p.R/(p.R+p.r),internal:next.internal+energy*p.r/(p.R+p.r)};
  remaining-=dt;
 }
 return next;
}
