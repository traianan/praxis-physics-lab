/* Draw at displayed pixel density while retaining the original scientific coordinates. */
(() => {
 function prepare(canvas){
  if(!canvas.dataset.logicalWidth){canvas.dataset.logicalWidth=canvas.getAttribute('width');canvas.dataset.logicalHeight=canvas.getAttribute('height');}
  const w=Number(canvas.dataset.logicalWidth),h=Number(canvas.dataset.logicalHeight);
  if(canvas.id!=='molCanvas'&&canvas.closest?.('body[data-praxis-course="principiul-i-aplicatii"]')){
   let region=canvas.parentElement;
   if(!region.classList.contains('application-canvas-pan')){
    region=document.createElement('div');region.className='application-canvas-pan';canvas.before(region);region.append(canvas);
    const hint=document.createElement('p');hint.id=canvas.id+'-pan-hint';hint.className='application-pan-hint';hint.hidden=true;region.after(hint);region.setAttribute('role','region');region.setAttribute('aria-describedby',hint.id);
   }
   const minWidth=w+'px';if(canvas.style.minWidth!==minWidth)canvas.style.minWidth=minWidth;
   const hint=region.nextElementSibling,overflow=region.clientWidth>0&&region.scrollWidth>region.clientWidth+1;
   const text=window.PraxisI18n.tr('Glisează orizontal pentru a explora diagrama.');if(hint.textContent!==text)hint.textContent=text;
   if(hint.hidden!==!overflow)hint.hidden=!overflow;if(region.tabIndex!==(overflow?0:-1))region.tabIndex=overflow?0:-1;
   const label=window.PraxisI18n.tr(canvas.getAttribute('aria-label')||'Diagramă');if(region.getAttribute('aria-label')!==label)region.setAttribute('aria-label',label);
  }
  const displayedWidth=canvas.getBoundingClientRect().width;
  const cssWidth=displayedWidth>0?displayedWidth:w,cssHeight=cssWidth*h/w;
  if(displayedWidth>0){const height=cssHeight+'px';if(canvas.style.height!==height)canvas.style.height=height;}
  const dpr=window.devicePixelRatio||1;
  const pixelsWide=Math.max(1,Math.round(cssWidth*dpr)),pixelsHigh=Math.max(1,Math.round(cssHeight*dpr));
  if(canvas.width!==pixelsWide)canvas.width=pixelsWide;
  if(canvas.height!==pixelsHigh)canvas.height=pixelsHigh;
  const g=canvas.getContext('2d');g.setTransform(pixelsWide/w,0,0,pixelsHigh/h,0,0);g.clearRect(0,0,w,h);
  return {g,w,h};
 }
 window.PraxisApplicationsCanvas={prepare};
})();
