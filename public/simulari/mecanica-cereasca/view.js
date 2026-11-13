import {orbit,period,circular,TAU,SIDEREAL_DAY} from './model.js';
const ink='#ecf3f5',muted='#a9beca',grid='#365363',background='#0d2131';
function palette(){const colors=document.documentElement.dataset.courseColors==='vivid'?{body:'#59d8ec',v:'#ffc066',f:'#54d58f',other:'#cf9fff'}:{body:'#80c9c4',v:'#e5b967',f:'#7cc4a7',other:'#c0a0e0'};return Object.fromEntries(Object.entries(colors).map(([role,hex])=>[role,'rgb('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(' ')+')']));}
function prepare(canvas){
 const {width:w,height:h}=canvas.getBoundingClientRect();if(!w||!h)return null;
 const d=PraxisCanvasResolution.ratio(w,h),pw=Math.round(w*d),ph=Math.round(h*d);
 if(canvas.width!==pw)canvas.width=pw;if(canvas.height!==ph)canvas.height=ph;
 const c=canvas.getContext('2d');c.setTransform(pw/w,0,0,ph/h,0,0);c.fillStyle=background;c.fillRect(0,0,w,h);
 c.font='14px system-ui, sans-serif';c.textBaseline='middle';c.textAlign='left';return {c,w,h,p:palette()};
}
function line(c,x,y,X,Y,color,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function dot(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function label(c,s,x,y,w,h,color=ink){c.fillStyle=color;c.fillText(s,Math.max(8,Math.min(w-c.measureText(s).width-8,x)),Math.max(14,Math.min(h-14,y)));}
function arrow(c,x,y,X,Y,color){line(c,x,y,X,Y,color,2);const a=Math.atan2(Y-y,X-x);c.beginPath();c.moveTo(X,Y);c.lineTo(X-8*Math.cos(a-.4),Y-8*Math.sin(a-.4));c.lineTo(X-8*Math.cos(a+.4),Y-8*Math.sin(a+.4));c.closePath();c.fillStyle=color;c.fill();}
function vector(c,s,x,y,w,h,color){x=Math.max(12,Math.min(w-26,x));y=Math.max(52,Math.min(h-38,y));label(c,s,x,y,w,h,color);arrow(c,x,y-13,x+12,y-13,color);}
function body(c,x,y,r,color){const glow=c.createRadialGradient(x-r/3,y-r/3,1,x,y,r);glow.addColorStop(0,'#f1faf5');glow.addColorStop(.25,color);glow.addColorStop(1,'#193a4e');c.fillStyle=glow;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
export function drawOrbit(canvas,state,tr,words){
 const v=prepare(canvas);if(!v)return;const {c,w,h,p}=v,a=state.a,e=state.e,M=TAU*state.time/period(a,state.mass),point=orbit(a,e,M,state.mass);
 const scale=Math.min((w-120)/(2*a),(h-130)/(2*point.b)),cx=w/2,cy=h/2+4,sx=cx+a*e*scale,sy=cy;
 const X=q=>sx+q.x*scale,Y=q=>sy-q.y*scale;
 if(state.sectors){for(const [start,color]of [[M,p.f],[M+Math.PI,p.other]]){c.beginPath();c.moveTo(sx,sy);for(let i=0;i<=40;i++){const q=orbit(a,e,start+TAU*i/480,state.mass);c.lineTo(X(q),Y(q));}c.closePath();c.globalAlpha=.26;c.fillStyle=color;c.fill();c.globalAlpha=1;}}
 c.beginPath();c.ellipse(cx,cy,a*scale,point.b*scale,0,0,TAU);c.strokeStyle=muted;c.lineWidth=1.5;c.stroke();
 if(state.mode==='geometry'){c.setLineDash([4,5]);line(c,cx-a*scale,cy,cx+a*scale,cy,grid);line(c,cx,cy-point.b*scale,cx,cy+point.b*scale,grid);c.setLineDash([]);dot(c,cx-a*e*scale,cy,3,muted);label(c,'F₂',cx-a*e*scale-8,cy+20,w,h,muted);label(c,'a',cx+a*scale/2,cy+18,w,h);label(c,'b',cx+9,cy-point.b*scale/2,w,h);}
 const x=X(point),y=Y(point);line(c,sx,sy,x,y,p.body);body(c,sx,sy,Math.min(11,point.rp*scale*.4),p.v);body(c,x,y,Math.min(8,point.rp*scale*.3),p.body);
 if(state.vectors){const vx=point.vx/point.speed,vy=-point.vy/point.speed,rx=(sx-x)/Math.hypot(sx-x,sy-y),ry=(sy-y)/Math.hypot(sx-x,sy-y);arrow(c,x,y,x+40*vx,y+40*vy,p.v);vector(c,'v',x+48*vx,y+48*vy,w,h,p.v);arrow(c,x,y,x+31*rx,y+31*ry,p.f);vector(c,'F',x+39*rx,y+39*ry,w,h,p.f);}
 label(c,tr(state.mode==='areas'?words.equal:state.mode==='momentum'?words.moment:words.geometry),12,20,w,h);
 if(state.mode==='momentum'){dot(c,24,h-27,10,p.other);dot(c,24,h-27,3,background);label(c,'L',42,h-27,w,h,p.other);label(c,'L = constant',70,h-27,w,h,muted);}
 else if(e>.001){label(c,tr(words.peri),cx+a*scale-24,cy+34,w,h,muted);label(c,tr(words.apo),cx-a*scale-24,cy+34,w,h,muted);label(c,state.sectors?'Δt = T / 12':'0 ≤ e < 1',12,h-20,w,h,muted);}
 else label(c,'e = 0  |  r = a',12,h-20,w,h,muted);
}
export function drawPeriods(canvas,state,tr,words){
 const v=prepare(canvas);if(!v)return;const {c,w,h,p}=v,cx=w/2,cy=h/2+5,scale=Math.min(w-100,h-100)/(2*Math.max(state.a1,state.a2));
 for(const [a,color,name,offset]of [[state.a1,p.body,'1',0],[state.a2,p.other,'2',Math.PI/3]]){const r=a*scale,angle=TAU*state.time/period(a,state.mass)+offset;c.beginPath();c.arc(cx,cy,r,0,TAU);c.strokeStyle=color;c.lineWidth=1.5;c.stroke();const x=cx+r*Math.cos(angle),y=cy-r*Math.sin(angle);body(c,x,y,7,color);label(c,name,x+11,y-10,w,h,color);}
 body(c,cx,cy,12,p.v);label(c,tr(words.star),cx+16,cy+10,w,h,p.v);label(c,'1 : a₁     2 : a₂',12,20,w,h);label(c,tr(words.legend),12,h-20,w,h,muted);
}
export function drawSatellite(canvas,state,tr,words){
 const v=prepare(canvas);if(!v)return;const {c,w,h,p}=v,cx=w/2,cy=h/2+4,limit=Math.min(w/2-50,h/2-65),base=Math.min(72,limit),r=base+Math.max(0,limit-base)*(state.altitude/42000)**.35;
 const earthAngle=TAU*state.time/SIDEREAL_DAY,angle=state.direction*TAU*state.time/circular(state.altitude).T-(state.earthFrame?earthAngle:0),earthPhase=state.earthFrame?0:earthAngle;
 c.beginPath();c.arc(cx,cy,r,0,TAU);c.setLineDash([4,5]);c.strokeStyle=muted;c.stroke();c.setLineDash([]);body(c,cx,cy,26,p.body);const gx=cx+27*Math.cos(earthPhase),gy=cy-27*Math.sin(earthPhase);line(c,cx,cy,gx,gy,p.f,2);dot(c,gx,gy,3,p.f);
 const x=cx+r*Math.cos(angle),y=cy-r*Math.sin(angle);c.save();c.translate(x,y);c.rotate(-angle);c.fillStyle=p.v;c.fillRect(-6,-8,12,16);c.fillStyle='#356a91';c.strokeStyle='#9cc3dc';for(const px of [-23,10]){c.fillRect(px,-6,13,12);c.strokeRect(px,-6,13,12);line(c,px+6,-6,px+6,6,'#9cc3dc');}line(c,0,-8,0,-15,ink);c.restore();
 const vx=-Math.sin(angle)*state.direction,vy=-Math.cos(angle)*state.direction;arrow(c,x,y,x+32*vx,y+32*vy,p.v);vector(c,'v',x+40*vx,y+40*vy,w,h,p.v);arrow(c,x,y,x-25*Math.cos(angle),y+25*Math.sin(angle),p.f);vector(c,'F',x-35*Math.cos(angle),y+35*Math.sin(angle),w,h,p.f);
 label(c,tr(words.satellites),12,20,w,h);label(c,tr(words.earth),cx-25,cy+43,w,h,muted);label(c,'h = '+Math.round(state.altitude).toLocaleString(window.PraxisI18n.locale)+' km',12,h-20,w,h,muted);
}
