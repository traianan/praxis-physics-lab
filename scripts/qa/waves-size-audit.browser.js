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
  if(Math.abs(canvas.width-box.width*devicePixelRatio)>1||Math.abs(canvas.height-box.height*devicePixelRatio)>1)throw new Error('An active figure is not rendered at CSS size times DPR');
  return {css:[box.width,box.height],buffer:[canvas.width,canvas.height],maximum};
 });
 return {viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,headingSize:getComputedStyle(card.querySelector('h3')).fontSize,figures,overflow:document.documentElement.scrollWidth>innerWidth+1};
}
