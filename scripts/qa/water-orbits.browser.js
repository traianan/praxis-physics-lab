async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const activity=document.querySelector('.wave-water-activity'),part=activity.closest('.lesson-part-content');
 window.dispatchEvent(new CustomEvent('lesson:navigate',{detail:part.id}));await sleep(100);document.getElementById('water-activity-0').click();
 const proto=document.querySelector('#water-panel-0 canvas').getContext('2d'),native={clearRect:proto.clearRect,ellipse:proto.ellipse,arc:proto.arc,stroke:proto.stroke};
 let frame={};const active=ctx=>ctx.canvas.closest('#water-panel-0');
 proto.clearRect=function(...a){if(active(this))frame={ellipses:[],particles:[],guides:0,contrasted:0};return native.clearRect.apply(this,a);};
 proto.ellipse=function(...a){if(active(this))frame.ellipses.push(a.slice(0,4));return native.ellipse.apply(this,a);};
 proto.arc=function(...a){if(active(this)&&a[2]===4.2)frame.particles.push(a.slice(0,2));return native.arc.apply(this,a);};
 proto.stroke=function(...a){if(active(this)){if(this.getLineDash().join(',')==='7,5')frame.guides++;if(Math.abs(this.lineWidth-2.2)<.001)frame.contrasted++;}return native.stroke.apply(this,a);};
 try{
  await sleep(150);const first=structuredClone(frame);await sleep(180);const second=structuredClone(frame);
  const fixed=JSON.stringify(first.ellipses)===JSON.stringify(second.ellipses);
  const onOrbit=second.particles.every(([x,y],i)=>{const[cx,cy,a,b]=second.ellipses[i];return Math.abs(((x-cx)/a)**2+((y-cy)/b)**2-1)<1e-7;});
  const actions=activity.querySelector('.wave-water-actions'),buttons=actions.querySelectorAll('button');buttons[0].click();await sleep(70);
  const canvas=document.querySelector('#water-panel-0 canvas'),before=canvas.toDataURL();
  await sleep(120);const held=canvas.toDataURL()===before;
  const guidePixels=()=>[.22,.48,.74,.94].map(f=>Array.from(proto.getImageData(Math.round(12*canvas.width/800),Math.round((68+f*232)*canvas.height/350),1,1).data).slice(0,3));
  const pixelsOn=guidePixels();frame={ellipses:[],particles:[],guides:0,contrasted:0};
  buttons[1].click();await sleep(150);const pixelsOff=guidePixels();
  const offDetail={changed:canvas.toDataURL()!==before,clearedLevels:pixelsOn.filter((rgb,i)=>rgb.reduce((s,v,c)=>s+Math.abs(v-pixelsOff[i][c]),0)>25).length,buttons:[...buttons].map(b=>b.textContent)};
  const off=offDetail.clearedLevels>=3&&offDetail.changed&&buttons[1].textContent.includes('inactive');buttons[1].click();await sleep(100);
  const ro=activity.querySelector('.wave-water-orbit-note').textContent;await PraxisI18n.setLanguage('en');await sleep(70);const en=activity.querySelector('.wave-water-orbit-note').textContent;await PraxisI18n.setLanguage('ro');
  const result={orbits:second.ellipses.length,particles:second.particles.length,guides:second.guides,contrasted:second.contrasted,fixed,onOrbit,bottomRadius:second.ellipses[4][2],held,off,offDetail,translated:ro.includes('Centre fixe')&&en.includes('Fixed centres')};
  if(result.orbits!==15||result.particles!==15||result.guides!==5||result.contrasted!==15||!fixed||!onOrbit||result.bottomRadius<7||!held||!off||!result.translated)throw Error('Water orbit audit: '+JSON.stringify(result));
  window.scrollTo(0,0);
  return result;
 }finally{Object.assign(proto,native);}
}
