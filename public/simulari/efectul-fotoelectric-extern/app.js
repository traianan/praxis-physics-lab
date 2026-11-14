import {labNamespaces} from '../../shared/lab-locales.js';
import {photo,iv,estimateH,experimentSchema,defaults,HC,H,E} from './model.js';
import {pairs,title,subtitle,tabs,markup,problems,questions,concepts} from './content.js';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
$('#praxis-original').innerHTML=markup;
$('.pe-chart').append($('#status'),$('#summary'));
$('#law-cards').before($('[for=law]'),$('#law'));
const namespace='labs/efectul-fotoelectric-extern/ui';
await PraxisI18n.init({baseUrl:'../../locales/',namespaceList:labNamespaces['efectul-fotoelectric-extern'],embedded:{ro:{[namespace]:{messages:Object.fromEntries(pairs.map(([ro])=>[ro,ro]))}},en:{[namespace]:{messages:Object.fromEntries(pairs)}}}});
const tr=s=>PraxisI18n.tr(s),num=(v,d=2)=>v.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:d});
const state={settings:{...defaults},active:'lab',time:0,running:false,measurements:[],quizChecked:false,concept:0};
const schema=experimentSchema(PraxisValidation.z),motion=matchMedia('(prefers-reduced-motion: reduce)');
$('#reduced').checked=motion.matches;
function syncControls(){for(const [id,v]of Object.entries(state.settings))$('#'+id).value=v;const work=state.settings.work;$('#material').value=Math.abs(work-defaults.work)<1e-8?'manual':work===2.28?'sodium':work===4.3?'zinc':'custom';}
const text=(x,y,v,color='#edf7f1',size=14,anchor='middle')=>`<text x="${x}" y="${y}" fill="${color}" font-family="Segoe UI,Arial,sans-serif" font-size="${size*Math.max(1,parseFloat(getComputedStyle(document.documentElement).fontSize)/16)}" text-anchor="${anchor}">${v}</text>`;
const line=(x,y,xx,yy,color='#8caea5',extra='')=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${color}" stroke-width="2" ${extra}/>`;
function svg(id,w,h,html){const el=$('#'+id);el.dataset.noI18n='';el.setAttribute('viewBox',`0 0 ${w} ${h}`);el.innerHTML=html;}
function scene(){
 const s=photo(state.settings),W=400,Hh=325,ink='#254c45',ray='#d22282',mint='#168478',wiper=130+170*Math.abs(s.voltage)/9;
 const label=(x,y,v,size=15,anchor='middle')=>`<text x="${x}" y="${y}" fill="${ink}" font-family="Segoe UI,Arial,sans-serif" font-size="${size}" text-anchor="${anchor}">${v}</text>`;
 const wire=(x,y,xx,yy)=>line(x,y,xx,yy,ink);
 let out=`<rect width="400" height="325" rx="12" fill="#fffefa"/><path d="M70 85 H150 L225 48 L231 60 L178 85 H310 V165 H70 Z" fill="#eef6f1" stroke="${ink}" stroke-width="2"/>`;
 out+=wire(105,106,105,150)+wire(280,106,280,150)+label(90,151,'C')+label(294,151,'A')+label(73,77,'T')+label(245,65,'Q');
 out+=wire(105,132,40,132)+wire(40,132,40,298)+wire(280,132,350,132)+wire(350,132,350,151)+wire(350,179,350,220)+wire(350,220,wiper,220)+wire(wiper,220,wiper,246);
 out+=`<path d="M${wiper-5} 237 L${wiper} 247 L${wiper+5} 237" fill="none" stroke="${ink}" stroke-width="2"/>`;
 out+=wire(40,198,183,198)+wire(217,198,350,198)+wire(40,257,130,257)+`<rect x="130" y="249" width="170" height="16" fill="#fffefa" stroke="${ink}" stroke-width="2"/>`+wire(300,257,330,257)+wire(330,257,330,298)+wire(40,298,170,298)+wire(214,298,330,298);
 for(let i=0;i<3;i++){const x=174+i*14;out+=s.voltage<0?wire(x,286,x,310)+wire(x+6,291,x+6,305):wire(x,291,x,305)+wire(x+6,286,x+6,310);}
 out+=label(155,304,s.voltage<0?'+':'−',17)+label(231,304,s.voltage<0?'−':'+',17)+label(280,284,'R');
 for(const [x,y,name]of [[200,198,'V'],[350,165,'G']])out+=`<circle cx="${x}" cy="${y}" r="17" fill="#fffefa" stroke="${ray}" stroke-width="1.7"/>`+label(x,y+5,name,15);
 out+=label(200,232,num(s.voltage,2)+' V',13)+label(371,189,'µA',12);
 for(let i=0;i<3;i++){const dx=i*9;out+=line(263+dx,12+dx,105+dx,108+dx,ray,'opacity="'+(s.power>0?1:.15)+'"');out+=`<path d="M${105+dx} ${108+dx} l10 -2 l-5 -8 Z" fill="${ray}" opacity="${s.power>0?1:.15}"/>`;}
 out+=label(330,26,'hν',19)+label(330,46,num(s.wavelength)+' nm',13);
 if(s.power>0)for(let i=0;i<5;i++){const q=(state.time*.5+i/5)%1;out+=`<circle cx="${263-150*q}" cy="${12+96*q}" r="3" fill="${ray}"/>`;}
 out+=label(191,115,'e⁻ →',15);
 if(s.emitted>0)for(let i=0;i<8;i++){const q=(state.time*.32+i/8)%1,energy=s.kinetic*(i+.5)/8,passes=s.voltage>=0||energy>-s.voltage,distance=passes?173:173*Math.min(.9,energy/Math.max(.001,-s.voltage));out+=`<circle cx="${107+distance*(passes?q:Math.sin(Math.PI*q))}" cy="${124+(i%3)*9}" r="3" fill="${mint}"/>`;}
 svg('scene',W,Hh,out);
}
const plots=new Map();let plotKey='';
function graph(hostId='plot',forcedMode=null){
 const s=photo(state.settings),host=$('#'+hostId),rootSize=parseFloat(getComputedStyle(document.documentElement).fontSize),mode=forcedMode||$('#graph').value,width=Math.max(220,Math.floor(host.clientWidth)),height=Math.round((hostId==='plot'?210:260)*rootSize/16),currentMode=mode!=='energy';
 const xmin=currentMode?Math.min(-Math.max(.2,(s.stop||.4)*1.3),s.voltage<0?s.voltage*1.1:0):100,xmax=currentMode?Math.max(2.8,s.voltage*1.1):2200;
 const key=JSON.stringify([s.wavelength,s.power,s.work,s.efficiency,mode,width,rootSize,devicePixelRatio,PraxisI18n.locale,document.documentElement.dataset.courseColors,xmin,xmax,plotKey]);
 let entry=plots.get(hostId);
 if(!entry||entry.key!==key){
  entry?.plot.destroy();host.querySelector('svg')?.remove();const factor=(window.PraxisCanvasResolution?.ratio(width,height)||Math.max(2,devicePixelRatio*1.5))/devicePixelRatio,font=`${Math.round(rootSize*.8*factor)}px Segoe UI`;
  let xs,data,xLabel,yLabel;
  const colors=mode==='flux'?['#17685f','#9c691a','#c22278']:['#c22278'];
  if(currentMode){xs=Array.from({length:181},(_,i)=>xmin+(xmax-xmin)*i/180);xs.push(0,2);if(s.allowed)xs.push(-s.stop);xs=[...new Set(xs)].sort((a,b)=>a-b);data=[xs,...colors.map((_,i)=>xs.map(voltage=>photo({...state.settings,voltage,power:state.settings.power*(i+1)}).current))];xLabel='U (V)';yLabel='I (µA)';}
  else{xs=Array.from({length:101},(_,i)=>100+i*21);xs.push(s.thresholdFrequency/1e12);xs.sort((a,b)=>a-b);data=[xs,xs.map(v=>v<s.thresholdFrequency/1e12?null:Math.max(0,H*v*1e12/E-s.work))];xLabel='ν (THz)';yLabel='E (eV)';}
  host.style.height=height+'px';
  const plot=new PraxisUPlot.default({width:Math.round(width*factor),height:Math.round(height*factor),legend:{show:false},cursor:{show:true,drag:{x:false,y:false},points:{show:false}},select:{show:false},scales:{x:{time:false,range:()=>[xmin,xmax]},y:{range:(u,min,max)=>[0,Math.max(currentMode?.1:1,max*1.25)]}},axes:[{label:xLabel,font,labelFont:font,size:rootSize*1.8*factor,labelSize:rootSize*1.25*factor,space:Math.max(45,rootSize*1.5)*factor,values:(u,ticks)=>ticks.map(v=>num(v,1))},{label:yLabel,font,labelFont:font,size:rootSize*2.9*factor,labelSize:rootSize*1.2*factor,space:rootSize*2.4*factor,values:(u,ticks)=>ticks.map(v=>num(v,2))}],series:[{},...colors.map((stroke,i)=>({label:mode==='flux'?(i?`${i+1}Φ`:'Φ'):yLabel,stroke,width:2*factor}))]},data,host);
  plot.root.style.transform=`scale(${1/factor})`;plot.root.style.transformOrigin='top left';plot.root.style.pointerEvents='none';entry={plot,key,factor,colors};plots.set(hostId,entry);
 }
 const {plot,factor,colors}=entry;plot.setCursor({left:plot.valToPos(currentMode?s.voltage:s.frequency/1e12,'x'),top:-10});
 let overlay=host.querySelector('svg');if(!overlay){overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.classList.add('pe-graph-marks');overlay.setAttribute('aria-hidden','true');host.append(overlay);}overlay.setAttribute('viewBox',`0 0 ${width} ${height}`);
 const box=plot.over.getBoundingClientRect(),parent=host.getBoundingClientRect(),left=box.left-parent.left,top=box.top-parent.top,x=v=>left+plot.valToPos(v,'x')/factor,y=v=>top+plot.valToPos(v,'y')/factor;
 const lab=(xx,yy,main,index,color='#254c45',anchor='start')=>`<text x="${xx}" y="${yy}" fill="${color}" font-family="Segoe UI,Arial,sans-serif" font-size="${Math.max(11,rootSize*.7)}" text-anchor="${anchor}">${main}<tspan dy=".25em" font-size=".7em">${index}</tspan></text>`;
 let marks=currentMode?line(x(0),y(0),x(0),top,'#536f66','style="stroke-width:1"'):'';if(currentMode&&s.emitted>0){
  const max=mode==='flux'?3:1;marks+=line(x(2),y(0),x(2),y(s.saturation*max),'#84958f','stroke-dasharray="4 4"')+lab(x(2)+4,y(0)-6,'U','s');
  marks+=lab(x(-s.stop)+3,y(0)-7,'−U','f');
  for(let i=1;i<=max;i++){const sat=s.saturation*i;marks+=line(left,y(sat),x(2),y(sat),'#84958f','stroke-dasharray="4 4"')+lab(x(2)+5,y(sat)-7,mode==='flux'?(i===1?'Φ':i+'Φ'):'I',mode==='flux'?'':'s',colors[i-1]);}
  if(mode==='flux')for(let i=1;i<=3;i++)marks+=lab(left+3,y(s.saturation*i)-7,'I','s'+i,colors[i-1]);
  if(mode==='iv'){const i0=photo({...state.settings,voltage:0}).current;marks+=`<circle cx="${x(0)}" cy="${y(i0)}" r="3" fill="#c22278"/>`+lab(x(0)+6,y(i0)-8,'I','0');}
 }
 overlay.innerHTML=marks;
}

function energy(){const s=photo(state.settings),W=Math.max(270,$('#energy-budget').clientWidth),max=Math.max(s.photon,s.work,1);let out='';[['E','f',s.photon,'#9c691a'],['L','e',s.work,'#546c91'],['E','c,max',s.kinetic,'#17685f']].forEach(([letter,index,v,color],i)=>{const y=12+i*43;out+=text(5,y+17,`${letter}<tspan dy="4" font-size=".7em">${index}</tspan>`,'#18332f',16,'start')+`<rect x="65" y="${y}" width="${Math.max(0,(W-145)*v/max)}" height="23" rx="3" fill="${color}"/>`+text(W-3,y+17,num(v,3)+' eV','#18332f',14,'end');});svg('energy-budget',W,145,out);}
function laws(){graph('law-plot','flux');const a=state.settings,b={...a},kind=$('#law').value;if(kind==='power')b.power*=2;if(kind==='frequency')b.wavelength/=1.25;if(kind==='work')b.work+=1;$('#law-cards').innerHTML=[a,b].map((params,i)=>{const s=photo(params);return `<article class="pe-card"><h3>${i?'B':'A'}</h3><dl>${[[tr('Putere'),num(s.power)+' µW'],[tr('Frecvență'),num(s.frequency/1e12)+' THz'],['L<sub>e</sub>',num(s.work,3)+' eV'],[tr('Energie maximă'),num(s.kinetic,3)+' eV'],[tr('Curent de saturație'),num(s.saturation,3)+' µA'],[tr('Prag λ₀'),num(s.threshold)+' nm']].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="pe-status">${tr(s.emitted>0?'Emisie și colectare':'Fără emisie')}</p></article>`;}).join('');$('#law-conclusion').textContent=tr(kind==='power'?'Energia maximă și oprirea rămân neschimbate. Peste prag, la randament nenul, numărul electronilor crește cu puterea.':kind==='frequency'?'Frecvența schimbă energia unui foton și, la putere fixă, numărul fotonilor pe secundă.':'Un lucru de extracție mai mare reduce energia maximă și poate bloca emisia.');}
function reserveMessage(el,value,examples){
 const nodes=[value,...examples].map((text,i)=>{const span=document.createElement('span');span.textContent=text;span.style.gridArea='1 / 1';if(i){span.style.visibility='hidden';span.setAttribute('aria-hidden','true');}return span;});el.style.display='grid';el.replaceChildren(...nodes);
}
function refresh(){
 const s=photo(state.settings);for(const [id,v]of Object.entries(state.settings))$('#'+id+'-value').textContent=num(v,id==='work'?3:2);
 $('#current').textContent=num(s.current,3)+' µA';$('#kinetic').textContent=num(s.kinetic,3)+' eV';$('#stop').textContent=s.emitted>0?num(s.stop,3):'—';
 $('#status').textContent=tr(!s.power?'Lumina este stinsă':!s.efficiency?'Randament nul: nu sunt emiși electroni':Math.abs(s.photon-s.work)<1e-10?'La prag: energie cinetică nulă':!s.allowed?'Fără emisie: energia fotonului nu depășește pragul':s.current===0?'Electroni emiși, dar opriți de câmp':'Emisie și colectare');
 $('#summary').textContent=`λ₀ = ${num(s.threshold)} nm; hν = ${num(s.photon,3)} eV. `+tr(s.wavelength<380?'Ultraviolet (culoare simbolică)':s.wavelength>780?'Infraroșu (culoare simbolică)':'Lumină vizibilă');
 reserveMessage($('#status'),$('#status').textContent,[tr('Fără emisie: energia fotonului nu depășește pragul'),tr('Electroni emiși, dar opriți de câmp'),tr('Randament nul: nu sunt emiși electroni')]);
 reserveMessage($('#summary'),$('#summary').textContent,[`λ₀ = ${num(HC/.5)} nm; hν = ${num(HC/150,3)} eV. `+tr('Ultraviolet (culoare simbolică)'),`λ₀ = ${num(HC/.5)} nm; hν = ${num(HC/150,3)} eV. `+tr('Infraroșu (culoare simbolică)')]);
 $('#threshold-preset').disabled=s.threshold>=900;$('#stop-preset').disabled=s.emitted===0;
 $('#play').textContent=tr(state.running?'Pauză':'Pornește');$('#play').disabled=$('#reduced').checked;$('#play').setAttribute('aria-pressed',String(state.running));
 if(state.active==='lab'){scene();graph();energy();}if(state.active==='laws')laws();
}
let frame=null,previous=null,inView=true;
function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;}
function schedule(){if(frame===null&&!document.hidden&&inView&&state.running&&state.active==='lab'&&!$('#reduced').checked)frame=requestAnimationFrame(now=>{frame=null;state.time+=previous===null?0:Math.min(.05,(now-previous)/1000);previous=now;scene();schedule();});}
function changed(){state.running=false;state.time=0;cancel();refresh();}
function setTab(id,{hash=true,focus=false}={}){if(!tabs.some(([key])=>id===key))return;cancel();state.active=id;for(const[key]of tabs){$('#'+key).hidden=key!==id;$('#tab-'+key).setAttribute('aria-selected',String(key===id));$('#tab-'+key).tabIndex=key===id?0:-1;}const picker=$('.praxis-course-sections');if(picker)picker.value=id;if(hash)history.replaceState(null,'','#'+id);if(focus)$('#tab-'+id).focus();inView=true;refresh();schedule();}
for(const id of Object.keys(defaults))$('#'+id).oninput=()=>{state.settings[id]=Number($('#'+id).value);if(id==='work')$('#material').value='custom';changed();};
$('#material').onchange=()=>{const val={manual:defaults.work,sodium:2.28,zinc:4.3}[$('#material').value];if(val!==undefined){state.settings.work=val;$('#work').value=val;}changed();};
$('#stop-preset').onclick=()=>{state.settings.voltage=-photo(state.settings).stop;$('#voltage').value=state.settings.voltage;changed();};
$('#threshold-preset').onclick=()=>{state.settings.wavelength=Math.min(900,Math.ceil(photo(state.settings).threshold+10));$('#wavelength').value=state.settings.wavelength;changed();};
$('#graph').onchange=()=>refresh();$('#law').onchange=laws;$('#topic').onchange=()=>all('.theory-topic').forEach((el,i)=>el.hidden=i!==Number($('#topic').value));
$('#play').onclick=()=>{state.running=!state.running;cancel();refresh();schedule();};$('#step').onclick=()=>{state.running=false;cancel();state.time+=.2;refresh();};$('#reset').onclick=()=>{state.time=0;state.running=false;cancel();refresh();};
$('#reduced').onchange=()=>{if($('#reduced').checked)state.running=false;cancel();refresh();schedule();};motion.addEventListener('change',e=>{$('#reduced').checked=e.matches;$('#reduced').dispatchEvent(new Event('change'));});
document.addEventListener('click',e=>{const tab=e.target.closest('[data-tab]'),link=e.target.closest('[data-jump]');if(tab)setTab(tab.dataset.tab);if(link){e.preventDefault();setTab(link.dataset.jump,{focus:true});}});
$('.tabs').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;const i=tabs.findIndex(([id])=>id===state.active),target=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;e.preventDefault();setTab(tabs[target][0],{focus:true});});window.addEventListener('hashchange',()=>setTab(location.hash.slice(1),{hash:false}));
function records(){ $('#records').innerHTML=state.measurements.map(params=>{const s=photo(params);return `<tr>${[num(s.wavelength),num(s.frequency/1e12,3),num(s.work,3),s.emitted>0?num(s.stop,4):'—',num(s.saturation,4)].map(v=>`<td>${v}</td>`).join('')}</tr>`;}).join('');}
$('#record').onclick=()=>{if(state.measurements.length>=12){$('#record-status').textContent=tr('Maximum 12 măsurări.');return;}state.measurements.push({...state.settings});records();$('#record-status').textContent=tr('Stare înregistrată.');PraxisSound.play('event');};
$('#clear').onclick=()=>{state.measurements=[];records();$('#record-status').textContent='';$('#estimate-result').textContent='';};
$('#estimate').onclick=()=>{try{const [a,b]=state.measurements;if(!a||!b||!photo(a).emitted||!photo(b).emitted)throw Error();const r=estimateH(a,b);$('#estimate-result').textContent=`h = ${r.h.toExponential(6)} J·s; Lₑ = ${num(r.workEV,4)} eV.`;}catch{$('#estimate-result').textContent=tr('Alege primele două măsurări la frecvențe distincte peste prag, același material și lumină nenulă.');}};
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#csv').onclick=()=>{if(!state.measurements.length){$('#record-status').textContent=tr('Jurnal gol.');return;}download('wavelength_nm,frequency_Hz,work_eV,stopping_V,saturation_uA,power_uW,efficiency_percent\n'+state.measurements.map(p=>{const s=photo(p);return [s.wavelength,s.frequency,s.work,s.emitted>0?s.stop:'',s.saturation,s.power,s.efficiency].join(',');}).join('\n'),'text/csv;charset=utf-8','fotoelectric-masuratori.csv');};
$('#save').onclick=()=>download(JSON.stringify({version:1,lesson:'efectul-fotoelectric-extern',settings:state.settings,measurements:state.measurements},null,2),'application/json','fotoelectric-experiment.json');
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>65536)throw Error();const data=schema.parse(JSON.parse(await file.text()));state.settings={...data.settings};state.measurements=data.measurements.map(s=>({...s}));syncControls();changed();records();$('#estimate-result').textContent='';$('#record-status').textContent=tr('Experiment importat.');}catch{$('#record-status').textContent=tr('Fișier invalid; starea a rămas neschimbată.');}finally{e.target.value='';}};
const checked=new Set();function checkProblem(i){const raw=$('#answer-'+i).value.trim().replace(',','.'),v=Number(raw),valid=raw!==''&&Number.isFinite(v),correct=valid&&Math.abs(v-problems[i][2])<=Math.max(.005,problems[i][2]*.01);$('#feedback-'+i).textContent=tr(!valid?'Introdu un număr finit.':correct?'Corect.':'Mai încearcă.');checked.add(i);}
problems.forEach((_,i)=>$('#check-'+i).onclick=()=>checkProblem(i));
function quizFeedback(){let score=0;questions.forEach((q,i)=>{const chosen=$(`input[name=q${i}]:checked`),correct=chosen&&Number(chosen.value)===q[2];if(correct)score++;const el=$('#q-feedback-'+i);el.hidden=!state.quizChecked;el.textContent=state.quizChecked?tr(!chosen?'Alege un răspuns':correct?'Răspuns corect':'Revizuiește răspunsul')+'. '+tr(q[3]):'';});$('#quiz-score').textContent=state.quizChecked?`${score} / ${questions.length}`:'';}
$('#quiz-form').onsubmit=e=>{e.preventDefault();state.quizChecked=true;quizFeedback();};$('#quiz-form').onchange=()=>{if(state.quizChecked)quizFeedback();};$('#quiz-reset').onclick=()=>{$('#quiz-form').reset();state.quizChecked=false;quizFeedback();};
function concept(i){state.concept=i;const[name,,target,description]=concepts[i];$('#concept-detail').innerHTML=`<h3>${tr(name)}</h3><p>${tr(description)}</p><a href="#${target}" data-jump="${target}">${tr('Deschide experimentul →')}</a>`;all('[data-concept]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.concept)===i)));}all('[data-concept]').forEach(b=>b.onclick=()=>concept(Number(b.dataset.concept)));
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)cancel();schedule();}).observe($('#bench'));
let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(refresh);}).observe($('#praxis-original'));
window.addEventListener('resize',refresh);window.addEventListener('praxis-course-presentation-change',()=>{plotKey='';refresh();});
document.addEventListener('visibilitychange',()=>{cancel();schedule();});window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',schedule);
window.addEventListener('praxis-language-change',()=>{refresh();records();quizFeedback();checked.forEach(checkProblem);concept(state.concept);$('#record-status').textContent='';});
syncControls();concept(0);setTab(location.hash.slice(1)||'lab',{hash:false});PraxisI18n.apply(document);
const integration=document.createElement('script');
integration.src = '../../shared/course.js';
integration.dataset.course='efectul-fotoelectric-extern';integration.dataset.title=title;integration.dataset.subtitle=subtitle;
integration.onload=()=>{$('.praxis-course-tools')?.append($('.pe-preferences'));PraxisI18n.apply(document);window.PraxisLabWorkspace?.mount();const picker=$('.praxis-course-sections');if(picker)picker.value=state.active;refresh();};document.body.append(integration);
window.PraxisPhotoelectric={setTab,snapshot:()=>JSON.parse(JSON.stringify({...state,result:photo(state.settings)}))};
