import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withFavicon} from './favicon.mjs';
const root=new URL('../',import.meta.url),id='compunerea-oscilatiilor',title='Compunerea oscilațiilor';
const read=p=>readFile(new URL(p,root),'utf8');
const write=async(p,text)=>{await mkdir(new URL('./',new URL(p,root)),{recursive:true});await writeFile(new URL(p,root),text);};
const source='compunerea_oscilatiilor/',files=['index.html','teorie.html','style.css','app.js','README.txt'],hashes={};
for(const file of files)hashes[file]=createHash('sha256').update(await read(source+file)).digest('hex');
const main=html=>html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
let lab=main(await read(source+'index.html')).replace('class="tabs"','class="mode-tabs"').replace('role="tablist"','role="group"');
lab=lab.replace(/([12])\. (Pulsații)/g,'$2').replace('<footer>','<footer><a href="'+id+'.zip">Descarcă lecția offline</a><br>');
lab=lab.replace('<aside class="panel controls">','<details class="panel controls" open><summary>Parametri și comenzi</summary>').replace('</aside>','</details>').replaceAll('class="fine-control"','class="fine-control praxis-range-stepper"');
lab=lab.replace('<div class="plotwrap">','<p class="hint" id="amplitudeHint">Trage colțurile violet ale dreptunghiului pentru a modifica amplitudinile, cu degetul sau mouse-ul. Cu graficul selectat, săgețile ←/→ modifică Aₓ, iar ↓/↑ modifică Aᵧ.</p><div class="plotwrap">').replace('id="plot" width=','id="plot" tabindex="0" aria-describedby="amplitudeHint" width=');
lab=lab.replace(/(<canvas id="[xy]Wave"[^>]*><\/canvas>)/g,'<div class="wavewrap">$1</div>');
const actions=lab.match(/<div class="actions">[\s\S]*?<\/div>/)[0];lab=lab.replace(actions,'').replace('<div class="plotwrap">',actions+'<div class="plotwrap">');
let theory=main(await read(source+'teorie.html')).replace(/<h3>(\d+)\. /g,'<h3>').replaceAll('într o','într-o').replaceAll('Într o','Într-o').replace('Punctul roz','Punctul roșu').replace('href="index.html"','href="#laborator"');
theory=theory.replace('<article class="panel">',await read('scripts/adaptations/composition-history.html')+'<article class="panel">');
// Mark only authored formula leaves; prose, controls and links retain their DOM.
const mathAttr=s=>s.replace(/\bTcomun\b/g,'T_comun').replaceAll('Aₓ','A_x').replaceAll('Aᵧ','A_y').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
theory=theory.replace(/<div class="formula">([\s\S]*?)<\/div>/g,(_,lines)=>'<div class="formula">'+lines.split(/<br\s*\/?>/i).map(line=>'<span data-science-math="plain" data-science-source="'+mathAttr(line)+'">'+line+'</span>').join('<br>')+'</div>');
let app=(await read(source+'app.js')).replaceAll('\r\n','\n');
function patch(before,after){if(!app.includes(before))throw Error('Source changed: '+before.slice(0,75));app=app.replace(before,after);}
patch('perioada T = 2π/ω = <strong>', 'perioada <span data-composition-math="period">T = 2π/ω</span> = <strong>');
patch('<strong>ωᵧ/ωₓ = ${r.p}/${r.q}</strong>', '<strong data-composition-math="ratio">ωᵧ/ωₓ = ${r.p}/${r.q}</strong>');
patch("$('analysis').innerHTML=html;", "$('analysis').innerHTML=html;if(window.PraxisMath&&$('analysis').querySelectorAll)for(const leaf of $('analysis').querySelectorAll('[data-composition-math]'))PraxisMath.set(leaf,leaf.textContent,{syntax:'plain'});");
patch("ctx.fillText(`T comun = ${T.toFixed(3)} s${T>120?' • interval afișat limitat':''}`,24,22);", "ctx.fillText(`T_${window.PraxisI18n.tr('comun')} = ${T.toFixed(3)} s${T>120?' '+window.PraxisI18n.tr('• interval afișat limitat'):''}`,24,22);");
patch("const $=id=>document.getElementById(id), TWO=2*Math.PI;",`const $=id=>document.getElementById(id), TWO=2*Math.PI;
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
}`);
// Preserve original geometry; render in logical coordinates at displayed CSS size × DPR.
patch("const c=$('plot'),ctx=c.getContext('2d'),w=c.width,h=c.height;","const c=$('plot'),{g:ctx,w,h}=prepare(c);");
patch("const c=$(id),ctx=c.getContext('2d'),w=c.width,h=c.height;","const c=$(id),{g:ctx,w,h}=prepare(c);");
// Analytical paths can be resampled without changing the stored trail or its clock.
patch('const N=Math.max(1000,Math.min(5000,Math.round(duration*80)));','const density=Math.max(1,Math.abs(ctx.getTransform().a)),N=Math.max(1000,Math.ceil(w*density*2),Math.ceil(duration*Math.max(params.wx,params.wy)*64));');
patch('for(let i=0;i<=w;i+=2){const t=center+(i/w)*span;', 'const N=Math.max(Math.ceil(w*Math.max(1,Math.abs(ctx.getTransform().a))),Math.ceil(span*omega*64));for(let sample=0;sample<=N;sample++){const i=w*sample/N,t=center+(i/w)*span;');
patch("if($('showSymmetry').checked)",`if($('showBox').checked){ctx.save();ctx.strokeStyle=PraxisScientificColors.palette(PraxisCourseLocalization.colors).purple;ctx.fillStyle='#0a1b2e';ctx.lineWidth=2;for(const sx of [-1,1])for(const sy of [-1,1]){const x=mx+sx*params.ax*s,y=my+sy*params.ay*s;ctx.fillRect(x-7,y-7,14,14);ctx.strokeRect(x-7,y-7,14,14);}ctx.restore();}
if($('showSymmetry').checked)`);
// Semantic scientific colours come from the common registry, including the legends.
const colors={'#42b8e2':'blue','#48bfea':'blue','#53cdf6':'blue','#82d6f9':'blue','#ffb66c':'orange','#ffb76c':'orange','#faaf63':'orange','#ff6f9e':'red','#65e5a0':'green','#ffe16a':'yellow','#bd8cff':'purple'};
for(const [color,role]of Object.entries(colors))app=app.replaceAll("'"+color+"'","PraxisScientificColors.palette(PraxisCourseLocalization.colors)."+role);
// The library mute remains authoritative; tones also stop on pause, hidden page and theory.
patch('soundOn&&running?',"soundOn&&running&&!document.hidden&&section==='laborator'&&PraxisSound.enabled?");
patch('soundOn=!soundOn;if(soundOn)', 'soundOn=!soundOn;if(soundOn)PraxisSound.setEnabled(true);if(soundOn)');
patch("document.addEventListener('visibilitychange',()=>{if(audioContext){if(document.hidden)audioContext.suspend();else if(soundOn)audioContext.resume();}});", "document.addEventListener('visibilitychange',()=>{prev=null;soundUpdate();if(audioContext){if(document.hidden)audioContext.suspend();else if(soundOn&&PraxisSound.enabled)audioContext.resume().catch(()=>{});}});\nwindow.addEventListener('praxis-sound-change',()=>{if(!PraxisSound.enabled){soundOn=false;$('soundToggle').textContent='♪ Activează';$('soundToggle').setAttribute('aria-pressed','false');}soundUpdate();});\nwindow.addEventListener('pagehide',()=>{if(audioContext)audioContext.suspend();});");
patch('function draw(){plot();wave',"function draw(){dirty=true;if(section!=='laborator'||document.hidden)return;plot();wave");
patch("wave('yWave','y');}",`wave('yWave','y');const w=+canvas.dataset.logicalWidth,h=+canvas.dataset.logicalHeight,s=Math.min((w-100)/12,(h-72)/12),scale=canvas.getBoundingClientRect().width/w;for(const {el,sx,sy}of handles){el.hidden=!$('showBox').checked;el.style.left=((w/2+sx*params.ax*s)*scale)+'px';el.style.top=((h/2+sy*params.ay*s)*scale)+'px';}dirty=false;}`);
const oldFrame=app.slice(app.indexOf('function animate('),app.indexOf('\nids.forEach'));
patch(oldFrame,`function advance(target){const start=time,steps=Math.max(1,Math.ceil((target-start)*120));for(let i=1;i<=steps;i++){time=start+(target-start)*i/steps;capture();}}
function animate(stamp){
 if(document.hidden||section!=='laborator'){prev=null;requestAnimationFrame(animate);return;}
 const dt=prev===null?0:Math.min((stamp-prev)/1000,.05);prev=stamp;
 if(running&&dt>0){const target=time+dt*params.speed,next=nextExtremeTime();if($('didactic').checked&&target>=next){advance(next);stopAtExtreme(next);}else advance(target);dirty=true;}
 if(dirty)draw();requestAnimationFrame(animate);
}`);
patch("time+=.08*params.speed;capture();", "advance(time+.08*params.speed);");
patch("if(trace.length>4200)","if(trace.length>14400)");
patch("setMode('same');requestAnimationFrame(animate);",`setMode('same');
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
switchSection(location.hash.slice(1));requestAnimationFrame(animate);`);
// Share the exact pure source calculations with regression tests, without DOM or audio.
const functions=['xy','gcd','ratioIntegers','period','contacts','symmetries'];
const extract=name=>{const start=app.indexOf('function '+name+'('),next=app.indexOf('\nfunction ',start+1);return app.slice(start,next);};
await write('public/shared/composition-model.js',`/* Pure calculations extracted reproducibly from the preserved source. */\n(()=>{window.PraxisCompositionModel=params=>{const TWO=2*Math.PI;\n${functions.map(extract).join('\n')}\nreturn {xy,period,contacts,symmetries};};})();\n`);
// Reuse the actual renderer to measure every preset without touching live DOM,
// controls, animation, audio or export state. Restore model variables synchronously.
const interpretationStart=app.indexOf('function updateInterpretation()');
const interpretationEnd=app.indexOf('\nfunction line(',interpretationStart);
if(interpretationStart<0||interpretationEnd<0)throw new Error('Composition interpretation target changed');
app=app.slice(0,interpretationStart)+app.slice(interpretationStart,interpretationEnd).replace('function updateInterpretation(){','function updateInterpretation(target=$){').replaceAll("$('","target('")+app.slice(interpretationEnd);
app=app.replace('function updateInterpretation(target=$){',`window.PraxisCompositionPanelVariants=()=>{
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
function updateInterpretation(target=$){`);
await write('public/simulari/'+id+'/app.js',app);
// JSON is embedded so the same page works in the autonomous offline archive.
const ns=['common','courses/shared','composition'],embedded={ro:{},en:{}};
for(const lang of ['ro','en'])for(const name of ns)embedded[lang][name]=JSON.parse(await read('public/locales/'+name+'/'+lang+'.json'));
const css=['design-system/tokens.css','design-system/components.css','design-system/lab-layout.css','design-system/laboratory.css','design-system/compact.css','shared/course.css','shared/composition.css'];
const js=['sound.js','lab-header.js','canvas-typography.js','scientific-colors.js','course-localization.js','first-law-applications-canvas.js'];
const head=css.map(p=>'<link rel="stylesheet" href="../../'+p+'">').join('')+'<script src="../../shared/i18n.js"></script><script>PraxisI18n.initEmbedded('+JSON.stringify({namespaceList:ns,embedded}).replaceAll('</script','<\\/script')+');</script>'+js.map(p=>'<script src="../../shared/'+p+'"></script>').join('');
let html='<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' — Praxis</title>'+head+'</head><body data-praxis-course="'+id+'" data-praxis-laboratory="true"><main id="praxis-original"><div class="tabs" role="tablist" aria-label="Secțiunea lecției"><button class="tab active" role="tab" data-tab="laborator">Laborator</button><button class="tab" role="tab" data-tab="teorie">Teorie și explicații</button></div><section data-composition-section="laborator">'+lab+'</section><section class="theory" data-composition-section="teorie" hidden>'+theory+'</section></main><script src="app.js"></script><script src="../../shared/course.js" data-course="'+id+'" data-title="'+title+'"></script></body></html>';
for(const [color,role]of Object.entries(colors))html=html.replaceAll(color,'var(--praxis-science-'+role+')');
html=html.replaceAll('<h3>Traiectoria punctului','<h3 data-content-type="simulation">Traiectoria punctului').replaceAll('<h3>Oscilația','<h3 data-content-type="graph">Oscilația');
await write('public/simulari/'+id+'/index.html',withFavicon(html));
await write('public/simulari/'+id+'/teorie.html','<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=index.html#teorie"><title>Teorie</title></head><body><a href="index.html#teorie">Teorie și explicații</a></body></html>');
const simulation={id,chapter:'sunete-si-unde',title,subtitle:'Oscilații perpendiculare și figuri Lissajous',description:'Pulsații egale și diferite, 12 situații particulare, nouă rapoarte rapide, contacte, simetrii, opriri la extreme, sunet și export PNG, cu șapte teme teoretice.',href:'./simulari/'+id+'/index.html',image:'./assets/'+id+'.svg',alt:'Figură Lissajous și oscilațiile componente pe două axe perpendiculare',tags:['Oscilații','Lissajous','Experimente','Offline'],keywords:'compunerea oscilatiilor armonice perpendiculare lissajous faza elipsa cerc raport pulsatii simetrii tangente',status:'available'};
let catalog=await read('public/catalog.js');if(!catalog.includes('"id":"'+id+'"'))await write('public/catalog.js',catalog.replace('\n];\nexport const normalize',',\n '+JSON.stringify(simulation)+'\n];\nexport const normalize'));
for(const lang of ['ro','en']){const p='public/locales/chapters/sunete-si-unde/'+lang+'.json',data=JSON.parse(await read(p));data.simulations[id]=lang==='ro'?Object.fromEntries(['title','subtitle','description','alt','tags'].map(k=>[k,simulation[k]])):{title:'Superposition of oscillations',subtitle:'Perpendicular oscillations and Lissajous figures',description:'Equal and different angular frequencies, 12 presets, nine quick ratios, contacts, symmetries, pauses at extrema, sound and PNG export, with seven theory topics.',alt:'Lissajous figure and its component oscillations along perpendicular axes',tags:['Oscillations','Lissajous','Experiments','Offline']};await write(p,JSON.stringify(data,null,2)+'\n');}
await write('docs/imported-composition.json',JSON.stringify({id,source,hashes,canvases:3,presets:12,quickRatios:9,theoryTopics:7,historicalNotes:1},null,2)+'\n');
console.log('Integrat: '+title);
