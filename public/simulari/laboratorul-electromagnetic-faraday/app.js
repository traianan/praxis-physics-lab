import {dipoleField,pickup,movePickup,rlStep,transformer} from '../../shared/faraday-model.js';
import {DEFAULTS as GENERATOR,stateAt,energyBetween} from '../../shared/generator-model.js';
import {renderScene,renderGraphs,quantity,number,palette} from './view.js';
import {pointerToModel,standInfo} from './scene3d.js';
import {activities,titles,predictions,limits,notes,questions,buildContent} from './content.js';
const $=s=>document.querySelector(s),tr=s=>window.PraxisI18n.tr(s),id='laboratorul-electromagnetic-faraday';
await window.PraxisI18n.init({baseUrl:'../../locales/',namespaceList:['common','courses/shared','chapters/electricitate-magnetism-circuite',`labs/${id}/ui`]});
const defaults={magnet:{m:1,x:.1,y:0},pickup:{m:1,a:.05,N:100,R:10,open:false,speed:.1},rl:{U:0,R:10,L:.1,N:200,A:.001},transformer:{N1:200,N2:100,phi:.001,omega:100,R:10,open:false},generator:{...GENERATOR}};
const parameters={magnet:[['m','Moment magnetic',-10,10,.1,'A·m²'],['x','Sonda x',-.3,.3,.01,'m'],['y','Sonda y',-.2,.2,.01,'m']],pickup:[['m','Moment magnetic',-10,10,.1,'A·m²'],['N','Număr de spire',1,500,1,''],['a','Raza bobinei',.02,.08,.005,'m'],['R','Rezistență totală',1,100,1,'Ω']],rl:[['R','Rezistență',10,100,1,'Ω'],['L','Inductanță',.01,.1,.01,'H']],transformer:[['N1','Spire primar',1,500,1,''],['N2','Spire secundar',1,500,1,''],['phi','Flux maxim',0,.002,.0001,'Wb'],['omega','Viteză unghiulară',0,100,1,'rad/s'],['R','Rezistența sarcinii',1,100,1,'Ω']],generator:[['N','Număr de spire',1,500,1,''],['B','Inducție magnetică',0,1,.01,'T'],['omega','Viteză unghiulară',-100,100,1,'rad/s'],['R','Rezistența sarcinii',0,100,1,'Ω']]};
const states={};let active='pickup',section='experiment',running=false,frame=null,previous=null,drag=null;
const metrics={model:[],scene:[],graphs:[],total:[],intervals:[]};let recording=false;
function fresh(key){const a={p:{...defaults[key]},t:0,x:.25,v:0,i:0,energy:0,heat:0,source:0,mode:'manual',target:null,rate:key==='rl'?.01:key==='pickup'||key==='magnet'?1:.1,history:[]};a.s=measure(key,a);a.history=[{...a.s,t:0}];return a;}
function measure(key,a){if(key==='magnet'){const b=dipoleField(a.p.m,a.p.x,a.p.y);return {bx:b?.bx||0,by:b?.by||0,magnitude:b?Math.hypot(b.bx,b.by):0,defined:!!b&&!!Math.hypot(b.bx,b.by)};}if(key==='pickup')return pickup(a.p,a.x,a.v);if(key==='rl')return rlStep(a.p,a.i,0);if(key==='transformer')return transformer(a.p,a.t);return stateAt(a.p,a.t);}
for(const key of activities)states[key]=fresh(key);
const current=()=>states[active];
function remember(a){a.history.push({...a.s,t:a.t});if(a.history.length>1600)a.history.splice(0,a.history.length-1600);}
function advance(dt){
 const a=current(),start=performance.now();
 // Resolve history in physical time, independently of the display frame rate.
 const step=active==='rl'?.0005:active==='pickup'?.005:Math.min(.01,2*Math.PI/(Math.max(1,Math.abs(a.p.omega||1))*80));
 const count=Math.max(1,Math.ceil(dt/step)),h=dt/count;
 for(let j=0;j<count;j++){
  if(active==='pickup'){
   const target=a.mode==='approach'?.1:a.mode==='away'?.5:a.target??a.x;
   const s=movePickup(a.p,a.x,target,h);a.x=s.x;a.v=s.v;a.energy+=s.energy;
  }else if(active==='rl'){const s=rlStep(a.p,a.i,h);a.i=s.current;a.heat+=s.heat;a.source+=s.source;}
  a.t+=h;a.s=measure(active,a);remember(a);
 }
 if(recording&&metrics.model.length<3600)metrics.model.push(performance.now()-start);
}
function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;}
function schedule(){if(frame===null&&running&&section==='experiment'&&!document.hidden)frame=requestAnimationFrame(tick);}
function tick(now){frame=null;if(!running||document.hidden||section!=='experiment')return;if(previous!==null){const elapsed=(now-previous)/1000;if(recording&&metrics.intervals.length<3600)metrics.intervals.push(elapsed*1000);advance(elapsed*current().rate);}previous=now;draw();schedule();}
function pause(){running=false;cancel();endDrag();draw();}
function reset(){cancel();running=false;endDrag();states[active]=fresh(active);controls();draw();}
function stopMotion(){const a=current();if(active==='pickup'){a.target=null;a.v=0;a.s=measure(active,a);remember(a);}}
function endDrag(){const old=drag;drag=null;if(old&&$('#scene').hasPointerCapture(old.id))$('#scene').releasePointerCapture(old.id);if(old)stopMotion();}
function controls(){
 const a=current();$('#activity').value=active;$('#playback').value=String(a.rate);
 $('#parameter-inputs').innerHTML=parameters[active].map(([key,label,min,max,step,unit])=>`<div class="faraday-param"><div class="param-heading"><label for="num-${key}">${tr(label)} <small>${unit}</small></label><input id="num-${key}" type="number" data-param="${key}" min="${min}" max="${max}" step="${step}" value="${a.p[key]}" aria-label="${tr(label)}"></div><div class="range-row praxis-range-stepper"><button data-adjust="${key}:-1" aria-label="${tr('Scade')} ${tr(label)}">−</button><input type="range" data-param="${key}" min="${min}" max="${max}" step="${step}" value="${a.p[key]}" aria-label="${tr(label)}"><button data-adjust="${key}:1" aria-label="${tr('Crește')} ${tr(label)}">+</button></div></div>`).join('');
 let html='';if(active==='pickup')html=`<button data-motion="approach">${tr('Apropie')}</button><button data-motion="away">${tr('Depărtează')}</button><button data-motion="manual">${tr('Oprește magnetul')}</button>`;
 if(active==='rl')html=[['10','Alimentează +10 V'],['-10','Inversează −10 V'],['0','Descarcă prin R']].map(([v,label])=>`<button data-source="${v}">${tr(label)}</button>`).join('');
 if(['pickup','generator','transformer'].includes(active))html+=`<label><input type="checkbox" id="open" ${a.p.open?'checked':''}>${tr('Circuit deschis')}</label>`;
 $('#actions').innerHTML=html;$('#prediction').textContent=tr(predictions[active]);$('#scene-note').textContent=tr(notes[active])+' '+tr('Acele sunt indicatoare schematice; citește valorile SI din carduri.');$('#limits').textContent=tr(limits[active]);
 $('#scene').setAttribute('aria-label',tr(titles[active])+'. '+tr(notes[active]));
 for(const [i,canvas]of [...document.querySelectorAll('.faraday-graphs canvas')].entries())canvas.setAttribute('aria-label',tr(active==='magnet'?['Componenta Bx','Componenta By','Modulul câmpului'][i]:['Flux magnetic în timp','Tensiune indusă în timp','Curent electric în timp'][i]));
}
function selectActivity(key){pause();active=key;controls();draw();}
function change(key,value){if(running)return;const row=parameters[active].find(r=>r[0]===key);if(!row||!Number.isFinite(value)||value<row[2]||value>row[3]||(['N','N1','N2'].includes(key)&&!Number.isInteger(value))){controls();return;}const a=current();a.p[key]=value;a.t=0;a.i=0;a.v=0;a.energy=a.source=a.heat=0;a.s=measure(active,a);a.history=[{...a.s,t:0}];for(const el of document.querySelectorAll(`[data-param="${key}"]`))el.value=value;draw();}
function readouts(){
 const a=current(),s=a.s,P=palette();let rows;
 if(active==='magnet')rows=[['Bₓ',s.bx,'T',P.teal],['Bᵧ',s.by,'T',P.purple],['|B|',s.magnitude,'T',P.blue],['t',a.t,'s',P.orange]];
 else rows=[['Φ',s.flux,'Wb',P.teal],[active==='transformer'?'u₂':'e',s.emf,'V',P.purple],[active==='transformer'?'i₂':'i',s.current,'A',P.green],['t',a.t,'s',P.orange]];
 $('#readouts').innerHTML=rows.map(([label,v,u,color])=>`<div style="--value-color:${color}"><small>${label}</small><strong>${quantity(v,u)}</strong></div>`).join('');
 let energy='';if(active==='pickup')energy=`P = ${quantity(s.power,'W')} | −Fv = ${quantity(s.mechanical,'W')} | W = Q = ${quantity(a.energy,'J')}`;
 if(active==='rl')energy=`B = ${quantity(s.B,'T')} | W_B = ${quantity(s.stored,'J')} | Q = ${quantity(a.heat,'J')} | W_${tr('sursă')} = ${quantity(a.source,'J')} | Δ = ${quantity(a.source-a.heat-s.stored,'J')}`;
 if(active==='transformer')energy=`u₁ = ${quantity(s.u1,'V')} | i₁ = ${quantity(s.i1,'A')} | P_in = ${quantity(s.inputPower,'W')} | P_out = ${quantity(s.power,'W')} | U₁ef = ${quantity(s.u1rms,'V')} | U₂ef = ${quantity(s.u2rms,'V')} | P_med = ${quantity(s.meanPower,'W')}`;
 if(active==='generator'){const e=energyBetween(a.p,0,a.t);energy=`−τω = ${quantity(s.pMechanical,'W')} | P_R = ${quantity(s.pLoad,'W')} | P_r = ${quantity(s.pCopper,'W')} | W = ${quantity(e.mechanical,'J')} | Q_R + Q_r = ${quantity(e.load+e.copper,'J')}`;}
 if(active==='magnet')energy=tr(s.defined?'Busola se aliniază cu vectorul B local.':'Direcție nedefinită: câmp nul sau regiune exclusă.');
 $('#energy').textContent=energy;
 const formula=active==='pickup'?`e = −N (dΦ/dx) v = ${quantity(s.emf,'V')} ; v = ${quantity(s.v,'m/s')} ; i = ${a.p.open?'0':quantity(s.emf,'V')+' / '+number(a.p.R)+' Ω'} = ${quantity(s.current,'A')}`:active==='rl'?`L di/dt + Ri = U : ${number(a.p.L)} × ${number(s.derivative)} + ${number(a.p.R)} × ${number(s.current)} = ${number(a.p.U)} V`:active==='transformer'?`u₂ N₁ = u₁ N₂ : ${number(s.u2)} × ${a.p.N1} = ${number(s.u1)} × ${a.p.N2}`:active==='generator'?`e = NBAω sin θ = ${a.p.N} × ${number(a.p.B)} × ${number(a.p.A)} × ${number(a.p.omega)} × sin(${number(s.theta)}) = ${quantity(s.emf,'V')}`:`|B| = √(Bₓ²+Bᵧ²) = ${quantity(s.magnitude,'T')}`;
 $('#live-formula').textContent=formula;
}
function draw(){
 const begin=performance.now(),a=current();renderScene($('#scene'),active,a.s,a.p,tr);const middle=performance.now();renderGraphs([...document.querySelectorAll('.faraday-graphs canvas')],a.history,active,tr);const after=performance.now();readouts();
 $('#play').textContent=tr(running?'Pauză':'Pornire');$('#status').textContent=tr(running?'Măsurare în desfășurare':'În pauză · instantaneu înghețat');$('#parameters').disabled=running;$('#step').disabled=running;const open=$('#open');if(open)open.disabled=running;
 if(recording&&metrics.total.length<3600){metrics.scene.push(middle-begin);metrics.graphs.push(after-middle);metrics.total.push(performance.now()-begin);}
}
$('#play').addEventListener('click',()=>{if(running)pause();else{running=true;previous=null;draw();schedule();}});
$('#reset').addEventListener('click',reset);$('#step').addEventListener('click',()=>{if(!running){advance(active==='rl'?.001:.005);draw();}});
$('#activity').innerHTML=activities.map(k=>`<option value="${k}">${tr(titles[k])}</option>`).join('');$('#activity').addEventListener('change',()=>selectActivity($('#activity').value));
$('#playback').addEventListener('change',()=>{current().rate=Number($('#playback').value);previous=null;});
$('#parameter-inputs').addEventListener('input',event=>{if(event.target.matches('input'))change(event.target.dataset.param,event.target.value===''?NaN:Number(event.target.value));});
$('#parameter-inputs').addEventListener('click',event=>{const el=event.target.closest('[data-adjust]');if(!el)return;const [key,d]=el.dataset.adjust.split(':'),row=parameters[active].find(r=>r[0]===key);change(key,Math.min(row[3],Math.max(row[2],Number((current().p[key]+Number(d)*row[4]).toPrecision(10)))));});
$('#actions').addEventListener('click',event=>{const a=current(),el=event.target.closest('button');if(!el)return;if(el.dataset.motion){a.mode=el.dataset.motion;stopMotion();}if(el.dataset.source!==undefined){a.p.U=Number(el.dataset.source);a.s=measure(active,a);remember(a);}draw();});
$('#actions').addEventListener('change',event=>{if(event.target.id==='open'&&!running){current().p.open=event.target.checked;current().v=0;current().target=null;current().mode='manual';current().t=0;current().energy=0;current().s=measure(active,current());current().history=[{...current().s,t:0}];draw();}});
function position(event){const b=$('#scene').getBoundingClientRect();return pointerToModel($('#scene'),event.clientX-b.left,event.clientY-b.top);}
function setPointer(event){
 const a=current(),point=position(event);if(!point)return;if(active==='magnet'){a.p.x=Math.max(-.3,Math.min(.3,point.x));a.p.y=Math.max(-.2,Math.min(.2,point.y));a.s=measure(active,a);if(!running){a.history=[{...a.s,t:a.t}];}for(const key of ['x','y'])for(const input of document.querySelectorAll(`[data-param="${key}"]`))input.value=a.p[key];}
 if(active==='pickup'){const target=Math.max(.1,Math.min(.5,point.distance));a.mode='manual';if(running)a.target=target;else{a.x=target;a.v=0;a.t=0;a.energy=0;a.s=measure(active,a);a.history=[{...a.s,t:0}];}}
 draw();
}
$('#scene').addEventListener('pointerdown',event=>{if(!['magnet','pickup'].includes(active)||event.button!==0||drag)return;drag={id:event.pointerId};$('#scene').setPointerCapture(event.pointerId);$('#scene').focus({preventScroll:true});setPointer(event);event.preventDefault();});
$('#scene').addEventListener('pointermove',event=>{if(drag?.id===event.pointerId)setPointer(event);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('#scene').addEventListener(name,event=>{if(drag?.id===event.pointerId){endDrag();draw();}});
$('#scene').addEventListener('keydown',event=>{const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:1,ArrowDown:-1}[event.key];if(!d||!['magnet','pickup'].includes(active))return;event.preventDefault();const a=current();if(active==='pickup'){const target=Math.max(.1,Math.min(.5,a.x-d*.01));a.mode='manual';if(running)a.target=target;else{a.x=target;a.v=0;a.t=0;a.energy=0;a.s=measure(active,a);a.history=[{...a.s,t:0}];}}else{const key=['ArrowUp','ArrowDown'].includes(event.key)?'y':'x';a.p[key]=Math.max(key==='x'?-.3:-.2,Math.min(key==='x'?.3:.2,a.p[key]+d*.01));a.s=measure(active,a);a.history=[{...a.s,t:a.t}];controls();}draw();});
function selectTab(key){pause();section=key;for(const tab of document.querySelectorAll('[data-tab]')){const selected=tab.dataset.tab===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;tab.classList.toggle('active',selected);$('#'+tab.dataset.tab).hidden=!selected;}if(key==='experiment')draw();}
for(const tab of document.querySelectorAll('[data-tab]')){tab.addEventListener('click',()=>selectTab(tab.dataset.tab));tab.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(tab),j=event.key==='ArrowRight'?(i+1)%tabs.length:event.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:-1;if(j>=0){event.preventDefault();tabs[j].click();tabs[j].focus();}});}
const answers={};function feedback(){questions.forEach((q,i)=>{const a=answers[i];if(a!==undefined){const input=$(`input[name="q${i}"][value="${a}"]`);input.checked=true;$('#feedback-'+i).textContent=tr(a===q[2]?'Corect.':'Mai încearcă.')+' '+tr(q[3]);}});}
$('#quiz').addEventListener('change',event=>{if(event.target.name?.startsWith('q')){answers[Number(event.target.name.slice(1))]=Number(event.target.value);feedback();}});
$('#problems').addEventListener('click',event=>{const el=event.target.closest('[data-reference]');if(el){selectTab('experiment');selectActivity(el.dataset.reference);reset();if(active==='magnet')current().p.x=.1;if(active==='rl'){current().p.U=10;current().s=measure(active,current());}draw();$('#play').focus();}});
function translate(){buildContent(tr);feedback();for(const option of $('#activity').options)option.textContent=tr(titles[option.value]);controls();window.PraxisI18n.apply(document);if(document.documentElement.dataset.praxisStandalone==='true')document.querySelectorAll('[data-library-link],a[href$=".zip"]').forEach(el=>el.hidden=true);draw();}
document.addEventListener('visibilitychange',()=>{cancel();endDrag();if(!document.hidden)schedule();});window.addEventListener('pagehide',()=>{cancel();endDrag();});window.addEventListener('pageshow',schedule);
window.addEventListener('praxis-language-change',translate);for(const event of ['resize','praxis-course-presentation-change'])window.addEventListener(event,draw);new ResizeObserver(()=>{if(section==='experiment')draw();}).observe($('.faraday-visual'));
const integration=document.createElement('script');integration.src='../../shared/course.js';integration.dataset.course=id;integration.dataset.title='Laboratorul electromagnetic Faraday';integration.onload=()=>{const subtitle=$('.praxis-lab-intro p');if(subtitle)subtitle.textContent='Câmp magnetic, inducție și transfer de energie';window.PraxisI18n.apply(document);window.PraxisLabWorkspace?.mount();};document.body.append(integration);
window.PraxisFaraday=Object.freeze({snapshot:()=>structuredClone({active,section,running,parameters:current().p,t:current().t,state:current().s,history:current().history,energy:current().energy,source:current().source,heat:current().heat,dragging:!!drag,scene:standInfo($('#scene'))}),metricsCount:()=>metrics.total.length,startMetrics(){for(const values of Object.values(metrics))values.length=0;recording=true;},stopMetrics(){recording=false;return structuredClone({...metrics,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,browser:navigator.userAgent});}});
translate();selectTab('experiment');

