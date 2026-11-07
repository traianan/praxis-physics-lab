/* Section/activity navigation only: never submit, export or start sound. */
window.PraxisAccessibilityWalk=async(scan,{settleMs=550}={})=>{
 const groupSelector='[role="tablist"],.praxis-workspace-activities,.praxis-lab-nav .tabs,.praxis-lab-nav .module-tabs,#praxis-original .tabs,#praxis-original .mode-tabs,#praxis-original .lab-nav,#praxis-original .lesson-tabs,#praxis-original .lesson-topics,#praxis-original .lesson-parts,#optic-choices';
 const selectSelector='.praxis-course-sections,select[data-workspace-activity],select[data-activity],.wave-group-choice select,.wave-part-choice select';
 const visible=e=>e.isConnected&&e.checkVisibility()&&!e.closest('[hidden],[inert]');
 const label=e=>(e.textContent||e.id).replace(/\s+/g,' ').trim();
 const nodeKey=e=>{if(e.id)return '#'+e.id;const parts=[];for(let n=e;n&&n!==document.body;n=n.parentElement){if(n.id){parts.unshift('#'+n.id);break;}parts.unshift(n.tagName+':'+[...n.parentElement.children].indexOf(n));}return parts.join('/');};
 const groups=()=>[...document.querySelectorAll(groupSelector)].filter(visible);
 const buttons=g=>[...g.querySelectorAll('button,[role="tab"],a[data-tab]')].filter(e=>visible(e)&&!e.disabled&&e.closest(groupSelector)===g&&(e.tagName!=='A'||e.getAttribute('href')?.startsWith('#')));
 const signature=g=>nodeKey(g)+'|'+buttons(g).map(e=>e.id||label(e)).join('~');
 const selectKey=e=>nodeKey(e)+'|'+[...e.options].map(o=>o.value).join('~');
 const visited=new Set(),pending=new Map(),errors=[];let states=0;
 const initialWaveGroup=document.querySelector('.wave-group-choice select')?.selectedOptions[0]?.textContent.trim();
 const capture=async route=>{await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,settleMs)));await scan(route);states++;};
 async function walk(path=[],ancestors=new Set()){
  const lists=[...groups().map(g=>({key:signature(g),kind:'buttons',targets:buttons(g).map(e=>({key:e.id||label(e),label:label(e)}))})),...[...document.querySelectorAll(selectSelector)].filter(visible).map(e=>({key:selectKey(e),kind:'select',targets:[...e.options].filter(o=>!o.disabled).map(o=>({key:o.value,label:o.textContent.trim()}))}))];
  for(const list of lists){if(ancestors.has(list.key))continue;
   for(const target of list.targets){
    const key=list.kind+'|'+list.key+'|'+target.key,route=[...path,target.label];if(visited.has(key))continue;
    let control;if(list.kind==='select')control=[...document.querySelectorAll(selectSelector)].find(e=>visible(e)&&selectKey(e)===list.key);
    else{const group=groups().find(g=>signature(g)===list.key);control=group&&buttons(group).find(e=>(e.id||label(e))===target.key);}
    if(!control&&initialWaveGroup){
     await window.PraxisAccessibilityReplay([initialWaveGroup,...path]);
     if(list.kind==='select')control=[...document.querySelectorAll(selectSelector)].find(e=>visible(e)&&selectKey(e)===list.key);
     else{const group=groups().find(g=>signature(g)===list.key);control=group&&buttons(group).find(e=>(e.id||label(e))===target.key);}
    }
    if(!control){pending.set(key,route);continue;}
    try{
     visited.add(key);pending.delete(key);
     if(list.kind==='select'){Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(control,target.key);control.dispatchEvent(new Event('change',{bubbles:true}));}else control.click();
     await capture(route);await walk(route,new Set([...ancestors,list.key]));
    }catch(error){errors.push({route,error:String(error)});}
   }
  }
 }
 await capture(['initial']);await walk();let before=-1;
 while(visited.size!==before){before=visited.size;await walk();}
 for(const details of document.querySelectorAll('details'))if(visible(details))details.open=true;
 await capture(['expanded disclosures']);
 return {states,visited:visited.size,pending:[...pending.values()],errors,complete:!pending.size&&!errors.length};
};

window.PraxisAccessibilityReplay=async route=>{
 const visible=e=>e.checkVisibility()&&!e.closest('[hidden],[inert]');
 const label=e=>e.textContent.replace(/\s+/g,' ').trim();
 const waveGroup=document.querySelector('.wave-group-choice select');
 if(waveGroup&&waveGroup.value!=='0'){Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(waveGroup,'0');waveGroup.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,100));}
 for(const step of route){
  if(step==='initial')continue;
  if(step==='expanded disclosures'){document.querySelectorAll('details').forEach(e=>{if(visible(e))e.open=true;});continue;}
  const button=[...document.querySelectorAll('button,[role=tab],a[data-tab]')].find(e=>visible(e)&&label(e)===step);
  const select=[...document.querySelectorAll('select')].find(e=>visible(e)&&[...e.options].some(o=>label(o)===step));
  if(button)button.click();
  else if(select){const option=[...select.options].find(o=>label(o)===step);Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,option.value);select.dispatchEvent(new Event('change',{bubbles:true}));}
  else throw new Error('Cannot replay navigation: '+step);
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 await new Promise(resolve=>setTimeout(resolve,550));
};
