/* Independent loading/unloading controls; the spring laboratory keeps its own clock. */
(()=>{
 const M=window.PraxisMaterialModel,states={},NS='http://www.w3.org/2000/svg';let host,ui,last=null;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const xy=(x,y)=>[65+x*500,270-y*240];
 const pathTo=(kind,end)=>Array.from({length:101},(_,i)=>{const x=end*i/100;return (i?'L':'M')+xy(x,M.stress(kind,x)).join(' ');}).join('');
 function stop(){Object.values(states).forEach(s=>s.playing=false);if(host)sync();}
 function sync(){host.querySelectorAll('[data-material]').forEach(d=>{const s=states[d.dataset.material],b=d.querySelector('[data-m-play]');b.textContent=s.playing?ui.pause:ui.play;b.setAttribute('aria-pressed',String(s.playing));});}
 function draw(d){
  const kind=d.dataset.material,s=states[kind],q=M.cycle(kind,s.level,s.t),svg=d.querySelector('.newton-material-chart svg'),[x,y]=xy(q.x,q.y),[px,py]=xy(q.peak,q.top),[rx,ry]=xy(q.residual,0);
  svg.querySelector('[data-material-trace]').setAttribute('d',q.unloading&&q.plastic?`M${px} ${py}L${x} ${y}`:pathTo(kind,q.x));
  const dot=svg.querySelector('[data-material-dot]');dot.setAttribute('cx',x);dot.setAttribute('cy',y);
  const unload=svg.querySelector('[data-material-unload]');unload.setAttribute('d',q.plastic?`M${px} ${py}L${rx} ${ry}`:'');
  const length=100+q.x*110,width=48/Math.sqrt(1+q.x*1.1),body=d.querySelector('[data-specimen]');body.setAttribute('x',110-width/2);body.setAttribute('width',width);body.setAttribute('height',length);
  d.querySelector('[data-sample-bottom]').setAttribute('transform',`translate(0 ${length-100})`);
  d.querySelector('.newton-specimen>path[stroke="#b65647"]').style.opacity=q.y>1e-6?'1':'0';
  d.querySelector('[data-sample-bottom]').style.opacity=q.y>1e-6?'1':'0';
  d.querySelector('[data-m-status]').textContent=(s.t===0?ui.materialReady:q.done?ui.materialDone:q.unloading?ui.materialUnloading:ui.materialLoading)+' · '+(q.done&&q.residual>0?ui.materialPermanent:q.done?ui.materialRecovered:ui.materialMagnified);
 }
 function mount(root,strings){
  host=root;ui=strings;
  const figures=[...root.querySelectorAll('.newton-material-chart')];
  figures.forEach((figure,i)=>{
   const kind=['ductile','brittle','elastomer'][i],d=figure.closest('details');d.dataset.material=kind;
   const s=states[kind]??={t:0,rate:1,repeat:false,level:kind==='ductile'?60:85,playing:false};
   const layout=document.createElement('div');layout.className='newton-material-layout';d.querySelector('summary').after(layout);layout.append(figure);
   const explanation=document.createElement('div');explanation.className='newton-material-explanation';layout.append(explanation);
   [...d.children].filter(el=>!['SUMMARY'].includes(el.tagName)&&el!==layout).forEach(el=>explanation.append(el));
   const svg=figure.querySelector('svg'),curve=svg.querySelector('path[stroke="#378b87"]');curve.setAttribute('d',pathTo(kind,M.curves[kind].at(-1)[0]));curve.setAttribute('stroke','#a5c7c0');
   // Landmarks follow the normalized path used by the numerical animation.
   const marks=kind==='ductile'?[[.16,.42],[.23,.51],[.70,.88],[.94,.65]]:kind==='brittle'?[[.50,.85]]:[];
   svg.querySelectorAll('circle').forEach((c,j)=>{const [x,y]=xy(...marks[j]);c.setAttribute('cx',x);c.setAttribute('cy',y);const label=c.nextElementSibling;label.setAttribute('x',x+10);label.setAttribute('y',y-12);});
   svg.querySelector('path[stroke-dasharray]')?.remove();
   const group=document.createElementNS(NS,'g');group.innerHTML='<path data-material-unload stroke="#af8050" stroke-width="2" stroke-dasharray="6 5" fill="none"/><path data-material-trace stroke="#288983" stroke-width="4" fill="none"/><circle data-material-dot r="7" fill="#b65647"/>';svg.append(group);
   figure.insertAdjacentHTML('beforeend',`<svg class="newton-specimen" viewBox="0 0 350 245" role="img" aria-label="${esc(ui.materialSpecimen)}"><title>${esc(ui.materialSpecimen)}</title><path d="M60 22H160 M60 122H160" stroke="#a4bcb3" stroke-dasharray="5 5"/><rect x="86" y="22" width="48" height="100" fill="none" stroke="#a4bcb3" stroke-dasharray="5 5"/><rect data-specimen x="86" y="22" width="48" height="100" rx="7" fill="#cce3eb" stroke="#568f99" stroke-width="2"/><path d="M110 22V5 M104 12L110 5L116 12" fill="none" stroke="#b65647" stroke-width="2.5"/><g data-sample-bottom><path d="M110 122V145 M104 138L110 145L116 138" fill="none" stroke="#b65647" stroke-width="2.5"/></g><text x="185" y="68">${esc(ui.materialSpecimen)}</text><text x="185" y="95">${esc(ui.materialMagnified)}</text></svg>`);
   const controls=document.createElement('div');controls.className='newton-controls newton-material-controls';controls.innerHTML=`<label>${esc(ui.materialLevel)}<output>${s.level}%</output><input data-m-level type="range" min="10" max="90" step="1" value="${s.level}"></label><label>${esc(ui.animationSpeed)}<output>${s.rate}×</output><input data-m-rate type="range" min="0.1" max="2" step="0.1" value="${s.rate}"></label><label><input data-m-repeat type="checkbox" ${s.repeat?'checked':''}>${esc(ui.autoRepeat)}</label><div class="newton-actions"><button type="button" class="button secondary" data-m-play>${esc(ui.play)}</button><button type="button" class="button secondary" data-m-reset>${esc(ui.reset)}</button></div><p class="newton-readout" data-m-status role="status"></p><p class="newton-caption">${esc(ui.materialCycleNote)}</p>`;explanation.prepend(controls);
   controls.querySelector('[data-m-play]').onclick=()=>{if(s.t>=8)s.t=0;s.playing=!s.playing;sync();draw(d);};
   controls.querySelector('[data-m-reset]').onclick=()=>{s.t=0;s.playing=false;sync();draw(d);};
   controls.querySelector('[data-m-level]').oninput=e=>{s.level=+e.target.value;e.target.previousElementSibling.textContent=s.level+'%';s.t=0;s.playing=false;sync();draw(d);};
   controls.querySelector('[data-m-rate]').oninput=e=>{s.rate=+e.target.value;e.target.previousElementSibling.textContent=s.rate+'×';};
   controls.querySelector('[data-m-repeat]').onchange=e=>s.repeat=e.target.checked;
   d.addEventListener('toggle',()=>{if(!d.open){s.playing=false;sync();}});draw(d);
  });sync();
 }
 function loop(now){const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;if(host&&!document.hidden&&!host.querySelector('#nt-panel-hooke')?.hidden)host.querySelectorAll('[data-material]').forEach(d=>{const s=states[d.dataset.material];if(s.playing&&d.open){const next=s.t+dt*s.rate;s.t=s.repeat?next%8:Math.min(8,next);if(!s.repeat&&s.t===8){s.playing=false;sync();}draw(d);}});requestAnimationFrame(loop);}
 document.addEventListener('visibilitychange',()=>last=null);
 window.PraxisMaterials={mount,stop,states};requestAnimationFrame(loop);
})();
