// Browser QA: evaluate this function on the thermodynamics page, after load.
async function auditThermodynamicsTabs(){
 const touch=document.getElementById('course-touch');if(touch.getAttribute('aria-pressed')!=='true')touch.click();
 const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),issues=[];let samples=0;
 const check=()=>{samples++;const active=PraxisThermodynamicsTabs.activeSection,visible=[...document.querySelectorAll('section.sec')].filter(s=>s.checkVisibility());
 if(visible.length!==1||visible[0].id!==active)issues.push({type:'visible-panels',active,visible:visible.map(s=>s.id)});
 if(document.documentElement.scrollWidth>innerWidth+1)issues.push({type:'horizontal-page',active});
 const section=document.getElementById(active);
 for(const el of section.querySelectorAll('.box,.katex-display'))if(el.checkVisibility()&&el.scrollWidth>el.clientWidth+2)issues.push({type:'formula-overflow',active,text:el.textContent.slice(0,70)});
 for(const canvas of section.querySelectorAll('canvas')){const labels=PraxisVelocityLabels.inspect(canvas.getContext('2d')).filter(l=>l.box);for(const l of labels){const b=l.box;if(b.x<-.5||b.y<-.5||b.x+b.w>canvas._w+.5||b.y+b.h>canvas._h+.5)issues.push({type:'canvas-label',active,text:l.text});}
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i].box,b=labels[j].box;if(Math.min(a.x+a.w,b.x+b.w)>Math.max(a.x,b.x)+1&&Math.min(a.y+a.h,b.y+b.h)>Math.max(a.y,b.y)+1)issues.push({type:'label-overlap',active,texts:[labels[i].text,labels[j].text]});}}
 for(const sim of ALL)if(!section.contains(sim.fig)&&sim.raf!==null)issues.push({type:'hidden-animation',active,figure:sim.fig.id});
 };
 const initialLanguage=PraxisI18n.language;const capture=()=>[...document.querySelectorAll('.sec .text>p,.sec-head h2,.thermo-subtabs [role=tab]')].map(e=>e.textContent);
 await PraxisI18n.setLanguage('ro');const romanian=capture();await PraxisI18n.setLanguage('en');await PraxisI18n.setLanguage('ro');
 if(capture().some((text,i)=>text!==romanian[i]))issues.push({type:'language-roundtrip'});
 if(document.querySelectorAll('.praxis-lab-nav [data-mode]').length||document.querySelectorAll('#fig1 [data-mode]').length!==3)issues.push({type:'misplaced-figure-controls'});
 await PraxisI18n.setLanguage(initialLanguage);
 for(const primary of document.querySelectorAll('.thermo-tabs>[role=tab]')){primary.click();await settle();const panel=document.getElementById(primary.getAttribute('aria-controls')),children=[...panel.querySelectorAll('.thermo-subtabs>[role=tab]')];if(children.length)for(const button of children){button.click();await settle();check();}else check();}
 PraxisThermodynamicsTabs.select('s1',{scroll:false});await settle();const range=document.querySelector('#fig1 input[type=range]'),before=range.value;range.value=400;range.dispatchEvent(new Event('input',{bubbles:true}));
 PraxisThermodynamicsTabs.select('s14',{scroll:false});document.querySelector('#quiz .q button').click();const answered=document.querySelectorAll('#quiz .q.done').length;
 PraxisThermodynamicsTabs.select('s15',{scroll:false});const answer=document.querySelector('#probs input');answer.value='98';document.querySelector('#probs [data-a=chk]').click();
 PraxisThermodynamicsTabs.select('s1',{scroll:false});await settle();if(range.value!=='400')issues.push({type:'slider-state'});range.value=before;range.dispatchEvent(new Event('input',{bubbles:true}));
 PraxisThermodynamicsTabs.select('s14',{scroll:false});if(document.querySelectorAll('#quiz .q.done').length!==answered)issues.push({type:'quiz-state'});
 PraxisThermodynamicsTabs.select('s15',{scroll:false});if(answer.value!=='98'||!document.querySelector('#probs .pb').classList.contains('solved'))issues.push({type:'problem-state'});
 document.getElementById('menuBtn').click();const link=document.querySelector('#drawerBody a[href="#s10"]');link.click();await settle();if(PraxisThermodynamicsTabs.activeSection!=='s10')issues.push({type:'contents-navigation'});check();
 const last=document.querySelector('.thermo-tabs [aria-selected=true]');last.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await settle();if(PraxisThermodynamicsTabs.activeSection!=='s13')issues.push({type:'arrow-navigation',active:PraxisThermodynamicsTabs.activeSection});check();
 return {viewport:innerWidth+'x'+innerHeight,language:PraxisI18n.language,touch:touch.getAttribute('aria-pressed'),samples,groups:document.querySelectorAll('.thermo-tabs>[role=tab]').length,sections:document.querySelectorAll('section.sec').length,issues};
}
