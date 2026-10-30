import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function science(){const window={},properties=new Map(),document={documentElement:{dataset:{},style:{setProperty:(k,v)=>properties.set(k,v)}}};vm.runInNewContext(await read('public/shared/scientific-colors.js'),{window,document});return {api:window.PraxisScientificColors,properties,document};}
test('the universal scientific palette agrees across Canvas colors, gradients, CSS roles and optics SVG',async()=>{
 const {api,properties}=await science(),p=api.apply('vivid');
 assert.equal(p.x,p.blue);assert.equal(p.v,p.orange);assert.equal(p.acc,p.green);
 assert.equal(api.color('#1f5a8a','vivid'),p.blue);assert.equal(api.color('#4f6fb8','vivid'),p.blue);assert.equal(api.color('#10b981','vivid'),p.green);
 assert.equal(api.color('rgba(31,90,138,0.25)','vivid'),'rgba(0,102,255,0.25)');assert.equal(api.color('#1f5a8a80','vivid'),p.blue+'80');
 assert.equal(api.optics('<path stroke="#4f9698"/><path stroke="#ce963f"/>','vivid'),'<path stroke="'+p.blue+'"/><path stroke="'+p.orange+'"/>');
 assert.equal(properties.get('--praxis-science-blue'),p.blue);
 assert.equal(api.color('#243c40','vivid'),'#243c40');assert.equal(api.color('hsl(400 80% 50%)','vivid'),'hsl(400 80% 50%)');
 for(const role of ['red','blue','green','orange','purple','teal','yellow'])assert.equal(api.color(p[role],'praxis'),api.palette('praxis')[role]);
});
test('every laboratory loads the central palette; optics uses the same persisted preference',async()=>{
 for(const sim of simulations){const html=await read('public/'+sim.href);assert.match(html,/scientific-colors\.js|window\.PraxisScientificColors=/,sim.id);}
 const optics=await read('public/simulari/oglinzi-si-lentile/index.html');assert.doesNotMatch(optics,/praxis-optica-color-scheme/);assert.match(optics,/PraxisScientificColors.optics\(markup,colorScheme\)/);
 const atomic=await read('scripts/adaptations/atomic-navigation.js');assert.doesNotMatch(atomic,/atomicPalettes/);assert.match(atomic,/PraxisScientificColors.palette/);
});
