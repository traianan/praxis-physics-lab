(() => {
 const buttons=[...document.querySelectorAll('#praxis-original [role="tab"][data-tab]')];
 const panels=new Map(buttons.map(button=>[button.dataset.tab,document.querySelector(`#praxis-original [data-rr-panel="${button.dataset.tab}"]`)]));
 if(!buttons.length||[...panels.values()].some(panel=>!panel))throw new Error('Reflexia/refracția tab structure is incomplete');
 let active='deschidere';
 function select(id,{focus=false,updateHash=true}={}){
  if(!panels.has(id))return;
  active=id;
  for(const button of buttons){const selected=button.dataset.tab===id;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;if(selected&&focus)button.focus();}
  for(const [key,panel]of panels){panel.hidden=key!==id;}
  if(updateHash&&location.hash!==`#${id}`)history.replaceState(null,'',`#${id}`);
  const selector=document.querySelector('.praxis-course-sections');if(selector)selector.value=id;
  requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  document.dispatchEvent(new CustomEvent('praxis-lab-tab-change',{detail:{id}}));
 }
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>select(button.dataset.tab));
  button.addEventListener('keydown',event=>{
   let next=index;
   if(event.key==='ArrowRight')next=(index+1)%buttons.length;
   else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=buttons.length-1;
   else return;
   event.preventDefault();select(buttons[next].dataset.tab,{focus:true});
  });
 });
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link)return;
  const id=decodeURIComponent(link.getAttribute('href').slice(1));if(panels.has(id))select(id,{updateHash:false});
 },true);
 window.addEventListener('hashchange',()=>select(location.hash.slice(1),{updateHash:false}));
 const requested=location.hash.slice(1);select(panels.has(requested)?requested:'deschidere',{updateHash:false});
})();
