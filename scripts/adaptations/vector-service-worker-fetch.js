// Mutable lesson code must bypass stale HTTP responses and unrelated app caches.
self.addEventListener('fetch', event => {
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin)return;
 const immutable=['./vendor/','./icons/'].some(path=>url.pathname.startsWith(new URL(path,location.href).pathname))||/\.(?:woff2?|ttf|otf)$/.test(url.pathname);
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  if(immutable){const hit=await cache.match(request);if(hit)return hit;}
  let response;
  try{response=await fetch(request,immutable?undefined:{cache:'no-cache'});}
  catch(error){
   const hit=await cache.match(request);if(hit)return hit;
   if(request.mode==='navigate'){
    const page=await cache.match(new URL('./index.html',location.href).href);
    if(page)return page;
   }
   throw error;
  }
  if(response.ok){try{await cache.put(request,response.clone());}catch{/* A cache quota failure must not discard a fresh online response. */}}
  return response;
 })());
});
