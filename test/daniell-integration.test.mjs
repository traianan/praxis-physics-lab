import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {simulations,findSimulations} from '../public/catalog.js';
import {messages,theory,activities,questions,sources} from '../public/simulari/pila-daniell/content.js';
import vm from 'node:vm';
import {scientificMathRuntime} from '../scripts/scientific-math-runtime.mjs';
test('Daniell is searchable, local and belongs to the circuits chapter',async()=>{
 const s=simulations.find(s=>s.id==='pila-daniell');assert.equal(s.chapter,'electricitate-magnetism-circuite');assert.ok(findSimulations(s.chapter,'pila daniell').includes(s));
 for(const file of [s.href,s.image])assert.ok((await stat(new URL('../public/'+file,import.meta.url))).size>0);
 for(const lang of ['ro','en']){const ns=JSON.parse(await readFile(new URL(`../public/locales/chapters/${s.chapter}/${lang}.json`,import.meta.url)));assert.ok(ns.simulations[s.id].title);}
});
test('bilingual material includes four authoritative sources and complete questions',()=>{
 assert.equal(sources.length,4);assert.ok(sources.every(([,url])=>/^https:\/\/(openstax.org|physics.nist.gov)\//.test(url)));
 for(const text of [...theory.matchAll(/<p data-science-math="prose" data-science-source="([^"]+)"/g),...activities.matchAll(/<p data-science-math="prose" data-science-source="([^"]+)"/g)])assert.ok(messages[text[1]],text[1]);
 for(const [q,answers,correct,explanation] of questions){assert.ok(messages[q]);assert.ok(correct>=0&&correct<answers.length);assert.ok(messages[explanation]);}
});
test('Nernst renderer keeps logarithm outside the 2F denominator',async()=>{
 const window={addEventListener(){},PraxisI18n:{language:'ro',tr:s=>s}},document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(await scientificMathRuntime(),{window,document,Set,WeakMap});
 const source=theory.match(/data-science-math="tex" data-science-source="([^"]+)"/)[1],html=window.PraxisMath.tex(source);
 assert.ok(!html.includes('science-math-error'));
 const end=html.indexOf('</mfrac>'),log=html.indexOf('>ln<');assert.ok(end>0&&log>end,'ln must multiply the fraction, not be inside it');
 assert.ok(html.slice(0,end).includes('<mn>2</mn><mi>F</mi>'));
});
test('bilingual prose renders concentration, power, mass and reaction indices structurally',async()=>{
 const window={addEventListener(){},PraxisI18n:{language:'ro',tr:s=>s}},document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(await scientificMathRuntime(),{window,document,Set,WeakMap});
 const paragraphs=[...theory.matchAll(/<p data-science-math="prose" data-science-source="([^"]+)"/g),...activities.matchAll(/<p data-science-math="prose" data-science-source="([^"]+)"/g)];
 assert.ok(paragraphs.length>10);
 for(const [,source] of paragraphs)for(const prose of [source,messages[source]]){
  const html=window.PraxisMath.prose(prose);assert.ok(!html.includes('science-math-error'));
  const visible=html.replace(/<annotation\b[^>]*>[\s\S]*?<\/annotation>/g,'').replace(/<[^>]*>/g,'');
  assert.doesNotMatch(visible,/_\{|\^0/);
 }
 for(const prose of ['c_{Zn}','c_{Cu}','P_{extern}','P_{external}','Δ_r G⁰','Δ m_{Cu}','m_{Zn,0}'])assert.ok(window.PraxisMath.prose(prose).includes('<msub>'),prose);
 assert.ok(window.PraxisMath.prose('Δ_r G⁰').includes('<msup>'));
});
