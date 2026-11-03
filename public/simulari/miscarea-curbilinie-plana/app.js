
/* ============ Tabs & navigation ============ */
const tabs=document.querySelectorAll('.tab-btn');
const sections=['teorie','viteza','acceleratie'];
function showTab(id,updateHash=true){
 if(!sections.includes(id))return;
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+id));
 tabs.forEach(b=>{const active=b.dataset.tab===id;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
 window.dispatchEvent(new CustomEvent('praxis-curvilinear-tab-change',{detail:{id}}));
 if(updateHash&&location.hash!=='#'+id)history.pushState(null,'','#'+id);
 window.scrollTo({top:0,behavior:'auto'});
 requestAnimationFrame(()=>{if(id==='teorie')drawTheory();});
}
tabs.forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const target=a.getAttribute('href').slice(1);
 if(sections.includes(target)){e.preventDefault();showTab(target);}
 else if(target==='top'){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}
}));
addEventListener('popstate',()=>showTab(sections.includes(location.hash.slice(1))?location.hash.slice(1):'teorie',false));
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(sections.includes(id))showTab(id,false);});
const initialSection=location.hash.slice(1);
if(sections.includes(initialSection))showTab(initialSection,false);

/* Quiz reveal */
document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{
  const q=b.closest('.quiz');q.classList.toggle('open');
  b.textContent=q.classList.contains('open')?'Ascunde răspunsul':'Arată răspunsul';
}));

/* To-top */
const toTop=document.getElementById('toTop');
addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>500));
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* ============ Canvas helpers ============ */
function fitCanvas(cv){
  const dpr=window.PraxisCanvasResolution?.forCanvas(cv)??(devicePixelRatio||1),w=cv.clientWidth,hgt=cv.clientHeight;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(hgt*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(hgt*dpr);}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  window.PraxisVelocityLabels.begin(ctx,w,hgt);
  const canvasBox=cv.getBoundingClientRect();for(const overlay of cv.parentElement.querySelectorAll('.legend,#s2Scale')){const box=overlay.getBoundingClientRect();if(box.width&&box.height)window.PraxisVelocityLabels.reserve(ctx,{x:box.left-canvasBox.left-4,y:box.top-canvasBox.top-4,w:box.width+8,h:box.height+8});}
  return{ctx,w,h:hgt};
}
function labeledDraw(fn,id){return function(...args){const canvas=document.getElementById(id);if(!canvas.clientWidth||!canvas.clientHeight)return;try{return fn(...args);}finally{window.PraxisVelocityLabels.flush(canvas.getContext('2d'));}};}
drawTheory=labeledDraw(drawTheory,'theoryCanvas');drawSim1=labeledDraw(drawSim1,'sim1');drawSim2=labeledDraw(drawSim2,'sim2');drawEllipse=labeledDraw(drawEllipse,'simEllipse');
function arrow(ctx,x,y,dx,dy,color,label,lw=2.6){
  const len=Math.hypot(dx,dy);if(len<2)return;
  const ux=dx/len,uy=dy/len,ex=x+dx,ey=y+dy,hs=Math.min(11,len*.28);
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();
  const a=Math.atan2(uy,ux);
  ctx.beginPath();ctx.moveTo(ex,ey);
  ctx.lineTo(ex-hs*Math.cos(a-.42),ey-hs*Math.sin(a-.42));
  ctx.lineTo(ex-hs*Math.cos(a+.42),ey-hs*Math.sin(a+.42));
  ctx.closePath();ctx.fill();
  if(label){
    ctx.save();ctx.font='italic 600 15px Georgia,serif';ctx.fillStyle=color;
    window.PraxisVelocityLabels.label(ctx,label.replaceAll('⃗',''),ex+ux*18-uy*14,ey+uy*18+ux*14,{anchor:[ex,ey],vectorNotation:label.includes('⃗')});ctx.restore();
  }
}

function dot(ctx,x,y,r,color,glow){
  if(glow){ctx.shadowColor=color;ctx.shadowBlur=0;}
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.shadowBlur=0;
}

/* Axes and geometric dimensions, in screen coordinates (Oy points up). */
function drawAxes(ctx,ox,oy,a,b,scale,shape,w,h){
 if(shape==='general'||shape==='custom')return;
 const rx=a*scale,ry=(shape==='circle'?a:b)*scale;
 const right=Math.min(w-28,ox+rx+45),top=Math.max(45,oy-ry-45);
 ctx.save();ctx.setLineDash([]);
 arrow(ctx,Math.max(24,ox-rx-35),oy,right-Math.max(24,ox-rx-35),0,'#6d8478','',1);
 arrow(ctx,ox,Math.min(h-45,oy+ry+35),0,top-Math.min(h-45,oy+ry+35),'#6d8478','',1);
 ctx.font='14px Georgia,serif';ctx.fillStyle='#536e64';window.PraxisVelocityLabels.label(ctx,'O',ox-18,oy+20);window.PraxisVelocityLabels.label(ctx,'x',right+8,oy+5);window.PraxisVelocityLabels.label(ctx,'y',ox+9,top-6);
 ctx.strokeStyle='#216e61';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+rx,oy);ctx.stroke();
 ctx.font='italic 17px Georgia,serif';ctx.fillStyle='#216e61';window.PraxisVelocityLabels.label(ctx,shape==='circle'?'R':'a',ox+rx*.5-4,oy-10);
 if(shape==='ellipse'){
 ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox,oy-ry);ctx.stroke();window.PraxisVelocityLabels.label(ctx,'b',ox+11,oy-ry*.5+5);
 }
 ctx.restore();
}



// A degree-five Bézier curve has continuous first and second derivatives.
const DEFAULT_POINTS=[{x:-1,y:.25},{x:-.65,y:.85},{x:-.25,y:-1},{x:.2,y:.95},{x:.6,y:-.8},{x:1,y:.15}];
let customPoints=DEFAULT_POINTS.map(p=>({...p}));
function bezier(points,u){
 const q=points.map(p=>({...p}));
 for(let k=q.length-1;k>0;k--)for(let i=0;i<k;i++){q[i].x+=(q[i+1].x-q[i].x)*u;q[i].y+=(q[i+1].y-q[i].y)*u;}
 return q[0];
}
function customCurve(theta){
 const u=Math.max(0,Math.min(1,theta/(2*Math.PI))),points=customPoints.map(p=>({x:p.x*160,y:p.y*110}));
 const d=points.slice(1).map((p,i)=>({x:5*(p.x-points[i].x),y:5*(p.y-points[i].y)}));
 const dd=d.slice(1).map((p,i)=>({x:4*(p.x-d[i].x),y:4*(p.y-d[i].y)}));
 const q=bezier(points,u),v=bezier(d,u),a=bezier(dd,u),k=2*Math.PI;
 return{x:q.x,y:q.y,dx:v.x/k,dy:v.y/k,ddx:a.x/(k*k),ddy:a.y/(k*k)};
}
function curve(theta,a,b,shape){
 if(shape==='custom')return customCurve(theta);
 if(shape==='general')return{x:a*(theta/Math.PI-1),y:b*(.7*Math.sin(theta)+.23*Math.sin(2*theta+.5)),
 dx:a/Math.PI,dy:b*(.7*Math.cos(theta)+.46*Math.cos(2*theta+.5)),
 ddx:0,ddy:b*(-.7*Math.sin(theta)-.92*Math.sin(2*theta+.5))};
 const c=Math.cos(theta),sn=Math.sin(theta);
 const r=shape==='general'?1+.14*Math.cos(3*theta):1;
 const rp=shape==='general'?-.42*Math.sin(3*theta):0;
 const rpp=shape==='general'?-1.26*Math.cos(3*theta):0;
 if(shape==='circle')b=a;
 return{x:a*r*c,y:-b*r*sn,
 dx:a*(rp*c-r*sn),dy:-b*(rp*sn+r*c),
 ddx:a*(rpp*c-2*rp*sn-r*c),ddy:-b*(rpp*sn+2*rp*c-r*sn)};
}

/* ============ Theory: chord -> tangent ============ */
const TH={t:0,play:false,raf:null};
function drawTheory(){
  const cv=document.getElementById('theoryCanvas');const{ctx,w,h}=fitCanvas(cv);
  ctx.clearRect(0,0,w,h);
  const cx=w*.5,cy=h*.49,sx=Math.min(w*.36,260),sy=Math.min(h*.38,140);
  // A gentle open arc with positive signed curvature throughout.
  const arc=u=>({x:cx+sx*u,y:cy+sy*(.65*u*u-.15),dx:sx,dy:1.3*sy*u});
  ctx.strokeStyle='rgba(33,110,97,.9)';ctx.lineWidth=2;
  ctx.setLineDash([]);ctx.beginPath();
  const samples=Math.max(200,Math.min(4096,Math.ceil(cv.width/2)));for(let i=0;i<=samples;i++){const q=arc(-1+2*i/samples);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();
  const prog=Math.min(1,TH.t/3.2),uA=-.65,uB=uA+1.475*(1-prog)+.0001;
  const qa=arc(uA),qb=arc(uB);
  const ax=qa.x,ay=qa.y,bx=qb.x,by=qb.y;
  const length=Math.hypot(qa.dx,qa.dy),tx=qa.dx/length,ty=qa.dy/length;
  ctx.setLineDash([]);
  arrow(ctx,ax,ay,tx*90,ty*90,'#43876f','v⃗',2.6);
  // Extended secant through A and B. Its direction converges to the tangent.
  const chordLength=Math.hypot(bx-ax,by-ay),secX=(bx-ax)/chordLength,secY=(by-ay)/chordLength;
  const forward=Math.max(chordLength+60,160);
  ctx.setLineDash([7,6]);ctx.strokeStyle='#8ca69a';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(ax-secX*35,ay-secY*35);ctx.lineTo(ax+secX*forward,ay+secY*forward);ctx.stroke();ctx.setLineDash([]);
  arrow(ctx,ax,ay,bx-ax,by-ay,'#6d8478',chordLength>28?'Δr⃗':'',2);
  dot(ctx,ax,ay,6,'#216e61',true);
  dot(ctx,bx,by,5,'#b28b3b',true);
  ctx.font='600 14px Arial,sans-serif';ctx.fillStyle='#243c40';
  window.PraxisVelocityLabels.label(ctx,'A',ax-22,ay+5);window.PraxisVelocityLabels.label(ctx,'B',bx+12,by+5);
}
const thBtn=document.getElementById('thPlay');
thBtn.addEventListener('click',()=>{
 if(TH.play)return;if(TH.t>=3.4)TH.t=0;TH.play=true;
 const clock=window.PraxisAnimationClock.create(1,.05);const step=stamp=>{if(!TH.play)return;TH.t=Math.min(3.4,TH.t+clock.step(stamp));drawTheory();
 if(TH.t<3.4)TH.raf=requestAnimationFrame(step);else TH.play=false;};
 step();
});
document.getElementById('thPause').onclick=()=>{TH.play=false;cancelAnimationFrame(TH.raf);};
document.getElementById('thReset').addEventListener('click',()=>{
 cancelAnimationFrame(TH.raf);TH.t=0;TH.play=false;drawTheory();
});
drawTheory();

/* ============ Slider <-> number pairs ============ */
function pair(sid,nid,onChange){
  const s=document.getElementById(sid),n=document.getElementById(nid);
  const f=v=>{v=Number(v);if(!Number.isFinite(v))return;v=Math.max(+s.min,Math.min(+s.max,v));s.value=v;n.value=s.value;onChange();};
  s.addEventListener('input',()=>f(s.value));
  n.addEventListener('change',()=>{if(n.value!=='')f(n.value);else n.value=s.value;});
}

/* ============ SIM 1 : circle, velocity ============ */
const S1={R:150,T:7,speed:1,t:0,paused:true};
function s1vals(){return{v:2*Math.PI*S1.R/S1.T,w:2*Math.PI/S1.T};}
pair('s1R','s1Rnum',()=>{S1.R=+document.getElementById('s1R').value;});
pair('s1T','s1Tnum',()=>{S1.T=+document.getElementById('s1T').value;});
pair('s1S','s1Snum',()=>{S1.speed=+document.getElementById('s1S').value;});
function drawSim1(dt){
  const cv=document.getElementById('sim1');const{ctx,w,h}=fitCanvas(cv);
  ctx.clearRect(0,0,w,h);
  if(!S1.paused)S1.t+=dt*S1.speed;
  const circleScale=Math.max(.15,Math.min(1,(w-230)/380,(h-220)/380));
  const cx=w*.5,cy=h*.5,R=S1.R*circleScale;
  drawAxes(ctx,cx,cy,R,R,1,'circle',w,h);
  const showV=document.getElementById('s1V').checked;
  const showRad=document.getElementById('s1Rad').checked;
  const showA=false;
  ctx.strokeStyle='rgba(33,110,97,.85)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();
  dot(ctx,cx,cy,4,'#536e64');
  const a=S1.t*2*Math.PI/S1.T;
  const x=cx+R*Math.cos(a),y=cy+R*Math.sin(a);
  if(showRad)arrow(ctx,cx,cy,R*Math.cos(a),R*Math.sin(a),'#6d8478','R',1.8);
  if(showV)arrow(ctx,x,y,-Math.sin(a)*95,Math.cos(a)*95,'#43876f','v⃗');
  if(showA)arrow(ctx,x,y,-Math.cos(a)*60,-Math.sin(a)*60,'#83689e','a⃗');
  // trail
  ctx.fillStyle='rgba(33,110,97,.5)';
  for(let k=1;k<=14;k++){
    const aa=a-k*.06;ctx.globalAlpha=.5*(1-k/15);
    ctx.beginPath();ctx.arc(cx+R*Math.cos(aa),cy+R*Math.sin(aa),2.4,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
  dot(ctx,x,y,7,'#216e61',true);
  const{v,w:om}=s1vals();
  document.getElementById('s1v').textContent=v.toFixed(1)+' u/s';
  document.getElementById('s1w').textContent=om.toFixed(2)+' rad/s';
}

/* ============ SIM 2 : curved path, decomposition, osculating circle ============ */
const S2={A:150,T:80,K:10,speed:.8,t:0,paused:true};
function geom(t){
  const omega=2*Math.PI/S2.K;
  const q=curve(omega*t,S2.A,S2.T,document.getElementById('s2Shape').value);
  return{x:q.x,y:q.y,vx:q.dx*omega,vy:q.dy*omega,ax:q.ddx*omega*omega,ay:q.ddy*omega*omega};
}
pair('s2A','s2Anum',()=>{S2.A=+document.getElementById('s2A').value;});
pair('s2T','s2Tnum',()=>{S2.T=+document.getElementById('s2T').value;});
pair('s2K','s2Knum',()=>{S2.K=+document.getElementById('s2K').value;});
pair('s2S','s2Snum',()=>{S2.speed=+document.getElementById('s2S').value;});
function drawSim2(dt){
  const cv=document.getElementById('sim2');const{ctx,w,h}=fitCanvas(cv);
  ctx.clearRect(0,0,w,h);
  const TMAX=S2.K;
  if(!S2.paused)S2.t+=dt*S2.speed;
  if(S2.t>=TMAX){if(document.getElementById('s2Shape').value==='general'||document.getElementById('s2Shape').value==='custom'){S2.t=TMAX;S2.paused=true;}else S2.t%=TMAX;}
  const scale=Math.max(.15,Math.min(1,(w-230)/340,(h-220)/340));
  const ox=w/2,oy=h/2;
  drawAxes(ctx,ox,oy,S2.A,S2.T,scale,document.getElementById('s2Shape').value,w,h);
  const X=p=>ox+p.x*scale, Y=p=>oy+p.y*scale;
  // trajectory
  ctx.strokeStyle='rgba(33,110,97,.85)';ctx.lineWidth=2;ctx.beginPath();
  const samples=Math.max(240,Math.min(4096,Math.ceil(cv.width/2)));for(let i=0;i<=samples;i++){const p=geom(TMAX*i/samples);const px=X(p),py=Y(p);
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
  ctx.stroke();
  if(document.getElementById('s2Shape').value==='custom')drawCustomHandles(ctx,ox,oy,scale);
  const p=geom(S2.t);
  const v=Math.hypot(p.vx,p.vy), amag=Math.hypot(p.ax,p.ay);
  const tx=p.vx/v, ty=p.vy/v;              // tangent unit
  let nx=-ty, ny=tx;                       // normal candidate
  const sgn=p.ax*nx+p.ay*ny;               // orient normal along curvature
  const k=sgn>=0?1:-1; nx*=k; ny*=k;
  const an=Math.max(0,p.ax*nx+p.ay*ny);                // a_n >= 0
  const projection=p.ax*tx+p.ay*ty;
  const at=Math.abs(projection)<1e-9?0:projection;                // signed a_t
  const rho=an>1e-6?v*v/an:1e6;
  const x=X(p),y=Y(p);
  const showDec=document.getElementById('s2Dec').checked;
  const showCirc=document.getElementById('s2Circ').checked;
  const showV=document.getElementById('s2V').checked;
  const showAcc=document.getElementById('s2Acc').checked;
  // osculating circle
  if(showCirc&&rho*scale<3000){
    const ccx=x+nx*rho*scale, ccy=y+ny*rho*scale;
    ctx.strokeStyle='rgba(56,121,172,.8)';ctx.lineWidth=1.6;ctx.setLineDash([6,5]);
    ctx.beginPath();ctx.arc(ccx,ccy,rho*scale,0,7);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,ccx,ccy,3.4,'#3879ac');
    ctx.font='600 12px Arial,sans-serif';ctx.fillStyle='#3879ac';
    const centerLabel='C';window.PraxisVelocityLabels.label(ctx,centerLabel,Math.max(12,Math.min(w-22,ccx-25)),Math.max(55,Math.min(h-45,ccy-25)));
    ctx.strokeStyle='rgba(56,121,172,.5)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ccx,ccy);ctx.stroke();
    ctx.fillStyle='#3879ac';ctx.font='italic 16px Georgia,serif';if(document.getElementById('s2Shape').value!=='circle')window.PraxisVelocityLabels.label(ctx,'R',Math.max(15,Math.min(w-20,(x+ccx)/2+12)),Math.max(55,Math.min(h-45,(y+ccy)/2-12)));
  }
  // One common scale for all acceleration vectors preserves vector addition.
  const AS=amag>1e-9?110/amag:1;
  const VS=v>1e-9?85/v:1;
  document.getElementById('s2Scale').textContent='Viteză: săgeată de 85 px; accelerații, '+AS.toFixed(1)+' px/(u/s²)';
  if(showV)arrow(ctx,x,y,tx*v*VS,ty*v*VS,'#43876f','v⃗');
  if(showDec){
    arrow(ctx,x,y,tx*at*AS,ty*at*AS,'#b28b3b','a⃗ₜ');
    arrow(ctx,x,y,nx*an*AS,ny*an*AS,'#83689e','a⃗ₙ');
    // parallelogram hint
    ctx.strokeStyle='rgba(109,132,120,0.28)';ctx.setLineDash([3,4]);ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x+tx*at*AS,y+ty*at*AS);ctx.lineTo(x+p.ax*AS,y+p.ay*AS);
    ctx.lineTo(x+nx*an*AS,y+ny*an*AS);ctx.stroke();ctx.setLineDash([]);
  }
  if(showAcc)arrow(ctx,x,y,p.ax*AS,p.ay*AS,'#b54d45','a⃗');
  // trail
  ctx.fillStyle='rgba(33,110,97,.5)';
  for(let k2=1;k2<=16;k2++){const tt=S2.t-k2*.05;if(tt<0)break;const q=geom(tt);
    ctx.globalAlpha=.5*(1-k2/17);ctx.beginPath();ctx.arc(X(q),Y(q),2.3,0,7);ctx.fill();}
  ctx.globalAlpha=1;
  dot(ctx,x,y,7,'#216e61',true);
  document.getElementById('s2v').textContent=v.toFixed(1)+' u/s';
  document.getElementById('s2a').textContent=amag.toFixed(1)+' u/s²';
  document.getElementById('s2at').textContent=at.toFixed(1)+' u/s²';
  document.getElementById('s2an').textContent=an.toFixed(1)+' u/s²';
  document.getElementById('s2rho').textContent=an>1e-6?rho.toFixed(1)+' u':'∞';
}

const P={a:160,duration:10,b:80,t:0,paused:true};
pair('pA','pAnum',()=>{P.a=+document.getElementById('pA').value;P.t=0;});
pair('pV','pVnum',()=>{P.duration=+document.getElementById('pV').value;P.t=0;});
pair('pAng','pAngnum',()=>{P.b=+document.getElementById('pAng').value;P.t=0;});
document.getElementById('pPlay').onclick=()=>{if(P.t>=P.duration)P.t=0;P.paused=false;};
document.getElementById('pPause').onclick=()=>{P.paused=true;};
document.getElementById('pReset').onclick=()=>{P.t=0;P.paused=true;};
function drawEllipse(dt){
 const cv=document.getElementById('simEllipse'),{ctx,w,h}=fitCanvas(cv);
 ctx.clearRect(0,0,w,h);
 const a=P.a,b=P.b,omega=2*Math.PI/P.duration;
 if(!P.paused){P.t+=dt;if(P.t>=P.duration){if(['general','custom'].includes(document.getElementById('pShape').value)){P.t=P.duration;P.paused=true;}else P.t%=P.duration;}}
 const theta=omega*P.t,scale=Math.max(.15,Math.min(1,(w-230)/340,(h-220)/340)),ox=w/2,oy=h/2;
 const shape=document.getElementById('pShape').value;
 drawAxes(ctx,ox,oy,a,b,scale,shape,w,h);
 const point=theta=>{const q=curve(theta,a,b,shape);return{x:ox+q.x*scale,y:oy+q.y*scale};};
 ctx.strokeStyle='#216e61';ctx.lineWidth=2;ctx.beginPath();
 const samples=Math.max(200,Math.min(4096,Math.ceil(cv.width/2)));for(let i=0;i<=samples;i++){const q=point(2*Math.PI*i/samples);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();
 if(shape==='custom')drawCustomHandles(ctx,ox,oy,scale);
 const q=point(theta),motion=curve(theta,a,b,shape),vx=motion.dx*omega,vy=-motion.dy*omega,vs=90/Math.hypot(motion.dx*omega,motion.dy*omega);
 ctx.strokeStyle='rgba(67,135,111,.35)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(q.x-vx*vs,q.y+vy*vs);ctx.lineTo(q.x+vx*vs,q.y-vy*vs);ctx.stroke();ctx.setLineDash([]);
 arrow(ctx,q.x,q.y,vx*vs,-vy*vs,'#43876f','v⃗');dot(ctx,q.x,q.y,6,'#216e61',true);
 document.getElementById('pv').textContent=Math.hypot(vx,vy).toFixed(1)+' u/s';

}

for(const [prefix,state] of [['s1',S1],['s2',S2]]){
 document.getElementById(prefix+'Play').onclick=()=>{if(prefix==='s2'&&state.t>=state.K)state.t=0;state.paused=false;};
 document.getElementById(prefix+'Pause').onclick=()=>{state.paused=true;};
 document.getElementById(prefix+'Reset').onclick=()=>{state.t=0;state.paused=true;};
}
for(const [id,state] of [['pShape',P],['s2Shape',S2]])document.getElementById(id).addEventListener('change',()=>{state.t=0;state.paused=true;});
function configureParameters(prefix){
 const mode=document.getElementById(prefix==='p'?'pShape':'s2Shape').value;
 const first=document.getElementById(prefix==='p'?'pA':'s2A').closest('.sld');
 const second=document.getElementById(prefix==='p'?'pAng':'s2T').closest('.sld');
 const duration=document.getElementById(prefix==='p'?'pV':'s2K').closest('.sld');
 first.querySelector('label').textContent=mode==='circle'?'Raza R (u)':mode==='ellipse'?'Semiaxa orizontală a (u)':'Extinderea orizontală L/2 (u)';
 first.hidden=mode==='custom';
 second.hidden=mode==='circle'||mode==='custom';
 document.getElementById(prefix+'CustomHelp').hidden=mode!=='custom';
 document.getElementById(prefix==='p'?'simEllipse':'sim2').style.touchAction=mode==='custom'?'none':'auto';
 second.querySelector('label').textContent=mode==='ellipse'?'Semiaxa verticală b (u)':'Extinderea verticală h (u)';
 duration.querySelector('label').textContent=['general','custom'].includes(mode)?'Durata parcurgerii (s)':'Durata unui tur T (s)';
 if(prefix==='p')document.getElementById('pParamInfo').textContent=mode==='custom'?'Trage punctele albastre pentru a modela curba. Linia punctată este poligonul de control, nu traiectoria.':mode==='general'?'Porțiune de curbă deschisă, fără perioadă. Animația se oprește la capăt.':'Traiectorie închisă. Durata unui tur caracterizează mișcarea ilustrată.';
}
function drawCustomHandles(ctx,ox,oy,scale){
 ctx.save();ctx.lineWidth=1;ctx.strokeStyle='rgba(56,121,172,.45)';ctx.setLineDash([4,5]);ctx.beginPath();
 customPoints.forEach((p,i)=>{const x=ox+p.x*160*scale,y=oy+p.y*110*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.setLineDash([]);
 customPoints.forEach((p,i)=>{const x=ox+p.x*160*scale,y=oy+p.y*110*scale;dot(ctx,x,y,7,'#3879ac');ctx.strokeStyle='#f6f8f6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7,0,2*Math.PI);ctx.stroke();ctx.fillStyle='#3879ac';ctx.font='12px Arial,sans-serif';window.PraxisVelocityLabels.label(ctx,'P'+String.fromCharCode(8320+i),x+11,y-12);});ctx.restore();
}
function resetCustomMotion(){P.t=0;P.paused=true;S2.t=0;S2.paused=true;}
for(const prefix of ['p','s2']){
 const cv=document.getElementById(prefix==='p'?'simEllipse':'sim2');let grabbed=-1,activePointer=null;
 const position=e=>{const r=cv.getBoundingClientRect(),w=cv.clientWidth,h=cv.clientHeight,scale=Math.max(.15,Math.min(1,(w-230)/340,(h-220)/340));return{x:(e.clientX-r.left)*(w/r.width),y:(e.clientY-r.top)*(h/r.height),w,h,scale};};
 cv.addEventListener('pointerdown',e=>{
  if(document.getElementById(prefix+'Shape').value!=='custom'||activePointer!==null)return;
  const q=position(e);let distance=26;
  customPoints.forEach((p,i)=>{const d=Math.hypot(q.x-q.w/2-p.x*160*q.scale,q.y-q.h/2-p.y*110*q.scale);if(d<distance){distance=d;grabbed=i;}});
  if(grabbed<0)return;activePointer=e.pointerId;cv.setPointerCapture(e.pointerId);resetCustomMotion();e.preventDefault();
 });
 cv.addEventListener('pointermove',e=>{
  if(grabbed<0||e.pointerId!==activePointer)return;const q=position(e);
  const low=grabbed?customPoints[grabbed-1].x+.08:-1.15,high=grabbed<5?customPoints[grabbed+1].x-.08:1.15;
  customPoints[grabbed]={x:Math.max(low,Math.min(high,(q.x-q.w/2)/(160*q.scale))),y:Math.max(-1.25,Math.min(1.25,(q.y-q.h/2)/(110*q.scale)))};e.preventDefault();
 });
 const finish=e=>{if(e.pointerId===activePointer){if(cv.hasPointerCapture(e.pointerId))cv.releasePointerCapture(e.pointerId);grabbed=-1;activePointer=null;}};
 cv.addEventListener('pointerup',finish);cv.addEventListener('pointercancel',finish);cv.addEventListener('lostpointercapture',()=>{grabbed=-1;activePointer=null;});
 document.getElementById(prefix+'ShapeReset').onclick=()=>{customPoints=DEFAULT_POINTS.map(p=>({...p}));resetCustomMotion();};
}

for(const prefix of ['p','s2']){configureParameters(prefix);document.getElementById(prefix==='p'?'pShape':'s2Shape').addEventListener('change',()=>configureParameters(prefix));}

/* ============ Main loop ============ */
addEventListener('resize',()=>{if(document.getElementById('panel-teorie').classList.contains('active'))drawTheory();});
let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(document.getElementById('panel-viteza').classList.contains('active')){drawSim1(dt);drawEllipse(dt);}
  if(document.getElementById('panel-acceleratie').classList.contains('active'))drawSim2(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
