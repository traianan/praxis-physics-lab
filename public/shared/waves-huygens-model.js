/* Geometric Huygens construction in units A'B'=1, v1=1. */
(() => {
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function snapshot({kind='reflection',angle=40,ratio=.7,progress=0}={}){
  angle=clamp(Number(angle),15,60);ratio=clamp(Number(ratio),.5,1.1);progress=clamp(Number(progress),0,1);
  const i=angle*Math.PI/180,s=Math.sin(i),c=Math.cos(i),v=kind==='reflection'?1:ratio,r=kind==='reflection'?i:Math.asin(v*s);
  const duration=s,time=(-.4+1.8*progress)*duration,n={x:Math.sin(r),y:(kind==='reflection'?1:-1)*Math.cos(r)};
  const incidentDirection={x:s,y:-c},B0={x:c*c,y:s*c},B={x:B0.x+time*s,y:B0.y-time*c};
  const first={x:time*s,y:-time*c},contact=clamp(time/s,0,1);
  const incident=time<0?[first,B]:time<duration-1e-12?[{x:contact,y:0},B]:null;
  const tangent=(x)=>{const age=Math.max(0,time-x*s),radius=v*age;return{x:x+radius*n.x,y:radius*n.y};};
  const sources=Array.from({length:9},(_,j)=>{
   const x=j/8,birth=x*s,active=time>=birth-1e-12,age=active?Math.max(0,time-birth):0;
   return {x,y:0,birth,active,age,radius:v*age,tangent:tangent(x)};
  });
  const front=time>0?[tangent(0),tangent(contact)]:null;
  const stage=time<0?0:progress<.62?1:time<=duration+1e-9?2:3;
  return {kind,angle,ratio,progress,i,r,v1:1,v2:ratio,speed:v,duration,time,stage,n,incidentDirection,B0,incident,contact,sources,front,showEnvelope:!!front&&progress>=.62};
 }
 window.PraxisHuygens={snapshot,stages:[0,.48,7/9,1]};
})();
