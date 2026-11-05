(() => {
 'use strict';
 const $=id=>document.getElementById(id),model=PraxisCoulombModel;
 const q1=$('q1'),q2=$('q2'),r=$('r'),scene=$('scene'),svg=$('simulation');
 const tr=s=>PraxisI18n.tr(s),locale=()=>PraxisI18n.locale;
 const fmt=(v,digits=1)=>v.toLocaleString(locale(),{minimumFractionDigits:digits,maximumFractionDigits:digits});
 let dragOwner=null;
 function set(id,value){if($(id).textContent!==value)$(id).textContent=value;}
 function render(){
  const a=+q1.value,b=+q2.value,d=+r.value,{force:f,direction}=model.interaction(a,b,d);
  const name=direction===0?'Fără forță':direction>0?'Atracție':'Respingere';
  const palette=PraxisScientificColors.palette(window.PraxisCourseLocalization?.colors||'praxis');
  set('q1out',(a>0?'+':'')+fmt(a)+' μC');set('q2out',(b>0?'+':'')+fmt(b)+' μC');set('rout',d+' cm');
  set('force',f===0?'0 N':f>=1?fmt(f,3)+' N':f>=.001?fmt(f*1000,2)+' mN':fmt(f*1e6,2)+' μN');
  set('type',tr(name));set('distanceValue',d+' cm');
  set('typeNote',tr(direction===0?'cel puțin o sarcină este zero':direction>0?'sarcini de semne opuse':'sarcini de același semn'));
  set('interaction',(direction===0?'—':direction>0?'→ ←':'← →')+' '+tr(name));
  set('sign1',a===0?'0':a>0?'+':'−');set('sign2',b===0?'0':b>0?'+':'−');
  set('observation',tr(direction===0?'Cel puțin o sarcină este zero, așadar forța electrică dintre ele este nulă.':direction>0?'Sarcinile au semne opuse și se atrag. Forțele au același modul și sensuri opuse.':'Sarcinile au același semn și se resping. Forțele au același modul și sensuri opuse.'));
  const width=Math.max(320,Math.min(800,scene.clientWidth));svg.setAttribute('viewBox',`0 0 ${width} 300`);
  const g=model.geometry(d,width,f,direction),{x1,x2,length}=g;
  ['c1','c2'].forEach((id,i)=>{
   const c=$(id);c.setAttribute('transform',`translate(${i?x2:x1} 145)`);
   c.setAttribute('aria-valuemin',10);c.setAttribute('aria-valuemax',100);c.setAttribute('aria-valuenow',d);c.setAttribute('aria-valuetext',d+' '+tr('centimetri'));
   c.querySelectorAll('circle')[1].setAttribute('fill',i?palette.blue:palette.red);
   c.querySelectorAll('text')[1].setAttribute('fill','#193d36');
   c.querySelectorAll('text')[1].setAttribute('font-size',16);
  });
  const axis=svg.querySelector(':scope > line');axis.setAttribute('x2',width-20);axis.setAttribute('x1',20);axis.setAttribute('y1',145);axis.setAttribute('y2',145);
  svg.querySelector('#arrow path').setAttribute('fill',palette.green);
  let vectors='';
  if(direction&&$('showVectors').checked){
   [[x1,direction,'F₁'],[x2,-direction,'F₂']].forEach(([x,dir,label])=>{
    const start=x+dir*37,end=start+dir*length;
    vectors+=`<line x1="${start}" y1="145" x2="${end}" y2="145" stroke="${palette.green}" stroke-width="3" marker-end="url(#arrow)"/><text x="${(start+end)/2}" y="123" text-anchor="middle" fill="#193d36" font-size="16" font-weight="600">${label}</text>`;
   });
  }
  $('vectors').innerHTML=vectors;
  $('distance').innerHTML=`<path d="M${x1} 210H${x2}M${x1} 203v14M${x2} 203v14" fill="none" stroke="#536a61"/><rect x="${width/2-51}" y="199" width="102" height="24" rx="5" fill="#f4f6f0"/><text x="${width/2}" y="217" text-anchor="middle" fill="#193d36" font-size="16">r = ${d} cm</text>`;
  scene.classList.toggle('no-grid',!$('showGrid').checked);
 }
 function preset(a,b,d){q1.value=a;q2.value=b;r.value=d;render();}
 [q1,q2,r,$('showGrid'),$('showVectors')].forEach(el=>el.addEventListener('input',render));
 $('repel').onclick=()=>preset(5,5,50);$('attract').onclick=()=>preset(5,-5,50);
 $('reset').onclick=()=>{$('showGrid').checked=true;$('showVectors').checked=true;preset(5,5,50);};
 ['c1','c2'].forEach(id=>{
  const c=$(id);
  c.addEventListener('pointerdown',e=>{if(dragOwner!==null)return;dragOwner=e.pointerId;c.setPointerCapture(e.pointerId);e.preventDefault();});
  c.addEventListener('pointermove',e=>{
   if(dragOwner!==e.pointerId||!c.hasPointerCapture(e.pointerId))return;
   const matrix=svg.getScreenCTM();if(!matrix)return;
   const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
   const width=svg.viewBox.baseVal.width,{min,max}=model.geometry(+r.value,width,0,0);
   r.value=Math.round(Math.max(10,Math.min(100,10+(Math.abs(point.x-width/2)*2-min)/(max-min)*90)));render();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>c.addEventListener(event,e=>{if(dragOwner===e.pointerId)dragOwner=null;}));
  c.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End'].includes(e.key))return;
   e.preventDefault();r.value=e.key==='Home'?10:e.key==='End'?100:Math.max(10,Math.min(100,+r.value+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)));render();
  });
 });
 function tab(name){
  if(!['lab','theory'].includes(name))name='lab';
  document.querySelectorAll('.tabs [data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===name);b.setAttribute('aria-selected',b.dataset.tab===name?'true':'false');});
  ['lab','theory'].forEach(id=>$(id).classList.toggle('active',id===name));
  const select=document.querySelector('.praxis-course-sections');if(select)select.value=name;
  history.replaceState(null,'','#'+name);if(name==='lab')render();
 }
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
 document.querySelector('[data-go-lab]').onclick=()=>{tab('lab');window.scrollTo({top:0});};
 window.addEventListener('hashchange',()=>tab(location.hash.slice(1)));
 window.addEventListener('praxis-language-change',render);
 window.addEventListener('praxis-course-presentation-change',render);
 new ResizeObserver(()=>{if($('lab').classList.contains('active'))render();}).observe(scene);
 window.addEventListener('load',()=>tab(location.hash.slice(1)));
 tab(location.hash.slice(1));
 window.PraxisCoulomb={render,preset,tab};
})();
