import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chapters,simulations} from '../public/catalog.js';
const read=p=>readFile(new URL('../dist/'+p,import.meta.url),'utf8');
test('web distribution exposes every chapter and laboratory through its sitemap',async()=>{
 const sitemap=await read('sitemap.xml');
 assert.equal([...sitemap.matchAll(/<loc>/g)].length,1+chapters.length+simulations.length);
 assert.doesNotMatch(sitemap,/\.zip|#/);
 for(const chapter of chapters){
  const page=await read(`capitole/${chapter.id}/index.html`);
  assert.ok(page.includes('<h1>'+chapter.title+'</h1>'));
  for(const lab of simulations.filter(s=>s.chapter===chapter.id))assert.ok(page.includes(lab.href.replace(/^\.\//,'')),lab.id);
 }
 for(const lab of simulations){
  const page=await read(lab.href);
  assert.equal([...page.matchAll(/<link rel="canonical"/g)].length,1,lab.id);
  assert.match(page,/<meta name="description"/);
  assert.match(page,/<meta property="og:image"/);
 }
 assert.match(await read('robots.txt'),/Sitemap: https:\/\//);
});
