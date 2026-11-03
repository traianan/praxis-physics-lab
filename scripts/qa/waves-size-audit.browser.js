/* Run on unde-mecanice/index.html#clasificare-content-2 after load.
   Inactive renderers release their DPR buffers; inspect on-screen figures. */
async () => {
 const panel=document.getElementById('clasificare-content-2');
 const card=panel?.querySelector('[data-wave-stand]');
 if(!card?.getClientRects().length)throw new Error('Open Clasificare > Unde pe apa first');
 card.scrollIntoView({block:'start',behavior:'instant'});
 await new Promise(resolve=>setTimeout(resolve,100));
 const rootSize=parseFloat(getComputedStyle(document.documentElement).fontSize);
 const figures=[...card.querySelectorAll(':scope>.praxis-wave-figure')].map(figure=>{
  const canvas=figure.querySelector('canvas'),box=canvas.getBoundingClientRect();
  const maximum=parseFloat(getComputedStyle(figure).getPropertyValue('--wave-render-width'))*rootSize;
  if(box.width>maximum+1)throw new Error('The workspace overrides the scientific figure size limit');
  const density=window.PraxisCanvasResolution.forCanvas(canvas);
  if(Math.abs(canvas.width-box.width*density)>1||Math.abs(canvas.height-box.height*density)>1)throw new Error('An active figure does not follow the bounded shared resolution policy');
  return {css:[box.width,box.height],buffer:[canvas.width,canvas.height],density,maximum};
 });
 return {viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,headingSize:getComputedStyle(card.querySelector('h3')).fontSize,figures,overflow:document.documentElement.scrollWidth>innerWidth+1};
}
