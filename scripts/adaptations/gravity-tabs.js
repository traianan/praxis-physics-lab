// Activity changes preserve model parameters, quiz choices and the orbital clock.
const forceWorkspace=document.querySelector('#newton .lab');
forceWorkspace.after(forceWorkspace.querySelector('.card:last-child details'));
document.querySelector('#sateliti .lab').after(document.querySelector('#sateliti .orbit-theory'));
const fieldWorkspace=document.querySelector('#camp .two');
const fieldTheory=fieldWorkspace.firstElementChild,fieldControls=fieldWorkspace.lastElementChild;
const fieldScene=document.createElement('div');fieldScene.className='card';
fieldScene.append($('gChart'),fieldControls.querySelector('.metrics'),$('fieldExplanation'));
fieldTheory.replaceWith(fieldScene);
const fieldReading=document.createElement('details'),fieldSummary=document.createElement('summary');
fieldSummary.textContent='Câmpul și intensitatea sa';fieldReading.append(fieldSummary,fieldTheory);fieldWorkspace.after(fieldReading);
const gravityTabs=[...document.querySelectorAll('.tabs [data-tab]')];
function selectGravityTab(id,focus=false){
 if(!gravityTabs.some(tab=>tab.dataset.tab===id))return;
 for(const tab of gravityTabs){const active=tab.dataset.tab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;$(tab.dataset.tab).hidden=!active;if(active&&focus)tab.focus();}
 const select=document.querySelector('.praxis-course-sections');if(select)select.value=id;
 last=0;render();
}
for(const [index,tab] of gravityTabs.entries()){
 tab.addEventListener('click',()=>selectGravityTab(tab.dataset.tab));
 tab.addEventListener('keydown',event=>{const next=event.key==='ArrowRight'?(index+1)%gravityTabs.length:event.key==='ArrowLeft'?(index+gravityTabs.length-1)%gravityTabs.length:event.key==='Home'?0:event.key==='End'?gravityTabs.length-1:-1;if(next<0)return;event.preventDefault();selectGravityTab(gravityTabs[next].dataset.tab,true);});
}
for(const event of ['praxis-language-change','praxis-course-presentation-change'])window.addEventListener(event,()=>{render();playLabel();});
document.addEventListener('visibilitychange',()=>{last=0;});
window.addEventListener('hashchange',()=>selectGravityTab(location.hash.slice(1)));
window.addEventListener('load',()=>selectGravityTab(location.hash.slice(1)||'newton'));
new ResizeObserver(()=>render()).observe($('gravity-root'));
window.PraxisGravity={get state(){return {...state};},get angle(){return angle;},get playing(){return playing;},select:selectGravityTab};
