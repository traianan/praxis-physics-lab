import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/shared/canvas-resolution.js',import.meta.url),'utf8');

function setup(dpr=1){
 const events=new Map(),documentEvents=new Map(),intervals=new Map(),queries=[];let serial=0;
 const listen=(map,name,fn)=>{const handlers=map.get(name)||[];handlers.push(fn);map.set(name,handlers);};
 const document={hidden:false,addEventListener:(name,fn)=>listen(documentEvents,name,fn)};
 const window={devicePixelRatio:dpr,addEventListener:(name,fn)=>listen(events,name,fn),dispatchEvent:event=>{for(const fn of events.get(event.type)||[])fn(event);},
  setInterval:fn=>{intervals.set(++serial,fn);return serial;},clearInterval:id=>intervals.delete(id),
  matchMedia:media=>{const listeners=new Set(),query={media,listeners,addEventListener:(name,fn)=>listeners.add(fn),removeEventListener:(name,fn)=>listeners.delete(fn)};queries.push(query);return query;}};
 const context=vm.createContext({window,document,Event:class{constructor(type){this.type=type;}}});
 const run=()=>vm.runInContext(source,context),fire=name=>window.dispatchEvent({type:name}),visibility=hidden=>{document.hidden=hidden;for(const fn of documentEvents.get('visibilitychange')||[])fn();};
 run();return {window,document,intervals,queries,events,documentEvents,run,fire,visibility,poll:()=>{for(const fn of [...intervals.values()])fn();}};
}

test('canvas resolution uses minimum two and DPR supersampling when the display budget permits',()=>{
 const {window}=setup(),{ratio,forCanvas}=window.PraxisCanvasResolution;
 assert.equal(ratio(640,360),2);
 window.devicePixelRatio=2;assert.equal(ratio(640,360),3);
 window.devicePixelRatio=3;assert.equal(ratio(640,360),4.5);
 assert.equal(forCanvas({getBoundingClientRect:()=>({width:640,height:360})}),4.5);
 window.devicePixelRatio=.75;assert.equal(ratio(640,360),2);
});

test('canvas resolution respects the soft eight megapixel budget, native density and hard side limits',()=>{
 const {window}=setup(),{ratio}=window.PraxisCanvasResolution;
 const bounded=ratio(2000,1500);assert.ok(Math.abs(bounded-Math.sqrt(8000000/3000000))<1e-12);
 window.devicePixelRatio=2;assert.equal(ratio(3840,2160),2,'native density survives the soft pixel budget');
 window.devicePixelRatio=4;assert.equal(ratio(2400,1800),8192/2400,'hard side safety takes precedence over native density');
 assert.equal(ratio(20000,100),8192/20000);assert.equal(ratio(100,20000),8192/20000);
 window.devicePixelRatio=1.25;assert.equal(ratio(0,400),1.25);assert.equal(ratio(400,0),1.25);
 window.devicePixelRatio=undefined;assert.equal(ratio(0,0),1);assert.equal(ratio(640,360),2);
});

test('density watcher redraws only on actual DPR changes and repeated installation does not duplicate listeners',()=>{
 const fixture=setup(),{window,events,documentEvents,intervals,queries,run,poll}=fixture;
 let draws=0;const model={time:2.75,position:1.2,running:false};const before={...model};
 window.addEventListener('resize',()=>draws++);const policy=window.PraxisCanvasResolution;
 const listenerCounts=()=>[...events.values(),...documentEvents.values()].reduce((sum,handlers)=>sum+handlers.length,0);
 const count=listenerCounts();run();assert.equal(window.PraxisCanvasResolution,policy);assert.equal(intervals.size,1);assert.equal(queries.length,1);assert.equal(listenerCounts(),count);
 poll();assert.equal(draws,0);window.devicePixelRatio=2;poll();assert.equal(draws,1);poll();assert.equal(draws,1);
 assert.equal(queries[0].listeners.size,0);assert.equal(queries.at(-1).listeners.size,1);
 window.devicePixelRatio=1.5;[...queries.at(-1).listeners][0]();assert.equal(draws,2);poll();assert.equal(draws,2);
 assert.deepEqual(model,before,'redrawing changes neither simulation clock nor physical state');
});

test('density watcher suspends while hidden and resumes once after visibility and BFCache restoration',()=>{
 const {window,document,intervals,queries,visibility,fire,poll}=setup();let draws=0;
 window.addEventListener('resize',()=>draws++);fire('pageshow');fire('pageshow');assert.equal(intervals.size,1);
 visibility(true);assert.equal(intervals.size,0);window.devicePixelRatio=2;
 [...queries.at(-1).listeners][0]();assert.equal(draws,0);fire('pageshow');assert.equal(intervals.size,0);
 visibility(false);assert.equal(draws,1);assert.equal(intervals.size,1);visibility(false);assert.equal(intervals.size,1);assert.equal(draws,1);
 fire('pagehide');assert.equal(intervals.size,0);window.devicePixelRatio=1.25;fire('pageshow');fire('pageshow');assert.equal(draws,2);assert.equal(intervals.size,1);poll();assert.equal(draws,2);assert.equal(document.hidden,false);
});
