(()=>{
 'use strict';
 const M=PraxisChladniModel,$=id=>document.getElementById(id),tr=(s,v)=>PraxisI18n.tr(s,v),number=(v,d=1)=>v.toLocaleString(PraxisI18n.locale,{minimumFractionDigits:d,maximumFractionDigits:d});
 const basis=M.createField(),sand=M.createParticles(),canvas=$('cv');let point={x:0,y:0},lastPoint={x:.45,y:.25},f=1,frequencies=[],physical,field,playing=false,sweeping=false,last=null,dirty=true,section='laborator',tone=false,ac,osc,gain,volume=.12,elapsed=0;
 function parameters(){const [E,rho]=$('mat').value.split(',').map(Number);return {E:E*1e9,rho,a:+$('rad').value/100,h:+$('thk').value/1000};}
 function props(){physical=M.plate(parameters());frequencies=physical.frequencies;$('fr').max=String(Math.ceil(Math.max(4200,frequencies.at(-1)*1.05)));setF(f);chips();labels();}
 function setF(value){f=Math.max(1,Math.min(+$('fr').max,value));$('fr').value=String(f);dirty=true;audio();}
 function stopSweep(){sweeping=false;buttons();}
 function buttons(){for(const [id,on,a,b]of [['play',playing,'Ⅱ Pauză','▶ Pornește'],['sweep',sweeping,'Oprește creșterea','Creștere automată'],['snd',tone,'Sunet activ','Sunet'],['ctr',Math.hypot(point.x,point.y)<1e-8,'Excitație în centru','Excitație în centru']]){const el=$(id);el.textContent=tr(on?a:b);el.classList.toggle('on',on);el.setAttribute('aria-pressed',String(on));}}
 function resetFrequency(){
  stopSweep();playing=false;last=null;setF(Number($('fr').min));sand.scatter();compute();buttons();audio();draw();
 }
 function labels(){
  $('frO').textContent=number(f,2)+' Hz';$('fOut').textContent=number(f,2)+' Hz';$('spO').textContent=number(+$('sp').value,0)+' Hz/s';$('ampO').textContent=number(+$('amp').value*100,0)+'%';$('cntO').textContent=number(sand.count,0);$('radO').textContent=number(+$('rad').value)+' cm';$('thkO').textContent=number(+$('thk').value)+' mm';$('volO').textContent=number(volume*100,0)+'%';
  const p=parameters();$('dims').textContent=tr('Diametru: {d} cm; grosime: {h} mm; rigiditate D = {D} N·m; factor K = {K} Hz; ν = 0,33.',{d:number(p.a*200),h:number(p.h*1000),D:number(physical.D,3),K:number(physical.K,3)});
  $('driveOut').textContent=tr('Punct de excitație: x/a = {x}, y/a = {y}.',{x:number(point.x,2),y:number(point.y,2)});
  $('audioInfo').textContent=tr(f<20||f>18000?'Frecvența este în afara benzii audio a demonstrației; tonul este oprit.':'Tonul are frecvența generatorului. Volumul audio este separat de amplitudinea vibrației.');buttons();
 }
 function chips(){const c=$('chips'),select=$('modePick');c.replaceChildren();select.replaceChildren();select.add(new Option(tr('Alege o rezonanță'),'manual'));M.MODES.forEach((m,i)=>{const inactive=Math.hypot(basis.coupling(i,point).c,basis.coupling(i,point).s)<1e-7,b=document.createElement('button');b.type='button';b.textContent=number(frequencies[i],1)+' Hz · ('+m[0]+','+m[1]+')';b.title=tr('{n} diametre nodale, {s} cercuri nodale',{n:m[0],s:m[1]});b.disabled=inactive;b.dataset.i=String(i);b.onclick=()=>choose(i);c.append(b);const option=new Option(b.textContent,String(i));option.disabled=inactive;select.add(option);});}
 function choose(i){
  if(!Number.isInteger(i)||i<0||i>=frequencies.length)return;
  stopSweep();sand.scatter();playing=true;last=null;
  setF(frequencies[i]);compute();buttons();audio();draw();
  canvas.scrollIntoView({behavior:'smooth',block:'center'});
 }
 function compute(){field=basis.compute(f,frequencies,point);const {mode:i,near}=basis.nearest(f,frequencies,point);field.guideMode=i;
  $('modeOut').textContent=near?tr('Rezonanță apropiată: {n} diametre nodale, {s} cercuri nodale.',{n:M.MODES[i][0],s:M.MODES[i][1]}):tr('Între rezonanțe: vibrație redusă; figura anterioară poate persista.');
  document.querySelectorAll('#chips button').forEach(b=>b.classList.toggle('cur',near&&+b.dataset.i===i));$('modePick').value=near?String(i):'manual';labels();dirty=false;
  const drive=i>=0?basis.coupling(i,point):{c:0,s:0},selectedStrength=near?Math.hypot(drive.c,drive.s)*M.response(f,frequencies[i]).gain/M.Q:0;
  $('settlingInfo').textContent=near?tr(selectedStrength*+$('amp').value<.02?'Figura punctată arată nodurile modului ales. Excitația este slabă în acest punct; mută excitatorul sau mărește amplitudinea.':'Figura punctată arată nodurile modului ales. Nisipul se adună treptat în apropierea lor.'):tr('Alege o rezonanță pentru a vedea figura nodală.');
 }
 function draw(){if(section!=='laborator'||document.hidden)return;if(dirty)compute();const {g,w,h}=PraxisApplicationsCanvas.prepare(canvas),c=w/2,R=c*.93,colors=PraxisScientificColors.palette(PraxisCourseLocalization.colors);g.clearRect(0,0,w,h);
  const gradient=g.createRadialGradient(c*.8,c*.75,R*.1,c,c,R);gradient.addColorStop(0,'#4a5663');gradient.addColorStop(1,'#242d37');g.fillStyle='#46515d';g.beginPath();g.arc(c,c+4,R+3,0,2*Math.PI);g.fill();g.fillStyle=gradient;g.beginPath();g.arc(c,c,R,0,2*Math.PI);g.fill();
  const s=Math.max(1.7,Math.min(2.8,640/canvas.getBoundingClientRect().width*1.5));g.fillStyle=colors.yellow;for(let i=0;i<sand.count;i++)g.fillRect(c+sand.x[i]*R-s/2,c-sand.y[i]*R-s/2,s,s);
  const mode=field.guideMode,near=mode>=0&&Math.abs(frequencies[mode]-f)/frequencies[mode]<.03;
  if($('showNodes').checked&&near){
   g.save();g.strokeStyle='#dcecff';g.lineWidth=1.6;g.setLineDash([5,5]);
   for(const r of basis.basis[mode].nodes){g.beginPath();g.arc(c,c,r*R,0,2*Math.PI);g.stroke();}
   const n=M.MODES[mode][0],angle=Math.atan2(point.y,point.x);
   for(let k=0;k<n;k++){const theta=angle+(k+.5)*Math.PI/n,x=R*Math.cos(theta),y=-R*Math.sin(theta);g.beginPath();g.moveTo(c-x,c-y);g.lineTo(c+x,c+y);g.stroke();}
   g.restore();
  }
  const x=c+point.x*R,y=c-point.y*R;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(x,y,10,0,2*Math.PI);g.moveTo(x-16,y);g.lineTo(x+16,y);g.moveTo(x,y-16);g.lineTo(x,y+16);g.stroke();
 }
 function audio(){if(!ac)return;const audible=tone&&playing&&section==='laborator'&&!document.hidden&&PraxisSound.enabled&&f>=20&&f<=18000;gain.gain.setTargetAtTime(audible?volume*.12:0,ac.currentTime,.025);osc.frequency.setTargetAtTime(Math.min(18000,Math.max(20,f)),ac.currentTime,.015);}
 async function toggleSound(){if(tone){tone=false;audio();buttons();return;}const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){$('audioInfo').textContent=tr('Audio indisponibil.');return;}try{if(!ac){ac=new Audio();osc=ac.createOscillator();gain=ac.createGain();gain.gain.value=0;osc.connect(gain).connect(ac.destination);osc.start();}await ac.resume();tone=true;PraxisSound.setEnabled(true);audio();buttons();}catch{$('audioInfo').textContent=tr('Audio indisponibil.');}}
 function switchSection(value){section=value==='teorie'?'teorie':'laborator';document.querySelectorAll('[data-chladni-section]').forEach(e=>e.hidden=e.dataset.chladniSection!==section);document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===section;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});last=null;audio();draw();}
 function setPoint(x,y){const r=Math.hypot(x,y),scale=r>.94?.94/r:1;point={x:x*scale,y:y*scale};if(r>1e-8)lastPoint={...point};dirty=true;chips();labels();draw();}
 function frame(stamp){if(document.hidden||section!=='laborator'){last=null;requestAnimationFrame(frame);return;}const dt=last===null?0:Math.min(.05,(stamp-last)/1000);last=stamp;if(playing){if(sweeping){setF(f+Number($('sp').value)*dt);if(f>=+$('fr').max)stopSweep();}if(dirty)compute();sand.advance(dt,field.field,basis.G,field.strength,+$('amp').value);elapsed+=dt;draw();}requestAnimationFrame(frame);}
 $('fr').oninput=e=>{stopSweep();setF(+e.target.value);draw();};$('sp').oninput=labels;$('amp').oninput=()=>{dirty=true;draw();};$('cnt').oninput=()=>{sand.scatter(+$('cnt').value);labels();draw();};$('shake').onclick=()=>{sand.scatter();draw();};$('showNodes').onchange=draw;$('ctr').onclick=()=>{setPoint(...(Math.hypot(point.x,point.y)<1e-8?[lastPoint.x,lastPoint.y]:[0,0]));sand.scatter();draw();};
 for(const id of ['mat','rad','thk'])$(id).oninput=()=>{props();draw();};$('modePick').onchange=e=>{if(e.target.value!=='manual')choose(+e.target.value);};
 $('sweep').onclick=()=>{sweeping=!sweeping;if(sweeping){if(f>=+$('fr').max-1)setF(1);playing=true;}buttons();audio();};$('play').onclick=()=>{playing=!playing;last=null;buttons();audio();};$('resetFrequency').onclick=resetFrequency;$('snd').onclick=toggleSound;$('vol').oninput=e=>{volume=+e.target.value/100;labels();audio();};$('save').onclick=()=>{draw();const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='figuri-chladni.png';a.click();};
 let pointer=null;function locate(event){const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*640,y=(event.clientY-rect.top)/rect.height*640;return {x:(x-320)/(320*.93),y:(320-y)/(320*.93)};}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||pointer!==null)return;const p=locate(e);if(Math.hypot(p.x,p.y)>1)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);canvas.focus({preventScroll:true});setPoint(p.x,p.y);e.preventDefault();});canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const p=locate(e);setPoint(p.x,p.y);e.preventDefault();});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(pointer!==e.pointerId)return;pointer=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
 canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-.02,0],ArrowRight:[.02,0],ArrowUp:[0,.02],ArrowDown:[0,-.02]}[e.key];if(!d)return;setPoint(point.x+d[0],point.y+d[1]);e.preventDefault();});
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.tab;switchSection(b.dataset.tab);});window.addEventListener('hashchange',()=>switchSection(location.hash.slice(1)));window.addEventListener('resize',draw);new ResizeObserver(draw).observe(canvas.parentElement);window.addEventListener('praxis-course-presentation-change',draw);window.addEventListener('praxis-language-change',()=>{chips();labels();dirty=true;draw();});
 window.addEventListener('praxis-sound-change',()=>{if(!PraxisSound.enabled)tone=false;audio();buttons();});document.addEventListener('visibilitychange',()=>{last=null;audio();if(ac){if(document.hidden)ac.suspend();else if(tone)ac.resume().catch(()=>{});}});window.addEventListener('pagehide',()=>{if(ac)ac.suspend();});
 window.ChladniLab={get state(){return {f,playing,sweeping,point:{...point},elapsed,tone,particleCount:sand.count,section};},get frequencies(){return frequencies.slice();},get field(){return field;},sand,parameters,setF,choose,setPoint,resetFrequency,draw};
 props();compute();switchSection(location.hash.slice(1));requestAnimationFrame(frame);
})();
