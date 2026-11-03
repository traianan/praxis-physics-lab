/* Browser-only QA. Inject after the lesson loads; never included in app bundles. */
(() => {
 'use strict';
 const groupSelector='[role="tablist"],.praxis-workspace-activities,.praxis-lab-nav .tabs,.praxis-lab-nav .module-tabs,#praxis-original .tabs,#praxis-original .mode-tabs,#praxis-original .lab-nav,#praxis-original .lesson-tabs,#praxis-original .lesson-topics,#praxis-original .lesson-parts,#optic-choices';
 const selectSelector='.praxis-course-sections,.praxis-workspace-activities select,select[data-workspace-activity],select[data-activity],.wave-group-choice select,.wave-part-choice select';
 const visible=e=>!!e&&e.getClientRects().length>0&&!e.closest('[hidden],[inert]')&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
 const label=e=>(e.getAttribute('aria-label')||e.innerText||e.textContent||e.id||e.tagName).replace(/\s+/g,' ').trim().slice(0,90);
 const round=n=>Number.isFinite(n)?Math.round(n*1000)/1000:null;
 const nodeKey=e=>{
  if(e.id)return '#'+e.id;
  const parts=[];
  for(let n=e;n&&n!==document.body;n=n.parentElement){if(n.id){parts.unshift('#'+n.id);break;}parts.unshift(n.tagName.toLowerCase()+':'+[...n.parentElement.children].indexOf(n));}
  return parts.join('/');
 };
 const policy=(w,h)=>window.PraxisCanvasResolution?.ratio(w,h)??null;
 const groups=()=>[...document.querySelectorAll(groupSelector)].filter(visible);
 function buttons(group){
  return [...group.querySelectorAll('button,[role="tab"],a[data-tab],a.tab[href^="#"]')].filter(e=>visible(e)&&!e.disabled&&e.closest(groupSelector)===group&&
   // Only navigation groups enter this function. Never follow external lesson links.
   (e.tagName!=='A'||e.getAttribute('href')?.startsWith('#')));
 }
 const signature=g=>nodeKey(g)+'|'+buttons(g).map(e=>e.id||label(e)).join('~');
 const selectKey=e=>nodeKey(e)+'|'+[...e.options].map(o=>o.value+':'+o.textContent.trim()).join('~');
 let lastResults=[],lastInitialRoute=[],lastLanguage='ro';
 function scan(route){
  const canvases=[...document.querySelectorAll('canvas')].filter(visible).map(e=>{
   const r=e.getBoundingClientRect(),expected=policy(r.width,r.height),dx=e.width/r.width,dy=e.height/r.height;
   const invalid=!(r.width>0&&r.height>0&&e.width>0&&e.height>0&&Number.isFinite(dx)&&Number.isFinite(dy));
   const shortfall=expected!==null&&!invalid&&(e.width+2<r.width*expected||e.height+2<r.height*expected);
   return {id:e.id||nodeKey(e),css:[round(r.width),round(r.height)],pixels:[e.width,e.height],density:[round(dx),round(dy)],expected:round(expected),invalid,sharp:expected===null?null:!invalid&&!shortfall};
  });
  const vectors=[...document.querySelectorAll('svg')].filter(visible).map(e=>{
   const r=e.getBoundingClientRect(),children=[...e.children];
   // Symbol sprites intentionally have no viewport: <use> instances are audited separately.
   const resource=children.some(c=>/^(defs|symbol)$/i.test(c.localName))&&children.every(c=>/^(defs|symbol|style|title|desc|metadata)$/i.test(c.localName));
   return {id:e.id||nodeKey(e),css:[round(r.width),round(r.height)],decorative:e.getAttribute('aria-hidden')==='true'||Math.max(r.width,r.height)<=32,resource,invalid:!resource&&!(r.width>0&&r.height>0)};
  });
  const images=[...document.querySelectorAll('img')].filter(visible).map(e=>{
   const r=e.getBoundingClientRect(),url=e.currentSrc||e.src,vector=/^(?:data:image\/svg\+xml)|\.svg(?:[?#]|$)/i.test(url),expected=policy(r.width,r.height);
   const invalid=!(r.width>0&&r.height>0&&e.complete&&e.naturalWidth>0&&e.naturalHeight>0);
   const undersampled=!vector&&!invalid&&expected!==null&&(e.naturalWidth+2<r.width*expected||e.naturalHeight+2<r.height*expected);
   return {id:e.id||nodeKey(e),src:url.startsWith('data:')?url.slice(0,45)+'…':url.replace(location.origin,''),type:vector?'vector':'raster',css:[round(r.width),round(r.height)],natural:[e.naturalWidth,e.naturalHeight],decorative:e.getAttribute('aria-hidden')==='true'||e.alt===''||Math.max(r.width,r.height)<=32,expected:round(expected),invalid,undersampled};
  });
  return {route,hash:location.hash,canvases,vectors,images};
 }
 async function run({language='ro',maxStates=Infinity}={}){
  if(!(maxStates>0))throw new Error('maxStates must be positive');
  const wait=()=>new Promise(resolve=>setTimeout(resolve,25));
  if(window.PraxisI18n?.setLanguage)await window.PraxisI18n.setLanguage(language);
  await wait();
  lastInitialRoute=[...groups().flatMap(g=>buttons(g).filter(e=>e.getAttribute('aria-selected')==='true'||e.getAttribute('aria-pressed')==='true'||e.getAttribute('aria-current')==='page'||e.classList.contains('active')).map(label)),...[...document.querySelectorAll(selectSelector)].filter(visible).map(e=>e.selectedOptions[0]?.textContent.trim()).filter(Boolean)];
  const results=[],visited=new Set(),discovered=new Map(),skipped=[],errors=[],pending=new Map();let capped=false;
  const push=route=>{if(results.length>=maxStates){capped=true;return false;}results.push(scan(route));return true;};
  const navigation=()=>[
   ...groups().map(g=>({key:signature(g),kind:'buttons',targets:buttons(g).map(e=>({key:e.id||label(e),label:label(e)}))})),
   // Optics puts its lessons in a native dialog rather than a tab panel.
   ...[document.querySelector('#lesson-button')].filter(visible).map(e=>({key:'#lesson-button|'+(document.querySelector('[data-module][aria-selected="true"]')?.dataset.module||''),kind:'lesson-dialog',targets:[{key:e.id,label:label(e)}]})),
   ...[...document.querySelectorAll(selectSelector)].filter(visible).map(e=>({key:selectKey(e),kind:'select',targets:[...e.options].map(o=>({key:o.value,label:o.textContent.trim(),disabled:o.disabled}))}))
  ];
  async function walk(path=[],ancestors=new Set()){
   const lists=navigation();
   for(const list of lists){
    if(ancestors.has(list.key))continue;
    for(const target of list.targets){
     const key=list.kind+'|'+list.key+'|'+target.key,route=[...path,target.label];
     if(!discovered.has(key))discovered.set(key,{control:list.key,target:target.label});
     if(visited.has(key))continue;
     if(target.disabled){visited.add(key);skipped.push({route,reason:'disabled option'});continue;}
     if(results.length>=maxStates){capped=true;pending.set(key,route);continue;}
     let control;
     if(list.kind==='lesson-dialog')control=document.getElementById(target.key);
     else if(list.kind==='select')control=[...document.querySelectorAll(selectSelector)].find(e=>visible(e)&&selectKey(e)===list.key);
     else {const group=groups().find(g=>signature(g)===list.key);control=group&&buttons(group).find(e=>(e.id||label(e))===target.key);}
     if(!control){pending.set(key,route);continue;}
     try{
      visited.add(key);
      pending.delete(key);
      if(list.kind==='select'){
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(control,target.key);
       control.dispatchEvent(new Event('change',{bubbles:true}));
      }else control.click();
      await wait();
      if(!push(route))continue;
      if(list.kind==='lesson-dialog'){document.querySelector('#lesson-dialog[open]')?.close();await wait();continue;}
      await walk(route,new Set([...ancestors,list.key]));
     }catch(error){errors.push({route,error:String(error)});}
    }
   }
  }
  push(['initial']);await walk();
  // A parent navigation group can disappear while walking siblings. Discover it again
  // until no new controls appear; report every unvisited route if a caller sets a limit.
  let before=-1;
  while(!capped&&visited.size!==before){before=visited.size;await walk();}
  const canvasInventory=[...document.querySelectorAll('canvas')].map(e=>({id:e.id||nodeKey(e),visible:visible(e),observed:results.some(r=>r.canvases.some(c=>c.id===(e.id||nodeKey(e))))}));
  const failures=results.flatMap(r=>[
   ...r.canvases.filter(c=>c.invalid||c.sharp===false).map(c=>({route:r.route,id:c.id,type:'canvas',reason:c.invalid?'invalid dimensions':'undersampled'})),
   ...r.images.filter(i=>i.invalid||i.undersampled).map(i=>({route:r.route,id:i.id,type:i.type,reason:i.invalid?'invalid dimensions or unloaded':'undersampled'})),
   ...r.vectors.filter(v=>v.invalid).map(v=>({route:r.route,id:v.id,type:'svg',reason:'invalid dimensions'}))
  ]);
  lastResults=results;lastLanguage=document.documentElement.lang;
  return {url:location.href,language:document.documentElement.lang,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,policyAvailable:!!window.PraxisCanvasResolution,states:results.length,complete:!capped&&!errors.length&&!pending.size,capped,pending:[...pending.values()],navigation:[...discovered].map(([key,value])=>({...value,visited:visited.has(key)})),skipped,errors,failures,canvasInventory,results};
 }
 async function focusRepresentative(){
  if(!lastResults.length)return {focused:false,reason:'run the audit first',route:[],canvases:[]};
  if(window.PraxisI18n?.setLanguage)await window.PraxisI18n.setLanguage(lastLanguage);
  await new Promise(resolve=>setTimeout(resolve,25));
  const scientificVectors=r=>r.vectors.filter(v=>!v.decorative&&!v.resource);
  const canvasCount=r=>r.canvases.filter(c=>Math.max(...c.css)>32).length;
  const ranked=[...lastResults].sort((a,b)=>canvasCount(b)-canvasCount(a)||scientificVectors(b).length-scientificVectors(a).length||b.route.length-a.route.length);
  const chosen=ranked[0],route=chosen.route[0]==='initial'?lastInitialRoute:chosen.route,replayed=[],missing=[];
  for(const text of route){
   const button=groups().flatMap(buttons).find(e=>label(e)===text)||[document.querySelector('#lesson-button')].filter(visible).find(e=>label(e)===text);
   const select=[...document.querySelectorAll(selectSelector)].filter(visible).find(e=>[...e.options].some(o=>!o.disabled&&o.textContent.trim()===text));
   if(button)button.click();
   else if(select){const option=[...select.options].find(o=>!o.disabled&&o.textContent.trim()===text);Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,option.value);select.dispatchEvent(new Event('change',{bubbles:true}));}
   else {missing.push(text);continue;}
   replayed.push(text);await new Promise(resolve=>setTimeout(resolve,25));
  }
  await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,25)));
  const measured=scan(chosen.route),expected=chosen.canvases.map(c=>c.id),active=new Set(measured.canvases.map(c=>c.id));
  const missingCanvases=expected.filter(id=>!active.has(id));
  return {...measured,focused:!missing.length&&!missingCanvases.length,replayed,missing,missingCanvases,expectedCanvases:expected,vectorOnly:!canvasCount(chosen)};
 }
 window.PraxisResolutionAudit={run,scan,focusRepresentative};
})();
