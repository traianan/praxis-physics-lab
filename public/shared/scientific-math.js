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
