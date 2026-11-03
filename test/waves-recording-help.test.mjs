import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('guitar optional explanation reveals recording errors from its activity and tracks native toggling',()=>{
 const listeners=new Map(),writes=[],owner={};let cleanup;
 const context=vm.createContext({LessonActivityContext:{},N:{useContext:()=>({owner}),useState:()=>[false,value=>writes.push(value)],useEffect:fn=>{cleanup=fn();}},window:{addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)},Cv:(tag,props)=>({tag,props})});
 vm.runInContext(readFileSync(new URL('../scripts/waves-math-components.js',import.meta.url),'utf8'),context);
 const tree=vm.runInContext('LessonGuitarHelp({children:"recording information"})',context);
 assert.equal(tree.tag,'details');assert.equal(tree.props.open,false);
 listeners.get('lesson:recording-error')({detail:{owner:{}}});assert.deepEqual(writes,[]);
 listeners.get('lesson:recording-error')({detail:{owner}});assert.deepEqual(writes,[true]);
 tree.props.onToggle({currentTarget:{open:false}});assert.deepEqual(writes,[true,false]);
 listeners.get('lesson:recording-error')({detail:{owner}});assert.deepEqual(writes,[true,false,true]);
 cleanup();assert.equal(listeners.size,0);
});
