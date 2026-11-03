/* Service worker — Calcul vectorial (lecție offline)
   Schimbă VERSION la fiecare publicare pentru a reîmprospăta cache-ul. */
const VERSION = 'praxis-vectori-v2';
const PRECACHE = [
  '../../shared/vector-tabs.js','../../shared/vector-tabs.css','../../shared/scientific-colors.js','../../shared/course-localization.js','../../shared/canvas-typography.js',
  '../../shared/i18n.js','../../shared/sound.js','../../shared/course.js','../../shared/course.css','../../shared/lab-header.js','../../design-system/lab-layout.css','../../design-system/tokens.css','../../design-system/components.css','../../design-system/laboratory.css','../../design-system/compact.css',
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/icon.svg',
  './vendor/fonts/Fraunces-italic-latin-ext-6cc8f6.woff2',
  './vendor/fonts/Fraunces-italic-latin-feced2.woff2',
  './vendor/fonts/Fraunces-normal-latin-39ce20.woff2',
  './vendor/fonts/Fraunces-normal-latin-ext-796716.woff2',
  './vendor/fonts/JetBrainsMono-normal-latin-480c06.woff2',
  './vendor/fonts/JetBrainsMono-normal-latin-ext-ba1653.woff2',
  './vendor/fonts/SourceSerif4-italic-latin-d27161.woff2',
  './vendor/fonts/SourceSerif4-italic-latin-ext-042db4.woff2',
  './vendor/fonts/SourceSerif4-normal-latin-3084ac.woff2',
  './vendor/fonts/SourceSerif4-normal-latin-ext-ea2a53.woff2',
  './vendor/fonts/fonts.css',
  './vendor/katex/contrib/auto-render.min.js',
  './vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Main-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Italic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Math-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Script-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  './vendor/katex/katex.min.css',
  './vendor/katex/katex.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('praxis-vectori-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

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
