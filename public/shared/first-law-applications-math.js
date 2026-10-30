/* One established local formula renderer; prose scripts stay attached to their symbol. */
(() => {
 const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 function render(source){
  try{return katex.renderToString(source,{throwOnError:true,strict:'warn',output:'htmlAndMathml',trust:false,displayMode:false});}
  catch(error){return '<span class="math-error" role="alert">'+escape(source)+'</span>';}
 }
 function refresh(el){const source=el.getAttribute(el.hasAttribute('data-fx')?'data-fx':'data-fx-inline')||'';el.innerHTML=render(source);el.dataset.rendered='1';el.classList.add('fx');}
 function typeset(root=document){for(const el of root.querySelectorAll('[data-fx],[data-fx-inline]'))if(el.dataset.rendered!=='1')refresh(el);}
 const scriptPattern=/([A-Za-zΑ-ω])_([A-Za-zΑ-ω0-9]+)|\^\(([^)]+)\)|\^([−+\d]+)/g;
 function formatProse(root=document.getElementById('praxis-original')){
  if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
  while(node=walker.nextNode()){if(node.parentElement.closest('script,style,textarea,input,[contenteditable],.katex,.fx,[data-fx],.math-prose,canvas,svg'))continue;scriptPattern.lastIndex=0;if(scriptPattern.test(node.data))nodes.push(node);}
  for(const node of nodes){const source=node.data,fragment=document.createDocumentFragment();let end=0;scriptPattern.lastIndex=0;for(const match of source.matchAll(scriptPattern)){fragment.append(source.slice(end,match.index));const span=document.createElement('span');span.className='math-prose';if(match[1]){const sub=document.createElement('sub');sub.textContent=match[2];span.append(match[1],sub);}else{const sup=document.createElement('sup');sup.textContent=match[3]||match[4];span.append(sup);}fragment.append(span);end=match.index+match[0].length;}fragment.append(source.slice(end));node.replaceWith(fragment);}
 }
 window.MathJ={render,typeset,refresh,formatProse};
 document.addEventListener('languagechange',()=>queueMicrotask(formatProse));
 function start(){typeset();formatProse();let pending=false;const root=document.getElementById('praxis-original');new MutationObserver(records=>{if(pending||!records.some(r=>[...r.addedNodes].some(n=>/\w_\w|\^\(/.test(n.textContent||''))))return;pending=true;queueMicrotask(()=>{pending=false;formatProse(root);});}).observe(root,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
