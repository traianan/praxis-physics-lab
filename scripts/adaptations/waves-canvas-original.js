function LessonCanvas({forwardedRef,width=300,height=150,...props}){
 const owner=N.useContext(LessonActivityContext),active=owner?.active??true;
 const logicalWidth=Number(width),logicalHeight=Number(height);
 const element=N.useRef(null),facade=N.useRef(null),resize=N.useRef(null);
 const setRef=N.useCallback(canvas=>{
  element.current=canvas;
  if(!canvas){if(typeof forwardedRef==='function')forwardedRef(null);else if(forwardedRef)forwardedRef.current=null;return}
  let drawingContext=null,contextFacade=null;
  const proxy=new Proxy(canvas,{get(target,key){
   if(key==='width')return logicalWidth;if(key==='height')return logicalHeight;
   if(key==='getContext')return (kind,...args)=>{
    if(kind!=='2d')return target.getContext(kind,...args);
    if(contextFacade)return contextFacade;
    drawingContext=target.getContext('2d',...args);
    const pixelStage=document.createElement('canvas');
    contextFacade=new Proxy(drawingContext,{get(ctx,name){
     if(name==='canvas')return proxy;
     if(name==='putImageData')return (data,x,y)=>{pixelStage.width=data.width;pixelStage.height=data.height;pixelStage.getContext('2d').putImageData(data,0,0);ctx.drawImage(pixelStage,x,y)};
     const value=Reflect.get(ctx,name,ctx);return typeof value==='function'?value.bind(ctx):value;
    },set(ctx,name,value){Reflect.set(ctx,name,value,ctx);return true}});
    const sx=target.width/logicalWidth,sy=target.height/logicalHeight;drawingContext.setTransform(sx,0,0,sy,0,0);
    return contextFacade;
   };
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }});
  facade.current=proxy;
  resize.current=(release=false)=>{
   const box=canvas.getBoundingClientRect();if(box.width<=0&&!release)return;
   const dpr=Math.min(3,window.devicePixelRatio||1);const w=release?logicalWidth:Math.min(4096,Math.round(box.width*dpr)),h=release?logicalHeight:Math.round(w*logicalHeight/logicalWidth);
   if(canvas.width===w&&canvas.height===h)return;
   // Preserve a one-shot plot until its next redraw, instead of clearing it on resize.
   let snapshot=null;if(drawingContext&&canvas.width>0){snapshot=document.createElement('canvas');snapshot.width=canvas.width;snapshot.height=canvas.height;snapshot.getContext('2d').drawImage(canvas,0,0)}
   canvas.width=w;canvas.height=h;canvas.dataset.renderScale=(w/logicalWidth).toFixed(3);
   if(drawingContext){drawingContext.setTransform(w/logicalWidth,0,0,h/logicalHeight,0,0);if(snapshot)drawingContext.drawImage(snapshot,0,0,logicalWidth,logicalHeight)}
  };
  resize.current();if(typeof forwardedRef==='function')forwardedRef(proxy);else if(forwardedRef)forwardedRef.current=proxy;
 },[forwardedRef,logicalWidth,logicalHeight]);
 N.useLayoutEffect(()=>{resize.current?.(!active)},[active]);
 N.useLayoutEffect(()=>{const observer=new ResizeObserver(()=>resize.current?.());if(element.current)observer.observe(element.current);const update=()=>resize.current?.();window.addEventListener('resize',update);return()=>{observer.disconnect();window.removeEventListener('resize',update)}},[setRef]);
 const events={};for(const [key,value] of Object.entries(props)){if(/^on[A-Z]/.test(key)&&typeof value==='function')events[key]=event=>{const previous=lessonFrameOwner;lessonFrameOwner=owner?.owner??null;try{return value(new Proxy(event,{get(target,name){if(name==='currentTarget')return facade.current;if(name==='target'&&target.target===element.current)return facade.current;const v=Reflect.get(target,name,target);return typeof v==='function'?v.bind(target):v}}))}finally{lessonFrameOwner=previous}}}
 return Cv('canvas',{...props,...events,ref:setRef,width:logicalWidth,height:logicalHeight,'data-logical-width':logicalWidth,'data-logical-height':logicalHeight,style:{...props.style,aspectRatio:logicalWidth+'/'+logicalHeight}});
}