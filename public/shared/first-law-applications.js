/* Bridge the imported lesson to the library preferences; the source stays intact. */
(() => {
 const syncSound=()=>{Sound.on=PraxisSound.enabled&&!document.hidden;};
 syncSound();window.addEventListener('praxis-sound-change',syncSound);
 document.addEventListener('visibilitychange',()=>{syncSound();if(document.hidden)Sound.engineStop();});
 const syncLanguage=()=>{I18N.set(PraxisI18n.language);MathJ.typeset(document.getElementById('praxis-original'));};
 window.addEventListener('praxis-language-change',syncLanguage);
 window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);document.querySelector('.tabs [data-nav="'+CSS.escape(name)+'"]')?.click();});
 const roles={accent:'blue',accent2:'blue',gold:'orange',cyan:'teal',violet:'purple',green:'green',red:'red'};
 function palette(){
  const p=PraxisScientificColors.palette(PraxisCourseLocalization.colors);
  for(const [key,role]of Object.entries(roles)){Sims.colors[key]=p[role];document.documentElement.style.setProperty('--'+(key==='accent2'?'accent-2':key),p[role]);}
  const molecules=Sims.get('mol').data;for(const [type,role]of [['mono','teal'],['di','orange'],['poly','purple']])molecules[type].color=p[role];
  Object.assign(Sims.colors,{text:'#52625b',bright:'#203c31',grid:'#dbe5df',axis:'#6b7b73',fill:p.blue+'38',fillGold:p.orange+'33'});
  Sims.frame(0);
 }
 window.addEventListener('praxis-course-presentation-change',palette);
 window.addEventListener('resize',()=>Sims.resize());
 document.addEventListener('click',event=>{if(!event.target.closest('[data-all]'))return;document.querySelectorAll('.step-head').forEach(button=>button.setAttribute('aria-expanded',String(button.closest('li').classList.contains('open'))));});
 // course.js observes the native DOMContentLoaded boot; run this after that boot too.
 const start=()=>{syncSound();syncLanguage();palette();document.querySelectorAll('canvas').forEach(canvas=>{canvas.setAttribute('role','img');canvas.setAttribute('aria-label',canvas.closest('.demo')?.querySelector('h3')?.textContent||'Diagramă termodinamică');});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
