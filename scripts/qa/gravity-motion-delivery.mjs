import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),report={errors:[],checks:[]};
try{
 const p=await browser.newPage({viewport:{width:1366,height:768}});p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base+'/?home=1');const consent=p.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
 const lesson='a[href="./simulari/miscarea-in-camp-gravitational/index.html"]';await p.locator(lesson).first().click();await p.waitForFunction(()=>window.PraxisGravityMotion&&document.querySelector('.praxis-site-header'));
 assert.equal(await p.locator('#mode').inputValue(),'oblique');
 const fit=await p.locator('#lab .gm-workspace').boundingBox();assert.ok(fit.y+fit.height<=768,JSON.stringify(fit));
 const canvas=await p.locator('#plot canvas').evaluate(c=>({buffer:c.width,css:c.getBoundingClientRect().width}));assert.ok(canvas.buffer/canvas.css>=1.98,JSON.stringify(canvas));
 await p.locator('.site-board-button').click();assert.equal(await p.locator('.site-board-button').getAttribute('aria-pressed'),'true');await p.locator('#apex').click();assert.ok(Math.abs((await p.evaluate(()=>PraxisGravityMotion.snapshot())).result.vy)<1e-8);await p.screenshot({path:'outputs/gravity-motion/board.png',fullPage:true});await p.locator('.site-board-button').click();
 assert.equal(await p.evaluate(()=>PraxisSound.enabled),false);await p.locator('[data-praxis-sound]').click();assert.equal(await p.evaluate(()=>PraxisSound.enabled),true);
 await p.locator('.praxis-lab-path a').nth(1).click();await p.waitForURL(/capitol\/miscare/);await p.reload();await p.locator(lesson+':visible').first().click();await p.waitForFunction(()=>window.PraxisGravityMotion);assert.equal(await p.evaluate(()=>PraxisSound.enabled),true);await p.locator('[data-praxis-sound]').click();assert.equal(await p.evaluate(()=>PraxisSound.enabled),false);
 await p.locator('.praxis-lab-path a').first().click();await p.waitForFunction(()=>!location.pathname.includes('simulari'));report.checks.push('Home entry, chapter/reload, breadcrumbs, Board mode, audio continuity and mute, desktop workspace fit, canvas sampling');
 await p.goto(base+'/simulari/miscarea-in-camp-gravitational/index.html#energy');await p.waitForFunction(()=>window.PraxisGravityMotion);assert.equal(await p.evaluate(()=>PraxisGravityMotion.snapshot().active),'energy');await p.reload();await p.waitForFunction(()=>window.PraxisGravityMotion);assert.equal(await p.evaluate(()=>PraxisGravityMotion.snapshot().active),'energy');
 await p.evaluate(()=>PraxisGravityMotion.setTab('theory'));await p.locator('#theory-topic').selectOption('5');await p.locator('[data-related]').click();assert.match(p.url(),/mecanica-cereasca/);report.checks.push('Direct tab URL/reload and related lesson');
 await p.setViewportSize({width:390,height:844});await p.goto(base+'/simulari/miscarea-in-camp-gravitational/index.html');await p.waitForFunction(()=>window.PraxisGravityMotion&&document.querySelector('.praxis-course-sections'));
 await p.locator('.praxis-course-sections').selectOption('compare');assert.equal(await p.evaluate(()=>PraxisGravityMotion.snapshot().active),'compare');await p.locator('.praxis-course-sections').selectOption('lab');
 await p.locator('#mode').selectOption('oblique');await p.locator('#height').evaluate(e=>{e.value=80;e.dispatchEvent(new Event('input',{bubbles:true}));});await p.locator('#speed').evaluate(e=>{e.value=40;e.dispatchEvent(new Event('input',{bubbles:true}));});await p.locator('#gravity').selectOption('1.62');await p.locator('#impact').click();await p.waitForTimeout(150);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:'outputs/gravity-motion/extreme-mobile.png',fullPage:true});
 const expected=(await p.evaluate(()=>PraxisGravityMotion.snapshot())).time;await p.evaluate(()=>PraxisI18n.setLanguage('en'));assert.equal(await p.evaluate(()=>PraxisGravityMotion.snapshot().time),expected);report.checks.push('Mobile section selector and extreme lunar flight, state preservation');
 assert.deepEqual(report.errors,[]);console.log(report.checks.join('\n'));
}finally{await writeFile('outputs/gravity-motion/delivery.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
