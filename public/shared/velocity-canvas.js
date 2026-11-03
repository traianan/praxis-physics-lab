/* Keep scientific coordinates; supersample all three animated drawing surfaces. */
(() => {
 function prepare(canvas){
  const width=Number(canvas.dataset.logicalWidth),height=Number(canvas.dataset.logicalHeight);
  // Keep the original annotation size; the surrounding region can pan on narrow screens.
  const minWidth=width+'px';if(canvas.style.minWidth!==minWidth)canvas.style.minWidth=minWidth;
  const displayedWidth=canvas.getBoundingClientRect().width;
  const context=canvas.getContext('2d');
  if(displayedWidth>0){
   const displayedHeight=displayedWidth*height/width;
   const cssHeight=displayedHeight+'px';if(canvas.style.height!==cssHeight)canvas.style.height=cssHeight;
   const nativeRatio=Math.max(.5,window.devicePixelRatio||1);
   // Reserve extra samples for thin curves, subscripts and screen scaling.
   // Bound supersampling to 8 MP, while retaining native density when it already
   // needs more pixels. A side-length guard avoids unsupported bitmap sizes.
   const memoryRatio=Math.sqrt(8000000/(displayedWidth*displayedHeight));
   const ratio=Math.min(Math.max(2,nativeRatio*1.5),Math.max(nativeRatio,memoryRatio),8192/displayedWidth,8192/displayedHeight);
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
