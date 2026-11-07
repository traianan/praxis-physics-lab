(() => {
 const root=document.querySelector('.cond-course');
 const panels=[...root.querySelectorAll('[data-cond-panel]')];
 function select(id){
  panels.forEach(p=>p.hidden=p.dataset.condPanel!==id);
  document.querySelectorAll('[data-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===id));b.classList.toggle('active',b.dataset.tab===id);});
  window.dispatchEvent(new Event('resize'));
 }
 root.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.tab)));
 function navigate(){const target=document.getElementById(location.hash.slice(1));const panel=target?.closest('[data-cond-panel]');if(panel){select(panel.dataset.condPanel);const topic=target.closest('.theory-body>section');if(topic)selectTopic(topic);const activity=target.closest('[data-workspace-activity]');if(activity)root.querySelectorAll('.praxis-workspace-activities button')[Number(activity.dataset.workspaceActivity)]?.click();target.scrollIntoView({block:'start'});}}
 window.addEventListener('hashchange',navigate);
 window.addEventListener('load',navigate);
 // Keep supplementary material accessible without burying the experiment controls.
 root.querySelectorAll('.side-card').forEach((card,i)=>{
  if(i<3)return;
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent=card.querySelector('h4').textContent;card.querySelector('h4').remove();
  card.before(details);details.append(summary,card);
 });
 const table=root.querySelector('#dielecTable')?.closest('.table-wrap');
 if(table){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Materiale și permitivități';table.before(d);d.append(s,table);}
 const rc=root.querySelector('#rc'),plot=rc.querySelector('.graph-card'),reference=document.createElement('div'),layout=document.createElement('div');
 layout.className='rc-layout';reference.className='rc-reference';
 const cards=rc.querySelector('.grid'),rcTable=rc.querySelector('.table-wrap'),tableTitle=rcTable.previousElementSibling;
 cards.before(layout);reference.append(cards,tableTitle,rcTable);layout.append(reference,plot);
 const constantTitle=[...rc.querySelectorAll('h3')].find(e=>e.textContent==='Constanta de timp');
 if(constantTitle){const constant=document.createElement('div');constant.className='rc-constant';const formula=constantTitle.nextElementSibling,note=formula.nextElementSibling;constantTitle.before(constant);constant.append(constantTitle,formula,note);}
 const theory=root.querySelector('.theory-body');
 const topics=[...theory.querySelectorAll(':scope>section')];
 function selectTopic(topic){topics.forEach(s=>s.hidden=s!==topic);root.querySelectorAll('.toc a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+topic.id?'true':'false'));window.dispatchEvent(new Event('resize'));}
 root.querySelectorAll('.toc a').forEach(a=>a.addEventListener('click',()=>selectTopic(document.querySelector(a.hash))));
 selectTopic(topics[0]);
 root.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
  const preset=button.dataset.preset,index=['aer','ceramic'].includes(preset)?2:['mare','departe'].includes(preset)?1:0;
  root.querySelectorAll('.praxis-workspace-activities button')[index]?.click();
 },true));
 // Theory sections retain their anchors; the shared UI handles language and preferences.
 window.CondSound={isEnabled:()=>window.PraxisSound.enabled,toggle:()=>window.PraxisSound.setEnabled(!window.PraxisSound.enabled)};
 for(const name of ['tap','click','hover','slide','switchOn','switchOff','charge','discharge','dielectric','chime','correct','wrong'])window.CondSound[name]=()=>{if(!document.hidden)window.PraxisSound.play(name==='chime'||name==='correct'?'event':'select');};
})();
