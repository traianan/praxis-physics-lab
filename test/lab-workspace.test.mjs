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
