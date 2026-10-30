// Added by the importer inside the original simulation closure.
function applyAtomicPalette(){
  const palette=window.PraxisScientificColors.palette(window.PraxisCourseLocalization.colors);
  for(const [atom,role]of Object.entries({Ne:'orange',Ar:'blue',O:'red',X:'purple'}))ATOMS[atom].c=palette[role];
  Object.assign(COL,{curve:palette.red,attr:palette.orange,rep:palette.purple,tot:palette.green,point:palette.purple,guide:palette.purple+'80'});
  for(const [key,role]of Object.entries({attr:'orange',rep:'purple',tot:'green'}))document.documentElement.style.setProperty('--atomic-'+key,palette[role]);
}
applyAtomicPalette();
window.addEventListener('load',()=>document.querySelectorAll('.custom-only input').forEach(input=>input.closest('.praxis-range-stepper')?.querySelectorAll('button').forEach(button=>button.disabled=input.disabled)),{once:true});
$('#distance').addEventListener('input',event=>{st.r=clamp(+event.target.value,.88*st.sigma,rMaxView);st.v=0;draw();});
if(document.documentElement.dataset.praxisStandalone==='true'){
  document.querySelector('[data-tab=resurse]').remove();document.getElementById('resurse').remove();
}
const tabs=[...document.querySelectorAll('[data-tab]')];
function selectSection(id,{updateHash=true}={}){
  if(!tabs.some(tab=>tab.dataset.tab===id))id='sim';
  for(const tab of tabs){const selected=tab.dataset.tab===id;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;const panel=document.getElementById(tab.dataset.tab);panel.hidden=!selected;panel.setAttribute('aria-labelledby',tab.id);}
  window.PraxisSound.stopAll();st.drag=null;last=performance.now();
  if(id==='sim'){resize();draw();}
  if(updateHash)history.replaceState(null,'','#'+id);
  const selector=document.querySelector('.praxis-course-sections');if(selector)selector.value=id;
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectSection(tab.dataset.tab));
  tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();tabs[next].click();});
});
window.addEventListener('hashchange',()=>selectSection(location.hash.slice(1),{updateHash:false}));
window.addEventListener('praxis-course-presentation-change',()=>{applyAtomicPalette();if(!$('#sim').hidden){resize();draw();}});
window.addEventListener('praxis-language-change',()=>{syncSliders();if(!$('#sim').hidden)draw();});
document.addEventListener('visibilitychange',()=>{last=performance.now();st.drag=null;});
selectSection(location.hash.slice(1),{updateHash:false});
