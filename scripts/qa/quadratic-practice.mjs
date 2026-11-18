import {chromium} from 'playwright-core';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const base=process.env.PRAXIS_QA_BASE||'http://127.0.0.1:4193',offline=process.env.PRAXIS_QA_OFFLINE==='1',out=process.env.PRAXIS_QA_REPORTDIR||'outputs/practice-review';
await mkdir(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),report={layouts:[],errors:[],http:[],checks:[]};
const assert=(v,m)=>{if(!v)throw Error(m);report.checks.push(m);};
try{
 for(const [width,height,dpr]of offline?[[1920,1080,2]]:[[1920,1080,2],[3840,2160,1],[1366,768,1],[1024,768,1],[390,844,1]]){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  if(offline)await p.route(/^https?:/,r=>{report.http.push(r.request().url());return r.abort();});
  await p.goto(offline?pathToFileURL(path.resolve('outputs/offline-lessons/functia-gradul-al-doilea/index.html')).href:base+'/simulari/functia-gradul-al-doilea/index.html');
  await p.getByRole('button',{name:'Doar necesare',exact:true}).click({timeout:700}).catch(()=>{});
  if(await p.locator('[data-tab=exerseaza]').isVisible())await p.locator('[data-tab=exerseaza]').click();
  else await p.locator('.praxis-course-sections').selectOption('exerseaza');
  assert(await p.locator('#tab-exerseaza.active').count()===1,'practice tab opens '+width);
  await p.evaluate(()=>PraxisCourseLocalization.setTouch(true));
  if(width===1920){
   await p.locator('.practice-actions button').first().click();assert(await p.locator('.practice-feedback p').count()===0,'empty answers do not reveal solutions');
   await p.locator('input[type=radio][name=practice-0][value="2"]').check();await p.locator('#practice-answer-1').fill('4 m');await p.locator('.practice-actions button').first().click();
   assert(await p.locator('[data-result=incorrect]').count()===1&&await p.locator('[data-result=invalid]').count()===1,'wrong choice and invalid numeric feedback');
   await p.locator('#practice-answer-1').fill('8/2');assert(await p.locator('#practice-answer-1').getAttribute('aria-invalid')===null,'editing clears invalid state');
   await p.locator('input[name=practice-0][value="0"]').check();await p.locator('.practice-actions button').first().click();
   await p.evaluate(()=>PraxisI18n.setLanguage('en'));assert(await p.locator('#practice-answer-1').inputValue()==='8/2'&&await p.locator('[data-result=correct]').count()===2,'language retains answers and feedback');
   await p.locator('[data-tab=teorie]').click();await p.locator('[data-tab=exerseaza]').click();assert(await p.locator('#practice-answer-1').inputValue()==='8/2','tab navigation retains answers');
   await p.locator('#practice-answer-1').focus();await p.keyboard.press('Enter');assert(await p.locator('[data-result=correct]').count()===2,'Enter checks answer');
   await p.evaluate(()=>PraxisI18n.setLanguage('ro'));
  }
  for(const language of ['ro','en'])for(const scale of [100,200]){
   await p.evaluate(async({language,scale})=>{await PraxisI18n.setLanguage(language);const size=document.querySelector('.praxis-course-settings select');size.value=String(scale);size.dispatchEvent(new Event('change'));},{language,scale});
   for(let page=0;page<6;page++){
    await p.locator('.practice-pages button').nth(page).click();
    for(let i=page*2;i<page*2+2;i++){const item=await p.evaluate(i=>{const q=QuadraticPractice.bank[i];return{answer:q.answer,options:!!q.options};},i);if(item.options)await p.locator(`input[name=practice-${i}][value="${item.answer}"]`).check();else await p.locator('#practice-answer-'+i).fill(String(item.answer).replace('-','−'));}
    await p.locator('.practice-actions button').first().click();await p.evaluate(()=>scrollTo(0,0));
    const row=await p.evaluate(()=>{const root=document.querySelector('#quadratic-practice');return{overflow:document.documentElement.scrollWidth>innerWidth+1,bottom:root.getBoundingClientRect().bottom,correct:root.querySelectorAll('[data-result=correct]').length,small:[...root.querySelectorAll('button,.practice-options label,input[type=text]')].filter(e=>e.getBoundingClientRect().height<43).map(e=>e.tagName),questionSize:parseFloat(getComputedStyle(root.querySelector('legend')).fontSize)};});
    report.layouts.push({width,height,dpr,language,scale,page,...row});assert(!row.overflow&&row.correct===2,'pair layout and grading '+[width,language,scale,page]);assert(row.questionSize===16*scale/100,'shared question typography');assert(!row.small.length,'touch targets');if(width>=1920&&scale===100)assert(row.bottom<=height+1,'pair and explanations fit board');
    if(width>=1920&&language==='ro'&&scale===100&&page===4)await p.screenshot({path:path.join(out,'board-'+width+'.png')});
   }
  }
  assert((await p.locator('[data-practice-score]').textContent()).includes('12/12'),'all twelve correct answers counted '+width);
  if(width>=1920)await p.screenshot({path:path.join(out,'practice-'+width+'.png')});
  await p.locator('.practice-actions button').nth(1).click();assert(await p.locator('[data-result]').count()===0&&await p.locator('#quadratic-practice input:checked').count()===0,'reset clears answers and feedback '+width);
  await ctx.close();
 }
 assert(!report.errors.length,'no JavaScript errors');assert(!report.http.length,'offline makes no HTTP requests');
}finally{await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
console.log('Practice:',report.layouts.length,'layout states;',report.checks.length,'checks passed');
