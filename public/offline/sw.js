const prefix = 'praxis-offline-shell:';
const shell = prefix+VERSION;
const base = new URL(self.registration.scope);
const assets = ['index.html','offline.css','app.js','zip.js','archives.json','../design-system/tokens.css','../assets/favicon.svg'];
const urls = assets.map(file=>new URL(file,base).href);
const index = urls[0];

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(shell);
  await cache.addAll(urls.map(url=>new Request(url,{cache:'reload'})));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==shell)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==base.origin)return;
 const lesson=url.pathname.slice(base.pathname.length).match(/^imported\/([a-z0-9-]+)\/([a-f0-9]{64})\/(.+)$/);
 if(url.pathname.startsWith(base.pathname)&&lesson){
  event.respondWith((async()=>{
   const cache='praxis-offline-lesson:'+lesson[1]+':'+lesson[2];
   if(lesson[3]==='sw.js')return new Response(null,{status:404});
   return await caches.match(event.request,{cacheName:cache,ignoreSearch:true}) ||
    (event.request.mode==='navigate'?Response.redirect(index):new Response(null,{status:404}));
  })());
  return;
 }
 const key=url.pathname===base.pathname?index:url.origin+url.pathname;
 if(urls.includes(key))event.respondWith((async()=>await caches.match(key,{cacheName:shell})||fetch(event.request))());
});
