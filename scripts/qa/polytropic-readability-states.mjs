import {chromium} from 'playwright-core';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from '../serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'}),report=[];
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/simulari/transformarea-politropa/index.html`);
 const consent=page.getByRole('button',{name:'Doar necesare',exact:true});if(await consent.isVisible())await consent.click();
 await page.addScriptTag({content:await readFile('node_modules/axe-core/axe.min.js','utf8')});
 const audit=async state=>{await page.waitForTimeout(350);report.push({state,violations:await page.evaluate(async()=>(await axe.run('#polytropic-root',{runOnly:['color-contrast']})).violations.flatMap(v=>v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))))});};
 for(const button of await page.locator('.lab-preset').all()){await button.click();await audit(await button.innerText());}
 await page.screenshot({path:'outputs/polytropic-readable-desktop.png',fullPage:true,animations:'disabled'});
 await page.evaluate(()=>PraxisPolytropic.show('verificare'));
 for(let i=0;i<10;i++){await page.getByRole('radio').nth(i%4).click();await page.locator('.quiz-actions button').first().click();await audit('feedback '+i);await page.locator('.quiz-actions button').nth(1).click();}
 await audit('result');
 await page.evaluate(async()=>{await PraxisI18n.setLanguage('en');PraxisPolytropic.show('laborator');});
 await page.setViewportSize({width:390,height:844});await audit('mobile EN');
 await page.screenshot({path:'outputs/polytropic-readable-mobile.png',fullPage:true,animations:'disabled'});
}finally{await writeFile('outputs/polytropic-readability-states.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});}
console.log(JSON.stringify({cases:report.length,failures:report.filter(s=>s.violations.length)}));if(report.some(s=>s.violations.length))process.exitCode=1;
