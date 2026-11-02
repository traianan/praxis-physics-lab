/* Shared audio policy for every Praxis laboratory. No audio starts before a gesture. */
(() => {
 if (window.PraxisSound) return;
 const key='praxis-sound-enabled',sessionKey='praxis-session-sound';let enabled=false,context=null;const active=new Set();
 // Optional long-term preferences may be blocked by the privacy bridge. The
 // active classroom session still keeps its sound choice across page changes.
 try{const saved=localStorage.getItem(key);enabled=saved===null?sessionStorage.getItem(sessionKey)==='true':saved==='true';}catch{try{enabled=sessionStorage.getItem(sessionKey)==='true';}catch{}}
 try{sessionStorage.setItem(sessionKey,String(enabled));}catch{}
 function getContext(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;if(!context)context=new Audio();if(context.state==='suspended')context.resume().catch(()=>{});return context;}
 function stopAll(){for(const stop of [...active])stop();}
 function notify(){const tr=value=>window.PraxisI18n?.tr(value)||value;for(const b of document.querySelectorAll('[data-praxis-sound]')){b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',tr(`Sunet ${enabled?'activ':'inactiv'}. Apasă pentru ${enabled?'dezactivare':'activare'}.`));b.title=tr(`Sunet ${enabled?'activ':'inactiv'}`);b.querySelector('.sound-toggle-label').textContent=tr(`Sunet ${enabled?'activ':'inactiv'}`);b.querySelector('.sound-muted').style.display=enabled?'none':'';}window.dispatchEvent(new CustomEvent('praxis-sound-change',{detail:{enabled}}));}
 function setEnabled(value,{persist=true}={}){enabled=!!value;if(!enabled)stopAll();try{sessionStorage.setItem(sessionKey,String(enabled));}catch{}if(persist)try{localStorage.setItem(key,String(enabled));}catch{}notify();return enabled;}
 function startTone({frequency=440,type='sine',gain=.05}={}){
  if(!enabled)return()=>{};const ctx=getContext();if(!ctx)return()=>{};
  const oscillator=ctx.createOscillator(),volume=ctx.createGain();oscillator.type=['sine','triangle','square','sawtooth'].includes(type)?type:'sine';oscillator.frequency.value=Math.min(20000,Math.max(20,Number(frequency)||440));volume.gain.value=Math.min(.12,Math.max(0,Number(gain)||0));oscillator.connect(volume);volume.connect(ctx.destination);oscillator.start();let stopped=false;
  const stop=()=>{if(stopped)return;stopped=true;volume.gain.setTargetAtTime(0,ctx.currentTime,.006);oscillator.stop(ctx.currentTime+.04);active.delete(stop);oscillator.onended=()=>{oscillator.disconnect();volume.disconnect();};};active.add(stop);return stop;
 }
 const patterns={click:[540,.035,.018],select:[700,.055,.025],switch:[260,.04,.03],event:[880,.12,.04],move:[420,.04,.018],reset:[330,.09,.025]};
 function play(name='click'){if(!enabled)return;const ctx=getContext();if(!ctx)return;const [f,d,g]=patterns[name]||patterns.click;const stop=startTone({frequency:f,gain:g,type:name==='switch'?'triangle':'sine'});setTimeout(stop,d*1000);}
 function createToggle({compact=false}={}){const b=document.createElement('button');b.type='button';b.className='praxis-sound-toggle'+(compact?' compact':'');b.dataset.praxisSound='';b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3zM16 8q5 4 0 8"/><path class="sound-muted" d="M4 3l16 18"/></svg><span class="sound-toggle-label"></span>';b.addEventListener('click',()=>{setEnabled(!enabled);if(enabled){getContext();play('select');}});queueMicrotask(notify);return b;}
 const css=document.createElement('style');css.textContent='.praxis-sound-toggle{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:44px;min-height:44px;padding:7px 10px;background:white;border:1px solid #b9ccc1;border-radius:7px;color:#617a6c;font:600 14px Segoe UI,Arial,sans-serif;cursor:pointer;touch-action:manipulation;flex-shrink:0}.praxis-sound-toggle svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.praxis-sound-toggle[aria-pressed=true]{background:#e1f0e6;color:#176442;border-color:#78aa8a}.praxis-sound-toggle.compact{width:44px;padding:6px}.praxis-sound-toggle.compact .sound-toggle-label{display:none}@media(max-width:1100px){.praxis-sound-toggle .sound-toggle-label{display:none}.praxis-sound-toggle{width:44px;padding:6px}}';document.head.append(css);
 window.PraxisSound={get enabled(){return enabled;},setEnabled,play,startTone,stopAll,createToggle};
 window.addEventListener('storage',e=>{if(e.key===key)setEnabled(e.newValue==='true',{persist:false});});
 window.addEventListener('pageshow',e=>{if(!e.persisted)return;try{const current=sessionStorage.getItem(sessionKey);if(current!==null)setEnabled(current==='true',{persist:false});}catch{}});
 window.addEventListener('praxis-language-change',notify);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});window.addEventListener('pagehide',stopAll);
 document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b||b.closest('[data-praxis-sound]')||b.disabled||b.dataset.sound==='none')return;play(b.dataset.sound||(/reset|reseteaz/i.test(b.id+' '+b.textContent)?'reset':'click'));});
 document.addEventListener('change',e=>{if(e.target.matches('select,input[type=checkbox]'))play(e.target.type==='checkbox'?'switch':'select');});
 let dragged=false;document.addEventListener('pointerdown',e=>{dragged=!!e.target.closest('[data-drag]');},true);document.addEventListener('pointerup',()=>{if(dragged)play('move');dragged=false;},true);document.addEventListener('pointercancel',()=>{dragged=false;},true);
})();
