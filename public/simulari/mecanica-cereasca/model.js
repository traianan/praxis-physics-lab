// Ideal two-body model. Solar experiments use AU, Julian years and solar masses.
export const TAU=2*Math.PI;
export const AU_KM=149597870.7;
export const YEAR=365.25*86400;
export const EARTH_MU=398600.435507; // km^3 s^-2, JPL DE440
export const EARTH_RADIUS=6378.137; // equatorial reference radius, km
export const SIDEREAL_DAY=86164.09054;
const positive=x=>{if(!Number.isFinite(x)||x<=0)throw new RangeError('Positive finite value required');return x;};
export function ellipse(a,e){
 positive(a);if(!Number.isFinite(e)||e<0||e>=1)throw new RangeError('Elliptic orbit requires 0 <= e < 1');
 return {a,e,b:a*Math.sqrt(1-e*e),c:a*e,rp:a*(1-e),ra:a*(1+e)};
}
export function period(a,mass=1){return Math.sqrt(positive(a)**3/positive(mass));}
export function orbit(a,e,mean,mass=1){
 const shape=ellipse(a,e),T=period(a,mass),mu=TAU**2*mass;
 if(!Number.isFinite(mean))throw new RangeError('Finite anomaly required');
 mean=((mean%TAU)+TAU)%TAU;
 let E=e<.8?mean:Math.PI;
 for(let i=0;i<30;i++){const delta=(E-e*Math.sin(E)-mean)/(1-e*Math.cos(E));E-=delta;if(Math.abs(delta)<1e-13)break;}
 const factor=(TAU/T)/(1-e*Math.cos(E));
 const x=a*(Math.cos(E)-e),y=shape.b*Math.sin(E),vx=-a*Math.sin(E)*factor,vy=shape.b*Math.cos(E)*factor;
 return {...shape,E,mean,T,x,y,vx,vy,r:Math.hypot(x,y),speed:Math.hypot(vx,vy),specificH:Math.sqrt(mu*a*(1-e*e)),areaRate:Math.sqrt(mu*a*(1-e*e))/2};
}
export function sweptArea(a,e,deltaMean){return .5*a*ellipse(a,e).b*deltaMean;}
export function circular(altitude){
 if(!Number.isFinite(altitude)||altitude<0)throw new RangeError('Nonnegative altitude required');
 const r=EARTH_RADIUS+altitude,speed=Math.sqrt(EARTH_MU/r);
 return {r,speed,escape:Math.SQRT2*speed,T:TAU*r/speed,g:1000*EARTH_MU/r**2};
}
export function geostationaryAltitude(){return Math.cbrt(EARTH_MU*(SIDEREAL_DAY/TAU)**2)-EARTH_RADIUS;}
export function isGeostationary(altitude,inclination,direction){return Math.abs(circular(altitude).T-SIDEREAL_DAY)<30&&Math.abs(inclination)<.01&&direction===1;}
