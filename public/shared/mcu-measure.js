/* A single simulation clock drives both markers, counting and measurements. */
(()=>{
 function init(){
  const $=id=>document.getElementById(id),radius=$('measure-radius'),frequency=$('measure-frequency');
  if(!radius)return;
  let time=0,running=false,frame=null,last=null,saved=false;
  const rows=[],tr=s=>PraxisI18n.tr(s),num=(x,d=2)=>x.toLocaleString(PraxisI18n.locale,{maximumFractionDigits:d});
  const visible=()=>!document.hidden&&document.body.dataset.mcuActive==='masurare';
  function draw(){
   const f=+frequency.value,R=+radius.value,turns=Math.min(10,time*f);
   $('rotation-arm').setAttribute('transform',`rotate(${-360*turns} 180 150)`);
   $('measure-radius-value').textContent=num(R)+' m';
   $('measure-frequency-value').textContent=num(f)+' Hz';
   $('measure-readout').textContent=`t = ${num(time)} s | N = ${Math.floor(turns+1e-9)}/10 | θ = ${num(2*Math.PI*turns)} rad`;
   $('measure-play').textContent=tr(saved?'Probă încheiată':running?'Pauză':time?'Continuă':'Începe proba');
   $('measure-play').disabled=saved;
   $('measure-status').textContent=tr(saved?'Probă încheiată. Rezultatul este în tabel.':time?'Numără trecerile prin reperul 0.':'Alege parametrii, apoi pornește.');
  }
  function renderRows(){
   $('measure-results').replaceChildren(...rows.map(row=>{
    const line=document.createElement('tr');
    for(const value of row){const cell=document.createElement('td');cell.textContent=num(value,3);line.append(cell);}return line;
   }));
  }
  function stopFrame(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
  function schedule(){stopFrame();if(running&&visible())frame=requestAnimationFrame(tick);}
  function tick(now){
   frame=null;if(!running||!visible()){last=null;return;}
   const f=+frequency.value,before=Math.floor(time*f+1e-9);
   time=Math.min(10/f,time+(last===null?0:Math.max(0,(now-last)/1000)));last=now;
   if(Math.floor(time*f+1e-9)>before)PraxisSound.play('event');
   if(time>=10/f){
    running=false;saved=true;const R=+radius.value;
    rows.push([R,10,time,time/10,10/time,20*Math.PI/time,20*Math.PI*R/time]);
    if(rows.length>3)rows.shift();renderRows();
   }
   draw();if(running)frame=requestAnimationFrame(tick);
  }
  function reset(){running=false;time=0;saved=false;stopFrame();draw();}
  $('measure-play').addEventListener('click',()=>{running=!running;draw();schedule();});
  $('measure-reset').addEventListener('click',reset);
  for(const input of [radius,frequency])input.addEventListener('input',reset);
  window.addEventListener('praxis-mcu-tab-change',schedule);
  document.addEventListener('visibilitychange',schedule);
  window.addEventListener('pagehide',stopFrame);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('praxis-language-change',()=>{draw();renderRows();});
  draw();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
