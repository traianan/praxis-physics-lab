/* Canvas drawing only. Numerical state is owned by waves-tsunami-model.js. */
(()=>{
 const stages=new WeakMap();
 function draw(canvas,model,{depth=true,probe=null,place=false,tr=x=>x,vivid=false}={}){
  if(!canvas)return;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  let stage=stages.get(canvas);if(!stage){stage=document.createElement('canvas');stages.set(canvas,stage);}
  stage.width=model.nx;stage.height=model.ny;
  const small=stage.getContext('2d'),pixels=small.createImageData(model.nx,model.ny);
  for(let k=0;k<model.depth.length;k++){
   const z=model.depth[k],p=k*4;let r=239,g=228,b=177;
   if(z){const d=depth?Math.min(1,z/4000):.35;r=75-60*d;g=161-103*d;b=190-100*d;
    const a=Math.min(1,Math.abs(model.eta[k])/model.amplitude),mix=Math.min(.94,2*a);
    const c=model.eta[k]>=0?(vivid?[240,60,35]:[227,100,46]):(vivid?[50,210,255]:[70,210,226]);
    r=r*(1-mix)+c[0]*mix;g=g*(1-mix)+c[1]*mix;b=b*(1-mix)+c[2]*mix;
   }
   pixels.data[p]=r;pixels.data[p+1]=g;pixels.data[p+2]=b;pixels.data[p+3]=255;
  }
  small.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);ctx.drawImage(stage,0,0,w,h);
  const cssWidth=canvas.getBoundingClientRect().width||w,preferred=Math.max(1,parseFloat(getComputedStyle(document.documentElement).fontSize)/16),scale=Math.max(1,w/cssWidth)*preferred,font=14*scale;
  ctx.font='600 '+font+'px system-ui';ctx.textBaseline='middle';ctx.textAlign='center';
  for(const station of model.stations){const x=station.x*w,y=station.y*h;ctx.beginPath();ctx.arc(x,y,11*scale,0,Math.PI*2);ctx.fillStyle='#fffefa';ctx.fill();ctx.lineWidth=2*scale;ctx.strokeStyle='#163f3b';ctx.stroke();ctx.fillStyle='#163f3b';}
  const sx=model.source.x*w,sy=model.source.y*h;
  ctx.beginPath();ctx.arc(sx,sy,9*scale,0,Math.PI*2);ctx.fillStyle='#ffdd66';ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=2*scale;ctx.stroke();ctx.fillStyle='#111';ctx.font='700 '+12*scale+'px system-ui';
  if(probe){const x=probe.x*w,y=probe.y*h;ctx.strokeStyle=place?'#ffdd66':'#fffefa';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(x-10*scale,y);ctx.lineTo(x+10*scale,y);ctx.moveTo(x,y-10*scale);ctx.lineTo(x,y+10*scale);ctx.stroke();}
  // Physical distance: coordinates use equal spacing in both directions.
  const length=200000/(model.nx*model.dx)*w,left=18*scale,bottom=h-22*scale;
  ctx.fillStyle='rgba(255,254,250,.9)';ctx.fillRect(left-6*scale,bottom-14*scale,length+12*scale,32*scale);
  ctx.strokeStyle='#163f3b';ctx.lineWidth=3*scale;ctx.beginPath();ctx.moveTo(left,bottom-5*scale);ctx.lineTo(left+length,bottom-5*scale);ctx.stroke();ctx.fillStyle='#163f3b';ctx.font=12*scale+'px system-ui';ctx.fillText('200 km',left+length/2,bottom+8*scale);
 }
 window.PraxisTsunamiView=Object.freeze({draw});
})();
