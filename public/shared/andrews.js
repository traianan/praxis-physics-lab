/* Reduced van der Waals isotherms with Maxwell coexistence, not the unstable loop.
   CO2 critical constants provide the reference; curves are an educational model. */
(() => {
 const TC=304.1282,PC=7.37703,VC=3*8.314462618*304.1282/(8*7.37703e6)*1000,cache=new Map();
 const pressure=(T,v)=>8*T/(3*v-1)-3/(v*v);
 function bisect(fn,lo,hi){let a=fn(lo);for(let i=0;i<75;i++){const mid=(lo+hi)/2,b=fn(mid);if(a*b<=0)hi=mid;else{lo=mid;a=b;}}return (lo+hi)/2;}
 function coexistence(T){
  if(T>=1)return null;const key=T.toFixed(7);if(cache.has(key))return cache.get(key);
  const spin=v=>(3*v-1)**2/(4*v**3)-T,l=bisect(spin,1/3+1e-8,1),g=bisect(spin,1,100),pmin=pressure(T,l),pmax=pressure(T,g);
  function roots(p){let upper=10;while(pressure(T,upper)>p)upper*=2;return [bisect(v=>pressure(T,v)-p,1/3+1e-8,l),bisect(v=>pressure(T,v)-p,g,upper)];}
  const primitive=v=>8*T/3*Math.log(3*v-1)+3/v;
  const area=p=>{const [vl,vg]=roots(p);return primitive(vg)-primitive(vl)-p*(vg-vl);};
  const p=bisect(area,Math.max(1e-8,pmin)+1e-10,pmax-1e-10),[vl,vg]=roots(p),result={p,vl,vg};cache.set(key,result);return result;
 }
 function state(T,v){const c=coexistence(T);if(c){if(v<c.vl)return {p:pressure(T,v),kind:'liq.state.liquid',liquid:1,volumeLiquid:1,coexist:c};if(v>c.vg)return {p:pressure(T,v),kind:'liq.state.vapour',liquid:0,volumeLiquid:0,coexist:c};const x=(c.vg-v)/(c.vg-c.vl);return {p:c.p,kind:'liq.state.mixture',liquid:x,volumeLiquid:x*c.vl/v,coexist:c};}
  const p=pressure(T,v),critical=Math.abs(T-1)<1e-8&&Math.abs(v-1)<1e-4;return {p,kind:critical?'liq.state.critical':T>1&&p>1?'liq.state.supercritical':T>1?'liq.state.gas':'liq.state.single',liquid:null,volumeLiquid:null,coexist:null};
 }
 let envelope;
 function binodal(){if(!envelope){envelope=[];for(let i=0;i<160;i++){const T=1-.65*(1-i/160)**2;envelope.push({T,...coexistence(T)});}envelope.push({T:1,p:1,vl:1,vg:1});}return envelope;}
 function physical(T,v){return {kelvin:T*TC,celsius:T*TC-273.15,litres:v*VC,MPa:state(T,v).p*PC};}
 const isotherms=[-10,0,10,20,25,29].map(celsius=>({celsius,T:(celsius+273.15)/TC}));
 function create({fit,txt,colors:C}){
  const s={T:.94,v:4.5,direction:0,out:null};
  const tr=key=>window.I18N.t(key),num=(v,d=2)=>window.Util.num(v,d);
  s.report=function(){this.out={...state(this.T,this.v),T:this.T,v:this.v,...physical(this.T,this.v)};return this.out;};
  s.sync=function(){const out=this.report(),values={andrTOut:num(out.celsius,2)+' °C',andrVOut:num(out.litres,3)+' L',andrTemp:num(out.celsius,2)+' °C',andrPressure:num(out.MPa,2)+' MPa',andrState:tr(out.kind),andrLiquid:out.liquid===null?'—':num(out.liquid*100,1)+' %'};for(const [id,value]of Object.entries(values)){const el=document.getElementById(id);if(el&&el.textContent!==value)el.textContent=value;}for(const [id,value]of [['andrT',this.T],['andrV',this.v]]){const input=document.getElementById(id);if(input){input.setAttribute('aria-valuetext',id==='andrT'?values.andrTOut:values.andrVOut);if(+input.value!==value){input.value=value;window.Util.paint(input);}}}const pause=document.getElementById('andrPause');if(pause)pause.disabled=!this.direction;};
  s.init=function(){for(const [id,key]of [['andrT','T'],['andrV','v']])document.getElementById(id)?.addEventListener('input',event=>{this[key]=+event.target.value;this.direction=0;window.Util.paint(event.target);this.draw(0);});for(const [id,T,v]of [['andrBelow',.9,4.5],['andrCritical',1,1],['andrAbove',1.06,4.5],['andrReset',.94,4.5]])document.getElementById(id)?.addEventListener('click',()=>{this.T=T;this.v=v;this.direction=0;this.draw(0);});for(const [id,direction]of [['andrCompress',-1],['andrExpand',1],['andrPause',0]])document.getElementById(id)?.addEventListener('click',()=>{this.direction=direction;this.draw(0);});this.sync();};
  s.draw=function(dt=0){this.v=Math.max(.55,Math.min(20,this.v+this.direction*dt*.8));if(this.v===.55||this.v===20)this.direction=0;const out=this.report(),canvas=document.getElementById('andrewsCanvas');if(!canvas)return out;const {g,w:W,h:H}=fit(canvas);const left=60,right=W-24,top=44,bottom=556,X=v=>left+Math.log(v/.34)/Math.log(20/.34)*(right-left),Y=p=>bottom-p/1.5*(bottom-top);
   function label(text,x,y,opt={}){txt(g,text,x,y,{size:12,...opt});}
   function line(x1,y1,x2,y2,color=C.axis,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
   const boundary=binodal();
   g.save();g.beginPath();g.rect(left,top,right-left,bottom-top);g.clip();
   function region(points,color){g.fillStyle=color+'18';g.beginPath();points.forEach(([v,p],i)=>i?g.lineTo(X(v),Y(p)):g.moveTo(X(v),Y(p)));g.closePath();g.fill();}
   const criticalCurve=Array.from({length:301},(_,i)=>{const v=.34*Math.pow(20/.34,i/300);return [v,pressure(1,v)];}),criticalRight=criticalCurve.filter(([v])=>v>1),criticalLeft=criticalCurve.filter(([v])=>v<1);
   region([[.34,0],...boundary.map(c=>[c.vl,c.p]),...criticalLeft.slice().reverse()],C.gold);
   region([...boundary.map(c=>[c.vl,c.p]),...boundary.slice().reverse().map(c=>[c.vg,c.p])],C.cyan);
   region([[20,0],...boundary.map(c=>[c.vg,c.p]),...criticalRight],C.green);
   region([[.34,1.5],[20,1.5],...criticalCurve.slice().reverse()],C.violet);
   g.restore();
   for(const p of [0,2,4,6,8,10]){line(left,Y(p/PC),right,Y(p/PC),C.grid);label(num(p,0),left-8,Y(p/PC)+4,{align:'right'});}
   for(const litres of [.05,.1,.2,.5,1,2]){line(X(litres/VC),top,X(litres/VC),bottom,C.grid);label(num(litres,litres<.1?2:1),X(litres/VC),bottom+20,{align:'center'});}
   line(left,top,left,bottom);line(left,bottom,right,bottom);label('p (MPa)',left,24,{bold:true});label(tr('liq.axis.volume'),right,bottom+44,{align:'right',bold:true});
   g.save();g.beginPath();g.rect(left,top,right-left,bottom-top);g.clip();
   function curve(T,color,width,dashed){g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dashed?[5,4]:[]);g.beginPath();for(let i=0;i<=450;i++){const v=.345*Math.pow(20/.345,i/450),p=state(T,v).p;if(i===0)g.moveTo(X(v),Y(p));else g.lineTo(X(v),Y(p));}g.stroke();g.setLineDash([]);}
   for(const row of isotherms)curve(row.T,C.gold,1.5,false);curve(1,C.violet,1.8,false);curve(1.06,C.green,1.4,true);curve(this.T,C.accent,3,false);
   g.strokeStyle=C.axis;g.lineWidth=2.2;g.setLineDash([2,4]);g.beginPath();boundary.forEach((c,i)=>i?g.lineTo(X(c.vl),Y(c.p)):g.moveTo(X(c.vl),Y(c.p)));boundary.slice().reverse().forEach(c=>g.lineTo(X(c.vg),Y(c.p)));g.stroke();g.setLineDash([]);
   g.restore();
   g.setLineDash([4,4]);line(left,Y(1),X(1),Y(1),C.violet);line(X(1),Y(1),X(1),bottom,C.violet);g.setLineDash([]);
   g.fillStyle=C.violet;g.beginPath();g.arc(X(1),Y(1),6,0,Math.PI*2);g.fill();label('C',X(1)+12,Y(1)-12,{bold:true,color:C.violet});
   if(out.coexist){for(const [letter,v,dy]of [['L',out.coexist.vl,-12],['G',out.coexist.vg,34]]){g.fillStyle=C.cyan;g.beginPath();g.arc(X(v),Y(out.coexist.p),3.5,0,Math.PI*2);g.fill();if(this.T<.98)label(letter,X(v)+(letter==='L'?-8:5),Y(out.coexist.p)+dy,{align:letter==='L'?'right':'left',bold:true});}}
   g.fillStyle=C.red;g.beginPath();g.arc(X(this.v),Y(out.p),5,0,Math.PI*2);g.fill();
   // Labels are staggered beside the vapour end of each plateau, with short leaders.
   function curveLabel(text,anchorV,anchorP,x,y,color,align='left'){
    line(X(anchorV),Y(anchorP),x+(align==='right'?-4:4),y-4,color,1);
    g.save();g.font='12px "Consolas","Segoe UI",monospace';const width=g.measureText(text).width,l=align==='right'?x-width:x;g.fillStyle='#ffffff';g.fillRect(l-3,y-13,width+6,17);g.restore();label(text,x,y,{align});
   }
   curveLabel('C · '+num(TC-273.15,2)+' °C',1,1,X(1)+8,Y(1)-105,C.violet);
   const shifts=[10,0,-8,-20,-40,-62];
   isotherms.forEach((row,i)=>{const c=coexistence(row.T);curveLabel(num(row.celsius,0)+' °C',c.vg,c.p,X(c.vg)+18,Y(c.p)+shifts[i],C.gold);});
   curveLabel(num(1.06*TC-273.15,1)+' °C',12,state(1.06,12).p,X(12),Y(state(1.06,12).p)-45,C.green,'right');
   curveLabel(tr('liq.legend.current')+': '+num(out.celsius,1)+' °C',19,state(this.T,19).p,right-4,Y(state(this.T,19).p)+25,C.accent,'right');
   const lower=key=>tr(key).toLocaleLowerCase(window.I18N.lang);
   label(lower('liq.region.liquid'),X(.44),Y(1.1),{align:'center',bold:true,size:14,rot:-Math.PI/2});
   label(lower('liq.region.mixname'),X(1.5),Y(.3)-7,{align:'center',bold:true,size:14});
   label(lower('liq.region.mixture'),X(1.5),Y(.3)+12,{align:'center',bold:true,size:14});
   label(lower('liq.region.vapour'),X(8),Y(.225),{align:'center',bold:true,size:12,rot:.44,base:'middle'});
   label(lower('liq.region.gas'),X(8),Y(1.25),{align:'center',bold:true,size:14});
   label(tr('liq.diagram.piston'),18,665,{bold:true});const x=48,y=690,width=100+Math.log(this.v/.55)/Math.log(20/.55)*(W-190),height=96;
   g.strokeStyle=C.axis;g.lineWidth=2;g.strokeRect(x,y,width,height);const fraction=out.volumeLiquid??(out.p>1?1:0);g.fillStyle=out.liquid===null?C.cyan+'35':C.accent+'60';g.fillRect(x+2,y+2,Math.max(0,(width-4)*fraction),height-4);
   if(out.liquid===null||out.liquid===0||out.liquid<1){const start=x+Math.max(0,width*fraction)+8,space=Math.max(0,width*(1-fraction)-16);for(let i=0;i<14&&space>2;i++){g.fillStyle=C.cyan;g.beginPath();g.arc(start+(i*47%100)/100*space,y+14+(i*23%70),2.8,0,Math.PI*2);g.fill();}}
   g.fillStyle=C.axis;g.fillRect(x+width-5,y-4,9,height+8);line(x+width+4,y+height/2,Math.min(W-14,x+width+45),y+height/2,C.axis,5);
   label(tr('liq.diagram.constant'),18,H-20,{size:12});this.sync();return out;
  };return s;
 }
 window.PraxisAndrews={pressure,coexistence,state,create,binodal,physical,isotherms,constants:{TC,PC,VC}};
})();
