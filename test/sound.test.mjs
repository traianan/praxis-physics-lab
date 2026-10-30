import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../public/shared/sound.js',import.meta.url),'utf8');
function audioFixture(){
 const calls={contexts:0,started:0,stopped:0};const listeners={};const storage=new Map();
 class AudioContext{constructor(){calls.contexts++;this.state='running';this.currentTime=0;this.destination={};}resume(){return Promise.resolve();}createOscillator(){return {type:'sine',frequency:{value:0},connect(){},disconnect(){},start(){calls.started++;},stop(){calls.stopped++;}};}createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){},disconnect(){}};}}
 const document={hidden:false,head:{append(){}},createElement(){return {};},querySelectorAll(){return [];},addEventListener(name,fn){listeners[name]=fn;}};
 const window={AudioContext,addEventListener(name,fn){listeners[name]=fn;},dispatchEvent(){}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 vm.runInNewContext(code,{window,document,localStorage,CustomEvent:class{},setTimeout(){},queueMicrotask:fn=>fn()});
 return {audio:window.PraxisSound,calls,listeners,document,storage};
}
test('audio starts inactive and muted events never create an audio context',()=>{const f=audioFixture();assert.equal(f.audio.enabled,false);f.audio.play('switch');f.audio.startTone();assert.equal(f.calls.contexts,0);assert.equal(f.calls.started,0);});
test('global mute stops active event and continuous tones, then prevents new sound',()=>{const f=audioFixture();f.audio.setEnabled(true);f.audio.play('event');const stop=f.audio.startTone({frequency:440});assert.equal(f.calls.started,2);f.audio.setEnabled(false);assert.equal(f.calls.stopped,2);stop();assert.equal(f.calls.stopped,2);f.audio.play('switch');assert.equal(f.calls.started,2);assert.equal(f.storage.get('praxis-sound-enabled'),'false');});
test('backgrounding and cross-tab mute stop sounds as well',()=>{const f=audioFixture();f.audio.setEnabled(true);f.audio.startTone();f.document.hidden=true;f.listeners.visibilitychange();assert.equal(f.calls.stopped,1);f.audio.startTone();f.listeners.storage({key:'praxis-sound-enabled',newValue:'false'});assert.equal(f.audio.enabled,false);assert.equal(f.calls.stopped,2);});
