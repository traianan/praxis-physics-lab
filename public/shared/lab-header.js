/* The one header component used by every integrated laboratory. */
(() => {
 function mount({title,chapter,courseId,returnHref,replace,before,actions=[]}){
  const standalone=document.documentElement.dataset.praxisStandalone==='true';
  const base=new URL(standalone?'./':'../../',location.href),home=new URL(standalone?'index.html':'?home=1',base);
  const header=document.createElement('header');header.className='topbar praxis-lab-header';
  const logo=document.createElement('a');logo.className='brand praxis-lab-logo';logo.href=home.href;logo.title='Acasă — biblioteca de fizică';logo.setAttribute('aria-label',logo.title);
  const icon=document.createElement('img');icon.src=new URL('assets/favicon.svg',base).href;icon.width=37;icon.height=39;icon.alt='';
  const word=document.createElement('span');word.className='praxis-lab-wordmark';word.textContent='praxis';const small=document.createElement('small');small.textContent='SCIENCE LAB';word.append(small);logo.append(icon,word);
  const path=document.createElement('nav');path.className='praxis-lab-path';path.setAttribute('aria-label','Navigare în lecție');
  const label=document.createElement('span');label.textContent='Laboratoare interactive';path.append(label);
  const separator=()=>{const span=document.createElement('span');span.className='praxis-breadcrumb-separator';span.textContent='/';span.setAttribute('aria-hidden','true');return span;};
  const id=courseId||document.body.dataset.praxisCourse||location.pathname.match(/\/([^/]+)\/index\.html$/)?.[1];
  const parent=chapter||window.PraxisLessonChapters?.[id];
  if(parent){const link=document.createElement(standalone||typeof parent==='string'?'span':'a');link.className='praxis-lab-chapter';link.textContent=typeof parent==='string'?parent:parent.title;if(link.tagName==='A')link.href=new URL('#capitol/'+parent.id,base).href;path.append(separator(),link);}
  const current=document.createElement('strong');current.textContent=title;current.setAttribute('aria-current','page');path.append(separator(),current);
  const tools=document.createElement('div');tools.className='top-actions praxis-lab-actions';const back=document.createElement('a');back.className='button secondary library-return';back.href=returnHref||base.href;back.textContent='← Bibliotecă';back.setAttribute('aria-label','Înapoi la biblioteca de fizică');tools.append(back,...actions,window.PraxisSound.createToggle({compact:true}),window.PraxisI18n.createSelector());
  header.append(logo,path,tools);if(replace)replace.replaceWith(header);else(before||document.body.firstChild).before(header);
  if(standalone){back.hidden=true;logo.title='Acasă — începutul lecției';logo.setAttribute('aria-label',logo.title);}
  const translate=()=>window.PraxisI18n.apply(header);translate();window.addEventListener('praxis-language-change',translate);
  new ResizeObserver(()=>document.documentElement.style.setProperty('--praxis-header-height',header.getBoundingClientRect().height+'px')).observe(header);
  return {header,logo,tools};
 }
 window.PraxisLabHeader={mount};
})();
/* praxis:content-types */
window.PraxisLessonChapters={"oglinzi-si-lentile":{"id":"lumina-si-radiatii","title":"Lumină și radiații"},"miscarea-rectilinie":{"id":"miscare","title":"Mișcare"},"unde-mecanice":{"id":"sunete-si-unde","title":"Sunete și unde"},"calcul-vectorial":{"id":"miscare","title":"Mișcare"},"viteza-si-acceleratia":{"id":"miscare","title":"Mișcare"},"miscarea-curbilinie-plana":{"id":"miscare","title":"Mișcare"},"notiuni-termodinamice":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"calorimetrie":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"principiul-i-al-termodinamicii":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"interactii-atomice":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"principiul-i-aplicatii":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"transformari-stare-agregare":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"oscilator-mecanic":{"id":"sunete-si-unde","title":"Sunete și unde"},"oscilatori-mecanici-cuplati":{"id":"sunete-si-unde","title":"Sunete și unde"},"compunerea-oscilatiilor":{"id":"sunete-si-unde","title":"Sunete și unde"},"figuri-chladni":{"id":"sunete-si-unde","title":"Sunete și unde"},"miscarea-circulara-uniforma":{"id":"miscare","title":"Mișcare"},"principiile-mecanicii-newtoniene":{"id":"miscare","title":"Mișcare"},"motoare-termice":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"}};
window.PraxisContentCatalog={"version":"1.0.0","policy":"Use one small decorative icon per meaningful heading or navigation item. Keep its text label. Never decorate individual equations, scientific symbols, controls or every paragraph.","icons":{"book":"M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1V5Zm9 1v14","flask":"M9 3h6m-5 0v6L4 19a1.3 1.3 0 0 0 1.2 2h13.6a1.3 1.3 0 0 0 1.2-2L14 9V3M7 15h10","chart":"M4 3v17h17M7 15l4-5 4 3 5-7","pencil":"m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z","check":"M21 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10M8 11l4 4L22 4","formula":"M19 4H6l8 8-8 8h13","link":"M10 13a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2M14 11a4 4 0 0 0-6 0l-4 4a4 4 0 0 0 6 6l2-2"},"types":[{"id":"introduction","ro":"Introducere","en":"Introduction","icon":null,"usage":"Lesson overview and objectives; the title already supplies hierarchy."},{"id":"theory","ro":"Explicații","en":"Explanations","icon":"book","usage":"Definitions, physical interpretation and theoretical derivations."},{"id":"simulation","ro":"Simulare","en":"Simulation","icon":"flask","usage":"Interactive scenes and animated demonstrations."},{"id":"experiment","ro":"Experiment","en":"Experiment","icon":"flask","usage":"Measurements, instrument controls and experimental protocols."},{"id":"diagram","ro":"Grafice și rezultate","en":"Graphs and results","icon":"chart","usage":"Plots, diagrams, measured values and result summaries; not individual axes."},{"id":"formula","ro":"Formule","en":"Formulas","icon":"formula","usage":"Named formula collections and formula maps; never inside mathematical expressions."},{"id":"problem","ro":"Probleme rezolvate","en":"Worked problems","icon":"pencil","usage":"Problem statements and worked solutions; not each algebraic step."},{"id":"assessment","ro":"Verificare","en":"Self-check","icon":"check","usage":"Quizzes, numerical questions and self-assessment sections."},{"id":"summary","ro":"Sinteză","en":"Summary","icon":"book","usage":"Recap tables and concept summaries."},{"id":"glossary","ro":"Glosar","en":"Glossary","icon":"book","usage":"A collection of definitions; not each individual term."},{"id":"journal","ro":"Jurnal de laborator","en":"Lab journal","icon":"book","usage":"Editable observations and experiment records; preserve users' text."},{"id":"resources","ro":"Resurse","en":"Resources","icon":"link","usage":"Further lessons, references and offline downloads."},{"id":"note","ro":"Precizare științifică","en":"Scientific note","icon":null,"usage":"Model limits, assumptions and scientific cautions; use quiet borders rather than repeated icons."},{"id":"controls","ro":"Controale","en":"Controls","icon":null,"usage":"Sliders, numerical inputs and playback. Retain their existing functional icons."}]};
/* Classify presentation landmarks without moving or replacing React or lesson content nodes. */
(() => {
 if(window.PraxisContentUI)return;
 const catalog=window.PraxisContentCatalog;
 const kinds=new Map(catalog.types.map(type=>[type.id,type]));
 const normalize=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function classify(text){
  text=normalize(text);
  if(/jurnal|journal/.test(text))return 'journal';
  if(/glosar|glossary/.test(text))return 'glossary';
  if(/harta formule|formula map|formule|formulas/.test(text))return 'formula';
  if(/sintez|recapitul|summary|recap/.test(text))return 'summary';
  if(/resurse|resources|alte lectii|other lessons|references|descarca|download/.test(text))return 'resources';
  if(/verifica|test\b|quiz|autoeval|self.check/.test(text))return 'assessment';
  if(/problema|probleme|problem|exerciti|exercise|aplicatie:|worked/.test(text))return 'problem';
  if(/experiment|masuratori|measurements/.test(text))return 'experiment';
  if(/simul|laborator|laboratory|\bdemo\b/.test(text))return 'simulation';
  if(/diagram|grafic|graph|plot/.test(text))return 'diagram';
  if(/explic|theor|teori|definit|interpret|concept/.test(text))return 'theory';
  return null;
 }
 function annotate(root=document){
  for(const el of root.querySelectorAll('h2,h3,.scene-title,.fig-h>b,.fig-h>strong,.praxis-lab-nav .tab,.lesson-groups button')){
   if(el.closest('dialog,[contenteditable],.katex,.fx,svg,canvas,.step-body')||el.querySelector('svg,img')||/^\p{Extended_Pictographic}/u.test(el.textContent.trim())||el.hasAttribute('data-no-content-icon'))continue;
   const contextual=el.matches('.scene-title,.fig-h>b,.fig-h>strong')?'simulation':el.matches('#teorie h2')?'theory':null;
   const explicit=el.dataset.contentType,kind=explicit||contextual||classify(el.textContent)||(el.matches('.sec-head h2,.lesson-section>h2')?'theory':null);
   if(!kind||!kinds.has(kind))continue;
   if(el.dataset.contentType!==kind)el.dataset.contentType=kind;
   const icon=kinds.get(kind).icon;if(icon&&el.dataset.contentIcon!==icon)el.dataset.contentIcon=icon;
  }
 }
 function legend(){
  const dialog=document.getElementById('guide-dialog');if(!dialog||dialog.querySelector('.praxis-content-key'))return;
  const details=document.createElement('details');details.className='praxis-content-key';
  const summary=document.createElement('summary');summary.textContent='Reperele lecțiilor';details.append(summary);
  const list=document.createElement('ul');
  for(const id of ['theory','simulation','diagram','formula','problem','assessment','resources']){const type=kinds.get(id),item=document.createElement('li');item.dataset.contentIcon=type.icon;item.textContent=type.ro;list.append(item);}
  details.append(list);dialog.querySelector('#guide-start')?.before(details);window.PraxisI18n?.apply(details);
 }
 function start(){
  annotate();legend();let pending=false;
  new MutationObserver(records=>{if(!records.some(record=>record.type==='characterData'||[...record.addedNodes].some(node=>node.nodeType===1)))return;if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;annotate();legend();});}}).observe(document.body,{subtree:true,childList:true,characterData:true});
 }
 window.PraxisContentUI={catalog,classify,annotate};
 window.addEventListener('praxis-language-change',()=>annotate());
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* Separate readout fields visually without changing mathematical products. */
(()=>{
 function normalize(value){let s=String(value);if((s.match(/=/g)||[]).length>=2)s=s.replace(/\s+[·•]\s+(?=[A-Za-zΑ-ω0-9_′₀-₉]+(?:\/[A-Za-zΑ-ω0-9_]+)?(?:\s*\([^)]{0,16}\))?(?:\s+(?:real|total|max|min|crit))?\s*=)/g,'\u2003');return s
  .replace(/(\d(?:[.,]\d+)?\s*(?:kg|g|°C|K))\s+[·•]\s+(?=[~−+]?\d+(?:[.,]\d+)?\s*(?:°|tori|atm))/g,'$1\u2003')
  .replace(/(\d+)\s+[·•]\s+(?=T\s*≈)/g,'$1\u2003')
  .replace(/(K)\s+[·•]\s+(?=p\/p)/g,'$1\u2003')
  .replace(/(%)\s+[·•]\s+(?=L\s+\d)/g,'$1\u2003');}
 window.PraxisScientificReadouts={normalize};
 if(window.CanvasRenderingContext2D)for(const name of ['fillText','strokeText']){const native=CanvasRenderingContext2D.prototype[name];CanvasRenderingContext2D.prototype[name]=function(s,...args){return native.call(this,normalize(s),...args);};}
 function start(){const root=document.getElementById('praxis-original')||document.body;const update=node=>{if(node.nodeType!==3||node.parentElement?.closest('script,style,.katex,.fx,.formula,[data-fx],[data-fx-inline],textarea,input,[contenteditable]'))return;const value=normalize(node.data);if(value!==node.data)node.data=value;};const scan=node=>{if(node.nodeType===3)return update(node);const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())update(n);};scan(root);new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')update(r.target);else for(const n of r.addedNodes)scan(n);}}).observe(root,{childList:true,characterData:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

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

window.PraxisLabWorkspaceConfig={"oglinzi-si-lentile":{"workspaces":[{"selector":".workspace","controls":".controls-card","scene":".experiment-column","layout":"native"}]},"miscarea-rectilinie":{"workspaces":[{"selector":".card.sim","controls":".sim-side","scene":".sim-main","graphs":".sim-main>.grid-2","layout":"motion"},{"selector":".type-card","scene":".stage","layout":"native"}],"activities":[{"scope":"#mru","items":":scope>.block","default":2},{"scope":"#mruv","items":":scope>.block","default":1},{"scope":"#tipuri","items":":scope>.block","default":0}],"reading":".panel>.hero"},"unde-mecanice":{"react":true,"workspaces":[{"selector":"[data-instrument-layout]","scene":"[data-instrument-role=visual]","controls":"[data-instrument-role=controls]","graphs":"[data-instrument-role=analysis]","layout":"native"},{"selector":".lesson-part-content","scene":".praxis-wave-figure","layout":"native"}]},"calcul-vectorial":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"viteza-si-acceleratia":{"workspaces":[{"selector":".lab-layout","scene":".canvas-workspace","controls":".control-panel","layout":"split"}]},"miscarea-curbilinie-plana":{"workspaces":[{"selector":".lab","scene":".curvilinear-visual","controls":".controls","layout":"split"}]},"notiuni-termodinamice":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"calorimetrie":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"principiul-i-al-termodinamicii":{"workspaces":[{"selector":".section .card:has(.transform-graphs)","scene":".transform-graphs","layout":"native"}],"secondaryGroups":[{"scope":".section","items":":scope>.card:first-child"}]},"interactii-atomice":{"workspaces":[{"selector":"#sim>.sim","scene":":scope>.stage","controls":":scope>aside","layout":"split"}]},"principiul-i-aplicatii":{"workspaces":[{"selector":".grid-2:has(>.demo)","scene":":scope>.demo","layout":"reading"}],"reading":".grid-2:has(>.demo)>.prose"},"transformari-stare-agregare":{"workspaces":[{"selector":".grid-2:has(>.demo)","scene":":scope>.demo","layout":"reading"}],"reading":".grid-2:has(>.demo)>.prose"},"oscilator-mecanic":{"workspaces":[{"selector":".demo-shell","scene":".demo-body","controls":".demo-controls","layout":"native"}],"activities":[{"scope":"#s111","items":":scope>.demo-shell","default":0},{"scope":"#s112","items":":scope>.demo-shell","default":0},{"scope":"#s113","items":":scope>.demo-shell","default":0},{"scope":"#s114","items":":scope>.demo-shell","default":0}],"secondaryGroups":[{"scope":".chapter:has(.demo-shell)","items":":scope>.story-card,:scope>p,:scope>blockquote,:scope>ol,:scope>ul,:scope>.defbox,:scope>h3"}]},"oscilatori-mecanici-cuplati":{"workspaces":[{"selector":".lab-panel","scene":".sim-row","controls":".controls","layout":"native"}]},"compunerea-oscilatiilor":{"workspaces":[{"selector":"[data-composition-section=laborator]>.layout","scene":".visuals","controls":".controls","layout":"split"}]},"figuri-chladni":{"workspaces":[{"selector":"[data-chladni-section=laborator]>.grid","scene":":scope>section","controls":":scope>aside","layout":"native"}]},"miscarea-circulara-uniforma":{"react":true,"workspaces":[{"selector":"#sim-mcu,#sim-curba","scene":"canvas.mcu-canvas","layout":"native"}]},"principiile-mecanicii-newtoniene":{"workspaces":[{"selector":".newton-demo","scene":".newton-stage","controls":".newton-controls","layout":"split"}]},"motoare-termice":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"}};
/* Shared presentation only. Keep scientific nodes, listeners and state alive. */
(() => {
 'use strict';
 if(window.PraxisLabWorkspace)return;
 const mounted=new WeakSet(),grouped=new WeakSet(),noted=new WeakSet(),labels=new Map();
 const words={ro:{preferences:'Preferințe laborator',reading:'Explicații și formule',introduction:'Introducere',activities:'Activități'},en:{preferences:'Laboratory preferences',reading:'Explanations and formulas',introduction:'Introduction',activities:'Activities'}};
 const language=()=>window.PraxisI18n?.language==='en'?'en':'ro';
 function caption(el,key){labels.set(el,key);el.textContent=words[language()][key];}
 function disclosure(element,key){
  if(element.closest('.praxis-workspace-disclosure'))return element.closest('.praxis-workspace-disclosure');
  const details=document.createElement('details'),summary=document.createElement('summary');
  details.className='praxis-workspace-disclosure';caption(summary,key);details.append(summary);
  element.before(details);details.append(element);
  details.addEventListener('toggle',()=>{if(details.open)window.dispatchEvent(new Event('resize'));});
  return details;
 }
 function activities(scope,config){
  if(grouped.has(scope))return;
  const items=[...scope.querySelectorAll(config.items)];if(items.length<2)return;
  grouped.add(scope);
  const nav=document.createElement('nav');nav.className='praxis-workspace-activities';nav.setAttribute('aria-label',words[language()].activities);
  let selected=Math.min(config.default,items.length-1);
  const buttons=items.map((item,index)=>{
   item.dataset.workspaceActivity=String(index);
   const heading=item.querySelector('h2,h3,h4');const button=document.createElement('button');button.type='button';
   button.textContent=heading?.textContent.trim()||String(index+1);button.dataset.sound='none';
   const select=()=>{
    selected=index;items.forEach((el,i)=>{el.dataset.workspaceActive=String(i===index);buttons[i].setAttribute('aria-pressed',String(i===index));});
    window.dispatchEvent(new Event('resize'));
   };
   button.addEventListener('click',select);nav.append(button);return button;
  });
  items.forEach((item,index)=>{item.dataset.workspaceActive=String(index===selected);buttons[index].setAttribute('aria-pressed',String(index===selected));});
  items[0].before(nav);
  // Translate with the lesson's own renderer, rather than retain stale copies.
  window.addEventListener('praxis-language-change',()=>{nav.setAttribute('aria-label',words[language()].activities);items.forEach((item,i)=>{const heading=item.querySelector('h2,h3,h4');if(heading)buttons[i].textContent=heading.textContent.trim();});});
 }
 function mount(root=document){
  const body=document.body;if(!body?.dataset.praxisLaboratory)return;
  const id=body.dataset.praxisCourse||location.pathname.match(/\/([^/]+)\/(?:index\.html)?$/)?.[1];
  const config=window.PraxisLabWorkspaceConfig?.[id];if(!config)return;
  body.dataset.praxisWorkspace=id;
  for(const entry of config.workspaces){
   for(const workspace of root.querySelectorAll(entry.selector)){
    if(mounted.has(workspace))continue;mounted.add(workspace);workspace.dataset.workspaceLayout=entry.layout;
    for(const role of ['controls','scene','graphs'])if(entry[role])for(const el of workspace.querySelectorAll(entry[role]))el.dataset.workspaceRole=role;
    if(entry.layout==='motion'){
     const controls=workspace.querySelector('.sim-side'),transport=workspace.querySelector('.transport');
     if(controls&&transport)controls.prepend(transport);
     // Scientific derivations follow the working instrument; keep operating hints
     // beside it. Only this explicit, non-React lesson adapter moves these nodes.
     const block=workspace.parentElement;
     const theory=[...block.children].filter(el=>el.matches('.def,.grid-3'));
     if(theory.length){const details=disclosure(theory[0],'reading');details.append(...theory);block.append(details);}
     for(const el of controls?.querySelectorAll('.chips,.checks')||[]){
      const title=el.previousElementSibling?.matches('.group-title')?el.previousElementSibling:null;
      const details=disclosure(el,'preferences');if(title)details.insertBefore(title,el);
     }
    }
   }
  }
  if(!config.react){
   for(const entry of config.activities||[])for(const scope of root.querySelectorAll(entry.scope))activities(scope,entry);
   for(const entry of config.secondaryGroups||[])for(const scope of root.querySelectorAll(entry.scope)){
    if(noted.has(scope))continue;noted.add(scope);
    const notes=[...scope.querySelectorAll(entry.items)].filter(el=>!el.querySelector('input,button,select,textarea,canvas,svg'));
    if(notes.length){const details=disclosure(notes[0],'reading');details.append(...notes);scope.append(details);}
   }
   if(config.reading)for(const el of root.querySelectorAll(config.reading)){
    if(!el.querySelector('input,button,select,textarea,canvas')){
     const details=disclosure(el,el.classList.contains('hero')?'introduction':'reading');
     if(el.classList.contains('hero')&&details.nextElementSibling)details.parentElement.append(details);
    }
   }
  }
  for(const tools of document.querySelectorAll('.praxis-course-tools')){
   const details=disclosure(tools,'preferences'),nav=document.querySelector('.praxis-lab-nav');
   if(nav&&details.parentElement!==nav)nav.append(details);
  }
 }
 window.PraxisLabWorkspace={mount};
 function start(){
  mount();
  // React and imported bridges can mount after DOMContentLoaded. Observe additions
  // only; numerical animation text and our attributes never retrigger this scan.
  let frame=null;
  const observer=new MutationObserver(records=>{
   if(!records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&!node.closest?.('[data-praxis-panel-probe]'))))return;
   if(frame===null)frame=requestAnimationFrame(()=>{frame=null;mount();});
  });observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('praxis-language-change',()=>{for(const [el,key]of labels){if(el.isConnected)caption(el,key);else labels.delete(el);}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* /praxis:content-types */
