import {labNamespaces} from '../../shared/lab-locales.js';
import {DEFAULTS,initial,observe,advance} from '../../shared/daniell-model.js';
import {messages,theory,activities,questions,sources} from './content.js';
import {buildScene,renderScene,renderReadouts,renderGraph} from './view.js';
const $=s=>document.querySelector(s),tr=s=>PraxisI18n.tr(s),namespace='labs/pila-daniell/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['pila-daniell'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(Object.keys(messages).map(k=>[k,k]))}},en:{[namespace]:{messages}}}});
let p={...DEFAULTS},state=initial(),running=false,frame=null,previous=null,section='experiment',visible=true,history=[],samples=[],costs=[],intervals=[],recording=false;
const parameters=[['cZn','Concentrație inițială Zn²⁺',10,1000,10,'mol/m³'],['cCu','Concentrație inițială Cu²⁺',10,1000,10,'mol/m³'],['R','Rezistența sarcinii',0,100,1,'Ω']];
$('#parameters').innerHTML=parameters.map(([key,name,min,max,step,unit])=>`<div class="parameter"><div class="parameter-heading"><label for="num-${key}">${name} <small>${unit}</small></label><input id="num-${key}" type="number" data-param="${key}" min="${min}" max="${max}" step="${step}" aria-label="${name}"></div><div class="range-row praxis-range-stepper"><button data-adjust="${key}:-1" aria-label="Scade">−</button><input id="range-${key}" type="range" data-param="${key}" min="${min}" max="${max}" step="${step}" aria-label="${name}"><button data-adjust="${key}:1" aria-label="Crește">+</button></div></div>`).join('');
$('#theory').innerHTML=theory;$('#activities').innerHTML=activities;
$('#quiz').innerHTML=questions.map(([q,answers],i)=>`<fieldset><legend>${q}</legend>${answers.map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}">${a}</label>`).join('')}<p id="feedback-${i}" data-no-i18n></p></fieldset>`).join('')+`<h2 data-content-type="resources">Surse documentate cu Firecrawl</h2><ul>${sources.map(([name,url])=>`<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></li>`).join('')}</ul><p>Referință vizuală: imaginea furnizată de utilizator; desen original. Puntea KNO₃ explicitează transportul ionilor monovalenți.</p>`;
function sync(){for(const el of document.querySelectorAll('[data-param]'))el.value=p[el.dataset.param];$('#open').checked=p.open;$('#bridge').checked=p.bridge;}
function sample(){const s=observe(p,state);history.push(s);samples.push(s);if(history.length>500)history.splice(1,1);if(samples.length>10000)samples.splice(1,1);}
function draw(){const start=performance.now(),s={...observe(p,state),running};renderScene(p,s);renderReadouts(p,s);renderGraph(history);if(recording&&costs.length<2000)costs.push(performance.now()-start);}
function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;}
function schedule(){if(frame===null&&running&&section==='experiment'&&!document.hidden&&visible)frame=requestAnimationFrame(tick);}
function tick(now){frame=null;if(previous!==null){const dt=Math.min((now-previous)/1000,.1);if(recording&&intervals.length<2000)intervals.push(now-previous);state=advance(p,state,dt*600);sample();if(observe(p,state).ended)running=false;}previous=now;draw();schedule();}
function reset(next={...DEFAULTS}){cancel();running=false;p=next;state=initial();history=[];samples=[];sample();sync();draw();}
$('#play').addEventListener('click',()=>{if(observe(p,state).ended)return;running=!running;cancel();draw();schedule();});
$('#step').addEventListener('click',()=>{if(running)return;state=advance(p,state,60);sample();draw();});$('#reset').addEventListener('click',()=>reset());
function change(key,value){const [, ,min,max]=parameters.find(row=>row[0]===key);if(!Number.isFinite(value)||value<min||value>max){sync();return;}reset({...p,[key]:value});}
for(const el of document.querySelectorAll('[data-param]'))el.addEventListener(el.type==='range'?'input':'change',()=>change(el.dataset.param,el.value===''?NaN:Number(el.value)));
for(const el of document.querySelectorAll('[data-adjust]'))el.addEventListener('click',()=>{const [key,direction]=el.dataset.adjust.split(':'),row=parameters.find(r=>r[0]===key);change(key,Math.max(row[2],Math.min(row[3],p[key]+Number(direction)*row[4])));});
for(const key of ['open','bridge'])$('#'+key).addEventListener('change',()=>{p={...p,[key]:$('#'+key).checked};sample();draw();});
function selectTab(id){section=id;for(const el of document.querySelectorAll('[data-tab]')){const selected=el.dataset.tab===id;el.setAttribute('aria-selected',String(selected));el.tabIndex=selected?0:-1;$('#'+el.dataset.tab).hidden=!selected;}cancel();if(id==='experiment'){draw();schedule();}window.PraxisLabWorkspace?.mount();}
for(const button of document.querySelectorAll('[data-tab]')){button.addEventListener('click',()=>selectTab(button.dataset.tab));button.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(button);let target;if(e.key==='ArrowRight')target=tabs[(i+1)%tabs.length];if(e.key==='ArrowLeft')target=tabs[(i+tabs.length-1)%tabs.length];if(e.key==='Home')target=tabs[0];if(e.key==='End')target=tabs.at(-1);if(target){e.preventDefault();target.click();target.focus();}});}
function feedback(){questions.forEach((q,i)=>{const answer=$(`input[name=q${i}]:checked`);$('#feedback-'+i).textContent=answer?tr(Number(answer.value)===q[2]?'Corect.':'Mai încearcă.')+' '+tr(q[3]):'';});}
for(const el of document.querySelectorAll('input[type=radio]'))el.addEventListener('change',feedback);
$('#export').addEventListener('click',()=>{const columns=[['t_s','t'],['extent_mol','xi'],['emf_V','E'],['terminal_V','voltage'],['current_A','current'],['cZn_mol_m3','cZn'],['cCu_mol_m3','cCu'],['charge_C','charge'],['external_J','external'],['internal_J','internal']];const csv=[columns.map(c=>c[0]).join(','),...samples.map(s=>columns.map(([,k])=>s[k]??'').join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='pila-daniell-SI.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
for(const name of ['praxis-language-change','praxis-course-presentation-change'])window.addEventListener(name,()=>{buildScene();draw();feedback();});
window.addEventListener('resize',()=>{buildScene();draw();});
document.addEventListener('visibilitychange',()=>{cancel();schedule();});window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',()=>{cancel();schedule();});
// Layout/language changes can queue an exit and a re-entry in the same batch.
// Use the latest observation so a visible experiment cannot remain suspended.
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;cancel();schedule();},{threshold:0}).observe($('.daniell-workspace'));
buildScene();reset();selectTab('experiment');PraxisI18n.apply(document);
const integration=document.createElement('script');integration.src='../../shared/course.js';integration.dataset.course='pila-daniell';integration.dataset.title='Pila Daniell';integration.onload=()=>{const subtitle=$('.praxis-lab-intro p');if(subtitle)subtitle.textContent='Din reacție chimică în energie electrică';PraxisI18n.apply(document);window.PraxisLabWorkspace?.mount();};document.body.append(integration);
window.PraxisDaniell=Object.freeze({snapshot:()=>({parameters:{...p},state:observe(p,state),running,section,historyLength:history.length}),startMetrics(){costs=[];intervals=[];recording=true;},stopMetrics(){recording=false;return {costs,intervals};}});
