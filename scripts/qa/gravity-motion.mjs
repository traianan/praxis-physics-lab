import {chromium} from 'playwright-core';
import {createServer} from '../serve.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {questions,problems} from '../../public/simulari/miscarea-in-camp-gravitational/content.js';
const out='outputs/gravity-motion';await mkdir(out,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,route='/simulari/miscarea-in-camp-gravitational/index.html';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={layouts:[],actions:[],errors:[],failedResources:[]},ids=['lab','theory','compare','energy','problems','quiz','map'];
try{
 for(const [w,h,dpr]of [[1366,768,1],[390,844,3],[1024,768,1],[1920,1080,2],[3840,2160,1]]){
  const c=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:w===390,isMobile:w===390}),p=await c.newPage();p.setDefaultTimeout(12000);
  p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.failedResources.push(r.url());});
  await p.goto(base+route);await p.waitForFunction(()=>window.PraxisGravityMotion&&document.querySelector('.praxis-site-header'));
  const consent=p.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
  const tab=id=>p.evaluate(id=>PraxisGravityMotion.setTab(id),id),snap=()=>p.evaluate(()=>PraxisGravityMotion.snapshot());
  const input=async(id,value)=>p.locator('#'+id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
  for(const size of [100,200])for(const lang of ['ro','en']){
   await p.evaluate(async({size,lang})=>{document.documentElement.style.fontSize=16*size/100+'px';await PraxisI18n.setLanguage(lang);window.dispatchEvent(new Event('resize'));},{size,lang});
   for(const id of ids){await tab(id);await p.waitForTimeout(70);const layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,math:document.querySelectorAll('.science-math-error').length,visible:document.querySelector('[role=tabpanel]:not([hidden])').id,untranslated:document.querySelector('[role=tabpanel]:not([hidden])').innerText.split('\n').filter(t=>/[ăâșțîĂÂȘȚÎ]/.test(t))}));report.layouts.push({w,h,size,lang,id,...layout});assert.ok(layout.overflow<=1,JSON.stringify(report.layouts.at(-1)));assert.equal(layout.math,0);assert.equal(layout.visible,id);if(lang==='en')assert.deepEqual(layout.untranslated,[],`${id} English text`);if(id==='theory'){for(let topic=0;topic<6;topic++){await p.locator('#theory-topic').selectOption(String(topic));const check=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,text:document.querySelector('#theory article:not([hidden])').innerText}));assert.ok(check.overflow<=1);if(lang==='en')assert.ok(!/[ăâșțîĂÂȘȚÎ]/.test(check.text));}await p.locator('#theory-topic').selectOption('0');}}
  }
  await p.evaluate(async()=>{document.documentElement.style.fontSize='16px';await PraxisI18n.setLanguage('ro');window.dispatchEvent(new Event('resize'));});await tab('lab');
  if(w===1366||w===390){for(const id of ids){await tab(id);await p.screenshot({path:`${out}/${id}-${w}.png`,fullPage:true});}await tab('lab');}
  if(w===1366){
   await p.locator('#gravity').selectOption('10');
   for(const mode of ['fall','down','up','horizontal','oblique']){await p.locator('#mode').selectOption(mode);await p.locator('#impact').click();const s=await snap();assert.equal(s.result.y,0);assert.equal(s.time,s.flight.duration);await p.screenshot({path:`${out}/mode-${mode}.png`,fullPage:true});}
   await p.locator('#mode').selectOption('oblique');await p.locator('#apex').click();assert.ok(Math.abs((await snap()).result.vy)<1e-8);assert.ok((await snap()).result.vx>0);
   const before=await snap();await p.locator('#envelope').uncheck();assert.equal((await snap()).time,before.time);await p.locator('#envelope').check();assert.ok(await p.locator('#scene [stroke-dasharray]').count()>0);await p.locator('#graph').selectOption('vy');assert.equal((await snap()).time,before.time);
   await p.locator('#reset').click();await p.locator('#play').click();await p.waitForTimeout(250);await p.locator('#play').click();const t=(await snap()).time;assert.ok(t>0);await p.waitForTimeout(100);assert.equal((await snap()).time,t);await p.locator('#step').click();assert.ok((await snap()).time>t);await p.locator('#play').click();await tab('theory');const hidden=(await snap()).time;await p.waitForTimeout(180);assert.equal((await snap()).time,hidden);await tab('lab');await p.locator('#reset').click();
   await input('timeline',500);assert.ok(Math.abs((await snap()).time-(await snap()).flight.duration/2)<1e-8);
   await p.evaluate(()=>PraxisI18n.setLanguage('en'));assert.equal((await snap()).time,(await snap()).flight.duration/2);
   await tab('compare');await p.locator('#comparison').selectOption('horizontal');await input('compare-time',700);let cmp=(await snap()).comparison;assert.ok(Math.abs(cmp[0].result.y-cmp[1].result.y)<1e-8);
   await p.locator('#comparison').selectOption('angles');await input('compare-height',0);cmp=(await snap()).comparison;assert.ok(Math.abs(cmp[0].range-cmp[1].range)<1e-8);await input('compare-height',20);cmp=(await snap()).comparison;assert.ok(Math.abs(cmp[0].range-cmp[1].range)>1);
   await p.locator('#compare-play').click();await p.waitForTimeout(200);await p.locator('#compare-play').click();assert.ok((await snap()).compareTime>0);await p.locator('#compare-reset').click();assert.equal((await snap()).compareTime,0);
   await tab('energy');const e=(await snap()).result.energy;await input('mass',2);assert.ok(Math.abs((await snap()).result.energy-2*e)<1e-8);await p.locator('#measure').click();assert.equal((await snap()).measurements.length,1);const dl=p.waitForEvent('download');await p.locator('#export').click();assert.equal((await dl).suggestedFilename(),'miscarea-in-camp-gravitational-masuratori.csv');await p.evaluate(()=>PraxisI18n.setLanguage('ro'));assert.equal((await snap()).measurements.length,1);await p.locator('#clear').click();assert.equal((await snap()).measurements.length,0);
   await tab('problems');for(let i=0;i<problems.length;i++){await p.locator(`#answer-${i}`).fill(String(problems[i][2]));await p.locator(`[data-check="${i}"]`).click();assert.equal(await p.locator(`#feedback-${i}`).textContent(),'Corect.');}await p.locator('#answer-0').fill('');await p.locator('[data-check="0"]').click();assert.match(await p.locator('#feedback-0').textContent(),/finit/);
   await tab('quiz');await p.locator('#quiz-form button[type=submit]').click();assert.equal(await p.locator('#quiz-score').textContent(),'0 / 7');for(let i=0;i<questions.length;i++)await p.locator(`input[name=q${i}][value="${questions[i][2]}"]`).check();await p.locator('#quiz-form button[type=submit]').click();assert.equal(await p.locator('#quiz-score').textContent(),'7 / 7');await p.locator('#quiz-reset').click();assert.equal(await p.locator('#quiz-form input:checked').count(),0);
   await tab('map');await p.locator('[data-concept="5"]').click();await p.locator('#concept-detail a').click();assert.equal((await snap()).active,'energy');
   await tab('lab');await p.locator('#tab-lab').focus();await p.keyboard.press('ArrowRight');assert.equal((await snap()).active,'theory');
   await p.emulateMedia({reducedMotion:'reduce'});await tab('lab');assert.ok(await p.locator('#play').isDisabled());await p.locator('#reset').click();await p.locator('#step').click();assert.ok((await snap()).time>0);await p.emulateMedia({reducedMotion:'no-preference'});
   report.actions.push('Five modes, envelope, graph, play/pause/step/reset, hidden-tab suspension, scrubbing, comparison, energy/mass, measurements/CSV, six problems, quiz 0/7 and 7/7, concept links, keyboard, reduced motion');
  }
  if(w===390){await p.locator('#step').tap();assert.ok((await snap()).time>0);await p.locator('#height').scrollIntoViewIfNeeded();const b=await p.locator('#height').boundingBox();const cd=await c.newCDPSession(p);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width*.3,y:b.y+b.height/2}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok((await snap()).settings.height>0);report.actions.push('Mobile emulated touch button and slider');}
  await c.close();console.log(w,'passed');
 }
 for(const width of [1366,390]){
  const c=await browser.newContext({viewport:{width,height:844}}),p=await c.newPage(),requests=[];p.on('pageerror',e=>report.errors.push(e.message));await p.route(/^https?:/,r=>{requests.push(r.request().url());return r.abort();});
  await p.goto(pathToFileURL(path.resolve('outputs/offline-lessons/miscarea-in-camp-gravitational/index.html')).href);await p.waitForFunction(()=>window.PraxisGravityMotion&&document.getElementById('praxis-lesson-title'));
  const consent=p.locator('[data-privacy-choice=necessary]');if(await consent.isVisible())await consent.click();
  for(const lang of ['ro','en']){await p.evaluate(lang=>PraxisI18n.setLanguage(lang),lang);for(const id of ids){await p.evaluate(id=>PraxisGravityMotion.setTab(id),id);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}await p.evaluate(()=>PraxisGravityMotion.setTab('lab'));await p.locator('#apex').click();assert.ok(Math.abs((await p.evaluate(()=>PraxisGravityMotion.snapshot())).result.vy)<1e-8);}
  assert.deepEqual(requests,[]);await p.screenshot({path:`${out}/offline-${width}.png`,fullPage:true});await c.close();report.actions.push(`Offline file:// ${width}px, seven tabs RO/EN, envelope/graph, no HTTP`);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);
}finally{await writeFile(out+'/report.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
