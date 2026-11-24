import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { chapters, simulations, findSimulations, getHomeSimulations, getLatestSimulations } from '../public/catalog.js';

test('latest laboratories follow documented addition dates and the addition order within the same day',()=>{
 const original=simulations.map(sim=>sim.id),latest=getLatestSimulations();
  assert.deepEqual(latest.map(sim=>sim.id),['fourier-instrumente','coarde-tuburi-sonore','functii-trigonometrice']);
  assert.deepEqual(latest.map(sim=>sim.addedOn),['2026-11-24','2026-11-21','2026-11-21']);
  assert.equal(getLatestSimulations(1)[0].id,'fourier-instrumente');
 assert.deepEqual(simulations.map(sim=>sim.id),original);
});
test('home previews show at most two per chapter while chapter/search retain the full registry',()=>{
 const home=getHomeSimulations();assert.equal(home.length,15);
 for(const chapter of chapters)assert.ok(home.filter(sim=>sim.chapter===chapter.id).length<=2);
 assert.equal(findSimulations('miscare').length,9);assert.equal(findSimulations('','curbilinie osculator').length,1);
});

test('Home previews select the latest two laboratories in each chapter',()=>{
 const home=getHomeSimulations();
 const ordered=[...getLatestSimulations(simulations.length),...simulations.filter(s=>!s.addedOn)];
 for(const chapter of chapters)assert.deepEqual(home.filter(s=>s.chapter===chapter.id).map(s=>s.id),ordered.filter(s=>s.chapter===chapter.id).slice(0,2).map(s=>s.id));
});
test('eight chapters including mathematical foundations, with unique stable ids', () => {
 assert.equal(chapters.length,8); assert.equal(new Set(chapters.map(c=>c.id)).size,8);
 assert.deepEqual(chapters.map(c=>c.id),['miscare','sunete-si-unde','lucru-energie-putere','caldura-termodinamica','fenomene-cuantice','lumina-si-radiatii','electricitate-magnetism-circuite','elemente-de-matematica']);
});
test('forty-seven real local laboratories include Fourier, strings, conics and the Compton effect', async () => {
  assert.equal(simulations.length,47);
 assert.equal(simulations.find(s=>s.id==='functia-gradul-al-doilea').chapter,'elemente-de-matematica');
 assert.equal(simulations.find(s=>s.id==='miscarea-in-camp-gravitational').chapter,'miscare');
 assert.equal(simulations.find(s=>s.id==='polarizarea-luminii').chapter,'lumina-si-radiatii');
 const seismic=simulations.find(s=>s.id==='unde-seismice');
 assert.equal(seismic.chapter,'sunete-si-unde');assert.equal(seismic.status,'available');
 assert.ok((await stat(new URL('../public/'+seismic.image,import.meta.url))).size>0);
 const ohm=simulations.find(s=>s.id==='legea-lui-ohm');
 assert.equal(ohm.chapter,'electricitate-magnetism-circuite');assert.equal(ohm.status,'available');
 const header=await readFile(new URL('../public/shared/lab-header.js',import.meta.url),'utf8');
 const chapterMap=JSON.parse(header.match(/window\.PraxisLessonChapters=(\{[^;]+\});/)[1]);
 assert.deepEqual(chapterMap[ohm.id],{id:ohm.chapter,title:'Electricitate, magnetism și circuite'});
 const s=simulations.find(s=>s.id==='oglinzi-si-lentile');
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
 assert.equal(findSimulations('','sunet').length,4);
});
test('chapter results contain their registered laboratories',()=>{
 assert.equal(findSimulations('miscare').length,9);
 assert.deepEqual(findSimulations('lucru-energie-putere').map(s=>s.id),['legea-lui-hooke']);
 assert.deepEqual(findSimulations('fenomene-cuantice').map(s=>s.id).sort(),['dualismul-unda-corpuscul','efectul-compton','efectul-fotoelectric-extern']);
});

test('Ohm returns to its Romanian title and search results after RO → EN → RO',async()=>{
 const {simulations,localizeCatalog,findSimulations}=await import('../public/catalog.js?language-regression');
 const chapter=simulations.find(s=>s.id==='legea-lui-ohm').chapter;
 const namespace='chapters/'+chapter;
 const load=async language=>JSON.parse(await readFile(new URL(`../public/locales/${namespace}/${language}.json`,import.meta.url),'utf8'));
 const [ro,en]=await Promise.all([load('ro'),load('en')]);
 const ohm=simulations.find(s=>s.id==='legea-lui-ohm');
 const apply=locale=>localizeCatalog(name=>name===namespace?locale:undefined);

 apply(ro);
 assert.equal(ohm.title,'Legile lui Ohm');
 apply(en);
 assert.equal(ohm.title,'Ohm’s laws');
 apply(ro);
 assert.equal(ohm.title,'Legile lui Ohm');
 assert.deepEqual(findSimulations('','legile lui ohm').map(s=>s.id),[ohm.id]);

 apply(en);
 apply({...ro,simulations:{}});
 assert.equal(ohm.title,'Legile lui Ohm');
 assert.deepEqual(findSimulations('','legile lui ohm').map(s=>s.id),[ohm.id]);
});

test('chapter catalog translations have matching simulation ids and fields in RO and EN',async()=>{
 for(const {id} of chapters){
  const load=async lang=>JSON.parse(await readFile(new URL(`../public/locales/chapters/${id}/${lang}.json`,import.meta.url),'utf8')).simulations;
  const [ro,en]=await Promise.all([load('ro'),load('en')]);
  assert.deepEqual(Object.keys(ro).sort(),Object.keys(en).sort(),id);
  for(const simulation of Object.keys(en)){
   assert.deepEqual(Object.keys(ro[simulation]).sort(),Object.keys(en[simulation]).sort(),simulation);
  }
 }
});

test('quadratic and conics cards switch all visible metadata and conics artwork in EN',async()=>{
 const {simulations,localizeCatalog}=await import('../public/catalog.js?mathematics-cards-language');
 const namespace='chapters/elemente-de-matematica';
 const load=async language=>JSON.parse(await readFile(new URL(`../public/locales/${namespace}/${language}.json`,import.meta.url),'utf8'));
 const [ro,en]=await Promise.all([load('ro'),load('en')]);
 const apply=locale=>localizeCatalog(name=>name===namespace?locale:undefined);
 const quadratic=simulations.find(sim=>sim.id==='functia-gradul-al-doilea');
 const conics=simulations.find(sim=>sim.id==='conice');
 apply(en);
 assert.equal(quadratic.title,'Quadratic function');
 assert.match(quadratic.description,/Explore parabolas/);
 assert.deepEqual(quadratic.tags,['Mathematics','Functions','Graphs','Offline']);
 assert.equal(conics.title,'Conic sections');
 assert.deepEqual(conics.tags,['Mathematics','Analytic geometry','Conic sections','Animations']);
 assert.equal(conics.image,'./assets/conice-cover-v2-en.svg');
 apply(ro);
 assert.equal(quadratic.title,'Funcția de gradul al doilea');
 assert.equal(conics.title,'Conicele');
 assert.equal(conics.image,'./assets/conice-cover-v2.svg');
});
