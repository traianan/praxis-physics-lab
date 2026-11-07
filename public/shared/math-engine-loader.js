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
