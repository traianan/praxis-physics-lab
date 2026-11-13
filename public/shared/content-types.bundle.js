/* Contact-only presentation policy. Never cancel pointer/touch movement or clicks. */
(() => {
 if(document.getElementById('praxis-touch-interaction'))return;
 const root=document.documentElement;
 const editable='textarea,select,input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]):not([type="file"]):not([type="color"]),[contenteditable]:not([contenteditable="false"]),[data-praxis-selectable]';
 const style=document.createElement('style');style.id='praxis-touch-interaction';
 style.textContent=`
 html[data-praxis-contact="true"] body,html[data-praxis-contact="true"] body *{
  -webkit-tap-highlight-color:transparent!important;
  -webkit-touch-callout:none!important;
  -webkit-user-select:none!important;user-select:none!important;
 }
 html[data-praxis-contact="true"] body :is(${editable}),
 html[data-praxis-contact="true"] body :is(${editable}) *{
  -webkit-touch-callout:default!important;
  -webkit-user-select:text!important;user-select:text!important;
 }`;
 (document.head||root).append(style);
 let contact=matchMedia('(pointer: coarse)').matches,lastContact=-Infinity;
 const apply=value=>{contact=value;root.dataset.praxisContact=String(value);};
 apply(contact);
 const exempt=event=>event.composedPath().some(node=>node instanceof Element&&(node.matches(editable)||node.isContentEditable));
 document.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||event.pointerType==='pen'){lastContact=performance.now();apply(true);}
  else if(event.pointerType==='mouse')apply(false);
 },{capture:true,passive:true});
 // Keyboard selection and the keyboard context menu remain available on hybrid devices.
 document.addEventListener('keydown',()=>apply(false),{capture:true,passive:true});
 document.addEventListener('contextmenu',event=>{
  const fromContact=event.pointerType==='touch'||event.pointerType==='pen'||event.sourceCapabilities?.firesTouchEvents||
   (!event.pointerType&&contact&&performance.now()-lastContact<1800&&(event.clientX!==0||event.clientY!==0));
  if(fromContact&&!exempt(event))event.preventDefault();
 },true);
 document.addEventListener('selectstart',event=>{
  if(contact&&!exempt(event))event.preventDefault();
 },true);
})();

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
