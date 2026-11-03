// Scalar 2-D Huygens quadrature, in units λ=1, T=1, v=1.
// A prescribed uniform aperture; not a full boundary-value solution for the screen.
(function(){
 'use strict';
 const tau=2*Math.PI;
 function aperture(ratio){
  const count=Math.max(65,Math.ceil(ratio*24)|1);
  return Array.from({length:count},(_,i)=>({y:ratio*((i+.5)/count-.5),weight:ratio/count}));
 }
 function field(sources,x,y,time=Infinity){
  let re=0,im=0;
  for(const s of sources){const d=Math.hypot(x,y-s.y);if(d>time)continue;const w=s.weight/Math.sqrt(Math.max(.04,d));re+=w*Math.cos(tau*d);im+=w*Math.sin(tau*d);}
  const phase=Number.isFinite(time)?tau*time:0,c=Math.cos(phase),s=Math.sin(phase);
  return {re:re*c+im*s,im:im*c-re*s};
 }
 function prepare(ratio){
  const sources=aperture(ratio),nx=116,ny=90,dx=11/nx,dy=8.5/ny,distances=[],cosines=[],sines=[];
  // Cache geometry and harmonic phases; animation never evaluates trig per source per pixel.
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
   const x=.06+i*dx,y=-4.25+j*dy;
   const d=new Float32Array(sources.length),c=new Float32Array(sources.length),s=new Float32Array(sources.length);
   sources.forEach((source,k)=>{const r=Math.hypot(x,y-source.y),w=source.weight/Math.sqrt(r);d[k]=r;c[k]=w*Math.cos(tau*r);s[k]=w*Math.sin(tau*r);});
   distances.push(d);cosines.push(c);sines.push(s);
  }
  return {ratio,sources,nx,ny,dx,dy,distances,cosines,sines};
 }
 function fronts(grid,time){
  if(time<=0)return '';
  const {nx,ny,dx,dy}=grid,c=Math.cos(tau*time),s=Math.sin(tau*time),re=new Float32Array((nx+1)*(ny+1)),im=new Float32Array(re.length);
  for(let p=0;p<re.length;p++){
   let a=0,b=0;const ds=grid.distances[p],cs=grid.cosines[p],ss=grid.sines[p];
   for(let k=0;k<ds.length;k++)if(ds[k]<=time){a+=cs[k];b+=ss[k];}
   re[p]=a*c+b*s;im[p]=b*c-a*s;
  }
  let path='';
  // Marching squares: phase=0 (positive real part), not arbitrary circular fronts.
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const p=j*(nx+1)+i,ids=[p,p+1,p+nx+2,p+nx+1],xy=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],hits=[];
   for(let e=0;e<4;e++){const f=(e+1)%4,a=ids[e],b=ids[f];if((im[a]<0)===(im[b]<0))continue;const u=im[a]/(im[a]-im[b]);if(re[a]+u*(re[b]-re[a])<.015*grid.ratio)continue;hits.push([160+42*(.06+dx*(xy[e][0]+u*(xy[f][0]-xy[e][0]))),200+42*(-4.25+dy*(xy[e][1]+u*(xy[f][1]-xy[e][1]))) ]);}
   for(let k=0;k+1<hits.length;k+=2)path+='M'+hits[k].map(v=>v.toFixed(2)).join(',')+'L'+hits[k+1].map(v=>v.toFixed(2)).join(',');
  }
  return path;
 }
 function intensity(ratio,theta){const b=Math.PI*ratio*Math.sin(theta);return Math.abs(b)<1e-10?1:(Math.sin(b)/b)**2;}
 function rays(sources,time){
  if(time<2)return [];
  const target=Math.min(4,time*.55),ys=[-.5,.5];
  return ys.flatMap(y=>{
   const roots=[];let a=.25,fa=field(sources,a,y,time);
   for(let b=a+.035;b<Math.min(8,time-.2);b+=.035){const fb=field(sources,b,y,time);if(fa.im*fb.im<0){const x=a+(b-a)*fa.im/(fa.im-fb.im),f=field(sources,x,y,time);if(f.re>.02)roots.push(x);}a=b;fa=fb;}
   if(!roots.length)return [];
   const x=roots.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0],eps=.002,f=field(sources,x,y,time),fx=field(sources,x+eps,y,time),fy=field(sources,x,y+eps,time);
   let nx=(f.re*fx.im-f.im*fx.re)/eps,ny=(f.re*fy.im-f.im*fy.re)/eps;const norm=Math.hypot(nx,ny);if(norm<1e-8)return [];nx/=norm;ny/=norm;if(nx<0){nx=-nx;ny=-ny;}
   return [{x,y,nx,ny}];
  });
 }
 window.PraxisDiffraction={aperture,field,prepare,fronts,intensity,rays,firstMinimum:ratio=>ratio>=1?Math.asin(1/ratio):null};
})();
