/** Browser regression for whiteboard engines without :has/container queries.
 * Feature removal reproduces CSS rejection; it does not emulate an old engine. */
import assert from 'node:assert/strict';import {mkdir,readFile,writeFile} from 'node:fs/promises';import {fileURLToPath,pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PRAXIS_PLAYWRIGHT_MODULE?pathToFileURL(process.env.PRAXIS_PLAYWRIGHT_MODULE).href:'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});const report={date:'2026-11-04',cases:[],errors:[],passed:false};
const base=process.env.PRAXIS_WAVES_URL||'http://127.0.0.1:4199';
const offline=process.argv.includes('--offline');
const target=offline?new URL('../../outputs/offline-lessons/unde-mecanice/index.html',import.meta.url).href:base+'/simulari/unde-mecanice/index.html';
report.target=target;
await mkdir(new URL('../../outputs/',import.meta.url),{recursive:true});
const controlsAudit=await readFile(new URL('./waves-controls.browser.js',import.meta.url),'utf8');
report.interactions=[];
function rejectUnsupportedCSS(){const removed=[];function scan(owner){let rules;try{rules=owner.cssRules;}catch{return;}for(let i=rules.length-1;i>=0;i--){const rule=rules[i];if(rule.selectorText?.includes(':has(')||rule.constructor.name==='CSSContainerRule'){removed.push(rule.cssText.slice(0,180));owner.deleteRule(i);}else if(rule.cssRules)scan(rule);}}for(const sheet of document.styleSheets)scan(sheet);return removed.length;}
try{
 for(const [width,height,dpr,touch]of [[1920,1080,1,true],[3840,2160,1,true],[1920,1080,2,true],[1366,768,1,false],[1024,768,1,true],[390,844,1,true]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:touch}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(target);await page.waitForSelector('#clasificare .lesson-part-content');
  for(const legacy of [false,true]){const removed=legacy?await page.evaluate(rejectUnsupportedCSS):0;for(const size of [100,200]){
   const result=await page.evaluate(async({size})=>{document.documentElement.style.fontSize=16*size/100+'px';window.dispatchEvent(new Event('resize'));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const section=document.getElementById('clasificare'),main=section.closest('main'),shell=main.parentElement,rect=section.getBoundingClientRect(),parent=shell.getBoundingClientRect();return {sectionWidth:rect.width,shellWidth:parent.width,ratio:rect.width/parent.width,columns:getComputedStyle(shell).gridTemplateColumns,display:getComputedStyle(shell).display,overflow:document.documentElement.scrollWidth>innerWidth+1};},{size});
   report.cases.push({width,height,dpr,touch,legacy,size,removed,...result});assert.ok(result.ratio>.85,`narrow left column: ${JSON.stringify(report.cases.at(-1))}`);assert.ok(!result.overflow,`horizontal overflow ${width}/${size}/${legacy}`);
  }
   if(width===1920&&dpr===1){
    await page.evaluate(()=>document.documentElement.style.fontSize='16px');
    const audit=await page.evaluate('('+controlsAudit+')()');
    report.interactions.push({legacy,...audit});
    assert.deepEqual(audit.errors,[],'formula errors');
    assert.deepEqual(audit.overflow,[],'activity page overflow');
    await page.evaluate(()=>{location.hash='clasificare';document.querySelector('#clasificare .lesson-parts button').click();});
    const activity=page.locator('#clasificare .lesson-parts button').nth(1);
    await activity.tap();assert.equal(await activity.getAttribute('aria-selected'),'true');
    await page.locator('#clasificare .lesson-parts button').first().tap();
    await page.screenshot({path:fileURLToPath(new URL(`../../outputs/waves-layout-${offline?'offline-':''}${legacy?'fallback':'modern'}.png`,import.meta.url))});
   }
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);report.passed=true;
}catch(error){report.error=error.stack;process.exitCode=1;}finally{await writeFile(new URL(`../../outputs/waves-legacy-layout-${offline?'offline-':''}qa.json`,import.meta.url),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(report,null,2));
