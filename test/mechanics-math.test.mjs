import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('MCU math stays React-owned and receives complete inline formulas and language snapshots',async()=>{
 const listeners=new Set(),calls=[],window={PraxisI18n:{language:'ro',tr:s=>s}};
 window.PraxisMath={subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},language:()=>window.PraxisI18n.language,
  inline:v=>typeof v==='string'||Array.isArray(v)&&v.every(x=>typeof x==='string'),flatten:v=>Array.isArray(v)?v.join(''):v,
  formula:s=>s.includes('='),bare:()=>false,render:s=>{calls.push([s,window.PraxisI18n.language]);return '<math>'+s+'</math>';}};
 const Rc=(type,props)=>({type,...props}),I={useSyncExternalStore:(subscribe,snapshot)=>snapshot(),useMemo:fn=>fn()};
 const context=vm.createContext({window,Rc,I});vm.runInContext(await read('scripts/adaptations/mcu-jsx.js'),context);
 const first=vm.runInContext("mcuJsx('span',{children:['a_cp = ', 'v²/R']})",context);
 assert.equal(typeof first.children.type,'function');assert.equal(first.children.value,'a_cp = v²/R');
 let rendered=first.children.type({value:first.children.value});assert.equal(rendered['data-no-i18n'],true);
 assert.match(rendered.dangerouslySetInnerHTML.__html,/<math>/);
 window.PraxisI18n.language='en';rendered=first.children.type({value:first.children.value});
 assert.deepEqual(calls.map(c=>c[1]),['ro','en']);assert.equal(rendered.type,'span');
 assert.equal(rendered.className,'science-math');
 const svg=vm.runInContext("mcuJsx('text',{children:'a_cp'})",context);
 assert.equal(svg.children[1].type,'tspan');assert.equal(svg.children[1].children[1].baselineShift,'sub');
 for(const type of ['option','title','button']){
  context.host=type;const result=vm.runInContext("mcuJsx(host,{children:'a = v²/R'})",context);
  assert.equal(result.children,'a = v²/R');
 }
 const vector=vm.runInContext("mcuJsx('span',{children:'F_cp = -m ω² R⃗'})",context);
 assert.equal(Array.isArray(vector.children),true);
 assert.doesNotMatch(JSON.stringify(vector),/dangerouslySetInnerHTML/);
 context.fragment=Symbol.for('react.fragment');
 const fragment=vm.runInContext("mcuJsx(fragment,{children:[{type:'span',children:'a = v²/R'}]})",context);
 assert.equal(fragment.type,context.fragment);
 assert.equal(fragment.children[0].type,'span');assert.equal(fragment.children[0].children,'a = v²/R');
});
