/* Runs before application scripts: optional persistence requires explicit consent. */
(() => {
 if(window.PraxisPrivacy)return;
 const key='praxis-privacy-choice-v1',duration=180*24*60*60*1000,memory=new Map();
 const preferenceKeys=new Set(['praxis-language','praxis-sound-enabled','praxis-sound','praxis-course-colors','praxis-course-text-size','praxis-course-touch','praxis-library-board','praxis-library-board-scale','praxis-optica-board-scale','praxis-waves-volume','mr-theme','mr-sound','stare15.sound','termo14.sound','unde-mecanice-dark']);
 const root=new URL('../',document.currentScript.src),url=path=>new URL(path,root).href;
 let storage=null,choice=null,previousFocus=null;
 const native={get:Storage.prototype.getItem,set:Storage.prototype.setItem,remove:Storage.prototype.removeItem};
 try{storage=window.localStorage;const saved=JSON.parse(native.get.call(storage,key)||'null');if(saved?.version===1&&['accepted','necessary'].includes(saved.value)&&Date.now()-saved.time>=0&&Date.now()-saved.time<duration)choice=saved.value;}catch{}
 const offline=location.protocol==='file:';
 if(storage){
  Storage.prototype.getItem=function(name){name=String(name);if(this!==storage)return native.get.call(this,name);if(name===key)return native.get.call(this,name);if(memory.has(name))return memory.get(name);return choice==='accepted'&&preferenceKeys.has(name)?native.get.call(this,name):null;};
  Storage.prototype.setItem=function(name,value){name=String(name);value=String(value);if(this!==storage)return native.set.call(this,name,value);if(name===key)return;memory.set(name,value);if(choice==='accepted'&&preferenceKeys.has(name))try{native.set.call(this,name,value);}catch{}};
  Storage.prototype.removeItem=function(name){name=String(name);if(this!==storage)return native.remove.call(this,name);memory.delete(name);if(name!==key)try{native.remove.call(this,name);}catch{}};
 }
 const copy={ro:{about:'Despre',contact:'Contact',terms:'Termeni și condiții',privacy:'Confidențialitate și cookies',settings:'Setări cookies',heading:'Cookies și preferințe',text:'Putem memora pe acest dispozitiv limba, sunetul și preferințele de afișare? Aplicația funcționează și dacă refuzi. Nu folosim cookies de publicitate sau analiză. Alegerea ta este memorată timp de 180 de zile.',accept:'Accept preferințele',reject:'Doar necesare',more:'Detalii despre confidențialitate'},en:{about:'About',contact:'Contact',terms:'Terms and conditions',privacy:'Privacy and cookies',settings:'Cookie settings',heading:'Cookies and preferences',text:'May we remember your language, sound and display preferences on this device? The app also works if you decline. We do not use advertising or analytics cookies. Your choice is remembered for 180 days.',accept:'Accept preferences',reject:'Necessary only',more:'Privacy details'}};
 const language=()=>window.PraxisI18n?.language||document.documentElement.lang||'ro';
 let banner,footer;
 function render(){
  const text=copy[language()==='en'?'en':'ro'];
  if(footer)footer.innerHTML=`<a href="${url('despre/')}">${text.about}</a><a href="${url('contact/')}">${text.contact}</a><a href="${url('termeni/')}">${text.terms}</a><a href="${url('confidentialitate/')}">${text.privacy}</a><button type="button" data-cookie-settings>${text.settings}</button>`;
  if(banner)banner.innerHTML=`<h2 id="privacy-heading">${text.heading}</h2><p>${text.text}</p><div class="privacy-actions"><button type="button" data-privacy-choice="necessary">${text.reject}</button><button type="button" data-privacy-choice="accepted">${text.accept}</button><a href="${url('confidentialitate/')}">${text.more}</a></div>`;
 }
 function show(){if(!banner)return;previousFocus=document.activeElement;banner.hidden=false;document.body.classList.add('privacy-pending');render();banner.querySelector('button')?.focus();}
 function save(value){
  choice=value;
  if(storage)try{
   native.set.call(storage,key,JSON.stringify({version:1,value,time:Date.now()}));
   for(const name of preferenceKeys){if(value==='necessary')native.remove.call(storage,name);else if(memory.has(name))native.set.call(storage,name,memory.get(name));}
   // Imported lesson histories are no longer persisted, including legacy values.
   for(const name of ['mr-probleme','mr-test-lim','mr-teste'])native.remove.call(storage,name);
  }catch{}
  banner.hidden=true;document.body.classList.remove('privacy-pending');
  if(previousFocus?.isConnected&&previousFocus!==document.body)previousFocus.focus();
  window.dispatchEvent(new CustomEvent('praxis-privacy-change',{detail:{preferences:value==='accepted'}}));
 }
 window.PraxisPrivacy={open:show,get preferencesAllowed(){return choice==='accepted';}};
 document.addEventListener('click',event=>{if(event.target.closest('[data-cookie-settings]')){event.preventDefault();show();}const button=event.target.closest('[data-privacy-choice]');if(button)save(button.dataset.privacyChoice);});
 window.addEventListener('praxis-language-change',render);
 window.addEventListener('storage',event=>{if(event.key===key)location.reload();});
 document.addEventListener('DOMContentLoaded',()=>{
  footer=document.createElement('nav');footer.className='site-info-links';footer.dataset.noI18n='';footer.setAttribute('aria-label','Praxis Science Lab');
  (document.querySelector('.page-footer')||document.body).append(footer);
  if(!offline){banner=document.createElement('section');banner.className='privacy-banner';banner.dataset.noI18n='';banner.setAttribute('role','region');banner.setAttribute('aria-labelledby','privacy-heading');banner.hidden=choice!==null;document.body.append(banner);if(!choice)document.body.classList.add('privacy-pending');}
  render();
 });
})();
