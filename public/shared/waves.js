/* Wait for the React lesson, then attach the common shell without remounting it. */
(()=>{
 const theme=()=>document.documentElement.dataset.theme=document.documentElement.classList.contains('dark')?'dark':'light';theme();new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 function ready(){if(!document.querySelector('.praxis-course-tools'))return false;{
  const tools=document.querySelector('.praxis-course-tools');
  const nativeActions=[...document.querySelectorAll('#root header button')];
  for(const [index,source]of nativeActions.entries()){const proxy=document.createElement('button');proxy.type='button';proxy.className='praxis-wave-native-action';proxy.dataset.sound='none';proxy.textContent=index===0?'📚 Mod Lecție':source.textContent;proxy.setAttribute('aria-label',index===0?'📚 Mod Lecție':'Comută tema luminoasă/întunecată');proxy.addEventListener('click',()=>source.click());tools.append(proxy);if(index===1)new MutationObserver(()=>{if(proxy.textContent!==source.textContent)proxy.textContent=source.textContent;}).observe(source,{childList:true,subtree:true,characterData:true});}
  const label=document.createElement('label');label.className='praxis-wave-volume';label.append(document.createTextNode('Volum'));const range=document.createElement('input');range.type='range';range.dataset.noI18n='';range.min='0';range.max='100';range.step='1';range.value=String(Math.round(window.PraxisWavesAudio.volume*100));range.setAttribute('aria-label','Volum');const output=document.createElement('output');output.textContent=range.value+'%';range.addEventListener('input',()=>{window.PraxisWavesAudio.setVolume(range.value/100);output.textContent=range.value+'%';});label.append(range,output);for(const direction of [-1,1]){const button=document.createElement('button');button.type='button';button.textContent=direction<0?'−':'+';button.setAttribute('aria-label',direction<0?'Scade Volum cu 1':'Crește Volum cu 1');button.addEventListener('click',()=>{range[direction<0?'stepDown':'stepUp']();range.dispatchEvent(new Event('input',{bubbles:true}));});direction<0?range.before(button):range.after(button);}tools.append(label);const print=document.createElement('button');print.type='button';print.textContent='Tipărește';print.addEventListener('click',()=>window.print());tools.append(print);window.PraxisI18n.apply(tools);
 }return true;}
 if(!ready()){const observer=new MutationObserver(()=>{if(ready())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}

 function compactInstruments(){
  const captions={1:['Coarda vibrantă · reprezentare încetinită','Forma de undă a sunetului generat'],2:['Modurile castronului · reprezentare schematică','Spectrul sunetului generat','Forma de undă a sunetului generat'],4:['Bara vibrantă · reprezentare încetinită']};
  for(const index of [1,2,3,4]){
   const panel=document.getElementById('laborator-content-'+index);if(!panel)continue;
   const card=panel.querySelector('.lesson-drum')||[...panel.children].find(e=>e.tagName==='DIV'&&e.querySelector('canvas,.lesson-drum-svg'));if(!card||card.dataset.instrumentLayout)continue;
   let figures=0,analysis=false;
   for(const child of card.children){let role='';
    if(child.querySelector('h3'))role='heading';
    else if(child.tagName==='FIGURE'||child.matches('svg'))role=figures++===0?'visual':'analysis';
    else if(child.querySelector('canvas')){role='analysis';figures+=child.querySelectorAll('canvas').length;}
    else if(child.matches('.lesson-drum-controls')||child.querySelector('input,select'))role='controls';
    else if(child.querySelector('button,audio'))role='actions';
    else role='note';
    child.dataset.instrumentRole=role;if(role==='analysis')analysis=true;
   }
   card.dataset.instrumentLayout=analysis?'analysed':'simple';
   for(const [i,caption]of [...card.querySelectorAll('[data-wave-caption]')].entries())if(captions[index]?.[i])caption.textContent=captions[index][i];
   for(const figure of card.querySelectorAll('[data-instrument-role=analysis].praxis-wave-figure,[data-instrument-role=analysis] .praxis-wave-figure')){const caption=figure.querySelector('figcaption');if(caption){const note=document.createElement('span');note.className='praxis-signal-idle-note';note.textContent='Pornește instrumentul pentru a afișa semnalul.';caption.append(note);}}
   window.PraxisI18n.apply(card);
  }
 }
 document.addEventListener('click',event=>{const actions=event.target.closest('[data-instrument-role=actions]');if(actions&&event.target.closest('button:not(:disabled)'))actions.closest('[data-instrument-layout]').dataset.signalReady='true';},true);
 compactInstruments();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;compactInstruments();});}).observe(document.getElementById('root'),{childList:true,subtree:true});
})();
