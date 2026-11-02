import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../public/shared/sound.js',import.meta.url),'utf8');
function audioFixture(session=new Map(),saved={}){
 const calls={contexts:0,started:0,stopped:0};const listeners={};const storage=new Map(Object.entries(saved));
 class AudioContext{constructor(){calls.contexts++;this.state='running';this.currentTime=0;this.destination={};}resume(){return Promise.resolve();}createOscillator(){return {type:'sine',frequency:{value:0},connect(){},disconnect(){},start(){calls.started++;},stop(){calls.stopped++;}};}createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){},disconnect(){}};}}
 const document={hidden:false,head:{append(){}},createElement(){return {};},querySelectorAll(){return [];},addEventListener(name,fn){listeners[name]=fn;}};
 const window={AudioContext,addEventListener(name,fn){listeners[name]=fn;},dispatchEvent(){}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const sessionStorage={getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,String(v))};
 vm.runInNewContext(code,{window,document,localStorage,sessionStorage,CustomEvent:class{},setTimeout(){},queueMicrotask:fn=>fn()});
 return {audio:window.PraxisSound,calls,listeners,document,storage};
}
test('audio starts inactive and muted events never create an audio context',()=>{const f=audioFixture();assert.equal(f.audio.enabled,false);f.audio.play('switch');f.audio.startTone();assert.equal(f.calls.contexts,0);assert.equal(f.calls.started,0);});

test('sound choice follows laboratory navigation in the same tab without persistent preferences',()=>{
 const session=new Map();const first=audioFixture(session);first.audio.setEnabled(true);
 const next=audioFixture(session);assert.equal(next.audio.enabled,true);assert.equal(next.calls.contexts,0);
 next.audio.setEnabled(false);assert.equal(audioFixture(session).audio.enabled,false);
 assert.equal(audioFixture().audio.enabled,false);
});

test('saved preference wins over stale session state and cross-tab changes refresh the session',()=>{
 const session=new Map();const first=audioFixture(session);first.audio.setEnabled(true);
 const next=audioFixture(session,{'praxis-sound-enabled':'false'});assert.equal(next.audio.enabled,false);
 next.listeners.storage({key:'praxis-sound-enabled',newValue:'true'});
 assert.equal(audioFixture(session).audio.enabled,true);
});

test('restoring a saved choice seeds the current tab before optional persistence is withdrawn',()=>{
 const session=new Map();assert.equal(audioFixture(session,{'praxis-sound-enabled':'true'}).audio.enabled,true);
 assert.equal(audioFixture(session).audio.enabled,true);
});

test('Back navigation restores the current sound choice on a cached library page',()=>{
 const session=new Map(),library=audioFixture(session),lab=audioFixture(session);lab.audio.setEnabled(true);
 assert.equal(typeof library.listeners.pageshow,'function');library.listeners.pageshow({persisted:true});
 assert.equal(library.audio.enabled,true);assert.equal(library.calls.contexts,0);
 lab.audio.setEnabled(false);library.listeners.pageshow({persisted:true});assert.equal(library.audio.enabled,false);
});
test('global mute stops active event and continuous tones, then prevents new sound',()=>{const f=audioFixture();f.audio.setEnabled(true);f.audio.play('event');const stop=f.audio.startTone({frequency:440});assert.equal(f.calls.started,2);f.audio.setEnabled(false);assert.equal(f.calls.stopped,2);stop();assert.equal(f.calls.stopped,2);f.audio.play('switch');assert.equal(f.calls.started,2);assert.equal(f.storage.get('praxis-sound-enabled'),'false');});
test('backgrounding and cross-tab mute stop sounds as well',()=>{const f=audioFixture();f.audio.setEnabled(true);f.audio.startTone();f.document.hidden=true;f.listeners.visibilitychange();assert.equal(f.calls.stopped,1);f.audio.startTone();f.listeners.storage({key:'praxis-sound-enabled',newValue:'false'});assert.equal(f.audio.enabled,false);assert.equal(f.calls.stopped,2);});
