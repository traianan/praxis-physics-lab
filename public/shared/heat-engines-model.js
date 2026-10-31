/* Four-stroke mechanism, with finite visual dwell for ideal constant-volume heat transfer.
   Pressure and volume use the shared air-standard model: p/p0 and V/Vmin. */
(() => {
 function create(kind='otto'){
  // Illustrative ratios keep all four branches legible on a symbolic p–V diagram.
  const cycle=window.PraxisIdealEngineCycles.create(kind,{compression:kind==='otto'?3:4,heatRatio:3,cutoff:2});
  const dwell=28,heating=kind==='otto'?dwell:0,period=720+heating+dwell;
  const boundaries=[180,360,540+heating+dwell,period];
  const displacement=angle=>{const a=angle*Math.PI/180,l=3.2;return (1+l-Math.cos(a)-Math.sqrt(l*l-Math.sin(a)**2))/2;};
  const volume=angle=>1+(cycle.compression-1)*displacement(angle);
  function at(progress){
   const a=((progress%period)+period)%period;
   let angle,phase,u;
   if(a<180){angle=a;phase=0;u=displacement(angle);}
   else if(a<360){angle=a;phase=1;u=1-displacement(angle);}
   else if(heating&&a<360+heating){angle=360;phase=2;u=(a-360)/heating;}
   else if(a<540+heating){
    angle=a-heating;const V=volume(angle),v3=cycle.states[3].V;
    if(kind==='diesel'&&V<v3){phase=2;u=(V-1)/(v3-1);}
    else{phase=3;u=(V-v3)/(cycle.compression-v3);}
   }else if(a<540+heating+dwell){angle=540;phase=4;u=(a-540-heating)/dwell;}
   else{angle=a-heating-dwell;phase=5;u=1-displacement(angle);}
   return {...cycle.point(phase,u),angle,phase,fraction:u,stroke:phase===0?0:phase===1?1:phase<=3?2:3};
  }
  return {cycle,period,boundaries,at};
 }
 window.PraxisHeatEnginesModel={create};
})();
