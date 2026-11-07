/* Ideal linear capacitor. Geometry in SI; exact RC evolution, no Euler overshoot. */
(function(root){
  const epsilon0=8.8541878128e-12;
  function capacitance(area,distance,er=1){return epsilon0*er*area/distance;}
  function advance(q,C,source,R,dt,mode){
    if(mode==='off')return q;
    const target=mode==='charge'?C*source:0;
    return target+(q-target)*Math.exp(-dt/(R*C));
  }
  function current(q,C,source,R,mode){return mode==='off'?0:((mode==='charge'?source:0)-q/C)/R;}
  root.CapacitorModel={epsilon0,capacitance,advance,current};
})(globalThis);
