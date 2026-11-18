import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const context={};vm.runInNewContext(await readFile(new URL('../scripts/adaptations/quadratic-practice.js',import.meta.url),'utf8'),context);
const {bank,number,grade}=context.QuadraticPractice;
test('practice accepts decimal commas, Unicode minus and simple fractions without partial parsing',()=>{
 for(const [input,value]of [[' 2,5 ',2.5],['−4',-4],['8 / 2',4],['.5',.5]])assert.equal(number(input),value);
 for(const input of ['', '4 m','2,3,4','1/0','Infinity','NaN','0x4','4abc','/2'])assert.equal(number(input),null);
});
test('practice distinguishes missing, incorrect and correct answers across all 12 bilingual items',()=>{
 assert.equal(bank.length,12);assert.equal(bank.filter(q=>q.options).length,6);
 for(const q of bank){assert.ok(q.q.every(Boolean)&&q.why.every(Boolean));assert.equal(grade(q,''),q.options?'missing':'invalid');assert.equal(grade(q,String(q.answer)),'correct');assert.equal(grade(q,String(q.answer+10)),'incorrect');}
 assert.equal(grade(bank[1],'8/2'),'correct');assert.equal(grade(bank[4],'−4'),'correct');
 assert.equal(grade(bank[1],'4,0001'),'incorrect');
});
