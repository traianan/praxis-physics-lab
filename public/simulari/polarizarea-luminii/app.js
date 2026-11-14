import {labNamespaces} from '../../shared/lab-locales.js';
import {polarizers, reflection, field} from './model.js';
import {pairs, title, subtitle, tabs, markup, problems, questions, concepts} from './content.js';
const $ = selector => document.querySelector(selector);
$('#praxis-original').innerHTML = markup;
const namespace = 'labs/polarizarea-luminii/ui';
await PraxisI18n.init({baseUrl:'../../locales/', namespaceList: labNamespaces['polarizarea-luminii'], embedded:{
 ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},
 en:{[namespace]:{messages:Object.fromEntries(pairs)}}
}});
const tr = text => PraxisI18n.tr(text);
const number = (value,digits=1) => value.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:digits});
const state = {active:'lab',time:0,fieldTime:0,running:false,fieldRunning:false,measurements:[],quizChecked:false,concept:0};
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
$('#reduced').checked=motionQuery.matches;
const read = id => Number($('#'+id).value);
const settings = () => ({intensity:read('intensity'),angle:read('angle'),middle:read('middle'),third:$('#third').checked,polarized:$('#source').value==='polarized'});
const colors = () => document.documentElement.dataset.courseColors==='vivid' ? ['#75d7ff','#ffd064','#faabcf'] : ['#9ad7ce','#e8b85c','#c6ddb2'];
const text=(x,y,value,fill='#eff8f3',size=15,anchor='middle')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Segoe UI,Arial,sans-serif" font-size="${size}" text-anchor="${anchor}">${value}</text>`;
const line=(x1,y1,x2,y2,color,width=2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
function arrow(x1,y1,x2,y2,color,width=3) {
 const a=Math.atan2(y2-y1,x2-x1),s=7;
 if(Math.hypot(x2-x1,y2-y1)<1)return `<circle cx="${x1}" cy="${y1}" r="2" fill="${color}"/>`;
 return line(x1,y1,x2,y2,color,width)+`<path d="M${x2-s*Math.cos(a-.45)},${y2-s*Math.sin(a-.45)} L${x2},${y2} L${x2-s*Math.cos(a+.45)},${y2-s*Math.sin(a+.45)}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
}
function svg(id,viewBox,html) {const el=$('#'+id);el.dataset.noI18n='';el.setAttribute('viewBox',viewBox);el.innerHTML=html;}
function drawBeam() {
 const s=settings(),m=polarizers(s),compact=$('#beam').clientWidth<480,W=compact?360:660,r=compact?31:52,y=92;
 const xs=compact?[43,134,225,316]:[75,245,415,585], palette=colors();
 const values=[s.intensity,m.first,s.third?m.intermediate:null,m.output],angles=[0,0,s.middle,s.angle],names=['Sursă','Filtru 1','Intermediar','Analizor'];
 let html='';
 xs.forEach((x,i)=>{
  if(i===2&&!s.third){html+=text(x,y+5,'—','#9bbab1',24);return;}
  const angle=angles[i]*Math.PI/180;
  const projection=i<2?1:i===2?Math.cos(s.middle*Math.PI/180):s.third?Math.cos(s.middle*Math.PI/180)*Math.cos((s.angle-s.middle)*Math.PI/180):Math.cos(angle);
  const amplitude=Math.sqrt((i===0?s.intensity:m.first)/200)*r*.85*projection;
  html+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${i===3?'#e8b85c':'#bde7d5'}" fill-opacity="${.06+.45*values[i]/200}" stroke="#7baba0"/>`;
  if(i===0&&!s.polarized){for(let k=0;k<6;k++){const a=k*Math.PI/6;html+=line(x-r*.65*Math.sin(a),y-r*.65*Math.cos(a),x+r*.65*Math.sin(a),y+r*.65*Math.cos(a),palette[0],1.4);} }
  else {html+=line(x-r*Math.sin(angle),y+r*Math.cos(angle),x+r*Math.sin(angle),y-r*Math.cos(angle),'#b0ccc3',1,'stroke-dasharray="4 4"');const a=amplitude*Math.cos(state.time*3);html+=arrow(x,y,x+a*Math.sin(angle),y-a*Math.cos(angle),palette[i===3?1:0]);}
  html+=text(x,22,tr(names[i]),'#eff8f3',compact?13:16)+text(x,165,i===0?`${number(s.intensity)} W/m²`:`${number(angles[i])}°`,'#e8efe9',compact?13:15);
 });
 svg('beam',`0 0 ${W} 185`,html);
}
function drawCurve() {
 const s=settings(),W=Math.max(300,$('#curve').clientWidth),H=112,left=44,right=W-18,top=15,bottom=86,m=polarizers(s),max=Math.max(1,m.first),ink='#586d63';
 const x=a=>left+(right-left)*a/180,y=i=>bottom-(bottom-top)*i/max;
 let html=line(left,top,left,bottom,ink,1)+line(left,bottom,right,bottom,ink,1);
 for(const a of [0,45,90,135,180])html+=text(x(a),107,`${a}°`,ink,13);
 for(const v of [0,max/2,max])html+=text(left-7,y(v)+4,number(v),ink,12,'end')+line(left,y(v),right,y(v),'#d8ded3',1,'stroke-dasharray="3 4"');
 const points=Array.from({length:181},(_,a)=>`${x(a)},${y(polarizers({...s,angle:a}).output)}`).join(' ');
 html+=`<polyline points="${points}" fill="none" stroke="#17685f" stroke-width="2.5"/><circle cx="${x(s.angle)}" cy="${y(m.output)}" r="5" fill="#9c691a" stroke="white" stroke-width="2"/>`;
 svg('curve',`0 0 ${W} ${H}`,html);
}
function drawField() {
 const ratio=read('ratio'),delay=read('delay'),point=field(state.fieldTime*3,ratio,delay),p=colors();
 const xy=v=>[160+v.x*105,150-v.y*105];let html=line(30,150,290,150,'#749f93',1)+line(160,25,160,275,'#749f93',1);
 const points=Array.from({length:181},(_,i)=>xy(field(i*Math.PI/90,ratio,delay)).join(',')).join(' ');
 const [x,y]=xy(point);
 html+=`<polyline points="${points}" stroke="${p[0]}" stroke-width="2" fill="none"/>`+line(x,150,x,y,'#789f94',1,'stroke-dasharray="4 4"')+line(160,y,x,y,'#789f94',1,'stroke-dasharray="4 4"')+arrow(160,150,x,y,p[1])+`<circle cx="${x}" cy="${y}" r="4" fill="${p[1]}"/>`+text(294,170,'x')+text(177,20,'y');
 svg('field','0 0 320 300',html);
 const type=ratio===0||Math.abs(Math.sin(delay*Math.PI/180))<1e-9?'Liniară':ratio===1&&Math.abs(delay)===90?'Circulară':'Eliptică';
 $('#state-name').textContent=tr(type);
}
function drawReflection() {
 const index=read('index'),incidence=read('incidence'),m=reflection(index,incidence),i=incidence*Math.PI/180,r=m.refraction*Math.PI/180,L=112,x=210,y=145;
 let html=`<path d="M0 145H420V280H0Z" fill="#7aa99b" fill-opacity=".2"/>`+line(5,y,415,y,'#b8d8ce',2)+line(x,12,x,270,'#b8d8ce',1,'stroke-dasharray="5 5"');
 html+=arrow(x-L*Math.sin(i),y-L*Math.cos(i),x,y,colors()[1])+arrow(x,y,x+L*Math.sin(i),y-L*Math.cos(i),colors()[0])+arrow(x,y,x+L*Math.sin(r),y+L*Math.cos(r),'#e4b8d2');
 html+=text(8,25,tr('Incidentă'),'#e8b85c',14,'start')+text(412,25,tr('Reflectată'),'#9ad7ce',14,'end')+text(412,265,tr('Refractată'),'#e4b8d2',14,'end')+text(12,130,'n₁ = 1','#eff8f3',14,'start')+text(12,175,'n₂ = '+number(index,2),'#eff8f3',14,'start');
 html+=text(180,110,'i','#e8b85c',16)+text(230,189,'r','#e4b8d2',16);
 svg('reflection','0 0 420 280',html);
 $('#brewster-value').textContent='iB = '+number(m.brewster,2)+'°';$('#rs').textContent=number(m.rs*100,2)+'%';$('#rp').textContent=number(m.rp*100,3)+'%';$('#refracted').textContent=number(m.refraction,1)+'°';
 $('#brewster-status').textContent=tr(Math.abs(m.brewster-incidence)<.06?'La Brewster: reflexia p este nulă.':'Ajustează incidența până când Rₚ devine zero.');
}
function refresh() {
 for(const id of ['intensity','angle','middle','ratio','delay','index','incidence'])$('#'+id+'-value').textContent=number(read(id),id==='ratio'||id==='index'?2:1)+(['angle','middle','delay','incidence'].includes(id)?'°':id==='intensity'?' W/m²':'');
 const s=settings(),m=polarizers(s);$('#middle-control').hidden=!s.third;
 $('#first').textContent=number(m.first)+' W/m²';$('#output').textContent=number(m.output,2)+' W/m²';$('#fraction').textContent=number(m.fraction*100,2)+'%';
 const law=s.third?'I = I₁ cos² α cos²(θ − α)':'I = I₁ cos² θ';
 if(window.PraxisMath?.set)PraxisMath.set($('#law'),law);else $('#law').textContent=law;
 $('#play').textContent=tr(state.running?'Pauză':'Animează');$('#field-play').textContent=tr(state.fieldRunning?'Pauză':'Animează');
 for(const [id,running]of [['play',state.running],['field-play',state.fieldRunning]]){$('#'+id).disabled=$('#reduced').checked;$('#'+id).setAttribute('aria-pressed',String(running));}
 if(state.active==='lab'){drawBeam();drawCurve();}if(state.active==='states')drawField();if(state.active==='brewster')drawReflection();
}
let frame=null,previous=null,inView=true;
function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;}
function shouldRun(){return !document.hidden&&!$('#reduced').checked&&inView&&((state.active==='lab'&&state.running)||(state.active==='states'&&state.fieldRunning));}
function schedule(){if(frame===null&&shouldRun())frame=requestAnimationFrame(tick);}
function tick(now){frame=null;if(!shouldRun()){previous=null;return;}const dt=previous===null?0:Math.min(.05,(now-previous)/1000);previous=now;if(state.active==='lab'){state.time+=dt;drawBeam();}else{state.fieldTime+=dt;drawField();}schedule();}
function setTab(id,{hash=true,focus=false}={}) {
 if(!tabs.some(([key])=>key===id))return;
 cancel();state.active=id;
 for(const [key]of tabs){$('#'+key).hidden=key!==id;const tab=$('#tab-'+key);tab.setAttribute('aria-selected',String(key===id));tab.tabIndex=key===id?0:-1;}
 const picker=$('.praxis-course-sections');if(picker)picker.value=id;
 if(hash)history.replaceState(null,'','#'+id);if(focus)$('#tab-'+id).focus();inView=true;refresh();schedule();
}
document.addEventListener('click',e=>{const tab=e.target.closest('[data-tab]'),link=e.target.closest('[data-jump]');if(tab)setTab(tab.dataset.tab);if(link){e.preventDefault();setTab(link.dataset.jump,{focus:true});}});
$('.tabs').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;const index=tabs.findIndex(([id])=>id===state.active);const target=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;e.preventDefault();setTab(tabs[target][0],{focus:true});});
window.addEventListener('hashchange',()=>setTab(location.hash.slice(1),{hash:false}));
for(const id of ['intensity','angle','middle','ratio','delay','index','incidence'])$('#'+id).addEventListener('input',refresh);
for(const id of ['source','third'])$('#'+id).addEventListener('change',refresh);
$('#play').onclick=()=>{state.running=!state.running;cancel();refresh();schedule();};
$('#field-play').onclick=()=>{state.fieldRunning=!state.fieldRunning;cancel();refresh();schedule();};
$('#step').onclick=()=>{state.running=false;state.time+=.1;cancel();refresh();};
$('#field-step').onclick=()=>{state.fieldRunning=false;state.fieldTime+=.1;cancel();refresh();};
$('#reduced').onchange=()=>{if($('#reduced').checked){state.running=false;state.fieldRunning=false;cancel();}refresh();};
motionQuery.addEventListener('change',e=>{$('#reduced').checked=e.matches;$('#reduced').dispatchEvent(new Event('change'));});
$('#reset').onclick=()=>{state.running=false;state.time=0;$('#intensity').value=100;$('#angle').value=45;$('#middle').value=45;$('#third').checked=false;$('#source').value='unpolarized';cancel();refresh();};
function preset(angle,third=false){$('#angle').value=angle;$('#third').checked=third;$('#middle').value=45;refresh();}
$('#parallel').onclick=()=>preset(0);$('#crossed').onclick=()=>preset(90);$('#three').onclick=()=>preset(90,true);
function fieldPreset(ratio,delay){$('#ratio').value=ratio;$('#delay').value=delay;refresh();}
$('#linear').onclick=()=>fieldPreset(1,0);$('#circular').onclick=()=>fieldPreset(1,90);$('#elliptical').onclick=()=>fieldPreset(.5,90);
$('#field-reset').onclick=()=>{state.fieldRunning=false;state.fieldTime=0;cancel();fieldPreset(1,0);};
$('#brewster-preset').onclick=()=>{$('#incidence').value=reflection(read('index'),0).brewster;refresh();};
function measurements(){ $('#measurements').innerHTML=state.measurements.map(s=>`<tr><td>${tr(s.polarized?'Liniară':'Nepolarizată')}</td><td>${number(s.intensity)}</td><td>${number(s.angle)}°</td><td>${s.third?number(s.middle)+'°':'—'}</td><td>${number(s.output,2)}</td></tr>`).join('');}
$('#measure').onclick=()=>{if(state.measurements.length>=12){$('#measurement-status').textContent=tr('Maximum 12 măsurări. Exportă sau șterge tabelul.');return;}const s=settings();state.measurements.push({...s,output:polarizers(s).output});measurements();$('#measurement-status').textContent=tr('Măsurare salvată.');PraxisSound.play('event');};
$('#clear').onclick=()=>{state.measurements=[];measurements();$('#measurement-status').textContent='';};
$('#export').onclick=()=>{if(!state.measurements.length){$('#measurement-status').textContent=tr('Nu există măsurători de exportat.');return;}const csv='source,I0_W_m2,theta_deg,middle_deg,I_W_m2\n'+state.measurements.map(s=>[s.polarized?'linear':'unpolarized',s.intensity,s.angle,s.third?s.middle:'',s.output.toFixed(6)].join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='polarizarea-luminii-masuratori.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const checkedProblems=new Set();
function checkProblem(i,sound=false){const raw=$('#answer-'+i).value.trim().replace(',','.');const value=Number(raw),valid=raw!==''&&Number.isFinite(value),correct=valid&&Math.abs(value-problems[i][2])<=.11;$('#feedback-'+i).textContent=tr(!valid?'Introdu un număr finit.':correct?'Corect.':'Mai încearcă. Consultă indiciul și verifică unitățile.');checkedProblems.add(i);if(correct&&sound)PraxisSound.play('event');}
document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>checkProblem(Number(b.dataset.check),true));
function quizFeedback(){let score=0;questions.forEach((q,i)=>{const chosen=$(`input[name=q${i}]:checked`),correct=chosen&&Number(chosen.value)===q[2];if(correct)score++;const el=$('#q-feedback-'+i);el.hidden=!state.quizChecked;el.textContent=state.quizChecked?tr(!chosen?'Alege un răspuns':correct?'Răspuns corect':'Revizuiește răspunsul')+'. '+tr(q[3]):'';});$('#quiz-score').textContent=state.quizChecked?`${score} / ${questions.length}`:'';return score;}
$('#quiz-form').onsubmit=e=>{e.preventDefault();state.quizChecked=true;quizFeedback();PraxisSound.play('event');};
$('#quiz-form').onchange=()=>{if(state.quizChecked)quizFeedback();};
$('#quiz-reset').onclick=()=>{$('#quiz-form').reset();state.quizChecked=false;quizFeedback();};
function concept(i){state.concept=i;const [name,,target,description]=concepts[i];$('#concept-detail').innerHTML=`<h3>${tr(name)}</h3><p>${tr(description)}</p><a href="#${target}" data-jump="${target}">${tr('Deschide experimentul →')}</a>`;document.querySelectorAll('[data-concept]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.concept)===i)));}
document.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>concept(Number(b.dataset.concept)));
new IntersectionObserver(entries=>{for(const entry of entries){if((entry.target.id==='bench'&&state.active==='lab')||(entry.target.id==='field-stage'&&state.active==='states'))inView=entry.isIntersecting;}if(!inView)cancel();schedule();}).observe($('#bench'));
const fieldObserver=new IntersectionObserver(entries=>{if(state.active!=='states')return;inView=entries[0].isIntersecting;if(!inView)cancel();schedule();});fieldObserver.observe($('#field-stage'));
new ResizeObserver(refresh).observe($('#praxis-original'));
window.addEventListener('resize',refresh);window.addEventListener('praxis-course-presentation-change',refresh);
document.addEventListener('visibilitychange',()=>{cancel();schedule();});window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',schedule);
window.addEventListener('praxis-language-change',()=>{refresh();measurements();quizFeedback();checkedProblems.forEach(i=>checkProblem(i));concept(state.concept);$('#measurement-status').textContent='';});
if(document.documentElement.dataset.praxisStandalone==='true')document.querySelectorAll('[data-related]').forEach(a=>a.closest('p').hidden=true);
concept(0);setTab(location.hash.slice(1)||'lab',{hash:false});PraxisI18n.apply(document);
const integration=document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course='polarizarea-luminii';integration.dataset.title=title;
integration.onload=()=>{const intro=$('.praxis-lab-intro p');if(intro)intro.textContent=subtitle;$('.praxis-course-tools')?.append($('.pol-preferences'));PraxisI18n.apply(document);window.PraxisLabWorkspace?.mount();const picker=$('.praxis-course-sections');if(picker)picker.value=state.active;refresh();};
document.body.append(integration);
window.PraxisPolarization={setTab,snapshot:()=>({...state,settings:settings(),result:polarizers(settings())})};
