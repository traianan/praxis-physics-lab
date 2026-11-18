import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {flattenScopedCSS} from '../scripts/scoped-lesson-css.mjs';

test('scoped lesson compilation keeps root isolation, media rules and global animations',async()=>{
 const css=await flattenScopedCSS('@scope (#demo){:scope{color:red}.card{padding:12px}@media(max-width:600px){.card{display:block}}@keyframes pulse{from{opacity:0}to{opacity:1}}@page{margin:1cm}}');
 assert.doesNotMatch(css,/@scope\b|&\s*[:.{,#]/);
 assert.match(css,/:where\(#demo\)\s*\{/);assert.match(css,/:where\(#demo\) \.card/);
 assert.match(css,/@media/);assert.match(css,/@page/);
 assert.ok(css.indexOf('@keyframes')>css.lastIndexOf(':where'));
});

test('school-board lesson styles do not require CSS scope support',async()=>{
 for(const file of ['shared/wire-source.css','shared/polytropic-source.css','shared/pendulum-source.css','shared/gravity.css','simulari/condensatorul/style.css','simulari/functia-gradul-intai/style.css','simulari/functia-gradul-al-doilea/style.css']){
  const css=await readFile(new URL('../public/'+file,import.meta.url),'utf8');
  assert.doesNotMatch(css,/@scope\b|&\s*[:.{,#]/,file);
 }
});
