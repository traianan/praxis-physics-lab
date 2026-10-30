/* Air-standard ideal cycles. Pressure and volume are normalised by p0 and Vmin. */
(() => {
 function create(kind='otto',{compression=8,gamma=1.4,heatRatio=2.2,cutoff=2}={}){
  if(!['otto','diesel'].includes(kind))throw new RangeError('Unknown cycle');
  if(!Number.isFinite(compression)||compression<=1||!Number.isFinite(gamma)||gamma<=1||(kind==='otto'&&(!Number.isFinite(heatRatio)||heatRatio<=1))||(kind==='diesel'&&(!Number.isFinite(cutoff)||cutoff<=1||cutoff>=compression)))throw new RangeError('Invalid ideal-cycle parameters');
  const r=compression,minimum=1,maximum=r,p0=1,p2=r**gamma,V3=kind==='otto'?minimum:cutoff,p3=kind==='otto'?p2*heatRatio:p2,p4=p3*(V3/r)**gamma;
  const states=[{V:minimum,p:p0},{V:maximum,p:p0},{V:minimum,p:p2},{V:V3,p:p3},{V:maximum,p:p4}];
  const branches=[{from:0,to:1,type:'isobaric'},{from:1,to:2,type:'adiabatic'},{from:2,to:3,type:kind==='otto'?'isochoric':'isobaric'},{from:3,to:4,type:'adiabatic'},{from:4,to:1,type:'isochoric'},{from:1,to:0,type:'isobaric'}];
  function point(index,fraction){
   if(!branches[index])throw new RangeError('Unknown phase');
   const u=Math.max(0,Math.min(1,fraction)),branch=branches[index],a=states[branch.from],b=states[branch.to],V=a.V+(b.V-a.V)*u;
   const p=branch.type==='adiabatic'?a.p*(a.V/V)**gamma:a.p+(b.p-a.p)*u;
   return {V,p,T:p*V};
  }
  const cv=1/(gamma-1),cp=gamma/(gamma-1),T=states.map(s=>s.p*s.V),heatIn=(kind==='otto'?cv:cp)*(T[3]-T[2]),heatOut=cv*(T[4]-T[1]);
  return {kind,compression:r,gamma,cutoff:V3,states,branches,point,heatIn,heatOut,work:heatIn-heatOut,efficiency:1-heatOut/heatIn,labels:kind==='otto'?['0','1','2','3','4']:['e','a','b','c','d']};
 }
 window.PraxisIdealEngineCycles={create};
})();
