// Move existing nodes, preserving all native handlers and simulation state.
(()=>{
 const root=document.getElementById('praxis-original');
 const disclose=(node,label)=>{const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=label;details.append(summary);node.before(details);details.append(node);return details;};
 const side=root.querySelector('.side');
 root.querySelector('.site-foot').before(root.querySelector('.pendulum-help'));
 const advanced=document.createElement('div');
 const damping=root.querySelector('#inDamp').closest('.ctl');damping.before(advanced);
 advanced.append(damping,root.querySelector('#inSpeed').closest('.ctl'));
 disclose(advanced,'Amortizare și viteză');
 const custom=root.querySelector('#inGcustom');const updateGravity=()=>{custom.closest('.praxis-range-stepper')?.toggleAttribute('hidden',root.querySelector('#inG').value!=='custom');custom.hidden=root.querySelector('#inG').value!=='custom';};
 root.querySelector('#inG').addEventListener('change',updateGravity);window.addEventListener('load',updateGravity);updateGravity();
 disclose(side.children[1],'Afișare');
 const readouts=side.querySelector('.readout-grid');disclose(readouts,'Date calculate');
 const data=root.querySelector('.data');disclose(data.children[1],'Măsurători');
 const legend=document.createElement('section');legend.className='card pendulum-command-legend';legend.setAttribute('aria-labelledby','pendulum-legend-title');
 legend.innerHTML='<div class="card-h"><h3 id="pendulum-legend-title">Legendă comenzi</h3></div><dl><dt>← / →</dt><dd>Aplică un impuls spre stânga / dreapta. Poate accelera, frâna sau inversa mișcarea.</dd><dt>Start / Pauză</dt><dd>Pornește sau oprește temporar simularea.</dd><dt>Reset</dt><dd>Reia oscilația de la amplitudinea aleasă, cu timpul zero.</dd><dt>Echilibru</dt><dd>Oprește pendulul vertical, cu viteză zero.</dd><dt>Măsoară</dt><dd>Cronometrează 10 oscilații complete și adaugă rezultatul în tabel.</dd></dl>';
 data.firstElementChild.after(legend);
 const tasks=root.querySelector('#tasksList').parentElement;tasks.style.gridArea='tasks';disclose(tasks,'Fișă de activități').style.gridArea='tasks';
 root.querySelectorAll('.chart-tools button').forEach(button=>{button.setAttribute('aria-selected',String(button.classList.contains('active')));button.addEventListener('click',()=>root.querySelectorAll('.chart-tools button').forEach(b=>b.setAttribute('aria-selected',String(b===button))));});
 root.querySelector('#inGcustom').setAttribute('aria-label','Accelerație gravitațională personalizată');
 root.querySelector('#chart').setAttribute('aria-label','Graficele pendulului');
 const modal=root.querySelector('#modal');let previousFocus;
 new MutationObserver(()=>{if(!modal.classList.contains('open'))previousFocus?.focus();}).observe(modal,{attributes:true,attributeFilter:['class']});
 for(const id of ['btnHelp','btnAbout']){const button=root.querySelector('#'+id);button.addEventListener('focus',()=>{previousFocus=button;});}
 modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const items=[...modal.querySelectorAll('button,a[href],input,select')].filter(el=>!el.hidden&&!el.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 for(const group of document.querySelectorAll('[role=tablist]'))group.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...group.querySelectorAll('[role=tab]')];const current=tabs.indexOf(document.activeElement);if(current<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(current+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();});
})();
