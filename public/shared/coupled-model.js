(()=>{
 const G=9.81;
 function response(w0,b,F,m,omega){return F/(m*Math.hypot(w0*w0-omega*omega,2*b*omega));}
 function resonance(w0,b){return b<w0/Math.SQRT2?Math.sqrt(w0*w0-2*b*b):0;}
 function rk4(y,t,h,f){const a=f(t,y),b=f(t+h/2,y.map((v,i)=>v+h*a[i]/2)),c=f(t+h/2,y.map((v,i)=>v+h*b[i]/2)),d=f(t+h,y.map((v,i)=>v+h*c[i]));return y.map((v,i)=>v+h*(a[i]+2*b[i]+2*c[i]+d[i])/6);}
 function derivative(kind,p){if(kind===1)return(t,[x,v])=>[v,p.F*Math.cos(p.Om*t+(p.phaseOffset||0))/p.m-2*p.b*v-p.w0*p.w0*x];if(kind===4)return(t,[x,v])=>[v,(-p.k*x-p.c*v)/p.m];return(t,[a,u,b,v])=>{const trig=kind===2?Math.sin:a=>a,cos=kind===2?Math.cos:()=>1,delta=p.L2*trig(b)-p.L1*trig(a),gravity=trig;return[u,-G/p.L1*gravity(a)+p.k/(p.m*p.L1)*delta*cos(a)-p.gamma*u,v,-G/p.L2*gravity(b)-p.k/(p.m*p.L2)*delta*cos(b)-p.gamma*v];};}
 function advance(kind,y,t,dt,p){const f=derivative(kind,p),n=Math.max(1,Math.ceil(dt*240)),h=dt/n;for(let i=0;i<n;i++)y=rk4(y,t+i*h,h,f);return y;}
 function energy(y,p){const[a,u,b,v]=y,trig=p.linear?x=>x:Math.sin,potential=p.linear?x=>x*x/2:x=>1-Math.cos(x),delta=p.L2*trig(b)-p.L1*trig(a);return {e1:.5*p.m*p.L1*p.L1*u*u+p.m*G*p.L1*potential(a),e2:.5*p.m*p.L2*p.L2*v*v+p.m*G*p.L2*potential(b),coupling:.5*p.k*delta*delta};}
 window.PraxisCoupledModel={response,resonance,rk4,advance,energy,G};
})();
