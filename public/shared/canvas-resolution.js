/* Display sampling only: numerical grids, logical coordinates and clocks stay local. */
(() => {
 if(window.PraxisCanvasResolution)return;
 function ratio(width,height){
  const native=Math.max(.5,Number(window.devicePixelRatio)||1);
  if(!(width>0&&height>0))return native;
  return Math.min(Math.max(2,native*1.5),Math.max(native,Math.sqrt(8000000/(width*height))),8192/width,8192/height);
 }
 function forCanvas(canvas){const box=canvas.getBoundingClientRect();return ratio(box.width,box.height);}
 window.PraxisCanvasResolution={ratio,forCanvas};
 let density=window.devicePixelRatio||1,timer,query;
 function watchQuery(){query?.removeEventListener('change',check);query=window.matchMedia?.('(resolution: '+density+'dppx)');query?.addEventListener('change',check,{once:true});}
 function check(){
  if(document.hidden)return;
  const next=window.devicePixelRatio||1;if(next===density)return;
  density=next;watchQuery();window.dispatchEvent(new Event('resize'));
 }
 function start(){if(document.hidden)return;if(timer===undefined)timer=window.setInterval(check,250);check();}
 function stop(){if(timer!==undefined)window.clearInterval(timer);timer=undefined;}
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);
 watchQuery();start();
})();
