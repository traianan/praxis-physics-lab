import {capViews} from './view.js';
import {wavefrontRadii,wavefrontArc} from './wavefronts.js';
import {wrappedTrace,angleWithinTurn} from './angular-trace.js';
const ink='#183e37',green='#17685f',gold='#a36b17';
const line=(x1,y1,x2,y2,color=green,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="5 5"':''}/>`;
const text=(x,y,s,anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
const dot=(x,y,color=green,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const velocityLabel=(x,y)=>text(x,y,'v')+`<path d="M${x} ${y-21} h14 m-4 -3 4 3 -4 3" stroke="${ink}" fill="none" stroke-width="1.5"/>`;
function chart(points,{xmin=0,xmax=4,ymin=0,ymax=1,xlabel,ylabel,format,yformat=format},point){
  const x=v=>42+(v-xmin)/(xmax-xmin)*225,y=v=>245-(v-ymin)/(ymax-ymin)*195;
  let pen=false;
  const path=points.map(p=>{if(!p){pen=false;return '';}const command=pen?'L':'M';pen=true;return `${command}${x(p[0])} ${y(p[1])}`;}).join(' ');
  return line(42,245,275,245,ink)+line(42,245,42,35,ink)+
    `<path d="M277 240 287 245 277 250Z M37 36 42 26 47 36Z" fill="${ink}"/>`+
    text(42,278,format(xmin), 'middle')+text(267,278,format(xmax),'middle')+
    text(36,245,yformat(ymin),'end')+text(36,55,yformat(ymax),'end')+
    line(42,147.5,275,147.5,'#d2ddd4','dash')+text(36,151,yformat((ymin+ymax)/2),'end')+
    text(283,315,xlabel,'end')+text(42,21,ylabel)+
    `<path data-physics-trace fill="none" stroke="${green}" stroke-width="3" d="${path}"/>`+
    (point?dot(x(point[0]),y(point[1]),gold,6):'');
}
export function physicsView(id,s,p,history,narrow,labels,format){
  const second=html=>`<g transform="translate(${narrow?'0 315':'320 0'})">${html}</g>`;
  let scene='',graph='';
  if(id==='rotation'){
    const R=220*p.radius,theta=angleWithinTurn(s.phase),cx=150,cy=155;
    const px=cx+R*Math.cos(theta),py=cy-R*Math.sin(theta),vx=-Math.sin(theta)*s.speed*6,vy=-Math.cos(theta)*s.speed*12;
    const count=Math.max(2,Math.ceil(theta*16)+1);
    const arc=Array.from({length:count},(_,i)=>{const v=theta*i/(count-1);return `${cx+R*Math.cos(v)},${cy-R*Math.sin(v)}`;});
    scene=`<defs><marker id="physics-v-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="${gold}"/></marker></defs>`+
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#eef3ed" stroke="#b9cbc3" stroke-width="2"/>`+
      line(cx,cy,cx+R,cy,'#b9cbc3')+line(cx,cy,px,py)+
      `<polyline points="${arc.join(' ')}" fill="none" stroke="${gold}" stroke-width="5"/>`+
      (s.speed>0?`<line x1="${px}" y1="${py}" x2="${px+vx}" y2="${py+vy}" stroke="${gold}" stroke-width="3" marker-end="url(#physics-v-arrow)"/>`:'')+
      dot(cx,cy,ink,3)+dot(px,py)+text(cx-22,cy+22,'O')+text(cx+R/2,cy+25,'r')+
      velocityLabel(Math.max(15,Math.min(275,px+vx+7)),Math.max(30,Math.min(275,py+vy-8)))+
      text(150,300,labels.turns+': '+format(s.turns,2),'middle');
    const wrapped=p.graph==='wrapped',min=wrapped?Math.max(0,s.time-4):0,max=Math.max(4,s.time);
    const high=wrapped?2*Math.PI:Math.max(2*Math.PI,Math.ceil((s.phase-1e-10)/(2*Math.PI))*2*Math.PI);
    const points=wrapped?wrappedTrace(history,min,max):history.map(h=>[h.time,h.phase]);
    const graphAngle=wrapped?angleWithinTurn(s.phase):s.phase;
    graph=chart(points,{xmin:min,xmax:max,ymin:0,ymax:high,xlabel:labels.timeAxis,ylabel:'θ (rad)',format:v=>format(v,1),yformat:v=>v===0?'0':Math.abs(v/Math.PI-1)<1e-9?'π':format(v/Math.PI,1)+'π'},[s.time,graphAngle]);
  }else if(id==='oscillation'){
    const R=p.amplitude*200,cx=150,cy=155,x=cx+R*Math.cos(s.phase),y=cy-R*Math.sin(s.phase);
    scene=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#eef3ed" stroke="#b9cbc3" stroke-width="2"/>`+
      line(25,cy,285,cy,'#b9cbc3')+line(cx,35,cx,280,'#b9cbc3')+line(cx,cy,x,y)+line(x,y,275,y,gold,'dash')+
      line(275,cy,275,y,gold)+dot(x,y)+dot(275,y,gold,7)+text(284,y-9,'x')+text(150,300,'φ = '+format(s.phase,2)+' rad','middle');
    const min=Math.max(0,s.time-4),max=Math.max(4,s.time),visible=history.filter(h=>h.time>=min);
    graph=chart(visible.map(h=>[h.time,h.position]),{xmin:min,xmax:max,ymin:-.5,ymax:.5,xlabel:labels.timeAxis,ylabel:'x (m)',format:v=>format(v,1)},[s.time,s.position]);
  }else if(id==='light'){
    const R=24*p.radius,cx=150,cy=155,a=p.alpha*Math.PI/180,x=cx+R*Math.cos(a),y1=cy-R*Math.sin(a),y2=cy+R*Math.sin(a);
    scene=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#eef3ed" stroke="#b9cbc3" stroke-width="2"/>`+
      `<path d="M${cx} ${cy} L${x} ${y1} A${R} ${R} 0 0 1 ${x} ${y2} Z" fill="#eee2bb" stroke="${gold}" stroke-width="2"/>`+
      `<path d="M${x} ${y1} A${R} ${R} 0 0 1 ${x} ${y2}" stroke="${green}" stroke-width="5" fill="none"/>`+
      line(cx,cy,cx+R,cy,'#b9cbc3','dash')+dot(cx,cy,gold,5)+text(cx-20,cy+23,'O')+text(cx+R/2,cy+25,'r');
    if(s.flux>0)for(const d of wavefrontRadii(s.time,R))scene+=`<path data-wavefront="cone" data-radius="${d}" d="${wavefrontArc(cx,cy,d,a,0)}" fill="none" stroke="${gold}" stroke-width="2"/>`;
    scene+=text(150,300,'A = '+format(s.area,2)+' m²','middle');
    const max=Math.max(1,p.mode==='flux'?s.flux:s.intensity*2*Math.PI)*1.1;
    graph=chart([[0,p.mode==='flux'?s.flux:0],[2*Math.PI,p.mode==='flux'?s.flux:s.intensity*2*Math.PI]],{xmin:0,xmax:2*Math.PI,ymin:0,ymax:max,xlabel:'Ω (sr)',ylabel:'Φᵥ (lm)',format:v=>format(v,1)},[s.omega,s.flux]);
  }else{
    const views=capViews(p.alpha,p.radius,labels.axis);
    scene=`<g transform="translate(0 5)">${views.side}</g>`;
    const R=24*p.radius;
    if(p.power>0)for(const d of wavefrontRadii(s.time,R)){
      scene+=`<circle data-wavefront="sphere" cx="150" cy="155" r="${d}" fill="none" stroke="#667e72" stroke-width="1.5"/>`;
      if(p.alpha===180)scene+=`<circle cx="150" cy="155" r="${d}" fill="none" stroke="${green}" stroke-width="2.5"/>`;
      else if(p.alpha>0)scene+=`<path data-wavefront="selected" data-radius="${d}" d="${wavefrontArc(150,155,d,p.alpha*Math.PI/180,-Math.PI/2)}" fill="none" stroke="${green}" stroke-width="2.5"/>`;
    }
    const width=260*s.fraction;
    graph=text(20,42,labels.power)+`<rect x="20" y="75" width="260" height="40" rx="5" fill="#dce5de"/><rect x="20" y="75" width="${width}" height="40" rx="5" fill="${green}"/>`+
      text(20,155,labels.selected+': '+format(s.selected,2)+' W')+text(20,195,labels.rest+': '+format(s.remaining,2)+' W')+
      text(20,240,format(s.selected,2)+' + '+format(s.remaining,2)+' = '+format(p.power,2)+' W')+
      text(20,285,format(100*s.fraction,2)+'%');
  }
  return scene+second(graph);
}
