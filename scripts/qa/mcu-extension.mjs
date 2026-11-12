import {chromium} from 'playwright-core';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist'),out=path.resolve('outputs/mcu-review');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[],errors=[];
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.zip':'application/zip'};
try{
 for(const [width,height,dpr] of [[3840,2160,1],[1920,1080,2],[1366,768,1],[1024,768,1],[390,844,1]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});
  await context.route('http://praxis.test/**',async route=>{
   const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
   const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
   assert.ok(file.startsWith(root+path.sep));
   try{await route.fulfill({body:await readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Missing'});}
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://praxis.test/simulari/miscarea-circulara-uniforma/index.html');
  await page.waitForSelector('#root [data-mcu-section]');
  await page.locator('[data-privacy-choice=necessary]').click();
  const selectTab=async tab=>{const button=page.locator(`[data-tab="${tab}"]`);if(await button.isVisible())await button.click();else await page.locator('.praxis-course-sections').selectOption(tab);};
  for(const lang of ['ro','en']){
   await page.evaluate(lang=>PraxisI18n.setLanguage(lang),lang);
   for(const tab of ['concepte','dinamica','curbe','laborator','masurare','cotidian','viraj','probleme','test']){
    await selectTab(tab);
    const result=await page.evaluate(()=>({active:document.body.dataset.mcuActive,overflow:document.documentElement.scrollWidth>innerWidth+1,panels:[...document.querySelectorAll('[data-mcu-section]')].filter(x=>!x.hidden).map(x=>({id:x.id,width:x.getBoundingClientRect().width}))}));
    assert.equal(result.active,tab);assert.ok(result.panels.every(x=>x.width>0));assert.equal(result.overflow,false,JSON.stringify({width,lang,tab}));
    if(tab==='dinamica')assert.ok(await page.locator('#sri-srni .mcu-vector-symbol').count()>=12,'Missing force vector accents');
    if(tab==='dinamica')assert.equal(await page.locator('#acceleratie [data-mcu-svg-vector]').count(),8,'Missing SVG velocity vector accents');
    if(tab==='laborator')assert.equal(await page.locator('#sim-mcu .mcu-math-text .mcu-vector-symbol').count(),0,'Scalar readouts must not gain vector accents');
    if(tab==='viraj')assert.equal(await page.locator('.mcu-force-legend .mcu-vector-symbol').count(),8);
    if(width===1366&&lang==='ro')await page.screenshot({path:path.join(out,`tab-${tab}.png`),fullPage:true});
   }
  }
  await selectTab('masurare');
  await page.screenshot({path:path.join(out,`measure-${width}.png`),fullPage:true});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'200% overflow '+width);
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  if(width===1366){
   await page.clock.install();
   await page.evaluate(()=>{const f=document.getElementById('measure-frequency');f.value=1;f.dispatchEvent(new Event('input',{bubbles:true}));window.cues=0;const play=PraxisSound.play;PraxisSound.play=name=>{if(name==='event'&&PraxisSound.enabled)window.cues++;play(name);};PraxisSound.setEnabled(true);});
   await page.locator('#measure-play').click();await page.clock.runFor(1200);
   await page.locator('#measure-play').click();const paused=await page.locator('#measure-readout').textContent();await page.clock.runFor(1000);assert.equal(await page.locator('#measure-readout').textContent(),paused);
   await page.locator('#measure-play').click();await selectTab('cotidian');const hiddenTime=await page.locator('#measure-readout').textContent();await page.clock.runFor(5000);assert.equal(await page.locator('#measure-readout').textContent(),hiddenTime);
   await selectTab('masurare');await page.clock.runFor(9200);
   assert.equal(await page.locator('#measure-results tr').count(),1);
   const cells=await page.locator('#measure-results td').allTextContents();assert.deepEqual(cells.slice(0,5),['0.5','10','10','1','1']);
   assert.equal(await page.evaluate(()=>window.cues),10);
   await page.locator('#measure-reset').click();assert.match(await page.locator('#measure-readout').textContent(),/t = 0 s/);
   await page.evaluate(()=>PraxisSound.setEnabled(false));await page.locator('#measure-play').click();await page.clock.runFor(10200);assert.equal(await page.evaluate(()=>window.cues),10);
   await page.evaluate(()=>PraxisI18n.setLanguage('ro'));assert.equal(await page.locator('#measure-results tr').count(),2);
   await page.locator('.site-board-button').click();assert.equal(await page.locator('#measure-reset').isVisible(),true);await page.locator('.site-board-button').click();
   await page.locator('a[href*="chapter=1"]').click();await page.waitForURL('**/#capitol/miscare');assert.ok(await page.locator('a[href*="miscarea-circulara-uniforma/index.html"]').count());
   await page.goto('http://praxis.test/?home=1');assert.ok(await page.locator('a[href*="miscarea-circulara-uniforma/index.html"]').count());
  }
  report.push({width,height,dpr,tabs:9,languages:['ro','en'],text200:true});await context.close();
 }
 assert.deepEqual(errors,[]);await writeFile(path.join(out,'browser-check.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors}));
}finally{await browser.close();}
