import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import vm from 'node:vm';
import {findSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('thermodynamics is registered under heat with all figures and original assets preserved',async()=>{
 const [sim]=findSimulations('caldura-termodinamica','notiuni');assert.equal(sim.title,'Noțiuni termodinamice de bază');
 const html=await read('public/simulari/notiuni-termodinamice/index.html'),body=html.split('<body')[1];
 assert.equal((body.match(/<figure class="fig\b[^"]*"/g)||[]).length,13);
 assert.doesNotMatch(body,/manual|coperta|1\.1\.\d|C\. Mantea|M\. Garabet|serviceWorker\.register|heroField/);
 assert.doesNotMatch(body,/id="s12"|Precizări importante|Corecturi|Fig\. 4 — Laboratorul molului/);
 assert.match(body,/Fig\. 4 — Masă molară și cantitate de substanță/);
 assert.match(body,/M<sub>r<\/sub>, μ, ν, N, m, amestecuri/);
 assert.match(html,/shared\/thermodynamics.css/);assert.match(html,/shared\/course.js/);assert.match(html,/shared\/velocity-labels.js/);
 const manifest=JSON.parse(await read('docs/imported-thermodynamics.json'));
 for(const file of manifest.files){const source=await readFile(new URL('../'+manifest.source+'/'+file.path,import.meta.url));assert.equal(createHash('sha256').update(source).digest('hex'),file.sha256);if(!['index.html','js/baza.js','js/lectie.js','js/figuri-1.js','js/figuri-2.js'].includes(file.path))assert.deepEqual(await readFile(new URL('../public/simulari/notiuni-termodinamice/'+file.path,import.meta.url)),source);}
});
test('ten thermodynamic numerical answers agree with independent SI calculations and the quiz has valid keys',async()=>{
 const code=await read('public/simulari/notiuni-termodinamice/js/lectie.js');
 const P=vm.runInNewContext(code.match(/const P=(\[[\s\S]*?\]);\s*const box=/)[1]);
 const expected=[2*1+32+4*16,36/18,(36/18)*6.022,(88/44)*22.4,(12*28+4*32)/16,273.16*2.197,(40+6)*100/(109+6),37*9/5+32,200000*(7-2)*.001,41800/(30-20)];
 assert.equal(P.length,10);P.forEach((p,i)=>assert.ok(Math.abs(p.a-expected[i])<=.001*Math.max(1,expected[i]),'problem '+(i+1)));
 const Q=vm.runInNewContext(code.match(/const Q=(\[[\s\S]*?\]);\s*const box=/)[1]);assert.equal(Q.length,14);Q.forEach(q=>assert.ok(Number.isInteger(q.c)&&q.c>=0&&q.c<q.o.length));
});
