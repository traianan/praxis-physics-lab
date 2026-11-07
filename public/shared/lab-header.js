/* The one header component used by every integrated laboratory. */
(() => {
 function mount({title,chapter,courseId,returnHref,replace,before,actions=[]}){
  const standalone=document.documentElement.dataset.praxisStandalone==='true';
  const base=new URL(standalone?'./':'../../',location.href),home=new URL(standalone?'index.html':'?home=1',base);
  const header=document.createElement('header');header.className='topbar praxis-lab-header';
  const logo=document.createElement('a');logo.className='brand praxis-lab-logo';logo.href=home.href;logo.title='Acasă — biblioteca de fizică';logo.setAttribute('aria-label','praxis SCIENCE LAB — '+logo.title);
  const icon=document.createElement('img');icon.src=new URL('assets/favicon.svg',base).href;icon.width=37;icon.height=39;icon.alt='';
  const word=document.createElement('span');word.className='praxis-lab-wordmark';word.textContent='praxis ';const small=document.createElement('small');small.textContent='SCIENCE LAB';word.append(small);logo.append(icon,word);
  const path=document.createElement('nav');path.className='praxis-lab-path';path.setAttribute('aria-label','Navigare în lecție');
  const label=document.createElement(standalone?'span':'a');label.textContent='Bibliotecă';if(!standalone)label.href=home.href;path.append(label);
  const separator=()=>{const span=document.createElement('span');span.className='praxis-breadcrumb-separator';span.textContent='/';span.setAttribute('aria-hidden','true');return span;};
  const id=courseId||document.body.dataset.praxisCourse||location.pathname.match(/\/([^/]+)\/index\.html$/)?.[1];
  const parent=chapter||window.PraxisLessonChapters?.[id];
  if(parent){const link=document.createElement(standalone||typeof parent==='string'?'span':'a');link.className='praxis-lab-chapter';link.textContent=typeof parent==='string'?parent:parent.title;if(link.tagName==='A')link.href=new URL('?chapter=1#capitol/'+parent.id,base).href;path.append(separator(),link);}
  const current=document.createElement('strong');current.textContent=title;current.setAttribute('aria-current','page');path.append(separator(),current);
  const tools=document.createElement('div');tools.className='top-actions praxis-lab-actions';const back=document.createElement('a');back.className='button secondary library-return';back.href=returnHref||base.href;back.textContent='← Bibliotecă';back.setAttribute('aria-label','Înapoi la biblioteca de fizică');tools.append(back,...actions,window.PraxisSound.createToggle({compact:true}),window.PraxisI18n.createSelector());
  header.append(logo,path,tools);if(replace)replace.replaceWith(header);else(before||document.body.firstChild).before(header);
  if(standalone){back.hidden=true;logo.title='Acasă — începutul lecției';logo.setAttribute('aria-label','praxis SCIENCE LAB — '+logo.title);}
  const translate=()=>window.PraxisI18n.apply(header);translate();window.addEventListener('praxis-language-change',translate);
  new ResizeObserver(()=>document.documentElement.style.setProperty('--praxis-header-height',header.getBoundingClientRect().height+'px')).observe(header);
  return {header,logo,tools};
 }
 window.PraxisLabHeader={mount};
})();
/* praxis:content-types */
window.PraxisLessonChapters={"condensatorul":{"id":"electricitate-magnetism-circuite","title":"Electricitate, magnetism și circuite"},"legea-lui-coulomb":{"id":"electricitate-magnetism-circuite","title":"Electricitate, magnetism și circuite"},"legea-lui-hooke":{"id":"lucru-energie-putere","title":"Lucru mecanic, energie și putere"},"pila-daniell":{"id":"electricitate-magnetism-circuite","title":"Electricitate, magnetism și circuite"},"laboratorul-electromagnetic-faraday":{"id":"electricitate-magnetism-circuite","title":"Electricitate, magnetism și circuite"},"oglinzi-si-lentile":{"id":"lumina-si-radiatii","title":"Lumină și radiații"},"miscarea-rectilinie":{"id":"miscare","title":"Mișcare"},"unde-mecanice":{"id":"sunete-si-unde","title":"Sunete și unde"},"calcul-vectorial":{"id":"miscare","title":"Mișcare"},"viteza-si-acceleratia":{"id":"miscare","title":"Mișcare"},"miscarea-curbilinie-plana":{"id":"miscare","title":"Mișcare"},"notiuni-termodinamice":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"calorimetrie":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"principiul-i-al-termodinamicii":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"interactii-atomice":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"principiul-i-aplicatii":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"transformari-stare-agregare":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"oscilator-mecanic":{"id":"sunete-si-unde","title":"Sunete și unde"},"oscilatori-mecanici-cuplati":{"id":"sunete-si-unde","title":"Sunete și unde"},"compunerea-oscilatiilor":{"id":"sunete-si-unde","title":"Sunete și unde"},"figuri-chladni":{"id":"sunete-si-unde","title":"Sunete și unde"},"miscarea-circulara-uniforma":{"id":"miscare","title":"Mișcare"},"principiile-mecanicii-newtoniene":{"id":"miscare","title":"Mișcare"},"motoare-termice":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"},"generator-electric":{"id":"electricitate-magnetism-circuite","title":"Electricitate, magnetism și circuite"},"pendulul-gravitational":{"id":"sunete-si-unde","title":"Sunete și unde"},"transformarea-politropa":{"id":"caldura-termodinamica","title":"Căldură și termodinamică"}};
window.PraxisContentCatalog={"version":"1.0.0","policy":"Use one small decorative icon per meaningful heading or navigation item. Keep its text label. Never decorate individual equations, scientific symbols, controls or every paragraph.","icons":{"book":"M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1V5Zm9 1v14","flask":"M9 3h6m-5 0v6L4 19a1.3 1.3 0 0 0 1.2 2h13.6a1.3 1.3 0 0 0 1.2-2L14 9V3M7 15h10","chart":"M4 3v17h17M7 15l4-5 4 3 5-7","pencil":"m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z","check":"M21 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10M8 11l4 4L22 4","formula":"M19 4H6l8 8-8 8h13","link":"M10 13a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2M14 11a4 4 0 0 0-6 0l-4 4a4 4 0 0 0 6 6l2-2"},"types":[{"id":"introduction","ro":"Introducere","en":"Introduction","icon":null,"usage":"Lesson overview and objectives; the title already supplies hierarchy."},{"id":"theory","ro":"Explicații","en":"Explanations","icon":"book","usage":"Definitions, physical interpretation and theoretical derivations."},{"id":"simulation","ro":"Simulare","en":"Simulation","icon":"flask","usage":"Interactive scenes and animated demonstrations."},{"id":"experiment","ro":"Experiment","en":"Experiment","icon":"flask","usage":"Measurements, instrument controls and experimental protocols."},{"id":"diagram","ro":"Grafice și rezultate","en":"Graphs and results","icon":"chart","usage":"Plots, diagrams, measured values and result summaries; not individual axes."},{"id":"formula","ro":"Formule","en":"Formulas","icon":"formula","usage":"Named formula collections and formula maps; never inside mathematical expressions."},{"id":"problem","ro":"Probleme rezolvate","en":"Worked problems","icon":"pencil","usage":"Problem statements and worked solutions; not each algebraic step."},{"id":"assessment","ro":"Verificare","en":"Self-check","icon":"check","usage":"Quizzes, numerical questions and self-assessment sections."},{"id":"summary","ro":"Sinteză","en":"Summary","icon":"book","usage":"Recap tables and concept summaries."},{"id":"glossary","ro":"Glosar","en":"Glossary","icon":"book","usage":"A collection of definitions; not each individual term."},{"id":"journal","ro":"Jurnal de laborator","en":"Lab journal","icon":"book","usage":"Editable observations and experiment records; preserve users' text."},{"id":"resources","ro":"Resurse","en":"Resources","icon":"link","usage":"Further lessons, references and offline downloads."},{"id":"note","ro":"Precizare științifică","en":"Scientific note","icon":null,"usage":"Model limits, assumptions and scientific cautions; use quiet borders rather than repeated icons."},{"id":"controls","ro":"Controale","en":"Controls","icon":null,"usage":"Sliders, numerical inputs and playback. Retain their existing functional icons."}]};
/* Display sampling only: numerical grids, logical coordinates and clocks stay local. */
(() => {
 if(window.PraxisCanvasResolution)return;
 function ratio(width,height){
  const native=Math.max(.5,Number(window.devicePixelRatio)||1);
  if(!(width>0&&height>0))return native;
  return Math.min(Math.max(2,native*1.5),Math.max(native,Math.sqrt(8000000/(width*height))),8192/width,8192/height);
 }
 function forCanvas(canvas){const box=canvas.getBoundingClientRect();return ratio(box.width,box.height);}
 window.PraxisCanvasResolution={ratio,forCanvas};
 let density=window.devicePixelRatio||1,timer,query;
 function watchQuery(){query?.removeEventListener('change',check);query=window.matchMedia?.('(resolution: '+density+'dppx)');query?.addEventListener('change',check,{once:true});}
 function check(){
  if(document.hidden)return;
  const next=window.devicePixelRatio||1;if(next===density)return;
  density=next;watchQuery();window.dispatchEvent(new Event('resize'));
 }
 function start(){if(document.hidden)return;if(timer===undefined)timer=window.setInterval(check,250);check();}
 function stop(){if(timer!==undefined)window.clearInterval(timer);timer=undefined;}
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);
 watchQuery();start();
})();

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

/* praxis:math-runtime */
/* Web only. Autonomous exports replace this loader with the embedded engine. */
(()=>{
 const url=new URL('../simulari/calorimetrie/vendor/katex/katex.min.js',document.currentScript.src).href;
 let pending=null;
 const available=()=>typeof window.katex?.renderToString==='function';
 window.PraxisLoadMathEngine=({retry=false}={})=>{
  if(available())return Promise.resolve(window.katex);
  if(pending&&!retry)return pending;
  if(pending?.loading)return pending;
  let resolve;
  pending=new Promise(done=>{resolve=done;});pending.loading=true;
  const script=document.createElement('script');script.src=url;script.async=true;
  const finish=()=>{
   pending.loading=false;const engine=available()?window.katex:null;
   resolve(engine);window.dispatchEvent(new CustomEvent(engine?'praxis-math-ready':'praxis-math-error'));
   if(!engine)script.remove();
  };
  script.onload=finish;script.onerror=finish;document.head.appendChild(script);
  return pending;
 };
 window.PraxisEnsureMathEngine=()=>{if(available())return window.katex;window.PraxisLoadMathEngine();return null;};
})();

window.PraxisMathFallbackCSS="@font-face{font-family:KaTeX_AMS;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_AMS-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Caligraphic;font-style:normal;font-weight:700;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Caligraphic-Bold.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Caligraphic;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Caligraphic-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Fraktur;font-style:normal;font-weight:700;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Fraktur-Bold.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Fraktur;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Fraktur-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Main;font-style:normal;font-weight:700;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Main-Bold.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Main;font-style:italic;font-weight:700;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Main-BoldItalic.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Main;font-style:italic;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Main-Italic.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Main;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Main-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Math;font-style:italic;font-weight:700;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Math-BoldItalic.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Math;font-style:italic;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Math-Italic.woff2) format(\"woff2\")}@font-face{font-family:\"KaTeX_SansSerif\";font-style:normal;font-weight:700;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_SansSerif-Bold.woff2) format(\"woff2\")}@font-face{font-family:\"KaTeX_SansSerif\";font-style:italic;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_SansSerif-Italic.woff2) format(\"woff2\")}@font-face{font-family:\"KaTeX_SansSerif\";font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_SansSerif-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Script;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Script-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Size1;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Size1-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Size2;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Size2-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Size3;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Size3-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Size4;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Size4-Regular.woff2) format(\"woff2\")}@font-face{font-family:KaTeX_Typewriter;font-style:normal;font-weight:400;font-display:swap;src:url(__PRAXIS_MATH_FONTS__/fonts/KaTeX_Typewriter-Regular.woff2) format(\"woff2\")}.katex{font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0;text-rendering:auto}.katex *{-ms-high-contrast-adjust:none!important;border-color:currentColor}.katex .katex-version:after{content:\"0.16.11\"}.katex .katex-mathml{clip:rect(1px,1px,1px,1px);border:0;height:1px;overflow:hidden;padding:0;position:absolute;width:1px}.katex .katex-html>.newline{display:block}.katex .base{position:relative;white-space:nowrap;width:-webkit-min-content;width:-moz-min-content;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .textrm{font-family:KaTeX_Main}.katex .textsf{font-family:KaTeX_SansSerif}.katex .texttt{font-family:KaTeX_Typewriter}.katex .mathnormal{font-family:KaTeX_Math;font-style:italic}.katex .mathit{font-family:KaTeX_Main;font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-family:KaTeX_Main;font-weight:700}.katex .boldsymbol{font-family:KaTeX_Math;font-style:italic;font-weight:700}.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}.katex .mathcal{font-family:KaTeX_Caligraphic}.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}.katex .mathboldfrak,.katex .textboldfrak{font-family:KaTeX_Fraktur;font-weight:700}.katex .mathtt{font-family:KaTeX_Typewriter}.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}.katex .mathitsf,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}.katex .mainrm{font-family:KaTeX_Main;font-style:normal}.katex .vlist-t{border-collapse:collapse;display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;position:relative;vertical-align:bottom}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .vlist-t2{margin-right:-2px}.katex .vlist-s{display:table-cell;font-size:1px;min-width:2px;vertical-align:bottom;width:2px}.katex .vbox{align-items:baseline;display:inline-flex;flex-direction:column}.katex .hbox{width:100%}.katex .hbox,.katex .thinbox{display:inline-flex;flex-direction:row}.katex .thinbox{max-width:0;width:0}.katex .msupsub{text-align:left}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}.katex .mspace{display:inline-block}.katex .clap,.katex .llap,.katex .rlap{position:relative;width:0}.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}.katex .llap>.inner{right:0}.katex .clap>.inner,.katex .rlap>.inner{left:0}.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}.katex .rule{border:0 solid;display:inline-block;position:relative}.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline{border-bottom-style:dashed;display:inline-block;width:100%}.katex .sqrt>.root{margin-left:.2777777778em;margin-right:-.5555555556em}.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.1666666667em}.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.3333333333em}.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.6666666667em}.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.4566666667em}.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.1466666667em}.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.7142857143em}.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.8571428571em}.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.1428571429em}.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.2857142857em}.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.4285714286em}.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.7142857143em}.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.0571428571em}.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.4685714286em}.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.9628571429em}.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.5542857143em}.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.5555555556em}.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.6666666667em}.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.7777777778em}.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.8888888889em}.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.1111111111em}.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.3333333333em}.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.3044444444em}.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.7644444444em}.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.4166666667em}.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.5833333333em}.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.6666666667em}.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.7283333333em}.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.0733333333em}.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.3472222222em}.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.4166666667em}.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.4861111111em}.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.5555555556em}.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.6944444444em}.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.4402777778em}.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.7277777778em}.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.2893518519em}.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.3472222222em}.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.4050925926em}.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.462962963em}.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.5208333333em}.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037037em}.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.6944444444em}.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.2002314815em}.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.4398148148em}.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.2410800386em}.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.2892960463em}.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.337512054em}.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.3857280617em}.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.4339440694em}.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.4821600771em}.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.5785920926em}.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.6943105111em}.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.8331726133em}.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.1996142719em}.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.2009646302em}.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.2411575563em}.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.2813504823em}.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.3215434084em}.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.3617363344em}.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.4019292605em}.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.4823151125em}.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.578778135em}.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.6945337621em}.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.8336012862em}.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}.katex .delimsizing.size1{font-family:KaTeX_Size1}.katex .delimsizing.size2{font-family:KaTeX_Size2}.katex .delimsizing.size3{font-family:KaTeX_Size3}.katex .delimsizing.size4{font-family:KaTeX_Size4}.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}.katex .nulldelimiter{display:inline-block;width:.12em}.katex .delimcenter,.katex .op-symbol{position:relative}.katex .op-symbol.small-op{font-family:KaTeX_Size1}.katex .op-symbol.large-op{font-family:KaTeX_Size2}.katex .accent>.vlist-t,.katex .op-limits>.vlist-t{text-align:center}.katex .accent .accent-body{position:relative}.katex .accent .accent-body:not(.accent-full){width:0}.katex .overlay{display:block}.katex .mtable .vertical-separator{display:inline-block;min-width:1px}.katex .mtable .arraycolsep{display:inline-block}.katex .mtable .col-align-c>.vlist-t{text-align:center}.katex .mtable .col-align-l>.vlist-t{text-align:left}.katex .mtable .col-align-r>.vlist-t{text-align:right}.katex .svg-align{text-align:left}.katex svg{fill:currentColor;stroke:currentColor;fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;display:block;height:inherit;position:absolute;width:100%}.katex svg path{stroke:none}.katex img{border-style:none;max-height:none;max-width:none;min-height:0;min-width:0}.katex .stretchy{display:block;overflow:hidden;position:relative;width:100%}.katex .stretchy:after,.katex .stretchy:before{content:\"\"}.katex .hide-tail{overflow:hidden;position:relative;width:100%}.katex .halfarrow-left{left:0;overflow:hidden;position:absolute;width:50.2%}.katex .halfarrow-right{overflow:hidden;position:absolute;right:0;width:50.2%}.katex .brace-left{left:0;overflow:hidden;position:absolute;width:25.1%}.katex .brace-center{left:25%;overflow:hidden;position:absolute;width:50%}.katex .brace-right{overflow:hidden;position:absolute;right:0;width:25.1%}.katex .x-arrow-pad{padding:0 .5em}.katex .cd-arrow-pad{padding:0 .55556em 0 .27778em}.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}.katex .boxpad{padding:0 .3em}.katex .fbox,.katex .fcolorbox{border:.04em solid;box-sizing:border-box}.katex .cancel-pad{padding:0 .2em}.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}.katex .angl{border-right:.049em solid;border-top:.049em solid;box-sizing:border-box;margin-right:.03889em}.katex .anglpad{padding:0 .03889em}.katex .eqn-num:before{content:\"(\" counter(katexEqnNo) \")\";counter-increment:katexEqnNo}.katex .mml-eqn-num:before{content:\"(\" counter(mmlEqnNo) \")\";counter-increment:mmlEqnNo}.katex .mtr-glue{width:50%}.katex .cd-vert-arrow{display:inline-block;position:relative}.katex .cd-label-left{display:inline-block;position:absolute;right:calc(50% + .3em);text-align:left}.katex .cd-label-right{display:inline-block;left:calc(50% + .3em);position:absolute;text-align:right}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}.katex-display.fleqn>.katex{padding-left:2em;text-align:left}body{counter-reset:katexEqnNo mmlEqnNo}\n\n.praxis-math-fallback .katex{font-size:1em}".replaceAll("__PRAXIS_MATH_FONTS__",new URL("../simulari/calorimetrie/vendor/katex",document.currentScript.src).href);
/* Capability detection, not device sniffing: modern MathML output stays unchanged. */
(()=>{
 let nativeSupport,stylesInstalled=false;
 const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 function supportsMathML(){
  if(nativeSupport!==undefined)return nativeSupport;
  // Non-DOM consumers (build-time tests) keep the existing MathML serialization.
  if(!document.createElementNS||!document.documentElement)return true;
  const ns='http://www.w3.org/1998/Math/MathML';
  const probe=document.createElement('div'),math=document.createElementNS(ns,'math'),space=document.createElementNS(ns,'mspace');
  probe.style.cssText='position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none;font-size:16px;';
  space.setAttribute('width','77px');space.setAttribute('height','23px');math.appendChild(space);probe.appendChild(math);
  document.documentElement.appendChild(probe);
  const rect=space.getBoundingClientRect();nativeSupport=Math.abs(rect.width-77)<1&&Math.abs(rect.height-23)<1;
  probe.remove();return nativeSupport;
 }
 window.PraxisRenderMath=(source,options)=>{
  const engine=window.PraxisEnsureMathEngine();
  if(!engine)return '<span data-praxis-math-pending="'+escape(JSON.stringify({source,options}))+'">'+escape(source)+'</span>';
  if(supportsMathML())return engine.renderToString(source,options);
  if(!stylesInstalled){
   const style=document.createElement('style');style.id='praxis-math-compatibility';
   style.textContent=window.PraxisMathFallbackCSS;document.head.appendChild(style);stylesInstalled=true;
  }
  // Keep MathML for assistive technology; KaTeX CSS hides it visually and shows HTML.
  return '<span class="praxis-math-fallback">'+engine.renderToString(source,{...options,output:'htmlAndMathml'})+'</span>';
 };
 window.PraxisMathCompatibility={supportsMathML};
 window.addEventListener('praxis-math-ready',()=>{
  // Only hydrate our native placeholders. React adapters rerender their own components.
  for(const host of document.querySelectorAll('[data-praxis-math-pending]')){
   if(host.closest('#root,[data-reactroot],[data-science-owner="react"]'))continue;
   const {source,options}=JSON.parse(host.getAttribute('data-praxis-math-pending'));
   try{host.innerHTML=window.PraxisRenderMath(source,options);host.removeAttribute('data-praxis-math-pending');}
   catch{host.removeAttribute('data-praxis-math-pending');host.classList.add('science-math-error');}
  }
 });
})();

/* Plain-notation core: first validated in waves, also reused by common presentation. */
(()=>{
 const lower={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₙ':'n','ₒ':'o','ₐ':'a','ₑ':'e','ₕ':'h','ᵢ':'i','ⱼ':'j','ₖ':'k','ₗ':'l','ₘ':'m','ₚ':'p','ᵣ':'r','ₛ':'s','ₜ':'t','ᵤ':'u','ᵥ':'v','ₓ':'x','ᵧ':'y'};
 const upper={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+'};
 const greek={λ:'lambda',ν:'nu',ω:'omega',φ:'varphi',ρ:'rho',μ:'mu',π:'pi',θ:'theta',β:'beta',γ:'gamma',δ:'delta',ζ:'zeta',η:'eta',τ:'tau',σ:'sigma',α:'alpha',Δ:'Delta',Ω:'Omega',Σ:'Sigma'};
 const symbols={'·':'\\cdot','×':'\\times','−':'-','±':'\\pm','∓':'\\mp','≈':'\\approx','≠':'\\ne','≤':'\\le','≥':'\\ge','→':'\\to','⇒':'\\Rightarrow','∝':'\\propto','∞':'\\infty','∂':'\\partial','⊥':'\\perp','∥':'\\parallel','⟨':'\\langle','⟩':'\\rangle','°':'{}^{\\circ}','%':'\\%','…':'\\ldots'};
 const escape=s=>String(s).replace(/[\\{}%&#$]/g,c=>'\\'+c);
 const connectors=new Set(['la','cu','în','și','de','pe','un','se','vs','or','if','at','in','on','by','of','is','to','an','as']);
 const htmlEscape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 function htmlProse(source){
  const text=String(source),pattern=/(?<![\p{L}\p{N}_])([A-Za-zΑ-ω])(?:_\{([^}]+)\}|_([\p{L}\p{N}]+)|([₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+))([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]*)|(?<![\p{L}\p{N}_])([A-Za-zΑ-ω])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)/gu;
  let result='',last=0;
  for(const match of text.matchAll(pattern)){
   result+=htmlEscape(text.slice(last,match.index));
   const base=match[1]||match[6],sub=match[2]||match[3]||(match[4]?[...match[4]].map(c=>lower[c]).join(''):''),sup=[...(match[5]||match[7]||'')].map(c=>upper[c]).join('');
   result+='<span class="wave-script">'+htmlEscape(base)+(sub?'<sub>'+htmlEscape(window.PraxisI18n?.tr(sub)??sub)+'</sub>':'')+(sup?'<sup>'+htmlEscape(sup)+'</sup>':'')+'</span>';
   last=match.index+match[0].length;
  }
  return result+htmlEscape(text.slice(last));
 }
 function normalize(s){return String(s).replaceAll('<<','≪').replaceAll('>>','≫').replace(/\b([A-Za-z])([0-9]+)\b/g,'$1_{$2}').replace(/\bv([RSLP])\b/g,'v_{$1}').replace(/(?<=[±∓+−\-(=])\s*v([os])\b/g,'v_{$1}').replace(/[₀₁₂₃₄₅₆₇₈₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+/g,v=>'_{'+[...v].map(c=>lower[c]).join('')+'}').replace(/_\{([^{}]+)\}_\{([^{}]+)\}/g,'_{$1,$2}').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g,v=> '^{'+[...v].map(c=>upper[c]).join('')+'}');}
 function join(nodes){return nodes.map((n,i)=>(i?(n.unit?' \\,':nodes[i-1].kind==='function'&&n.kind==='group'?'':' '):'')+n.tex).join('');}
 function bare(nodes){return nodes.length===1&&nodes[0].kind==='group'&&!nodes[0].preserve?nodes[0].inside:join(nodes);}
 function reduce(nodes){
  for(let i=0;i<nodes.length;i++)if(nodes[i].kind==='slash'){
   let start=i-1;while(start>0&&!['stop','text'].includes(nodes[start-1].kind)&&!(nodes[start].unit&&/^\d/.test(nodes[start-1].tex)))start--;
   let end=i+1;while(end<nodes.length&&!['stop','text','multiply','slash'].includes(nodes[end].kind)){
    if(end>i+1&&nodes[end].boundaryBefore)break;
    if(end>i+1&&nodes[end].kind==='group'&&nodes[end].spaced)break;
    end++;
   }
   const numerator=nodes.slice(start,i),denominator=nodes.slice(i+1,end);
   if(!numerator.length||!denominator.length)continue;
   nodes.splice(start,end-start,{kind:'math',unit:numerator.some(n=>n.unit),tex:'\\frac{'+bare(numerator)+'}{'+bare(denominator)+'}'});i=start;
  }
  return join(nodes);
 }
 function toTex(source){
  const s=normalize(source);let at=0;
  function sequence(until){
   const nodes=[];
   while(at<s.length){
    const c=s[at];if(until&&c===until){at++;break;}
    if(/\s/.test(c)){at++;continue;}
    if(c==='\u20d7'){at++;const last=nodes.at(-1);if(last)last.tex='\\vec{'+last.tex+'}';continue;}
    if(c==='|'){at++;const inside=sequence('|');nodes.push({kind:'group',inside,preserve:true,tex:'\\left|'+inside+'\\right|'});continue;}
    if('½¼¾'.includes(c)){at++;const [n,d]={'½':[1,2],'¼':[1,4],'¾':[3,4]}[c];nodes.push({kind:'math',tex:'\\frac{'+n+'}{'+d+'}'});continue;}
    if(c==="'"){
     let count=0;while(s[at]==="'"){count++;at++;}const last=nodes.at(-1);if(last)last.tex+='^{'+Array(count).fill('\\prime').join(' ')+'}';continue;
    }
    if(c==='_'||c==='^'){
     at++;let value;
     if(s[at]==='{'||s[at]==='('){const open=s[at],close=open==='{'?'}':')';let depth=1,start=++at;while(at<s.length&&depth){if(s[at]===open)depth++;if(s[at]===close)depth--;if(depth)at++;}value=s.slice(start,at);at++;}
     else{const m=s.slice(at).match(c==='^'?/^[+−-]?\d+(?:\.\d+)?|^[\p{L}\p{N}]+/u:/^[\p{L}\p{N}]+/u);value=m?.[0]||s[at++]||'';if(m)at+=value.length;}
     const last=nodes.at(-1);if(last){const label=window.PraxisI18n?.tr(value)??value;const script=c==='_'&&/^[\p{L}]{2,}$/u.test(value)&&!['nm','mn'].includes(value)?'\\text{'+escape(label)+'}':toTex(value);last.tex+=c+'{'+script+'}';}
     continue;
    }
    if(c==='√'){
     at++;let argument;
     if('({['.includes(s[at])){const open=s[at++],close={'(':')','{':'}','[':']'}[open];argument=sequence(close);}
     else{const number=s.slice(at).match(/^\d+(?:[.,]\d+)?/);if(number){argument=number[0].replace(',','{,}');at+=number[0].length;}else argument=greek[s[at]]?'\\'+greek[s[at++]]:s[at++]||'';}
     nodes.push({kind:'math',tex:'\\sqrt{'+argument+'}'});continue;
    }
    if('([{'.includes(c)){
     const spaced=/\s/.test(s[at-1]||'');at++;const close={'(':')','{':'}','[':']'}[c],inside=sequence(close);
     nodes.push({kind:'group',inside,spaced,tex:c==='{'?'{'+inside+'}':'\\left'+c+inside+'\\right'+close});continue;
    }
    const number=s.slice(at).match(until===']'?/^\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?/:/^\d+(?:[.,]\d+)?(?:[eE][+\-]?\d+)?/);
    if(number){const tex=number[0].replace(',','{,}').replace(/[eE]([+\-]?\d+)$/,' \\times 10^{$1}');nodes.push({kind:'math',tex});at+=number[0].length;continue;}
    const unit=s.slice(at).match(/^(?:µW|μW|mW|kW|kN|Ns|GPa|MPa|kPa|kHz|Hz|kg|km|cm|mm|ms|dB|rad|Pa|N|W|J|m|s|h)(?![\p{L}])/u),prev=nodes.at(-1);
    const numeric=/^\d/.test(prev?.tex||''),unitQuotient=prev?.kind==='slash'&&nodes.at(-2)?.unit;
    if(unit&&(numeric||unitQuotient||(['Hz','dB','GPa','MPa','kPa'].includes(unit[0])&&prev))){nodes.push({kind:'math',unit:true,boundaryBefore:!unitQuotient,tex:'\\mathrm{'+unit[0]+'}'});at+=unit[0].length;continue;}
    const func=s.slice(at).match(/^(?:arcsin|arccos|arctan|arctg|tanh|sinh|cosh|sin|cos|tan|cot|ctg|tg|log|ln|exp|abs)(?![A-Za-z])/);
    if(func){nodes.push({kind:'function',tex:'\\'+({tg:'tan',ctg:'cot',arctg:'arctan'}[func[0]]||func[0])});at+=func[0].length;continue;}
    const word=s.slice(at).match(/^[A-Za-zÀ-žȘșȚț]+/u);
    if(word&&(word[0].length>=3||(connectors.has(word[0])&&(!at||/\s/.test(s[at-1]||''))&&/\s/.test(s[at+word[0].length]||'')))){const translated=window.PraxisI18n?.tr(word[0])??word[0];nodes.push({kind:'text',tex:'\\text{'+escape(translated)+' }'});at+=word[0].length;continue;}
    at++;
    if(c==='/'){nodes.push({kind:'slash',tex:'/'});continue;}
    const kind=/[=+−\-±∓<>≈≠≤≥∝≪≫~.,;:→⇒–—]/.test(c)?'stop':/[·×*]/.test(c)?'multiply':'math';
    let tex=greek[c]?'\\'+greek[c]:symbols[c]??c;
    if(c==='*')tex='\\cdot';
    if(c==='~')tex='\\sim';if(c==='≪')tex='\\ll';if(c==='≫')tex='\\gg';
    if(/[&$#\\]/.test(c))tex='\\text{'+escape(c)+'}';
    nodes.push({kind,tex});
   }
   return reduce(nodes);
  }
  return sequence();
 }
 function statements(source){
  const parts=[];let depth=0,last=0,absolute=false;
  for(let i=0;i<source.length;i++){
   const c=source[i];if('([{'.includes(c))depth++;if(')]}'.includes(c))depth=Math.max(0,depth-1);
   const proseLabel=c===':'&&/[\p{L}]{3}/u.test(source.slice(last,i));
   let separator=false;
   if(c==='|'){
    const spaced=/\s/.test(source[i-1]||'')&&/\s/.test(source[i+1]||''),before=source.slice(last,i).trim(),close=source.indexOf('|',i+1),inside=close<0?'':source.slice(i+1,close),after=close<0?'':source.slice(close+1).trimStart();
    const opens=!before||/[=+−\-*/·∝(]$/.test(before)||!spaced||(close>=0&&!/[=≈<>≤≥]/.test(inside)&&/^[\/^²³]/.test(after));
    separator=!absolute&&spaced&&!opens;
    if(!separator)absolute=!absolute;
   }
   const nextQuantity=!depth&&/\s/.test(c)&&/[=≈∝]/.test(source.slice(last,i))&&/^(?:[A-Za-zΑ-ω]{1,2}(?:[0-9]+|_\{[^}]+\}|_[\p{L}\p{N}]+|[₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+)?(?:\([^()]*\))?)\s*[=≈∝]/u.test(source.slice(i+1).trimStart());
   if(!depth&&!absolute&&(c===';'||c==='⇒'||proseLabel||separator||nextQuantity||(c===','&&!(/\d/.test(source[i-1]||'')&&/\d/.test(source[i+1]||'')))||(c==='.'&&source[i+1]===' '))){const part=source.slice(last,i+(proseLabel?1:0)).trim();if(part)parts.push(part);last=i+1;}
  }
  const final=source.slice(last).trim();if(final)parts.push(final);return parts;
 }
 function assignment(source){return source.match(/(?<![\p{L}\p{N}_])(?:(?:[ΔΣ]\s*)?[A-Za-zΑ-ω](?:\u20d7)?(?:_\{[^}]+\}|_[\p{L}\p{N}]+|[₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+)?(?:\([^)]{0,100}\))?['′]*)(?:\s*[/·*]\s*[A-Za-zΑ-ω])?\s*[=≈∝<>≤≥]/u);}
 // Find prose before the entire left side, not before the last symbol near '='.
 // In particular, sin(i)/sin(r) and m*x''+c*x'+k*x must stay intact.
 function expressionStart(part){
  const relation=part.search(/[=≈∝<>≤≥≠]/u);if(relation<0)return 0;
  const left=part.slice(0,relation),masked=left.replace(/_\{[^}]*\}|_[\p{L}\p{N}]+/gu,m=>' '.repeat(m.length));
  const functions=new Set(['sin','cos','tan','cot','tg','ctg','arctg','sinh','cosh','tanh','arcsin','arccos','arctan','log','ln','exp','abs','midi','const']);let end=0;
  for(const m of masked.matchAll(/[A-Za-zÀ-žȘșȚț]{2,}/gu))if((m[0].length>=3||connectors.has(m[0]))&&!functions.has(m[0]))end=m.index+m[0].length;
  if(!end||!/[A-Za-zΑ-ω]/u.test(left.slice(end)))return 0;
  while(/\s/.test(part[end]||''))end++;
  return end;
 }
 function render(source){
  return statements(source.replace(/\s+(xilofon|xylophone|tobă|drum)$/iu,'; $1')).map(raw=>{
   const part=window.PraxisI18n?.tr(raw)??raw;
   if(!/[=≈∝/√_^₀-₉⁰-⁹]/u.test(part)||/\p{Extended_Pictographic}/u.test(part))return '<span class="wave-math-prose">'+htmlProse(part)+'</span>';
   if(!assignment(part)&&/[A-Za-zÀ-žȘșȚț]{3,}/u.test(part.replace(/tanh|sinh|cosh|sin|cos|tan|exp|log|ln/g,'')))return '<span class="wave-math-prose">'+htmlProse(part)+'</span>';
   const start=expressionStart(part),prefix=start?part.slice(0,start):'';
   let expression=part.slice(start),suffix='';
   // Prose following a short equation must wrap as ordinary text, not become
   // an unbreakable mtext tail inside the mathematical expression.
   let depth=0;
   for(let i=0;i<expression.length;i++){
    if('([{'.includes(expression[i]))depth++;
    if(')]}'.includes(expression[i]))depth=Math.max(0,depth-1);
    if(!depth&&/\s/.test(expression[i])&&/^(?:\s+(?:este|sunt|is|are|where|unde|pentru|for|depinde|depends|dispersivă|dispersive|cu|with|la|at|în|in|și|and|se|if|dacă|fără|without|sau|or)(?=\s|$|[,.;])|\s+[—–]\s+)/u.test(expression.slice(i))){suffix=expression.slice(i);expression=expression.slice(0,i);break;}
   }
   const annotation=expression.match(/\s+(?:(?:castron|bowl|xilofon|xylophone|tobă|drum)\b(?:\s+\([^)]*\))?|\([^()]*[A-Za-zÀ-žȘșȚț]{4,}[^()]*\))\.?$/iu);
   if(annotation&&!/\b(?:sin|cos|tanh|sinh|cosh|exp|log)\b/.test(annotation[0])){suffix=annotation[0]+suffix;expression=expression.slice(0,annotation.index);}
   try{return (prefix?'<span class="wave-math-prose">'+htmlProse(prefix)+'</span>':'')+'<span class="wave-math-item">'+(window.PraxisRenderMath||window.katex.renderToString)('\\displaystyle '+toTex(expression),{throwOnError:true,strict:'ignore',trust:false,output:'mathml'})+'</span>'+(suffix?'<span class="wave-math-prose">'+htmlProse(suffix.trim())+'</span>':'');}
   catch(error){return '<span class="wave-math-error" role="alert" title="'+htmlEscape(error.message).replaceAll('"','&quot;')+'">'+htmlEscape(part)+'</span>';}
  }).join('');
 }
 function flatten(value){
  if(value==null||typeof value==='boolean')return '';
  if(typeof value==='string'||typeof value==='number')return String(value);
  if(Array.isArray(value))return value.map(flatten).join('');
  const p=value.props||{};if(value.type==='sub')return '_{'+flatten(p.children)+'}';if(value.type==='sup')return '^{'+flatten(p.children)+'}';if(value.type==='br')return ' ; ';
  return flatten(p.children);
 }
 function inline(value){
  if(value==null||typeof value==='boolean'||typeof value==='string'||typeof value==='number')return true;
  if(Array.isArray(value))return value.every(inline);
  if(value.props?.contentEditable||value.props?.dangerouslySetInnerHTML)return false;
  return ['span','b','strong','i','em','sub','sup','br'].includes(value.type)&&inline(value.props?.children);
 }
 function formula(source){
  if(source.includes('Celulele sunt editabile'))return false;
  if(!/[=≈∝]/.test(source)||/\p{Extended_Pictographic}/u.test(source))return false;
  if(assignment(source)&&/[\/√^_₀-₉⁰-⁹]/u.test(source))return true;
  const left=source.split(/[=≈∝]/)[0].split(':').at(-1).replace(/_\{[^}]+\}|_[\p{L}\p{N}]+/gu,'').replace(/sin|cos|tan|log|exp/g,'');
  return !/[\p{L}]{3}|\p{Extended_Pictographic}/u.test(left)&&left.trim().length<50;
 }
 function isBare(source){
  const value=String(source).trim();
  if(value.startsWith('/'))return false;
  if(!/[\/√]/u.test(value)||!/[\p{L}\p{N}]/u.test(value))return false;
  if(/^(?:[kmc]?m|rad|kg|W|N)\/(?:s|h|m|kg)(?:[²³⁻¹\d]+)?$/u.test(value))return false;
  const words=value.replace(/_\{[^}]+\}|_[\p{L}\p{N}]+/gu,'').replace(/tanh|sinh|cosh|sin|cos|tan|log|exp|ln/g,'');
  return !/[\p{L}]{3}|[^\p{L}\p{N}\s_.(){}[\]\/+−\-^·*|=≈√%]/u.test(words);
 }
 const listeners=new Set();for(const event of ['praxis-language-change','praxis-math-ready'])window.addEventListener(event,()=>{for(const fn of listeners)fn();});
 window.PraxisMath={toTex,statements,render,flatten,inline,formula,bare:isBare,subscribe:fn=>(listeners.add(fn),()=>listeners.delete(fn)),language:()=>window.PraxisI18n?.language||'ro',revision:()=>(window.PraxisI18n?.language||'ro')+'|'+Boolean(window.katex)};
})();

/* Native DOM integration. React laboratories use their own component adapters. */
(()=>{
 const math=window.PraxisMath;if(!math||math.set)return;
 const coreRender=math.render,records=new WeakMap(),hosts=new Set();let paints=0;
 const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const tr=s=>window.PraxisI18n?.tr(s)??s;
 math.render=source=>coreRender(String(source));
 math.tex=source=>{try{return window.PraxisRenderMath(String(source),{throwOnError:true,strict:'ignore',trust:false,output:'mathml',displayMode:false});}catch(error){return '<span class="science-math-error" role="alert" title="'+escape(error.message)+'">'+escape(source)+'</span>';}};
 const scripts=/(?<![\p{L}\p{N}_])([A-Za-zΑ-ω])(?:_\{([^}]+)\}|_([\p{L}\p{N}]+)|([₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+)|([0-9]+)\b)([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]*)|(?<![\p{L}\p{N}_])([A-Za-zΑ-ω])(?:\^\(([^)]+)\)|\^([−+\d.]+)|([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+))/gu;
 math.prose=source=>{
  let last=0,result='';source=String(source);scripts.lastIndex=0;
  for(const m of source.matchAll(scripts)){
   result+=escape(source.slice(last,m.index));
   result+='<span class="science-script">'+math.tex(math.toTex(m[0]))+'</span>';last=m.index+m[0].length;
  }
  return result+escape(source.slice(last));
 };
 function serialize(node){
  if(node.nodeType===3)return window.PraxisI18n?.sourceText?.(node)??node.data;
  if(node.nodeType!==1)return '';
  const text=[...node.childNodes].map(serialize).join('');
  if(node.classList.contains('newton-vector'))return text+'\u20d7';
  if(node.tagName==='SUB')return '_{'+text+'}';if(node.tagName==='SUP')return '^{'+text+'}';if(node.tagName==='BR')return ' ; ';return text;
 }
 function paint(el,record){
  const source=tr(record.source),html=record.syntax==='tex'?math.tex(source):record.syntax==='prose'?math.prose(source):math.render(source);
  if(el.innerHTML!==html)el.innerHTML=html;
  record.html=el.innerHTML;record.language=math.language();el.dataset.scienceRendered='';el.setAttribute('data-no-i18n','');el.classList.add('science-math');
  if(++paints%64===0)for(const host of hosts)if(!host.isConnected)hosts.delete(host);
 }
 math.set=(el,source,{syntax='plain'}={})=>{
  if(!el)return;source=String(source);const previous=records.get(el);
  if(previous&&previous.source===source&&previous.syntax===syntax&&previous.html===el.innerHTML&&previous.language===math.language())return;
  const record={source,syntax,html:'',protected:previous?.protected??!!el.hasAttribute?.('data-no-i18n')};records.set(el,record);hosts.add(el);el.dataset.scienceMath=syntax;el.dataset.scienceSource=source;paint(el,record);return el;
 };
 math.typeset=(root=document)=>{
  const elements=[...(root.matches?.('[data-science-math]')?[root]:[]),...root.querySelectorAll('[data-science-math]')];
  for(const el of elements){if(el.closest('svg,canvas,[contenteditable],[data-praxis-panel-probe],[inert]'))continue;
   const record=records.get(el);if(record&&record.html===el.innerHTML){if(record.language!==math.language())paint(el,record);continue;}
   math.set(el,record?serialize(el):(el.dataset.scienceSource??serialize(el)),{syntax:el.dataset.scienceMath||'plain'});
  }
 };
 const excluded='script,style,textarea,input,select,option,button,a,code,pre,svg,canvas,[contenteditable],.katex,.MathJax,mjx-container,math,.fx,[data-fx],[data-fx-inline],.fraction,.frac,.science-math,.wave-math-lines,.math-prose';
 function candidate(el){
  if(el.closest(excluded+', [data-praxis-panel-probe],[inert]')||el.matches('[data-no-science-math]'))return false;
  if(el.closest('.journal,.lab-journal,.log-table,[data-journal]')||el.closest('table')?.querySelector('[contenteditable],input,textarea'))return false;
  if(el.matches('.vec')||el.querySelector(excluded+', [id],.mcu-vector-symbol,.vec'))return false;
  // A native formula can have its equation and explanatory caption in siblings.
  // Keep that structure; the .eq child is enhanced independently.
  if(el.querySelector('.eq')&&el.querySelector('.what'))return false;
  if(el.closest('#root,[data-reactroot],[data-science-owner=react],#praxis-original [data-no-i18n]'))return false;
  return true;
 }
 math.enhance=(root=document)=>{
  math.typeset(root);
  const selector='.formula,.newton-formula,.science-formula,.eq,.equation,p,li,td,th,output,.hint,.readout,.readouts,.out';
  const elements=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
  for(const el of elements){if(!candidate(el))continue;
   // Do not flatten nested layout, labels, controls, or named readout values.
   if([...el.children].some(c=>!['SPAN','B','STRONG','EM','I','SUB','SUP','BR'].includes(c.tagName)))continue;
   const source=serialize(el).trim();if(!source||source.length>2200||/[\\$]/.test(source))continue;
   if((math.formula(source)&&(/[\/√_^₀-₉⁰-⁹]/u.test(source)||el.matches('.formula,.newton-formula,.science-formula,.eq,.equation')))||math.bare(source))math.set(el,source);
   else{scripts.lastIndex=0;if(scripts.test(source))math.set(el,source,{syntax:'prose'});}
  }
 };
 function start(){
  const root=document.getElementById('praxis-original');if(!root)return;
  const id=document.body.dataset.praxisCourse;
  // These are React-owned; they call the API from their own render functions.
  if(['unde-mecanice','miscarea-circulara-uniforma'].includes(id)||document.body.dataset.scienceOwner==='react'||root.matches('[data-science-owner=react]'))return;
  math.enhance(root);let pending=false;const dirty=new Set(),added=new Set();
  const scan=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{
   pending=false;for(const host of dirty){const record=records.get(host);if(host.isConnected&&record&&record.html!==host.innerHTML)math.set(host,serialize(host),{syntax:record.syntax});}dirty.clear();
   for(const node of added)if(node.isConnected)math.typeset(node);added.clear();
  });};
  new MutationObserver(changes=>{
   for(const r of changes){const el=r.target.nodeType===1?r.target:r.target.parentElement;if(!el||el.closest('[data-praxis-panel-probe],[inert]'))continue;
    const host=el.closest('.science-math');if(host){if(records.get(host)?.html!==host.innerHTML)dirty.add(host);continue;}
    for(const node of r.addedNodes||[])if(node.nodeType===1&&!node.closest('.katex,math,.fx,svg,canvas')&&(node.matches('[data-science-math]')||node.querySelector('[data-science-math]')))added.add(node);
   }if(dirty.size||added.size)scan();
  }).observe(root,{subtree:true,childList:true,characterData:true});
 }
 window.addEventListener('praxis-language-change',()=>{for(const el of hosts){if(!el.isConnected){hosts.delete(el);continue;}const record=records.get(el);if(record&&record.html===el.innerHTML)paint(el,record);}});
 window.addEventListener('praxis-math-ready',()=>{for(const el of hosts){if(!el.isConnected){hosts.delete(el);continue;}const record=records.get(el);if(record)paint(el,record);}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* /praxis:math-runtime */
window.PraxisLabWorkspaceConfig={"condensatorul":{"workspaces":[{"selector":".lab-shell","scene":".stage","controls":".side-stack","graphs":".graph-card","layout":"native"}],"activities":[{"scope":".side-stack","items":":scope>.side-card","default":0}]},"legea-lui-coulomb":{"workspaces":[{"selector":".coulomb-layout","scene":".coulomb-layout>div","controls":".coulomb-layout>aside","layout":"native"}]},"legea-lui-hooke":{"workspaces":[{"selector":".hooke-workspace","scene":".hooke-visual","controls":".hooke-controls","graphs":".hooke-graphs","layout":"native"}]},"pila-daniell":{"workspaces":[{"selector":".daniell-workspace","scene":".daniell-visual","controls":".daniell-controls","graphs":".daniell-graphs","layout":"native"}]},"laboratorul-electromagnetic-faraday":{"workspaces":[{"selector":".faraday-workspace","scene":".faraday-visual","controls":".faraday-controls","graphs":".faraday-graphs","layout":"native"}]},"oglinzi-si-lentile":{"workspaces":[{"selector":".workspace","scene":".experiment-column","layout":"native"}]},"miscarea-rectilinie":{"workspaces":[{"selector":".card.sim","controls":".sim-side","scene":".sim-main","graphs":".sim-main>.grid-2","layout":"motion"},{"selector":".type-card","scene":".stage","layout":"native"}],"activities":[{"scope":"#mru","items":":scope>.block","default":2},{"scope":"#mruv","items":":scope>.block","default":1},{"scope":"#tipuri","items":":scope>.block","default":0}],"reading":".panel>.hero","reveals":[{"trigger":"#uv-cases [data-case]","target":"#uv-ctl"}]},"unde-mecanice":{"react":true,"workspaces":[{"selector":"[data-instrument-layout]","scene":"[data-instrument-role=visual]","controls":"[data-instrument-role=controls]","layout":"native"},{"selector":".lesson-part-content:has(.praxis-wave-figure)","scene":".praxis-wave-figure","layout":"native"}]},"calcul-vectorial":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"viteza-si-acceleratia":{"workspaces":[{"selector":".lab-layout","scene":".canvas-workspace","controls":".control-panel","layout":"split"}]},"miscarea-curbilinie-plana":{"workspaces":[{"selector":".lab","scene":".curvilinear-visual","controls":".controls","layout":"split"}]},"notiuni-termodinamice":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"calorimetrie":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"principiul-i-al-termodinamicii":{"workspaces":[{"selector":".section .card:has(.transform-graphs)","scene":".transform-graphs","layout":"native"}],"secondaryGroups":[{"scope":".section","items":":scope>.card:first-child"}]},"interactii-atomice":{"workspaces":[{"selector":"#sim>.sim","scene":":scope>.stage","controls":":scope>aside","layout":"split"}]},"principiul-i-aplicatii":{"workspaces":[{"selector":".grid-2:has(>.demo):not(#view-sinteza>.grid-2,#view-tabel141>.grid-2)","scene":":scope>.demo","layout":"reading"},{"selector":"#view-sinteza>.grid-2,#view-tabel141>.grid-2","scene":":scope>.demo","graphs":":scope>.prose","layout":"native"}],"reading":".grid-2:has(>.demo):not(#view-sinteza>.grid-2,#view-tabel141>.grid-2)>.prose"},"transformari-stare-agregare":{"workspaces":[{"selector":".grid-2:has(>.demo)","scene":":scope>.demo","layout":"reading"}],"reading":".grid-2:has(>.demo)>.prose"},"oscilator-mecanic":{"workspaces":[{"selector":".demo-shell","scene":".demo-body","controls":".demo-controls","layout":"native"}],"activities":[{"scope":"#s111","items":":scope>.demo-shell","default":0},{"scope":"#s112","items":":scope>.demo-shell","default":0},{"scope":"#s113","items":":scope>.demo-shell","default":0},{"scope":"#s114","items":":scope>.demo-shell","default":0}],"secondaryGroups":[{"scope":".chapter:has(.demo-shell)","items":":scope>.story-card,:scope>p,:scope>blockquote,:scope>ol,:scope>ul,:scope>.defbox,:scope>h3"}]},"oscilatori-mecanici-cuplati":{"workspaces":[{"selector":".lab-panel","scene":".sim-row","controls":".controls","layout":"native"}]},"compunerea-oscilatiilor":{"workspaces":[{"selector":"[data-composition-section=laborator]>.layout","scene":".visuals","controls":".controls","layout":"split"}]},"figuri-chladni":{"workspaces":[{"selector":"[data-chladni-section=laborator]>.grid","scene":":scope>section","controls":":scope>aside","layout":"native"}]},"miscarea-circulara-uniforma":{"react":true,"workspaces":[{"selector":"#sim-mcu,#sim-curba","scene":"canvas.mcu-canvas","layout":"native"}]},"principiile-mecanicii-newtoniene":{"workspaces":[{"selector":".newton-demo","scene":".newton-stage","controls":".newton-controls","layout":"split"}]},"motoare-termice":{"workspaces":[{"selector":".cols:has(.fig)","scene":".fig","layout":"reading"}],"reading":".cols>.text"},"generator-electric":{"workspaces":[{"selector":".generator-workspace","scene":".generator-visual","controls":".generator-controls","graphs":".generator-graphs","layout":"native"}]},"pendulul-gravitational":{"workspaces":[{"selector":".lab-grid","scene":".stage","controls":".side","graphs":".data","layout":"native"}]},"transformarea-politropa":{"react":true,"workspaces":[{"selector":"#polytropic-root .lab-shell","layout":"native","controls":".lab-primary-controls","scene":".lab-main"}]}};
/* Shared presentation only. Keep scientific nodes, listeners and state alive. */
(() => {
 'use strict';
 if(window.PraxisLabWorkspace)return;
 const mounted=new WeakSet(),grouped=new WeakSet(),noted=new WeakSet(),labels=new Map();
 const words={ro:{preferences:'Preferințe laborator',cases:'Cazuri de mișcare',options:'Afișare și sunete',reading:'Explicații și formule',introduction:'Introducere',activities:'Activități'},en:{preferences:'Laboratory preferences',cases:'Motion cases',options:'Display and sounds',reading:'Explanations and formulas',introduction:'Introduction',activities:'Activities'}};
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
    window.dispatchEvent(new CustomEvent('praxis-workspace-activity-change',{detail:{scope:scope.id}}));
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
    if(entry.layout==='reading')for(const figure of workspace.querySelectorAll('.fig')){
     if(!figure.querySelector(':scope>canvas'))continue;
     const controls=[...figure.children].filter(el=>el.matches('.sliders,.ctrls,.ro,.chips,.hint'));
     if(!controls.length)continue;
     const panel=document.createElement('div');panel.className='praxis-workspace-figure-controls';panel.dataset.workspaceRole='controls';
     const heading=document.createElement('div');heading.className='praxis-workspace-figure-heading';
     heading.append(...[...figure.children].filter(el=>el.matches('.fig-h,.tabs,.compression-intro')));
     figure.prepend(heading);panel.append(...controls);figure.append(panel);figure.dataset.workspaceFigure='';
    }
    if(entry.layout==='motion'){
     const controls=workspace.querySelector('.sim-side'),transport=workspace.querySelector('.transport');
     // acc-info is replaced by the native lesson on each motion selection.
     // Its transport must remain in the stable scene, outside that readout.
     if(controls&&transport&&controls.id!=='acc-info')controls.prepend(transport);
     // Scientific derivations follow the working instrument; keep operating hints
     // beside it. Only this explicit, non-React lesson adapter moves these nodes.
     const block=workspace.parentElement;
     const theory=[...block.children].filter(el=>el.matches('.def,.grid-3'));
     if(theory.length){const details=disclosure(theory[0],'reading');details.append(...theory);block.append(details);}
     for(const el of controls?.querySelectorAll('.chips,.checks')||[]){
      const title=el.previousElementSibling?.matches('.group-title')?el.previousElementSibling:null;
      const details=disclosure(el,el.matches('.chips')?'cases':'options');if(title)details.insertBefore(title,el);
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
  // Native lesson links may load a preset in another activity. Reveal the
  // destination before its existing handler scrolls to it; preserve that handler.
  document.addEventListener('click',event=>{
   const config=window.PraxisLabWorkspaceConfig?.[document.body.dataset.praxisWorkspace];
   for(const link of config?.reveals||[]){
    if(!event.target.closest?.(link.trigger))continue;
    const item=document.querySelector(link.target)?.closest('[data-workspace-activity]');
    const nav=item?.parentElement.querySelector(':scope>.praxis-workspace-activities');
    const button=nav?.children[Number(item?.dataset.workspaceActivity)];
    button?.click();button?.focus({preventScroll:true});
   }
  },true);
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

/* Semantic corrections shared by web and self-contained lesson exports. */
(() => {
 function mount(){
  const id=document.body.dataset.praxisCourse;
  const headings={
   condensatorul:['h3[data-content-type="diagram"]',2],
   'miscarea-rectilinie':['.block-head h3,.pb-title',2],
   'principiul-i-al-termodinamicii':['.interactive .sim-panel h4',3],
   'interactii-atomice':['#pairs>h3',2],
   'transformari-stare-agregare':['h4[data-i18n="home.state.solid"]',3],
   'oscilator-mecanic':['h4[data-content-type="simulation"],.demo-head h4',3],
   'pendulul-gravitational':['.stage-h h3',2]
  };
  if(headings[id]){const [selector,level]=headings[id];document.querySelectorAll(selector).forEach(el=>el.setAttribute('aria-level',String(level)));}
  const en=window.PraxisI18n?.language==='en';
  const sectionNav=document.querySelector('.praxis-lab-nav');
  if(sectionNav)sectionNav.setAttribute('aria-label',en?'Laboratory section selector':'Selectorul secțiunilor laboratorului');
  document.querySelectorAll('#praxis-original header.hero').forEach(el=>el.setAttribute('role','presentation'));
  if(id==='calcul-vectorial'){
   document.querySelectorAll('#praxis-original section.hero').forEach(el=>{el.setAttribute('role','region');el.setAttribute('aria-label',en?'Introduction':'Introducere');});
   document.querySelectorAll('input[data-c]').forEach(el=>{const key=el.dataset.c;el.setAttribute('aria-label',key==='k'?'k':en?`Vector ${key[0]}, component ${key[1]}`:`Vector ${key[0]}, componenta ${key[1]}`);});
   document.querySelectorAll('button[data-act="reset"]').forEach(el=>{if(!el.textContent.trim())el.setAttribute('aria-label',en?'Reset':'Resetează');});
   document.querySelectorAll('[data-i]>h4').forEach(el=>el.setAttribute('aria-level','3'));
  }
  if(id==='viteza-si-acceleratia'){
   document.querySelectorAll('.control-group h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('aside>.control-group:first-child>h4').forEach(el=>el.setAttribute('aria-level','2'));
   const mode=document.getElementById('curv-mode-select'),heading=mode?.parentElement.querySelector('h4');
   if(mode&&heading){heading.id='curvilinear-mode-heading';mode.setAttribute('aria-labelledby',heading.id);}
  }
  if(['notiuni-termodinamice','calorimetrie','motoare-termice','oscilatori-mecanici-cuplati'].includes(id))document.querySelectorAll('.q h4,.pb h4').forEach(el=>el.setAttribute('aria-level','3'));
  if(id==='principiul-i-al-termodinamicii')document.querySelectorAll('.calc-card h4,.graph-panel h4').forEach(el=>el.setAttribute('aria-level','3'));
  if(id==='pendulul-gravitational'){
   document.querySelectorAll('#praxis-original h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('#praxis-original aside>h4').forEach(el=>el.setAttribute('aria-level','2'));
  }
  document.querySelectorAll('.energy-split[aria-label]').forEach(el=>el.setAttribute('role','img'));
  if(id==='condensatorul'){
   document.querySelectorAll('.side-card h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('.toc h4').forEach(el=>el.setAttribute('aria-level','2'));
  }
  if(id==='miscarea-rectilinie'){
   document.querySelectorAll('#praxis-original h4').forEach(el=>el.setAttribute('aria-level','3'));
   document.querySelectorAll('.calc-field').forEach(field=>{const label=field.querySelector('label'),input=field.querySelector('input[id]');if(label&&input)label.htmlFor=input.id;});
   const actionHeading=document.querySelector('#uv-cases thead th:last-child');
   if(actionHeading&&!actionHeading.textContent.trim())actionHeading.textContent=window.PraxisI18n?.language==='en'?'Action':'Acțiune';
  }
  document.querySelectorAll('select[title]:not([aria-label]):not([aria-labelledby])').forEach(el=>{if(!el.closest('#root,[data-reactroot]')&&!el.labels?.length)el.setAttribute('aria-label',el.title);});
  document.querySelectorAll('th[data-science-source]').forEach(el=>el.setAttribute('aria-label',el.dataset.scienceSource));
  document.querySelectorAll('th:has(math):not([aria-label])').forEach(el=>{if(el.closest('#root,[data-reactroot]'))return;const source=el.querySelector('annotation')?.textContent||el.querySelector('math')?.textContent;if(source?.trim())el.setAttribute('aria-label',source.trim());});
  document.querySelectorAll('.science-math .wave-math-item,.table-wrap,.sim-frame').forEach(el=>{
   if(el.closest('#root,[data-reactroot]'))return;
   if(el.clientWidth>0&&el.scrollWidth>el.clientWidth+1){
    el.dataset.accessibleScroll='';el.tabIndex=0;el.setAttribute('role','group');
    el.setAttribute('aria-label',en?'Content with horizontal scrolling':'Conținut cu derulare orizontală');
   }else if(el.hasAttribute('data-accessible-scroll')){
    el.removeAttribute('data-accessible-scroll');el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');
   }
  });
  document.querySelectorAll('.pn a.disabled').forEach(el=>{el.setAttribute('aria-disabled','true');el.tabIndex=-1;});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 window.addEventListener('load',mount);
 window.addEventListener('praxis-language-change',mount);
 window.addEventListener('resize',mount);
 let scheduled=false;
 const observer=new MutationObserver(records=>{
  if(scheduled||!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1)))return;
  scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
 // Arrow keys follow the standard tablist pattern; native buttons retain Enter/Space.
 document.addEventListener('keydown',event=>{
  if(event.defaultPrevented)return;
  const tab=event.target.closest?.('[role="tab"]'),list=tab?.closest('[role="tablist"]');
  if(!list||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  const vertical=list.getAttribute('aria-orientation')==='vertical';
  if((vertical&&['ArrowLeft','ArrowRight'].includes(event.key))||(!vertical&&['ArrowUp','ArrowDown'].includes(event.key)))return;
  const tabs=[...list.querySelectorAll('[role="tab"]')].filter(el=>!el.disabled&&el.getAttribute('aria-disabled')!=='true'&&el.checkVisibility());
  const at=tabs.indexOf(tab);if(at<0)return;
  const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(at+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+tabs.length)%tabs.length;
  event.preventDefault();tabs[index].focus();tabs[index].click();
 });
})();

/* /praxis:content-types */
