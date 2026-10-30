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
