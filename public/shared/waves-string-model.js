/* Ideal taut string, small transverse displacement, uniform tension and line density.
   SI units. Analytic travelling waves: no numerical integration or frame-dependent step.
   A is one travelling-wave amplitude; the compact pulse has total support 0.12 L. */
(()=>{
 const defaults=Object.freeze({L:2,tension:80,mu:.02,n:1,right:'fixed'});
 function parameters(options={}){
  const p={...defaults,...options};
  for(const[key,min,max]of[['L',.5,3],['tension',10,200],['mu',.005,.05],['n',1,6]])if(!Number.isFinite(p[key])||p[key]<min||p[key]>max)throw Error('Invalid string parameter '+key);
  if(!Number.isInteger(p.n)||!['fixed','free'].includes(p.right))throw Error('Invalid string boundary or mode');
  // Even mode 6 then has maximum standing-wave slope below 0.08.
  return Object.freeze({...p,A:.002*p.L});
 }
 const speed=p=>Math.sqrt(p.tension/p.mu);
 function mode(p){
  const count=p.right==='fixed'?p.n:2*p.n-1,wavelength=p.right==='fixed'?2*p.L/count:4*p.L/count;
  const nodes=p.right==='fixed'?Array.from({length:p.n+1},(_,j)=>j*p.L/p.n):Array.from({length:p.n},(_,j)=>2*j*p.L/count);
  const antinodes=p.right==='fixed'?Array.from({length:p.n},(_,j)=>(j+.5)*p.L/p.n):Array.from({length:p.n},(_,j)=>(2*j+1)*p.L/count);
  return{wavelength,frequency:speed(p)/wavelength,nodes,antinodes};
 }
 function image(p,s){
  const period=2*p.L,cycle=Math.floor(s/period),local=s-cycle*period,distance=local-p.L/4,halfWidth=.06*p.L;
  if(Math.abs(distance)>=halfWidth)return 0;
  const sign=p.right==='free'&&cycle%2!==0?-1:1;
  return sign*p.A*.5*(1+Math.cos(Math.PI*distance/halfWidth));
 }
 function pulse(p,x,time){
  const travel=speed(p)*time,incident=image(p,x-travel),reflected=-image(p,-x-travel);
  return{incident,reflected,sum:incident+reflected};
 }
 function standing(p,x,time){
  const info=mode(p),phase=2*Math.PI*x/info.wavelength,clock=2*Math.PI*time*info.frequency;
  const incident=p.A*Math.sin(phase-clock),reflected=p.A*Math.sin(phase+clock);
  return{incident,reflected,sum:incident+reflected};
 }
 function displayRate(p,kind){
  return kind==='reflection'?p.L/speed(p)/1.5:.2/mode({...p,n:1}).frequency;
 }
 function create(options={},kind='standing'){
  if(!['reflection','standing'].includes(kind))throw Error('Invalid string activity');
  let params=parameters(options),time=0;
  function reset(next={}){params=parameters({...params,...next});time=0;}
  function seekCrossings(value){
   if(!Number.isFinite(value)||value<0||value>4)throw Error('Invalid pulse time');
   time=value*params.L/speed(params);
  }
  function advanceWall(seconds){
   if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid elapsed time');
   time+=seconds*displayRate(params,kind);
   if(kind==='reflection')time=Math.min(time,4*params.L/speed(params));
  }
  return{kind,get params(){return params;},get time(){return time;},get crossings(){return time*speed(params)/params.L;},reset,seekCrossings,advanceWall};
 }
 window.PraxisStringWaves=Object.freeze({parameters,speed,mode,pulse,standing,displayRate,create});
})();
