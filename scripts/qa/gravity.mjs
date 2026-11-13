import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist'),out=path.resolve('outputs/gravity-review'),id='interactiunea-gravitationala';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[],errors=[],missing=[],untranslated=new Set();
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.zip':'application/zip'};
const url='http://praxis.test/simulari/'+id+'/index.html';
try{
 for(const [width,height,dpr] of (process.env.GRAVITY_QUICK?[[1366,768,1]]:[[3840,2160,1],[1920,1080,2],[1366,768,1],[1024,768,1],[390,844,3]])){
  console.log('Viewport',width);
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:width===390});
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.hostname!=='praxis.test'){missing.push(u.href);return route.abort();}
   const file=path.resolve(root,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));assert.ok(file.startsWith(root+path.sep));
   try{await route.fulfill({body:await readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch{missing.push(u.pathname);await route.fulfill({status:404,body:'Missing'});}
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.waitForFunction(()=>window.PraxisGravity);
  const consent=page.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
  const select=async tab=>{const b=page.locator('[data-tab="'+tab+'"]');if(await b.isVisible())await b.click();else await page.locator('.praxis-course-sections').selectOption(tab);await page.waitForTimeout(50);};
  for(const size of [100,200]){
   await page.evaluate(size=>{document.documentElement.style.fontSize=16*size/100+'px';dispatchEvent(new Event('resize'));},size);
   for(const lang of ['ro','en']){
    await page.evaluate(lang=>PraxisI18n.setLanguage(lang),lang);
    for(const tab of ['newton','teorie','camp','sateliti','probleme','quiz','formule']){
     await select(tab);
     const result=await page.evaluate(tab=>({overflow:document.documentElement.scrollWidth-innerWidth,width:document.getElementById(tab).getBoundingClientRect().width,bottom:document.querySelector('#'+tab+' .lab')?.getBoundingClientRect().bottom,canvases:[...document.querySelectorAll('#'+tab+' canvas')].map(c=>({id:c.id,width:c.width,height:c.height,cssWidth:c.clientWidth})),wide:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>e.tagName+'#'+e.id+'.'+e.className)}),tab);
     report.push({...result,panelWidth:result.width,width,height,dpr,size,lang,tab});
     if(lang==='en')for(const text of await page.evaluate(()=>{const w=document.createTreeWalker(document.getElementById('gravity-root'),NodeFilter.SHOW_TEXT),a=[];let n;while(n=w.nextNode())if(!n.parentElement.closest('annotation,script,style')&&/[ăâîșțĂÂÎȘȚ]/.test(n.data))a.push(n.data.trim());return a;}))untranslated.add(text);
     if(size===100&&lang==='ro'&&(width===1366||width===390))await page.screenshot({path:path.join(out,tab+'-'+width+'.png'),fullPage:true});
    }
   }
  }
  await page.evaluate(()=>{document.documentElement.style.fontSize='16px';dispatchEvent(new Event('resize'));PraxisI18n.setLanguage('ro');});
  await select('newton');
  const change=async(key,value)=>{await page.locator('#'+key+'N').fill(String(value));await page.locator('#'+key+'N').dispatchEvent('input');};
  await change('r',4);await change('m1',100);
  assert.equal(await page.evaluate(()=>PraxisGravity.state.r),4);
  assert.match(await page.locator('#forceResult').textContent(),/3[,.]337/); // 6.674e-11 × 100 × 80 / 16
  await page.locator('#doubleR').click();assert.equal(await page.evaluate(()=>PraxisGravity.state.r),8);
  await page.locator('#doubleM').click();assert.equal(await page.evaluate(()=>PraxisGravity.state.m1),200);
  await page.evaluate(()=>PraxisI18n.setLanguage('en'));assert.equal(await page.evaluate(()=>PraxisGravity.state.m1),200);
  await page.locator('#resetF').click();assert.equal(await page.evaluate(()=>PraxisGravity.state.r),2);
  console.log('camp');await select('camp');await page.locator('#hR').click();assert.equal(await page.locator('#gRatio').textContent(),'25.0%');
  await page.locator('#fieldMode').selectOption('inside');await change('inside',0);assert.equal(await page.locator('#gResult').textContent(),'0.000');
  await change('inside',1);assert.equal(await page.locator('#gRatio').textContent(),'100.0%');
  await page.locator('#hZero').click();assert.equal(await page.locator('#fieldMode').inputValue(),'outside');
  console.log('sateliti');await select('sateliti');await page.locator('[data-preset="400"]').click();assert.equal(await page.locator('#vResult').textContent(),'7.672');assert.equal(await page.locator('#tResult').textContent(),'92.4');
  await page.locator('[data-preset="35786"]').click();assert.ok(Math.abs(Number((await page.locator('#tResult').textContent()).replaceAll(',',''))-1436)<1);
  await page.locator('#play').click();const paused=await page.evaluate(()=>PraxisGravity.angle);await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>PraxisGravity.angle),paused);
  await page.locator('#play').click();await page.waitForTimeout(120);assert.notEqual(await page.evaluate(()=>PraxisGravity.angle),paused);
  await select('teorie');const hidden=await page.evaluate(()=>PraxisGravity.angle);await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>PraxisGravity.angle),hidden);
  console.log('sateliti');await select('sateliti');await page.locator('#play').click();await page.locator('#resetO').click();assert.equal(await page.evaluate(()=>PraxisGravity.angle),0);
  for(const control of ['oVectors','oPath','oField'])await page.locator('#'+control).click();
  console.log('probleme');await select('probleme');await page.locator('#numeric').fill('490,5');await page.locator('#checkNumeric').click();assert.match(await page.locator('#numericFeedback').textContent(),/Correct/);
  for(const detail of await page.locator('#problems details').all()){await detail.locator('summary').click();assert.ok(await detail.locator('li').count()>=3);}
  console.log('quiz');await select('quiz');for(const [i,value]of [false,false,true,true,false,true,true,false,false,false].entries())await page.locator('input[name="q'+i+'"][value="'+value+'"]').check();
  await page.locator('#quizForm button[type=submit]').click();assert.match(await page.locator('#score').textContent(),/^10 \/ 10/);
  await page.evaluate(()=>PraxisI18n.setLanguage('ro'));assert.equal(await page.locator('#quizForm input:checked').count(),10);
  await page.locator('#resetQuiz').click();assert.equal(await page.locator('#quizForm input:checked').count(),0);
  console.log('formule');await select('formule');await page.locator('#copy').click();assert.ok((await page.locator('#copyStatus').textContent()).length);
  if(width===1366){
   await select('newton');await page.locator('[data-tab="newton"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#teorie').isVisible(),true);
   const board=page.getByRole('button',{name:'Mod tablă',exact:true});await board.click();await page.waitForTimeout(100);assert.equal(await board.getAttribute('aria-pressed'),'true');await board.click();
   const chapter=page.locator('a.praxis-lab-chapter');await chapter.click();assert.match(page.url(),/capitol\/miscare/);await page.reload();
   const card=page.locator('a[href="./simulari/'+id+'/index.html"]').first();await card.click();assert.match(page.url(),/interactiunea-gravitationala/);
   await page.waitForLoadState('load');await page.locator('header a[href="http://praxis.test/?home=1"]').first().click();await page.waitForTimeout(100);const latest=page.locator('a[href="./simulari/'+id+'/index.html"]').first();await latest.click();assert.match(page.url(),/interactiunea-gravitationala/);
  }
  await context.close();
 }
 // Standalone build: deny every network request and test both languages from file://.
 const context=await browser.newContext();await context.route(/^https?:/,route=>{missing.push(route.request().url());return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('file:///'+path.resolve('outputs/offline-lessons',id,'index.html').replaceAll('\\','/'));
 await page.waitForFunction(()=>window.PraxisGravity);await page.evaluate(()=>PraxisI18n.setLanguage('en'));await page.evaluate(()=>PraxisGravity.select('sateliti'));assert.equal(await page.locator('#vResult').textContent(),'7.672');await page.evaluate(()=>PraxisI18n.setLanguage('ro'));await page.locator('[data-preset="20200"]').click();assert.equal(await page.evaluate(()=>PraxisGravity.state.oh),20200);
 await context.close();
}finally{await browser.close();await writeFile(path.join(out,'report.json'),JSON.stringify({report,errors,missing,untranslated:[...untranslated]},null,2));}
assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual([...untranslated],[]);
assert.ok(report.every(r=>r.overflow<=1&&r.panelWidth>0),JSON.stringify(report.filter(r=>r.overflow>1||r.panelWidth<=0)));
console.log('Gravity browser audit: '+report.length+' layout/language states; physics, controls, quiz and offline passed.');
