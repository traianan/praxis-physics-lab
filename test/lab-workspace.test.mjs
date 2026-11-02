import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('one explicit workspace configuration covers every catalog laboratory',async()=>{
 const registry=JSON.parse(await read('public/design-system/lab-workspaces.json'));
 assert.deepEqual(Object.keys(registry).sort(),simulations.map(s=>s.id).sort());
 for(const [id,config]of Object.entries(registry)){
  assert.ok(config.workspaces.length,id+' has experimental workspaces');
  for(const group of config.activities||[])assert.ok(group.scope&&group.items&&group.default>=0,id+' has explicit activity selection');
 }
});

test('workspace mounting is inert outside known laboratory pages',async()=>{
 const document={body:{dataset:{}},readyState:'loading',addEventListener(){}};
 const window={};
 vm.runInNewContext(await read('public/shared/lab-workspace.js'),{window,document});
 assert.equal(typeof window.PraxisLabWorkspace.mount,'function');
 assert.doesNotThrow(()=>window.PraxisLabWorkspace.mount());
 document.body.dataset.praxisLaboratory='true';document.body.dataset.praxisCourse='unknown';
 assert.doesNotThrow(()=>window.PraxisLabWorkspace.mount());
 assert.deepEqual(document.body.dataset,{praxisLaboratory:'true',praxisCourse:'unknown'});
});

test('laboratory runtime is bundled for offline imports but absent from library runtime',async()=>{
 const header=await read('public/shared/lab-header.js');
 assert.ok(header.includes('window.PraxisLabWorkspaceConfig='));
 assert.ok(header.includes('window.PraxisLabWorkspace='));
 assert.ok(!(await read('public/shared/content-types.bundle.js')).includes('PraxisLabWorkspace'));
 const generated=await read('public/design-system/laboratory.css');
 assert.equal(generated.split('/* praxis:workspace */').length,2);
 assert.ok(generated.includes('body[data-praxis-workspace]'));
});

test('hidden oscillator activities preserve time and never render or emit frame sounds',async()=>{
 const source=await read('public/simulari/oscilator-mecanic/js/app.js');
 const tick=source.match(/function tick\(ts\)\{[\s\S]*?requestAnimationFrame\(tick\);\s*\}/)?.[0];
 assert.ok(tick,'exercise the actual imported animation scheduler');
 const state={t:3,last:1000,running:true,sliders:{}};
 const shell={closest:()=>({hidden:false}),querySelector:()=>({}),getClientRects:()=>[],getBoundingClientRect:()=>({top:0,bottom:0})};
 let frames=0,scheduled=0;
 vm.runInNewContext(tick+';tick(2000)',{demos:[{shell,state,spec:{frame(){frames++;},render(){frames++;}}}],document:{hidden:false},innerHeight:1080,requestAnimationFrame(){scheduled++;},fitCanvas(){return {ctx:{clearRect(){}},w:640,h:320};}});
 assert.equal(state.t,3);assert.equal(state.last,0);assert.equal(frames,0);assert.equal(scheduled,1);
});
