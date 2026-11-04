import {elastic} from '../../shared/hooke-model.js';
const $=id=>document.getElementById(id),tr=s=>PraxisI18n.tr(s);
const number=(v,d=2)=>(Math.abs(v)<1e-10?0:v).toLocaleString(PraxisI18n.locale,{minimumFractionDigits:d,maximumFractionDigits:d});
const colors=()=>PraxisScientificColors.palette(document.documentElement.dataset.courseColors);
const line=(x1,y1,x2,y2,color,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const svgIndices=value=>String(value).replace(/([FLW])_ap|Fₑ/g,token=>`${token[0]}<tspan dy="3" font-size="9">${token==='Fₑ'?'e':'ap'}</tspan><tspan dy="-3" font-size="13">&#8203;</tspan>`);
const text=(x,y,value,anchor='start',color='currentColor')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" style="fill:${color}" font-size="13">${svgIndices(value)}</text>`;
const arrow=(x,y,dx,c)=>Math.abs(dx)<.1?'':line(x,y,x+dx,y,c)+`<path d="M${x+dx-Math.sign(dx)*7} ${y-5} L${x+dx} ${y} L${x+dx-Math.sign(dx)*7} ${y+5}" fill="none" stroke="${c}" stroke-width="2"/>`;
const zoom=()=>parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
export function geometry(){const width=Math.max(280,$('scene').getBoundingClientRect().width/zoom());return {width,origin:width*.58,scale:(width-100)/1.05};}
export function deformationAt(clientX){const g=geometry();return ((clientX-$('scene').getBoundingClientRect().left)/zoom()-g.origin)/g.scale;}
export function render(p,s){
 const c=colors(),g=geometry(),x=g.origin+s.x*g.scale,left=g.origin-25-.6*g.scale;
 $('scene').setAttribute('viewBox',`0 0 ${g.width} 190`);
 const spring=Array.from({length:25},(_,i)=>`${left+(x-25-left)*i/24},${i===0||i===24?88:88+(i%2?11:-11)}`).join(' ');
 $('scene').innerHTML=line(left,52,left,116,'currentColor')+line(left,116,g.width-15,116,'currentColor')+
 line(g.origin,42,g.origin,151,c.blue,'4 4')+text(g.origin,31,'x = 0','middle')+
 `<polyline points="${spring}" fill="none" stroke="${c.purple}" stroke-width="3"/>`+
 `<rect data-drag x="${x-25}" y="63" width="50" height="52" rx="8" fill="${c.orange}" stroke="currentColor"/>`+text(x,94,tr('Corp'),'middle')+
 arrow(x,50,s.force/40*65,c.red)+(!s.released?arrow(x,130,s.applied/40*65,c.blue):'')+
 text(12,18,tr('Trage corpul sau folosește săgețile ← →.'))+
 [-.2,0,.2].map(v=>line(g.origin+v*g.scale,145,g.origin+v*g.scale,151,'currentColor')+text(g.origin+v*g.scale,166,number(v,1),'middle')).join('')+text(g.width-8,166,'x (m)','end')+
 text(12,187,`Fₑ = ${number(s.force)} N    F_ap = ${number(s.applied)} N`);
 $('scene').setAttribute('aria-valuenow',String(s.x));
 $('scene').setAttribute('aria-valuetext',`${number(s.x,3)} m`);
 $('readouts').innerHTML=[['Timp',s.t,'s'],['Deformare',s.x,'m'],['Viteză',s.v,'m/s'],['Putere elastică',s.power,'W']].map(([label,value,unit])=>`<div>${tr(label)}<strong>${number(value,3)} ${unit}</strong></div>`).join('');
 graph('force-graph',p,s,c,false);graph('energy-graph',p,s,c,true);
 const max=Math.max(s.initialEnergy,.001);
 $('energy-bars').innerHTML=[['U',s.potential,c.purple],['K',s.kinetic,c.orange],['E',s.energy,c.green]].map(([name,value,color])=>`<div class="bar-row"><b style="color:${color}">${name}</b><div class="bar-track"><div class="bar-fill" style="background:${color};width:${Math.min(100,value/max*100)}%"></div></div><span class="bar-value">${number(value,3)} J</span></div>`).join('');
}
function graph(id,p,s,c,energy){
 const el=$(id),w=Math.max(270,el.getBoundingClientRect().width/zoom()),h=165,L=42,R=w-18,top=28,bottom=132,mid=energy?bottom:80;
 el.setAttribute('viewBox',`0 0 ${w} ${h}`);
 const px=x=>L+(x+.2)/.4*(R-L),max=energy?.5*p.k*.2**2:p.k*.2;
 const py=y=>energy?bottom-y/max*(bottom-top):mid-y/max*(mid-top);
 const value=x=>energy?elastic(p.k,x).potential:elastic(p.k,x).force;
 const count=Math.ceil(w/3),path=Array.from({length:count+1},(_,i)=>{const x=-.2+.4*i/count;return `${i?'L':'M'}${px(x)},${py(value(x))}`;}).join(' ');
 let markup=text(L,15,energy?'U (J)':'Fₑ (N)', 'start',energy?c.purple:c.red)+text(L-4,top+4,number(max,1),'end')+text(L-4,bottom,energy?'0':number(-max,1),'end')+
 line(L,mid,R,mid,'currentColor')+line(px(0),top,px(0),bottom,'currentColor','3 3')+
 [-.2,0,.2].map(x=>text(px(x),149,number(x,1),'middle')).join('')+text(R,164,'x (m)','end')+
 `<path d="${path}" fill="none" stroke="${energy?c.purple:c.red}" stroke-width="2.5"/>`;
 if(!energy&&!s.released){
  markup+=line(px(-.2),py(-p.k*.2),px(.2),py(p.k*.2),c.blue,'5 4')+
  `<path d="M${px(0)},${py(0)} L${px(s.x)},${py(0)} L${px(s.x)},${py(p.k*s.x)} Z" fill="${c.blue}" opacity=".2"/>`+text(L,164,tr('Arie: L_ap = U'),'start',c.blue);
 }
 markup+=`<circle cx="${px(s.x)}" cy="${py(value(s.x))}" r="5" fill="${energy?c.purple:c.red}" stroke="var(--praxis-color-surface)" stroke-width="2"/>`;
 el.innerHTML=markup;
}
