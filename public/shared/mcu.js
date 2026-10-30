(()=>{
 'use strict';const tr=s=>PraxisI18n.tr(s),model=window.PraxisMCUModel;let vectorScale=.75;
 function setVectorScale(value){const parsed=Number(value);if(!Number.isFinite(parsed))return;vectorScale=Math.max(.25,Math.min(1.5,parsed));window.dispatchEvent(new Event('praxis-mcu-vector-scale-change'));}
 const groups={concepte:['definitie','marimi'],dinamica:['acceleratie','forta','sri-srni'],curbe:['suprainaltare'],laborator:['sim-mcu'],viraj:['sim-curba'],probleme:['probleme'],test:['quiz']};
 function initTabs(){
  if(!document.querySelector('[data-mcu-section]'))return false;
  function show(id,hash=true){if(!groups[id])id='concepte';document.body.dataset.mcuActive=id;for(const section of document.querySelectorAll('[data-mcu-section]'))section.hidden=!groups[id].includes(section.id);for(const b of document.querySelectorAll('.praxis-lab-nav [data-tab],#praxis-original>.tabs [data-tab]')){const active=b.dataset.tab===id;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}const select=document.querySelector('.praxis-course-sections');if(select)select.value=id;if(hash&&location.hash!=='#'+id)history.replaceState(null,'','#'+id);window.dispatchEvent(new Event('praxis-mcu-tab-change'));}
  const buttons=[...document.querySelectorAll('[data-tab]')];
  for(const [i,b]of buttons.entries()){b.id='mcu-tab-'+b.dataset.tab;b.setAttribute('aria-controls',groups[b.dataset.tab].join(' '));b.addEventListener('click',()=>show(b.dataset.tab));b.addEventListener('keydown',event=>{let index=event.key==='Home'?0:event.key==='End'?buttons.length-1:event.key==='ArrowRight'?(i+1)%buttons.length:event.key==='ArrowLeft'?(i-1+buttons.length)%buttons.length:-1;if(index<0)return;event.preventDefault();buttons[index].click();buttons[index].focus();});}
  for(const section of document.querySelectorAll('[data-mcu-section]')){section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby','mcu-tab-'+Object.keys(groups).find(key=>groups[key].includes(section.id)));}
  window.PraxisPanelLayout?.register('[data-mcu-status]',()=>['SIGUR — în intervalul [v_min, v_max]','DERAPAJ SPRE EXTERIOR — v > v_max','ALUNECARE SPRE INTERIOR — v < v_min'].map(s=>tr(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/v_(min|max)/g,'v<sub>$1</sub>')),{html:true});
  window.addEventListener('hashchange',()=>show(location.hash.slice(1),false));show(location.hash.slice(1),false);return true;
 }
 function setup(){if(!initTabs()){const observer=new MutationObserver(()=>{if(initTabs())observer.disconnect();});observer.observe(document.getElementById('root'),{childList:true,subtree:true});}}
 function attach({canvas,bankCanvas,R,omega,mass,playing,speed,velocity,acceleration,force,trail,phase,bankAngle,mu,bankRadius,bankSpeed}){
  let frame=null,last=null,drag=null,points=[],lastReadout=0,scene=null;
  const holder=canvas.parentElement,handle=document.createElement('span');if(getComputedStyle(holder).position==='static')holder.style.position='relative';handle.className='mcu-phase-handle';handle.setAttribute('aria-hidden','true');holder.append(handle);
  const palette=()=>PraxisScientificColors.palette(PraxisCourseLocalization.colors);
  function prepare(c,kind){
   if(!c?.isConnected||!c.parentElement.getBoundingClientRect().width)return null;
   const zoom=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
   const parentStyle=getComputedStyle(c.parentElement),available=Math.max(0,c.parentElement.clientWidth-parseFloat(parentStyle.paddingLeft)-parseFloat(parentStyle.paddingRight));c.style.width=Math.max(320*zoom,available)+'px';c.style.height=Math.max((kind==='circle'?340:620)*zoom,Math.min(520*zoom,available*(kind==='circle'?.76:.6)))+'px';
   const rect=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;
   const g=c.getContext('2d');g.setTransform(dpr*zoom,0,0,dpr*zoom,0,0);g.praxisWidth=rect.width/zoom;g.praxisHeight=rect.height/zoom;g.praxisLabelBoxes=[];return{g,w:rect.width/zoom,h:rect.height/zoom,zoom};
  }
  function label(g,text,x,y,color,align='left'){
   g.fillStyle=color;g.textAlign=align;g.font='16px '+getComputedStyle(document.documentElement).getPropertyValue('--praxis-font-ui');
   const width=g.measureText(tr(text)).width,clampX=v=>Math.max(8,Math.min(v,g.praxisWidth-width-8)),clampY=v=>Math.max(22,Math.min(v,g.praxisHeight-14));
   let chosen;for(const [dx,dy]of [[0,0],[14,-24],[14,24],[-width-12,0],[0,-28],[-width-12,26]]){const candidate={x:clampX(x+dx),y:clampY(y+dy)-17,w:width,h:23};if(!g.praxisLabelBoxes.some(b=>candidate.x<b.x+b.w+5&&candidate.x+candidate.w+5>b.x&&candidate.y<b.y+b.h+4&&candidate.y+candidate.h+4>b.y)){chosen=candidate;break;}}
   chosen??={x:clampX(x),y:clampY(y)-17,w:width,h:23};g.praxisLabelBoxes.push(chosen);x=chosen.x;y=chosen.y+17;
   // Use the same measured subscript renderer as the other laboratories.
   g.fillText(tr(text),x,y);
  }
  function arrow(g,x,y,dx,dy,color,text,offset=0,width=2.5){const length=Math.hypot(dx,dy);if(length<.01)return;const nx=-dy/length,ny=dx/length;x+=nx*offset;y+=ny*offset;g.strokeStyle=color;g.fillStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.lineTo(x+dx,y+dy);g.stroke();const a=Math.atan2(dy,dx),head=Math.min(9*Math.sqrt(width/2.5),length*.32);g.beginPath();g.moveTo(x+dx,y+dy);g.lineTo(x+dx-head*Math.cos(a-.45),y+dy-head*Math.sin(a-.45));g.lineTo(x+dx-head*Math.cos(a+.45),y+dy-head*Math.sin(a+.45));g.closePath();g.fill();if(text)label(g,text,x+dx+nx*14,y+dy+ny*14,color);}
  function circle(){
   const p=prepare(canvas,'circle');if(!p)return;const {g,w,h}=p,C=palette(),cx=w/2,cy=h/2,r=Math.min(w,h)*(.25+.12*(R-.5)/4.5),angle=phase.current,s=model.circular(R,omega,mass,angle),x=cx+r*Math.cos(angle),y=cy-r*Math.sin(angle);
   scene={cx,cy,r,x,y,zoom:p.zoom};g.clearRect(0,0,w,h);g.fillStyle='#f2f6f4';g.fillRect(0,0,w,h);g.strokeStyle='#dce6e1';g.lineWidth=1;for(let q=20;q<w;q+=40){g.beginPath();g.moveTo(q,16);g.lineTo(q,h-16);g.stroke();}for(let q=20;q<h;q+=40){g.beginPath();g.moveTo(16,q);g.lineTo(w-16,q);g.stroke();}
   handle.style.left=(canvas.offsetLeft+x*p.zoom)+'px';handle.style.top=(canvas.offsetTop+y*p.zoom)+'px';
   label(g,'v',20,28,C.blue);label(g,'a_cp',74,28,C.red);label(g,'F_cp',146,28,C.purple);
   g.strokeStyle=C.purple;g.setLineDash([5,5]);g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();g.setLineDash([]);
   if(trail){points.push({x,y});if(points.length>180)points.shift();g.strokeStyle=C.teal;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();}
   g.strokeStyle='#6c847c';g.beginPath();g.moveTo(cx,cy);g.lineTo(x,y);g.stroke();label(g,'O',cx-16,cy+18,'#28454b');label(g,'R',(cx+x)/2+8,(cy+y)/2+16,'#28454b');
   const cap=Math.min(150,w*.32,h*.34),minimum=Math.min(72,cap*.72),tangentCap=Math.min(cap,Math.sqrt(Math.max(1,(Math.min(w,h)/2-18)**2-r*r))),tangent=Math.min(tangentCap,Math.min(tangentCap,minimum+s.v*11)*vectorScale),radial=Math.min(cap,Math.min(cap,minimum+s.a*11)*vectorScale),f=Math.min(cap,Math.min(cap,minimum+s.F*11)*vectorScale);
   if(velocity)arrow(g,x,y,-Math.sin(angle)*tangent,-Math.cos(angle)*tangent,C.blue,'v');
   if(acceleration)arrow(g,x,y,-Math.cos(angle)*radial,Math.sin(angle)*radial,C.red,'a_cp',force?-12:0);
   if(force)arrow(g,x,y,-Math.cos(angle)*f,Math.sin(angle)*f,C.purple,'F_cp',acceleration?12:0);
   g.fillStyle=C.teal;g.beginPath();g.arc(x,y,8,0,Math.PI*2);g.fill();g.strokeStyle='#fffefa';g.lineWidth=2;g.stroke();
   if(performance.now()-lastReadout>90){lastReadout=performance.now();const value=document.querySelector('[data-mcu-phase]');if(value)value.textContent=new Intl.NumberFormat(PraxisI18n.locale,{maximumFractionDigits:1}).format((angle*180/Math.PI%360+360)%360)+'°';}
  }
  function bank(){
   const p=prepare(bankCanvas,'bank');if(!p)return;const {g,w,h}=p,C=palette(),s=model.bank(bankRadius,bankAngle,mu,bankSpeed),angle=bankAngle*Math.PI/180,c=Math.cos(angle),sin=Math.sin(angle),road=Math.min(360,w*.55);
   const largest=Math.max(model.g,s.N,Math.abs(s.friction),Math.hypot(s.realX,s.realY),s.q),up=Math.max(s.N*c,s.friction*sin,0),down=Math.max(model.g,-s.friction*sin,0),left=Math.max(s.N*sin,-s.friction*c,s.q,0),right=Math.max(s.friction*c,0),x=w*.55;
   const scale=Math.min(190*vectorScale/largest,(h-255)/(up+down),(x-20)/Math.max(left,.001),(w-x-20)/Math.max(right,.001),(w*.7-60)/Math.max(-s.realX,s.q,Math.abs(s.friction*c),.001)),y=45+(h-255-(up+down)*scale)/2+up*scale;
   g.clearRect(0,0,w,h);g.fillStyle='#f2f6f4';g.fillRect(0,0,w,h);label(g,'Forțe și necesar radial',14,24,'#28454b');
   g.strokeStyle='#ccdcd4';g.lineWidth=12;g.beginPath();g.moveTo(x-road*c/2,y+road*sin/2);g.lineTo(x+road*c/2,y-road*sin/2);g.stroke();
   // A point-mass free-body diagram leaves short arrows unobscured by a car body.
   // One scale for every occurrence of every force, including the radial reference.
   // Reserve enough space at the maximum user scale (150%); never enlarge a small force alone.
   arrow(g,x,y,0,model.g*scale,C.purple,'');arrow(g,x,y,-s.N*sin*scale,-s.N*c*scale,C.green,'');arrow(g,x,y,s.friction*c*scale,-s.friction*sin*scale,C.orange,'');
   g.fillStyle='#28454b';g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.fill();
   label(g,'N',x-s.N*sin*scale+12,y-s.N*c*scale,C.green);label(g,'G = mg',x+13,y+model.g*scale+6,C.purple);
   label(g,Math.abs(s.friction)<1e-9?'F_f = 0':'F_f',x+s.friction*c*scale-38,y-s.friction*sin*scale+24,C.orange);
   if(Math.hypot(s.realX,s.realY)>1e-9){arrow(g,x,y,s.realX*scale,-s.realY*scale,C.blue,'',0,6);label(g,'ΣF',x+s.realX*scale-26,y-s.realY*scale-44,C.blue);}else label(g,'ΣF = 0',x-110,y-44,C.blue);
   if(s.q>1e-9){g.setLineDash([7,3]);arrow(g,x,y,-s.q*scale,0,C.red,'');g.setLineDash([]);label(g,'F_cp',x-s.q*scale-20,y-18,C.red);}else label(g,'F_cp = 0',x-100,y-18,C.red);
   // Parallel rows keep coincident and very short vectors unobscured. These are
   // translated copies at exactly the same scale as the free-body diagram above.
   const py=h-150,pw=w-24,ox=w*.7;
   label(g,'← CENTRU CURBĂ',14,py-40,'#28454b');
   label(g,'Comparație — scară comună',12,py-10,'#526970');g.fillStyle='#fffefa';g.fillRect(12,py,pw,138);g.strokeStyle='#d5e0dc';g.lineWidth=1;g.strokeRect(12,py,pw,138);
   const rows=[['F_f',s.friction*c,-s.friction*sin,C.orange,false],['ΣF',s.realX,-s.realY,C.blue,false],['F_cp',-s.q,0,C.red,true]];
   rows.forEach(([name,dx,dy,color,dashed],i)=>{const oy=py+25+i*44,magnitude=Math.hypot(dx,dy);label(g,name+(magnitude<1e-9?' = 0':''),24,oy+5,color);if(dashed)g.setLineDash([7,3]);arrow(g,ox,oy,dx*scale,dy*scale,color,'');g.setLineDash([]);g.strokeStyle='#526970';g.lineWidth=1;g.beginPath();g.arc(ox,oy,2,0,Math.PI*2);g.stroke();});
  }
  function draw(){circle();bank();}
  function tick(now){frame=null;if(document.hidden||document.body.dataset.mcuActive!=='laborator'){last=null;return;}const dt=last===null?0:Math.max(0,(now-last)/1000);last=now;if(playing&&!drag)phase.current+=omega*dt*speed;circle();if(playing)frame=requestAnimationFrame(tick);}
  function activate(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;draw();if(!document.hidden&&document.body.dataset.mcuActive==='laborator')frame=requestAnimationFrame(tick);}
  function pointer(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)/scene.zoom,y:(e.clientY-rect.top)/scene.zoom};}
  function down(e){if(!scene||e.button!==0)return;const p=pointer(e);if(e.currentTarget!==handle&&Math.hypot(p.x-scene.x,p.y-scene.y)>30)return;drag=e.pointerId;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});e.preventDefault();}
  function move(e){if(drag!==e.pointerId||!scene)return;const p=pointer(e);phase.current=Math.atan2(scene.cy-p.y,p.x-scene.cx);points=[];lastReadout=0;circle();e.preventDefault();}
  function end(){drag=null;}
  function key(e){if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;phase.current=e.key==='Home'?0:phase.current+(e.key==='ArrowLeft'?-1:1)*Math.PI/36;points=[];lastReadout=0;circle();e.preventDefault();}
  handle.addEventListener('pointerdown',down);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,end);canvas.addEventListener('keydown',key);
  const observer=new ResizeObserver(activate);observer.observe(canvas.parentElement);observer.observe(bankCanvas.parentElement);for(const event of ['resize','praxis-mcu-tab-change','visibilitychange']) (event==='visibilitychange'?document:window).addEventListener(event,activate);activate();
  window.addEventListener('praxis-mcu-vector-scale-change',draw);
  return()=>{if(frame!==null)cancelAnimationFrame(frame);observer.disconnect();handle.remove();window.removeEventListener('praxis-mcu-vector-scale-change',draw);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('keydown',key);for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.removeEventListener(event,end);for(const event of ['resize','praxis-mcu-tab-change','visibilitychange'])(event==='visibilitychange'?document:window).removeEventListener(event,activate);};
 }
 window.PraxisMCU={attach,setVectorScale,get vectorScale(){return vectorScale;}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
