/* Qualitative, normalized engineering stress–strain paths, not material data. */
((scope)=>{
 const curves={ductile:[[0,0],[.16,.42],[.23,.51],[.34,.54],[.70,.88],[.94,.65]],brittle:[[0,0],[.50,.85]],elastomer:[[0,0],[.18,.04],[.38,.12],[.56,.30],[.70,.58],[.80,.94]]};
 function stress(kind,x){const a=curves[kind],slopes=kind==='ductile'?[2.625,2.625,.6,.6,0,-1.1]:[.22,.22,.7,1.4,3,3.6];for(let i=1;i<a.length;i++){const [x0,y0]=a[i-1],[x1,y1]=a[i];if(x<=x1){const h=x1-x0,u=(x-x0)/h;if(i===1||kind==='brittle')return y0+(y1-y0)*u;return (2*u**3-3*u*u+1)*y0+(u**3-2*u*u+u)*h*slopes[i-1]+(-2*u**3+3*u*u)*y1+(u**3-u*u)*h*slopes[i];}}return a.at(-1)[1];}
 function cycle(kind,level,t){
  const a=curves[kind],peak=a.at(-1)[0]*level/100,top=stress(kind,peak),plastic=kind==='ductile'&&peak>.23,residual=plastic?Math.max(0,peak-top/(.42/.16)):0,phase=Math.min(8,Math.max(0,t)),unloading=phase>4,u=unloading?(phase-4)/4:phase/4;
  const x=unloading?peak+(residual-peak)*u:peak*u,y=unloading&&plastic?top*(1-u):stress(kind,x);
  return {x,y,peak,top,residual,plastic,unloading,done:phase===8};
 }
 function fracture(kind,t){
  const end=curves[kind].at(-1),phase=Math.min(8,Math.max(0,t)),x=end[0]*Math.min(1,phase/6),y=stress(kind,x),broken=phase>=6;
  return {x,y,peak:end[0],top:end[1],residual:0,plastic:false,unloading:false,broken,gap:broken?2+16*Math.min(1,phase-6):0,load:broken?0:y,done:phase===8};
 }
 scope.PraxisMaterialModel=Object.freeze({curves,stress,cycle,fracture});
})(typeof window==='undefined'?globalThis:window);
