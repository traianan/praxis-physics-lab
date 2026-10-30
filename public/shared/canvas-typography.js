/* Scientific subscripts and safe text bounds for the imported Canvas lessons. */
(() => {
 if(!window.CanvasRenderingContext2D)return;
 const p=CanvasRenderingContext2D.prototype,nativeMeasure=p.measureText;
 function runs(text,font){
  text=String(text).replace(/\bf([012])\b/g,'f_$1');
  const size=Number(font.match(/([\d.]+)px/)?.[1]||12),small=font.replace(/[\d.]+px/,size*.7+'px');
  const parts=[];let end=0;
  for(const match of text.matchAll(/([A-Za-zΑ-ω])_([A-Za-zΑ-ωăâîșțĂÂÎȘȚ0-9]+)/g)){
   if(match.index>end)parts.push({text:text.slice(end,match.index),font,dy:0});
   parts.push({text:match[1],font,dy:0},{text:match[2],font:small,dy:size*.3});end=match.index+match[0].length;
  }
  if(!parts.length)return null;if(end<text.length)parts.push({text:text.slice(end),font,dy:0});return parts;
 }
 function layout(ctx,text){
  const parts=runs(text,ctx.font);if(!parts)return null;const font=ctx.font;
  for(let i=0;i<parts.length;i++){
   const run=parts[i];ctx.font=run.font;const metrics=nativeMeasure.call(ctx,run.text);
   // Keep italic overhangs clear of the adjoining subscript and following text.
   run.width=Math.max(metrics.width,metrics.actualBoundingBoxRight||0)+((run.dy||parts[i+1]?.dy)?1.5:0);
  }ctx.font=font;
  return {parts,width:parts.reduce((sum,run)=>sum+run.width,0)};
 }
 p.measureText=function(text){
  const metrics=nativeMeasure.call(this,text),rich=layout(this,text);if(!rich)return metrics;
  return new Proxy(metrics,{get(target,key){if(key==='width')return rich.width;return Reflect.get(target,key,target);}});
 };
 for(const method of ['fillText','strokeText']){
  const native=p[method];p[method]=function(text,x,y,...args){
   const rich=layout(this,text),metrics=nativeMeasure.call(this,rich?rich.parts.map(run=>run.text).join(''):text);
   const transform=this.getTransform(),size=Number(this.font.match(/([\d.]+)px/)?.[1]||12);
   const width=rich?.width??metrics.width,align=this.textAlign;
   const offset=align==='center'?width/2:['right','end'].includes(align)?width:0;
   if(transform.a>0&&transform.d>0&&!transform.b&&!transform.c){
    const left=(3-transform.e)/transform.a,right=(this.canvas.width-3-transform.e)/transform.a;
    const top=(3-transform.f)/transform.d,bottom=(this.canvas.height-3-transform.f)/transform.d;
    const ascent=metrics.actualBoundingBoxAscent||size,descent=(metrics.actualBoundingBoxDescent||0)+(rich?size*.3:0);
    x=Math.max(left+offset,Math.min(right-width+offset,x));y=Math.max(top+ascent,Math.min(bottom-descent,y));
   }
   if(!rich)return native.call(this,text,x,y,...args);
   this.save();this.textAlign='left';let cursor=x-offset;
   for(const run of rich.parts){this.font=run.font;native.call(this,run.text,cursor,y+run.dy);cursor+=run.width;}this.restore();
  };
 }
 function textInBox(ctx,text,box,{font=ctx.font,color=ctx.fillStyle}={}){
  text=window.PraxisI18n?.tr(text)??String(text);ctx.save();ctx.font=font;ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const metrics=ctx.measureText(text),left=metrics.actualBoundingBoxLeft||0,right=metrics.actualBoundingBoxRight??metrics.width;
  const ascent=metrics.actualBoundingBoxAscent||0,descent=metrics.actualBoundingBoxDescent||0;
  const x=box.x+box.w/2+(left-right)/2,y=box.y+box.h/2+(ascent-descent)/2;
  ctx.fillText(text,x,y);ctx.restore();
  window.PraxisVelocityLabels?.reserve(ctx,box);
  return {x:x-left,y:y-ascent,w:left+right,h:ascent+descent};
 }
 window.PraxisCanvasTypography={runs,textInBox};
})();
