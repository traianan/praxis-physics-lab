import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {scientificMathRuntime} from '../scripts/scientific-math-runtime.mjs';
const source=await readFile(new URL('../public/shared/math-engine-loader.js',import.meta.url),'utf8');
function browser(existing){
 const scripts=[],events=[];
 const window={katex:existing,dispatchEvent:event=>events.push(event.type)};
 const document={currentScript:{src:'https://example.test/physics/shared/lab-header.js'},createElement:()=>({remove(){}}),head:{appendChild:script=>scripts.push(script)}};
 vm.runInNewContext(source,{window,document,URL,Promise,CustomEvent:class{constructor(type){this.type=type;}}});
 return {window,scripts,events};
}
test('math engine loads only on demand and deduplicates simultaneous requests',async()=>{
 const b=browser();assert.equal(b.scripts.length,0);
 assert.equal(b.window.PraxisEnsureMathEngine(),null);
 const ready=b.window.PraxisLoadMathEngine();assert.equal(ready,b.window.PraxisLoadMathEngine());
 assert.equal(b.scripts.length,1);assert.equal(b.scripts[0].src,'https://example.test/physics/simulari/calorimetrie/vendor/katex/katex.min.js');
 const engine={renderToString(){}};b.window.katex=engine;b.scripts[0].onload();
 assert.equal(await ready,engine);assert.equal(b.window.PraxisEnsureMathEngine(),engine);assert.deepEqual(b.events,['praxis-math-ready']);
});
test('a preexisting engine is reused without loading a second copy',async()=>{
 const engine={renderToString(){}},b=browser(engine);
 assert.equal(b.window.PraxisEnsureMathEngine(),engine);assert.equal(await b.window.PraxisLoadMathEngine(),engine);assert.equal(b.scripts.length,0);
});
test('failure is handled without an automatic retry loop and can be retried explicitly',async()=>{
 const b=browser(),first=b.window.PraxisLoadMathEngine();b.scripts[0].onerror();assert.equal(await first,null);
 assert.equal(b.window.PraxisEnsureMathEngine(),null);assert.equal(b.scripts.length,1);
 const next=b.window.PraxisLoadMathEngine({retry:true});assert.equal(b.scripts.length,2);
 b.window.katex={renderToString(){}};b.scripts[1].onload();assert.equal(await next,b.window.katex);
 assert.deepEqual(b.events,['praxis-math-error','praxis-math-ready']);
});

test('native hosts render the latest value and language when a delayed engine arrives',async()=>{
 const listeners=new Map(),scripts=[];
 const window={PraxisI18n:{language:'ro',tr:s=>s},addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);}};
 const reactHost={closest:()=>true,set innerHTML(value){assert.fail('React owns this node');}};
 const document={currentScript:{src:'https://example.test/physics/shared/lab-header.js'},readyState:'loading',addEventListener(){},createElement:()=>({}),head:{appendChild:script=>scripts.push(script)},querySelectorAll:()=>[reactHost]};
 vm.runInNewContext(await scientificMathRuntime({embedFonts:false}),{window,document,URL,Set,WeakMap,CustomEvent:class{constructor(type){this.type=type;}}});
 const host={innerHTML:'',dataset:{},isConnected:true,hasAttribute:()=>false,setAttribute(){},classList:{add(){}}};
 window.PraxisMath.set(host,'Q_1',{syntax:'tex'});assert.match(host.innerHTML,/data-praxis-math-pending/);
 window.PraxisMath.set(host,'Q_2',{syntax:'tex'});
 window.PraxisI18n.language='en';window.PraxisI18n.tr=s=>s==='Q_2'?'Q_final':s;
 window.katex={renderToString:source=>'<math>'+source+'</math>'};scripts[0].onload();
 assert.equal(host.innerHTML,'<math>Q_final</math>');assert.equal(host.dataset.scienceSource,'Q_2');
 assert.equal(scripts.length,1);
});
