(async()=>{
 const failures=[],checks=[];
 const assert=(value,name)=>{checks.push(name);if(!value)failures.push(name);};
 const settle=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const click=selector=>document.querySelector(selector).click();
 const set=(id,value)=>{const input=document.getElementById(id);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));};
 click('[data-tab=teorie]');set('slA',1);set('slB',-2);set('slC',1);await settle();
 assert(document.querySelector('#tileRoots').textContent.trim()==='1 (Δ = 0)','double root is shown once');
 assert(document.querySelectorAll('#svgTheory circle[fill="#a4462f"]').length===1,'double root has one marker');
 set('slA',0);set('slB',2);set('slC',-4);await settle();
 assert(document.querySelector('#tileRoots').textContent.trim()==='1','linear case has one root');
 assert(document.querySelector('#tileDelta').textContent.trim()==='—','linear case has no quadratic discriminant');
 assert(!/NaN|Infinity/.test(document.querySelector('#svgTheory').innerHTML),'linear graph has finite geometry');
 set('slB',0);set('slC',0);await settle();assert(document.querySelector('#tileRoots').textContent.trim()==='ℝ','zero function has all real roots');
 click('[data-preset="1,-2,-3"]');const before=['slA','slB','slC'].map(id=>document.getElementById(id).value).join();
 await PraxisI18n.setLanguage('ro');await settle();await PraxisI18n.setLanguage('en');await settle();await PraxisI18n.setLanguage('ro');await settle();
 assert(before===['slA','slB','slC'].map(id=>document.getElementById(id).value).join(),'RO EN RO preserves parameters');
 click('[data-tab=animatii]');
 for(const type of ['a','point','roots']){click('[data-anim='+type+']');await settle();click('#btnPlay');assert(/Redă|Play/.test(document.querySelector('#btnPlay').textContent),'animation '+type+' pauses');assert(document.querySelector('#svgAnim svg')!==null,'animation '+type+' draws');click('#btnRestart');await settle();click('#btnPlay');}
 click('[data-tab=fizica]');click('[data-phys=proj]');set('slTh',45);click('[data-phys-var=th][data-d="5"]');
 assert(document.querySelector('#slTh').value==='50','angle step is 5 degrees');set('slG',9.81);click('[data-phys-var=g][data-d="0.5"]');assert(document.querySelector('#slG').value==='10.31','gravity step is 0.5');
 for(const type of ['proj','up','fall']){click('[data-phys='+type+']');click('#btnPhysPlay');await settle();click('#btnPhysPlay');assert(/Redă|Play/.test(document.querySelector('#btnPhysPlay').textContent),'physics '+type+' pauses');assert(!/NaN|Infinity/.test(document.querySelector('#svgPhys').innerHTML),'physics '+type+' has finite geometry');click('#btnPhysReset');await settle();click('#btnPhysPlay');}
 click('[data-phys=up]');set('slH0',0);set('slVu',0);click('#btnPhysPlay');await settle();assert(/Redă|Play/.test(document.querySelector('#btnPhysPlay').textContent),'zero-duration flight does not start an animation loop');assert(!/NaN|Infinity/.test(document.querySelector('#svgPhys').innerHTML),'zero-duration vertical launch remains finite');
 click('[data-tab=teorie]');await settle();
 assert(document.querySelectorAll('[role=tab][aria-selected=true]').length===1,'one selected accessible tab');
 assert([...document.querySelectorAll('input[type=range]')].every(input=>input.getAttribute('aria-label')),'all sliders have names');
 assert(!PraxisSound.enabled,'new session sound remains off');
 const button=document.querySelector('[data-tab=teorie]');button.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert(document.querySelector('[data-tab=animatii]').getAttribute('aria-selected')==='true','arrow key changes accessible tab');click('[data-tab=teorie]');
 return {checks,failures};
})()
