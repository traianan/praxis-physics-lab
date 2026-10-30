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
