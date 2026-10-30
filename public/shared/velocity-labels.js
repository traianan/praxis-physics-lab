/* Draw annotations after the geometry, keeping each label inside its own panel. */
(() => {
 const frames=new WeakMap(),installed=new WeakSet();
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 function crosses(box,line){
  let low=0,high=1;const [x,y,u,v]=line,dx=u-x,dy=v-y;
  for(const [p,q]of [[-dx,x-box.x],[dx,box.x+box.w-x],[-dy,y-box.y],[dy,box.y+box.h-y]]){
   if(p===0){if(q<0)return false;}else{const t=q/p;if(p<0)low=Math.max(low,t);else high=Math.min(high,t);if(low>high)return false;}
  }return true;
 }
 function place(preferred,bounds,obstacles){
  let best=null,score=Infinity;
  for(const dy of [0,-20,20,-40,40,-64,64,-90,90])for(const dx of [0,-preferred.w-14,14,-preferred.w/2]){
   const box={...preferred,x:Math.max(bounds.x,Math.min(bounds.x+bounds.w-preferred.w,preferred.x+dx)),y:Math.max(bounds.y,Math.min(bounds.y+bounds.h-preferred.h,preferred.y+dy))};
   let cost=Math.hypot(box.x-preferred.x,box.y-preferred.y);
   for(const other of obstacles.boxes)cost+=overlap(box,other)*10000;
   for(const line of obstacles.lines)if(crosses(box,line))cost+=700;
   if(cost<score){score=cost;best=box;}
  }
  // Dense 1D tracks sometimes need a free lane farther from the preferred location.
  if(obstacles.boxes.some(other=>overlap(best,other)>0)){
   for(let y=bounds.y;y<=bounds.y+bounds.h-preferred.h;y+=preferred.h+3)for(let x=bounds.x;x<=bounds.x+bounds.w-preferred.w;x+=24){
    const box={...preferred,x,y};if(obstacles.boxes.some(other=>overlap(box,other)>0))continue;
    let cost=Math.hypot(x-preferred.x,y-preferred.y);for(const line of obstacles.lines)if(crosses(box,line))cost+=700;
    if(cost<score){score=cost;best=box;}
   }
  }return best;
 }
 function install(ctx){
  if(installed.has(ctx))return;installed.add(ctx);
  for(const name of ['beginPath','moveTo','lineTo','arc','stroke','fillRect']){
   const native=ctx[name];ctx[name]=function(...args){
    const f=frames.get(ctx);
    if(f&&!f.painting){
     if(name==='beginPath'){f.path=[];f.point=null;}
     if(name==='moveTo')f.point=args;
     if(name==='lineTo'){if(f.point)f.path.push([...f.point,...args]);f.point=args;}
     if(name==='stroke'&&ctx.lineWidth>=1.5)f.lines.push(...f.path);
     if(name==='arc'){
      const [x,y,r,start,end]=args;
      if(r>=3&&r<=20)f.points.push({x:x-r-4,y:y-r-4,w:2*r+8,h:2*r+8});
      else if(r>20){let previous=[x+r*Math.cos(start),y+r*Math.sin(start)];for(let i=1;i<=48;i++){const angle=start+(end-start)*i/48,next=[x+r*Math.cos(angle),y+r*Math.sin(angle)];f.path.push([...previous,...next]);previous=next;}}
     }
     if(name==='fillRect'){const [x,y,w,h]=args;if(w>100&&h>60){f.bounds={x:x+7,y:y+7,w:w-14,h:h-14};f.panels.push(f.bounds);}}
    }
    return native.apply(this,args);
   };
  }
 }
 function begin(ctx,width,height){
  install(ctx);frames.set(ctx,{viewport:{x:8,y:8,w:width-16,h:height-16},bounds:{x:8,y:8,w:width-16,h:height-16},labels:[],lines:[],points:[],panels:[],path:[],point:null,painting:false});
 }
 function label(ctx,text,x,y,options={}){
  const frame=frames.get(ctx);if(!frame)return ctx.fillText(text,x,y);
  text=window.PraxisI18n?.tr(text)??String(text);
  const vectorPattern=/Δ[rv]|[rva](?=[₀₁₂ₘₙₜ(])|^[rva]$/g;
  const vectors=(ctx.canvas.id==='curv-canvas'||options.vectorNotation)?[...text.matchAll(vectorPattern)].map(match=>({start:match.index,text:match[0]})):[];
  frame.labels.push({text,x,y,font:ctx.font,color:ctx.fillStyle,movable:!!options.movable,ignorePanels:!!options.ignorePanels,bounds:options.bounds||(options.anchorBounds&&(x<frame.bounds.x||y<frame.bounds.y||x>frame.bounds.x+frame.bounds.w||y>frame.bounds.y+frame.bounds.h)?frame.viewport:frame.bounds),anchor:options.anchor,vectors});
 }
 function flush(ctx){
  const f=frames.get(ctx);if(!f)return;f.painting=true;const placed=[];
  ctx.save();
  const fixed=label=>!label.movable&&(label.y-label.bounds.y<24||/^(?:[−+-]?\d+(?:[.,]\d+)?s?|v=0|O\(0,0\)|[xy])$/.test(label.text));
  for(const label of [...f.labels].sort((a,b)=>Number(fixed(b))-Number(fixed(a)))){
   ctx.font=label.font;const size=Number(label.font.match(/([\d.]+)px/)?.[1]||12),padding=3;
   // Fit long panel headings by wrapping complete words, without shrinking the font.
   const lines=[];let line='';
   for(const word of label.text.split(' ')){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>label.bounds.w-2*padding){lines.push(line);line=word;}else line=next;}lines.push(line);
   const arrowSpace=label.vectors.length?7:0;
   const w=Math.min(label.bounds.w,Math.max(...lines.map(s=>ctx.measureText(s).width))+2*padding),h=lines.length*(size+3)+2*padding+arrowSpace;
   const preferred={x:label.x-padding,y:label.y-size-padding,w,h};
   const obstacles={boxes:[...placed,...(fixed(label)?[]:f.points),...(label.ignorePanels?[]:f.panels.filter(panel=>panel!==label.bounds))],lines:fixed(label)?[]:f.lines};
   const box=place(preferred,label.bounds,obstacles);placed.push(box);
   if(label.anchor&&Math.hypot(box.x-preferred.x,box.y-preferred.y)>18){
    ctx.strokeStyle='#8ca69a';ctx.lineWidth=.7;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(...label.anchor);ctx.lineTo(Math.max(box.x,Math.min(box.x+box.w,label.anchor[0])),Math.max(box.y,Math.min(box.y+box.h,label.anchor[1])));ctx.stroke();ctx.setLineDash([]);
   }
   ctx.fillStyle='#ffffff';ctx.fillRect(box.x,box.y,box.w,box.h);
   ctx.fillStyle=label.color;ctx.textAlign='left';ctx.textBaseline='top';
   lines.forEach((text,index)=>{
    const tx=box.x+padding,ty=box.y+padding+arrowSpace+index*(size+3);ctx.fillText(text,tx,ty);
    if(label.vectors.length)for(const match of text.matchAll(/Δ[rv]|[rva](?=[₀₁₂ₘₙₜ(])|^[rva]$/g)){
     const start=tx+ctx.measureText(text.slice(0,match.index)).width,end=start+ctx.measureText(match[0].replace(/[ₘ₁₂]/g,'')).width;
     const y=ty-3;ctx.strokeStyle=label.color;ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(start,y);ctx.lineTo(end,y);ctx.moveTo(end-3,y-2);ctx.lineTo(end,y);ctx.lineTo(end-3,y+2);ctx.stroke();
    }
   });
   label.box=box;
  }
  ctx.restore();f.painting=false;
 }
 window.PraxisVelocityLabels={begin,label,flush,place,reserve(ctx,box){frames.get(ctx)?.points.push(box);},inspect:ctx=>frames.get(ctx)?.labels.map(({text,box,bounds})=>({text,box,bounds}))||[]};
})();
