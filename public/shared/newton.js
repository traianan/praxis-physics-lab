/* Bilingual lesson and SVG laboratories. All numerical models use SI. */
(()=>{
 'use strict';
 const M=window.PraxisNewtonModel,I=window.PraxisI18n,root=document.getElementById('newton-content');
 const state={active:'intro',playing:false,inertia:{angle:-Math.PI/2,released:false,t:0,circleT:0,trail:[],rate:1,repeat:false,repeatReleaseTime:null,autoReleaseTime:null},newton2:{F:30,m:10,t:0,rate:1,repeat:false},action:{m1:40,m2:80,t:0,rate:.2,repeat:false},forces:{f1:40,f2:30,angle:90},frames:{u:2,v:5,t:0,rate:1,repeat:false},friction:{m:5,angle:20,muS:.4,muK:.3,t:0,rate:1,repeat:false},hooke:{m:1,k:50,graph:true,t:0,moving:false,rate:1,repeat:false},impulse:{m:.2,dv:8,dt:.1},answers:[]};
 const ids=['inertia','newton2','action','forces','friction','hooke'];
 let data,ui,last=null,lastDraw=0;
 const fmt=(n,d=2)=>Number(n===0?0:n).toLocaleString(I.locale,{minimumFractionDigits:d,maximumFractionDigits:d});
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const typeset=s=>s.replace(/([A-Za-z])⃗/g,'<span class="newton-vector">$1</span>');
 const sub=s=>escape(s).replace(/₁/g,'<sub>1</sub>').replace(/₂/g,'<sub>2</sub>').replace(/ₛ/g,'<sub>s</sub>').replace(/ₖ/g,'<sub>k</sub>');
 function slider(group,key,label,min,max,step,unit=''){
  const value=state[group][key],id='nt-'+group+'-'+key;
  return `<label for="${id}"><span>${sub(label)}</span><output id="${id}-value" data-no-i18n>${fmt(value,step<1?2:0)} ${unit}</output><input type="range" id="${id}" aria-label="${escape(label)}" data-group="${group}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
 }
 const button=(action,text)=>`<button type="button" class="button secondary" data-action="${action}">${text}</button>`;
 function controls(id){
  let fields='';
  if(id==='inertia')fields=slider(id,'rate',ui.animationSpeed,.1,2,.1,'×')+`<label for="nt-inertia-repeat"><input type="checkbox" id="nt-inertia-repeat" ${state.inertia.repeat?'checked':''}>${ui.autoRepeat}</label>`;
  if(id==='newton2')fields=slider(id,'F',ui.force,0,100,1,'N')+slider(id,'m',ui.mass,1,50,1,'kg')+slider(id,'rate',ui.animationSpeed,.1,2,.1,'×')+`<label for="nt-newton2-repeat"><input type="checkbox" id="nt-newton2-repeat" ${state.newton2.repeat?'checked':''}>${ui.autoRepeat}</label>`;
  if(id==='action')fields=slider(id,'m1',ui.leftMass,20,120,1,'kg')+slider(id,'m2',ui.rightMass,20,120,1,'kg')+slider(id,'rate',ui.animationSpeed,.1,2,.1,'×')+`<label for="nt-action-repeat"><input type="checkbox" id="nt-action-repeat" ${state.action.repeat?'checked':''}>${ui.autoRepeat}</label>`;
  if(id==='forces')fields=slider(id,'f1','F₁',0,80,1,'N')+slider(id,'f2','F₂',0,80,1,'N')+slider(id,'angle',ui.angle,0,180,1,'°');
  if(id==='frames')fields=slider(id,'u',ui.frameSpeed,-2,2,.1,'m/s')+slider(id,'v',ui.particleSpeed,0,6,.1,'m/s')+slider(id,'t',ui.time,0,3,.01,'s')+slider(id,'rate',ui.animationSpeed,.1,2,.1,'×')+`<label for="nt-frames-repeat"><input type="checkbox" id="nt-frames-repeat" ${state.frames.repeat?'checked':''}>${ui.autoRepeat}</label><div class="newton-actions">${button('frames-play',state.playing&&state.active==='forces'?ui.pause:ui.play)}${button('frames-reset',ui.reset)}</div>`;
  if(id==='friction')fields=slider(id,'angle',ui.angle,0,50,1,'°')+slider(id,'muS',ui.muS,0,1,.01)+slider(id,'muK',ui.muK,0,state.friction.muS,.01)+slider(id,'m',ui.mass,1,20,1,'kg')+slider(id,'rate',ui.animationSpeed,.1,2,.1,'×')+`<label for="nt-friction-repeat"><input type="checkbox" id="nt-friction-repeat" ${state.friction.repeat?'checked':''}>${ui.autoRepeat}</label>`;
  if(id==='hooke')fields=slider(id,'k',ui.spring,10,200,1,'N/m')+slider(id,'m',ui.mass,.1,4,.1,'kg')+slider(id,'rate',ui.animationSpeed,.1,2,.1,'×')+`<label><input type="checkbox" id="nt-graph" ${state.hooke.graph?'checked':''}>${ui.graph}</label><label for="nt-hooke-repeat"><input type="checkbox" id="nt-hooke-repeat" ${state.hooke.repeat?'checked':''}>${ui.autoRepeat}</label>`;
  if(['inertia','newton2','action','friction','hooke'].includes(id))fields+=`<div class="newton-actions">${button('play',state.playing&&state.active===id?ui.pause:ui.play)}${button('reset',ui.reset)}${id==='inertia'?button('release',ui.release):''}</div>`;
  return fields+'<div class="newton-readout" data-readout="'+id+'" data-no-i18n></div>';
 }
 function lab(id){const box={inertia:'0 0 640 400',newton2:'0 60 640 205',action:'0 125 640 225',frames:'0 0 640 275'}[id]||'0 0 640 360';return `<h3 data-content-type="simulation">${ui[id+'Lab']}</h3><div class="newton-demo" data-lab="${id}"><figure class="newton-stage"><svg data-scene="${id}" viewBox="${box}" role="img" aria-label="${ui[id+'Lab']}"></svg><figcaption class="newton-caption">${ui[id+'Caption']}</figcaption></figure><div class="newton-controls">${controls(id)}</div></div>`;}
 function render(){
  data=I.getNamespace('newton');ui=data.ui;
  root.innerHTML=data.tabs.map(([id])=>{const s=data.sections[id];return `<section class="newton-section" id="nt-panel-${id}" data-panel="${id}" role="tabpanel" tabindex="0" aria-labelledby="nt-tab-${id}" ${id!==state.active?'hidden':''}><h2 data-content-type="${id==='problems'?'problem':id==='quiz'?'assessment':id==='intro'?'introduction':'theory'}">${s.title}</h2>${typeset(s.html)}${ids.includes(id)?lab(id):''}${typeset(s.after||'')}${id==='forces'?lab('frames'):''}${id==='newton2'?`<div class="newton-note"><h3>${ui.impulse}</h3><div class="newton-controls">${slider('impulse','m',ui.mass,.01,2,.01,'kg')}${slider('impulse','dv',ui.deltaV,0,50,.5,'m/s')}${slider('impulse','dt',ui.deltaT,.01,1,.01,'s')}<div class="newton-readout" id="nt-mean-force"></div></div></div>`:''}${id==='problems'?data.problems.map((p,i)=>`<article class="newton-problem"><h3>${i+1}. ${p[0]}</h3><p>${p[1]}</p><details><summary>${ui.steps}</summary><p>${p[2]}</p></details></article>`).join(''):''}${id==='quiz'?quiz():''}</section>`;}).join('');
  for(const b of document.querySelectorAll('[data-tab]')){const entry=data.tabs.find(t=>t[0]===b.dataset.tab);if(entry){b.textContent=entry[1];b.id='nt-tab-'+entry[0];b.setAttribute('aria-controls','nt-panel-'+entry[0]);}}
  window.PraxisMaterials.mount(root,ui);syncTabs();bind();syncPlay();draw();meanForce();
 }
 function quiz(){const answered=state.answers.filter(x=>x!==undefined).length,score=state.answers.filter((a,i)=>a===data.questions[i][2]).length;return `<div class="newton-readout" role="status">${ui.score}: <b>${score} / ${data.questions.length}</b> · ${ui.answered}: ${answered}</div>`+data.questions.map((q,i)=>`<article class="newton-question"><h3>${i+1}. ${q[0]}</h3>${q[1].map((opt,j)=>`<button type="button" data-question="${i}" data-option="${j}" ${state.answers[i]!==undefined?'disabled':''} ${state.answers[i]!==undefined&&(j===q[2]||j===state.answers[i])?`data-result="${j===q[2]?'correct':'wrong'}"`:''}>${sub(opt)}</button>`).join('')}${state.answers[i]!==undefined?`<p class="newton-feedback" role="status">${state.answers[i]===q[2]?ui.correct:ui.wrong}. ${q[3]}</p>`:''}</article>`).join('')+button('retry',ui.retry);}
 function meanForce(){const el=document.getElementById('nt-mean-force'),s=state.impulse;if(el)el.innerHTML=`${ui.meanForce}: <b>${fmt(M.meanForce(s.m,s.dv,s.dt))} N</b>`;}
 function syncTabs(){
  for(const panel of root.querySelectorAll('[data-panel]'))panel.hidden=panel.dataset.panel!==state.active;
  for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===state.active;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;b.classList.toggle('active',active);}
  const select=document.querySelector('.praxis-course-sections');if(select)select.value=state.active;
 }
 function show(id,hash=true){window.PraxisMaterials.stop();if(!data.tabs.some(t=>t[0]===id))id='intro';state.active=id;state.playing=false;syncTabs();syncPlay();draw();if(hash)history.replaceState(null,'','#'+id);}
 function syncPlay(){root.querySelectorAll('[data-action="play"],[data-action="frames-play"]').forEach(b=>{const active=state.playing&&(b.dataset.action!=='frames-play'||state.active==='forces');b.textContent=active?ui.pause:ui.play;b.setAttribute('aria-pressed',String(active));});const release=root.querySelector('[data-action="release"]');if(release)release.disabled=state.inertia.released;}
 function reset(){const id=state.active;state.playing=false;if(id==='inertia')Object.assign(state.inertia,{angle:-Math.PI/2,released:false,t:0,circleT:0,trail:[],autoReleaseTime:null,repeatReleaseTime:null});else if(state[id])state[id].t=0;if(id==='newton2')Object.assign(state.newton2,{x:0,v:0,end:false});if(id==='hooke')state.hooke.moving=false;syncPlay();draw();}
 function releaseInertia(s,remember=true){
  const a=s.angle,x=280+112*Math.cos(a),y=200+112*Math.sin(a),vx=-Math.sin(a)*168,vy=Math.cos(a)*168;
  const times=[vx>0?(600-x)/vx:vx<0?(40-x)/vx:Infinity,vy>0?(352-y)/vy:vy<0?(48-y)/vy:Infinity];
  Object.assign(s,{released:true,t:0,releaseAngle:a,endT:Math.min(1.5,...times.map(t=>t-68/168)),autoReleaseTime:null});
  if(remember){const phase=((a+Math.PI/2)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);s.repeatReleaseTime=(phase<1e-6?2*Math.PI:phase)/1.5;}
  syncPlay();
 }
 function restartInertia(s){Object.assign(s,{angle:-Math.PI/2,circleT:0,t:0,released:false,trail:[],autoReleaseTime:s.repeatReleaseTime});}
 function stepInertia(dt){
  const s=state.inertia;dt*=s.rate;
  while(dt>1e-12){
   if(s.released){const travel=Math.min(dt,Math.max(0,s.endT-s.t));s.t+=travel;dt-=travel;
    if(s.t>=s.endT-1e-10){s.t=s.endT;if(s.repeat){restartInertia(s);syncPlay();}else{state.playing=false;syncPlay();break;}}
   }else{const until=s.autoReleaseTime===null?Infinity:Math.max(0,s.autoReleaseTime-s.circleT),travel=Math.min(dt,until);s.circleT+=travel;s.angle=-Math.PI/2+1.5*s.circleT;dt-=travel;if(s.autoReleaseTime!==null&&s.circleT>=s.autoReleaseTime-1e-10)releaseInertia(s,false);}
  }
  const a=s.released?s.releaseAngle:s.angle;let x=280+112*Math.cos(a),y=200+112*Math.sin(a);if(s.released){x-=Math.sin(a)*168*s.t;y+=Math.cos(a)*168*s.t;}s.trail.push([x,y]);if(s.trail.length>180)s.trail.shift();
 }
 function bind(){
  root.querySelectorAll('input[type=range][data-group]').forEach(el=>el.addEventListener('input',()=>{
   const s=state[el.dataset.group],key=el.dataset.key;s[key]=Number(el.value);
   if(el.dataset.group==='frames'&&key!=='rate'){state.playing=false;syncPlay();}
   if(el.dataset.group==='friction'&&key!=='rate'){s.muK=Math.min(s.muK,s.muS);const kinetic=document.getElementById('nt-friction-muK');kinetic.max=s.muS;kinetic.value=s.muK;document.getElementById(kinetic.id+'-value').textContent=fmt(s.muK);s.t=0;state.playing=false;syncPlay();}
   if(el.dataset.group==='action'&&key!=='rate'){s.t=0;state.playing=false;syncPlay();}
   if(el.dataset.group==='hooke'&&key!=='rate'){s.t=0;s.moving=false;state.playing=false;syncPlay();}
   if(el.dataset.group==='newton2'){/* Changing F changes a without an artificial change in v. */}
   document.getElementById(el.id+'-value').textContent=fmt(s[key],Number(el.step)<1?2:0)+' '+(el.dataset.group==='hooke'&&key==='k'?'N/m':key==='F'||key==='f1'||key==='f2'?'N':['m','m1','m2'].includes(key)?'kg':key==='angle'?'°':key==='dv'?'m/s':key==='dt'||(el.dataset.group==='frames'&&key==='t')?'s':key==='rate'?'×':el.dataset.group==='frames'?'m/s':'');
   meanForce();draw();
  }));
  root.querySelector('#nt-graph')?.addEventListener('change',e=>{state.hooke.graph=e.target.checked;draw();});
  root.querySelector('#nt-frames-repeat')?.addEventListener('change',e=>{state.frames.repeat=e.target.checked;});
  root.querySelector('#nt-newton2-repeat')?.addEventListener('change',e=>{state.newton2.repeat=e.target.checked;});
  root.querySelector('#nt-action-repeat')?.addEventListener('change',e=>{state.action.repeat=e.target.checked;});
  root.querySelector('#nt-friction-repeat')?.addEventListener('change',e=>{state.friction.repeat=e.target.checked;});
  root.querySelector('#nt-inertia-repeat')?.addEventListener('change',e=>{state.inertia.repeat=e.target.checked;});
  root.querySelector('#nt-hooke-repeat')?.addEventListener('change',e=>{state.hooke.repeat=e.target.checked;});
  root.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
   const a=b.dataset.action;
   if(a==='play'&&state.active==='hooke'){const s=state.hooke;if(!s.moving||s.t>=M.spring(s.m,s.k).period)s.t=0;s.moving=true;}
   if(a==='play'&&state.active==='inertia'&&state.inertia.released&&state.inertia.t>=state.inertia.endT&&state.inertia.repeat)restartInertia(state.inertia);
   if(a==='frames-play'){if(state.frames.t>=3)state.frames.t=0;state.playing=!state.playing;}
   if(a==='frames-reset'){state.playing=false;state.frames.t=0;}
   if(a==='play'){if((state.active==='inertia'&&state.inertia.released&&state.inertia.t>=state.inertia.endT)||(state.active==='newton2'&&state.newton2.end)||(state.active==='action'&&state.action.t>=3.5)||(state.active==='friction'&&state.friction.t>=Math.sqrt(17/M.incline(state.friction.m,state.friction.angle,state.friction.muS,state.friction.muK).acceleration)))reset();state.playing=!state.playing;}
   if(a==='reset')reset();
   if(a==='release'&&!state.inertia.released)releaseInertia(state.inertia);
   if(a==='retry'){state.answers=[];render();}
   syncPlay();draw();
  }));
  root.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>{const q=Number(b.dataset.question);state.answers[q]=Number(b.dataset.option);const position=window.scrollY;render();const selected=root.querySelector(`[data-question="${q}"][data-option="${state.answers[q]}"]`);selected?.closest('article').setAttribute('tabindex','-1');selected?.closest('article').focus({preventScroll:true});window.scrollTo(0,position);window.PraxisSound?.play('select');}));
 }
 // Every scene shares the same semantic palette; surfaces stay light in both modes.
 const palette=()=>window.PraxisScientificColors.palette(window.PraxisCourseLocalization?.colors||'praxis');
 function text(s,x,y,anchor='start'){
  let content=escape(s);
  const vector=/^[FGNavRpuf](?:[₀-₉ₛₖₑ]+(?:→[₀-₉]+)?|′)?$/u;
  if(vector.test(s))content=`<tspan data-vector-symbol>${escape(s[0])}</tspan>${escape(s.slice(1))}`;
  else if(s.includes('F₂→₁'))content=content.replace(/F([₁₂]→[₁₂])/g,'<tspan data-vector-symbol>F</tspan>$1');
  else if(s==='Σ p = 0')content='Σ <tspan data-vector-symbol>p</tspan> = 0';
  return `<text x="${x}" y="${y}" text-anchor="${anchor}">${content}</text>`;
 }
 function markVectors(svg){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.classList.add('newton-vector-marks');group.setAttribute('aria-hidden','true');
  for(const symbol of svg.querySelectorAll('[data-vector-symbol]')){const b=symbol.getBBox(),x=b.x,y=b.y-3,w=Math.max(8,b.width),path=document.createElementNS('http://www.w3.org/2000/svg','path');path.dataset.vectorMark='';path.setAttribute('d',`M${x} ${y}h${w}m-3 -2.5l3 2.5-3 2.5`);group.append(path);}
  svg.append(group);
 }
 const line=(x1,y1,x2,y2,color='#bccfc8',dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="6 5"':''}/>`;
 function arrow(x,y,dx,dy,color,label='',style={}){
  const length=Math.hypot(dx,dy);if(length<.01)return '';
  const velocity=/^v[₀-₉′]*$/u.test(label),a=Math.atan2(dy,dx),h=Math.min(style.head??(velocity?10:9),length*(velocity ? .65 : .4)),ex=x+dx,ey=y+dy;
  const verticalVelocity=(velocity||style.sideLabel)&&Math.abs(dy)>2*Math.abs(dx);
  const tx=Math.max(label==='v'?20:40,Math.min(label==='v'?620:594,ex+(verticalVelocity?14:Math.cos(a)*18))),ty=Math.max(42,Math.min(340,ey+(verticalVelocity?6:Math.sin(a)*18)));
  const drawing=`<path d="M${x} ${y}L${ex} ${ey}" fill="none" stroke="${color}" stroke-width="${style.width??(velocity?1.5:3)}"/><path d="M${ex} ${ey}L${ex-h*Math.cos(a-.45)} ${ey-h*Math.sin(a-.45)}L${ex-h*Math.cos(a+.45)} ${ey-h*Math.sin(a+.45)}Z" fill="${color}"/>`+(label?text(label,tx,ty,verticalVelocity?'start':dx<0?'end':'start'):'');
  return velocity?`<g data-velocity-vector>${drawing}</g>`:drawing;
 }
 const rect=(x,y,w,h,color)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${color}" stroke="#809e96" stroke-width="1.5"/>`;
 const base=(height=360)=>`<defs><pattern id="nt-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#dde8e2" stroke-width=".8"/></pattern></defs><rect width="640" height="${height}" fill="#f1f6f4" rx="8"/><rect x="12" y="12" width="616" height="${height-24}" fill="url(#nt-grid)"/>`;
 function inertia(C){const s=state.inertia,cx=280,cy=200,r=112,a=s.released?s.releaseAngle:s.angle;let x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);if(s.released){x+=-Math.sin(a)*r*1.5*s.t;y+=Math.cos(a)*r*1.5*s.t;}const path=s.trail.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e9f1ee" stroke="${C.teal}" stroke-width="${s.released?2:8}" ${s.released?'stroke-dasharray="6 6"':''}/><path d="${path}" stroke="${C.orange}" stroke-width="3" fill="none"/>`+line(cx,cy,x,y,'#baccc5',true)+`<g data-inertia-vector="velocity">${arrow(x,y,-Math.sin(a)*68,Math.cos(a)*68,C.blue,'v',{width:2,head:12})}</g>`+(!s.released?`<g data-inertia-vector="force">${arrow(x,y,(cx-x)*.7,(cy-y)*.7,C.red,'F',{width:3.6,head:12,sideLabel:true})}</g>`:'')+`<circle cx="${x}" cy="${y}" r="11" fill="${C.blue}" stroke="white" stroke-width="3"/>`;}
 function newton2(C){const s=state.newton2,x=70+Math.min(380,(s.x||0)*380/(440/12)),y=104,cx=x+39,cy=y+40,contact=y+80,verticalLength=94,nx=cx-12;
  return line(35,contact,615,contact)+`<g data-newton-body>${rect(x,y,78,80,'#cce3eb')}</g>`+text(fmt(s.m,0)+' kg',x-4,cy+6,'end')+`<g data-newton-force="normal">${arrow(nx,contact,0,-verticalLength,C.purple)}<circle cx="${nx}" cy="${contact}" r="3" fill="${C.purple}"/>${text('N',nx-10,contact-verticalLength+5,'end')}</g><g data-newton-force="weight">${arrow(cx,cy,0,verticalLength,C.red)}<circle cx="${cx}" cy="${cy}" r="3" fill="${C.red}"/>${text('G',cx-14,cy+verticalLength+5,'end')}</g>`+arrow(x+52,y+10,Math.min(85,s.F*1.1),0,C.red,'F')+arrow(x+52,y+42,Math.min(85,M.acceleration(s.F,s.m)*10),0,C.green,'a')+arrow(x+52,y+74,Math.min(85,(s.v||0)*7),0,C.blue,'v')+(s.end?text(ui.end,320,100,'middle'):'');
 }
 function action(C){const s=state.action,t=s.t,J=80*Math.min(t,.5),r=M.recoil(s.m1,s.m2,J);const distance=m=>t<=.5?.5*(80/m)*t*t: .5*(80/m)*.25+(40/m)*(t-.5);const x1=275-distance(s.m1)*8,x2=340+distance(s.m2)*8,contact=t<.5,peak=Math.max(Math.abs(r.v1),Math.abs(r.v2)),velocityScale=peak>0?144/peak:0;
  return line(35,285,600,285)+rect(x1-60,225,60,60,'#f4d8cb')+rect(x2,225,60,60,'#cce3eb')+text(fmt(s.m1,0)+' kg',x1-30,278,'middle')+text(fmt(s.m2,0)+' kg',x2+30,278,'middle')+(contact?arrow(x1-30,245,-70,0,C.red,'F₂→₁')+arrow(x2+30,245,70,0,C.blue,'F₁→₂')+line(x1,245,x2,245,C.orange):arrow(x1-30,245,r.v1*velocityScale,0,C.red,'v₁')+arrow(x2+30,245,r.v2*velocityScale,0,C.blue,'v₂'))+text(contact?ui.contact:ui.free,320,160,'middle')+text(contact?'|F₂→₁| = |F₁→₂| = 80 N':'F₂→₁ = F₁→₂ = 0',320,200,'middle')+text('Σ p = 0',320,325,'middle');
 }
 function frames(C){const s=state.frames,O=150,Op=O+s.u*s.t*20,P=O+s.v*s.t*20,vp=s.v-s.u;return text('S',35,30)+text('S′',35,270)+arrow(O,100,435,0,C.teal,'x')+arrow(O,100,0,-60,C.teal,'y')+arrow(Op,225,570-Op,0,C.purple,'x′')+arrow(Op,225,0,-60,C.purple,'y′')+line(O,100,O,250,'#9eb4ad',true)+line(P,90,P,240,'#9eb4ad',true)+text('O',O-20,122)+text('O′',Op-22,247)+rect(P-10,80,20,20,'#cce3eb')+rect(P-10,205,20,20,'#cce3eb')+text('P',P-18,95,'end')+text('P',P-18,220,'end')+arrow(P,60,s.v*8,0,C.blue,'v')+arrow(P,185,vp*8,0,C.blue,'v′')+arrow(Op,165,s.u*12,0,C.orange,'u')+text('x = '+fmt(s.v*s.t)+' m',410,125)+text('x′ = '+fmt(vp*s.t)+' m',410,252);}
 function forces(C){const s=state.forces,a=s.angle*Math.PI/180,minY=Math.min(0,-s.f1,-Math.cos(a)*s.f2,-s.f1-Math.cos(a)*s.f2),maxY=Math.max(0,-s.f1,-Math.cos(a)*s.f2,-s.f1-Math.cos(a)*s.f2),scale=Math.min(2.2,210/Math.max(1,maxY-minY)),x=145,y=65-minY*scale,v1=[0,-s.f1*scale],v2=[Math.sin(a)*s.f2*scale,-Math.cos(a)*s.f2*scale],rx=v1[0]+v2[0],ry=v1[1]+v2[1];return line(x+v1[0],y+v1[1],x+rx,y+ry,'#9eb4ad',true)+line(x+v2[0],y+v2[1],x+rx,y+ry,'#9eb4ad',true)+arrow(x,y,...v1,C.blue)+text('F₁',x-28,y+v1[1]-8)+arrow(x,y,...v2,C.orange,'F₂')+arrow(x,y,rx,ry,C.green)+text('R',x+rx+25,y+ry-18)+text('α = '+fmt(s.angle,0)+'°',440,315)+text('R = '+fmt(M.resultant(s.f1,s.f2,s.angle))+' N',400,340);}
 function friction(C){const s=state.friction,rad=s.angle*Math.PI/180,q=M.incline(s.m,s.angle,s.muS,s.muK),L=360,top={x:115,y:290-L*Math.sin(rad)},bottom={x:115+L*Math.cos(rad),y:290},dist=60+Math.min(255,.5*q.acceleration*s.t*s.t*30),x=top.x+dist*Math.cos(rad),y=top.y+dist*Math.sin(rad),cx=x+Math.sin(rad)*20,cy=y-Math.cos(rad)*20,k=65/(s.m*M.g);
  return `<path d="M${top.x} ${top.y}L${bottom.x} ${bottom.y}H${top.x}Z" fill="#e2ece7" stroke="#92b2a4" stroke-width="2"/><g transform="translate(${x} ${y}) rotate(${s.angle})">${rect(-20,-40,40,40,'#cce3eb')}</g>`+arrow(cx,cy,0,s.m*M.g*k,C.red,'G')+arrow(cx,cy,q.N*k*Math.sin(rad),-q.N*k*Math.cos(rad),C.blue,'N')+arrow(cx,cy,-q.friction*k*Math.cos(rad),-q.friction*k*Math.sin(rad),C.orange,q.sliding?'fₖ':'fₛ')+text('α = '+fmt(s.angle,0)+'°',485,320,'middle');
 }
 function hooke(C){
  const s=state.hooke,q=M.spring(s.m,s.k,s.t,s.moving),eqPixels=45+30*Math.sqrt(q.equilibrium/(q.equilibrium+.2)),scale=eqPixels/q.equilibrium,ext=q.x*scale,top=55,natural=90,len=natural+ext,x=150,my=top+len,forceScale=54/q.weight,elasticLength=q.elastic*forceScale;
  let path=`M${x} ${top}`;for(let i=1;i<=24;i++)path+=`L${x+(i===24?0:i%2?16:-16)} ${top+len*i/24}`;
  let result=line(100,top,200,top)+`<path data-hooke-spring d="${path}" stroke="${C.teal}" stroke-width="3" fill="none"/><g data-hooke-body>${rect(x-27,my,54,40,'#cce3eb')}</g>`+text(fmt(s.m,1)+' kg',x-42,my+26,'end')+line(x-70,top+natural,x+14,top+natural,'#9eb4ad',true)+text('l₀',60,top+natural)+arrow(225,top+natural,0,ext,C.orange,'Δl')+text('Δl = '+fmt(q.x,3)+' m',40,30)+`<g data-hooke-force="elastic"><line x1="${x}" y1="${my}" x2="${x}" y2="${my-elasticLength}" stroke="#f1f6f4" stroke-width="9"/>${arrow(x,my,0,-elasticLength,C.green)}<circle cx="${x}" cy="${my}" r="3" fill="${C.green}"/>${text('Fₑ',x+26,my-elasticLength+5)}</g><g data-hooke-force="weight">${arrow(x,my+20,0,54,C.red)}<circle cx="${x}" cy="${my+20}" r="3" fill="${C.red}"/>${text('G',x+26,my+79)}</g>`;
  if(s.graph){const gx=350,gy=72,gw=220,gh=190,maxX=Math.max(.01,q.equilibrium*1.5),xx=gx+gw*q.x/maxX,yy=gy+gh*q.x/maxX;result+=arrow(gx,gy,gw+22,0,'#89a99d','x')+arrow(gx,gy,0,gh+25,'#89a99d','Fₑ,ₓ')+line(gx,gy,gx+gw,gy+gh,C.purple)+`<circle data-hooke-point cx="${xx}" cy="${yy}" r="6" fill="${C.red}"/>`+text('0',gx-15,gy-10)+text(fmt(maxX,maxX<.02?3:2)+' m',gx+gw,gy-15,'end')+text('−'+fmt(s.k*maxX)+' N',gx+8,gy+gh)+text('Fₑ,ₓ = −kx',455,320,'middle');}
  return result;
 }
 function readout(id){const s=state[id];if(id==='inertia')return s.released?ui.tangent:ui.inertiaLab;if(id==='newton2')return `${ui.acceleration}: <b>${fmt(s.F/s.m)} m/s²</b><br>${ui.speed}: ${fmt(s.v||0)} m/s<br>${ui.time}: ${fmt(s.t)} s<br>G = ${fmt(s.m*M.g)} N<br>N = ${fmt(s.m*M.g)} N`;if(id==='action'){const r=M.recoil(s.m1,s.m2,80*Math.min(s.t,.5));return `F = ${s.t<.5?'80':'0'} N<br>v<sub>1</sub> = ${fmt(r.v1)} m/s<br>v<sub>2</sub> = ${fmt(r.v2)} m/s<br>${ui.time}: ${fmt(s.t)} s`;}if(id==='forces')return `R = <b>${fmt(M.resultant(s.f1,s.f2,s.angle))} N</b>`;if(id==='hooke'){const q=M.spring(s.m,s.k,s.t,s.moving);return `${ui.extension}: <b>${fmt(q.x,q.equilibrium<.02?4:3)} m</b><br>x<sub>eq</sub> = ${fmt(q.equilibrium,3)} m<br>G = ${fmt(q.weight)} N<br>|F<sub>e</sub>| = ${fmt(q.elastic)} N<br>a<sub>x</sub> = ${fmt(q.a)} m/s²<br>T = ${fmt(q.period,3)} s<br>${ui.time}: ${fmt(s.t)} s`;}const q=M.incline(s.m,s.angle,s.muS,s.muK);return `${q.sliding?ui.sliding:ui.equilibrium}<br>N = ${fmt(q.N)} N<br>mg sin α = ${fmt(q.parallel)} N<br>${ui.limit}: ${fmt(q.limit)} N<br>${ui.friction}: ${fmt(q.friction)} N<br>a = ${fmt(q.acceleration)} m/s²<br>φ = ${fmt(q.phi)}°<br>${ui.time}: ${fmt(s.t)} s`;}
 const scenes={inertia,newton2,action,forces,friction,hooke,frames};
 function draw(){const id=state.active;if(!scenes[id])return;const svg=root.querySelector(`[data-scene="${id}"]`);if(svg){if(id==='friction'){const top=Math.max(0,155-360*Math.sin(state.friction.angle*Math.PI/180));svg.setAttribute('viewBox','0 '+top+' 640 '+(355-top));}svg.innerHTML=base(id==='inertia'?400:360)+scenes[id](palette());markVectors(svg);}const result=root.querySelector(`[data-readout="${id}"]`);if(result)result.innerHTML=readout(id).split('<br>').map(s=>'<span>'+s+'</span>').join('');if(id==='forces'){const frameSvg=root.querySelector('[data-scene=frames]');frameSvg.innerHTML=base()+frames(palette());markVectors(frameSvg);const f=state.frames,time=root.querySelector('#nt-frames-t');time.value=f.t;root.querySelector('#nt-frames-t-value').textContent=fmt(f.t)+' s';root.querySelector('[data-readout=frames]').innerHTML='<span>t = '+fmt(f.t)+' s</span>'+'<span>v = '+fmt(f.v)+' m/s</span><span>v′ = '+fmt(f.v-f.u)+' m/s</span><span>a = a′ = 0 m/s²</span>';}}
 function step(dt){const id=state.active,s=state[id];if(!s)return;if(id==='forces'){const f=state.frames,next=f.t+dt*f.rate;f.t=f.repeat?next%3:Math.min(3,next);if(!f.repeat&&f.t>=3){state.playing=false;syncPlay();}}if(id==='inertia')stepInertia(dt);
  if(id==='newton2'){Object.assign(s,M.cartStep(s,dt*s.rate,s.repeat));if(s.end){state.playing=false;syncPlay();}}
  if(id==='hooke'){const end=M.spring(s.m,s.k).period,next=s.t+dt*s.rate;s.t=s.repeat?next%end:Math.min(end,next);if(!s.repeat&&s.t>=end){state.playing=false;syncPlay();}}
  if(id==='action'){const next=s.t+dt*s.rate;s.t=s.repeat?next%3.5:Math.min(3.5,next);if(!s.repeat&&s.t>=3.5){state.playing=false;syncPlay();}}
  if(id==='friction'){const q=M.incline(s.m,s.angle,s.muS,s.muK);if(q.sliding){const end=Math.sqrt(17/q.acceleration),next=s.t+dt*s.rate;s.t=s.repeat?next%end:Math.min(end,next);if(!s.repeat&&s.t>=end){state.playing=false;syncPlay();}}else{state.playing=false;syncPlay();}}
 }
 function loop(now){const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;if(!document.hidden&&state.playing){step(dt);if(now-lastDraw>=30||!state.playing){draw();lastDraw=now;}}requestAnimationFrame(loop);}
 window.addEventListener('praxis-language-change',()=>{render();document.title=data.title+' — Praxis';});
 window.addEventListener('praxis-course-presentation-change',draw);
 window.addEventListener('resize',draw);
 window.addEventListener('hashchange',()=>show(location.hash.slice(1),false));
 document.addEventListener('visibilitychange',()=>{last=null;lastDraw=performance.now();});
 render();show(location.hash.slice(1),false);
 for(const b of document.querySelectorAll('[data-tab]')){
  b.addEventListener('click',()=>show(b.dataset.tab));b.addEventListener('keydown',e=>{const tabs=[...b.parentElement.querySelectorAll('[data-tab]')],i=tabs.indexOf(b),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i-1+tabs.length)%tabs.length:-1;if(next<0)return;e.preventDefault();tabs[next].click();tabs[next].focus();});
 }
 // Explicit state exposed for reproducible validation; UI remains the only controller.
 window.PraxisNewton={state,draw,show};
 document.title=data.title+' — Praxis';requestAnimationFrame(loop);
})();
