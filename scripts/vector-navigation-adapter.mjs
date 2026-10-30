// Reversible lifecycle change: tab switches cancel unfinished figure demonstrations.
const before='function runner(){let id=0;const r=seq=>{const my=++id;return seq(()=>my===id)};r.cancel=()=>{id++};return r}';
const after="function runner(){let id=0;const r=seq=>{const my=++id;r.section=document.querySelector('section.sec:not([hidden])');return seq(()=>my===id&&!document.hidden&&!r.section?.hidden)};r.cancel=()=>{id++};(window.PraxisVectorRunners??=[]).push(r);return r}";
export function adaptVectorNavigation(html,reverse=false){const from=reverse?after:before,to=reverse?before:after;if(html.split(from).length!==2)throw new Error('Vector runner lifecycle target changed');return html.replace(from,()=>to);}
