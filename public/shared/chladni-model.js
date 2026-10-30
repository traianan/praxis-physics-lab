/* Kirchhoff–Love disk, free edge, nu=0.33. Granular motion is a teaching model. */
(()=>{
 'use strict';
 const NU=.33,Q=45;
 // Same 19 (nodal diameters, nodal circles) families as the imported lesson.
 // Eigenvalues satisfy BOTH free-edge moment and effective-shear conditions.
 const MODES=[[2,0,5.262036960297075],[0,1,9.068898661786182],[3,0,12.243894257954208],[1,1,20.513086905676474],[4,0,21.52721721534074],[5,0,33.06184338785525],[2,1,35.24252060248782],[0,2,38.50696856419504],[6,0,46.808714793838654],[3,1,52.921017677487384],[1,2,59.85906784915672],[7,0,62.73939484673597],[4,1,73.37831613896576],[2,2,84.3760380054537],[0,3,87.81272639272962],[5,1,96.50750066417275],[3,2,111.90371691089065],[1,3,119.00847171691294],[0,4,156.88016219294906]];
 function bessel(n,x,sign){if(n<0)return sign<0&&(-n)%2?-bessel(-n,x,sign):bessel(-n,x,sign);let term=1;for(let i=1;i<=n;i++)term*=x/2/i;let sum=term;for(let k=0;k<60;k++){term*=sign*x*x/4/((k+1)*(k+1+n));sum+=term;if(Math.abs(term)<1e-16*Math.max(1,Math.abs(sum))&&k>12)break;}return sum;}
 function boundary(n,x){
  const J=bessel(n,x,-1),Jp=(bessel(n-1,x,-1)-bessel(n+1,x,-1))/2,I=bessel(n,x,1),Ip=(bessel(n-1,x,1)+bessel(n+1,x,1))/2;
  return {mJ:(NU-1)*x*Jp+(n*n*(1-NU)-x*x)*J,mI:(NU-1)*x*Ip+(n*n*(1-NU)+x*x)*I,vJ:-(x**3)*Jp-(1-NU)*n*n*(x*Jp-J),vI:x**3*Ip-(1-NU)*n*n*(x*Ip-I)};
 }
 function coefficient(n,x){const b=boundary(n,x);return -b.mJ/b.mI;}
 const radialCoefficients=new WeakMap();
 function radial(mode,r){const [n,,lambda2]=mode,x=Math.sqrt(lambda2);let C=radialCoefficients.get(mode);if(C===undefined){C=coefficient(n,x);radialCoefficients.set(mode,C);}return bessel(n,x*r,-1)+C*bessel(n,x*r,1);}
 function plate({E=69e9,rho=2700,a=.1,h=.001}={}){const D=E*h**3/(12*(1-NU**2)),K=Math.sqrt(D/(rho*h))/(2*Math.PI*a*a);return {D,K,frequencies:MODES.map(m=>m[2]*K)};}
 function response(f,fm){const u=f/fm,re=1-u*u,im=u/Q,den=re*re+im*im;return {re:re/den,im:-im/den,gain:1/Math.sqrt(den)};}
 function createField(G=128){
  const basis=MODES.map(mode=>{
   const samples=1024,rad=new Float64Array(samples+1);for(let k=0;k<=samples;k++)rad[k]=radial(mode,k/samples);
   let integral=0;for(let k=0;k<samples;k++){const a=k/samples,b=(k+1)/samples;integral+=(rad[k]**2*a+rad[k+1]**2*b)/2/samples;}
   const norm=Math.sqrt((mode[0]===0?2:1)*integral);for(let k=0;k<=samples;k++)rad[k]/=norm;
   const at=r=>{const x=Math.max(0,Math.min(samples,r*samples)),i=Math.min(samples-1,Math.floor(x)),t=x-i;return rad[i]*(1-t)+rad[i+1]*t;};
   const cos=new Float32Array(G*G),sin=new Float32Array(G*G);for(let j=0;j<G;j++)for(let i=0;i<G;i++){const X=2*i/(G-1)-1,Y=2*j/(G-1)-1,r=Math.hypot(X,Y);if(r>1)continue;const v=at(r),theta=Math.atan2(Y,X),k=j*G+i;cos[k]=v*Math.cos(mode[0]*theta);sin[k]=v*Math.sin(mode[0]*theta);}
   const nodes=[];for(let k=1;k<=samples;k++)if(rad[k-1]*rad[k]<0){let low=(k-1)/samples,high=k/samples,left=rad[k-1];for(let step=0;step<30;step++){const mid=(low+high)/2,value=radial(mode,mid)/norm;if(left*value<=0)high=mid;else{low=mid;left=value;}}nodes.push((low+high)/2);}
   return {at,cos,sin,nodes};
  });
  function coupling(i,point){const n=MODES[i][0],r=Math.hypot(point.x,point.y),theta=Math.atan2(point.y,point.x),v=basis[i].at(r);return {c:v*Math.cos(n*theta),s:n?v*Math.sin(n*theta):0};}
  function nearest(f,frequencies,point){let mode=-1,distance=Infinity;for(let i=0;i<MODES.length;i++){const c=coupling(i,point);if(Math.hypot(c.c,c.s)<1e-7)continue;const d=Math.abs(frequencies[i]-f)/frequencies[i];if(d<distance){distance=d;mode=i;}}return {mode,near:distance<.03};}
  function compute(f,frequencies,point){
   const re=new Float64Array(G*G),im=new Float64Array(G*G),field=new Float32Array(G*G);let strength=0,best=-1,score=0;
   for(let i=0;i<MODES.length;i++){
    const drive=coupling(i,point),a=Math.hypot(drive.c,drive.s);if(a<1e-10)continue;
    const R=response(f,frequencies[i]),modalGain=a*R.gain;strength=Math.max(strength,modalGain/Q);if(modalGain>score){score=modalGain;best=i;}
    const scale=1/MODES[i][2]**2;
    for(let k=0;k<field.length;k++){const value=(drive.c*basis[i].cos[k]+drive.s*basis[i].sin[k])*scale;re[k]+=value*R.re;im[k]+=value*R.im;}
   }
   let maximum=0;for(let k=0;k<field.length;k++){field[k]=Math.hypot(re[k],im[k]);maximum=Math.max(maximum,field[k]);}if(maximum)for(let k=0;k<field.length;k++)field[k]/=maximum;
   return {field,strength:Math.min(1,strength),best};
  }
  return {G,basis,coupling,nearest,compute};
 }
 function sample(field,G,x,y){const X=Math.max(0,Math.min(G-1,(x+1)/2*(G-1))),Y=Math.max(0,Math.min(G-1,(y+1)/2*(G-1))),i=Math.min(G-2,Math.floor(X)),j=Math.min(G-2,Math.floor(Y)),a=X-i,b=Y-j;return (1-b)*((1-a)*field[j*G+i]+a*field[j*G+i+1])+b*((1-a)*field[(j+1)*G+i]+a*field[(j+1)*G+i+1]);}
 function createParticles(count=9000,seed=123456789){
  let state=seed>>>0||1,accumulator=0;const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};let x,y;
  function scatter(n=count){count=n;x=new Float32Array(n);y=new Float32Array(n);for(let i=0;i<n;i++){const r=Math.sqrt(random())*.97,t=random()*2*Math.PI;x[i]=r*Math.cos(t);y[i]=r*Math.sin(t);}accumulator=0;}
  function advance(dt,field,G,strength,amplitude){
   accumulator+=Math.max(0,Math.min(.1,dt));let steps=0;
   while(accumulator>=1/60-1e-10){accumulator-=1/60;steps++;const g=strength*amplitude;if(g<.02)continue;
    // Heuristic transport toward low-amplitude regions, plus vibration-dependent diffusion.
    // This is deliberately not presented as a calibrated granular force law.
    for(let i=0;i<count;i++){const a=sample(field,G,x[i],y[i]);if(a*g<.025)continue;const eps=2/(G-1),dx=sample(field,G,x[i]+eps,y[i])-sample(field,G,x[i]-eps,y[i]),dy=sample(field,G,x[i],y[i]+eps)-sample(field,G,x[i],y[i]-eps),slope=Math.hypot(dx,dy),drift=slope>1e-9?.008*g*Math.sqrt(a)/slope:0,noise=.018*g*a*a;let X=x[i]-dx*drift+(random()-.5)*2*noise,Y=y[i]-dy*drift+(random()-.5)*2*noise,r=Math.hypot(X,Y);if(r>.985){X*=.97/r;Y*=.97/r;}x[i]=X;y[i]=Y;}
   }return steps;
  }
  scatter();return {scatter,advance,get x(){return x;},get y(){return y;},get count(){return count;}};
 }
 window.PraxisChladniModel={NU,Q,MODES,bessel,boundary,coefficient,radial,plate,response,createField,sample,createParticles};
})();
