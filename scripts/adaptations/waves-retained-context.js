// Retain the current logical frame, never rerun an effect or its simulation clock.
// The lesson uses no clips/transforms; save/restore and transforms are retained too.
function lessonRetainedContext(canvas, facadeCanvas, logicalWidth, logicalHeight, ...contextArgs) {
 const context=canvas.getContext('2d',...contextArgs),stage=document.createElement('canvas');
 const paints=['direction','fillStyle','filter','font','fontKerning','fontStretch','fontVariantCaps','globalAlpha','globalCompositeOperation','imageSmoothingEnabled','imageSmoothingQuality','letterSpacing','lineCap','lineDashOffset','lineJoin','lineWidth','miterLimit','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY','strokeStyle','textAlign','textBaseline','textRendering','wordSpacing'];
 const paths=new Set(['arc','arcTo','bezierCurveTo','closePath','ellipse','lineTo','moveTo','quadraticCurveTo','rect','roundRect']);
 const reads=new Set(['measureText','isPointInPath','isPointInStroke','getLineDash','getTransform','createImageData','getImageData','isContextLost']);
 const resources=new WeakMap(),styles=new Map();let commands=[],path=[],stack=[],baseline=null,overflow=false,gradientCache=new Map();
 const base=()=>[canvas.width/logicalWidth,0,0,canvas.height/logicalHeight,0,0];
 function matrix(){const m=context.getTransform();return [m.a/base()[0],m.b/base()[3],m.c/base()[0],m.d/base()[3],m.e/base()[0],m.f/base()[3]];}
 function transform(m){const [sx,,,sy]=base();context.setTransform(sx*m[0],sy*m[1],sx*m[2],sy*m[3],sx*m[4],sy*m[5]);}
 function resource(value){return value&&typeof value==='object'?resources.get(value)??value:value;}
 function resolve(value){
  if(!value?.lessonGradient)return value;
  if(gradientCache.has(value))return gradientCache.get(value);
  context.save();transform(value.matrix);const gradient=context[value.kind](...value.args);context.restore();for(const stop of value.stops)gradient.addColorStop(...stop);gradientCache.set(value,gradient);return gradient;
 }
 function state(){const values={};for(const name of paints)if(name in context)values[name]=styles.has(name)?styles.get(name):context[name];return {values,matrix:matrix(),dash:context.getLineDash()};}
 function apply(s){transform(s.matrix);for(const [key,value]of Object.entries(s.values))context[key]=resolve(value);context.setLineDash(s.dash);}
 function remember(command){if(overflow)return;if(commands.length>=100000){commands=[];path=[];baseline=null;overflow=true;return;}commands.push(command);}
 function fullRect(args){return args[0]<=0&&args[1]<=0&&args[0]+args[2]>=logicalWidth&&args[1]+args[3]>=logicalHeight&&matrix().every((v,i)=>Math.abs(v-[1,0,0,1,0,0][i])<1e-9);}
 function newFrame(){baseline={state:state(),stack:stack.slice(),path:path.slice()};commands=[];gradientCache=new Map();overflow=false;}
 function pixels(data,x,y,...dirty){stage.width=data.width;stage.height=data.height;stage.getContext('2d').putImageData(data,0,0,...dirty);context.drawImage(stage,x,y);}
 function call(name,args){if(name==='putImageData')return pixels(...args);if(name==='setTransform'){const m=typeof args[0]==='object'?args[0]:null;return transform(m?[m.a,m.b,m.c,m.d,m.e,m.f]:args);}if(name==='resetTransform')return transform([1,0,0,1,0,0]);return context[name](...args);}
 transform([1,0,0,1,0,0]);baseline={state:state(),stack:[],path:[]};
 const facade=new Proxy(context,{
  get(ctx,name){
   if(name==='canvas')return facadeCanvas;
   const value=Reflect.get(ctx,name,ctx);if(typeof value!=='function')return value;
   if(reads.has(name))return value.bind(ctx);
   if(['createLinearGradient','createRadialGradient','createConicGradient'].includes(name))return (...args)=>{
    const native=value.apply(ctx,args),description={lessonGradient:true,kind:name,args,stops:[],matrix:matrix()};
    const proxy=new Proxy(native,{get(target,key){if(key==='addColorStop')return (...stop)=>{target.addColorStop(...stop);const current=gradientCache.get(description);if(current&&current!==target)current.addColorStop(...stop);description.stops.push(stop);};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});resources.set(proxy,description);gradientCache.set(description,native);return proxy;
   };
   return (...args)=>{
    const opaque=name==='fillRect'&&ctx.globalAlpha===1&&ctx.globalCompositeOperation==='source-over'&&typeof ctx.fillStyle==='string'&&/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(ctx.fillStyle)&&!ctx.shadowBlur&&(!ctx.filter||ctx.filter==='none');
    if((name==='clearRect'||opaque)&&fullRect(args))newFrame();
    if(name==='putImageData'){
     const data=args[0];if(args[1]===0&&args[2]===0&&data.width===logicalWidth&&data.height===logicalHeight&&args.length===3&&data.data.every((value,i)=>i%4!==3||value===255))newFrame();
     const copy=ctx.createImageData(data.width,data.height);copy.data.set(data.data);args=[copy,...args.slice(1)];
    }
    if(name==='save')stack.push(state());else if(name==='restore'&&stack.length){const s=stack.pop();styles.clear();for(const [key,v]of Object.entries(s.values))styles.set(key,v);}
    if(name==='beginPath')path=[];else if(paths.has(name)){if(path.length<100000)path.push([name,args]);}
    remember(['call',name,args]);return call(name,args);
   };
  },
  set(ctx,name,value){const retained=resource(value);Reflect.set(ctx,name,resolve(retained),ctx);styles.set(name,retained?.lessonGradient?retained:ctx[name]);remember(['set',name,styles.get(name)]);return true;}
 });
 return {context,facade,
  // A bounded emergency fallback for unanticipated drawings over 100k commands.
  // Normal lesson frames always replay vector commands at the new pixel density.
  snapshot(){if(!overflow)return null;const image=document.createElement('canvas');image.width=canvas.width;image.height=canvas.height;image.getContext('2d').drawImage(canvas,0,0);return {image,state:state(),stack:stack.slice()};},
  replay(snapshot){
   gradientCache=new Map();if(overflow){transform([1,0,0,1,0,0]);if(snapshot){context.drawImage(snapshot.image,0,0,logicalWidth,logicalHeight);for(const saved of snapshot.stack){apply(saved);context.save();}apply(snapshot.state);}return;}
   for(const saved of baseline.stack){apply(saved);context.save();}apply(baseline.state);context.beginPath();for(const [name,args]of baseline.path)call(name,args);
   for(const [type,name,value]of commands){if(type==='set')context[name]=resolve(value);else call(name,value);}
  },
  stats:()=>({commands:commands.length,path:path.length,overflow})
 };
}
