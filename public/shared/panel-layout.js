/* Measure alternative explanations in inert copies, never by operating live controls.
   The reservation is a minimum: unexpected content remains fully visible. */
(() => {
 'use strict';
 const entries=new Map();let frame=null;
 const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 function schedule(){if(frame===null)frame=requestAnimationFrame(fit);}
 function register(selector,variants,{html=false}={}){
  let added=false;
  for(const element of document.querySelectorAll(selector)){
   if(entries.has(element)||element.hasAttribute('data-praxis-panel-probe'))continue;
   added=true;
   const entry={variants,html,width:0,maximum:0,key:'',signature:''};entries.set(element,entry);
   element.dataset.praxisStable='';
   if(getComputedStyle(element).display==='inline')element.style.display='inline-block';
   entry.resize=new ResizeObserver(()=>{const e=entries.get(element);if(e&&Math.abs(element.getBoundingClientRect().width-e.width)>.5)schedule();});entry.resize.observe(element);
   entry.mutation=new MutationObserver(schedule);entry.mutation.observe(element,{childList:true,characterData:true,subtree:true});
  }if(added)schedule();
 }
 function fit(){
  frame=null;
  const key=[document.documentElement.style.fontSize,window.PraxisI18n?.language,document.documentElement.dataset.courseTouch].join('|');
  for(const [element,entry]of entries){
   if(!element.isConnected){entry.resize.disconnect();entry.mutation.disconnect();entries.delete(element);continue;}
   const width=element.getBoundingClientRect().width;if(!width)continue;
   const changed=entry.key!==key||Math.abs(width-entry.width)>.5;
   const signature=element.innerHTML.replace(/[-−+]?\d+(?:[.,]\d+)?/g,'#');
   // Animation clocks need no new layout measurement when only digits change.
   if(!changed&&signature===entry.signature)continue;entry.signature=signature;
   if(changed){entry.maximum=0;entry.key=key;entry.width=width;}
   const probe=element.cloneNode(false);probe.removeAttribute('id');probe.removeAttribute('data-praxis-stable');probe.removeAttribute('data-no-i18n');probe.dataset.praxisPanelProbe='';probe.setAttribute('aria-hidden','true');probe.inert=true;
   // IDs and controls are never copied; only explanatory markup is accepted.
   probe.style.setProperty('width',width+'px','important');element.after(probe);
   const variants=changed?(typeof entry.variants==='function'?entry.variants():entry.variants):[];
   const samples=[element.innerHTML,...variants.map(s=>entry.html?s:escape(s))];
   for(const sample of samples){
    probe.innerHTML=sample;probe.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
    probe.querySelectorAll('script,style,input,button,select,textarea,canvas,svg').forEach(e=>e.remove());
    window.PraxisI18n?.apply(probe);
    entry.maximum=Math.max(entry.maximum,Math.ceil(probe.getBoundingClientRect().height));
   }
   probe.remove();const value=entry.maximum+'px';
   if(element.style.getPropertyValue('--praxis-panel-height')!==value)element.style.setProperty('--praxis-panel-height',value);
  }
 }
 function mount(){
  const id=document.body.dataset.praxisCourse;
  const text=(selector,values)=>register(selector,values);
  // Dense comparison tables become labelled rows when the reading width is small.
  const tables=[...document.querySelectorAll('#praxis-original table.comparison-table,#praxis-original #synthTable')];
  function tableLabels(){for(const table of tables){const headings=[...table.querySelectorAll('thead th')];table.dataset.praxisResponsive='';for(const row of table.tBodies[0]?.rows||[])for(const [i,cell]of [...row.cells].entries()){
   const heading=headings[i]?.cloneNode(true);heading?.querySelectorAll('.katex-mathml').forEach(e=>e.remove());
   // An attribute keeps visual labels out of numeric cell values and CSV exports.
   cell.dataset.praxisTableLabel=heading?.textContent.trim().replace(/\s+/g,' ')||'';
  }}}
  tableLabels();window.addEventListener('praxis-language-change',tableLabels);
  for(const table of tables)if(table.tHead)new MutationObserver(tableLabels).observe(table.tHead,{childList:true,characterData:true,subtree:true});
  if(id==='miscarea-rectilinie'){
   register('#acc-info',()=>window.MR?.accelerationInfoVariants?.()||[],{html:true});
   text('#acc-status',['Apasă Start: la fiecare 0,5 s corpul lasă o urmă pe pistă.','Distanțele dintre urme succesive (m): 99,99 · 99,99 · 99,99 · 99,99 · 99,99 · 99,99 · 99,99 · 99,99']);
   text('#dep-status',['Δx = 0: corpul se află în aceeași poziție. Viteza medie este nulă, chiar dacă între timp corpul s-ar fi putut mișca.','Δx < 0: corpul s-a deplasat în sensul negativ al axei, deci și viteza medie este negativă.']);
   text('#mru-status',['v < 0: corpul se mișcă în sensul negativ al axei Ox; x(t) este o dreaptă descrescătoare (panta = −99,9 m/s).']);
   text('#met-status',['Nu se întâlnesc niciodată: au aceeași viteză, deci distanța dintre ele nu se schimbă.','Aceeași poziție inițială și aceeași viteză: mobilele sunt mereu în același loc.']);
  }
  if(id==='viteza-si-acceleratia'){
   register('#curv-lbl-p1',['Raza cercului R:','Viteza inițială de lansare v<sub>0</sub>:','Semiaxa orizontală A<sub>x</sub>:'],{html:true});
   register('#curv-lbl-p2',['Viteza unghiulară &omega;:','Viteza unghiulară inițială &omega;<sub>0</sub>:','Unghiul de lansare &alpha; (grade):','Semiaxa verticală A<sub>y</sub>:'],{html:true});
   register('#curv-lbl-p3',['Accelerația unghiulară &epsilon; (blocat 0):','Accelerația gravitațională g:','Pulsația &omega;:'],{html:true});
   text('#curv-val-p1',['−999.99 m/s']);text('#curv-val-p2',['−999.99 rad/s']);text('#curv-val-p3',['−999.99 rad/s²']);
   register('#poly-events-analysis',[
    '<strong>🔍 Analiza Momentelor Caracteristice în [0, 8 s]:</strong><br>• <strong>Momente de oprire / întoarcere (v = 0):</strong> t = <strong>7.99 s</strong> (x = −9999.9 m), t = <strong>7.99 s</strong> (x = −9999.9 m)<br>• <strong>Accelerație nulă (a = 0, extrem al vitezei):</strong> t = <strong>7.99 s</strong> (v = −9999.99 m/s)',
    '<strong>🔍 Analiza Momentelor Caracteristice în [0, 8 s]:</strong><br>• <strong>Oprire (v = 0):</strong> Mobilul nu își schimbă sensul de mers în intervalul [0, 8 s].<br>• <strong>Accelerația a(t)</strong> nu se anulează în intervalul [0, 8 s].'
   ],{html:true});
  }
  if(id==='miscarea-curbilinie-plana'){
   for(const prefix of ['p','s2'])for(const [suffix,values]of [
    ['A',['Raza R (u)','Semiaxa orizontală a (u)','Extinderea orizontală L/2 (u)']],
    [prefix==='p'?'Ang':'T',['Semiaxa verticală b (u)','Extinderea verticală h (u)']],
    [prefix==='p'?'V':'K',['Durata parcurgerii (s)','Durata unui tur T (s)']]
   ]){const label=document.getElementById(prefix+suffix)?.closest('.sld')?.querySelector('label');if(label){label.dataset.shapeLabel=prefix+suffix;text('[data-shape-label="'+prefix+suffix+'"]',values);}}
   text('#pParamInfo',[
   'Trage punctele albastre pentru a modela curba. Linia punctată este poligonul de control, nu traiectoria.',
   'Porțiune de curbă deschisă, fără perioadă. Animația se oprește la capăt.',
   'Traiectorie închisă. Durata unui tur caracterizează mișcarea ilustrată.'
   ]);
  }
  if(id==='compunerea-oscilatiilor'){
   text('label[for=phase]',['Diferența de fază Δφ','Faza inițială Oy, Δφ']);
   const variants=window.PraxisCompositionPanelVariants?.()||{};
   for(const [name,samples]of Object.entries(variants))register('#'+name,samples,{html:name==='analysis'});
  }
  if(id==='figuri-chladni'){
   const chipSlots=()=>text('#chips button',['9999999,9 Hz · (12,12)']);chipSlots();
   const chips=document.getElementById('chips');if(chips)new MutationObserver(chipSlots).observe(chips,{childList:true});
   text('#fOut',['99999999,99 Hz']);
   text('#modeOut',['Rezonanță apropiată: 12 diametre nodale, 12 cercuri nodale.','Între rezonanțe: vibrație redusă; figura anterioară poate persista.']);
   text('#settlingInfo',['Alege o rezonanță pentru a vedea figura nodală.','Figura punctată arată nodurile modului ales. Nisipul se adună treptat în apropierea lor.','Figura punctată arată nodurile modului ales. Excitația este slabă în acest punct; mută excitatorul sau mărește amplitudinea.']);
   text('#audioInfo',['Frecvența este în afara benzii audio a demonstrației; tonul este oprit.','Tonul are frecvența generatorului. Volumul audio este separat de amplitudinea vibrației.','Audio indisponibil.']);
   text('#dims',['Diametru: 99,9 cm; grosime: 99,9 mm; rigiditate D = 99999,999 N·m; factor K = 99999,999 Hz; ν = 0,33.']);
   text('#driveOut',['Punct de excitație: x/a = −0,99, y/a = −0,99.']);
  }
  if(id==='principiul-i-al-termodinamicii')text('#clap_status',['✓ Ecuația este satisfăcută','⚠ Valorile nu satisfac ecuația de stare']);
  // Numeric readouts use their existing complete row structure, with a conservative
  // signed number width. Measurement does not modify physical values or run time.
  const numeric='#praxis-original .coupled-readout,#praxis-original .readout:not(:has([data-praxis-stable])),#praxis-original .ro';
  register(numeric,[],{html:true});
  for(const element of document.querySelectorAll(numeric)){
   const entry=entries.get(element);if(entry)entry.variants=()=>{
    const copy=element.cloneNode(true),walker=document.createTreeWalker(copy,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode())node.data=node.data.replace(/[-−]?\d+(?:[.,]\d+)?/g,'−9999,999');
    return[copy.innerHTML];
   };
  }
  for(const event of ['resize','praxis-language-change','praxis-course-presentation-change'])window.addEventListener(event,()=>{for(const e of entries.values())e.key='';schedule();});
  document.fonts?.ready.then(()=>{for(const e of entries.values())e.key='';schedule();});
 }
 window.PraxisPanelLayout={register,refresh:()=>{for(const e of entries.values())e.key='';schedule();}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else queueMicrotask(mount);
})();
