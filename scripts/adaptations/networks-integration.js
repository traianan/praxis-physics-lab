document.getElementById('network-pause').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
Router.init();initStaticCircuits();initKirchhoff();InstrumentLab.init();initProblems();Quiz.init();Board.init();
Router.on('g-gen',()=>GenLab.init());Router.on('g-lab',()=>{Board.init();Board.compute();});
for(const button of document.querySelectorAll('[data-tab]'))button.addEventListener('click',()=>Router.go(button.dataset.tab));
const tabs=[...document.querySelectorAll('[data-tab]')];
for(const h of document.querySelectorAll('.prob-head')){h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-expanded',String(h.parentElement.classList.contains('open')));h.addEventListener('click',()=>h.setAttribute('aria-expanded',String(h.parentElement.classList.contains('open'))));h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click();}});}
const help=document.getElementById('helpModal'),helpButton=document.getElementById('network-help');
helpButton.addEventListener('click',()=>{help.classList.add('open');document.getElementById('helpClose').focus();});
function closeHelp(){help.classList.remove('open');helpButton.focus();}
document.getElementById('helpClose').addEventListener('click',closeHelp);help.addEventListener('click',e=>{if(e.target===help)closeHelp();});help.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp();if(e.key==='Tab'){e.preventDefault();document.getElementById('helpClose').focus();}});
for(const input of document.querySelectorAll('.control input[type=range]')){const label=input.parentElement.querySelector('label');if(label&&!label.htmlFor)label.htmlFor=input.id;}
for(const piece of document.querySelectorAll('.piece')){let touchStart;piece.addEventListener('pointerdown',e=>{touchStart=e.pointerType==='touch'||e.pointerType==='pen'?{x:e.clientX,y:e.clientY}:null;});piece.addEventListener('pointerup',e=>{if(touchStart&&Math.hypot(e.clientX-touchStart.x,e.clientY-touchStart.y)<12){Board.addPiece(piece.dataset.type,380,220);Board.render();Board.compute();}touchStart=null;});piece.tabIndex=0;piece.setAttribute('role','button');piece.setAttribute('aria-label',piece.textContent.trim());piece.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();Board.addPiece(piece.dataset.type,380,220);Board.render();Board.compute();}});}
for(const h of document.querySelectorAll('.section-head h2'))h.dataset.contentType=h.closest('.view').id.includes('theory')?'theory':h.closest('.view').id.includes('quiz')?'assessment':h.closest('.view').id.includes('problems')?'problem':'simulation';
const extra=document.querySelector('.network-extra');
extra.append(document.getElementById('sSpeed').closest('.control'),document.getElementById('pillState'));
const flowNote=document.createElement('p');flowNote.textContent='Punctele animate indică sensul convențional al curentului; nu reprezintă electroni.';extra.append(flowNote);
document.querySelector('#sSpeed').closest('.control').querySelector('label span').textContent='Viteza marcatorilor';
const nodeHint=document.getElementById('animHint');const hintDetails=document.createElement('details');hintDetails.innerHTML='<summary>Interpretarea modelului</summary>';nodeHint.before(hintDetails);hintDetails.append(nodeHint);
const observer=new MutationObserver(()=>{const target=document.querySelector('.praxis-workspace-disclosure');if(target&&extra.parentElement!==target){target.append(extra);observer.disconnect();}});observer.observe(document.body,{subtree:true,childList:true});
// Keep original explanatory supplements available, without pushing the primary experiment below them.
for(const id of ['view-k-anim','view-k-lab']){const section=document.getElementById(id),split=section.querySelector('.split');if(!split)continue;const trailing=[];let node=split.nextElementSibling;while(node){trailing.push(node);node=node.nextElementSibling;}if(trailing.length){const details=document.createElement('details'),summary=document.createElement('summary');details.className='network-details';summary.textContent=id==='view-k-anim'?'Ecuațiile nodurilor':'Ecuații, rezultate și trasee';details.append(summary,...trailing);section.append(details);}}
for(const section of document.querySelectorAll('.view')){const lead=section.querySelector('.section-head .lead');if(lead){let details=section.querySelector('.network-details');if(!details){details=document.createElement('details');details.className='network-details';details.innerHTML='<summary>Explicații și interpretare</summary>';section.append(details);}details.append(lead);}}
document.querySelector('#view-k-anim .network-details').append(hintDetails);
const inspector=document.getElementById('inspector'),meterCard=document.getElementById('meters').closest('.card'),measureDetails=document.createElement('details');
measureDetails.innerHTML='<summary>Măsurători și bilanț</summary>';measureDetails.open=true;measureDetails.append(...meterCard.childNodes);meterCard.append(inspector,measureDetails);meterCard.classList.add('network-meter-panel');
const meterHint=measureDetails.querySelector('.hint');if(meterHint)document.querySelector('#view-g-lab .network-details').append(meterHint);
new MutationObserver(()=>{if(inspector.querySelector('input'))measureDetails.open=false;}).observe(inspector,{childList:true});
const paletteHint=document.querySelector('.palette-card>.hint');if(paletteHint)document.querySelector('#view-g-lab .network-details').append(paletteHint);
const currentReadout=document.createElement('p');currentReadout.className='network-currents';document.querySelector('#view-k-lab .canvas-card').append(currentReadout);
const updateCurrents=()=>{const q=LabK.sol;currentReadout.textContent=`I₁ = ${fmt(q.I1,2)} A · I₂ = ${fmt(q.I2,2)} A · I₃ = ${fmt(q.I3,2)} A`;};new MutationObserver(updateCurrents).observe(document.getElementById('kResults'),{childList:true});updateCurrents();
Router.go('k-anim');PraxisI18n.apply(document);
window.PraxisNetworks={Router,NodeAnim,LabK,GenLab,InstrumentLab,Board,Quiz,solveNetlist,PROBLEMS,QUIZ,Flow,snapshot:()=>({active:Router.current,node:{...NodeAnim.S},kirchhoff:{...LabK.sol},board:structuredClone(Board.S),generators:{...GenLab.S}})};
