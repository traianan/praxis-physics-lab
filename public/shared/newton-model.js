/* SI quantities; drawing scale is independent of physical results. */
((scope)=>{
 const g=9.8;
 const resultant=(f1,f2,degrees)=>Math.sqrt(Math.max(0,f1*f1+f2*f2+2*f1*f2*Math.cos(degrees*Math.PI/180)));
 const incline=(m,degrees,muS,muK)=>{const a=degrees*Math.PI/180,N=m*g*Math.cos(a),parallel=m*g*Math.sin(a),limit=muS*N,sliding=parallel>limit+1e-9,friction=sliding?muK*N:parallel;return {N,parallel,limit,sliding,friction,acceleration:sliding?(parallel-friction)/m:0,phi:Math.atan(muS)*180/Math.PI};};
 function cartStep({x=0,v=0,t=0,F,m},dt,repeat=false,limit=440/12){
  const a=F/m;
  while(dt>0){
   const distance=Math.max(0,limit-x),hit=distance===0?0:a>0?2*distance/(v+Math.sqrt(v*v+2*a*distance)):v>0?distance/v:Infinity;
   if(hit>dt)return {x:x+v*dt+.5*a*dt*dt,v:v+a*dt,t:t+dt,end:false};
   x=limit;v+=a*hit;t+=hit;
   if(!repeat)return {x,v,t,end:true};
   dt-=hit;x=0;v=0;t=0;
  }
  return {x,v,t,end:false};
 }
 function spring(m,k,t=0,moving=false){
  const equilibrium=m*g/k,omega=Math.sqrt(k/m),period=2*Math.PI/omega,amplitude=moving ? .25*equilibrium : 0,offset=amplitude*Math.cos(omega*t),x=equilibrium+offset,v=-amplitude*omega*Math.sin(omega*t),a=-omega*omega*offset;
  return {equilibrium,omega,period,amplitude,x,v,a,weight:m*g,elastic:k*x,elasticX:-k*x,net:m*g-k*x,energy:.5*k*offset*offset+.5*m*v*v};
 }
 const api={g,resultant,incline,cartStep,spring,acceleration:(F,m)=>F/m,meanForce:(m,dv,dt)=>m*dv/dt,extension:(m,k)=>m*g/k,recoil:(m1,m2,J)=>({v1:-J/m1,v2:J/m2})};
 scope.PraxisNewtonModel=Object.freeze(api);
})(typeof window==='undefined'?globalThis:window);
