// Distribution adapter: navigation and shared audio; the optical engine stays untouched.
(() => {
 const scheme=document.getElementById('color-scheme');
 function applyScheme(){window.PraxisScientificColors.apply(scheme.value);}
 scheme.addEventListener('change',applyScheme);applyScheme();
 window.addEventListener('storage',event=>{if(event.key!=='praxis-course-colors')return;scheme.value=event.newValue==='vivid'?'vivid':'praxis';scheme.dispatchEvent(new Event('change',{bubbles:true}));});
 let saved=null;try{saved=JSON.parse(sessionStorage.getItem('praxis-library-return')||'null');}catch{}
 const base=new URL('../../',location.href);let target=new URL(base);
 const home=new URL('?home=1',base);
 try{const candidate=new URL(saved?.url||'./',base);if(candidate.origin===location.origin&&candidate.pathname.startsWith(base.pathname))target=candidate;}catch{}
 const link=(compact=false)=>{const a=document.createElement('a');a.href=target.href;a.className='button secondary library-return'+(compact?' compact':'');a.textContent=compact?'←':'← Bibliotecă';a.title='Înapoi la biblioteca de fizică';a.setAttribute('aria-label','Înapoi la biblioteca de fizică');return a;};
 const top=document.querySelector('.topbar');const actions=[document.querySelector('#board-mode'),document.querySelector('#help-button')].filter(Boolean);
 window.PraxisLabHeader.mount({title:'Optică geometrică',returnHref:target.href,replace:top,actions});
 document.querySelector('.page-intro')?.classList.add('praxis-lab-intro');document.querySelector('.workspace-top')?.classList.add('praxis-lab-nav');
 const bar=document.querySelector('.board-bar');if(bar){bar.prepend(link(true));const exit=document.querySelector('#board-exit');if(exit)exit.textContent='Mod normal';}
 if(bar){const chapter=document.createElement('a');chapter.href=new URL('?chapter=1#capitol/lumina-si-radiatii',base).href;chapter.className='button secondary praxis-board-chapter';chapter.textContent='Lumină și radiații';bar.prepend(chapter);}
 if(bar){const mark=document.createElement('a');mark.href=home.href;mark.className='praxis-home-mark';mark.setAttribute('aria-label','Acasă — biblioteca de fizică');mark.title='Acasă — biblioteca de fizică';mark.innerHTML='<img src="../../assets/favicon.svg" width="32" height="32" alt="">';bar.prepend(mark);}
 bar?.append(window.PraxisSound.createToggle({compact:true}));
 document.querySelector('.board-size-row')?.append(window.PraxisI18n.createSelector());
 window.addEventListener('praxis-language-change',()=>window.PraxisOptics.refreshLanguage());
 const style=document.createElement('style');style.textContent='.library-return{min-height:44px;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}.library-return.compact{min-width:44px;padding:7px;font-size:23px}.board-bar{flex-wrap:wrap}.board-bar .library-return{flex-shrink:0}@media(max-width:650px){.board-bar .button{padding-inline:6px;font-size:13px}.board-bar .library-return{font-size:20px}.board-bar{gap:4px!important}}';document.head.append(style);
 window.PraxisOptics.refreshLanguage();
 const touchButton=document.getElementById('touch-mode');
 if(touchButton){
  try{const saved=localStorage.getItem('praxis-course-touch');if(saved!==null&&touchButton.getAttribute('aria-pressed')!==saved)touchButton.click();}catch{}
  touchButton.addEventListener('click',()=>{try{localStorage.setItem('praxis-course-touch',touchButton.getAttribute('aria-pressed'));}catch{}});
 }
 if(saved?.board?.enabled)document.querySelector('#board-mode')?.click();
 // Keep SVG annotations legible after language, viewport and experiment changes.
 const scene=document.getElementById('scene'),sources=new WeakMap();let scheduled=false;
 const intersection=(a,b)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
 function layoutLabels(){
  scheduled=false;if(!scene||!scene.getBoundingClientRect().height)return;
  observer.disconnect();
  const bounds=scene.viewBox.baseVal,placed=[];
  for(const group of scene.querySelectorAll('g[transform]')){
   const text=group.querySelector(':scope > text'),rect=group.querySelector(':scope > rect');
   if(!text||!rect||group.children.length!==2)continue;
   const box=text.getBBox(),width=box.width+24,height=Math.max(31,box.height+12),matrix=group.transform.baseVal.consolidate()?.matrix;
   const x=Math.max(6,Math.min(bounds.width-width-6,matrix?.e||0)),y=Math.max(6,Math.min(bounds.height-height-6,matrix?.f||0));
   rect.setAttribute('width',width);rect.setAttribute('height',height);text.setAttribute('x',width/2);text.setAttribute('y',6-box.y+Number(text.getAttribute('y')));
   group.setAttribute('transform',`translate(${x} ${y})`);placed.push({x,y,width,height});
  }
  for(const element of [...scene.querySelectorAll('text')].filter(element=>!element.closest('g[transform]'))){
   let original=sources.get(element);if(!original){original={x:element.getAttribute('x'),y:element.getAttribute('y')};sources.set(element,original);}
   element.setAttribute('x',original.x);element.setAttribute('y',original.y);
   const box=element.getBBox();let best=null,score=Infinity;
   const candidates=[];
   for(const dy of [0,-24,24,-48,48,-72,72,-96,96])for(const dx of [0,-24,24,-48,48])candidates.push({x:box.x+dx,y:box.y+dy});
   for(let y=6;y+box.height<=bounds.height-6;y+=box.height+6)for(let x=6;x+box.width<=bounds.width-6;x+=24)candidates.push({x,y});
   for(const position of candidates){
    const candidate={x:Math.max(6,Math.min(bounds.width-box.width-6,position.x)),y:Math.max(6,Math.min(bounds.height-box.height-6,position.y)),width:box.width,height:box.height};
    let cost=Math.hypot(candidate.x-box.x,candidate.y-box.y);for(const prior of placed)cost+=intersection(candidate,prior)*10000;
    if(cost<score){score=cost;best=candidate;}
   }
   if(best){element.setAttribute('x',Number(original.x)+best.x-box.x);element.setAttribute('y',Number(original.y)+best.y-box.y);placed.push(best);}
  }
  observer.observe(scene,{childList:true,subtree:true,characterData:true});
 }
 function queueLabels(){if(!scheduled){scheduled=true;requestAnimationFrame(layoutLabels);}}
 const observer=new MutationObserver(queueLabels);if(scene){observer.observe(scene,{childList:true,subtree:true,characterData:true});new ResizeObserver(queueLabels).observe(scene);window.addEventListener('praxis-language-change',queueLabels);queueLabels();}
 const labelStyle=document.createElement('style');labelStyle.textContent='#scene text{paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round}';document.head.append(labelStyle);
})();
