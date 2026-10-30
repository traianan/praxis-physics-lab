import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { chapters, simulations, findSimulations, getHomeSimulations } from '../public/catalog.js';
test('home previews show at most two per chapter while chapter/search retain the full registry',()=>{
 const home=getHomeSimulations();assert.equal(home.length,7);
 for(const chapter of chapters)assert.ok(home.filter(sim=>sim.chapter===chapter.id).length<=2);
 assert.equal(findSimulations('miscare').length,5);assert.equal(findSimulations('','curbilinie osculator').length,1);
});
test('exactly the seven physics chapters, with unique stable ids', () => {
 assert.equal(chapters.length,7); assert.equal(new Set(chapters.map(c=>c.id)).size,7);
 assert.deepEqual(chapters.map(c=>c.id),['miscare','sunete-si-unde','lucru-energie-putere','caldura-termodinamica','fenomene-cuantice','lumina-si-radiatii','electricitate-magnetism-circuite']);
});
test('seventeen real local laboratories are available, including the existing optics', async () => {
 assert.equal(simulations.length,17); const s=simulations[0];
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
 assert.equal(findSimulations('miscare').length,5);
 for(const c of chapters.filter(c=>!['lumina-si-radiatii','miscare','sunete-si-unde','caldura-termodinamica'].includes(c.id)))assert.equal(findSimulations(c.id).length,0);
});
