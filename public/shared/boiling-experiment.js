/* Two explicit protocols: heated vessel at imposed pressure, and a sealed syringe.
   Gas headspace is ideal; syringe phase exchange conserves water and latent heat. */
(() => {
 const R=8.314462618,M=.01801528,CP=4181,TORR=101325/760;
 const latentHeat=T=>2.5e6-2400*Math.max(0,Math.min(130,T));
 function psatW(T){const [A,B,C]=T<=100?[8.07131,1730.63,233.426]:[8.14019,1810.94,244.485];return 760*Math.pow(10,A-B/(C+T))/Math.pow(10,A-B/(C+100));}
 function tsatW(p){const [B,C]=p<=760?[1730.63,233.426]:[1810.94,244.485];return 1/(1/(C+100)-Math.log10(p/760)/B)-C;}
 function model(){
  const s={mode:'heat',T:20,room:25,mass:.1,q:60,pSet:760,time:0,running:false,pulled:false,history:[],events:[],flow:0,vapour:0,air:0,volume:2e-7,initialMass:.1,wasBoil:false};
  s.pExt=()=>s.mode==='heat'?s.pSet:(s.air+s.vapour)*R*(s.T+273.15)/s.volume/TORR;
  s.Tb=()=>tsatW(Math.max(5,s.pExt()));
  s.sample=function(force=false){if(force||!this.history.length||this.time-this.history.at(-1).t>=.2)this.history.push({t:this.time,T:this.T,Tb:this.Tb()});if(this.history.length>1800)this.history=this.history.filter((_,i)=>i%2===0||i===this.history.length-1);};
  s.prepare=function(mode){this.mode=mode;this.T=mode==='syringe'?25:20;this.q=mode==='syringe'?0:60;this.mass=mode==='syringe'?.005:.1;this.initialMass=this.mass;this.pSet=760;this.time=0;this.running=false;this.pulled=false;this.flow=0;this.events=[];this.history=[];this.volume=2e-7;const k=this.volume*TORR/(R*(this.T+273.15));this.vapour=psatW(this.T)*k;this.air=(760-psatW(this.T))*k;this.sample(true);return this.report();};
  s.reset=function(){return this.prepare(this.mode);};
  s.setPressure=function(value){const next=Math.max(5,Math.min(1200,value));if(next===this.pSet)return;this.pSet=next;const last=this.events.at(-1);if(last?.key==='boil.event.pressure'&&this.time-last.t<1)last.t=this.time;else this.events.push({t:this.time,key:'boil.event.pressure'});this.sample(true);};
  s.pull=function(){if(this.mode!=='syringe'||this.pulled)return;this.pulled=true;this.volume=20e-6;this.events.push({t:this.time,key:'boil.event.pull'});this.running=true;return this.report();};
  s.push=function(){if(this.mode!=='syringe'||!this.pulled)return;this.volume=2e-7;this.pulled=false;const equilibrium=psatW(this.T)*TORR*this.volume/(R*(this.T+273.15)),dm=(equilibrium-this.vapour)*M;this.mass-=dm;this.T-=latentHeat(this.T)*dm/(this.mass*CP);this.vapour=equilibrium;this.flow=0;this.events.push({t:this.time,key:'boil.event.push'});this.sample(true);return this.report();};
  s.advance=function(dt){if(!this.running||!(dt>0))return this.report();let left=dt;while(left>1e-9){const h=Math.min(.05,left);left-=h;const before=this.mass;
    if(this.mode==='syringe'){
     const target=psatW(this.T)*TORR*this.volume/(R*(this.T+273.15));
     const dn=(target-this.vapour)*(1-Math.exp(-1.5*h)),dm=Math.max(-this.vapour*M,Math.min(this.mass*.01,dn*M));
     this.vapour+=dm/M;this.mass-=dm;this.T-=latentHeat(this.T)*dm/(this.mass*CP);
    }else{
     const power=this.q*8-.4*(this.T-this.room),energy=power*h,tb=this.Tb();
     if(this.T>tb+.001){const excess=this.T-tb,flash=Math.min(excess,excess*(1-Math.exp(-h*2)));const dm=this.mass*CP*flash/latentHeat(this.T);this.mass-=dm;this.T-=flash;}
     const sensible=this.mass*CP*Math.max(0,tb-this.T);
     if(energy>sensible&&energy>0){this.T=tb;this.mass-=Math.min(this.mass,(energy-sensible)/latentHeat(tb));}else this.T+=energy/(Math.max(.001,this.mass)*CP);
    }
    this.flow=(before-this.mass)/h;this.time+=h;this.sample();
    if(this.mass<.0001||this.T<0){this.running=false;break;}
   }return this.report();};
  s.report=function(){const p=this.pExt(),ps=psatW(this.T),boil=this.running&&this.flow>1e-9&&ps>=p-.2;let state;
   if(!this.running)state=this.mode==='syringe'&&!this.pulled&&this.events.at(-1)?.key==='boil.event.push'?'boil.state.pushed':'boil.state.ready';
   else if(this.mode==='syringe')state=!this.pulled?(this.events.at(-1)?.key==='boil.event.push'?'boil.state.pushed':'boil.state.sealed'):boil?'boil.state.flash':'boil.state.saturated';
   else state=boil?'fie.st.fierbe':this.q>0?'boil.state.heating':'boil.state.noheat';
   this.out={T:this.T,Tb:this.Tb(),state,psat:ps,boil,p,time:this.time,mode:this.mode,mass:this.mass,flow:this.flow};return this.out;};
  s.prepare('heat');return s;
 }
 function create({fit,txt,colors:C}){
  const s=model(),tr=key=>window.I18N.t(key),n=(v,d=1)=>window.Util.num(v,d);
  s.init=function(){this.report();};
  s.draw=function(dt=0){this.advance(dt*(this.mode==='heat'?4:1));const cv=document.getElementById('fierbCanvas');if(!cv)return this.report();const {g,w:W,h:H}=fit(cv),out=this.report();
   function text(value,x,y,opt={}){txt(g,value,x,y,{size:12,...opt});}
   function line(x1,y1,x2,y2,color=C.axis,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
   text(tr(this.mode==='heat'?'boil.diagram.heat':'boil.diagram.syringe'),18,22,{bold:true});
   if(this.mode==='heat'){
    g.strokeStyle=C.grid;g.lineWidth=1;g.strokeRect(18,40,252,260);
    const x=35,y=68,bw=220,bh=192;g.fillStyle=C.cyan+'55';g.fillRect(x+3,y+46,bw-6,bh-49);g.strokeStyle=C.axis;g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+bh);g.lineTo(x+bw,y+bh);g.lineTo(x+bw,y);g.stroke();line(x-8,y+bh+18,x+bw+8,y+bh+18,C.axis,3);
    if(this.running&&this.q>0)for(let i=0;i<5;i++){g.fillStyle=C.gold;g.beginPath();g.moveTo(x+25+i*40,y+bh+16);g.lineTo(x+32+i*40,y+bh+13-this.q*.09);g.lineTo(x+39+i*40,y+bh+16);g.fill();}
   }else{
    const x=62,y=110,bw=145,bh=160,head=this.pulled?120:180,handle=head-90;
    g.fillStyle='#fff';g.fillRect(x,y,bw,bh);g.strokeStyle=C.axis;g.lineWidth=2;g.strokeRect(x,y,bw,bh);
    g.fillStyle=C.cyan+'66';g.fillRect(x+3,220,bw-6,47);g.fillStyle=C.axis;g.fillRect(x+3,head,bw-6,7);g.fillRect(x+bw/2-4,handle,8,90);line(x+bw/2-30,handle,x+bw/2+30,handle,C.axis,4);
    for(let j=0;j<6;j++)line(x+3,y+22+j*25,x+14,y+22+j*25,C.axis);
    line(x+bw/2,272,x+bw/2,289,C.axis,4);g.fillStyle=C.red;g.fillRect(x+bw/2-12,286,24,9);
    text(tr('boil.diagram.closed'),x+bw+20,285,{size:12});
   }
   if(out.boil)for(let i=0;i<12;i++){const x=this.mode==='heat'?55+(i%6)*34:80+(i%4)*28,y=this.mode==='heat'?115+((i*29+this.time*24)%130):226+((i*13+this.time*20)%35);g.strokeStyle=C.blue||C.accent;g.lineWidth=1.4;g.beginPath();g.arc(x,y,3+(i%3)*1.2,0,Math.PI*2);g.stroke();}
   text('T = '+n(this.T,this.mode==='syringe'?3:1)+' °C',W-16,60,{align:'right',bold:true});
   text('p = '+n(out.p,1)+' torr',W-16,86,{align:'right'});
   text('p_sat = '+n(out.psat,1)+' torr',W-16,112,{align:'right'});
   text('T_f = '+n(out.Tb,1)+' °C',W-16,138,{align:'right'});
   const left=68,right=W-22,top=356,bottom=H-62;
   text(tr('boil.graph.title'),18,326,{bold:true});
   let lo=0,hi=130;if(this.mode==='syringe'){const values=this.history.map(p=>p.T);lo=Math.floor((Math.min(...values)-.02)*100)/100;hi=Math.ceil((Math.max(...values)+.02)*100)/100;}
   const maxTime=Math.max(this.mode==='syringe'?10:60,this.time),X=t=>left+t/maxTime*(right-left),Y=T=>bottom-(T-lo)/(hi-lo)*(bottom-top);
   for(let i=0;i<=4;i++){const T=lo+(hi-lo)*i/4,y=Y(T);line(left,y,right,y,C.grid);text(n(T,this.mode==='syringe'?2:0),left-8,y+4,{align:'right'});}
   for(let i=0;i<=4;i++){const t=maxTime*i/4,x=X(t);line(x,top,x,bottom,C.grid);text(n(t,0),x,bottom+20,{align:'center'});}
   line(left,top,left,bottom);line(left,bottom,right,bottom);text('T [°C]',left,top-12,{bold:true});text('t [s]',right,bottom+44,{align:'right',bold:true});
   if(this.mode==='heat'){g.setLineDash([5,4]);g.strokeStyle=C.gold;g.lineWidth=1.4;g.beginPath();this.history.forEach((p,i)=>{if(i===0)g.moveTo(X(p.t),Y(p.Tb));else g.lineTo(X(p.t),Y(p.Tb));});g.stroke();g.setLineDash([]);}
   g.strokeStyle=C.accent;g.lineWidth=2.5;g.beginPath();this.history.forEach((p,i)=>{if(i===0)g.moveTo(X(p.t),Y(p.T));else g.lineTo(X(p.t),Y(p.T));});g.stroke();
   this.events.forEach(e=>{const x=X(e.t);g.setLineDash([2,4]);line(x,top,x,bottom,C.violet);g.setLineDash([]);});
   return out;
  };
  return s;
 }
 window.PraxisBoilingExperiment={model,create,psatW,tsatW,latentHeat,constants:{R,M,CP,TORR}};
})();
