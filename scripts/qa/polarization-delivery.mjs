import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.PRAXIS_QA_BASE||'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),report={errors:[],requests:[],checks:[]};
try{
 const c=await browser.newContext({viewport:{width:1366,height:768}}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base+'/?home=1');const consent=p.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
 const lesson='a[href="./simulari/polarizarea-luminii/index.html"]';await p.locator(lesson).first().click();await p.waitForFunction(()=>window.PraxisPolarization);assert.match(p.url(),/polarizarea-luminii/);
 await p.locator('.site-board-button').click();assert.equal(await p.locator('.site-board-button').getAttribute('aria-pressed'),'true');await p.locator('#three').click();assert.ok(Math.abs((await p.evaluate(()=>PraxisPolarization.snapshot())).result.output-12.5)<1e-9);await p.locator('.site-board-button').click();assert.equal(await p.locator('.site-board-button').getAttribute('aria-pressed'),'false');
 assert.equal(await p.evaluate(()=>PraxisSound.enabled),false);await p.locator('[data-praxis-sound]').click();assert.equal(await p.evaluate(()=>PraxisSound.enabled),true);await p.locator('#measure').click();
 await p.locator('.praxis-lab-path a').nth(1).click();await p.waitForURL(/capitol\/lumina-si-radiatii/);await p.reload();await p.locator(lesson+':visible').first().waitFor();await p.locator(lesson+':visible').first().click();await p.waitForFunction(()=>window.PraxisPolarization);assert.equal(await p.evaluate(()=>PraxisSound.enabled),true);await p.locator('[data-praxis-sound]').click();assert.equal(await p.evaluate(()=>PraxisSound.enabled),false);
 await p.locator('.praxis-lab-path a').first().click();await p.waitForFunction(()=>!location.pathname.includes('simulari'));report.checks.push('Home entry, chapter entry and reload, breadcrumbs, Board mode, audio session continuity and mute');
 await p.goto(base+'/simulari/polarizarea-luminii/index.html#states');await p.waitForFunction(()=>window.PraxisPolarization);assert.equal(await p.evaluate(()=>PraxisPolarization.snapshot().active),'states');await p.locator('#circular').click();await p.reload();await p.waitForFunction(()=>window.PraxisPolarization);assert.equal(await p.evaluate(()=>PraxisPolarization.snapshot().active),'states');
 await p.evaluate(()=>PraxisPolarization.setTab('theory'));await p.locator('#theory details summary').click();await p.locator('[data-related]').click();assert.match(p.url(),/oglinzi-si-lentile/);report.checks.push('Direct section URL and related lesson link');await c.close();
 for(const width of [1366,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},hasTouch:width===390}),page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.route(/^https?:/,route=>{report.requests.push(route.request().url());return route.abort();});
  await page.goto(pathToFileURL(path.resolve('outputs/offline-lessons/polarizarea-luminii/index.html')).href);await page.waitForFunction(()=>window.PraxisPolarization&&document.getElementById('praxis-lesson-title'));
  const choice=page.locator('[data-privacy-choice=necessary]');if(await choice.isVisible())await choice.click();
  for(const lang of ['ro','en']){await page.evaluate(lang=>PraxisI18n.setLanguage(lang),lang);for(const tab of ['lab','theory','states','brewster','problems','quiz','map']){await page.evaluate(id=>PraxisPolarization.setTab(id),tab);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}await page.evaluate(()=>PraxisPolarization.setTab('lab'));await page.locator('#three').click();assert.ok(Math.abs(await page.evaluate(()=>PraxisPolarization.snapshot().result.output)-12.5)<1e-9);await page.locator('#step').click();assert.ok(await page.evaluate(()=>PraxisPolarization.snapshot().time)>0);}
  assert.equal(await page.locator('[data-related]').isVisible(),false);await page.screenshot({path:`outputs/polarization-review/offline-${width}.png`,fullPage:true});report.checks.push(`Offline file:// ${width}px, seven sections RO/EN, presets and step, no HTTP dependencies`);await ctx.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[]);console.log(report.checks.join('\n'));
}finally{await writeFile((process.env.PRAXIS_QA_OUTPUT||'outputs/polarization-review')+'/delivery.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
