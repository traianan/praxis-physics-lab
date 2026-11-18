/* Independent analytical model, also used by the lesson's controls and renderer. */
(() => {
 const roots=(a,b,c)=>{
  if(a===0)return b===0?(c===0?null:[]):[-c/b];
  const d=b*b-4*a*c,tolerance=1e-12*Math.max(1,b*b,Math.abs(4*a*c));
  if(d < -tolerance)return [];
  if(Math.abs(d)<=tolerance)return [-b/(2*a)];
  const q=-.5*(b+(b>=0?1:-1)*Math.sqrt(d));
  return [q/a,c/q].sort((x,y)=>x-y);
 };
 const step=(value,increment,min,max)=>Math.min(max,Math.max(min,Math.round((value+increment)*1e10)/1e10));
 const physics=p=>{
  const g=p.g;
  if(p.ex==='proj'){
   const angle=p.th*Math.PI/180,vx=p.v0*Math.cos(angle),vy=p.v0*Math.sin(angle);
   return {tEnd:2*vy/g,height:vy*vy/(2*g),range:2*vx*vy/g,pos:t=>({x:vx*t,y:vy*t-g*t*t/2})};
  }
  const h=p.ex==='up'?p.h0:p.H,v=p.ex==='up'?p.vu:0;
  return {tEnd:(v+Math.sqrt(v*v+2*g*h))/g,height:h+v*v/(2*g),impact:Math.sqrt(v*v+2*g*h),pos:t=>({x:t,y:h+v*t-g*t*t/2})};
 };
 window.QuadraticModel={roots,step,physics};
})();
