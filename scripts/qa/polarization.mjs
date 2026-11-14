import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {questions} from '../../public/simulari/polarizarea-luminii/content.js';
const out=process.env.PRAXIS_QA_OUTPUT||'outputs/polarization-review';await mkdir(out,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.PRAXIS_QA_BASE||'http://127.0.0.1:'+server.address().port,route='/simulari/polarizarea-luminii/index.html';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={layouts:[],actions:[],errors:[],failedResources:[]},ids=['lab','theory','states','brewster','problems','quiz','map'];
try{
 for(const [w,h,dpr]of [[3840,2160,1],[1920,1080,2],[1366,768,1],[1024,768,1],[390,844,3]]){
  const c=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:w===390,isMobile:w===390}),p=await c.newPage();p.setDefaultTimeout(12000);
  p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.failedResources.push(r.url());});
  await p.goto(base+route);await p.waitForFunction(()=>window.PraxisPolarization&&document.querySelector('.praxis-site-header'));
  const consent=p.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
  const tab=id=>p.evaluate(id=>PraxisPolarization.setTab(id),id),snap=()=>p.evaluate(()=>PraxisPolarization.snapshot());
  for(const size of [100,200])for(const lang of ['ro','en']){
   await p.evaluate(async({size,lang})=>{document.documentElement.style.fontSize=16*size/100+'px';await PraxisI18n.setLanguage(lang);window.dispatchEvent(new Event('resize'));},{size,lang});
   for(const id of ids){await tab(id);await p.waitForTimeout(80);const layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,math:document.querySelectorAll('.science-math-error').length,width:document.getElementById('praxis-original').getBoundingClientRect().width,visible:document.querySelector('[role=tabpanel]:not([hidden])').id,untranslated:document.querySelector('[role=tabpanel]:not([hidden])').innerText.split('\n').filter(t=>/[ăâșțîĂÂȘȚÎ]/.test(t))}));report.layouts.push({w,h,size,lang,id,...layout});assert.ok(layout.overflow<=1,JSON.stringify(report.layouts.at(-1)));assert.equal(layout.math,0);assert.equal(layout.visible,id);if(lang==='en')assert.deepEqual(layout.untranslated,[],`${id} English text`);}
  }
  await p.evaluate(async()=>{document.documentElement.style.fontSize='16px';await PraxisI18n.setLanguage('ro');window.dispatchEvent(new Event('resize'));});await tab('lab');
  if(w===1366||w===390){for(const id of ids){await tab(id);await p.screenshot({path:`${out}/${id}-${w}.png`,fullPage:true});}await tab('lab');}
  if(w===1366){
   await p.locator('#crossed').click();assert.equal((await snap()).result.output,0);await p.locator('#three').click();assert.ok(Math.abs((await snap()).result.output-12.5)<1e-8);await p.locator('#parallel').click();assert.equal((await snap()).result.output,50);await p.locator('#source').selectOption('polarized');assert.equal((await snap()).result.output,100);await p.locator('#reset').click();
   await p.locator('#play').click();await p.waitForTimeout(250);await p.locator('#play').click();assert.ok((await snap()).time>0);const t=(await snap()).time;await p.waitForTimeout(150);assert.equal((await snap()).time,t);await p.locator('#step').click();assert.ok((await snap()).time>t);await p.locator('#play').click();await tab('theory');const hidden=(await snap()).time;await p.waitForTimeout(150);assert.equal((await snap()).time,hidden);await tab('lab');await p.locator('#reset').click();assert.equal((await snap()).time,0);
   await p.locator('#measure').click();assert.equal((await snap()).measurements.length,1);await p.evaluate(()=>PraxisI18n.setLanguage('en'));assert.equal((await snap()).measurements.length,1);await p.locator('#lab details').first().locator('summary').click();const dl=p.waitForEvent('download');await p.locator('#export').click();assert.equal((await dl).suggestedFilename(),'polarizarea-luminii-masuratori.csv');await p.locator('#clear').click();assert.equal((await snap()).measurements.length,0);
   await tab('states');await p.locator('#circular').click();assert.equal(await p.locator('#state-name').textContent(),'Circular');await p.locator('#field-play').click();await p.waitForTimeout(180);await p.locator('#field-play').click();assert.ok((await snap()).fieldTime>0);await p.locator('#elliptical').click();assert.equal(await p.locator('#state-name').textContent(),'Elliptical');await p.locator('#field-reset').click();assert.equal((await snap()).fieldTime,0);
   await tab('brewster');await p.locator('#brewster-preset').click();assert.match(await p.locator('#brewster-status').textContent(),/^At Brewster/);assert.ok(Number((await p.locator('#rp').textContent()).replace('%',''))<.001);
   await tab('problems');for(const [i,v]of [15,60,20,56.3].entries()){await p.locator(`#answer-${i}`).fill(String(v));await p.locator(`[data-check="${i}"]`).click();assert.equal(await p.locator(`#feedback-${i}`).textContent(),'Correct.');}await p.locator('#answer-0').fill('');await p.locator('[data-check="0"]').click();assert.match(await p.locator('#feedback-0').textContent(),/finite/);
   await tab('quiz');await p.locator('#quiz-form button[type=submit]').click();assert.equal(await p.locator('#quiz-score').textContent(),'0 / 7');for(let i=0;i<questions.length;i++)await p.locator(`input[name=q${i}][value="${questions[i][2]}"]`).check();await p.locator('#quiz-form button[type=submit]').click();assert.equal(await p.locator('#quiz-score').textContent(),'7 / 7');await p.evaluate(()=>PraxisI18n.setLanguage('ro'));assert.equal(await p.locator('#quiz-form input:checked').count(),7);await p.locator('#quiz-reset').click();assert.equal(await p.locator('#quiz-form input:checked').count(),0);
   await tab('map');await p.locator('[data-concept="4"]').click();await p.locator('#concept-detail a').click();assert.equal((await snap()).active,'brewster');
   await tab('lab');await p.locator('#tab-lab').focus();await p.keyboard.press('ArrowRight');assert.equal((await snap()).active,'theory');
   await p.emulateMedia({reducedMotion:'reduce'});await tab('lab');assert.ok(await p.locator('#play').isDisabled());const reduced=(await snap()).time;await p.locator('#step').click();assert.ok((await snap()).time>reduced);await p.emulateMedia({reducedMotion:'no-preference'});assert.ok(await p.locator('#play').isEnabled());
   report.actions.push('Presets, source, play/pause/step/reset, hidden-tab suspension, measurements, CSV, field states, Brewster, four problems, quiz 0/7 and 7/7, language preservation, concept links, keyboard');
  }
  if(w===390){await p.locator('#three').tap();assert.ok((await snap()).settings.third);await p.locator('#angle').scrollIntoViewIfNeeded();const b=await p.locator('#angle').boundingBox();const cd=await c.newCDPSession(p);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width*.3,y:b.y+b.height/2}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.notEqual((await snap()).settings.angle,90);report.actions.push('Mobile emulated touch preset and slider');}
  await c.close();console.log(w,'passed');
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);
}finally{await writeFile(out+'/report.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
