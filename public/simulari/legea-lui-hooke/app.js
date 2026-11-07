import {labNamespaces} from '../../shared/lab-locales.js';
import {DEFAULTS,LIMITS,observe,validate} from '../../shared/hooke-model.js';
import {advanceTime,validSpeed} from '../../shared/hooke-clock.js';
import {pairs,reading,questions,sources} from './content.js';
import {render,deformationAt} from './view.js';
const $=s=>document.querySelector(s),tr=s=>PraxisI18n.tr(s),namespace='labs/legea-lui-hooke/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['legea-lui-hooke'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},en:{[namespace]:{messages:Object.fromEntries(pairs)}}}});
let p={...DEFAULTS},t=0,speed=1,released=false,running=false,frame=null,previous=null,section='experiment',visible=true,dragging=null,recording=false,costs=[],intervals=[];
const parameters=[['k','Constanta elastică k',10,'N/m'],['m','Masa m',.1,'kg'],['x0','Deformarea inițială x₀',.01,'m']];
$('#parameters').innerHTML=parameters.map(([key,label,step,unit])=>`<div class="parameter"><div class="parameter-heading"><label for="num-${key}">${label} <small>${unit}</small></label><input id="num-${key}" type="number" data-param="${key}" min="${LIMITS[key][0]}" max="${LIMITS[key][1]}" step="${step}" aria-label="${label}"></div><div class="range-row praxis-range-stepper"><button data-adjust="${key}:-1" aria-label="Scade">−</button><input id="range-${key}" type="range" data-param="${key}" min="${LIMITS[key][0]}" max="${LIMITS[key][1]}" step="${step}" aria-label="${label}"><button data-adjust="${key}:1" aria-label="Crește">+</button></div></div>`).join('');
for(const [id,html] of Object.entries(reading()))$('#'+id).innerHTML=html;
$('#quiz').innerHTML=questions.map(([q,answers],i)=>`<fieldset><legend>${q}</legend>${answers.map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}">${a}</label>`).join('')}<p id="feedback-${i}" role="status" data-no-i18n></p></fieldset>`).join('')+`<h2 data-content-type="resources">Surse documentate cu Firecrawl</h2><ul>${sources.map(([name,url])=>`<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></li>`).join('')}</ul><p>Texte și desene originale; sursele oferă fundamentul științific.</p>`;
const scene=$('#scene');scene.setAttribute('tabindex','0');scene.setAttribute('role','slider');scene.setAttribute('aria-label','Corp: reglarea deformării');scene.setAttribute('aria-valuemin','-0.2');scene.setAttribute('aria-valuemax','0.2');
function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;}
function schedule(){if(frame===null&&running&&section==='experiment'&&!document.hidden&&visible)frame=requestAnimationFrame(tick);}
function draw(){const start=performance.now();render(p,observe(p,t,released));$('#play').textContent=tr(running?'Pauză':released?'Continuă':'Eliberează');$('#status').textContent=tr(running?'Oscilație liberă.':released?'Pauză la timpul curent.':'Pregătire: corp menținut în repaus.');$('#step').disabled=running;$('#speed-note').textContent=PraxisI18n.tr('1 s real = {speed} s simulate.',{speed:speed.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:1})});if(recording&&costs.length<3000)costs.push(performance.now()-start);}
function tick(now){frame=null;if(previous!==null){t=advanceTime(t,(now-previous)/1000,speed);if(recording&&intervals.length<3000)intervals.push(now-previous);}previous=now;draw();schedule();}
function setSpeed(value){if(validSpeed(value)){speed=value;cancel();schedule();}$('#num-speed').value=speed;$('#range-speed').value=speed;draw();}
for(const el of [$('#num-speed'),$('#range-speed')])el.addEventListener(el.type==='range'?'input':'change',()=>setSpeed(el.value===''?NaN:Number(el.value)));
for(const [id,delta] of [['speed-down',-.1],['speed-up',.1]])$('#'+id).addEventListener('click',()=>setSpeed(Math.round(Math.max(.1,Math.min(2,speed+delta))*10)/10));
function sync(){for(const el of document.querySelectorAll('[data-param]'))el.value=p[el.dataset.param];}
function reset(next={...DEFAULTS}){validate(next);cancel();p=next;t=0;released=false;running=false;sync();draw();}
function change(key,value){try{reset({...p,[key]:value});}catch(error){if(!(error instanceof RangeError))throw error;sync();}}
$('#play').addEventListener('click',()=>{released=true;running=!running;cancel();draw();schedule();});
$('#step').addEventListener('click',()=>{if(running)return;released=true;t+=.02;draw();});$('#reset').addEventListener('click',()=>{reset();setSpeed(1);});
for(const el of document.querySelectorAll('[data-param]'))el.addEventListener(el.type==='range'?'input':'change',()=>change(el.dataset.param,el.value===''?NaN:Number(el.value)));
for(const el of document.querySelectorAll('[data-adjust]'))el.addEventListener('click',()=>{const [key,d]=el.dataset.adjust.split(':'),step=parameters.find(r=>r[0]===key)[2];change(key,Number(Math.max(LIMITS[key][0],Math.min(LIMITS[key][1],p[key]+d*step)).toFixed(4)));});
function drag(e){change('x0',Math.round(Math.max(-.2,Math.min(.2,deformationAt(e.clientX)))*1000)/1000);}
scene.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-drag]')||!e.isPrimary)return;e.preventDefault();dragging=e.pointerId;scene.setPointerCapture(e.pointerId);drag(e);});
scene.addEventListener('pointermove',e=>{if(e.pointerId===dragging)drag(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])scene.addEventListener(name,e=>{if(e.pointerId===dragging){dragging=null;if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId);}});
scene.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?-.2:e.key==='End'?.2:observe(p,t,released).x+(e.key==='ArrowRight'?.01:-.01);change('x0',Math.max(-.2,Math.min(.2,next)));}});
function selectTab(id){section=id;for(const button of document.querySelectorAll('[data-tab]')){const active=button.dataset.tab===id;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$('#'+button.dataset.tab).hidden=!active;}const selector=$('.praxis-course-sections');if(selector)selector.value=id;cancel();if(id==='experiment'){draw();schedule();}window.PraxisLabWorkspace?.mount();}
for(const button of document.querySelectorAll('[data-tab]')){button.addEventListener('click',()=>selectTab(button.dataset.tab));button.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(button);const index={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[e.key];if(index!==undefined){e.preventDefault();tabs[index].click();tabs[index].focus();}});}
function feedback(){questions.forEach((q,i)=>{const answer=$(`input[name=q${i}]:checked`);$('#feedback-'+i).textContent=answer?tr(answer.value==='0'?'Corect.':'Mai încearcă.')+' '+tr(q[2]):'';});}
for(const el of document.querySelectorAll('input[type=radio]'))el.addEventListener('change',feedback);
for(const event of ['praxis-language-change','praxis-course-presentation-change'])window.addEventListener(event,()=>{draw();feedback();});
new ResizeObserver(()=>draw()).observe($('.hooke-visual'));
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;cancel();schedule();},{threshold:0}).observe($('.hooke-workspace'));
document.addEventListener('visibilitychange',()=>{cancel();schedule();});window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',()=>{cancel();schedule();});
const integration=document.createElement('script');integration.src='../../shared/course.js';integration.dataset.course='legea-lui-hooke';integration.dataset.title='Legea lui Hooke';integration.onload=()=>{const subtitle=$('.praxis-lab-intro p');if(subtitle)subtitle.textContent='De la deformare la lucru mecanic și energie';PraxisI18n.apply(document);window.PraxisLabWorkspace?.mount();};document.body.append(integration);
window.PraxisHooke=Object.freeze({snapshot:()=>({parameters:{...p},state:observe(p,t,released),speed,running,section}),startMetrics(){costs=[];intervals=[];recording=true;},stopMetrics(){recording=false;return {costs,intervals};}});
reset();selectTab('experiment');PraxisI18n.apply(document);
