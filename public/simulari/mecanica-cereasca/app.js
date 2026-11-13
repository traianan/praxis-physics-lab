import {labNamespaces} from '../../shared/lab-locales.js';
import {pairs,title,subtitle,tabs,panels,preferences,questions,words,formulaSheet} from './content.js';
import {orbit,period,circular,geostationaryAltitude,isGeostationary,sweptArea,TAU,AU_KM,YEAR} from './model.js';
import {drawOrbit,drawPeriods,drawSatellite} from './view.js';
const $=selector=>document.querySelector(selector),root=$('#praxis-original');
root.innerHTML=`<div class="tabs" role="tablist" aria-label="Secțiunea lecției">${tabs.map(([id,label],i)=>`<button type="button" class="tab" role="tab" id="tab-${id}" data-tab="${id}" aria-controls="${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div>${preferences}${tabs.map(([id],i)=>`<section id="${id}" role="tabpanel" aria-labelledby="tab-${id}" ${i?'hidden':''}>${panels[id]}</section>`).join('')}<a data-offline-download href="mecanica-cereasca.zip" download>Offline (ZIP)</a>`;
const namespace='labs/mecanica-cereasca/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['mecanica-cereasca'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},en:{[namespace]:{messages:Object.fromEntries(pairs)}}}});
const tr=s=>PraxisI18n.tr(s),n=(value,digits=2)=>value.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:digits,minimumFractionDigits:digits});
const defaults={kepler:{a:1,e:.45,mass:1,time:0,playing:false,mode:'geometry',vectors:true,sectors:true},periods:{a1:1,a2:1.52,mass:1,time:0,playing:false},satellites:{altitude:400,inclination:0,direction:1,time:0,playing:false,earthFrame:false}};
const state=structuredClone(defaults),bindings={axis:['kepler','a'],eccentricity:['kepler','e'],'star-mass':['kepler','mass'],'axis-one':['periods','a1'],'axis-two':['periods','a2'],'compare-mass':['periods','mass'],altitude:['satellites','altitude'],inclination:['satellites','inclination']};
let active='kepler',rate=1,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,frame=null,last=null,graded=false,records=[];
const visible=new Map();$('#reduced').checked=reduced;
function write(selector,value){const e=$(selector);if(e.textContent!==value)e.textContent=value;}
function sync(){for(const [id,[group,key]]of Object.entries(bindings)){$('#'+id).value=String(state[group][key]);$('#'+id+'-number').value=String(state[group][key]);}$('#orbit-mode').value=state.kepler.mode;$('#vectors').checked=state.kepler.vectors;$('#sectors').checked=state.kepler.sectors;$('#direction').value=String(state.satellites.direction);$('#earth-frame').checked=state.satellites.earthFrame;$('#earth-frame').disabled=state.satellites.inclination!==0;}
function render(){
 const k=state.kepler,o=orbit(k.a,k.e,TAU*k.time/period(k.a,k.mass),k.mass),s=circular(state.satellites.altitude),p=state.periods;
 write('#orbit-period',n(o.T,3));write('#orbit-distance',n(o.r,3));write('#orbit-speed',n(o.speed*AU_KM/YEAR,2));write('#orbit-angular',n(o.specificH,3));
 write('#axis-b',n(o.b,3));write('#peri-distance',n(o.rp,3));write('#apo-distance',n(o.ra,3));write('#swept-area',n(sweptArea(k.a,k.e,TAU/12),3));
 const interpretation=k.mode==='momentum'?tr(words.central):k.mode==='areas'?tr(words.equal)+'  |  Δt = '+n(o.T/12,3)+' '+tr(words.year):'e = '+n(k.e)+'  |  rₚ = '+n(o.rp)+' '+tr(words.au)+'  |  rₐ = '+n(o.ra)+' '+tr(words.au);
 write('#orbit-interpretation',interpretation);
 write('#period-one',n(period(p.a1,p.mass),3));write('#period-two',n(period(p.a2,p.mass),3));write('#period-ratio',n(period(p.a2,p.mass)/period(p.a1,p.mass),3));write('#kepler-ratio',n(1/p.mass,3));
 write('#sat-speed',n(s.speed,3));write('#escape-speed',n(s.escape,3));write('#sat-period',n(s.T/60,2));write('#sat-gravity',n(s.g,3));
 const geo=isGeostationary(state.satellites.altitude,state.satellites.inclination,state.satellites.direction);write('#geo-verdict',tr(geo?words.geo:words.notGeo));$('#geo-verdict').className=geo?'correct':'celestial-caption';
 for(const button of document.querySelectorAll('[data-play]')){const value=state[button.dataset.play].playing;button.textContent=tr(value?words.pause:words.play);button.disabled=reduced;button.setAttribute('aria-pressed',String(value));}
 if(active==='kepler')drawOrbit($('#orbit-canvas'),k,tr,words);
 if(active==='periods')drawPeriods($('#period-canvas'),p,tr,words);
 if(active==='satellites')drawSatellite($('#satellite-canvas'),state.satellites,tr,words);
}
const canvasIDs={kepler:'orbit-canvas',periods:'period-canvas',satellites:'satellite-canvas'};
function cancelFrame(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
function schedule(){if(frame===null&&!document.hidden&&!reduced&&state[active]?.playing&&visible.get(canvasIDs[active]))frame=requestAnimationFrame(tick);}
function tick(now){frame=null;const dt=last===null?0:Math.min(.08,(now-last)/1000);last=now;if(!document.hidden&&!reduced&&state[active]?.playing&&visible.get(canvasIDs[active])){state[active].time+=dt*rate*(active==='satellites'?600:.25);render();schedule();}else last=null;}
function setTab(id){if(!tabs.some(([key])=>key===id))return;cancelFrame();active=id;for(const [key]of tabs){$('#'+key).hidden=key!==id;const b=$('#tab-'+key);b.setAttribute('aria-selected',String(key===id));b.tabIndex=key===id?0:-1;}const picker=$('.praxis-course-sections');if(picker)picker.value=id;render();schedule();}
for(const button of document.querySelectorAll('[data-tab]')){button.addEventListener('click',()=>setTab(button.dataset.tab));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const i=tabs.findIndex(([key])=>key===active),j=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(tabs[j][0]);$('#tab-'+tabs[j][0]).focus();});}
function change(id,value,commit=false){const input=$('#'+id),[group,key]=bindings[id];if(value===''||!Number.isFinite(Number(value))){if(commit)sync();return;}const v=Math.max(Number(input.min),Math.min(Number(input.max),Number(value)));state[group][key]=v;if(id==='inclination'&&v!==0)state.satellites.earthFrame=false;sync();render();}
for(const id of Object.keys(bindings)){$('#'+id).addEventListener('input',e=>change(id,e.target.value));const number=$('#'+id+'-number');number.addEventListener('input',e=>{if(e.target.value!==''&&e.target.validity.valid)change(id,e.target.value);});number.addEventListener('change',e=>change(id,e.target.value,true));number.addEventListener('blur',()=>sync());}
for(const button of document.querySelectorAll('[data-adjust]'))button.addEventListener('click',()=>{const [id,direction]=button.dataset.adjust.split(':');change(id,Number($('#'+id).value)+Number(direction)*Number($('#'+id).step));});
for(const button of document.querySelectorAll('[data-play]'))button.addEventListener('click',()=>{const group=button.dataset.play;state[group].playing=!state[group].playing;cancelFrame();render();schedule();});
for(const button of document.querySelectorAll('[data-step]'))button.addEventListener('click',()=>{const group=button.dataset.step,s=state[group];s.playing=false;s.time+=(group==='satellites'?circular(s.altitude).T:group==='periods'?period(s.a1,s.mass):period(s.a,s.mass))/24;cancelFrame();render();});
for(const button of document.querySelectorAll('[data-reset]'))button.addEventListener('click',()=>{const group=button.dataset.reset;Object.assign(state[group],structuredClone(defaults[group]));cancelFrame();sync();render();});
$('#rate').addEventListener('change',e=>rate=Number(e.target.value));$('#reduced').addEventListener('change',e=>{reduced=e.target.checked;if(reduced){for(const s of Object.values(state))s.playing=false;cancelFrame();}render();});
$('#orbit-mode').addEventListener('change',e=>{state.kepler.mode=e.target.value;render();});for(const key of ['vectors','sectors'])$('#'+key).addEventListener('change',e=>{state.kepler[key]=e.target.checked;render();});
for(const button of document.querySelectorAll('[data-orbit-preset]'))button.addEventListener('click',()=>change('eccentricity',button.dataset.orbitPreset));
$('#earth-mars').addEventListener('click',()=>{change('axis-one',1);change('axis-two',1.52);change('compare-mass',1);});$('#axis-four').addEventListener('click',()=>{change('axis-one',1);change('axis-two',4);change('compare-mass',1);});
for(const button of document.querySelectorAll('[data-altitude]'))button.addEventListener('click',()=>{const geo=button.dataset.altitude==='geo';change('altitude',geo?Math.round(geostationaryAltitude()):Number(button.dataset.altitude));if(geo){change('inclination',0);state.satellites.direction=1;state.satellites.time=0;}sync();render();});
$('#direction').addEventListener('change',e=>{state.satellites.direction=Number(e.target.value);render();});$('#earth-frame').addEventListener('change',e=>{state.satellites.earthFrame=e.target.checked;render();});
function renderRecords(){const html=records.map(r=>'<tr>'+[r.a1,r.a2,period(r.a1,r.mass),period(r.a2,r.mass),Math.sqrt((r.a2/r.a1)**3)].map(v=>'<td data-no-i18n>'+n(v,3)+'</td>').join('')+'</tr>').join('');if($('#measurements').innerHTML!==html)$('#measurements').innerHTML=html;}
$('#measure').addEventListener('click',()=>{records.push({...state.periods});records=records.slice(-8);renderRecords();$('#measurements').closest('details').open=true;});$('#clear-measurements').addEventListener('click',()=>{records=[];renderRecords();});
function grade(){let score=0;questions.forEach(([, ,answer,explanation],i)=>{const input=$(`input[name="q${i}"]:checked`),output=$('#feedback-'+i),correct=input&&Number(input.value)===answer;if(correct)score++;output.textContent=tr(!input?words.unanswered:correct?words.correct:words.wrong)+' '+tr(explanation);output.className=correct?'correct':'incorrect';});write('#quiz-score',tr(words.score)+': '+score+' / '+questions.length);}
$('#quiz-form').addEventListener('submit',e=>{e.preventDefault();graded=true;grade();});$('#quiz-reset').addEventListener('click',()=>{$('#quiz-form').reset();graded=false;questions.forEach((_,i)=>write('#feedback-'+i,''));write('#quiz-score','');});
let practiceResult=null,copyResult=null;
$('#practice-check').addEventListener('click',()=>{const value=$('#practice').value;practiceResult=value===''||!Number.isFinite(Number(value))?words.empty:Math.abs(Number(value)-4)<.02?words.correct:words.wrong;write('#practice-feedback',tr(practiceResult));});
$('#copy-formulas').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(formulaSheet);copyResult=words.copied;}catch{copyResult=words.copyFail;}write('#copy-status',tr(copyResult));});
$('#save-journal').addEventListener('click',()=>{const checks=['self-one','self-two','self-three'].map(id=>($('#'+id).checked?'[x] ':'[ ] ')+$('#'+id).nextElementSibling.textContent);const blob=new Blob([tr(title)+'\n\n'+$('#journal').value+'\n\n'+checks.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mecanica-cereasca-jurnal.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
if(document.documentElement.dataset.praxisStandalone==='true')document.querySelectorAll('[data-related]').forEach(link=>{const span=document.createElement('span');span.textContent=link.textContent;link.replaceWith(span);});
const observer=new IntersectionObserver(entries=>{for(const entry of entries)visible.set(entry.target.id,entry.isIntersecting);if(!visible.get(canvasIDs[active]))cancelFrame();schedule();});document.querySelectorAll('canvas').forEach(c=>observer.observe(c));
const resizer=new ResizeObserver(()=>render());document.querySelectorAll('canvas').forEach(c=>resizer.observe(c));
window.addEventListener('resize',render);window.addEventListener('praxis-course-presentation-change',render);
window.addEventListener('praxis-language-change',()=>{render();renderRecords();if(graded)grade();if(practiceResult)write('#practice-feedback',tr(practiceResult));if(copyResult)write('#copy-status',tr(copyResult));});
document.addEventListener('visibilitychange',()=>{cancelFrame();schedule();});window.addEventListener('pagehide',cancelFrame);window.addEventListener('pageshow',schedule);
sync();render();PraxisI18n.apply(document);
const integration=document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course='mecanica-cereasca';integration.dataset.title=title;integration.dataset.subtitle=subtitle;
integration.onload=()=>{PraxisLabWorkspace.mount();const preferencesPanel=document.querySelector('.praxis-workspace-disclosure');if(preferencesPanel)preferencesPanel.append(document.querySelector('.celestial-preferences'));PraxisI18n.apply(document);PraxisLabWorkspace.mount();render();};
document.body.append(integration);
window.PraxisCelestial={snapshot:()=>({active,rate,reduced,state:structuredClone(state),records:structuredClone(records),graded}),setTab};
