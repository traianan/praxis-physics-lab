// Visual wavefronts only: radius is identical in every direction at a given time.
// This deliberately slowed propagation is not a photon count or light-speed model.
export function wavefrontRadii(time,radius,count=3){
  return Array.from({length:count},(_,i)=>radius*((time*.6+i/count)%1));
}
export function wavefrontArc(cx,cy,radius,alpha,axis){
  const start=axis-alpha,end=axis+alpha;
  return `M${cx+radius*Math.cos(start)} ${cy+radius*Math.sin(start)} A${radius} ${radius} 0 ${alpha>Math.PI/2?1:0} 1 ${cx+radius*Math.cos(end)} ${cy+radius*Math.sin(end)}`;
}
