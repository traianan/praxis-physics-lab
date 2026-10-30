/* Draw at displayed pixel density while retaining the original scientific coordinates. */
(() => {
 function prepare(canvas){
  if(!canvas.dataset.logicalWidth){canvas.dataset.logicalWidth=canvas.getAttribute('width');canvas.dataset.logicalHeight=canvas.getAttribute('height');}
  const w=Number(canvas.dataset.logicalWidth),h=Number(canvas.dataset.logicalHeight);
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
