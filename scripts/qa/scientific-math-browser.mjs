// Local Chrome, private profile, built-in CDP client. No additional packages.
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from '../serve.mjs';
const root=path.resolve('D:/ProiecteAI/tmp/global-math'),port=9331;
await mkdir(root,{recursive:true});
const server=createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[
 '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',
 '--user-data-dir='+path.join(root,'profile'), '--remote-debugging-port='+port,'about:blank'
],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let stderr='';chrome.stderr.on('data',v=>stderr+=v);chrome.on('error',error=>stderr+=error.message);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket,serial=0;const pending=new Map(),events=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},15000);pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});socket.send(JSON.stringify({id,method,params}));});}
try{
 let tabs;for(let i=0;i<80;i++){try{tabs=await fetch('http://127.0.0.1:'+port+'/json/list').then(r=>r.json());if(tabs.length)break;}catch{}await delay(100);}
 if(!tabs?.length)throw Error('Chrome did not expose its local endpoint: '+stderr.slice(-2000));
 socket=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',message=>{const data=JSON.parse(message.data);if(data.id){const p=pending.get(data.id);if(p){pending.delete(data.id);data.error?p.reject(Error(JSON.stringify(data.error))):p.resolve(data.result);}}else events.push(data);});
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`
 window.__mutationAudit=[];const NativeObserver=MutationObserver;
 window.__canvasAudit=[];const nativeFillText=CanvasRenderingContext2D.prototype.fillText;
 CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(/\\bNaN\\b|undefined/.test(String(text))&&!window.__canvasAudit.includes(String(text))&&window.__canvasAudit.length<20)window.__canvasAudit.push(String(text));return nativeFillText.call(this,text,...args);};
 window.MutationObserver=class extends NativeObserver{constructor(fn){const stack=new Error().stack;let count=0,start=performance.now();super((records,observer)=>{const now=performance.now();if(now-start>100){count=0;start=now;}if(++count>600){window.__mutationAudit.push({stack,targets:records.slice(0,4).map(r=>({tag:r.target.nodeName,cls:r.target.className}))});observer.disconnect();return;}fn(records,observer);});}};
 try{localStorage.setItem('praxis-privacy-choice-v1',JSON.stringify({version:1,value:'necessary',time:Date.now()}));localStorage.setItem('praxis-language','ro');localStorage.setItem('praxis-course-text-size','100');}catch{}
 `});
 const evaluate=async source=>{const r=await send('Runtime.evaluate',{expression:'('+source+')()',returnByValue:true,awaitPromise:true,timeout:10000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const ids=['calcul-vectorial','calorimetrie','compunerea-oscilatiilor','figuri-chladni','interactii-atomice','miscarea-circulara-uniforma','miscarea-curbilinie-plana','miscarea-rectilinie','motoare-termice','notiuni-termodinamice','oglinzi-si-lentile','oscilator-mecanic','oscilatori-mecanici-cuplati','principiile-mecanicii-newtoniene','principiul-i-al-termodinamicii','principiul-i-aplicatii','transformari-stare-agregare','unde-mecanice','viteza-si-acceleratia'];
 const only=process.argv.find(a=>a.startsWith('--course='))?.split('=')[1];
 const motionControls=process.argv.includes('--motion-controls');
 const thorough=process.argv.includes('--matrix');
 const inspect=`()=>({errors:[...document.querySelectorAll('.science-math-error,.wave-math-error,.katex-error')].map(e=>({text:e.textContent,title:e.title})),canvas:window.__canvasAudit,overflow:document.documentElement.scrollWidth>innerWidth+2,mutations:window.__mutationAudit,math:document.querySelectorAll('math,.fraction,.frac').length})`;
 const results=[];
 for(const id of ids.filter(id=>!only||id===only)){
  events.length=0;await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  const nav=await send('Page.navigate',{url:base+'/simulari/'+id+'/'});if(nav.errorText)throw Error(id+': '+nav.errorText);
  let loaded=false;for(let attempt=0;attempt<60;attempt++){await delay(150);loaded=await evaluate('()=>document.readyState==="complete"&&!!window.PraxisMath&&document.title.length>0');if(loaded)break;}
  if(!loaded)throw Error(id+' did not finish loading');
  const result=await evaluate(`()=>({id:${JSON.stringify(id)},url:location.href,ready:document.readyState,title:document.title,api:!!window.PraxisMath,math:document.querySelectorAll('.science-math').length,errors:[...document.querySelectorAll('.science-math-error,.wave-math-error,.katex-error')].map(e=>({text:e.textContent,title:e.title})),overflow:document.documentElement.scrollWidth>innerWidth+2,mutations:window.__mutationAudit,tabs:[...document.querySelectorAll('#praxis-original [role=tab],#praxis-original button[data-tab],#praxis-original .tabs a')].map(e=>({text:e.textContent.trim(),id:e.id,tab:e.dataset.tab,href:e.getAttribute('href')}))})`);
  result.exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text);
  results.push(result);console.log(JSON.stringify(result));
  if(motionControls&&id==='miscarea-rectilinie'){
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
   await delay(100);
   const rangeCheck=await evaluate(`()=>{const r=[...document.querySelectorAll('input[type=range]')].find(e=>e.getBoundingClientRect().width>0&&!e.disabled);if(!r)return null;const old=r.value,min=Number(r.min||0),max=Number(r.max||100),step=Number(r.step)||1;r.value=Number(old)+step<=max?Number(old)+step:Math.max(min,Number(old)-step);r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));return {id:r.id,old,changed:r.value};}`);
   result.rangeCheck=rangeCheck;await delay(100);result.afterInput=await evaluate(inspect);
   const states=[[1366,768,1,100,'en'],[1920,1080,2,100,'ro'],[1024,768,1,100,'ro'],[390,844,1,100,'en'],[1366,768,1,200,'ro'],[3840,2160,1,100,'ro']];
   result.matrix=[];
   for(const [width,height,dpr,size,language] of states){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
    await evaluate(`async()=>{await window.PraxisI18n?.setLanguage(${JSON.stringify(language)});const s=document.querySelector('.praxis-course-settings select');if(s){s.value=${JSON.stringify(String(size))};s.dispatchEvent(new Event('change',{bubbles:true}));}else{document.documentElement.style.fontSize=${JSON.stringify(16*size/100+'px')};window.dispatchEvent(new Event('resize'));}}`);await delay(120);
    const view=await evaluate(inspect);Object.assign(view,{width,height,dpr,size,language});result.matrix.push(view);
    if(only||(['miscarea-circulara-uniforma','compunerea-oscilatiilor','calorimetrie','oglinzi-si-lentile'].includes(id)&&width===1366&&size===100)){
     const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,`${id}-${width}-${size}-${language}.png`),Buffer.from(shot.data,'base64'));
    }
   }
   result.exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text);
   console.log(JSON.stringify({id,views:result.views.length,matrix:result.matrix,afterInput:result.afterInput,exceptions:result.exceptions}));
  }
  if(only){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(root,id+'.png'),Buffer.from(shot.data,'base64'));}
 }
 await writeFile(path.join(root,(thorough?'browser-matrix':'browser-baseline')+(only?'-'+only:'')+'.json'),JSON.stringify(results,null,2));
 const failures=results.flatMap(r=>{
  const views=[r,...(r.views||[]),r.afterInput,...(r.matrix||[])].filter(Boolean);
  return [...views.filter(v=>v.errors.length||v.canvas?.length||v.overflow||v.mutations.length).map(v=>({id:r.id,view:v})),...r.exceptions.map(exception=>({id:r.id,exception}))];
 });
 if(failures.length)throw Error('Browser audit failed: '+JSON.stringify(failures));
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{socket?.close();chrome.kill();await new Promise(resolve=>server.close(resolve));}
