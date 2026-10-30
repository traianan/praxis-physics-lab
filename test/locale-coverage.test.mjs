import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
async function translator(course,lang){
 const embedded={ro:{},en:{}};
 const namespaces=course.startsWith('labs/')?[course]: (await readdir(new URL('public/locales/courses/'+course+'/',root))).map(g=>'courses/'+course+'/'+g);
 for(const locale of ['ro','en'])for(const ns of namespaces)embedded[locale][ns]=JSON.parse(await read('public/locales/'+ns+'/'+locale+'.json'));
 const window={},document={documentElement:{}};
 vm.runInNewContext(await read('public/shared/i18n.js'),{window,document,localStorage:{getItem:()=>lang},location:{href:'file:///offline.html'}});
 window.PraxisI18n.initEmbedded({namespaceList:namespaces,embedded});window.PraxisI18n.enableCourseMode();return window.PraxisI18n.tr;
}
test('all 20 distributed motion problems translate their generated statements, solutions and diagrams',async()=>{
 const output=execFileSync(process.execPath,['scripts/audit-course-fixtures.mjs'],{cwd:root,encoding:'utf8'});
 assert.match(output,/976 problem outputs; 0 untranslated text fragments/);
 assert.equal((await translator('miscarea-rectilinie','en'))('Ascunde'),'Hide');
 const fixtures=JSON.parse(await read('outputs/course-problem-fixtures.json'));
 assert.equal(new Set(fixtures.map(r=>r.id)).size,20);
});
test('vector prose split by formulas and quiz explanations translate offline',async()=>{
 const en=await translator('calcul-vectorial','en');
 for(const source of [', sens opus dacă','; pentru','— pentru','forța are sens opus câmpului!','Pentru α = 90°, R = √(a² + b²) = √(9 + 16) = 5.','G_t = mg sin α; componenta normală este G_n = mg cos α.']){
  const translated=en(source);assert.notEqual(translated,source);assert.doesNotMatch(translated,/[ăîșț]|\b(?:Pentru|normală)\b/);
 }
});
test('corrected wave explanations and Romanian transport controls work without fetch',async()=>{
 const en=await translator('unde-mecanice','en'),ro=await translator('unde-mecanice','ro');
 const physics=JSON.parse(await read('scripts/wave-physics-translations.json'));
 const sources=Object.keys(physics).filter(k=>k.startsWith('15 particule:')||k.includes('folosind sin a − sin b'));
 assert.equal(sources.length,2);
 for(const source of sources){assert.equal(en(source),physics[source]);assert.equal(ro(source),source);}
 assert.equal(en('▶ Play'),'▶ Play');assert.equal(ro('▶ Play'),'▶ Pornește');
 assert.equal(ro('↺ Reset trail & timp'),'↺ Resetează urmele și timpul');
 assert.equal(en('↺ Reset trail & timp'),'↺ Reset trails & time');
});
test('physical-model optics link is bilingual',async()=>{
 const source='Despre modelul fizic ↗';
 assert.equal((await translator('labs/oglinzi-si-lentile/ui','en'))('Despre modelul fizic'),'About the physical model');
 assert.equal((await translator('labs/oglinzi-si-lentile/ui','en'))(source),'About the physical model ↗');
 assert.equal((await translator('labs/oglinzi-si-lentile/ui','ro'))(source),source);
});

test('Huygens simultaneous-emission explanation and generation controls are bilingual offline',async()=>{
 const en=await translator('unde-mecanice','en'),ro=await translator('unde-mecanice','ro');
 const messages=JSON.parse(await read('scripts/wave-physics-translations.json'));
 for(const key of Object.keys(messages).filter(k=>k.includes('t₀')||k==='Intervalul Δt'||k==='Pornește'||k.startsWith('Propagarea este continuă'))){assert.equal(en(key),messages[key]);assert.equal(ro(key),key);}
 const patches=JSON.parse(await read('scripts/wave-physics-patches.json'));
 assert.equal(patches[0].after,(await read('scripts/huygens-component.js')).replace(/\r\n/g,'\n').trim());
});
