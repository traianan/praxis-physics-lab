/* SI units; inward radial direction is positive in the bank force balance. */
(()=>{
 const g=9.81;
 function circular(R,omega,m=1,theta=0){return{R,omega,m,theta,T:omega?2*Math.PI/Math.abs(omega):Infinity,frequency:Math.abs(omega)/(2*Math.PI),v:Math.abs(omega)*R,a:omega*omega*R,F:m*omega*omega*R,x:R*Math.cos(theta),y:R*Math.sin(theta),vx:-omega*R*Math.sin(theta),vy:omega*R*Math.cos(theta),ax:-omega*omega*R*Math.cos(theta),ay:-omega*omega*R*Math.sin(theta)};}
 function bank(r,angle,mu,v=0){
  const theta=angle*Math.PI/180,s=Math.sin(theta),c=Math.cos(theta),lo=g*r*(s-mu*c)/(c+mu*s),den=c-mu*s;
  const min=Math.sqrt(Math.max(0,lo)),max=den<=0?Infinity:Math.sqrt(Math.max(0,g*r*(s+mu*c)/den)),optimal=Math.sqrt(Math.max(0,r*g*Math.tan(theta)));
  const q=v*v/r,N=g*c+q*s,requiredFriction=g*s-q*c,capacity=mu*N,friction=Math.max(-capacity,Math.min(capacity,requiredFriction)),tolerance=1e-9;
  return{min,max,optimal,N,requiredFriction,friction,capacity,q,status:v<min-tolerance?'low':v>max+tolerance?'high':'safe',realX:-N*s+friction*c,realY:N*c+friction*s-g};
 }
 window.PraxisMCUModel={g,circular,bank};
})();
