import {readPraxisZip} from './zip.js';

const $=id=>document.getElementById(id);
const archive=$('archive');
const status=$('status');
const cachePrefix='praxis-offline-lesson:';
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',
 css:'text/css; charset=utf-8',json:'application/json',webmanifest:'application/manifest+json',svg:'image/svg+xml',
 png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',ico:'image/x-icon',
 woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',mp3:'audio/mpeg',wav:'audio/wav',txt:'text/plain; charset=utf-8'};
const localUrl=(id,hash,file='index.html')=>new URL('imported/'+id+'/'+hash+'/'+file,location.href).href;
function message(text,error=false){
 status.textContent=text;
 status.toggleAttribute('data-error',error);
}
function link(title,href){
 const a=document.createElement('a');
 a.textContent=title;
 a.href=href;
 return a;
}
async function start(){
 if(!navigator.serviceWorker||!globalThis.DecompressionStream||!globalThis.crypto?.subtle)throw Error('Deschide această pagină în Chrome pe Android.');
 const registration=await navigator.serviceWorker.register('./sw.js');
 await navigator.serviceWorker.ready;
 if(!registration.active)throw Error('Pagina offline nu s-a putut pregăti.');
 const response=await fetch('./archives.json');
 if(!response.ok)throw Error('Catalogul arhivelor nu este disponibil.');
 const {archives,previous}=await response.json();
 const lessons=new Map(archives.map(lesson=>[lesson.id,lesson]));
 const known=new Map(Object.entries(previous));
 for(const lesson of archives){
  known.set(lesson.sha256,lesson.id);
  const li=document.createElement('li');
  const download=link(lesson.title,'../'+lesson.path);
  download.download='';
  li.append(download);
  $('available').append(li);
 }
 $('downloads').hidden=false;
 async function showSaved(){
  const entries=new Map();
  for(const name of await caches.keys()){
   if(!name.startsWith(cachePrefix))continue;
   const [id,hash]=name.slice(cachePrefix.length).split(':');
   if(!lessons.has(id))continue;
   const href=localUrl(id,hash);
   if(await caches.match(href,{cacheName:name}))entries.set(id,href);
  }
  $('saved').replaceChildren();
  $('empty').hidden=entries.size>0;
  for(const [id,href] of entries){
   const lesson=lessons.get(id);
   const li=document.createElement('li'),remove=document.createElement('button');
   remove.textContent='Șterge';
   remove.setAttribute('aria-label','Șterge '+lesson.title);
   remove.addEventListener('click',async()=>{
    try{
     for(const key of await caches.keys())if(key.startsWith(cachePrefix+id+':'))await caches.delete(key);
     await showSaved();
     message('Lecția a fost ștearsă din Chrome.');
    }catch{message('Lecția nu a putut fi ștearsă.',true);}
   });
   li.append(link(lesson.title,href),remove);
   $('saved').append(li);
  }
 }
 archive.addEventListener('change',async()=>{
  const file=archive.files[0];
  if(!file)return;
  archive.disabled=true;
  message('Se verifică arhiva…');
  try{
   if(file.size>20*1024*1024)throw Error('Arhiva depășește 20 MB.');
   const buffer=await file.arrayBuffer();
   const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer));
   const hash=Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('');
   const id=known.get(hash);
   // Imported HTML runs as this site. Accept only exact, published Praxis archives.
   if(!id)throw Error('Arhivă Praxis necunoscută. Descarcă ZIP-ul din catalog și alege-l din nou.');
   const cache=await caches.open(cachePrefix+id+':'+hash);
   const index=localUrl(id,hash);
   if(!await cache.match(index)){
    let html;
    for await(const {file,decoded} of readPraxisZip(buffer)){
     const type=types[file.split('.').at(-1).toLowerCase()]||'application/octet-stream';
     const item=new Response(decoded,{headers:{'Content-Type':type}});
     if(file==='index.html')html=item;
     else await cache.put(localUrl(id,hash,file),item);
    }
    await cache.put(index,html);
   }
   await showSaved();
   message(lessons.get(id).title+' este gata. Deschide lecția din lista „Lecții salvate”.');
  }catch(error){message(error.name==='QuotaExceededError'?'Nu este suficient spațiu în Chrome pentru această lecție.':error.message,true);}
  finally{archive.value='';archive.disabled=false;}
 });
 await showSaved();
 message('Pagina este gata pentru utilizare fără internet.');
 archive.disabled=false;
}
start().catch(error=>message(error.message,true));
