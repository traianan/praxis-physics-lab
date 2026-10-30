/* Keep the source's mathematical coordinates while matching the displayed pixel density. */
(() => {
 function prepare(canvas){
  const width=Number(canvas.dataset.logicalWidth),height=Number(canvas.dataset.logicalHeight);
  const displayedWidth=canvas.getBoundingClientRect().width;
  const context=canvas.getContext('2d');
  if(displayedWidth>0){
   const displayedHeight=displayedWidth*height/width;
   const cssHeight=displayedHeight+'px';if(canvas.style.height!==cssHeight)canvas.style.height=cssHeight;
   const ratio=window.devicePixelRatio||1;
   const pixelWidth=Math.max(1,Math.round(displayedWidth*ratio));
   const pixelHeight=Math.max(1,Math.round(displayedHeight*ratio));
   if(canvas.width!==pixelWidth)canvas.width=pixelWidth;
   if(canvas.height!==pixelHeight)canvas.height=pixelHeight;
   context.setTransform(pixelWidth/width,0,0,pixelHeight/height,0,0);
  }
  window.PraxisVelocityLabels?.begin(context,width,height);
  return {width,height};
 }
 window.PraxisVelocityCanvas={prepare};
})();
