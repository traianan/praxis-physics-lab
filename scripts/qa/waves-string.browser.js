// Evaluate in the mounted wave lesson. Exercises React controls and the SVG.
async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),settle=()=>wait(80),results=[];
 const check=(name,ok,data)=>{results.push({name,ok,data});if(!ok)throw Error(name+': '+JSON.stringify(data));};
 const change=(input,value)=>{Object.getOwnPropertyDescriptor(input.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(input,String(value));input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));};
 const root=()=>document.querySelector('section:not([hidden]) .lesson-part-content:not([hidden]) .wave-string');
 const buttons=()=>root().querySelectorAll('.string-actions button');
 const state=()=>[root().dataset.stringTime,...Array.from(root().querySelectorAll('input,select'),e=>e.value)];
 location.hash='stationare-content-0';await settle();
 check('reflection mounts one SVG and no canvas',root()?.dataset.stringKind==='reflection'&&root().querySelectorAll('svg').length===1&&!root().querySelector('canvas'));
 const ranges=()=>root().querySelectorAll('input[type=range]');
 for(const right of ['fixed','free']){
  change(root().querySelector('select'),right);await settle();change(ranges()[3],.75);await settle();
  const endpoint=root().querySelector('[data-string-curve=sum]').getAttribute('points').split(' ').at(-1).split(',').map(Number);
  check('pulse '+right+' endpoint at first arrival',Math.abs(endpoint[1]-(right==='fixed'?130:78))<1e-8,endpoint);
  check('parameter/time changes pause',root().dataset.stringRunning==='false');
 }
 buttons()[0].click();await wait(250);buttons()[0].click();await settle();
 const paused=state();check('clock advances',Number(paused[0])>0);await wait(140);check('pause freezes state',JSON.stringify(state())===JSON.stringify(paused));
 const lang=document.querySelector('header select');for(const value of ['en','ro']){change(lang,value);await settle();check('language '+value+' preserves state',JSON.stringify(state())===JSON.stringify(paused));}
 buttons()[0].click();await wait(100);location.hash='stationare-content-1';await settle();
 const hidden=document.querySelector('[data-string-kind=reflection]'),stopped=hidden.dataset.stringTime;await wait(140);check('leaving reflection stops its clock',hidden.dataset.stringRunning==='false'&&hidden.dataset.stringTime===stopped);
 check('standing mounts',root().dataset.stringKind==='standing');
 for(const right of ['fixed','free'])for(const n of [1,6]){
  change(root().querySelector('select'),right);await settle();change(ranges()[3],n);await settle();
  const nodes=[...root().querySelectorAll('[data-string-node]')],vents=[...root().querySelectorAll('[data-string-antinode]')];
  check(right+' mode '+n+' markers',nodes.length===(right==='fixed'?n+1:n)&&vents.length===n,{nodes:nodes.length,antinodes:vents.length});
  check(right+' mode '+n+' right boundary',Number((right==='fixed'?nodes:vents).at(-1).getAttribute(right==='fixed'?'data-string-node':'data-string-antinode'))===2);
  check('native stacked fractions',root().querySelectorAll('mfrac').length>=6&&!root().querySelector('.wave-math-error'));
  const letters=[...root().querySelectorAll('svg text')].map(e=>({text:e.textContent,box:e.getBBox()}));
  const half=letters.find(e=>e.text==='L'&&e.box.x>200&&e.box.x<400);
  const overlap=letters.filter(e=>/^N/.test(e.text)).some(e=>e.box.x<half.box.x+half.box.width&&e.box.x+e.box.width>half.box.x&&e.box.y<half.box.y+half.box.height&&e.box.y+e.box.height>half.box.y);
  check(right+' mode '+n+' labels clear of the stacked L/2 fraction',!overlap);
 }
 buttons()[0].click();await wait(200);buttons()[0].click();await settle();const standing=state();change(lang,'en');await settle();check('standing language preserves state',JSON.stringify(state())===JSON.stringify(standing));
 change(ranges()[0],2.1);await settle();check('length change resets on pause',Number(root().dataset.stringTime)===0&&root().dataset.stringRunning==='false');
 buttons()[1].click();await settle();
 location.hash='laborator-content-1';await settle();const guitar=document.querySelector('#laborator .lesson-part-content:not([hidden])');
 check('guitar has physical context and optional synthesis explanation',guitar.innerText.includes('String fixed at both ends')&&[...guitar.querySelectorAll('summary')].some(e=>e.textContent.includes('sound is generated')));
 check('technical recurrence removed from primary view',!guitar.innerText.includes('y[n]'));
 const originalRecorder=window.MediaRecorder;
 const failRecording=async()=>{try{window.MediaRecorder=class{static isTypeSupported(){return true;}constructor(){throw Error('QA recorder unavailable');}};[...guitar.querySelectorAll('button')].find(e=>/Record 3s|Înregistrează 3s/.test(e.textContent)).click();await settle();}finally{window.MediaRecorder=originalRecorder;}};
 const errorVisible=()=>{const alert=guitar.querySelector('[role=alert]');if(!alert||!alert.checkVisibility())return false;for(let e=alert.parentElement;e;e=e.parentElement)if(e.tagName==='DETAILS'&&!e.open)return false;return true;};
 await failRecording();check('recording failure opens the optional explanation and displays its alert',errorVisible());
 guitar.querySelector('.wave-guitar-notes>details').open=false;await settle();
 await failRecording();check('a repeated recording failure reopens a manually closed explanation',errorVisible());
 check('no mathematical rendering errors',!document.querySelector('.wave-math-error'));
 return {checks:results.length,results};
}
