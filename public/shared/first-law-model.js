/* Pure SI models used by the laboratory calculators and diagrams. */
(()=>{
 const R=8.314,T0=273.15;
 const positive=(...values)=>{if(values.some(v=>!Number.isFinite(v)||v<=0))throw new RangeError('Valorile trebuie să fie pozitive și finite.');};
 const finite=(...values)=>{if(values.some(v=>!Number.isFinite(v)))throw new RangeError('Completează toate câmpurile cu numere finite.');};
 const firstLaw=(Q,L)=>{finite(Q,L);return Q-L;};
 const general=(p1,V1,T1,p2,V2)=>{positive(p1,V1,T1,p2,V2);return p2*V2*T1/(p1*V1);};
 const isothermal=V=>{positive(V);return 101325*.02/V;};
 const isobaric=T=>{positive(T);return .0224*T/T0;};
 const isochoric=T=>{positive(T);return 101325*T/T0;};
 const openTube=(h,L1,L2)=>{positive(h,L1,L2);if(L2<=L1)throw new RangeError('L₂ trebuie să fie mai mare decât L₁.');return 13600*9.81*h/100*(L2+L1)/(L2-L1);};
 const closedTube=(L,h,d)=>{positive(L,h,d);if(L<=h||2*d>=L-h)throw new RangeError('Este necesar L > h; 2d trebuie să fie pozitiv și mai mic decât L − h.');return .5*13600*9.81*h/100*((L-h)/(2*d)-2*d/(L-h));};
 const expansion=(t1,t2)=>{finite(t1,t2);positive(t1+T0,t2+T0);return (t2-t1)/(t1+T0)*100;};
 const stopper=(T1,S,G,F)=>{positive(T1,S);finite(G,F);if(G<0||F<0)throw new RangeError('Forțele G și F trebuie să fie nenegative.');return T1*(1+(G+F)/(101325*S*1e-4));};
 const state=(p,V,nu,T)=>{positive(p,V,nu,T);const left=p*V,right=nu*R*T;return {left,right,relativeError:Math.abs(left-right)/right};};
 const solve=values=>{const keys=['p','V','nu','T'],missing=keys.filter(k=>values[k]===null);if(missing.length!==1)throw new RangeError('Lasă exact un câmp gol și completează restul.');positive(...keys.filter(k=>k!==missing[0]).map(k=>values[k]));const {p,V,nu,T}=values;return {key:missing[0],value:{p:()=>nu*R*T/V,V:()=>nu*R*T/p,nu:()=>p*V/(R*T),T:()=>p*V/(nu*R)}[missing[0]]()};};
 const processState=(kind,value)=>{positive(value);if(kind==='boyle'){const V=value/1000;return {p:isothermal(V),V,T:300};}if(kind==='gay')return {p:101325,V:isobaric(value),T:value};if(kind==='charles')return {p:isochoric(value),V:.0224,T:value};throw new RangeError('Unknown thermodynamic process');};
 const project=(state,plane)=>{if(plane==='pv')return {x:state.V*1000,y:state.p/1000};if(plane==='vt')return {x:state.T,y:state.V*1000};if(plane==='pt')return {x:state.T,y:state.p/1000};throw new RangeError('Unknown thermodynamic diagram');};
 window.PraxisFirstLawModel={R,T0,firstLaw,general,isothermal,isobaric,isochoric,openTube,closedTube,expansion,stopper,state,solve,processState,project};
})();
