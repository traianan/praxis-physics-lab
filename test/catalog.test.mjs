import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { chapters, simulations, findSimulations, getHomeSimulations, getLatestSimulations } from '../public/catalog.js';

test('latest laboratories follow documented addition dates and the addition order within the same day',()=>{
 const original=simulations.map(sim=>sim.id),latest=getLatestSimulations();
 assert.deepEqual(latest.map(sim=>sim.id),['pendulul-gravitational','legea-lui-hooke','pila-daniell']);
 assert.deepEqual(latest.map(sim=>sim.addedOn),['2026-11-05','2026-11-04','2026-11-04']);
 assert.equal(getLatestSimulations(1)[0].id,'pendulul-gravitational');
 assert.deepEqual(simulations.map(sim=>sim.id),original);
});
test('home previews show at most two per chapter while chapter/search retain the full registry',()=>{
 const home=getHomeSimulations();assert.equal(home.length,10);
 for(const chapter of chapters)assert.ok(home.filter(sim=>sim.chapter===chapter.id).length<=2);
 assert.equal(findSimulations('miscare').length,6);assert.equal(findSimulations('','curbilinie osculator').length,1);
});
test('exactly the seven physics chapters, with unique stable ids', () => {
 assert.equal(chapters.length,7); assert.equal(new Set(chapters.map(c=>c.id)).size,7);
 assert.deepEqual(chapters.map(c=>c.id),['miscare','sunete-si-unde','lucru-energie-putere','caldura-termodinamica','fenomene-cuantice','lumina-si-radiatii','electricitate-magnetism-circuite']);
});
test('twenty-four real local laboratories are available, including the existing optics', async () => {
 assert.equal(simulations.length,24); const s=simulations.find(s=>s.id==='oglinzi-si-lentile');
 assert.equal(s.chapter,'lumina-si-radiatii');assert.equal(s.status,'available');
 assert.ok(!/^https?:/.test(s.href));
 const file=new URL('../public/'+s.href,import.meta.url); assert.ok((await stat(file)).size>100000);
 const html=await readFile(file,'utf8'); assert.match(html,/board-mode/);assert.match(html,/board-size/);assert.match(html,/range-stepper/);
 assert.match(html,/library-return/);assert.match(html,/PraxisSound/);
});
test('laboratory links stay in this tab and return context is preserved',async()=>{
 const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(app,/target="_blank"/);assert.match(app,/praxis-library-return/);
});
test('search is accent-insensitive and combines chapter and all search words',()=>{
 assert.equal(findSimulations('','OPTICĂ').length,1);
 assert.equal(findSimulations('','optica lentile').length,1);
 assert.equal(findSimulations('miscare','lentile').length,0);
 assert.equal(findSimulations('lumina-si-radiatii','oglinzi').length,1);
 assert.equal(findSimulations('','sunet').length,2);
});
test('empty chapters remain empty instead of containing invented simulations',()=>{
 assert.equal(findSimulations('miscare').length,6);
 assert.deepEqual(findSimulations('lucru-energie-putere').map(s=>s.id),['legea-lui-hooke']);
 assert.equal(findSimulations('fenomene-cuantice').length,0);
});
