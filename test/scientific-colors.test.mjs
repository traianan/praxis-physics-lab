import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function science(){const window={},properties=new Map(),document={documentElement:{dataset:{},style:{setProperty:(k,v)=>properties.set(k,v)}}};vm.runInNewContext(await read('public/shared/scientific-colors.js'),{window,document});return {api:window.PraxisScientificColors,properties,document};}

test('both scientific palettes meet normal-text contrast on laboratory paper surfaces',async()=>{
 const {api}=await science();
 const luminance=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
 for(const scheme of ['praxis','vivid'])for(const [role,color]of Object.entries(api.palette(scheme)))for(const background of ['#fffefa','#f7f5ee','#edf2e9']){
  const a=luminance(color),b=luminance(background),contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert.ok(contrast>=4.5,`${scheme}/${role} on ${background}: ${contrast}`);
 }
});

test('dark-mode scientific labels retain contrast and switch back without losing roles',async()=>{
 const {api,document,properties}=await science();
 const luminance=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
 const light=api.palette('praxis');document.documentElement.dataset.theme='dark';
 for(const scheme of ['praxis','vivid'])for(const [role,color]of Object.entries(api.apply(scheme)))for(const background of ['#0f111a','#1c1f2b'])assert.ok((luminance(color)+.05)/(luminance(background)+.05)>=4.5,scheme+'/'+role);
 assert.equal(api.color(light.blue,'praxis'),api.palette('praxis').blue);
 document.documentElement.dataset.theme='light';api.apply('praxis');assert.equal(properties.get('--praxis-science-blue'),light.blue);
});
test('the universal scientific palette agrees across Canvas colors, gradients, CSS roles and optics SVG',async()=>{
 const {api,properties}=await science(),p=api.apply('vivid');
 assert.equal(p.x,p.blue);assert.equal(p.v,p.orange);assert.equal(p.acc,p.green);
 assert.equal(api.color('#1f5a8a','vivid'),p.blue);assert.equal(api.color('#4f6fb8','vivid'),p.blue);assert.equal(api.color('#10b981','vivid'),p.green);
 assert.equal(api.color('rgba(31,90,138,0.25)','vivid'),'rgba(0,82,204,0.25)');assert.equal(api.color('#1f5a8a80','vivid'),p.blue+'80');
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
