// Run in Chrome DevTools evaluate_script after loading the tsunami activity.
// This exercises the mounted React controls, not a duplicate numerical model.
(async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),settle=()=>wait(80);
 const root=()=>document.querySelector('.wave-tsunami'),time=()=>Number(root().dataset.tsunamiTime);
 const actions=()=>root().querySelectorAll('.tsunami-actions button'),ranges=()=>root().querySelectorAll('input[type=range]');
 const results=[];function check(name,ok,data){results.push({name,ok,...(data?{data}:{})});if(!ok)throw Error(name+': '+JSON.stringify(data));}
 location.hash='rezonanta-cladiri-content-1';await settle();actions()[1].click();await settle();
 check('one visible canvas, drawn before start',root().querySelectorAll('canvas').length===1&&root().querySelector('canvas').getBoundingClientRect().width>100);
 const ctx=root().querySelector('canvas').getContext('2d'),sample=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data,colors=new Set();
 for(let i=0;i<sample.length;i+=400)colors.add(sample[i]+','+sample[i+1]+','+sample[i+2]);check('initial map is not blank',colors.size>12,{colors:colors.size});
 const amp=+ranges()[0].value;ranges()[0].parentElement.lastElementChild.click();await settle();check('amplitude increment',Math.abs(+ranges()[0].value-amp-.1)<1e-9);
 ranges()[0].parentElement.firstElementChild.click();await settle();check('amplitude decrement',+ranges()[0].value===amp);
 const speed=+ranges()[1].value;ranges()[1].parentElement.lastElementChild.click();await settle();check('time acceleration increment',+ranges()[1].value===speed+1);
 actions()[0].click();await wait(550);check('start advances physical time',time()>0&&root().dataset.tsunamiRunning==='true',{time:time()});
 actions()[0].click();await settle();const paused=time();await wait(250);check('pause freezes physical time',time()===paused&&root().dataset.tsunamiRunning==='false');
 const language=document.querySelector('header select'),before=[time(),...Array.from(ranges(),e=>e.value),root().dataset.tsunamiSource];
 for(const lang of ['en','ro']){language.value=lang;language.dispatchEvent(new Event('change',{bubbles:true}));await settle();check('language '+lang+' preserves state',JSON.stringify(before)===JSON.stringify([time(),...Array.from(ranges(),e=>e.value),root().dataset.tsunamiSource]));}
 check('station identifiers stay literal across languages',Array.from(root().querySelectorAll('.tsunami-map-station'),e=>e.textContent).join(',')==='A,B,C');
 const oldColors=window.PraxisCourseLocalization.colors;window.PraxisCourseLocalization.setColors(oldColors==='vivid'?'praxis':'vivid');await settle();check('palette change preserves time',time()===paused);window.PraxisCourseLocalization.setColors(oldColors);await settle();
 actions()[0].click();await wait(180);location.hash='reflexie';await wait(180);const hidden=time();await wait(250);check('leaving activity pauses simulation',time()===hidden&&root().dataset.tsunamiRunning==='false');
 location.hash='rezonanta-cladiri-content-1';await settle();check('return does not restart clock',time()===hidden);
 const select=root().querySelector('select');select.value='south';select.dispatchEvent(new Event('change',{bubbles:true}));await settle();check('preset chooses a new valid source and resets clock',root().dataset.tsunamiSource==='south'&&time()===0);
 actions()[2].click();await settle();const canvas=root().querySelector('canvas'),box=canvas.getBoundingClientRect();
 function point(x,y){canvas.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:box.left+x*box.width,clientY:box.top+y*box.height}));}
 point(.01,.3);await settle();check('land source rejected without changing source',root().dataset.tsunamiSource==='south'&&root().querySelector('.tsunami-message')?.innerText.length>0);
 canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',clientX:box.left+.3*box.width,clientY:box.top+.45*box.height}));await settle();check('touch press alone does not relocate source while scrolling',root().dataset.tsunamiSource==='south');
 point(.3,.45);await settle();check('water source accepted',root().dataset.tsunamiSource==='custom'&&!root().querySelector('.tsunami-message')&&time()===0);
 actions()[0].click();await wait(300);actions()[1].click();await settle();check('reset stops and clears time',time()===0&&root().dataset.tsunamiRunning==='false');
 actions()[2].click();await settle();const oldX=Number(root().dataset.tsunamiSourceX);canvas.focus();canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await settle();canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await settle();check('keyboard can place a valid source',Number(root().dataset.tsunamiSourceX)>oldX&&root().dataset.tsunamiSource==='custom');
 actions()[0].click();await wait(120);Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));await settle();const background=time();await wait(180);check('visibility handler stops background computation',root().dataset.tsunamiRunning==='false'&&time()===background);delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));await settle();check('visibility restore requires explicit start',root().dataset.tsunamiRunning==='false');actions()[1].click();await settle();
 const details=root().querySelector('details');details.open=true;await settle();check('station measurements available',root().querySelectorAll('tbody tr').length===3&&root().querySelector('table').getBoundingClientRect().width>100);details.open=false;
 scrollTo({top:0,behavior:'instant'});await settle();
 check('page has no horizontal overflow',document.documentElement.scrollWidth<=innerWidth+2);
 const widths=Array.from(ranges(),e=>Math.round(e.getBoundingClientRect().width));check('slider tracks remain usable',widths.every(w=>w>=75),{widths});
 return {viewport:[innerWidth,innerHeight,devicePixelRatio],results,bottom:document.querySelector('.lesson-bottom').getBoundingClientRect().bottom,canvas:root().querySelector('canvas').getBoundingClientRect().toJSON()};
})
