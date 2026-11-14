// SI units. Uniform gravity, no air resistance, flat ground y=0; +y upward.
export function flight({height=0,speed=20,angle=45,g=9.81,mass=1}={}) {
  if(![height,speed,angle,g,mass].every(Number.isFinite)||height<0||speed<0||g<=0||mass<=0||Math.abs(angle)>90)throw new RangeError('Invalid flight parameters');
  const radians=angle*Math.PI/180;
  const vx=Math.abs(angle)===90?0:speed*Math.cos(radians),vy0=speed*Math.sin(radians);
  const root=Math.sqrt(vy0*vy0+2*g*height);
  // Stable positive root for downward launches from very small heights.
  const duration=vy0<0?(height===0?0:2*height/(root-vy0)):(vy0+root)/g;
  const apexTime=Math.min(duration,Math.max(0,vy0/g));
  return {height,speed,angle,g,mass,vx,vy0,duration,range:vx*duration,apexTime,
    maxHeight:height+vy0*apexTime-.5*g*apexTime*apexTime,impactSpeed:Math.hypot(vx,root)};
}
export function sample(f,time) {
  const t=Math.min(f.duration,Math.max(0,time));
  const y=t>=f.duration?0:Math.max(0,f.height+f.vy0*t-.5*f.g*t*t),vy=f.vy0-f.g*t;
  const speed=Math.hypot(f.vx,vy),kinetic=.5*f.mass*speed*speed,potential=f.mass*f.g*y;
  return {t,x:f.vx*t,y,vx:f.vx,vy,speed,kinetic,potential,energy:kinetic+potential,ended:t>=f.duration};
}
export function trajectory(f,count=121){return Array.from({length:count},(_,i)=>sample(f,f.duration*i/(count-1)));}
export function optimalAngle(height,speed,g){return Math.atan(speed/Math.sqrt(speed*speed+2*g*height))*180/Math.PI;}
export function safetyHeight({height,speed,g},x){return speed>0?height+speed*speed/(2*g)-g*x*x/(2*speed*speed):NaN;}
export function safetyRange({height,speed,g}){return speed/g*Math.sqrt(speed*speed+2*g*height);}
