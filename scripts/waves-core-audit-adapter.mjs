// Reversible corrections to the core demonstrations, after the textbook layer.
// Water model: MIT Akylas/Mei, Chapter 3, Progressive waves over constant depth.
// https://web.mit.edu/fluids-modules/waves/www/material/chap-3.pdf
export const coreAuditTranslations={
 'Centre fixe pe orizontale (model liniar). ×n: mărire locală a orbitelor mici, aceeași pe ambele axe, cel mult ×8.':'Fixed centres on horizontal levels (linear model). ×n: local magnification of small orbits, equal on both axes, up to ×8.',
 'Fără bătăi: frecvențe egale':'No beats: equal frequencies',
 'Intensitate medie relativă: surse de aceeași amplitudine locală, fără atenuare geometrică. Surse în fază: Δr = nλ → maxim (galben); Δr = (2n+1)λ/2 → minim (albastru). Surse incoerente: intensitățile medii se adună, fără franje stabile.':'Relative mean intensity: equal local amplitudes, no geometric attenuation. In-phase sources: Δr = nλ gives a maximum (yellow); Δr = (2n+1)λ/2 gives a minimum (blue). Incoherent sources: mean intensities add, without stable fringes.',
 'Orbite liniare: aceeași scară pe cele două axe ale fiecărei elipse; scara poate diferi între elipse.':'Linear orbits: the same scale on both axes of each ellipse; scale may differ between ellipses.',
 '• Lac mic h=2m, λ=20m → regim intermediar; folosește formula generală. La g=9,81 m/s² rezultă v≈4,17 m/s, sub ambele aproximații de limită.':'Small lake h=2m, λ=20m: intermediate regime; use the general formula. At g=9.81 m/s², v≈4.17 m/s, below both limiting approximations.',
 'Model liniar pentru unde gravitaționale de amplitudine mică, apă fără curent, adâncime constantă și fund impermeabil. Formulele nu descriu spargerea sau transportul net de apă. În afara limitelor A/h ≪ 1 și 2πA/λ ≪ 1, desenul este doar ilustrativ.':'Linear small-amplitude gravity-wave model, with no current, constant depth and an impermeable bed. The formulas do not describe breaking or net water transport. Outside A/h ≪ 1 and 2πA/λ ≪ 1, the drawing is illustrative only.',
 '(sub pragul indicativ)':'(below the indicative threshold)'
};

export function extractCoreFunction(html,name){
 const start=html.indexOf('function '+name+'(');
 if(start<0)throw Error('Missing core function '+name);
 const brace=html.indexOf('{',start);let depth=0,quote=null;
 for(let i=brace;i<html.length;i++){
  const c=html[i],next=html[i+1];
  if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}
  if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='/'&&next==='*'){const end=html.indexOf('*/',i+2);if(end<0)throw Error('Unclosed comment');i=end+1;continue;}
  if(c==='/'&&next==='/'){const end=html.indexOf('\n',i+2);i=end<0?html.length:end;continue;}
  if(c==='{')depth++;
  if(c==='}'&&!--depth)return html.slice(start,i+1);
 }
 throw Error('Unclosed core function '+name);
}
function replaceOne(source,before,after){
 const first=source.indexOf(before);
 if(first<0||source.indexOf(before,first+before.length)>=0)throw Error('Core replacement must be unique: '+before.slice(0,100));
 return source.slice(0,first)+after+source.slice(first+before.length);
}
function waveCoreBeatState(f1,f2){const frequency=Math.abs(f1-f2);return{frequency,period:frequency===0?null:1/frequency};}
function waveCoreInterferenceIntensity(r1,r2,wavelength,coherent){return coherent?2+2*Math.cos(2*Math.PI*(r2-r1)/wavelength):2;}
function waveCoreWaterOrbit(amplitude,k,h,z){
 // Scaled hyperbolic ratios avoid overflow, including at the bed in deep water.
 const depth=k*(z+h),denominator=-Math.expm1(-2*k*h),factor=amplitude*Math.exp(k*z)/denominator;
 return{a:factor*(1+Math.exp(-2*depth)),b:factor*(-Math.expm1(-2*depth))};
}
function waveCoreWaterScale(a,b,width,height){const scale=Math.min(22,width/(a||1),height/(b||1));return{x:a*scale,y:b*scale};}
function waveCoreWaterSceneScale(a,base){return base*(a>0?Math.min(8,Math.max(1,9/(a*base))):1);}
function waveCoreWaterLevels(ctx,width,top,depth,levels,dark){
 ctx.save();ctx.strokeStyle=dark?'#c3dfec':'#31596e';ctx.lineWidth=1.2;ctx.setLineDash([7,5]);
 for(const level of levels){const y=top+level*depth;ctx.beginPath();ctx.moveTo(8,y);ctx.lineTo(width-8,y);ctx.stroke();}
 ctx.restore();
}
function waveCoreWaterDrawOrbit(ctx,x,y,a,b,dark){
 ctx.save();ctx.setLineDash([]);ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,Math.PI*2);
 ctx.strokeStyle=dark?'#0b263b':'#e8f7ff';ctx.lineWidth=4.4;ctx.stroke();
 ctx.strokeStyle=dark?'#e3f6ff':'#153d56';ctx.lineWidth=2.2;ctx.stroke();
 ctx.strokeStyle=dark?'#ffffff':'#173c50';ctx.lineWidth=1.3;ctx.beginPath();
 ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();ctx.restore();
}

export function adaptWaveCoreAudit(html,reverse=false){
 if(reverse)return html.replace(/\/\*praxis-core-audit:([A-Za-z0-9+/=]+)\*\/[\s\S]*?\/\*\/praxis-core-audit\*\//g,(_,source)=>Buffer.from(source,'base64').toString('utf8'));
 if(html.includes('/*praxis-core-audit:'))throw Error('Core audit already applied');
 function adapt(name,change){const before=extractCoreFunction(html,name),after=change(before);if(before===after)throw Error('No core correction '+name);html=replaceOne(html,before,`/*praxis-core-audit:${Buffer.from(before).toString('base64')}*/${after}/*/praxis-core-audit*/`);}
 adapt('hm',source=>{
  source=replaceOne(source,'function hm(){','function hm(){'+waveCoreBeatState.toString());
  source=replaceOne(source,'let y=Math.abs(e-r);','let beat=waveCoreBeatState(e,r),y=beat.frequency;');
  source=replaceOne(source,'Math.cos(Math.PI*y*a)*30','Math.cos(Math.PI*y*a)*22');
  source=replaceOne(source,'O=m/2-L*30','O=m/2-L*22');
  source=replaceOne(source,'`T_bătăi = 1/f_b = ${(y?1/y:0).toFixed(3)} s`','beat.period===null?"Fără bătăi: frecvențe egale":`T_bătăi = 1/f_b = ${beat.period.toFixed(3)} s`');
  return source;
 });
 adapt('vm',source=>{
  source=replaceOne(source,'function vm(){','function vm(){'+waveCoreInterferenceIntensity.toString());
  const start=source.indexOf('O=p*a-'),end=source.indexOf(';if(T.data[K]',start);
  if(start<0||end<0)throw Error('Interference field changed');
  source=source.slice(0,start)+'I=waveCoreInterferenceIntensity(a,L,r,o),M=I/4,K=(y*C+_)*4'+source.slice(end);
  source=replaceOne(source,'T.data[K]=o?Math.floor(200*(1-M)+X*M):180,T.data[K+1]=o?Math.floor(220*M):180,T.data[K+2]=o?Math.floor(255*(1-M*0.6)):180','T.data[K]=Math.round(30+225*M),T.data[K+1]=Math.round(50+190*M),T.data[K+2]=Math.round(150-110*M)');
  source=replaceOne(source,'Interferență constructivă: Δr = n·λ (galben intens). Distructivă: Δr = (2n+1)·λ/2 (albastru închis). Coerență necesară pentru franje stabile.','Intensitate medie relativă: surse de aceeași amplitudine locală, fără atenuare geometrică. Surse în fază: Δr = nλ → maxim (galben); Δr = (2n+1)λ/2 → minim (albastru). Surse incoerente: intensitățile medii se adună, fără franje stabile.');
  return source;
 });
 adapt('Em',source=>{
  source=replaceOne(source,'function Em(){','function Em(){'+waveCoreWaterOrbit.toString()+waveCoreWaterScale.toString()+waveCoreWaterSceneScale.toString()+waveCoreWaterLevels.toString()+waveCoreWaterDrawOrbit.toString());
  source=replaceOne(source,'X=v?1.2:i','X=i');
  // x() already schedules its successor; a second ticket leaks a stale drawing loop.
  source=replaceOne(source,'if(x(),C)nn=lessonRequestAnimationFrame(x),O.current=nn;','x();');
  source=replaceOne(source,'ln=W==="adâncă"?tn:W==="mică"?Nn:s','ln=s');
  source=replaceOne(source,'Un=Math.min(38,Math.max(3,X*an))','surfaceOrbit=waveCoreWaterOrbit(X,w,M,0),mainOrbitScale=Math.min(14,42/surfaceOrbit.a,38/surfaceOrbit.b),Un=X*mainOrbitScale');
  const start=source.indexOf('if(H>12){let Qn='),end=source.indexOf(',Y=zn*k-_n*D',start);
  if(start<0||end<0)throw Error('Water main orbit changed');
  source=source.slice(0,start)+'({a:En,b:Ln}=waveCoreWaterOrbit(X,w,M,On));let localOrbitScale=R===0?mainOrbitScale:waveCoreWaterSceneScale(En,mainOrbitScale),Gn=En*localOrbitScale,en=Ln*localOrbitScale'+source.slice(end);
  source=replaceOne(source,'if(F.forEach((k,on)=>','if(T)waveCoreWaterLevels(q,G,B,A,V,_);if(F.forEach((k,on)=>');
  source=replaceOne(source,'if(yn.push({x:pn,y:S,Ah:Gn,Av:en,frac:Fn,col:on}),T)q.strokeStyle=`rgba(148,163,184,${0.18+(1-Fn)*0.2})`,q.lineWidth=1,q.setLineDash([4,3]),q.beginPath(),q.ellipse(k,In,Gn,en,0,0,Math.PI*2),q.stroke(),q.setLineDash([]);','if(yn.push({x:pn,y:S,Ah:Gn,Av:en,frac:Fn,col:on}),T){waveCoreWaterDrawOrbit(q,k,In,Gn,en,_);if(on===2&&localOrbitScale/mainOrbitScale>1.05){q.save();q.fillStyle=_?"#ffffff":"#173c50";q.font="12px system-ui";q.textAlign="right";q.fillText("×"+(localOrbitScale/mainOrbitScale).toFixed(1),G-10,In-6);q.restore();}}');
  const second=source.indexOf('if(H>12){let V='),secondEnd=source.indexOf(',c=B+Z*Q',second);
  if(second<0||secondEnd<0)throw Error('Water comparison orbit changed');
  source=source.slice(0,second)+'({a:zn,b:an}=waveCoreWaterOrbit(X,w,M,vn));let orbitScale=waveCoreWaterScale(zn,an,70,48),D=orbitScale.x,J=orbitScale.y'+source.slice(secondEnd);
  source=replaceOne(source,'(J/(D||1))','(an/(zn||1))');
  source=replaceOne(source,'Turtirea elipsei cu adâncimea: a=Ax oriz, b=Av vert,  b/a → 0 spre fund','Orbite liniare: aceeași scară pe cele două axe ale fiecărei elipse; scara poate diferi între elipse.');
  source=replaceOne(source,'• Lac mic h=2m, λ=20m → intermediar, viteză între cele două formule.','• Lac mic h=2m, λ=20m → regim intermediar; folosește formula generală. La g=9,81 m/s² rezultă v≈4,17 m/s, sub ambele aproximații de limită.');
  source=replaceOne(source,'"(stabil)"','"(sub pragul indicativ)"');
  const note='Model liniar pentru unde gravitaționale de amplitudine mică, apă fără curent, adâncime constantă și fund impermeabil. Formulele nu descriu spargerea sau transportul net de apă. În afara limitelor A/h ≪ 1 și 2πA/λ ≪ 1, desenul este doar ilustrativ.';
  source=replaceOne(source,'children:[f("div",{className:"mb-3 flex items-center justify-between gap-2"','children:[t("p",{className:"text-xs",children:'+JSON.stringify(note)+'}),f("div",{className:"mb-3 flex items-center justify-between gap-2"');
  return source;
 });
 return html;
}
