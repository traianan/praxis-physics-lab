import {labNamespaces} from '../../shared/lab-locales.js';
import {flight,sample,trajectory,optimalAngle,safetyHeight,safetyRange} from './model.js';
import {pairs,title,subtitle,tabs,modes,markup,problems,questions,concepts} from './content.js';
const $=s=>document.querySelector(s);
$('#praxis-original').innerHTML=markup;
// Keep long theory readable as selectable topics, retaining all original DOM nodes.
const theoryCards=[...document.querySelectorAll('#theory article')];
const theoryLabel=document.createElement('label');theoryLabel.htmlFor='theory-topic';theoryLabel.textContent='Subiect';
const theoryPicker=document.createElement('select');theoryPicker.id='theory-topic';
theoryCards.forEach((card,i)=>{card.hidden=i!==0;theoryPicker.add(new Option(card.querySelector('h2').textContent,String(i)));});
theoryPicker.onchange=()=>theoryCards.forEach((card,i)=>card.hidden=i!==Number(theoryPicker.value));
const theoryTools=document.createElement('div');theoryTools.className='gm-topic-picker';theoryTools.append(theoryLabel,theoryPicker);$('#theory').prepend(theoryTools);
const namespace='labs/miscarea-in-camp-gravitational/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['miscarea-in-camp-gravitational'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},en:{[namespace]:{messages:Object.fromEntries(pairs)}}}});
const tr=s=>PraxisI18n.tr(s),num=(v,d=2)=>v.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:d});
const read=id=>Number($('#'+id).value);
const state={active:'lab',time:0,compareTime:0,running:false,compareRunning:false,measurements:[],quizChecked:false,concept:0};
const motion=matchMedia('(prefers-reduced-motion: reduce)');$('#reduced').checked=motion.matches;
function settings(){const mode=$('#mode').value;return {height:read('height'),speed:mode==='fall'?0:read('speed'),angle:mode==='fall'||mode==='down'?-90:mode==='up'?90:mode==='horizontal'?0:read('angle'),g:read('gravity'),mass:read('mass')};}
function comparison(){const common={height:read('compare-height'),g:read('gravity')},speed=read('compare-speed'),angle=read('compare-angle');return $('#comparison').value==='horizontal'?[flight({...common,speed:0}),flight({...common,speed,angle:0})]:[flight({...common,speed,angle}),flight({...common,speed,angle:90-angle})];}
const palette=()=>document.documentElement.dataset.courseColors==='vivid'?['#75d7ff','#ffd064','#ffb2d8']:['#9ad7ce','#e8b85c','#e5b6ce'];
const text=(x,y,value,fill='#edf7f1',size=14,anchor='middle')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Segoe UI,Arial,sans-serif" font-size="${size}" text-anchor="${anchor}">${value}</text>`;
const line=(x1,y1,x2,y2,color,width=1,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
function arrow(x,y,dx,dy,color){const length=Math.hypot(dx,dy);if(length<.1)return '';const a=Math.atan2(dy,dx),ex=x+dx,ey=y+dy;return line(x,y,ex,ey,color,2.5)+`<path d="M${ex-7*Math.cos(a-.45)},${ey-7*Math.sin(a-.45)} L${ex},${ey} L${ex-7*Math.cos(a+.45)},${ey-7*Math.sin(a+.45)}" fill="none" stroke="${color}" stroke-width="2.5"/>`;}
function svg(id,w,h,html){const el=$('#'+id);el.dataset.noI18n='';el.setAttribute('viewBox',`0 0 ${w} ${h}`);el.innerHTML=html;}
function drawScene(id,flights,time,{envelope=false,vectors=false}={}){
 const el=$('#'+id),W=Math.max(280,el.clientWidth),H=id==='compare-scene'?300:Math.max(190,el.clientHeight),p=palette();
 const first=flights[0],show=envelope&&first.speed>0;
 const xMax=Math.max(5,...flights.map(f=>f.range),show?safetyRange(first):0),yMax=Math.max(5,...flights.map(f=>f.maxHeight),show?safetyHeight(first,0):0);
 const scale=Math.min((W-100)/xMax,(H-75)/yMax),left=Math.max(48,(W-xMax*scale)/2),bottom=H-45;
 const x=v=>left+v*scale,y=v=>bottom-v*scale;
 let html='';
 for(let k=0;k<=4;k++){const yy=yMax*k/4,xx=xMax*k/4;html+=line(left,y(yy),x(xMax),y(yy),'#315c55',1)+text(left-8,y(yy)+4,num(yy,1),'#c4d8d1',12,'end');if(k>0)html+=text(x(xx),bottom+19,num(xx,1),'#c4d8d1',12);}
 html+=line(left,bottom,W-12,bottom,'#b8d4c8',2)+line(left,15,left,bottom,'#b8d4c8',1)+text(W-15,H-5,'x (m)','#e9f5ed',12,'end')+text(7,14,'y (m)','#e9f5ed',12,'start');
 const points=f=>trajectory(f).map(s=>`${x(s.x)},${y(s.y)}`).join(' ');
 if(show){
  const pts=Array.from({length:151},(_,i)=>{const xx=safetyRange(first)*i/150;return `${x(xx)},${y(Math.max(0,safetyHeight(first,xx)))}`;}).join(' ');
  html+=`<polygon points="${left},${bottom} ${pts}" fill="${p[1]}" fill-opacity=".055"/>`;
  for(const a of [15,30,45,60,75])html+=`<polyline points="${points(flight({...first,angle:a}))}" fill="none" stroke="#7ca99e" stroke-width="1" opacity=".4"/>`;
  html+=`<polyline points="${pts}" fill="none" stroke="${p[1]}" stroke-width="2" stroke-dasharray="6 5"/>`;
 }
 const velocityScale=Math.min(3,60/Math.max(1,...flights.map(f=>f.impactSpeed),...flights.map(f=>f.speed))),accelScale=40/first.g;
 flights.forEach((f,i)=>{
  const s=sample(f,time),px=x(s.x),py=y(s.y),c=p[i];
  html+=`<polyline points="${points(f)}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
  for(let k=0;k<9;k++){const dot=sample(f,f.duration*k/8);html+=`<circle cx="${x(dot.x)}" cy="${y(dot.y)}" r="2" fill="${c}"/>`;}
  html+=`<circle cx="${px}" cy="${py}" r="6" fill="${c}" stroke="#fffefa" stroke-width="1.5"/>`;
  if(flights.length>1)html+=text(px+(i?10:-10),py-10,i?'B':'A',c,14,i?'start':'end');
  if(vectors){
   html+=arrow(px,py,s.vx*velocityScale,0,'#bfe2fa')+arrow(px,py,0,-s.vy*velocityScale,'#c8dda9')+arrow(px,py,s.vx*velocityScale,-s.vy*velocityScale,p[1]);
   html+=arrow(px-12,py,0,f.g*accelScale,p[2]);
  }
 });
 svg(id,W,H,html);
 if(id==='scene')$('#vector-scale').textContent=`${tr('Viteză:')} ${num(velocityScale)} px / (m/s). ${tr('Accelerație:')} ${num(accelScale)} px / (m/s²).`;
}
let plot=null,plotKey='';
function graph(){
 const f=flight(settings()),key=JSON.stringify([settings(),$('#graph').value,Math.round($('#plot').clientWidth),PraxisI18n.locale,document.documentElement.dataset.courseColors,devicePixelRatio]);
 if(key!==plotKey){
  plot?.destroy();const field=$('#graph').value,data=trajectory(f),label=field==='y'?'y (m)':field==='vy'?'vᵧ (m/s)':'vₓ (m/s)';
  // uPlot needs a nondegenerate x domain, even for a zero-duration launch.
  const time=data.map(s=>s.t),values=data.map(s=>s[field]);if(!f.duration){time[time.length-1]=.001;}
  const rootSize=parseFloat(getComputedStyle(document.documentElement).fontSize);
  const plotHeight=$('#praxis-original').clientWidth/rootSize>68?270:130;
  const cssWidth=Math.max(250,Math.floor($('#plot').clientWidth)),cssHeight=Math.round(plotHeight*rootSize/16);
  const ratio=window.PraxisCanvasResolution?.ratio(cssWidth,cssHeight)||Math.max(2,devicePixelRatio*1.5),factor=ratio/devicePixelRatio;
  const font=`${Math.round(rootSize*.8*factor)}px Segoe UI`;
  $('#plot').style.height=cssHeight+'px';
  plot=new PraxisUPlot.default({width:Math.round(cssWidth*factor),height:Math.round(cssHeight*factor),legend:{show:false},cursor:{show:true,drag:{x:false,y:false},points:{show:false}},select:{show:false},scales:{x:{time:false}},axes:[{label:'t (s)',font,labelFont:font,size:28*factor,labelSize:16*factor,values:(u,ticks)=>ticks.map(v=>num(v,1))},{label,font,labelFont:font,size:48*factor,labelSize:18*factor,values:(u,ticks)=>ticks.map(v=>num(v,1))}],series:[{}, {label,stroke:document.documentElement.dataset.courseColors==='vivid'?'#0d6179':'#17685f',width:2*factor}]},[time,values],$('#plot'));
  plot.root.style.transform=`scale(${1/factor})`;plot.root.style.transformOrigin='top left';plot.root.style.pointerEvents='none';plotKey=key;
 }
 plot.setCursor({left:plot.valToPos(state.time,'x'),top:-10});
}
function drawEnergy(){const f=flight(settings()),s=sample(f,state.time),W=Math.max(300,$('#energy-bars').clientWidth),max=Math.max(1,s.energy),right=W-80;let html='';
 [['E_c',s.kinetic,'#17685f'],['E_p',s.potential,'#9c691a'],['E',s.energy,'#546c91']].forEach(([name,value,c],i)=>{const yy=10+i*40;html+=text(5,yy+15,name,'#18332f',16,'start')+`<rect x="48" y="${yy}" width="${Math.max(0,(right-48)*value/max)}" height="24" rx="3" fill="${c}"/>`+text(W-5,yy+17,num(value,1)+' J','#18332f',14,'end');});svg('energy-bars',W,140,html);$('#energy-values').textContent=`t = ${num(s.t)} s; E = ${num(s.energy)} J; vₓ = ${num(s.vx)} m/s; vᵧ = ${num(s.vy)} m/s.`;}
function refresh(){
 const f=flight(settings()),s=sample(f,state.time),mode=$('#mode').value;
 $('#speed-control').hidden=mode==='fall';$('#angle-control').hidden=mode!=='oblique';$('#envelope-control').hidden=mode!=='oblique';
 for(const [id,unit] of [['height',' m'],['speed',' m/s'],['angle','°'],['mass',' kg'],['compare-height',' m'],['compare-speed',' m/s'],['compare-angle','°']])$('#'+id+'-value').textContent=num(read(id))+unit;
 for(const id of ['timeline','energy-time']){$('#'+id).value=f.duration?state.time/f.duration*1000:0;$('#'+id+'-value').textContent=num(s.t)+' s';}
 $('#time-read').textContent=num(s.t);$('#height-read').textContent=num(s.y);$('#speed-read').textContent=num(s.speed);
 $('#flight-summary').textContent=`T = ${num(f.duration)} s; b = ${num(f.range)} m; hₘₐₓ = ${num(f.maxHeight)} m.`;
 $('#flight-status').textContent=tr(!f.duration?'Lansare la sol fără zbor deasupra solului.':s.ended?'Imediat înainte de impact.':f.apexTime>0&&Math.abs(s.t-f.apexTime)<1e-6?'La vârf: componenta verticală este zero.':mode==='oblique'&&$('#envelope').checked&&!f.speed?'Parabola necesită v₀ > 0.':'');
 $('#play').textContent=tr(state.running?'Pauză':'Pornește');$('#compare-play').textContent=tr(state.compareRunning?'Pauză':'Pornește');
 for(const [id,on]of [['play',state.running],['compare-play',state.compareRunning]]){$('#'+id).disabled=$('#reduced').checked;$('#'+id).setAttribute('aria-pressed',String(on));}
 if(state.active==='lab'){drawScene('scene',[f],state.time,{envelope:mode==='oblique'&&$('#envelope').checked,vectors:$('#vectors').checked});graph();}
 if(state.active==='energy')drawEnergy();
 if(state.active==='compare'){
  const fs=comparison(),end=Math.max(...fs.map(f=>f.duration));$('#compare-angle-control').hidden=$('#comparison').value!=='angles';$('#compare-time').value=end?state.compareTime/end*1000:0;$('#compare-time-value').textContent=num(state.compareTime)+' s';
  drawScene('compare-scene',fs,state.compareTime);
  $('#compare-result').textContent=fs.map((f,i)=>`${i?'B':'A'}: T = ${num(f.duration)} s; b = ${num(f.range)} m; y = ${num(sample(f,state.compareTime).y)} m`).join(' | ')+'. '+tr($('#comparison').value==='horizontal'?'Aceeași înălțime la același moment.':'Bătăi egale numai la niveluri egale.');
 }
}
let frame=null,previous=null,inView=true;
function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;}
function shouldRun(){return !document.hidden&&inView&&!$('#reduced').checked&&((state.active==='lab'&&state.running)||(state.active==='compare'&&state.compareRunning));}
function schedule(){if(frame===null&&shouldRun())frame=requestAnimationFrame(tick);}
function advance(dt,compare=false){const end=compare?Math.max(...comparison().map(f=>f.duration)):flight(settings()).duration;const time=compare?'compareTime':'time',running=compare?'compareRunning':'running';state[time]=Math.min(end,state[time]+dt);if(state[time]>=end){state[running]=false;PraxisSound.play('event');}}
function tick(now){frame=null;if(!shouldRun()){previous=null;return;}const dt=previous===null?0:Math.min(.05,(now-previous)/1000);previous=now;advance(dt*read('rate'),state.active==='compare');refresh();schedule();}
function setTab(id,{hash=true,focus=false}={}){if(!tabs.some(([key])=>key===id))return;cancel();state.active=id;for(const[key]of tabs){$('#'+key).hidden=key!==id;$('#tab-'+key).setAttribute('aria-selected',String(key===id));$('#tab-'+key).tabIndex=key===id?0:-1;}const picker=$('.praxis-course-sections');if(picker)picker.value=id;if(hash)history.replaceState(null,'','#'+id);if(focus)$('#tab-'+id).focus();inView=true;refresh();schedule();}
document.addEventListener('click',e=>{const tab=e.target.closest('[data-tab]'),link=e.target.closest('[data-jump]');if(tab)setTab(tab.dataset.tab);if(link){e.preventDefault();setTab(link.dataset.jump,{focus:true});}});
$('.tabs').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;const i=tabs.findIndex(([id])=>id===state.active),target=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;e.preventDefault();setTab(tabs[target][0],{focus:true});});
window.addEventListener('hashchange',()=>setTab(location.hash.slice(1),{hash:false}));
function launchChanged(){state.time=0;state.running=false;cancel();refresh();}
$('#mode').onchange=()=>{const mode=$('#mode').value;$('#height').value=mode==='up'||mode==='oblique'?0:20;$('#speed').value=20;$('#angle').value=45;launchChanged();};
for(const id of ['height','speed','angle'])$('#'+id).oninput=launchChanged;
$('#gravity').onchange=()=>{state.compareTime=0;state.compareRunning=false;launchChanged();};
for(const id of ['vectors','envelope','graph'])$('#'+id).onchange=refresh;
$('#mass').oninput=refresh;
$('#play').onclick=()=>{if(state.time>=flight(settings()).duration)state.time=0;state.running=!state.running;cancel();refresh();schedule();};
$('#step').onclick=()=>{state.running=false;cancel();advance(.1);refresh();};
$('#reset').onclick=()=>{state.time=0;state.running=false;cancel();refresh();};
for(const [id,value]of [['apex','apexTime'],['impact','duration']])$('#'+id).onclick=()=>{state.running=false;state.time=flight(settings())[value];cancel();refresh();};
for(const id of ['timeline','energy-time'])$('#'+id).oninput=()=>{state.running=false;state.time=read(id)/1000*flight(settings()).duration;cancel();refresh();};
for(const id of ['comparison','compare-height','compare-speed','compare-angle'])$('#'+id).addEventListener(id==='comparison'?'change':'input',()=>{state.compareTime=0;state.compareRunning=false;cancel();refresh();});
$('#compare-play').onclick=()=>{if(state.compareTime>=Math.max(...comparison().map(f=>f.duration)))state.compareTime=0;state.compareRunning=!state.compareRunning;cancel();refresh();schedule();};
$('#compare-step').onclick=()=>{state.compareRunning=false;cancel();advance(.1,true);refresh();};
$('#compare-reset').onclick=()=>{state.compareTime=0;state.compareRunning=false;cancel();refresh();};
$('#compare-time').oninput=()=>{state.compareTime=read('compare-time')/1000*Math.max(...comparison().map(f=>f.duration));state.compareRunning=false;cancel();refresh();};
$('#reduced').onchange=()=>{if($('#reduced').checked){state.running=false;state.compareRunning=false;}cancel();refresh();schedule();};
motion.addEventListener('change',e=>{$('#reduced').checked=e.matches;$('#reduced').dispatchEvent(new Event('change'));});
function measurements(){$('#measurements').innerHTML=state.measurements.map(s=>`<tr>${[s.t,s.x,s.y,s.vx,s.vy,s.energy].map(v=>`<td>${num(v,3)}</td>`).join('')}</tr>`).join('');}
$('#measure').onclick=()=>{if(state.measurements.length>=12){$('#measurement-status').textContent=tr('Maximum 12 măsurări. Exportă sau șterge tabelul.');return;}const params=settings();state.measurements.push({...sample(flight(params),state.time),...params});measurements();$('#measurement-status').textContent=tr('Măsurare salvată.');PraxisSound.play('event');};
$('#clear').onclick=()=>{state.measurements=[];measurements();$('#measurement-status').textContent='';};
$('#export').onclick=()=>{if(!state.measurements.length){$('#measurement-status').textContent=tr('Nu există măsurători de exportat.');return;}const keys=['t','x','y','vx','vy','kinetic','potential','energy','mass','height','speed','angle','g'];const csv='t_s,x_m,y_m,vx_m_s,vy_m_s,Ec_J,Ep_J,E_J,mass_kg,h0_m,v0_m_s,angle_deg,g_m_s2\n'+state.measurements.map(s=>keys.map(k=>s[k].toFixed(6)).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='miscarea-in-camp-gravitational-masuratori.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const checked=new Set();
function checkProblem(i,sound=false){const raw=$('#answer-'+i).value.trim().replace(',','.'),v=Number(raw),valid=raw!==''&&Number.isFinite(v),correct=valid&&Math.abs(v-problems[i][2])<=.05;$('#feedback-'+i).textContent=tr(!valid?'Introdu un număr finit.':correct?'Corect.':'Mai încearcă. Verifică unitățile și indiciul.');checked.add(i);if(correct&&sound)PraxisSound.play('event');}
document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>checkProblem(Number(b.dataset.check),true));
function quizFeedback(){let score=0;questions.forEach((q,i)=>{const chosen=$(`input[name=q${i}]:checked`),correct=chosen&&Number(chosen.value)===q[2];if(correct)score++;const el=$('#q-feedback-'+i);el.hidden=!state.quizChecked;el.textContent=state.quizChecked?tr(!chosen?'Alege un răspuns':correct?'Răspuns corect':'Revizuiește răspunsul')+'. '+tr(q[3]):'';});$('#quiz-score').textContent=state.quizChecked?`${score} / ${questions.length}`:'';return score;}
$('#quiz-form').onsubmit=e=>{e.preventDefault();state.quizChecked=true;quizFeedback();};$('#quiz-form').onchange=()=>{if(state.quizChecked)quizFeedback();};$('#quiz-reset').onclick=()=>{$('#quiz-form').reset();state.quizChecked=false;quizFeedback();};
function concept(i){state.concept=i;const[name,,target,description]=concepts[i];$('#concept-detail').innerHTML=`<h3>${tr(name)}</h3><p>${tr(description)}</p><a href="#${target}" data-jump="${target}">${tr('Deschide experimentul →')}</a>`;document.querySelectorAll('[data-concept]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.concept)===i)));}
document.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>concept(Number(b.dataset.concept)));
for(const [id,tab]of [['bench','lab'],['compare-stage','compare']])new IntersectionObserver(entries=>{if(state.active!==tab)return;inView=entries[0].isIntersecting;if(!inView)cancel();schedule();}).observe($('#'+id));
let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(refresh);}).observe($('#praxis-original'));
window.addEventListener('resize',refresh);window.addEventListener('praxis-course-presentation-change',()=>{plotKey='';refresh();});
document.addEventListener('visibilitychange',()=>{cancel();schedule();});window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',schedule);
window.addEventListener('praxis-language-change',()=>{refresh();measurements();quizFeedback();checked.forEach(i=>checkProblem(i));concept(state.concept);$('#measurement-status').textContent='';});
if(document.documentElement.dataset.praxisStandalone==='true')document.querySelectorAll('[data-related]').forEach(a=>a.closest('p').hidden=true);
concept(0);setTab(location.hash.slice(1)||'lab',{hash:false});PraxisI18n.apply(document);
const integration=document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course='miscarea-in-camp-gravitational';integration.dataset.title=title;integration.dataset.subtitle=subtitle;
integration.onload=()=>{$('.praxis-course-tools')?.append($('.gm-preferences'));PraxisI18n.apply(document);window.PraxisLabWorkspace?.mount();const picker=$('.praxis-course-sections');if(picker)picker.value=state.active;refresh();};
document.body.append(integration);
window.PraxisGravityMotion={setTab,snapshot:()=>({...state,settings:settings(),flight:flight(settings()),result:sample(flight(settings()),state.time),comparison:comparison().map(f=>({...f,result:sample(f,state.compareTime)}))})};
