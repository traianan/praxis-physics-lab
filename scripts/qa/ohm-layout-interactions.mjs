import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),base=process.env.PRAXIS_QA_BASE||'http://127.0.0.1:4193';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},hasTouch:true});
const report={accessibility:[],interactions:{},board:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
try {
const wait=()=>page.waitForTimeout(140),tab=async id=>{await page.locator('#lesson-tab-'+id).click();await wait();await page.evaluate(()=>scrollTo(0,0));};
report.network=[];if(base.startsWith('file:'))await page.route(/^https?:/,r=>{report.network.push(r.request().url());return r.abort();});
await page.goto(base.startsWith('file:')?base+'/index.html':base+'/simulari/legea-lui-ohm/');await page.getByRole('button',{name:'Doar necesare',exact:true}).click({timeout:800}).catch(()=>{});
await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
if(!process.env.PRAXIS_QA_INTERACTIONS_ONLY)for(const language of ['ro','en']){
 await page.evaluate(l=>PraxisI18n.setLanguage(l),language);
 const ids=await page.locator('.lesson-tab').evaluateAll(es=>es.map(e=>e.id));
 for(const id of ids){await page.locator('#'+id).click();await wait();const count=await page.locator('.ohm-page-tabs button').count();
  for(let view=0;view<Math.max(1,count);view++){
   if(count){await page.locator('.ohm-page-tabs button').nth(view).click();await wait();}
   await page.locator('.lesson-tab-panel details').evaluateAll(es=>es.forEach(e=>e.open=true));
   const r=await page.evaluate(()=>axe.run(document));const violations=r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
   report.accessibility.push({language,id,view,violations});console.log('axe',language,id,view,JSON.stringify(violations));
  }
 }
}
await page.reload();await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>PraxisI18n.setLanguage('ro'));await page.waitForTimeout(300);
const dragPage=await browser.newPage({viewport:{width:1920,height:1080},hasTouch:true});
if(base.startsWith('file:'))await dragPage.route(/^https?:/,r=>{report.network.push(r.request().url());return r.abort();});
await dragPage.goto(base.startsWith('file:')?base+'/index.html':base+'/simulari/legea-lui-ohm/');await dragPage.getByRole('button',{name:'Doar necesare',exact:true}).click({timeout:800}).catch(()=>{});await dragPage.evaluate(()=>document.fonts.ready);
const canvas=dragPage.locator('.ui-canvas'),before=await canvas.getAttribute('aria-label'),box=await canvas.boundingBox(),cdp=await dragPage.context().newCDPSession(dragPage);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*.25,y:box.y+box.height*.5}]});for(const fraction of [.35,.45,.55,.65])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*fraction,y:box.y+box.height*.5}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await dragPage.waitForTimeout(300);assert.notEqual(await canvas.getAttribute('aria-label'),before);report.interactions.touchDrag=true;await dragPage.close();
const record=page.getByRole('button',{name:'Înregistrează punctul',exact:true});await record.tap();await page.waitForFunction(()=>document.querySelector('.lab-link-button')?.textContent.includes('(1)'));await page.waitForTimeout(300); 
await page.locator('.ohm-page-tabs button').nth(2).tap();await wait();await page.locator('.data-table-card tbody tr').first().waitFor();assert.equal(await page.locator('.data-table-card tbody tr').count(),1);await page.locator('.ohm-page-tabs button').nth(0).click();report.interactions.recordRetained=true;
await page.locator('.ohm-page-tabs button').nth(0).focus();await page.keyboard.press('ArrowRight');await wait();assert.equal(await page.locator('.ohm-page-tabs button').nth(1).getAttribute('aria-selected'),'true');report.interactions.keyboard=true;
await tab('circuit');await page.getByRole('button',{name:'Scurtcircuit',exact:true}).click();await page.locator('.ohm-page-tabs button').nth(1).click();await wait();assert.match(await page.locator('.circuit-metrics').textContent(),/tensiunea la borne0 mV/);await page.locator('.ohm-page-tabs button').nth(0).click();await wait();assert.match(await page.locator('.circuit-schematic-head').first().textContent(),/scurtcircuit/);report.interactions.circuitState=true;
await tab('reostat');await page.getByRole('button',{name:'Montaj potențiometric',exact:true}).click();await page.locator('.ohm-page-tabs button').nth(1).click();await page.locator('.ohm-page-tabs button').nth(0).click();await wait();assert.equal(await page.getByRole('button',{name:'Montaj potențiometric',exact:true}).getAttribute('aria-pressed'),'true');report.interactions.rheostatState=true;
await tab('masurari');for(const mode of await page.locator('.measure-mode button').all()){await mode.tap();for(const preset of await page.locator('.measure-presets button').all())await preset.tap();}report.interactions.measureModes=2;report.interactions.measurePresets=6;
await tab('evaluare');for(const button of await page.locator('.ohm-problem-choices button').all()){await button.tap();await wait();assert.equal(await page.locator('.problem.is-open').count(),1);assert.ok((await page.locator('.problem-body').textContent()).length>100);}report.interactions.problems=6;
await tab('calculatoare');for(const button of await page.locator('.calculator-tabs button').all()){await button.click();await wait();assert.doesNotMatch(await page.locator('.calculator-results').textContent(),/NaN|Infinity/);}report.interactions.calculators=4;
await tab('verificare');for(let i=0;i<10;i++){await page.locator('.quiz-option').first().tap();await page.getByRole('button',{name:'Verifică răspunsul',exact:true}).click();await page.getByRole('button',{name:i===9?'Vezi rezultatul':'Următoarea întrebare',exact:true}).click();}assert.equal(await page.locator('.quiz-result').count(),1);await page.getByRole('button',{name:'Reia testul',exact:true}).click();assert.equal(await page.locator('.quiz-option').count(),4);report.interactions.quiz=10;
// Internal resources links must activate their target, including the separated quiz.
await tab('resurse');await page.getByRole('link',{name:'Începe testul',exact:true}).click();await wait();assert.equal(await page.locator('#lesson-tab-verificare').getAttribute('aria-selected'),'true');report.interactions.resourceNavigation=true;
for(const width of [1920,3840]){await page.setViewportSize({width,height:width===1920?1080:2160});for(const language of ['ro','en'])for(const size of [100,200])for(const id of ['laborator','circuit','reostat','masurari']){
 await page.evaluate(async({language,size})=>{await PraxisI18n.setLanguage(language);const s=document.querySelector('.praxis-course-settings select');s.value=String(size);s.dispatchEvent(new Event('change'));PraxisCourseLocalization.setTouch(true);},{language,size});await tab(id);
 const state=await page.evaluate(()=>{const opened=PraxisWhiteboard.open(document.querySelector('.site-board-button,#board-mode'));return {opened,native:document.body.hasAttribute('data-praxis-adaptive-lab')};});await wait();
 const outside=await page.evaluate(()=>[...document.querySelectorAll('.lesson-tab-panel :is(canvas,button,input[type=range])')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left<-.5||r.right>innerWidth+.5||(document.querySelector('.praxis-course-settings select').value==='100'&&(r.top<-.5||r.bottom>innerHeight+.5)))}).map(e=>e.className));
 report.board.push({width,language,size,id,...state,outside});await page.evaluate(()=>PraxisWhiteboard.close());
}}
await writeFile('outputs/ohm-layout/'+(base.startsWith('file:')?'offline-report':'interactions-report')+'.json',JSON.stringify(report,null,2));
assert.ok(report.accessibility.every(r=>!r.violations.length),'accessibility violations');assert.ok(report.board.every(r=>(r.opened||r.native)&&!r.outside.length),'board bounds');assert.deepEqual(report.errors,[]);assert.deepEqual(report.network,[]);console.log('PASS',JSON.stringify(report.interactions),'axe states',report.accessibility.length,'board states',report.board.length);

} finally { await browser.close(); }
