/* Linear long waves, fixed bottom, staggered conservative fluxes (SI units).
   eta_t = -div(Q), Q_t = -g h grad(eta). No inundation/run-up model.
   Leapfrog time staggering; the first half-step is initialised from Q(t=0)=0.
   The fixed CFL step and accumulator are independent of rendering/FPS. */
(()=>{
 const g=9.81;
 const sources=Object.freeze([{id:'west',x:.25,y:.55},{id:'south',x:.42,y:.76},{id:'east',x:.81,y:.12}].map(Object.freeze));
 function bathymetry(nx,ny){
  const depth=new Float64Array(nx*ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const x=(i+.5)/nx,y=(j+.5)/ny;
   const coast=.065+.012*Math.sin(8*y),east=.95-.018*Math.sin(6*y);
   const island=Math.hypot((x-.68)/.047,(y-.55)/.09);
   if(x<=coast||x>=east||island<1)continue;
   const shelf=Math.min(1,(x-coast)/.17,(east-x)/.17,(island-1)/1.3);
   const ridge=900*Math.exp(-(((x-.51)/.045)**2));
   depth[j*nx+i]=Math.max(100,100+3900*Math.max(0,shelf)-ridge);
  }
  return depth;
 }
 function create(options={}){
  const nx=options.nx??120,ny=options.ny??72,dx=options.dx??10000;
  if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx<3||ny<3||!(dx>0))throw Error('Invalid grid');
  const depth=options.depth?Float64Array.from(options.depth):bathymetry(nx,ny),size=nx*ny;
  if(depth.length!==size||depth.some(h=>!Number.isFinite(h)||h<0)||!depth.some(h=>h>0))throw Error('Invalid bathymetry');
  const eta=new Float64Array(size),qx=new Float64Array((nx+1)*ny),qy=new Float64Array(nx*(ny+1));
  const hx=new Float64Array(qx.length),hy=new Float64Array(qy.length),damping=new Float64Array(size).fill(1);
  const maxDepth=depth.reduce((a,b)=>Math.max(a,b),0),dt=.45*dx/Math.sqrt(2*g*maxDepth);
  let time=0,credit=0,source=sources[0],amplitude=.5;
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
   const k=y*nx+x;
   if(x&&depth[k]&&depth[k-1])hx[y*(nx+1)+x]=(depth[k]+depth[k-1])/2;
   if(y&&depth[k]&&depth[k-nx])hy[y*nx+x]=(depth[k]+depth[k-nx])/2;
   // Open ocean at north/south: smooth absorbing strip, not a fictitious coast.
   if(options.sponge!==false){const edge=Math.min(y,ny-1-y),width=Math.min(8,ny/4);if(edge<width)damping[k]=Math.exp(-dt/100*((width-edge)/width)**2);}
  }
  const stations=(options.stations??[{id:'A',x:.38,y:.3},{id:'B',x:.72,y:.3},{id:'C',x:.89,y:.72}]).map(s=>({...s,arrival:null,maximum:0,value:0}));
  const index=(x,y)=>Math.min(ny-1,Math.max(0,Math.floor(y*ny)))*nx+Math.min(nx-1,Math.max(0,Math.floor(x*nx)));
  function depthAt(x,y){return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<1&&y>=0&&y<1?depth[index(x,y)]:0;}
  function initialise(fn){
   time=0;credit=0;qx.fill(0);qy.fill(0);eta.fill(0);
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const k=y*nx+x;if(depth[k])eta[k]=fn((x+.5)*dx,(y+.5)*dx);}
   // Q(-dt/2) = +g h grad(eta(0)) dt/2.
   for(let y=0;y<ny;y++)for(let x=1;x<nx;x++){const k=y*nx+x,kq=y*(nx+1)+x;qx[kq]=.5*dt*g*hx[kq]*(eta[k]-eta[k-1])/dx;}
   for(let y=1;y<ny;y++)for(let x=0;x<nx;x++){const k=y*nx+x;qy[k]=.5*dt*g*hy[k]*(eta[k]-eta[k-nx])/dx;}
   for(const station of stations){station.value=eta[index(station.x,station.y)];station.maximum=Math.abs(station.value);station.arrival=station.maximum>=amplitude*.01?0:null;}
  }
  function reset(next={}){
   const nextSource=next.source??source,nextAmplitude=next.amplitude??amplitude;
   if(depthAt(nextSource.x,nextSource.y)<500)throw Error('Source must be in water at least 500 m deep');
   if(!Number.isFinite(nextAmplitude)||nextAmplitude<.1||nextAmplitude>2)throw Error('Invalid source amplitude');
   source={...nextSource};amplitude=nextAmplitude;
   const sx=(Math.floor(source.x*nx)+.5)*dx,sy=(Math.floor(source.y*ny)+.5)*dx,sigma=40000;
   initialise((x,y)=>{const r2=((x-sx)**2+(y-sy)**2)/sigma**2;return r2<=16?amplitude*Math.exp(-.5*r2):0;});
  }
  function step(){
   const a=g*dt/dx,b=dt/dx;
   for(let y=0;y<ny;y++)for(let x=1;x<nx;x++){const k=y*nx+x,q=y*(nx+1)+x;qx[q]=(qx[q]-a*hx[q]*(eta[k]-eta[k-1]))*Math.min(damping[k],damping[k-1]);}
   for(let y=1;y<ny;y++)for(let x=0;x<nx;x++){const k=y*nx+x;qy[k]=(qy[k]-a*hy[k]*(eta[k]-eta[k-nx]))*Math.min(damping[k],damping[k-nx]);}
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const k=y*nx+x;if(depth[k])eta[k]=(eta[k]-b*(qx[y*(nx+1)+x+1]-qx[y*(nx+1)+x]+qy[k+nx]-qy[k]))*damping[k];}
   time+=dt;
   for(const s of stations){s.value=eta[index(s.x,s.y)];s.maximum=Math.max(s.maximum,Math.abs(s.value));if(s.arrival===null&&Math.abs(s.value)>=amplitude*.01)s.arrival=time;}
  }
  function advance(seconds){
   if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid elapsed time');
   credit+=seconds;let count=0;
   while(credit+1e-9>=dt){step();credit-=dt;count++;}
   if(Math.abs(credit)<1e-9)credit=0;
   return count;
  }
  function diagnostics(){let maxAbs=0,volume=0,finite=true;for(const v of eta){maxAbs=Math.max(maxAbs,Math.abs(v));volume+=v*dx*dx;finite&&=Number.isFinite(v);}return {maxAbs,volume,finite};}
  const model={nx,ny,dx,depth,eta,stations,dt,reset,initialise,advance,depthAt,diagnostics,index,get time(){return time;},get source(){return {...source};},get amplitude(){return amplitude;}};
  if(!options.depth)reset();
  return model;
 }
 window.PraxisTsunamiModel=Object.freeze({create,sources,g});
})();
