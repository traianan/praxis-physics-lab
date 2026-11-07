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
