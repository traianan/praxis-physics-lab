// Local Chrome, private profile, built-in CDP client. No additional packages.
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from '../serve.mjs';
const root=path.resolve('D:/ProiecteAI/tmp/global-math'),port=9331;
await mkdir(root,{recursive:true});
const server=createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const requestedBase=process.argv.find(a=>a.startsWith('--base='))?.slice(7);
const base=requestedBase?new URL(requestedBase).href.replace(/\/$/,''):'http://127.0.0.1:'+server.address().port;
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[
 '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',
 '--user-data-dir='+path.join(root,'profile'), '--remote-debugging-port='+port,'about:blank'
],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let stderr='';chrome.stderr.on('data',v=>stderr+=v);chrome.on('error',error=>stderr+=error.message);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket,serial=0;const pending=new Map(),events=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},process.argv.includes('--all-resolution')?120000:15000);pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});socket.send(JSON.stringify({id,method,params}));});}
try{
 let tabs;for(let i=0;i<80;i++){try{tabs=await fetch('http://127.0.0.1:'+port+'/json/list').then(r=>r.json());if(tabs.length)break;}catch{}await delay(100);}
 if(!tabs?.length)throw Error('Chrome did not expose its local endpoint: '+stderr.slice(-2000));
 socket=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',message=>{const data=JSON.parse(message.data);if(data.id){const p=pending.get(data.id);if(p){pending.delete(data.id);data.error?p.reject(Error(JSON.stringify(data.error))):p.resolve(data.result);}}else events.push(data);});
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`
 window.__mutationAudit=[];const NativeObserver=MutationObserver;
 window.__canvasAudit=[];const nativeFillText=CanvasRenderingContext2D.prototype.fillText;
 window.__canvasIndices=[];
 CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(/\\bNaN\\b|undefined/.test(String(text))&&!window.__canvasAudit.includes(String(text))&&window.__canvasAudit.length<20)window.__canvasAudit.push(String(text));if(/(?<![\\p{L}\\p{N}_])[A-Za-zΑ-ω]_(?:\\{[^}]+\\}|[\\p{L}\\p{N}]+)/u.test(String(text))&&!window.__canvasIndices.includes(String(text))&&window.__canvasIndices.length<50)window.__canvasIndices.push(String(text));return nativeFillText.call(this,text,...args);};
 window.MutationObserver=class extends NativeObserver{constructor(fn){const stack=new Error().stack;let count=0,start=performance.now();super((records,observer)=>{const now=performance.now();if(now-start>100){count=0;start=now;}if(++count>600){window.__mutationAudit.push({stack,targets:records.slice(0,4).map(r=>({tag:r.target.nodeName,cls:r.target.className}))});observer.disconnect();return;}fn(records,observer);});}};
 try{localStorage.setItem('praxis-privacy-choice-v1',JSON.stringify({version:1,value:'necessary',time:Date.now()}));localStorage.setItem('praxis-language','ro');localStorage.setItem('praxis-course-text-size','100');}catch{}
 `});
 const evaluate=async source=>{const r=await send('Runtime.evaluate',{expression:'('+source+')()',returnByValue:true,awaitPromise:true,timeout:process.argv.includes('--all-resolution')?110000:10000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const ids=['calcul-vectorial','calorimetrie','compunerea-oscilatiilor','figuri-chladni','interactii-atomice','miscarea-circulara-uniforma','miscarea-curbilinie-plana','miscarea-rectilinie','motoare-termice','notiuni-termodinamice','oglinzi-si-lentile','oscilator-mecanic','oscilatori-mecanici-cuplati','principiile-mecanicii-newtoniene','principiul-i-al-termodinamicii','principiul-i-aplicatii','transformari-stare-agregare','unde-mecanice','viteza-si-acceleratia'];
 const only=process.argv.find(a=>a.startsWith('--course='))?.split('=')[1];
 const subset=process.argv.find(a=>a.startsWith('--courses='))?.slice(10).split(',');
 if(subset?.some(id=>!ids.includes(id)))throw Error('Unknown course subset');
 const reportSuffix=only?'-'+only:subset?'-subset':'';
 const from=process.argv.find(a=>a.startsWith('--from='))?.slice(7);
 if(from&&!ids.includes(from))throw Error('Unknown resume course: '+from);
 const motionControls=process.argv.includes('--motion-controls');
 const indexAudit=process.argv.includes('--indices'),thorough=process.argv.includes('--matrix');
 const indexProbe=indexAudit?await readFile('scripts/qa/visible-indices.browser.js','utf8'):null;
 const inspect=`()=>({errors:[...document.querySelectorAll('.science-math-error,.wave-math-error,.katex-error')].map(e=>({text:e.textContent,title:e.title})),canvas:window.__canvasAudit,overflow:document.documentElement.scrollWidth>innerWidth+2,mutations:window.__mutationAudit,math:document.querySelectorAll('math,.fraction,.frac').length})`;
 const results=from?JSON.parse(await readFile(path.join(root,'all-resolution.json'),'utf8')).filter(r=>ids.indexOf(r.id)<ids.indexOf(from)):[];
 for(const id of ids.filter(id=>(!only||id===only)&&(!subset||subset.includes(id))&&(!from||ids.indexOf(id)>=ids.indexOf(from)))){
  events.length=0;await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  const nav=await send('Page.navigate',{url:base+'/simulari/'+id+'/'});if(nav.errorText)throw Error(id+': '+nav.errorText);
  let loaded=false;for(let attempt=0;attempt<60;attempt++){await delay(150);loaded=await evaluate('()=>document.readyState==="complete"&&!!window.PraxisMath&&document.title.length>0');if(loaded)break;}
  if(!loaded)throw Error(id+' did not finish loading');
  const result=await evaluate(`()=>({id:${JSON.stringify(id)},url:location.href,ready:document.readyState,title:document.title,api:!!window.PraxisMath,math:document.querySelectorAll('.science-math').length,errors:[...document.querySelectorAll('.science-math-error,.wave-math-error,.katex-error')].map(e=>({text:e.textContent,title:e.title})),overflow:document.documentElement.scrollWidth>innerWidth+2,mutations:window.__mutationAudit,tabs:[...document.querySelectorAll('#praxis-original [role=tab],#praxis-original button[data-tab],#praxis-original .tabs a')].map(e=>({text:e.textContent.trim(),id:e.id,tab:e.dataset.tab,href:e.getAttribute('href')}))})`);
  result.exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text);
  results.push(result);console.log(JSON.stringify(result));
  if(process.argv.includes('--diffraction')&&id==='unde-mecanice'){
   result.diffraction=await evaluate(await readFile('scripts/qa/diffraction.browser.js','utf8'));console.log(JSON.stringify({diffraction:result.diffraction}));
   for(const ratio of [.3,1]){await evaluate('()=>{const e=document.querySelector("[data-diffraction-width]");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(e,"'+ratio+'");e.dispatchEvent(new Event("input",{bubbles:true}));}');await delay(120);const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,'diffraction-'+ratio+'.png'),Buffer.from(shot.data,'base64'));}
   for(const [width,height,dpr,size,language]of [[1366,768,1,100,'ro'],[1920,1080,2,100,'en'],[3840,2160,1,100,'ro'],[1024,768,1.25,100,'en'],[390,844,3,100,'ro'],[1366,768,1,200,'ro']]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
    await evaluate('async()=>{await PraxisI18n.setLanguage('+JSON.stringify(language)+');const s=document.querySelector(".praxis-course-settings select");s.value='+JSON.stringify(String(size))+';s.dispatchEvent(new Event("change",{bubbles:true}));}');await delay(100);
    const layout=await evaluate('()=>{const r=document.querySelector(".diffraction-boundary");return {overflow:document.documentElement.scrollWidth>innerWidth+2,bottom:r.getBoundingClientRect().bottom,controls:[...r.querySelectorAll("button,input")].filter(e=>e.checkVisibility()).map(e=>e.getBoundingClientRect().height),errors:r.querySelectorAll(".wave-math-error,.katex-error").length};}');
    console.log(JSON.stringify({diffractionDisplay:{width,height,dpr,size,language,...layout}}));if((width===1366&&size===100&&layout.bottom>height)||layout.overflow||layout.errors||layout.controls.some(h=>h<43))throw Error('Diffraction layout failed');
    if(width===1366&&size===100){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,'diffraction.png'),Buffer.from(shot.data,'base64'));}
   }
   await evaluate('()=>{const s=document.querySelector(".praxis-course-settings select");s.value="100";s.dispatchEvent(new Event("change",{bubbles:true}));}');
  }
  if(process.argv.includes('--huygens')&&id==='unde-mecanice'){
   result.huygens=await evaluate(await readFile('scripts/qa/huygens.browser.js','utf8'));
   result.huygensLayout=await evaluate(`()=>[...document.querySelector('[data-huygens-kind=refraction] .huygens-controls').children].map(e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return {tag:e.tagName,class:e.className,height:b.height,flex:s.flex,minHeight:s.minHeight,margin:s.margin,display:s.display,inline:e.getAttribute('style')};})`);
   console.log(JSON.stringify({huygensLayout:result.huygensLayout}));
   const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,'huygens-refraction.png'),Buffer.from(shot.data,'base64'));
   console.log(JSON.stringify({huygens:result.huygens}));
   result.huygensDisplay=[];
   for(const [width,height,dpr,size,language]of [[1366,768,1,100,'ro'],[1366,768,1,100,'en'],[1920,1080,2,100,'en'],[3840,2160,1,100,'ro'],[1024,768,1.25,100,'en'],[390,844,3,100,'ro'],[1366,768,1,200,'ro']]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
    await evaluate(`async()=>{await PraxisI18n.setLanguage(${JSON.stringify(language)});const s=document.querySelector('.praxis-course-settings select');s.value=${JSON.stringify(String(size))};s.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(100);
    for(const kind of ['reflection','refraction']){
     const display=await evaluate(`async()=>{const r=document.querySelector('[data-huygens-kind=${kind}]');window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:r.closest('.lesson-part-content').id}));await new Promise(q=>setTimeout(q,80));window.scrollTo(0,0);const b=r.getBoundingClientRect();return {kind:${JSON.stringify(kind)},bounds:{top:b.top,bottom:b.bottom,height:b.height},overflow:document.documentElement.scrollWidth>innerWidth+2,errors:r.querySelectorAll('.wave-math-error').length,controls:[...r.querySelectorAll('button,select,input')].filter(e=>e.checkVisibility()).map(e=>{const b=e.getBoundingClientRect();return {width:b.width,height:b.height};})};}`);
     Object.assign(display,{width,height,dpr,size,language});result.huygensDisplay.push(display);
     if(display.overflow||display.errors||display.controls.some(c=>c.width<43||c.height<43))throw Error('Huygens display: '+JSON.stringify(display));
     if(width>=1366&&size===100&&display.bounds.bottom>height+1)throw Error('Huygens lesson does not fit the desktop screen: '+JSON.stringify(display));
     if(width===1366&&size===100){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,'huygens-'+kind+'.png'),Buffer.from(shot.data,'base64'));}
    }
   }
   await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
   await evaluate(`()=>{const s=document.querySelector('.praxis-course-settings select');s.value='100';s.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(100);
   await writeFile(path.join(root,'huygens.json'),JSON.stringify({controls:result.huygens,display:result.huygensDisplay},null,2));
  }
  if(process.argv.includes('--water-orbits')&&id==='unde-mecanice'){
   result.waterOrbits=await evaluate(await readFile('scripts/qa/water-orbits.browser.js','utf8'));
   const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,'water-orbits.png'),Buffer.from(shot.data,'base64'));
   console.log(JSON.stringify({waterOrbits:result.waterOrbits}));
  }
  if(process.argv.includes('--worker-cache')&&id==='calcul-vectorial'){
   result.workerCache=await evaluate(`async()=>{const registration=await navigator.serviceWorker.getRegistration();let updateError=null;try{await registration?.update();await new Promise(r=>setTimeout(r,2000));}catch(e){updateError=String(e);}const keys=await caches.keys(),entries=[];for(const key of keys){const cache=await caches.open(key),header=await cache.match(new URL('../../shared/lab-header.js',location.href));entries.push({key,hasHeader:!!header,hasResolution:header?(await header.text()).includes('window.PraxisCanvasResolution={ratio,forCanvas}'):null});}return {updateError,controlled:!!navigator.serviceWorker.controller,active:registration?.active?.state,waiting:registration?.waiting?.state,installing:registration?.installing?.state,entries};}`);
   console.log(JSON.stringify({workerCache:result.workerCache}));
  }
  if(process.argv.includes('--all-resolution')){
   await evaluate('()=>{'+await readFile('scripts/qa/canvas-resolution.browser.js','utf8')+'}');
   if(id==='unde-mecanice')await evaluate('()=>{'+await readFile('scripts/qa/waves-resolution.browser.js','utf8')+'}');
   result.resolutionAudit=[];
   for(const [width,height,dpr,size,language]of [[1366,768,1,100,'ro'],[1920,1080,2,100,'en']]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
    await delay(350);
    const audit=await evaluate(`()=>${id==='unde-mecanice'?'PraxisWaveResolutionAudit':'PraxisResolutionAudit'}.run({language:${JSON.stringify(language)}})`);
    Object.assign(audit,{width,height,dpr,size});result.resolutionAudit.push(audit);
    const unobserved=audit.canvasInventory.filter(c=>!c.observed);
    if(!audit.complete||!audit.policyAvailable||unobserved.length) audit.failures.push({type:'coverage',reason:'Incomplete navigation or missing density policy',pending:audit.pending,errors:audit.errors,unobserved});
    console.log(JSON.stringify({id,language,dpr,states:audit.states,complete:audit.complete,failures:audit.failures}));
   }
   if(id==='viteza-si-acceleratia'){
    await evaluate(`()=>document.getElementById('btn-tab-curbiliniu').click()`);await delay(100);
    result.vectorLegend=await evaluate(`()=>{const p=document.querySelector('#curv-desc-text');return {vectors:p.querySelectorAll('.vec').length,arrows:[...p.querySelectorAll('.vec')].map(v=>getComputedStyle(v,'::before').content),text:p.textContent};}`);
    if(result.vectorLegend.vectors!==6||result.vectorLegend.arrows.some(a=>!a.includes('→')))throw Error('Missing vector arrows: '+JSON.stringify(result.vectorLegend));
   }
   result.exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text);
   await writeFile(path.join(root,'all-resolution'+reportSuffix+'.json'),JSON.stringify(results,null,2));
  }
  if(process.argv.includes('--velocity-resolution')&&id==='viteza-si-acceleratia'){
   result.resolution=[];
   for(const [width,height,dpr,size,language] of [[1366,768,1,100,'ro'],[1920,1080,2,100,'en'],[3840,2160,1,100,'ro'],[1024,768,1.25,100,'en'],[390,844,3,100,'ro'],[1366,768,1,200,'ro']]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
    await evaluate(`async()=>{await PraxisI18n.setLanguage(${JSON.stringify(language)});const s=document.querySelector('.praxis-course-settings select');s.value=${JSON.stringify(String(size))};s.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(100);
    for(const tab of ['teorie','rectiliniu','curbiliniu','polinom']){
     await evaluate(`()=>document.getElementById('btn-tab-${tab}').click()`);await delay(100);
     const sample=await evaluate(`async()=>{
      const tab=${JSON.stringify(tab)},visible=document.querySelector('#tab-'+tab),canvas=visible.querySelector('canvas');
      if(!canvas)return {tab,vectorImages:visible.querySelectorAll('svg,math').length,rasterImages:visible.querySelectorAll('img').length};
      const prefix={rectiliniu:'rect',curbiliniu:'curv',polinom:'poly'}[tab],lab={rectiliniu:rectLab,curbiliniu:curvLab,polinom:polyLab}[tab];
      const slider=visible.querySelector('#'+prefix+'-slider-t');slider.value='1.25';slider.dispatchEvent(new Event('input',{bubbles:true}));
      const t=lab.t;window.dispatchEvent(new Event('resize'));await new Promise(r=>setTimeout(r,50));
      const rect=canvas.getBoundingClientRect(),native=devicePixelRatio||1,h=rect.width*Number(canvas.dataset.logicalHeight)/Number(canvas.dataset.logicalWidth);
      const expected=Math.min(Math.max(2,native*1.5),Math.max(native,Math.sqrt(8000000/(rect.width*h))),8192/rect.width,8192/h);
      return {tab,id:canvas.id,cssWidth:rect.width,cssHeight:rect.height,pixelWidth:canvas.width,pixelHeight:canvas.height,densityX:canvas.width/rect.width,densityY:canvas.height/rect.height,expected,sharp:canvas.width/rect.width>=expected-.01&&canvas.height/rect.height>=expected-.01,aspect:Math.abs(rect.height/rect.width-Number(canvas.dataset.logicalHeight)/Number(canvas.dataset.logicalWidth))<.005,timePreserved:lab.t===t,overflow:document.documentElement.scrollWidth>innerWidth+2};
     }`);Object.assign(sample,{width,height,dpr,size,language});result.resolution.push(sample);
     if(width===1366&&size===100&&tab!=='teorie'){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,'velocity-resolution-'+tab+'.png'),Buffer.from(shot.data,'base64'));}
    }
   }
   // DPR-only changes must redraw even if every CSS dimension remains constant.
   await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
   await evaluate(`()=>{const s=document.querySelector('.praxis-course-settings select');s.value='100';s.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('btn-tab-rectiliniu').click();}`);await delay(100);
   const before=await evaluate(`()=>({width:document.getElementById('rect-canvas').width,t:rectLab.t})`);
   await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:2,mobile:false});await delay(450);
   result.dprOnly=await evaluate(`()=>({before:${JSON.stringify(before)},width:document.getElementById('rect-canvas').width,t:rectLab.t})`);
   result.playback=[];
   for(const tab of ['rectiliniu','curbiliniu','polinom']){
    const p=await evaluate(`async()=>{
     const wait=ms=>new Promise(r=>setTimeout(r,ms));document.getElementById('btn-tab-${tab}').click();await wait(70);const root=document.getElementById('tab-${tab}'),lab={rectiliniu:rectLab,curbiliniu:curvLab,polinom:polyLab}[${JSON.stringify(tab)}];
     root.querySelector('.btn-reset').click();const start=lab.t;root.querySelector('.btn-play').click();await wait(220);root.querySelector('.btn-pause').click();const stopped=lab.t;await wait(100);const held=lab.t===stopped;root.querySelector('.btn-reset').click();return {tab:${JSON.stringify(tab)},advanced:stopped>start,held,reset:lab.t===0};
    }`);result.playback.push(p);
   }
   console.log(JSON.stringify({resolution:result.resolution,dprOnly:result.dprOnly,playback:result.playback}));
   await writeFile(path.join(root,'velocity-resolution.json'),JSON.stringify({resolution:result.resolution,dprOnly:result.dprOnly,playback:result.playback},null,2));
   if(result.resolution.some(r=>r.id&&(!r.sharp||!r.aspect||!r.timePreserved||r.overflow))||result.dprOnly.width<=before.width||result.dprOnly.t!==before.t||result.playback.some(p=>!p.advanced||!p.held||!p.reset))throw Error('Velocity resolution audit failed');
  }
  if(process.argv.includes('--propagation')&&id==='unde-mecanice'){
   result.propagation=await evaluate(`async()=>{
    const wait=ms=>new Promise(r=>setTimeout(r,ms));location.hash='marimi-content-3';await wait(150);
    const root=document.querySelector('.wave-propagation-sequence');if(!root?.checkVisibility())throw Error('Propagation figure is not visible');
    const stages=[...root.querySelectorAll('[data-time-periods]')],order=stages.map(e=>Number(e.dataset.timePeriods));
    const source=stages.map(e=>Number(e.querySelector('[data-source-y-amplitude]').dataset.sourceYAmplitude));
    const rect=root.getBoundingClientRect(),svg=stages[0].querySelector('svg');
    await PraxisI18n.setLanguage('en');await wait(70);const english=root.textContent.includes('one wavelength');await PraxisI18n.setLanguage('ro');
    return {order,source,cards:stages.length,svg:root.querySelectorAll('svg').length,columns:getComputedStyle(root.querySelector('.wave-propagation-grid')).gridTemplateColumns.split(' ').length,english,periodDistance:!!root.querySelector('[data-period-distance]'),fractions:root.querySelectorAll('mfrac').length,overflow:document.documentElement.scrollWidth>innerWidth+2,bounds:{top:rect.top,bottom:rect.bottom,height:rect.height},svgWidth:svg.getBoundingClientRect().width,errors:document.querySelectorAll('.wave-math-error').length};
   }`);
   console.log(JSON.stringify({propagation:result.propagation}));
   if(result.propagation.cards!==6||result.propagation.svg!==6||result.propagation.columns<3||result.propagation.bounds.height>600||!result.propagation.english||!result.propagation.periodDistance||result.propagation.fractions<4||result.propagation.overflow||result.propagation.errors)throw Error('Propagation figure audit failed');
  }
  if(process.argv.includes('--string-launch')&&id==='unde-mecanice'){
   result.launch=await evaluate(await readFile('scripts/qa/waves-string-launch.browser.js','utf8'));
   console.log(JSON.stringify({launch:result.launch}));
  }
  if(indexAudit){
   result.indices=[];
   for(const language of ['ro','en']){
    await evaluate(`async()=>await PraxisI18n.setLanguage(${JSON.stringify(language)})`);await delay(80);
    const sections=await evaluate(`()=>[...document.querySelectorAll('.praxis-course-sections option')].map(e=>e.value)`);
    for(const section of sections.length?sections:['initial']){
     if(section!=='initial')await evaluate(`()=>{const s=document.querySelector('.praxis-course-sections');s.value=${JSON.stringify(section)};s.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(70);
     await evaluate(`()=>document.querySelectorAll('#praxis-original details').forEach(e=>e.open=true)`);await delay(40);
     result.indices.push({language,section,findings:await evaluate(indexProbe)});
     const activities=await evaluate(`()=>[...document.querySelectorAll('.praxis-workspace-activities button')].map((e,i)=>({i,visible:e.checkVisibility()})).filter(e=>e.visible).map(e=>e.i)`);
     for(const activity of activities){await evaluate(`()=>document.querySelectorAll('.praxis-workspace-activities button')[${activity}].click()`);await delay(50);result.indices.push({language,section,activity,findings:await evaluate(indexProbe)});}
    }
    if(id==='unde-mecanice'){
     const hashes=['clasificare-content-0','clasificare-content-1','marimi-content-0','marimi-content-1','marimi-content-2','marimi-content-3','marimi-content-4','marimi-content-5','marimi-content-6','marimi-content-7','ecuatia-content-0','ecuatia-content-1','ecuatia-content-2','reflexie-content-0','reflexie-content-1','reflexie-content-2','reflexie-content-3','reflexie-content-4','stationare-content-0','stationare-content-1','laborator-content-1','rezonanta-cladiri-content-1'];
     for(const hash of hashes){await evaluate(`()=>location.hash=${JSON.stringify(hash)}`);await delay(70);result.indices.push({language,section:hash,findings:await evaluate(indexProbe)});}
    }
   }
   result.canvasIndices=await evaluate('()=>window.__canvasIndices');
   result.indexRuntime=await evaluate(inspect);
   result.exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text);
   console.log(JSON.stringify({id,indices:result.indices,canvasIndices:result.canvasIndices}));
  }
  if(process.argv.includes('--string-phase')&&id==='unde-mecanice'){
   result.phase=await evaluate(`async()=>{
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));location.hash='stationare-content-0';await sleep(150);
    const root=()=>[...document.querySelectorAll('[data-string-kind=reflection]')].find(e=>e.checkVisibility());const probes=[];
    for(const right of ['fixed','free']){
     const select=root().querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,right);select.dispatchEvent(new Event('change',{bubbles:true}));await sleep(80);
     const cases=[...root().querySelectorAll('[data-string-reflection-case]')];const fixed=cases.find(e=>e.dataset.stringReflectionCase==='fixed'),free=cases.find(e=>e.dataset.stringReflectionCase==='free');
     const box=root().querySelector('.string-reflection-phase').getBoundingClientRect();
     probes.push({right,bothVisible:cases.length===2&&cases.every(e=>e.checkVisibility()&&!e.closest('details')),selected:root().querySelector('[data-string-reflection-case][data-selected=true]')?.dataset.stringReflectionCase===right,fixedPhase:fixed.textContent.includes('π')&&!!fixed.querySelector('mfrac'),freePhase:free.textContent.includes('0λ'),midpoint:root().querySelector('[data-string-coordinate=midpoint]')?.textContent.includes('mijlocul corzii'),panel:{top:box.top,bottom:box.bottom,height:box.height},errors:document.querySelectorAll('.wave-math-error').length});
    }
    const script=[...root().querySelectorAll('.string-note .wave-script')].find(e=>e.firstChild?.textContent==='v'&&e.querySelector('sub')?.textContent==='f');let noteIndex=false;
    if(script){const range=document.createRange();range.selectNodeContents(script.firstChild);const base=range.getBoundingClientRect(),sub=script.querySelector('sub').getBoundingClientRect();noteIndex=sub.top>base.top&&sub.height<base.height&&sub.left>=base.right-1;}
    const before=root().dataset.stringTime;await PraxisI18n.setLanguage('en');await sleep(80);const translated=root().querySelector('.string-reflection-phase').textContent.includes('Fixed end: inversion')&&root().querySelector('[data-string-coordinate=midpoint]').textContent.includes('midpoint of the string');await PraxisI18n.setLanguage('ro');return {probes,translated,noteIndex,timePreserved:root().dataset.stringTime===before};
   }`);
   console.log(JSON.stringify({phase:result.phase}));
   if(!result.phase.translated||!result.phase.noteIndex||!result.phase.timePreserved||result.phase.probes.some(p=>!p.bothVisible||!p.selected||!p.fixedPhase||!p.freePhase||!p.midpoint||p.errors))throw Error('String phase audit failed');
  }
  if(motionControls&&id==='miscarea-rectilinie'){
   await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
   await evaluate(`async()=>{await PraxisI18n.setLanguage('ro');document.querySelector('[role=tab][data-tab=tipuri]').click();window.scrollTo(0,0);}`);await delay(150);
   result.controls=[];
   for(const kind of ['unif','acc','inc','var']){
    const probe=await evaluate(`async()=>{
     const sleep=ms=>new Promise(r=>setTimeout(r,ms));
     document.querySelectorAll('#tipuri>.praxis-workspace-activities button')[1].click();
     document.querySelector('#acc-chips [data-k=${kind}]').click();await sleep(80);
     const play=document.querySelector('#acc-transport [data-r=play]'),time=document.querySelector('#acc-transport [data-r=time]');
     if(!play||!time)return {kind:${JSON.stringify(kind)},missing:true};
     const rect=play.getBoundingClientRect();play.click();await sleep(250);play.click();const paused=+time.value;await sleep(120);const held=+time.value===paused;play.click();await sleep(200);play.click();const resumed=+time.value>paused;
     await PraxisI18n.setLanguage('en');const same=play===document.querySelector('#acc-transport [data-r=play]');await PraxisI18n.setLanguage('ro');
     document.querySelector('#acc-transport [data-r=reset]').click();return {kind:${JSON.stringify(kind)},visible:rect.width>=44&&rect.height>=44&&rect.top>=0&&rect.bottom<=innerHeight,advanced:paused>0,held,resumed,same,reset:+time.value===0};
    }`);result.controls.push(probe);
   }
   for(const kind of ['rect','circ','parab','elip','oarecare']){
    const probe=await evaluate(`async()=>{
     const sleep=ms=>new Promise(r=>setTimeout(r,ms));document.querySelectorAll('#tipuri>.praxis-workspace-activities button')[0].click();document.querySelector('#traj-chips [data-k=${kind}]').click();await sleep(80);
     const play=document.querySelector('#traj-play'),canvas=document.querySelector('#traj-canvas');if(!play)return {kind:${JSON.stringify(kind)},missing:true};
     const rect=play.getBoundingClientRect(),before=canvas.toDataURL();play.click();await sleep(200);play.click();const paused=canvas.toDataURL(),advanced=paused!==before;await sleep(120);const held=canvas.toDataURL()===paused;play.click();await sleep(200);play.click();const resumed=canvas.toDataURL()!==paused;
     await PraxisI18n.setLanguage('en');const same=play===document.querySelector('#traj-play');await PraxisI18n.setLanguage('ro');return {kind:${JSON.stringify(kind)},visible:rect.width>=44&&rect.height>=44&&rect.top>=0&&rect.bottom<=innerHeight,advanced,held,resumed,same};
    }`);result.controls.push(probe);
   }
   console.log(JSON.stringify({controls:result.controls}));await writeFile(path.join(root,'rectilinear-controls.json'),JSON.stringify(result.controls,null,2));
   if(result.controls.some(p=>Object.values(p).some(v=>v===false)||p.missing))throw Error('Motion control regression: '+JSON.stringify(result.controls));
  }
  if(thorough){
   result.views=[];
   const sections=await evaluate(`()=>[...document.querySelectorAll('.praxis-course-sections option')].map(e=>e.value)`);
   for(const section of sections){
    await evaluate(`()=>{const s=document.querySelector('.praxis-course-sections');s.value=${JSON.stringify(section)};s.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(100);
    const view=await evaluate(inspect);view.section=section;result.views.push(view);
   }
   // Wave navigation has its own accessible hierarchy rather than a section select.
   if(id==='unde-mecanice')for(const group of ['group-0','group-1','group-2','group-3','group-4','group-5']){
    await evaluate(`()=>document.getElementById(${JSON.stringify(group)})?.click()`);await delay(100);
    const view=await evaluate(inspect);view.section=group;result.views.push(view);
   }
   const preferred={'miscarea-circulara-uniforma':'laborator','compunerea-oscilatiilor':'laborator','calorimetrie':'s5','notiuni-termodinamice':'s3','principiile-mecanicii-newtoniene':'laborator'}[id];
   const selected=sections.includes(preferred)?preferred:sections[0];
   if(selected)await evaluate(`()=>{const s=document.querySelector('.praxis-course-sections');s.value=${JSON.stringify(selected)};s.dispatchEvent(new Event('change',{bubbles:true}));window.scrollTo(0,0);}`);
   if(id==='unde-mecanice')await evaluate(`()=>document.getElementById('group-0')?.click()`);
   if(process.argv.includes('--all-resolution')){
    if(id==='unde-mecanice')await evaluate(`()=>window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:'ecuatia-content-0'}))`);
    else {result.representative=await evaluate(`()=>PraxisResolutionAudit.focusRepresentative()`);if(result.representative.missingCanvases?.length)throw Error('Representative figure inaccessible: '+JSON.stringify(result.representative));}
   }
   if(process.argv.includes('--propagation')&&id==='unde-mecanice')await evaluate(`()=>location.hash='marimi-content-3'`);
   await delay(100);
   const rangeCheck=await evaluate(`()=>{const r=[...document.querySelectorAll('input[type=range]')].find(e=>e.getBoundingClientRect().width>0&&!e.disabled);if(!r)return null;const old=r.value,min=Number(r.min||0),max=Number(r.max||100),step=Number(r.step)||1;r.value=Number(old)+step<=max?Number(old)+step:Math.max(min,Number(old)-step);r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));return {id:r.id,old,changed:r.value};}`);
   result.rangeCheck=rangeCheck;await delay(100);result.afterInput=await evaluate(inspect);
   const states=[[1366,768,1,100,'en'],[1920,1080,2,100,'ro'],[1024,768,1,100,'ro'],[390,844,3,100,'en'],[1366,768,1,200,'ro'],[3840,2160,1,100,'ro']];
   result.matrix=[];
   for(const [width,height,dpr,size,language] of states){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
    await evaluate(`async()=>{await window.PraxisI18n?.setLanguage(${JSON.stringify(language)});const s=document.querySelector('.praxis-course-settings select');if(s){s.value=${JSON.stringify(String(size))};s.dispatchEvent(new Event('change',{bubbles:true}));}else{document.documentElement.style.fontSize=${JSON.stringify(16*size/100+'px')};window.dispatchEvent(new Event('resize'));}}`);await delay(120);
    const view=await evaluate(inspect);Object.assign(view,{width,height,dpr,size,language});
    if(process.argv.includes('--all-resolution'))view.sampling=await evaluate(`()=>PraxisResolutionAudit.scan(['display matrix'])`);
    result.matrix.push(view);
    if(only||(['miscarea-circulara-uniforma','compunerea-oscilatiilor','calorimetrie','oglinzi-si-lentile'].includes(id)&&width===1366&&size===100)){
     const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,`${id}-${width}-${size}-${language}.png`),Buffer.from(shot.data,'base64'));
    }
   }
   result.exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text);
   console.log(JSON.stringify({id,views:result.views.length,matrix:result.matrix,afterInput:result.afterInput,exceptions:result.exceptions}));
  }
  if(only){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,id+'.png'),Buffer.from(shot.data,'base64'));}
 }
 await writeFile(path.join(root,(indexAudit?'browser-indices':thorough?'browser-matrix':'browser-baseline')+reportSuffix+'.json'),JSON.stringify(results,null,2));
 const failures=results.flatMap(r=>{
  const views=[r,...(r.views||[]),r.afterInput,r.indexRuntime,...(r.matrix||[])].filter(Boolean);
  return [...views.filter(v=>v.errors.length||v.canvas?.length||v.overflow||v.mutations.length).map(v=>({id:r.id,view:v})),...r.exceptions.map(exception=>({id:r.id,exception})),...(r.indices||[]).filter(v=>v.findings.length).map(v=>({id:r.id,indices:v})),...(r.canvasIndices||[]).map(text=>({id:r.id,canvasIndex:text})),...(r.resolutionAudit||[]).flatMap(a=>a.failures.map(f=>({id:r.id,language:a.language,resolution:f}))),...(r.matrix||[]).flatMap(v=>(v.sampling?.canvases||[]).filter(c=>c.invalid||c.sharp===false).map(c=>({id:r.id,matrix:[v.width,v.size,v.language],canvas:c})))];
 });
 if(failures.length)throw Error('Browser audit failed: '+JSON.stringify(failures));
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{socket?.close();chrome.kill();await new Promise(resolve=>server.close(resolve));}
