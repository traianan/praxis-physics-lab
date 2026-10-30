(() => {
 // Put calculated values and transport controls beside the drawing they describe.
 for(const lab of document.querySelectorAll('.lab')){
  const stage=lab.querySelector('.stage'),controls=lab.querySelector('.controls'),visual=document.createElement('div');visual.className='curvilinear-visual';stage.before(visual);visual.append(stage);
  for(const card of [...controls.children])if(card.querySelector('.reads')||(card.querySelector('.btns')&&!card.querySelector('.sld')))visual.append(card);
 }
 const ids=['teorie','viteza','acceleratie'];
 function pause(){TH.play=false;cancelAnimationFrame(TH.raf);S1.paused=true;S2.paused=true;P.paused=true;}
 function sync(){const active=ids.find(id=>document.getElementById('panel-'+id).classList.contains('active'));for(const id of ids){const button=document.getElementById('curvilinear-tab-'+id);button.tabIndex=id===active?0:-1;const section=document.getElementById('panel-'+id);section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',button.id);}return active;}
 window.addEventListener('praxis-curvilinear-tab-change',()=>{pause();sync();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
 window.addEventListener('praxis-course-presentation-change',()=>{drawTheory();drawSim1(0);drawSim2(0);drawEllipse(0);});
 const tabs=document.querySelector('.praxis-lab-nav .tabs');tabs.setAttribute('role','tablist');
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const current=ids.indexOf(event.target.dataset.tab),next=event.key==='Home'?0:event.key==='End'?2:(current+(event.key==='ArrowLeft'?-1:1)+3)%3;const button=document.getElementById('curvilinear-tab-'+ids[next]);button.click();button.focus();});
 for(const range of document.querySelectorAll('.sld input[type=range]')){
  const grid=range.closest('.sld'),label=grid.querySelector('label');label.id=range.id+'-label';label.htmlFor=range.id;range.setAttribute('aria-labelledby',label.id);grid.querySelector('input[type=number]')?.setAttribute('aria-labelledby',label.id);
  range.closest('.praxis-range-stepper')?.querySelectorAll('button').forEach((button,index)=>{button.setAttribute('aria-label',index?'Crește':'Scade');button.setAttribute('aria-describedby',label.id);});
 }
 for(const [id,name]of [['theoryCanvas','Coarda și tangenta la traiectorie'],['simEllipse','Traiectorie plană și vectorul viteză'],['sim1','Mișcare circulară uniformă'],['sim2','Accelerația și cercul osculator']]){const canvas=document.getElementById(id);canvas.setAttribute('role','img');canvas.setAttribute('aria-label',name);}
 new ResizeObserver(()=>{drawTheory();drawSim1(0);drawSim2(0);drawEllipse(0);}).observe(document.querySelector('main.wrap'));
 sync();
})();
