import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {adaptVectorServiceWorker} from '../scripts/vector-service-worker-adapter.mjs';
const scope='https://physics.example/app/simulari/calcul-vectorial/';
async function worker(){
 const source=adaptVectorServiceWorker(await readFile(new URL('../public/simulari/calcul-vectorial/sw.js',import.meta.url),'utf8'));
 const stores=new Map(),listeners={},calls=[];let online=true,body='new-header',status=200;
 const key=request=>new URL(typeof request==='string'?request:request.url,scope).href;
 const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {async match(request){return store.get(key(request))?.clone();},async put(request,response){store.set(key(request),response.clone());},async addAll(){}};},
  async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);},
  // The test deliberately rejects CacheStorage-wide lookups: unrelated apps own these caches.
  match(){throw Error('Cross-application cache lookup');}
 };
 const self={addEventListener:(name,fn)=>listeners[name]=fn,skipWaiting(){},clients:{async claim(){}}},location={href:scope+'sw.js',origin:new URL(scope).origin};
 const context=vm.createContext({self,location,caches,URL,fetch:async(request,options)=>{calls.push({url:key(request),options});if(!online)throw new TypeError('offline');return new Response(body,{status});}});vm.runInContext(source,context);
 const version=vm.runInContext('VERSION',context);
 async function seed(name,url,text){await (await caches.open(name)).put(url,new Response(text));}
 async function request(url,mode='cors'){let response;listeners.fetch({request:{url:key(url),method:'GET',mode},respondWith(value){response=value;}});return response;}
 async function activate(){let work;listeners.activate({waitUntil(value){work=value;}});await work;}
 return {caches,stores,calls,version,seed,request,activate,setOnline:value=>online=value,setBody:value=>body=value,setStatus:value=>status=value};
}
test('vector worker refreshes mutable shared code online and uses only its own fresh copy offline',async()=>{
 const w=await worker(),url='../../shared/lab-header.js';
 await w.seed('unrelated-app-v1',url,'unrelated-old-header');await w.seed(w.version,url,'own-old-header');
 assert.equal(await (await w.request(url)).text(),'new-header');assert.equal(w.calls[0].options.cache,'no-cache');
 w.setOnline(false);assert.equal(await (await w.request(url)).text(),'new-header');
 assert.equal(await (await (await w.caches.open('unrelated-app-v1')).match(url)).text(),'unrelated-old-header');
});
test('vector worker preserves exact asset queries and scopes immutable cache-first entries',async()=>{
 const w=await worker(),base='../../shared/lab-header.js';
 await w.seed(w.version,base+'?v=old','old-query');w.setBody('new-query');
 assert.equal(await (await w.request(base+'?v=new')).text(),'new-query');w.setOnline(false);
 assert.equal(await (await w.request(base+'?v=old')).text(),'old-query');assert.equal(await (await w.request(base+'?v=new')).text(),'new-query');
 await assert.rejects(w.request(base+'?v=missing'),/offline/);
 const font='./vendor/fonts/font.woff2';await w.seed('another-app',font,'wrong-font');await w.seed(w.version,font,'own-font');const calls=w.calls.length;
 assert.equal(await (await w.request(font)).text(),'own-font');assert.equal(w.calls.length,calls,'immutable own-cache hit does not fetch');
});
test('vector navigation falls back to its canonical offline page and activation preserves other apps',async()=>{
 const w=await worker();await w.seed('unrelated-app-v1','./index.html','wrong-page');await w.seed(w.version,'./index.html','canonical-page');
 w.setBody('online-query-page');assert.equal(await (await w.request('./index.html?mode=board','navigate')).text(),'online-query-page');
 w.setOnline(false);assert.equal(await (await w.request('./index.html?mode=board','navigate')).text(),'online-query-page');assert.equal(await (await w.request('./?new=1','navigate')).text(),'canonical-page');
 await w.seed('praxis-vectori-v1','./index.html','old-page');await w.activate();assert.equal(w.stores.has('praxis-vectori-v1'),false);assert.equal(w.stores.has('unrelated-app-v1'),true);assert.equal(w.stores.has(w.version),true);
});
test('the real lesson registration revalidates its worker and tolerates offline update failure without reloading',async()=>{
 let html=await readFile(new URL('../public/simulari/calcul-vectorial/index.html',import.meta.url),'utf8');
 const patches=JSON.parse(await readFile(new URL('../scripts/vector-physics-patches.json',import.meta.url),'utf8'));
 const patch=patches.find(p=>p.id==='service-worker-fresh-registration');if(html.includes(patch.before))html=html.replace(patch.before,patch.after);
 const start=html.indexOf('navigator.serviceWorker.register('),end=html.indexOf('}).catch(()=>{});',start)+'}).catch(()=>{});'.length;
 const calls=[];let updates=0;const registration={async update(){updates++;throw TypeError('offline');}};
 const navigator={serviceWorker:{async register(url,options){calls.push({url,options});return registration;},ready:Promise.resolve(registration)}};
 await vm.runInNewContext(html.slice(start,end),{navigator,localStorage:{getItem:()=> '1'}});
 await Promise.resolve();assert.equal(calls[0].url,'./sw.js');assert.equal(calls[0].options.updateViaCache,'none');assert.equal(updates,1);
});
