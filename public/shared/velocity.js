/* Lifecycle and accessibility for the imported laboratory; models live in app.js. */
(() => {
 const labs=[rectLab,curvLab,polyLab],tabs=['teorie','rectiliniu','curbiliniu','polinom'];
 function sync(){
  const active=tabs.find(id=>document.getElementById('tab-'+id).classList.contains('active'));
  for(const id of tabs){const button=document.getElementById('btn-tab-'+id),section=document.getElementById('tab-'+id);button.setAttribute('aria-selected',String(id===active));button.tabIndex=id===active?0:-1;button.setAttribute('aria-controls',section.id);button.setAttribute('role','tab');section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',button.id);}
  const select=document.querySelector('.praxis-course-sections');if(select)select.value=active;
  updatePanHints();
 }
 document.querySelector('.praxis-lab-nav .tabs').setAttribute('role','tablist');
 document.addEventListener('click',sync);
 document.querySelector('.praxis-lab-nav .tabs').addEventListener('keydown',event=>{
  const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;
  event.preventDefault();const index=tabs.findIndex(id=>'btn-tab-'+id===event.target.id);
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length;
  const button=document.getElementById('btn-tab-'+tabs[next]);button.click();button.focus();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)labs.forEach(lab=>lab.pause());});
 window.addEventListener('pagehide',()=>labs.forEach(lab=>lab.pause()));
 window.addEventListener('praxis-course-presentation-change',()=>labs.forEach(lab=>lab.draw()));
 const canvases=[...document.querySelectorAll('canvas')];
 const panHints=new Map();
 canvases.forEach(canvas=>{
  const region=canvas.closest('.canvas-wrapper');if(!region)return;
  const hint=document.createElement('p');hint.className='velocity-pan-hint';hint.id=canvas.id+'-pan-hint';hint.textContent='Glisează orizontal pentru a explora diagrama.';hint.hidden=true;
  region.after(hint);region.setAttribute('role','region');region.setAttribute('aria-describedby',hint.id);panHints.set(canvas,{region,hint});
  window.PraxisI18n.apply(hint);
 });
 function updatePanHints(){for(const {region,hint}of panHints.values()){const overflow=region.clientWidth>0&&region.scrollWidth>region.clientWidth+1;hint.hidden=!overflow;region.tabIndex=overflow?0:-1;}}
 const resize=new ResizeObserver(entries=>{for(const entry of entries){const index=canvases.indexOf(entry.target);if(index>=0&&entry.contentRect.width>0)labs[index].draw();}updatePanHints();});
 canvases.forEach(canvas=>resize.observe(canvas));
 window.addEventListener('resize',()=>{labs.forEach(lab=>lab.draw());updatePanHints();});
 for(const slider of document.querySelectorAll('#praxis-original input[type=range]')){
  const label=slider.closest('.slider-item')?.querySelector('.slider-header');
  if(label){label.id=slider.id+'-label';slider.setAttribute('aria-labelledby',label.id);const stepper=slider.closest('.praxis-range-stepper');stepper?.querySelectorAll('button').forEach((button,index)=>{button.setAttribute('aria-label',index?'Crește':'Scade');button.setAttribute('aria-describedby',label.id);});}
 }
 document.querySelectorAll('canvas').forEach((canvas,index)=>{const description=['Mișcare rectilinie: vectori și grafice x(t), v(t)','Mișcare în plan: traiectorie și vectori','Legi polinomiale: grafice x(t), v(t), a(t)'][index];canvas.setAttribute('role','img');canvas.setAttribute('aria-label',description);panHints.get(canvas)?.region.setAttribute('aria-label',description);});
 sync();
})();
