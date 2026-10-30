/* Connect the imported lesson to the same preferences and scientific roles as all Praxis labs. */
(() => {
 function sound(){Sound.on=PraxisSound.enabled&&!document.hidden;}
 function palette(){const p=PraxisScientificColors.palette(PraxisCourseLocalization.colors);for(const [key,role]of Object.entries({accent:'blue',accent2:'blue',gold:'orange',cyan:'teal',violet:'purple',green:'green',red:'red',ice:'blue',ether:'teal'})){Sims.colors[key]=p[role];document.documentElement.style.setProperty('--'+(key==='accent2'?'accent-2':key),p[role]);}Object.assign(Sims.colors,{text:'#253f46',bright:'#1d3339',grid:'#d5e0dc',axis:'#526970',fill:p.blue+'26',fillGold:p.orange+'26'});const zoom=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;for(const canvas of document.querySelectorAll('canvas'))canvas.style.minWidth=+(canvas.dataset.logicalWidth||canvas.getAttribute('width'))*zoom+'px';Sims.frame(0);}
 function historyLabels(){const history=document.querySelector('.liquefaction-history table');if(history){const headers=[...history.querySelectorAll('thead th')].map(cell=>cell.textContent);for(const row of history.querySelectorAll('tbody tr'))[...row.children].forEach((cell,i)=>cell.dataset.label=headers[i]);}}
 document.addEventListener('languagechange',historyLabels);
 function language(){I18N.set(PraxisI18n.language);MathJ.typeset(document.getElementById('praxis-original'));historyLabels();for(const canvas of document.querySelectorAll('canvas'))canvas.setAttribute('aria-label',canvas.closest('.demo')?.querySelector('h3')?.textContent||'Diagramă de schimbare de fază');}
 function syncBoiling(){
  const s=Sims.get('fierb'),heat=s.mode==='heat',group=document.getElementById('boilHeatingControls');if(!group)return;group.hidden=!heat;
  for(const button of document.querySelectorAll('[data-boil-mode]')){const selected=button.dataset.boilMode===s.mode;button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));}
  const pull=document.getElementById('fieSyringe'),push=document.getElementById('boilPush'),run=document.getElementById('boilRun');pull.hidden=heat;push.hidden=heat;pull.disabled=s.pulled;push.disabled=!s.pulled;
  const runText=I18N.t(s.running?'ui.pause':'ui.run');if(run.textContent!==runText)run.textContent=runText;run.setAttribute('aria-pressed',String(s.running));
  document.getElementById('boilThresholdLegend').hidden=!heat;
  const events=document.getElementById('boilEvents'),signature=JSON.stringify([I18N.lang,s.events]);if(events.dataset.signature!==signature){events.dataset.signature=signature;events.replaceChildren(...s.events.slice(-6).map(event=>{const li=document.createElement('li');li.textContent=I18N.t(event.key)+' · '+Util.num(event.t,1)+' s';return li;}));events.hidden=!s.events.length;}events.setAttribute('aria-label',I18N.t('boil.events'));
 }
 window.PraxisBoilingUI={sync:syncBoiling};
 function wireBoiling(){
  const s=Sims.get('fierb');const controls=()=>{for(const [id,value]of [['fieP',s.pSet],['fieQ',s.q]]){const input=document.getElementById(id);input.value=value;Util.paint(input);input.dispatchEvent(new Event('input',{bubbles:true}));}};for(const button of document.querySelectorAll('[data-boil-mode]'))button.addEventListener('click',()=>{s.prepare(button.dataset.boilMode);controls();syncBoiling();Sims.frame(0);});
  document.getElementById('boilPush').addEventListener('click',()=>{s.push();syncBoiling();Sims.frame(0);});document.getElementById('boilRun').addEventListener('click',()=>{s.running=!s.running;s.report();syncBoiling();Sims.frame(0);});
  for(const id of ['fieSyringe','fieReset'])document.getElementById(id).addEventListener('click',()=>{if(id==='fieReset')controls();syncBoiling();Sims.frame(0);});syncBoiling();
 }
 window.addEventListener('praxis-language-change',language);window.addEventListener('praxis-sound-change',sound);document.addEventListener('visibilitychange',sound);window.addEventListener('praxis-course-presentation-change',palette);window.addEventListener('resize',()=>Sims.frame(0));
 function start(){sound();language();palette();wireBoiling();for(const canvas of document.querySelectorAll('canvas')){canvas.setAttribute('role','img');canvas.setAttribute('aria-label',canvas.closest('.demo')?.querySelector('h3')?.textContent||'Diagramă de schimbare de fază');}document.addEventListener('click',event=>{if(event.target.closest('[data-all]'))document.querySelectorAll('.step-head').forEach(button=>button.setAttribute('aria-expanded',String(button.closest('li').classList.contains('open'))));});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
