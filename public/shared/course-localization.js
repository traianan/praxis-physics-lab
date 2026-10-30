/* Locale-aware drawing, reversible DOM text and scientific presentation preferences. */
(() => {
 const i18n=window.PraxisI18n;i18n.enableCourseMode();
 let colors='praxis',touch=false,root=null;
 try{colors=localStorage.getItem('praxis-course-colors')==='vivid'?'vivid':'praxis';const saved=localStorage.getItem('praxis-course-touch');touch=saved===null?matchMedia('(pointer:coarse)').matches:saved==='true';}catch{}
 const scientific=window.PraxisScientificColors;
 const colorCache=new Map();
 const color=value=>{if(typeof value!=='string')return value;if(!colorCache.has(value))colorCache.set(value,scientific.color(value,colors));return colorCache.get(value);};
 if(window.CanvasGradient){const native=window.CanvasGradient.prototype.addColorStop;window.CanvasGradient.prototype.addColorStop=function(offset,value){return native.call(this,offset,color(value));};}
 if(window.CanvasRenderingContext2D){
  const prototype=CanvasRenderingContext2D.prototype;
  for(const name of ['fillText','strokeText','measureText']){const native=prototype[name];prototype[name]=function(text,...args){return native.call(this,i18n.tr(text),...args);};}
  for(const name of ['fillStyle','strokeStyle']){const native=Object.getOwnPropertyDescriptor(prototype,name);if(native?.set)Object.defineProperty(prototype,name,{...native,set(value){native.set.call(this,color(value));}});}
 }
 function applyPreferences(){colorCache.clear();scientific.apply(colors);document.documentElement.dataset.courseTouch=String(touch);}
 function recolorDom(){
  if(!root||document.body?.dataset.praxisCourse==='unde-mecanice')return;
  for(const element of root.querySelectorAll('[style],[fill],[stroke]')){
   for(const property of ['color','background-color','border-color','fill','stroke']){const value=element.style.getPropertyValue(property),mapped=color(value);if(value!==mapped)element.style.setProperty(property,mapped);}
   for(const attr of ['fill','stroke']){const value=element.getAttribute(attr);if(value&&color(value)!==value)element.setAttribute(attr,color(value));}
  }
 }
 function redraw(){recolorDom();window.dispatchEvent?.(new Event('praxis-course-presentation-change'));if(window.MR)window.MR.redrawAll();if(typeof ALL!=='undefined')ALL.forEach(view=>view.resize());}
 function repaint(){if(root){root.lang=i18n.language;i18n.apply(root);}redraw();}
 function start(original){
  root=original;let pending=false;
  const apply=()=>{pending=false;root.lang=i18n.language;i18n.apply(document.body);};
  const initialise=()=>{
   i18n.apply(document);apply();new MutationObserver(()=>{if(!pending){pending=true;queueMicrotask(apply);}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','aria-valuetext','placeholder','alt']});
   if(typeof ALL!=='undefined')for(const view of ALL)if(view.hit&&view.handles){const native=view.hit.bind(view);view.hit=function(px,py){if(!touch)return native(px,py);let best=null,distance=34;for(const handle of this.handles){const [x,y]=this.P(...handle.get()),d=Math.hypot(px-x,py-y);if(d<distance){distance=d;best=handle;}}return best;};}
   redraw();
  };
  if(document.readyState==='complete')initialise();else window.addEventListener('load',initialise,{once:true});
  window.addEventListener('praxis-language-change',repaint);
 }
 window.addEventListener?.('storage',event=>{if(event.key!=='praxis-course-colors')return;colors=event.newValue==='vivid'?'vivid':'praxis';applyPreferences();redraw();});
 applyPreferences();
 function confirm(message){return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.className='praxis-course-settings';dialog.setAttribute('aria-labelledby','course-confirm-title');const title=document.createElement('h2');title.id='course-confirm-title';title.textContent=i18n.tr('Confirmare');const text=document.createElement('p');text.textContent=i18n.tr(message);const actions=document.createElement('div');actions.className='lb-dialog-actions';for(const [value,label]of [['no','Continuă testul'],['yes','Renunță la test']]){const button=document.createElement('button');button.type='button';button.className='button secondary';button.textContent=i18n.tr(label);button.addEventListener('click',()=>dialog.close(value));actions.append(button);}dialog.append(title,text,actions);dialog.addEventListener('close',()=>{resolve(dialog.returnValue==='yes');dialog.remove();},{once:true});document.body.append(dialog);dialog.showModal();});}
 window.PraxisCourseLocalization={start,redraw,confirm,get colors(){return colors;},get touch(){return touch;},setColors(value){colors=value==='vivid'?'vivid':'praxis';try{localStorage.setItem('praxis-course-colors',colors);}catch{}applyPreferences();redraw();},setTouch(value){touch=!!value;try{localStorage.setItem('praxis-course-touch',String(touch));}catch{}applyPreferences();redraw();}};
})();
