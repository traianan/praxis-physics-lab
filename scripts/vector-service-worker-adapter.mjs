import {readFile} from 'node:fs/promises';
const fetchHandler=await readFile(new URL('./adaptations/vector-service-worker-fetch.js',import.meta.url),'utf8');
export function adaptVectorServiceWorker(worker){
 const start=worker.indexOf("self.addEventListener('fetch',");
 if(start<0||worker.indexOf("self.addEventListener('fetch',",start+1)!==-1)throw Error('Vector service worker fetch target changed');
 const before=worker.slice(0,start).replace(/\/\/ Mutable lesson code must bypass stale HTTP responses and unrelated app caches\.\s*$/,'');
 return before.replace(/const VERSION = '[^']+';/,"const VERSION = 'praxis-vectori-v2';")+fetchHandler;
}
