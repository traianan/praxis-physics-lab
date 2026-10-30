import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../public/shared/privacy.js',import.meta.url),'utf8');
const choiceKey='praxis-privacy-choice-v1';
function browser(initial={},unavailable=false){
 const values=new Map(Object.entries(initial)),events=new Map(),nodes=[];
 class Storage{getItem(key){return values.get(String(key))??null;}setItem(key,value){values.set(String(key),String(value));}removeItem(key){values.delete(String(key));}}
 const storage=new Storage();
 const element=()=>({classList:{add(){},remove(){}},dataset:{},setAttribute(){},append(node){nodes.push(node);},querySelector(){return null;},innerHTML:'',hidden:false});
 const body=element(),document={body,activeElement:body,documentElement:{lang:'ro'},currentScript:{src:'https://example.test/shared/privacy.js'},querySelector:()=>null,createElement:element,addEventListener:(type,fn)=>events.set(type,fn)};
 const window={addEventListener(){},dispatchEvent(){}};
 Object.defineProperty(window,'localStorage',{get(){if(unavailable)throw new Error('Storage disabled');return storage;}});
 vm.runInNewContext(source,{window,document,Storage,URL,location:{protocol:'https:'},CustomEvent:class{},Date,Map,Set});
 events.get('DOMContentLoaded')();
 const choose=value=>events.get('click')({target:{closest:selector=>selector==='[data-privacy-choice]'?{dataset:{privacyChoice:value}}:null}});
 return {window,storage,values,choose,nodes};
}
test('before consent, preferences and answers stay in memory rather than persistent storage',()=>{
 const b=browser();b.storage.setItem('praxis-language','en');b.storage.setItem('mr-teste','[17]');
 assert.equal(b.storage.getItem('praxis-language'),'en');assert.equal(b.values.has('praxis-language'),false);assert.equal(b.values.has('mr-teste'),false);assert.equal(b.nodes.at(-1).hidden,false);
});
test('acceptance persists preferences but never the imported lesson answer history',()=>{
 const b=browser();b.storage.setItem('praxis-language','en');b.choose('accepted');b.storage.setItem('mr-teste','[17]');
 assert.equal(b.values.get('praxis-language'),'en');assert.equal(b.values.has('mr-teste'),false);assert.equal(b.window.PraxisPrivacy.preferencesAllowed,true);assert.equal(b.nodes.at(-1).hidden,true);
 const next=browser(Object.fromEntries(b.values));assert.equal(next.storage.getItem('praxis-language'),'en');assert.equal(next.nodes.at(-1).hidden,true);
});
test('withdrawal deletes saved preferences and legacy results while keeping the refusal',()=>{
 const b=browser({[choiceKey]:JSON.stringify({version:1,value:'accepted',time:Date.now()}),'praxis-language':'en','mr-teste':'[17]'});
 b.choose('necessary');assert.equal(b.values.has('praxis-language'),false);assert.equal(b.values.has('mr-teste'),false);assert.equal(JSON.parse(b.values.get(choiceKey)).value,'necessary');
 b.storage.setItem('praxis-course-colors','vivid');assert.equal(b.values.has('praxis-course-colors'),false);
});
test('consent expires after 180 days and does not expose old preferences before a new choice',()=>{
 const b=browser({[choiceKey]:JSON.stringify({version:1,value:'accepted',time:Date.now()-181*86400000}),'praxis-language':'en'});
 assert.equal(b.window.PraxisPrivacy.preferencesAllowed,false);assert.equal(b.storage.getItem('praxis-language'),null);assert.equal(b.nodes.at(-1).hidden,false);
});
test('the consent interface remains usable when the browser refuses local storage',()=>{
 const b=browser({},true);assert.equal(b.nodes.at(-1).hidden,false);b.choose('necessary');assert.equal(b.nodes.at(-1).hidden,true);assert.equal(b.window.PraxisPrivacy.preferencesAllowed,false);
});
