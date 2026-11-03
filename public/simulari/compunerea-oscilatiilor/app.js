(()=>{'use strict';
const $=id=>document.getElementById(id), TWO=2*Math.PI;
let section='laborator',dirty=true;
const tr=s=>PraxisI18n.tr(s);
const canvas=$('plot'),wrap=canvas.parentElement,handles=[];
for(const sx of [-1,1])for(const sy of [-1,1]){const el=document.createElement('span');el.className='amplitude-handle';el.setAttribute('aria-hidden','true');wrap.append(el);handles.push({el,sx,sy});}
function prepare(canvas){
 const scale=(parseFloat(getComputedStyle(document.documentElement).fontSize)||16)/16;
 canvas.style.minWidth=(280*scale)+'px';
 const cssWidth=canvas.getBoundingClientRect().width||760;
 const w=Math.max(280,cssWidth/scale),h=canvas.id==='plot'?Math.max(320,w*600/760):185;
 canvas.dataset.logicalWidth=String(w);canvas.dataset.logicalHeight=String(h);
 return PraxisApplicationsCanvas.prepare(canvas);
}
const presets={same:[
['line0','Dreaptă: în fază',{ax:3,ay:3,wx:2,wy:2,phase:0},'În fază: segmentul traversează cadranele I și III (x și y au același semn).' ],
['line180','Dreaptă: opoziție de fază',{ax:3,ay:3,wx:2,wy:2,phase:180},'În opoziție de fază: segmentul traversează cadranele II și IV (x și y au semne opuse).' ],
['circle90','Cerc: diferență de fază 90°',{ax:3,ay:3,wx:2,wy:2,phase:90},'Cerc parcurs în sens orar pentru Δφ = +90°, cu axe Ox spre dreapta și Oy în sus.'],
['circleNeg','Cerc: diferență de fază −90°',{ax:3,ay:3,wx:2,wy:2,phase:-90},'Cerc parcurs în sens trigonometric (antiorar) pentru Δφ = −90°.'],
['ellipse90','Elipsă: amplitudini diferite',{ax:4,ay:2,wx:2,wy:2,phase:90},'Elipsă cu axele paralele cu Ox și Oy, parcursă în sens orar la Δφ = +90°.'],
['ellipse45','Elipsă înclinată: 45°',{ax:3.5,ay:2.5,wx:2,wy:2,phase:45},'Defazajul diferit de 0°, 90° și 180° produce o elipsă înclinată.']
],different:[
['oneTwo','Raport ωₓ : ωᵧ = 1 : 2',{ax:3,ay:3,wx:1.5,wy:3,phase:0},'O figură Lissajous închisă pentru pulsații comensurabile.'],
['twoThree','Raport ωₓ : ωᵧ = 2 : 3',{ax:3,ay:3,wx:2,wy:3,phase:90},'Figura formează bucle caracteristice raportului 2:3.'],
['threeFour','Raport ωₓ : ωᵧ = 3 : 4',{ax:3,ay:3,wx:3,wy:4,phase:0},'O figură periodică cu structură mai bogată.'],
['oneThree','Raport ωₓ : ωᵧ = 1 : 3',{ax:3,ay:3,wx:1.2,wy:3.6,phase:90},'Defazajul schimbă forma figurii, nu raportul pulsațiilor.'],
['fiveFour','Raport ωₓ : ωᵧ = 5 : 4',{ax:3,ay:2,wx:5,wy:4,phase:45},'O figură închisă cu amplitudini diferite.'],
['near','Pulsații apropiate: ωₓ ≈ ωᵧ',{ax:3,ay:3,wx:2,wy:2.1,phase:90},'Figura se modifică lent, iar perioada comună este lungă.']
]};
let mode='same',time=0,running=true,prev=null,trace=[],params={ax:3,ay:3,wx:2,wy:2,phase:90,speed:1};
const ids=['ax','ay','wx','wy','phase','speed'];
const ratioChoices=[['1:2',1,2],['2:1',2,1],['2:3',2,3],['3:2',3,2],['3:4',3,4],['4:3',4,3],['1:3',1,3],['3:5',3,5],['4:5',4,5]];
let audioContext=null,oscX=null,oscY=null,gainX=null,gainY=null,master=null,soundOn=false;
function soundFreq(w){return Math.min(920,Math.max(140,180*w));}
function soundUpdate(){if(!audioContext)return;const at=audioContext.currentTime;const volume=soundOn&&running&&!document.hidden&&section==='laborator'&&PraxisSound.enabled?Number($('soundVolume').value)/100:0;master.gain.setTargetAtTime(volume,at,.035);oscX.frequency.setTargetAtTime(soundFreq(params.wx),at,.04);oscY.frequency.setTargetAtTime(soundFreq(params.wy),at,.04);}
async function soundToggle(){if(!audioContext){const C=window.AudioContext||window.webkitAudioContext;if(!C){$('soundToggle').textContent='Audio indisponibil';return;}audioContext=new C();master=audioContext.createGain();master.gain.value=0;master.connect(audioContext.destination);for(const axis of ['x','y']){const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';gain.gain.value=.28;oscillator.connect(gain);gain.connect(master);oscillator.start();if(axis==='x'){oscX=oscillator;gainX=gain;}else{oscY=oscillator;gainY=gain;}}}soundOn=!soundOn;if(soundOn)PraxisSound.setEnabled(true);if(soundOn)await audioContext.resume();soundUpdate();$('soundToggle').textContent=soundOn?'♫ Dezactivează':'♪ Activează';$('soundToggle').setAttribute('aria-pressed',String(soundOn));}
function markRatio(){const ratio=params.wx/params.wy;document.querySelectorAll('#ratioButtons button').forEach(b=>b.classList.toggle('active',Math.abs(ratio-Number(b.dataset.ratio))<1e-8));}
function manualChanged(){get();updateLabels();clearTrail();$('presetDescription').textContent='Parametri modificați manual. Explorează forma traiectoriei.';$('preset').selectedIndex=-1;markRatio();updateInterpretation();soundUpdate();draw();}
function setRatio(a,b){const factor=Math.min(1,6/Math.max(a,b));put({wx:a*factor,wy:b*factor});$('preset').selectedIndex=-1;$('presetDescription').textContent=`Raport exact ωₓ : ωᵧ = ${a} : ${b}.`;markRatio();updateInterpretation();soundUpdate();draw();}
ratioChoices.forEach(([label,a,b])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.ratio=String(a/b);button.title=`Setează ωₓ : ωᵧ = ${label}`;button.addEventListener('click',()=>setRatio(a,b));$('ratioButtons').append(button);});
function get(){ids.forEach(k=>params[k]=Number($(k).value));if(mode==='same')params.wy=params.wx;}
function put(p){Object.entries(p).forEach(([k,v])=>{if($(k))$(k).value=v});get();updateLabels();clearTrail();soundUpdate();markRatio();}
function updateLabels(){ids.forEach(k=>{const v=k==='wy'&&mode==='same'?params.wx:params[k];$(k+'Out').textContent=k==='phase'?v+'°':k==='speed'?v.toFixed(1)+'×':v.toFixed(k.startsWith('w')?2:1)+(k.startsWith('w')?' rad/s':' u.a.')});}
function clearTrail(){trace=[];time=0;prev=null;}
function selectPreset(key){const found=presets[mode].find(p=>p[0]===key)||presets[mode][0];$('preset').value=found[0];$('presetDescription').textContent=found[3];put(found[2]);updateInterpretation();draw();}
function setMode(next){mode=next;document.querySelector('label[for=phase]').textContent=next==='same'?'Diferența de fază Δφ':'Faza inițială Oy, Δφ';$('sameTab').classList.toggle('selected',next==='same');$('differentTab').classList.toggle('selected',next==='different');$('sameTab').setAttribute('aria-pressed',next==='same');$('differentTab').setAttribute('aria-pressed',next==='different');$('wyGroup').style.display=next==='same'?'none':'';$('ratioPresets').hidden=next==='same';$('preset').innerHTML='';presets[mode].forEach(p=>{const el=document.createElement('option');el.value=p[0];el.textContent=p[1];$('preset').append(el)});selectPreset(presets[mode][0][0]);}
function xy(t){const d=params.phase*Math.PI/180;return [params.ax*Math.sin(params.wx*t),params.ay*Math.sin(params.wy*t+d)];}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function rationalApprox(r,max=12){let best={p:1,q:1,error:Infinity};for(let q=1;q<=max;q++){const p=Math.round(r*q);if(p<1)continue;const error=Math.abs(r-p/q);if(error<best.error)best={p,q,error};}return best;}
function ratioIntegers(){const a=Math.round(params.wx*100),b=Math.round(params.wy*100),g=gcd(a,b);return {m:a/g,n:b/g};}
function period(){const {m}=ratioIntegers();return TWO*m/params.wx;}
function contacts(){const T=period(),d=params.phase*Math.PI/180,events=[];if(T>120)return null;
for(const [axis,w,phase] of [['x',params.wx,0],['y',params.wy,d]]){for(let k=Math.ceil((phase-Math.PI/2)/Math.PI);;k++){const t=(Math.PI/2+k*Math.PI-phase)/w;if(t>=T-1e-9)break;if(t>=-1e-9){const [x,y]=xy(Math.max(0,t));events.push({axis,t:Math.max(0,t),x,y});}}}
const unique=axis=>events.filter(e=>e.axis===axis).filter((e,i,a)=>a.findIndex(v=>Math.hypot((v.x-e.x)/params.ax,(v.y-e.y)/params.ay)<1e-7)===i);
const vertical=unique('x'),horizontal=unique('y'),corner=e=>Math.abs(Math.abs(e.x)-params.ax)<1e-7&&Math.abs(Math.abs(e.y)-params.ay)<1e-7;return {events:events.sort((a,b)=>a.t-b.t),vertical,horizontal,tangentVertical:vertical.filter(e=>!corner(e)),tangentHorizontal:horizontal.filter(e=>!corner(e)),corners:vertical.filter(corner)};}
function nextExtremeTime(){const d=params.phase*Math.PI/180;return Math.min(...[[params.wx,0],[params.wy,d]].map(([w,ph])=>{const k=Math.floor((w*time+ph-Math.PI/2)/Math.PI+1e-8)+1;return (Math.PI/2+k*Math.PI-ph)/w;}));}
function stopAtExtreme(t){time=t;running=false;prev=null;$('play').textContent='▶ Continuă';const [x,y]=xy(t),vx=params.ax*params.wx*Math.cos(params.wx*t),vy=params.ay*params.wy*Math.cos(params.wy*t+params.phase*Math.PI/180);$('eventInfo').textContent=`Extrem la t = ${t.toFixed(4)} s. x = ${x.toFixed(3)}, y = ${y.toFixed(3)}. vₓ = ${vx.toFixed(3)}, vᵧ = ${vy.toFixed(3)}. ${Math.abs(vx)<1e-7&&Math.abs(vy)<1e-7?'Contact în colț. Viteza totală este zero.':Math.abs(vx)<1e-7?'Tangenta este verticală.':'Tangenta este orizontală.'}`;capture();soundUpdate();}
function symmetries(){const {m,n}=ratioIntegers(),d=params.phase*Math.PI/180,zero=a=>Math.abs(Math.sin(a/2))<1e-7;let ox=false,oy=false,center=m%2===1&&n%2===1;
if(m<=600)for(let k=0;k<m;k++){ox ||= zero(n*Math.PI/m+TWO*n*k/m+2*d);oy ||= zero(TWO*n*k/m+2*d-Math.PI);center ||= zero(TWO*n*k/m+2*d);}
return {ox,oy,center};}
window.PraxisCompositionPanelVariants=()=>{
 const savedParams=params,savedMode=mode,output={presetDescription:[],analysis:[],contactInfo:[],symmetryInfo:[],eventInfo:[]};
 const target=id=>({set textContent(value){(output[id]??=[]).push(value);},set innerHTML(value){(output[id]??=[]).push(value);}});
 try{
  for(const kind of ['same','different'])for(const preset of presets[kind]){mode=kind;params={...preset[2]};output.presetDescription.push(preset[3]);updateInterpretation(target);}
  for(const [wx,wy]of [[.05,.05],[.99,1],[5.99,6],[.05,6]]){mode='different';params={ax:5,ay:5,wx,wy,phase:45};updateInterpretation(target);}
  output.symmetryInfo.push('Simetrii: față de Ox, față de Oy, față de origine.');
  output.eventInfo.push('Extrem la t = 9999.9999 s. x = −5.000, y = −5.000. vₓ = −30.000, vᵧ = −30.000. Contact în colț. Viteza totală este zero.');
  return output;
 }finally{params=savedParams;mode=savedMode;}
};
function updateInterpretation(target=$){const d=params.phase*Math.PI/180;let html='';if(mode==='same'){
let cls;if(Math.abs(Math.sin(d))<1e-8)cls='segment de dreaptă';else if(Math.abs(params.ax-params.ay)<1e-8&&Math.abs(Math.cos(d))<1e-8)cls='cerc';else cls='elipsă';
html=`<p>Traiectorie: <strong>${cls}</strong>. Mișcarea este periodică, cu perioada <span data-composition-math="period">T = 2π/ω</span> = <strong>${(TWO/params.wx).toFixed(3)} s</strong>. ${cls==='segment de dreaptă'?(Math.cos(d)>0?'Segment în cadranele I și III: x și y au același semn.':'Segment în cadranele II și IV: x și y au semne opuse.'):(Math.sin(d)>0?'Sens orar, deoarece sin(Δφ) > 0.':'Sens antiorar, deoarece sin(Δφ) < 0.')} </p>`;
}else{const {m:q,n:p}=ratioIntegers(),r={p,q},T=period();html=`<p>Raportul pulsațiilor este <strong>${(params.wy/params.wx).toFixed(4)}</strong>. ${T<=120?`Raport rațional: <strong data-composition-math="ratio">ωᵧ/ωₓ = ${r.p}/${r.q}</strong>. Traiectoria se închide după <strong>${T.toFixed(3)} s</strong>.`:'Pentru valorile selectate nu este detectată o perioadă comună scurtă. Curba afișează un interval finit, nu o traiectorie completă.'} Raportul pulsațiilor determină structura figurii, iar diferența de fază modifică geometria sa.</p>`;}
const {m,n}=ratioIntegers(),T=period(),C=contacts(),S=symmetries();
target('contactInfo').textContent=C?`ωₓ : ωᵧ = ${m} : ${n}. Tangențe distincte pe verticale (paralele cu Oy): ${C.tangentVertical.length}, stânga ${C.tangentVertical.filter(e=>e.x<0).length}, dreapta ${C.tangentVertical.filter(e=>e.x>0).length}. Tangențe distincte pe orizontale (paralele cu Ox): ${C.tangentHorizontal.length}, jos ${C.tangentHorizontal.filter(e=>e.y<0).length}, sus ${C.tangentHorizontal.filter(e=>e.y>0).length}. Contacte în colț: ${C.corners.length}, numărate separat. În T = ${T.toFixed(3)} s există ${2*m} atingeri ale verticalelor și ${2*n} ale orizontalelor, incluzând reveniri și colțuri.`:`ωₓ : ωᵧ = ${m} : ${n}. T = ${T.toFixed(3)} s. Marcajele pentru perioada completă sunt omise peste 120 s. Curba arată un interval finit.`;
target('symmetryInfo').textContent='Simetrii: '+([S.ox?'față de Ox':null,S.oy?'față de Oy':null,S.center?'față de origine':null].filter(Boolean).join(', ')||'niciuna față de Ox, Oy sau origine')+'.';
target('analysis').innerHTML=html;if(window.PraxisMath&&target('analysis').querySelectorAll)for(const leaf of target('analysis').querySelectorAll('[data-composition-math]'))PraxisMath.set(leaf,leaf.textContent,{syntax:'plain'});target('plotSubtitle').textContent=mode==='same'?'Curbă periodică pentru ωₓ = ωᵧ':'Figura Lissajous pentru ωₓ ≠ ωᵧ';}
function line(ctx,a,b,c,d,color,width=1,dash=[]){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();ctx.restore()}
function point(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,TWO);ctx.fillStyle=color;ctx.fill()}
function plot(){const c=$('plot'),{g:ctx,w,h}=prepare(c);ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a1b2e';ctx.fillRect(0,0,w,h);const s=Math.min((w-100)/12,(h-72)/12),mx=w/2,my=h/2;
for(let n=-5;n<=5;n++){line(ctx,mx+n*s,24,mx+n*s,h-24,'#20364e',1);line(ctx,30,my+n*s,w-30,my+n*s,'#20364e',1)}line(ctx,25,my,w-25,my,'#6684a1',1.5);line(ctx,mx,17,mx,h-17,'#6684a1',1.5);
ctx.font='15px system-ui';ctx.fillStyle='#aec8e5';ctx.fillText('x',w-24,my-12);ctx.fillText('y',mx+12,22);ctx.fillText('O',mx+7,my+18);
const tr=t=>{const [x,y]=xy(t);return [mx+x*s,my-y*s]};const T=period();const duration=T<=120?T:mode==='same'?TWO/params.wx:Math.min(Math.max(20,time),65);
if($('showBox').checked){ctx.save();ctx.strokeStyle='#b5c4d5';ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.strokeRect(mx-params.ax*s,my-params.ay*s,2*params.ax*s,2*params.ay*s);ctx.restore();ctx.fillStyle='#b5c4d5';ctx.font='12px system-ui';ctx.fillText('y = +Aᵧ',mx+5,my-params.ay*s-8);ctx.fillText('y = −Aᵧ',mx+5,my+params.ay*s+18);ctx.fillText('x = −Aₓ',mx-params.ax*s-25,my+params.ay*s+34);ctx.fillText('x = +Aₓ',mx+params.ax*s-25,my+params.ay*s+34);}
if($('showBox').checked){ctx.save();ctx.strokeStyle=PraxisScientificColors.palette(PraxisCourseLocalization.colors).purple;ctx.fillStyle='#0a1b2e';ctx.lineWidth=2;for(const sx of [-1,1])for(const sy of [-1,1]){const x=mx+sx*params.ax*s,y=my+sy*params.ay*s;ctx.fillRect(x-7,y-7,14,14);ctx.strokeRect(x-7,y-7,14,14);}ctx.restore();}
if($('showSymmetry').checked){const S=symmetries();if(S.ox)line(ctx,30,my,w-30,my,PraxisScientificColors.palette(PraxisCourseLocalization.colors).purple,3,[8,6]);if(S.oy)line(ctx,mx,25,mx,h-25,PraxisScientificColors.palette(PraxisCourseLocalization.colors).purple,3,[8,6]);if(S.center){ctx.save();ctx.strokeStyle=PraxisScientificColors.palette(PraxisCourseLocalization.colors).purple;ctx.beginPath();ctx.arc(mx,my,12,0,TWO);ctx.stroke();ctx.restore();}}
ctx.fillStyle='#aec8e5';ctx.font='14px system-ui';ctx.fillText(`T_${window.PraxisI18n.tr('comun')} = ${T.toFixed(3)} s${T>120?' '+window.PraxisI18n.tr('• interval afișat limitat'):''}`,24,22);
if($('showFull').checked){ctx.beginPath();const N=Math.max(1000,Math.min(5000,Math.round(duration*80)));for(let i=0;i<=N;i++){const [x,y]=tr(duration*i/N);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle=PraxisScientificColors.palette(PraxisCourseLocalization.colors).blue;ctx.lineWidth=2;ctx.stroke()}
if($('showTrace').checked&&trace.length){ctx.beginPath();trace.forEach((p,i)=>{const x=mx+p[0]*s,y=my-p[1]*s;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.strokeStyle=PraxisScientificColors.palette(PraxisCourseLocalization.colors).orange;ctx.lineWidth=2.7;ctx.stroke()}
if($('showContacts').checked){const C=contacts();if(C)for(const e of [...C.vertical,...C.horizontal]){const corner=Math.abs(Math.abs(e.x)-params.ax)<1e-7&&Math.abs(Math.abs(e.y)-params.ay)<1e-7;point(ctx,mx+e.x*s,my-e.y*s,5,corner?'#ffffff':e.axis==='x'?PraxisScientificColors.palette(PraxisCourseLocalization.colors).green:PraxisScientificColors.palette(PraxisCourseLocalization.colors).yellow);}}
const [x,y]=xy(time),[px,py]=tr(time);
if($('showDirection').checked){const vx=params.ax*params.wx*Math.cos(params.wx*time),vy=params.ay*params.wy*Math.cos(params.wy*time+params.phase*Math.PI/180),v=Math.hypot(vx,vy);if(v>1e-7){const dx=vx/v,dy=-vy/v,ex=px+32*dx,ey=py+32*dy;line(ctx,px,py,ex,ey,'#ffffff',2);line(ctx,ex,ey,ex-9*dx+5*dy,ey-9*dy-5*dx,'#ffffff',2);line(ctx,ex,ey,ex-9*dx-5*dy,ey-9*dy+5*dx,'#ffffff',2);}}
if($('showGuides').checked){line(ctx,px,py,px,my,PraxisScientificColors.palette(PraxisCourseLocalization.colors).blue,1.4,[6,5]);line(ctx,px,py,mx,py,PraxisScientificColors.palette(PraxisCourseLocalization.colors).orange,1.4,[6,5]);point(ctx,px,my,4,PraxisScientificColors.palette(PraxisCourseLocalization.colors).blue);point(ctx,mx,py,4,PraxisScientificColors.palette(PraxisCourseLocalization.colors).orange)}
ctx.shadowBlur=22;ctx.shadowColor=PraxisScientificColors.palette(PraxisCourseLocalization.colors).red;point(ctx,px,py,7,PraxisScientificColors.palette(PraxisCourseLocalization.colors).red);ctx.shadowBlur=0;
$('timeValue').textContent=time.toFixed(2)+' s';$('xValue').textContent=x.toFixed(2);$('yValue').textContent=y.toFixed(2);$('ratioValue').textContent=(params.wy/params.wx).toFixed(3);}
function wave(id,which){const c=$(id),{g:ctx,w,h}=prepare(c);ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a1b2e';ctx.fillRect(0,0,w,h);const mid=h/2,span=8.5,scale=56/5;for(let i=0;i<=8;i++)line(ctx,i*w/8,7,i*w/8,h-7,'#213b54');line(ctx,0,mid,w,mid,'#6885a3');let center=time-1.7;let omega=which==='x'?params.wx:params.wy,amp=which==='x'?params.ax:params.ay,phase=which==='x'?0:params.phase*Math.PI/180;const evalY=t=>mid-amp*Math.sin(omega*t+phase)*scale;ctx.beginPath();for(let i=0;i<=w;i+=2){const t=center+(i/w)*span;const y=evalY(t);i?ctx.lineTo(i,y):ctx.moveTo(i,y)}ctx.strokeStyle=which==='x'?PraxisScientificColors.palette(PraxisCourseLocalization.colors).blue:PraxisScientificColors.palette(PraxisCourseLocalization.colors).orange;ctx.lineWidth=2.5;ctx.stroke();const cursor=(1.7/span)*w;line(ctx,cursor,10,cursor,h-10,'#bccbde',1,[4,5]);point(ctx,cursor,evalY(time),5,PraxisScientificColors.palette(PraxisCourseLocalization.colors).red);ctx.fillStyle='#a7bdd2';ctx.font='12px system-ui';ctx.fillText('t',w-15,mid-8);ctx.fillText(which==='x'?'x':'y',8,18);}
function draw(){dirty=true;if(section!=='laborator'||document.hidden)return;plot();wave('xWave','x');wave('yWave','y');const w=+canvas.dataset.logicalWidth,h=+canvas.dataset.logicalHeight,s=Math.min((w-100)/12,(h-72)/12),scale=canvas.getBoundingClientRect().width/w;for(const {el,sx,sy}of handles){el.hidden=!$('showBox').checked;el.style.left=((w/2+sx*params.ax*s)*scale)+'px';el.style.top=((h/2+sy*params.ay*s)*scale)+'px';}dirty=false;}
function capture(){const [x,y]=xy(time);trace.push([x,y]);if(trace.length>14400)trace.shift();}
function advance(target){const start=time,steps=Math.max(1,Math.ceil((target-start)*120));for(let i=1;i<=steps;i++){time=start+(target-start)*i/steps;capture();}}
function animate(stamp){
 if(document.hidden||section!=='laborator'){prev=null;requestAnimationFrame(animate);return;}
 const dt=prev===null?0:Math.min((stamp-prev)/1000,.05);prev=stamp;
 if(running&&dt>0){const target=time+dt*params.speed,next=nextExtremeTime();if($('didactic').checked&&target>=next){advance(next);stopAtExtreme(next);}else advance(target);dirty=true;}
 if(dirty)draw();requestAnimationFrame(animate);
}
ids.forEach(k=>$(k).addEventListener('input',manualChanged));
for(const k of ['wx','wy'])for(const [suffix,delta] of [['Minus',-.01],['Plus',.01]])$(k+suffix).addEventListener('click',()=>{const el=$(k);el.value=(Math.max(Number(el.min),Math.min(Number(el.max),Math.round((Number(el.value)+delta)*100)/100))).toFixed(2);manualChanged();});
$('soundToggle').addEventListener('click',soundToggle);$('soundVolume').addEventListener('input',()=>{$('soundVolumeOut').textContent=$('soundVolume').value+'%';soundUpdate();});
document.addEventListener('visibilitychange',()=>{prev=null;soundUpdate();if(audioContext){if(document.hidden)audioContext.suspend();else if(soundOn&&PraxisSound.enabled)audioContext.resume().catch(()=>{});}});
window.addEventListener('praxis-sound-change',()=>{if(!PraxisSound.enabled){soundOn=false;$('soundToggle').textContent='♪ Activează';$('soundToggle').setAttribute('aria-pressed','false');}soundUpdate();});
window.addEventListener('pagehide',()=>{if(audioContext)audioContext.suspend();});
$('preset').addEventListener('change',()=>selectPreset($('preset').value));$('sameTab').onclick=()=>setMode('same');$('differentTab').onclick=()=>setMode('different');$('reset').onclick=()=>selectPreset(presets[mode][0][0]);$('restart').onclick=()=>{clearTrail();draw()};$('play').onclick=()=>{running=!running;$('play').textContent=running?'Ⅱ Pauză':'▶ Continuă';prev=null;soundUpdate()};$('step').onclick=()=>{running=false;$('play').textContent='▶ Continuă';advance(time+.08*params.speed);soundUpdate();draw()};['showTrace','showGuides','showFull','showBox','showContacts','showDirection','showSymmetry'].forEach(k=>$(k).addEventListener('change',draw));$('save').onclick=()=>{draw();const a=document.createElement('a');a.href=$('plot').toDataURL('image/png');a.download='figura_lissajous.png';a.click()};$('nextExtreme').onclick=()=>{stopAtExtreme(nextExtremeTime());draw();};setMode('same');
function switchSection(next){section=next==='teorie'?'teorie':'laborator';document.querySelectorAll('[data-composition-section]').forEach(el=>el.hidden=el.dataset.compositionSection!==section);document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===section;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});prev=null;soundUpdate();draw();}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.tab;switchSection(b.dataset.tab);}));
window.addEventListener('hashchange',()=>switchSection(location.hash.slice(1)));
window.addEventListener('resize',draw);window.addEventListener('praxis-course-presentation-change',draw);
window.addEventListener('praxis-language-change',()=>{updateLabels();updateInterpretation();draw();});
new ResizeObserver(draw).observe($('plot').parentElement);
if(matchMedia('(max-width:850px)').matches)document.querySelector('details.controls').open=false;
let drag=null;
function graphPosition(event){const rect=canvas.getBoundingClientRect(),w=+canvas.dataset.logicalWidth,h=+canvas.dataset.logicalHeight;return {x:(event.clientX-rect.left)*w/rect.width,y:(event.clientY-rect.top)*h/rect.height,w,h,s:Math.min((w-100)/12,(h-72)/12),scale:rect.width/w};}
wrap.addEventListener('pointerdown',event=>{if(event.button!==0||!$('showBox').checked||drag!==null)return;const p=graphPosition(event),distance=Math.min(...[-1,1].flatMap(sx=>[-1,1].map(sy=>Math.hypot(p.x-p.w/2-sx*params.ax*p.s,p.y-p.h/2-sy*params.ay*p.s)*p.scale)));if(distance>34)return;drag=event.pointerId;wrap.setPointerCapture(event.pointerId);event.preventDefault();});
wrap.addEventListener('pointermove',event=>{if(drag!==event.pointerId)return;const p=graphPosition(event);$('ax').value=String(Math.max(.2,Math.min(5,Math.abs(p.x-p.w/2)/p.s)));$('ay').value=String(Math.max(.2,Math.min(5,Math.abs(p.y-p.h/2)/p.s)));manualChanged();event.preventDefault();});
canvas.addEventListener('keydown',event=>{const direction={ArrowLeft:['ax',-.1],ArrowRight:['ax',.1],ArrowDown:['ay',-.1],ArrowUp:['ay',.1]}[event.key];if(!direction)return;const [id,delta]=direction;$(id).value=String(Math.max(.2,Math.min(5,params[id]+delta)));manualChanged();event.preventDefault();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])wrap.addEventListener(type,event=>{if(drag!==event.pointerId)return;drag=null;if(wrap.hasPointerCapture(event.pointerId))wrap.releasePointerCapture(event.pointerId);});
window.CompositionLab={get params(){return {...params};},get time(){return time;},get running(){return running;},get section(){return section;},xy,period,contacts,symmetries,nextExtremeTime,setMode,selectPreset,draw};
switchSection(location.hash.slice(1));requestAnimationFrame(animate);
})();
