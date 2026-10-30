import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {findSimulations,getHomeSimulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('calorimetry retains all seven figures and all original source assets, under heat',async()=>{
 const [lab]=findSimulations('caldura-termodinamica','calorimetrie');assert.equal(lab.id,'calorimetrie');assert.equal(getHomeSimulations().filter(l=>l.chapter==='caldura-termodinamica').length,2);
 const body=(await read('public/simulari/calorimetrie/index.html')).split('<body')[1];assert.equal((body.match(/<figure class="fig\b/g)||[]).length,7);assert.doesNotMatch(body,/manual|Corecturi|id="s8"|class="hero"|1\.2\.\d/);assert.match(body,/value="0.8" data-k="m3"/);
 const manifest=JSON.parse(await read('docs/imported-calorimetry.json'));
 for(const file of manifest.files){const data=await readFile(new URL('../'+manifest.source+'/'+file.path,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256);if(!['index.html','js/baza.js','js/lectie.js','js/figuri-1.js','js/figuri-2.js'].includes(file.path))assert.deepEqual(await readFile(new URL('../public/simulari/calorimetrie/'+file.path,import.meta.url)),data);}
});
test('all eight calorimetry problem answers agree with independent heat balances',async()=>{
 const code=await read('public/simulari/calorimetrie/js/lectie.js');const P=vm.runInNewContext(code.match(/const P=(\[[\s\S]*?\]);\s*const box=/)[1]);
 const expected=[(.2*20+.3*70)/.5,2*900*50/1000,12000/50,(.5*385*100+4180*20)/(.5*385+4180),.4*4180*4/(.2*76),(.1*4180*22-.1*4180*18)/18,380*2*10/(.8*10-.4*10),3*(40-20)/(80-40)];
 assert.equal(P.length,8);P.forEach((p,i)=>assert.ok(Math.abs(p.a-expected[i])<=.002*expected[i],'problem '+(i+1)));
 const Q=vm.runInNewContext(code.match(/const Q=(\[[\s\S]*?\]);\s*const box=/)[1]);assert.equal(Q.length,12);Q.forEach(q=>assert.ok(Number.isInteger(q.c)&&q.c>=0&&q.c<q.o.length));assert.doesNotMatch(code,/manual|Corecturi/);
});
test('oil balance rejects incompatible measurements and preserves energy for valid temperatures',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/calorimetry-model.js'),{window});const model=window.PraxisCalorimetry;
 const data={m1:2,m2:.4,m3:.8,T1:283,T3:303,T:293};assert.equal(model.oilSpecificHeat(data),1900);
 assert.equal(model.oilSpecificHeat({...data,m3:.4}),null);assert.equal(model.oilSpecificHeat({...data,T:310}),null);
 for(const m3 of [.5,.8,1,1.6])for(const T of [284,287,293,299]){const d={...data,m3,T},c=model.oilSpecificHeat(d);if(c!==null){assert.ok(c>0&&Number.isFinite(c));const absorbed=(d.m1*380+d.m2*c)*(T-d.T1),released=d.m3*c*(d.T3-T);assert.ok(Math.abs(absorbed-released)<1e-7*Math.max(1,released));}}
 assert.match(await read('public/simulari/calorimetrie/js/figuri-2.js'),/PraxisCalorimetry\.oilSpecificHeat/);
});

test('pouring transfers the exact selected mass at 30, 60 and 120 Hz and with irregular frame durations',async()=>{
 const window={};vm.runInNewContext(await read('public/shared/calorimetry-model.js'),{window});
 for(const durations of [[1/30],[1/60],[1/120],[.05],[.007,.033,.05,.012]])for(const mass of [.05,.15,.25]){let progress=0,total=0,index=0;while(progress<1){const next=progress+durations[index++%durations.length]/1.6;total+=mass*window.PraxisCalorimetry.pouringFraction(progress,next);progress=next;}assert.ok(Math.abs(total-mass)<1e-12);}
 assert.match(await read('public/simulari/calorimetrie/js/figuri-2.js'),/PraxisCalorimetry\.pouringFraction/);
});
