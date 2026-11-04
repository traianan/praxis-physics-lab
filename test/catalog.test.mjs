import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { chapters, simulations, findSimulations, getHomeSimulations, getLatestSimulations } from '../public/catalog.js';

test('latest laboratories follow documented addition dates and the addition order within the same day',()=>{
 const original=simulations.map(sim=>sim.id),latest=getLatestSimulations();
 assert.deepEqual(latest.map(sim=>sim.id),['generator-electric','motoare-termice','principiile-mecanicii-newtoniene']);
 assert.deepEqual(latest.map(sim=>sim.addedOn),['2026-11-03','2026-10-31','2026-10-30']);
 assert.equal(getLatestSimulations(1)[0].id,'generator-electric');
 assert.deepEqual(simulations.map(sim=>sim.id),original);
});
test('home previews show at most two per chapter while chapter/search retain the full registry',()=>{
 const home=getHomeSimulations();assert.equal(home.length,8);
 for(const chapter of chapters)assert.ok(home.filter(sim=>sim.chapter===chapter.id).length<=2);
 assert.equal(findSimulations('miscare').length,6);assert.equal(findSimulations('','curbilinie osculator').length,1);
});
test('exactly the seven physics chapters, with unique stable ids', () => {
 assert.equal(chapters.length,7); assert.equal(new Set(chapters.map(c=>c.id)).size,7);
 assert.deepEqual(chapters.map(c=>c.id),['miscare','sunete-si-unde','lucru-energie-putere','caldura-termodinamica','fenomene-cuantice','lumina-si-radiatii','electricitate-magnetism-circuite']);
});
test('twenty real local laboratories are available, including the existing optics', async () => {
 assert.equal(simulations.length,20); const s=simulations[0];
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
 for(const c of chapters.filter(c=>!['lumina-si-radiatii','miscare','sunete-si-unde','caldura-termodinamica','electricitate-magnetism-circuite'].includes(c.id)))assert.equal(findSimulations(c.id).length,0);
});
